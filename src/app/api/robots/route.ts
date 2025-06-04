export async function GET() {
  const robotsTxt = `# Sentiment.so Robots.txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /api/cron/
Crawl-delay: 1

# Sitemap
Sitemap: ${process.env.NEXT_PUBLIC_APP_URL || 'https://sentiment.so'}/sitemap.xml
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}