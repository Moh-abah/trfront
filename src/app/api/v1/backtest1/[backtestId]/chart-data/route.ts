// trading-frontend\src\app\api\v1\backtest1\[backtestId]\chart-data\route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://161.97.73.254:8017';


export async function GET(
    request: NextRequest,
    context: any 
) {
    try {
        // const { backtestId } = params as { backtestId: string };
        // const { searchParams } = new URL(request.url);
        const params = await Promise.resolve(context?.params || {});
        const { backtestId } = params;

        const { searchParams } = new URL(request.url);
       
        const queryString = searchParams.toString();
        const apiUrl = `${BACKEND_URL}/api/v1/backtest1/${backtestId}/chart-data${queryString ? `?${queryString}` : ''}`;

        console.log(`[API Proxy] Fetching chart data for ${backtestId}`);

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('[API Proxy] Chart Data Error:', response.status);
            return NextResponse.json(
                { error: 'Failed to fetch chart data' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('[API Proxy] Chart Data Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', message: (error as Error).message },
            { status: 500 }
        );
    }
}