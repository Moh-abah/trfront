
// \src\app\backtestadvancesd\page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/uiadv/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/uiadv/tabs';
import { ScrollArea } from '@/components/uiadv/scroll-area';
import { Separator } from '@/components/uiadv/separator';
import { Badge } from '@/components/uiadv/badge';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, BarChart3, Play, Save, Download, RefreshCw, Loader2, FileJson, CheckCircle2, AlertCircle, Settings, Cpu, Activity, LayoutDashboard, Layers, Zap, FolderTree, Terminal, Gauge, Brain, LineChart, Filter, Shield, Calendar, Coins, Target, FolderOpen, Trash2, X } from 'lucide-react';

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

// تعريف بسيط لنوع الاستراتيجية من قاعدة البيانات إذا لم يكن موجوداً في types
interface StrategyFromDB {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  indicators_count?: number;
  entry_rules_count?: number;
}

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

  // --- NEW STATES FOR LOADING STRATEGIES ---
  const [showLibraryPanel, setShowLibraryPanel] = useState(false);
  const [savedStrategies, setSavedStrategies] = useState<StrategyFromDB[]>([]);

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
      risk_management: {},
    };

    setBacktestConfig({
      ...defaultStrategyConfig,
      strategy_config: defaultStrategyConfig,
      start_date: pastISO,
      end_date: todayISO
    });
  }, []);

  // --- NEW HANDLERS FOR LOADING STRATEGIES ---

  // Fetch list when library panel opens
  useEffect(() => {
    if (showLibraryPanel) {
      fetchSavedStrategies();
    }
  }, [showLibraryPanel]);

  const fetchSavedStrategies = async () => {
    try {
      const response = await fetch('/api/v1/strategies1/list?active_only=false');
      const data = await response.json();
      if (data.success) {
        setSavedStrategies(data.strategies);
      }
    } catch (error) {
      console.error('Error loading strategies list:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'فشل في جلب قائمة الاستراتيجيات'
      });
    }
  };

  const handleLoadStrategy = async (strategyName: string) => {
    try {
      const response = await fetch(`/api/v1/strategies1/get_from_db/${encodeURIComponent(strategyName)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch strategy');
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Unknown error');
      }
      const fullStrategy = data.strategy;
      const loadedConfig = fullStrategy.config;

      // Update the main backtest config with the loaded strategy
      setBacktestConfig((prev) => ({
        ...prev,
        name: loadedConfig.name,
        timeframe: loadedConfig.base_timeframe, // Sync backtest timeframe
        strategy_config: {
          ...loadedConfig,
          // Ensure all nested objects are updated correctly
          indicators: loadedConfig.indicators || [],
          entry_rules: loadedConfig.entry_rules || [],
          exit_rules: loadedConfig.exit_rules || [],
          filter_rules: loadedConfig.filter_rules || [],
          risk_management: {}
        }
      }));

      setShowLibraryPanel(false);
      toast({
        title: 'تم التحميل',
        description: `تم تحميل الاستراتيجية: ${strategyName}`
      });
    } catch (error) {
      console.error('Error loading strategy:', error);
      toast({
        variant: 'destructive',
        title: 'فشل التحميل',
        description: error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
      });
    }
  };

  const handleDeleteStrategy = async (strategyName: string) => {
    if (!confirm(`هل أنت متأكد من حذف "${strategyName}"؟`)) return;

    try {
      const response = await fetch(`/api/v1/strategies1/delete_from_db/${encodeURIComponent(strategyName)}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        toast({
          title: 'تم الحذف',
          description: `تم حذف الاستراتيجية: ${strategyName}`
        });
        fetchSavedStrategies(); // Refresh list
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting strategy:', error);
      toast({
        variant: 'destructive',
        title: 'فشل الحذف',
        description: 'حدث خطأ أثناء محاولة الحذف'
      });
    }
  };

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
        risk_management: {}
      },

      // إعدادات الباك-تست المالية - مع التحويلات الصحيحة
      initial_capital: backtestConfig.initial_capital!,
      position_sizing: backtestConfig.position_sizing!,
      position_size_percent: positionSizeDecimal, // محول إلى رقم عشري
      max_positions: backtestConfig.max_positions!,
      commission_rate: commissionRateDecimal, // محول إلى رقم عشري
      slippage_percent: slippagePercentDecimal, // محول إلى رقم عشري
      stop_loss_percent: backtestConfig.stop_loss_percent || 0,
      take_profit_percent: backtestConfig.take_profit_percent || 0,
      trailing_stop_percent: backtestConfig.trailing_stop_percent || 0,
      max_daily_loss_percent: backtestConfig.max_daily_loss_percent || 0,
      
      enable_margin: backtestConfig.enable_margin !== undefined ? backtestConfig.enable_margin : false,
      leverage: backtestConfig.leverage!,
      require_confirmation: backtestConfig.require_confirmation !== undefined ? backtestConfig.require_confirmation : false
    };

    // تحقق من صحة الـ JSON قبل الإرسال
    console.log('📤 Payload object created, validating JSON...');

    try {
      // محاولة تحويل الـ payload إلى JSON
      const payloadJson = JSON.stringify(payload, null, 2);

      // تحليل الـ JSON للتأكد من صحته
      JSON.parse(payloadJson);

      console.log('✅ JSON is valid');
      console.log('📋 Payload to send:', payloadJson);
      console.log('📊 Percentages converted:');
      console.log('- position_size_percent:', backtestConfig.position_size_percent, '->', positionSizeDecimal);
      console.log('- commission_rate:', backtestConfig.commission_rate, '->', commissionRateDecimal);
      console.log('- slippage_percent:', backtestConfig.slippage_percent, '->', slippagePercentDecimal);

      // إرسال الـ payload
      setIsRunning(true);

      try {
        const response = await fetch('/api/v1/backtest1/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payloadJson
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

    } catch (error) {
      console.error('❌ JSON validation error:', error);
      console.error('❌ Invalid payload structure:', payload);

      toast({
        variant: 'destructive',
        title: 'خطأ في بناء البيانات',
        description: 'هناك خطأ في بناء البيانات المرسلة. تحقق من console للمزيد من التفاصيل.'
      });
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
    <div className="flex h-screen flex-col min-h-0 bg-background text-foreground font-sans overflow-hidden">

      <header className="h-11 bg-card border-b border-border flex flex-wrap items-center justify-between px-3 z-50 shrink-0">
        {/* Center: Strategy Info */}
        <div className="flex items-center gap-3">
          <div className="text-xs bg-muted px-3 py-1 rounded border border-border">
            <span className="text-muted-foreground">Strategy:</span>
            <span className="ml-2 text-foreground font-medium">
              {backtestConfig.strategy_config?.name || 'Untitled'}
            </span>
          </div>
          <div className="text-xs bg-muted px-3 py-1 rounded border border-border">
            <span className="text-muted-foreground">TF:</span>
            <span className="ml-1 text-foreground font-medium">{backtestConfig.timeframe || '1h'}</span>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2">
          {/* NEW: Load Strategy Button */}
          <button
            onClick={() => setShowLibraryPanel(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded border border-border"
          >
            <FolderOpen className="h-3 w-3" />
            Load
          </button>

          {backtestResponse && (
            <>
              <button
                onClick={handleDownloadResults}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded border border-border"
              >
                <FileJson className="h-3 w-3" />
                Export
              </button>
              <button
                onClick={handleRefreshChart}
                disabled={isFetchingChart}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded border border-border"
              >
                <RefreshCw className={`h-3 w-3 ${isFetchingChart ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </>
          )}
          <button
            onClick={handleSaveStrategy}
            className="ml-2 px-4 py-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded"
          >
            Save
          </button>
        </div>
      </header>

      {/* --- MAIN LAYOUT --- */}
      <main className="flex-1 flex overflow-hidden">
        {/* --- CENTER: Chart Area (FULL WIDTH) --- */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          {/* Chart Header (TradingView Style) */}
          <div className="h-9 bg-card border-b border-border flex items-center px-3 shrink-0">
            {/* Timeframes */}
            <div className="flex items-center gap-1">
              {['1m', '5m', '15m', '1h', '4h', '1D', '1W'].map((tf) => (
                <button
                  key={tf}
                  className={`px-2 py-1 text-xs rounded ${backtestConfig.timeframe === tf ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
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
                  <div className="text-xs text-muted-foreground">
                    <span className="text-foreground">{chartData.metadata.symbol}</span>
                    <span className="mx-2">•</span>
                    <span>{chartData.chart_data.total_candles.toLocaleString()} bars</span>
                  </div>
                  <button
                    onClick={handleRefreshChart}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded"
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
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Loading chart...</span>
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
                  <BarChart3 className="h-12 w-12 text-border mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No chart data available</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Run a backtest to view results</p>
                </div>
              </div>
            )}
          </div>

          {/* --- BOTTOM TABS (NEW) --- */}
          <div className="h-10 bg-card border-t border-border flex items-center justify-center gap-4 px-4 shrink-0">
            {/* Builder Tabs */}
            <button
              onClick={() => setBuilderTab(builderTab === 'indicators' ? null : 'indicators')}
              className={`flex items-center gap-2 px-4 py-2 text-xs rounded-t-lg transition-all ${builderTab === 'indicators' ? 'bg-background text-foreground border-t border-x border-border' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <LineChart className="h-4 w-4" />
              Indicators
              <span className="text-xs px-1.5 py-0.5 bg-muted rounded">
                {backtestConfig.strategy_config?.indicators.filter(i => i.enabled).length || 0}
              </span>
            </button>

            <button
              onClick={() => setBuilderTab(builderTab === 'rules' ? null : 'rules')}
              className={`flex items-center gap-2 px-4 py-2 text-xs rounded-t-lg transition-all ${builderTab === 'rules' ? 'bg-background text-foreground border-t border-x border-border' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Filter className="h-4 w-4" />
              Rules
              <span className="text-xs px-1.5 py-0.5 bg-muted rounded">
                {(backtestConfig.strategy_config?.entry_rules.filter(r => r.enabled).length || 0) + (backtestConfig.strategy_config?.exit_rules.filter(r => r.enabled).length || 0)}
              </span>
            </button>

            <button
              onClick={() => setBuilderTab(builderTab === 'config' ? null : 'config')}
              className={`flex items-center gap-2 px-4 py-2 text-xs rounded-t-lg transition-all ${builderTab === 'config' ? 'bg-background text-foreground border-t border-x border-border' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Settings className="h-4 w-4" />
              Configuration
            </button>

            <div className="flex-1" />

            {/* Run Button */}
            <button
              onClick={handleRunBacktest}
              disabled={isRunning}
              className="px-4 py-2 text-xs bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium rounded flex items-center gap-2"
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

      {/* --- STRATEGY LIBRARY PANEL (NEW) --- */}
      {showLibraryPanel && (
        <div className="fixed right-0 top-11 bottom-0 w-80 sm:w-96 bg-card border-l border-border shadow-2xl z-40 flex flex-col animate-in slide-in-from-right duration-200 ease-out">
          <div className="h-12 flex items-center justify-between px-4 border-b border-border bg-card shrink-0">
            <span className="text-xs font-bold text-foreground uppercase tracking-widest">Strategy Library</span>
            <button
              onClick={() => setShowLibraryPanel(false)}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <ScrollArea className="flex-1 custom-scrollbar">
            <div className="p-3 space-y-2">
              {savedStrategies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <FolderOpen className="h-8 w-8 mb-2 opacity-50" />
                  <div className="text-xs font-mono uppercase">No strategies found</div>
                </div>
              ) : (
                savedStrategies.map((strategy) => (
                  <div
                    key={strategy.id}
                    className="group p-3 bg-background border border-border hover:border-primary rounded-sm transition-all cursor-pointer relative"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1 pr-2 min-w-0">
                        <div className="text-[11px] font-bold text-foreground truncate group-hover:text-primary transition-colors">
                          {strategy.name}
                        </div>
                        <div className="text-[9px] text-muted-foreground font-mono mt-0.5">
                          {new Date(strategy.created_at || Date.now()).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] text-muted-foreground line-clamp-2 mb-3 h-8 leading-tight">
                      {strategy.description || 'No description provided.'}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-[9px] bg-card px-1.5 py-0.5 rounded text-muted-foreground border border-border">
                          {strategy.indicators_count || 0} Ind
                        </span>
                        <span className="text-[9px] bg-card px-1.5 py-0.5 rounded text-muted-foreground border border-border">
                          {strategy.entry_rules_count || 0} Rules
                        </span>
                      </div>

                      <div className="flex gap-1">
                        <button
                          onClick={() => handleLoadStrategy(strategy.name)}
                          className="p-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-sm transition-colors"
                          title="Load Strategy"
                        >
                          <Download className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteStrategy(strategy.name)}
                          className="p-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-sm transition-colors"
                          title="Delete Strategy"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* 2. زر عائم لفتح اللوحة */}
      <div className="fixed right-4 bottom-16 z-50">
        <button
          onClick={() => setShowSidePanel(!showSidePanel)}
          className="p-3 bg-gradient-to-r from-primary to-primary/80 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center"
        >
          {showSidePanel ? (
            <>
              <ChevronRight className="h-5 w-5 text-primary-foreground" />
              <span className="ml-2 text-xs text-primary-foreground">Close</span>
            </>
          ) : (
            <>
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
              <span className="ml-2 text-xs text-primary-foreground">Results</span>
            </>
          )}
        </button>
      </div>

      {/* اللوحة المنزلقة للنتائج */}
      <div className={`fixed right-0 top-0 h-full bg-card border-l border-border shadow-2xl transition-all duration-300 z-20 ${showSidePanel ? 'translate-x-0 w-80' : 'translate-x-full w-0'}`}>

        {/* Results Tabs - متطابقة مع المحتوى القديم */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('builder')}
            className={`flex-1 py-2.5 text-sm font-medium ${activeTab === 'builder' ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <Brain className="h-4 w-4" />
              Builder
            </div>
          </button>
          <button
            onClick={() => setActiveTab('results')}
            disabled={!backtestResponse}
            className={`flex-1 py-2.5 text-sm font-medium ${activeTab === 'results' ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'} disabled:opacity-40`}
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
              <h3 className="text-sm font-medium text-foreground mb-4">Strategy Summary</h3>

              {/* Status Card */}
              <div className="mb-4 p-3 bg-background rounded border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Status</span>
                  {isRunning ? (
                    <div className="flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                      <span className="text-xs text-primary">Running</span>
                    </div>
                  ) : backtestResponse ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-success"></div>
                      <span className="text-xs text-success">Completed</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Ready</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="text-center p-2 bg-muted/50 rounded">
                    <div className="text-lg font-bold text-foreground">
                      {backtestConfig.strategy_config?.indicators.filter(i => i.enabled).length || 0}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Indicators</div>
                  </div>
                  <div className="text-center p-2 bg-muted/50 rounded">
                    <div className="text-lg font-bold text-foreground">
                      {(backtestConfig.strategy_config?.entry_rules.filter(r => r.enabled).length || 0) + (backtestConfig.strategy_config?.exit_rules.filter(r => r.enabled).length || 0)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Rules</div>
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs text-muted-foreground mb-2">Capital</h4>
                  <div className="text-sm text-foreground font-medium">
                    ${backtestConfig.initial_capital?.toLocaleString() || '10,000'}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs text-muted-foreground mb-2">Symbols</h4>
                  <div className="flex flex-wrap gap-1">
                    {backtestConfig.symbols?.map((sym, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-background text-muted-foreground rounded border border-border">
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
                  <h3 className="text-sm font-medium text-foreground mb-4">Performance</h3>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-background rounded border border-border">
                      <div className="text-xs text-muted-foreground">Net PnL</div>
                      <div className={`text-lg font-bold ${backtestResponse.summary.total_pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                        ${backtestResponse.summary.total_pnl.toFixed(2)}
                      </div>
                    </div>
                    <div className="p-3 bg-background rounded border border-border">
                      <div className="text-xs text-muted-foreground">Total Trades</div>
                      <div className="text-lg font-bold text-foreground">{backtestResponse.summary.total_trades}</div>
                    </div>
                  </div>

                  {/* More Stats */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Win Rate</span>
                      <span className="text-sm font-medium text-foreground">{backtestResponse.summary.win_rate}%</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Profit Factor</span>
                      <span className="text-sm font-medium text-foreground">{backtestResponse.summary.profit_factor.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Max Drawdown</span>
                      <span className="text-sm font-medium text-destructive">{backtestResponse.summary.max_drawdown_percent}%</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Sharpe Ratio</span>
                      <span className="text-sm font-medium text-foreground">{backtestResponse.summary.sharpe_ratio.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Trade List */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-foreground mb-3">Recent Trades</h4>
                    <div className="space-y-2">
                      {backtestResponse.trades?.slice(0, 5).map((trade: Trade, idx: number) => (
                        <div key={idx} className="p-2 bg-background rounded border border-border">
                          <div className="flex justify-between items-center">
                            <div>
                              <span
                                className={`text-xs font-medium ${(trade.type ?? (trade.position_type === 'long' ? 'buy' : 'sell')) === 'buy'
                                  ? 'text-success'
                                  : 'text-destructive'
                                  }`}
                              >
                                {(trade.type ?? (trade.position_type === 'long' ? 'buy' : 'sell')).toUpperCase()}
                              </span>
                              <span className="text-xs text-muted-foreground ml-2">{trade.symbol}</span>
                            </div>
                            <span
                              className={`text-xs font-bold ${(trade.pnl ?? 0) >= 0 ? 'text-success' : 'text-destructive'
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
                  <BarChart3 className="h-12 w-12 text-border mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No results available</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Run a backtest to see performance metrics</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Status Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border bg-card">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-primary animate-pulse' : backtestResponse ? 'bg-success' : 'bg-muted-foreground'}`}></div>
              <span className="text-muted-foreground">
                {isRunning ? 'Processing...' : backtestResponse ? 'Ready' : 'Idle'}
              </span>
            </div>
            <span className="text-muted-foreground/50">v2.4.0</span>
          </div>
        </div>
      </div>

      {/* عناصر التحكم العائمة في الزوايا */}

      {/* --- BOTTOM POPUP PANELS --- */}

      {/* Indicators Panel */}
      {builderTab === 'indicators' && (
        <div className="fixed bottom-10 left-0 right-0 z-30 animate-in slide-in-from-bottom duration-300">
          <div className="mx-auto max-w-6xl">
            <div className="bg-card rounded-t-xl border border-b-0 border-border shadow-2xl">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <LineChart className="h-5 w-5 text-primary" />
                  <h3 className="text-sm font-medium text-foreground">Technical Indicators</h3>
                  <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded">
                    {backtestConfig.strategy_config?.indicators.filter(i => i.enabled).length || 0} active
                  </span>
                </div>
                <button
                  onClick={() => setBuilderTab(null)}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded"
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
        <div className="fixed bottom-10 left-0 right-0 z-30 animate-in slide-in-from-bottom duration-300">
          <div className="mx-auto max-w-6xl">
            <div className="bg-card rounded-t-xl border border-b-0 border-border shadow-2xl">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Filter className="h-5 w-5 text-primary" />
                  <h3 className="text-sm font-medium text-foreground">Execution Rules</h3>
                  <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded">
                    {(backtestConfig.strategy_config?.entry_rules.filter(r => r.enabled).length || 0) + (backtestConfig.strategy_config?.exit_rules.filter(r => r.enabled).length || 0)} active
                  </span>
                </div>
                <button
                  onClick={() => setBuilderTab(null)}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded"
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
        <div className="fixed bottom-10 left-0 right-0 z-30 animate-in slide-in-from-bottom duration-300">
          <div className="mx-auto max-w-6xl">
            <div className="bg-card rounded-t-xl border border-b-0 border-border shadow-2xl">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-primary" />
                  <h3 className="text-sm font-medium text-foreground">Backtest Configuration</h3>
                </div>
                <button
                  onClick={() => setBuilderTab(null)}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded"
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
          className="fixed inset-0 bg-black/30 z-20"
          onClick={() => setBuilderTab(null)}
        />
      )}
    </div>
  );
}



