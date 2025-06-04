'use client';

import { useState, useMemo } from 'react';
import { DashboardProps } from '@/types';
import Header from './Header';
import AssetTable from './AssetTable';
import MomentumTracker from './MomentumTracker';

export default function Dashboard({ assets, recommendations, summary }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter assets based on search query
  const filteredAssets = useMemo(() => {
    if (!searchQuery) return assets;
    
    const query = searchQuery.toLowerCase();
    return assets.filter(asset => 
      asset.ticker.toLowerCase().includes(query) ||
      asset.name.toLowerCase().includes(query)
    );
  }, [assets, searchQuery]);

  // Find the most recent sentiment update time
  const lastSentimentUpdate = useMemo(() => {
    const sentimentDates = assets
      .filter(asset => asset.sentiment?.createdAt)
      .map(asset => new Date(asset.sentiment!.createdAt!).getTime());
    
    if (sentimentDates.length === 0) return undefined;
    
    const mostRecent = Math.max(...sentimentDates);
    return new Date(mostRecent).toISOString();
  }, [assets]);

  return (
    <div className="min-h-screen bg-background-primary text-text-primary">
      <Header onSearch={setSearchQuery} />
      
      <div className="max-w-[1600px] mx-auto px-0 sm:px-4 py-2 sm:py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-4">
          {/* Left: Assets Table (2/3 width on desktop) */}
          <div className="lg:col-span-2">
            <AssetTable assets={filteredAssets} lastSentimentUpdate={lastSentimentUpdate} />
          </div>
          
          {/* Right: Momentum Tracker (1/3 width on desktop) */}
          <div className="lg:col-span-1">
            <MomentumTracker assets={assets} />
          </div>
        </div>
      </div>
    </div>
  );
} 