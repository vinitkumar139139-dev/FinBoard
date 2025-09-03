'use client';

import { useState, useEffect } from 'react';
import { Bell, Settings, RefreshCw, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApiData } from '@/hooks/useApiData';
import { useDashboardStore } from '@/stores/dashboardStore';

export const Header = () => {
  const { refreshAllWidgets } = useApiData();
  const widgets = useDashboardStore(state => state.widgets);
  const { theme, toggleTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState('');
  
  const handleRefreshAll = () => {
    refreshAllWidgets();
  };

  const connectedWidgets = widgets.filter(w => w.apiUrl && !w.error).length;

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString());
  }, []);
  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-xl font-bold text-white">My Trading Dashboard</h1>
          <div className="flex items-center space-x-4 mt-1">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-400">Live Data</span>
            </div>
            {currentTime && (
              <span className="text-sm text-slate-500">
                Updated {currentTime}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshAll}
          disabled={widgets.length === 0}
          className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh All
        </Button>
        
        <div className="flex items-center space-x-2">
          <Badge 
            variant={connectedWidgets > 0 ? "default" : "secondary"}
            className={connectedWidgets > 0 ? "bg-green-600" : ""}
          >
            {connectedWidgets > 0 ? "API Connected" : "No Connection"}
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleTheme}
            className="text-slate-400 hover:text-white"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
            <Bell className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              const { exportDashboard } = useDashboardStore.getState();
              const config = exportDashboard();
              const blob = new Blob([config], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `finboard-dashboard-${new Date().toISOString().split('T')[0]}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="text-slate-400 hover:text-white"
            title="Export Dashboard"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};