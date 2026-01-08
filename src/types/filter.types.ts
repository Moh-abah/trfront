

// @ts-nocheck

export type MarketType = 'crypto' | 'stocks' | 'all';

export interface FilterCondition {
    field: string;
    operator:
    | 'equals' | 'not_equals'
    | 'greater_than' | 'less_than'
    | 'greater_than_or_equal' | 'less_than_or_equal'
    | 'contains' | 'not_contains'
    | 'starts_with' | 'ends_with'
    | 'between' | 'not_between'
    | 'is_null' | 'is_not_null';
    value: any;
    value2?: any; // للعمليات مثل between
}

// أنواع البيانات الرئيسية
export interface MarketSymbol {
    symbol: string;
    name?: string;
    market: MarketType;
    type?: string;
    category?: string;
}

export interface PriceUpdate {
    symbol: string;
    price: number;      // لازم يكون موجود
    change24h: number;
    volume24h: number;
    timestamp: string;
}

export interface FilterCriteria {
    conditions: FilterCondition[];
    logic: 'AND' | 'OR';
}

export interface FilterCondition {
    field: string;
    operator: string;
    value: any;
}

export interface FilterResult {
    symbols: string[];
    total: number;
    filtered: number;
    executionTime: number;
    metadata?: Record<string, any>;
}

export interface FilterPreset {
    id: string;
    name: string;
    description?: string;
    criteria: FilterCriteria;
    market: MarketType;
    createdAt: string;
    updatedAt: string;
    tags?: string[];
    isPublic?: boolean;
    authorId?: string;
}



export interface FilterGroup {
    operator: 'AND' | 'OR';
    conditions: Array<FilterCondition | FilterGroup>;
}

export interface FilterCriteria {
    conditions: FilterCondition[];
    logic: 'AND' | 'OR';
    groups?: FilterGroup[];
}

export interface FilterResult {
    symbols: string[];
    total: number;
    filtered: number;
    executionTime: number;
    metadata?: Record<string, any>;
}

export interface FilterPreset {
    id: string;
    name: string;
    description?: string;
    criteria: FilterCriteria;
    market: MarketType;
    createdAt: string;
    updatedAt: string;
    tags?: string[];
    isPublic?: boolean;
    authorId?: string;
    isDefault?: boolean;
}

export interface PriceUpdate {
    symbol: string;
    price: number;
    change24h: number;
    volume24h: number;
    marketCap?: number;
    timestamp: string;
    high24h?: number;
    low24h?: number;
}

export interface BulkFilterRequest {
    symbols: string[];
    criteria: FilterCriteria;
    market: MarketType;
}

export interface FilterField {
    name: string;
    label: string;
    type: 'number' | 'string' | 'boolean' | 'date' | 'select';
    options?: { value: any; label: string }[];
    min?: number;
    max?: number;
    step?: number;
    defaultValue?: any;
}

// إضافة واجهة التحويل بين FilterCriteria و FilterGroup
export const convertFilterCriteriaToGroup = (criteria: FilterCriteria): FilterGroup => {
    const conditions: Array<FilterCondition | FilterGroup> = [
        ...criteria.conditions,
        ...(criteria.groups || [])
    ];

    return {
        operator: criteria.logic,
        conditions
    };
};

export const convertFilterGroupToCriteria = (group: FilterGroup): FilterCriteria => {
    const conditions: FilterCondition[] = [];
    const groups: FilterGroup[] = [];

    group.conditions.forEach(item => {
        if ('conditions' in item) {
            // إنه FilterGroup
            groups.push(item);
        } else {
            // إنه FilterCondition
            conditions.push(item);
        }
    });

    return {
        conditions,
        logic: group.operator,
        groups: groups.length > 0 ? groups : undefined
    };
};