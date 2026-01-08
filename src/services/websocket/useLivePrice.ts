import { useEffect, useState, useCallback, useRef } from 'react';
import { streamManager } from '@/services/websocket/stream.manager';
import { PriceUpdateEvent } from '@/services/websocket/events';
import { cacheService } from '@/services/cache/cache.service';

export interface UseLivePriceOptions {
    symbols: string | string[];
    onUpdate?: (data: PriceUpdateEvent) => void;
    onError?: (error: Error) => void;
    cacheEnabled?: boolean;
}

export const useLivePrice = (options: UseLivePriceOptions) => {
    const { symbols, onUpdate, onError, cacheEnabled = true } = options;

    const [prices, setPrices] = useState<Record<string, PriceUpdateEvent>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const streamIdsRef = useRef<string[]>([]);

    const symbolArray = Array.isArray(symbols) ? symbols : [symbols];

    // معالج تحديث السعر
    const handlePriceUpdate = useCallback((data: PriceUpdateEvent) => {
        setPrices(prev => {
            const newPrices = {
                ...prev,
                [data.symbol]: {
                    ...data,
                    timestamp: Date.now(), // تحديث الطابع الزمني
                },
            };

            // التخزين المؤقت
            if (cacheEnabled) {
                cacheService.setMemory(`price:${data.symbol}`, data, 60000); // 1 دقيقة
            }

            // استدعاء callback المستخدم
            onUpdate?.(data);

            return newPrices;
        });
    }, [onUpdate, cacheEnabled]);

    // بدء تدفق الأسعار
    const startPriceStream = useCallback(() => {
        if (symbolArray.length === 0) return;

        try {
            const newStreamIds = streamManager.startPriceStream(symbolArray, {
                onPriceUpdate: handlePriceUpdate,
                onError: (err) => {
                    setError(err.message);
                    onError?.(err);
                },
            });

            streamIdsRef.current = [...streamIdsRef.current, ...newStreamIds];
            setIsLoading(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start price stream');
            setIsLoading(false);
        }
    }, [symbolArray, handlePriceUpdate, onError]);

    // إيقاف تدفق الأسعار
    const stopPriceStream = useCallback(() => {
        streamIdsRef.current.forEach(streamId => {
            streamManager.stopStream(streamId);
        });
        streamIdsRef.current = [];
    }, []);

    // تحميل البيانات من الكاش
    const loadCachedData = useCallback(() => {
        if (!cacheEnabled) return;

        const cachedPrices: Record<string, PriceUpdateEvent> = {};
        symbolArray.forEach(symbol => {
            const cached = cacheService.getMemory<PriceUpdateEvent>(`price:${symbol}`);
            if (cached) {
                cachedPrices[symbol] = cached;
            }
        });

        if (Object.keys(cachedPrices).length > 0) {
            setPrices(cachedPrices);
        }
    }, [symbolArray, cacheEnabled]);

    // Effect للتهيئة
    useEffect(() => {
        // تحميل البيانات من الكاش أولاً
        loadCachedData();

        // بدء تدفق الأسعار
        startPriceStream();

        // تنظيف عند إلغاء التثبيت
        return () => {
            stopPriceStream();
        };
    }, [startPriceStream, stopPriceStream, loadCachedData]);

    // الحصول على سعر رمز محدد
    const getPrice = useCallback((symbol: string): PriceUpdateEvent | undefined => {
        return prices[symbol];
    }, [prices]);

    // الحصول على جميع الأسعار
    const getAllPrices = useCallback((): Record<string, PriceUpdateEvent> => {
        return prices;
    }, [prices]);

    // تحديث الأسعار يدوياً
    const refreshPrices = useCallback(() => {
        stopPriceStream();
        setError(null);
        setIsLoading(true);
        startPriceStream();
    }, [startPriceStream, stopPriceStream]);

    return {
        // البيانات
        prices: getAllPrices(),
        getPrice,

        // الحالة
        isLoading,
        error,
        isConnected: streamManager.isConnected(),

        // الدوال
        refreshPrices,
        stopPriceStream,
        startPriceStream,
    };
};

// Hook مبسط لرمز واحد
export const useSingleLivePrice = (symbol: string, options?: Omit<UseLivePriceOptions, 'symbols'>) => {
    const result = useLivePrice({
        symbols: symbol,
        ...options,
    });

    return {
        ...result,
        price: result.getPrice(symbol),
    };
};