import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FieldFormat {
  type: 'currency' | 'percentage' | 'number' | 'date' | 'text';
  decimals?: number;
  currency?: string;
  dateFormat?: string;
  prefix?: string;
  suffix?: string;
}

export interface Widget {
  id: string;
  title: string;
  description?: string;
  apiUrl: string;
  apiEndpoints?: Array<{ name: string; url: string; description?: string }>;
  currentEndpointIndex?: number;
  apiHeaders?: Record<string, string>;
  refreshInterval: number; // in seconds
  fields: string[];
  fieldFormats?: Record<string, FieldFormat>;
  displayMode: 'card' | 'table' | 'chart';
  chartType?: 'line' | 'candlestick' | 'performance';
  timeInterval?: 'daily' | 'weekly' | 'monthly';
  data: any;
  loading: boolean;
  error: string | null;
  lastUpdated?: Date;
  position: number;
}

interface DashboardStore {
  widgets: Widget[];
  addWidget: (widget: Omit<Widget, 'id' | 'data' | 'loading' | 'error' | 'position'>) => void;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  switchWidgetEndpoint: (id: string, endpointIndex: number) => void;
  reorderWidgets: (widgets: Widget[]) => void;
  setWidgetData: (id: string, data: any, error?: string | null) => void;
  setWidgetLoading: (id: string, loading: boolean) => void;
  exportDashboard: () => string;
  importDashboard: (config: string) => boolean;
  clearDashboard: () => void;
  loadTemplate: (templateName: string) => void;
}

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set, get) => ({
      widgets: [],
      
      addWidget: (widget) => set((state) => {
        const newWidget: Widget = {
          ...widget,
          id: Date.now().toString(),
          displayMode: widget.displayMode || 'table',
          data: null,
          loading: false,
          error: null,
          position: state.widgets.length,
        };
        return { widgets: [...state.widgets, newWidget] };
      }),
      
      removeWidget: (id) => set((state) => ({
        widgets: state.widgets.filter(w => w.id !== id)
      })),
      
      updateWidget: (id, updates) => set((state) => ({
        widgets: state.widgets.map(w => 
          w.id === id ? { ...w, ...updates } : w
        )
      })),
      
      switchWidgetEndpoint: (id, endpointIndex) => set((state) => ({
        widgets: state.widgets.map(w => {
          if (w.id === id && w.apiEndpoints && w.apiEndpoints[endpointIndex]) {
            return {
              ...w,
              currentEndpointIndex: endpointIndex,
              apiUrl: w.apiEndpoints[endpointIndex].url,
              data: null,
              error: null,
              loading: false
            };
          }
          return w;
        })
      })),
      
      reorderWidgets: (widgets) => set(() => ({
        widgets: widgets.map((w, index) => ({ ...w, position: index }))
      })),
      
      setWidgetData: (id, data, error = null) => set((state) => ({
        widgets: state.widgets.map(w => 
          w.id === id 
            ? { ...w, data, error, loading: false, lastUpdated: new Date() }
            : w
        )
      })),
      
      setWidgetLoading: (id, loading) => set((state) => ({
        widgets: state.widgets.map(w => 
          w.id === id ? { ...w, loading } : w
        )
      })),

      exportDashboard: () => {
        const state = get();
        const exportData = {
          version: '2.0',
          timestamp: new Date().toISOString(),
          widgets: state.widgets.map(w => ({
            title: w.title,
            description: w.description,
            apiUrl: w.apiUrl,
            apiEndpoints: w.apiEndpoints,
            currentEndpointIndex: w.currentEndpointIndex,
            apiHeaders: w.apiHeaders,
            refreshInterval: w.refreshInterval,
            fields: w.fields,
            fieldFormats: w.fieldFormats,
            displayMode: w.displayMode,
            chartType: w.chartType,
            timeInterval: w.timeInterval,
            position: w.position
          }))
        };
        return JSON.stringify(exportData, null, 2);
      },

      importDashboard: (config) => {
        try {
          const importData = JSON.parse(config);
          if (!importData.widgets || !Array.isArray(importData.widgets)) {
            throw new Error('Invalid configuration format');
          }
          
          const newWidgets: Widget[] = importData.widgets.map((w: any, index: number) => ({
            ...w,
            id: Date.now().toString() + index,
            data: null,
            loading: false,
            error: null,
            position: index
          }));
          
          set({ widgets: newWidgets });
          return true;
        } catch (error) {
          console.error('Failed to import dashboard:', error);
          return false;
        }
      },

      clearDashboard: () => set({ widgets: [] }),

      loadTemplate: (templateName) => {
        const { dashboardTemplates } = require('@/lib/templates');
        const template = dashboardTemplates.find((t: any) => t.name === templateName);
        
        if (template) {
          const newWidgets: Widget[] = template.widgets.map((w: any, index: number) => ({
            ...w,
            id: Date.now().toString() + index,
            data: null,
            loading: false,
            error: null,
            position: index
          }));
          
          set({ widgets: newWidgets });
        }
      },
    }),
    {
      name: 'dashboard-store',
      partialize: (state) => ({ 
        widgets: state.widgets.map(w => ({
          ...w,
          data: null,
          loading: false,
          error: null
        }))
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.widgets) {
          state.widgets = state.widgets.map(widget => ({
            ...widget,
            lastUpdated: widget.lastUpdated ? new Date(widget.lastUpdated) : undefined,
            data: null,
            loading: false,
            error: null
          }));
        }
      },
    }
  )
);