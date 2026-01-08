
// @ts-nocheck

// src/services/api/filter.service.ts
import { axiosClient } from './http/axios.client';
import { apiConfig } from '@/config/api.config';

export interface FilterCriteria {
    field: string;
    operator: string;
    value: any;
    value_type?: string;
}

export interface FilterGroup {
    operator: 'AND' | 'OR';
    conditions: Array<FilterCriteria | FilterGroup>;
}

export interface FilterRequest {
    market: 'crypto' | 'stocks' | 'all';
    criteria: FilterGroup;
    limit?: number;
    offset?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    fields?: string[];
}

export interface FilterResult {
    symbols: string[];
    total_count: number;
    filtered_count: number;
    execution_time: number;
    metadata: Record<string, any>;
}

export interface BulkFilterRequest {
    symbols: string[];
    criteria: FilterGroup;
    market?: string;
}

export interface FilterPreset {
    id: string;
    name: string;
    description?: string;
    criteria: FilterGroup;
    market: string;
    created_at: string;
    updated_at: string;
    tags?: string[];
    is_public?: boolean;
    author_id?: string;
}

export interface MarketStats {
    total_symbols: number;
    active_symbols: number;
    market_cap_stats: {
        min: number;
        max: number;
        avg: number;
        median: number;
    };
    volume_stats: {
        min: number;
        max: number;
        avg: number;
        median: number;
    };
    price_stats: {
        min: number;
        max: number;
        avg: number;
        median: number;
    };
    sector_distribution?: Record<string, number>;
    category_distribution?: Record<string, number>;
}

export const filterService = {
    // Filter symbols based on criteria
    async filterSymbols(request: FilterRequest): Promise<FilterResult> {
        return axiosClient.post(apiConfig.endpoints.filtering.symbols, request);
    },

    // Bulk filter symbols
    async bulkFilter(request: BulkFilterRequest): Promise<{
        filtered_symbols: string[];
        rejected_symbols: string[];
        reason?: string;
    }> {
        return axiosClient.post(apiConfig.endpoints.filtering.bulk, request);
    },

    // Get market statistics
    async getMarketStats(market: string): Promise<MarketStats> {
        return axiosClient.get(apiConfig.endpoints.filtering.stats, {
            params: { market }
        });
    },

    // Get available markets for filtering
    async getAvailableMarkets(): Promise<Array<{
        market: string;
        symbol_count: number;
        last_updated: string;
    }>> {
        return axiosClient.get(apiConfig.endpoints.filtering.markets);
    },

    // Get filter criteria examples
    async getCriteriaExamples(): Promise<Array<{
        name: string;
        description: string;
        criteria: FilterGroup;
        market: string;
        use_case: string;
    }>> {
        return axiosClient.get(apiConfig.endpoints.filtering.criteriaExamples);
    },

    // Scan market with filter
    async scanMarket(
        market: string,
        criteria: FilterGroup,
        batchSize: number = 100
    ): Promise<{
        scan_id: string;
        status: 'queued' | 'running' | 'completed' | 'failed';
        estimated_completion?: string;
    }> {
        return axiosClient.post(apiConfig.endpoints.filtering.scan, {
            market,
            criteria,
            batch_size: batchSize
        });
    },

    // Get scan results
    async getScanResults(scanId: string): Promise<{
        status: 'queued' | 'running' | 'completed' | 'failed';
        progress?: number;
        results?: FilterResult;
        error?: string;
    }> {
        return axiosClient.get(apiConfig.endpoints.filtering.results, {
            urlParams: { scan_id: scanId }
        });
    },

    // Save filter preset
    async savePreset(preset: Omit<FilterPreset, 'id' | 'created_at' | 'updated_at'>): Promise<FilterPreset> {
        return axiosClient.post(apiConfig.endpoints.filtering.presets, preset);
    },

    // Get all presets
    async getPresets(
        market?: string,
        isPublic?: boolean,
        tags?: string[]
    ): Promise<FilterPreset[]> {
        return axiosClient.get(apiConfig.endpoints.filtering.presets, {
            params: { market, is_public: isPublic, tags }
        });
    },

    // Get preset by ID
    async getPreset(presetId: string): Promise<FilterPreset> {
        return axiosClient.get(`${apiConfig.endpoints.filtering.presets}/${presetId}`);
    },

    // Update preset
    async updatePreset(presetId: string, updates: Partial<FilterPreset>): Promise<FilterPreset> {
        return axiosClient.put(`${apiConfig.endpoints.filtering.presets}/${presetId}`, updates);
    },

    // Delete preset
    async deletePreset(presetId: string): Promise<{ message: string }> {
        return axiosClient.delete(`${apiConfig.endpoints.filtering.presets}/${presetId}`);
    },

    // Duplicate preset
    async duplicatePreset(presetId: string, newName?: string): Promise<FilterPreset> {
        return axiosClient.post(`${apiConfig.endpoints.filtering.presets}/${presetId}/duplicate`, {
            new_name: newName
        });
    },

    // Validate filter criteria
    async validateCriteria(criteria: FilterGroup, market: string): Promise<{
        valid: boolean;
        errors: string[];
        warnings: string[];
        estimated_symbol_count?: number;
    }> {
        return axiosClient.post(apiConfig.endpoints.filtering.validate, {
            criteria,
            market
        });
    },

    // Get field metadata
    async getFieldMetadata(market: string): Promise<Array<{
        field: string;
        type: string;
        description: string;
        operators: string[];
        value_type?: string;
        min?: number;
        max?: number;
        options?: any[];
        category: string;
    }>> {
        return axiosClient.get(`${apiConfig.endpoints.filtering.metadata}/fields`, {
            params: { market }
        });
    },

    // Get operator metadata
    async getOperatorMetadata(): Promise<Array<{
        operator: string;
        description: string;
        applicable_types: string[];
        requires_value: boolean;
    }>> {
        return axiosClient.get(`${apiConfig.endpoints.filtering.metadata}/operators`);
    },

    // Get real-time filter results (streaming)
    async streamFilterResults(
        market: string,
        criteria: FilterGroup,
        onUpdate: (results: FilterResult) => void
    ): Promise<() => void> {
        // Implementation for WebSocket streaming
        // This would connect to a WebSocket endpoint for live filter updates
        throw new Error('Not implemented: Use WebSocket service for streaming');
    },

    // Export filter results
    async exportResults(
        results: FilterResult,
        format: 'csv' | 'json' | 'xlsx' = 'json'
    ): Promise<{ url: string; expires_at: string }> {
        return axiosClient.post(`${apiConfig.endpoints.filtering.results}/export`, {
            results,
            format
        });
    },

    // Create dynamic watchlist from filter results
    async createWatchlistFromFilter(
        results: FilterResult,
        name: string,
        description?: string
    ): Promise<{ watchlist_id: string; message: string }> {
        return axiosClient.post(`${apiConfig.endpoints.filtering.results}/watchlist`, {
            results,
            name,
            description
        });
    },

    // Get filter performance metrics
    async getPerformanceMetrics(presetId: string): Promise<{
        total_runs: number;
        avg_execution_time: number;
        success_rate: number;
        last_run: string;
        most_common_results: string[];
    }> {
        return axiosClient.get(`${apiConfig.endpoints.filtering.presets}/${presetId}/metrics`);
    },

    // Run filter on schedule
    async scheduleFilter(
        presetId: string,
        schedule: 'daily' | 'weekly' | 'monthly',
        time?: string
    ): Promise<{ schedule_id: string; message: string }> {
        return axiosClient.post(`${apiConfig.endpoints.filtering.presets}/${presetId}/schedule`, {
            schedule,
            time
        });
    },

    // Get scheduled filters
    async getScheduledFilters(): Promise<Array<{
        id: string;
        preset_id: string;
        schedule: string;
        next_run: string;
        enabled: boolean;
    }>> {
        return axiosClient.get(`${apiConfig.endpoints.filtering.schedule}`);
    },

    getFilterPresets: async (
        market?: string,
        isPublic?: boolean,
        tags?: string[]
    ): Promise<FilterPreset[]> => {
        return filterService.getPresets(market, isPublic, tags);
    },

    saveFilterPreset: async (
        preset: Omit<FilterPreset, 'id' | 'created_at' | 'updated_at'>
    ): Promise<FilterPreset> => {
        return filterService.savePreset(preset);
    },

    deleteFilterPreset: async (presetId: string): Promise<{ message: string }> => {
        return filterService.deletePreset(presetId);
    },

    // Update scheduled filter
    async updateScheduledFilter(
        scheduleId: string,
        updates: Partial<{
            schedule: string;
            time: string;
            enabled: boolean;
        }>
    ): Promise<{ message: string }> {
        return axiosClient.put(`${apiConfig.endpoints.filtering.schedule}/${scheduleId}`, updates);
    },

    // Delete scheduled filter
    async deleteScheduledFilter(scheduleId: string): Promise<{ message: string }> {
        return axiosClient.delete(`${apiConfig.endpoints.filtering.schedule}/${scheduleId}`);
    },

    // Get filter history
    async getFilterHistory(
        limit: number = 50,
        offset: number = 0,
        presetId?: string
    ): Promise<{
        history: Array<{
            id: string;
            preset_id?: string;
            criteria: FilterGroup;
            results: FilterResult;
            executed_at: string;
            execution_time: number;
        }>;
        total: number;
    }> {
        return axiosClient.get(`${apiConfig.endpoints.filtering.history}`, {
            params: { limit, offset, preset_id: presetId }
        });
    }
};