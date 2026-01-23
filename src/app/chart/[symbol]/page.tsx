


"use client"

import { useEffect, useCallback, useState, useRef } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { toast } from "react-hot-toast"
import { Settings, Share2, Eye, EyeOff, TrendingUp, TrendingDown, Maximize2, Activity, LayoutTemplate, X } from "lucide-react"
import { ChevronDown } from "lucide-react";
import { MarketOverviewDropdown } from "@/components/market-overview/MarketOverviewDropdown";

import { CandlestickChart } from "../../../components/charts/CandlestickChart/CandlestickChart"
import { IndicatorsPanel } from "../../../components/indicators/IndicatorsPanel/IndicatorsPanel"

import { Alert } from "../../../components/ui/Alert/Alert"
import { chartWebSocketService } from "@/services/api/chart-websocket.service"
import { useChartStore } from "@/stores/chart.store"
import { IndicatorManager } from "@/components/charts/indicators"
import { DrawingTools } from "@/components/charts/CandlestickChart/DrawingTools"
import { IChartApi } from "lightweight-charts"
import { Button } from "@/components/uiadv/button"

export default function ChartPage() {
    const router = useRouter()
    const params = useParams()
    const searchParams = useSearchParams()

    const symbol = params.symbol as string
    const market = (searchParams.get("market") as "crypto" | "stocks") || "crypto"
    const timeframe = searchParams.get("timeframe") || "1m"

    const urlTimeframe = searchParams.get("timeframe")

    // ✅ الحل: أولوية للوقت المنقضي من localStorage، ثم من الرابط
    const [currentTimeframe, setCurrentTimeframe] = useState(() => {
        if (typeof window !== 'undefined') {
            // دائمًا نأخذ القيمة المحفوظة من localStorage أولاً
            const savedTimeframe = localStorage.getItem('chart-timeframe');

            // إذا كان هناك timeframe في الرابط، نحدث localStorage به
            if (urlTimeframe) {
                localStorage.setItem('chart-timeframe', urlTimeframe);
                return urlTimeframe;
            }

            // إذا لم يكن هناك timeframe في الرابط، نستخدم القيمة المحفوظة
            return savedTimeframe || "1m";
        }
        return urlTimeframe || "1m";
    });


    useEffect(() => {
        // إذا لم يكن هناك timeframe في الرابط، نضيف الفريم المحفوظ
        if (!urlTimeframe && currentTimeframe) {
            router.replace(`/chart/${symbol}?market=${market}&timeframe=${currentTimeframe}`, { scroll: false });
        }
    }, [symbol, market, urlTimeframe, currentTimeframe, router]);


    
    const chartInstanceRef = useRef<IChartApi | null>(null)
    // UI State
    const [showIndicators, setShowIndicators] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
    const indicatorManagerRef = useRef<IndicatorManager | null>(null);
   
    const [drawingMode, setDrawingMode] = useState<string>("cursor") 
    const [showMarketOverview, setShowMarketOverview] = useState(false);


    // Store State & Actions (لم يتم تغيير أي شيء هنا)
    const {
        candles,
        indicators,
        isLoading,
        isConnected,
        currentPrice,
        liveCandle,
        previousLiveCandle,
        error,
        isInitialized,
        initializeChart,


        updateLiveCandle,
        updateIndicatorsFromServer,
        addIndicatorFromServer,
        closeLiveCandle,
        setLoading,
        setConnected,
        setError,
        setSymbol,
        setTimeframe,
        setMarket,
        removeIndicator,
        setIndicatorVisibility,
    } = useChartStore()



    // WebSocket & Data Logic (منطق البيانات كما هو دون تغيير)
    useEffect(() => {

        setSymbol(symbol)
      
        setTimeframe(currentTimeframe);
        setMarket(market)
        setLoading(true)

        chartWebSocketService.connectToChart(symbol, currentTimeframe, market, {
            onChartInitialized: (data) => {

                initializeChart(data)
            },

            onPriceUpdate: (data) => {
                console.log("[v0] ⚡ [Page] Price update callback triggered:", {
                    hasLiveCandle: !!data.live_candle,
                    hasIndicators: !!data.indicators,
                })

                if (data.live_candle) {
                    updateLiveCandle(data.live_candle, data.indicators)
                    setLastUpdate(new Date())

                    if (data.indicators) {
                        Object.entries(data.indicators).forEach(([name, indData]: [string, any]) => { });
                    }

                } else {
                    console.warn("[v0] ⚠️ [Page] Price update received but no live_candle data")
                }
            },

            onCandleClose: (data) => {
                console.log("[v0] 🔒 [Page] Candle close callback triggered:", {
                    hasCandle: !!data.candle,
                    hasIndicators: !!data.indicators,
                })

                if (data.candle) {
                    closeLiveCandle(data.candle, data.indicators)
                    setLastUpdate(new Date())
                    useChartStore.getState().updateIndicatorsFromServer(data.indicators);

                } else {
                    console.warn("[v0] ⚠️ [Page] Candle close received but no candle data")
                }
            },

            

            onIndicatorAdded: (data) => {

                const { indicators_results } = data;
                if (indicators_results) {
                    Object.entries(indicators_results).forEach(([name, indData]: [string, any]) => {
                        useChartStore.getState().addIndicatorFromServer(name, indData);
                    });
                }

                const indicatorsResults = data.indicators_results;
                if (!indicatorsResults) return;

                Object.entries(indicatorsResults).forEach(([name, indData]: [string, any]) => {
                    useChartStore.getState().addIndicatorFromServer(name, indData);
                    const id = name.toLowerCase();

                    if (id === "atr") {
                        indicatorManagerRef.current?.handleATR(id, {
                            indicators_results: { atr: indData }
                        });
                    }
                });

                toast.success(`تمت إضافة ${data.indicator || "المؤشر"}`);
            },


            onIndicatorUpdated: (data) => {
                console.log("[v0] ✏️ [Page] Indicator updated from server:", data);

                if (data.indicators_results) {
                    // ✅ استخدام updateIndicatorsFromServer لإجبار تحديث البيانات التاريخية بالكامل
                    const store = useChartStore.getState();
                    store.updateIndicatorsFromServer(data.indicators_results);

                    // ✅ إجبار مدير الشارت على المزامنة فوراً لرسم البيانات الجديدة
                    if (indicatorManagerRef.current) {
                        const updatedIndicators = store.indicators;
                        indicatorManagerRef.current.syncIndicators(updatedIndicators);
                    }
                }
                toast.success(`تم تحديث المؤشر ${data.indicator}`);
            },

            onIndicatorRemoved: (data) => {
                console.log("[v0] 🗑️ [Page] Indicator removed from server:", data);

                // ✅ الحل الصحيح: تحديث الـ Store فقط
                const store = useChartStore.getState();
                const indicatorId = data.indicator_name || data.indicator;

                // الحذف من الـ Store سيقوم بإشعار مكون CandlestickChart
                // والذي سيقوم بدوره باستدعاء syncIndicators لإزالة الخطوط تلقائياً
                if (indicatorId) {
                    store.removeIndicator(indicatorId);
                }

                toast.success(`تم حذف المؤشر`);
            },


            onConnected: () => {

                setConnected(true)
                setError(null)
            },

            onDisconnected: () => {

                setConnected(false)
            },

            onError: (err) => {

                setError("خطأ في الاتصال بالخادم")
            },
        })



        return () => {

            chartWebSocketService.disconnect()
        }
    }, [symbol, market, currentTimeframe])



    // Handlers (دون تغيير في المنطق)
    const handleTimeframeChange = useCallback(
        (newTimeframe: string) => {
            localStorage.setItem('chart-timeframe', newTimeframe);

            setCurrentTimeframe(newTimeframe);

            chartWebSocketService.disconnect()
            router.push(`/chart/${symbol}?market=${market}&timeframe=${newTimeframe}`)
        },
        [symbol, market, router],
    )


    const activeIndicatorsList = Object.entries(indicators).map(([id, data]) => ({
        id: id,
        name: data.name || id, // الاسم الظاهر
        type: data.type || 'line',
        visible: data.visible !== false,
        // color: data.color || '#2962FF'
    }));



    const handleToggleIndicator = useCallback((id: string, isVisible: boolean) => {
        // 1. تحديث حالة المؤشر في الـ Store
        setIndicatorVisibility(id, isVisible);

        // 2. 🔥 هذا السطر مهم جداً - يجب إضافته!
        indicatorManagerRef.current?.toggleIndicatorVisibility(id, isVisible);

        // 3. إشعار المستخدم
        toast.success(isVisible ? `تم إظهار المؤشر` : `تم إخفاء المؤشر`);
    }, [symbol, setIndicatorVisibility]);


    const handleAddIndicator = useCallback(
        (indicatorConfig: any) => {

            if (!isConnected) {
                toast.error("غير متصل بالخادم")
                return
            }
            chartWebSocketService.addIndicator(symbol, indicatorConfig)
            toast.success(`جاري إضافة ${indicatorConfig.name}`)
        },
        [symbol, isConnected],
    )

    const handleRemoveIndicator = useCallback(
        (indicatorId: string) => {

            if (!isConnected) {
                toast.error("غير متصل بالخادم")
                return
            }
            chartWebSocketService.removeIndicator(symbol, indicatorId)
            toast.success("تم حذف المؤشر")
        },
        [symbol, isConnected],
    )


    const handleUpdateIndicator = useCallback((name: string, params: any) => {
        if (!isConnected) {
            toast.error("غير متصل بالخادم")
            return
        }
        chartWebSocketService.updateIndicator(symbol, name, params)
        toast.success("تم تحديث المؤشر")
    }, [symbol, isConnected])


    const handleSaveLayout = useCallback(() => {
        const layout = { symbol, timeframe: currentTimeframe, market, indicators }
        localStorage.setItem(`chart_layout_${symbol}`, JSON.stringify(layout))
        toast.success("تم حفظ الإعدادات")
    }, [symbol, currentTimeframe, market, indicators])

    const handleShareChart = useCallback(() => {
        navigator.clipboard.writeText(window.location.href)
        toast.success("تم نسخ الرابط")
    }, [])

    // --- تم التعديل هنا لحل مشكلة الخروج من ملء الشاشة ---
    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
            setIsFullscreen(true)
        } else {
            document.exitFullscreen()
            setIsFullscreen(false)

            // إصلاح مشكلة التصميم عند الخروج من ملء الشاشة
            // نستخدم setTimeout لمنح المتصفح وقتاً للخروج من الوضع وتحديث الحاويات
            // ثم نقوم بتشغيل حدث resize لإجبار الـ Chart على إعادة حساب أبعاده الصحيحة داخل الـ Sidebar
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 100);
        }
    }, [])
    // ----------------------------------------------------------

    const timeframeButtons = [

        { label: "1m", value: "1m" },
        { label: "2m", value: "2m" },
        { label: "3m", value: "3m" },
        { label: "5m", value: "5m" },
        { label: "10m", value: "10m" },
        { label: "15m", value: "15m" },
        { label: "30m", value: "30m" },
        { label: "1h", value: "1h" },
        { label: "2h", value: "2h" },
        { label: "3h", value: "3h" },
        { label: "6h", value: "6h" },
        { label: "12h", value: "12h" },
        { label: "1D", value: "1d" },
        { label: "2D", value: "2d" },
        { label: "3D", value: "3d" },
        { label: "1W", value: "1w" },
        { label: "2W", value: "2w" },
        { label: "1M", value: "1M" },
    ];

    


    const formatPrice = (price: number) => {
        if (price === 0) return "0.00";

        if (price < 0.001) return price.toFixed(8);
        if (price < 0.01) return price.toFixed(6);
        if (price < 0.1) return price.toFixed(5);
        if (price < 1) return price.toFixed(4);
        if (price < 2) return price.toFixed(3);

        return price.toFixed(2);
    };


    // TradingView-like Color Helpers
    const getPriceColor = () => {
        if (!currentPrice) return "text-gray-400"
        return currentPrice.change >= 0 ? "text-green-500" : "text-red-500"
    }


    return (
   
        <div className={`flex flex-col h-full bg-[#131722] text-[#d1d4dc] font-sans select-none min-w-0 overflow-hidden ${isFullscreen ? "fixed inset-0 z-50" : ""}`}>

            {/* Error Alert Overlay */}
            {error && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[60] w-full max-w-md px-4 pointer-events-none">
                    <div className="pointer-events-auto">
                        <Alert type="error" title="خطأ" message={error} onClose={() => setError(null)} />
                    </div>
                </div>
            )}

 
            {/* --- Header Toolbar --- */}
            <header className="h-12 bg-[var(--header-bg)] border-b border-border flex items-center justify-between px-2 md:px-4 shrink-0 z-50 shadow-lg relative">

                {/* Left: Symbol Info */}
                <div className="flex items-center gap-4 min-w-0">
                    <button
                        onClick={() => setShowMarketOverview(!showMarketOverview)}
                        className="flex items-center gap-2 hover:bg-muted px-2 py-1 rounded transition-colors group"
                    >
                        <h1 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate">
                            {symbol}
                        </h1>
                        <ChevronDown
                            className={`w-4 h-4 text-muted-foreground transition-transform ${showMarketOverview ? "rotate-180" : ""
                                }`}
                        />
                    </button>

                    {currentPrice && (
                        <div className="flex items-center gap-3">
                            <span className="text-lg font-medium text-foreground font-mono tracking-tight">
                                {formatPrice(currentPrice.price)}
                            </span>
                            <div
                                className={`hidden md:flex items-center gap-1 text-xs font-bold font-mono px-1.5 py-0.5 rounded ${currentPrice.change >= 0
                                        ? "bg-green-500/10 dark:bg-green-500/20"
                                        : "bg-red-500/10 dark:bg-red-500/20"
                                    }`}
                            >
                                {currentPrice.change >= 0 ? (
                                    <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
                                ) : (
                                    <TrendingDown className="w-3 h-3 text-red-600 dark:text-red-400" />
                                )}
                                <span
                                    className={
                                        currentPrice.change >= 0
                                            ? "text-green-600 dark:text-green-400"
                                            : "text-red-600 dark:text-red-400"
                                    }
                                >
                                    {currentPrice.change >= 0 ? "+" : ""}
                                    {currentPrice.change.toFixed(2)}%
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Center: Timeframes */}
                <div className="flex items-center bg-muted rounded p-0.5 mx-2 overflow-x-auto max-w-full no-scrollbar">
                    {timeframeButtons.map((tf) => (
                        <button
                            key={tf.value}
                            onClick={() => handleTimeframeChange(tf.value)}
                            className={`px-3 py-1 text-xs font-medium rounded transition-all duration-200 whitespace-nowrap ${timeframe === tf.value
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                }`}
                        >
                            {tf.label}
                        </button>
                    ))}
                </div>

                {/* Right: Toolbar Actions */}
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowIndicators(!showIndicators)}
                        className={`h-8 w-8 p-0 rounded hover:bg-muted text-muted-foreground ${showIndicators ? "text-primary" : ""
                            }`}
                        title="المؤشرات"
                    >
                        <LayoutTemplate className="w-4 h-4" />
                    </Button>

                    <div className="w-px h-5 bg-border mx-1" />

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSaveLayout}
                        className="h-8 w-8 p-0 rounded hover:bg-muted text-muted-foreground"
                        title="حفظ التخطيط"
                    >
                        <Settings className="w-4 h-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleFullscreen}
                        className="h-8 w-8 p-0 rounded hover:bg-muted text-muted-foreground"
                        title={isFullscreen ? "خروج من ملء الشاشة" : "ملء الشاشة"}
                    >
                        <Maximize2 className="w-4 h-4" />
                    </Button>
                </div>
            </header>

            {/* Market Overview Dropdown */}
            <MarketOverviewDropdown
                isOpen={showMarketOverview}
                onClose={() => setShowMarketOverview(false)}
                currentSymbol={symbol}
            />


            {showIndicators && (
                <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center">
                    <div className="w-[90vw] max-w-[900px] max-h-[80vh] bg-card border border-border rounded-lg shadow-2xl flex flex-col animate-scale-in">
                        {/* Header */}
                        <div className="h-12 flex items-center justify-between px-4 border-b border-border">
                            <h2 className="font-semibold text-foreground text-sm flex items-center gap-2">
                                <Activity className="w-4 h-4 text-primary" />
                                المؤشرات الفنية
                            </h2>
                            <button
                                onClick={() => setShowIndicators(false)}
                                className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4">
                            <IndicatorsPanel
                                chartId={`${symbol}_${timeframe}`}
                                symbol={symbol}
                                onIndicatorAdd={handleAddIndicator}
                                activeIndicators={activeIndicatorsList}
                                onIndicatorRemove={handleRemoveIndicator}
                                onIndicatorUpdate={handleUpdateIndicator}
                                onIndicatorToggle={handleToggleIndicator}
                                compact={false}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* --- Main Content Area --- */}
            {/* --- Main Content Area --- */}
            <div className="flex flex-1 overflow-hidden relative z-0 min-w-0">


                {/* Chart Area */}
                <div className="flex-1 bg-[#131722] relative h-full w-full z-0 min-w-0">

                    {/* التعديل 2: إضافة key={`${symbol}_${timeframe}_${market}`} */}
                    {/* هذا سيقوم بإعادة رسم الشارت بالكامل عند تغيير العملة أو الفريم لتجنب المشاكل */}
                    <CandlestickChart
                        key={`${symbol}_${timeframe}_${market}`}
                        symbol={symbol}
                        timeframe={timeframe}
                        containerClassName="h-full w-full"
                        showToolbar={false}
                        showDrawingTools={false} // تم إيقافه هنا لأنه الآن في الصفحة
                        showVolume={true}
                        onIndicatorAdd={handleAddIndicator}
                        onIndicatorRemove={handleRemoveIndicator}
                        onIndicatorToggle={handleToggleIndicator}
                        onIndicatorManagerReady={(manager) => {
                            indicatorManagerRef.current = manager;
                        }}
                        drawingMode={drawingMode}
                        onDrawingModeChange={setDrawingMode}


                    />
                </div>

            </div>

         

        </div>
    )
}