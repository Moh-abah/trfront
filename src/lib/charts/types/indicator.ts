// أنواع المؤشرات والواجهات
export interface IndicatorParameter {
    name: string;
    label: string;
    type: 'number' | 'text' | 'select' | 'color' | 'boolean' | 'range';
    defaultValue: any;
    min?: number;
    max?: number;
    step?: number;
    options?: { label: string; value: any }[];
    description?: string;
}

export interface Indicator {
    id: string;
    name: string;
    displayName: string;
    description: string;
    category: string;
    parameters: IndicatorParameter[];
    seriesType: 'line' | 'histogram' | 'area' | 'band';
    defaultColor: string;
    defaultParameters: Record<string, any>;
    requiresVolume?: boolean;
    requiresOHLC?: boolean;
    outputCount: number;
    overlay: boolean; // إذا كان المؤشر يُرسم على نفس لوحة السعر
}

export interface ActiveIndicator {
    id: string;
    indicatorId: string;
    name: string;
    parameters: Record<string, any>;
    color: string;
    visible: boolean;
    data?: any[];
    series?: any; // reference to the chart series
    loading?: boolean;
    error?: string;
    isTemp?: boolean;
   
}

export interface IndicatorPreview {
    id: string;
    name: string;
    category: string;
    description: string;
    icon: string;
    parameters: IndicatorParameter[];
}

export interface IndicatorConfig {
    indicatorId: string;
    parameters: Record<string, any>;
    position?: 'main' | 'pane_1' | 'pane_2' | 'pane_3';
    color?: string;
    lineWidth?: number;
    lineStyle?: 'solid' | 'dashed' | 'dotted';
}

export interface IndicatorLibrary {
    indicators: Indicator[];
    categories: Array<{
        id: string;
        name: string;
        description: string;
        icon: string;
    }>;
    presets: Record<string, IndicatorConfig[]>;
}