// Common types used across the application

// Timeframes
export type Timeframe =
    | '1s' | '5s' | '15s' | '30s'
    | '1m' | '3m' | '5m' | '15m' | '30m'
    | '1h' | '2h' | '4h' | '6h' | '8h' | '12h'
    | '1d' | '3d'
    | '1w'
    | '1M';

// Common responses
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    meta?: {
        total?: number;
        page?: number;
        limit?: number;
        pages?: number;
    };
}

export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

// Common filters
export interface DateRangeFilter {
    from?: string;
    to?: string;
}

export interface NumericRangeFilter {
    min?: number;
    max?: number;
}

// Common UI types
export interface SelectOption {
    value: string;
    label: string;
    icon?: React.ReactNode;
    disabled?: boolean;
}

// Common chart types
export interface Coordinate {
    x: number;
    y: number;
}

export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

// Common event types
export interface MouseEventData {
    clientX: number;
    clientY: number;
    offsetX: number;
    offsetY: number;
    target: EventTarget | null;
}