// src/services/api/index.ts
// Re-export all API services
export { axiosClient } from './http/axios.client';

// Export all services
export { authService } from './auth.service';
export { marketService } from './market.service';
// export { indicatorService } from './indicator.service';
export { strategyService } from './strategy.service';
export { backtestService } from './backtest.service';
export { filterService } from './filter.service';
export { settingsService } from './settings.service';

// Export types
export type {
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    UserProfile,
    ChangePasswordRequest
} from './auth.service';

export type {
    BacktestRequest,
    WalkForwardConfig,
    MonteCarloConfig,
    BacktestComparison,
    BacktestReport
} from './backtest.service';

export type {
    FilterCriteria,
    FilterGroup,
    FilterRequest,
    FilterResult,
    FilterPreset,
    MarketStats
} from './filter.service';

// export type {
//     IndicatorApplyRequest,
//     IndicatorResult,
//     PineTranspileRequest,
//     PineTranspileResult,
//     AvailableIndicator,
//     IndicatorSignal,
//     CustomIndicator
// } from './indicator.service';

export type {
    StrategyRunRequest,
    StrategyRunResult,
    StrategyValidationResult,
    StrategyTemplate,
    StrategyExample
} from './strategy.service';

export type {
    SettingsResponse,
    Watchlist,
    ApiKey,
    Alert,
    Portfolio
} from './settings.service';