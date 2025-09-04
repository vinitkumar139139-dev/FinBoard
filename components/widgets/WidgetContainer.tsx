'use client';

import { ReactNode, useState } from 'react';
import { X, MoreVertical, RefreshCw, Settings, AlertCircle, Globe, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboardStore } from '@/stores/dashboardStore';
import { useApiData } from '@/hooks/useApiData';

interface WidgetContainerProps {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
  loading?: boolean;
  error?: string | null;
  lastUpdated?: Date;
  apiUrl?: string;
  apiEndpoints?: Array<{ name: string; url: string; description?: string }>;
  currentEndpointIndex?: number;
}

export const WidgetContainer = ({ 
  id, 
  title, 
  description,
  children, 
  loading = false, 
  error = null,
  lastUpdated,
  apiUrl,
  apiEndpoints,
  currentEndpointIndex
}: WidgetContainerProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const { removeWidget, switchWidgetEndpoint } = useDashboardStore();
  const { refreshWidget } = useApiData();

  const handleRefresh = () => {
    if (apiUrl) {
      refreshWidget(id, apiUrl);
    }
  };

  const handleDelete = () => {
    removeWidget(id);
  };

  const formatLastUpdated = () => {
    if (!lastUpdated || !(lastUpdated instanceof Date)) return '';
    const now = new Date();
    const diff = now.getTime() - lastUpdated.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    return `${minutes} minutes ago`;
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden hover:border-slate-600 transition-colors group">
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex-1">
          <h3 className="text-white font-medium">{title}</h3>
          {description && (
            <p className="text-xs text-slate-400 mt-1">{description}</p>
          )}
          {lastUpdated && (
            <p className="text-xs text-slate-500 mt-1">
              Updated {formatLastUpdated()}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {apiUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="text-slate-400 hover:text-white h-8 w-8 p-0"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          )}
          
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMenu(!showMenu)}
              className="text-slate-400 hover:text-white h-8 w-8 p-0"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            
            {showMenu && (
              <div className="absolute right-0 top-8 bg-slate-800 border border-slate-700 rounded-md py-1 min-w-[180px] z-10">
                <button
                  onClick={handleRefresh}
                  className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 flex items-center"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </button>
                
                {apiEndpoints && apiEndpoints.length > 1 && (
                  <>
                    <div className="px-3 py-1 text-xs text-slate-500 border-t border-slate-700 mt-1">
                      Switch Endpoint
                    </div>
                    {apiEndpoints.map((endpoint, index) => (
                      <button
                        key={index}
                        onClick={() => switchWidgetEndpoint(id, index)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-700 flex items-center ${
                          index === currentEndpointIndex ? 'text-blue-400' : 'text-slate-300'
                        }`}
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        <div>
                          <div className="font-medium">{endpoint.name}</div>
                          {endpoint.description && (
                            <div className="text-xs text-slate-500">{endpoint.description}</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </>
                )}
                
                <button
                  onClick={handleDelete}
                  className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-slate-700 flex items-center border-t border-slate-700 mt-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border border-slate-600 border-t-blue-500 rounded-full"></div>
          </div>
        )}
        
        {error && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}
        
        {!loading && !error && children}
      </div>
    </div>
  );
};