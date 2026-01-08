import { z } from 'zod';

// ================= Enums =================
export const ConditionTypeSchema = z.enum([
    "indicator_value",
    "indicator_crossover",
    "price_crossover",
    "volume_condition",
    "time_condition",
    "logical_and",
    "logical_or",
    "logical_not"
]);
export type ConditionType = z.infer<typeof ConditionTypeSchema>;

export const OperatorSchema = z.enum([
    ">", ">=", "<", "<=", "==", "!=", "cross_above", "cross_below"
]);
export type Operator = z.infer<typeof OperatorSchema>;

export const PositionSideSchema = z.enum(["long", "short", "both"]);
export type PositionSide = z.infer<typeof PositionSideSchema>;

// ================= Base Interfaces =================
export interface Condition {
    type: ConditionType;
    operator: Operator;
    left_value: string | number; // "indicator:rsi" or 100
    right_value: string | number;
    timeframe?: string;
}

export interface CompositeCondition {
    type: "and" | "or";
    conditions: (Condition | CompositeCondition)[];
}

export interface BaseRule {
    name: string;
    enabled: boolean;
}

// ================= Rules =================
export interface EntryRule extends BaseRule {
    condition: Condition | CompositeCondition;
    position_side: PositionSide;
    weight: number; // 0.0 to 1.0
}

export interface ExitRule extends BaseRule {
    condition: Condition | CompositeCondition;
    exit_type: "stop_loss" | "take_profit" | "trailing_stop" | "signal_exit";
    value?: number;
}

export interface FilterRule extends BaseRule {
    condition: Condition | CompositeCondition;
    action: "allow" | "block" | "delay";
}

// ================= Risk Management =================
export interface RiskManagement {
    stop_loss_percentage: number;
    take_profit_percentage: number;
    trailing_stop_percentage: number;
    max_position_size: number;
    max_daily_loss: number;
    max_concurrent_positions: number;
}

// ================= Indicator Config =================
export interface IndicatorConfig {
    name: string; // Unique key for strategy (e.g., 'rsi_5m', 'sma_20_1h')
    type: "trend" | "momentum" | "volatility" | "volume" | "support_resistance" | "custom";
    params: Record<string, any>;
    enabled: boolean;
    timeframe: string;
    display_name: string; // UI Label only
}

// ================= Main Strategy Config =================
export interface StrategyConfig {
    name: string;
    version: string;
    description?: string;
    base_timeframe: string;
    position_side: PositionSide;
    initial_capital: number;
    commission_rate: number;

    indicators: IndicatorConfig[];
    entry_rules: EntryRule[];
    exit_rules: ExitRule[];
    filter_rules: FilterRule[];
    risk_management: RiskManagement;
}