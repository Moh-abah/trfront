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
        <div className="min-h-screen trading-dark-bg trading-dark-text-primary">
            {/* Header */}
            <header className="border-b trading-dark-border bg-background/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-primary to-primary/80 rounded-xl">
                                <Activity className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold trading-dark-text-primary">Markets</h1>
                                <p className="text-sm trading-dark-text-secondary">Real-time market data</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 trading-dark-bg-secondary rounded-lg border trading-dark-border">
                                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                <span className="text-sm trading-dark-text-primary">
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
                                <label className="text-sm font-medium trading-dark-text-secondary">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 trading-dark-text-secondary" />
                                    <Input
                                        placeholder="Search symbols..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 trading-input-dark placeholder:trading-dark-text-secondary"
                                    />
                                    {searchQuery && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 trading-dark-text-secondary hover:trading-dark-text-primary"
                                            onClick={() => setSearchQuery('')}
                                        >
                                            <X className="w-3 h-3" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Quick Filters */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium trading-dark-text-secondary">Quick Filters</label>
                                <div className="space-y-2">
                                    <Button
                                        variant={quickFilter === 'gainers' ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => { setQuickFilter('gainers'); setSortBy('change24h'); setSortOrder('desc'); }}
                                        className={`w-full justify-start transition-all ${quickFilter === 'gainers'
                                            ? 'bg-primary hover:bg-primary/90 text-primary-foreground border-primary'
                                            : 'trading-dark-border trading-dark-bg-secondary trading-dark-text-secondary hover:trading-dark-accent hover:border-primary/50'}`}
                                    >
                                        <TrendingUp className="w-4 h-4 mr-2" />
                                        Top Gainers
                                    </Button>
                                    <Button
                                        variant={quickFilter === 'losers' ? "destructive" : "outline"}
                                        size="sm"
                                        onClick={() => { setQuickFilter('losers'); setSortBy('change24h'); setSortOrder('asc'); }}
                                        className={`w-full justify-start transition-all ${quickFilter === 'losers'
                                            ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground border-destructive'
                                            : 'trading-dark-border trading-dark-bg-secondary trading-dark-text-secondary hover:text-destructive hover:border-destructive/50'}`}
                                    >
                                        <TrendingDown className="w-4 h-4 mr-2" />
                                        Top Losers
                                    </Button>
                                    <Button
                                        variant={quickFilter === 'high-volume' ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => { setQuickFilter('high-volume'); setSortBy('volume'); setSortOrder('desc'); }}
                                        className={`w-full justify-start transition-all ${quickFilter === 'high-volume'
                                            ? 'bg-primary hover:bg-primary/90 text-primary-foreground border-primary'
                                            : 'trading-dark-border trading-dark-bg-secondary trading-dark-text-secondary hover:trading-dark-accent hover:border-primary/50'}`}
                                    >
                                        <Activity className="w-4 h-4 mr-2" />
                                        High Volume
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => { setQuickFilter('all'); setSearchQuery(''); }}
                                        className="w-full justify-start trading-dark-border trading-dark-bg-secondary trading-dark-text-secondary hover:trading-dark-text-primary"
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
                                className="w-full trading-dark-border trading-dark-bg-secondary trading-dark-text-primary hover:trading-dark-text-primary"
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
                                    <Card className="trading-card-dark animate-scale-in">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs trading-dark-text-secondary mb-1">24h Volume</p>
                                                    <p className="text-lg font-bold trading-dark-text-primary">
                                                        {formatNumber(marketSummary.totalVolume)}
                                                    </p>
                                                </div>
                                                <div className="p-2 bg-primary/10 rounded-lg">
                                                    <Activity className="w-5 h-5 text-primary" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="trading-card-dark animate-scale-in" style={{ animationDelay: '0.05s' }}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs trading-dark-text-secondary mb-1">Total Assets</p>
                                                    <p className="text-lg font-bold trading-dark-text-primary">
                                                        {marketSummary.total}
                                                    </p>
                                                </div>
                                                <div className="p-2 bg-muted/50 rounded-lg">
                                                    <PieChart className="w-5 h-5 text-muted-foreground" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="trading-card-dark animate-scale-in" style={{ animationDelay: '0.1s' }}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs trading-dark-text-secondary mb-1">Gainers</p>
                                                    <p className="text-lg font-bold text-primary">
                                                        {marketSummary.gainers}
                                                    </p>
                                                </div>
                                                <div className="p-2 bg-primary/10 rounded-lg">
                                                    <TrendingUp className="w-5 h-5 text-primary" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="trading-card-dark animate-scale-in" style={{ animationDelay: '0.15s' }}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs trading-dark-text-secondary mb-1">Losers</p>
                                                    <p className="text-lg font-bold text-destructive">
                                                        {marketSummary.losers}
                                                    </p>
                                                </div>
                                                <div className="p-2 bg-destructive/10 rounded-lg">
                                                    <TrendingDown className="w-5 h-5 text-destructive" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Market Table */}
                            <Card className="trading-card-dark overflow-hidden">
                                <CardHeader className="pb-4 border-b trading-dark-border">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <CardTitle className="trading-dark-text-primary">
                                            Cryptocurrency Market
                                        </CardTitle>
                                        <div className="flex gap-2">
                                            {/* Manual Sort Controls in Header */}
                                            <div className="flex trading-dark-bg-tertiary rounded-lg p-1 border trading-dark-border">
                                                {[
                                                    { id: 'volume', label: 'Volume' },
                                                    { id: 'change24h', label: 'Change' },
                                                    { id: 'price', label: 'Price' }
                                                ].map((col) => (
                                                    <button
                                                        key={col.id}
                                                        onClick={() => handleSort(col.id as any)}
                                                        className={`px-3 py-1 text-xs rounded-md font-medium transition-all touch-target ${sortBy === col.id
                                                            ? 'trading-dark-bg-secondary trading-dark-text-primary shadow-sm'
                                                            : 'trading-dark-text-secondary hover:trading-dark-text-primary'}`}
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
                                    <ScrollArea className="h-[600px] custom-scrollbar">
                                        <div className="w-full">
                                            {/* Table Header */}
                                            <div className="grid grid-cols-12 gap-4 px-4 py-3 trading-dark-bg-tertiary border-b trading-dark-border text-xs font-medium trading-dark-text-secondary sticky top-0 z-10">
                                                <div className="col-span-3">Symbol</div>
                                                <div className="col-span-3 text-right cursor-pointer hover:trading-dark-text-primary transition-colors" onClick={() => handleSort('price')}>Price</div>
                                                <div className="col-span-3 text-right cursor-pointer hover:trading-dark-text-primary transition-colors" onClick={() => handleSort('change24h')}>24h %</div>
                                                <div className="col-span-3 text-right cursor-pointer hover:trading-dark-text-primary transition-colors" onClick={() => handleSort('volume')}>Volume</div>
                                            </div>

                                            {/* Table Body */}
                                            <div>
                                                {markets.length === 0 ? (
                                                    <PremiumSkeletonLoader />
                                                ) : finalData.length === 0 && !isLoading ? (
                                                    <div className="p-12 text-center">
                                                        <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                                                        <p className="text-muted-foreground mb-2">No results found</p>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => { setSearchQuery(''); setQuickFilter('all'); }}
                                                            className="border-border text-muted-foreground"
                                                        >
                                                            Clear filters
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    finalData.map((item, index) => (
                                                        <div
                                                            key={item.symbol}
                                                            onClick={() => router.push(`/chart/${item.symbol}?market=${activeTab}`)}
                                                            className="grid grid-cols-12 gap-4 px-4 py-4 border-b trading-dark-border/50 hover:trading-dark-bg-secondary/50 cursor-pointer transition-all duration-200 group animate-slide-in touch-target"
                                                            style={{ animationDelay: `${index * 0.02}s` }}
                                                        >
                                                            <div className="col-span-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-muted to-card flex items-center justify-center text-xs font-bold trading-dark-text-primary ring-1 trading-dark-border">
                                                                        {item.symbol.slice(0, 2)}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium trading-dark-text-primary group-hover:text-primary transition-colors">
                                                                            {item.symbol}
                                                                        </p>
                                                                        <p className="text-xs trading-dark-text-secondary">
                                                                            Vol: {formatNumber(item.volume)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="col-span-3 text-right">
                                                                <p className="font-mono font-medium trading-dark-text-primary text-sm">
                                                                    {formatPrice(item.price)}
                                                                </p>
                                                            </div>

                                                            <div className="col-span-3 text-right">
                                                                <Badge
                                                                    variant={item.change24h >= 0 ? "default" : "destructive"}
                                                                    className={`px-2 py-1 font-mono transition-all ${item.change24h >= 0
                                                                        ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
                                                                        : 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20'
                                                                        }`}
                                                                >
                                                                    {formatPercent(item.change24h)}
                                                                </Badge>
                                                            </div>

                                                            <div className="col-span-3 text-right">
                                                                <p className="text-sm trading-dark-text-primary/80 font-mono">
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
                            <div className="text-center text-sm trading-dark-text-secondary animate-pulse-subtle">
                                <div className="flex items-center justify-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                    Last updated: {lastUpdated.toLocaleTimeString()} • Connected via WebSocket
                                </div>
                            </div>
                        </div>
                    </div>
                </Tabs>
            </main>
        </div>
    )
}
