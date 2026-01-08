import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://62.169.17.101:8017';

export async function GET(
    request: NextRequest,
    // { params }: { params: { name: string } }
    { params }: any
) {
    try {
        const { name } = params;

        const response = await fetch(
            `${BACKEND_URL}/api/v1/strategies1/get_from_db/${encodeURIComponent(name)}?XTransformPort=8000`,
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
                { success: false, error: 'Failed to get strategy' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error getting strategy:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
