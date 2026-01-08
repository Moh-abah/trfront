'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/uiadv/card';
import { Badge } from '@/components/uiadv/badge';
import { ScrollArea } from '@/components/uiadv/scroll-area';
import { TrendingUp, TrendingDown, Gauge, Activity, RefreshCw, Zap } from 'lucide-react';
import { TechnicalAnalysis } from '@/types/stocks';
import { Button } from '../uiadv/button';

interface TechnicalAnalysisProps {
  symbol: string;
  timeframe?: string;
}

export function TechnicalAnalysisComponent({ symbol, timeframe = '1d' }: TechnicalAnalysisProps) {
  const [data, setData] = useState<TechnicalAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/stocks/analysis/${symbol}?timeframe=${timeframe}`);
      if (!response.ok) {
        throw new Error('Failed to fetch technical analysis');
      }
      const analysisData = await response.json();
      setData(analysisData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load technical analysis');
      console.error('Error fetching technical analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [symbol, timeframe]);

  const getRecommendationColor = (rec?: string) => {
    if (!rec) return 'text-slate-400 border-slate-600';
    switch (rec) {
      case 'strong_buy': return 'text-emerald-400 border-emerald-600 bg-emerald-900/20';
      case 'buy': return 'text-emerald-300 border-emerald-500 bg-emerald-900/10';
      case 'hold': return 'text-slate-400 border-slate-600 bg-slate-900/10';
      case 'sell': return 'text-red-300 border-red-500 bg-red-900/10';
      case 'strong_sell': return 'text-red-400 border-red-600 bg-red-900/20';
      default: return 'text-slate-400 border-slate-600';
    }
  };

  const renderIndicatorCard = (name: string, value?: number, signal?: 'bullish' | 'bearish' | 'neutral') => (
    <div className="bg-[#0B0E11] border border-[#2A2E39] rounded-sm p-3">
      <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">{name}</div>
      <div className="flex items-center justify-between">
        <div className="text-2xl font-mono text-slate-200">
          {value !== undefined ? value.toFixed(2) : 'N/A'}
        </div>
        {signal && (
          <Badge variant="outline" className={`h-6 text-[9px] font-mono border-current bg-transparent ${
            signal === 'bullish' ? 'text-emerald-400' : signal === 'bearish' ? 'text-red-400' : 'text-slate-400'
          }`}>
            {signal}
          </Badge>
        )}
      </div>
    </div>
  );

  return (
    <Card className="bg-[#1E222D] border-[#2A2E39] h-full">
      <CardHeader className="h-11 border-b border-[#2A2E39] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-purple-500" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Technical Analysis</span>
          </div>
          <Button
            onClick={fetchData}
            disabled={loading}
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-slate-500 hover:text-slate-300"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <ScrollArea className="h-[calc(100%-1rem)] custom-scrollbar">
          {error && (
            <div className="flex items-center justify-center h-64 text-red-400">
              {error}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center h-64 text-slate-500">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          )}

          {!loading && !error && data && (
            <div className="space-y-4">
              {/* Overall Recommendation */}
              <div className={`border-2 rounded-sm p-4 text-center ${getRecommendationColor(data.signals.recommendation)}`}>
                <div className="text-[10px] font-bold uppercase mb-2 opacity-80">Overall Signal</div>
                <div className="text-xl font-bold uppercase">
                  {data.signals.recommendation?.replace('_', ' ') || 'N/A'}
                </div>
              </div>

              {/* Trend & Momentum */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`border rounded-sm p-3 ${
                  data.signals.trend === 'bullish' ? 'border-emerald-600/30 bg-emerald-900/10' : 
                  data.signals.trend === 'bearish' ? 'border-red-600/30 bg-red-900/10' : 
                  'border-[#2A2E39] bg-[#0B0E11]'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-3 w-3 text-slate-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Trend</span>
                  </div>
                  <div className="text-lg font-bold uppercase text-slate-200">
                    {data.signals.trend || 'N/A'}
                  </div>
                </div>

                <div className={`border rounded-sm p-3 ${
                  data.signals.momentum === 'strong' ? 'border-emerald-600/30 bg-emerald-900/10' : 
                  data.signals.momentum === 'weak' ? 'border-red-600/30 bg-red-900/10' : 
                  'border-[#2A2E39] bg-[#0B0E11]'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Gauge className="h-3 w-3 text-slate-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Momentum</span>
                  </div>
                  <div className="text-lg font-bold uppercase text-slate-200">
                    {data.signals.momentum || 'N/A'}
                  </div>
                </div>
              </div>

              {/* RSI */}
              {data.indicators.rsi !== undefined && renderIndicatorCard('RSI', data.indicators.rsi)}

              {/* MACD */}
              {data.indicators.macd && (
                <div className="bg-[#0B0E11] border border-[#2A2E39] rounded-sm p-3">
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-3">MACD</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">MACD</span>
                      <span className="text-sm font-mono text-slate-200">{data.indicators.macd.macd.toFixed(4)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">Signal</span>
                      <span className="text-sm font-mono text-slate-200">{data.indicators.macd.signal.toFixed(4)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">Histogram</span>
                      <span className={`text-sm font-mono ${data.indicators.macd.histogram >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {data.indicators.macd.histogram.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bollinger Bands */}
              {data.indicators.bollinger_bands && (
                <div className="bg-[#0B0E11] border border-[#2A2E39] rounded-sm p-3">
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-3">Bollinger Bands</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">Upper</span>
                      <span className="text-sm font-mono text-red-400">{data.indicators.bollinger_bands.upper.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">Middle</span>
                      <span className="text-sm font-mono text-slate-200">{data.indicators.bollinger_bands.middle.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">Lower</span>
                      <span className="text-sm font-mono text-emerald-400">{data.indicators.bollinger_bands.lower.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ATR */}
              {data.indicators.atr !== undefined && renderIndicatorCard('ATR', data.indicators.atr)}

              {/* Stochastic */}
              {data.indicators.stochastic && (
                <div className="bg-[#0B0E11] border border-[#2A2E39] rounded-sm p-3">
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-3">Stochastic</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">%K</span>
                      <span className="text-sm font-mono text-slate-200">{data.indicators.stochastic.k.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">%D</span>
                      <span className="text-sm font-mono text-slate-200">{data.indicators.stochastic.d.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
