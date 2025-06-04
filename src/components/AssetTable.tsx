'use client';

import { useState, Fragment } from 'react';
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown, Minus, BarChart3, Users, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { AssetWithSentiment } from '@/types';
import SignalStrength from './SignalStrength';
import MomentumIndicator from './MomentumIndicator';
import InfoTooltip from './InfoTooltip';
import AssetLogo from './AssetLogo';
import SourceLogo from './SourceLogo';
import HistoricalSentimentChart from './HistoricalSentimentChart';

interface AssetTableProps {
  assets: AssetWithSentiment[];
  lastSentimentUpdate?: string;
}

export default function AssetTable({ assets, lastSentimentUpdate }: AssetTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ 
    key: 'sentimentScore',
    direction: 'desc'
  });
  const [selectedCases, setSelectedCases] = useState<Record<string, 'bearish' | 'neutral' | 'bullish'>>({});

  // Calculate signal strength based on multiple factors
  const calculateSignalStrength = (asset: AssetWithSentiment): number => {
    if (!asset.sentiment) return 1;
    
    const score = asset.sentiment.sentimentScore;
    const confidence = asset.sentiment.confidence;
    const correlation = Math.abs(asset.sentiment.correlation);
    
    // Use real signal strength if available, otherwise calculate
    if (asset.sentiment.metadata?.signalStrength) {
      return asset.sentiment.metadata.signalStrength;
    }
    
    // Weighted calculation
    const strength = (score * 0.4 + confidence * 0.3 + correlation * 100 * 0.3) / 20;
    return Math.min(Math.max(Math.round(strength), 1), 5);
  };

  // Calculate sentiment velocity
  const calculateVelocity = (asset: AssetWithSentiment): number => {
    if (!asset.sentiment) return 0;
    
    // Use real velocity if available
    if (asset.sentiment.metadata?.sentimentVelocity !== undefined) {
      return asset.sentiment.metadata.sentimentVelocity;
    }
    
    // Fallback calculation based on momentum text description
    const momentum = asset.sentiment.metadata?.momentum || '';
    const lowerMomentum = momentum.toLowerCase();
    
    // Parse momentum descriptions more accurately
    if (lowerMomentum.includes('surging') || lowerMomentum.includes('skyrocketing')) return 15;
    if (lowerMomentum.includes('accelerating') || lowerMomentum.includes('strong')) return 10;
    if (lowerMomentum.includes('increasing') || lowerMomentum.includes('rising')) return 5;
    if (lowerMomentum.includes('stable') || lowerMomentum.includes('steady')) return 0;
    if (lowerMomentum.includes('weakening') || lowerMomentum.includes('declining')) return -5;
    if (lowerMomentum.includes('plummeting') || lowerMomentum.includes('crashing')) return -10;
    if (lowerMomentum.includes('reversing') || lowerMomentum.includes('falling')) return -8;
    
    // Default to slightly positive if bullish, slightly negative if bearish
    if (asset.sentiment.status === 'bullish') return 2;
    if (asset.sentiment.status === 'bearish') return -2;
    return 0;
  };

  // Calculate risk level based on volatility and asset type
  const calculateRiskLevel = (asset: AssetWithSentiment): 'low' | 'medium' | 'high' => {
    if (asset.type === 'crypto') return 'high';
    if (!asset.sentiment) return 'medium';
    
    const volatility = Math.abs(asset.sentiment.change24h);
    if (volatility > 5) return 'high';
    if (volatility > 2) return 'medium';
    return 'low';
  };



  // Calculate action recommendation
  const calculateAction = (asset: AssetWithSentiment): 'BUY' | 'SELL' | 'HOLD' | 'WATCH' | 'AVOID' => {
    if (!asset.sentiment) return 'HOLD';
    
    // Use real recommendation if available
    if (asset.sentiment.metadata?.recommendation) {
      return asset.sentiment.metadata.recommendation;
    }
    
    const score = asset.sentiment.sentimentScore;
    const velocity = calculateVelocity(asset);
    const risk = calculateRiskLevel(asset);
    
    // Strong buy signals
    if (score > 75 && velocity > 5 && risk !== 'high') return 'BUY';
    
    // Sell signals
    if (score < 25 && velocity < -5) return 'SELL';
    
    // Watch for potential opportunities
    if (score < 35 && velocity > 0) return 'WATCH'; // Oversold bounce potential
    
    // Avoid deteriorating assets
    if (score < 40 && velocity < -10) return 'AVOID';
    
    // Default to HOLD
    return 'HOLD';
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'yesterday';
    return `${diffDays}d ago`;
  };

  const toggleExpand = (ticker: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(ticker)) {
      newExpanded.delete(ticker);
    } else {
      newExpanded.add(ticker);
    }
    setExpandedRows(newExpanded);
  };

  // Helper functions for AI analysis slider
  const getDefaultCase = (asset: AssetWithSentiment): 'bearish' | 'neutral' | 'bullish' => {
    const score = getCombinedSentiment(asset);
    if (score >= 70) return 'bullish';
    if (score >= 40) return 'neutral';  
    return 'bearish';
  };

  const getSelectedCase = (ticker: string, asset: AssetWithSentiment) => {
    return selectedCases[ticker] || getDefaultCase(asset);
  };

  const setSelectedCase = (ticker: string, caseType: 'bearish' | 'neutral' | 'bullish') => {
    setSelectedCases(prev => ({ ...prev, [ticker]: caseType }));
  };

  // Use stored sentiment score (calculated by cron job with weighted approach)
  const getCombinedSentiment = (asset: AssetWithSentiment): number => {
    if (!asset.sentiment) return 0;
    
    // Use the sentiment score calculated and stored by the cron job
    // This uses the proper weighted calculation with Reddit minimum 10%
    return asset.sentiment.sentimentScore;
  };

  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const getSortValue = (asset: AssetWithSentiment, key: string) => {
    switch (key) {
      case 'ticker': return asset.ticker;
      case 'name': return asset.name;
      case 'sentimentScore': return getCombinedSentiment(asset);
      case 'correlation': return asset.sentiment?.correlation || 0;
      case 'status': return asset.sentiment?.status || '';
      case 'change24h': return asset.sentiment?.change24h || 0;
      case 'price': return asset.sentiment?.price || 0;
      default: return 0;
    }
  };

  const sortedAssets = [...assets].sort((assetA, assetB) => {
    const valueA = getSortValue(assetA, sortConfig.key);
    const valueB = getSortValue(assetB, sortConfig.key);
    
    if (sortConfig.direction === 'asc') {
      if (valueA < valueB) return -1;
      if (valueA > valueB) return 1;
      return 0;
    } else {
      if (valueA > valueB) return -1;
      if (valueA < valueB) return 1;
      return 0;
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'bullish': return <TrendingUp className="w-3 h-3 text-status-bullish" />;
      case 'bearish': return <TrendingDown className="w-4 h-4 text-status-bearish" />;
      default: return <Minus className="w-4 h-4 text-status-neutral" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'bullish': return 'text-status-bullish';
      case 'bearish': return 'text-status-bearish';
      default: return 'text-status-neutral';
    }
  };

  const getSentimentColor = (score: number) => {
    if (score >= 70) return '#22c55e';
    if (score >= 50) return '#fbbf24';
    return '#ef4444';
  };

  const getVolumeSignalColor = (signal: string) => {
    if (signal.includes('increasing') || signal.includes('spike')) return '#22c55e';
    if (signal.includes('declining') || signal.includes('selling')) return '#ef4444';
    return '#fbbf24';
  };

  return (
    <div className="card p-0 overflow-hidden rounded-none sm:rounded-lg">
      {/* Table Header */}
      <div className="bg-background-tertiary p-3 sm:p-2 border-b border-border-primary">
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-text-primary">Market Sentiment Analysis</h3>
          <p className="text-xs text-text-muted mt-0.5">Click on any row to expand detailed analysis</p>
          {lastSentimentUpdate && (
            <div className="text-[10px] sm:text-xs text-text-muted mt-1">
              Updated {new Date(lastSentimentUpdate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric'
              })} at {new Date(lastSentimentUpdate).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true,
                timeZoneName: 'short'
              })}
            </div>
          )}
        </div>
      </div>

      {/* Table - Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-background-tertiary relative z-10">
            <tr>
              <th className="text-left p-2 text-text-secondary font-medium text-xs">
                <button onClick={() => handleSort('ticker')} className="flex items-center gap-1 hover:text-text-primary">
                  Asset
                  <ChevronDown className={`w-3 h-3 transition-transform ${sortConfig.key === 'ticker' && sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} />
                </button>
              </th>
              <th className="text-left p-2 text-text-secondary font-medium text-xs">
                <div className="flex items-center gap-1">
                  <span>Signal</span>
                  <InfoTooltip content="Signal strength combines multiple factors to show conviction level" className="ml-1" />
                </div>
              </th>
              <th className="text-left p-2 text-text-secondary font-medium text-xs">
                <button onClick={() => handleSort('sentimentScore')} className="flex items-center gap-1 hover:text-text-primary">
                  Combined Sentiment
                  <ChevronDown className={`w-3 h-3 transition-transform ${sortConfig.key === 'sentimentScore' && sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} />
                </button>
              </th>
              <th className="text-left p-2 text-text-secondary font-medium text-xs">
                <div className="flex items-center gap-1">
                  <span>Momentum</span>
                  <InfoTooltip content="Rate of sentiment change - high momentum often precedes price movements" className="ml-1" />
                </div>
              </th>
              <th className="text-left p-2 text-text-secondary font-medium text-xs">
                <button onClick={() => handleSort('change24h')} className="flex items-center gap-1 hover:text-text-primary">
                  24h Change
                  <ChevronDown className={`w-3 h-3 transition-transform ${sortConfig.key === 'change24h' && sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} />
                </button>
              </th>
              <th className="text-left p-2 text-text-secondary font-medium text-xs">
                <button onClick={() => handleSort('price')} className="flex items-center gap-1 hover:text-text-primary">
                  Price
                  <ChevronDown className={`w-3 h-3 transition-transform ${sortConfig.key === 'price' && sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedAssets.map((asset) => (
              <Fragment key={asset.ticker}>
                {/* Main Row */}
                <tr 
                  className="border-b border-border-primary hover:bg-background-tertiary transition-colors cursor-pointer"
                  onClick={() => toggleExpand(asset.ticker)}
                >
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      {expandedRows.has(asset.ticker) ? 
                        <ChevronDown className="w-3 h-3 text-text-muted" /> : 
                        <ChevronRight className="w-3 h-3 text-text-muted" />
                      }
                      <div className="flex items-center gap-2">
                        <AssetLogo ticker={asset.ticker} size="md" />
                        <div>
                          <div className="font-semibold text-text-primary text-sm">{asset.ticker}</div>
                          <div className="text-xs text-text-muted">{asset.name}</div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-2">
                    <SignalStrength 
                      strength={asset.sentiment?.metadata?.signalStrength || calculateSignalStrength(asset)} 
                      showLabel={false}
                    />
                  </td>
                  <td className="p-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold">
                          {asset.sentiment ? getCombinedSentiment(asset) : '--'}
                        </span>
                        <div className="flex-1 max-w-[40px]">
                          <div className="h-0.5 bg-background-tertiary rounded-full overflow-hidden">
                            <div 
                              className="h-full transition-all duration-300 rounded-full"
                              style={{
                                width: `${asset.sentiment ? getCombinedSentiment(asset) : 0}%`,
                                backgroundColor: getSentimentColor(asset.sentiment ? getCombinedSentiment(asset) : 0)
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-2">
                    <MomentumIndicator 
                      velocity={asset.sentiment?.metadata?.sentimentVelocity || calculateVelocity(asset)}
                      showValue={true}
                    />
                  </td>
                  <td className="p-2">
                    <span className={`font-medium text-sm ${
                      (asset.sentiment?.change24h || 0) >= 0 ? 'text-status-bullish' : 'text-status-bearish'
                    }`}>
                      {asset.sentiment?.change24h ? 
                        `${asset.sentiment.change24h >= 0 ? '+' : ''}${asset.sentiment.change24h.toFixed(2)}%` : 
                        '--'
                      }
                    </span>
                  </td>
                  <td className="p-2">
                    <div>
                      <span className="font-medium text-text-primary text-sm">
                        ${asset.sentiment?.price ? asset.sentiment.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '--'}
                      </span>
                      {asset.sentiment?.createdAt && (
                        <div className="text-[10px] text-text-muted">
                          {getRelativeTime(asset.sentiment.createdAt)}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>

                {/* Expanded Row */}
                {expandedRows.has(asset.ticker) && asset.sentiment && (
                  <tr className="bg-background-secondary">
                    <td colSpan={10} className="p-4">
                      <div className="max-w-7xl mx-auto space-y-4">
                        {/* Sentiment Sources and Key Metrics Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {/* Left Column: Sentiment Sources */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-text-primary mb-2 flex items-center gap-1.5 text-sm">
                              <BarChart3 className="w-3 h-3 text-accent-primary" />
                              Sentiment Sources
                            </h4>
                            <div className="bg-background-primary p-3 rounded-lg border border-border-primary space-y-2">
                              {/* Reddit */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <SourceLogo source="reddit" />
                                  <span className="text-xs text-text-secondary">Reddit</span>
                                  <span className="text-xs text-text-muted">({asset.sentiment.sourcesData.redditMentions})</span>
                                </div>
                                <span className="font-bold text-sm" style={{ color: getSentimentColor(asset.sentiment.sourcesData.redditSentiment) }}>
                                  {asset.sentiment.sourcesData.redditSentiment}
                                </span>
                              </div>
                              
                              {/* StockTwits */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <SourceLogo source="stocktwits" />
                                  <span className="text-xs text-text-secondary">StockTwits</span>
                                  <span className="text-xs text-text-muted">({asset.sentiment.sourcesData.stocktwitsMessages})</span>
                                </div>
                                <span className="font-bold text-sm" style={{ color: getSentimentColor(asset.sentiment.sourcesData.stocktwitsSentiment) }}>
                                  {asset.sentiment.sourcesData.stocktwitsSentiment}
                                </span>
                              </div>
                              
                              {/* News */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <SourceLogo source="news" />
                                  <span className="text-xs text-text-secondary">News</span>
                                  <span className="text-xs text-text-muted">({asset.sentiment.sourcesData.newsArticles || 0})</span>
                                </div>
                                <span className="font-bold text-sm" style={{ color: getSentimentColor(asset.sentiment.sourcesData.newsSentiment || 50) }}>
                                  {asset.sentiment.sourcesData.newsSentiment || 50}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right Column: Key Metrics */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-text-primary mb-2 text-sm">Key Metrics</h4>
                            <div className="bg-background-primary p-3 rounded-lg border border-border-primary">
                              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-text-muted">Total Mentions:</span>
                                  <span className="font-medium text-accent-primary">{asset.sentiment.sourcesData.mentionsCount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-text-muted">Sources:</span>
                                  <span className="font-medium text-accent-primary">{asset.sentiment.sourcesData.sourcesAnalyzed}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-text-muted">Volume:</span>
                                  <span className="font-medium text-xs" style={{ color: getVolumeSignalColor(asset.sentiment.metadata.volumeSignal) }}>
                                    {asset.sentiment.metadata.volumeSignal}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-text-muted">Correlation:</span>
                                  <span className="font-medium">
                                    {asset.sentiment.correlation ? 
                                      `${asset.sentiment.correlation >= 0 ? '+' : ''}${(asset.sentiment.correlation * 100).toFixed(0)}%` : 
                                      '--'
                                    }
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* AI Analysis Section - Full Width */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-text-primary flex items-center gap-1.5 text-sm">
                              ✨ AI Market Analysis
                            </h4>
                            
                            {/* Case Slider */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-text-muted">View:</span>
                              <div className="flex bg-background-secondary rounded-full p-0.5 border border-border-primary">
                                {['bearish', 'neutral', 'bullish'].map((caseType) => (
                                  <button
                                    key={caseType}
                                    onClick={() => setSelectedCase(asset.ticker, caseType as any)}
                                    className={`px-3 py-1 text-xs font-medium rounded-full transition-all capitalize ${
                                      getSelectedCase(asset.ticker, asset) === caseType
                                        ? caseType === 'bearish' 
                                          ? 'bg-red-500 text-white shadow-sm' 
                                          : caseType === 'neutral'
                                          ? 'bg-gray-500 text-white shadow-sm'
                                          : 'bg-green-500 text-white shadow-sm'
                                        : 'text-text-secondary hover:text-text-primary hover:bg-background-primary'
                                    }`}
                                  >
                                    {caseType}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-background-primary rounded-lg p-4 border border-border-primary">
                            <div className="text-xs text-text-secondary leading-relaxed">
                              {(() => {
                                const selectedCase = getSelectedCase(asset.ticker, asset);
                                
                                if (asset.sentiment.sentimentCases && asset.sentiment.sentimentCases[selectedCase]) {
                                  return asset.sentiment.sentimentCases[selectedCase];
                                }
                                
                                // Fallback to original AI insights if sentiment cases not available
                                return asset.sentiment.aiInsights || 'No analysis available';
                              })()}
                            </div>
                          </div>
                        </div>
                        
                        {/* Full Width Chart Section */}
                        <div className="bg-background-primary rounded-lg p-4 border border-border-primary">
                          <HistoricalSentimentChart 
                            ticker={asset.ticker}
                            currentSentiment={getCombinedSentiment(asset)}
                            currentPrice={asset.sentiment.price}
                            currentCorrelation={asset.sentiment.correlation || 0}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden">
        {sortedAssets.map((asset) => (
          <div 
            key={asset.ticker}
            className="border-b border-border-primary hover:bg-background-tertiary transition-colors cursor-pointer"
            onClick={() => toggleExpand(asset.ticker)}
          >
            {/* Compact Mobile Row */}
            <div className="p-3">
              <div className="flex items-center justify-between">
                {/* Left: Asset Info */}
                <div className="flex items-center gap-2 flex-1">
                  <AssetLogo ticker={asset.ticker} size="md" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text-primary text-sm">{asset.ticker}</span>
                      <span className="text-xs text-text-muted">{asset.name}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      {/* Combined Sentiment */}
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-bold" style={{ color: getSentimentColor(asset.sentiment ? getCombinedSentiment(asset) : 0) }}>
                          {asset.sentiment ? getCombinedSentiment(asset) : '--'}
                        </span>
                        <span className="text-[10px] text-text-muted">sentiment</span>
                      </div>
                      
                      {/* Signal & Momentum */}
                      <div className="flex items-center gap-2">
                        <SignalStrength 
                          strength={asset.sentiment?.metadata?.signalStrength || calculateSignalStrength(asset)} 
                          showLabel={false}
                        />
                        <MomentumIndicator 
                          velocity={asset.sentiment?.metadata?.sentimentVelocity || calculateVelocity(asset)}
                          showValue={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right: Price Info */}
                <div className="text-right">
                  <div className="font-semibold text-text-primary text-sm">
                    ${asset.sentiment?.price ? asset.sentiment.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '--'}
                  </div>
                  <div className={`text-sm font-medium ${
                    (asset.sentiment?.change24h || 0) >= 0 ? 'text-status-bullish' : 'text-status-bearish'
                  }`}>
                    {asset.sentiment?.change24h ? 
                      `${asset.sentiment.change24h >= 0 ? '+' : ''}${asset.sentiment.change24h.toFixed(2)}%` : 
                      '--'
                    }
                  </div>
                </div>
              </div>
              
              {/* Source Sentiments Row */}
              {asset.sentiment && (
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-primary/50">
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <SourceLogo source="reddit" size="xs" />
                      <span className="font-medium" style={{ color: getSentimentColor(asset.sentiment.sourcesData.redditSentiment) }}>
                        {asset.sentiment.sourcesData.redditSentiment}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <SourceLogo source="stocktwits" size="xs" />
                      <span className="font-medium" style={{ color: getSentimentColor(asset.sentiment.sourcesData.stocktwitsSentiment) }}>
                        {asset.sentiment.sourcesData.stocktwitsSentiment}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <SourceLogo source="news" size="xs" />
                      <span className="font-medium" style={{ color: getSentimentColor(asset.sentiment.sourcesData.newsSentiment || 50) }}>
                        {asset.sentiment.sourcesData.newsSentiment || 50}
                      </span>
                    </div>
                  </div>
                  
                  {/* Expand Icon */}
                  <div>
                    {expandedRows.has(asset.ticker) ? 
                      <ChevronDown className="w-4 h-4 text-text-muted" /> : 
                      <ChevronRight className="w-4 h-4 text-text-muted" />
                    }
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Expanded View */}
            {expandedRows.has(asset.ticker) && asset.sentiment && (
              <div className="bg-background-secondary px-3 pb-3 space-y-3">
                {/* Additional Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-background-primary p-2 rounded-lg border border-border-primary">
                    <div className="text-[10px] text-text-muted">Volume</div>
                    <div className="font-medium text-xs" style={{ color: getVolumeSignalColor(asset.sentiment.metadata.volumeSignal) }}>
                      {asset.sentiment.metadata.volumeSignal}
                    </div>
                  </div>
                  <div className="bg-background-primary p-2 rounded-lg border border-border-primary">
                    <div className="text-[10px] text-text-muted">Correlation</div>
                    <div className="font-medium text-xs">
                      {asset.sentiment.correlation ? 
                        `${asset.sentiment.correlation >= 0 ? '+' : ''}${(asset.sentiment.correlation * 100).toFixed(0)}%` : 
                        '--'
                      }
                    </div>
                  </div>
                  <div className="bg-background-primary p-2 rounded-lg border border-border-primary">
                    <div className="text-[10px] text-text-muted">Confidence</div>
                    <div className="font-medium text-xs text-accent-primary">
                      {asset.sentiment.confidence}%
                    </div>
                  </div>
                </div>
                
                {/* Detailed Sentiment Breakdown */}
                <div className="bg-background-primary p-3 rounded-lg border border-border-primary">
                  <h4 className="text-xs font-medium text-text-primary mb-2 flex items-center gap-1">
                    <BarChart3 className="w-3 h-3 text-accent-primary" />
                    Sentiment Breakdown
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <SourceLogo source="reddit" size="xs" />
                        <span className="text-xs text-text-secondary">Reddit</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm" style={{ color: getSentimentColor(asset.sentiment.sourcesData.redditSentiment) }}>
                          {asset.sentiment.sourcesData.redditSentiment}
                        </span>
                        <span className="text-[10px] text-text-muted">
                          ({asset.sentiment.sourcesData.redditMentions} mentions)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <SourceLogo source="stocktwits" size="xs" />
                        <span className="text-xs text-text-secondary">StockTwits</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm" style={{ color: getSentimentColor(asset.sentiment.sourcesData.stocktwitsSentiment) }}>
                          {asset.sentiment.sourcesData.stocktwitsSentiment}
                        </span>
                        <span className="text-[10px] text-text-muted">
                          ({asset.sentiment.sourcesData.stocktwitsMessages} msgs)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <SourceLogo source="news" size="xs" />
                        <span className="text-xs text-text-secondary">News</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm" style={{ color: getSentimentColor(asset.sentiment.sourcesData.newsSentiment || 50) }}>
                          {asset.sentiment.sourcesData.newsSentiment || 50}
                        </span>
                        <span className="text-[10px] text-text-muted">
                          ({asset.sentiment.sourcesData.newsArticles || 0} articles)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* AI Analysis with Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-medium text-text-primary flex items-center gap-1">
                      ✨ AI Market Analysis
                    </h4>
                    
                    {/* Mobile Case Slider */}
                    <div className="flex bg-background-secondary rounded-full p-0.5 border border-border-primary">
                      {['bearish', 'neutral', 'bullish'].map((caseType) => (
                        <button
                          key={caseType}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCase(asset.ticker, caseType as any);
                          }}
                          className={`px-2 py-0.5 text-[10px] font-medium rounded-full transition-all capitalize ${
                            getSelectedCase(asset.ticker, asset) === caseType
                              ? caseType === 'bearish' 
                                ? 'bg-red-500 text-white shadow-sm' 
                                : caseType === 'neutral'
                                ? 'bg-gray-500 text-white shadow-sm'
                                : 'bg-green-500 text-white shadow-sm'
                              : 'text-text-secondary hover:text-text-primary hover:bg-background-primary'
                          }`}
                        >
                          {caseType}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-background-primary rounded-lg p-3 border border-border-primary">
                    <div className="text-[11px] text-text-secondary leading-relaxed">
                      {(() => {
                        const selectedCase = getSelectedCase(asset.ticker, asset);
                        
                        if (asset.sentiment.sentimentCases && asset.sentiment.sentimentCases[selectedCase]) {
                          return asset.sentiment.sentimentCases[selectedCase];
                        }
                        
                        // Fallback to original AI insights if sentiment cases not available
                        return asset.sentiment.aiInsights || 'No analysis available';
                      })()}
                    </div>
                  </div>
                </div>
                
                {/* Chart Section */}
                <div className="bg-background-primary rounded-lg p-3 border border-border-primary">
                  <HistoricalSentimentChart 
                    ticker={asset.ticker}
                    currentSentiment={getCombinedSentiment(asset)}
                    currentPrice={asset.sentiment.price}
                    currentCorrelation={asset.sentiment.correlation || 0}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 