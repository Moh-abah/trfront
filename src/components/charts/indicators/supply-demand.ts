// indicators/supply-demand.ts

import { ISeriesApi, IPriceLine } from "lightweight-charts";
import { BaseIndicator, IndicatorConfig, IndicatorDatashaps } from "./base-indicator";

export class SupplyDemandIndicator extends BaseIndicator {
    // لتخزين الخطوط المرسومة حالياً حتى نتمكن من تحديثها أو مسحها
    private activeZoneLines: IPriceLine[] = [];

    createSeries(): ISeriesApi<any>[] {
        // هذا المؤشر يرسم مباشرة على سلسلة الشموع الرئيسية (mainCandleSeries)
        // لذا لا يحتاج لإنشاء سلسلة خطية خاصة به
        this.isSeriesCreated = true;
        return [];
    }

    updateData(data: IndicatorDatashaps): void {
        const zones = data.metadata?.zones;

        if (!zones || !Array.isArray(zones) || !this.mainCandleSeries) {
            return;
        }

        // 1. مسح المناطق القديمة قبل رسم الجديدة (لتجنب تراكم الخطوط عند كل تحديث)
        this.clearOldZones();

        // 2. رسم المناطق الجديدة
        zones.forEach((zone: any) => {
            // تحديد اللون بناءً على نوع المنطقة (Supply = Red, Demand = Green)
            const isSupply = zone.type === 'SZ';
            const color = isSupply
                ? 'rgba(239, 83, 80, 0.8)'  // أحمر للمقاومة
                : 'rgba(38, 166, 154, 0.8)'; // أخضر للدعم

            const bgColor = isSupply
                ? 'rgba(239, 83, 80, 0.1)'
                : 'rgba(38, 166, 154, 0.1)';

            // رسم الخط العلوي للمنطقة
            const topLine = this.mainCandleSeries!.createPriceLine({
                price: zone.top,
                color: color,
                lineWidth: 2,
                lineStyle: 0, // Solid
                axisLabelVisible: true,
                title: `${zone.type} Top`,
            });

            // رسم الخط السفلي للمنطقة
            const bottomLine = this.mainCandleSeries!.createPriceLine({
                price: zone.bottom,
                color: color,
                lineWidth: 1,
                lineStyle: 2, // Dashed
                axisLabelVisible: true,
                title: `Bottom`,
            });

            // إضافة الخطوط للمصفوفة لتمكين مسحها لاحقاً
            this.activeZoneLines.push(topLine, bottomLine);
        });

        console.log(`[SupplyDemand] Drawing ${zones.length} active zones.`);
    }

    private clearOldZones(): void {
        if (this.mainCandleSeries && this.activeZoneLines.length > 0) {
            this.activeZoneLines.forEach(line => {
                this.mainCandleSeries!.removePriceLine(line);
            });
            this.activeZoneLines = [];
        }
    }
}