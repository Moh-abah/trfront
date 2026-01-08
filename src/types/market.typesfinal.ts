export type MarketType = 'crypto' | 'stocks'

export interface PriceUpdate {
    symbol: string
    current: number
    change24h: number
    volume24h: number
    marketCap: number
    timestamp: string
}

export interface SymbolInfo {
    symbol: string
    name: string
    category: string
    sector?: string
    industry?: string
}

export interface MarketData {
    symbol: string
    price: number
    change24h: number
    volume24h: number
    marketCap: number
    high24h: number
    low24h: number
    timestamp: string
}

export interface FilterCondition {
    field: 'symbol' | 'price' | 'change24h' | 'volume24h'
    operator: 'equals' | 'contains' | 'greater' | 'less' | 'between'
    value: any
    value2?: any
}

export interface FilterCriteria {
    conditions: FilterCondition[]
    logic: 'AND' | 'OR'
}

export interface FilterPreset {
    id: string
    name: string
    description: string
    market: MarketType
    criteria: FilterCriteria
    isDefault: boolean
}

export interface FilterResult {
    filtered: number
    total: number
    executionTime: number
}

export interface MarketSummary {
    totalMarketCap: number
    totalVolume: number
    gainers: number
    losers: number
    timestamp: string
}
