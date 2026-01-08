// import { create } from 'zustand';
// import { MarketSymbol, MarketData, MarketSummary, PriceUpdate } from '../types';

// interface MarketState {
//     // الرموز المتاحة
//     symbols: MarketSymbol[];

//     // بيانات السوق الحية
//     marketData: Record<string, MarketData>;

//     // ملخص السوق
//     marketSummary: MarketSummary | null;

//     // الرموز المفضلة
//     favorites: string[];

//     // حالات التحميل
//     isLoading: boolean;
//     error: string | null;

//     // الإجراءات
//     setSymbols: (symbols: MarketSymbol[]) => void;
//     setMarketData: (symbol: string, data: MarketData) => void;
//     updateMarketData: (updates: PriceUpdate[]) => void;
//     setMarketSummary: (summary: MarketSummary) => void;
//     toggleFavorite: (symbol: string) => void;
//     setLoading: (loading: boolean) => void;
//     setError: (error: string | null) => void;
//     clearError: () => void;
//     getFavoriteSymbols: () => MarketSymbol[];
//     getSymbolData: (symbol: string) => MarketData | undefined;
//     searchSymbols: (query: string) => MarketSymbol[];
// }

// export const useMarketStore = create<MarketState>((set, get) => ({
//     symbols: [],
//     marketData: {},
//     marketSummary: null,
//     favorites: [],
//     isLoading: false,
//     error: null,

//     setSymbols: (symbols) => set({ symbols }),

//     setMarketData: (symbol, data) =>
//         set((state) => ({
//             marketData: {
//                 ...state.marketData,
//                 [symbol]: data
//             }
//         })),

//     updateMarketData: (updates) =>
//         set((state) => {
//             const newMarketData = { ...state.marketData };

//             updates.forEach((update) => {
//                 const existingData = newMarketData[update.symbol];

//                 if (existingData) {
//                     newMarketData[update.symbol] = {
//                         ...existingData,
//                         price: update.price,
//                         change: update.change,
//                         changePercent: update.changePercent,
//                         volume: update.volume,
//                         lastUpdate: new Date().toISOString()
//                     };
//                 }
//             });

//             return { marketData: newMarketData };
//         }),

//     setMarketSummary: (summary) => set({ marketSummary: summary }),

//     toggleFavorite: (symbol) =>
//         set((state) => {
//             const isFavorite = state.favorites.includes(symbol);
//             return {
//                 favorites: isFavorite
//                     ? state.favorites.filter((s) => s !== symbol)
//                     : [...state.favorites, symbol]
//             };
//         }),

//     setLoading: (loading) => set({ isLoading: loading }),

//     setError: (error) => set({ error }),

//     clearError: () => set({ error: null }),

//     getFavoriteSymbols: () => {
//         const { symbols, favorites } = get();
//         return symbols.filter((symbol) => favorites.includes(symbol.symbol));
//     },

//     getSymbolData: (symbol) => {
//         const { marketData } = get();
//         return marketData[symbol];
//     },

//     searchSymbols: (query) => {
//         const { symbols } = get();
//         const lowercaseQuery = query.toLowerCase();

//         return symbols.filter(
//             (symbol) =>
//                 symbol.symbol.toLowerCase().includes(lowercaseQuery) ||
//                 symbol.name.toLowerCase().includes(lowercaseQuery) ||
//                 symbol.description?.toLowerCase().includes(lowercaseQuery)
//         );
//     }
// }));