// I need to replace the expanded section manually due to its complexity
// Starting from line 402 to line 564 approximately

const newExpandedSection = `                {/* Expanded Row */}
                {expandedRows.has(asset.ticker) && asset.sentiment && (
                  <tr className="bg-background-secondary">
                    <td colSpan={10} className="p-4">
                      <div className="max-w-7xl mx-auto space-y-4">
                        {/* Sentiment & Metrics Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {/* Compact Sentiment Breakdown */}
                          <div>
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
                          
                          {/* Compact Key Metrics */}
                          <div>
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
                                      \`\${asset.sentiment.correlation >= 0 ? '+' : ''}\${(asset.sentiment.correlation * 100).toFixed(0)}%\` : 
                                      '--'
                                    }
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Full Width AI Analysis with Slider */}
                        <div className="bg-background-primary rounded-lg p-4 border border-border-primary">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium text-text-primary flex items-center gap-1.5 text-sm">
                              ✨ AI Analysis
                            </h4>
                            
                            {/* Case Slider */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  const cases = ['bearish', 'neutral', 'bullish'] as const;
                                  const current = getSelectedCase(asset.ticker, asset);
                                  const currentIndex = cases.indexOf(current);
                                  const prevIndex = currentIndex > 0 ? currentIndex - 1 : cases.length - 1;
                                  setSelectedCase(asset.ticker, cases[prevIndex]);
                                }}
                                className="p-1 hover:bg-background-tertiary rounded transition-colors"
                              >
                                <ChevronLeft className="w-4 h-4 text-text-muted" />
                              </button>
                              
                              <div className="flex items-center gap-3">
                                {['bearish', 'neutral', 'bullish'].map((caseType) => {
                                  const isSelected = getSelectedCase(asset.ticker, asset) === caseType;
                                  const getIcon = () => {
                                    switch(caseType) {
                                      case 'bearish': return '📉';
                                      case 'neutral': return '➡️';
                                      case 'bullish': return '📈';
                                    }
                                  };
                                  const getColor = () => {
                                    switch(caseType) {
                                      case 'bearish': return isSelected ? 'text-red-600' : 'text-text-muted';
                                      case 'neutral': return isSelected ? 'text-gray-600' : 'text-text-muted';
                                      case 'bullish': return isSelected ? 'text-green-600' : 'text-text-muted';
                                    }
                                  };
                                  
                                  return (
                                    <button
                                      key={caseType}
                                      onClick={() => setSelectedCase(asset.ticker, caseType as any)}
                                      className={\`flex items-center gap-1 px-3 py-2 rounded-lg transition-all \${
                                        isSelected 
                                          ? 'bg-background-tertiary font-medium' 
                                          : 'hover:bg-background-tertiary/50'
                                      }\`}
                                    >
                                      <span>{getIcon()}</span>
                                      <span className={\`text-xs capitalize \${getColor()}\`}>
                                        {caseType}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                              
                              <button
                                onClick={() => {
                                  const cases = ['bearish', 'neutral', 'bullish'] as const;
                                  const current = getSelectedCase(asset.ticker, asset);
                                  const currentIndex = cases.indexOf(current);
                                  const nextIndex = currentIndex < cases.length - 1 ? currentIndex + 1 : 0;
                                  setSelectedCase(asset.ticker, cases[nextIndex]);
                                }}
                                className="p-1 hover:bg-background-tertiary rounded transition-colors"
                              >
                                <ChevronRightIcon className="w-4 h-4 text-text-muted" />
                              </button>
                            </div>
                          </div>
                          
                          {/* Case Content */}
                          {asset.sentiment.sentimentCases ? (
                            <div className="min-h-[120px]">
                              {(() => {
                                const selectedCase = getSelectedCase(asset.ticker, asset);
                                const caseContent = asset.sentiment.sentimentCases[selectedCase];
                                const getBgColor = () => {
                                  switch(selectedCase) {
                                    case 'bearish': return 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800';
                                    case 'neutral': return 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700';
                                    case 'bullish': return 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800';
                                  }
                                };
                                
                                return (
                                  <div className={\`p-4 rounded-lg border \${getBgColor()}\`}>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                      {caseContent}
                                    </p>
                                  </div>
                                );
                              })()}
                            </div>
                          ) : (
                            // Fallback content
                            <div className="p-4 bg-background-secondary rounded-lg">
                              <p className="text-sm text-text-secondary leading-relaxed">
                                {asset.sentiment.aiInsights}
                              </p>
                              <div className="mt-3">
                                <p className="text-xs text-text-muted mb-2">Key Factors:</p>
                                <div className="flex flex-wrap gap-1">
                                  {asset.sentiment.metadata.keyFactors.map((factor, index) => (
                                    <span 
                                      key={index}
                                      className="px-2 py-1 bg-accent-primary/10 text-accent-primary text-xs rounded-full border border-accent-primary/20"
                                    >
                                      {factor}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Full Width Chart Section */}
                        <div className="bg-background-primary rounded-lg p-4 border border-border-primary">
                          <HistoricalSentimentChart 
                            ticker={asset.ticker}
                            currentSentiment={calculateCombinedSentiment(asset)}
                            currentPrice={asset.sentiment.price}
                            currentCorrelation={asset.sentiment.correlation || 0}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                )}`;

console.log(newExpandedSection);