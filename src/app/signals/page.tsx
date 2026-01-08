// app/signals/page.tsx - Server Component
import { Suspense } from 'react';
import SignalsClient from './SignalsClient';
import { Skeleton } from '@/components/uiadv/skeleton';

export default function SignalsPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Suspense fallback={<Skeleton className="w-full h-screen" />}>
                <SignalsClient />
            </Suspense>
        </div>
    );
}