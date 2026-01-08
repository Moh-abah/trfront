// src/services/api/strategy.service.ts
import { StrategyConfig } from '@/types/strategies/strategy';
import { axiosClient } from './http/axios.client';
import { apiConfig } from '@/config/api.config';
import { ChartData } from '@/types/chart.types';


export interface StrategyRunRequest {
    strategy: StrategyConfig;
    data: ChartData[];
    symbol: string;
    timeframe: string;
    market: string;
    parameters?: Record<string, any>;
}

export interface StrategyRunResult {
    signals: Array<{
        timestamp: number;
        signal: 'buy' | 'sell' | 'hold';
        strength: number;
        price: number;
        indicators: Record<string, number>;
        metadata?: any;
    }>;
    positions: Array<{
        entry_time: number;
        exit_time?: number;
        entry_price: number;
        exit_price?: number;
        quantity: number;
        side: 'long' | 'short';
        pnl?: number;
        pnl_percent?: number;
    }>;
    performance: {
        total_return: number;
        win_rate: number;
        profit_factor: number;
        max_drawdown: number;
        sharpe_ratio: number;
        total_trades: number;
        winning_trades: number;
        losing_trades: number;
    };
    metadata: {
        execution_time: number;
        strategy_version: string;
        parameters_used: Record<string, any>;
    };
}

export interface StrategyValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
}

export interface StrategyTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    parameters: Record<string, any>;
    default_parameters: Record<string, any>;
    code?: string;
    language: 'python' | 'javascript';
    author?: string;
    rating: number;
    downloads: number;
    created_at: string;
    updated_at: string;
}

export interface StrategyExample {
    name: string;
    description: string;
    code: string;
    parameters: Record<string, any>;
    backtest_results?: any;
}

export const strategyService = {
    // Run strategy on data
    async runStrategy(request: StrategyRunRequest): Promise<StrategyRunResult> {
        return axiosClient.post(apiConfig.endpoints.strategies.run, request);
    },

    // Validate strategy configuration
    async validateStrategy(strategy: StrategyConfig): Promise<StrategyValidationResult> {
        return axiosClient.post(apiConfig.endpoints.strategies.validate, strategy);
    },

    // Save strategy
    async saveStrategy(strategy: Omit<StrategyConfig, 'id' | 'created_at' | 'updated_at'>): Promise<StrategyConfig> {
        return axiosClient.post(apiConfig.endpoints.strategies.save, strategy);
    },

    // Upload strategy file
    async uploadStrategy(file: File): Promise<StrategyConfig> {
        return axiosClient.upload(apiConfig.endpoints.strategies.upload, file);
    },

    // Get all strategies
    async listStrategies(
        filters?: {
            category?: string;
            author?: string;
            market?: string;
            timeframe?: string;
            tags?: string[];
        },
        page: number = 1,
        limit: number = 20
    ): Promise<{
        strategies: StrategyConfig[];
        total: number;
        page: number;
        pages: number;
    }> {
        return axiosClient.get(apiConfig.endpoints.strategies.list, {
            params: { ...filters, page, limit }
        });
    },

    // Update strategy
    async updateStrategy(strategyId: string, updates: Partial<StrategyConfig>): Promise<StrategyConfig> {
        return axiosClient.put(apiConfig.endpoints.strategies.update, updates, {
            urlParams: { strategy_id: strategyId }
        });
    },

    // Reload strategy
    async reloadStrategy(strategyName: string): Promise<{ message: string }> {
        return axiosClient.post(apiConfig.endpoints.strategies.reload, {}, {
            urlParams: { strategy_name: strategyName }
        });
    },

    // Get strategy examples
    async getStrategyExamples(exampleName?: string): Promise<StrategyExample | StrategyExample[]> {
        if (exampleName) {
            return axiosClient.get(apiConfig.endpoints.strategies.examples, {
                urlParams: { example_name: exampleName }
            });
        }
        return axiosClient.get(`${apiConfig.endpoints.strategies.examples}/all`);
    },

    // Get strategy template
    async getStrategyTemplate(templateId: string): Promise<StrategyTemplate> {
        return axiosClient.get(`${apiConfig.endpoints.strategies.template}`, {
            urlParams: { template_id: templateId }
        });
    },

    // Backtest strategy
    async backtestStrategy(strategyId: string, config: any): Promise<any> {
        return axiosClient.post(`${apiConfig.endpoints.strategies.backtest}`, config, {
            urlParams: { strategy_id: strategyId }
        });
    },

    // Get strategy signals
    async getStrategySignals(strategyId: string, limit: number = 50): Promise<Array<{
        timestamp: string;
        symbol: string;
        signal: 'buy' | 'sell' | 'hold';
        strength: number;
        price: number;
        metadata?: any;
    }>> {
        return axiosClient.get(`${apiConfig.endpoints.strategies.signals}`, {
            urlParams: { strategy_id: strategyId },
            params: { limit }
        });
    },

    // Clone strategy
    async cloneStrategy(strategyId: string, newName?: string): Promise<StrategyConfig> {
        return axiosClient.post(`${apiConfig.endpoints.strategies.update}/clone`, {
            new_name: newName
        }, {
            urlParams: { strategy_id: strategyId }
        });
    },

    // Export strategy
    async exportStrategy(strategyId: string, format: 'json' | 'yaml' | 'code' = 'json'): Promise<{
        content: string;
        filename: string;
    }> {
        return axiosClient.get(`${apiConfig.endpoints.strategies.update}/export`, {
            urlParams: { strategy_id: strategyId },
            params: { format }
        });
    },

    // Import strategy
    async importStrategy(config: string, format: 'json' | 'yaml' = 'json'): Promise<StrategyConfig> {
        return axiosClient.post(`${apiConfig.endpoints.strategies.update}/import`, {
            config,
            format
        });
    },

    // Test strategy with sample data
    async testStrategy(
        strategy: StrategyConfig,
        sampleData: ChartData[]
    ): Promise<{
        results: StrategyRunResult;
        performance: {
            execution_time: number;
            memory_usage: number;
            errors?: string[];
        };
    }> {
        return axiosClient.post(`${apiConfig.endpoints.strategies.run}/test`, {
            strategy,
            sample_data: sampleData
        });
    },

    // Optimize strategy parameters
    async optimizeStrategy(
        strategy: StrategyConfig,
        parameterRanges: Record<string, { min: number; max: number; step: number }>,
        optimizationMetric: string = 'sharpe_ratio',
        data: ChartData[],
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
        return axiosClient.post(`${apiConfig.endpoints.strategies.run}/optimize`, {
            strategy,
            parameter_ranges: parameterRanges,
            optimization_metric: optimizationMetric,
            data,
            max_iterations: maxIterations
        });
    },

    // Compare strategies
    async compareStrategies(
        strategies: StrategyConfig[],
        data: ChartData[],
        metrics: string[] = ['total_return', 'sharpe_ratio', 'max_drawdown']
    ): Promise<Array<{
        strategy: StrategyConfig;
        metrics: Record<string, number>;
        ranking: number;
    }>> {
        return axiosClient.post(`${apiConfig.endpoints.strategies.run}/compare`, {
            strategies,
            data,
            metrics
        });
    },

    // Get strategy performance history
    async getStrategyPerformance(
        strategyId: string,
        days: number = 30
    ): Promise<Array<{
        date: string;
        performance: number;
        trades: number;
        win_rate: number;
        drawdown: number;
    }>> {
        return axiosClient.get(`${apiConfig.endpoints.strategies.update}/performance`, {
            urlParams: { strategy_id: strategyId },
            params: { days }
        });
    },

    // Get strategy risk metrics
    async getStrategyRiskMetrics(
        strategyId: string
    ): Promise<{
        value_at_risk: number;
        expected_shortfall: number;
        volatility: number;
        beta: number;
        alpha: number;
    }> {
        return axiosClient.get(`${apiConfig.endpoints.strategies.update}/risk-metrics`, {
            urlParams: { strategy_id: strategyId }
        });
    },

    // Get strategy correlation
    async getStrategyCorrelation(
        strategyIds: string[],
        market: string,
        timeframe: string
    ): Promise<{
        correlation_matrix: number[][];
        strategies: string[];
        recommendations: Array<{
            strategy_pair: [string, string];
            correlation: number;
            recommendation: string;
        }>;
    }> {
        return axiosClient.post(`${apiConfig.endpoints.strategies.update}/correlation`, {
            strategy_ids: strategyIds,
            market,
            timeframe
        });
    },

    // Generate strategy code
    async generateStrategyCode(
        strategy: StrategyConfig,
        language: 'python' | 'javascript' = 'python'
    ): Promise<{
        code: string;
        dependencies: string[];
        warnings: string[];
    }> {
        return axiosClient.post(`${apiConfig.endpoints.strategies.update}/generate-code`, {
            strategy,
            language
        });
    },

    // Get strategy dependencies
    async getStrategyDependencies(strategyId: string): Promise<{
        indicators: string[];
        data_sources: string[];
        libraries: string[];
    }> {
        return axiosClient.get(`${apiConfig.endpoints.strategies.update}/dependencies`, {
            urlParams: { strategy_id: strategyId }
        });
    },

    // Deploy strategy to trading bot
    async deployStrategy(
        strategyId: string,
        deploymentConfig: {
            exchange: string;
            symbol: string;
            timeframe: string;
            capital: number;
            risk_per_trade: number;
        }
    ): Promise<{
        deployment_id: string;
        status: string;
        message: string;
    }> {
        return axiosClient.post(`${apiConfig.endpoints.strategies.update}/deploy`, {
            deployment_config: deploymentConfig
        }, {
            urlParams: { strategy_id: strategyId }
        });
    },

    // Get strategy deployment status
    async getStrategyDeploymentStatus(deploymentId: string): Promise<{
        status: 'running' | 'paused' | 'stopped' | 'error';
        performance: any;
        last_trade?: any;
        error_message?: string;
    }> {
        return axiosClient.get(`${apiConfig.endpoints.strategies.update}/deployment/${deploymentId}`);
    },

    // Stop strategy deployment
    async stopStrategyDeployment(deploymentId: string): Promise<{ message: string }> {
        return axiosClient.post(`${apiConfig.endpoints.strategies.update}/deployment/${deploymentId}/stop`);
    },

    // Get strategy templates by category
    async getStrategyTemplatesByCategory(category: string): Promise<StrategyTemplate[]> {
        return axiosClient.get(`${apiConfig.endpoints.strategies.template}/category/${category}`);
    },

    // Create strategy from template
    async createStrategyFromTemplate(
        templateId: string,
        parameters?: Record<string, any>,
        customizations?: Partial<StrategyConfig>
    ): Promise<StrategyConfig> {
        return axiosClient.post(`${apiConfig.endpoints.strategies.template}/create`, {
            parameters,
            customizations
        }, {
            urlParams: { template_id: templateId }
        });
    },

    // Rate strategy template
    async rateStrategyTemplate(
        templateId: string,
        rating: number,
        comment?: string
    ): Promise<{
        average_rating: number;
        user_rating: number;
        total_ratings: number;
    }> {
        return axiosClient.post(`${apiConfig.endpoints.strategies.template}/rate`, {
            rating,
            comment
        }, {
            urlParams: { template_id: templateId }
        });
    }
};