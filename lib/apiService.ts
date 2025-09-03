// Centralized API service for financial data
export class FinanceApiService {
  private static readonly ALPHA_VANTAGE_BASE = 'https://www.alphavantage.co/query';
  private static readonly FINNHUB_BASE = 'https://finnhub.io/api/v1';
  private static readonly INDIAN_API_BASE = 'https://stock.indianapi.in';
  
  // API Keys
  private static readonly ALPHA_VANTAGE_KEY = 'demo';
  private static readonly FINNHUB_KEY = 'demo';
  private static readonly INDIAN_API_KEY = 'sk-live-z5XbdhoHMpL0Ob3GP9shU9B2rFFlFRlPTGvrhBEK';

  // Alpha Vantage API methods
  static getAlphaVantageUrl(functionType: string, symbol: string, additionalParams: Record<string, string> = {}) {
    const params = new URLSearchParams({
      function: functionType,
      symbol: symbol,
      apikey: this.ALPHA_VANTAGE_KEY,
      ...additionalParams
    });
    return `${this.ALPHA_VANTAGE_BASE}?${params.toString()}`;
  }

  static getTimeSeriesDaily(symbol: string) {
    return this.getAlphaVantageUrl('TIME_SERIES_DAILY', symbol);
  }

  static getTimeSeriesIntraday(symbol: string, interval: '1min' | '5min' | '15min' | '30min' | '60min' = '5min') {
    return this.getAlphaVantageUrl('TIME_SERIES_INTRADAY', symbol, { interval });
  }

  static getQuote(symbol: string) {
    return this.getAlphaVantageUrl('GLOBAL_QUOTE', symbol);
  }

  static getCompanyOverview(symbol: string) {
    return this.getAlphaVantageUrl('OVERVIEW', symbol);
  }

  // Finnhub API methods
  static getFinnhubUrl(endpoint: string, params: Record<string, string> = {}) {
    const urlParams = new URLSearchParams({
      token: this.FINNHUB_KEY,
      ...params
    });
    return `${this.FINNHUB_BASE}${endpoint}?${urlParams.toString()}`;
  }

  static getFinnhubQuote(symbol: string) {
    return this.getFinnhubUrl('/quote', { symbol });
  }

  static getFinnhubProfile(symbol: string) {
    return this.getFinnhubUrl('/stock/profile2', { symbol });
  }

  static getFinnhubNews(symbol: string) {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return this.getFinnhubUrl('/company-news', { 
      symbol, 
      from: yesterday, 
      to: today 
    });
  }

  // Indian Stock API methods
  static getIndianApiUrl(endpoint: string) {
    return `${this.INDIAN_API_BASE}${endpoint}`;
  }

  static getIndianApiHeaders() {
    return {
      'X-Api-Key': this.INDIAN_API_KEY,
      'Accept': 'application/json'
    };
  }

  static getIndianIPO() {
    return this.getIndianApiUrl('/ipo');
  }

  static getIndianStockPrice(symbol: string) {
    return this.getIndianApiUrl(`/stock/${symbol}`);
  }

  // WebSocket connections
  static createFinnhubWebSocket(symbols: string[], onMessage: (data: any) => void) {
    const ws = new WebSocket('wss://ws.finnhub.io?token=' + this.FINNHUB_KEY);
    
    ws.onopen = () => {
      symbols.forEach(symbol => {
        ws.send(JSON.stringify({ type: 'subscribe', symbol }));
      });
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };
    
    return ws;
  }

  // Predefined API endpoints for quick access
  static getPresetApis() {
    return [
      {
        name: 'Bitcoin Price (Coinbase)',
        url: 'https://api.coinbase.com/v2/exchange-rates?currency=BTC',
        description: 'Real-time Bitcoin exchange rates'
      },
      {
        name: 'IBM Stock Daily (Alpha Vantage)',
        url: this.getTimeSeriesDaily('IBM'),
        description: 'IBM daily stock prices'
      },
      {
        name: 'Apple Stock Quote (Alpha Vantage)',
        url: this.getQuote('AAPL'),
        description: 'Apple stock quote'
      },
      {
        name: 'Tesla Profile (Finnhub)',
        url: this.getFinnhubProfile('TSLA'),
        description: 'Tesla company profile'
      },
      {
        name: 'Indian IPO Data',
        url: this.getIndianIPO(),
        description: 'Current IPO listings in India',
        headers: this.getIndianApiHeaders()
      },
      {
        name: 'Crypto Prices (CoinGecko)',
        url: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,cardano&vs_currencies=usd',
        description: 'Top cryptocurrency prices'
      },
      {
        name: 'Market Status',
        url: 'https://api.polygon.io/v1/marketstatus/now?apikey=demo',
        description: 'Current market status'
      }
    ];
  }

  // Utility method to fetch with proper headers
  static async fetchWithHeaders(url: string, headers: Record<string, string> = {}) {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        ...headers
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }
}