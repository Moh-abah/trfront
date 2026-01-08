'use client'

import type React from 'react'
import { useState } from 'react'
import {
    MousePointer,
    TrendingUp,
    Minus,
    Circle,
    Square,
    Type,
    Pen,
    Trash2,
    ChevronLeft,
    ChevronRight,
    X,
} from 'lucide-react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/uiadv/tooltip'
import type { IChartApi } from 'lightweight-charts'

interface DrawingToolsProps {
    activeTool: string
    onToolSelect: (tool: string) => void
    chart: IChartApi | null
    chartKey: string
    isChartReady: boolean
}

interface DrawingTool {
    id: string
    name: string
    icon: React.ReactNode
    tooltip: string
    category: 'basic' | 'shapes' | 'text' | 'advanced'
}

const tools: DrawingTool[] = [
    { id: 'cursor', name: 'تحديد', icon: <MousePointer className="w-4 h-4" />, tooltip: 'أداة التحديد', category: 'basic' },
    { id: 'trendline', name: 'خط اتجاه', icon: <TrendingUp className="w-4 h-4" />, tooltip: 'رسم خط اتجاه', category: 'basic' },
    { id: 'horizontal', name: 'خط أفقي', icon: <Minus className="w-4 h-4" />, tooltip: 'رسم خط أفقي', category: 'basic' },
    { id: 'vertical', name: 'خط عمودي', icon: <div className="w-0.5 h-4 bg-current mx-auto" />, tooltip: 'رسم خط عمودي', category: 'basic' },
    { id: 'circle', name: 'دائرة', icon: <Circle className="w-4 h-4" />, tooltip: 'رسم دائرة', category: 'shapes' },
    { id: 'rectangle', name: 'مستطيل', icon: <Square className="w-4 h-4" />, tooltip: 'رسم مستطيل', category: 'shapes' },
    { id: 'text', name: 'نص', icon: <Type className="w-4 h-4" />, tooltip: 'إضافة نص', category: 'text' },
    { id: 'freehand', name: 'رسم حر', icon: <Pen className="w-4 h-4" />, tooltip: 'رسم حر', category: 'advanced' },
    { id: 'fibonacci', name: 'فيبوناتشي', icon: <div className="w-4 h-4 text-lg font-bold">F</div>, tooltip: 'مستويات فيبوناتشي', category: 'advanced' },
    { id: 'pitchfork', name: 'شوكة', icon: <div className="w-4 h-4">Y</div>, tooltip: 'شوكة أندروز', category: 'advanced' },
]

export const DrawingTools: React.FC<DrawingToolsProps> = ({
    activeTool,
    onToolSelect,
    chart,
    chartKey,
    isChartReady,
}) => {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [drawings, setDrawings] = useState<any[]>([])

    const handleToolSelect = (toolId: string) => {
        onToolSelect(toolId)
        console.log('[DrawingTools] Selected tool:', toolId)
    }

    const handleClearAll = () => {
        if (window.confirm('هل تريد حذف جميع الرسومات؟')) {
            setDrawings([])
            console.log('[DrawingTools] Cleared all drawings')
        }
    }

    const handleResetTool = () => {
        handleToolSelect('cursor')
    }

    const basicTools = tools.filter(t => t.category === 'basic')
    const shapeTools = tools.filter(t => t.category === 'shapes')
    const textTools = tools.filter(t => t.category === 'text')
    const advancedTools = tools.filter(t => t.category === 'advanced')

    if (isCollapsed) {
        return (
            <div className="flex flex-col">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => setIsCollapsed(false)}
                                className="p-3 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg shadow-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
                            >
                                <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                            <p>إظهار أدوات الرسم</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {/* Quick active tool indicator */}
                {activeTool !== 'cursor' && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => setIsCollapsed(false)}
                                    className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg shadow-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all duration-200"
                                >
                                    {tools.find(t => t.id === activeTool)?.icon}
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                                <p>الأداة النشطة: {tools.find(t => t.id === activeTool)?.name}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
        )
    }

    return (
        <TooltipProvider>
            <div className="flex flex-col bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-slate-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-2">
                        <Pen className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            أدوات الرسم
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        {activeTool !== 'cursor' && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={handleResetTool}
                                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-gray-700 rounded transition-colors"
                                        title="إعادة للتحديد"
                                    >
                                        <X className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                    <p>إعادة للتحديد</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => setIsCollapsed(true)}
                                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-gray-700 rounded transition-colors"
                                    title="إخفاء"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                <p>إخفاء</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>

                {/* Tools */}
                <div className="flex-1 flex flex-col gap-2 p-2 overflow-y-auto max-h-[calc(100vh-300px)]">
                    {/* Basic Tools */}
                    <div className="space-y-1">
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 px-1.5 py-1">
                            الأدوات الأساسية
                        </div>
                        {basicTools.map((tool) => (
                            <Tooltip key={tool.id}>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => handleToolSelect(tool.id)}
                                        className={`w-full p-2.5 rounded-lg transition-all duration-200 flex items-center justify-center ${activeTool === tool.id
                                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-700 hover:scale-105'
                                            }`}
                                    >
                                        {tool.icon}
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                    <p>{tool.tooltip}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </div>

                    {/* Shape Tools */}
                    <div className="space-y-1">
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 px-1.5 py-1">
                            الأشكال
                        </div>
                        {shapeTools.map((tool) => (
                            <Tooltip key={tool.id}>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => handleToolSelect(tool.id)}
                                        className={`w-full p-2.5 rounded-lg transition-all duration-200 flex items-center justify-center ${activeTool === tool.id
                                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-700 hover:scale-105'
                                            }`}
                                    >
                                        {tool.icon}
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                    <p>{tool.tooltip}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                        {textTools.map((tool) => (
                            <Tooltip key={tool.id}>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => handleToolSelect(tool.id)}
                                        className={`w-full p-2.5 rounded-lg transition-all duration-200 flex items-center justify-center ${activeTool === tool.id
                                                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-105'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-700 hover:scale-105'
                                            }`}
                                    >
                                        {tool.icon}
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                    <p>{tool.tooltip}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </div>

                    {/* Advanced Tools */}
                    <div className="space-y-1">
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 px-1.5 py-1">
                            أدوات متقدمة
                        </div>
                        {advancedTools.map((tool) => (
                            <Tooltip key={tool.id}>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => handleToolSelect(tool.id)}
                                        className={`w-full p-2.5 rounded-lg transition-all duration-200 flex items-center justify-center ${activeTool === tool.id
                                                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30 scale-105'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-700 hover:scale-105'
                                            }`}
                                    >
                                        {tool.icon}
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                    <p>{tool.tooltip}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-200 dark:border-gray-700 my-2" />

                    {/* Clear All */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={handleClearAll}
                                className="w-full p-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105"
                                disabled={drawings.length === 0}
                            >
                                <Trash2 className="w-4 h-4" />
                                <span className="text-xs font-medium">حذف الكل</span>
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                            <p>حذف جميع الرسومات</p>
                        </TooltipContent>
                    </Tooltip>
                </div>

                {/* Footer - Drawing Count */}
                {drawings.length > 0 && (
                    <div className="p-2 border-t border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/50 text-center">
                        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                            {drawings.length} رسم
                        </span>
                    </div>
                )}
            </div>
        </TooltipProvider>
    )
}