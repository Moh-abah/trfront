import type { UTCTimestamp } from "lightweight-charts"

/**
 * تحويل الوقت إلى UTCTimestamp
 */
export const toUTCTimestamp = (time: number | string): UTCTimestamp => {
    if (typeof time === "string") {
        return Math.floor(new Date(time).getTime() / 1000) as UTCTimestamp
    }

    // إذا كان بالملي ثانية
    if (time > 1000000000000) {
        return Math.floor(time / 1000) as UTCTimestamp
    }

    // إذا كان بالثواني
    return time as UTCTimestamp
}

/**
 * تنسيق السعر
 */
// Format price for display
const formatPrice = (price: number) => {
    if (price === 0) return "0.00";

    // الأسعار الصغيرة جداً أقل من 0.001 - 8 خانات
    if (price < 0.001) return price.toFixed(8);

    // الأسعار الصغيرة من 0.001 إلى 0.01 - 5 خانات
    if (price < 0.01) return price.toFixed(5);

    // الأسعار من 0.01 إلى 1 - 3 خانات
    if (price < 1) return price.toFixed(3);

    // الأسعار الكبيرة - 2 خانة
    return price.toFixed(2);
};
/**
 * تنسيق الحجم
 */
export const formatVolume = (volume: number): string => {
    if (volume >= 1_000_000_000) {
        return `${(volume / 1_000_000_000).toFixed(2)}B`
    } else if (volume >= 1_000_000) {
        return `${(volume / 1_000_000).toFixed(2)}M`
    } else if (volume >= 1_000) {
        return `${(volume / 1_000).toFixed(2)}K`
    }
    return volume.toFixed(2)
}

/**
 * حساب نسبة التغيير
 */
export const calculateChangePercent = (current: number, previous: number): number => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
}

/**
 * التحقق من صحة بيانات الشمعة
 */
export const isValidCandle = (candle: any): boolean => {
    return (
        candle &&
        typeof candle.time === "number" &&
        typeof candle.open === "number" &&
        typeof candle.high === "number" &&
        typeof candle.low === "number" &&
        typeof candle.close === "number" &&
        !isNaN(candle.open) &&
        !isNaN(candle.high) &&
        !isNaN(candle.low) &&
        !isNaN(candle.close) &&
        isFinite(candle.open) &&
        isFinite(candle.high) &&
        isFinite(candle.low) &&
        isFinite(candle.close) &&
        candle.high >= candle.low &&
        candle.high >= candle.open &&
        candle.high >= candle.close &&
        candle.low <= candle.open &&
        candle.low <= candle.close
    )
}

/**
 * دمج الشموع التاريخية مع الشمعة الحية
 */
export const mergeHistoricalWithLive = (historical: any[], liveCandle: any | null) => {
    const merged = [...historical]

    if (liveCandle && isValidCandle(liveCandle)) {
        const lastHistorical = merged[merged.length - 1]

        if (!lastHistorical) {
            // لا توجد شموع تاريخية، أضف الشمعة الحية
            merged.push(liveCandle)
        } else if (lastHistorical.time === liveCandle.time) {
            // نفس الوقت، استبدل الشمعة الأخيرة
            merged[merged.length - 1] = liveCandle
        } else if (liveCandle.time > lastHistorical.time) {
            // وقت جديد، أضف الشمعة الحية
            merged.push(liveCandle)
        }
    }

    return merged
}

/**
 * الحصول على لون المؤشر بناءً على الفهرس
 */
export const getIndicatorColor = (index: number): string => {
    const colors = [
        "#2962FF", // أزرق
        "#FF6B6B", // أحمر
        "#4ECDC4", // تركواز
        "#45B7D1", // أزرق فاتح
        "#96CEB4", // أخضر فاتح
        "#FFEAA7", // أصفر
        "#DDA0DD", // بنفسجي
        "#F38181", // وردي
        "#55E6C1", // نعناعي
    ]
    return colors[index % colors.length]
}

/**
 * تنظيف البيانات القديمة
 */
export const trimOldCandles = (candles: any[], maxCandles = 1000): any[] => {
    if (candles.length <= maxCandles) {
        return candles
    }
    return candles.slice(-maxCandles)
}

/**
 * حساب barSpacing المناسب بناءً على الإطار الزمني
 * القيم الأكبر = شموع أقرب, القيم الأصغر = شموع أبعد
 */
/**
 * حساب barSpacing المناسب بناءً على الإطار الزمني
 * القيم الأكبر = شموع أقرب, القيم الأصغر = شموع أبعد
 */
export const getBarSpacingForTimeframe = (timeframe: string): number => {
    const spacingMap: Record<string, number> = {

        "1m": 3,
        "2m": 4,
        "3m": 5,
        "5m": 6,
        "10m": 8,
        "15m": 10,
        "30m": 12,
        // فريمات الساعات
        "1h": 14,
        "2h": 16,
        "3h": 18,
        "6h": 20,
        "12h": 22,
        // فريمات الأيام
        "1d": 24,
        "2d": 26,
        "3d": 28,
        // فريمات الأسابيع
        "1w": 30,
        "2w": 32,
        // فريمات الشهور
        "1M": 34,
    }

    return spacingMap[timeframe] || 10 // القيمة الافتراضية
}

/**
 * الحصول على لون مناسب للفريم الزمني (للعرض في الواجهة)
 */
export const getTimeframeColor = (timeframe: string): string => {
    const colorMap: Record<string, string> = {
        "30s": "#FF6B6B",  // أحمر للثواني
        "1m": "#FF9F43",   // برتقالي للدقائق
        "5m": "#FECA57",   // أصفر
        "15m": "#1DD1A1",  // أخضر
        "30m": "#10AC84",  // أخضر داكن
        "1h": "#54A0FF",   // أزرق فاتح
        "4h": "#2E86DE",   // أزرق
        "1d": "#5F27CD",   // بنفسجي
        "1w": "#341F97",   // بنفسجي داكن
        "1M": "#8395A7",   // رمادي
    }

    return colorMap[timeframe] || "#576574"
}

/**
 * حساب rightOffset المناسب بناءً على عدد الشموع
 */
export const getRightOffsetForCandleCount = (candleCount: number): number => {
    if (candleCount < 50) return 20
    if (candleCount < 200) return 15
    return 12
}
