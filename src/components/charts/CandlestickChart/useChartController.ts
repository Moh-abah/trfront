
// @ts-nocheck

// /services/chart/useChartController.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { chartWebSocketService } from '@/services/api/chart-websocket.service';
import { useIndicatorStore } from '@/stores/indicator.store';

export const useChartController = (symbol: string, timeframe: string = '1m') => {
    const [candles, setCandles] = useState<any[]>([]);
    const wsRef = useRef(chartWebSocketService);

    const { addIndicator: storeAddIndicator } = useIndicatorStore(); // أو أي action في الستورن

    useEffect(() => {
        if (!symbol) return;

        wsRef.current.connectToChart(symbol, timeframe, 'crypto', {
            onChartInitialized: (data: any) => {
                const formatted = (data.data.candles || []).map((c: any) => ({
                    time: Math.floor(new Date(c.timestamp).getTime() / 1000),
                    open: c.open,
                    high: c.high,
                    low: c.low,
                    close: c.close,
                    volume: c.volume
                }));
                setCandles(formatted);

                // load existing indicators into store (confirm saved)
                if (data.data.indicators) {
                    Object.values(data.data.indicators).forEach((ind: any) => {
                        storeAddIndicator({
                            id: ind.id || ind.indicator_id,
                            name: ind.config?.name || ind.name,
                            parameters: ind.config?.parameters || ind.parameters,
                            color: ind.config?.color,
                            visible: true,
                            loading: false,
                            isTemp: false,
                            data: ind.data || ind.indicator_data
                        });
                    });
                }
            },
            onChartUpdate: (data: any) => {
                // update last candle or append if needed
                if (data.candle) {
                    setCandles(prev => {
                        const updated = [...prev];
                        const time = Math.floor(new Date(data.timestamp).getTime() / 1000);
                        const newCandle = {
                            time,
                            open: data.candle.open,
                            high: data.candle.high,
                            low: data.candle.low,
                            close: data.candle.close,
                            volume: data.candle.volume
                        };
                        // naive: replace last
                        if (updated.length === 0) return [newCandle];
                        updated[updated.length - 1] = newCandle;
                        return updated;
                    });
                }

                // indicators update -> update store as needed
                if (data.indicators) {
                    Object.values(data.indicators).forEach((ind: any) => {
                        storeAddIndicator({
                            id: ind.id,
                            name: ind.config?.name,
                            parameters: ind.config?.parameters,
                            color: ind.config?.color,
                            visible: true,
                            loading: false,
                            isTemp: false,
                            data: ind.data
                        });
                    });
                }
            },
            onIndicatorAdded: (data: any) => {
                // server confirmed indicator: replace temp in store
                // Your store should implement confirmIndicator(tempName, realIndicator)
                storeAddIndicator({
                    id: data.indicator_id,
                    name: data.indicator_config.name,
                    parameters: data.indicator_config.parameters,
                    color: data.indicator_config.color,
                    visible: true,
                    loading: false,
                    isTemp: false,
                    data: data.indicator_data
                });
            }
        });

        const interval = setInterval(() => wsRef.current.ping(), 30000);
        return () => {
            clearInterval(interval);
            wsRef.current.disconnect();
        };
    }, [symbol, timeframe, storeAddIndicator]);

    return { candles, chartWs: wsRef.current };
};
