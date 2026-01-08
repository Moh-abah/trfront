
// @ts-nocheck
// src/services/cache/cache.service.ts
class CacheService {
    private memoryCache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map()
    private defaultTTL = 5 * 60 * 1000 // 5 minutes
    private maxMemorySize = 100 // Max items in memory cache

    constructor() {
        // Cleanup expired cache every minute
        setInterval(() => this.cleanup(), 60000)
    }

    // Memory Cache
    setMemory(key: string, data: any, ttl?: number): void {
        // If cache is full, remove oldest item
        if (this.memoryCache.size >= this.maxMemorySize) {
            const oldestKey = this.memoryCache.keys().next().value
            this.memoryCache.delete(oldestKey)
        }

        this.memoryCache.set(key, {
            data,
            timestamp: Date.now(),
            ttl: ttl || this.defaultTTL,
        })
    }

    getMemory<T = any>(key: string): T | null {
        const item = this.memoryCache.get(key)
        if (!item) return null

        if (Date.now() > item.timestamp + item.ttl) {
            this.memoryCache.delete(key)
            return null
        }

        return item.data
    }

    deleteMemory(key: string): void {
        this.memoryCache.delete(key)
    }

    clearMemory(): void {
        this.memoryCache.clear()
    }

    // Local Storage Cache
    setLocal(key: string, data: any, ttl?: number): void {
        try {
            if (typeof window !== 'undefined') {
                localStorage.setItem(key, JSON.stringify({
                    data,
                    timestamp: Date.now(),
                    ttl: ttl || this.defaultTTL,
                }))
            }
        } catch (error) {
            console.error('Error saving to localStorage:', error)
            this.handleStorageError(error)
        }
    }

    getLocal<T = any>(key: string): T | null {
        try {
            if (typeof window !== 'undefined') {
                const item = localStorage.getItem(key)
                if (!item) return null

                const parsed = JSON.parse(item)

                if (Date.now() > parsed.timestamp + parsed.ttl) {
                    localStorage.removeItem(key)
                    return null
                }

                return parsed.data
            }
            return null
        } catch (error) {
            console.error('Error reading from localStorage:', error)
            return null
        }
    }

    deleteLocal(key: string): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(key)
        }
    }

    clearLocal(): void {
        if (typeof window !== 'undefined') {
            localStorage.clear()
        }
    }

    // Session Storage Cache
    setSession(key: string, data: any, ttl?: number): void {
        try {
            if (typeof window !== 'undefined') {
                sessionStorage.setItem(key, JSON.stringify({
                    data,
                    timestamp: Date.now(),
                    ttl: ttl || this.defaultTTL,
                }))
            }
        } catch (error) {
            console.error('Error saving to sessionStorage:', error)
            this.handleStorageError(error)
        }
    }

    getSession<T = any>(key: string): T | null {
        try {
            if (typeof window !== 'undefined') {
                const item = sessionStorage.getItem(key)
                if (!item) return null

                const parsed = JSON.parse(item)

                if (Date.now() > parsed.timestamp + parsed.ttl) {
                    sessionStorage.removeItem(key)
                    return null
                }

                return parsed.data
            }
            return null
        } catch (error) {
            console.error('Error reading from sessionStorage:', error)
            return null
        }
    }

    deleteSession(key: string): void {
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem(key)
        }
    }

    clearSession(): void {
        if (typeof window !== 'undefined') {
            sessionStorage.clear()
        }
    }

    // IndexedDB Cache (for larger datasets)
    async setIndexedDB(storeName: string, key: string, data: any): Promise<void> {
        if (typeof window !== 'undefined' && window.indexedDB) {
            // Implement IndexedDB logic here
            console.log('IndexedDB not implemented yet')
        }
    }

    async getIndexedDB<T = any>(storeName: string, key: string): Promise<T | null> {
        if (typeof window !== 'undefined' && window.indexedDB) {
            // Implement IndexedDB logic here
            console.log('IndexedDB not implemented yet')
            return null
        }
        return null
    }

    // Cache statistics
    getStats(): {
        memorySize: number
        memoryHits: number
        memoryMisses: number
    } {
        return {
            memorySize: this.memoryCache.size,
            memoryHits: 0, // You can implement hit tracking if needed
            memoryMisses: 0,
        }
    }

    // Cache patterns
    async getOrSet<T = any>(
        key: string,
        fetchFn: () => Promise<T>,
        options?: {
            ttl?: number
            storage?: 'memory' | 'local' | 'session'
        }
    ): Promise<T> {
        const storage = options?.storage || 'memory'
        const ttl = options?.ttl

        // Try to get from cache
        let cached: T | null = null
        switch (storage) {
            case 'memory':
                cached = this.getMemory(key)
                break
            case 'local':
                cached = this.getLocal(key)
                break
            case 'session':
                cached = this.getSession(key)
                break
        }

        if (cached) {
            return cached
        }

        // Fetch fresh data
        const freshData = await fetchFn()

        // Store in cache
        switch (storage) {
            case 'memory':
                this.setMemory(key, freshData, ttl)
                break
            case 'local':
                this.setLocal(key, freshData, ttl)
                break
            case 'session':
                this.setSession(key, freshData, ttl)
                break
        }

        return freshData
    }

    // Cleanup expired items
    private cleanup(): void {
        // Clean memory cache
        for (const [key, item] of this.memoryCache.entries()) {
            if (Date.now() > item.timestamp + item.ttl) {
                this.memoryCache.delete(key)
            }
        }

        // Clean localStorage
        if (typeof window !== 'undefined') {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                if (key) {
                    try {
                        const item = localStorage.getItem(key)
                        if (item) {
                            const parsed = JSON.parse(item)
                            if (Date.now() > parsed.timestamp + parsed.ttl) {
                                localStorage.removeItem(key)
                            }
                        }
                    } catch {
                        // Invalid JSON, remove it
                        localStorage.removeItem(key)
                    }
                }
            }
        }

        // Clean sessionStorage
        if (typeof window !== 'undefined') {
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i)
                if (key) {
                    try {
                        const item = sessionStorage.getItem(key)
                        if (item) {
                            const parsed = JSON.parse(item)
                            if (Date.now() > parsed.timestamp + parsed.ttl) {
                                sessionStorage.removeItem(key)
                            }
                        }
                    } catch {
                        // Invalid JSON, remove it
                        sessionStorage.removeItem(key)
                    }
                }
            }
        }
    }

    private handleStorageError(error: any): void {
        // Handle quota exceeded errors
        if (error.name === 'QuotaExceededError') {
            console.warn('Storage quota exceeded, clearing old cache')
            this.clearLocal()
        }
    }
}

export const cacheService = new CacheService()