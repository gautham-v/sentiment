import { Asset } from '@/types';

// Pre-defined assets for MVP (12 total: 10 tech stocks + 2 crypto)
export const ASSETS: Asset[] = [
  // Tech Stocks (10)
  { ticker: 'NVDA', name: 'NVIDIA', type: 'stock', color: '#76B900', logoUrl: '/logos/NVDA.svg' },
  { ticker: 'MSFT', name: 'Microsoft', type: 'stock', color: '#00BCF2', logoUrl: '/logos/MSFT.svg' },
  { ticker: 'AAPL', name: 'Apple', type: 'stock', color: '#007AFF', logoUrl: '/logos/AAPL.D.svg' },
  { ticker: 'GOOGL', name: 'Google', type: 'stock', color: '#4285F4', logoUrl: '/logos/Google.jpg' },
  { ticker: 'AMZN', name: 'Amazon', type: 'stock', color: '#FF9900', logoUrl: '/logos/AMZN.svg' },
  { ticker: 'META', name: 'Meta', type: 'stock', color: '#0866FF', logoUrl: '/logos/META.svg' },
  { ticker: 'TSLA', name: 'Tesla', type: 'stock', color: '#CC0000', logoUrl: '/logos/TSLA.svg' },
  { ticker: 'NFLX', name: 'Netflix', type: 'stock', color: '#E50914', logoUrl: '/logos/NFLX.svg' },
  { ticker: 'AMD', name: 'AMD', type: 'stock', color: '#ED1C24', logoUrl: '/logos/AMD.svg' },
  { ticker: 'INTC', name: 'Intel', type: 'stock', color: '#0071C5', logoUrl: '/logos/INTC.D.svg' },
  
  // Crypto (2)
  { ticker: 'BTC', name: 'Bitcoin', type: 'crypto', color: '#F7931A', logoUrl: '/logos/Bitcoin.png' },
  { ticker: 'ETH', name: 'Ethereum', type: 'crypto', color: '#627EEA', logoUrl: '/logos/Ethereum.png' }
];

// Asset lookup helper
export const getAssetByTicker = (ticker: string): Asset | undefined => {
  return ASSETS.find(asset => asset.ticker === ticker);
};

// Filter assets by type
export const getStockAssets = (): Asset[] => {
  return ASSETS.filter(asset => asset.type === 'stock');
};

export const getCryptoAssets = (): Asset[] => {
  return ASSETS.filter(asset => asset.type === 'crypto');
}; 