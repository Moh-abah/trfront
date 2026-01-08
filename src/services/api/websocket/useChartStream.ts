
// @ts-nocheck
// services/websocket/useChartStream.ts
import { useEffect, useState, useRef } from 'react';
import { websocketService } from '../websocketes.service';


interface UseChartStreamProps {
    symbol: string;
    timeframe: string;
    market?: 'crypto' | 'stocks';
    maxCandles?: number;
    onRealtimeData?: (data: any) => void;
}

export const useChartStream = ({
    symbol,
    timeframe,
    market = 'crypto',
    maxCandles = 1000,
    onRealtimeData
}: UseChartStreamProps) => {
    const [candles, setCandles] = useState<any[]>([]);
    const [currentPrice, setCurrentPrice] = useState<any>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [indicatorsData, setIndicatorsData] = useState<any>({});
    const [signals, setSignals] = useState<any[]>([]);

    const candlesRef = useRef<any[]>([]);

    useEffect(() => {
        if (!symbol || !timeframe) return;

        console.log('📡 Starting WebSocket stream for:', { symbol, timeframe, market });

        const handleWebSocketMessage = (data: any) => {
            console.log('📥 WebSocket message received:', data);

            switch (data.type) {
                case 'price_update':
                    // تحديث السعر الحي
                    setCurrentPrice({
                        price: data.price,
                        change: data.change,
                        change_percent: data.change_percent,
                        timestamp: new Date()
                    });
                    break;

                case 'candle_update':
                    // تحديث الشمعة الحالية
                    const newCandle = {
                        timestamp: data.timestamp,
                        open: data.open,
                        high: data.high,
                        low: data.low,
                        close: data.close,
                        volume: data.volume
                    };

                    // تحديث القائمة مع الحفاظ على الحد الأقصى
                    const updatedCandles = [...candlesRef.current];
                    const lastCandle = updatedCandles[updatedCandles.length - 1];

                    if (lastCandle && new Date(lastCandle.timestamp).getTime() === new Date(newCandle.timestamp).getTime()) {
                        // تحديث الشمعة الحالية
                        updatedCandles[updatedCandles.length - 1] = newCandle;
                    } else {
                        // إضافة شمعة جديدة
                        updatedCandles.push(newCandle);
                        if (updatedCandles.length > maxCandles) {
                            updatedCandles.shift(); // إزالة أقدم شمعة
                        }
                    }

                    candlesRef.current = updatedCandles;
                    setCandles([...updatedCandles]);
                    break;

                case 'indicator_update':
                    // تحديث بيانات المؤشرات
                    setIndicatorsData(prev => ({
                        ...prev,
                        [data.indicator_name]: data.data
                    }));
                    break;

                case 'signal':
                    // إشارات التداول
                    setSignals(prev => [...prev, {
                        ...data,
                        timestamp: new Date()
                    }]);
                    break;

                case 'full_update':
                    // تحديث كامل للبيانات (أول اتصال)
                    if (data.candles) {
                        candlesRef.current = data.candles;
                        setCandles(data.candles);
                    }
                    if (data.current_price) {
                        setCurrentPrice(data.current_price);
                    }
                    if (data.indicators) {
                        setIndicatorsData(data.indicators);
                    }
                    break;
            }

            if (onRealtimeData) {
                onRealtimeData(data);
            }
        };

        // الاتصال بـ WebSocket
        websocketService.connectToStream(
            symbol,
            timeframe,
            market,
            undefined, // indicators config
            undefined, // strategy config
            handleWebSocketMessage,
            () => setIsConnected(true),
            () => setIsConnected(false)
        );

        return () => {
            websocketService.disconnect();
        };
    }, [symbol, timeframe, market, maxCandles, onRealtimeData]);

    return {
        candles,
        currentPrice,
        isConnected,
        indicatorsData,
        signals,
        lastSignal: signals[signals.length - 1]
    };
};