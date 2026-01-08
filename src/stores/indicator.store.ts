import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ActiveIndicator, IndicatorConfig } from '@/lib/charts/types/indicator';

interface IndicatorStore {
    // مؤشرات نشطة لكل رسم بياني
    activeIndicators: Record<string, ActiveIndicator[]>;

    // المفضلة
    favorites: string[];

    // الإعدادات المحفوظة
    savedConfigs: Record<string, {
        name: string;
        indicators: ActiveIndicator[];
        timestamp: number;
    }>;

    // الإجراءات
    addIndicator: (indicator: ActiveIndicator, chartId?: string) => void;
    removeIndicator: (indicatorId: string, chartId?: string) => void;
    updateIndicator: (indicatorId: string, updates: Partial<ActiveIndicator>, chartId?: string) => void;
    clearIndicators: (chartId?: string) => void;
    reorderIndicators: (indicators: ActiveIndicator[], chartId?: string) => void;

    // المفضلة
    toggleFavorite: (indicatorId: string) => void;

    // حفظ/تحميل الإعدادات
    saveConfig: (chartId?: string, name?: string) => void;
    loadConfig: (chartId?: string, configName?: string) => void;
    deleteConfig: (configName: string) => void;

    // الإعدادات المسبقة
    applyPreset: (preset: IndicatorConfig[], chartId?: string) => void;
}

export const useIndicatorStore = create<IndicatorStore>()(
    persist(
        (set, get) => ({
            activeIndicators: {},
            favorites: [],
            savedConfigs: {},

            addIndicator: (indicator, chartId = 'default') => {
                set((state) => ({
                    activeIndicators: {
                        ...state.activeIndicators,
                        [chartId]: [...(state.activeIndicators[chartId] || []), indicator],
                    },
                }));
            },

            removeIndicator: (indicatorId, chartId = 'default') => {
                set((state) => ({
                    activeIndicators: {
                        ...state.activeIndicators,
                        [chartId]: (state.activeIndicators[chartId] || []).filter(
                            (ind) => ind.id !== indicatorId
                        ),
                    },
                }));
            },

            updateIndicator: (indicatorId, updates, chartId = 'default') => {
                set((state) => ({
                    activeIndicators: {
                        ...state.activeIndicators,
                        [chartId]: (state.activeIndicators[chartId] || []).map((ind) =>
                            ind.id === indicatorId ? { ...ind, ...updates } : ind
                        ),
                    },
                }));
            },

            clearIndicators: (chartId = 'default') => {
                set((state) => ({
                    activeIndicators: {
                        ...state.activeIndicators,
                        [chartId]: [],
                    },
                }));
            },

            reorderIndicators: (indicators, chartId = 'default') => {
                set((state) => ({
                    activeIndicators: {
                        ...state.activeIndicators,
                        [chartId]: indicators,
                    },
                }));
            },

            toggleFavorite: (indicatorId) => {
                set((state) => ({
                    favorites: state.favorites.includes(indicatorId)
                        ? state.favorites.filter(id => id !== indicatorId)
                        : [...state.favorites, indicatorId],
                }));
            },

            saveConfig: (chartId = 'default', name = `config_${Date.now()}`) => {
                const configs = get().savedConfigs;
                const indicators = get().activeIndicators[chartId] || [];

                set({
                    savedConfigs: {
                        ...configs,
                        [name]: {
                            name,
                            indicators,
                            timestamp: Date.now(),
                        },
                    },
                });
            },

            loadConfig: (chartId = 'default', configName = '') => {
                const configs = get().savedConfigs;
                const config = configName
                    ? configs[configName]
                    : Object.values(configs).sort((a, b) => b.timestamp - a.timestamp)[0];

                if (config) {
                    set((state) => ({
                        activeIndicators: {
                            ...state.activeIndicators,
                            [chartId]: config.indicators,
                        },
                    }));
                }
            },

            deleteConfig: (configName) => {
                const configs = { ...get().savedConfigs };
                delete configs[configName];

                set({ savedConfigs: configs });
            },

            applyPreset: (preset, chartId = 'default') => {
                const indicators: ActiveIndicator[] = preset.map((config, index) => ({
                    id: `preset_${chartId}_${index}_${Date.now()}`,
                    indicatorId: config.indicatorId,
                    name: config.indicatorId.toUpperCase(),
                    parameters: config.parameters,
                    color: config.color || '#2962FF',
                    visible: true,
                }));

                set((state) => ({
                    activeIndicators: {
                        ...state.activeIndicators,
                        [chartId]: indicators,
                    },
                }));
            },
        }),
        {
            name: 'indicator-storage',
            partialize: (state) => ({
                favorites: state.favorites,
                savedConfigs: state.savedConfigs,
            }),
        }
    )
);