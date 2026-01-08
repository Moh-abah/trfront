// // src\components\charts\IndicatorChart\IndicatorChart.tsx

// 'use client';

// import React, { useEffect, useRef, useState } from 'react';
// import {
//     createChart,
//     IChartApi,
//     ISeriesApi,
//     UTCTimestamp,
//     ColorType,
// } from 'lightweight-charts';

// import { IndicatorSelector } from './IndicatorSelector';
// import { indicatorService } from '@/services/api/indicator.service';
// import { lightThemeConfig, darkThemeConfig } from '@/lib/charts/config/chart-config';
// import { useTheme } from '@/components/providers/ThemeProvider';

// export interface IndicatorData {
//     time: UTCTimestamp;
//     value: number;
//     [key: string]: any;
// }

// export interface ActiveIndicator {
//     id: string;
//     name: string;
//     type: string;
//     parameters: Record<string, any>;
//     data: IndicatorData[];
//     color: string;
//     series: ISeriesApi<'Line' | 'Area' | 'Histogram'> | null;
// }

// interface IndicatorChartProps {
//     symbol: string;
//     timeframe: string;
//     height?: number;
//     mainChartData?: any[];
//     onIndicatorAdd?: (indicator: ActiveIndicator) => void;
//     onIndicatorRemove?: (indicatorId: string) => void;
//     onIndicatorUpdate?: (indicatorId: string, parameters: Record<string, any>) => void;
// }

// export const IndicatorChart: React.FC<IndicatorChartProps> = ({
//     symbol,
//     timeframe,
//     height = 200,
//     mainChartData = [],
//     onIndicatorAdd,
//     onIndicatorRemove,
//     onIndicatorUpdate,
// }) => {
//     const { theme } = useTheme();
//     const chartContainerRef = useRef<HTMLDivElement>(null);
//     const chartRef = useRef<IChartApi | null>(null);
//     const [activeIndicators, setActiveIndicators] = useState<ActiveIndicator[]>([]);
//     const [isLoading, setIsLoading] = useState(false);

//     // تهيئة الرسم البياني
//     useEffect(() => {
//         if (!chartContainerRef.current || mainChartData.length === 0) return;

//         // تنظيف الرسم البياني السابق
//         if (chartRef.current) {
//             chartRef.current.remove();
//             chartRef.current = null;
//         }

//         // إعدادات الثيم
//         const chartConfig = theme === 'dark' ? darkThemeConfig : lightThemeConfig;

//         // إنشاء الرسم البياني
//         const chart = createChart(chartContainerRef.current, {
//             layout: {
//                 background: {
//                     type: ColorType.Solid,
//                     color: chartConfig.layout.background.color,
//                 },
//                 textColor: chartConfig.layout.textColor,
//                 fontSize: chartConfig.layout.fontSize,
//                 fontFamily: chartConfig.layout.fontFamily,
//             },
//             grid: chartConfig.grid,
//             width: chartContainerRef.current.clientWidth,
//             height,
//             priceScale: {
//                 ...chartConfig.priceScale,
//                 scaleMargins: {
//                     top: 0.1,
//                     bottom: 0.1,
//                 },
//             },
//             timeScale: {
//                 ...chartConfig.timeScale,
//                 visible: false,
//             },
//             handleScroll: false,
//             handleScale: false,
//         });

//         chart.timeScale().applyOptions({
//             rightOffset: 12,
//             barSpacing: 6,
//             visible: false,
//         });

//         chartRef.current = chart;

//         // معالجة تغيير الحجم
//         const handleResize = () => {
//             if (chartContainerRef.current && chartRef.current) {
//                 chartRef.current.applyOptions({
//                     width: chartContainerRef.current.clientWidth,
//                 });
//             }
//         };

//         window.addEventListener('resize', handleResize);

//         return () => {
//             window.removeEventListener('resize', handleResize);
//             if (chartRef.current) {
//                 chartRef.current.remove();
//             }
//         };
//     }, [theme, height, mainChartData.length]);

//     // إضافة مؤشر
//     const addIndicator = async (indicatorId: string, parameters: Record<string, any> = {}) => {
//         if (!chartRef.current || mainChartData.length === 0) return;

//         setIsLoading(true);
//         try {
//             // الحصول على بيانات المؤشر
//             const prices = mainChartData.map(d => d.close);
//             let indicatorData: number[] = [];

//             switch (indicatorId) {
//                 case 'rsi':
//                     indicatorData = await indicatorService.calculateRSI(prices, parameters.period || 14);
//                     break;
//                 case 'macd':
//                     const macdResult = await indicatorService.calculateMACD(
//                         prices,
//                         parameters.fastPeriod || 12,
//                         parameters.slowPeriod || 26,
//                         parameters.signalPeriod || 9
//                     );
//                     indicatorData = macdResult.macd;
//                     break;
//                 case 'sma':
//                     indicatorData = await indicatorService.calculateMovingAverage(
//                         prices,
//                         parameters.period || 20,
//                         'SMA'
//                     );
//                     break;
//                 case 'ema':
//                     indicatorData = await indicatorService.calculateMovingAverage(
//                         prices,
//                         parameters.period || 20,
//                         'EMA'
//                     );
//                     break;
//                 case 'bollinger':
//                     const bbResult = await indicatorService.calculateBollingerBands(
//                         prices,
//                         parameters.period || 20,
//                         parameters.stdDev || 2
//                     );
//                     indicatorData = bbResult.middle;
//                     break;
//                 default:
//                     console.warn(`Indicator ${indicatorId} not implemented`);
//                     return;
//             }

//             // تحويل البيانات إلى التنسيق المناسب
//             const formattedData: IndicatorData[] = mainChartData.slice(-indicatorData.length).map((d, i) => ({
//                 time: d.time,
//                 value: indicatorData[i] || 0,
//             }));

//             // اختيار اللون
//             const colors = [
//                 '#2962FF', '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0',
//                 '#118AB2', '#EF476F', '#7209B7', '#F72585', '#3A0CA3'
//             ];
//             const color = colors[activeIndicators.length % colors.length];

//             // إنشاء سلسلة جديدة
//             let series: ISeriesApi<'Line' | 'Area' | 'Histogram'>;

//             if (indicatorId === 'volume') { // This comparison appears to be unintentional because the types '"rsi" | "macd" | "sma" | "ema" | "bollinger"' and '"volume"' have no overlap.
//                 series = chartRef.current.addHistogramSeries({
//                     color,
//                     priceFormat: {
//                         type: 'volume',
//                     },
//                 });
//             } else {
//                 series = chartRef.current.addLineSeries({
//                     color,
//                     lineWidth: 2,
//                 });
//             }

//             series.setData(formattedData);

//             // حفظ المؤشر النشط
//             const newIndicator: ActiveIndicator = {
//                 id: `${indicatorId}_${Date.now()}`,
//                 name: indicatorId.toUpperCase(),
//                 type: indicatorId,
//                 parameters,
//                 data: formattedData,
//                 color,
//                 series,
//             };

//             setActiveIndicators(prev => [...prev, newIndicator]);
//             onIndicatorAdd?.(newIndicator);

//         } catch (error) {
//             console.error('Error adding indicator:', error);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // تحديث المؤشر
//     const updateIndicator = async (indicatorId: string, newParameters: Record<string, any>) => {
//         const indicator = activeIndicators.find(i => i.id === indicatorId);
//         if (!indicator || !chartRef.current) return;

//         // إزالة السلسلة القديمة
//         if (indicator.series) {
//             chartRef.current.removeSeries(indicator.series);
//         }

//         // إضافة المؤشر مرة أخرى بالمعلمات الجديدة
//         await addIndicator(indicator.type, newParameters);

//         // إزالة المؤشر القديم
//         removeIndicator(indicatorId);

//         onIndicatorUpdate?.(indicatorId, newParameters);
//     };

//     // إزالة المؤشر
//     const removeIndicator = (indicatorId: string) => {
//         const indicator = activeIndicators.find(i => i.id === indicatorId);
//         if (!indicator || !chartRef.current) return;

//         // إزالة السلسلة من الرسم البياني
//         if (indicator.series) {
//             chartRef.current.removeSeries(indicator.series);
//         }

//         // إزالة المؤشر من القائمة
//         setActiveIndicators(prev => prev.filter(i => i.id !== indicatorId));
//         onIndicatorRemove?.(indicatorId);
//     };

//     return (
//         <div className="border border-gray-200 dark:border-gray-700 border-t-0 rounded-b-lg overflow-hidden">
//             <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800">
//                 <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                     المؤشرات ({activeIndicators.length})
//                 </div>

//                 <IndicatorSelector
//                     onSelectIndicator={addIndicator}
//                     activeIndicators={activeIndicators}
//                     onRemoveIndicator={removeIndicator}
//                     onUpdateIndicator={updateIndicator}
//                     isLoading={isLoading}
//                 />
//             </div>

//             <div
//                 ref={chartContainerRef}
//                 className="w-full"
//                 style={{ height: `${height}px` }}
//             />

//             {isLoading && (
//                 <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 bg-opacity-75">
//                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
//                 </div>
//             )}

//             {activeIndicators.length === 0 && !isLoading && (
//                 <div className="flex items-center justify-center h-full">
//                     <p className="text-gray-500 dark:text-gray-400">
//                         اضغط على "+" لإضافة مؤشر
//                     </p>
//                 </div>
//             )}
//         </div>
//     );
// };