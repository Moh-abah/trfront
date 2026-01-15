// // app/services/indicators/adapters/smc-order-block-adapter.ts

// export interface SMCDataStructure {
//     values: (number | null)[];
//     metadata: {
//         order_blocks: Array<{
//             id: string;
//             side: 'bullish' | 'bearish';
//             time_from: number; // Unix timestamp in seconds
//             time_to?: number | null;
//             price_top: number;
//             price_bottom: number;
//             mitigated: boolean;
//             strength: number;
//         }>;
//         swing_points: Array<{
//             time: number; // Unix timestamp in seconds
//             type: 'high' | 'low';
//             level: number;
//         }>;
//         top?: (number | null)[];
//         bottom?: (number | null)[];
//     };
//     signals: any;
// }

// export class SMCDataAdapter {
//     static normalize(rawInput: any): SMCDataStructure | null {
//         if (!rawInput) return null;

//         console.log('[SMC Adapter] 🔍 Processing new data structure...');

//         // استخراج كتلة SMC من أي مكان
//         const smcBlock = this.extractSMCBlock(rawInput);
//         if (!smcBlock) {
//             console.warn('[SMC Adapter] ❌ No SMC block found');
//             return null;
//         }

//         // استخراج metadata الجديدة
//         const metadata = smcBlock.metadata || smcBlock.meta || {};
//         const order_blocks = metadata.order_blocks || [];
//         const swing_points = metadata.swing_points || [];

//         console.log('[SMC Adapter] 📊 Extracted:', {
//             orderBlocks: order_blocks.length,
//             swingPoints: swing_points.length,
//             hasTopBottom: !!(metadata.top && metadata.bottom)
//         });

//         // بناء مصفوفات top و bottom من order_blocks
//         // (مازلنا نحتاجها للتتوافق مع الكود الحالي)
//         const values = smcBlock.values || [];
//         const { topArray, bottomArray } = this.buildTopBottomArrays(order_blocks, values.length);

//         return {
//             values: values,
//             metadata: {
//                 order_blocks: order_blocks,
//                 swing_points: swing_points,
//                 top: topArray,
//                 bottom: bottomArray
//             },
//             signals: smcBlock.signals || null
//         };
//     }

//     private static extractSMCBlock(input: any): any {
//         // 1. من indicators_results
//         if (input.indicators_results?.smc_order_block) {
//             return input.indicators_results.smc_order_block;
//         }

//         // 2. مباشرة
//         if (input.name === 'smc_order_block' || input.id === 'smc_order_block') {
//             return input;
//         }

//         // 3. من rawData
//         if (input.rawData) {
//             return input.rawData;
//         }

//         // 4. الإدخال نفسه
//         return input;
//     }

//     private static buildTopBottomArrays(
//         orderBlocks: any[],
//         valuesLength: number
//     ): { topArray: (number | null)[], bottomArray: (number | null)[] } {
//         const topArray = new Array(valuesLength).fill(null);
//         const bottomArray = new Array(valuesLength).fill(null);

//         // لا نحتاج لملء top و bottom لأننا سنستخدم order_blocks مباشرة
//         // ولكن نتركها للتتوافق مع الكود الحالي

//         return { topArray, bottomArray };
//     }
// }


// app/services/indicators/adapters/smc-order-block-adapter.ts

export interface SMCDataStructure {
    values: (number | null)[];
    metadata: {
        order_blocks: Array<{
            id: string;
            side: 'bullish' | 'bearish';
            time_from: number;
            time_to?: number | null;
            price_top: number;
            price_bottom: number;
            mitigated: boolean;
            strength: number;
        }>;
        swing_points: Array<{
            time: number;
            type: 'high' | 'low';
            level: number;
        }>;
        // للحفاظ على التوافق مع الكود القديم إذا كان ضرورياً
        top?: (number | null)[];
        bottom?: (number | null)[];
    };
    signals: any;
}

export class SMCDataAdapter {
    /**
     * تطبيع البيانات من الباك إند للهيكل المتوقع
     */
    static normalize(rawInput: any): SMCDataStructure | null {
        if (!rawInput) {
            console.warn('[SMC Adapter] ❌ No input provided');
            return null;
        }

        console.log('[SMC Adapter] 🔍 Processing input structure...');

        try {
            // استخراج كتلة SMC من أي مكان في الهيكل
            const smcBlock = this.extractSMCBlock(rawInput);
            if (!smcBlock) {
                console.warn('[SMC Adapter] ❌ No SMC block found in input');
                return null;
            }

            // استخراج metadata - مع دعم أشكال مختلفة
            const metadata = this.extractMetadata(smcBlock);
            if (!metadata) {
                console.warn('[SMC Adapter] ❌ No valid metadata found');
                return null;
            }

            // تأكد من وجود البيانات الأساسية
            const hasOrderBlocks = metadata.order_blocks && metadata.order_blocks.length > 0;
            const hasSwingPoints = metadata.swing_points && metadata.swing_points.length > 0;

            if (!hasOrderBlocks && !hasSwingPoints) {
                console.warn('[SMC Adapter] ⚠️ No order blocks or swing points found');
            }

            // بناء الكائن النهائي
            const result: SMCDataStructure = {
                values: smcBlock.values || [],
                metadata: {
                    order_blocks: metadata.order_blocks || [],
                    swing_points: metadata.swing_points || [],
                    // للحفاظ على التوافق
                    top: metadata.top || [],
                    bottom: metadata.bottom || []
                },
                signals: smcBlock.signals || null
            };

            console.log('[SMC Adapter] ✅ Data normalized successfully', {
                orderBlocks: result.metadata.order_blocks.length,
                swingPoints: result.metadata.swing_points.length,
                valuesLength: result.values.length
            });

            return result;

        } catch (error) {
            console.error('[SMC Adapter] ❌ Error normalizing data:', error);
            return null;
        }
    }

    private static extractSMCBlock(input: any): any {
        // ترتيب الأولويات للبحث
        const possiblePaths = [
            // 1. من indicators_results مباشرة
            () => input.indicators_results?.smc_order_block,
            // 2. من indicators_results العامة
            () => input.indicators_results?.order_block,
            // 3. من البيانات المباشرة
            () => input.name === 'smc_order_block' || input.id === 'smc_order_block' ? input : null,
            // 4. من rawData
            () => input.rawData,
            // 5. الإدخال نفسه
            () => input
        ];

        for (const getBlock of possiblePaths) {
            const block = getBlock();
            if (block && (block.metadata || block.meta)) {
                console.log('[SMC Adapter] 📍 Found SMC block at:', getBlock.name);
                return block;
            }
        }

        return null;
    }

    private static extractMetadata(block: any): any {
        const metadata = block.metadata || block.meta || {};

        // تأكد من وجود الهياكل الأساسية
        return {
            order_blocks: Array.isArray(metadata.order_blocks) ? metadata.order_blocks : [],
            swing_points: Array.isArray(metadata.swing_points) ? metadata.swing_points : [],
            top: metadata.top || [],
            bottom: metadata.bottom || []
        };
    }
}