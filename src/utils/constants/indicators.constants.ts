/**
 * ثوابت المؤشرات الفنية
 */

export interface IndicatorDefinition {
    name: string;
    displayName: string;
    category: 'trend' | 'momentum' | 'volatility' | 'volume' | 'oscillator';
    description: string;
    parameters: IndicatorParameter[];
    defaultParams: Record<string, any>;
    output: string[];
    compatibleWith: string[];
    minBarsRequired: number;
}

export interface IndicatorParameter {
    name: string;
    type: 'number' | 'string' | 'boolean' | 'select';
    label: string;
    description: string;
    defaultValue: any;
    min?: number;
    max?: number;
    step?: number;
    options?: { label: string; value: any }[];
    required: boolean;
}

export const INDICATOR_CATEGORIES = {
    TREND: 'trend',
    MOMENTUM: 'momentum',
    VOLATILITY: 'volatility',
    VOLUME: 'volume',
    OSCILLATOR: 'oscillator'
} as const;

export type IndicatorCategory = typeof INDICATOR_CATEGORIES[keyof typeof INDICATOR_CATEGORIES];

export const INDICATOR_DEFINITIONS: IndicatorDefinition[] = [
    {
        name: 'SMA',
        displayName: 'Simple Moving Average',
        category: 'trend',
        description: 'Calculates the average price over a specified period',
        parameters: [
            {
                name: 'period',
                type: 'number',
                label: 'Period',
                description: 'Number of periods to calculate the average',
                defaultValue: 20,
                min: 1,
                max: 200,
                step: 1,
                required: true
            },
            {
                name: 'source',
                type: 'select',
                label: 'Source',
                description: 'Price source to calculate from',
                defaultValue: 'close',
                options: [
                    { label: 'Close', value: 'close' },
                    { label: 'Open', value: 'open' },
                    { label: 'High', value: 'high' },
                    { label: 'Low', value: 'low' },
                    { label: 'HL2', value: 'hl2' },
                    { label: 'HLC3', value: 'hlc3' },
                    { label: 'OHLC4', value: 'ohlc4' }
                ],
                required: true
            },
            {
                name: 'offset',
                type: 'number',
                label: 'Offset',
                description: 'Shift the indicator forward or backward',
                defaultValue: 0,
                min: -100,
                max: 100,
                step: 1,
                required: false
            }
        ],
        defaultParams: { period: 20, source: 'close', offset: 0 },
        output: ['value'],
        compatibleWith: ['all'],
        minBarsRequired: 20
    },
    {
        name: 'EMA',
        displayName: 'Exponential Moving Average',
        category: 'trend',
        description: 'Weighted average that gives more importance to recent prices',
        parameters: [
            {
                name: 'period',
                type: 'number',
                label: 'Period',
                description: 'Number of periods to calculate the average',
                defaultValue: 20,
                min: 1,
                max: 200,
                step: 1,
                required: true
            },
            {
                name: 'source',
                type: 'select',
                label: 'Source',
                description: 'Price source to calculate from',
                defaultValue: 'close',
                options: [
                    { label: 'Close', value: 'close' },
                    { label: 'Open', value: 'open' },
                    { label: 'High', value: 'high' },
                    { label: 'Low', value: 'low' }
                ],
                required: true
            }
        ],
        defaultParams: { period: 20, source: 'close' },
        output: ['value'],
        compatibleWith: ['all'],
        minBarsRequired: 20
    },
    {
        name: 'RSI',
        displayName: 'Relative Strength Index',
        category: 'oscillator',
        description: 'Measures the magnitude of recent price changes to evaluate overbought or oversold conditions',
        parameters: [
            {
                name: 'period',
                type: 'number',
                label: 'Period',
                description: 'Number of periods to calculate RSI',
                defaultValue: 14,
                min: 2,
                max: 100,
                step: 1,
                required: true
            },
            {
                name: 'source',
                type: 'select',
                label: 'Source',
                description: 'Price source to calculate from',
                defaultValue: 'close',
                options: [
                    { label: 'Close', value: 'close' },
                    { label: 'Open', value: 'open' }
                ],
                required: true
            },
            {
                name: 'overbought',
                type: 'number',
                label: 'Overbought Level',
                description: 'RSI level considered overbought',
                defaultValue: 70,
                min: 50,
                max: 90,
                step: 1,
                required: false
            },
            {
                name: 'oversold',
                type: 'number',
                label: 'Oversold Level',
                description: 'RSI level considered oversold',
                defaultValue: 30,
                min: 10,
                max: 50,
                step: 1,
                required: false
            }
        ],
        defaultParams: { period: 14, source: 'close', overbought: 70, oversold: 30 },
        output: ['value', 'signal'],
        compatibleWith: ['all'],
        minBarsRequired: 28
    },
    {
        name: 'MACD',
        displayName: 'Moving Average Convergence Divergence',
        category: 'trend',
        description: 'Trend-following momentum indicator showing relationship between two moving averages',
        parameters: [
            {
                name: 'fastPeriod',
                type: 'number',
                label: 'Fast Period',
                description: 'Number of periods for fast EMA',
                defaultValue: 12,
                min: 1,
                max: 50,
                step: 1,
                required: true
            },
            {
                name: 'slowPeriod',
                type: 'number',
                label: 'Slow Period',
                description: 'Number of periods for slow EMA',
                defaultValue: 26,
                min: 1,
                max: 100,
                step: 1,
                required: true
            },
            {
                name: 'signalPeriod',
                type: 'number',
                label: 'Signal Period',
                description: 'Number of periods for signal line',
                defaultValue: 9,
                min: 1,
                max: 50,
                step: 1,
                required: true
            },
            {
                name: 'source',
                type: 'select',
                label: 'Source',
                description: 'Price source to calculate from',
                defaultValue: 'close',
                options: [
                    { label: 'Close', value: 'close' },
                    { label: 'Open', value: 'open' }
                ],
                required: true
            }
        ],
        defaultParams: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, source: 'close' },
        output: ['macd', 'signal', 'histogram'],
        compatibleWith: ['all'],
        minBarsRequired: 52
    },
    {
        name: 'BB',
        displayName: 'Bollinger Bands',
        category: 'volatility',
        description: 'Volatility bands placed above and below a moving average',
        parameters: [
            {
                name: 'period',
                type: 'number',
                label: 'Period',
                description: 'Number of periods for moving average',
                defaultValue: 20,
                min: 2,
                max: 100,
                step: 1,
                required: true
            },
            {
                name: 'stdDev',
                type: 'number',
                label: 'Standard Deviation',
                description: 'Number of standard deviations',
                defaultValue: 2,
                min: 1,
                max: 3,
                step: 0.1,
                required: true
            },
            {
                name: 'source',
                type: 'select',
                label: 'Source',
                description: 'Price source to calculate from',
                defaultValue: 'close',
                options: [
                    { label: 'Close', value: 'close' },
                    { label: 'Open', value: 'open' }
                ],
                required: true
            }
        ],
        defaultParams: { period: 20, stdDev: 2, source: 'close' },
        output: ['upper', 'middle', 'lower', 'bandwidth', 'percentB'],
        compatibleWith: ['all'],
        minBarsRequired: 20
    },
    {
        name: 'Stochastic',
        displayName: 'Stochastic Oscillator',
        category: 'oscillator',
        description: 'Compares closing price to price range over a period',
        parameters: [
            {
                name: 'kPeriod',
                type: 'number',
                label: 'K Period',
                description: 'Period for %K line',
                defaultValue: 14,
                min: 1,
                max: 50,
                step: 1,
                required: true
            },
            {
                name: 'dPeriod',
                type: 'number',
                label: 'D Period',
                description: 'Period for %D line',
                defaultValue: 3,
                min: 1,
                max: 50,
                step: 1,
                required: true
            },
            {
                name: 'slowing',
                type: 'number',
                label: 'Slowing',
                description: 'Slowing period for %K',
                defaultValue: 3,
                min: 1,
                max: 10,
                step: 1,
                required: true
            }
        ],
        defaultParams: { kPeriod: 14, dPeriod: 3, slowing: 3 },
        output: ['k', 'd', 'overbought', 'oversold'],
        compatibleWith: ['all'],
        minBarsRequired: 28
    },
    {
        name: 'ATR',
        displayName: 'Average True Range',
        category: 'volatility',
        description: 'Measures market volatility',
        parameters: [
            {
                name: 'period',
                type: 'number',
                label: 'Period',
                description: 'Number of periods to calculate ATR',
                defaultValue: 14,
                min: 1,
                max: 50,
                step: 1,
                required: true
            }
        ],
        defaultParams: { period: 14 },
        output: ['value'],
        compatibleWith: ['all'],
        minBarsRequired: 14
    },
    {
        name: 'Volume',
        displayName: 'Volume',
        category: 'volume',
        description: 'Trading volume indicator',
        parameters: [
            {
                name: 'maPeriod',
                type: 'number',
                label: 'MA Period',
                description: 'Period for volume moving average',
                defaultValue: 20,
                min: 1,
                max: 50,
                step: 1,
                required: false
            }
        ],
        defaultParams: { maPeriod: 20 },
        output: ['volume', 'volumeMA'],
        compatibleWith: ['all'],
        minBarsRequired: 1
    },
    {
        name: 'VWAP',
        displayName: 'Volume Weighted Average Price',
        category: 'trend',
        description: 'Average price weighted by volume',
        parameters: [],
        defaultParams: {},
        output: ['value'],
        compatibleWith: ['all'],
        minBarsRequired: 1
    },
    {
        name: 'Fibonacci',
        displayName: 'Fibonacci Retracement',
        category: 'trend',
        description: 'Fibonacci retracement levels',
        parameters: [
            {
                name: 'levels',
                type: 'select',
                label: 'Levels',
                description: 'Fibonacci levels to display',
                defaultValue: ['0.236', '0.382', '0.5', '0.618', '0.786'],
                options: [
                    { label: 'Standard Levels', value: ['0.236', '0.382', '0.5', '0.618', '0.786'] },
                    { label: 'Extended Levels', value: ['0', '0.236', '0.382', '0.5', '0.618', '0.786', '1'] },
                    { label: 'All Levels', value: ['0', '0.236', '0.382', '0.5', '0.618', '0.786', '1', '1.618', '2.618'] }
                ],
                required: true
            }
        ],
        defaultParams: { levels: ['0.236', '0.382', '0.5', '0.618', '0.786'] },
        output: ['levels'],
        compatibleWith: ['all'],
        minBarsRequired: 2
    }
];

export const INDICATOR_SIGNALS = {
    BUY: 'buy',
    SELL: 'sell',
    NEUTRAL: 'neutral',
    OVERBOUGHT: 'overbought',
    OVERSOLD: 'oversold',
    STRONG_BUY: 'strong_buy',
    STRONG_SELL: 'strong_sell'
} as const;

export type IndicatorSignal = typeof INDICATOR_SIGNALS[keyof typeof INDICATOR_SIGNALS];

export const SIGNAL_STRENGTH = {
    WEAK: 0.3,
    MODERATE: 0.6,
    STRONG: 0.9
} as const;

export const INDICATOR_COLORS = {
    SMA: '#FF6B6B',
    EMA: '#4ECDC4',
    RSI: '#FFD166',
    MACD: '#06D6A0',
    BB_UPPER: '#EF476F',
    BB_MIDDLE: '#118AB2',
    BB_LOWER: '#073B4C',
    STOCHASTIC_K: '#7209B7',
    STOCHASTIC_D: '#3A0CA3',
    ATR: '#F72585',
    VOLUME: '#4361EE',
    VWAP: '#4CC9F0'
} as const;

export const INDICATOR_DEFAULT_CONFIG = {
    CHART_TYPE: 'line' as const,
    LINE_WIDTH: 2,
    DASH_ARRAY: '0',
    OPACITY: 1,
    VISIBLE: true
} as const;

/**
 * الحصول على تعريف المؤشر
 */
export function getIndicatorDefinition(name: string): IndicatorDefinition | undefined {
    return INDICATOR_DEFINITIONS.find(ind => ind.name === name);
}

/**
 * الحصول على المؤشرات حسب الفئة
 */
export function getIndicatorsByCategory(category: IndicatorCategory): IndicatorDefinition[] {
    return INDICATOR_DEFINITIONS.filter(ind => ind.category === category);
}

/**
 * التحقق من توافق المؤشر مع السوق
 */
export function isIndicatorCompatible(indicatorName: string, marketType: string): boolean {
    const definition = getIndicatorDefinition(indicatorName);
    if (!definition) return false;

    return definition.compatibleWith.includes('all') ||
        definition.compatibleWith.includes(marketType);
}

/**
 * الحصول على المعلمات الافتراضية للمؤشر
 */
export function getIndicatorDefaultParams(indicatorName: string): Record<string, any> {
    const definition = getIndicatorDefinition(indicatorName);
    return definition?.defaultParams || {};
}

/**
 * التحقق من توفر بيانات كافية للمؤشر
 */
export function hasEnoughDataForIndicator(
    indicatorName: string,
    dataLength: number
): boolean {
    const definition = getIndicatorDefinition(indicatorName);
    if (!definition) return false;

    return dataLength >= definition.minBarsRequired;
}

/**
 * الحصول على لون المؤشر
 */
export function getIndicatorColor(indicatorName: string, lineType?: string): string {
    if (lineType && INDICATOR_COLORS[`${indicatorName}_${lineType}` as keyof typeof INDICATOR_COLORS]) {
        return INDICATOR_COLORS[`${indicatorName}_${lineType}` as keyof typeof INDICATOR_COLORS];
    }

    return INDICATOR_COLORS[indicatorName as keyof typeof INDICATOR_COLORS] || '#000000';
}

/**
 * حساب قوة الإشارة
 */
export function calculateSignalStrength(
    indicatorValue: number,
    threshold: number = 0.5
): number {
    return Math.min(Math.abs(indicatorValue) / threshold, 1);
}

/**
 * تحديد إشارة المؤشر
 */
export function determineIndicatorSignal(
    indicatorName: string,
    value: number,
    params?: Record<string, any>
): { signal: IndicatorSignal; strength: number } {
    switch (indicatorName) {
        case 'RSI':
            const overbought = params?.overbought || 70;
            const oversold = params?.oversold || 30;

            if (value >= overbought) {
                return { signal: 'overbought', strength: calculateSignalStrength((value - overbought) / (100 - overbought)) };
            } else if (value <= oversold) {
                return { signal: 'oversold', strength: calculateSignalStrength((oversold - value) / oversold) };
            }
            break;

        case 'Stochastic':
            if (value >= 80) {
                return { signal: 'overbought', strength: calculateSignalStrength((value - 80) / 20) };
            } else if (value <= 20) {
                return { signal: 'oversold', strength: calculateSignalStrength((20 - value) / 20) };
            }
            break;

        case 'MACD':
            if (value > 0) {
                return { signal: 'buy', strength: calculateSignalStrength(value) };
            } else if (value < 0) {
                return { signal: 'sell', strength: calculateSignalStrength(Math.abs(value)) };
            }
            break;
    }

    return { signal: 'neutral', strength: 0 };
}

/**
 * توليد معلمات المؤشر
 */
export function generateIndicatorParameters(
    indicatorName: string,
    customParams?: Record<string, any>
): Record<string, any> {
    const defaultParams = getIndicatorDefaultParams(indicatorName);
    return { ...defaultParams, ...customParams };
}

/**
 * التحقق من صحة معلمات المؤشر
 */
export function validateIndicatorParameters(
    indicatorName: string,
    params: Record<string, any>
): { valid: boolean; errors: string[] } {
    const definition = getIndicatorDefinition(indicatorName);
    if (!definition) {
        return { valid: false, errors: ['Indicator not found'] };
    }

    const errors: string[] = [];

    definition.parameters.forEach(param => {
        const value = params[param.name];

        if (param.required && (value === undefined || value === null)) {
            errors.push(`${param.label} is required`);
            return;
        }

        if (value !== undefined && value !== null) {
            // التحقق من النوع
            if (param.type === 'number' && typeof value !== 'number') {
                errors.push(`${param.label} must be a number`);
            } else if (param.type === 'string' && typeof value !== 'string') {
                errors.push(`${param.label} must be a string`);
            } else if (param.type === 'boolean' && typeof value !== 'boolean') {
                errors.push(`${param.label} must be a boolean`);
            }

            // التحقق من النطاق
            if (param.type === 'number' && typeof value === 'number') {
                if (param.min !== undefined && value < param.min) {
                    errors.push(`${param.label} must be at least ${param.min}`);
                }
                if (param.max !== undefined && value > param.max) {
                    errors.push(`${param.label} must be at most ${param.max}`);
                }
            }
        }
    });

    return {
        valid: errors.length === 0,
        errors
    };
}