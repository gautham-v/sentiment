'use client';

import { useState, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import { DashboardData } from '@/types';

export default function HomePage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/sentiment');
      
      if (!response.ok) {
        throw new Error('Failed to fetch sentiment data');
      }
      
      const result = await response.json();
      const data: DashboardData = result.data || result;
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !dashboardData) {
    return (
      <div className="min-h-screen bg-background-primary text-text-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Loading sentiment analysis...</p>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="min-h-screen bg-background-primary text-text-primary flex items-center justify-center">
        <div className="text-center">
          <p className="text-status-bearish mb-4">Error: {error}</p>
          <button 
            onClick={fetchDashboardData}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <Dashboard 
      assets={dashboardData.assets}
      recommendations={dashboardData.recommendations}
      summary={dashboardData.summary}
    />
  );
}