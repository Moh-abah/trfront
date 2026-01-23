//@ts-nocheck
import React, { useEffect, useRef } from 'react';
import { VisualCandle } from '@/types/backtest';
import {  VolumeClimaxPrimitive, ClimaxPoint, ClimaxVolumeBar } from '../charts/indicators/primitives/volume-climax-primitive';

interface VolumeClimaxBacktestProps {
    candles: VisualCandle[];
    candleSeries: any; // ISeriesApi<'Candlestick'>
    chart: any; // IChartApi
    visible?: boolean;
}

export const VolumeClimaxBacktestIndicator: React.FC<VolumeClimaxBacktestProps> = ({
    candles,
    candleSeries,
    chart,
    visible = true
}) => {
    const primitiveRef = useRef<VolumeClimaxPrimitive | null>(null);

    useEffect(() => {
        if (!candleSeries || !chart || !visible) return;

        // استخراج بيانات climax_points و volume_bars من الشموع
        const climaxPoints: ClimaxPoint[] = [];
        const volumeBars: ClimaxVolumeBar[] = [];

        candles.forEach(candle => {
            const timestamp = Math.floor(new Date(candle.timestamp).getTime() / 1000);

            // استخراج climax_point إذا موجود
            if (candle.climax_point) {
                const climax = candle.climax_point;
                climaxPoints.push({
                    time: timestamp,
                    high: climax.high,
                    low: climax.low,
                    ratio: climax.ratio,
                    color: climax.color
                });
            }

            // استخراج volume_bar إذا موجود
            if (candle.volume_bar) {
                const volume = candle.volume_bar;
                volumeBars.push({
                    time: timestamp,
                    value: volume.value,
                    ratio: volume.ratio,
                    color: volume.color
                });
            }
        });

        // إنشاء الـ Primitive
        const timeScale = chart.timeScale();
        primitiveRef.current = new VolumeClimaxPrimitive(
            climaxPoints,
            volumeBars,
            timeScale,
            visible
        );

        // إرفاق الـ Primitive بسلسلة الشموع
        candleSeries.attachPrimitive(primitiveRef.current);

        return () => {
            if (primitiveRef.current) {
                candleSeries.detachPrimitive(primitiveRef.current);
                primitiveRef.current = null;
            }
        };
    }, [candles, candleSeries, chart, visible]);

    // تحديث البيانات عند تغيير candles
    useEffect(() => {
        if (!primitiveRef.current || !visible) return;

        const climaxPoints: ClimaxPoint[] = [];
        const volumeBars: ClimaxVolumeBar[] = [];

        candles.forEach(candle => {
            const timestamp = Math.floor(new Date(candle.timestamp).getTime() / 1000);

            if (candle.climax_point) {
                const climax = candle.climax_point;
                climaxPoints.push({
                    time: timestamp,
                    high: climax.high,
                    low: climax.low,
                    ratio: climax.ratio,
                    color: climax.color
                });
            }

            if (candle.volume_bar) {
                const volume = candle.volume_bar;
                volumeBars.push({
                    time: timestamp,
                    value: volume.value,
                    ratio: volume.ratio,
                    color: volume.color
                });
            }
        });

        primitiveRef.current.update(climaxPoints, volumeBars);
    }, [candles, visible]);

    // التحكم في الرؤية
    useEffect(() => {
        if (primitiveRef.current) {
            primitiveRef.current.setVisible(visible);
        }
    }, [visible]);

    return null; // هذا مكون غير مرئي
};