export type TradingAction = 'buy' | 'sell' | 'hold' | 'close';
export type RuleOperator = 'and' | 'or';
export type ComparisonOperator =
    | 'greater_than'
    | 'less_than'
    | 'greater_equal'
    | 'less_equal'
    | 'equal'
    | 'not_equal'
    | 'crosses_above'
    | 'crosses_below';

export interface RuleCondition {
    id: string;
    leftOperand: string; // مثل "RSI", "price", "volume"
    operator: ComparisonOperator;
    rightOperand: number | string;
    timeframe?: string;
}

export interface TradingRule {
    id: string;
    name: string;
    conditions: RuleCondition[];
    operator: RuleOperator; // and/or
    action: TradingAction;
    priority: number;
    enabled: boolean;
    metadata?: Record<string, any>;
}

export interface Strategy {
    id: string;
    name: string;
    description?: string;
    version: string;
    author?: string;
    category: 'trend' | 'mean_reversion' | 'breakout' | 'scalping' | 'swing';
    rules: TradingRule[];
    parameters: Record<string, {
        type: 'number' | 'string' | 'boolean' | 'select';
        default: any;
        min?: number;
        max?: number;
        options?: string[];
        description?: string;
    }>;

    // Risk management
    riskManagement: {
        stopLoss?: number;
        takeProfit?: number;
        positionSize?: number;
        maxRiskPerTrade?: number;
        maxOpenTrades?: number;
    };

    // Performance tracking
    performance?: {
        winRate: number;
        profitFactor: number;
        sharpeRatio: number;
        maxDrawdown: number;
        totalTrades: number;
    };

    // Metadata
    tags?: string[];
    createdAt: string;
    updatedAt: string;
    isPublic?: boolean;
    isTemplate?: boolean;
}

export interface StrategyExecution {
    id: string;
    strategyId: string;
    symbol: string;
    timeframe: string;
    status: 'running' | 'paused' | 'stopped' | 'completed';
    startTime: string;
    endTime?: string;
    parameters: Record<string, any>;
    results?: {
        totalTrades: number;
        winningTrades: number;
        losingTrades: number;
        totalProfit: number;
        maxDrawdown: number;
        winRate: number;
    };
}

// في ملف src/types/strategies/strategy.types.ts
export interface StrategyConfig {
    id: string;
    name: string;
    type: 'custom' | 'template' | 'system';
    category: 'trend' | 'mean_reversion' | 'breakout' | 'scalping' | 'swing' | 'arbitrage';
    version: string;
    author?: string;

    // Rules and conditions
    rules: Array<{
        id: string;
        name: string;
        conditions: Array<{
            indicator: string;
            operator: string;
            value: number | string;
            timeframe?: string;
        }>;
        operator: 'AND' | 'OR';
        action: 'buy' | 'sell' | 'hold' | 'close';
    }>;

    // Parameters
    parameters: Record<string, {
        type: 'number' | 'string' | 'boolean' | 'select';
        default: any;
        min?: number;
        max?: number;
        step?: number;
        options?: string[];
        description?: string;
    }>;

    // Risk management
    riskManagement: {
        stopLossType: 'percentage' | 'fixed' | 'atr';
        stopLossValue: number;
        takeProfitType: 'percentage' | 'fixed' | 'risk_reward';
        takeProfitValue: number;
        positionSizeType: 'percentage' | 'fixed' | 'risk_based';
        positionSizeValue: number;
        maxOpenTrades: number;
        maxRiskPerTrade: number;
        maxDailyLoss: number;
    };

    // Time settings
    timeframe: string;
    symbols: string[];
    marketType: 'crypto' | 'stocks' | 'forex' | 'all';

    // Performance tracking
    performance?: {
        winRate: number;
        profitFactor: number;
        sharpeRatio: number;
        maxDrawdown: number;
        totalTrades: number;
        avgTradeDuration: string;
        expectancy: number;
    };

    // Metadata
    description?: string;
    tags?: string[];
    isPublic: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    lastExecuted?: string;
}