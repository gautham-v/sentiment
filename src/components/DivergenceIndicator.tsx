'use client';

import { AlertTriangle } from 'lucide-react';
import InfoTooltip from './InfoTooltip';

interface DivergenceIndicatorProps {
  sentimentChange: number;
  priceChange: number;
  correlation: number;
}

export default function DivergenceIndicator({ sentimentChange, priceChange, correlation }: DivergenceIndicatorProps) {
  // Check for divergence
  const isDiverging = (sentimentChange > 0 && priceChange < 0) || (sentimentChange < 0 && priceChange > 0);
  const divergenceStrength = Math.abs(sentimentChange - priceChange);
  
  if (!isDiverging || divergenceStrength < 5) {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      <AlertTriangle className="w-4 h-4 text-yellow-500 animate-pulse" />
      <span className="text-xs font-medium text-yellow-500">Divergence</span>
      <InfoTooltip 
        content={`Sentiment ${sentimentChange > 0 ? 'rising' : 'falling'} while price ${priceChange > 0 ? 'rising' : 'falling'}. This divergence may signal a potential reversal.`}
      />
    </div>
  );
}