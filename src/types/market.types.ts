export type MarketType = 'crypto' | 'stocks' | 'forex' | 'commodities' | 'indices';
export type Exchange = 'binance' | 'coinbase' | 'bybit' | 'alpaca' | 'polygon' | 'yahoo';

export interface MarketSymbol {
    symbol: string;
    name: string;
    market: 'crypto' | 'stocks';
    currency?: string;
    exchange?: string;
    type?: string;
}

// export interface MarketData {
//     symbol: string;
//     market: MarketType;
//     exchange: Exchange;

//     // Price data
//     price: number;
//     open: number;
//     high: number;
//     low: number;
//     close: number;
//     previousClose?: number;

//     // Volume
//     volume: number;
//     quoteVolume?: number;

//     // Changes
//     change: number;
//     changePercent: number;

//     // Order book
//     bid?: number;
//     ask?: number;
//     spread?: number;

//     // Market depth
//     bids?: Array<[number, number]>;
//     asks?: Array<[number, number]>;

//     // Time
//     timestamp: string;
//     interval?: string;
// }

export interface MarketData {
    symbol: string;
    price: number;
    change: number;
    change_percent: number;
    volume: number;
    market_cap?: number;
    high_24h?: number;
    low_24h?: number;
    open?: number;
    previous_close?: number;
    timestamp: string;
}

export interface MarketSummary {
    total_market_cap: number;
    total_volume_24h: number;
    market_cap_change_24h: number;
    active_symbols: number;
    top_gainers: MarketData[];
    top_losers: MarketData[];
}

export interface PriceUpdate {
    symbol: string;
    price: number;
    change: number;
    change_percent: number;
    volume: number;
    timestamp: string;
}

export interface HistoricalData {
    symbol: string;
    timeframe: string;
    data: Array<{
        timestamp: string;
        open: number;
        high: number;
        low: number;
        close: number;
        volume: number;
    }>;
}

export interface OrderBook {
    symbol: string;
    bids: Array<[number, number]>;
    asks: Array<[number, number]>;
    timestamp: string;
}


// export interface MarketSummary {
//     totalMarketCap: number;
//     totalVolume24h: number;
//     activeMarkets: number;
//     marketDominance: Record<string, number>; // BTC: 40%, ETH: 20%, etc

//     // Indices
//     fearAndGreedIndex?: number;
//     volatilityIndex?: number;

//     // Performance
//     topGainers: MarketData[];
//     topLosers: MarketData[];
//     mostActive: MarketData[];

//     // Market sentiment
//     sentiment: 'bullish' | 'bearish' | 'neutral';
//     sentimentScore: number; // -100 to 100

//     // Time
//     lastUpdated: string;
// }

// export interface PriceUpdate {
//     symbol: string;
//     price: number;
//     change: number;
//     changePercent: number;
//     volume: number;
//     timestamp: string;
//     market: MarketType;
//     exchange: Exchange;

//     // Additional data
//     bid?: number;
//     ask?: number;
//     spread?: number;
//     high24h?: number;
//     low24h?: number;
// }


// export type MarketType = 'crypto' | 'stocks' | 'forex' | 'commodities';

// export interface MarketSymbol {
//     symbol: string;
//     name: string;
//     market: MarketType;
//     baseAsset?: string;
//     quoteAsset?: string;
//     exchange?: string;
//     description?: string;
//     isActive: boolean;
//     precision: {
//         price: number;
//         quantity: number;
//     };
// }

// export interface MarketData {
//     symbol: string;
//     price: number;
//     change: number;
//     changePercent: number;
//     volume: number;
//     high: number;
//     low: number;
//     open: number;
//     close: number;
//     lastUpdate: string;
//     marketCap?: number;
//     circulatingSupply?: number;
// }

// export interface MarketSummary {
//     totalMarketCap: number;
//     totalVolume24h: number;
//     btcDominance: number;
//     fearAndGreedIndex: number;
//     topGainers: MarketData[];
//     topLosers: MarketData[];
//     mostActive: MarketData[];
// }

// export interface PriceUpdate {
//     symbol: string;
//     price: number;
//     change: number;
//     changePercent: number;
//     volume: number;
//     timestamp: string;
// }