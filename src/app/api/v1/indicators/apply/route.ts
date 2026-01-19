import { NextRequest, NextResponse } from 'next/server';
import { ApplyIndicatorsRequest, ApplyIndicatorsResponse } from '@/types/stocks';

const BACKEND_URL = 'http://161.97.73.254:8017';

export async function POST(request: NextRequest) {
    try {
        const config: ApplyIndicatorsRequest = await request.json();

        const response = await fetch(
            `${BACKEND_URL}/api/v1/indicators/apply?XTransformPort=8000`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(config),
            }
        );

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Backend error:', errorData);
            return NextResponse.json(
                { success: false, error: 'Failed to apply indicators' },
                { status: response.status }
            );
        }

        const data: ApplyIndicatorsResponse = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error applying indicators:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
