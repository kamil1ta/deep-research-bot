import { NotionClient } from './client';
import { AnalyzedSource, ResearchSummary } from '../utils/types';
import logger from '../services/logger.service';

export class DatabaseManager {
  private notionClient: NotionClient;
  private activeDatabases: Map<string, string> = new Map(); // topic -> databaseId

  constructor(notionClient: NotionClient) {
    this.notionClient = notionClient;
  }

  async getOrCreateDatabase(topic: string): Promise<string> {
    // Check if we already have a database for this topic
    if (this.activeDatabases.has(topic)) {
      return this.activeDatabases.get(topic)!;
    }

    try {
      // Create a new database for the topic
      const databaseId = await this.notionClient.createDatabase(
        'Research Database',
        topic
      );

      // Cache the database ID
      this.activeDatabases.set(topic, databaseId);

      logger.info(`Created and cached database for topic: ${topic}`);
      return databaseId;
    } catch (error) {
      logger.error(`Failed to create database for topic ${topic}:`, error);
      throw error;
    }
  }

  async addSourcesToDatabase(
    topic: string,
    sources: AnalyzedSource[]
  ): Promise<string[]> {
    const databaseId = await this.getOrCreateDatabase(topic);
    const pageIds: string[] = [];

    logger.info(`Adding ${sources.length} sources to database for topic: ${topic}`);

    try {
      // Process sources in batches to avoid rate limits
      const batchSize = 5;
      for (let i = 0; i < sources.length; i += batchSize) {
        const batch = sources.slice(i, i + batchSize);

        await Promise.all(
          batch.map(async (source) => {
            try {
              const pageId = await this.notionClient.createSourcePage(
                databaseId,
                source
              );
              pageIds.push(pageId);
            } catch (error) {
              logger.error(
                `Failed to create page for source: ${source.title}`,
                error
              );
              // Continue processing other sources
            }
          })
        );

        // Add delay between batches to respect rate limits
        if (i + batchSize < sources.length) {
          await this.delay(2000); // 2 second delay between batches
        }
      }

      logger.info(`Successfully created ${pageIds.length} pages for topic: ${topic}`);
      return pageIds;
    } catch (error) {
      logger.error(`Failed to add sources to database for topic ${topic}:`, error);
      throw error;
    }
  }

  async addSummaryToDatabase(
    topic: string,
    summary: ResearchSummary,
    sourceCount: number
  ): Promise<string> {
    const databaseId = await this.getOrCreateDatabase(topic);

    try {
      const pageId = await this.notionClient.createSummaryPage(
        databaseId,
        topic,
        summary,
        sourceCount
      );

      logger.info(`Created summary page for topic: ${topic}`);
      return pageId;
    } catch (error) {
      logger.error(`Failed to create summary page for topic ${topic}:`, error);
      throw error;
    }
  }

  async searchExistingDatabases(topic: string): Promise<string | null> {
    try {
      // This would search for existing databases for the given topic
      // Implementation depends on your Notion setup
      logger.info(`Searching for existing database for topic: ${topic}`);

      // For now, always return null to create new databases
      // In a real implementation, you might:
      // 1. Search for databases with matching titles
      // 2. Check their contents to see if they're relevant
      // 3. Return the existing database ID if found

      return null;
    } catch (error) {
      logger.error(`Failed to search for existing database for topic ${topic}:`, error);
      return null;
    }
  }

  async getDatabaseContents(databaseId: string): Promise<any[]> {
    try {
      // This would retrieve all pages from a database
      // Implementation would use the Notion API to query the database
      logger.info(`Retrieving contents from database: ${databaseId}`);

      // For now, return empty array
      // In a real implementation, you would:
      // 1. Use the Notion API to query the database
      // 2. Handle pagination
      // 3. Parse and return the results

      return [];
    } catch (error) {
      logger.error(`Failed to get database contents for ${databaseId}:`, error);
      return [];
    }
  }

  async updateDatabaseProperties(
    databaseId: string,
    properties: Record<string, any>
  ): Promise<void> {
    try {
      // This would update database properties
      // Implementation depends on specific use case
      logger.info(`Updating properties for database: ${databaseId}`);

      // For now, just log the update
      // In a real implementation, you would use the Notion API to update properties
    } catch (error) {
      logger.error(`Failed to update database properties for ${databaseId}:`, error);
      throw error;
    }
  }

  async archiveDatabase(databaseId: string): Promise<void> {
    try {
      // This would archive a database
      // Implementation would use the Notion API to archive
      logger.info(`Archiving database: ${databaseId}`);

      // For now, just log the archive
      // In a real implementation, you would use the Notion API to archive
    } catch (error) {
      logger.error(`Failed to archive database ${databaseId}:`, error);
      throw error;
    }
  }

  getActiveDatabaseTopics(): string[] {
    return Array.from(this.activeDatabases.keys());
  }

  hasDatabaseForTopic(topic: string): boolean {
    return this.activeDatabases.has(topic);
  }

  removeDatabaseCache(topic: string): void {
    this.activeDatabases.delete(topic);
    logger.info(`Removed database cache for topic: ${topic}`);
  }

  clearDatabaseCache(): void {
    this.activeDatabases.clear();
    logger.info('Cleared all database cache');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getDatabaseStats(databaseId: string): Promise<{
    totalPages: number;
    pagesByType: Record<string, number>;
    lastUpdated: Date | null;
  }> {
    try {
      // This would get statistics about a database
      // Implementation would query the database and analyze the results
      logger.info(`Getting stats for database: ${databaseId}`);

      // For now, return mock stats
      return {
        totalPages: 0,
        pagesByType: {},
        lastUpdated: null,
      };
    } catch (error) {
      logger.error(`Failed to get database stats for ${databaseId}:`, error);
      return {
        totalPages: 0,
        pagesByType: {},
        lastUpdated: null,
      };
    }
  }
}