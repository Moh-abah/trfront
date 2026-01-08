


'use client';

import React from 'react';
import { Badge } from '@/components/uiadv/badge';
import { Progress } from '@/components/uiadv/progress';
import { ScrollArea } from '@/components/uiadv/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/uiadv/tabs';
import { BarChart3, Target, Shield, Activity, Cpu, CheckCircle, XCircle } from 'lucide-react';
import { BacktestResponse } from '@/types/backtest';

interface ResultsDashboardProps {
  backtestResponse: BacktestResponse | null;
  trades?: any[];
  executionTime?: number;
}

export function ResultsDashboard({ backtestResponse, trades, executionTime }: ResultsDashboardProps) {
  if (!backtestResponse) {
    return (
      <div className="h-full flex flex-col bg-[#131722] border-l border-[#2A2E39]">
        <div className="h-11 flex items-center justify-between px-4 border-b border-[#2A2E39] bg-[#1E222D] shrink-0">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Analysis</span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center text-slate-600">
          <div className="text-center">
            <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-xs font-mono text-slate-500">NO DATA TO DISPLAY</p>
          </div>
        </div>
      </div>
    );
  }

  const { summary, advanced_metrics } = backtestResponse;

  // --- ALL LOGIC PRESERVED ---
  const formatNumber = (num: number, decimals: number = 2): string => {
    return num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num);
  };

  const formatPercentage = (num: number): string => {
    return `${num >= 0 ? '+' : ''}${formatNumber(num)}%`;
  };

  const getMetricColor = (value: number, isPositiveGood: boolean = true): string => {
    const isGood = isPositiveGood ? value > 0 : value < 0;
    if (isGood) return 'text-emerald-400';
    if (value === 0) return 'text-slate-400';
    return 'text-rose-400';
  };
  // -------------------------

  // Helper Component for clean rows
  const MetricRow = ({ label, value, subValue, colorClass = 'text-slate-300' }: { label: string; value: string | number; subValue?: string; colorClass?: string }) => (
    <div className="flex items-center justify-between py-3 border-b border-[#2A2E39] last:border-0">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
      <div className="text-right">
        <span className={`block font-mono text-sm font-semibold ${colorClass}`}>{value}</span>
        {subValue && <span className="text-[9px] text-slate-600 font-mono block">{subValue}</span>}
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-[#131722] border-l border-[#2A2E39]">

      {/* --- HEADER STRIP --- */}
      <div className="h-11 flex items-center justify-between px-4 border-b border-[#2A2E39] bg-[#1E222D] shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <Activity className="h-4 w-4 text-emerald-500 shrink-0" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest truncate">
            {summary.name || 'Strategy Results'}
          </span>
          {summary.architecture_mode && (
            <Badge variant="outline" className="h-5 px-1.5 text-[9px] font-mono border-[#2A2E39] text-slate-500 bg-[#0B0E11] shrink-0">
              {summary.architecture_mode}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[9px] font-mono text-slate-500 uppercase">Runtime</span>
          <span className="text-[10px] font-mono text-slate-300 bg-[#0B0E11] px-1.5 py-0.5 rounded border border-[#2A2E39]">
            {executionTime ? executionTime.toFixed(2) : summary.execution_time_seconds.toFixed(2)}s
          </span>
        </div>
      </div>

      {/* --- NAVIGATION TABS (Pill Style) --- */}
      <div className="flex items-center bg-[#131722] p-1 border-b border-[#2A2E39] shrink-0">
        <Tabs defaultValue="overview" className="w-full flex flex-col h-full">
          <TabsList className="grid w-full grid-cols-4 h-8 bg-[#0B0E11] p-1 rounded-sm border border-[#2A2E39]">
            <TabsTrigger value="overview" className="text-[10px] font-bold uppercase tracking-wide rounded-sm h-full data-[state=active]:bg-[#1E222D] data-[state=active]:text-slate-200 data-[state=active]:shadow-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="performance" className="text-[10px] font-bold uppercase tracking-wide rounded-sm h-full data-[state=active]:bg-[#1E222D] data-[state=active]:text-slate-200 data-[state=active]:shadow-sm">
              Ratios
            </TabsTrigger>
            <TabsTrigger value="risk" className="text-[10px] font-bold uppercase tracking-wide rounded-sm h-full data-[state=active]:bg-[#1E222D] data-[state=active]:text-slate-200 data-[state=active]:shadow-sm">
              Risk
            </TabsTrigger>
            <TabsTrigger value="advanced" className="text-[10px] font-bold uppercase tracking-wide rounded-sm h-full data-[state=active]:bg-[#1E222D] data-[state=active]:text-slate-200 data-[state=active]:shadow-sm">
              Advanced
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-1 custom-scrollbar bg-[#131722]">

            {/* --- TAB: OVERVIEW --- */}
            <TabsContent value="overview" className="p-4 space-y-4 mt-0 focus:outline-none">
              {/* Hero: Total PnL */}
              <div className="bg-[#1E222D] p-4 rounded-sm border border-[#2A2E39] flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Net Profit / Loss</p>
                  <div className={`text-2xl font-mono font-bold tracking-tight ${getMetricColor(summary.total_pnl)}`}>
                    {formatCurrency(summary.total_pnl)}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-mono font-bold ${getMetricColor(summary.total_pnl_percent)}`}>
                    {formatPercentage(summary.total_pnl_percent)}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">ROI</p>
                </div>
              </div>

              {/* Key Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#1E222D] p-3 rounded-sm border border-[#2A2E39]">
                  <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Final Capital</p>
                  <p className="text-sm font-mono text-slate-200">{formatCurrency(summary.final_capital)}</p>
                </div>
                <div className="bg-[#1E222D] p-3 rounded-sm border border-[#2A2E39]">
                  <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Total Trades</p>
                  <p className="text-sm font-mono text-slate-200">{summary.total_trades}</p>
                </div>
                <div className="bg-[#1E222D] p-3 rounded-sm border border-[#2A2E39]">
                  <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Win Rate</p>
                  <p className={`text-sm font-mono font-bold ${getMetricColor(summary.win_rate)}`}>{formatNumber(summary.win_rate)}%</p>
                  <div className="w-full h-1 bg-[#0B0E11] mt-2 rounded-full overflow-hidden">
                    <div className={`h-full ${summary.win_rate >= 50 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${summary.win_rate}%` }}></div>
                  </div>
                </div>
                <div className="bg-[#1E222D] p-3 rounded-sm border border-[#2A2E39]">
                  <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Profit Factor</p>
                  <p className={`text-sm font-mono font-bold ${getMetricColor(summary.profit_factor)}`}>{formatNumber(summary.profit_factor)}</p>
                </div>
              </div>

              {/* Stats List */}
              <div className="space-y-0 border border-[#2A2E39] rounded-sm overflow-hidden bg-[#1E222D]">
                <MetricRow label="Expectancy" value={formatCurrency(summary.expectancy)} colorClass={getMetricColor(summary.expectancy)} />
                <MetricRow label="Avg Win" value={formatCurrency(summary.avg_winning_trade ?? 0)} colorClass="text-emerald-400" />
                <MetricRow label="Avg Loss" value={formatCurrency(summary.avg_losing_trade ?? 0)} colorClass="text-rose-400" />
                <MetricRow label="Largest Win" value={formatCurrency(summary.largest_winning_trade ?? 0)} colorClass="text-emerald-400" />
                <MetricRow label="Largest Loss" value={formatCurrency(summary.largest_losing_trade ?? 0)} colorClass="text-rose-400" />
                {/* Restored: Avg Trade Duration */}
                <MetricRow label="Avg Duration" value={`${formatNumber(summary.avg_trade_duration_hours ?? 0)} hrs`} />
              </div>
            </TabsContent>

            {/* --- TAB: RATIOS --- */}
            <TabsContent value="performance" className="p-4 space-y-4 mt-0 focus:outline-none">
              <div className="space-y-0 border border-[#2A2E39] rounded-sm overflow-hidden bg-[#1E222D]">
                <MetricRow label="Sharpe Ratio" value={formatNumber(summary.sharpe_ratio)} colorClass={getMetricColor(summary.sharpe_ratio)} />
                <MetricRow label="Sortino Ratio" value={formatNumber(summary.sortino_ratio)} colorClass={getMetricColor(summary.sortino_ratio)} />
                <MetricRow label="Calmar Ratio" value={formatNumber(summary.calmar_ratio)} colorClass={getMetricColor(summary.calmar_ratio)} />
                {/* Restored: Recovery Factor */}
                <MetricRow label="Recovery Factor" value={formatNumber(summary.recovery_factor || 0)} colorClass={getMetricColor(summary.recovery_factor ?? 0)} />
                <MetricRow label="Annual Return" value={formatPercentage(summary.annual_return_percent)} colorClass={getMetricColor(summary.annual_return_percent)} />
              </div>
            </TabsContent>

            {/* --- TAB: RISK --- */}
            <TabsContent value="risk" className="p-4 space-y-4 mt-0 focus:outline-none">
              <div className="bg-[#1E222D] p-4 rounded-sm border border-[#2A2E39] mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-rose-400" />
                  <span className="text-xs font-bold text-slate-300 uppercase">Max Drawdown</span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className={`text-2xl font-mono font-bold ${getMetricColor(-summary.max_drawdown_percent, false)}`}>
                    {formatPercentage(-summary.max_drawdown_percent)}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">{summary.max_drawdown_duration_days ?? 0} days</span>
                </div>
              </div>

              <div className="space-y-0 border border-[#2A2E39] rounded-sm overflow-hidden bg-[#1E222D]">
                <MetricRow label="Volatility (Ann.)" value={`${formatNumber(advanced_metrics.volatility_annual)}%`} />
                <MetricRow label="VaR (95%)" value={`${formatNumber(advanced_metrics.var_95)}%`} colorClass="text-rose-400" />
                <MetricRow label="CVaR (95%)" value={`${formatNumber(advanced_metrics.cvar_95)}%`} colorClass="text-rose-400" />
                <MetricRow label="Ulcer Index" value={formatNumber(summary.ulcer_index ?? 0)} />
              </div>
            </TabsContent>

            {/* --- TAB: ADVANCED --- */}
            <TabsContent value="advanced" className="p-4 space-y-4 mt-0 focus:outline-none">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#1E222D] p-3 rounded-sm border border-[#2A2E39]">
                  <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">SQN</p>
                  <p className={`text-lg font-mono font-bold ${getMetricColor(advanced_metrics.system_quality_number)}`}>
                    {formatNumber(advanced_metrics.system_quality_number)}
                  </p>
                </div>
                <div className="bg-[#1E222D] p-3 rounded-sm border border-[#2A2E39]">
                  <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Kelly Criterion</p>
                  <p className="text-lg font-mono font-bold text-slate-200">
                    {advanced_metrics.kelly_criterion ? `${formatNumber(advanced_metrics.kelly_criterion * 100)}%` : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1 bg-[#1E222D] p-3 rounded-sm border border-[#2A2E39] flex items-center justify-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase font-bold">Winners</p>
                    <p className="text-sm font-mono font-bold text-emerald-400">{summary.winning_trades}</p>
                  </div>
                </div>
                <div className="flex-1 bg-[#1E222D] p-3 rounded-sm border border-[#2A2E39] flex items-center justify-center gap-3">
                  <XCircle className="h-5 w-5 text-rose-500" />
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase font-bold">Losers</p>
                    <p className="text-sm font-mono font-bold text-rose-400">{summary.losing_trades}</p>
                  </div>
                </div>
              </div>
            </TabsContent>

          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
}