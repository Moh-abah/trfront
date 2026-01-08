// أنواع الاستراتيجيات والقواعد
export enum ConditionType {
    AND = 'AND',
    OR = 'OR',
    NOT = 'NOT',
}

export enum ComparisonOperator {
    EQUAL = '==',
    NOT_EQUAL = '!=',
    GREATER_THAN = '>',
    GREATER_THAN_OR_EQUAL = '>=',
    LESS_THAN = '<',
    LESS_THAN_OR_EQUAL = '<=',
    CROSS_ABOVE = 'CROSS_ABOVE',
    CROSS_BELOW = 'CROSS_BELOW',
    CROSS = 'CROSS',
    BETWEEN = 'BETWEEN',
    OUTSIDE = 'OUTSIDE',
}

export enum ValueType {
    NUMBER = 'number',
    PERCENTAGE = 'percentage',
    PRICE = 'price',
    INDICATOR = 'indicator',
    STRING = 'string',
    BOOLEAN = 'boolean',
    TIMESTAMP = 'timestamp',
}

export interface ConditionValue {
    type: ValueType;
    value: any;
    source?: string; // 'indicator', 'price', 'custom'
    indicatorId?: string;
    parameter?: string;
}

export interface RuleCondition {
    id: string;
    type: ConditionType;
    leftOperand: ConditionValue;
    operator: ComparisonOperator;
    rightOperand: ConditionValue | ConditionValue[];
    children?: RuleCondition[];
}

export interface TradingRule {
    id: string;
    name: string;
    description: string;
    entryCondition: RuleCondition;
    exitCondition?: RuleCondition;
    stopLoss?: RuleCondition;
    takeProfit?: RuleCondition;
    positionSize?: number; // نسبة من رأس المال
    maxPosition?: number; // أقصى عدد صفقات متزامنة
    trailingStop?: boolean;
    trailingDistance?: number; // نسبة للتريلينج ستوب
}

export interface Strategy {
    id: string;
    name: string;
    description: string;
    version: string;
    author: string;
    category: string;
    symbols: string[];
    timeframe: string;
    rules: TradingRule[];
    parameters: Record<string, any>;
    initialCapital: number;
    commission: number;
    slippage: number;
    backtestResults?: BacktestResult;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    isPublic: boolean;
    tags: string[];
}

export interface BacktestResult {
    totalReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
    totalTrades: number;
    profitableTrades: number;
    losingTrades: number;
    avgProfit: number;
    avgLoss: number;
    profitFactor: number;
    equityCurve: Array<{ timestamp: string; equity: number }>;
    trades: Array<Trade>;
}

export interface Trade {
    id: string;
    symbol: string;
    entryPrice: number;
    exitPrice: number;
    quantity: number;
    side: 'LONG' | 'SHORT';
    entryTime: string;
    exitTime: string;
    pnl: number;
    pnlPercentage: number;
    reason: 'TAKE_PROFIT' | 'STOP_LOSS' | 'EXIT_SIGNAL' | 'MANUAL';
}

export interface StrategyTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    icon: string;
    rules: TradingRule[];
    parameters: Record<string, any>;
    popularity: number;
    successRate: number;
}

export interface StrategyPerformance {
    strategyId: string;
    symbol: string;
    timeframe: string;
    performance: {
        daily: number;
        weekly: number;
        monthly: number;
        yearly: number;
    };
    metrics: {
        sharpe: number;
        sortino: number;
        calmar: number;
        volatility: number;
    };
}