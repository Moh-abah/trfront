
// @ts-nocheck
// src/config/api.config.ts
export const apiConfig = {
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://62.169.17.101:8017',
    timeout: 30000,
    endpoints: {
        // Core endpoints
        core: {
            symbols: '/api/v1/symbols',
            status: '/api/v1/status',
            health: '/api/v1/health',
            version: '/api/v1/version',
        },

        indicator: {
            apply: '/api/v1/indicators/apply',                // POST
            available: '/api/v1/indicators/available',        // GET
            signals: '/api/v1/indicators/signals',            // POST
            params: (indicator_name: string) => `/api/v1/indicators/${indicator_name}/params`, // GET
            transpile: '/api/v1/indicators/pine/transpile',   // POST
            // fallback/compat names (if backend uses different paths)
            calculate: '/api/v1/indicators/apply',            // use apply as generic calculate
            templates: '/api/v1/indicators/templates',        // optional
            custom: '/api/v1/settings/indicators',            // custom indicators CRUD
            combinations: '/api/v1/indicators/combinations',  // optional
            optimize: '/api/v1/indicators/optimize',          // optional
            performance: '/api/v1/indicators/performance',    // optional
            divergence: '/api/v1/indicators/divergence',      // optional
            export: '/api/v1/indicators/export',              // optional
            import: '/api/v1/indicators/import',              // optional
            categories: '/api/v1/indicators/categories',      // optional
        },

        // Market data endpoints - متوافق مع الباك إند
        market: {
            // الأسهم (stocks)
            stocks: {
                symbols: '/api/v1/stocks/symbols',
                chart: '/api/v1/stocks/chart/{symbol}',
                analysis: '/api/v1/stocks/analysis/{symbol}',
                company: '/api/v1/stocks/company/{symbol}',
                summary: '/api/v1/stocks/market/summary',
                topMovers: '/api/v1/stocks/market/top-movers',
                search: '/api/v1/stocks/search',
                sectors: '/api/v1/stocks/sectors',
            },
            // العملات الرقمية (crypto)
            crypto: {
                symbols: '/api/v1/symbols',
                price: '/api/v1/crypto/price/{symbol}',
                historical: '/api/v1/crypto/historical/{symbol}',
                orderbook: '/api/v1/crypto/orderbook/{symbol}',
                trades: '/api/v1/crypto/trades/{symbol}',
            },
            // Unified market endpoints (المتوافقة مع الباك إند)
            unified: {
                symbols: '/api/v1/market/symbols',
                price: '/api/v1/market/price/{market}/{symbol}',
                historical: '/api/v1/market/historical/{market}/{symbol}',
                // summary: '/api/v1/market/summary',
                summary: '/api/v1/stocks/stocks/market/summary',
                stream: '/api/v1/market/stream/{market}/{symbol}',
            }
        },

        // Backtest endpoints - متوافق مع الباك إند
        backtest: {
            run: '/api/v1/backtest/run',
            walkForward: '/api/v1/backtest/walk-forward',
            monteCarlo: '/api/v1/backtest/monte-carlo',
            results: '/api/v1/backtest/results/{backtest_id}',
            compare: '/api/v1/backtest/compare',
            report: '/api/v1/backtest/report/{backtest_id}',
            availableMetrics: '/api/v1/backtest/available-metrics',
            strategies: '/api/v1/backtest/strategies',
            parameters: '/api/v1/backtest/parameters/{strategy_id}',
        },

        // Indicators endpoints - متوافق مع الباك إند
        indicators: {
            apply: '/api/v1/indicators/apply',
            available: '/api/v1/indicators/available',
            transpile: '/api/v1/indicators/pine/transpile',
            signals: '/api/v1/indicators/signals',
            params: '/api/v1/indicators/{indicator_name}/params',
            calculate: '/api/v1/indicators/calculate',
            validate: '/api/v1/indicators/validate',
            templates: '/api/v1/indicators/templates',
            custom: '/api/v1/indicators/custom',
        },

        // Strategies endpoints - متوافق مع الباك إند
        strategies: {
            run: '/api/v1/strategies/run',
            validate: '/api/v1/strategies/validate',
            save: '/api/v1/strategies/save',
            upload: '/api/v1/strategies/upload',
            list: '/api/v1/strategies/list',
            update: '/api/v1/strategies/update/{strategy_id}',
            reload: '/api/v1/strategies/reload/{strategy_id}',
            examples: '/api/v1/strategies/examples/{example_name}',
            template: '/api/v1/strategies/template/{template_id}',
            backtest: '/api/v1/strategies/backtest/{strategy_id}',
            signals: '/api/v1/strategies/signals/{strategy_id}',
        },

        // WebSocket endpoints - متوافق مع الباك إند
        websocket: {
            base: 'ws://62.169.17.101:8017/ws',
            stream: '/ws/stream/{symbol}/{timeframe}',
            multi: '/ws/stream/multi',
            active: '/ws/stream/active',
            start: '/ws/stream/start',
            stop: '/ws/stream/stop/{stream_id}',
            status: '/ws/stream/status/{stream_id}',
            subscribe: '/ws/stream/subscribe',
            unsubscribe: '/ws/stream/unsubscribe',
        },

        // Filtering endpoints - متوافق مع الباك إند
        filtering: {
            symbols: '/api/v1/filtering/symbols',
            markets: '/api/v1/filtering/markets',
            criteriaExamples: '/api/v1/filtering/criteria/examples',
            stats: '/api/v1/filtering/stats',
            bulk: '/api/v1/filtering/bulk',
            scan: '/api/v1/filtering/scan',
            results: '/api/v1/filtering/results/{scan_id}',
            presets: '/api/v1/filtering/criteria/examples',
            validate: '/api/v1/filtering/validate',
        },

        // Users endpoints
        users: {
            register: '/api/v1/users/register',
            login: '/api/v1/users/login',
            refresh: '/api/v1/users/refresh',
            me: '/api/v1/users/me',
            updateMe: '/api/v1/users/me',
            deleteMe: '/api/v1/users/me',
            changePassword: '/api/v1/users/me/change-password',
            verifyEmail: '/api/v1/users/verify-email/{token}',
            requestPasswordReset: '/api/v1/users/request-password-reset',
            resetPassword: '/api/v1/users/reset-password',
            getAllUsers: '/api/v1/users/',
            getUserById: '/api/v1/users/{user_id}',
            updateUserById: '/api/v1/users/{user_id}',
            deleteUserById: '/api/v1/users/{user_id}',
            profile: '/api/v1/users/profile',
            settings: '/api/v1/users/settings',
            notifications: '/api/v1/users/notifications',
            activity: '/api/v1/users/activity',
        },

        // Settings endpoints - متوافق مع الباك إند
        settings: {
            strategies: {
                create: '/api/v1/settings/strategies',
                getAll: '/api/v1/settings/strategies',
                getById: '/api/v1/settings/strategies/{strategy_id}',
                update: '/api/v1/settings/strategies/{strategy_id}',
                delete: '/api/v1/settings/strategies/{strategy_id}',
                duplicate: '/api/v1/settings/strategies/{strategy_id}/duplicate',
                export: '/api/v1/settings/strategies/{strategy_id}/export',
                import: '/api/v1/settings/strategies/import',
            },
            indicators: {
                create: '/api/v1/settings/indicators',
                getAll: '/api/v1/settings/indicators',
                getById: '/api/v1/settings/indicators/{indicator_id}',
                update: '/api/v1/settings/indicators/{indicator_id}',
                delete: '/api/v1/settings/indicators/{indicator_id}',
                test: '/api/v1/settings/indicators/{indicator_id}/test',
                duplicate: '/api/v1/settings/indicators/{indicator_id}/duplicate',
            },
            watchlists: {
                create: '/api/v1/settings/watchlists',
                getAll: '/api/v1/settings/watchlists',
                getById: '/api/v1/settings/watchlists/{watchlist_id}',
                update: '/api/v1/settings/watchlists/{watchlist_id}',
                delete: '/api/v1/settings/watchlists/{watchlist_id}',
                addSymbol: '/api/v1/settings/watchlists/{watchlist_id}/symbols/{symbol}',
                removeSymbol: '/api/v1/settings/watchlists/{watchlist_id}/symbols/{symbol}',
                reorder: '/api/v1/settings/watchlists/{watchlist_id}/reorder',
                duplicate: '/api/v1/settings/watchlists/{watchlist_id}/duplicate',
            },
            filters: {
                create: '/api/v1/settings/filters',
                getAll: '/api/v1/settings/filters',
                getById: '/api/v1/settings/filters/{filter_id}',
                update: '/api/v1/settings/filters/{filter_id}',
                delete: '/api/v1/settings/filters/{filter_id}',
                run: '/api/v1/settings/filters/{filter_id}/run',
                duplicate: '/api/v1/settings/filters/{filter_id}/duplicate',
            },
            portfolios: {
                create: '/api/v1/settings/portfolios',
                getAll: '/api/v1/settings/portfolios',
                getById: '/api/v1/settings/portfolios/{portfolio_id}',
                update: '/api/v1/settings/portfolios/{portfolio_id}',
                delete: '/api/v1/settings/portfolios/{portfolio_id}',
                performance: '/api/v1/settings/portfolios/{portfolio_id}/performance',
                holdings: '/api/v1/settings/portfolios/{portfolio_id}/holdings',
                transactions: '/api/v1/settings/portfolios/{portfolio_id}/transactions',
            },
            apiKeys: {
                create: '/api/v1/settings/api-keys',
                getAll: '/api/v1/settings/api-keys',
                getById: '/api/v1/settings/api-keys/{api_key_id}',
                update: '/api/v1/settings/api-keys/{api_key_id}',
                delete: '/api/v1/settings/api-keys/{api_key_id}',
                test: '/api/v1/settings/api-keys/{api_key_id}/test',
                rotate: '/api/v1/settings/api-keys/{api_key_id}/rotate',
            },
            alerts: {
                create: '/api/v1/settings/alerts',
                getAll: '/api/v1/settings/alerts',
                getById: '/api/v1/settings/alerts/{alert_id}',
                update: '/api/v1/settings/alerts/{alert_id}',
                delete: '/api/v1/settings/alerts/{alert_id}',
                test: '/api/v1/settings/alerts/{alert_id}/test',
                trigger: '/api/v1/settings/alerts/{alert_id}/trigger',
            },
        },

        // Default endpoints
        default: {
            root: '/',
            health: '/health',
            debugRoutes: '/debug/routes',
            docs: '/docs',
            redoc: '/redoc',
            openapi: '/openapi.json',
        },
    },

    // WebSocket configuration
    websocket: {
        reconnectInterval: 1000,
        maxReconnectAttempts: 5,
        heartbeatInterval: 30000,
        timeout: 5000,
    },

    // Cache configuration
    cache: {
        defaultTTL: 60000, // 1 minute
        maxSize: 100,
        strategy: 'lru' as 'lru' | 'fifo' | 'lfu',
    },

    // Retry configuration
    retry: {
        maxAttempts: 3,
        delay: 1000,
        backoff: true,
        statusCodes: [408, 429, 500, 502, 503, 504],
    },

    // Request/response logging
    logging: {
        enabled: process.env.NODE_ENV === 'development',
        level: 'debug' as 'debug' | 'info' | 'warn' | 'error',
    },
};

// Helper function to get WebSocket URL
export const getWebSocketUrl = (
    symbol: string,
    timeframe: string,
    market: string = 'crypto',
    indicators?: any[],
    strategy?: any
): string => {
    const baseUrl = apiConfig.websocket.base.replace('http://', 'ws://').replace('https://', 'wss://')
    let url = `${baseUrl}/stream/${symbol}/${timeframe}?market=${market}`

    if (indicators && indicators.length > 0) {
        url += `&indicators=${encodeURIComponent(JSON.stringify(indicators))}`
    }

    if (strategy) {
        url += `&strategy=${encodeURIComponent(JSON.stringify(strategy))}`
    }

    return url
}

// Helper to build API URL with parameters
export const buildApiUrl = (
    endpoint: string,
    params: Record<string, string | number> = {}
): string => {
    let url = endpoint
    Object.entries(params).forEach(([key, value]) => {
        url = url.replace(`{${key}}`, encodeURIComponent(value.toString()))
    })
    return url
}

// Helper to get endpoint by path
export const getEndpoint = (path: string, params?: Record<string, string | number>): string => {
    const parts = path.split('.')
    let current: any = apiConfig.endpoints

    for (const part of parts) {
        if (current[part] === undefined) {
            throw new Error(`Endpoint not found: ${path}`)
        }
        current = current[part]
    }

    if (typeof current !== 'string') {
        throw new Error(`Invalid endpoint: ${path}`)
    }

    if (params) {
        return buildApiUrl(current, params)
    }

    return current
}

// Type for API endpoints
export type ApiEndpoint = keyof typeof apiConfig.endpoints