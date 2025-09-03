import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Widget {
  id: string;
  title: string;
  apiUrl: string;
  apiHeaders?: Record<string, string>;
  refreshInterval: number; // in seconds
  fields: string[];
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
  reorderWidgets: (widgets: Widget[]) => void;
  setWidgetData: (id: string, data: any, error?: string | null) => void;
  setWidgetLoading: (id: string, loading: boolean) => void;
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