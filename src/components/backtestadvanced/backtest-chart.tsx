// //@ts-nocheck
'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/uiadv/card';
import { Button } from '@/components/uiadv/button';
import { Badge } from '@/components/uiadv/badge';
import { Checkbox } from '@/components/uiadv/checkbox';
import { Label } from '@/components/uiadv/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/uiadv/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/uiadv/table';



import {
  createChart,
  CrosshairMode,
  LineSeries,
  CandlestickSeries,
  HistogramSeries,
  IChartApi,
  ISeriesApi,

  createSeriesMarkers,
  type SeriesMarker,
  type ISeriesMarkersPluginApi,
  type ISeriesPrimitive,
  type Time,
  MouseEventParams,
  PriceLineOptions
} from 'lightweight-charts';
import {

} from 'lightweight-charts';

import {
  TrendingUp,
  TrendingDown,
  Play,
  Pause,
  Maximize2,
  Layers,
  Download,
  Settings,
  Info,
  Activity,
  BarChart3,
  DollarSign,
  Target,
  AlertCircle,
  CheckCircle2,
  X,
  Filter,
  LayoutTemplate,
  ChevronDown,
  ChevronUp,
  ZoomIn,
  Gauge,
  ArrowUpRight,
  ArrowDownRight,
  Zap,

  List,
  ZoomOut,
  RefreshCw,
  Clock,
  Percent,
  Cpu,
  BarChart,
  Shield,
  Brain
} from 'lucide-react';
import { VisualCandle, TradeMarker, BacktestSummary } from '@/types/backtest';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/uiadv/select';
import { Separator } from '@/components/uiadv/separator';

interface BacktestChartProps {
  candles: VisualCandle[];
  tradeMarkers: TradeMarker[];
  equityCurve?: number[];
  drawdownCurve?: number[];
  availableIndicators: string[];
  symbol: string;
  timeframe: string;
  summary?: BacktestSummary;

  advancedMetrics?: {
    volatility_annual: number;
    var_95: number;
    cvar_95: number;
    system_quality_number: number;
    kelly_criterion: number;
  };
  
  onStartPlay?: () => void;
  onStopPlay?: () => void;
  isPlaying?: boolean;
  onExport?: () => void;
}

interface IndicatorState {
  name: string;
  enabled: boolean;
  color: string;
  lineWidth: number;
  lineStyle: number;
}

interface ChartLayout {
  showMainChart: boolean;
  showVolume: boolean;
  showEquity: boolean;
  showIndicatorsPanel: boolean;
  showTradesPanel: boolean;
}

// أنماط المؤشرات
export type IndicatorPattern = 'sma' | 'ema' | 'rsi' | 'macd' | 'bollinger' | 'atr' | 'stochastic' | 'volume';

// تعريف أنماط المؤشرات المتاحة
const INDICATOR_PATTERNS: Record<IndicatorPattern, {
  name: string;
  category: string;
  defaultParams: Record<string, number>;
  description: string;
}> = {
  sma: {
    name: 'SMA',
    category: 'trend',
    defaultParams: { period: 20 },
    description: 'Simple Moving Average'
  },
  ema: {
    name: 'EMA',
    category: 'trend',
    defaultParams: { period: 20 },
    description: 'Exponential Moving Average'
  },
  rsi: {
    name: 'RSI',
    category: 'momentum',
    defaultParams: { period: 14, overbought: 70, oversold: 30 },
    description: 'Relative Strength Index'
  },
  macd: {
    name: 'MACD',
    category: 'momentum',
    defaultParams: { fast: 12, slow: 26, signal: 9 },
    description: 'Moving Average Convergence Divergence'
  },
  bollinger: {
    name: 'Bollinger Bands',
    category: 'volatility',
    defaultParams: { period: 20, stdDev: 2 },
    description: 'Bollinger Bands'
  },
  atr: {
    name: 'ATR',
    category: 'volatility',
    defaultParams: { period: 14 },
    description: 'Average True Range'
  },
  stochastic: {
    name: 'Stochastic',
    category: 'momentum',
    defaultParams: { kPeriod: 14, dPeriod: 3, smoothing: 3 },
    description: 'Stochastic Oscillator'
  },
  volume: {
    name: 'Volume',
    category: 'volume',
    defaultParams: {},
    description: 'Trading Volume'
  }
};

// ألوان داكنة للمؤشرات
const INDICATOR_COLORS = [
  '#3B82F6', // أزرق
  '#8B5CF6', // بنفسجي
  '#F59E0B', // برتقالي
  '#10B981', // أخضر
  '#EF4444', // أحمر
  '#06B6D4', // سماوي
  '#EC4899', // وردي
  '#84CC16', // أخضر فاتح
  '#F97316', // برتقالي غامق
  '#6366F1', // نيلي
];

export function BacktestChart({
  candles,
  tradeMarkers,
  equityCurve,
  drawdownCurve,
  availableIndicators,
  symbol,
  timeframe,
  summary,
  advancedMetrics,
  onStartPlay,
  onStopPlay,
  isPlaying,
  onExport
}: BacktestChartProps) {
  // Refs للمخطط
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const indicatorSeriesRef = useRef<Map<string, ISeriesApi<'Line'>>>(new Map());
  const equitySeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const priceScalesRef = useRef<Map<string, { top: number; bottom: number }>>(new Map());
  // State
  const [selectedIndicators, setSelectedIndicators] = useState<IndicatorState[]>([]);
  const [chartType, setChartType] = useState<'candlestick' | 'line'>('candlestick');
  const [lineChartMode, setLineChartMode] = useState<'equity' | 'drawdown'>('equity');
  const [showVolume, setShowVolume] = useState(true);
  const [showTrades, setShowTrades] = useState(true);
  const [showCrosshairData, setShowCrosshairData] = useState(true);
  let markersPlugin: ISeriesMarkersPluginApi<Time> | null = null;


  let resizeObserverRef: ResizeObserver | null = null;
  const [activeTab, setActiveTab] = useState<'chart' | 'performance' | 'trades' | 'indicators'>('chart');
  const [crosshairData, setCrosshairData] = useState<{
    price?: number;
    time?: string;
    candle?: VisualCandle;
  }>({});
  const [selectedTrade, setSelectedTrade] = useState<TradeMarker | null>(null);
  const [layout, setLayout] = useState<ChartLayout>({
    showMainChart: true,
    showVolume: true,
    showEquity: false,
    showIndicatorsPanel: true,
    showTradesPanel: false,
  });
  const [chartTimeframe, setChartTimeframe] = useState(timeframe);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // استخراج المؤشرات المتاحة من البيانات
  const extractedIndicators = useMemo(() => {
    const indicators = new Set<string>();
    candles.forEach(candle => {
      // 1. البحث في مستوى الجذر المباشر (يدعم بياناتك الحالية)
      Object.keys(candle).forEach(key => {
        if (key.startsWith('ind_')) {
          indicators.add(key.replace('ind_', ''));
        }
      });

      // 2. البحث داخل كائن indicators (للتوافق مع البنيات القياسية)
      if (candle.indicators) {
        Object.keys(candle.indicators).forEach(key => {
          if (key.startsWith('ind_')) {
            indicators.add(key.replace('ind_', ''));
          }
        });
      }
    });
    return Array.from(indicators);
  }, [candles]);

  // دالة آمنة لإزالة المخطط
  const safeRemoveChart = useCallback(() => {
    if (chartRef.current) {
      try {
        chartRef.current.remove();
      } catch (error) {
        console.log('Chart already disposed, skipping removal');
      }
      chartRef.current = null;
      candlestickSeriesRef.current = null;
      volumeSeriesRef.current = null;
      equitySeriesRef.current = null;
      indicatorSeriesRef.current.clear();
    }
  }, []);


  //  دالة مهمة: تحديد ما إذا كان المؤشر فوق السعر أو في لوحة منفصلة
  function getIndicatorLayout(indicatorName: string): 'overlay' | 'separate' {
    const name = indicatorName.toLowerCase();

    // المؤشرات التي عادةً تتداخل مع السعر (Overlay)
    if (name.includes('sma') || name.includes('ema') || name.includes('wma') ||
      name.includes('bollinger') || name.includes('vwap')) {
      return 'overlay';
    }

    // المؤشرات التي تحتاج لوحة منفصلة (Separate)
    if (name.includes('rsi') || name.includes('stochastic') || name.includes('macd') ||
      name.includes('atr') || name.includes('cci') || name.includes('ao')) {
      return 'separate';
    }

    return 'separate'; // الافتراضي: لوحة منفصلة للسلامة
  }


  const calculateLayout = useCallback(() => {
    // إعادة تعيين الذاكرة لتسريح المراجع القديمة
    priceScalesRef.current.clear();

    // المساحات الافتراضية (يمكن تعديلها حسب الرغبة)
    const mainChartTop = 0;
    const mainChartBottom = 0.5; // الشموع تأخذ النصف العلوي

    priceScalesRef.current.set('candlestick', { top: mainChartTop, bottom: mainChartBottom });

    if (showVolume) {
      // الفوليوم تحت الشموع مباشرة (مثلاً 10% من المساحة)
      priceScalesRef.current.set('volume', { top: 0.5, bottom: 0.6 });
    }

    // حساب المساحة للمؤشرات المنفصلة في الأسفل
    const separateIndicators = selectedIndicators
      .filter(ind => ind.enabled && getIndicatorLayout(ind.name) === 'separate');

    const remainingTop = showVolume ? 0.6 : 0.5;
    const remainingSpace = 1.0 - remainingTop;
    const panelCount = separateIndicators.length;

    if (panelCount > 0) {
      const panelHeight = remainingSpace / panelCount;
      separateIndicators.forEach((ind, index) => {
        const top = remainingTop + (index * panelHeight);
        const bottom = top + panelHeight;
        priceScalesRef.current.set(ind.name, { top, bottom });
      });
    }
  }, [selectedIndicators, showVolume]);


  // إنشاء المخطط الرئيسي
  const createMainChart = useCallback(() => {
    if (!chartContainerRef.current || candles.length === 0) return;

    safeRemoveChart();
    calculateLayout();

    // خيارات المخطط الداكن المتقدم
    const chartOptions = {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: { type: 'solid', color: '#131722' },
        textColor: '#D9D9D9',
      },
      grid: {
        vertLines: {
          color: '#2A2E39',
          style: 0,
          visible: true,
        },
        horzLines: {
          color: '#2A2E39',
          style: 0,
          visible: true,
        },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          width: 1,
          color: '#758696',
          style: 2, // خط متقطع
          labelBackgroundColor: '#1E222D',
        },
        horzLine: {
          width: 1,
          color: '#758696',
          style: 2,
          labelBackgroundColor: '#1E222D',
        },
      },
      rightPriceScale: {
        borderColor: '#2A2E39',
        scaleMargins: {
          top: 0.1,
          bottom: showVolume ? 0.2 : 0.1,
        },
      },
      timeScale: {
        borderColor: '#2A2E39',
        visible: true,
        timeVisible: true,
        ticksVisible: true,
        secondsVisible: false,
      },
      localization: {
        locale: 'ar-SA',
        dateFormat: 'dd-MM-yyyy',
      },
    };

    const chart = createChart(chartContainerRef.current, chartOptions);
    const mainMargins = priceScalesRef.current.get('candlestick') || { top: 0.1, bottom: 0.5 };


    // إضافة سلسلة الشموع
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26A69A',
      downColor: '#EF5350',
      wickUpColor: '#26A69A',
      wickDownColor: '#EF5350',
      borderUpColor: '#26A69A',
      borderDownColor: '#EF5350',
      priceScaleId: 'candlestick',
      // priceScaleId: 'main', // مقياس خاص للشموع
      scaleMargins: { top: mainMargins.top, bottom: mainMargins.bottom },
    });

    // إعداد بيانات الشموع
    const candleData = candles.map(candle => ({
      time: (Date.parse(candle.timestamp) / 1000) as Time,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));

    candlestickSeries.setData(candleData);
    candlestickSeriesRef.current = candlestickSeries;


    // --- Volume Series (Histogram) ---
    if (showVolume) {
      const volMargins = priceScalesRef.current.get('volume') || { top: 0.78, bottom: 0.0 };
      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: 'volume' as const },
        priceScaleId: 'volume',
        lastValueVisible: false,
      });
      volumeSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.93, bottom: 0 }, // المساحة المخصصة للفوليوم
        borderVisible: false,
      });

      const volumeData = candles.map(candle => ({
        time: (Date.parse(candle.timestamp) / 1000) as Time,
        value: candle.volume,
        color: candle.close >= candle.open
          ? 'rgba(38, 166, 154, 0.5)'
          : 'rgba(239, 83, 80, 0.5)',
      }));
      volumeSeries.setData(volumeData);
      volumeSeriesRef.current = volumeSeries;
    }



    // إضافة المؤشرات المحددة
    selectedIndicators.filter(ind => ind.enabled).forEach((indicator, index) => {
      const layout = getIndicatorLayout(indicator.name);
      if (layout === 'overlay') {
        // رسم فوق السعر (مشاركة المقياس الرئيسي)
        addIndicatorLine(chart, candles, indicator, 'candlestick', index);

      } else if (layout === 'separate') {
        // رسم فوق السعر (مشاركة المقياس الرئيسي)
        const priceScaleId = indicator.name;

        // إنشاء PriceScale للمؤشر إذا لم يكن موجود
        if (!chart.priceScale(priceScaleId)) {
          chart.priceScale(priceScaleId); // إنشاء تلقائي للمقياس
        }

        addIndicatorLine(chart, candles, indicator, priceScaleId, index, { top: 0.85, bottom: 0.02 });


      } else {
        // رسم في لوحة منفصلة (مقياس خاص بالمؤشر)
        const panelMargins = priceScalesRef.current.get(indicator.name);
        if (panelMargins) {
          addIndicatorLine(chart, candles, indicator, indicator.name, index, panelMargins);
        }
      }
    });


    // إضافة علامات التداول
    if (showTrades) {
      addTradeMarkers(chart, tradeMarkers, candles, candlestickSeries);
    }

    // إضافة حدث crosshair
    chart.subscribeCrosshairMove(handleCrosshairMove);

    chartRef.current = chart;
  }, [candles, selectedIndicators, showTrades, showVolume, tradeMarkers, safeRemoveChart, calculateLayout]);

  // إنشاء مخطط الأداء (منحنى رأس المال أو Drawdown)
  const createPerformanceChart = useCallback(() => {
    if (!chartContainerRef.current || !equityCurve || !drawdownCurve || !candles?.length) return;

    // remove previous chart & resources
    safeRemoveChart(); // must destroy existing chart, remove listeners, reset refs

    // create chart container
    const container = chartContainerRef.current;
    const chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight,
      layout: {
        background: { type: 'solid', color: '#0F1724' }, // slightly darker
        textColor: '#D1D5DB',
        fontFamily: 'Inter, Roboto, system-ui, sans-serif',
      },
      grid: {
        vertLines: { color: '#111827', visible: true },
        horzLines: { color: '#111827', visible: true },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: '#1F2937',
        autoScale: true,
        visible: true,
        scaleMargins: { top: 0.06, bottom: 0.24 }, // reserve bottom space for volume/perf
      },
      timeScale: {
        borderColor: '#1F2937',
        timeVisible: true,
        secondsVisible: false,
      },
      localization: {
        locale: 'en-US',
        dateFormat: 'yyyy-MM-dd',
      },
    });

    // --------- Candles series (primary, big) ----------
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10B981',
      downColor: '#EF4444',
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444',
      borderVisible: false,
      priceLineVisible: false,
    });

    // prepare candles data (convert timestamps to seconds Time)
    const candleData = candles.map(c => ({
      time: (typeof c.timestamp === 'number'
        ? (c.timestamp > 1e12 ? Math.floor(c.timestamp / 1000) : c.timestamp)
        : Math.floor(new Date(c.timestamp).getTime() / 1000)
      ) as Time,
      open: Number(c.open),
      high: Number(c.high),
      low: Number(c.low),
      close: Number(c.close),
    }));
    candleSeries.setData(candleData);

    // --------- Volume series (histogram) below candles ----------
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      scaleMargins: { top: 0.78, bottom: 0 }, // push volume to bottom 22% of chart
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const volumeData = candles.map(c => ({
      time: (typeof c.timestamp === 'number'
        ? (c.timestamp > 1e12 ? Math.floor(c.timestamp / 1000) : c.timestamp)
        : Math.floor(new Date(c.timestamp).getTime() / 1000)
      ) as Time,
      value: Number(c.volume ?? 0),
      color: Number(c.close) >= Number(c.open) ? '#10B981' : '#EF4444',
    }));
    volumeSeries.setData(volumeData);

    // --------- Performance / Equity or Drawdown line (overlay or separate scale) ----------
    // We'll give performance its own scale on the left to avoid interfering with price scale.
    const perfLine = chart.addSeries(LineSeries, {
      color: lineChartMode === 'equity' ? '#60A5FA' : '#F97316',
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: true,
      priceScaleId: 'left', // use left price scale so it doesn't affect candles' right scale
    });

    const seriesData = lineChartMode === 'equity' ? equityCurve : drawdownCurve;
    // map performance points to candle times (align by index)
    const perfData = seriesData.map((value, idx) => {
      const c = candles[Math.min(idx, candles.length - 1)];
      return {
        time: (typeof c.timestamp === 'number'
          ? (c.timestamp > 1e12 ? Math.floor(c.timestamp / 1000) : c.timestamp)
          : Math.floor(new Date(c.timestamp).getTime() / 1000)
        ) as Time,
        value: Number(value),
      };
    });
    perfLine.setData(perfData);

    // optional zero line for drawdown mode
    if (lineChartMode === 'drawdown') {
      try {
        perfLine.createPriceLine({
          price: 0,
          color: '#64748B',
          lineWidth: 1,
          lineStyle: 1,
        } as any);
      } catch (e) { /* some typings may not like; ignore */ }
    }

    // --------- Fancy interactive tooltip (DOM overlay) ----------
    // create tooltip element
    const tooltip = document.createElement('div');
    tooltip.style.cssText = [
      'position: absolute',
      'display: none',
      'pointer-events: none',
      'z-index: 1000',
      'padding: 8px 10px',
      'border-radius: 6px',
      'background: rgba(6,8,12,0.9)',
      'color: #E6E9EE',
      'font-size: 12px',
      'box-shadow: 0 6px 18px rgba(2,6,23,0.6)'
    ].join(';');
    container.appendChild(tooltip);

    // subscribe crosshair move to update tooltip
    chart.subscribeCrosshairMove(param => {
      if (!param.point || !param.time) {
        tooltip.style.display = 'none';
        return;
      }
      // get series prices when available
      const seriesPrices = (param as any).seriesPrices as Map<any, number | Record<string, number> | undefined>;

      const candlePrice = seriesPrices?.get(candleSeries) as { open?: number, high?: number, low?: number, close?: number } | number | undefined;
      const perfPrice = seriesPrices?.get(perfLine) as number | undefined;
      const volPrice = seriesPrices?.get(volumeSeries) as number | undefined;

      const date = typeof param.time === 'object' ? `${param.time.year}-${String(param.time.month).padStart(2, '0')}-${String(param.time.day).padStart(2, '0')}` : new Date((param.time as number) * 1000).toISOString().split('T')[0];

      // build HTML
      let html = `<div style="font-weight:600;margin-bottom:6px">${date}</div>`;

      if (typeof candlePrice === 'object' && candlePrice) {
        html += `<div>O: ${formatNumber(candlePrice.open ?? 0)} &nbsp; H: ${formatNumber(candlePrice.high ?? 0)} &nbsp; L: ${formatNumber(candlePrice.low ?? 0)} &nbsp; C: ${formatNumber(candlePrice.close ?? 0)}</div>`;
      } else if (typeof candlePrice === 'number') {
        html += `<div>Price: ${formatNumber(candlePrice)}</div>`;
      }

      if (perfPrice !== undefined) html += `<div style="color:${lineChartMode === 'equity' ? '#60A5FA' : '#F97316'};margin-top:6px">Perf: ${formatNumber(perfPrice)}</div>`;
      if (volPrice !== undefined) html += `<div style="margin-top:6px">Vol: ${formatNumber(volPrice)}</div>`;

      tooltip.innerHTML = html;
      tooltip.style.display = 'block';

      // position tooltip (avoid overflow)
      const coords = param.point;
      const left = Math.min(container.clientWidth - 220, Math.max(6, coords.x + 12));
      const top = Math.max(6, coords.y - 40);
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
    });

    // hide tooltip on leave
    chart.subscribeClick(() => { tooltip.style.display = 'none'; });

    // ========= responsive: resize observer ==========
    if (resizeObserverRef) {
      resizeObserverRef.disconnect();
      resizeObserverRef = null;
    }
    resizeObserverRef = new ResizeObserver(() => {
      try {
        chart.applyOptions({ width: container.clientWidth, height: container.clientHeight });
        setTimeout(() => chart.timeScale().fitContent(), 50);
      } catch (e) { /* ignore */ }
    });
    resizeObserverRef.observe(container);

    // store chart ref for cleanup
    chartRef.current = chart;

    // final niceties:
    // - fit content so candles + perf are visible
    try { chart.timeScale().fitContent(); } catch (e) { /* ignore */ }

    // return chart for further use if needed
    return chart;
  }, [candles, equityCurve, drawdownCurve, lineChartMode, safeRemoveChart, summary]);





  const addIndicatorLine = (
    chart: IChartApi,
    candlesData: VisualCandle[],
    indicator: IndicatorState,
    priceScaleId: string,
    colorIndex: number,
    scaleMargins?: { top: number; bottom: number }
  ) => {
    const indicatorName = indicator.name;
    const indicatorKey = `ind_${indicatorName}`;

    const data = candlesData
      .map(candle => {
        // قراءة المؤشر من الجذر أو من كائن indicators
        let indicatorValue = (candle as any)[indicatorKey];
        if (indicatorValue === undefined && candle.indicators) {
          indicatorValue = candle.indicators[indicatorKey];
        }
        if (indicatorValue == null) return null;
        return {
          time: Math.floor(new Date(candle.timestamp).getTime() / 1000) as Time,
          value: indicatorValue,
        };
      })
      .filter(Boolean) as { time: Time; value: number }[];

    if (!data.length) return;

    const lineSeries = chart.addSeries(LineSeries, {
      color: indicator.color ?? '#FACC15',
      lineWidth: indicator.lineWidth ?? 2,
      lineStyle: indicator.lineStyle ?? 0,
      title: indicator.name.toUpperCase(),
      priceScaleId: priceScaleId,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    // تطبيق scaleMargins فقط إذا المؤشر على لوحة منفصلة
    if (scaleMargins) {
      const top = Math.min(scaleMargins.top, 0.9);
      const bottom = Math.min(scaleMargins.bottom, 0.9);
      const sum = top + bottom;
      const safeMargins = sum >= 1 ? { top: (top / sum) * 0.99, bottom: (bottom / sum) * 0.99 } : { top, bottom };

      lineSeries.priceScale().applyOptions({
        scaleMargins: safeMargins,
        borderVisible: true,
      });
    }


    lineSeries.setData(data);
    indicatorSeriesRef.current.set(indicatorName, lineSeries);
  };


  const addTradeMarkers = (
    chart: IChartApi,
    markers: TradeMarker[],
    candlesData: VisualCandle[],
    series: ISeriesApi<'Candlestick'>
  ) => {
    if (!markersPlugin) {
      markersPlugin = createSeriesMarkers(series);
    }

    const tradeMarkers: SeriesMarker<Time>[] = [];

    markers.forEach(marker => {
      const candle = candlesData.find(c => c.timestamp === marker.timestamp);
      if (!candle) return;

      // تحويل الوقت لأي شكل إلى seconds
      let chartTime: Time;
      if (typeof candle.timestamp === 'number') {
        chartTime = (candle.timestamp > 1e12
          ? Math.floor(candle.timestamp / 1000)
          : candle.timestamp) as Time;
      } else {
        chartTime = Math.floor(new Date(candle.timestamp).getTime() / 1000) as Time;
      }
      if (!chartTime || Number.isNaN(chartTime)) return;

      // خصائص marker الافتراضية
      let shape: 'arrowUp' | 'arrowDown' | 'circle' = 'circle';
      let position: 'aboveBar' | 'belowBar' | 'inBar' = 'inBar';
      let color = '#22c55e';
      let text = '';

      // ======= Entry =======
      if (marker.type === 'entry') {
        if (marker.position_type === 'long') {
          shape = 'arrowUp';
          position = 'belowBar';
          color = '#22c55e';
          text = `BUY ${marker.price}`; // سعر الدخول
        } else {
          shape = 'arrowDown';
          position = 'aboveBar';
          color = '#ef4444';
          text = `SELL ${marker.price}`; // سعر الدخول
        }
        if (marker.decision_reason) {
          text += `\n(${marker.decision_reason})`; // سبب الدخول
        }

        // ======= Exit =======
      } else if (marker.type === 'exit') {
        shape = 'circle';
        if ((marker.pnl ?? 0) >= 0) {
          position = 'aboveBar';
          color = '#22c55e';
          text = `TP ${marker.price}`; // سعر الخروج/الربح
        } else {
          position = 'belowBar';
          color = '#ef4444';
          text = `SL ${marker.price}`; // سعر الخروج/الخسارة
        }
        if (marker.exit_reason) {
          text += `\n(${marker.exit_reason})`; // سبب الخروج
        }
      }

      tradeMarkers.push({
        time: chartTime,
        position,
        shape,
        color,
        text
      });
    });

    // تعيين جميع العلامات مرة واحدة
    markersPlugin.setMarkers(tradeMarkers);
  };





  // معالجة حركة crosshair
  const handleCrosshairMove = useCallback((param: MouseEventParams) => {
    if (!param.time || !param.point || !showCrosshairData) {
      setCrosshairData({});
      return;
    }

    const timeStr = param.time as Time;
    const candleIndex = candles.findIndex(candle =>
      (Date.parse(candle.timestamp) / 1000) === timeStr
    );

    if (candleIndex !== -1) {
      const candle = candles[candleIndex];
      setCrosshairData({
        price: param.seriesData.size > 0
          ? Array.from(param.seriesData.values())[0].value as number
          : undefined,
        time: candle.timestamp,
        candle: candle,
      });
    }
  }, [candles, showCrosshairData]);

  // تبديل المؤشر
  const toggleIndicator = useCallback((indicatorName: string) => {
    setSelectedIndicators(prev => {
      const existing = prev.find(i => i.name === indicatorName);
      if (existing) {
        // تعطيل المؤشر
        return prev.map(i =>
          i.name === indicatorName
            ? { ...i, enabled: !i.enabled }
            : i
        );
      } else {
        // إضافة مؤشر جديد
        const colorIndex = prev.length % INDICATOR_COLORS.length;
        return [...prev, {
          name: indicatorName,
          enabled: true,
          color: INDICATOR_COLORS[colorIndex],
          lineWidth: 2,
          lineStyle: 0,
        }];
      }
    });
  }, []);

  // تحديث إعدادات المؤشر
  const updateIndicatorSettings = useCallback((
    indicatorName: string,
    settings: Partial<IndicatorState>
  ) => {
    setSelectedIndicators(prev =>
      prev.map(i =>
        i.name === indicatorName
          ? { ...i, ...settings }
          : i
      )
    );
  }, []);

  // إعادة إنشاء المخطط عند تغيير الإعدادات
  useEffect(() => {
    if (!chartContainerRef.current || candles.length === 0) return;

    if (chartType === 'candlestick') {
      createMainChart();
    } else {
      createPerformanceChart();
    }

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      safeRemoveChart();
    };
  }, [
    chartType,
    createMainChart,
    createPerformanceChart,
    safeRemoveChart,
    selectedIndicators,
    showVolume,
    showTrades,
    lineChartMode
  ]);

  // تحديث البيانات عند تغيير الشموع
  useEffect(() => {
    if (!chartRef.current || !candlestickSeriesRef.current || candles.length === 0) return;

    if (chartType === 'candlestick' && candlestickSeriesRef.current) {
      const candleData = candles.map(candle => ({
        time: (Date.parse(candle.timestamp) / 1000) as Time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      }));

      candlestickSeriesRef.current.setData(candleData);
    }
  }, [candles, chartType]);

  // حساب الإحصائيات
  const stats = useMemo(() => {
    if (!summary) return null;

    const totalWinningTrades = tradeMarkers.filter(
      t => t.type === 'exit' && t.pnl && t.pnl > 0
    ).length;

    const totalLosingTrades = tradeMarkers.filter(
      t => t.type === 'exit' && t.pnl && t.pnl <= 0
    ).length;

    const avgWinningTrade = tradeMarkers
      .filter(t => t.type === 'exit' && t.pnl && t.pnl > 0)
      .reduce((sum, t) => sum + (t.pnl || 0), 0) / (totalWinningTrades || 1);

    const avgLosingTrade = tradeMarkers
      .filter(t => t.type === 'exit' && t.pnl && t.pnl <= 0)
      .reduce((sum, t) => sum + (t.pnl || 0), 0) / (totalLosingTrades || 1);

    const largestWinningTrade = Math.max(
      ...tradeMarkers
        .filter(t => t.type === 'exit' && t.pnl && t.pnl > 0)
        .map(t => t.pnl || 0)
    );

    const largestLosingTrade = Math.min(
      ...tradeMarkers
        .filter(t => t.type === 'exit' && t.pnl && t.pnl < 0)
        .map(t => t.pnl || 0)
    );

    return {
      ...summary,
      totalWinningTrades,
      totalLosingTrades,
      avgWinningTrade,
      avgLosingTrade,
      largestWinningTrade,
      largestLosingTrade,
    };
  }, [summary, tradeMarkers]);

  // تنسيق الأرقام
  const formatNumber = (num: number | undefined, decimals: number = 2): string => {
    // تحقق إذا كانت القيمة undefined أو null
    if (num === undefined || num === null) {
      return '0.00';
    }
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };


  const formatPercent = (num: number | undefined | null): string => {
    if (num === undefined || num === null || isNaN(num)) {
      return '+0.00%';
    }
    return `${num >= 0 ? '+' : ''}${formatNumber(num)}%`;
  };

  return (
    <Tabs value={activeTab} onVolumeChange={setActiveTab} className="flex flex-col h-full bg-[#0B0E11] rounded-lg border border-[#2A2E39] overflow-hidden font-sans">

      {/* --- ADVANCED HEADER: Stats & Controls --- */}
      <div className="flex flex-col bg-[#131722] border-b border-[#2A2E39] shrink-0 z-20">

        {/* Top Bar: Title & Actions */}
        <div className="h-12 flex items-center justify-between px-4 border-b border-[#2A2E39]/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <h1 className="text-sm font-bold text-white tracking-wide">
                {symbol} <span className="text-gray-500 font-normal mx-1">|</span> {timeframe}
              </h1>
            </div>

            {/* Quick Stats Pills */}
            <div className="h-6 w-px bg-[#2A2E39] mx-1"></div>

            {summary && (
              <div className="flex items-center gap-2">
                <div className={`px-2 py-1 rounded text-xs font-bold font-mono border ${summary.total_pnl >= 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                  {summary.total_pnl >= 0 ? <TrendingUp className="inline w-3 h-3 mr-1" /> : <TrendingDown className="inline w-3 h-3 mr-1" />}
                  {formatPercent(summary.total_pnl_percent)}
                </div>
                <div className="px-2 py-1 rounded text-xs font-bold font-mono bg-[#1E222D] text-gray-300 border border-[#2A2E39]">
                  {formatNumber(summary.total_trades)} Trades
                </div>
                <div className="px-2 py-1 rounded text-xs font-bold font-mono bg-[#1E222D] text-gray-300 border border-[#2A2E39]">
                  {formatNumber(summary.win_rate)}% Win
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-[#1E222D]" onClick={onExport}>
              <Download className="h-4 w-4" />
            </Button>
            <div className="h-4 w-px bg-[#2A2E39]"></div>
            {onStartPlay && onStopPlay && (
              <Button
                size="sm"
                className={`h-8 px-3 text-xs font-bold border-0 transition-all ${isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                onClick={isPlaying ? onStopPlay : onStartPlay}
              >
                {isPlaying ? <Pause className="w-3 h-3 mr-1.5" /> : <Play className="w-3 h-3 mr-1.5" />}
                {isPlaying ? 'STOP' : 'PLAY'}
              </Button>
            )}
          </div>
        </div>

        {/* Sub Bar: Tools & Tabs */}
        <div className="h-10 flex items-center justify-between px-4 bg-[#131722]">
          <div className="flex items-center gap-4">
            <TabsList className="bg-transparent h-8 p-0 gap-1">
              <TabsTrigger
                value="chart"
                className="h-8 px-3 rounded-md data-[state=active]:bg-[#2962FF] data-[state=active]:text-white text-gray-400 text-xs font-medium hover:bg-[#1E222D] transition-colors"
                onClick={() => setActiveTab('chart')}
              >
                <Layers className="w-3.5 h-3.5 mr-2" />
                Chart
              </TabsTrigger>
              <TabsTrigger
                value="performance"
                className="h-8 px-3 rounded-md data-[state=active]:bg-[#1E222D] data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-gray-700 text-gray-400 text-xs font-medium hover:bg-[#1E222D] transition-colors"
                onClick={() => setActiveTab('performance')}
              >
                <Activity className="w-3.5 h-3.5 mr-2" />
                Analysis
              </TabsTrigger>
              <TabsTrigger
                value="trades"
                className="h-8 px-3 rounded-md data-[state=active]:bg-[#1E222D] data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-gray-700 text-gray-400 text-xs font-medium hover:bg-[#1E222D] transition-colors"
                onClick={() => setActiveTab('trades')}
              >
                <Target className="w-3.5 h-3.5 mr-2" />
                Trades
              </TabsTrigger>
              <TabsTrigger
                value="indicators"
                className="h-8 px-3 rounded-md data-[state=active]:bg-[#1E222D] data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-gray-700 text-gray-400 text-xs font-medium hover:bg-[#1E222D] transition-colors"
                onClick={() => setActiveTab('indicators')}
              >
                <Settings className="w-3.5 h-3.5 mr-2" />
                Indicators
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Chart Controls */}
            {activeTab === 'chart' && (
              <>
                <div className="flex items-center gap-1 bg-[#0B0E11] rounded border border-[#2A2E39] p-0.5">
                  <Button size="sm" variant={chartType === 'candlestick' ? 'secondary' : 'ghost'} className="h-6 px-2 text-[10px]" onClick={() => setChartType('candlestick')}>Candles</Button>
                  <Button size="sm" variant={chartType === 'line' ? 'secondary' : 'ghost'} className="h-6 px-2 text-[10px]" onClick={() => setChartType('line')}>Equity</Button>
                </div>
                <div className="w-px h-4 bg-[#2A2E39]"></div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="show-vol" className="text-[10px] text-gray-400 cursor-pointer">Vol</Label>
                  <Checkbox id="show-vol" checked={showVolume} onCheckedChange={setShowVolume} className="h-3 w-3 border-gray-600" />
                  <Label htmlFor="show-trades" className="text-[10px] text-gray-400 cursor-pointer">Trades</Label>
                  <Checkbox id="show-trades" checked={showTrades} onCheckedChange={setShowTrades} className="h-3 w-3 border-gray-600" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex overflow-hidden relative min-h-0">


        {/* --- VIEW: CHART --- */}
        {activeTab === 'chart' && (
          <div className="flex-1 relative bg-[#0B0E11]">
            <div ref={chartContainerRef} className="w-full h-full" />

            {/* Floating Overlay: Crosshair Info */}
            {showCrosshairData && crosshairData.candle && (
              <div className="absolute top-4 left-4 bg-[#131722]/90 backdrop-blur-sm border border-[#2A2E39] rounded shadow-xl p-3 min-w-[180px] pointer-events-none z-30">
                <div className="flex items-center justify-between mb-2 border-b border-gray-800 pb-1">
                  <span className="text-xs font-mono text-gray-400">{crosshairData.time}</span>
                  <Badge className="h-4 text-[9px] px-1 bg-[#2A2E39] text-gray-300 border-0">
                    O:{formatNumber(crosshairData.candle.open)}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-y-1 gap-x-4 text-xs">
                  <span className="text-gray-500">Price</span>
                  <span className="text-gray-200 font-mono">{formatNumber(crosshairData.candle.close)}</span>
                  {crosshairData.candle.current_pnl !== null && (
                    <>
                      <span className="text-gray-500">PnL</span>
                      <span className={`font-mono ${crosshairData.candle.current_pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {formatNumber(crosshairData.candle.current_pnl)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Active Indicators Overlay (Bottom Left) */}
            {selectedIndicators.filter(i => i.enabled).length > 0 && (
              <div className="absolute bottom-4 left-4 flex gap-2 pointer-events-none z-30">
                {selectedIndicators.filter(i => i.enabled).map(ind => (
                  <div key={ind.name} className="flex items-center gap-1.5 px-2 py-1 bg-[#131722]/80 backdrop-blur border border-[#2A2E39] rounded text-[10px]">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ind.color }}></div>
                    <span className="text-gray-300 font-mono">{ind.name.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- VIEW: PERFORMANCE (Advanced Grid) --- */}
        {activeTab === 'performance' && (
          <div className="flex-1 overflow-y-auto p-6 bg-[#0B0E11] space-y-6">

            {/* ===== CAPITAL & OVERALL PERFORMANCE ===== */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Initial Capital */}
              <Card className="bg-[#131722] border-[#2A2E39]">
                <CardContent className="p-4">
                  <div className="text-gray-500 text-xs mb-2 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> Initial Capital
                  </div>
                  <div className="text-xl font-bold text-white font-mono">
                    {summary ? formatNumber(summary.initial_capital, 2) : '0.00'}
                  </div>
                  <div className="text-[10px] text-gray-600 mt-1">Starting balance</div>
                </CardContent>
              </Card>

              {/* Final Capital */}
              <Card className="bg-[#131722] border-[#2A2E39]">
                <CardContent className="p-4">
                  <div className="text-gray-500 text-xs mb-2 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> Final Capital
                  </div>
                  <div className="text-xl font-bold text-white font-mono">
                    {summary ? formatNumber(summary.final_capital, 2) : '0.00'}
                  </div>
                  <div className={`text-xs ${summary && summary.total_pnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {summary ? formatNumber(summary.total_pnl, 2) : '0.00'} ({summary ? formatPercent(summary.total_pnl_percent) : '0%'})
                  </div>
                </CardContent>
              </Card>

              {/* Net Profit */}
              <Card className="bg-[#131722] border-[#2A2E39] col-span-1 md:col-span-2 lg:col-span-1">
                <CardContent className="p-4">
                  <div className="text-gray-500 text-xs mb-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Net Profit
                  </div>
                  <div className={`text-2xl font-bold font-mono ${summary && summary.total_pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {summary ? formatNumber(summary.total_pnl, 2) : '0.00'}
                  </div>
                  <div className={`text-sm ${summary && summary.total_pnl_percent >= 0 ? 'text-emerald-500/80' : 'text-red-500/80'}`}>
                    {summary ? formatPercent(summary.total_pnl_percent) : '0.00%'}
                  </div>
                </CardContent>
              </Card>

              {/* Annual Return */}
              <Card className="bg-[#131722] border-[#2A2E39]">
                <CardContent className="p-4">
                  <div className="text-gray-500 text-xs mb-2 flex items-center gap-1">
                    <Activity className="w-3 h-3" /> Annual Return
                  </div>
                  <div className={`text-xl font-bold font-mono ${summary && summary.annual_return_percent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {summary ? formatPercent(summary.annual_return_percent) : '0%'}
                  </div>
                  <div className="text-[10px] text-gray-600 mt-1">Annualized</div>
                </CardContent>
              </Card>

              {/* Execution Time */}
              <Card className="bg-[#131722] border-[#2A2E39]">
                <CardContent className="p-4">
                  <div className="text-gray-500 text-xs mb-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Execution Time
                  </div>
                  <div className="text-xl font-bold text-white font-mono">
                    {summary ? formatNumber(summary.execution_time_seconds, 2) : '0'}s
                  </div>
                  <div className="text-[10px] text-gray-600 mt-1">Backtest duration</div>
                </CardContent>
              </Card>
            </div>

            {/* ===== TRADE STATISTICS ===== */}
            <div>
              <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase">Trade Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <Card className="bg-[#131722] border-[#2A2E39]">
                  <CardContent className="p-3">
                    <div className="text-[10px] text-gray-500 uppercase mb-1 flex items-center gap-1">
                      <List className="w-3 h-3" /> Total Trades
                    </div>
                    <div className="text-lg font-bold text-white font-mono">{summary ? formatNumber(summary.total_trades) : '0'}</div>
                  </CardContent>
                </Card>

                <Card className="bg-[#131722] border-[#2A2E39]">
                  <CardContent className="p-3">
                    <div className="text-[10px] text-gray-500 uppercase mb-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Winning Trades
                    </div>
                    <div className="text-lg font-bold text-emerald-400 font-mono">{summary ? formatNumber(summary.winning_trades) : '0'}</div>
                  </CardContent>
                </Card>

                <Card className="bg-[#131722] border-[#2A2E39]">
                  <CardContent className="p-3">
                    <div className="text-[10px] text-gray-500 uppercase mb-1 flex items-center gap-1">
                      <X className="w-3 h-3" /> Losing Trades
                    </div>
                    <div className="text-lg font-bold text-red-400 font-mono">{summary ? formatNumber(summary.losing_trades) : '0'}</div>
                  </CardContent>
                </Card>

                <Card className="bg-[#131722] border-[#2A2E39]">
                  <CardContent className="p-3">
                    <div className="text-[10px] text-gray-500 uppercase mb-1 flex items-center gap-1">
                      <Gauge className="w-3 h-3" /> Win Rate
                    </div>
                    <div className="text-lg font-bold text-white font-mono">{summary ? formatNumber(summary.win_rate) : '0'}%</div>
                  </CardContent>
                </Card>

                <Card className="bg-[#131722] border-[#2A2E39]">
                  <CardContent className="p-3">
                    <div className="text-[10px] text-gray-500 uppercase mb-1 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Profit Factor
                    </div>
                    <div className={`text-lg font-bold font-mono ${summary && summary.profit_factor >= 1 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {summary ? formatNumber(summary.profit_factor, 2) : '0'}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#131722] border-[#2A2E39]">
                  <CardContent className="p-3">
                    <div className="text-[10px] text-gray-500 uppercase mb-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Expectancy
                    </div>
                    <div className={`text-lg font-bold font-mono ${summary && summary.expectancy >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {summary ? formatNumber(summary.expectancy, 2) : '0'}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* ===== RISK METRICS ===== */}
            <div>
              <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase">Risk Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <Card className="bg-[#131722] border-[#2A2E39]">
                  <CardContent className="p-3">
                    <div className="text-[10px] text-gray-500 uppercase mb-1 flex items-center gap-1">
                      <Activity className="w-3 h-3" /> Max Drawdown
                    </div>
                    <div className="text-lg font-bold text-red-400 font-mono">
                      {summary ? formatPercent(summary.max_drawdown_percent) : '0%'}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#131722] border-[#2A2E39]">
                  <CardContent className="p-3">
                    <div className="text-[10px] text-gray-500 uppercase mb-1 flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" /> Sharpe Ratio
                    </div>
                    <div className={`text-lg font-bold font-mono ${summary && summary.sharpe_ratio >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {summary ? formatNumber(summary.sharpe_ratio, 2) : '0'}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#131722] border-[#2A2E39]">
                  <CardContent className="p-3">
                    <div className="text-[10px] text-gray-500 uppercase mb-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Sortino Ratio
                    </div>
                    <div className={`text-lg font-bold font-mono ${summary && summary.sortino_ratio >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {summary ? formatNumber(summary.sortino_ratio, 2) : '0'}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#131722] border-[#2A2E39]">
                  <CardContent className="p-3">
                    <div className="text-[10px] text-gray-500 uppercase mb-1 flex items-center gap-1">
                      <Activity className="w-3 h-3" /> Calmar Ratio
                    </div>
                    <div className={`text-lg font-bold font-mono ${summary && summary.calmar_ratio >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {summary ? formatNumber(summary.calmar_ratio, 2) : '0'}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* ===== ADVANCED METRICS ===== */}
            <div>
              <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase">Advanced Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <Card className="bg-[#131722] border-[#2A2E39]">
                  <CardContent className="p-3">
                    <div className="text-[10px] text-gray-500 uppercase mb-1 flex items-center gap-1">
                      <BarChart className="w-3 h-3" /> Volatility (Annual)
                    </div>
                    <div className="text-sm font-bold text-white font-mono">
                      {advancedMetrics?.volatility_annual ? formatPercent(advancedMetrics.volatility_annual) : '0%'}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#131722] border-[#2A2E39]">
                  <CardContent className="p-3">
                    <div className="text-[10px] text-gray-500 uppercase mb-1 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> VaR (95%)
                    </div>
                    <div className="text-sm font-bold text-white font-mono">
                      {advancedMetrics?.var_95 ? formatNumber(advancedMetrics.var_95, 2) : '0'}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#131722] border-[#2A2E39]">
                  <CardContent className="p-3">
                    <div className="text-[10px] text-gray-500 uppercase mb-1 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> CVaR (95%)
                    </div>
                    <div className="text-sm font-bold text-white font-mono">
                      {advancedMetrics?.cvar_95 ? formatNumber(advancedMetrics.cvar_95, 2) : '0'}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#131722] border-[#2A2E39]">
                  <CardContent className="p-3">
                    <div className="text-[10px] text-gray-500 uppercase mb-1 flex items-center gap-1">
                      <Brain className="w-3 h-3" /> System Quality
                    </div>
                    <div className={`text-sm font-bold font-mono ${advancedMetrics?.system_quality_number >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {advancedMetrics?.system_quality_number ? formatNumber(advancedMetrics.system_quality_number, 2) : '0'}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#131722] border-[#2A2E39]">
                  <CardContent className="p-3">
                    <div className="text-[10px] text-gray-500 uppercase mb-1 flex items-center gap-1">
                      <Target className="w-3 h-3" /> Kelly Criterion
                    </div>
                    <div className="text-sm font-bold text-white font-mono">
                      {advancedMetrics?.kelly_criterion ? formatNumber(advancedMetrics.kelly_criterion, 4) : '0'}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#131722] border-[#2A2E39]">
                  <CardContent className="p-3">
                    <div className="text-[10px] text-gray-500 uppercase mb-1 flex items-center gap-1">
                      <Cpu className="w-3 h-3" /> Architecture
                    </div>
                    <div className="text-sm font-bold text-blue-400 font-mono">
                      {summary ? summary.architecture_mode : 'N/A'}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

          </div>
        )}

        {/* --- VIEW: TRADES (Clean Table) --- */}
        {activeTab === 'trades' && (
          <div className="flex-1 flex flex-col bg-[#0B0E11]">
            <div className="flex-1 overflow-auto">
              <Table className="w-full">
                <TableHeader className="bg-[#131722] sticky top-0 z-10 shadow-md">
                  <TableRow className="border-[#2A2E39] hover:bg-transparent">
                    <TableHead className="text-[10px] text-gray-500 font-bold uppercase w-16">#</TableHead>
                    <TableHead className="text-[10px] text-gray-500 font-bold uppercase">Type</TableHead>
                    <TableHead className="text-[10px] text-gray-500 font-bold uppercase text-right">Price</TableHead>
                    <TableHead className="text-[10px] text-gray-500 font-bold uppercase text-right">Size</TableHead>
                    <TableHead className="text-[10px] text-gray-500 font-bold uppercase text-right">PnL</TableHead>
                    <TableHead className="text-[10px] text-gray-500 font-bold uppercase w-24">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-[#2A2E39]/50">
                  {tradeMarkers.map((trade, index) => (
                    <TableRow key={trade.trade_id || index} className="hover:bg-[#1E222D]/50 transition-colors cursor-pointer group">
                      <TableCell className="text-[11px] text-gray-500 font-mono">{index + 1}</TableCell>
                      <TableCell>
                        <Badge className={`${trade.type === 'entry' ? 'bg-blue-500/10 text-blue-400' : (trade.pnl && trade.pnl > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400')} border-0 text-[10px] px-1.5 py-0.5`}>
                          {trade.type === 'entry' ? (trade.position_type === 'long' ? 'LONG' : 'SHORT') : 'EXIT'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[11px] text-gray-300 font-mono text-right">{formatNumber(trade.price)}</TableCell>
                      <TableCell className="text-[11px] text-gray-400 font-mono text-right">{formatNumber(trade.position_size)}</TableCell>
                      <TableCell className={`text-[11px] font-mono text-right ${trade.pnl && trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {trade.pnl !== undefined ? formatNumber(trade.pnl) : '-'}
                      </TableCell>
                      <TableCell className="text-[10px] text-gray-600 font-mono w-32 whitespace-nowrap">
                        {new Date(trade.timestamp).toLocaleTimeString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* --- VIEW: INDICATORS (Toggles) --- */}
        {activeTab === 'indicators' && (
          <div className="flex-1 overflow-y-auto p-6 bg-[#0B0E11]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {extractedIndicators.map(indicator => {
                const isSelected = selectedIndicators.some(i => i.name === indicator && i.enabled);
                return (
                  <Card key={indicator} className={`border ${isSelected ? 'border-blue-500/50 bg-[#1E222D]' : 'border-[#2A2E39] bg-[#131722]'} hover:border-gray-500 transition-all cursor-pointer group`}
                    onClick={() => toggleIndicator(indicator)}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded flex items-center justify-center ${isSelected ? 'bg-blue-500/20' : 'bg-[#2A2E39]'}`}>
                          <Activity className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-gray-500'}`} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-200">{indicator.toUpperCase()}</div>
                          <div className="text-[9px] text-gray-500 uppercase">{getIndicatorDescription(indicator).split(' ')[0]}</div>
                        </div>
                      </div>
                      <Checkbox checked={isSelected} className="border-gray-600 pointer-events-none" />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </Tabs>
  );
}


// Helper functions
function getCategoryForIndicator(indicator: string): string {
  const lowerIndicator = indicator.toLowerCase();
  if (lowerIndicator.includes('sma') || lowerIndicator.includes('ema') || lowerIndicator.includes('wma')) {
    return 'اتجاه';
  }
  if (lowerIndicator.includes('rsi') || lowerIndicator.includes('macd') || lowerIndicator.includes('stochastic')) {
    return 'زخم';
  }
  if (lowerIndicator.includes('bollinger') || lowerIndicator.includes('atr') || lowerIndicator.includes('vol')) {
    return 'تقلب';
  }
  if (lowerIndicator.includes('volume') || lowerIndicator.includes('obv')) {
    return 'حجم';
  }
  return 'عام';
}

function getIndicatorDescription(indicator: string): string {
  const lowerIndicator = indicator.toLowerCase();
  if (lowerIndicator.includes('sma')) return 'المتوسط المتحرك البسيط - مقياس لاتجاه السعر';
  if (lowerIndicator.includes('ema')) return 'المتوسط المتحرك الأسي - يركز أكثر على الأسعار الحديثة';
  if (lowerIndicator.includes('rsi')) return 'مؤشر القوة النسبية - قياس زخم السعر';
  if (lowerIndicator.includes('macd')) return 'تقارب وتباعد المتوسطات المتحركة';
  if (lowerIndicator.includes('bollinger')) return 'نطاقات بولينجر - قياس تقلب السعر';
  if (lowerIndicator.includes('atr')) return 'معدل المدى الحقيقي - قياس التقلب';
  if (lowerIndicator.includes('stochastic')) return 'المؤشر العشوائي - تحديد نقاط التشبع';
  if (lowerIndicator.includes('volume')) return 'حجم التداول - قوة الحركة السعرية';
  return 'مؤشر تقني لتحليل الأسواق';
}
