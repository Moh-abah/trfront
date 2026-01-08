
import React from 'react';
interface LoaderProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    text?: string; // أضف هذا السطر
}

export const Loader: React.FC<LoaderProps> = ({
    size = 'md',
    className = '',
    text // أضف هذا
}) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    return (
        <div className={`inline-block ${className}`}>
            <svg
                className={`animate-spin ${sizes[size]}`}
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                />
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
            </svg>
            {text && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {text}
                </p>
            )}
        </div>
    );
};