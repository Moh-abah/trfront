
// @ts-nocheck

"use client"

import type React from "react"
import { useState } from "react"
import { Plus, Settings, ChevronDown, ChevronUp, Save, Download, Upload, Filter, Eye, EyeOff, Trash2, Loader2 } from "lucide-react"
import { IndicatorPreview } from "./IndicatorPreview"
import { IndicatorForm } from "../../forms/IndicatorForm/IndicatorForm"
import { indicatorsLibrary } from "@/lib/charts/data/indicators-library"
import { useIndicatorStore } from "@/stores/indicator.store"
import type { ActiveIndicator, Indicator } from "@/lib/charts/types/indicator"
import { toast } from "react-hot-toast"
import { chartWebSocketService } from "@/services/api/chart-websocket.service"

interface IndicatorsPanelProps {
    chartId?: string
    onIndicatorAdd?: (indicator: ActiveIndicator) => void
    onIndicatorRemove?: (indicatorId: string) => void
    onIndicatorUpdate?: (indicatorId: string, updates: Partial<ActiveIndicator>) => void
    onIndicatorsChange?: (indicators: ActiveIndicator[]) => void

  
    activeIndicators: Array<{
        id: string
        name: string
        displayName?: string
        type: string
        visible: boolean
        color?: string
        loading?: boolean
        parameters?: any
    }>
    onIndicatorToggle?: (id: string, isVisible: boolean) => void

    compact?: boolean
    symbol: string
}

export const IndicatorsPanel: React.FC<IndicatorsPanelProps> = ({
    chartId = "default",
    onIndicatorAdd,
    onIndicatorRemove,
    onIndicatorToggle,
    symbol = "",
    onIndicatorsChange,
    compact = false,
    activeIndicators, 
}) => {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null)
    const [showPresets, setShowPresets] = useState(false)

    // 🔥 التعديل: نأخذ فقط ما نحتاجه من الـ Store للمكتبة (Favorites, etc)
    // وأزلنا activeIndicators, removeIndicator, updateIndicator من هنا
    const {
        addIndicator,
        favorites,
        toggleFavorite,
        saveConfig,
        loadConfig,
        applyPreset,
    } = useIndicatorStore()

    const filteredIndicators = indicatorsLibrary.indicators.filter((indicator) => {
        const matchesCategory = selectedCategory === "all" || indicator.category === selectedCategory
        const matchesSearch =
            indicator.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            indicator.description.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    // 🔥 التعديل: استخدام الـ Prop مباشرة بدلاً من الـ Store
    const currentIndicators = activeIndicators

    const handleAddIndicator = async (indicatorConfig: any) => {
        try {
            if (!symbol) {
                toast.error("الرمز غير محدد");
                return;
            }

            const configToSend = {
                id: indicatorConfig.id || `temp_${Date.now()}`,
                name: indicatorConfig.name,
                type: indicatorConfig.type,
                params: indicatorConfig.params || {},
                displayName: indicatorConfig.displayName || indicatorConfig.name,
                color: indicatorConfig.color || "#2962FF",
                seriesType: indicatorConfig.seriesType || "line",
                overlay: indicatorConfig.overlay || false,
                lineWidth: indicatorConfig.lineWidth || 2,
            };

            // إرسال عبر WebSocket
            chartWebSocketService.addIndicator(symbol, configToSend);

            // إضافة مؤقت (loading) للواجهة (نستخدم Store هنا فقط لإظهار اللودينج مؤقتاً)
            const tempIndicator: ActiveIndicator = {
                id: configToSend.id,
                name: indicatorConfig.name,
                displayName: indicatorConfig.displayName || indicatorConfig.name,
                parameters: indicatorConfig.frontendParameters || indicatorConfig.params || {},
                color: indicatorConfig.color || "#2962FF",
                visible: true,
                seriesType: indicatorConfig.seriesType || "line",
                lineWidth: indicatorConfig.lineWidth || 2,
                loading: true,
                isTemp: true,
            };

            addIndicator(tempIndicator, chartId);
            onIndicatorAdd?.(tempIndicator);

            toast.success(`جاري إضافة ${indicatorConfig.displayName || indicatorConfig.name}`);
        } catch (error: any) {
            console.error("❌ Error in handleAddIndicator:", error);
            toast.error(`فشل إضافة المؤشر: ${error.message}`);
        }
    };

    // 🔥 التعديل: تبسيط دالة الحذف لتعتمد فقط على الـ Prop
    const handleRemoveIndicator = (indicatorId: string) => {
        // لا نحتاج لتحديث الـ Store هنا لأن البيج سيتولى ذلك
        // ولا نحتاج لإرسال WebSocket هنا إذا كان البيج سيتولاه

        // نستدعي دالة الحذف من البيج
        onIndicatorRemove?.(indicatorId);

        toast.success("تم حذف المؤشر")
    }

    // 🔥 التعديل: تمت إزالة handleUpdateIndicator لأننا سنستخدم onIndicatorToggle مباشرة في الزر

    const handleApplyPreset = (presetName: string) => {
        const preset = indicatorsLibrary.presets[presetName]
        if (preset) {
            applyPreset(preset, chartId)
            toast.success(`تم تطبيق الإعداد المسبق: ${presetName}`)
        }
    }

    const handleSaveConfig = () => {
        saveConfig(chartId)
        toast.success("تم حفظ الإعدادات")
    }

    const handleLoadConfig = () => {
        loadConfig(chartId)
        toast.success("تم تحميل الإعدادات")
    }

    const handleExportConfig = () => {
        const config = currentIndicators
        const dataStr = JSON.stringify(config, null, 2)
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

        const exportFileDefaultName = `indicators-config-${chartId}-${Date.now()}.json`

        const linkElement = document.createElement("a")
        linkElement.setAttribute("href", dataUri)
        linkElement.setAttribute("download", exportFileDefaultName)
        linkElement.click()

        toast.success("تم تصدير الإعدادات")
    }

    return (
        <div
            className={`flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden`}
        >
            {/* رأس اللوحة */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-500 dark:text-gray-400 transition-colors"
                    >
                        {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>
                    <div className="flex items-baseline gap-2">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">المؤشرات الفنية</h3>
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {currentIndicators.length}
                        </span>
                    </div>
                </div>
                <div className="flex items-center space-x-1 rtl:space-x-reverse">
                    {!compact && (
                        <div className="flex items-center border-l border-r border-gray-200 dark:border-gray-700 px-1 mx-1">
                            <button
                                onClick={handleSaveConfig}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-500 dark:text-gray-400 transition-colors"
                                title="حفظ الإعدادات"
                            >
                                <Save className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleLoadConfig}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-500 dark:text-gray-400 transition-colors"
                                title="تحميل الإعدادات"
                            >
                                <Download className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleExportConfig}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-500 dark:text-gray-400 transition-colors"
                                title="تصدير الإعدادات"
                            >
                                <Upload className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md shadow-sm transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        {!compact && <span>إضافة مؤشر</span>}
                    </button>
                </div>
            </div>

            {!isCollapsed && (
                <>
                    {/* منطقة المحتوى القابلة للتمرير */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">

                        {/* شريط البحث والتصفية */}
                        <div className="space-y-3">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="بحث في المكتبة..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                                />
                                <div className="absolute left-3 top-2.5 text-gray-400 pointer-events-none">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                </div>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                <button
                                    onClick={() => setSelectedCategory("all")}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${selectedCategory === "all"
                                        ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800"
                                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                                        }`}
                                >
                                    الكل
                                </button>
                                {indicatorsLibrary.categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${selectedCategory === category.id
                                            ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800"
                                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                                            }`}
                                    >
                                        <span className="ml-1">{category.icon}</span>
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* قائمة المؤشرات النشطة */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                المؤشرات المفعلة
                            </h4>
                            {currentIndicators.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full mb-3">
                                        <Settings className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">لا توجد مؤشرات مفعلة</p>
                                    <p className="text-xs text-gray-400 mt-1 max-w-[200px]">ابدأ بإضافة مؤشر من المكتبة لتحليل الرسم البياني</p>

                                    {!compact && (
                                        <button
                                            onClick={() => setShowPresets(!showPresets)}
                                            className="mt-4 flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                                        >
                                            <Filter className="w-3.5 h-3.5" />
                                            تصفح الإعدادات المسبقة
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {currentIndicators.map((indicator) => (
                                        <div
                                            key={indicator.id}
                                            className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${indicator.visible
                                                ? 'bg-blue-50/30 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/50'
                                                : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 opacity-70'
                                                }`}
                                        >
                                            {/* المعلومات (الاسم + النوع + التحميل) */}
                                            <div className="flex items-center gap-3 min-w-0">
                                                {/* نقطة ملونة */}
                                                <div
                                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                                    style={{ backgroundColor: indicator.color || '#2962FF' }}
                                                />

                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                                            {indicator.displayName || indicator.name}
                                                        </span>
                                                        {indicator.loading && (
                                                            <Loader2 className="w-3 h-3 text-blue-500 animate-spin shrink-0" />
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                                                        {indicator.type} {indicator.parameters ? `(${JSON.stringify(indicator.parameters)})` : ''}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* أزرار التحكم */}
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {/* 🔥 التعديل: زر التفعيل/الإلغاء يستخدم onIndicatorToggle مباشرة */}
                                                <button
                                                    onClick={() => onIndicatorToggle?.(indicator.id, !indicator.visible)}
                                                    className={`p-1.5 rounded-md transition-colors ${indicator.visible
                                                        ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                                                        : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                        }`}
                                                    title={indicator.visible ? "إخفاء المؤشر" : "إظهار المؤشر"}
                                                >
                                                    {indicator.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                </button>

                                                {/* زر الحذف */}
                                                <button
                                                    onClick={() => handleRemoveIndicator(indicator.id)}
                                                    className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
                                                    title="حذف المؤشر"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* الإعدادات المسبقة */}
                        {showPresets && !compact && (
                            <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    الإعدادات المسبقة
                                </h4>
                                <div className="grid grid-cols-1 gap-2">
                                    {Object.entries(indicatorsLibrary.presets).map(([name, preset]) => (
                                        <button
                                            key={name}
                                            onClick={() => handleApplyPreset(name)}
                                            className="group p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 text-left transition-all"
                                        >
                                            <div className="font-medium text-sm text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                                {name}
                                            </div>
                                            <div className="text-[10px] text-gray-400 mt-0.5">
                                                {preset.length} مؤشر مضمن
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* معاينة المؤشرات (المكتبة) */}
                        {!compact && filteredIndicators.length > 0 && (
                            <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    مكتبة المؤشرات
                                </h4>
                                <div className="space-y-2 pb-4">
                                    {filteredIndicators.map((indicator) => (
                                        <IndicatorPreview
                                            key={indicator.id}
                                            indicator={indicator}
                                            onSelect={() => {
                                                setSelectedIndicator(indicator)
                                                setIsFormOpen(true)
                                            }}
                                            isFavorite={favorites.includes(indicator.id)}
                                            onToggleFavorite={() => toggleFavorite(indicator.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* نموذج إضافة المؤشر */}
            {isFormOpen && (
                <IndicatorForm
                    indicator={selectedIndicator}
                    onClose={() => {
                        setIsFormOpen(false)
                        setSelectedIndicator(null)
                    }}
                    onSubmit={handleAddIndicator}
                />
            )}
        </div>
    )
}