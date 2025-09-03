'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart3, PieChart } from 'lucide-react';

interface WidgetPerformanceViewProps {
  data: any;
  fields: string[];
  title: string;
}

export const WidgetPerformanceView = ({ data, fields, title }: WidgetPerformanceViewProps) => {
  const performanceData = useMemo(() => {
    if (!data) return null;

    // Handle time series data (like Alpha Vantage format)
    if (typeof data === 'object') {
      // Check if we have time series data (like Alpha Vantage format)
      const hasTimeSeriesFields = fields.some(f => f.includes('*.'));
      if (hasTimeSeriesFields) {
        // Find time series object (usually contains dates as keys)
        const timeSeriesKey = Object.keys(data).find(key => 
          typeof data[key] === 'object' && 
          !Array.isArray(data[key]) &&
          Object.keys(data[key]).some(subKey => /\d{4}-\d{2}-\d{2}/.test(subKey)) // Look for date patterns
        );
        
        if (timeSeriesKey && data[timeSeriesKey]) {
          const timeSeriesData = data[timeSeriesKey];
          const entries = Object.entries(timeSeriesData).slice(0, 30);
          
          if (entries.length === 0) return null;
          
          // Get latest (first entry) and oldest (last entry) data
          const latest = entries[0][1] as any;
          const oldest = entries[entries.length - 1][1] as any;
          
          // Calculate performance metrics
          const latestClose = parseFloat(latest['4. close'] || '0');
          const oldestClose = parseFloat(oldest['4. close'] || '0');
          const latestHigh = parseFloat(latest['2. high'] || '0');
          const latestLow = parseFloat(latest['3. low'] || '0');
          const latestOpen = parseFloat(latest['1. open'] || '0');
          const latestVolume = parseInt(latest['5. volume'] || '0');
          
          // Calculate period high/low across all data
          let periodHigh = 0;
          let periodLow = Infinity;
          let totalVolume = 0;
          
          entries.forEach(([_, values]: [string, any]) => {
            const high = parseFloat(values['2. high'] || '0');
            const low = parseFloat(values['3. low'] || '0');
            const volume = parseInt(values['5. volume'] || '0');
            
            if (high > periodHigh) periodHigh = high;
            if (low < periodLow) periodLow = low;
            totalVolume += volume;
          });
          
          // Calculate percentage change
          const priceChange = latestClose - oldestClose;
          const priceChangePercent = oldestClose > 0 ? (priceChange / oldestClose) * 100 : 0;
          
          return {
            currentPrice: latestClose,
            openPrice: latestOpen,
            dayHigh: latestHigh,
            dayLow: latestLow,
            periodHigh,
            periodLow: periodLow === Infinity ? 0 : periodLow,
            priceChange,
            priceChangePercent,
            volume: latestVolume,
            avgVolume: Math.round(totalVolume / entries.length),
            marketCap: latestClose * latestVolume, // Simplified calculation
            isPositive: priceChange >= 0,
            latestDate: entries[0][0],
            dataPoints: entries.length
          };
        }
      }
    }
    
    return null;
  }, [data, fields]);

  if (!performanceData) {
    return (
      <div className="text-center py-8 text-slate-400">
        No performance data available
      </div>
    );
  }

  const metrics = [
    {
      label: 'Current Price',
      value: `$${performanceData.currentPrice.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20'
    },
    {
      label: 'Price Change',
      value: `${performanceData.priceChange >= 0 ? '+' : ''}$${performanceData.priceChange.toFixed(2)}`,
      subValue: `${performanceData.priceChangePercent >= 0 ? '+' : ''}${performanceData.priceChangePercent.toFixed(2)}%`,
      icon: performanceData.isPositive ? TrendingUp : TrendingDown,
      color: performanceData.isPositive ? 'text-green-400' : 'text-red-400',
      bgColor: performanceData.isPositive ? 'bg-green-900/20' : 'bg-red-900/20'
    },
    {
      label: 'Day High',
      value: `$${performanceData.dayHigh.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-900/20'
    },
    {
      label: 'Day Low',
      value: `$${performanceData.dayLow.toFixed(2)}`,
      icon: TrendingDown,
      color: 'text-red-400',
      bgColor: 'bg-red-900/20'
    },
    {
      label: 'Period High',
      value: `$${performanceData.periodHigh.toFixed(2)}`,
      icon: BarChart3,
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20'
    },
    {
      label: 'Period Low',
      value: `$${performanceData.periodLow.toFixed(2)}`,
      icon: BarChart3,
      color: 'text-orange-400',
      bgColor: 'bg-orange-900/20'
    },
    {
      label: 'Volume',
      value: performanceData.volume.toLocaleString(),
      subValue: `Avg: ${performanceData.avgVolume.toLocaleString()}`,
      icon: Activity,
      color: 'text-slate-400',
      bgColor: 'bg-slate-900/20'
    },
    {
      label: 'Market Value',
      value: `$${(performanceData.marketCap / 1000000).toFixed(1)}M`,
      subValue: `${performanceData.dataPoints} data points`,
      icon: PieChart,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-900/20'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header with latest info */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-white">Performance Overview</h3>
            <p className="text-sm text-slate-400">Latest: {new Date(performanceData.latestDate).toLocaleDateString()}</p>
          </div>
          <div className={`text-right ${performanceData.isPositive ? 'text-green-400' : 'text-red-400'}`}>
            <div className="text-2xl font-bold">${performanceData.currentPrice.toFixed(2)}</div>
            <div className="text-sm flex items-center justify-end">
              {performanceData.isPositive ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              {performanceData.priceChangePercent >= 0 ? '+' : ''}{performanceData.priceChangePercent.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className={`${metric.bgColor} rounded-lg p-4 border border-slate-600`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 uppercase tracking-wide">
                {metric.label}
              </span>
              <div className={`w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center`}>
                <metric.icon className={`w-3 h-3 ${metric.color}`} />
              </div>
            </div>
            <div className={`text-lg font-bold ${metric.color}`}>
              {metric.value}
            </div>
            {metric.subValue && (
              <div className="text-xs text-slate-400 mt-1">
                {metric.subValue}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};