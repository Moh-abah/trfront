// src/components/market/LivePriceTicker.tsx
'use client';

import { useSingleLivePrice } from '@/services/websocket/useLivePrice';
import React from 'react';


interface LivePriceTickerProps {
    symbol: string;
    showChange?: boolean;
    showVolume?: boolean;
}

const LivePriceTicker: React.FC<LivePriceTickerProps> = ({
    symbol,
    showChange = true,
    showVolume = false,
}) => {
    const { price, isLoading, error } = useSingleLivePrice(symbol);

    if (isLoading) {
        return (
            <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
        );
    }

    if (error || !price) {
        return (
            <div className="text-red-500 text-sm">
                {error || 'No data'}
            </div>
        );
    }

    const isPositive = price.change >= 0;

    return (
        <div className="space-y-1">
            <div className="flex items-center space-x-2">
                <span className="font-bold text-lg">
                    ${price.price.toFixed(2)}
                </span>

                {showChange && (
                    <span className={`text-sm font-medium px-2 py-1 rounded ${isPositive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                        {isPositive ? '+' : ''}{price.change.toFixed(2)}
                        ({isPositive ? '+' : ''}{price.change_percent.toFixed(2)}%)
                    </span>
                )}
            </div>

            {showVolume && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    Vol: {price.volume.toLocaleString()}
                </div>
            )}
        </div>
    );
};

export default LivePriceTicker;