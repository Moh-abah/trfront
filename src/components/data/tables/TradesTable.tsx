
// @ts-nocheck

'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Calendar, DollarSign, Clock } from 'lucide-react';
import { Badge } from '../../ui/Badge';

interface Trade {
    id: string;
    symbol: string;
    side: 'LONG' | 'SHORT';
    entryPrice: number;
    exitPrice: number;
    quantity: number;
    profitLoss: number;
    profitLossPercent: number;
    entryTime: string;
    exitTime: string;
    duration: string;
    status: 'OPEN' | 'CLOSED';
}

interface TradesTableProps {
    trades?: Trade[];
    
    onTradeClick?: (tradeId: string) => void;
    isLoading?: boolean;
    className?: string;
}

export const TradesTable: React.FC<TradesTableProps> = ({
    trades,
    onTradeClick,
    isLoading = false,
    className = '',
}) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
                            Side
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Entry
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Exit
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                            P&L
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Duration
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Status
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {trades.map((trade) => (
                        <tr
                            key={trade.id}
                            className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                            onClick={() => onTradeClick?.(trade.id)}
                        >
                            <td className="py-3 px-4">
                                <div className="font-medium text-gray-900 dark:text-white">
                                    {trade.symbol}
                                </div>
                            </td>
                            <td className="py-3 px-4">
                                <Badge
                                    variant={trade.side === 'LONG' ? 'success' : 'danger'}
                                    className="uppercase"
                                >
                                    {trade.side}
                                </Badge>
                            </td>
                            <td className="py-3 px-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1">
                                        <DollarSign className="w-3 h-3 text-gray-400" />
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            ${trade.entryPrice.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                        <Calendar className="w-3 h-3" />
                                        {formatDate(trade.entryTime)}
                                        <Clock className="w-3 h-3 ml-1" />
                                        {formatTime(trade.entryTime)}
                                    </div>
                                </div>
                            </td>
                            <td className="py-3 px-4">
                                {trade.exitPrice ? (
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1">
                                            <DollarSign className="w-3 h-3 text-gray-400" />
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                ${trade.exitPrice.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(trade.exitTime)}
                                            <Clock className="w-3 h-3 ml-1" />
                                            {formatTime(trade.exitTime)}
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-gray-400">-</span>
                                )}
                            </td>
                            <td className="py-3 px-4">
                                <div className="flex items-center gap-1">
                                    {trade.profitLoss >= 0 ? (
                                        <TrendingUp className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4 text-red-500" />
                                    )}
                                    <span
                                        className={
                                            trade.profitLoss >= 0
                                                ? 'text-green-600 font-medium'
                                                : 'text-red-600 font-medium'
                                        }
                                    >
                                        ${Math.abs(trade.profitLoss).toFixed(2)}
                                        <span className="text-sm ml-1">
                                            ({trade.profitLossPercent >= 0 ? '+' : ''}
                                            {trade.profitLossPercent.toFixed(2)}%)
                                        </span>
                                    </span>
                                </div>
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {trade.duration}
                                </div>
                            </td>
                            <td className="py-3 px-4">
                                <Badge
                                    variant={trade.status === 'OPEN' ? 'warning' : 'secondary'}
                                >
                                    {trade.status}
                                </Badge>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};