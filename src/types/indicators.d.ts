/**
 * تعريفات TypeScript لنظام المؤشرات
 */

import { UTCTimestamp } from 'lightweight-charts';

/**
 * نقطة بيانات واحدة للمؤشر
 */
export interface IndicatorPoint {
    time: UTCTimestamp;
    value: number;
}

/**
 * بيانات المؤشر الكاملة من الباك إند
 */
export interface ServerIndicatorData {
    name: string;
    values: number[];
    signals: {
        data: number[];
        index: string[];
        dtype: string;
    } | null;
    metadata: {
        [key: string]: any;
        period?: number;
        upper_band?: number[];
        lower_band?: number[];
        sma?: number[];
        overbought?: number;
        oversold?: number;
    };
}

/**
 * رسالة WebSocket من الباك إند
 */
export interface WebSocketMessage {
    type: 'chart_initialized' | 'price_update' | 'candle_closed' | 'indicator_added' | 'error';
    symbol?: string;
    timeframe?: string;
    market?: string;
    data?: {
        symbol: string;
        timeframe: string;
        candles: any[];
        indicators: any[];
        indicators_results: Record<string, ServerIndicatorData>;
        metadata: {
            total_candles: number;
            last_update: number;
            subscribers: number;
        };
    };
    live_candle?: {
        time: number;
        open: number;
        high: number;
        low: number;
        close: number;
        volume: number;
    };
    closed_candle?: {
        time: number;
        open: number;
        high: number;
        low: number;
        close: number;
        volume: number;
    };
    indicators?: Record<string, ServerIndicatorData>;
    indicator?: string;
    indicators_results?: Record<string, ServerIndicatorData>;
    message?: string;
    time: number;
}

/**
 * أنواع المؤشرات المدعومة
 */
export type IndicatorType = 'rsi' | 'atr' | 'bollinger' | 'ma' | 'ema' | 'sma' | 'macd' | 'stochastic';

/**
 * معاملات إضافة مؤشر
 */
export interface AddIndicatorParams {
    period?: number;
    std_dev?: number;
    fast_period?: number;
    slow_period?: number;
    signal_period?: number;
    k_period?: number;
    d_period?: number;
    [key: string]: any;
}

/**
 * إجراءات WebSocket
 */
export interface WebSocketAction {
    action: 'subscribe' | 'unsubscribe' | 'add_indicator' | 'remove_indicator' | 'change_timeframe';
    symbol?: string;
    timeframe?: string;
    market?: string;
    indicator?: IndicatorType;
    indicator_id?: string;
    params?: AddIndicatorParams;
}
