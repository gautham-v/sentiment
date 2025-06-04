import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { AssetWithSentiment, DashboardData } from '@/types';
import { handleApiError, createApiResponse } from '@/lib/error-handler';
import { monitoring } from '@/lib/monitoring';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    monitoring.log('info', 'Fetching sentiment data');
    
    
    // Get all assets with their latest sentiment analysis
    const assets = await prisma.asset.findMany({
      include: {
        sentimentAnalyses: {
          orderBy: {
            analysisDate: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        ticker: 'asc'
      }
    });

    // Transform data for frontend
    const assetsWithSentiment: AssetWithSentiment[] = assets.map(asset => {
      const latestAnalysis = asset.sentimentAnalyses[0];
      
      if (!latestAnalysis) {
        return {
          ticker: asset.ticker,
          name: asset.name,
          type: asset.assetType as 'stock' | 'crypto',
          color: asset.color,
          sentiment: undefined
        };
      }

      // Parse JSON fields
      let sourcesData;
      let metadata;
      try {
        sourcesData = JSON.parse(latestAnalysis.sourcesData);
        metadata = JSON.parse(latestAnalysis.metadata);
      } catch (error) {
        console.error(`Error parsing JSON for ${asset.ticker}:`, error);
        sourcesData = {
          redditSentiment: 50,
          redditMentions: 0,
          stocktwitsSentiment: 50,
          stocktwitsMessages: 0,
          sourcesAnalyzed: 0,
          mentionsCount: 0
        };
        metadata = {
          volumeSignal: 'unknown',
          momentum: 'unknown',
          keyFactors: []
        };
      }

      return {
        ticker: asset.ticker,
        name: asset.name,
        type: asset.assetType as 'stock' | 'crypto',
        color: asset.color,
        sentiment: {
          id: latestAnalysis.id,
          ticker: asset.ticker,
          sentimentScore: latestAnalysis.sentimentScore,
          status: latestAnalysis.status as 'bullish' | 'neutral' | 'bearish',
          confidence: latestAnalysis.confidence,
          price: latestAnalysis.price || 0,
          change24h: latestAnalysis.change24h || 0,
          aiInsights: latestAnalysis.aiInsights || '',
          correlation: latestAnalysis.correlation || 0,
          sourcesData,
          metadata,
          analysisDate: latestAnalysis.analysisDate.toISOString(),
          createdAt: latestAnalysis.createdAt.toISOString(),
          sentimentCases: metadata.sentimentCases // Include sentiment cases if available
        }
      };
    });

    // Calculate summary statistics
    const sentimentScores = assetsWithSentiment
      .filter(a => a.sentiment)
      .map(a => a.sentiment!.sentimentScore);
    
    const avgSentiment = sentimentScores.length > 0
      ? Math.round(sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length)
      : 0;

    const bullishCount = assetsWithSentiment.filter(a => a.sentiment?.status === 'bullish').length;
    const totalAnalyzed = assetsWithSentiment.filter(a => a.sentiment).length;

    const avgChange = assetsWithSentiment
      .filter(a => a.sentiment)
      .reduce((sum, a) => sum + (a.sentiment!.change24h || 0), 0) / (totalAnalyzed || 1);

    const totalSources = assetsWithSentiment
      .filter(a => a.sentiment)
      .reduce((sum, a) => sum + (a.sentiment!.sourcesData.sourcesAnalyzed || 0), 0);

    // Generate recommendations (top 3 by sentiment score with positive momentum)
    const recommendations = assetsWithSentiment
      .filter(a => a.sentiment && a.sentiment.status === 'bullish')
      .sort((a, b) => (b.sentiment?.sentimentScore || 0) - (a.sentiment?.sentimentScore || 0))
      .slice(0, 3)
      .map(asset => ({
        ticker: asset.ticker,
        name: asset.name,
        score: asset.sentiment!.sentimentScore,
        reason: asset.sentiment!.metadata.momentum || 'Strong momentum'
      }));

    const dashboardData: DashboardData = {
      assets: assetsWithSentiment,
      recommendations,
      summary: {
        avgSentiment,
        bullishCount,
        totalAssets: totalAnalyzed,
        avgChange24h: parseFloat(avgChange.toFixed(2)),
        totalSources,
        accuracyRate: 92 // Placeholder for MVP
      },
      lastUpdated: new Date().toISOString()
    };

    const duration = Date.now() - startTime;
    monitoring.trackApiCall('/api/sentiment', duration, 'success', 200);
    
    return createApiResponse(dashboardData);
  } catch (error) {
    const duration = Date.now() - startTime;
    monitoring.trackApiCall('/api/sentiment', duration, 'error', 500);
    
    return handleApiError(error);
  }
}