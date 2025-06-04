import { NextResponse } from 'next/server';

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleApiError(error: unknown) {
  console.error('API Error:', error);

  if (error instanceof AppError) {
    return NextResponse.json(
      { 
        error: error.message,
        code: error.code,
        timestamp: new Date().toISOString()
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    // Log full error in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to monitoring service (Sentry, etc.)
      console.error('Unhandled error:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json(
      { 
        error: 'An unexpected error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { 
      error: 'An unknown error occurred',
      timestamp: new Date().toISOString()
    },
    { status: 500 }
  );
}

export function logError(context: string, error: unknown) {
  const errorDetails = {
    context,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    error: error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : error
  };

  console.error(`[${context}] Error:`, errorDetails);

  // In production, send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Implement Sentry or other monitoring service
    // Sentry.captureException(error, { extra: errorDetails });
  }
}

export function createApiResponse<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString()
    },
    { status }
  );
}

export function createErrorResponse(message: string, status = 500, code?: string) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
      timestamp: new Date().toISOString()
    },
    { status }
  );
}