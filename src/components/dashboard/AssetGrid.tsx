
// @ts-nocheck

'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, TrendingDown, Star, MoreVertical } from 'lucide-react';
import { MarketSymbol } from '../../types/market.types';
import { PriceFormatter } from '../../utils/formatters/price.formatter';
import { NumberFormatter } from '../../utils/formatters/number.formatter';
import { Button } from '../ui/Button/Button';

interface AssetGridProps {
    symbols: MarketSymbol[];
    market: 'crypto' | 'stocks';
    prices?: Record<string, { current: number; change24h: number; volume24h: number }>;
    onSymbolClick?: (symbol: string) => void;
    isLoading?: boolean;
    maxItems?: number;
}



export const AssetGrid: React.FC<AssetGridProps> = ({
    symbols,
    market,
    prices = {},
    onSymbolClick,
    isLoading = false,
    maxItems = 6
}) => {
    const displaySymbols = symbols
        .filter(
            (s): s is MarketSymbol =>
                typeof s.symbol === 'string' &&
                s.symbol.length > 0
        )
        .slice(0, maxItems);

    const router = useRouter();
    

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: maxItems }).map((_, index) => (
                    <div key={index} className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-20 mb-2"></div>
                                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
                            </div>
                            <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
                        </div>
                        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    const handleSymbolClick = (symbol: string) => {
        if (onSymbolClick) {
            onSymbolClick(symbol);
        } else {
            router.push(`/chart/${symbol}?market=${market}`);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displaySymbols.map((symbol) => {
                const priceData = prices[symbol.symbol] || { current: 0, change24h: 0, volume24h: 0 };
                const isPositive = priceData.change24h >= 0;

                return (
                    <div
                        key={`${market}-${symbol.symbol}`}

                        className="group p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => handleSymbolClick(symbol.symbol)}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                        {symbol.symbol}
                                    </h3>
                                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                                        {market}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {symbol.name}
                                </p>
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Handle favorite toggle
                                    }}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                >
                                    <Star className="w-4 h-4 text-gray-400 hover:text-yellow-500" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Handle more options
                                    }}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                >
                                    <MoreVertical className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>
                        </div>

                        {/* Price and Change */}
                        <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {PriceFormatter.formatPrice(priceData.current)}
                                </div>
                                <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {isPositive ? (
                                        <TrendingUp className="w-4 h-4" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4" />
                                    )}
                                    <span className="font-semibold">
                                        {priceData.change24h >= 0 ? '+' : ''}{priceData.change24h.toFixed(2)}%
                                    </span>
                                </div>
                            </div>

                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                24h Volume: {PriceFormatter.formatVolume(priceData.volume24h)}
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="flex items-center justify-between text-sm">
                            <div className="text-gray-600 dark:text-gray-400">
                                Market Cap
                            </div>
                            <div className="font-medium text-gray-900 dark:text-white">
                                {symbol.marketCap ? PriceFormatter.formatMarketCap(symbol.marketCap, { compact: true }) : 'N/A'}
                            </div>
                        </div>

                        {/* Progress Bar (for visualization) */}
                        <div className="mt-3">
                            <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
                                    style={{ width: `${Math.min(Math.abs(priceData.change24h) * 5, 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-4 flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSymbolClick(symbol.symbol);
                                }}
                            >
                                View Chart
                            </Button>
                            <Button
                                size="sm"
                                variant="primary"
                                className="flex-1"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle quick trade
                                }}
                            >
                                Trade
                            </Button>
                        </div>
                    </div>
                );
            })}

            {displaySymbols.length === 0 && (
                <div className="col-span-full p-8 text-center">
                    <div className="text-gray-400 mb-3">
                        <TrendingUp className="w-12 h-12 mx-auto" />
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                        No assets available
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Try adjusting your filters or refresh the data
                    </p>
                </div>
            )}
        </div>
    );
};