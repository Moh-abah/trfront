// src/app/api/v1/backtest1/[backtestId]/get/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://161.97.73.254:8017';

export async function GET(
    request: NextRequest,
    context: any
) {
    try {
        const params = await Promise.resolve(context?.params || {});
        const { backtestId } = params;

        // استدعاء نقطة النهاية الجديدة /get/{id}
        const apiUrl = `${BACKEND_URL}/api/v1/backtest1/get/${backtestId}`;

        console.log(`[API Proxy] Fetching backtest details for ${backtestId}`);

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store' // للتأكد من جلب البيانات الحديثة
        });

        if (!response.ok) {
            console.error('[API Proxy] Backtest Get Error:', response.status);
            return NextResponse.json(
                { error: 'Failed to fetch backtest details' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('[API Proxy] Backtest Get Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', message: (error as Error).message },
            { status: 500 }
        );
    }
}

