'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WidgetChartViewProps {
  data: any;
  fields: string[];
  title: string;
}

export const WidgetChartView = ({ data, fields, title }: WidgetChartViewProps) => {
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

  return (
    <div className="h-80">
      <div className="mb-2 text-xs text-slate-400">
        {hasOHLCData ? 'Stock Price Chart (OHLC Data)' : 'Price Line Chart'}
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