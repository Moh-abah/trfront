
// @ts-nocheck

import { IChartApi, ISeriesApi, UTCTimestamp, LineSeries } from "lightweight-charts";
import { BaseIndicator, IndicatorConfig, IndicatorData } from "./base-indicator";

export class RSIIndicator extends BaseIndicator {
    private mainSeries: ISeriesApi<"Line"> | null = null;
    private levelsCreated = false; // flag لمنع تكرار إنشاء الخطوط مع كل تحديث حي

    constructor(chart: IChartApi, config: IndicatorConfig) {
        super(chart, config);
    }

    createSeries(): ISeriesApi<any>[] {
        // ننشئ السلسلة الأساسية فقط هنا بدون خطوط ثابتة
        this.mainSeries = this.chart.addSeries(LineSeries, {
            color: this.config.color || '#7E57C2',
            lineWidth: 2,
            title: this.config.name,
            lastValueVisible: true,
            priceLineVisible: false,
            priceScaleId: 'rsi_scale', // تأكد أن هذا المعرف مطابق لما في الـ Manager
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

    // دالة داخلية لإنشاء المستويات بناءً على metadata القادمة من الاستجابة
    private applyDynamicLevels(metadata: any): void {
        if (!this.mainSeries || this.levelsCreated) return;

        // 1. جلب القيم من الـ metadata القادمة من الاستجابة
        const obLevel = metadata?.overbought; // في مثالك: 79
        const osLevel = metadata?.oversold;   // في مثالك: 50


        if (obLevel ) {
            this.mainSeries.createPriceLine({
                price: obLevel,
                color: 'rgba(255, 82, 82, 0.4)',
                lineWidth: 1,
                lineStyle: 2,
                axisLabelVisible: true,
                title: `OB ${obLevel}`,
            });
        }

  
        if (osLevel) {
            this.mainSeries.createPriceLine({
                price: osLevel,
                color: 'rgba(34, 197, 94, 0.4)',
                lineWidth: 1,
                lineStyle: 2,
                axisLabelVisible: true,
                title: `OS ${osLevel}`,
            });
        }

     


        // خط المنتصف (غالباً ما يكون ثابتاً عند 50)
        this.mainSeries.createPriceLine({
            price: 50,
            color: 'rgba(255, 255, 255, 0.1)',
            lineWidth: 1,
            lineStyle: 1, // Dotted
            axisLabelVisible: false,
        });

        this.levelsCreated = true;
    }

 
    updateData(data: IndicatorData): void {
        if (!this.mainSeries) {
            console.error(`[RSI] ❌ Series not created yet`);
            return;
        }

        // 1. تحقق من وجود metadata لتهيئة الخطوط الديناميكية
        if (data.metadata && !this.levelsCreated) {
            this.applyDynamicLevels(data.metadata);
        }

        // 2. معالجة التحديث الحي (Live Update)
        if (data.liveTime && data.values.length === 1) {
            const value = Array.isArray(data.values) ? data.values[0] : data.values;

            if (typeof value === 'number' && !isNaN(value)) {
                // تحديث البيانات الموجودة
                const currentData = this.mainSeries.data();
                const mergedData = this.mergePartialData(
                    currentData,
                    value,
                    data.liveTime as UTCTimestamp
                );

                // استبدال البيانات القديمة بالمدمجة
                this.mainSeries.setData(mergedData);
            }
            return;
        }

        // 3. معالجة البيانات الكاملة (Full Update)
        const processedData = this.processInputData(data);

        if (processedData.length === 0) {
            return;
        }

        // الحصول على البيانات الحالية
        const currentData = this.mainSeries.data();

        // 🔥 الدمج: الاحتفاظ بالبيانات القديمة وإضافة الجديدة
        let mergedData: { time: UTCTimestamp; value: number }[];

        if (currentData.length > 0) {
            // دمج البيانات القديمة مع الجديدة
            mergedData = this.mergeData(currentData, processedData);
        } else {
            // أول مرة، استخدم البيانات الجديدة كما هي
            mergedData = processedData;
        }

        // تطبيق البيانات المدمجة
        this.mainSeries.setData(mergedData);

    }
}