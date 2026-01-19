import { NextRequest, NextResponse } from 'next/server';
import { StockSearchResult } from '@/types/stocks';

const BACKEND_URL = 'http://161.97.73.254:8017';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q') || '';
        const limit = searchParams.get('limit') || '20';

        const queryParams = new URLSearchParams({
            q: query,
            limit,
        });

        const response = await fetch(
            `${BACKEND_URL}/api/v1/stocks/stocks/search?${queryParams.toString()}&XTransformPort=8000`,
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
                { success: false, error: 'Failed to search stocks' },
                { status: response.status }
            );
        }

        const data: StockSearchResult[] = await response.json();
        return NextResponse.json({ results: data, count: data.length });
    } catch (error) {
        console.error('Error searching stocks:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
