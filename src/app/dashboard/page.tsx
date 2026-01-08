// // 'use client';

// // import React, { useEffect, useState } from 'react';
// // import { useRouter } from 'next/navigation';
// // import {
// //     TrendingUp,
// //     TrendingDown,
// //     DollarSign,
// //     Activity,
// //     Bell,
// //     Star,
// //     RefreshCw,
// //     AlertCircle,
// //     BarChart2,
// //     PieChart,
// //     Clock
// // } from 'lucide-react';
// // import { useRootStore } from '../../stores/root.store';
// // import { useMarketStore } from '../../stores/market.store';
// // import { useSignalStore } from '../../stores/signals.store';
// // import { useSettingsStore } from '../../stores/settings.store';

// // import { MarketSummary } from '../../components/dashboard/MarketSummary';
// // import { AssetGrid } from '../../components/dashboard/AssetGrid';
// // import { QuickStats } from '../../components/dashboard/QuickStats';
// // import { ActiveSignals } from '../../components/dashboard/ActiveSignals';
// // import { Watchlist } from '../../components/dashboard/Watchlist';
// // import { PerformanceChart } from '../../components/dashboard/PerformanceChart';

// // import { Loader } from '../../components/ui/Loader/Loader';

// // import { Button } from '../../components/ui/Button/Button';
// // import { DateFormatter } from '../../utils/formatters/date.formatter';
// // import { PriceFormatter } from '../../utils/formatters/price.formatter';

// // import { MetricCard } from '@/components/ui/Card/MetricCard';
// // import Alert from '@/components/ui/Alert/Alert';
// // import { useWebSocket } from '@/hooks/websocket/useWebSocket';


// // export default function DashboardPage() {
// //     const router = useRouter();
// //     const [isLoading, setIsLoading] = useState(true);
// //     const [selectedMarket, setSelectedMarket] = useState<'crypto' | 'stocks'>('crypto');
// //     const [timeRange, setTimeRange] = useState<'1d' | '1w' | '1m' | '1y'>('1w');

// //     const {
// //         isInitialized,
// //         isLoading: rootLoading,
// //         error: rootError,
// //         syncAllData,
// //         clearError
// //     } = useRootStore();

// //     const {
// //         symbols,
// //         // prices,
// //         marketSummary,
// //         topGainers,
// //         topLosers,
// //         volumeLeaders,
// //         loadMarketData,
// //         subscribeToLivePrices,
// //         toggleWatchlist  // إضافة toggleWatchlist هنا
// //     } = useMarketStore();

// //     const {
// //         activeSignals,
// //         recentSignals,
// //         signalStats,
// //         loadSignals,
// //         subscribeToLiveSignals
// //     } = useSignalStore();

// //     const {
// //         fetchWatchlists,
// //         watchlists,
// //         activeWatchlistId
// //     } = useSettingsStore();

// //     const { connect, disconnect, isConnected } = useWebSocket({
// //         onMessage: (data) => {
// //             handleWebSocketMessage(data);
// //         },
// //         onConnect: () => {
// //             console.log('WebSocket connected for dashboard');
// //             subscribeToLiveData();
// //         },
// //         onDisconnect: () => {
// //             console.log('WebSocket disconnected');
// //         }
// //     });

// //     useEffect(() => {
// //         initializeDashboard();

// //         return () => {
// //             disconnect();
// //         };
// //     }, [selectedMarket]);

// //     const initializeDashboard = async () => {
// //         setIsLoading(true);
// //         try {
// //             // Load all required data
// //             await Promise.all([
// //                 loadMarketData(selectedMarket),
// //                 loadSignals(),
// //                 fetchWatchlists(),
// //                 // loadPortfolio()  // إزالة إذا لم يكن موجودًا
// //             ]);

// //             // Connect to WebSocket for live updates
// //             connect();
// //         } catch (error) {
// //             console.error('Dashboard initialization failed:', error);
// //         } finally {
// //             setIsLoading(false);
// //         }
// //     };

// //     const handleWebSocketMessage = (data: any) => {
// //         switch (data.type) {
// //             case 'price_update':
// //                 // Price updates are handled by the store
// //                 break;
// //             case 'signal_update':
// //                 // Signal updates are handled by the store
// //                 break;
// //             case 'alert':
// //                 showAlertNotification(data);
// //                 break;
// //         }
// //     };

// //     const subscribeToLiveData = () => {
// //         // الحصول على الرموز من قوائم المتابعة النشطة
// //         const activeWatchlist = watchlists.find(w => w.id === activeWatchlistId) || watchlists[0];
// //         const watchlistSymbols = activeWatchlist?.symbols || [];

// //         // Subscribe to price updates for watchlist and top symbols
// //         const symbolsToSubscribe = [
// //             ...watchlistSymbols,
// //             ...symbols.slice(0, 10).map(s => s.symbol)
// //         ];

// //         subscribeToLivePrices(symbolsToSubscribe);
// //         subscribeToLiveSignals();
// //     };

// //     const showAlertNotification = (alert: any) => {
// //         // Implement notification system
// //         console.log('New alert:', alert);
// //     };

// //     const handleRefresh = async () => {
// //         await syncAllData();
// //     };

// //     const handleMarketChange = (market: 'crypto' | 'stocks') => {
// //         setSelectedMarket(market);
// //     };

// //     const handleSymbolClick = (symbol: string) => {
// //         router.push(`/chart/${symbol}?market=${selectedMarket}`);
// //     };

// //     const handleSignalClick = (signalId: string) => {
// //         router.push(`/signals?signal=${signalId}`);
// //     };

// //     const handleTimeRangeChange = (range: '1d' | '1w' | '1m' | '1y') => {
// //         setTimeRange(range);
// //     };

// //     // دالة لإضافة/إزالة من المفضلة
// //     const handleToggleWatchlist = (symbol: string) => {
// //         toggleWatchlist(symbol, selectedMarket);
// //     };

// //     if (isLoading || rootLoading) {
// //         return (
// //             <div className="flex items-center justify-center min-h-screen">
// //                 <Loader size="large" text="Loading Dashboard..." />
// //             </div>
// //         );
// //     }

// //     // الحصول على قائمة المتابعة النشطة
// //     const activeWatchlist = watchlists.find(w => w.id === activeWatchlistId) || watchlists[0];
// //     const watchlistSymbols = activeWatchlist?.symbols || [];



// 'use client';

// import React, { useEffect, useState, useCallback } from 'react';
// import { useRouter } from 'next/navigation';
// import {
//     TrendingUp,
//     TrendingDown,
//     DollarSign,
//     Activity,
//     Bell,
//     Star,
//     RefreshCw,
//     AlertCircle,
//     BarChart2,
//     PieChart,
//     Clock
// } from 'lucide-react';
// import { useRootStore } from '../../stores/root.store';
// import { useMarketStore } from '../../stores/market.store';
// import { useSignalStore } from '../../stores/signals.store';
// import { useSettingsStore } from '../../stores/settings.store';

// import { MarketSummary } from '../../components/dashboard/MarketSummary';
// import { AssetGrid } from '../../components/dashboard/AssetGrid';
// import { QuickStats } from '../../components/dashboard/QuickStats';
// import { ActiveSignals } from '../../components/dashboard/ActiveSignals';
// import { Watchlist } from '../../components/dashboard/Watchlist';
// import { PerformanceChart } from '../../components/dashboard/PerformanceChart';

// import { Loader } from '../../components/ui/Loader/Loader';
// import { Button } from '../../components/ui/Button/Button';
// import { DateFormatter } from '../../utils/formatters/date.formatter';
// import { MetricCard } from '@/components/ui/Card/MetricCard';
// import Alert from '@/components/ui/Alert/Alert';
// import { useWebSocket } from '@/hooks/websocket/useWebSocket';
// import { useSignalStoress } from '@/stores/signalsss.store';

// export default function DashboardPage() {
//     const router = useRouter();
//     const [isLoading, setIsLoading] = useState(true);
//     const [selectedMarket, setSelectedMarket] = useState<'crypto' | 'stocks'>('crypto');
//     const [timeRange, setTimeRange] = useState<'1d' | '1w' | '1m' | '1y'>('1w');
//     const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

//     const {
//         isLoading: rootLoading,
//         error: rootError,
//         syncAllData,
//         clearError
//     } = useRootStore();

//     const {
//         symbols,
//         prices,
//         marketSummary,
//         topGainers,
//         topLosers,
//         volumeLeaders,
//         loadMarketData,
//         updatePrices,
//         toggleWatchlist,
//         processWebSocketData,
//         initializeMarketData
//     } = useMarketStore();

//     const {
//         activeSignals,
//         recentSignals,
//         signalStats,
//         loadSignals
//     } = useSignalStore();



//     const {

//         loadSignalss
//     } = useSignalStoress();


//     const {
//         fetchWatchlists,
//         watchlists,
//         activeWatchlistId
//     } = useSettingsStore();



//     // 🔥 استخدام نفس WebSocket hook كـ MarketsPage
//     const { isConnected, disconnect } = useWebSocket({
//         onMessage: useCallback((data) => {
//             console.log('📨 Dashboard WebSocket message:', {
//                 type: data.type,
//                 timestamp: data.timestamp
//             });

//             if (!data) return;

//             try {
//                 // معالجة تحديثات السوق من WebSocket
//                 if (data.type === 'market_overview' && data.data && Array.isArray(data.data)) {
//                     console.log(`📊 Dashboard processing ${data.data.length} updates`);

//                     // ✅ استدعاء الدالة الجديدة لمعالجة بيانات WebSocket
//                     processWebSocketData(data.data);
//                     setLastUpdated(new Date());
//                 }

//                 // معالجة إشارات التداول
//                 if (data.type === 'signal_update') {
//                     console.log('🚦 New signal update:', data);
//                     // يمكنك إعادة تحميل الإشارات هنا
//                     loadSignalss({ market: selectedMarket, timeframe: '1h' });
//                 }

//                 // معالجة التنبيهات
//                 if (data.type === 'alert') {
//                     showAlertNotification(data);
//                 }

//                 // معالجة اتصال WebSocket المؤكد
//                 if (data.type === 'connection_established') {
//                     console.log('✅ WebSocket connection confirmed:', data.message);
//                 }

//             } catch (error) {
//                 console.error('❌ Dashboard WebSocket error:', error);
//             }
//         }, [processWebSocketData, loadSignalss]),


//         onOpen: useCallback(() => {
//             console.log('✅ WebSocket connected (Dashboard)');
//         }, []),

//         onClose: useCallback(() => {
//             console.log('🔌 WebSocket disconnected (Dashboard)');
//         }, []),

//         onError: useCallback((error) => {
//             console.error('❌ WebSocket error in Dashboard:', error);
//         }, [])
//     });

//     useEffect(() => {
//         initializeDashboard();

//         return () => {
//             disconnect();
//         };
//     }, [selectedMarket]);

//     const initializeDashboard = async () => {
//         setIsLoading(true);
//         try {
//             await initializeMarketData(selectedMarket);
//             // استخدام نفس الدوال كما في MarketsPage
//             await Promise.all([
//                 loadSignalss({ market: selectedMarket, timeframe: '1h' }),
//                 fetchWatchlists()
//                 // ملاحظة: loadPortfolio() تم إزالته لأنه غير موجود
//             ]);
//         } catch (error) {
//             console.error('Dashboard initialization failed:', error);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const showAlertNotification = (alert: any) => {
//         // تنبيه فعلي يمكن عرضه
//         console.log('🔔 New alert:', alert);
//         // هنا يمكنك استخدام نظام تنبيهات حقيقي
//     };

//     const handleRefresh = async () => {
//         setIsLoading(true);
//         await initializeMarketData(selectedMarket);
//         try {
//             await Promise.all([
              
//                 loadSignals(),
//                 fetchWatchlists(),
//                 syncAllData()
//             ]);
//             setLastUpdated(new Date());
//         } catch (error) {
//             console.error('Refresh failed:', error);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleMarketChange = (market: 'crypto' | 'stocks') => {
//         setSelectedMarket(market);
//     };

//     const handleSymbolClick = (symbol: string) => {
//         router.push(`/chart/${symbol}?market=${selectedMarket}`);
//     };

//     const handleSignalClick = (signalId: string) => {
//         router.push(`/signals?signal=${signalId}`);
//     };

//     const handleTimeRangeChange = (range: '1d' | '1w' | '1m' | '1y') => {
//         setTimeRange(range);
//     };

//     const handleToggleWatchlist = (symbol: string) => {
//         toggleWatchlist(symbol, selectedMarket);
//     };

//     if (isLoading || rootLoading) {
//         return (
//             <div className="flex items-center justify-center min-h-screen">
//                 <Loader size="large" text="Loading Dashboard..." />
//             </div>
//         );
//     }

//     // الحصول على قائمة المتابعة النشطة
//     const activeWatchlist = watchlists.find(w => w.id === activeWatchlistId) || watchlists[0];
//     const watchlistSymbols = activeWatchlist?.symbols || [];
//     return (
//         <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
//             {/* Error Alert */}
//             {rootError && (
//                 <div className="px-4 pt-4">
//                     <Alert
//                         type="error"
//                         title="Error"
//                         message={rootError}
//                         onClose={clearError}
//                     />
//                 </div>
//             )}

//             {/* Header */}
//             <div className="p-4 md:p-6">
//                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
//                     <div>
//                         <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
//                             Trading Dashboard
//                         </h1>
//                         <p className="text-gray-600 dark:text-gray-400 mt-1">
//                             Real-time market data and trading insights • {DateFormatter.formatDate(new Date(), { format: 'long' })}
//                         </p>
//                     </div>

//                     <div className="flex items-center gap-3">
//                         {/* Connection Status */}
//                         <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
//                             <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
//                             <span className="text-sm font-medium">
//                                 {isConnected ? 'Live' : 'Offline'}
//                             </span>
//                         </div>

//                         {/* Refresh Button */}
//                         <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={handleRefresh}
//                             isLoading={rootLoading}
//                             icon={<RefreshCw className="w-4 h-4" />}
//                         >
//                             Refresh
//                         </Button>
//                     </div>
//                 </div>

//                 {/* Market Tabs */}
//                 <div className="flex gap-2 mb-6">
//                     <Button
//                         variant={selectedMarket === 'crypto' ? 'primary' : 'outline'}
//                         size="sm"
//                         onClick={() => handleMarketChange('crypto')}
//                     >
//                         <Activity className="w-4 h-4 mr-2" />
//                         Crypto Markets
//                     </Button>
//                     <Button
//                         variant={selectedMarket === 'stocks' ? 'primary' : 'outline'}
//                         size="sm"
//                         onClick={() => handleMarketChange('stocks')}
//                     >
//                         <TrendingUp className="w-4 h-4 mr-2" />
//                         US Stocks
//                     </Button>
//                 </div>

//                 {/* Market Summary */}
//                 <div className="mb-6">
//                     <MarketSummary
//                         summary={marketSummary}
//                         market={selectedMarket}
//                     />
//                 </div>

//                 {/* Quick Stats Row */}
//                 <div className="mb-6">
//                     <QuickStats market={selectedMarket} />
//                 </div>

//                 {/* Main Content Grid */}
//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                     {/* Left Column - Charts & Performance */}
//                     <div className="lg:col-span-2 space-y-6">
//                         {/* Performance Chart */}
//                         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
//                             <div className="p-4 border-b border-gray-200 dark:border-gray-700">
//                                 <div className="flex items-center justify-between">
//                                     <div className="flex items-center gap-3">
//                                         <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
//                                             <BarChart2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
//                                         </div>
//                                         <div>
//                                             <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
//                                                 Portfolio Performance
//                                             </h2>
//                                             <p className="text-sm text-gray-500 dark:text-gray-400">
//                                                 Total return across all positions
//                                             </p>
//                                         </div>
//                                     </div>

//                                     <div className="flex items-center gap-2">
//                                         {(['1d', '1w', '1m', '1y'] as const).map((range) => (
//                                             <Button
//                                                 key={range}
//                                                 variant={timeRange === range ? 'primary' : 'outline'}
//                                                 size="sm"
//                                                 onClick={() => handleTimeRangeChange(range)}
//                                             >
//                                                 {range.toUpperCase()}
//                                             </Button>
//                                         ))}
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className="p-4">
//                                 <PerformanceChart timeRange={timeRange} />
//                             </div>
//                         </div>

//                         {/* Top Assets Grid */}
//                         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
//                             <div className="p-4 border-b border-gray-200 dark:border-gray-700">
//                                 <div className="flex items-center justify-between">
//                                     <div className="flex items-center gap-3">
//                                         <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
//                                             <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
//                                         </div>
//                                         <div>
//                                             <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
//                                                 Top Performing Assets
//                                             </h2>
//                                             <p className="text-sm text-gray-500 dark:text-gray-400">
//                                                 Based on 24h performance
//                                             </p>
//                                         </div>
//                                     </div>
//                                     <Button
//                                         variant="ghost"
//                                         size="sm"
//                                         onClick={() => router.push('/markets')}
//                                     >
//                                         View All
//                                     </Button>
//                                 </div>
//                             </div>
//                             <div className="p-4">
//                                 <AssetGrid
//                                     symbols={topGainers.slice(0, 6)}
//                                     market={selectedMarket}
//                                     onSymbolClick={handleSymbolClick}
//                                     onToggleWatchlist={handleToggleWatchlist} // تمرير الدالة
//                                 />
//                             </div>
//                         </div>
//                     </div>

//                     {/* Right Column - Signals & Watchlist */}
//                     <div className="space-y-6">
//                         {/* Active Signals */}
//                         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
//                             <div className="p-4 border-b border-gray-200 dark:border-gray-700">
//                                 <div className="flex items-center justify-between">
//                                     <div className="flex items-center gap-3">
//                                         <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
//                                             <Bell className="w-5 h-5 text-red-600 dark:text-red-400" />
//                                         </div>
//                                         <div>
//                                             <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
//                                                 Active Signals
//                                             </h2>
//                                             <p className="text-sm text-gray-500 dark:text-gray-400">
//                                                 {signalStats.total} total signals
//                                             </p>
//                                         </div>
//                                     </div>
//                                     <Button
//                                         variant="ghost"
//                                         size="sm"
//                                         onClick={() => router.push('/signals')}
//                                     >
//                                         View All
//                                     </Button>
//                                 </div>
//                             </div>
//                             <div className="p-4">
//                                 <ActiveSignals
//                                     signals={activeSignals.slice(0, 5)}
//                                     onSignalClick={handleSignalClick}
//                                 />
//                             </div>
//                         </div>

//                         {/* Watchlist */}
//                         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
//                             <div className="p-4 border-b border-gray-200 dark:border-gray-700">
//                                 <div className="flex items-center justify-between">
//                                     <div className="flex items-center gap-3">
//                                         <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
//                                             <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
//                                         </div>
//                                         <div>
//                                             <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
//                                                 Watchlist
//                                             </h2>
//                                             <p className="text-sm text-gray-500 dark:text-gray-400">
//                                                 {watchlistSymbols.length} watched assets
//                                             </p>
//                                         </div>
//                                     </div>
//                                     <Button
//                                         variant="ghost"
//                                         size="sm"
//                                         onClick={() => router.push('/settings?tab=watchlist')}
//                                     >
//                                         Manage
//                                     </Button>
//                                 </div>
//                             </div>
//                             <div className="p-4">
//                                 <Watchlist
//                                     onSymbolClick={handleSymbolClick}
//                                     onToggleWatchlist={handleToggleWatchlist}
//                                 />
//                             </div>
//                         </div>

//                         {/* Quick Metrics */}
//                         <div className="grid grid-cols-2 gap-4">
//                             <MetricCard
//                                 title="Win Rate"
//                                 value={`${signalStats.winRate}%`}
//                                 icon={<TrendingUp className="w-5 h-5" />}
//                                 trend="up"
//                             />
//                             <MetricCard
//                                 title="Avg. Return"
//                                 value={`${signalStats.avgReturn}%`}
//                                 icon={<DollarSign className="w-5 h-5" />}
//                                 trend="down"
//                             />
//                         </div>
//                     </div>
//                 </div>

//                 {/* Bottom Section */}
//                 <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
//                     {/* Recent Activity */}
//                     <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
//                         <div className="p-4 border-b border-gray-200 dark:border-gray-700">
//                             <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
//                                 Recent Trading Activity
//                             </h2>
//                         </div>
//                         <div className="p-4">
//                             <div className="space-y-4">
//                                 {recentSignals.slice(0, 5).map((signal) => (
//                                     <div
//                                         key={signal.id}
//                                         className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
//                                         onClick={() => handleSignalClick(signal.id)}
//                                     >
//                                         <div className="flex items-center gap-3">
//                                             <div className={`p-2 rounded-lg ${signal.type === 'buy'
//                                                 ? 'bg-green-100 dark:bg-green-900'
//                                                 : 'bg-red-100 dark:bg-red-900'
//                                                 }`}>
//                                                 {signal.type === 'buy' ? (
//                                                     <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
//                                                 ) : (
//                                                     <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
//                                                 )}
//                                             </div>
//                                             <div>
//                                                 <div className="font-medium text-gray-900 dark:text-white">
//                                                     {signal.symbol}
//                                                 </div>
//                                                 <div className="text-sm text-gray-500 dark:text-gray-400">
//                                                     {signal.strategy}
//                                                 </div>
//                                             </div>
//                                         </div>
//                                         <div className="text-right">
//                                             <div className={`font-medium ${signal.profitLoss >= 0
//                                                 ? 'text-green-600 dark:text-green-400'
//                                                 : 'text-red-600 dark:text-red-400'
//                                                 }`}>
//                                                 {signal.profitLoss >= 0 ? '+' : ''}{signal.profitLoss}%
//                                             </div>
//                                             <div className="text-sm text-gray-500 dark:text-gray-400">
//                                                 {DateFormatter.formatRelative(signal.timestamp)}
//                                             </div>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     </div>

//                     {/* Market Insights */}
//                     <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
//                         <div className="p-4 border-b border-gray-200 dark:border-gray-700">
//                             <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
//                                 Market Insights
//                             </h2>
//                         </div>
//                         <div className="p-4">
//                             <div className="space-y-4">
//                                 <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
//                                     <div className="flex items-center gap-2 mb-2">
//                                         <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
//                                         <h3 className="font-medium text-blue-900 dark:text-blue-300">
//                                             High Volume Alert
//                                         </h3>
//                                     </div>
//                                     <p className="text-sm text-blue-800 dark:text-blue-200">
//                                         BTCUSDT trading volume increased by 45% in the last hour
//                                     </p>
//                                 </div>

//                                 <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
//                                     <div className="flex items-center gap-2 mb-2">
//                                         <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
//                                         <h3 className="font-medium text-green-900 dark:text-green-300">
//                                             Bullish Pattern
//                                         </h3>
//                                     </div>
//                                     <p className="text-sm text-green-800 dark:text-green-200">
//                                         ETHUSDT showing strong bullish momentum with RSI at 65
//                                     </p>
//                                 </div>

//                                 <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
//                                     <div className="flex items-center gap-2 mb-2">
//                                         <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
//                                         <h3 className="font-medium text-yellow-900 dark:text-yellow-300">
//                                             Market Close
//                                         </h3>
//                                     </div>
//                                     <p className="text-sm text-yellow-800 dark:text-yellow-200">
//                                         US stock markets close in 2 hours. Consider adjusting positions.
//                                     </p>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }


'use client';

import React, { useState } from 'react';
import { Button } from '@/components/uiadv/button';
import { Badge } from '@/components/uiadv/badge';
import {
    TrendingUp, LayoutDashboard, Zap, RefreshCw,
    ChevronRight, Bell, Globe
} from 'lucide-react';

// Import dashboard components
import { StockChartComponent } from '@/components/dashboard/stock-chart';
import { MarketSummaryComponent } from '@/components/dashboard/market-summary';
import { StockSearchComponent } from '@/components/dashboard/stock-search';
import { TechnicalAnalysisComponent } from '@/components/dashboard/technical-analysis';

// Import strategy builder components
import { IndicatorSelector } from '@/components/strategies/indicator-selector';
import { RuleBuilder } from '@/components/strategies/rule-builder';
import { EntryRule, ExitRule, FilterRule, IndicatorConfig, RiskManagement } from '@/types/backtest';

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'strategies'>('dashboard');
    const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
    const [selectedTimeframe, setSelectedTimeframe] = useState('1d');

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

    const POPULAR_SYMBOLS = [
        { symbol: 'AAPL', name: 'Apple Inc.' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.' },
        { symbol: 'TSLA', name: 'Tesla Inc.' },
    ];

    const handleSymbolSelect = (symbol: string) => {
        setSelectedSymbol(symbol);
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#131722]">
            {/* HEADER */}
            <header className="h-14 border-b border-[#2A2E39] bg-[#1E222D] flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-blue-500" />
                        <span className="text-sm font-bold text-slate-200 uppercase">TradeHub Pro</span>
                    </div>
                    <div className="h-6 w-px bg-[#2A2E39]" />

                    {/* Navigation */}
                    <div className="flex items-center gap-1 bg-[#131722] rounded-sm p-0.5">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={'px-4 py-1.5 text-[10px] font-bold uppercase rounded-sm transition-all flex items-center gap-2 ' + (activeTab === 'dashboard' ? 'bg-[#2962FF] text-white' : 'text-slate-500 hover:text-slate-300')}
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('strategies')}
                            className={'px-4 py-1.5 text-[10px] font-bold uppercase rounded-sm transition-all flex items-center gap-2 ' + (activeTab === 'strategies' ? 'bg-[#2962FF] text-white' : 'text-slate-500 hover:text-slate-300')}
                        >
                            <TrendingUp className="h-4 w-4" />
                            Strategies
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500">
                        <Bell className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <div className="h-6 w-px bg-[#2A2E39]" />
                    <Badge variant="outline" className="h-7 px-2 text-[9px] border-emerald-500 text-emerald-400 font-mono">
                        LIVE
                    </Badge>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex overflow-hidden">
                {activeTab === 'dashboard' ? (
                    // DASHBOARD VIEW
                    <div className="w-full flex gap-4 p-4 overflow-auto">
                        {/* Left Sidebar */}
                        <div className="w-80 flex-shrink-0 space-y-4">
                            <StockSearchComponent onSelectStock={handleSymbolSelect} />

                            <div className="bg-[#1E222D] border border-[#2A2E39] rounded-sm p-3">
                                <div className="flex items-center gap-2 mb-3">
                                    <Globe className="h-4 w-4 text-blue-500" />
                                    <span className="text-xs font-bold text-slate-300 uppercase">Quick Access</span>
                                </div>
                                <div className="space-y-1">
                                    {POPULAR_SYMBOLS.map((stock) => (
                                        <button
                                            key={stock.symbol}
                                            onClick={() => handleSymbolSelect(stock.symbol)}
                                            className={'w-full px-3 py-2 text-[11px] font-mono text-left rounded-sm transition-colors ' + (selectedSymbol === stock.symbol ? 'bg-[#2962FF] text-white' : 'text-slate-400 hover:bg-[#0B0E11]')}
                                        >
                                            {stock.symbol}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Main Area */}
                        <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-2 gap-4 h-1/2">
                                <StockChartComponent symbol={selectedSymbol} timeframe={selectedTimeframe} showHeader={true} />
                                <TechnicalAnalysisComponent symbol={selectedSymbol} timeframe={selectedTimeframe} />
                            </div>
                            <MarketSummaryComponent />
                        </div>

                        {/* Right Sidebar */}
                        <div className="w-80 flex-shrink-0">
                            <div className="bg-[#1E222D] border border-[#2A2E39] rounded-sm h-full p-4">
                                <div className="text-center text-slate-500 text-sm py-8">
                                    <div className="mb-4">
                                        <LayoutDashboard className="h-12 w-12 mx-auto text-slate-600" />
                                    </div>
                                    <p className="font-medium text-slate-400 mb-2">Market Watch</p>
                                    <p className="text-xs">
                                        Real-time market data coming soon
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // STRATEGIES VIEW
                    <div className="w-full flex gap-0">
                        {/* Left Panel */}
                        <div className="w-80 border-r border-[#2A2E39] flex-shrink-0">
                            <IndicatorSelector
                                selectedIndicators={indicators}
                                onIndicatorsChange={setIndicators}
                                timeframe={selectedTimeframe}
                                onTimeframeChange={setSelectedTimeframe}
                            />
                        </div>

                        {/* Center Panel */}
                        <div className="flex-1 flex flex-col bg-[#131722]">
                            <div className="h-14 border-b border-[#2A2E39] bg-[#1E222D] flex items-center justify-between px-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-2">
                                        <Zap className="h-4 w-4 text-purple-500" />
                                        <span className="text-xs font-bold text-slate-300 uppercase">Strategy Builder</span>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => setActiveTab('dashboard')}
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-slate-500"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                    Dashboard
                                </Button>
                            </div>

                            <div className="flex-1 p-8 flex items-center justify-center">
                                <div className="text-center">
                                    <TrendingUp className="h-16 w-16 mx-auto mb-4 text-slate-600" />
                                    <p className="text-lg font-bold text-slate-200 mb-2">Strategy Builder</p>
                                    <p className="text-sm text-slate-500">
                                        Configure your trading strategy using the panels on the left and right
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right Panel */}
                        <div className="w-96 border-r border-[#2A2E39] flex-shrink-0">
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
                    </div>
                )}
            </div>
        </div>
    );
}
