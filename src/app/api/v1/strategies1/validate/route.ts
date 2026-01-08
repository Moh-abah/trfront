import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://62.169.17.101:8017';

export async function DELETE(
    request: NextRequest,
    // { params }: { params: { name: string } }
    { params }: any
) {
    try {
        const { name } = params;

        const response = await fetch(
            `${BACKEND_URL}/api/v1/strategies1/delete_from_db/${encodeURIComponent(name)}?XTransformPort=8000`,
            {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Backend error:', errorData);
            return NextResponse.json(
                { success: false, error: 'Failed to delete strategy' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error deleting strategy:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
