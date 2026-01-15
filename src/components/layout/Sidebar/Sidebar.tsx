"use client";
import React from 'react';
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
    User
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
    // { icon: BarChart3, label: 'Chart', href: '/chart' },
    { icon: PlayCircle, label: 'backtest', href: '/backtestadvancesd' },
    { icon: Layers, label: 'Strategies', href: '/strategies' },
    // { icon: Star, label: 'Watchlist', href: '/watchlist' },
    // { icon: Wallet, label: 'Portfolio', href: '/portfolio' },
    // { icon: History, label: 'History', href: '/history' },
];

// const secondaryItems = [

//     { icon: Settings, label: 'Settings', href: '/settings' },
// ];

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
    const { sidebarOpen, sidebarCollapsed, toggleSidebarCollapsed } = useUIStore(); // أضف toggleSidebarCollapsed هنا
    const router = useRouter();

    if (!sidebarOpen) return null;

    const handleLogout = () => {
        // Handle logout logic
        console.log('Logout clicked');
        router.push('/login');
    };

    return (
        <aside
            className={cn(
                'fixed lg:static inset-y-0 left-0 z-40',
                'bg-background dark:bg-background border-r border-border dark:border-border',
                'transition-all duration-300 ease-in-out',
                sidebarCollapsed ? 'w-[72px]' : 'w-auto',
                sidebarOpen ? 'translate-x-0' : '-translate-x-full',
                className
            )}
        >

            <div className="flex flex-col h-full">
          
                <div className="p-4 border-b border-border dark:border-border">
                    <div className="flex items-center justify-between overflow-hidden">

                        {/* منطقة الشعار - تختفي أو تتقلص عند التصغير */}
                        {!sidebarCollapsed && (
                            <div className="flex items-center gap-2 animate-in fade-in duration-500">
                                <Image
                                    src="/logo2.png" // تأكد من مسار الصورة في مجلد public
                                    alt="TECTONIC Logo"
                                    width={120}
                                    height={40}
                                    priority
                                    className="object-contain"
                                />
                            </div>
                        )}

                        {/* إذا كان السايدبار مغلقاً، يمكن إظهار نسخة مصغرة جداً أو إبقاء الزر فقط */}
                        {sidebarCollapsed && (
                            <div className="flex justify-center mb-0 transition-all">
                                {/* اختيارياً: ضع هنا أيقونة المطرقة فقط إذا كانت لديك بشكل منفصل */}
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

                {/* User & Logout */}
           
            </div>
        </aside>
    );
};

// Helper Button component for Sidebar
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