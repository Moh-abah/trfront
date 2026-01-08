
// @ts-nocheck

import { BaseIndicator, IndicatorConfig, IndicatorData } from "./base-indicator";
import { IChartApi, ISeriesApi, SeriesMarker, UTCTimestamp } from "lightweight-charts";

export class VolumeClimaxIndicator extends BaseIndicator {
    // 🔥 مقياس خاص للـ markers (لحل مشكلة Assertion failed)
    private readonly PRICE_SCALE_ID = 'climax_markers';
    private mainSeries: ISeriesApi<"Line"> | null = null;
    private markers: SeriesMarker<UTCTimestamp>[] = [];
    private cachedClimaxPoints: Map<number, any> = new Map();

    constructor(chart: IChartApi, config: IndicatorConfig) {
        super(chart, config);
    }

    createSeries(): ISeriesApi<any>[] {
        console.log(`[VolumeClimax] 🎯 Creating series with priceScaleId: '${this.PRICE_SCALE_ID}' (FINAL FIX)`);

   
        // 🔥 إنشاء Line series على مقياس خاص جديد
        this.mainSeries = this.chart.addSeries({
            color: 'transparent', // غير مرئي
            lineWidth: 0,
            priceLineVisible: false,
            lastValueVisible: false,
            priceScaleId: this.PRICE_SCALE_ID, // 🔥 استخدام مقياس خاص جديد
        });

        this.isSeriesCreated = true;

        // حفظ السلسلة
        this.series = [this.mainSeries];

        return [this.mainSeries];
    }

    updateData(data: IndicatorData): void {
        console.log(`[VolumeClimax] 📊 Updating data:`, {
            hasClimaxPoints: !!data.metadata?.climax_points,
            climaxPointsLength: data.metadata?.climax_points?.length || 0,
            valuesLength: data.values?.length || 0,
            hasLiveTime: !!data.liveTime,
            liveTime: data.liveTime
        });

        // الحالة 1: البيانات التاريخية الكاملة (من metadata.climax_points)
        const climaxPoints = data.metadata?.climax_points || [];

        if (climaxPoints.length > 0) {
            this.plotHistoricalClimaxPoints(climaxPoints);
            return;
        }

        // الحالة 2: تحديث حي
        if (data.liveTime && data.values) {
            this.handleLiveUpdate(data.liveTime as UTCTimestamp, data.values);
            return;
        }
    }

    private plotHistoricalClimaxPoints(climaxPoints: any[]): void {
        if (!this.mainSeries) return;

        try {
            console.log(`[VolumeClimax] 📦 Plotting ${climaxPoints.length} historical climax points`);

            const newMarkers: SeriesMarker<UTCTimestamp>[] = [];
            const lineData: any[] = [];

            climaxPoints.forEach(point => {
                const time = this.formatTime(point.time);

                if ((time as number) === 0) return;

                // حفظ في الذاكرة
                const cacheKey = time as number;
                if (!this.cachedClimaxPoints.has(cacheKey)) {
                    this.cachedClimaxPoints.set(cacheKey, point);
                }

                // 🔥 إضافة Marker
                newMarkers.push({
                    time,
                    position: 'aboveBar',
                    color: 'rgba(255, 0, 0, 0.9)', // أحمر فاقع
                    shape: 'square',
                    text: '',
                    size: 25, // حجم كبير جداً ليكون واضحاً
                } as SeriesMarker<UTCTimestamp>);

                // 🔥 رسم خط مرتفع (للتأكد أن الماركرات تظهر فوق الشموع)
                lineData.push({
                    time,
                    value: point.high + 100 // قيمة مرتفعة جداً فوق الشموع
                });
            });

            // دمج الماركرز
            this.markers = [...this.markers, ...newMarkers];

            // 🔥 رسم البيانات
            this.mainSeries.setData(lineData);
            (this.mainSeries as any).setMarkers(this.markers);

            console.log(`[VolumeClimax] ✅ Successfully plotted ${newMarkers.length} climax markers`);

        } catch (error) {
            console.error(`[VolumeClimax] ❌ Error plotting historical points:`, error);
        }
    }

    private handleLiveUpdate(liveTime: UTCTimestamp, values: number[]): void {
        if (!this.mainSeries) return;

        const value = values[0];

        if (value === 1) {
            const newMarker: SeriesMarker<UTCTimestamp> = {
                time: liveTime,
                position: 'aboveBar',
                color: 'rgba(255, 0, 0, 1)', // أحمر خالص
                shape: 'square',
                text: '',
                size: 25,
            };

            this.markers.push(newMarker);
            (this.mainSeries as any).setMarkers(this.markers);

            console.log(`[VolumeClimax] ✅ Added live climax marker at ${liveTime}`);
        }
    }

    // 🔥 دالة setVisible
    public setVisible(isVisible: boolean): void {
        console.log(`[VolumeClimax] 👁️ Setting visibility: ${isVisible}`);

        if (!this.mainSeries) return;

        try {
            this.mainSeries.applyOptions({ visible: isVisible });

            if (!isVisible) {
                (this.mainSeries as any).setMarkers([]);
            } else if (this.markers.length > 0) {
                (this.mainSeries as any).setMarkers(this.markers);
            }
        } catch (error) {
            console.error(`[VolumeClimax] ❌ Failed to set visibility:`, error);
        }

        super.setVisible(isVisible);
    }

    destroy(): void {
        console.log(`[VolumeClimax] 🗑️ Destroying`);

        if (this.mainSeries) {
            (this.mainSeries as any).setMarkers([]);
            this.chart.removeSeries(this.mainSeries);
        }

        this.mainSeries = null;
        this.markers = [];
        this.cachedClimaxPoints.clear();

        super.destroy();
    }
}
