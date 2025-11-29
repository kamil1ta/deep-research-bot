import dotenv from 'dotenv';
import { AppConfig } from '../utils/types';

dotenv.config();

export const config: AppConfig = {
  notion: {
    apiKey: process.env.NOTION_API_KEY || '',
    databaseId: process.env.NOTION_DATABASE_ID,
  },
  twitter: {
    apiKey: process.env.TWITTER_API_KEY || '',
    apiKeySecret: process.env.TWITTER_API_SECRET || '',
    accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
    accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET || '',
    bearerToken: process.env.TWITTER_BEARER_TOKEN || '',
  },
  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY || '',
  },
  reddit: {
    clientId: process.env.REDDIT_CLIENT_ID || '',
    clientSecret: process.env.REDDIT_CLIENT_SECRET || '',
    userAgent: process.env.REDDIT_USER_AGENT || 'deep-research-bot/1.0',
  },
  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.AI_MODEL || 'gpt-4-turbo-preview',
    maxTokens: 4000,
  },
  database: {
    path: process.env.DATABASE_PATH || './data/research.db',
  },
  research: {
    maxSources: parseInt(process.env.MAX_SOURCES_PER_TOPIC || '50'),
    maxDepth: parseInt(process.env.MAX_SEARCH_DEPTH || '3'),
    timeout: parseInt(process.env.RESEARCH_TIMEOUT || '1800000'),
  },
};

export function validateConfig(): void {
  const requiredEnvVars = [
    'NOTION_API_KEY',
    'TWITTER_BEARER_TOKEN',
    'YOUTUBE_API_KEY',
    'OPENAI_API_KEY',
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }

  console.log('✅ Configuration validated successfully');
}