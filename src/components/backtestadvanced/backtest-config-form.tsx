

// @ts-nocheck

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/uiadv/button';
import { Input } from '@/components/uiadv/input';
import { Label } from '@/components/uiadv/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/uiadv/select';
import { Checkbox } from '@/components/uiadv/checkbox';
import { Textarea } from '@/components/uiadv/textarea';
import { Slider } from '@/components/uiadv/slider';
import { Badge } from '@/components/uiadv/badge';
import { ScrollArea } from '@/components/uiadv/scroll-area';
import {
  X, Plus, Play, Settings, Coins, Calendar, TrendingUp,
  DollarSign, AlertTriangle, Info, Cpu, Layers
} from 'lucide-react';
import { BacktestConfig, StrategyConfig, PositionSide, RiskManagement } from '@/types/backtest';

interface BacktestConfigFormProps {
  config: Partial<BacktestConfig>;
  onConfigChange: (config: Partial<BacktestConfig>) => void;
  onRunBacktest: () => void;
  isRunning?: boolean;
}

const COMMON_SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'XRPUSDT',
  'SOLUSDT', 'DOGEUSDT', 'DOTUSDT', 'MATICUSDT', 'AVAXUSDT'
];

const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'];

export function BacktestConfigForm({ config, onConfigChange, onRunBacktest, isRunning = false }: BacktestConfigFormProps) {
  const [symbols, setSymbols] = useState<string[]>(config.symbols || []);
  const [newSymbol, setNewSymbol] = useState('');

  // تحديث إعدادات الباك-تست فقط (بدون إعدادات إستراتيجية)
  const updateBacktestConfig = <K extends keyof BacktestConfig>(key: K, value: BacktestConfig[K] | undefined) => {
    const updatedConfig = { ...config, [key]: value };

    // إذا كان المفتاح هو timeframe، تأكد من تحديث base_timeframe في الإستراتيجية أيضاً
    if (key === 'timeframe' && config.strategy_config) {
      updatedConfig.strategy_config = {
        ...config.strategy_config,
        base_timeframe: value as string
      };
    }

    onConfigChange(updatedConfig);
  };

  // تحديث إعدادات الإستراتيجية فقط (داخل strategy_config)
  const updateStrategyConfig = <K extends keyof StrategyConfig>(key: K, value: StrategyConfig[K] | undefined) => {
    if (!config.strategy_config) {
      // إذا لم يكن هناك إستراتيجية، أنشئ واحدة فارغة
      const defaultStrategyConfig: Partial<StrategyConfig> = {
        name: undefined,
        version: undefined,
        description: '',
        base_timeframe: config.timeframe || undefined,
        position_side: undefined,
        indicators: [],
        entry_rules: [],
        exit_rules: [],
        filter_rules: [],
        risk_management: undefined
      };

      onConfigChange({
        ...config,
        strategy_config: {
          ...defaultStrategyConfig,
          [key]: value
        } as any
      });
    } else {
      onConfigChange({
        ...config,
        strategy_config: {
          ...config.strategy_config,
          [key]: value
        }
      });
    }
  };

  // تحديث إدارة المخاطر داخل الإستراتيجية
  const updateRiskManagement = <K extends keyof RiskManagement>(key: K, value: RiskManagement[K] | undefined) => {
    if (!config.strategy_config) {
      const defaultStrategyConfig: Partial<StrategyConfig> = {
        name: undefined,
        version: undefined,
        description: '',
        base_timeframe: config.timeframe || undefined,
        position_side: undefined,
        indicators: [],
        entry_rules: [],
        exit_rules: [],
        filter_rules: [],
        risk_management: {
          [key]: value
        } as any
      };

      onConfigChange({
        ...config,
        strategy_config: defaultStrategyConfig
      });
    } else {
      const currentRiskManagement = config.strategy_config.risk_management || {};
      onConfigChange({
        ...config,
        strategy_config: {
          ...config.strategy_config,
          risk_management: {
            ...currentRiskManagement,
            [key]: value
          }
        }
      });
    }
  };

  const addSymbol = (symbol: string) => {
    if (symbol && !symbols.includes(symbol)) {
      const newSymbols = [...symbols, symbol.toUpperCase()];
      setSymbols(newSymbols);
      updateBacktestConfig('symbols', newSymbols);
    }
    setNewSymbol('');
  };

  const removeSymbol = (symbol: string) => {
    const newSymbols = symbols.filter(s => s !== symbol);
    setSymbols(newSymbols);
    updateBacktestConfig('symbols', newSymbols);
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getPastDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  };

  // معالجة تغيير timeframe لضمان تطابقها مع base_timeframe
  const handleTimeframeChange = (timeframe: string) => {
    updateBacktestConfig('timeframe', timeframe || undefined);
  };

  return (
    <div className="flex flex-col h-full bg-background border-r border-border">

      {/* --- HEADER STRIP --- */}
      <div className="h-11 flex items-center justify-between px-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold text-foreground uppercase tracking-widest">Backtest Config</span>
        </div>
        {isRunning && (
          <div className="flex items-center gap-2 px-2 py-1 bg-primary/20 rounded border border-primary/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-[10px] font-bold text-primary uppercase">Running</span>
          </div>
        )}
      </div>

      {/* --- SCROLLABLE CONTENT --- */}
      <ScrollArea className="flex-1 custom-scrollbar p-4 space-y-6">

        {/* 1. BASIC CONFIGURATION */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Info className="h-3.5 w-3.5 text-muted-foreground" />
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">General</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Name */}
            <div className="col-span-2 space-y-1.5">
              <Label className="text-[9px] font-bold text-muted-foreground uppercase">Backtest Name *</Label>
              <Input
                value={config.name || ''}
                onChange={(e) => updateBacktestConfig('name', e.target.value || undefined)}
                placeholder="أدخل اسم الباك-تست"
                className="h-8 bg-muted border-border text-xs text-foreground focus:border-primary px-2"
                required
              />
            </div>

            {/* Mode & Market */}
            <div className="space-y-1.5">
              <Label className="text-[9px] font-bold text-muted-foreground uppercase">Mode *</Label>
              <Select
                value={config.mode || ''}
                onValueChange={(v) => updateBacktestConfig('mode', v as 'standard' | 'paper' | 'live')}
                required
              >
                <SelectTrigger className="h-8 bg-muted border-border text-xs text-foreground focus:border-primary">
                  <SelectValue placeholder="اختر الوضع" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-xs">
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="paper">Paper</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[9px] font-bold text-muted-foreground uppercase">Market *</Label>
              <Select
                value={config.market || ''}
                onValueChange={(v) => updateBacktestConfig('market', v as 'crypto' | 'forex' | 'stocks')}
                required
              >
                <SelectTrigger className="h-8 bg-muted border-border text-xs text-foreground focus:border-primary">
                  <SelectValue placeholder="اختر السوق" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-xs">
                  <SelectItem value="crypto">Crypto</SelectItem>
                  <SelectItem value="forex">Forex</SelectItem>
                  <SelectItem value="stocks">Stocks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dates */}
            <div className="space-y-1.5">
              <Label className="text-[9px] font-bold text-muted-foreground uppercase">Start Date *</Label>
              <Input
                type="date"
                value={config.start_date?.split('T')[0] || getPastDate(30)}
                onChange={(e) => updateBacktestConfig('start_date', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                className="h-8 bg-muted border-border text-xs text-foreground focus:border-primary px-2"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[9px] font-bold text-muted-foreground uppercase">End Date *</Label>
              <Input
                type="date"
                value={config.end_date?.split('T')[0] || getTodayDate()}
                onChange={(e) => updateBacktestConfig('end_date', e.target.value ? new Date(e.target.value + 'T23:59:59').toISOString() : undefined)}
                className="h-8 bg-muted border-border text-xs text-foreground focus:border-primary px-2"
                required
              />
            </div>

            {/* Timeframe */}
            <div className="space-y-1.5 col-span-2">
              <Label className="text-[9px] font-bold text-muted-foreground uppercase">Timeframe *</Label>
              <Select
                value={config.timeframe || ''}
                onValueChange={handleTimeframeChange}
                required
              >
                <SelectTrigger className="h-8 bg-muted border-border text-xs text-foreground focus:border-primary">
                  <SelectValue placeholder="اختر الإطار الزمني" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-xs">
                  {TIMEFRAMES.map(tf => (
                    <SelectItem key={tf} value={tf}>{tf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-[9px] font-bold text-muted-foreground uppercase">Description</Label>
            <Textarea
              value={config.description || ''}
              onChange={(e) => updateBacktestConfig('description', e.target.value || undefined)}
              placeholder="وصف الباك-تست..."
              rows={2}
              className="bg-muted border-border text-xs text-foreground focus:border-primary px-2 resize-none"
            />
          </div>

          {/* Symbols */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label className="text-[9px] font-bold text-muted-foreground uppercase">Symbols *</Label>
              <Badge variant="outline" className="text-[9px] border-border text-muted-foreground bg-muted h-4 px-1">
                {symbols.length}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Select value={newSymbol} onValueChange={setNewSymbol}>
                <SelectTrigger className="h-8 bg-muted border-border text-xs text-foreground flex-1">
                  <SelectValue placeholder="أضف رمز تداول" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-xs">
                  {COMMON_SYMBOLS.map(symbol => (
                    <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => addSymbol(newSymbol)} disabled={!newSymbol} size="icon" className="h-8 w-8 bg-card hover:bg-muted text-muted-foreground">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 p-2 bg-muted border border-border rounded-sm">
              {symbols.map(symbol => (
                <Badge key={symbol} variant="secondary" className="bg-card border-border text-foreground text-[10px] h-6 px-2 pr-1 hover:border-destructive/50 hover:text-destructive transition-colors flex items-center gap-1.5">
                  <span className="font-mono">{symbol}</span>
                  <button onClick={() => removeSymbol(symbol)} className="p-0.5 hover:bg-destructive/20 rounded">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* 2. CAPITAL & SIZING */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 pb-2">
            <Coins className="h-3.5 w-3.5 text-muted-foreground" />
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Capital & Sizing *</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[9px] font-bold text-muted-foreground uppercase">Initial Capital *</Label>
              <Input
                type="number"
                step={100}
                min={100}
                value={config.initial_capital ?? ''}
                onChange={(e) => updateBacktestConfig('initial_capital', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="مثال: 10000"
                className="h-8 bg-muted border-border text-xs text-foreground font-mono focus:border-primary px-2"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] font-bold text-muted-foreground uppercase">Sizing Method *</Label>
              <Select
                value={config.position_sizing || ''}
                onValueChange={(v) => updateBacktestConfig('position_sizing', v as 'fixed' | 'percentage' | 'kelly')}
                required
              >
                <SelectTrigger className="h-8 bg-muted border-border text-xs text-foreground focus:border-primary">
                  <SelectValue placeholder="اختر الطريقة" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-xs">
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="kelly">Kelly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 col-span-2">
              <div className="flex justify-between">
                <Label className="text-[9px] font-bold text-muted-foreground uppercase">Position Size % *</Label>
                <span className="text-[10px] font-mono text-primary">{config.position_size_percent || 0}%</span>
              </div>
              <Slider
                value={[config.position_size_percent || 0]}
                onValueChange={([v]) => updateBacktestConfig('position_size_percent', v)}
                min={0}
                max={100}
                step={1}
                className="h-2"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] font-bold text-muted-foreground uppercase">Max Positions *</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={config.max_positions ?? ''}
                onChange={(e) => updateBacktestConfig('max_positions', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="مثال: 3"
                className="h-8 bg-muted border-border text-xs text-foreground font-mono focus:border-primary px-2"
                required
              />
            </div>
          </div>
        </div>

        {/* 3. TRADING SETTINGS */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 pb-2">
            <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Execution *</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[9px] font-bold text-muted-foreground uppercase">Commission % *</Label>
              <div className="relative">
                <Input
                  type="number"
                  step={0.001}
                  min={0}
                  value={config.commission_rate !== undefined ? config.commission_rate * 100 : ''}
                  onChange={(e) => updateBacktestConfig('commission_rate', e.target.value ? parseFloat(e.target.value) / 100 : undefined)}
                  placeholder="مثال: 0.1"
                  className="h-8 bg-muted border-border text-xs text-foreground font-mono focus:border-primary px-2 pr-6"
                  required
                />
                <span className="absolute right-2 top-2 text-[10px] text-muted-foreground pointer-events-none">%</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] font-bold text-muted-foreground uppercase">Slippage % *</Label>
              <div className="relative">
                <Input
                  type="number"
                  step={0.001}
                  min={0}
                  value={config.slippage_percent !== undefined ? config.slippage_percent * 100 : ''}
                  onChange={(e) => updateBacktestConfig('slippage_percent', e.target.value ? parseFloat(e.target.value) / 100 : undefined)}
                  placeholder="مثال: 0.1"
                  className="h-8 bg-muted border-border text-xs text-foreground font-mono focus:border-primary px-2 pr-6"
                  required
                />
                <span className="absolute right-2 top-2 text-[10px] text-muted-foreground pointer-events-none">%</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] font-bold text-muted-foreground uppercase">Stop Loss %</Label>
              <div className="relative">
                <Input
                  type="number"
                  step={0.1}
                  min={0}
                  value={config.stop_loss_percent ?? ''}
                  onChange={(e) => updateBacktestConfig('stop_loss_percent', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="مثال: 5"
                  className="h-8 bg-muted border-border text-xs text-foreground font-mono focus:border-primary px-2 pr-6"
                />
                <span className="absolute right-2 top-2 text-[10px] text-muted-foreground pointer-events-none">%</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] font-bold text-muted-foreground uppercase">Take Profit %</Label>
              <div className="relative">
                <Input
                  type="number"
                  step={0.1}
                  min={0}
                  value={config.take_profit_percent ?? ''}
                  onChange={(e) => updateBacktestConfig('take_profit_percent', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="مثال: 3"
                  className="h-8 bg-muted border-border text-xs text-foreground font-mono focus:border-primary px-2 pr-6"
                />
                <span className="absolute right-2 top-2 text-[10px] text-muted-foreground pointer-events-none">%</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] font-bold text-muted-foreground uppercase">Trailing Stop %</Label>
              <div className="relative">
                <Input
                  type="number"
                  step={0.1}
                  min={0}
                  value={config.trailing_stop_percent ?? ''}
                  onChange={(e) => updateBacktestConfig('trailing_stop_percent', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="مثال: 2"
                  className="h-8 bg-muted border-border text-xs text-foreground font-mono focus:border-primary px-2 pr-6"
                />
                <span className="absolute right-2 top-2 text-[10px] text-muted-foreground pointer-events-none">%</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] font-bold text-muted-foreground uppercase">Leverage *</Label>
              <Input
                type="number"
                min={1}
                value={config.leverage ?? ''}
                onChange={(e) => updateBacktestConfig('leverage', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="مثال: 1"
                className="h-8 bg-muted border-border text-xs text-foreground font-mono focus:border-primary px-2"
                required
              />
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center gap-2 p-2 bg-card border border-border rounded-sm">
              <Checkbox
                id="short"
                checked={config.enable_short_selling || false}
                onCheckedChange={(c) => updateBacktestConfig('enable_short_selling', !!c)}
                className="border-border"
              />
              <Label htmlFor="short" className="text-[10px] text-foreground cursor-pointer">Short</Label>
            </div>
            <div className="flex items-center gap-2 p-2 bg-card border border-border rounded-sm">
              <Checkbox
                id="margin"
                checked={config.enable_margin || false}
                onCheckedChange={(c) => updateBacktestConfig('enable_margin', !!c)}
                className="border-border"
              />
              <Label htmlFor="margin" className="text-[10px] text-foreground cursor-pointer">Margin</Label>
            </div>
            <div className="flex items-center gap-2 p-2 bg-card border border-border rounded-sm">
              <Checkbox
                id="conf"
                checked={config.require_confirmation || false}
                onCheckedChange={(c) => updateBacktestConfig('require_confirmation', !!c)}
                className="border-border"
              />
              <Label htmlFor="conf" className="text-[10px] text-foreground cursor-pointer">Confirm</Label>
            </div>
          </div>
        </div>

        {/* 4. STRATEGY RISK (هذه داخل strategy_config) */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 pb-2">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Strategy Risk *</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[9px] font-bold text-muted-foreground uppercase">Stop Loss % *</Label>
              <div className="relative">
                <Input
                  type="number"
                  step={0.1}
                  min={0}
                  value={config.strategy_config?.risk_management?.stop_loss_percentage ?? ''}
                  onChange={(e) => updateRiskManagement('stop_loss_percentage', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="مثال: 2"
                  className="h-8 bg-muted border-border text-xs text-foreground font-mono focus:border-primary px-2 pr-6"
                  required
                />
                <span className="absolute right-2 top-2 text-[10px] text-muted-foreground pointer-events-none">%</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] font-bold text-muted-foreground uppercase">Take Profit % *</Label>
              <div className="relative">
                <Input
                  type="number"
                  step={0.1}
                  min={0}
                  value={config.strategy_config?.risk_management?.take_profit_percentage ?? ''}
                  onChange={(e) => updateRiskManagement('take_profit_percentage', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="مثال: 4"
                  className="h-8 bg-muted border-border text-xs text-foreground font-mono focus:border-primary px-2 pr-6"
                  required
                />
                <span className="absolute right-2 top-2 text-[10px] text-muted-foreground pointer-events-none">%</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] font-bold text-muted-foreground uppercase">Max Position Size % *</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[config.strategy_config?.risk_management?.max_position_size ? config.strategy_config.risk_management.max_position_size * 100 : 0]}
                  onValueChange={([v]) => updateRiskManagement('max_position_size', v / 100)}
                  min={0}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="text-[10px] font-mono w-8 text-right text-foreground">
                  {((config.strategy_config?.risk_management?.max_position_size || 0) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] font-bold text-muted-foreground uppercase">Max Daily Loss % *</Label>
              <div className="relative">
                <Input
                  type="number"
                  step={0.1}
                  min={0}
                  value={config.strategy_config?.risk_management?.max_daily_loss ?? ''}
                  onChange={(e) => updateRiskManagement('max_daily_loss', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="مثال: 5"
                  className="h-8 bg-muted border-border text-xs text-foreground font-mono focus:border-primary px-2 pr-6"
                  required
                />
                <span className="absolute right-2 top-2 text-[10px] text-muted-foreground pointer-events-none">%</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] font-bold text-muted-foreground uppercase">Max Concurrent *</Label>
              <Input
                type="number"
                min={1}
                value={config.strategy_config?.risk_management?.max_concurrent_positions ?? ''}
                onChange={(e) => updateRiskManagement('max_concurrent_positions', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="مثال: 3"
                className="h-8 bg-muted border-border text-xs text-foreground font-mono focus:border-primary px-2"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] font-bold text-muted-foreground uppercase">Position Side *</Label>
              <Select
                value={config.strategy_config?.position_side || ''}
                onValueChange={(v) => updateStrategyConfig('position_side', v as PositionSide)}
                required
              >
                <SelectTrigger className="h-8 bg-muted border-border text-xs text-foreground focus:border-primary">
                  <SelectValue placeholder="اختر اتجاه المركز" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-xs">
                  <SelectItem value="long">Long Only</SelectItem>
                  <SelectItem value="short">Short Only</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

      </ScrollArea>

      {/* --- FOOTER --- */}
      <div className="p-4 border-t border-border bg-card shrink-0">
        {/* التحقق من الحقول المطلوبة */}
        {(!config.name || !config.symbols || config.symbols.length === 0 ||
          !config.start_date || !config.end_date || !config.timeframe ||
          !config.market || !config.initial_capital || !config.position_sizing ||
          !config.position_size_percent || config.position_size_percent <= 0 ||
          !config.max_positions || !config.commission_rate || !config.slippage_percent || !config.leverage ||
          !config.strategy_config?.risk_management?.stop_loss_percentage ||
          !config.strategy_config?.risk_management?.take_profit_percentage ||
          !config.strategy_config?.risk_management?.max_position_size ||
          !config.strategy_config?.risk_management?.max_daily_loss ||
          !config.strategy_config?.risk_management?.max_concurrent_positions ||
          !config.strategy_config?.position_side) ? (
          <div className="flex items-center gap-2 p-2 rounded bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-[10px] text-destructive">Missing required fields (*)</span>
          </div>
        ) : (
          <Button
            onClick={onRunBacktest}
            disabled={isRunning}
            className="w-full h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-lg shadow-primary/20 border border-primary/50 uppercase tracking-wider"
          >
            {isRunning ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Running
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Play className="h-3 w-3 fill-current" />
                Run Backtest
              </span>
            )}
          </Button>
        )}
      </div>

    </div>
  );
}