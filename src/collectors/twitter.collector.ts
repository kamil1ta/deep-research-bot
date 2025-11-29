import { BaseCollector } from './base.collector';
import { ResearchSource, CollectorOptions, TwitterConfig } from '../utils/types';
import axios from 'axios';
import logger from '../services/logger.service';

interface Tweet {
  id: string;
  text: string;
  author_id?: string;
  author?: {
    id: string;
    name: string;
    username: string;
    verified?: boolean;
    description?: string;
  };
  created_at: string;
  public_metrics?: {
    retweet_count: number;
    like_count: number;
    reply_count: number;
    quote_count: number;
  };
}

interface TwitterSearchResponse {
  data?: Tweet[];
  meta?: {
    result_count: number;
    next_token?: string;
  };
  includes?: {
    users?: Array<{
      id: string;
      name: string;
      username: string;
      verified?: boolean;
      description?: string;
    }>;
  };
}

export class TwitterCollector extends BaseCollector {
  private config: TwitterConfig;
  private baseUrl: string;

  constructor(config: TwitterConfig) {
    super('twitter', 'https://api.twitter.com/2/');
    this.config = config;
    this.baseUrl = 'https://api.twitter.com/2/';
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
    const maxResults = Math.min(options?.maxResults || 50, 100);

    try {
      const searchQueries = this.generateSearchQueries(topic);

      for (const query of searchQueries) {
        if (sources.length >= maxResults) break;

        try {
          const tweets = await this.searchTweets(query, maxResults - sources.length);

          for (const tweet of tweets) {
            if (sources.length >= maxResults) break;

            const source = await this.processTweet(tweet, query);
            if (source) {
              sources.push(source);
            }
          }
        } catch (error) {
          logger.warn(`Failed to search tweets for query: ${query}`, error);
        }
      }

      // Sort by engagement metrics
      sources.sort((a, b) => {
        const aMetrics = a.metadata.publicMetrics || {};
        const bMetrics = b.metadata.publicMetrics || {};
        const aEngagement = (aMetrics.like_count || 0) + (aMetrics.retweet_count || 0);
        const bEngagement = (bMetrics.like_count || 0) + (bMetrics.retweet_count || 0);
        return bEngagement - aEngagement;
      });

      await this.setCachedResult(cacheKey, sources, 1800); // 30 minutes cache
      this.logCollectionEnd(topic, sources.length);
      return sources;
    } catch (error) {
      this.logError('Failed to collect tweets', error);
      return [];
    }
  }

  private async searchTweets(query: string, maxResults: number): Promise<Tweet[]> {
    const searchUrl = `${this.baseUrl}tweets/search/recent`;

    const params = {
      query,
      'tweet.fields': 'created_at,author_id,public_metrics,context_annotations',
      'user.fields': 'name,username,verified,description,public_metrics',
      'expansions': 'author_id',
      max_results: Math.min(maxResults, 100),
    };

    const headers = {
      'Authorization': `Bearer ${this.config.bearerToken}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await axios.get<TwitterSearchResponse>(searchUrl, {
        params,
        headers,
        timeout: 30000,
      });

      const tweets = response.data.data || [];
      const users = response.data.includes?.users || [];

      // Attach user data to tweets
      const tweetsWithUsers = tweets.map(tweet => {
        const user = users.find(u => u.id === tweet.author_id);
        return {
          ...tweet,
          author: user || {
            id: tweet.author_id || 'unknown',
            name: 'Unknown User',
            username: 'unknown',
          },
        };
      });

      return tweetsWithUsers;
    } catch (error) {
      logger.error(`Twitter API error for query: ${query}`, error);
      throw error;
    }
  }

  private async processTweet(tweet: Tweet, query: string): Promise<ResearchSource | null> {
    try {
      // Filter low-quality tweets
      if (!this.isHighQualityTweet(tweet)) {
        return null;
      }

      const url = `https://twitter.com/${tweet.author.username}/status/${tweet.id}`;
      const content = this.cleanTweetText(tweet.text);

      const source = this.createSource(
        `tweet-${tweet.id}`,
        url,
        `Tweet by ${tweet.author.name} (@${tweet.author.username})`,
        content,
        tweet.author.name,
        new Date(tweet.created_at),
        {
          username: tweet.author.username,
          verified: tweet.author.verified,
          description: tweet.author.description,
          publicMetrics: tweet.public_metrics,
          query,
          contentType: 'tweet',
          characterCount: tweet.text.length,
          hashtags: this.extractHashtags(tweet.text),
          mentions: this.extractMentions(tweet.text),
        }
      );

      return source;
    } catch (error) {
      logger.warn(`Failed to process tweet ${tweet.id}:`, error);
      return null;
    }
  }

  private generateSearchQueries(topic: string): string[] {
    const queries = [
      `"${topic}" tech`, // Exact match
      `${topic} -is:retweet lang:en`, // English tweets, no retweets
      `"${topic}" OR "${topic} technology"`, // Alternative phrasing
      `${topic} (from:techcrunch OR from:verge OR from:wired)`, // From tech accounts
    ];

    // Add time-based filtering for recent content
    const timeFilters = ['', 'since:2024-01-01', 'since:2023-01-01'];

    return queries.flatMap(query =>
      timeFilters.map(filter => filter ? `${query} ${filter}` : query)
    );
  }

  private isHighQualityTweet(tweet: Tweet): boolean {
    const metrics = tweet.public_metrics || {};
    const totalEngagement = (metrics.like_count || 0) + (metrics.retweet_count || 0);

    // Must have some engagement or be from verified user
    if (totalEngagement < 5 && !tweet.author.verified) {
      return false;
    }

    // Must have substantial content
    if (tweet.text.length < 50) {
      return false;
    }

    // Filter out spam indicators
    const spamIndicators = ['click here', 'buy now', 'free money', '🚀', 'moon', '100x'];
    const hasSpam = spamIndicators.some(indicator =>
      tweet.text.toLowerCase().includes(indicator)
    );

    if (hasSpam && !tweet.author.verified) {
      return false;
    }

    return true;
  }

  private cleanTweetText(text: string): string {
    return text
      .replace(/https?:\/\/[^\s]+/g, '[URL]') // Replace URLs
      .replace(/@(\w+)/g, '@$1') // Keep mentions but clean them
      .replace(/#(\w+)/g, '#$1') // Keep hashtags but clean them
      .replace(/\s+/g, ' ')
      .trim();
  }

  private extractHashtags(text: string): string[] {
    const hashtagRegex = /#(\w+)/g;
    const hashtags = [];
    let match;

    while ((match = hashtagRegex.exec(text)) !== null) {
      hashtags.push(match[1]);
    }

    return hashtags;
  }

  private extractMentions(text: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }

    return mentions;
  }
}