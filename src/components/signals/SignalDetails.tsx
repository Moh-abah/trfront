
// @ts-nocheck








'use client';

import React from 'react';
import { TradingSignal } from '../../types';

import { Alert } from '../ui/Alert/Alert';
import { Button } from '../ui/Button/Button';
import { formatDate, formatPrice } from '@/utils/formatters';

interface SignalDetailsProps {
    signal: TradingSignal | null;
    onClose?: () => void;
    onAddToWatchlist?: (symbol: string) => void;
    onBacktestStrategy?: (strategyId: string) => void;
    className?: string;
    onTrade?: () => void;
}

const getSignalVariant = (type: TradingSignal['type']): 'success' | 'error' | 'warning' => {
    switch (type) {
        case 'buy': return 'success';
        case 'sell': return 'error';
        case 'hold': return 'warning';
        default: return 'warning';
    }
};

const getStrengthColor = (strength: TradingSignal['strength']) => {
    switch (strength) {
        case 'strong': return 'text-green-600';
        case 'medium': return 'text-yellow-600';
        case 'weak': return 'text-red-600';
        default: return 'text-gray-600';
    }
};

export const SignalDetails: React.FC<SignalDetailsProps> = ({
    signal,
    onClose,
    onAddToWatchlist,
    onBacktestStrategy,
    className
}) => {
    if (!signal) {
        return (
            <div className={className}>
                <div className="text-center py-8 text-gray-500">
                    Select a signal to view details
                </div>
            </div>
        );
    }

    const variant = getSignalVariant(signal.type);
    const strengthColor = getStrengthColor(signal.strength);

    return (
        <div className={className}>
            <div className="border-b pb-4 mb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className={`font-bold text-lg uppercase ${variant === 'success' ? 'text-green-600' : variant === 'error' ? 'text-red-600' : 'text-yellow-600'}`}>
                                {signal.type}
                            </span>
                            <span className={`text-sm font-medium ${strengthColor}`}>
                                ({signal.strength})
                            </span>
                        </div>
                        <h2 className="text-xl font-bold mt-1">{signal.symbol}</h2>
                        <p className="text-gray-500 text-sm">{signal.name || 'Unnamed Signal'}</p>
                    </div>

                    {onClose && (
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            Close
                        </Button>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                {/* Price Information */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Current Price</p>
                        <p className="text-lg font-bold">{formatPrice(signal.price)}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Confidence</p>
                        <p className="text-lg font-bold">{signal.confidence}%</p>
                    </div>
                </div>

                {/* Entry/Exit Levels */}
                {signal.entryLevels && signal.entryLevels.length > 0 && (
                    <div>
                        <h3 className="font-medium mb-2">Entry Levels</h3>
                        <div className="space-y-1">
                            {signal.entryLevels.map((level, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                    <span>Level {index + 1}</span>
                                    <span className="font-medium">{formatPrice(level)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {signal.stopLoss && (
                    <div>
                        <h3 className="font-medium mb-2">Stop Loss</h3>
                        <p className="text-sm">{formatPrice(signal.stopLoss)}</p>
                    </div>
                )}

                {signal.takeProfit && (
                    <div>
                        <h3 className="font-medium mb-2">Take Profit</h3>
                        <p className="text-sm">{formatPrice(signal.takeProfit)}</p>
                    </div>
                )}

                {/* Indicators */}
                {signal.indicators && signal.indicators.length > 0 && (
                    <div>
                        <h3 className="font-medium mb-2">Indicators</h3>
                        <div className="space-y-1">
                            {signal.indicators.map((indicator, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                    <span>{indicator.name}</span>
                                    <span className="text-gray-500">{indicator.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Timestamp */}
                <div className="pt-4 border-t">
                    <p className="text-sm text-gray-500">
                        Generated at: {formatDate(signal.timestamp, 'full')}
                    </p>
                    <p className="text-sm text-gray-500">
                        Timeframe: {signal.timeframe}
                    </p>
                    <p className="text-sm text-gray-500">
                        Market: {signal.market}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                    {onAddToWatchlist && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onAddToWatchlist(signal.symbol)}
                        >
                            Add to Watchlist
                        </Button>
                    )}

                    {onBacktestStrategy && signal.strategyId && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onBacktestStrategy(signal.strategyId!)}
                        >
                            Backtest Strategy
                        </Button>
                    )}

                    <Button variant="primary" size="sm" className="ml-auto">
                        View Chart
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SignalDetails;