// services/strategies/liveStrategy.service.ts
export class LiveStrategyService {
    private activeStrategies = new Map<string, any>();
    private strategyResults = new Map<string, any[]>();

    // تشغيل استراتيجية على البيانات الحيَّة
    async runLiveStrategy(
        strategyConfig: any,
        symbol: string,
        timeframe: string,
        data: any[],
        indicatorsData: any = {}
    ): Promise<any> {
        const strategyId = `${symbol}_${timeframe}_${strategyConfig.name}`;

        try {
            // تطبيق شروط الاستراتيجية
            const conditions = await this.evaluateConditions(
                strategyConfig.conditions,
                data,
                indicatorsData
            );

            // توليد إشارات
            const signals = await this.generateSignals(
                conditions,
                strategyConfig.entry_rules,
                strategyConfig.exit_rules
            );

            // تحديث النتائج
            const currentResults = this.strategyResults.get(strategyId) || [];
            currentResults.push({
                timestamp: new Date(),
                conditions,
                signals,
                data: data[data.length - 1]
            });

            // حفظ فقط آخر 100 نتيجة
            if (currentResults.length > 100) {
                currentResults.shift();
            }

            this.strategyResults.set(strategyId, currentResults);

            // إرجاع أحدث إشارة
            return {
                strategyId,
                lastSignal: signals[signals.length - 1],
                allSignals: signals,
                conditions
            };
        } catch (error) {
            console.error(`❌ Error running strategy ${strategyConfig.name}:`, error);
            throw error;
        }
    }

    private async evaluateConditions(
        conditions: any[],
        data: any[],
        indicatorsData: any
    ): Promise<any[]> {
        const evaluatedConditions: any[] = [];
        const lastCandle = data[data.length - 1];

        for (const condition of conditions) {
            let result = false;
            let value = null;

            switch (condition.type) {
                case 'price_cross':
                    // تقاطع السعر مع مؤشر
                    const indicatorData = indicatorsData[condition.indicator];
                    if (indicatorData && indicatorData.length > 0) {
                        const indicatorValue = indicatorData[indicatorData.length - 1].value;
                        const price = lastCandle.close;

                        if (condition.direction === 'above') {
                            result = price > indicatorValue;
                            value = { price, indicatorValue };
                        } else {
                            result = price < indicatorValue;
                            value = { price, indicatorValue };
                        }
                    }
                    break;

                case 'indicator_cross':
                    // تقاطع بين مؤشرين
                    const indicator1Data = indicatorsData[condition.indicator1];
                    const indicator2Data = indicatorsData[condition.indicator2];

                    if (indicator1Data && indicator2Data &&
                        indicator1Data.length > 1 && indicator2Data.length > 1) {

                        const current1 = indicator1Data[indicator1Data.length - 1].value;
                        const previous1 = indicator1Data[indicator1Data.length - 2].value;
                        const current2 = indicator2Data[indicator2Data.length - 1].value;
                        const previous2 = indicator2Data[indicator2Data.length - 2].value;

                        if (condition.direction === 'above') {
                            result = previous1 <= previous2 && current1 > current2;
                        } else {
                            result = previous1 >= previous2 && current1 < current2;
                        }
                        value = { current1, current2, previous1, previous2 };
                    }
                    break;

                case 'rsi_level':
                    // مستوى RSI
                    const rsiData = indicatorsData.RSI;
                    if (rsiData && rsiData.length > 0) {
                        const rsiValue = rsiData[rsiData.length - 1].value;

                        if (condition.operator === '>') {
                            result = rsiValue > condition.value;
                        } else {
                            result = rsiValue < condition.value;
                        }
                        value = rsiValue;
                    }
                    break;

                case 'volume_surge':
                    // زيادة مفاجئة في الحجم
                    if (data.length > condition.lookback) {
                        const recentVolumes = data.slice(-condition.lookback - 1, -1)
                            .map(c => c.volume);
                        const avgVolume = recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;
                        const currentVolume = lastCandle.volume;

                        result = currentVolume > (avgVolume * condition.multiplier);
                        value = { currentVolume, avgVolume, multiplier: condition.multiplier };
                    }
                    break;

                case 'pattern':
                    // أنماط الشموع
                    result = this.detectPattern(data, condition.pattern);
                    break;
            }

            evaluatedConditions.push({
                ...condition,
                result,
                value,
                timestamp: new Date()
            });
        }

        return evaluatedConditions;
    }

    private detectPattern(data: any[], patternType: string): boolean {
        if (data.length < 3) return false;

        const lastCandle = data[data.length - 1];
        const prevCandle = data[data.length - 2];
        const prevPrevCandle = data[data.length - 3];

        switch (patternType) {
            case 'engulfing_bullish':
                // شمعة ابتلاع صعودية
                return prevCandle.close < prevCandle.open && // شمعة هابطة سابقة
                    lastCandle.close > lastCandle.open && // شمعة صاعدة حالية
                    lastCandle.open < prevCandle.close && // فتح الشمعة الحالية أقل من إغلاق السابقة
                    lastCandle.close > prevCandle.open;   // إغلاق الشمعة الحالية أعلى من فتح السابقة

            case 'engulfing_bearish':
                // شمعة ابتلاع هابطة
                return prevCandle.close > prevCandle.open && // شمعة صاعدة سابقة
                    lastCandle.close < lastCandle.open && // شمعة هابطة حالية
                    lastCandle.open > prevCandle.close && // فتح الشمعة الحالية أعلى من إغلاق السابقة
                    lastCandle.close < prevCandle.open;   // إغلاق الشمعة الحالية أقل من فتح السابقة

            case 'hammer':
                // شمعة المطرقة
                const bodySize = Math.abs(lastCandle.close - lastCandle.open);
                const lowerWick = Math.min(lastCandle.close, lastCandle.open) - lastCandle.low;
                const upperWick = lastCandle.high - Math.max(lastCandle.close, lastCandle.open);

                return lowerWick > (bodySize * 2) && // ذيل سفلي طويل
                    upperWick < (bodySize * 0.3) && // ذيل علوي قصير
                    lastCandle.close > lastCandle.open; // جسم صاعد

            case 'shooting_star':
                // شمعة النجم الساقط
                const bodySize2 = Math.abs(lastCandle.close - lastCandle.open);
                const lowerWick2 = Math.min(lastCandle.close, lastCandle.open) - lastCandle.low;
                const upperWick2 = lastCandle.high - Math.max(lastCandle.close, lastCandle.open);

                return upperWick2 > (bodySize2 * 2) && // ذيل علوي طويل
                    lowerWick2 < (bodySize2 * 0.3) && // ذيل سفلي قصير
                    lastCandle.close < lastCandle.open; // جسم هابط

            default:
                return false;
        }
    }

    private async generateSignals(
        conditions: any[],
        entryRules: any,
        exitRules: any
    ): Promise<any[]> {
        const signals: any[] = [];
        const allConditionsMet = conditions.every(c => c.result);

        if (allConditionsMet && entryRules) {
            // توليد إشارة دخول
            signals.push({
                type: 'entry',
                side: entryRules.side || 'buy',
                timestamp: new Date(),
                conditions,
                confidence: this.calculateConfidence(conditions)
            });
        }

        // تطبيق قواعد الخروج
        if (exitRules) {
            // يمكن إضافة منطق الخروج هنا
        }

        return signals;
    }

    private calculateConfidence(conditions: any[]): number {
        if (conditions.length === 0) return 0;

        // يمكن تطبيق منطق أكثر تعقيداً لحساب الثقة
        const trueConditions = conditions.filter(c => c.result).length;
        return (trueConditions / conditions.length) * 100;
    }

    // الحصول على نتائج الاستراتيجية
    getStrategyResults(strategyId: string): any[] {
        return this.strategyResults.get(strategyId) || [];
    }

    // إيقاف الاستراتيجية
    stopStrategy(strategyId: string) {
        this.activeStrategies.delete(strategyId);
        this.strategyResults.delete(strategyId);
    }

    // الحصول على الاستراتيجيات النشطة
    getActiveStrategies(): string[] {
        return Array.from(this.activeStrategies.keys());
    }
}

export const liveStrategyService = new LiveStrategyService();