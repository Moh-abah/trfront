// أنواع الرسائل والأحداث
export enum WebSocketEventType {
    // أحداث النظام
    CONNECT = 'connect',
    DISCONNECT = 'disconnect',
    ERROR = 'error',
    HEARTBEAT = 'heartbeat',

    // أحداث السوق
    PRICE_UPDATE = 'price_update',
    TRADE = 'trade',
    ORDER_BOOK = 'order_book',
    CANDLE = 'candle',
    VOLUME = 'volume',

    // أحداث المؤشرات
    INDICATOR_UPDATE = 'indicator_update',
    SIGNAL = 'signal',

    // أحداث الاستراتيجيات
    STRATEGY_SIGNAL = 'strategy_signal',
    BACKTEST_UPDATE = 'backtest_update',

    // أحداث المستخدم
    NOTIFICATION = 'notification',
    ALERT = 'alert',
}

export interface WebSocketMessage {
    type: WebSocketEventType;
    data: any;
    timestamp: number;
    channel?: string;
    subscription_id?: string;
}

export interface PriceUpdateEvent {
    symbol: string;
    price: number;
    change: number;
    change_percent: number;
    volume: number;
    timestamp: number;
    bid?: number;
    ask?: number;
    exchange?: string;
}

export interface TradeEvent {
    symbol: string;
    price: number;
    quantity: number;
    side: 'BUY' | 'SELL';
    timestamp: number;
    trade_id?: string;
    exchange?: string;
}

export interface CandleEvent {
    symbol: string;
    timeframe: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    timestamp: number;
    is_closed: boolean;
}

export interface OrderBookEvent {
    symbol: string;
    bids: Array<[number, number]>;
    asks: Array<[number, number]>;
    timestamp: number;
}

export interface IndicatorUpdateEvent {
    symbol: string;
    indicator: string;
    value: number;
    values?: number[];
    timestamp: number;
    parameters?: Record<string, any>;
}

export interface SignalEvent {
    symbol: string;
    signal: 'BUY' | 'SELL' | 'NEUTRAL';
    strength: number;
    indicator?: string;
    strategy?: string;
    timestamp: number;
    price?: number;
    reason?: string;
}

export interface NotificationEvent {
    id: string;
    type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
    action?: {
        label: string;
        url: string;
    };
}

export interface AlertEvent {
    id: string;
    symbol: string;
    condition: string;
    value: number;
    current_value: number;
    triggered_at: number;
    alert_type: 'PRICE' | 'INDICATOR' | 'VOLUME';
}

// أنواع الاشتراكات
export enum SubscriptionType {
    PRICE = 'price',
    TRADES = 'trades',
    CANDLES = 'candles',
    ORDER_BOOK = 'order_book',
    INDICATORS = 'indicators',
    SIGNALS = 'signals',
    STRATEGY = 'strategy',
    ALERTS = 'alerts',
}

export interface Subscription {
    id: string;
    type: SubscriptionType;
    symbol?: string;
    symbols?: string[];
    timeframe?: string;
    indicators?: string[];
    strategy_id?: string;
    parameters?: Record<string, any>;
    created_at: number;
}

export interface WebSocketConfig {
    url: string;
    reconnectAttempts: number;
    reconnectDelay: number;
    heartbeatInterval: number;
    connectionTimeout: number;
}