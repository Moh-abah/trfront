// Stock Analysis Types

export interface StockSymbol {
  symbol: string;
  name: string;
  exchange?: string;
  type?: 'stock' | 'etf' | 'crypto' | 'forex' | 'index';
  currency?: string;
  country?: string;
  sector?: string;
  industry?: string;
  market_cap?: number;
}

export interface StockChart {
  symbol: string;
  timeframe: string;
  data: {
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
}

export interface TechnicalAnalysis {
  symbol: string;
  timeframe: string;
  timestamp: string;
  indicators: {
    // Trend Indicators
    sma?: Record<string, number>;
    ema?: Record<string, number>;
    
    // Momentum Indicators
    rsi?: number;
    macd?: {
      macd: number;
      signal: number;
      histogram: number;
    };
    stochastic?: {
      k: number;
      d: number;
    };
    
    // Volatility Indicators
    bollinger_bands?: {
      upper: number;
      middle: number;
      lower: number;
    };
    atr?: number;
    
    // Volume Indicators
    obv?: number;
    volume_ma?: number;
  };
  signals: {
    trend?: 'bullish' | 'bearish' | 'neutral';
    momentum?: 'strong' | 'moderate' | 'weak';
    volatility?: 'high' | 'medium' | 'low';
    recommendation?: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  };
}

export interface CompanyProfile {
  symbol: string;
  name: string;
  description?: string;
  sector?: string;
  industry?: string;
  market_cap?: number;
  pe_ratio?: number;
  eps?: number;
  dividend_yield?: number;
  beta?: number;
  website?: string;
  logo_url?: string;
  country?: string;
  employees?: number;
  founded_year?: number;
}

export interface MarketSummary {
  market: string;
  timestamp: string;
  indices: {
    name: string;
    symbol: string;
    value: number;
    change: number;
    change_percent: number;
  }[];
  top_gainers: {
    symbol: string;
    name: string;
    change_percent: number;
    volume?: number;
  }[];
  top_losers: {
    symbol: string;
    name: string;
    change_percent: number;
    volume?: number;
  }[];
  most_active: {
    symbol: string;
    name: string;
    volume: number;
    change_percent: number;
  }[];
}

export interface SectorAnalysis {
  sector: string;
  timestamp: string;
  stocks_count: number;
  performance: {
    avg_change_percent: number;
    best_performer: {
      symbol: string;
      name: string;
      change_percent: number;
    };
    worst_performer: {
      symbol: string;
      name: string;
      change_percent: number;
    };
  };
  market_cap: number;
  pe_ratio?: number;
}

export interface TopMovers {
  timestamp: string;
  market?: string;
  gainers: {
    symbol: string;
    name: string;
    price: number;
    change: number;
    change_percent: number;
    volume: number;
  }[];
  losers: {
    symbol: string;
    name: string;
    price: number;
    change: number;
    change_percent: number;
    volume: number;
  }[];
  active: {
    symbol: string;
    name: string;
    price: number;
    volume: number;
    change_percent: number;
  }[];
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  type?: string;
  exchange?: string;
  country?: string;
  currency?: string;
}

export interface HistoricalData {
  symbol: string;
  market: string;
  timeframe: string;
  start_date: string;
  end_date: string;
  data: {
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
}

export interface CurrentPrice {
  symbol: string;
  market: string;
  timestamp: string;
  price: number;
  change: number;
  change_percent: number;
  volume?: number;
  high_24h?: number;
  low_24h?: number;
  bid?: number;
  ask?: number;
}

export interface SystemStatus {
  status: 'operational' | 'degraded' | 'down';
  timestamp: string;
  version: string;
  markets: {
    name: string;
    status: 'open' | 'closed' | 'pre-market' | 'after-hours';
    next_open?: string;
  }[];
  latency_ms?: number;
}

export interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  services: {
    name: string;
    status: 'up' | 'down';
    last_check?: string;
  }[];
}

export interface AvailableSymbols {
  market: string;
  symbols: string[];
  count: number;
  categories?: {
    name: string;
    count: number;
    symbols: string[];
  }[];
}

export interface BacktestConfig {
  name?: string;
  symbol: string;
  timeframe: string;
  start_date: string;
  end_date: string;
  initial_capital: number;
  commission_rate?: number;
  slippage_percent?: number;
  strategy_config: any;
}

export interface BacktestResult {
  backtest_id: string;
  summary: {
    total_trades: number;
    winning_trades: number;
    losing_trades: number;
    win_rate: number;
    total_pnl: number;
    total_pnl_percent: number;
    max_drawdown_percent: number;
    sharpe_ratio: number;
    sortino_ratio: number;
    calmar_ratio: number;
    profit_factor: number;
  };
  equity_curve: number[];
  trades: any[];
}

export interface ApplyIndicatorsRequest {
  symbol: string;
  market: string;
  timeframe: string;
  start_date?: string;
  end_date?: string;
  indicators: {
    name: string;
    params: Record<string, number>;
  }[];
}

export interface ApplyIndicatorsResponse {
  symbol: string;
  timeframe: string;
  data: {
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    indicators?: Record<string, number>;
  }[];
}
