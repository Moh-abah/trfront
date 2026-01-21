// src/app/api/v1/backtest1/[backtestId]/delete/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://161.97.73.254:8017';


export async function DELETE(
    request: NextRequest,
    context: any
) {
    try {
        const params = await Promise.resolve(context?.params || {});
        const { backtestId } = params;

        // استخدام نقطة النهاية للحذف
        const apiUrl = `${BACKEND_URL}/api/v1/backtest1/delete/${backtestId}`;

        console.log(`[API Proxy] Deleting backtest ${backtestId}`);

        const response = await fetch(apiUrl, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            console.error('[API Proxy] Delete Error:', response.status);
            return NextResponse.json(
                { error: 'Failed to delete backtest' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API Proxy] Delete Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}