import { Suspense } from 'react';
import SignalsClient from './SignalsClient';
import { Skeleton } from '@/components/uiadv/skeleton';

export default function SignalsPage() {
    return (
        <div className="min-h-screen bg-background">
            <Suspense fallback={<Skeleton className="w-full h-screen" />}>
                <SignalsClient />
            </Suspense>
        </div>
    );
}