/**
 * أدوات حساب مقاييس الأداء والمخاطر
 */

export interface Trade {
    entryPrice: number;
    exitPrice: number;
    quantity: number;
    side: 'long' | 'short';
    entryTime: Date;
    exitTime: Date;
    profitLoss?: number;
    profitLossPercent?: number;
}

export interface PerformanceMetrics {
    // Basic Metrics
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;

    // Profit/Loss Metrics
    totalProfitLoss: number;
    totalProfitLossPercent: number;
    grossProfit: number;
    grossLoss: number;
    profitFactor: number;

    // Risk Metrics
    maxDrawdown: number;
    maxDrawdownPercent: number;
    sharpeRatio: number;
    sortinoRatio: number;
    calmarRatio: number;
    ulcerIndex: number;

    // Trade Metrics
    averageTrade: number;
    averageWin: number;
    averageLoss: number;
    largestWin: number;
    largestLoss: number;
    averageHoldTime: number; // in hours

    // Performance Metrics
    annualReturn: number;
    monthlyReturn: number;
    volatility: number;
    beta: number;
    alpha: number;

    // Ratios
    recoveryFactor: number;
    expectancy: number;
    kRatio: number;
    tailRatio: number;
}

export class MetricCalculator {
    /**
     * حساب مقاييس الأداء الكاملة
     */
    static calculatePerformanceMetrics(
        trades: Trade[],
        initialCapital: number = 10000
    ): PerformanceMetrics {
        if (trades.length === 0) {
            return this.getEmptyMetrics();
        }

        // حساب الربح/الخسارة للصفقات
        const tradesWithPL = trades.map(trade => ({
            ...trade,
            profitLoss: this.calculateTradeProfitLoss(trade),
            profitLossPercent: this.calculateTradeProfitLossPercent(trade)
        }));

        // المقاييس الأساسية
        const winningTrades = tradesWithPL.filter(t => t.profitLoss! > 0);
        const losingTrades = tradesWithPL.filter(t => t.profitLoss! < 0);
        const totalTrades = tradesWithPL.length;
        const winRate = winningTrades.length / totalTrades;

        // مقاييس الربح/الخسارة
        const totalProfitLoss = tradesWithPL.reduce((sum, t) => sum + t.profitLoss!, 0);
        const totalProfitLossPercent = (totalProfitLoss / initialCapital) * 100;
        const grossProfit = winningTrades.reduce((sum, t) => sum + t.profitLoss!, 0);
        const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.profitLoss!, 0));
        const profitFactor = grossLoss === 0 ? Infinity : grossProfit / grossLoss;

        // مقاييس الصفقات
        const averageTrade = totalProfitLoss / totalTrades;
        const averageWin = winningTrades.length > 0
            ? winningTrades.reduce((sum, t) => sum + t.profitLoss!, 0) / winningTrades.length
            : 0;
        const averageLoss = losingTrades.length > 0
            ? losingTrades.reduce((sum, t) => sum + t.profitLoss!, 0) / losingTrades.length
            : 0;
        const largestWin = winningTrades.length > 0
            ? Math.max(...winningTrades.map(t => t.profitLoss!))
            : 0;
        const largestLoss = losingTrades.length > 0
            ? Math.min(...losingTrades.map(t => t.profitLoss!))
            : 0;

        // حساب وقت الاحتفاظ
        const averageHoldTime = tradesWithPL.reduce((sum, t) => {
            const holdTime = t.exitTime.getTime() - t.entryTime.getTime();
            return sum + (holdTime / (1000 * 60 * 60)); // تحويل إلى ساعات
        }, 0) / totalTrades;

        // حساب منحنى رأس المال والـ Max Drawdown
        const equityCurve = this.calculateEquityCurve(tradesWithPL, initialCapital);
        const maxDrawdown = this.calculateMaxDrawdown(equityCurve);
        const maxDrawdownPercent = (maxDrawdown / initialCapital) * 100;

        // حساب العوائد
        const returns = this.calculateReturns(tradesWithPL, initialCapital);
        const annualReturn = this.calculateAnnualReturn(returns, tradesWithPL);
        const monthlyReturn = annualReturn / 12;

        // حساب التقلب
        const volatility = this.calculateVolatility(returns);

        // حساب نسب الأداء
        const sharpeRatio = this.calculateSharpeRatio(returns);
        const sortinoRatio = this.calculateSortinoRatio(returns);
        const calmarRatio = maxDrawdownPercent > 0 ? annualReturn / maxDrawdownPercent : 0;
        const ulcerIndex = this.calculateUlcerIndex(equityCurve);
        const recoveryFactor = maxDrawdown > 0 ? totalProfitLoss / maxDrawdown : 0;
        const expectancy = (winRate * averageWin) + ((1 - winRate) * averageLoss);
        const kRatio = this.calculateKRatio(equityCurve);
        const tailRatio = this.calculateTailRatio(returns);

        return {
            totalTrades,
            winningTrades: winningTrades.length,
            losingTrades: losingTrades.length,
            winRate,

            totalProfitLoss,
            totalProfitLossPercent,
            grossProfit,
            grossLoss,
            profitFactor,

            maxDrawdown,
            maxDrawdownPercent,
            sharpeRatio,
            sortinoRatio,
            calmarRatio,
            ulcerIndex,

            averageTrade,
            averageWin,
            averageLoss,
            largestWin,
            largestLoss,
            averageHoldTime,

            annualReturn,
            monthlyReturn,
            volatility,
            beta: 1, // سيتم حسابها لاحقًا
            alpha: 0, // سيتم حسابها لاحقًا

            recoveryFactor,
            expectancy,
            kRatio,
            tailRatio
        };
    }

    /**
     * حساب الربح/الخسارة للصفقة
     */
    static calculateTradeProfitLoss(trade: Trade): number {
        if (trade.side === 'long') {
            return (trade.exitPrice - trade.entryPrice) * trade.quantity;
        } else {
            return (trade.entryPrice - trade.exitPrice) * trade.quantity;
        }
    }

    /**
     * حساب نسبة الربح/الخسارة للصفقة
     */
    static calculateTradeProfitLossPercent(trade: Trade): number {
        const profitLoss = this.calculateTradeProfitLoss(trade);
        const investment = trade.entryPrice * trade.quantity;

        return investment === 0 ? 0 : (profitLoss / investment) * 100;
    }

    /**
     * حساب منحنى رأس المال
     */
    static calculateEquityCurve(
        trades: (Trade & { profitLoss: number })[],
        initialCapital: number
    ): number[] {
        const equityCurve: number[] = [initialCapital];
        let currentEquity = initialCapital;

        trades.forEach(trade => {
            currentEquity += trade.profitLoss;
            equityCurve.push(currentEquity);
        });

        return equityCurve;
    }

    /**
     * حساب Max Drawdown
     */
    static calculateMaxDrawdown(equityCurve: number[]): number {
        if (equityCurve.length === 0) return 0;

        let maxEquity = equityCurve[0];
        let maxDrawdown = 0;

        for (let i = 1; i < equityCurve.length; i++) {
            if (equityCurve[i] > maxEquity) {
                maxEquity = equityCurve[i];
            }

            const drawdown = maxEquity - equityCurve[i];
            if (drawdown > maxDrawdown) {
                maxDrawdown = drawdown;
            }
        }

        return maxDrawdown;
    }

    /**
     * حساب Max Drawdown Percentage
     */
    static calculateMaxDrawdownPercentage(
        equityCurve: number[],
        initialCapital: number
    ): number {
        const maxDrawdown = this.calculateMaxDrawdown(equityCurve);
        return initialCapital > 0 ? (maxDrawdown / initialCapital) * 100 : 0;
    }

    /**
     * حساب العوائد
     */
    static calculateReturns(
        trades: (Trade & { profitLoss: number })[],
        initialCapital: number
    ): number[] {
        const returns: number[] = [];
        let currentEquity = initialCapital;

        trades.forEach(trade => {
            const returnPercent = (trade.profitLoss / currentEquity) * 100;
            returns.push(returnPercent);
            currentEquity += trade.profitLoss;
        });

        return returns;
    }

    /**
     * حساب العائد السنوي
     */
    static calculateAnnualReturn(
        returns: number[],
        trades: Trade[]
    ): number {
        if (returns.length === 0 || trades.length < 2) return 0;

        // حساب العائد الإجمالي
        const totalReturnPercent = returns.reduce((sum, r) => sum + r, 0);

        // حساب الفترة الزمنية بالسنوات
        const firstTrade = trades[0];
        const lastTrade = trades[trades.length - 1];
        const timeInYears = (lastTrade.exitTime.getTime() - firstTrade.entryTime.getTime())
            / (1000 * 60 * 60 * 24 * 365.25);

        if (timeInYears <= 0) return totalReturnPercent;

        // حساب العائد السنوي المركب
        const cagr = Math.pow(1 + totalReturnPercent / 100, 1 / timeInYears) - 1;
        return cagr * 100;
    }

    /**
     * حساب التقلب (الانحراف المعياري للعوائد)
     */
    static calculateVolatility(returns: number[]): number {
        if (returns.length < 2) return 0;

        const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;

        return Math.sqrt(variance);
    }

    /**
     * حساب Sharpe Ratio
     */
    static calculateSharpeRatio(
        returns: number[],
        riskFreeRate: number = 0.02 // 2% معدل خالي من المخاطر
    ): number {
        if (returns.length < 2) return 0;

        const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const volatility = this.calculateVolatility(returns);

        if (volatility === 0) return 0;

        // تحويل المعدلات إلى يومية (افتراض 252 يوم تداول في السنة)
        const dailyRiskFreeRate = riskFreeRate / 252 * 100;
        const dailyMeanReturn = meanReturn / Math.sqrt(252);
        const dailyVolatility = volatility / Math.sqrt(252);

        return (dailyMeanReturn - dailyRiskFreeRate) / dailyVolatility;
    }

    /**
     * حساب Sortino Ratio
     */
    static calculateSortinoRatio(
        returns: number[],
        riskFreeRate: number = 0.02
    ): number {
        if (returns.length < 2) return 0;

        const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const negativeReturns = returns.filter(r => r < 0);

        if (negativeReturns.length === 0) return Infinity;

        const downsideDeviation = Math.sqrt(
            negativeReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / returns.length
        );

        if (downsideDeviation === 0) return 0;

        const dailyRiskFreeRate = riskFreeRate / 252 * 100;
        const dailyMeanReturn = meanReturn / Math.sqrt(252);
        const dailyDownsideDeviation = downsideDeviation / Math.sqrt(252);

        return (dailyMeanReturn - dailyRiskFreeRate) / dailyDownsideDeviation;
    }

    /**
     * حساب Ulcer Index
     */
    static calculateUlcerIndex(equityCurve: number[]): number {
        if (equityCurve.length < 2) return 0;

        let maxEquity = equityCurve[0];
        let sumSquaredDrawdowns = 0;

        for (let i = 1; i < equityCurve.length; i++) {
            if (equityCurve[i] > maxEquity) {
                maxEquity = equityCurve[i];
            }

            const drawdownPercent = ((maxEquity - equityCurve[i]) / maxEquity) * 100;
            sumSquaredDrawdowns += Math.pow(drawdownPercent, 2);
        }

        return Math.sqrt(sumSquaredDrawdowns / (equityCurve.length - 1));
    }

    /**
     * حساب K-Ratio
     */
    static calculateKRatio(equityCurve: number[]): number {
        if (equityCurve.length < 2) return 0;

        // حساب الانحدار الخطي
        const n = equityCurve.length;
        const x = Array.from({ length: n }, (_, i) => i);

        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = equityCurve.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * equityCurve[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // حساب الأخطاء
        let sumSquaredErrors = 0;
        for (let i = 0; i < n; i++) {
            const predicted = slope * x[i] + intercept;
            const error = equityCurve[i] - predicted;
            sumSquaredErrors += error * error;
        }

        const standardError = Math.sqrt(sumSquaredErrors / (n - 2));
        const slopeStandardError = standardError / Math.sqrt(sumX2 - sumX * sumX / n);

        if (slopeStandardError === 0) return 0;
        return slope / slopeStandardError;
    }

    /**
     * حساب Tail Ratio
     */
    static calculateTailRatio(returns: number[]): number {
        if (returns.length < 2) return 0;

        const sortedReturns = [...returns].sort((a, b) => a - b);
        const positiveReturns = sortedReturns.filter(r => r > 0);
        const negativeReturns = sortedReturns.filter(r => r < 0);

        if (negativeReturns.length === 0) return Infinity;

        // متوسط أعلى 5% من العوائد الإيجابية
        const top5PercentIndex = Math.floor(positiveReturns.length * 0.95);
        const averageTopReturns = positiveReturns.length > 0
            ? positiveReturns.slice(top5PercentIndex).reduce((a, b) => a + b, 0)
            / (positiveReturns.length - top5PercentIndex)
            : 0;

        // متوسط أسوأ 5% من العوائد السلبية
        const bottom5PercentIndex = Math.floor(negativeReturns.length * 0.05);
        const averageBottomReturns = negativeReturns.length > 0
            ? negativeReturns.slice(0, bottom5PercentIndex).reduce((a, b) => a + b, 0)
            / bottom5PercentIndex
            : 0;

        if (averageBottomReturns === 0) return Infinity;
        return Math.abs(averageTopReturns / averageBottomReturns);
    }

    /**
     * حساب نسبة التعافي
     */
    static calculateRecoveryFactor(
        totalProfit: number,
        maxDrawdown: number
    ): number {
        return maxDrawdown > 0 ? totalProfit / maxDrawdown : 0;
    }

    /**
     * حساب التوقع (Expectancy)
     */
    static calculateExpectancy(
        winRate: number,
        averageWin: number,
        averageLoss: number
    ): number {
        return (winRate * averageWin) + ((1 - winRate) * averageLoss);
    }

    /**
     * حساب نسبة المخاطرة/المكافأة
     */
    static calculateRiskRewardRatio(
        averageWin: number,
        averageLoss: number
    ): number {
        return Math.abs(averageWin / averageLoss);
    }

    /**
     * حساب نسبة النجاح المطلوبة للتعادل
     */
    static calculateBreakevenWinRate(riskRewardRatio: number): number {
        return 1 / (1 + riskRewardRatio);
    }

    /**
     * حساب القيمة المعرضة للخطر (VaR)
     */
    static calculateValueAtRisk(
        returns: number[],
        confidenceLevel: number = 0.95
    ): number {
        if (returns.length === 0) return 0;

        const sortedReturns = [...returns].sort((a, b) => a - b);
        const index = Math.floor((1 - confidenceLevel) * sortedReturns.length);

        return sortedReturns[index] || 0;
    }

    /**
     * حساب القيمة المعرضة للخطر المشروطة (CVaR)
     */
    static calculateConditionalVaR(
        returns: number[],
        confidenceLevel: number = 0.95
    ): number {
        if (returns.length === 0) return 0;

        const sortedReturns = [...returns].sort((a, b) => a - b);
        const varIndex = Math.floor((1 - confidenceLevel) * sortedReturns.length);
        const tailReturns = sortedReturns.slice(0, varIndex);

        return tailReturns.length > 0
            ? tailReturns.reduce((a, b) => a + b, 0) / tailReturns.length
            : 0;
    }

    /**
     * مقاييس فارغة
     */
    private static getEmptyMetrics(): PerformanceMetrics {
        return {
            totalTrades: 0,
            winningTrades: 0,
            losingTrades: 0,
            winRate: 0,

            totalProfitLoss: 0,
            totalProfitLossPercent: 0,
            grossProfit: 0,
            grossLoss: 0,
            profitFactor: 0,

            maxDrawdown: 0,
            maxDrawdownPercent: 0,
            sharpeRatio: 0,
            sortinoRatio: 0,
            calmarRatio: 0,
            ulcerIndex: 0,

            averageTrade: 0,
            averageWin: 0,
            averageLoss: 0,
            largestWin: 0,
            largestLoss: 0,
            averageHoldTime: 0,

            annualReturn: 0,
            monthlyReturn: 0,
            volatility: 0,
            beta: 0,
            alpha: 0,

            recoveryFactor: 0,
            expectancy: 0,
            kRatio: 0,
            tailRatio: 0
        };
    }
}