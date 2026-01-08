/**
 * ثوابت الإطارات الزمنية
 */

export interface Timeframe {
    value: string;
    label: string;
    description: string;
    milliseconds: number;
    seconds: number;
    minutes: number;
    hours: number;
    days: number;
    maxBars: number;
    refreshInterval: number;
    category: 'intraday' | 'daily' | 'weekly' | 'monthly';
}

export const TIMEFRAMES: Timeframe[] = [
    {
        value: '1m',
        label: '1 Minute',
        description: 'One minute candlesticks',
        milliseconds: 60000,
        seconds: 60,
        minutes: 1,
        hours: 0.01667,
        days: 0.000694,
        maxBars: 1440,
        refreshInterval: 1000,
        category: 'intraday'
    },
    {
        value: '5m',
        label: '5 Minutes',
        description: 'Five minute candlesticks',
        milliseconds: 300000,
        seconds: 300,
        minutes: 5,
        hours: 0.08333,
        days: 0.00347,
        maxBars: 288,
        refreshInterval: 5000,
        category: 'intraday'
    },
    {
        value: '15m',
        label: '15 Minutes',
        description: 'Fifteen minute candlesticks',
        milliseconds: 900000,
        seconds: 900,
        minutes: 15,
        hours: 0.25,
        days: 0.01042,
        maxBars: 96,
        refreshInterval: 15000,
        category: 'intraday'
    },
    {
        value: '30m',
        label: '30 Minutes',
        description: 'Thirty minute candlesticks',
        milliseconds: 1800000,
        seconds: 1800,
        minutes: 30,
        hours: 0.5,
        days: 0.02083,
        maxBars: 48,
        refreshInterval: 30000,
        category: 'intraday'
    },
    {
        value: '1h',
        label: '1 Hour',
        description: 'One hour candlesticks',
        milliseconds: 3600000,
        seconds: 3600,
        minutes: 60,
        hours: 1,
        days: 0.04167,
        maxBars: 24,
        refreshInterval: 60000,
        category: 'intraday'
    },
    {
        value: '4h',
        label: '4 Hours',
        description: 'Four hour candlesticks',
        milliseconds: 14400000,
        seconds: 14400,
        minutes: 240,
        hours: 4,
        days: 0.16667,
        maxBars: 6,
        refreshInterval: 240000,
        category: 'intraday'
    },
    {
        value: '1d',
        label: '1 Day',
        description: 'Daily candlesticks',
        milliseconds: 86400000,
        seconds: 86400,
        minutes: 1440,
        hours: 24,
        days: 1,
        maxBars: 365,
        refreshInterval: 300000,
        category: 'daily'
    },
    {
        value: '1w',
        label: '1 Week',
        description: 'Weekly candlesticks',
        milliseconds: 604800000,
        seconds: 604800,
        minutes: 10080,
        hours: 168,
        days: 7,
        maxBars: 52,
        refreshInterval: 3600000,
        category: 'weekly'
    },
    {
        value: '1M',
        label: '1 Month',
        description: 'Monthly candlesticks',
        milliseconds: 2592000000, // 30 days average
        seconds: 2592000,
        minutes: 43200,
        hours: 720,
        days: 30,
        maxBars: 60,
        refreshInterval: 86400000,
        category: 'monthly'
    }
];

export const TIMEFRAME_CATEGORIES = {
    INTRADAY: 'intraday',
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly'
} as const;

export type TimeframeCategory = typeof TIMEFRAME_CATEGORIES[keyof typeof TIMEFRAME_CATEGORIES];

export const DEFAULT_TIMEFRAME = '1d';
export const DEFAULT_MAX_BARS = 1000;
export const DEFAULT_REFRESH_INTERVAL = 5000;

export const TIMEFRAME_GROUPS = {
    INTRADAY: ['1m', '5m', '15m', '30m', '1h', '4h'],
    SWING: ['1d', '1w'],
    LONG_TERM: ['1M']
} as const;

/**
 * الحصول على معلومات الإطار الزمني
 */
export function getTimeframeInfo(timeframe: string): Timeframe | undefined {
    return TIMEFRAMES.find(tf => tf.value === timeframe);
}

/**
 * الحصول على الإطارات الزمنية حسب الفئة
 */
export function getTimeframesByCategory(category: TimeframeCategory): Timeframe[] {
    return TIMEFRAMES.filter(tf => tf.category === category);
}

/**
 * الحصول على الإطارات الزمنية المناسبة لنوع السوق
 */
export function getTimeframesByMarket(marketType: string): Timeframe[] {
    if (marketType === 'crypto') {
        return TIMEFRAMES; // كل الإطارات الزمنية متاحة للعملات الرقمية
    } else if (marketType === 'stocks') {
        // الأسهم لا تدعم الإطارات الزمنية الأقل من 1 دقيقة عادة
        return TIMEFRAMES.filter(tf => !tf.value.endsWith('s'));
    }
    return TIMEFRAMES;
}

/**
 * التحقق من صحة الإطار الزمني
 */
export function isValidTimeframe(timeframe: string): boolean {
    return TIMEFRAMES.some(tf => tf.value === timeframe);
}

