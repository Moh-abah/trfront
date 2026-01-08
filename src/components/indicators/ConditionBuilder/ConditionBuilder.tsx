
// @ts-nocheck

'use client';

import React, { useState, useRef } from 'react';
import { Plus, Minus, Trash2, Copy, Settings, DragDrop, Eye, EyeOff } from 'lucide-react';
import {
    ConditionType,
    ComparisonOperator,
    RuleCondition,
    ConditionValue,
    ValueType
} from '@/lib/strategies/types/strategy';
import { availableIndicatorsForRules, comparisonOperators } from '@/lib/strategies/data/strategy-templates';

interface ConditionBuilderProps {
    initialCondition?: RuleCondition;
    onConditionBuilt: (condition: RuleCondition) => void;
    onConditionChange?: (condition: RuleCondition) => void;
    readOnly?: boolean;
}

export const ConditionBuilder: React.FC<ConditionBuilderProps> = ({
    initialCondition,
    onConditionBuilt,
    onConditionChange,
    readOnly = false,
}) => {
    const [rootCondition, setRootCondition] = useState<RuleCondition>(
        initialCondition || {
            id: 'root',
            type: ConditionType.AND,
            leftOperand: { type: ValueType.PRICE, value: 'close', source: 'price' },
            operator: ComparisonOperator.GREATER_THAN,
            rightOperand: { type: ValueType.NUMBER, value: 0 },
            children: [],
        }
    );

    const [draggedCondition, setDraggedCondition] = useState<string | null>(null);
    const dragStartRef = useRef<string | null>(null);
    const dragOverRef = useRef<string | null>(null);

    const handleAddCondition = (parentId: string, type: ConditionType = ConditionType.AND) => {
        const newCondition: RuleCondition = {
            id: `cond_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            leftOperand: { type: ValueType.PRICE, value: 'close', source: 'price' },
            operator: ComparisonOperator.GREATER_THAN,
            rightOperand: { type: ValueType.NUMBER, value: 0 },
        };

        const addCondition = (condition: RuleCondition): RuleCondition => {
            if (condition.id === parentId) {
                return {
                    ...condition,
                    children: [...(condition.children || []), newCondition],
                };
            }
            if (condition.children) {
                return {
                    ...condition,
                    children: condition.children.map(addCondition),
                };
            }
            return condition;
        };

        const updated = addCondition(rootCondition);
        setRootCondition(updated);
        onConditionChange?.(updated);
    };

    const handleRemoveCondition = (conditionId: string) => {
        const removeCondition = (condition: RuleCondition): RuleCondition | null => {
            if (condition.id === conditionId) return null;
            if (condition.children) {
                const filteredChildren = condition.children
                    .map(removeCondition)
                    .filter((c): c is RuleCondition => c !== null);
                return { ...condition, children: filteredChildren };
            }
            return condition;
        };

        const updated = removeCondition(rootCondition);
        if (updated) {
            setRootCondition(updated);
            onConditionChange?.(updated);
        }
    };

    const handleUpdateCondition = (conditionId: string, updates: Partial<RuleCondition>) => {
        const updateCondition = (condition: RuleCondition): RuleCondition => {
            if (condition.id === conditionId) {
                return { ...condition, ...updates };
            }
            if (condition.children) {
                return {
                    ...condition,
                    children: condition.children.map(updateCondition),
                };
            }
            return condition;
        };

        const updated = updateCondition(rootCondition);
        setRootCondition(updated);
        onConditionChange?.(updated);
    };

    const handleUpdateOperand = (
        conditionId: string,
        operand: 'leftOperand' | 'rightOperand',
        updates: Partial<ConditionValue>
    ) => {
        const updateCondition = (condition: RuleCondition): RuleCondition => {
            if (condition.id === conditionId) {
                return {
                    ...condition,
                    [operand]: { ...condition[operand], ...updates },
                };
            }
            if (condition.children) {
                return {
                    ...condition,
                    children: condition.children.map(updateCondition),
                };
            }
            return condition;
        };

        const updated = updateCondition(rootCondition);
        setRootCondition(updated);
        onConditionChange?.(updated);
    };

    const handleDragStart = (conditionId: string) => {
        dragStartRef.current = conditionId;
        setDraggedCondition(conditionId);
    };

    const handleDragOver = (conditionId: string) => {
        dragOverRef.current = conditionId;
    };

    const handleDragEnd = () => {
        if (dragStartRef.current && dragOverRef.current && dragStartRef.current !== dragOverRef.current) {
            // إعادة ترتيب الشروط
            const reorderConditions = (condition: RuleCondition): RuleCondition => {
                if (condition.children) {
                    const startIndex = condition.children.findIndex(c => c.id === dragStartRef.current);
                    const overIndex = condition.children.findIndex(c => c.id === dragOverRef.current);

                    if (startIndex !== -1 && overIndex !== -1) {
                        const newChildren = [...condition.children];
                        const [moved] = newChildren.splice(startIndex, 1);
                        newChildren.splice(overIndex, 0, moved);
                        return { ...condition, children: newChildren };
                    }

                    return {
                        ...condition,
                        children: condition.children.map(reorderConditions),
                    };
                }
                return condition;
            };

            const updated = reorderConditions(rootCondition);
            setRootCondition(updated);
            onConditionChange?.(updated);
        }

        dragStartRef.current = null;
        dragOverRef.current = null;
        setDraggedCondition(null);
    };

    const renderCondition = (condition: RuleCondition, depth: number = 0) => {
        const isRoot = depth === 0;
        const hasChildren = condition.children && condition.children.length > 0;

        return (
            <div
                key={condition.id}
                className={`relative ${!isRoot ? 'ml-8 mt-2' : ''}`}
                draggable={!readOnly}
                onDragStart={() => handleDragStart(condition.id)}
                onDragOver={(e) => {
                    e.preventDefault();
                    handleDragOver(condition.id);
                }}
                onDragEnd={handleDragEnd}
            >
                {/* خط التوصيل */}
                {!isRoot && (
                    <div className="absolute -left-4 top-1/2 w-4 h-px bg-gray-300 dark:bg-gray-600"></div>
                )}

                <div className={`border rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm ${draggedCondition === condition.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' : 'border-gray-200 dark:border-gray-700'
                    }`}>
                    {/* رأس الشرط */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                            {!readOnly && (
                                <div className="cursor-move text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                    <DragDrop className="w-4 h-4" />
                                </div>
                            )}
                            <select
                                value={condition.type}
                                onChange={(e) => handleUpdateCondition(condition.id, { type: e.target.value as ConditionType })}
                                disabled={readOnly}
                                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm font-medium"
                            >
                                <option value={ConditionType.AND}>AND (و)</option>
                                <option value={ConditionType.OR}>OR (أو)</option>
                                <option value={ConditionType.NOT}>NOT (ليس)</option>
                            </select>
                            {!isRoot && !readOnly && (
                                <button
                                    onClick={() => handleRemoveCondition(condition.id)}
                                    className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {!isRoot && hasChildren && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {condition.children?.length} شرط فرعي
                            </span>
                        )}
                    </div>

                    {/* محتوى الشرط */}
                    {!hasChildren ? (
                        <div className="grid grid-cols-12 gap-2 items-center">
                            {/* المعامل الأيسر */}
                            <div className="col-span-4">
                                <OperandInput
                                    operand={condition.leftOperand}
                                    onChange={(updates) => handleUpdateOperand(condition.id, 'leftOperand', updates)}
                                    readOnly={readOnly}
                                />
                            </div>

                            {/* عامل المقارنة */}
                            <div className="col-span-2">
                                <select
                                    value={condition.operator}
                                    onChange={(e) => handleUpdateCondition(condition.id, { operator: e.target.value as ComparisonOperator })}
                                    disabled={readOnly}
                                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
                                >
                                    {comparisonOperators.map(op => (
                                        <option key={op.value} value={op.value}>
                                            {op.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* المعامل الأيمن */}
                            <div className="col-span-4">
                                {condition.operator === ComparisonOperator.BETWEEN ||
                                    condition.operator === ComparisonOperator.OUTSIDE ? (
                                    <div className="space-y-2">
                                        {Array.isArray(condition.rightOperand) ? (
                                            condition.rightOperand.map((operand, index) => (
                                                <OperandInput
                                                    key={index}
                                                    operand={operand}
                                                    onChange={(updates) => {
                                                        const newOperands = [...condition.rightOperand as ConditionValue[]];
                                                        newOperands[index] = { ...operand, ...updates };
                                                        handleUpdateCondition(condition.id, { rightOperand: newOperands });
                                                    }}
                                                    readOnly={readOnly}
                                                />
                                            ))
                                        ) : (
                                            <>
                                                <OperandInput
                                                    operand={condition.rightOperand as ConditionValue}
                                                    onChange={(updates) => handleUpdateCondition(condition.id, {
                                                        rightOperand: [{ type: ValueType.NUMBER, value: 0 }, updates]
                                                    })}
                                                    readOnly={readOnly}
                                                />
                                                <OperandInput
                                                    operand={{ type: ValueType.NUMBER, value: 0 }}
                                                    onChange={(updates) => handleUpdateCondition(condition.id, {
                                                        rightOperand: [condition.rightOperand as ConditionValue, updates]
                                                    })}
                                                    readOnly={readOnly}
                                                />
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <OperandInput
                                        operand={condition.rightOperand as ConditionValue}
                                        onChange={(updates) => handleUpdateOperand(condition.id, 'rightOperand', updates)}
                                        readOnly={readOnly}
                                    />
                                )}
                            </div>

                            {/* أزرار الإجراء */}
                            <div className="col-span-2 flex justify-end space-x-1">
                                {!readOnly && (
                                    <>
                                        <button
                                            onClick={() => handleAddCondition(condition.id, ConditionType.AND)}
                                            className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                                            title="إضافة شرط فرعي"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                const cloned = JSON.parse(JSON.stringify(condition));
                                                cloned.id = `cond_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                                                handleAddCondition(condition.id, condition.type);
                                                handleUpdateCondition(cloned.id, cloned);
                                            }}
                                            className="p-1 text-green-500 hover:bg-green-50 dark:hover:bg-green-900 rounded"
                                            title="نسخ الشرط"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {condition.children?.map(child => renderCondition(child, depth + 1))}
                            {!readOnly && (
                                <div className="text-center">
                                    <button
                                        onClick={() => handleAddCondition(condition.id, ConditionType.AND)}
                                        className="px-3 py-1 text-sm text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-600"
                                    >
                                        + إضافة شرط جديد
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const handleBuildComplete = () => {
        onConditionBuilt(rootCondition);
    };

    return (
        <div className="space-y-4">
            {/* شريط الأدوات */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-center space-x-2">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        منشئ الشروط
                    </div>
                    <div className="flex items-center space-x-1 text-xs">
                        <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                            Drag & Drop
                        </div>
                        <div className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                            {countConditions(rootCondition)} شرط
                        </div>
                    </div>
                </div>

                {!readOnly && (
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => handleAddCondition('root', ConditionType.AND)}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            <Plus className="w-4 h-4" />
                            <span>إضافة شرط رئيسي</span>
                        </button>
                        <button
                            onClick={handleBuildComplete}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            <Settings className="w-4 h-4" />
                            <span>بناء الشرط</span>
                        </button>
                    </div>
                )}
            </div>

            {/* منطقة البناء */}
            <div className="min-h-[200px] border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4">
                {renderCondition(rootCondition)}
            </div>

            {/* المساعدة */}
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm">
                <div className="flex items-center space-x-2 mb-2">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">نصائح الاستخدام:</span>
                </div>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• اسحب وأفلت الشروط لإعادة ترتيبها</li>
                    <li>• استخدم AND/OR/NOT لبناء شروط معقدة</li>
                    <li>• انقر على + لإضافة شروط فرعية</li>
                    <li>• استخدم Cross Above/Below لاكتشاف التقاطعات</li>
                    <li>• احفظ القاعدة عند الانتهاء</li>
                </ul>
            </div>
        </div>
    );
};

const OperandInput: React.FC<{
    operand: ConditionValue;
    onChange: (updates: Partial<ConditionValue>) => void;
    readOnly?: boolean;
}> = ({ operand, onChange, readOnly }) => {
    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleTypeChange = (type: ValueType) => {
        let defaultValue: any;
        switch (type) {
            case ValueType.NUMBER: defaultValue = 0; break;
            case ValueType.PERCENTAGE: defaultValue = 0; break;
            case ValueType.PRICE: defaultValue = 'close'; break;
            case ValueType.INDICATOR: defaultValue = ''; break;
            case ValueType.STRING: defaultValue = ''; break;
            case ValueType.BOOLEAN: defaultValue = true; break;
            default: defaultValue = 0;
        }
        onChange({ type, value: defaultValue });
    };

    const renderValueInput = () => {
        switch (operand.type) {
            case ValueType.NUMBER:
            case ValueType.PERCENTAGE:
                return (
                    <input
                        type="number"
                        value={operand.value}
                        onChange={(e) => onChange({ value: parseFloat(e.target.value) })}
                        disabled={readOnly}
                        className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                        step={operand.type === ValueType.PERCENTAGE ? 0.1 : 1}
                    />
                );

            case ValueType.PRICE:
                return (
                    <select
                        value={operand.value}
                        onChange={(e) => onChange({ value: e.target.value })}
                        disabled={readOnly}
                        className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    >
                        <option value="open">سعر الفتح</option>
                        <option value="high">أعلى سعر</option>
                        <option value="low">أقل سعر</option>
                        <option value="close">سعر الإغلاق</option>
                        <option value="volume">الحجم</option>
                    </select>
                );

            case ValueType.INDICATOR:
                return (
                    <div className="space-y-2">
                        <select
                            value={operand.indicatorId || ''}
                            onChange={(e) => onChange({ indicatorId: e.target.value, source: 'indicator' })}
                            disabled={readOnly}
                            className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                        >
                            <option value="">اختر مؤشر...</option>
                            {availableIndicatorsForRules.map(indicator => (
                                <option key={indicator.id} value={indicator.id}>
                                    {indicator.name}
                                </option>
                            ))}
                        </select>

                        {operand.indicatorId && (
                            <select
                                value={operand.parameter || ''}
                                onChange={(e) => onChange({ parameter: e.target.value })}
                                disabled={readOnly}
                                className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                            >
                                <option value="">اختر الحقل...</option>
                                {availableIndicatorsForRules
                                    .find(i => i.id === operand.indicatorId)
                                    ?.fields.map(field => (
                                        <option key={field} value={field}>
                                            {field}
                                        </option>
                                    ))}
                            </select>
                        )}
                    </div>
                );

            case ValueType.STRING:
                return (
                    <input
                        type="text"
                        value={operand.value}
                        onChange={(e) => onChange({ value: e.target.value })}
                        disabled={readOnly}
                        className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    />
                );

            case ValueType.BOOLEAN:
                return (
                    <select
                        value={operand.value ? 'true' : 'false'}
                        onChange={(e) => onChange({ value: e.target.value === 'true' })}
                        disabled={readOnly}
                        className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    >
                        <option value="true">صحيح</option>
                        <option value="false">خطأ</option>
                    </select>
                );

            default:
                return null;
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center space-x-2">
                <select
                    value={operand.type}
                    onChange={(e) => handleTypeChange(e.target.value as ValueType)}
                    disabled={readOnly}
                    className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
                >
                    <option value={ValueType.NUMBER}>رقم</option>
                    <option value={ValueType.PERCENTAGE}>نسبة مئوية</option>
                    <option value={ValueType.PRICE}>سعر</option>
                    <option value={ValueType.INDICATOR}>مؤشر</option>
                    <option value={ValueType.STRING}>نص</option>
                    <option value={ValueType.BOOLEAN}>منطقي</option>
                </select>

                {!readOnly && (
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title="إعدادات متقدمة"
                    >
                        {showAdvanced ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                )}
            </div>

            {renderValueInput()}

            {showAdvanced && (
                <div className="mt-2 p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">المصدر:</div>
                    <select
                        value={operand.source || 'price'}
                        onChange={(e) => onChange({ source: e.target.value })}
                        disabled={readOnly}
                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    >
                        <option value="price">السعر</option>
                        <option value="indicator">مؤشر</option>
                        <option value="custom">مخصص</option>
                    </select>
                </div>
            )}
        </div>
    );
};

const countConditions = (condition: RuleCondition): number => {
    let count = 1;
    if (condition.children) {
        condition.children.forEach(child => {
            count += countConditions(child);
        });
    }
    return count;
};