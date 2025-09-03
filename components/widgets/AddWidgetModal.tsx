'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, TestTube, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useDashboardStore } from '@/stores/dashboardStore';
import { FinanceApiService } from '@/lib/apiService';

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddWidgetModal = ({ isOpen, onClose }: AddWidgetModalProps) => {
  const [title, setTitle] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [apiHeaders, setApiHeaders] = useState<Record<string, string>>({});
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [displayMode, setDisplayMode] = useState<'card' | 'table' | 'chart'>('table');
  const [chartType, setChartType] = useState<'line' | 'candlestick' | 'performance'>('line');
  const [timeInterval, setTimeInterval] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [testResult, setTestResult] = useState<{ success: boolean; data?: any; error?: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showArraysOnly, setShowArraysOnly] = useState(false);

  const { addWidget } = useDashboardStore();

  const presetApis = useMemo(() => FinanceApiService.getPresetApis(), []);

  const filteredFields = useMemo(() => {
    let fields = availableFields;
    
    if (searchTerm) {
      fields = fields.filter(field => 
        field.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return fields;
  }, [availableFields, searchTerm]);
  const testApiConnection = async () => {
    if (!apiUrl.trim()) return;
    
    setTesting(true);
    setTestResult(null);
    
    try {
      const response = await fetch(apiUrl.trim(), {
        headers: { 
          'Accept': 'application/json',
          ...apiHeaders
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setTestResult({ success: true, data });
      
      // Extract available fields from the data
      const fields = extractFieldsFromData(data);
      setAvailableFields(fields);
      setSelectedFields(fields.slice(0, 5)); // Auto-select first 5 fields
    } catch (error) {
      setTestResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to test API' 
      });
    } finally {
      setTesting(false);
    }
  };

  const extractFieldsFromData = (data: any): string[] => {
    const fields: string[] = [];
    
    const traverse = (obj: any, prefix = '') => {
      if (typeof obj === 'object' && obj !== null) {
        if (Array.isArray(obj) && obj.length > 0) {
          traverse(obj[0], prefix);
        } else {
          Object.keys(obj).forEach(key => {
            const fieldPath = prefix ? `${prefix}.${key}` : key;
            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
              // For nested objects like "Time Series (Daily)", try to get sample fields from first entry
              const firstValue = Object.values(obj[key])[0];
              if (typeof firstValue === 'object' && firstValue !== null) {
                Object.keys(firstValue as any).forEach(subKey => {
                  fields.push(`${fieldPath}.*.${subKey}`);
                });
              } else {
                traverse(obj[key], fieldPath);
              }
            } else {
              fields.push(fieldPath);
            }
          });
        }
      }
    };
    
    traverse(data);
    
    // Filter out metadata fields for financial APIs and prioritize time series data
    const filteredFields = fields.filter((field, index) => fields.indexOf(field) === index);
    const timeSeriesFields = filteredFields.filter(f => f.includes('Time Series') || f.includes('*.'));
    const otherFields = filteredFields.filter(f => !f.includes('Time Series') && !f.includes('Meta Data'));
    const metaFields = filteredFields.filter(f => f.includes('Meta Data'));
    
    // Prioritize: time series data > other data > metadata
    return [...timeSeriesFields, ...otherFields, ...metaFields].slice(0, 20);
  };

  const handleSubmit = () => {
    if (!title.trim() || !apiUrl.trim() || selectedFields.length === 0) return;
    
    addWidget({
      title: title.trim(),
      apiUrl: apiUrl.trim(),
      apiHeaders: Object.keys(apiHeaders).length > 0 ? apiHeaders : undefined,
      refreshInterval,
      displayMode,
      chartType: displayMode === 'chart' ? chartType : undefined,
      timeInterval: displayMode === 'chart' ? timeInterval : undefined,
      fields: selectedFields,
    });
    
    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setApiUrl('');
    setApiHeaders({});
    setRefreshInterval(30);
    setDisplayMode('table');
    setChartType('line');
    setTimeInterval('daily');
    setTestResult(null);
    setAvailableFields([]);
    setSelectedFields([]);
    setSearchTerm('');
    setShowArraysOnly(false);
    onClose();
  };

  const toggleField = (field: string) => {
    setSelectedFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const handlePresetSelect = (preset: any) => {
    setTitle(preset.name);
    setApiUrl(preset.url);
    setApiHeaders(preset.headers || {});
    setTestResult(null);
    setAvailableFields([]);
    setSelectedFields([]);
  };

  const addApiHeader = () => {
    const key = prompt('Enter header name (e.g., X-Api-Key):');
    const value = prompt('Enter header value:');
    if (key && value) {
      setApiHeaders(prev => ({ ...prev, [key]: value }));
    }
  };

  const removeApiHeader = (key: string) => {
    setApiHeaders(prev => {
      const newHeaders = { ...prev };
      delete newHeaders[key];
      return newHeaders;
    });
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-lg border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Add New Widget</h2>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4 text-slate-400" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Preset APIs */}
          <div>
            <Label className="text-slate-300">Quick Start - Preset APIs</Label>
            <div className="mt-2 grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
              {presetApis.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => handlePresetSelect(preset)}
                  className="text-left p-3 bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors"
                >
                  <div className="font-medium text-slate-300 text-sm">{preset.name}</div>
                  <div className="text-xs text-slate-500">{preset.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="title" className="text-slate-300">Widget Name</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Bitcoin Price"
              className="mt-2 bg-slate-800 border-slate-700 text-white"
            />
          </div>

          <div>
            <Label htmlFor="apiUrl" className="text-slate-300">API URL</Label>
            <div className="flex space-x-2 mt-2">
              <Input
                id="apiUrl"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://api.coinbase.com/v2/exchange-rates?currency=BTC"
                className="flex-1 bg-slate-800 border-slate-700 text-white"
              />
              <Button
                variant="outline"
                onClick={testApiConnection}
                disabled={testing || !apiUrl.trim()}
                className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
              >
                {testing ? (
                  <>
                    <div className="animate-spin w-4 h-4 mr-2 border border-slate-500 border-t-transparent rounded-full" />
                    Testing
                  </>
                ) : (
                  <>
                    <TestTube className="h-4 w-4 mr-2" />
                    Test
                  </>
                )}
              </Button>
            </div>
            
            {testResult && (
              <div className={`mt-2 p-3 rounded-md flex items-center space-x-2 ${
                testResult.success 
                  ? 'bg-green-900/20 border border-green-700' 
                  : 'bg-red-900/20 border border-red-700'
              }`}>
                {testResult.success ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-400">API connection successful! Test data found.</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-400">{testResult.error}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* API Headers */}
          {Object.keys(apiHeaders).length > 0 && (
            <div>
              <Label className="text-slate-300">API Headers</Label>
              <div className="mt-2 space-y-2">
                {Object.entries(apiHeaders).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-2 bg-slate-800 rounded border border-slate-700">
                    <span className="text-sm text-slate-300 font-mono">{key}: {value}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeApiHeader(key)}
                      className="text-red-400 hover:text-red-300 h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={addApiHeader}
                className="mt-2 bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
              >
                Add Header
              </Button>
            </div>
          )}

          <div>
            <Label htmlFor="refreshInterval" className="text-slate-300">Refresh Interval (seconds)</Label>
            <Select value={refreshInterval.toString()} onValueChange={(value) => setRefreshInterval(Number(value))}>
              <SelectTrigger className="mt-2 bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="30">30 seconds</SelectItem>
                <SelectItem value="60">1 minute</SelectItem>
                <SelectItem value="300">5 minutes</SelectItem>
                <SelectItem value="600">10 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Display Mode */}
          <div>
            <Label className="text-slate-300">Display Mode</Label>
            <div className="mt-2 flex space-x-2">
              {[
                { value: 'card', label: 'Card', icon: '📊' },
                { value: 'table', label: 'Table', icon: '📋' },
                { value: 'chart', label: 'Chart', icon: '📈' }
              ].map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setDisplayMode(mode.value as any)}
                  className={`flex-1 p-3 rounded-md border transition-colors ${
                    displayMode === mode.value
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <div className="text-lg mb-1">{mode.icon}</div>
                  <div className="text-sm font-medium">{mode.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Chart Type (only show when chart mode is selected) */}
          {displayMode === 'chart' && (
            <div>
              <Label className="text-slate-300">Chart Type</Label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {[
                  { value: 'line', label: 'Line Chart', icon: '📈', desc: 'Multi-line price trends' },
                  { value: 'candlestick', label: 'Candlestick', icon: '🕯️', desc: 'OHLC candlestick view' },
                  { value: 'performance', label: 'Performance', icon: '📊', desc: 'Key metrics overview' }
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setChartType(type.value as any)}
                    className={`p-3 rounded-md border transition-colors text-center ${
                      chartType === type.value
                        ? 'bg-green-600 border-green-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <div className="text-lg mb-1">{type.icon}</div>
                    <div className="text-xs font-medium">{type.label}</div>
                    <div className="text-xs text-slate-400 mt-1">{type.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Time Interval (only show for chart mode) */}
          {displayMode === 'chart' && (
            <div>
              <Label className="text-slate-300">Time Interval</Label>
              <div className="mt-2 flex space-x-2">
                {[
                  { value: 'daily', label: 'Daily', desc: 'Daily stock data' },
                  { value: 'weekly', label: 'Weekly', desc: 'Weekly aggregated' },
                  { value: 'monthly', label: 'Monthly', desc: 'Monthly trends' }
                ].map((interval) => (
                  <button
                    key={interval.value}
                    onClick={() => setTimeInterval(interval.value as any)}
                    className={`flex-1 p-3 rounded-md border transition-colors ${
                      timeInterval === interval.value
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <div className="text-sm font-medium">{interval.label}</div>
                    <div className="text-xs text-slate-400 mt-1">{interval.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {availableFields.length > 0 && (
            <div>
              <Label className="text-slate-300">Select Fields to Display</Label>
              
              {/* Search Fields */}
              <div className="mt-2 space-y-2">
                <Input
                  placeholder="Search for fields..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showArraysOnly"
                    checked={showArraysOnly}
                    onCheckedChange={(checked) => setShowArraysOnly(checked as boolean)}
                  />
                  <label htmlFor="showArraysOnly" className="text-sm text-slate-400">
                    Show arrays only (for table view)
                  </label>
                </div>
              </div>
              
              <div className="mt-2 p-4 bg-slate-800 rounded-md border border-slate-700 max-h-48 overflow-y-auto">
                <div className="space-y-2">
                  {filteredFields.map((field) => (
                    <div key={field} className="flex items-center space-x-2">
                      <Checkbox
                        id={field}
                        checked={selectedFields.includes(field)}
                        onCheckedChange={() => toggleField(field)}
                      />
                      <label
                        htmlFor={field}
                        className="text-sm text-slate-300 cursor-pointer flex-1 font-mono"
                      >
                        {field}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Selected Fields */}
              {selectedFields.length > 0 && (
                <div className="mt-2">
                  <Label className="text-slate-400 text-xs">Selected Fields</Label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selectedFields.map((field) => (
                      <Badge
                        key={field}
                        variant="secondary"
                        className="bg-blue-600 text-white text-xs"
                      >
                        {field}
                        <button
                          onClick={() => toggleField(field)}
                          className="ml-1 hover:text-red-300"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <p className="text-xs text-slate-500 mt-2">
                {displayMode === 'table' ? 'Table view' : displayMode === 'card' ? 'Card view' : 'Chart view'} {selectedFields.length > 0 ? `(${selectedFields.length} selected)` : ''}
              </p>
            </div>
          )}
        </div>

        <div className="flex space-x-3 p-6 border-t border-slate-700">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1 bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !apiUrl.trim() || selectedFields.length === 0}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            Add Widget
          </Button>
        </div>
      </div>
    </div>
  );
};