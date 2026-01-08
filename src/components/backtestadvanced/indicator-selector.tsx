


// @ts-nocheck


'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/uiadv/badge';
import { Button } from '@/components/uiadv/button';
import { Input } from '@/components/uiadv/input';
import { Label } from '@/components/uiadv/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/uiadv/select';
import { ScrollArea } from '@/components/uiadv/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/uiadv/tabs';
import { Plus, Trash2, TrendingUp, Activity, Waves, BarChart3, LayoutGrid, Sparkles, Layers, Settings } from 'lucide-react';
import { IndicatorConfig, IndicatorMetadata } from '@/types/backtest';
import { INDICATORS_BY_CATEGORY, getIndicatorByName } from '@/lib/indicators-registry';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  trend: <TrendingUp className="h-3 w-3" />,
  momentum: <Activity className="h-3 w-3" />,
  volatility: <Waves className="h-3 w-3" />,
  volume: <BarChart3 className="h-3 w-3" />,
  support_resistance: <LayoutGrid className="h-3 w-3" />,
  pattern_recognition: <Sparkles className="h-3 w-3" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  trend: 'text-blue-400',
  momentum: 'text-purple-400',
  volatility: 'text-orange-400',
  volume: 'text-green-400',
  support_resistance: 'text-pink-400',
  pattern_recognition: 'text-cyan-400',
};

const CATEGORY_BORDER: Record<string, string> = {
  trend: 'border-l-blue-500/50',
  momentum: 'border-l-purple-500/50',
  volatility: 'border-l-orange-500/50',
  volume: 'border-l-green-500/50',
  support_resistance: 'border-l-pink-500/50',
  pattern_recognition: 'border-l-cyan-500/50',
};

interface IndicatorSelectorProps {
  selectedIndicators: IndicatorConfig[];
  onIndicatorsChange: (indicators: IndicatorConfig[]) => void;
  timeframe: string;
  onTimeframeChange: (timeframe: string) => void;
}

export function IndicatorSelector({ selectedIndicators, onIndicatorsChange, timeframe, onTimeframeChange }: IndicatorSelectorProps) {
  const [expandedIndicator, setExpandedIndicator] = useState<string | null>(null);
  const categories = Object.keys(INDICATORS_BY_CATEGORY);

  const addIndicator = (indicatorName: string) => {
    const metadata = getIndicatorByName(indicatorName);
    if (!metadata) return;


    const getAutoTimeframe = (name: string): string => {
      // إطارات زمنية معروفة
      const tfList = TIMEFRAMES;


      for (const tf of tfList) {
        if (name.includes(`_${tf}`)) {
          return tf;
        }
      }

      return timeframe;
    };

    const newIndicator: IndicatorConfig = {
      name: metadata.name,
      type: metadata.category,
      params: { ...metadata.default_params },
      enabled: true,
      timeframe: getAutoTimeframe(indicatorName)
    };

    onIndicatorsChange([...selectedIndicators, newIndicator]);
    setExpandedIndicator(indicatorName);
  };

  const removeIndicator = (index: number) => {
    const newIndicators = selectedIndicators.filter((_, i) => i !== index);
    onIndicatorsChange(newIndicators);
    if (expandedIndicator === selectedIndicators[index]?.name) {
      setExpandedIndicator(null);
    }
  };

  const toggleIndicator = (index: number) => {
    const newIndicators = [...selectedIndicators];
    newIndicators[index].enabled = !newIndicators[index].enabled;
    onIndicatorsChange(newIndicators);
  };

  const updateIndicatorParam = (index: number, paramName: string, value: number) => {
    const newIndicators = [...selectedIndicators];
    newIndicators[index].params[paramName] = value;
    onIndicatorsChange(newIndicators);
  };

  const updateIndicatorTimeframe = (index: number, newTimeframe: string) => {
    const newIndicators = [...selectedIndicators];
    newIndicators[index].timeframe = newTimeframe;
    onIndicatorsChange(newIndicators);
  };




  const isIndicatorSelected = (name: string) => {
    return selectedIndicators.some(ind => ind.name === name);
  };

  const getSelectedIndicator = (name: string) => {
    return selectedIndicators.find(ind => ind.name === name);
  };

  const TIMEFRAMES = ['30s', '1m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '1w', '1M'];

  return (
    <div className="flex flex-col h-full  bg-[#131722] border-r border-[#2A2E39]">
      <div className="h-11 flex items-center justify-between px-4 border-b border-[#2A2E39] bg-[#1E222D] shrink-0">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-blue-500" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Indicators</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-slate-500 uppercase">Base TF</span>
          <div className="h-4 w-px bg-[#2A2E39] mx-1" />
          <Select value={timeframe} onValueChange={onTimeframeChange}>
            <SelectTrigger className="h-6 w-16 bg-[#0B0E11] border-[#2A2E39] text-[10px] text-slate-300 font-mono focus:ring-0 px-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1E222D] border-[#2A2E39] text-[10px] p-1">
              {TIMEFRAMES.map(tf => <SelectItem key={tf} value={tf} className="px-2 py-1.5 rounded-sm hover:bg-[#2A2E39] font-mono">{tf}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center bg-[#131722] p-1 border-b border-[#2A2E39] shrink-0">
        <Tabs defaultValue={categories[0]} className="w-full flex flex-col h-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-1 h-auto p-1 bg-[#0B0E11] rounded-sm border border-[#2A2E39]">
            {categories.map(category => (
              <TabsTrigger key={category} value={category} className="px-3 py-1 h-7 rounded-sm text-[9px] font-bold uppercase tracking-wide text-slate-500 hover:text-slate-300 data-[state=active]:bg-[#1E222D] data-[state=active]:text-slate-200 data-[state=active]:shadow-sm transition-all flex items-center gap-1.5">
                <span className={`${CATEGORY_COLORS[category]}`}>{CATEGORY_ICONS[category]}</span>
                <span className="hidden md:inline">{category.split('_')[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollArea className="flex-1 custom-scrollbar bg-[#131722]">
            {categories.map(category => (
              <TabsContent key={category} value={category} className="p-0 m-0 focus:outline-none">
                {INDICATORS_BY_CATEGORY[category]?.map((indicator: IndicatorMetadata) => {
                  const selected = getSelectedIndicator(indicator.name);
                  const isSelected = isIndicatorSelected(indicator.name);
                  const isExpanded = expandedIndicator === indicator.name && isSelected;

                  return (
                    <div key={indicator.name} className={`group border-b border-[#2A2E39] transition-colors duration-150 ${isSelected ? 'bg-[#1E222D] border-l-2 ' + CATEGORY_BORDER[category] : 'bg-[#131722] border-l-2 border-transparent hover:bg-[#1A1E27]'}`}>
                      <div className="flex items-center gap-3 p-3">
                        <div onClick={() => { const idx = selectedIndicators.findIndex(i => i.name === indicator.name); if (idx !== -1) toggleIndicator(idx); else addIndicator(indicator.name); }} className="cursor-pointer">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-[#3E4451] bg-[#0B0E11]'}`}>
                            {isSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => { if (isSelected) { setExpandedIndicator(isExpanded ? null : indicator.name); } else { addIndicator(indicator.name); setExpandedIndicator(indicator.name); } }}>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={`text-[11px] font-bold tracking-wide uppercase ${isSelected ? 'text-slate-200' : 'text-slate-400'}`}>{indicator.display_name}</span>
                            {isSelected && <Badge variant="outline" className={`h-4 px-1 text-[8px] border-current bg-transparent font-mono opacity-50 ${CATEGORY_COLORS[indicator.type]}`}>{indicator.type}</Badge>}
                          </div>
                          <div className="text-[9px] text-slate-600 font-mono truncate">{indicator.name}</div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!isSelected ? (
                            <Button variant="ghost" size="sm" onClick={() => addIndicator(indicator.name)} className="h-6 w-6 p-0 text-slate-500 hover:text-blue-400 hover:bg-blue-900/10">
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm" onClick={() => { const idx = selectedIndicators.findIndex(i => i.name === indicator.name); if (idx !== -1) removeIndicator(idx); }} className="h-6 w-6 p-0 text-slate-500 hover:text-red-400 hover:bg-red-900/10">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {isSelected && (
                            <Button variant="ghost" size="sm" onClick={() => setExpandedIndicator(isExpanded ? null : indicator.name)} className="h-6 w-6 p-0 text-slate-500 hover:text-slate-300 hover:bg-[#2A2E39]">
                              {isExpanded ? <div className="h-3 w-3 border-l border-t border-slate-400 rotate-45 -translate-y-[1px] translate-x-[1px]" /> : <div className="h-3 w-3 border-l border-t border-slate-600 rotate-135 -translate-y-[1px] translate-x-[1px]" />}
                            </Button>
                          )}
                        </div>
                      </div>
                      {isExpanded && selected && (
                        <div className="bg-[#0B0E11] border-t border-[#2A2E39] p-3 animate-in slide-in-from-top-1 duration-200">
                          <div className="flex items-center gap-2 mb-3">
                            <Settings className="h-3.5 w-3.5 text-slate-500" />
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Indicator Settings</span>
                          </div>

                          {/* ✅ قسم الإطار الزمني للمؤشر */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <Label className="text-[9px] text-slate-500 uppercase">Timeframe</Label>
                              <span className="text-[8px] text-slate-600 font-mono">Current: {selected.timeframe}</span>
                            </div>
                            <Select
                              value={selected.timeframe}
                              onValueChange={(value) => {
                                const idx = selectedIndicators.findIndex(i => i.name === indicator.name);
                                if (idx !== -1) updateIndicatorTimeframe(idx, value);
                              }}
                            >
                              <SelectTrigger className="h-6 w-full bg-[#131722] border-[#2A2E39] text-[10px] text-slate-300 font-mono focus:ring-0 px-2">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-[#1E222D] border-[#2A2E39] text-[10px] p-1">
                                {TIMEFRAMES.map(tf => (
                                  <SelectItem key={tf} value={tf} className="px-2 py-1.5 rounded-sm hover:bg-[#2A2E39] font-mono">
                                    {tf}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>


                          <div className="flex items-center gap-2 mb-3">
                            <Settings className="h-3.5 w-3.5 text-slate-500" />
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Parameters</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(selected?.params || {}).map(([paramName, paramValue]) => (
                              <div key={paramName} className="flex items-center gap-2 bg-[#131722] p-2 rounded-sm border border-[#2A2E39]">
                                <Label className="text-[9px] text-slate-500 uppercase font-mono cursor-pointer select-none">{paramName}</Label>
                                <Input type="number" step={paramName.includes('percentage') || paramName.includes('std') ? 0.01 : 1} value={paramValue as number} onChange={(e) => { const idx = selectedIndicators.findIndex(i => i.name === indicator.name); if (idx !== -1) { updateIndicatorParam(idx, paramName, parseFloat(e.target.value) || 0); } }} className="h-6 w-full text-[10px] bg-transparent border-0 text-right focus:ring-0 p-0 font-mono text-slate-200" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </TabsContent>
            ))}
            <div className="h-4" />
          </ScrollArea>
        </Tabs>
      </div>
      <div className="h-7 border-t border-[#2A2E39] bg-[#1E222D] flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-600">
            {selectedIndicators.length > 0 && <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-blue-400 opacity-75"></span>}
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
          </div>
          <span className="text-[9px] text-slate-500 uppercase font-mono">Library Active</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] text-slate-500">Selected</span>
          <span className="text-[10px] font-mono text-slate-300 bg-[#0B0E11] px-1.5 py-0.5 rounded border border-[#2A2E39]">{selectedIndicators.filter(i => i.enabled).length}</span>
        </div>
      </div>
    </div>
  );
}