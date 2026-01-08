export interface ActiveIndicator {
    id: string;
    name: string;
    seriesType: 'line' | 'histogram' | 'area';
    color: string;
    lineWidth?: number;
    visible: boolean;
    parameters: Record<string, any>;
    data?: any[];
    series?: any;
    error?: string;
}

export interface IndicatorCalculation {
    indicator: ActiveIndicator;
    data: any[];
    timestamp: string;
}

export interface IndicatorTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    parameters: Array<{
        name: string;
        type: string;
        defaultValue: any;
        min?: number;
        max?: number;
        step?: number;
        options?: any[];
    }>;
    seriesType: 'line' | 'histogram' | 'area';
    defaultColor: string;
    defaultLineWidth: number;
}