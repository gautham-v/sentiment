import { getRedditSentiment } from './reddit-sentiment';
import { getStockTwitsSentiment } from './stocktwits-sentiment';
import { getNewsSentiment } from './news-sentiment';

interface GrokSentimentResponse {
  sentiment_score: number;          // 0-100
  confidence: number;               // 0-100  
  status: 'bullish' | 'neutral' | 'bearish';
  insights: string;                 // 2-3 sentences explaining reasoning
  volume_signal: string;            // market volume assessment
  momentum: string;                 // price momentum indicator
  key_factors: string[];            // main drivers of sentiment
  sources_analyzed: number;         // actual source count
  mentions_count: number;           // actual mention count
  sentiment_cases?: {               // Sentiment cases for different scenarios
    bullish: string;
    bearish: string;
    neutral: string;
  };
}

const GROK_API_KEY = process.env.GROK_API_KEY;
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

export async function analyzeSentiment(
  ticker: string, 
  name: string,
  assetType?: string
): Promise<GrokSentimentResponse> {
  try {
    // Get Reddit, StockTwits, and News sentiment
    const [redditData, stocktwitsData, newsData] = await Promise.all([
      getRedditSentiment(ticker, assetType),
      getStockTwitsSentiment(ticker),
      getNewsSentiment(ticker)
    ]);
    
    console.log(`Reddit sentiment for ${ticker}: Score=${redditData.sentiment_score}, Mentions=${redditData.mentions_count}`);
    console.log(`StockTwits sentiment for ${ticker}: Score=${stocktwitsData.sentiment_score}%, Messages=${stocktwitsData.mentions_count}`);
    console.log(`News sentiment for ${ticker}: Score=${newsData.sentiment_score}%, Articles=${newsData.article_count}`);
    
    const totalDataPoints = redditData.mentions_count + stocktwitsData.mentions_count + newsData.article_count;
    
    // Calculate combined sentiment using 40/40/20 approach with Reddit minimum 10%
    let combinedSentiment: number;
    if (totalDataPoints === 0) {
      combinedSentiment = 50;
    } else {
      // Calculate proportional weights but ensure Reddit gets minimum 10%
      let redditWeight = redditData.mentions_count / totalDataPoints;
      let stocktwitsWeight = stocktwitsData.mentions_count / totalDataPoints;
      let newsWeight = newsData.article_count / totalDataPoints;
      
      // Ensure Reddit weight is at least 10%
      if (redditWeight < 0.1) {
        const deficit = 0.1 - redditWeight;
        redditWeight = 0.1;
        
        // Redistribute the deficit proportionally from other sources
        const otherTotal = stocktwitsWeight + newsWeight;
        if (otherTotal > 0) {
          const reductionFactor = (1 - redditWeight) / otherTotal;
          stocktwitsWeight *= reductionFactor;
          newsWeight *= reductionFactor;
        }
      }
      
      combinedSentiment = Math.round(
        redditData.sentiment_score * redditWeight + 
        stocktwitsData.sentiment_score * stocktwitsWeight + 
        newsData.sentiment_score * newsWeight
      );
    }
    
    let status: 'bullish' | 'neutral' | 'bearish';
    if (combinedSentiment >= 70) {
      status = 'bullish';
    } else if (combinedSentiment >= 40) {
      status = 'neutral';
    } else {
      status = 'bearish';
    }
    
    const confidence = Math.min(95, Math.max(50, 50 + Math.log10(totalDataPoints + 1) * 15));
    
    // Generate AI analysis cases using Grok (only for analysis, not sentiment calculation)
    let sentimentCases = {
      bullish: `Bullish case for ${name}: Strong business fundamentals with expanding market opportunities. Revenue growth and product innovation position the company well for future gains.`,
      bearish: `Bearish case for ${name}: Facing competitive pressures and market headwinds. Margin compression and regulatory challenges may limit near-term growth potential.`,
      neutral: `Neutral case for ${name}: Stable business operations with balanced risk-reward profile. Upcoming earnings and strategic initiatives will determine future direction.`
    };
    
    if (GROK_API_KEY) {
      console.log(`🔑 Grok API key found, attempting AI analysis for ${ticker}...`);
      try {
        const currentDate = new Date().toISOString().split('T')[0];
        const prompt = `You are a fundamental analyst. Today's date is ${currentDate}. 

Use live search to analyze ${name} (${ticker}) focusing ONLY on fundamentals:
- Latest earnings reports and revenue/profit trends
- Business developments and product launches
- Competitive positioning and market share
- Management changes and strategic initiatives
- Industry trends and regulatory environment

Provide fundamental analysis in this exact JSON structure. Keep each case to 2-3 sentences focusing on business fundamentals only:

{
  "sentiment_cases": {
    "bullish": "<Bullish fundamental case: Focus on revenue growth, earnings beats, product innovation, market expansion, competitive advantages. Max 3 sentences.>",
    "bearish": "<Bearish fundamental case: Focus on revenue decline, margin pressure, competitive threats, regulatory risks, market saturation. Max 3 sentences.>",
    "neutral": "<Neutral fundamental case: Focus on stable business metrics, balanced growth outlook, upcoming earnings/product launches to watch. Max 3 sentences.>"
  }
}

IMPORTANT: Do NOT mention stock prices, price targets, or technical analysis. Focus exclusively on business fundamentals and company performance.`;

        const response = await fetch(GROK_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROK_API_KEY}`
          },
          body: JSON.stringify({
            model: 'grok-3-mini',
            messages: [{
              role: 'user',
              content: prompt
            }],
            temperature: 0.3,
            max_tokens: 2500,
            live_search: true  // Enable live search for current data
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices[0].message.content;
          
          // Clean and parse the JSON response
          let cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
          
          try {
            const grokAnalysis = JSON.parse(cleanContent);
            if (grokAnalysis.sentiment_cases) {
              sentimentCases = grokAnalysis.sentiment_cases;
              console.log(`✅ Grok AI analysis cases received for ${ticker}`);
            }
          } catch (parseError) {
            console.warn(`Failed to parse Grok analysis for ${ticker}, using fallback cases`);
          }
        }
        
      } catch (grokError) {
        console.warn(`Grok API error for ${ticker}, using fallback analysis cases:`, grokError instanceof Error ? grokError.message : String(grokError));
      }
    }
    
    let insights = '';
    if (status === 'bullish') {
      insights = `Strong positive sentiment across all sources. Reddit: ${redditData.mentions_count} mentions (${redditData.sentiment_score}%), StockTwits: ${stocktwitsData.mentions_count} messages (${stocktwitsData.sentiment_score}%), News: ${newsData.article_count} articles (${newsData.sentiment_score}%). Overall market sentiment is optimistic about ${name}.`;
    } else if (status === 'bearish') {
      insights = `Negative sentiment detected across sources. Reddit: ${redditData.mentions_count} mentions (${redditData.sentiment_score}%), StockTwits: ${stocktwitsData.mentions_count} messages (${stocktwitsData.sentiment_score}%), News: ${newsData.article_count} articles (${newsData.sentiment_score}%). Market sentiment is cautious or pessimistic about ${name}.`;
    } else {
      insights = `Mixed sentiment across sources. Reddit: ${redditData.mentions_count} mentions (${redditData.sentiment_score}%), StockTwits: ${stocktwitsData.mentions_count} messages (${stocktwitsData.sentiment_score}%), News: ${newsData.article_count} articles (${newsData.sentiment_score}%). Market opinion appears divided on ${name}.`;
    }
    
    let volumeSignal = 'normal';
    if (redditData.rank > 0 && redditData.rank <= 5) {
      volumeSignal = 'significantly increasing';
    } else if (redditData.rank > 5 && redditData.rank <= 10) {
      volumeSignal = 'increasing';
    }
    
    let momentum = 'steady';
    if (status === 'bullish' && confidence > 70) {
      momentum = 'strong upward';
    } else if (status === 'bearish') {
      momentum = 'weakening';
    }
    
    const sentimentData: GrokSentimentResponse = {
      sentiment_score: combinedSentiment,
      confidence: Math.round(confidence),
      status,
      insights,
      volume_signal: volumeSignal,
      momentum,
      key_factors: [
        `Combined sentiment: ${status}`,
        `Reddit: ${redditData.mentions_count} mentions (${redditData.sentiment_score}%)`,
        `StockTwits: ${stocktwitsData.mentions_count} messages (${stocktwitsData.sentiment_score}%)`,
        `News: ${newsData.article_count} articles (${newsData.sentiment_score}%)`,
        redditData.rank > 0 ? `Reddit trending rank: #${redditData.rank}` : 'Not trending on Reddit'
      ],
      sources_analyzed: 3,
      mentions_count: totalDataPoints,
      sentiment_cases: sentimentCases
    };
    
    console.log(`✅ Calculated sentiment for ${ticker}: Score=${sentimentData.sentiment_score}, Status=${sentimentData.status}`);
    return sentimentData;

  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    
    return {
      sentiment_score: 50,
      confidence: 50,
      status: 'neutral',
      insights: 'Unable to perform detailed analysis at this time. Market conditions appear neutral.',
      volume_signal: 'normal',
      momentum: 'steady',
      key_factors: ['Analysis unavailable'],
      sources_analyzed: 0,
      mentions_count: 0,
      sentiment_cases: {
        bullish: `Bullish case for ${name}: Monitor for earnings growth, product launches, and market expansion opportunities that could drive performance.`,
        bearish: `Bearish case for ${name}: Watch for competitive threats, margin pressure, and regulatory challenges that could impact growth.`,
        neutral: `Neutral case for ${name}: Balanced fundamentals suggest monitoring upcoming earnings and strategic developments for clearer direction.`
      }
    };
  }
}

export type { GrokSentimentResponse };