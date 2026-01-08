export type MarketType = 'crypto' | 'stocks';
export type BacktestType = 'basic' | 'walk-forward' | 'monte-carlo';

export interface BacktestConfig {
    strategy_id: string;
    symbol: string;
    market: MarketType;
    timeframe: string;
    start_date: string; // ISO string
    end_date: string; // ISO string
    initial_capital: number;
    commission?: number;
    slippage?: number;
    parameters?: Record<string, any>;
}

export interface WalkForwardConfig extends BacktestConfig {
    window_size: string; // e.g., "30 days"
    step_size: string; // e.g., "7 days"
    optimization_metric?: 'sharpe_ratio' | 'total_return' | 'win_rate';
}

export interface MonteCarloConfig extends BacktestConfig {
    iterations: number;
    confidence_level: number;
    random_seed?: number;
    simulation_type?: 'random_trades' | 'bootstrap' | 'parametric';
}

export interface Trade {
    id: string;
    symbol: string;
    entry_time: string;
    exit_time: string;
    entry_price: number;
    exit_price: number;
    quantity: number;
    side: 'long' | 'short';
    profit_loss: number;
    profit_loss_percentage: number;
    commission: number;
    slippage: number;
    strategy_signal?: string;
    indicators?: Record<string, any>;
}

export interface BacktestResult {
    id: string;
    config: BacktestConfig;
    trades: Trade[];
    metrics: BacktestMetrics;
    equity_curve: EquityPoint[];
    execution_time: number;
    timestamp: string;
    status: 'completed' | 'failed' | 'running';
    error_message?: string;
}

export interface BacktestMetrics {
    // Basic Metrics
    total_trades: number;
    winning_trades: number;
    losing_trades: number;
    win_rate: number;

    // Profit/Loss Metrics
    total_profit_loss: number;
    total_profit_loss_percentage: number;
    gross_profit: number;
    gross_loss: number;
    profit_factor: number;

    // Risk Metrics
    max_drawdown: number;
    max_drawdown_percentage: number;
    max_runup: number;
    max_runup_percentage: number;
    sharpe_ratio: number;
    sortino_ratio: number;
    calmar_ratio: number;
    ulcer_index: number;

    // Trade Metrics
    average_trade: number;
    average_winning_trade: number;
    average_losing_trade: number;
    largest_winning_trade: number;
    largest_losing_trade: number;
    average_hold_time: number; // in hours

    // Performance Metrics
    annual_return: number;
    monthly_return: number;
    volatility: number;
    beta: number;
    alpha: number;

    // Ratios
    recovery_factor: number;
    expectancy: number;
    k_ratio: number;
    tail_ratio: number;
}

export interface EquityPoint {
    timestamp: string;
    equity: number;
    drawdown: number;
    drawdown_percentage: number;
    cumulative_return: number;
}

export interface WalkForwardResult {
    id: string;
    config: WalkForwardConfig;
    segments: WalkForwardSegment[];
    summary: WalkForwardSummary;
}

export interface WalkForwardSegment {
    start_date: string;
    end_date: string;
    in_sample: BacktestResult;
    out_of_sample: BacktestResult;
    optimal_parameters: Record<string, any>;
}

export interface WalkForwardSummary {
    average_win_rate: number;
    average_sharpe_ratio: number;
    average_max_drawdown: number;
    consistency_score: number;
    parameter_stability: Record<string, number>;
}

export interface MonteCarloResult {
    id: string;
    config: MonteCarloConfig;
    simulations: MonteCarloSimulation[];
    summary: MonteCarloSummary;
    probability_distribution: ProbabilityDistribution;
}

export interface MonteCarloSimulation {
    iteration: number;
    total_profit_loss: number;
    max_drawdown: number;
    sharpe_ratio: number;
    equity_curve: EquityPoint[];
    final_equity: number;
}

export interface MonteCarloSummary {
    median_profit_loss: number;
    median_max_drawdown: number;
    median_sharpe_ratio: number;
    confidence_interval: ConfidenceInterval;
    probability_of_profit: number;
    value_at_risk: number;
    conditional_value_at_risk: number;
    best_case: number;
    worst_case: number;
    standard_deviation: number;
}

export interface ConfidenceInterval {
    lower: number;
    upper: number;
    level: number; // e.g., 0.95 for 95%
}

export interface ProbabilityDistribution {
    bins: number[];
    frequencies: number[];
    mean: number;
    std_dev: number;
    skewness: number;
    kurtosis: number;
}

// إحصائيات حية أثناء تشغيل الباك-تيست
export interface LiveBacktestStats {
    progress: number; // 0-100
    trades_count: number;
    current_equity: number;
    current_drawdown: number;
    elapsed_time: number;
    estimated_time_remaining: number;
}