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
export interface OrderBlock {
    id: string;
    time_from: Time;
    time_to?: Time | null;
    price_top: number;
    price_bottom: number;
    side: 'bullish' | 'bearish';
    mitigated: boolean;
    strength: number;
}



export interface SwingPoint {
    time: Time;
    type: 'high' | 'low';
    level: number;
}

// ===================== Renderer Class =====================
class SMCOrderBlockPaneRenderer implements IPrimitivePaneRenderer {
    private _orderBlocks: OrderBlock[] = [];
    private _swingPoints: SwingPoint[] = [];
    private _attachedParam: SeriesAttachedParameter<Time> | null = null;
    private _timeScale: ITimeScaleApi<Time> | null = null;


    private _visible: boolean = true;

    // ثوابت الألوان الاحترافية (TradingView Style)
    private readonly COLORS = {
        bullish: {
            bg: 'rgba(46, 213, 115, 0.15)',       // خلفية خضراء شفافة جداً
            border: 'rgba(46, 213, 115, 0.8)',     // حدود خضراء فاتحة
            text: '#26a69a',
            gradientStart: 'rgba(46, 213, 115, 0.3)',
            gradientEnd: 'rgba(46, 213, 115, 0.05)',
        },
        bearish: {
            bg: 'rgba(239, 68, 68, 0.15)',        // خلفية حمراء شفافة جداً
            border: 'rgba(239, 68, 68, 0.8)',      // حدود حمراء فاتحة
            text: '#ef5350',
            gradientStart: 'rgba(239, 68, 68, 0.3)',
            gradientEnd: 'rgba(239, 68, 68, 0.05)',
        },
        mitigated: {
            line: 'rgba(255, 255, 255, 0.3)'      // لون الخطوط المسطرة
        }
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


    update(orderBlocks: OrderBlock[], swingPoints: SwingPoint[]) {
        this._orderBlocks = orderBlocks;
        this._swingPoints = swingPoints;
    }

    draw(target: CanvasRenderingTarget2D) {
        if (!this._visible) return;

        if (!this._attachedParam || !this._timeScale) return;

        const orderBlocks = this._orderBlocks;
        const swingPoints = this._swingPoints;

        if (orderBlocks.length === 0 && swingPoints.length === 0) {
            return;
        }

        target.useBitmapCoordinateSpace((scope: any) => {
            const ctx = scope.context;
            const { horizontalPixelRatio, verticalPixelRatio } = scope;

            // 1. رسم Order Blocks
            orderBlocks.forEach((block) => {
                this._drawOrderBlock(block, ctx, horizontalPixelRatio, verticalPixelRatio);
            });

            // 2. رسم Swing Points
            swingPoints.forEach((point) => {
                this._drawSwingPoint(point, ctx, horizontalPixelRatio, verticalPixelRatio);
            });
        });
    }

    private _drawOrderBlock(
        block: OrderBlock,
        ctx: CanvasRenderingContext2D,
        horizontalPixelRatio: number,
        verticalPixelRatio: number
    ) {
        if (!this._attachedParam || !this._timeScale) return;

        const timeScale = this._timeScale;
        const series = this._attachedParam.series;

        const timeFromCoord = timeScale.timeToCoordinate(block.time_from);
        let timeToCoord: number | null;

        if (block.time_to) {
            timeToCoord = timeScale.timeToCoordinate(block.time_to);
        } else {
            // جعل العرض الافتراضي أوسع قليلاً ليتناسب مع الشارت
            const endTime = (block.time_from as number) + 300;
            timeToCoord = timeScale.timeToCoordinate(endTime as Time);
        }

        const topCoord = series.priceToCoordinate(block.price_top);
        const bottomCoord = series.priceToCoordinate(block.price_bottom);

        if (timeFromCoord === null || timeToCoord === null || topCoord === null || bottomCoord === null) return;

        const startX = Math.round(timeFromCoord * horizontalPixelRatio);
        const endX = Math.round(timeToCoord * horizontalPixelRatio);
        const topY = Math.round(topCoord * verticalPixelRatio);
        const bottomY = Math.round(bottomCoord * verticalPixelRatio);

        const width = endX - startX;
        const height = Math.abs(bottomY - topY);
        if (width <= 0 || height <= 0) return;

        const isBullish = block.side === 'bullish';
        const theme = isBullish ? this.COLORS.bullish : this.COLORS.bearish;

        ctx.save();

        // 1. رسم الخلفية المتدرجة (Gradient)
        const gradient = ctx.createLinearGradient(startX, topY, startX, bottomY);
        gradient.addColorStop(0, theme.gradientStart);
        gradient.addColorStop(1, theme.gradientEnd);
        ctx.fillStyle = gradient;

        // إضافة توهج خفيف للكتلة
        ctx.shadowBlur = 10;
        ctx.shadowColor = theme.border;

        ctx.fillRect(startX, topY, width, height);

        // إزالة الظل قبل الرسم التالي لتأثير أداء أفضل
        ctx.shadowBlur = 0;

        // 2. تأثير التخريم (Hatching) إذا كانت الكتل مُعالجة (Mitigated)
        if (block.mitigated) {
            this._drawHatching(ctx, startX, topY, width, height, horizontalPixelRatio, verticalPixelRatio);
            ctx.strokeStyle = theme.border;
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]); // خط متقطع للحدود
            ctx.strokeRect(startX, topY, width, height);
            ctx.setLineDash([]); // إعادة الخط لوضعه الطبيعي
        } else {
            // حدود صلبة للكتل الفعالة
            ctx.strokeStyle = theme.border;
            ctx.lineWidth = 2;
            ctx.strokeRect(startX, topY, width, height);
        }

        // 3. رسم المسمى الداخلي (OB)
        if (height > 20 && width > 40) {
            ctx.fillStyle = theme.text;
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(isBullish ? 'BOS' : 'OB', startX + width / 2, topY + height / 2);
        }

        // 4. رسم Price Label (فقرة السعر) على يمين الكتلة
        this._drawPriceLabel(ctx, endX, topY, bottomY, block.price_top, theme.text, horizontalPixelRatio, verticalPixelRatio);

        ctx.restore();
    }

    // دالة مساعدة لرسم الخطوط المائلة (Hatching)
    private _drawHatching(
        ctx: CanvasRenderingContext2D,
        x: number, y: number, w: number, h: number,
        hRatio: number, vRatio: number
    ) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.clip(); // قص الرسم داخل المستطيل فقط

        ctx.strokeStyle = this.COLORS.mitigated.line;
        ctx.lineWidth = 1 * hRatio;

        const spacing = 10 * vRatio;

        // رسم خطوط مائلة
        for (let i = -h; i < w; i += spacing) {
            ctx.moveTo(x + i, y);
            ctx.lineTo(x + i + h, y + h);
        }
        ctx.stroke();
        ctx.restore();
    }

    // دالة مساعدة لرسم فقرة السعر
    private _drawPriceLabel(
        ctx: CanvasRenderingContext2D,
        endX: number, topY: number, bottomY: number,
        price: number,
        color: string,
        hRatio: number, vRatio: number
    ) {
        const paddingX = 6 * hRatio;
        const paddingY = 2 * vRatio;
        const centerY = topY + (bottomY - topY) / 2;

        ctx.font = '11px sans-serif';
        const priceText = price.toFixed(2); // ضبط عدد الخانات العشرية حسب الحاجة
        const textWidth = ctx.measureText(priceText).width;

        // موقع الفقرة (يمين الكتلة مع هامش بسيط)
        const labelX = endX + 4 * hRatio;

        // رسم خلفية الفقرة
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(
            labelX,
            centerY - (10 * vRatio),
            textWidth + (paddingX * 2),
            20 * vRatio,
            4 * vRatio
        );
        ctx.fill();

        // رسم النص
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(priceText, labelX + paddingX, centerY);
    }

    private _drawSwingPoint(
        point: SwingPoint,
        ctx: CanvasRenderingContext2D,
        horizontalPixelRatio: number,
        verticalPixelRatio: number
    ) {
        if (!this._attachedParam || !this._timeScale) return;

        const timeScale = this._timeScale;
        const series = this._attachedParam.series;

        const timeCoord = timeScale.timeToCoordinate(point.time);
        const priceCoord = series.priceToCoordinate(point.level);

        if (timeCoord === null || priceCoord === null) return;

        const x = Math.round(timeCoord * horizontalPixelRatio);
        const y = Math.round(priceCoord * verticalPixelRatio);
        const size = 6 * verticalPixelRatio; // حجم الماسة

        ctx.save();

        const isHigh = point.type === 'high';
        const color = isHigh ? '#ff4757' : '#2ed573'; // أحمر للقمة، أخضر للقاع

        // توهج للنقاط
        ctx.shadowBlur = 5;
        ctx.shadowColor = color;

        ctx.fillStyle = '#ffffff'; // وسط أبيض
        ctx.strokeStyle = color;
        ctx.lineWidth = 2 * horizontalPixelRatio;

        // رسم شكل ماسة (Diamond) بدلاً من الدائرة
        ctx.beginPath();
        ctx.moveTo(x, y - size);         // الأعلى
        ctx.lineTo(x + size, y);         // اليمين
        ctx.lineTo(x, y + size);         // الأسفل
        ctx.lineTo(x - size, y);         // اليسار
        ctx.closePath();

        ctx.fill();
        ctx.stroke();

        // رسم خط أفقي صغير لتمديد المؤشر (اختياري لزيادة الفخامة)
        ctx.beginPath();
        ctx.moveTo(x - (size * 1.5), y);
        ctx.lineTo(x + (size * 1.5), y);
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.5;
        ctx.stroke();

        ctx.restore();
    }
}

// ===================== PaneView Class =====================
class SMCOrderBlockPaneView implements IPrimitivePaneView {
    private _renderer: SMCOrderBlockPaneRenderer;

    constructor(orderBlocks: OrderBlock[], swingPoints: SwingPoint[], timeScale: ITimeScaleApi<Time> | null, visible?: boolean) {
        this._renderer = new SMCOrderBlockPaneRenderer();
        this._renderer.setTimeScale(timeScale);
        this._renderer.update(orderBlocks, swingPoints);

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

    update(orderBlocks: OrderBlock[], swingPoints: SwingPoint[]) {
        this._renderer.update(orderBlocks, swingPoints);
    }
}

// ===================== Primitive الرئيسي =====================
export class SMCOrderBlockPrimitive implements ISeriesPrimitive<Time> {
    private _orderBlocks: OrderBlock[] = [];
    private _swingPoints: SwingPoint[] = [];
    private _paneView: SMCOrderBlockPaneView;
    private _attachedParam: SeriesAttachedParameter<Time> | null = null;


    private _visible: boolean = true;


    constructor(orderBlocks: OrderBlock[] = [], swingPoints: SwingPoint[] = [], timeScale?: ITimeScaleApi<Time>,visible?: boolean) {
        this._orderBlocks = orderBlocks;
        this._swingPoints = swingPoints;
        this._visible = visible ?? true;

        this._paneView = new SMCOrderBlockPaneView(orderBlocks, swingPoints, timeScale || null);
    }

    update(orderBlocks: OrderBlock[], swingPoints: SwingPoint[]): void {
        this._orderBlocks = orderBlocks;
        this._swingPoints = swingPoints;
        this._paneView.update(orderBlocks, swingPoints);

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

    
    get orderBlocks(): OrderBlock[] {
        return this._orderBlocks;
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

// type CanvasRenderingTarget2D = any;

// // ===================== تعريف واجهات البيانات =====================
// export interface OrderBlock {
//     id: string;
//     time_from: Time;
//     time_to?: Time | null;
//     price_top: number;
//     price_bottom: number;
//     side: 'bullish' | 'bearish';
//     mitigated: boolean;
//     strength: number;
// }


// export interface BOSLine {
//     time_from: Time;
//     time_to: Time;
//     level: number;
//     side: 'bullish' | 'bearish'; // bullish لكسر القمة، bearish لكسر القاع
// }


// export interface SwingPoint {
//     time: Time;
//     type: 'high' | 'low';
//     level: number;
// }

// // ===================== Renderer Class =====================
// class SMCOrderBlockPaneRenderer implements IPrimitivePaneRenderer {
//     private _orderBlocks: OrderBlock[] = [];
//     private _swingPoints: SwingPoint[] = [];
//     private _bosLines: BOSLine[] = [];
//     private _attachedParam: SeriesAttachedParameter<Time> | null = null;
//     private _timeScale: ITimeScaleApi<Time> | null = null;


//     private _visible: boolean = true;

//     // ثوابت الألوان الاحترافية (TradingView Style)
//     private readonly COLORS = {
//         bullish: {
//             bg: 'rgba(46, 213, 115, 0.15)',       // خلفية خضراء شفافة جداً
//             border: 'rgba(46, 213, 115, 0.8)',     // حدود خضراء فاتحة
//             text: '#26a69a',
//             gradientStart: 'rgba(46, 213, 115, 0.3)',
//             gradientEnd: 'rgba(46, 213, 115, 0.05)',
//         },
//         bearish: {
//             bg: 'rgba(239, 68, 68, 0.15)',        // خلفية حمراء شفافة جداً
//             border: 'rgba(239, 68, 68, 0.8)',      // حدود حمراء فاتحة
//             text: '#ef5350',
//             gradientStart: 'rgba(239, 68, 68, 0.3)',
//             gradientEnd: 'rgba(239, 68, 68, 0.05)',
//         },
//         mitigated: {
//             line: 'rgba(255, 255, 255, 0.3)'      // لون الخطوط المسطرة
//         }
//     };

//     setTimeScale(timeScale: ITimeScaleApi<Time> | null) {
//         this._timeScale = timeScale;
//     }

//     setAttachedParam(param: SeriesAttachedParameter<Time> | null) {
//         this._attachedParam = param;
//     }
//     setVisible(visible: boolean): void {
//         this._visible = visible;
//     }



//     update(orderBlocks: OrderBlock[], swingPoints: SwingPoint[], bosLines: BOSLine[]) {
//         this._orderBlocks = orderBlocks;
//         this._swingPoints = swingPoints;
//         this._bosLines = bosLines;
//     }

//     draw(target: CanvasRenderingTarget2D) {
//         if (!this._visible) return;

//         if (!this._attachedParam || !this._timeScale) return;

//         const orderBlocks = this._orderBlocks;
//         const swingPoints = this._swingPoints;

//         if (orderBlocks.length === 0 && swingPoints.length === 0 && this._bosLines.length === 0) {
//             return;
//         }


//         target.useBitmapCoordinateSpace((scope: any) => {
//             const ctx = scope.context;
//             const { horizontalPixelRatio, verticalPixelRatio } = scope;

//             // 1. رسم Order Blocks
//             orderBlocks.forEach((block) => {
//                 this._drawOrderBlock(block, ctx, horizontalPixelRatio, verticalPixelRatio);
//             });

//             this._bosLines.forEach(bos => this._drawBOSLine(bos, ctx, horizontalPixelRatio, verticalPixelRatio));

//             // 2. رسم Swing Points
//             swingPoints.forEach((point) => {
//                 this._drawSwingPoint(point, ctx, horizontalPixelRatio, verticalPixelRatio);
//             });
//         });
//     }



//     private _drawBOSLine(
//         bos: BOSLine,
//         ctx: CanvasRenderingContext2D,
//         hRatio: number,
//         vRatio: number
//     ) {
//         if (!this._attachedParam || !this._timeScale) return;

//         const timeScale = this._timeScale;
//         const series = this._attachedParam.series;

//         const x1 = timeScale.timeToCoordinate(bos.time_from);
//         const x2 = timeScale.timeToCoordinate(bos.time_to);
//         const y = series.priceToCoordinate(bos.level);

//         if (x1 === null || x2 === null || y === null) return;

//         const startX = Math.round(x1 * hRatio);
//         const endX = Math.round(x2 * hRatio);
//         const coordY = Math.round(y * vRatio);

//         ctx.save();

//         // إعدادات الخط (متقطع ولونه رمادي فاتح أو حسب الاتجاه)
//         ctx.strokeStyle = bos.side === 'bullish' ? 'rgba(46, 213, 115, 0.8)' : 'rgba(239, 68, 68, 0.8)';
//         ctx.lineWidth = 1 * hRatio;
//         ctx.setLineDash([5, 5]); // جعل الخط متقطعاً

//         // رسم الخط
//         ctx.beginPath();
//         ctx.moveTo(startX, coordY);
//         ctx.lineTo(endX, coordY);
//         ctx.stroke();

//         // رسم نص BOS صغير فوق الخط
//         ctx.setLineDash([]); // إعادة الخط متصل للنص
//         ctx.fillStyle = ctx.strokeStyle;
//         ctx.font = '10px sans-serif';
//         ctx.textAlign = 'center';
//         ctx.fillText('BOS', startX + (endX - startX) / 2, coordY - 5 * vRatio);

//         ctx.restore();
//     }


//     private _drawOrderBlock(
//         block: OrderBlock,
//         ctx: CanvasRenderingContext2D,
//         horizontalPixelRatio: number,
//         verticalPixelRatio: number
//     ) {
//         if (!this._attachedParam || !this._timeScale) return;

//         const timeScale = this._timeScale;
//         const series = this._attachedParam.series;

//         const timeFromCoord = timeScale.timeToCoordinate(block.time_from);
//         let timeToCoord: number | null;

//         if (block.time_to) {
//             timeToCoord = timeScale.timeToCoordinate(block.time_to);
//         } else {
//             // جعل العرض الافتراضي أوسع قليلاً ليتناسب مع الشارت
//             const endTime = (block.time_from as number) + 300;
//             timeToCoord = timeScale.timeToCoordinate(endTime as Time);
//         }

//         const topCoord = series.priceToCoordinate(block.price_top);
//         const bottomCoord = series.priceToCoordinate(block.price_bottom);

//         if (timeFromCoord === null || timeToCoord === null || topCoord === null || bottomCoord === null) return;

//         const startX = Math.round(timeFromCoord * horizontalPixelRatio);
//         const endX = Math.round(timeToCoord * horizontalPixelRatio);
//         const topY = Math.round(topCoord * verticalPixelRatio);
//         const bottomY = Math.round(bottomCoord * verticalPixelRatio);

//         const width = endX - startX;
//         const height = Math.abs(bottomY - topY);
//         if (width <= 0 || height <= 0) return;

//         const isBullish = block.side === 'bullish';
//         const theme = isBullish ? this.COLORS.bullish : this.COLORS.bearish;

//         ctx.save();

//         // 1. رسم الخلفية المتدرجة (Gradient)
//         const gradient = ctx.createLinearGradient(startX, topY, startX, bottomY);
//         gradient.addColorStop(0, theme.gradientStart);
//         gradient.addColorStop(1, theme.gradientEnd);
//         ctx.fillStyle = gradient;

//         // إضافة توهج خفيف للكتلة
//         ctx.shadowBlur = 10;
//         ctx.shadowColor = theme.border;

//         ctx.fillRect(startX, topY, width, height);

//         // إزالة الظل قبل الرسم التالي لتأثير أداء أفضل
//         ctx.shadowBlur = 0;

//         // 2. تأثير التخريم (Hatching) إذا كانت الكتل مُعالجة (Mitigated)
//         if (block.mitigated) {
//             this._drawHatching(ctx, startX, topY, width, height, horizontalPixelRatio, verticalPixelRatio);
//             ctx.strokeStyle = theme.border;
//             ctx.lineWidth = 1;
//             ctx.setLineDash([5, 5]); // خط متقطع للحدود
//             ctx.strokeRect(startX, topY, width, height);
//             ctx.setLineDash([]); // إعادة الخط لوضعه الطبيعي
//         } else {
//             // حدود صلبة للكتل الفعالة
//             ctx.strokeStyle = theme.border;
//             ctx.lineWidth = 2;
//             ctx.strokeRect(startX, topY, width, height);
//         }

//         // 3. رسم المسمى الداخلي (OB)
//         if (height > 20 && width > 40) {
//             ctx.fillStyle = theme.text;
//             ctx.font = 'bold 12px sans-serif';
//             ctx.textAlign = 'center';
//             ctx.textBaseline = 'middle';
//             ctx.fillText(isBullish ? 'BOS' : 'OB', startX + width / 2, topY + height / 2);
//         }

//         // 4. رسم Price Label (فقرة السعر) على يمين الكتلة
//         this._drawPriceLabel(ctx, endX, topY, bottomY, block.price_top, theme.text, horizontalPixelRatio, verticalPixelRatio);

//         ctx.restore();
//     }

//     // دالة مساعدة لرسم الخطوط المائلة (Hatching)
//     private _drawHatching(
//         ctx: CanvasRenderingContext2D,
//         x: number, y: number, w: number, h: number,
//         hRatio: number, vRatio: number
//     ) {
//         ctx.save();
//         ctx.beginPath();
//         ctx.rect(x, y, w, h);
//         ctx.clip(); // قص الرسم داخل المستطيل فقط

//         ctx.strokeStyle = this.COLORS.mitigated.line;
//         ctx.lineWidth = 1 * hRatio;

//         const spacing = 10 * vRatio;

//         // رسم خطوط مائلة
//         for (let i = -h; i < w; i += spacing) {
//             ctx.moveTo(x + i, y);
//             ctx.lineTo(x + i + h, y + h);
//         }
//         ctx.stroke();
//         ctx.restore();
//     }

//     // دالة مساعدة لرسم فقرة السعر
//     private _drawPriceLabel(
//         ctx: CanvasRenderingContext2D,
//         endX: number, topY: number, bottomY: number,
//         price: number,
//         color: string,
//         hRatio: number, vRatio: number
//     ) {
//         const paddingX = 6 * hRatio;
//         const paddingY = 2 * vRatio;
//         const centerY = topY + (bottomY - topY) / 2;

//         ctx.font = '11px sans-serif';
//         const priceText = price.toFixed(2); // ضبط عدد الخانات العشرية حسب الحاجة
//         const textWidth = ctx.measureText(priceText).width;

//         // موقع الفقرة (يمين الكتلة مع هامش بسيط)
//         const labelX = endX + 4 * hRatio;

//         // رسم خلفية الفقرة
//         ctx.fillStyle = color;
//         ctx.beginPath();
//         ctx.roundRect(
//             labelX,
//             centerY - (10 * vRatio),
//             textWidth + (paddingX * 2),
//             20 * vRatio,
//             4 * vRatio
//         );
//         ctx.fill();

//         // رسم النص
//         ctx.fillStyle = '#ffffff';
//         ctx.textAlign = 'left';
//         ctx.textBaseline = 'middle';
//         ctx.fillText(priceText, labelX + paddingX, centerY);
//     }

//     private _drawSwingPoint(
//         point: SwingPoint,
//         ctx: CanvasRenderingContext2D,
//         horizontalPixelRatio: number,
//         verticalPixelRatio: number
//     ) {
//         if (!this._attachedParam || !this._timeScale) return;

//         const timeScale = this._timeScale;
//         const series = this._attachedParam.series;

//         const timeCoord = timeScale.timeToCoordinate(point.time);
//         const priceCoord = series.priceToCoordinate(point.level);

//         if (timeCoord === null || priceCoord === null) return;

//         const x = Math.round(timeCoord * horizontalPixelRatio);
//         const y = Math.round(priceCoord * verticalPixelRatio);
//         const size = 6 * verticalPixelRatio; // حجم الماسة

//         ctx.save();

//         const isHigh = point.type === 'high';
//         const color = isHigh ? '#ff4757' : '#2ed573'; // أحمر للقمة، أخضر للقاع

//         // توهج للنقاط
//         ctx.shadowBlur = 5;
//         ctx.shadowColor = color;

//         ctx.fillStyle = '#ffffff'; // وسط أبيض
//         ctx.strokeStyle = color;
//         ctx.lineWidth = 2 * horizontalPixelRatio;

//         // رسم شكل ماسة (Diamond) بدلاً من الدائرة
//         ctx.beginPath();
//         ctx.moveTo(x, y - size);         // الأعلى
//         ctx.lineTo(x + size, y);         // اليمين
//         ctx.lineTo(x, y + size);         // الأسفل
//         ctx.lineTo(x - size, y);         // اليسار
//         ctx.closePath();

//         ctx.fill();
//         ctx.stroke();

//         // رسم خط أفقي صغير لتمديد المؤشر (اختياري لزيادة الفخامة)
//         ctx.beginPath();
//         ctx.moveTo(x - (size * 1.5), y);
//         ctx.lineTo(x + (size * 1.5), y);
//         ctx.strokeStyle = color;
//         ctx.globalAlpha = 0.5;
//         ctx.stroke();

//         ctx.restore();
//     }
// }

// // ===================== PaneView Class =====================
// class SMCOrderBlockPaneView implements IPrimitivePaneView {
//     private _renderer: SMCOrderBlockPaneRenderer;

//     constructor(orderBlocks: OrderBlock[], swingPoints: SwingPoint[], bosLines: BOSLine[], timeScale: ITimeScaleApi<Time> | null, visible?: boolean) {
//         this._renderer = new SMCOrderBlockPaneRenderer();
//         this._renderer.setTimeScale(timeScale);
//         this._renderer.update(orderBlocks, swingPoints, bosLines);

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

//     update(orderBlocks: OrderBlock[], swingPoints: SwingPoint[], bosLines: BOSLine[]) {
//         this._renderer.update(orderBlocks, swingPoints, bosLines);
//     }
// }

// // ===================== Primitive الرئيسي =====================
// export class SMCOrderBlockPrimitive implements ISeriesPrimitive<Time> {
//     private _orderBlocks: OrderBlock[] = [];
//     private _swingPoints: SwingPoint[] = [];
//     private _bosLines: BOSLine[] = [];
//     private _paneView: SMCOrderBlockPaneView;
//     private _attachedParam: SeriesAttachedParameter<Time> | null = null;


//     private _visible: boolean = true;


//     constructor(orderBlocks: OrderBlock[] = [], swingPoints: SwingPoint[] = [], bosLines: BOSLine[] = [], timeScale?: ITimeScaleApi<Time>, visible?: boolean) {
//         this._orderBlocks = orderBlocks;
//         this._swingPoints = swingPoints;
//         this._bosLines = bosLines;
//         this._visible = visible ?? true;

//         this._paneView = new SMCOrderBlockPaneView(orderBlocks, swingPoints, bosLines, timeScale || null);
//     }

//     update(orderBlocks: OrderBlock[], swingPoints: SwingPoint[], bosLines: BOSLine[]): void {
//         this._orderBlocks = orderBlocks;
//         this._swingPoints = swingPoints;
//         this._bosLines = bosLines;
//         this._paneView.update(orderBlocks, swingPoints, bosLines);

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


//     get orderBlocks(): OrderBlock[] {
//         return this._orderBlocks;
//     }

//     detached(): void {
//         this._attachedParam = null;
//         this._paneView.setAttachedParam(null);
//     }

//     paneViews(): readonly IPrimitivePaneView[] {
//         return [this._paneView];
//     }
// }