// services/api/indicators.service.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://161.97.73.254:8017';

// services/api/indicators.service.ts
export const indicatorsService = {
    // ✅ التعديل: استخدام المسار الصحيح
    async applyIndicators(
        symbol: string,
        timeframe: string,
        market: 'crypto' | 'stocks',
        indicators: any[],
        days: number = 30
    ) {
        const queryParams = new URLSearchParams({
            symbol,
            timeframe,
            market,
            days: days.toString(),
            enable_live: 'true' // تفعيل البث الحي تلقائياً
        });

        const response = await fetch(
            `${API_BASE_URL}/api/v1/indicators/apply?${queryParams}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(indicators) // إرسال قائمة المؤشرات مباشرة
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to apply indicators: ${response.statusText}`);
        }

        const data = await response.json();

        // إرجاع البيانات مع معلومات البث الحي
        return {
            ...data,
            websocketUrl: data.live_monitoring?.websocket_url ||
                `ws://161.97.73.254:8017/ws/indicators/${symbol}`
        };
    },

    // ✅ إضافة: نقطة نهاية المؤشرات المتاحة
    async getAvailableIndicators(category?: string) {
        const url = category
            ? `${API_BASE_URL}/api/v1/indicators/?category=${category}`
            : `${API_BASE_URL}/api/v1/indicators/`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to get available indicators');
        return response.json();
    },

    // ✅ إضافة: نقطة نهاية معلمات المؤشر
    async getIndicatorParams(indicatorName: string) {
        const response = await fetch(
            `${API_BASE_URL}/api/v1/indicators/${indicatorName}/params`
        );
        if (!response.ok) throw new Error('Failed to get indicator parameters');
        return response.json();
    }
};