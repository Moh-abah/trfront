// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';
// import {
//     BacktestConfig,
//     BacktestResult,
//     WalkForwardConfig,
//     WalkForwardResult,
//     MonteCarloConfig,
//     MonteCarloResult,
//     BacktestType,
//     LiveBacktestStats
// } from '../types/backtest.types';
// import { backtestService } from '../services/api/backtest.service';

// interface BacktestStore {
//     // الحالة الحالية
//     activeBacktestType: BacktestType;
//     currentConfig: BacktestConfig | WalkForwardConfig | MonteCarloConfig | null;
//     currentResult: BacktestResult | WalkForwardResult | MonteCarloResult | null;
//     liveStats: LiveBacktestStats | null;

//     // التاريخ والمحفوظات
//     backtestHistory: BacktestResult[];
//     savedConfigs: (BacktestConfig | WalkForwardConfig | MonteCarloConfig)[];

//     // حالة التحميل
//     isLoading: boolean;
//     isRunning: boolean;
//     error: string | null;

//     // Actions
//     setActiveBacktestType: (type: BacktestType) => void;
//     setCurrentConfig: (config: BacktestConfig | WalkForwardConfig | MonteCarloConfig | null) => void;
//     setCurrentResult: (result: BacktestResult | WalkForwardResult | MonteCarloResult | null) => void;
//     setLiveStats: (stats: LiveBacktestStats | null) => void;
//     setLoading: (loading: boolean) => void;
//     setRunning: (running: boolean) => void;
//     setError: (error: string | null) => void;

//     // Async Actions
//     runBacktest: (config: BacktestConfig) => Promise<void>;
//     runWalkForward: (config: WalkForwardConfig) => Promise<void>;
//     runMonteCarlo: (config: MonteCarloConfig) => Promise<void>;
//     loadBacktestHistory: () => Promise<void>;
//     saveConfig: (config: BacktestConfig | WalkForwardConfig | MonteCarloConfig) => void;
//     deleteSavedConfig: (index: number) => void;
//     deleteBacktestResult: (backtestId: string) => Promise<void>;
//     exportResults: (backtestId: string, format: 'csv' | 'json') => Promise<void>;

//     // WebSocket Actions
//     subscribeToLiveUpdates: (backtestId: string) => void;
//     unsubscribeFromLiveUpdates: () => void;
// }

// export const useBacktestStore = create<BacktestStore>()(
//     persist(
//         (set, get) => ({
//             activeBacktestType: 'basic',
//             currentConfig: null,
//             currentResult: null,
//             liveStats: null,
//             backtestHistory: [],
//             savedConfigs: [],
//             isLoading: false,
//             isRunning: false,
//             error: null,

//             setActiveBacktestType: (type) => set({ activeBacktestType: type }),
//             setCurrentConfig: (config) => set({ currentConfig: config }),
//             setCurrentResult: (result) => set({ currentResult: result }),
//             setLiveStats: (stats) => set({ liveStats: stats }),
//             setLoading: (loading) => set({ isLoading: loading }),
//             setRunning: (running) => set({ isRunning: running }),
//             setError: (error) => set({ error }),

//             runBacktest: async (config) => {
//                 set({ isLoading: true, isRunning: true, error: null });
//                 try {
//                     const result = await backtestService.runBacktest(config);
//                     set((state) => ({
//                         currentResult: result,
//                         backtestHistory: [result, ...state.backtestHistory.slice(0, 49)],
//                         isLoading: false,
//                         isRunning: false,
//                     }));
//                 } catch (error: any) {
//                     set({
//                         error: error.message || 'Failed to run backtest',
//                         isLoading: false,
//                         isRunning: false,
//                     });
//                 }
//             },

//             runWalkForward: async (config) => {
//                 set({ isLoading: true, isRunning: true, error: null });
//                 try {
//                     const result = await backtestService.runWalkForward(config);
//                     set((state) => ({
//                         currentResult: result,
//                         backtestHistory: [result as any, ...state.backtestHistory.slice(0, 49)],
//                         isLoading: false,
//                         isRunning: false,
//                     }));
//                 } catch (error: any) {
//                     set({
//                         error: error.message || 'Failed to run walk forward analysis',
//                         isLoading: false,
//                         isRunning: false,
//                     });
//                 }
//             },

//             runMonteCarlo: async (config) => {
//                 set({ isLoading: true, isRunning: true, error: null });
//                 try {
//                     const result = await backtestService.runMonteCarlo(config);
//                     set((state) => ({
//                         currentResult: result,
//                         backtestHistory: [result as any, ...state.backtestHistory.slice(0, 49)],
//                         isLoading: false,
//                         isRunning: false,
//                     }));
//                 } catch (error: any) {
//                     set({
//                         error: error.message || 'Failed to run monte carlo simulation',
//                         isLoading: false,
//                         isRunning: false,
//                     });
//                 }
//             },

//             loadBacktestHistory: async () => {
//                 set({ isLoading: true });
//                 try {
//                     const history = await backtestService.getBacktestHistory();
//                     set({ backtestHistory: history, isLoading: false });
//                 } catch (error) {
//                     console.error('Failed to load backtest history:', error);
//                     set({ isLoading: false });
//                 }
//             },

//             saveConfig: (config) => {
//                 set((state) => ({
//                     savedConfigs: [config, ...state.savedConfigs.slice(0, 19)],
//                 }));
//             },

//             deleteSavedConfig: (index) => {
//                 set((state) => ({
//                     savedConfigs: state.savedConfigs.filter((_, i) => i !== index),
//                 }));
//             },

//             deleteBacktestResult: async (backtestId) => {
//                 try {
//                     await backtestService.deleteBacktestResult(backtestId);
//                     set((state) => ({
//                         backtestHistory: state.backtestHistory.filter(r => r.id !== backtestId),
//                     }));
//                     if (get().currentResult?.id === backtestId) {
//                         set({ currentResult: null });
//                     }
//                 } catch (error) {
//                     console.error('Failed to delete backtest result:', error);
//                     throw error;
//                 }
//             },

//             exportResults: async (backtestId, format) => {
//                 try {
//                     const blob = await backtestService.exportBacktestResult(backtestId, format);

//                     // إنشاء رابط تنزيل
//                     const url = window.URL.createObjectURL(blob);
//                     const a = document.createElement('a');
//                     a.href = url;
//                     a.download = `backtest_${backtestId}.${format}`;
//                     document.body.appendChild(a);
//                     a.click();
//                     window.URL.revokeObjectURL(url);
//                     document.body.removeChild(a);
//                 } catch (error) {
//                     console.error('Failed to export results:', error);
//                     throw error;
//                 }
//             },

//             subscribeToLiveUpdates: (backtestId) => {
//                 // سيتم تنفيذ WebSocket connection هنا
//                 console.log('Subscribing to live updates for backtest:', backtestId);
//             },

//             unsubscribeFromLiveUpdates: () => {
//                 console.log('Unsubscribing from live updates');
//             },
//         }),
//         {
//             name: 'backtest-store',
//             partialize: (state) => ({
//                 savedConfigs: state.savedConfigs,
//                 backtestHistory: state.backtestHistory.slice(0, 10), // حفظ آخر 10 فقط
//             }),
//         }
//     )
// );