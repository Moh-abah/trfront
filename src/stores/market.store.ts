
// @ts-nocheck

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
    FilterCriteria,
    FilterResult,
    FilterPreset,
    MarketType,
    PriceUpdate,
    MarketSymbol
} from '@/types/filter.types';
import { filterService } from '@/services/api/filter.service';
import { marketService } from '@/services/api/market.service';

interface MarketStore {
    // Data State
    symbols: MarketSymbol[];
    filteredSymbols: string[];
    prices: Record<string, PriceUpdate>;
    marketSummary: any | null;

    // Filter State
    filterCriteria: FilterCriteria | null;
    filterPresets: FilterPreset[];
    filterResult: FilterResult | null;

    // UI State
    isFiltering: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    loadMarketData: (market: MarketType) => Promise<void>;
    updatePrices: (updates: PriceUpdate[]) => void;
    applyFilter: (market: MarketType, criteria: FilterCriteria, limit?: number) => Promise<void>;
    quickFilter: (market: MarketType, filterType: string, value?: any) => Promise<void>;
    clearFilters: () => void;
    loadFilterPresets: () => Promise<void>;
    saveFilterPreset: (preset: Omit<FilterPreset, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    deleteFilterPreset: (id: string) => Promise<void>;


    initializeMarketData: (market: MarketType) => Promise<void>;
    processWebSocketData: (data: any[]) => void;
}

// Helper to convert filter criteria to backend format
const convertToFilterGroup = (criteria: FilterCriteria) => ({
    operator: criteria.logic,
    conditions: criteria.conditions.map(c => ({
        field: c.field,
        operator: c.operator,
        value: c.value,
        value_type: typeof c.value
    }))
});

// Helper to convert backend response to frontend format
const convertToFilterResult = (result: any): FilterResult => ({
    symbols: result.symbols || [],
    total: result.total_count || result.total || 0,
    filtered: result.filtered_count || result.filtered || 0,
    executionTime: result.execution_time || 0,
    metadata: result.metadata || {}
});

// Helper to convert backend preset to frontend format
const convertToFilterPreset = (preset: any): FilterPreset => ({
    id: preset.id,
    name: preset.name,
    description: preset.description,
    criteria: {
        conditions: preset.criteria?.conditions?.map((cond: any) => ({
            field: cond.field,
            operator: cond.operator,
            value: cond.value
        })) || [],
        logic: preset.criteria?.operator || 'AND'
    },
    market: preset.market,
    createdAt: preset.created_at,
    updatedAt: preset.updated_at,
    tags: preset.tags || [],
    isPublic: preset.is_public || false,
    authorId: preset.author_id
});






// دالة لحساب القوائم من الأسعار المحلية (يجب إضافتها خارج create)
const calculateTopListsFromPrices = (prices: Record<string, PriceUpdate>) => {
    const symbols = Object.keys(prices);

    if (symbols.length === 0) {
        return {
            topGainers: [],
            topLosers: [],
            volumeLeaders: []
        };
    }

    // فرز حسب التغير اليومي (تصاعدي)
    const sortedByChange = [...symbols].sort((a, b) => {
        const changeA = prices[a]?.change24h || 0;
        const changeB = prices[b]?.change24h || 0;
        return changeB - changeA; // الأعلى أولاً
    });

    // فرز حسب الحجم (تنازلي)
    const sortedByVolume = [...symbols].sort((a, b) => {
        const volumeA = prices[a]?.volume24h || 0;
        const volumeB = prices[b]?.volume24h || 0;
        return volumeB - volumeA; // الأعلى أولاً
    });

    return {
        topGainers: sortedByChange.slice(0, 10), // أعلى 10 صعوداً
        topLosers: sortedByChange.reverse().slice(0, 10), // أعلى 10 هبوطاً
        volumeLeaders: sortedByVolume.slice(0, 10) // أعلى 10 حجم
    };
};



export const useMarketStore = create<MarketStore>()(
    persist(
        (set, get) => ({
            // Initial State
            symbols: [],
            filteredSymbols: [],
            prices: {},
            marketSummary: null,
            filterCriteria: null,
            filterPresets: [],
            filterResult: null,
            isFiltering: false,
            isLoading: false,
            error: null,

            // Load market data (symbols + initial prices)
            loadMarketData: async (market) => {
                set({ isLoading: true, error: null });
                try {
                    console.log(`🔄 Loading ${market} market data...`);

                    console.log(`🔄 Loading ${market} market data...`);

                    // 1. Load symbols
                    const symbolsData = await marketService.getSymbols(market);

                    // ✅ تحقق مزدوج: إذا كانت البيانات فارغة أو undefined
                    if (!symbolsData || symbolsData.length === 0) {
                        throw new Error(`No symbols returned for ${market}`);
                    }

                    console.log(`📦 Received ${symbolsData.length} symbols`);

                    // 2. Format symbols (الآن آمن 100%)
                    const formattedSymbols: MarketSymbol[] = symbolsData.map(s => ({
                        symbol: s.symbol,
                        name: s.name || s.symbol,
                        market: market,
                        type: s.type || market
                    }));


                    
                    
                    // 3. Load market summary (stocks only)
                    let summary = null;
                    if (market === 'stocks') {
                        try {
                            summary = await marketService.getMarketSummary();
                        } catch (e) {
                            console.warn('Market summary not available');
                        }
                    }

                    // 4. Get initial prices for first 20 symbols
                    const initialSymbols = formattedSymbols.slice(0, 20).map(s => s.symbol);
                    const priceUpdates = await marketService.batchGetPrices(
                        initialSymbols.map(s => ({ market, symbol: s }))
                    );

                    // 5. Transform prices to record
                    const pricesRecord: Record<string, PriceUpdate> = {};
                    priceUpdates.forEach(update => {
                        if (update?.symbol) {
                            pricesRecord[update.symbol] = {
                                symbol: update.symbol,
                                price: update.price || update.price || 0,
                                change24h: update.change24h || update.change_24h || 0,
                                volume24h: update.volume24h || update.volume_24h || 0,
                                marketCap: update.marketCap || update.market_cap || 0,
                                timestamp: update.timestamp || new Date().toISOString()
                            };
                        }
                    });

                    // 6. Update store
                    set({
                        symbols: formattedSymbols,
                        filteredSymbols: initialSymbols,
                        prices: pricesRecord,
                        marketSummary: summary,
                        isLoading: false,
                        filterResult: {
                            symbols: initialSymbols,
                            total: formattedSymbols.length,
                            filtered: initialSymbols.length,
                            executionTime: 0,
                            metadata: {}
                        }
                    });

                } catch (error: any) {
                    console.error(`❌ Failed to load ${market}:`, error);
                    set({
                        isLoading: false,
                        error: error.message || 'Failed to load market data',
                        symbols: [],
                        filteredSymbols: [],
                        prices: {}
                    });
                }
            },


            initializeMarketData: async (market) => {
                set({ isLoading: true, error: null });
                try {
                    console.log(`🚀 Initializing ${market} market data via WebSocket...`);

                    // 1. تهيئة المتغيرات الأساسية
                    set({
                        symbols: [],
                        prices: {},
                        marketSummary: null,
                        topGainers: [],
                        topLosers: [],
                        volumeLeaders: [],
                        filteredSymbols: []
                    });

                    // 2. للأسهم فقط: نستخدم API التقليدي
                    if (market === 'stocks') {
                        try {
                            const [symbolsData, summary, topMovers] = await Promise.all([
                                marketService.getSymbols(market),
                                marketService.getMarketSummary(),
                                marketService.getTopMovers()
                            ]);

                            // معالجة بيانات الأسهم
                            const formattedSymbols: MarketSymbol[] = symbolsData.map(s => ({
                                symbol: s.symbol,
                                name: s.name || s.symbol,
                                market: market,
                                type: s.type || market
                            }));

                            set({
                                symbols: formattedSymbols,
                                marketSummary: summary,
                                topGainers: topMovers.gainers?.map((g: any) => g.symbol) || [],
                                topLosers: topMovers.losers?.map((l: any) => l.symbol) || [],
                                volumeLeaders: topMovers.volumeLeaders?.map((v: any) => v.symbol) || [],
                                filteredSymbols: formattedSymbols.slice(0, 20).map(s => s.symbol),
                                isLoading: false
                            });
                        } catch (error) {
                            console.error('Failed to load stocks data:', error);
                            throw error;
                        }
                    }
                    // 3. للعملات المشفرة: سنعتمد كلياً على WebSocket
                    // لا نقوم بأي تحميل هنا، سننتظر بيانات WebSocket
                    else if (market === 'crypto') {
                        set({
                            isLoading: false,
                            // سنترك الرموز فارغة، ستأتي من WebSocket
                        });
                    }

                } catch (error: any) {
                    console.error(`❌ Failed to initialize ${market}:`, error);
                    set({
                        isLoading: false,
                        error: error.message || `Failed to initialize ${market} data`,
                        symbols: [],
                        prices: {},
                        filteredSymbols: []
                    });
                }
            },

            // دالة لمعالجة بيانات WebSocket
            processWebSocketData: (webSocketData) => {
                if (!webSocketData || !Array.isArray(webSocketData)) return;

                console.log(`📊 Processing ${webSocketData.length} WebSocket updates`);

                set((state) => {
                    // 1. تحديث الأسعار
                    const newPrices = { ...state.prices };
                    const newSymbols: MarketSymbol[] = [...state.symbols];

                    webSocketData.forEach((item: any) => {
                        const symbol = item.symbol;

                        // تحديث/إضافة السعر
                        if (symbol) {
                            newPrices[symbol] = {
                                symbol: symbol,
                                price: parseFloat(item.price) || 0,
                                change24h: parseFloat(item.change24h) || 0,
                                volume24h: parseFloat(item.volume) || 0,
                                marketCap: 0, // نستطيع إضافته لاحقاً إذا كان متوفراً
                                timestamp: new Date().toISOString()
                            };

                            // إضافة الرمز إذا لم يكن موجوداً
                            if (!state.symbols.find(s => s.symbol === symbol)) {
                                newSymbols.push({
                                    symbol: symbol,
                                    name: symbol.replace('USDT', '').replace('USDC', ''),
                                    market: 'crypto' as MarketType,
                                    type: 'crypto'
                                });
                            }
                        }
                    });

                    // 2. حساب القوائم المتصدرة
                    const symbolList = Object.keys(newPrices);
                    const calculatedLists = calculateTopListsFromPrices(newPrices);

                    // 3. حساب ملخص السوق للعملات المشفرة
                    let newMarketSummary = state.marketSummary;
                    if (state.symbols.length > 0 && state.symbols[0]?.market === 'crypto') {
                        const totalVolume = webSocketData.reduce((sum, item) => sum + (parseFloat(item.volume) || 0), 0);
                        const totalMarketCap = webSocketData.reduce((sum, item) => {
                            const price = parseFloat(item.price) || 0;
                            const volume = parseFloat(item.volume) || 0;
                            return sum + (price * volume / 1000000); // تقدير تقريبي للقيمة السوقية
                        }, 0);

                        newMarketSummary = {
                            market: 'crypto',
                            totalVolume: totalVolume,
                            totalMarketCap: totalMarketCap,
                            change24h: calculatedLists.topGainers.length > 0
                                ? parseFloat(newPrices[calculatedLists.topGainers[0]]?.change24h?.toString() || '0')
                                : 0,
                            timestamp: new Date().toISOString()
                        };
                    }

                    // 4. تحديث الحالة
                    return {
                        symbols: newSymbols,
                        prices: newPrices,
                        marketSummary: newMarketSummary,
                        topGainers: calculatedLists.topGainers,
                        topLosers: calculatedLists.topLosers,
                        volumeLeaders: calculatedLists.volumeLeaders,
                        filteredSymbols: symbolList.slice(0, 20)
                    };
                });
            },
          

            updatePrices: (updates) => {
                console.log(`🔄 Updating ${updates.length} prices in store`);

                set((state) => {
                    const newPrices = { ...state.prices };

                    updates.forEach(update => {
                        if (update?.symbol) {
                            // Ensure all required fields exist
                            const validatedUpdate: PriceUpdate = {
                                symbol: update.symbol,
                                price: update.price || newPrices[update.symbol]?.price || 0,
                                change24h: update.change24h || newPrices[update.symbol]?.change24h || 0,
                                volume24h: update.volume24h || newPrices[update.symbol]?.volume24h || 0,
                                marketCap: update.marketCap || newPrices[update.symbol]?.marketCap || 0,
                                timestamp: update.timestamp || new Date().toISOString()
                            };
                            newPrices[update.symbol] = validatedUpdate;
                        }
                    });

                    return { prices: newPrices };
                });
            },

            // Apply filter
            applyFilter: async (market, criteria, limit = 50) => {
                set({ isFiltering: true, error: null });
                try {
                    const filterGroup = convertToFilterGroup(criteria);
                    const result = await filterService.filterSymbols({
                        market,
                        criteria: filterGroup,
                        limit,
                        offset: 0,
                        sort_by: 'volume_24h',
                        sort_order: 'asc'
                    });

                    const convertedResult = convertToFilterResult(result);

                    // Fetch missing prices
                    const currentPrices = get().prices;
                    const missingSymbols = convertedResult.symbols.filter(s => !currentPrices[s]);

                    if (missingSymbols.length > 0) {
                        const newPrices = await marketService.batchGetPrices(
                            missingSymbols.map(s => ({ market, symbol: s }))
                        );
                        get().updatePrices(newPrices);
                    }

                    set({
                        filteredSymbols: convertedResult.symbols,
                        filterResult: convertedResult,
                        filterCriteria: criteria,
                        isFiltering: false
                    });
                } catch (error: any) {
                    console.error('Filter failed:', error);
                    set({
                        isFiltering: false,
                        error: 'Failed to apply filter: ' + error.message
                    });
                }
            },

            // Quick filter
            quickFilter: async (market, filterType, value) => {
                const criteriaMap: Record<string, FilterCriteria> = {
                    top_gainers: {
                        conditions: [{ field: 'change_24h', operator: 'greater_than', value: value || 5 }],
                        logic: 'AND'
                    },
                    oversold: {
                        conditions: [{ field: 'rsi', operator: 'less_than', value: 30 }],
                        logic: 'AND'
                    },
                    high_volume: {
                        conditions: [{ field: 'volume_24h', operator: 'greater_than', value: value || 1000000 }],
                        logic: 'AND'
                    },
                    bullish: {
                        conditions: [{ field: 'change_24h', operator: 'greater_than', value: 0 }],
                        logic: 'AND'
                    },
                    bearish: {
                        conditions: [{ field: 'change_24h', operator: 'less_than', value: 0 }],
                        logic: 'AND'
                    }
                };

                const criteria = criteriaMap[filterType] || { conditions: [], logic: 'AND' };
                await get().applyFilter(market, criteria);
            },

            // Clear filters
            clearFilters: () => {
                const { symbols } = get();
                const defaultSymbols = symbols.slice(0, 20).map(s => s.symbol);
                set({
                    filterCriteria: null,
                    filteredSymbols: defaultSymbols,
                    filterResult: {
                        symbols: defaultSymbols,
                        total: symbols.length,
                        filtered: defaultSymbols.length,
                        executionTime: 0,
                        metadata: {}
                    }
                });
            },

            // Load filter presets
            loadFilterPresets: async () => {
                try {
                    const presets = await filterService.getPresets();
                    set({ filterPresets: presets.map(convertToFilterPreset) });
                } catch (error) {
                    console.error('Failed to load presets:', error);
                }
            },

            // Save filter preset
            saveFilterPreset: async (presetData) => {
                try {
                    const saved = await filterService.savePreset({
                        ...presetData,
                        criteria: convertToFilterGroup(presetData.criteria)
                    });
                    set(state => ({
                        filterPresets: [...state.filterPresets, convertToFilterPreset(saved)]
                    }));
                } catch (error) {
                    console.error('Failed to save preset:', error);
                    throw error;
                }
            },

            // Delete filter preset
            deleteFilterPreset: async (id) => {
                try {
                    await filterService.deletePreset(id);
                    set(state => ({
                        filterPresets: state.filterPresets.filter(p => p.id !== id)
                    }));
                } catch (error) {
                    console.error('Failed to delete preset:', error);
                    throw error;
                }
            }
        }),
        {
            name: 'market-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                filterPresets: state.filterPresets,
                symbols: state.symbols
            })
        }
    )
);