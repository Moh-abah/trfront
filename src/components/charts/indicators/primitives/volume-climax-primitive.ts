import {
    ISeriesPrimitive,
    SeriesAttachedParameter,
    IPrimitivePaneView,
    IPrimitivePaneRenderer,
    Time,
    ITimeScaleApi,
} from 'lightweight-charts';

type CanvasRenderingTarget2D = any;

// ===================== تعريف واجهات البيانات =====================
export interface ClimaxPoint {
    time: Time;
    high: number;
    low: number;
    ratio: number;
    color: string;
}

export interface ClimaxVolumeBar {
    time: Time;
    value: number;   // Volume value
    ratio: number;   // Volume ratio
    color: string;
}

// ===================== Renderer Class =====================
class VolumeClimaxPaneRenderer implements IPrimitivePaneRenderer {
    private _climaxPoints: ClimaxPoint[] = [];
    private _volumeBars: ClimaxVolumeBar[] = [];
    private _attachedParam: SeriesAttachedParameter<Time> | null = null;
    private _timeScale: ITimeScaleApi<Time> | null = null;
    private _visible: boolean = true;

    // ثوابت الألوان والإعدادات
    private readonly CONFIG = {
        volumeBarHeightPercent: 0.15, // حجم أشرطة الفوليوم بالنسبة للشاشة (15%)
        zoneWidthMultiplier: 1.5,
        zoneOpacity: 0.15,            // شفافية خلفية المنطقة المميزة
        zoneBorderWidth: 1,
    };

    setTimeScale(timeScale: ITimeScaleApi<Time> | null) {
        this._timeScale = timeScale;
    }

    setAttachedParam(param: SeriesAttachedParameter<Time> | null) {
        this._attachedParam = param;
    }

    setVisible(visible: boolean): void {
        this._visible = visible;
    }

    update(climaxPoints: ClimaxPoint[], volumeBars: ClimaxVolumeBar[]) {
        this._climaxPoints = climaxPoints;
        this._volumeBars = volumeBars;
    }

    draw(target: CanvasRenderingTarget2D) {
        if (!this._visible) return;
        if (!this._attachedParam || !this._timeScale) return;

        // استخدام Bitmap Coordinate Space لرسم سلس和高性能
        target.useBitmapCoordinateSpace((scope: any) => {
            const ctx = scope.context;
            const { horizontalPixelRatio, verticalPixelRatio } = scope;

            // 1. رسم مناطق الذروة (Climax Zones) - خلفيات على الشموع
            this._drawClimaxZones(ctx, horizontalPixelRatio, verticalPixelRatio);

            // 2. رسم أشرطة الفوليوم (Volume Overlay) - أسفل الشارت
            this._drawVolumeOverlay(ctx, scope, horizontalPixelRatio, verticalPixelRatio);
        });
    }


    private _drawClimaxZones(
        ctx: CanvasRenderingContext2D,
        horizontalPixelRatio: number,
        verticalPixelRatio: number
    ) {


        if (!this._attachedParam || !this._timeScale) return;

        const timeScale = this._timeScale;
        const series = this._attachedParam.series;



        let zonesDrawn = 0;


        this._climaxPoints.forEach((point, index) => {
            const timeCoord = timeScale.timeToCoordinate(point.time);
            const highCoord = series.priceToCoordinate(point.high);
            const lowCoord = series.priceToCoordinate(point.low);

            if (timeCoord === null || highCoord === null || lowCoord === null) {
                return; // تخطي النقاط غير المرئية
            }

            const x = Math.round(timeCoord * horizontalPixelRatio);
            const yTop = Math.round(highCoord * verticalPixelRatio);
            const yBottom = Math.round(lowCoord * verticalPixelRatio);

            // حساب عرض الشمعة (أوسع قليلاً من الشمعة ليظهر كإطار)
            const barSpacing = timeScale.options().barSpacing || 6;
            const candleWidth = Math.max(4, Math.round(barSpacing * horizontalPixelRatio * 1.3)); // زيادة العرض

            // حساب ارتفاع المنطقة
            let height = Math.abs(yBottom - yTop);

            // --- تعديل مهم: فرض ارتفاع أدنى للمربع ---
            // إذا كانت الشمعة صغيرة جداً (Doji)، لا نريد أن يختفي المربع، بل نجعله بارزاً
            const minHeight = 4 * verticalPixelRatio;
            if (height < minHeight) {
                height = minHeight;
                // توسيط المربع العمودي حول منتصف الشمعة إذا كان صغيراً جداً
                // midY = (yTop + yBottom) / 2
                // newTop = midY - height/2
                const midY = (yTop + yBottom) / 2;
                // نحتاج لضبط yTop و yBottom وهمياً للرسم
                // لكن بما أننا نرسم FillRect من yTop للأسفل، سنعدل yTop فقط
                // yTop = yTop - (minHeight - height) / 2;
            }

            ctx.save();

            // ================= إعدادات الشكل (اختر الشكل المناسب) =================

            // [1] إعداد الإطار (الحدود)
            ctx.strokeStyle = point.color;
            ctx.lineWidth = 2 * horizontalPixelRatio; // جعل الإطار سميكاً وواضحاً

            // [2] إعداد الخلفية (اختياري - إذا كنت تريد التعبئة)
            // قللت الشفافية قليلاً لتكون 0.2 لتبقى خفيفة واضحة
            ctx.fillStyle = this._hexToRgba(point.color, 0.2);

            // ================= منطقة الرسم =================

            // الخيار (أ): رسم مربع مجوف فقط (Hollow Box) - أنظف وأشبه بمؤشرات التداول الاحترافية
            ctx.strokeRect(x - candleWidth / 2, yTop, candleWidth, height);

            // الخيار (ب): رسم مربع مملوء (Filled Box) - شبيه بالمثال في الصور
            // إذا كنت تريد المربع الممتلئ، قم بإزالة التعليق عن السطر التالي:
            // ctx.fillRect(x - candleWidth / 2, yTop, candleWidth, height);

            // رسم خط أفقي في الأعلى والأسفل فقط (تأثير زخرفي إضافي)
            ctx.beginPath();
            ctx.moveTo(x - candleWidth / 2, yTop);
            ctx.lineTo(x + candleWidth / 2, yTop);
            ctx.moveTo(x - candleWidth / 2, yBottom);
            ctx.lineTo(x + candleWidth / 2, yBottom);
            ctx.stroke();

            ctx.restore();
            zonesDrawn++;
        });

    }
    // private _drawClimaxZones(
    //     ctx: CanvasRenderingContext2D,
    //     horizontalPixelRatio: number,
    //     verticalPixelRatio: number
    // ) {
    //     if (!this._attachedParam || !this._timeScale) return;

    //     const timeScale = this._timeScale;
    //     const series = this._attachedParam.series;

    //     this._climaxPoints.forEach((point) => {
    //         const timeCoord = timeScale.timeToCoordinate(point.time);
    //         const highCoord = series.priceToCoordinate(point.high);
    //         const lowCoord = series.priceToCoordinate(point.low);

    //         if (timeCoord === null || highCoord === null || lowCoord === null) return;

    //         const x = Math.round(timeCoord * horizontalPixelRatio);
    //         const yTop = Math.round(highCoord * verticalPixelRatio);
    //         const yBottom = Math.round(lowCoord * verticalPixelRatio);

    //         // حساب عرض الشمعة (تقريبي بناء على الزمن)
    //         // يمكن تحسينها بجلب barSpacing من الـ timeScale إذا كان متاحاً
    //         // هنا سنستخدم عرضاً ثابتاً نسبياً
    //         const candleWidth = Math.max(2, Math.round(6 * horizontalPixelRatio));

    //         ctx.save();

    //         // رسم الخلفية الملونة
    //         ctx.fillStyle = this._hexToRgba(point.color, this.CONFIG.zoneOpacity);
    //         ctx.fillRect(x - candleWidth / 2, yTop, candleWidth, yBottom - yTop);

    //         // رسم الإطار العلوي والسفلي للمنطقة
    //         ctx.strokeStyle = point.color;
    //         ctx.lineWidth = this.CONFIG.zoneBorderWidth * horizontalPixelRatio;
    //         ctx.beginPath();
    //         ctx.moveTo(x - candleWidth / 2, yTop);
    //         ctx.lineTo(x + candleWidth / 2, yTop);
    //         ctx.moveTo(x - candleWidth / 2, yBottom);
    //         ctx.lineTo(x + candleWidth / 2, yBottom);
    //         ctx.stroke();

    //         ctx.restore();
    //     });
    // }
    private _drawVolumeOverlay(
        ctx: CanvasRenderingContext2D,
        scope: any,
        horizontalPixelRatio: number,
        verticalPixelRatio: number
    ) {
        if (!this._attachedParam || !this._timeScale) return;

        const timeScale = this._timeScale;

        // حساب ارتفاع الشريط الأقصى (15% من ارتفاع الشاشة)
        const maxBarHeight = scope.mediaSize.height * verticalPixelRatio * this.CONFIG.volumeBarHeightPercent;
        // حساب موقع Y للأسفل تماماً
        const bottomYPixel = scope.mediaSize.height * verticalPixelRatio;

        ctx.save();
        ctx.lineWidth = 1 * horizontalPixelRatio;

        // رسم كل الأشرطة (Canvas سيقوم بقصها تلقائياً إذا كانت خارج الشاشة)
        for (const bar of this._volumeBars) {
            // ✅ إصلاح: استخدام timeToCoordinate بدلاً من logicalToCoordinate
            const timeCoord = timeScale.timeToCoordinate(bar.time);

            if (timeCoord === null) continue; // تخطي الأشرطة خارج النطاق المرئي

            const x = Math.round(timeCoord * horizontalPixelRatio);

            // حساب ارتفاع الشريط بناءً على النسبة (Ratio)
            // نستخدم Max Ratio الموجود في البيانات أو قيمة افتراضية لضمان ظهور الأشرطة الكبيرة
            // بما أن البيانات بها ratios تصل لـ 15، سنقوم بتطبيعها
            const maxRatioInData = 3.0; // يمكن تعديلها حسب البيانات
            const normalizedHeight = (bar.ratio / maxRatioInData) * maxBarHeight;

            // التأكد من أن الارتفاع لا يتجاوز الحد المسموح
            const barHeight = Math.min(normalizedHeight, maxBarHeight);

            const y = bottomYPixel; // ينمو للأعلى من الأسفل

            // ✅ إصلاح: حساب عرض الشمعة ديناميكياً من timeScale ليتناسب مع التكبير والتصغير
            const barSpacing = timeScale.options().barSpacing || 6;
            const candleWidth = Math.max(2, Math.round(barSpacing * horizontalPixelRatio * 0.8));

            ctx.fillStyle = bar.color;
            // رسم الشريط
            ctx.fillRect(x - candleWidth / 2, y - barHeight, candleWidth, barHeight);
        }

        ctx.restore();
    }

    // دالة مساعدة لتحويل الألوان
    private _hexToRgba(hex: string, alpha: number): string {
        if (hex.startsWith('rgb')) {
            // إذا كان اللون بصيغة rgb(r, g, b)
            return hex.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
        }
        // إذا كان Hex
        let c: any;
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            c = hex.substring(1).split('');
            if (c.length == 3) {
                c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c = '0x' + c.join('');
            return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + alpha + ')';
        }
        return hex; // Fallback
    }
}

// ===================== PaneView Class =====================
class VolumeClimaxPaneView implements IPrimitivePaneView {
    private _renderer: VolumeClimaxPaneRenderer;

    constructor(climaxPoints: ClimaxPoint[], volumeBars: ClimaxVolumeBar[], timeScale?: ITimeScaleApi<Time>, visible?: boolean) {
        this._renderer = new VolumeClimaxPaneRenderer();
        this._renderer.setTimeScale(timeScale || null);
        this._renderer.update(climaxPoints, volumeBars);

        if (visible !== undefined) {
            this._renderer.setVisible(visible);
        }
    }

    renderer(): IPrimitivePaneRenderer | null {
        return this._renderer;
    }

    setAttachedParam(param: SeriesAttachedParameter<Time> | null) {
        this._renderer.setAttachedParam(param);
    }

    setVisible(visible: boolean): void {
        this._renderer.setVisible(visible);
    }

    update(climaxPoints: ClimaxPoint[], volumeBars: ClimaxVolumeBar[]) {
        this._renderer.update(climaxPoints, volumeBars);
    }
}

// ===================== Primitive الرئيسي =====================
export class VolumeClimaxPrimitive implements ISeriesPrimitive<Time> {
    private _climaxPoints: ClimaxPoint[] = [];
    private _volumeBars: ClimaxVolumeBar[] = [];
    private _paneView: VolumeClimaxPaneView;
    private _attachedParam: SeriesAttachedParameter<Time> | null = null;
    private _visible: boolean = true;

    constructor(climaxPoints: ClimaxPoint[] = [], volumeBars: ClimaxVolumeBar[] = [], timeScale?: ITimeScaleApi<Time>, visible?: boolean) {
        this._climaxPoints = climaxPoints;
        this._volumeBars = volumeBars;
        this._visible = visible ?? true;

        this._paneView = new VolumeClimaxPaneView(climaxPoints, volumeBars, timeScale);
    }

    update(climaxPoints: ClimaxPoint[], volumeBars: ClimaxVolumeBar[]): void {
        this._climaxPoints = climaxPoints;
        this._volumeBars = volumeBars;
        this._paneView.update(climaxPoints, volumeBars);

        if (this._attachedParam) {
            this._attachedParam.requestUpdate();
        }
    }

    setVisible(visible: boolean): void {
        this._visible = visible;
        this._paneView.setVisible(visible);

        if (this._attachedParam) {
            this._attachedParam.requestUpdate();
        }
    }

    attached(param: SeriesAttachedParameter<Time>): void {
        this._attachedParam = param;
        this._paneView.setAttachedParam(param);
    }

    detached(): void {
        this._attachedParam = null;
        this._paneView.setAttachedParam(null);
    }

    paneViews(): readonly IPrimitivePaneView[] {
        return [this._paneView];
    }
}




// import {
//     ISeriesPrimitive,
//     SeriesAttachedParameter,
//     IPrimitivePaneView,
//     IPrimitivePaneRenderer,
//     Time,
//     ITimeScaleApi,
// } from 'lightweight-charts';
// import { DebugPanel } from '../debug-panel'; // تأكد من المسار الصحيح

// type CanvasRenderingTarget2D = any;

// // ===================== تعريف واجهات البيانات =====================
// export interface ClimaxPoint {
//     time: Time;
//     high: number;
//     low: number;
//     ratio: number;
//     color: string;
// }

// export interface ClimaxVolumeBar {
//     time: Time;
//     value: number;   // Volume value
//     ratio: number;   // Volume ratio
//     color: string;
// }

// // ===================== Renderer Class =====================
// class VolumeClimaxPaneRenderer implements IPrimitivePaneRenderer {
//     private _climaxPoints: ClimaxPoint[] = [];
//     private _volumeBars: ClimaxVolumeBar[] = [];
//     private _attachedParam: SeriesAttachedParameter<Time> | null = null;
//     private _timeScale: ITimeScaleApi<Time> | null = null;
//     private _visible: boolean = true;
//     private _debugPanel: DebugPanel;
//     private _drawCount: number = 0;

//     // ثوابت الألوان والإعدادات
//     private readonly CONFIG = {
//         volumeBarHeightPercent: 0.15, 
//         zoneWidthMultiplier: 1.5, 
//         zoneOpacity: 0.15,            // شفافية خلفية المنطقة المميزة
//         zoneBorderWidth: 1,
//     };

//     constructor() {
//         this._debugPanel = DebugPanel.getInstance();
//     }

//     setTimeScale(timeScale: ITimeScaleApi<Time> | null) {
//         this._timeScale = timeScale;
//     }

//     setAttachedParam(param: SeriesAttachedParameter<Time> | null) {
//         this._attachedParam = param;
//     }

//     setVisible(visible: boolean): void {
//         this._visible = visible;
//     }

//     update(climaxPoints: ClimaxPoint[], volumeBars: ClimaxVolumeBar[]) {
//         this._climaxPoints = climaxPoints;
//         this._volumeBars = volumeBars;
//     }

//     draw(target: CanvasRenderingTarget2D) {
//         this._drawCount++;
//         if (!this._visible) {
//             if (this._drawCount === 1) {
//                 this._debugPanel.log(`[Renderer] ⏸️ Skipping draw - renderer is not visible`, 'warn');
//             }
//             return;
//         }

//         if (!this._attachedParam || !this._timeScale) {
//             if (this._drawCount <= 3) { // سجل فقط أول 3 مرات
//                 this._debugPanel.log(`[Renderer] ⚠️ Cannot draw - missing requirements`, 'warn', {
//                     hasAttachedParam: !!this._attachedParam,
//                     hasTimeScale: !!this._timeScale
//                 });
//             }
//             return;
//         }

//         try {
//             // استخدام Bitmap Coordinate Space لرسم سلس和高性能
//             target.useBitmapCoordinateSpace((scope: any) => {
//                 const ctx = scope.context;
//                 const { horizontalPixelRatio, verticalPixelRatio } = scope;

//                 // 1. رسم مناطق الذروة (Climax Zones) - خلفيات على الشموع
//                 const zonesDrawn = this._drawClimaxZones(ctx, horizontalPixelRatio, verticalPixelRatio);

//                 // 2. رسم أشرطة الفوليوم (Volume Overlay) - أسفل الشارت
//                 const barsDrawn = this._drawVolumeOverlay(ctx, scope, horizontalPixelRatio, verticalPixelRatio);

//                 if (this._drawCount === 1) {
//                     this._debugPanel.log(`[Renderer] ✅ First draw completed`, 'success', {
//                         zonesDrawn,
//                         barsDrawn,
//                         totalElements: this._climaxPoints.length + this._volumeBars.length
//                     });
//                 }
//             });
//         } catch (error) {
//             this._debugPanel.log(`[Renderer] ❌ Draw error: ${error.message}`, 'error', {
//                 error: error,
//                 drawCount: this._drawCount
//             });
//         }
//     }

//     private _drawClimaxZones(
//         ctx: CanvasRenderingContext2D,
//         horizontalPixelRatio: number,
//         verticalPixelRatio: number
//     ): number {
//         if (!this._attachedParam || !this._timeScale) {
//             if (this._drawCount === 1) {
//                 this._debugPanel.log(`[Renderer] ❌ Cannot draw climax zones - missing requirements`, 'error');
//             }
//             return 0;
//         }

//         const timeScale = this._timeScale;
//         const series = this._attachedParam.series;
//         let zonesDrawn = 0;

//         // تسجيل معلومات عن timeScale وseries لأول مرة
//         if (this._drawCount === 1) {
//             this._debugPanel.log(`[Renderer] 🔍 Climax zones debug info`, 'info', {
//                 timeScaleAvailable: !!timeScale,
//                 seriesAvailable: !!series,
//                 seriesType: series?.seriesType?.(),
//                 climaxPointsCount: this._climaxPoints.length,
//                 samplePoint: this._climaxPoints[0]
//             });
//         }

//         this._climaxPoints.forEach((point, index) => {
//             // تسجيل فقط أول 3 نقاط للتجنب
//             if (this._drawCount === 1 && index < 3) {
//                 this._debugPanel.log(`[Renderer] 🔍 Processing climax point ${index}`, 'info', {
//                     point,
//                     timeType: typeof point.time,
//                     high: point.high,
//                     low: point.low,
//                     ratio: point.ratio
//                 });
//             }

//             const timeCoord = timeScale.timeToCoordinate(point.time);
            
//             const highCoord = series.priceToCoordinate(point.high);
//             const lowCoord = series.priceToCoordinate(point.low);

//             // تسجيل تفاصيل التحويل لأول 3 نقاط
//             if (this._drawCount === 1 && index < 3) {
//                 this._debugPanel.log(`[Renderer] 🔍 Coordinates for point ${index}`, 'info', {
//                     time: point.time,
//                     timeCoord,
//                     high: point.high,
//                     highCoord,
//                     low: point.low,
//                     lowCoord,
//                     color: point.color,
//                     allCoordsValid: !!(timeCoord !== null && highCoord !== null && lowCoord !== null)
//                 });
//             }

//             if (timeCoord === null || highCoord === null || lowCoord === null) {
//                 if (this._drawCount === 1 && index < 3) {
//                     this._debugPanel.log(`[Renderer] ⚠️ Skipping climax point - invalid coordinates`, 'warn', {
//                         point,
//                         timeCoord,
//                         highCoord,
//                         lowCoord
//                     });
//                 }
//                 return;
//             }

//             const x = Math.round(timeCoord * horizontalPixelRatio);
//             const yTop = Math.round(highCoord * verticalPixelRatio);
//             const yBottom = Math.round(lowCoord * verticalPixelRatio);

//             // حساب عرض الشمعة
//             const barSpacing = timeScale.options().barSpacing || 6;
//             const candleWidth = Math.max(2, Math.round(barSpacing * horizontalPixelRatio * this.CONFIG.zoneWidthMultiplier));

//             if (this._drawCount === 1 && index < 3) {
//                 this._debugPanel.log(`[Renderer] 📏 Drawing calculations for point ${index}`, 'info', {
//                     x,
//                     yTop,
//                     yBottom,
//                     candleWidth,
//                     barSpacing,
//                     horizontalPixelRatio,
//                     verticalPixelRatio,
//                     height: Math.abs(yBottom - yTop)
//                 });
//             }

//             // التحقق من أن الأبعاد منطقية
//             if (Math.abs(yBottom - yTop) < 1) {
//                 if (this._drawCount === 1 && index < 3) {
//                     this._debugPanel.log(`[Renderer] ⚠️ Zone height too small`, 'warn', {
//                         height: Math.abs(yBottom - yTop),
//                         point
//                     });
//                 }
//             }

//             ctx.save();

//             // رسم الخلفية الملونة
//             const fillColor = this._hexToRgba(point.color, this.CONFIG.zoneOpacity);
//             ctx.fillStyle = fillColor;
//             ctx.fillRect(x - candleWidth / 2, yTop, candleWidth, yBottom - yTop);

//             // رسم الإطار العلوي والسفلي للمنطقة
//             ctx.strokeStyle = point.color;
//             ctx.lineWidth = this.CONFIG.zoneBorderWidth * horizontalPixelRatio;
//             ctx.beginPath();
//             ctx.moveTo(x - candleWidth / 2, yTop);
//             ctx.lineTo(x + candleWidth / 2, yTop);
//             ctx.moveTo(x - candleWidth / 2, yBottom);
//             ctx.lineTo(x + candleWidth / 2, yBottom);
//             ctx.stroke();

//             ctx.restore();
//             zonesDrawn++;
//         });

//         if (zonesDrawn === 0 && this._climaxPoints.length > 0) {
//             this._debugPanel.log(`[Renderer] ❌ No climax zones drawn!`, 'error', {
//                 totalPoints: this._climaxPoints.length,
//                 firstPoint: this._climaxPoints[0],
//                 lastPoint: this._climaxPoints[this._climaxPoints.length - 1]
//             });
//         }

//         return zonesDrawn;
//     }

//     private _drawVolumeOverlay(
//         ctx: CanvasRenderingContext2D,
//         scope: any,
//         horizontalPixelRatio: number,
//         verticalPixelRatio: number
//     ): number {
//         if (!this._attachedParam || !this._timeScale) {
//             return 0;
//         }

//         const timeScale = this._timeScale;
//         let barsDrawn = 0;

//         // حساب ارتفاع الشريط الأقصى (15% من ارتفاع الشاشة)
//         const maxBarHeight = scope.mediaSize.height * verticalPixelRatio * this.CONFIG.volumeBarHeightPercent;
//         // حساب موقع Y للأسفل تماماً
//         const bottomYPixel = scope.mediaSize.height * verticalPixelRatio;

//         ctx.save();
//         ctx.lineWidth = 1 * horizontalPixelRatio;

//         // رسم كل الأشرطة
//         for (const bar of this._volumeBars) {
//             const timeCoord = timeScale.timeToCoordinate(bar.time);

//             if (timeCoord === null) {
//                 if (this._drawCount === 1 && barsDrawn < 3) {
//                     this._debugPanel.log(`[Renderer] ⚠️ Skipping volume bar - time coord is null`, 'warn', { bar });
//                 }
//                 continue;
//             }

//             const x = Math.round(timeCoord * horizontalPixelRatio);

//             // حساب ارتفاع الشريط
//             const maxRatioInData = 3.0;
//             const normalizedHeight = (bar.ratio / maxRatioInData) * maxBarHeight;
//             const barHeight = Math.min(normalizedHeight, maxBarHeight);

//             const y = bottomYPixel;

//             const barSpacing = timeScale.options().barSpacing || 6;
//             const candleWidth = Math.max(2, Math.round(barSpacing * horizontalPixelRatio * 0.8));

//             ctx.fillStyle = bar.color;
//             ctx.fillRect(x - candleWidth / 2, y - barHeight, candleWidth, barHeight);
//             barsDrawn++;
//         }

//         ctx.restore();
//         return barsDrawn;
//     }

//     // دالة مساعدة لتحويل الألوان
//     private _hexToRgba(hex: string, alpha: number): string {
//         try {
//             if (hex.startsWith('rgb')) {
//                 // إذا كان اللون بصيغة rgb(r, g, b)
//                 return hex.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
//             }
//             // إذا كان Hex
//             if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
//                 let c = hex.substring(1).split('');
//                 if (c.length == 3) {
//                     c = [c[0], c[0], c[1], c[1], c[2], c[2]];
//                 }
//                 const hexVal = parseInt(c.join(''), 16);
//                 return `rgba(${(hexVal >> 16) & 255}, ${(hexVal >> 8) & 255}, ${hexVal & 255}, ${alpha})`;
//             }
//             this._debugPanel.log(`[Renderer] ⚠️ Invalid color format: ${hex}`, 'warn');
//             return `rgba(128, 128, 128, ${alpha})`;
//         } catch (error) {
//             this._debugPanel.log(`[Renderer] ❌ Color conversion error: ${error.message}`, 'error', { hex, alpha });
//             return `rgba(128, 128, 128, ${alpha})`;
//         }
//     }
// }

// // ===================== PaneView Class =====================
// class VolumeClimaxPaneView implements IPrimitivePaneView {
//     private _renderer: VolumeClimaxPaneRenderer;

//     constructor(climaxPoints: ClimaxPoint[], volumeBars: ClimaxVolumeBar[], timeScale?: ITimeScaleApi<Time>, visible?: boolean) {
//         this._renderer = new VolumeClimaxPaneRenderer();
//         this._renderer.setTimeScale(timeScale || null);
//         this._renderer.update(climaxPoints, volumeBars);

//         if (visible !== undefined) {
//             this._renderer.setVisible(visible);
//         }
//     }

//     renderer(): IPrimitivePaneRenderer | null {
//         return this._renderer;
//     }

//     setAttachedParam(param: SeriesAttachedParameter<Time> | null) {
//         this._renderer.setAttachedParam(param);
//     }

//     setVisible(visible: boolean): void {
//         this._renderer.setVisible(visible);
//     }

//     update(climaxPoints: ClimaxPoint[], volumeBars: ClimaxVolumeBar[]) {
//         this._renderer.update(climaxPoints, volumeBars);
//     }
// }

// // ===================== Primitive الرئيسي =====================
// export class VolumeClimaxPrimitive implements ISeriesPrimitive<Time> {
//     private _climaxPoints: ClimaxPoint[] = [];
//     private _volumeBars: ClimaxVolumeBar[] = [];
//     private _paneView: VolumeClimaxPaneView;
//     private _attachedParam: SeriesAttachedParameter<Time> | null = null;
//     private _visible: boolean = true;

//     constructor(climaxPoints: ClimaxPoint[] = [], volumeBars: ClimaxVolumeBar[] = [], timeScale?: ITimeScaleApi<Time>, visible?: boolean) {
//         this._climaxPoints = climaxPoints;
//         this._volumeBars = volumeBars;
//         this._visible = visible ?? true;

//         this._paneView = new VolumeClimaxPaneView(climaxPoints, volumeBars, timeScale, this._visible);
//     }

//     update(climaxPoints: ClimaxPoint[], volumeBars: ClimaxVolumeBar[]): void {
//         this._climaxPoints = climaxPoints;
//         this._volumeBars = volumeBars;
//         this._paneView.update(climaxPoints, volumeBars);

//         if (this._attachedParam) {
//             this._attachedParam.requestUpdate();
//         }
//     }

//     setVisible(visible: boolean): void {
//         this._visible = visible;
//         this._paneView.setVisible(visible);

//         if (this._attachedParam) {
//             this._attachedParam.requestUpdate();
//         }
//     }

//     attached(param: SeriesAttachedParameter<Time>): void {
//         this._attachedParam = param;
//         this._paneView.setAttachedParam(param);
//     }

//     detached(): void {
//         this._attachedParam = null;
//         this._paneView.setAttachedParam(null);
//     }

//     paneViews(): readonly IPrimitivePaneView[] {
//         return [this._paneView];
//     }
// }