'use client';

import React from 'react';
import { cn } from '../../../utils/helpers/string.helpers';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'outlined' | 'elevated' | 'filled';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hoverEffect?: boolean;
    clickable?: boolean;
    disabled?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({
        className,
        variant = 'default',
        padding = 'md',
        hoverEffect = false,
        clickable = false,
        disabled = false,
        children,
        ...props
    }, ref) => {
        const variants = {
            default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
            outlined: 'border border-gray-300 dark:border-gray-600 bg-transparent',
            elevated: 'bg-white dark:bg-gray-800 shadow-lg',
            filled: 'bg-gray-50 dark:bg-gray-900'
        };

        const paddings = {
            none: '',
            sm: 'p-3',
            md: 'p-5',
            lg: 'p-7'
        };

        return (
            <div
                ref={ref}
                className={cn(
                    'rounded-lg transition-all duration-200',
                    variants[variant],
                    paddings[padding],
                    hoverEffect && 'hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600',
                    clickable && !disabled && 'cursor-pointer hover:scale-[1.01] active:scale-[0.99]',
                    disabled && 'opacity-50 cursor-not-allowed',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

// Card Header Component
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    subtitle?: string;
    action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
    className,
    title,
    subtitle,
    action,
    children,
    ...props
}) => {
    return (
        <div className={cn('mb-4', className)} {...props}>
            {(title || subtitle || action) && (
                <div className="flex items-start justify-between mb-2">
                    <div>
                        {title && (
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {title}
                            </h3>
                        )}
                        {subtitle && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    {action && <div>{action}</div>}
                </div>
            )}
            {children}
        </div>
    );
};

// Card Body Component
export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className,
    children,
    ...props
}) => {
    return (
        <div className={cn('text-gray-700 dark:text-gray-300', className)} {...props}>
            {children}
        </div>
    );
};

// Card Footer Component
export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className,
    children,
    ...props
}) => {
    return (
        <div className={cn('mt-4 pt-4 border-t border-gray-200 dark:border-gray-700', className)} {...props}>
            {children}
        </div>
    );
};

// Card Section Component
export const CardSection: React.FC<React.HTMLAttributes<HTMLDivElement> & {
    bordered?: boolean;
}> = ({ className, bordered = true, children, ...props }) => {
    return (
        <div
            className={cn(
                'py-3',
                bordered && 'border-t border-gray-200 dark:border-gray-700 first:border-t-0',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

// Card Title Component
export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
    className,
    children,
    ...props
}) => {
    return (
        <h3
            className={cn(
                'text-lg font-semibold text-gray-900 dark:text-white mb-1',
                className
            )}
            {...props}
        >
            {children}
        </h3>
    );
};

// Card Description Component
export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
    className,
    children,
    ...props
}) => {
    return (
        <p
            className={cn('text-sm text-gray-500 dark:text-gray-400', className)}
            {...props}
        >
            {children}
        </p>
    );
};