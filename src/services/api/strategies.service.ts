// services/api/strategies.service.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://161.97.73.254:8017';

export const strategiesService = {
    async runStrategy(params: {
        symbol: string;
        market: 'crypto' | 'stocks';
        timeframe: string;
        strategy: any;
        data?: any[];
    }) {
        const response = await fetch(`${API_BASE_URL}/api/v1/strategies/run`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                
            },
            body: JSON.stringify(params)
        });

        if (!response.ok) {
            throw new Error(`Failed to run strategy: ${response.statusText}`);
        }

        return response.json();
    },

    async getStrategyExamples(exampleName: string) {
        const response = await fetch(`${API_BASE_URL}/api/v1/strategies/examples/${exampleName}`, {
            headers: {
                'Content-Type': 'application/json',
                
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to get strategy examples: ${response.statusText}`);
        }

        return response.json();
    },

    async listLoadedStrategies() {
        const response = await fetch(`${API_BASE_URL}/api/v1/strategies/list`, {
            headers: {
                'Content-Type': 'application/json',
               
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to list strategies: ${response.statusText}`);
        }

        return response.json();
    },

    async validateStrategy(config: any) {
        const response = await fetch(`${API_BASE_URL}/api/v1/strategies/validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
               
            },
            body: JSON.stringify(config)
        });

        if (!response.ok) {
            throw new Error(`Failed to validate strategy: ${response.statusText}`);
        }

        return response.json();
    }
};