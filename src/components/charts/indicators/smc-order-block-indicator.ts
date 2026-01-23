
// \components\charts\indicators\smc-order-block-indicator.ts

// @ts-nocheck

import { IChartApi, ISeriesApi, Time, ITimeScaleApi } from 'lightweight-charts';
import { BaseIndicator, IndicatorConfig, IndicatorData } from './base-indicator';
import {
    SMCOrderBlockPrimitive,
    OrderBlock as PrimitiveOrderBlock,
    SwingPoint
} from './primitives/smc-order-block-primitive';

export class SMCOrderBlockIndicator extends BaseIndicator {
    private _primitive: SMCOrderBlockPrimitive | null = null;
    private _attachedSeries: ISeriesApi<'Candlestick'> | null = null;
    private _chart: IChartApi;
    private _lastUpdateTime: number = 0;
    private _updateDebounceTimeout: any = null;

    // 🔥 إضافة: خاصية لتتبع حالة الرؤية
    private _isVisible: boolean = true;

    constructor(chart: IChartApi, config: IndicatorConfig, mainCandleSeries?: ISeriesApi<'Candlestick'>) {
        super(chart, config, mainCandleSeries);
        this._chart = chart;
        this._attachedSeries = mainCandleSeries || null;
        console.log('[SMC Indicator] 🆕 Created with Primitive architecture');

        // 🔥 تهيئة حالة الرؤية من config إذا وجدت
        if (config.visible !== undefined) {
            this._isVisible = config.visible;
        }
    }

    /**
     * 🔥 دالة إخفاء/إظهار المؤشر
     */
    setVisible(visible: boolean): void {
        this._isVisible = visible;

        if (this._primitive) {
            // 🔥 تمرير حالة الرؤية للـ Primitive
            this._primitive.setVisible(visible);

            // 🔥 إعادة رسم الشارت لتطبيق التغييرات
            if (this._attachedSeries && this._chart) {
                try {
                    // طريقة بديلة: تنشيط حدث لإعادة الرسم
                    this._chart.timeScale().fitContent();

                    // أو استخدام requestUpdate إذا كان متاحاً
                    const param = (this._primitive as any)._attachedParam;
                    if (param) {
                        param.requestUpdate();
                    }
                } catch (error) {
                    console.warn('[SMC Indicator] ⚠️ Could not refresh chart:', error);
                }
            }
        }

        console.log(`[SMC Indicator] 👁️ Visibility set to: ${visible}`);
        super.setVisible(visible); // 🔥 استدعاء دالة الأب
    }

    /**
     * 🔥 الحصول على حالة الرؤية
     */
    getVisibility(): boolean {
        return this._isVisible;
    }

    /**
     * 🔥 الحصول على السلاسل المرتبطة (تطبيق للدالة المجردة)
     */
    getSeries(): ISeriesApi<any>[] {
        // Primitive لا يحتوي على series تقليدية
        return [];
    }

    /**
     * إنشاء Primitive وإرفاقه بسلسلة الشموع الرئيسية
     */
    createSeries(): ISeriesApi<any>[] {
        try {
            if (!this._attachedSeries) {
                throw new Error('No candle series available for attachment');
            }

            // ✅ التعديل: تمرير حالة الرؤية للـ Primitive
            const timeScale = this._chart.timeScale();
            this._primitive = new SMCOrderBlockPrimitive(
                [],
                [],
                timeScale,
                this._isVisible // 🔥 تمرير حالة الرؤية
            );

            // إرفاق Primitive بسلسلة الشموع
            this._attachedSeries.attachPrimitive(this._primitive);

            console.log('[SMC Indicator] ✅ Primitive successfully attached to candle series');
            return []; // لا نرجع سلاسل تقليدية لأننا نستخدم Primitive

        } catch (error) {
            console.error('[SMC Indicator] ❌ Failed to create series:', error);
            throw error;
        }
    }

    /**
     * تحديث بيانات المؤشر مع البيانات الجديدة من الباك إند
     */
    updateData(data: IndicatorData): void {
        // 🔥 إذا كان المؤشر مخفياً، نتجاهل التحديث
        if (!this._isVisible) {
            console.log('[SMC Indicator] ⏭️ Skipping update - indicator is hidden');
            return;
        }

        try {
            if (!data || !data.metadata) {
                console.warn('[SMC Indicator] ⚠️ No metadata provided in updateData');
                return;
            }

            const orderBlocksData = data.metadata.order_blocks || [];
            const swingPointsData = data.metadata.swing_points || [];

            console.log('[SMC Indicator] 🔄 Processing update:', {
                orderBlocks: orderBlocksData.length,
                swingPoints: swingPointsData.length,
                visible: this._isVisible
            });

            // التحويل: من تنسيق الباك إند إلى تنسيق Primitive
            const primitiveOrderBlocks = this.convertOrderBlocks(orderBlocksData);
            const primitiveSwingPoints = this.convertSwingPoints(swingPointsData);

            // تحديث Primitive بالبيانات الجديدة
            if (this._primitive) {
                if (this._updateDebounceTimeout) {
                    clearTimeout(this._updateDebounceTimeout);
                }

                const startTime = performance.now();
                this._primitive.update(primitiveOrderBlocks, primitiveSwingPoints);
                const endTime = performance.now();

                this._lastUpdateTime = Date.now();
                console.log('[SMC Indicator] 🎨 Primitive updated successfully', {
                    renderTime: `${(endTime - startTime).toFixed(2)}ms`,
                    visible: this._isVisible
                });
            } else {
                console.error('[SMC Indicator] ❌ Primitive not initialized');
            }

        } catch (error) {
            console.error('[SMC Indicator] ❌ Error in updateData:', error);
        }
    }

    /**
     * تحويل Order Blocks من تنسيق الباك إند إلى تنسيق Primitive
     */
    private convertOrderBlocks(blocksData: any[]): PrimitiveOrderBlock[] {
        if (!blocksData || !Array.isArray(blocksData)) return [];

        return blocksData.map((block, index) => {
            if (!block.time_from || !block.price_top || !block.price_bottom) {
                console.warn(`[SMC Indicator] ⚠️ Invalid block data at index ${index}:`, block);
                return null;
            }

            return {
                id: block.id || `ob_${block.time_from}_${index}`,
                time_from: block.time_from as Time,
                time_to: block.time_to || null,
                price_top: Number(block.price_top),
                price_bottom: Number(block.price_bottom),
                side: block.side || (block.price_top > block.price_bottom ? 'bearish' : 'bullish'),
                mitigated: Boolean(block.mitigated),
                strength: Math.min(Math.max(Number(block.strength || 0.5), 0), 1)
            };
        }).filter((item): item is PrimitiveOrderBlock => item !== null);
    }

    /**
     * تحويل Swing Points من تنسيق الباك إند إلى تنسيق Primitive
     */
    private convertSwingPoints(pointsData: any[]): SwingPoint[] {
        if (!pointsData || !Array.isArray(pointsData)) return [];

        return pointsData.map((point, index) => {
            if (!point.time || !point.level) {
                console.warn(`[SMC Indicator] ⚠️ Invalid swing point at index ${index}:`, point);
                return null;
            }

            return {
                time: point.time as Time,
                type: point.type || (point.level > 0 ? 'high' : 'low'),
                level: Number(point.level)
            };
        }).filter((item): item is SwingPoint => item !== null);
    }

    /**
     * تنظيف الموارد عند تدمير المؤشر
     */
    destroy(): void {
        try {
            // فصل Primitive قبل التدمير
            if (this._primitive && this._attachedSeries) {
                this._attachedSeries.detachPrimitive(this._primitive);
                console.log('[SMC Indicator] 🔴 Primitive detached successfully');
            }

            // تنظيف Debounce timeout
            if (this._updateDebounceTimeout) {
                clearTimeout(this._updateDebounceTimeout);
                this._updateDebounceTimeout = null;
            }

            // تنظيف الذاكرة
            this._primitive = null;
            this._attachedSeries = null;

            console.log('[SMC Indicator] ♻️ Resources cleaned up');
            super.destroy();

        } catch (error) {
            console.error('[SMC Indicator] ❌ Error during destroy:', error);
        }
    }

    /**
     * الحصول على إحصائيات المؤشر
     */
    getStats(): {
        orderBlocksCount: number;
        swingPointsCount: number;
        lastUpdateTime: number;
        isAttached: boolean;
        isVisible: boolean; // 🔥 إضافة حالة الرؤية
    } {
        return {
            orderBlocksCount: this._primitive?.orderBlocks?.length || 0,
            swingPointsCount: this._primitive?.swingPoints?.length || 0,
            lastUpdateTime: this._lastUpdateTime,
            isAttached: !!this._primitive && !!this._attachedSeries,
            isVisible: this._isVisible // 🔥 إرجاع حالة الرؤية
        };
    }
}