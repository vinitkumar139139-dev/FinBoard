'use client';

import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { WidgetGrid } from '@/components/dashboard/WidgetGrid';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <WidgetGrid />
      </div>
    </div>
  );
}