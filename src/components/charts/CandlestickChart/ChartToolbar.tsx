"use client"

import type React from "react"
import { useState } from "react"
import {
    BarChart3,
    CandlestickChartIcon as CandlestickIcon,
    LineChart,
    TrendingUp,
    Plus,
    Settings2,
    Loader2,
} from "lucide-react"

interface ChartToolbarProps {
    symbol: string
    currentTimeframe: string
    currentChartType: "candlestick" | "bar" | "line" | "area"
    onTimeframeChange: (timeframe: string) => void
    onChartTypeChange: (type: "candlestick" | "bar" | "line" | "area") => void
    onAddIndicator?: (indicator: any) => void
    drawingMode?: string
    onDrawingToolChange?: (mode: string) => void
    isConnected: boolean
    isLoading: boolean
}

export const ChartToolbar: React.FC<ChartToolbarProps> = ({
    symbol,
    currentTimeframe,
    currentChartType,
    onTimeframeChange,
    onChartTypeChange,
    onAddIndicator,
    drawingMode,
    onDrawingToolChange,
    isConnected,
    isLoading,
}) => {
    const [showSettings, setShowSettings] = useState(false)

    const chartTypes: Array<{ value: typeof currentChartType; label: string; icon: React.ReactNode }> = [
        { value: "candlestick", label: "شموع", icon: <CandlestickIcon className="w-3.5 h-3.5" /> },
        { value: "bar", label: "أعمدة", icon: <BarChart3 className="w-3.5 h-3.5" /> },
        { value: "line", label: "خط", icon: <LineChart className="w-3.5 h-3.5" /> },
        { value: "area", label: "منطقة", icon: <TrendingUp className="w-3.5 h-3.5" /> },
    ]

    const timeframes = [
        { value: "1m", label: "1د" },
        { value: "5m", label: "5د" },
        { value: "15m", label: "15د" },
        { value: "30m", label: "30د" },
        { value: "1h", label: "1س" },
        { value: "4h", label: "4س" },
        { value: "1d", label: "1ي" },
        { value: "1w", label: "1أ" },
    ]

    return (
        <div className="flex items-center justify-between gap-4 p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            {/* Left Section - Symbol & Timeframes */}
            <div className="flex items-center gap-3">
                {/* Symbol */}
                <div className="font-bold text-lg text-gray-900 dark:text-white">{symbol}</div>

                {/* Timeframe Selector */}
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                    {timeframes.map((tf) => (
                        <button
                            key={tf.value}
                            onClick={() => onTimeframeChange(tf.value)}
                            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${currentTimeframe === tf.value
                                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                }`}
                        >
                            {tf.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Center Section - Chart Type */}
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                    {chartTypes.map((type) => (
                        <button
                            key={type.value}
                            onClick={() => onChartTypeChange(type.value)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${currentChartType === type.value
                                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                }`}
                            title={type.label}
                        >
                            {type.icon}
                            <span className="hidden sm:inline">{type.label}</span>
                        </button>
                    ))}
                </div>

                {/* Add Indicator Button */}
                {onAddIndicator && (
                    <button
                        onClick={() => onAddIndicator({})}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!isConnected || isLoading}
                        title="إضافة مؤشر"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">مؤشر</span>
                    </button>
                )}
            </div>

            {/* Right Section - Status & Settings */}
            <div className="flex items-center gap-2">
                {/* Loading Indicator */}
                {isLoading && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span className="hidden sm:inline">جاري التحميل...</span>
                    </div>
                )}

                {/* Connection Status */}
                <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${isConnected
                            ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                            : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                        }`}
                >
                    <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"} animate-pulse`} />
                    <span className="hidden sm:inline">{isConnected ? "مباشر" : "غير متصل"}</span>
                </div>

                {/* Settings Button */}
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="الإعدادات"
                >
                    <Settings2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
