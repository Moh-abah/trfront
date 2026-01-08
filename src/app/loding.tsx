
import { Skeleton } from '@/components/uiadv/skeleton'; 

export const PremiumSkeletonLoader = () => {
    const skeletonItems = Array.from({ length: 8 }, (_, i) => i);

    return (
        <div className="relative overflow-hidden">
            {/* خلفية متوهجة */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5"></div>

            <div className="relative space-y-1">
                {/* Header Skeleton */}
                <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-slate-900/50 border-b border-slate-700">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="col-span-3">
                            <div className="h-4 bg-slate-700 rounded animate-pulse"></div>
                        </div>
                    ))}
                </div>

                {/* Rows Skeleton */}
                {skeletonItems.map((i) => (
                    <div key={i} className="grid grid-cols-12 gap-4 px-4 py-4 border-b border-slate-700/50">
                        <div className="col-span-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-700 animate-pulse"></div>
                                <div className="space-y-2">
                                    <div className="h-4 w-20 bg-slate-700 rounded animate-pulse"></div>
                                    <div className="h-3 w-16 bg-slate-800 rounded animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                        {[...Array(3)].map((_, j) => (
                            <div key={j} className="col-span-3">
                                <div className="h-4 w-24 bg-slate-700 rounded animate-pulse float-right"></div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};