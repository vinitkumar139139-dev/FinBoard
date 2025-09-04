'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, TestTube, Check, AlertCircle, Plus, Trash2, Settings, Eye, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDashboardStore, FieldFormat } from '@/stores/dashboardStore';
import { FinanceApiService } from '@/lib/apiService';
import { formatValue, getFormatPreview, detectFieldType } from '@/lib/formatters';

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddWidgetModal = ({ isOpen, onClose }: AddWidgetModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [apiEndpoints, setApiEndpoints] = useState<Array<{ name: string; url: string; description?: string }>>([]);
  const [apiHeaders, setApiHeaders] = useState<Record<string, string>>({});
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [displayMode, setDisplayMode] = useState<'card' | 'table' | 'chart'>('table');
  const [chartType, setChartType] = useState<'line' | 'candlestick' | 'performance'>('line');
  const [timeInterval, setTimeInterval] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [testResult, setTestResult] = useState<{ success: boolean; data?: any; error?: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [fieldFormats, setFieldFormats] = useState<Record<string, FieldFormat>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showArraysOnly, setShowArraysOnly] = useState(false);
  const [currentTab, setCurrentTab] = useState('basic');

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
      
      // Auto-detect field formats
      const autoFormats: Record<string, FieldFormat> = {};
      fields.slice(0, 5).forEach(field => {
        const sampleValue = getSampleValue(data, field);
        const detectedType = detectFieldType(field, sampleValue);
        autoFormats[field] = {
          type: detectedType,
          decimals: detectedType === 'currency' ? 2 : detectedType === 'percentage' ? 2 : 0
        };
      });
      setFieldFormats(autoFormats);
    } catch (error) {
      setTestResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to test API' 
      });
    } finally {
      setTesting(false);
    }
  };

  const getSampleValue = (data: any, fieldPath: string): any => {
    const parts = fieldPath.split('.');
    let current = data;
    
    for (const part of parts) {
      if (part === '*') {
        // For wildcard paths, get the first available key
        const keys = Object.keys(current);
        if (keys.length > 0) {
          current = current[keys[0]];
        } else {
          return null;
        }
      } else if (current && typeof current === 'object') {
        current = current[part];
      } else {
        return null;
      }
    }
    
    return current;
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
      description: description.trim() || undefined,
      apiUrl: apiUrl.trim(),
      apiEndpoints: apiEndpoints.length > 0 ? apiEndpoints : undefined,
      currentEndpointIndex: apiEndpoints.length > 0 ? 0 : undefined,
      apiHeaders: Object.keys(apiHeaders).length > 0 ? apiHeaders : undefined,
      refreshInterval,
      displayMode,
      chartType: displayMode === 'chart' ? chartType : undefined,
      timeInterval: displayMode === 'chart' ? timeInterval : undefined,
      fields: selectedFields,
      fieldFormats: Object.keys(fieldFormats).length > 0 ? fieldFormats : undefined,
    });
    
    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setApiUrl('');
    setApiEndpoints([]);
    setApiHeaders({});
    setRefreshInterval(30);
    setDisplayMode('table');
    setChartType('line');
    setTimeInterval('daily');
    setTestResult(null);
    setAvailableFields([]);
    setSelectedFields([]);
    setFieldFormats({});
    setSearchTerm('');
    setShowArraysOnly(false);
    setCurrentTab('basic');
    onClose();
  };

  const toggleField = (field: string) => {
    setSelectedFields(prev => {
      const newFields = prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field];
      
      // When adding a field, auto-detect its format if not already set
      if (!prev.includes(field) && testResult?.data && !fieldFormats[field]) {
        const sampleValue = getSampleValue(testResult.data, field);
        const detectedType = detectFieldType(field, sampleValue);
        setFieldFormats(current => ({
          ...current,
          [field]: {
            type: detectedType,
            decimals: detectedType === 'currency' ? 2 : detectedType === 'percentage' ? 2 : 0
          }
        }));
      }
      
      return newFields;
    });
  };

  const updateFieldFormat = (field: string, format: FieldFormat) => {
    setFieldFormats(prev => ({
      ...prev,
      [field]: format
    }));
  };

  const handlePresetSelect = (preset: any) => {
    setTitle(preset.name);
    setApiUrl(preset.url);
    setApiHeaders(preset.headers || {});
    setTestResult(null);
    setAvailableFields([]);
    setSelectedFields([]);
    setFieldFormats({});
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

  const addEndpoint = () => {
    const name = prompt('Enter endpoint name:');
    const url = prompt('Enter endpoint URL:');
    const description = prompt('Enter endpoint description (optional):') || '';
    
    if (name && url) {
      setApiEndpoints(prev => [...prev, { name, url, description }]);
    }
  };

  const removeEndpoint = (index: number) => {
    setApiEndpoints(prev => prev.filter((_, i) => i !== index));
  };

  const switchToEndpoint = (index: number) => {
    if (apiEndpoints[index]) {
      setApiUrl(apiEndpoints[index].url);
      setTestResult(null);
      setAvailableFields([]);
      setSelectedFields([]);
      setFieldFormats({});
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg border border-border w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Add New Widget</h2>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>

        <div className="p-6">
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="api">API Settings</TabsTrigger>
              <TabsTrigger value="fields">Field Selection</TabsTrigger>
              <TabsTrigger value="formatting">Data Formatting</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 mt-6">
              {/* Preset APIs */}
              <div>
                <Label className="text-foreground">Quick Start - Preset APIs</Label>
                <div className="mt-2 grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                  {presetApis.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => handlePresetSelect(preset)}
                      className="text-left p-3 bg-secondary hover:bg-secondary/80 rounded-md border border-border transition-colors"
                    >
                      <div className="font-medium text-foreground text-sm">{preset.name}</div>
                      <div className="text-xs text-muted-foreground">{preset.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="title" className="text-foreground">Widget Name</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Bitcoin Price Tracker"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-foreground">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this widget displays and its purpose..."
                  className="mt-2"
                  rows={3}
                />
              </div>

              {/* Display Mode */}
              <div>
                <Label className="text-foreground">Display Mode</Label>
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
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'bg-secondary border-border text-foreground hover:bg-secondary/80'
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
                  <Label className="text-foreground">Chart Type</Label>
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
                            : 'bg-secondary border-border text-foreground hover:bg-secondary/80'
                        }`}
                      >
                        <div className="text-lg mb-1">{type.icon}</div>
                        <div className="text-xs font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground mt-1">{type.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Time Interval (only show for chart mode) */}
              {displayMode === 'chart' && (
                <div>
                  <Label className="text-foreground">Time Interval</Label>
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
                            : 'bg-secondary border-border text-foreground hover:bg-secondary/80'
                        }`}
                      >
                        <div className="text-sm font-medium">{interval.label}</div>
                        <div className="text-xs text-muted-foreground mt-1">{interval.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="refreshInterval" className="text-foreground">Refresh Interval</Label>
                <Select value={refreshInterval.toString()} onValueChange={(value) => setRefreshInterval(Number(value))}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">1 minute</SelectItem>
                    <SelectItem value="300">5 minutes</SelectItem>
                    <SelectItem value="600">10 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="api" className="space-y-6 mt-6">
              <div>
                <Label htmlFor="apiUrl" className="text-foreground">Primary API URL</Label>
                <div className="flex space-x-2 mt-2">
                  <Input
                    id="apiUrl"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="https://api.coinbase.com/v2/exchange-rates?currency=BTC"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={testApiConnection}
                    disabled={testing || !apiUrl.trim()}
                  >
                    {testing ? (
                      <>
                        <div className="animate-spin w-4 h-4 mr-2 border border-muted-foreground border-t-transparent rounded-full" />
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
                        <span className="text-sm text-green-400">API connection successful! Found {availableFields.length} fields.</span>
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

              {/* Alternative Endpoints */}
              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-foreground">Alternative Endpoints</Label>
                  <Button variant="outline" size="sm" onClick={addEndpoint}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Endpoint
                  </Button>
                </div>
                
                {apiEndpoints.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {apiEndpoints.map((endpoint, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded border border-border">
                        <div className="flex-1">
                          <div className="font-medium text-foreground text-sm">{endpoint.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">{endpoint.url}</div>
                          {endpoint.description && (
                            <div className="text-xs text-muted-foreground mt-1">{endpoint.description}</div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => switchToEndpoint(index)}
                            title="Use this endpoint"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEndpoint(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* API Headers */}
              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-foreground">API Headers</Label>
                  <Button variant="outline" size="sm" onClick={addApiHeader}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Header
                  </Button>
                </div>
                
                {Object.keys(apiHeaders).length > 0 && (
                  <div className="mt-2 space-y-2">
                    {Object.entries(apiHeaders).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-2 bg-secondary rounded border border-border">
                        <span className="text-sm text-foreground font-mono">{key}: {value}</span>
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
                )}
              </div>
            </TabsContent>

            <TabsContent value="fields" className="space-y-6 mt-6">
              {availableFields.length > 0 ? (
                <>
                  <div>
                    <Label className="text-foreground">Select Fields to Display</Label>
                    
                    {/* Search Fields */}
                    <div className="mt-2 space-y-2">
                      <Input
                        placeholder="Search for fields..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="showArraysOnly"
                          checked={showArraysOnly}
                          onCheckedChange={(checked) => setShowArraysOnly(checked as boolean)}
                        />
                        <label htmlFor="showArraysOnly" className="text-sm text-muted-foreground">
                          Show arrays only (for table view)
                        </label>
                      </div>
                    </div>
                    
                    <div className="mt-2 p-4 bg-secondary rounded-md border border-border max-h-64 overflow-y-auto">
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
                              className="text-sm text-foreground cursor-pointer flex-1 font-mono"
                            >
                              {field}
                            </label>
                            {testResult?.data && (
                              <span className="text-xs text-muted-foreground">
                                {String(getSampleValue(testResult.data, field)).slice(0, 20)}...
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Selected Fields */}
                    {selectedFields.length > 0 && (
                      <div className="mt-2">
                        <Label className="text-muted-foreground text-xs">Selected Fields ({selectedFields.length})</Label>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {selectedFields.map((field) => (
                            <Badge
                              key={field}
                              variant="secondary"
                              className="bg-primary text-primary-foreground text-xs"
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
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <TestTube className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Test API Connection First</h3>
                  <p className="text-muted-foreground">Go to the API Settings tab and test your API connection to see available fields.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="formatting" className="space-y-6 mt-6">
              {selectedFields.length > 0 ? (
                <div>
                  <Label className="text-foreground">Configure Field Formatting</Label>
                  <div className="mt-4 space-y-4">
                    {selectedFields.map((field) => (
                      <FieldFormatEditor
                        key={field}
                        field={field}
                        format={fieldFormats[field] || { type: 'text' }}
                        sampleValue={testResult?.data ? getSampleValue(testResult.data, field) : null}
                        onFormatChange={(format) => updateFieldFormat(field, format)}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Fields Selected</h3>
                  <p className="text-muted-foreground">Select some fields in the Field Selection tab to configure their formatting.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex space-x-3 p-6 border-t border-border">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !apiUrl.trim() || selectedFields.length === 0}
            className="flex-1"
          >
            Add Widget
          </Button>
        </div>
      </div>
    </div>
  );
};

const FieldFormatEditor = ({ 
  field, 
  format, 
  sampleValue, 
  onFormatChange 
}: { 
  field: string; 
  format: FieldFormat; 
  sampleValue: any; 
  onFormatChange: (format: FieldFormat) => void; 
}) => {
  const handleFormatChange = (key: keyof FieldFormat, value: any) => {
    onFormatChange({ ...format, [key]: value });
  };

  return (
    <div className="p-4 border border-border rounded-md bg-secondary/50">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-foreground text-sm">{field}</h4>
        <div className="flex items-center space-x-2">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {getFormatPreview(sampleValue, format)}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-muted-foreground">Type</Label>
          <Select value={format.type} onValueChange={(value) => handleFormatChange('type', value)}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="currency">Currency</SelectItem>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="date">Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {(format.type === 'number' || format.type === 'currency' || format.type === 'percentage') && (
          <div>
            <Label className="text-xs text-muted-foreground">Decimals</Label>
            <Input
              type="number"
              min="0"
              max="10"
              value={format.decimals || 0}
              onChange={(e) => handleFormatChange('decimals', parseInt(e.target.value) || 0)}
              className="h-8"
            />
          </div>
        )}
        
        {format.type === 'currency' && (
          <div>
            <Label className="text-xs text-muted-foreground">Currency</Label>
            <Select value={format.currency || 'USD'} onValueChange={(value) => handleFormatChange('currency', value)}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="JPY">JPY</SelectItem>
                <SelectItem value="BTC">BTC</SelectItem>
                <SelectItem value="ETH">ETH</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        {format.type === 'date' && (
          <div>
            <Label className="text-xs text-muted-foreground">Format</Label>
            <Select value={format.dateFormat || 'MM/dd/yyyy'} onValueChange={(value) => handleFormatChange('dateFormat', value)}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                <SelectItem value="yyyy-MM-dd">YYYY-MM-DD</SelectItem>
                <SelectItem value="relative">Relative (2h ago)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        {format.type === 'number' && (
          <>
            <div>
              <Label className="text-xs text-muted-foreground">Prefix</Label>
              <Input
                value={format.prefix || ''}
                onChange={(e) => handleFormatChange('prefix', e.target.value)}
                placeholder="e.g., $, #"
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Suffix</Label>
              <Input
                value={format.suffix || ''}
                onChange={(e) => handleFormatChange('suffix', e.target.value)}
                placeholder="e.g., %, units"
                className="h-8"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};