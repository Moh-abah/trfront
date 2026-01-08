import { useEffect, useState, useCallback, useRef } from 'react';
import { streamManager } from '@/services/websocket/stream.manager';
import { WebSocketEventType, WebSocketMessage } from '@/services/websocket/events';

export const useWebSocket = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [error, setError] = useState<string | null>(null);
    const messageHandlers = useRef<Map<WebSocketEventType, ((data: any) => void)[]>>(new Map());

    // تهيئة WebSocket
    useEffect(() => {
        const initialize = async () => {
            try {
                await streamManager.initialize();
                updateConnectionStatus();
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to initialize WebSocket');
            }
        };

        initialize();

        return () => {
            streamManager.shutdown();
        };
    }, []);

    // تحديث حالة الاتصال
    const updateConnectionStatus = useCallback(() => {
        setIsConnected(streamManager.isConnected());
        setConnectionStatus(streamManager.getConnectionStatus());
    }, []);

    // الاشتراك في حدث
    const subscribe = useCallback(<T = any>(
        event: WebSocketEventType,
        handler: (data: T) => void
    ): (() => void) => {
        if (!messageHandlers.current.has(event)) {
            messageHandlers.current.set(event, []);
        }

        const handlers = messageHandlers.current.get(event)!;
        handlers.push(handler as any);

        // إرجاع دالة إلغاء الاشتراك
        return () => {
            const handlers = messageHandlers.current.get(event);
            if (handlers) {
                const index = handlers.indexOf(handler as any);
                if (index > -1) {
                    handlers.splice(index, 1);
                }
            }
        };
    }, []);

    // إرسال رسالة
    const send = useCallback((type: WebSocketEventType, data: any): boolean => {
        // سيتم تنفيذ هذا عبر streamManager في المستقبل
        console.log('Sending message:', { type, data });
        return true;
    }, []);

    // إعادة الاتصال
    const reconnect = useCallback(() => {
        streamManager.shutdown();
        streamManager.initialize();
    }, []);

    return {
        // الحالة
        isConnected,
        connectionStatus,
        error,

        // الدوال
        subscribe,
        send,
        reconnect,
        updateConnectionStatus,
    };
};