
// @ts-nocheck

"use client"

import type React from "react"
import { useState } from "react"
import { Eye, EyeOff, Trash2, Settings, ChevronDown, ChevronUp, GripVertical, AlertCircle } from "lucide-react"
import type { ActiveIndicator } from "@/lib/charts/types/indicator"
import { ParameterInputs } from "../../forms/IndicatorForm/ParameterInputs"
import { indicatorsLibrary } from "@/lib/charts/data/indicators-library"

interface IndicatorItemProps {
    indicator: ActiveIndicator
    onToggleVisibility: () => void
    onDelete: () => void
    onUpdate: (updates: Partial<ActiveIndicator>) => void
}

export const IndicatorItem: React.FC<IndicatorItemProps> = ({ indicator, onToggleVisibility, onDelete, onUpdate }) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const [localParameters, setLocalParameters] = useState(indicator.parameters)

    const indicatorDefinition = indicatorsLibrary.indicators.find((ind) => ind.id === indicator.indicatorId)

    const handleParameterChange = (name: string, value: any) => {
        const updated = { ...localParameters, [name]: value }
        setLocalParameters(updated)
        onUpdate({ parameters: updated })
    }

    const handleColorChange = (color: string) => {
        onUpdate({ color })
    }

    const handleSave = () => {
        onUpdate({ parameters: localParameters })
    }

    const handleReset = () => {
        const defaultParams = indicatorDefinition?.defaultParameters || {}
        setLocalParameters(defaultParams)
        onUpdate({ parameters: defaultParams })
    }

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center space-x-3">
                    <div className="cursor-move text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <GripVertical className="w-4 h-4" />
                    </div>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: indicator.color }} />
                    <div>
                        <div className="font-medium text-gray-900 dark:text-white">{indicator.name}</div>
                        {indicatorDefinition && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">{indicatorDefinition.category}</div>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {indicator.loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>}
                    {indicator.error && <AlertCircle className="w-4 h-4 text-red-500" title={indicator.error} />}
                    <button
                        onClick={onToggleVisibility}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        title={indicator.visible ? "إخفاء" : "إظهار"}
                    >
                        {indicator.visible ? (
                            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        ) : (
                            <EyeOff className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        )}
                    </button>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        title="الإعدادات"
                    >
                        <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-500"
                        title="حذف"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {isExpanded && indicatorDefinition && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">اللون</label>
                            <div className="flex flex-wrap gap-2">
                                {["#2962FF", "#FF6B6B", "#4ECDC4", "#FFD166", "#06D6A0", "#7209B7"].map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => handleColorChange(color)}
                                        className={`w-6 h-6 rounded-full border-2 ${indicator.color === color ? "border-blue-500" : "border-gray-300"
                                            }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                                <input
                                    type="color"
                                    value={indicator.color}
                                    onChange={(e) => handleColorChange(e.target.value)}
                                    className="w-6 h-6 rounded-full border border-gray-300 cursor-pointer"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">المعلمات</label>
                            <ParameterInputs
                                parameters={localParameters}
                                onChange={handleParameterChange}
                                indicator={indicatorDefinition}
                            />
                        </div>

                        <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                إعادة تعيين
                            </button>
                            <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                                حفظ التعديلات
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
