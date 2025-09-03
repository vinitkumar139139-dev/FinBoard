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

- **September 3, 2025**: Enhanced financial dashboard with advanced features
  - **Fixed Candlestick Charts**: Implemented proper OHLC candlestick visualization with green/red bars
  - **Chart Types**: Added Line Chart and Candlestick Chart options with time intervals (Daily, Weekly, Monthly)
  - **Performance Metrics Widget**: Comprehensive overview showing current price, changes, highs/lows, volume, and market trends
  - **Light/Dark Mode Toggle**: Added theme switching functionality with persistent preferences
  - **Data Persistence**: Complete browser storage integration with state recovery across sessions
  - **Export/Import**: Dashboard configuration backup and restore functionality
  - **Dashboard Templates**: Pre-built layouts for Trading Dashboard, Portfolio Overview, and Crypto Dashboard

## Project Architecture
- **Framework**: Next.js 13 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom dark theme
- **State Management**: Zustand with persistence
- **UI Components**: Radix UI with custom styling
- **Drag & Drop**: @hello-pangea/dnd for widget reordering
- **Charts**: Recharts for data visualization

### Key Features
- **Widget Management**: Drag-and-drop reordering and customization
- **Display Modes**: Card view, Table view, and Chart view with multiple visualization options
- **Chart Types**: Line charts, Candlestick charts, and Performance metrics dashboards
- **Time Intervals**: Daily, Weekly, and Monthly data visualization
- **API Integration**: Custom headers, real-time refresh, and automatic data processing
- **Theme Support**: Light/Dark mode toggle with system preference detection
- **Data Persistence**: Complete browser storage with session recovery
- **Export/Import**: Dashboard configuration backup and sharing
- **Templates**: Pre-built dashboards for different trading scenarios
- **Responsive Design**: Optimized for desktop and mobile devices

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
✅ **Candlestick charts implemented with proper OHLC visualization**
✅ **Light/Dark mode toggle functionality added**
✅ **Data persistence with browser storage integration**
✅ **Export/Import dashboard configurations**
✅ **Pre-built dashboard templates available**
✅ **Performance metrics widget with comprehensive analytics**
✅ Ready for advanced trading analysis and portfolio management

## Features Overview

### Chart Visualization
- **Line Charts**: Multi-line OHLC price visualization with color-coded trends
- **Candlestick Charts**: Professional OHLC candlestick bars (green for gains, red for losses)
- **Performance Metrics**: Comprehensive dashboard showing price changes, volume, market cap, and trend analysis

### Data Management
- **Browser Storage**: All configurations persist across browser sessions
- **State Recovery**: Complete dashboard restoration on page refresh or restart
- **Export/Import**: JSON-based configuration backup and sharing
- **Template System**: One-click dashboard setups for different trading scenarios

### User Experience
- **Theme Toggle**: Seamless switching between light and dark modes
- **Responsive Design**: Optimized for all screen sizes
- **Drag & Drop**: Intuitive widget reordering and customization
- **Real-time Updates**: Automatic data refresh with API integration

## Templates Available
1. **Trading Dashboard**: Performance metrics, candlestick charts, and real-time data tables
2. **Portfolio Overview**: Comprehensive portfolio tracking with analytics and trend analysis
3. **Crypto Dashboard**: Cryptocurrency-focused charts, tables, and performance metrics

## Notes
- All widget configurations are automatically saved to browser storage
- Dashboard templates load instantly from the sidebar Templates section
- Theme preference is remembered across sessions
- Export functionality creates timestamped JSON files for easy backup