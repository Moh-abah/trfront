

// @ts-nocheck
'use client';
import { useState, useCallback } from 'react';
import { BacktestConfig, BacktestResult } from '../../types';
import { backtestService } from '../../services/api/backtest.service';
import { useUIStore } from '../../stores/ui.store';

export const useBacktest = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<BacktestResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { addToast } = useUIStore();

    const runBacktest = useCallback(async (config: BacktestConfig): Promise<BacktestResult | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await backtestService.runBacktest(config);
            setResult(data);

            addToast({
                type: 'success',
                title: 'Backtest Completed',
                message: `Backtest finished with ${data.totalReturn.toFixed(2)}% return`
            });

            return data;
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to run backtest';
            setError(errorMessage);

            addToast({
                type: 'error',
                title: 'Backtest Failed',
                message: errorMessage
            });

            return null;
        } finally {
            setIsLoading(false);
        }
    }, [addToast]);

    const runWalkForward = useCallback(async (config: any) => {
        // Similar implementation for walk-forward analysis
        setIsLoading(true);
        try {
            const data = await backtestService.runWalkForward(config);
            return data;
        } catch (err: any) {
            setError(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const runMonteCarlo = useCallback(async (config: any) => {
        // Similar implementation for Monte Carlo simulation
        setIsLoading(true);
        try {
            const data = await backtestService.runMonteCarlo(config);
            return data;
        } catch (err: any) {
            setError(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearResult = useCallback(() => {
        setResult(null);
        setError(null);
    }, []);

    return {
        runBacktest,
        runWalkForward,
        runMonteCarlo,
        clearResult,
        isLoading,
        result,
        error
    };
};