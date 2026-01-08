
// @ts-nocheck

import { IChartApi, ISeriesApi, UTCTimestamp, LineSeries } from "lightweight-charts";
import { BaseIndicator, IndicatorConfig, IndicatorData, IndicatorDataATR } from "./base-indicator";

type TimeValue = { time: UTCTimestamp; value: number };

export class ATRIndicator extends BaseIndicator {
    private mainSeries: ISeriesApi<"Line"> | null = null;
    private atrCache: TimeValue[] = [];

    // أعلام للتحكم
    private isInitialized: boolean = false;
    private hasFullData: boolean = false;

    constructor(chart: IChartApi, config: IndicatorConfig) {
        super(chart, config);
    }

    createSeries(): ISeriesApi<any>[] {
        console.log(`[ATR] 🎨 إنشاء سلسلة ATR`, {
            id: this.config.id,
            scale: this.config.priceScaleId,
            color: this.config.color
        });

        const scaleId = this.config.priceScaleId || 'atr_scale';

        this.mainSeries = this.chart.addSeries(LineSeries, {
            color: this.config.color || '#22c55e',
            lineWidth: 2,
            priceScaleId: scaleId,
            title: this.config.name || 'ATR',
            lastValueVisible: true,
            priceLineVisible: false,
            lineStyle: 1,
        });

        this.chart.priceScale(scaleId).applyOptions({
            autoScale: true,
            scaleMargins: {
                top: 0.85,
                bottom: 0.05,
            },
            borderVisible: true,
            borderColor: '#22c55e',
        });

        this.isSeriesCreated = true;

        // 🔥 حفظ السلسلة في this.series لدعم setVisible
        this.series = [this.mainSeries];

        // 🔥 تطبيق حالة الرؤية المحفوظة إذا كانت موجودة
        if (!this.getVisibility()) {
            this.mainSeries.applyOptions({ visible: false });
        }

        return [this.mainSeries];
    }

    updateData(data: IndicatorDataATR): void {
        if (!this.mainSeries) {
            console.error(`[ATR] ❌ السلسلة غير مهيئة`);
            return;
        }

        // 1) دمج البيانات من indicators_results إذا وُجدت
        if (data.indicators_results && data.indicators_results.atr) {
            const atrRes = data.indicators_results.atr;

            if ((!data.values || data.values.length === 0) && Array.isArray(atrRes.values) && atrRes.values.length > 0) {
                console.log('[ATR] 📦 أخذ values من indicators_results.atr.values');
                data.values = atrRes.values;
            }

            if ((!((data as any).timestamps) || (data as any).timestamps.length === 0) && (Array.isArray(atrRes.timestamps) && atrRes.timestamps.length > 0)) {
                (data as any).timestamps = atrRes.timestamps;
                console.log('[ATR] 📦 أخذ timestamps من indicators_results.atr.timestamps');
            }

            if ((!data.metadata || Object.keys(data.metadata).length === 0) && atrRes.metadata) {
                data.metadata = atrRes.metadata;
            }
        }

        console.log(`[ATR] 🔍 بيانات الواردة (${this.config.id}):`, {
            valuesLength: data.values?.length || 0,
            valuesSampleType: Array.isArray(data.values) ? (data.values[0] === null ? 'null' : typeof data.values[0]) : 'unknown',
            hasMetadata: !!data.metadata,
            metadataKeys: data.metadata ? Object.keys(data.metadata) : [],
            signalsLength: data.signals?.index?.length || 0,
            liveTime: data.liveTime,
            hasTimestamps: (data as any).timestamps ? (data as any).timestamps.length : 0
        });

        const hasValuesArray = Array.isArray(data.values) && data.values.length > 0;
        const timestamps: any[] = (data as any).timestamps || data.signals?.index || [];

        // حالة: metadata يحتوي على atr أو atr_values
        if (data.metadata && (data.metadata.atr || data.metadata.atr_values)) {
            console.log('[ATR] 📊 معالجة metadata كاملة');
            const timesFromMeta = data.metadata.timestamps || data.metadata.times || [];
            this.processCompleteATRData(data.metadata, timesFromMeta);
            return;
        }

        // حالة: بيانات تاريخية من values + timestamps
        if (hasValuesArray && Array.isArray(timestamps) && timestamps.length > 0 && data.values.length <= timestamps.length) {
            console.log('[ATR] 📈 معالجة تاريخية من values + timestamps');
            const vals = data.values as number[];
            const times = timestamps.map((t: any) => String(t));
            const points = this.processATRArrayWithOffset(vals, times, 'ATR');
            if (points.length === 0) {
                console.warn('[ATR] ⚠️ لم يتم إنشاء نقاط من values+timestamps');
            } else {
                if (!this.hasFullData) {
                    this.atrCache = points;
                    this.hasFullData = true;
                } else {
                    this.atrCache = this.mergeData(this.atrCache, points);
                }
                this.mainSeries!.setData(this.atrCache);
                console.log(`[ATR] ✅ رسم ${points.length} نقطة (من values+timestamps)`);
            }
            return;
        }

        // حالة: تحديث حي
        if (data.liveTime && hasValuesArray && data.values.length === 1) {
            console.log('[ATR] ⚡ تحديث حي');
            this.processLiveUpdate(data);
            return;
        }

        // حالة: بيانات تاريخية عامة
        if (hasValuesArray) {
            console.log('[ATR] 📈 معالجة بيانات تاريخية (fallback to processHistoricalData)');
            this.processHistoricalData(data);
            return;
        }

        console.warn('[ATR] ⚠️ لا توجد بيانات معالجة مناسبة في هذا التحديث');
    }

    private processCompleteATRData(metadata: any, times: string[] = []): void {
        console.log('[ATR] 🔧 processCompleteATRData:', {
            metaKeys: metadata ? Object.keys(metadata) : [],
            timesLength: times?.length || 0
        });

        const atrArray: number[] = metadata.atr || metadata.atr_values || metadata.values || [];

        if ((!times || times.length === 0) && metadata.timestamps && Array.isArray(metadata.timestamps)) {
            times = metadata.timestamps.map((t: any) => String(t));
            console.log('[ATR] 📦 أخذ times من metadata.timestamps');
        }

        if ((!times || times.length === 0) && atrArray.length > 0) {
            console.warn('[ATR] ⚠️ لا توجد times متاحة في metadata، سنحاول المرور عبر processInputData كحل احتياطي');
            const fallbackData: IndicatorData = {
                values: atrArray,
                metadata,
            } as any;
            this.processHistoricalData(fallbackData);
            return;
        }

        const atrPoints = this.processATRArrayWithOffset(atrArray, times, 'ATR');

        if (atrPoints.length === 0) {
            console.warn('[ATR] ⚠️ لا توجد نقاط صالحة للعرض من metadata');
            return;
        }

        if (!this.hasFullData) {
            this.atrCache = atrPoints;
            this.hasFullData = true;
        } else {
            this.atrCache = this.mergeData(this.atrCache, atrPoints);
        }

        this.mainSeries!.setData(this.atrCache);
        console.log(`[ATR] ✅ تم رسم ${atrPoints.length} نقطة من metadata`);
    }

    private processATRArrayWithOffset(
        values: number[],
        times: string[],
        debugName: string = ''
    ): TimeValue[] {
        if (!values || !times || times.length === 0) {
            console.warn(`[ATR] ⚠️ لا توجد ${debugName} أو times`);
            return [];
        }

        const result: TimeValue[] = [];

        const offset = Math.max(0, times.length - values.length);

        console.log(`[ATR] 🔄 ${debugName} offset:`, {
            values: values.length,
            times: times.length,
            offset: offset,
            firstValue: values[0],
            firstTime: times[offset] || 'N/A',
            lastValue: values[values.length - 1],
            lastTime: times[times.length - 1]
        });

        for (let i = 0; i < values.length; i++) {
            const value = values[i];
            const timeIndex = i + offset;

            if (timeIndex >= times.length) {
                console.warn(`[ATR] ⚠️ فهرس الوقت خارج النطاق لـ ${debugName}`);
                break;
            }

            if (value === null || value === undefined || isNaN(value)) {
                continue;
            }

            const time = this.formatTime(times[timeIndex]);
            if ((time as number) === 0) continue;

            result.push({ time, value });
        }

        result.sort((a, b) => (a.time as number) - (b.time as number));

        console.log(`[ATR] ✅ ${debugName} معالجة: ${result.length} نقطة`);
        return result;
    }

    private processLiveUpdate(data: IndicatorData): void {
        const time = data.liveTime as UTCTimestamp;
        const values = data.values;

        console.log('[ATR] ⚡ عملية التحديث الحي:', { time, values });

        if (!time || !values || values.length === 0) return;

        const value = values[0];

        if (value === null || isNaN(value)) {
            console.warn('[ATR] ⚠️ قيمة غير صالحة في التحديث الحي');
            return;
        }

        this.updateSinglePoint(time, value);
    }

    private updateSinglePoint(time: UTCTimestamp, value: number): void {
        const existingIndex = this.atrCache.findIndex(p => (p.time as number) === (time as number));

        if (existingIndex >= 0) {
            this.atrCache[existingIndex].value = value;
            try {
                this.mainSeries!.update({ time, value });
                console.log(`[ATR] 🔄 تحديث نقطة موجودة: ${value} في ${time}`);
            } catch (error) {
                this.mainSeries!.setData(this.atrCache);
                console.warn('[ATR] ⚠️ فشل التحديث، أعيد تعيين البيانات');
            }
        } else {
            this.atrCache.push({ time, value });
            this.atrCache.sort((a, b) => (a.time as number) - (b.time as number));

            if (this.atrCache.length > 500) {
                this.atrCache = this.atrCache.slice(-500);
            }

            this.mainSeries!.setData(this.atrCache);
            console.log(`[ATR] ➕ إضافة نقطة جديدة: ${value} في ${time}`);
        }
    }

    private processHistoricalData(data: IndicatorData): void {
        const timestamps: any[] = (data as any).timestamps || data.signals?.index || [];
        const values = data.values as number[] || [];

        if (Array.isArray(timestamps) && timestamps.length > 0 && Array.isArray(values) && values.length > 0) {
            console.log('[ATR] 🔁 بناء نقاط مباشرة من data.timestamps + data.values');
            const pts = this.processATRArrayWithOffset(values, timestamps.map(t => String(t)), 'ATR');
            if (pts.length > 0) {
                if (this.atrCache.length === 0) {
                    this.atrCache = pts;
                } else {
                    this.atrCache = this.mergeData(this.atrCache, pts);
                }
                this.mainSeries!.setData(this.atrCache);
                console.log(`[ATR] ✅ رسم ${pts.length} نقطة (من data.timestamps)`);
                return;
            }
        }

        const processedData = this.processInputData(data);

        if (!processedData || processedData.length === 0) {
            console.warn(`[ATR] ⚠️ لا توجد بيانات صالحة للعرض بعد المحاولة`);
            return;
        }

        console.log(`[ATR] 📊 البيانات المعالجة (fallback):`, {
            نقاط: processedData.length,
            أول_نقطة: processedData[0],
            آخر_نقطة: processedData[processedData.length - 1]
        });

        if (this.atrCache.length === 0) {
            this.atrCache = processedData;
        } else {
            this.atrCache = this.mergeData(this.atrCache, processedData);
        }

        this.mainSeries!.setData(this.atrCache);
    }

    protected mergeData(
        existing: TimeValue[],
        newData: TimeValue[]
    ): TimeValue[] {
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
        this.atrCache = [];
        this.isSeriesCreated = false;
        this.isInitialized = false;
        this.hasFullData = false;

        console.log(`[ATR] 🗑️ تم تدمير المؤشر`);
    }
}
