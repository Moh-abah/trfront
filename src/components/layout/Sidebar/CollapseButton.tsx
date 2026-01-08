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
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
            {collapsed ? (
                <FiChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
                <FiChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
        </button>
    );
};

export default CollapseButton;