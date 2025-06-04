interface DataPoint {
  date: Date;
  sentiment: number;
  price: number;
}

/**
 * Calculate Pearson correlation coefficient between sentiment scores and price changes
 * Returns a value between -1 and 1:
 * - 1: Perfect positive correlation
 * - 0: No correlation
 * - -1: Perfect negative correlation
 */
export function calculateCorrelation(dataPoints: DataPoint[]): number {
  if (dataPoints.length < 2) {
    return 0;
  }

  // Calculate price changes (percentage)
  const priceChanges: number[] = [];
  for (let i = 1; i < dataPoints.length; i++) {
    const change = ((dataPoints[i].price - dataPoints[i - 1].price) / dataPoints[i - 1].price) * 100;
    priceChanges.push(change);
  }

  // Get corresponding sentiment scores (excluding the first one)
  const sentiments = dataPoints.slice(1).map(dp => dp.sentiment);

  // Calculate means
  const meanPriceChange = priceChanges.reduce((sum, val) => sum + val, 0) / priceChanges.length;
  const meanSentiment = sentiments.reduce((sum, val) => sum + val, 0) / sentiments.length;

  // Calculate correlation
  let numerator = 0;
  let denomPriceChange = 0;
  let denomSentiment = 0;

  for (let i = 0; i < priceChanges.length; i++) {
    const priceDeviation = priceChanges[i] - meanPriceChange;
    const sentimentDeviation = sentiments[i] - meanSentiment;
    
    numerator += priceDeviation * sentimentDeviation;
    denomPriceChange += priceDeviation * priceDeviation;
    denomSentiment += sentimentDeviation * sentimentDeviation;
  }

  const denominator = Math.sqrt(denomPriceChange * denomSentiment);
  
  if (denominator === 0) {
    return 0;
  }

  const correlation = numerator / denominator;
  
  // Round to 2 decimal places
  return Math.round(correlation * 100) / 100;
}

/**
 * Calculate rolling correlation over a specified window
 */
export function calculateRollingCorrelation(
  dataPoints: DataPoint[],
  windowSize: number = 7
): number[] {
  const correlations: number[] = [];
  
  if (dataPoints.length < windowSize) {
    return [calculateCorrelation(dataPoints)];
  }

  for (let i = windowSize - 1; i < dataPoints.length; i++) {
    const window = dataPoints.slice(i - windowSize + 1, i + 1);
    correlations.push(calculateCorrelation(window));
  }

  return correlations;
}

/**
 * Detect sentiment-price divergence
 * Returns true if sentiment and price are moving in opposite directions
 */
export function detectDivergence(
  recentDataPoints: DataPoint[],
  threshold: number = 0.3
): boolean {
  if (recentDataPoints.length < 2) {
    return false;
  }

  const correlation = calculateCorrelation(recentDataPoints);
  
  // Check if correlation is negative and significant
  if (correlation < -threshold) {
    return true;
  }

  // Also check recent trend divergence
  const lastTwo = recentDataPoints.slice(-2);
  if (lastTwo.length === 2) {
    const sentimentChange = lastTwo[1].sentiment - lastTwo[0].sentiment;
    const priceChange = lastTwo[1].price - lastTwo[0].price;
    
    // If sentiment and price are moving in opposite directions
    if ((sentimentChange > 0 && priceChange < 0) || (sentimentChange < 0 && priceChange > 0)) {
      return true;
    }
  }

  return false;
}

/**
 * Calculate correlation strength description
 */
export function getCorrelationStrength(correlation: number): string {
  const absCorr = Math.abs(correlation);
  
  if (absCorr >= 0.8) return 'Very Strong';
  if (absCorr >= 0.6) return 'Strong';
  if (absCorr >= 0.4) return 'Moderate';
  if (absCorr >= 0.2) return 'Weak';
  return 'Very Weak';
}

/**
 * Generate mock correlation for development
 */
export function getMockCorrelation(ticker: string): number {
  // Generate consistent but varied correlations for different assets
  const seed = ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const base = (seed % 100) / 100;
  
  // Add some randomness
  const variance = (Math.random() - 0.5) * 0.2;
  const correlation = base + variance;
  
  // Ensure it's between -1 and 1
  return Math.max(-1, Math.min(1, correlation));
}

export default {
  calculateCorrelation,
  calculateRollingCorrelation,
  detectDivergence,
  getCorrelationStrength,
  getMockCorrelation
};