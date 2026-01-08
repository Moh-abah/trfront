// components/charts/ConditionsPanel.tsx
'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';

interface Condition {
    id: string;
    indicator: string;
    operator: string;
    value: number;
    color: string;
}

interface ConditionsPanelProps {
    conditions: Condition[];
    onChange: (conditions: Condition[]) => void;
    symbol: string;
}

export const ConditionsPanel: React.FC<ConditionsPanelProps> = ({
    conditions = [],
    onChange,
    symbol,
}) => {
    const [newCondition, setNewCondition] = useState<Partial<Condition>>({
        indicator: 'rsi',
        operator: '>',
        value: 50,
        color: '#3b82f6',
    });

    const addCondition = () => {
        if (!newCondition.indicator || !newCondition.operator || newCondition.value === undefined) {
            return;
        }

        const condition: Condition = {
            id: Date.now().toString(),
            indicator: newCondition.indicator,
            operator: newCondition.operator,
            value: newCondition.value,
            color: newCondition.color || '#3b82f6',
        };

        onChange([...conditions, condition]);
        setNewCondition({
            indicator: 'rsi',
            operator: '>',
            value: 50,
            color: '#3b82f6',
        });
    };

    const removeCondition = (id: string) => {
        onChange(conditions.filter(cond => cond.id !== id));
    };

    const updateCondition = (id: string, updates: Partial<Condition>) => {
        onChange(conditions.map(cond =>
            cond.id === id ? { ...cond, ...updates } : cond
        ));
    };

    const operators = [
        { value: '>', label: 'Greater than' },
        { value: '<', label: 'Less than' },
        { value: '>=', label: 'Greater than or equal' },
        { value: '<=', label: 'Less than or equal' },
        { value: '==', label: 'Equal to' },
        { value: '!=', label: 'Not equal to' },
    ];

    const indicators = [
        { value: 'rsi', label: 'RSI' },
        { value: 'macd', label: 'MACD' },
        { value: 'ma', label: 'Moving Average' },
        { value: 'ema', label: 'Exponential MA' },
        { value: 'bb_upper', label: 'Bollinger Upper' },
        { value: 'bb_lower', label: 'Bollinger Lower' },
        { value: 'stoch', label: 'Stochastic' },
    ];

    const colors = [
        '#3b82f6', // blue
        '#10b981', // green
        '#ef4444', // red
        '#f59e0b', // yellow
        '#8b5cf6', // purple
        '#ec4899', // pink
    ];

    return (
        <div className="space-y-4">
            {/* عنوان اللوحة */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <h3 className="font-medium text-white">Trading Conditions</h3>
                </div>
                <span className="text-xs text-gray-400">
                    {conditions.length} condition(s)
                </span>
            </div>

            {/* إضافة شرط جديد */}
            <div className="p-3 bg-gray-800 rounded-lg">
                <div className="flex items-end gap-3">
                    <div className="flex-1">
                        <label className="block text-xs text-gray-400 mb-1">Indicator</label>
                        <select
                            value={newCondition.indicator}
                            onChange={(e) => setNewCondition({ ...newCondition, indicator: e.target.value })}
                            className="w-full bg-gray-700 text-white rounded px-3 py-1.5 text-sm"
                        >
                            {indicators.map(ind => (
                                <option key={ind.value} value={ind.value}>
                                    {ind.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1">
                        <label className="block text-xs text-gray-400 mb-1">Operator</label>
                        <select
                            value={newCondition.operator}
                            onChange={(e) => setNewCondition({ ...newCondition, operator: e.target.value })}
                            className="w-full bg-gray-700 text-white rounded px-3 py-1.5 text-sm"
                        >
                            {operators.map(op => (
                                <option key={op.value} value={op.value}>
                                    {op.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1">
                        <label className="block text-xs text-gray-400 mb-1">Value</label>
                        <input
                            type="number"
                            value={newCondition.value}
                            onChange={(e) => setNewCondition({ ...newCondition, value: parseFloat(e.target.value) })}
                            className="w-full bg-gray-700 text-white rounded px-3 py-1.5 text-sm"
                            step="0.01"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Color</label>
                        <div className="flex gap-1">
                            {colors.map(color => (
                                <button
                                    key={color}
                                    onClick={() => setNewCondition({ ...newCondition, color })}
                                    className={`w-6 h-6 rounded-full border-2 ${newCondition.color === color
                                            ? 'border-white'
                                            : 'border-transparent'
                                        }`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                    <Button
                        variant="primary"
                        size="sm"
                        onClick={addCondition}
                        leftIcon={<Plus className="w-4 h-4" />}
                    >
                        Add
                    </Button>
                </div>
            </div>

            {/* قائمة الشروط */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
                {conditions.map(condition => (
                    <div
                        key={condition.id}
                        className="p-3 bg-gray-800 rounded-lg"
                        style={{ borderLeft: `4px solid ${condition.color}` }}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: condition.color }}
                                />
                                <span className="text-sm font-medium text-white">
                                    {indicators.find(i => i.value === condition.indicator)?.label || condition.indicator}
                                </span>
                            </div>
                            <button
                                onClick={() => removeCondition(condition.id)}
                                className="text-gray-400 hover:text-red-400 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-300">When</span>
                            <span className="text-white font-medium">{condition.indicator.toUpperCase()}</span>
                            <span className="text-gray-300">
                                {operators.find(op => op.value === condition.operator)?.label || condition.operator}
                            </span>
                            <span className="text-white font-medium">{condition.value}</span>
                        </div>

                        <div className="mt-2 flex gap-2">
                            <select
                                value={condition.indicator}
                                onChange={(e) => updateCondition(condition.id, { indicator: e.target.value })}
                                className="flex-1 bg-gray-700 text-white rounded px-2 py-1 text-xs"
                            >
                                {indicators.map(ind => (
                                    <option key={ind.value} value={ind.value}>
                                        {ind.label}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={condition.operator}
                                onChange={(e) => updateCondition(condition.id, { operator: e.target.value })}
                                className="flex-1 bg-gray-700 text-white rounded px-2 py-1 text-xs"
                            >
                                {operators.map(op => (
                                    <option key={op.value} value={op.value}>
                                        {op.label}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="number"
                                value={condition.value}
                                onChange={(e) => updateCondition(condition.id, { value: parseFloat(e.target.value) })}
                                className="flex-1 bg-gray-700 text-white rounded px-2 py-1 text-xs"
                                step="0.01"
                            />
                        </div>
                    </div>
                ))}

                {conditions.length === 0 && (
                    <div className="p-4 text-center border border-dashed border-gray-700 rounded-lg">
                        <Filter className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">No conditions added yet</p>
                        <p className="text-gray-500 text-xs mt-1">
                            Add conditions to trigger trading signals
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConditionsPanel;