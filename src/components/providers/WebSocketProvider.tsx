// src/components/providers/WebSocketProvider.tsx
'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useWebSocket } from '@/hooks/websocket/useWebSocket'; // نستخدم hook داخلياً هنا فقط

type MessageHandler = (data: any) => void;

interface WSContext {
    isConnected: boolean;
    subscribe: (handler: MessageHandler) => () => void; // returns unsubscribe
    send: (payload: any) => void;
}

const WebSocketContext = createContext<WSContext | undefined>(undefined);

export const useWebSocketContext = () => {
    const ctx = useContext(WebSocketContext);
    if (!ctx) throw new Error('useWebSocketContext must be used inside WebSocketProvider');
    return ctx;
};

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const listenersRef = useRef<Set<MessageHandler>>(new Set());
    const wsRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    const handleIncoming = useCallback((data: any) => {
        // توزع الرسالة لكل المسجلين
        listenersRef.current.forEach(fn => {
            try { fn(data); } catch (e) { console.error('listener error', e); }
        });
    }, []);

    // نستخدم نفس hook لكن فقط هنا
    const { isConnected: hookConnected, disconnect } = useWebSocket({
        onMessage: handleIncoming,
        onOpen: () => setIsConnected(true),
        onClose: () => setIsConnected(false),
        onError: (e) => console.error('WS error', e)
    });

    // subscribe API
    const subscribe = useCallback((handler: MessageHandler) => {
        listenersRef.current.add(handler);
        return () => {
            listenersRef.current.delete(handler);
        };
    }, []);

    const send = useCallback((payload: any) => {
        // تنسق كـ json إذا كان ws مفتوح
        try {
            // نحصل على الـ ws من داخل الـ hook عن طريق window (بديل: expose send من hook)
            // لكن في حالتك الحالية hook لا تُعيد send. الحل الأسهل: فتح WebSocket هنا مباشرة
            // أو تعديل hook لإرجاع send. فيما يلي افتراض أننا نملك wsRef.current
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify(payload));
            } else {
                console.warn('WebSocket not open - cannot send');
            }
        } catch (e) {
            console.error('send error', e);
        }
    }, []);

    // إذا أردت: نكشف الـ ws instance من hook أو نفتح هنا مباشرة.
    // (إذا بقيت مع hook الحالي، عدّل useWebSocket ليُعيد send وwsRef للمشاركة)

    return (
        <WebSocketContext.Provider value={{ isConnected: hookConnected, subscribe, send }}>
            {children}
        </WebSocketContext.Provider>
    );
};
