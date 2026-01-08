// import { NextRequest, NextResponse } from 'next/server';
// import { HistoricalData } from '@/types/stocks';

// const BACKEND_URL = 'http://62.169.17.101:8017';

// export async function GET(
//     request: NextRequest,
//     { params }: { params: { market: string; symbol: string } }
// ) {
//     try {
//         const { market, symbol } = params;
//         const searchParams = request.nextUrl.searchParams;
//         const timeframe = searchParams.get('timeframe') || '1d';
//         const days = searchParams.get('days') || '365';

//         const queryParams = new URLSearchParams({
//             timeframe,
//             days,
//         });

//         const response = await fetch(
//             `${BACKEND_URL}/api/v1/market/historical/${market}/${symbol}?${queryParams.toString()}&XTransformPort=8000`,
//             {
//                 method: 'GET',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//             }
//         );

//         if (!response.ok) {
//             const errorData = await response.text();
//             console.error('Backend error:', errorData);
//             return NextResponse.json(
//                 { success: false, error: 'Failed to get historical data' },
//                 { status: response.status }
//             );
//         }

//         const data: HistoricalData = await response.json();
//         return NextResponse.json(data);
//     } catch (error) {
//         console.error('Error getting historical data:', error);
//         return NextResponse.json(
//             { success: false, error: 'Internal server error' },
//             { status: 500 }
//         );
//     }
// }


import { NextRequest, NextResponse } from 'next/server';
import { HistoricalData } from '@/types/stocks';

const BACKEND_URL = 'http://62.169.17.101:8017';

export async function GET(
    request: NextRequest,
    { params }: any // أي تجاوز للتحقق الصارم
) {
    try {
        const { market, symbol } = params;
        const searchParams = request.nextUrl.searchParams;
        const timeframe = searchParams.get('timeframe') || '1d';
        const days = searchParams.get('days') || '365';

        const queryParams = new URLSearchParams({
            timeframe,
            days,
        });

        const response = await fetch(
            `${BACKEND_URL}/api/v1/market/historical/${market}/${symbol}?${queryParams.toString()}&XTransformPort=8000`,
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
                { success: false, error: 'Failed to get historical data' },
                { status: response.status }
            );
        }

        const data: HistoricalData = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error getting historical data:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
