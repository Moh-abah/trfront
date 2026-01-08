
// @ts-nocheck

'use client';

import React from 'react';
import {
    TrendingUp,
    TrendingDown,
    Clock,
    AlertCircle,
    ExternalLink,
    MoreVertical,
    CheckCircle,
    XCircle
} from 'lucide-react';

import { DateFormatter } from '../../utils/formatters/date.formatter';
import { PriceFormatter } from '../../utils/formatters/price.formatter';
import { Button } from '../ui/Button/Button';

interface ActiveSignalsProps {
    signals: TradingSignal[];
    onSignalClick?: (signalId: string) => void;
    onAcknowledge?: (signalId: string) => void;
    onDismiss?: (signalId: string) => void;
    isLoading?: boolean;
    maxItems?: number;
}

export const ActiveSignals: React.FC<ActiveSignalsProps> = ({
    signals,
    onSignalClick,
    onAcknowledge,
    onDismiss,
    isLoading = false,
    maxItems = 5
}) => {
    const displaySignals = signals.slice(0, maxItems);

    if (isLoading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: maxItems }).map((_, index) => (
                    <div key={index} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse">
                        <div className="flex justify-between items-center mb-2">
                            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                        </div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    const getSignalColor = (type: string) => {
        switch (type) {
            case 'buy':
                return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800';
            case 'sell':
                return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800';
            case 'alert':
                return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
            default:
                return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
        }
    };

    const getSignalIcon = (type: string) => {
        switch (type) {
            case 'buy':
                return <TrendingUp className="w-4 h-4" />;
            case 'sell':
                return <TrendingDown className="w-4 h-4" />;
            case 'alert':
                return <AlertCircle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const getStrengthColor = (strength?: string) => {
        switch (strength) {
            case 'strong':
                return 'bg-gradient-to-r from-red-500 to-orange-500';
            case 'moderate':
                return 'bg-gradient-to-r from-yellow-500 to-amber-500';
            case 'weak':
                return 'bg-gradient-to-r from-blue-500 to-cyan-500';
            default:
                return 'bg-gray-300 dark:bg-gray-600';
        }
    };

    const handleSignalClick = (signal: TradingSignal) => {
        if (onSignalClick) {
            onSignalClick(signal.id);
        }
    };

    return (
        <div className="space-y-3">
            {displaySignals.map((signal) => {
                const signalColor = getSignalColor(signal.type);
                const signalIcon = getSignalIcon(signal.type);
                const strengthColor = getStrengthColor(signal.strength);
                const timeAgo = DateFormatter.formatRelative(signal.timestamp);

                return (
                    <div
                        key={signal.id}
                        className="group p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all cursor-pointer"
                        onClick={() => handleSignalClick(signal)}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-lg ${signalColor}`}>
                                    {signalIcon}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {signal.symbol}
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${signalColor}`}>
                                            {signal.type.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {signal.strategy}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                {signal.status === 'active' && onAcknowledge && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAcknowledge(signal.id);
                                        }}
                                        className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
                                        title="Acknowledge"
                                    >
                                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    </button>
                                )}
                                {onDismiss && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDismiss(signal.id);
                                        }}
                                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                                        title="Dismiss"
                                    >
                                        <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                    </button>
                                )}
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

                        {/* Signal Details */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Price</div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                    {PriceFormatter.formatPrice(signal.price)}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Target</div>
                                <div className="font-medium text-green-600 dark:text-green-400">
                                    {signal.target ? PriceFormatter.formatPrice(signal.target) : 'N/A'}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Stop Loss</div>
                                <div className="font-medium text-red-600 dark:text-red-400">
                                    {signal.stopLoss ? PriceFormatter.formatPrice(signal.stopLoss) : 'N/A'}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Profit/Loss</div>
                                <div className={`font-medium ${signal.profitLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {signal.profitLoss >= 0 ? '+' : ''}{signal.profitLoss?.toFixed(2)}%
                                </div>
                            </div>
                        </div>

                        {/* Progress and Info */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {/* Strength Indicator */}
                                <div className="flex items-center gap-1">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Strength:</div>
                                    <div className="flex items-center gap-1">
                                        <div className={`w-2 h-2 rounded-full ${strengthColor}`}></div>
                                        <span className="text-xs font-medium capitalize">{signal.strength || 'neutral'}</span>
                                    </div>
                                </div>

                                {/* Time */}
                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                    <Clock className="w-3 h-3" />
                                    <span>{timeAgo}</span>
                                </div>
                            </div>

                            <Button
                                size="xs"
                                variant="ghost"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSignalClick(signal);
                                }}
                                icon={<ExternalLink className="w-3 h-3" />}
                            >
                                Details
                            </Button>
                        </div>

                        {/* Confidence Bar */}
                        {signal.confidence && (
                            <div className="mt-2">
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    <span>Confidence</span>
                                    <span>{Math.round(signal.confidence * 100)}%</span>
                                </div>
                                <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${signal.type === 'buy' ? 'bg-green-500' : 'bg-red-500'}`}
                                        style={{ width: `${signal.confidence * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            {displaySignals.length === 0 && (
                <div className="p-6 text-center">
                    <div className="text-gray-400 mb-3">
                        <AlertCircle className="w-12 h-12 mx-auto" />
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                        No active signals
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        All signals have been processed or dismissed
                    </p>
                </div>
            )}
        </div>
    );
};