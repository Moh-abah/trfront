import axios, { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import { StrategyConfig } from '@/types/strategy';

// رابط الـ API الأساسي (تأكد أنه يطابق عنوان باك-تستك)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://62.169.17.101:8017/api/v1';

export class StrategyService {
    /**
     * تشغيل الاستراتيجية (Run Backtest)
     * 
     * @param config كائن الاستراتيجية الكامل (من الـ Store)
     * @param symbol الزوج (مثل ETHUSDT)
     * @param timeframe الفريم الزمني (مثل 1h)
     */
    static async runStrategy(config: StrategyConfig, symbol: string, timeframe: string) {
        // 1. تحضير رابط الطلب
        const endpoint = `${API_BASE_URL}/strategies1/run`;

        // 2. معاملات الطلب (Query Params)
        // لاحظ أننا نرسل market, days, live_mode كمعاملات كما في الباك-تست
        const params = {
            symbol: symbol,
            timeframe: timeframe,
            market: 'crypto',
            days: 30, // يمكنك جعل هذا قابل للتعديل من الـ UI أيضاً
            live_mode: false
        };

        try {
            // 3. الإرسال الفعلي (POST Request)
            // لاحظ أننا نرسل `config` مباشرة كـ Request Body (JSON)
            const response = await axios.post(endpoint, config, { params });

            // 4. معالجة النجاح
            console.log("✅ [StrategyService] Backtest Response:", response.data);

            // عرض رسالة نجاح للمستخدم
            toast.success("Strategy simulation completed successfully!", { position: 'top-center' });

            // إرجاع البيانات للـ Page Handler
            return response.data;

        } catch (error) {
            // 5. معالجة الأخطاء
            console.error("❌ [StrategyService] Error running strategy:", error);

            // استخراج رسالة الخطأ من الباك-تست
            let errorMessage = "Failed to run strategy";

            if (axios.isAxiosError(error)) {
                if (error.response?.data?.detail) {
                    errorMessage = error.response.data.detail; // رسالة Pydantic
                } else if (error.response?.data?.message) {
                    errorMessage = error.response.data.message;
                }
            }

            // عرض رسالة الخطأ
            toast.error(errorMessage, { duration: 4000 });

            // رمي الخطأ ليقوم الـ UI بالتعامل معه (مثلاً منع اللودينج)
            throw new Error(errorMessage);
        }
    }

    /**
     * التحقق من صحة الاستراتيجية (Validate)
     * (اختياري، يمكنك استدعائه قبل الضغط على Run)
     */
    static async validateStrategy(config: StrategyConfig) {
        const endpoint = `${API_BASE_URL}/strategies1/validate`;

        try {
            const response = await axios.post(endpoint, config);
            return response.data;
        } catch (error) {
            console.error("Validation Error:", error);
            throw error;
        }
    }
}