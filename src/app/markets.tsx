

// 'use client';

// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { useRouter } from 'next/navigation';
// import {
//     Download,
//     Filter,
//     Search,
//     Star,
//     TrendingUp,
//     TrendingDown,
//     BarChart3,
//     Zap,
//     RefreshCw
// } from 'lucide-react';
// import { useMarketStore } from '@/stores/market.store';
// import { SearchBar } from '@/components/filters/SearchBar';
// import { FilterDropdown } from '@/components/filters/FilterDropdown';
// import { QuickFilters } from '@/components/filters/QuickFilters';
// import { AdvancedFilters } from '@/components/filters/AdvancedFilters';
// import { Button } from '@/components/ui/Button/Button';
// import { Tabs } from '@/components/ui/Tabs/Tabs';
// import { Loader } from '@/components/ui/Loader/Loader';
// import Alert from '@/components/ui/Alert/Alert';
// import { MarketTable } from '@/components/data/tables/MarketTable';
// import { DateFormatter } from '@/utils/formatters/date.formatter';
// import { useSettingsStore } from '@/stores/settings.store';
// import { useWebSocketContext } from '@/components/providers/WebSocketProvider';
// import { MarketType, FilterCriteria } from '@/types/filter.types';
// import { useWebSocket } from '@/hooks/websocket/useWebSocket';

// interface PriceBroadcast {
//     symbol: string;
//     price: number;
//     change24h: number;
//     volume: number;
// }

// export default function MarketsPage() {
//     const router = useRouter();
//     const [activeTab, setActiveTab] = useState<MarketType>('crypto');
//     const [searchQuery, setSearchQuery] = useState('');
//     const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
//     const [isExporting, setIsExporting] = useState(false);
//     const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
//     const [livePrices, setLivePrices] = useState<Record<string, number>>({});

//     const {
//         symbols,
//         filteredSymbols,
//         prices,
//         marketSummary,
//         filterPresets,
//         filterCriteria,
//         isFiltering,
//         filterResult,
//         loadMarketData,
//         applyFilter,
//         loadFilterPresets,
//         saveFilterPreset,
//         quickFilter,
//         updatePrices,
//         clearFilters,
//         isLoading,
//         error: storeError,
//     } = useMarketStore();

//     const {
//         fetchWatchlists,
//         watchlists,
//         activeWatchlistId
//     } = useSettingsStore();

//     // const { isConnected } = useWebSocketContext();




//     // في MarketsPage.tsx، عدل onMessage في useWebSocket
//     const {
//         isConnected,
//         disconnect
//     } = useWebSocket({
//         onMessage: useCallback((data) => {
//             console.log('📨 WebSocket message received:', {
//                 type: data.type,
//                 timestamp: data.timestamp,
//                 dataLength: data.data?.length || 0
//             });

//             if (!data) return;

//             try {
//                 // معالجة بيانات السوق
//                 if (data.type === 'market_overview' && data.data && Array.isArray(data.data)) {
//                     console.log(`📊 Processing ${data.data.length} market updates`);

//                     // تحويل البيانات لتتناسب مع PriceUpdate
//                     const updates = data.data.map((item: any) => {
//                         // الحصول على السعر الحالي من الـ store أولاً
//                         const currentPriceData = prices[item.symbol];

//                         return {
//                             symbol: item.symbol,
//                             current: parseFloat(item.price) || currentPriceData?.price || 0,
//                             change24h: parseFloat(item.change24h) || currentPriceData?.change24h || 0,
//                             volume24h: parseFloat(item.volume) || currentPriceData?.volume24h || 0,
//                             // إذا لم يكن هناك marketCap في البيانات، استخدم القيمة الحالية
//                             marketCap: parseFloat(item.marketCap) || currentPriceData?.marketCap || 0,
//                             timestamp: data.timestamp || new Date().toISOString()
//                         };
//                     });

//                     // 🚀 تحديث الأسعار في الستور
//                     updatePrices(updates);
//                     setLastUpdated(new Date());

//                     // تسجيل تحديث بعض الرموز للتحقق
//                     const currentSymbols = filteredSymbols.slice(0, 5);
//                     currentSymbols.forEach(symbol => {
//                         const update = updates.find((u: { symbol: string; current: number; change24h: number; volume24h: number }) =>
//                             u.symbol === symbol
//                         );
//                         if (update) {
//                             console.log(`   ${symbol}: $${update.current} (${update.change24h}%) - Vol: $${update.volume24h}`);
//                         }
//                     });
//                 }
//             } catch (error) {
//                 console.error('❌ Error processing WebSocket message:', error);
//             }
//         }, [updatePrices, filteredSymbols, prices]),

//         onOpen: useCallback(() => {
//             console.log('✅ WebSocket connected (MarketsPage)');
//         }, []),

//         onClose: useCallback(() => {
//             console.log('🔌 WebSocket disconnected (MarketsPage)');
//         }, []),

//         onError: useCallback((error?: Error | string | unknown) => {
//             console.error('❌ WebSocket error in MarketsPage:', error);
//         }, [])
//     });

 
    

    
//     // 🔥 تحديث سعر واحد
//     const updateLivePrice = (symbol: string, newPrice: number) => {
//         setLivePrices(prev => ({
//             ...prev,
//             [symbol]: newPrice
//         }));
//         setLastUpdated(new Date());
//     };

//     // 🔥 معالجة رسائل WebSocket
//     const handlePriceUpdate = useCallback((update: PriceBroadcast) => {
//         updateLivePrice(update.symbol, update.price);
//     }, []);

//     // 🔥 تهيئة الصفحة
//     const initializePage = async () => {
//         await Promise.all([loadFilterPresets(), fetchWatchlists()]);
//     };

//     useEffect(() => {
//         initializePage();
//     }, []);

//     // 🔥 جلب بيانات السوق عند تغيير التبويب
//     useEffect(() => {
//         if (!activeTab) return;
//         loadMarketData(activeTab);
//     }, [activeTab]);


//     // 🔥 دوال الفلاتر والبحث
//     const handleSearch = useCallback((query: string) => {
//         setSearchQuery(query);
//         const criteria: FilterCriteria = {
//             conditions: query ? [{
//                 field: 'symbol',
//                 operator: 'contains',
//                 value: query.toLowerCase()
//             }] : [],
//             logic: 'AND'
//         };
//         applyFilter(activeTab, criteria);
//     }, [activeTab, applyFilter]);


//     // في MarketsPage، أضف useEffect لمزامنة التحديثات
//     useEffect(() => {
//         if (!filteredSymbols || filteredSymbols.length === 0) return;

//         // تسجيل الرموز الحالية للتحقق
//         console.log(`📊 Currently displaying ${filteredSymbols.length} symbols:`);
//         filteredSymbols.slice(0, 10).forEach((symbol, index) => {
//             const priceData = prices[symbol];
//             console.log(`   ${index + 1}. ${symbol}: $${priceData?.price || 0} (${priceData?.change24h || 0}%)`);
//         });
//     }, [filteredSymbols, prices]);

//     // أضف useEffect أخرى للتحقق من تحديثات الأسعار
//     useEffect(() => {
//         // تسجيل التغييرات في الأسعار
//         const interval = setInterval(() => {
//             if (filteredSymbols && filteredSymbols.length > 0) {
//                 const symbol = filteredSymbols[0]; // أول رمز
//                 const priceData = prices[symbol];
//                 if (priceData?.timestamp) {
//                     const lastUpdate = new Date(priceData.timestamp);
//                     const now = new Date();
//                     const diff = Math.round((now.getTime() - lastUpdate.getTime()) / 1000);
//                     console.log(`⏰ Last update for ${symbol}: ${diff} seconds ago`);
//                 }
//             }
//         }, 10000); // كل 10 ثواني

//         return () => clearInterval(interval);
//     }, [filteredSymbols, prices]);

//     const handlePresetSelect = useCallback((preset: any) => {
//         if (preset?.criteria) applyFilter(preset.market, preset.criteria);
//     }, [applyFilter]);

//     const handleAdvancedFilterSubmit = useCallback((criteria: FilterCriteria) => {
//         applyFilter(activeTab, criteria);
//         setShowAdvancedFilters(false);
//     }, [activeTab, applyFilter]);

//     const handleSavePreset = useCallback(async () => {
//         if (!filterCriteria) return;
//         const name = prompt('Enter preset name:');
//         if (!name) return;

//         try {
//             await saveFilterPreset({
//                 name,
//                 description: `Filter for ${activeTab} market`,
//                 market: activeTab,
//                 criteria: filterCriteria,
//                 isDefault: false
//             });
//         } catch (error) {
//             console.error('Failed to save preset:', error);
//         }
//     }, [activeTab, filterCriteria, saveFilterPreset]);

//     const handleQuickFilter = useCallback((filterType: string) => {
//         quickFilter(activeTab, filterType);
//     }, [activeTab, quickFilter]);

//     const handleExport = useCallback(async () => {
//         setIsExporting(true);
//         try {
//             const data = filteredSymbols.map(symbol => ({
//                 symbol,
//                 price: livePrices[symbol] ?? prices[symbol]?.price ?? 0,
//                 change: prices[symbol]?.change24h || 0,
//                 volume: prices[symbol]?.volume24h || 0
//             }));

//             const csv = [
//                 ['Symbol', 'Price', '24h Change %', '24h Volume'],
//                 ...data.map(item => [
//                     item.symbol,
//                     item.price.toFixed(4),
//                     item.change.toFixed(2),
//                     item.volume.toLocaleString()
//                 ])
//             ].join('\n');

//             const blob = new Blob([csv], { type: 'text/csv' });
//             const url = window.URL.createObjectURL(blob);
//             const a = document.createElement('a');
//             a.href = url;
//             a.download = `${activeTab}_market_data_${Date.now()}.csv`;
//             a.click();
//             window.URL.revokeObjectURL(url);
//         } catch (error) {
//             console.error('Export failed:', error);
//         } finally {
//             setIsExporting(false);
//         }
//     }, [activeTab, filteredSymbols, prices, livePrices]);

//     const handleSymbolClick = (symbol: string) => {
//         router.push(`/chart/${symbol}?market=${activeTab}`);
//     };

//     const activeWatchlist = watchlists.find(w => w.id === activeWatchlistId) || watchlists[0];
//     const hasActiveFilters = filterCriteria && filterCriteria.conditions.length > 0;

//     const tableData = useMemo(() => {
//         if (!filteredSymbols || filteredSymbols.length === 0) return [];

//         return filteredSymbols.map(symbol => {
//             const symbolData = symbols.find(s => s.symbol === symbol);
//             const priceData = prices[symbol];
//             const livePrice = livePrices[symbol] ?? priceData?.price ?? 0;

//             return {
//                 symbol,
//                 name: symbolData?.name || symbol,
//                 // price: livePrice,
//                 price: priceData?.price || 100,
//                 change24h: priceData?.change24h || 0,
//                 volume24h: priceData?.volume24h || 0,
//                 marketCap: priceData?.marketCap || 0,
//                 category: activeTab,
//                 isFavorite: watchlists.some(list => list.symbols?.includes(symbol))
//             };
//         });
//     }, [filteredSymbols, symbols, prices, livePrices, watchlists, activeTab]);

//     return (
//         <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
//             <div className="p-4 md:p-6 max-w-7xl mx-auto">
//                 {/* Header */}
//                 <div className="mb-6">
//                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
//                         <div>
//                             <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
//                                 Markets
//                             </h1>
//                             <p className="text-gray-600 dark:text-gray-400 mt-1">
//                                 Browse and filter {activeTab} markets with real-time data
//                             </p>
//                         </div>

//                         <div className="flex items-center gap-3">
//                             <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
//                                 <div className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
//                                 <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
//                                 <span className="mx-2">•</span>
//                                 <span>Updated {DateFormatter.formatRelative(lastUpdated)}</span>
//                             </div>

//                             <Button
//                                 variant="outline"
//                                 size="sm"
//                                 onClick={() => loadMarketData(activeTab)}
//                                 leftIcon={<RefreshCw className="w-4 h-4" />}
//                             >
//                                 Refresh
//                             </Button>
//                         </div>
//                     </div>

//                     {/* Market Tabs */}
//                     <Tabs
//                         value={activeTab}
//                         onChange={(value) => setActiveTab(value as MarketType)}
//                         tabs={[
//                             { value: 'crypto', label: 'Cryptocurrencies', icon: <Zap className="w-4 h-4" /> },
//                             { value: 'stocks', label: 'US Stocks', icon: <BarChart3 className="w-4 h-4" /> }
//                         ]}
//                         fullWidth
//                     />
//                 </div>

//                 {/* Filter Toolbar */}
//                 <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
//                     <div className="flex flex-col lg:flex-row gap-4">
//                         {/* Left Section */}
//                         <div className="flex-1">
//                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                 <div className="md:col-span-2">
//                                     <SearchBar
//                                         placeholder={`Search ${activeTab === 'crypto' ? 'cryptocurrencies' : 'stocks'}...`}
//                                         onSearch={handleSearch}
//                                         delay={300}
//                                         icon={<Search className="w-5 h-5" />}
//                                     />
//                                 </div>
//                                 <div className="flex items-center gap-2">
//                                     <FilterDropdown
//                                         presets={filterPresets}
//                                         activePreset={filterPresets.find(p =>
//                                             p.market === activeTab &&
//                                             JSON.stringify(p.criteria) === JSON.stringify(filterCriteria)
//                                         )}
//                                         onPresetSelect={handlePresetSelect}
//                                         onNewPreset={handleSavePreset}
//                                         onManagePresets={() => router.push('/settings?tab=filters')}
//                                     />
//                                     <Button
//                                         variant={showAdvancedFilters ? 'primary' : 'outline'}
//                                         size="sm"
//                                         onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
//                                         leftIcon={<Filter className="w-4 h-4" />}
//                                     >
//                                         Advanced
//                                     </Button>
//                                 </div>
//                             </div>

//                             <div className="mt-4">
//                                 <QuickFilters
//                                     market={activeTab}
//                                     onFilterSelect={handleQuickFilter}
//                                 />
//                             </div>
//                         </div>

//                         {/* Right Section */}
//                         <div className="flex items-center gap-2">
//                             <Button
//                                 variant="outline"
//                                 size="sm"
//                                 onClick={handleExport}
//                                 leftIcon={<Download className="w-4 h-4" />}
//                             >
//                                 Export CSV
//                             </Button>
//                             <Button
//                                 variant="outline"
//                                 size="sm"
//                                 onClick={clearFilters}
//                                 disabled={!hasActiveFilters}
//                             >
//                                 Clear
//                             </Button>
//                         </div>
//                     </div>

//                     {/* Filter Status */}
//                     {filterResult && (
//                         <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
//                             <div className="flex items-center justify-between">
//                                 <div className="flex items-center gap-4">
//                                     <Filter className="w-5 h-5 text-blue-500" />
//                                     <div>
//                                         <p className="font-medium text-blue-900 dark:text-blue-300">
//                                             Showing {filterResult.filtered} of {filterResult.total} symbols
//                                         </p>
//                                         {filterResult.executionTime > 0 && (
//                                             <p className="text-sm text-blue-700 dark:text-blue-400">
//                                                 Execution time: {filterResult.executionTime.toFixed(2)}ms
//                                             </p>
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//                 </div>

//                 {/* Advanced Filters */}
//                 {showAdvancedFilters && (
//                     <div className="mb-6">
//                         <AdvancedFilters
//                             criteria={filterCriteria || { conditions: [], logic: 'AND' }}
//                             onChange={handleAdvancedFilterSubmit}
//                             onSaveAsPreset={handleSavePreset}
//                             onClose={() => setShowAdvancedFilters(false)}
//                             market={activeTab}
//                         />
//                     </div>
//                 )}

//                 {/* Market Summary */}
//                 {marketSummary && (
//                     <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
//                         {Object.entries(marketSummary.market_summary || {}).slice(0, 3).map(([key, data]: [string, any]) => (
//                             <div key={key} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
//                                 <div className="text-sm text-gray-500 dark:text-gray-400">
//                                     {key === '^GSPC' ? 'S&P 500' : key === '^DJI' ? 'Dow Jones' : 'NASDAQ'}
//                                 </div>
//                                 <div className={`text-2xl font-bold mt-1 ${data.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
//                                     ${data.price?.toLocaleString()}
//                                 </div>
//                                 <div className={`text-sm mt-1 ${data.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
//                                     {data.change >= 0 ? '+' : ''}{data.change?.toFixed(2)} ({data.change_percent?.toFixed(2)}%)
//                                 </div>
//                             </div>
//                         ))}
//                         <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
//                             <div className="text-sm text-gray-500 dark:text-gray-400">Last Updated</div>
//                             <div className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
//                                 {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                             </div>
//                             <div className="text-sm mt-1 text-gray-600 dark:text-gray-400">Real-time</div>
//                         </div>
//                     </div>
//                 )}

//                 {/* Error */}
//                 {storeError && (
//                     <Alert
//                         type="error"
//                         title="Error Loading Data"
//                         message={storeError}
//                         className="mb-6"
//                         onClose={() => useMarketStore.setState({ error: null })}
//                     />
//                 )}

//                 {/* Main Table */}
//                 <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
//                     <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
//                         <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
//                             {activeTab === 'crypto' ? 'Cryptocurrencies' : 'US Stocks'}
//                         </h2>
//                         <div className="text-sm text-gray-500 dark:text-gray-400">
//                             {symbols.length} assets | {filteredSymbols.length} displayed
//                         </div>
//                     </div>

//                     {isLoading || isFiltering ? (
//                         <div className="p-8 text-center">
//                             <Loader size="lg" text={`Loading ${activeTab} markets...`} />
//                             <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
//                                 Fetching symbols and real-time prices...
//                             </p>
//                         </div>
//                     ) : symbols.length === 0 ? (
//                         <div className="p-8 text-center">
//                             <BarChart3 className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
//                             <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                                 No market data available
//                             </h3>
//                             <p className="text-gray-500 dark:text-gray-400 mb-4">
//                                 Failed to load market data. Please check your connection and try again.
//                             </p>
//                             <Button onClick={() => loadMarketData(activeTab)} variant="primary">
//                                 Retry
//                             </Button>
//                         </div>
//                     ) : filteredSymbols.length === 0 ? (
//                         <div className="p-8 text-center">
//                             <Filter className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
//                             <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                                 No symbols match your filters
//                             </h3>
//                             <p className="text-gray-500 dark:text-gray-400 mb-4">
//                                 Try adjusting your search or filter criteria.
//                             </p>
//                             <Button onClick={clearFilters} variant="primary">
//                                 Clear Filters
//                             </Button>
//                         </div>
//                     ) : (
//                         <div className="overflow-x-auto">
//                             <MarketTable
//                                 data={tableData}
//                                 onRowClick={handleSymbolClick}
//                                 // onFavoriteToggle={(symbol) => toggleWatchlist(symbol, activeTab)}
//                                 isLoading={false}
//                             />
//                         </div>
//                     )}
//                 </div>

//                 {/* Bulk Actions */}
//                 {filteredSymbols.length > 0 && (
//                     <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
//                         <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Bulk Actions</h3>
//                         <div className="flex flex-wrap gap-2">
//                             <Button
//                                 variant="outline"
//                                 size="sm"
//                                 // onClick={() => filteredSymbols.forEach(symbol => toggleWatchlist(symbol, activeTab))}
//                                 leftIcon={<Star className="w-4 h-4" />}
//                             >
//                                 Add All to Watchlist ({filteredSymbols.length})
//                             </Button>
//                             <Button
//                                 variant="outline"
//                                 size="sm"
//                                 onClick={() => filteredSymbols.forEach(symbol => window.open(`/chart/${symbol}?market=${activeTab}`, '_blank'))}
//                                 leftIcon={<BarChart3 className="w-4 h-4" />}
//                             >
//                                 Open All Charts
//                             </Button>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }

'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
    Search,
    TrendingUp,
    TrendingDown,
    Zap,
    BarChart3,
    RefreshCw,
    Activity,
    PieChart,
    ArrowUpDown,
    X
} from 'lucide-react'
import { Button } from '@/components/uiadv/button'
import { Input } from '@/components/uiadv/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/uiadv/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/uiadv/card'
import { Badge } from '@/components/uiadv/badge'
import { ScrollArea } from '@/components/uiadv/scroll-area'
import { useMarketOverviewStore } from '@/stores/market-overview.store'
import { marketOverviewService } from '@/services/api/market-overview.service'
import { MarketData } from '@/services/api/market-overview.service'
import { PremiumSkeletonLoader } from '../app/loding'

// Helper function to format numbers (TradingView style)
const formatNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
    return `$${num.toFixed(2)}`
}

// Helper function to format prices accurately
const formatPrice = (price: number) => {
    if (price === 0) return "0.00";
    if (price < 0.001) return price.toFixed(8);
    if (price < 0.01) return price.toFixed(5);
    if (price < 1) return price.toFixed(3);
    return price.toFixed(2);
}

const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(2)}%`
}

export default function MarketsPage() {
    const router = useRouter()

    // Local States for UI Interaction (Search, Sorting)
    const [activeTab, setActiveTab] = useState<'crypto' | 'stocks'>('crypto') // For future expansion
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState<'volume' | 'change24h' | 'price'>('volume')
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
    const [quickFilter, setQuickFilter] = useState<'all' | 'gainers' | 'losers' | 'high-volume'>('all')
    const [isExporting, setIsExporting] = useState(false)
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

    // --- Data Source Integration (Using the Stable Store) ---
    const markets = useMarketOverviewStore((state) => state.markets)
    const isLoading = useMarketOverviewStore((state) => state.isLoading)
    const isConnected = useMarketOverviewStore((state) => state.isConnected)
    const setMarkets = useMarketOverviewStore((state) => state.setMarkets)
    const setLoading = useMarketOverviewStore((state) => state.setLoading)
    const setConnected = useMarketOverviewStore((state) => state.setConnected)

    // Initialize WebSocket Connection (Same logic as Dropdown but for Page)
    useEffect(() => {
        console.log("[MarketsPage] Connecting to WebSocket...");
        setLoading(true);

        marketOverviewService.connect({
            onConnected: () => {
                console.log("[MarketsPage] WebSocket connected");
                setConnected(true);
                setLoading(false);
            },
            onMessage: (data: MarketData[]) => {
                console.log("[MarketsPage] Received market data:", data.length);
                setMarkets(data);
                setLoading(false);
                setLastUpdated(new Date());
            },
            onDisconnected: () => {
                console.log("[MarketsPage] WebSocket disconnected");
                setConnected(false);
            },
            onError: (error) => {
                console.error("[MarketsPage] WebSocket error:", error);
                setConnected(false);
                setLoading(false);
            },
        });

        return () => {
            console.log("[MarketsPage] Cleanup, disconnecting WebSocket");
            marketOverviewService.disconnect();
        };
    }, [setMarkets, setLoading, setConnected]);

    // --- Filtering & Sorting Logic ---

    // 1. Search Filter
    const searchFiltered = useMemo(() => {
        if (!searchQuery) return markets;
        return markets.filter(m => m.symbol.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [markets, searchQuery]);

    // 2. Quick Filters (Gainers/Losers/Volume)
    const quickFiltered = useMemo(() => {
        if (quickFilter === 'all') return searchFiltered;

        if (quickFilter === 'gainers') {
            return searchFiltered.filter(m => m.change24h > 0).sort((a, b) => b.change24h - a.change24h);
        }
        if (quickFilter === 'losers') {
            return searchFiltered.filter(m => m.change24h < 0).sort((a, b) => a.change24h - b.change24h);
        }
        if (quickFilter === 'high-volume') {
            // Sort by volume descending regardless of other sort state
            return [...searchFiltered].sort((a, b) => b.volume - a.volume);
        }
        return searchFiltered;
    }, [searchFiltered, quickFilter]);

    // 3. General Sorting
    const finalData = useMemo(() => {
        // If a specific quick filter (not 'all') is active, it already sorted the data (for gainers/losers)
        // But for manual sorting controls to work, we apply them here unless quickFilter overrides
        let data = [...quickFiltered];

        // Allow manual sorting override only if quickFilter is 'all' or 'high-volume' (which just filters but could be resorted)
        // For Gainers/Losers, we usually want to keep the sort by change, but let's allow manual sort if user insists.

        if (quickFilter !== 'gainers' && quickFilter !== 'losers') {
            data.sort((a, b) => {
                let comparison = 0;
                if (sortBy === 'price') comparison = a.price - b.price;
                else if (sortBy === 'change24h') comparison = a.change24h - b.change24h;
                else if (sortBy === 'volume') comparison = a.volume - b.volume;

                return sortOrder === 'asc' ? comparison : -comparison;
            });
        }

        return data;
    }, [quickFiltered, sortBy, sortOrder, quickFilter]);

    // --- Calculations ---

    const marketSummary = useMemo(() => {
        if (finalData.length === 0) return null;

        const totalVolume = finalData.reduce((sum, m) => sum + m.volume, 0);
        // Assuming Market Cap isn't in the raw socket data provided, we might omit it or estimate 
        // based on price * volume if needed. For now, let's focus on available data.
        const gainers = finalData.filter(m => m.change24h > 0).length;
        const losers = finalData.filter(m => m.change24h < 0).length;

        return {
            totalVolume,
            gainers,
            losers,
            total: finalData.length
        };
    }, [finalData]);

    // --- Handlers ---

    const handleSort = (field: 'price' | 'change24h' | 'volume') => {
        if (sortBy === field) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc'); // Default new sort to desc
        }
        setQuickFilter('all'); // Reset quick filter when manually sorting
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const data = finalData.map(item => ({
                symbol: item.symbol,
                price: item.price,
                change: item.change24h,
                volume: item.volume
            }));

            const csv = [
                ['Symbol', 'Price', '24h Change %', '24h Volume'],
                ...data.map(item => [
                    item.symbol,
                    item.price.toString(),
                    item.change.toString(),
                    item.volume.toString()
                ])
            ].join('\n');

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `market_data_${Date.now()}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="min-h-screen trading-dark-bg trading-dark-text-primary">
            {/* Header */}
            <header className="border-b trading-dark-border bg-background/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-primary to-primary/80 rounded-xl">
                                <Activity className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold trading-dark-text-primary">Markets</h1>
                                <p className="text-sm trading-dark-text-secondary">Real-time market data</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 trading-dark-bg-secondary rounded-lg border trading-dark-border">
                                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                <span className="text-sm trading-dark-text-primary">
                                    {isConnected ? 'Live' : 'Offline'}
                                </span>
                            </div>
                            {/* Manual Refresh could be added here if needed, but WS is auto */}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6">
                {/* Market Tabs */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Sidebar Controls */}
                        <div className="lg:w-80 flex-shrink-0 space-y-4">
                            {/* Search */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium trading-dark-text-secondary">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 trading-dark-text-secondary" />
                                    <Input
                                        placeholder="Search symbols..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 trading-input-dark placeholder:trading-dark-text-secondary"
                                    />
                                    {searchQuery && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 trading-dark-text-secondary hover:trading-dark-text-primary"
                                            onClick={() => setSearchQuery('')}
                                        >
                                            <X className="w-3 h-3" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Quick Filters */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium trading-dark-text-secondary">Quick Filters</label>
                                <div className="space-y-2">
                                    <Button
                                        variant={quickFilter === 'gainers' ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => { setQuickFilter('gainers'); setSortBy('change24h'); setSortOrder('desc'); }}
                                        className={`w-full justify-start transition-all ${quickFilter === 'gainers'
                                            ? 'bg-primary hover:bg-primary/90 text-primary-foreground border-primary'
                                            : 'trading-dark-border trading-dark-bg-secondary trading-dark-text-secondary hover:trading-dark-accent hover:border-primary/50'}`}
                                    >
                                        <TrendingUp className="w-4 h-4 mr-2" />
                                        Top Gainers
                                    </Button>
                                    <Button
                                        variant={quickFilter === 'losers' ? "destructive" : "outline"}
                                        size="sm"
                                        onClick={() => { setQuickFilter('losers'); setSortBy('change24h'); setSortOrder('asc'); }}
                                        className={`w-full justify-start transition-all ${quickFilter === 'losers'
                                            ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground border-destructive'
                                            : 'trading-dark-border trading-dark-bg-secondary trading-dark-text-secondary hover:text-destructive hover:border-destructive/50'}`}
                                    >
                                        <TrendingDown className="w-4 h-4 mr-2" />
                                        Top Losers
                                    </Button>
                                    <Button
                                        variant={quickFilter === 'high-volume' ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => { setQuickFilter('high-volume'); setSortBy('volume'); setSortOrder('desc'); }}
                                        className={`w-full justify-start transition-all ${quickFilter === 'high-volume'
                                            ? 'bg-primary hover:bg-primary/90 text-primary-foreground border-primary'
                                            : 'trading-dark-border trading-dark-bg-secondary trading-dark-text-secondary hover:trading-dark-accent hover:border-primary/50'}`}
                                    >
                                        <Activity className="w-4 h-4 mr-2" />
                                        High Volume
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => { setQuickFilter('all'); setSearchQuery(''); }}
                                        className="w-full justify-start trading-dark-border trading-dark-bg-secondary trading-dark-text-secondary hover:trading-dark-text-primary"
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Clear Filters
                                    </Button>
                                </div>
                            </div>

                            {/* Export */}
                            <Button
                                variant="outline"
                                onClick={handleExport}
                                disabled={isExporting || finalData.length === 0}
                                className="w-full trading-dark-border trading-dark-bg-secondary trading-dark-text-primary hover:trading-dark-text-primary"
                            >
                                {isExporting ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        Exporting...
                                    </>
                                ) : (
                                    'Export CSV'
                                )}
                            </Button>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 space-y-4">
                            {/* Market Summary Cards */}
                            {marketSummary && (
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                    <Card className="trading-card-dark animate-scale-in">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs trading-dark-text-secondary mb-1">24h Volume</p>
                                                    <p className="text-lg font-bold trading-dark-text-primary">
                                                        {formatNumber(marketSummary.totalVolume)}
                                                    </p>
                                                </div>
                                                <div className="p-2 bg-primary/10 rounded-lg">
                                                    <Activity className="w-5 h-5 text-primary" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="trading-card-dark animate-scale-in" style={{ animationDelay: '0.05s' }}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs trading-dark-text-secondary mb-1">Total Assets</p>
                                                    <p className="text-lg font-bold trading-dark-text-primary">
                                                        {marketSummary.total}
                                                    </p>
                                                </div>
                                                <div className="p-2 bg-muted/50 rounded-lg">
                                                    <PieChart className="w-5 h-5 text-muted-foreground" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="trading-card-dark animate-scale-in" style={{ animationDelay: '0.1s' }}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs trading-dark-text-secondary mb-1">Gainers</p>
                                                    <p className="text-lg font-bold text-primary">
                                                        {marketSummary.gainers}
                                                    </p>
                                                </div>
                                                <div className="p-2 bg-primary/10 rounded-lg">
                                                    <TrendingUp className="w-5 h-5 text-primary" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="trading-card-dark animate-scale-in" style={{ animationDelay: '0.15s' }}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs trading-dark-text-secondary mb-1">Losers</p>
                                                    <p className="text-lg font-bold text-destructive">
                                                        {marketSummary.losers}
                                                    </p>
                                                </div>
                                                <div className="p-2 bg-destructive/10 rounded-lg">
                                                    <TrendingDown className="w-5 h-5 text-destructive" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Market Table */}
                            <Card className="trading-card-dark overflow-hidden">
                                <CardHeader className="pb-4 border-b trading-dark-border">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <CardTitle className="trading-dark-text-primary">
                                            Cryptocurrency Market
                                        </CardTitle>
                                        <div className="flex gap-2">
                                            {/* Manual Sort Controls in Header */}
                                            <div className="flex trading-dark-bg-tertiary rounded-lg p-1 border trading-dark-border">
                                                {[
                                                    { id: 'volume', label: 'Volume' },
                                                    { id: 'change24h', label: 'Change' },
                                                    { id: 'price', label: 'Price' }
                                                ].map((col) => (
                                                    <button
                                                        key={col.id}
                                                        onClick={() => handleSort(col.id as any)}
                                                        className={`px-3 py-1 text-xs rounded-md font-medium transition-all touch-target ${sortBy === col.id
                                                            ? 'trading-dark-bg-secondary trading-dark-text-primary shadow-sm'
                                                            : 'trading-dark-text-secondary hover:trading-dark-text-primary'}`}
                                                    >
                                                        {col.label}
                                                        {sortBy === col.id && (
                                                            <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <ScrollArea className="h-[600px] custom-scrollbar">
                                        <div className="w-full">
                                            {/* Table Header */}
                                            <div className="grid grid-cols-12 gap-4 px-4 py-3 trading-dark-bg-tertiary border-b trading-dark-border text-xs font-medium trading-dark-text-secondary sticky top-0 z-10">
                                                <div className="col-span-3">Symbol</div>
                                                <div className="col-span-3 text-right cursor-pointer hover:trading-dark-text-primary transition-colors" onClick={() => handleSort('price')}>Price</div>
                                                <div className="col-span-3 text-right cursor-pointer hover:trading-dark-text-primary transition-colors" onClick={() => handleSort('change24h')}>24h %</div>
                                                <div className="col-span-3 text-right cursor-pointer hover:trading-dark-text-primary transition-colors" onClick={() => handleSort('volume')}>Volume</div>
                                            </div>

                                            {/* Table Body */}
                                            <div>
                                                {markets.length === 0 ? (
                                                    <PremiumSkeletonLoader />
                                                ) : finalData.length === 0 && !isLoading ? (
                                                    <div className="p-12 text-center">
                                                        <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                                                        <p className="text-muted-foreground mb-2">No results found</p>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => { setSearchQuery(''); setQuickFilter('all'); }}
                                                            className="border-border text-muted-foreground"
                                                        >
                                                            Clear filters
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    finalData.map((item, index) => (
                                                        <div
                                                            key={item.symbol}
                                                            onClick={() => router.push(`/chart/${item.symbol}?market=${activeTab}`)}
                                                            className="grid grid-cols-12 gap-4 px-4 py-4 border-b trading-dark-border/50 hover:trading-dark-bg-secondary/50 cursor-pointer transition-all duration-200 group animate-slide-in touch-target"
                                                            style={{ animationDelay: `${index * 0.02}s` }}
                                                        >
                                                            <div className="col-span-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-muted to-card flex items-center justify-center text-xs font-bold trading-dark-text-primary ring-1 trading-dark-border">
                                                                        {item.symbol.slice(0, 2)}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium trading-dark-text-primary group-hover:text-primary transition-colors">
                                                                            {item.symbol}
                                                                        </p>
                                                                        <p className="text-xs trading-dark-text-secondary">
                                                                            Vol: {formatNumber(item.volume)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="col-span-3 text-right">
                                                                <p className="font-mono font-medium trading-dark-text-primary text-sm">
                                                                    {formatPrice(item.price)}
                                                                </p>
                                                            </div>

                                                            <div className="col-span-3 text-right">
                                                                <Badge
                                                                    variant={item.change24h >= 0 ? "default" : "destructive"}
                                                                    className={`px-2 py-1 font-mono transition-all ${item.change24h >= 0
                                                                        ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
                                                                        : 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20'
                                                                        }`}
                                                                >
                                                                    {formatPercent(item.change24h)}
                                                                </Badge>
                                                            </div>

                                                            <div className="col-span-3 text-right">
                                                                <p className="text-sm trading-dark-text-primary/80 font-mono">
                                                                    {formatNumber(item.volume)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>

                            {/* Last Updated */}
                            <div className="text-center text-sm trading-dark-text-secondary animate-pulse-subtle">
                                <div className="flex items-center justify-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                    Last updated: {lastUpdated.toLocaleTimeString()} • Connected via WebSocket
                                </div>
                            </div>
                        </div>
                    </div>
                </Tabs>
            </main>
        </div>
    )
}
