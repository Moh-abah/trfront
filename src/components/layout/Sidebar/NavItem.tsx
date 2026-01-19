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
    collapsed?: boolean;
    onClick?: () => void;
}

export const NavItem: React.FC<NavItemProps> = ({
    href,
    icon: Icon,
    label,
    badge,
    isActive,
    collapsed = false,
    onClick,
}) => {
    const pathname = usePathname();
    const active = isActive || pathname === href;

    return (
        <li>
            <Link
                href={href}
                onClick={onClick}
                className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                    ${active
                        ? 'bg-primary/10 text-primary dark:bg-primary/20 border-r-2 border-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground dark:hover:bg-gray-800/50'
                    }
                    ${collapsed ? 'justify-center px-3' : 'justify-start'}
                `}
                title={collapsed ? label : undefined}
            >
                {Icon && (
                    <Icon
                        className={`
                            w-5 h-5 transition-colors
                            ${collapsed ? '' : 'mr-3'}
                            ${active
                                ? 'text-primary'
                                : 'text-muted-foreground group-hover:text-accent-foreground'
                            }
                        `}
                    />
                )}

                {!collapsed && (
                    <>
                        <span className="flex-1 truncate">{label}</span>
                        {badge !== undefined && (
                            <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-primary/20 text-primary dark:bg-primary/30">
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