'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { WidgetContainer } from '@/components/widgets/WidgetContainer';
import { WidgetTableView } from '@/components/widgets/WidgetTableView';
import { WidgetCardView } from '@/components/widgets/WidgetCardView';
import { WidgetChartView } from '@/components/widgets/WidgetChartView';
import { WidgetPerformanceView } from '@/components/widgets/WidgetPerformanceView';
import { useDashboardStore } from '@/stores/dashboardStore';
import { AddWidgetModal } from '@/components/widgets/AddWidgetModal';

export const WidgetGrid = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { widgets, reorderWidgets } = useDashboardStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    reorderWidgets(items);
  };

  if (!mounted) {
    return (
      <div className="flex-1 p-4 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
          {/* Loading skeleton */}
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-muted rounded-lg h-64 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (widgets.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl text-muted-foreground mb-2">Your dashboard is empty</h3>
          <p className="text-muted-foreground/70 mb-6">Drag widgets from the sidebar to get started</p>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Widget
          </Button>
        </div>
        
        <AddWidgetModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
        />
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="widgets">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6"
            >
              {widgets
                .sort((a, b) => a.position - b.position)
                .map((widget, index) => (
                  <Draggable key={widget.id} draggableId={widget.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`transition-transform ${
                          snapshot.isDragging ? 'rotate-2 scale-105' : ''
                        }`}
                      >
                        <WidgetContainer
                          id={widget.id}
                          title={widget.title}
                          description={widget.description}
                          loading={widget.loading}
                          error={widget.error}
                          lastUpdated={widget.lastUpdated}
                          apiUrl={widget.apiUrl}
                          apiEndpoints={widget.apiEndpoints}
                          currentEndpointIndex={widget.currentEndpointIndex}
                        >
                          {widget.displayMode === 'card' ? (
                            <WidgetCardView
                              data={widget.data}
                              fields={widget.fields}
                              title={widget.title}
                              fieldFormats={widget.fieldFormats}
                            />
                          ) : widget.displayMode === 'chart' ? (
                            <>
                              {widget.chartType === 'performance' ? (
                                <WidgetPerformanceView
                                  data={widget.data}
                                  fields={widget.fields}
                                  title={widget.title}
                                />
                              ) : (
                                <WidgetChartView
                                  data={widget.data}
                                  fields={widget.fields}
                                  title={widget.title}
                                  chartType={widget.chartType || 'line'}
                                  timeInterval={widget.timeInterval || 'daily'}
                                />
                              )}
                            </>
                          ) : (
                            <WidgetTableView
                              data={widget.data}
                              fields={widget.fields}
                              title={widget.title}
                              fieldFormats={widget.fieldFormats}
                              displayMode={widget.displayMode}
                            />
                          )}
                        </WidgetContainer>
                      </div>
                    )}
                  </Draggable>
                ))}
              {provided.placeholder}
              
              {/* Add Widget Card */}
              <div
                className="border-2 border-dashed border-border rounded-lg p-6 md:p-8 flex items-center justify-center hover:border-muted-foreground/40 transition-colors cursor-pointer"
                onClick={() => setIsAddModalOpen(true)}
              >
                <div className="text-center">
                  <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-foreground font-medium">Add Widget</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Connect to a finance API and create a custom widget
                  </p>
                </div>
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
      
      <AddWidgetModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
};