
// @ts-nocheck
import { chartWebSocketService } from '@/services/api/chart-websocket.service';
import { useChartStore } from '@/stores/chart.store';

class ChartController {
    connect(symbol: string, timeframe: string) {
        const store = useChartStore.getState();

        store.setLoading(true);

        chartWebSocketService.connectToChart(
            symbol,
            timeframe,
            'crypto',
            {
                onConnected: () => {
                    store.setConnected(true);
                },

                onDisconnected: () => {
                    store.setConnected(false);
                },

                onChartInitialized: (data) => {
                    store.initializeChart({
                        candles: data.candles,
                        indicators: data.indicators,
                    });
                },

                onChartUpdate: (data) => {
                    store.updateLiveCandle({
                        candle: data.candle,
                        isClosed: data.is_closed,
                    });

                    if (data.indicators) {
                        store.updateIndicators(data.indicators);
                    }
                },

                onIndicatorAdded: (data) => {
                    store.addIndicator(data.indicator);
                },
            }
        );
    }

    disconnect() {
        chartWebSocketService.disconnect();
        useChartStore.getState().resetChart();
    }
}

export const chartController = new ChartController();
