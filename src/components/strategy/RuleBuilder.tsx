// import React, { useState } from "react";
// import { Trash2, Plus, ChevronDown, X } from "lucide-react";
// import { Condition, CompositeCondition, Operator, ConditionType } from "@/types/strategy";
// import { useStrategyBuilderStore } from "@/stores/strategy-builder.store";



// interface RuleBuilderProps {
//     condition: Condition | CompositeCondition;
//     onChange: (newCondition: Condition | CompositeCondition) => void;
//     onDelete?: () => void;
//     level?: number;
//     allowedIndicators?: { name: string; display_name: string }[]; // List to choose from
// }

// const createEmptyCondition = (): Condition => ({
//     type: ConditionType.INDICATOR_VALUE,
//     operator: ">" as Operator,
//     left_value: "",
//     right_value: 0
// });

// export const RuleBuilder: React.FC<RuleBuilderProps> = ({ condition, onChange, onDelete, level = 0, allowedIndicators }) => {
//     const [isOpen, setIsOpen] = useState(level === 0);
//     const isComposite = condition.type === "and" || condition.type === "or";
//     const paddingLeft = level * 20;

//     const handleDelete = () => { if (onDelete) onDelete(); };

//     const handleAddSub = () => {
//         if (!isComposite) return;
//         const newCond = createEmptyCondition();
//         const newConditions = [...(condition as CompositeCondition).conditions, newCond];
//         onChange({ ...condition, conditions: newConditions });
//     };

//     const handleSimpleChange = (field: keyof Condition, value: any) => {
//         onChange({ ...condition, [field]: value });
//     };

//     return (
//         <div style={{ paddingLeft: `${paddingLeft}px` }} className="border-l border-gray-300 pl-4 py-2 mb-2 relative bg-white rounded-r hover:bg-gray-50">

//             {/* Header */}
//             <div className="flex items-center justify-between mb-2">
//                 <div className="flex items-center gap-2">
//                     {isComposite ? (
//                         <button
//                             onClick={() => onChange({ ...condition, type: condition.type === 'and' ? 'or' : 'and' })}
//                             className={`px-2 py-1 rounded text-xs font-bold uppercase ${condition.type === 'and' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}
//                         >
//                             {condition.type} Group
//                         </button>
//                     ) : (
//                         <span className="text-xs font-bold text-gray-500">Condition</span>
//                     )}
//                     {level > 0 && (
//                         <button onClick={handleDelete} className="p-1 hover:bg-red-100 rounded text-red-400"><X size={14} /></button>
//                     )}
//                 </div>
//                 {level === 0 && (
//                     <button onClick={handleDelete} className="p-1 hover:bg-red-100 rounded text-red-400"><Trash2 size={14} /></button>
//                 )}
//             </div>

//             {/* Body */}
//             {isComposite ? (
//                 <div>
//                     {(condition as CompositeCondition).conditions.map((sub, idx) => (
//                         <div key={idx} className="mb-2">
//                             <RuleBuilder
//                                 condition={sub}
//                                 onChange={(updated) => {
//                                     const newConditions = [...(condition as CompositeCondition).conditions];
//                                     newConditions[idx] = updated;
//                                     onChange({ ...condition, conditions: newConditions });
//                                 }}
//                                 onDelete={() => {
//                                     const newConditions = (condition as CompositeCondition).conditions.filter((_, i) => i !== idx);
//                                     onChange({ ...condition, conditions: newConditions });
//                                 }}
//                                 level={level + 1}
//                                 allowedIndicators={allowedIndicators}
//                             />
//                             {/* Connector */}
//                             {idx < (condition as CompositeCondition).conditions.length - 1 && (
//                                 <div className="flex items-center gap-2 -my-2 ml-4">
//                                     <span className="text-xs text-gray-400 font-bold uppercase">{condition.type}</span>
//                                     <div className="h-px flex-1 bg-gray-200"></div>
//                                 </div>
//                             )}
//                         </div>
//                     ))}
//                     <button onClick={handleAddSub} className="flex items-center gap-2 mt-2 text-sm text-blue-600 font-medium">
//                         <Plus size={16} /> Add Condition
//                     </button>
//                 </div>
//             ) : (
//                 <div className="grid grid-cols-12 gap-2 items-center bg-gray-50 p-3 rounded-lg">
//                     <div className="col-span-4">
//                         <select
//                             className="w-full p-1 text-sm border rounded bg-white"
//                             value={(condition as Condition).left_value as string}
//                             onChange={(e) => handleSimpleChange('left_value', e.target.value)}
//                         >
//                             <option value="">Select...</option>
//                             <optgroup label="Active Indicators">
//                                 {allowedIndicators?.map(ind => (
//                                     <option key={ind.name} value={`indicator:${ind.name}`}>{ind.display_name}</option>
//                                 ))}
//                             </optgroup>
//                         </select>
//                     </div>
//                     <div className="col-span-3">
//                         <select
//                             className="w-full p-1 text-sm border rounded bg-white"
//                             value={(condition as Condition).operator}
//                             onChange={(e) => handleSimpleChange('operator', e.target.value)}
//                         >
//                             <option value=">">Greater Than (&gt;)</option>
//                             <option value="<">Less Than (&lt;)</option>
//                             <option value="cross_above">Cross Above</option>
//                             <option value="cross_below">Cross Below</option>
//                         </select>
//                     </div>
//                     <div className="col-span-4">
//                         {(condition as Condition).operator?.includes("cross") ? (
//                             <select
//                                 className="w-full p-1 text-sm border rounded bg-white"
//                                 value={(condition as Condition).right_value as string}
//                                 onChange={(e) => handleSimpleChange('right_value', e.target.value)}
//                             >
//                                 <option value="">Select...</option>
//                                 {allowedIndicators?.map(ind => <option key={ind.name} value={`indicator:${ind.name}`}>{ind.display_name}</option>)}
//                             </select>
//                         ) : (
//                             <input
//                                 type="number"
//                                 className="w-full p-1 text-sm border rounded bg-white"
//                                 value={(condition as Condition).right_value as number}
//                                 onChange={(e) => handleSimpleChange('right_value', parseFloat(e.target.value))}
//                             />
//                         )}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };