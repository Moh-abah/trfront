
// @ts-nocheck

/**
 * أدوات تحقق خاصة بالاستراتيجيات
 */

import { z } from 'zod';
import { SchemaValidator } from './schema.validator';
import { StrategySchemas } from './schema.validator';

export class StrategyValidator {
    /**
     * التحقق من صحة تكوين الاستراتيجية
     */
    static validateStrategyConfig(config: unknown) {
        return SchemaValidator.validate(StrategySchemas.strategyConfig, config);
    }

    /**
     * التحقق من صحة شرط التداول
     */
    static validateTradingCondition(condition: unknown) {
        return SchemaValidator.validate(StrategySchemas.tradingCondition, condition);
    }

    /**
     * التحقق من صحة قاعدة التداول
     */
    static validateTradingRule(rule: unknown) {
        return SchemaValidator.validate(StrategySchemas.tradingRule, rule);
    }

    /**
     * التحقق من منطقية الاستراتيجية
     */
    static validateStrategyLogic(strategy: any): { valid: boolean; warnings: string[] } {
        const warnings: string[] = [];

        // التحقق من وجود قواعد
        if (!strategy.rules || strategy.rules.length === 0) {
            return { valid: false, warnings: ['Strategy must have at least one rule'] };
        }

        // التحقق من عدم وجود تعارض في القواعد
        const buyRules = strategy.rules.filter((r: any) => r.action === 'buy');
        const sellRules = strategy.rules.filter((r: any) => r.action === 'sell');

        if (buyRules.length === 0) {
            warnings.push('Strategy has no buy rules');
        }

        if (sellRules.length === 0) {
            warnings.push('Strategy has no sell rules');
        }

        // التحقق من المؤشرات المطلوبة
        const requiredIndicators = new Set<string>();
        strategy.rules.forEach((rule: any) => {
            rule.conditions.forEach((condition: any) => {
                requiredIndicators.add(condition.indicator);
            });
        });

        // التحقق من توفر المؤشرات المطلوبة
        const availableIndicators = new Set(
            strategy.indicators?.map((i: any) => i.name) || []
        );

        requiredIndicators.forEach(indicator => {
            if (!availableIndicators.has(indicator)) {
                warnings.push(`Required indicator "${indicator}" is not configured`);
            }
        });

        // التحقق من توازن المخاطر
        const hasStopLoss = strategy.parameters?.stop_loss !== undefined;
        const hasTakeProfit = strategy.parameters?.take_profit !== undefined;

        if (!hasStopLoss) {
            warnings.push('Strategy has no stop loss parameter');
        }

        if (!hasTakeProfit) {
            warnings.push('Strategy has no take profit parameter');
        }

        if (hasStopLoss && hasTakeProfit) {
            const stopLoss = strategy.parameters.stop_loss;
            const takeProfit = strategy.parameters.take_profit;

            if (takeProfit <= stopLoss) {
                warnings.push('Take profit should be greater than stop loss');
            }
        }

        // التحقق من إعدادات الوقت
        const timeframe = strategy.parameters?.timeframe;
        if (timeframe && !this.isValidTimeframe(timeframe)) {
            warnings.push(`Invalid timeframe: ${timeframe}`);
        }

        return {
            valid: warnings.length === 0,
            warnings
        };
    }

    /**
     * التحقق من إطار زمني صالح
     */
    static isValidTimeframe(timeframe: string): boolean {
        const validTimeframes = [
            '1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M'
        ];
        return validTimeframes.includes(timeframe);
    }

    /**
     * التحقق من معاملات المؤشر
     */
    static validateIndicatorParameters(
        indicatorName: string,
        parameters: Record<string, any>
    ): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        // قائمة بالمعاملات المعروفة لكل مؤشر
        const indicatorParams: Record<string, Record<string, { min: number; max: number; type: string }>> = {
            'RSI': {
                period: { min: 2, max: 100, type: 'integer' },
                overbought: { min: 50, max: 90, type: 'number' },
                oversold: { min: 10, max: 50, type: 'number' },
            },
            'MACD': {
                fastPeriod: { min: 2, max: 50, type: 'integer' },
                slowPeriod: { min: 2, max: 100, type: 'integer' },
                signalPeriod: { min: 1, max: 50, type: 'integer' },
            },
            'Moving Average': {
                period: { min: 1, max: 200, type: 'integer' },
                type: { min: 0, max: 0, type: 'string' }, // نوع التعديلات
            },
            'Bollinger Bands': {
                period: { min: 2, max: 100, type: 'integer' },
                stdDev: { min: 1, max: 3, type: 'number' },
            },
            'Stochastic': {
                kPeriod: { min: 1, max: 50, type: 'integer' },
                dPeriod: { min: 1, max: 50, type: 'integer' },
                slowing: { min: 1, max: 10, type: 'integer' },
            },
        };

        const paramDefs = indicatorParams[indicatorName];
        if (!paramDefs) {
            return { valid: true, errors: [] }; // مؤشر غير معروف - نفترض أنه صالح
        }

        for (const [paramName, paramDef] of Object.entries(paramDefs)) {
            const value = parameters[paramName];

            if (value === undefined || value === null) {
                if (paramName === 'period') {
                    errors.push(`${paramName} is required for ${indicatorName}`);
                }
                continue;
            }

            // التحقق من النوع
            if (paramDef.type === 'integer' && !Number.isInteger(value)) {
                errors.push(`${paramName} must be an integer`);
            } else if (paramDef.type === 'number' && typeof value !== 'number') {
                errors.push(`${paramName} must be a number`);
            } else if (paramDef.type === 'string' && typeof value !== 'string') {
                errors.push(`${paramName} must be a string`);
            }

            // التحقق من النطاق
            if (typeof value === 'number') {
                if (value < paramDef.min) {
                    errors.push(`${paramName} must be at least ${paramDef.min}`);
                }
                if (value > paramDef.max) {
                    errors.push(`${paramName} cannot exceed ${paramDef.max}`);
                }
            }
        }

        return { valid: errors.length === 0, errors };
    }

    /**
     * التحقق من شروط التداول
     */
    static validateTradingConditions(conditions: any[]): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!Array.isArray(conditions)) {
            return { valid: false, errors: ['Conditions must be an array'] };
        }

        conditions.forEach((condition, index) => {
            if (!condition.indicator) {
                errors.push(`Condition ${index + 1}: Indicator is required`);
            }

            if (!condition.operator) {
                errors.push(`Condition ${index + 1}: Operator is required`);
            }

            if (condition.value === undefined) {
                errors.push(`Condition ${index + 1}: Value is required`);
            }

            // التحقق من القيم الخاصة بالمشغلات
            if (condition.operator === 'between' || condition.operator === 'not_between') {
                if (condition.value2 === undefined) {
                    errors.push(`Condition ${index + 1}: Second value is required for "between" operator`);
                }
            }

            // التحقق من القيم المعقولة
            if (typeof condition.value === 'number') {
                if (Math.abs(condition.value) > 1000000) {
                    warnings.push(`Condition ${index + 1}: Value seems unusually large`);
                }
            }
        });

        return { valid: errors.length === 0, errors };
    }

    /**
     * تقييم تعقيد الاستراتيجية
     */
    static assessStrategyComplexity(strategy: any): {
        level: 'low' | 'medium' | 'high';
        score: number;
        factors: string[];
    } {
        let score = 0;
        const factors: string[] = [];

        // عدد القواعد
        const ruleCount = strategy.rules?.length || 0;
        if (ruleCount > 5) {
            score += 2;
            factors.push(`High rule count (${ruleCount})`);
        } else if (ruleCount > 2) {
            score += 1;
            factors.push(`Moderate rule count (${ruleCount})`);
        }

        // عدد الشروط لكل قاعدة
        strategy.rules?.forEach((rule: any, index: number) => {
            const conditionCount = rule.conditions?.length || 0;
            if (conditionCount > 3) {
                score += 1;
                factors.push(`Rule ${index + 1} has many conditions (${conditionCount})`);
            }
        });

        // عدد المؤشرات
        const indicatorCount = strategy.indicators?.length || 0;
        if (indicatorCount > 3) {
            score += 2;
            factors.push(`Uses multiple indicators (${indicatorCount})`);
        }

        // تعقيد المؤشرات
        const complexIndicators = ['MACD', 'Bollinger Bands', 'Stochastic', 'Fibonacci'];
        strategy.indicators?.forEach((indicator: any) => {
            if (complexIndicators.includes(indicator.name)) {
                score += 1;
                factors.push(`Uses complex indicator: ${indicator.name}`);
            }
        });

        // استخدام المنطق المتداخل
        if (strategy.rules?.some((r: any) => r.logic === 'OR' && r.conditions?.length > 1)) {
            score += 1;
            factors.push('Uses OR logic with multiple conditions');
        }

        // تحديد مستوى التعقيد
        let level: 'low' | 'medium' | 'high';
        if (score <= 2) {
            level = 'low';
        } else if (score <= 5) {
            level = 'medium';
        } else {
            level = 'high';
        }

        return { level, score, factors };
    }

    /**
     * التحقق من توافق الاستراتيجية مع السوق
     */
    static validateMarketCompatibility(
        strategy: any,
        marketType: 'crypto' | 'stocks'
    ): { compatible: boolean; warnings: string[] } {
        const warnings: string[] = [];

        // المؤشرات المناسبة لكل سوق
        const cryptoIndicators = ['RSI', 'MACD', 'Bollinger Bands', 'Volume Profile', 'ATR'];
        const stockIndicators = ['RSI', 'MACD', 'Moving Average', 'VWAP', 'Pivot Points'];

        const strategyIndicators = strategy.indicators?.map((i: any) => i.name) || [];

        strategyIndicators.forEach((indicator: string) => {
            if (marketType === 'crypto' && !cryptoIndicators.includes(indicator)) {
                warnings.push(`Indicator "${indicator}" is not commonly used for crypto trading`);
            }

            if (marketType === 'stocks' && !stockIndicators.includes(indicator)) {
                warnings.push(`Indicator "${indicator}" is not commonly used for stock trading`);
            }
        });

        // الإطارات الزمنية المناسبة
        const timeframe = strategy.parameters?.timeframe;
        if (timeframe) {
            if (marketType === 'crypto' && timeframe.endsWith('m') && parseInt(timeframe) < 15) {
                warnings.push(`Very short timeframe (${timeframe}) may be too noisy for crypto`);
            }

            if (marketType === 'stocks' && timeframe.endsWith('m')) {
                warnings.push(`Intraday trading (${timeframe}) requires careful consideration for stocks`);
            }
        }

        return {
            compatible: warnings.length === 0,
            warnings
        };
    }
}