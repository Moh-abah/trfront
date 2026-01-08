
import { apiConfig } from '@/config/api.config';
import { axiosClient } from './http/axios.client';

export interface TradingSignal {
    id: string;
    symbol: string;
    type: 'buy' | 'sell' | 'neutral';
    strength: 'strong' | 'moderate' | 'weak';
    price: number;
    target?: number;
    stopLoss?: number;
    strategy: string;
    timestamp: string;
    timeframe: string;
    market: string;
    indicators: any[];
    profitLoss?: number;
    status: 'active' | 'expired' | 'executed';
    read: boolean;
    metadata?: Record<string, any>;
}

export interface SignalRequest {
    symbol: string;
    timeframe: string;
    market?: string;
    indicators: Array<{
        name: string;
        params?: Record<string, any>;
        enabled?: boolean;
    }>;
    days?: number;
}

export interface SignalStats {
    total: number;
    buy: number;
    sell: number;
    active: number;
    winRate: number;
    totalProfit: number;
    bySymbol: Record<string, number>;
    byStrategy: Record<string, number>;
}

class SignalsService {
    private baseUrl = apiConfig.baseURL;

    // 1. ✅ **نقطة النهاية الحقيقية:** POST /api/v1/indicators/signals
    async getSignals(request: SignalRequest): Promise<TradingSignal[]> {
        try {
            const response = await axiosClient.post(
                `${this.baseUrl}/api/v1/indicators/signals`,
                request
            );

            // تحويل البيانات من الباك اند إلى تنسيق Frontend
            if (response.data && response.data.signals) {
                return response.data.signals.map((signal: any) => ({
                    id: signal.id || `signal_${Date.now()}_${Math.random()}`,
                    symbol: signal.symbol || request.symbol,
                    type: this.mapSignalType(signal.signal || signal.type || 'neutral'),
                    strength: this.calculateSignalStrength(signal),
                    price: signal.price || signal.current_price || 0,
                    target: signal.target_price,
                    stopLoss: signal.stop_loss,
                    strategy: signal.strategy || 'Indicator Based',
                    timestamp: signal.timestamp || new Date().toISOString(),
                    timeframe: request.timeframe,
                    market: request.market || 'crypto',
                    indicators: request.indicators,
                    profitLoss: signal.profit_loss,
                    status: signal.status || 'active',
                    read: false,
                    metadata: signal
                }));
            }
            return [];
        } catch (error) {
            console.error('Error fetching signals:', error);
            return [];
        }
    }

    // 2. ✅ **نقطة النهاية الحقيقية:** POST /api/v1/indicators/apply
    async applyIndicators(data: {
        symbol: string;
        timeframe: string;
        market: string;
        indicators: Array<{ name: string; params?: any }>;
        days: number;
    }): Promise<any> {
        try {
            const response = await axiosClient.post(
                `${this.baseUrl}/api/v1/indicators/apply`,
                data
            );
            return response.data;
        } catch (error) {
            console.error('Error applying indicators:', error);
            return null;
        }
    }

    // 3. ✅ **نقطة النهاية الحقيقية:** GET /api/v1/indicators/available
    async getAvailableIndicators(category?: string): Promise<any[]> {
        try {
            const url = category
                ? `${this.baseUrl}/api/v1/indicators/available?category=${category}`
                : `${this.baseUrl}/api/v1/indicators/available`;

            const response = await axiosClient.get(url);
            return response.data.indicators || [];
        } catch (error) {
            console.error('Error fetching indicators:', error);
            return [];
        }
    }

    // 4. ✅ **نقطة النهاية الحقيقية:** GET /api/v1/indicators/{indicator_name}/params
    async getIndicatorParams(indicatorName: string): Promise<any> {
        try {
            const response = await axiosClient.get(
                `${this.baseUrl}/api/v1/indicators/${indicatorName}/params`
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching indicator params:', error);
            return null;
        }
    }

    // 5. ✅ **نقطة النهاية الحقيقية:** POST /api/v1/backtest/run
    async backtestSignals(config: any): Promise<any> {
        try {
            const response = await axiosClient.post(
                `${this.baseUrl}/api/v1/backtest/run`,
                config
            );
            return response.data;
        } catch (error) {
            console.error('Error running backtest:', error);
            return null;
        }
    }

    // 6. ✅ **نقطة النهاية الحقيقية:** GET /api/v1/market/historical/{market}/{symbol}
    async getHistoricalData(symbol: string, market: string = 'crypto', days: number = 30) {
        try {
            const response = await axiosClient.get(
                `${this.baseUrl}/api/v1/market/historical/${market}/${symbol}?days=${days}`
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching historical data:', error);
            return null;
        }
    }

    // Helper functions
    private mapSignalType(signal: number | string): 'buy' | 'sell' | 'neutral' {
        if (typeof signal === 'number') {
            if (signal > 0) return 'buy';
            if (signal < 0) return 'sell';
            return 'neutral';
        }

        const lower = signal.toLowerCase();
        if (lower.includes('buy') || lower.includes('long')) return 'buy';
        if (lower.includes('sell') || lower.includes('short')) return 'sell';
        return 'neutral';
    }

    private calculateSignalStrength(signalData: any): 'strong' | 'moderate' | 'weak' {
        // تحسب القوة بناءً على المؤشرات
        if (!signalData.indicators) return 'moderate';

        const strengths = {
            strong: ['rsi', 'macd', 'stochastic'],
            moderate: ['sma', 'ema', 'bb'],
            weak: ['atr', 'volume']
        };

        const indicatorNames = signalData.indicators.map((i: any) => i.name.toLowerCase());

        if (strengths.strong.some(ind => indicatorNames.includes(ind))) {
            return 'strong';
        } else if (strengths.moderate.some(ind => indicatorNames.includes(ind))) {
            return 'moderate';
        }
        return 'weak';
    }

    // إحصائيات محلية (لأنه ليس لدينا نقطة نهاية خاصة بالإحصائيات)
    async getSignalStats(signals: TradingSignal[]): Promise<SignalStats> {
        const buy = signals.filter(s => s.type === 'buy').length;
        const sell = signals.filter(s => s.type === 'sell').length;
        const active = signals.filter(s => s.status === 'active').length;
        const winRate = signals.length > 0 ?
            (signals.filter(s => (s.profitLoss || 0) > 0).length / signals.length) * 100 : 0;

        const bySymbol: Record<string, number> = {};
        const byStrategy: Record<string, number> = {};

        signals.forEach(s => {
            bySymbol[s.symbol] = (bySymbol[s.symbol] || 0) + 1;
            byStrategy[s.strategy] = (byStrategy[s.strategy] || 0) + 1;
        });

        return {
            total: signals.length,
            buy,
            sell,
            active,
            winRate,
            totalProfit: signals.reduce((sum, s) => sum + (s.profitLoss || 0), 0),
            bySymbol,
            byStrategy,
        };
    }
}

export const signalsService = new SignalsService();