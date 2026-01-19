// @ts-nocheck

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Bell,
    Filter,
    Download,
    AlertCircle,
    TrendingUp,
    TrendingDown,
    Clock,
    RefreshCw,
    Eye,
    EyeOff,
    BarChart3,
    Mail,
    BellOff,
    Plus
} from 'lucide-react';
import { useSignalStore } from '../../stores/signals.store';
import { useSettingsStore } from '../../stores/settings.store';

import { SignalsTable, type Signal as TableSignal } from '../../components/data/tables/SignalsTable';

import { SearchBar } from '../../components/filters/SearchBar';
import { Button } from '../../components/ui/Button/Button';
import { Tabs } from '../../components/ui/Tabs/Tabs';
import { Loader } from '../../components/ui/Loader/Loader';
import { Modal } from '../../components/ui/Modal/Modal';
import { SignalDetails } from '../../components/signals/SignalDetails';
import { AlertSettings } from '../../components/signals/AlertSettings';
import { SignalGenerator } from '../../components/signals/SignalGenerator';
import { DateFormatter } from '../../utils/formatters/date.formatter';
import { PriceFormatter } from '../../utils/formatters/price.formatter';
import Alert from '@/components/ui/Alert/Alert';

type SignalFilter = 'all' | 'buy' | 'sell' | 'active' | 'expired';
type SignalStrength = 'all' | 'strong' | 'moderate' | 'weak';

interface TradingSignal {
    id: string;
    symbol: string;
    type: 'buy' | 'sell' | 'neutral';
    strength?: string;
    price: number;
    target?: number;
    stopLoss?: number;
    timestamp: string;
    strategy?: string;
    confidence?: number;
    status?: string;
    read?: boolean;
    profitLoss?: number;
}

export default function SignalsClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const signalId = searchParams.get('signal');

    const [activeTab, setActiveTab] = useState<SignalFilter>('all');
    const [strengthFilter, setStrengthFilter] = useState<SignalStrength>('all');
    const [timeFilter, setTimeFilter] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
    const [searchQuery, setSearchQuery] = useState('');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showAlertSettings, setShowAlertSettings] = useState(false);
    const [showGeneratorModal, setShowGeneratorModal] = useState(false);
    const [selectedSignal, setSelectedSignal] = useState<any>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const {
        signals,
        activeSignals,
        signalStats,
        isLoading,
        error,
        loadSignals,
        loadSignalDetails,
        markSignalAsRead,
        archiveSignal,
        deleteSignal,
        refreshSignals,
        getAvailableIndicators
    } = useSignalStore();

    const { settings, updateSettings } = useSettingsStore();

    // استخدام settings.notifications مباشرة
    const notificationSettings = settings.notifications || {
        email: true,
        push: true,
        sound: true,
        priceAlerts: true,
        indicatorAlerts: true
    };

    const updateNotificationSettings = useCallback((newSettings: any) => {
        updateSettings({
            notifications: newSettings
        });
    }, [updateSettings]);

    // Default signal request configuration
    const defaultSignalRequest = {
        symbol: 'BTCUSD',
        timeframe: '1h',
        market: 'crypto' as const,
        indicators: [
            {
                name: 'rsi',
                params: { period: 14, overbought: 70, oversold: 30 },
                enabled: true
            },
            {
                name: 'macd',
                params: { fast: 12, slow: 26, signal: 9 },
                enabled: true
            }
        ],
        days: 30
    };

    useEffect(() => {
        initializeSignals();
    }, []);

    useEffect(() => {
        if (signalId) {
            handleSignalClick(signalId);
        }
    }, [signalId]);

    const initializeSignals = async () => {
        await loadSignals(defaultSignalRequest);
        setLastUpdated(new Date());
    };

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

    const handleSignalClick = async (signalId: string) => {
        const signal = await loadSignalDetails(signalId);
        if (signal) {
            setSelectedSignal(signal);
            setShowDetailsModal(true);
            await markSignalAsRead(signalId);
        }
    };

    const handleArchiveAll = async () => {
        if (confirm('Archive all read signals?')) {
            const readSignals = signals.filter(s => s.read);
            for (const signal of readSignals) {
                await archiveSignal(signal.id);
            }
        }
    };

    const handleExport = useCallback(async () => {
        setIsExporting(true);
        try {
            const filteredSignals = getFilteredSignals();

            const csv = [
                ['Time', 'Symbol', 'Type', 'Strength', 'Strategy', 'Price', 'Target', 'Stop Loss', 'Profit/Loss'],
                ...filteredSignals.map(signal => [
                    DateFormatter.formatDate(signal.timestamp, { showTime: true }),
                    signal.symbol,
                    signal.type.toUpperCase(),
                    signal.strength,
                    signal.strategy,
                    PriceFormatter.format(signal.price),
                    signal.target ? PriceFormatter.format(signal.target) : '',
                    signal.stopLoss ? PriceFormatter.format(signal.stopLoss) : '',
                    signal.profitLoss ? PriceFormatter.format(signal.profitLoss) : '0'
                ])
            ].map(row => row.join(',')).join('\n');

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `trading_signals_${DateFormatter.formatDate(new Date(), { format: 'short' })}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    }, [signals, activeTab, strengthFilter, searchQuery, timeFilter]);

    const handleRefresh = async () => {
        await refreshSignals(defaultSignalRequest);
        setLastUpdated(new Date());
    };

    const handleGenerateSignals = async (config: any) => {
        const request = {
            symbol: config.symbol,
            timeframe: config.timeframe,
            market: 'crypto',
            indicators: config.indicators,
            days: config.days || 7,
        };

        await loadSignals(request);
        setShowGeneratorModal(false);
    };

    const getFilteredSignals = () => {
        return signals.filter(signal => {
            // فلترة حسب البحث
            if (searchQuery && !signal.symbol.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }

            // فلترة حسب النوع
            if (activeTab !== 'all') {
                if (activeTab === 'active' && signal.status !== 'active') return false;
                if (activeTab === 'expired' && signal.status !== 'expired') return false;
                if (activeTab === 'buy' && signal.type !== 'buy') return false;
                if (activeTab === 'sell' && signal.type !== 'sell') return false;
            }

            // فلترة حسب القوة
            if (strengthFilter !== 'all' && signal.strength !== strengthFilter) {
                return false;
            }

            // فلترة حسب الوقت
            if (timeFilter) {
                const signalDate = new Date(signal.timestamp);
                const now = new Date();
                let hoursAgo = 24;

                switch (timeFilter) {
                    case '1h': hoursAgo = 1; break;
                    case '7d': hoursAgo = 168; break;
                    case '30d': hoursAgo = 720; break;
                }

                const timeDiff = (now.getTime() - signalDate.getTime()) / (1000 * 60 * 60);
                if (timeDiff > hoursAgo) return false;
            }

            return true;
        });
    };

    // في الصفحة الرئيسية
    const convertTradingSignalsToTableSignals = (tradingSignals: TradingSignal[]): TableSignal[] => {
        return tradingSignals.map(signal => ({
            id: signal.id,
            symbol: signal.symbol,
            type: signal.type.toUpperCase() as 'BUY' | 'SELL' | 'NEUTRAL',
            signal: signal.type.toUpperCase() as 'BUY' | 'SELL' | 'NEUTRAL',
            strength: typeof signal.strength === 'string' ? 5 : (signal.strength || 5),
            price: signal.price,
            target: signal.target || 0,
            stopLoss: signal.stopLoss || 0,
            timestamp: signal.timestamp,
            strategy: signal.strategy || 'Unknown',
            confidence: signal.confidence || 50
        }));
    };

    const filteredSignals = getFilteredSignals();
    const tableSignals = convertTradingSignalsToTableSignals(filteredSignals);

    return (
        <div className="min-h-screen bg-background">
            <div className="p-4 md:p-6">
                {/* Error Alert */}
                {error && (
                    <Alert
                        type="error"
                        title="Error"
                        message={error}
                        onClose={() => { }}
                        className="mb-4"
                    />
                )}

                {/* Header */}
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                                Trading Signals
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Real-time trading signals and alerts • {signalStats.total} total signals
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Updated {DateFormatter.formatRelative(lastUpdated)}</span>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRefresh}
                                isLoading={isLoading}
                                leftIcon={<RefreshCw className="w-4 h-4" />}
                            >
                                Refresh
                            </Button>

                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setShowGeneratorModal(true)}
                                leftIcon={<Plus className="w-4 h-4" />}
                            >
                                Generate Signals
                            </Button>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="p-3 bg-card border border-green-200 dark:border-green-800 rounded-lg">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                                <div className="text-sm text-green-700 dark:text-green-300">Buy Signals</div>
                            </div>
                            <div className="text-lg font-semibold text-foreground">
                                {signalStats.buy}
                            </div>
                        </div>

                        <div className="p-3 bg-card border border-red-200 dark:border-red-800 rounded-lg">
                            <div className="flex items-center gap-2">
                                <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                                <div className="text-sm text-red-700 dark:text-red-300">Sell Signals</div>
                            </div>
                            <div className="text-lg font-semibold text-foreground">
                                {signalStats.sell}
                            </div>
                        </div>

                        <div className="p-3 bg-card border border-blue-200 dark:border-blue-800 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <div className="text-sm text-blue-700 dark:text-blue-300">Active</div>
                            </div>
                            <div className="text-lg font-semibold text-foreground">
                                {signalStats.active}
                            </div>
                        </div>

                        <div className="p-3 bg-card border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                <div className="text-sm text-yellow-700 dark:text-yellow-300">Win Rate</div>
                            </div>
                            <div className="text-lg font-semibold text-foreground">
                                {signalStats.winRate.toFixed(1)}%
                            </div>
                        </div>
                    </div>

                    {/* Filter Toolbar */}
                    <div className="mb-6 p-4 bg-card rounded-xl shadow-lg border border-border">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Left Section: Search and Filters */}
                            <div className="flex-1">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="md:col-span-2">
                                        <SearchBar
                                            placeholder="Search signals by symbol or strategy..."
                                            onSearch={handleSearch}
                                            delay={300}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowAlertSettings(true)}
                                            leftIcon={<Bell className="w-4 h-4" />}
                                        >
                                            Alerts
                                        </Button>
                                    </div>
                                </div>

                                {/* Filter Tabs */}
                                {/* Filter Tabs */}
                                <div className="flex flex-wrap items-center gap-4 mt-4">
                                    {/* Signal Type Tabs */}
                                    <div className="flex items-center border border-border rounded-lg p-1 bg-card">
                                        <Tabs
                                            value={activeTab}
                                            onChange={(value) => setActiveTab(value as SignalFilter)}
                                            tabs={[
                                                {
                                                    value: 'all',
                                                    label: 'All Signals',
                                                    icon: <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                                                },
                                                {
                                                    value: 'buy',
                                                    label: 'Buy',
                                                    icon: <TrendingUp className="w-4 h-4 text-green-600" />
                                                },
                                                {
                                                    value: 'sell',
                                                    label: 'Sell',
                                                    icon: <TrendingDown className="w-4 h-4 text-red-600" />
                                                },
                                                {
                                                    value: 'active',
                                                    label: 'Active',
                                                    icon: <div className="w-2 h-2 rounded-full bg-primary" />
                                                },
                                                {
                                                    value: 'expired',
                                                    label: 'Expired',
                                                    icon: <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                                                }
                                            ]}
                                        />
                                    </div>

                                    {/* Strength Filter */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground font-medium">Strength:</span>
                                        <div className="relative">
                                            <select
                                                value={strengthFilter}
                                                onChange={(e) => setStrengthFilter(e.target.value as SignalStrength)}
                                                className="px-3 py-1.5 text-sm border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring pr-8 appearance-none cursor-pointer min-w-[120px] hover:border-input-hover transition-colors"
                                            >
                                                <option value="all" className="bg-background text-foreground">All Strengths</option>
                                                <option value="strong" className="bg-background text-green-600">Strong</option>
                                                <option value="moderate" className="bg-background text-yellow-600">Moderate</option>
                                                <option value="weak" className="bg-background text-red-600">Weak</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Time Filter */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground font-medium">Time:</span>
                                        <div className="relative">
                                            <select
                                                value={timeFilter}
                                                onChange={(e) => setTimeFilter(e.target.value as any)}
                                                className="px-3 py-1.5 text-sm border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring pr-8 appearance-none cursor-pointer min-w-[140px] hover:border-input-hover transition-colors"
                                            >
                                                <option value="1h" className="bg-background text-foreground">Last Hour</option>
                                                <option value="24h" className="bg-background text-foreground">Last 24 Hours</option>
                                                <option value="7d" className="bg-background text-foreground">Last 7 Days</option>
                                                <option value="30d" className="bg-background text-foreground">Last 30 Days</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Section: Actions */}
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleExport}
                                    isLoading={isExporting}
                                    leftIcon={<Download className="w-4 h-4" />}
                                >
                                    Export
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleArchiveAll}
                                    leftIcon={<EyeOff className="w-4 h-4" />}
                                >
                                    Archive Read
                                </Button>
                            </div>
                        </div>

                        {/* Active Filter Status */}
                        {(activeTab !== 'all' || strengthFilter !== 'all' || searchQuery) && (
                            <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Filter className="w-4 h-4 text-primary" />
                                        <span className="text-sm text-primary">
                                            Showing {filteredSignals.length} of {signals.length} signals
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setActiveTab('all');
                                            setStrengthFilter('all');
                                            setSearchQuery('');
                                        }}
                                        className="text-primary"
                                    >
                                        Clear Filters
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Table */}
                <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
                    <div className="p-4 border-b border-border">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-foreground">
                                Signal History
                            </h2>
                            <div className="text-sm text-muted-foreground">
                                {activeSignals.length} active signals
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="p-8">
                                <Loader text="Loading signals..." />
                            </div>
                        ) : filteredSignals.length === 0 ? (
                            <div className="p-8 text-center">
                                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                <h3 className="font-medium text-foreground mb-1">
                                    No signals found
                                </h3>
                                <p className="text-muted-foreground">
                                    {searchQuery ? 'Try adjusting your search or filters' : 'Generate signals to get started'}
                                </p>
                            </div>
                        ) : (
                            <SignalsTable
                                signals={tableSignals}
                                onSignalClick={handleSignalClick}
                                onArchive={archiveSignal}
                                onDelete={deleteSignal}
                            />
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => router.push('/backtest')}
                        leftIcon={<BarChart3 className="w-4 h-4" />}
                    >
                        Test Signal Strategies
                    </Button>

                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowAlertSettings(true)}
                        leftIcon={notificationSettings.email ? <Mail className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                    >
                        {notificationSettings.email ? 'Email Alerts: ON' : 'Email Alerts: OFF'}
                    </Button>

                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => router.push('/settings?tab=notifications')}
                        leftIcon={<Bell className="w-4 h-4" />}
                    >
                        Notification Settings
                    </Button>
                </div>
            </div>

            {/* Signal Details Modal */}
            <Modal
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                title="Signal Details"
                size="lg"
            >
                {selectedSignal && (
                    <SignalDetails
                        signal={selectedSignal}
                        onClose={() => setShowDetailsModal(false)}
                        onTrade={() => {
                            router.push(`/chart/${selectedSignal.symbol}`);
                            setShowDetailsModal(false);
                        }}
                    />
                )}
            </Modal>

            {/* Alert Settings Modal */}
            <Modal
                isOpen={showAlertSettings}
                onClose={() => setShowAlertSettings(false)}
                title="Alert Settings"
                size="md"
            >
                <AlertSettings
                    settings={notificationSettings}
                    onChange={updateNotificationSettings}
                    onClose={() => setShowAlertSettings(false)}
                />
            </Modal>

            {/* Signal Generator Modal */}
            <Modal
                isOpen={showGeneratorModal}
                onClose={() => setShowGeneratorModal(false)}
                title="Generate Trading Signals"
                size="lg"
            >
                <SignalGenerator
                    onGenerate={handleGenerateSignals}
                    onClose={() => setShowGeneratorModal(false)}
                />
            </Modal>
        </div>
    );
}