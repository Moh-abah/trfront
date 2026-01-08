
// @ts-nocheck

'use client';
import React from 'react';

interface ButtonGroupProps {
    children: React.ReactNode;
    className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({ children, className = '' }) => {
    return (
        <div className={`inline-flex rounded-lg shadow-sm ${className}`} role="group">
            {React.Children.map(children, (child, index) => {
                if (React.isValidElement(child)) {
                    let roundedClass = '';
                    if (index === 0) {
                        roundedClass = 'rounded-l-lg';
                    } else if (index === React.Children.count(children) - 1) {
                        roundedClass = 'rounded-r-lg';
                    } else {
                        roundedClass = 'rounded-none';
                    }
                    return React.cloneElement(child, {
                        className: `${roundedClass} ${child.props.className || ''}`,
                    });
                }
                return child;
            })}
        </div>
    );
};