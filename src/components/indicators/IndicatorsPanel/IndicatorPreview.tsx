"use client"

import type React from "react"
import { Star, Plus, Info } from "lucide-react"
import type { Indicator } from "@/lib/charts/types/indicator"

interface IndicatorPreviewProps {
    indicator: Indicator
    onSelect: () => void
    isFavorite: boolean
    onToggleFavorite: () => void
}

export const IndicatorPreview: React.FC<IndicatorPreviewProps> = ({
    indicator,
    onSelect,
    isFavorite,
    onToggleFavorite,
}) => {
    const getCategoryIcon = (categoryId: string) => {
        const icons: Record<string, string> = {
            trend: "📈",
            momentum: "⚡",
            volatility: "🌊",
            volume: "📊",
            oscillators: "↕️",
            custom: "🛠️",
        }
        return icons[categoryId] || "📊"
    }

    return (
        <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-card hover:bg-accent/10 transition-colors group">
            <div className="flex items-start space-x-3 rtl:space-x-reverse">
                <div className="text-2xl mt-1 text-foreground/70">
                    {getCategoryIcon(indicator.category)}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <h4 className="font-medium text-foreground truncate">
                            {indicator.displayName}
                        </h4>
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onToggleFavorite()
                            }}
                            className="p-1 rounded-md hover:bg-accent transition-colors"
                        >
                            <Star className={`w-4 h-4 ${isFavorite ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} />
                        </button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {indicator.description}
                    </p>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse mt-2">
                        <span className="px-2 py-0.5 text-xs bg-card border border-border text-foreground rounded">
                            {indicator.seriesType === "line"
                                ? "خط"
                                : indicator.seriesType === "histogram"
                                    ? "عمود"
                                    : indicator.seriesType === "area"
                                        ? "منطقة"
                                        : "نطاق"}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded ${indicator.overlay
                            ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300"
                            : "bg-primary/20 text-primary"
                            }`}>
                            {indicator.overlay ? "على السعر" : "لوحة منفصلة"}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <button
                    onClick={onSelect}
                    className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    title="إضافة المؤشر"
                >
                    <Plus className="w-4 h-4" />
                </button>
                <button
                    onClick={() => {
                        /* سيتم إضافة نافذة معلومات */
                    }}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                    title="معلومات المؤشر"
                >
                    <Info className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}