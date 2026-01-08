'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/uiadv/card';
import { Badge } from '@/components/uiadv/badge';
import { Button } from '@/components/uiadv/button';
import { ScrollArea } from '@/components/uiadv/scroll-area';
import { TrendingUp, TrendingDown, RefreshCw, DollarSign, Activity, BarChart3, Globe } from 'lucide-react';
import { MarketSummary, TopMovers } from '@/types/stocks';

export function MarketSummaryComponent() {
  const [summary, setSummary] = useState<MarketSummary | null>(null);
  const [topMovers, setTopMovers] = useState<TopMovers | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, moversRes] = await Promise.all([
        fetch('/api/v1/stocks/market/summary'),
        fetch('/api/v1/stocks/market/top-movers?limit=10'),
      ]);

      if (!summaryRes.ok || !moversRes.ok) {
        throw new Error('Failed to fetch market data');
      }

      const [summaryData, moversData] = await Promise.all([
        summaryRes.json(),
        moversRes.json(),
      ]);

      setSummary(summaryData);
      setTopMovers(moversData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load market data');
      console.error('Error fetching market data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const renderIndexCard = (index: any) => (
    <div className="bg-[#0B0E11] border border-[#2A2E39] rounded-sm p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase">{index.name}</span>
        <Badge variant="outline" className="h-5 text-[9px] border-[#2A2E39] bg-[#131722] text-slate-300">
          {index.symbol}
        </Badge>
      </div>
      <div className="text-lg font-bold text-slate-200 mb-1">{index.value.toFixed(2)}</div>
      <div className="flex items-center gap-1">
        {index.change >= 0 ? (
          <TrendingUp className="h-3 w-3 text-emerald-400" />
        ) : (
          <TrendingDown className="h-3 w-3 text-red-400" />
        )}
        <span className={`text-sm font-mono ${index.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)} ({index.change_percent >= 0 ? '+' : ''}{index.change_percent.toFixed(2)}%)
        </span>
      </div>
    </div>
  );

  const renderMoverRow = (mover: any, type: 'gainer' | 'loser' | 'active') => (
    <div className="flex items-center gap-3 p-2 bg-[#0B0E11] border-b border-[#2A2E39] last:border-0 hover:bg-[#131722] transition-colors cursor-pointer">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[11px] font-bold text-slate-200 truncate">{mover.symbol}</span>
          <Badge variant="outline" className={`h-4 text-[8px] border-current bg-transparent font-mono ${mover.change_percent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {mover.change_percent >= 0 ? '+' : ''}{mover.change_percent.toFixed(2)}%
          </Badge>
        </div>
        <div className="text-[10px] text-slate-500 truncate">{mover.name || 'N/A'}</div>
      </div>
      <div className="text-right">
        <div className="text-[11px] font-mono text-slate-200">{mover.price?.toFixed(2) || 'N/A'}</div>
        {mover.volume && (
          <div className="text-[9px] text-slate-500 font-mono">{mover.volume.toLocaleString()}</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Market Indices */}
      <Card className="bg-[#1E222D] border-[#2A2E39]">
        <CardHeader className="h-11 border-b border-[#2A2E39] px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Market Indices</span>
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
          {error ? (
            <div className="flex items-center justify-center h-32 text-red-400">
              {error}
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-32 text-slate-500">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          ) : summary ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {summary.indices.map((index, i) => (
                <div key={i}>{renderIndexCard(index)}</div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-500 py-8">Loading market data...</div>
          )}
        </CardContent>
      </Card>

      {/* Top Movers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top Gainers */}
        <Card className="bg-[#1E222D] border-[#2A2E39]">
          <CardHeader className="h-11 border-b border-[#2A2E39] px-4 py-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Top Gainers</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-64">
              <div>
                {topMovers?.gainers?.map((mover, i) => (
                  <div key={i}>{renderMoverRow(mover, 'gainer')}</div>
                ))}
                {!topMovers && !loading && (
                  <div className="text-center text-slate-500 py-8">No data</div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Top Losers */}
        <Card className="bg-[#1E222D] border-[#2A2E39]">
          <CardHeader className="h-11 border-b border-[#2A2E39] px-4 py-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Top Losers</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-64">
              <div>
                {topMovers?.losers?.map((mover, i) => (
                  <div key={i}>{renderMoverRow(mover, 'loser')}</div>
                ))}
                {!topMovers && !loading && (
                  <div className="text-center text-slate-500 py-8">No data</div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Most Active */}
        <Card className="bg-[#1E222D] border-[#2A2E39]">
          <CardHeader className="h-11 border-b border-[#2A2E39] px-4 py-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-500" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Most Active</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-64">
              <div>
                {topMovers?.active?.map((mover, i) => (
                  <div key={i}>{renderMoverRow(mover, 'active')}</div>
                ))}
                {!topMovers && !loading && (
                  <div className="text-center text-slate-500 py-8">No data</div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
