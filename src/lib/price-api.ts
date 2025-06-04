interface PriceData {
  ticker: string;
  price: number;
  change24h: number;
  volume?: number;
}

interface YahooFinanceQuote {
  symbol: string;
  regularMarketPrice: number;
  regularMarketPreviousClose: number;
  regularMarketChangePercent: number;
  regularMarketChange: number;
  regularMarketTime: number;
  regularMarketVolume?: number;
  currency: string;
}

// Yahoo Finance API endpoint
const YAHOO_API_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart/';

// Alternative Yahoo Finance API endpoints for reliability
const YAHOO_API_ALTERNATIVES = [
  'https://query2.finance.yahoo.com/v8/finance/chart/',
  'https://query1.finance.yahoo.com/v7/finance/quote'
];

// Rate limiting for Yahoo Finance (less restrictive than Alpha Vantage)
let lastCallTime = 0;
const MIN_INTERVAL = 500; // 500ms between calls

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const timeSinceLastCall = now - lastCallTime;
  
  if (timeSinceLastCall < MIN_INTERVAL) {
    const waitTime = MIN_INTERVAL - timeSinceLastCall;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastCallTime = Date.now();
  return fetch(url);
}

async function getYahooPrice(ticker: string, isRetry = false): Promise<PriceData | null> {
  try {
    // For crypto, Yahoo uses different symbols
    const yahooTicker = ticker === 'BTC' ? 'BTC-USD' : 
                       ticker === 'ETH' ? 'ETH-USD' : 
                       ticker;
    
    const url = `${YAHOO_API_BASE}${yahooTicker}`;
    console.log(`Fetching price for ${ticker} from Yahoo Finance...`);
    
    const response = await rateLimitedFetch(url);
    
    if (!response.ok) {
      console.warn(`Yahoo Finance returned ${response.status} for ${ticker}`);
      return null;
    }
    
    const data = await response.json();
    const quote = data.chart?.result?.[0]?.meta;
    const indicators = data.chart?.result?.[0]?.indicators?.quote?.[0];
    
    if (!quote || !quote.regularMarketPrice) {
      console.warn(`No price data in Yahoo response for ${ticker}`);
      return null;
    }
    
    const currentPrice = quote.regularMarketPrice;
    const previousClose = quote.previousClose || quote.regularMarketPrice;
    const change24h = ((currentPrice - previousClose) / previousClose) * 100;
    const volume = indicators?.volume?.[indicators.volume.length - 1] || 0;
    
    console.log(`✅ Yahoo Finance price for ${ticker}: $${currentPrice.toFixed(2)} (${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%)`);
    
    return {
      ticker,
      price: currentPrice,
      change24h: parseFloat(change24h.toFixed(2)),
      volume
    };
  } catch (error) {
    console.error(`Yahoo Finance error for ${ticker}:`, error);
    
    // Try alternative endpoint once
    if (!isRetry && YAHOO_API_ALTERNATIVES.length > 0) {
      console.log(`Trying alternative Yahoo endpoint for ${ticker}...`);
      return getYahooQuoteAlternative(ticker);
    }
    
    return null;
  }
}

async function getYahooQuoteAlternative(ticker: string): Promise<PriceData | null> {
  try {
    const yahooTicker = ticker === 'BTC' ? 'BTC-USD' : 
                       ticker === 'ETH' ? 'ETH-USD' : 
                       ticker;
    
    const url = `${YAHOO_API_ALTERNATIVES[1]}?symbols=${yahooTicker}`;
    const response = await rateLimitedFetch(url);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    const quote = data.quoteResponse?.result?.[0];
    
    if (!quote || !quote.regularMarketPrice) {
      return null;
    }
    
    return {
      ticker,
      price: quote.regularMarketPrice,
      change24h: quote.regularMarketChangePercent || 0,
      volume: quote.regularMarketVolume || 0
    };
  } catch (error) {
    console.error(`Alternative Yahoo endpoint failed for ${ticker}:`, error);
    return null;
  }
}

export async function getStockPrice(ticker: string): Promise<PriceData | null> {
  return getYahooPrice(ticker);
}

export async function getCryptoPrice(ticker: string): Promise<PriceData | null> {
  return getYahooPrice(ticker);
}

export async function getPriceData(ticker: string, assetType: 'stock' | 'crypto'): Promise<PriceData | null> {
  return getYahooPrice(ticker);
}

// Batch fetch prices for multiple assets
export async function batchFetchPrices(
  assets: Array<{ ticker: string; assetType: 'stock' | 'crypto' }>
): Promise<Map<string, PriceData>> {
  const priceMap = new Map<string, PriceData>();
  
  // Process all assets with slight delay between calls
  for (const asset of assets) {
    const priceData = await getPriceData(asset.ticker, asset.assetType);
    if (priceData) {
      priceMap.set(asset.ticker, priceData);
    } else {
      console.warn(`No price data available for ${asset.ticker}`);
    }
  }
  
  console.log(`Fetched prices for ${priceMap.size} out of ${assets.length} assets`);
  return priceMap;
}

// Mock data for development/testing - Updated Jan 2025 prices
export function getMockPriceData(ticker: string): PriceData {
  const mockPrices: Record<string, { price: number; volatility: number }> = {
    'NVDA': { price: 149.85, volatility: 0.05 },
    'MSFT': { price: 432.45, volatility: 0.03 },
    'AAPL': { price: 234.67, volatility: 0.025 },
    'GOOGL': { price: 195.34, volatility: 0.03 },
    'AMZN': { price: 225.12, volatility: 0.035 },
    'META': { price: 631.25, volatility: 0.04 },
    'TSLA': { price: 412.35, volatility: 0.08 },
    'NFLX': { price: 934.80, volatility: 0.045 },
    'AMD': { price: 125.43, volatility: 0.05 },
    'INTC': { price: 22.67, volatility: 0.04 },
    'BTC': { price: 104325.50, volatility: 0.1 },
    'ETH': { price: 3842.25, volatility: 0.08 }
  };
  
  const mock = mockPrices[ticker] || { price: 100, volatility: 0.03 };
  const change = (Math.random() - 0.5) * 2 * mock.volatility;
  
  console.log(`Using mock price for ${ticker}: $${mock.price.toFixed(2)}`);
  
  return {
    ticker,
    price: parseFloat((mock.price * (1 + change)).toFixed(2)),
    change24h: parseFloat((change * 100).toFixed(2)),
    volume: Math.floor(Math.random() * 10000000) + 1000000
  };
}

export default {
  getStockPrice,
  getCryptoPrice,
  getPriceData,
  batchFetchPrices,
  getMockPriceData
};