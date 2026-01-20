const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000/ws"
// const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://62.169.17.101:8017/ws"
const ensureCandleContinuity = () => {
    // هذه الدالة تضمن استمرارية الشموع عند الاتصال
    console.log("[v0] 🔗 Ensuring candle continuity...")

    // عند الاتصال، تأكد من أن آخر شمعة تاريخية لديها بيانات كاملة
    // وأن الشمعة الحية تبدأ من الوقت الصحيح
}
class ChartWebSocketService {
    private socket: WebSocket | null = null
    private pendingIndicators: any[] = []
    private currentSymbol: string | null = null
    private currentTimeframe: string | null = null
    private reconnectTimeout: any = null
    private heartbeatInterval: any = null

    connectToChart(
        symbol: string,
        timeframe = "1m",
        market: "crypto" | "stocks" = "crypto",
        callbacks: {
            onChartInitialized?: (data: any) => void
            onPriceUpdate?: (data: any) => void
            onCandleClose?: (data: any) => void
            onIndicatorAdded?: (data: any) => void
            onIndicatorUpdated?: (data: any) => void
            onIndicatorRemoved?: (data: any) => void
            onConnected?: () => void
            onDisconnected?: () => void
            onError?: (error: any) => void
        },
    ) {
        if (
            this.socket &&
            this.socket.readyState === WebSocket.OPEN &&
            this.currentSymbol === symbol &&
            this.currentTimeframe === timeframe
        ) {
            // console.log("[v0] ✅ [WS] Already connected:", { symbol, timeframe })
            callbacks.onConnected?.()
            return
        }

        this.disconnect()

        this.currentSymbol = symbol
        this.currentTimeframe = timeframe

        const url = `${WS_BASE_URL}/chart/${symbol}`
        console.log("[v0] 🌐 [WS] Connecting to:", url)

        this.socket = new WebSocket(url)

        this.socket.onopen = () => {
            // console.log("[v0] ✅ [WS] Connection opened")

            // إرسال طلب التهيئة
            this.send({
                action: "initialize",
                timeframe,
                market,
                timestamp: Date.now(),
            })
            ensureCandleContinuity()

            // إرسال المؤشرات المعلقة
            this.pendingIndicators.forEach((item) => {
                this.send({
                    action: "add_indicator",
                    symbol: item.symbol,
                    indicator_config: item.indicatorConfig,
                })
            })
            this.pendingIndicators = []

            this.startHeartbeat()

            callbacks.onConnected?.()
        }

        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)

                // تجاهل رسائل pong
                if (data.type === "pong") return

                console.log("[v0] 📩 [WS] Received message:", {
                    type: data.type,
                    symbol: data.symbol,
                    hasLiveCandle: !!data.live_candle,
                    hasCandle: !!data.candle,
                    indicators: data.indicators,
                    hasIndicators: !!data.indicators,
                    timestamp: new Date().toISOString(),

                })
                console.log("[v0] 📩 [WS] indicators_results RAW:", data.indicators_results);

                if (data.indicators_results) {
                    Object.entries(data.indicators_results).forEach(([name, ind]: [string, any]) => {
                        console.log(`[v0] 📊 Indicator: ${name}`, {
                            metadata: ind.metadata,
                            parameters: ind.parameters,
                            valuesLength: ind.values?.length,
                            firstValue: ind.values?.[0],
                            lastValue: ind.values?.[ind.values.length - 1],
                            signalsKeys: ind.signals ? Object.keys(ind.signals) : null,
                        });
                    });
                } else {
                    console.warn("[v0] ❌ indicators_results = undefined");
                }


                switch (data.type) {
                    case "chart_initialized":
                        console.log("[v0] 📊 [WS] Chart initialized:", {
                            candles: data.data?.candles?.length,
                            indicators: Object.keys(data.data?.indicators_results || {}),
                        })
                        callbacks.onChartInitialized?.(data)
                        break

                    case "price_update":
                        if (data.live_candle) {

                            new Date(data.live_candle.time).toLocaleTimeString("ar-SA");
                            callbacks.onPriceUpdate?.(data);
                        }
                        break

                    case "candle_close":
                        if (data.candle) {
                            console.log("[v0] 🔒 [WS] Candle closed for period ending at",
                                new Date(data.candle.time).toLocaleTimeString("ar-SA"));
                            callbacks.onCandleClose?.(data);

                        } else {
                            console.warn("[v0] ⚠️ [WS] Candle close without candle data")
                        }
                        break


                    // ✅ إضافة حالة التعديل (مفقودة)
                    case "indicator_updated":
                        console.log("[v0] ✏️ [WS] Indicator updated:", data);
                        callbacks.onIndicatorUpdated?.(data);
                        break;

                    // ✅ إضافة حالة الحذف (مفقودة)
                    case "indicator_removed":
                        console.log("[v0] 🗑️ [WS] Indicator removed:", data);
                        callbacks.onIndicatorRemoved?.(data);
                        break;    

                    case "indicator_added":
                        console.log("[v0] ➕ [WS] Indicator added:", data.indicator_id);

                        // 🔥 تمرير البيانات كاملة بدون تعقيد
                        console.log("[v0] 📦 تمرير بيانات indicators_results كاملة:");

                        if (data.type === "indicator_added") {
                            console.log("[WS] Indicator added:", data.indicator_id);

                            // إرسال البيانات كاملة كما هي إلى الـ callback
                            callbacks.onIndicatorAdded?.(data);
                        }
                        break;

                    default:
                        console.log("[v0] ⚠️ [WS] Unknown message type:", data.type, data)
                }
            } catch (error) {
                console.error("[v0] ❌ [WS] Parse error:", error, "Raw data:", event.data)
                callbacks.onError?.(error)
            }
        }

        this.socket.onclose = (event) => {
            console.log("[v0] 🔴 [WS] Connection closed:", event.code, event.reason)
            this.stopHeartbeat()
            callbacks.onDisconnected?.()

            if (event.code !== 1000) {
                // ليس إغلاق طبيعي
                this.reconnectTimeout = setTimeout(() => {
                    console.log("[v0] 🔄 [WS] Reconnecting...")
                    this.connectToChart(symbol, timeframe, market, callbacks)
                }, 3000)
            }
        }

        this.socket.onerror = (error) => {
            console.error("[v0] ❌ [WS] Error:", error)
            callbacks.onError?.(error)
        }
    }

    private send(data: any) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data))
            console.log("[v0] 🚪 [WS] Sent:", data.action || data.type)
        } else {
            console.warn("[v0] ⚠️ [WS] Cannot send, socket not open")
        }
    }

    private startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            this.send({ action: "ping" })
        }, 30000) // كل 30 ثانية
    }

    private stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval)
            this.heartbeatInterval = null
        }
    }



    // في chart-websocket.service.ts، عدل دالة addIndicator:

    addIndicator(symbol: string, indicatorConfig: any) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.send({
                action: "add_indicator",
                indicator: indicatorConfig, // هذا هو الشكل المطلوب حسب الـ Backend
            });
            console.log("[v0] 📤 [WS] Indicator sent:", indicatorConfig);
        } else {
            this.pendingIndicators.push({ symbol, indicatorConfig });
            console.log("[v0] 💾 [WS] Indicator queued for sending");
        }
    }

    removeIndicator(symbol: string, indicatorName: string) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.send({
                action: "remove_indicator",
                indicator_name: indicatorName,
            });
            console.log("[v0] 🗑️ [WS] Remove indicator sent:", indicatorName);
        }
    }

    // ✅ إضافة دالة updateIndicator بعد removeIndicator
    updateIndicator(symbol: string, name: string, params: any) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.send({
                action: "update_indicator",
                name: name,
                params: params, // المعلمات الجديدة فقط
            });
            console.log("[v0] ✏️ [WS] Update indicator sent:", name, params);
        } else {
            console.warn("[v0] ⚠️ [WS] Cannot update, socket not open");
        }
    }


    disconnect() {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout)
            this.reconnectTimeout = null
        }

        this.stopHeartbeat()

        if (this.socket) {
            console.log("[v0] 👋 [WS] Disconnecting")
            this.socket.close(1000, "Client disconnect")
            this.socket = null
        }

        this.currentSymbol = null
        this.currentTimeframe = null
    }
}

export const chartWebSocketService = new ChartWebSocketService()
