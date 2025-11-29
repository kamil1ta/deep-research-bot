import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import logger from './logger.service';

interface CacheEntry {
  key: string;
  value: string;
  expiresAt: number;
  createdAt: number;
}

export class CacheService {
  private db: Database.Database;
  private cleanupInterval?: NodeJS.Timeout;

  constructor(dbPath: string = './data/cache.db') {
    // Ensure data directory exists
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.db = new Database(dbPath);
    this.initializeDatabase();
    this.startCleanupTimer();
  }

  private initializeDatabase(): void {
    try {
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS cache (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          expiresAt INTEGER NOT NULL,
          createdAt INTEGER NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_expires_at ON cache(expiresAt);
      `);
      logger.info('Cache database initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize cache database:', error);
      throw error;
    }
  }

  private startCleanupTimer(): void {
    // Clean expired entries every hour
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 3600000); // 1 hour
  }

  private cleanup(): void {
    try {
      const now = Date.now();
      const stmt = this.db.prepare('DELETE FROM cache WHERE expiresAt <= ?');
      const result = stmt.run(now);

      if (result.changes > 0) {
        logger.debug(`Cleaned up ${result.changes} expired cache entries`);
      }
    } catch (error) {
      logger.error('Failed to cleanup cache:', error);
    }
  }

  public set(key: string, value: any, ttlSeconds: number = 3600): void {
    try {
      const now = Date.now();
      const expiresAt = now + ttlSeconds * 1000;
      const serializedValue = JSON.stringify(value);

      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO cache (key, value, expiresAt, createdAt)
        VALUES (?, ?, ?, ?)
      `);

      stmt.run(key, serializedValue, expiresAt, now);
      logger.debug(`Cached entry: ${key}`);
    } catch (error) {
      logger.error(`Failed to cache entry ${key}:`, error);
    }
  }

  public get<T>(key: string): T | null {
    try {
      const stmt = this.db.prepare('SELECT value, expiresAt FROM cache WHERE key = ?');
      const result = stmt.get(key) as CacheEntry;

      if (!result) {
        return null;
      }

      if (result.expiresAt <= Date.now()) {
        this.delete(key);
        return null;
      }

      const parsedValue = JSON.parse(result.value);
      logger.debug(`Cache hit: ${key}`);
      return parsedValue;
    } catch (error) {
      logger.error(`Failed to get cache entry ${key}:`, error);
      return null;
    }
  }

  public delete(key: string): void {
    try {
      const stmt = this.db.prepare('DELETE FROM cache WHERE key = ?');
      stmt.run(key);
      logger.debug(`Deleted cache entry: ${key}`);
    } catch (error) {
      logger.error(`Failed to delete cache entry ${key}:`, error);
    }
  }

  public clear(): void {
    try {
      this.db.exec('DELETE FROM cache');
      logger.info('Cache cleared successfully');
    } catch (error) {
      logger.error('Failed to clear cache:', error);
    }
  }

  public getStats(): { total: number; expired: number } {
    try {
      const now = Date.now();

      const totalStmt = this.db.prepare('SELECT COUNT(*) as count FROM cache');
      const totalResult = totalStmt.get() as { count: number };

      const expiredStmt = this.db.prepare('SELECT COUNT(*) as count FROM cache WHERE expiresAt <= ?');
      const expiredResult = expiredStmt.get(now) as { count: number };

      return {
        total: totalResult.count,
        expired: expiredResult.count,
      };
    } catch (error) {
      logger.error('Failed to get cache stats:', error);
      return { total: 0, expired: 0 };
    }
  }

  public close(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.db.close();
    logger.info('Cache service closed');
  }
}

export const cacheService = new CacheService();