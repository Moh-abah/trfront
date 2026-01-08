'use client';
import React, { useState, createContext, useContext } from 'react';

interface TabsContextType {
    activeTab: string;
    setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);
interface TabItem {
    value: string;
    label: string;
    icon?: React.ReactNode;
    badge?: number | string;
    disabled?: boolean;
}

interface TabsProps {
    children?: React.ReactNode;
    defaultTab?: string;
    className?: string;
    value?: string;
    onChange?: (value: string) => void;
    tabs?: TabItem[]; // استخدام واجهة منفصلة
    fullWidth?: boolean;
}

interface TabsProps {
    children?: React.ReactNode;
    defaultTab?: string;
    className?: string;
    value?: string; // للقيمة الحالية
    onChange?: (value: string) => void; // للدالة عند التغيير
    tabs?: TabItem[];
    fullWidth?: boolean;

}

export const Tabs: React.FC<TabsProps> = ({
    children,
    defaultTab,
    className = '',
    value,
    onChange,
    tabs,
    fullWidth
}) => {
    const [activeTab, setActiveTab] = useState(defaultTab || (tabs?.[0]?.value ?? ''));

    const handleSetTab = (id: string) => {
        if (onChange) onChange(id);
        else setActiveTab(id);
    };

    return (
        <TabsContext.Provider value={{ activeTab: value ?? activeTab, setActiveTab: handleSetTab }}>
            <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>{children}</div>
        </TabsContext.Provider>
    );
};


interface TabListProps {
    children: React.ReactNode;
    className?: string;
}

export const TabList: React.FC<TabListProps> = ({ children, className = '' }) => {
    return (
        <div className={`flex border-b border-gray-200 dark:border-gray-700 ${className}`}>
            {children}
        </div>
    );
};

interface TabProps {
    id: string;
    children: React.ReactNode;
    className?: string;
}

export const Tab: React.FC<TabProps> = ({ id, children, className = '' }) => {
    const context = useContext(TabsContext);
    if (!context) throw new Error('Tab must be used within Tabs');

    const isActive = context.activeTab === id;

    return (
        <button
            onClick={() => context.setActiveTab(id)}
            className={`
        px-4 py-2 font-medium text-sm border-b-2 transition-colors
        ${isActive
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }
        ${className}
      `}
        >
            {children}
        </button>
    );
};

interface TabPanelsProps {
    children: React.ReactNode;
    className?: string;
}

export const TabPanels: React.FC<TabPanelsProps> = ({ children, className = '' }) => {
    return <div className={className}>{children}</div>;
};

interface TabPanelProps {
    id: string;
    children: React.ReactNode;
    className?: string;
}

export const TabPanel: React.FC<TabPanelProps> = ({ id, children, className = '' }) => {
    const context = useContext(TabsContext);
    if (!context) throw new Error('TabPanel must be used within Tabs');

    if (context.activeTab !== id) return null;

    return <div className={className}>{children}</div>;
};