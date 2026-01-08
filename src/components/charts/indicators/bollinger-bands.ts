

// @ts-nocheck

// indicators/bollinger-bands.ts
import { IChartApi, LineSeries, AreaSeries, ISeriesApi } from "lightweight-charts";
import { BaseIndicator, IndicatorConfig, IndicatorData } from "./base-indicator";
import { UTCTimestamp } from "lightweight-charts";

export class BollingerBandsIndicator extends BaseIndicator {
    private bandSeries: ISeriesApi<"Area"> | null = null;
    private upperSeries: ISeriesApi<"Line"> | null = null;
    private lowerSeries: ISeriesApi<"Line"> | null = null;
    private middleSeries: ISeriesApi<"Line"> | null = null;

    // 🔥 نفس المتغيرات القديمة
    private fullMetadata: any = {};

    createSeries(): ISeriesApi<any>[] {
        const { name, color = "#2962FF" } = this.config;

        console.log(`🎨 [BB] Creating Bollinger Bands: ${name}`);

        // ✅ إنشاء سلسلة المنطقة للنطاق (نفس القديم)
        this.bandSeries = this.chart.addSeries(AreaSeries, {
            topColor: `${color}20`,
            bottomColor: `${color}05`,
            lineColor: `${color}40`,
            lineWidth: 1,
            title: `${name} Band`,
            priceScaleId: 'right',
            priceLineVisible: false,
            lastValueVisible: false,
        });

        // ✅ إنشاء سلسلة للنطاق العلوي
        this.upperSeries = this.chart.addSeries(LineSeries, {
            color: `${color}80`,
            lineWidth: 1,
            lineStyle: 2,
            title: `${name} Upper`,
            priceScaleId: 'right',
            priceLineVisible: false,
            lastValueVisible: false,
        });

        // ✅ إنشاء سلسلة للنطاق السفلي
        this.lowerSeries = this.chart.addSeries(LineSeries, {
            color: `${color}80`,
            lineWidth: 1,
            lineStyle: 2,
            title: `${name} Lower`,
            priceScaleId: 'right',
            priceLineVisible: false,
            lastValueVisible: false,
        });

        // ✅ إنشاء سلسلة للخط الأوسط (SMA)
        this.middleSeries = this.chart.addSeries(LineSeries, {
            color: color,
            lineWidth: 2,
            title: name,
            priceScaleId: 'right',
            priceLineVisible: false,
            lastValueVisible: true,
        });

        this.series = [this.bandSeries, this.upperSeries, this.lowerSeries, this.middleSeries];
        this.isSeriesCreated = true;

        console.log(`✅ [BB] Bollinger Bands created successfully`);
        return this.series;
    }

    updateData(data: IndicatorData): void {
        console.log('📊 [BB] Processing data:', {
            hasMetadata: !!data.metadata,
            metadataKeys: data.metadata ? Object.keys(data.metadata) : [],
            valuesLength: data.values?.length || 0
        });

        this.ensureSeriesCreated();

        // ✅ دمج metadata الجديد مع القديم (نفس المنطق القديم)
        if (data.metadata) {
            this.mergeMetadata(data.metadata);
        }

        // ✅ إذا لم يكن لدينا metadata كافي، نخرج (نفس القديم)
        if (!this.fullMetadata.upper_band || !this.fullMetadata.lower_band || !this.fullMetadata.sma) {
            console.error("[BB] ❌ Missing required metadata (upper_band, lower_band, sma)");
            console.error("[BB] Current metadata:", this.fullMetadata);
            return;
        }
        const times = data.values.map(v => this.formatTime(v.time));

        // ✅ إعداد بيانات النطاق العلوي (نفس القديم)
        const upperBand = this.fullMetadata.upper_band.map((value: number, index: number) => ({
            time: times[index] || this.formatTime(Date.now() - index * 60000),
            value
        })).filter(point => point.value !== null && !isNaN(point.value));

        // ✅ إعداد بيانات النطاق السفلي (نفس القديم)
        const lowerBand = this.fullMetadata.lower_band.map((value: number, index: number) => ({
            time: times[index] || this.formatTime(Date.now() - index * 60000),
            value
        })).filter(point => point.value !== null && !isNaN(point.value));

        // ✅ إعداد بيانات الخط الأوسط (نفس القديم)
        const middleValues = this.fullMetadata.sma.map((value: number, index: number) => ({
            time: times[index] || this.formatTime(Date.now() - index * 60000),
            value
        })).filter(point => point.value !== null && !isNaN(point.value));

        // ✅ إعداد بيانات المنطقة (النطاق) (نفس القديم)
        const bandData = [];
        const minLength = Math.min(upperBand.length, lowerBand.length);

        for (let i = 0; i < minLength; i++) {
            if (upperBand[i] && lowerBand[i] && upperBand[i].time === lowerBand[i].time) {
                bandData.push({
                    time: upperBand[i].time,
                    value: upperBand[i].value,
                    value2: lowerBand[i].value
                });
            }
        }

        console.log('[BB] ✅ Data prepared:', {
            upperPoints: upperBand.length,
            lowerPoints: lowerBand.length,
            middlePoints: middleValues.length,
            bandPoints: bandData.length
        });

        // ✅ تحديث السلاسل (نفس القديم)
        try {
            if (this.bandSeries && bandData.length > 0) {
                this.bandSeries.setData(bandData);
            }

            if (this.upperSeries && upperBand.length > 0) {
                this.upperSeries.setData(upperBand);
            }

            if (this.lowerSeries && lowerBand.length > 0) {
                this.lowerSeries.setData(lowerBand);
            }

            if (this.middleSeries && middleValues.length > 0) {
                this.middleSeries.setData(middleValues);
            }

            console.log('[BB] ✅ All series updated successfully');
        } catch (error) {
            console.error('[BB] ❌ Error updating series:', error);
        }
    }

    // ✅ نفس دالة mergeMetadata القديمة بالضبط
    private mergeMetadata(newMetadata: any): void {
        // دمج المصفوفات في metadata
        Object.keys(newMetadata).forEach(key => {
            if (Array.isArray(newMetadata[key])) {
                if (!this.fullMetadata[key]) {
                    this.fullMetadata[key] = [...newMetadata[key]];
                } else {
                    // دمج المصفوفات، مع الحفاظ على الترتيب
                    const oldArray = this.fullMetadata[key];
                    const newArray = newMetadata[key];

                    // إذا كانت المصفوفة الجديدة تحتوي على عناصر أقل، نعتبرها تحديث للقيم الأخيرة
                    if (newArray.length <= oldArray.length) {
                        // تحديث القيم الأخيرة
                        for (let i = 0; i < newArray.length; i++) {
                            const oldIndex = oldArray.length - newArray.length + i;
                            if (oldIndex >= 0) {
                                oldArray[oldIndex] = newArray[i];
                            }
                        }
                    } else {
                        // إضافة عناصر جديدة
                        this.fullMetadata[key] = [...oldArray, ...newArray.slice(oldArray.length)];
                    }
                }
            } else {
                // إذا لم تكن مصفوفة، استبدل القيمة
                this.fullMetadata[key] = newMetadata[key];
            }
        });
    }



    destroy(): void {
        console.log(`[BB] Destroying Bollinger Bands`);
        super.destroy();
        this.bandSeries = null;
        this.upperSeries = null;
        this.lowerSeries = null;
        this.middleSeries = null;
        this.fullMetadata = {};
    }
}