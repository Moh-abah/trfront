'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Star, MoreVertical } from 'lucide-react';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button/Button';

interface MarketData {
    symbol: string;
    name: string;
    price: number;
    change24h: number;
    volume24h: number;
    marketCap: number;
    category: string;
    isFavorite: boolean;
}

interface MarketTableProps {
    data: MarketData[];
    onRowClick?: (symbol: string) => void;
    onFavoriteToggle?: (symbol: string, isFavorite: boolean) => void;
    isLoading?: boolean;
    className?: string;
}

export const MarketTable: React.FC<MarketTableProps> = ({
    data,
    onRowClick,
    onFavoriteToggle,
    isLoading = false,
    className = '',
}) => {
    const formatNumber = (num: number): string => {
        if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
        return `$${num.toFixed(2)}`;
    };

    if (isLoading) {
        return (
            <div className={`animate-pulse space-y-3 ${className}`}>
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
            </div>
        );
    }

    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Symbol
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Price
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                            24h Change
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Volume (24h)
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Market Cap
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Category
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr
                            key={item.symbol}
                            className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                            onClick={() => onRowClick?.(item.symbol)}
                        >
                            <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onFavoriteToggle?.(item.symbol, !item.isFavorite);
                                        }}
                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                    >
                                        <Star
                                            className={`w-4 h-4 ${item.isFavorite
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-400'
                                                }`}
                                        />
                                    </button>
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            {item.symbol}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {item.name}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                                ${item.price.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </td>
                            <td className="py-3 px-4">
                                <div className="flex items-center gap-1">
                                    {item.change24h >= 0 ? (
                                        <TrendingUp className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4 text-red-500" />
                                    )}
                                    <span
                                        className={
                                            item.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                                        }
                                    >
                                        {item.change24h >= 0 ? '+' : ''}
                                        {item.change24h.toFixed(2)}%
                                    </span>
                                </div>
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                {formatNumber(item.volume24h)}
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                {formatNumber(item.marketCap)}
                            </td>
                            <td className="py-3 px-4">
                                <Badge variant="secondary">{item.category}</Badge>
                            </td>
                            <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRowClick?.(item.symbol);
                                        }}
                                    >
                                        Chart
                                    </Button>
                                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                                        <MoreVertical className="w-4 h-4 text-gray-400" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};