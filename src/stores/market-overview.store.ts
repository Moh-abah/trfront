import { create } from "zustand";
import { MarketData } from "@/services/api/market-overview.service";

export interface MarketOverviewState {
  // Market data
  markets: MarketData[];
  isLoading: boolean;
  isConnected: boolean;
  lastUpdate: Date | null;

  // Actions
  setMarkets: (markets: MarketData[]) => void;
  updateMarket: (market: MarketData) => void;
  setLoading: (loading: boolean) => void;
  setConnected: (connected: boolean) => void;
  setLastUpdate: (date: Date) => void;
  getMarketBySymbol: (symbol: string) => MarketData | undefined;
  searchMarkets: (query: string) => MarketData[];
}

export const useMarketOverviewStore = create<MarketOverviewState>((set, get) => ({
  // Initial state
  markets: [],
  isLoading: false,
  isConnected: false,
  lastUpdate: null,

  // Actions
  setMarkets: (markets) =>
    set({ markets, lastUpdate: new Date(), isLoading: false }),

  updateMarket: (market) =>
    set((state) => {
      const existingIndex = state.markets.findIndex((m) => m.symbol === market.symbol);

      if (existingIndex !== -1) {
        // Update existing market
        const newMarkets = [...state.markets];
        newMarkets[existingIndex] = market;
        return { markets: newMarkets, lastUpdate: new Date() };
      } else {
        // Add new market
        return { markets: [...state.markets, market], lastUpdate: new Date() };
      }
    }),

  setLoading: (loading) => set({ isLoading: loading }),

  setConnected: (connected) => set({ isConnected: connected }),

  setLastUpdate: (date) => set({ lastUpdate: date }),

  getMarketBySymbol: (symbol) => {
    return get().markets.find((m) => m.symbol === symbol);
  },

  searchMarkets: (query) => {
    const markets = get().markets;
    if (!query) return markets;

    const lowerQuery = query.toLowerCase();
    return markets.filter((m) =>
      m.symbol.toLowerCase().includes(lowerQuery)
    );
  },
}));
