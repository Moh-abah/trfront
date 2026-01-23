import { NextRequest, NextResponse } from 'next/server';
import { StrategyConfig } from '@/types/backtest';

const BACKEND_URL = 'http://161.97.73.254:8017';
// const BACKEND_URL = 'http://127.0.0.1:8000';
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { symbol, timeframe, strategy_name, market = 'crypto', days = 3, live_mode = false, strategy_config } = body;

        // Determine which endpoint to use
        let url: string;
        let requestBody: any;

        if (strategy_name && !strategy_config) {
            // Run from database
            url = `${BACKEND_URL}/api/v1/strategies1/run_from_db`;
            requestBody = { symbol, timeframe, strategy_name, market, days, live_mode };
        } else if (strategy_config) {
            // Run with provided config
            url = `${BACKEND_URL}/api/v1/strategies1/run`;
            requestBody = strategy_config;
        } else {
            return NextResponse.json(
                { success: false, error: 'Either strategy_name or strategy_config is required' },
                { status: 400 }
            );
        }

        // Build query parameters
        const queryParams = new URLSearchParams({
            symbol,
            timeframe,
            market,
            days: days.toString(),
            live_mode: live_mode.toString(),
        });

        if (strategy_name) {
            queryParams.append('strategy_name', strategy_name);
        }

        const response = await fetch(`${url}?${queryParams.toString()}&XTransformPort=8000`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: strategy_config ? JSON.stringify(strategy_config) : undefined,
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Backend error:', errorData);
            return NextResponse.json(
                { success: false, error: 'Failed to run strategy' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error running strategy:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
