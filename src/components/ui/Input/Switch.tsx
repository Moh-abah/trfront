'use client';

import React, { useState, useEffect } from 'react';

export interface SwitchProps {
    checked?: boolean;
    defaultChecked?: boolean;
    onChange?: (checked: boolean) => void;
    label?: string;
    disabled?: boolean;
    className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
    checked: controlledChecked,
    defaultChecked = false,
    onChange,
    label,
    disabled = false,
    className = ''
}) => {
    // Use internal state if uncontrolled, controlled state if checked prop is provided
    const [internalChecked, setInternalChecked] = useState(defaultChecked);

    const isControlled = controlledChecked !== undefined;
    const checked = isControlled ? controlledChecked : internalChecked;

    const handleToggle = () => {
        if (!disabled) {
            const newValue = !checked;

            if (!isControlled) {
                setInternalChecked(newValue);
            }

            onChange?.(newValue);
        }
    };

    // Sync internal state if defaultChecked changes
    useEffect(() => {
        if (!isControlled) {
            setInternalChecked(defaultChecked);
        }
    }, [defaultChecked, isControlled]);

    return (
        <div className={`flex items-center ${className}`}>
            {label && (
                <span className="mr-3 text-sm font-medium text-gray-700">
                    {label}
                </span>
            )}

            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={handleToggle}
                className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    ${checked ? 'bg-blue-600' : 'bg-gray-200'}
                    ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                `}
            >
                <span
                    className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${checked ? 'translate-x-6' : 'translate-x-1'}
                    `}
                />
            </button>
        </div>
    );
};

export default Switch;