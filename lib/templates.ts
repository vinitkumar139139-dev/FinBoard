export interface DashboardTemplate {
  name: string;
  description: string;
  widgets: Array<{
    title: string;
    apiUrl: string;
    apiHeaders?: Record<string, string>;
    refreshInterval: number;
    fields: string[];
    displayMode: 'card' | 'table' | 'chart';
    chartType?: 'line' | 'candlestick' | 'performance';
    timeInterval?: 'daily' | 'weekly' | 'monthly';
    position: number;
  }>;
}

export const dashboardTemplates: DashboardTemplate[] = [
  {
    name: 'Trading Dashboard',
    description: 'Professional trading setup with performance metrics, candlestick charts, and real-time data',
    widgets: [
      {
        title: 'AAPL Performance Overview',
        apiUrl: 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=AAPL&apikey=demo',
        refreshInterval: 300,
        fields: [
          'Time Series (Daily).*.1. open',
          'Time Series (Daily).*.2. high',
          'Time Series (Daily).*.3. low',
          'Time Series (Daily).*.4. close',
          'Time Series (Daily).*.5. volume'
        ],
        displayMode: 'chart',
        chartType: 'performance',
        timeInterval: 'daily',
        position: 0
      },
      {
        title: 'AAPL Candlestick Chart',
        apiUrl: 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=AAPL&apikey=demo',
        refreshInterval: 300,
        fields: [
          'Time Series (Daily).*.1. open',
          'Time Series (Daily).*.2. high',
          'Time Series (Daily).*.3. low',
          'Time Series (Daily).*.4. close',
          'Time Series (Daily).*.5. volume'
        ],
        displayMode: 'chart',
        chartType: 'candlestick',
        timeInterval: 'daily',
        position: 1
      },
      {
        title: 'IBM Stock Data',
        apiUrl: 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=IBM&apikey=demo',
        refreshInterval: 300,
        fields: [
          'Time Series (Daily).*.1. open',
          'Time Series (Daily).*.2. high',
          'Time Series (Daily).*.3. low',
          'Time Series (Daily).*.4. close',
          'Time Series (Daily).*.5. volume'
        ],
        displayMode: 'table',
        position: 2
      },
      {
        title: 'MSFT Price Cards',
        apiUrl: 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=MSFT&apikey=demo',
        refreshInterval: 300,
        fields: [
          'Time Series (Daily).*.1. open',
          'Time Series (Daily).*.2. high',
          'Time Series (Daily).*.3. low',
          'Time Series (Daily).*.4. close',
          'Time Series (Daily).*.5. volume'
        ],
        displayMode: 'card',
        position: 3
      }
    ]
  },
  {
    name: 'Portfolio Overview',
    description: 'Comprehensive portfolio tracking with performance metrics and detailed analytics',
    widgets: [
      {
        title: 'Portfolio Performance',
        apiUrl: 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=SPY&apikey=demo',
        refreshInterval: 300,
        fields: [
          'Time Series (Daily).*.1. open',
          'Time Series (Daily).*.2. high',
          'Time Series (Daily).*.3. low',
          'Time Series (Daily).*.4. close',
          'Time Series (Daily).*.5. volume'
        ],
        displayMode: 'chart',
        chartType: 'performance',
        timeInterval: 'daily',
        position: 0
      },
      {
        title: 'Tech Stocks Overview',
        apiUrl: 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=AAPL&apikey=demo',
        refreshInterval: 300,
        fields: [
          'Time Series (Daily).*.1. open',
          'Time Series (Daily).*.2. high',
          'Time Series (Daily).*.3. low',
          'Time Series (Daily).*.4. close',
          'Time Series (Daily).*.5. volume'
        ],
        displayMode: 'card',
        position: 1
      },
      {
        title: 'Market Trend Analysis',
        apiUrl: 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=QQQ&apikey=demo',
        refreshInterval: 300,
        fields: [
          'Time Series (Daily).*.1. open',
          'Time Series (Daily).*.2. high',
          'Time Series (Daily).*.3. low',
          'Time Series (Daily).*.4. close',
          'Time Series (Daily).*.5. volume'
        ],
        displayMode: 'chart',
        chartType: 'line',
        timeInterval: 'daily',
        position: 2
      },
      {
        title: 'Holdings Table',
        apiUrl: 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=VTI&apikey=demo',
        refreshInterval: 300,
        fields: [
          'Time Series (Daily).*.1. open',
          'Time Series (Daily).*.2. high',
          'Time Series (Daily).*.3. low',
          'Time Series (Daily).*.4. close',
          'Time Series (Daily).*.5. volume'
        ],
        displayMode: 'table',
        position: 3
      }
    ]
  },
  {
    name: 'Crypto Dashboard',
    description: 'Cryptocurrency tracking with charts, tables, and performance metrics',
    widgets: [
      {
        title: 'Bitcoin Analysis',
        apiUrl: 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=BTC&apikey=demo',
        refreshInterval: 300,
        fields: [
          'Time Series (Daily).*.1. open',
          'Time Series (Daily).*.2. high',
          'Time Series (Daily).*.3. low',
          'Time Series (Daily).*.4. close',
          'Time Series (Daily).*.5. volume'
        ],
        displayMode: 'chart',
        chartType: 'candlestick',
        timeInterval: 'daily',
        position: 0
      },
      {
        title: 'Crypto Performance',
        apiUrl: 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=ETH&apikey=demo',
        refreshInterval: 300,
        fields: [
          'Time Series (Daily).*.1. open',
          'Time Series (Daily).*.2. high',
          'Time Series (Daily).*.3. low',
          'Time Series (Daily).*.4. close',
          'Time Series (Daily).*.5. volume'
        ],
        displayMode: 'chart',
        chartType: 'performance',
        timeInterval: 'daily',
        position: 1
      },
      {
        title: 'Crypto Holdings',
        apiUrl: 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=LTC&apikey=demo',
        refreshInterval: 300,
        fields: [
          'Time Series (Daily).*.1. open',
          'Time Series (Daily).*.2. high',
          'Time Series (Daily).*.3. low',
          'Time Series (Daily).*.4. close',
          'Time Series (Daily).*.5. volume'
        ],
        displayMode: 'table',
        position: 2
      },
      {
        title: 'Alt Coins Overview',
        apiUrl: 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=XRP&apikey=demo',
        refreshInterval: 300,
        fields: [
          'Time Series (Daily).*.1. open',
          'Time Series (Daily).*.2. high',
          'Time Series (Daily).*.3. low',
          'Time Series (Daily).*.4. close',
          'Time Series (Daily).*.5. volume'
        ],
        displayMode: 'card',
        position: 3
      }
    ]
  }
];