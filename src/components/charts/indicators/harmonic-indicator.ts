// indicators/harmonic-indicator.ts

import { ISeriesApi, LineSeries, UTCTimestamp } from "lightweight-charts";
import { BaseIndicator, IndicatorConfig, IndicatorDatashaps } from "./base-indicator";

export class HarmonicIndicator extends BaseIndicator {
    private zigzagSeries: ISeriesApi<"Line"> | null = null;

    createSeries(): ISeriesApi<any>[] {
        // ننشئ سلسلة خطوط لرسم أضلاع النموذج
        this.zigzagSeries = this.chart.addSeries(LineSeries, {
            color: this.config.color || '#f39c12',
            lineWidth: 2,
            lineStyle: 0, // خط متصل
            title: 'Harmonic Pattern',
            lastValueVisible: false,
            priceLineVisible: false,
        });

        this.isSeriesCreated = true;
        return [this.zigzagSeries];
    }

    updateData(data: IndicatorDatashaps): void {
        const pivots = data.metadata?.pivots; // مصفوفة النقاط القادمة من الباك آند
        const patternName = data.metadata?.pattern_name;

        if (!pivots || pivots.length === 0 || !this.zigzagSeries) return;

        // 1. تحويل النقاط إلى تنسيق Lightweight Charts
        const lineData = pivots.map((p: any) => ({
            time: this.formatTime(p.time),
            value: p.price
        }));

        // 2. رسم الخطوط (ZigZag)
        this.zigzagSeries.setData(lineData);

        // 3. إضافة تسميات النقاط (X, A, B, C, D) كـ Markers على الشموع
        if (this.mainCandleSeries) {
            const labels = ["X", "A", "B", "C", "D"];
            const markers = pivots.map((p: any, index: number) => ({
                time: this.formatTime(p.time),
                position: index % 2 === 0 ? 'belowBar' : 'aboveBar', // تبديل الموقع لتجنب التداخل
                color: '#ffffff',
                shape: 'circle',
                text: labels[index] || `P${index}`,
            }));

            // تحديث الماركرز باستخدام الدالة التي أضفناها في الـ Base
            this.updateMarkers(markers);
        }

        console.log(`[Harmonic] Pattern detected: ${patternName} with ${pivots.length} pivots`);
    }
}