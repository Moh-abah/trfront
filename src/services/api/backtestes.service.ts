// services/api/backtest.service.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://161.97.73.254:8017';

export const backtestService = {
    async runBacktest(config: any) {
        const response = await fetch(`${API_BASE_URL}/api/v1/backtest/run`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(config)
        });

        if (!response.ok) {
            throw new Error(`Failed to run backtest: ${response.statusText}`);
        }

        return response.json();
    },

    async getBacktestResult(backtestId: string) {
        const response = await fetch(`${API_BASE_URL}/api/v1/backtest/results/${backtestId}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to get backtest result: ${response.statusText}`);
        }

        return response.json();
    },

    async generateReport(backtestId: string) {
        const response = await fetch(`${API_BASE_URL}/api/v1/backtest/report/${backtestId}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to generate report: ${response.statusText}`);
        }

        return response.json();
    },

    async runMonteCarloSimulation(config: any) {
        const response = await fetch(`${API_BASE_URL}/api/v1/backtest/monte-carlo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(config)
        });

        if (!response.ok) {
            throw new Error(`Failed to run Monte Carlo simulation: ${response.statusText}`);
        }

        return response.json();
    },

    async compareBacktests(configs: any[]) {
        const response = await fetch(`${API_BASE_URL}/api/v1/backtest/compare`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            
            },
            body: JSON.stringify({ configs })
        });

        if (!response.ok) {
            throw new Error(`Failed to compare backtests: ${response.statusText}`);
        }

        return response.json();
    }
};