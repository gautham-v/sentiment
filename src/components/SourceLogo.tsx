import React from 'react';
import Image from 'next/image';

interface SourceLogoProps {
  source: 'reddit' | 'twitter' | 'x' | 'reuters' | 'bloomberg' | 'technical' | 'social' | 'news' | 'stocktwits';
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

const SOURCE_LOGOS: Record<string, string | React.ReactNode> = {
  'reddit': '/logos/RDDT.svg',
  'twitter': '/logos/TWTR.svg',
  'x': '/logos/TWTR.svg',
  'reuters': '/logos/reuters.png',
  'bloomberg': '/logos/bloomberg.D.svg',
  'technical': <span className="text-[10px] font-bold">📊</span>,
  'social': <span className="text-[10px] font-bold">👥</span>,
  'news': <span className="text-[10px] font-bold">📰</span>,
  'stocktwits': '/logos/Stocktwits.jpg',
};

export default function SourceLogo({ source, size = 'sm', className = '' }: SourceLogoProps) {
  const sizeClasses = {
    xs: { img: 12, container: 'w-3 h-3' },
    sm: { img: 16, container: 'w-4 h-4' },
    md: { img: 20, container: 'w-5 h-5' }
  };

  const currentSizeDetails = sizeClasses[size];
  const logoContent = SOURCE_LOGOS[source] || SOURCE_LOGOS['news'];

  return (
    <div className={`${currentSizeDetails.container} ${className} flex items-center justify-center`}>
      {typeof logoContent === 'string' ? (
        <Image
          src={logoContent}
          alt={`${source} logo`}
          width={currentSizeDetails.img}
          height={currentSizeDetails.img}
          className="w-full h-full object-contain"
          style={{ maxWidth: '100%', maxHeight: '100%' }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            console.error(`Failed to load image for ${source}: ${target.src}`);
          }}
        />
      ) : (
        logoContent 
      )}
    </div>
  );
}