// src/services/api/backtest.service.ts
import { StrategyConfig } from '@/types/strategies/strategy';
import { axiosClient } from './http/axios.client';
import { apiConfig } from '@/config/api.config';
import { BacktestConfig, BacktestResult } from '@/types/backtest.types';


export interface BacktestRequest {
    strategy: StrategyConfig;
    symbol: string;
    timeframe: string;
    market: 'crypto' | 'stocks';
    start_date: string;
    end_date: string;
    initial_capital: number;
    commission?: number;
    slippage?: number;
    stop_loss?: number;
    take_profit?: number;
    position_size?: number;
    filters?: any;
}

export interface WalkForwardConfig {
    strategy: StrategyConfig;
    symbol: string;
    timeframe: string;
    market: 'crypto' | 'stocks';
    walk_forward_config: {
        in_sample_period: string; // e.g., '30d', '90d', '180d'
        out_of_sample_period: string;
        step_size: string;
        optimization_metric: string; // e.g., 'sharpe_ratio', 'total_return'
    };
    initial_capital: number;
}

export interface MonteCarloConfig {
    strategy: StrategyConfig;
    symbol: string;
    timeframe: string;
    market: 'crypto' | 'stocks';
    monte_carlo_config: {
        iterations: number;
        confidence_level: number;
        random_seed?: number;
        include_fees: boolean;
        include_slippage: boolean;
    };
    start_date: string;
    end_date: string;
    initial_capital: number;
}

export interface BacktestComparison {
    backtest_ids: string[];
    comparison_metrics: string[];
}

export interface BacktestReport {
    summary: {
        total_return: number;
        sharpe_ratio: number;
        max_drawdown: number;
        win_rate: number;
        profit_factor: number;
        total_trades: number;
        avg_trade_duration: string;
    };
    equity_curve: Array<{
        timestamp: string;
        equity: number;
        drawdown: number;
    }>;
    trades: Array<{
        id: string;
        symbol: string;
        side: 'buy' | 'sell';
        entry_time: string;
        exit_time: string;
        entry_price: number;
        exit_price: number;
        quantity: number;
        profit: number;
        profit_percent: number;
        fee: number;
        pnl: number;
        duration: string;
    }>;
    monthly_performance: Array<{
        month: string;
        return: number;
        trades: number;
        win_rate: number;
    }>;
    risk_metrics: {
        value_at_risk: number;
        expected_shortfall: number;
        ulcer_index: number;
        tail_ratio: number;
    };
    optimization_results?: {
        parameter_sets: Array<{
            parameters: Record<string, any>;
            metrics: Record<string, number>;
        }>;
        best_parameters: Record<string, any>;
    };
}

export const backtestService = {
    // Run basic backtest
    async runBacktest(config: BacktestConfig): Promise<BacktestResult> {
        return axiosClient.post(apiConfig.endpoints.backtest.run, config);
    },

    // Run walk-forward analysis
    async runWalkForward(config: WalkForwardConfig): Promise<BacktestResult[]> {
        return axiosClient.post(apiConfig.endpoints.backtest.walkForward, config);
    },

    // Run Monte Carlo simulation
    async runMonteCarlo(config: MonteCarloConfig): Promise<{
        iterations: BacktestResult[];
        statistics: {
            median_return: number;
            probability_of_profit: number;
            worst_case_return: number;
            best_case_return: number;
            confidence_intervals: Array<{
                confidence_level: number;
                lower_bound: number;
                upper_bound: number;
            }>;
        };
    }> {
        return axiosClient.post(apiConfig.endpoints.backtest.monteCarlo, config);
    },

    // Get backtest results by ID
    async getResults(backtestId: string): Promise<BacktestResult> {
        return axiosClient.get(apiConfig.endpoints.backtest.results, {
            urlParams: { backtest_id: backtestId }
        });
    },

    // Compare multiple backtests
    async compareBacktests(config: BacktestComparison): Promise<{
        comparisons: Array<{
            backtest_id: string;
            metrics: Record<string, number>;
            ranking: number;
        }>;
        summary: {
            best_backtest_id: string;
            worst_backtest_id: string;
            average_metrics: Record<string, number>;
        };
    }> {
        return axiosClient.post(apiConfig.endpoints.backtest.compare, config);
    },

    // Generate detailed report
    async generateReport(backtestId: string): Promise<BacktestReport> {
        return axiosClient.get(apiConfig.endpoints.backtest.report, {
            urlParams: { backtest_id: backtestId }
        });
    },

    // Get available backtest metrics
    async getAvailableMetrics(): Promise<Array<{
        id: string;
        name: string;
        description: string;
        category: string;
        default: boolean;
        formula?: string;
    }>> {
        return axiosClient.get(apiConfig.endpoints.backtest.availableMetrics);
    },

    // Get user's saved backtests
    async getSavedBacktests(
        page: number = 1,
        limit: number = 20,
        filters?: {
            strategy_id?: string;
            symbol?: string;
            market?: string;
            status?: 'completed' | 'running' | 'failed';
            date_from?: string;
            date_to?: string;
        }
    ): Promise<{
        backtests: BacktestResult[];
        total: number;
        page: number;
        pages: number;
    }> {
        return axiosClient.get(`${apiConfig.endpoints.backtest.results}/saved`, {
            params: { page, limit, ...filters }
        });
    },

    // Save backtest results
    async saveBacktest(
        backtestId: string,
        name: string,
        description?: string,
        tags?: string[]
    ): Promise<{ saved_id: string; message: string }> {
        return axiosClient.post(`${apiConfig.endpoints.backtest.results}/${backtestId}/save`, {
            name,
            description,
            tags
        });
    },

    // Delete saved backtest
    async deleteBacktest(savedId: string): Promise<{ message: string }> {
        return axiosClient.delete(`${apiConfig.endpoints.backtest.results}/saved/${savedId}`);
    },

    // Export backtest results
    async exportBacktest(
        backtestId: string,
        format: 'csv' | 'json' | 'pdf' = 'json'
    ): Promise<{ url: string; expires_at: string }> {
        return axiosClient.get(`${apiConfig.endpoints.backtest.results}/${backtestId}/export`, {
            params: { format }
        });
    },

    // Clone backtest
    async cloneBacktest(
        backtestId: string,
        modifications?: Partial<BacktestConfig>
    ): Promise<BacktestResult> {
        return axiosClient.post(`${apiConfig.endpoints.backtest.results}/${backtestId}/clone`, {
            modifications
        });
    },

    // Get backtest status
    async getBacktestStatus(backtestId: string): Promise<{
        status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
        progress?: number;
        estimated_completion?: string;
        error_message?: string;
    }> {
        return axiosClient.get(`${apiConfig.endpoints.backtest.results}/${backtestId}/status`);
    },

    // Cancel running backtest
    async cancelBacktest(backtestId: string): Promise<{ message: string }> {
        return axiosClient.post(`${apiConfig.endpoints.backtest.results}/${backtestId}/cancel`);
    },

    // Get backtest parameters
    async getBacktestParameters(strategyId: string): Promise<{
        parameters: Record<string, {
            type: string;
            default: any;
            min?: number;
            max?: number;
            step?: number;
            options?: any[];
            description: string;
        }>;
        required: string[];
    }> {
        return axiosClient.get(apiConfig.endpoints.backtest.parameters, {
            urlParams: { strategy_id: strategyId }
        });
    },

    // Optimize strategy parameters
    async optimizeParameters(
        config: BacktestConfig,
        parameterRanges: Record<string, { min: number; max: number; step: number }>,
        optimizationMetric: string = 'sharpe_ratio',
        maxIterations: number = 100
    ): Promise<{
        best_parameters: Record<string, any>;
        best_metric_value: number;
        optimization_history: Array<{
            iteration: number;
            parameters: Record<string, any>;
            metrics: Record<string, number>;
        }>;
    }> {
        return axiosClient.post(`${apiConfig.endpoints.backtest.run}/optimize`, {
            config,
            parameter_ranges: parameterRanges,
            optimization_metric: optimizationMetric,
            max_iterations: maxIterations
        });
    },

    // Get backtest statistics
    async getBacktestStatistics(
        backtestIds: string[],
        metrics: string[]
    ): Promise<Record<string, Record<string, number>>> {
        return axiosClient.post(`${apiConfig.endpoints.backtest.compare}/statistics`, {
            backtest_ids: backtestIds,
            metrics
        });
    },

    // Stream live backtest results (for long-running backtests)
    async streamBacktestResults(
        backtestId: string,
        onUpdate: (data: Partial<BacktestResult>) => void
    ): Promise<() => void> {
        // Implementation for WebSocket streaming
        // This would connect to a WebSocket endpoint for live updates
        throw new Error('Not implemented: Use WebSocket service for streaming');
    },

    // Validate backtest configuration
    async validateConfig(config: BacktestConfig): Promise<{
        valid: boolean;
        errors: string[];
        warnings: string[];
    }> {
        return axiosClient.post(`${apiConfig.endpoints.backtest.run}/validate`, config);
    },

    // Get historical backtest performance
    async getHistoricalPerformance(
        strategyId: string,
        days: number = 365
    ): Promise<Array<{
        date: string;
        performance: number;
        trades: number;
        win_rate: number;
    }>> {
        return axiosClient.get(`${apiConfig.endpoints.backtest.results}/historical`, {
            params: { strategy_id: strategyId, days }
        });
    }
};