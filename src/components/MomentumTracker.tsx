'use client';

import { AssetWithSentiment } from '@/types';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface MomentumTrackerProps {
  assets: AssetWithSentiment[];
}

export default function MomentumTracker({ assets }: MomentumTrackerProps) {
  // Calculate momentum for each asset as a fallback
  const calculateMomentum = (asset: AssetWithSentiment) => {
    if (!asset.sentiment) return 0;
    
    // If we have real velocity data, use it
    if (asset.sentiment.metadata?.sentimentVelocity !== undefined) {
      return asset.sentiment.metadata.sentimentVelocity;
    }
    
    // Parse momentum from text description
    const momentum = asset.sentiment.metadata?.momentum || '';
    const lowerMomentum = momentum.toLowerCase();
    
    if (lowerMomentum.includes('surging') || lowerMomentum.includes('skyrocketing')) return 12;
    if (lowerMomentum.includes('accelerating') || lowerMomentum.includes('strong')) return 8;
    if (lowerMomentum.includes('increasing') || lowerMomentum.includes('rising')) return 5;
    if (lowerMomentum.includes('stable') || lowerMomentum.includes('steady')) return 0;
    if (lowerMomentum.includes('weakening') || lowerMomentum.includes('declining')) return -5;
    if (lowerMomentum.includes('plummeting') || lowerMomentum.includes('crashing')) return -10;
    
    // Fallback based on sentiment score deviation from neutral (50)
    const deviation = (asset.sentiment.sentimentScore - 50) / 5;
    return deviation;
  };

  // Get strongest momentum assets
  const strongestMomentum = assets
    .filter(a => a.sentiment)
    .map(asset => ({
      ...asset,
      momentum: asset.sentiment?.metadata?.sentimentVelocity || calculateMomentum(asset)
    }))
    .sort((a, b) => b.momentum - a.momentum)
    .slice(0, 3);

  // Get sentiment reversals - assets with significant negative momentum
  const sentimentReversals = assets
    .filter(a => a.sentiment)
    .map(asset => ({
      ...asset,
      momentum: asset.sentiment?.metadata?.sentimentVelocity || calculateMomentum(asset),
      previousStatus: asset.sentiment?.metadata?.momentum || ''
    }))
    .filter(a => {
      // Look for assets with negative momentum or weakening trends
      return a.momentum < -3 || 
             a.previousStatus.toLowerCase().includes('weakening') ||
             a.previousStatus.toLowerCase().includes('reversing');
    })
    .sort((a, b) => a.momentum - b.momentum)
    .slice(0, 3);

  // Get contrarian opportunities
  const contrarianOpportunities = assets
    .filter(a => a.sentiment && a.sentiment.sentimentScore < 40)
    .sort((a, b) => (a.sentiment?.sentimentScore || 0) - (b.sentiment?.sentimentScore || 0))
    .slice(0, 2);

  return (
    <div className="space-y-2 sm:space-y-3">
      {/* Strongest Momentum */}
      <div className="bg-background-secondary rounded-none sm:rounded-lg p-3 border border-border-primary">
        <h3 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4" />
          Strongest Momentum
        </h3>
        <div className="space-y-2">
          {strongestMomentum.map((asset, index) => (
            <div key={asset.ticker} className="flex justify-between items-center py-1.5 border-b border-border-primary last:border-0">
              <div>
                <div className="font-medium text-text-primary text-sm">{asset.ticker}</div>
                <div className="text-xs text-text-muted">+{Math.abs(asset.momentum).toFixed(1)}% velocity</div>
              </div>
              <div className="text-green-400 font-bold text-sm">
                +{asset.momentum.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sentiment Reversals */}
      <div className="bg-background-secondary rounded-none sm:rounded-lg p-3 border border-border-primary">
        <h3 className="text-sm font-semibold text-orange-400 mb-2 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4" />
          Sentiment Reversals
        </h3>
        <div className="space-y-2">
          {sentimentReversals.length > 0 ? (
            sentimentReversals.map((asset, index) => (
              <div key={asset.ticker} className="flex justify-between items-center py-1.5 border-b border-border-primary last:border-0">
                <div>
                  <div className="font-medium text-text-primary text-sm">{asset.ticker}</div>
                  <div className="text-xs text-text-muted">
                    {asset.momentum < -10 ? 'Accelerating decline' : 
                     asset.previousStatus.toLowerCase().includes('weakening') ? 'Weakening' :
                     'Turning negative'}
                  </div>
                </div>
                <div className="text-red-400 font-bold text-sm">
                  {asset.momentum.toFixed(1)}%
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-3 text-text-muted text-xs">
              No reversals detected
            </div>
          )}
        </div>
      </div>

      {/* Contrarian Opportunities */}
      <div className="bg-background-secondary rounded-none sm:rounded-lg p-3 border border-border-primary">
        <h3 className="text-sm font-semibold text-purple-400 mb-2 flex items-center gap-1.5">
          <TrendingDown className="w-4 h-4" />
          Contrarian Opportunities
        </h3>
        <div className="space-y-2">
          {contrarianOpportunities.map((asset, index) => (
            <div key={asset.ticker} className="flex justify-between items-center py-1.5 border-b border-border-primary last:border-0">
              <div>
                <div className="font-medium text-text-primary text-sm">{asset.ticker}</div>
                <div className="text-xs text-text-muted">
                  {asset.sentiment?.sentimentScore && asset.sentiment.sentimentScore < 30 
                    ? 'Oversold?' 
                    : 'Low sentiment'}
                </div>
              </div>
              <div className="text-purple-400 font-bold text-xs">
                {(asset.sentiment?.sentimentScore ?? 50) < 35 ? 'CONTRARIAN' : 'WATCH'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}