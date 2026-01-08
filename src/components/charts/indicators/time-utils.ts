// indicators/time-utils.ts

import type { UTCTimestamp } from "lightweight-charts";

/**
 * =================================================================
 * 🛡️ البوابة الزمنية المركزية للمؤشرات (Central Time Gateway)
 * =================================================================
 * هذه الدالة هي المسؤولة الوحيدة عن تحويل أي وقت وارد من أي مصدر
 * (خادم، عميل، إلخ) إلى الصيغة النهائية المطلوبة لمكتبة lightweight-charts.
 *
 * الصيغة النهائية هي: UTCTimestamp (عدد صحيح يمثل الثواني منذ 1970-01-01 UTC).
 *
 * هذا يضمن اتساقاً تاماً في معالجة الوقت عبر جميع المؤشرات
 * ويقضي على أي التباس بين المللي ثانية والثواني.
 *
 * @param time - الوقت الوارد (رقم، نص، أو كائن Date).
 * @returns الوقت المحول إلى صيغة UTCTimestamp.
 */
export const toUTCTimestamp = (time: number | string | Date): UTCTimestamp => {
    try {
        let timestampMs: number;

        if (typeof time === 'number') {
            timestampMs = time;
        } else if (typeof time === 'string') {
            // محاولة تحليل النصوص الزمنية القياسية (ISO)
            const parsedDate = new Date(time);
            if (isNaN(parsedDate.getTime())) {
                // إذا فشل التحليل، حاول تفسير النص كرقم
                const parsedNumber = parseFloat(time);
                timestampMs = isNaN(parsedNumber) ? Date.now() : parsedNumber;
            } else {
                timestampMs = parsedDate.getTime();
            }
        } else if (time instanceof Date) {
            timestampMs = time.getTime();
        } else {
            console.error("[TimeUtils] ❌ Invalid time format received:", time);
            return Math.floor(Date.now() / 1000) as UTCTimestamp;
        }

        // التحقق من صحة الرقم النهائي
        if (isNaN(timestampMs) || !isFinite(timestampMs)) {
            console.error("[TimeUtils] ❌ Time is NaN or Infinite:", time);
            return Math.floor(Date.now() / 1000) as UTCTimestamp;
        }

        // 🔥 التحويل الأساسي: من المللي ثانية إلى ثواني
        // إذا كان الطابع الزمني أكبر من عام 2286، فمن المرجح أنه بالمللي ثانية.
        if (timestampMs > 1000000000000) {
            return Math.floor(timestampMs / 1000) as UTCTimestamp;
        }

        // إذا كان بالثواني بالفعل، تأكد أنه عدد صحيح
        return Math.floor(timestampMs) as UTCTimestamp;

    } catch (error) {
        console.error("[TimeUtils] ❌ Error in toUTCTimestamp:", error, "time:", time);
        return Math.floor(Date.now() / 1000) as UTCTimestamp;
    }
};