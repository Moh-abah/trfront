import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://161.97.73.254:8017';
// const BACKEND_URL = 'http://127.0.0.1:8000';
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const activeOnly = searchParams.get('active_only') === 'true';

        const queryParams = new URLSearchParams();
        if (activeOnly) {
            queryParams.append('active_only', 'true');
        }

        const response = await fetch(
            `${BACKEND_URL}/api/v1/strategies1/list_from_db?${queryParams.toString()}&XTransformPort=8000`,
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
                { success: false, error: 'Failed to list strategies' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error listing strategies:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
