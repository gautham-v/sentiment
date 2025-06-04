'use client';

import React from 'react';
import { 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  ComposedChart
} from 'recharts';

interface SentimentTrendData {
  date: string;
  sentiment: number | null;
  price: number;
  correlation?: number | null;
}

interface SentimentTrendChartProps {
  data: SentimentTrendData[];
  ticker: string;
}

export default function SentimentTrendChart({ data, ticker }: SentimentTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-sm text-text-muted text-center py-8">
        No historical data available yet
      </div>
    );
  }

  // Normalize price data for dual axis display
  const maxPrice = Math.max(...data.map(d => d.price));
  const minPrice = Math.min(...data.map(d => d.price));
  const priceRange = maxPrice - minPrice;
  
  const normalizedData = data.map(item => ({
    ...item,
    normalizedPrice: ((item.price - minPrice) / priceRange) * 100,
    displayDate: new Date(item.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }));

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium text-text-primary mb-1 text-sm">
          Sentiment vs Price Trend
        </h4>
        <p className="text-xs text-text-muted">
          Tracking sentiment changes and price correlation over time
        </p>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={normalizedData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <defs>
              <linearGradient id={`sentimentGradient-${ticker}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id={`priceGradient-${ticker}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="displayDate" 
              stroke="#9CA3AF"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              stroke="#9CA3AF"
              tick={{ fontSize: 12 }}
              domain={[0, 100]}
              label={{ value: 'Score', angle: -90, position: 'insideLeft', style: { fill: '#9CA3AF' } }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
              labelStyle={{ color: '#E5E7EB' }}
              formatter={(value: any, name: string, props: any) => {
                if (name === 'Price' && props?.payload) {
                  const originalPrice = props.payload.price;
                  return [`$${originalPrice.toLocaleString()}`, name];
                }
                if (name === 'Sentiment' && value === null) {
                  return ['No data', name];
                }
                return [value, name];
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              iconType="line"
            />
            <Area
              type="monotone"
              dataKey="sentiment"
              stroke="#10B981"
              fillOpacity={1}
              fill={`url(#sentimentGradient-${ticker})`}
              strokeWidth={2}
              name="Sentiment"
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="normalizedPrice"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
              name="Price"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Correlation indicator */}
      {data.length > 0 && data[data.length - 1]?.correlation !== undefined && (
        <div className="flex items-center justify-between p-3 bg-background-primary rounded-lg border border-border-primary">
          <span className="text-sm text-text-secondary">
            Price-Sentiment Correlation
          </span>
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-background-tertiary rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-status-bearish via-status-neutral to-status-bullish"
                style={{
                  width: `${((data[data.length - 1].correlation! + 1) / 2) * 100}%`
                }}
              />
            </div>
            <span className={`text-sm font-bold ${
              Math.abs(data[data.length - 1].correlation!) > 0.7 ? 'text-status-bullish' :
              Math.abs(data[data.length - 1].correlation!) > 0.3 ? 'text-status-neutral' :
              'text-status-bearish'
            }`}>
              {(data[data.length - 1].correlation! * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}