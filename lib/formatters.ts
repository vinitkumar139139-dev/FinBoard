import { FieldFormat } from '@/stores/dashboardStore';

export const formatValue = (value: any, format?: FieldFormat): string => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  if (!format || format.type === 'text') {
    return String(value);
  }

  const numValue = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  
  if (isNaN(numValue) && format.type !== 'date') {
    return String(value);
  }

  switch (format.type) {
    case 'currency':
      const currency = format.currency || 'USD';
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: format.decimals ?? 2,
        maximumFractionDigits: format.decimals ?? 2,
      });
      return formatter.format(numValue);

    case 'percentage':
      const percentage = numValue * (value < 1 && value > -1 ? 100 : 1);
      return `${percentage.toFixed(format.decimals ?? 2)}%`;

    case 'number':
      const prefix = format.prefix || '';
      const suffix = format.suffix || '';
      return `${prefix}${numValue.toLocaleString('en-US', {
        minimumFractionDigits: format.decimals ?? 0,
        maximumFractionDigits: format.decimals ?? 2,
      })}${suffix}`;

    case 'date':
      try {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          return String(value);
        }
        
        const dateFormat = format.dateFormat || 'MM/dd/yyyy';
        if (dateFormat === 'MM/dd/yyyy') {
          return date.toLocaleDateString('en-US');
        } else if (dateFormat === 'yyyy-MM-dd') {
          return date.toISOString().split('T')[0];
        } else if (dateFormat === 'relative') {
          const now = new Date();
          const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
          
          if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
          if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
          if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
          return `${Math.floor(diffInSeconds / 86400)}d ago`;
        }
        return date.toLocaleDateString('en-US');
      } catch {
        return String(value);
      }

    default:
      return String(value);
  }
};

export const getFormatPreview = (sampleValue: any, format: FieldFormat): string => {
  const sampleData = {
    currency: 1234.56,
    percentage: 0.1234,
    number: 1234567.89,
    date: new Date().toISOString(),
    text: 'Sample Text'
  };
  
  const previewValue = sampleValue ?? sampleData[format.type];
  return formatValue(previewValue, format);
};

export const detectFieldType = (fieldName: string, sampleValue: any): FieldFormat['type'] => {
  const fieldLower = fieldName.toLowerCase();
  
  // Currency detection
  if (fieldLower.includes('price') || fieldLower.includes('cost') || 
      fieldLower.includes('amount') || fieldLower.includes('value') ||
      fieldLower.includes('usd') || fieldLower.includes('dollar')) {
    return 'currency';
  }
  
  // Percentage detection
  if (fieldLower.includes('percent') || fieldLower.includes('rate') ||
      fieldLower.includes('ratio') || fieldLower.includes('change')) {
    return 'percentage';
  }
  
  // Date detection
  if (fieldLower.includes('date') || fieldLower.includes('time') ||
      fieldLower.includes('created') || fieldLower.includes('updated')) {
    return 'date';
  }
  
  // Number detection based on value
  if (typeof sampleValue === 'number' || 
      (typeof sampleValue === 'string' && !isNaN(parseFloat(sampleValue)))) {
    return 'number';
  }
  
  return 'text';
};