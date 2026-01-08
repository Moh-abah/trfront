
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/uiadv/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/uiadv/tabs';
import { ScrollArea } from '@/components/uiadv/scroll-area';
import { Separator } from '@/components/uiadv/separator';
import { Badge } from '@/components/uiadv/badge';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, BarChart3, Play, Save, Download, RefreshCw, Loader2, FileJson, CheckCircle2, AlertCircle, Settings, Cpu, Activity, LayoutDashboard, Layers, Zap, FolderTree, Terminal, Gauge, Brain, LineChart, Filter, Shield, Calendar, Coins, Target } from 'lucide-react';

// استيراد المكونات
import { IndicatorSelector } from '@/components/backtestadvanced/indicator-selector';
import { RuleBuilder } from '@/components/backtestadvanced/rule-builder';
import { BacktestConfigForm } from '@/components/backtestadvanced/backtest-config-form';
import { BacktestChart } from '@/components/backtestadvanced/backtest-chart';
import { ResultsDashboard } from '@/components/backtestadvanced/results-dashboard';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/uiadv/accordion";
import {
  BacktestConfig,
  StrategyConfig,
  IndicatorConfig,
  EntryRule,
  ExitRule,
  FilterRule,
  BacktestResponse,
  ChartDataResponse,
  BacktestSummary,
  Trade
} from '@/types/backtest';

export function mapChartSummaryToBacktestSummary(
  chart: ChartDataResponse
): BacktestSummary {
  const s = chart.summary;
  const m = chart.metadata;

  const winningTrades = Math.round(s.total_trades * s.win_rate);
  const losingTrades = s.total_trades - winningTrades;

  return {
    name: m.name,

    initial_capital: m.initial_capital,
    final_capital: m.final_capital,

    total_pnl: s.total_pnl,
    total_pnl_percent: s.total_pnl_percent,

    total_trades: s.total_trades,
    winning_trades: winningTrades,
    losing_trades: losingTrades,
    win_rate: s.win_rate,

    max_drawdown_percent: s.max_drawdown_percent,

    sharpe_ratio: s.sharpe_ratio,
    sortino_ratio: s.sortino_ratio,
    calmar_ratio: s.calmar_ratio,
    profit_factor: s.profit_factor,

    expectancy:
      s.total_trades > 0 ? s.total_pnl / s.total_trades : 0,

    annual_return_percent: s.annual_return_percent,

    execution_time_seconds: 0, // غير متوفر من API
    architecture_mode: 'chart-only',

    // اختياري – نتركه undefined
    recovery_factor: undefined,
    ulcer_index: undefined,
    avg_winning_trade: undefined,
    avg_losing_trade: undefined,
    largest_winning_trade: undefined,
    largest_losing_trade: undefined,
    avg_trade_duration_hours: undefined,
  };
}

export default function StrategyBuilderPage() {
  const [activeTab, setActiveTab] = useState<'builder' | 'results'>('builder');
  const [builderTab, setBuilderTab] = useState<'indicators' | 'rules' | 'config' | null>(null);
  const [backtestConfig, setBacktestConfig] = useState<Partial<BacktestConfig>>({});
  const [backtestResponse, setBacktestResponse] = useState<BacktestResponse | null>(null);
  const [chartData, setChartData] = useState<ChartDataResponse | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isFetchingChart, setIsFetchingChart] = useState(false);
  const { toast } = useToast();
  const [bottomPanelHeight, setBottomPanelHeight] = useState<'collapsed' | 'expanded'>('collapsed');
  const [activeBottomTab, setActiveBottomTab] = useState<'indicators' | 'rules' | 'config'>('indicators');
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(false);
  // Initialize with default strategy config
  useEffect(() => {
    const today = new Date();
    const past = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    const todayISO = today.toISOString();
    const pastISO = past.toISOString();

    const defaultStrategyConfig: StrategyConfig = {
      name: 'New Strategy',
      version: '1.0.0',
      description: '',
      base_timeframe: '1h',
      position_side: 'both',
      indicators: [],
      entry_rules: [
        {
          name: 'RSI Entry',
          condition: { type: 'indicator_value', operator: '<', left_value: 'indicator:rsi', right_value: 30 },
          position_side: 'long',
          weight: 0.5,
          enabled: true
        }
      ],
      exit_rules: [
        {
          name: 'RSI Exit',
          condition: { type: 'indicator_value', operator: '>', left_value: 'indicator:rsi', right_value: 70 },
          exit_type: 'signal_exit',
          enabled: true
        }
      ],
      filter_rules: [],
      risk_management: {
        stop_loss_percentage: 2.0,
        take_profit_percentage: 4.0,
        trailing_stop_percentage: 1.0,
        max_position_size: 0.1,
        max_daily_loss: 5.0,
        max_concurrent_positions: 3
      },
    };

    setBacktestConfig({
      ...defaultStrategyConfig,
      strategy_config: defaultStrategyConfig,
      start_date: pastISO,
      end_date: todayISO
    });
  }, []);

  // Handlers
  const handleIndicatorsChange = (indicators: IndicatorConfig[]) => {
    setBacktestConfig({
      ...backtestConfig,
      strategy_config: {
        ...backtestConfig.strategy_config!,
        indicators
      }
    });
  };

  const handleEntryRulesChange = (rules: EntryRule[]) => {
    setBacktestConfig({
      ...backtestConfig,
      strategy_config: {
        ...backtestConfig.strategy_config!,
        entry_rules: rules
      }
    });
  };

  const handleExitRulesChange = (rules: ExitRule[]) => {
    setBacktestConfig({
      ...backtestConfig,
      strategy_config: {
        ...backtestConfig.strategy_config!,
        exit_rules: rules
      }
    });
  };

  const handleFilterRulesChange = (rules: FilterRule[]) => {
    setBacktestConfig({
      ...backtestConfig,
      strategy_config: {
        ...backtestConfig.strategy_config!,
        filter_rules: rules
      }
    });
  };

  const handleConfigChange = (config: Partial<BacktestConfig>) => {
    setBacktestConfig(config);
  };

  const handleTimeframeChange = (timeframe: string) => {
    setBacktestConfig({
      ...backtestConfig,
      timeframe,
      strategy_config: {
        ...backtestConfig.strategy_config!,
        base_timeframe: timeframe
      }
    });
  };




  const handleRunBacktest = async () => {
    console.log('🔵 handleRunBacktest called');

    // التحقق الأساسي فقط
    const validationErrors: string[] = [];

    // الحقول الأساسية المطلوبة حقاً
    const essentialBacktestFields = [
      { key: 'name', label: 'اسم الباك-تست' },
      { key: 'start_date', label: 'تاريخ البداية' },
      { key: 'end_date', label: 'تاريخ النهاية' },
      { key: 'timeframe', label: 'الإطار الزمني' },
      { key: 'market', label: 'نوع السوق' },
      { key: 'symbols', label: 'أزواج التداول' },
      { key: 'initial_capital', label: 'رأس المال الأولي' },
      { key: 'position_sizing', label: 'طريقة تحديد الحجم' },
      { key: 'position_size_percent', label: 'نسبة حجم المركز' },
      { key: 'max_positions', label: 'المراكز المتزامنة' },
      { key: 'commission_rate', label: 'العمولة' },
      { key: 'slippage_percent', label: 'الانزلاق السعري' },
      { key: 'leverage', label: 'الرافعة المالية' }
    ];

    essentialBacktestFields.forEach(({ key, label }) => {
      const value = backtestConfig[key as keyof BacktestConfig];

      if (value === undefined || value === null || value === '') {
        validationErrors.push(`❌ ${label} مطلوب`);
      } else if (key === 'symbols' && Array.isArray(value) && value.length === 0) {
        validationErrors.push(`❌ يجب إضافة أزواج تداول واحدة على الأقل`);
      } else if (key === 'initial_capital' && Number(value) <= 0) {
        validationErrors.push(`❌ رأس المال الأولي يجب أن يكون أكبر من الصفر`);
      } else if (key === 'position_size_percent') {
        const percentValue = Number(value);
        // تحقق: يجب أن تكون بين 0.01 و 100
        if (percentValue <= 0 || percentValue > 100) {
          validationErrors.push(`❌ نسبة حجم المركز يجب أن تكون بين 0.01 و 100`);
        }
      } else if (key === 'leverage' && Number(value) < 1) {
        validationErrors.push(`❌ الرافعة المالية يجب أن تكون 1 أو أكثر`);
      }
    });

    // التحقق من وجود الإستراتيجية الأساسية
    if (!backtestConfig.strategy_config) {
      validationErrors.push('❌ يجب تحديد إستراتيجية');
    } else {
      const strategy = backtestConfig.strategy_config;

      // الحقول الأساسية في الإستراتيجية
      const essentialStrategyFields = [
        { key: 'name', label: 'اسم الإستراتيجية' },
        { key: 'base_timeframe', label: 'الإطار الزمني الأساسي' },
        { key: 'position_side', label: 'اتجاه المركز' },
        { key: 'risk_management', label: 'إدارة المخاطر' }
      ];

      essentialStrategyFields.forEach(({ key, label }) => {
        const value = strategy[key as keyof StrategyConfig];

        if (value === undefined || value === null || value === '') {
          validationErrors.push(`❌ ${label} مطلوب في الإستراتيجية`);
        }
      });

      // إذا كان هناك risk_management، تحقق من حقوله الأساسية
      if (strategy.risk_management) {
        const riskManagement = strategy.risk_management;
        if (!riskManagement.stop_loss_percentage) {
          validationErrors.push(`❌ وقف الخسارة مطلوب في إدارة المخاطر`);
        }
        if (!riskManagement.take_profit_percentage) {
          validationErrors.push(`❌ جني الأرباح مطلوب في إدارة المخاطر`);
        }
        if (!riskManagement.max_position_size) {
          validationErrors.push(`❌ حجم المركز الأقصى مطلوب في إدارة المخاطر`);
        }
      }

      // التحقق من تطابق timeframe و base_timeframe
      if (backtestConfig.timeframe && strategy.base_timeframe &&
        backtestConfig.timeframe !== strategy.base_timeframe) {
        validationErrors.push(`❌ الإطار الزمني للباك-تست (${backtestConfig.timeframe}) لا يطابق الإطار الزمني للإستراتيجية (${strategy.base_timeframe})`);
      }
    }

    // إذا كانت هناك أخطاء، عرضها جميعاً
    if (validationErrors.length > 0) {
      console.log('Validation errors:', validationErrors);
      toast({
        variant: 'destructive',
        title: 'أخطاء في الإدخال',
        description: (
          <div className="max-h-60 overflow-y-auto">
            <ul className="list-disc list-inside space-y-1 text-xs">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        ),
        duration: 10000
      });
      return;
    }

    console.log('✅ All validations passed, creating payload...');

    // تحويل position_size_percent من نسبة مئوية إلى رقم عشري (6% -> 0.06)
    const positionSizePercent = backtestConfig.position_size_percent!;
    const positionSizeDecimal = positionSizePercent > 1 ? positionSizePercent / 100 : positionSizePercent;

    // ضمان أن max_daily_loss_percent لا يكون 0
    const maxDailyLossPercent = backtestConfig.max_daily_loss_percent && backtestConfig.max_daily_loss_percent > 0
      ? backtestConfig.max_daily_loss_percent
      : 0.1; // قيمة افتراضية 0.1%

    // تحويل commission_rate و slippage_percent من نسبة مئوية إلى رقم عشري
    const commissionRate = backtestConfig.commission_rate!;
    const commissionRateDecimal = commissionRate > 1 ? commissionRate / 100 : commissionRate;

    const slippagePercent = backtestConfig.slippage_percent!;
    const slippagePercentDecimal = slippagePercent > 1 ? slippagePercent / 100 : slippagePercent;

    // إنشاء payload مع التحويلات الصحيحة
    const payload: BacktestConfig = {
      // إعدادات الباك-تست العامة
      name: backtestConfig.name!,
      description: backtestConfig.description || '',
      mode: backtestConfig.mode || 'standard',
      start_date: backtestConfig.start_date!,
      end_date: backtestConfig.end_date!,
      timeframe: backtestConfig.timeframe!,
      market: backtestConfig.market!,
      symbols: backtestConfig.symbols!,

      // الإستراتيجية
      strategy_config: {
        name: backtestConfig.strategy_config!.name,
        version: backtestConfig.strategy_config!.version || '1.0.0',
        description: backtestConfig.strategy_config!.description || '',
        base_timeframe: backtestConfig.strategy_config!.base_timeframe!,
        position_side: backtestConfig.strategy_config!.position_side!,
        indicators: backtestConfig.strategy_config!.indicators || [],
        entry_rules: backtestConfig.strategy_config!.entry_rules || [],
        exit_rules: backtestConfig.strategy_config!.exit_rules || [],
        filter_rules: backtestConfig.strategy_config!.filter_rules || [],
        risk_management: {
          stop_loss_percentage: backtestConfig.strategy_config!.risk_management!.stop_loss_percentage!,
          take_profit_percentage: backtestConfig.strategy_config!.risk_management!.take_profit_percentage!,
          trailing_stop_percentage: backtestConfig.strategy_config!.risk_management!.trailing_stop_percentage || 0,
          max_position_size: backtestConfig.strategy_config!.risk_management!.max_position_size!,
          max_daily_loss: backtestConfig.strategy_config!.risk_management!.max_daily_loss || 5,
          max_concurrent_positions: backtestConfig.strategy_config!.risk_management!.max_concurrent_positions || 3
        }
      },

      // إعدادات الباك-تست المالية - مع التحويلات الصحيحة
      initial_capital: backtestConfig.initial_capital!,
      position_sizing: backtestConfig.position_sizing!,
      position_size_percent: positionSizeDecimal, // محول إلى رقم عشري
      max_positions: backtestConfig.max_positions!,
      commission_rate: commissionRateDecimal, // محول إلى رقم عشري
      slippage_percent: slippagePercentDecimal, // محول إلى رقم عشري
      stop_loss_percent: backtestConfig.stop_loss_percent ? backtestConfig.stop_loss_percent / 100 : 0, // تحويل إلى عشري
      take_profit_percent: backtestConfig.take_profit_percent ? backtestConfig.take_profit_percent / 100 : 0, // تحويل إلى عشري
      trailing_stop_percent: backtestConfig.trailing_stop_percent ? backtestConfig.trailing_stop_percent / 100 : 0, // تحويل إلى عشري
      max_daily_loss_percent: maxDailyLossPercent, // تأكد أنه لا يكون 0
      enable_short_selling: backtestConfig.enable_short_selling !== undefined ? backtestConfig.enable_short_selling : false,
      enable_margin: backtestConfig.enable_margin !== undefined ? backtestConfig.enable_margin : false,
      leverage: backtestConfig.leverage!,
      require_confirmation: backtestConfig.require_confirmation !== undefined ? backtestConfig.require_confirmation : false
    };

    console.log('📤 Payload to send:', JSON.stringify(payload, null, 2));
    console.log('📊 Percentages converted:');
    console.log('- position_size_percent:', backtestConfig.position_size_percent, '->', positionSizeDecimal);
    console.log('- commission_rate:', backtestConfig.commission_rate, '->', commissionRateDecimal);
    console.log('- slippage_percent:', backtestConfig.slippage_percent, '->', slippagePercentDecimal);

    setIsRunning(true);

    try {
      const response = await fetch('/api/v1/backtest1/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.error || errorData.message || 'Failed to run backtest');
      }

      const data: BacktestResponse = await response.json();
      console.log('✅ Backtest response:', data);

      if (data.success && data.backtest_id) {
        setBacktestResponse(data);
        toast({
          title: 'تم بنجاح',
          description: `تم إكمال الباك-تيست: ${data.summary.name}`
        });

        // Auto-fetch chart data
        await fetchChartData(data.backtest_id);
      } else {
        throw new Error('Backtest execution failed');
      }
    } catch (error) {
      console.error('🔥 Backtest error:', error);
      toast({
        variant: 'destructive',
        title: 'فشل الباك-تيست',
        description: error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
      });
    } finally {
      setIsRunning(false);
    }
  };

  // // 2. Fetch Chart Data Logic
  const fetchChartData = async (backtestId: string) => {
    setIsFetchingChart(true);
    try {
      const response = await fetch(`/api/v1/backtest1/${backtestId}/chart-data`);

      if (!response.ok) {
        throw new Error('Failed to fetch chart data');
      }

      const data: ChartDataResponse = await response.json();
      setChartData(data);
      setActiveTab('results');

      toast({
        title: 'تم تحديث البيانات',
        description: `تم جلب ${data.chart_data.total_candles} شمعة و ${data.chart_data.total_trades} صفقة`
      });
    } catch (error) {
      console.error('Chart data error:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ في جلب البيانات',
        description: error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
      });
    } finally {
      setIsFetchingChart(false);
    }
  };

  // 2. Fetch Chart Data Logic
  // const fetchChartData = async (backtestId: string) => {
  //   setIsFetchingChart(true);
  //   try {
  //     // اختيار: استخدام ID ثابت للاختبار أو ID حقيقي
  //     const USE_FIXED_ID = true; // قم بتغييرها إلى false عندما تريد استخدام الـ ID الحقيقي
  //     const fixedBacktestId = '8ff4e604-468d-4539-be90-82b93b8ab365';

  //     const targetId = USE_FIXED_ID ? fixedBacktestId : backtestId;

  //     console.log(`Fetching chart data for ID: ${targetId}`);

  //     const response = await fetch(`/api/v1/backtest1/${targetId}/chart-data`);

  //     if (!response.ok) {
  //       throw new Error(`Failed to fetch chart data. Status: ${response.status}`);
  //     }

  //     const data: ChartDataResponse = await response.json();
  //     setChartData(data);
  //     setActiveTab('results');

  //     toast({
  //       title: 'تم تحديث البيانات',
  //       description: `تم جلب ${data.chart_data.total_candles} شمعة و ${data.chart_data.total_trades} صفقة`
  //     });
  //   } catch (error) {
  //     console.error('Chart data error:', error);
  //     toast({
  //       variant: 'destructive',
  //       title: 'خطأ في جلب البيانات',
  //       description: error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
  //     });
  //   } finally {
  //     setIsFetchingChart(false);
  //   }
  // };


  // 3. Download Logic
  const handleDownloadResults = () => {
    if (!backtestResponse) return;

    const data = JSON.stringify(backtestResponse, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backtest_${backtestResponse.backtest_id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'تم التحميل',
      description: 'تم تنزيل نتائج الباك-تيست'
    });
  };

  const handleSaveStrategy = () => {
    if (!backtestConfig.strategy_config?.name) return;

    const data = JSON.stringify(backtestConfig.strategy_config, null, 2);
    localStorage.setItem(`strategy_${backtestConfig.strategy_config.name}`, data);

    toast({
      title: 'تم الحفظ',
      description: 'تم حفظ الاستراتيجية محلياً'
    });
  };

  const handleRefreshChart = () => {
    if (backtestResponse) {
      fetchChartData(backtestResponse.backtest_id);
    }
  };





  return (
    <div className="flex h-screen flex-col min-h-0 bg-[#131722] text-[#D1D4DC] font-sans overflow-hidden">

      <header className="h-11 bg-[#1E222D] border-b border-[#363C4E] flex flex-wrap items-center justify-between px-3 z-50 shrink-0">
        {/* Left: زر التجربة */}
        {/* <div className="flex items-center gap-4">
          <Button
            onClick={() => fetchChartData('9c12fa50-00b0-4304-8b4b-9ee8a996d77f')}
            disabled={isFetchingChart}
            variant="outline"
          >
            {isFetchingChart ? <Loader2 className="h-4 w-4 animate-spin" /> : <LineChart className="h-4 w-4" />}
            تجربة جلب البيانات
          </Button>
        </div> */}

        {/* Center: Strategy Info */}
        <div className="flex items-center gap-3">
          <div className="text-xs bg-[#2A2E39] px-3 py-1 rounded border border-[#363C4E]">
            <span className="text-[#787B86]">Strategy:</span>
            <span className="ml-2 text-white font-medium">
              {backtestConfig.strategy_config?.name || 'Untitled'}
            </span>
          </div>
          <div className="text-xs bg-[#2A2E39] px-3 py-1 rounded border border-[#363C4E]">
            <span className="text-[#787B86]">TF:</span>
            <span className="ml-1 text-white font-medium">{backtestConfig.timeframe || '1h'}</span>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2">
          {backtestResponse && (
            <>
              <button
                onClick={handleDownloadResults}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#787B86] hover:text-white hover:bg-[#2A2E39] rounded border border-[#363C4E]"
              >
                <FileJson className="h-3 w-3" />
                Export
              </button>
              <button
                onClick={handleRefreshChart}
                disabled={isFetchingChart}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#787B86] hover:text-white hover:bg-[#2A2E39] rounded border border-[#363C4E]"
              >
                <RefreshCw className={`h-3 w-3 ${isFetchingChart ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </>
          )}
          <button
            onClick={handleSaveStrategy}
            className="ml-2 px-4 py-1.5 text-xs bg-[#2962FF] hover:bg-[#1E53E5] text-white font-medium rounded"
          >
            Save
          </button>
        </div>
      </header>

      {/* --- MAIN LAYOUT --- */}
      <main className="flex-1 flex overflow-hidden">

        {/* --- CENTER: Chart Area (FULL WIDTH) --- */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#131722]">

          {/* Chart Header (TradingView Style) */}
          <div className="h-9 bg-[#1E222D] border-b border-[#363C4E] flex items-center px-3 shrink-0">
            {/* Timeframes */}
            <div className="flex items-center gap-1">
              {['1m', '5m', '15m', '1h', '4h', '1D', '1W'].map((tf) => (
                <button
                  key={tf}
                  className={`px-2 py-1 text-xs rounded ${backtestConfig.timeframe === tf ? 'bg-[#2962FF] text-white' : 'text-[#787B86] hover:text-white hover:bg-[#2A2E39]'}`}
                  onClick={() => handleTimeframeChange(tf)}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Chart Controls */}
            <div className="flex-1 flex justify-end items-center gap-2">
              {chartData && (
                <>
                  <div className="text-xs text-[#787B86]">
                    <span className="text-white">{chartData.metadata.symbol}</span>
                    <span className="mx-2">•</span>
                    <span>{chartData.chart_data.total_candles.toLocaleString()} bars</span>
                  </div>
                  <button
                    onClick={handleRefreshChart}
                    className="p-1.5 text-[#787B86] hover:text-white hover:bg-[#2A2E39] rounded"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isFetchingChart ? 'animate-spin' : ''}`} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Main Chart (Full Screen) */}
          <div className="flex-1 min-h-0 relative">


            {isFetchingChart ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-[#2962FF]" />
                  <span className="text-sm text-[#787B86]">Loading chart...</span>
                </div>
              </div>
            ) : chartData ? (
              <BacktestChart
                candles={chartData.chart_data.candles}
                tradeMarkers={chartData.chart_data.trade_markers}
                equityCurve={chartData.equity_curve}
                drawdownCurve={chartData.drawdown_curve}
                availableIndicators={chartData.chart_data.available_indicators}
                symbol={chartData.metadata.symbol}
                timeframe={chartData.metadata.timeframe}
                summary={mapChartSummaryToBacktestSummary(chartData)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-[#363C4E] mx-auto mb-3" />
                  <p className="text-sm text-[#787B86]">No chart data available</p>
                  <p className="text-xs text-[#4A4E5A] mt-1">Run a backtest to view results</p>
                </div>
              </div>
            )}
          </div>


          {/* --- BOTTOM TABS (NEW) --- */}
          <div className="h-10 bg-[#1E222D] border-t border-[#363C4E] flex items-center justify-center gap-4 px-4 shrink-0">
            {/* Builder Tabs */}
            <button
              onClick={() => setBuilderTab(builderTab === 'indicators' ? null : 'indicators')}
              className={`flex items-center gap-2 px-4 py-2 text-xs rounded-t-lg transition-all ${builderTab === 'indicators' ? 'bg-[#131722] text-white border-t border-x border-[#363C4E]' : 'text-[#787B86] hover:text-white'}`}
            >
              <LineChart className="h-4 w-4" />
              Indicators
              <span className="text-xs px-1.5 py-0.5 bg-[#2A2E39] rounded">
                {backtestConfig.strategy_config?.indicators.filter(i => i.enabled).length || 0}
              </span>
            </button>

            <button
              onClick={() => setBuilderTab(builderTab === 'rules' ? null : 'rules')}
              className={`flex items-center gap-2 px-4 py-2 text-xs rounded-t-lg transition-all ${builderTab === 'rules' ? 'bg-[#131722] text-white border-t border-x border-[#363C4E]' : 'text-[#787B86] hover:text-white'}`}
            >
              <Filter className="h-4 w-4" />
              Rules
              <span className="text-xs px-1.5 py-0.5 bg-[#2A2E39] rounded">
                {(backtestConfig.strategy_config?.entry_rules.filter(r => r.enabled).length || 0) + (backtestConfig.strategy_config?.exit_rules.filter(r => r.enabled).length || 0)}
              </span>
            </button>

            <button
              onClick={() => setBuilderTab(builderTab === 'config' ? null : 'config')}
              className={`flex items-center gap-2 px-4 py-2 text-xs rounded-t-lg transition-all ${builderTab === 'config' ? 'bg-[#131722] text-white border-t border-x border-[#363C4E]' : 'text-[#787B86] hover:text-white'}`}
            >
              <Settings className="h-4 w-4" />
              Configuration
            </button>

            <div className="flex-1" />

            {/* Run Button */}
            <button
              onClick={handleRunBacktest}
              disabled={isRunning}
              className="px-4 py-2 text-xs bg-gradient-to-r from-[#2962FF] to-[#0D47A1] hover:from-[#1E53E5] hover:to-[#0D3A8C] text-white font-medium rounded flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run Backtest
                </>
              )}
            </button>
          </div>
        </div>



      </main>

      {/* 2. زر عائم لفتح اللوحة */}
      <div className="fixed right-4 bottom-16 z-50"> {/* غيرت z-index إلى 50 */}
        <button
          onClick={() => setShowSidePanel(!showSidePanel)}
          className="p-3 bg-gradient-to-r from-[#2962FF] to-[#0D47A1] rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center"
        >
          {showSidePanel ? (
            <>
              <ChevronRight className="h-5 w-5 text-white" />
              <span className="ml-2 text-xs text-white">إغلاق</span>
            </>
          ) : (
            <>
              <BarChart3 className="h-5 w-5 text-white" />
              <span className="ml-2 text-xs text-white">النتائج</span>
            </>
          )}
        </button>
      </div>

      {/* اللوحة المنزلقة */}
      <div className={`fixed right-0 top-0 h-full bg-[#1E222D] border-l border-[#363C4E] shadow-2xl transition-all duration-300 z-20 ${showSidePanel ? 'translate-x-0 w-80' : 'translate-x-full w-0'
        }`}>

        {/* Results Tabs - متطابقة مع المحتوى القديم */}
        <div className="flex border-b border-[#363C4E]">
          <button
            onClick={() => setActiveTab('builder')}
            className={`flex-1 py-2.5 text-sm font-medium ${activeTab === 'builder' ? 'text-white border-b-2 border-[#2962FF]' : 'text-[#787B86] hover:text-white'}`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <Brain className="h-4 w-4" />
              Builder
            </div>
          </button>
          <button
            onClick={() => setActiveTab('results')}
            disabled={!backtestResponse}
            className={`flex-1 py-2.5 text-sm font-medium ${activeTab === 'results' ? 'text-white border-b-2 border-[#2962FF]' : 'text-[#787B86] hover:text-white'} disabled:opacity-40`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <BarChart3 className="h-4 w-4" />
              Results
            </div>
          </button>
        </div>

        {/* Results Content */}
        <div className="flex-1 overflow-auto h-[calc(100vh-80px)]">
          {activeTab === 'builder' ? (
            /* Strategy Summary */
            <div className="p-4">
              <h3 className="text-sm font-medium text-white mb-4">Strategy Summary</h3>

              {/* Status Card */}
              <div className="mb-4 p-3 bg-[#131722] rounded border border-[#363C4E]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#787B86]">Status</span>
                  {isRunning ? (
                    <div className="flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#2962FF]" />
                      <span className="text-xs text-[#2962FF]">Running</span>
                    </div>
                  ) : backtestResponse ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[#26A69A]"></div>
                      <span className="text-xs text-[#26A69A]">Completed</span>
                    </div>
                  ) : (
                    <span className="text-xs text-[#787B86]">Ready</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="text-center p-2 bg-[#0D1117] rounded">
                    <div className="text-lg font-bold text-white">
                      {backtestConfig.strategy_config?.indicators.filter(i => i.enabled).length || 0}
                    </div>
                    <div className="text-xs text-[#787B86] mt-1">Indicators</div>
                  </div>
                  <div className="text-center p-2 bg-[#0D1117] rounded">
                    <div className="text-lg font-bold text-white">
                      {(backtestConfig.strategy_config?.entry_rules.filter(r => r.enabled).length || 0) + (backtestConfig.strategy_config?.exit_rules.filter(r => r.enabled).length || 0)}
                    </div>
                    <div className="text-xs text-[#787B86] mt-1">Rules</div>
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs text-[#787B86] mb-2">Capital</h4>
                  <div className="text-sm text-white font-medium">
                    ${backtestConfig.initial_capital?.toLocaleString() || '10,000'}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs text-[#787B86] mb-2">Symbols</h4>
                  <div className="flex flex-wrap gap-1">
                    {backtestConfig.symbols?.map((sym, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-[#131722] text-[#787B86] rounded border border-[#363C4E]">
                        {sym}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Results Dashboard */
            <div className="p-4">
              {backtestResponse ? (
                <>
                  <h3 className="text-sm font-medium text-white mb-4">Performance</h3>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-[#131722] rounded border border-[#363C4E]">
                      <div className="text-xs text-[#787B86]">Net PnL</div>
                      <div className={`text-lg font-bold ${backtestResponse.summary.total_pnl >= 0 ? 'text-[#26A69A]' : 'text-[#EF5350]'}`}>
                        ${backtestResponse.summary.total_pnl.toFixed(2)}
                      </div>
                    </div>
                    <div className="p-3 bg-[#131722] rounded border border-[#363C4E]">
                      <div className="text-xs text-[#787B86]">Total Trades</div>
                      <div className="text-lg font-bold text-white">{backtestResponse.summary.total_trades}</div>
                    </div>
                  </div>

                  {/* More Stats */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-[#363C4E]">
                      <span className="text-sm text-[#787B86]">Win Rate</span>
                      <span className="text-sm font-medium text-white">{backtestResponse.summary.win_rate}%</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[#363C4E]">
                      <span className="text-sm text-[#787B86]">Profit Factor</span>
                      <span className="text-sm font-medium text-white">{backtestResponse.summary.profit_factor.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[#363C4E]">
                      <span className="text-sm text-[#787B86]">Max Drawdown</span>
                      <span className="text-sm font-medium text-[#EF5350]">{backtestResponse.summary.max_drawdown_percent}%</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[#363C4E]">
                      <span className="text-sm text-[#787B86]">Sharpe Ratio</span>
                      <span className="text-sm font-medium text-white">{backtestResponse.summary.sharpe_ratio.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Trade List */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-white mb-3">Recent Trades</h4>
                    <div className="space-y-2">
                        {backtestResponse.trades ?.slice(0, 5).map((trade: Trade, idx: number) => (
                        <div key={idx} className="p-2 bg-[#131722] rounded border border-[#363C4E]">
                          {/* <div className="flex justify-between items-center">
                            <div>
                              <span className={`text-xs font-medium ${trade.type === 'buy' ? 'text-[#26A69A]' : 'text-[#EF5350]'}`}>
                                {trade.type.toUpperCase()}
                              </span>
                              <span className="text-xs text-[#787B86] ml-2">{trade.symbol}</span>
                            </div>
                            <span className={`text-xs font-bold ${trade.pnl >= 0 ? 'text-[#26A69A]' : 'text-[#EF5350]'}`}>
                              ${trade.pnl?.toFixed(2)}
                            </span>
                          </div> */}

                            <div className="flex justify-between items-center">
                              <div>
                                <span
                                  className={`text-xs font-medium ${(trade.type ?? (trade.position_type === 'long' ? 'buy' : 'sell')) === 'buy'
                                      ? 'text-[#26A69A]'
                                      : 'text-[#EF5350]'
                                    }`}
                                >
                                  {(trade.type ?? (trade.position_type === 'long' ? 'buy' : 'sell')).toUpperCase()}
                                </span>
                                <span className="text-xs text-[#787B86] ml-2">{trade.symbol}</span>
                              </div>
                              <span
                                className={`text-xs font-bold ${(trade.pnl ?? 0) >= 0 ? 'text-[#26A69A]' : 'text-[#EF5350]'
                                  }`}
                              >
                                ${trade.pnl?.toFixed(2)}
                              </span>
                            </div>

                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-[#363C4E] mx-auto mb-3" />
                  <p className="text-sm text-[#787B86]">No results available</p>
                  <p className="text-xs text-[#4A4E5A] mt-1">Run a backtest to see performance metrics</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Status Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-[#363C4E] bg-[#1E222D]">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-[#2962FF] animate-pulse' : backtestResponse ? 'bg-[#26A69A]' : 'bg-[#787B86]'}`}></div>
              <span className="text-[#787B86]">
                {isRunning ? 'Processing...' : backtestResponse ? 'Ready' : 'Idle'}
              </span>
            </div>
            <span className="text-[#4A4E5A]">v2.4.0</span>
          </div>
        </div>
      </div>

      {/* عناصر التحكم العائمة في الزوايا */}

      {/* 1. بطاقة النتائج المصغرة في الزاوية اليسرى العليا */}
      {backtestResponse && !showSidePanel && (
        <div className="fixed left-4 top-16 w-64 bg-[#1E222D]/90 backdrop-blur-sm border border-[#363C4E]/50 rounded-lg shadow-2xl z-10">
          <div className="p-3 border-b border-[#363C4E] flex justify-between items-center">
            <h3 className="text-sm font-medium text-white">Quick Stats</h3>
            <button
              onClick={() => setShowSidePanel(true)}
              className="text-xs text-[#2962FF] hover:text-white"
            >
              View All
            </button>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-[#787B86]">Net PnL</div>
                <div className={`text-sm font-bold ${backtestResponse.summary.total_pnl >= 0 ? 'text-[#26A69A]' : 'text-[#EF5350]'}`}>
                  ${backtestResponse.summary.total_pnl.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#787B86]">Win Rate</div>
                <div className="text-sm font-bold text-white">{backtestResponse.summary.win_rate}%</div>
              </div>
              <div>
                <div className="text-xs text-[#787B86]">Trades</div>
                <div className="text-sm font-bold text-white">{backtestResponse.summary.total_trades}</div>
              </div>
              <div>
                <div className="text-xs text-[#787B86]">Profit Factor</div>
                <div className="text-sm font-bold text-white">{backtestResponse.summary.profit_factor.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. زر عائم لفتح اللوحة */}
      <div className="fixed right-4 bottom-4 z-30">
        <button
          onClick={() => setShowSidePanel(!showSidePanel)}
          className="p-3 bg-gradient-to-r from-[#2962FF] to-[#0D47A1] rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
        >
          {showSidePanel ? (
            <ChevronRight className="h-5 w-5 text-white" />
          ) : (
            <BarChart3 className="h-5 w-5 text-white" />
          )}
        </button>
      </div>

      {/* --- BOTTOM POPUP PANELS --- */}

      {/* Indicators Panel */}
      {builderTab === 'indicators' && (
        <div className="fixed bottom-10 left-0 right-0 z-40 animate-in slide-in-from-bottom duration-300">
          <div className="mx-auto max-w-6xl">
            <div className="bg-[#1E222D] rounded-t-xl border border-b-0 border-[#363C4E] shadow-2xl">
              <div className="px-4 py-3 border-b border-[#363C4E] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <LineChart className="h-5 w-5 text-[#2962FF]" />
                  <h3 className="text-sm font-medium text-white">Technical Indicators</h3>
                  <span className="text-xs px-2 py-0.5 bg-[#2A2E39] text-[#787B86] rounded">
                    {backtestConfig.strategy_config?.indicators.filter(i => i.enabled).length || 0} active
                  </span>
                </div>
                <button
                  onClick={() => setBuilderTab(null)}
                  className="p-1.5 text-[#787B86] hover:text-white hover:bg-[#2A2E39] rounded"
                >
                  ×
                </button>
              </div>
              <div className="max-h-[500px] overflow-y-auto p-4">
                <IndicatorSelector
                  selectedIndicators={backtestConfig.strategy_config?.indicators || []}
                  onIndicatorsChange={handleIndicatorsChange}
                  timeframe={backtestConfig.timeframe || '1h'}
                  onTimeframeChange={handleTimeframeChange}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rules Panel */}
      {builderTab === 'rules' && (
        <div className="fixed bottom-10 left-0 right-0 z-40 animate-in slide-in-from-bottom duration-300">
          <div className="mx-auto max-w-6xl">
            <div className="bg-[#1E222D] rounded-t-xl border border-b-0 border-[#363C4E] shadow-2xl">
              <div className="px-4 py-3 border-b border-[#363C4E] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Filter className="h-5 w-5 text-[#2962FF]" />
                  <h3 className="text-sm font-medium text-white">Execution Rules</h3>
                  <span className="text-xs px-2 py-0.5 bg-[#2A2E39] text-[#787B86] rounded">
                    {(backtestConfig.strategy_config?.entry_rules.filter(r => r.enabled).length || 0) + (backtestConfig.strategy_config?.exit_rules.filter(r => r.enabled).length || 0)} active
                  </span>
                </div>
                <button
                  onClick={() => setBuilderTab(null)}
                  className="p-1.5 text-[#787B86] hover:text-white hover:bg-[#2A2E39] rounded"
                >
                  ×
                </button>
              </div>
              <div className="max-h-[500px] overflow-y-auto p-4">
                <RuleBuilder
                  entryRules={backtestConfig.strategy_config?.entry_rules || []}
                  exitRules={backtestConfig.strategy_config?.exit_rules || []}
                  filterRules={backtestConfig.strategy_config?.filter_rules || []}
                  onEntryRulesChange={handleEntryRulesChange}
                  onExitRulesChange={handleExitRulesChange}
                  onFilterRulesChange={handleFilterRulesChange}
                  availableIndicators={backtestConfig.strategy_config?.indicators || []}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Config Panel */}
      {builderTab === 'config' && (
        <div className="fixed bottom-10 left-0 right-0 z-40 animate-in slide-in-from-bottom duration-300">
          <div className="mx-auto max-w-6xl">
            <div className="bg-[#1E222D] rounded-t-xl border border-b-0 border-[#363C4E] shadow-2xl">
              <div className="px-4 py-3 border-b border-[#363C4E] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-[#2962FF]" />
                  <h3 className="text-sm font-medium text-white">Backtest Configuration</h3>
                </div>
                <button
                  onClick={() => setBuilderTab(null)}
                  className="p-1.5 text-[#787B86] hover:text-white hover:bg-[#2A2E39] rounded"
                >
                  ×
                </button>
              </div>
              <div className="max-h-[500px] overflow-y-auto p-4">
                <BacktestConfigForm
                  config={backtestConfig}
                  onConfigChange={handleConfigChange}
                  onRunBacktest={handleRunBacktest}
                  isRunning={isRunning}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay for closing panels */}
      {builderTab && (
        <div
          className="fixed inset-0 bg-black/30 z-30"
          onClick={() => setBuilderTab(null)}
        />
      )}
    </div>
  );
}
