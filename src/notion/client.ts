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
      const response = await this.client.databases.create({
        parent: {
          type: 'page_id',
          page_id: await this.getOrCreateParentPage(),
        },
        title: [
          {
            type: 'text',
            text: {
              content: `${title} - ${topic}`,
            },
          },
        ],
        properties: {
          'Source Type': {
            type: 'select',
            select: {
              options: [
                { name: 'Twitter', color: 'blue' },
                { name: 'YouTube', color: 'red' },
                { name: 'Reddit', color: 'orange' },
                { name: 'Article', color: 'green' },
                { name: 'VC Blog', color: 'purple' },
                { name: 'Book', color: 'gray' },
                { name: 'News', color: 'yellow' },
                { name: 'Academic', color: 'brown' },
              ],
            },
          },
          'URL': {
            type: 'url',
          },
          'Title': {
            type: 'title',
            title: {},
          },
          'Author': {
            type: 'rich_text',
            rich_text: {},
          },
          'Published Date': {
            type: 'date',
            date: {},
          },
          'Relevance Score': {
            type: 'number',
            number: {
              format: 'number',
            },
          },
          'TL;DR': {
            type: 'rich_text',
            rich_text: {},
          },
          'Main Points': {
            type: 'multi_select',
            multi_select: {
              options: [],
            },
          },
          'Key Quotes': {
            type: 'rich_text',
            rich_text: {},
          },
          'Credibility': {
            type: 'select',
            select: {
              options: [
                { name: 'High', color: 'green' },
                { name: 'Medium', color: 'yellow' },
                { name: 'Low', color: 'red' },
              ],
            },
          },
          'Connections': {
            type: 'relation',
            relation: {
              database_id: '', // Will be set after database creation
              single_property: {},
            },
          },
          'Topics': {
            type: 'multi_select',
            multi_select: {
              options: [],
            },
          },
          'Status': {
            type: 'select',
            select: {
              options: [
                { name: 'New', color: 'gray' },
                { name: 'Analyzed', color: 'blue' },
                { name: 'Processed', color: 'green' },
              ],
            },
          },
        },
      });

      logger.info(`Created Notion database: ${title} - ${topic}`);
      return response.id;
    } catch (error) {
      logger.error('Failed to create Notion database:', error);
      throw error;
    }
  }

  async createSourcePage(
    databaseId: string,
    source: any // AnalyzedSource type
  ): Promise<string> {
    try {
      const response = await this.client.pages.create({
        parent: {
          type: 'database_id',
          database_id: databaseId,
        },
        properties: {
          'Title': {
            title: [
              {
                type: 'text',
                text: {
                  content: source.title,
                },
              },
            ],
          },
          'URL': {
            url: source.url,
          },
          'Source Type': {
            select: {
              name: source.type.charAt(0).toUpperCase() + source.type.slice(1),
            },
          },
          'Author': {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: source.author || 'Unknown',
                },
              },
            ],
          },
          'Published Date': {
            date: source.publishDate
              ? { start: source.publishDate.toISOString() }
              : null,
          },
          'Relevance Score': {
            number: source.relevanceScore,
          },
          'TL;DR': {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: source.tldr,
                },
              },
            ],
          },
          'Key Quotes': {
            rich_text: source.keyQuotes.map((quote: string) => ({
              type: 'text',
              text: {
                content: `"${quote}"\n\n`,
              },
            })),
          },
          'Credibility': {
            select: {
              name: source.credibility.charAt(0).toUpperCase() + source.credibility.slice(1),
            },
          },
          'Topics': {
            multi_select: source.analysis.topics.map((topic: string) => ({
              name: topic,
            })),
          },
          'Status': {
            select: {
              name: 'Analyzed',
            },
          },
        },
        children: this.createContentBlocks(source),
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
      const response = await this.client.pages.create({
        parent: {
          type: 'database_id',
          database_id: databaseId,
        },
        properties: {
          'Title': {
            title: [
              {
                type: 'text',
                text: {
                  content: `📊 Research Summary: ${topic}`,
                },
              },
            ],
          },
          'Source Type': {
            select: {
              name: 'Summary',
            },
          },
          'Status': {
            select: {
              name: 'Processed',
            },
          },
        },
        children: this.createSummaryBlocks(topic, summary, sourceCount),
      });

      logger.info(`Created summary page for topic: ${topic}`);
      return response.id;
    } catch (error) {
      logger.error(`Failed to create summary page for ${topic}:`, error);
      throw error;
    }
  }

  private createContentBlocks(source: any): any[] {
    const blocks = [
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: '🔗 Source Information',
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
                content: `**URL**: ${source.url}\n`,
              },
            },
            {
              type: 'text',
              text: {
                content: `**Platform**: ${source.type}\n`,
              },
            },
            {
              type: 'text',
              text: {
                content: `**Author**: ${source.author || 'Unknown'}\n`,
              },
            },
            {
              type: 'text',
              text: {
                content: `**Published**: ${source.publishDate ? source.publishDate.toLocaleDateString() : 'Unknown'}\n`,
              },
            },
            {
              type: 'text',
              text: {
                content: `**Credibility**: ${source.credibility}`,
              },
            },
          ],
        },
      },
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: '📝 Content Summary',
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
                content: source.content.substring(0, 2000),
              },
            },
          ],
        },
      },
    ];

    // Add main points if available
    if (source.mainPoints && source.mainPoints.length > 0) {
      blocks.push({
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: '🎯 Main Points',
              },
            },
          ],
        },
      });

      source.mainPoints.forEach((point: string) => {
        blocks.push({
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: point,
                },
              },
            ],
          },
        });
      });
    }

    // Add connections if available
    if (source.connections && source.connections.length > 0) {
      blocks.push({
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: '🔗 Connections',
              },
            },
          ],
        },
      });

      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: source.connections.join('\n\n'),
              },
            },
          ],
        },
      });
    }

    return blocks;
  }

  private createSummaryBlocks(topic: string, summary: any, sourceCount: number): any[] {
    return [
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: `📊 Research Summary: ${topic}`,
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
                content: `**Research Date**: ${new Date().toLocaleDateString()}\n`,
              },
            },
            {
              type: 'text',
              text: {
                content: `**Sources Analyzed**: ${sourceCount}`,
              },
            },
          ],
        },
      },
      {
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: '🎯 Core Themes',
              },
            },
          ],
        },
      },
      {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: summary.coreThemes.map((theme: string) => ({
            type: 'text',
            text: { content: theme },
          })),
        },
      },
      {
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: '💡 Key Insights',
              },
            },
          ],
        },
      },
      {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: summary.keyInsights.map((insight: string) => ({
            type: 'text',
            text: { content: insight },
          })),
        },
      },
      {
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: '⚠️ Contradictions & Debates',
              },
            },
          ],
        },
      },
      {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: summary.contradictions.map((contradiction: string) => ({
            type: 'text',
            text: { content: contradiction },
          })),
        },
      },
      {
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: '❓ Knowledge Gaps',
              },
            },
          ],
        },
      },
      {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: summary.knowledgeGaps.map((gap: string) => ({
            type: 'text',
            text: { content: gap },
          })),
        },
      },
      {
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: '📖 Story Angles',
              },
            },
          ],
        },
      },
      {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: summary.storyAngles.map((angle: string) => ({
            type: 'text',
            text: { content: angle },
          })),
        },
      },
    ];
  }

  private async getOrCreateParentPage(): Promise<string> {
    // For now, return a hardcoded page ID or create a default parent page
    // In a real implementation, you might want to:
    // 1. Check if a parent page exists
    // 2. Create one if it doesn't
    // 3. Return the page ID

    try {
      // Try to find an existing parent page
      const searchResponse = await this.client.search({
        query: 'Deep Research Bot',
        filter: {
          property: 'object',
          value: 'page',
        },
      });

      if (searchResponse.results.length > 0) {
        return searchResponse.results[0].id;
      }

      // Create a new parent page
      const createResponse = await this.client.pages.create({
        parent: {
          type: 'page_id',
          page_id: process.env.NOTION_PARENT_PAGE_ID || '', // Optional parent page
        },
        properties: {
          title: {
            title: [
              {
                type: 'text',
                text: {
                  content: 'Deep Research Bot',
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
                    content: 'This page contains research databases generated by the Deep Research Bot.',
                  },
                },
              ],
            },
          },
        ],
      });

      return createResponse.id;
    } catch (error) {
      logger.error('Failed to get or create parent page:', error);
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