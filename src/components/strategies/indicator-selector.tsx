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
import { Plus, Trash2, TrendingUp, Activity, Waves, BarChart3, LayoutGrid, Sparkles, Layers, Settings, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [expandedIndicatorId, setExpandedIndicatorId] = useState<string | null>(null);
  const categories = Object.keys(INDICATORS_BY_CATEGORY);


  const addIndicator = (indicatorName: string) => {
    const metadata = getIndicatorByName(indicatorName);
    if (!metadata) return;

    const getAutoTimeframe = (name: string): string => {
      const tfList = TIMEFRAMES;
      for (const tf of tfList) {
        if (name.includes(`_${tf}`)) {
          return tf;
        }
      }
      return timeframe;
    };

    // ✅ تعديل هام: إضافة طابع زمني لضمان تفرد المعرف (ID) مبدئياً
    // هذا يسمح بتعديل الاسم لاحقاً دون أن يتسبب في تعديل جميع المؤشرات من نفس النوع
    const uniqueId = `${metadata.display_name}_${Date.now()}`;

    const newIndicator: IndicatorConfig = {
      id: uniqueId,             // هذا هو المعرف الفريد الذي سيظهر في حقل الإدخال
      name: metadata.name,      // الاسم التقني (rsi, sma..)
      type: metadata.category,
      params: { ...metadata.default_params },
      enabled: true,
      timeframe: getAutoTimeframe(indicatorName)
    };

    onIndicatorsChange([...selectedIndicators, newIndicator]);
    setExpandedIndicatorId(newIndicator.id);
  };

  const removeIndicator = (id: string) => {
    const newIndicators = selectedIndicators.filter(ind => ind.id !== id);
    onIndicatorsChange(newIndicators);
    if (expandedIndicatorId === id) {
      setExpandedIndicatorId(null);
    }
  };

  const toggleIndicator = (id: string) => {
    const newIndicators = selectedIndicators.map(ind =>
      ind.id === id ? { ...ind, enabled: !ind.enabled } : ind
    );
    onIndicatorsChange(newIndicators);
  };

  const updateIndicatorParam = (id: string, paramName: string, value: number) => {
    const newIndicators = selectedIndicators.map(ind => {
      if (ind.id === id) {
        return { ...ind, params: { ...ind.params, [paramName]: value } };
      }
      return ind;
    });
    onIndicatorsChange(newIndicators);
  };

  // ✅ هذه الدالة تقوم بتحديث الـ ID بناءً على ما يكتبه المستخدم في حقل الإدخال
  const updateIndicatorLabel = (currentId: string, newLabel: string) => {
    const newIndicators = selectedIndicators.map(ind => {
      // نبحث بالـ ID الحالي لضمان تحديث العنصر الصحيح فقط
      if (ind.id === currentId) {
        return { ...ind, id: newLabel };
      }
      return ind;
    });
    onIndicatorsChange(newIndicators);
  };

  const updateIndicatorTimeframe = (id: string, newTimeframe: string) => {
    const newIndicators = selectedIndicators.map(ind =>
      ind.id === id ? { ...ind, timeframe: newTimeframe } : ind
    );
    onIndicatorsChange(newIndicators);
  };

  const getSelectedIndicator = (id: string) => {
    return selectedIndicators.find(ind => ind.id === id);
  };

  const TIMEFRAMES = ['30s', '1m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '1w', '1M'];

  return (
    <div className="flex flex-col h-full bg-background border-r border-border">
      <div className="h-11 flex items-center justify-between px-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold text-foreground uppercase tracking-widest">Indicators</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-muted-foreground uppercase">Base TF</span>
          <div className="h-4 w-px bg-border mx-1" />
          <Select value={timeframe} onValueChange={onTimeframeChange}>
            <SelectTrigger className="h-6 w-16 bg-muted border-border text-[10px] text-foreground font-mono focus:ring-0 px-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-[10px] p-1">
              {TIMEFRAMES.map(tf => (
                <SelectItem key={tf} value={tf} className="px-2 py-1.5 rounded-sm hover:bg-muted font-mono">
                  {tf}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center bg-background p-1 border-b border-border shrink-0">
        <Tabs defaultValue={categories[0]} className="w-full flex flex-col h-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-1 h-auto p-1 bg-muted rounded-sm border border-border">
            {categories.map(category => (
              <TabsTrigger
                key={category}
                value={category}
                className="px-3 py-1 h-7 rounded-sm text-[9px] font-bold uppercase tracking-wide text-muted-foreground hover:text-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all flex items-center gap-1.5"
              >
                <span className={`${CATEGORY_COLORS[category]}`}>{CATEGORY_ICONS[category]}</span>
                <span className="hidden md:inline">{category.split('_')[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollArea className="flex-1 custom-scrollbar bg-background">
            {categories.map(category => (
              <TabsContent key={category} value={category} className="p-0 m-0 focus:outline-none">
                {INDICATORS_BY_CATEGORY[category]?.map((indicator: IndicatorMetadata) => {
                  return (
                    <div
                      key={indicator.name}
                      className="group border-b border-border transition-colors duration-150 hover:bg-muted/30"
                    >
                      <div className="flex items-center gap-3 p-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addIndicator(indicator.name)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[11px] font-bold tracking-wide uppercase text-foreground">
                              {indicator.display_name}
                            </span>
                            <Badge className="h-4 px-1 text-[8px] border-current bg-transparent font-mono opacity-50 text-muted-foreground">
                              {indicator.type}
                            </Badge>
                          </div>
                          <div className="text-[9px] text-muted-foreground font-mono truncate">
                            {indicator.name}
                          </div>
                        </div>
                      </div>

                      {selectedIndicators
                        .filter(activeInd => activeInd.name === indicator.name)
                        .map((activeInd, index) => { // ✅ تم إضافة index
                          const isExpanded = expandedIndicatorId === activeInd.id;
                          return (
                            <div
                              // ✅ تم استخدام مفتاح ثابت (index) بدلاً من activeInd.id
                              // هذا يمنع React من إعادة بناء الحقل عند تغيير الـ ID
                              key={`active-ind-${indicator.name}-${index}`}
                              className={`bg-card border-l-2 ${CATEGORY_BORDER[category]} border-t border-r border-b`}
                            >
                              <div className="flex items-center gap-3 p-3 pl-4">
                                <div
                                  onClick={() => toggleIndicator(activeInd.id!)}
                                  className="cursor-pointer"
                                >
                                  <div
                                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${activeInd.enabled
                                      ? 'bg-primary border-primary'
                                      : 'border-border bg-muted'
                                      }`}
                                  >
                                    {activeInd.enabled && <div className="w-2 h-2 bg-primary-foreground rounded-sm" />}
                                  </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                  {/* ✅ حقل الإدخال هنا مرتبط مباشرة بالـ id */}
                                  <Input
                                    value={activeInd.id}
                                    onChange={(e) => updateIndicatorLabel(activeInd.id!, e.target.value)}
                                    placeholder="ID / Name"
                                    className={`h-5 w-full px-0 text-[11px] bg-transparent border-0 focus:ring-0 p-0 font-bold tracking-wide uppercase ${activeInd.enabled ? 'text-foreground' : 'text-muted-foreground'}`}
                                  />
                                  <div className="text-[9px] text-muted-foreground font-mono truncate">
                                    {activeInd.name} • {activeInd.timeframe}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeIndicator(activeInd.id!)}
                                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setExpandedIndicatorId(isExpanded ? null : activeInd.id!)}
                                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                                  >
                                    {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                  </Button>
                                </div>
                              </div>

                              {isExpanded && (
                                <div className="bg-muted border-t border-border p-3 animate-in slide-in-from-top-1 duration-200">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                                      Indicator Settings
                                    </span>
                                  </div>

                                  <div className="mb-3">
                                    <div className="flex items-center justify-between mb-1">
                                      <Label className="text-[9px] text-muted-foreground uppercase">Timeframe</Label>
                                      <span className="text-[8px] text-muted-foreground font-mono">
                                        Current: {activeInd.timeframe}
                                      </span>
                                    </div>
                                    <Select
                                      value={activeInd.timeframe}
                                      onValueChange={(value) => updateIndicatorTimeframe(activeInd.id!, value)}
                                    >
                                      <SelectTrigger className="h-6 w-full bg-background border-border text-[10px] text-foreground font-mono focus:ring-0 px-2">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className="bg-card border-border text-[10px] p-1">
                                        {TIMEFRAMES.map(tf => (
                                          <SelectItem key={tf} value={tf} className="px-2 py-1.5 rounded-sm hover:bg-muted font-mono">
                                            {tf}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="flex items-center gap-2 mb-3">
                                    <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                                      Parameters
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(activeInd?.params || {}).map(([paramName, paramValue]) => (
                                      <div key={paramName} className="flex items-center gap-2 bg-background p-2 rounded-sm border border-border">
                                        <Label className="text-[9px] text-muted-foreground uppercase font-mono cursor-pointer select-none">
                                          {paramName}
                                        </Label>
                                        <Input
                                          type="number"
                                          step={
                                            paramName.includes('percentage') || paramName.includes('std') ? 0.01 : 1
                                          }
                                          value={paramValue as number}
                                          onChange={(e) => updateIndicatorParam(activeInd.id!, paramName, parseFloat(e.target.value) || 0)}
                                          className="h-6 w-full text-[10px] bg-transparent border-0 text-right focus:ring-0 p-0 font-mono text-foreground"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  );
                })}
              </TabsContent>
            ))}
            <div className="h-4" />
          </ScrollArea>
        </Tabs>
      </div>
      <div className="h-7 border-t border-border bg-card flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-muted">
            {selectedIndicators.length > 0 && (
              <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-primary opacity-75"></span>
            )}
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
          </div>
          <span className="text-[9px] text-muted-foreground uppercase font-mono">Library Active</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] text-muted-foreground">Selected</span>
          <span className="text-[10px] font-mono text-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
            {selectedIndicators.filter(i => i.enabled).length}
          </span>
        </div>
      </div>
    </div>
  );
}