// indicators/hv-iv-indicator.ts

// @ts-nocheck

import { ISeriesApi, AreaSeries, UTCTimestamp } from "lightweight-charts";
import { BaseIndicator, IndicatorData, IndicatorDatashaps } from "./base-indicator";

export class HVIVIndicator extends BaseIndicator {
    private zoneSeries: Map<string, ISeriesApi<"Area">> = new Map();

    // تعريف الألوان حسب الحالة القادمة من الباك آند
    private statusColors: Record<string, string> = {
        "Very High": "rgba(255, 82, 82, 0.2)", // أحمر للتقلب الشديد
        "High": "rgba(255, 160, 0, 0.15)",    // برتقالي
        "Fair": "rgba(33, 150, 243, 0.1)",    // أزرق (منطقة التعادل)
        "Low": "rgba(76, 175, 80, 0.15)",     // أخضر
        "Very Low": "rgba(0, 200, 83, 0.2)"   // أخضر غامق (رخيص جداً)
    };

    createSeries(): ISeriesApi<any>[] {
        // لا ننشئ السلاسل هنا بل ننشئها ديناميكياً بناءً على المناطق المرسلة
        this.isSeriesCreated = true;
        return [];
    }

    updateData(data: IndicatorDatashaps): void {
        const results = data.indicators_results?.hv_iv_analysis;
        if (!results || !results.areas) return;

        // رسم المناطق (Areas) كخلفية ملونة
        Object.entries(results.areas).forEach(([status, zone]: [string, any]) => {
            let series = this.zoneSeries.get(status);

            // إذا لم تكن السلسلة موجودة، ننشئها
            if (!series) {
                series = this.chart.addSeries(AreaSeries, {
                    topColor: this.statusColors[status] || "rgba(255,255,255,0.05)",
                    bottomColor: "transparent",
                    lineWidth: 0, // لا نريد خطوط، فقط تظليل
                    priceScaleId: 'right', // يرسم على نفس مقياس السعر لتغطية الخلفية
                    lastValueVisible: false,
                    priceLineVisible: false,
                });
                this.zoneSeries.set(status, series);
            }

            // تحويل بيانات المنطقة إلى نقاط رسم
            // المنطقة تأتي من السيرفر كـ {upper, lower, timestamps}
            const areaPoints = zone.timestamps.map((t: any, i: number) => ({
                time: this.formatTime(t),
                value: zone.upper[i], // نستخدم الحد العلوي للمنطقة كقيمة للـ Area
            }));

            series.setData(areaPoints);
        });

        // تحديث "العلامة المائية" (Watermark) لإظهار الحالة الحالية نصياً
        (this.chart as any).applyOptions({
            watermark: {
                visible: true,
                fontSize: 24,
                horzAlign: 'right',
                vertAlign: 'bottom',
                color: 'rgba(255, 255, 255, 0.3)',
                text: `Market Status: ${results.status}`,
            }
        });

    }
}