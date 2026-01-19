// Market data interface based on the WebSocket response
export interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
}

export interface MarketOverviewMessage {
  type: string;
  timestamp: string;
  data: MarketData[];
  count: number;
}

export interface MarketOverviewCallbacks {
  onMessage?: (data: MarketData[]) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Event) => void;
}

class MarketOverviewWebSocketService {
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private callbacks: MarketOverviewCallbacks = {};
  private isConnected: boolean = false;
  private readonly WS_URL = "ws://161.97.73.254:8017/ws/market-overview";
  private readonly RECONNECT_DELAY = 3000; // 3 seconds

  connect(callbacks: MarketOverviewCallbacks) {
    this.callbacks = callbacks;

    try {
      console.log("[MarketOverview] Connecting to:", this.WS_URL);
      this.ws = new WebSocket(this.WS_URL);

      this.ws.onopen = () => {
        console.log("[MarketOverview] Connected");
        this.isConnected = true;
        this.callbacks.onConnected?.();
        this.clearReconnectTimer();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: MarketOverviewMessage = JSON.parse(event.data);

          if (message.type === "market_overview" && message.data) {
            console.log(
              `[MarketOverview] Received ${message.data.length} market items`
            );
            this.callbacks.onMessage?.(message.data);
          }
        } catch (error) {
          console.error("[MarketOverview] Error parsing message:", error);
        }
      };

      this.ws.onclose = (event) => {
        console.log("[MarketOverview] Disconnected:", event.code, event.reason);
        this.isConnected = false;
        this.callbacks.onDisconnected?.();
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error("[MarketOverview] WebSocket error:", error);
        this.callbacks.onError?.(error);
      };
    } catch (error) {
      console.error("[MarketOverview] Failed to connect:", error);
      this.callbacks.onError?.(error as Event);
      this.scheduleReconnect();
    }
  }

  disconnect() {
    console.log("[MarketOverview] Disconnecting...");
    this.clearReconnectTimer();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.isConnected = false;
  }

  private scheduleReconnect() {
    if (!this.isConnected) {
      console.log(
        `[MarketOverview] Scheduling reconnect in ${this.RECONNECT_DELAY}ms`
      );

      this.reconnectTimer = setTimeout(() => {
        console.log("[MarketOverview] Attempting to reconnect...");
        this.connect(this.callbacks);
      }, this.RECONNECT_DELAY);
    }
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

// Export singleton instance
export const marketOverviewService = new MarketOverviewWebSocketService();
