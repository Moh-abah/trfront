import { IChartApi, ISeriesApi, LineSeries } from "lightweight-charts";
import { BaseIndicator, IndicatorConfig, IndicatorData } from "./base-indicator";

export class MAIndicator extends BaseIndicator {
    private mainSeries: ISeriesApi<"Line"> | null = null;

    constructor(chart: IChartApi, config: IndicatorConfig) {
        super(chart, config);
    }

    createSeries(): ISeriesApi<any>[] {
        console.log(`[MA] 🎨 Creating series with config:`, {
            id: this.config.id,
            priceScaleId: this.config.priceScaleId,
            color: this.config.color
        });

        this.mainSeries = this.chart.addSeries(LineSeries, {
            color: this.config.color || '#e1ff00ff',
            lineWidth: 2,
            priceScaleId: this.config.priceScaleId || 'right',
            title: this.config.name,
            lastValueVisible: true,
            priceLineVisible: false,
        });

        this.isSeriesCreated = true;
        return [this.mainSeries];
    }

    updateData(data: IndicatorData): void {
        if (!this.mainSeries) {
            console.error(`[MA] ❌ Series not created yet`);
            return;
        }

        // حالة التحديث الحي
        if (data.liveTime && data.values.length === 1) {
            const value = Array.isArray(data.values) ? data.values[0] : data.values;

            if (typeof value === 'number' && !isNaN(value)) {
                this.mainSeries.update({
                    time: data.liveTime as any,
                    value: value
                });
            }
            return;
        }

        // حالة البيانات التاريخية
        const processedData = this.processInputData(data);

        if (processedData.length > 0) {
            this.mainSeries.setData(processedData);
        }
    }
}
