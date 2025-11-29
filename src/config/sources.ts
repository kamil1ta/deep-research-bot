import { SourceType, SearchQuery } from '../utils/types';

export const sourceConfigs: Record<SourceType, any> = {
  twitter: {
    baseUrl: 'https://api.twitter.com/2/',
    rateLimit: {
      requests: 300,
      window: 900000, // 15 minutes
    },
    searchParams: {
      'tweet.fields': ['created_at', 'author_id', 'public_metrics'],
      'user.fields': ['name', 'username', 'verified', 'description'],
      'expansions': ['author_id'],
      max_results: 100,
    },
  },
  youtube: {
    baseUrl: 'https://www.googleapis.com/youtube/v3/',
    rateLimit: {
      requests: 10000,
      window: 86400000, // 24 hours
    },
    searchParams: {
      part: 'snippet',
      type: 'video',
      maxResults: 50,
      order: 'relevance',
    },
  },
  tiktok: {
    baseUrl: 'https://www.tiktok.com/',
    rateLimit: {
      requests: 100,
      window: 3600000, // 1 hour
    },
  },
  reddit: {
    baseUrl: 'https://oauth.reddit.com/',
    rateLimit: {
      requests: 60,
      window: 60000, // 1 minute
    },
    searchParams: {
      sort: 'relevance',
      t: 'week', // time period: hour, day, week, month, year, all
      limit: 100,
    },
  },
  article: {
    rateLimit: {
      requests: 1000,
      window: 3600000, // 1 hour
    },
    userAgents: [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    ],
  },
  vc_blog: {
    sources: [
      'https://a16z.com/feed/',
      'https://sequoiacap.com/feed/',
      'https://blog.ycombinator.com/feed/',
      'https://techcrunch.com/feed/',
      'https://venturebeat.com/feed/',
    ],
    rateLimit: {
      requests: 500,
      window: 3600000, // 1 hour
    },
  },
  book: {
    googleBooksApi: 'https://www.googleapis.com/books/v1/volumes',
    rateLimit: {
      requests: 1000,
      window: 86400000, // 24 hours
    },
    searchParams: {
      maxResults: 20,
      printType: 'books',
      orderBy: 'relevance',
    },
  },
  news: {
    sources: [
      'https://feeds.bloomberg.com/markets/news.rss',
      'https://feeds.reuters.com/reuters/technologyNews',
      'https://feeds.wired.com/wired/index',
      'https://www.theverge.com/rss/index.xml',
    ],
    rateLimit: {
      requests: 1000,
      window: 3600000, // 1 hour
    },
  },
  academic: {
    arxivApi: 'http://export.arxiv.org/api/query',
    semanticScholarApi: 'https://api.semanticscholar.org/graph/v1/paper/search',
    rateLimit: {
      requests: 1000,
      window: 86400000, // 24 hours
    },
    searchParams: {
      max_results: 50,
      sort: 'relevance',
    },
  },
};

export function generateSearchQueries(topic: string): SearchQuery[] {
  const baseQueries = [
    {
      query: topic,
      platforms: ['twitter', 'youtube', 'reddit', 'article'] as SourceType[],
      contentTypes: ['opinions', 'discussions'] as ContentType[],
      searchIntent: 'overview' as const,
    },
    {
      query: `${topic} tutorial guide how to`,
      platforms: ['youtube', 'article', 'reddit'] as SourceType[],
      contentTypes: ['tutorials'] as ContentType[],
      searchIntent: 'specific_angle' as const,
    },
    {
      query: `${topic} problems challenges criticism`,
      platforms: ['twitter', 'reddit', 'article'] as SourceType[],
      contentTypes: ['discussions', 'opinions'] as ContentType[],
      searchIntent: 'counterarguments' as const,
    },
    {
      query: `${topic} examples case studies success stories`,
      platforms: ['article', 'youtube', 'vc_blog'] as SourceType[],
      contentTypes: ['data', 'examples'] as ContentType[],
      searchIntent: 'examples' as const,
    },
    {
      query: `${topic} trends predictions future`,
      platforms: ['vc_blog', 'twitter', 'article', 'book'] as SourceType[],
      contentTypes: ['opinions', 'data'] as ContentType[],
      searchIntent: 'overview' as const,
    },
    {
      query: `${topic} research papers studies`,
      platforms: ['academic', 'article'] as SourceType[],
      contentTypes: ['data'] as ContentType[],
      searchIntent: 'specific_angle' as const,
    },
    {
      query: `${topic} market analysis industry report`,
      platforms: ['vc_blog', 'news', 'article'] as SourceType[],
      contentTypes: ['data', 'news'] as ContentType[],
      searchIntent: 'specific_angle' as const,
    },
  ];

  return baseQueries;
}

export function getPlatformConfig(platform: SourceType): any {
  return sourceConfigs[platform];
}