/**
 * أدوات تنسيق التواريخ والأوقات
 */

export interface DateFormatOptions {
    locale?: string;
    timeZone?: string;
    showTime?: boolean;
    showSeconds?: boolean;
    format?: 'short' | 'medium' | 'long' | 'full' | 'relative';
    customFormat?: string;
}

export class DateFormatter {
    private static defaultLocale = 'en-US';
    private static defaultTimeZone = 'UTC';

    /**
     * تنسيق تاريخ مع خيارات
     */
    static formatDate(
        date: Date | string | number,
        options: DateFormatOptions = {}
    ): string {
        const dateObj = this.parseDate(date);
        if (!dateObj) return 'Invalid Date';

        const {
            locale = this.defaultLocale,
            timeZone = this.defaultTimeZone,
            showTime = false,
            showSeconds = false,
            format = 'medium',
            customFormat
        } = options;

        if (customFormat) {
            return this.formatCustom(dateObj, customFormat, timeZone);
        }

        if (format === 'relative') {
            return this.formatRelative(dateObj);
        }

        const dateFormatOptions: Intl.DateTimeFormatOptions = {
            timeZone,
            ...this.getFormatOptions(format, showTime, showSeconds)
        };

        return new Intl.DateTimeFormat(locale, dateFormatOptions).format(dateObj);
    }

    /**
     * تنسيق الوقت فقط
     */
    static formatTime(
        date: Date | string | number,
        options: {
            locale?: string;
            timeZone?: string;
            showSeconds?: boolean;
            showMeridiem?: boolean;
        } = {}
    ): string {
        const dateObj = this.parseDate(date);
        if (!dateObj) return 'Invalid Time';

        const {
            locale = this.defaultLocale,
            timeZone = this.defaultTimeZone,
            showSeconds = true,
            showMeridiem = true
        } = options;

        const timeFormatOptions: Intl.DateTimeFormatOptions = {
            timeZone,
            hour: '2-digit',
            minute: '2-digit',
            second: showSeconds ? '2-digit' : undefined,
            hour12: showMeridiem
        };

        return new Intl.DateTimeFormat(locale, timeFormatOptions).format(dateObj);
    }

    /**
     * تنسيق الفترة الزمنية
     */
    static formatDuration(
        milliseconds: number,
        options: {
            verbose?: boolean;
            showMilliseconds?: boolean;
            maxUnits?: number;
        } = {}
    ): string {
        const {
            verbose = false,
            showMilliseconds = false,
            maxUnits = 2
        } = options;

        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        const units: string[] = [];

        if (days > 0) {
            units.push(`${days}${verbose ? ' day' + (days !== 1 ? 's' : '') : 'd'}`);
        }

        const remainingHours = hours % 24;
        if (remainingHours > 0 && units.length < maxUnits) {
            units.push(`${remainingHours}${verbose ? ' hour' + (remainingHours !== 1 ? 's' : '') : 'h'}`);
        }

        const remainingMinutes = minutes % 60;
        if (remainingMinutes > 0 && units.length < maxUnits) {
            units.push(`${remainingMinutes}${verbose ? ' minute' + (remainingMinutes !== 1 ? 's' : '') : 'm'}`);
        }

        const remainingSeconds = seconds % 60;
        if (remainingSeconds > 0 && units.length < maxUnits) {
            units.push(`${remainingSeconds}${verbose ? ' second' + (remainingSeconds !== 1 ? 's' : '') : 's'}`);
        }

        if (showMilliseconds && units.length < maxUnits) {
            const ms = milliseconds % 1000;
            if (ms > 0) {
                units.push(`${ms}${verbose ? ' millisecond' + (ms !== 1 ? 's' : '') : 'ms'}`);
            }
        }

        return units.join(' ') || (verbose ? '0 seconds' : '0s');
    }

    /**
     * تنسيق الوقت النسبي (مثل "منذ دقيقتين")
     */
    static formatRelative(date: Date | string | number): string {
        const dateObj = this.parseDate(date);
        if (!dateObj) return 'Invalid Date';

        const now = new Date();
        const diffMs = now.getTime() - dateObj.getTime();
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffSec < 5) return 'just now';
        if (diffSec < 60) return `${diffSec} seconds ago`;
        if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
        if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
        if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;

        return this.formatDate(dateObj, { format: 'short' });
    }

    /**
     * تنسيق الفترة بين تاريخين
     */
    static formatDateRange(
        startDate: Date | string | number,
        endDate: Date | string | number,
        options: {
            locale?: string;
            timeZone?: string;
            format?: 'short' | 'medium' | 'long';
        } = {}
    ): string {
        const start = this.parseDate(startDate);
        const end = this.parseDate(endDate);

        if (!start || !end) return 'Invalid Date Range';

        const { locale = this.defaultLocale, timeZone = this.defaultTimeZone, format = 'short' } = options;

        const sameYear = start.getFullYear() === end.getFullYear();
        const sameMonth = sameYear && start.getMonth() === end.getMonth();
        const sameDay = sameMonth && start.getDate() === end.getDate();

        if (sameDay) {
            return this.formatDate(start, { locale, timeZone, format });
        }

        const startOptions = this.getFormatOptions(format, false, false);
        const endOptions = { ...startOptions };

        if (sameYear) {
            delete startOptions.year;
            delete endOptions.year;

            if (sameMonth) {
                delete startOptions.month;
                delete endOptions.month;
            }
        }

        const startFormatted = new Intl.DateTimeFormat(locale, {
            ...startOptions,
            timeZone
        }).format(start);

        const endFormatted = new Intl.DateTimeFormat(locale, {
            ...endOptions,
            timeZone
        }).format(end);

        return `${startFormatted} - ${endFormatted}`;
    }

    /**
     * تنسيق الإطار الزمني للتداول
     */
    static formatTimeframe(timeframe: string): string {
        const timeframeMap: Record<string, string> = {
            '1': '1 Minute',
            '5': '5 Minutes',
            '15': '15 Minutes',
            '30': '30 Minutes',
            '60': '1 Hour',
            '240': '4 Hours',
            'D': 'Daily',
            'W': 'Weekly',
            'M': 'Monthly',
            '1m': '1 Minute',
            '5m': '5 Minutes',
            '15m': '15 Minutes',
            '30m': '30 Minutes',
            '1h': '1 Hour',
            '4h': '4 Hours',
            '1d': '1 Day',
            '1w': '1 Week',
            '1M': '1 Month'
        };

        return timeframeMap[timeframe] || timeframe;
    }

    /**
     * تحويل التاريخ إلى توقيت يونكس
     */
    static toUnixTimestamp(date: Date | string | number): number {
        const dateObj = this.parseDate(date);
        return dateObj ? Math.floor(dateObj.getTime() / 1000) : 0;
    }

    /**
     * تحويل توقيت يونكس إلى تاريخ
     */
    static fromUnixTimestamp(timestamp: number): Date {
        return new Date(timestamp * 1000);
    }

    /**
     * إضافة وقت للتاريخ
     */
    static addTime(
        date: Date | string | number,
        amount: number,
        unit: 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'
    ): Date {
        const dateObj = this.parseDate(date);
        if (!dateObj) return new Date();

        const newDate = new Date(dateObj);

        switch (unit) {
            case 'seconds':
                newDate.setSeconds(newDate.getSeconds() + amount);
                break;
            case 'minutes':
                newDate.setMinutes(newDate.getMinutes() + amount);
                break;
            case 'hours':
                newDate.setHours(newDate.getHours() + amount);
                break;
            case 'days':
                newDate.setDate(newDate.getDate() + amount);
                break;
            case 'weeks':
                newDate.setDate(newDate.getDate() + (amount * 7));
                break;
            case 'months':
                newDate.setMonth(newDate.getMonth() + amount);
                break;
            case 'years':
                newDate.setFullYear(newDate.getFullYear() + amount);
                break;
        }

        return newDate;
    }

    /**
     * حساب الفرق بين تاريخين
     */
    static difference(
        date1: Date | string | number,
        date2: Date | string | number,
        unit: 'seconds' | 'minutes' | 'hours' | 'days'
    ): number {
        const d1 = this.parseDate(date1);
        const d2 = this.parseDate(date2);

        if (!d1 || !d2) return 0;

        const diffMs = Math.abs(d2.getTime() - d1.getTime());

        switch (unit) {
            case 'seconds':
                return Math.floor(diffMs / 1000);
            case 'minutes':
                return Math.floor(diffMs / (1000 * 60));
            case 'hours':
                return Math.floor(diffMs / (1000 * 60 * 60));
            case 'days':
                return Math.floor(diffMs / (1000 * 60 * 60 * 24));
            default:
                return diffMs;
        }
    }

    /**
     * التحقق إذا كان التاريخ اليوم
     */
    static isToday(date: Date | string | number): boolean {
        const dateObj = this.parseDate(date);
        if (!dateObj) return false;

        const today = new Date();
        return (
            dateObj.getDate() === today.getDate() &&
            dateObj.getMonth() === today.getMonth() &&
            dateObj.getFullYear() === today.getFullYear()
        );
    }

    /**
     * التحقق إذا كان التاريخ في هذا الأسبوع
     */
    static isThisWeek(date: Date | string | number): boolean {
        const dateObj = this.parseDate(date);
        if (!dateObj) return false;

        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        return dateObj >= weekStart && dateObj <= weekEnd;
    }

    /**
     * التحقق إذا كان التاريخ في هذا الشهر
     */
    static isThisMonth(date: Date | string | number): boolean {
        const dateObj = this.parseDate(date);
        if (!dateObj) return false;

        const today = new Date();
        return (
            dateObj.getMonth() === today.getMonth() &&
            dateObj.getFullYear() === today.getFullYear()
        );
    }

    // ===== Private Methods =====

    private static parseDate(date: Date | string | number): Date | null {
        if (date instanceof Date) return date;
        if (typeof date === 'number') return new Date(date);
        if (typeof date === 'string') {
            const parsed = new Date(date);
            return isNaN(parsed.getTime()) ? null : parsed;
        }
        return null;
    }

    private static getFormatOptions(
        format: string,
        showTime: boolean,
        showSeconds: boolean
    ): Intl.DateTimeFormatOptions {
        const baseOptions: Intl.DateTimeFormatOptions = {};

        switch (format) {
            case 'short':
                baseOptions.year = 'numeric';
                baseOptions.month = 'numeric';
                baseOptions.day = 'numeric';
                break;
            case 'medium':
                baseOptions.year = 'numeric';
                baseOptions.month = 'short';
                baseOptions.day = 'numeric';
                break;
            case 'long':
                baseOptions.year = 'numeric';
                baseOptions.month = 'long';
                baseOptions.day = 'numeric';
                break;
            case 'full':
                baseOptions.year = 'numeric';
                baseOptions.month = 'long';
                baseOptions.day = 'numeric';
                baseOptions.weekday = 'long';
                break;
        }

        if (showTime) {
            baseOptions.hour = '2-digit';
            baseOptions.minute = '2-digit';

            if (showSeconds) {
                baseOptions.second = '2-digit';
            }
        }

        return baseOptions;
    }

    private static formatCustom(
        date: Date,
        format: string,
        timeZone: string
    ): string {
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        const parts = formatter.formatToParts(date);
        const partsMap: Record<string, string> = {};

        parts.forEach(part => {
            partsMap[part.type] = part.value;
        });

        return format
            .replace(/yyyy/g, partsMap.year)
            .replace(/MM/g, partsMap.month)
            .replace(/dd/g, partsMap.day)
            .replace(/HH/g, partsMap.hour)
            .replace(/mm/g, partsMap.minute)
            .replace(/ss/g, partsMap.second);
    }
}