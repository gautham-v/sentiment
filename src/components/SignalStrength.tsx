'use client';

import InfoTooltip from './InfoTooltip';

interface SignalStrengthProps {
  strength: number; // 1-5
  showLabel?: boolean;
}

export default function SignalStrength({ strength, showLabel = false }: SignalStrengthProps) {
  const getBarColor = (index: number) => {
    if (index >= strength) return 'bg-border-primary';
    if (strength >= 4) return 'bg-status-bullish';
    if (strength >= 2) return 'bg-yellow-500';
    return 'bg-status-bearish';
  };

  const getStrengthLabel = () => {
    if (strength >= 4) return 'Strong';
    if (strength >= 2) return 'Moderate';
    return 'Weak';
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`w-0.5 transition-all duration-300 rounded-full ${getBarColor(i)}`}
            style={{ height: `${12 + (i * 2)}px` }}
          />
        ))}
      </div>
      {showLabel && (
        <span className="text-xs text-text-muted">
          {getStrengthLabel()}
        </span>
      )}
      <InfoTooltip 
        content={`Signal strength combines sentiment score, momentum, volume, and correlation. ${strength}/5 indicates ${getStrengthLabel().toLowerCase()} conviction.`}
      />
    </div>
  );
}