"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
    Home,
    TrendingUp,
    BarChart3,
    Bell,
    Settings,
    PlayCircle,
    Star,
    Wallet,
    History,
    Users,
    HelpCircle,
    LogOut,
    Layers,
    User,
    Moon,    // <- added
    Sun      // <- added
} from 'lucide-react';
import { NavItem } from './NavItem';
import { useUIStore } from '../../../stores/ui.store';
import { cn } from '../../../utils/helpers/string.helpers';
import { useRouter } from 'next/navigation';
import { CollapseButton } from './CollapseButton';

interface SidebarProps {
    className?: string;
}

const navigationItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: TrendingUp, label: 'Markets', href: '/markets' },
    { icon: Bell, label: 'Signals', href: '/signals' },
    { icon: PlayCircle, label: 'backtest', href: '/backtestadvancesd' },
    { icon: Layers, label: 'Strategies', href: '/strategies' },
];

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
    const { sidebarOpen, sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();
    const router = useRouter();

    const [isDark, setIsDark] = useState<boolean>(false);

    // Initialize theme: saved -> use it; otherwise follow system preference
    useEffect(() => {
        try {
            const saved = localStorage.getItem('theme');
            if (saved === 'dark') {
                document.documentElement.classList.add('dark');
                setIsDark(true);
            } else if (saved === 'light') {
                document.documentElement.classList.remove('dark');
                setIsDark(false);
            } else {
                const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (prefersDark) {
                    document.documentElement.classList.add('dark');
                    setIsDark(true);
                } else {
                    document.documentElement.classList.remove('dark');
                    setIsDark(false);
                }
            }
        } catch (e) {
            // ignore (SSR safety)
        }
    }, []);

    const toggleTheme = () => {
        const newDark = !isDark;
        setIsDark(newDark);
        if (newDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    if (!sidebarOpen) return null;

    const handleLogout = () => {
        console.log('Logout clicked');
        router.push('/login');
    };

    return (
        <aside
            className={cn(
                'fixed lg:static inset-y-0 left-0 z-40',
                'bg-background dark:bg-background border-r border-border dark:border-border',
                'transition-all duration-300 ease-in-out flex',
                sidebarCollapsed ? 'w-[72px]' : 'w-auto',
                sidebarOpen ? 'translate-x-0' : '-translate-x-full',
                className
            )}
        >
            <div className="flex flex-col h-full w-full">
                <div className="p-4 border-b border-border dark:border-border">
                    <div className="flex items-center justify-between overflow-hidden">
                       

                        {sidebarCollapsed && (
                            <div className="flex justify-center mb-0 transition-all">
                                {/* مصغّر */}
                            </div>
                        )}

                        <CollapseButton
                            collapsed={sidebarCollapsed}
                            onToggle={toggleSidebarCollapsed}
                        />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4">
                    <div className={cn(
                        'space-y-1',
                        sidebarCollapsed ? 'px-1' : 'px-3'
                    )}>
                        {navigationItems.map((item) => (
                            <NavItem
                                key={item.label}
                                icon={item.icon}
                                label={item.label}
                                href={item.href}
                                collapsed={sidebarCollapsed}
                            />
                        ))}
                    </div>
                </nav>

                {/* Bottom area: theme toggle + logout */}
                <div className={cn(
                    'p-3 border-t border-border dark:border-border flex items-center justify-center',
                    sidebarCollapsed ? 'px-1' : 'px-3'
                )}>
                    <div className="w-full flex items-center justify-between">
                        {/* Theme toggle */}
                        <button
                            onClick={toggleTheme}
                            title={isDark ? 'تبديل إلى الوضع الفاتح' : 'تبديل إلى الوضع الداكن'}
                            aria-label="Toggle theme"
                            className={cn(
                                'flex items-center gap-2 rounded-lg transition-colors w-full',
                                sidebarCollapsed ? 'justify-center p-2' : 'justify-start p-2'
                            )}
                        >
                            <span className="flex items-center justify-center">
                                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </span>
                            {!sidebarCollapsed && (
                                <span className="text-sm font-medium">
                                    {isDark ? 'فاتح' : 'داكن'}
                                </span>
                            )}
                        </button>

                        
                    </div>
                </div>
            </div>
        </aside>
    );
};

// Helper Button component (kept for other uses)
const Button: React.FC<{
    variant?: 'ghost' | 'primary';
    size?: 'sm' | 'md';
    icon?: React.ReactNode;
    onClick?: () => void;
    children?: React.ReactNode;
}> = ({ variant = 'ghost', size = 'md', icon, onClick, children }) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                'flex items-center gap-2 rounded-lg transition-colors',
                variant === 'ghost' && 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
                variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
                size === 'sm' && 'p-2',
                size === 'md' && 'p-2.5',
            )}
        >
            {icon}
            {children}
        </button>
    );
};

export default Sidebar;
