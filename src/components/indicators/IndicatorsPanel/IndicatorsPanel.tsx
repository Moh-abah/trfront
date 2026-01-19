//@ts-nocheck



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
    onIndicatorUpdate?: (name: string, params: any) => void
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
    onIndicatorUpdate,
    onIndicatorRemove,

    onIndicatorToggle,
    
    symbol = "",
    onIndicatorsChange,
    compact = false,
    activeIndicators, 
}) => {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null)
    const [showPresets, setShowPresets] = useState(false)

    // 🔥 التعديل: نأخذ فقط ما نحتاجه من الـ Store للمكتبة (Favorites, etc)
    // وأزلنا activeIndicators, removeIndicator, updateIndicator من هنا
    const {
        addIndicator,
        removeIndicator,
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

            // ✅ 1. تعريف البيانات الأساسية المطلوبة للباك إند (مؤخراً عن شرط التعديل)
            const configToSend = {
                name: indicatorConfig.name,
                type: indicatorConfig.type,
                params: indicatorConfig.params || {},
            };

            // ✅ 2. حالة التعديل (Edit)
            if (isEditing) {
                chartWebSocketService.updateIndicator(symbol, configToSend.name, configToSend.params);

                // إخبار الـ Page بأن التعديل تم (لتحديث الـ Store إذا لزم الأمر)
                onIndicatorUpdate?.(configToSend.name, configToSend.params);

                toast.success(`تم تعديل ${indicatorConfig.displayName || indicatorConfig.name}`);
            }
            // ✅ 3. حالة الإضافة الجديدة (Add)
            else {
                const fullConfig = {
                    ...configToSend,
                    id: indicatorConfig.id || `temp_${Date.now()}`,
                    displayName: indicatorConfig.displayName || indicatorConfig.name,
                    color: indicatorConfig.color || "#2962FF",
                    seriesType: indicatorConfig.seriesType || "line",
                    overlay: indicatorConfig.overlay || false,
                    lineWidth: indicatorConfig.lineWidth || 2,
                };

                // إرسال عبر WebSocket
                chartWebSocketService.addIndicator(symbol, fullConfig);

                // إضافة مؤقت (loading) للواجهة
                const tempIndicator: ActiveIndicator = {
                    id: fullConfig.id,
                    name: fullConfig.name,
                    displayName: fullConfig.displayName,
                    parameters: fullConfig.params,
                    color: fullConfig.color,
                    visible: true,
                    seriesType: fullConfig.seriesType,
                    lineWidth: fullConfig.lineWidth,
                    loading: true,
                    isTemp: true,
                };

                addIndicator(tempIndicator, chartId);
                onIndicatorAdd?.(tempIndicator);

                toast.success(`جاري إضافة ${fullConfig.displayName}`);
            }
        } catch (error: any) {
            console.error("❌ Error in handleAddIndicator:", error);
            toast.error(`فشلت العملية: ${error.message}`);
        }
    };



    // ✅ إضافة دالة التعديل
    // ✅ الدالة المصححة: دالة التعديل
    const handleEditIndicator = (activeIndicator: any) => {
        // 1. البحث عن التعريف الكامل للمؤشر في المكتبة (لجلب شكل الحقول)
        const libraryIndicator = indicatorsLibrary.indicators.find(
            (lib) => lib.name === activeIndicator.name || lib.id === activeIndicator.id
        );

        if (!libraryIndicator) {
            console.error("لم يتم العثور على المؤشر في المكتبة:", activeIndicator.name);
            toast.error("تعذر العثور على تعريف المؤشر");
            return;
        }

        // 2. بناء كائن التعديل (نبدأ بالتعريف الكامل من المكتبة، ونعدل القيم فقط)
        const editIndicator = {
            ...libraryIndicator, // ✅ أهم سطر: ينسخ تعريف الحقول (parameters array) والفئة والنوع

            id: activeIndicator.id,

            // ⚠️ دمج القيم: الافتراضيات من المكتبة + القيم الحالية من المستخدم (تكتب فوق الافتراضيات)
            defaultParameters: {
                ...libraryIndicator.defaultParameters,
                ...(activeIndicator.parameters || {})
            },

            // تحديث القيم المرئية (اللون والسمك) بناءً على القيم الحالية
            defaultColor: activeIndicator.color || libraryIndicator.defaultColor,
            defaultLineWidth: activeIndicator.lineWidth || libraryIndicator.defaultLineWidth,

            // بناء backendConfig للإرسال الصحيح
            backendConfig: {
                ...libraryIndicator.backendConfig,
                params: {
                    ...libraryIndicator.backendConfig.params,
                    ...(activeIndicator.parameters || {})
                }
            }
        };

        console.log("✅ Edit Indicator Prepared:", editIndicator);

        setSelectedIndicator(editIndicator as Indicator);
        setIsEditing(true);
        setIsFormOpen(true);
    };
    const handleRemoveIndicator = async (indicatorId: string) => {
        try {
            if (!symbol) {
                toast.error("الرمز غير محدد");
                return;
            }

            // إيجاد المؤشر في القائمة النشطة للحصول على اسمه الحقيقي
            const activeIndicator = currentIndicators.find(ind => ind.id === indicatorId);
            if (!activeIndicator) {
                toast.error("لم يتم العثور على المؤشر");
                return;
            }

            // ✅ أولاً: إشعار الواجهة بحذف المؤشر (لإزالته من القائمة فوراً)
            if (onIndicatorRemove) {
                onIndicatorRemove(indicatorId);
            } else {
                // إذا لم يكن هناك callback، نحذف محلياً من الـ store
                removeIndicator(indicatorId, chartId);
            }

            // ✅ ثانياً: إرسال طلب الحذف إلى الخادم
            // ⚠️ **التعديل المهم هنا**: نستخدم activeIndicator.name وليس indicatorId
            // لأن الباكيند يتوقع indicator_name (اسم المؤشر) وليس المعرف
            chartWebSocketService.removeIndicator(symbol, activeIndicator.name);

            // ✅ ثالثاً: عرض رسالة نجاح
            toast.success(`تم حذف ${activeIndicator.displayName || activeIndicator.name}`);

        } catch (error: any) {
            console.error("❌ Error in handleRemoveIndicator:", error);
            toast.error(`فشل حذف المؤشر: ${error.message}`);
        }
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
        <div className={`flex flex-col h-full bg-background border border-border rounded-lg shadow-lg overflow-hidden`}>
            {/* رأس اللوحة */}
            <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1.5 hover:bg-accent rounded-md text-muted-foreground transition-colors"
                    >
                        {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>
                    <div className="flex items-baseline gap-2">
                        <h3 className="font-bold text-foreground text-sm">المؤشرات الفنية</h3>
                        <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {currentIndicators.length}
                        </span>
                    </div>
                </div>
                <div className="flex items-center space-x-1 rtl:space-x-reverse">
                    {!compact && (
                        <div className="flex items-center border-l border-r border-border px-1 mx-1">
                            <button
                                onClick={handleSaveConfig}
                                className="p-1.5 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors"
                                title="حفظ الإعدادات"
                            >
                                <Save className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleLoadConfig}
                                className="p-1.5 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors"
                                title="تحميل الإعدادات"
                            >
                                <Download className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleExportConfig}
                                className="p-1.5 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors"
                                title="تصدير الإعدادات"
                            >
                                <Upload className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium rounded-md shadow-sm transition-colors"
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
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-input rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
                                />
                                <div className="absolute left-3 top-2.5 text-muted-foreground pointer-events-none">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                </div>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                <button
                                    onClick={() => setSelectedCategory("all")}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${selectedCategory === "all"
                                        ? "bg-primary/20 text-primary ring-1 ring-primary/30"
                                        : "bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                        }`}
                                >
                                    الكل
                                </button>
                                {indicatorsLibrary.categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${selectedCategory === category.id
                                            ? "bg-primary/20 text-primary ring-1 ring-primary/30"
                                            : "bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                المؤشرات المفعلة
                            </h4>
                            {currentIndicators.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <div className="p-3 bg-card rounded-full mb-3">
                                        <Settings className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <p className="text-sm font-medium text-muted-foreground">لا توجد مؤشرات مفعلة</p>
                                    <p className="text-xs text-muted-foreground/70 mt-1 max-w-[200px]">ابدأ بإضافة مؤشر من المكتبة لتحليل الرسم البياني</p>

                                    {!compact && (
                                        <button
                                            onClick={() => setShowPresets(!showPresets)}
                                            className="mt-4 flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 rounded-md transition-colors"
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
                                            className={`group flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${indicator.visible
                                                ? 'bg-primary/5 border-primary/30'
                                                : 'bg-card/50 border-border opacity-70'
                                                }`}
                                        >
                                            {/* المعلومات (الاسم + النوع + التحميل) */}
                                            <div className="flex items-center gap-3 min-w-0">
                                                {/* نقطة ملونة */}
                                                <div
                                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                                    style={{ backgroundColor: indicator.color || 'var(--color-primary)' }}
                                                />

                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-sm text-foreground truncate">
                                                            {indicator.displayName || indicator.name}
                                                        </span>
                                                        {indicator.loading && (
                                                            <Loader2 className="w-3 h-3 text-primary animate-spin shrink-0" />
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground truncate">
                                                        {indicator.type} {indicator.parameters ? `(${JSON.stringify(indicator.parameters)})` : ''}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* أزرار التحكم */}
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {/* زر التفعيل/الإلغاء */}
                                                <button
                                                    onClick={() => onIndicatorToggle?.(indicator.id, !indicator.visible)}
                                                    className={`p-1.5 rounded-md transition-colors ${indicator.visible
                                                        ? 'text-primary bg-primary/10 hover:bg-primary/20'
                                                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                                        }`}
                                                    title={indicator.visible ? "إخفاء المؤشر" : "إظهار المؤشر"}
                                                >
                                                    {indicator.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                </button>

                                                {/* زر التعديل */}
                                                <button
                                                    onClick={() => handleEditIndicator(indicator)}
                                                    className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                                    title="تعديل المؤشر"
                                                >
                                                    <Settings className="w-4 h-4" />
                                                </button>

                                                {/* زر الحذف */}
                                                <button
                                                    onClick={() => handleRemoveIndicator(indicator.id)}
                                                    className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
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
                            <div className="space-y-3 pt-4 border-t border-border/50">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    الإعدادات المسبقة
                                </h4>
                                <div className="grid grid-cols-1 gap-2">
                                    {Object.entries(indicatorsLibrary.presets).map(([name, preset]) => (
                                        <button
                                            key={name}
                                            onClick={() => handleApplyPreset(name)}
                                            className="group p-3 border border-border rounded-lg hover:border-primary hover:bg-primary/5 text-left transition-all bg-card"
                                        >
                                            <div className="font-medium text-sm text-foreground group-hover:text-primary">
                                                {name}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground mt-0.5">
                                                {preset.length} مؤشر مضمن
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* معاينة المؤشرات (المكتبة) */}
                        {!compact && filteredIndicators.length > 0 && (
                            <div className="space-y-3 pt-4 border-t border-border/50">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
                        setIsEditing(false);
                        setIsFormOpen(false)
                        setSelectedIndicator(null)
                    }}
                    onSubmit={handleAddIndicator}
                    isEditMode={isEditing}
                />
            )}
        </div>
    )
}