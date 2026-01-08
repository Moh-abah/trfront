// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useBacktestStore } from '../../stores/backtest.store';
// import { BacktestForm } from '../../components/backtest/BacktestForm';
// import { ResultsPanel } from '../../components/backtest/ResultsPanel';

// import { BarChart2, Settings, History, PlayCircle } from 'lucide-react';
// import { BacktestType } from '../../types/backtest.types';
// import { LiveStatsPanel } from '@/components/backtest/LiveStatsPanel';
// import { HistorySidebar } from '@/components/backtest/HistorySidebar';

// export default function BacktestPage() {
//     const [activeBacktestType, setActiveBacktestType] = useState<BacktestType>('basic');
//     const [showHistory, setShowHistory] = useState(false);

//     const {
//         currentResult,
//         liveStats,
//         isLoading,
//         isRunning,
//         runBacktest,
//         runWalkForward,
//         runMonteCarlo,
//         saveConfig,
//         loadBacktestHistory,
//     } = useBacktestStore();

//     useEffect(() => {
//         loadBacktestHistory();
//     }, [loadBacktestHistory]);

//     const handleBacktestSubmit = (config: any) => {
//         if (activeBacktestType === 'basic') {
//             runBacktest(config);
//         } else if (activeBacktestType === 'walk-forward') {
//             runWalkForward(config);
//         } else if (activeBacktestType === 'monte-carlo') {
//             runMonteCarlo(config);
//         }
//     };

//     const handleSaveConfig = (config: any) => {
//         saveConfig(config);
//     };

//     const backtestTypes: { id: BacktestType; label: string; description: string }[] = [
//         {
//             id: 'basic',
//             label: 'Basic Backtest',
//             description: 'Test strategy on historical data'
//         },
//         {
//             id: 'walk-forward',
//             label: 'Walk Forward',
//             description: 'Validate strategy robustness'
//         },
//         {
//             id: 'monte-carlo',
//             label: 'Monte Carlo',
//             description: 'Simulate multiple scenarios'
//         }
//     ];

//     return (
//         <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
//             <div className="max-w-7xl mx-auto p-4 sm:p-6">
//                 {/* Header */}
//                 <div className="mb-8">
//                     <div className="flex items-center gap-3 mb-2">
//                         <BarChart2 className="w-8 h-8 text-blue-500" />
//                         <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
//                             Strategy Backtest
//                         </h1>
//                     </div>
//                     <p className="text-gray-600 dark:text-gray-400">
//                         Test and optimize your trading strategies with historical data analysis
//                     </p>
//                 </div>

//                 <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//                     {/* Main Content */}
//                     <div className="lg:col-span-3 space-y-6">
//                         {/* Backtest Type Selection */}
//                         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
//                             <div className="flex items-center justify-between mb-4">
//                                 <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
//                                     Select Backtest Type
//                                 </h2>
//                                 <button
//                                     onClick={() => setShowHistory(!showHistory)}
//                                     className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
//                                 >
//                                     <History className="w-4 h-4" />
//                                     History
//                                 </button>
//                             </div>

//                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                 {backtestTypes.map((type) => (
//                                     <button
//                                         key={type.id}
//                                         onClick={() => setActiveBacktestType(type.id)}
//                                         className={`p-4 rounded-lg border transition-all ${activeBacktestType === type.id
//                                                 ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
//                                                 : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
//                                             }`}
//                                     >
//                                         <div className="flex items-center gap-3">
//                                             <div className={`p-2 rounded-lg ${activeBacktestType === type.id
//                                                     ? 'bg-blue-100 dark:bg-blue-900'
//                                                     : 'bg-gray-100 dark:bg-gray-700'
//                                                 }`}>
//                                                 <PlayCircle className="w-5 h-5" />
//                                             </div>
//                                             <div className="text-left">
//                                                 <h3 className="font-medium text-gray-900 dark:text-white">
//                                                     {type.label}
//                                                 </h3>
//                                                 <p className="text-sm text-gray-500 dark:text-gray-400">
//                                                     {type.description}
//                                                 </p>
//                                             </div>
//                                         </div>
//                                     </button>
//                                 ))}
//                             </div>
//                         </div>

//                         {/* Configuration Form */}
//                         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
//                             <div className="p-6 border-b border-gray-200 dark:border-gray-700">
//                                 <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
//                                     Configuration
//                                 </h2>
//                                 <p className="text-sm text-gray-500 dark:text-gray-400">
//                                     Configure your {activeBacktestType} parameters
//                                 </p>
//                             </div>

//                             <div className="p-6">
//                                 <BacktestForm
//                                     type={activeBacktestType}
//                                     onSubmit={handleBacktestSubmit}
//                                     onSaveConfig={handleSaveConfig}
//                                     isLoading={isLoading || isRunning}
//                                 />
//                             </div>
//                         </div>

//                         {/* Live Stats Panel (ظهور أثناء التشغيل) */}
//                         {isRunning && liveStats && (
//                             <LiveStatsPanel stats={liveStats} />
//                         )}

//                         {/* Results Panel */}
//                         {currentResult && (
//                             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
//                                 <div className="p-6">
//                                     <ResultsPanel
//                                         result={currentResult}
//                                         type={activeBacktestType}
//                                     />
//                                 </div>
//                             </div>
//                         )}
//                     </div>

//                     {/* Sidebar */}
//                     <div className="space-y-6">
//                         {/* Tips Panel */}
//                         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
//                             <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
//                                 <Settings className="w-5 h-5" />
//                                 Backtest Tips
//                             </h3>
//                             <ul className="space-y-3 text-sm">
//                                 <li className="flex items-start gap-2">
//                                     <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5" />
//                                     <span className="text-gray-600 dark:text-gray-400">
//                                         Use at least 6 months of data for reliable results
//                                     </span>
//                                 </li>
//                                 <li className="flex items-start gap-2">
//                                     <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5" />
//                                     <span className="text-gray-600 dark:text-gray-400">
//                                         Include commission and slippage for realistic results
//                                     </span>
//                                 </li>
//                                 <li className="flex items-start gap-2">
//                                     <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5" />
//                                     <span className="text-gray-600 dark:text-gray-400">
//                                         Walk Forward analysis helps validate strategy robustness
//                                     </span>
//                                 </li>
//                                 <li className="flex items-start gap-2">
//                                     <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5" />
//                                     <span className="text-gray-600 dark:text-gray-400">
//                                         Monte Carlo simulation estimates probability of success
//                                     </span>
//                                 </li>
//                             </ul>
//                         </div>

//                         {/* Quick Actions */}
//                         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
//                             <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
//                                 Quick Actions
//                             </h3>
//                             <div className="space-y-2">
//                                 <button className="w-full px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
//                                     Optimize Parameters
//                                 </button>
//                                 <button className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
//                                     Compare Strategies
//                                 </button>
//                                 <button className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
//                                     Generate Report
//                                 </button>
//                             </div>
//                         </div>

//                         {/* History Sidebar */}
//                         {showHistory && (
//                             <HistorySidebar onClose={() => setShowHistory(false)} />
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }