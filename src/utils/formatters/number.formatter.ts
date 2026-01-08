/**
 * أدوات تنسيق الأرقام والإحصائيات
 */

export interface NumberFormatOptions {
    locale?: string;
    decimals?: number;
    compact?: boolean;
    prefix?: string;
    suffix?: string;
    signDisplay?: 'auto' | 'never' | 'always' | 'exceptZero';
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
}

export class NumberFormatter {
    private static defaultLocale = 'en-US';

    /**
     * تنسيق رقم عادي
     */
    static formatNumber(
        value: number,
        options: NumberFormatOptions = {}
    ): string {
        const {
            locale = this.defaultLocale,
            decimals = 2,
            compact = false,
            prefix = '',
            suffix = '',
            signDisplay = 'auto',
            minimumFractionDigits,
            maximumFractionDigits
        } = options;

        if (compact && Math.abs(value) >= 1000) {
            return this.formatCompact(value, locale, decimals, prefix, suffix);
        }

        const formatter = new Intl.NumberFormat(locale, {
            minimumFractionDigits: minimumFractionDigits ?? decimals,
            maximumFractionDigits: maximumFractionDigits ?? decimals,
            signDisplay
        });

        return `${prefix}${formatter.format(value)}${suffix}`;
    }

    /**
     * تنسيق رقم مضغوط (K, M, B, T)
     */
    static formatCompact(
        value: number,
        locale: string = this.defaultLocale,
        decimals: number = 2,
        prefix: string = '',
        suffix: string = ''
    ): string {
        const absValue = Math.abs(value);
        const sign = value < 0 ? '-' : '';

        let formatted: string;
        let unit = '';

        if (absValue >= 1e12) {
            formatted = (absValue / 1e12).toFixed(decimals);
            unit = 'T';
        } else if (absValue >= 1e9) {
            formatted = (absValue / 1e9).toFixed(decimals);
            unit = 'B';
        } else if (absValue >= 1e6) {
            formatted = (absValue / 1e6).toFixed(decimals);
            unit = 'M';
        } else if (absValue >= 1e3) {
            formatted = (absValue / 1e3).toFixed(decimals);
            unit = 'K';
        } else {
            formatted = absValue.toFixed(decimals);
        }

        // إزالة الأصفار الزائدة
        formatted = formatted.replace(/\.?0+$/, '');

        return `${sign}${prefix}${formatted}${unit}${suffix}`;
    }

    /**
     * تنسيق نسبة مئوية
     */
    static formatPercentage(
        value: number,
        options: {
            decimals?: number;
            showSign?: boolean;
            showSymbol?: boolean;
        } = {}
    ): string {
        const {
            decimals = 2,
            showSign = true,
            showSymbol = true
        } = options;

        const sign = showSign && value > 0 ? '+' : '';
        const symbol = showSymbol ? '%' : '';
        const formattedValue = Math.abs(value).toFixed(decimals);

        return `${sign}${formattedValue}${symbol}`;
    }

    /**
     * تنسيق نسبة مع علامة عشرية
     */
    static formatRatio(
        value: number,
        options: {
            decimals?: number;
            asPercentage?: boolean;
        } = {}
    ): string {
        const { decimals = 4, asPercentage = false } = options;

        if (asPercentage) {
            return this.formatPercentage(value * 100, { decimals });
        }

        return value.toFixed(decimals);
    }

    /**
     * تنسيق عدد صحيح
     */
    static formatInteger(value: number): string {
        return Math.round(value).toLocaleString(this.defaultLocale);
    }

    /**
     * تنسيق رقم علمي
     */
    static formatScientific(
        value: number,
        decimals: number = 4
    ): string {
        return value.toExponential(decimals);
    }

    /**
     * تنسرق رقم ثنائي (للتداول)
     */
    static formatBinary(value: number, bits: number = 8): string {
        return (value >>> 0).toString(2).padStart(bits, '0');
    }

    /**
     * تنسيق رقم هيكساديسيمال
     */
    static formatHex(value: number, prefix: boolean = true): string {
        const hex = value.toString(16).toUpperCase();
        return prefix ? `0x${hex}` : hex;
    }

    /**
     * تنسيق حجم البيانات
     */
    static formatBytes(
        bytes: number,
        options: {
            decimals?: number;
            binary?: boolean;
        } = {}
    ): string {
        const { decimals = 2, binary = false } = options;

        if (bytes === 0) return '0 Bytes';

        const k = binary ? 1024 : 1000;
        const sizes = binary
            ? ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB']
            : ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
    }

    /**
     * تنسرق زمن (مللي ثانية)
     */
    static formatMilliseconds(
        ms: number,
        options: {
            showUnits?: boolean;
            decimals?: number;
        } = {}
    ): string {
        const { showUnits = true, decimals = 2 } = options;

        if (ms < 1000) {
            return `${ms.toFixed(decimals)}${showUnits ? 'ms' : ''}`;
        } else if (ms < 60000) {
            return `${(ms / 1000).toFixed(decimals)}${showUnits ? 's' : ''}`;
        } else if (ms < 3600000) {
            return `${(ms / 60000).toFixed(decimals)}${showUnits ? 'm' : ''}`;
        } else {
            return `${(ms / 3600000).toFixed(decimals)}${showUnits ? 'h' : ''}`;
        }
    }

    /**
     * تنسيق فرق السعر (pip/pipette)
     */
    static formatPip(
        value: number,
        pipSize: number = 0.0001,
        options: {
            showSign?: boolean;
            decimals?: number;
        } = {}
    ): string {
        const { showSign = true, decimals = 1 } = options;
        const pips = value / pipSize;
        const sign = showSign && pips > 0 ? '+' : '';

        return `${sign}${pips.toFixed(decimals)} pips`;
    }

    /**
     * تنسيق فاصل الألفية
     */
    static formatWithCommas(value: number | string): string {
        const numStr = typeof value === 'number' ? value.toString() : value;
        return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /**
     * تقريب رقم لأقرب قيمة
     */
    static roundTo(value: number, precision: number = 2): number {
        const multiplier = Math.pow(10, precision);
        return Math.round(value * multiplier) / multiplier;
    }

    /**
     * تقريب رقم للأسفل
     */
    static floorTo(value: number, precision: number = 2): number {
        const multiplier = Math.pow(10, precision);
        return Math.floor(value * multiplier) / multiplier;
    }

    /**
     * تقريب رقم للأعلى
     */
    static ceilTo(value: number, precision: number = 2): number {
        const multiplier = Math.pow(10, precision);
        return Math.ceil(value * multiplier) / multiplier;
    }

    /**
     * تنسيق نطاق الأرقام
     */
    static formatRange(
        min: number,
        max: number,
        options: {
            separator?: string;
            decimals?: number;
            showEqual?: boolean;
        } = {}
    ): string {
        const {
            separator = ' - ',
            decimals = 2,
            showEqual = true
        } = options;

        if (min === max && showEqual) {
            return this.formatNumber(min, { decimals });
        }

        return `${this.formatNumber(min, { decimals })}${separator}${this.formatNumber(max, { decimals })}`;
    }

    /**
     * تنسيق خطأ النسبة المئوية
     */
    static formatErrorMargin(
        value: number,
        error: number,
        options: {
            decimals?: number;
            showSymbol?: boolean;
        } = {}
    ): string {
        const { decimals = 2, showSymbol = true } = options;
        const symbol = showSymbol ? '%' : '';

        return `${value.toFixed(decimals)}${symbol} ± ${error.toFixed(decimals)}${symbol}`;
    }

    /**
     * تنسيق التقدم (النسبة المئوية مع شريط)
     */
    static formatProgress(
        value: number,
        total: number,
        options: {
            decimals?: number;
            showValue?: boolean;
            showPercent?: boolean;
        } = {}
    ): string {
        const { decimals = 1, showValue = true, showPercent = true } = options;

        if (total === 0) return '0%';

        const percent = (value / total) * 100;
        const percentStr = percent.toFixed(decimals) + '%';

        if (showValue && showPercent) {
            return `${value}/${total} (${percentStr})`;
        } else if (showValue) {
            return `${value}/${total}`;
        } else {
            return percentStr;
        }
    }

    /**
     * تنسيق الوسيط (معدل مع ± انحراف معياري)
     */
    static formatMeanWithStd(
        mean: number,
        std: number,
        options: {
            decimals?: number;
            showPlusMinus?: boolean;
        } = {}
    ): string {
        const { decimals = 2, showPlusMinus = true } = options;

        const meanStr = mean.toFixed(decimals);
        const stdStr = std.toFixed(decimals);

        if (showPlusMinus) {
            return `${meanStr} ± ${stdStr}`;
        } else {
            return `${meanStr} (σ=${stdStr})`;
        }
    }

    /**
     * إنشاء تنسيق رقم مخصص باستخدام إعدادات
     */
    static createFormatter(options: NumberFormatOptions) {
        return (value: number) => this.formatNumber(value, options);
    }

    /**
     * تحويل نص إلى رقم
     */
    static parseNumber(
        text: string,
        options: {
            locale?: string;
            fallback?: number;
        } = {}
    ): number {
        const { locale = this.defaultLocale, fallback = 0 } = options;

        try {
            // إزالة أي أحرف غير رقمية باستثناء النقطة والفواصل
            const cleanText = text.replace(/[^\d.,-]/g, '');

            // استخدام محلل الأرقام الخاص باللغة
            const formatter = new Intl.NumberFormat(locale);
            const parts = formatter.formatToParts(1234.5);

            const decimalSeparator = parts.find(p => p.type === 'decimal')?.value || '.';
            const groupSeparator = parts.find(p => p.type === 'group')?.value || ',';

            let normalized = cleanText
                .replace(new RegExp(`\\${groupSeparator}`, 'g'), '')
                .replace(new RegExp(`\\${decimalSeparator}`), '.');

            const result = parseFloat(normalized);
            return isNaN(result) ? fallback : result;
        } catch {
            return fallback;
        }
    }
}