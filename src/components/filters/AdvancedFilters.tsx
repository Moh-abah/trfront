
// @ts-nocheck

'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { FilterCriteria, FilterCondition, FilterGroup } from '../../types/filter.types';
import { ConditionRow } from './ConditionRow';
export type MarketType = 'crypto' | 'stocks' | 'all';

interface AdvancedFiltersProps {
    criteria: FilterCriteria;
    onChange: (criteria: FilterCriteria) => void;
    onSaveAsPreset?: () => void;
    onClose?: () => void;
    // market: 'crypto' | 'stocks';
    className?: string;
    market: MarketType;
    
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
    criteria,
    onChange,
    onSaveAsPreset,
    onClose,
    market,
    className = ''
}) => {
    const [logic, setLogic] = useState<'AND' | 'OR'>(criteria.logic);

    const handleConditionChange = (index: number, condition: FilterCondition) => {
        const newConditions = [...criteria.conditions];
        newConditions[index] = condition;
        onChange({ ...criteria, conditions: newConditions });
    };

    const handleAddCondition = () => {
        const newCondition: FilterCondition = {
            field: 'price',
            operator: 'greater_than',
            value: 0
        };
        onChange({
            ...criteria,
            conditions: [...criteria.conditions, newCondition]
        });
    };

    const handleRemoveCondition = (index: number) => {
        const newConditions = criteria.conditions.filter((_, i) => i !== index);
        onChange({ ...criteria, conditions: newConditions });
    };

    const handleAddGroup = () => {
        const newGroup: FilterGroup = {
            conditions: [{ field: 'price', operator: 'greater_than', value: 0 }],
            logic: 'AND'
        };
        onChange({
            ...criteria,
            groups: [...(criteria.groups || []), newGroup]
        });
    };

    const handleGroupChange = (index: number, group: FilterGroup) => {
        const newGroups = [...(criteria.groups || [])];
        newGroups[index] = group;
        onChange({ ...criteria, groups: newGroups });
    };

    const handleRemoveGroup = (index: number) => {
        const newGroups = (criteria.groups || []).filter((_, i) => i !== index);
        onChange({ ...criteria, groups: newGroups });
    };

    const handleLogicChange = (newLogic: 'AND' | 'OR') => {
        setLogic(newLogic);
        onChange({ ...criteria, logic: newLogic });
    };

    return (
        <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced Filters</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Create complex filtering rules for {market} symbols
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {onSaveAsPreset && (
                        <button
                            onClick={onSaveAsPreset}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            Save Preset
                        </button>
                    )}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4">
                {/* Logic Selector */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Match Conditions Using:
                    </label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleLogicChange('AND')}
                            className={`px-4 py-2 rounded-lg border ${logic === 'AND'
                                    ? 'bg-blue-500 text-white border-blue-500'
                                    : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            ALL Conditions (AND)
                        </button>
                        <button
                            onClick={() => handleLogicChange('OR')}
                            className={`px-4 py-2 rounded-lg border ${logic === 'OR'
                                    ? 'bg-blue-500 text-white border-blue-500'
                                    : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            ANY Condition (OR)
                        </button>
                    </div>
                </div>

                {/* Main Conditions */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900 dark:text-white">Conditions</h4>
                        <button
                            onClick={handleAddCondition}
                            className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                            <Plus className="w-4 h-4" />
                            Add Condition
                        </button>
                    </div>

                    <div className="space-y-3">
                        {criteria.conditions.map((condition, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <ConditionRow
                                    condition={condition}
                                    onChange={(newCondition) => handleConditionChange(index, newCondition)}
                                    market={market}
                                />
                                <button
                                    onClick={() => handleRemoveCondition(index)}
                                    className="p-2 text-red-500 hover:text-red-600 dark:hover:text-red-400"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}

                        {criteria.conditions.length === 0 && (
                            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                No conditions added. Add your first condition to start filtering.
                            </div>
                        )}
                    </div>
                </div>

                {/* Condition Groups */}
                {criteria.groups && criteria.groups.length > 0 && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900 dark:text-white">Condition Groups</h4>
                            <button
                                onClick={handleAddGroup}
                                className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                            >
                                <Plus className="w-4 h-4" />
                                Add Group
                            </button>
                        </div>

                        <div className="space-y-4">
                            {criteria.groups.map((group, groupIndex) => (
                                <div key={groupIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h5 className="font-medium text-gray-900 dark:text-white">
                                            Group {groupIndex + 1}
                                        </h5>
                                        <button
                                            onClick={() => handleRemoveGroup(groupIndex)}
                                            className="p-1 text-red-500 hover:text-red-600 dark:hover:text-red-400"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Group conditions here - simplified for brevity */}
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Group with {group.conditions.length} conditions
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};