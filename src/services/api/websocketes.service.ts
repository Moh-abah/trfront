// services/api/websocket.service.ts
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://161.97.73.254:8017/ws';

export class WebSocketService {
    private socket: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;

    // دالة الاتصال المعدلة
    connectToStream(
        symbol: string,
        timeframe: string,
        market: 'crypto' | 'stocks' = 'crypto',
        indicators?: string,
        strategy?: string,
        onMessage?: (data: any) => void,
        onOpen?: () => void,
        onClose?: () => void
    ) {
        try {
            // بناء URL مع المعلمات
            const params = new URLSearchParams();
            params.append('market', market);
            if (indicators) params.append('indicators', indicators);
            if (strategy) params.append('strategy', strategy);

            const url = `${WS_BASE_URL}/stream/${symbol}/${timeframe}?${params.toString()}`;
            this.socket = new WebSocket(url);

            this.socket.onopen = () => {
                console.log('WebSocket connected');
                this.reconnectAttempts = 0;
                if (onOpen) onOpen();
            };

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (onMessage) onMessage(data);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            this.socket.onclose = () => {
                console.log('WebSocket disconnected');
                if (onClose) onClose();
                this.attemptReconnect(symbol, timeframe, market, indicators, strategy, onMessage, onOpen, onClose);
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        } catch (error) {
            console.error('Failed to connect WebSocket:', error);
        }
    }

    private attemptReconnect(
        symbol: string,
        timeframe: string,
        market: 'crypto' | 'stocks',
        indicators?: string,
        strategy?: string,
        onMessage?: (data: any) => void,
        onOpen?: () => void,
        onClose?: () => void
    ) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

            setTimeout(() => {
                this.connectToStream(symbol, timeframe, market, indicators, strategy, onMessage, onOpen, onClose);
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('Max reconnection attempts reached');
        }
    }

    sendMessage(data: any) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            throw new Error('WebSocket is not connected');
        }
        this.socket.send(JSON.stringify(data));
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }

    isConnected(): boolean {
        return this.socket?.readyState === WebSocket.OPEN;
    }
}

export const websocketService = new WebSocketService();