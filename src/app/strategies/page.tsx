


// 'use client';

// // Strategy Builder Page - TradingView-like Interface
// import React, { useState, useEffect } from 'react';
// import { Button } from '@/components/uiadv/button';
// import { Input } from '@/components/uiadv/input';
// import { Label } from '@/components/uiadv/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/uiadv/select';
// import { Card, CardContent } from '@/components/uiadv/card';
// import { Badge } from '@/components/uiadv/badge';
// import { ScrollArea } from '@/components/uiadv/scroll-area';
// import {
//     Play, Save, FolderOpen, Trash2, RefreshCw, CheckCircle2,
//     AlertCircle, Settings, Zap, TrendingUp, Shield, BarChart3,
//     X, ChevronDown, Download, Upload, LayoutTemplate, Sliders,
//     PanelLeftOpen, PanelLeftClose // Icons for expanding/collapsing
// } from 'lucide-react';

// import { IndicatorSelector } from '@/components/strategies/indicator-selector';
// import { RuleBuilder } from '@/components/strategies/rule-builder';
// import {
//     StrategyConfig,
//     EntryRule,
//     ExitRule,
//     FilterRule,
//     IndicatorConfig,
//     RiskManagement,
//     StrategyFromDB,
//     RunStrategyResponse,
//     ValidateStrategyResponse
// } from '@/types/backtest';

// export default function StrategyBuilderPage() {
//     // --- State Management (UNCHANGED) ---
//     const [strategyName, setStrategyName] = useState('My Strategy');
//     const [strategyVersion, setStrategyVersion] = useState('1.0.0');
//     const [strategyDescription, setStrategyDescription] = useState('');
//     const [baseTimeframe, setBaseTimeframe] = useState('1h');
//     const [positionSide, setPositionSide] = useState<'long' | 'short' | 'both'>('both');

//     const [indicators, setIndicators] = useState<IndicatorConfig[]>([]);
//     const [entryRules, setEntryRules] = useState<EntryRule[]>([]);
//     const [exitRules, setExitRules] = useState<ExitRule[]>([]);
//     const [filterRules, setFilterRules] = useState<FilterRule[]>([]);

//     const [riskManagement, setRiskManagement] = useState<RiskManagement>({
//         stop_loss_percentage: 2.0,
//         take_profit_percentage: 4.0,
//         trailing_stop_percentage: 1.0,
//         max_position_size: 0.3,
//         max_daily_loss: 10.0,
//         max_concurrent_positions: 3
//     });

//     const [savedStrategies, setSavedStrategies] = useState<StrategyFromDB[]>([]);
//     const [isStrategiesOpen, setIsStrategiesOpen] = useState(false);

//     const [isIndicatorsExpanded, setIsIndicatorsExpanded] = useState(false);

//     // Run settings
//     const [runSymbol, setRunSymbol] = useState('ETHUSDT');
//     const [runTimeframe, setRunTimeframe] = useState('1h');
//     const [runMarket, setRunMarket] = useState('crypto');
//     const [runDays, setRunDays] = useState(3);
//     const [liveMode, setLiveMode] = useState(false);

//     // Loading and results
//     const [isLoading, setIsLoading] = useState(false);
//     const [runResults, setRunResults] = useState<RunStrategyResponse | null>(null);
//     const [validationResults, setValidationResults] = useState<ValidateStrategyResponse | null>(null);
//     const [notifications, setNotifications] = useState<{ type: 'success' | 'error'; message: string }[]>([]);

//     // --- Effects (UNCHANGED) ---
//     useEffect(() => {
//         loadStrategies();
//     }, []);

//     // --- Helper Functions (UNCHANGED) ---
//     const addNotification = (type: 'success' | 'error', message: string) => {
//         const id = Date.now();
//         setNotifications(prev => [...prev, { type, message }]);
//         setTimeout(() => {
//             setNotifications(prev => prev.filter(n => Date.now() - id < 3000));
//         }, 3000);
//     };

//     const getCurrentStrategy = (): StrategyConfig => {
//         return {
//             name: strategyName,
//             version: strategyVersion,
//             description: strategyDescription,
//             base_timeframe: baseTimeframe,
//             position_side: positionSide,
//             indicators,
//             entry_rules: entryRules,
//             exit_rules: exitRules,
//             filter_rules: filterRules,
//             risk_management: riskManagement
//         };
//     };
    
//     const loadStrategyFromDB = async (strategy: StrategyFromDB) => {
//         try {
//             // استدعاء نقطة النهاية في frontend التي ستجلب البيانات من الخادم
//             const response = await fetch(`/api/v1/strategies1/get_from_db/${encodeURIComponent(strategy.name)}`);
//             if (!response.ok) {
//                 throw new Error('Failed to fetch strategy');
//             }
//             const data = await response.json();
//             if (!data.success) {
//                 throw new Error(data.error || 'Unknown error');
//             }
//             const fullStrategy = data.strategy; // هذه تحتوي على config كامل

//             // الآن نستخدم fullStrategy.config
//             setStrategyName(fullStrategy.config.name);
//             setStrategyVersion(fullStrategy.config.version || '1.0.0');
//             setStrategyDescription(fullStrategy.config.description || '');
//             setBaseTimeframe(fullStrategy.config.base_timeframe);
//             setPositionSide(fullStrategy.config.position_side);
//             setIndicators(fullStrategy.config.indicators || []);
//             setEntryRules(fullStrategy.config.entry_rules || []);
//             setExitRules(fullStrategy.config.exit_rules || []);
//             setFilterRules(fullStrategy.config.filter_rules || []);
//             setRiskManagement(fullStrategy.config.risk_management || riskManagement);
//             setIsStrategiesOpen(false);
//             addNotification('success', `Strategy "${strategy.name}" loaded`);
//         } catch (error) {
//             console.error('Error loading strategy:', error);
//             addNotification('error', `Failed to load strategy: ${(error as Error).message}}`);
//         }
//     };

//     // --- API Calls (UNCHANGED) ---
//     const loadStrategies = async () => {
//         try {
//             const response = await fetch('/api/v1/strategies1/list?active_only=false');
//             const data = await response.json();
//             if (data.success) {
//                 setSavedStrategies(data.strategies);
//             }
//         } catch (error) {
//             console.error('Error loading strategies:', error);
//         }
//     };

//     const saveStrategy = async () => {
//         setIsLoading(true);
//         try {
//             const strategy = getCurrentStrategy();
//             const response = await fetch('/api/v1/strategies1/save', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(strategy),
//             });
//             const data = await response.json();
//             if (data.success) {
//                 addNotification('success', `Strategy "${data.strategy_name}" saved successfully`);
//                 loadStrategies();
//             } else {
//                 addNotification('error', 'Failed to save strategy');
//             }
//         } catch (error) {
//             console.error('Error saving strategy:', error);
//             addNotification('error', 'Failed to save strategy');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const deleteStrategy = async (name: string) => {
//         if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

//         setIsLoading(true);
//         try {
//             const response = await fetch(`/api/v1/strategies1/delete_from_db/${encodeURIComponent(name)}`, {
//                 method: 'DELETE',
//             });
//             const data = await response.json();
//             if (data.success) {
//                 addNotification('success', `Strategy "${name}" deleted`);
//                 loadStrategies();
//             } else {
//                 addNotification('error', 'Failed to delete strategy');
//             }
//         } catch (error) {
//             console.error('Error deleting strategy:', error);
//             addNotification('error', 'Failed to delete strategy');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const runStrategy = async (fromDB = false) => {
//         setIsLoading(true);
//         try {
//             let url = '/api/v1/strategies1/run';
//             let body: any = {
//                 symbol: runSymbol,
//                 timeframe: runTimeframe,
//                 market: runMarket,
//                 days: runDays,
//                 live_mode: liveMode,
//             };

//             if (fromDB) {
//                 body.strategy_name = strategyName;
//             } else {
//                 body.strategy_config = getCurrentStrategy();
//             }

//             const response = await fetch(url, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(body),
//             });

//             const data: RunStrategyResponse = await response.json();
//             setRunResults(data);

//             if (data.decisions && data.decisions.length > 0) {
//                 addNotification('success', `Strategy executed! ${data.decisions.length} decisions generated`);
//             } else {
//                 addNotification('success', 'Strategy executed with no decisions');
//             }
//         } catch (error) {
//             console.error('Error running strategy:', error);
//             addNotification('error', 'Failed to run strategy');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const validateStrategy = async () => {
//         setIsLoading(true);
//         try {
//             const strategy = getCurrentStrategy();
//             const response = await fetch('/api/v1/strategies1/validate', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(strategy),
//             });

//             const data: ValidateStrategyResponse = await response.json();
//             setValidationResults(data);

//             if (data.valid) {
//                 addNotification('success', 'Strategy is valid!');
//             } else {
//                 addNotification('error', 'Strategy validation failed');
//             }
//         } catch (error) {
//             console.error('Error validating strategy:', error);
//             addNotification('error', 'Failed to validate strategy');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1h', '2h', '4h', '1d'];
//     const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT'];

//     return (
//         <div className="flex flex-col min-h-0 h-screen  bg-[#131722] text-slate-300 font-sans overflow-hidden selection:bg-[#2962FF] selection:text-white">

//             {/* --- TOP HEADER --- */}
//             <header className="h-12 bg-[#1E222D] border-b border-[#2A2E39] flex items-center justify-between px-4 shrink-0 z-20 shadow-sm">
//                 {/* Left: Logo & Name */}
//                 <div className="flex items-center gap-6">
//                     <div className="flex items-center gap-2">
//                         <div className="p-1.5 bg-[#2962FF]/10 rounded-md">
//                             <Zap className="h-4 w-4 text-[#2962FF]" />
//                         </div>
//                         <span className="text-xs font-bold text-slate-100 uppercase tracking-widest">Strategy Builder</span>
//                     </div>

//                     <div className="flex items-center gap-2 pl-4 border-l border-[#2A2E39]">
//                         <Input
//                             value={strategyName}
//                             onChange={(e) => setStrategyName(e.target.value)}
//                             className="h-7 w-64 bg-[#2A2E39] border-transparent hover:border-[#363A45] focus:border-[#2962FF] text-xs text-slate-200 font-medium focus:ring-0 px-3 rounded-sm transition-colors"
//                             placeholder="Strategy Name"
//                         />
//                         <Badge variant="outline" className="h-7 px-2 text-[9px] font-mono border-[#2A2E39] bg-[#131722] text-slate-500 rounded-sm hover:bg-[#2A2E39] cursor-default">
//                             v{strategyVersion}
//                         </Badge>
//                     </div>
//                 </div>

//                 {/* Right: Actions */}
//                 <div className="flex items-center gap-2">
//                     <Button
//                         onClick={() => setIsStrategiesOpen(!isStrategiesOpen)}
//                         variant="ghost"
//                         size="sm"
//                         className="h-7 px-3 text-[11px] text-slate-400 hover:text-slate-200 hover:bg-[#2A2E39] font-medium rounded-sm"
//                     >
//                         <FolderOpen className="h-3.5 w-3.5 mr-1.5" />
//                         Load
//                     </Button>
//                     <div className="w-px h-4 bg-[#2A2E39] mx-1" />
//                     <Button
//                         onClick={validateStrategy}
//                         disabled={isLoading}
//                         variant="ghost"
//                         size="sm"
//                         className="h-7 px-3 text-[11px] text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 font-medium rounded-sm"
//                     >
//                         <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
//                         Validate
//                     </Button>
//                     <Button
//                         onClick={saveStrategy}
//                         disabled={isLoading}
//                         variant="ghost"
//                         size="sm"
//                         className="h-7 px-3 text-[11px] text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 font-medium rounded-sm"
//                     >
//                         <Save className="h-3.5 w-3.5 mr-1.5" />
//                         Save
//                     </Button>
//                     <Button
//                         onClick={() => runStrategy(false)}
//                         disabled={isLoading}
//                         className="h-7 px-4 bg-[#2962FF] hover:bg-[#1E53E4] text-white text-[11px] font-bold uppercase rounded-sm shadow-sm"
//                     >
//                         <Play className="h-3.5 w-3.5 mr-1.5" />
//                         Run
//                     </Button>
//                 </div>
//             </header>

//             {/* --- WORKSPACE (Dynamic Width Columns) --- */}
//             <div className="flex-1 flex overflow-auto relative">
//                 {/* --- LEFT SIDEBAR: INDICATORS (RESIZABLE VIA STATE) --- */}
//                 <aside className={`
//                     bg-[#131722] border-r border-[#2A2E39] flex flex-col shrink-0 z-10 
//                     transition-all duration-300 ease-in-out 
//                     ${isIndicatorsExpanded ? 'w-[480px]' : 'w-[380px]'}
//                 `}>
//                     <div className="h-9 bg-[#1E222D] border-b border-[#2A2E39] flex items-center px-3 justify-between shrink-0">
//                         <div className="flex items-center gap-2">
//                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
//                                 <TrendingUp className="h-3 w-3" />
//                                 Indicators
//                             </span>
//                             <Badge variant="secondary" className="h-4 px-1.5 text-[9px] bg-[#2A2E39] text-slate-400 border-none rounded-sm">
//                                 {indicators.length}
//                             </Badge>
//                         </div>

//                         {/* Expansion Toggle Button */}
//                         <Button
//                             onClick={() => setIsIndicatorsExpanded(!isIndicatorsExpanded)}
//                             variant="ghost"
//                             size="sm"
//                             className="h-6 w-6 p-0 text-slate-500 hover:text-slate-200 hover:bg-[#2A2E39]"
//                             title={isIndicatorsExpanded ? "Collapse Panel" : "Expand Panel"}
//                         >
//                             {isIndicatorsExpanded ? <PanelLeftClose className="h-3.5 w-3.5" /> : <PanelLeftOpen className="h-3.5 w-3.5" />}
//                         </Button>
//                     </div>
//                     <div className="flex-1  overflow-auto no-scrollbar">
//                         {/* The component now has more space dynamically */}
//                         <IndicatorSelector
//                             selectedIndicators={indicators}
//                             onIndicatorsChange={setIndicators}
//                             timeframe={baseTimeframe}
//                             onTimeframeChange={setBaseTimeframe}
//                         />
//                     </div>
//                 </aside>

//                 {/* --- CENTER PANEL: MAIN WORKSPACE --- */}
//                 <main className="flex flex-col bg-[#131722] w-[920px]max-w-[65vw]min-w-[720px] overflow-hidden">   {/* Simulation Toolbar */}
//                     <div className="h-11 bg-[#1E222D] border-b border-[#2A2E39] flex items-center justify-between px-4 shrink-0 gap-4 flex-wrap">
//                         <div className="flex items-center gap-4">
//                             <div className="flex items-center gap-1.5">
//                                 <Label className="text-[9px] font-bold text-slate-500 uppercase w-8">Symbol</Label>
//                                 <Select value={runSymbol} onValueChange={setRunSymbol}>
//                                     <SelectTrigger className="h-6 w-28 bg-[#0B0E11] border-[#2A2E39] text-[10px] text-slate-200 font-mono focus:ring-0 px-2 hover:bg-[#1E222D] transition-colors">
//                                         <SelectValue />
//                                     </SelectTrigger>
//                                     <SelectContent className="bg-[#1E222D] border-[#2A2E39] text-[10px] min-w-[120px]">
//                                         {SYMBOLS.map(s => (
//                                             <SelectItem key={s} value={s} className="font-mono">{s}</SelectItem>
//                                         ))}
//                                     </SelectContent>
//                                 </Select>
//                             </div>

//                             <div className="flex items-center gap-1.5">
//                                 <Label className="text-[9px] font-bold text-slate-500 uppercase w-4">TF</Label>
//                                 <Select value={runTimeframe} onValueChange={setRunTimeframe}>
//                                     <SelectTrigger className="h-6 w-16 bg-[#0B0E11] border-[#2A2E39] text-[10px] text-slate-200 font-mono focus:ring-0 px-2 hover:bg-[#1E222D] transition-colors">
//                                         <SelectValue />
//                                     </SelectTrigger>
//                                     <SelectContent className="bg-[#1E222D] border-[#2A2E39] text-[10px] min-w-[80px]">
//                                         {TIMEFRAMES.map(tf => (
//                                             <SelectItem key={tf} value={tf} className="font-mono">{tf}</SelectItem>
//                                         ))}
//                                     </SelectContent>
//                                 </Select>
//                             </div>

//                             <div className="h-4 w-px bg-[#2A2E39]" />

//                             <div className="flex items-center gap-1.5">
//                                 <Label className="text-[9px] font-bold text-slate-500 uppercase w-8">Days</Label>
//                                 <Input
//                                     type="number"
//                                     min={1}
//                                     max={365}
//                                     value={runDays}
//                                     onChange={(e) => setRunDays(parseInt(e.target.value) || 3)}
//                                     className="h-6 w-12 bg-[#0B0E11] border-[#2A2E39] text-[10px] text-slate-200 font-mono focus:ring-0 px-2 text-center hover:bg-[#1E222D] transition-colors"
//                                 />
//                             </div>

//                             <div className="flex items-center gap-1.5">
//                                 <Label className="text-[9px] font-bold text-slate-500 uppercase w-8">Side</Label>
//                                 <Select value={positionSide} onValueChange={(v: any) => setPositionSide(v)}>
//                                     <SelectTrigger className="h-6 w-24 bg-[#0B0E11] border-[#2A2E39] text-[10px] text-slate-200 focus:ring-0 px-2 hover:bg-[#1E222D] transition-colors">
//                                         <SelectValue />
//                                     </SelectTrigger>
//                                     <SelectContent className="bg-[#1E222D] border-[#2A2E39] text-[10px]">
//                                         <SelectItem value="long">Long</SelectItem>
//                                         <SelectItem value="short">Short</SelectItem>
//                                         <SelectItem value="both">Both</SelectItem>
//                                     </SelectContent>
//                                 </Select>
//                             </div>
//                         </div>

//                         {/* Status Indicator */}
//                         {validationResults && (
//                             <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm border ${validationResults.valid ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
//                                 {validationResults.valid ? (
//                                     <CheckCircle2 className="h-3 w-3 text-emerald-500" />
//                                 ) : (
//                                     <AlertCircle className="h-3 w-3 text-red-500" />
//                                 )}
//                                 <span className={`text-[10px] font-bold uppercase ${validationResults.valid ? 'text-emerald-500' : 'text-red-500'}`}>
//                                     {validationResults.valid ? 'Valid' : 'Invalid'}
//                                 </span>
//                             </div>
//                         )}
//                     </div>

//                     {/* Scrollable Content Area */}
//                     <ScrollArea className="flex-1 custom-scrollbar">
//                         <div className="p-4 md:p-6 max-w-full mx-auto space-y-6">

//                             {/* Section: General Info & Risk */}
//                             <div className="grid grid-cols-12 gap-3">
//                                 {/* Description */}
//                                 <div className="col-span-12 lg:col-span-5">
//                                     <Label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block flex items-center gap-1.5">
//                                         <Settings className="h-3 w-3" />
//                                         Description
//                                     </Label>
//                                     <textarea
//                                         value={strategyDescription}
//                                         onChange={(e) => setStrategyDescription(e.target.value)}
//                                         className="w-full h-32 bg-[#1E222D] border border-[#2A2E39] rounded-sm text-xs text-slate-300 focus:ring-0 focus:border-[#2962FF] px-3 py-2 resize-none placeholder:text-slate-600 transition-colors"
//                                         placeholder="Describe your strategy logic..."
//                                     />
//                                 </div>

//                                 {/* Risk Management */}
//                                 <div className="col-span-12 lg:col-span-7">
//                                     <Label className="text-[10px] font-bold text-slate-500 uppercase mb-3 block flex items-center gap-1.5">
//                                         <Shield className="h-3 w-3" />
//                                         Risk Management
//                                     </Label>
//                                     <div className="bg-[#1E222D] border border-[#2A2E39] rounded-sm p-4 grid grid-cols-3 gap-4">
//                                         {/* Inputs Grouped */}
//                                         <div className="space-y-3">
//                                             <div>
//                                                 <div className="flex justify-between mb-1">
//                                                     <Label className="text-[9px] font-bold text-slate-500 uppercase">Stop Loss</Label>
//                                                     <span className="text-[9px] text-slate-400 font-mono">%</span>
//                                                 </div>
//                                                 <Input
//                                                     type="number"
//                                                     step={0.1}
//                                                     value={riskManagement.stop_loss_percentage}
//                                                     onChange={(e) => setRiskManagement({ ...riskManagement, stop_loss_percentage: parseFloat(e.target.value) || 0 })}
//                                                     className="h-7 bg-[#0B0E11] border-[#2A2E39] text-[11px] text-slate-200 font-mono focus:ring-0 px-2 text-right"
//                                                 />
//                                             </div>
//                                             <div>
//                                                 <div className="flex justify-between mb-1">
//                                                     <Label className="text-[9px] font-bold text-slate-500 uppercase">Trailing Stop</Label>
//                                                     <span className="text-[9px] text-slate-400 font-mono">%</span>
//                                                 </div>
//                                                 <Input
//                                                     type="number"
//                                                     step={0.1}
//                                                     value={riskManagement.trailing_stop_percentage}
//                                                     onChange={(e) => setRiskManagement({ ...riskManagement, trailing_stop_percentage: parseFloat(e.target.value) || 0 })}
//                                                     className="h-7 bg-[#0B0E11] border-[#2A2E39] text-[11px] text-slate-200 font-mono focus:ring-0 px-2 text-right"
//                                                 />
//                                             </div>
//                                         </div>

//                                         <div className="space-y-3">
//                                             <div>
//                                                 <div className="flex justify-between mb-1">
//                                                     <Label className="text-[9px] font-bold text-slate-500 uppercase">Take Profit</Label>
//                                                     <span className="text-[9px] text-slate-400 font-mono">%</span>
//                                                 </div>
//                                                 <Input
//                                                     type="number"
//                                                     step={0.1}
//                                                     value={riskManagement.take_profit_percentage}
//                                                     onChange={(e) => setRiskManagement({ ...riskManagement, take_profit_percentage: parseFloat(e.target.value) || 0 })}
//                                                     className="h-7 bg-[#0B0E11] border-[#2A2E39] text-[11px] text-slate-200 font-mono focus:ring-0 px-2 text-right"
//                                                 />
//                                             </div>
//                                             <div>
//                                                 <div className="flex justify-between mb-1">
//                                                     <Label className="text-[9px] font-bold text-slate-500 uppercase">Max Daily Loss</Label>
//                                                     <span className="text-[9px] text-slate-400 font-mono">%</span>
//                                                 </div>
//                                                 <Input
//                                                     type="number"
//                                                     step={0.1}
//                                                     value={riskManagement.max_daily_loss}
//                                                     onChange={(e) => setRiskManagement({ ...riskManagement, max_daily_loss: parseFloat(e.target.value) || 0 })}
//                                                     className="h-7 bg-[#0B0E11] border-[#2A2E39] text-[11px] text-slate-200 font-mono focus:ring-0 px-2 text-right"
//                                                 />
//                                             </div>
//                                         </div>

//                                         <div className="space-y-3">
//                                             <div>
//                                                 <div className="flex justify-between mb-1">
//                                                     <Label className="text-[9px] font-bold text-slate-500 uppercase">Pos. Size</Label>
//                                                     <span className="text-[9px] text-slate-400 font-mono">%</span>
//                                                 </div>
//                                                 <Input
//                                                     type="number"
//                                                     step={0.1}
//                                                     min={0}
//                                                     max={1}
//                                                     value={riskManagement.max_position_size}
//                                                     onChange={(e) => setRiskManagement({ ...riskManagement, max_position_size: parseFloat(e.target.value) || 0 })}
//                                                     className="h-7 bg-[#0B0E11] border-[#2A2E39] text-[11px] text-slate-200 font-mono focus:ring-0 px-2 text-right"
//                                                 />
//                                             </div>
//                                             <div>
//                                                 <div className="flex justify-between mb-1">
//                                                     <Label className="text-[9px] font-bold text-slate-500 uppercase">Max Pos.</Label>
//                                                     <span className="text-[9px] text-slate-400 font-mono">#</span>
//                                                 </div>
//                                                 <Input
//                                                     type="number"
//                                                     min={1}
//                                                     value={riskManagement.max_concurrent_positions}
//                                                     onChange={(e) => setRiskManagement({ ...riskManagement, max_concurrent_positions: parseInt(e.target.value) || 1 })}
//                                                     className="h-7 bg-[#0B0E11] border-[#2A2E39] text-[11px] text-slate-200 font-mono focus:ring-0 px-2 text-right"
//                                                 />
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Section: Results */}
//                             {runResults && (
//                                 <div className="bg-[#1E222D] border border-[#2A2E39] rounded-sm overflow-hidden">
//                                     <div className="h-9 bg-[#2A2E39]/30 border-b border-[#2A2E39] flex items-center px-4 justify-between">
//                                         <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
//                                             <BarChart3 className="h-3 w-3 text-emerald-500" />
//                                             Backtest Results
//                                         </span>
//                                         <span className="text-[9px] font-mono text-slate-500">ID: {runResults.request_id.slice(0, 8)}</span>
//                                     </div>

//                                     {/* Stats Grid */}
//                                     <div className="grid grid-cols-4 divide-x divide-[#2A2E39] border-b border-[#2A2E39]">
//                                         <div className="p-3">
//                                             <div className="text-[9px] text-slate-500 uppercase font-bold mb-1">Bars Processed</div>
//                                             <div className="text-sm font-mono text-slate-200">{runResults.total_bars_processed}</div>
//                                         </div>
//                                         <div className="p-3">
//                                             <div className="text-[9px] text-slate-500 uppercase font-bold mb-1">Total Decisions</div>
//                                             <div className="text-sm font-mono text-slate-200">{runResults.decisions.length}</div>
//                                         </div>
//                                         <div className="p-3">
//                                             <div className="text-[9px] text-slate-500 uppercase font-bold mb-1">Active Signals</div>
//                                             <div className="text-sm font-mono text-slate-200">{runResults.active_decisions_count}</div>
//                                         </div>
//                                         <div className="p-3">
//                                             <div className="text-[9px] text-slate-500 uppercase font-bold mb-1">Market</div>
//                                             <div className="text-sm font-mono text-slate-200 uppercase">{runMarket}</div>
//                                         </div>
//                                     </div>

//                                     {/* Trade Table */}
//                                     <div className="max-h-80 overflow-auto">
//                                         <table className="w-full text-[10px] text-left">
//                                             <thead className="sticky top-0 bg-[#1E222D] z-10 shadow-sm">
//                                                 <tr className="text-slate-500 border-b border-[#2A2E39]">
//                                                     <th className="py-2 px-4 font-mono text-right w-40">Timestamp</th>
//                                                     <th className="py-2 px-4 text-center w-16">Action</th>
//                                                     <th className="py-2 px-4 text-right w-20">Confidence</th>
//                                                     <th className="py-2 px-4 text-left">Reason</th>
//                                                 </tr>
//                                             </thead>
//                                             <tbody className="divide-y divide-[#2A2E39]">
//                                                 {runResults.decisions.slice(0, 50).map((decision, idx) => (
//                                                     <tr key={idx} className="hover:bg-[#2962FF]/5 transition-colors group">
//                                                         <td className="py-2 px-4 font-mono text-slate-400 group-hover:text-slate-200 text-right">
//                                                             {new Date(decision.timestamp).toLocaleString()}
//                                                         </td>
//                                                         <td className="py-2 px-4 text-center">
//                                                             <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${decision.action === 'buy' ? 'bg-emerald-500/10 text-emerald-500' : decision.action === 'sell' ? 'bg-red-500/10 text-red-500' : 'bg-slate-500/10 text-slate-400'}`}>
//                                                                 {decision.action}
//                                                             </span>
//                                                         </td>
//                                                         <td className="py-2 px-4 font-mono text-slate-300 text-right">
//                                                             {decision.confidence.toFixed(3)}
//                                                         </td>
//                                                         <td className="py-2 px-4 text-slate-400 truncate max-w-xs">
//                                                             {decision.reason}
//                                                         </td>
//                                                     </tr>
//                                                 ))}
//                                             </tbody>
//                                         </table>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     </ScrollArea>
//                 </main>

//                 {/* --- RIGHT SIDEBAR: RULES --- */}
//                 <aside className="w-[360px] bg-[#131722] border-l border-[#2A2E39] flex flex-col shrink-0 z-10 flex-shrink-0">    <div className="h-9 bg-[#1E222D] border-b border-[#2A2E39] flex items-center px-3 justify-between shrink-0">
//                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
//                             <LayoutTemplate className="h-3 w-3" />
//                             Strategy Rules
//                         </span>
//                         <div className="flex gap-1">
//                             <Badge variant="secondary" className="h-4 px-1.5 text-[9px] bg-[#2A2E39] text-slate-400 border-none rounded-sm">
//                                 E:{entryRules.length}
//                             </Badge>
//                             <Badge variant="secondary" className="h-4 px-1.5 text-[9px] bg-[#2A2E39] text-slate-400 border-none rounded-sm">
//                                 X:{exitRules.length}
//                             </Badge>
//                         </div>
//                     </div>
//                     <div className="flex-1 overflow-hidden">
//                         <RuleBuilder
//                             entryRules={entryRules}
//                             exitRules={exitRules}
//                             filterRules={filterRules}
//                             onEntryRulesChange={setEntryRules}
//                             onExitRulesChange={setExitRules}
//                             onFilterRulesChange={setFilterRules}
//                             availableIndicators={indicators}
//                         />
//                     </div>
//                 </aside>

//                 {/* --- DRAWER: SAVED STRATEGIES --- */}
//                 {isStrategiesOpen && (
//                     <div className="absolute right-[360px] top-0 bottom-0 w-80 bg-[#1E222D] border-l border-[#2A2E39] shadow-2xl z-30 flex flex-col animate-in slide-in-from-right duration-200 ease-out">
//                         <div className="h-12 flex items-center justify-between px-4 border-b border-[#2A2E39] bg-[#1E222D] shrink-0">
//                             <span className="text-xs font-bold text-slate-200 uppercase tracking-widest">Library</span>
//                             <Button
//                                 onClick={() => setIsStrategiesOpen(false)}
//                                 variant="ghost"
//                                 size="sm"
//                                 className="h-6 w-6 p-0 text-slate-500 hover:text-white hover:bg-[#2A2E39]"
//                             >
//                                 <X className="h-4 w-4" />
//                             </Button>
//                         </div>
//                         <ScrollArea className="flex-1 custom-scrollbar">
//                             <div className="p-3 space-y-2">
//                                 {savedStrategies.length === 0 ? (
//                                     <div className="flex flex-col items-center justify-center py-12 text-slate-600">
//                                         <FolderOpen className="h-8 w-8 mb-2 opacity-50" />
//                                         <div className="text-xs font-mono uppercase">No strategies found</div>
//                                     </div>
//                                 ) : (
//                                     savedStrategies.map((strategy) => (
//                                         <div
//                                             key={strategy.id}
//                                             className="group p-3 bg-[#131722] border border-[#2A2E39] hover:border-[#2962FF] rounded-sm transition-all cursor-pointer relative"
//                                         >
//                                             <div className="flex items-start justify-between mb-1">
//                                                 <div className="flex-1 pr-2">
//                                                     <div className="text-[11px] font-bold text-slate-200 truncate group-hover:text-[#2962FF] transition-colors">
//                                                         {strategy.name}
//                                                     </div>
//                                                     <div className="text-[9px] text-slate-500 font-mono mt-0.5">
//                                                         {new Date(strategy.created_at || Date.now()).toLocaleDateString()}
//                                                     </div>
//                                                 </div>
//                                             </div>

//                                             <div className="text-[10px] text-slate-500 line-clamp-2 mb-3 h-8 leading-tight">
//                                                 {strategy.description || 'No description provided.'}
//                                             </div>

//                                             <div className="flex items-center justify-between pt-2 border-t border-[#2A2E39]">
//                                                 <div className="flex gap-2">
//                                                     <span className="text-[9px] bg-[#1E222D] px-1.5 py-0.5 rounded text-slate-400 border border-[#2A2E39]">
//                                                         {strategy.indicators_count} Ind
//                                                     </span>
//                                                     <span className="text-[9px] bg-[#1E222D] px-1.5 py-0.5 rounded text-slate-400 border border-[#2A2E39]">
//                                                         {strategy.entry_rules_count} Rules
//                                                     </span>
//                                                 </div>

//                                                 {/* إذا أردت عرض قائمة المؤشرات */}
//                                                 {strategy.indicators && strategy.indicators.length > 0 && (
//                                                     <div className="mt-2 text-xs text-slate-400">
//                                                         <div className="font-semibold">المؤشرات:</div>
//                                                         <div className="flex flex-wrap gap-1 mt-1">
//                                                             {strategy.indicators.map((indicator, idx) => (
//                                                                 <span key={idx} className="text-[9px] bg-[#1E222D] px-1 py-0.5 rounded border border-[#2A2E39]">
//                                                                     {indicator.name} ({indicator.timeframe})
//                                                                 </span>
//                                                             ))}
//                                                         </div>
//                                                     </div>
//                                                 )}
//                                                 <div className="flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
//                                                     <Button
//                                                         onClick={() => loadStrategyFromDB(strategy)}
//                                                         variant="ghost"
//                                                         size="sm"
//                                                         className="h-6 w-6 p-0 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400"
//                                                     >
//                                                         <Download className="h-3 w-3" />
//                                                     </Button>
//                                                     <Button
//                                                         onClick={() => deleteStrategy(strategy.name)}
//                                                         variant="ghost"
//                                                         size="sm"
//                                                         className="h-6 w-6 p-0 text-red-500 hover:bg-red-500/10 hover:text-red-400"
//                                                     >
//                                                         <Trash2 className="h-3 w-3" />
//                                                     </Button>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     ))
//                                 )}
//                             </div>
//                         </ScrollArea>
//                     </div>
//                 )}

//             </div>

//             {/* --- NOTIFICATIONS --- */}
//             <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
//                 {notifications.map((notification, idx) => (
//                     <div
//                         key={idx}
//                         className={`pointer-events-auto px-4 py-3 rounded-sm shadow-lg border flex items-center gap-3 min-w-[300px] animate-in slide-in-from-right-4 fade-in duration-300 ${notification.type === 'success'
//                                 ? 'bg-[#0F2E1D]/90 border-emerald-500/30 text-emerald-100'
//                                 : 'bg-[#2D0F15]/90 border-red-500/30 text-red-100'
//                             }`}
//                     >
//                         {notification.type === 'success' ? (
//                             <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
//                         ) : (
//                             <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
//                         )}
//                         <span className="text-xs font-medium">{notification.message}</span>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// }

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/uiadv/button';
import { Input } from '@/components/uiadv/input';
import { Label } from '@/components/uiadv/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/uiadv/select';
import { Card, CardContent } from '@/components/uiadv/card';
import { Badge } from '@/components/uiadv/badge';
import { ScrollArea } from '@/components/uiadv/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/uiadv/sheet';
import {
    Play, Save, FolderOpen, Trash2, CheckCircle2,
    AlertCircle, Settings, Zap, TrendingUp, Shield, BarChart3,
    X, ChevronDown, Download, PanelLeftOpen, PanelLeftClose, Menu
} from 'lucide-react';

import { IndicatorSelector } from '@/components/strategies/indicator-selector';
import { RuleBuilder } from '@/components/strategies/rule-builder';
import {
    StrategyConfig,
    EntryRule,
    ExitRule,
    FilterRule,
    IndicatorConfig,
    RiskManagement,
    StrategyFromDB,
    RunStrategyResponse,
    ValidateStrategyResponse
} from '@/types/backtest';

export default function StrategyBuilderPage() {
    // --- State Management ---
    const [strategyName, setStrategyName] = useState('My Strategy');
    const [strategyVersion, setStrategyVersion] = useState('1.0.0');
    const [strategyDescription, setStrategyDescription] = useState('');
    const [baseTimeframe, setBaseTimeframe] = useState('1h');
    const [positionSide, setPositionSide] = useState<'long' | 'short' | 'both'>('both');

    const [indicators, setIndicators] = useState<IndicatorConfig[]>([]);
    const [entryRules, setEntryRules] = useState<EntryRule[]>([]);
    const [exitRules, setExitRules] = useState<ExitRule[]>([]);
    const [filterRules, setFilterRules] = useState<FilterRule[]>([]);

    const [riskManagement, setRiskManagement] = useState<RiskManagement>({
        stop_loss_percentage: 2.0,
        take_profit_percentage: 4.0,
        trailing_stop_percentage: 1.0,
        max_position_size: 0.3,
        max_daily_loss: 10.0,
        max_concurrent_positions: 3
    });

    const [savedStrategies, setSavedStrategies] = useState<StrategyFromDB[]>([]);
    const [isStrategiesOpen, setIsStrategiesOpen] = useState(false);
    const [isIndicatorsOpen, setIsIndicatorsOpen] = useState(false);
    const [isRulesOpen, setIsRulesOpen] = useState(false);
    const [isIndicatorsExpanded, setIsIndicatorsExpanded] = useState(false);

    // Run settings
    const [runSymbol, setRunSymbol] = useState('ETHUSDT');
    const [runTimeframe, setRunTimeframe] = useState('1h');
    const [runMarket, setRunMarket] = useState('crypto');
    const [runDays, setRunDays] = useState(3);
    const [liveMode, setLiveMode] = useState(false);

    // Loading and results
    const [isLoading, setIsLoading] = useState(false);
    const [runResults, setRunResults] = useState<RunStrategyResponse | null>(null);
    const [validationResults, setValidationResults] = useState<ValidateStrategyResponse | null>(null);
    const [notifications, setNotifications] = useState<{ type: 'success' | 'error'; message: string }[]>([]);

    // --- Effects ---
    useEffect(() => {
        loadStrategies();
    }, []);

    // --- Helper Functions ---
    const addNotification = (type: 'success' | 'error', message: string) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { type, message }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => Date.now() - id < 3000));
        }, 3000);
    };

    const getCurrentStrategy = (): StrategyConfig => {
        return {
            name: strategyName,
            version: strategyVersion,
            description: strategyDescription,
            base_timeframe: baseTimeframe,
            position_side: positionSide,
            indicators,
            entry_rules: entryRules,
            exit_rules: exitRules,
            filter_rules: filterRules,
            risk_management: riskManagement
        };
    };

    const loadStrategyFromDB = async (strategy: StrategyFromDB) => {
        try {
            const response = await fetch(`/api/v1/strategies1/get_from_db/${encodeURIComponent(strategy.name)}`);
            if (!response.ok) {
                throw new Error('Failed to fetch strategy');
            }
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Unknown error');
            }
            const fullStrategy = data.strategy;

            setStrategyName(fullStrategy.config.name);
            setStrategyVersion(fullStrategy.config.version || '1.0.0');
            setStrategyDescription(fullStrategy.config.description || '');
            setBaseTimeframe(fullStrategy.config.base_timeframe);
            setPositionSide(fullStrategy.config.position_side);
            setIndicators(fullStrategy.config.indicators || []);
            setEntryRules(fullStrategy.config.entry_rules || []);
            setExitRules(fullStrategy.config.exit_rules || []);
            setFilterRules(fullStrategy.config.filter_rules || []);
            setRiskManagement(fullStrategy.config.risk_management || riskManagement);
            setIsStrategiesOpen(false);
            addNotification('success', `Strategy "${strategy.name}" loaded`);
        } catch (error) {
            console.error('Error loading strategy:', error);
            addNotification('error', `Failed to load strategy: ${(error as Error).message}}`);
        }
    };

    // --- API Calls ---
    const loadStrategies = async () => {
        try {
            const response = await fetch('/api/v1/strategies1/list?active_only=false');
            const data = await response.json();
            if (data.success) {
                setSavedStrategies(data.strategies);
            }
        } catch (error) {
            console.error('Error loading strategies:', error);
        }
    };

    const saveStrategy = async () => {
        setIsLoading(true);
        try {
            const strategy = getCurrentStrategy();
            const response = await fetch('/api/v1/strategies1/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(strategy),
            });
            const data = await response.json();
            if (data.success) {
                addNotification('success', `Strategy "${data.strategy_name}" saved successfully`);
                loadStrategies();
            } else {
                addNotification('error', 'Failed to save strategy');
            }
        } catch (error) {
            console.error('Error saving strategy:', error);
            addNotification('error', 'Failed to save strategy');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteStrategy = async (name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/v1/strategies1/delete_from_db/${encodeURIComponent(name)}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (data.success) {
                addNotification('success', `Strategy "${name}" deleted`);
                loadStrategies();
            } else {
                addNotification('error', 'Failed to delete strategy');
            }
        } catch (error) {
            console.error('Error deleting strategy:', error);
            addNotification('error', 'Failed to delete strategy');
        } finally {
            setIsLoading(false);
        }
    };

    const runStrategy = async (fromDB = false) => {
        setIsLoading(true);
        try {
            let url = '/api/v1/strategies1/run';
            let body: any = {
                symbol: runSymbol,
                timeframe: runTimeframe,
                market: runMarket,
                days: runDays,
                live_mode: liveMode,
            };

            if (fromDB) {
                body.strategy_name = strategyName;
            } else {
                body.strategy_config = getCurrentStrategy();
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data: RunStrategyResponse = await response.json();
            setRunResults(data);

            if (data.decisions && data.decisions.length > 0) {
                addNotification('success', `Strategy executed! ${data.decisions.length} decisions generated`);
            } else {
                addNotification('success', 'Strategy executed with no decisions');
            }
        } catch (error) {
            console.error('Error running strategy:', error);
            addNotification('error', 'Failed to run strategy');
        } finally {
            setIsLoading(false);
        }
    };

    const validateStrategy = async () => {
        setIsLoading(true);
        try {
            const strategy = getCurrentStrategy();
            const response = await fetch('/api/v1/strategies1/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(strategy),
            });

            const data: ValidateStrategyResponse = await response.json();
            setValidationResults(data);

            if (data.valid) {
                addNotification('success', 'Strategy is valid!');
            } else {
                addNotification('error', 'Strategy validation failed');
            }
        } catch (error) {
            console.error('Error validating strategy:', error);
            addNotification('error', 'Failed to validate strategy');
        } finally {
            setIsLoading(false);
        }
    };

    const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1h', '2h', '4h', '1d'];
    const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT'];

    return (
        <div className="flex flex-col min-h-0 h-screen bg-background text-foreground font-sans overflow-hidden selection:bg-primary selection:text-primary-foreground">

            {/* --- TOP HEADER --- */}
            <header className="h-12 sm:h-12 bg-card border-b border-border flex items-center justify-between px-3 sm:px-4 shrink-0 z-20 shadow-sm safe-top">
                {/* Left: Logo, Name & Mobile Menu */}
                <div className="flex items-center gap-3 sm:gap-6">
                    {/* Mobile Menu Button */}
                    <Button
                        onClick={() => setIsIndicatorsOpen(!isIndicatorsOpen)}
                        variant="ghost"
                        size="sm"
                        className="lg:hidden h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                        <Menu className="h-4 w-4" />
                    </Button>

                    {/* Logo & Name */}
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-md">
                            <Zap className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-[10px] sm:text-xs font-bold text-foreground uppercase tracking-widest hidden sm:block">Strategy Builder</span>
                    </div>

                    {/* Strategy Name Input - Hidden on small mobile */}
                    <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-border">
                        <Input
                            value={strategyName}
                            onChange={(e) => setStrategyName(e.target.value)}
                            className="h-7 w-40 md:w-64 bg-muted border-transparent hover:border-border focus:border-primary text-xs text-foreground font-medium focus:ring-0 px-3 rounded-sm transition-colors"
                            placeholder="Strategy Name"
                        />
                        <Badge variant="outline" className="h-7 px-2 text-[9px] font-mono border-border bg-background text-muted-foreground rounded-sm cursor-default">
                            v{strategyVersion}
                        </Badge>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 sm:gap-2">
                    {/* Mobile only - Quick access to Rules */}
                    <Button
                        onClick={() => setIsRulesOpen(true)}
                        variant="ghost"
                        size="sm"
                        className="lg:hidden h-7 px-3 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted font-medium rounded-sm"
                    >
                        <Settings className="h-3.5 w-3.5 sm:mr-1.5" />
                        <span className="hidden sm:inline">Rules</span>
                    </Button>

                    <Button
                        onClick={() => setIsStrategiesOpen(!isStrategiesOpen)}
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 sm:px-3 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted font-medium rounded-sm"
                    >
                        <FolderOpen className="h-3.5 w-3.5 sm:mr-1.5" />
                        <span className="hidden sm:inline">Load</span>
                    </Button>
                    <div className="hidden sm:block w-px h-4 bg-border mx-1" />
                    <Button
                        onClick={validateStrategy}
                        disabled={isLoading}
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 sm:px-3 text-[11px] text-muted-foreground hover:text-warning hover:bg-warning/10 font-medium rounded-sm"
                    >
                        <CheckCircle2 className="h-3.5 w-3.5 sm:mr-1.5" />
                        <span className="hidden sm:inline">Validate</span>
                    </Button>
                    <Button
                        onClick={saveStrategy}
                        disabled={isLoading}
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 sm:px-3 text-[11px] text-muted-foreground hover:text-success hover:bg-success/10 font-medium rounded-sm"
                    >
                        <Save className="h-3.5 w-3.5 sm:mr-1.5" />
                        <span className="hidden sm:inline">Save</span>
                    </Button>
                    <Button
                        onClick={() => runStrategy(false)}
                        disabled={isLoading}
                        className="h-7 px-3 sm:px-4 bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-bold uppercase rounded-sm shadow-sm"
                    >
                        <Play className="h-3.5 w-3.5 sm:mr-1.5" />
                        <span className="hidden sm:inline">Run</span>
                    </Button>
                </div>
            </header>

            {/* --- WORKSPACE --- */}
            <div className="flex-1 flex overflow-auto relative">

                {/* --- LEFT SIDEBAR: INDICATORS (Desktop) --- */}
                <aside className={`
          hidden lg:flex bg-background border-r border-border flex-col shrink-0 z-10
          transition-all duration-300 ease-in-out
          ${isIndicatorsExpanded ? 'w-[480px]' : 'w-[380px]'}
        `}>
                    <div className="h-9 bg-card border-b border-border flex items-center px-3 justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <TrendingUp className="h-3 w-3" />
                                Indicators
                            </span>
                            <Badge variant="secondary" className="h-4 px-1.5 text-[9px] bg-muted text-muted-foreground border-none rounded-sm">
                                {indicators.length}
                            </Badge>
                        </div>

                        {/* Expansion Toggle Button */}
                        <Button
                            onClick={() => setIsIndicatorsExpanded(!isIndicatorsExpanded)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                            title={isIndicatorsExpanded ? "Collapse Panel" : "Expand Panel"}
                        >
                            {isIndicatorsExpanded ? <PanelLeftClose className="h-3.5 w-3.5" /> : <PanelLeftOpen className="h-3.5 w-3.5" />}
                        </Button>
                    </div>
                    <div className="flex-1 overflow-auto no-scrollbar">
                        <IndicatorSelector
                            selectedIndicators={indicators}
                            onIndicatorsChange={setIndicators}
                            timeframe={baseTimeframe}
                            onTimeframeChange={setBaseTimeframe}
                        />
                    </div>
                </aside>

                {/* --- CENTER PANEL: MAIN WORKSPACE --- */}
                <main className="flex flex-col bg-background flex-1 min-w-0 overflow-hidden">
                    {/* Simulation Toolbar */}
                    <div className="h-11 bg-card border-b border-border flex items-center justify-between px-3 sm:px-4 shrink-0 gap-2 sm:gap-4 flex-wrap">
                        <div className="flex items-center gap-2 sm:gap-4 w-full lg:w-auto overflow-x-auto">
                            {/* Symbol Select */}
                            <div className="flex items-center gap-1.5 shrink-0">
                                <Label className="text-[9px] font-bold text-muted-foreground uppercase w-6 sm:w-8">Symbol</Label>
                                <Select value={runSymbol} onValueChange={setRunSymbol}>
                                    <SelectTrigger className="h-6 w-20 sm:w-28 bg-background border-border text-[10px] text-foreground font-mono focus:ring-0 px-2 hover:bg-muted transition-colors">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border text-[10px] min-w-[120px]">
                                        {SYMBOLS.map(s => (
                                            <SelectItem key={s} value={s} className="font-mono">{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Timeframe Select */}
                            <div className="flex items-center gap-1.5 shrink-0">
                                <Label className="text-[9px] font-bold text-muted-foreground uppercase w-3 sm:w-4">TF</Label>
                                <Select value={runTimeframe} onValueChange={setRunTimeframe}>
                                    <SelectTrigger className="h-6 w-14 sm:w-16 bg-background border-border text-[10px] text-foreground font-mono focus:ring-0 px-2 hover:bg-muted transition-colors">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border text-[10px] min-w-[80px]">
                                        {TIMEFRAMES.map(tf => (
                                            <SelectItem key={tf} value={tf} className="font-mono">{tf}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="h-4 w-px bg-border shrink-0" />

                            {/* Days Input */}
                            <div className="flex items-center gap-1.5 shrink-0">
                                <Label className="text-[9px] font-bold text-muted-foreground uppercase w-6 sm:w-8">Days</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={365}
                                    value={runDays}
                                    onChange={(e) => setRunDays(parseInt(e.target.value) || 3)}
                                    className="h-6 w-10 sm:w-12 bg-background border-border text-[10px] text-foreground font-mono focus:ring-0 px-2 text-center hover:bg-muted transition-colors"
                                />
                            </div>

                            {/* Position Side Select */}
                            <div className="flex items-center gap-1.5 shrink-0">
                                <Label className="text-[9px] font-bold text-muted-foreground uppercase w-6 sm:w-8">Side</Label>
                                <Select value={positionSide} onValueChange={(v: any) => setPositionSide(v)}>
                                    <SelectTrigger className="h-6 w-20 sm:w-24 bg-background border-border text-[10px] text-foreground focus:ring-0 px-2 hover:bg-muted transition-colors">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border text-[10px]">
                                        <SelectItem value="long">Long</SelectItem>
                                        <SelectItem value="short">Short</SelectItem>
                                        <SelectItem value="both">Both</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Status Indicator */}
                        {validationResults && (
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm border shrink-0 ${validationResults.valid ? 'bg-success/5 border-success/20' : 'bg-destructive/5 border-destructive/20'}`}>
                                {validationResults.valid ? (
                                    <CheckCircle2 className="h-3 w-3 text-success" />
                                ) : (
                                    <AlertCircle className="h-3 w-3 text-destructive" />
                                )}
                                <span className={`text-[10px] font-bold uppercase ${validationResults.valid ? 'text-success' : 'text-destructive'}`}>
                                    {validationResults.valid ? 'Valid' : 'Invalid'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Scrollable Content Area */}
                    <ScrollArea className="flex-1 custom-scrollbar">
                        <div className="p-3 sm:p-4 md:p-6 max-w-full mx-auto space-y-4 sm:space-y-6">
                            {/* Mobile Strategy Name */}
                            <div className="sm:hidden">
                                <Input
                                    value={strategyName}
                                    onChange={(e) => setStrategyName(e.target.value)}
                                    className="h-9 w-full bg-muted border-transparent hover:border-border focus:border-primary text-sm text-foreground font-medium focus:ring-0 px-3 rounded-sm transition-colors"
                                    placeholder="Strategy Name"
                                />
                            </div>

                            {/* Section: General Info & Risk */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                                {/* Description */}
                                <div className="col-span-1 lg:col-span-5">
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase mb-2 block flex items-center gap-1.5">
                                        <Settings className="h-3 w-3" />
                                        Description
                                    </Label>
                                    <textarea
                                        value={strategyDescription}
                                        onChange={(e) => setStrategyDescription(e.target.value)}
                                        className="w-full h-24 sm:h-32 bg-card border border-border rounded-sm text-xs text-muted-foreground focus:ring-0 focus:border-primary px-3 py-2 resize-none placeholder:text-muted-foreground/50 transition-colors"
                                        placeholder="Describe your strategy logic..."
                                    />
                                </div>

                                {/* Risk Management */}
                                <div className="col-span-1 lg:col-span-7">
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase mb-2 sm:mb-3 block flex items-center gap-1.5">
                                        <Shield className="h-3 w-3" />
                                        Risk Management
                                    </Label>
                                    <div className="bg-card border border-border rounded-sm p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                        {/* Inputs Grouped */}
                                        <div className="space-y-2 sm:space-y-3">
                                            <div>
                                                <div className="flex justify-between mb-1">
                                                    <Label className="text-[9px] font-bold text-muted-foreground uppercase">Stop Loss</Label>
                                                    <span className="text-[9px] text-muted-foreground font-mono">%</span>
                                                </div>
                                                <Input
                                                    type="number"
                                                    step={0.1}
                                                    value={riskManagement.stop_loss_percentage}
                                                    onChange={(e) => setRiskManagement({ ...riskManagement, stop_loss_percentage: parseFloat(e.target.value) || 0 })}
                                                    className="h-7 bg-background border-border text-[11px] text-foreground font-mono focus:ring-0 px-2 text-right"
                                                />
                                            </div>
                                            <div>
                                                <div className="flex justify-between mb-1">
                                                    <Label className="text-[9px] font-bold text-muted-foreground uppercase">Trailing Stop</Label>
                                                    <span className="text-[9px] text-muted-foreground font-mono">%</span>
                                                </div>
                                                <Input
                                                    type="number"
                                                    step={0.1}
                                                    value={riskManagement.trailing_stop_percentage}
                                                    onChange={(e) => setRiskManagement({ ...riskManagement, trailing_stop_percentage: parseFloat(e.target.value) || 0 })}
                                                    className="h-7 bg-background border-border text-[11px] text-foreground font-mono focus:ring-0 px-2 text-right"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2 sm:space-y-3">
                                            <div>
                                                <div className="flex justify-between mb-1">
                                                    <Label className="text-[9px] font-bold text-muted-foreground uppercase">Take Profit</Label>
                                                    <span className="text-[9px] text-muted-foreground font-mono">%</span>
                                                </div>
                                                <Input
                                                    type="number"
                                                    step={0.1}
                                                    value={riskManagement.take_profit_percentage}
                                                    onChange={(e) => setRiskManagement({ ...riskManagement, take_profit_percentage: parseFloat(e.target.value) || 0 })}
                                                    className="h-7 bg-background border-border text-[11px] text-foreground font-mono focus:ring-0 px-2 text-right"
                                                />
                                            </div>
                                            <div>
                                                <div className="flex justify-between mb-1">
                                                    <Label className="text-[9px] font-bold text-muted-foreground uppercase">Max Daily Loss</Label>
                                                    <span className="text-[9px] text-muted-foreground font-mono">%</span>
                                                </div>
                                                <Input
                                                    type="number"
                                                    step={0.1}
                                                    value={riskManagement.max_daily_loss}
                                                    onChange={(e) => setRiskManagement({ ...riskManagement, max_daily_loss: parseFloat(e.target.value) || 0 })}
                                                    className="h-7 bg-background border-border text-[11px] text-foreground font-mono focus:ring-0 px-2 text-right"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2 sm:space-y-3">
                                            <div>
                                                <div className="flex justify-between mb-1">
                                                    <Label className="text-[9px] font-bold text-muted-foreground uppercase">Pos. Size</Label>
                                                    <span className="text-[9px] text-muted-foreground font-mono">%</span>
                                                </div>
                                                <Input
                                                    type="number"
                                                    step={0.1}
                                                    min={0}
                                                    max={1}
                                                    value={riskManagement.max_position_size}
                                                    onChange={(e) => setRiskManagement({ ...riskManagement, max_position_size: parseFloat(e.target.value) || 0 })}
                                                    className="h-7 bg-background border-border text-[11px] text-foreground font-mono focus:ring-0 px-2 text-right"
                                                />
                                            </div>
                                            <div>
                                                <div className="flex justify-between mb-1">
                                                    <Label className="text-[9px] font-bold text-muted-foreground uppercase">Max Pos.</Label>
                                                    <span className="text-[9px] text-muted-foreground font-mono">#</span>
                                                </div>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    value={riskManagement.max_concurrent_positions}
                                                    onChange={(e) => setRiskManagement({ ...riskManagement, max_concurrent_positions: parseInt(e.target.value) || 1 })}
                                                    className="h-7 bg-background border-border text-[11px] text-foreground font-mono focus:ring-0 px-2 text-right"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Results */}
                            {runResults && (
                                <div className="bg-card border border-border rounded-sm overflow-hidden">
                                    <div className="h-9 bg-muted/30 border-b border-border flex items-center px-4 justify-between">
                                        <span className="text-[10px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                                            <BarChart3 className="h-3 w-3 text-success" />
                                            Backtest Results
                                        </span>
                                        <span className="text-[9px] font-mono text-muted-foreground">ID: {runResults.request_id.slice(0, 8)}</span>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border border-b border-border">
                                        <div className="p-2 sm:p-3">
                                            <div className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Bars Processed</div>
                                            <div className="text-xs sm:text-sm font-mono text-foreground">{runResults.total_bars_processed}</div>
                                        </div>
                                        <div className="p-2 sm:p-3">
                                            <div className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Total Decisions</div>
                                            <div className="text-xs sm:text-sm font-mono text-foreground">{runResults.decisions.length}</div>
                                        </div>
                                        <div className="p-2 sm:p-3">
                                            <div className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Active Signals</div>
                                            <div className="text-xs sm:text-sm font-mono text-foreground">{runResults.active_decisions_count}</div>
                                        </div>
                                        <div className="p-2 sm:p-3">
                                            <div className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Market</div>
                                            <div className="text-xs sm:text-sm font-mono text-foreground uppercase">{runMarket}</div>
                                        </div>
                                    </div>

                                    {/* Trade Table */}
                                    <div className="max-h-64 sm:max-h-80 overflow-auto">
                                        <div className="mobile-table-container">
                                            <table className="w-full text-[10px] text-left">
                                                <thead className="sticky top-0 bg-card z-10 shadow-sm">
                                                    <tr className="text-muted-foreground border-b border-border">
                                                        <th className="py-2 px-2 sm:px-4 font-mono text-right w-32 sm:w-40">Timestamp</th>
                                                        <th className="py-2 px-2 sm:px-4 text-center w-14 sm:w-16">Action</th>
                                                        <th className="py-2 px-2 sm:px-4 text-right w-16 sm:w-20">Confidence</th>
                                                        <th className="py-2 px-2 sm:px-4 text-left">Reason</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border">
                                                    {runResults.decisions.slice(0, 50).map((decision, idx) => (
                                                        <tr key={idx} className="hover:bg-primary/5 transition-colors group">
                                                            <td className="py-2 px-2 sm:px-4 font-mono text-muted-foreground group-hover:text-foreground text-right text-[9px] sm:text-[10px]">
                                                                {new Date(decision.timestamp).toLocaleString()}
                                                            </td>
                                                            <td className="py-2 px-2 sm:px-4 text-center">
                                                                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${decision.action === 'buy' ? 'bg-success/10 text-success' : decision.action === 'sell' ? 'bg-destructive/10 text-destructive' : 'bg-muted/10 text-muted-foreground'}`}>
                                                                    {decision.action}
                                                                </span>
                                                            </td>
                                                            <td className="py-2 px-2 sm:px-4 font-mono text-foreground text-right">
                                                                {decision.confidence.toFixed(3)}
                                                            </td>
                                                            <td className="py-2 px-2 sm:px-4 text-muted-foreground truncate max-w-24 sm:max-w-xs">
                                                                {decision.reason}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </main>

                {/* --- RIGHT SIDEBAR: RULES (Desktop) --- */}
                <aside className="hidden lg:flex w-[360px] bg-background border-l border-border flex-col shrink-0 z-10">
                    <div className="h-9 bg-card border-b border-border flex items-center px-3 justify-between shrink-0">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <Settings className="h-3 w-3" />
                            Strategy Rules
                        </span>
                        <div className="flex gap-1">
                            <Badge variant="secondary" className="h-4 px-1.5 text-[9px] bg-muted text-muted-foreground border-none rounded-sm">
                                E:{entryRules.length}
                            </Badge>
                            <Badge variant="secondary" className="h-4 px-1.5 text-[9px] bg-muted text-muted-foreground border-none rounded-sm">
                                X:{exitRules.length}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <RuleBuilder
                            entryRules={entryRules}
                            exitRules={exitRules}
                            filterRules={filterRules}
                            onEntryRulesChange={setEntryRules}
                            onExitRulesChange={setExitRules}
                            onFilterRulesChange={setFilterRules}
                            availableIndicators={indicators}
                        />
                    </div>
                </aside>

                {/* --- DRAWER: SAVED STRATEGIES --- */}
                {isStrategiesOpen && (
                    <div className="fixed right-0 top-12 bottom-0 w-80 sm:w-96 bg-card border-l border-border shadow-2xl z-30 flex flex-col animate-in slide-in-from-right duration-200 ease-out">
                        <div className="h-12 flex items-center justify-between px-4 border-b border-border bg-card shrink-0">
                            <span className="text-xs font-bold text-foreground uppercase tracking-widest">Library</span>
                            <Button
                                onClick={() => setIsStrategiesOpen(false)}
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <ScrollArea className="flex-1 custom-scrollbar">
                            <div className="p-3 space-y-2">
                                {savedStrategies.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                        <FolderOpen className="h-8 w-8 mb-2 opacity-50" />
                                        <div className="text-xs font-mono uppercase">No strategies found</div>
                                    </div>
                                ) : (
                                    savedStrategies.map((strategy) => (
                                        <div
                                            key={strategy.id}
                                            className="group p-3 bg-background border border-border hover:border-primary rounded-sm transition-all cursor-pointer relative"
                                        >
                                            <div className="flex items-start justify-between mb-1">
                                                <div className="flex-1 pr-2 min-w-0">
                                                    <div className="text-[11px] font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                                        {strategy.name}
                                                    </div>
                                                    <div className="text-[9px] text-muted-foreground font-mono mt-0.5">
                                                        {new Date(strategy.created_at || Date.now()).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-[10px] text-muted-foreground line-clamp-2 mb-3 h-8 leading-tight">
                                                {strategy.description || 'No description provided.'}
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t border-border">
                                                <div className="flex gap-2 flex-wrap">
                                                    <span className="text-[9px] bg-card px-1.5 py-0.5 rounded text-muted-foreground border border-border">
                                                        {strategy.indicators_count} Ind
                                                    </span>
                                                    <span className="text-[9px] bg-card px-1.5 py-0.5 rounded text-muted-foreground border border-border">
                                                        {strategy.entry_rules_count} Rules
                                                    </span>
                                                </div>

                                                <div className="flex gap-1">
                                                    <Button
                                                        onClick={() => loadStrategyFromDB(strategy)}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0 text-success hover:bg-success/10 hover:text-success"
                                                    >
                                                        <Download className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => deleteStrategy(strategy.name)}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                )}

            </div>

            {/* --- MOBILE SHEETS --- */}

            {/* Indicators Sheet (Mobile) */}
            <Sheet open={isIndicatorsOpen} onOpenChange={setIsIndicatorsOpen}>
                <SheetContent side="left" className="w-full sm:w-96 bg-background border-r border-border p-0">
                    <SheetHeader className="h-9 bg-card border-b border-border flex items-center px-4 justify-between shrink-0">
                        <SheetTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <TrendingUp className="h-3 w-3" />
                            Indicators
                        </SheetTitle>
                        <Button
                            onClick={() => setIsIndicatorsOpen(false)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </SheetHeader>
                    <div className="h-full overflow-auto">
                        <IndicatorSelector
                            selectedIndicators={indicators}
                            onIndicatorsChange={setIndicators}
                            timeframe={baseTimeframe}
                            onTimeframeChange={setBaseTimeframe}
                        />
                    </div>
                </SheetContent>
            </Sheet>

            {/* Rules Sheet (Mobile) */}
            <Sheet open={isRulesOpen} onOpenChange={setIsRulesOpen}>
                <SheetContent side="right" className="w-full sm:w-96 bg-background border-l border-border p-0">
                    <SheetHeader className="h-9 bg-card border-b border-border flex items-center px-4 justify-between shrink-0">
                        <SheetTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <Settings className="h-3 w-3" />
                            Strategy Rules
                        </SheetTitle>
                        <Button
                            onClick={() => setIsRulesOpen(false)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </SheetHeader>
                    <div className="h-full overflow-auto">
                        <RuleBuilder
                            entryRules={entryRules}
                            exitRules={exitRules}
                            filterRules={filterRules}
                            onEntryRulesChange={setEntryRules}
                            onExitRulesChange={setExitRules}
                            onFilterRulesChange={setFilterRules}
                            availableIndicators={indicators}
                        />
                    </div>
                </SheetContent>
            </Sheet>

            {/* --- NOTIFICATIONS --- */}
            <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 pointer-events-none">
                {notifications.map((notification, idx) => (
                    <div
                        key={idx}
                        className={`pointer-events-auto px-3 sm:px-4 py-2 sm:py-3 rounded-sm shadow-lg border flex items-center gap-3 min-w-[280px] sm:min-w-[300px] animate-in slide-in-from-right-4 fade-in duration-300 ${notification.type === 'success'
                            ? 'bg-success/10 border-success/30 text-success-foreground'
                            : 'bg-destructive/10 border-destructive/30 text-destructive-foreground'
                            }`}
                    >
                        {notification.type === 'success' ? (
                            <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                        ) : (
                            <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                        )}
                        <span className="text-xs font-medium">{notification.message}</span>
                    </div>
                ))}
            </div>

        </div>
    );
}