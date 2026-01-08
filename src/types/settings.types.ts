// types/settings.types.ts
export interface Watchlist {
    id: string;
    name: string;
    description?: string;
    symbols: string[];
    market?: 'crypto' | 'stocks';
    createdAt: string;
    updatedAt: string;
    isDefault?: boolean;
}

export interface FilterPreset {
    id: string;
    name: string;
    description?: string;
    criteria: any;
    market: 'crypto' | 'stocks';
    createdAt: string;
    updatedAt: string;
}

export interface AlertSettings {
    priceAlerts: PriceAlert[];
    indicatorAlerts: IndicatorAlert[];
    volumeAlerts: VolumeAlert[];
    patternAlerts: PatternAlert[];
}

export interface PriceAlert {
    id: string;
    symbol: string;
    condition: 'above' | 'below' | 'equals';
    price: number;
    active: boolean;
    triggered: boolean;
}

export interface IndicatorAlert {
    id: string;
    symbol: string;
    indicator: string;
    condition: string;
    value: number;
    active: boolean;
}

export interface VolumeAlert {
    id: string;
    symbol: string;
    volume: number;
    active: boolean;
}

export interface PatternAlert {
    id: string;
    symbol: string;
    pattern: string;
    active: boolean;
}

export interface PortfolioItem {
    id: string;
    symbol: string;
    quantity: number;
    avgPrice: number;
    currentPrice?: number;
    marketValue?: number;
    profitLoss?: number;
    profitLossPercent?: number;
}

export interface Settings {
    theme: 'light' | 'dark';
    language: string;
    timezone: string;
    currency: string;
    notifications: {
        email: boolean;
        push: boolean;
        sound: boolean;
        priceAlerts: boolean;
        indicatorAlerts: boolean;
    };
    chart: {
        defaultTimeframe: string;
        defaultIndicators: string[];
        candleStyle: 'candlestick' | 'line' | 'area' | 'bars';
        gridLines: boolean;
        crosshair: boolean;
        priceScale: 'linear' | 'log';
        timeScale: 'regular' | 'log';
    };
    trading: {
        defaultOrderSize: number;
        defaultStopLoss: number;
        defaultTakeProfit: number;
        confirmOrders: boolean;
        showOrderPreview: boolean;
    };
}