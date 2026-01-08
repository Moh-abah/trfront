'use client';
import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart, 
  Activity, 
  Globe,
  AlertTriangle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { PriceFormatter } from '../../utils/formatters/price.formatter';
import { NumberFormatter } from '../../utils/formatters/number.formatter';
import { MetricCard } from '../ui/Card/MetricCard';


interface MarketSummaryProps {
  summary?: {
    totalMarketCap?: number;
    totalVolume24h?: number;
    btcDominance?: number;
    fearGreedIndex?: number;
    totalGainers?: number;
    totalLosers?: number;
    averageChange?: number;
  };
  market: 'crypto' | 'stocks';
  isLoading?: boolean;
}

export const MarketSummary: React.FC<MarketSummaryProps> = ({ 
  summary, 
  market, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-3"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const getFearGreedStatus = (index?: number) => {
    if (!index) return { label: 'N/A', color: 'gray' as const, trend: 'neutral' as const };
    
    if (index >= 75) return { label: 'Extreme Greed', color: 'red' as const, trend: 'down' as const };
    if (index >= 55) return { label: 'Greed', color: 'yellow' as const, trend: 'down' as const };
    if (index >= 45) return { label: 'Neutral', color: 'green' as const, trend: 'neutral' as const };
    if (index >= 25) return { label: 'Fear', color: 'yellow' as const, trend: 'up' as const };
    return { label: 'Extreme Fear', color: 'green' as const, trend: 'up' as const };
  };

  const fearGreedStatus = getFearGreedStatus(summary?.fearGreedIndex);

  const stats = [
    {
      title: market === 'crypto' ? 'Total Market Cap' : 'Market Value',
      value: PriceFormatter.formatMarketCap(summary?.totalMarketCap || 0, { compact: true }),
      change: '+2.5%',
      icon: <Globe className="w-5 h-5" />,
      trend: 'up' as const,
      description: market === 'crypto' ? 'Total cryptocurrency market' : 'Total stock market value'
    },
    {
      title: '24h Volume',
      value: PriceFormatter.formatVolume(summary?.totalVolume24h || 0),
      change: '+15.3%',
      icon: <Activity className="w-5 h-5" />,
      trend: 'up' as const,
      description: 'Total trading volume in last 24 hours'
    },
    {
      title: market === 'crypto' ? 'BTC Dominance' : 'S&P 500',
      value: market === 'crypto' 
        ? `${NumberFormatter.formatNumber(summary?.btcDominance || 0, { decimals: 2 })}%`
        : '4,890.23',
      change: market === 'crypto' ? '-0.5%' : '+0.8%',
      icon: <BarChart className="w-5 h-5" />,
      trend: market === 'crypto' ? 'down' as const : 'up' as const,
      description: market === 'crypto' ? 'Bitcoin market share' : 'Major stock index'
    },
    {
      title: market === 'crypto' ? 'Fear & Greed' : 'VIX Index',
      value: market === 'crypto' 
        ? `${summary?.fearGreedIndex || 'N/A'}`
        : '15.2',
      change: market === 'crypto' ? fearGreedStatus.label : '-2.1%',
      icon: market === 'crypto' ? <AlertTriangle className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />,
      trend: fearGreedStatus.trend,
      description: market === 'crypto' ? 'Market sentiment index' : 'Volatility index'
    },
    {
      title: 'Market Breadth',
      value: `${summary?.totalGainers || 0}/${summary?.totalLosers || 0}`,
      change: summary?.averageChange 
        ? `${summary.averageChange >= 0 ? '+' : ''}${NumberFormatter.formatNumber(summary.averageChange, { decimals: 2 })}%`
        : 'N/A',
      icon: summary?.averageChange && summary.averageChange >= 0 
        ? <TrendingUp className="w-5 h-5" /> 
        : <TrendingDown className="w-5 h-5" />,
      trend: (summary?.averageChange && summary.averageChange >= 0) ? 'up' as const : 'down' as const,
      description: 'Gainers vs Losers ratio'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <MetricCard
          key={index}
          title={stat.title}
          value={stat.value}
          // change={stat.change}
          icon={stat.icon}
          trend={stat.trend}
          // size="lg"
          // description={stat.description}
          className="h-full"
        />
      ))}
    </div>
  );
};
