// @ts-nocheck
'use client';

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import {
    StrategyConfig,
    IndicatorConfig,
    EntryRule,
    ExitRule,
    FilterRule,
    RiskManagement,
    BacktestConfig
} from '@/types/backtest';

// أنواع Actions
type StrategyAction =
    | { type: 'LOAD_STRATEGY'; payload: StrategyConfig }
    | { type: 'UPDATE_INDICATORS'; payload: IndicatorConfig[] }
    | { type: 'UPDATE_ENTRY_RULES'; payload: EntryRule[] }
    | { type: 'UPDATE_EXIT_RULES'; payload: ExitRule[] }
    | { type: 'UPDATE_FILTER_RULES'; payload: FilterRule[] }
    | { type: 'UPDATE_RISK_MANAGEMENT'; payload: RiskManagement }
    | { type: 'UPDATE_BACKTEST_CONFIG'; payload: Partial<BacktestConfig> }
    | { type: 'RESET_STRATEGY' };

// الحالة الكاملة
interface StrategyState {
    strategy: StrategyConfig;
    backtestConfig: Partial<BacktestConfig>;
    isLoading: boolean;
    isDirty: boolean;
}

// الحالة الابتدائية
const initialState: StrategyState = {
    strategy: {
        name: 'New Strategy',
        version: '1.0.0',
        description: '',
        base_timeframe: '1h',
        position_side: 'both',
        indicators: [],
        entry_rules: [],
        exit_rules: [],
        filter_rules: [],
        risk_management: {
            stop_loss_percentage: 2.0,
            take_profit_percentage: 4.0,
            trailing_stop_percentage: 1.0,
            max_position_size: 0.3,
            max_daily_loss: 10.0,
            max_concurrent_positions: 3
        }
    },
    backtestConfig: {
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date().toISOString(),
        timeframe: '1h',
        market: 'crypto',
        symbols: ['BTCUSDT'],
        initial_capital: 10000,
        position_sizing: 'fixed_percentage',
        position_size_percent: 10,
        max_positions: 5,
        commission_rate: 0.1,
        slippage_percent: 0.1,
        leverage: 1
    },
    isLoading: false,
    isDirty: false
};

// Reducer
function strategyReducer(state: StrategyState, action: StrategyAction): StrategyState {
    switch (action.type) {
        case 'LOAD_STRATEGY':
            return {
                ...state,
                strategy: action.payload,
                backtestConfig: {
                    ...state.backtestConfig,
                    name: action.payload.name,
                    timeframe: action.payload.base_timeframe,
                    strategy_config: action.payload
                },
                isDirty: false
            };

        case 'UPDATE_INDICATORS':
            return {
                ...state,
                strategy: {
                    ...state.strategy,
                    indicators: action.payload
                },
                backtestConfig: {
                    ...state.backtestConfig,
                    strategy_config: {
                        ...state.strategy,
                        indicators: action.payload
                    }
                },
                isDirty: true
            };

        case 'UPDATE_ENTRY_RULES':
            return {
                ...state,
                strategy: {
                    ...state.strategy,
                    entry_rules: action.payload
                },
                backtestConfig: {
                    ...state.backtestConfig,
                    strategy_config: {
                        ...state.strategy,
                        entry_rules: action.payload
                    }
                },
                isDirty: true
            };

        case 'UPDATE_EXIT_RULES':
            return {
                ...state,
                strategy: {
                    ...state.strategy,
                    exit_rules: action.payload
                },
                backtestConfig: {
                    ...state.backtestConfig,
                    strategy_config: {
                        ...state.strategy,
                        exit_rules: action.payload
                    }
                },
                isDirty: true
            };

        case 'UPDATE_FILTER_RULES':
            return {
                ...state,
                strategy: {
                    ...state.strategy,
                    filter_rules: action.payload
                },
                backtestConfig: {
                    ...state.backtestConfig,
                    strategy_config: {
                        ...state.strategy,
                        filter_rules: action.payload
                    }
                },
                isDirty: true
            };

        case 'UPDATE_RISK_MANAGEMENT':
            return {
                ...state,
                strategy: {
                    ...state.strategy,
                    risk_management: action.payload
                },
                backtestConfig: {
                    ...state.backtestConfig,
                    strategy_config: {
                        ...state.strategy,
                        risk_management: action.payload
                    }
                },
                isDirty: true
            };

        case 'UPDATE_BACKTEST_CONFIG':
            return {
                ...state,
                backtestConfig: {
                    ...state.backtestConfig,
                    ...action.payload
                },
                isDirty: true
            };

        case 'RESET_STRATEGY':
            return initialState;

        default:
            return state;
    }
}

// إنشاء Context
const StrategyContext = createContext<{
    state: StrategyState;
    dispatch: React.Dispatch<StrategyAction>;
    loadStrategyFromDB: (strategyName: string) => Promise<void>;
    saveStrategy: () => Promise<void>;
} | undefined>(undefined);

// Provider Component
export function StrategyProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(strategyReducer, initialState);

    const loadStrategyFromDB = async (strategyName: string) => {
        try {
            const response = await fetch(`/api/v1/strategies1/get_from_db/${encodeURIComponent(strategyName)}`);
            if (!response.ok) throw new Error('Failed to fetch strategy');

            const data = await response.json();
            if (!data.success) throw new Error(data.error || 'Unknown error');

            const fullStrategy = data.strategy.config;

            dispatch({
                type: 'LOAD_STRATEGY',
                payload: fullStrategy
            });

            return data;
        } catch (error) {
            console.error('Error loading strategy:', error);
            throw error;
        }
    };

    const saveStrategy = async () => {
        try {
            const response = await fetch('/api/v1/strategies1/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(state.strategy)
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error saving strategy:', error);
            throw error;
        }
    };

    return (
        <StrategyContext.Provider value={{ state, dispatch, loadStrategyFromDB, saveStrategy }}>
            {children}
        </StrategyContext.Provider>
    );
}

// Custom Hook
export function useStrategy() {
    const context = useContext(StrategyContext);
    if (!context) {
        throw new Error('useStrategy must be used within StrategyProvider');
    }
    return context;
}