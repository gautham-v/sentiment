interface NewsArticle {
  title: string;
  url: string;
  time_published: string;
  overall_sentiment_score: number;
  overall_sentiment_label: string;
  ticker_sentiment?: Array<{
    ticker: string;
    relevance_score: string;
    ticker_sentiment_score: string;
    ticker_sentiment_label: string;
  }>;
}

interface AlphaVantageResponse {
  items?: string;
  sentiment_score_definition?: string;
  relevance_score_definition?: string;
  feed?: NewsArticle[];
  Information?: string;
  Note?: string;
}

interface NewsSentimentData {
  sentiment_score: number;
  article_count: number;
  bullish_count: number;
  bearish_count: number;
  neutral_count: number;
}

// Get API key from environment or use demo key for testing
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || process.env.FINANCIAL_API_KEY || 'demo';

// Calculate sentiment score from news articles
function calculateNewsSentiment(articles: NewsArticle[], ticker: string): NewsSentimentData {
  if (!articles || articles.length === 0) {
    return {
      sentiment_score: 50, // Neutral if no articles
      article_count: 0,
      bullish_count: 0,
      bearish_count: 0,
      neutral_count: 0
    };
  }

  let totalScore = 0;
  let validArticles = 0;
  let bullish_count = 0;
  let bearish_count = 0;
  let neutral_count = 0;

  articles.forEach(article => {
    // Check if this article has specific sentiment for our ticker
    const tickerSentiment = article.ticker_sentiment?.find(
      ts => ts.ticker.toUpperCase() === ticker.toUpperCase()
    );

    let sentimentScore: number;
    let sentimentLabel: string;

    if (tickerSentiment) {
      // Use ticker-specific sentiment if available
      sentimentScore = parseFloat(tickerSentiment.ticker_sentiment_score);
      sentimentLabel = tickerSentiment.ticker_sentiment_label;
    } else {
      // Otherwise use overall sentiment
      sentimentScore = article.overall_sentiment_score;
      sentimentLabel = article.overall_sentiment_label;
    }

    // Only count articles with valid sentiment scores
    if (!isNaN(sentimentScore)) {
      totalScore += sentimentScore;
      validArticles++;

      // Count sentiment categories
      if (sentimentLabel.toLowerCase().includes('bullish')) {
        bullish_count++;
      } else if (sentimentLabel.toLowerCase().includes('bearish')) {
        bearish_count++;
      } else {
        neutral_count++;
      }
    }
  });

  if (validArticles === 0) {
    return {
      sentiment_score: 50,
      article_count: articles.length,
      bullish_count: 0,
      bearish_count: 0,
      neutral_count: 0
    };
  }

  // Calculate average sentiment score
  const avgScore = totalScore / validArticles;
  
  // Convert from Alpha Vantage scale (-1 to 1) to our scale (0 to 100)
  // -1 = 0 (most bearish), 0 = 50 (neutral), 1 = 100 (most bullish)
  const normalizedScore = Math.round(((avgScore + 1) / 2) * 100);

  return {
    sentiment_score: Math.max(0, Math.min(100, normalizedScore)),
    article_count: validArticles,
    bullish_count,
    bearish_count,
    neutral_count
  };
}

export async function getNewsSentiment(ticker: string): Promise<{
  sentiment_score: number;
  article_count: number;
  bullish_count: number;
  bearish_count: number;
  neutral_count: number;
}> {
  try {
    // Clean ticker for Alpha Vantage (handles crypto format)
    let cleanTicker = ticker.replace('-USD', '');
    
    // For crypto, Alpha Vantage uses CRYPTO:BTC format
    if (ticker === 'BTC-USD' || ticker === 'BTC') {
      cleanTicker = 'CRYPTO:BTC';
    } else if (ticker === 'ETH-USD' || ticker === 'ETH') {
      cleanTicker = 'CRYPTO:ETH';
    }

    const apiUrl = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${cleanTicker}&limit=50&apikey=${ALPHA_VANTAGE_API_KEY}`;
    
    console.log(`Fetching news sentiment from Alpha Vantage: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Alpha Vantage API returned ${response.status}`);
    }

    const data: AlphaVantageResponse = await response.json();
    
    // Check for API limits or errors
    if (data.Information || data.Note) {
      console.warn(`Alpha Vantage API message: ${data.Information || data.Note}`);
      // Return neutral sentiment if API limit reached
      return {
        sentiment_score: 50,
        article_count: 0,
        bullish_count: 0,
        bearish_count: 0,
        neutral_count: 0
      };
    }

    if (!data.feed || data.feed.length === 0) {
      console.log(`No news articles found for ${ticker}`);
      return {
        sentiment_score: 50,
        article_count: 0,
        bullish_count: 0,
        bearish_count: 0,
        neutral_count: 0
      };
    }

    const sentimentData = calculateNewsSentiment(data.feed, cleanTicker);
    
    console.log(`Alpha Vantage news sentiment for ${ticker}: score=${sentimentData.sentiment_score}%, articles=${sentimentData.article_count} (${sentimentData.bullish_count} bullish, ${sentimentData.neutral_count} neutral, ${sentimentData.bearish_count} bearish)`);
    
    return sentimentData;

  } catch (error) {
    console.error(`Error fetching news sentiment for ${ticker}:`, error);
    // Return neutral sentiment on error
    return {
      sentiment_score: 50,
      article_count: 0,
      bullish_count: 0,
      bearish_count: 0,
      neutral_count: 0
    };
  }
}