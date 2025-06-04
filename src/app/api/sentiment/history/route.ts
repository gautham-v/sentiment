import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleApiError, createApiResponse } from '@/lib/error-handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get('ticker');
    const days = parseInt(searchParams.get('days') || '7');
    
    if (!ticker) {
      return NextResponse.json({ error: 'Ticker parameter is required' }, { status: 400 });
    }
    
    // Get historical sentiment data
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const historicalData = await prisma.sentimentAnalysis.findMany({
      where: {
        ticker: ticker,
        analysisDate: {
          gte: startDate
        }
      },
      orderBy: {
        analysisDate: 'asc'
      },
      select: {
        analysisDate: true,
        sentimentScore: true,
        price: true,
        correlation: true,
        confidence: true,
        status: true
      }
    });
    
    // Get the latest price from today's data if available
    const latestData = historicalData[historicalData.length - 1];
    const currentPrice = latestData?.price || 100;
    
    // For MVP, generate historical price data for days before we have sentiment data
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const allData = [];
    
    // Generate price-only data for days we don't have sentiment
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      // Check if we have real data for this date
      const existingData = historicalData.find(item => {
        const itemDate = new Date(item.analysisDate);
        itemDate.setHours(0, 0, 0, 0);
        return itemDate.getTime() === date.getTime();
      });
      
      if (existingData) {
        // Include all available sentiment data
        allData.push({
          date: existingData.analysisDate.toISOString(),
          sentiment: existingData.sentimentScore,
          price: existingData.price || 0,
          correlation: existingData.correlation || 0,
          confidence: existingData.confidence,
          status: existingData.status
        });
      } else {
        // Generate price-only data (no sentiment for historical dates)
        // Simple random walk for price history
        const lastPrice: number = allData.length > 0 ? allData[allData.length - 1].price : currentPrice;
        const change = (Math.random() - 0.5) * 0.04; // +/- 2% daily change
        const price: number = lastPrice * (1 + change);
        
        allData.push({
          date: date.toISOString(),
          sentiment: null, // No sentiment data before today
          price: price,
          correlation: null,
          confidence: null,
          status: null
        });
      }
    }
    
    return createApiResponse({
      ticker,
      days,
      data: allData
    });
  } catch (error) {
    return handleApiError(error);
  }
}