// src/services/api/settings.service.ts
import { StrategyConfig } from '@/types/strategies/strategy';
import { axiosClient } from './http/axios.client';
import { apiConfig } from '@/config/api.config';
import { IndicatorConfig } from '@/lib/charts/types/indicator';


export interface SettingsResponse {
    success: boolean;
    data: any;
    message?: string;
}

export interface Watchlist {
    id: string;
    name: string;
    description?: string;
    symbols: string[];
    market?: string;
    is_public: boolean;
    is_default: boolean;
    created_at: string;
    updated_at: string;
    tags?: string[];
}

export interface ApiKey {
    id: string;
    name: string;
    key: string;
    key_type: 'read' | 'trade' | 'admin';
    exchange: string;
    is_active: boolean;
    created_at: string;
    last_used?: string;
    permissions: string[];
}

export interface Alert {
    id: string;
    name: string;
    type: 'price' | 'indicator' | 'volume' | 'time';
    symbol: string;
    condition: string;
    value: number | string;
    notification_methods: string[];
    is_active: boolean;
    created_at: string;
    triggered_at?: string;
    triggered_count: number;
}

export interface Portfolio {
    id: string;
    name: string;
    description?: string;
    initial_balance: number;
    current_balance: number;
    currency: string;
    strategy?: string;
    risk_level: 'low' | 'medium' | 'high';
    created_at: string;
    updated_at: string;
}
// services/api/settings.service.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const settingsService = {
    // === قوائم المراقبة ===
    async getWatchlists() {
        const response = await fetch(`${API_BASE_URL}/api/v1/settings/watchlists`);

        if (!response.ok) {
            throw new Error(`Failed to fetch watchlists: ${response.statusText}`);
        }

        return response.json();
    },

    async getWatchlistById(id: string) {
        const response = await fetch(`${API_BASE_URL}/api/v1/settings/watchlists/${id}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch watchlist: ${response.statusText}`);
        }

        return response.json();
    },

    async createWatchlist(watchlist: any) {
        const response = await fetch(`${API_BASE_URL}/api/v1/settings/watchlists`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(watchlist)
        });

        if (!response.ok) {
            throw new Error(`Failed to create watchlist: ${response.statusText}`);
        }

        return response.json();
    },

    async updateWatchlist(id: string, updates: any) {
        const response = await fetch(`${API_BASE_URL}/api/v1/settings/watchlists/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updates)
        });

        if (!response.ok) {
            throw new Error(`Failed to update watchlist: ${response.statusText}`);
        }

        return response.json();
    },

    async deleteWatchlist(id: string) {
        const response = await fetch(`${API_BASE_URL}/api/v1/settings/watchlists/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Failed to delete watchlist: ${response.statusText}`);
        }

        return response.ok;
    },

    async addSymbolToWatchlist(watchlistId: string, symbol: string) {
        const response = await fetch(
            `${API_BASE_URL}/api/v1/settings/watchlists/${watchlistId}/symbols/${symbol}`,
            {
                method: 'POST'
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to add symbol to watchlist: ${response.statusText}`);
        }

        return response.json();
    },

    async removeSymbolFromWatchlist(watchlistId: string, symbol: string) {
        const response = await fetch(
            `${API_BASE_URL}/api/v1/settings/watchlists/${watchlistId}/symbols/${symbol}`,
            {
                method: 'DELETE'
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to remove symbol from watchlist: ${response.statusText}`);
        }

        return response.ok;
    },

    // === الاستراتيجيات ===
    async getStrategies() {
        const response = await fetch(`${API_BASE_URL}/api/v1/settings/strategies`);

        if (!response.ok) {
            throw new Error(`Failed to fetch strategies: ${response.statusText}`);
        }

        return response.json();
    },

    async getStrategyById(id: string) {
        const response = await fetch(`${API_BASE_URL}/api/v1/settings/strategies/${id}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch strategy: ${response.statusText}`);
        }

        return response.json();
    },

    async createStrategy(strategy: any) {
        const response = await fetch(`${API_BASE_URL}/api/v1/settings/strategies`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(strategy)
        });

        if (!response.ok) {
            throw new Error(`Failed to create strategy: ${response.statusText}`);
        }

        return response.json();
    },

    async updateStrategy(id: string, updates: any) {
        const response = await fetch(`${API_BASE_URL}/api/v1/settings/strategies/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updates)
        });

        if (!response.ok) {
            throw new Error(`Failed to update strategy: ${response.statusText}`);
        }

        return response.json();
    },

    async deleteStrategy(id: string) {
        const response = await fetch(`${API_BASE_URL}/api/v1/settings/strategies/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Failed to delete strategy: ${response.statusText}`);
        }

        return response.ok;
    },

    async duplicateStrategy(id: string) {
        const response = await fetch(`${API_BASE_URL}/api/v1/settings/strategies/${id}/duplicate`, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error(`Failed to duplicate strategy: ${response.statusText}`);
        }

        return response.json();
    },

    // === المؤشرات المخصصة ===
    async getIndicators() {
        const response = await fetch(`${API_BASE_URL}/api/v1/settings/indicators`);

        if (!response.ok) {
            throw new Error(`Failed to fetch indicators: ${response.statusText}`);
        }

        return response.json();
    },

    async getIndicatorById(id: string) {
        const response = await fetch(`${API_BASE_URL}/api/v1/settings/indicators/${id}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch indicator: ${response.statusText}`);
        }

        return response.json();
    },

    async createIndicator(indicator: any) {
        const response = await fetch(`${API_BASE_URL}/api/v1/settings/indicators`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(indicator)
        });

        if (!response.ok) {
            throw new Error(`Failed to create indicator: ${response.statusText}`);
        }

        return response.json();
    },

    async updateIndicator(id: string, updates: any) {
        const response = await fetch(`${API_BASE_URL}/api/v1/settings/indicators/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updates)
        });

        if (!response.ok) {
            throw new Error(`Failed to update indicator: ${response.statusText}`);
        }

        return response.json();
    },

    async deleteIndicator(id: string) {
        const response = await fetch(`${API_BASE_URL}/api/v1/settings/indicators/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Failed to delete indicator: ${response.statusText}`);
        }

        return response.ok;
    },

    async testIndicator(id: string) {
        const response = await fetch(`${API_BASE_URL}/api/v1/settings/indicators/${id}/test`, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error(`Failed to test indicator: ${response.statusText}`);
        }

        return response.json();
    },

    // === الفلاتر ===
    async getFilterPresets() {
        const response = await fetch(`${API_BASE_URL}/api/v1/settings/filters`);

        if (!response.ok) {
            throw new Error(`Failed to fetch filter presets: ${response.statusText}`);
        }

        return response.json();
    },

    async getFilterPresetById(id: string) {
        const response = await fetch(`${API_BASE_URL}/api/v1/settings/filters/${id}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch filter preset: ${response.statusText}`);
        }

        return response.json();
    },

    async createFilterPreset(preset: any) {
        const response = await fetch(`${API_BASE_URL}/api/v1/settings/filters`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(preset)
        });

        if (!response.ok) {
            throw new Error(`Failed to create filter preset: ${response.statusText}`);
        }

        return response.json();
    },

    async updateFilterPreset(id: string, updates: any) {
        const response = await fetch(`${API_BASE_URL}/api/v1/settings/filters/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updates)
        });

        if (!response.ok) {
            throw new Error(`Failed to update filter preset: ${response.statusText}`);
        }

        return response.json();
    },

    async deleteFilterPreset(id: string) {
        const response = await fetch(`${API_BASE_URL}/api/v1/settings/filters/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Failed to delete filter preset: ${response.statusText}`);
        }

        return response.ok;
    },

    async runFilter(id: string) {
        const response = await fetch(`${API_BASE_URL}/api/v1/settings/filters/${id}/run`, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error(`Failed to run filter: ${response.statusText}`);
        }

        return response.json();
    },

    // === المحفظة ===
    async getPortfolio() {
        const response = await fetch(`${API_BASE_URL}/api/v1/settings/portfolios`);

        if (!response.ok) {
            throw new Error(`Failed to fetch portfolio: ${response.statusText}`);
        }

        return response.json();
    },

    async getPortfolioById(id: string) {
        const response = await fetch(`${API_BASE_URL}/api/v1/settings/portfolios/${id}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch portfolio item: ${response.statusText}`);
        }

        return response.json();
    },

    async createPortfolioItem(item: any) {
        const response = await fetch(`${API_BASE_URL}/api/v1/settings/portfolios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(item)
        });

        if (!response.ok) {
            throw new Error(`Failed to create portfolio item: ${response.statusText}`);
        }

        return response.json();
    },

    async updatePortfolioItem(id: string, updates: any) {
        const response = await fetch(`${API_BASE_URL}/api/v1/settings/portfolios/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updates)
        });

        if (!response.ok) {
            throw new Error(`Failed to update portfolio item: ${response.statusText}`);
        }

        return response.json();
    },

    async deletePortfolioItem(id: string) {
        const response = await fetch(`${API_BASE_URL}/api/v1/settings/portfolios/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Failed to delete portfolio item: ${response.statusText}`);
        }

        return response.ok;
    },

    // === مفاتيح API ===
    async getApiKeys() {
        const response = await fetch(`${API_BASE_URL}/api/v1/settings/api-keys`);

        if (!response.ok) {
            throw new Error(`Failed to fetch API keys: ${response.statusText}`);
        }

        return response.json();
    },

    async getApiKeyById(id: string) {
        const response = await fetch(`${API_BASE_URL}/api/v1/settings/api-keys/${id}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch API key: ${response.statusText}`);
        }

        return response.json();
    },

    async createApiKey(apiKey: any) {
        const response = await fetch(`${API_BASE_URL}/api/v1/settings/api-keys`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(apiKey)
        });

        if (!response.ok) {
            throw new Error(`Failed to create API key: ${response.statusText}`);
        }

        return response.json();
    },

    async updateApiKey(id: string, updates: any) {
        const response = await fetch(`${API_BASE_URL}/api/v1/settings/api-keys/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updates)
        });

        if (!response.ok) {
            throw new Error(`Failed to update API key: ${response.statusText}`);
        }

        return response.json();
    },

    async deleteApiKey(id: string) {
        const response = await fetch(`${API_BASE_URL}/api/v1/settings/api-keys/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Failed to delete API key: ${response.statusText}`);
        }

        return response.ok;
    },

    async testApiKey(id: string) {
        const response = await fetch(`${API_BASE_URL}/api/v1/settings/api-keys/${id}/test`, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error(`Failed to test API key: ${response.statusText}`);
        }

        return response.json();
    },

    // === خدمات أخرى مرتبطة بالإعدادات ===

    // === المستخدمين ===
    async getCurrentUser() {
        const response = await fetch(`${API_BASE_URL}/api/v1/users/me`);

        if (!response.ok) {
            throw new Error(`Failed to fetch user info: ${response.statusText}`);
        }

        return response.json();
    },

    async updateCurrentUser(updates: any) {
        const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updates)
        });

        if (!response.ok) {
            throw new Error(`Failed to update user: ${response.statusText}`);
        }

        return response.json();
    },

    async changePassword(passwordData: any) {
        const response = await fetch(`${API_BASE_URL}/api/v1/users/me/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(passwordData)
        });

        if (!response.ok) {
            throw new Error(`Failed to change password: ${response.statusText}`);
        }

        return response.json();
    },

    // === الرموز والأسواق ===
    async getAvailableSymbols() {
        const response = await fetch(`${API_BASE_URL}/api/v1/symbols`);

        if (!response.ok) {
            throw new Error(`Failed to fetch symbols: ${response.statusText}`);
        }

        return response.json();
    },

    async getMarketSymbols() {
        const response = await fetch(`${API_BASE_URL}/api/v1/market/symbols`);

        if (!response.ok) {
            throw new Error(`Failed to fetch market symbols: ${response.statusText}`);
        }

        return response.json();
    },

    async getAvailableMarkets() {
        const response = await fetch(`${API_BASE_URL}/api/v1/filtering/markets`);

        if (!response.ok) {
            throw new Error(`Failed to fetch markets: ${response.statusText}`);
        }

        return response.json();
    },

    // === النظام ===
    async getSystemStatus() {
        const response = await fetch(`${API_BASE_URL}/api/v1/status`);

        if (!response.ok) {
            throw new Error(`Failed to fetch system status: ${response.statusText}`);
        }

        return response.json();
    },

    async getHealthCheck() {
        const response = await fetch(`${API_BASE_URL}/api/v1/health`);

        if (!response.ok) {
            throw new Error(`Failed to fetch health check: ${response.statusText}`);
        }

        return response.json();
    }
};