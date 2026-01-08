// src/stores/settings.store.ts

// @ts-nocheck
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
    Settings,
    Watchlist,
    FilterPreset,
    AlertSettings,
    PortfolioItem,
    PriceAlert
} from '@/types/settings.types';
import { StrategyConfig } from '@/types/strategies/strategy';
import { IndicatorConfig } from '@/lib/charts/types/indicator';
import { settingsService } from '@/services/api/settings.service';

interface SettingsState {
    // الحالة الأساسية
    settings: Settings;
    customIndicators: IndicatorConfig[];
    savedStrategies: StrategyConfig[];
    watchlists: Watchlist[];
    activeWatchlistId?: string;
    portfolio: PortfolioItem[];
    filterPresets: FilterPreset[];
    alertSettings: AlertSettings;
    apiKeys: Record<string, string>;

    // حالات التحميل والأخطاء
    isLoading: boolean;
    error: string | null;

    // إجراءات المزامنة مع Backend
    syncWithBackend: () => Promise<void>;
    updateSettings: (settings: Partial<Settings>) => Promise<void>;

    // إدارة المؤشرات المخصصة
    addCustomIndicator: (indicator: IndicatorConfig) => Promise<void>;
    updateCustomIndicator: (id: string, updates: Partial<IndicatorConfig>) => Promise<void>;
    deleteCustomIndicator: (id: string) => Promise<void>;
    fetchCustomIndicators: () => Promise<void>;

    // إدارة الاستراتيجيات
    saveStrategy: (strategy: StrategyConfig) => Promise<void>;
    updateStrategy: (id: string, updates: Partial<StrategyConfig>) => Promise<void>;
    deleteStrategy: (id: string) => Promise<void>;
    fetchStrategies: () => Promise<void>;

    // إدارة قوائم المراقبة
    fetchWatchlists: () => Promise<void>;
    createWatchlist: (watchlist: Partial<Watchlist>) => Promise<Watchlist | null>;
    updateWatchlist: (id: string, updates: Partial<Watchlist>) => Promise<Watchlist | null>;
    deleteWatchlist: (id: string) => Promise<boolean>;
    addSymbolToWatchlist: (watchlistId: string, symbol: string, market?: 'crypto' | 'stocks') => Promise<void>;
    removeSymbolFromWatchlist: (watchlistId: string, symbol: string) => Promise<void>;

    // وظائف مساعدة لقوائم المراقبة (مستخدمة في ChartPage)
    addToWatchlist: (symbol: string, market?: 'crypto' | 'stocks') => Promise<void>;
    removeFromWatchlist: (symbol: string) => Promise<void>;
    isInWatchlist: (symbol: string, watchlistId?: string) => boolean;
    getWatchlistBySymbol: (symbol: string) => Watchlist | undefined;
    getDefaultWatchlist: () => Watchlist;

    // إعدادات الفلاتر
    loadFilterPresets: () => Promise<void>;
    saveFilterPreset: (preset: FilterPreset) => Promise<void>;
    updateFilterPreset: (id: string, updates: Partial<FilterPreset>) => Promise<void>;
    deleteFilterPreset: (id: string) => Promise<void>;

    // إدارة المحفظة
    loadPortfolio: () => Promise<void>;
    addToPortfolio: (item: PortfolioItem) => Promise<void>;
    updatePortfolioItem: (id: string, updates: Partial<PortfolioItem>) => Promise<void>;
    removeFromPortfolio: (id: string) => Promise<void>;

    // إدارة التنبيهات
    fetchAlertSettings: () => Promise<void>;
    addPriceAlert: (alert: PriceAlert) => Promise<void>;
    updatePriceAlert: (id: string, updates: Partial<PriceAlert>) => Promise<void>;
    deletePriceAlert: (id: string) => Promise<void>;

    // إدارة مفاتيح API
    fetchApiKeys: () => Promise<void>;
    updateApiKey: (provider: string, key: string) => Promise<void>;
    deleteApiKey: (provider: string) => Promise<void>;
    testApiKey: (provider: string) => Promise<boolean>;

    // إعدادات التطبيق العامة
    setActiveWatchlist: (id: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set, get) => ({
            // الحالة الابتدائية
            settings: {
                theme: 'dark',
                language: 'en',
                timezone: 'UTC',
                currency: 'USD',
                notifications: {
                    email: true,
                    push: true,
                    sound: true,
                    priceAlerts: true,
                    indicatorAlerts: true
                },
                chart: {
                    defaultTimeframe: '1h',
                    defaultIndicators: ['ma', 'rsi'],
                    candleStyle: 'candlestick',
                    gridLines: true,
                    crosshair: true,
                    priceScale: 'linear',
                    timeScale: 'regular'
                },
                trading: {
                    defaultOrderSize: 100,
                    defaultStopLoss: 2,
                    defaultTakeProfit: 4,
                    confirmOrders: true,
                    showOrderPreview: true
                }
            },
            customIndicators: [],
            savedStrategies: [],
            watchlists: [],
            activeWatchlistId: undefined,
            portfolio: [],
            filterPresets: [],
            alertSettings: {
                priceAlerts: [],
                indicatorAlerts: [],
                volumeAlerts: [],
                patternAlerts: []
            },
            apiKeys: {},
            isLoading: false,
            error: null,

            // مزامنة البيانات مع Backend
            syncWithBackend: async () => {
                set({ isLoading: true, error: null });
                try {
                    await Promise.all([
                        get().fetchWatchlists(),
                        get().fetchStrategies(),
                        get().fetchCustomIndicators(),
                        get().loadFilterPresets(),
                        get().loadPortfolio(),
                        get().fetchAlertSettings(),
                        get().fetchApiKeys()
                    ]);
                } catch (error: any) {
                    set({ error: error.message || 'Failed to sync with backend' });
                } finally {
                    set({ isLoading: false });
                }
            },

            // تحديث الإعدادات العامة
            updateSettings: async (settings) => {
                set({ isLoading: true, error: null });
                try {
                    const newSettings = { ...get().settings, ...settings };

                    // يمكن إرسال التحديثات إلى Backend هنا إذا كان هناك نقطة نهاية
                    // await settingsService.updateSettings(newSettings);

                    set({ settings: newSettings });
                } catch (error: any) {
                    set({ error: error.message || 'Failed to update settings' });
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            // === إدارة المؤشرات المخصصة ===
            addCustomIndicator: async (indicator) => {
                set({ isLoading: true, error: null });
                try {
                    const savedIndicator = await settingsService.createIndicator(indicator);
                    set(state => ({
                        customIndicators: [...state.customIndicators, savedIndicator],
                        isLoading: false
                    }));
                } catch (error: any) {
                    set({
                        error: error.message || 'Failed to add custom indicator',
                        isLoading: false
                    });
                    throw error;
                }
            },

            updateCustomIndicator: async (id, updates) => {
                set({ isLoading: true, error: null });
                try {
                    const updatedIndicator = await settingsService.updateIndicator(id, updates);
                    set(state => ({
                        customIndicators: state.customIndicators.map(ind =>
                            ind.id === id ? { ...ind, ...updatedIndicator } : ind
                        ),
                        isLoading: false
                    }));
                } catch (error: any) {
                    set({
                        error: error.message || 'Failed to update custom indicator',
                        isLoading: false
                    });
                    throw error;
                }
            },

            deleteCustomIndicator: async (id) => {
                set({ isLoading: true, error: null });
                try {
                    await settingsService.deleteIndicator(id);
                    set(state => ({
                        customIndicators: state.customIndicators.filter(ind => ind.id !== id),
                        isLoading: false
                    }));
                } catch (error: any) {
                    set({
                        error: error.message || 'Failed to delete custom indicator',
                        isLoading: false
                    });
                    throw error;
                }
            },

            fetchCustomIndicators: async () => {
                set({ isLoading: true, error: null });
                try {
                    const indicators = await settingsService.getIndicators();
                    set({ customIndicators: indicators, isLoading: false });
                } catch (error: any) {
                    set({
                        error: error.message || 'Failed to fetch custom indicators',
                        isLoading: false
                    });
                }
            },

            // === إدارة الاستراتيجيات ===
            saveStrategy: async (strategy) => {
                set({ isLoading: true, error: null });
                try {
                    const savedStrategy = await settingsService.createStrategy(strategy);
                    set(state => ({
                        savedStrategies: [...state.savedStrategies, savedStrategy],
                        isLoading: false
                    }));
                } catch (error: any) {
                    set({
                        error: error.message || 'Failed to save strategy',
                        isLoading: false
                    });
                    throw error;
                }
            },

            updateStrategy: async (id, updates) => {
                set({ isLoading: true, error: null });
                try {
                    const updatedStrategy = await settingsService.updateStrategy(id, updates);
                    set(state => ({
                        savedStrategies: state.savedStrategies.map(strat =>
                            strat.id === id ? { ...strat, ...updatedStrategy } : strat
                        ),
                        isLoading: false
                    }));
                } catch (error: any) {
                    set({
                        error: error.message || 'Failed to update strategy',
                        isLoading: false
                    });
                    throw error;
                }
            },

            deleteStrategy: async (id) => {
                set({ isLoading: true, error: null });
                try {
                    await settingsService.deleteStrategy(id);
                    set(state => ({
                        savedStrategies: state.savedStrategies.filter(strat => strat.id !== id),
                        isLoading: false
                    }));
                } catch (error: any) {
                    set({
                        error: error.message || 'Failed to delete strategy',
                        isLoading: false
                    });
                    throw error;
                }
            },

            fetchStrategies: async () => {
                set({ isLoading: true, error: null });
                try {
                    const strategies = await settingsService.getStrategies();
                    set({ savedStrategies: strategies, isLoading: false });
                } catch (error: any) {
                    set({
                        error: error.message || 'Failed to fetch strategies',
                        isLoading: false
                    });
                }
            },

            // === إدارة قوائم المراقبة ===
            fetchWatchlists: async () => {
                set({ isLoading: true, error: null });
                try {
                    const watchlists = await settingsService.getWatchlists();

                    if (watchlists.length > 0) {
                        set({
                            watchlists,
                            activeWatchlistId: watchlists[0].id,
                            isLoading: false
                        });
                    } else {
                        // إنشاء قائمة مراقبة افتراضية إذا لم توجد
                        const defaultWatchlist = await get().createWatchlist({
                            name: 'My Watchlist',
                            description: 'Default watchlist',
                            symbols: [],
                            isDefault: true
                        });

                        if (defaultWatchlist) {
                            set({
                                watchlists: [defaultWatchlist],
                                activeWatchlistId: defaultWatchlist.id,
                                isLoading: false
                            });
                        }
                    }
                } catch (error: any) {
                    set({
                        error: error.message || 'Failed to fetch watchlists',
                        isLoading: false
                    });
                }
            },

            createWatchlist: async (watchlist) => {
                set({ isLoading: true, error: null });
                try {
                    const createdWatchlist = await settingsService.createWatchlist(watchlist);
                    set(state => ({
                        watchlists: [...state.watchlists, createdWatchlist],
                        isLoading: false
                    }));
                    return createdWatchlist;
                } catch (error: any) {
                    set({
                        error: error.message || 'Failed to create watchlist',
                        isLoading: false
                    });
                    return null;
                }
            },

            updateWatchlist: async (id, updates) => {
                set({ isLoading: true, error: null });
                try {
                    const updatedWatchlist = await settingsService.updateWatchlist(id, updates);
                    set(state => ({
                        watchlists: state.watchlists.map(w =>
                            w.id === id ? { ...w, ...updatedWatchlist } : w
                        ),
                        isLoading: false
                    }));
                    return updatedWatchlist;
                } catch (error: any) {
                    set({
                        error: error.message || 'Failed to update watchlist',
                        isLoading: false
                    });
                    return null;
                }
            },

            deleteWatchlist: async (id) => {
                set({ isLoading: true, error: null });
                try {
                    await settingsService.deleteWatchlist(id);
                    set(state => {
                        const newWatchlists = state.watchlists.filter(w => w.id !== id);
                        return {
                            watchlists: newWatchlists,
                            activeWatchlistId: state.activeWatchlistId === id ?
                                (newWatchlists[0]?.id || undefined) :
                                state.activeWatchlistId,
                            isLoading: false
                        };
                    });
                    return true;
                } catch (error: any) {
                    set({
                        error: error.message || 'Failed to delete watchlist',
                        isLoading: false
                    });
                    return false;
                }
            },

            addSymbolToWatchlist: async (watchlistId, symbol, market) => {
                set({ isLoading: true, error: null });
                try {
                    await settingsService.addSymbolToWatchlist(watchlistId, symbol);

                    set(state => ({
                        watchlists: state.watchlists.map(w => {
                            if (w.id === watchlistId) {
                                const symbols = [...w.symbols, symbol];
                                return {
                                    ...w,
                                    symbols: Array.from(new Set(symbols)), // إزالة التكرارات
                                    updatedAt: new Date().toISOString()
                                };
                            }
                            return w;
                        }),
                        isLoading: false
                    }));
                } catch (error: any) {
                    set({
                        error: error.message || 'Failed to add symbol to watchlist',
                        isLoading: false
                    });
                    throw error;
                }
            },

            removeSymbolFromWatchlist: async (watchlistId, symbol) => {
                set({ isLoading: true, error: null });
                try {
                    await settingsService.removeSymbolFromWatchlist(watchlistId, symbol);

                    set(state => ({
                        watchlists: state.watchlists.map(w => {
                            if (w.id === watchlistId) {
                                return {
                                    ...w,
                                    symbols: w.symbols.filter(s => s !== symbol),
                                    updatedAt: new Date().toISOString()
                                };
                            }
                            return w;
                        }),
                        isLoading: false
                    }));
                } catch (error: any) {
                    set({
                        error: error.message || 'Failed to remove symbol from watchlist',
                        isLoading: false
                    });
                    throw error;
                }
            },

            // === وظائف مساعدة لقوائم المراقبة ===
            addToWatchlist: async (symbol, market) => {
                const state = get();
                const watchlistId = state.activeWatchlistId || state.watchlists[0]?.id;

                if (!watchlistId) {
                    throw new Error('No watchlist available');
                }

                await get().addSymbolToWatchlist(watchlistId, symbol, market);
            },

            removeFromWatchlist: async (symbol) => {
                const state = get();
                const watchlistId = state.activeWatchlistId || state.watchlists[0]?.id;

                if (!watchlistId) {
                    throw new Error('No watchlist available');
                }

                await get().removeSymbolFromWatchlist(watchlistId, symbol);
            },

            isInWatchlist: (symbol, watchlistId) => {
                const state = get();
                const targetWatchlistId = watchlistId || state.activeWatchlistId || state.watchlists[0]?.id;

                if (!targetWatchlistId) return false;

                const watchlist = state.watchlists.find(w => w.id === targetWatchlistId);
                return watchlist ? watchlist.symbols.includes(symbol) : false;
            },

            getWatchlistBySymbol: (symbol) => {
                const state = get();
                return state.watchlists.find(w => w.symbols.includes(symbol));
            },

            getDefaultWatchlist: () => {
                const state = get();
                return state.watchlists.find(w => w.isDefault) || state.watchlists[0];
            },

            // === إعدادات الفلاتر ===
            loadFilterPresets: async () => {
                set({ isLoading: true, error: null });
                try {
                    const presets = await settingsService.getFilterPresets();
                    set({ filterPresets: presets, isLoading: false });
                } catch (error: any) {
                    set({
                        error: error.message || 'Failed to load filter presets',
                        isLoading: false
                    });
                }
            },

            saveFilterPreset: async (preset) => {
                set({ isLoading: true, error: null });
                try {
                    const savedPreset = await settingsService.createFilterPreset(preset);
                    set(state => ({
                        filterPresets: [...state.filterPresets, savedPreset],
                        isLoading: false
                    }));
                } catch (error: any) {
                    set({
                        error: error.message || 'Failed to save filter preset',
                        isLoading: false
                    });
                    throw error;
                }
            },

            updateFilterPreset: async (id, updates) => {
                set({ isLoading: true, error: null });
                try {
                    const updatedPreset = await settingsService.updateFilterPreset(id, updates);
                    set(state => ({
                        filterPresets: state.filterPresets.map(p =>
                            p.id === id ? { ...p, ...updatedPreset } : p
                        ),
                        isLoading: false
                    }));
                } catch (error: any) {
                    set({
                        error: error.message || 'Failed to update filter preset',
                        isLoading: false
                    });
                    throw error;
                }
            },

            deleteFilterPreset: async (id) => {
                set({ isLoading: true, error: null });
                try {
                    await settingsService.deleteFilterPreset(id);
                    set(state => ({
                        filterPresets: state.filterPresets.filter(p => p.id !== id),
                        isLoading: false
                    }));
                } catch (error: any) {
                    set({
                        error: error.message || 'Failed to delete filter preset',
                        isLoading: false
                    });
                    throw error;
                }
            },

            // === إدارة المحفظة ===
            loadPortfolio: async () => {
                set({ isLoading: true, error: null });
                try {
                    const portfolio = await settingsService.getPortfolio();
                    set({ portfolio, isLoading: false });
                } catch (error: any) {
                    set({
                        error: error.message || 'Failed to load portfolio',
                        isLoading: false
                    });
                }
            },

            addToPortfolio: async (item) => {
                set({ isLoading: true, error: null });
                try {
                    const savedItem = await settingsService.createPortfolioItem(item);
                    set(state => ({
                        portfolio: [...state.portfolio, savedItem],
                        isLoading: false
                    }));
                } catch (error: any) {
                    set({
                        error: error.message || 'Failed to add to portfolio',
                        isLoading: false
                    });
                    throw error;
                }
            },

            updatePortfolioItem: async (id, updates) => {
                set({ isLoading: true, error: null });
                try {
                    const updatedItem = await settingsService.updatePortfolioItem(id, updates);
                    set(state => ({
                        portfolio: state.portfolio.map(item =>
                            item.id === id ? { ...item, ...updatedItem } : item
                        ),
                        isLoading: false
                    }));
                } catch (error: any) {
                    set({
                        error: error.message || 'Failed to update portfolio item',
                        isLoading: false
                    });
                    throw error;
                }
            },

            removeFromPortfolio: async (id) => {
                set({ isLoading: true, error: null });
                try {
                    await settingsService.deletePortfolioItem(id);
                    set(state => ({
                        portfolio: state.portfolio.filter(item => item.id !== id),
                        isLoading: false
                    }));
                } catch (error: any) {
                    set({
                        error: error.message || 'Failed to remove from portfolio',
                        isLoading: false
                    });
                    throw error;
                }
            },

            // === إدارة التنبيهات ===
            fetchAlertSettings: async () => {
                set({ isLoading: true, error: null });
                try {
                    const alerts = await settingsService.getAlerts();
                    set({
                        alertSettings: alerts,
                        isLoading: false
                    });
                } catch (error: any) {
                    set({
                        error: error.message || 'Failed to fetch alerts',
                        isLoading: false
                    });
                }
            },

            addPriceAlert: async (alert) => {
                set({ isLoading: true, error: null });
                try {
                    const savedAlert = await settingsService.createPriceAlert(alert);
                    set(state => ({
                        alertSettings: {
                            ...state.alertSettings,
                            priceAlerts: [...state.alertSettings.priceAlerts, savedAlert]
                        },
                        isLoading: false
                    }));
                } catch (error: any) {
                    set({
                        error: error.message || 'Failed to add price alert',
                        isLoading: false
                    });
                    throw error;
                }
            },

            updatePriceAlert: async (id, updates) => {
                set({ isLoading: true, error: null });
                try {
                    const updatedAlert = await settingsService.updatePriceAlert(id, updates);
                    set(state => ({
                        alertSettings: {
                            ...state.alertSettings,
                            priceAlerts: state.alertSettings.priceAlerts.map(alert =>
                                alert.id === id ? { ...alert, ...updatedAlert } : alert
                            )
                        },
                        isLoading: false
                    }));
                } catch (error: any) {
                    set({
                        error: error.message || 'Failed to update price alert',
                        isLoading: false
                    });
                    throw error;
                }
            },

            deletePriceAlert: async (id) => {
                set({ isLoading: true, error: null });
                try {
                    await settingsService.deletePriceAlert(id);
                    set(state => ({
                        alertSettings: {
                            ...state.alertSettings,
                            priceAlerts: state.alertSettings.priceAlerts.filter(alert => alert.id !== id)
                        },
                        isLoading: false
                    }));
                } catch (error: any) {
                    set({
                        error: error.message || 'Failed to delete price alert',
                        isLoading: false
                    });
                    throw error;
                }
            },

            // === إدارة مفاتيح API ===
            fetchApiKeys: async () => {
                set({ isLoading: true, error: null });
                try {
                    const apiKeys = await settingsService.getApiKeys();
                    set({ apiKeys, isLoading: false });
                } catch (error: any) {
                    set({
                        error: error.message || 'Failed to fetch API keys',
                        isLoading: false
                    });
                }
            },

            updateApiKey: async (provider, key) => {
                set({ isLoading: true, error: null });
                try {
                    const savedKey = await settingsService.createApiKey({ provider, key });
                    set(state => ({
                        apiKeys: { ...state.apiKeys, [provider]: savedKey.key },
                        isLoading: false
                    }));
                } catch (error: any) {
                    set({
                        error: error.message || 'Failed to update API key',
                        isLoading: false
                    });
                    throw error;
                }
            },

            deleteApiKey: async (provider) => {
                set({ isLoading: true, error: null });
                try {
                    await settingsService.deleteApiKey(provider);
                    set(state => {
                        const newApiKeys = { ...state.apiKeys };
                        delete newApiKeys[provider];
                        return { apiKeys: newApiKeys, isLoading: false };
                    });
                } catch (error: any) {
                    set({
                        error: error.message || 'Failed to delete API key',
                        isLoading: false
                    });
                    throw error;
                }
            },

            testApiKey: async (provider) => {
                set({ isLoading: true, error: null });
                try {
                    const isValid = await settingsService.testApiKey(provider);
                    set({ isLoading: false });
                    return isValid;
                } catch (error: any) {
                    set({
                        error: error.message || 'Failed to test API key',
                        isLoading: false
                    });
                    return false;
                }
            },

            // === وظائف مساعدة ===
            setActiveWatchlist: (id) => {
                set({ activeWatchlistId: id });
            },

            setLoading: (loading) => {
                set({ isLoading: loading });
            },

            setError: (error) => {
                set({ error });
            }
        }),
        {
            name: 'settings-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                settings: state.settings,
                customIndicators: state.customIndicators,
                savedStrategies: state.savedStrategies,
                watchlists: state.watchlists,
                activeWatchlistId: state.activeWatchlistId,
                portfolio: state.portfolio,
                filterPresets: state.filterPresets,
                alertSettings: state.alertSettings,
                apiKeys: state.apiKeys
            })
        }
    )
);