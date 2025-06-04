'use client';

import React, { useState, useEffect } from 'react';
import SentimentTrendChart from './SentimentTrendChart';
import { Calendar } from 'lucide-react';

interface HistoricalSentimentChartProps {
  ticker: string;
  currentSentiment: number;
  currentPrice: number;
  currentCorrelation: number;
  isMobile?: boolean;
}

type TimePeriod = '1W' | '1M' | '3M' | '1Y';

const PERIOD_DAYS: Record<TimePeriod, number> = {
  '1W': 7,
  '1M': 30,
  '3M': 90,
  '1Y': 365
};

export default function HistoricalSentimentChart({ 
  ticker, 
  currentSentiment, 
  currentPrice, 
  currentCorrelation,
  isMobile = false
}: HistoricalSentimentChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('1M');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch historical price data
        const days = PERIOD_DAYS[selectedPeriod];
        const response = await fetch(`/api/sentiment/history?ticker=${ticker}&days=${days}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch historical data');
        }
        
        const apiResponse = await response.json();
        
        // The API returns { success: true, data: { ticker, days, data: [...] } }
        const processedData = apiResponse.data?.data || [];
        
        // Add today's real sentiment data
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Check if today's data exists in historical data
        const todayExists = processedData.some((item: any) => {
          const itemDate = new Date(item.date);
          itemDate.setHours(0, 0, 0, 0);
          return itemDate.getTime() === today.getTime();
        });
        
        if (!todayExists) {
          // Add current data point for today
          processedData.push({
            date: today.toISOString(),
            sentiment: currentSentiment,
            price: currentPrice,
            correlation: currentCorrelation
          });
        } else {
          // Update today's data with current values
          const todayIndex = processedData.findIndex((item: any) => {
            const itemDate = new Date(item.date);
            itemDate.setHours(0, 0, 0, 0);
            return itemDate.getTime() === today.getTime();
          });
          
          if (todayIndex !== -1) {
            processedData[todayIndex] = {
              ...processedData[todayIndex],
              sentiment: currentSentiment,
              price: currentPrice,
              correlation: currentCorrelation
            };
          }
        }
        
        // Sort by date
        processedData.sort((a: any, b: any) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        setData(processedData);
      } catch (err) {
        console.error('Error fetching historical data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        
        // If API fails, at least show current data
        setData([{
          date: new Date().toISOString(),
          sentiment: currentSentiment,
          price: currentPrice,
          correlation: currentCorrelation
        }]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [ticker, selectedPeriod, currentSentiment, currentPrice, currentCorrelation]);

  const ChartLoadingState = () => (
    <div className="flex items-center justify-center h-64">
      <div className="text-sm text-text-muted">Loading historical data...</div>
    </div>
  );

  if (error && data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-status-bearish">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header with time period selector - Desktop Only */}
      {!isMobile && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Calendar className="w-4 h-4" />
            <span>Price History & Sentiment Trend</span>
          </div>
          
          {/* Time Period Selector - Desktop */}
          <div className="flex gap-1">
            {(['1W', '1M', '3M', '1Y'] as TimePeriod[]).map((period) => (
              <button
                key={period}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPeriod(period);
                }}
                disabled={loading}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  selectedPeriod === period
                    ? 'bg-accent-primary text-white'
                    : loading 
                    ? 'bg-background-secondary text-text-muted opacity-50 cursor-not-allowed'
                    : 'bg-background-secondary text-text-muted hover:bg-background-tertiary'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Chart */}
      {loading ? <ChartLoadingState /> : <SentimentTrendChart ticker={ticker} data={data} isMobile={isMobile} />}
      
      {/* Time Period Selector - Mobile (Below Chart) */}
      {isMobile && (
        <div className="flex justify-center">
          <div className="flex gap-1 bg-background-secondary p-1 rounded-lg border border-border-primary">
            {(['1W', '1M', '3M', '1Y'] as TimePeriod[]).map((period) => (
              <button
                key={period}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPeriod(period);
                }}
                disabled={loading}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  selectedPeriod === period
                    ? 'bg-accent-primary text-white shadow-sm'
                    : loading
                    ? 'text-text-muted opacity-50 cursor-not-allowed'
                    : 'text-text-muted hover:text-text-primary hover:bg-background-primary'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}