import { WebSocketMessage, WebSocketConfig, WebSocketEventType } from './events';

export class WebSocketConnection {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private heartbeatInterval: NodeJS.Timeout | null = null;
    private isConnecting = false;
    private isManualClose = false;
    private messageQueue: WebSocketMessage[] = [];
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private connectionTimeout: NodeJS.Timeout | null = null;

    private eventHandlers: Map<WebSocketEventType, ((data: any) => void)[]> = new Map();
    private messageHandlers: ((message: WebSocketMessage) => void)[] = [];

    constructor(
        private config: WebSocketConfig,
        private onConnectionChange?: (connected: boolean) => void
    ) { }

    // الاتصال بالـ WebSocket
    public connect(): void {
        if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
            return;
        }

        this.isConnecting = true;
        this.isManualClose = false;

        try {
            this.ws = new WebSocket(this.config.url);

            this.setupConnectionTimeout();

            this.ws.onopen = () => this.handleOpen();
            this.ws.onmessage = (event) => this.handleMessage(event);
            this.ws.onclose = (event) => this.handleClose(event);
            this.ws.onerror = (error) => this.handleError(error);
        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            this.handleReconnect();
        }
    }

    // إغلاق الاتصال
    public disconnect(): void {
        this.isManualClose = true;
        this.clearConnectionTimeout();
        this.clearReconnectTimeout();
        this.stopHeartbeat();

        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }

        this.isConnecting = false;
        this.onConnectionChange?.(false);
    }

    // إرسال رسالة
    public send(message: WebSocketMessage): boolean {
        if (this.ws?.readyState === WebSocket.OPEN) {
            try {
                this.ws.send(JSON.stringify(message));
                return true;
            } catch (error) {
                console.error('Failed to send WebSocket message:', error);
                this.messageQueue.push(message);
                return false;
            }
        } else {
            this.messageQueue.push(message);
            return false;
        }
    }

    // الاشتراك في قناة
    public subscribe(channel: string, data?: any): boolean {
        return this.send({
            type: WebSocketEventType.CONNECT,
            data: { action: 'subscribe', channel, data },
            timestamp: Date.now(),
        });
    }

    // إلغاء الاشتراك من قناة
    public unsubscribe(channel: string): boolean {
        return this.send({
            type: WebSocketEventType.DISCONNECT,
            data: { action: 'unsubscribe', channel },
            timestamp: Date.now(),
        });
    }

    // إضافة معالج للأحداث
    public on(event: WebSocketEventType, handler: (data: any) => void): void {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event)!.push(handler);
    }

    // إضافة معالج عام للرسائل
    public onMessage(handler: (message: WebSocketMessage) => void): void {
        this.messageHandlers.push(handler);
    }

    // إزالة معالج للأحداث
    public off(event: WebSocketEventType, handler: (data: any) => void): void {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    // التحقق من حالة الاتصال
    public isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }

    // الحصول على حالة الاتصال
    public getStatus(): 'connected' | 'connecting' | 'disconnected' | 'reconnecting' {
        if (this.ws) {
            switch (this.ws.readyState) {
                case WebSocket.CONNECTING:
                    return 'connecting';
                case WebSocket.OPEN:
                    return 'connected';
                case WebSocket.CLOSING:
                case WebSocket.CLOSED:
                    return this.reconnectTimeout ? 'reconnecting' : 'disconnected';
            }
        }
        return 'disconnected';
    }

    // ============= معالجات الأحداث =============

    private handleOpen(): void {
        console.log('WebSocket connected successfully');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.clearConnectionTimeout();
        this.startHeartbeat();
        this.flushMessageQueue();
        this.onConnectionChange?.(true);

        // إرسال حدث الاتصال
        this.triggerEvent(WebSocketEventType.CONNECT, { timestamp: Date.now() });
    }

    private handleMessage(event: MessageEvent): void {
        try {
            const message: WebSocketMessage = JSON.parse(event.data);

            // إرسال الرسالة للمعالجات العامة
            this.messageHandlers.forEach(handler => handler(message));

            // إرسال الحدث للمعالجات المحددة
            this.triggerEvent(message.type, message.data);

            // معالجة نبضات القلب
            if (message.type === WebSocketEventType.HEARTBEAT) {
                this.handleHeartbeat(message.data);
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error, event.data);
            this.triggerEvent(WebSocketEventType.ERROR, {
                error: 'Failed to parse message',
                raw: event.data,
            });
        }
    }

    private handleClose(event: CloseEvent): void {
        console.log(`WebSocket disconnected: ${event.code} - ${event.reason}`);
        this.ws = null;
        this.isConnecting = false;
        this.stopHeartbeat();
        this.onConnectionChange?.(false);

        // إرسال حدث الانفصال
        this.triggerEvent(WebSocketEventType.DISCONNECT, {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
        });

        // إعادة الاتصال التلقائي
        if (!this.isManualClose) {
            this.handleReconnect();
        }
    }

    private handleError(error: Event): void {
        console.error('WebSocket error:', error);
        this.triggerEvent(WebSocketEventType.ERROR, { error });
    }

    private handleHeartbeat(data: any): void {
        // يمكن إضافة معالجة إضافية لنبضات القلب
        console.debug('Heartbeat received:', data);
    }

    private handleReconnect(): void {
        if (this.isManualClose || this.reconnectAttempts >= this.config.reconnectAttempts) {
            console.error('Max reconnect attempts reached or manual close');
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(
            this.config.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1),
            30000
        );

        console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.config.reconnectAttempts})`);

        this.reconnectTimeout = setTimeout(() => {
            this.connect();
        }, delay);
    }

    // ============= مساعدات =============

    private setupConnectionTimeout(): void {
        this.clearConnectionTimeout();
        this.connectionTimeout = setTimeout(() => {
            if (this.ws?.readyState === WebSocket.CONNECTING) {
                console.error('WebSocket connection timeout');
                this.ws.close();
                this.handleReconnect();
            }
        }, this.config.connectionTimeout);
    }

    private clearConnectionTimeout(): void {
        if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
        }
    }

    private clearReconnectTimeout(): void {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
    }

    private startHeartbeat(): void {
        this.stopHeartbeat();
        this.heartbeatInterval = setInterval(() => {
            if (this.isConnected()) {
                this.send({
                    type: WebSocketEventType.HEARTBEAT,
                    data: { timestamp: Date.now() },
                    timestamp: Date.now(),
                });
            }
        }, this.config.heartbeatInterval);
    }

    private stopHeartbeat(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    private flushMessageQueue(): void {
        while (this.messageQueue.length > 0 && this.isConnected()) {
            const message = this.messageQueue.shift();
            if (message) {
                this.send(message);
            }
        }
    }

    private triggerEvent(event: WebSocketEventType, data: any): void {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error in ${event} handler:`, error);
                }
            });
        }
    }
}