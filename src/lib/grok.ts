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
    
    // If we have the Grok API key, use AI-powered analysis
    if (GROK_API_KEY) {
      try {
        const currentDate = new Date().toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        });
        
        const prompt = `You are a financial analyst providing comprehensive analysis for ${name} (${ticker}) on ${currentDate}.

As a professional analyst, provide fundamental and technical analysis based on:
- Recent earnings reports and financial performance
- Latest company news, product launches, and strategic developments
- Industry trends and competitive positioning
- Macroeconomic factors and sector outlook
- Technical chart patterns and price action

Reference data: Social sentiment shows ${redditData.mentions_count} Reddit mentions, ${stocktwitsData.mentions_count} StockTwits messages, and ${newsData.article_count} news articles.

Provide a comprehensive financial analysis with this exact JSON structure:
{
  "sentiment_score": <0-100 based on fundamental outlook and market conditions>,
  "confidence": <0-100 confidence level>,
  "status": "<bullish|neutral|bearish>",
  "insights": "<2-3 sentences explaining the investment thesis based on fundamentals and news>",
  "volume_signal": "<e.g., significantly increasing, normal, declining>",
  "momentum": "<e.g., strong upward, steady, weakening>",
  "key_factors": [<3-5 key fundamental and technical factors>],
  "sentiment_cases": {
    "bullish": "<Detailed bullish investment case based on: (1) Strong fundamentals like revenue growth, earnings beats, new product cycles (2) Positive industry trends and market positioning (3) Technical breakouts above key resistance levels (4) Upcoming catalysts like earnings dates, product launches, or regulatory approvals. Include specific price targets and timeframes.>",
    "bearish": "<Detailed bearish investment case based on: (1) Fundamental concerns like slowing growth, margin pressure, or competitive threats (2) Industry headwinds or regulatory risks (3) Technical breakdown below support levels (4) Upcoming risks like earnings misses, product delays, or market saturation. Include specific downside targets and key levels to watch.>",
    "neutral": "<Balanced investment case explaining: (1) Mixed fundamental signals with both strengths and concerns (2) Range-bound technical patterns with unclear direction (3) Upcoming events that could provide clarity (earnings, FDA approvals, product launches) (4) Key price levels that would trigger bullish or bearish scenarios. Include specific levels to monitor.>"
  }
}

CRITICAL: Base your analysis on actual market fundamentals, not social media sentiment. Focus on:
- Company financial health and growth prospects
- Industry dynamics and competitive advantages
- Recent earnings, guidance, and analyst upgrades/downgrades
- Technical analysis of price trends and key levels
- Macroeconomic factors affecting the ${assetType === 'crypto' ? 'cryptocurrency' : 'equity'} markets
- Specific upcoming events and their potential market impact

Provide actionable investment insights with specific price levels, dates, and catalysts.`;

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
            max_tokens: 1200
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Grok API error response:', errorText);
          throw new Error(`Grok API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        // Clean and parse the JSON response
        const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
        const grokAnalysis = JSON.parse(cleanContent);
        
        const sentimentData: GrokSentimentResponse = {
          sentiment_score: grokAnalysis.sentiment_score,
          confidence: grokAnalysis.confidence,
          status: grokAnalysis.status,
          insights: grokAnalysis.insights,
          volume_signal: grokAnalysis.volume_signal,
          momentum: grokAnalysis.momentum,
          key_factors: grokAnalysis.key_factors,
          sources_analyzed: 3,
          mentions_count: totalDataPoints,
          sentiment_cases: grokAnalysis.sentiment_cases
        };
        
        console.log(`✅ Grok AI sentiment for ${ticker}: Score=${sentimentData.sentiment_score}, Status=${sentimentData.status}`);
        return sentimentData;
        
      } catch (grokError) {
        console.error('Grok API error, falling back to calculated sentiment:', grokError);
        // Fall through to calculated sentiment below
      }
    }
    
    // Fallback: Calculate sentiment if Grok API is not available
    let combinedSentiment: number;
    if (totalDataPoints === 0) {
      combinedSentiment = 50;
    } else {
      const redditWeight = redditData.mentions_count / totalDataPoints;
      const stocktwitsWeight = stocktwitsData.mentions_count / totalDataPoints;
      const newsWeight = newsData.article_count / totalDataPoints;
      
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
    
    // Basic fallback sentiment cases
    const sentimentCases = {
      bullish: `Bullish case for ${name}: Positive social sentiment with ${totalDataPoints} total mentions. Key factors include strong community engagement and positive news flow. Watch for continued momentum and technical breakouts.`,
      bearish: `Bearish case for ${name}: Market volatility and mixed signals may pressure the stock. Consider profit-taking levels and potential resistance areas. Monitor for any negative developments.`,
      neutral: `Neutral case for ${name}: Balanced sentiment across sources suggests consolidation. Watch for clear directional catalysts or volume breakouts to confirm the next move.`
    };
    
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
        bullish: `Bullish case for ${name}: Monitor for positive developments and technical breakouts that could drive momentum higher.`,
        bearish: `Bearish case for ${name}: Watch for potential risks and resistance levels that could limit upside movement.`,
        neutral: `Neutral case for ${name}: Balanced outlook suggests waiting for clearer directional signals before taking positions.`
      }
    };
  }
}

export type { GrokSentimentResponse };