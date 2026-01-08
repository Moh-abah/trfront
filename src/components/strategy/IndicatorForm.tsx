// import React, { useState, useEffect } from "react";
// import { Trash2, Settings, Info } from "lucide-react";
// import { IndicatorConfig } from "@/types/strategy";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card/Card";
// import { Input } from "@/components/ui/Input/Input";
// import { Label } from "@/components/ui/Label/Label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select/Select";
// import { INDICATORS_REGISTRY } from "@/data/indicators-registry";

// interface IndicatorConfigFormProps {
//     indicator: IndicatorConfig;
//     onUpdate: (updates: Partial<IndicatorConfig>) => void;
//     onRemove: () => void;
// }

// export const IndicatorConfigForm: React.FC<IndicatorConfigFormProps> = ({ indicator, onUpdate, onRemove }) => {
//     const [localParams, setLocalParams] = useState<Record<string, any>>(indicator.params);

//     // Find metadata in registry (matching by base key logic)
//     // Since indicator.name might be "rsi_5m", we look for "rsi" in registry keys, or handle presets.
//     const metadata = Object.values(INDICATORS_REGISTRY).find(meta =>
//         meta.key === indicator.name || // direct match (if preset)
//         (indicator.name.startsWith(meta.key + "_") && metadata.isPreset) || // preset match
//         (indicator.name.startsWith(meta.key) && !metadata.isPreset) // generic match
//     );

//     useEffect(() => {
//         setLocalParams(indicator.params);
//     }, [indicator.params]);

//     const handleParamChange = (key: string, value: any) => {
//         const newParams = { ...localParams, [key]: value };
//         setLocalParams(newParams);
//         onUpdate({ params: newParams });
//     };

//     if (!metadata) return <div className="p-4 text-red-500">Indicator config not found in registry!</div>;

//     return (
//         <div className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow transition-shadow">
//             <CardHeader className="bg-gray-50 py-2 px-4 flex justify-between items-center border-b">
//                 <CardTitle className="text-sm font-semibold text-gray-800">
//                     {indicator.display_name}
//                 </CardTitle>
//                 <div className="flex items-center gap-3">
//                     <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600 font-mono">
//                         {indicator.name}
//                     </span>
//                     <button onClick={onRemove} className="text-red-400 hover:text-red-600">
//                         <Trash2 size={16} />
//                     </button>
//                 </div>
//             </CardHeader>
//             <CardContent className="pt-4 space-y-4">

//                 {/* Dynamic Params */}
//                 <div className="space-y-3">
//                     {Object.entries(metadata.defaultParams).map(([key, def]) => {
//                         const value = localParams[key] !== undefined ? localParams[key] : def.default;

//                         // Special handling for Current IV
//                         if (metadata.requiresUserInput === key) {
//                             return (
//                                 <div key={key} className="bg-blue-50 p-3 rounded border border-blue-100">
//                                     <Label className="text-xs text-blue-800 font-semibold flex items-center gap-1">
//                                         <Info size={12} /> {def.label}
//                                     </Label>
//                                     <Input
//                                         type="number"
//                                         value={value}
//                                         onChange={(e) => handleParamChange(key, parseFloat(e.target.value))}
//                                         placeholder="Enter value..."
//                                     />
//                                 </div>
//                             );
//                         }

//                         return (
//                             <div key={key}>
//                                 <Label className="text-[11px] text-gray-500 uppercase">{def.label}</Label>
//                                 {typeof def.default === 'number' && !def.options ? (
//                                     <Input
//                                         type="number"
//                                         step={def.step}
//                                         value={value}
//                                         onChange={(e) => handleParamChange(key, parseFloat(e.target.value))}
//                                     />
//                                 ) : def.options ? (
//                                     <Select value={value} onValueChange={(v) => handleParamChange(key, v)}>
//                                         <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select..." /></SelectTrigger>
//                                         <SelectContent>
//                                             {def.options.map(opt => (
//                                                 <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
//                                             ))}
//                                         </SelectContent>
//                                     </Select>
//                                 ) : null}
//                             </div>
//                         );
//                     })}
//                 </div>
//             </CardContent>
//         </div>
//     );
// };