
// @ts-nocheck

'use client';

import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    BarChart3,
    Download,
    Filter,
    Calendar,
    Target
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
    Legend
} from 'recharts';
import { useBacktestStore } from '../../stores/backtest.store';
import { useSettingsStore } from '../../stores/settings.store';
import { Button } from '../ui/Button/Button';
import { DateFormatter } from '../../utils/formatters/date.formatter';
import { NumberFormatter } from '../../utils/formatters/number.formatter';
import { PriceFormatter } from '../../utils/formatters/price.formatter';

interface PerformanceChartProps {
    timeRange?: '1d' | '1w' | '1m' | '1y' | 'all';
    portfolioId?: string;
    showControls?: boolean;
    height?: number;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
    timeRange = '1m',
    portfolioId,
    showControls = true,
    height = 300
}) => {
    const [activeMetric, setActiveMetric] = useState<'equity' | 'returns' | 'drawdown'>('equity');
    const [isLoading, setIsLoading] = useState(false);
    const [chartData, setChartData] = useState<any[]>([]);

    const { portfolioPerformance, loadPortfolioPerformance } = useSettingsStore();

    // Generate sample data for demonstration
    useEffect(() => {
        generateChartData();
    }, [timeRange, activeMetric]);

    const generateChartData = () => {
        setIsLoading(true);

        // In a real app, this would come from the API
        const data = [];
        const now = new Date();
        let startDate: Date;

        switch (timeRange) {
            case '1d':
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case '1w':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '1m':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '1y':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        let equity = 10000;
        let maxEquity = equity;

        for (let i = 0; i < 30; i++) {
            const date = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));

            // Simulate random price movement
            const change = (Math.random() - 0.5) * 0.04; // -2% to +2%
            equity = equity * (1 + change);
            maxEquity = Math.max(maxEquity, equity);

            const drawdown = ((maxEquity - equity) / maxEquity) * 100;

            data.push({
                date: date.toISOString().split('T')[0],
                timestamp: date.getTime(),
                equity: Math.round(equity * 100) / 100,
                returns: Math.round((equity - 10000) / 10000 * 100 * 100) / 100,
                drawdown: Math.round(drawdown * 100) / 100,
                volume: Math.round(Math.random() * 1000000)
            });
        }

        setChartData(data);
        setIsLoading(false);
    };

    const getChartConfig = () => {
        switch (activeMetric) {
            case 'equity':
                return {
                    dataKey: 'equity',
                    name: 'Portfolio Equity',
                    color: '#3b82f6',
                    gradientColor: 'rgba(59, 130, 246, 0.1)',
                    formatter: (value: number) => PriceFormatter.formatPrice(value),
                    domain: ['auto', 'auto']
                };
            case 'returns':
                return {
                    dataKey: 'returns',
                    name: 'Total Returns (%)',
                    color: '#10b981',
                    gradientColor: 'rgba(16, 185, 129, 0.1)',
                    formatter: (value: number) => `${value.toFixed(2)}%`,
                    domain: ['auto', 'auto']
                };
            case 'drawdown':
                return {
                    dataKey: 'drawdown',
                    name: 'Drawdown (%)',
                    color: '#ef4444',
                    gradientColor: 'rgba(239, 68, 68, 0.1)',
                    formatter: (value: number) => `${value.toFixed(2)}%`,
                    domain: [0, 'auto']
                };
        }
    };

    const config = getChartConfig();

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;

            return (
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        {DateFormatter.formatDate(data.date, { format: 'medium' })}
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between gap-4">
                            <span className="text-gray-600 dark:text-gray-400">Equity:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {PriceFormatter.formatPrice(data.equity)}
                            </span>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-gray-600 dark:text-gray-400">Returns:</span>
                            <span className={`font-semibold ${data.returns >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {data.returns >= 0 ? '+' : ''}{data.returns.toFixed(2)}%
                            </span>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-gray-600 dark:text-gray-400">Drawdown:</span>
                            <span className="font-semibold text-red-600">
                                {data.drawdown.toFixed(2)}%
                            </span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    const handleExport = () => {
        const csv = [
            ['Date', 'Equity', 'Returns (%)', 'Drawdown (%)'],
            ...chartData.map(item => [
                item.date,
                item.equity,
                item.returns,
                item.drawdown
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance_${timeRange}_${DateFormatter.formatDate(new Date(), { format: 'short' })}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
                    <div className="text-gray-500 dark:text-gray-400">Loading chart...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full">
            {/* Controls */}
            {showControls && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                        <Button
                            variant={activeMetric === 'equity' ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setActiveMetric('equity')}
                            icon={<DollarSign className="w-4 h-4" />}
                        >
                            Equity
                        </Button>
                        <Button
                            variant={activeMetric === 'returns' ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setActiveMetric('returns')}
                            icon={<TrendingUp className="w-4 h-4" />}
                        >
                            Returns
                        </Button>
                        <Button
                            variant={activeMetric === 'drawdown' ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setActiveMetric('drawdown')}
                            icon={<TrendingDown className="w-4 h-4" />}
                        >
                            Drawdown
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleExport}
                            icon={<Download className="w-4 h-4" />}
                        >
                            Export
                        </Button>
                    </div>
                </div>
            )}

            {/* Chart */}
            <div style={{ height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id={`color${activeMetric}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={config.color} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={config.color} stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e5e7eb"
                            vertical={false}
                            horizontal={true}
                        />

                        <XAxis
                            dataKey="date"
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return DateFormatter.formatDate(date, { format: 'short' });
                            }}
                            stroke="#9ca3af"
                            fontSize={12}
                        />

                        <YAxis
                            tickFormatter={(value) => {
                                if (activeMetric === 'equity') {
                                    return PriceFormatter.formatCompact(value);
                                }
                                return `${value.toFixed(0)}%`;
                            }}
                            stroke="#9ca3af"
                            fontSize={12}
                            domain={config.domain}
                        />

                        <Tooltip content={<CustomTooltip />} />
                        <Legend />

                        <Area
                            type="monotone"
                            dataKey={config.dataKey}
                            name={config.name}
                            stroke={config.color}
                            fillOpacity={1}
                            fill={`url(#color${activeMetric})`}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{
                                r: 6,
                                fill: config.color,
                                stroke: '#ffffff',
                                strokeWidth: 2
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <div className="text-sm text-blue-700 dark:text-blue-300">Current Equity</div>
                    </div>
                    <div className="text-lg font-bold text-blue-900 dark:text-blue-200">
                        {chartData.length > 0
                            ? PriceFormatter.formatPrice(chartData[chartData.length - 1].equity)
                            : '$0.00'
                        }
                    </div>
                </div>

                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <div className="text-sm text-green-700 dark:text-green-300">Total Return</div>
                    </div>
                    <div className="text-lg font-bold text-green-900 dark:text-green-200">
                        {chartData.length > 0
                            ? `${chartData[chartData.length - 1].returns >= 0 ? '+' : ''}${chartData[chartData.length - 1].returns.toFixed(2)}%`
                            : '0.00%'
                        }
                    </div>
                </div>

                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <div className="text-sm text-red-700 dark:text-red-300">Max Drawdown</div>
                    </div>
                    <div className="text-lg font-bold text-red-900 dark:text-red-200">
                        {chartData.length > 0
                            ? Math.max(...chartData.map(d => d.drawdown)).toFixed(2) + '%'
                            : '0.00%'
                        }
                    </div>
                </div>

                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <div className="text-sm text-purple-700 dark:text-purple-300">Sharpe Ratio</div>
                    </div>
                    <div className="text-lg font-bold text-purple-900 dark:text-purple-200">
                        1.45
                    </div>
                </div>
            </div>
        </div>
    );
};