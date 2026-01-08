
// @ts-nocheck



import { IChartApi, ISeriesApi, LineSeries, SeriesMarker, UTCTimestamp } from "lightweight-charts";

export interface IndicatorConfig {
    id: string;
    name: string;
    type: 'line' | 'histogram' | 'area' | 'band' | 'oscillator' | 'overlay';
    color?: string;
    overlay?: boolean;
    priceScaleId?: string;
}

export interface IndicatorData {
    values: { time: number; value: number }[] | number[];
    metadata?: {
        upper_band?: number[];
        lower_band?: number[];
        sma?: number[];
        signal?: number[];
        [key: string]: any;
    };
    timestamps?: number[];
    signals?: {
        data: number[];
        index: string[];
        dtype: string;
    };
    liveTime?: number;
    isHistorical?: boolean;
    isInitialData?: boolean;
    isLiveUpdate?: boolean;
}

export interface IndicatorDatashaps {
    values: any[] | number[];
    metadata?: any;
    signals?: any;
    liveTime?: number;
    indicators_results?: any;
    source?: 'candle_update' | 'candle_close';
}

export interface IndicatorDataMACD {
    values: { time: number; value: number }[] | number[];
    metadata?: {
        upper_band?: number[];
        lower_band?: number[];
        sma?: number[];
        signal?: number[];
        macd_line?: number[];
        signal_line?: number[];
        histogram?: number[];
        [key: string]: any;
    };
    timestamps?: number[];
    signals?: {
        data: number[];
        index: string[];
        dtype: string;
    };
    liveTime?: number;
    indicators_results: any;
}

export interface IndicatorDataATR {
    isInitialData: any;
    isLiveUpdate: any;
    values: { time: number; value: number }[] | number[];
    metadata?: {
        period?: number;
        [key: string]: any;
    };
    timestamps?: number[];
    signals?: {
        data: number[];
        index: string[];
        dtype: string;
    };
    liveTime?: number;
    indicators_results: any;
}

export abstract class BaseIndicator {
    protected chart: IChartApi;
    protected config: IndicatorConfig;
    protected series: ISeriesApi<any>[] = [];
    protected isSeriesCreated: boolean = false;

    protected mainCandleSeries?: ISeriesApi<"Candlestick">;
    protected markerLineSeries: ISeriesApi<"Line">;

    // 🔥 متغير لتتبع حالة الرؤية الفعلية
    private isVisibleState: boolean = true;

    constructor(chart: IChartApi, config: IndicatorConfig, mainCandleSeries?: ISeriesApi<"Candlestick">) {
        this.chart = chart;
        this.config = config;
        this.mainCandleSeries = mainCandleSeries;

        this.markerLineSeries = chart.addSeries(LineSeries, {
            color: 'transparent',
            lineWidth: 0,
        });
    }

    abstract createSeries(): ISeriesApi<any>[];
    abstract updateData(data: IndicatorData): void;

    protected ensureSeriesCreated(): void {
        if (!this.isSeriesCreated) {
            this.series = this.createSeries();
            this.isSeriesCreated = true;
        }
    }

    public getSeries(): ISeriesApi<any> | ISeriesApi<any>[] | null {
        if (this.series && this.series.length > 0) {
            return this.series;
        }
        return null;
    }

    /**
     * 🔥 الدالة الرئيسية لإظهار/إخفاء المؤشر من الشارت
     * هذه الدالة تُستدعى من IndicatorManager عند الضغط على زر العين
     */
    public setVisible(isVisible: boolean): void {
        console.log(`[BaseIndicator] 👁️ Setting visibility for ${this.config.id}: ${isVisible}`);

        // تحديث الحالة الداخلية
        this.isVisibleState = isVisible;

        // إذا لم يتم إنشاء السلاسل بعد، نقوم بإنشائها أولاً
        if (!this.isSeriesCreated) {
            console.log(`[BaseIndicator] ℹ️ Series not created yet for ${this.config.id}, will apply visibility after creation`);
            return;
        }

        // التحقق من وجود سلاسل
        if (!this.series || this.series.length === 0) {
            console.warn(`[BaseIndicator] ⚠️ No series found for ${this.config.id}`);
            return;
        }

        // تطبيق الرؤية على كل سلسلة
        this.series.forEach((series, index) => {
            if (series) {
                try {
                    series.applyOptions({ visible: isVisible });
                    console.log(`[BaseIndicator] ✅ Series [${index}] visibility set to ${isVisible} for ${this.config.id}`);
                } catch (error) {
                    console.error(`[BaseIndicator] ❌ Failed to set visibility for series [${index}] of ${this.config.id}:`, error);
                }
            }
        });
    }

    /**
     * 🔥 دالة لاستعلام عن حالة الرؤية الحالية
     */
    public getVisibility(): boolean {
        return this.isVisibleState;
    }

    protected updateMarkers(markers: SeriesMarker<UTCTimestamp>[]): void {
        if (this.mainCandleSeries) {
            const currentMarkers = ((this.markerLineSeries as any).markers() || []) as SeriesMarker<UTCTimestamp>[];
            const combined = [...currentMarkers, ...markers].filter((v, i, a) =>
                a.findIndex(t => t.time === v.time && t.text === v.text) === i
            );
            (this.markerLineSeries as any).setMarkers(combined);
        }
    }

    protected mergeLineData(currentData: any[], newPoint: { time: UTCTimestamp, value: number }) {
        if (currentData.length === 0) return [newPoint];
        const lastIndex = currentData.length - 1;
        if (currentData[lastIndex].time === newPoint.time) {
            currentData[lastIndex] = newPoint;
            return [...currentData];
        }
        return [...currentData, newPoint];
    }

    protected formatTime(time: number | string | Date): UTCTimestamp {
        try {
            let timestamp: number;

            if (typeof time === 'number') {
                timestamp = time;
            } else if (typeof time === 'string') {
                const parsed = Date.parse(time);
                timestamp = isNaN(parsed) ? Date.now() : parsed;
            } else if (time instanceof Date) {
                timestamp = time.getTime();
            } else {
                timestamp = Date.now();
            }

            if (timestamp > 1000000000000) {
                return Math.floor(timestamp / 1000) as UTCTimestamp;
            }
            return timestamp as UTCTimestamp;
        } catch (error) {
            console.error(`[${this.config.name}] ❌ Error formatting time:`, error, "time:", time);
            return Math.floor(Date.now() / 1000) as UTCTimestamp;
        }
    }

    protected processInputData(data: IndicatorData): { time: UTCTimestamp; value: number }[] {
        const { values, signals } = data;

        if (Array.isArray(values) && values.length > 0 && typeof values[0] === 'number') {
            if (!signals?.index) {
                console.warn(`[${this.config.name}] ⚠️ Numeric values without timestamps`);
                return [];
            }

            const result: { time: UTCTimestamp; value: number }[] = [];
            const times = signals.index;
            const numValues = values as number[];

            const offset = Math.max(0, times.length - numValues.length);

            for (let i = 0; i < numValues.length; i++) {
                const value = numValues[i];
                const timeIndex = i + offset;

                if (timeIndex >= times.length || value === null || isNaN(value)) {
                    continue;
                }

                result.push({
                    time: this.formatTime(times[timeIndex]),
                    value
                });
            }

            return result;
        }

        const typedValues = values as { time: number; value: number }[];
        return typedValues
            .map(point => ({
                time: this.formatTime(point.time),
                value: point.value
            }))
            .filter(point => point.value !== null && !isNaN(point.value));
    }

    protected mergeData(
        existingData: { time: UTCTimestamp; value: number }[],
        newData: { time: UTCTimestamp; value: number }[]
    ): { time: UTCTimestamp; value: number }[] {
        const dataMap = new Map<number, number>();

        existingData.forEach(point => {
            dataMap.set(point.time as number, point.value);
        });

        newData.forEach(point => {
            dataMap.set(point.time as number, point.value);
        });

        return Array.from(dataMap.entries())
            .map(([time, value]) => ({
                time: time as UTCTimestamp,
                value
            }))
            .sort((a, b) => (a.time as number) - (b.time as number));
    }

    protected processArrayWithOffset(
        values: number[],
        times: string[],
        debugName: string = ''
    ): { time: UTCTimestamp; value: number }[] {
        if (!values || !times || times.length === 0) {
            console.warn(`[${this.config.name}] ⚠️ No values or times for ${debugName}`);
            return [];
        }

        const result: { time: UTCTimestamp; value: number }[] = [];

        const offset = Math.max(0, times.length - values.length);

        console.log(`[${this.config.name}] 🔄 ${debugName} offset:`, {
            values: values.length,
            times: times.length,
            offset: offset,
            firstValue: values[0],
            firstTime: times[offset],
            lastValue: values[values.length - 1],
            lastTime: times[times.length - 1]
        });

        for (let i = 0; i < values.length; i++) {
            const value = values[i];
            const timeIndex = i + offset;

            if (timeIndex >= times.length) {
                console.warn(`[${this.config.name}] ⚠️ Time index out of range for ${debugName}:`, {
                    i, timeIndex, maxIndex: times.length - 1
                });
                break;
            }

            if (value === null || isNaN(value)) {
                continue;
            }

            const time = this.formatTime(times[timeIndex]);

            if ((time as number) === 0) {
                console.warn(`[${this.config.name}] ⚠️ Invalid time for ${debugName} at index ${i}:`, times[timeIndex]);
                continue;
            }

            result.push({ time, value });
        }

        result.sort((a, b) => (a.time as number) - (b.time as number));

        console.log(`[${this.config.name}] ✅ ${debugName} processed: ${result.length} points`);
        return result;
    }

    protected macdprocessArrayWithOffset(
        values: number[],
        times: string[],
        debugName: string = ''
    ): { time: UTCTimestamp; value: number }[] {
        if (!values || !times || times.length === 0) return [];

        const result: { time: UTCTimestamp; value: number }[] = [];

        const offset = times.length - values.length;

        for (let i = 0; i < values.length; i++) {
            const timeIndex = i + offset;

            if (timeIndex >= 0 && timeIndex < times.length) {
                const value = values[i];

                if (value !== null && !isNaN(value)) {
                    const time = this.macdformatTime(times[timeIndex]);

                    if ((time as number) !== 0) {
                        result.push({ time, value });
                    }
                }
            }
        }

        return result.sort((a, b) => (a.time as number) - (b.time as number));
    }

    protected macdformatTime(time: any): UTCTimestamp {
        try {
            if (!time) return 0 as UTCTimestamp;

            let timestamp: number;

            if (typeof time === 'string') {
                const parsedDate = new Date(time);

                if (isNaN(parsedDate.getTime())) {
                    const num = Number(time);
                    if (!isNaN(num)) timestamp = num;
                    else return 0 as UTCTimestamp;
                } else {
                    timestamp = Math.floor(parsedDate.getTime() / 1000);
                }
            } else if (typeof time === 'number') {
                timestamp = time;
            } else {
                return 0 as UTCTimestamp;
            }

            if (timestamp > 10000000000) {
                timestamp = Math.floor(timestamp / 1000);
            }

            return timestamp as UTCTimestamp;
        } catch (error) {
            console.error("[MACD] Time Format Error:", error);
            return 0 as UTCTimestamp;
        }
    }

    protected mergePartialData(
        existingData: { time: UTCTimestamp; value: number }[],
        newValue: number,
        newTime: UTCTimestamp
    ): { time: UTCTimestamp; value: number }[] {
        const data = [...existingData];
        const existingIndex = data.findIndex(d => d.time === newTime);

        if (existingIndex >= 0) {
            data[existingIndex] = { time: newTime, value: newValue };
        } else {
            data.push({ time: newTime, value: newValue });
            data.sort((a, b) => (a.time as number) - (b.time as number));
        }

        return data;
    }

    protected processMetadataWithTime(
        metadata: number[],
        times: string[],
        offset: number = 0
    ): { time: UTCTimestamp; value: number }[] {
        const result: { time: UTCTimestamp; value: number }[] = [];

        for (let i = 0; i < metadata.length; i++) {
            const value = metadata[i];
            const timeIndex = i + offset;

            if (timeIndex >= times.length || value === null || isNaN(value)) {
                continue;
            }

            result.push({
                time: this.formatTime(times[timeIndex]),
                value
            });
        }

        return result;
    }

    protected createAreaData(
        upperValues: { time: UTCTimestamp; value: number }[],
        lowerValues: { time: UTCTimestamp; value: number }[]
    ): { time: UTCTimestamp; value: number; value2: number }[] {
        const result: { time: UTCTimestamp; value: number; value2: number }[] = [];
        const minLength = Math.min(upperValues.length, lowerValues.length);

        for (let i = 0; i < minLength; i++) {
            const upper = upperValues[i];
            const lower = lowerValues[i];

            if (upper.time === lower.time) {
                result.push({
                    time: upper.time,
                    value: upper.value,
                    value2: lower.value
                });
            }
        }

        return result;
    }

    protected processMetadataWithOffset(
        metadataArray: number[],
        times: string[],
        offset: number = 0
    ): { time: UTCTimestamp; value: number }[] {
        const result: { time: UTCTimestamp; value: number }[] = [];

        for (let i = 0; i < metadataArray.length; i++) {
            const value = metadataArray[i];
            const timeIndex = i + offset;

            if (timeIndex >= times.length || value === null || isNaN(value)) {
                continue;
            }

            result.push({
                time: this.formatTime(times[timeIndex]),
                value
            });
        }

        result.sort((a, b) => (a.time as number) - (b.time as number));

        return result;
    }

    destroy(): void {
        this.series.forEach(series => {
            try {
                this.chart.removeSeries(series);
            } catch (error) {
                console.warn(`[${this.config.name}] Error removing series:`, error);
            }
        });
        this.series = [];
        this.isSeriesCreated = false;
    }

    getId(): string {
        return this.config.id;
    }

    getName(): string {
        return this.config.name;
    }

    getType(): string {
        return this.config.type;
    }
}
