// @ts-nocheck


// indicators/indicator-manager.ts
import { IChartApi, ISeriesApi, UTCTimestamp } from "lightweight-charts";
import { BaseIndicator, IndicatorConfig, IndicatorData, IndicatorDataATR, IndicatorDataMACD } from "./base-indicator";
import { BollingerBandsIndicator } from "./bollinger-bands";
import { MAIndicator } from "./ma";
import { RSIIndicator } from "./rsi-indicator1";
import { ATRIndicator } from "./atr-indicator";
import { MACDIndicator } from "./macd-indicator";
import { EMAIndicator } from "./ema-indicator";
import { SMAIndicator } from "./sma-indicator";
import { OBVIndicator } from "./obv-indicator";
import { SupplyDemandIndicator } from "./supply-demand";
import { VolumeClimaxIndicator } from "./volume-climax";
import { HarmonicIndicator } from "./harmonic-indicator";
import { HVIVIndicator } from "./hv-iv-indicator";
import { SMCOrderBlockIndicator } from "./smc-order-block-indicator";



type IndicatorRegistry = {
    [key: string]: new (chart: IChartApi, config: IndicatorConfig, mainCandleSeries?: ISeriesApi<"Candlestick">) => BaseIndicator;
};

export class IndicatorManager {
    private chart: IChartApi;
    private indicators: Map<string, BaseIndicator> = new Map();
    private candleSeries?: any;




    // 🔥 السجل المركزي للمؤشرات - أضف مؤشرات جديدة هنا فقط!
    private indicatorRegistry: IndicatorRegistry = {
        // المؤشرات المتداخلة (مع السعر)
        'bollinger': BollingerBandsIndicator,
        'bb': BollingerBandsIndicator,
        'band': BollingerBandsIndicator,
        'ma': MAIndicator,
        'ema': EMAIndicator,
        'sma': SMAIndicator,
        'obv': OBVIndicator,
        'macd': MACDIndicator,

        'smc':SMCOrderBlockIndicator,
        // المؤشرات التذبذبية
        'rsi': RSIIndicator,
        'atr': ATRIndicator,
        'climax': VolumeClimaxIndicator,  // 🔥 إضافة هنا
        'volume_climax': VolumeClimaxIndicator,

        'supply_demand': SupplyDemandIndicator,
  
        'harmonic': HarmonicIndicator,
        'hv_iv': HVIVIndicator
    };
   

    private panes: Map<string, IChartApi> = new Map();
    private paneCounter: number = 0;


    constructor(chart: IChartApi) {
        this.chart = chart;
        this.initializePriceScales();
    }


    public setCandleSeries(candleSeries: any): void {
        this.candleSeries = candleSeries;
        console.log(`[IndicatorManager] ✅ Candle series set for marker-based indicators`);
    }

    public hasCandleSeries(): boolean {
        return !!this.candleSeries;
    }


    // 🔥 الدالة الرئيسية الوحيدة التي تستدعي من useEffect
    syncIndicators(indicators: Record<string, any>): void {
        console.log(`📊 [IndicatorManager] Syncing ${Object.keys(indicators).length} indicators`);


        console.log("📊 [IndicatorManager] Raw indicators received:", indicators);
        Object.entries(indicators).forEach(([id, data]) => {
            const indicator = this.indicators.get(id);
            console.log(`[IndicatorManager] Processing ${id}:`, data);
           
          

            if (indicator) {
                // 🔥 تحديث المؤشر الموجود
                console.log(`[Manager] 🔄 Updating ${id} with ${data.values?.length || 0} values`);

                // هل البيانات تحتوي على إشارة أنها من candle_close؟
                const isCandleClose = data.source === 'candle_close' ||
                    (data.values && data.values.length === 1);

                if (isCandleClose) {
                    // إغلاق شمعة → ندمج مع البيانات الحالية
                    const currentData = indicator.getSeries()?.[0]?.data() || [];
                    const lastPoint = currentData[currentData.length - 1];

                    if (lastPoint && data.values[0] !== undefined) {
                        // تحديث آخر نقطة بقيمة الإغلاق
                        indicator.updateData({
                            values: [data.values[0]],
                            liveTime: Math.floor(lastPoint.time as number),
                            metadata: data.metadata,
                            signals: data.signals
                            
                        });
                    }
                } else {
                    // بيانات كاملة أو إعادة تعيين
                    indicator.updateData({
                        values: data.values || [],
                        metadata: data.metadata,
                        signals: data.signals
                        
                    });
                }
            } else {
                // 🔥 إنشاء مؤشر جديد
                this.createAndAddIndicator(id, data);
            }
        });
        const currentIds = Object.keys(indicators);
        const existingIds = Array.from(this.indicators.keys());

        // 1. إزالة المؤشرات المحذوفة
        this.removeDeletedIndicators(currentIds);

        // 2. تحديث المؤشرات الموجودة
        existingIds.forEach(id => {
            if (indicators[id]) {
                this.updateIndicator(id, indicators[id]);
            }
        });

        // 3. إضافة المؤشرات الجديدة
        currentIds.forEach(id => {
            if (!this.indicators.has(id)) {
                this.createAndAddIndicator(id, indicators[id]);
            }
        });

        console.log(`✅ [IndicatorManager] Sync complete. Active indicators: ${this.indicators.size}`);
    }


    // في indicator-manager.ts - أضف هذه الدوال

    private handleSMA(id: string, data: any): void {
        console.log(`[Manager] 📈 ========== HANDLE SMA START ==========`);

        try {
            // استخراج بيانات SMA
            const smaData = this.extractSimpleLineData(data, 'sma');

            if (!smaData || !smaData.values || smaData.values.length === 0) {
                console.warn(`[Manager] ⚠️ No valid SMA data for ${id}`);
                return;
            }

            console.log(`[Manager] ✅ Extracted SMA data:`, {
                valuesLength: smaData.values.length,
                metadata: smaData.metadata,
                source: smaData.source,
                isHistorical: smaData.isHistorical
            });

            // إنشاء أو تحديث المؤشر
            let indicator = this.indicators.get(id) as SMAIndicator;

            if (!indicator) {
                console.log(`[Manager] 🆕 Creating new SMA indicator: ${id}`);

                const config: IndicatorConfig = {
                    id,
                    name: smaData.name || 'SMA',
                    type: 'line',
                    overlay: true, // 🔥 SMA يكون overlay على الشارت الرئيسي
                    priceScaleId: 'right',
                    color: '#ff6b35' // لون برتقالي
                };

                indicator = new SMAIndicator(this.chart, config);
                indicator.createSeries();
                this.indicators.set(id, indicator);
            } else {
                console.log(`[Manager] 🔄 Updating existing SMA indicator: ${id}`);
            }

            // تحديث البيانات
            indicator.updateData({
                values: smaData.values,
                metadata: smaData.metadata,
                signals: smaData.signals,
                isHistorical: smaData.isHistorical,
                isInitialData: smaData.isInitialData,
                isLiveUpdate: smaData.isLiveUpdate,
                liveTime: smaData.liveTime
            });

            console.log(`[Manager] ✅ SMA "${id}" processed successfully`);

        } catch (error) {
            console.error(`[Manager] ❌ Failed to handle SMA ${id}:`, error);
        }

        console.log(`[Manager] 📈 ========== HANDLE SMA END ==========`);
    }

    private handleEMA(id: string, data: any): void {
        console.log(`[Manager] 📉 ========== HANDLE EMA START ==========`);

        try {
            // استخراج بيانات EMA
            const emaData = this.extractSimpleLineData(data, 'ema');

            if (!emaData || !emaData.values || emaData.values.length === 0) {
                console.warn(`[Manager] ⚠️ No valid EMA data for ${id}`);
                return;
            }

            console.log(`[Manager] ✅ Extracted EMA data:`, {
                valuesLength: emaData.values.length,
                metadata: emaData.metadata,
                source: emaData.source,
                isHistorical: emaData.isHistorical
            });

            // إنشاء أو تحديث المؤشر
            let indicator = this.indicators.get(id) as EMAIndicator;

            if (!indicator) {
                console.log(`[Manager] 🆕 Creating new EMA indicator: ${id}`);

                const config: IndicatorConfig = {
                    id,
                    name: emaData.name || 'EMA',
                    type: 'line',
                    overlay: true, // 🔥 EMA يكون overlay على الشارت الرئيسي
                    priceScaleId: 'right',
                    color: '#00b894' // لون أخضر
                };

                indicator = new EMAIndicator(this.chart, config);
                indicator.createSeries();
                this.indicators.set(id, indicator);
            } else {
                console.log(`[Manager] 🔄 Updating existing EMA indicator: ${id}`);
            }

            // تحديث البيانات
            indicator.updateData({
                values: emaData.values,
                metadata: emaData.metadata,
                signals: emaData.signals,
                isHistorical: emaData.isHistorical,
                isInitialData: emaData.isInitialData,
                isLiveUpdate: emaData.isLiveUpdate,
                liveTime: emaData.liveTime
            });

            console.log(`[Manager] ✅ EMA "${id}" processed successfully`);

        } catch (error) {
            console.error(`[Manager] ❌ Failed to handle EMA ${id}:`, error);
        }

        console.log(`[Manager] 📉 ========== HANDLE EMA END ==========`);
    }




    private extractSimpleLineData(data: any, indicatorType: string): any {
        console.log(`[Manager] 🔍 Extracting ${indicatorType.toUpperCase()} data from:`, {
            hasRawData: !!data.rawData,
            rawValuesLength: data.rawData?.values?.length,
            hasValues: !!data.values,
            valuesLength: data.values?.length,
            hasIndData: !!data.indData,
            source: data.source
        });

        const indicatorKey = indicatorType.toLowerCase();

        // 🔥 الأولوية: rawData (للبيانات التاريخية الكاملة)
        if (data.rawData && data.rawData.values && data.rawData.values.length > 0) {
            console.log(`[Manager] 📦 Using rawData for ${indicatorType}, length: ${data.rawData.values.length}`);
            return {
                values: data.rawData.values,
                metadata: data.rawData.metadata || data.metadata || data.meta || {},
                signals: data.signals,
                name: data.rawData.name || data.name || indicatorType.toUpperCase(),
                source: data.rawData.source || 'rawData',
                isHistorical: true,
                isInitialData: true
            };
        }

        // 🔥 البحث في indicators_results
        if (data.indicators_results?.[indicatorKey]) {
            const resultData = data.indicators_results[indicatorKey];
            console.log(`[Manager] 📦 Found ${indicatorType} in indicators_results, length: ${resultData.values?.length}`);

            return {
                values: resultData.values || [],
                metadata: resultData.metadata || {},
                signals: resultData.signals,
                name: resultData.name || indicatorType.toUpperCase(),
                source: 'indicators_results',
                isHistorical: true
            };
        }

        // 🔥 البحث في indicators
        if (data.indicators?.[indicatorKey]) {
            const indData = data.indicators[indicatorKey];
            const isLiveUpdate = indData.values?.length === 1;

            console.log(`[Manager] 📦 Found ${indicatorType} in indicators, length: ${indData.values?.length}, live: ${isLiveUpdate}`);

            return {
                values: indData.values || [],
                metadata: indData.metadata || {},
                signals: indData.signals,
                name: indData.name || indicatorType.toUpperCase(),
                source: 'indicators',
                isLiveUpdate: isLiveUpdate,
                liveTime: data.liveTime
            };
        }

        // 🔥 البيانات المباشرة
        if (data.values && data.values.length > 0) {
            console.log(`[Manager] 📦 Using direct values for ${indicatorType}, length: ${data.values.length}`);

            return {
                values: data.values,
                metadata: data.metadata || data.meta || {},
                signals: data.signals,
                name: data.name || indicatorType.toUpperCase(),
                source: data.source || 'direct',
                isHistorical: data.isHistorical || data.isInitialData || false,
                isLiveUpdate: data.values.length === 1
            };
        }

        // 🔥 indData
        if (data.indData && data.indData.values) {
            console.log(`[Manager] 📦 Using indData for ${indicatorType}, length: ${data.indData.values.length}`);

            return {
                values: data.indData.values,
                metadata: data.indData.metadata || {},
                signals: data.indData.signals,
                name: data.indData.name || indicatorType.toUpperCase(),
                source: 'indData',
                isHistorical: true,
                isInitialData: true
            };
        }

        console.warn(`[Manager] ⚠️ No ${indicatorType} data found`);
        return null;
    }

    private formatTimeForManager(time: number | string): UTCTimestamp {
        let timestamp: number;
        if (typeof time === 'string') {
            timestamp = new Date(time).getTime();
        } else {
            timestamp = time;
        }
        if (timestamp > 1000000000000) {
            return Math.floor(timestamp / 1000) as UTCTimestamp;
        }
        return timestamp as UTCTimestamp;
    }


    updateLiveIndicators(data: any): void {
        if (!data.indicators) return;

        // const candleTime = Math.floor(new Date(data.live_candle.time).getTime() / 1000);
        const candleTime = this.formatTimeForManager(data.live_candle.time);
        console.log(`[Manager] ⚡ Live update at ${candleTime}`);

        Object.entries(data.indicators).forEach(([id, indData]: [string, any]) => {
            const indicator = this.indicators.get(id);
            if (indicator) {
                // 🔥 مهم: نأخذ أول قيمة فقط (لأنها دائماً مصفوفة من قيمة واحدة)
                const values = indData.values || [];
                const value = values[0]; // القيمة الوحيدة

                if (id.toLowerCase().includes('climax')) {
                    this.handleVolumeClimaxLiveUpdate(indicator, indData, data.live_candle);
                }

                if (value !== null && value !== undefined) {
                    indicator.updateData({
                        values: [value], // أرسلها كمصفوفة
                
                        liveTime: candleTime,
                        metadata: indData.metadata,
                        signals: indData.signals
                    });

                    console.log(`[Manager] 📊 ${data.type} update for ${id}: ${value} at ${candleTime}`);
                }
            } else {
                console.warn(`[Manager] ⚠️ Indicator ${id} not found for ${data.type}`);
            }

            if (indicator) {
                // 🔥 معالجة خاصة لـ MACD
                if (id.toLowerCase().includes('macd')) {
                    this.handleMACDLiveUpdate(indicator, indData, candleTime, data.type);
                } else {
                    // باقي المؤشرات
                    const values = indData.values || [];
                    const value = values[0];

                    if (value !== null && value !== undefined) {
                        indicator.updateData({
                            values: [value],
                            liveTime: candleTime,
                            metadata: indData.metadata,
                            signals: indData.signals
                        });
                    }
                }
            } else {
                console.warn(`[Manager] ⚠️ Indicator ${id} not found for live update`);
            }
        });
    }

    private handleVolumeClimax(id: string, data: any): void {
        console.log(`[Manager] 🔴 ========== HANDLE VOLUME CLIMAX START ==========`);

        try {
            let climaxData: any = null;
            let source = 'unknown';

            // 🔥 البحث 1: في data.metadata مباشرة (هذا هو الحل!)
            if (data.metadata?.climax_points && Array.isArray(data.metadata.climax_points)) {
                climaxData = data;
                source = 'direct metadata (FIX)';
                console.log(`[Manager] ✅ Found in direct metadata (FIX)`);
            }
            // البحث 2: في data.indicators_results.volume_climax.metadata
            else if (data.indicators_results?.volume_climax?.metadata?.climax_points) {
                climaxData = {
                    ...data.indicators_results.volume_climax,
                    metadata: data.indicators_results.volume_climax.metadata
                };
                source = 'indicators_results.metadata';
                console.log(`[Manager] ✅ Found in indicators_results.metadata`);
            }
            // البحث 3: في data.indicators.volume_climax.metadata
            else if (data.indicators?.volume_climax?.metadata?.climax_points) {
                climaxData = {
                    ...data.indicators.volume_climax,
                    metadata: data.indicators.volume_climax.metadata
                };
                source = 'indicators.metadata';
                console.log(`[Manager] ✅ Found in indicators.metadata`);
            }
            // البحث 4: في direct data بدون climax points (سيتم معالجته لاحقاً)
            else if (data.indicator === 'volume_climax' || data.name === 'volume_climax' || data.name === 'climax') {
                climaxData = {
                    values: data.values || [],
                    metadata: data.metadata || {},
                    signals: data.signals,
                    name: data.name || 'Volume Climax'
                };
                source = 'direct data (no climax yet)';
                console.log(`[Manager] ✅ Found in direct data without climax points (will be updated later)`);
            }

            if (!climaxData) {
                console.warn(`[Manager] ⚠️ No Volume Climax data found`);
                console.log(`[Manager] 🔍 Data structure:`, {
                    hasMetadata: !!data.metadata,
                    metadataKeys: data.metadata ? Object.keys(data.metadata) : [],
                    hasIndicatorsResults: !!data.indicators_results,
                    indicatorsResultsKeys: data.indicators_results ? Object.keys(data.indicators_results) : [],
                    hasIndicators: !!data.indicators,
                    indicatorsKeys: data.indicators ? Object.keys(data.indicators) : [],
                    valuesLength: data.values?.length
                });
                return;
            }

            console.log(`[Manager] 🔴 Preparing from source: ${source}`);
            console.log(`[Manager] 🔴 Metadata:`, climaxData.metadata);
            console.log(`[Manager] 🔴 Has climax_points:`, !!climaxData.metadata?.climax_points);
            console.log(`[Manager] 🔴 Climax points length:`, climaxData.metadata?.climax_points?.length || 0);

            const config: IndicatorConfig = {
                id,
                name: climaxData.name || 'Volume Climax',
                type: 'overlay',
                overlay: true,
                priceScaleId: 'volume',
                color: '#FF0000'
            };

            let indicator: VolumeClimaxIndicator;
            if (this.indicators.has(id)) {
                indicator = this.indicators.get(id) as VolumeClimaxIndicator;
                console.log(`[Manager] 🔄 Updating existing Volume Climax indicator`);
            } else {
                // 🔥 لا نمرير candleSeries لأن المؤشر ينشئ Line series خاصة
                indicator = new VolumeClimaxIndicator(this.chart, config);
                indicator.createSeries();
                this.indicators.set(id, indicator);
                console.log(`[Manager] 🆕 Created new Volume Climax indicator`);
            }

            const indicatorData: IndicatorData = {
                values: climaxData.values || [],
                metadata: climaxData.metadata || {},
                signals: climaxData.signals,
                liveTime: data.liveTime || data.live_candle?.time
            };

            console.log(`[Manager] 🔴 Updating Volume Climax with liveTime:`, indicatorData.liveTime);

            indicator.updateData(indicatorData);
            console.log(`[Manager] ✅ Volume Climax "${id}" processed successfully`);
        } catch (error) {
            console.error(`[Manager] 🔴 ❌ Failed to handle Volume Climax ${id}:`, error);
        }

        console.log(`[Manager] 🔴 ========== HANDLE VOLUME CLIMAX END ==========`);
    }




    private handleVolumeClimaxLiveUpdate(indicator: BaseIndicator, data: any, liveCandle: any): void {
        // إذا كانت القيمة 1 في التحديث الحي، أضف علامة على الشمعة الحية
        const values = data.values || [];

        if (values[0] === 1 && liveCandle) {
            const climaxPoint = {
                time: new Date(liveCandle.time).toISOString(),
                high: liveCandle.high,
                low: liveCandle.low
            };

            indicator.updateData({
                values: values,
                metadata: {
                    climax_points: [climaxPoint]
                },
                signals: data.signals
            });
        }
    }



    private handleMACDLiveUpdate(
        indicator: BaseIndicator,
        data: any,
        time: number,
        updateType: string
    ): void {
        const values = data.values || [];
        const value = values[0];

        if (value !== null && value !== undefined) {
            indicator.updateData({
                values: [value],
                liveTime: time,
                metadata: data.metadata,
                signals: data.signals,
                updateType: updateType
            });

            console.log(`[Manager] ⚡ MACD live update: ${value} at ${time}`);
        }
    }


    // في indicator-manager.ts - أضف هذه الدالة
    private handleOBV(id: string, data: any): void {
        console.log(`[Manager] 📊 ========== HANDLE OBV START ==========`);

        try {
            // استخراج بيانات OBV
            const obvData = this.extractOBVData(data);

            if (!obvData || !obvData.values || obvData.values.length === 0) {
                console.warn(`[Manager] ⚠️ No valid OBV data for ${id}`);
                return;
            }

            console.log(`[Manager] ✅ Extracted OBV data:`, {
                valuesLength: obvData.values.length,
                hasSignals: !!obvData.signals,
                signalsLength: obvData.signals?.data?.length,
                metadata: obvData.metadata,
                source: obvData.source,
                isHistorical: obvData.isHistorical
            });

            // إنشاء أو تحديث المؤشر
            let indicator = this.indicators.get(id) as OBVIndicator;

            if (!indicator) {
                console.log(`[Manager] 🆕 Creating new OBV indicator: ${id}`);

                const config: IndicatorConfig = {
                    id,
                    name: obvData.name || 'OBV',
                    type: 'oscillator',
                    overlay: false, // 🔥 OBV ليس overlay، له منطقة منفصلة
                    priceScaleId: 'obv_scale',
                    color: '#8A2BE2' // لون بنفسجي
                };

                indicator = new OBVIndicator(this.chart, config);
                indicator.createSeries();
                this.indicators.set(id, indicator);
            } else {
                console.log(`[Manager] 🔄 Updating existing OBV indicator: ${id}`);
            }

            // تحديث البيانات
            indicator.updateData({
                values: obvData.values,
                metadata: obvData.metadata,
                signals: obvData.signals,
                isHistorical: obvData.isHistorical,
                isInitialData: obvData.isInitialData,
                isLiveUpdate: obvData.isLiveUpdate,
                liveTime: obvData.liveTime
            });

            console.log(`[Manager] ✅ OBV "${id}" processed successfully`);

        } catch (error) {
            console.error(`[Manager] ❌ Failed to handle OBV ${id}:`, error);
        }

        console.log(`[Manager] 📊 ========== HANDLE OBV END ==========`);
    }
    private extractOBVData(data: any): any {
        console.log(`[Manager] 🔍 Extracting OBV data from:`, {
            hasRawData: !!data.rawData,
            rawValuesLength: data.rawData?.values?.length,
            hasValues: !!data.values,
            valuesLength: data.values?.length,
            hasIndData: !!data.indData,
            source: data.source,
            hasSignals: !!data.signals
        });

        // 🔥 الأولوية: rawData (للبيانات التاريخية الكاملة)
        if (data.rawData && data.rawData.values && data.rawData.values.length > 0) {
            console.log(`[Manager] 📦 Using rawData for OBV, length: ${data.rawData.values.length}`);
            return {
                values: data.rawData.values,
                metadata: data.rawData.metadata || data.metadata || data.meta || {},
                signals: data.rawData.signals || data.signals,
                name: data.rawData.name || data.name || 'OBV',
                source: data.rawData.source || 'rawData',
                isHistorical: true,
                isInitialData: true
            };
        }

        // 🔥 البحث في indicators_results
        if (data.indicators_results?.obv) {
            const obvData = data.indicators_results.obv;
            console.log(`[Manager] 📦 Found OBV in indicators_results, length: ${obvData.values?.length}`);

            return {
                values: obvData.values || [],
                metadata: obvData.metadata || {},
                signals: obvData.signals,
                name: obvData.name || 'OBV',
                source: 'indicators_results',
                isHistorical: true
            };
        }

        // 🔥 البحث في indicators
        if (data.indicators?.obv) {
            const obvData = data.indicators.obv;
            const isLiveUpdate = obvData.values?.length === 1;

            console.log(`[Manager] 📦 Found OBV in indicators, length: ${obvData.values?.length}, live: ${isLiveUpdate}`);

            return {
                values: obvData.values || [],
                metadata: obvData.metadata || {},
                signals: obvData.signals,
                name: obvData.name || 'OBV',
                source: 'indicators',
                isLiveUpdate: isLiveUpdate,
                liveTime: data.liveTime
            };
        }

        // 🔥 البيانات المباشرة
        if (data.values && data.values.length > 0) {
            console.log(`[Manager] 📦 Using direct values for OBV, length: ${data.values.length}`);

            return {
                values: data.values,
                metadata: data.metadata || data.meta || {},
                signals: data.signals,
                name: data.name || 'OBV',
                source: data.source || 'direct',
                isHistorical: data.isHistorical || data.isInitialData || false,
                isLiveUpdate: data.values.length === 1
            };
        }

        // 🔥 indData
        if (data.indData && data.indData.values) {
            console.log(`[Manager] 📦 Using indData for OBV, length: ${data.indData.values.length}`);

            return {
                values: data.indData.values,
                metadata: data.indData.metadata || {},
                signals: data.indData.signals,
                name: data.indData.name || 'OBV',
                source: 'indData',
                isHistorical: true,
                isInitialData: true
            };
        }

        console.warn(`[Manager] ⚠️ No OBV data found`);
        return null;
    }


    private handleSMCOrderBlock(id: string, data: any): void {
        // -------------------------------------------------------------
        // 1. استخراج البيانات من هيكل الباك إند (Production Safe)
        // -------------------------------------------------------------
        // السجلات تشير إلى أن البيانات تأتي في key اسمه 'meta'
        // نأخذ 'meta' أولاً، وإذا لم يوجد نأخذ 'metadata' كإحتياط
        const rawData = data.meta || data.metadata;

        if (!rawData) {
            console.warn('[IndicatorManager] ⚠️ SMC data received but "meta" or "metadata" is missing.');
            return;
        }

        // التحقق من وجود البيانات الأساسية
        const blocks = rawData.order_blocks || [];
        const points = rawData.swing_points || [];

        if (blocks.length === 0 && points.length === 0) {
            console.log('[IndicatorManager] ℹ️ SMC data is empty (no blocks or points)');
            // لا نرجع، فقد يرغب المستخدم في مسح الرسم الحالي إذا كانت البيانات فارغة
        }

        // -------------------------------------------------------------
        // 2. إدارة حالة المؤشر (Create or Update)
        // -------------------------------------------------------------
        let indicator = this.indicators.get(id) as SMCOrderBlockIndicator;

        if (!indicator) {
            // === إنشاء مؤشر جديد ===
            console.log('[IndicatorManager] 🆕 Creating SMC Order Block Indicator...');

            const config: IndicatorConfig = {
                id: id,
                name: data.name || 'SMC Order Blocks',
                type: 'primitive', // مهم جداً للتمييز
                overlay: true,     // يرسم على الشارت الرئيسي
                priceScaleId: '',  // Primitives لا تحتاج ID خاص للـ Price Scale
                color: '#FFFFFF'   // لون افتراضي (لن يستخدم بسبب الرسم المخصص)
            };

            // التحقق من توفر سلسلة الشموع الرئيسية
            if (!this.candleSeries) {
                console.error('[IndicatorManager] ❌ Cannot create SMC Indicator: Main candle series is missing.');
                return;
            }

            try {
                indicator = new SMCOrderBlockIndicator(this.chart, config, this.candleSeries);
                indicator.createSeries(); // يُنشئ الـ Primitive داخلياً
                this.indicators.set(id, indicator);
                console.log('[IndicatorManager] ✅ SMC Indicator created and attached.');
            } catch (err) {
                console.error('[IndicatorManager] ❌ Failed to instantiate SMC Indicator:', err);
                return;
            }
        }

        // -------------------------------------------------------------
        // 3. إعداد البيانات للتحديث (Mapping)
        // -------------------------------------------------------------
        // نحتاج لتغليف البيانات الخام داخل كائن IndicatorData
        // SMCIndicator يتوقع البيانات تحت metadata
        const updatePayload: IndicatorData = {
            values: [], // SMC يستخدم Metadata فقط، Values غير مستخدمة هنا
            metadata: rawData, // نمرر الكائن الذي يحتوي order_blocks و swing_points
            signals: data.signals || null,
            liveTime: data.liveTime || undefined
        };

        // -------------------------------------------------------------
        // 4. تنفيذ التحديث
        // -------------------------------------------------------------
        try {
            indicator.updateData(updatePayload);

            // سجل موجز للأداء
            // console.log(`[IndicatorManager] 🔄 SMC Updated: ${blocks.length} Blocks, ${points.length} Points`);
        } catch (err) {
            console.error('[IndicatorManager] ❌ Error while updating SMC Indicator:', err);
        }
    }
    private createAndAddIndicator(id: string, data: any): void {
        const name = data.name || id;
        const nameLower = name.toLowerCase();

        console.log(`[IndicatorManager] 🆕 Creating indicator: ${name}`);

        // --- الهاندلرز الخاصة بك (نفس الترتيب الأصلي) ---
        if (nameLower.includes('bollinger') || nameLower.includes('bb') || nameLower.includes('band')) {
            this.handleBollingerBands(id, data);
            return;
        }

        if (nameLower.includes('smc_order_block') || nameLower.includes('order_block')) {
            this.handleSMCOrderBlock(id, data);
            return;
        }

        if (nameLower.includes('rsi')) {
            this.handleRSI(id, data);
            return;
        }

        if (nameLower.includes('atr')) {
            this.handleATR(id, data);
            return;
        }

        if (nameLower.includes('macd')) {
            this.handleMACD(id, data);
            return;
        }

        if (nameLower.includes('ema')) {
            this.handleEMA(id, data);
            return;
        }

        if (nameLower.includes('sma')) {
            this.handleSMA(id, data);
            return;
        }

        if (nameLower.includes('obv')) {
            this.handleOBV(id, data);
            return;
        }

        if (nameLower.includes('volume_climax') || nameLower.includes('climax')) {
            this.handleVolumeClimax(id, data);
            return;
        }


        // if (nameLower.includes('climax')) {
        //     this.handleVolumeClimax(id, data);
        //     return;
        // }
        

        // --- الإضافات الجديدة داخل الـ try لمعالجة الكلاسات المتقدمة ---
        try {
            const config = this.createIndicatorConfig(id, data);
            const indicatorClass = this.getIndicatorClass(config.name, config.type);

            if (!indicatorClass) {
                console.warn(`[IndicatorManager] ⚠️ No indicator class found for: ${config.name}`);
                return;
            }

            // 🔥 الإضافة 1: تمرير candleSeries للمؤشرات المتقدمة (Climax, Supply, Harmonic)
            // المؤشرات العادية ستتجاهل هذا البارامتر الثالث تلقائياً
            const indicator = new indicatorClass(this.chart, config, this.candleSeries);
            if (nameLower.includes('climax')) {
                // 🔥 تمرير 'data' بالكامل لضمان وصول 'meta' و 'metadata'
                indicator.updateData(data);
                this.indicators.set(id, indicator);
                return;
            }
            // 🔥 الإضافة 2: منع إنشاء Series للمؤشرات التي ترسم ماركرز فقط (مثل Climax)
            // لضمان عدم ظهور الخط الأزرق عند قيمة صفر
            const isMarkersOnly = nameLower.includes('climax');

            if (!isMarkersOnly) {
                indicator.createSeries();
            }

            // معالجة البيانات وتحديثها
            const processedData = this.processIndicatorData(data, indicator);
            indicator.updateData(processedData);

            this.indicators.set(id, indicator);

            console.log(`✅ [IndicatorManager] Created indicator: ${config.name} (${config.type})`);
        } catch (error) {
            console.error(`❌ [IndicatorManager] Failed to create indicator ${id}:`, error);
        }
    }

    private handleMACD(id: string, data: any): void {
        console.log(`[Manager] 🔵 ========== HANDLE MACD START ==========`);

        try {
            // 🔥 الحل الجذري: استخراج التواريخ (index) من الـ Root Data مباشرة
            // لأن السيرفر يضع تواريخ جميع الشموع في الجذر، وليس داخل كل مؤشر
            const rootSignals = data.signals;
            const rootIndex = rootSignals?.index || [];

            console.log(`[Manager] 🔵 Root Index found: ${rootIndex.length} timestamps`);

            let macdData = data;

            // إذا كانت البيانات مفرعة داخل indicators_results
            if (data.indicators_results && data.indicators_results.macd) {
                console.log(`[Manager] 🔵 Using nested data from indicators_results.macd`);
                macdData = data.indicators_results.macd;
            } else if (data.metadata && (data.metadata.macd_line || data.metadata.values)) {
                console.log(`[Manager] 🔵 Using direct metadata`);
                macdData = data; // البيانات نفسها تحتوي على الميتاداتا
            }

            // إنشاء المؤشر
            const config: IndicatorConfig = {
                id,
                name: macdData.name || 'MACD',
                type: 'oscillator',
                overlay: false,
                priceScaleId: 'macd_scale',
            };

            const indicator = new MACDIndicator(this.chart, config);
            indicator.createSeries();

            // 🔥 التعديل الحاسم: تمرير الـ Root Signals إلى المؤشر
            const indicatorData: IndicatorDataMACD = {
                values: macdData.values || [],
                metadata: macdData.metadata || macdData.meta || {},
                // نمرر الـ Root Signals هنا، وليس signals الخاص بالـ macdData
                signals: rootSignals, 
                indicators_results: data.indicators_results
            };

            console.log(`[Manager] 🔵 Updating MACD indicator with Root Index...`);
            indicator.updateData(indicatorData);

            this.indicators.set(id, indicator);

            console.log(`[Manager] 🔵 ✅ MACD created successfully`);

        } catch (error) {
            console.error(`[Manager] 🔵 ❌ Failed to create MACD:`, error);
        }

        console.log(`[Manager] 🔵 ========== HANDLE MACD END ==========`);
    }






    public toggleIndicatorVisibility(id: string, isVisible: boolean): void {
        const indicator = this.indicators.get(id);
        if (indicator) {
            // الطريقة الأولى: استدعاء setVisible إذا كانت موجودة
            indicator.setVisible(isVisible);

            // 🔥 الإضافة الجديدة: تطبيق الرؤية مباشرة على series
            const series = indicator.getSeries();
            if (series && Array.isArray(series)) {
                series.forEach((s) => {
                    try {
                        s.applyOptions({ visible: isVisible });
                        console.log(`[Manager] 👁️ Series visibility set for ${id}: ${isVisible}`);
                    } catch (error) {
                        console.error(`[Manager] ❌ Failed to set visibility for series:`, error);
                    }
                });
            }

            console.log(`[Manager] 👁️ Visibility toggled for ${id}: ${isVisible}`);
        } else {
            console.warn(`[Manager] ⚠️ Indicator ${id} not found to toggle visibility`);
        }
    }

    // دالة لحذف المؤشر
    public removeIndicatorById(id: string): void {
        this.removeIndicator(id);
    }




    public handleATR(id: string, data: any): void {
        console.log(`[Manager] 🟢 ========== HANDLE ATR START ==========`);

        try {
            console.log(`[Manager] 🔍 Raw ATR data received:`, data);

            let atrData: any = null;
            let source = 'unknown';

            // البحث في مصادر متعددة للبيانات التاريخية والحية
            if (data.indicators_results?.atr) {
                atrData = data.indicators_results.atr;
                source = 'indicators_results.atr';
                console.log(`[Manager] ✅ Found ATR in indicators_results.atr, values length: ${atrData.values?.length}`);
            } else if (data.indicators?.atr) {
                atrData = data.indicators.atr;
                source = 'indicators.atr';
                console.log(`[Manager] ✅ Found ATR in indicators.atr (live), values length: ${atrData.values?.length}`);
            } else if (data.indicator === 'atr' || data.name === 'atr') {
                atrData = {
                    values: data.values || [],
                    metadata: data.metadata || {},
                    signals: data.signals,
                    name: data.name || 'ATR'
                };
                source = 'direct_data';
                console.log(`[Manager] ✅ Found ATR in direct data, values length: ${atrData.values?.length}`);
            }

            if (!atrData) {
                console.warn(`[Manager] ⚠️ No ATR data found`);
                return;
            }

            console.log(`[Manager] 🟢 Preparing ATR indicator from source: ${source}`);

            // إعداد المؤشر
            const config: IndicatorConfig = {
                id,
                name: atrData.name || 'ATR',
                type: 'oscillator',
                overlay: false,
                priceScaleId: 'atr_scale',
                color: '#22c55e'
            };

            let indicator: ATRIndicator;
            if (this.indicators.has(id)) {
                indicator = this.indicators.get(id) as ATRIndicator;
                console.log(`[Manager] 🔄 Updating existing ATR indicator`);
            } else {
                indicator = new ATRIndicator(this.chart, config);
                indicator.createSeries();
                this.indicators.set(id, indicator);
                console.log(`[Manager] 🆕 Created new ATR indicator`);
            }

            // تمرير البيانات للمؤشر
            const indicatorData: any = {
                values: atrData.values || [],
                metadata: atrData.metadata || {},
                signals: atrData.signals,
                liveTime: data.liveTime || data.live_candle?.time,
                isLive: source === 'indicators.atr'
            };

            indicator.updateData(indicatorData);
            console.log(`[Manager] ✅ ATR indicator "${id}" processed successfully, values count: ${indicatorData.values.length}`);
        } catch (error) {
            console.error(`[Manager] ❌ Failed to handle ATR ${id}:`, error);
        }

        console.log(`[Manager] 🟢 ========== HANDLE ATR END ==========`);
    }


    private handleRSI(id: string, data: any): void {
        try {
            const config: IndicatorConfig = {
                id,
                name: data.name ,
                type: 'oscillator',
                overlay: false,
                priceScaleId: 'rsi_scale',
                color: '#7E57C2'
            };

            const indicator = new RSIIndicator(this.chart, config);
            indicator.createSeries();

            const indicatorData: IndicatorData = {
                values: data.values || [],
                metadata: data.metadata || data.meta,
                signals: data.signals
            };

            indicator.updateData(indicatorData);
            this.indicators.set(id, indicator);

            console.log(`✅✅✅ [Manager] ✅✅✅RSI created with metadata:`, indicatorData.metadata);

            
        } catch (error) {
            console.error(`❌ [Manager] Failed to create RSI:`, error);
        }
    }



        private updateIndicator(id: string, data: any): void {
            const indicator = this.indicators.get(id);
            if (!indicator) return;

            try {
                // حالة: values عبارة عن مصفوفة بها عنصر واحد وهو كائن يحتوي time & value
                const isSingleObjectPoint =
                    Array.isArray(data.values) &&
                    data.values.length === 1 &&
                    typeof data.values[0] === 'object' &&
                    (data.values[0].time !== undefined || data.values[0].timestamp !== undefined);

                if (isSingleObjectPoint) {
                    const pt = data.values[0];
                    const timeMs = pt.time ?? pt.timestamp;
                    const liveTime = Math.floor(new Date(timeMs).getTime() / 1000);

                    const lastValue = pt.value;
                    indicator.updateData({
                        values: [lastValue],
                        liveTime,
                        metadata: data.metadata,
                        signals: data.signals
                    });
                    return;
                }

                // حالة: values تحتوي عنصر واحد كرقم (بدون time) — أفضل لو يرسل السيرفر timestamps
                const isSingleNumeric = Array.isArray(data.values) && data.values.length === 1 && typeof data.values[0] === 'number';
                if (isSingleNumeric) {
                    // حاول استخدام signals.index إن وُجد لإيجاد التوقيت، وإلا اعتبرها live بدون time
                    let liveTime: number | undefined = undefined;
                    if (data.signals && Array.isArray(data.signals.index) && data.signals.index.length > 0) {
                        const idx = data.signals.index.length - 1;
                        liveTime = Math.floor(new Date(data.signals.index[idx]).getTime() / 1000);
                    }
                    indicator.updateData({
                        values: [data.values[0]],
                        liveTime,
                        metadata: data.metadata,
                        signals: data.signals
                    });
                    return;
                }
                const processedData = this.processIndicatorData(data, indicator);
                indicator.updateData(processedData);
            } catch (error) {
                console.error(`[IndicatorManager] ❌ Error updating indicator ${id}:`, error);
            }
        }


    // 🔥 إزالة المؤشرات المحذوفة
    private removeDeletedIndicators(currentIds: string[]): void {
        const idsToRemove: string[] = [];

        this.indicators.forEach((_, id) => {
            if (!currentIds.includes(id)) {
                idsToRemove.push(id);
            }
        });

        idsToRemove.forEach(id => {
            this.removeIndicator(id);
        });
    }

    // 🔥 معالجة البيانات حسب نوع المؤشر
    private processIndicatorData(data: any, indicator: BaseIndicator): IndicatorData {
        const indicatorType = indicator.getType();

        switch (indicatorType) {
            case 'oscillator':
                return this.processOscillatorData(data);
            case 'band':
                return this.processBandData(data);
            case 'histogram':
                return this.processHistogramData(data);
            default:
                return {
                    values: data.values || [],
                    metadata: data.metadata || data.meta || {},
                    signals: data.signals,
                };
        }
    }

    // 🔥 معالجة بيانات المؤشرات التذبذبية
    private processOscillatorData(data: any): IndicatorData {
        const baseData: IndicatorData = {
            values: data.values || [],
            metadata: data.metadata || data.meta || {},
            signals: data.signals,
        };

        // معالجة خاصة لـ RSI إذا كان يحتاج خط إشارة
        if (data.meta?.signal_line) {
            baseData.metadata = {
                ...baseData.metadata,
                signal: data.meta.signal_line
            };
        }

        return baseData;
    }

    // 🔥 معالجة بيانات البولينجر باندز
    private processBandData(data: any): IndicatorData {
        return {
            values: data.values || [],
            metadata: data.meta || data.metadata || {},
            signals: data.signals,
        };
    }

    // 🔥 إضافة دالة خاصة للبولينجر
    private handleBollingerBands(id: string, data: any): boolean {
        console.log(`🔧 [Manager] Handling Bollinger Bands directly for ${id}`);

        try {
            const config: IndicatorConfig = {
                id,
                name: data.name || id,
                type: 'band',
                overlay: true,
                priceScaleId: 'right',
                color: '#2962FF'
            };

            const indicator = new BollingerBandsIndicator(this.chart, config);
            indicator.createSeries();

            const indicatorData: IndicatorData = {
                values: data.values || [],
                metadata: data.metadata,
                signals: data.signals,
            };

            indicator.updateData(indicatorData);
            this.indicators.set(id, indicator);

            console.log(`✅ [Manager] Bollinger Bands handled successfully`);
            return true;
        } catch (error) {
            console.error(`❌ [Manager] Failed to handle Bollinger Bands:`, error);
            return false;
        }
    }

    // 🔥 معالجة بيانات الهيستوجرام
    private processHistogramData(data: any): IndicatorData {
        const baseData: IndicatorData = {
            values: data.values || [],
            metadata: data.meta,
            signals: data.signals,
        };

        // إضافة ألوان للهيستوجرام
        if (data.meta?.colors) {
            baseData.metadata = {
                ...baseData.metadata,
                colors: data.meta.colors
            };
        }

        return baseData;
    }

    // 🔥 الحصول على كلاس المؤشر المناسب
    private getIndicatorClass(name: string, type: string): any {
        const nameLower = name.toLowerCase();

        // البحث عن مؤشر مطابق في السجل
        for (const [key, IndicatorClass] of Object.entries(this.indicatorRegistry)) {
            if (nameLower.includes(key)) {
                return IndicatorClass;
            }
        }
        if (nameLower.includes('volume_climax') || nameLower.includes('climax')) {
            return VolumeClimaxIndicator;
        }

        // إذا لم يوجد، نستخدم النوع الافتراضي
        switch (type) {
            case 'band':
                return BollingerBandsIndicator;
            case 'oscillator':
                return RSIIndicator;
            case 'overlay':
            case 'line':
                return MAIndicator;
            default:
                return null;
        }
    }

    // 🔥 إنشاء إعدادات المؤشر
    private createIndicatorConfig(id: string, data: any): IndicatorConfig {
        const name = data.name || id;
        const type = this.determineIndicatorType(name, data);
        const overlay = this.isOverlayType(type);

        return {
            id,
            name,
            type,
            overlay,
            priceScaleId: this.determinePriceScaleId(type, overlay, id),
            color: this.getIndicatorColor(id),
        };
    }

    private determineIndicatorType(name: string, data: any): IndicatorConfig['type'] {
        const nameLower = name.toLowerCase();

        if (nameLower.includes('supply') || nameLower.includes('harmonic')) {
            return 'overlay'; // لأنها ترسم فوق السعر
        }
        if (nameLower.includes('climax')) {
            return 'overlay'; // العلامات ترسم فوق السعر
        }
        if (nameLower.includes('hv_iv')) {
            return 'area'; // لأنها تلون الخلفية
        }

        if (nameLower.includes('bollinger') || nameLower.includes('bb') || nameLower.includes('band')) {
            return 'band';
        } else if (nameLower.includes('rsi') || nameLower.includes('stochastic') || nameLower.includes('macd')) {
            return 'oscillator';
        } else if (nameLower.includes('ma') || nameLower.includes('ema') || nameLower.includes('sma')) {
            return 'overlay';
        } else if (nameLower.includes('volume') || data.type === 'histogram') {
            return 'histogram';
        } else if (data.type === 'area') {
            return 'area';
        }

        return 'line';
    }

    private isOverlayType(type: IndicatorConfig['type']): boolean {
        return type === 'band' || type === 'overlay';
    }

    private determinePriceScaleId(type: IndicatorConfig['type'], overlay: boolean, id: string): string {
        if (overlay) {
            return 'right';
        } else if (type === 'oscillator') {
            // تحديد مقياس خاص لكل نوع من المؤشرات التذبذبية
            if (id.toLowerCase().includes('rsi')) {
                return 'oscillator_scale';
            } else if (id.toLowerCase().includes('atr')) {
                return 'atr_scale';
            }
            return 'oscillator_scale';
        } else {
            return `indicator_${id}`;
        }
    }

    private getIndicatorColor(id: string): string {
        const colors = ["#2962FF", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8E8"];
        const index = Array.from(this.indicators.keys()).indexOf(id);
        return colors[index >= 0 ? index % colors.length : this.indicators.size % colors.length];
    }

    // 🔥 تهيئة مقاييس الأسعار
    public initializePriceScales(): void {
        try {

            this.chart.priceScale('right').applyOptions({
                scaleMargins: {
                    top: 0.1,    // ترك 10% مساحة في الأعلى
                    bottom: 0.60, // 👈 ترك 35% مساحة فارغة في الأسفل للمؤشرات
                },
                autoScale: true,
                borderVisible: true,
                borderColor: '#444',
            });

   
            this.chart.priceScale('macd_scale').applyOptions({
                scaleMargins: {
                    top: 0.45,
                    bottom: 0.25,
                },
                autoScale: true,
                borderVisible: true,
                borderColor: '#666',
            });

            this.chart.priceScale('rsi_scale').applyOptions({
                scaleMargins: {
                    top: 0.95,
                    bottom: 0.1,
                },
                autoScale: false,
                minimum: 0,
                maximum: 100,
                borderColor: '#666',
            });




            // مقياس المؤشرات التذبذبية (0-100) للـ RSI
            this.chart.priceScale('oscillator_scale').applyOptions({
                scaleMargins: { top: 0.8, bottom: 0.0 },
                autoScale: true,
                borderColor: '#555',
                borderVisible: true,
            });

            // مقياس الـ ATR (منفصل)
            this.chart.priceScale('atr_scale').applyOptions({
                scaleMargins: {
                    top: 0.85,
                    bottom: 0.05,
                },
                autoScale: true,
                visible: true,
                borderVisible: true,
            });

            // مقياس الهيستوجرام
            this.chart.priceScale('histogram_scale').applyOptions({
                scaleMargins: { top: 0.8, bottom: 0.0 },
                autoScale: true,
            });

         
   


            console.log('[IndicatorManager] 📏 Price scales initialized');
        } catch (error) {
            console.warn('[IndicatorManager] 📏 Could not initialize some price scales');
        }
    }

    // 🔥 دوال عامة للاستخدام
    removeIndicator(id: string): boolean {
        const indicator = this.indicators.get(id);
        if (indicator) {
            indicator.destroy();
            this.indicators.delete(id);
            console.log(`✅ [IndicatorManager] Removed indicator: ${id}`);
            return true;
        }
        return false;
    }

    clearAll(): void {
        console.log(`[IndicatorManager] Clearing all ${this.indicators.size} indicators`);
        this.indicators.forEach(indicator => indicator.destroy());
        this.indicators.clear();
    }

    hasIndicator(id: string): boolean {
        return this.indicators.has(id);
    }

    getIndicator(id: string): BaseIndicator | undefined {
        return this.indicators.get(id);
    }

    getAllIndicators(): BaseIndicator[] {
        return Array.from(this.indicators.values());
    }

    getIndicatorCount(): number {
        return this.indicators.size;
    }
}


