// src/redis/redis.service.ts
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: RedisClientType;

  constructor(private configService: ConfigService) {
    this.redisClient = createClient({
      url: `redis://${this.configService.get('REDIS_HOST', 'localhost')}:${this.configService.get('REDIS_PORT', 6379)}`,
      username: this.configService.get('REDIS_USERNAME', ''),
      password: this.configService.get('REDIS_PASSWORD', ''),
    });
  }

  async onModuleInit() {
    await this.redisClient.connect();
  }

  async onModuleDestroy() {
    await this.redisClient.quit();
  }

  async hset(key: string, field: string, value: string): Promise<void> {
    await this.redisClient.hSet(key, field, value);
  }

  async hget(key: string, field: string): Promise<string | null> {
    const result = await this.redisClient.hGet(key, field);
    return result ? result.toString() : null;
  }

  async hdel(key: string, ...fields: string[]): Promise<void> {
    await this.redisClient.hDel(key, fields);
  }

  async hkeys(key: string): Promise<string[]> {
    return await this.redisClient.hKeys(key);
  }
}
