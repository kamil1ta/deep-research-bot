import { BaseCollector } from './base.collector';
import { ResearchSource, CollectorOptions, RedditConfig } from '../utils/types';
import axios from 'axios';
import logger from '../services/logger.service';

interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  url: string;
  author: string;
  subreddit: string;
  created_utc: number;
  score: number;
  num_comments: number;
  permalink: string;
  over_18?: boolean;
}

interface RedditComment {
  id: string;
  body: string;
  author: string;
  created_utc: number;
  score: number;
  permalink: string;
}

interface RedditSearchResponse {
  data: {
    children: Array<{
      kind: string;
      data: RedditPost;
    }>;
    after?: string;
  };
}

export class RedditCollector extends BaseCollector {
  private config: RedditConfig;
  private accessToken?: string;
  private tokenExpiry: number = 0;

  constructor(config: RedditConfig) {
    super('reddit', 'https://oauth.reddit.com/');
    this.config = config;
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
    const maxResults = Math.min(options?.maxResults || 30, 50);

    try {
      // Get access token
      await this.authenticate();

      // Search relevant subreddits
      const subreddits = this.getRelevantSubreddits(topic);
      const searchQueries = this.generateSearchQueries(topic, subreddits);

      for (const query of searchQueries) {
        if (sources.length >= maxResults) break;

        try {
          const posts = await this.searchReddit(query, maxResults - sources.length);

          for (const post of posts) {
            if (sources.length >= maxResults) break;

            // Process main post
            const postSource = await this.processPost(post, query);
            if (postSource) {
              sources.push(postSource);
            }

            // If we still need more content, get top comments
            if (sources.length < maxResults && post.num_comments > 5) {
              const comments = await this.getTopComments(post.id);
              for (const comment of comments.slice(0, 3)) {
                if (sources.length >= maxResults) break;
                const commentSource = await this.processComment(comment, post, query);
                if (commentSource) {
                  sources.push(commentSource);
                }
              }
            }
          }
        } catch (error) {
          logger.warn(`Failed to search Reddit for query: ${query}`, error);
        }
      }

      await this.setCachedResult(cacheKey, sources, 3600); // 1 hour cache
      this.logCollectionEnd(topic, sources.length);
      return sources;
    } catch (error) {
      this.logError('Failed to collect Reddit content', error);
      return [];
    }
  }

  private async authenticate(): Promise<void> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return;
    }

    try {
      const credentials = Buffer.from(
        `${this.config.clientId}:${this.config.clientSecret}`
      ).toString('base64');

      const response = await axios.post(
        'https://www.reddit.com/api/v1/access_token',
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': this.config.userAgent,
          },
          timeout: 10000,
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000; // Buffer 1 minute

      // Update client headers
      this.client.defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`;
      this.client.defaults.headers.common['User-Agent'] = this.config.userAgent;

      logger.info('Successfully authenticated with Reddit API');
    } catch (error) {
      logger.error('Reddit authentication failed:', error);
      throw error;
    }
  }

  private async searchReddit(query: string, maxResults: number): Promise<RedditPost[]> {
    const searchUrl = '/search';
    const params = {
      q: query,
      sort: 'relevance',
      t: 'month', // Time period: hour, day, week, month, year, all
      limit: Math.min(maxResults, 25),
      type: 'link',
    };

    try {
      const response = await this.client.get<RedditSearchResponse>(searchUrl, {
        params,
        timeout: 30000,
      });

      return response.data.data.children
        .map(child => child.data)
        .filter(post => !post.over_18); // Filter NSFW content
    } catch (error) {
      logger.error(`Reddit search error for query: ${query}`, error);
      throw error;
    }
  }

  private async getTopComments(postId: string): Promise<RedditComment[]> {
    const commentsUrl = `/comments/${postId}.json`;
    const params = {
      sort: 'top',
      limit: 5,
    };

    try {
      const response = await this.client.get(commentsUrl, {
        params,
        timeout: 20000,
      });

      const commentsData = response.data[1]?.data?.children || [];
      return commentsData
        .map((child: any) => child.data)
        .filter((comment: RedditComment) => comment.body && comment.body.length > 50);
    } catch (error) {
      logger.warn(`Failed to get comments for post ${postId}:`, error);
      return [];
    }
  }

  private async processPost(post: RedditPost, query: string): Promise<ResearchSource | null> {
    try {
      // Filter low-quality posts
      if (!this.isHighQualityPost(post)) {
        return null;
      }

      const url = `https://reddit.com${post.permalink}`;
      const content = post.selftext || post.title;

      const source = this.createSource(
        `reddit-post-${post.id}`,
        url,
        post.title,
        content,
        post.author,
        new Date(post.created_utc * 1000),
        {
          subreddit: post.subreddit,
          score: post.score,
          numComments: post.num_comments,
          query,
          contentType: 'post',
          wordCount: content.split(' ').length,
          isSelfPost: !!post.selftext,
          externalUrl: post.url,
        }
      );

      return source;
    } catch (error) {
      logger.warn(`Failed to process Reddit post ${post.id}:`, error);
      return null;
    }
  }

  private async processComment(
    comment: RedditComment,
    post: RedditPost,
    query: string
  ): Promise<ResearchSource | null> {
    try {
      if (!this.isHighQualityComment(comment)) {
        return null;
      }

      const url = `https://reddit.com${comment.permalink}`;
      const title = `Comment on: ${post.title}`;

      const source = this.createSource(
        `reddit-comment-${comment.id}`,
        url,
        title,
        comment.body,
        comment.author,
        new Date(comment.created_utc * 1000),
        {
          subreddit: post.subreddit,
          score: comment.score,
          query,
          contentType: 'comment',
          wordCount: comment.body.split(' ').length,
          parentPostId: post.id,
          parentPostTitle: post.title,
        }
      );

      return source;
    } catch (error) {
      logger.warn(`Failed to process Reddit comment ${comment.id}:`, error);
      return null;
    }
  }

  private getRelevantSubreddits(topic: string): string[] {
    const techSubreddits = [
      'technology',
      'programming',
      'MachineLearning',
      'webdev',
      'startups',
      'Futurology',
      'tech',
      'software',
      'dataisbeautiful',
      'sysadmin',
    ];

    const topicLower = topic.toLowerCase();

    if (topicLower.includes('ai') || topicLower.includes('machine learning')) {
      techSubreddits.push('MachineLearning', 'artificial', 'deeplearning');
    }

    if (topicLower.includes('startup') || topicLower.includes('business')) {
      techSubreddits.push('startups', 'Entrepreneur', 'business');
    }

    if (topicLower.includes('programming') || topicLower.includes('coding')) {
      techSubreddits.push('programming', 'learnprogramming', 'webdev', 'coding');
    }

    return [...new Set(techSubreddits)];
  }

  private generateSearchQueries(topic: string, subreddits: string[]): string[] {
    const baseQueries = [
      topic,
      `"${topic}"`,
      `${topic} discussion`,
      `${topic} experience`,
    ];

    // Subreddit-specific queries
    const subredditQueries = subreddits
      .slice(0, 5) // Limit to top 5 subreddits
      .map(subreddit => `site:reddit.com/r/${subreddit} ${topic}`);

    return [...baseQueries, ...subredditQueries];
  }

  private isHighQualityPost(post: RedditPost): boolean {
    // Must have decent score or comment count
    if (post.score < 3 && post.num_comments < 5) {
      return false;
    }

    // Must have meaningful content
    const content = post.selftext || post.title;
    if (content.length < 100) {
      return false;
    }

    // Filter out low-quality indicators
    const lowQualityIndicators = [
      'shitpost',
      'meme',
      'clickbait',
      'first time',
      'new here',
      'what do you think',
    ];

    const hasLowQuality = lowQualityIndicators.some(indicator =>
      content.toLowerCase().includes(indicator)
    );

    if (hasLowQuality && post.score < 10) {
      return false;
    }

    return true;
  }

  private isHighQualityComment(comment: RedditComment): boolean {
    // Must have reasonable length and score
    if (comment.body.length < 100 || comment.score < 1) {
      return false;
    }

    // Filter out low-effort comments
    const lowEffortPatterns = [
      /^this\.$/i,
      /^thanks$/i,
      /^good point$/i,
      /^i agree$/i,
      /^\+\d+$/,
      /^edit:/i,
    ];

    const isLowEffort = lowEffortPatterns.some(pattern => pattern.test(comment.body));

    return !isLowEffort;
  }
}