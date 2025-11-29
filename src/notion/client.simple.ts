import { Client } from '@notionhq/client';
import { NotionConfig } from '../utils/types';
import logger from '../services/logger.service';

export class NotionClient {
  private client: Client;
  private config: NotionConfig;

  constructor(config: NotionConfig) {
    this.config = config;
    this.client = new Client({
      auth: config.apiKey,
    });
  }

  async createDatabase(title: string, topic: string): Promise<string> {
    try {
      logger.info(`Creating database for topic: ${topic}`);
      // Simplified database creation - in real implementation would create proper structure
      const response = await this.client.pages.create({
        parent: {
          type: 'page_id',
          page_id: process.env.NOTION_PARENT_PAGE_ID || '',
        },
        properties: {
          title: {
            title: [
              {
                type: 'text',
                text: {
                  content: `${title} - ${topic}`,
                },
              },
            ],
          },
        },
        children: [
          {
            object: 'block',
            type: 'heading_1',
            heading_1: {
              rich_text: [
                {
                  type: 'text',
                  text: {
                    content: `Research: ${topic}`,
                  },
                },
              ],
            },
          },
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [
                {
                  type: 'text',
                  text: {
                    content: 'Research database created successfully',
                  },
                },
              ],
            },
          },
        ],
      });

      logger.info(`Created research database: ${title} - ${topic}`);
      return response.id;
    } catch (error) {
      logger.error('Failed to create Notion database:', error);
      throw error;
    }
  }

  async createSourcePage(databaseId: string, source: any): Promise<string> {
    try {
      logger.info(`Creating source page: ${source.title}`);
      // Simplified source page creation
      const response = await this.client.pages.create({
        parent: {
          type: 'page_id',
          page_id: databaseId,
        },
        properties: {
          title: {
            title: [
              {
                type: 'text',
                text: {
                  content: source.title,
                },
              },
            ],
          },
        },
        children: [
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [
                {
                  type: 'text',
                  text: {
                    content: `Source: ${source.url}\n\n${source.content.substring(0, 1000)}...`,
                  },
                },
              ],
            },
          },
        ],
      });

      logger.info(`Created source page: ${source.title}`);
      return response.id;
    } catch (error) {
      logger.error(`Failed to create source page for ${source.title}:`, error);
      throw error;
    }
  }

  async createSummaryPage(
    databaseId: string,
    topic: string,
    summary: any,
    sourceCount: number
  ): Promise<string> {
    try {
      logger.info(`Creating summary page for topic: ${topic}`);
      // Simplified summary page creation
      const response = await this.client.pages.create({
        parent: {
          type: 'page_id',
          page_id: databaseId,
        },
        properties: {
          title: {
            title: [
              {
                type: 'text',
                text: {
                  content: `📊 Research Summary: ${topic}`,
                },
              },
            ],
          },
        },
        children: [
          {
            object: 'block',
            type: 'heading_2',
            heading_2: {
              rich_text: [
                {
                  type: 'text',
                  text: {
                    content: `Research Summary for ${topic}`,
                  },
                },
              ],
            },
          },
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [
                {
                  type: 'text',
                  text: {
                    content: `Analyzed ${sourceCount} sources for this topic.\n\nCore insights and themes would be displayed here.`,
                  },
                },
              ],
            },
          },
        ],
      });

      logger.info(`Created summary page for topic: ${topic}`);
      return response.id;
    } catch (error) {
      logger.error(`Failed to create summary page for ${topic}:`, error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.users.me();
      logger.info('Notion connection test successful');
      return true;
    } catch (error) {
      logger.error('Notion connection test failed:', error);
      return false;
    }
  }
}