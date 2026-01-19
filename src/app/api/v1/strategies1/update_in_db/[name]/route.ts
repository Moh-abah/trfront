import { NextRequest, NextResponse } from 'next/server';
import { StrategyConfig } from '@/types/backtest';

const BACKEND_URL = 'http://161.97.73.254:8017';

export async function POST(request: NextRequest) {
    try {
        const strategyConfig: StrategyConfig = await request.json();

        const response = await fetch(
            `${BACKEND_URL}/api/v1/strategies1/validate?XTransformPort=8000`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(strategyConfig),
            }
        );

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Backend error:', errorData);
            return NextResponse.json(
                { success: false, error: 'Failed to validate strategy' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error validating strategy:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
