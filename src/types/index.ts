// Asset definitions
export interface Asset {
  ticker: string;
  name: string;
  type: 'stock' | 'crypto';
  color: string;
  logoUrl?: string; // Added for real logos
}

// Sentiment analysis data structure
export interface SentimentAnalysis {
  id?: number;
  ticker: string;
  analysisDate: string;
  sentimentScore: number; // 0-100
  status: 'bullish' | 'neutral' | 'bearish';
  confidence: number; // 0-100
  price: number;
  change24h: number;
  aiInsights: string;
  correlation: number; // -1.00 to 1.00
  sourcesData: SourcesData;
  metadata: SentimentMetadata;
  createdAt?: string;
  sentimentCases?: SentimentCases; // New field for bullish/bearish/neutral cases
}

// Sentiment cases for AI Analysis
export interface SentimentCases {
  bullish: string;
  bearish: string;
  neutral: string;
}

// Detailed sentiment breakdown - Reddit, StockTwits, and News
export interface SourcesData {
  sourcesAnalyzed: number;
  mentionsCount: number;
  redditSentiment: number;
  redditMentions: number;
  stocktwitsSentiment: number;
  stocktwitsMessages: number;
  newsSentiment: number;
  newsArticles: number;
}

// Additional metadata for sentiment analysis
export interface SentimentMetadata {
  volumeSignal: string;
  momentum: string;
  keyFactors: string[];
  volatility?: number;
  marketCap?: number;
  volume24h?: number;
  // Enhanced features
  signalStrength?: number; // 1-5 signal strength
  sentimentVelocity?: number; // Rate of sentiment change
  institutionalSentiment?: number; // 0-100
  retailSentiment?: number; // 0-100
  optionsFlow?: 'bullish' | 'bearish' | 'neutral';
  darkSentiment?: 'accumulation' | 'distribution' | 'neutral' | 'mixed';
  riskLevel?: 'low' | 'medium' | 'high';
  recommendation?: 'BUY' | 'SELL' | 'HOLD' | 'WATCH' | 'AVOID';
}

// Price data from external APIs
export interface PriceData {
  ticker: string;
  price: number;
  change24h: number;
  volume: number;
  marketCap?: number;
  high24h?: number;
  low24h?: number;
}

// Grok API response structure
export interface GrokAnalysisResponse {
  sentiment_score: number;
  confidence: number;
  status: 'bullish' | 'neutral' | 'bearish';
  analysis: string;
  volume_signal: string;
  momentum: string;
  key_factors: string[];
  recommendation: string;
  sentiment_cases?: SentimentCases; // New field for bullish/bearish/neutral cases
}

// Dashboard props
export interface DashboardProps {
  assets: AssetWithSentiment[];
  recommendations: Recommendation[];
  summary: SummaryMetrics;
}

// Dashboard data from API
export interface DashboardData {
  assets: AssetWithSentiment[];
  recommendations: Recommendation[];
  summary: SummaryMetrics;
  lastUpdated: string;
}

// Asset combined with latest sentiment data
export interface AssetWithSentiment extends Asset {
  sentiment?: SentimentAnalysis;
  priceData?: PriceData;
}

// AI recommendations
export interface Recommendation {
  ticker: string;
  name: string;
  score: number;
  reason: string;
}

// Summary metrics for dashboard
export interface SummaryMetrics {
  avgSentiment: number;
  bullishCount: number;
  totalAssets: number;
  avgChange24h: number;
  totalSources: number;
  accuracyRate: number;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Database operations
export interface DbAsset {
  ticker: string;
  name: string;
  asset_type: string;
  color: string;
}

export interface DbSentimentAnalysis {
  id: number;
  ticker: string;
  analysis_date: string;
  sentiment_score: number;
  status: string;
  confidence: number;
  price: number;
  change_24h: number;
  ai_insights: string;
  correlation: number;
  sources_data: string; // JSON stringified
  metadata: string; // JSON stringified
  created_at: string;
} 