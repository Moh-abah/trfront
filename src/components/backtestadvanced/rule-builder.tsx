
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/uiadv/button';
import { Input } from '@/components/uiadv/input';
import { Label } from '@/components/uiadv/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/uiadv/select';
import { Checkbox } from '@/components/uiadv/checkbox';
import { ScrollArea } from '@/components/uiadv/scroll-area';
import { Badge } from '@/components/uiadv/badge';
import {
  Plus, Trash2, TrendingUp, TrendingDown, Shield, Filter,
  ChevronRight, ChevronDown, Zap, GitBranch, Ban
} from 'lucide-react';
import {
  EntryRule, ExitRule, FilterRule, PositionSide, ExitType, FilterAction,
  IndicatorConfig, RuleCondition
} from '@/types/backtest';
import { ConditionBuilder } from './condition-builder';

interface RuleBuilderProps {
  entryRules: EntryRule[];
  exitRules: ExitRule[];
  filterRules: FilterRule[];
  onEntryRulesChange: (rules: EntryRule[]) => void;
  onExitRulesChange: (rules: ExitRule[]) => void;
  onFilterRulesChange: (rules: FilterRule[]) => void;
  availableIndicators: IndicatorConfig[];
}

export function RuleBuilder({
  entryRules,
  exitRules,
  filterRules,
  onEntryRulesChange,
  onExitRulesChange,
  onFilterRulesChange,
  availableIndicators
}: RuleBuilderProps) {

  // --- UI STATE: Expansion Logic ---
  const [activeTab, setActiveTab] = useState<'entry' | 'exit' | 'filter'>('entry');
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null);

  // --- LOGIC HANDLERS (Preserved Exactly) ---

  // Entry Rules
  const addEntryRule = () => {
    const defaultIndicator = availableIndicators.length > 0
      ? `indicator:${availableIndicators[0].name}`
      : 'indicator:rsi';

    const newRule: EntryRule = {
      name: `قاعدة دخول ${entryRules.length + 1}`,
      condition: { type: 'indicator_value', operator: '>', left_value: defaultIndicator, right_value: 70 },
      position_side: 'long',
      weight: 0.5,
      enabled: true
    };
    onEntryRulesChange([...entryRules, newRule]);
    setExpandedRuleId(`entry-${entryRules.length}`);
  };

  const removeEntryRule = (index: number) => {
    onEntryRulesChange(entryRules.filter((_, i) => i !== index));
  };

  const updateEntryRule = (index: number, updates: Partial<EntryRule>) => {
    const newRules = [...entryRules];
    newRules[index] = { ...newRules[index], ...updates };
    onEntryRulesChange(newRules);
  };

  // Exit Rules
  const addExitRule = () => {
    const newRule: ExitRule = {
      name: `قاعدة خروج ${exitRules.length + 1}`,
      condition: { type: 'indicator_value', operator: '>', left_value: 'indicator:rsi', right_value: 80 },
      exit_type: 'signal_exit',
      enabled: true
    };
    onExitRulesChange([...exitRules, newRule]);
    setExpandedRuleId(`exit-${exitRules.length}`);
  };

  const removeExitRule = (index: number) => {
    onExitRulesChange(exitRules.filter((_, i) => i !== index));
  };

  const updateExitRule = (index: number, updates: Partial<ExitRule>) => {
    const newRules = [...exitRules];
    newRules[index] = { ...newRules[index], ...updates };
    onExitRulesChange(newRules);
  };

  // Filter Rules
  const addFilterRule = () => {
    const newRule: FilterRule = {
      name: `فلتر ${filterRules.length + 1}`,
      condition: { type: 'indicator_value', operator: '!=', left_value: 'indicator:supply_demand', right_value: 0 },
      action: 'block',
      enabled: true
    };
    onFilterRulesChange([...filterRules, newRule]);
    setExpandedRuleId(`filter-${filterRules.length}`);
  };

  const removeFilterRule = (index: number) => {
    onFilterRulesChange(filterRules.filter((_, i) => i !== index));
  };

  const updateFilterRule = (index: number, updates: Partial<FilterRule>) => {
    const newRules = [...filterRules];
    newRules[index] = { ...newRules[index], ...updates };
    onFilterRulesChange(newRules);
  };

  // --- SUB-COMPONENT: Rule Row Item ---
  // Generic wrapper to handle visual consistency across Entry/Exit/Filter
  const RuleRow = ({
    type, rule, index,
    toggleHandler, removeHandler, updateHandler,
    isExpanded
  }: {
    type: 'entry' | 'exit' | 'filter';
    rule: EntryRule | ExitRule | FilterRule;
    index: number;
    toggleHandler: () => void;
    removeHandler: () => void;
    updateHandler: (updates: any) => void;
    isExpanded: boolean;
  }) => {

    const typeColor = type === 'entry' ? 'text-emerald-400 border-emerald-500/30' :
      type === 'exit' ? 'text-rose-400 border-rose-500/30' :
        'text-blue-400 border-blue-500/30';

    const typeIcon = type === 'entry' ? <TrendingUp className="h-3.5 w-3.5" /> :
      type === 'exit' ? <TrendingDown className="h-3.5 w-3.5" /> :
        <Ban className="h-3.5 w-3.5" />;

    const isEntry = type === 'entry';
    const isExit = type === 'exit';
    const isFilter = type === 'filter';

    return (
      <div className={`group border-b border-[#2A2E39] transition-colors duration-150 ${rule.enabled ? 'bg-[#1E222D]' : 'bg-[#131722]/50 opacity-60'}`}>

        {/* --- ROW 1: Header / Summary --- */}
        <div className="flex items-center gap-3 p-3">
          {/* Checkbox */}
          <div className="cursor-pointer" onClick={toggleHandler}>
            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${rule.enabled ? 'bg-emerald-600 border-emerald-600' : 'border-[#3E4451] bg-[#0B0E11]'}`}>
              {rule.enabled && <div className="w-2 h-2 bg-white rounded-sm" />}
            </div>
          </div>

          {/* Name Input (Inline) */}
          <div className="flex-1 min-w-0">
            <Input
              value={rule.name}
              onChange={(e) => updateHandler({ name: e.target.value })}
              disabled={!rule.enabled}
              className="h-6 bg-transparent border-0 px-0 text-sm font-medium text-slate-200 focus:ring-0 focus-visible:ring-0 placeholder:text-slate-600"
            />
          </div>

          {/* Meta Tags */}
          <div className="flex items-center gap-2">
            {isEntry && (
              <Badge variant="outline" className={`h-5 px-1.5 text-[9px] border-current bg-transparent font-mono uppercase ${typeColor}`}>
                {(rule as EntryRule).position_side === 'long' ? 'LONG' : (rule as EntryRule).position_side === 'short' ? 'SHORT' : 'BOTH'}
              </Badge>
            )}
            {isExit && (
              <Badge variant="outline" className={`h-5 px-1.5 text-[9px] border-current bg-transparent font-mono uppercase ${typeColor}`}>
                {(rule as ExitRule).exit_type.replace('_', ' ')}
              </Badge>
            )}
            {isFilter && (
              <Badge variant="outline" className={`h-5 px-1.5 text-[9px] border-current bg-transparent font-mono uppercase ${typeColor}`}>
                {(rule as FilterRule).action}
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedRuleId(isExpanded ? null : `${type}-${index}`)}
              className="h-6 w-6 p-0 text-slate-500 hover:text-slate-300 hover:bg-[#2A2E39]"
            >
              {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeHandler}
              className="h-6 w-6 p-0 text-slate-500 hover:text-red-400 hover:bg-red-900/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* --- ROW 2: Expanded Details --- */}
        {isExpanded && (
          <div className="bg-[#0B0E11] border-t border-[#2A2E39] p-3 animate-in slide-in-from-top-1 duration-200">

            {/* Top Control Grid */}
            <div className="grid grid-cols-2 gap-3 mb-3">

              {/* Entry Specific: Position Side */}
              {isEntry && (
                <div>
                  <Label className="text-[9px] font-bold text-slate-500 uppercase mb-1 block">Position Side</Label>
                  <Select
                    value={(rule as EntryRule).position_side}
                    onValueChange={(v) => updateHandler({ position_side: v as PositionSide })}
                  >
                    <SelectTrigger className="h-7 bg-[#131722] border-[#2A2E39] text-[10px] text-slate-300 focus:ring-0 px-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E222D] border-[#2A2E39] text-[10px] p-1">
                      <SelectItem value="long" className="px-2 py-1.5 rounded-sm hover:bg-[#2A2E39]">LONG</SelectItem>
                      <SelectItem value="short" className="px-2 py-1.5 rounded-sm hover:bg-[#2A2E39]">SHORT</SelectItem>
                      <SelectItem value="both" className="px-2 py-1.5 rounded-sm hover:bg-[#2A2E39]">BOTH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Entry Specific: Weight */}
              {isEntry && (
                <div>
                  <Label className="text-[9px] font-bold text-slate-500 uppercase mb-1 block">Weight (0-1)</Label>
                  <Input
                    type="number"
                    step={0.1}
                    min={0}
                    max={1}
                    value={(rule as EntryRule).weight}
                    onChange={(e) => updateHandler({ weight: parseFloat(e.target.value) || 0 })}
                    className="h-7 bg-[#131722] border-[#2A2E39] text-[10px] text-slate-300 focus:ring-0 px-2 font-mono text-right"
                  />
                </div>
              )}

              {/* Exit Specific: Type */}
              {isExit && (
                <div>
                  <Label className="text-[9px] font-bold text-slate-500 uppercase mb-1 block">Exit Type</Label>
                  <Select
                    value={(rule as ExitRule).exit_type}
                    onValueChange={(v) => updateHandler({ exit_type: v as ExitType })}
                  >
                    <SelectTrigger className="h-7 bg-[#131722] border-[#2A2E39] text-[10px] text-slate-300 focus:ring-0 px-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E222D] border-[#2A2E39] text-[10px] p-1">
                      <SelectItem value="signal_exit">Signal Exit</SelectItem>
                      <SelectItem value="stop_loss">Stop Loss</SelectItem>
                      <SelectItem value="take_profit">Take Profit</SelectItem>
                      <SelectItem value="trailing_stop">Trailing Stop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Exit Specific: Value (%) */}
              {isExit && ['stop_loss', 'take_profit', 'trailing_stop'].includes((rule as ExitRule).exit_type) && (
                <div>
                  <Label className="text-[9px] font-bold text-slate-500 uppercase mb-1 block">Value (%)</Label>
                  <Input
                    type="number"
                    step={0.1}
                    value={(rule as ExitRule).value || ''}
                    onChange={(e) => updateHandler({ value: parseFloat(e.target.value) || undefined })}
                    className="h-7 bg-[#131722] border-[#2A2E39] text-[10px] text-slate-300 focus:ring-0 px-2 font-mono text-right"
                  />
                </div>
              )}

              {/* Filter Specific: Action */}
              {isFilter && (
                <div>
                  <Label className="text-[9px] font-bold text-slate-500 uppercase mb-1 block">Action</Label>
                  <Select
                    value={(rule as FilterRule).action}
                    onValueChange={(v) => updateHandler({ action: v as FilterAction })}
                  >
                    <SelectTrigger className="h-7 bg-[#131722] border-[#2A2E39] text-[10px] text-slate-300 focus:ring-0 px-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E222D] border-[#2A2E39] text-[10px] p-1">
                      <SelectItem value="allow">Allow</SelectItem>
                      <SelectItem value="block">Block</SelectItem>
                      <SelectItem value="delay">Delay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Condition Builder Wrapper */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <GitBranch className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Trigger Condition</span>
              </div>
              <div className="border border-[#2A2E39] rounded-sm bg-[#131722] p-3">
                <ConditionBuilder
                  condition={rule.condition}
                  onChange={(cond) => updateHandler({ condition: cond as RuleCondition })}
                  availableIndicators={availableIndicators}
                  index={index}
                />
              </div>
            </div>

          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#131722] border-r border-[#2A2E39]">

      {/* --- HEADER STRIP --- */}
      <div className="h-11 flex items-center justify-between px-4 border-b border-[#2A2E39] bg-[#1E222D] shrink-0">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-purple-500" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Execution Logic</span>
        </div>

        {/* Navigation Tabs (Top Bar) */}
        <div className="flex items-center bg-[#131722] rounded-sm p-0.5 border border-[#2A2E39]">
          <button
            onClick={() => setActiveTab('entry')}
            className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wide rounded-sm transition-all flex items-center gap-1.5
              ${activeTab === 'entry' ? 'bg-[#2962FF] text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <TrendingUp className="h-3 w-3" />
            Entry ({entryRules.filter(r => r.enabled).length})
          </button>
          <button
            onClick={() => setActiveTab('exit')}
            className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wide rounded-sm transition-all flex items-center gap-1.5
              ${activeTab === 'exit' ? 'bg-[#2962FF] text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <TrendingDown className="h-3 w-3" />
            Exit ({exitRules.filter(r => r.enabled).length})
          </button>
          <button
            onClick={() => setActiveTab('filter')}
            className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wide rounded-sm transition-all flex items-center gap-1.5
              ${activeTab === 'filter' ? 'bg-[#2962FF] text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Shield className="h-3 w-3" />
            Filter ({filterRules.filter(r => r.enabled).length})
          </button>
        </div>
      </div>

      {/* --- MAIN LIST AREA --- */}
      <div className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full custom-scrollbar bg-[#131722]">

          {/* Entry Rules List */}
          {activeTab === 'entry' && (
            <div className="flex flex-col">
              {entryRules.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 border-b border-[#2A2E39]">
                  <Filter className="h-8 w-8 text-slate-700 mb-2" />
                  <p className="text-xs text-slate-600 font-mono uppercase">No Entry Rules</p>
                </div>
              ) : (
                entryRules.map((rule, index) => (
                  <RuleRow
                    key={index}
                    type="entry"
                    rule={rule}
                    index={index}
                    toggleHandler={() => updateEntryRule(index, { enabled: !rule.enabled })}
                    removeHandler={() => removeEntryRule(index)}
                    updateHandler={(u) => updateEntryRule(index, u)}
                    isExpanded={expandedRuleId === `entry-${index}`}
                  />
                ))
              )}
            </div>
          )}

          {/* Exit Rules List */}
          {activeTab === 'exit' && (
            <div className="flex flex-col">
              {exitRules.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 border-b border-[#2A2E39]">
                  <Shield className="h-8 w-8 text-slate-700 mb-2" />
                  <p className="text-xs text-slate-600 font-mono uppercase">No Exit Rules</p>
                </div>
              ) : (
                exitRules.map((rule, index) => (
                  <RuleRow
                    key={index}
                    type="exit"
                    rule={rule}
                    index={index}
                    toggleHandler={() => updateExitRule(index, { enabled: !rule.enabled })}
                    removeHandler={() => removeExitRule(index)}
                    updateHandler={(u) => updateExitRule(index, u)}
                    isExpanded={expandedRuleId === `exit-${index}`}
                  />
                ))
              )}
            </div>
          )}

          {/* Filter Rules List */}
          {activeTab === 'filter' && (
            <div className="flex flex-col">
              {filterRules.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 border-b border-[#2A2E39]">
                  <Ban className="h-8 w-8 text-slate-700 mb-2" />
                  <p className="text-xs text-slate-600 font-mono uppercase">No Filters</p>
                </div>
              ) : (
                filterRules.map((rule, index) => (
                  <RuleRow
                    key={index}
                    type="filter"
                    rule={rule}
                    index={index}
                    toggleHandler={() => updateFilterRule(index, { enabled: !rule.enabled })}
                    removeHandler={() => removeFilterRule(index)}
                    updateHandler={(u) => updateFilterRule(index, u)}
                    isExpanded={expandedRuleId === `filter-${index}`}
                  />
                ))
              )}
            </div>
          )}

          {/* Bottom Spacing for Scroll */}
          <div className="h-4" />

        </ScrollArea>
      </div>

      {/* --- FOOTER ACTIONS --- */}
      <div className="h-10 border-t border-[#2A2E39] bg-[#1E222D] flex items-center px-3 shrink-0">
        <Button
          onClick={activeTab === 'entry' ? addEntryRule : activeTab === 'exit' ? addExitRule : addFilterRule}
          className="w-full h-7 bg-[#2962FF]/10 hover:bg-[#2962FF]/20 text-blue-400 hover:text-blue-300 border border-[#2962FF]/30 rounded-sm text-[10px] font-bold uppercase tracking-wide transition-colors"
          variant="ghost"
        >
          <Plus className="h-3.5 w-3.5 ml-1.5" />
          Add New Rule
        </Button>
      </div>

    </div>
  );
}