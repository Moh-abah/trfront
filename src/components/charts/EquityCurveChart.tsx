// 'use client';

// import React, { useEffect, useRef } from 'react';
// import {
//     createChart,
//     ColorType,
//     UTCTimestamp,
// } from 'lightweight-charts';
// import { useTheme } from '@/hooks/useTheme';

// interface EquityPoint {
//     timestamp: string | number;
//     equity: number;
//     drawdown: number;
//     profit?: number;
// }

// interface EquityCurveChartProps {
//     data: EquityPoint[];
//     height?: number;
//     showDrawdown?: boolean;
//     showProfit?: boolean;
// }

// export const EquityCurveChart: React.FC<EquityCurveChartProps> = ({
//     data,
//     height = 300,
//     showDrawdown = true,
//     showProfit = false,
// }) => {
//     const { theme } = useTheme();
//     const chartContainerRef = useRef<HTMLDivElement>(null);

//     useEffect(() => {
//         if (!chartContainerRef.current || data.length === 0) return;

//         const chart = createChart(chartContainerRef.current, {
//             layout: {
//                 background: {
//                     type: ColorType.Solid,
//                     color: theme === 'dark' ? '#131722' : '#FFFFFF',
//                 },
//                 textColor: theme === 'dark' ? '#D9D9D9' : '#191919',
//                 fontSize: 12,
//                 fontFamily: 'Inter, sans-serif',
//             },
//             width: chartContainerRef.current.clientWidth,
//             height,
//             grid: {
//                 vertLines: {
//                     color: theme === 'dark' ? '#2B2B43' : '#E6E6E6',
//                     style: 2,
//                 },
//                 horzLines: {
//                     color: theme === 'dark' ? '#2B2B43' : '#E6E6E6',
//                     style: 2,
//                 },
//             },
//             timeScale: {
//                 borderColor: theme === 'dark' ? '#2B2B43' : '#E6E6E6',
//                 timeVisible: true,
//             },
//             rightPriceScale: {
//                 borderColor: theme === 'dark' ? '#2B2B43' : '#E6E6E6',
//                 scaleMargins: {
//                     top: 0.1,
//                     bottom: 0.1,
//                 },
//             },
//         });

//         // إضافة سلسلة الأسهم
//         const equitySeries = chart.addLineSeries({
//             color: '#10B981',
//             lineWidth: 2,
//             title: 'رأس المال',
//         });

//         // إضافة سلسلة الحد الأقصى للسحب
//         if (showDrawdown) {
//             const drawdownSeries = chart.addAreaSeries({
//                 lineColor: 'rgba(239, 68, 68, 0.5)',
//                 topColor: 'rgba(239, 68, 68, 0.1)',
//                 bottomColor: 'rgba(239, 68, 68, 0)',
//                 lineWidth: 1,
//                 title: 'الحد الأقصى للسحب',
//             });

//             const drawdownData = data.map(point => ({
//                 time: (new Date(point.timestamp).getTime() / 1000) as UTCTimestamp,
//                 value: point.drawdown,
//             }));
//             drawdownSeries.setData(drawdownData);
//         }

//         // إضافة سلسلة الأرباح
//         if (showProfit) {
//             const profitSeries = chart.addHistogramSeries({
//                 color: '#10B981',
//                 priceFormat: {
//                     type: 'custom',
//                     formatter: (price: number) => `${price > 0 ? '+' : ''}${price.toFixed(2)}`,
//                 },
//                 priceScaleId: 'profit',
//                 title: 'الأرباح',
//             });

//             chart.priceScale('profit').applyOptions({
//                 scaleMargins: {
//                     top: 0.7,
//                     bottom: 0,
//                 },
//             });

//             const profitData = data.map((point, index) => ({
//                 time: (new Date(point.timestamp).getTime() / 1000) as UTCTimestamp,
//                 value: point.profit || 0,
//                 color: (point.profit || 0) >= 0 ? '#10B981' : '#EF4444',
//             }));
//             profitSeries.setData(profitData);
//         }

//         // تحويل البيانات
//         const equityData = data.map(point => ({
//             time: (new Date(point.timestamp).getTime() / 1000) as UTCTimestamp,
//             value: point.equity,
//         }));

//         equitySeries.setData(equityData);

//         // إضافة علامات للمتوسطات
//         if (data.length > 0) {
//             const avgEquity = data.reduce((sum, point) => sum + point.equity, 0) / data.length;

//             const avgSeries = chart.addLineSeries({
//                 color: 'rgba(156, 163, 175, 0.5)',
//                 lineWidth: 1,
//                 lineStyle: 2, // خط منقط
//                 title: 'المتوسط',
//             });

//             avgSeries.setData([
//                 { time: equityData[0].time, value: avgEquity },
//                 { time: equityData[equityData.length - 1].time, value: avgEquity },
//             ]);
//         }

//         // معالجة تغيير الحجم
//         const handleResize = () => {
//             if (chartContainerRef.current) {
//                 chart.applyOptions({
//                     width: chartContainerRef.current.clientWidth,
//                 });
//             }
//         };

//         window.addEventListener('resize', handleResize);

//         return () => {
//             window.removeEventListener('resize', handleResize);
//             chart.remove();
//         };
//     }, [data, height, showDrawdown, showProfit, theme]);

//     if (data.length === 0) {
//         return (
//             <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
//                 لا توجد بيانات متاحة
//             </div>
//         );
//     }

//     return (
//         <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
//             <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//                     منحنى رأس المال
//                 </h3>

//                 <div className="flex items-center space-x-4 text-sm">
//                     <div className="flex items-center space-x-1">
//                         <div className="w-3 h-3 rounded-full bg-green-500"></div>
//                         <span className="text-gray-600 dark:text-gray-400">رأس المال</span>
//                     </div>

//                     {showDrawdown && (
//                         <div className="flex items-center space-x-1">
//                             <div className="w-3 h-3 rounded-full bg-red-500"></div>
//                             <span className="text-gray-600 dark:text-gray-400">السحب</span>
//                         </div>
//                     )}
//                 </div>
//             </div>

//             <div
//                 ref={chartContainerRef}
//                 className="w-full"
//                 style={{ height: `${height}px` }}
//             />

//             <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
//                 <div className="text-center">
//                     <div className="text-gray-500 dark:text-gray-400">أقصى رأس مال</div>
//                     <div className="text-xl font-bold text-green-600">
//                         ${Math.max(...data.map(d => d.equity)).toFixed(2)}
//                     </div>
//                 </div>

//                 <div className="text-center">
//                     <div className="text-gray-500 dark:text-gray-400">الحد الأدنى</div>
//                     <div className="text-xl font-bold text-red-600">
//                         ${Math.min(...data.map(d => d.equity)).toFixed(2)}
//                     </div>
//                 </div>

//                 <div className="text-center">
//                     <div className="text-gray-500 dark:text-gray-400">أقصى سحب</div>
//                     <div className="text-xl font-bold text-red-600">
//                         {Math.max(...data.map(d => d.drawdown)).toFixed(2)}%
//                     </div>
//                 </div>

//                 <div className="text-center">
//                     <div className="text-gray-500 dark:text-gray-400">إجمالي العوائد</div>
//                     <div className={`text-xl font-bold ${data[data.length - 1].equity >= data[0].equity ? 'text-green-600' : 'text-red-600'
//                         }`}>
//                         {((data[data.length - 1].equity / data[0].equity - 1) * 100).toFixed(2)}%
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };