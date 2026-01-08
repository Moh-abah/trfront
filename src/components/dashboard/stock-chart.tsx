'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/uiadv/card';
import { Badge } from '@/components/uiadv/badge';
import { Button } from '@/components/uiadv/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/uiadv/select';
import { TrendingUp, TrendingDown, RefreshCw, Maximize2, CandlestickChart } from 'lucide-react';
import { StockChart } from '@/types/stocks';

interface StockChartProps {
  symbol: string;
  timeframe?: string;
  days?: number;
  showHeader?: boolean;
}

export function StockChartComponent({ symbol, timeframe = '1d', days = 365, showHeader = true }: StockChartProps) {
  const [data, setData] = useState<StockChart | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);
  const [error, setError] = useState<string | null>(null);

  const TIMEFRAMES = [
    { value: '1m', label: '1m' },
    { value: '5m', label: '5m' },
    { value: '15m', label: '15m' },
    { value: '1h', label: '1h' },
    { value: '4h', label: '4h' },
    { value: '1d', label: '1D' },
    { value: '1w', label: '1W' },
  ];

  const DAYS_OPTIONS = [
    { value: '7', label: '7 Days' },
    { value: '30', label: '30 Days' },
    { value: '90', label: '3 Months' },
    { value: '180', label: '6 Months' },
    { value: '365', label: '1 Year' },
    { value: '730', label: '2 Years' },
  ];

  const fetchChart = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/stocks/chart/${symbol}?timeframe=${selectedTimeframe}&days=${days}`);
      if (!response.ok) {
        throw new Error('Failed to fetch chart data');
      }
      const chartData = await response.json();
      setData(chartData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chart');
      console.error('Error fetching chart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChart();
  }, [symbol, selectedTimeframe, days]);

  const renderSimpleChart = () => {
    if (!data || !data.data || data.data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-slate-500">
          No data available
        </div>
      );
    }

    const prices = data.data.map(d => d.close);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    
    const lastPrice = prices[prices.length - 1];
    const firstPrice = prices[0];
    const change = lastPrice - firstPrice;
    const changePercent = ((change / firstPrice) * 100);

    // Generate chart path
    const width = 100;
    const height = 100;
    const stepX = width / (prices.length - 1);

    const pathD = prices.map((price, i) => {
      const x = i * stepX;
      const y = height - ((price - minPrice) / priceRange) * height;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    const fillPath = `${pathD} L ${width} ${height} L 0 ${height} Z`;

    return (
      <div className="relative h-64">
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={change >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'} />
              <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
            </linearGradient>
          </defs>
          <path
            d={fillPath}
            fill="url(#chartGradient)"
          />
          <path
            d={pathD}
            fill="none"
            stroke={change >= 0 ? '#10b981' : '#ef4444'}
            strokeWidth="0.5"
          />
        </svg>

        {/* Price info overlay */}
        <div className="absolute top-2 right-2 bg-[#1E222D] border border-[#2A2E39] rounded-sm px-3 py-2">
          <div className="flex items-center gap-2">
            {change >= 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-400" />
            )}
            <div>
              <div className="text-sm font-bold text-slate-200">{lastPrice.toFixed(2)}</div>
              <div className={`text-xs font-mono ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {change >= 0 ? '+' : ''}{change.toFixed(2)} ({change >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-[#1E222D] border-[#2A2E39] overflow-hidden">
      {showHeader && (
        <CardHeader className="h-12 border-b border-[#2A2E39] px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <CandlestickChart className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-bold text-slate-200 uppercase">{symbol}</span>
              </div>
              <div className="flex items-center gap-2">
                <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                  <SelectTrigger className="h-7 bg-[#131722] border-[#2A2E39] text-[10px] text-slate-300 focus:ring-0 px-2 w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E222D] border-[#2A2E39] text-[10px]">
                    {TIMEFRAMES.map(tf => (
                      <SelectItem key={tf.value} value={tf.value}>{tf.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={fetchChart}
                disabled={loading}
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-slate-500 hover:text-slate-300"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className="p-0">
        {error ? (
          <div className="flex items-center justify-center h-64 text-red-400">
            {error}
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-64 text-slate-500">
            <RefreshCw className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          renderSimpleChart()
        )}
      </CardContent>
    </Card>
  );
}
