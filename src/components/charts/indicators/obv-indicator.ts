// indicators/obv-indicator.ts

// @ts-nocheck

import { IChartApi, ISeriesApi, UTCTimestamp, LineSeries } from "lightweight-charts";
import { BaseIndicator, IndicatorConfig, IndicatorData } from "./base-indicator";

type TimeValue = { time: UTCTimestamp; value: number };

export class OBVIndicator extends BaseIndicator {
    private mainSeries: ISeriesApi<"Line"> | null = null;
    private obvCache: TimeValue[] = [];
    private hasFullData: boolean = false;

    constructor(chart: IChartApi, config: IndicatorConfig) {
        super(chart, config);
    }

    createSeries(): ISeriesApi<any>[] {
        console.log(`[OBV] 🎨 إنشاء سلسلة OBV`, {
            id: this.config.id,
            scale: this.config.priceScaleId,
            color: this.config.color,
            overlay: this.config.overlay
        });

        // 🔥 OBV يكون في منطقة منفصلة تحت السعر (مثل ATR)
        const scaleId = this.config.priceScaleId || 'obv_scale';

        this.mainSeries = this.chart.addSeries(LineSeries, {
            color: this.config.color || '#8A2BE2', // 🔥 لون بنفسجي
            lineWidth: 2,
            priceScaleId: scaleId,
            title: this.config.name || 'OBV',
            lastValueVisible: true,
            priceLineVisible: false,
            lineStyle: 0, // خط متصل
        });

        // 🔥 ضبط المقياس ليكون في الأسفل
        this.chart.priceScale(scaleId).applyOptions({
            autoScale: true,
            scaleMargins: {
                top: 0.85, // يبدأ من 85% من الشارت
                bottom: 0.05,
            },
            borderVisible: true,
            borderColor: '#8A2BE2',
        });

        this.isSeriesCreated = true;
        return [this.mainSeries];
    }

    updateData(data: IndicatorData): void {
        if (!this.mainSeries) {
            console.error(`[OBV] ❌ السلسلة غير مهيئة`);
            return;
        }

        console.log(`[OBV] 🔄 استقبال بيانات ${this.config.id}:`, {
            isHistorical: data.isHistorical,
            isInitialData: data.isInitialData,
            isLiveUpdate: data.isLiveUpdate,
            valuesLength: data.values?.length,
            cacheLength: this.obvCache.length,
            hasFullData: this.hasFullData,
            hasSignals: !!data.signals,
            signalsLength: data.signals?.data?.length
        });

        // معالجة البيانات التاريخية الكاملة
        if ((data.isHistorical || data.isInitialData) && !this.hasFullData) {
            console.log(`[OBV] 📊 معالجة بيانات تاريخية`);
            this.processHistoricalData(data);
            this.hasFullData = true;
            return;
        }

        // تحديث حي
        if (data.isLiveUpdate && this.hasFullData) {
            console.log(`[OBV] ⚡ تحديث حي`);
            this.processLiveUpdate(data);
            return;
        }

        // معالجة عامة
        if (data.values && data.values.length > 0) {
            this.processHistoricalData(data);
        }
    }

    private processHistoricalData(data: IndicatorData): void {
        // 🔥 OBV لديه signals.index مثل RSI و MACD
        const values = data.values as number[] || [];
        const signals = data.signals;

        let processedData: TimeValue[] = [];

        if (signals?.index && Array.isArray(signals.index) && signals.index.length > 0) {
            console.log(`[OBV] 🔨 بناء نقاط من signals.index`);
            processedData = this.processWithSignals(values, signals);
        } else {
            console.log(`[OBV] 🔧 استخدام processInputData`);
            processedData = this.processInputData(data);
        }

        if (!processedData || processedData.length === 0) {
            console.warn(`[OBV] ⚠️ لا توجد بيانات صالحة`);
            return;
        }

        console.log(`[OBV] 📊 البيانات المعالجة: ${processedData.length} نقطة`);

        if (this.obvCache.length === 0) {
            this.obvCache = processedData;
        } else {
            this.obvCache = this.mergeData(this.obvCache, processedData);
        }

        this.mainSeries!.setData(this.obvCache);
    }

    private processWithSignals(values: number[], signals: any): TimeValue[] {
        const result: TimeValue[] = [];
        const times = signals.index || [];
        const signalsData = signals.data || [];

        // 🔥 نفس منطق الإزاحة المستخدم في RSI و MACD
        const offset = Math.max(0, times.length - values.length);

        console.log(`[OBV] 🔄 OBV offset:`, {
            values: values.length,
            times: times.length,
            signals: signalsData.length,
            offset: offset
        });

        for (let i = 0; i < values.length; i++) {
            const value = values[i];
            const timeIndex = i + offset;

            if (timeIndex >= times.length) {
                console.warn(`[OBV] ⚠️ فهرس الوقت خارج النطاق`);
                break;
            }

            if (value === null || isNaN(value)) {
                continue;
            }

            const time = this.formatTime(times[timeIndex]);
            if ((time as number) === 0) continue;

            // 🔥 يمكننا استخدام signal value للتمييز (1: صعودي, -1: هبوطي, 0: محايد)
            const signal = signalsData[timeIndex] || 0;

            result.push({
                time,
                value,
                // يمكن إضافة metadata للإشارات إذا أردنا
            });
        }

        result.sort((a, b) => (a.time as number) - (b.time as number));
        console.log(`[OBV] ✅ معالجة: ${result.length} نقطة`);
        return result;
    }

    private processLiveUpdate(data: IndicatorData): void {
        if (!data.liveTime || !data.values || data.values.length === 0) return;

        const time = data.liveTime as UTCTimestamp;
        const value = data.values[0];

        if (value === null || isNaN(value)) return;

        this.updateSinglePoint(time, value);
    }

    private updateSinglePoint(time: UTCTimestamp, value: number): void {
        const existingIndex = this.obvCache.findIndex(p =>
            Math.abs((p.time as number) - (time as number)) <= 60
        );

        if (existingIndex >= 0) {
            this.obvCache[existingIndex].value = value;
            try {
                this.mainSeries!.update({ time, value });
                console.log(`[OBV] 🔄 تحديث نقطة: ${value} في ${time}`);
            } catch (error) {
                this.mainSeries!.setData(this.obvCache);
            }
        } else {
            this.obvCache.push({ time, value });
            this.obvCache.sort((a, b) => (a.time as number) - (b.time as number));

            if (this.obvCache.length > 1000) {
                this.obvCache = this.obvCache.slice(-1000);
            }

            this.mainSeries!.setData(this.obvCache);
            console.log(`[OBV] ➕ إضافة نقطة: ${value} في ${time}`);
        }
    }

    protected mergeData(existing: TimeValue[], newData: TimeValue[]): TimeValue[] {
        const map = new Map<number, number>();
        existing.forEach(p => map.set(p.time as number, p.value));
        newData.forEach(p => map.set(p.time as number, p.value));

        return Array.from(map.entries())
            .map(([time, value]) => ({ time: time as UTCTimestamp, value }))
            .sort((a, b) => (a.time as number) - (b.time as number));
    }

    destroy(): void {
        if (this.mainSeries) {
            this.chart.removeSeries(this.mainSeries);
        }
        this.mainSeries = null;
        this.obvCache = [];
        this.isSeriesCreated = false;
        this.hasFullData = false;
        console.log(`[OBV] 🗑️ تم تدمير المؤشر`);
    }
}