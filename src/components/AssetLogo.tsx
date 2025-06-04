import React from 'react';
import Image from 'next/image';
import { ASSETS } from '@/lib/assets'; // Import ASSETS to find the logoUrl

interface AssetLogoProps {
  ticker: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function AssetLogo({ ticker, size = 'md', className = '' }: AssetLogoProps) {
  const asset = ASSETS.find(a => a.ticker === ticker);
  const logoUrl = asset?.logoUrl;

  const sizeMap = {
    sm: { text: 'text-xs', img: 20, container: 'w-5 h-5' }, // 20px
    md: { text: 'text-sm', img: 24, container: 'w-6 h-6' }, // 24px
    lg: { text: 'text-base', img: 32, container: 'w-8 h-8' }  // 32px
  };

  const currentSize = sizeMap[size];

  // Use simple text-based logos with custom styling for each asset if no logoUrl
  const getFallbackLogoContent = () => {
    switch (ticker) {
      case 'NVDA':
        return <span className="font-black">NV</span>;
      case 'MSFT':
        return <span className="font-bold">M</span>;
      case 'AAPL':
        return <span className="font-bold">A</span>; // Changed from empty to A
      case 'GOOGL':
        return <span className="font-bold">G</span>;
      case 'AMZN':
        return <span className="font-bold">A</span>;
      case 'META':
        return <span className="font-bold">M</span>;
      case 'TSLA':
        return <span className="font-bold">T</span>;
      case 'NFLX':
        return <span className="font-black">N</span>;
      case 'AMD':
        return <span className="font-bold">A</span>;
      case 'INTC':
        return <span className="font-bold">I</span>;
      case 'BTC':
        return <span className="font-black">₿</span>;
      case 'ETH':
        return <span className="font-bold">Ξ</span>;
      default:
        return <span className="font-bold">{ticker.charAt(0)}</span>;
    }
  };

  if (logoUrl) {
    return (
      <div className={`${currentSize.container} flex items-center justify-center ${className}`}>
        <Image 
          src={logoUrl} 
          alt={`${ticker} logo`} 
          width={currentSize.img} 
          height={currentSize.img} 
          className="w-full h-full object-contain"
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${currentSize.text} ${className}`}>
      {getFallbackLogoContent()}
    </div>
  );
}