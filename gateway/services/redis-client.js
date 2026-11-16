// gateway/services/redis-client.js - Singleton ioredis client manager
import Redis from 'ioredis';
import { getRedisConfig } from '../config/redis.config.js';

let instance = null;

export function getRedisClient(customUrl = null) {
  if (!instance) {
    const config = getRedisConfig(customUrl);
    instance = new Redis(config.url, config);

    instance.on('connect', () => {
      console.log(`[RedisClient] Connected to Redis at ${config.url}`);
    });

    instance.on('error', (err) => {
      console.error('[RedisClient] Connection error:', err.message);
    });

    instance.on('close', () => {
      console.warn('[RedisClient] Connection closed');
    });
  }
  return instance;
}

export async function closeRedisClient() {
  if (instance) {
    try {
      await instance.quit();
    } catch {
      instance.disconnect();
    }
    instance = null;
  }
}
