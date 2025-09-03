'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface WidgetChartViewProps {
  data: any;
  fields: string[];
  title: string;
}

export const WidgetChartView = ({ data, fields, title }: WidgetChartViewProps) => {
  const chartData = useMemo(() => {
    if (!data) return [];

    const getValue = (obj: any, path: string): any => {
      return path.split('.').reduce((curr, key) => curr?.[key], obj);
    };

    // Handle different data structures
    if (Array.isArray(data)) {
      return data.slice(0, 20).map((item, index) => {
        const chartPoint: any = { index };
        fields.forEach(field => {
          const value = getValue(item, field);
          if (typeof value === 'number') {
            chartPoint[field] = value;
          }
        });
        return chartPoint;
      });
    } else if (typeof data === 'object') {
      // Try to find time series data
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
            .slice(0, 20)
            .map(([date, values]: [string, any]) => ({
              date,
              ...values,
              timestamp: new Date(date).getTime()
            }))
            .sort((a, b) => a.timestamp - b.timestamp);
        }
      }
      
      // Convert single object to chart data
      const numericFields = fields.filter(field => {
        const value = getValue(data, field);
        return typeof value === 'number';
      });
      
      return numericFields.map(field => ({
        name: field.split('.').pop()?.replace(/([A-Z])/g, ' $1') || field,
        value: getValue(data, field)
      }));
    }
    
    return [];
  }, [data, fields]);

  const numericFields = useMemo(() => {
    if (chartData.length === 0) return [];
    
    const firstItem = chartData[0];
    return Object.keys(firstItem).filter(key => 
      key !== 'index' && 
      key !== 'date' && 
      key !== 'timestamp' && 
      key !== 'name' &&
      typeof firstItem[key] === 'number'
    );
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        No numeric data available for chart
      </div>
    );
  }

  // Determine chart type based on data structure
  const isTimeSeries = chartData.some(item => item.date || item.timestamp);
  const isBarData = chartData.some(item => item.name && item.value);

  if (isBarData && !isTimeSeries) {
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="name" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '6px',
                color: '#F3F4F6'
              }}
            />
            <Bar dataKey="value" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey={isTimeSeries ? "date" : "index"}
            stroke="#9CA3AF"
            fontSize={12}
          />
          <YAxis 
            stroke="#9CA3AF"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '6px',
              color: '#F3F4F6'
            }}
          />
          {numericFields.slice(0, 3).map((field, index) => (
            <Line
              key={field}
              type="monotone"
              dataKey={field}
              stroke={['#3B82F6', '#10B981', '#F59E0B'][index]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};