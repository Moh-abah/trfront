'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Filter, Check } from 'lucide-react';
import { FilterPreset } from '../../types/filter.types';

interface FilterDropdownProps {
    presets: FilterPreset[];
    activePreset?: FilterPreset;
    onPresetSelect: (preset: FilterPreset) => void;
    onNewPreset?: () => void;
    onManagePresets?: () => void;
    label?: string;
    className?: string;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
    presets,
    activePreset,
    onPresetSelect,
    onNewPreset,
    onManagePresets,
    label = 'Filter Presets',
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handlePresetSelect = (preset: FilterPreset) => {
        onPresetSelect(preset);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
                <Filter className="w-4 h-4" />
                <span className="font-medium">{label}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                    <div className="py-1">
                        {/* Presets Header */}
                        <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Saved Presets</p>
                        </div>

                        {/* Presets List */}
                        <div className="max-h-60 overflow-y-auto">
                            {presets.map((preset) => (
                                <button
                                    key={preset.id}
                                    onClick={() => handlePresetSelect(preset)}
                                    className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <div className="flex-1">
                                        <p className="font-medium text-sm text-gray-900 dark:text-white">
                                            {preset.name}
                                        </p>
                                        {preset.description && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                {preset.description}
                                            </p>
                                        )}
                                    </div>
                                    {activePreset?.id === preset.id && (
                                        <Check className="w-4 h-4 text-blue-500" />
                                    )}
                                </button>
                            ))}

                            {presets.length === 0 && (
                                <div className="px-3 py-4 text-center">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">No presets saved</p>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="border-t border-gray-100 dark:border-gray-700">
                            {onNewPreset && (
                                <button
                                    onClick={() => {
                                        onNewPreset();
                                        setIsOpen(false);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Save Current as Preset
                                </button>
                            )}
                            {onManagePresets && (
                                <button
                                    onClick={() => {
                                        onManagePresets();
                                        setIsOpen(false);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Manage Presets
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};