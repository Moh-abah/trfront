/**
 * أدوات حساب المؤشرات الفنية
 */

export interface CandleData {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface IndicatorResult {
    value: number;
    signal?: 'buy' | 'sell' | 'neutral';
    metadata?: Record<string, any>;
}

export class IndicatorCalculator {
    /**
     * حساب المتوسط المتحرك البسيط (SMA)
     */
    static calculateSMA(
        data: number[],
        period: number
    ): number[] {
        if (data.length < period) {
            return [];
        }

        const sma: number[] = [];
        for (let i = period - 1; i < data.length; i++) {
            const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
            sma.push(sum / period);
        }

        return sma;
    }

    /**
     * حساب المتوسط المتحرك الأسي (EMA)
     */
    static calculateEMA(
        data: number[],
        period: number
    ): number[] {
        if (data.length < period) {
            return [];
        }

        const ema: number[] = [];
        const multiplier = 2 / (period + 1);

        // حساب أول قيمة EMA كـ SMA
        const firstSMA = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
        ema.push(firstSMA);

        // حساب بقية القيم
        for (let i = period; i < data.length; i++) {
            const currentEMA = (data[i] - ema[i - period]) * multiplier + ema[i - period];
            ema.push(currentEMA);
        }

        return ema;
    }

    /**
     * حساب مؤشر RSI
     */
    static calculateRSI(
        prices: number[],
        period: number = 14
    ): IndicatorResult[] {
        if (prices.length < period + 1) {
            return [];
        }

        const results: IndicatorResult[] = [];
        let avgGain = 0;
        let avgLoss = 0;

        // حساب أول متوسط
        for (let i = 1; i <= period; i++) {
            const change = prices[i] - prices[i - 1];
            if (change > 0) {
                avgGain += change;
            } else {
                avgLoss += Math.abs(change);
            }
        }

        avgGain /= period;
        avgLoss /= period;

        // حساب أول قيمة RSI
        let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        let rsi = 100 - (100 / (1 + rs));

        results.push({
            value: rsi,
            signal: this.getRSISignal(rsi),
            metadata: { avgGain, avgLoss, rs }
        });

        // حساب بقية القيم
        for (let i = period + 1; i < prices.length; i++) {
            const change = prices[i] - prices[i - 1];
            let currentGain = change > 0 ? change : 0;
            let currentLoss = change < 0 ? Math.abs(change) : 0;

            // تطبيق المتوسط المتحرك الأسي
            avgGain = (avgGain * (period - 1) + currentGain) / period;
            avgLoss = (avgLoss * (period - 1) + currentLoss) / period;

            rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
            rsi = 100 - (100 / (1 + rs));

            results.push({
                value: rsi,
                signal: this.getRSISignal(rsi),
                metadata: { avgGain, avgLoss, rs }
            });
        }

        return results;
    }

    /**
     * حساب مؤشر MACD
     */
    static calculateMACD(
        prices: number[],
        fastPeriod: number = 12,
        slowPeriod: number = 26,
        signalPeriod: number = 9
    ): {
        macd: number[];
        signal: number[];
        histogram: number[];
    } {
        if (prices.length < slowPeriod) {
            return { macd: [], signal: [], histogram: [] };
        }

        // حساب الـ EMA
        const fastEMA = this.calculateEMA(prices, fastPeriod);
        const slowEMA = this.calculateEMA(prices, slowPeriod);

        // حساب الـ MACD
        const macd: number[] = [];
        const offset = slowPeriod - fastPeriod;

        for (let i = 0; i < fastEMA.length - offset; i++) {
            macd.push(fastEMA[i + offset] - slowEMA[i]);
        }

        // حساب خط الإشارة
        const signal = this.calculateEMA(macd, signalPeriod);

        // حساب الهيستوجرام
        const histogram: number[] = [];
        const signalOffset = macd.length - signal.length;

        for (let i = 0; i < signal.length; i++) {
            histogram.push(macd[i + signalOffset] - signal[i]);
        }

        return {
            macd: macd.slice(signalOffset),
            signal,
            histogram
        };
    }

    /**
     * حساب Bollinger Bands
     */
    static calculateBollingerBands(
        prices: number[],
        period: number = 20,
        stdDev: number = 2
    ): {
        upper: number[];
        middle: number[];
        lower: number[];
        bandwidth: number[];
        percentB: number[];
    } {
        if (prices.length < period) {
            return { upper: [], middle: [], lower: [], bandwidth: [], percentB: [] };
        }

        const upper: number[] = [];
        const middle: number[] = [];
        const lower: number[] = [];
        const bandwidth: number[] = [];
        const percentB: number[] = [];

        for (let i = period - 1; i < prices.length; i++) {
            const slice = prices.slice(i - period + 1, i + 1);
            const sma = this.calculateSMA(slice, slice.length)[0];

            // حساب الانحراف المعياري
            const variance = slice.reduce((sum, price) => {
                return sum + Math.pow(price - sma, 2);
            }, 0) / period;

            const standardDeviation = Math.sqrt(variance);

            // حساب النطاقات
            const upperBand = sma + (standardDeviation * stdDev);
            const lowerBand = sma - (standardDeviation * stdDev);

            upper.push(upperBand);
            middle.push(sma);
            lower.push(lowerBand);

            // حساب عرض النطاق
            bandwidth.push((upperBand - lowerBand) / sma * 100);

            // حساب Percent B
            const currentPrice = prices[i];
            percentB.push((currentPrice - lowerBand) / (upperBand - lowerBand));
        }

        return { upper, middle, lower, bandwidth, percentB };
    }

    /**
     * حساب Stochastic Oscillator
     */
    static calculateStochastic(
        candles: CandleData[],
        kPeriod: number = 14,
        dPeriod: number = 3,
        slowing: number = 3
    ): {
        k: number[];
        d: number[];
        overbought: boolean[];
        oversold: boolean[];
    } {
        if (candles.length < kPeriod + slowing) {
            return { k: [], d: [], overbought: [], oversold: [] };
        }

        const kValues: number[] = [];
        const dValues: number[] = [];
        const overbought: boolean[] = [];
        const oversold: boolean[] = [];

        // حساب %K
        for (let i = kPeriod - 1; i < candles.length; i++) {
            const slice = candles.slice(i - kPeriod + 1, i + 1);
            const highestHigh = Math.max(...slice.map(c => c.high));
            const lowestLow = Math.min(...slice.map(c => c.low));
            const currentClose = candles[i].close;

            const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
            kValues.push(k);
        }

        // تطبيق عامل الإبطاء
        const slowedK: number[] = [];
        for (let i = slowing - 1; i < kValues.length; i++) {
            const slice = kValues.slice(i - slowing + 1, i + 1);
            const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
            slowedK.push(avg);
        }

        // حساب %D
        for (let i = dPeriod - 1; i < slowedK.length; i++) {
            const slice = slowedK.slice(i - dPeriod + 1, i + 1);
            const d = slice.reduce((a, b) => a + b, 0) / slice.length;
            dValues.push(d);

            // تحديد حالات التشبع
            const currentK = slowedK[i];
            overbought.push(currentK > 80);
            oversold.push(currentK < 20);
        }

        return {
            k: slowedK.slice(dPeriod - 1),
            d: dValues,
            overbought,
            oversold
        };
    }

    /**
     * حساب Average True Range (ATR)
     */
    static calculateATR(
        candles: CandleData[],
        period: number = 14
    ): number[] {
        if (candles.length < period + 1) {
            return [];
        }

        const trueRanges: number[] = [];

        // حساب True Range الأول
        for (let i = 1; i < candles.length; i++) {
            const current = candles[i];
            const previous = candles[i - 1];

            const highLow = current.high - current.low;
            const highPrevClose = Math.abs(current.high - previous.close);
            const lowPrevClose = Math.abs(current.low - previous.close);

            const trueRange = Math.max(highLow, highPrevClose, lowPrevClose);
            trueRanges.push(trueRange);
        }

        // حساب ATR
        const atr: number[] = [];
        let sum = trueRanges.slice(0, period).reduce((a, b) => a + b, 0);
        atr.push(sum / period);

        for (let i = period; i < trueRanges.length; i++) {
            const currentATR = (atr[atr.length - 1] * (period - 1) + trueRanges[i]) / period;
            atr.push(currentATR);
        }

        return atr;
    }

    /**
     * حساب Volume Weighted Average Price (VWAP)
     */
    static calculateVWAP(candles: CandleData[]): number[] {
        if (candles.length === 0) {
            return [];
        }

        const vwap: number[] = [];
        let cumulativeTPV = 0; // Typical Price * Volume
        let cumulativeVolume = 0;

        for (const candle of candles) {
            const typicalPrice = (candle.high + candle.low + candle.close) / 3;
            cumulativeTPV += typicalPrice * candle.volume;
            cumulativeVolume += candle.volume;

            vwap.push(cumulativeTPV / cumulativeVolume);
        }

        return vwap;
    }

    /**
     * حساب Fibonacci Retracement Levels
     */
    static calculateFibonacciLevels(
        high: number,
        low: number
    ): Record<string, number> {
        const diff = high - low;

        return {
            '0%': high,
            '23.6%': high - diff * 0.236,
            '38.2%': high - diff * 0.382,
            '50%': high - diff * 0.5,
            '61.8%': high - diff * 0.618,
            '78.6%': high - diff * 0.786,
            '100%': low,
            '161.8%': high + diff * 0.618,
            '261.8%': high + diff * 1.618,
        };
    }

    /**
     * حساب Pivot Points
     */
    static calculatePivotPoints(
        high: number,
        low: number,
        close: number,
        type: 'standard' | 'fibonacci' | 'woodie' | 'camarilla' = 'standard'
    ): Record<string, number> {
        const pivot = (high + low + close) / 3;

        switch (type) {
            case 'standard':
                return {
                    pivot,
                    r1: (2 * pivot) - low,
                    r2: pivot + (high - low),
                    r3: high + 2 * (pivot - low),
                    s1: (2 * pivot) - high,
                    s2: pivot - (high - low),
                    s3: low - 2 * (high - pivot)
                };

            case 'fibonacci':
                const diff = high - low;
                return {
                    pivot,
                    r1: pivot + (diff * 0.382),
                    r2: pivot + (diff * 0.618),
                    r3: pivot + (diff * 1.0),
                    s1: pivot - (diff * 0.382),
                    s2: pivot - (diff * 0.618),
                    s3: pivot - (diff * 1.0)
                };

            case 'woodie':
                const woodiePivot = (high + low + (2 * close)) / 4;
                return {
                    pivot: woodiePivot,
                    r1: (2 * woodiePivot) - low,
                    r2: woodiePivot + (high - low),
                    s1: (2 * woodiePivot) - high,
                    s2: woodiePivot - (high - low)
                };

            case 'camarilla':
                return {
                    pivot,
                    r1: close + (1.1 * (high - low) / 12),
                    r2: close + (1.1 * (high - low) / 6),
                    r3: close + (1.1 * (high - low) / 4),
                    r4: close + (1.1 * (high - low) / 2),
                    s1: close - (1.1 * (high - low) / 12),
                    s2: close - (1.1 * (high - low) / 6),
                    s3: close - (1.1 * (high - low) / 4),
                    s4: close - (1.1 * (high - low) / 2)
                };

            default:
                return { pivot };
        }
    }

    /**
     * حساب إشارة من مؤشرين
     */
    static calculateCrossSignal(
        fastLine: number[],
        slowLine: number[]
    ): ('buy' | 'sell' | 'neutral')[] {
        if (fastLine.length !== slowLine.length) {
            return [];
        }

        const signals: ('buy' | 'sell' | 'neutral')[] = [];

        for (let i = 1; i < fastLine.length; i++) {
            const prevFast = fastLine[i - 1];
            const prevSlow = slowLine[i - 1];
            const currFast = fastLine[i];
            const currSlow = slowLine[i];

            if (prevFast < prevSlow && currFast > currSlow) {
                signals.push('buy'); // تقاطع لأعلى
            } else if (prevFast > prevSlow && currFast < currSlow) {
                signals.push('sell'); // تقاطع لأسفل
            } else {
                signals.push('neutral');
            }
        }

        return signals;
    }

    /**
     * حساب قوة الإشارة
     */
    static calculateSignalStrength(
        indicatorValue: number,
        threshold: number = 0.5
    ): number {
        // قيمة بين 0 و1 تمثل قوة الإشارة
        return Math.min(Math.abs(indicatorValue) / threshold, 1);
    }

    /**
     * حساب إشارة RSI
     */
    private static getRSISignal(rsi: number): 'buy' | 'sell' | 'neutral' {
        if (rsi < 30) return 'buy';
        if (rsi > 70) return 'sell';
        return 'neutral';
    }

    /**
     * حساب الانحراف المعياري
     */
    static calculateStandardDeviation(
        data: number[],
        mean?: number
    ): number {
        if (data.length === 0) return 0;

        const dataMean = mean || data.reduce((a, b) => a + b, 0) / data.length;
        const variance = data.reduce((sum, value) => {
            return sum + Math.pow(value - dataMean, 2);
        }, 0) / data.length;

        return Math.sqrt(variance);
    }

    /**
     * حساب الانحراف
     */
    static calculateDeviation(
        value: number,
        mean: number,
        stdDev: number
    ): number {
        if (stdDev === 0) return 0;
        return (value - mean) / stdDev;
    }

    /**
     * تسوية البيانات
     */
    static normalizeData(data: number[]): number[] {
        if (data.length === 0) return [];

        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min;

        if (range === 0) return data.map(() => 0.5);

        return data.map(value => (value - min) / range);
    }

    /**
     * حساب الزخم
     */
    static calculateMomentum(
        prices: number[],
        period: number = 10
    ): number[] {
        if (prices.length < period) {
            return [];
        }

        const momentum: number[] = [];
        for (let i = period; i < prices.length; i++) {
            momentum.push(prices[i] - prices[i - period]);
        }

        return momentum;
    }

    /**
     * حساب معدل التغير
     */
    static calculateRateOfChange(
        prices: number[],
        period: number = 10
    ): number[] {
        if (prices.length < period) {
            return [];
        }

        const roc: number[] = [];
        for (let i = period; i < prices.length; i++) {
            const change = ((prices[i] - prices[i - period]) / prices[i - period]) * 100;
            roc.push(change);
        }

        return roc;
    }
}