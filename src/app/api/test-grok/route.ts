import { NextRequest, NextResponse } from 'next/server';
import { analyzeSentiment } from '@/lib/grok';

export async function GET(request: NextRequest) {
  try {
    console.log('=== Testing Grok API Integration ===');
    
    const result = await analyzeSentiment('NVDA', 'NVIDIA', 'stock');
    
    console.log('=== Analysis Result ===');
    console.log('Sentiment Score:', result.sentiment_score);
    console.log('Status:', result.status);
    console.log('Confidence:', result.confidence);
    console.log('Sentiment Cases Available:', !!result.sentiment_cases);
    
    if (result.sentiment_cases) {
      console.log('Bullish case length:', result.sentiment_cases.bullish?.length);
      console.log('Bullish preview:', result.sentiment_cases.bullish?.substring(0, 100) + '...');
      
      const hasDetailedAnalysis = result.sentiment_cases.bullish?.includes('revenue') ||
                                  result.sentiment_cases.bullish?.includes('earnings') ||
                                  result.sentiment_cases.bullish?.includes('fundamental');
      
      console.log('Has detailed analysis:', hasDetailedAnalysis);
    }
    
    return NextResponse.json({
      success: true,
      ticker: 'NVDA',
      sentimentScore: result.sentiment_score,
      status: result.status,
      confidence: result.confidence,
      hasDetailedCases: !!result.sentiment_cases,
      bullishCasePreview: result.sentiment_cases?.bullish?.substring(0, 200) + '...'
    });
    
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}