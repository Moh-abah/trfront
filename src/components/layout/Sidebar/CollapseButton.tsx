// src/components/layout/Sidebar/CollapseButton.tsx
'use client';

import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface CollapseButtonProps {
    collapsed: boolean;
    onToggle: () => void;
}

export const CollapseButton: React.FC<CollapseButtonProps> = ({
    collapsed,
    onToggle
}) => {
    return (
        <button
            onClick={onToggle}
            className="
        group relative p-2 rounded-lg 
        bg-gradient-to-br from-muted/50 to-background
        dark:from-gray-800/50 dark:to-gray-300
        border border-border/50
        hover:border-primary/50
        text-muted-foreground
        hover:text-primary
        transition-all duration-300
        hover:shadow-lg hover:shadow-primary/5
        overflow-hidden
        focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-1
    "
        >
            {/* تأثير خلفي متحرك */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent 
                    translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

            {collapsed ? (
                <FiChevronRight className="w-5 h-5 relative z-10" />
            ) : (
                <FiChevronLeft className="w-5 h-5 relative z-10" />
            )}

            {/* Tooltip افتراضي */}
            <span className="
        absolute left-full top-1/2 -translate-y-1/2 ml-2
        px-2 py-1 text-xs font-medium
        bg-gray-900 dark:bg-gray-700 text-white rounded
        opacity-0 group-hover:opacity-100
        transition-opacity duration-200
        pointer-events-none whitespace-nowrap
        z-50
    ">
                {collapsed ? "Expand sidebar" : "Collapse sidebar"}
            </span>
        </button>
    );
};

export default CollapseButton;