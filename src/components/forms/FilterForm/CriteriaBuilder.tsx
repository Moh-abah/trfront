// 'use client';
// import React from 'react';
// import { Control, Controller, useFieldArray } from 'react-hook-form';
// import { Plus, Trash2 } from 'lucide-react';
// import { FilterCriteria, FilterCondition } from '../../../types/filter.types';
// import { ConditionBuilder } from '../../indicators/ConditionBuilder/ConditionBuilder';

// interface CriteriaBuilderProps {
//     control: Control<FilterCriteria>;
//     market: 'crypto' | 'stocks';
// }

// export const CriteriaBuilder: React.FC<CriteriaBuilderProps> = ({ control, market }) => {
//     const { fields, append, remove } = useFieldArray({
//         control,
//         name: 'conditions'
//     });

//     const handleAddCondition = () => {
//         const newCondition: FilterCondition = {
//             field: 'price',
//             operator: 'greater_than',
//             value: 0
//         };
//         append(newCondition);
//     };

//     const getAvailableFields = () => {
//         const baseFields = [
//             { value: 'price', label: 'Price', type: 'number' },
//             { value: 'volume', label: 'Volume', type: 'number' },
//             { value: 'change_24h', label: '24h Change %', type: 'number' },
//             { value: 'market_cap', label: 'Market Cap', type: 'number' }
//         ];

//         if (market === 'crypto') {
//             return [
//                 ...baseFields,
//                 { value: 'price_btc', label: 'Price (BTC)', type: 'number' },
//                 { value: 'price_eth', label: 'Price (ETH)', type: 'number' },
//                 { value: 'trading_pairs', label: 'Trading Pairs', type: 'select' }
//             ];
//         }

//         return [
//             ...baseFields,
//             { value: 'pe_ratio', label: 'P/E Ratio', type: 'number' },
//             { value: 'dividend_yield', label: 'Dividend Yield', type: 'number' },
//             { value: 'sector', label: 'Sector', type: 'select' }
//         ];
//     };

//     return (
//         <div className="space-y-4">
//             <div className="flex items-center justify-between">
//                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filter Criteria</h3>
//                 <button
//                     type="button"
//                     onClick={handleAddCondition}
//                     className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
//                 >
//                     <Plus className="w-4 h-4" />
//                     Add Condition
//                 </button>
//             </div>

//             <div className="space-y-4">
//                 {fields.map((field, index) => (
//                     <div key={field.id} className="relative p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
//                         <button
//                             type="button"
//                             onClick={() => remove(index)}
//                             className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-600 dark:hover:text-red-400"
//                         >
//                             <Trash2 className="w-4 h-4" />
//                         </button>

//                         <Controller
//                             name={`conditions.${index}`}
//                             control={control}
//                             render={({ field: conditionField }) => (
//                                 <ConditionBuilder
//                                     condition={conditionField.value}
//                                     onChange={conditionField.onChange}
//                                     availableFields={getAvailableFields()}
//                                 />
//                             )}
//                         />
//                     </div>
//                 ))}

//                 {fields.length === 0 && (
//                     <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
//                         <p className="text-gray-500 dark:text-gray-400">
//                             No conditions added. Click "Add Condition" to start building your filter.
//                         </p>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };