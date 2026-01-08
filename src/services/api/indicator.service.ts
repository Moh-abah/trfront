
// // @ts-nocheck

// // src/services/api/indicator.service.ts
// import { axiosClient } from './http/axios.client';
// import { apiConfig } from '@/config/api.config';
// import { IndicatorConfig, ChartData } from '@/types';

// export interface IndicatorApplyRequest {
//     data: ChartData[];
//     indicators: IndicatorConfig[];
//     timeframe?: string;
// }

// export interface IndicatorResult {
//     indicator: IndicatorConfig;
//     values: number[];
//     signals?: Array<{
//         timestamp: number;
//         value: number;
//         signal: 'buy' | 'sell' | 'neutral';
//         strength: number;
//     }>;
//     metadata: {
//         calculation_time: number;
//         valid_periods: number;
//         warnings?: string[];
//     };
// }

// export interface PineTranspileRequest {
//     pine_code: string;
//     target_language?: 'python' | 'javascript';
//     include_metadata?: boolean;
// }

// export interface PineTranspileResult {
//     transpiled_code: string;
//     indicators: IndicatorConfig[];
//     functions: Array<{
//         name: string;
//         parameters: Record<string, any>;
//         return_type: string;
//     }>;
//     metadata: {
//         original_lines: number;
//         transpiled_lines: number;
//         supported_functions: string[];
//         unsupported_functions: string[];
//         warnings: string[];
//     };
// }

// export interface AvailableIndicator {
//     name: string;
//     category: string;
//     description: string;
//     parameters: Array<{
//         name: string;
//         type: string;
//         default: any;
//         min?: number;
//         max?: number;
//         step?: number;
//         description: string;
//         required: boolean;
//     }>;
//     outputs: Array<{
//         name: string;
//         type: string;
//         description: string;
//     }>;
//     signals: boolean;
//     timeframe_support: string[];
//     examples: Array<{
//         parameters: Record<string, any>;
//         description: string;
//     }>;
// }

// export interface IndicatorSignal {
//     indicator: string;
//     value: number;
//     signal: 'buy' | 'sell' | 'hold';
//     strength: number;
//     timestamp: number;
//     parameters?: Record<string, any>;
// }

// export interface CustomIndicator {
//     id: string;
//     name: string;
//     code: string;
//     language: 'python' | 'javascript';
//     parameters: Record<string, any>;
//     description?: string;
//     category?: string;
//     created_at: string;
//     updated_at: string;
//     is_public?: boolean;
//     author_id?: string;
// }

// export const indicatorService = {
//     // Apply indicators to data
//     async applyIndicators(request: IndicatorApplyRequest): Promise<IndicatorResult[]> {
//         return axiosClient.post(apiConfig.endpoints.indicators.apply, request);
//     },

//     // Get available indicators
//     async getAvailableIndicators(): Promise<AvailableIndicator[]> {
//         return axiosClient.get(apiConfig.endpoints.indicators.available);
//     },

//     // Get indicator by name
//     async getIndicatorByName(name: string): Promise<AvailableIndicator> {
//         const indicators = await this.getAvailableIndicators();
//         const indicator = indicators.find(ind => ind.name === name);

//         if (!indicator) {
//             throw new Error(`Indicator ${name} not found`);
//         }

//         return indicator;
//     },

//     // Get indicator parameters
//     async getIndicatorParameters(indicatorName: string): Promise<AvailableIndicator['parameters']> {
//         return axiosClient.get(apiConfig.endpoints.indicators.params, {
//             urlParams: { indicator_name: indicatorName }
//         });
//     },

//     // Transpile Pine Script
//     async transpilePineScript(request: PineTranspileRequest): Promise<PineTranspileResult> {
//         return axiosClient.post(apiConfig.endpoints.indicators.transpile, request);
//     },

//     // Get signals from indicators
//     async getSignals(data: ChartData[], indicators: IndicatorConfig[]): Promise<IndicatorSignal[]> {
//         return axiosClient.post(apiConfig.endpoints.indicators.signals, {
//             data,
//             indicators
//         });
//     },

//     // Calculate single indicator
//     async calculateIndicator(
//         data: ChartData[],
//         indicator: IndicatorConfig
//     ): Promise<IndicatorResult> {
//         return axiosClient.post(apiConfig.endpoints.indicators.calculate, {
//             data,
//             indicator
//         });
//     },

//     // Validate indicator configuration
//     async validateIndicator(indicator: IndicatorConfig): Promise<{
//         valid: boolean;
//         errors: string[];
//         warnings: string[];
//     }> {
//         return axiosClient.post(apiConfig.endpoints.indicators.validate, indicator);
//     },

//     // Get indicator templates
//     async getIndicatorTemplates(category?: string): Promise<IndicatorConfig[]> {
//         return axiosClient.get(apiConfig.endpoints.indicators.templates, {
//             params: { category }
//         });
//     },

//     // Save custom indicator
//     async saveCustomIndicator(indicator: Omit<CustomIndicator, 'id' | 'created_at' | 'updated_at'>): Promise<CustomIndicator> {
//         return axiosClient.post(apiConfig.endpoints.indicators.custom, indicator);
//     },

//     // Get custom indicators
//     async getCustomIndicators(authorId?: string): Promise<CustomIndicator[]> {
//         return axiosClient.get(apiConfig.endpoints.indicators.custom, {
//             params: { author_id: authorId }
//         });
//     },

//     // Update custom indicator
//     async updateCustomIndicator(indicatorId: string, updates: Partial<CustomIndicator>): Promise<CustomIndicator> {
//         return axiosClient.put(`${apiConfig.endpoints.indicators.custom}/${indicatorId}`, updates);
//     },

//     // Delete custom indicator
//     async deleteCustomIndicator(indicatorId: string): Promise<{ message: string }> {
//         return axiosClient.delete(`${apiConfig.endpoints.indicators.custom}/${indicatorId}`);
//     },

//     // Test custom indicator
//     async testCustomIndicator(
//         indicatorId: string,
//         testData: ChartData[]
//     ): Promise<{
//         results: IndicatorResult;
//         performance: {
//             calculation_time: number;
//             memory_usage: number;
//             errors?: string[];
//         };
//     }> {
//         return axiosClient.post(`${apiConfig.endpoints.indicators.custom}/${indicatorId}/test`, {
//             test_data: testData
//         });
//     },

//     // Get indicator combinations
//     async getIndicatorCombinations(): Promise<Array<{
//         name: string;
//         description: string;
//         indicators: IndicatorConfig[];
//         use_case: string;
//         effectiveness: number;
//     }>> {
//         return axiosClient.get(`${apiConfig.endpoints.indicators.combinations}`);
//     },

//     // Optimize indicator parameters
//     async optimizeIndicatorParameters(
//         data: ChartData[],
//         indicator: IndicatorConfig,
//         parameterRanges: Record<string, { min: number; max: number; step: number }>,
//         optimizationMetric: string = 'signal_accuracy'
//     ): Promise<{
//         best_parameters: Record<string, any>;
//         best_metric_value: number;
//         optimization_history: Array<{
//             parameters: Record<string, any>;
//             metrics: Record<string, number>;
//         }>;
//     }> {
//         return axiosClient.post(`${apiConfig.endpoints.indicators.optimize}`, {
//             data,
//             indicator,
//             parameter_ranges: parameterRanges,
//             optimization_metric: optimizationMetric
//         });
//     },

//     // Get indicator performance
//     async getIndicatorPerformance(
//         indicatorName: string,
//         market: string,
//         timeframe: string,
//         days: number = 30
//     ): Promise<{
//         accuracy: number;
//         precision: number;
//         recall: number;
//         f1_score: number;
//         total_signals: number;
//         profitable_signals: number;
//         win_rate: number;
//         avg_profit: number;
//         avg_loss: number;
//         profit_factor: number;
//     }> {
//         return axiosClient.get(`${apiConfig.endpoints.indicators.performance}`, {
//             params: { indicator_name: indicatorName, market, timeframe, days }
//         });
//     },

//     // Get indicator correlation
//     async getIndicatorCorrelation(
//         indicators: string[],
//         market: string,
//         timeframe: string
//     ): Promise<{
//         correlation_matrix: number[][];
//         indicators: string[];
//         recommendations: Array<{
//             indicator_pair: [string, string];
//             correlation: number;
//             recommendation: string;
//         }>;
//     }> {
//         return axiosClient.post(`${apiConfig.endpoints.indicators.correlation}`, {
//             indicators,
//             market,
//             timeframe
//         });
//     },

//     // Export indicator configuration
//     async exportIndicatorConfig(indicator: IndicatorConfig, format: 'json' | 'yaml' = 'json'): Promise<{
//         content: string;
//         filename: string;
//     }> {
//         return axiosClient.post(`${apiConfig.endpoints.indicators.export}`, {
//             indicator,
//             format
//         });
//     },

//     // Import indicator configuration
//     async importIndicatorConfig(config: string, format: 'json' | 'yaml' = 'json'): Promise<IndicatorConfig> {
//         return axiosClient.post(`${apiConfig.endpoints.indicators.import}`, {
//             config,
//             format
//         });
//     },

//     // Get indicator categories
//     async getIndicatorCategories(): Promise<Array<{
//         name: string;
//         description: string;
//         indicators: string[];
//         popular_combinations: string[][];
//     }>> {
//         return axiosClient.get(`${apiConfig.endpoints.indicators.categories}`);
//     },

//     // Get real-time indicator values (streaming)
//     async streamIndicatorValues(
//         symbol: string,
//         timeframe: string,
//         indicators: IndicatorConfig[],
//         onUpdate: (values: IndicatorResult[]) => void
//     ): Promise<() => void> {
//         // Implementation for WebSocket streaming
//         // This would connect to a WebSocket endpoint for live indicator updates
//         throw new Error('Not implemented: Use WebSocket service for streaming');
//     },

//     // Calculate indicator divergence
//     async calculateDivergence(
//         data: ChartData[],
//         indicatorName: string,
//         lookbackPeriods: number = 20
//     ): Promise<Array<{
//         timestamp: number;
//         price_high: boolean;
//         price_low: boolean;
//         indicator_high: boolean;
//         indicator_low: boolean;
//         divergence_type: 'bullish' | 'bearish' | 'hidden_bullish' | 'hidden_bearish' | 'none';
//         strength: number;
//     }>> {
//         return axiosClient.post(`${apiConfig.endpoints.indicators.divergence}`, {
//             data,
//             indicator_name: indicatorName,
//             lookback_periods: lookbackPeriods
//         });
//     }
// };