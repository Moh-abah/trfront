export interface BacktestConfig {
    id?: string;
    name?: string;
    symbol: string;
    timeframe: string;
    market: 'crypto' | 'stocks';
    exchange?: string;

    // Strategy
    strategyId: string;
    strategyName: string;
    strategyConfig: any;

    // Date range
    startDate: string;
    endDate: string;

    // Capital and fees
    initialCapital: number;
    commission: number;
    slippage: number;

    // Risk settings
    stopLoss?: number;
    takeProfit?: number;
    positionSize?: number;

    // Filters
    filters?: any;

    // Advanced settings
    walkForward?: {
        enabled: boolean;
        windowSize: string;
        stepSize: string;
    };

    monteCarlo?: {
        enabled: boolean;
        iterations: number;
        confidenceLevel: number;
    };

    // Metadata
    tags?: string[];
    notes?: string;
}

export interface BacktestResult {
    id: string;
    config: BacktestConfig;

    // Performance metrics
    performance: {
        totalReturn: number;
        annualizedReturn: number;
        sharpeRatio: number;
        sortinoRatio: number;
        maxDrawdown: number;
        calmarRatio: number;
        profitFactor: number;
        expectancy: number;
        avgWin: number;
        avgLoss: number;
        avgTradeDuration: string;
    };

    // Trade statistics
    trades: {
        total: number;
        winning: number;
        losing: number;
        winRate: number;
        profitLossRatio: number;
        largestWin: number;
        largestLoss: number;
        consecutiveWins: number;
        consecutiveLosses: number;
    };

    // Time analysis
    timeAnalysis: {
        startDate: string;
        endDate: string;
        duration: string;
        tradesPerDay: number;
        tradesPerMonth: number;
        activeDays: number;
    };

    // Risk metrics
    riskMetrics: {
        valueAtRisk: number;
        expectedShortfall: number;
        standardDeviation: number;
        downsideDeviation: number;
        ulcerIndex: number;
    };

    // Equity curve
    equityCurve: Array<{
        timestamp: string;
        equity: number;
        balance: number;
        drawdown: number;
    }>;

    // Trade history
    tradeHistory: Array<{
        id: string;
        symbol: string;
        side: 'buy' | 'sell';
        entryTime: string;
        exitTime: string;
        entryPrice: number;
        exitPrice: number;
        quantity: number;
        profit: number;
        profitPercent: number;
        fee: number;
        pnl: number;
        duration: string;
        strategySignal?: string;
        notes?: string;
    }>;

    // Monte Carlo results
    monteCarloResults?: {
        medianReturn: number;
        probabilityOfProfit: number;
        worstCaseReturn: number;
        bestCaseReturn: number;
        confidenceIntervals: Array<{
            confidenceLevel: number;
            lowerBound: number;
            upperBound: number;
        }>;
    };

    // Walk forward results
    walkForwardResults?: Array<{
        period: string;
        inSample: BacktestResult;
        outOfSample: BacktestResult;
        optimizationParams: Record<string, any>;
    }>;

    // Metadata
    status: 'completed' | 'running' | 'failed' | 'cancelled';
    executionTime: number;
    createdAt: string;
    updatedAt: string;
}