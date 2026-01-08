
// @ts-nocheck
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useMarketStore } from './market.store';
import { useBacktestStore } from './backtest.store';
import { useSettingsStore } from './settings.store';
import { useSignalStore } from './signals.store';
import { useChartStore } from './chart.store';
import { useUIStore } from './ui.store';

// ✅ إزالة استخدام useAuthStore مؤقتاً

// Export individual stores
export {
    useMarketStore,
    useSignalStore,
    useChartStore,
    useBacktestStore,
    useSettingsStore,
    useUIStore
};

interface RootStore {
    // Initialize all stores
    initialize: () => void;
    reset: () => void;

    // Global states
    isInitialized: boolean;
    isLoading: boolean;
    error: string | null;

    // Global actions
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearError: () => void;

    // Data synchronization
    syncAllData: () => Promise<void>;
    clearAllCache: () => void;

    // Theme and preferences
    theme: 'light' | 'dark' | 'auto';
    toggleTheme: () => void;
    setTheme: (theme: 'light' | 'dark' | 'auto') => void;
}

export const useRootStore = create<RootStore>()(
    persist(
        (set, get) => ({
            isInitialized: false,
            isLoading: false,
            error: null,
            theme: 'auto',

            initialize: () => {
                if (get().isInitialized) return;

                // Initialize all stores
                useMarketStore.getState().loadMarketData();
                useSettingsStore.getState().loadSettings();

                set({ isInitialized: true });
            },

            reset: () => {
                // Reset all stores (بدون auth)
                useMarketStore.getState().reset();
                useSignalStore.getState().reset();
                useChartStore.getState().reset();
                useBacktestStore.getState().reset();
                useSettingsStore.getState().reset();
                useUIStore.getState().reset();

                set({ isInitialized: false, error: null });
            },

            setLoading: (loading) => set({ isLoading: loading }),
            setError: (error) => set({ error }),
            clearError: () => set({ error: null }),

            syncAllData: async () => {
                set({ isLoading: true });
                try {
                    await Promise.all([
                        useMarketStore.getState().loadMarketData(),
                        useSignalStore.getState().loadSignals(),
                        useSettingsStore.getState().loadSettings()
                    ]);
                } catch (error) {
                    set({ error: error instanceof Error ? error.message : 'Sync failed' });
                } finally {
                    set({ isLoading: false });
                }
            },

            clearAllCache: () => {
                localStorage.removeItem('market-store');
                localStorage.removeItem('signals-store');
                localStorage.removeItem('chart-store');
                localStorage.removeItem('backtest-store');
                localStorage.removeItem('settings-store');
                localStorage.removeItem('ui-store');
                localStorage.removeItem('root-store');
            },

            toggleTheme: () => {
                const current = get().theme;
                let newTheme: 'light' | 'dark' | 'auto';

                if (current === 'auto') {
                    newTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'light' : 'dark';
                } else if (current === 'light') {
                    newTheme = 'dark';
                } else {
                    newTheme = 'auto';
                }

                set({ theme: newTheme });

                // Apply theme to document
                if (newTheme === 'dark' || (newTheme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            },

            setTheme: (theme) => {
                set({ theme });

                if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            }
        }),
        {
            name: 'root-store',
            partialize: (state) => ({
                theme: state.theme,
                isInitialized: state.isInitialized
            })
        }
    )
);

// ✅ تعديل هذه الدالة لعدم تضمين resetAuth
export const useResetStores = () => {
    const resetMarket = useMarketStore((state) => state.reset);
    const resetSignals = useSignalStore((state) => state.reset);
    const resetChart = useChartStore((state) => state.reset);
    const resetBacktest = useBacktestStore((state) => state.reset);
    const resetSettings = useSettingsStore((state) => state.reset);
    const resetUI = useUIStore((state) => state.reset);
    // تم إزالة resetAuth

    return () => {
        resetMarket();
        resetSignals();
        resetChart();
        resetBacktest();
        resetSettings();
        resetUI();
        // تم إزالة resetAuth()
    };
};