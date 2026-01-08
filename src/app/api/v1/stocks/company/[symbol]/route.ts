import { NextRequest, NextResponse } from 'next/server';
import { CompanyProfile } from '@/types/stocks';

const BACKEND_URL = 'http://62.169.17.101:8017';

export async function GET(
    request: NextRequest,
    // { params }: { params: { symbol: string } }
    { params }: any
) {
    try {
        const { symbol } = params;

        const response = await fetch(
            `${BACKEND_URL}/api/v1/stocks/stocks/company/${symbol}?XTransformPort=8000`,
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
                { success: false, error: 'Failed to get company profile' },
                { status: response.status }
            );
        }

        const data: CompanyProfile = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error getting company profile:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
