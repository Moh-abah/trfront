'use client';

import React, { useEffect } from 'react';
import { ToastItem } from './ToastProvider';

export type ToastType = 'default' | 'success' | 'error' | 'info';

interface ToastProps extends ToastItem {
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ id, message, type, duration, onClose }) => {

    // إزالة تلقائية إذا duration موجود
    useEffect(() => {
        if (duration && duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const getBgColor = () => {
        switch (type) {
            case 'success': return 'bg-green-500';
            case 'error': return 'bg-red-500';
            case 'info': return 'bg-blue-500';
            default: return 'bg-gray-800';
        }
    };

    return (
        <div className={`text-white px-4 py-2 rounded shadow ${getBgColor()} flex justify-between items-center`}>
            <span>{message}</span>
            <button onClick={onClose} className="ml-4 font-bold">X</button>
        </div>
    );
};
