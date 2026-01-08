// 'use client';

// import React, { useState } from 'react';
// import { StrategyConfig, BacktestResult } from '../../types';
// import { Button } from '../ui/Button/Button';
// import { Select } from '../ui/Input/Select';
// import { Input } from '../ui/Input/Input';
// import { Card } from '../ui/Card/Card';
// import { Loader } from '../ui/Loader/Loader';
// import { Play, Save, Download } from 'lucide-react';
// import { useBacktest } from '../../hooks/data/useBacktest';

// interface StrategyTesterProps {
//     symbol: string;
//     timeframe: string;
//     strategy?: StrategyConfig;
//     onSave?: (strategy: StrategyConfig) => void;
//     onRunBacktest?: (result: BacktestResult) => void;
//     className?: string;
// }

// export const StrategyTester: React.FC<StrategyTesterProps> = ({
//     symbol,
//     timeframe,
//     strategy: initialStrategy,
//     onSave,
//     onRunBacktest,
//     className
// }) => {
//     const [strategy, setStrategy] = useState<StrategyConfig>(
//         initialStrategy || {
//             id: '',
//             name: 'New Strategy',
//             type: 'custom',
//             parameters: {},
//             conditions: [],
//             timeframe: '1h',
//             symbols: [symbol]
//         }
//     );

//     const [backtestSettings, setBacktestSettings] = useState({
//         startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
//         endDate: new Date().toISOString().split('T')[0],
//         initialCapital: 10000,
//         commission: 0.001,
//         slippage: 0.001
//     });

//     const { runBacktest, isLoading, result, error } = useBacktest();

//     const handleRunBacktest = async () => {
//         const backtestResult = await runBacktest({
//             symbol,
//             timeframe,
//             strategy,
//             ...backtestSettings
//         });

//         if (backtestResult && onRunBacktest) {
//             onRunBacktest(backtestResult);
//         }
//     };

//     const handleSaveStrategy = () => {
//         if (onSave) {
//             onSave(strategy);
//         }
//     };

//     const updateStrategyParam = (param: string, value: any) => {
//         setStrategy({
//             ...strategy,
//             parameters: {
//                 ...strategy.parameters,
//                 [param]: value
//             }
//         });
//     };

//     const updateCondition = (index: number, condition: any) => {
//         const newConditions = [...strategy.conditions];
//         newConditions[index] = condition;
//         setStrategy({ ...strategy, conditions: newConditions });
//     };

//     return (
//         <div className={className}>
//             <Card className="p-4">
//                 <div className="flex justify-between items-center mb-4">
//                     <h3 className="font-bold">Strategy Tester</h3>
//                     <div className="flex gap-2">
//                         <Button
//                             variant="outline"
//                             size="sm"
//                             icon={<Save className="w-4 h-4" />}
//                             onClick={handleSaveStrategy}
//                         >
//                             Save
//                         </Button>
//                         <Button
//                             variant="primary"
//                             size="sm"
//                             icon={<Play className="w-4 h-4" />}
//                             onClick={handleRunBacktest}
//                             loading={isLoading}
//                         >
//                             Run Test
//                         </Button>
//                     </div>
//                 </div>

//                 {/* Strategy Parameters */}
//                 <div className="space-y-4">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <Input
//                             label="Strategy Name"
//                             value={strategy.name}
//                             onChange={(e) => setStrategy({ ...strategy, name: e.target.value })}
//                             placeholder="My Trading Strategy"
//                         />

//                         <Select
//                             label="Timeframe"
//                             value={strategy.timeframe}
//                             onChange={(value) => setStrategy({ ...strategy, timeframe: value })}
//                             options={[
//                                 { value: '1m', label: '1 Minute' },
//                                 { value: '5m', label: '5 Minutes' },
//                                 { value: '15m', label: '15 Minutes' },
//                                 { value: '1h', label: '1 Hour' },
//                                 { value: '4h', label: '4 Hours' },
//                                 { value: '1d', label: '1 Day' },
//                                 { value: '1w', label: '1 Week' }
//                             ]}
//                         />
//                     </div>

//                     {/* Backtest Settings */}
//                     <div className="border-t pt-4">
//                         <h4 className="font-medium mb-3">Backtest Settings</h4>
//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                             <Input
//                                 label="Start Date"
//                                 type="date"
//                                 value={backtestSettings.startDate}
//                                 onChange={(e) => setBacktestSettings({ ...backtestSettings, startDate: e.target.value })}
//                             />

//                             <Input
//                                 label="End Date"
//                                 type="date"
//                                 value={backtestSettings.endDate}
//                                 onChange={(e) => setBacktestSettings({ ...backtestSettings, endDate: e.target.value })}
//                             />

//                             <Input
//                                 label="Initial Capital ($)"
//                                 type="number"
//                                 value={backtestSettings.initialCapital}
//                                 onChange={(e) => setBacktestSettings({
//                                     ...backtestSettings,
//                                     initialCapital: parseFloat(e.target.value)
//                                 })}
//                             />

//                             <Input
//                                 label="Commission (%)"
//                                 type="number"
//                                 step="0.001"
//                                 value={backtestSettings.commission}
//                                 onChange={(e) => setBacktestSettings({
//                                     ...backtestSettings,
//                                     commission: parseFloat(e.target.value)
//                                 })}
//                             />

//                             <Input
//                                 label="Slippage (%)"
//                                 type="number"
//                                 step="0.001"
//                                 value={backtestSettings.slippage}
//                                 onChange={(e) => setBacktestSettings({
//                                     ...backtestSettings,
//                                     slippage: parseFloat(e.target.value)
//                                 })}
//                             />
//                         </div>
//                     </div>

//                     {/* Results */}
//                     {result && (
//                         <div className="border-t pt-4">
//                             <div className="flex justify-between items-center mb-3">
//                                 <h4 className="font-medium">Backtest Results</h4>
//                                 <Button
//                                     variant="ghost"
//                                     size="sm"
//                                     icon={<Download className="w-4 h-4" />}
//                                 >
//                                     Export
//                                 </Button>
//                             </div>

//                             {error && (
//                                 <div className="bg-red-50 text-red-600 p-3 rounded mb-3">
//                                     {error}
//                                 </div>
//                             )}

//                             {result && !error && (
//                                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                                     <div className="bg-gray-50 p-3 rounded">
//                                         <p className="text-sm text-gray-500">Total Return</p>
//                                         <p className={`text-lg font-bold ${result.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
//                                             {result.totalReturn.toFixed(2)}%
//                                         </p>
//                                     </div>

//                                     <div className="bg-gray-50 p-3 rounded">
//                                         <p className="text-sm text-gray-500">Win Rate</p>
//                                         <p className="text-lg font-bold">{result.winRate.toFixed(1)}%</p>
//                                     </div>

//                                     <div className="bg-gray-50 p-3 rounded">
//                                         <p className="text-sm text-gray-500">Max Drawdown</p>
//                                         <p className="text-lg font-bold text-red-600">
//                                             {result.maxDrawdown.toFixed(2)}%
//                                         </p>
//                                     </div>

//                                     <div className="bg-gray-50 p-3 rounded">
//                                         <p className="text-sm text-gray-500">Total Trades</p>
//                                         <p className="text-lg font-bold">{result.totalTrades}</p>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     )}

//                     {isLoading && (
//                         <div className="flex justify-center py-8">
//                             <Loader size="lg" />
//                         </div>
//                     )}
//                 </div>
//             </Card>
//         </div>
//     );
// };

// export default StrategyTester;