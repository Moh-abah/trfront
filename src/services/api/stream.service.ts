// ملف جديد: services/api/stream.service.ts
export const streamService = {
    // 🔥 وظيفة بسيطة: تحديث سعر عملة واحدة
    async startPriceStream(symbol: string, market: string) {
        try {
            const response = await fetch(
                `http://161.97.73.254:8017/ws/stream/start?` +
                `symbol=${symbol}&market=${market}&timeframe=1s`
            );
            return await response.json();
        } catch (error) {
            console.log('⚠️ لنستخدم Polling بدلاً من Stream');
            return null;
        }
    }
};