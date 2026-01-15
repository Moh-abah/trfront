// إعدادات الرسوم البيانية
export interface ChartConfig {
    theme: 'light' | 'dark';
    layout: {
        background: {
            type: 'solid' | 'gradient';
            color: string;
            gradient?: [string, string];
        };
        textColor: string;
        fontSize: number;
        fontFamily: string;
    };
    grid: {
        vertLines: {
            color: string;
            style: 0 | 1 | 2 | 3;
            visible: boolean;
        };
        horzLines: {
            color: string;
            style: 0 | 1 | 2 | 3;
            visible: boolean;
        };
    };
    priceScale: {
        borderColor: string;
        borderVisible: boolean;
        autoScale: boolean;
        mode: 0 | 1 | 2;
        scaleMargins: {
            top: number;
            bottom: number;
        };
        textColor: string;
        lineWidth: number;
    };

    timeScale: {
        borderColor: string;
        visible: boolean;
        timeVisible: boolean;
        secondsVisible: boolean;
        rightOffset: number;
        barSpacing: number;
        minBarSpacing: number;
        fixLeftEdge: boolean;
        fixRightEdge: boolean;
        shiftVisibleRangeOnNewBar: boolean;
        allowBoldLabels: boolean;
    };
    crosshair: {
        mode: 0 | 1;
        vertLine: {
            width: number;
            color: string;
            style: 0 | 1 | 2 | 3;
            visible: boolean;
        };
        horzLine: {
            width: number;
            color: string;
            style: 0 | 1 | 2 | 3;
            visible: boolean;
        };
    };
}

export const chartTimeframes = [
    { value: "1m", label: "1د", description: "دقيقة واحدة" },
    { value: "5m", label: "5د", description: "5 دقائق" },
    { value: "15m", label: "15د", description: "15 دقيقة" },
    { value: "30m", label: "30د", description: "30 دقيقة" },
    { value: "1h", label: "1س", description: "ساعة واحدة" },
    { value: "4h", label: "4س", description: "4 ساعات" },
    { value: "1d", label: "1ي", description: "يوم واحد" },
    { value: "1w", label: "1أ", description: "أسبوع واحد" },
]

export const chartTypes = [
    { value: "candlestick", label: "شموع يابانية" },
    { value: "bar", label: "أعمدة" },
    { value: "line", label: "خط" },
    { value: "area", label: "منطقة" },
    { value: "baseline", label: "خط أساس", description: "خط مع ترميز لوني للمناطق أعلى/أدنى من خط الأساس" },
    { value: "renko", label: "رينكو", description: "مخطط رينكو (طوب بناء)" },
    { value: "point_and_figure", label: "نقاط وأشكال", description: "مخطط النقاط والأشكال" },
]

export const drawingTools = [
    { id: "cursor", name: "مؤشر", icon: "👆", description: "أداة التحديد" },
    { id: "line", name: "خط", icon: "📏", description: "خط مستقيم بزاوية" },
    { id: "horizontal_line", name: "خط أفقي", icon: "➖", description: "خط أفقي للمستويات" },
    { id: "vertical_line", name: "خط عمودي", icon: "│", description: "خط عمودي للتواريخ" },
    { id: "ray", name: "شعاع", icon: "↗️", description: "خط بزاوية يمتد إلى ما لا نهاية" },
    { id: "arrow", name: "سهم", icon: "→", description: "سهم للإشارة" },
    { id: "trend_line", name: "خط اتجاه", icon: "📈", description: "خط اتجاه السوق" },
    { id: "channel", name: "قناة", icon: "║", description: "قناة سعرية" },
    { id: "fibonacci_retracement", name: "فيبوناتشي", icon: "⌬", description: "مستويات فيبوناتشي" },
    { id: "fibonacci_extension", name: "تمديد فيبوناتشي", icon: "⌬↗", description: "تمديد فيبوناتشي" },
    { id: "fibonacci_fan", name: "مروحة فيبوناتشي", icon: "⌬", description: "مروحة فيبوناتشي" },
    { id: "pitchfork", name: "مذراة", icon: "⋔", description: "مذراة أندروز" },
    { id: "rectangle", name: "مستطيل", icon: "▭", description: "مستطيل مناطق" },
    { id: "ellipse", name: "دائرة", icon: "⭕", description: "دائرة أو قطع ناقص" },
    { id: "triangle", name: "مثلث", icon: "△", description: "مثلث" },
    { id: "polygon", name: "مضلع", icon: "⬡", description: "شكل متعدد الأضلاع" },
    { id: "text", name: "نص", icon: "📝", description: "إضافة تعليق نصي" },
    { id: "callout", name: "تعليق", icon: "💬", description: "تعليق مع سهم" },
    { id: "measure", name: "قياس", icon: "📐", description: "أداة القياس" },
    { id: "note", name: "ملاحظة", icon: "📌", description: "ملاحظة لاصقة" },
]

export const lightThemeConfig = {

    
    
    layout: {
        background: {
            type: 'gradient' as const,
            color: "#c9c9c9",
            gradient: ["#F8FAFC", "#E2E8F0"] as [string, string]  // تدرج مكون من 3 ألوان
        },
        textColor: "#0F172A",
        fontSize: 13,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    grid: {
        vertLines: {
            color: "#E2E8F0",  // لون صلب غير شفاف
            style: 0 as const,  // خطوط صلبة (solid) بدلاً من منقطة
            visible: true,
            lineWidth: 1,
        },
        horzLines: {
            color: "#E2E8F0",  // لون صلب غير شفاف
            style: 0 as const,  // خطوط صلبة
            visible: true,
            lineWidth: 1,
        },
    },
    timeScale: {
        borderColor: "#CBD5E1",
        visible: true,
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 10,
        barSpacing: 8,
        minBarSpacing: 1.5,
        fixLeftEdge: false,
        fixRightEdge: true,
        shiftVisibleRangeOnNewBar: true,
        allowBoldLabels: true,
        borderVisible: true,
        lineWidth: 1,
    },
    rightPriceScale: {
        borderColor: "#CBD5E1",
        borderVisible: true,
        autoScale: true,
        mode: 0,
        scaleMargins: {
            top: 0.1,
            bottom: 0.1,
        },
        lineWidth: 1,
        textColor: "#475569",
    } satisfies ChartConfig['priceScale'],

    crosshair: {
        mode: 1 as const,
        vertLine: {
            color: "rgba(30, 41, 59, 0.2)",  // زيادة الشفافية إلى 20%
            width: 1,
            style: 2 as const,  // dashed بدلاً من dotted
            visible: true,
            lineWidth: 1,
        },
        horzLine: {
            color: "rgba(30, 41, 59, 0.2)",  // زيادة الشفافية إلى 20%
            width: 1,
            style: 2 as const,  // dashed
            visible: true,
            lineWidth: 1,
        },
    },
    // إضافة ألوان للشموع (مهم للوضع الفاتح)
    candlestick: {
        upColor: "#10B981",
        downColor: "#EF4444",
        wickUpColor: "#10B981",
        wickDownColor: "#EF4444",
        borderUpColor: "#10B981",
        borderDownColor: "#EF4444",
    },
    // إضافة ألوان للنصوص والأرقام
    text: {
        primary: "#0F172A",
        secondary: "#475569",
        muted: "#64748B",
    },
    // إضافة ظلال وتأثيرات
    effects: {
        shadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        glow: "0 0 0 1px rgba(59, 130, 246, 0.1)",
    },

    // إضافة إعدادات جديدة للرسوم البيانية المتقدمة
    watermark: {
        visible: false,
        color: "rgba(15, 23, 42, 0.05)",
        fontSize: 48,
        text: "",
    },
    // localization: {
    //     locale: "ar-SA",
    //     dateFormat: "yyyy-MM-dd",
    // },
    kineticScroll: {
        mouse: true,
        touch: true,
    },
    trackingMode: {
        exitMode: 1 as const,
    },
    overlayPriceScales: {
        mode: 0 as const,
    },
}

export const darkThemeConfig = {
    layout: {
        background: {
            type: 'gradient' as const,
            color: "#0F172A",
            gradient: ["#0F172A", "#1E293B"] as [string, string]
        },
        textColor: "#F1F5F9",
        fontSize: 13,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    grid: {
        vertLines: {
            color: "rgba(51, 65, 85, 0.4)",
            style: 1 as const,
            visible: true,
        },
        horzLines: {
            color: "rgba(51, 65, 85, 0.4)",
            style: 1 as const,
            visible: true,
        },
    },
    timeScale: {
        borderColor: "#334155",
        visible: true,
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 10,
        barSpacing: 8,
        minBarSpacing: 1.5,
        fixLeftEdge: false,
        fixRightEdge: true,
        shiftVisibleRangeOnNewBar: true,
        allowBoldLabels: true,
    },
    rightPriceScale: {
        borderColor: "#334155",
        borderVisible: true,
        autoScale: true,
        mode: 0,
        scaleMargins: {
            top: 0.15,
            bottom: 0.15,
        },
        lineWidth: 1,
        textColor: "#CBD5E1",
    } satisfies ChartConfig['priceScale'],

    crosshair: {
        mode: 1 as const,
        vertLine: {
            color: "rgba(241, 245, 249, 0.1)",
            width: 1,
            style: 3 as const,
            visible: true,
        },
        horzLine: {
            color: "rgba(241, 245, 249, 0.1)",
            width: 1,
            style: 3 as const,
            visible: true,
        },
    },
    watermark: {
        visible: false,
        color: "rgba(241, 245, 249, 0.05)",
        fontSize: 48,
        text: "",
    },
    localization: {
        locale: "ar-SA",
        dateFormat: "yyyy-MM-dd",
    },
    kineticScroll: {
        mouse: true,
        touch: true,
    },
    trackingMode: {
        exitMode: 1 as const,
    },
    overlayPriceScales: {
        mode: 0 as const,
    },
}

// إعدادات إضافية للرسوم البيانية المتقدمة
export const advancedChartSettings = {
    candlestick: {
        upColor: "#10B981",
        downColor: "#EF4444",
        wickUpColor: "#10B981",
        wickDownColor: "#EF4444",
        borderUpColor: "#10B981",
        borderDownColor: "#EF4444",
        upBodyColor: "rgba(16, 185, 129, 0.8)",  // إضافة شفافية للجسم
        downBodyColor: "rgba(239, 68, 68, 0.8)", // إضافة شفافية للجسم
    },
    movingAverages: {
        sma: {
            color: "#3B82F6",
            lineWidth: 2,
            lineStyle: 0 as const,
        },
        ema: {
            color: "#8B5CF6",
            lineWidth: 2,
            lineStyle: 1 as const,  // dotted
        },
        wma: {
            color: "#F59E0B",
            lineWidth: 2,
            lineStyle: 2 as const,  // dashed
        },
    },
    indicators: {
        bollingerBands: {
            upperColor: "#8B5CF6",
            middleColor: "#3B82F6",
            lowerColor: "#8B5CF6",
            lineWidth: 1.5,
            lineStyle: 0 as const,
            fillColor: "rgba(139, 92, 246, 0.15)",  // شفافية أقل للوضع الفاتح
        },
        macd: {
            macdColor: "#3B82F6",
            signalColor: "#F59E0B",
            histogramColor: "#10B981",
            histogramDownColor: "#EF4444",
            lineWidth: 1.5,
        },
        rsi: {
            color: "#8B5CF6",
            overbought: 70,
            oversold: 30,
            lineWidth: 1.5,
            levels: [
                {
                    value: 70,
                    color: "#EF4444",
                    lineWidth: 1,
                    lineStyle: 2 as const,
                    textColor: "#EF4444"
                },
                {
                    value: 50,
                    color: "#64748B",
                    lineWidth: 0.5,
                    lineStyle: 1 as const,
                    textColor: "#64748B"
                },
                {
                    value: 30,
                    color: "#10B981",
                    lineWidth: 1,
                    lineStyle: 2 as const,
                    textColor: "#10B981"
                },
            ],
        },
        volume: {
            upColor: "rgba(16, 185, 129, 0.7)",
            downColor: "rgba(239, 68, 68, 0.7)",
            lineWidth: 1,
        },
    },
};

// ألوان مخصصة للرسوم البيانية
export const chartColors = {
    primary: ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"],
    sequential: ["#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE", "#DBEAFE"],
    diverging: ["#10B981", "#34D399", "#A7F3D0", "#FCA5A5", "#F87171", "#EF4444"],
    categorical: ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#6366F1"],
}

// تصدير إعدادات افتراضية
export const defaultChartConfig: ChartConfig = {
    theme: 'light',
    layout: lightThemeConfig.layout,
    grid: lightThemeConfig.grid,
    priceScale: lightThemeConfig.rightPriceScale,
    timeScale: lightThemeConfig.timeScale,
    crosshair: lightThemeConfig.crosshair,
}