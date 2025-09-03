import { useEffect, useCallback } from 'react';
import { useDashboardStore } from '@/stores/dashboardStore';

const dataCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

export const useApiData = () => {
  const { widgets, setWidgetData, setWidgetLoading } = useDashboardStore();

  const fetchWidgetData = useCallback(async (widgetId: string, apiUrl: string) => {
    const widget = widgets.find(w => w.id === widgetId);
    const cacheKey = apiUrl;
    const cached = dataCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setWidgetData(widgetId, cached.data);
      return;
    }

    setWidgetLoading(widgetId, true);
    
    try {
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
          ...(widget?.apiHeaders || {})
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Cache the data
      dataCache.set(cacheKey, { data, timestamp: Date.now() });
      
      setWidgetData(widgetId, data);
    } catch (error) {
      setWidgetData(widgetId, null, error instanceof Error ? error.message : 'Failed to fetch data');
    }
  }, [setWidgetData, setWidgetLoading]);

  const refreshWidget = useCallback((widgetId: string, apiUrl: string) => {
    fetchWidgetData(widgetId, apiUrl);
  }, [fetchWidgetData]);

  const refreshAllWidgets = useCallback(() => {
    widgets.forEach(widget => {
      if (widget.apiUrl) {
        fetchWidgetData(widget.id, widget.apiUrl);
      }
    });
  }, [widgets, fetchWidgetData]);

  // Auto-refresh widgets based on their intervals
  useEffect(() => {
    const intervals = widgets.map(widget => {
      if (widget.apiUrl && widget.refreshInterval > 0) {
        return setInterval(() => {
          fetchWidgetData(widget.id, widget.apiUrl);
        }, widget.refreshInterval * 1000);
      }
      return null;
    }).filter(Boolean);

    return () => {
      intervals.forEach(interval => {
        if (interval) clearInterval(interval);
      });
    };
  }, [widgets, fetchWidgetData]);

  // Initial data fetch for new widgets
  useEffect(() => {
    widgets.forEach(widget => {
      if (widget.apiUrl && !widget.data && !widget.loading && !widget.error) {
        fetchWidgetData(widget.id, widget.apiUrl);
      }
    });
  }, [widgets, fetchWidgetData]);

  return {
    refreshWidget,
    refreshAllWidgets,
    fetchWidgetData,
  };
};