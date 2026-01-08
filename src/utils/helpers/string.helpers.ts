export const cn = (...classes: Array<string | boolean | undefined | null>): string => {
    return classes.filter(Boolean).join(' ');
};

export const formatCurrency = (
    value: number,
    currency: string = 'USD',
    options?: Intl.NumberFormatOptions
): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        ...options
    }).format(value);
};

export const formatNumber = (
    value: number,
    options?: Intl.NumberFormatOptions
): string => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        ...options
    }).format(value);
};

export const formatPercentage = (
    value: number,
    decimalPlaces: number = 2
): string => {
    return `${value.toFixed(decimalPlaces)}%`;
};

export const formatLargeNumber = (value: number): string => {
    if (value >= 1e9) {
        return `${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
        return `${(value / 1e6).toFixed(2)}M`;
    } else if (value >= 1e3) {
        return `${(value / 1e3).toFixed(2)}K`;
    }
    return value.toFixed(2);
};

export const truncateString = (
    str: string,
    maxLength: number = 50,
    suffix: string = '...'
): string => {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - suffix.length) + suffix;
};

export const camelToTitle = (str: string): string => {
    return str
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (s) => s.toUpperCase())
        .trim();
};

export const snakeToTitle = (str: string): string => {
    return str
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export const kebabToTitle = (str: string): string => {
    return str
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export const generateId = (prefix: string = 'id'): string => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const escapeRegExp = (str: string): string => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const pluralize = (
    count: number,
    singular: string,
    plural?: string
): string => {
    if (count === 1) return singular;
    return plural || singular + 's';
};

export const capitalize = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};