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
        scaleMargins: {
            top: number;
            bottom: number;
        };
        autoScale: boolean;
        mode: 0 | 1 | 2;
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
        shiftVisibleRangeOnNewBar: true,
        // حاول إضافة هذه الخاصية إذا كنت تستخدم إصدار يدعمها
        allowBoldLabels: true,
    };
    crosshair: {
        mode: 0 | 1; // 0: عادي، 1: مغناطيسي
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
]

export const drawingTools = [
    { id: "cursor", name: "مؤشر", icon: "👆" },
    { id: "line", name: "خط", icon: "📏" },
    { id: "horizontal_line", name: "خط أفقي", icon: "➖" },
    { id: "vertical_line", name: "خط عمودي", icon: "|" },
    { id: "rectangle", name: "مستطيل", icon: "▭" },
    { id: "ellipse", name: "دائرة", icon: "⭕" },
    { id: "triangle", name: "مثلث", icon: "△" },
    { id: "text", name: "نص", icon: "📝" },
]

export const lightThemeConfig = {
    layout: {
        background: { color: "#FFFFFF" },
        textColor: "#191919",
        fontSize: 12,
    },
    grid: {
        vertLines: {
            color: "rgba(197, 203, 206, 0.5)",
            style: 1,
            visible: true,
        },
        horzLines: {
            color: "rgba(197, 203, 206, 0.5)",
            style: 1,
            visible: true,
        },
    },
    timeScale: {
        borderColor: "#D6DCDE",
        timeVisible: true,
        secondsVisible: false,
        borderVisible: true,
    },
    rightPriceScale: {
        borderColor: "#D6DCDE",
        borderVisible: true,
    },
    crosshair: {
        mode: 1,
        vertLine: {
            color: "rgba(32, 38, 46, 0.1)",
            width: 1,
            style: 3,
            labelBackgroundColor: "#9B7DFF",
        },
        horzLine: {
            color: "rgba(32, 38, 46, 0.1)",
            width: 1,
            style: 3,
            labelBackgroundColor: "#9B7DFF",
        },
    },
}

export const darkThemeConfig = {
    layout: {
        background: { color: "#131722" }, // Binance-like dark background
        textColor: "#d1d4dc",
        fontSize: 12,
    },
    grid: {
        vertLines: {
            color: "rgba(42, 46, 57, 0.5)",
            style: 1, // dotted
            visible: true,
        },
        horzLines: {
            color: "rgba(42, 46, 57, 0.5)",
            style: 1, // dotted
            visible: true,
        },
    },
    timeScale: {
        borderColor: "#2B2B43",
        timeVisible: true,
        secondsVisible: false,
        borderVisible: true,
        rightOffset: 12,
        barSpacing: 6, // Default spacing, will adjust based on timeframe
        minBarSpacing: 0.5,
        fixLeftEdge: false,
        fixRightEdge: false,
    },
    rightPriceScale: {
        borderColor: "#2B2B43",
        borderVisible: true,
        autoScale: true,
        scaleMargins: {
            top: 0.1,
            bottom: 0.1,
        },
    },
    crosshair: {
        mode: 1, // Magnet
        vertLine: {
            color: "rgba(224, 227, 235, 0.1)",
            width: 1,
            style: 3, // dashed
            labelBackgroundColor: "#363c4e",
        },
        horzLine: {
            color: "rgba(224, 227, 235, 0.1)",
            width: 1,
            style: 3, // dashed
            labelBackgroundColor: "#363c4e",
        },
    },
}
