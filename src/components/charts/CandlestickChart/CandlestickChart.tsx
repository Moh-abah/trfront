//@ts-nocheck



"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback, useMemo } from "react"

import {
    createChart,
    ColorType,
    CandlestickSeries,
    HistogramSeries,
    BarSeries,
    LineSeries,
    AreaSeries,
    LineStyle,
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
import toast from "react-hot-toast"


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
    // مصفوفة ثابتة من القيم الصحيحة (بدون كسور)
    const barValues = [
        // [upperWick, candleHeight%, lowerWick, isUp]
        [5, 45, 3, true],
        [3, 72, 6, false],
        [8, 38, 2, true],
        [2, 65, 7, false],
        [7, 52, 4, true],
        [4, 78, 3, false],
        [6, 41, 5, true],
        [3, 68, 8, false],
        [9, 34, 2, true],
        [2, 71, 6, true],
        [5, 49, 4, false],
        [7, 56, 3, true],
        [3, 63, 7, false],
        [8, 42, 2, true],
        [4, 75, 5, false],
        [6, 58, 3, true],
        [2, 67, 8, false],
        [9, 36, 1, true],
        [5, 54, 4, true],
        [3, 79, 6, false],
        [7, 47, 3, true],
        [4, 62, 7, false],
        [8, 39, 2, true],
        [2, 73, 5, true],
        [6, 51, 4, false],
        [3, 66, 8, false],
        [9, 37, 1, true],
        [5, 59, 3, true],
        [2, 74, 6, false],
        [7, 44, 2, true],
        [4, 61, 7, false],
        [8, 48, 3, true],
        [3, 69, 5, true],
        [6, 53, 4, false],
        [2, 76, 8, false],
        [9, 35, 1, true],
        [5, 57, 3, true],
        [3, 64, 6, false],
        [7, 46, 2, true],
        [4, 70, 5, false]
    ];

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
                        const [upperWick, candleHeight, lowerWick, isUp] = barValues[i] || [5, 50, 5, true];
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
                                    style={{ height: `${upperWick}px` }}
                                ></div>

                                {/* الجسم */}
                                <div
                                    className={`w-full rounded-sm ${isUp ? 'bg-emerald-500/30' : 'bg-red-500/30'}`}
                                    style={{ height: `${candleHeight}%` }}
                                ></div>

                                {/* الفتيل السفلي */}
                                <div
                                    className="w-px bg-slate-600"
                                    style={{ height: `${lowerWick}px` }}
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

export default ChartSkeletonLoader;


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



    // أضف مع rest of states
    const [crosshairData, setCrosshairData] = useState<{
        price?: number;
        time?: string;
        candle?: any;
    }>({});

    const [showCrosshairData, setShowCrosshairData] = useState(true);


    // أضف هذه الدالة داخل المكون
    const formatNumber = (num: number | undefined, decimals: number = 2): string => {
        if (num === undefined || num === null) {
            return '0.00';
        }
        return num.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    };

    // 🔥 دالة للتعامل مع toggle visibility
    const handleToggleIndicator = useCallback((indicatorId: string, isVisible: boolean) => {

        if (indicatorManagerRef.current) {
            indicatorManagerRef.current.toggleIndicatorVisibility(indicatorId, isVisible);

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
                vertLine: {
                    color: chartConfig.crosshair.vertLine.color,
                    visible: chartConfig.crosshair.vertLine.visible,

                    width: chartConfig.crosshair.vertLine.width ?? 1,
                    style: LineStyle.Dashed, // أو Solid، حسب ما تريد
                },
                horzLine: {
                    color: chartConfig.crosshair.horzLine.color,
                    visible: chartConfig.crosshair.horzLine.visible,
                    width: chartConfig.crosshair.horzLine.width ?? 1,
                    style: LineStyle.Solid,
                },
            },
            timeScale: {
                borderColor: chartConfig.timeScale.borderColor,
                timeVisible: true,
                // secondsVisible: timeframe === "1m",
                secondsVisible: timeframe.endsWith('s'),
                borderVisible: true,
                rightOffset: 15,
                barSpacing: barSpacing,
                minBarSpacing: 0.5,
                fixLeftEdge: false,
                fixRightEdge: false,
                shiftVisibleRangeOnNewBar: true,
                uniformDistribution: true,
                allowShiftVisibleRangeOnWhitespaceReplacement: true,
                tickMarkFormatter: (time: UTCTimestamp) => {
                    const date = new Date(time * 1000);

                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

         
                    const monthName = monthNames[date.getMonth()];
                    const dayOfMonth = date.getDate().toString().padStart(2, '0');
                    const dayName = dayNames[date.getDay()];

                    // دالة التنسيق الإنجليزية 12 ساعة
                    const formatTime12 = (withSeconds: boolean) => {
                        return date.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            second: withSeconds ? '2-digit' : undefined,
                            hour12: true
                        });
                    };

                    const timeStr = formatTime12(false);      // مثال: 3:30 PM
                    const timeStrWithSec = formatTime12(true); // مثال: 3:30:45 PM

                    // بناء الصيغ النهائية
                    const baseFormat = `${monthName} ${dayOfMonth} ${dayName} ${timeStr}`;
                    const fullFormat = `${monthName} ${dayOfMonth} ${dayName} ${timeStrWithSec}`;

                    // المنطق الشرطي بناءً على الفريم (Timeframe)
                    if (timeframe.endsWith('s')) {
                        return fullFormat;
                    }
                    else if (timeframe.endsWith('m') || timeframe.endsWith('h')) {
                        return baseFormat;
                    }
                    else if (timeframe.endsWith('d') || timeframe.endsWith('w')) {
                        return `${monthName} ${dayOfMonth} ${dayName}`;
                    }
                    else if (timeframe.endsWith('M')) {
                        return `${monthName} ${date.getFullYear()}`;
                    }

                    return baseFormat;
                }
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
                    return date.toLocaleTimeString('en - US', { // استخدم 'en-US' إذا أردت AM/PM بالإنجليزية
                        hour: '2-digit',
                        minute: '2-digit',
                        second: timeframe.endsWith('s') ? '2-digit' : undefined,
                        hour12: true, // تفعيل نظام 12 ساعة
                    });
                },
                dateFormatter: (time: UTCTimestamp) => new Date(time * 1000).toLocaleDateString('en - US'),
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

        // واستبدله بـ:
        chart.subscribeCrosshairMove((param: MouseEventParams) => {
            onCrosshairMove?.(param);

            // 1. التحقق من وجود بيانات
            if (!param.time || !param.point) {
                setCrosshairData({});
                return;
            }

            // 2. الحصول على بيانات الشمعة مباشرة (Direct Map Access)
            const candlestickSeries = candlestickSeriesRef.current;
            if (!candlestickSeries) return;


            const volumeSeries = volumeSeriesRef.current;
            const volumeData = volumeSeries ? param.seriesData.get(volumeSeries) as any : null;


            // في v5.1 نستخدم seriesData.get() وهو يعيد كائن البيانات كاملاً
            const data = param.seriesData.get(candlestickSeries);

            // التحقق من أن البيانات هي شمعة (OHLC)
            if (!data || !('close' in data)) {
                setCrosshairData({});
                return;
            }

            // 3. معالجة الوقت بذكاء (تجاوز خطأ الـ BusinessDay و string)
            let timestamp: number;
            const time = param.time;

            if (typeof time === 'number') {
                timestamp = time;
            } else if (typeof time === 'string') {
                timestamp = new Date(time).getTime() / 1000;
            } else {
                // هنا TypeScript سيعرف أن time هو BusinessDay تلقائياً
                timestamp = Date.UTC(time.year, time.month - 1, time.day) / 1000;
            }

            // 4. تنسيق التاريخ (Readable Format)
            const date = new Date(timestamp * 1000);
            const timeStr = date.toLocaleString('en-GB', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: timeframe.endsWith('s') ? '2-digit' : undefined,
                hour12: true,
            });


            const formatVolume = (vol: number) => {
                if (vol >= 1000000) return (vol / 1000000).toFixed(2) + 'M';
                if (vol >= 1000) return (vol / 1000).toFixed(2) + 'K';
                return vol.toFixed(0);
            };


            // 5. الحصول على قيم المؤشرات تلقائياً (Indicators)
            const indicators: Record<string, any> = {};
            if (indicatorSeriesRefs.current) {
                Object.entries(indicatorSeriesRefs.current).forEach(([key, series]) => {
                    const indicatorData = param.seriesData.get(series as any);
                    if (indicatorData) {
                        // إذا كان مؤشر خطي سيحتوي على 'value'
                        indicators[key] = (indicatorData as any).value ?? indicatorData;
                    }
                });
            }

            // تحديث الـ State ببيانات نظيفة وجاهزة
            setCrosshairData({
                time: timeStr,
                price: data.close,
                candle: data, // يحتوي على {open, high, low, close}
                indicators: indicators,
                volume: volumeData ? {
                    raw: volumeData.value, // القيمة الخام (رقم)
                    formatted: formatVolume(volumeData.value) // القيمة المنسقة (نص)
                } : null

                
            });
        });
        
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

                const rsiScale = chartRef.current.priceScale("rsi_scale");
                if (rsiScale) {
                    // احتفظ بـ scaleMargins الحالية، فقط عدل autoScale والحدود
                    const currentOptions = rsiScale.options();
                    rsiScale.applyOptions({
                        autoScale: false,
                        minimum: 0,
                        maximum: 100,
                        borderVisible: true,
                        // ⚠️ لا تعيد تعيين scaleMargins
                    });
                }
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
    }, [theme, height, onChartReady, onCrosshairMove, timeframe])

    
   

    // ✅ منطق إظهار وإخفاء الفوليوم ديناميكياً
    useEffect(() => {
        // إذا لم يكن الشارت جاهزاً لا نفعل شيئاً
        if (!chartRef.current || !isChartReady) return;

        if (showVolume) {
            // الحالة: تفعيل الفوليوم
            if (!volumeSeriesRef.current) {
                // إنشاء سلسلة الفوليوم إذا لم تكن موجودة
                const volumeSeries = chartRef.current.addSeries(HistogramSeries, {
                    priceFormat: { type: "volume" },
                    priceScaleId: "volume",
                    color: "rgba(38, 166, 154, 0.5)",
                    priceLineVisible: false,
                    lastValueVisible: false,
                });

                volumeSeriesRef.current = volumeSeries;

                // ضبط إعدادات المقياس
                chartRef.current.priceScale("volume").applyOptions({
                    scaleMargins: {
                        top: 0.8,
                        bottom: 0,
                    },
                });

                // ملء الفوليوم بالبيانات التاريخية فور إضافته
                if (candles && candles.length > 0) {
                    const volumeData = candles.map(c => {
                        const time = toUTCTimestamp(c.time);
                        const value = Number(c.volume || 0);
                        const color = c.close >= c.open
                            ? "rgba(38, 166, 154, 0.5)"
                            : "rgba(239, 83, 80, 0.5)";
                        return { time, value, color };
                    });
                    volumeSeries.setData(volumeData);
                }
            }
        } else {
            // الحالة: إخفاء الفوليوم
            if (volumeSeriesRef.current) {
                // إزالة السلسلة من الشارت
                chartRef.current.removeSeries(volumeSeriesRef.current);
                volumeSeriesRef.current = null;
            }
        }
    }, [showVolume, isChartReady, candles]);



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
                volume: Number(c.volume  || 0),
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

        }

        // Object.entries(indicators).forEach(([key, data]) => {
        //     console.log(`📊 [Chart] Indicator "${key}" details:`, {
        //         name: data?.name,
        //         type: data?.type,
        //         valuesLength: data?.values?.length,
        //         valuesSample: data?.values ? {
        //             first3: data.values.slice(0, 3),
        //             last3: data.values.slice(-3),
        //             hasNull: data.values.some(v => v === null),
        //             nullCount: data.values.filter(v => v === null).length
        //         } : 'No values',
        //         metadata: data?.metadata,
        //         source: data?.source,
        //         isInitialData: data?.isInitialData,
        //         isHistorical: data?.isHistorical,
        //         isLiveUpdate: data?.isLiveUpdate,
        //         hasIndData: !!data?.indData,
        //         hasIndicatorsResults: !!data?.indicators_results,
        //         fullStructure: data
        //     });
        // });

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




                {/* ========================================= */}
                {/* عرض بيانات المؤشر عند التحريك         */}
                {/* ========================================= */}
                {showCrosshairData && crosshairData.candle && (
                    <div className="absolute top-4 left-4 bg-[#131722]/90 backdrop-blur-md border border-[#2A2E39] rounded-lg shadow-2xl p-3 min-w-[220px] pointer-events-none z-30 transition-all">
                        {/* الوقت والنسبة المئوية */}
                        <div className="flex items-center justify-between mb-2 border-b border-gray-700/50 pb-2">
                            <span className="text-[11px] font-mono text-gray-400">{crosshairData.time}</span>
                            {crosshairData.candle.open && crosshairData.candle.close && (
                                <span className={`text-[11px] font-bold ${(crosshairData.candle.close - crosshairData.candle.open) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {(((crosshairData.candle.close - crosshairData.candle.open) / crosshairData.candle.open) * 100).toFixed(2)}%
                                </span>
                            )}
                        </div>

                        {/* شبكة بيانات OHLC */}
                        <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 text-[11px]">
                            <div className="flex justify-between">
                                <span className="text-gray-500">O</span>
                                <span className="text-gray-200 font-mono">{formatNumber(crosshairData.candle.open)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">H</span>
                                <span className="text-gray-200 font-mono">{formatNumber(crosshairData.candle.high)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">L</span>
                                <span className="text-gray-200 font-mono">{formatNumber(crosshairData.candle.low)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">C</span>
                                <span className={`font-mono ${(crosshairData.candle.close >= crosshairData.candle.open) ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {formatNumber(crosshairData.candle.close)}
                                </span>
                            </div>
                                {/* 
                           عرض الفوليوم المنسق (K, M) *
                            {crosshairData.volume && (
                                <div className="col-span-2 flex justify-between mt-1 pt-1 border-t border-gray-800/50">
                                    <span className="text-gray-500">Vol</span>
                                    <span className="text-gray-200 font-mono">{crosshairData.volume.formatted}</span>
                                </div>
                            )} */}
                        </div>

                        {/* عرض المؤشرات ديناميكياً (RSI, MACD, etc.) */}
                        {crosshairData.indicators && Object.keys(crosshairData.indicators).length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-800/50 space-y-1">
                                {Object.entries(crosshairData.indicators).map(([name, value]) => (
                                    <div key={name} className="flex justify-between text-[11px]">
                                        <span className="text-blue-400 uppercase font-semibold">{name}</span>
                                        <span className="text-gray-200 font-mono">
                                            {typeof value === 'number' ? value.toFixed(2) : '-'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                

            </div>

            
        </div>
    )
}

