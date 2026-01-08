// 'use client';

// import React, { useEffect, useRef } from 'react';
// import {
//     createChart,
//     ColorType,
//     UTCTimestamp,
// } from 'lightweight-charts';
// import { useTheme } from '@/hooks/useTheme';


// interface MiniChartProps {
//     data: Array<{
//         time: string | number;
//         value: number;
//     }>;
//     height?: number;
//     width?: number;
//     color?: string;
//     showBorder?: boolean;
//     showTooltip?: boolean;
// }

// export const MiniChart: React.FC<MiniChartProps> = ({
//     data,
//     height = 40,
//     width = 120,
//     color,
//     showBorder = true,
//     showTooltip = false,
// }) => {
//     const { theme } = useTheme();
//     const chartContainerRef = useRef<HTMLDivElement>(null);
//     const [hoverValue, setHoverValue] = React.useState<number | null>(null);
//     const [hoverTime, setHoverTime] = React.useState<string | null>(null);

//     useEffect(() => {
//         if (!chartContainerRef.current || data.length === 0) return;

//         const chart = createChart(chartContainerRef.current, {
//             layout: {
//                 background: {
//                     type: ColorType.Solid,
//                     color: 'transparent',
//                 },
//                 textColor: 'transparent',
//             },
//             width,
//             height,
//             grid: {
//                 vertLines: { visible: false },
//                 horzLines: { visible: false },
//             },
//             rightPriceScale: {
//                 visible: false,
//                 borderVisible: false,
//             },
//             leftPriceScale: {
//                 visible: false,
//                 borderVisible: false,
//             },
//             timeScale: {
//                 visible: false,
//                 borderVisible: false,
//             },
//             crosshair: {
//                 horzLine: { visible: false },
//                 vertLine: { visible: false },
//             },
//             handleScroll: false,
//             handleScale: false,
//         });

//         // تحديد اللون بناءً على الأداء
//         const chartColor = color || (data.length > 1 && data[0].value < data[data.length - 1].value)
//             ? '#10B981'
//             : '#EF4444';

//         const lineSeries = chart.addLineSeries({
//             color: chartColor,
//             lineWidth: 2,
//         });

//         const formattedData = data.map(point => ({
//             time: (new Date(point.time).getTime() / 1000) as UTCTimestamp,
//             value: point.value,
//         }));

//         lineSeries.setData(formattedData);

//         // إضافة معالج للمؤشر إذا كان مطلوباً
//         if (showTooltip) {
//             chart.subscribeCrosshairMove(param => {
//                 if (param.point) {
//                     const price = param.seriesPrices.get(lineSeries);
//                     if (price !== undefined) {
//                         setHoverValue(price as number);
//                         setHoverTime(param.time as string);
//                     }
//                 } else {
//                     setHoverValue(null);
//                     setHoverTime(null);
//                 }
//             });
//         }

//         // معالجة تغيير الحجم
//         const handleResize = () => {
//             chart.applyOptions({ width, height });
//         };

//         window.addEventListener('resize', handleResize);

//         return () => {
//             window.removeEventListener('resize', handleResize);
//             chart.remove();
//         };
//     }, [data, height, width, color, showTooltip]);

//     if (data.length === 0) {
//         return (
//             <div
//                 className={`flex items-center justify-center ${showBorder ? 'border border-gray-200 dark:border-gray-700 rounded' : ''}`}
//                 style={{ width: `${width}px`, height: `${height}px` }}
//             >
//                 <span className="text-xs text-gray-400">لا توجد بيانات</span>
//             </div>
//         );
//     }

//     const currentValue = data[data.length - 1].value;
//     const previousValue = data.length > 1 ? data[0].value : currentValue;
//     const change = currentValue - previousValue;
//     const changePercent = (change / previousValue) * 100;
//     const isPositive = change >= 0;

//     return (
//         <div className="relative">
//             <div
//                 ref={chartContainerRef}
//                 className={showBorder ? 'border border-gray-200 dark:border-gray-700 rounded' : ''}
//             />

//             {showTooltip && hoverValue !== null && (
//                 <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg z-10 whitespace-nowrap">
//                     <div>{hoverTime}</div>
//                     <div className="font-semibold">${hoverValue.toFixed(2)}</div>
//                 </div>
//             )}

//             {!showTooltip && (
//                 <div className="mt-1 text-xs text-center">
//                     <div className="font-semibold">${currentValue.toFixed(2)}</div>
//                     <div className={`${isPositive ? 'text-green-600' : 'text-red-600'}`}>
//                         {isPositive ? '▲' : '▼'} {Math.abs(changePercent).toFixed(2)}%
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// // MiniChart للاستخدام في قوائم المراقبة
// export const WatchlistMiniChart: React.FC<{
//     symbol: string;
//     prices: number[];
//     currentPrice: number;
//     change: number;
//     changePercent: number;
// }> = ({ symbol, prices, currentPrice, change, changePercent }) => {
//     const chartData = prices.map((price, index) => ({
//         time: Date.now() - (prices.length - index - 1) * 3600000, // ساعة واحدة بين النقاط
//         value: price,
//     }));

//     const isPositive = change >= 0;

//     return (
//         <div className="flex items-center space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
//             <div className="flex-1">
//                 <div className="font-medium text-gray-900 dark:text-white">{symbol}</div>
//                 <div className="text-2xl font-bold">${currentPrice.toFixed(2)}</div>
//             </div>

//             <div className="flex flex-col items-end">
//                 <div className={`text-lg font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
//                     {isPositive ? '+' : ''}{change.toFixed(2)}
//                 </div>
//                 <div className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
//                     {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
//                 </div>
//             </div>

//             <div className="w-24">
//                 <MiniChart
//                     data={chartData}
//                     height={40}
//                     width={96}
//                     color={isPositive ? '#10B981' : '#EF4444'}
//                     showBorder={false}
//                 />
//             </div>
//         </div>
//     );
// };