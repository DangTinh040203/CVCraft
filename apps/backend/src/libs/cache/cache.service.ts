import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';

import { DEFAULT_CACHE_TTL } from '@/libs/cache/cache.constants';

interface CacheStore {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
}

/**
 * Best-effort cache: when Redis is down, reads miss and writes are skipped
 * (with a warning) so requests fall through to the database instead of
 * failing.
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cache: CacheStore,
  ) {}

  async get<T>(key: string): Promise<T | undefined> {
    try {
      return await this.cache.get<T>(key);
    } catch (error) {
      this.warn('get', key, error);
      return undefined;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.cache.set(key, value, ttl ?? DEFAULT_CACHE_TTL);
    } catch (error) {
      this.warn('set', key, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.cache.del(key);
    } catch (error) {
      // A stale entry outlives this for at most its TTL
      this.warn('del', key, error);
    }
  }

  /** Round-trips a key; unlike the methods above, a failure throws. */
  async ping(): Promise<void> {
    const key = 'health:ping';
    const value = Date.now();
    await this.cache.set(key, value, 5_000);
    if ((await this.cache.get<number>(key)) !== value) {
      throw new Error('Cache returned a different value');
    }
  }

  private warn(operation: string, key: string, error: unknown) {
    const reason = error instanceof Error ? error.message : String(error);
    this.logger.warn(`Cache ${operation} failed for "${key}": ${reason}`);
  }
}
