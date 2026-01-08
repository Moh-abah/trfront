
// @ts-nocheck
import { WebSocketConnection } from './connection';
import {
    WebSocketConfig,
    Subscription,
    SubscriptionType,
    WebSocketEventType,
    PriceUpdateEvent,
    TradeEvent,
    CandleEvent,
    SignalEvent,
} from './events';

export interface StreamOptions {
    symbol: string;
    timeframe?: string;
    indicators?: string[];
    depth?: number;
}

export interface StreamHandler {
    onPriceUpdate?: (data: PriceUpdateEvent) => void;
    onTrade?: (data: TradeEvent) => void;
    onCandle?: (data: CandleEvent) => void;
    onSignal?: (data: SignalEvent) => void;
    onError?: (error: Error) => void;
}

export class StreamManager {
    private connection: WebSocketConnection;
    private activeStreams: Map<string, Subscription> = new Map();
    private streamHandlers: Map<string, StreamHandler> = new Map();
    private isInitialized = false;

    constructor(private config: WebSocketConfig) {
        this.connection = new WebSocketConnection(config, (connected) => {
            if (connected) {
                this.resubscribeAll();
            }
        });

        this.setupEventHandlers();
    }

    // تهيئة المدير
    public async initialize(): Promise<void> {
        if (this.isInitialized) return;

        this.connection.connect();
        this.isInitialized = true;

        console.log('StreamManager initialized');
    }

    // إيقاف المدير
    public shutdown(): void {
        this.connection.disconnect();
        this.activeStreams.clear();
        this.streamHandlers.clear();
        this.isInitialized = false;

        console.log('StreamManager shutdown');
    }

    // بدء تدفق السعر
    public startPriceStream(symbols: string[], handler: StreamHandler): string[] {
        const streamIds: string[] = [];

        symbols.forEach(symbol => {
            const streamId = this.createStreamId(SubscriptionType.PRICE, symbol);

            const subscription: Subscription = {
                id: streamId,
                type: SubscriptionType.PRICE,
                symbol,
                created_at: Date.now(),
            };

            this.activeStreams.set(streamId, subscription);
            this.streamHandlers.set(streamId, handler);

            // الاشتراك عبر WebSocket
            this.connection.subscribe(`price:${symbol}`, {
                symbol,
                interval: 'realtime',
            });

            streamIds.push(streamId);
        });

        return streamIds;
    }

    // بدء تدفق الشموع
    public startCandleStream(
        symbol: string,
        timeframe: string,
        handler: StreamHandler
    ): string {
        const streamId = this.createStreamId(SubscriptionType.CANDLES, symbol, timeframe);

        const subscription: Subscription = {
            id: streamId,
            type: SubscriptionType.CANDLES,
            symbol,
            timeframe,
            created_at: Date.now(),
        };

        this.activeStreams.set(streamId, subscription);
        this.streamHandlers.set(streamId, handler);

        // الاشتراك عبر WebSocket
        this.connection.subscribe(`candles:${symbol}:${timeframe}`, {
            symbol,
            timeframe,
        });

        return streamId;
    }

    // بدء تدفق المؤشرات
    public startIndicatorStream(
        symbol: string,
        indicators: string[],
        handler: StreamHandler
    ): string {
        const streamId = this.createStreamId(SubscriptionType.INDICATORS, symbol);

        const subscription: Subscription = {
            id: streamId,
            type: SubscriptionType.INDICATORS,
            symbol,
            indicators,
            created_at: Date.now(),
        };

        this.activeStreams.set(streamId, subscription);
        this.streamHandlers.set(streamId, handler);

        // الاشتراك عبر WebSocket
        this.connection.subscribe(`indicators:${symbol}`, {
            symbol,
            indicators,
            interval: 'realtime',
        });

        return streamId;
    }

    // بدء تدفق الإشارات
    public startSignalStream(
        symbol: string,
        strategyId?: string,
        handler?: StreamHandler
    ): string {
        const streamId = this.createStreamId(SubscriptionType.SIGNALS, symbol, strategyId);

        const subscription: Subscription = {
            id: streamId,
            type: SubscriptionType.SIGNALS,
            symbol,
            strategy_id: strategyId,
            created_at: Date.now(),
        };

        this.activeStreams.set(streamId, subscription);
        if (handler) {
            this.streamHandlers.set(streamId, handler);
        }

        // الاشتراك عبر WebSocket
        const channel = strategyId
            ? `signals:${symbol}:${strategyId}`
            : `signals:${symbol}`;

        this.connection.subscribe(channel, {
            symbol,
            strategy_id: strategyId,
        });

        return streamId;
    }

    // إيقاف التدفق
    public stopStream(streamId: string): boolean {
        const subscription = this.activeStreams.get(streamId);
        if (!subscription) return false;

        // إلغاء الاشتراك عبر WebSocket
        const channel = this.getChannelFromSubscription(subscription);
        if (channel) {
            this.connection.unsubscribe(channel);
        }

        // إزالة التدفق
        this.activeStreams.delete(streamId);
        this.streamHandlers.delete(streamId);

        return true;
    }

    // الحصول على جميع التدفقات النشطة
    public getActiveStreams(): Subscription[] {
        return Array.from(this.activeStreams.values());
    }

    // التحقق من حالة الاتصال
    public isConnected(): boolean {
        return this.connection.isConnected();
    }

    public getConnectionStatus(): string {
        return this.connection.getStatus();
    }

    // ============= معالجات الأحداث =============

    private setupEventHandlers(): void {
        // معالجة تحديثات الأسعار
        this.connection.on(WebSocketEventType.PRICE_UPDATE, (data: PriceUpdateEvent) => {
            const streamId = this.createStreamId(SubscriptionType.PRICE, data.symbol);
            const handler = this.streamHandlers.get(streamId);
            handler?.onPriceUpdate?.(data);
        });

        // معالجة الصفقات
        this.connection.on(WebSocketEventType.TRADE, (data: TradeEvent) => {
            const streamId = this.createStreamId(SubscriptionType.TRADES, data.symbol);
            const handler = this.streamHandlers.get(streamId);
            handler?.onTrade?.(data);
        });

        // معالجة الشموع
        this.connection.on(WebSocketEventType.CANDLE, (data: CandleEvent) => {
            const streamId = this.createStreamId(SubscriptionType.CANDLES, data.symbol, data.timeframe);
            const handler = this.streamHandlers.get(streamId);
            handler?.onCandle?.(data);
        });

        // معالجة الإشارات
        this.connection.on(WebSocketEventType.SIGNAL, (data: SignalEvent) => {
            const streamId = this.createStreamId(
                SubscriptionType.SIGNALS,
                data.symbol,
                data.strategy
            );
            const handler = this.streamHandlers.get(streamId);
            handler?.onSignal?.(data);
        });

        // معالجة الأخطاء
        this.connection.on(WebSocketEventType.ERROR, (error) => {
            console.error('WebSocket stream error:', error);

            // إرسال الخطأ لكل معالج
            this.streamHandlers.forEach((handler) => {
                handler.onError?.(new Error(`WebSocket error: ${JSON.stringify(error)}`));
            });
        });
    }

    // ============= مساعدات =============

    private createStreamId(
        type: SubscriptionType,
        symbol?: string,
        suffix?: string
    ): string {
        const parts = [type];
        if (symbol) parts.push(symbol);
        if (suffix) parts.push(suffix);
        return parts.join(':');
    }

    private getChannelFromSubscription(subscription: Subscription): string {
        switch (subscription.type) {
            case SubscriptionType.PRICE:
                return `price:${subscription.symbol}`;
            case SubscriptionType.CANDLES:
                return `candles:${subscription.symbol}:${subscription.timeframe}`;
            case SubscriptionType.INDICATORS:
                return `indicators:${subscription.symbol}`;
            case SubscriptionType.SIGNALS:
                return subscription.strategy_id
                    ? `signals:${subscription.symbol}:${subscription.strategy_id}`
                    : `signals:${subscription.symbol}`;
            default:
                return '';
        }
    }

    private resubscribeAll(): void {
        console.log('Resubscribing to all active streams...');

        this.activeStreams.forEach((subscription) => {
            const channel = this.getChannelFromSubscription(subscription);
            if (channel) {
                this.connection.subscribe(channel, {
                    symbol: subscription.symbol,
                    timeframe: subscription.timeframe,
                    indicators: subscription.indicators,
                    strategy_id: subscription.strategy_id,
                });
            }
        });
    }
}

// إنشاء نسخة عامة للمدير
export const streamManager = new StreamManager({
    url: process.env.NEXT_PUBLIC_WS_URL || 'ws://62.169.17.101:8017/ws',
    reconnectAttempts: 5,
    reconnectDelay: 1000,
    heartbeatInterval: 30000,
    connectionTimeout: 10000,
});