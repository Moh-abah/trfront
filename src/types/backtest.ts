// Backtest Types matching backend schemas

export type ConditionType =
    | 'indicator_value'
    | 'indicator_crossover'
    | 'price_crossover'
    | 'volume_condition'
    | 'time_condition'
    | 'and'
    | 'or'
    | 'logical_not';

export type Operator =
    | '>'
    | '>='
    | '<'
    | '<='
    | '=='
    | '!='
    | 'cross_above'
    | 'cross_below'
    | 'touches';

export type PositionSide = 'long' | 'short' | 'both';

export type ExitType = 'stop_loss' | 'take_profit' | 'trailing_stop' | 'signal_exit';
export type FilterAction = 'allow' | 'block' | 'delay';
export type IndicatorCategory = 'trend' | 'momentum' | 'volatility' | 'volume' | 'support_resistance' | 'pattern_recognition';
export type IndicatorParamValue = number | boolean | string;
export interface IndicatorConfig {
    id?: string;
    name: string;
    type: IndicatorCategory;
    params: Record<string, IndicatorParamValue>;
    enabled: boolean;
    timeframe: string;
}

export interface IndicatorMetadata {
    name: string;
    display_name: string;
    description: string;
    category: IndicatorCategory;
 
    default_params: Record<string, IndicatorParamValue>;
    required_columns: string[];
    timeframe?: string;
}

export interface Condition {
    type: ConditionType;
    operator: Operator;
    left_value: string | number;
    right_value: string | number;
    timeframe?: string;

}

export interface CompositeCondition {
    type: 'and' | 'or';
    conditions: (Condition | CompositeCondition)[];
}

export type RuleCondition = Condition | CompositeCondition;

export interface EntryRule {
    name: string;
    condition: RuleCondition;
    position_side: PositionSide;
    weight: number;
    enabled: boolean;
}

export interface ExitRule {
    name: string;
    condition: RuleCondition;
    exit_type: ExitType;
    value?: number;
    enabled: boolean;
}

export interface FilterRule {
    name: string;
    condition: RuleCondition;
    action: FilterAction;
    enabled: boolean;
    metadata?: Record<string, any>;
}

export interface RiskManagement {
    stop_loss_percentage?: number;
    take_profit_percentage?: number;
    trailing_stop_percentage?: number;
    max_position_size?: number;
    max_daily_loss?: number;
    max_concurrent_positions?: number;
}

export interface StrategyConfig {
    name: string;
    version?: string;
    description?: string;
    author?: string;
    base_timeframe: string;
    position_side: PositionSide;
    indicators: IndicatorConfig[];
    entry_rules: EntryRule[];
    exit_rules: ExitRule[];
    filter_rules: FilterRule[];
    risk_management?: RiskManagement;
}

export interface BacktestConfig {
    name: string;
    description?: string;
    mode?: 'standard' | 'paper' | 'live';
    start_date: string; // ISO datetime string
    end_date: string; // ISO datetime string
    timeframe: string;
    market: 'crypto' | 'forex' | 'stocks';
    symbols: string[];
    strategy_config: StrategyConfig;
    initial_capital: number;
    position_sizing: 'fixed' | 'percentage' | 'kelly';
    position_size_percent: number;
    max_positions?: number;
    commission_rate: number;
    slippage_percent: number;
    stop_loss_percent?: number;
    take_profit_percent?: number;
    trailing_stop_percent?: number;
    max_daily_loss_percent?: number;
    enable_short_selling: boolean;
    enable_margin: boolean;
    leverage: number;
    require_confirmation: boolean;
}

export interface Trade {
    id: string;
    symbol: string;
    entry_time: string;
    exit_time?: string;
    entry_price: number;
    exit_price?: number;
    position_type: 'long' | 'short';
    position_size: number;
    pnl?: number;
    pnl_percentage?: number;
    commission: number;
    slippage: number;
    stop_loss?: number;
    take_profit?: number;
    exit_reason?: string;
    metadata?: Record<string, any>;
    type?: 'buy' | 'sell';
}

export interface VisualCandle {
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    strategy_decision: 'buy' | 'sell' | 'hold' | null;
    position_state: 'LONG' | 'SHORT' | 'NEUTRAL';
    triggered_rules: string[];
    confidence: number | null;
    trade_action?: string | null;
    trade_id?: string | null;
    trade_price?: number | null;
    trade_size?: number | null;
    account_balance: number | null;
    cumulative_pnl: number | null;
    position_size: number | null;
    entry_price: number | null;
    stop_loss: number | null;
    take_profit: number | null;
    risk_reward_ratio: number | null;
    current_pnl: number | null;
    unrealized_pnl: number | null;
    pnl?: number | null;
    pnl_percentage?: number | null;
    indicators: Record<string, number>;
    market_condition?: string | null;
    signal_strength?: number | null;
    price_change_percent?: number | null;
    volatility?: number | null;
    leverage_used?: number | null;
    margin_used?: number | null;
    free_margin?: number | null;
    return_on_investment?: number | null;
}

export interface TradeMarker {
    timestamp: string;
    price: number;
    type: 'entry' | 'exit';
    trade_id: string;
    position_type: string;
    position_size: number;
    exit_reason?: string;
    pnl?: number;
    pnl_percentage?: number;
    entry_price: number;
    exit_price?: number;
    stop_loss?: number;
    take_profit?: number;
    holding_period?: number;
    risk_reward_ratio?: number;
    commission?: number;
    account_balance_before?: number;
    account_balance_after?: number;
    cumulative_pnl?: number;
    index?: number;
    decision_reason?: string;
    confidence?: number;
    indicators_snapshot?: Record<string, number>;
}

export interface BacktestSummary {
    name: string;
    initial_capital: number;
    final_capital: number;
    total_pnl: number;
    total_pnl_percent: number;
    total_trades: number;
    winning_trades: number;
    losing_trades: number;
    win_rate: number;
    max_drawdown_percent: number;
    max_drawdown_duration_days?: number; 
    sharpe_ratio: number;
    sortino_ratio: number;
    calmar_ratio: number;
    profit_factor: number;
    expectancy: number;
    annual_return_percent: number;
    execution_time_seconds: number;
    architecture_mode: string;
    recovery_factor?: number;
    ulcer_index?: number;
    avg_winning_trade?: number;
    avg_losing_trade?: number;
    largest_winning_trade?: number;
    largest_losing_trade?: number;
    avg_trade_duration_hours?: number;

}

export interface BacktestResponse {
    success: boolean;
    backtest_id: string;
    summary: BacktestSummary;
    advanced_metrics: {
        volatility_annual: number;
        var_95: number;
        cvar_95: number;
        system_quality_number: number;
        kelly_criterion: number;
    };
    visual_candles_count?: number;
    trade_points_count?: number;
    trades?: Trade[];
}

export interface ChartDataResponse {
    backtest_id: string;
    metadata: {
        name: string;
        symbol: string;
        timeframe: string;
        initial_capital: number;
        final_capital: number;
        total_pnl: number;
        total_pnl_percent: number;
        total_trades: number;
        win_rate: number;
        start_date: string;
        end_date: string;
    };
    chart_data: {
        candles: VisualCandle[];
        trade_markers: TradeMarker[];
        available_indicators: string[];
        total_candles: number;
        total_trades: number;
    };
    summary: {
        total_candles: number;
        total_trades: number;
        win_rate: number;
        total_pnl: number;
        total_pnl_percent: number;
        max_drawdown_percent: number;
        sharpe_ratio: number;
        sortino_ratio: number;
        calmar_ratio: number;
        profit_factor: number;
        annual_return_percent: number;
        visible_range: string;
        has_more_data: boolean;
    };
    equity_curve?: number[];
    drawdown_curve?: number[];
}












// Backend Strategy Types
export interface StrategyFromDB {
    id: number;
    name: string;
    version: string;
    description: string;
    author: string;
    base_timeframe: string;
    position_side: PositionSide;
    is_active: boolean;
    config: StrategyConfig;
    indicators_count?: number;
    entry_rules_count?: number;
    exit_rules_count?: number;
    filter_rules_count?: number;
    total_rules_count?: number;
    has_indicators?: boolean;
    has_rules?: boolean;
    indicator_timeframes?: string[];
    // المؤشرات مع أطرها الزمنية
    indicators?: Array<{
        name: string;
        timeframe: string;
        type?: string;
        enabled?: boolean;
    }>;
    indicators_summary?: string[]; // للملخص النصي
    // الحقول الموجودة
    created_at: string;
    updated_at: string | null;

}

export interface StrategyListResponse {
    success: boolean;
    strategies: StrategyFromDB[];
    count: number;
}

export interface StrategyResponse {
    success: boolean;
    strategy: StrategyFromDB;
}

export interface SaveStrategyResponse {
    success: boolean;
    message: string;
    strategy_name: string;
    version: string;
}

export interface RunStrategyRequest {
    symbol: string;
    timeframe: string;
    market?: string;
    days?: number;
    live_mode?: boolean;
    strategy_config?: StrategyConfig;
}

export interface Decision {
    timestamp: string;
    action: 'buy' | 'sell' | 'hold';
    confidence: number;
    reason: string;
    metadata: {
        score: number;
        [key: string]: any;
    };
}

export interface RunStrategyResponse {
    request_id: string;
    strategy_id?: number;
    strategy_name: string;
    strategy_version?: string;
    symbol: string;
    timeframe: string;
    total_bars_processed: number;
    active_decisions_count: number;
    decisions: Decision[];
    active_decisions_summary: any[];
}

export interface ValidateStrategyResponse {
    valid: boolean;
    message: string;
    config_summary: {
        name: string;
        version: string;
        indicators_count: number;
        entry_rules_count: number;
        exit_rules_count: number;
    };
    errors?: string[];
}
