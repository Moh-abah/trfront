// @ts-nocheck
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
  RefreshCw
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
          <div className="flex-1 overflow-y-auto p-6 bg-[#0B0E11]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Main PnL Card */}
              <Card className="bg-[#131722] border-[#2A2E39] col-span-1 md:col-span-2 overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4 flex items-center justify-between bg-[#1E222D]/50 border-b border-[#2A2E39]">
                    <span className="text-xs font-bold text-gray-400 uppercase">Net Profit</span>
                    <Badge className="bg-blue-500/10 text-blue-400 border-0 text-[10px]">ROI</Badge>
                  </div>
                  <div className="p-6">
                    <div className={`text-3xl font-bold font-mono mb-1 ${summary && summary.total_pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {summary ? formatNumber(summary.total_pnl) : '0.00'}
                    </div>
                    <div className={`text-sm font-medium ${summary && summary.total_pnl_percent >= 0 ? 'text-emerald-500/80' : 'text-red-500/80'}`}>
                      {summary ? formatPercent(summary.total_pnl_percent) : '0.00%'}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Secondary Metrics */}
              <Card className="bg-[#131722] border-[#2A2E39]">
                <CardContent className="p-4">
                  <div className="text-gray-500 text-xs mb-2 flex items-center gap-1">
                    <Gauge className="w-3 h-3" /> Win Rate
                  </div>
                  <div className="text-2xl font-bold text-white font-mono">{summary ? formatNumber(summary.win_rate) : '0'}%</div>
                  <div className="text-[10px] text-gray-600 mt-1">Probability of success</div>
                </CardContent>
              </Card>

              <Card className="bg-[#131722] border-[#2A2E39]">
                <CardContent className="p-4">
                  <div className="text-gray-500 text-xs mb-2 flex items-center gap-1">
                    <Activity className="w-3 h-3" /> Max Drawdown
                  </div>
                  <div className="text-2xl font-bold text-red-400 font-mono">{summary ? formatPercent(summary.max_drawdown_percent) : '0%'}</div>
                  <div className="text-[10px] text-gray-600 mt-1">Largest peak to valley</div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: 'Profit Factor', val: summary ? formatNumber(summary.profit_factor) : '-', icon: Zap },
                { label: 'Sharpe Ratio', val: summary ? formatNumber(summary.sharpe_ratio) : '-', icon: BarChart3 },
                { label: 'Sortino', val: summary ? formatNumber(summary.sortino_ratio) : '-', icon: TrendingUp },
                { label: 'Avg Win', val: summary ? formatNumber(summary.avg_winning_trade) : '-', icon: ArrowUpRight, color: 'text-emerald-400' },
                { label: 'Avg Loss', val: summary ? formatNumber(summary.avg_losing_trade) : '-', icon: ArrowDownRight, color: 'text-red-400' },
                { label: 'Total Trades', val: summary ? formatNumber(summary.total_trades) : '-', icon: List },
              ].map((item, idx) => (
                <Card key={idx} className="bg-[#131722] border-[#2A2E39]">
                  <CardContent className="p-3">
                    <div className="text-[10px] text-gray-500 uppercase mb-1 flex items-center gap-1">
                      <item.icon className="w-3 h-3" /> {item.label}
                    </div>
                    <div className={`text-sm font-bold font-mono ${item.color || 'text-gray-200'}`}>{item.val}</div>
                  </CardContent>
                </Card>
              ))}
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




// من اجل نجرب الديزاين الجديد الذي سيكون فوق 
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
  
//   createSeriesMarkers,
//   type SeriesMarker,
//   type ISeriesMarkersPluginApi,
//   type ISeriesPrimitive,
//   type Time,
//   MouseEventParams,
//   PriceLineOptions
// } from 'lightweight-charts';
// import {

// } from 'lightweight-charts';

// import {
//   TrendingUp,
//   TrendingDown,
//   Play,
//   Pause,
//   Maximize2,
//   Layers,
//   Download,
//   Settings,
//   Info,
//   Activity,
//   BarChart3,
//   DollarSign,
//   Target,
//   AlertCircle,
//   CheckCircle2,
//   X,
//   Filter,
//   LayoutTemplate,
//   ChevronDown,
//   ChevronUp,
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

// interface ChartLayout {
//   showMainChart: boolean;
//   showVolume: boolean;
//   showEquity: boolean;
//   showIndicatorsPanel: boolean;
//   showTradesPanel: boolean;
// }

// // أنماط المؤشرات
// export type IndicatorPattern = 'sma' | 'ema' | 'rsi' | 'macd' | 'bollinger' | 'atr' | 'stochastic' | 'volume';

// // تعريف أنماط المؤشرات المتاحة
// const INDICATOR_PATTERNS: Record<IndicatorPattern, {
//   name: string;
//   category: string;
//   defaultParams: Record<string, number>;
//   description: string;
// }> = {
//   sma: {
//     name: 'SMA',
//     category: 'trend',
//     defaultParams: { period: 20 },
//     description: 'Simple Moving Average'
//   },
//   ema: {
//     name: 'EMA',
//     category: 'trend',
//     defaultParams: { period: 20 },
//     description: 'Exponential Moving Average'
//   },
//   rsi: {
//     name: 'RSI',
//     category: 'momentum',
//     defaultParams: { period: 14, overbought: 70, oversold: 30 },
//     description: 'Relative Strength Index'
//   },
//   macd: {
//     name: 'MACD',
//     category: 'momentum',
//     defaultParams: { fast: 12, slow: 26, signal: 9 },
//     description: 'Moving Average Convergence Divergence'
//   },
//   bollinger: {
//     name: 'Bollinger Bands',
//     category: 'volatility',
//     defaultParams: { period: 20, stdDev: 2 },
//     description: 'Bollinger Bands'
//   },
//   atr: {
//     name: 'ATR',
//     category: 'volatility',
//     defaultParams: { period: 14 },
//     description: 'Average True Range'
//   },
//   stochastic: {
//     name: 'Stochastic',
//     category: 'momentum',
//     defaultParams: { kPeriod: 14, dPeriod: 3, smoothing: 3 },
//     description: 'Stochastic Oscillator'
//   },
//   volume: {
//     name: 'Volume',
//     category: 'volume',
//     defaultParams: {},
//     description: 'Trading Volume'
//   }
// };

// // ألوان داكنة للمؤشرات
// const INDICATOR_COLORS = [
//   '#3B82F6', // أزرق
//   '#8B5CF6', // بنفسجي
//   '#F59E0B', // برتقالي
//   '#10B981', // أخضر
//   '#EF4444', // أحمر
//   '#06B6D4', // سماوي
//   '#EC4899', // وردي
//   '#84CC16', // أخضر فاتح
//   '#F97316', // برتقالي غامق
//   '#6366F1', // نيلي
// ];

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
//   // Refs للمخطط
//   const chartContainerRef = useRef<HTMLDivElement>(null);
//   const chartRef = useRef<IChartApi | null>(null);
//   const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
//   const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
//   const indicatorSeriesRef = useRef<Map<string, ISeriesApi<'Line'>>>(new Map());
//   const equitySeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
//   const priceScalesRef = useRef<Map<string, { top: number; bottom: number }>>(new Map());
//   // State
//   const [selectedIndicators, setSelectedIndicators] = useState<IndicatorState[]>([]);
//   const [chartType, setChartType] = useState<'candlestick' | 'line'>('candlestick');
//   const [lineChartMode, setLineChartMode] = useState<'equity' | 'drawdown'>('equity');
//   const [showVolume, setShowVolume] = useState(true);
//   const [showTrades, setShowTrades] = useState(true);
//   const [showCrosshairData, setShowCrosshairData] = useState(true);
//   let markersPlugin: ISeriesMarkersPluginApi<Time> | null = null;


//   let resizeObserverRef: ResizeObserver | null = null;
//   const [activeTab, setActiveTab] = useState<'chart' | 'performance' | 'trades' | 'indicators'>('chart');
//   const [crosshairData, setCrosshairData] = useState<{
//     price?: number;
//     time?: string;
//     candle?: VisualCandle;
//   }>({});
//   const [selectedTrade, setSelectedTrade] = useState<TradeMarker | null>(null);
//   const [layout, setLayout] = useState<ChartLayout>({
//     showMainChart: true,
//     showVolume: true,
//     showEquity: false,
//     showIndicatorsPanel: true,
//     showTradesPanel: false,
//   });
//   const [chartTimeframe, setChartTimeframe] = useState(timeframe);
//   const [isFullscreen, setIsFullscreen] = useState(false);

//   // استخراج المؤشرات المتاحة من البيانات
//   const extractedIndicators = useMemo(() => {
//     const indicators = new Set<string>();
//     candles.forEach(candle => {
//       // 1. البحث في مستوى الجذر المباشر (يدعم بياناتك الحالية)
//       Object.keys(candle).forEach(key => {
//         if (key.startsWith('ind_')) {
//           indicators.add(key.replace('ind_', ''));
//         }
//       });

//       // 2. البحث داخل كائن indicators (للتوافق مع البنيات القياسية)
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

//   // دالة آمنة لإزالة المخطط
//   const safeRemoveChart = useCallback(() => {
//     if (chartRef.current) {
//       try {
//         chartRef.current.remove();
//       } catch (error) {
//         console.log('Chart already disposed, skipping removal');
//       }
//       chartRef.current = null;
//       candlestickSeriesRef.current = null;
//       volumeSeriesRef.current = null;
//       equitySeriesRef.current = null;
//       indicatorSeriesRef.current.clear();
//     }
//   }, []);


//   //  دالة مهمة: تحديد ما إذا كان المؤشر فوق السعر أو في لوحة منفصلة
//   function getIndicatorLayout(indicatorName: string): 'overlay' | 'separate' {
//     const name = indicatorName.toLowerCase();

//     // المؤشرات التي عادةً تتداخل مع السعر (Overlay)
//     if (name.includes('sma') || name.includes('ema') || name.includes('wma') ||
//       name.includes('bollinger') || name.includes('vwap')) {
//       return 'overlay';
//     }

//     // المؤشرات التي تحتاج لوحة منفصلة (Separate)
//     if (name.includes('rsi') || name.includes('stochastic') || name.includes('macd') ||
//       name.includes('atr') || name.includes('cci') || name.includes('ao')) {
//       return 'separate';
//     }

//     return 'separate'; // الافتراضي: لوحة منفصلة للسلامة
//   }


//   const calculateLayout = useCallback(() => {
//     // إعادة تعيين الذاكرة لتسريح المراجع القديمة
//     priceScalesRef.current.clear();

//     // المساحات الافتراضية (يمكن تعديلها حسب الرغبة)
//     const mainChartTop = 0;
//     const mainChartBottom = 0.5; // الشموع تأخذ النصف العلوي

//     priceScalesRef.current.set('candlestick', { top: mainChartTop, bottom: mainChartBottom });

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


//   // إنشاء المخطط الرئيسي
//   const createMainChart = useCallback(() => {
//     if (!chartContainerRef.current || candles.length === 0) return;

//     safeRemoveChart();
//     calculateLayout();

//     // خيارات المخطط الداكن المتقدم
//     const chartOptions = {
//       width: chartContainerRef.current.clientWidth,
//       height: chartContainerRef.current.clientHeight,
//       layout: {
//         background: { type: 'solid', color: '#131722' },
//         textColor: '#D9D9D9',
//       },
//       grid: {
//         vertLines: {
//           color: '#2A2E39',
//           style: 0,
//           visible: true,
//         },
//         horzLines: {
//           color: '#2A2E39',
//           style: 0,
//           visible: true,
//         },
//       },
//       crosshair: {
//         mode: CrosshairMode.Normal,
//         vertLine: {
//           width: 1,
//           color: '#758696',
//           style: 2, // خط متقطع
//           labelBackgroundColor: '#1E222D',
//         },
//         horzLine: {
//           width: 1,
//           color: '#758696',
//           style: 2,
//           labelBackgroundColor: '#1E222D',
//         },
//       },
//       rightPriceScale: {
//         borderColor: '#2A2E39',
//         scaleMargins: {
//           top: 0.1,
//           bottom: showVolume ? 0.2 : 0.1,
//         },
//       },
//       timeScale: {
//         borderColor: '#2A2E39',
//         visible: true,
//         timeVisible: true,
//         ticksVisible: true,
//         secondsVisible: false,
//       },
//       localization: {
//         locale: 'ar-SA',
//         dateFormat: 'dd-MM-yyyy',
//       },
//     };

//     const chart = createChart(chartContainerRef.current, chartOptions);
//     const mainMargins = priceScalesRef.current.get('candlestick') || { top: 0.1, bottom: 0.5 };


//     // إضافة سلسلة الشموع
//     const candlestickSeries = chart.addSeries(CandlestickSeries, {
//       upColor: '#26A69A',
//       downColor: '#EF5350',
//       wickUpColor: '#26A69A',
//       wickDownColor: '#EF5350',
//       borderUpColor: '#26A69A',
//       borderDownColor: '#EF5350',
//       priceScaleId: 'candlestick',
//       // priceScaleId: 'main', // مقياس خاص للشموع
//       scaleMargins: { top: mainMargins.top, bottom: mainMargins.bottom },
//     });

//     // إعداد بيانات الشموع
//     const candleData = candles.map(candle => ({
//       time: (Date.parse(candle.timestamp) / 1000) as Time,
//       open: candle.open,
//       high: candle.high,
//       low: candle.low,
//       close: candle.close,
//     }));

//     candlestickSeries.setData(candleData);
//     candlestickSeriesRef.current = candlestickSeries;


//         // --- Volume Series (Histogram) ---
//         if (showVolume) {
//           const volMargins = priceScalesRef.current.get('volume') || { top: 0.78, bottom: 0.0 };
//           const volumeSeries = chart.addSeries(HistogramSeries, {
//             priceFormat: { type: 'volume' as const },
//             priceScaleId: 'volume',
//             lastValueVisible: false,
//           });
//           volumeSeries.priceScale().applyOptions({
//             scaleMargins: { top: 0.93, bottom: 0 }, // المساحة المخصصة للفوليوم
//             borderVisible: false,
//           });
    
//           const volumeData = candles.map(candle => ({
//             time: (Date.parse(candle.timestamp) / 1000) as Time,
//             value: candle.volume,
//             color: candle.close >= candle.open
//               ? 'rgba(38, 166, 154, 0.5)'
//               : 'rgba(239, 83, 80, 0.5)',
//           }));
//           volumeSeries.setData(volumeData);
//           volumeSeriesRef.current = volumeSeries;
//         }
    
  

//     // إضافة المؤشرات المحددة
//     selectedIndicators.filter(ind => ind.enabled).forEach((indicator, index) => {
//       const layout = getIndicatorLayout(indicator.name);
//       if (layout === 'overlay') {
//         // رسم فوق السعر (مشاركة المقياس الرئيسي)
//         addIndicatorLine(chart, candles, indicator, 'candlestick', index);

//       } else if (layout === 'separate') {
//         // رسم فوق السعر (مشاركة المقياس الرئيسي)
//         const priceScaleId = indicator.name;

//         // إنشاء PriceScale للمؤشر إذا لم يكن موجود
//         if (!chart.priceScale(priceScaleId)) {
//           chart.priceScale(priceScaleId); // إنشاء تلقائي للمقياس
//         }

//         addIndicatorLine(chart, candles, indicator, priceScaleId, index, { top: 0.85, bottom: 0.02 });
      
      
//       } else {
//         // رسم في لوحة منفصلة (مقياس خاص بالمؤشر)
//         const panelMargins = priceScalesRef.current.get(indicator.name);
//         if (panelMargins) {
//           addIndicatorLine(chart, candles, indicator, indicator.name, index, panelMargins);
//         }
//       }
//     });
      

//     // إضافة علامات التداول
//     if (showTrades) {
//       addTradeMarkers(chart, tradeMarkers, candles, candlestickSeries);
//     }

//     // إضافة حدث crosshair
//     chart.subscribeCrosshairMove(handleCrosshairMove);

//     chartRef.current = chart;
//   }, [candles, selectedIndicators, showTrades, showVolume, tradeMarkers, safeRemoveChart, calculateLayout]);

//   // إنشاء مخطط الأداء (منحنى رأس المال أو Drawdown)
//   const createPerformanceChart = useCallback(() => {
//     if (!chartContainerRef.current || !equityCurve || !drawdownCurve || !candles?.length) return;

//     // remove previous chart & resources
//     safeRemoveChart(); // must destroy existing chart, remove listeners, reset refs

//     // create chart container
//     const container = chartContainerRef.current;
//     const chart = createChart(container, {
//       width: container.clientWidth,
//       height: container.clientHeight,
//       layout: {
//         background: { type: 'solid', color: '#0F1724' }, // slightly darker
//         textColor: '#D1D5DB',
//         fontFamily: 'Inter, Roboto, system-ui, sans-serif',
//       },
//       grid: {
//         vertLines: { color: '#111827', visible: true },
//         horzLines: { color: '#111827', visible: true },
//       },
//       crosshair: {
//         mode: CrosshairMode.Normal,
//       },
//       rightPriceScale: {
//         borderColor: '#1F2937',
//         autoScale: true,
//         visible: true,
//         scaleMargins: { top: 0.06, bottom: 0.24 }, // reserve bottom space for volume/perf
//       },
//       timeScale: {
//         borderColor: '#1F2937',
//         timeVisible: true,
//         secondsVisible: false,
//       },
//       localization: {
//         locale: 'en-US',
//         dateFormat: 'yyyy-MM-dd',
//       },
//     });

//     // --------- Candles series (primary, big) ----------
//     const candleSeries = chart.addSeries(CandlestickSeries,{
//       upColor: '#10B981',
//       downColor: '#EF4444',
//       wickUpColor: '#10B981',
//       wickDownColor: '#EF4444',
//       borderVisible: false,
//       priceLineVisible: false,
//     });

//     // prepare candles data (convert timestamps to seconds Time)
//     const candleData = candles.map(c => ({
//       time: (typeof c.timestamp === 'number'
//         ? (c.timestamp > 1e12 ? Math.floor(c.timestamp / 1000) : c.timestamp)
//         : Math.floor(new Date(c.timestamp).getTime() / 1000)
//       ) as Time,
//       open: Number(c.open),
//       high: Number(c.high),
//       low: Number(c.low),
//       close: Number(c.close),
//     }));
//     candleSeries.setData(candleData);

//     // --------- Volume series (histogram) below candles ----------
//     const volumeSeries = chart.addSeries(HistogramSeries,{
//       priceFormat: { type: 'volume' },
//       scaleMargins: { top: 0.78, bottom: 0 }, // push volume to bottom 22% of chart
//       priceLineVisible: false,
//       lastValueVisible: false,
//     });

//     const volumeData = candles.map(c => ({
//       time: (typeof c.timestamp === 'number'
//         ? (c.timestamp > 1e12 ? Math.floor(c.timestamp / 1000) : c.timestamp)
//         : Math.floor(new Date(c.timestamp).getTime() / 1000)
//       ) as Time,
//       value: Number(c.volume ?? 0),
//       color: Number(c.close) >= Number(c.open) ? '#10B981' : '#EF4444',
//     }));
//     volumeSeries.setData(volumeData);

//     // --------- Performance / Equity or Drawdown line (overlay or separate scale) ----------
//     // We'll give performance its own scale on the left to avoid interfering with price scale.
//     const perfLine = chart.addSeries(LineSeries,{
//       color: lineChartMode === 'equity' ? '#60A5FA' : '#F97316',
//       lineWidth: 2,
//       priceLineVisible: false,
//       lastValueVisible: true,
//       priceScaleId: 'left', // use left price scale so it doesn't affect candles' right scale
//     });

//     const seriesData = lineChartMode === 'equity' ? equityCurve : drawdownCurve;
//     // map performance points to candle times (align by index)
//     const perfData = seriesData.map((value, idx) => {
//       const c = candles[Math.min(idx, candles.length - 1)];
//       return {
//         time: (typeof c.timestamp === 'number'
//           ? (c.timestamp > 1e12 ? Math.floor(c.timestamp / 1000) : c.timestamp)
//           : Math.floor(new Date(c.timestamp).getTime() / 1000)
//         ) as Time,
//         value: Number(value),
//       };
//     });
//     perfLine.setData(perfData);

//     // optional zero line for drawdown mode
//     if (lineChartMode === 'drawdown') {
//       try {
//         perfLine.createPriceLine({
//           price: 0,
//           color: '#64748B',
//           lineWidth: 1,
//           lineStyle: 1,
//         } as any);
//       } catch (e) { /* some typings may not like; ignore */ }
//     }

//     // --------- Fancy interactive tooltip (DOM overlay) ----------
//     // create tooltip element
//     const tooltip = document.createElement('div');
//     tooltip.style.cssText = [
//       'position: absolute',
//       'display: none',
//       'pointer-events: none',
//       'z-index: 1000',
//       'padding: 8px 10px',
//       'border-radius: 6px',
//       'background: rgba(6,8,12,0.9)',
//       'color: #E6E9EE',
//       'font-size: 12px',
//       'box-shadow: 0 6px 18px rgba(2,6,23,0.6)'
//     ].join(';');
//     container.appendChild(tooltip);

//     // subscribe crosshair move to update tooltip
//     chart.subscribeCrosshairMove(param => {
//       if (!param.point || !param.time) {
//         tooltip.style.display = 'none';
//         return;
//       }
//       // get series prices when available
//       const seriesPrices = (param as any).seriesPrices as Map<any, number | Record<string, number> | undefined>;

//       const candlePrice = seriesPrices?.get(candleSeries) as { open?: number, high?: number, low?: number, close?: number } | number | undefined;
//       const perfPrice = seriesPrices?.get(perfLine) as number | undefined;
//       const volPrice = seriesPrices?.get(volumeSeries) as number | undefined;

//       const date = typeof param.time === 'object' ? `${param.time.year}-${String(param.time.month).padStart(2, '0')}-${String(param.time.day).padStart(2, '0')}` : new Date((param.time as number) * 1000).toISOString().split('T')[0];

//       // build HTML
//       let html = `<div style="font-weight:600;margin-bottom:6px">${date}</div>`;

//       if (typeof candlePrice === 'object' && candlePrice) {
//         html += `<div>O: ${formatNumber(candlePrice.open ?? 0)} &nbsp; H: ${formatNumber(candlePrice.high ?? 0)} &nbsp; L: ${formatNumber(candlePrice.low ?? 0)} &nbsp; C: ${formatNumber(candlePrice.close ?? 0)}</div>`;
//       } else if (typeof candlePrice === 'number') {
//         html += `<div>Price: ${formatNumber(candlePrice)}</div>`;
//       }

//       if (perfPrice !== undefined) html += `<div style="color:${lineChartMode === 'equity' ? '#60A5FA' : '#F97316'};margin-top:6px">Perf: ${formatNumber(perfPrice)}</div>`;
//       if (volPrice !== undefined) html += `<div style="margin-top:6px">Vol: ${formatNumber(volPrice)}</div>`;

//       tooltip.innerHTML = html;
//       tooltip.style.display = 'block';

//       // position tooltip (avoid overflow)
//       const coords = param.point;
//       const left = Math.min(container.clientWidth - 220, Math.max(6, coords.x + 12));
//       const top = Math.max(6, coords.y - 40);
//       tooltip.style.left = `${left}px`;
//       tooltip.style.top = `${top}px`;
//     });

//     // hide tooltip on leave
//     chart.subscribeClick(() => { tooltip.style.display = 'none'; });

//     // ========= responsive: resize observer ==========
//     if (resizeObserverRef) {
//       resizeObserverRef.disconnect();
//       resizeObserverRef = null;
//     }
//     resizeObserverRef = new ResizeObserver(() => {
//       try {
//         chart.applyOptions({ width: container.clientWidth, height: container.clientHeight });
//         setTimeout(() => chart.timeScale().fitContent(), 50);
//       } catch (e) { /* ignore */ }
//     });
//     resizeObserverRef.observe(container);

//     // store chart ref for cleanup
//     chartRef.current = chart;

//     // final niceties:
//     // - fit content so candles + perf are visible
//     try { chart.timeScale().fitContent(); } catch (e) { /* ignore */ }

//     // return chart for further use if needed
//     return chart;
//   }, [candles, equityCurve, drawdownCurve, lineChartMode, safeRemoveChart, summary]);





//   const addIndicatorLine = (
//     chart: IChartApi,
//     candlesData: VisualCandle[],
//     indicator: IndicatorState,
//     priceScaleId: string,
//     colorIndex: number,
//     scaleMargins?: { top: number; bottom: number }
//   ) => {
//     const indicatorName = indicator.name;
//     const indicatorKey = `ind_${indicatorName}`;

//     const data = candlesData
//       .map(candle => {
//         // قراءة المؤشر من الجذر أو من كائن indicators
//         let indicatorValue = (candle as any)[indicatorKey];
//         if (indicatorValue === undefined && candle.indicators) {
//           indicatorValue = candle.indicators[indicatorKey];
//         }
//         if (indicatorValue == null) return null;
//         return {
//           time: Math.floor(new Date(candle.timestamp).getTime() / 1000) as Time,
//           value: indicatorValue,
//         };
//       })
//       .filter(Boolean) as { time: Time; value: number }[];

//     if (!data.length) return;

//     const lineSeries = chart.addSeries(LineSeries, {
//       color: indicator.color ?? '#FACC15',
//       lineWidth: indicator.lineWidth ?? 2,
//       lineStyle: indicator.lineStyle ?? 0,
//       title: indicator.name.toUpperCase(),
//       priceScaleId: priceScaleId,
//       priceLineVisible: false,
//       lastValueVisible: true,
//     });

//     // تطبيق scaleMargins فقط إذا المؤشر على لوحة منفصلة
//     if (scaleMargins) {
//       const top = Math.min(scaleMargins.top, 0.9);
//       const bottom = Math.min(scaleMargins.bottom, 0.9);
//       const sum = top + bottom;
//       const safeMargins = sum >= 1 ? { top: (top / sum) * 0.99, bottom: (bottom / sum) * 0.99 } : { top, bottom };

//       lineSeries.priceScale().applyOptions({
//         scaleMargins: safeMargins,
//         borderVisible: true,
//       });
//     }


//     lineSeries.setData(data);
//     indicatorSeriesRef.current.set(indicatorName, lineSeries);
//   };

  
//   const addTradeMarkers = (
//     chart: IChartApi,
//     markers: TradeMarker[],
//     candlesData: VisualCandle[],
//     series: ISeriesApi<'Candlestick'>
//   ) => {
//     if (!markersPlugin) {
//       markersPlugin = createSeriesMarkers(series);
//     }

//     const tradeMarkers: SeriesMarker<Time>[] = [];

//     markers.forEach(marker => {
//       const candle = candlesData.find(c => c.timestamp === marker.timestamp);
//       if (!candle) return;

//       // تحويل الوقت لأي شكل إلى seconds
//       let chartTime: Time;
//       if (typeof candle.timestamp === 'number') {
//         chartTime = (candle.timestamp > 1e12
//           ? Math.floor(candle.timestamp / 1000)
//           : candle.timestamp) as Time;
//       } else {
//         chartTime = Math.floor(new Date(candle.timestamp).getTime() / 1000) as Time;
//       }
//       if (!chartTime || Number.isNaN(chartTime)) return;

//       // خصائص marker الافتراضية
//       let shape: 'arrowUp' | 'arrowDown' | 'circle' = 'circle';
//       let position: 'aboveBar' | 'belowBar' | 'inBar' = 'inBar';
//       let color = '#22c55e';
//       let text = '';

//       // ======= Entry =======
//       if (marker.type === 'entry') {
//         if (marker.position_type === 'long') {
//           shape = 'arrowUp';
//           position = 'belowBar';
//           color = '#22c55e';
//           text = `BUY ${marker.price}`; // سعر الدخول
//         } else {
//           shape = 'arrowDown';
//           position = 'aboveBar';
//           color = '#ef4444';
//           text = `SELL ${marker.price}`; // سعر الدخول
//         }
//         if (marker.decision_reason) {
//           text += `\n(${marker.decision_reason})`; // سبب الدخول
//         }

//         // ======= Exit =======
//       } else if (marker.type === 'exit') {
//         shape = 'circle';
//         if ((marker.pnl ?? 0) >= 0) {
//           position = 'aboveBar';
//           color = '#22c55e';
//           text = `TP ${marker.price}`; // سعر الخروج/الربح
//         } else {
//           position = 'belowBar';
//           color = '#ef4444';
//           text = `SL ${marker.price}`; // سعر الخروج/الخسارة
//         }
//         if (marker.exit_reason) {
//           text += `\n(${marker.exit_reason})`; // سبب الخروج
//         }
//       }

//       tradeMarkers.push({
//         time: chartTime,
//         position,
//         shape,
//         color,
//         text
//       });
//     });

//     // تعيين جميع العلامات مرة واحدة
//     markersPlugin.setMarkers(tradeMarkers);
//   };





//   // معالجة حركة crosshair
//   const handleCrosshairMove = useCallback((param: MouseEventParams) => {
//     if (!param.time || !param.point || !showCrosshairData) {
//       setCrosshairData({});
//       return;
//     }

//     const timeStr = param.time as Time;
//     const candleIndex = candles.findIndex(candle =>
//       (Date.parse(candle.timestamp) / 1000) === timeStr
//     );

//     if (candleIndex !== -1) {
//       const candle = candles[candleIndex];
//       setCrosshairData({
//         price: param.seriesData.size > 0
//           ? Array.from(param.seriesData.values())[0].value as number
//           : undefined,
//         time: candle.timestamp,
//         candle: candle,
//       });
//     }
//   }, [candles, showCrosshairData]);

//   // تبديل المؤشر
//   const toggleIndicator = useCallback((indicatorName: string) => {
//     setSelectedIndicators(prev => {
//       const existing = prev.find(i => i.name === indicatorName);
//       if (existing) {
//         // تعطيل المؤشر
//         return prev.map(i =>
//           i.name === indicatorName
//             ? { ...i, enabled: !i.enabled }
//             : i
//         );
//       } else {
//         // إضافة مؤشر جديد
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

//   // تحديث إعدادات المؤشر
//   const updateIndicatorSettings = useCallback((
//     indicatorName: string,
//     settings: Partial<IndicatorState>
//   ) => {
//     setSelectedIndicators(prev =>
//       prev.map(i =>
//         i.name === indicatorName
//           ? { ...i, ...settings }
//           : i
//       )
//     );
//   }, []);

//   // إعادة إنشاء المخطط عند تغيير الإعدادات
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
//   }, [
//     chartType,
//     createMainChart,
//     createPerformanceChart,
//     safeRemoveChart,
//     selectedIndicators,
//     showVolume,
//     showTrades,
//     lineChartMode
//   ]);

//   // تحديث البيانات عند تغيير الشموع
//   useEffect(() => {
//     if (!chartRef.current || !candlestickSeriesRef.current || candles.length === 0) return;

//     if (chartType === 'candlestick' && candlestickSeriesRef.current) {
//       const candleData = candles.map(candle => ({
//         time: (Date.parse(candle.timestamp) / 1000) as Time,
//         open: candle.open,
//         high: candle.high,
//         low: candle.low,
//         close: candle.close,
//       }));

//       candlestickSeriesRef.current.setData(candleData);
//     }
//   }, [candles, chartType]);

//   // حساب الإحصائيات
//   const stats = useMemo(() => {
//     if (!summary) return null;

//     const totalWinningTrades = tradeMarkers.filter(
//       t => t.type === 'exit' && t.pnl && t.pnl > 0
//     ).length;

//     const totalLosingTrades = tradeMarkers.filter(
//       t => t.type === 'exit' && t.pnl && t.pnl <= 0
//     ).length;

//     const avgWinningTrade = tradeMarkers
//       .filter(t => t.type === 'exit' && t.pnl && t.pnl > 0)
//       .reduce((sum, t) => sum + (t.pnl || 0), 0) / (totalWinningTrades || 1);

//     const avgLosingTrade = tradeMarkers
//       .filter(t => t.type === 'exit' && t.pnl && t.pnl <= 0)
//       .reduce((sum, t) => sum + (t.pnl || 0), 0) / (totalLosingTrades || 1);

//     const largestWinningTrade = Math.max(
//       ...tradeMarkers
//         .filter(t => t.type === 'exit' && t.pnl && t.pnl > 0)
//         .map(t => t.pnl || 0)
//     );

//     const largestLosingTrade = Math.min(
//       ...tradeMarkers
//         .filter(t => t.type === 'exit' && t.pnl && t.pnl < 0)
//         .map(t => t.pnl || 0)
//     );

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

//   // تنسيق الأرقام
//   const formatNumber = (num: number | undefined, decimals: number = 2): string => {
//     // تحقق إذا كانت القيمة undefined أو null
//     if (num === undefined || num === null) {
//       return '0.00';
//     }
//     return num.toLocaleString('en-US', {
//       minimumFractionDigits: decimals,
//       maximumFractionDigits: decimals
//     });
//   };


//   const formatPercent = (num: number | undefined | null): string => {
//     if (num === undefined || num === null || isNaN(num)) {
//       return '+0.00%';
//     }
//     return `${num >= 0 ? '+' : ''}${formatNumber(num)}%`;
//   };

//   return (
//     <Card className="h-full flex flex-col bg-[#131722] border-gray-800">
//       {/* الرأس */}
//       <CardHeader className="border-b border-gray-800 pb-3 space-y-2">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <CardTitle className="text-white">الشارت التفاعلي</CardTitle>
//             <Badge variant="outline" className="border-gray-600 text-gray-300">
//               {symbol} - {timeframe}
//             </Badge>
//             <Badge variant="secondary" className="bg-gray-800 text-gray-300">
//               {candles.length} شمعة
//             </Badge>
//             {summary && (
//               <>
//                 <Badge
//                   variant={summary.total_pnl >= 0 ? 'default' : 'destructive'}
//                   className={summary.total_pnl >= 0 ? 'bg-green-600' : 'bg-red-600'}
//                 >
//                   {formatPercent(summary.total_pnl_percent)}
//                 </Badge>
//                 <Badge variant="outline" className="border-gray-600 text-gray-300">
//                   {formatNumber(summary.total_trades)} صفقة
//                 </Badge>
//                 <Badge variant="outline" className="border-gray-600 text-gray-300">
//                   {formatNumber(summary.win_rate)}% معدل ربح
//                 </Badge>
//               </>
//             )}
//           </div>

//           <div className="flex items-center gap-2">
//             {onStartPlay && onStopPlay && (
//               <Button
//                 size="sm"
//                 variant={isPlaying ? 'destructive' : 'default'}
//                 onClick={isPlaying ? onStopPlay : onStartPlay}
//               >
//                 {isPlaying ? (
//                   <>
//                     <Pause className="h-4 w-4 mr-1" />
//                     إيقاف
//                   </>
//                 ) : (
//                   <>
//                     <Play className="h-4 w-4 mr-1" />
//                     تشغيل
//                   </>
//                 )}
//               </Button>
//             )}

//             <Button
//               size="sm"
//               variant="outline"
//               className="border-gray-600 text-gray-300 hover:bg-gray-800"
//               onClick={onExport}
//             >
//               <Download className="h-4 w-4" />
//             </Button>

//             <Button
//               size="sm"
//               variant="outline"
//               className="border-gray-600 text-gray-300 hover:bg-gray-800"
//               onClick={() => {
//                 if (!isFullscreen) {
//                   chartContainerRef.current?.requestFullscreen();
//                   setIsFullscreen(true);
//                 } else {
//                   document.exitFullscreen();
//                   setIsFullscreen(false);
//                 }
//               }}
//             >
//               <Maximize2 className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>

//         <CardDescription className="text-gray-400">
//           عرض الشموع والمؤشرات ونقاط الدخول والخروج وتحليل الأداء
//         </CardDescription>
//       </CardHeader>

//       <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
//         {/* أدوات التحكم */}
//         <div className="flex items-center gap-3 p-3 border-b border-gray-800 bg-[#1E222D]">
//           {/* نوع المخطط */}
//           <div className="flex items-center gap-1">
//             <Button
//               size="sm"
//               variant={chartType === 'candlestick' ? 'default' : 'outline'}
//               className={chartType === 'candlestick' ? 'bg-green-600' : 'border-gray-600 text-gray-300 hover:bg-gray-800'}
//               onClick={() => setChartType('candlestick')}
//             >
//               <Layers className="h-4 w-4 mr-1" />
//               شموع
//             </Button>
//             <Button
//               size="sm"
//               variant={chartType === 'line' ? 'default' : 'outline'}
//               className={chartType === 'line' ? 'bg-blue-600' : 'border-gray-600 text-gray-300 hover:bg-gray-800'}
//               onClick={() => setChartType('line')}
//               disabled={!equityCurve && !drawdownCurve}
//             >
//               <TrendingUp className="h-4 w-4 mr-1" />
//               أداء
//             </Button>
//           </div>

//           <Separator orientation="vertical" className="h-6 bg-gray-700" />

//           {/* إعدادات الشموع */}
//           {chartType === 'candlestick' && (
//             <>
//               <div className="flex items-center gap-2">
//                 <Checkbox
//                   id="show-volume"
//                   checked={showVolume}
//                   onCheckedChange={setShowVolume}
//                   className="border-gray-600"
//                 />
//                 <Label
//                   htmlFor="show-volume"
//                   className="cursor-pointer text-sm text-gray-300"
//                 >
//                   حجم التداول
//                 </Label>
//               </div>

//               <div className="flex items-center gap-2">
//                 <Checkbox
//                   id="show-trades"
//                   checked={showTrades}
//                   onCheckedChange={setShowTrades}
//                   className="border-gray-600"
//                 />
//                 <Label
//                   htmlFor="show-trades"
//                   className="cursor-pointer text-sm text-gray-300"
//                 >
//                   الصفقات
//                 </Label>
//               </div>

//               <Separator orientation="vertical" className="h-6 bg-gray-700" />

//               {/* المؤشرات المتاحة */}
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

//           {/* إعدادات الأداء */}
//           {chartType === 'line' && (
//             <div className="flex items-center gap-2">
//               <Button
//                 size="sm"
//                 variant={lineChartMode === 'equity' ? 'default' : 'outline'}
//                 className={lineChartMode === 'equity' ? 'bg-green-600' : 'border-gray-600 text-gray-300 hover:bg-gray-800'}
//                 onClick={() => setLineChartMode('equity')}
//               >
//                 <DollarSign className="h-4 w-4 mr-1" />
//                 رأس المال
//               </Button>
//               <Button
//                 size="sm"
//                 variant={lineChartMode === 'drawdown' ? 'default' : 'outline'}
//                 className={lineChartMode === 'drawdown' ? 'bg-red-600' : 'border-gray-600 text-gray-300 hover:bg-gray-800'}
//                 onClick={() => setLineChartMode('drawdown')}
//               >
//                 <Activity className="h-4 w-4 mr-1" />
//                 الانكماش
//               </Button>
//             </div>
//           )}
//         </div>

//         {/* المحتوى الرئيسي */}
//         <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
//           <div className="flex items-center justify-between px-3 border-b border-gray-800 bg-[#1E222D]">
//             <TabsList className="bg-transparent h-auto p-0 gap-1">
//               <TabsTrigger
//                 value="chart"
//                 className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400"
//               >
//                 <BarChart3 className="h-4 w-4 mr-1" />
//                 الشار트
//               </TabsTrigger>
//               <TabsTrigger
//                 value="performance"
//                 className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400"
//               >
//                 <Activity className="h-4 w-4 mr-1" />
//                 الأداء
//               </TabsTrigger>
//               <TabsTrigger
//                 value="trades"
//                 className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400"
//               >
//                 <Target className="h-4 w-4 mr-1" />
//                 الصفقات
//               </TabsTrigger>
//               <TabsTrigger
//                 value="indicators"
//                 className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400"
//               >
//                 <Settings className="h-4 w-4 mr-1" />
//                 المؤشرات
//               </TabsTrigger>
//             </TabsList>

//             <div className="flex items-center gap-2">
//               <Button
//                 size="sm"
//                 variant="ghost"
//                 className="text-gray-400 hover:text-white hover:bg-gray-800"
//               >
//                 <ZoomIn className="h-4 w-4" />
//               </Button>
//               <Button
//                 size="sm"
//                 variant="ghost"
//                 className="text-gray-400 hover:text-white hover:bg-gray-800"
//               >
//                 <ZoomOut className="h-4 w-4" />
//               </Button>
//               <Button
//                 size="sm"
//                 variant="ghost"
//                 className="text-gray-400 hover:text-white hover:bg-gray-800"
//               >
//                 <RefreshCw className="h-4 w-4" />
//               </Button>
//             </div>
//           </div>

//           <div className="flex-1 flex overflow-hidden">
//             {/* الشار */}
//             <TabsContent value="chart" className="flex-1 m-0 p-0 overflow-hidden">
//               <div className="flex h-full">
//                 {/* الشارت الرئيسي */}
//                 <div className="flex-1 relative">
//                   {candles.length === 0 ? (
//                     <div className="absolute inset-0 flex items-center justify-center text-gray-500">
//                       لا توجد بيانات للعرض
//                     </div>
//                   ) : (
//                     <div ref={chartContainerRef} className="w-full h-full" />
//                   )}

//                   {/* عرض بيانات Crosshair */}
//                   {showCrosshairData && crosshairData.candle && (
//                     <div className="absolute top-2 left-2 bg-[#1E222D] border border-gray-700 rounded p-3 text-sm space-y-1 shadow-lg">
//                       <div className="flex items-center gap-2 text-gray-300">
//                         <Info className="h-4 w-4" />
//                         <span className="font-medium">{crosshairData.time}</span>
//                       </div>
//                       <div className="text-gray-400">
//                         السعر: {formatNumber(crosshairData.candle.close)}
//                       </div>
//                       {crosshairData.candle.strategy_decision && (
//                         <div className={`flex items-center gap-2 ${crosshairData.candle.strategy_decision === 'buy'
//                             ? 'text-green-400'
//                             : crosshairData.candle.strategy_decision === 'sell'
//                               ? 'text-red-400'
//                               : 'text-gray-400'
//                           }`}>
//                           <TrendingUp className="h-4 w-4" />
//                           {crosshairData.candle.strategy_decision === 'buy' && 'شراء'}
//                           {crosshairData.candle.strategy_decision === 'sell' && 'بيع'}
//                           {crosshairData.candle.strategy_decision === 'hold' && 'انتظار'}
//                         </div>
//                       )}
//                       {crosshairData.candle.position_state && (
//                         <div className="text-gray-400">
//                           المركز: {crosshairData.candle.position_state}
//                         </div>
//                       )}
//                       {crosshairData.candle.current_pnl !== null && (
//                         <div className={`${crosshairData.candle.current_pnl >= 0 ? 'text-green-400' : 'text-red-400'
//                           }`}>
//                           P&L: {formatNumber(crosshairData.candle.current_pnl)}
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>

//                 {/* اللوحة الجانبية */}
//                 {layout.showIndicatorsPanel && selectedIndicators.length > 0 && (
//                   <div className="w-64 border-l border-gray-800 bg-[#1E222D] p-3 overflow-y-auto">
//                     <h3 className="text-sm font-semibold text-white mb-3">المؤشرات النشطة</h3>
//                     <div className="space-y-3">
//                       {selectedIndicators.map(indicator => (
//                         <div key={indicator.name} className="p-2 bg-[#2A2E39] rounded">
//                           <div className="flex items-center justify-between mb-2">
//                             <span className="text-sm font-medium text-white">
//                               {indicator.name.toUpperCase()}
//                             </span>
//                             <Button
//                               size="sm"
//                               variant="ghost"
//                               className="h-6 w-6 p-0 text-gray-400 hover:text-white"
//                               onClick={() => toggleIndicator(indicator.name)}
//                             >
//                               <X className="h-3 w-3" />
//                             </Button>
//                           </div>
//                           <div className="space-y-2">
//                             <div className="flex items-center gap-2">
//                               <div
//                                 className="w-4 h-4 rounded"
//                                 style={{ backgroundColor: indicator.color }}
//                               />
//                               <span className="text-xs text-gray-400">اللون</span>
//                             </div>
//                             <div className="flex items-center gap-2">
//                               <span className="text-xs text-gray-400">السمك:</span>
//                               <Select
//                                 value={indicator.lineWidth.toString()}
//                                 onValueChange={(v) => updateIndicatorSettings(indicator.name, { lineWidth: parseInt(v) })}
//                               >
//                                 <SelectTrigger className="h-6 text-xs bg-[#131722] border-gray-700">
//                                   <SelectValue />
//                                 </SelectTrigger>
//                                 <SelectContent className="bg-[#1E222D] border-gray-700">
//                                   {[1, 2, 3, 4].map(w => (
//                                     <SelectItem key={w} value={w.toString()} className="text-gray-300">
//                                       {w}
//                                     </SelectItem>
//                                   ))}
//                                 </SelectContent>
//                               </Select>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* أسطورة الصفقات */}
//               {showTrades && tradeMarkers.length > 0 && (
//                 <div className="p-3 border-t border-gray-800 bg-[#1E222D]">
//                   <div className="flex items-center gap-4 text-sm">
//                     <div className="flex items-center gap-1">
//                       <div className="w-3 h-3 rounded-full bg-green-500" />
//                       <span className="text-gray-300">دخول شراء</span>
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <div className="w-3 h-3 rounded-full bg-red-500" />
//                       <span className="text-gray-300">دخول بيع</span>
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
//                       <span className="text-gray-300">ربح</span>
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white" />
//                       <span className="text-gray-300">خسارة</span>
//                     </div>
//                     <span className="text-gray-400 ml-auto">{tradeMarkers.length} صفقة</span>
//                   </div>
//                 </div>
//               )}
//             </TabsContent>

//             {/* تبويب الأداء */}
//             <TabsContent value="performance" className="flex-1 m-0 p-0 overflow-auto bg-[#131722]">
//               <div className="p-6 space-y-6">
//                 {stats ? (
//                   <>
//                     {/* الإحصائيات الرئيسية */}
//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                       <Card className="bg-[#1E222D] border-gray-800">
//                         <CardContent className="p-4">
//                           <div className="text-sm text-gray-400 mb-1">إجمالي الربح/الخسارة</div>
//                           <div className={`text-2xl font-bold ${stats.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'
//                             }`}>
//                             {formatNumber(stats.total_pnl)}
//                           </div>
//                           <div className={`text-sm ${stats.total_pnl_percent >= 0 ? 'text-green-400' : 'text-red-400'
//                             }`}>
//                             {formatPercent(stats.total_pnl_percent)}
//                           </div>
//                         </CardContent>
//                       </Card>

//                       <Card className="bg-[#1E222D] border-gray-800">
//                         <CardContent className="p-4">
//                           <div className="text-sm text-gray-400 mb-1">معدل الربح</div>
//                           <div className="text-2xl font-bold text-white">
//                             {formatNumber(stats.win_rate)}%
//                           </div>
//                           <div className="text-sm text-gray-400">
//                             {stats.totalWinningTrades} ربح / {stats.totalLosingTrades} خسارة
//                           </div>
//                         </CardContent>
//                       </Card>

//                       <Card className="bg-[#1E222D] border-gray-800">
//                         <CardContent className="p-4">
//                           <div className="text-sm text-gray-400 mb-1">أقصى انكماش</div>
//                           <div className="text-2xl font-bold text-red-400">
//                             {formatPercent(stats.max_drawdown_percent)}
//                           </div>
//                           <div className="text-sm text-gray-400">
//                             Max Drawdown
//                           </div>
//                         </CardContent>
//                       </Card>

//                       <Card className="bg-[#1E222D] border-gray-800">
//                         <CardContent className="p-4">
//                           <div className="text-sm text-gray-400 mb-1">Sharpe Ratio</div>
//                           <div className="text-2xl font-bold text-white">
//                             {formatNumber(stats.sharpe_ratio)}
//                           </div>
//                           <div className="text-sm text-gray-400">
//                             معامل شارب
//                           </div>
//                         </CardContent>
//                       </Card>
//                     </div>

//                     {/* المزيد من الإحصائيات */}
//                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                       <Card className="bg-[#1E222D] border-gray-800">
//                         <CardContent className="p-4">
//                           <div className="text-sm text-gray-400 mb-1">Profit Factor</div>
//                           <div className="text-xl font-bold text-white">
//                             {formatNumber(stats.profit_factor)}
//                           </div>
//                         </CardContent>
//                       </Card>

//                       <Card className="bg-[#1E222D] border-gray-800">
//                         <CardContent className="p-4">
//                           <div className="text-sm text-gray-400 mb-1">Sortino Ratio</div>
//                           <div className="text-xl font-bold text-white">
//                             {formatNumber(stats.sortino_ratio)}
//                           </div>
//                         </CardContent>
//                       </Card>

//                       <Card className="bg-[#1E222D] border-gray-800">
//                         <CardContent className="p-4">
//                           <div className="text-sm text-gray-400 mb-1">Calmar Ratio</div>
//                           <div className="text-xl font-bold text-white">
//                             {formatNumber(stats.calmar_ratio)}
//                           </div>
//                         </CardContent>
//                       </Card>

//                       <Card className="bg-[#1E222D] border-gray-800">
//                         <CardContent className="p-4">
//                           <div className="text-sm text-gray-400 mb-1">متوسط صفقة رابحة</div>
//                           <div className="text-xl font-bold text-green-400">
//                             {formatNumber(stats.avgWinningTrade)}
//                           </div>
//                         </CardContent>
//                       </Card>

//                       <Card className="bg-[#1E222D] border-gray-800">
//                         <CardContent className="p-4">
//                           <div className="text-sm text-gray-400 mb-1">متوسط صفقة خاسرة</div>
//                           <div className="text-xl font-bold text-red-400">
//                             {formatNumber(stats.avgLosingTrade)}
//                           </div>
//                         </CardContent>
//                       </Card>

//                       <Card className="bg-[#1E222D] border-gray-800">
//                         <CardContent className="p-4">
//                           <div className="text-sm text-gray-400 mb-1">العائد السنوي</div>
//                           <div className="text-xl font-bold text-white">
//                             {formatPercent(stats.annual_return_percent)}
//                           </div>
//                         </CardContent>
//                       </Card>
//                     </div>

//                     {/* الصفقات الأفضل والأسوأ */}
//                     <div className="grid grid-cols-2 gap-4">
//                       <Card className="bg-[#1E222D] border-gray-800">
//                         <CardContent className="p-4">
//                           <div className="text-sm text-gray-400 mb-1">أفضل صفقة</div>
//                           <div className="text-2xl font-bold text-green-400">
//                             {formatNumber(stats.largestWinning_trade)}
//                           </div>
//                         </CardContent>
//                       </Card>

//                       <Card className="bg-[#1E222D] border-gray-800">
//                         <CardContent className="p-4">
//                           <div className="text-sm text-gray-400 mb-1">أسوأ صفقة</div>
//                           <div className="text-2xl font-bold text-red-400">
//                             {formatNumber(stats.largest_losing_trade)}
//                           </div>
//                         </CardContent>
//                       </Card>
//                     </div>
//                   </>
//                 ) : (
//                   <div className="text-center text-gray-500 py-12">
//                     لا توجد بيانات أداء متاحة
//                   </div>
//                 )}
//               </div>
//             </TabsContent>

//             {/* تبويب الصفقات */}
//             <TabsContent value="trades" className="flex-1 m-0 p-0 overflow-hidden bg-[#131722]">
//               <div className="h-full flex flex-col">
//                 <div className="p-3 border-b border-gray-800 bg-[#1E222D]">
//                   <div className="flex items-center justify-between">
//                     <div className="text-sm text-gray-300">
//                       {tradeMarkers.length} صفقة
//                     </div>
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       className="border-gray-600 text-gray-300 hover:bg-gray-800"
//                     >
//                       <Filter className="h-4 w-4 mr-1" />
//                       تصفية
//                     </Button>
//                   </div>
//                 </div>

//                 <div className="flex-1 overflow-auto">
//                   <Table>
//                     <TableHeader className="bg-[#1E222D] sticky top-0">
//                       <TableRow className="border-gray-800">
//                         <TableHead className="text-gray-300">#</TableHead>
//                         <TableHead className="text-gray-300">الوقت</TableHead>
//                         <TableHead className="text-gray-300">النوع</TableHead>
//                         <TableHead className="text-gray-300">السعر</TableHead>
//                         <TableHead className="text-gray-300">الحجم</TableHead>
//                         <TableHead className="text-gray-300">الربح/الخسارة</TableHead>
//                         <TableHead className="text-gray-300">السبب</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {tradeMarkers.map((trade, index) => (
//                         <TableRow
//                           key={trade.trade_id || index}
//                           className={`border-gray-800 hover:bg-[#2A2E39] cursor-pointer ${selectedTrade?.trade_id === trade.trade_id ? 'bg-[#2A2E39]' : ''
//                             }`}
//                           onClick={() => setSelectedTrade(trade)}
//                         >
//                           <TableCell className="text-gray-300">{index + 1}</TableCell>
//                           <TableCell className="text-gray-300">
//                             {new Date(trade.timestamp).toLocaleString('ar-SA')}
//                           </TableCell>
//                           <TableCell>
//                             <Badge
//                               className={
//                                 trade.type === 'entry'
//                                   ? trade.position_type === 'long'
//                                     ? 'bg-green-600'
//                                     : 'bg-red-600'
//                                   : trade.pnl && trade.pnl > 0
//                                     ? 'bg-green-600'
//                                     : 'bg-red-600'
//                               }
//                             >
//                               {trade.type === 'entry'
//                                 ? (trade.position_type === 'long' ? 'شراء' : 'بيع')
//                                 : 'خروج'
//                               }
//                             </Badge>
//                           </TableCell>
//                           <TableCell className="text-white">
//                             {formatNumber(trade.price)}
//                           </TableCell>
//                           <TableCell className="text-gray-300">
//                             {formatNumber(trade.position_size)}
//                           </TableCell>
//                           <TableCell>
//                             {trade.pnl !== undefined ? (
//                               <span className={trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
//                                 {formatNumber(trade.pnl)}
//                                 {trade.pnl_percentage && ` (${formatPercent(trade.pnl_percentage)})`}
//                               </span>
//                             ) : (
//                               <span className="text-gray-500">-</span>
//                             )}
//                           </TableCell>
//                           <TableCell className="text-gray-300">
//                             {trade.exit_reason || trade.decision_reason || '-'}
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </div>

//                 {/* تفاصيل الصفقة المحددة */}
//                 {selectedTrade && (
//                   <div className="p-3 border-t border-gray-800 bg-[#1E222D]">
//                     <div className="flex items-center justify-between mb-2">
//                       <h3 className="text-sm font-semibold text-white">تفاصيل الصفقة</h3>
//                       <Button
//                         size="sm"
//                         variant="ghost"
//                         className="h-6 w-6 p-0 text-gray-400 hover:text-white"
//                         onClick={() => setSelectedTrade(null)}
//                       >
//                         <X className="h-3 w-3" />
//                       </Button>
//                     </div>
//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
//                       <div>
//                         <div className="text-gray-400">المعرف</div>
//                         <div className="text-white">{selectedTrade.trade_id || '-'}</div>
//                       </div>
//                       <div>
//                         <div className="text-gray-400">سعر الدخول</div>
//                         <div className="text-white">{formatNumber(selectedTrade.entry_price)}</div>
//                       </div>
//                       <div>
//                         <div className="text-gray-400">وقف الخسارة</div>
//                         <div className="text-white">
//                           {selectedTrade.stop_loss ? formatNumber(selectedTrade.stop_loss) : '-'}
//                         </div>
//                       </div>
//                       <div>
//                         <div className="text-gray-400">جني الأرباح</div>
//                         <div className="text-white">
//                           {selectedTrade.take_profit ? formatNumber(selectedTrade.take_profit) : '-'}
//                         </div>
//                       </div>
//                       <div>
//                         <div className="text-gray-400">نسبة المخاطرة/العائد</div>
//                         <div className="text-white">
//                           {selectedTrade.risk_reward_ratio ? formatNumber(selectedTrade.risk_reward_ratio) : '-'}
//                         </div>
//                       </div>
//                       <div>
//                         <div className="text-gray-400">المدة</div>
//                         <div className="text-white">
//                           {selectedTrade.holding_period ? `${selectedTrade.holding_period} ساعة` : '-'}
//                         </div>
//                       </div>
//                       <div>
//                         <div className="text-gray-400">الرصيد قبل</div>
//                         <div className="text-white">
//                           {selectedTrade.account_balance_before
//                             ? formatNumber(selectedTrade.account_balance_before)
//                             : '-'}
//                         </div>
//                       </div>
//                       <div>
//                         <div className="text-gray-400">الرصيد بعد</div>
//                         <div className="text-white">
//                           {selectedTrade.account_balance_after
//                             ? formatNumber(selectedTrade.account_balance_after)
//                             : '-'}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </TabsContent>

//             {/* تبويب المؤشرات */}
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
//                               <Badge variant="outline" className="border-gray-600 text-gray-300">
//                                 {category}
//                               </Badge>
//                               <Badge variant="outline" className={`border-gray-600 text-xs ${layout === 'overlay' ? 'text-blue-400' : 'text-purple-400'}`}>{layout === 'overlay' ? 'فوق السعر' : 'لوحة منفصلة'}</Badge>
//                               <Checkbox
//                                 checked={isSelected}
//                                 onCheckedChange={() => toggleIndicator(indicator)}
//                                 className="border-gray-600"
//                               />
//                             </div>
//                             <h4 className="text-lg font-semibold text-white mb-2">
//                               {indicator.toUpperCase()}
//                             </h4>
//                             <p className="text-sm text-gray-400 mb-3">
//                               {getIndicatorDescription(indicator)}
//                             </p>
//                             {isSelected && (
//                               <div className="space-y-2">
//                                 <Select
//                                   value={
//                                     selectedIndicators.find(i => i.name === indicator)?.lineStyle.toString()
//                                     || '0'
//                                   }
//                                   onValueChange={(v) => updateIndicatorSettings(indicator, { lineStyle: parseInt(v) })}
//                                 >
//                                   <SelectTrigger className="h-8 text-sm bg-[#131722] border-gray-700">
//                                     <SelectValue placeholder="نمط الخط" />
//                                   </SelectTrigger>
//                                   <SelectContent className="bg-[#1E222D] border-gray-700">
//                                     <SelectItem value="0" className="text-gray-300">متصل</SelectItem>
//                                     <SelectItem value="1" className="text-gray-300">منقط</SelectItem>
//                                     <SelectItem value="2" className="text-gray-300">مكسر</SelectItem>
//                                   </SelectContent>
//                                 </Select>
//                               </div>
//                             )}
//                           </CardContent>
//                         </Card>
//                       );
//                     })}
//                   </div>
//                 ) : (
//                   <div className="text-center text-gray-500 py-12">
//                     <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
//                     <p>لا توجد مؤشرات متاحة في البيانات</p>
//                     <p className="text-sm mt-2">المؤشرات سيتم عرضها عند توفرها في الاستجابة</p>
//                   </div>
//                 )}

//                 {/* معلومات إضافية عن المؤشرات */}
//                 <div className="mt-8">
//                   <h3 className="text-lg font-semibold text-white mb-4">معلومات إضافية</h3>
//                   <Card className="bg-[#1E222D] border-gray-800">
//                     <CardContent className="p-4">
//                       <div className="space-y-2 text-sm text-gray-300">
//                         <div className="flex items-center gap-2">
//                           <CheckCircle2 className="h-4 w-4 text-green-400" />
//                           <span>المؤشرات يتم استخراجها تلقائياً من البيانات</span>
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <CheckCircle2 className="h-4 w-4 text-green-400" />
//                           <span>يمكنك تفعيل/تعطيل المؤشرات بسهولة</span>
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <CheckCircle2 className="h-4 w-4 text-green-400" />
//                           <span>تخصيص ألوان وسموك الخطوط</span>
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <CheckCircle2 className="h-4 w-4 text-green-400" />
//                           <span>دعم جميع أنماط المؤشرات (SMA, EMA, RSI, MACD, etc.)</span>
//                         </div>
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

// // Helper functions
// function getCategoryForIndicator(indicator: string): string {
//   const lowerIndicator = indicator.toLowerCase();
//   if (lowerIndicator.includes('sma') || lowerIndicator.includes('ema') || lowerIndicator.includes('wma')) {
//     return 'اتجاه';
//   }
//   if (lowerIndicator.includes('rsi') || lowerIndicator.includes('macd') || lowerIndicator.includes('stochastic')) {
//     return 'زخم';
//   }
//   if (lowerIndicator.includes('bollinger') || lowerIndicator.includes('atr') || lowerIndicator.includes('vol')) {
//     return 'تقلب';
//   }
//   if (lowerIndicator.includes('volume') || lowerIndicator.includes('obv')) {
//     return 'حجم';
//   }
//   return 'عام';
// }

// function getIndicatorDescription(indicator: string): string {
//   const lowerIndicator = indicator.toLowerCase();
//   if (lowerIndicator.includes('sma')) return 'المتوسط المتحرك البسيط - مقياس لاتجاه السعر';
//   if (lowerIndicator.includes('ema')) return 'المتوسط المتحرك الأسي - يركز أكثر على الأسعار الحديثة';
//   if (lowerIndicator.includes('rsi')) return 'مؤشر القوة النسبية - قياس زخم السعر';
//   if (lowerIndicator.includes('macd')) return 'تقارب وتباعد المتوسطات المتحركة';
//   if (lowerIndicator.includes('bollinger')) return 'نطاقات بولينجر - قياس تقلب السعر';
//   if (lowerIndicator.includes('atr')) return 'معدل المدى الحقيقي - قياس التقلب';
//   if (lowerIndicator.includes('stochastic')) return 'المؤشر العشوائي - تحديد نقاط التشبع';
//   if (lowerIndicator.includes('volume')) return 'حجم التداول - قوة الحركة السعرية';
//   return 'مؤشر تقني لتحليل الأسواق';
// }


// هذا قبل التطوير الجديد 
// 'use client';

// import React, { useRef, useEffect, useState, useCallback } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/uiadv/card';
// import { Button } from '@/components/uiadv/button';
// import { Badge } from '@/components/uiadv/badge';
// import { Checkbox } from '@/components/uiadv/checkbox';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/uiadv/select';
// import {
//   createChart,
//   CrosshairMode,
//   LineSeries,
//   CandlestickSeries,
//   HistogramSeries,
//   IChartApi,
//   ISeriesApi,
//   Time
// } from 'lightweight-charts';
// import { TrendingUp, TrendingDown, Play, Pause, Maximize2, Layers, Download } from 'lucide-react';
// import { VisualCandle, TradeMarker } from '@/types/backtest';
// import { Label } from '../uiadv/label';

// interface BacktestChartProps {
//   candles: VisualCandle[];
//   tradeMarkers: TradeMarker[];
//   equityCurve?: number[];
//   drawdownCurve?: number[];
//   availableIndicators: string[];
//   symbol: string;
//   timeframe: string;
// }

// export function BacktestChart({
//   candles,
//   tradeMarkers,
//   equityCurve,
//   drawdownCurve,
//   availableIndicators,
//   symbol,
//   timeframe
// }: BacktestChartProps) {
//   const chartContainerRef = useRef<HTMLDivElement>(null);
//   const chartRef = useRef<IChartApi | null>(null);
//   const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
//   const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
//   const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]);
//   const [chartType, setChartType] = useState<'candlestick' | 'line'>('candlestick');
//   const [showEquity, setShowEquity] = useState(false);
//   const [showTrades, setShowTrades] = useState(true);

//   // دالة آمنة لإزالة المخطط
//   const safeRemoveChart = useCallback(() => {
//     if (chartRef.current) {
//       try {
//         chartRef.current.remove();
//       } catch (error) {
//         // تجاهل خطأ "Object is disposed" لأن المخطط تم التخلص منه بالفعل
//         console.log('Chart already disposed, skipping removal');
//       }
//       chartRef.current = null;
//       candlestickSeriesRef.current = null;
//       volumeSeriesRef.current = null;
//     }
//   }, []);

//   // دالة إنشاء مخطط الشموع
//   const createCandlestickChart = useCallback(() => {
//     if (!chartContainerRef.current || !candles.length) return;

//     safeRemoveChart();

//     const data = candles.map(candle => ({
//       time: (Date.parse(candle.timestamp) / 1000) as Time,
//       open: candle.open,
//       high: candle.high,
//       low: candle.low,
//       close: candle.close,
//       volume: candle.volume,
//     }));

//     // Create dark theme chart
//     const chart = createChart(chartContainerRef.current, {
//       width: chartContainerRef.current.clientWidth,
//       height: chartContainerRef.current.clientHeight,
//       layout: {
//         background: { type: 'solid', color: '#131722' }, // خلفية داكنة
//         textColor: '#D9D9D9', // نص فاتح
//       },
//       grid: {
//         vertLines: { color: '#2A2E39' }, // خطوط عمودية داكنة
//         horzLines: { color: '#2A2E39' }, // خطوط أفقية داكنة
//       },
//       crosshair: {
//         mode: CrosshairMode.Normal,
//         vertLine: {
//           width: 1,
//           color: '#758696',
//           labelBackgroundColor: '#1E222D', // خلفية داكنة للتسميات
//         },
//         horzLine: {
//           width: 1,
//           color: '#758696',
//           labelBackgroundColor: '#1E222D', // خلفية داكنة للتسميات
//         },
//       },
//       rightPriceScale: {
//         borderColor: '#2A2E39',
//         visible: true,
//         scaleMargins: {
//           top: 0.1,
//           bottom: 0.2,
//         },
//       },
//       timeScale: {
//         borderColor: '#2A2E39',
//         visible: true,
//         timeVisible: true,
//         ticksVisible: true,
//       },
//     });

//     // Add candlestick series with dark theme colors
//     const candlestickSeries = chart.addSeries(CandlestickSeries, {
//       upColor: '#26A69A', // أخضر للشموع الصاعدة (داكن)
//       downColor: '#EF5350', // أحمر للشموع الهابطة (داكن)
//       wickUpColor: '#26A69A',
//       wickDownColor: '#EF5350',
//       borderUpColor: '#26A69A',
//       borderDownColor: '#EF5350',
//       priceScaleId: 'candlestick',
//       scaleMargins: { top: 0.1, bottom: 0.2 },
//     });
//     candlestickSeries.setData(data);
//     candlestickSeriesRef.current = candlestickSeries;

//     // Add volume series with dark theme
//     const volumeSeries = chart.addSeries(HistogramSeries, {
//       priceFormat: {
//         type: 'volume',
//         precision: 2,
//         minMove: 0.01,
//       },
//       priceScaleId: '',
//       scaleMargins: { top: 0.8, bottom: 0 },
//       color: '#26A69A', // لون افتراضي
//     });
//     volumeSeries.setData(
//       candles.map(candle => ({
//         time: (Date.parse(candle.timestamp) / 1000) as Time,
//         value: candle.volume,
//         color: candle.close >= candle.open
//           ? 'rgba(38, 166, 154, 0.7)' // أخضر شفاف للصاعد
//           : 'rgba(239, 83, 80, 0.7)', // أحمر شفاف للهابط
//       }))
//     );
//     volumeSeriesRef.current = volumeSeries;

//     // Add selected indicators with dark theme colors
//     selectedIndicators.forEach(indicatorName => {
//       addIndicatorLine(chart, candles, indicatorName);
//     });

//     // Add trade markers with dark theme colors
//     if (showTrades) {
//       addTradeMarkers(chart, tradeMarkers, candles, candlestickSeries);
//     }

//     chartRef.current = chart;
//   }, [candles, selectedIndicators, showTrades, tradeMarkers, safeRemoveChart]);



//   // دالة إنشاء مخطط الخط للوضع الداكن
//   const createLineChart = useCallback(() => {
//     if (!chartContainerRef.current || !candles.length) return;

//     safeRemoveChart();

//     const seriesData = (showEquity ? equityCurve : drawdownCurve) || [];
//     if (seriesData.length === 0) return;

//     const chart = createChart(chartContainerRef.current, {
//       width: chartContainerRef.current.clientWidth,
//       height: chartContainerRef.current.clientHeight,
//       layout: {
//         background: { type: 'solid', color: '#131722' }, // خلفية داكنة
//         textColor: '#D9D9D9', // نص فاتح
//       },
//       grid: {
//         vertLines: { color: '#2A2E39' }, // خطوط عمودية داكنة
//         horzLines: { color: '#2A2E39' }, // خطوط أفقية داكنة
//       },
//       rightPriceScale: {
//         borderColor: '#2A2E39',
//         scaleMargins: { top: 0.1, bottom: 0.2 },
//       },
//       timeScale: {
//         borderColor: '#2A2E39',
//         timeVisible: true,
//       },
//     });

//     const lineSeries = chart.addSeries(LineSeries, {
//       color: showEquity ? '#10B981' : '#EF4444', // أخضر أو أحمر للوضع الداكن
//       lineWidth: 3, // خط أكثر سمكاً
//       lineStyle: 0, // خط متصل
//     });

//     const lineData = seriesData.map((value, index) => {
//       const candle = candles[Math.min(index, candles.length - 1)];
//       return {
//         time: (Date.parse(candle.timestamp) / 1000) as Time,
//         value: value,
//       };
//     });

//     lineSeries.setData(lineData);

//     // Add zero line for drawdown with dark theme
//     if (!showEquity) {
//       lineSeries.createPriceLine({
//         price: 0,
//         color: '#6B7280', // رمادي داكن
//         lineWidth: 1,
//         lineStyle: 1, // Dotted
//       });
//     }

//     chartRef.current = chart;
//   }, [candles, showEquity, equityCurve, drawdownCurve, safeRemoveChart]);


//   // Effect رئيسي لإنشاء المخطط
//   useEffect(() => {
//     if (!chartContainerRef.current || candles.length === 0) return;

//     if (chartType === 'candlestick') {
//       createCandlestickChart();
//     } else {
//       createLineChart();
//     }

//     // Resize handler
//     const handleResize = () => {
//       if (chartContainerRef.current && chartRef.current) {
//         chartRef.current.applyOptions({
//           width: chartContainerRef.current.clientWidth,
//           height: chartContainerRef.current.clientHeight,
//         });
//       }
//     };

//     window.addEventListener('resize', handleResize);

//     // Cleanup
//     return () => {
//       window.removeEventListener('resize', handleResize);
//       safeRemoveChart();
//     };
//   }, [chartType, createCandlestickChart, createLineChart, safeRemoveChart]);

//   // Effect منفصل لتحديث البيانات عند تغيير الشموع فقط
//   useEffect(() => {
//     if (!chartRef.current || !candlestickSeriesRef.current || !candles.length) return;

//     if (chartType === 'candlestick' && candlestickSeriesRef.current) {
//       const data = candles.map(candle => ({
//         time: (Date.parse(candle.timestamp) / 1000) as Time,
//         open: candle.open,
//         high: candle.high,
//         low: candle.low,
//         close: candle.close,
//         volume: candle.volume,
//       }));

//       candlestickSeriesRef.current.setData(data);
//     }
//   }, [candles, chartType]);

//   // Effect لتحديث الـ indicators
//   useEffect(() => {
//     if (!chartRef.current || !candlestickSeriesRef.current || chartType !== 'candlestick') return;

//     // إعادة إنشاء المخطط لتنظيف المؤشرات القديمة وإضافة الجديدة
//     if (candles.length > 0) {
//       createCandlestickChart();
//     }
//   }, [selectedIndicators, createCandlestickChart, chartType, candles.length]);

//   // Effect لتحديث علامات التداول
//   useEffect(() => {
//     if (!chartRef.current || !candlestickSeriesRef.current || chartType !== 'candlestick') return;

//     // إعادة إنشاء المخطط لتنظيف العلامات القديمة وإضافة الجديدة
//     if (candles.length > 0) {
//       createCandlestickChart();
//     }
//   }, [showTrades, tradeMarkers, createCandlestickChart, chartType, candles.length]);



//   const addIndicatorLine = (
//     chart: IChartApi,
//     candles: VisualCandle[],
//     indicatorName: string
//   ) => {
//     const data = candles.map(candle => {
//       const indicatorValue = candle.indicators[indicatorName];
//       if (indicatorValue === null || indicatorValue === undefined) return null;
//       return {
//         time: (Date.parse(candle.timestamp) / 1000) as Time,
//         value: indicatorValue,
//       };
//     }).filter(Boolean);

//     if (data.length === 0) return;

//     // ألوان المؤشرات للوضع الداكن
//     const darkThemeColors = [
//       '#3B82F6', // أزرق
//       '#8B5CF6', // بنفسجي
//       '#F59E0B', // برتقالي
//       '#10B981', // أخضر
//       '#EF4444', // أحمر
//       '#06B6D4', // سماوي
//       '#EC4899', // وردي
//       '#84CC16', // أخضر فاتح
//     ];

//     const colorIndex = Math.floor(Math.random() * darkThemeColors.length);
//     const lineSeries = chart.addSeries(LineSeries, {
//       color: darkThemeColors[colorIndex],
//       lineWidth: 2, // زيادة السمك قليلاً للوضوح
//       title: indicatorName,
//       lineStyle: 0, // خط متصل
//     });
//     lineSeries.setData(data);
//   };



//   const addTradeMarkers = (
//     chart: IChartApi,
//     markers: TradeMarker[],
//     candles: VisualCandle[],
//     series: ISeriesApi<"Candlestick">
//   ) => {
//     markers.forEach(marker => {
//       const candleIndex = candles.findIndex(candle => candle.timestamp === marker.timestamp);
//       if (candleIndex === -1) return;

//       const candle = candles[candleIndex];
//       const price = marker.price;

//       // ألوان داكنة لعلامات التداول
//       let color;
//       if (marker.type === 'entry') {
//         color = marker.position_type === 'long'
//           ? '#10B981' // أخضر للشراء
//           : '#EF4444'; // أحمر للبيع
//       } else {
//         color = marker.pnl !== undefined && marker.pnl > 0
//           ? '#10B981' // أخضر للربح
//           : '#EF4444'; // أحمر للخسارة
//       }

//       series.createPriceLine({
//         price: price,
//         color: color,
//         lineWidth: 2,
//         lineStyle: 2, // خط متقطع
//         axisLabelVisible: true,
//         title: `${marker.type === 'entry' ? 'E' : 'X'} - ${marker.pnl?.toFixed(2) || ''}`,
//         axisLabelColor: color,
//         axisLabelTextColor: '#FFFFFF', // نص أبيض
//       });
//     });
//   };



//   const toggleIndicator = (indicator: string) => {
//     if (selectedIndicators.includes(indicator)) {
//       setSelectedIndicators(selectedIndicators.filter(i => i !== indicator));
//     } else {
//       setSelectedIndicators([...selectedIndicators, indicator]);
//     }
//   };

//   const INDICATOR_COLORS: Record<string, string> = {
//     trend: 'bg-blue-100 text-blue-700',
//     momentum: 'bg-purple-100 text-purple-700',
//     volatility: 'bg-orange-100 text-orange-700',
//     volume: 'bg-green-100 text-green-700',
//     support_resistance: 'bg-pink-100 text-pink-700',
//   };

//   const getIndicatorCategory = (indicator: string): string => {
//     if (indicator.includes('sma') || indicator.includes('ema') || indicator.includes('wma')) return 'trend';
//     if (indicator.includes('rsi') || indicator.includes('macd') || indicator.includes('stochastic') || indicator.includes('momentum')) return 'momentum';
//     if (indicator.includes('bollinger') || indicator.includes('atr') || indicator.includes('vol')) return 'volatility';
//     if (indicator.includes('vwap') || indicator.includes('obv') || indicator.includes('volume')) return 'volume';
//     if (indicator.includes('pivot') || indicator.includes('supply') || indicator.includes('demand') || indicator.includes('harmonic')) return 'support_resistance';
//     return 'trend';
//   };

//   return (
//     <Card className="h-full flex flex-col">
//       <CardHeader>
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <CardTitle>الشارت التفاعلي</CardTitle>
//             <Badge variant="outline">{symbol} - {timeframe}</Badge>
//             <Badge variant="secondary">{candles.length} شمعة</Badge>
//           </div>
//           <div className="flex items-center gap-2">
//             <Button size="sm" variant="outline">
//               <Download className="h-4 w-4" />
//             </Button>
//             <Button size="sm" variant="outline">
//               <Maximize2 className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>
//         <CardDescription>
//           عرض الشموع والموشرات ونقاط الدخول والخروج
//         </CardDescription>
//       </CardHeader>
//       <CardContent className="flex-1 flex flex-col overflow-hidden">
//         {/* Chart Controls */}
//         <div className="flex flex-wrap items-center gap-3 pb-3 border-b">
//           {/* Chart Type Toggle */}
//           <div className="flex items-center gap-2">
//             <Button
//               size="sm"
//               variant={chartType === 'candlestick' ? 'default' : 'outline'}
//               onClick={() => setChartType('candlestick')}
//             >
//               <Layers className="h-4 w-4 mr-1" />
//               شموع
//             </Button>
//             <Button
//               size="sm"
//               variant={chartType === 'line' ? 'default' : 'outline'}
//               onClick={() => setChartType('line')}
//               disabled={!equityCurve && !drawdownCurve}
//             >
//               <TrendingUp className="h-4 w-4 mr-1" />
//               منحنى الأداء
//             </Button>
//           </div>

//           {/* Show Equity Toggle */}
//           {chartType === 'line' && (
//             <div className="flex items-center gap-2">
//               <Checkbox
//                 id="show-equity"
//                 checked={showEquity}
//                 onCheckedChange={setShowEquity}
//               />
//               <Label htmlFor="show-equity" className="cursor-pointer text-sm">
//                 منحنى رأس المال
//               </Label>
//             </div>
//           )}

//           {/* Show Trades Toggle */}
//           <div className="flex items-center gap-2">
//             <Checkbox
//               id="show-trades"
//               checked={showTrades}
//               onCheckedChange={setShowTrades}
//             />
//             <Label htmlFor="show-trades" className="cursor-pointer text-sm">
//               إظهار الصفقات
//             </Label>
//           </div>

//           {/* Indicators Selection */}
//           {chartType === 'candlestick' && availableIndicators.length > 0 && (
//             <div className="flex items-center gap-2 border-l pl-3">
//               <span className="text-sm text-muted-foreground">الموشرات:</span>
//               <div className="flex flex-wrap gap-1">
//                 {availableIndicators.map(indicator => (
//                   <Badge
//                     key={indicator}
//                     variant={selectedIndicators.includes(indicator) ? 'default' : 'outline'}
//                     className={`cursor-pointer ${INDICATOR_COLORS[getIndicatorCategory(indicator)]} ${selectedIndicators.includes(indicator) ? '' : 'hover:bg-muted'}`}
//                     onClick={() => toggleIndicator(indicator)}
//                   >
//                     {indicator}
//                   </Badge>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Chart Container */}
//         <div className="flex-1 min-h-[400px] relative">
//           {candles.length === 0 ? (
//             <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
//               لا توجد بيانات للعرض
//             </div>
//           ) : (
//             <div ref={chartContainerRef} className="w-full h-full" />
//           )}
//         </div>

//         {/* Trade Markers Legend */}
//         {showTrades && tradeMarkers.length > 0 && (
//           <div className="mt-3 pt-3 border-t">
//             <div className="flex items-center gap-4 text-sm">
//               <div className="flex items-center gap-1">
//                 <div className="w-3 h-3 rounded-full bg-green-500" />
//                 <span className="text-muted-foreground">دخول شراء</span>
//               </div>
//               <div className="flex items-center gap-1">
//                 <div className="w-3 h-3 rounded-full bg-red-500" />
//                 <span className="text-muted-foreground">دخول بيع</span>
//               </div>
//               <div className="flex items-center gap-1">
//                 <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
//                 <span className="text-muted-foreground">ربح</span>
//               </div>
//               <div className="flex items-center gap-1">
//                 <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white" />
//                 <span className="text-muted-foreground">خسارة</span>
//               </div>
//               <span className="text-muted-foreground ml-auto">{tradeMarkers.length} صفقة</span>
//             </div>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }





// المضهر الفاتح هنا 
// 'use client';

// import React, { useRef, useEffect, useState, useCallback } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/uiadv/card';
// import { Button } from '@/components/uiadv/button';
// import { Badge } from '@/components/uiadv/badge';
// import { Checkbox } from '@/components/uiadv/checkbox';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/uiadv/select';
// import {
//   createChart,
//   CrosshairMode,
//   LineSeries,
//   CandlestickSeries,
//   HistogramSeries,
//   IChartApi,
//   ISeriesApi,
//   Time
// } from 'lightweight-charts';
// import { TrendingUp, TrendingDown, Play, Pause, Maximize2, Layers, Download } from 'lucide-react';
// import { VisualCandle, TradeMarker } from '@/types/backtest';
// import { Label } from '../uiadv/label';

// interface BacktestChartProps {
//   candles: VisualCandle[];
//   tradeMarkers: TradeMarker[];
//   equityCurve?: number[];
//   drawdownCurve?: number[];
//   availableIndicators: string[];
//   symbol: string;
//   timeframe: string;
// }

// export function BacktestChart({
//   candles,
//   tradeMarkers,
//   equityCurve,
//   drawdownCurve,
//   availableIndicators,
//   symbol,
//   timeframe
// }: BacktestChartProps) {
//   const chartContainerRef = useRef<HTMLDivElement>(null);
//   const chartRef = useRef<IChartApi | null>(null);
//   const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
//   const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
//   const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]);
//   const [chartType, setChartType] = useState<'candlestick' | 'line'>('candlestick');
//   const [showEquity, setShowEquity] = useState(false);
//   const [showTrades, setShowTrades] = useState(true);

//   // دالة آمنة لإزالة المخطط
//   const safeRemoveChart = useCallback(() => {
//     if (chartRef.current) {
//       try {
//         chartRef.current.remove();
//       } catch (error) {
//         // تجاهل خطأ "Object is disposed" لأن المخطط تم التخلص منه بالفعل
//         console.log('Chart already disposed, skipping removal');
//       }
//       chartRef.current = null;
//       candlestickSeriesRef.current = null;
//       volumeSeriesRef.current = null;
//     }
//   }, []);

//   // دالة إنشاء مخطط الشموع
//   const createCandlestickChart = useCallback(() => {
//     if (!chartContainerRef.current || !candles.length) return;

//     safeRemoveChart();

//     const data = candles.map(candle => ({
//       time: (Date.parse(candle.timestamp) / 1000) as Time,
//       open: candle.open,
//       high: candle.high,
//       low: candle.low,
//       close: candle.close,
//       volume: candle.volume,
//     }));

//     // Create chart
//     const chart = createChart(chartContainerRef.current, {
//       width: chartContainerRef.current.clientWidth,
//       height: chartContainerRef.current.clientHeight,
//       layout: {
//         background: { type: 'solid', color: '#eedfdfff' },
//         textColor: '#333333',
//       },
//       grid: {
//         vertLines: { color: '#e0e0e0' },
//         horzLines: { color: '#e0e0e0' },
//       },
//       crosshair: {
//         mode: CrosshairMode.Normal,
//         vertLine: {
//           width: 1,
//           color: '#758696',
//           labelBackgroundColor: '#758696',
//         },
//         horzLine: {
//           width: 1,
//           color: '#758696',
//           labelBackgroundColor: '#758696',
//         },
//       },
//       rightPriceScale: {
//         borderColor: '#e0e0e0',
//         visible: true,
//       },
//       timeScale: {
//         borderColor: '#e0e0e0',
//         visible: true,
//         timeVisible: true,
//       },
//     });

//     // Add candlestick series
//     const candlestickSeries = chart.addSeries(CandlestickSeries, {
//       priceScaleId: 'candlestick',
//       scaleMargins: { top: 0.1, bottom: 0.2 },
//     });
//     candlestickSeries.setData(data);
//     candlestickSeriesRef.current = candlestickSeries;

//     // Add volume series
//     const volumeSeries = chart.addSeries(HistogramSeries, {
//       priceFormat: {
//         type: 'volume',
//         precision: 2,
//         minMove: 0.01,
//       },
//       priceScaleId: '',
//       scaleMargins: { top: 0.8, bottom: 0 },
//     });
//     volumeSeries.setData(
//       candles.map(candle => ({
//         time: (Date.parse(candle.timestamp) / 1000) as Time,
//         value: candle.volume,
//         color: candle.close >= candle.open
//           ? 'rgba(34, 197, 94, 0.5)'
//           : 'rgba(239, 83, 80, 0.5)',
//       }))
//     );
//     volumeSeriesRef.current = volumeSeries;

//     // Add selected indicators
//     selectedIndicators.forEach(indicatorName => {
//       addIndicatorLine(chart, candles, indicatorName);
//     });

//     // Add trade markers
//     if (showTrades) {
//       addTradeMarkers(chart, tradeMarkers, candles, candlestickSeries);
//     }

//     chartRef.current = chart;
//   }, [candles, selectedIndicators, showTrades, tradeMarkers, safeRemoveChart]);

//   // دالة إنشاء مخطط الخط
//   const createLineChart = useCallback(() => {
//     if (!chartContainerRef.current || !candles.length) return;

//     safeRemoveChart();

//     const seriesData = (showEquity ? equityCurve : drawdownCurve) || [];
//     if (seriesData.length === 0) return;

//     const chart = createChart(chartContainerRef.current, {
//       width: chartContainerRef.current.clientWidth,
//       height: chartContainerRef.current.clientHeight,
//       layout: {
//         background: { type: 'solid', color: '#ffffff' },
//         textColor: '#333333',
//       },
//       grid: {
//         vertLines: { color: '#e0e0e0' },
//         horzLines: { color: '#e0e0e0' },
//       },
//       rightPriceScale: {
//         borderColor: '#e0e0e0',
//       },
//       timeScale: {
//         borderColor: '#e0e0e0',
//       },
//     });

//     const lineSeries = chart.addSeries(LineSeries, {
//       color: showEquity ? '#22c55e' : '#ef4444',
//       lineWidth: 2,
//     });

//     const lineData = seriesData.map((value, index) => {
//       const candle = candles[Math.min(index, candles.length - 1)];
//       return {
//         time: (Date.parse(candle.timestamp) / 1000) as Time,
//         value: value,
//       };
//     });

//     lineSeries.setData(lineData);

//     // Add zero line for drawdown
//     if (!showEquity) {
//       lineSeries.createPriceLine({
//         price: 0,
//         color: '#e0e0e0',
//         lineWidth: 1,
//         lineStyle: 1,
//       });
//     }

//     chartRef.current = chart;
//   }, [candles, showEquity, equityCurve, drawdownCurve, safeRemoveChart]);

//   // Effect رئيسي لإنشاء المخطط
//   useEffect(() => {
//     if (!chartContainerRef.current || candles.length === 0) return;

//     if (chartType === 'candlestick') {
//       createCandlestickChart();
//     } else {
//       createLineChart();
//     }

//     // Resize handler
//     const handleResize = () => {
//       if (chartContainerRef.current && chartRef.current) {
//         chartRef.current.applyOptions({
//           width: chartContainerRef.current.clientWidth,
//           height: chartContainerRef.current.clientHeight,
//         });
//       }
//     };

//     window.addEventListener('resize', handleResize);

//     // Cleanup
//     return () => {
//       window.removeEventListener('resize', handleResize);
//       safeRemoveChart();
//     };
//   }, [chartType, createCandlestickChart, createLineChart, safeRemoveChart]);

//   // Effect منفصل لتحديث البيانات عند تغيير الشموع فقط
//   useEffect(() => {
//     if (!chartRef.current || !candlestickSeriesRef.current || !candles.length) return;

//     if (chartType === 'candlestick' && candlestickSeriesRef.current) {
//       const data = candles.map(candle => ({
//         time: (Date.parse(candle.timestamp) / 1000) as Time,
//         open: candle.open,
//         high: candle.high,
//         low: candle.low,
//         close: candle.close,
//         volume: candle.volume,
//       }));

//       candlestickSeriesRef.current.setData(data);
//     }
//   }, [candles, chartType]);

//   // Effect لتحديث الـ indicators
//   useEffect(() => {
//     if (!chartRef.current || !candlestickSeriesRef.current || chartType !== 'candlestick') return;

//     // إعادة إنشاء المخطط لتنظيف المؤشرات القديمة وإضافة الجديدة
//     if (candles.length > 0) {
//       createCandlestickChart();
//     }
//   }, [selectedIndicators, createCandlestickChart, chartType, candles.length]);

//   // Effect لتحديث علامات التداول
//   useEffect(() => {
//     if (!chartRef.current || !candlestickSeriesRef.current || chartType !== 'candlestick') return;

//     // إعادة إنشاء المخطط لتنظيف العلامات القديمة وإضافة الجديدة
//     if (candles.length > 0) {
//       createCandlestickChart();
//     }
//   }, [showTrades, tradeMarkers, createCandlestickChart, chartType, candles.length]);

//   const addIndicatorLine = (
//     chart: IChartApi,
//     candles: VisualCandle[],
//     indicatorName: string
//   ) => {
//     const data = candles.map(candle => {
//       const indicatorValue = candle.indicators[indicatorName];
//       if (indicatorValue === null || indicatorValue === undefined) return null;
//       return {
//         time: (Date.parse(candle.timestamp) / 1000) as Time,
//         value: indicatorValue,
//       };
//     }).filter(Boolean);

//     if (data.length === 0) return;

//     const colors = [
//       '#3b82f6',
//       '#8b5cf6',
//       '#f59e0b',
//       '#10b981',
//       '#ef4444',
//       '#06b6d4',
//     ];

//     const colorIndex = Math.floor(Math.random() * colors.length);
//     const lineSeries = chart.addSeries(LineSeries, {
//       color: colors[colorIndex],
//       lineWidth: 1,
//       title: indicatorName,
//     });
//     lineSeries.setData(data);
//   };

//   const addTradeMarkers = (
//     chart: IChartApi,
//     markers: TradeMarker[],
//     candles: VisualCandle[],
//     series: ISeriesApi<"Candlestick">
//   ) => {
//     markers.forEach(marker => {
//       const candleIndex = candles.findIndex(candle => candle.timestamp === marker.timestamp);
//       if (candleIndex === -1) return;

//       const candle = candles[candleIndex];
//       const timestamp = (Date.parse(candle.timestamp) / 1000) as Time;
//       const price = marker.price;

//       const color = marker.type === 'entry'
//         ? marker.position_type === 'long' ? '#22c55e' : '#ef4444'
//         : marker.pnl !== undefined && marker.pnl > 0 ? '#22c55e' : '#ef4444';

//       series.createPriceLine({
//         price: price,
//         color: color,
//         lineWidth: 2,
//         lineStyle: 2,
//         axisLabelVisible: true,
//         title: `${marker.type === 'entry' ? 'E' : 'X'} - ${marker.pnl?.toFixed(2) || ''}`,
//       });
//     });
//   };

//   const toggleIndicator = (indicator: string) => {
//     if (selectedIndicators.includes(indicator)) {
//       setSelectedIndicators(selectedIndicators.filter(i => i !== indicator));
//     } else {
//       setSelectedIndicators([...selectedIndicators, indicator]);
//     }
//   };

//   const INDICATOR_COLORS: Record<string, string> = {
//     trend: 'bg-blue-100 text-blue-700',
//     momentum: 'bg-purple-100 text-purple-700',
//     volatility: 'bg-orange-100 text-orange-700',
//     volume: 'bg-green-100 text-green-700',
//     support_resistance: 'bg-pink-100 text-pink-700',
//   };

//   const getIndicatorCategory = (indicator: string): string => {
//     if (indicator.includes('sma') || indicator.includes('ema') || indicator.includes('wma')) return 'trend';
//     if (indicator.includes('rsi') || indicator.includes('macd') || indicator.includes('stochastic') || indicator.includes('momentum')) return 'momentum';
//     if (indicator.includes('bollinger') || indicator.includes('atr') || indicator.includes('vol')) return 'volatility';
//     if (indicator.includes('vwap') || indicator.includes('obv') || indicator.includes('volume')) return 'volume';
//     if (indicator.includes('pivot') || indicator.includes('supply') || indicator.includes('demand') || indicator.includes('harmonic')) return 'support_resistance';
//     return 'trend';
//   };

//   return (
//     <Card className="h-full flex flex-col">
//       <CardHeader>
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <CardTitle>الشارت التفاعلي</CardTitle>
//             <Badge variant="outline">{symbol} - {timeframe}</Badge>
//             <Badge variant="secondary">{candles.length} شمعة</Badge>
//           </div>
//           <div className="flex items-center gap-2">
//             <Button size="sm" variant="outline">
//               <Download className="h-4 w-4" />
//             </Button>
//             <Button size="sm" variant="outline">
//               <Maximize2 className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>
//         <CardDescription>
//           عرض الشموع والموشرات ونقاط الدخول والخروج
//         </CardDescription>
//       </CardHeader>
//       <CardContent className="flex-1 flex flex-col overflow-hidden">
//         {/* Chart Controls */}
//         <div className="flex flex-wrap items-center gap-3 pb-3 border-b">
//           {/* Chart Type Toggle */}
//           <div className="flex items-center gap-2">
//             <Button
//               size="sm"
//               variant={chartType === 'candlestick' ? 'default' : 'outline'}
//               onClick={() => setChartType('candlestick')}
//             >
//               <Layers className="h-4 w-4 mr-1" />
//               شموع
//             </Button>
//             <Button
//               size="sm"
//               variant={chartType === 'line' ? 'default' : 'outline'}
//               onClick={() => setChartType('line')}
//               disabled={!equityCurve && !drawdownCurve}
//             >
//               <TrendingUp className="h-4 w-4 mr-1" />
//               منحنى الأداء
//             </Button>
//           </div>

//           {/* Show Equity Toggle */}
//           {chartType === 'line' && (
//             <div className="flex items-center gap-2">
//               <Checkbox
//                 id="show-equity"
//                 checked={showEquity}
//                 onCheckedChange={setShowEquity}
//               />
//               <Label htmlFor="show-equity" className="cursor-pointer text-sm">
//                 منحنى رأس المال
//               </Label>
//             </div>
//           )}

//           {/* Show Trades Toggle */}
//           <div className="flex items-center gap-2">
//             <Checkbox
//               id="show-trades"
//               checked={showTrades}
//               onCheckedChange={setShowTrades}
//             />
//             <Label htmlFor="show-trades" className="cursor-pointer text-sm">
//               إظهار الصفقات
//             </Label>
//           </div>

//           {/* Indicators Selection */}
//           {chartType === 'candlestick' && availableIndicators.length > 0 && (
//             <div className="flex items-center gap-2 border-l pl-3">
//               <span className="text-sm text-muted-foreground">الموشرات:</span>
//               <div className="flex flex-wrap gap-1">
//                 {availableIndicators.map(indicator => (
//                   <Badge
//                     key={indicator}
//                     variant={selectedIndicators.includes(indicator) ? 'default' : 'outline'}
//                     className={`cursor-pointer ${INDICATOR_COLORS[getIndicatorCategory(indicator)]} ${selectedIndicators.includes(indicator) ? '' : 'hover:bg-muted'}`}
//                     onClick={() => toggleIndicator(indicator)}
//                   >
//                     {indicator}
//                   </Badge>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Chart Container */}
//         <div className="flex-1 min-h-[400px] relative">
//           {candles.length === 0 ? (
//             <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
//               لا توجد بيانات للعرض
//             </div>
//           ) : (
//             <div ref={chartContainerRef} className="w-full h-full" />
//           )}
//         </div>

//         {/* Trade Markers Legend */}
//         {showTrades && tradeMarkers.length > 0 && (
//           <div className="mt-3 pt-3 border-t">
//             <div className="flex items-center gap-4 text-sm">
//               <div className="flex items-center gap-1">
//                 <div className="w-3 h-3 rounded-full bg-green-500" />
//                 <span className="text-muted-foreground">دخول شراء</span>
//               </div>
//               <div className="flex items-center gap-1">
//                 <div className="w-3 h-3 rounded-full bg-red-500" />
//                 <span className="text-muted-foreground">دخول بيع</span>
//               </div>
//               <div className="flex items-center gap-1">
//                 <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
//                 <span className="text-muted-foreground">ربح</span>
//               </div>
//               <div className="flex items-center gap-1">
//                 <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white" />
//                 <span className="text-muted-foreground">خسارة</span>
//               </div>
//               <span className="text-muted-foreground ml-auto">{tradeMarkers.length} صفقة</span>
//             </div>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }







// 'use client';

// import React, { useRef, useEffect, useState } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/uiadv/card';
// import { Button } from '@/components/uiadv/button';
// import { Badge } from '@/components/uiadv/badge';
// import { Checkbox } from '@/components/uiadv/checkbox';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/uiadv/select';
// import {
//   createChart,        // ✅ لإنشاء الرسوم البيانية
//   CrosshairMode,      // ✅ لتحديد سلوك التقاطع
//   LineSeries,         // ✅ لإضافة سلاسل خطية
//   CandlestickSeries,  // ✅ لإضافة سلاسل شموع
//   HistogramSeries,    // ✅ لإضافة سلاسل هيستوجرام
//   IChartApi,          // ✅ نوع الرسم البياني
//   ISeriesApi,         // ✅ نوع السلسلة
//   Time                // ✅ نوع الوقت
// } from 'lightweight-charts';
// import { TrendingUp, TrendingDown, Play, Pause, Maximize2, Layers, Download } from 'lucide-react';
// import { VisualCandle, TradeMarker } from '@/types/backtest';
// import { Label } from '../uiadv/label';

// interface BacktestChartProps {
//   candles: VisualCandle[];
//   tradeMarkers: TradeMarker[];
//   equityCurve?: number[];
//   drawdownCurve?: number[];
//   availableIndicators: string[];
//   symbol: string;
//   timeframe: string;
// }

// export function BacktestChart({
//   candles,
//   tradeMarkers,
//   equityCurve,
//   drawdownCurve,
//   availableIndicators,
//   symbol,
//   timeframe
// }: BacktestChartProps) {
//   const chartContainerRef = useRef<HTMLDivElement>(null);
//   const chartRef = useRef<IChartApi | IChartApi | null>(null);
//   const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]);
//   const [chartType, setChartType] = useState<'candlestick' | 'line'>('candlestick');
//   const [showEquity, setShowEquity] = useState(false);
//   const [showTrades, setShowTrades] = useState(true);

//   useEffect(() => {
//     if (!chartContainerRef.current || candles.length === 0) return;

//     // Destroy existing chart
//     if (chartRef.current) {
//       chartRef.current.remove();
//       chartRef.current = null;
//     }

//     // Prepare data
//     const data = candles.map(candle => ({
//       time: (Date.parse(candle.timestamp) / 1000) as Time,
//       open: candle.open,
//       high: candle.high,
//       low: candle.low,
//       close: candle.close,
//       volume: candle.volume,
//     }));

//     if (chartType === 'candlestick') {
//       // Create chart
//       const chart = createChart(chartContainerRef.current, {
//         width: chartContainerRef.current.clientWidth,
//         height: chartContainerRef.current.clientHeight,
//         layout: {
//           background: { type: 'solid', color: '#ffffff' },
//           textColor: '#333333',
//         },
//         grid: {
//           vertLines: { color: '#e0e0e0' },
//           horzLines: { color: '#e0e0e0' },
//         },
//         crosshair: {
//           mode: CrosshairMode.Normal,
//           vertLine: {
//             width: 1,
//             color: '#758696',
//             labelBackgroundColor: '#758696',
//           },
//           horzLine: {
//             width: 1,
//             color: '#758696',
//             labelBackgroundColor: '#758696',
//           },
//         },
//         rightPriceScale: {
//           borderColor: '#e0e0e0',
//           visible: true,
//         },
//         timeScale: {
//           borderColor: '#e0e0e0',
//           visible: true,
//           timeVisible: true,
//         },
//       });

//       // Add candlestick series
//       const candlestickSeries = chart.addSeries(CandlestickSeries, {
//         priceScaleId: 'candlestick',
//         scaleMargins: { top: 0.1, bottom: 0.2 },
//       });
//       candlestickSeries.setData(data);

//       // Add volume series
//       const volumeSeries = chart.addSeries(HistogramSeries, {
//         priceFormat: {
//           type: 'volume',
//           precision: 2,
//           minMove: 0.01,
//         },
//         priceScaleId: '',
//         scaleMargins: { top: 0.8, bottom: 0 },
//       });
//       volumeSeries.setData(
//         candles.map(candle => ({
//           time: (Date.parse(candle.timestamp) / 1000) as Time,
//           value: candle.volume,
//           color: candle.close >= candle.open
//             ? 'rgba(34, 197, 94, 0.5)'
//             : 'rgba(239, 83, 80, 0.5)',
//         }))
//       );

//       // Add selected indicators
//       selectedIndicators.forEach(indicatorName => {
//         addIndicatorLine(chart, candles, indicatorName);
//       });

//       // Add trade markers
//       if (showTrades) {
//         addTradeMarkers(chart, tradeMarkers, candles, candlestickSeries);
//       }

//       chartRef.current = chart;

//       // Resize handler
//       const handleResize = () => {
//         if (chartContainerRef.current && chartRef.current) {
//           chartRef.current.applyOptions({
//             width: chartContainerRef.current.clientWidth,
//             height: chartContainerRef.current.clientHeight,
//           });
//         }
//       };

//       window.addEventListener('resize', handleResize);
//       return () => {
//         window.removeEventListener('resize', handleResize);
//         if (chartRef.current) {
//           chartRef.current.remove();
//         }
//       };
//     } else {
//       // Create Line Chart (for equity or drawdown)
//       const seriesData = (showEquity ? equityCurve : drawdownCurve) || [];

//       if (seriesData.length === 0) return;

//       const chart = createChart(chartContainerRef.current, {
//         width: chartContainerRef.current.clientWidth,
//         height: chartContainerRef.current.clientHeight,
//         layout: {
//           background: { type: 'solid', color: '#ffffff' },
//           textColor: '#333333',
//         },
//         grid: {
//           vertLines: { color: '#e0e0e0' },
//           horzLines: { color: '#e0e0e0' },
//         },
//         rightPriceScale: {
//           borderColor: '#e0e0e0',
//         },
//         timeScale: {
//           borderColor: '#e0e0e0',
//         },
//       });

//       const lineSeries = chart.addSeries(LineSeries, {
//         color: showEquity ? '#22c55e' : '#ef4444',
//         lineWidth: 2,
//       });

//       const lineData = seriesData.map((value, index) => {
//         const candle = candles[Math.min(index, candles.length - 1)];
//         return {
//           time: (Date.parse(candle.timestamp) / 1000) as Time,
//           value: value,
//         };
//       });

//       lineSeries.setData(lineData);

//       // Add zero line for drawdown
//       if (!showEquity) {
//         lineSeries.createPriceLine({
//           price: 0,
//           color: '#e0e0e0',
//           lineWidth: 1,
//           lineStyle: 1, // 0 = Solid, 1 = Dotted, 2 = Dashed, 3 = LargeDashed
//         });
//       }

//       chartRef.current = chart;

//       const handleResize = () => {
//         if (chartContainerRef.current && chartRef.current) {
//           chartRef.current.applyOptions({
//             width: chartContainerRef.current.clientWidth,
//             height: chartContainerRef.current.clientHeight,
//           });
//         }
//       };

//       window.addEventListener('resize', handleResize);
//       return () => {
//         window.removeEventListener('resize', handleResize);
//         if (chartRef.current) {
//           chartRef.current.remove();
//         }
//       };
//     }
//   }, [candles, selectedIndicators, chartType, showEquity, showTrades, tradeMarkers, equityCurve, drawdownCurve]);


  
//   const addIndicatorLine = (
//     chart: IChartApi,
//     candles: VisualCandle[],
//     indicatorName: string
//   ) => {
//     const data = candles.map(candle => {
//       const indicatorValue = candle.indicators[indicatorName];
//       if (indicatorValue === null || indicatorValue === undefined) return null;
//       return {
//         time: (Date.parse(candle.timestamp) / 1000) as Time,
//         value: indicatorValue,
//       };
//     }).filter(Boolean);

//     if (data.length === 0) return;

//     // Different colors for different indicator types
//     const colors = [
//       '#3b82f6', // blue
//       '#8b5cf6', // purple
//       '#f59e0b', // orange
//       '#10b981', // green
//       '#ef4444', // red
//       '#06b6d4', // cyan
//     ];

//     const colorIndex = Math.floor(Math.random() * colors.length);
//     const lineSeries = chart.addSeries(LineSeries, {
//       color: colors[colorIndex],
//       lineWidth: 1,
//       title: indicatorName,
//     });
//     lineSeries.setData(data);
//     chart.addSeries(lineSeries);
//   };

//   const addTradeMarkers = (
//     chart: IChartApi,
//     markers: TradeMarker[],
//     candles: VisualCandle[],
//     series: ISeriesApi<"Candlestick">
//   ) => {
//     // Find candle indices for markers
//     markers.forEach(marker => {
//       const candleIndex = candles.findIndex(candle => candle.timestamp === marker.timestamp);
//       if (candleIndex === -1) return;

//       const candle = candles[candleIndex];
//       const timestamp = (Date.parse(candle.timestamp) / 1000) as Time;
//       const price = marker.price;

//       const color = marker.type === 'entry'
//         ? marker.position_type === 'long' ? '#22c55e' : '#ef4444'
//         : marker.pnl !== undefined && marker.pnl > 0 ? '#22c55e' : '#ef4444';

//      series.createPriceLine({
//         price: price,
//         color: color,
//         lineWidth: 2,
//         lineStyle: 2,
//         axisLabelVisible: true,
//         title: `${marker.type === 'entry' ? 'E' : 'X'} - ${marker.pnl?.toFixed(2) || ''}`,
//       });
     
//     });
//   };

//   const toggleIndicator = (indicator: string) => {
//     if (selectedIndicators.includes(indicator)) {
//       setSelectedIndicators(selectedIndicators.filter(i => i !== indicator));
//     } else {
//       setSelectedIndicators([...selectedIndicators, indicator]);
//     }
//   };

//   const INDICATOR_COLORS: Record<string, string> = {
//     trend: 'bg-blue-100 text-blue-700',
//     momentum: 'bg-purple-100 text-purple-700',
//     volatility: 'bg-orange-100 text-orange-700',
//     volume: 'bg-green-100 text-green-700',
//     support_resistance: 'bg-pink-100 text-pink-700',
//   };

//   const getIndicatorCategory = (indicator: string): string => {
//     if (indicator.includes('sma') || indicator.includes('ema') || indicator.includes('wma')) return 'trend';
//     if (indicator.includes('rsi') || indicator.includes('macd') || indicator.includes('stochastic') || indicator.includes('momentum')) return 'momentum';
//     if (indicator.includes('bollinger') || indicator.includes('atr') || indicator.includes('vol')) return 'volatility';
//     if (indicator.includes('vwap') || indicator.includes('obv') || indicator.includes('volume')) return 'volume';
//     if (indicator.includes('pivot') || indicator.includes('supply') || indicator.includes('demand') || indicator.includes('harmonic')) return 'support_resistance';
//     return 'trend';
//   };

//   return (
//     <Card className="h-full flex flex-col">
//       <CardHeader>
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <CardTitle>الشارت التفاعلي</CardTitle>
//             <Badge variant="outline">{symbol} - {timeframe}</Badge>
//             <Badge variant="secondary">{candles.length} شمعة</Badge>
//           </div>
//           <div className="flex items-center gap-2">
//             <Button size="sm" variant="outline">
//               <Download className="h-4 w-4" />
//             </Button>
//             <Button size="sm" variant="outline">
//               <Maximize2 className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>
//         <CardDescription>
//           عرض الشموع والموشرات ونقاط الدخول والخروج
//         </CardDescription>
//       </CardHeader>
//       <CardContent className="flex-1 flex flex-col overflow-hidden">
//         {/* Chart Controls */}
//         <div className="flex flex-wrap items-center gap-3 pb-3 border-b">
//           {/* Chart Type Toggle */}
//           <div className="flex items-center gap-2">
//             <Button
//               size="sm"
//               variant={chartType === 'candlestick' ? 'default' : 'outline'}
//               onClick={() => setChartType('candlestick')}
//             >
//               <Layers className="h-4 w-4 mr-1" />
//               شموع
//             </Button>
//             <Button
//               size="sm"
//               variant={chartType === 'line' ? 'default' : 'outline'}
//               onClick={() => setChartType('line')}
//               disabled={!equityCurve && !drawdownCurve}
//             >
//               <TrendingUp className="h-4 w-4 mr-1" />
//               منحنى الأداء
//             </Button>
//           </div>

//           {/* Show Equity Toggle */}
//           {chartType === 'line' && (
//             <div className="flex items-center gap-2">
//               <Checkbox
//                 id="show-equity"
//                 checked={showEquity}
//                 onCheckedChange={setShowEquity}
//               />
//               <Label htmlFor="show-equity" className="cursor-pointer text-sm">
//                 منحنى رأس المال
//               </Label>
//             </div>
//           )}

//           {/* Show Trades Toggle */}
//           <div className="flex items-center gap-2">
//             <Checkbox
//               id="show-trades"
//               checked={showTrades}
//               onCheckedChange={setShowTrades}
//             />
//             <Label htmlFor="show-trades" className="cursor-pointer text-sm">
//               إظهار الصفقات
//             </Label>
//           </div>

//           {/* Indicators Selection */}
//           {chartType === 'candlestick' && availableIndicators.length > 0 && (
//             <div className="flex items-center gap-2 border-l pl-3">
//               <span className="text-sm text-muted-foreground">الموشرات:</span>
//               <div className="flex flex-wrap gap-1">
//                 {availableIndicators.map(indicator => (
//                   <Badge
//                     key={indicator}
//                     variant={selectedIndicators.includes(indicator) ? 'default' : 'outline'}
//                     className={`cursor-pointer ${INDICATOR_COLORS[getIndicatorCategory(indicator)]} ${selectedIndicators.includes(indicator) ? '' : 'hover:bg-muted'}`}
//                     onClick={() => toggleIndicator(indicator)}
//                   >
//                     {indicator}
//                   </Badge>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Chart Container */}
//         <div className="flex-1 min-h-[400px] relative">
//           {candles.length === 0 ? (
//             <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
//               لا توجد بيانات للعرض
//             </div>
//           ) : (
//             <div ref={chartContainerRef} className="w-full h-full" />
//           )}
//         </div>

//         {/* Trade Markers Legend */}
//         {showTrades && tradeMarkers.length > 0 && (
//           <div className="mt-3 pt-3 border-t">
//             <div className="flex items-center gap-4 text-sm">
//               <div className="flex items-center gap-1">
//                 <div className="w-3 h-3 rounded-full bg-green-500" />
//                 <span className="text-muted-foreground">دخول شراء</span>
//               </div>
//               <div className="flex items-center gap-1">
//                 <div className="w-3 h-3 rounded-full bg-red-500" />
//                 <span className="text-muted-foreground">دخول بيع</span>
//               </div>
//               <div className="flex items-center gap-1">
//                 <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
//                 <span className="text-muted-foreground">ربح</span>
//               </div>
//               <div className="flex items-center gap-1">
//                 <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white" />
//                 <span className="text-muted-foreground">خسارة</span>
//               </div>
//               <span className="text-muted-foreground ml-auto">{tradeMarkers.length} صفقة</span>
//             </div>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }









































































































































































































