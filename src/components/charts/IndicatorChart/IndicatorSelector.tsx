// 'use client';

// import React, { useState } from 'react';
// import { Plus, Settings, X, ChevronDown, ChevronUp } from 'lucide-react';
// import { indicatorCategories } from '@/lib/charts/config/chart-config';
// import { ActiveIndicator } from './IndicatorChart';

// interface IndicatorSelectorProps {
//     onSelectIndicator: (indicatorId: string, parameters?: Record<string, any>) => void;
//     activeIndicators: ActiveIndicator[];
//     onRemoveIndicator: (indicatorId: string) => void;
//     onUpdateIndicator: (indicatorId: string, parameters: Record<string, any>) => void;
//     isLoading: boolean;
// }

// export const IndicatorSelector: React.FC<IndicatorSelectorProps> = ({
//     onSelectIndicator,
//     activeIndicators,
//     onRemoveIndicator,
//     onUpdateIndicator,
//     isLoading,
// }) => {
//     const [isOpen, setIsOpen] = useState(false);
//     const [selectedCategory, setSelectedCategory] = useState<string>('trend');
//     const [showParameters, setShowParameters] = useState<string | null>(null);
//     const [indicatorParameters, setIndicatorParameters] = useState<Record<string, any>>({});

//     const handleAddIndicator = (indicatorId: string) => {
//         const defaultParams = getDefaultParameters(indicatorId);
//         setIndicatorParameters(defaultParams);
//         setShowParameters(indicatorId);
//     };

//     const handleConfirmAdd = (indicatorId: string) => {
//         onSelectIndicator(indicatorId, indicatorParameters[indicatorId]);
//         setShowParameters(null);
//         setIsOpen(false);
//     };

//     const handleParameterChange = (indicatorId: string, paramName: string, value: any) => {
//         setIndicatorParameters(prev => ({
//             ...prev,
//             [indicatorId]: {
//                 ...prev[indicatorId],
//                 [paramName]: value,
//             },
//         }));
//     };

//     const getDefaultParameters = (indicatorId: string): Record<string, any> => {
//         const defaults: Record<string, Record<string, any>> = {
//             rsi: { period: 14, overbought: 70, oversold: 30 },
//             macd: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
//             sma: { period: 20 },
//             ema: { period: 20 },
//             bollinger: { period: 20, stdDev: 2 },
//             stochastic: { kPeriod: 14, dPeriod: 3, slowing: 3 },
//             atr: { period: 14 },
//             adx: { period: 14 },
//         };
//         return { [indicatorId]: defaults[indicatorId] || {} };
//     };

//     const getParameterInputs = (indicatorId: string) => {
//         const params = indicatorParameters[indicatorId] || {};

//         switch (indicatorId) {
//             case 'rsi':
//                 return (
//                     <div className="space-y-2">
//                         <div>
//                             <label className="block text-xs text-gray-600 dark:text-gray-400">الفترة</label>
//                             <input
//                                 type="number"
//                                 value={params.period || 14}
//                                 onChange={(e) => handleParameterChange(indicatorId, 'period', parseInt(e.target.value))}
//                                 className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
//                                 min="1"
//                                 max="100"
//                             />
//                         </div>
//                         <div className="grid grid-cols-2 gap-2">
//                             <div>
//                                 <label className="block text-xs text-gray-600 dark:text-gray-400">مفرط الشراء</label>
//                                 <input
//                                     type="number"
//                                     value={params.overbought || 70}
//                                     onChange={(e) => handleParameterChange(indicatorId, 'overbought', parseInt(e.target.value))}
//                                     className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
//                                     min="0"
//                                     max="100"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-xs text-gray-600 dark:text-gray-400">مفرط البيع</label>
//                                 <input
//                                     type="number"
//                                     value={params.oversold || 30}
//                                     onChange={(e) => handleParameterChange(indicatorId, 'oversold', parseInt(e.target.value))}
//                                     className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
//                                     min="0"
//                                     max="100"
//                                 />
//                             </div>
//                         </div>
//                     </div>
//                 );

//             case 'macd':
//                 return (
//                     <div className="space-y-2">
//                         <div className="grid grid-cols-3 gap-2">
//                             <div>
//                                 <label className="block text-xs text-gray-600 dark:text-gray-400">الفترة السريعة</label>
//                                 <input
//                                     type="number"
//                                     value={params.fastPeriod || 12}
//                                     onChange={(e) => handleParameterChange(indicatorId, 'fastPeriod', parseInt(e.target.value))}
//                                     className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
//                                     min="1"
//                                     max="50"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-xs text-gray-600 dark:text-gray-400">الفترة البطيئة</label>
//                                 <input
//                                     type="number"
//                                     value={params.slowPeriod || 26}
//                                     onChange={(e) => handleParameterChange(indicatorId, 'slowPeriod', parseInt(e.target.value))}
//                                     className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
//                                     min="1"
//                                     max="100"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-xs text-gray-600 dark:text-gray-400">فترة الإشارة</label>
//                                 <input
//                                     type="number"
//                                     value={params.signalPeriod || 9}
//                                     onChange={(e) => handleParameterChange(indicatorId, 'signalPeriod', parseInt(e.target.value))}
//                                     className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
//                                     min="1"
//                                     max="50"
//                                 />
//                             </div>
//                         </div>
//                     </div>
//                 );

//             default:
//                 return (
//                     <div>
//                         <label className="block text-xs text-gray-600 dark:text-gray-400">الفترة</label>
//                         <input
//                             type="number"
//                             value={params.period || 20}
//                             onChange={(e) => handleParameterChange(indicatorId, 'period', parseInt(e.target.value))}
//                             className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
//                             min="1"
//                             max="200"
//                         />
//                     </div>
//                 );
//         }
//     };

//     return (
//         <div className="relative">
//             <div className="flex items-center space-x-2">
//                 {activeIndicators.map(indicator => (
//                     <div
//                         key={indicator.id}
//                         className="flex items-center space-x-1 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs"
//                         style={{ borderLeft: `3px solid ${indicator.color}` }}
//                     >
//                         <span>{indicator.name}</span>
//                         <button
//                             onClick={() => onRemoveIndicator(indicator.id)}
//                             className="text-gray-500 hover:text-red-500"
//                         >
//                             <X className="w-3 h-3" />
//                         </button>
//                     </div>
//                 ))}

//                 <button
//                     onClick={() => setIsOpen(!isOpen)}
//                     disabled={isLoading}
//                     className="flex items-center space-x-1 px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                     <Plus className="w-4 h-4" />
//                     <span>إضافة مؤشر</span>
//                     {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
//                 </button>
//             </div>

//             {isOpen && (
//                 <div className="absolute right-0 top-full mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
//                     <div className="p-3">
//                         {/* تصنيفات المؤشرات */}
//                         <div className="flex space-x-1 mb-3 overflow-x-auto">
//                             {Object.entries(indicatorCategories).map(([key, category]) => (
//                                 <button
//                                     key={key}
//                                     onClick={() => setSelectedCategory(key)}
//                                     className={`px-3 py-1 text-xs whitespace-nowrap rounded ${selectedCategory === key
//                                             ? 'bg-blue-500 text-white'
//                                             : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
//                                         }`}
//                                 >
//                                     {category.name}
//                                 </button>
//                             ))}
//                         </div>

//                         {/* قائمة المؤشرات */}
//                         <div className="space-y-1 max-h-60 overflow-y-auto">
//                             {indicatorCategories[selectedCategory as keyof typeof indicatorCategories]?.indicators.map(indicator => (
//                                 <div key={indicator.id} className="space-y-2">
//                                     <button
//                                         onClick={() => handleAddIndicator(indicator.id)}
//                                         className="w-full px-3 py-2 text-left text-sm bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex justify-between items-center"
//                                     >
//                                         <span>{indicator.name}</span>
//                                         <Plus className="w-4 h-4" />
//                                     </button>

//                                     {showParameters === indicator.id && (
//                                         <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded space-y-3">
//                                             {getParameterInputs(indicator.id)}

//                                             <div className="flex space-x-2 pt-2">
//                                                 <button
//                                                     onClick={() => handleConfirmAdd(indicator.id)}
//                                                     className="flex-1 px-3 py-1.5 bg-green-500 text-white text-sm rounded hover:bg-green-600"
//                                                 >
//                                                     إضافة
//                                                 </button>
//                                                 <button
//                                                     onClick={() => setShowParameters(null)}
//                                                     className="px-3 py-1.5 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded hover:bg-gray-400 dark:hover:bg-gray-600"
//                                                 >
//                                                     إلغاء
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     )}
//                                 </div>
//                             ))}
//                         </div>

//                         <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
//                             <button
//                                 onClick={() => setIsOpen(false)}
//                                 className="w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
//                             >
//                                 إغلاق
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };