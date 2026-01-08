'use client';
import React, { useState, useEffect } from 'react';
import { FilterCondition } from '../../types/filter.types';

const OPERATORS = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'greater_than_or_equal', label: 'Greater Than or Equal' },
    { value: 'less_than_or_equal', label: 'Less Than or Equal' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Does Not Contain' },
    { value: 'starts_with', label: 'Starts With' },
    { value: 'ends_with', label: 'Ends With' },
    { value: 'between', label: 'Between' },
    { value: 'is_null', label: 'Is Empty' },
    { value: 'is_not_null', label: 'Is Not Empty' }
];

const MARKET_FIELDS = {
    crypto: [
        { value: 'price', label: 'Price', type: 'number' },
        { value: 'volume_24h', label: '24h Volume', type: 'number' },
        { value: 'market_cap', label: 'Market Cap', type: 'number' },
        { value: 'change_24h', label: '24h Change %', type: 'number' },
        { value: 'rsi', label: 'RSI', type: 'number' },
        { value: 'volatility', label: 'Volatility', type: 'number' },
        { value: 'name', label: 'Name', type: 'string' },
        { value: 'symbol', label: 'Symbol', type: 'string' },
        { value: 'category', label: 'Category', type: 'select' }
    ],
    stocks: [
        { value: 'price', label: 'Price', type: 'number' },
        { value: 'volume', label: 'Volume', type: 'number' },
        { value: 'market_cap', label: 'Market Cap', type: 'number' },
        { value: 'pe_ratio', label: 'P/E Ratio', type: 'number' },
        { value: 'dividend_yield', label: 'Dividend Yield', type: 'number' },
        { value: 'beta', label: 'Beta', type: 'number' },
        { value: 'sector', label: 'Sector', type: 'select' },
        { value: 'industry', label: 'Industry', type: 'select' },
        { value: 'company_name', label: 'Company Name', type: 'string' }
    ]
};

interface ConditionRowProps {
    condition: FilterCondition;
    onChange: (condition: FilterCondition) => void;
    market: 'crypto' | 'stocks';
}

export const ConditionRow: React.FC<ConditionRowProps> = ({ condition, onChange, market }) => {
    const [selectedField, setSelectedField] = useState(condition.field);
    const [operator, setOperator] = useState(condition.operator);
    const [value, setValue] = useState(condition.value);
    const [value2, setValue2] = useState(condition.value2);

    const fields = MARKET_FIELDS[market];
    const selectedFieldConfig = fields.find(f => f.value === selectedField);
    const showSecondValue = operator === 'between' || operator === 'not_between';

    useEffect(() => {
        onChange({
            field: selectedField,
            operator,
            value,
            value2: showSecondValue ? value2 : undefined
        });
    }, [selectedField, operator, value, value2, onChange, showSecondValue]);

    const renderValueInput = () => {
        if (operator === 'is_null' || operator === 'is_not_null') {
            return null;
        }

        if (selectedFieldConfig?.type === 'select') {
            return (
                <select
                    value={value || ''}
                    onChange={(e) => setValue(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                >
                    <option value="">Select value</option>
                    {/* Add options based on field */}
                </select>
            );
        }

        if (selectedFieldConfig?.type === 'number') {
            return (
                <input
                    type="number"
                    value={value || ''}
                    onChange={(e) => setValue(e.target.value ? Number(e.target.value) : '')}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    step="any"
                />
            );
        }

        return (
            <input
                type="text"
                value={value || ''}
                onChange={(e) => setValue(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            />
        );
    };

    return (
        <div className="flex items-center gap-3 flex-wrap">
            {/* Field Selector */}
            <select
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 min-w-[150px]"
            >
                {fields.map((field) => (
                    <option key={field.value} value={field.value}>
                        {field.label}
                    </option>
                ))}
            </select>

            {/* Operator Selector */}
            <select
                value={operator}
                onChange={(e) => setOperator(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 min-w-[180px]"
            >
                {OPERATORS.map((op) => (
                    <option key={op.value} value={op.value}>
                        {op.label}
                    </option>
                ))}
            </select>

            {/* Value Input */}
            {renderValueInput()}

            {/* Second Value for Between */}
            {showSecondValue && (
                <>
                    <span className="text-gray-500 dark:text-gray-400">and</span>
                    <input
                        type={selectedFieldConfig?.type === 'number' ? 'number' : 'text'}
                        value={value2 || ''}
                        onChange={(e) => setValue2(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                        step="any"
                    />
                </>
            )}
        </div>
    );
};