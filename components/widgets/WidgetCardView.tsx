'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { formatValue } from '@/lib/formatters';
import { FieldFormat } from '@/stores/dashboardStore';

interface WidgetCardViewProps {
  data: any;
  fields: string[];
  title: string;
  fieldFormats?: Record<string, FieldFormat>;
}

export const WidgetCardView = ({ data, fields, title, fieldFormats }: WidgetCardViewProps) => {
  const cardData = useMemo(() => {
    if (!data) return [];

    const getValue = (obj: any, path: string): any => {
      return path.split('.').reduce((curr, key) => curr?.[key], obj);
    };

    const formatDisplayValue = (value: any, field: string): { value: string; isNumeric: boolean; isPercentage: boolean } => {
      // Use custom formatting if available
      const format = fieldFormats?.[field];
      if (format) {
        return {
          value: formatValue(value, format),
          isNumeric: format.type === 'number' || format.type === 'currency',
          isPercentage: format.type === 'percentage'
        };
      }
      
      if (typeof value === 'number') {
        const isPercentage = field.toLowerCase().includes('percent') || field.toLowerCase().includes('change');
        return {
          value: isPercentage ? `${value.toFixed(2)}%` : value.toLocaleString(),
          isNumeric: true,
          isPercentage
        };
      }
      return {
        value: value?.toString() || '-',
        isNumeric: false,
        isPercentage: false
      };
    };

    const formatLabel = (field: string) => {
      return field
        .split('.')
        .pop()
        ?.replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .replace(/_/g, ' ') || field;
    };

    // Handle different data structures
    let sourceData = data;
    if (Array.isArray(data)) {
      sourceData = data[0] || {};
    } else if (typeof data === 'object') {
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
          // Get the latest time series entry (first date entry)
          const latestDate = Object.keys(data[timeSeriesKey])[0];
          sourceData = {
            date: latestDate,
            ...data[timeSeriesKey][latestDate]
          };
        }
      } else {
        // Try to find the most relevant object
        const keys = Object.keys(data);
        const dataKey = keys.find(key => 
          key.toLowerCase().includes('data') || 
          key.toLowerCase().includes('quote') ||
          key.toLowerCase().includes('price')
        );
        if (dataKey && typeof data[dataKey] === 'object') {
          sourceData = data[dataKey];
        }
      }
    }

    return fields.slice(0, 8).map(field => {
      let value;
      
      // Handle wildcard paths (e.g., "Time Series (Daily).*.1. open")
      if (field.includes('*.')) {
        const parts = field.split('*.');
        if (parts.length === 2) {
          const fieldName = parts[1]; // e.g., "1. open"
          value = sourceData[fieldName];
        }
      } else {
        value = getValue(sourceData, field);
      }
      
      const formatted = formatDisplayValue(value, field);
      return {
        label: formatLabel(field),
        ...formatted,
        field
      };
    });
  }, [data, fields]);

  if (cardData.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        No data available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {cardData.map((item, index) => (
        <div
          key={item.field}
          className="bg-slate-750 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 uppercase tracking-wide">
              {item.label}
            </span>
            {item.isNumeric && (
              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">
                {item.isPercentage ? (
                  parseFloat(item.value) >= 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-400" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-400" />
                  )
                ) : (
                  <DollarSign className="w-3 h-3 text-blue-400" />
                )}
              </div>
            )}
          </div>
          <div className={`text-lg font-bold ${
            item.isPercentage 
              ? parseFloat(item.value) >= 0 
                ? 'text-green-400' 
                : 'text-red-400'
              : item.isNumeric 
                ? 'text-blue-400' 
                : 'text-slate-200'
          }`}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
};