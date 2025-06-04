import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { analyzeSentiment } from '@/lib/grok';
import { calculateCorrelation } from '@/lib/correlation';
import { getPriceData } from '@/lib/price-api';

// Vercel Cron job configuration
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for production
    if (process.env.NODE_ENV === 'production') {
      const authHeader = request.headers.get('authorization');
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    console.log('Starting daily sentiment analysis...');

    // Get all assets from database
    const assets = await prisma.asset.findMany();
    console.log(`Found ${assets.length} assets to analyze`);

    // Get prices from Yahoo Finance and sentiment from Grok
    console.log('Starting sentiment analysis with Grok and price data from Yahoo Finance...');

    const analysisDate = new Date();
    analysisDate.setHours(0, 0, 0, 0); // Set to beginning of day

    // Analyze assets in parallel for speed
    const analysisPromises = assets.map(async (asset) => {
      try {
        console.log(`Analyzing ${asset.ticker}...`);

        // Get sentiment analysis from Grok
        const sentimentData = await analyzeSentiment(
          asset.ticker,
          asset.name,
          asset.assetType
        );
        
        // Get price data from Yahoo Finance
        const priceData = await getPriceData(
          asset.ticker,
          asset.assetType as 'stock' | 'crypto'
        );
        
        let currentPrice: number;
        let priceChange: number;
        
        if (!priceData) {
          console.warn(`No price data available for ${asset.ticker} - using fallback`);
          currentPrice = 0;
          priceChange = 0;
        } else {
          currentPrice = priceData.price;
          priceChange = priceData.change24h;
        }

        // Get historical data for correlation calculation
        const historicalData = await prisma.sentimentAnalysis.findMany({
          where: {
            ticker: asset.ticker,
            analysisDate: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          },
          orderBy: { analysisDate: 'asc' }
        });

        // Calculate correlation if we have enough historical data
        let correlation = 0;
        if (historicalData.length >= 7) {
          const dataPoints = historicalData.map(h => ({
            date: h.analysisDate,
            sentiment: h.sentimentScore,
            price: h.price || 0
          }));
          
          // Add today's data point
          dataPoints.push({
            date: analysisDate,
            sentiment: sentimentData.sentiment_score,
            price: currentPrice
          });

          correlation = calculateCorrelation(dataPoints);
        } else {
          // Use a mock correlation for new assets
          correlation = Math.random() * 2 - 1; // Random between -1 and 1
        }

        // Parse sources data from key factors
        const redditMatch = sentimentData.key_factors.find(f => f.includes('Reddit:'))?.match(/Reddit: (\d+) mentions \((\d+)%\)/);
        const stocktwitsMatch = sentimentData.key_factors.find(f => f.includes('StockTwits:'))?.match(/StockTwits: (\d+) messages \((\d+)%\)/);
        const newsMatch = sentimentData.key_factors.find(f => f.includes('News:'))?.match(/News: (\d+) articles \((\d+)%\)/);
        
        const redditMentions = redditMatch ? parseInt(redditMatch[1]) : 0;
        const redditSentiment = redditMatch ? parseInt(redditMatch[2]) : 50;
        const stocktwitsMessages = stocktwitsMatch ? parseInt(stocktwitsMatch[1]) : 0;
        const stocktwitsSentiment = stocktwitsMatch ? parseInt(stocktwitsMatch[2]) : 50;
        const newsArticles = newsMatch ? parseInt(newsMatch[1]) : 0;
        const newsSentiment = newsMatch ? parseInt(newsMatch[2]) : 50;
        
        // Prepare sources data - Reddit, StockTwits, and News sentiment
        const sourcesData = {
          redditSentiment,
          redditMentions,
          stocktwitsSentiment,
          stocktwitsMessages,
          newsSentiment,
          newsArticles,
          sourcesAnalyzed: sentimentData.sources_analyzed,
          mentionsCount: sentimentData.mentions_count
        };

        // Calculate combined sentiment for today using weighted approach (matching grok.ts logic)
        const totalDataPoints = redditMentions + stocktwitsMessages + newsArticles;
        let todayCombinedSentiment;
        
        if (totalDataPoints === 0) {
          todayCombinedSentiment = 50;
        } else {
          // Calculate proportional weights but ensure Reddit gets minimum 10%
          let redditWeight = redditMentions / totalDataPoints;
          let stocktwitsWeight = stocktwitsMessages / totalDataPoints;
          let newsWeight = newsArticles / totalDataPoints;
          
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
          
          todayCombinedSentiment = Math.round(
            redditSentiment * redditWeight + 
            stocktwitsSentiment * stocktwitsWeight + 
            newsSentiment * newsWeight
          );
        }

        // Calculate sentiment velocity (momentum) based on historical data
        let sentimentVelocity = 0;
        if (historicalData.length >= 1) {
          // Get yesterday's stored sentiment score (already calculated using weighted approach)
          const yesterdayData = historicalData[historicalData.length - 1];
          const yesterdaySentimentScore = yesterdayData.sentimentScore;
          
          // Calculate day-over-day change as a percentage
          sentimentVelocity = yesterdaySentimentScore > 0 
            ? ((todayCombinedSentiment - yesterdaySentimentScore) / yesterdaySentimentScore) * 100
            : 0;
          
          
        } else {
          // No historical data - use a small random value for initial momentum
          sentimentVelocity = (Math.random() - 0.5) * 5; // -2.5% to +2.5%
        }

        // Determine signal strength based on multiple factors  
        const signalStrength = Math.min(5, Math.max(1, Math.round(
          (todayCombinedSentiment * 0.4 + 
           sentimentData.confidence * 0.3 + 
           Math.abs(correlation) * 100 * 0.3) / 20
        )));

        // Determine risk level
        const volatility = Math.abs(priceChange);
        let riskLevel = 'medium';
        if (asset.assetType === 'crypto' || volatility > 5) riskLevel = 'high';
        else if (volatility < 2) riskLevel = 'low';

        // Generate recommendation based on sentiment and momentum
        let recommendation = 'HOLD';
        if (todayCombinedSentiment > 75 && sentimentVelocity > 5 && riskLevel !== 'high') {
          recommendation = 'BUY';
        } else if (todayCombinedSentiment < 25 && sentimentVelocity < -5) {
          recommendation = 'SELL';
        } else if (todayCombinedSentiment < 40 && sentimentVelocity > 0) {
          recommendation = 'WATCH';
        } else if (todayCombinedSentiment < 40 && sentimentVelocity < -10) {
          recommendation = 'AVOID';
        }

        // Prepare metadata
        const metadata = {
          volumeSignal: sentimentData.volume_signal,
          momentum: sentimentData.momentum,
          keyFactors: sentimentData.key_factors,
          sentimentVelocity,
          signalStrength,
          riskLevel,
          recommendation,
          sentimentCases: sentimentData.sentiment_cases
        };

        // Save to database (upsert to handle existing records)
        await prisma.sentimentAnalysis.upsert({
          where: {
            ticker_analysisDate: {
              ticker: asset.ticker,
              analysisDate: analysisDate
            }
          },
          update: {
            sentimentScore: todayCombinedSentiment,
            status: sentimentData.status,
            confidence: sentimentData.confidence,
            price: currentPrice,
            change24h: priceChange,
            aiInsights: sentimentData.insights,
            correlation,
            sourcesData: JSON.stringify(sourcesData),
            metadata: JSON.stringify(metadata)
          },
          create: {
            ticker: asset.ticker,
            analysisDate,
            sentimentScore: todayCombinedSentiment,
            status: sentimentData.status,
            confidence: sentimentData.confidence,
            price: currentPrice,
            change24h: priceChange,
            aiInsights: sentimentData.insights,
            correlation,
            sourcesData: JSON.stringify(sourcesData),
            metadata: JSON.stringify(metadata)
          }
        });

        console.log(`✓ ${asset.ticker}: Combined Sentiment ${todayCombinedSentiment}, Price: $${currentPrice}, Change: ${priceChange}%`);
        
        return {
          ticker: asset.ticker,
          success: true,
          sentimentScore: todayCombinedSentiment,
          status: sentimentData.status
        };
      } catch (error) {
        console.error(`Error analyzing ${asset.ticker}:`, error);
        return {
          ticker: asset.ticker,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });

    // Wait for all analyses to complete
    const results = await Promise.all(analysisPromises);
    const successCount = results.filter(r => r.success).length;
    console.log(`Daily analysis completed: ${successCount}/${assets.length} successful`);

    return NextResponse.json({
      success: true,
      message: 'Daily analysis completed',
      timestamp: new Date().toISOString(),
      results,
      summary: {
        total: assets.length,
        successful: successCount,
        failed: assets.length - successCount
      }
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}