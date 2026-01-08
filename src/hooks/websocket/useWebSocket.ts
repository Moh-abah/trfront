'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface WebSocketOptions {
    onMessage: (data: any) => void;
    onError?: (error: Event) => void;
    onClose?: (event: CloseEvent) => void;
    onOpen?: (event: Event) => void;
    reconnectAttempts?: number;
    reconnectInterval?: number;
}

interface WebSocketHookReturn {
    isConnected: boolean;
    disconnect: () => void;
}

const WS_URL = 'ws://62.169.17.101:8017/ws/market-overview';

export const useWebSocket = ({
    onMessage,
    onError,
    onClose,
    onOpen,
    reconnectAttempts = 3,
    reconnectInterval = 5000
}: WebSocketOptions): WebSocketHookReturn => {

    const [isConnected, setIsConnected] = useState(false);

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectCountRef = useRef(0);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const manualCloseRef = useRef(false);
    const isConnectingRef = useRef(false);
    const isMountedRef = useRef(true);

    const connect = useCallback(() => {
        if (!isMountedRef.current) return;

        if (isConnectingRef.current) {
            console.log('⚠️ Already connecting...');
            return;
        }

        if (wsRef.current && (
            wsRef.current.readyState === WebSocket.OPEN ||
            wsRef.current.readyState === WebSocket.CONNECTING
        )) {
            console.log('⏸️ Connection already exists');
            return;
        }

        console.log(`🔌 Connecting to WebSocket: ${WS_URL}`);

        isConnectingRef.current = true;
        manualCloseRef.current = false;

        try {
            const ws = new WebSocket(WS_URL);
            wsRef.current = ws;

            ws.onopen = (event) => {
                if (!isMountedRef.current) {
                    ws.close();
                    return;
                }

                console.log('✅ WebSocket connected successfully');
                setIsConnected(true);
                reconnectCountRef.current = 0;
                isConnectingRef.current = false;
                onOpen?.(event);
            };

            ws.onmessage = (event) => {
                if (!isMountedRef.current) return;

                try {
                    const data = JSON.parse(event.data);
                    onMessage(data);
                } catch (error) {
                    console.error('❌ Error parsing WebSocket message:', error);
                }
            };

            ws.onerror = (event) => {
                if (!isMountedRef.current) return;

                console.error('❌ WebSocket error:', event);
                onError?.(event);
                isConnectingRef.current = false;
            };

            ws.onclose = (event) => {
                if (!isMountedRef.current) return;

                console.log(`🔌 WebSocket closed: ${event.code} ${event.reason}`);
                setIsConnected(false);
                wsRef.current = null;
                isConnectingRef.current = false;

                onClose?.(event);

                if (manualCloseRef.current) {
                    console.log('🛑 Manual disconnect - no reconnection');
                    return;
                }

                if (reconnectCountRef.current < reconnectAttempts) {
                    reconnectCountRef.current += 1;

                    const delay = Math.min(
                        reconnectInterval * Math.pow(1.5, reconnectCountRef.current - 1),
                        30000
                    );

                    console.log(`🔄 Reconnecting in ${Math.round(delay / 1000)}s (attempt ${reconnectCountRef.current}/${reconnectAttempts})`);

                    reconnectTimeoutRef.current = setTimeout(() => {
                        if (isMountedRef.current) {
                            connect();
                        }
                    }, delay);
                } else {
                    console.log('⛔ Max reconnection attempts reached');
                }
            };

        } catch (error) {
            console.error('❌ Failed to create WebSocket:', error);
            isConnectingRef.current = false;
        }
    }, [onMessage, onError, onClose, onOpen, reconnectAttempts, reconnectInterval]);

    const disconnect = useCallback(() => {
        console.log('🛑 Manually disconnecting WebSocket');

        manualCloseRef.current = true;

        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (wsRef.current) {
            wsRef.current.close(1000, 'Manual disconnect');
            wsRef.current = null;
        }

        setIsConnected(false);
        isConnectingRef.current = false;
    }, []);

    useEffect(() => {
        isMountedRef.current = true;
        connect();

        return () => {
            isMountedRef.current = false;
            disconnect();
        };
    }, [connect, disconnect]);

    return { isConnected, disconnect };
};