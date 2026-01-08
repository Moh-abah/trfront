'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/uiadv/card';
import { Input } from '@/components/uiadv/input';
import { Button } from '@/components/uiadv/button';
import { Badge } from '@/components/uiadv/badge';
import { ScrollArea } from '@/components/uiadv/scroll-area';
import { Search, TrendingUp, TrendingDown, RefreshCw, X } from 'lucide-react';
import { StockSearchResult } from '@/types/stocks';

interface StockSearchProps {
  onSelectStock?: (symbol: string) => void;
}

export function StockSearchComponent({ onSelectStock }: StockSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchStocks = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(searchQuery)}&limit=20`);
      if (!response.ok) {
        throw new Error('Failed to search stocks');
      }
      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search stocks');
      console.error('Error searching stocks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      searchStocks(query);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, searchStocks]);

  const handleSelect = (stock: StockSearchResult) => {
    setQuery('');
    setResults([]);
    if (onSelectStock) {
      onSelectStock(stock.symbol);
    }
  };

  return (
    <Card className="bg-[#1E222D] border-[#2A2E39]">
      <CardHeader className="h-11 border-b border-[#2A2E39] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Search</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stocks, crypto, forex..."
            className="h-10 pl-10 bg-[#0B0E11] border-[#2A2E39] text-sm text-slate-200 placeholder:text-slate-600 focus:ring-0 focus:border-[#2962FF]"
          />
          {query && (
            <Button
              onClick={() => {
                setQuery('');
                setResults([]);
              }}
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-slate-500 hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-96 custom-scrollbar">
          {loading && (
            <div className="flex items-center justify-center h-32 text-slate-500">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-32 text-red-400">
              {error}
            </div>
          )}

          {!loading && !error && results.length === 0 && query && (
            <div className="flex items-center justify-center h-32 text-slate-500">
              No results found for "{query}"
            </div>
          )}

          {!loading && !error && results.length > 0 && (
            <div className="space-y-1">
              {results.map((stock, i) => (
                <div
                  key={i}
                  onClick={() => handleSelect(stock)}
                  className="flex items-center gap-3 p-3 bg-[#0B0E11] border border-[#2A2E39] rounded-sm hover:border-[#2962FF] cursor-pointer transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[11px] font-bold text-slate-200">{stock.symbol}</span>
                      {stock.type && (
                        <Badge variant="outline" className="h-4 text-[8px] border-[#2A2E39] bg-[#131722] text-slate-400">
                          {stock.type}
                        </Badge>
                      )}
                      {stock.exchange && (
                        <Badge variant="outline" className="h-4 text-[8px] border-[#2A2E39] bg-[#131722] text-slate-400">
                          {stock.exchange}
                        </Badge>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{stock.name}</div>
                  </div>
                  <div className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-slate-500 hover:text-slate-300 hover:bg-[#2A2E39]"
                    >
                      <TrendingUp className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && results.length === 0 && !query && (
            <div className="text-center text-slate-500 py-8">
              <Search className="h-12 w-12 mx-auto mb-3 text-slate-700" />
              <p className="text-sm">Search for stocks, crypto, forex...</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
