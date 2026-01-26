

import { create } from "zustand"

export interface CandleData {
    time: number // timestamp in milliseconds
    open: number
    high: number
    low: number
    close: number
    volume: number
}

export interface IndicatorSeriesPoint {
    time: number
    value: number
}




export interface IndicatorData {
    id: string
    name: string
    type: string
    values: IndicatorSeriesPoint[]
    signals?: any
    meta?: any
    visible?: boolean
}

export interface ChartState {
    symbol: string
    timeframe: string
    market: "crypto" | "stocks"

    // البيانات
    candles: CandleData[]
    liveCandle: CandleData | null
    indicators: Record<string, IndicatorData>
    previousLiveCandle: CandleData | null

    setIndicatorVisibility: (id: string, isVisible: boolean) => void
    // الحالة
    isLoading: boolean
    isConnected: boolean
    isInitialized: boolean
    lastUpdate: number
    error: string | null

    // معلومات السعر الحالي
    currentPrice: {
        price: number
        change: number
        change_percent: number
    } | null

    // Actions
    setSymbol: (symbol: string) => void
    setTimeframe: (timeframe: string) => void
    setMarket: (market: "crypto" | "stocks") => void
    initializeChart: (payload: any) => void
    updateLiveCandle: (candle: CandleData, indicators?: Record<string, any>) => void
    closeLiveCandle: (candle: CandleData, indicators?: Record<string, any>) => void


    addIndicatorFromServer: (indicatorName: string, indicatorData: any) => void
    updateIndicatorsFromServer: (indicatorsData: Record<string, any>) => void


    addIndicator: (indicator: IndicatorData) => void
    updateIndicator: (indicatorId: string, data: Partial<IndicatorData>) => void
    removeIndicator: (indicatorId: string) => void
    setLoading: (loading: boolean) => void
    setConnected: (connected: boolean) => void
    setError: (error: string | null) => void
    resetChart: () => void
}

const initialState = {
    symbol: "BTCUSDT",
    timeframe: "1m",
    market: "crypto" as const,
    candles: [],
    liveCandle: null,
    indicators: {},
    previousLiveCandle: null,
    isLoading: false,
    isConnected: false,
    isInitialized: false,
    lastUpdate: Date.now(),
    error: null,
    currentPrice: null,
}

const alignToTimeframe = (timestamp: number | string, timeframe: string): number => {
    // 1. تحويل المدخل لرقم نقي (Timestamp)
    let ms = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp;

    // 2. تأكد أنه بالملي ثانية (إذا كان بالثواني حوله لملي)
    if (ms < 1000000000000) ms *= 1000;

    const timeframeMillis: Record<string, number> = {
        "1m": 60 * 1000,
        "5m": 5 * 60 * 1000,
        "15m": 15 * 60 * 1000,
        "30m": 30 * 60 * 1000,
        "1h": 60 * 60 * 1000,
        "4h": 4 * 60 * 60 * 1000,
        "1d": 24 * 60 * 60 * 1000,
        "1w": 7 * 24 * 60 * 60 * 1000,
    };

    const interval = timeframeMillis[timeframe] || 60 * 1000;

    // 3. الحساب الرياضي الصافي (بدون استخدام new Date)
    // هذا يضمن أن وقت الشمعة سيبقى UTC كما جاء من السيرفر
    return Math.floor(ms / interval) * interval;
};
const getTimeframeMillis = (timeframe: string): number => {
    const timeframeMillis: Record<string, number> = {
        "1m": 60 * 1000,
        "5m": 5 * 60 * 1000,
        "15m": 15 * 60 * 1000,
        "30m": 30 * 60 * 1000,
        "1h": 60 * 60 * 1000,
        "4h": 4 * 60 * 60 * 1000,
        "1d": 24 * 60 * 60 * 1000,
        "1w": 7 * 24 * 60 * 60 * 1000,
    }
    return timeframeMillis[timeframe] || 60 * 1000
}

// حساب وقت الشمعة الحالية بناءً على الوقت الحقيقي
const calculateCurrentCandleTime = (timeframe: string): number => {
    const interval = getTimeframeMillis(timeframe)
    const now = Date.now()
    return Math.floor(now / interval) * interval
}

export const useChartStore = create<ChartState>((set, get) => ({
    ...initialState,

    setSymbol: (symbol) => set({ symbol }),

    setTimeframe: (timeframe) => set({ timeframe }),

    setMarket: (market) => set({ market }),

    initializeChart: (payload) => {
     

        if (payload.type === "chart_initialized" && payload.data) {
            const { data } = payload
            const currentTimeframe = get().timeframe

            // معالجة الشموع
            const candles: CandleData[] = (data.candles || [])
                .map((c: any) => ({
                    time: alignToTimeframe(c.time, currentTimeframe),
                    open: Number(c.open),
                    high: Number(c.high),
                    low: Number(c.low),
                    close: Number(c.close),
                    volume: Number(c.volume || 0),
                }))
                .sort((a: CandleData, b: CandleData) => a.time - b.time)

            // حساب السعر الحالي
            let currentPrice = null
            if (candles.length > 0) {
                const lastCandle = candles[candles.length - 1]
                currentPrice = {
                    price: lastCandle.close,
                    change: lastCandle.close - lastCandle.open,
                    change_percent: ((lastCandle.close - lastCandle.open) / lastCandle.open) * 100,
                }
            }

            // معالجة المؤشرات إذا كانت موجودة
            const indicators: Record<string, IndicatorData> = {}
            if (data.indicators_results) {
                Object.entries(data.indicators_results).forEach(([key, indData]: [string, any]) => {
                    indicators[key] = {
                        id: key,
                        name: indData.name || key,
                        type: indData.type || "line",
                        values: [],
                        signals: indData.signals,
                        meta: indData.metadata,
                    }
                })
            }

            set({
                symbol: data.symbol || get().symbol,
                timeframe: data.timeframe || get().timeframe,
                candles,
                liveCandle: null,
                indicators,
                previousLiveCandle: null,
                currentPrice,
                isInitialized: true,
                isLoading: false,
                isConnected: true,
                lastUpdate: Date.now(),
                error: null,
            })

        }
    },

    updateLiveCandle: (candle, indicators) => {
        const state = get();
        const timeframe = state.timeframe;
        const interval = getTimeframeMillis(timeframe);
        const currentCandleTime = calculateCurrentCandleTime(timeframe);



     
        const tickPrice = Number(candle.close);


        if (!state.liveCandle && state.candles.length > 0) {
            const lastHistoricalCandle = state.candles[state.candles.length - 1];
            const firstTickPrice = Number(candle.close); // أول tick حي
            const previousClose = lastHistoricalCandle.close;
            const newLiveCandle: CandleData = {
                time: currentCandleTime,
                open: lastHistoricalCandle.close,
                high: Math.max(previousClose, firstTickPrice),
                low: Math.min(previousClose, firstTickPrice),
                close: tickPrice,
                volume: Number(candle.volume) || 0,
            };

            const currentPrice = {
                price: newLiveCandle.close,
                change: newLiveCandle.close - newLiveCandle.open,
                change_percent: ((newLiveCandle.close - newLiveCandle.open) / newLiveCandle.open) * 100,
            };

            set({
                liveCandle: newLiveCandle,
                currentPrice,
                lastUpdate: Date.now(),
            });

            return; 
        }

        // إذا لم تكن هناك شمعة حية، أو تغير وقت الشمعة
        if (!state.liveCandle || currentCandleTime !== state.liveCandle.time) {
          
            // إذا كانت هناك شمعة حية سابقة، أغلقها أولاً
            if (state.liveCandle) {
                // console.log("[v0] 🔒🔒🔒🔒🔒🔒🔒 Closing previous live candle:", {
                //     time: new Date(state.liveCandle.time).toISOString(),
                //     open: state.liveCandle.open,
                //     close: state.liveCandle.close,
                //     high: state.liveCandle.high,
                //     low: state.liveCandle.low,
                // });

                // console.log("[v0] 🆕🆕🆕🆕🆕🆕🆕 Creating new live candle:", {
                //     from: state.liveCandle
                //         ? {
                //             time: new Date(state.liveCandle.time).toISOString(),
                //             close: state.liveCandle.close,
                //         }
                //         : null,
                //     to: {
                //         time: new Date(currentCandleTime).toISOString(),
                //         open: state.liveCandle ? state.liveCandle.close : Number(candle.open),
                //     },
                // });

                // إضافة الشمعة السابقة إلى التاريخ
                const newCandles = [...state.candles];
                const existingIndex = newCandles.findIndex(c => c.time === state.liveCandle!.time);

                if (existingIndex >= 0) {
                    newCandles[existingIndex] = state.liveCandle;
                } else {
                    newCandles.push(state.liveCandle);
                }

                // ترتيب الشموع
                newCandles.sort((a, b) => a.time - b.time);
                const maxCandles = 1000;
                const trimmedCandles = newCandles.length > maxCandles
                    ? newCandles.slice(-maxCandles)
                    : newCandles;

                set({
                    candles: trimmedCandles,
                    previousLiveCandle: state.liveCandle,
                });
            }
            const previousClose = state.liveCandle
                ? state.liveCandle.close
                : Number(candle.open);
            const firstPrice = Number(candle.close);


            const newLiveCandle: CandleData = {
                time: currentCandleTime,
                open: previousClose,
                high: firstPrice,
                low: firstPrice,
                close: firstPrice,
                volume: 0,
            };

       
            const tickPrice = Number(candle.close); // قيمة حقيقية للـ tick
            newLiveCandle.high = Math.max(newLiveCandle.high, tickPrice);
            newLiveCandle.low = Math.min(newLiveCandle.low, tickPrice);
            newLiveCandle.close = tickPrice;
            newLiveCandle.volume += Number(candle.volume) || 0;





            const currentPrice = {
                price: newLiveCandle.close,
                change: newLiveCandle.close - newLiveCandle.open,
                change_percent: ((newLiveCandle.close - newLiveCandle.open) / newLiveCandle.open) * 100,
            };

            set({
                liveCandle: newLiveCandle,
                currentPrice,
                lastUpdate: Date.now(),
            });

      

        } else {
            const tickPrice = Number(candle.close);
            // تحديث الشمعة الحية الحالية
            const updatedLiveCandle: CandleData = {
                time: state.liveCandle.time,
                open: state.liveCandle.open,
                high: Math.max(state.liveCandle.high, tickPrice),
                low: Math.min(state.liveCandle.low, tickPrice),
                close: tickPrice,
                volume: state.liveCandle.volume + (Number(candle.volume) || 0),
            };

            const currentPrice = {
                price: updatedLiveCandle.close,
                change: updatedLiveCandle.close - updatedLiveCandle.open,
                change_percent: ((updatedLiveCandle.close - updatedLiveCandle.open) / updatedLiveCandle.open) * 100,
            };

            set({
                liveCandle: updatedLiveCandle,
                currentPrice,
                lastUpdate: Date.now(),
            });

        }

        // تحديث المؤشرات
        // if (indicators) {
        //     set((state) => {
        //         const updatedIndicators = { ...state.indicators };
        //         const currentCandleTime = calculateCurrentCandleTime(timeframe);

        //         Object.entries(indicators).forEach(([key, indData]: [string, any]) => {



        //             if (!updatedIndicators[key]) {
        //                 // إنشاء مؤشر جديد إذا لم يكن موجوداً
        //                 const indicatorPoints: IndicatorSeriesPoint[] = indData.values
        //                     ? indData.values.map((value: number) => ({
        //                         time: currentCandleTime,
        //                         value: value
        //                     }))
        //                     : [];

        //                 updatedIndicators[key] = {
        //                     id: key,
        //                     name: indData.name || key,
        //                     type: "line",
        //                     values: indicatorPoints,
        //                     signals: indData.signals,
        //                     meta: indData.metadata,
        //                 };
        //             } else {
        //                 // تحديث المؤشر الموجود
        //                 const existing = updatedIndicators[key];
        //                 const newValues = [...existing.values];

        //                 // البحث عن قيمة موجودة لنفس الوقت
        //                 const existingIndex = newValues.findIndex(v => v.time === currentCandleTime);

        //                 if (indData.values && indData.values.length > 0) {
        //                     const newValue = indData.values[0];

        //                     if (existingIndex >= 0) {
        //                         // تحديث القيمة الحالية
        //                         newValues[existingIndex] = {
        //                             time: currentCandleTime,
        //                             value: newValue
        //                         };
        //                     } else {
        //                         // إضافة قيمة جديدة
        //                         newValues.push({
        //                             time: currentCandleTime,
        //                             value: newValue
        //                         });
        //                     }
        //                 }

        //                 // تحديث metadata إذا وجد
        //                 let newMeta = existing.meta;
        //                 if (indData.metadata) {
        //                     // دمج metadata القديم مع الجديد
        //                     newMeta = {
        //                         ...existing.meta,
        //                         ...indData.metadata
        //                     };
        //                 }

        //                 updatedIndicators[key] = {
        //                     ...existing,
        //                     values: newValues,
        //                     meta: newMeta,
        //                 };
        //             }
        //         });

        //         return { indicators: updatedIndicators };
        //     });
        // }
        // ... (بداية الكود السابق) ...

        // تحديث المؤشرات
        if (indicators) {
            set((state) => {
                // 🔥 نأخذ نسخة من المؤشرات الحالية للحفاظ على التاريخ (Spread)
                const updatedIndicators = { ...state.indicators };
                const currentCandleTime = calculateCurrentCandleTime(timeframe);

                Object.entries(indicators).forEach(([key, indData]: [string, any]) => {

                    // 🔥🔥🔥 الإصلاح الجذري: التحقق من صحة البيانات القادمة
                    // إذا كانت المصفوفة فارغة، نتجاهل التحديث لهذا المؤشر (لن نمسح التاريخ)
                    if (!indData.values || indData.values.length === 0) {
                        return;
                    }

                    if (!updatedIndicators[key]) {
                        // إنشاء مؤشر جديد إذا لم يكن موجوداً
                        const indicatorPoints: IndicatorSeriesPoint[] = indData.values
                            ? indData.values.map((value: number) => ({
                                time: currentCandleTime,
                                value: value
                            }))
                            : [];

                        updatedIndicators[key] = {
                            id: key,
                            name: indData.name || key,
                            type: "line",
                            values: indicatorPoints,
                            signals: indData.signals,
                            meta: indData.metadata,
                        };
                    } else {
                        // تحديث المؤشر الموجود
                        const existing = updatedIndicators[key];
                        const newValues = [...existing.values];

                        // البحث عن قيمة موجودة لنفس الوقت
                        const existingIndex = newValues.findIndex(v => v.time === currentCandleTime);

                        if (indData.values && indData.values.length > 0) {
                            const newValue = indData.values[0];

                            if (existingIndex >= 0) {
                                // تحديث القيمة الحالية
                                newValues[existingIndex] = {
                                    time: currentCandleTime,
                                    value: newValue
                                };
                            } else {
                                // إضافة قيمة جديدة
                                newValues.push({
                                    time: currentCandleTime,
                                    value: newValue
                                });
                            }
                        }

                        // تحديث metadata إذا وجد
                        let newMeta = existing.meta;
                        if (indData.metadata) {
                            // دمج metadata القديم مع الجديد
                            newMeta = {
                                ...existing.meta,
                                ...indData.metadata
                            };
                        }

                        updatedIndicators[key] = {
                            ...existing,
                            values: newValues,
                            meta: newMeta,
                        };
                    }
                });

                // 🔥 إرجاع الكائن المحدث فقط (Merge Strategy)
                return { indicators: updatedIndicators };
            });
        }
   
    },



    setIndicatorVisibility: (id: string, isVisible: boolean) => {
        set((state) => {
            // تأكد من أن المؤشر موجوداً أولاً لتجنب الأخطاء
            if (!state.indicators[id]) return state;

            return {
                indicators: {
                    ...state.indicators,
                    [id]: {
                        ...state.indicators[id],
                        visible: isVisible // 🔥 هنا يتم تغيير حالة الظهور
                    }
                }
            };
        });
    },


    // closeLiveCandle: (candle, indicators) => {
    //     const state = get();
    //     const timeframe = state.timeframe;
    //     const closedCandleTime = alignToTimeframe(candle.time, timeframe);

    //     const closedCandle: CandleData = {
    //         time: closedCandleTime,
    //         open: Number(candle.open),
    //         high: Number(candle.high),
    //         low: Number(candle.low),
    //         close: Number(candle.close),
    //         volume: Number(candle.volume),
    //     };

    //     set((currentState) => {
    //         const newCandles = [...currentState.candles, closedCandle]
    //             .sort((a, b) => a.time - b.time)
    //             .slice(-1000);

    //         const currentPrice = {
    //             price: closedCandle.close,
    //             change: closedCandle.close - closedCandle.open,
    //             change_percent: ((closedCandle.close - closedCandle.open) / closedCandle.open) * 100,
    //         };

    //         const shouldClearLiveCandle = currentState.liveCandle && currentState.liveCandle.time === closedCandleTime;

    //         return {
    //             candles: newCandles,
    //             liveCandle: shouldClearLiveCandle ? null : currentState.liveCandle,
    //             previousLiveCandle: shouldClearLiveCandle ? currentState.liveCandle : currentState.previousLiveCandle,
    //             currentPrice,
    //             lastUpdate: Date.now(),
    //         };
    //     });
    // },
    closeLiveCandle: (candle, indicators) => {
        const state = get();
        const timeframe = state.timeframe;
        // تأكد من توحيد وقت الشمعة القادمة من السيرفر
        const closedCandleTime = alignToTimeframe(candle.time, timeframe);

        const closedCandle: CandleData = {
            time: closedCandleTime,
            open: Number(candle.open),
            high: Number(candle.high),
            low: Number(candle.low),
            close: Number(candle.close),
            volume: Number(candle.volume),
        };

        set((currentState) => {
            // 👇 تعديل مهم هنا: نأخذ نسخة ونبحث عن الشمعة قبل الإضافة
            const newCandles = [...currentState.candles];

            // نبحث إذا كان هناك شمعة بنفس الوقت (تم إضافتها مسبقاً بواسطة updateLiveCandle)
            const existingIndex = newCandles.findIndex(c => c.time === closedCandleTime);

            if (existingIndex >= 0) {
                // ✅ إذا كانت موجودة، نقوم بتحديث بياناتها ببيانات السيرفر الأدق
                newCandles[existingIndex] = closedCandle;
            } else {
                // ✅ إذا لم تكن موجودة، نقوم بإضافتها
                newCandles.push(closedCandle);
            }

            // ترتيب وقص الشموع
            newCandles.sort((a, b) => a.time - b.time);
            const maxCandles = 1000;
            const trimmedCandles = newCandles.length > maxCandles
                ? newCandles.slice(-maxCandles)
                : newCandles;

            const currentPrice = {
                price: closedCandle.close,
                change: closedCandle.close - closedCandle.open,
                change_percent: ((closedCandle.close - closedCandle.open) / closedCandle.open) * 100,
            };

            const shouldClearLiveCandle = currentState.liveCandle && currentState.liveCandle.time === closedCandleTime;

            return {
                candles: trimmedCandles,
                liveCandle: shouldClearLiveCandle ? null : currentState.liveCandle,
                previousLiveCandle: shouldClearLiveCandle ? currentState.liveCandle : currentState.previousLiveCandle,
                currentPrice,
                lastUpdate: Date.now(),
            };
        });
    },

    // addIndicatorFromServer: (indicatorName: string, indicatorData: any) => {
    //     console.log(`📦 [Store] addIndicatorFromServer for ${indicatorName}:`, {
    //         hasValues: !!indicatorData.values,
    //         valuesLength: indicatorData.values?.length,
    //         hasSignals: !!indicatorData.signals,
    //         signalsIndexLength: indicatorData.signals?.index?.length,
    //         hasIndData: !!indicatorData.indData,
    //         source: indicatorData.source
    //     });


    //     const isSMCOrderBlock = indicatorName.toLowerCase().includes('order_block') || indicatorName.toLowerCase().includes('smc');

    //     let values: any[];
    //     let signals: any;
    //     let metadata: any;

    //     if (isSMCOrderBlock) {
    //         console.log(`📦 [Store] 🔴 SMC Order Block detected. Extracting RAW data directly.`);

    //         // 🔥 الخطوة الحاسمة: أخذ القيم من rawData مباشرة
    //         // وتجاهل indData تماماً لأنه قد يكون قديماً أو فارغاً
    //         if (indicatorData.rawData && indicatorData.rawData.values) {
    //             values = indicatorData.rawData.values;
    //             signals = indicatorData.rawData.signals;
    //             metadata = indicatorData.rawData.metadata || indicatorData.rawData.meta;
    //         }
    //         // Fallback: في حال لم يوجد rawData (مستحيل)، نبحث في الجذر
    //         else if (indicatorData.values && Array.isArray(indicatorData.values) && indicatorData.values.length > 0) {
    //             values = indicatorData.values;
    //             metadata = indicatorData.meta || indicatorData.metadata;
    //             signals = indicatorData.signals;
    //         } else {
    //             console.error(`[Store] ❌ NO DATA FOUND FOR SMC!`, indicatorData);
    //             return; // لا نستمر إذا لا توجد بيانات
    //         }
    //     } 

    //     // 🔥 أولاً: تحديد مصدر البيانات
    //     const dataSource = indicatorData.indData || indicatorData;
    //     const { values, signals, metadata } = dataSource;

    //     let indicatorPoints: IndicatorSeriesPoint[] = [];

    //     // 🔥 الحالة 1: إذا كان هناك signals.index (RSI, MACD, Bollinger)
    //     if (signals?.index && Array.isArray(signals.index)) {
    //         console.log(`📦 [Store] Using signals.index for ${indicatorName}`);

    //         const minLength = Math.min(values.length, signals.index.length);

    //         for (let i = 0; i < minLength; i++) {
    //             const value = values[i];
    //             const timeStr = signals.index[i];

    //             if (!timeStr) continue;

    //             const utcTimeStr = timeStr.includes('T') && !timeStr.endsWith('Z')
    //                 ? `${timeStr}Z`
    //                 : timeStr;

    //             const timeMs = new Date(utcTimeStr).getTime();
    //             const timeSeconds = Math.floor(timeMs / 1000);

    //             indicatorPoints.push({
    //                 time: timeSeconds,
    //                 value: Number(value),
    //             });
    //         }
    //     }
    //     // 🔥 الحالة 2: ATR (بدون signals)
    //     else if (values && values.length > 0) {
    //         console.log(`📦 [Store] No signals for ${indicatorName}, using candle times or raw values`);

    //         // 🔥 للمؤشرات التي لا تحتاج تحويل (مثل ATR) نحتفظ بالقيم الخام
    //         // وسنترك المؤشر نفسه يتعامل مع التحويل

    //         // 🔥 نستخدم candles إذا كانت موجودة
    //         const candles = get().candles;
    //         const timeframe = get().timeframe;

    //         if (candles.length > 0 && candles.length >= values.length) {
    //             const startIndex = Math.max(0, candles.length - values.length);

    //             for (let i = 0; i < values.length; i++) {
    //                 const value = values[i];
    //                 const candleIndex = startIndex + i;

    //                 if (candleIndex < candles.length) {
    //                     indicatorPoints.push({
    //                         time: candles[candleIndex].time,
    //                         value: Number(value),
    //                     });
    //                 }
    //             }
    //         }
    //     }

    //     // 🔥 بناء كائن المؤشر مع الحفاظ على البيانات الأصلية
    //     const newIndicator: any = {
    //         id: indicatorName,
    //         name: indicatorName,
    //         type: "line",
    //         values: indicatorPoints,
    //         signals,
    //         meta: metadata,
    //         // 🔥 إضافة البيانات الأصلية كخاصية منفصلة
    //         rawData: {
    //             values: values,            // القيم الخام
    //             metadata: metadata,        // metadata الأصلية
    //             source: indicatorData.source || 'indicator_added',
    //             isInitialData: true,
    //             isHistorical: true
    //         },
    //         // 🔥 إضافة flags للتمييز
    //         hasRawData: true,
    //         isInitialData: true,
    //         source: indicatorData.source || 'indicator_added'
    //     };

    //     console.log(`📦 [Store] Created indicator "${indicatorName}" with ${indicatorPoints.length} points`);

    //     set((state) => ({
    //         indicators: {
    //             ...state.indicators,
    //             [indicatorName]: newIndicator,
    //         },
    //     }));
    // },

    addIndicatorFromServer: (indicatorName: string, indicatorData: any) => {
        // console.log(`📦 [Store] addIndicatorFromServer for ${indicatorName}:`, {
        //     hasValues: !!indicatorData.values,
        //     valuesLength: indicatorData.values?.length,
        //     hasSignals: !!indicatorData.signals,
        //     signalsIndexLength: indicatorData.signals?.index?.length,
        //     hasIndData: !!indicatorData.indData,
        //     source: indicatorData.source
        // });

        // =========================================
        // 🔥 قسم خاص: SMC Order Block
        // =========================================
        const isSMC = indicatorName.toLowerCase().includes('order_block') || indicatorName.toLowerCase().includes('smc');

        if (isSMC) {
        
            let values: any[];
            let signals: any;
            let metadata: any;

            // 1. البحث في rawData (المصدر الصحيح الذي يحتوي 500 نقطة)
            if (indicatorData.rawData && indicatorData.rawData.values) {
                values = indicatorData.rawData.values;
                signals = indicatorData.rawData.signals;
                metadata = indicatorData.rawData.metadata || indicatorData.rawData.meta;
           }
            // 2. البحث في البيانات المباشرة (Backup)
            else if (indicatorData.values && Array.isArray(indicatorData.values) && indicatorData.values.length > 0) {
                values = indicatorData.values;
                metadata = indicatorData.meta || indicatorData.metadata;
                signals = indicatorData.signals;
            } else {
                console.error(`[Store] ❌ No data found for SMC Order Block`);
                return; // خروج مبكر إذا لم يوجد بيانات
            }

            // بناء كائن المؤشر الخاص بـ SMC
            const newIndicator: any = {
                id: indicatorName,
                name: indicatorName,
                type: "line",
                values: values, // استخدام القيم الخام مباشرة (بدون تحويل لـ Points)
                signals,
                meta: metadata,
                rawData: {
                    values: values,
                    metadata: metadata,
                    source: indicatorData.source || 'indicator_added',
                    isInitialData: true,
                    isHistorical: true
                },
                hasRawData: true,
                isInitialData: true,
                source: indicatorData.source || 'indicator_added'
            };

         
            // تحديث الحالة
            set((state) => ({
                indicators: {
                    ...state.indicators,
                    [indicatorName]: newIndicator,
                },
            }));

            // 🔥 خروج مبكر جداً (Return)
            // هذا يمنع تضارب المتغيرات ويمنع الوصول لكود المؤشرات العادي أدناه
            return;
        }

        // =========================================
        // 🔥 قسم عام: مؤشرات أخرى (RSI, MACD, ATR)
        // (هذا الكود لن ينفذ إذا كان المؤشر SMC بسبب return أعلاه)
        // =========================================

        const dataSource = indicatorData.indData || indicatorData;
        const { values, signals, metadata } = dataSource;

        let indicatorPoints: IndicatorSeriesPoint[] = [];

        // الحالة 1: RSI, MACD, Bollinger (يحتاجون signals.index)
        if (signals?.index && Array.isArray(signals.index)) {
        
            const minLength = Math.min(values.length, signals.index.length);

            for (let i = 0; i < minLength; i++) {
                const value = values[i];
                const timeStr = signals.index[i];

                if (!timeStr) continue;

                const utcTimeStr = timeStr.includes('T') && !timeStr.endsWith('Z')
                    ? `${timeStr}Z`
                    : timeStr;

                const timeMs = new Date(utcTimeStr).getTime();
                const timeSeconds = Math.floor(timeMs / 1000);

                indicatorPoints.push({
                    time: timeSeconds,
                    value: Number(value),
                });
            }
        }
        // الحالة 2: ATR (بدون signals)
        else if (values && values.length > 0) {
          
            const candles = get().candles;

            if (candles.length > 0 && candles.length >= values.length) {
                const startIndex = Math.max(0, candles.length - values.length);

                for (let i = 0; i < values.length; i++) {
                    const value = values[i];
                    const candleIndex = startIndex + i;

                    if (candleIndex < candles.length) {
                        indicatorPoints.push({
                            time: candles[candleIndex].time,
                            value: Number(value),
                        });
                    }
                }
            }
        }

        // بناء كائن المؤشر للمؤشرات العادية
        const newIndicator: any = {
            id: indicatorName,
            name: indicatorName,
            type: "line",
            values: indicatorPoints,
            signals,
            meta: metadata,
            rawData: {
                values: values,
                metadata: metadata,
                source: indicatorData.source || 'indicator_added',
                isInitialData: true,
                isHistorical: true
            },
            hasRawData: true,
            isInitialData: true,
            source: indicatorData.source || 'indicator_added'
        };

        set((state) => ({
            indicators: {
                ...state.indicators,
                [indicatorName]: newIndicator,
            },
        }));
    },
    
    // وأيضاً دالة لتحديث المؤشرات عند إغلاق الشمعة
    updateIndicatorsFromServer: (indicatorsData: Record<string, any>) => {
        set((state) => {
            const updatedIndicators = { ...state.indicators };

            Object.entries(indicatorsData).forEach(([name, indData]) => {
                const { values, signals, metadata } = indData;

                const indicatorPoints: IndicatorSeriesPoint[] = values.map((value: number, index: number) => {
                    const time = state.candles[index]?.time || Date.now();
                    return { time, value };
                });

                updatedIndicators[name] = {
                    id: name,
                    name: name,
                    type: "line",
                    values: indicatorPoints,
                    signals,
                    meta: metadata,
                };
            });

            return { indicators: updatedIndicators };
        });
    },

    addIndicator: (indicator) => {
        set((state) => ({
            indicators: {
                ...state.indicators,
                [indicator.id]: indicator,
            },
        }))
    },

    updateIndicator: (indicatorId, data) => {
        set((state) => {
            const existing = state.indicators[indicatorId]
            if (!existing) return state

            return {
                indicators: {
                    ...state.indicators,
                    [indicatorId]: { ...existing, ...data },
                },
            }
        })
    },


    // في store/chart.store.ts أضف هذه الوظيفة:
    resetForNewTimeframe: () => {
        set({
            candles: [],
            indicators: {},
            liveCandle: null,
            previousLiveCandle: null,
            currentPrice: null,
            isInitialized: false,
            isLoading: true,
            error: null,
            // نحتفظ على symbol و timeframe و market لأنها ستتغير لاحقاً
        });
    },

    
    removeIndicator: (indicatorId: string) => {
        set((state) => {
            const copy = { ...state.indicators };
            delete copy[indicatorId];
            return { indicators: copy };
        });
    },

    setLoading: (loading) => set({ isLoading: loading }),

    setConnected: (connected) => set({ isConnected: connected }),

    setError: (error) => set({ error }),

    resetChart: () => set({ ...initialState }),
}))
