// src/components/layout/Sidebar/NavItem.tsx
'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconType } from 'react-icons';

interface NavItemProps {
    href: string;
    icon?: IconType;
    label: string;
    badge?: number;
    isActive?: boolean;
    collapsed?: boolean; // أضفنا هذا
    onClick?: () => void;
}

export const NavItem: React.FC<NavItemProps> = ({
    href,
    icon: Icon,
    label,
    badge,
    isActive,
    collapsed = false, // قيمة افتراضية
    onClick,
}) => {
    const pathname = usePathname();
    const active = isActive || pathname === href;

    return (
        <li>
            <Link
                href={href}
                onClick={onClick}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${active
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                title={collapsed ? label : undefined} // إضافة tooltip للشريط الجانبي المطوي
            >
                {Icon && (
                    <Icon className={`w-5 h-5 ${collapsed ? '' : 'mr-3'} ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                )}
                {!collapsed && ( // إخفاء النص إذا كان الشريط الجانبي مطوياً
                    <>
                        <span className="flex-1">{label}</span>
                        {badge !== undefined && (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                                {badge}
                            </span>
                        )}
                    </>
                )}
            </Link>
        </li>
    );
};

export default NavItem;