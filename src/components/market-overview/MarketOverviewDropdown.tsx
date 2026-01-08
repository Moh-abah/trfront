"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, TrendingUp, TrendingDown, Loader2, Wifi, WifiOff, ArrowUp, ArrowDown } from "lucide-react";
import { useMarketOverviewStore } from "@/stores/market-overview.store";
import { marketOverviewService } from "@/services/api/market-overview.service";
import { MarketData } from "@/services/api/market-overview.service";

import { PremiumSkeletonLoader } from '@/app/loding';

interface MarketOverviewDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    currentSymbol?: string;
}


// بعد الـ imports مباشرة، أضف:
const DropdownSkeletonLoader = () => {
    const skeletonItems = Array.from({ length: 8 }, (_, i) => i);

    return (
        <div className="relative overflow-hidden">
            <div className="relative space-y-1">
                {/* Header Skeleton */}
                <div className="grid grid-cols-4 gap-4 px-4 py-2 border-b border-[#2a2e39]">
                    {[...Array(4)].map((_, i) => (
                        <div key={i}>
                            <div className="h-4 bg-[#2a2e39] rounded animate-pulse"></div>
                        </div>
                    ))}
                </div>

                {/* Rows Skeleton */}
                {skeletonItems.map((i) => (
                    <div key={i} className="grid grid-cols-4 gap-4 px-4 py-3 border-b border-[#2a2e39]/50">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#2a2e39] animate-pulse"></div>
                            <div className="space-y-2">
                                <div className="h-4 w-20 bg-[#2a2e39] rounded animate-pulse"></div>
                            </div>
                        </div>
                        {[...Array(3)].map((_, j) => (
                            <div key={j} className="text-right">
                                <div className="h-4 w-16 bg-[#2a2e39] rounded animate-pulse inline-block"></div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

// دالة للتحقق من صحة العملة
const isValidMarket = (symbol: string): boolean => {
    const validSuffixes = ["USDT", "USDC"];
    return validSuffixes.some(suffix => symbol.endsWith(suffix));
};

export function MarketOverviewDropdown({
    isOpen,
    onClose,
    currentSymbol,
}: MarketOverviewDropdownProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");

    // Sort and filter states
    const [sortBy, setSortBy] = useState<"price" | "change24h" | "volume">("volume");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    // Get store data
    const markets = useMarketOverviewStore((state) => state.markets);
    const isConnected = useMarketOverviewStore((state) => state.isConnected);
    const isLoading = useMarketOverviewStore((state) => state.isLoading);
    const { setMarkets, setLoading, setConnected } = useMarketOverviewStore();

    // Filter markets by search query
    const filteredMarkets = useMemo(() => {
        if (!searchQuery) return markets;

        const lowerQuery = searchQuery.toLowerCase();
        return markets.filter((m) =>
            m.symbol.toLowerCase().includes(lowerQuery)
        );
    }, [markets, searchQuery]);

    // Sort filtered markets
    const sortedMarkets = useMemo(() => {
        let result = [...filteredMarkets];

        result.sort((a, b) => {
            let comparison = 0;

            if (sortBy === "price") {
                comparison = a.price - b.price;
            } else if (sortBy === "change24h") {
                comparison = a.change24h - b.change24h;
            } else if (sortBy === "volume") {
                comparison = a.volume - b.volume;
            }

            return sortOrder === "asc" ? comparison : -comparison;
        });

        return result;
    }, [filteredMarkets, sortBy, sortOrder]);

    // Initialize WebSocket connection
    useEffect(() => {
        if (isOpen) {
            setLoading(true);

            marketOverviewService.connect({
                onConnected: () => {
                    console.log("[MarketOverviewDropdown] WebSocket connected");
                    setConnected(true);
                    setLoading(false);
                },

                onMessage: (data: MarketData[]) => {
                    console.log("[MarketOverviewDropdown] Received market data:", data.length);

           
                    const validMarkets = data.filter(market => isValidMarket(market.symbol));

                    console.log("[MarketOverviewDropdown] Filtered valid markets:", validMarkets.length);
                    setMarkets(validMarkets);
                    setLoading(false);
                },

                onDisconnected: () => {
                    console.log("[MarketOverviewDropdown] WebSocket disconnected");
                    setConnected(false);
                },
                onError: (error) => {
                    console.error("[MarketOverviewDropdown] WebSocket error:", error);
                    setConnected(false);
                    setLoading(false);
                },
            });

            return () => {
                console.log("[MarketOverviewDropdown] Cleanup, disconnecting WebSocket");
                marketOverviewService.disconnect();
            };
        }
    }, [isOpen, setLoading, setConnected, setMarkets]);

    // Handle clicking on a market
    const handleMarketClick = useCallback(
        (symbol: string) => {
            onClose();
            setSearchQuery("");
            router.push(`/chart/${symbol}?market=crypto&timeframe=1m`);
        },
        [router, onClose]
    );

    // Format price for display
    // Format price for display
    const formatPrice = (price: number) => {
        if (price === 0) return "0.00";

        // الأسعار الصغيرة جداً أقل من 0.001 - 8 خانات
        if (price < 0.001) return price.toFixed(8);

        // الأسعار الصغيرة من 0.001 إلى 0.01 - 5 خانات
        if (price < 0.01) return price.toFixed(5);

        // الأسعار من 0.01 إلى 1 - 3 خانات
        if (price < 1) return price.toFixed(3);

        // الأسعار الكبيرة - 2 خانة
        return price.toFixed(2);
    };

    // Format volume for display
    const formatVolume = (volume: number) => {
        if (volume === 0) return "0";
        if (volume >= 1e12) return `${(volume / 1e12).toFixed(2)}T`;
        if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`;
        if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`;
        if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}K`;
        return volume.toFixed(2);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-start justify-center pt-20">
            <div className="w-[800px] max-h-[80vh] bg-[#1e222d] border border-[#2a2e39] rounded-lg shadow-2xl flex flex-col animate-scale-in">
                {/* Header */}
                <div className="h-14 flex items-center justify-between px-4 border-b border-[#2a2e39]">
                    <div className="flex items-center gap-2">
                        
              
                    </div>
                    <button
                        onClick={onClose}
                        className="px-3 py-1 text-sm bg-[#2a2e39] text-[#d1d4dc] rounded hover:bg-[#363a45] transition-colors"
                    >
                        إغلاق
                    </button>
                </div>

                {/* Search and Filter Bar */}
                <div className="p-4 border-b border-[#2a2e39] space-y-3">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#787b86]" />
                        <input
                            type="text"
                            placeholder="ابحث عن عملة..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pr-10 pl-4 py-2.5 bg-[#131722] border border-[#2a2e39] rounded text-[#d1d4dc] placeholder-[#787b86] focus:outline-none focus:border-[#2962ff] transition-colors"
                            autoFocus
                        />
                    </div>

                    {/* Sort Controls */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs text-[#787b86] font-medium">ترتيب حسب:</span>

                        {/* Sort By Buttons */}
                        <div className="flex gap-1">
                            <button
                                onClick={() => setSortBy("price")}
                                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${sortBy === "price"
                                    ? "bg-[#2962ff] text-white"
                                    : "bg-[#2a2e39] text-[#d1d4dc] hover:bg-[#363a45]"
                                    }`}
                            >
                                السعر
                            </button>
                            <button
                                onClick={() => setSortBy("change24h")}
                                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${sortBy === "change24h"
                                    ? "bg-[#2962ff] text-white"
                                    : "bg-[#2a2e39] text-[#d1d4dc] hover:bg-[#363a45]"
                                    }`}
                            >
                                التغير
                            </button>
                            <button
                                onClick={() => setSortBy("volume")}
                                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${sortBy === "volume"
                                    ? "bg-[#2962ff] text-white"
                                    : "bg-[#2a2e39] text-[#d1d4dc] hover:bg-[#363a45]"
                                    }`}
                            >
                                الحجم
                            </button>
                        </div>

                        {/* Sort Order Toggle */}
                        <button
                            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-[#2a2e39] text-[#d1d4dc] hover:bg-[#363a45] transition-colors"
                            title={sortOrder === "desc" ? "من الأكبر للأصغر" : "من الأصغر للأكبر"}
                        >
                            {sortOrder === "desc" ? (
                                <ArrowDown className="w-3 h-3" />
                            ) : (
                                <ArrowUp className="w-3 h-3" />
                            )}
                            <span>{sortOrder === "desc" ? "تنازلي" : "تصاعدي"}</span>
                        </button>
                    </div>
                </div>

            
                {/* Loading State */}
                { sortedMarkets.length === 0 && (
                    <div className="flex-1 p-4">
                        <DropdownSkeletonLoader />
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && sortedMarkets.length === 0 && (
                    <div className="flex-1 flex items-center justify-center p-8">
                        <p className="text-[#787b86] text-sm">لا توجد نتائج</p>
                    </div>
                )}

                {/* Markets List */}
                {!isLoading && sortedMarkets.length > 0 && (
                    <div className="flex-1 overflow-y-auto">
                        {/* Header Row */}
                        <div className="sticky top-0 bg-[#1e222d] px-4 py-2 border-b border-[#2a2e39] grid grid-cols-4 gap-4 text-xs font-semibold text-[#787b86] uppercase tracking-wider">
                            <div>العملة</div>
                            <div className="text-right">السعر</div>
                            <div className="text-right">التغير 24س</div>
                            <div className="text-right">الحجم</div>
                        </div>

                        {/* Market Items */}
                        <div className="divide-y divide-[#2a2e39]">
                            {sortedMarkets.map((market) => {
                                const isPositive = market.change24h >= 0;
                                const isSelected = market.symbol === currentSymbol;

                                return (
                                    <button
                                        key={market.symbol}
                                        onClick={() => handleMarketClick(market.symbol)}
                                        className={`w-full px-4 py-3 grid grid-cols-4 gap-4 hover:bg-[#2a2e39] transition-colors ${isSelected ? "bg-[#2962ff]/10 border-l-2 border-l-[#2962ff]" : ""
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`font-mono font-bold ${isSelected ? "text-[#2962ff]" : "text-white"
                                                    }`}
                                            >
                                                {market.symbol}
                                            </span>
                                        </div>

                                        <div className="text-right">
                                            <span className="font-mono text-white font-medium">
                                                {formatPrice(market.price)}
                                            </span>
                                        </div>

                                        <div
                                            className={`flex items-center justify-end gap-1 text-right ${isPositive ? "text-[#089981]" : "text-[#f23645]"
                                                }`}
                                        >
                                            {isPositive ? (
                                                <TrendingUp className="w-3 h-3" />
                                            ) : (
                                                <TrendingDown className="w-3 h-3" />
                                            )}
                                            <span className="font-mono font-medium text-sm">
                                                {isPositive ? "+" : ""}
                                                {market.change24h.toFixed(2)}%
                                            </span>
                                        </div>

                                        <div className="text-right">
                                            <span className="font-mono text-[#787b86] text-sm">
                                                {formatVolume(market.volume)}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}