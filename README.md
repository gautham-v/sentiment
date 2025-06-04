# Sentiment.so - AI-Powered Market Sentiment Analysis

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.1.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.8.2-2D3748)

Sentiment.so is an open-source, AI-powered market sentiment analysis platform that provides real-time sentiment tracking for tech stocks and cryptocurrencies. Built with Next.js, TypeScript, and powered by Grok AI.

## 🚀 Features

- **Real-time Sentiment Analysis**: Daily AI-powered analysis of 12 major tech stocks and cryptocurrencies
- **Multi-Source Integration**: Aggregates sentiment from Reddit, StockTwits, and news sources
- **AI Insights**: Powered by Grok AI for intelligent market analysis and recommendations
- **Price Correlation**: Tracks sentiment-price relationships with visual indicators
- **Momentum Tracking**: Identifies trending assets and momentum shifts
- **Historical Data**: 30-day sentiment history with interactive charts
- **Professional Dashboard**: Clean, responsive UI with detailed expandable views

## 🌐 Live Demo

Visit [sentiment.so](https://sentiment.so) to see the platform in action.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Recharts
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Supabase compatible)
- **AI**: Grok API (x.ai)
- **Deployment**: Vercel with Cron Functions
- **External APIs**: Yahoo Finance, Apewisdom (Reddit), StockTwits

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or Supabase)
- Grok API key from [x.ai](https://x.ai)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/gautham-v/sentiment.git
cd sentiment
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Required
GROK_API_KEY=your_grok_api_key
DATABASE_URL=postgresql://user:password@localhost:5432/sentiment
DIRECT_URL=postgresql://user:password@localhost:5432/sentiment
CRON_SECRET=your_cron_secret

# Optional (for Supabase)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set up the database

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### 6. Trigger analysis manually (development)

```bash
curl http://localhost:3000/api/cron/daily-analysis \
  -H "x-cron-secret: your_cron_secret"
```

## 📁 Project Structure

```
sentiment/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   │   ├── sentiment/     # Sentiment endpoints
│   │   │   └── cron/          # Scheduled tasks
│   │   └── page.tsx           # Main dashboard
│   ├── components/            # React components
│   │   ├── Dashboard.tsx      # Main layout
│   │   ├── AssetTable.tsx     # Asset list
│   │   └── ...               # Other components
│   ├── lib/                   # Core services
│   │   ├── grok.ts           # Grok AI integration
│   │   ├── price-api.ts      # Yahoo Finance
│   │   ├── reddit-sentiment.ts
│   │   ├── stocktwits-sentiment.ts
│   │   └── correlation.ts    # Price-sentiment correlation
│   └── types/                 # TypeScript types
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts               # Database seeding
├── public/                    # Static assets
│   └── logos/                # Asset and source logos
└── vercel.json               # Deployment config
```

## 📊 Tracked Assets

The platform tracks 12 pre-selected assets:

**Tech Stocks (10)**
- NVDA (NVIDIA)
- MSFT (Microsoft)
- AAPL (Apple)
- GOOGL (Google)
- AMZN (Amazon)
- META (Meta)
- TSLA (Tesla)
- NFLX (Netflix)
- AMD (AMD)
- INTC (Intel)

**Cryptocurrencies (2)**
- BTC-USD (Bitcoin)
- ETH-USD (Ethereum)

## 🔌 API Documentation

### GET /api/sentiment
Returns current sentiment data for all tracked assets.

**Response:**
```json
{
  "assets": [...],
  "lastUpdate": "2024-01-15T14:00:00Z"
}
```

### GET /api/sentiment/history?ticker=NVDA&days=30
Returns historical sentiment data for a specific asset.

**Response:**
```json
{
  "ticker": "NVDA",
  "history": [...]
}
```

### POST /api/cron/daily-analysis
Triggers sentiment analysis (requires `x-cron-secret` header).

## 🚢 Deployment

### Vercel Deployment

1. Fork this repository
2. Import to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

The cron job is configured in `vercel.json` to run daily at 2 PM UTC (9 AM EST).

### Database Setup (Supabase)

1. Create a new Supabase project
2. Copy the database URL and anon key
3. Update your environment variables
4. Run migrations: `npx prisma migrate deploy`

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Grok AI](https://x.ai) for sentiment analysis
- [Yahoo Finance](https://finance.yahoo.com) for market data
- [Apewisdom](https://apewisdom.io) for Reddit sentiment
- [StockTwits](https://stocktwits.com) for social sentiment

## 🔐 Security

- Never commit API keys or secrets
- Use environment variables for all sensitive data
- Report security vulnerabilities to gvem@duck.com

## 💬 Support

- Create an [issue](https://github.com/gautham-v/sentiment/issues) for bug reports
- Start a [discussion](https://github.com/gautham-v/sentiment/discussions) for questions

## 🗺️ Roadmap

- [ ] User authentication and personalized watchlists
- [ ] Email/SMS alerts for sentiment changes
- [ ] Additional asset classes (commodities, forex)
- [ ] Mobile app (React Native)
- [ ] Advanced charting features
- [ ] Backtesting capabilities
- [ ] API for developers

## 📈 Performance

- Lighthouse score: 95+
- Page load time: <2s
- API response time: <500ms
- Daily analysis completion: <5 minutes

---

Built with ❤️ by the Sentiment.so team