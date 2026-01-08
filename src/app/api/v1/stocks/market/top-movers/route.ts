import { NextRequest, NextResponse } from 'next/server';
import { TopMovers } from '@/types/stocks';

const BACKEND_URL = 'http://62.169.17.101:8017';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const limit = searchParams.get('limit') || '10';
        const market = searchParams.get('market');

        const queryParams = new URLSearchParams({ limit });
        if (market) queryParams.append('market', market);

        const response = await fetch(
            `${BACKEND_URL}/api/v1/stocks/stocks/market/top-movers?${queryParams.toString()}&XTransformPort=8000`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Backend error:', errorData);
            return NextResponse.json(
                { success: false, error: 'Failed to get top movers' },
                { status: response.status }
            );
        }

        const data: TopMovers = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error getting top movers:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
