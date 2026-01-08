// 'use client';

// import React, { useState, useEffect } from 'react';
// import { X, Save, Copy, Trash2, Download, Upload, Play, TestTube, Eye, EyeOff } from 'lucide-react';
// import { ConditionBuilder } from '@/components/indicators/ConditionBuilder/ConditionBuilder';
// import { RuleBuilder } from '@/components/indicators/ConditionBuilder/RuleBuilder';
// import { strategyTemplates, strategyCategories } from '@/lib/strategies/data/strategy-templates';
// import { Strategy, TradingRule } from '@/lib/strategies/types/strategy';
// import { toast } from 'react-hot-toast';

// interface StrategyFormProps {
//     strategy?: Strategy | null;
//     onClose: () => void;
//     onSubmit: (strategy: Strategy) => void;
//     onTest?: (strategy: Strategy) => void;
//     onSaveTemplate?: (strategy: Strategy) => void;
//     mode?: 'create' | 'edit' | 'clone';
// }

// export const StrategyForm: React.FC<StrategyFormProps> = ({
//     strategy,
//     onClose,
//     onSubmit,
//     onTest,
//     onSaveTemplate,
//     mode = 'create',
// }) => {
//     const [formData, setFormData] = useState<Partial<Strategy>>({
//         name: '',
//         description: '',
//         category: 'trend',
//         symbols: ['AAPL'],
//         timeframe: '1d',
//         rules: [],
//         parameters: {},
//         initialCapital: 10000,
//         commission: 0.001,
//         slippage: 0.001,
//         isActive: true,
//         isPublic: false,
//         tags: [],
//     });

//     const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
//     const [activeTab, setActiveTab] = useState<'basic' | 'rules' | 'parameters' | 'advanced'>('basic');
//     const [newRule, setNewRule] = useState<TradingRule | null>(null);
//     const [editingRuleIndex, setEditingRuleIndex] = useState<number | null>(null);

//     useEffect(() => {
//         if (strategy) {
//             setFormData(strategy);
//         }
//     }, [strategy]);

//     const handleInputChange = (field: keyof Strategy, value: any) => {
//         setFormData(prev => ({ ...prev, [field]: value }));
//     };

//     const handleAddRule = (rule: TradingRule) => {
//         const rules = [...(formData.rules || [])];
//         if (editingRuleIndex !== null) {
//             rules[editingRuleIndex] = rule;
//             setEditingRuleIndex(null);
//         } else {
//             rules.push(rule);
//         }
//         handleInputChange('rules', rules);
//         setNewRule(null);
//         toast.success(editingRuleIndex !== null ? 'تم تحديث القاعدة' : 'تمت إضافة القاعدة');
//     };

//     const handleEditRule = (index: number) => {
//         setNewRule(formData.rules?.[index] || null);
//         setEditingRuleIndex(index);
//     };

//     const handleDeleteRule = (index: number) => {
//         const rules = [...(formData.rules || [])];
//         rules.splice(index, 1);
//         handleInputChange('rules', rules);
//         toast.success('تم حذف القاعدة');
//     };

//     const handleApplyTemplate = (templateId: string) => {
//         const template = strategyTemplates.find(t => t.id === templateId);
//         if (template) {
//             setFormData(prev => ({
//                 ...prev,
//                 name: template.name,
//                 description: template.description,
//                 category: template.category,
//                 rules: template.rules,
//                 parameters: template.parameters,
//             }));
//             setSelectedTemplate(templateId);
//             toast.success(`تم تطبيق قالب ${template.name}`);
//         }
//     };

//     const handleAddSymbol = (symbol: string) => {
//         const symbols = [...(formData.symbols || [])];
//         if (!symbols.includes(symbol.toUpperCase())) {
//             symbols.push(symbol.toUpperCase());
//             handleInputChange('symbols', symbols);
//         }
//     };

//     const handleRemoveSymbol = (symbol: string) => {
//         const symbols = (formData.symbols || []).filter(s => s !== symbol);
//         handleInputChange('symbols', symbols);
//     };

//     const handleSubmit = (e: React.FormEvent) => {
//         e.preventDefault();

//         if (!formData.name || !formData.description || !formData.rules?.length) {
//             toast.error('الرجاء ملء جميع الحقول المطلوبة');
//             return;
//         }

//         const now = new Date();
//         const newStrategy: Strategy = {
//             id: strategy?.id || `strategy_${Date.now()}`,
//             name: formData.name!,
//             description: formData.description!,
//             version: strategy?.version || '1.0.0',
//             author: strategy?.author || 'المستخدم',
//             category: formData.category || 'trend',
//             symbols: formData.symbols || [],
//             timeframe: formData.timeframe || '1d',
//             rules: formData.rules || [],
//             parameters: formData.parameters || {},
//             initialCapital: formData.initialCapital || 10000,
//             commission: formData.commission || 0.001,
//             slippage: formData.slippage || 0.001,
//             createdAt: strategy?.createdAt || now,
//             updatedAt: now,
//             isActive: formData.isActive ?? true,
//             isPublic: formData.isPublic ?? false,
//             tags: formData.tags || [],
//         };

//         onSubmit(newStrategy);
//         toast.success(mode === 'edit' ? 'تم تحديث الاستراتيجية' : 'تم إنشاء الاستراتيجية');
//     };

//     const handleTestStrategy = () => {
//         const now = new Date();
//         const testStrategy: Strategy = {
//             id: `test_${Date.now()}`,
//             name: formData.name || 'اختبار',
//             description: formData.description || '',
//             version: '1.0.0',
//             author: 'المستخدم',
//             category: formData.category || 'trend',
//             symbols: formData.symbols || ['AAPL'],
//             timeframe: formData.timeframe || '1d',
//             rules: formData.rules || [],
//             parameters: formData.parameters || {},
//             initialCapital: formData.initialCapital || 10000,
//             commission: formData.commission || 0.001,
//             slippage: formData.slippage || 0.001,
//             createdAt: now,
//             updatedAt: now,
//             isActive: true,
//             isPublic: false,
//             tags: ['test'],
//         };

//         onTest?.(testStrategy);
//     };

//     const handleExportStrategy = () => {
//         const dataStr = JSON.stringify(formData, null, 2);
//         const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
//         const exportFileDefaultName = `strategy-${formData.name || 'export'}-${Date.now()}.json`;

//         const linkElement = document.createElement('a');
//         linkElement.setAttribute('href', dataUri);
//         linkElement.setAttribute('download', exportFileDefaultName);
//         linkElement.click();

//         toast.success('تم تصدير الاستراتيجية');
//     };

//     const handleImportStrategy = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const file = event.target.files?.[0];
//         if (!file) return;

//         const reader = new FileReader();
//         reader.onload = (e) => {
//             try {
//                 const imported = JSON.parse(e.target?.result as string);
//                 setFormData(imported);
//                 toast.success('تم استيراد الاستراتيجية');
//             } catch (error) {
//                 toast.error('خطأ في قراءة الملف');
//             }
//         };
//         reader.readAsText(file);
//     };

//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
//                 {/* رأس النموذج */}
//                 <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
//                     <div>
//                         <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
//                             {mode === 'edit' ? 'تعديل الاستراتيجية' :
//                                 mode === 'clone' ? 'نسخ الاستراتيجية' :
//                                     'إنشاء استراتيجية جديدة'}
//                         </h3>
//                         <p className="text-gray-600 dark:text-gray-400 mt-1">
//                             صمم استراتيجية تداول مخصصة باستخدام أدوات البناء المرئية
//                         </p>
//                     </div>
//                     <button
//                         onClick={onClose}
//                         className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
//                     >
//                         <X className="w-6 h-6" />
//                     </button>
//                 </div>

//                 {/* علامات التبويب */}
//                 <div className="border-b border-gray-200 dark:border-gray-700">
//                     <div className="flex space-x-1 px-6">
//                         {['basic', 'rules', 'parameters', 'advanced'].map((tab) => (
//                             <button
//                                 key={tab}
//                                 onClick={() => setActiveTab(tab as any)}
//                                 className={`px-4 py-3 font-medium text-sm ${activeTab === tab
//                                         ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
//                                         : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
//                                     }`}
//                             >
//                                 {tab === 'basic' && 'المعلومات الأساسية'}
//                                 {tab === 'rules' && 'قواعد التداول'}
//                                 {tab === 'parameters' && 'المعاملات'}
//                                 {tab === 'advanced' && 'إعدادات متقدمة'}
//                             </button>
//                         ))}
//                     </div>
//                 </div>

//                 {/* محتوى النموذج */}
//                 <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)]">
//                     <div className="p-6 space-y-6">
//                         {activeTab === 'basic' && (
//                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                                 {/* معلومات أساسية */}
//                                 <div className="space-y-6">
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                             اسم الاستراتيجية *
//                                         </label>
//                                         <input
//                                             type="text"
//                                             value={formData.name || ''}
//                                             onChange={(e) => handleInputChange('name', e.target.value)}
//                                             className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                                             placeholder="أدخل اسم الاستراتيجية"
//                                             required
//                                         />
//                                     </div>

//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                             الوصف *
//                                         </label>
//                                         <textarea
//                                             value={formData.description || ''}
//                                             onChange={(e) => handleInputChange('description', e.target.value)}
//                                             className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-32"
//                                             placeholder="صف الاستراتيجية وأهدافها"
//                                             required
//                                         />
//                                     </div>

//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                             التصنيف
//                                         </label>
//                                         <div className="grid grid-cols-4 gap-2">
//                                             {strategyCategories.map((category) => (
//                                                 <button
//                                                     key={category.id}
//                                                     type="button"
//                                                     onClick={() => handleInputChange('category', category.id)}
//                                                     className={`p-3 border rounded-lg flex flex-col items-center justify-center ${formData.category === category.id
//                                                             ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
//                                                             : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
//                                                         }`}
//                                                 >
//                                                     <span className="text-2xl mb-1">{category.icon}</span>
//                                                     <span className="text-xs font-medium">{category.name}</span>
//                                                 </button>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* القوالب الجاهزة */}
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
//                                         القوالب الجاهزة
//                                     </label>
//                                     <div className="space-y-3 max-h-96 overflow-y-auto">
//                                         {strategyTemplates.map((template) => (
//                                             <div
//                                                 key={template.id}
//                                                 className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedTemplate === template.id
//                                                         ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
//                                                         : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
//                                                     }`}
//                                                 onClick={() => handleApplyTemplate(template.id)}
//                                             >
//                                                 <div className="flex items-start justify-between">
//                                                     <div>
//                                                         <div className="flex items-center space-x-2">
//                                                             <span className="text-xl">{template.icon}</span>
//                                                             <h4 className="font-semibold text-gray-900 dark:text-white">
//                                                                 {template.name}
//                                                             </h4>
//                                                         </div>
//                                                         <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
//                                                             {template.description}
//                                                         </p>
//                                                     </div>
//                                                     <div className="flex items-center space-x-2">
//                                                         <div className="flex items-center space-x-1">
//                                                             <span className="text-xs text-yellow-600">★</span>
//                                                             <span className="text-xs">{template.successRate}%</span>
//                                                         </div>
//                                                         <div className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
//                                                             {template.popularity}%
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                                 <div className="flex items-center space-x-2 mt-3">
//                                                     <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
//                                                         {template.rules.length} قاعدة
//                                                     </span>
//                                                     <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
//                                                         {template.category}
//                                                     </span>
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 </div>
//                             </div>
//                         )}

//                         {activeTab === 'rules' && (
//                             <div className="space-y-6">
//                                 {/* منشئ القواعد */}
//                                 <div>
//                                     <div className="flex items-center justify-between mb-4">
//                                         <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
//                                             قواعد التداول
//                                         </h4>
//                                         <button
//                                             type="button"
//                                             onClick={() => setNewRule({
//                                                 id: `rule_${Date.now()}`,
//                                                 name: 'قاعدة جديدة',
//                                                 description: '',
//                                                 entryCondition: {
//                                                     id: `cond_${Date.now()}`,
//                                                     type: 'AND',
//                                                     leftOperand: { type: 'price', value: 'close', source: 'price' },
//                                                     operator: '>',
//                                                     rightOperand: { type: 'number', value: 0 },
//                                                 },
//                                                 positionSize: 0.1,
//                                                 maxPosition: 5,
//                                             })}
//                                             className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//                                         >
//                                             + إضافة قاعدة جديدة
//                                         </button>
//                                     </div>

//                                     {/* منشئ القواعد التفاعلي */}
//                                     {newRule ? (
//                                         <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
//                                             <RuleBuilder
//                                                 rule={newRule}
//                                                 onChange={setNewRule}
//                                                 onSave={() => handleAddRule(newRule)}
//                                                 onCancel={() => setNewRule(null)}
//                                                 isEditing={editingRuleIndex !== null}
//                                             />
//                                         </div>
//                                     ) : (
//                                         <ConditionBuilder
//                                             onConditionBuilt={(condition) => {
//                                                 setNewRule({
//                                                     id: `rule_${Date.now()}`,
//                                                     name: 'قاعدة مبنية',
//                                                     description: 'قاعدة تم بناؤها باستخدام منشئ الشروط',
//                                                     entryCondition: condition,
//                                                     positionSize: 0.1,
//                                                     maxPosition: 5,
//                                                 });
//                                             }}
//                                         />
//                                     )}

//                                     {/* القواعد المضافة */}
//                                     {formData.rules && formData.rules.length > 0 && (
//                                         <div className="space-y-4 mt-6">
//                                             {formData.rules.map((rule, index) => (
//                                                 <div
//                                                     key={rule.id}
//                                                     className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
//                                                 >
//                                                     <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900">
//                                                         <div>
//                                                             <div className="font-semibold text-gray-900 dark:text-white">
//                                                                 {rule.name}
//                                                             </div>
//                                                             <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
//                                                                 {rule.description}
//                                                             </div>
//                                                         </div>
//                                                         <div className="flex items-center space-x-2">
//                                                             <button
//                                                                 type="button"
//                                                                 onClick={() => handleEditRule(index)}
//                                                                 className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
//                                                             >
//                                                                 <Eye className="w-4 h-4" />
//                                                             </button>
//                                                             <button
//                                                                 type="button"
//                                                                 onClick={() => handleDeleteRule(index)}
//                                                                 className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded"
//                                                             >
//                                                                 <Trash2 className="w-4 h-4" />
//                                                             </button>
//                                                         </div>
//                                                     </div>
//                                                     <div className="p-4">
//                                                         <div className="grid grid-cols-3 gap-4 text-sm">
//                                                             <div>
//                                                                 <span className="text-gray-600 dark:text-gray-400">حجم المركز:</span>
//                                                                 <span className="font-medium ml-2">{(rule.positionSize || 0) * 100}%</span>
//                                                             </div>
//                                                             <div>
//                                                                 <span className="text-gray-600 dark:text-gray-400">أقصى عدد مراكز:</span>
//                                                                 <span className="font-medium ml-2">{rule.maxPosition || 'غير محدد'}</span>
//                                                             </div>
//                                                             <div>
//                                                                 <span className="text-gray-600 dark:text-gray-400">تريلينج ستوب:</span>
//                                                                 <span className="font-medium ml-2">
//                                                                     {rule.trailingStop ? `${rule.trailingDistance}%` : 'غير مفعل'}
//                                                                 </span>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         )}

//                         {activeTab === 'parameters' && (
//                             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                                 {/* الرموز */}
//                                 <div className="lg:col-span-1">
//                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
//                                         الرموز المتداولة
//                                     </label>
//                                     <div className="space-y-3">
//                                         <div className="flex space-x-2">
//                                             <input
//                                                 type="text"
//                                                 id="newSymbol"
//                                                 className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
//                                                 placeholder="أدخل رمز (مثل AAPL)"
//                                             />
//                                             <button
//                                                 type="button"
//                                                 onClick={() => {
//                                                     const input = document.getElementById('newSymbol') as HTMLInputElement;
//                                                     if (input.value) {
//                                                         handleAddSymbol(input.value);
//                                                         input.value = '';
//                                                     }
//                                                 }}
//                                                 className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
//                                             >
//                                                 إضافة
//                                             </button>
//                                         </div>
//                                         <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 max-h-48 overflow-y-auto">
//                                             {formData.symbols?.map((symbol) => (
//                                                 <div
//                                                     key={symbol}
//                                                     className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-900 rounded mb-2 last:mb-0"
//                                                 >
//                                                     <span className="font-medium">{symbol}</span>
//                                                     <button
//                                                         type="button"
//                                                         onClick={() => handleRemoveSymbol(symbol)}
//                                                         className="text-red-500 hover:text-red-700"
//                                                     >
//                                                         <X className="w-4 h-4" />
//                                                     </button>
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* الإطار الزمني */}
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                         الإطار الزمني
//                                     </label>
//                                     <select
//                                         value={formData.timeframe || '1d'}
//                                         onChange={(e) => handleInputChange('timeframe', e.target.value)}
//                                         className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
//                                     >
//                                         <option value="1m">دقيقة واحدة</option>
//                                         <option value="5m">5 دقائق</option>
//                                         <option value="15m">15 دقيقة</option>
//                                         <option value="30m">30 دقيقة</option>
//                                         <option value="1h">ساعة واحدة</option>
//                                         <option value="4h">4 ساعات</option>
//                                         <option value="1d">يوم واحد</option>
//                                         <option value="1w">أسبوع واحد</option>
//                                         <option value="1M">شهر واحد</option>
//                                     </select>
//                                 </div>

//                                 {/* رأس المال */}
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                         رأس المال الابتدائي ($)
//                                     </label>
//                                     <input
//                                         type="number"
//                                         value={formData.initialCapital || 10000}
//                                         onChange={(e) => handleInputChange('initialCapital', parseFloat(e.target.value))}
//                                         className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
//                                         min="100"
//                                         step="100"
//                                     />
//                                 </div>

//                                 {/* العمولات */}
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                         العمولة (%)
//                                     </label>
//                                     <input
//                                         type="number"
//                                         value={((formData.commission || 0.001) * 100).toFixed(3)}
//                                         onChange={(e) => handleInputChange('commission', parseFloat(e.target.value) / 100)}
//                                         className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
//                                         min="0"
//                                         max="10"
//                                         step="0.001"
//                                     />
//                                     <div className="text-xs text-gray-500 mt-1">
//                                         نسبة العمولة لكل صفقة (0.1% = 0.001)
//                                     </div>
//                                 </div>

//                                 {/* الانزلاق السعري */}
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                         الانزلاق السعري (%)
//                                     </label>
//                                     <input
//                                         type="number"
//                                         value={((formData.slippage || 0.001) * 100).toFixed(3)}
//                                         onChange={(e) => handleInputChange('slippage', parseFloat(e.target.value) / 100)}
//                                         className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
//                                         min="0"
//                                         max="5"
//                                         step="0.001"
//                                     />
//                                     <div className="text-xs text-gray-500 mt-1">
//                                         الفرق بين سعر التنفيذ والسعر المطلوب
//                                     </div>
//                                 </div>

//                                 {/* المعلمات المخصصة */}
//                                 <div className="lg:col-span-3">
//                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
//                                         المعلمات المخصصة
//                                     </label>
//                                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                         {Object.entries(formData.parameters || {}).map(([key, value]) => (
//                                             <div key={key} className="flex items-center space-x-2">
//                                                 <input
//                                                     type="text"
//                                                     value={key}
//                                                     onChange={(e) => {
//                                                         const newParams = { ...formData.parameters };
//                                                         delete newParams[key];
//                                                         newParams[e.target.value] = value;
//                                                         handleInputChange('parameters', newParams);
//                                                     }}
//                                                     className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
//                                                 />
//                                                 <input
//                                                     type="number"
//                                                     value={value}
//                                                     onChange={(e) => {
//                                                         const newParams = { ...formData.parameters, [key]: parseFloat(e.target.value) };
//                                                         handleInputChange('parameters', newParams);
//                                                     }}
//                                                     className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
//                                                 />
//                                                 <button
//                                                     type="button"
//                                                     onClick={() => {
//                                                         const newParams = { ...formData.parameters };
//                                                         delete newParams[key];
//                                                         handleInputChange('parameters', newParams);
//                                                     }}
//                                                     className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded"
//                                                 >
//                                                     <Trash2 className="w-4 h-4" />
//                                                 </button>
//                                             </div>
//                                         ))}
//                                         <div className="flex space-x-2">
//                                             <input
//                                                 type="text"
//                                                 id="newParamKey"
//                                                 className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
//                                                 placeholder="اسم المعلمة"
//                                             />
//                                             <input
//                                                 type="number"
//                                                 id="newParamValue"
//                                                 className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
//                                                 placeholder="القيمة"
//                                             />
//                                             <button
//                                                 type="button"
//                                                 onClick={() => {
//                                                     const keyInput = document.getElementById('newParamKey') as HTMLInputElement;
//                                                     const valueInput = document.getElementById('newParamValue') as HTMLInputElement;
//                                                     if (keyInput.value && valueInput.value) {
//                                                         const newParams = {
//                                                             ...formData.parameters,
//                                                             [keyInput.value]: parseFloat(valueInput.value),
//                                                         };
//                                                         handleInputChange('parameters', newParams);
//                                                         keyInput.value = '';
//                                                         valueInput.value = '';
//                                                     }
//                                                 }}
//                                                 className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//                                             >
//                                                 إضافة
//                                             </button>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}

//                         {activeTab === 'advanced' && (
//                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                                 {/* الإعدادات المتقدمة */}
//                                 <div className="space-y-6">
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
//                                             الوسوم
//                                         </label>
//                                         <div className="flex flex-wrap gap-2">
//                                             {formData.tags?.map((tag, index) => (
//                                                 <div
//                                                     key={index}
//                                                     className="flex items-center space-x-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full"
//                                                 >
//                                                     <span>{tag}</span>
//                                                     <button
//                                                         type="button"
//                                                         onClick={() => {
//                                                             const newTags = [...(formData.tags || [])];
//                                                             newTags.splice(index, 1);
//                                                             handleInputChange('tags', newTags);
//                                                         }}
//                                                         className="text-gray-500 hover:text-red-500"
//                                                     >
//                                                         <X className="w-3 h-3" />
//                                                     </button>
//                                                 </div>
//                                             ))}
//                                             <input
//                                                 type="text"
//                                                 id="newTag"
//                                                 className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-full"
//                                                 placeholder="أضف وسماً"
//                                                 onKeyPress={(e) => {
//                                                     if (e.key === 'Enter') {
//                                                         const input = e.target as HTMLInputElement;
//                                                         if (input.value.trim()) {
//                                                             const newTags = [...(formData.tags || []), input.value.trim()];
//                                                             handleInputChange('tags', newTags);
//                                                             input.value = '';
//                                                         }
//                                                     }
//                                                 }}
//                                             />
//                                         </div>
//                                     </div>

//                                     <div className="space-y-4">
//                                         <label className="flex items-center space-x-3">
//                                             <input
//                                                 type="checkbox"
//                                                 checked={formData.isActive ?? true}
//                                                 onChange={(e) => handleInputChange('isActive', e.target.checked)}
//                                                 className="w-4 h-4 text-blue-600 rounded"
//                                             />
//                                             <span className="text-sm text-gray-700 dark:text-gray-300">
//                                                 تفعيل الاستراتيجية
//                                             </span>
//                                         </label>

//                                         <label className="flex items-center space-x-3">
//                                             <input
//                                                 type="checkbox"
//                                                 checked={formData.isPublic ?? false}
//                                                 onChange={(e) => handleInputChange('isPublic', e.target.checked)}
//                                                 className="w-4 h-4 text-blue-600 rounded"
//                                             />
//                                             <span className="text-sm text-gray-700 dark:text-gray-300">
//                                                 جعل الاستراتيجية عامة
//                                             </span>
//                                         </label>
//                                     </div>
//                                 </div>

//                                 {/* أدوات الاستيراد/التصدير */}
//                                 <div className="space-y-6">
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
//                                             أدوات الاستيراد والتصدير
//                                         </label>
//                                         <div className="grid grid-cols-2 gap-3">
//                                             <button
//                                                 type="button"
//                                                 onClick={handleExportStrategy}
//                                                 className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
//                                             >
//                                                 <Download className="w-5 h-5" />
//                                                 <span>تصدير الاستراتيجية</span>
//                                             </button>

//                                             <label className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
//                                                 <Upload className="w-5 h-5" />
//                                                 <span>استيراد استراتيجية</span>
//                                                 <input
//                                                     type="file"
//                                                     accept=".json"
//                                                     onChange={handleImportStrategy}
//                                                     className="hidden"
//                                                 />
//                                             </label>
//                                         </div>
//                                     </div>

//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
//                                             الاختبار السريع
//                                         </label>
//                                         <button
//                                             type="button"
//                                             onClick={handleTestStrategy}
//                                             className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
//                                         >
//                                             <TestTube className="w-5 h-5" />
//                                             <span>اختبار الاستراتيجية على البيانات التاريخية</span>
//                                         </button>
//                                         <div className="text-xs text-gray-500 mt-2">
//                                             سيتم اختبار الاستراتيجية على آخر 30 يوم من البيانات
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}
//                     </div>

//                     {/* أزرار الإجراء */}
//                     <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
//                         <div className="flex items-center space-x-3">
//                             <button
//                                 type="button"
//                                 onClick={onClose}
//                                 className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
//                             >
//                                 إلغاء
//                             </button>
//                             {onSaveTemplate && (
//                                 <button
//                                     type="button"
//                                     onClick={() => {
//                                         const now = new Date();
//                                         const strategyToSave: Strategy = {
//                                             id: `template_${Date.now()}`,
//                                             name: formData.name || 'قالب',
//                                             description: formData.description || '',
//                                             version: '1.0.0',
//                                             author: 'المستخدم',
//                                             category: formData.category || 'trend',
//                                             symbols: formData.symbols || [],
//                                             timeframe: formData.timeframe || '1d',
//                                             rules: formData.rules || [],
//                                             parameters: formData.parameters || {},
//                                             initialCapital: formData.initialCapital || 10000,
//                                             commission: formData.commission || 0.001,
//                                             slippage: formData.slippage || 0.001,
//                                             createdAt: now,
//                                             updatedAt: now,
//                                             isActive: true,
//                                             isPublic: false,
//                                             tags: ['template'],
//                                         };
//                                         onSaveTemplate(strategyToSave);
//                                     }}
//                                     className="flex items-center space-x-2 px-6 py-2 border border-blue-300 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900"
//                                 >
//                                     <Copy className="w-4 h-4" />
//                                     <span>حفظ كقالب</span>
//                                 </button>
//                             )}
//                         </div>

//                         <div className="flex items-center space-x-3">
//                             {onTest && (
//                                 <button
//                                     type="button"
//                                     onClick={handleTestStrategy}
//                                     className="flex items-center space-x-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
//                                 >
//                                     <Play className="w-4 h-4" />
//                                     <span>اختبار الاستراتيجية</span>
//                                 </button>
//                             )}
//                             <button
//                                 type="submit"
//                                 className="flex items-center space-x-2 px-8 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//                             >
//                                 <Save className="w-5 h-5" />
//                                 <span className="font-semibold">
//                                     {mode === 'edit' ? 'حفظ التعديلات' : 'إنشاء الاستراتيجية'}
//                                 </span>
//                             </button>
//                         </div>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };