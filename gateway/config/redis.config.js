// gateway/config/redis.config.js - Cấu hình kết nối ioredis

export function getRedisConfig(customUrl = null) {
  const url = customUrl || process.env.REDIS_URL || 'redis://redis:6379';
  return {
    url,
    retryStrategy(times) {
      const delay = Math.min(times * 100, 3000);
      return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    autoResendUnfulfilledCommands: true
  };
}
