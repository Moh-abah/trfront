
// @ts-nocheck
// services/indicators/liveIndicators.service.ts

import { marketService } from "../market.service";


export class LiveIndicatorsService {
    private static instance: LiveIndicatorsService;
    private indicatorsCache = new Map<string, any>();

    static getInstance() {
        if (!LiveIndicatorsService.instance) {
            LiveIndicatorsService.instance = new LiveIndicatorsService();
        }
        return LiveIndicatorsService.instance;
    }

    // تطبيق مؤشر على البيانات
    async applyIndicator(
        symbol: string,
        timeframe: string,
        indicatorName: string,
        parameters: any = {},
        data?: any[]
    ): Promise<any> {
        const cacheKey = `${symbol}_${timeframe}_${indicatorName}_${JSON.stringify(parameters)}`;

        // التحقق من الكاش
        if (this.indicatorsCache.has(cacheKey)) {
            return this.indicatorsCache.get(cacheKey);
        }

        try {
            // الحصول على البيانات إذا لم يتم توفيرها
            let chartData = data;
            if (!chartData) {
                const response = await marketService.getChart(symbol, timeframe);
                chartData = response.data || response;
            }

            // حساب المؤشر
            const indicatorResult = await this.calculateIndicator(
                indicatorName,
                chartData,
                parameters
            );

            // حفظ في الكاش
            this.indicatorsCache.set(cacheKey, indicatorResult);

            return indicatorResult;
        } catch (error) {
            console.error(`❌ Error applying indicator ${indicatorName}:`, error);
            throw error;
        }
    }

    private async calculateIndicator(
        indicatorName: string,
        data: any[],
        parameters: any
    ): Promise<any> {
        // تحويل البيانات للتنسيق المناسب
        const formattedData = data.map(candle => ({
            timestamp: new Date(candle.timestamp).getTime(),
            open: parseFloat(candle.open),
            high: parseFloat(candle.high),
            low: parseFloat(candle.low),
            close: parseFloat(candle.close),
            volume: parseFloat(candle.volume || 0)
        }));

        switch (indicatorName.toLowerCase()) {
            case 'sma':
                return this.calculateSMA(formattedData, parameters.period);
            case 'ema':
                return this.calculateEMA(formattedData, parameters.period);
            case 'rsi':
                return this.calculateRSI(formattedData, parameters.period);
            case 'macd':
                return this.calculateMACD(formattedData, parameters);
            case 'bollinger_bands':
                return this.calculateBollingerBands(formattedData, parameters.period, parameters.std);
            case 'stochastic':
                return this.calculateStochastic(formattedData, parameters.kPeriod, parameters.dPeriod);
            default:
                throw new Error(`Indicator ${indicatorName} not implemented`);
        }
    }

    private calculateSMA(data: any[], period: number = 20): any[] {
        const sma: any[] = [];
        for (let i = period - 1; i < data.length; i++) {
            let sum = 0;
            for (let j = 0; j < period; j++) {
                sum += data[i - j].close;
            }
            sma.push({
                time: data[i].timestamp / 1000,
                value: sum / period
            });
        }
        return sma;
    }

    private calculateEMA(data: any[], period: number = 20): any[] {
        const ema: any[] = [];
        const multiplier = 2 / (period + 1);

        // أول قيمة EMA هي SMA
        let sum = 0;
        for (let i = 0; i < period && i < data.length; i++) {
            sum += data[i].close;
        }
        let emaValue = sum / Math.min(period, data.length);

        ema.push({
            time: data[period - 1]?.timestamp / 1000 || data[0].timestamp / 1000,
            value: emaValue
        });

        // بقية قيم EMA
        for (let i = period; i < data.length; i++) {
            emaValue = (data[i].close - emaValue) * multiplier + emaValue;
            ema.push({
                time: data[i].timestamp / 1000,
                value: emaValue
            });
        }
        return ema;
    }

    private calculateRSI(data: any[], period: number = 14): any[] {
        const rsi: any[] = [];
        const gains: number[] = [];
        const losses: number[] = [];

        // حساب المكاسب والخسائر الأولية
        for (let i = 1; i < data.length; i++) {
            const change = data[i].close - data[i - 1].close;
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? -change : 0);
        }

        // حساب أول RSI
        let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
        let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

        if (avgLoss === 0) {
            rsi.push({
                time: data[period].timestamp / 1000,
                value: 100
            });
        } else {
            const rs = avgGain / avgLoss;
            rsi.push({
                time: data[period].timestamp / 1000,
                value: 100 - (100 / (1 + rs))
            });
        }

        // بقية قيم RSI
        for (let i = period; i < gains.length; i++) {
            avgGain = (avgGain * (period - 1) + gains[i]) / period;
            avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

            if (avgLoss === 0) {
                rsi.push({
                    time: data[i + 1].timestamp / 1000,
                    value: 100
                });
            } else {
                const rs = avgGain / avgLoss;
                rsi.push({
                    time: data[i + 1].timestamp / 1000,
                    value: 100 - (100 / (1 + rs))
                });
            }
        }

        return rsi;
    }

    private calculateMACD(data: any[], parameters: any = {}): any {
        const { fastPeriod = 12, slowPeriod = 26, signalPeriod = 9 } = parameters;

        const ema12 = this.calculateEMA(data, fastPeriod);
        const ema26 = this.calculateEMA(data, slowPeriod);

        const macdLine: any[] = [];
        const minLength = Math.min(ema12.length, ema26.length);

        for (let i = 0; i < minLength; i++) {
            const time = ema26[i].time;
            const value = ema12[i].value - ema26[i].value;
            macdLine.push({ time, value });
        }

        // حساب خط الإشارة (EMA من MACD)
        const signalLine = this.calculateEMAFromValues(macdLine, signalPeriod);

        // حساب الهيستوجرام
        const histogram: any[] = [];
        for (let i = 0; i < signalLine.length; i++) {
            histogram.push({
                time: signalLine[i].time,
                value: macdLine[i + (macdLine.length - signalLine.length)]?.value - signalLine[i].value || 0
            });
        }

        return {
            macd: macdLine.slice(-histogram.length),
            signal: signalLine,
            histogram: histogram
        };
    }

    private calculateEMAFromValues(data: { time: number; value: number }[], period: number): any[] {
        const ema: any[] = [];
        const multiplier = 2 / (period + 1);

        let emaValue = data.slice(0, period)
            .reduce((sum, item) => sum + item.value, 0) / period;

        ema.push({
            time: data[period - 1].time,
            value: emaValue
        });

        for (let i = period; i < data.length; i++) {
            emaValue = (data[i].value - emaValue) * multiplier + emaValue;
            ema.push({
                time: data[i].time,
                value: emaValue
            });
        }
        return ema;
    }

    private calculateBollingerBands(data: any[], period: number = 20, stdDev: number = 2): any {
        const sma = this.calculateSMA(data, period);
        const bands: any[] = [];

        for (let i = period - 1; i < data.length; i++) {
            // حساب الانحراف المعياري
            let sumSquaredDiff = 0;
            for (let j = 0; j < period; j++) {
                const diff = data[i - j].close - sma[i - (period - 1)]?.value;
                sumSquaredDiff += diff * diff;
            }
            const std = Math.sqrt(sumSquaredDiff / period);

            const smaValue = sma[i - (period - 1)]?.value;
            bands.push({
                time: data[i].timestamp / 1000,
                upper: smaValue + (std * stdDev),
                middle: smaValue,
                lower: smaValue - (std * stdDev)
            });
        }

        return bands;
    }

    private calculateStochastic(data: any[], kPeriod: number = 14, dPeriod: number = 3): any {
        const stochasticK: any[] = [];

        for (let i = kPeriod - 1; i < data.length; i++) {
            // أعلى وأدنى سعر في الفترة
            let highest = -Infinity;
            let lowest = Infinity;

            for (let j = 0; j < kPeriod; j++) {
                highest = Math.max(highest, data[i - j].high);
                lowest = Math.min(lowest, data[i - j].low);
            }

            const currentClose = data[i].close;
            const kValue = ((currentClose - lowest) / (highest - lowest)) * 100;

            stochasticK.push({
                time: data[i].timestamp / 1000,
                value: kValue
            });
        }

        // حساب Stochastic D (SMA من K)
        const stochasticD = this.calculateSMAFromValues(stochasticK, dPeriod);

        return {
            k: stochasticK.slice(-stochasticD.length),
            d: stochasticD
        };
    }

    private calculateSMAFromValues(data: { time: number; value: number }[], period: number): any[] {
        const sma: any[] = [];
        for (let i = period - 1; i < data.length; i++) {
            let sum = 0;
            for (let j = 0; j < period; j++) {
                sum += data[i - j].value;
            }
            sma.push({
                time: data[i].time,
                value: sum / period
            });
        }
        return sma;
    }

    // تنظيف الكاش
    clearCache() {
        this.indicatorsCache.clear();
    }
}

export const liveIndicatorsService = LiveIndicatorsService.getInstance();