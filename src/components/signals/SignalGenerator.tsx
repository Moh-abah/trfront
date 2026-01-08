
// @ts-nocheck









'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button/Button';
import { Loader } from '../ui/Loader/Loader';
import { Check, X } from 'lucide-react';

interface Indicator {
    name: string;
    display_name: string;
    description: string;
    category: string;
    default_params: Record<string, any>;
}

interface SignalGeneratorProps {
    onGenerate: (config: any) => void;
    onClose: () => void;
}

export function SignalGenerator({ onGenerate, onClose }: SignalGeneratorProps) {
    const [symbol, setSymbol] = useState('BTCUSD');
    const [timeframe, setTimeframe] = useState('1h');
    const [days, setDays] = useState(7);
    const [selectedIndicators, setSelectedIndicators] = useState<string[]>(['rsi', 'macd']);
    const [availableIndicators, setAvailableIndicators] = useState<Indicator[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingIndicators, setLoadingIndicators] = useState(false);
    const [indicatorParams, setIndicatorParams] = useState<Record<string, any>>({});

    // الرموز المتاحة
    const symbols = ['BTCUSD', 'ETHUSD', 'SOLUSD', 'ADAUSD', 'DOTUSD', 'MATICUSD', 'AVAXUSD'];

    // الإطارات الزمنية المتاحة
    const timeframesList = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'];

    // جلب المؤشرات المتاحة من API
    useEffect(() => {
        loadIndicators();
    }, []);

    const loadIndicators = async () => {
        setLoadingIndicators(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/indicators/available`);
            const data = await response.json();
            if (data.indicators) {
                setAvailableIndicators(data.indicators);

                // تعيين المعلمات الافتراضية للمؤشرات المختارة
                const params: Record<string, any> = {};
                data.indicators.forEach((indicator: Indicator) => {
                    if (selectedIndicators.includes(indicator.name)) {
                        params[indicator.name] = indicator.default_params;
                    }
                });
                setIndicatorParams(params);
            }
        } catch (error) {
            console.error('Failed to load indicators:', error);
        } finally {
            setLoadingIndicators(false);
        }
    };

    const handleIndicatorToggle = (indicatorName: string) => {
        setSelectedIndicators(prev => {
            if (prev.includes(indicatorName)) {
                // إزالة المؤشر
                const newParams = { ...indicatorParams };
                delete newParams[indicatorName];
                setIndicatorParams(newParams);
                return prev.filter(name => name !== indicatorName);
            } else {
                // إضافة المؤشر مع المعلمات الافتراضية
                const indicator = availableIndicators.find(i => i.name === indicatorName);
                if (indicator) {
                    setIndicatorParams(prev => ({
                        ...prev,
                        [indicatorName]: indicator.default_params
                    }));
                }
                return [...prev, indicatorName];
            }
        });
    };

    const handleParamChange = (indicatorName: string, paramName: string, value: any) => {
        setIndicatorParams(prev => ({
            ...prev,
            [indicatorName]: {
                ...prev[indicatorName],
                [paramName]: value
            }
        }));
    };

    const handleGenerate = async () => {
        setLoading(true);
        try {
            // إعداد كوينفيج المؤشرات
            const indicatorsConfig = selectedIndicators.map(name => ({
                name,
                params: indicatorParams[name] || {},
                enabled: true
            }));

            const config = {
                symbol,
                timeframe,
                market: 'crypto',
                indicators: indicatorsConfig,
                days
            };

            await onGenerate(config);
        } catch (error) {
            console.error('Error generating signals:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIndicatorDisplayName = (name: string) => {
        const indicator = availableIndicators.find(i => i.name === name);
        return indicator?.display_name || name;
    };

    const getIndicatorDescription = (name: string) => {
        const indicator = availableIndicators.find(i => i.name === name);
        return indicator?.description || '';
    };

    const renderIndicatorParams = (indicatorName: string) => {
        const params = indicatorParams[indicatorName];
        if (!params) return null;

        return (
            <div className="ml-4 mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Parameters:
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {Object.entries(params).map(([paramName, paramValue]) => (
                        <div key={paramName} className="space-y-1">
                            <label className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                                {paramName.replace(/_/g, ' ')}
                            </label>
                            <input
                                type="number"
                                value={paramValue}
                                onChange={(e) => handleParamChange(indicatorName, paramName, parseFloat(e.target.value))}
                                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Symbol Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Symbol
                </label>
                <select
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                >
                    {symbols.map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            {/* Timeframe Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Timeframe
                </label>
                <select
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                >
                    {timeframesList.map(tf => (
                        <option key={tf} value={tf}>{tf}</option>
                    ))}
                </select>
            </div>

            {/* Days Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Historical Data (Days)
                </label>
                <div className="flex items-center gap-3">
                    <input
                        type="range"
                        min="1"
                        max="365"
                        value={days}
                        onChange={(e) => setDays(parseInt(e.target.value))}
                        className="flex-1"
                    />
                    <span className="text-sm font-medium w-12">{days} days</span>
                </div>
            </div>

            {/* Indicators Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Indicators
                </label>

                {loadingIndicators ? (
                    <div className="p-4 text-center">
                        <Loader text="Loading indicators..." />
                    </div>
                ) : (
                    <>
                        {/* Available Indicators */}
                        <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2">
                            {availableIndicators.map((indicator) => (
                                <button
                                    key={indicator.name}
                                    type="button"
                                    onClick={() => handleIndicatorToggle(indicator.name)}
                                    className={`p-3 rounded-lg border text-left transition-all ${selectedIndicators.includes(indicator.name)
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`font-medium ${selectedIndicators.includes(indicator.name)
                                                ? 'text-blue-600 dark:text-blue-400'
                                                : 'text-gray-900 dark:text-white'
                                            }`}>
                                            {indicator.display_name}
                                        </span>
                                        {selectedIndicators.includes(indicator.name) ? (
                                            <Check className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <X className="w-4 h-4 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {indicator.category}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Selected Indicators with Parameters */}
                        {selectedIndicators.length > 0 && (
                            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Selected Indicators ({selectedIndicators.length})
                                </h3>
                                <div className="space-y-3">
                                    {selectedIndicators.map(indicatorName => (
                                        <div key={indicatorName} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                                            <div className="flex justify-between items-center mb-2">
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {getIndicatorDisplayName(indicatorName)}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {getIndicatorDescription(indicatorName)}
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleIndicatorToggle(indicatorName)}
                                                    className="text-red-500 hover:text-red-700 text-sm"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                            {renderIndicatorParams(indicatorName)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Summary */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                    Generation Summary
                </h3>
                <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                    <li>• Symbol: {symbol}</li>
                    <li>• Timeframe: {timeframe}</li>
                    <li>• Historical Data: {days} days</li>
                    <li>• Selected Indicators: {selectedIndicators.length}</li>
                    <li>• Market: Crypto</li>
                </ul>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={handleGenerate}
                    loading={loading}
                    disabled={selectedIndicators.length === 0 || loading}
                    icon={loading ? undefined : <Check className="w-4 h-4" />}
                >
                    {loading ? 'Generating...' : 'Generate Signals'}
                </Button>
            </div>
        </div>
    );
}