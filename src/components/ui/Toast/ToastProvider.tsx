'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toaster } from './Toaster';
import { ToastType } from './Toast';

export interface ToastItem {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    toasts: ToastItem[];
    showToast: (message: string, type: ToastType, duration?: number) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

interface ToastProviderProps {
    children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter(toast => toast.id !== id));
    }, []);

    const showToast = useCallback((message: string, type: ToastType, duration?: number) => {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const newToast: ToastItem = { id, message, type, duration };
        setToasts((prev) => [...prev, newToast]);

        // إزالة تلقائية
        if (duration && duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, [removeToast]);

    const value: ToastContextType = {
        toasts,
        showToast,
        removeToast
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <Toaster toasts={toasts} />
        </ToastContext.Provider>
    );
};

export default ToastProvider;
