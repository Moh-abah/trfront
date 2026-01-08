// services/api/chart.service.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://62.169.17.101:8017';

export const chartService = {
    async getHistoricalData(market: 'crypto' | 'stocks', symbol: string, timeframe: string) {
        const response = await fetch(
            `${API_BASE_URL}/api/v1/market/historical/${market}/${symbol}?timeframe=${timeframe}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch historical data: ${response.statusText}`);
        }

        return response.json();
    },

    async getStockChart(symbol: string, timeframe: string) {
        const response = await fetch(
            `${API_BASE_URL}/api/v1/stocks/stocks/chart/${symbol}?timeframe=${timeframe}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch stock chart: ${response.statusText}`);
        }

        return response.json();
    },

    async getCurrentPrice(market: 'crypto' | 'stocks', symbol: string) {
        const response = await fetch(
            `${API_BASE_URL}/api/v1/market/price/${market}/${symbol}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch current price: ${response.statusText}`);
        }

        return response.json();
    },

    async getCompanyProfile(symbol: string) {
        const response = await fetch(
            `${API_BASE_URL}/api/v1/stocks/stocks/company/${symbol}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch company profile: ${response.statusText}`);
        }

        return response.json();
    },

    async getTechnicalAnalysis(symbol: string) {
        const response = await fetch(
            `${API_BASE_URL}/api/v1/stocks/stocks/analysis/${symbol}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch technical analysis: ${response.statusText}`);
        }

        return response.json();
    }
};