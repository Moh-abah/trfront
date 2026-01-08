
// @ts-nocheck

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Star,
    TrendingUp,
    TrendingDown,
    MoreVertical,
    Eye,
    EyeOff,
    Plus,
    X,
    AlertCircle
} from 'lucide-react';
import { useMarketStore } from '../../stores/market.store';
import { useSettingsStore } from '../../stores/settings.store';
import { Button } from '../ui/Button/Button';
import { PriceFormatter } from '../../utils/formatters/price.formatter';
import { Modal } from '../ui/Modal/Modal';

interface WatchlistProps {
    maxItems?: number;
    compact?: boolean;
    onSymbolClick?: (symbol: string, market: string) => void;
}

export const Watchlist: React.FC<WatchlistProps> = ({
    maxItems = 10,
    compact = false,
    onSymbolClick
}) => {
    const router = useRouter();
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMarket, setSelectedMarket] = useState<'crypto' | 'stocks'>('crypto');

    const { symbols, prices, loadMarketData } = useMarketStore();
    const { watchlists, addToWatchlist, removeFromWatchlist, updateWatchlistOrder } = useSettingsStore();

    // Filter symbols based on search
    const filteredSymbols = symbols.filter(symbol =>
        symbol.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        symbol.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSymbolClick = (symbol: string, market: string) => {
        if (onSymbolClick) {
            onSymbolClick(symbol, market);
        } else {
            router.push(`/chart/${symbol}?market=${market}`);
        }
    };

    const handleAddToWatchlist = (symbol: string, market: string) => {
        addToWatchlist(symbol, market);
        setSearchQuery('');
        setShowAddModal(false);
    };

    const handleRemoveFromWatchlist = (symbol: string, e: React.MouseEvent) => {
        e.stopPropagation();
        removeFromWatchlist(symbol);
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        e.dataTransfer.setData('text/plain', index.toString());
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, newIndex: number) => {
        e.preventDefault();
        const oldIndex = parseInt(e.dataTransfer.getData('text/plain'));
        if (oldIndex !== newIndex) {
            updateWatchlistOrder(oldIndex, newIndex);
        }
    };

    if (compact) {
        return (
            <div className="space-y-2">
                {watchlist.slice(0, maxItems).map((item, index) => {
                    const priceData = prices[item.symbol];
                    const isPositive = priceData?.change24h >= 0;

                    return (
                        <div
                            key={item.symbol}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, index)}
                            className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-move group"
                            onClick={() => handleSymbolClick(item.symbol, item.market)}
                        >
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => handleRemoveFromWatchlist(item.symbol, e)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                                >
                                    <X className="w-3 h-3 text-red-500" />
                                </button>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {item.symbol}
                                </span>
                            </div>

                            {priceData && (
                                <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                    {isPositive ? (
                                        <TrendingUp className="w-3 h-3" />
                                    ) : (
                                        <TrendingDown className="w-3 h-3" />
                                    )}
                                    <span className="font-medium">
                                        {priceData.change24h >= 0 ? '+' : ''}{priceData.change24h?.toFixed(2)}%
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                        Watchlist ({watchlists.length})
                    </h3>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowAddModal(true)}
                        icon={<Plus className="w-4 h-4" />}
                    >
                        Add
                    </Button>
                </div>
            </div>

            {/* Watchlist Items */}
            <div className="space-y-2">
                {watchlists.slice(0, maxItems).map((item, index) => {



                    const priceData = prices[item.symbol];
                    const isPositive = priceData?.change24h >= 0;

                    return (
                        <div
                            key={`${item.market}-${item.symbol}`}

                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, index)}
                            className="group flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm cursor-move transition-all"
                            onClick={() => handleSymbolClick(item.symbol, item.market)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col items-center">
                                    <button
                                        onClick={(e) => handleRemoveFromWatchlist(item.symbol, e)}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded mb-1"
                                    >
                                        <X className="w-3 h-3 text-red-500" />
                                    </button>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {index + 1}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {item.symbol}
                                        </span>
                                        <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                                            {item.market}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {item.note || 'No note'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Price Info */}
                                {priceData ? (
                                    <div className="text-right">
                                        <div className="font-semibold text-gray-900 dark:text-white">
                                            {PriceFormatter.formatPrice(priceData.current)}
                                        </div>
                                        <div className={`flex items-center justify-end gap-1 ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {isPositive ? (
                                                <TrendingUp className="w-3 h-3" />
                                            ) : (
                                                <TrendingDown className="w-3 h-3" />
                                            )}
                                            <span className="text-sm font-medium">
                                                {priceData.change24h >= 0 ? '+' : ''}{priceData.change24h.toFixed(2)}%
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-right text-gray-500 dark:text-gray-400">
                                        <div className="font-semibold">N/A</div>
                                        <div className="text-sm">Loading...</div>
                                    </div>
                                )}

                                {/* Actions */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Handle more options
                                    }}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100"
                                >
                                    <MoreVertical className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>
                        </div>
                    );
                })}

                {watchlists.length === 0 && (
                    <div className="p-6 text-center">
                        <div className="text-gray-400 mb-3">
                            <Star className="w-12 h-12 mx-auto" />
                        </div>
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                            Your watchlist is empty
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            Add symbols to track their performance
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => setShowAddModal(true)}
                            icon={<Plus className="w-4 h-4" />}
                        >
                            Add Symbols
                        </Button>
                    </div>
                )}

                {watchlists.length > maxItems && (
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            variant="ghost"
                            className="w-full"
                            onClick={() => router.push('/settings?tab=watchlist')}
                        >
                            View All ({watchlists.length} items)
                        </Button>
                    </div>
                )}
            </div>

            {/* Add to Watchlist Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add to Watchlist"
                size="md"
            >
                <div className="space-y-4">
                    {/* Search */}
                    <div>
                        <input
                            type="text"
                            placeholder="Search symbols..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                        />
                    </div>

                    {/* Market Tabs */}
                    <div className="flex gap-2">
                        <Button
                            variant={selectedMarket === 'crypto' ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedMarket('crypto')}
                        >
                            Crypto
                        </Button>
                        <Button
                            variant={selectedMarket === 'stocks' ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedMarket('stocks')}
                        >
                            Stocks
                        </Button>
                    </div>

                    {/* Results */}
                    <div className="max-h-60 overflow-y-auto">
                        {filteredSymbols
                            .filter(symbol => symbol.market === selectedMarket)
                            .slice(0, 20)
                            .map((symbol) => {
                                const isInWatchlist = watchlists.some(item => item.symbol === symbol.symbol);

                                return (
                                    <div
                                        key={symbol.symbol}
                                        className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                                    >
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {symbol.symbol}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {symbol.name}
                                            </div>
                                        </div>

                                        <Button
                                            size="sm"
                                            variant={isInWatchlist ? 'outline' : 'primary'}
                                            disabled={isInWatchlist}
                                            onClick={() => handleAddToWatchlist(symbol.symbol, selectedMarket)}
                                            icon={isInWatchlist ? <EyeOff className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                        >
                                            {isInWatchlist ? 'Added' : 'Add'}
                                        </Button>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            </Modal>
        </div>
    );
};