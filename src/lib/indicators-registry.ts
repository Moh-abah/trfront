
// @ts-nocheck


// Available Indicators from Backend Registry

import { IndicatorMetadata } from '@/types/backtest';

export const INDICATORS_REGISTRY: IndicatorMetadata[] = [
    // Trend Indicators
    {
        name: 'sma',
        display_name: 'SMA (Simple Moving Average)',
        description: 'المتوسط المتحرك البسيط',
        category: 'trend',
        default_params: { period: 20 },
        required_columns: ['close']
    },
    {
        name: 'sma_8_1h',
        display_name: 'SMA 8 (1H)',
        description: 'المتوسط المتحرك البسيط - فترة 8 ساعات',
        category: 'trend',
        default_params: { period: 8 },
        required_columns: ['close'],
        timeframe: '1h'
    },
    {
        name: 'sma_13_1h',
        display_name: 'SMA 13 (1H)',
        description: 'المتوسط المتحرك البسيط - فترة 13 ساعة',
        category: 'trend',
        default_params: { period: 13 },
        required_columns: ['close'],
        timeframe: '1h'
    },
    {
        name: 'sma_21_1h',
        display_name: 'SMA 21 (1H)',
        description: 'المتوسط المتحرك البسيط - فترة 21 ساعة',
        category: 'trend',
        default_params: { period: 21 },
        required_columns: ['close'],
        timeframe: '1h'
    },
    {
        name: 'sma_50_1h',
        display_name: 'SMA 50 (1H)',
        description: 'المتوسط المتحرك البسيط - فترة 50 ساعة',
        category: 'trend',
        default_params: { period: 50 },
        required_columns: ['close'],
        timeframe: '1h'
    },
    {
        name: 'sma_fast',
        display_name: 'SMA Fast',
        description: 'المتوسط المتحرك البسيط السريع',
        category: 'trend',
        default_params: { period: 10 },
        required_columns: ['close']
    },
    {
        name: 'sma_slow',
        display_name: 'SMA Slow',
        description: 'المتوسط المتحرك البسيط البطيء',
        category: 'trend',
        default_params: { period: 20 },
        required_columns: ['close']
    },
    {
        name: 'ema',
        display_name: 'EMA (Exponential Moving Average)',
        description: 'المتوسط المتحرك الأسي',
        category: 'trend',
        default_params: { period: 20 },
        required_columns: ['close']
    },
    {
        name: 'ema_9',
        display_name: 'EMA (Exponential Moving Average)',
        description: 'المتوسط المتحرك الأسي',
        category: 'trend',
        default_params: { period: 9 },
        required_columns: ['close']
    },
    {
        name: 'ema_21',
        display_name: 'EMA (Exponential Moving Average)',
        description: 'المتوسط المتحرك الأسي',
        category: 'trend',
        default_params: { period: 21 },
        required_columns: ['close']
    },
    {
        name: 'wma',
        display_name: 'WMA (Weighted Moving Average)',
        description: 'المتوسط المتحرك المرجح',
        category: 'trend',
        default_params: { period: 20 },
        required_columns: ['close']
    },

    // Momentum Indicators
    {
        name: 'momentum_5m',
        display_name: 'Momentum_A',
        description: 'مؤشر الزخم - فريم 5 دقائق',
        category: 'momentum',
        default_params: { period: 10 },
        required_columns: ['close'],
        timeframe: '5m'
    },
    {
        name: 'momentum_10m',
        display_name: 'Momentum_B',
        description: 'مؤشر الزخم - فريم 10 دقائق',
        category: 'momentum',
        default_params: { period: 10 },
        required_columns: ['close'],
        timeframe: '10m'
    },
    {
        name: 'momentum_15m',
        display_name: 'Momentum 15m',
        description: 'مؤشر الزخم - فريم 15 دقيقة',
        category: 'momentum',
        default_params: { period: 10 },
        required_columns: ['close'],
        timeframe: '15m'
    },
    {
        name: 'momentum_1h',
        display_name: 'Momentum 1H',
        description: 'مؤشر الزخم - فريم ساعة',
        category: 'momentum',
        default_params: { period: 10 },
        required_columns: ['close'],
        timeframe: '1h'
    },
    {
        name: 'rsi',
        display_name: 'RSI (Relative Strength Index)',
        description: 'مؤشر القوة النسبية',
        category: 'momentum',
        default_params: { period: 14, overbought: 70, oversold: 30 },
        required_columns: ['close']
    },
    {
        name: 'rsi_5m',
        display_name: 'RSI 5m',
        description: 'مؤشر القوة النسبية - فريم 5 دقائق',
        category: 'momentum',
        default_params: { period: 14, overbought: 70, oversold: 30 },
        required_columns: ['close'],
        timeframe: '5m'
    },
    {
        name: 'rsi_15m',
        display_name: 'RSI 15m',
        description: 'مؤشر القوة النسبية - فريم 15 دقيقة',
        category: 'momentum',
        default_params: { period: 14, overbought: 70, oversold: 30 },
        required_columns: ['close'],
        timeframe: '15m'
    },
    {
        name: 'rsi_1h',
        display_name: 'RSI 1H',
        description: 'مؤشر القوة النسبية - فريم ساعة',
        category: 'momentum',
        default_params: { period: 14, overbought: 70, oversold: 30 },
        required_columns: ['close'],
        timeframe: '1h'
    },
    {
        name: 'rsi_2h',
        display_name: 'RSI 2H',
        description: 'مؤشر القوة النسبية - فريم ساعتين',
        category: 'momentum',
        default_params: { period: 14, overbought: 70, oversold: 30 },
        required_columns: ['close'],
        timeframe: '2h'
    },
    {
        name: 'macd',
        display_name: 'MACD',
        description: 'مؤشر التقارب والتباعد للمتوسطات المتحركة',
        category: 'momentum',
        default_params: { fast: 12, slow: 26, signal: 9 },
        required_columns: ['close']
    },
    {
        name: 'macd_5m',
        display_name: 'MACD 5m',
        description: 'مؤشر MACD - فريم 5 دقائق',
        category: 'momentum',
        default_params: { fast: 12, slow: 26, signal: 9 },
        required_columns: ['close'],
        timeframe: '5m'
    },
    {
        name: 'macd_15m',
        display_name: 'MACD 15m',
        description: 'مؤشر MACD - فريم 15 دقيقة',
        category: 'momentum',
        default_params: { fast: 12, slow: 26, signal: 9 },
        required_columns: ['close'],
        timeframe: '15m'
    },
    {
        name: 'macd_1h',
        display_name: 'MACD 1H',
        description: 'مؤشر MACD - فريم ساعة',
        category: 'momentum',
        default_params: { fast: 12, slow: 26, signal: 9 },
        required_columns: ['close'],
        timeframe: '1h'
    },
    {
        name: 'macd_2h',
        display_name: 'MACD 2H',
        description: 'مؤشر MACD - فريم ساعتين',
        category: 'momentum',
        default_params: { fast: 12, slow: 26, signal: 9 },
        required_columns: ['close'],
        timeframe: '2h'
    },
    {
        name: 'stochastic',
        display_name: 'Stochastic',
        description: 'المؤشر العشوائي',
        category: 'momentum',
        default_params: { k_period: 14, d_period: 3, smooth: 3, overbought: 80, oversold: 20 },
        required_columns: ['high', 'low', 'close']
    },

    // Volatility Indicators
    {
        name: 'bollinger_bands',
        display_name: 'Bollinger Bands',
        description: 'أشرطة بولينجر',
        category: 'volatility',
        default_params: { period: 20, std: 2 },
        required_columns: ['close']
    },
    {
        name: 'bollinger_5m',
        display_name: 'Bollinger Bands 5m',
        description: 'أشرطة بولينجر - فريم 5 دقائق',
        category: 'volatility',
        default_params: { period: 20, std: 2 },
        required_columns: ['close'],
        timeframe: '5m'
    },
    {
        name: 'bollinger_15m',
        display_name: 'Bollinger Bands 15m',
        description: 'أشرطة بولينجر - فريم 15 دقيقة',
        category: 'volatility',
        default_params: { period: 20, std: 2 },
        required_columns: ['close'],
        timeframe: '15m'
    },
    {
        name: 'atr',
        display_name: 'ATR (Average True Range)',
        description: 'مؤشر المدى الحقيقي المتوسط',
        category: 'volatility',
        default_params: { period: 14 },
        required_columns: ['high', 'low', 'close']
    },
    {
        name: 'hv_iv_analysis',
        display_name: 'HV/IV Analysis',
        description: 'تحليل التقلب التاريخي والضمني',
        category: 'volatility',
        default_params: { period: 20, lookback: 252, current_iv: 25 },
        required_columns: ['close']
    },

    // Volume Indicators
    {
        name: 'vwap',
        display_name: 'VWAP (Volume Weighted Average Price)',
        description: 'متوسط السعر المرجح بالحجم',
        category: 'volume',
        default_params: { period: 20 },
        required_columns: ['high', 'low', 'close', 'volume']
    },
    {
        name: 'obv',
        display_name: 'OBV (On Balance Volume)',
        description: 'مؤشر حجم الرصيد',
        category: 'volume',
        default_params: {},
        required_columns: ['close', 'volume']
    },

    {
        name: 'volume_climax',
        display_name: 'Volume Climax',
        description: 'تحديد شموع ذروة الفوليوم مع تصنيفات متعددة',
        category: 'volume',
        default_params: {
            period: 20,
            ratio_ultra: 2.2,
            ratio_very_high: 1.8,
            ratio_high: 1.2,
            ratio_normal: 0.8,
            ratio_low: 0.4
        },
        required_columns: ['high', 'low', 'volume'],
        timeframe: '1h'
    },
 


    {
        name: 'smc_order_block',
        display_name: 'SMC Order Block',
        description: 'تحديد بلوكات الأوردر بناءً على سوينغ',
        category: 'support_resistance',
        default_params: { swing_length: 10, close_mitigation: true, show_last_n_blocks: 2, lookback_period:200 },
        timeframe: '1h'
    },

 

    {
        name: 'supply_demand',
        display_name: 'Supply & Demand Zones',
        description: 'تحديد مناطق العرض والطلب بناءً على الشموع الانفجارية',
        category: 'support_resistance',
        default_params: { period: 20, threshold: 2.0 },
        required_columns: ['open', 'high', 'low', 'close']
    },
    {
        name: 'pivot_points',
        display_name: 'Pivot Points',
        description: 'نقاط المحورية',
        category: 'support_resistance',
        default_params: { method: 'standard' },
        required_columns: ['high', 'low', 'close']
    },

    // Pattern Recognition
    {
        name: 'harmonic_patterns',
        display_name: 'Harmonic Patterns',
        description: 'اكتشاف نماذج الهارمونيك (Gartley, Bat, etc.)',
        category: 'pattern_recognition',
        default_params: { depth: 10, error_rate: 0.1 },
        required_columns: ['high', 'low']
    }
];

export const INDICATORS_BY_CATEGORY: Record<string, IndicatorMetadata[]> = INDICATORS_REGISTRY.reduce((acc, indicator) => {
    if (!acc[indicator.category]) {
        acc[indicator.category] = [];
    }
    acc[indicator.category].push(indicator);
    return acc;
}, {} as Record<string, IndicatorMetadata[]>);

export const getIndicatorByName = (name: string): IndicatorMetadata | undefined => {
    return INDICATORS_REGISTRY.find(ind => ind.name === name);
};

export const getIndicatorsByCategory = (category: string): IndicatorMetadata[] => {
    return INDICATORS_REGISTRY.filter(ind => ind.category === category);
};
