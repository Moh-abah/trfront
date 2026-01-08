// src/services/api/market.service.ts
import { axiosClient } from './http/axios.client';
import { apiConfig } from '@/config/api.config';
import { MarketSymbol, MarketData, MarketSummary, PriceUpdate } from '@/types/market.types';

export const marketService = {


    // في market.service.ts
    // src/services/api/market.service.ts

    async getSymbols(market: 'crypto' | 'stocks' = 'crypto'): Promise<MarketSymbol[]> {
        try {
            const endpoint = '/api/v1/symbols'; // مباشر وبسيط

            console.log(`🌐 [API] Fetching symbols from: ${endpoint}?market=${market}`);

            const response = await axiosClient.get(endpoint, {
                params: { market },
                timeout: 10000
            });

            console.log('🔍 FULL RESPONSE:', response); // للتصحيح

            // ✅ معالجة متعددة المستويات للاستجابة
            const data = response?.data || response; // إذا كان الـ data موجود

            if (data?.symbols && Array.isArray(data.symbols)) {
                console.log(`✅ SUCCESS: Found ${data.symbols.length} symbols`);
                return data.symbols.map((symbol: string) => ({
                    symbol,
                    name: symbol,
                    market,
                    type: market
                }));
            }

            if (Array.isArray(data)) {
                console.log(`✅ SUCCESS: Array response with ${data.length} items`);
                return data;
            }

            if (Array.isArray(response)) { // إذا كان الـ response نفسه هو المصفوفة
                console.log(`✅ SUCCESS: Direct array response`);
                return response;
            }

            console.error('❌ INVALID RESPONSE STRUCTURE:', data);
            return []; // إرجاع مصفوفة فارغة بدلاً من خطأ

        } catch (error: any) {
            console.error(`❌ [API ERROR]: ${error.message}`);
            return []; // إرجاع مصفوفة فارغة عند الخطأ
        }
    },

    // Get live price
    async getLivePrice(market: string, symbol: string): Promise<MarketData> {
        return axiosClient.get(apiConfig.endpoints.market.unified.price, {
            urlParams: { market, symbol }
        });
    },

    

    // Get historical data
    async getHistoricalData(
        market: string,
        symbol: string,
        timeframe: string,
        days: number = 30
    ): Promise<MarketData[]> {
        return axiosClient.get(apiConfig.endpoints.market.unified.historical, {
            urlParams: { market, symbol },
            params: { timeframe, days }
        });
    },

    // Get market summary
    async getMarketSummary(): Promise<MarketSummary> {
        return axiosClient.get(apiConfig.endpoints.market.unified.summary);
    },


    getMarketSummarys: async (marketType: 'stocks' | 'crypto' = 'stocks') => {
        try {
            let endpoint;
            if (marketType === 'stocks') {
                endpoint = '/api/v1/stocks/stocks/market/summary';
            } else {
                endpoint = '/api/v1/crypto/market/summary'; // إذا كان لديك endpoint للكريبتو
            }

            const response = await axiosClient.get(endpoint);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch market summary:', error);
            throw error;
        }
    },

    // Search symbols
    async searchSymbols(query: string, market?: string): Promise<MarketSymbol[]> {
        if (market === 'stocks') {
            return axiosClient.get(apiConfig.endpoints.market.stocks.search, {
                params: { query }
            });
        }

        // For other markets, filter locally from getSymbols
        const symbols = await this.getSymbols(market as any);
        return symbols.filter(symbol =>
            symbol.symbol.toLowerCase().includes(query.toLowerCase()) ||
            symbol.name.toLowerCase().includes(query.toLowerCase())
        );
    },

    // Get top movers
    async getTopMovers(market: string = 'stocks'): Promise<MarketData[]> {
        if (market === 'stocks') {
            return axiosClient.get(apiConfig.endpoints.market.stocks.topMovers);
        }

        // For crypto, we need to implement or use different endpoint
        throw new Error(`Top movers not implemented for market: ${market}`);
    },

    // Get company info (stocks only)
    async getCompanyInfo(symbol: string): Promise<any> {
        return axiosClient.get(apiConfig.endpoints.market.stocks.company, {
            urlParams: { symbol }
        });
    },

    // Get sectors (stocks only)
    async getSectors(): Promise<any[]> {
        return axiosClient.get(apiConfig.endpoints.market.stocks.sectors);
    },

    // Get order book (crypto only)
    async getOrderBook(market: string, symbol: string): Promise<any> {
        if (market === 'crypto') {
            return axiosClient.get(apiConfig.endpoints.market.crypto.orderbook, {
                urlParams: { symbol }
            });
        }
        throw new Error(`Order book not available for market: ${market}`);
    },

    // Get recent trades
    async getRecentTrades(market: string, symbol: string, limit: number = 50): Promise<any[]> {
        if (market === 'crypto') {
            return axiosClient.get(apiConfig.endpoints.market.crypto.trades, {
                urlParams: { symbol },
                params: { limit }
            });
        }
        throw new Error(`Recent trades not available for market: ${market}`);
    },

    // Batch get prices
    async batchGetPrices(symbols: Array<{ market: string, symbol: string }>): Promise<PriceUpdate[]> {
        // You might need to implement batch endpoint on backend
        // For now, we'll do parallel requests
        const promises = symbols.map(({ market, symbol }) =>
            this.getLivePrice(market, symbol).catch(() => null)
        );

        const results = await Promise.all(promises);
        return results.filter(Boolean) as PriceUpdate[];
    },

    // Get chart data
    async getChart(
        symbol: string,
        timeframe: string,
        market: 'crypto' | 'stocks' = 'crypto',
        days: number = 30
    ): Promise<any[]> {
        try {
            return await axiosClient.get(apiConfig.endpoints.market.unified.historical, {
                urlParams: { market, symbol },
                params: { timeframe, days }
            });
        } catch (err) {
            throw new Error(`Failed to load chart data for ${symbol} (${market}): ${err}`);
        }
    },



    // // Stream live data
    // async startLiveStream(
    //     symbols: Array<{ market: string, symbol: string }>,
    //     timeframe?: string
    // ): Promise<{ stream_id: string; url: string }> {
    //     return axiosClient.post('/ws/stream/start', {
    //         symbols: symbols.map(s => `${s.market}:${s.symbol}`),
    //         timeframe
    //     });
    // },

    // Stream live data (returns stream ID)
    async startLiveStream(
        symbols: Array<{ market: string, symbol: string }>,
        timeframe?: string
    ): Promise<{ stream_id: string; url: string }> {
        return axiosClient.startWebSocketStream({
            type: 'market',
            symbols: symbols.map(s => `${s.market}:${s.symbol}`),
            timeframe
        });
    },
};