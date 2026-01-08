
// @ts-nocheck

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSettingsStore } from '../../stores/settings.store';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

interface ThemeProviderProps {
    children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const { settings, updateSettings } = useSettingsStore();
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

    const theme = settings.theme as Theme || 'system';

    const setTheme = (newTheme: Theme) => {
        updateSettings({ theme: newTheme });
    };

    useEffect(() => {
        const root = document.documentElement;

        const updateTheme = () => {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            const finalTheme = theme === 'system' ? systemTheme : theme;

            setResolvedTheme(finalTheme);

            root.classList.remove('light', 'dark');
            root.classList.add(finalTheme);
            root.setAttribute('data-theme', finalTheme);

            // Store in localStorage
            localStorage.setItem('theme', theme);
        };

        updateTheme();

        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => updateTheme();

        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeProvider;