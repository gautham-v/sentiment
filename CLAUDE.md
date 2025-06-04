# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sentiment.so is an AI-powered market sentiment analysis platform that analyzes sentiment for tech stocks and cryptocurrencies using Grok API. The platform displays real-time sentiment scores, price correlations, and AI-generated insights in a professional dashboard interface.

IMPORTANT: This is a production application. Never use mock data for production or database tables. If real data is unavailable, show "price currently unavailable" or similar messaging.

## Tech Stack

- **Framework**: Next.js 14.1.0 with TypeScript, Tailwind CSS
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma 6.8.2
- **Deployment**: Vercel with Cron Functions
- **AI Integration**: Grok API (x.ai) for sentiment analysis
- **Price Data**: Yahoo Finance API (no key required)
- **Sentiment Sources**: Reddit (Apewisdom), StockTwits, News APIs
- **Visualization**: Recharts for data charts
- **Icons**: Lucide React

## Architecture

### Core Data Flow
1. **Daily Cron Job** (Vercel Cron at 2 PM UTC / 9 AM EST) triggers analysis
2. **Price Service** fetches current market data from Yahoo Finance
3. **Sentiment Services** gather data from Reddit, StockTwits, and news sources
4. **Grok API** analyzes combined sentiment using AI
5. **Correlation Service** calculates price-sentiment relationships
6. **Database** stores results in PostgreSQL via Prisma
7. **Dashboard** displays real-time analysis and recommendations

### Key API Routes
- `/api/sentiment` - Main dashboard data endpoint
- `/api/sentiment/history` - Historical sentiment data
- `/api/cron/daily-analysis` - Automated daily analysis
- `/api/robots` - SEO robots.txt

### Core Services
- `/lib/grok.ts` - Grok AI integration
- `/lib/price-api.ts` - Yahoo Finance integration
- `/lib/reddit-sentiment.ts` - Reddit sentiment via Apewisdom
- `/lib/stocktwits-sentiment.ts` - StockTwits sentiment
- `/lib/news-sentiment.ts` - News sentiment analysis
- `/lib/correlation.ts` - Price-sentiment correlation
- `/lib/db.ts` - Prisma database client
- `/lib/monitoring.ts` - Error tracking
- `/lib/error-handler.ts` - Centralized error handling

## Database Schema (Prisma/PostgreSQL)

```prisma
model Asset {
  ticker     String   @id
  name       String
  assetType  String   @map("asset_type")
  color      String
  sentimentAnalyses SentimentAnalysis[]
}

model SentimentAnalysis {
  id             Int      @id @default(autoincrement())
  ticker         String
  analysisDate   DateTime @map("analysis_date")
  sentimentScore Int      @map("sentiment_score")
  status         String
  confidence     Int
  price          Float?
  change24h      Float?   @map("change_24h")
  aiInsights     String?  @map("ai_insights")
  correlation    Float?
  sourcesData    String   @map("sources_data") // JSON
  metadata       String   // JSON
  createdAt      DateTime @default(now()) @map("created_at")
  
  asset Asset @relation(fields: [ticker], references: [ticker])
  
  @@unique([ticker, analysisDate])
}
```

## Development Commands

```bash
# Development
npm run dev              # Start Next.js development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Lint code
npm run typecheck       # TypeScript checking

# Database operations
npx prisma generate     # Generate Prisma client
npx prisma db push      # Push schema changes
npx prisma migrate dev  # Create migration
npx prisma studio       # Database GUI
npx prisma db seed     # Seed database

# Manual analysis trigger (development)
curl http://localhost:3000/api/cron/daily-analysis \
  -H "x-cron-secret: your-secret"
```

## Environment Variables Required

```env
# Core APIs
GROK_API_KEY=            # Grok API key from x.ai (required)

# Database
DATABASE_URL=            # PostgreSQL connection string
DIRECT_URL=              # Direct database connection (for migrations)

# Vercel Cron
CRON_SECRET=            # Secret token for cron job security

# Optional (for Supabase users)
SUPABASE_URL=           # Supabase project URL
SUPABASE_ANON_KEY=      # Supabase anonymous key

# Development only
NODE_ENV=development    # Set to 'production' in production
```

## Project Structure

```
/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Main dashboard page
│   │   ├── layout.tsx                  # Root layout
│   │   ├── globals.css                 # Global styles
│   │   └── api/
│   │       ├── sentiment/
│   │       │   ├── route.ts           # Dashboard data endpoint
│   │       │   └── history/
│   │       │       └── route.ts       # Historical data endpoint
│   │       └── cron/
│   │           └── daily-analysis/
│   │               └── route.ts       # Scheduled analysis
│   ├── components/
│   │   ├── Dashboard.tsx              # Main dashboard layout
│   │   ├── AssetTable.tsx            # Asset list with details
│   │   ├── MomentumTracker.tsx       # Top movers display
│   │   ├── SentimentTrendChart.tsx   # Sentiment visualization
│   │   ├── HistoricalSentimentChart.tsx # Historical charts
│   │   ├── DivergenceIndicator.tsx   # Price-sentiment divergence
│   │   ├── MomentumIndicator.tsx     # Momentum signals
│   │   ├── SignalStrength.tsx        # Signal strength display
│   │   ├── AssetLogo.tsx             # Asset logo component
│   │   ├── SourceLogo.tsx            # Source logo component
│   │   ├── Header.tsx                # App header
│   │   └── InfoTooltip.tsx           # Information tooltips
│   ├── lib/
│   │   ├── grok.ts                   # Grok AI client
│   │   ├── price-api.ts              # Yahoo Finance client
│   │   ├── reddit-sentiment.ts       # Reddit sentiment
│   │   ├── stocktwits-sentiment.ts   # StockTwits sentiment
│   │   ├── news-sentiment.ts         # News sentiment
│   │   ├── correlation.ts            # Correlation calculator
│   │   ├── assets.ts                 # Asset definitions
│   │   ├── db.ts                     # Database client
│   │   ├── monitoring.ts             # Error monitoring
│   │   └── error-handler.ts          # Error handling
│   └── types/
│       └── index.ts                   # TypeScript interfaces
├── prisma/
│   ├── schema.prisma                  # Database schema
│   └── seed.ts                        # Database seeding
├── public/
│   └── logos/                         # Asset and source logos
└── scripts/
    └── final-layout-update.ts         # Migration scripts
```

## Tracked Assets (12 total)

```typescript
// Tech Stocks (10)
{ ticker: 'NVDA', name: 'NVIDIA', type: 'stock' },
{ ticker: 'MSFT', name: 'Microsoft', type: 'stock' },
{ ticker: 'AAPL', name: 'Apple', type: 'stock' },
{ ticker: 'GOOGL', name: 'Google', type: 'stock' },
{ ticker: 'AMZN', name: 'Amazon', type: 'stock' },
{ ticker: 'META', name: 'Meta', type: 'stock' },
{ ticker: 'TSLA', name: 'Tesla', type: 'stock' },
{ ticker: 'NFLX', name: 'Netflix', type: 'stock' },
{ ticker: 'AMD', name: 'AMD', type: 'stock' },
{ ticker: 'INTC', name: 'Intel', type: 'stock' },

// Cryptocurrencies (2)
{ ticker: 'BTC-USD', name: 'Bitcoin', type: 'crypto' },
{ ticker: 'ETH-USD', name: 'Ethereum', type: 'crypto' }
```

## Grok API Integration

The app uses Grok's structured generation for consistent sentiment analysis:

```typescript
// Expected Grok response structure
{
  sentiment_score: number,         // 0-100
  confidence: number,              // 0-100
  status: "bullish|neutral|bearish",
  analysis: string,                // Detailed analysis
  volume_signal: string,           // Market volume assessment
  momentum: string,                // Price momentum
  key_factors: string[],          // Main sentiment drivers
  recommendation: string           // Buy/sell/hold suggestion
}
```

## Key Features

1. **Real-time Sentiment Analysis**: Daily AI-powered analysis of 12 assets
2. **Multi-Source Integration**: Reddit, StockTwits, and news sentiment
3. **Price Correlation**: Visual indicators for sentiment-price divergence
4. **AI Insights**: Grok-generated analysis and recommendations
5. **Momentum Tracking**: Identify trending assets
6. **Historical Data**: 30-day sentiment history charts
7. **Professional Dashboard**: Clean, responsive UI with expandable details

## Development Best Practices

1. **Error Handling**: Use centralized error handler for consistency
2. **Type Safety**: Leverage TypeScript interfaces throughout
3. **Data Validation**: Validate API responses before processing
4. **Performance**: Implement proper loading states and error boundaries
5. **Security**: Never commit API keys or sensitive data
6. **Testing**: Test API integrations with rate limits in mind

## API Rate Limits

- **Yahoo Finance**: ~2000 requests/hour (unofficial)
- **Apewisdom (Reddit)**: No official limit, be respectful
- **StockTwits**: 200 requests/hour for unauthenticated
- **Grok API**: Check x.ai documentation for current limits

## Deployment Notes

1. **Vercel Deployment**:
   - Set all environment variables in Vercel dashboard
   - Configure cron job in vercel.json
   - Monitor function execution times

2. **Database**:
   - Use connection pooling for production
   - Set appropriate connection limits
   - Regular backups recommended

3. **Monitoring**:
   - Implement error tracking (Sentry, etc.)
   - Monitor API usage and costs
   - Track cron job success rates

## Common Issues & Solutions

1. **Cron job not running**: Verify CRON_SECRET matches Vercel config
2. **Database connection errors**: Check DATABASE_URL and connection limits
3. **API rate limits**: Implement caching and request throttling
4. **Missing sentiment data**: Check API keys and service availability

This project prioritizes production stability, real-time data accuracy, and professional presentation for market sentiment analysis.