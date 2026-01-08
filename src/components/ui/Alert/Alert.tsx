'use client';

import React from 'react';
import { cn } from '../../../utils/helpers/string.helpers';
import { X } from 'lucide-react';

export type AlertVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

export interface AlertProps {
    variant?: AlertVariant;
    title?: string;
    message: string;
    onClose?: () => void;
    className?: string;
    icon?: React.ReactNode;
    dismissible?: boolean;
    action?: React.ReactNode;
    type?:any
}

const variantStyles: Record<AlertVariant, string> = {
    default: 'bg-gray-50 border-gray-200 text-gray-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
};

const variantIcons: Record<AlertVariant, React.ReactNode> = {
    default: null,
    success: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
    ),
    warning: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
    ),
    error: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
    ),
    info: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
    )
};

export const Alert: React.FC<AlertProps> = ({
    variant = 'default',
    title,
    message,
    onClose,
    className,
    icon,
    dismissible = false,
    action,
    type
}) => {
    return (
        <div
            className={cn(
                'relative border rounded-lg p-4',
                variantStyles[variant],
                className
            )}
            role="alert"
        >
            <div className="flex items-start">
                {icon || variantIcons[variant] ? (
                    <div className="flex-shrink-0 mr-3">
                        {icon || variantIcons[variant]}
                    </div>
                ) : null}

                <div className="flex-1">
                    {title && (
                        <h3 className="font-medium mb-1">{title}</h3>
                    )}
                    <p className="text-sm">{message}</p>

                    {action && (
                        <div className="mt-3">
                            {action}
                        </div>
                    )}
                </div>

                {dismissible && onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-shrink-0 ml-3 -mr-1.5 -mt-1.5 p-1.5 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Alert;