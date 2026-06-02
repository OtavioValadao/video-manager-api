import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import { ICachePort } from "src/boundary/ports/cache.port";

@Injectable()
export class RedisAdapter implements ICachePort, OnModuleDestroy {
  private readonly redis: Redis;

  constructor(private readonly config: ConfigService) {
    const url = this.config.getOrThrow<string>("REDIS_URL");
    this.redis = new Redis(url, { maxRetriesPerRequest: 2 });
  }

  onModuleDestroy(): void {
    this.redis.disconnect();
  }

  async setJson<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.redis.get(key);
    if (raw === null) {
      return null;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
