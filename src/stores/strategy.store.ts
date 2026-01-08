
// @ts-nocheck
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Strategy, TradingRule } from '@/lib/strategies/types/strategy';
import { strategyService } from '@/services/api/strategy.service';

interface StrategyStore {
    // الاستراتيجيات
    strategies: Strategy[];
    activeStrategy: Strategy | null;
    selectedStrategyId: string | null;

    // القوالب
    ruleTemplates: TradingRule[];
    strategyTemplates: Strategy[];

    // الحالة
    isLoading: boolean;
    error: string | null;

    // الإجراءات
    setActiveStrategy: (strategy: Strategy | null) => void;
    selectStrategy: (strategyId: string | null) => void;

    // إدارة الاستراتيجيات
    addStrategy: (strategy: Strategy) => void;
    updateStrategy: (strategyId: string, updates: Partial<Strategy>) => void;
    deleteStrategy: (strategyId: string) => void;
    duplicateStrategy: (strategyId: string, newName?: string) => Promise<void>;

    // إدارة القوالب
    addRuleTemplate: (rule: TradingRule, name: string, category: string) => Promise<void>;
    deleteRuleTemplate: (templateId: string) => void;

    // المزامنة مع الخادم
    fetchStrategies: () => Promise<void>;
    saveStrategyToServer: (strategy: Strategy) => Promise<void>;
    loadStrategyFromServer: (strategyId: string) => Promise<void>;

    // التصدير والاستيراد
    exportStrategy: (strategyId: string, format?: string) => Promise<void>;
    importStrategy: (file: File) => Promise<void>;

    // الاختبار
    testStrategy: (strategy: Strategy, historicalData: any[]) => Promise<any>;
}

export const useStrategyStore = create<StrategyStore>()(
    persist(
        (set, get) => ({
            strategies: [],
            activeStrategy: null,
            selectedStrategyId: null,
            ruleTemplates: [],
            strategyTemplates: [],
            isLoading: false,
            error: null,

            setActiveStrategy: (strategy) => {
                set({ activeStrategy: strategy });
            },

            selectStrategy: (strategyId) => {
                const strategy = get().strategies.find(s => s.id === strategyId);
                set({
                    selectedStrategyId: strategyId,
                    activeStrategy: strategy || null,
                });
            },

            addStrategy: (strategy) => {
                set((state) => ({
                    strategies: [...state.strategies, strategy],
                }));
            },

            updateStrategy: (strategyId, updates) => {
                set((state) => ({
                    strategies: state.strategies.map((strategy) =>
                        strategy.id === strategyId
                            ? { ...strategy, ...updates, updatedAt: new Date() }
                            : strategy
                    ),
                    activeStrategy:
                        state.activeStrategy?.id === strategyId
                            ? { ...state.activeStrategy, ...updates, updatedAt: new Date() }
                            : state.activeStrategy,
                }));
            },

            deleteStrategy: (strategyId) => {
                set((state) => ({
                    strategies: state.strategies.filter((strategy) => strategy.id !== strategyId),
                    activeStrategy:
                        state.activeStrategy?.id === strategyId ? null : state.activeStrategy,
                    selectedStrategyId:
                        state.selectedStrategyId === strategyId ? null : state.selectedStrategyId,
                }));
            },

            duplicateStrategy: async (strategyId, newName) => {
                const strategy = get().strategies.find(s => s.id === strategyId);
                if (!strategy) return;

                const duplicated: Strategy = {
                    ...strategy,
                    id: `strategy_${Date.now()}`,
                    name: newName || `${strategy.name} (نسخة)`,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                set((state) => ({
                    strategies: [...state.strategies, duplicated],
                }));
            },

            addRuleTemplate: async (rule, name, category) => {
                try {
                    const result = await strategyService.saveRuleTemplate(rule, name, category);
                    set((state) => ({
                        ruleTemplates: [...state.ruleTemplates, { ...rule, id: result.id, name, category }],
                    }));
                } catch (error) {
                    console.error('Error saving rule template:', error);
                }
            },

            deleteRuleTemplate: (templateId) => {
                set((state) => ({
                    ruleTemplates: state.ruleTemplates.filter(template => template.id !== templateId),
                }));
            },

            fetchStrategies: async () => {
                set({ isLoading: true, error: null });
                try {
                    const strategies = await strategyService.getStrategies();
                    set({ strategies, isLoading: false });
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to fetch strategies',
                        isLoading: false,
                    });
                }
            },

            saveStrategyToServer: async (strategy: Strategy) => {
                set({ isLoading: true, error: null });
                try {
                    const savedStrategy = await strategyService.createStrategy(strategy);
                    set((state) => ({
                        strategies: state.strategies.map(s =>
                            s.id === strategy.id ? savedStrategy : s
                        ),
                        activeStrategy: savedStrategy,
                        isLoading: false,
                    }));
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to save strategy',
                        isLoading: false,
                    });
                }
            },

            loadStrategyFromServer: async (strategyId: string) => {
                set({ isLoading: true, error: null });
                try {
                    const strategy = await strategyService.getStrategy(strategyId);
                    set((state) => ({
                        strategies: state.strategies.some(s => s.id === strategyId)
                            ? state.strategies.map(s => s.id === strategyId ? strategy : s)
                            : [...state.strategies, strategy],
                        activeStrategy: strategy,
                        selectedStrategyId: strategyId,
                        isLoading: false,
                    }));
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to load strategy',
                        isLoading: false,
                    });
                }
            },

            exportStrategy: async (strategyId: string, format = 'json') => {
                const strategy = get().strategies.find(s => s.id === strategyId);
                if (!strategy) return;

                try {
                    const result = await strategyService.exportStrategy(strategy, format as any);

                    // تحميل الملف
                    const blob = new Blob([result.content], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = result.filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                } catch (error) {
                    console.error('Error exporting strategy:', error);
                }
            },

            importStrategy: async (file: File) => {
                set({ isLoading: true, error: null });
                try {
                    const result = await strategyService.uploadStrategyFile(file);
                    set((state) => ({
                        strategies: [...state.strategies, result.strategy],
                        activeStrategy: result.strategy,
                        isLoading: false,
                    }));
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to import strategy',
                        isLoading: false,
                    });
                }
            },

            testStrategy: async (strategy: Strategy, historicalData: any[]) => {
                set({ isLoading: true, error: null });
                try {
                    const result = await strategyService.testStrategy(strategy, historicalData);
                    set({ isLoading: false });
                    return result;
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to test strategy',
                        isLoading: false,
                    });
                    throw error;
                }
            },
        }),
        {
            name: 'strategy-storage',
            partialize: (state) => ({
                strategies: state.strategies,
                ruleTemplates: state.ruleTemplates,
                selectedStrategyId: state.selectedStrategyId,
            }),
        }
    )
);