
// @ts-nocheck

// src/services/api/http/axios.client.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { apiConfig } from '@/config/api.config'
import { cacheService } from '@/services/cache/cache.service'


declare global {
    interface Window {
        showToast?: (options: { type: string; title: string; message: string }) => void;
    }
}

class AxiosClient {
    private client: AxiosInstance
    private isRefreshing = false
    private failedQueue: Array<{
        resolve: (value: any) => void
        reject: (error: any) => void
    }> = []

    constructor() {
        this.client = axios.create({
            baseURL: apiConfig.baseURL,
            timeout: apiConfig.timeout,
            headers: {
                'Content-Type': 'application/json',
            },
        })

        this.setupInterceptors()
    }

    private setupInterceptors() {
        // Request interceptor
        this.client.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                const token = this.getAccessToken()
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`
                }

                // Add request ID for tracing
                config.headers['X-Request-ID'] = this.generateRequestId()

                // Cache control for GET requests
                if (config.method?.toLowerCase() === 'get') {
                    const cacheKey = this.generateCacheKey(config)
                    const cached = cacheService.getMemory(cacheKey)
                    if (cached && !config.headers['Cache-Control']?.includes('no-cache')) {
                        return Promise.reject({
                            isCached: true,
                            data: cached,
                            config
                        })
                    }
                }

                return config
            },
            (error) => {
                return Promise.reject(error)
            }
        )

        // Response interceptor
        this.client.interceptors.response.use(
            (response: AxiosResponse) => {
                // Cache successful GET responses
                if (response.config.method?.toLowerCase() === 'get') {
                    const cacheKey = this.generateCacheKey(response.config)
                    cacheService.setMemory(cacheKey, response.data, 90000) // 1 minute cache
                }

                return response
            },
            async (error) => {
                // Handle cached responses
                if (error.isCached) {
                    return Promise.resolve({
                        data: error.data,
                        status: 200,
                        statusText: 'OK (Cached)',
                        headers: {},
                        config: error.config
                    })
                }

                const originalRequest = error.config

                // Handle 401 Unauthorized (Token Refresh)
                if (error.response?.status === 401 && !originalRequest._retry) {
                    if (this.isRefreshing) {
                        return new Promise((resolve, reject) => {
                            this.failedQueue.push({ resolve, reject })
                        })
                            .then((token) => {
                                originalRequest.headers.Authorization = `Bearer ${token}`
                                return this.client(originalRequest)
                            })
                            .catch((err) => Promise.reject(err))
                    }

                    originalRequest._retry = true
                    this.isRefreshing = true

                    try {
                        const refreshToken = this.getRefreshToken()
                        const response = await axios.post(
                            `${apiConfig.baseURL}/api/v1/users/refresh`,
                            { refresh_token: refreshToken }
                        )

                        const { access_token, refresh_token } = response.data
                        this.setTokens(access_token, refresh_token)

                        originalRequest.headers.Authorization = `Bearer ${access_token}`

                        // Process queued requests
                        this.failedQueue.forEach((prom) => prom.resolve(access_token))
                        this.failedQueue = []

                        return this.client(originalRequest)

                    } catch (refreshError) {
                        this.failedQueue.forEach((prom) => prom.reject(refreshError))
                        this.failedQueue = []
                        this.clearTokens()

                        // ❌ تم إزالة منطق إعادة التوجيه إلى /login

                        return Promise.reject(refreshError)
                    } finally {
                        this.isRefreshing = false
                    }
                }

                // Handle other errors
                if (error.response) {
                    const { status, data } = error.response
                    const errorMessage = data?.message || data?.detail || 'Unknown error'

                    // Use UI store to show toast notifications
                    if (typeof window !== 'undefined' && window.showToast) {
                        window.showToast({
                            type: 'error',
                            title: `Error ${status}`,
                            message: errorMessage
                        })
                    }

                    switch (status) {
                        case 400:
                            console.error('Bad Request:', data)
                            break
                        case 403:
                            console.error('Forbidden:', data)
                            break
                        case 404:
                            console.error('Not Found:', data)
                            break
                        case 429:
                            console.error('Rate Limited:', data)
                            // Implement retry with backoff
                            const retryAfter = error.response.headers['retry-after'] || 1
                            await this.delay(retryAfter * 1000)
                            return this.client(originalRequest)
                        case 500:
                            console.error('Server Error:', data)
                            break
                        default:
                            console.error('API Error:', error.message)
                    }
                } else if (error.request) {
                    // No response received
                    console.error('Network Error:', error.message)
                    if (typeof window !== 'undefined' && window.showToast) {
                        window.showToast({
                            type: 'error',
                            title: 'Network Error',
                            message: 'Unable to connect to server'
                        })
                    }
                }

                return Promise.reject(error)
            }
        )
    }

    private generateRequestId(): string {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    private generateCacheKey(config: AxiosRequestConfig): string {
        const { url, params, data } = config
        const key = {
            url,
            params: JSON.stringify(params),
            data: JSON.stringify(data)
        }
        return JSON.stringify(key)
    }

    private async handleWebSocketUpgrade(response: AxiosResponse): Promise<AxiosResponse> {
        // Handle websocket connection
        return response
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    private getAccessToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('access_token')
        }
        return null
    }

    private getRefreshToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('refresh_token')
        }
        return null
    }

    private setTokens(accessToken: string, refreshToken: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', accessToken)
            localStorage.setItem('refresh_token', refreshToken)
        }
    }

    private clearTokens(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
        }
    }

    // Helper to replace URL parameters
    private buildUrl(url: string, params: Record<string, string | number> = {}): string {
        let result = url
        Object.entries(params).forEach(([key, value]) => {
            result = result.replace(`{${key}}`, encodeURIComponent(value.toString()))
        })
        return result
    }

    // Public methods
    public get<T = any>(
        url: string,
        config?: AxiosRequestConfig & { urlParams?: Record<string, string | number> }
    ): Promise<T> {
        const builtUrl = this.buildUrl(url, config?.urlParams)
        const { urlParams, ...restConfig } = config || {}
        return this.client.get(builtUrl, restConfig).then((response) => response.data)
    }

    public post<T = any>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig & { urlParams?: Record<string, string | number> }
    ): Promise<T> {
        const builtUrl = this.buildUrl(url, config?.urlParams)
        const { urlParams, ...restConfig } = config || {}
        return this.client.post(builtUrl, data, restConfig).then((response) => response.data)
    }

    public put<T = any>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig & { urlParams?: Record<string, string | number> }
    ): Promise<T> {
        const builtUrl = this.buildUrl(url, config?.urlParams)
        const { urlParams, ...restConfig } = config || {}
        return this.client.put(builtUrl, data, restConfig).then((response) => response.data)
    }

    public delete<T = any>(
        url: string,
        config?: AxiosRequestConfig & { urlParams?: Record<string, string | number> }
    ): Promise<T> {
        const builtUrl = this.buildUrl(url, config?.urlParams)
        const { urlParams, ...restConfig } = config || {}
        return this.client.delete(builtUrl, restConfig).then((response) => response.data)
    }

    public patch<T = any>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig & { urlParams?: Record<string, string | number> }
    ): Promise<T> {
        const builtUrl = this.buildUrl(url, config?.urlParams)
        const { urlParams, ...restConfig } = config || {}
        return this.client.patch(builtUrl, data, restConfig).then((response) => response.data)
    }

    // File upload helper
    public upload<T = any>(
        url: string,
        file: File,
        config?: AxiosRequestConfig & { urlParams?: Record<string, string | number> }
    ): Promise<T> {
        const builtUrl = this.buildUrl(url, config?.urlParams)
        const formData = new FormData()
        formData.append('file', file)

        const { urlParams, ...restConfig } = config || {}

        return this.client.post(builtUrl, formData, {
            ...restConfig,
            headers: {
                'Content-Type': 'multipart/form-data',
                ...restConfig?.headers,
            },
        }).then((response) => response.data)
    }

    // Cache helpers
    public clearCache(): void {
        cacheService.clearMemory()
    }

    public clearCacheForKey(key: string): void {
        // Implementation for specific key cache clearance
        cacheService.removeMemory(key)
    }

    // WebSocket helpers
    public async startWebSocketStream(config: {
        type: string;
        symbols: string[];
        timeframe?: string;
        indicators?: any[];
        strategy?: any;
    }): Promise<{ stream_id: string; url: string }> {
        // return this.post(apiConfig.endpoints.websocket.start, config);
        return this.post('/ws/stream/start', config);
    }

    public async stopWebSocketStream(streamId: string): Promise<void> {
        return this.post(apiConfig.endpoints.websocket.stop, {}, {
            urlParams: { stream_id: streamId }
        });
    }

    public async getActiveStreams(): Promise<any[]> {
        return this.get(apiConfig.endpoints.websocket.active);
    }

    // Real-time price helpers
    public async getLivePrice(market: string, symbol: string): Promise<any> {
        return this.get(apiConfig.endpoints.market.price, {
            urlParams: { market, symbol }
        });
    }

    public async getHistoricalData(market: string, symbol: string, timeframe: string, days: number): Promise<any> {
        return this.get(apiConfig.endpoints.market.historical, {
            urlParams: { market, symbol },
            params: { timeframe, days }
        });
    }

    



}

export const axiosClient = new AxiosClient()