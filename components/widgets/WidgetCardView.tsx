'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

interface WidgetCardViewProps {
  data: any;
  fields: string[];
  title: string;
}

export const WidgetCardView = ({ data, fields, title }: WidgetCardViewProps) => {
  const cardData = useMemo(() => {
    if (!data) return [];

    const getValue = (obj: any, path: string): any => {
      return path.split('.').reduce((curr, key) => curr?.[key], obj);
    };

    const formatValue = (value: any, field: string): { value: string; isNumeric: boolean; isPercentage: boolean } => {
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

    return fields.slice(0, 8).map(field => {
      const value = getValue(sourceData, field);
      const formatted = formatValue(value, field);
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