// types/chart.types.ts
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
    type: 'line' | 'ray' | 'horizontal' | 'vertical' | 'rectangle' | 'circle' | 'fibonacci' | 'text';
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

export interface IndicatorSignal {
    indicator: string;
    signal: 'buy' | 'sell' | 'neutral';
    value: number;
    timestamp: Date;
    strength: number;
    message?: string;
}

export interface StrategyConfig {
    id: string;
    name: string;
    description?: string;
    type: string;
    parameters: Record<string, any>;
    conditions?: any[];
    active: boolean;
}

export interface StrategyResults {
    total_trades: number;
    win_rate: number;
    profit_loss: number;
    max_drawdown: number;
    sharpe_ratio?: number;
    trades: any[];
    equity_curve: any[];
    performance_metrics: Record<string, any>;
}

export interface ChartLayout {
    id: string;
    name: string;
    symbol: string;
    market: string;
    timeframe: string;
    indicators: IndicatorConfig[];
    drawings: Drawing[];
    settings: any;
    createdAt: Date;
    updatedAt: Date;
}

export type Timeframe =
    | '1m' | '5m' | '15m' | '30m'
    | '1h' | '4h' | '1d' | '1w' | '1M';