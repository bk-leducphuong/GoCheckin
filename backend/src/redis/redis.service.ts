// src/redis/redis.service.ts
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: RedisClientType;

  constructor(private configService: ConfigService) {
    this.redisClient = createClient({
      socket: {
        host: this.configService.get('REDIS_HOST', 'localhost'),
        port: this.configService.get('REDIS_PORT', 6379),
      },
      username: this.configService.get('REDIS_USERNAME', 'default'),
      password: this.configService.get('REDIS_PASSWORD', ''),
      database: this.configService.get('REDIS_DATABASE', 0),
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
