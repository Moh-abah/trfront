// import { IndicatorConfig } from '@/types/strategy';

// export interface IndicatorDef {
//     key: string;
//     label: string;
//     type: "trend" | "momentum" | "volatility" | "volume" | "support_resistance" | "custom";
//     description: string;
//     defaultParams: Record<string, any>;
//     // هل هذا مؤشر "preset" محدد في البايثون (مثل 'rsi_5m')؟
//     // أم مؤشر عام نحتاج لإضافة الـ timeframe له؟
//     isPreset: boolean;
//     supportedTimeframes?: string[]; // إذا كان preset، هذا هو TF الخاص به
//     requiresUserInput?: string; // مفتاح المعامل الذي يحتاج إدخال يدوي (مثل current_iv)
// }

// export const INDICATORS_REGISTRY: Record<string, IndicatorDef> = {

//     // --- TREND ---
//     "sma": {
//         key: "sma",
//         label: "SMA (Simple Moving Average)",
//         type: "trend",
//         description: "المتوسط المتحرك البسيط",
//         isPreset: false,
//         defaultParams: { period: 20 }
//     },
//     "ema": {
//         key: "ema",
//         label: "EMA (Exponential)",
//         type: "trend",
//         description: "المتوسط المتحرك الأسي",
//         isPreset: false,
//         defaultParams: { period: 20 }
//     },
//     "wma": {
//         key: "wma",
//         label: "WMA (Weighted)",
//         type: "trend",
//         description: "المتوسط المتحرك المرجح",
//         isPreset: false,
//         defaultParams: { period: 20 }
//     },
//     // SMA Presets (Hardcoded from Python)
//     "sma_8_1h": { key: "sma_8_1h", label: "SMA 8 (1H)", type: "trend", description: "SMA 8 1H", isPreset: true, supportedTimeframes: ["1h"], defaultParams: { period: 8 } },
//     "sma_13_1h": { key: "sma_13_1h", label: "SMA 13 (1H)", type: "trend", description: "SMA 13 1H", isPreset: true, supportedTimeframes: ["1h"], defaultParams: { period: 13 } },
//     "sma_21_1h": { key: "sma_21_1h", label: "SMA 21 (1H)", type: "trend", description: "SMA 21 1H", isPreset: true, supportedTimeframes: ["1h"], defaultParams: { period: 21 } },
//     "sma_50_1h": { key: "sma_50_1h", label: "SMA 50 (1H)", type: "trend", description: "SMA 50 1H", isPreset: true, supportedTimeframes: ["1h"], defaultParams: { period: 50 } },

//     // --- MOMENTUM ---
//     "rsi": {
//         key: "rsi",
//         label: "RSI (Relative Strength Index)",
//         type: "momentum",
//         description: "مؤشر القوة النسبية",
//         isPreset: false,
//         defaultParams: { period: 14, overbought: 70, oversold: 30 }
//     },
//     "rsi_5m": { key: "rsi", label: "RSI 5m", type: "momentum", description: "RSI 5m", isPreset: true, supportedTimeframes: ["5m"], defaultParams: { period: 14 } },
//     "rsi_15m": { key: "rsi", label: "RSI 15m", type: "momentum", description: "RSI 15m", isPreset: true, supportedTimeframes: ["15m"], defaultParams: { period: 14 } },
//     "rsi_1h": { key: "rsi", label: "RSI 1h", type: "momentum", description: "RSI 1h", isPreset: true, supportedTimeframes: ["1h"], defaultParams: { period: 14 } },
//     "rsi_2h": { key: "rsi", label: "RSI 2h", type: "momentum", description: "RSI 2h", isPreset: true, supportedTimeframes: ["2h"], defaultParams: { period: 14 } },

//     "macd": {
//         key: "macd",
//         label: "MACD",
//         type: "momentum",
//         description: "Moving Average Convergence Divergence",
//         isPreset: false,
//         defaultParams: { fast: 12, slow: 26, signal: 9 }
//     },
//     "macd_5m": { key: "macd", label: "MACD 5m", type: "momentum", description: "MACD 5m", isPreset: true, supportedTimeframes: ["5m"], defaultParams: {} },
//     "macd_15m": { key: "macd", label: "MACD 15m", type: "momentum", description: "MACD 15m", isPreset: true, supportedTimeframes: ["15m"], defaultParams: {} },
//     "macd_1h": { key: "macd", label: "MACD 1h", type: "momentum", description: "MACD 1h", isPreset: true, supportedTimeframes: ["1h"], defaultParams: {} },
//     "macd_2h": { key: "macd", label: "MACD 2h", type: "momentum", description: "MACD 2h", isPreset: true, supportedTimeframes: ["2h"], defaultParams: {} },

//     "stochastic": {
//         key: "stochastic",
//         label: "Stochastic Oscillator",
//         type: "momentum",
//         description: "المؤشر العشوائي",
//         isPreset: false,
//         defaultParams: { k_period: 14, d_period: 3, smooth: 3, overbought: 80, oversold: 20 }
//     },

//     "momentum": {
//         key: "momentum",
//         label: "Momentum",
//         type: "momentum",
//         description: "Rate of Change",
//         isPreset: false,
//         defaultParams: { period: 10 }
//     },
//     "momentum_5m": { key: "momentum", label: "Momentum 5m", type: "momentum", description: "Mom 5m", isPreset: true, supportedTimeframes: ["5m"], defaultParams: {} },
//     "momentum_10m": { key: "momentum", label: "Momentum 10m", type: "momentum", description: "Mom 10m", isPreset: true, supportedTimeframes: ["10m"], defaultParams: {} },
//     "momentum_15m": { key: "momentum", label: "Momentum 15m", type: "momentum", description: "Mom 15m", isPreset: true, supportedTimeframes: ["15m"], defaultParams: {} },
//     "momentum_1h": { key: "momentum", label: "Momentum 1h", type: "momentum", description: "Mom 1h", isPreset: true, supportedTimeframes: ["1h"], defaultParams: {} },

//     // --- VOLATILITY ---
//     "bollinger_bands": {
//         key: "bollinger_bands",
//         label: "Bollinger Bands",
//         type: "volatility",
//         description: "أشرطة بولينجر",
//         isPreset: false,
//         defaultParams: { period: 20, std: 2.0 }
//     },
//     "bollinger_5m": { key: "bollinger_bands", label: "BB 5m", type: "volatility", isPreset: true, supportedTimeframes: ["5m"], defaultParams: {} },
//     "bollinger_15m": { key: "bollinger_bands", label: "BB 15m", type: "volatility", isPreset: true, supportedTimeframes: ["15m"], defaultParams: {} },

//     "atr": {
//         key: "atr",
//         label: "ATR (Average True Range)",
//         type: "volatility",
//         description: "مؤشر المدى الحقيقي المتوسط",
//         isPreset: false,
//         defaultParams: { period: 14 }
//     },

//     "hv_iv_analysis": {
//         key: "hv_iv_analysis",
//         label: "HV/IV Options Strategy",
//         type: "volatility",
//         description: "تحليل التقلب التاريخي والضمني",
//         isPreset: false,
//         requiresUserInput: "current_iv", // مفتاح المعامل الخاص
//         defaultParams: { period: 20, lookback: 252, current_iv: 25.0 }
//     },

//     // --- VOLUME ---
//     "volume_climax": {
//         key: "volume_climax",
//         label: "Volume Climax",
//         type: "volume",
//         description: "تحديد شموع ذروة الفوليوم",
//         isPreset: false,
//         defaultParams: { period: 20, std_mult: 2.0 }
//     },
//     "vol_climax_30s": { key: "volume_climax", label: "Vol Climax 30s", type: "volume", isPreset: true, supportedTimeframes: ["30s"], defaultParams: {} },
//     "vol_climax_1m": { key: "volume_climax", label: "Vol Climax 1m", type: "volume", isPreset: true, supportedTimeframes: ["1m"], defaultParams: {} },
//     "vol_climax_5m": { key: "volume_climax", label: "Vol Climax 5m", type: "volume", isPreset: true, supportedTimeframes: ["5m"], defaultParams: {} },
//     "vol_climax_15m": { key: "volume_climax", label: "Vol Climax 15m", type: "volume", isPreset: true, supportedTimeframes: ["15m"], defaultParams: {} },
//     "vol_climax_1h": { key: "volume_climax", label: "Vol Climax 1h", type: "volume", isPreset: true, supportedTimeframes: ["1h"], defaultParams: {} },

//     "vwap": {
//         key: "vwap",
//         label: "VWAP (Volume Weighted Avg)",
//         type: "volume",
//         description: "متوسط السعر المرجح بالحجم",
//         isPreset: false,
//         defaultParams: { period: 20 }
//     },

//     "obv": {
//         key: "obv",
//         label: "OBV (On Balance Volume)",
//         type: "volume",
//         description: "مؤشر حجم الرصيد",
//         isPreset: false,
//         defaultParams: {}
//     },

//     // --- SUPPORT & RESISTANCE ---
//     "supply_demand": {
//         key: "supply_demand",
//         label: "Supply & Demand Zones",
//         type: "support_resistance",
//         description: "مناطق العرض والطلب",
//         isPreset: false,
//         defaultParams: { period: 20, threshold: 2.0 }
//     },

//     "pivot_points": {
//         key: "pivot_points",
//         label: "Pivot Points",
//         type: "support_resistance",
//         description: "نقاط المحورية",
//         isPreset: false,
//         defaultParams: { method: "standard" }
//     },

//     "harmonic_patterns": {
//         key: "harmonic_patterns",
//         label: "Harmonic Patterns",
//         type: "support_resistance", // مسجل كـ trend في البايثون لكن هنا سنضعه S&R
//         description: "اكتشاف أنماذج الهارمونيك",
//         isPreset: false,
//         defaultParams: { depth: 10, error_rate: 0.1 }
//     }
// };