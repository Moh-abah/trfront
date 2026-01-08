import { NextRequest, NextResponse } from 'next/server';
import { SectorAnalysis } from '@/types/stocks';

const BACKEND_URL = 'http://62.169.17.101:8017';

export async function GET(request: NextRequest) {
    try {
        const response = await fetch(
            `${BACKEND_URL}/api/v1/stocks/stocks/sectors?XTransformPort=8000`,
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
                { success: false, error: 'Failed to get sector analysis' },
                { status: response.status }
            );
        }

        const data: SectorAnalysis[] = await response.json();
        return NextResponse.json({ sectors: data, count: data.length });
    } catch (error) {
        console.error('Error getting sector analysis:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
