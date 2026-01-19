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
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-sm font-medium text-foreground">
                                {param.label}
                            </label>
                            {param.min !== undefined && param.max !== undefined && (
                                <span className="text-xs text-muted-foreground">
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
                                className="flex-1 px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            {param.name === 'period' && (
                                <span className="text-sm text-muted-foreground">يوم</span>
                            )}
                        </div>
                        {param.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                                {param.description}
                            </p>
                        )}
                    </div>
                );

            case 'text':
                return (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            {param.label}
                        </label>
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => handleChange(param.name, e.target.value)}
                            className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>
                );

            case 'select':
                return (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            {param.label}
                        </label>
                        <select
                            value={value}
                            onChange={(e) => handleChange(param.name, e.target.value)}
                            className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
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
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            {param.label}
                        </label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="color"
                                value={value}
                                onChange={(e) => handleChange(param.name, e.target.value)}
                                className="w-10 h-10 border border-border rounded-lg cursor-pointer bg-background"
                            />
                            <input
                                type="text"
                                value={value}
                                onChange={(e) => handleChange(param.name, e.target.value)}
                                className="flex-1 px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                    </div>
                );

            case 'boolean':
                return (
                    <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                        <div>
                            <label className="text-sm font-medium text-foreground block">
                                {param.label}
                            </label>
                            {param.description && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    {param.description}
                                </p>
                            )}
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={value}
                                onChange={(e) => handleChange(param.name, e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-12 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-card after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-card after:border after:border-border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                );

            case 'range':
                return (
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-foreground">
                                {param.label}
                            </label>
                            <span className="text-sm font-medium text-primary">{value}</span>
                        </div>
                        <input
                            type="range"
                            value={value}
                            onChange={(e) => handleChange(param.name, parseFloat(e.target.value))}
                            min={param.min}
                            max={param.max}
                            step={param.step || 1}
                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
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
                    <div key={key} className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            {key}
                        </label>
                        <input
                            type="number"
                            value={value}
                            onChange={(e) => handleChange(key, parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {parameterDefinitions.map((param: IndicatorParameter) => (
                <div key={param.name} className="space-y-3">
                    {renderInput(param, parameters[param.name] ?? param.defaultValue)}
                </div>
            ))}
        </div>
    );
};