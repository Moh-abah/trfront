// stores/signals.store.ts
import { create } from 'zustand';
import axios from 'axios';

interface Signal {
    id: string;
    symbol: string;
    type: 'buy' | 'sell';
    strategy: string;
    profitLoss: number;
    timestamp: string;
}

interface SignalStore {
    activeSignals: Signal[];
    recentSignals: Signal[];
    signalStats: { total: number; winRate: number; avgReturn: number };
    loadSignalss: (params?: { symbol?: string; market?: string; timeframe?: string; days?: number; indicators?: any[] }) => Promise<void>;
}

export const useSignalStoress = create<SignalStore>((set) => ({
    activeSignals: [],
    recentSignals: [],
    signalStats: { total: 0, winRate: 0, avgReturn: 0 },

    loadSignalss: async (params) => {
        try {
            const res = await axios.post('/api/v1/indicators/signals', {
                symbol: params?.symbol || 'BTCUSDT',
                market: params?.market || 'crypto',
                timeframe: params?.timeframe || '1h',
                days: params?.days || 30,
                indicators: params?.indicators || [
                    { name: 'SMA', period: 14 },
                    { name: 'RSI', period: 14 },
                ],
            });

            const signals = res.data.signals || [];

            // تحديث الـ store
            set({
                activeSignals: signals.filter((s: any) => s.isActive),
                recentSignals: signals.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10),
                signalStats: {
                    total: signals.length,
                    winRate: calculateWinRate(signals),
                    avgReturn: calculateAvgReturn(signals),
                },
            });
        } catch (error) {
            console.error('Failed to load signals:', error);
        }
    },
}));

function calculateWinRate(signals: any[]) {
    const wins = signals.filter((s) => s.profitLoss >= 0).length;
    return signals.length ? Math.round((wins / signals.length) * 100) : 0;
}

function calculateAvgReturn(signals: any[]) {
    const total = signals.reduce((acc, s) => acc + s.profitLoss, 0);
    return signals.length ? parseFloat((total / signals.length).toFixed(2)) : 0;
}
