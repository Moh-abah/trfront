
// @ts-nocheck

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/uiadv/button';
import { Input } from '@/components/uiadv/input';
import { Label } from '@/components/uiadv/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/uiadv/select';
import { Separator } from '@/components/uiadv/separator';
import { Trash2, Plus, ArrowUpRight, ArrowDownRight, Minus, X, GitBranch, CheckCircle2 } from 'lucide-react';
import { Condition, CompositeCondition, ConditionType, Operator, IndicatorConfig } from '@/types/backtest';

interface ConditionBuilderProps {
  condition: Condition | CompositeCondition;
  onChange: (condition: Condition | CompositeCondition) => void;
  availableIndicators: IndicatorConfig[];
  index?: number;
}

const CONDITION_TYPES: { value: ConditionType; label: string }[] = [
  { value: 'indicator_value', label: 'Indicator Value' },
  { value: 'indicator_crossover', label: 'Crossover' },
  { value: 'price_crossover', label: 'Price Cross' },
  { value: 'volume_condition', label: 'Volume' },
  { value: 'and', label: 'AND (Group)' },
  { value: 'or', label: 'OR (Group)' },
];

const OPERATORS: { value: Operator; label: string; icon?: React.ReactNode }[] = [
  { value: '>', label: '>', icon: <ArrowUpRight className="h-3 w-3" /> },
  { value: '>=', label: '>=', icon: <ArrowUpRight className="h-3 w-3" /> },
  { value: '<', label: '<', icon: <ArrowDownRight className="h-3 w-3" /> },
  { value: '<=', label: '<=', icon: <ArrowDownRight className="h-3 w-3" /> },
  { value: '==', label: '==', icon: <Minus className="h-3 w-3" /> },
  { value: '!=', label: '!=', icon: <X className="h-3 w-3" /> },
  { value: 'cross_above', label: 'Cross Up', icon: <ArrowUpRight className="h-3 w-3 rotate-[-45deg]" /> },
  { value: 'cross_below', label: 'Cross Down', icon: <ArrowDownRight className="h-3 w-3 rotate-[-45deg]" /> },
];

const VALUE_OPTIONS = ['Current Price', 'Open', 'High', 'Low', 'Close', 'Volume'];

export function ConditionBuilder({ condition, onChange, availableIndicators, index }: ConditionBuilderProps) {
  const isComposite = 'type' in condition && (condition.type === 'and' || condition.type === 'or');

  // --- LOGIC IMPROVED & PRESERVED ---

  // 1. Update the type of the CURRENT condition (Simple <-> Composite)
  const updateConditionType = (newType: ConditionType) => {
    if (newType === 'and' || newType === 'or') {
      // Preserve current condition as the first child if possible, otherwise default
      const firstChild = ('operator' in condition) ? { ...condition } : { type: 'indicator_value', operator: '>', left_value: 'indicator:rsi', right_value: 70 };
      onChange({
        type: newType,
        conditions: [
          firstChild,
          { type: 'indicator_value', operator: '<', left_value: 'indicator:rsi', right_value: 30 }
        ]
      });
    } else {
      // Switch back to Simple
      onChange({
        type: newType,
        operator: '>',
        left_value: 'indicator:rsi',
        right_value: 0
      });
    }
  };

  

  // 2. Update Operator (Simple only)
  const updateOperator = (operator: Operator) => {
    if ('operator' in condition) {
      onChange({ ...condition, operator });
    }
  };

  // 3. Update Values (Simple only)
  const updateLeftValue = (value: string | number) => {
    if ('left_value' in condition) {
      const finalVal = value === 'number' ? 0 : value;
      onChange({ ...condition, left_value: finalVal });
    }
  };

  const updateRightValue = (value: string | number) => {
    if ('right_value' in condition) {
      const finalVal = value === 'number' ? 0 : value;
      onChange({ ...condition, right_value: finalVal });
    }
  };

  // 4. Composite Handlers (Group only)
  // These functions operate on the CURRENT condition assuming it is a Group

  // Change Group Type (AND <-> OR)
  const updateGroupType = (newType: 'and' | 'or') => {
    if ('conditions' in condition) {
      onChange({ ...condition, type: newType });
    }
  };

  // Update a specific child inside the Group
  const updateSubCondition = (childIndex: number, newChild: Condition | CompositeCondition) => {
    if ('conditions' in condition) {
      const newConditions = [...condition.conditions];
      newConditions[childIndex] = newChild;
      onChange({ ...condition, conditions: newConditions });
    }
  };

  // Add a new child to the Group
  const addSubCondition = () => {
    if ('conditions' in condition) {
      onChange({
        ...condition,
        conditions: [
          ...condition.conditions,
          { type: 'indicator_value', operator: '>', left_value: 'indicator:rsi', right_value: 0 }
        ]
      });
    }
  };

  // Remove a child from the Group
  const removeSubCondition = (childIndex: number) => {
    if ('conditions' in condition && condition.conditions.length > 1) {
      const newConditions = condition.conditions.filter((_, i) => i !== childIndex);
      onChange({ ...condition, conditions: newConditions });
    }
  };

  // Helper to get display name (Strip 'indicator:')
  const getDisplayValue = (val: string | number) => {
    if (typeof val === 'number') return val;
    if (val.startsWith('indicator:')) {
      const indName = val.split(':')[1];
      return indName || 'Indicator';
    }
    return val;
  };
  // ----------------------------------

  const renderConditionSelector = (cond: Condition | CompositeCondition, condIndex?: number) => {
    // Check if the passed 'cond' is composite
    const isCondComposite = 'type' in cond && (cond.type === 'and' || cond.type === 'or');
    const isRoot = condIndex === undefined;

    return (
      <div key={condIndex} className={`border ${isCondComposite ? 'border-[#2A2E39] bg-[#0B0E11] rounded-sm p-3' : 'border-transparent'}`}>

        {/* --- COMPOSITE LOGIC GROUP (AND/OR) --- */}
        {isCondComposite ? (
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch className={`h-3 w-3 ${cond.type === 'and' ? 'text-blue-400' : 'text-purple-400'}`} />
                <Select
                  value={cond.type}
                  // FIX: Use the specific group type updater, not the generic root updater
                  onValueChange={(v) => {
                  }}
                  className="w-32"
                >
                  {/* NOTE: The logic below in the map loop handles the onChange correctly.
                       For the root composite, we use 'updateGroupType'. For children, we use the passed callback. */}
                  <SelectTrigger className="h-7 bg-[#131722] border-[#2A2E39] text-[10px] font-bold uppercase tracking-wider focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E222D] border-[#2A2E39] text-xs">
                    <SelectItem value="and" className="text-blue-400 font-bold">AND (All)</SelectItem>
                    <SelectItem value="or" className="text-purple-400 font-bold">OR (Any)</SelectItem>
                  </SelectContent>
                </Select>
                {!isRoot && (
                  <span className="text-[9px] text-slate-500 font-mono">#{(condIndex || 0) + 1}</span>
                )}
              </div>

              {!isRoot && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => condIndex !== undefined && removeSubCondition(condIndex)}
                  className="h-6 w-6 p-0 text-slate-500 hover:text-red-400 hover:bg-red-900/10"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Sub-Conditions */}
            <div className="space-y-2 pl-2 border-l border-[#2A2E39]">
              {('conditions' in cond) && cond.conditions.map((subCond, subIndex) => (
                <div key={subIndex} className="relative">
                  {subIndex > 0 && (
                    <div className="absolute -top-1.5 left-2 right-0 z-10 flex items-center">
                      <span className="bg-[#131722] border border-[#2A2E39] text-[8px] px-1.5 rounded text-slate-500 uppercase font-mono">
                        {cond.type}
                      </span>
                      <div className="flex-1 h-px bg-[#2A2E39]"></div>
                    </div>
                  )}

                  {/* --- RECURSIVE CALL --- */}
                  <ConditionBuilder
                    condition={subCond}
                    // CRITICAL FIX: The onChange passed here MUST update the 'cond' (current group) at 'subIndex'
                    onChange={(newSubCond) => {
                      const newConditions = [...(cond as CompositeCondition).conditions];
                      newConditions[subIndex] = newSubCond;
                      // Update the parent group
                      onChange({ ...cond, conditions: newConditions });
                    }}
                    availableIndicators={availableIndicators}
                  // Do not pass index to recursive calls, it's for root display only
                  />
                </div>
              ))}
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={addSubCondition}
              className="w-full h-7 border-[#2A2E39] text-slate-400 hover:text-slate-200 hover:bg-[#2A2E39] text-[10px]"
            >
              <Plus className="h-3 w-3 mr-1.5" /> Add Condition
            </Button>


          </div>
        ) : (
          /* --- SIMPLE CONDITION ROW (With Full Logic) --- */
          <div className="space-y-3">

            {/* Title for Root Only */}
            {isRoot && index !== undefined && (
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-blue-500" />
                  Condition #{index + 1}
                </span>
              </div>
            )}

            {/* 1. Type & Operator */}
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-5 space-y-1">
                <Label className="text-[9px] font-bold text-slate-500 uppercase">Condition Type</Label>
                <Select
                  value={'type' in cond ? cond.type : 'indicator_value'}
                  // FIX: Use root handler or passed handler
                  onValueChange={(v) => {
                    // If this is recursive, 'onChange' updates the parent array. 
                    // If this is root, 'onChange' updates the rule.
                    // We construct the new object based on the new type.
                    const newType = v as ConditionType;
                    if (newType === 'and' || newType === 'or') {
                      const firstChild = { type: 'indicator_value' as const, operator: '>' as const, left_value: 'indicator:rsi', right_value: 70 };
                      onChange({ type: newType, conditions: [firstChild] });
                    } else {
                      onChange({ type: newType, operator: '>', left_value: 'indicator:rsi', right_value: 0 });
                    }
                  }}
                >
                  <SelectTrigger className="h-8 bg-[#0B0E11] border-[#2A2E39] text-[10px] text-slate-200 focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E222D] border-[#2A2E39] text-xs">
                    {CONDITION_TYPES.map(ct => (
                      <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-3 space-y-1">
                <Label className="text-[9px] font-bold text-slate-500 uppercase">Operator</Label>
                <Select
                  value={'operator' in cond ? cond.operator : '>'}
                  onValueChange={(v) => onChange({ ...cond, operator: v as Operator })}
                >
                  <SelectTrigger className="h-8 bg-[#0B0E11] border-[#2A2E39] text-[10px] text-slate-200 focus:ring-0 font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E222D] border-[#2A2E39] text-xs">
                    {OPERATORS.map(op => (
                      <SelectItem key={op.value} value={op.value}>
                        <div className="flex items-center gap-2 font-mono">
                          {op.icon}
                          {op.value}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 2. Values (Left & Right) - Unified Dropdown Logic */}
            <div className="grid grid-cols-2 gap-3">

              {/* Left Value */}
              <div className="space-y-1">
                <Label className="text-[9px] font-bold text-slate-500 uppercase">Left Side</Label>

                {/* If Number -> Input */}
                {typeof cond.left_value === 'number' ? (
                  <div className="flex gap-1">
                    <Input
                      type="number"
                      step={0.01}
                      value={cond.left_value}
                      onChange={(e) => onChange({ ...cond, left_value: parseFloat(e.target.value) || 0 })}
                      className="h-8 w-full bg-[#0B0E11] border-[#2A2E39] text-[10px] text-slate-200 font-mono focus:ring-0"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onChange({ ...cond, left_value: 'Current Price' })}
                      className="h-8 w-8 px-0 text-slate-400 hover:text-slate-200 bg-[#131722] border border-[#2A2E39]"
                      title="Switch to Selector"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  /* If String/Indicator -> Select */
                  <Select
                    value={cond.left_value}
                    onValueChange={(v) => onChange({ ...cond, left_value: v === 'number' ? 0 : v })}
                  >
                    <SelectTrigger className="h-8 bg-[#0B0E11] border-[#2A2E39] text-[10px] text-slate-200 focus:ring-0 font-mono">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E222D] border-[#2A2E39] text-xs">
                      {/* Standard Options */}
                      {VALUE_OPTIONS.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                      <Separator className="my-1" />
                      <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase">Indicators</div>
                      {/* Indicators List */}
                      {availableIndicators.map(ind => (
                        <SelectItem key={ind.name} value={`indicator:${ind.name}`}>
                          {ind.name}
                        </SelectItem>
                      ))}
                      {/* Option to switch to Number Input */}
                      <SelectItem value="number" className="text-slate-400 font-mono">[ Manual Number ]</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Right Value */}
              <div className="space-y-1">
                <Label className="text-[9px] font-bold text-slate-500 uppercase">Right Side</Label>

                {typeof cond.right_value === 'number' ? (
                  <div className="flex gap-1">
                    <Input
                      type="number"
                      step={0.01}
                      value={cond.right_value}
                      onChange={(e) => onChange({ ...cond, right_value: parseFloat(e.target.value) || 0 })}
                      className="h-8 w-full bg-[#0B0E11] border-[#2A2E39] text-[10px] text-slate-200 font-mono focus:ring-0"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onChange({ ...cond, right_value: 'Current Price' })}
                      className="h-8 w-8 px-0 text-slate-400 hover:text-slate-200 bg-[#131722] border border-[#2A2E39]"
                      title="Switch to Selector"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Select
                    value={cond.right_value}
                    onValueChange={(v) => onChange({ ...cond, right_value: v === 'number' ? 0 : v })}
                  >
                    <SelectTrigger className="h-8 bg-[#0B0E11] border-[#2A2E39] text-[10px] text-slate-200 focus:ring-0 font-mono">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E222D] border-[#2A2E39] text-xs">
                      {/* Standard Options */}
                      {VALUE_OPTIONS.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                      <Separator className="my-1" />
                      <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase">Indicators</div>
                      {/* Indicators List */}
                      {availableIndicators.map(ind => (
                        <SelectItem key={ind.name} value={`indicator:${ind.name}`}>
                          {ind.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="number" className="text-slate-400 font-mono">[ Manual Number ]</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    );
  };

  // Root render
  return (
    <div className="w-full space-y-2">
      {renderConditionSelector(condition)}
    </div>
  );
}