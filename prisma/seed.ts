import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ASSETS = [
  // Tech Stocks (10)
  { ticker: 'NVDA', name: 'NVIDIA', assetType: 'stock', color: '#76B900' },
  { ticker: 'MSFT', name: 'Microsoft', assetType: 'stock', color: '#00BCF2' },
  { ticker: 'AAPL', name: 'Apple', assetType: 'stock', color: '#007AFF' },
  { ticker: 'GOOGL', name: 'Google', assetType: 'stock', color: '#4285F4' },
  { ticker: 'AMZN', name: 'Amazon', assetType: 'stock', color: '#FF9900' },
  { ticker: 'META', name: 'Meta', assetType: 'stock', color: '#0866FF' },
  { ticker: 'TSLA', name: 'Tesla', assetType: 'stock', color: '#CC0000' },
  { ticker: 'NFLX', name: 'Netflix', assetType: 'stock', color: '#E50914' },
  { ticker: 'AMD', name: 'AMD', assetType: 'stock', color: '#ED1C24' },
  { ticker: 'INTC', name: 'Intel', assetType: 'stock', color: '#0071C5' },
  
  // Crypto (2)
  { ticker: 'BTC', name: 'Bitcoin', assetType: 'crypto', color: '#F7931A' },
  { ticker: 'ETH', name: 'Ethereum', assetType: 'crypto', color: '#627EEA' }
];

async function main() {
  console.log('🌱 Seeding database...');
  
  // Clear existing data
  await prisma.sentimentAnalysis.deleteMany();
  await prisma.asset.deleteMany();
  
  // Create assets
  for (const asset of ASSETS) {
    await prisma.asset.create({
      data: asset
    });
    console.log(`✅ Created asset: ${asset.ticker} - ${asset.name}`);
  }
  
  console.log('✨ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });