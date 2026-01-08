
// @ts-nocheck

'use client';

import React, { useState } from 'react';
import { Save, X, Copy, Trash2, Settings, Play, TestTube } from 'lucide-react';
import { TradingRule } from '@/lib/strategies/types/strategy';
import { ConditionBuilder } from './ConditionBuilder';
import { toast } from 'react-hot-toast';

interface RuleBuilderProps {
    rule: TradingRule;
    onChange: (rule: TradingRule) => void;
    onSave: () => void;
    onCancel: () => void;
    isEditing?: boolean;
}

export const RuleBuilder: React.FC<RuleBuilderProps> = ({
    rule,
    onChange,
    onSave,
    onCancel,
    isEditing = false,
}) => {
    const [activeSection, setActiveSection] = useState<'entry' | 'exit' | 'stop' | 'profit' | 'settings'>('entry');
    const [testResults, setTestResults] = useState<any>(null);

    const handleTestRule = async () => {
        // محاكاة اختبار القاعدة
        toast.loading('جاري اختبار القاعدة...');
        setTimeout(() => {
            setTestResults({
                totalTests: 1000,
                passedTests: 850,
                failedTests: 150,
                successRate: 85,
                sampleMatches: [
                    { date: '2024-01-01', matched: true, price: 150.25 },
                    { date: '2024-01-02', matched: false, price: 149.80 },
                    { date: '2024-01-03', matched: true, price: 152.10 },
                ],
            });
            toast.success('تم اختبار القاعدة بنجاح');
        }, 1500);
    };

    const handleDuplicateRule = () => {
        const duplicated = {
            ...rule,
            id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: `${rule.name} (نسخة)`,
        };
        onChange(duplicated);
        toast.success('تم نسخ القاعدة');
    };

    const renderSection = () => {
        switch (activeSection) {
            case 'entry':
                return (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900 dark:text-white">شرط الدخول</h4>
                            <button
                                type="button"
                                onClick={handleTestRule}
                                className="flex items-center space-x-1 px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                                <TestTube className="w-4 h-4" />
                                <span>اختبار الشرط</span>
                            </button>
                        </div>
                        <ConditionBuilder
                            initialCondition={rule.entryCondition}
                            onConditionChange={(condition) => onChange({ ...rule, entryCondition: condition })}
                        />
                    </div>
                );

            case 'exit':
                return (
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white">شرط الخروج</h4>
                        {rule.exitCondition ? (
                            <ConditionBuilder
                                initialCondition={rule.exitCondition}
                                onConditionChange={(condition) => onChange({ ...rule, exitCondition: condition })}
                            />
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <p>لا يوجد شرط خروج محدد</p>
                                <button
                                    type="button"
                                    onClick={() => onChange({
                                        ...rule,
                                        exitCondition: {
                                            id: `exit_${Date.now()}`,
                                            type: 'AND',
                                            leftOperand: { type: 'price', value: 'close', source: 'price' },
                                            operator: '<',
                                            rightOperand: { type: 'percentage', value: 2 },
                                        },
                                    })}
                                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    + إضافة شرط خروج
                                </button>
                            </div>
                        )}
                    </div>
                );

            case 'stop':
                return (
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white">وقف الخسارة</h4>
                        {rule.stopLoss ? (
                            <ConditionBuilder
                                initialCondition={rule.stopLoss}
                                onConditionChange={(condition) => onChange({ ...rule, stopLoss: condition })}
                            />
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            نسبة وقف الخسارة (%)
                                        </label>
                                        <input
                                            type="number"
                                            value={2}
                                            onChange={(e) => onChange({
                                                ...rule,
                                                stopLoss: {
                                                    id: `stop_${Date.now()}`,
                                                    type: 'AND',
                                                    leftOperand: { type: 'price', value: 'entry_price', source: 'price' },
                                                    operator: '<=',
                                                    rightOperand: { type: 'percentage', value: parseFloat(e.target.value) },
                                                },
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                            min="0.1"
                                            max="50"
                                            step="0.1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            نوع الوقف
                                        </label>
                                        <select
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                        >
                                            <option value="fixed">ثابت</option>
                                            <option value="trailing">تريلينج</option>
                                            <option value="atr">بناءً على ATR</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'profit':
                return (
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white">جني الأرباح</h4>
                        {rule.takeProfit ? (
                            <ConditionBuilder
                                initialCondition={rule.takeProfit}
                                onConditionChange={(condition) => onChange({ ...rule, takeProfit: condition })}
                            />
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            نسبة جني الأرباح (%)
                                        </label>
                                        <input
                                            type="number"
                                            value={4}
                                            onChange={(e) => onChange({
                                                ...rule,
                                                takeProfit: {
                                                    id: `profit_${Date.now()}`,
                                                    type: 'AND',
                                                    leftOperand: { type: 'price', value: 'entry_price', source: 'price' },
                                                    operator: '>=',
                                                    rightOperand: { type: 'percentage', value: parseFloat(e.target.value) },
                                                },
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                            min="0.1"
                                            max="100"
                                            step="0.1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            استراتيجية الجني
                                        </label>
                                        <select
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                        >
                                            <option value="fixed">ثابت</option>
                                            <option value="partial">جزئي</option>
                                            <option value="scaling">تدريجي</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'settings':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                اسم القاعدة *
                            </label>
                            <input
                                type="text"
                                value={rule.name}
                                onChange={(e) => onChange({ ...rule, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                الوصف
                            </label>
                            <textarea
                                value={rule.description || ''}
                                onChange={(e) => onChange({ ...rule, description: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 h-24"
                                placeholder="صف القاعدة وهدفها"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    حجم المركز (%)
                                </label>
                                <input
                                    type="number"
                                    value={(rule.positionSize || 0) * 100}
                                    onChange={(e) => onChange({ ...rule, positionSize: parseFloat(e.target.value) / 100 })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                    min="1"
                                    max="100"
                                    step="1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    أقصى عدد مراكز
                                </label>
                                <input
                                    type="number"
                                    value={rule.maxPosition || 1}
                                    onChange={(e) => onChange({ ...rule, maxPosition: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                    min="1"
                                    max="20"
                                    step="1"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    checked={rule.trailingStop || false}
                                    onChange={(e) => onChange({ ...rule, trailingStop: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 rounded"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    تفعيل تريلينج ستوب
                                </span>
                            </label>

                            {rule.trailingStop && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        مسافة التريلينج (%)
                                    </label>
                                    <input
                                        type="number"
                                        value={rule.trailingDistance || 1.5}
                                        onChange={(e) => onChange({ ...rule, trailingDistance: parseFloat(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                        min="0.1"
                                        max="10"
                                        step="0.1"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-4">
            {/* علامات التبويب */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex space-x-1">
                    {['entry', 'exit', 'stop', 'profit', 'settings'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveSection(tab as any)}
                            className={`px-4 py-2 font-medium text-sm ${activeSection === tab
                                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                                }`}
                        >
                            {tab === 'entry' && 'الدخول'}
                            {tab === 'exit' && 'الخروج'}
                            {tab === 'stop' && 'وقف الخسارة'}
                            {tab === 'profit' && 'جني الأرباح'}
                            {tab === 'settings' && 'الإعدادات'}
                        </button>
                    ))}
                </div>
            </div>

            {/* محتوى القسم النشط */}
            <div className="min-h-[300px]">
                {renderSection()}
            </div>

            {/* نتائج الاختبار */}
            {testResults && activeSection === 'entry' && (
                <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-gray-900 dark:text-white">نتائج الاختبار</h5>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${testResults.successRate >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                testResults.successRate >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                            {testResults.successRate}% نجاح
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                            <div className="text-gray-600 dark:text-gray-400">إجمالي الاختبارات</div>
                            <div className="text-xl font-bold">{testResults.totalTests.toLocaleString()}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-gray-600 dark:text-gray-400">ناجحة</div>
                            <div className="text-xl font-bold text-green-600">{testResults.passedTests.toLocaleString()}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-gray-600 dark:text-gray-400">فاشلة</div>
                            <div className="text-xl font-bold text-red-600">{testResults.failedTests.toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* أزرار الإجراء */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                    <button
                        type="button"
                        onClick={handleDuplicateRule}
                        className="flex items-center space-x-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                    >
                        <Copy className="w-4 h-4" />
                        <span>نسخ القاعدة</span>
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex items-center space-x-1 px-3 py-1.5 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                        <X className="w-4 h-4" />
                        <span>إلغاء</span>
                    </button>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        type="button"
                        onClick={onSave}
                        className="flex items-center space-x-1 px-4 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        <Save className="w-4 h-4" />
                        <span>{isEditing ? 'تحديث القاعدة' : 'حفظ القاعدة'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};