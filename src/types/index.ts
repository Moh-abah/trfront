// Export all types from a single entry point

export * from './indicators/signal.types';

export * from './strategies/backtest.types';

export * from './indicators/signal.types';

export * from './chart.types';

// export * from './settings.types';

// export * from './filter.types';
// src/types/signals.ts





















// types/index.ts
export type Timeframe =
    | '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M';

export interface ChartData {
    timestamp: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface Drawing {
    id: string;
    type: 'line' | 'ray' | 'horizontal' | 'vertical' | 'rectangle' | 'circle' | 'fibonacci';
    points: { x: number; y: number }[];
    color: string;
    width: number;
    style: 'solid' | 'dashed' | 'dotted';
    label?: string;
}

export interface IndicatorConfig {
    id: string;
    name: string;
    type: 'overlay' | 'oscillator';
    parameters: Record<string, any>;
    color: string;
    visible: boolean;
    data?: any[];
}

export interface StrategyConfig {
    id: string;
    name: string;
    description: string;
    conditions: any[];
    parameters: Record<string, any>;
    risk_per_trade?: number;
    take_profit?: number;
    stop_loss?: number;
}

export interface FilterCriteria {
    conditions: FilterCondition[];
    logic: 'AND' | 'OR';
}

export interface FilterCondition {
    field: string;
    operator: string;
    value: any;
}

export interface PriceUpdate {
    symbol: string;
    current: number;
    change24h: number;
    volume24h: number;
    marketCap?: number;
    timestamp: string;
}

export interface MarketSymbol {
    symbol: string;
    name: string;
    market: 'crypto' | 'stocks';
    type: string;
}
































export interface TradingSignal {
    id: string;
    symbol: string;
    price: number;
    side: 'buy' | 'sell';
    strategy: string;
    timestamp: string;
    read?: boolean;
    profit?: number;
    stopLoss?: number;
    takeProfit?: number;
    entryPrice?: number;
    exitPrice?: number;
    status?: 'active' | 'closed' | 'pending';
    [key: string]: any;
}

export interface SignalFilter {
    symbol?: string;
    strategy?: string;
    side?: 'buy' | 'sell';
    startDate?: string;
    endDate?: string;
    read?: boolean;
    status?: 'active' | 'closed' | 'pending';
    minProfit?: number;
    maxProfit?: number;
}

export interface SignalStats {
    total: number;
    unread: number;
    bySymbol: Record<string, number>;
    byStrategy: Record<string, number>;
    totalProfit: number;
    profitableSignals: number;
    winRate: number;
}

export interface ChartData {
    symbol: string;
    timeframe: string;
    data: Array<{
        timestamp: string;
        open: number;
        high: number;
        low: number;
        close: number;
        volume: number;
    }>;
}