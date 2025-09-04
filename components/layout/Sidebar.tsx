'use client';

import { useState } from 'react';
import { Plus, BarChart3, TrendingUp, DollarSign, Activity, PieChart, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddWidgetModal } from '@/components/widgets/AddWidgetModal';
import { useDashboardStore } from '@/stores/dashboardStore';

const widgetCategories = [
  {
    title: 'WIDGETS',
    items: [
      { name: 'Stock Table', description: 'Paginated stock data', icon: BarChart3 },
      { name: 'Watchlist Card', description: 'Your tracked stocks', icon: Target },
      { name: 'Market Gainers', description: 'Top performing stocks', icon: TrendingUp },
      { name: 'Line Chart', description: 'Price trend analysis', icon: Activity, type: 'line_chart' },
      { name: 'Candlestick Chart', description: 'OHLC price data', icon: BarChart3, type: 'candlestick_chart' },
      { name: 'Performance Metrics', description: 'Portfolio analytics', icon: PieChart, type: 'performance_metrics' },
    ]
  },
  {
    title: 'TEMPLATES',
    items: [
      { name: 'Trading Dashboard', description: '', icon: DollarSign },
      { name: 'Portfolio Overview', description: '', icon: PieChart },
      { name: 'Crypto Dashboard', description: '', icon: TrendingUp },
    ]
  }
];

export const Sidebar = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <>
      <aside className="w-full lg:w-64 bg-card border-r border-border h-auto lg:h-screen overflow-y-auto">
        <div className="p-4 border-b border-border lg:block hidden">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-foreground font-bold">FinBoard</h2>
              <p className="text-xs text-muted-foreground">Finance Dashboard</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mb-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Widget
          </Button>

          {widgetCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-6">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                {category.title}
              </h3>
              <div className="space-y-1">
                {category.items.map((item, itemIndex) => (
                  <button
                    key={itemIndex}
                    className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors group"
                    onClick={() => {
                      if (category.title === 'TEMPLATES') {
                        // Load template
                        const { loadTemplate } = useDashboardStore.getState();
                        loadTemplate(item.name);
                      } else {
                        setIsAddModalOpen(true);
                      }
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary mt-0.5 transition-colors" />
                      <div>
                        <p className="text-sm text-foreground group-hover:text-foreground transition-colors">
                          {item.name}
                        </p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <AddWidgetModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </>
  );
};