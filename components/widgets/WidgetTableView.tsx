'use client';

import { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface WidgetTableViewProps {
  data: any;
  fields: string[];
  title: string;
  displayMode?: 'card' | 'table' | 'chart';
}

export const WidgetTableView = ({ data, fields, title, displayMode = 'table' }: WidgetTableViewProps) => {
  const tableData = useMemo(() => {
    if (!data) return [];

    const getValue = (obj: any, path: string): any => {
      return path.split('.').reduce((curr, key) => curr?.[key], obj);
    };

    // Handle different data structures
    if (Array.isArray(data)) {
      return data.slice(0, 10); // Limit to 10 rows
    } else if (typeof data === 'object') {
      // If data is an object, try to find arrays within it
      const arrays = Object.values(data).filter(Array.isArray);
      if (arrays.length > 0) {
        return (arrays[0] as any[]).slice(0, 10);
      } else {
        // Convert single object to array
        return [data];
      }
    }
    
    return [];
  }, [data]);

  const displayFields = useMemo(() => {
    if (fields.length === 0) return [];
    return fields.slice(0, 6); // Limit columns
  }, [fields]);

  const getValue = (obj: any, path: string): any => {
    const value = path.split('.').reduce((curr, key) => curr?.[key], obj);
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    return value?.toString() || '-';
  };

  const formatHeader = (field: string) => {
    return field
      .split('.')
      .pop()
      ?.replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase()) || field;
  };

  if (tableData.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        No data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-xs text-slate-500">
        {tableData.length} items
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700">
              {displayFields.map((field) => (
                <TableHead key={field} className="text-slate-400 font-medium">
                  {formatHeader(field)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((item, index) => (
              <TableRow key={index} className="border-slate-700 hover:bg-slate-750">
                {displayFields.map((field) => {
                  const value = getValue(item, field);
                  const isNumeric = !isNaN(parseFloat(value)) && isFinite(value);
                  
                  return (
                    <TableCell 
                      key={field} 
                      className={`text-slate-300 font-mono text-sm ${
                        isNumeric ? 'text-right' : 'text-left'
                      }`}
                    >
                      {value}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};