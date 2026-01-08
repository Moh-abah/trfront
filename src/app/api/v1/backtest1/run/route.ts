import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://62.169.17.101:8017';

export async function POST(request: NextRequest) {
    try {
        console.log('[API Proxy] Received request for /api/v1/backtest/run');

        // 1. استقبال البيانات من الفرونت
        const body = await request.json();
        console.log('[API Proxy] Payload:', JSON.stringify(body, null, 2));

    
        const response = await fetch(`${BACKEND_URL}/api/v1/backtest1/run`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
               
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[API Proxy] Backend Error:', response.status, errorText);
            return NextResponse.json(
                { success: false, error: 'Failed to run backtest', details: errorText },
                { status: response.status }
            );
        }

        // 3. إرجاع البيانات إلى الفرونت
        const data = await response.json();
        console.log('[API Proxy] Backend Success:', data.success);
        return NextResponse.json(data);

    } catch (error) {
        console.error('[API Proxy] Proxy Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error', message: (error as Error).message },
            { status: 500 }
        );
    }
}