'use client';

import React from 'react';
import { Indicator, IndicatorParameter } from '@/lib/charts/types/indicator';

interface ParameterInputsProps {
    parameters: Record<string, any>;
    onChange: (name: string, value: any) => void;
    indicator?: Indicator;
}

export const ParameterInputs: React.FC<ParameterInputsProps> = ({
    parameters,
    onChange,
    indicator,
}) => {
    const handleChange = (paramName: string, value: any) => {
        console.log("تغيير المعلمة:", paramName, value);
        onChange(paramName, value);
    };

    const renderInput = (param: IndicatorParameter, value: any) => {
        switch (param.type) {
            case 'number':
                return (
                    <div className="space-y-1">
                        <div className="flex justify-between">
                            <label className="text-sm text-gray-600 dark:text-gray-400">
                                {param.label}
                            </label>
                            {param.min !== undefined && param.max !== undefined && (
                                <span className="text-xs text-gray-500">
                                    {param.min} - {param.max}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="number"
                                value={value}
                                onChange={(e) => handleChange(param.name, parseFloat(e.target.value))}
                                min={param.min}
                                max={param.max}
                                step={param.step || 1}
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                            {param.name === 'period' && (
                                <span className="text-sm text-gray-500">يوم</span>
                            )}
                        </div>
                        {param.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {param.description}
                            </p>
                        )}
                    </div>
                );

            case 'text':
                return (
                    <div className="space-y-1">
                        <label className="text-sm text-gray-600 dark:text-gray-400">
                            {param.label}
                        </label>
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => handleChange(param.name, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>
                );

            case 'select':
                return (
                    <div className="space-y-1">
                        <label className="text-sm text-gray-600 dark:text-gray-400">
                            {param.label}
                        </label>
                        <select
                            value={value}
                            onChange={(e) => handleChange(param.name, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            {param.options?.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                );

            case 'color':
                return (
                    <div className="space-y-1">
                        <label className="text-sm text-gray-600 dark:text-gray-400">
                            {param.label}
                        </label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="color"
                                value={value}
                                onChange={(e) => handleChange(param.name, e.target.value)}
                                className="w-10 h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                            />
                            <input
                                type="text"
                                value={value}
                                onChange={(e) => handleChange(param.name, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>
                );

            case 'boolean':
                return (
                    <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-600 dark:text-gray-400">
                            {param.label}
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={value}
                                onChange={(e) => handleChange(param.name, e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                );

            case 'range':
                return (
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-sm text-gray-600 dark:text-gray-400">
                                {param.label}
                            </label>
                            <span className="text-sm font-medium">{value}</span>
                        </div>
                        <input
                            type="range"
                            value={value}
                            onChange={(e) => handleChange(param.name, parseFloat(e.target.value))}
                            min={param.min}
                            max={param.max}
                            step={param.step || 1}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>{param.min}</span>
                            <span>{param.max}</span>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    // إذا كان لدينا مؤشر، نستخدم معالمه لإنشاء الحقول
    const parameterDefinitions = indicator?.parameters || [];

    // إذا لم يكن هناك تعريف للمعاملات، نعرض الحقول بناءً على المعلمات الحالية
    if (parameterDefinitions.length === 0 && Object.keys(parameters).length > 0) {
        return (
            <div className="space-y-4">
                {Object.entries(parameters).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {key}
                        </label>
                        <input
                            type="number"
                            value={value}
                            onChange={(e) => handleChange(key, parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {parameterDefinitions.map((param: IndicatorParameter) => (
                <div key={param.name} className="space-y-2">
                    {renderInput(param, parameters[param.name] ?? param.defaultValue)}
                </div>
            ))}
        </div>
    );
};