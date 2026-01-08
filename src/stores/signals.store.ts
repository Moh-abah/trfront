
import { create } from 'zustand';
import { signalsService, TradingSignal, SignalRequest } from '@/services/api/signals.service';

interface SignalStore {
    signals: TradingSignal[];
    activeSignals: TradingSignal[];
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date;

    signalStats: {
        total: number;
        buy: number;
        sell: number;
        active: number;
        winRate: number;
    };

    // ✅ Actions using real endpoints
    loadSignals: (request: SignalRequest) => Promise<TradingSignal[]>;
    loadSignalDetails: (id: string) => Promise<TradingSignal | null>;
    markSignalAsRead: (id: string) => Promise<void>;
    archiveSignal: (id: string) => Promise<void>;
    deleteSignal: (id: string) => Promise<void>;
    refreshSignals: (request: SignalRequest) => Promise<TradingSignal[]>;

    // ✅ Real data functions
    applyIndicators: (config: {
        symbol: string;
        timeframe: string;
        indicators: Array<{ name: string; params?: any }>;
    }) => Promise<any>;

    getAvailableIndicators: (category?: string) => Promise<any[]>;
    getIndicatorParams: (indicatorName: string) => Promise<any>;
    runBacktest: (config: any) => Promise<any>;
}

export const useSignalStore = create<SignalStore>((set, get) => ({
    signals: [],
    activeSignals: [],
    isLoading: false,
    error: null,
    lastUpdated: new Date(),

    signalStats: {
        total: 0,
        buy: 0,
        sell: 0,
        active: 0,
        winRate: 0,
    },

    loadSignals: async (request) => {
        set({ isLoading: true, error: null });

        try {
            const signals = await signalsService.getSignals(request);

            const stats = await signalsService.getSignalStats(signals);

            set({
                signals,
                activeSignals: signals.filter(s => s.status === 'active'),
                signalStats: stats,
                lastUpdated: new Date(),
                isLoading: false,
            });

            return signals;
        } catch (error: any) {
            set({
                error: error.message || 'Failed to load signals',
                isLoading: false,
            });
            return [];
        }
    },

    loadSignalDetails: async (id) => {
        // نبحث في الإشارات المحلية لأن ليس لدينا endpoint لكل إشارة
        const signal = get().signals.find(s => s.id === id);
        return signal || null;
    },

    markSignalAsRead: async (id) => {
        // تحديث محلي فقط - لا يوجد endpoint حقيقي
        set(state => ({
            signals: state.signals.map(signal =>
                signal.id === id ? { ...signal, read: true } : signal
            ),
        }));
    },

    archiveSignal: async (id) => {
        // تحديث محلي فقط - لا يوجد endpoint حقيقي
        set(state => ({
            signals: state.signals.filter(signal => signal.id !== id),
        }));
    },

    deleteSignal: async (id) => {
        // تحديث محلي فقط
        set(state => ({
            signals: state.signals.map(signal =>
                signal.id === id ? { ...signal, status: 'expired' } : signal
            ),
        }));
    },

    refreshSignals: async (request) => {
        const signals = await get().loadSignals(request);
        set({ lastUpdated: new Date() });
        return signals;
    },

    applyIndicators: async (config) => {
        try {
            const request = {
                symbol: config.symbol,
                timeframe: config.timeframe,
                market: 'crypto',
                indicators: config.indicators,
                days: 30,
            };

            return await signalsService.applyIndicators(request);
        } catch (error) {
            console.error('Error applying indicators:', error);
            return null;
        }
    },

    getAvailableIndicators: async (category?: string) => {
        return await signalsService.getAvailableIndicators(category);
    },

    getIndicatorParams: async (indicatorName: string) => {
        return await signalsService.getIndicatorParams(indicatorName);
    },

    runBacktest: async (config) => {
        return await signalsService.backtestSignals(config);
    },
}));