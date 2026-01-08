




















/**
 * أدوات تنسيق الأسعار والعملات
 */












export interface PriceFormatOptions {
    currency?: string;
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    notation?: 'standard' | 'scientific' | 'engineering' | 'compact';
    compactDisplay?: 'short' | 'long';
    signDisplay?: 'auto' | 'never' | 'always' | 'exceptZero';
}

export interface CryptoFormatOptions {
    showSymbol?: boolean;
    showChange?: boolean;
    changeDecimal?: number;
    useBtcQuote?: boolean;
}

export class PriceFormatter {
    private static defaultOptions: PriceFormatOptions = {
        currency: 'USD',
        locale: 'en-US',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        notation: 'standard',
        compactDisplay: 'short',
        signDisplay: 'auto'
    };

    // أضف هذه الدالة
    static format(value: number, options?: Partial<PriceFormatOptions>): string {
        const mergedOptions = { ...this.defaultOptions, ...options };

        return new Intl.NumberFormat(mergedOptions.locale, {
            style: 'currency',
            currency: mergedOptions.currency,
            minimumFractionDigits: mergedOptions.minimumFractionDigits,
            maximumFractionDigits: mergedOptions.maximumFractionDigits,
            notation: mergedOptions.notation,
            compactDisplay: mergedOptions.compactDisplay,
            signDisplay: mergedOptions.signDisplay
        }).format(value);
    }

  

    static formatWithSymbol(value: number, symbol: string = '$'): string {
        if (value >= 1000000) {
            return `${symbol}${(value / 1000000).toFixed(2)}M`;
        }
        if (value >= 1000) {
            return `${symbol}${(value / 1000).toFixed(2)}K`;
        }
        return `${symbol}${value.toFixed(2)}`;
    }











    /**
 * تنسيق رقم بصيغة compact (K, M, B)
 * مناسب للمحاور والرسوم البيانية
 */
    static formatCompact(
        value: number,
        options: {
            locale?: string;
            maximumFractionDigits?: number;
        } = {}
    ): string {
        const {
            locale = 'en-US',
            maximumFractionDigits = 1
        } = options;

        return new Intl.NumberFormat(locale, {
            notation: 'compact',
            compactDisplay: 'short',
            maximumFractionDigits
        }).format(value);
    }


    /**
     * تنسيق سعر عادي
     */
    static formatPrice(
        value: number,
        options: PriceFormatOptions = {}
    ): string {
        const mergedOptions = { ...this.defaultOptions, ...options };

        const formatter = new Intl.NumberFormat(mergedOptions.locale, {
            style: 'currency',
            currency: mergedOptions.currency,
            minimumFractionDigits: mergedOptions.minimumFractionDigits,
            maximumFractionDigits: mergedOptions.maximumFractionDigits,
            notation: mergedOptions.notation,
            compactDisplay: mergedOptions.compactDisplay,
            signDisplay: mergedOptions.signDisplay
        });

        return formatter.format(value);
    }

    /**
     * تنسيق سعر العملات الرقمية
     */
    static formatCryptoPrice(
        value: number,
        symbol: string = 'BTC',
        options: CryptoFormatOptions = {}
    ): string {
        const {
            showSymbol = true,
            showChange = false,
            changeDecimal = 2,
            useBtcQuote = false
        } = options;

        let formattedValue: string;

        if (value === 0) return `0 ${symbol}`;

        if (value < 0.000001) {
            formattedValue = value.toFixed(8);
        } else if (value < 0.001) {
            formattedValue = value.toFixed(6);
        } else if (value < 1) {
            formattedValue = value.toFixed(4);
        } else if (value < 1000) {
            formattedValue = value.toFixed(2);
        } else if (value < 1000000) {
            formattedValue = (value / 1000).toFixed(2) + 'K';
        } else if (value < 1000000000) {
            formattedValue = (value / 1000000).toFixed(2) + 'M';
        } else if (value < 1000000000000) {
            formattedValue = (value / 1000000000).toFixed(2) + 'B';
        } else {
            formattedValue = (value / 1000000000000).toFixed(2) + 'T';
        }

        let result = formattedValue;
        if (showSymbol) {
            result += ` ${symbol}`;
        }

        return result;
    }

    /**
     * تنسيق النسبة المئوية
     */
    static formatPercent(
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
     * تنسيق حجم التداول
     */
    static formatVolume(
        volume: number,
        currency: string = 'USD'
    ): string {
        if (volume === 0) return `0 ${currency}`;

        const absVolume = Math.abs(volume);

        if (absVolume < 1000) {
            return `${volume.toFixed(2)} ${currency}`;
        } else if (absVolume < 1000000) {
            return `${(volume / 1000).toFixed(2)}K ${currency}`;
        } else if (absVolume < 1000000000) {
            return `${(volume / 1000000).toFixed(2)}M ${currency}`;
        } else if (absVolume < 1000000000000) {
            return `${(volume / 1000000000).toFixed(2)}B ${currency}`;
        } else {
            return `${(volume / 1000000000000).toFixed(2)}T ${currency}`;
        }
    }

    /**
     * تنسيق القيمة السوقية
     */
    static formatMarketCap(
        marketCap: number,
        options: {
            currency?: string;
            compact?: boolean;
        } = {}
    ): string {
        const { currency = 'USD', compact = true } = options;

        if (!compact) {
            return this.formatPrice(marketCap, { currency });
        }

        if (marketCap < 1000000) {
            return `${(marketCap / 1000).toFixed(2)}K ${currency}`;
        } else if (marketCap < 1000000000) {
            return `${(marketCap / 1000000).toFixed(2)}M ${currency}`;
        } else if (marketCap < 1000000000000) {
            return `${(marketCap / 1000000000).toFixed(2)}B ${currency}`;
        } else {
            return `${(marketCap / 1000000000000).toFixed(2)}T ${currency}`;
        }
    }

    /**
     * تنسيق التغير اليومي
     */
    static formatChange(
        change: number,
        options: {
            decimals?: number;
            showSymbol?: boolean;
            showColor?: boolean;
        } = {}
    ): string {
        const {
            decimals = 2,
            showSymbol = true,
            showColor = false
        } = options;

        const symbol = showSymbol ? '%' : '';
        const formattedValue = Math.abs(change).toFixed(decimals);
        const sign = change > 0 ? '+' : change < 0 ? '-' : '';

        const result = `${sign}${formattedValue}${symbol}`;

        if (showColor) {
            return result;
        }

        return result;
    }

    /**
     * تنسيق نسبة الربح/الخسارة
     */
    static formatProfitLoss(
        profitLoss: number,
        options: {
            showSign?: boolean;
            showColor?: boolean;
            currency?: string;
        } = {}
    ): string {
        const {
            showSign = true,
            showColor = false,
            currency = 'USD'
        } = options;

        const sign = showSign && profitLoss > 0 ? '+' : '';
        const formatted = this.formatPrice(Math.abs(profitLoss), {
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        const result = `${sign}${formatted}`;

        if (showColor) {
            return result;
        }

        return result;
    }

    /**
     * تحويل سعر إلى نص بلون مناسب
     */
    static getPriceColor(value: number, isChange = false): string {
        if (value > 0) return 'text-green-600 dark:text-green-400';
        if (value < 0) return 'text-red-600 dark:text-red-400';
        return 'text-gray-600 dark:text-gray-400';
    }

    /**
     * تحويل سعر إلى فئة CSS للون
     */
    static getPriceColorClass(value: number): string {
        if (value > 0) return 'positive';
        if (value < 0) return 'negative';
        return 'neutral';
    }

    /**
     * تقريب السعر لمستويات الدعم والمقاومة
     */
    static roundToSignificantLevel(price: number): number {
        if (price <= 0) return price;

        const magnitude = Math.pow(10, Math.floor(Math.log10(price)));
        const normalized = price / magnitude;

        if (normalized >= 5) return Math.round(price / 5) * 5;
        if (normalized >= 2) return Math.round(price / 2) * 2;
        if (normalized >= 1) return Math.round(price);

        return Math.round(price * 100) / 100;
    }

    /**
     * حساب سعر الهدف بناء على نسبة
     */
    static calculateTargetPrice(
        currentPrice: number,
        percentChange: number
    ): number {
        return currentPrice * (1 + percentChange / 100);
    }

    /**
     * حساب نسبة التغير بين سعرين
     */
    static calculatePercentChange(
        oldPrice: number,
        newPrice: number
    ): number {
        if (oldPrice === 0) return 0;
        return ((newPrice - oldPrice) / oldPrice) * 100;
    }

    /**
     * تنسيق كمية العملة
     */
    static formatQuantity(
        quantity: number,
        symbol: string,
        options: {
            decimals?: number;
            showSymbol?: boolean;
        } = {}
    ): string {
        const { decimals = 8, showSymbol = true } = options;

        const formattedQuantity = quantity.toFixed(decimals).replace(/\.?0+$/, '');
        return showSymbol ? `${formattedQuantity} ${symbol}` : formattedQuantity;
    }
}