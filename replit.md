# FinBoard - Financial Dashboard

## Overview
FinBoard is a modern financial dashboard application built with Next.js, React, and TypeScript. It allows users to create customizable widgets for tracking financial data through API integrations.

## Recent Changes
- **September 3, 2025**: Successfully imported from GitHub and configured for Replit environment
  - Installed all dependencies (Next.js 13.5.1, React 18, TypeScript, Tailwind CSS, Radix UI components)
  - Updated Next.js configuration for Replit proxy compatibility
  - Set up development workflow on port 5000 with proper host binding (0.0.0.0)
  - Configured deployment settings for autoscale production deployment
  - Added cache control headers for proper development behavior

## Project Architecture
- **Framework**: Next.js 13 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom dark theme
- **State Management**: Zustand with persistence
- **UI Components**: Radix UI with custom styling
- **Drag & Drop**: @hello-pangea/dnd for widget reordering
- **Charts**: Recharts for data visualization

### Key Features
- Drag-and-drop widget management
- Multiple display modes (card, table, chart)
- API data integration with custom headers
- Real-time refresh functionality
- Persistent dashboard configuration
- Responsive design

### File Structure
- `app/` - Next.js App Router pages
- `components/` - React components (dashboard, layout, widgets, UI)
- `stores/` - Zustand state management
- `hooks/` - Custom React hooks for API data
- `lib/` - Utilities and services

## Development Setup
- **Development Server**: `npm run dev -- --hostname 0.0.0.0 --port 5000`
- **Build**: `npm run build`
- **Production**: `npm start`
- **Port**: 5000 (configured for Replit environment)

## Deployment Configuration
- **Target**: Autoscale (stateless web application)
- **Build Command**: `npm run build`
- **Run Command**: `npm start`

## Current Status
✅ Dependencies installed and configured
✅ Development server running successfully
✅ Application compiling and serving correctly
✅ Deployment configuration completed
✅ Ready for development and customization

## Notes
- Some TypeScript warnings exist in drag-and-drop components but don't affect functionality
- Application uses dark theme optimized for financial data display
- Widget state is persisted locally using Zustand middleware