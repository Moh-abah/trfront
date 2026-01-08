export interface CandleEvent {
    symbol: string;
    timeframe: string;
    candle: {
        timestamp: string;
        open: number;
        high: number;
        low: number;
        close: number;
        volume: number;
    };
}

export interface PriceUpdateEvent {
    symbol: string;
    price: number;
    change: number;
    change_percent: number;
    volume: number;
    timestamp: string;
}

export interface SignalEvent {
    id: string;
    symbol: string;
    type: 'buy' | 'sell' | 'hold';
    strength: number;
    reason: string;
    timestamp: string;
    price_at_signal: number;
    target_price?: number;
    stop_loss?: number;
    timeframe: string;
    indicator?: string;
    confidence: number;
}

export interface IndicatorUpdateEvent {
    symbol: string;
    timeframe: string;
    indicator: string;
    values: any[];
    timestamp: string;
}

export interface WebSocketMessage {
    type: 'price_update' | 'new_signal' | 'chart_data' | 'heartbeat' | 'error';
    data: any;
    timestamp: string;
}