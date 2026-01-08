'use client';
import React from 'react';

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step?: number;
    label?: string;
    helperText?: string;
}

export const Slider: React.FC<SliderProps> = ({
    value,
    onChange,
    min,
    max,
    step = 1,
    label,
    helperText,
    className = '',
    ...props
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(parseFloat(e.target.value));
    };

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {label} ({value})
                </label>
            )}
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={handleChange}
                className={`
          w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-blue-500
          ${className}
        `}
                {...props}
            />
            {helperText && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
            )}
        </div>
    );
};