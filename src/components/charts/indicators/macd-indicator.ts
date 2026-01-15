// @ts-nocheck


import { IChartApi, ISeriesApi, UTCTimestamp, LineSeries, HistogramSeries } from "lightweight-charts";
import { BaseIndicator, IndicatorConfig, IndicatorData, IndicatorDataMACD } from "./base-indicator";

type TimeValue = { time: UTCTimestamp; value: number };
type HistPoint = { time: UTCTimestamp; value: number; color?: string };

export class MACDIndicator extends BaseIndicator {
    private macdSeries: ISeriesApi<"Line"> | null = null;
    private signalSeries: ISeriesApi<"Line"> | null = null;
    private histogramSeries: ISeriesApi<"Histogram"> | null = null;

    // الذاكرة المؤقتة للبيانات (Cache)
    private macdCache: TimeValue[] = [];
    private signalCache: TimeValue[] = [];
    private histCache: HistPoint[] = [];

    constructor(chart: IChartApi, config: IndicatorConfig, mainCandleSeries?: ISeriesApi<"Candlestick">) {
        super(chart, config, mainCandleSeries);
    }

    createSeries(): ISeriesApi<any>[] {
        const scaleId = 'macd_scale';

        // 1. خط MACD الرئيسي
        this.macdSeries = this.chart.addSeries(LineSeries, {
            color: '#2962FF', // أزرق
            lineWidth: 2,
            title: this.config.name + ' MACD',
            priceLineVisible: false,
            lastValueVisible: true,
            priceScaleId: scaleId,
        });

        // 2. خط الإشارة
        this.signalSeries = this.chart.addSeries(LineSeries, {
            color: '#FF6B6B', // أحمر/برتقالي
            lineWidth: 2,
            title: this.config.name + ' Signal',
            priceLineVisible: false,
            lastValueVisible: true,
            priceScaleId: scaleId,
        });

        // 3. الهيستوجرام
        this.histogramSeries = this.chart.addSeries(HistogramSeries, {
            priceFormat: { type: 'price', precision: 4, minMove: 0.0001 },
            priceScaleId: scaleId,
            priceLineVisible: false,
            lastValueVisible: false,
        });

        // ضبط المقياس ليكون مرئياً وله حدود
        this.chart.priceScale(scaleId).applyOptions({
            autoScale: true,
            scaleMargins: {
                top: 0.75,
                bottom: 0.02,
            },
            borderVisible: true,
        });

        const result = [this.macdSeries, this.signalSeries, this.histogramSeries];

        // 🔥 هذا هو السطر المفقود: حفظ السلاسل في متغير الأب
        this.series = result;

        this.isSeriesCreated = true;
        return [this.macdSeries, this.signalSeries, this.histogramSeries];
    }

    updateData(data: IndicatorDataMACD): void {
        if (!this.macdSeries || !this.signalSeries || !this.histogramSeries) {
            console.error('[MACD] ❌ السلاسل غير مهيئة');
            return;
        }

        // 🔥 الحالة 1: بيانات كاملة من indicators_results (المصدر الرئيسي)
        if (data.indicators_results?.macd) {
            const macdData = data.indicators_results.macd;
            const times = macdData.signals?.index || macdData.metadata?.index || data.signals?.index || [];

            // إذا كانت البيانات موجودة داخل metadata داخل indicators_results
            if (macdData.metadata) {
                console.log('[MACD] 📦 معالجة بيانات كاملة من metadata (offset mode)');
                this.processCompleteData(
                    macdData.metadata, // يحتوي على macd_line, signal_line, histogram
                    times              // مصفوفة التواريخ
                );
                return;
            }
        }

        // 🔥 الحالة 2: metadata مباشر (في حالة عدم وجود indicators_results)
        if (data.metadata && (data.metadata.macd_line || data.metadata.values)) {
            const times = data.signals?.index || data.metadata?.index || [];
            console.log('[MACD] 📊 معالجة metadata مباشر (offset mode)');
            this.processCompleteData(data.metadata, times);
            return;
        }

        // 🔥 الحالة 3: تحديث حي (Live Update)
        if (data.liveTime && data.values && data.values.length > 0) {
            console.log('[MACD] ⚡ تحديث حي');
            this.processLiveUpdate(data);
            return;
        }

        // 🔥 الحالة 4: بيانات عادية (Backup)
        if (data.values && data.values.length > 0) {
            console.log('[MACD] 📈 معالجة بيانات عادية');
            // هذا مسار نادر، لأن MACD عادة يأتي كمصفوفات منفصلة
            // يمكن معالجته لو أردت، ولكن التركيز على Offset
        }
    }

    // =================================================================
    // 🔥 منطق الإزاحة (Offset Logic) - مطابق لـ RSI
    // =================================================================

    private processCompleteData(metadata: any, times: string[]): void {
        if (!times || times.length === 0) {
            console.warn('[MACD] ⚠️ لا توجد تواريخ للمعالجة');
            return;
        }

        console.log('[MACD] 🔧 معالجة البيانات الكاملة مع Offset:', {
            timesLength: times.length,
            macdLength: metadata.macd_line?.length,
            signalLength: metadata.signal_line?.length,
            histLength: metadata.histogram?.length
        });

        // 1. معالجة خط MACD
        const macdPoints = this.processMACDArrayWithOffset(
            metadata.macd_line || [],
            times,
            'MACD Line'
        );

        // 2. معالجة خط الإشارة
        const signalPoints = this.processMACDArrayWithOffset(
            metadata.signal_line || [],
            times,
            'Signal Line'
        );

        // 3. معالجة الهيستوجرام
        const histPoints = this.processHistogramWithOffset(
            metadata.histogram || [],
            times,
            'Histogram'
        );

        // 4. دمج البيانات مع الكاش الحالي
        this.macdCache = this.mergeData(this.macdCache, macdPoints);
        this.signalCache = this.mergeData(this.signalCache, signalPoints);
        this.histCache = this.mergeHist(this.histCache, histPoints);

        // 5. رسم البيانات النهائية
        this.applyDataToSeries(this.macdCache, this.signalCache, this.histCache);
    }





    private processMACDArrayWithOffset(
        values: number[],
        times: string[],
        debugName: string = ''
    ): TimeValue[] {
        if (!values || values.length === 0) return [];

        const result: TimeValue[] = [];

        // حساب الإزاحة (تطابق RSI)
        const offset = Math.max(0, times.length - values.length);

        for (let i = 0; i < values.length; i++) {
            const value = values[i];
            if (value === null || isNaN(value)) continue;

            const timeIndex = i + offset;
            if (timeIndex >= times.length) break;

            const timeStr = times[timeIndex];

            // 🔥 إصلاح التأخير الزمني: إجبار القراءة كـ UTC
            // إضافة 'Z' يمنع المتصفح من اعتبار التاريخ Local Time
            const dateStr = timeStr.endsWith('Z') ? timeStr : timeStr + 'Z';
            const timeMs = new Date(dateStr).getTime();
            const time = Math.floor(timeMs / 1000) as UTCTimestamp;

            if (time === 0) continue;

            result.push({ time, value });
        }

        result.sort((a, b) => (a.time as number) - (b.time as number));
        return result;
    }


    // معالجة الهيستوجرام مع التلوين
    private processHistogramWithOffset(
        values: number[],
        times: string[],
        debugName: string = ''
    ): HistPoint[] {
        const points = this.processMACDArrayWithOffset(values, times, debugName);

        return points.map((point, index) => {
            const val = point.value;
            const prevVal = index > 0 ? points[index - 1].value : 0;

            // منطق الألوان (كلاسيك)
            const color = val >= 0
                ? (val >= prevVal ? '#26a69a' : '#b2dfdb') // أخضر غامق -> فاتح
                : (val <= prevVal ? '#ef5350' : '#ffcdd2'); // أحمر غامق -> فاتح

            return { ...point, color };
        });
    }

    // =================================================================
    // 🔥 معالجة التحديثات الحية (Live Updates)
    // =================================================================

    private processLiveUpdate(data: IndicatorData): void {
        const time = data.liveTime as UTCTimestamp;
        const vals = data.values;

        if (!time || !vals || vals.length === 0) return;

        // إذا جاءت بيانات كاملة في التحديث الحي (نادر جداً، لكن احتياطياً)
        if (data.metadata && data.metadata.macd_line) {
            const times = data.signals?.index || data.metadata?.index || [];
            // نفترض أن times تحتوي على الوقت الحالي فقط أو مصفوفة كاملة
            if (times.length > 0) {
                this.processCompleteData(data.metadata, times);
                return;
            }
        }

        // التحديث النقطي (قيم MACD, Signal, Hist)
        if (vals.length >= 3) {
            const [macdV, signalV, histV] = vals;
            this.updateSinglePoint('MACD', time, macdV);
            this.updateSinglePoint('Signal', time, signalV);
            this.updateHistogramPoint(time, histV);
        }
        // أحياناً السيرفر يرسل مصفوفة قيم واحدة لخط واحد
        else if (vals.length === 1) {
            // افترض أنه MACD إذا لم يحدد
            this.updateSinglePoint('MACD', time, vals[0]);
        }
    }

    private updateSinglePoint(type: 'MACD' | 'Signal', time: UTCTimestamp, value: number): void {
        if (value === null || isNaN(value)) return;

        const cache = type === 'MACD' ? this.macdCache : this.signalCache;
        const series = type === 'MACD' ? this.macdSeries : this.signalSeries;

        if (!series) return;

        const existingIndex = cache.findIndex(p => (p.time as number) === (time as number));

        if (existingIndex >= 0) {
            // تحديث قيمة موجودة
            cache[existingIndex].value = value;
            series.update({ time, value });
        } else {
            // إضافة قيمة جديدة
            cache.push({ time, value });
            // يجب الترتيب قبل الرسم إذا أضفنا نقطة في الماضي، لكن هنا Live => دائماً في النهاية
            // للسلامة، نرتب:
            cache.sort((a, b) => (a.time as number) - (b.time as number));
            series.setData(this.sanitize(cache)); // إعادة رسم كل البيانات لضمان الترتيب (استهلاك بسيط)
        }
    }

    private updateHistogramPoint(time: UTCTimestamp, value: number): void {
        if (value === null || isNaN(value) || !this.histogramSeries) return;

        const existingIndex = this.histCache.findIndex(p => (p.time as number) === (time as number));

        const prevVal = existingIndex >= 0
            ? (existingIndex > 0 ? this.histCache[existingIndex - 1].value : 0)
            : (this.histCache.length > 0 ? this.histCache[this.histCache.length - 1].value : 0);

        const color = value >= 0
            ? (value >= prevVal ? '#26a69a' : '#b2dfdb')
            : (value <= prevVal ? '#ef5350' : '#ffcdd2');

        const newPoint = { time, value, color };

        if (existingIndex >= 0) {
            this.histCache[existingIndex] = newPoint;
        } else {
            this.histCache.push(newPoint);
            this.histCache.sort((a, b) => (a.time as number) - (b.time as number));
        }

        this.histogramSeries.setData(this.sanitize(this.histCache));
    }

    // =================================================================
    // دوال مساعدة
    // =================================================================

    protected mergeData(existing: TimeValue[], incoming: TimeValue[]): TimeValue[] {
        const map = new Map<number, number>();
        existing.forEach(p => map.set(p.time as number, p.value));
        incoming.forEach(p => map.set(p.time as number, p.value));
        return Array.from(map.entries())
            .map(([time, value]) => ({ time: time as UTCTimestamp, value }))
            .sort((a, b) => (a.time as number) - (b.time as number));
    }

    private mergeHist(existing: HistPoint[], incoming: HistPoint[]): HistPoint[] {
        const map = new Map<number, HistPoint>();
        existing.forEach(p => map.set(p.time as number, p));
        incoming.forEach(p => map.set(p.time as number, p));
        return Array.from(map.values()).sort((a, b) => (a.time as number) - (b.time as number));
    }

    private sanitize<T extends { time: number }>(arr: T[]): T[] {
        // إزالة التكرارات والترتيب
        const cleaned = arr
            .filter(p => p && p.time !== undefined && !isNaN(p.time as number))
            .sort((a, b) => a.time - b.time);

        const dedup: T[] = [];
        for (let i = 0; i < cleaned.length; i++) {
            if (i === 0 || cleaned[i].time > dedup[dedup.length - 1].time) {
                dedup.push(cleaned[i]);
            }
        }
        return dedup;
    }

    private applyDataToSeries(macdData: TimeValue[], signalData: TimeValue[], histData: HistPoint[]): void {
        try {
            if (this.macdSeries) this.macdSeries.setData(this.sanitize(macdData));
            if (this.signalSeries) this.signalSeries.setData(this.sanitize(signalData));
            if (this.histogramSeries) this.histogramSeries.setData(this.sanitize(histData));

            console.log('[MACD] ✅ تم الرسم النهائي:', {
                macd: macdData.length,
                signal: signalData.length,
                hist: histData.length
            });
        } catch (error) {
            console.error('[MACD] ❌ خطأ في الرسم:', error);
        }
    }

    destroy(): void {
        if (this.macdSeries) this.chart.removeSeries(this.macdSeries);
        if (this.signalSeries) this.chart.removeSeries(this.signalSeries);
        if (this.histogramSeries) this.chart.removeSeries(this.histogramSeries);

        this.macdSeries = null;
        this.signalSeries = null;
        this.histogramSeries = null;

        this.macdCache = [];
        this.signalCache = [];
        this.histCache = [];

        this.isSeriesCreated = false;
        console.log('[MACD] 🗑️ تم تدمير المؤشر');
    }
}

