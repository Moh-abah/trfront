// import { NextRequest, NextResponse } from 'next/server';
// import { CurrentPrice } from '@/types/stocks';

// const BACKEND_URL = 'http://62.169.17.101:8017';

// export async function GET(
//     request: NextRequest,
//     { params }: { params: { market: string; symbol: string } }
// ) {
//     try {
//         const { market, symbol } = params;

//         const response = await fetch(
//             `${BACKEND_URL}/api/v1/market/price/${market}/${symbol}?XTransformPort=8000`,
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
//                 { success: false, error: 'Failed to get current price' },
//                 { status: response.status }
//             );
//         }

//         const data: CurrentPrice = await response.json();
//         return NextResponse.json(data);
//     } catch (error) {
//         console.error('Error getting current price:', error);
//         return NextResponse.json(
//             { success: false, error: 'Internal server error' },
//             { status: 500 }
//         );
//     }
// }

import { NextRequest, NextResponse } from 'next/server';
import { CurrentPrice } from '@/types/stocks';

const BACKEND_URL = 'http://161.97.73.254:8017';

export async function GET(
    request: NextRequest,
    { params }: any
) {
    try {
        const { market, symbol } = params;

        const response = await fetch(
            `${BACKEND_URL}/api/v1/market/price/${market}/${symbol}?XTransformPort=8000`,
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
                { success: false, error: 'Failed to get current price' },
                { status: response.status }
            );
        }

        const data: CurrentPrice = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error getting current price:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

