
// @ts-nocheck

import { IndicatorLibrary } from '../types/indicator';


// نضيف واجهة للتكوين الخاص بالباك إند
interface BackendConfig {
    name: string;          // اسم المؤشر في الباك إند
    type: string;          // نوع المؤشر في الباك إند
    params: Record<string, any>;  // المعلمات المتوقعة للباك إند
}


export const indicatorsLibrary: IndicatorLibrary = {
    categories: [
        {
            id: 'trend',
            name: 'Trend',
            description: 'Indicators that determine market direction',
            icon: '📈',
        },
        {
            id: 'momentum',
            name: 'Momentum',
            description: 'Indicators measuring price movement strength',
            icon: '⚡',
        },
        {
            id: 'volatility',
            name: 'Volatility',
            description: 'Indicators measuring price fluctuations',
            icon: '🌊',
        },
        {
            id: 'volume',
            name: 'Volume',
            description: 'Indicators analyzing trading volume',
            icon: '📊',
        },
        {
            id: 'oscillators',
            name: 'Oscillators',
            description: 'Indicators oscillating between levels',
            icon: '↕️',
        },
        {
            id: 'custom',
            name: 'Custom',
            description: 'Custom indicators',
            icon: '🛠️',
        },
    ],

    indicators: [





     
        {
            id: 'supply_demand',
            name: 'supply_demand',
            displayName: 'Supply & Demand',
            description: 'Identifies support and resistance zones based on supply and demand',
            category: 'custom', // أو 'trend' حسب تصنيفك
            parameters: [
                {
                    name: 'period',
                    label: 'Period',
                    type: 'number',
                    defaultValue: 20,
                    min: 1,
                    max: 200,
                    step: 1,
                },
                {
                    name: 'threshold',
                    label: 'Threshold',
                    type: 'number',
                    defaultValue: 2.0,
                    min: 0,
                    max: 10,
                    step: 0.1,
                },
            ],
            seriesType: 'line',
            defaultColor: '#FF6B6B',
            defaultLineWidth: 2,
            defaultParameters: { period: 20, threshold: 2.0 },
            overlay: true,
            outputCount: 1,
            backendConfig: {
                name: 'supply_demand',
                type: 'support_resistance',
                params: { period: 20, threshold: 2.0 }
            }
        },

        {
            id: 'smc_order_block',
            name: 'smc_order_block',
            displayName: 'SMC Order Block',
            description: 'Identifies Order Blocks and Swing Points using Smart Money Concepts',
            category: 'custom', // أو 'trend' حسب تصنيفك
            parameters: [
                {
                    name: 'swing_length',
                    label: 'Swing Length',
                    type: 'number',
                    defaultValue: 10,
                    min: 1,
                    max: 100,
                    step: 1,
                    description: 'عدد الأشرطة للنظر للوراء لتحديد القمم والقيعان'
                },
                {
                    name: 'close_mitigation',
                    label: 'Close Mitigation',
                    type: 'boolean',
                    defaultValue: true,
                    description: 'استخدام سعر الإغلاق لتحديد إلغاء البلوك (أم الفتح)'
                }
            ],
            seriesType: 'line', // مهم حتى مع Primitive
            defaultColor: '#FFA500', // لون خط افتراضي
            defaultLineWidth: 1,
            defaultParameters: {
                swing_length: 10,
                close_mitigation: true
            },
            overlay: true, // ⚠️ مهم: يجب أن يكون true للـ Primitive
            outputCount: 1,
            hasPrimitive: true, // 🆕 علامة مهمة: أن هذا المؤشر يستخدم Primitive
            backendConfig: {
                name: 'smc_order_block',
                type: 'support_resistance', // أو 'custom'
                params: {
                    swing_length: 10,
                    close_mitigation: true
                }
            }
        },
        {
            id: 'volume_climax',
            name: 'volume_climax',
            displayName: 'Volume Climax',
            description: 'Detects volume climax points indicating potential reversals',
            category: 'volume',
            parameters: [
                {
                    name: 'period',
                    label: 'Period',
                    type: 'number',
                    defaultValue: 20,
                    min: 1,
                    max: 200,
                    step: 1,
                },
                {
                    name: 'std_mult',
                    label: 'Std Multiplier',
                    type: 'number',
                    defaultValue: 2.0,
                    min: 0,
                    max: 10,
                    step: 0.1,
                },
            ],
            seriesType: 'line',
            defaultColor: '#4ECDC4',
            defaultLineWidth: 2,
            defaultParameters: { period: 20, std_mult: 2.0 },
            overlay: false,
            outputCount: 1,
            backendConfig: {
                name: 'volume_climax',
                type: 'volume',
                params: { period: 20, std_mult: 2.0 }
            }
        },
        {
            id: 'harmonic_patterns',
            name: 'harmonic_patterns',
            displayName: 'Harmonic Patterns',
            description: 'Detects harmonic price patterns for potential reversals',
            category: 'custom',
            parameters: [
                {
                    name: 'depth',
                    label: 'Depth',
                    type: 'number',
                    defaultValue: 10,
                    min: 1,
                    max: 50,
                    step: 1,
                },
            ],
            seriesType: 'line',
            defaultColor: '#FFA500',
            defaultLineWidth: 2,
            defaultParameters: { depth: 10 },
            overlay: true,
            outputCount: 1,
            backendConfig: {
                name: 'harmonic_patterns',
                type: 'trend',
                params: { depth: 10 }
            }
        },
        {
            id: 'hv_iv_analysis',
            name: 'hv_iv_analysis',
            displayName: 'Historical Volatility / Implied Volatility',
            description: 'Analyzes historical and implied volatility',
            category: 'volatility',
            parameters: [
                {
                    name: 'period',
                    label: 'Period',
                    type: 'number',
                    defaultValue: 20,
                    min: 1,
                    max: 200,
                    step: 1,
                },
                {
                    name: 'lookback',
                    label: 'Lookback',
                    type: 'number',
                    defaultValue: 252,
                    min: 1,
                    max: 1000,
                    step: 1,
                },
                {
                    name: 'current_iv',
                    label: 'Current IV',
                    type: 'number',
                    defaultValue: 25.0,
                    min: 0,
                    max: 100,
                    step: 0.1,
                },
            ],
            seriesType: 'line',
            defaultColor: '#6A5ACD',
            defaultLineWidth: 2,
            defaultParameters: { period: 20, lookback: 252, current_iv: 25.0 },
            overlay: false,
            outputCount: 1,
            backendConfig: {
                name: 'hv_iv_analysis',
                type: 'volatility',
                params: { period: 20, lookback: 252, current_iv: 25.0 }
            }
        },



        
        {
            id: 'sma',
            name: 'sma',
            displayName: 'Simple Moving Average',
            description: 'Simple moving average for trend calculation',
            category: 'trend',

            // معلمات الواجهة
            parameters: [
                {
                    name: 'period',
                    label: 'Period',
                    type: 'number',
                    defaultValue: 20,
                    min: 1,
                    max: 200,
                    step: 1,
                },
                {
                    name: 'source',
                    label: 'Source',
                    type: 'select',
                    defaultValue: 'close',
                    options: [
                        { label: 'Close Price', value: 'close' },
                        { label: 'Open Price', value: 'open' },
                        { label: 'High Price', value: 'high' },
                        { label: 'Low Price', value: 'low' },
                        { label: 'Average Price', value: 'hl2' },
                        { label: 'HLCC4 Average', value: 'hlcc4' },
                    ],
                },
            ],
            seriesType: 'line',
            defaultColor: '#2962FF',
            defaultLineWidth: 2,
            defaultParameters: { period: 20, source: 'close' },
            overlay: true,
            outputCount: 1,

            // ⭐ التكوين الجديد للباك إند
            backendConfig: {
                name: 'sma',              // نفس الاسم
                type: 'trend',            // من التصنيف
                params: {                 // التنسيق المتوقع للباك إند
                    period: 20,
                    source: 'close'
                }
            }
        },
        {
            id: 'ema',
            name: 'ema',
            displayName: 'Exponential Moving Average', // 🔥 تصحيح الاسم
            description: 'Exponential moving average for trend calculation',
            category: 'trend',

            parameters: [
                {
                    name: 'period',
                    label: 'Period',
                    type: 'number',
                    defaultValue: 20,
                    min: 1,
                    max: 200,
                    step: 1,
                },
                {
                    name: 'source',
                    label: 'Source',
                    type: 'select',
                    defaultValue: 'close',
                    options: [
                        { label: 'Close Price', value: 'close' },
                        { label: 'Open Price', value: 'open' },
                        { label: 'High Price', value: 'high' },
                        { label: 'Low Price', value: 'low' },
                        { label: 'Average Price', value: 'hl2' },
                        { label: 'HLCC4 Average', value: 'hlcc4' },
                    ],
                },
            ],
            seriesType: 'line',
            defaultColor: '#00E396', // 🔥 لون مختلف عن SMA
            defaultLineWidth: 2,
            defaultParameters: { period: 20, source: 'close' },
            overlay: true,
            outputCount: 1,

            // ⭐ التكوين الجديد للباك إند
            backendConfig: {
                name: 'ema',              // 🔥 تصحيح: كان 'sma' وأصبح 'ema'
                type: 'trend',
                params: {
                    period: 20,
                    source: 'close'
                }
            }
        },
        {
            id: 'rsi',
            name: 'rsi',
            displayName: 'Relative Strength Index',
            description: 'Measures speed and magnitude of price movements',
            category: 'momentum',

            // معلمات الواجهة
            parameters: [
                {
                    name: 'period',
                    label: 'Period',
                    type: 'number',
                    defaultValue: 14,
                    min: 1,
                    max: 100,
                    step: 1,
                },
                {
                    name: 'source',
                    label: 'Source',
                    type: 'select',
                    defaultValue: 'close',
                    options: [
                        { label: 'Close Price', value: 'close' },
                        { label: 'Open Price', value: 'open' },
                    ],
                },
                {
                    name: 'overbought',
                    label: 'Overbought Level',
                    type: 'number',
                    defaultValue: 70,
                    min: 50,
                    max: 90,
                    step: 1,
                },
                {
                    name: 'oversold',
                    label: 'Oversold Level',
                    type: 'number',
                    defaultValue: 30,
                    min: 10,
                    max: 50,
                    step: 1,
                },
            ],
            seriesType: 'line',
            defaultColor: '#FFD166',
            defaultLineWidth: 2,
            defaultParameters: {
                period: 14,
                source: 'close',
                overbought: 70,
                oversold: 30
            },
            overlay: false,
            outputCount: 1,

            // ⭐ التكوين الجديد للباك إند
            backendConfig: {
                name: 'rsi',
                type: 'momentum',
                params: {
                    period: 14,
                    source: 'close',
                    overbought: 70,
                    oversold: 30
                }
            }
        },
        {
            id: 'macd',
            name: 'macd',
            displayName: 'MACD Indicator',
            description: 'Moving Average Convergence Divergence indicator',
            category: 'trend',
            parameters: [
                {
                    name: 'fastPeriod',
                    label: 'Fast Period',
                    type: 'number',
                    defaultValue: 12,
                    min: 1,
                    max: 50,
                    step: 1,
                },
                {
                    name: 'slowPeriod',
                    label: 'Slow Period',
                    type: 'number',
                    defaultValue: 26,
                    min: 1,
                    max: 100,
                    step: 1,
                },
                {
                    name: 'signalPeriod',
                    label: 'Signal Period',
                    type: 'number',
                    defaultValue: 9,
                    min: 1,
                    max: 50,
                    step: 1,
                },
            ],
            seriesType: 'histogram',
            defaultColor: '#2962FF',
            defaultLineWidth: 1,
            defaultParameters: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
            overlay: false,
            outputCount: 3,

            // ⭐ التكوين الجديد للباك إند
            backendConfig: {
                name: 'macd',
                type: 'trend',
                params: {
                    fastPeriod: 12,
                    slowPeriod: 26,
                    signalPeriod: 9
                }
            }
        },
        {
            id: 'bollinger',
            name: 'bb',
            displayName: 'Bollinger Bands',
            description: 'Volatility indicator based on standard deviation',
            category: 'volatility',
            parameters: [
                {
                    name: 'period',
                    label: 'Period',
                    type: 'number',
                    defaultValue: 20,
                    min: 1,
                    max: 100,
                    step: 1,
                },
                {
                    name: 'stdDev',
                    label: 'Standard Deviation',
                    type: 'number',
                    defaultValue: 2,
                    min: 1,
                    max: 5,
                    step: 0.1,
                },
                {
                    name: 'source',
                    label: 'Source',
                    type: 'select',
                    defaultValue: 'close',
                    options: [
                        { label: 'Close Price', value: 'close' },
                        { label: 'HL2 Average', value: 'hl2' },
                    ],
                },
            ],
            seriesType: 'band',
            defaultColor: '#4ECDC4',
            defaultLineWidth: 1,
            defaultParameters: { period: 20, stdDev: 2, source: 'close' },
            overlay: true,
            outputCount: 3,

            // ⭐ التكوين الجديد للباك إند
            backendConfig: {
                name: 'bb',
                type: 'volatility',
                params: {
                    period: 20,
                    stdDev: 2,
                    source: 'close'
                }
            }
        },
        {
            id: 'stochastic',
            name: 'stochastic',
            displayName: 'Stochastic Oscillator',
            description: 'Momentum indicator comparing closing price to price range',
            category: 'oscillators',
            parameters: [
                {
                    name: 'kPeriod',
                    label: '%K Period',
                    type: 'number',
                    defaultValue: 14,
                    min: 1,
                    max: 50,
                    step: 1,
                },
                {
                    name: 'dPeriod',
                    label: '%D Period',
                    type: 'number',
                    defaultValue: 3,
                    min: 1,
                    max: 20,
                    step: 1,
                },
                {
                    name: 'slowing',
                    label: 'Slowing',
                    type: 'number',
                    defaultValue: 3,
                    min: 1,
                    max: 20,
                    step: 1,
                },
            ],
            seriesType: 'line',
            defaultColor: '#9C27B0',
            defaultLineWidth: 2,
            defaultParameters: { kPeriod: 14, dPeriod: 3, slowing: 3 },
            overlay: false,
            outputCount: 2,

            // ⭐ التكوين الجديد للباك إند
            backendConfig: {
                name: 'stochastic',
                type: 'oscillators',
                params: {
                    kPeriod: 14,
                    dPeriod: 3,
                    slowing: 3
                }
            }
        },
        {
            id: 'atr',
            name: 'atr',
            displayName: 'Average True Range',
            description: 'Measures market volatility',
            category: 'volatility',
            parameters: [
                {
                    name: 'period',
                    label: 'Period',
                    type: 'number',
                    defaultValue: 14,
                    min: 1,
                    max: 50,
                    step: 1,
                },
            ],
            seriesType: 'line',
            defaultColor: '#FF9800',
            defaultLineWidth: 2,
            defaultParameters: { period: 14 },
            overlay: false,
            outputCount: 1,

            // ⭐ التكوين الجديد للباك إند
            backendConfig: {
                name: 'atr',
                type: 'volatility',
                params: {
                    period: 14
                }
            }
        },
        {
            id: 'volume',
            name: 'volume',
            displayName: 'Volume',
            description: 'Trading volume',
            category: 'volume',
            parameters: [
                {
                    name: 'colorUp',
                    label: 'Up Color',
                    type: 'color',
                    defaultValue: '#26a69a',
                },
                {
                    name: 'colorDown',
                    label: 'Down Color',
                    type: 'color',
                    defaultValue: '#ef5350',
                },
            ],
            seriesType: 'histogram',
            defaultColor: '#26a69a',
            defaultLineWidth: 1,
            defaultParameters: { colorUp: '#26a69a', colorDown: '#ef5350' },
            requiresVolume: true,
            overlay: false,
            outputCount: 1,

            // ⭐ التكوين الجديد للباك إند
            backendConfig: {
                name: 'volume',
                type: 'volume',
                params: {
                    colorUp: '#26a69a',
                    colorDown: '#ef5350'
                }
            }
        },
        {
            id: 'obv',
            name: 'obv',
            displayName: 'On Balance Volume',
            description: 'On Balance Volume indicator',
            category: 'volume',
            parameters: [
                {
                    name: 'color',
                    label: 'Color',
                    type: 'color',
                    defaultValue: '#2196F3',
                },
            ],
            seriesType: 'line',
            defaultColor: '#2196F3',
            defaultLineWidth: 2,
            defaultParameters: { color: '#2196F3' },
            requiresVolume: true,
            overlay: false,
            outputCount: 1,

            // ⭐ التكوين الجديد للباك إند
            backendConfig: {
                name: 'obv',
                type: 'volume',
                params: {
                    color: '#2196F3'
                }
            }
        },
        // ... باقي المؤشرات
    ],

    presets: {
        'Basic Analysis': [
            { indicatorId: 'sma', parameters: { period: 20 } },
            { indicatorId: 'sma', parameters: { period: 50 } },
            { indicatorId: 'volume', parameters: {} },
        ],
        'Strong Momentum': [
            { indicatorId: 'rsi', parameters: { period: 14 } },
            { indicatorId: 'macd', parameters: {} },
            { indicatorId: 'stochastic', parameters: {} },
        ],
        'Volatility Analysis': [
            { indicatorId: 'bollinger', parameters: {} },
            { indicatorId: 'atr', parameters: { period: 14 } },
        ],
        'Day Trader': [
            { indicatorId: 'ema', parameters: { period: 9 } },
            { indicatorId: 'ema', parameters: { period: 21 } },
            { indicatorId: 'volume', parameters: {} },
        ],
    },
};