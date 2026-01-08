/**
 * ثوابت الأسواق
 */

export interface MarketSymbol {
    symbol: string;
    name: string;
    base: string;
    quote: string;
    type: 'crypto' | 'stock' | 'forex' | 'commodity';
    exchange?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    tickSize?: number;
    minQty?: number;
    maxQty?: number;
    stepSize?: number;
    status: 'active' | 'inactive' | 'delisted';
}

export interface MarketCategory {
    id: string;
    name: string;
    description: string;
    symbols: string[];
}

export const MARKET_TYPES = {
    CRYPTO: 'crypto',
    STOCKS: 'stocks',
    FOREX: 'forex',
    COMMODITIES: 'commodities',
    INDICES: 'indices'
} as const;

export type MarketType = typeof MARKET_TYPES[keyof typeof MARKET_TYPES];

export const CRYPTO_SYMBOLS: MarketSymbol[] = [
    {
        symbol: 'BTCUSDT',
        name: 'Bitcoin',
        base: 'BTC',
        quote: 'USDT',
        type: 'crypto',
        category: 'large-cap',
        tickSize: 0.01,
        minQty: 0.00001,
        stepSize: 0.00001,
        status: 'active'
    },
    {
        symbol: 'ETHUSDT',
        name: 'Ethereum',
        base: 'ETH',
        quote: 'USDT',
        type: 'crypto',
        category: 'large-cap',
        tickSize: 0.01,
        minQty: 0.001,
        stepSize: 0.001,
        status: 'active'
    },
    {
        symbol: 'BNBUSDT',
        name: 'Binance Coin',
        base: 'BNB',
        quote: 'USDT',
        type: 'crypto',
        category: 'large-cap',
        tickSize: 0.01,
        minQty: 0.01,
        stepSize: 0.01,
        status: 'active'
    },
    {
        symbol: 'SOLUSDT',
        name: 'Solana',
        base: 'SOL',
        quote: 'USDT',
        type: 'crypto',
        category: 'large-cap',
        tickSize: 0.01,
        minQty: 0.01,
        stepSize: 0.01,
        status: 'active'
    },
    {
        symbol: 'XRPUSDT',
        name: 'Ripple',
        base: 'XRP',
        quote: 'USDT',
        type: 'crypto',
        category: 'large-cap',
        tickSize: 0.0001,
        minQty: 1,
        stepSize: 1,
        status: 'active'
    },
    {
        symbol: 'ADAUSDT',
        name: 'Cardano',
        base: 'ADA',
        quote: 'USDT',
        type: 'crypto',
        category: 'mid-cap',
        tickSize: 0.0001,
        minQty: 1,
        stepSize: 1,
        status: 'active'
    },
    {
        symbol: 'AVAXUSDT',
        name: 'Avalanche',
        base: 'AVAX',
        quote: 'USDT',
        type: 'crypto',
        category: 'mid-cap',
        tickSize: 0.01,
        minQty: 0.01,
        stepSize: 0.01,
        status: 'active'
    },
    {
        symbol: 'DOTUSDT',
        name: 'Polkadot',
        base: 'DOT',
        quote: 'USDT',
        type: 'crypto',
        category: 'mid-cap',
        tickSize: 0.01,
        minQty: 0.01,
        stepSize: 0.01,
        status: 'active'
    },
    {
        symbol: 'DOGEUSDT',
        name: 'Dogecoin',
        base: 'DOGE',
        quote: 'USDT',
        type: 'crypto',
        category: 'meme',
        tickSize: 0.000001,
        minQty: 1,
        stepSize: 1,
        status: 'active'
    },
    {
        symbol: 'MATICUSDT',
        name: 'Polygon',
        base: 'MATIC',
        quote: 'USDT',
        type: 'crypto',
        category: 'layer2',
        tickSize: 0.0001,
        minQty: 1,
        stepSize: 1,
        status: 'active'
    }
];

export const STOCK_SYMBOLS: MarketSymbol[] = [
    {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        base: 'AAPL',
        quote: 'USD',
        type: 'stock',
        exchange: 'NASDAQ',
        category: 'technology',
        tickSize: 0.01,
        minQty: 1,
        stepSize: 1,
        status: 'active'
    },
    {
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        base: 'MSFT',
        quote: 'USD',
        type: 'stock',
        exchange: 'NASDAQ',
        category: 'technology',
        tickSize: 0.01,
        minQty: 1,
        stepSize: 1,
        status: 'active'
    },
    {
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        base: 'GOOGL',
        quote: 'USD',
        type: 'stock',
        exchange: 'NASDAQ',
        category: 'technology',
        tickSize: 0.01,
        minQty: 1,
        stepSize: 1,
        status: 'active'
    },
    {
        symbol: 'AMZN',
        name: 'Amazon.com Inc.',
        base: 'AMZN',
        quote: 'USD',
        type: 'stock',
        exchange: 'NASDAQ',
        category: 'consumer',
        tickSize: 0.01,
        minQty: 1,
        stepSize: 1,
        status: 'active'
    },
    {
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        base: 'TSLA',
        quote: 'USD',
        type: 'stock',
        exchange: 'NASDAQ',
        category: 'automotive',
        tickSize: 0.01,
        minQty: 1,
        stepSize: 1,
        status: 'active'
    },
    {
        symbol: 'NVDA',
        name: 'NVIDIA Corporation',
        base: 'NVDA',
        quote: 'USD',
        type: 'stock',
        exchange: 'NASDAQ',
        category: 'technology',
        tickSize: 0.01,
        minQty: 1,
        stepSize: 1,
        status: 'active'
    },
    {
        symbol: 'META',
        name: 'Meta Platforms Inc.',
        base: 'META',
        quote: 'USD',
        type: 'stock',
        exchange: 'NASDAQ',
        category: 'technology',
        tickSize: 0.01,
        minQty: 1,
        stepSize: 1,
        status: 'active'
    },
    {
        symbol: 'JPM',
        name: 'JPMorgan Chase & Co.',
        base: 'JPM',
        quote: 'USD',
        type: 'stock',
        exchange: 'NYSE',
        category: 'financial',
        tickSize: 0.01,
        minQty: 1,
        stepSize: 1,
        status: 'active'
    },
    {
        symbol: 'V',
        name: 'Visa Inc.',
        base: 'V',
        quote: 'USD',
        type: 'stock',
        exchange: 'NYSE',
        category: 'financial',
        tickSize: 0.01,
        minQty: 1,
        stepSize: 1,
        status: 'active'
    },
    {
        symbol: 'JNJ',
        name: 'Johnson & Johnson',
        base: 'JNJ',
        quote: 'USD',
        type: 'stock',
        exchange: 'NYSE',
        category: 'healthcare',
        tickSize: 0.01,
        minQty: 1,
        stepSize: 1,
        status: 'active'
    }
];

export const MARKET_CATEGORIES: MarketCategory[] = [
    {
        id: 'large-cap-crypto',
        name: 'Large Cap Crypto',
        description: 'Cryptocurrencies with large market capitalization',
        symbols: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT']
    },
    {
        id: 'mid-cap-crypto',
        name: 'Mid Cap Crypto',
        description: 'Cryptocurrencies with medium market capitalization',
        symbols: ['ADAUSDT', 'AVAXUSDT', 'DOTUSDT', 'MATICUSDT']
    },
    {
        id: 'tech-stocks',
        name: 'Technology Stocks',
        description: 'Technology companies stocks',
        symbols: ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'META']
    },
    {
        id: 'blue-chip',
        name: 'Blue Chip Stocks',
        description: 'Large, established companies',
        symbols: ['JPM', 'V', 'JNJ', 'AMZN']
    },
    {
        id: 'high-volume',
        name: 'High Volume',
        description: 'Assets with high trading volume',
        symbols: ['BTCUSDT', 'ETHUSDT', 'AAPL', 'MSFT']
    }
];

export const MARKET_HOURS = {
    CRYPTO: {
        open: '00:00',
        close: '23:59',
        timezone: 'UTC',
        tradingDays: [0, 1, 2, 3, 4, 5, 6] // كل أيام الأسبوع
    },
    STOCKS: {
        open: '09:30',
        close: '16:00',
        timezone: 'America/New_York',
        tradingDays: [1, 2, 3, 4, 5] // الاثنين إلى الجمعة
    }
} as const;

export const MARKET_STATUS = {
    PRE_MARKET: 'pre_market',
    REGULAR: 'regular',
    POST_MARKET: 'post_market',
    CLOSED: 'closed',
    HOLIDAY: 'holiday'
} as const;

export type MarketStatus = typeof MARKET_STATUS[keyof typeof MARKET_STATUS];

export const EXCHANGES = {
    BINANCE: 'binance',
    COINBASE: 'coinbase',
    KRAKEN: 'kraken',
    BYBIT: 'bybit',
    NASDAQ: 'nasdaq',
    NYSE: 'nyse'
} as const;

export type Exchange = typeof EXCHANGES[keyof typeof EXCHANGES];

export const MARKET_CONFIG = {
    MAX_SYMBOLS_PER_REQUEST: 100,
    DEFAULT_REFRESH_INTERVAL: 5000, // 5 ثواني
    CACHE_DURATION: 60000, // دقيقة واحدة
    MAX_HISTORICAL_DAYS: 365 * 5, // 5 سنوات
    DEFAULT_TIMEZONE: 'UTC'
} as const;

export const PRICE_ALERT_TYPES = {
    ABOVE: 'above',
    BELOW: 'below',
    CROSSES_ABOVE: 'crosses_above',
    CROSSES_BELOW: 'crosses_below',
    PERCENT_CHANGE: 'percent_change'
} as const;

export type PriceAlertType = typeof PRICE_ALERT_TYPES[keyof typeof PRICE_ALERT_TYPES];

/**
 * الحصول على معلومات الرمز
 */
export function getSymbolInfo(symbol: string): MarketSymbol | undefined {
    const allSymbols = [...CRYPTO_SYMBOLS, ...STOCK_SYMBOLS];
    return allSymbols.find(s => s.symbol === symbol);
}

/**
 * الحصول على رموز السوق حسب النوع
 */
export function getSymbolsByMarket(market: MarketType): MarketSymbol[] {
    switch (market) {
        case 'crypto':
            return CRYPTO_SYMBOLS;
        case 'stocks':
            return STOCK_SYMBOLS;
        default:
            return [];
    }
}

/**
 * الحصول على رموز السوق حسب الفئة
 */
export function getSymbolsByCategory(categoryId: string): MarketSymbol[] {
    const category = MARKET_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return [];

    const allSymbols = [...CRYPTO_SYMBOLS, ...STOCK_SYMBOLS];
    return allSymbols.filter(s => category.symbols.includes(s.symbol));
}

/**
 * التحقق إذا كان الرمز نشطًا
 */
export function isSymbolActive(symbol: string): boolean {
    const info = getSymbolInfo(symbol);
    return info?.status === 'active' || false;
}

/**
 * الحصول على أوقات التداول للسوق
 */
export function getMarketTradingHours(market: MarketType) {
    return MARKET_HOURS[market.toUpperCase() as keyof typeof MARKET_HOURS] || MARKET_HOURS.CRYPTO;
}

/**
 * الحصول على حالة السوق الحالية
 */
export function getMarketStatus(market: MarketType): MarketStatus {
    const hours = getMarketTradingHours(market);
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false });

    if (market === 'crypto') {
        return MARKET_STATUS.REGULAR;
    }

    // بالنسبة للأسهم، تحقق من أوقات التداول
    if (currentTime < hours.open) {
        return MARKET_STATUS.PRE_MARKET;
    } else if (currentTime > hours.close) {
        return MARKET_STATUS.POST_MARKET;
    } else {
        return MARKET_STATUS.REGULAR;
    }
}

/**
 * الحصول على القيمة الدنيا للطلب
 */
export function getMinimumOrderSize(symbol: string): number {
    const info = getSymbolInfo(symbol);
    return info?.minQty || 0.01;
}

/**
 * الحصول على حجم الخطوة
 */
export function getStepSize(symbol: string): number {
    const info = getSymbolInfo(symbol);
    return info?.stepSize || 0.01;
}

/**
 * الحصول على حجم التجزئة
 */
export function getTickSize(symbol: string): number {
    const info = getSymbolInfo(symbol);
    return info?.tickSize || 0.01;
}

/**
 * تقريب الكمية حسب حجم الخطوة
 */
export function roundQuantity(symbol: string, quantity: number): number {
    const stepSize = getStepSize(symbol);
    if (stepSize === 0) return quantity;

    const precision = Math.max(0, Math.ceil(-Math.log10(stepSize)));
    const multiplier = Math.pow(10, precision);

    return Math.round(quantity * multiplier) / multiplier;
}

/**
 * تقريب السعر حسب حجم التجزئة
 */
export function roundPrice(symbol: string, price: number): number {
    const tickSize = getTickSize(symbol);
    if (tickSize === 0) return price;

    const precision = Math.max(0, Math.ceil(-Math.log10(tickSize)));
    const multiplier = Math.pow(10, precision);

    return Math.round(price * multiplier) / multiplier;
}

/**
 * حساب قيمة التداول
 */
export function calculateTradeValue(
    symbol: string,
    price: number,
    quantity: number
): number {
    const roundedQuantity = roundQuantity(symbol, quantity);
    const roundedPrice = roundPrice(symbol, price);

    return roundedPrice * roundedQuantity;
}

/**
 * التحقق من صحة الكمية
 */
export function validateQuantity(
    symbol: string,
    quantity: number
): { valid: boolean; message?: string } {
    const info = getSymbolInfo(symbol);
    if (!info) {
        return { valid: false, message: 'Symbol not found' };
    }

    if (quantity <= 0) {
        return { valid: false, message: 'Quantity must be positive' };
    }

    if (info.minQty && quantity < info.minQty) {
        return { valid: false, message: `Minimum quantity is ${info.minQty}` };
    }

    if (info.maxQty && quantity > info.maxQty) {
        return { valid: false, message: `Maximum quantity is ${info.maxQty}` };
    }

    // التحقق من مضاعفات حجم الخطوة
    const stepSize = info.stepSize || 0.01;
    if (stepSize > 0) {
        const remainder = (quantity / stepSize) % 1;
        if (Math.abs(remainder) > 0.000001 && Math.abs(remainder - 1) > 0.000001) {
            return { valid: false, message: `Quantity must be a multiple of ${stepSize}` };
        }
    }

    return { valid: true };
}

/**
 * التحقق من صحة السعر
 */
export function validatePrice(
    symbol: string,
    price: number
): { valid: boolean; message?: string } {
    const info = getSymbolInfo(symbol);
    if (!info) {
        return { valid: false, message: 'Symbol not found' };
    }

    if (price <= 0) {
        return { valid: false, message: 'Price must be positive' };
    }

    if (info.minPrice && price < info.minPrice) {
        return { valid: false, message: `Minimum price is ${info.minPrice}` };
    }

    if (info.maxPrice && price > info.maxPrice) {
        return { valid: false, message: `Maximum price is ${info.maxPrice}` };
    }

    // التحقق من مضاعفات حجم التجزئة
    const tickSize = info.tickSize || 0.01;
    if (tickSize > 0) {
        const remainder = (price / tickSize) % 1;
        if (Math.abs(remainder) > 0.000001 && Math.abs(remainder - 1) > 0.000001) {
            return { valid: false, message: `Price must be a multiple of ${tickSize}` };
        }
    }

    return { valid: true };
}