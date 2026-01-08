export type SignalType = 'buy' | 'sell' | 'hold' | 'neutral';
export type SignalStrength = 'strong' | 'medium' | 'weak';
export type MarketType = 'crypto' | 'stocks' | 'forex' | 'commodities';
export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M';

export interface IndicatorValue {
    name: string;
    value: number;
    parameters?: Record<string, any>;
}

export interface TradingSignal {
    id: string;
    symbol: string;
    name?: string;
    type: SignalType;
    strength: SignalStrength;
    confidence: number; // 0-100
    price: number;
    timestamp: string;
    timeframe: Timeframe;
    market: MarketType;

    // Entry/Exit levels
    entryLevels?: number[];
    stopLoss?: number;
    takeProfit?: number[];

    // Indicators that triggered the signal
    indicators?: IndicatorValue[];

    // Strategy info
    strategyId?: string;
    strategyName?: string;

    // Additional metadata
    volume?: number;
    change?: number;
    changePercent?: number;

    // User interactions
    isFavorite?: boolean;
    notes?: string;
    tags?: string[];
}

export interface SignalFilter {
    signalType: SignalType | 'all';
    market: MarketType | 'all';
    timeframe: Timeframe | 'all';
    strength: SignalStrength | 'all';
    fromDate: string | null;
    toDate: string | null;
    minConfidence: number;
    maxConfidence: number;
    symbols: string[];
}

export interface Alert {
    id: string;
    symbol: string;
    type: 'price' | 'indicator' | 'volume' | 'pattern';
    condition: 'above' | 'below' | 'crosses_above' | 'crosses_below';
    value: number;
    enabled: boolean;
    notificationTypes: ('email' | 'push' | 'sound')[];
    createdAt: string;
    triggeredAt?: string;
}

export interface AlertSettings {
    priceAlerts: Alert[];
    indicatorAlerts: Alert[];
    volumeAlerts: Alert[];
    patternAlerts: Alert[];
}