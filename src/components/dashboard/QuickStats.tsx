
// @ts-nocheck

'use client';

import React, { useState } from 'react';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Percent,
    Clock,
    BarChart3,
    RefreshCw,
    Zap,
    Shield
} from 'lucide-react';
import { useMarketStore } from '../../stores/market.store';
import { useSignalStore } from '../../stores/signals.store';
import { Button } from '../ui/Button/Button';
import { NumberFormatter } from '../../utils/formatters/number.formatter';
import { DateFormatter } from '../../utils/formatters/date.formatter';

interface QuickStatsProps {
    market: 'crypto' | 'stocks';
}

export const QuickStats: React.FC<QuickStatsProps> = ({ market }) => {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const { topGainers, topLosers, volumeLeaders, loadMarketData } = useMarketStore();
    const { signalStats } = useSignalStore();

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await loadMarketData(market);
        } catch (error) {
            console.error('Failed to refresh stats:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const stats = [
        {
            title: 'Top Gainer',
            value: topGainers[0]?.symbol || 'N/A',
            change: topGainers[0]?.change24h || 0,
            icon: <TrendingUp className="w-5 h-5 text-green-500" />,
            color: 'green' as const,
            description: `${topGainers[0]?.change24h?.toFixed(2) || '0.00'}% today`
        },
        {
            title: 'Top Loser',
            value: topLosers[0]?.symbol || 'N/A',
            change: topLosers[0]?.change24h || 0,
            icon: <TrendingDown className="w-5 h-5 text-red-500" />,
            color: 'red' as const,
            description: `${topLosers[0]?.change24h?.toFixed(2) || '0.00'}% today`
        },
        {
            title: 'Highest Volume',
            value: volumeLeaders[0]?.symbol || 'N/A',
            change: volumeLeaders[0]?.volume24h || 0,
            icon: <BarChart3 className="w-5 h-5 text-blue-500" />,
            color: 'blue' as const,
            description: volumeLeaders[0]?.volume24h
                ? `${NumberFormatter.formatCompact(volumeLeaders[0].volume24h)} volume`
                : 'No data'
        },
        {
            title: 'Signal Accuracy',
            value: `${signalStats.winRate || '0.00'}%`,
            change: signalStats.avgReturn || 0,
            icon: <Percent className="w-5 h-5 text-purple-500" />,
            color: 'purple' as const,
            description: `${signalStats.totalSignals || 0} signals analyzed`
        },
        {
            title: 'Avg. Return',
            value: `${signalStats.avgReturn?.toFixed(2) || '0.00'}%`,
            change: signalStats.avgReturn || 0,
            icon: <DollarSign className="w-5 h-5 text-yellow-500" />,
            color: signalStats.avgReturn && signalStats.avgReturn >= 0 ? 'yellow' as const : 'red' as const,
            description: 'Per trade average'
        },
        {
            title: 'Market Hours',
            value: market === 'crypto' ? '24/7' : '9:30-16:00',
            icon: <Clock className="w-5 h-5 text-indigo-500" />,
            color: 'indigo' as const,
            description: market === 'crypto' ? 'Always open' : 'EST Trading Hours'
        }
    ];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Quick Stats
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Real-time market insights for {market === 'crypto' ? 'cryptocurrencies' : 'stocks'}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        Updated {DateFormatter.formatRelative(new Date())}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRefresh}
                        isLoading={isRefreshing}
                        icon={<RefreshCw className="w-4 h-4" />}
                    >
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className={`p-4 rounded-lg border ${stat.color === 'green'
                                ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                                : stat.color === 'red'
                                    ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                                    : stat.color === 'blue'
                                        ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
                                        : stat.color === 'purple'
                                            ? 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20'
                                            : stat.color === 'yellow'
                                                ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'
                                                : 'border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20'
                            }`}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${stat.color === 'green'
                                    ? 'bg-green-100 dark:bg-green-900'
                                    : stat.color === 'red'
                                        ? 'bg-red-100 dark:bg-red-900'
                                        : stat.color === 'blue'
                                            ? 'bg-blue-100 dark:bg-blue-900'
                                            : stat.color === 'purple'
                                                ? 'bg-purple-100 dark:bg-purple-900'
                                                : stat.color === 'yellow'
                                                    ? 'bg-yellow-100 dark:bg-yellow-900'
                                                    : 'bg-indigo-100 dark:bg-indigo-900'
                                }`}>
                                {stat.icon}
                            </div>
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {stat.title}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {stat.value}
                            </div>
                            {typeof stat.change === 'number' && (
                                <div className={`text-sm font-medium ${stat.change >= 0
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-red-600 dark:text-red-400'
                                    }`}>
                                    {stat.change >= 0 ? '+' : ''}{stat.change.toFixed(2)}%
                                </div>
                            )}
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {stat.description}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Market Status */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-300">
                            Market Status
                        </span>
                    </div>
                    <div className="mt-1 text-lg font-bold text-green-900 dark:text-green-200">
                        {market === 'crypto' ? 'Active' : 'Open'}
                    </div>
                </div>

                <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                            Bullish
                        </span>
                    </div>
                    <div className="mt-1 text-lg font-bold text-blue-900 dark:text-blue-200">
                        62%
                    </div>
                </div>

                <div className="p-3 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                            Bearish
                        </span>
                    </div>
                    <div className="mt-1 text-lg font-bold text-yellow-900 dark:text-yellow-200">
                        24%
                    </div>
                </div>

                <div className="p-3 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border border-gray-200 dark:border-gray-800 rounded-lg">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-300">
                            Risk Level
                        </span>
                    </div>
                    <div className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-200">
                        Medium
                    </div>
                </div>
            </div>
        </div>
    );
};