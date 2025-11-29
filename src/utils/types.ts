export interface ResearchSource {
  id: string;
  type: SourceType;
  url: string;
  title: string;
  author?: string;
  publishDate?: Date;
  content: string;
  metadata: Record<string, any>;
}

export type SourceType =
  | 'twitter'
  | 'youtube'
  | 'tiktok'
  | 'reddit'
  | 'article'
  | 'vc_blog'
  | 'book'
  | 'news'
  | 'academic';

export interface ResearchResult {
  id: string;
  topic: string;
  sources: AnalyzedSource[];
  summary: ResearchSummary;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalyzedSource extends ResearchSource {
  tldr: string;
  mainPoints: string[];
  keyQuotes: string[];
  relevanceScore: number;
  connections: string[];
  credibility: CredibilityLevel;
  analysis: ContentAnalysis;
}

export interface ContentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  topics: string[];
  entities: string[];
  insights: string[];
  questions: string[];
}

export type CredibilityLevel = 'high' | 'medium' | 'low';

export interface ResearchSummary {
  coreThemes: string[];
  keyInsights: string[];
  contradictions: string[];
  knowledgeGaps: string[];
  storyAngles: string[];
  followUpQuestions: string[];
}

export interface NotionConfig {
  apiKey: string;
  databaseId?: string;
}

export interface TwitterConfig {
  apiKey: string;
  apiKeySecret: string;
  accessToken: string;
  accessTokenSecret: string;
  bearerToken: string;
}

export interface YouTubeConfig {
  apiKey: string;
}

export interface RedditConfig {
  clientId: string;
  clientSecret: string;
  userAgent: string;
}

export interface AIConfig {
  openaiApiKey?: string;
  anthropicApiKey?: string;
  model?: string;
  maxTokens?: number;
}

export interface DatabaseConfig {
  path: string;
}

export interface AppConfig {
  notion: NotionConfig;
  twitter: TwitterConfig;
  youtube: YouTubeConfig;
  reddit: RedditConfig;
  ai: AIConfig;
  database: DatabaseConfig;
  research: {
    maxSources: number;
    maxDepth: number;
    timeout: number;
  };
}

export interface CollectorOptions {
  maxResults?: number;
  dateRange?: {
    from: Date;
    to: Date;
  };
  filters?: Record<string, any>;
}

export interface SearchQuery {
  query: string;
  platforms: SourceType[];
  contentTypes: ContentType[];
  searchIntent: SearchIntent;
}

export type ContentType =
  | 'opinions'
  | 'data'
  | 'tutorials'
  | 'discussions'
  | 'news';

export type SearchIntent =
  | 'overview'
  | 'specific_angle'
  | 'counterarguments'
  | 'examples';

export interface ProcessingOptions {
  includeTranscripts?: boolean;
  extractQuotes?: boolean;
  generateInsights?: boolean;
  findConnections?: boolean;
}