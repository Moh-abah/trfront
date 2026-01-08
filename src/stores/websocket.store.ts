
// @ts-nocheck
import { create } from 'zustand';
import { streamManager } from '@/services/websocket/stream.manager';
import {
    PriceUpdateEvent,
    TradeEvent,
    CandleEvent,
    SignalEvent,
    Subscription,
    WebSocketEventType,
} from '@/services/websocket/events';

interface WebSocketState {
    // الحالة
    isConnected: boolean;
    connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'reconnecting';
    error: string | null;
    isLoading: boolean;

    // البيانات
    prices: Record<string, PriceUpdateEvent>;
    trades: TradeEvent[];
    candles: Record<string, CandleEvent[]>; // key: symbol:timeframe
    signals: SignalEvent[];
    activeSubscriptions: Subscription[];

    // الإجراءات
    connect: () => Promise<void>;
    disconnect: () => void;
    reconnect: () => void;

    subscribeToPrice: (symbols: string[]) => void;
    unsubscribeFromPrice: (symbols: string[]) => void;

    subscribeToCandles: (symbol: string, timeframe: string) => void;
    unsubscribeFromCandles: (symbol: string, timeframe: string) => void;

    subscribeToSignals: (symbol: string, strategyId?: string) => void;
    unsubscribeFromSignals: (symbol: string, strategyId?: string) => void;

    updatePrice: (data: PriceUpdateEvent) => void;
    addTrade: (data: TradeEvent) => void;
    updateCandle: (data: CandleEvent) => void;
    addSignal: (data: SignalEvent) => void;

    clearError: () => void;
    clearAllData: () => void;
}

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
    // الحالة الابتدائية
    isConnected: false,
    connectionStatus: 'disconnected',
    error: null,
    isLoading: false,

    // البيانات الابتدائية
    prices: {},
    trades: [],
    candles: {},
    signals: [],
    activeSubscriptions: [],

    // الاتصال
    connect: async () => {
        set({ isLoading: true, error: null });

        try {
            await streamManager.initialize();

            // تحديث الحالة بناءً على اتصال streamManager
            const checkConnection = () => {
                const isConnected = streamManager.isConnected();
                const status = streamManager.getConnectionStatus() as any;

                set({
                    isConnected,
                    connectionStatus: status,
                    isLoading: false,
                });

                if (isConnected) {
                    // تحديث الاشتراكات النشطة
                    const subscriptions = streamManager.getActiveStreams();
                    set({ activeSubscriptions: subscriptions });
                }
            };

            // التحقق من الاتصال فوراً
            checkConnection();

            // تحديث الحالة بشكل دوري
            const interval = setInterval(checkConnection, 5000);

            // تنظيف الفاصل عند الانفصال
            return () => clearInterval(interval);
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Connection failed',
                isLoading: false,
            });
        }
    },

    disconnect: () => {
        streamManager.shutdown();
        set({
            isConnected: false,
            connectionStatus: 'disconnected',
            activeSubscriptions: [],
        });
    },

    reconnect: () => {
        get().disconnect();
        get().connect();
    },

    // الاشتراكات
    subscribeToPrice: (symbols: string[]) => {
        symbols.forEach(symbol => {
            streamManager.startPriceStream([symbol], {
                onPriceUpdate: (data) => get().updatePrice(data),
                onError: (error) => set({ error: error.message }),
            });
        });

        // تحديث الاشتراكات النشطة
        const subscriptions = streamManager.getActiveStreams();
        set({ activeSubscriptions: subscriptions });
    },

    unsubscribeFromPrice: (symbols: string[]) => {
        symbols.forEach(symbol => {
            const streamId = `price:${symbol}`;
            streamManager.stopStream(streamId);
        });

        // تحديث الاشتراكات النشطة
        const subscriptions = streamManager.getActiveStreams();
        set({ activeSubscriptions: subscriptions });
    },

    subscribeToCandles: (symbol: string, timeframe: string) => {
        streamManager.startCandleStream(symbol, timeframe, {
            onCandle: (data) => get().updateCandle(data),
            onError: (error) => set({ error: error.message }),
        });

        // تحديث الاشتراكات النشطة
        const subscriptions = streamManager.getActiveStreams();
        set({ activeSubscriptions: subscriptions });
    },

    unsubscribeFromCandles: (symbol: string, timeframe: string) => {
        const streamId = `candles:${symbol}:${timeframe}`;
        streamManager.stopStream(streamId);

        // تحديث الاشتراكات النشطة
        const subscriptions = streamManager.getActiveStreams();
        set({ activeSubscriptions: subscriptions });
    },

    subscribeToSignals: (symbol: string, strategyId?: string) => {
        streamManager.startSignalStream(symbol, strategyId, {
            onSignal: (data) => get().addSignal(data),
            onError: (error) => set({ error: error.message }),
        });

        // تحديث الاشتراكات النشطة
        const subscriptions = streamManager.getActiveStreams();
        set({ activeSubscriptions: subscriptions });
    },

    unsubscribeFromSignals: (symbol: string, strategyId?: string) => {
        const streamId = strategyId
            ? `signals:${symbol}:${strategyId}`
            : `signals:${symbol}`;

        streamManager.stopStream(streamId);

        // تحديث الاشتراكات النشطة
        const subscriptions = streamManager.getActiveStreams();
        set({ activeSubscriptions: subscriptions });
    },

    // تحديث البيانات
    updatePrice: (data: PriceUpdateEvent) => {
        set((state) => ({
            prices: {
                ...state.prices,
                [data.symbol]: data,
            },
        }));
    },

    addTrade: (data: TradeEvent) => {
        set((state) => ({
            trades: [data, ...state.trades].slice(0, 100), // الحفاظ على آخر 100 صفقة
        }));
    },

    updateCandle: (data: CandleEvent) => {
        const key = `${data.symbol}:${data.timeframe}`;

        set((state) => {
            const existingCandles = state.candles[key] || [];
            let newCandles = [...existingCandles];

            // البحث عن شمعة موجودة في نفس الوقت
            const existingIndex = newCandles.findIndex(
                candle => candle.timestamp === data.timestamp
            );

            if (existingIndex !== -1) {
                // تحديث الشمعة الحالية
                newCandles[existingIndex] = data;
            } else {
                // إضافة شمعة جديدة
                newCandles = [data, ...newCandles];

                // الحفاظ على آخر 200 شمعة
                if (newCandles.length > 200) {
                    newCandles = newCandles.slice(0, 200);
                }
            }

            return {
                candles: {
                    ...state.candles,
                    [key]: newCandles,
                },
            };
        });
    },

    addSignal: (data: SignalEvent) => {
        set((state) => ({
            signals: [data, ...state.signals].slice(0, 50), // الحفاظ على آخر 50 إشارة
        }));
    },

    clearError: () => {
        set({ error: null });
    },

    clearAllData: () => {
        set({
            prices: {},
            trades: [],
            candles: {},
            signals: [],
            activeSubscriptions: [],
        });
    },
}));