import { useEffect, useState, useCallback, useRef } from 'react';
import { streamManager } from '@/services/websocket/stream.manager';
import { CandleEvent, PriceUpdateEvent } from '@/services/websocket/events';
import { cacheService } from '@/services/cache/cache.service';

export interface UseChartStreamOptions {
    symbol: string;
    timeframe: string;
    maxCandles?: number;
    onCandleUpdate?: (candle: CandleEvent) => void;
    onPriceUpdate?: (price: PriceUpdateEvent) => void;
    onError?: (error: Error) => void;
}

export const useChartStream = (options: UseChartStreamOptions) => {
    const {
        symbol,
        timeframe,
        maxCandles = 100,
        onCandleUpdate,
        onPriceUpdate,
        onError,
    } = options;

    const [candles, setCandles] = useState<CandleEvent[]>([]);
    const [currentPrice, setCurrentPrice] = useState<PriceUpdateEvent | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const candleStreamIdRef = useRef<string | null>(null);
    const priceStreamIdRef = useRef<string | null>(null);

    // معالج تحديث الشموع
    const handleCandleUpdate = useCallback((data: CandleEvent) => {
        setCandles(prev => {
            let newCandles = [...prev];

            // البحث عن شمعة موجودة في نفس الوقت
            const existingIndex = newCandles.findIndex(
                candle => candle.timestamp === data.timestamp
            );

            if (existingIndex !== -1) {
                // تحديث الشمعة الحالية
                newCandles[existingIndex] = data;
            } else {
                // إضافة شمعة جديدة
                newCandles = [data, ...newCandles];

                // الحفاظ على الحد الأقصى للشموع
                if (newCandles.length > maxCandles) {
                    newCandles = newCandles.slice(0, maxCandles);
                }
            }

            // تخزين في الكاش
            cacheService.setMemory(`candles:${symbol}:${timeframe}`, newCandles, 300000); // 5 دقائق

            // استدعاء callback المستخدم
            onCandleUpdate?.(data);

            return newCandles;
        });
    }, [symbol, timeframe, maxCandles, onCandleUpdate]);

    // معالج تحديث السعر
    const handlePriceUpdate = useCallback((data: PriceUpdateEvent) => {
        setCurrentPrice(data);
        onPriceUpdate?.(data);
    }, [onPriceUpdate]);

    // بدء تدفق الشموع
    const startCandleStream = useCallback(() => {
        try {
            const streamId = streamManager.startCandleStream(symbol, timeframe, {
                onCandle: handleCandleUpdate,
                onError: (err) => {
                    setError(err.message);
                    onError?.(err);
                },
            });

            candleStreamIdRef.current = streamId;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start candle stream');
        }
    }, [symbol, timeframe, handleCandleUpdate, onError]);

    // بدء تدفق الأسعار
    const startPriceStream = useCallback(() => {
        try {
            const streamIds = streamManager.startPriceStream([symbol], {
                onPriceUpdate: handlePriceUpdate,
                onError: (err) => {
                    setError(err.message);
                    onError?.(err);
                },
            });

            if (streamIds.length > 0) {
                priceStreamIdRef.current = streamIds[0];
            }
        } catch (err) {
            console.error('Failed to start price stream:', err);
        }
    }, [symbol, handlePriceUpdate, onError]);

    // تحميل البيانات من الكاش
    const loadCachedData = useCallback(() => {
        const cachedCandles = cacheService.getMemory<CandleEvent[]>(`candles:${symbol}:${timeframe}`);
        if (cachedCandles) {
            setCandles(cachedCandles);
        }

        const cachedPrice = cacheService.getMemory<PriceUpdateEvent>(`price:${symbol}`);
        if (cachedPrice) {
            setCurrentPrice(cachedPrice);
        }
    }, [symbol, timeframe]);

    // Effect للتهيئة
    useEffect(() => {
        setIsLoading(true);
        setError(null);

        // تحميل البيانات من الكاش
        loadCachedData();

        // بدء التدفقات
        startCandleStream();
        startPriceStream();

        setIsLoading(false);

        // تنظيف عند إلغاء التثبيت
        return () => {
            if (candleStreamIdRef.current) {
                streamManager.stopStream(candleStreamIdRef.current);
            }
            if (priceStreamIdRef.current) {
                streamManager.stopStream(priceStreamIdRef.current);
            }
        };
    }, [startCandleStream, startPriceStream, loadCachedData]);

    // إعادة تحميل البيانات
    const refresh = useCallback(() => {
        setIsLoading(true);
        setError(null);

        // إيقاف التدفقات الحالية
        if (candleStreamIdRef.current) {
            streamManager.stopStream(candleStreamIdRef.current);
        }
        if (priceStreamIdRef.current) {
            streamManager.stopStream(priceStreamIdRef.current);
        }

        // بدء تدفقات جديدة
        startCandleStream();
        startPriceStream();

        setIsLoading(false);
    }, [startCandleStream, startPriceStream]);

    // تغيير الرمز أو الإطار الزمني
    const changeSymbol = useCallback((newSymbol: string) => {
        // سيتم تحديث هذا عبر إعادة التقديم
    }, []);

    const changeTimeframe = useCallback((newTimeframe: string) => {
        // سيتم تحديث هذا عبر إعادة التقديم
    }, []);

    // الحصول على الشمعة الأخيرة
    const getLatestCandle = useCallback((): CandleEvent | undefined => {
        return candles[0];
    }, [candles]);

    return {
        // البيانات
        candles,
        currentPrice,
        latestCandle: getLatestCandle(),

        // الحالة
        isLoading,
        error,
        isConnected: streamManager.isConnected(),

        // الدوال
        refresh,
        changeSymbol,
        changeTimeframe,
    };
};