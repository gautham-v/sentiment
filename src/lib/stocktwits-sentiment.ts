interface StockTwitsSentimentData {
  sentiment_score: number;
  mentions_count: number;
  bullish_count: number;
  bearish_count: number;
}

interface SentimentMetric {
  loaded: boolean;
  change: number;
  label: string;
  labelNormalized: string;
  value: number;
  valueNormalized: number;
}

interface StockTwitsSentimentDetail {
  sentiment: {
    now: SentimentMetric;
    "15m": SentimentMetric;
    "24h": SentimentMetric;
  };
  messageVolume: {
    now: SentimentMetric;
    "15m": SentimentMetric;
    "24h": SentimentMetric;
  };
  timeframes: {
    "1D": {
      loaded: boolean;
      sentiment: SentimentMetric;
      messageVolume: SentimentMetric;
    };
    [key: string]: any;
  };
}

interface StockTwitsApiResponse {
  data?: StockTwitsSentimentDetail;
  error?: string;
}

// Parse sentiment data from StockTwits sentiment API response
function parseStockTwitsSentimentDetail(data: StockTwitsSentimentDetail): StockTwitsSentimentData {
  try {
    // Use the current (now) sentiment data as primary
    const currentSentiment = data.sentiment?.now;
    const currentVolume = data.messageVolume?.now;
    
    // Get sentiment score - use valueNormalized (0-100) if available, otherwise convert value
    let sentiment_score = 50; // Default neutral
    
    if (currentSentiment?.loaded) {
      if (currentSentiment.valueNormalized !== undefined && currentSentiment.valueNormalized >= 0) {
        sentiment_score = Math.round(currentSentiment.valueNormalized);
      } else if (currentSentiment.value !== undefined) {
        // Convert from 0-1 scale to 0-100 scale
        sentiment_score = Math.round(currentSentiment.value * 100);
      }
    }
    
    // Get message volume - use the raw value for total mentions
    let mentions_count = 0;
    if (currentVolume?.loaded && currentVolume.value !== undefined) {
      mentions_count = Math.round(currentVolume.value);
    }
    
    // Estimate bullish/bearish breakdown based on sentiment score
    // Higher sentiment score = more bullish messages
    const bullish_ratio = sentiment_score / 100;
    const bullish_count = Math.round(mentions_count * bullish_ratio);
    const bearish_count = mentions_count - bullish_count;

    return {
      sentiment_score,
      mentions_count,
      bullish_count,
      bearish_count
    };
  } catch (error) {
    console.error('Error parsing StockTwits sentiment detail:', error);
    // Return neutral data if parsing fails
    return {
      sentiment_score: 50,
      mentions_count: 0,
      bullish_count: 0,
      bearish_count: 0
    };
  }
}

export async function getStockTwitsSentiment(ticker: string): Promise<{
  sentiment_score: number;
  mentions_count: number;
  bullish_count: number;
  bearish_count: number;
}> {
  try {
    // Map tickers to StockTwits format
    let stocktwitsTicker: string;
    
    if (ticker === 'BTC-USD' || ticker === 'BTC') {
      stocktwitsTicker = 'BTC.X';
    } else if (ticker === 'ETH-USD' || ticker === 'ETH') {
      stocktwitsTicker = 'ETH.X';
    } else {
      // For stocks, use the ticker as-is (remove -USD suffix if present)
      stocktwitsTicker = ticker.replace('-USD', '').toUpperCase();
    }
    
    const apiUrl = `https://sentiment-v2-api.stocktwits.com/sentiment-api/${stocktwitsTicker}/detail`;
    
    console.log(`Fetching StockTwits sentiment from official API: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`StockTwits sentiment API returned ${response.status}`);
    }

    const apiResponse: StockTwitsApiResponse = await response.json();
    
    if (apiResponse.error) {
      throw new Error(`StockTwits API error: ${apiResponse.error}`);
    }
    
    if (!apiResponse.data) {
      throw new Error('No sentiment data returned from StockTwits API');
    }

    const data = parseStockTwitsSentimentDetail(apiResponse.data);
    
    console.log(`StockTwits sentiment API data for ${ticker}: sentiment=${data.sentiment_score}%, bullish=${data.bullish_count}, bearish=${data.bearish_count}, total=${data.mentions_count}`);
    
    return data;

  } catch (error) {
    console.error(`Error fetching StockTwits sentiment for ${ticker}:`, error);
    
    // Return neutral data on error instead of mock data
    return {
      sentiment_score: 50,
      mentions_count: 0,
      bullish_count: 0,
      bearish_count: 0
    };
  }
}