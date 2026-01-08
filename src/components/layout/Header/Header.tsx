'use client';

import React from 'react';
import { Bell, Search, User, Menu, X } from 'lucide-react';
import { Button } from '../../ui/Button/Button';
import { Input } from '../../ui/Input/Input';

import { useUIStore } from '../../../stores/ui.store';

interface HeaderProps {
    title?: string;
    showSearch?: boolean;
    showNotifications?: boolean;
    showUserMenu?: boolean;
    onMenuClick?: () => void;
    className?: string;
}

export const Header: React.FC<HeaderProps> = ({
    title = 'TECTONIC Trading Platform',
    showSearch = true,
    showNotifications = true,
    showUserMenu = true,
    onMenuClick,
    className
}) => {
    const { sidebarOpen, toggleSidebar } = useUIStore();
    const [searchQuery, setSearchQuery] = React.useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle search logic
        console.log('Searching for:', searchQuery);
    };

    return (
        <header className={`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 ${className}`}>
            <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Left Section */}
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            //icon={sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            onClick={toggleSidebar}
                            className="lg:hidden"
                        />

                        <div className="hidden lg:block">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
                        </div>

                        {showSearch && (
                            <form onSubmit={handleSearch} className="hidden md:block">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        type="search"
                                        placeholder="Search symbols, indicators..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 w-64"
                                    />
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Right Section
                    <div className="flex items-center gap-3">
                        <ThemeToggle />

                        {showNotifications && <NotificationBell />}

                        {showUserMenu && <UserMenu />}
                    </div> */}
                </div>

                {/* Mobile Search */}
                {showSearch && (
                    <div className="mt-3 md:hidden">
                        <form onSubmit={handleSearch}>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    type="search"
                                    placeholder="Search symbols, indicators..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 w-full"
                                />
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;