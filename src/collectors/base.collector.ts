import axios, { AxiosInstance } from 'axios';
import { ResearchSource, SourceType, CollectorOptions } from '../utils/types';
import logger from '../services/logger.service';
import { cacheService } from '../services/cache.service';

export abstract class BaseCollector {
  protected client: AxiosInstance;
  protected sourceType: SourceType;
  protected rateLimitDelay: number = 1000; // 1 second default

  constructor(sourceType: SourceType, baseUrl: string) {
    this.sourceType = sourceType;
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 30000,
      headers: {
        'User-Agent': 'Deep Research Bot 1.0',
      },
    });

    // Add request interceptor for rate limiting
    this.client.interceptors.request.use(
      async (config) => {
        // Apply rate limiting
        await this.rateLimit();
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (this.shouldRetry(error)) {
          logger.warn(`Request failed, retrying... (${error.config?.url})`);
          await this.delay(this.getRetryDelay(error));
          return this.client.request(error.config);
        }
        return Promise.reject(error);
      }
    );
  }

  abstract collect(topic: string, options?: CollectorOptions): Promise<ResearchSource[]>;

  protected async rateLimit(): Promise<void> {
    await this.delay(this.rateLimitDelay);
  }

  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected shouldRetry(error: any): boolean {
    if (!error.response) return false;

    const status = error.response.status;
    const retryableStatuses = [429, 502, 503, 504];
    return retryableStatuses.includes(status);
  }

  protected getRetryDelay(error: any): number {
    if (error.response?.status === 429) {
      // Rate limit error - use longer delay
      const resetTime = error.response.headers['x-ratelimit-reset'];
      if (resetTime) {
        const now = Math.floor(Date.now() / 1000);
        const resetTimestamp = parseInt(resetTime);
        return Math.max(0, (resetTimestamp - now) * 1000);
      }
      return 60000; // 1 minute default for rate limit
    }
    return 5000; // 5 seconds for other retryable errors
  }

  protected generateCacheKey(topic: string, options?: CollectorOptions): string {
    const optionsStr = options ? JSON.stringify(options) : '';
    return `${this.sourceType}:${topic}:${optionsStr}`;
  }

  protected async getCachedResult<T>(
    key: string
  ): Promise<T | null> {
    return cacheService.get<T>(key);
  }

  protected async setCachedResult<T>(
    key: string,
    data: T,
    ttlSeconds: number = 3600
  ): Promise<void> {
    cacheService.set(key, data, ttlSeconds);
  }

  protected createSource(
    id: string,
    url: string,
    title: string,
    content: string,
    author?: string,
    publishDate?: Date,
    metadata: Record<string, any> = {}
  ): ResearchSource {
    return {
      id,
      type: this.sourceType,
      url,
      title,
      author,
      publishDate,
      content,
      metadata: {
        ...metadata,
        collectedAt: new Date(),
        collectorVersion: '1.0.0',
      },
    };
  }

  protected extractContent(html: string): string {
    // Basic content extraction - could be enhanced with better libraries
    const cleanHtml = html
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return cleanHtml.substring(0, 10000); // Limit to 10k chars
  }

  protected isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  protected sanitizeText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-.,!?;:'"()]/g, '')
      .trim();
  }

  protected generateId(): string {
    return `${this.sourceType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  protected logCollectionStart(topic: string, options?: CollectorOptions): void {
    logger.info(`Starting ${this.sourceType} collection for topic: ${topic}`);
    if (options) {
      logger.debug('Collection options:', options);
    }
  }

  protected logCollectionEnd(topic: string, count: number): void {
    logger.info(`Completed ${this.sourceType} collection for topic: ${topic}. Found ${count} sources.`);
  }

  protected logError(message: string, error: any): void {
    logger.error(`${this.sourceType} collector error: ${message}`, error);
  }
}