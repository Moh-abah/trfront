'use client';
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
    label?: string;
    helperText?: string;
    leftElement?: React.ReactNode;
    rightElement?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
    error,
    label,
    helperText,
    leftElement,
    rightElement,
    className = '',
    ...props
}) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {label}
                </label>
            )}
            <div className="relative">
                {leftElement && (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        {leftElement}
                    </div>
                )}
                <input
                    className={`
            w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
            ${leftElement ? 'pl-10' : ''}
            ${rightElement ? 'pr-10' : ''}
            ${error
                            ? 'border-red-500 dark:border-red-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-white
            ${className}
          `}
                    {...props}
                />
                {rightElement && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        {rightElement}
                    </div>
                )}
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            {helperText && !error && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
            )}
        </div>
    );
};