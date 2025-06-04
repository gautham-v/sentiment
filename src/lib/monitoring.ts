interface MetricEvent {
  name: string;
  value: number;
  tags?: Record<string, string>;
  timestamp?: Date;
}

interface LogEvent {
  level: 'info' | 'warn' | 'error';
  message: string;
  context?: Record<string, any>;
  timestamp?: Date;
}

class MonitoringService {
  private metrics: MetricEvent[] = [];
  private logs: LogEvent[] = [];

  // Track API performance
  async trackApiCall(
    endpoint: string,
    duration: number,
    status: 'success' | 'error',
    statusCode?: number
  ) {
    this.recordMetric('api.call', 1, {
      endpoint,
      status,
      status_code: statusCode?.toString() || 'unknown'
    });

    this.recordMetric('api.duration', duration, {
      endpoint,
      status
    });

    // Log slow API calls
    if (duration > 3000) {
      this.log('warn', `Slow API call: ${endpoint} took ${duration}ms`, {
        endpoint,
        duration,
        status
      });
    }
  }

  // Track sentiment analysis
  trackSentimentAnalysis(
    ticker: string,
    sentimentScore: number,
    confidence: number,
    duration: number
  ) {
    this.recordMetric('sentiment.analysis', 1, { ticker });
    this.recordMetric('sentiment.score', sentimentScore, { ticker });
    this.recordMetric('sentiment.confidence', confidence, { ticker });
    this.recordMetric('sentiment.duration', duration, { ticker });
  }

  // Track cron job execution
  trackCronExecution(
    jobName: string,
    status: 'success' | 'error',
    duration: number,
    processedCount?: number
  ) {
    this.recordMetric('cron.execution', 1, {
      job: jobName,
      status
    });

    this.recordMetric('cron.duration', duration, {
      job: jobName
    });

    if (processedCount !== undefined) {
      this.recordMetric('cron.processed', processedCount, {
        job: jobName
      });
    }
  }

  // Track external API usage
  trackExternalApi(
    service: 'grok' | 'yahoo',
    status: 'success' | 'error' | 'rate_limited',
    duration: number
  ) {
    this.recordMetric('external_api.call', 1, {
      service,
      status
    });

    this.recordMetric('external_api.duration', duration, {
      service,
      status
    });

    // Track rate limiting
    if (status === 'rate_limited') {
      this.log('warn', `Rate limited by ${service}`, {
        service,
        timestamp: new Date()
      });
    }
  }

  // Record a metric
  private recordMetric(
    name: string,
    value: number,
    tags?: Record<string, string>
  ) {
    const metric: MetricEvent = {
      name,
      value,
      tags,
      timestamp: new Date()
    };

    this.metrics.push(metric);

    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to DataDog, CloudWatch, etc.
      console.log('[Metric]', metric);
    }
  }

  // Log an event
  log(
    level: LogEvent['level'],
    message: string,
    context?: Record<string, any>
  ) {
    const logEvent: LogEvent = {
      level,
      message,
      context,
      timestamp: new Date()
    };

    this.logs.push(logEvent);

    // Console output
    const logMethod = level === 'error' ? console.error : 
                     level === 'warn' ? console.warn : 
                     console.log;
    
    logMethod(`[${level.toUpperCase()}]`, message, context || '');

    // In production, send to logging service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to LogDNA, Papertrail, etc.
    }
  }

  // Get metrics summary (for debugging)
  getMetricsSummary() {
    const summary: Record<string, any> = {};

    this.metrics.forEach(metric => {
      const key = metric.name;
      if (!summary[key]) {
        summary[key] = {
          count: 0,
          total: 0,
          min: Infinity,
          max: -Infinity,
          avg: 0
        };
      }

      summary[key].count++;
      summary[key].total += metric.value;
      summary[key].min = Math.min(summary[key].min, metric.value);
      summary[key].max = Math.max(summary[key].max, metric.value);
      summary[key].avg = summary[key].total / summary[key].count;
    });

    return summary;
  }

  // Clear old metrics (to prevent memory leaks)
  clearOldMetrics(olderThanHours = 24) {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - olderThanHours);

    this.metrics = this.metrics.filter(m => 
      m.timestamp && m.timestamp > cutoff
    );

    this.logs = this.logs.filter(l => 
      l.timestamp && l.timestamp > cutoff
    );
  }
}

// Export singleton instance
export const monitoring = new MonitoringService();

// Middleware helper for API monitoring
export function withMonitoring(
  handler: Function,
  endpoint: string
) {
  return async (...args: any[]) => {
    const start = Date.now();
    let status: 'success' | 'error' = 'success';
    let statusCode = 200;

    try {
      const result = await handler(...args);
      
      // Extract status code if it's a NextResponse
      if (result && typeof result === 'object' && 'status' in result) {
        statusCode = result.status;
        if (statusCode >= 400) {
          status = 'error';
        }
      }

      return result;
    } catch (error) {
      status = 'error';
      statusCode = 500;
      throw error;
    } finally {
      const duration = Date.now() - start;
      monitoring.trackApiCall(endpoint, duration, status, statusCode);
    }
  };
}