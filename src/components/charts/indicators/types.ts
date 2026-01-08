import { UTCTimestamp } from "lightweight-charts";

// تعريف الهيكل العام للاستجابة من السيرفر (خاص بالماكد)
export interface MACDServerData {
    name: string;
    values: number[]; // خط الماكد الأساسي
    signals: {
        data: number[];
        index: string[]; // التواريخ بصيغة ISO
        dtype: string;
    };
    metadata: {
        macd_line: number[];
        signal_line: number[];
        histogram: number[];
        fast: number;
        slow: number;
        signal: number;
    };
}

// يمكنك إضافة مؤشرات أخرى هنا مستقبلاً
// export interface RSIServerData { ... }