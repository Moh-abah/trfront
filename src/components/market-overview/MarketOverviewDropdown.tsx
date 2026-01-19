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
                <div className="grid grid-cols-4 gap-4 px-4 py-2 border-b border-border">
                    {[...Array(4)].map((_, i) => (
                        <div key={i}>
                            <div className="h-4 bg-muted rounded animate-pulse"></div>
                        </div>
                    ))}
                </div>

                {/* Rows Skeleton */}
                {skeletonItems.map((i) => (
                    <div key={i} className="grid grid-cols-4 gap-4 px-4 py-3 border-b border-border/50">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>
                            <div className="space-y-2">
                                <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                            </div>
                        </div>
                        {[...Array(3)].map((_, j) => (
                            <div key={j} className="text-right">
                                <div className="h-4 w-16 bg-muted rounded animate-pulse inline-block"></div>
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
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-start justify-center pt-20">
            <div className="w-[800px] max-h-[80vh] bg-card border border-border rounded-lg shadow-2xl flex flex-col animate-scale-in backdrop-blur-sm">
                {/* Header */}
                <div className="h-14 flex items-center justify-between px-4 border-b border-border bg-card">
                    <div className="flex items-center gap-2">


                    </div>
                    <button
                        onClick={onClose}
                        className="px-3 py-1 text-sm bg-secondary text-foreground rounded hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                        إغلاق
                    </button>
                </div>

                {/* Search and Filter Bar */}
                <div className="p-4 border-b border-border bg-card space-y-3">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="ابحث عن عملة..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pr-10 pl-4 py-2.5 bg-background border border-input rounded text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                            autoFocus
                        />
                    </div>

                    {/* Sort Controls */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs text-muted-foreground font-medium">ترتيب حسب:</span>

                        {/* Sort By Buttons */}
                        <div className="flex gap-1">
                            <button
                                onClick={() => setSortBy("price")}
                                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${sortBy === "price"
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                    : "bg-secondary text-foreground hover:bg-accent hover:text-accent-foreground"
                                    }`}
                            >
                                السعر
                            </button>
                            <button
                                onClick={() => setSortBy("change24h")}
                                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${sortBy === "change24h"
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                    : "bg-secondary text-foreground hover:bg-accent hover:text-accent-foreground"
                                    }`}
                            >
                                التغير
                            </button>
                            <button
                                onClick={() => setSortBy("volume")}
                                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${sortBy === "volume"
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                    : "bg-secondary text-foreground hover:bg-accent hover:text-accent-foreground"
                                    }`}
                            >
                                الحجم
                            </button>
                        </div>

                        {/* Sort Order Toggle */}
                        <button
                            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-secondary text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
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
                {sortedMarkets.length === 0 && (
                    <div className="flex-1 p-4 bg-card">
                        <DropdownSkeletonLoader />
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && sortedMarkets.length === 0 && (
                    <div className="flex-1 flex items-center justify-center p-8 bg-card">
                        <p className="text-muted-foreground text-sm">لا توجد نتائج</p>
                    </div>
                )}

                {/* Markets List */}
                {!isLoading && sortedMarkets.length > 0 && (
                    <div className="flex-1 overflow-y-auto bg-card">
                        {/* Header Row */}
                        <div className="sticky top-0 bg-card px-4 py-2 border-b border-border grid grid-cols-4 gap-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider z-10">
                            <div>العملة</div>
                            <div className="text-right">السعر</div>
                            <div className="text-right">التغير 24س</div>
                            <div className="text-right">الحجم</div>
                        </div>

                        {/* Market Items */}
                        <div className="divide-y divide-border">
                            {sortedMarkets.map((market) => {
                                const isPositive = market.change24h >= 0;
                                const isSelected = market.symbol === currentSymbol;

                                return (
                                    <button
                                        key={market.symbol}
                                        onClick={() => handleMarketClick(market.symbol)}
                                        className={`w-full px-4 py-3 grid grid-cols-4 gap-4 hover:bg-secondary/50 transition-colors ${isSelected ? "bg-accent/30 border-l-2 border-l-primary" : ""
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`font-mono font-bold ${isSelected ? "text-primary" : "text-foreground"
                                                    }`}
                                            >
                                                {market.symbol}
                                            </span>
                                        </div>

                                        <div className="text-right">
                                            <span className="font-mono text-foreground font-medium">
                                                {formatPrice(market.price)}
                                            </span>
                                        </div>

                                        <div
                                            className={`flex items-center justify-end gap-1 text-right ${isPositive ? "text-green-500 dark:text-[--color-trading-success]" : "text-red-500 dark:text-[--color-trading-error]"
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
                                            <span className="font-mono text-muted-foreground text-sm">
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