'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Zap, Shield, Star } from 'lucide-react';
// قم باستيراد MarketType من ملف الأنواع الخاص بك
import { MarketType } from '../../types/filter.types';

export type QuickFilterType =
    | 'top_gainers'
    | 'top_losers'
    | 'high_volume'
    | 'oversold'
    | 'overbought'
    | 'new_highs'
    | 'new_lows'
    | 'watchlist';

interface QuickFilter {
    id: QuickFilterType;
    label: string;
    icon: React.ReactNode;
    description: string;
}

interface QuickFiltersProps {
    market: MarketType; // التغيير هنا: استخدام النوع الموحد
    activeFilter?: QuickFilterType;
    onFilterSelect: (filter: string) => void; // توسيع النوع ليقبل string لتجنب مشاكل التمرير
    className?: string;
}

export const QuickFilters: React.FC<QuickFiltersProps> = ({
    market,
    activeFilter,
    onFilterSelect,
    className = ''
}) => {
    const filters: QuickFilter[] = [
        {
            id: 'top_gainers',
            label: 'Top Gainers',
            icon: <TrendingUp className="w-4 h-4" />,
            description: 'Highest 24h gainers'
        },
        {
            id: 'top_losers',
            label: 'Top Losers',
            icon: <TrendingDown className="w-4 h-4" />,
            description: 'Highest 24h losers'
        },
        {
            id: 'high_volume',
            label: 'High Volume',
            icon: <Zap className="w-4 h-4" />,
            description: 'Unusual volume activity'
        },
        {
            id: 'oversold',
            label: 'Oversold',
            icon: <Shield className="w-4 h-4" />,
            description: 'RSI < 30'
        },
        {
            id: 'overbought',
            label: 'Overbought',
            icon: <TrendingUp className="w-4 h-4" />,
            description: 'RSI > 70'
        },
        // نظهر هذا الفلتر فقط إذا كان السوق أسهم
        ...(market === 'stocks' ? [{
            id: 'new_highs' as QuickFilterType,
            label: 'New Highs',
            icon: <Star className="w-4 h-4" />,
            description: '52-week highs'
        }] : [])
    ];

    return (
        <div className={`${className}`}>
            <div className="mb-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Filters</h3>
            </div>
            <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                    <button
                        key={filter.id}
                        onClick={() => onFilterSelect(filter.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${activeFilter === filter.id
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        {filter.icon}
                        <span className="text-sm font-medium">{filter.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};