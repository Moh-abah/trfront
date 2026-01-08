'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
    Search,
    TrendingUp,
    TrendingDown,
    Zap,
    BarChart3,
    RefreshCw,
    Activity,
    PieChart,
    ArrowUpDown,
    X
} from 'lucide-react'
import { Button } from '@/components/uiadv/button'
import { Input } from '@/components/uiadv/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/uiadv/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/uiadv/card'
import { Badge } from '@/components/uiadv/badge'
import { ScrollArea } from '@/components/uiadv/scroll-area'
import { useMarketOverviewStore } from '@/stores/market-overview.store'
import { marketOverviewService } from '@/services/api/market-overview.service'
import { MarketData } from '@/services/api/market-overview.service'
import { PremiumSkeletonLoader } from '../loding'

// Helper function to format numbers (TradingView style)
const formatNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
    return `$${num.toFixed(2)}`
}

// Helper function to format prices accurately
const formatPrice = (price: number) => {
    if (price === 0) return "0.00";
    if (price < 0.001) return price.toFixed(8);
    if (price < 0.01) return price.toFixed(5);
    if (price < 1) return price.toFixed(3);
    return price.toFixed(2);
}

const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(2)}%`
}

export default function MarketsPage() {
    const router = useRouter()

    // Local States for UI Interaction (Search, Sorting)
    const [activeTab, setActiveTab] = useState<'crypto' | 'stocks'>('crypto') // For future expansion
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState<'volume' | 'change24h' | 'price'>('volume')
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
    const [quickFilter, setQuickFilter] = useState<'all' | 'gainers' | 'losers' | 'high-volume'>('all')
    const [isExporting, setIsExporting] = useState(false)
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

    // --- Data Source Integration (Using the Stable Store) ---
    const markets = useMarketOverviewStore((state) => state.markets)
    const isLoading = useMarketOverviewStore((state) => state.isLoading)
    const isConnected = useMarketOverviewStore((state) => state.isConnected)
    const setMarkets = useMarketOverviewStore((state) => state.setMarkets)
    const setLoading = useMarketOverviewStore((state) => state.setLoading)
    const setConnected = useMarketOverviewStore((state) => state.setConnected)

    // Initialize WebSocket Connection (Same logic as Dropdown but for Page)
    useEffect(() => {
        console.log("[MarketsPage] Connecting to WebSocket...");
        setLoading(true);

        marketOverviewService.connect({
            onConnected: () => {
                console.log("[MarketsPage] WebSocket connected");
                setConnected(true);
                setLoading(false);
            },
            onMessage: (data: MarketData[]) => {
                console.log("[MarketsPage] Received market data:", data.length);
                setMarkets(data);
                setLoading(false);
                setLastUpdated(new Date());
            },
            onDisconnected: () => {
                console.log("[MarketsPage] WebSocket disconnected");
                setConnected(false);
            },
            onError: (error) => {
                console.error("[MarketsPage] WebSocket error:", error);
                setConnected(false);
                setLoading(false);
            },
        });

        return () => {
            console.log("[MarketsPage] Cleanup, disconnecting WebSocket");
            marketOverviewService.disconnect();
        };
    }, [setMarkets, setLoading, setConnected]);

    // --- Filtering & Sorting Logic ---

    // 1. Search Filter
    const searchFiltered = useMemo(() => {
        if (!searchQuery) return markets;
        return markets.filter(m => m.symbol.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [markets, searchQuery]);

    // 2. Quick Filters (Gainers/Losers/Volume)
    const quickFiltered = useMemo(() => {
        if (quickFilter === 'all') return searchFiltered;

        if (quickFilter === 'gainers') {
            return searchFiltered.filter(m => m.change24h > 0).sort((a, b) => b.change24h - a.change24h);
        }
        if (quickFilter === 'losers') {
            return searchFiltered.filter(m => m.change24h < 0).sort((a, b) => a.change24h - b.change24h);
        }
        if (quickFilter === 'high-volume') {
            // Sort by volume descending regardless of other sort state
            return [...searchFiltered].sort((a, b) => b.volume - a.volume);
        }
        return searchFiltered;
    }, [searchFiltered, quickFilter]);

    // 3. General Sorting
    const finalData = useMemo(() => {
        // If a specific quick filter (not 'all') is active, it already sorted the data (for gainers/losers)
        // But for manual sorting controls to work, we apply them here unless quickFilter overrides
        let data = [...quickFiltered];

        // Allow manual sorting override only if quickFilter is 'all' or 'high-volume' (which just filters but could be resorted)
        // For Gainers/Losers, we usually want to keep the sort by change, but let's allow manual sort if user insists.

        if (quickFilter !== 'gainers' && quickFilter !== 'losers') {
            data.sort((a, b) => {
                let comparison = 0;
                if (sortBy === 'price') comparison = a.price - b.price;
                else if (sortBy === 'change24h') comparison = a.change24h - b.change24h;
                else if (sortBy === 'volume') comparison = a.volume - b.volume;

                return sortOrder === 'asc' ? comparison : -comparison;
            });
        }

        return data;
    }, [quickFiltered, sortBy, sortOrder, quickFilter]);

    // --- Calculations ---

    const marketSummary = useMemo(() => {
        if (finalData.length === 0) return null;

        const totalVolume = finalData.reduce((sum, m) => sum + m.volume, 0);
        // Assuming Market Cap isn't in the raw socket data provided, we might omit it or estimate 
        // based on price * volume if needed. For now, let's focus on available data.
        const gainers = finalData.filter(m => m.change24h > 0).length;
        const losers = finalData.filter(m => m.change24h < 0).length;

        return {
            totalVolume,
            gainers,
            losers,
            total: finalData.length
        };
    }, [finalData]);

    // --- Handlers ---

    const handleSort = (field: 'price' | 'change24h' | 'volume') => {
        if (sortBy === field) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc'); // Default new sort to desc
        }
        setQuickFilter('all'); // Reset quick filter when manually sorting
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const data = finalData.map(item => ({
                symbol: item.symbol,
                price: item.price,
                change: item.change24h,
                volume: item.volume
            }));

            const csv = [
                ['Symbol', 'Price', '24h Change %', '24h Volume'],
                ...data.map(item => [
                    item.symbol,
                    item.price.toString(),
                    item.change.toString(),
                    item.volume.toString()
                ])
            ].join('\n');

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `market_data_${Date.now()}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-slate-200">
            {/* Header */}
            <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Markets</h1>
                                <p className="text-sm text-slate-400">Real-time market data</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700">
                                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                <span className="text-sm text-slate-300">
                                    {isConnected ? 'Live' : 'Offline'}
                                </span>
                            </div>
                            {/* Manual Refresh could be added here if needed, but WS is auto */}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6">
                {/* Market Tabs */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Sidebar Controls */}
                        <div className="lg:w-80 flex-shrink-0 space-y-4">
                            {/* Search */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <Input
                                        placeholder="Search symbols..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                                    />
                                    {searchQuery && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-slate-500 hover:text-white"
                                            onClick={() => setSearchQuery('')}
                                        >
                                            <X className="w-3 h-3" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Quick Filters */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Quick Filters</label>
                                <div className="space-y-2">
                                    <Button
                                        variant={quickFilter === 'gainers' ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => { setQuickFilter('gainers'); setSortBy('change24h'); setSortOrder('desc'); }}
                                        className={`w-full justify-start transition-colors ${quickFilter === 'gainers' ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600' : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-400'}`}
                                    >
                                        <TrendingUp className="w-4 h-4 mr-2" />
                                        Top Gainers
                                    </Button>
                                    <Button
                                        variant={quickFilter === 'losers' ? "destructive" : "outline"}
                                        size="sm"
                                        onClick={() => { setQuickFilter('losers'); setSortBy('change24h'); setSortOrder('asc'); }}
                                        className={`w-full justify-start transition-colors ${quickFilter === 'losers' ? 'bg-red-600 hover:bg-red-700 text-white border-red-600' : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:bg-red-500/10 hover:text-red-400'}`}
                                    >
                                        <TrendingDown className="w-4 h-4 mr-2" />
                                        Top Losers
                                    </Button>
                                    <Button
                                        variant={quickFilter === 'high-volume' ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => { setQuickFilter('high-volume'); setSortBy('volume'); setSortOrder('desc'); }}
                                        className={`w-full justify-start transition-colors ${quickFilter === 'high-volume' ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600' : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:bg-blue-500/10 hover:text-blue-400'}`}
                                    >
                                        <Activity className="w-4 h-4 mr-2" />
                                        High Volume
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => { setQuickFilter('all'); setSearchQuery(''); }}
                                        className="w-full justify-start border-slate-700 bg-slate-800/50 text-slate-400 hover:bg-slate-700"
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Clear Filters
                                    </Button>
                                </div>
                            </div>

                            {/* Export */}
                            <Button
                                variant="outline"
                                onClick={handleExport}
                                disabled={isExporting || finalData.length === 0}
                                className="w-full border-slate-700 bg-slate-800/50 text-white hover:bg-slate-700"
                            >
                                {isExporting ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        Exporting...
                                    </>
                                ) : (
                                    'Export CSV'
                                )}
                            </Button>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 space-y-4">
                            {/* Market Summary Cards */}
                            {marketSummary && (
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                    <Card className="bg-slate-800/50 border-slate-700">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-slate-400 mb-1">24h Volume</p>
                                                    <p className="text-lg font-bold text-white">
                                                        {formatNumber(marketSummary.totalVolume)}
                                                    </p>
                                                </div>
                                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                                    <Activity className="w-5 h-5 text-blue-500" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-slate-800/50 border-slate-700">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-slate-400 mb-1">Total Assets</p>
                                                    <p className="text-lg font-bold text-white">
                                                        {marketSummary.total}
                                                    </p>
                                                </div>
                                                <div className="p-2 bg-slate-500/10 rounded-lg">
                                                    <PieChart className="w-5 h-5 text-slate-400" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-slate-800/50 border-slate-700">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-slate-400 mb-1">Gainers</p>
                                                    <p className="text-lg font-bold text-emerald-400">
                                                        {marketSummary.gainers}
                                                    </p>
                                                </div>
                                                <div className="p-2 bg-emerald-500/10 rounded-lg">
                                                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-slate-800/50 border-slate-700">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-slate-400 mb-1">Losers</p>
                                                    <p className="text-lg font-bold text-red-400">
                                                        {marketSummary.losers}
                                                    </p>
                                                </div>
                                                <div className="p-2 bg-red-500/10 rounded-lg">
                                                    <TrendingDown className="w-5 h-5 text-red-500" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Market Table */}
                            <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-white">
                                            Cryptocurrency Market
                                        </CardTitle>
                                        <div className="flex gap-2">
                                            {/* Manual Sort Controls in Header */}
                                            <div className="flex bg-slate-900/50 rounded-lg p-1 border border-slate-700">
                                                {[
                                                    { id: 'volume', label: 'Volume' },
                                                    { id: 'change24h', label: 'Change' },
                                                    { id: 'price', label: 'Price' }
                                                ].map((col) => (
                                                    <button
                                                        key={col.id}
                                                        onClick={() => handleSort(col.id as any)}
                                                        className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${sortBy === col.id ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                                    >
                                                        {col.label}
                                                        {sortBy === col.id && (
                                                            <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <ScrollArea className="h-[600px]">
                                        <div className="w-full">
                                            {/* Table Header */}
                                            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-slate-900/50 border-b border-slate-700 text-xs font-medium text-slate-400">
                                                <div className="col-span-3">Symbol</div>
                                                <div className="col-span-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('price')}>Price</div>
                                                <div className="col-span-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('change24h')}>24h %</div>
                                                <div className="col-span-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('volume')}>Volume</div>
                                            </div>

                                            {/* Table Body */}
                                            {/* Table Body */}
                                            <div>
                                                {markets.length === 0 ? (  
                                                    <PremiumSkeletonLoader />

                                                ) : finalData.length === 0 && !isLoading ? (
                                                    <div className="p-12 text-center">
                                                        <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                                        <p className="text-slate-400 mb-2">No results found</p>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => { setSearchQuery(''); setQuickFilter('all'); }}
                                                            className="border-slate-700 text-slate-400"
                                                        >
                                                            Clear filters
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    finalData.map((item, index) => (
                                                        // ... leave all the existing rows code exactly as is
                                                        <div
                                                            key={item.symbol}
                                                            onClick={() => router.push(`/chart/${item.symbol}?market=${activeTab}`)}
                                                            className="grid grid-cols-12 gap-4 px-4 py-4 border-b border-slate-700/50 hover:bg-slate-700/30 cursor-pointer transition-colors group"
                                                        >
                                                            <div className="col-span-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xs font-bold text-white">
                                                                        {item.symbol.slice(0, 2)}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium text-white group-hover:text-emerald-400 transition-colors">
                                                                            {item.symbol}
                                                                        </p>
                                                                        <p className="text-xs text-slate-500">
                                                                            Vol: {formatNumber(item.volume)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="col-span-3 text-right">
                                                                <p className="font-mono font-medium text-white text-sm">
                                                                    {formatPrice(item.price)}
                                                                </p>
                                                            </div>

                                                            <div className="col-span-3 text-right">
                                                                <Badge
                                                                    variant={item.change24h >= 0 ? "default" : "destructive"}
                                                                    className={`px-2 py-1 font-mono ${item.change24h >= 0
                                                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                                                        : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                                                                        }`}
                                                                >
                                                                    {formatPercent(item.change24h)}
                                                                </Badge>
                                                            </div>

                                                            <div className="col-span-3 text-right">
                                                                <p className="text-sm text-slate-300 font-mono">
                                                                    {formatNumber(item.volume)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>

                            {/* Last Updated */}
                            <div className="text-center text-sm text-slate-500">
                                Last updated: {lastUpdated.toLocaleTimeString()} • Connected via WebSocket
                            </div>
                        </div>
                    </div>
                </Tabs>
            </main>
        </div>
    )
}