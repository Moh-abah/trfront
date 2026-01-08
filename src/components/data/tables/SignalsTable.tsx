'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { Badge } from '../../ui/Badge';

// إضافة type لجعل التوافق مع TradingSignal
export interface Signal {
    id: string;
    symbol: string;
    type: 'BUY' | 'SELL' | 'NEUTRAL'; // أضفنا type للتوافق مع TradingSignal
    signal?: 'BUY' | 'SELL' | 'NEUTRAL'; // جعلنا signal اختيارية
    strength: number;
    price: number;
    target: number;
    stopLoss: number;
    timestamp: string;
    strategy: string;
    confidence?: number; // جعلناها اختيارية
}

interface SignalsTableProps {
    signals: Signal[];
    onSignalClick?: (signalId: string) => void;
    onArchive?: (signalId: string) => void; // أضفنا onArchive
    onDelete?: (signalId: string) => void; // أضفنا onDelete
    isLoading?: boolean;
    className?: string;
}

export const SignalsTable: React.FC<SignalsTableProps> = ({
    signals,
    onSignalClick,
    onArchive,
    onDelete,
    isLoading = false,
    className = '',
}) => {
    const getSignalColor = (signalType: string) => {
        switch (signalType.toUpperCase()) {
            case 'BUY':
                return 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
            case 'SELL':
                return 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
            default:
                return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
        }
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getSignalValue = (signal: Signal) => {
        // استخدام type إذا كانت موجودة، وإلا استخدم signal
        return signal.type || signal.signal || 'NEUTRAL';
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

    if (!signals || signals.length === 0) {
        return (
            <div className={`text-center py-8 ${className}`}>
                <div className="text-gray-400 dark:text-gray-500">
                    No signals found
                </div>
            </div>
        );
    }

    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Signal
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Symbol
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Price
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Target
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Stop Loss
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Strategy
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Confidence
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Time
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {signals.map((signal) => {
                        const signalValue = getSignalValue(signal);
                        return (
                            <tr
                                key={signal.id}
                                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                                onClick={() => onSignalClick?.(signal.id)}
                            >
                                <td className="py-3 px-4">
                                    <div
                                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border ${getSignalColor(
                                            signalValue
                                        )}`}
                                    >
                                        {signalValue === 'BUY' ? (
                                            <ArrowUpRight className="w-4 h-4" />
                                        ) : signalValue === 'SELL' ? (
                                            <ArrowDownRight className="w-4 h-4" />
                                        ) : null}
                                        <span className="font-medium">{signalValue}</span>
                                        <Badge variant="secondary" size="sm">
                                            {signal.strength || 0}/10
                                        </Badge>
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <div className="font-medium text-gray-900 dark:text-white">
                                        {signal.symbol}
                                    </div>
                                </td>
                                <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                                    ${signal.price.toFixed(2)}
                                </td>
                                <td className="py-3 px-4">
                                    {signal.target > 0 ? (
                                        <div className="flex items-center gap-1 text-green-600">
                                            <ArrowUpRight className="w-4 h-4" />
                                            <span>${signal.target.toFixed(2)}</span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </td>
                                <td className="py-3 px-4">
                                    {signal.stopLoss > 0 ? (
                                        <div className="flex items-center gap-1 text-red-600">
                                            <ArrowDownRight className="w-4 h-4" />
                                            <span>${signal.stopLoss.toFixed(2)}</span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </td>
                                <td className="py-3 px-4">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {signal.strategy || 'Unknown'}
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    {signal.confidence ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-blue-500 h-2 rounded-full"
                                                    style={{ width: `${signal.confidence}%` }}
                                                />
                                            </div>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {signal.confidence}%
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                        <Clock className="w-4 h-4" />
                                        {formatTime(signal.timestamp)}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};