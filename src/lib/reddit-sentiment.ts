interface ApewisdomPageData {
  sentiment_score: number;
  mentions_count: number;
  rank: number;
}

// Function to determine asset type and clean ticker for apewisdom URL
function getApewisdomUrl(ticker: string, assetType?: string): string {
  // Clean ticker - remove USD suffix for crypto
  const cleanTicker = ticker.replace('-USD', '');
  
  // Determine if it's crypto based on common crypto tickers or asset type
  const cryptoTickers = ['BTC', 'ETH', 'DOGE', 'ADA', 'XRP', 'SOL', 'MATIC', 'DOT'];
  const isCrypto = assetType === 'crypto' || cryptoTickers.includes(cleanTicker.toUpperCase());
  
  const category = isCrypto ? 'cryptocurrencies' : 'stocks';
  return `https://apewisdom.io/${category}/${cleanTicker}/`;
}

// Parse sentiment data from apewisdom HTML page
function parseApewisdomData(html: string): ApewisdomPageData {
  try {
    // Extract sentiment score - look for percentage in tile-value or sentiment-related elements
    let sentiment = 50;
    
    // Look for sentiment percentage in various patterns
    const sentimentPatterns = [
      /<div class="tile-value"[^>]*>(\d+)%/i,
      /sentiment[\s\S]*?(\d+)%/i,
      /(\d+)%[\s\S]*?sentiment/i,
      /class="sentiment-bar"[\s\S]*?(\d+)%/i
    ];
    
    for (const pattern of sentimentPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const value = parseInt(match[1]);
        if (value >= 0 && value <= 100) {
          sentiment = value;
          break;
        }
      }
    }
    
    // Extract mentions count - look for mentions, comments, or numeric values in tiles
    let mentions = 0;
    const mentionsPatterns = [
      /(\d+)\s*(?:mentions|comments|posts)/i,
      /<div class="tile-value"[^>]*>(\d+)\s*<span/i
    ];
    
    for (const pattern of mentionsPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        mentions = parseInt(match[1]);
        break;
      }
    }
    
    // Extract rank if available
    const rankMatch = html.match(/rank[\s\S]*?#?(\d+)/i);
    const rank = rankMatch ? parseInt(rankMatch[1]) : 0;
    
    return {
      sentiment_score: sentiment,
      mentions_count: mentions,
      rank: rank
    };
  } catch (error) {
    console.error('Error parsing apewisdom data:', error);
    return {
      sentiment_score: 50,
      mentions_count: 0,
      rank: 0
    };
  }
}

export async function getRedditSentiment(ticker: string, assetType?: string): Promise<{
  sentiment_score: number;
  mentions_count: number;
  rank: number;
}> {
  try {
    const url = getApewisdomUrl(ticker, assetType);
    console.log(`Fetching Reddit sentiment from: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    });

    if (!response.ok) {
      throw new Error(`Apewisdom returned ${response.status}`);
    }

    const html = await response.text();
    const data = parseApewisdomData(html);
    
    console.log(`Apewisdom data for ${ticker}: sentiment=${data.sentiment_score}, mentions=${data.mentions_count}`);
    
    // Return the data (sentiment might be 50 as a valid value from apewisdom)
    return data;
    
    // Fallback: if no data found, return neutral
    console.warn(`No sentiment data found for ${ticker}, returning neutral`);
    return {
      sentiment_score: 50,
      mentions_count: 0,
      rank: 0
    };

  } catch (error) {
    console.error(`Error fetching Reddit sentiment for ${ticker}:`, error);
    // Return neutral sentiment on error
    return {
      sentiment_score: 50,
      mentions_count: 0,
      rank: 0
    };
  }
}