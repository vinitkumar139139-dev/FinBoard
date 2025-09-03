'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar, Cell } from 'recharts';

interface WidgetChartViewProps {
  data: any;
  fields: string[];
  title: string;
  chartType?: 'line' | 'candlestick';
  timeInterval?: 'daily' | 'weekly' | 'monthly';
}

export const WidgetChartView = ({ data, fields, title, chartType = 'line', timeInterval = 'daily' }: WidgetChartViewProps) => {
  const chartData = useMemo(() => {
    if (!data) return [];

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
          // Convert time series data to chart format
          return Object.entries(data[timeSeriesKey])
            .slice(0, 30)
            .reverse() // Reverse to show oldest to newest
            .map(([date, values]: [string, any]) => {
              const entry: any = {
                date: date,
                formattedDate: new Date(date).toLocaleDateString(),
                timestamp: new Date(date).getTime()
              };
              
              // Convert string values to numbers for charting
              if (values['1. open']) entry.open = parseFloat(values['1. open']);
              if (values['2. high']) entry.high = parseFloat(values['2. high']);
              if (values['3. low']) entry.low = parseFloat(values['3. low']);
              if (values['4. close']) entry.close = parseFloat(values['4. close']);
              if (values['5. volume']) entry.volume = parseInt(values['5. volume']);
              
              return entry;
            });
        }
      }
      
      // Fallback: Try to find time series data using key names
      const timeSeriesKeys = Object.keys(data).filter(key => 
        key.toLowerCase().includes('time') || 
        key.toLowerCase().includes('series') ||
        key.toLowerCase().includes('daily') ||
        key.toLowerCase().includes('data')
      );
      
      if (timeSeriesKeys.length > 0) {
        const timeSeriesData = data[timeSeriesKeys[0]];
        if (typeof timeSeriesData === 'object') {
          return Object.entries(timeSeriesData)
            .slice(0, 30)
            .reverse()
            .map(([date, values]: [string, any]) => ({
              date,
              formattedDate: new Date(date).toLocaleDateString(),
              ...values,
              timestamp: new Date(date).getTime()
            }));
        }
      }
    }
    
    return [];
  }, [data, fields]);

  // Determine if we have OHLC data for candlestick chart
  const hasOHLCData = useMemo(() => {
    if (chartData.length === 0) return false;
    const firstItem = chartData[0];
    return firstItem.open && firstItem.high && firstItem.low && firstItem.close;
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        No time series data available for chart
      </div>
    );
  }

  // Custom Candlestick Shape Component
  const CandlestickShape = (props: any) => {
    const { payload, x, y, width, height } = props;
    if (!payload || !payload.open || !payload.high || !payload.low || !payload.close) return null;
    
    const { open, high, low, close } = payload;
    const isPositive = close >= open;
    
    // Calculate positions and dimensions
    const candleWidth = Math.max(width * 0.6, 2);
    const candleX = x + (width - candleWidth) / 2;
    
    // Scale calculations (approximate)
    const minValue = Math.min(...chartData.map(d => d.low));
    const maxValue = Math.max(...chartData.map(d => d.high));
    const range = maxValue - minValue;
    const scale = height / range;
    
    const openY = y + height - ((open - minValue) / range) * height;
    const closeY = y + height - ((close - minValue) / range) * height;
    const highY = y + height - ((high - minValue) / range) * height;
    const lowY = y + height - ((low - minValue) / range) * height;
    
    const bodyTop = Math.min(openY, closeY);
    const bodyHeight = Math.abs(openY - closeY);
    
    return (
      <g>
        {/* High-Low line (wick) */}
        <line
          x1={candleX + candleWidth / 2}
          y1={highY}
          x2={candleX + candleWidth / 2}
          y2={lowY}
          stroke={isPositive ? "#10B981" : "#EF4444"}
          strokeWidth={1}
        />
        {/* Open-Close body */}
        <rect
          x={candleX}
          y={bodyTop}
          width={candleWidth}
          height={Math.max(bodyHeight, 1)}
          fill={isPositive ? "#10B981" : "#EF4444"}
          stroke={isPositive ? "#10B981" : "#EF4444"}
          fillOpacity={isPositive ? 0.8 : 1}
        />
      </g>
    );
  };

  if (chartType === 'candlestick' && hasOHLCData) {
    return (
      <div className="h-80">
        <div className="mb-2 text-xs text-slate-400">
          Candlestick Chart ({timeInterval.charAt(0).toUpperCase() + timeInterval.slice(1)}) - Green: Price Up, Red: Price Down
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="formattedDate"
              stroke="#9CA3AF"
              fontSize={10}
              interval="preserveStartEnd"
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '6px',
                color: '#F3F4F6'
              }}
              formatter={(value: any, name: string) => {
                if (name === 'volume') return [parseInt(value)?.toLocaleString(), 'Volume'];
                return [parseFloat(value)?.toFixed(2), name.toUpperCase()];
              }}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Bar dataKey="close" fill="transparent" shape={<CandlestickShape />} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Default Line Chart
  return (
    <div className="h-80">
      <div className="mb-2 text-xs text-slate-400">
        {chartType === 'line' ? `Line Chart (${timeInterval.charAt(0).toUpperCase() + timeInterval.slice(1)})` : 'Stock Price Chart'} - {hasOHLCData ? 'OHLC Data' : 'Price Data'}
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="formattedDate"
            stroke="#9CA3AF"
            fontSize={10}
            interval="preserveStartEnd"
          />
          <YAxis 
            stroke="#9CA3AF"
            fontSize={12}
            domain={['dataMin - 5', 'dataMax + 5']}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '6px',
              color: '#F3F4F6'
            }}
            formatter={(value: any, name: string) => {
              if (name === 'volume') return [parseInt(value)?.toLocaleString(), 'Volume'];
              return [parseFloat(value)?.toFixed(2), name.toUpperCase()];
            }}
            labelFormatter={(label) => `Date: ${label}`}
          />
          
          {/* Close Price Line - Main line */}
          <Line
            type="monotone"
            dataKey="close"
            stroke="#3B82F6"
            strokeWidth={3}
            dot={false}
            name="close"
          />
          
          {/* High Price Line */}
          {hasOHLCData && (
            <Line
              type="monotone"
              dataKey="high"
              stroke="#10B981"
              strokeWidth={1}
              dot={false}
              name="high"
              strokeDasharray="3 3"
            />
          )}
          
          {/* Low Price Line */}
          {hasOHLCData && (
            <Line
              type="monotone"
              dataKey="low"
              stroke="#EF4444"
              strokeWidth={1}
              dot={false}
              name="low"
              strokeDasharray="3 3"
            />
          )}
          
          {/* Open Price Line */}
          {hasOHLCData && (
            <Line
              type="monotone"
              dataKey="open"
              stroke="#F59E0B"
              strokeWidth={1}
              dot={false}
              name="open"
              strokeDasharray="5 5"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};