'use client';
import React from 'react';
import { cn } from '../../../utils/helpers/string.helpers';
import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';

export interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral' | 'alert';
    change?: number;
    changePercent?: number;
    format?: 'currency' | 'percentage' | 'number' | 'price' | 'volume';
    currency?: string;
    precision?: number;
    loading?: boolean;
    onClick?: () => void;
    className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    subtitle,
    icon,
    trend,
    change,
    changePercent,
    format = 'number',
    currency = 'USD',
    precision = 2,
    loading = false,
    onClick,
    className
}) => {
    const formatValue = (val: string | number): string => {
        if (loading) return '--';

        const num = typeof val === 'string' ? parseFloat(val) : val;

        switch (format) {
            case 'currency':
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency,
                    minimumFractionDigits: precision,
                    maximumFractionDigits: precision
                }).format(num);

            case 'percentage':
                return `${num.toFixed(precision)}%`;

            case 'price':
                return new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: precision,
                    maximumFractionDigits: precision
                }).format(num);

            case 'volume':
                if (num >= 1e9) {
                    return `${(num / 1e9).toFixed(2)}B`;
                } else if (num >= 1e6) {
                    return `${(num / 1e6).toFixed(2)}M`;
                } else if (num >= 1e3) {
                    return `${(num / 1e3).toFixed(2)}K`;
                }
                return num.toFixed(precision);

            case 'number':
            default:
                return new Intl.NumberFormat('en-US').format(num);
        }
    };

    const getTrendIcon = () => {
        if (trend === 'up') {
            return <TrendingUp className="w-4 h-4 text-green-500" />;
        } else if (trend === 'down') {
            return <TrendingDown className="w-4 h-4 text-red-500" />;
        } else if (trend === 'alert') {
            return <AlertCircle className="w-4 h-4 text-yellow-500" />;
        } else {
            return <Minus className="w-4 h-4 text-gray-500" />;
        }
    };

    const getChangeColor = () => {
        if (change && change > 0) return 'text-green-600 dark:text-green-400';
        if (change && change < 0) return 'text-red-600 dark:text-red-400';
        return 'text-gray-600 dark:text-gray-400';
    };

    const getChangeSymbol = (val: number) => {
        return val > 0 ? '+' : '';
    };

    const getTrendStyles = () => {
        switch (trend) {
            case 'up':
                return 'border-l-4 border-l-green-500 bg-green-50 dark:bg-green-900/20';
            case 'down':
                return 'border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/20';
            case 'alert':
                return 'border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
            default:
                return 'border-l-4 border-l-gray-300 dark:border-l-gray-600';
        }
    };

    return (
        <div
            className={cn(
                'rounded-lg p-4 transition-all duration-200',
                getTrendStyles(),
                onClick && 'cursor-pointer hover:shadow-md',
                className
            )}
            onClick={onClick}
        >
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {title}
                    </p>

                    <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {formatValue(value)}
                        </p>

                        {(change !== undefined || changePercent !== undefined) && (
                            <div className="flex items-center gap-1">
                                {getTrendIcon()}
                                {change !== undefined && (
                                    <span className={cn('text-sm font-medium', getChangeColor())}>
                                        {getChangeSymbol(change)}{formatValue(change)}
                                    </span>
                                )}
                                {changePercent !== undefined && (
                                    <span className={cn('text-sm font-medium', getChangeColor())}>
                                        ({getChangeSymbol(changePercent)}{changePercent.toFixed(precision)}%)
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {subtitle && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {subtitle}
                        </p>
                    )}
                </div>

                {icon && (
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        {icon}
                    </div>
                )}
            </div>

            {loading && (
                <div className="mt-2">
                    <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 animate-pulse" style={{ width: '60%' }} />
                    </div>
                </div>
            )}
        </div>
    );
};

// Metric Grid Component for displaying multiple metrics
interface MetricGridProps {
    children: React.ReactNode;
    columns?: 1 | 2 | 3 | 4;
    gap?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const MetricGrid: React.FC<MetricGridProps> = ({
    children,
    columns = 3,
    gap = 'md',
    className
}) => {
    const gridColumns = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    };

    const gaps = {
        sm: 'gap-3',
        md: 'gap-4',
        lg: 'gap-6'
    };

    return (
        <div className={cn('grid', gridColumns[columns], gaps[gap], className)}>
            {children}
        </div>
    );
};