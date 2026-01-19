import { NextRequest, NextResponse } from 'next/server';
import { TechnicalAnalysis } from '@/types/stocks';

const BACKEND_URL = 'http://161.97.73.254:8017';

export async function GET(
    request: NextRequest,
    // { params }: { params: { symbol: string } }
    { params }: any
) {
    try {
        const { symbol } = params;
        const searchParams = request.nextUrl.searchParams;
        const timeframe = searchParams.get('timeframe') || '1d';

        const queryParams = new URLSearchParams({
            timeframe,
        });

        const response = await fetch(
            `${BACKEND_URL}/api/v1/stocks/stocks/analysis/${symbol}?${queryParams.toString()}&XTransformPort=8000`,
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
                { success: false, error: 'Failed to get technical analysis' },
                { status: response.status }
            );
        }

        const data: TechnicalAnalysis = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error getting technical analysis:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
 