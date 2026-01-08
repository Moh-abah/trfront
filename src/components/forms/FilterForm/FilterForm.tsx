// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useForm } from 'react-hook-form';
// import { Save, Filter, RefreshCw } from 'lucide-react';
// import { FilterCriteria, FilterPreset } from '../../../types/filter.types';
// import { CriteriaBuilder } from './CriteriaBuilder';

// interface FilterFormProps {
//     initialCriteria?: FilterCriteria;
//     market: 'crypto' | 'stocks';
//     onSubmit: (criteria: FilterCriteria) => void;
//     onSavePreset?: (preset: Omit<FilterPreset, 'id' | 'createdAt' | 'updatedAt'>) => void;
//     isLoading?: boolean;
//     className?: string;
// }

// export const FilterForm: React.FC<FilterFormProps> = ({
//     initialCriteria,
//     market,
//     onSubmit,
//     onSavePreset,
//     isLoading = false,
//     className = ''
// }) => {
//     const { control, handleSubmit, watch, setValue, reset } = useForm<FilterCriteria>({
//         defaultValues: initialCriteria || {
//             conditions: [
//                 {
//                     field: 'price',
//                     operator: 'greater_than',
//                     value: 0
//                 }
//             ],
//             logic: 'AND',
//             groups: []
//         }
//     });

//     const [showPresetForm, setShowPresetForm] = useState(false);
//     const [presetName, setPresetName] = useState('');
//     const [presetDescription, setPresetDescription] = useState('');

//     const currentCriteria = watch();

//     const handleFormSubmit = (data: FilterCriteria) => {
//         onSubmit(data);
//     };

//     const handleSavePreset = () => {
//         if (!presetName.trim()) return;

//         if (onSavePreset) {
//             onSavePreset({
//                 name: presetName,
//                 description: presetDescription,
//                 market,
//                 criteria: currentCriteria,
//                 isDefault: false
//             });
//             setPresetName('');
//             setPresetDescription('');
//             setShowPresetForm(false);
//         }
//     };

//     const handleReset = () => {
//         reset({
//             conditions: [
//                 {
//                     field: 'price',
//                     operator: 'greater_than',
//                     value: 0
//                 }
//             ],
//             logic: 'AND',
//             groups: []
//         });
//     };

//     return (
//         <form onSubmit={handleSubmit(handleFormSubmit)} className={`space-y-6 ${className}`}>
//             {/* Criteria Builder */}
//             <CriteriaBuilder
//                 control={control}
//                 market={market}
//             />

//             {/* Actions */}
//             <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
//                 <div className="flex items-center gap-3">
//                     <button
//                         type="submit"
//                         disabled={isLoading}
//                         className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                     >
//                         <Filter className="w-4 h-4" />
//                         <span className="font-medium">Apply Filters</span>
//                     </button>

//                     <button
//                         type="button"
//                         onClick={handleReset}
//                         className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
//                     >
//                         <RefreshCw className="w-4 h-4" />
//                         Reset
//                     </button>
//                 </div>

//                 {onSavePreset && (
//                     <button
//                         type="button"
//                         onClick={() => setShowPresetForm(!showPresetForm)}
//                         className="flex items-center gap-2 px-4 py-2.5 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
//                     >
//                         <Save className="w-4 h-4" />
//                         Save Preset
//                     </button>
//                 )}
//             </div>

//             {/* Preset Form */}
//             {showPresetForm && (
//                 <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
//                     <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-3">Save Filter Preset</h4>
//                     <div className="space-y-3">
//                         <div>
//                             <label className="block text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
//                                 Preset Name *
//                             </label>
//                             <input
//                                 type="text"
//                                 value={presetName}
//                                 onChange={(e) => setPresetName(e.target.value)}
//                                 className="w-full px-3 py-2 border border-blue-300 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-800"
//                                 placeholder="e.g., High Volume Gainers"
//                             />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
//                                 Description
//                             </label>
//                             <textarea
//                                 value={presetDescription}
//                                 onChange={(e) => setPresetDescription(e.target.value)}
//                                 className="w-full px-3 py-2 border border-blue-300 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-800"
//                                 placeholder="Optional description"
//                                 rows={2}
//                             />
//                         </div>
//                         <div className="flex items-center gap-2">
//                             <button
//                                 type="button"
//                                 onClick={handleSavePreset}
//                                 disabled={!presetName.trim()}
//                                 className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
//                             >
//                                 Save
//                             </button>
//                             <button
//                                 type="button"
//                                 onClick={() => setShowPresetForm(false)}
//                                 className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
//                             >
//                                 Cancel
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </form>
//     );
// };