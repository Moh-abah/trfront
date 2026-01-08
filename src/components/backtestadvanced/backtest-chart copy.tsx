// // @ts-nocheck
// 'use client';

// import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/uiadv/card';
// import { Button } from '@/components/uiadv/button';
// import { Badge } from '@/components/uiadv/badge';
// import { Checkbox } from '@/components/uiadv/checkbox';
// import { Label } from '@/components/uiadv/label';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/uiadv/tabs';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/uiadv/table';
// import {
//   createChart,
//   CrosshairMode,
//   LineSeries,
//   CandlestickSeries,
//   HistogramSeries,
//   IChartApi,
//   ISeriesApi,
//   Time,
//   MouseEventParams,
// } from 'lightweight-charts';
// import {
//   TrendingUp,
//   TrendingDown,
//   Play,
//   Pause,
//   Maximize2,
//   Layers,
//   Download,
//   Info,
//   Activity,
//   BarChart3,
//   DollarSign,
//   Target,
//   X,
//   Filter,
//   ZoomIn,
//   ZoomOut,
//   RefreshCw
// } from 'lucide-react';
// import { VisualCandle, TradeMarker, BacktestSummary } from '@/types/backtest';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/uiadv/select';
// import { Separator } from '@/components/uiadv/separator';

// // --- Types & Interfaces ---

// interface BacktestChartProps {
//   candles: VisualCandle[];
//   tradeMarkers: TradeMarker[];
//   equityCurve?: number[];
//   drawdownCurve?: number[];
//   availableIndicators: string[];
//   symbol: string;
//   timeframe: string;
//   summary?: BacktestSummary;
//   onStartPlay?: () => void;
//   onStopPlay?: () => void;
//   isPlaying?: boolean;
//   onExport?: () => void;
// }

// interface IndicatorState {
//   name: string;
//   enabled: boolean;
//   color: string;
//   lineWidth: number;
//   lineStyle: number;
// }

// // --- Constants ---

// const INDICATOR_COLORS = [
//   '#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444',
//   '#06B6D4', '#EC4899', '#84CC16', '#F97316', '#6366F1',
// ];

// // --- Helper Functions ---

// function getCategoryForIndicator(indicator: string): string {
//   const lowerIndicator = indicator.toLowerCase();
//   if (lowerIndicator.includes('sma') || lowerIndicator.includes('ema')) return 'اتجاه';
//   if (lowerIndicator.includes('rsi') || lowerIndicator.includes('macd')) return 'زخم';
//   if (lowerIndicator.includes('bollinger')) return 'تقلب';
//   if (lowerIndicator.includes('volume')) return 'حجم';
//   return 'عام';
// }

// function getIndicatorDescription(indicator: string): string {
//   const lowerIndicator = indicator.toLowerCase();
//   if (lowerIndicator.includes('sma')) return 'المتوسط المتحرك البسيط';
//   if (lowerIndicator.includes('rsi')) return 'مؤشر القوة النسبية';
//   if (lowerIndicator.includes('macd')) return 'تقارب المتوسطات المتحركة';
//   return 'مؤشر تقني';
// }

// // دالة مهمة: تحديد ما إذا كان المؤشر فوق السعر أو في لوحة منفصلة
// function getIndicatorLayout(indicatorName: string): 'overlay' | 'separate' {
//   const name = indicatorName.toLowerCase();

//   // المؤشرات التي عادةً تتداخل مع السعر (Overlay)
//   if (name.includes('sma') || name.includes('ema') || name.includes('wma') ||
//     name.includes('bollinger') || name.includes('vwap')) {
//     return 'overlay';
//   }

//   // المؤشرات التي تحتاج لوحة منفصلة (Separate)
//   if (name.includes('rsi') || name.includes('stochastic') || name.includes('macd') ||
//     name.includes('atr') || name.includes('cci') || name.includes('ao')) {
//     return 'separate';
//   }

//   return 'separate'; // الافتراضي: لوحة منفصلة للسلامة
// }

// function formatNumber(num: number | undefined, decimals: number = 2): string {
//   if (num === undefined || num === null) return '0.00';
//   return num.toLocaleString('en-US', {
//     minimumFractionDigits: decimals,
//     maximumFractionDigits: decimals,
//   });
// }

// function formatPercent(num: number | undefined | null): string {
//   if (num === undefined || num === null || isNaN(num)) return '+0.00%';
//   return `${num >= 0 ? '+' : ''}${formatNumber(num)}%`;
// }

// // --- Main Component ---

// export function BacktestChart({
//   candles,
//   tradeMarkers,
//   equityCurve,
//   drawdownCurve,
//   availableIndicators,
//   symbol,
//   timeframe,
//   summary,
//   onStartPlay,
//   onStopPlay,
//   isPlaying,
//   onExport
// }: BacktestChartProps) {
//   // Refs
//   const chartContainerRef = useRef<HTMLDivElement>(null);
//   const chartRef = useRef<IChartApi | null>(null);
//   const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
//   const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

//   // Maps
//   const indicatorSeriesRef = useRef<Map<string, ISeriesApi<'Line'>>>(new Map());
//   const priceScalesRef = useRef<Map<string, { top: number; bottom: number }>>(new Map());

//   // State
//   const [selectedIndicators, setSelectedIndicators] = useState<IndicatorState[]>([]);
//   const [chartType, setChartType] = useState<'candlestick' | 'line'>('candlestick');
//   const [lineChartMode, setLineChartMode] = useState<'equity' | 'drawdown'>('equity');
//   const [showVolume, setShowVolume] = useState(true);
//   const [showTrades, setShowTrades] = useState(true);
//   const [showCrosshairData, setShowCrosshairData] = useState(true);
//   const [activeTab, setActiveTab] = useState<'chart' | 'performance' | 'trades' | 'indicators'>('chart');
//   const [crosshairData, setCrosshairData] = useState<{ price?: number; time?: string; candle?: VisualCandle }>({});
//   const [selectedTrade, setSelectedTrade] = useState<TradeMarker | null>(null);
//   const [isFullscreen, setIsFullscreen] = useState(false);

//   // --- Data Extraction ---

//   const extractedIndicators = useMemo(() => {
//     const indicators = new Set<string>();
//     candles.forEach(candle => {
//       Object.keys(candle).forEach(key => {
//         if (key.startsWith('ind_')) {
//           indicators.add(key.replace('ind_', ''));
//         }
//       });
//       if (candle.indicators) {
//         Object.keys(candle.indicators).forEach(key => {
//           if (key.startsWith('ind_')) {
//             indicators.add(key.replace('ind_', ''));
//           }
//         });
//       }
//     });
//     return Array.from(indicators);
//   }, [candles]);

//   // --- Core Functions ---

//   // 1. Safe Remove Chart
//   const safeRemoveChart = useCallback(() => {
//     if (chartRef.current) {
//       try {
//         chartRef.current.remove();
//       } catch (error) {
//         console.log('Chart already disposed');
//       }
//       chartRef.current = null;
//       candlestickSeriesRef.current = null;
//       volumeSeriesRef.current = null;
//       indicatorSeriesRef.current.clear();
//       priceScalesRef.current.clear();
//     }
//   }, []);

//   // 2. Calculate Dynamic Layout (منطق التخطيط الجديد)
//   const calculateLayout = useCallback(() => {
//     // إعادة تعيين الذاكرة لتسريح المراجع القديمة
//     priceScalesRef.current.clear();

//     // المساحات الافتراضية (يمكن تعديلها حسب الرغبة)
//     const mainChartTop = 0;
//     const mainChartBottom = 0.5; // الشموع تأخذ النصف العلوي

//     priceScalesRef.current.set('main', { top: mainChartTop, bottom: mainChartBottom });

//     if (showVolume) {
//       // الفوليوم تحت الشموع مباشرة (مثلاً 10% من المساحة)
//       priceScalesRef.current.set('volume', { top: 0.5, bottom: 0.6 });
//     }

//     // حساب المساحة للمؤشرات المنفصلة في الأسفل
//     const separateIndicators = selectedIndicators
//       .filter(ind => ind.enabled && getIndicatorLayout(ind.name) === 'separate');

//     const remainingTop = showVolume ? 0.6 : 0.5;
//     const remainingSpace = 1.0 - remainingTop;
//     const panelCount = separateIndicators.length;

//     if (panelCount > 0) {
//       const panelHeight = remainingSpace / panelCount;
//       separateIndicators.forEach((ind, index) => {
//         const top = remainingTop + (index * panelHeight);
//         const bottom = top + panelHeight;
//         priceScalesRef.current.set(ind.name, { top, bottom });
//       });
//     }
//   }, [selectedIndicators, showVolume]);

//   // 3. Create Main Chart (المحدث بالكامل لدعم الألواح)
//   const createMainChart = useCallback(() => {
//     if (!chartContainerRef.current || candles.length === 0) return;

//     safeRemoveChart();
//     calculateLayout();

//     const chart = createChart(chartContainerRef.current, {
//       width: chartContainerRef.current.clientWidth,
//       height: chartContainerRef.current.clientHeight,
//       layout: { background: { type: 'solid', color: '#131722' }, textColor: '#D9D9D9' },
//       grid: { vertLines: { color: '#2A2E39' }, horzLines: { color: '#2A2E39' } },
//       crosshair: {
//         mode: CrosshairMode.Normal,
//         vertLine: { width: 1, color: '#758696', style: 2, labelBackgroundColor: '#1E222D' },
//         horzLine: { width: 1, color: '#758696', style: 2, labelBackgroundColor: '#1E222D' },
//       },
//       timeScale: {
//         borderColor: '#2A2E39',
//         visible: true,
//         timeVisible: true,
//         ticksVisible: true,
//         secondsVisible: false,
//       },
//     });

//     // --- Main Price Candlestick Series ---
//     const mainMargins = priceScalesRef.current.get('main') || { top: 0.1, bottom: 0.5 };

//     const candlestickSeries = chart.addSeries(CandlestickSeries, {
//       upColor: '#26A69A',
//       downColor: '#EF5350',
//       wickUpColor: '#26A69A',
//       wickDownColor: '#EF5350',
//       borderUpColor: '#26A69A',
//       borderDownColor: '#EF5350',
//       priceScaleId: 'main', // مقياس خاص للشموع
//       scaleMargins: { top: mainMargins.top, bottom: mainMargins.bottom },
//     });

//     const candleData = candles.map(candle => ({
//       time: (Date.parse(candle.timestamp) / 1000) as Time,
//       open: candle.open,
//       high: candle.high,
//       low: candle.low,
//       close: candle.close,
//     }));
//     candlestickSeries.setData(candleData);
//     candlestickSeriesRef.current = candlestickSeries;

//     // --- Volume Series (Histogram) ---
//     if (showVolume) {
//       const volMargins = priceScalesRef.current.get('volume') || { top: 0.5, bottom: 0.6 };
//       const volumeSeries = chart.addSeries(HistogramSeries, {
//         priceFormat: { type: 'volume', precision: 2, minMove: 0.01 },
//         priceScaleId: '', // يشارك المقياس ولكن شكله مختلف
//         scaleMargins: { top: volMargins.top, bottom: volMargins.bottom },
//       });

//       const volumeData = candles.map(candle => ({
//         time: (Date.parse(candle.timestamp) / 1000) as Time,
//         value: candle.volume,
//         color: candle.close >= candle.open
//           ? 'rgba(38, 166, 154, 0.5)'
//           : 'rgba(239, 83, 80, 0.5)',
//       }));
//       volumeSeries.setData(volumeData);
//       volumeSeriesRef.current = volumeSeries;
//     }

//     // --- Render Indicators (منطق الفصل بين Overlay و Separate) ---
//     selectedIndicators.filter(ind => ind.enabled).forEach((indicator, index) => {
//       const layout = getIndicatorLayout(indicator.name);
//       if (layout === 'overlay') {
//         // رسم فوق السعر (مشاركة المقياس الرئيسي)
//         addIndicatorLine(chart, candles, indicator, 'main', index);
//       } else {
//         // رسم في لوحة منفصلة (مقياس خاص بالمؤشر)
//         const panelMargins = priceScalesRef.current.get(indicator.name);
//         if (panelMargins) {
//           addIndicatorLine(chart, candles, indicator, indi, index, panelMargins);
//         }
//       }
//     });

//     // --- Render Trade Markers (نظام العلامات الجديد) ---
//     if (showTrades) {
//       addTradeMarkers(chart, tradeMarkers, candles, candlestickSeries);
//     }

//     chart.subscribeCrosshairMove(handleCrosshairMove);
//     chartRef.current = chart;
//   }, [candles, selectedIndicators, showTrades, showVolume, tradeMarkers, safeRemoveChart, calculateLayout]);

//   // 4. Add Indicator Line (محدث لدعم الألواح المنفصلة)
//   const addIndicatorLine = (
//     chart: IChartApi,
//     candlesData: VisualCandle[],
//     indicator: IndicatorState,
//     priceScaleId: string, // يمكن أن يكون 'main' أو اسم المؤشر المنفصل
//     colorIndex: number,
//     scaleMargins?: { top: number; bottom: number } // فقط للمؤشرات المنفصلة
//   ) => {
//     const indicatorName = indicator.name;
//     const indicatorKey = `ind_${indicatorName}`;

//     const data = candlesData
//       .map(candle => {
//         let val = (candle as any)[indicatorKey];
//         if (val === undefined || val === null && candle.indicators) {
//           val = candle.indicators[indicatorKey];
//         }
//         if (val === null || val === undefined) return null;
//         return { time: (Date.parse(candle.timestamp) / 1000) as Time, value: val };
//       })
//       .filter(Boolean) as { time: Time; value: number }[];

//     if (data.length === 0) return;

//     const lineSeries = chart.addSeries(LineSeries, {
//       color: indicator.color,
//       lineWidth: indicator.lineWidth,
//       lineStyle: indicator.lineStyle,
//       title: indicator.name.toUpperCase(),
//       priceScaleId: priceScaleId, // المفتاح لمنع التداخل!
//       priceLineVisible: false,
//       lastValueVisible: true,
//       scaleMargins: scaleMargins,
//     });

//     lineSeries.setData(data);
//     indicatorSeriesRef.current.set(indicatorName, lineSeries);
//   };

//   // 5. Add Trade Markers (استخدام setMarkers بدلاً من PriceLines)
//   const addTradeMarkers = (
//     chart: IChartApi,
//     markers: TradeMarker[],
//     candlesData: VisualCandle[],
//     series: ISeriesApi<'Candlestick'>
//   ) => {
    
//     const tradeMarkersData: Marker<Time>[] = [];

//     markers.forEach((marker, index) => {
//       const candleIndex = candlesData.findIndex(candle => candle.timestamp === marker.timestamp);
//       if (candleIndex === -1) return;

//       // تحديد شكل العلامة ومكانها
//       let shape: 'arrowUp' | 'arrowDown' | 'circle' = 'arrowUp';
//       let position: 'aboveBar' | 'belowBar' | 'inBar' = 'aboveBar';
//       let color: string = '#10B981';
//       let text = '';

//       if (marker.type === 'entry') {
//         if (marker.position_type === 'long') {
//           shape = 'arrowUp';
//           position = 'belowBar'; // تحت الشمعة (للشراء)
//           color = '#10B981';
//           text = `Entry Buy: ${formatNumber(marker.price)}`;
//         } else {
//           shape = 'arrowDown';
//           position = 'aboveBar'; // فوق الشمعة (للبيع)
//           color = '#EF4444';
//           text = `Entry Sell: ${formatNumber(marker.price)}`;
//         }
//       } else {
//         // Exit
//         if (marker.pnl !== undefined) {
//           if (marker.pnl > 0) {
//             color = '#10B981';
//             text = `Profit: ${formatNumber(marker.pnl)}`;
//             position = 'aboveBar'; // ربح عادةً فوق الشمعة
//             shape = 'circle';
//           } else {
//             color = '#EF4444';
//             text = `Loss: ${formatNumber(marker.pnl)}`;
//             position = 'belowBar'; // خسارة عادةً تحت الشمعة
//             shape = 'circle';
//           }
//         }
//       }

//       // إضافة السبب للنص إذا وجد
//       if (marker.decision_reason || marker.exit_reason) {
//         text += `\n(${marker.decision_reason || marker.exit_reason})`;
//       }

//       tradeMarkersData.push({
//         time: (Date.parse(candle.timestamp) / 1000) as Time,
//         position: position,
//         color: color,
//         shape: shape,
//         text: text
//       });
//     });

//     if (tradeMarkersData.length > 0) {
//       series.setMarkers(tradeMarkersData);
//     }
//   };

//   // 6. Create Performance Chart
//   const createPerformanceChart = useCallback(() => {
//     if (!chartContainerRef.current || !equityCurve || !drawdownCurve) return;

//     safeRemoveChart();

//     const chart = createChart(chartContainerRef.current, {
//       width: chartContainerRef.current.clientWidth,
//       height: chartContainerRef.current.clientHeight,
//       layout: { background: { type: 'solid', color: '#131722' }, textColor: '#D9D9D9' },
//       grid: { vertLines: { color: '#2A2E39' }, horzLines: { color: '#2A2E39' } },
//       rightPriceScale: { borderColor: '#2A2E39', scaleMargins: { top: 0.1, bottom: 0.2 } },
//       timeScale: { borderColor: '#2A2E39', visible: true, timeVisible: true },
//     });

//     const seriesData = lineChartMode === 'equity' ? equityCurve : drawdownCurve;
//     const lineColor = lineChartMode === 'equity' ? '#10B981' : '#EF4444';

//     const lineSeries = chart.addSeries(LineSeries, {
//       color: lineColor,
//       lineWidth: 2,
//       lineStyle: 0,
//     });

//     const lineData = seriesData.map((value, index) => {
//       const candle = candles[Math.min(index, candles.length - 1)];
//       return { time: (Date.parse(candle.timestamp) / 1000) as Time, value: value };
//     });

//     lineSeries.setData(lineData);

//     if (lineChartMode === 'drawdown') {
//       lineSeries.createPriceLine({ price: 0, color: '#6B7280', lineWidth: 1, lineStyle: 1 });
//     }

//     chartRef.current = chart;
//   }, [candles, equityCurve, drawdownCurve, lineChartMode, safeRemoveChart]);

//   // --- Handlers ---

//   const handleCrosshairMove = useCallback((param: MouseEventParams) => {
//     if (!param.time || !param.point || !showCrosshairData) {
//       setCrosshairData({});
//       return;
//     }
//     const timeStr = param.time as Time;
//     const candleIndex = candles.findIndex(candle => (Date.parse(candle.timestamp) / 1000) === timeStr);
//     if (candleIndex !== -1) {
//       const candle = candles[candleIndex];
//       setCrosshairData({
//         price: param.seriesData.size > 0 ? Array.from(param.seriesData.values())[0].value as number : undefined,
//         time: candle.timestamp,
//         candle: candle,
//       });
//     }
//   }, [candles, showCrosshairData]);

//   const toggleIndicator = useCallback((indicatorName: string) => {
//     setSelectedIndicators(prev => {
//       const existing = prev.find(i => i.name === indicatorName);
//       if (existing) {
//         return prev.map(i => i.name === indicatorName ? { ...i, enabled: !i.enabled } : i);
//       } else {
//         const colorIndex = prev.length % INDICATOR_COLORS.length;
//         return [...prev, {
//           name: indicatorName,
//           enabled: true,
//           color: INDICATOR_COLORS[colorIndex],
//           lineWidth: 2,
//           lineStyle: 0,
//         }];
//       }
//     });
//   }, []);

//   const updateIndicatorSettings = useCallback((indicatorName: string, settings: Partial<IndicatorState>) => {
//     setSelectedIndicators(prev => prev.map(i => i.name === indicatorName ? { ...i, ...settings } : i));
//   }, []);

//   // --- Effects ---

//   useEffect(() => {
//     if (!chartContainerRef.current || candles.length === 0) return;
//     if (chartType === 'candlestick') {
//       createMainChart();
//     } else {
//       createPerformanceChart();
//     }

//     const handleResize = () => {
//       if (chartContainerRef.current && chartRef.current) {
//         chartRef.current.applyOptions({
//           width: chartContainerRef.current.clientWidth,
//           height: chartContainerRef.current.clientHeight,
//         });
//       }
//     };
//     window.addEventListener('resize', handleResize);
//     return () => {
//       window.removeEventListener('resize', handleResize);
//       safeRemoveChart();
//     };
//   }, [chartType, createMainChart, createPerformanceChart, safeRemoveChart]);

//   // --- Stats ---

//   const stats = useMemo(() => {
//     if (!summary) return null;
//     const totalWinningTrades = tradeMarkers.filter(t => t.type === 'exit' && t.pnl && t.pnl > 0).length;
//     const totalLosingTrades = tradeMarkers.filter(t => t.type === 'exit' && t.pnl && t.pnl <= 0).length;

//     const avgWinningTrade = tradeMarkers.filter(t => t.type === 'exit' && t.pnl && t.pnl > 0).reduce((sum, t) => sum + (t.pnl || 0), 0) / (totalWinningTrades || 1);
//     const avgLosingTrade = tradeMarkers.filter(t => t.type === 'exit' && t.pnl && t.pnl <= 0).reduce((sum, t) => sum + (t.pnl || 0), 0) / (totalLosingTrades || 1);

//     const largestWinningTrade = Math.max(...tradeMarkers.filter(t => t.type === 'exit' && t.pnl && t.pnl > 0).map(t => t.pnl || 0));
//     const largestLosingTrade = Math.min(...tradeMarkers.filter(t => t.type === 'exit' && t.pnl && t.pnl < 0).map(t => t.pnl || 0));

//     return {
//       ...summary,
//       totalWinningTrades,
//       totalLosingTrades,
//       avgWinningTrade,
//       avgLosingTrade,
//       largestWinningTrade,
//       largestLosingTrade,
//     };
//   }, [summary, tradeMarkers]);

//   // --- Render (كما هو موجود في ملفك الأصلي، بدون تغييرات على الـ JSX) ---
//   return (
//     <Card className="h-full flex flex-col bg-[#131722] border-gray-800">
//       <CardHeader className="border-b border-gray-800 pb-3 space-y-2">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <CardTitle className="text-white">الشارت التفاعلي</CardTitle>
//             <Badge variant="outline" className="border-gray-600 text-gray-300">{symbol} - {timeframe}</Badge>
//             <Badge variant="secondary" className="bg-gray-800 text-gray-300">{candles.length} شمعة</Badge>
//             {summary && (
//               <>
//                 <Badge variant={summary.total_pnl >= 0 ? 'default' : 'destructive'} className={summary.total_pnl >= 0 ? 'bg-green-600' : 'bg-red-600'}>
//                   {formatPercent(summary.total_pnl_percent)}
//                 </Badge>
//                 <Badge variant="outline" className="border-gray-600 text-gray-300">{formatNumber(summary.total_trades)} صفقة</Badge>
//                 <Badge variant="outline" className="border-gray-600 text-gray-300">{formatNumber(summary.win_rate)}% معدل ربح</Badge>
//               </>
//             )}
//           </div>
//           <div className="flex items-center gap-2">
//             {onStartPlay && onStopPlay && (
//               <Button size="sm" variant={isPlaying ? 'destructive' : 'default'} onClick={isPlaying ? onStopPlay : onStartPlay}>
//                 {isPlaying ? <><Pause className="h-4 w-4 mr-1" />إيقاف</> : <><Play className="h-4 w-4 mr-1" />تشغيل</>}
//               </Button>
//             )}
//             <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800" onClick={onExport}><Download className="h-4 w-4" /></Button>
//             <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800" onClick={() => {
//               if (!isFullscreen) { chartContainerRef.current?.requestFullscreen(); setIsFullscreen(true); }
//               else { document.exitFullscreen(); setIsFullscreen(false); }
//             }}><Maximize2 className="h-4 w-4" /></Button>
//           </div>
//         </div>
//         <CardDescription className="text-gray-400">عرض الشموع والمؤشرات ونقاط الدخول والخروج وتحليل الأداء</CardDescription>
//       </CardHeader>

//       <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
//         {/* أدوات التحكم */}
//         <div className="flex items-center gap-3 p-3 border-b border-gray-800 bg-[#1E222D]">
//           <div className="flex items-center gap-1">
//             <Button size="sm" variant={chartType === 'candlestick' ? 'default' : 'outline'} className={chartType === 'candlestick' ? 'bg-green-600' : 'border-gray-600 text-gray-300 hover:bg-gray-800'} onClick={() => setChartType('candlestick')}>
//               <Layers className="h-4 w-4 mr-1" />شموع
//             </Button>
//             <Button size="sm" variant={chartType === 'line' ? 'default' : 'outline'} className={chartType === 'line' ? 'bg-blue-600' : 'border-gray-600 text-gray-300 hover:bg-gray-800'} onClick={() => setChartType('line')} disabled={!equityCurve && !drawdownCurve}>
//               <TrendingUp className="h-4 w-4 mr-1" />أداء
//             </Button>
//           </div>
//           <Separator orientation="vertical" className="h-6 bg-gray-700" />
//           {chartType === 'candlestick' && (
//             <>
//               <div className="flex items-center gap-2">
//                 <Checkbox id="show-volume" checked={showVolume} onCheckedChange={setShowVolume} className="border-gray-600" />
//                 <Label htmlFor="show-volume" className="cursor-pointer text-sm text-gray-300">حجم التداول</Label>
//               </div>
//               <div className="flex items-center gap-2">
//                 <Checkbox id="show-trades" checked={showTrades} onCheckedChange={setShowTrades} className="border-gray-600" />
//                 <Label htmlFor="show-trades" className="cursor-pointer text-sm text-gray-300">الصفقات</Label>
//               </div>
//               <Separator orientation="vertical" className="h-6 bg-gray-700" />
//               {extractedIndicators.length > 0 && (
//                 <div className="flex items-center gap-2 flex-wrap">
//                   <span className="text-sm text-gray-400">المؤشرات:</span>
//                   {extractedIndicators.map(indicator => {
//                     const isSelected = selectedIndicators.some(i => i.name === indicator && i.enabled);
//                     const layout = getIndicatorLayout(indicator);
//                     return (
//                       <Badge key={indicator} variant={isSelected ? 'default' : 'outline'} className={`cursor-pointer transition-all ${isSelected ? (layout === 'overlay' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700') : 'border-gray-600 text-gray-300 hover:bg-gray-800'}`} onClick={() => toggleIndicator(indicator)}>
//                         {indicator.toUpperCase()}
//                       </Badge>
//                     );
//                   })}
//                 </div>
//               )}
//             </>
//           )}
//           {chartType === 'line' && (
//             <div className="flex items-center gap-2">
//               <Button size="sm" variant={lineChartMode === 'equity' ? 'default' : 'outline'} className={lineChartMode === 'equity' ? 'bg-green-600' : 'border-gray-600 text-gray-300 hover:bg-gray-800'} onClick={() => setLineChartMode('equity')}>
//                 <DollarSign className="h-4 w-4 mr-1" />رأس المال
//               </Button>
//               <Button size="sm" variant={lineChartMode === 'drawdown' ? 'default' : 'outline'} className={lineChartMode === 'drawdown' ? 'bg-red-600' : 'border-gray-600 text-gray-300 hover:bg-gray-800'} onClick={() => setLineChartMode('drawdown')}>
//                 <Activity className="h-4 w-4 mr-1" />الانكماش
//               </Button>
//             </div>
//           )}
//         </div>

//         {/* المحتوى الرئيسي */}
//         <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
//           <div className="flex items-center justify-between px-3 border-b border-gray-800 bg-[#1E222D]">
//             <TabsList className="bg-transparent h-auto p-0 gap-1">
//               <TabsTrigger value="chart" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400"><BarChart3 className="h-4 w-4 mr-1" />الشارت</TabsTrigger>
//               <TabsTrigger value="performance" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400"><Activity className="h-4 w-4 mr-1" />الأداء</TabsTrigger>
//               <TabsTrigger value="trades" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400"><Target className="h-4 w-4 mr-1" />الصفقات</TabsTrigger>
//               <TabsTrigger value="indicators" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400"><Settings className="h-4 w-4 mr-1" />المؤشرات</TabsTrigger>
//             </TabsList>
//             <div className="flex items-center gap-2">
//               <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white hover:bg-gray-800"><ZoomIn className="h-4 w-4" /></Button>
//               <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white hover:bg-gray-800"><ZoomOut className="h-4 w-4" /></Button>
//               <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white hover:bg-gray-800" onClick={() => { chartType === 'candlestick' ? createMainChart() : createPerformanceChart() }}><RefreshCw className="h-4 w-4" /></Button>
//             </div>
//           </div>

//           <div className="flex-1 flex overflow-hidden">
//             <TabsContent value="chart" className="flex-1 m-0 p-0 overflow-hidden">
//               <div className="flex h-full">
//                 <div className="flex-1 relative">
//                   {candles.length === 0 ? <div className="absolute inset-0 flex items-center justify-center text-gray-500">لا توجد بيانات</div> : <div ref={chartContainerRef} className="w-full h-full" />}
//                   {showCrosshairData && crosshairData.candle && (
//                     <div className="absolute top-2 left-2 bg-[#1E222D] border border-gray-700 rounded p-3 text-sm space-y-1 shadow-lg pointer-events-none">
//                       <div className="flex items-center gap-2 text-gray-300"><Info className="h-4 w-4" /><span className="font-medium">{crosshairData.time}</span></div>
//                       <div className="text-gray-400">السعر: {formatNumber(crosshairData.candle.close)}</div>
//                       {crosshairData.candle.strategy_decision && (
//                         <div className={`flex items-center gap-2 ${crosshairData.candle.strategy_decision === 'buy' ? 'text-green-400' : crosshairData.candle.strategy_decision === 'sell' ? 'text-red-400' : 'text-gray-400'}`}>
//                           <TrendingUp className="h-4 w-4" />
//                           {crosshairData.candle.strategy_decision === 'buy' && 'شراء'}
//                           {crosshairData.candle.strategy_decision === 'sell' && 'بيع'}
//                           {crosshairData.candle.strategy_decision === 'hold' && 'انتظار'}
//                         </div>
//                       )}
//                       {crosshairData.candle.current_pnl !== null && <div className={`${crosshairData.candle.current_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>P&L: {formatNumber(crosshairData.candle.current_pnl)}</div>}
//                     </div>
//                   )}
//                 </div>
//                 {/* اللوحة الجانبية للمؤشرات */}
//                 <div className="w-64 border-l border-gray-800 bg-[#1E222D] p-3 overflow-y-auto">
//                   <h3 className="text-sm font-semibold text-white mb-3">المؤشرات النشطة</h3>
//                   <div className="space-y-3">
//                     {selectedIndicators.map(indicator => (
//                       <div key={indicator.name} className="p-2 bg-[#2A2E39] rounded">
//                         <div className="flex items-center justify-between mb-2">
//                           <span className="text-sm font-medium text-white">{indicator.name.toUpperCase()}</span>
//                           <Badge variant="outline" className={`border-gray-600 text-xs ${getIndicatorLayout(indicator.name) === 'overlay' ? 'text-blue-400' : 'text-purple-400'}`}>{getIndicatorLayout(indicator.name) === 'overlay' ? 'فوق السعر' : 'لوحة منفصلة'}</Badge>
//                           <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-gray-400 hover:text-white" onClick={() => toggleIndicator(indicator.name)}><X className="h-3 w-3" /></Button>
//                         </div>
//                         <div className="space-y-2">
//                           <div className="flex items-center gap-2"><div className="w-4 h-4 rounded" style={{ backgroundColor: indicator.color }} /><span className="text-xs text-gray-400">اللون</span></div>
//                           <div className="flex items-center gap-2"><span className="text-xs text-gray-400">السمك:</span>
//                             <Select value={indicator.lineWidth.toString()} onValueChange={(v) => updateIndicatorSettings(indicator.name, { lineWidth: parseInt(v) })}>
//                               <SelectTrigger className="h-6 text-xs bg-[#131722] border-gray-700"><SelectValue /></SelectTrigger>
//                               <SelectContent className="bg-[#1E222D] border-gray-700">{[1, 2, 3, 4].map(w => <SelectItem key={w} value={w.toString()} className="text-gray-300">{w}</SelectItem>)}</SelectContent>
//                             </Select>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//               {showTrades && tradeMarkers.length > 0 && (
//                 <div className="p-3 border-t border-gray-800 bg-[#1E222D]">
//                   <div className="flex items-center gap-4 text-sm">
//                     <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500" /><span className="text-gray-300">دخول شراء (سهم)</span></div>
//                     <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500" /><span className="text-gray-300">دخول بيع (سهم)</span></div>
//                     <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white" /><span className="text-gray-300">ربح (دائرة)</span></div>
//                     <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white" /><span className="text-gray-300">خسارة (دائرة)</span></div>
//                     <span className="text-gray-400 ml-auto">{tradeMarkers.length} صفقة</span>
//                   </div>
//                 </div>
//               )}
//             </TabsContent>

//             <TabsContent value="performance" className="flex-1 m-0 p-0 overflow-auto bg-[#131722]">
//               <div className="p-6 space-y-6">
//                 {stats ? (
//                   <>
//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                       <Card className="bg-[#1E222D] border-gray-800"><CardContent className="p-4"><div className="text-sm text-gray-400 mb-1">إجمالي الربح/الخسارة</div><div className={`text-2xl font-bold ${stats.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatNumber(stats.total_pnl)}</div><div className={`text-sm ${stats.total_pnl_percent >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatPercent(stats.total_pnl_percent)}</div></CardContent></Card>
//                       <Card className="bg-[#1E222D] border-gray-800"><CardContent className="p-4"><div className="text-sm text-gray-400 mb-1">معدل الربح</div><div className="text-2xl font-bold text-white">{formatNumber(stats.win_rate)}%</div><div className="text-sm text-gray-400">{stats.totalWinningTrades} ربح / {stats.totalLosingTrades} خسارة</div></CardContent></Card>
//                       <Card className="bg-[#1E222D] border-gray-800"><CardContent className="p-4"><div className="text-sm text-gray-400 mb-1">أقصى انكماش</div><div className="text-2xl font-bold text-red-400">{formatPercent(stats.max_drawdown_percent)}</div><div className="text-sm text-gray-400">Max Drawdown</div></CardContent></Card>
//                       <Card className="bg-[#1E222D] border-gray-800"><CardContent className="p-4"><div className="text-sm text-gray-400 mb-1">Sharpe Ratio</div><div className="text-2xl font-bold text-white">{formatNumber(stats.sharpe_ratio)}</div><div className="text-sm text-gray-400">معامل شارب</div></CardContent></Card>
//                     </div>
//                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                       <Card className="bg-[#1E222D] border-gray-800"><CardContent className="p-4"><div className="text-sm text-gray-400 mb-1">Profit Factor</div><div className="text-xl font-bold text-white">{formatNumber(stats.profit_factor)}</div></CardContent></Card>
//                       <Card className="bg-[#1E222D] border-gray-800"><CardContent className="p-4"><div className="text-sm text-gray-400 mb-1">Sortino Ratio</div><div className="text-xl font-bold text-white">{formatNumber(stats.sortino_ratio)}</div></CardContent></Card>
//                       <Card className="bg-[#1E222D] border-gray-800"><CardContent className="p-4"><div className="text-sm text-gray-400 mb-1">Calmar Ratio</div><div className="text-xl font-bold text-white">{formatNumber(stats.calmar_ratio)}</div></CardContent></Card>
//                       <Card className="bg-[#1E222D] border-gray-800"><CardContent className="p-4"><div className="text-sm text-gray-400 mb-1">متوسط صفقة رابحة</div><div className="text-xl font-bold text-green-400">{formatNumber(stats.avgWinningTrade)}</div></CardContent></Card>
//                       <Card className="bg-[#1E222D] border-gray-800"><CardContent className="p-4"><div className="text-sm text-gray-400 mb-1">متوسط صفقة خاسرة</div><div className="text-xl font-bold text-red-400">{formatNumber(stats.avgLosingTrade)}</div></CardContent></Card>
//                       <Card className="bg-[#1E222D] border-gray-800"><CardContent className="p-4"><div className="text-sm text-gray-400 mb-1">العائد السنوي</div><div className="text-xl font-bold text-white">{formatPercent(stats.annual_return_percent)}</div></CardContent></Card>
//                     </div>
//                     <div className="grid grid-cols-2 gap-4">
//                       <Card className="bg-[#1E222D] border-gray-800"><CardContent className="p-4"><div className="text-sm text-gray-400 mb-1">أفضل صفقة</div><div className="text-2xl font-bold text-green-400">{formatNumber(stats.largestWinningTrade)}</div></CardContent></Card>
//                       <Card className="bg-[#1E222D] border-gray-800"><CardContent className="p-4"><div className="text-sm text-gray-400 mb-1">أسوأ صفقة</div><div className="text-2xl font-bold text-red-400">{formatNumber(stats.largestLosingTrade)}</div></CardContent></Card>
//                     </div>
//                   </>
//                 ) : (
//                   <div className="text-center text-gray-500 py-12">لا توجد بيانات أداء متاحة</div>
//                 )}
//               </div>
//             </TabsContent>

//             <TabsContent value="trades" className="flex-1 m-0 p-0 overflow-hidden bg-[#131722]">
//               <div className="h-full flex flex-col">
//                 <div className="p-3 border-b border-gray-800 bg-[#1E222D]">
//                   <div className="flex items-center justify-between">
//                     <div className="text-sm text-gray-300">{tradeMarkers.length} صفقة</div>
//                     <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800"><Filter className="h-4 w-4 mr-1" />تصفية</Button>
//                   </div>
//                 </div>
//                 <div className="flex-1 overflow-auto">
//                   <Table>
//                     <TableHeader className="bg-[#1E222D] sticky top-0"><TableRow className="border-gray-800"><TableHead className="text-gray-300">#</TableHead><TableHead className="text-gray-300">الوقت</TableHead><TableHead className="text-gray-300">النوع</TableHead><TableHead className="text-gray-300">السعر</TableHead><TableHead className="text-gray-300">الحجم</TableHead><TableHead className="text-gray-300">الربح/الخسارة</TableHead><TableHead className="text-gray-300">السبب</TableHead></TableRow></TableHeader>
//                     <TableBody>
//                       {tradeMarkers.map((trade, index) => (
//                         <TableRow key={trade.trade_id || index} className={`border-gray-800 hover:bg-[#2A2E39] cursor-pointer ${selectedTrade?.trade_id === trade.trade_id ? 'bg-[#2A2E39]' : ''}`} onClick={() => setSelectedTrade(trade)}>
//                           <TableCell className="text-gray-300">{index + 1}</TableCell>
//                           <TableCell className="text-gray-300">{new Date(trade.timestamp).toLocaleString('ar-SA')}</TableCell>
//                           <TableCell><Badge className={trade.type === 'entry' ? (trade.position_type === 'long' ? 'bg-green-600' : 'bg-red-600') : (trade.pnl && trade.pnl > 0 ? 'bg-green-600' : 'bg-red-600')}>{trade.type === 'entry' ? (trade.position_type === 'long' ? 'شراء' : 'بيع') : 'خروج'}</Badge></TableCell>
//                           <TableCell className="text-white">{formatNumber(trade.price)}</TableCell>
//                           <TableCell className="text-gray-300">{formatNumber(trade.position_size)}</TableCell>
//                           <TableCell>{trade.pnl !== undefined ? <span className={trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>{formatNumber(trade.pnl)}{trade.pnl_percentage && ` (${formatPercent(trade.pnl_percentage)})`}</span> : <span className="text-gray-500">-</span>}</TableCell>
//                           <TableCell className="text-gray-300">{trade.exit_reason || trade.decision_reason || '-'}</TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </div>
//                 {selectedTrade && (
//                   <div className="p-3 border-t border-gray-800 bg-[#1E222D]">
//                     <div className="flex items-center justify-between mb-2">
//                       <h3 className="text-sm font-semibold text-white">تفاصيل الصفقة</h3>
//                       <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-gray-400 hover:text-white" onClick={() => setSelectedTrade(null)}><X className="h-3 w-3" /></Button>
//                     </div>
//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
//                       <div><div className="text-gray-400">المعرف</div><div className="text-white">{selectedTrade.trade_id || '-'}</div></div>
//                       <div><div className="text-gray-400">سعر الدخول</div><div className="text-white">{formatNumber(selectedTrade.entry_price)}</div></div>
//                       <div><div className="text-gray-400">وقف الخسارة</div><div className="text-white">{selectedTrade.stop_loss ? formatNumber(selectedTrade.stop_loss) : '-'}</div></div>
//                       <div><div className="text-gray-400">جني الأرباح</div><div className="text-white">{selectedTrade.take_profit ? formatNumber(selectedTrade.take_profit) : '-'}</div></div>
//                       <div><div className="text-gray-400">نسبة المخاطرة/العائد</div><div className="text-white">{selectedTrade.risk_reward_ratio ? formatNumber(selectedTrade.risk_reward_ratio) : '-'}</div></div>
//                       <div><div className="text-gray-400">المدة</div><div className="text-white">{selectedTrade.holding_period ? `${selectedTrade.holding_period} ساعة` : '-'}</div></div>
//                       <div><div className="text-gray-400">الرصيد قبل</div><div className="text-white">{selectedTrade.account_balance_before ? formatNumber(selectedTrade.account_balance_before) : '-'}</div></div>
//                       <div><div className="text-gray-400">الرصيد بعد</div><div className="text-white">{selectedTrade.account_balance_after ? formatNumber(selectedTrade.account_balance_after) : '-'}</div></div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </TabsContent>

//             <TabsContent value="indicators" className="flex-1 m-0 p-0 overflow-auto bg-[#131722]">
//               <div className="p-6">
//                 <h3 className="text-lg font-semibold text-white mb-4">المؤشرات المتاحة</h3>
//                 {extractedIndicators.length > 0 ? (
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                     {extractedIndicators.map(indicator => {
//                       const isSelected = selectedIndicators.some(i => i.name === indicator && i.enabled);
//                       const category = getCategoryForIndicator(indicator);
//                       const layout = getIndicatorLayout(indicator);
//                       return (
//                         <Card key={indicator} className="bg-[#1E222D] border-gray-800">
//                           <CardContent className="p-4">
//                             <div className="flex items-center justify-between mb-3">
//                               <Badge variant="outline" className="border-gray-600 text-gray-300">{category}</Badge>
//                               <Badge variant="outline" className={`border-gray-600 text-xs ${layout === 'overlay' ? 'text-blue-400' : 'text-purple-400'}`}>{layout === 'overlay' ? 'فوق السعر' : 'لوحة منفصلة'}</Badge>
//                               <Checkbox checked={isSelected} onCheckedChange={() => toggleIndicator(indicator)} className="border-gray-600" />
//                             </div>
//                             <h4 className="text-lg font-semibold text-white mb-2">{indicator.toUpperCase()}</h4>
//                             <p className="text-sm text-gray-400 mb-3">{getIndicatorDescription(indicator)}</p>
//                             {isSelected && (
//                               <div className="space-y-2">
//                                 <Select value={selectedIndicators.find(i => i.name === indicator)?.lineStyle.toString() || '0'} onValueChange={(v) => updateIndicatorSettings(indicator, { lineStyle: parseInt(v) })}>
//                                   <SelectTrigger className="h-8 text-sm bg-[#131722] border-gray-700"><SelectValue placeholder="نمط الخط" /></SelectTrigger>
//                                   <SelectContent className="bg-[#1E222D] border-gray-700"><SelectItem value="0" className="text-gray-300">متصل</SelectItem><SelectItem value="1" className="text-gray-300">منقط</SelectItem><SelectItem value="2" className="text-gray-300">مكسر</SelectItem></SelectContent>
//                                 </Select>
//                               </div>
//                             )}
//                           </CardContent>
//                         </Card>
//                       );
//                     })}
//                   </div>
//                 ) : (
//                   <div className="text-center text-gray-500 py-12"><Info className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>لا توجد مؤشرات متاحة في البيانات</p><p className="text-sm mt-2">المؤشرات سيتم عرضها عند توفرها في الاستجابة</p></div>
//                 )}
//                 <div className="mt-8">
//                   <h3 className="text-lg font-semibold text-white mb-4">معلومات إضافية</h3>
//                   <Card className="bg-[#1E222D] border-gray-800">
//                     <CardContent className="p-4">
//                       <div className="space-y-2 text-sm text-gray-300">
//                         <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-400" /><span>المؤشرات يتم استخراجها تلقائياً من البيانات</span></div>
//                         <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-400" /><span>يمكنك تفعيل/تعطيل المؤشرات بسهولة</span></div>
//                         <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-400" /><span>تخصيص ألوان وسموك الخطوط</span></div>
//                         <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-400" /><span>دعم جميع أنماط المؤشرات (SMA, EMA, RSI, MACD, etc.)</span></div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </div>
//               </div>
//             </TabsContent>
//           </div>
//         </Tabs>
//       </CardContent>
//     </Card>
//   );
// }