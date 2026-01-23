//@ts-nocheck

import { IChartApi, ISeriesApi, Time, ITimeScaleApi } from 'lightweight-charts';
import { BaseIndicator, IndicatorConfig, IndicatorData } from './base-indicator';
import {
    VolumeClimaxPrimitive,
    ClimaxPoint as PrimitiveClimaxPoint,
    ClimaxVolumeBar as PrimitiveVolumeBar
} from './primitives/volume-climax-primitive';

export class VolumeClimaxIndicator extends BaseIndicator {
    private _primitive: VolumeClimaxPrimitive | null = null;
    private _attachedSeries: ISeriesApi<'Candlestick'> | null = null;
    private _chart: IChartApi;

    private _isVisible: boolean = true;

    constructor(chart: IChartApi, config: IndicatorConfig, mainCandleSeries?: ISeriesApi<'Candlestick'>) {
        super(chart, config, mainCandleSeries);
        this._chart = chart;
        this._attachedSeries = mainCandleSeries || null;
        console.log('[VolumeClimax Indicator] 🆕 Created with Primitive architecture');

        if (config.visible !== undefined) {
            this._isVisible = config.visible;
        }
    }

    /**
     * دالة إخفاء/إظهار المؤشر
     */
    setVisible(visible: boolean): void {
        this._isVisible = visible;

        if (this._primitive) {
            this._primitive.setVisible(visible);

            if (this._attachedSeries && this._chart) {
                try {
                    this._chart.timeScale().fitContent();
                    const param = (this._primitive as any)._attachedParam;
                    if (param) {
                        param.requestUpdate();
                    }
                } catch (error) {
                    console.warn('[VolumeClimax Indicator] ⚠️ Could not refresh chart:', error);
                }
            }
        }

        console.log(`[VolumeClimax Indicator] 👁️ Visibility set to: ${visible}`);
        super.setVisible(visible);
    }

    getVisibility(): boolean {
        return this._isVisible;
    }

    getSeries(): ISeriesApi<any>[] {
        return [];
    }

    createSeries(): ISeriesApi<any>[] {
        try {
            if (!this._attachedSeries) {
                throw new Error('No candle series available for attachment');
            }

            const timeScale = this._chart.timeScale();
            this._primitive = new VolumeClimaxPrimitive(
                [],
                [],
                timeScale,
                this._isVisible
            );

            this._attachedSeries.attachPrimitive(this._primitive);

            console.log('[VolumeClimax Indicator] ✅ Primitive successfully attached to candle series');
            return [];

        } catch (error) {
            console.error('[VolumeClimax Indicator] ❌ Failed to create series:', error);
            throw error;
        }
    }

    updateData(data: IndicatorData): void {
        if (!this._isVisible) {
            return;
        }

        try {
            if (!data || !data.meta) {
                console.warn('[VolumeClimax Indicator] ⚠️ No meta provided in updateData');
                return;
            }

            // استخراج البيانات من الـ render object
            const renderData = data.meta.render;

            if (!renderData) {
                console.warn('[VolumeClimax Indicator] ⚠️ No render data found in meta');
                return;
            }

            const climaxPointsData = renderData.climax_points || [];
            const volumeBarsData = renderData.volume_bars || [];

            console.log('[VolumeClimax Indicator] 🔄 Processing update:', {
                climaxPoints: climaxPointsData.length,
                volumeBars: volumeBarsData.length
            });

            const primitiveClimaxPoints = this.convertClimaxPoints(climaxPointsData);
            const primitiveVolumeBars = this.convertVolumeBars(volumeBarsData);

            if (this._primitive) {
                this._primitive.update(primitiveClimaxPoints, primitiveVolumeBars);
                console.log('[VolumeClimax Indicator] 🎨 Primitive updated successfully');
            } else {
                console.error('[VolumeClimax Indicator] ❌ Primitive not initialized');
            }

        } catch (error) {
            console.error('[VolumeClimax Indicator] ❌ Error in updateData:', error);
        }
    }

    private convertClimaxPoints(data: any[]): PrimitiveClimaxPoint[] {
        if (!data || !Array.isArray(data)) return [];
        return data.map(pt => ({
            time: pt.time as Time,
            high: Number(pt.high),
            low: Number(pt.low),
            ratio: Number(pt.ratio),
            color: pt.color || 'rgba(255,0,0,0.5)'
        }));
    }

    private convertVolumeBars(data: any[]): PrimitiveVolumeBar[] {
        if (!data || !Array.isArray(data)) return [];
        return data.map(bar => ({
            time: bar.time as Time,
            value: Number(bar.value),
            ratio: Number(bar.ratio),
            color: bar.color || '#CCCCCC'
        }));
    }

    destroy(): void {
        try {
            if (this._primitive && this._attachedSeries) {
                this._attachedSeries.detachPrimitive(this._primitive);
                console.log('[VolumeClimax Indicator] 🔴 Primitive detached successfully');
            }
            this._primitive = null;
            this._attachedSeries = null;
            super.destroy();
        } catch (error) {
            console.error('[VolumeClimax Indicator] ❌ Error during destroy:', error);
        }
    }
}