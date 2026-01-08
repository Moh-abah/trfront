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
        <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <div className="flex items-start space-x-3">
                <div className="text-2xl mt-1">{getCategoryIcon(indicator.category)}</div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900 dark:text-white truncate">{indicator.displayName}</h4>
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onToggleFavorite()
                            }}
                            className="text-gray-400 hover:text-yellow-500"
                        >
                            <Star className={`w-4 h-4 ${isFavorite ? "fill-yellow-500 text-yellow-500" : ""}`} />
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{indicator.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                        <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded">
                            {indicator.seriesType === "line"
                                ? "خط"
                                : indicator.seriesType === "histogram"
                                    ? "عمود"
                                    : indicator.seriesType === "area"
                                        ? "منطقة"
                                        : "نطاق"}
                        </span>
                        <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                            {indicator.overlay ? "على السعر" : "لوحة منفصلة"}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <button
                    onClick={onSelect}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    title="إضافة المؤشر"
                >
                    <Plus className="w-4 h-4" />
                </button>
                <button
                    onClick={() => {
                        /* سيتم إضافة نافذة معلومات */
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="معلومات المؤشر"
                >
                    <Info className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
