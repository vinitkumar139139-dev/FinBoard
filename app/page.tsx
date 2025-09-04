'use client';

import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { WidgetGrid } from '@/components/dashboard/WidgetGrid';

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      <div className="lg:w-64 flex-shrink-0">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col">
        <Header />
        <WidgetGrid />
      </div>
    </div>
  );
}