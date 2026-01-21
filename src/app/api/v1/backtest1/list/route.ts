// src/app/api/v1/backtest1/list/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://161.97.73.254:8017';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get('limit') || '20';
        const offset = searchParams.get('offset') || '0';

        const apiUrl = `${BACKEND_URL}/api/v1/backtest1/list?limit=${limit}&offset=${offset}`;

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch list' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}