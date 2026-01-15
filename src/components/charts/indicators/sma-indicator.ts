

// @ts-nocheck

import { IChartApi, ISeriesApi, UTCTimestamp, LineSeries } from "lightweight-charts";
import { BaseIndicator, IndicatorConfig, IndicatorData } from "./base-indicator";

type TimeValue = { time: UTCTimestamp; value: number };

export class SMAIndicator extends BaseIndicator {
    private mainSeries: ISeriesApi<"Line"> | null = null;
    private smaCache: TimeValue[] = [];
    private hasFullData: boolean = false;

    constructor(chart: IChartApi, config: IndicatorConfig) {
        super(chart, config);
    }

    createSeries(): ISeriesApi<any>[] {
        console.log(`[SMA] 🎨 إنشاء سلسلة SMA`, {
            id: this.config.id,
            scale: this.config.priceScaleId,
            color: this.config.color,
            overlay: this.config.overlay
        });

        // 🔥 SMA يكون overlay على الشارت الرئيسي
        const scaleId = this.config.overlay ? 'right' : (this.config.priceScaleId || 'sma_scale');

        this.mainSeries = this.chart.addSeries(LineSeries, {
            color: this.config.color || '#ff6b35',
            lineWidth: 2,
            priceScaleId: scaleId,
            title: this.config.name || 'SMA',
            lastValueVisible: true,
            priceLineVisible: false,
            lineStyle: 0, // خط متصل
        });

        if (!this.config.overlay) {
            this.chart.priceScale(scaleId).applyOptions({
                autoScale: true,
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.2,
                },
                borderVisible: false,
            });
        }

        this.isSeriesCreated = true;

        // 🔥 حفظ السلسلة في this.series لدعم setVisible
        this.series = [this.mainSeries];

        // 🔥 تطبيق حالة الرؤية المحفوظة إذا كانت موجودة
        if (!this.getVisibility()) {
            this.mainSeries.applyOptions({ visible: false });
        }

        return [this.mainSeries];
    }

    updateData(data: IndicatorData): void {
        if (!this.mainSeries) {
            console.error(`[SMA] ❌ السلسلة غير مهيئة`);
            return;
        }

        console.log(`[SMA] 🔄 استقبال بيانات ${this.config.id}:`, {
            isHistorical: data.isHistorical,
            isInitialData: data.isInitialData,
            isLiveUpdate: data.isLiveUpdate,
            valuesLength: data.values?.length,
            cacheLength: this.smaCache.length,
            hasFullData: this.hasFullData
        });

        // معالجة البيانات التاريخية الكاملة
        if ((data.isHistorical || data.isInitialData) && !this.hasFullData) {
            console.log(`[SMA] 📊 معالجة بيانات تاريخية`);
            this.processHistoricalData(data);
            this.hasFullData = true;
            return;
        }

        // تحديث حي
        if (data.isLiveUpdate && this.hasFullData) {
            console.log(`[SMA] ⚡ تحديث حي`);
            this.processLiveUpdate(data);
            return;
        }

        // معالجة عامة
        if (data.values && data.values.length > 0) {
            this.processHistoricalData(data);
        }
    }

    private processHistoricalData(data: IndicatorData): void {
        const processedData = this.processInputData(data);

        if (!processedData || processedData.length === 0) {
            console.warn(`[SMA] ⚠️ لا توجد بيانات صالحة`);
            return;
        }

        console.log(`[SMA] 📊 البيانات المعالجة: ${processedData.length} نقطة`);

        if (this.smaCache.length === 0) {
            this.smaCache = processedData;
        } else {
            this.smaCache = this.mergeData(this.smaCache, processedData);
        }

        this.mainSeries!.setData(this.smaCache);
    }

    private processLiveUpdate(data: IndicatorData): void {
        if (!data.liveTime || !data.values || data.values.length === 0) return;

        const time = data.liveTime as UTCTimestamp;
        const value = data.values[0];

        if (value === null || isNaN(value)) return;

        this.updateSinglePoint(time, value);
    }

    private updateSinglePoint(time: UTCTimestamp, value: number): void {
        const existingIndex = this.smaCache.findIndex(p =>
            Math.abs((p.time as number) - (time as number)) <= 60
        );

        if (existingIndex >= 0) {
            this.smaCache[existingIndex].value = value;
            try {
                this.mainSeries!.update({ time, value });
                console.log(`[SMA] 🔄 تحديث نقطة: ${value} في ${time}`);
            } catch (error) {
                this.mainSeries!.setData(this.smaCache);
            }
        } else {
            this.smaCache.push({ time, value });
            this.smaCache.sort((a, b) => (a.time as number) - (b.time as number));

            if (this.smaCache.length > 1000) {
                this.smaCache = this.smaCache.slice(-1000);
            }

            this.mainSeries!.setData(this.smaCache);
            console.log(`[SMA] ➕ إضافة نقطة: ${value} في ${time}`);
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
        this.smaCache = [];
        this.isSeriesCreated = false;
        this.hasFullData = false;
        console.log(`[SMA] 🗑️ تم تدمير المؤشر`);
    }
}