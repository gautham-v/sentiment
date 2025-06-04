'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import InfoTooltip from './InfoTooltip';

interface MomentumIndicatorProps {
  velocity: number; // Percentage change in sentiment
  showValue?: boolean;
}

export default function MomentumIndicator({ velocity, showValue = true }: MomentumIndicatorProps) {
  const getIcon = () => {
    if (velocity > 5) return TrendingUp;
    if (velocity < -5) return TrendingDown;
    return Minus;
  };

  const getColor = () => {
    if (velocity > 5) return 'text-green-500';
    if (velocity < -5) return 'text-red-500';
    return 'text-gray-500';
  };

  const Icon = getIcon();

  return (
    <div className="flex items-center gap-1.5">
      <div className={`flex items-center gap-1 ${getColor()}`}>
        <Icon className="w-4 h-4" />
        {showValue && (
          <span className="text-sm font-medium">
            {velocity > 0 ? '+' : ''}{velocity.toFixed(1)}%
          </span>
        )}
      </div>
      <InfoTooltip 
        content={`Sentiment momentum: ${Math.abs(velocity).toFixed(1)}% ${velocity > 0 ? 'increase' : 'decrease'} in sentiment velocity. High momentum often precedes price movements.`}
      />
    </div>
  );
}