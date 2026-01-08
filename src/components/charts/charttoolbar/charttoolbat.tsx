'use client'

import type React from 'react'
import {
    BarChart3,
    CandlestickChartIcon as CandlestickIcon,
    LineChart,
    TrendingUp,
    Plus,
    Settings2,
    Loader2,
    Layers,
    ChartPie,
} from 'lucide-react'
import { Button } from '@/components/uiadv/button'
import { Badge } from '@/components/uiadv/badge'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/uiadv/tooltip'

interface ChartToolbarProps {
    symbol: string
    currentTimeframe: string
    currentChartType: 'candlestick' | 'bar' | 'line' | 'area'
    onTimeframeChange: (timeframe: string) => void
    onChartTypeChange: (type: 'candlestick' | 'bar' | 'line' | 'area') => void
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
    const chartTypes: Array<{
        value: typeof currentChartType
        label: string
        icon: React.ReactNode
    }> = [
            { value: 'candlestick', label: 'شموع', icon: <CandlestickIcon className="w-4 h-4" /> },
            { value: 'bar', label: 'أعمدة', icon: <BarChart3 className="w-4 h-4" /> },
            { value: 'line', label: 'خط', icon: <LineChart className="w-4 h-4" /> },
            { value: 'area', label: 'منطقة', icon: <TrendingUp className="w-4 h-4" /> },
        ]

    const timeframes = [
        { value: '1m', label: '1د' },
        { value: '5m', label: '5د' },
        { value: '15m', label: '15د' },
        { value: '30m', label: '30د' },
        { value: '1h', label: '1س' },
        { value: '4h', label: '4س' },
        { value: '1d', label: '1ي' },
        { value: '1w', label: '1أ' },
    ]

    return (
        <TooltipProvider>
            <div className="flex items-center justify-between gap-4 px-4 py-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-b border-slate-200 dark:border-gray-700">
                {/* Left Section - Symbol & Timeframes */}
                <div className="flex items-center gap-4">
                    {/* Symbol with icon */}
                    <div className="flex items-center gap-2">
                        <ChartPie className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                        <div className="font-bold text-lg text-slate-900 dark:text-white">
                            {symbol}
                        </div>
                    </div>

                    {/* Timeframe Selector */}
                    <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-gray-700 rounded-xl">
                        {timeframes.map((tf) => (
                            <Tooltip key={tf.value}>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => onTimeframeChange(tf.value)}
                                        className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 ${currentTimeframe === tf.value
                                                ? 'bg-white dark:bg-gray-600 text-slate-900 dark:text-white shadow-md scale-105'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-gray-600/50'
                                            }`}
                                    >
                                        {tf.label}
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>الإطار الزمني {tf.label}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </div>
                </div>

                {/* Center Section - Chart Type & Indicators */}
                <div className="flex items-center gap-3">
                    {/* Chart Type Selector */}
                    <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-gray-700 rounded-xl">
                        {chartTypes.map((type) => (
                            <Tooltip key={type.value}>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => onChartTypeChange(type.value)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${currentChartType === type.value
                                                ? 'bg-white dark:bg-gray-600 text-slate-900 dark:text-white shadow-md scale-105'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-gray-600/50'
                                            }`}
                                    >
                                        {type.icon}
                                        <span className="hidden sm:inline">{type.label}</span>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{type.label}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </div>

                    {/* Add Indicator Button */}
                    {onAddIndicator && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={() => onAddIndicator({})}
                                    variant="default"
                                    size="sm"
                                    className="gap-2 shadow-lg shadow-blue-500/20"
                                    disabled={!isConnected || isLoading}
                                >
                                    <Layers className="w-4 h-4" />
                                    <span className="hidden sm:inline">مؤشر</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>إضافة مؤشر فني</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>

                {/* Right Section - Status & Settings */}
                <div className="flex items-center gap-2">
                    {/* Loading Indicator */}
                    {isLoading && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-gray-700 rounded-lg">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 hidden sm:inline">
                                جاري التحميل...
                            </span>
                        </div>
                    )}

                    {/* Connection Status */}
                    <Badge
                        variant={isConnected ? 'default' : 'destructive'}
                        className={`gap-1.5 ${isConnected
                                ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/40'
                                : 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40'
                            }`}
                    >
                        <div
                            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}
                        />
                        <span className="hidden sm:inline">{isConnected ? 'مباشر' : 'غير متصل'}</span>
                    </Badge>

                    {/* Settings Button */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() => { }}
                            >
                                <Settings2 className="w-4 h-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>الإعدادات</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </TooltipProvider>
    )
}