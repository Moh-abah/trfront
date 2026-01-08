
// @ts-nocheck

/**
 * أدوات تحقق من المخططات باستخدام Zod
 */

import { z } from 'zod';

/**
 * مخططات أساسية
 */
export const BaseSchemas = {
    // مخطط الرمز
    symbol: z.string()
        .min(1, 'Symbol is required')
        .max(20, 'Symbol is too long')
        .regex(/^[A-Za-z0-9\-_.]+$/, 'Invalid symbol format'),

    // مخطط السعر
    price: z.number()
        .positive('Price must be positive')
        .finite('Price must be a finite number'),

    // مخطط الكمية
    quantity: z.number()
        .positive('Quantity must be positive')
        .finite('Quantity must be a finite number'),

    // مخطط النسبة المئوية
    percentage: z.number()
        .min(-100, 'Percentage must be at least -100%')
        .max(100, 'Percentage cannot exceed 100%'),

    // مخطط التاريخ
    date: z.string()
        .datetime('Invalid date format')
        .or(z.date()),

    // مخطط معرف
    id: z.string()
        .uuid('Invalid ID format')
        .or(z.number().int().positive()),

    // مخطط البريد الإلكتروني
    email: z.string()
        .email('Invalid email address'),

    // مخطط كلمة المرور
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password is too long')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain uppercase, lowercase and numbers'),
};

/**
 * مخططات السوق
 */
export const MarketSchemas = {
    // مخطط بيانات الشمعة
    candle: z.object({
        timestamp: z.number().positive(),
        open: BaseSchemas.price,
        high: BaseSchemas.price,
        low: BaseSchemas.price,
        close: BaseSchemas.price,
        volume: z.number().nonnegative(),
    }),

    // مخطط بيانات السوق
    marketData: z.object({
        symbol: BaseSchemas.symbol,
        price: BaseSchemas.price,
        change: BaseSchemas.percentage,
        volume: z.number().nonnegative(),
        marketCap: z.number().optional(),
        high24h: BaseSchemas.price.optional(),
        low24h: BaseSchemas.price.optional(),
    }),

    // مخطط طلب السوق
    marketOrder: z.object({
        symbol: BaseSchemas.symbol,
        side: z.enum(['buy', 'sell']),
        quantity: BaseSchemas.quantity,
        price: BaseSchemas.price.optional(),
        orderType: z.enum(['market', 'limit', 'stop', 'stop_limit']),
    }),
};

/**
 * مخططات المؤشرات
 */
export const IndicatorSchemas = {
    // مخطط معامل المؤشر
    indicatorParam: z.object({
        name: z.string(),
        value: z.union([z.number(), z.string(), z.boolean()]),
        type: z.enum(['number', 'string', 'boolean', 'select']),
        min: z.number().optional(),
        max: z.number().optional(),
        options: z.array(z.object({
            label: z.string(),
            value: z.union([z.number(), z.string(), z.boolean()]),
        })).optional(),
    }),

    // مخطط تكوين المؤشر
    indicatorConfig: z.object({
        name: z.string(),
        displayName: z.string().optional(),
        params: z.array(IndicatorSchemas.indicatorParam),
        enabled: z.boolean().default(true),
    }),

    // مخطط إشارة المؤشر
    indicatorSignal: z.object({
        indicator: z.string(),
        value: z.number(),
        signal: z.enum(['buy', 'sell', 'neutral', 'overbought', 'oversold']),
        strength: z.number().min(0).max(1).optional(),
        timestamp: z.number(),
    }),
};

/**
 * مخططات الاستراتيجية
 */
export const StrategySchemas = {
    // مخطط شرط التداول
    tradingCondition: z.object({
        indicator: z.string(),
        operator: z.enum([
            'greater_than',
            'less_than',
            'equals',
            'not_equals',
            'crosses_above',
            'crosses_below',
            'between',
            'not_between',
        ]),
        value: z.union([z.number(), z.string()]),
        value2: z.union([z.number(), z.string()]).optional(),
        timeframe: z.string().optional(),
    }),

    // مخطط قاعدة التداول
    tradingRule: z.object({
        conditions: z.array(StrategySchemas.tradingCondition),
        logic: z.enum(['AND', 'OR']).default('AND'),
        action: z.enum(['buy', 'sell', 'hold', 'close']),
        priority: z.number().int().min(1).max(10).default(1),
    }),

    // مخطط تكوين الاستراتيجية
    strategyConfig: z.object({
        name: z.string().min(1, 'Strategy name is required'),
        description: z.string().optional(),
        version: z.string().default('1.0.0'),
        author: z.string().optional(),
        rules: z.array(StrategySchemas.tradingRule),
        indicators: z.array(IndicatorSchemas.indicatorConfig),
        parameters: z.record(z.any()).optional(),
        enabled: z.boolean().default(true),
    }),
};

/**
 * مخططات الباك-تيست
 */
export const BacktestSchemas = {
    // مخطط معطيات الباك-تيست
    backtestConfig: z.object({
        strategyId: z.string().min(1, 'Strategy ID is required'),
        symbol: BaseSchemas.symbol,
        market: z.enum(['crypto', 'stocks']),
        timeframe: z.string(),
        startDate: BaseSchemas.date,
        endDate: BaseSchemas.date,
        initialCapital: z.number().positive('Initial capital must be positive'),
        commission: z.number().min(0).max(100).default(0.1),
        slippage: z.number().min(0).max(100).default(0.1),
        parameters: z.record(z.any()).optional(),
    }),

    // مخطط معطيات Walk Forward
    walkForwardConfig: StrategySchemas.strategyConfig.extend({
        windowSize: z.string(),
        stepSize: z.string(),
        optimizationMetric: z.enum([
            'sharpe_ratio',
            'total_return',
            'win_rate',
            'profit_factor',
        ]).default('sharpe_ratio'),
    }),

    // مخطط معطيات Monte Carlo
    monteCarloConfig: StrategySchemas.strategyConfig.extend({
        iterations: z.number().int().min(100).max(10000).default(1000),
        confidenceLevel: z.number().min(0.5).max(0.99).default(0.95),
        simulationType: z.enum(['random_trades', 'bootstrap', 'parametric']).default('bootstrap'),
    }),
};

/**
 * مخططات الفلترة
 */
export const FilterSchemas = {
    // مخطط شرط الفلترة
    filterCondition: z.object({
        field: z.string(),
        operator: z.enum([
            'equals',
            'not_equals',
            'greater_than',
            'less_than',
            'greater_than_or_equal',
            'less_than_or_equal',
            'contains',
            'not_contains',
            'starts_with',
            'ends_with',
            'between',
            'not_between',
            'is_null',
            'is_not_null',
        ]),
        value: z.any(),
        value2: z.any().optional(),
    }),

    // مخطط معايير الفلترة
    filterCriteria: z.object({
        conditions: z.array(FilterSchemas.filterCondition),
        logic: z.enum(['AND', 'OR']).default('AND'),
        groups: z.array(z.object({
            conditions: z.array(FilterSchemas.filterCondition),
            logic: z.enum(['AND', 'OR']),
        })).optional(),
    }),
};

/**
 * مخططات المستخدم
 */
export const UserSchemas = {
    // مخطط تسجيل المستخدم
    register: z.object({
        email: BaseSchemas.email,
        password: BaseSchemas.password,
        confirmPassword: BaseSchemas.password,
        firstName: z.string().min(2).max(50),
        lastName: z.string().min(2).max(50),
    }).refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    }),

    // مخطط تسجيل الدخول
    login: z.object({
        email: BaseSchemas.email,
        password: BaseSchemas.password,
        rememberMe: z.boolean().default(false),
    }),

    // مخطط تحديث المستخدم
    updateProfile: z.object({
        firstName: z.string().min(2).max(50).optional(),
        lastName: z.string().min(2).max(50).optional(),
        email: BaseSchemas.email.optional(),
        phone: z.string().optional(),
        timezone: z.string().optional(),
        language: z.string().optional(),
    }),
};

/**
 * مخططات API
 */
export const ApiSchemas = {
    // مخطط رد API
    apiResponse: z.object({
        success: z.boolean(),
        data: z.any().optional(),
        error: z.object({
            code: z.string(),
            message: z.string(),
            details: z.any().optional(),
        }).optional(),
        timestamp: z.number(),
    }),

    // مخطط رد خطأ
    errorResponse: z.object({
        code: z.string(),
        message: z.string(),
        details: z.any().optional(),
        timestamp: z.number(),
    }),
};

/**
 * فئة التحقق الرئيسية
 */
export class SchemaValidator {
    /**
     * تحقق من البيانات مقابل مخطط
     */
    static validate<T>(
        schema: z.ZodSchema<T>,
        data: unknown
    ): { success: boolean; data?: T; error?: string } {
        try {
            const result = schema.parse(data);
            return { success: true, data: result };
        } catch (error) {
            if (error instanceof z.ZodError) {
                return {
                    success: false,
                    error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
                };
            }
            return { success: false, error: 'Validation failed' };
        }
    }

    /**
     * تحقق من البيانات مقابل مخطط مع إرجاع الأخطاء المفصلة
     */
    static validateWithDetails<T>(
        schema: z.ZodSchema<T>,
        data: unknown
    ): { success: boolean; data?: T; errors?: z.ZodError['errors'] } {
        try {
            const result = schema.parse(data);
            return { success: true, data: result };
        } catch (error) {
            if (error instanceof z.ZodError) {
                return { success: false, errors: error.errors };
            }
            return { success: false, errors: [] };
        }
    }

    /**
     * تحقق من نوع البيانات
     */
    static validateType<T>(schema: z.ZodSchema<T>, data: unknown): data is T {
        return schema.safeParse(data).success;
    }

    /**
     * إنشاء مخطط مخصص
     */
    static createSchema<T>(validator: (data: unknown) => data is T) {
        return z.custom<T>(validator);
    }

    /**
     * تحقق من صحة إعدادات التطبيق
     */
    static validateAppSettings(settings: unknown) {
        const schema = z.object({
            theme: z.enum(['light', 'dark', 'auto']).default('auto'),
            language: z.string().default('en'),
            timezone: z.string().default('UTC'),
            notifications: z.object({
                email: z.boolean().default(false),
                push: z.boolean().default(true),
                sound: z.boolean().default(true),
            }).default({}),
            trading: z.object({
                defaultMarket: z.enum(['crypto', 'stocks']).default('crypto'),
                defaultTimeframe: z.string().default('1d'),
                defaultCapital: z.number().positive().default(10000),
            }).default({}),
        });

        return this.validate(schema, settings);
    }
}