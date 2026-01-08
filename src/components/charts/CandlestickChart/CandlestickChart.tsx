// @ts-nocheck



"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"

import {
    createChart,
    ColorType,
    CandlestickSeries,
    HistogramSeries,
    BarSeries,
    LineSeries,
    AreaSeries,
    CrosshairMode,
    type IChartApi,
    type ISeriesApi,
    type MouseEventParams,
    type UTCTimestamp,
} from "lightweight-charts"
import { DrawingTools } from "./DrawingTools"
import { lightThemeConfig, darkThemeConfig } from "@/lib/charts/config/chart-config"
import "./chart-styles.css"
import {
    MousePointer2,
    Minus,
    Ruler,
    Square,
    Trash2,
    Move3D,
    Type
} from "lucide-react"

import { useTheme } from "@/hooks/useTheme"
import { useChartStore } from "@/stores/chart.store"
import { getBarSpacingForTimeframe } from "@/lib/charts/utils/chart-helper"
import { IndicatorManager, IndicatorConfig, IndicatorData } from "../indicators"
import { ChartToolbar } from "../charttoolbar/charttoolbat"


export interface CandlestickChartProps {
    symbol: string
    timeframe?: string
    height?: number // سنستخدمها فقط كـ fallback في حال لم نجد container
    showToolbar?: boolean
    onIndicatorToggle?: (id: string, isVisible: boolean) => void
    showDrawingTools?: boolean
    showVolume?: boolean
    containerClassName?: string
    onChartReady?: (chart: IChartApi) => void
    onCrosshairMove?: (params: MouseEventParams) => void
    onIndicatorAdd?: (indicator: any) => void
    onIndicatorRemove?: (indicatorId: string) => void

    onIndicatorManagerReady?: (manager: IndicatorManager) => void;
    drawingMode?: string;
    onDrawingModeChange?: (mode: string) => void;

}


const toUTCTimestamp = (time: number | string | Date): UTCTimestamp => {
    let timeMs: number;
    if (typeof time === 'string') {
        timeMs = new Date(time).getTime();
    } else if (time instanceof Date) {
        timeMs = time.getTime();
    } else {
        timeMs = time;
    }

    if (isNaN(timeMs) || !isFinite(timeMs)) {
        console.error("[Chart] ❌ Invalid time received:", time);
        return Math.floor(Date.now() / 1000) as UTCTimestamp;
    }

    if (timeMs > 1000000000000) {
        return Math.floor(timeMs / 1000) as UTCTimestamp;
    }

    return timeMs as UTCTimestamp;
};


const ChartSkeletonLoader = ({ symbol, timeframe }: { symbol: string; timeframe: string }) => {
    const skeletonBars = Array.from({ length: 40 }, (_, i) => i);

    return (
        <div className="relative w-full h-full bg-slate-900 overflow-hidden">
            {/* خلفية متوهجة */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5"></div>

            {/* Header مع معلومات الرمز */}
            <div className="px-4 py-3 border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 animate-pulse"></div>
                        <div className="space-y-2">
                            <div className="h-4 w-24 bg-slate-700 rounded animate-pulse"></div>
                            <div className="h-3 w-16 bg-slate-800 rounded animate-pulse"></div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="h-4 w-20 bg-slate-700 rounded animate-pulse"></div>
                        <div className="h-4 w-16 bg-slate-700 rounded animate-pulse"></div>
                    </div>
                </div>
            </div>

            {/* المحور السعري */}
            <div className="absolute left-0 top-12 bottom-8 w-16 border-r border-slate-700/50 px-2 py-4 space-y-6">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-3 bg-slate-700 rounded animate-pulse"></div>
                ))}
            </div>

            {/* منطقة المخطط الرئيسية */}
            <div className="absolute left-16 right-0 top-12 bottom-8 p-4">
                {/* خطوط الشبكة */}
                <div className="absolute inset-0">
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute left-0 right-0 h-px bg-slate-700/30"
                            style={{ top: `${i * 14.28}%` }}
                        ></div>
                    ))}
                </div>

                {/* شموع وهمية */}
                <div className="relative h-full flex items-end">
                    {skeletonBars.map((_, i) => {
                        const height = Math.random() * 60 + 20;
                        const isUp = Math.random() > 0.5;
                        const barWidth = 6;
                        const margin = 2;

                        return (
                            <div
                                key={i}
                                className="absolute bottom-0 flex flex-col items-center"
                                style={{
                                    left: `${i * (barWidth + margin)}px`,
                                    width: `${barWidth}px`,
                                }}
                            >
                                {/* الفتيل العلوي */}
                                <div
                                    className="w-px bg-slate-600"
                                    style={{ height: `${Math.random() * 10}px` }}
                                ></div>

                                {/* الجسم */}
                                <div
                                    className={`w-full rounded-sm ${isUp ? 'bg-emerald-500/30' : 'bg-red-500/30'}`}
                                    style={{ height: `${height}%` }}
                                ></div>

                                {/* الفتيل السفلي */}
                                <div
                                    className="w-px bg-slate-600"
                                    style={{ height: `${Math.random() * 10}px` }}
                                ></div>
                            </div>
                        );
                    })}
                </div>

                {/* المؤشرات الوهمية */}
                <div className="absolute bottom-10 left-0 right-0">
                    <div className="h-0.5 w-full bg-slate-700/30 mb-2"></div>
                    <div className="flex gap-2">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-3 w-16 bg-slate-700/40 rounded animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* المحور الزمني */}
            <div className="absolute bottom-0 left-16 right-0 h-8 border-t border-slate-700/50">
                <div className="flex justify-between px-4 pt-2">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-3 w-12 bg-slate-700 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>

            {/* معلومات التحميل */}
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <div className="space-y-2">
                        <div className="h-4 w-48 bg-slate-700 rounded animate-pulse mx-auto"></div>
                        <div className="h-3 w-36 bg-slate-800 rounded animate-pulse mx-auto"></div>
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-400">
                        <div className="h-3 w-20 bg-slate-700 rounded animate-pulse"></div>
                        <div className="h-3 w-4 bg-slate-700 rounded animate-pulse"></div>
                        <div className="h-3 w-16 bg-slate-700 rounded animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};



export const CandlestickChart: React.FC<CandlestickChartProps> = ({
    symbol,
    timeframe = "1m",
    height = 500, // Fallback
    showToolbar = true,
    showDrawingTools = true,
    showVolume = true,
    containerClassName = "",
    onChartReady,
    onCrosshairMove,
    onIndicatorToggle,
    onIndicatorAdd,
    onIndicatorRemove,
    onIndicatorManagerReady,
    drawingMode = "cursor",
    onDrawingModeChange,
}) => {
    const { theme } = useTheme()
    const chartContainerRef = useRef<HTMLDivElement | null>(null)
    const chartRef = useRef<IChartApi | null>(null)
    const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null)
    const indicatorSeriesRefs = useRef<Record<string, ISeriesApi<"Line">>>({})

    const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
    const barSeriesRef = useRef<ISeriesApi<"Bar"> | null>(null)
    const lineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null)
    const areaSeriesRef = useRef<ISeriesApi<"Area"> | null>(null)
    const currentSeriesRef = useRef<ISeriesApi<any> | null>(null)

    const [isChartReady, setIsChartReady] = useState(false)
    const [chartType, setChartType] = useState<"candlestick" | "bar" | "line" | "area">("candlestick")
  

    const { candles, liveCandle, previousLiveCandle, indicators, isLoading, isConnected, currentPrice } = useChartStore()
    const indicatorManagerRef = useRef<IndicatorManager | null>(null);
    const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

    // إضافة حالة للتحميل
    const [isInitializing, setIsInitializing] = useState(true);
    const [drawings, setDrawings] = useState<any[]>([])
    const [currentDrawing, setCurrentDrawing] = useState<any>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const startPointRef = useRef<{ x: number; y: number; time: number; price: number } | null>(null)
    const initialDataLoaded = useRef(false);


    const [chartLoading, setChartLoading] = useState(true);








    // 🔥 دالة للتعامل مع toggle visibility
    const handleToggleIndicator = useCallback((indicatorId: string, isVisible: boolean) => {
        console.log("🔄 [Chart] Toggle indicator:", indicatorId, isVisible);

        if (indicatorManagerRef.current) {
            indicatorManagerRef.current.toggleIndicatorVisibility(indicatorId, isVisible);
            console.log("✅ [Chart] Indicator visibility toggled");
        } else {
            console.warn("⚠️ [Chart] IndicatorManager not ready yet");
        }

        // إبلاغ الـ Page بالتغيير
        onIndicatorToggle?.(indicatorId, isVisible);
    }, [onIndicatorToggle]);







    // دالة لتحويل إحداثيات الشاشة (Pixel) إلى بيانات (Time, Price)
    const getChartPoint = useCallback((x: number, y: number) => {
        if (!chartRef.current || !candlestickSeriesRef.current) return null;
        try {
            const timeScale = chartRef.current.timeScale();
            const time = timeScale.coordinateToTime(x);
            const price = candlestickSeriesRef.current.coordinateToPrice(y);
            return { x, y, time, price };
        } catch (e) {
            return null;
        }
    }, []);

    // دالة لتحويل البيانات (Time, Price) إلى إحداثيات الشاشة (Pixel) - للرسم
    const getPixelsFromPoint = useCallback((time: number, price: number) => {
        if (!chartRef.current || !candlestickSeriesRef.current) return null;
        try {
            const timeScale = chartRef.current.timeScale();
            const x = timeScale.timeToCoordinate(time);
            const y = candlestickSeriesRef.current.priceToCoordinate(price);
            return { x, y };
        } catch (e) {
            return null;
        }
    }, []);


    // التعامل مع الضغط للرسم
    const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
        if (drawingMode === "cursor" || drawingMode === "crosshair") return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const point = getChartPoint(x, y);
        if (!point) return;

        startPointRef.current = point;
        setIsDrawing(true);
        setCurrentDrawing({
            type: drawingMode,
            start: point,
            end: point // في البداية، البداية والنهاية متماثلان
        });
    }, [drawingMode, getChartPoint]);


    // التعامل مع الحركة للرسم
    const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
        if (!isDrawing || !startPointRef.current || !currentDrawing) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const endPoint = getChartPoint(x, y);
        if (!endPoint) return;

        setCurrentDrawing({
            ...currentDrawing,
            end: endPoint
        });
    }, [isDrawing, currentDrawing, getChartPoint]);


    // التعامل مع رفع الإصبع (إنهاء الرسم)
    const handleMouseUp = useCallback(() => {
        if (!isDrawing || !currentDrawing) return;

        setDrawings(prev => [...prev, currentDrawing]);
        setCurrentDrawing(null);
        setIsDrawing(false);
        startPointRef.current = null;

        // العودة لوضع المؤشر بعد الرسم (اختياري)
        // onDrawingModeChange?.("cursor"); 
        toast.success("تم إضافة الشكل");
    }, [isDrawing, currentDrawing, onDrawingModeChange]);


    // ==========================================


    // تفعيل/تعطيل Crosshair
    useEffect(() => {
        if (!chartRef.current || !isChartReady) return;

        if (drawingMode === 'crosshair') {
            chartRef.current.applyOptions({ crosshair: { mode: CrosshairMode.Normal } });
        } else {
            chartRef.current.applyOptions({ crosshair: { mode: CrosshairMode.Magnet } });
        }
    }, [drawingMode, isChartReady]);


    const tools = [
        { id: "cursor", icon: MousePointer2, label: "مؤشر الماوس" },
        { id: "crosshair", icon: Move3D, label: "مقص الشارت" },
        { id: "line", icon: Minus, label: "خط" },
        { id: "trendline", icon: Ruler, label: "خط اتجاه" },
        { id: "rect", icon: Square, label: "مستطيل" },
        { id: "text", icon: Type, label: "نص" },
    ]



    // Initialize chart
    useEffect(() => {
        setIsInitializing(true);

        if (!chartContainerRef.current || chartRef.current) return

        const chartConfig = theme === "dark" ? darkThemeConfig : lightThemeConfig

        const barSpacing = getBarSpacingForTimeframe(timeframe)
        const container = chartContainerRef.current

        // 🔥 الحل: قياس الارتفاع الفعلي للحاوية بدلاً من استخدام الـ Prop الثابت
        const containerWidth = container.clientWidth
        const containerHeight = container.clientHeight || height

        const chart = createChart(container, {
            layout: {
                background: { type: ColorType.Solid, color: chartConfig.layout.background.color },
                textColor: chartConfig.layout.textColor,
                fontSize: chartConfig.layout.fontSize,
            },
            grid: chartConfig.grid,
            width: containerWidth,
            height: containerHeight, // استخدام الارتفاع المقاس
            crosshair: {
                mode: CrosshairMode.Magnet,
                vertLine: chartConfig.crosshair.vertLine,
                horzLine: chartConfig.crosshair.horzLine,
            },
            timeScale: {
                borderColor: chartConfig.timeScale.borderColor,
                timeVisible: true,
                secondsVisible: timeframe === "1m",
                borderVisible: true,
                rightOffset: 15,
                barSpacing: barSpacing,
                minBarSpacing: 0.5,
                fixLeftEdge: false,
                fixRightEdge: false,
                shiftVisibleRangeOnNewBar: true,
                uniformDistribution: true,
                allowShiftVisibleRangeOnWhitespaceReplacement: true,
            },
            rightPriceScale: {
                borderColor: chartConfig.rightPriceScale.borderColor,
                borderVisible: true,
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.4,
                },
                autoScale: true,
            },
            handleScroll: {
                mouseWheel: true,
                pressedMouseMove: true,
                horzTouchDrag: true,
                vertTouchDrag: true,
            },
            handleScale: {
                axisPressedMouseMove: true,
                mouseWheel: true,
                pinch: true,
            },
            localization: {
                timeFormatter: (time: UTCTimestamp) => {
                    const date = new Date(time * 1000);
                    const hours = date.getUTCHours().toString().padStart(2, '0');
                    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
                    const seconds = date.getUTCSeconds().toString().padStart(2, '0');
                    if (timeframe === "1s" || timeframe === "1m") return `${hours}:${minutes}:${seconds}`;
                    if (timeframe === "1h" || timeframe === "4h") return `${hours}:${minutes}`;
                    return `${hours}:${minutes}`;
                },
                dateFormatter: (time: UTCTimestamp) => new Date(time * 1000).toLocaleDateString(),
            },
        })




        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: "#26a69a",
            downColor: "#ef5350",
            borderVisible: false,
            wickUpColor: "#26a69a",
            wickDownColor: "#ef5350",
            priceLineVisible: false,
            lastValueVisible: true,
            priceLineWidth: 0,
            priceFormat: {
                type: "custom",
                formatter: (price: number) => {
                    if (price === 0) return "0.00";
                    if (price < 0.001) return price.toFixed(8);
                    if (price < 0.01) return price.toFixed(6);
                    if (price < 0.1) return price.toFixed(5);
                    if (price < 1) return price.toFixed(4);
                    if (price < 2) return price.toFixed(3);
                    return price.toFixed(2);
                },
            },
        })

        candlestickSeriesRef.current = candlestickSeries
        currentSeriesRef.current = candlestickSeries

        if (showVolume) {
            const volumeSeries = chart.addSeries(HistogramSeries, {
                priceFormat: { type: "volume" },
                priceScaleId: "volume",
                color: "rgba(38, 166, 154, 0.5)",
                priceLineVisible: false,
                lastValueVisible: false,
            })
            volumeSeriesRef.current = volumeSeries
            chart.priceScale("volume").applyOptions({
                scaleMargins: {
                    top: 0.8,
                    bottom: 0,
                },
            })
        }

        if (onCrosshairMove) {
            chart.subscribeCrosshairMove(onCrosshairMove)
        }

        candlestickSeriesRef.current = candlestickSeries;
        candleSeriesRef.current = candlestickSeries;
        currentSeriesRef.current = candlestickSeries;

        chartRef.current = chart
        indicatorManagerRef.current = new IndicatorManager(chart);

        indicatorManagerRef.current.initializePriceScales();



        setTimeout(() => {
            setIsChartReady(true);
            setIsInitializing(false);
            onChartReady?.(chart);
        }, 500);

        // 🔥 الحل: تحديث الارتفاع والعرض معاً عند تغيير الحجم
        const handleResize = () => {
            if (chartRef.current && chartContainerRef.current) {
                const newWidth = chartContainerRef.current.clientWidth;
                const newHeight = chartContainerRef.current.clientHeight;

                chartRef.current.applyOptions({
                    width: newWidth,
                    height: newHeight, // تحديث الارتفاع هنا
                });

                chartRef.current.timeScale().applyOptions({
                    rightOffset: 15,
                    barSpacing: barSpacing,
                    minBarSpacing: 0.5,
                });

                chartRef.current.priceScale("right").applyOptions({
                    scaleMargins: { top: 0.05, bottom: 0.4 }
                });

                chartRef.current.priceScale("macd_scale").applyOptions({
                    scaleMargins: { top: 0.45, bottom: 0.25 }
                });

                chartRef.current.priceScale("rsi_scale").applyOptions({
                    scaleMargins: { top: 0.75, bottom: 0.1 }
                });

                if (showVolume) {
                    chartRef.current.priceScale("volume").applyOptions({
                        scaleMargins: { top: 0.80, bottom: 0 }
                    });
                }
            }
        }

        window.addEventListener("resize", handleResize)

        // استدعاء التابع مرة واحدة للتأكد من الحجم الصحيح عند التحميل
        setTimeout(handleResize, 0);

        return () => {
            window.removeEventListener("resize", handleResize)

            indicatorManagerRef.current?.clearAll();
            indicatorManagerRef.current = null;


            chartRef.current?.remove()
            chartRef.current = null
            candlestickSeriesRef.current = null
            barSeriesRef.current = null
            lineSeriesRef.current = null
            areaSeriesRef.current = null
            currentSeriesRef.current = null
            volumeSeriesRef.current = null
            indicatorSeriesRefs.current = {}
            setIsChartReady(false)
            candleSeriesRef.current = null;
            setIsInitializing(true);
        }
    }, [theme, showVolume, height, onChartReady, onCrosshairMove, timeframe])


    // تحديث حالة التحميل بناءً على candles
    useEffect(() => {
        if (candles.length > 0) {
            setChartLoading(false);
        } else if (isLoading) {
            setChartLoading(true);
        }
    }, [candles.length, isLoading]);

    // أضف هذا useEffect الجديد:
    useEffect(() => {
        if (indicatorManagerRef.current && onIndicatorManagerReady) {
            console.log("🔄 [Chart] Notifying Page that IndicatorManager is ready");
            onIndicatorManagerReady(indicatorManagerRef.current);
        }
    }, [indicatorManagerRef.current, onIndicatorManagerReady]);


    const [hasInitialDataLoaded, setHasInitialDataLoaded] = useState(false);
    // تحديث البيانات التاريخية
    useEffect(() => {
        if (!chartRef.current || !currentSeriesRef.current || !isChartReady || candles.length === 0) {
            return
        }

        const formattedHistoricalData = candles
            .map((c) => ({
                time: toUTCTimestamp(c.time),
                open: Number(c.open),
                high: Number(c.high),
                low: Number(c.low),
                close: Number(c.close),
            }))
            .sort((a, b) => (a.time as number) - (b.time as number))

        try {
            if (chartType === "line" || chartType === "area") {
                const lineData = formattedHistoricalData.map((c) => ({
                    time: c.time,
                    value: c.close,
                }))
                currentSeriesRef.current.setData(lineData)

            } else {
                currentSeriesRef.current.setData(formattedHistoricalData)

            }
            if (showVolume) {
                updateVolumeSeries(candles);
            }
            const timeScale = chartRef.current.timeScale()
            timeScale.applyOptions({
                rightOffset: 15,
                minBarSpacing: 0.5,
            })
            // timeScale.fitContent()
            if (!initialDataLoaded.current) {
                timeScale.fitContent();
                initialDataLoaded.current = true;
            }

        } catch (error) {

        }
    }, [candles, chartType, showVolume, isChartReady])







    // =================================================================
    // تحديث الشمعة الحية (Live Candle)
    // =================================================================
    useEffect(() => {
        if (!chartRef.current || !currentSeriesRef.current || !isChartReady || !liveCandle) {
            return;
        }

        try {
            const candleData = {
                time: toUTCTimestamp(liveCandle.time),
                open: Number(liveCandle.open),
                high: Number(liveCandle.high),
                low: Number(liveCandle.low),
                close: Number(liveCandle.close),
            };

            currentSeriesRef.current.update(candleData);
            if (showVolume && volumeSeriesRef.current) {
                volumeSeriesRef.current.update({
                    time: candleData.time,
                    value: Number(liveCandle.volume || 0),
                    color: candleData.close >= candleData.open
                        ? "rgba(38, 166, 154, 0.7)"
                        : "rgba(239, 83, 80, 0.7)"
                });
            }

        } catch (error) {
            console.error("[Chart] ❌ Error in live candle update:", error);
        }
    }, [liveCandle, chartType, showVolume, isChartReady]);



    // 🔥 مزامنة المؤشرات (التاريخية والجديدة)
    const updateVolumeSeries = useCallback((allCandles: any[]) => {
        if (!chartRef.current || !volumeSeriesRef.current || !showVolume) return;

        try {
            const volumeData = allCandles.map(c => {
                const time = toUTCTimestamp(c.time);
                const value = Number(c.volume || 0);
                const color = c.close >= c.open
                    ? "rgba(38, 166, 154, 0.7)"
                    : "rgba(239, 83, 80, 0.7)";

                return { time, value, color };
            });

            volumeSeriesRef.current.setData(volumeData);

            const volumes = allCandles.map(c => Number(c.volume || 0));
            const maxVolume = Math.max(...volumes, 1);



            chartRef.current.priceScale("volume").applyOptions({
                autoScale: true,
                scaleMargins: {
                    top: 0.8,
                    bottom: 0
                },

            });


        } catch (error) {
            console.error("[v0] ❌ Error updating volume:", error);
        }
    }, [showVolume]);

    // ⚡ تحديث نقاط المؤشرات الحية (Live Update)
    useEffect(() => {
        if (!indicatorManagerRef.current || !isChartReady || !liveCandle) return;


        const liveIndicatorsData = (liveCandle as any).indicators;


        if (liveIndicatorsData) {
            indicatorManagerRef.current.updateLiveIndicators({
                type: "price_update",
                live_candle: liveCandle,
                indicators: liveIndicatorsData
            });
        }
    }, [liveCandle, isChartReady]);



    useEffect(() => {
        if (!indicatorManagerRef.current || !isChartReady || !indicators) return;

        // console.log("🔄 [Chart] Syncing indicators from Store:", Object.keys(indicators));

        if (candlestickSeriesRef.current && !indicatorManagerRef.current.hasCandleSeries()) {
            indicatorManagerRef.current.setCandleSeries(candlestickSeriesRef.current);
            console.log("🎯 [Chart] Candle series set to IndicatorManager");
        }

        Object.entries(indicators).forEach(([key, data]) => {
            console.log(`📊 [Chart] Indicator "${key}" details:`, {
                name: data?.name,
                type: data?.type,
                valuesLength: data?.values?.length,
                valuesSample: data?.values ? {
                    first3: data.values.slice(0, 3),
                    last3: data.values.slice(-3),
                    hasNull: data.values.some(v => v === null),
                    nullCount: data.values.filter(v => v === null).length
                } : 'No values',
                metadata: data?.metadata,
                source: data?.source,
                isInitialData: data?.isInitialData,
                isHistorical: data?.isHistorical,
                isLiveUpdate: data?.isLiveUpdate,
                hasIndData: !!data?.indData,
                hasIndicatorsResults: !!data?.indicators_results,
                fullStructure: data
            });
        });

        // if (indicators.atr) {
        //     console.log("🔍 [Chart] ATR Detailed Analysis:", {
        //         id: 'atr',
        //         totalValues: indicators.atr.values?.length,
        //         first10Values: indicators.atr.values?.slice(0, 10),
        //         last10Values: indicators.atr.values?.slice(-10),
        //         nullValues: indicators.atr.values?.filter(v => v === null).length,
        //         validValues: indicators.atr.values?.filter(v => v !== null && !isNaN(v)).length,
        //         metadata: indicators.atr.metadata,
        //         source: indicators.atr.source
        //     });
        // }

        indicatorManagerRef.current.syncIndicators(indicators);

    }, [indicators, isChartReady]);





    const showLoader = isInitializing || (isLoading && candles.length === 0);


    return (
        <div className={`relative w-full h-full flex flex-col overflow-hidden ${containerClassName}`}>

            {/* منطقة الرسم البياني الرئيسية */}
            <div className="flex-1 relative w-full h-full bg-[#131722]">
                {showLoader && (
                    <ChartSkeletonLoader symbol={symbol} timeframe={timeframe} />
                )}


                {/* حاوية الكانفاس الخاص بالشارت */}
                <div ref={chartContainerRef} className="w-full h-full z-10" />

      
                {/* ========================================= */}
                {/*           🎨 طبقة الرسم (SVG Overlay)       */}
                {/* ========================================= */}
                {/* هذا الـ SVG يقوم بالتقاط أحداث الماوس ورسم الأشكال */}
                <svg
                    className="absolute inset-0 z-20 w-full h-full"
                    style={{ pointerEvents: drawingMode === 'cursor' && drawingMode !== 'crosshair' ? 'none' : 'auto' }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={() => { if (isDrawing) setIsDrawing(false); setCurrentDrawing(null); }}
                >
                    {/* رسم الأشكال المخزنة سابقاً */}
                    {drawings.map((drawing, index) => {
                        const startPx = getPixelsFromPoint(drawing.start.time, drawing.start.price);
                        const endPx = getPixelsFromPoint(drawing.end.time, drawing.end.price);
                        if (!startPx || !endPx) return null;

                        if (drawing.type === 'line' || drawing.type === 'trendline') {
                            return (
                                <line
                                    key={index}
                                    x1={startPx.x}
                                    y1={startPx.y}
                                    x2={endPx.x}
                                    y2={endPx.y}
                                    stroke="#2962ff"
                                    strokeWidth={2}
                                    fill="none"
                                />
                            );
                        }
                        if (drawing.type === 'rect') {
                            const x = Math.min(startPx.x, endPx.x);
                            const y = Math.min(startPx.y, endPx.y);
                            const w = Math.abs(endPx.x - startPx.x);
                            const h = Math.abs(endPx.y - startPx.y);
                            return (
                                <rect
                                    key={index}
                                    x={x}
                                    y={y}
                                    width={w}
                                    height={h}
                                    stroke="#2962ff"
                                    strokeWidth={2}
                                    fill="rgba(41, 98, 255, 0.2)"
                                    fillOpacity={0.2}
                                />
                            );
                        }
                        return null;
                    })}

                    {/* رسم الشكل الحالي أثناء السحب */}
                    {currentDrawing && (
                        <>
                            {currentDrawing.type === 'line' || currentDrawing.type === 'trendline' ? (
                                <line
                                    x1={currentDrawing.start.x}
                                    y1={currentDrawing.start.y}
                                    x2={currentDrawing.end.x}
                                    y2={currentDrawing.end.y}
                                    stroke="#ff9800"
                                    strokeWidth={2}
                                    strokeDasharray="5,5"
                                    fill="none"
                                />
                            ) : null}

                            {currentDrawing.type === 'rect' ? (
                                <rect
                                    x={Math.min(currentDrawing.start.x, currentDrawing.end.x)}
                                    y={Math.min(currentDrawing.start.y, currentDrawing.end.y)}
                                    width={Math.abs(currentDrawing.end.x - currentDrawing.start.x)}
                                    height={Math.abs(currentDrawing.end.y - currentDrawing.start.y)}
                                    stroke="#ff9800"
                                    strokeWidth={2}
                                    strokeDasharray="5,5"
                                    fill="rgba(255, 152, 0, 0.2)"
                                />
                            ) : null}
                        </>
                    )}
                </svg>
                {/* ========================================= */}


                {/* شريط أدوات الرسم */}
                <div className="absolute left-2 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-1">
                    <div className="flex flex-col bg-[#1e222d]/90 backdrop-blur-md border border-[#2a2e39] rounded-lg shadow-2xl p-1.5">
                        {tools.map((tool) => {
                            const Icon = tool.icon;
                            const isActive = drawingMode === tool.id;
                            return (
                                <button
                                    key={tool.id}
                                    onClick={() => onDrawingModeChange?.(tool.id)}
                                    title={tool.label}
                                    className={`
                                        w-9 h-9 rounded flex items-center justify-center transition-all duration-200
                                        ${isActive
                                            ? 'bg-[#2962ff] text-white shadow-[0_0_10px_rgba(41,98,255,0.5)]'
                                            : 'text-[#787b86] hover:bg-[#2a2e39] hover:text-white'
                                        }
                                    `}
                                >
                                    <Icon className="w-4 h-4" strokeWidth={2.5} />
                                </button>
                            )
                        })}

                        <div className="h-[1px] w-full bg-[#2a2e39] my-1" />

                        <button
                            onClick={() => {
                                setDrawings([]);
                                toast.success("تم مسح كل الرسومات")
                            }}
                            title="مسح الكل"
                            className="w-9 h-9 rounded flex items-center justify-center text-red-500 hover:bg-[#2a2e39] hover:text-red-400 transition-all duration-200"
                        >
                            <Trash2 className="w-4 h-4" strokeWidth={2} />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}