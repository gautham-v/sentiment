import Link from 'next/link';
import { ArrowLeft, ExternalLink, Mail, Github, Linkedin, Globe } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About - Sentiment.so',
  description: 'Learn about Gautham Vemulapalli, the creator of Sentiment.so, and our methodology for AI-powered market sentiment analysis.',
  keywords: 'about sentiment.so, Gautham Vemulapalli, market sentiment analysis, AI trading, methodology',
};

export default function About() {
  return (
    <div className="min-h-screen bg-background-primary">
      {/* Header */}
      <div className="bg-background-secondary border-b border-border-primary sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-5 py-3">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-1.5 bg-background-primary border border-border-primary rounded-md hover:bg-background-tertiary transition-colors"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
              About Sentiment.so
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-5 py-8">
        {/* Creator Section */}
        <div className="bg-background-secondary border border-border-primary rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Meet the Creator</h2>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-text-primary mb-2">Gautham Vemulapalli</h3>
              <p className="text-text-secondary mb-3">Senior Staff Product Manager at Qualcomm</p>
              
              <p className="text-text-primary mb-4">
                I handle all aspects of Sentiment.so - from product strategy and development to design, marketing, and support. 
                As a seasoned product manager with a passion for AI and financial technology, I built this platform to democratize 
                access to sophisticated sentiment analysis for retail investors.
              </p>

              {/* Contact Links */}
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://gauthamv.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-background-primary border border-border-primary rounded-md text-sm text-text-primary hover:bg-background-tertiary transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  Website
                  <ExternalLink className="w-3 h-3" />
                </a>
                
                <a
                  href="https://linkedin.com/in/gautham-v"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-background-primary border border-border-primary rounded-md text-sm text-text-primary hover:bg-background-tertiary transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                  <ExternalLink className="w-3 h-3" />
                </a>
                
                <a
                  href="https://github.com/gautham-v"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-background-primary border border-border-primary rounded-md text-sm text-text-primary hover:bg-background-tertiary transition-colors"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                  <ExternalLink className="w-3 h-3" />
                </a>
                
                <a
                  href="mailto:gvem@duck.com"
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-background-primary border border-border-primary rounded-md text-sm text-text-primary hover:bg-background-tertiary transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Project Background */}
        <div className="bg-background-secondary border border-border-primary rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Why Sentiment.so?</h2>
          
          <div className="space-y-4 text-text-primary">
            <p>
              Financial markets are driven by two primary forces: fundamentals and sentiment. While traditional analysis 
              focuses heavily on financial metrics, the emotional and psychological aspects of market behavior often 
              provide the edge that separates successful investors from the crowd.
            </p>
            
            <p>
              I created Sentiment.so to bridge this gap by making sophisticated sentiment analysis accessible to retail 
              investors. The platform combines real-time social media sentiment, news analysis, and AI-powered insights 
              to provide a comprehensive view of market psychology around the most important tech stocks and cryptocurrencies.
            </p>
            
            <p>
              As someone who has worked in both enterprise software and consumer technology, I understand the importance 
              of making complex data simple and actionable. Sentiment.so reflects this philosophy - providing institutional-grade 
              analysis in a clean, intuitive interface that anyone can use.
            </p>
          </div>
        </div>

        {/* Methodology */}
        <div className="bg-background-secondary border border-border-primary rounded-lg p-6">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Our Methodology</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Multi-Source Sentiment Analysis</h3>
              <p className="text-text-primary mb-2">
                We aggregate sentiment data from three key sources:
              </p>
              <ul className="list-disc list-inside text-text-primary space-y-1 ml-4">
                <li><strong>Reddit Communities:</strong> Real-time sentiment from investing subreddits and financial discussions</li>
                <li><strong>StockTwits:</strong> Social sentiment from the leading financial social network</li>
                <li><strong>Financial News:</strong> AI analysis of news articles from major financial publications</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">AI-Powered Analysis</h3>
              <p className="text-text-primary">
                Our platform uses Grok AI to process and analyze sentiment data, providing context-aware insights 
                that go beyond simple positive/negative scoring. The AI considers market context, technical indicators, 
                and fundamental factors to generate actionable investment insights.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Price-Sentiment Correlation</h3>
              <p className="text-text-primary">
                We calculate real-time correlations between sentiment trends and price movements to identify 
                potential divergences and momentum signals. This helps investors spot opportunities where 
                sentiment and price action may be temporarily misaligned.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Daily Analysis & Recommendations</h3>
              <p className="text-text-primary">
                Every day at 2 PM UTC (9 AM EST), our system automatically analyzes all tracked assets, 
                updates sentiment scores, and generates fresh AI insights and recommendations. This ensures 
                you always have the most current market sentiment data to inform your investment decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}