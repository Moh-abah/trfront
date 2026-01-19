
// @ts-nocheck

'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, RefreshCw } from 'lucide-react';
import { Indicator } from '@/lib/charts/types/indicator';
import { ParameterInputs } from './ParameterInputs';
import { indicatorsLibrary } from '@/lib/charts/data/indicators-library';
import { toast } from 'react-hot-toast';

interface IndicatorFormProps {
    indicator?: Indicator | null;
    onClose: () => void;
    onSubmit: (indicatorConfig: any) => void;
    isEditMode?: boolean;
}
interface ExtendedIndicator extends Indicator {
    backendConfig?: {
        name: string;
        type: string;
        params: Record<string, any>;
    };
}

export const IndicatorForm: React.FC<IndicatorFormProps> = ({
    indicator,
    onClose,
    onSubmit,
    isEditMode = false,
}) => {
  
    const [selectedIndicator, setSelectedIndicator] = useState<ExtendedIndicator | null>(indicator || null);
    const [parameters, setParameters] = useState<Record<string, any>>({});
    const [color, setColor] = useState('#2962FF');
    const [lineWidth, setLineWidth] = useState(2);

    useEffect(() => {
        if (selectedIndicator) {
            // تعيين المعلمات الافتراضية من المكتبة
            const defaultParams = selectedIndicator.defaultParameters || {};
            console.log('🔍 تعيين المعلمات الافتراضية للمؤشر:', selectedIndicator.name, defaultParams);

            setParameters(defaultParams);
            setColor(selectedIndicator.defaultColor || '#2962FF');

            if (selectedIndicator.seriesType === 'line' || selectedIndicator.seriesType === 'area') {
                setLineWidth(selectedIndicator.defaultLineWidth || 2);
            } else {
                setLineWidth(1);
            }
        }
    }, [selectedIndicator]);

    const handleIndicatorSelect = (indicator: Indicator) => {
        // التحويل إلى ExtendedIndicator عند الاختيار
        const extendedIndicator = indicator as ExtendedIndicator;
        setSelectedIndicator(extendedIndicator);
        setParameters(extendedIndicator.defaultParameters || {});
        setColor(extendedIndicator.defaultColor || '#2962FF');
        setLineWidth(extendedIndicator.defaultLineWidth || 2);
    };

    const handleParameterChange = (paramName: string, value: any) => {
        setParameters(prev => ({ ...prev, [paramName]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('🔹 زر submit انضغط');

        if (!selectedIndicator) {
            console.log('❌ لا يوجد selectedIndicator');
            toast.error('يرجى اختيار مؤشر أولاً');
            return;
        }

        // التحقق من وجود backendConfig
        if (!selectedIndicator.backendConfig) {
            console.error('❌ لا يوجد backendConfig للمؤشر:', selectedIndicator.name);
            toast.error('تكوين المؤشر غير مكتمل في النظام');
            return;
        }

        const backendConfig = selectedIndicator.backendConfig;

        // 🔥 أولا: سجل بالتفصيل ما يدخله المستخدم
        console.log('📝 === البيانات المدخلة من المستخدم ===');
        console.log('📝 المعلمات الخام:', parameters);
        console.log('📝 المعلمات JSON:', JSON.stringify(parameters, null, 2));

        // 🔥 ثانياً: سجل ما في المكتبة
        console.log('⚙️ === التكوين الأساسي من المكتبة ===');
        console.log('⚙️ backendConfig:', JSON.stringify(backendConfig, null, 2));

        // 🔥 ثالثاً: تحقق من كل معلمة على حدة
        console.log('🔍 === تحقق من كل معلمة ===');
        Object.entries(parameters).forEach(([key, value]) => {
            console.log(`🔍 ${key}: ${value} (مدخل) vs ${backendConfig.params[key]} (مكتبة)`);
        });

        // 🔥 رابعاً: نضمن أن القيم المدخلة هي التي تُرسل أولاً
        // أولوية للمستخدم، ثم القيم الافتراضية للمعاملات المفقودة
        const finalParams = {
            ...backendConfig.params, // القيم الافتراضية أولاً
            ...parameters,           // ثم القيم المدخلة (تكتب فوق الافتراضيات إذا اختلفت)
        };

        console.log('🔄 === المعلمات بعد الدمج (بأولوية المستخدم) ===');
        console.log('🔄 finalParams:', JSON.stringify(finalParams, null, 2));

        // 🔥 خامساً: تحقق نهائي أن القيم صحيحة
        console.log('✅ === تحقق نهائي ===');
        const expectedValues = ['period', 'source', 'overbought', 'oversold'];
        expectedValues.forEach(key => {
            if (finalParams[key] !== undefined) {
                console.log(`✅ ${key}: ${finalParams[key]} (${finalParams[key] === parameters[key] ? 'من المستخدم' : 'من المكتبة'})`);
            }
        });

        // إنشاء كائن التكوين النهائي للباك إند
        const indicatorConfig: any = {
            id: `temp_${Date.now()}`, // إضافة ID مؤقت
            name: backendConfig.name,
            type: backendConfig.type,
            displayName: selectedIndicator.displayName,
            params: finalParams, // استخدام params بدلاً من parameters
            color: color,
            seriesType: selectedIndicator.seriesType,
            overlay: selectedIndicator.overlay,
            category: selectedIndicator.category,

            // حفظ المعلمات الأصلية للعرض في الواجهة
            frontendParameters: parameters,

            // 🔥 إضافة تأكيد على أن البيانات من المستخدم
            userEnteredData: true,
            timestamp: new Date().toISOString(),
        };

        // إضافة سمك الخط فقط للمؤشرات الخطية
        if (selectedIndicator.seriesType === 'line' || selectedIndicator.seriesType === 'area') {
            indicatorConfig.lineWidth = lineWidth;
        }

        console.log('📤 === إرسال تكوين المؤشر للباك إند ===');
        console.log('📤 indicatorConfig:', JSON.stringify(indicatorConfig, null, 2));

        // 🔥 تحقق إضافي قبل الإرسال
        const userChangedKeys = Object.keys(parameters);
        const allKeys = Object.keys(finalParams);
        console.log(`📊 الإحصائيات: ${userChangedKeys.length}/${allKeys.length} معلمة تم تعديلها من المستخدم`);

        onSubmit(indicatorConfig);
        onClose();
    };

   


    const handleReset = () => {
        if (selectedIndicator) {
            const defaultParams = selectedIndicator.defaultParameters || {};
            console.log('🔄 إعادة تعيين المعلمات إلى:', defaultParams);
            setParameters(defaultParams);
            setColor(selectedIndicator.defaultColor || '#2962FF');
            setLineWidth(selectedIndicator.defaultLineWidth || 2);
        }
    };

    const colors = [
        '#2962FF', '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0',
        '#118AB2', '#EF476F', '#7209B7', '#F72585', '#3A0CA3'
    ];

    return (

 
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card text-card-foreground rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar animate-scale-in">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h3 className="text-xl font-semibold">
                        {isEditMode ? 'تعديل المؤشر' : 'إضافة مؤشر فني'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-accent rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* اختيار المؤشر (في حالة الإضافة فقط) */}
                    {!isEditMode && (
                        <div>
                            <label className="block text-sm font-medium mb-3 text-foreground">
                                اختر المؤشر
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto custom-scrollbar">
                                {indicatorsLibrary.indicators.map((indicator) => (
                                    <button
                                        key={indicator.id}
                                        type="button"
                                        onClick={() => handleIndicatorSelect(indicator)}
                                        className={`p-4 border rounded-lg text-left transition-all bg-card hover:bg-accent/10 ${selectedIndicator?.id === indicator.id
                                            ? 'border-primary bg-primary/10 ring-1 ring-primary'
                                            : 'border-border hover:border-primary/50'
                                            }`}
                                    >
                                        <div className="font-medium">
                                            {indicator.displayName}
                                        </div>
                                        <div className="text-sm text-muted-foreground mt-1">
                                            {indicator.description}
                                        </div>
                                        <div className="flex items-center space-x-2 mt-2">
                                            <span className="text-xs px-2 py-1 bg-muted rounded">
                                                {indicator.category}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded ${indicator.overlay
                                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                                                : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300'
                                                }`}>
                                                {indicator.overlay ? 'على السعر' : 'منفصل'}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedIndicator && (
                        <>
                            {/* معلومات المؤشر */}
                            <div className="bg-card border border-border rounded-lg p-4">
                                <h4 className="font-medium mb-3">تفاصيل المؤشر</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm text-muted-foreground">الاسم:</span>
                                        <p className="font-medium">{selectedIndicator.displayName}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-muted-foreground">النوع:</span>
                                        <p>
                                            {selectedIndicator.seriesType === 'line' ? 'خط' :
                                                selectedIndicator.seriesType === 'histogram' ? 'عمودي' :
                                                    selectedIndicator.seriesType === 'area' ? 'منطقة' :
                                                        selectedIndicator.seriesType === 'band' ? 'نطاق' : 'مخصص'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-muted-foreground">المكان:</span>
                                        <p>{selectedIndicator.overlay ? 'على الشارت الرئيسي' : 'لوحة مستقلة'}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-muted-foreground">الفئة:</span>
                                        <p>{selectedIndicator.category}</p>
                                    </div>
                                </div>
                            </div>

                            {/* اختيار اللون */}
                            <div>
                                <label className="block text-sm font-medium mb-3 text-foreground">
                                    اختر لون المؤشر
                                </label>
                                <div className="flex flex-wrap gap-3 mb-3">
                                    {colors.map((colorOption) => (
                                        <button
                                            key={colorOption}
                                            type="button"
                                            onClick={() => setColor(colorOption)}
                                            className={`w-10 h-10 rounded-lg border-4 transition-transform hover:scale-110 ${color === colorOption ? 'border-primary ring-2 ring-primary/50' : 'border-border'
                                                }`}
                                            style={{ backgroundColor: colorOption }}
                                            title={colorOption}
                                        />
                                    ))}
                                    <div className="relative">
                                        <input
                                            type="color"
                                            value={color}
                                            onChange={(e) => setColor(e.target.value)}
                                            className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-card"
                                        />
                                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap">
                                            لون مخصص
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    اللون المختار: <span style={{ color }} className="font-semibold">{color}</span>
                                </div>
                            </div>

                            {/* سمك الخط (للمؤشرات الخطية فقط) */}
                            {(selectedIndicator.seriesType === 'line' || selectedIndicator.seriesType === 'area') && (
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-foreground">
                                        سمك الخط
                                    </label>
                                    <div className="flex items-center space-x-4">
                                        <input
                                            type="range"
                                            min="1"
                                            max="5"
                                            step="0.5"
                                            value={lineWidth}
                                            onChange={(e) => setLineWidth(parseFloat(e.target.value))}
                                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                                        />
                                        <span className="text-sm font-medium">
                                            {lineWidth}px
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* إدخال المعلمات */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-medium text-foreground">
                                        معلمات المؤشر
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="flex items-center space-x-2 text-sm text-primary hover:text-primary/90 transition-colors"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        <span>إعادة تعيين</span>
                                    </button>
                                </div>
                                <ParameterInputs
                                    parameters={parameters}
                                    onChange={handleParameterChange}
                                    indicator={selectedIndicator}
                                />
                            </div>

                            {/* معاينة المؤشر */}
                            <div className="bg-card border border-border rounded-lg p-4">
                                <h4 className="font-medium mb-3">معاينة المؤشر</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-4">
                                        <div
                                            className="w-6 h-6 rounded"
                                            style={{
                                                backgroundColor: color,
                                                border: selectedIndicator.seriesType === 'line' ? `2px solid ${color}` : 'none'
                                            }}
                                        ></div>
                                        <div>
                                            <div className="font-medium">{selectedIndicator.displayName}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {selectedIndicator.description}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">النوع:</span>
                                            <span className="font-medium">
                                                {selectedIndicator.seriesType === 'line' ? 'خطي' :
                                                    selectedIndicator.seriesType === 'histogram' ? 'عمودي' :
                                                        selectedIndicator.seriesType === 'area' ? 'منطقة' : 'نطاق'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">الموقع:</span>
                                            <span className="font-medium">
                                                {selectedIndicator.overlay ? 'على الشارت' : 'لوحة مستقلة'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-sm">
                                        <div className="text-muted-foreground mb-1">المعلمات:</div>
                                        <div className="bg-background p-3 rounded border border-border custom-scrollbar">
                                            <pre className="text-xs overflow-x-auto">
                                                {JSON.stringify(parameters, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* أزرار الإجراء */}
                    <div className="flex justify-end space-x-3 pt-6 border-t border-border">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 border border-border text-foreground rounded-lg hover:bg-accent transition-colors"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={!selectedIndicator}
                            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                        >
                            <Save className="w-4 h-4" />
                            <span>{isEditMode ? 'حفظ التعديلات' : 'إضافة المؤشر'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};