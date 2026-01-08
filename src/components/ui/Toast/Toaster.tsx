'use client';

import React from 'react';
import { Toast } from './Toast';
import { ToastItem, useToast } from './ToastProvider';

interface ToasterProps {
    toasts: ToastItem[];
}

export const Toaster: React.FC<ToasterProps> = ({ toasts }) => {
    const { removeToast } = useToast(); // استخدام removeToast من context

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    id={toast.id}
                    message={toast.message}
                    type={toast.type}
                    duration={toast.duration}
                    onClose={() => removeToast(toast.id)} // داخل الـ component
                />
            ))}
        </div>
    );
};
