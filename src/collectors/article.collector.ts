import { BaseCollector } from './base.collector';
import { ResearchSource, CollectorOptions } from '../utils/types';
import axios from 'axios';
import { extract } from '@extractus/article-extractor';
import RSSParser from 'rss-parser';
import logger from '../services/logger.service';

interface RSSFeed {
  url: string;
  name: string;
  category: string;
}

export class ArticleCollector extends BaseCollector {
  private rssParser: RSSParser;
  private rssFeeds: RSSFeed[] = [
    {
      url: 'https://techcrunch.com/feed/',
      name: 'TechCrunch',
      category: 'tech',
    },
    {
      url: 'https://feeds.wired.com/wired/index',
      name: 'Wired',
      category: 'tech',
    },
    {
      url: 'https://www.theverge.com/rss/index.xml',
      name: 'The Verge',
      category: 'tech',
    },
    {
      url: 'https://a16z.com/feed/',
      name: 'Andreessen Horowitz',
      category: 'vc',
    },
    {
      url: 'https://blog.ycombinator.com/feed/',
      name: 'Y Combinator',
      category: 'startup',
    },
  ];

  constructor() {
    super('article', 'https://r.jina.ai/http://');
    this.rssParser = new RSSParser();
  }

  async collect(topic: string, options?: CollectorOptions): Promise<ResearchSource[]> {
    this.logCollectionStart(topic, options);

    const cacheKey = this.generateCacheKey(topic, options);
    const cached = await this.getCachedResult<ResearchSource[]>(cacheKey);

    if (cached) {
      this.logCollectionEnd(topic, cached.length);
      return cached;
    }

    const sources: ResearchSource[] = [];
    const maxResults = options?.maxResults || 20;

    try {
      // Search RSS feeds first
      const rssSources = await this.searchRSSFeeds(topic, maxResults);
      sources.push(...rssSources);

      // If we need more sources, search the web
      if (sources.length < maxResults) {
        const webSources = await this.searchWeb(topic, maxResults - sources.length);
        sources.push(...webSources);
      }

      // Cache the results
      await this.setCachedResult(cacheKey, sources, 3600); // 1 hour cache

      this.logCollectionEnd(topic, sources.length);
      return sources;
    } catch (error) {
      this.logError('Failed to collect articles', error);
      return [];
    }
  }

  private async searchRSSFeeds(topic: string, maxResults: number): Promise<ResearchSource[]> {
    const sources: ResearchSource[] = [];
    const searchTerms = this.generateSearchTerms(topic);

    for (const feed of this.rssFeeds) {
      try {
        const feedItems = await this.rssParser.parseURL(feed.url);

        const relevantItems = feedItems.items.filter(item =>
          this.isRelevantToTopic(item, searchTerms)
        ).slice(0, Math.ceil(maxResults / this.rssFeeds.length));

        for (const item of relevantItems) {
          if (item.link && item.title) {
            const source = await this.processArticle(item.link, item.title, feed);
            if (source) {
              sources.push(source);
            }
          }
        }
      } catch (error) {
        logger.warn(`Failed to parse RSS feed ${feed.url}:`, error);
      }
    }

    return sources;
  }

  private async searchWeb(topic: string, maxResults: number): Promise<ResearchSource[]> {
    const sources: ResearchSource[] = [];
    const searchQuery = encodeURIComponent(topic + ' tech blog analysis insights');
    const searchUrl = `https://duckduckgo.com/html/?q=${searchQuery}`;

    try {
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
      });

      const urls = this.extractUrlsFromSearchResults(response.data);
      const limitedUrls = urls.slice(0, maxResults);

      for (const url of limitedUrls) {
        try {
          const source = await this.processArticle(url);
          if (source) {
            sources.push(source);
          }
        } catch (error) {
          logger.warn(`Failed to process article ${url}:`, error);
        }
      }
    } catch (error) {
      logger.warn('Failed to search web for articles:', error);
    }

    return sources;
  }

  private async processArticle(
    url: string,
    title?: string,
    feed?: RSSFeed
  ): Promise<ResearchSource | null> {
    try {
      // Use jina.ai for content extraction (better for AI analysis)
      const jinaUrl = `https://r.jina.ai/http://${url.replace(/^https?:\/\//, '')}`;
      const response = await axios.get(jinaUrl, { timeout: 15000 });

      if (!response.data) {
        return null;
      }

      const content = typeof response.data === 'string'
        ? response.data
        : JSON.stringify(response.data);

      // Extract article metadata using article-extractor
      let articleData;
      try {
        articleData = await extract(url);
      } catch {
        // Fallback to jina data
        articleData = { title, author: undefined, published_time: undefined };
      }

      const source = this.createSource(
        this.generateId(),
        url,
        articleData?.title || title || 'Untitled Article',
        content,
        articleData?.author,
        articleData?.published_time ? new Date(articleData.published_time) : undefined,
        {
          feed: feed?.name,
          category: feed?.category,
          wordCount: content.split(' ').length,
          extractionMethod: 'jina_ai',
        }
      );

      return source;
    } catch (error) {
      logger.warn(`Failed to extract content from ${url}:`, error);
      return null;
    }
  }

  private generateSearchTerms(topic: string): string[] {
    const terms = [topic.toLowerCase()];

    // Add variations
    terms.push(`${topic} technology`, `${topic} trends`, `${topic} analysis`);
    terms.push(`${topic} future`, `${topic} impact`, `${topic} research`);

    return terms;
  }

  private isRelevantToTopic(item: any, searchTerms: string[]): boolean {
    const text = `${item.title || ''} ${item.contentSnippet || ''}`.toLowerCase();

    return searchTerms.some(term => text.includes(term));
  }

  private extractUrlsFromSearchResults(html: string): string[] {
    const urls: string[] = [];
    const urlRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
    let match;

    while ((match = urlRegex.exec(html)) !== null) {
      const url = match[1];
      if (url.startsWith('http') && !url.includes('duckduckgo.com')) {
        urls.push(url);
      }
    }

    return [...new Set(urls)]; // Remove duplicates
  }
}