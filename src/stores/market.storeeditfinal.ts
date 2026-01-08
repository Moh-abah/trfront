import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

import type {
    MarketType,
    PriceUpdate,
    SymbolInfo,
    MarketData,
    FilterCriteria,
    FilterPreset,
    FilterResult,
    MarketSummary
} from '@/types/market.typesfinal'

interface MarketState {
    // Data
    symbols: string[]
    prices: Record<string, MarketData>
    filteredSymbols: string[]
    marketSummary: MarketSummary | null
    filterPresets: FilterPreset[]
    filterCriteria: FilterCriteria | null
    filterResult: FilterResult | null

    // UI State
    isLoading: boolean
    isFiltering: boolean
    error: string | null

    // Actions
    loadMarketData: (market: MarketType) => Promise<void>
    updatePrices: (updates: PriceUpdate[]) => void
    applyFilter: (market: MarketType, criteria: FilterCriteria) => void
    clearFilters: () => void
    quickFilter: (market: MarketType, filterType: string) => void
    loadFilterPresets: () => Promise<void>
    saveFilterPreset: (preset: Omit<FilterPreset, 'id'>) => Promise<void>
    setError: (error: string | null) => void
}

export const useMarketStore = create<MarketState>()(
    devtools(
        persist(
            (set, get) => ({
                // Initial state
                symbols: [],
                prices: {},
                filteredSymbols: [],
                marketSummary: null,
                filterPresets: [],
                filterCriteria: null,
                filterResult: null,
                isLoading: false,
                isFiltering: false,
                error: null,

                // Load market data
                loadMarketData: async (market: MarketType) => {
                    set({ isLoading: true, error: null })

                    try {
                        // Fetch symbols and initial prices
                        const endpoint = market === 'crypto'
                            ? '/api/v1/market/symbols/crypto'
                            : '/api/v1/stocks/symbols'

                        const response = await fetch(endpoint)

                        if (!response.ok) {
                            throw new Error(`Failed to load ${market} symbols`)
                        }

                        const data = await response.json()

                        set({
                            symbols: data.symbols || [],
                            filteredSymbols: data.symbols || [],
                            isLoading: false,
                        })

                        console.log(`✅ Loaded ${data.symbols?.length || 0} ${market} symbols`)
                    } catch (error) {
                        console.error('❌ Error loading market data:', error)
                        set({
                            error: error instanceof Error ? error.message : 'Failed to load market data',
                            isLoading: false,
                        })
                    }
                },

                // Update prices from WebSocket
                updatePrices: (updates: PriceUpdate[]) => {
                    const state = get()
                    const newPrices = { ...state.prices }

                    updates.forEach((update) => {
                        newPrices[update.symbol] = {
                            symbol: update.symbol,
                            price: update.current,
                            change24h: update.change24h,
                            volume24h: update.volume24h,
                            marketCap: update.marketCap,
                            high24h: newPrices[update.symbol]?.high24h || update.current,
                            low24h: newPrices[update.symbol]?.low24h || update.current,
                            timestamp: update.timestamp,
                        }
                    })

                    set({ prices: newPrices })
                },

                // Apply filter
                applyFilter: (market: MarketType, criteria: FilterCriteria) => {
                    const state = get()
                    set({ isFiltering: true })

                    const startTime = performance.now()

                    try {
                        let filtered = [...state.symbols]

                        if (criteria.conditions.length > 0) {
                            filtered = state.symbols.filter((symbol) => {
                                const priceData = state.prices[symbol]

                                if (!priceData) {
                                    return false
                                }

                                const results = criteria.conditions.map((condition) => {
                                    const { field, operator, value, value2 } = condition

                                    switch (field) {
                                        case 'symbol':
                                            if (operator === 'contains') {
                                                return symbol.toLowerCase().includes(value.toLowerCase())
                                            }
                                            if (operator === 'equals') {
                                                return symbol.toLowerCase() === value.toLowerCase()
                                            }
                                            return false

                                        case 'price':
                                            if (operator === 'greater') {
                                                return priceData.price > value
                                            }
                                            if (operator === 'less') {
                                                return priceData.price < value
                                            }
                                            if (operator === 'between') {
                                                return priceData.price >= value && priceData.price <= value2
                                            }
                                            return false

                                        case 'change24h':
                                            if (operator === 'greater') {
                                                return priceData.change24h > value
                                            }
                                            if (operator === 'less') {
                                                return priceData.change24h < value
                                            }
                                            if (operator === 'between') {
                                                return priceData.change24h >= value && priceData.change24h <= value2
                                            }
                                            return false

                                        case 'volume24h':
                                            if (operator === 'greater') {
                                                return priceData.volume24h > value
                                            }
                                            if (operator === 'less') {
                                                return priceData.volume24h < value
                                            }
                                            return false

                                        default:
                                            return true
                                    }
                                })

                                return criteria.logic === 'AND'
                                    ? results.every((r) => r)
                                    : results.some((r) => r)
                            })
                        }

                        const executionTime = performance.now() - startTime

                        set({
                            filteredSymbols: filtered,
                            filterCriteria: criteria,
                            filterResult: {
                                filtered: filtered.length,
                                total: state.symbols.length,
                                executionTime,
                            },
                            isFiltering: false,
                        })
                    } catch (error) {
                        console.error('❌ Error applying filter:', error)
                        set({
                            error: error instanceof Error ? error.message : 'Failed to apply filter',
                            isFiltering: false,
                        })
                    }
                },

                // Clear filters
                clearFilters: () => {
                    const state = get()
                    set({
                        filterCriteria: null,
                        filterResult: null,
                        filteredSymbols: state.symbols,
                    })
                },

                // Quick filter
                quickFilter: (market: MarketType, filterType: string) => {
                    const criteria: FilterCriteria = {
                        conditions: [],
                        logic: 'AND',
                    }

                    switch (filterType) {
                        case 'gainers':
                            criteria.conditions.push({
                                field: 'change24h',
                                operator: 'greater',
                                value: 0,
                            })
                            break
                        case 'losers':
                            criteria.conditions.push({
                                field: 'change24h',
                                operator: 'less',
                                value: 0,
                            })
                            break
                        case 'high-volume':
                            criteria.conditions.push({
                                field: 'volume24h',
                                operator: 'greater',
                                value: 1000000,
                            })
                            break
                        case 'price-under-1':
                            criteria.conditions.push({
                                field: 'price',
                                operator: 'less',
                                value: 1,
                            })
                            break
                        case 'price-1-10':
                            criteria.conditions.push({
                                field: 'price',
                                operator: 'between',
                                value: 1,
                                value2: 10,
                            })
                            break
                        case 'price-over-10':
                            criteria.conditions.push({
                                field: 'price',
                                operator: 'greater',
                                value: 10,
                            })
                            break
                    }

                    get().applyFilter(market, criteria)
                },

                // Load filter presets
                loadFilterPresets: async () => {
                    try {
                        // For now, use empty array - can be loaded from API later
                        set({ filterPresets: [] })
                    } catch (error) {
                        console.error('❌ Error loading filter presets:', error)
                    }
                },

                // Save filter preset
                saveFilterPreset: async (preset: Omit<FilterPreset, 'id'>) => {
                    const state = get()
                    const newPreset: FilterPreset = {
                        ...preset,
                        id: `preset_${Date.now()}`,
                    }

                    set({ filterPresets: [...state.filterPresets, newPreset] })
                },

                // Set error
                setError: (error: string | null) => {
                    set({ error })
                },
            }),
            {
                name: 'market-storage',
                partialize: (state) => ({
                    filterPresets: state.filterPresets,
                }),
            }
        )
    )
)
