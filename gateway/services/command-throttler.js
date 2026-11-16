// gateway/services/command-throttler.js - Unified Atomic Command Rate Limiter
import { COMMAND_CONFIG, REDIS_KEYS } from '../constants/gateway.constants.js';

export class CommandThrottler {
  constructor(redisClient, options = {}) {
    this.redis = redisClient;
    this.baseCooldownSec = options.baseCooldownSec || COMMAND_CONFIG.BASE_COOLDOWN_SEC;
    this.minCooldownSec = options.minCooldownSec || COMMAND_CONFIG.MIN_COOLDOWN_SEC;
    this.maxCooldownSec = options.maxCooldownSec || COMMAND_CONFIG.MAX_COOLDOWN_SEC;
    
    // In-memory cache for load metrics to minimize Redis roundtrips
    this.cachedMetrics = {
      multiplier: 1.0,
      isCinematic: false,
      isFrozen: false,
      queueDepth: 0,
      activeAvatars: 0
    };
    this.lastMetricsFetchTime = 0;
    this.metricsCacheTtlMs = 500; // Cache 500ms
  }

  /**
   * Checks if comment text is a targeted 3D interactive command (!color, !face, !dance)
   */
  isInteractiveCommand(comment) {
    if (!comment || typeof comment !== 'string') return false;
    const trimmed = comment.trim();
    if (!trimmed.startsWith('!')) return false;
    const cmd = trimmed.split(/\s+/)[0].toLowerCase();
    return COMMAND_CONFIG.SUPPORTED.includes(cmd);
  }

  /**
   * Sets base cooldown dynamically and saves to Redis
   */
  async setBaseCooldown(sec) {
    const num = Number(sec);
    const validSec = Math.max(
      this.minCooldownSec,
      Math.min(this.maxCooldownSec, isNaN(num) ? COMMAND_CONFIG.BASE_COOLDOWN_SEC : num)
    );
    this.baseCooldownSec = validSec;
    try {
      await this.redis.set(REDIS_KEYS.COMMAND_COOLDOWN_SEC, String(validSec));
    } catch (err) {
      console.warn('[CommandThrottler] Failed to persist cooldown to Redis:', err.message);
    }
    return validSec;
  }

  /**
   * Reads configured base cooldown from Redis or in-memory
   */
  async getBaseCooldown() {
    try {
      const raw = await this.redis.get(REDIS_KEYS.COMMAND_COOLDOWN_SEC);
      if (raw !== null && raw !== undefined) {
        const num = Number(raw);
        if (!isNaN(num) && num > 0) {
          this.baseCooldownSec = Math.max(this.minCooldownSec, Math.min(this.maxCooldownSec, num));
        }
      }
    } catch {}
    return this.baseCooldownSec;
  }

  /**
   * Refreshes load metrics from Redis with 500ms cache
   */
  async getBackendMetrics() {
    const now = Date.now();
    if (now - this.lastMetricsFetchTime < this.metricsCacheTtlMs) {
      return this.cachedMetrics;
    }

    try {
      const [raw, customCooldown] = await Promise.all([
        this.redis.get(REDIS_KEYS.BACKEND_LOAD_METRICS),
        this.redis.get(REDIS_KEYS.COMMAND_COOLDOWN_SEC)
      ]);

      if (customCooldown !== null && customCooldown !== undefined) {
        const sec = Number(customCooldown);
        if (!isNaN(sec) && sec > 0) {
          this.baseCooldownSec = Math.max(this.minCooldownSec, Math.min(this.maxCooldownSec, sec));
        }
      }

      if (raw) {
        const parsed = JSON.parse(raw);
        this.cachedMetrics = {
          multiplier: Number(parsed.multiplier) || 1.0,
          isCinematic: Boolean(parsed.isCinematic),
          isFrozen: Boolean(parsed.isFrozen || parsed.isCinematic),
          queueDepth: Number(parsed.queueDepth) || 0,
          activeAvatars: Number(parsed.activeAvatars) || 0
        };
      } else {
        // Fallback default if key expired (backend offline or uninitialized)
        this.cachedMetrics = {
          multiplier: 1.0,
          isCinematic: false,
          isFrozen: false,
          queueDepth: 0,
          activeAvatars: 0
        };
      }
      this.lastMetricsFetchTime = now;
    } catch (err) {
      // In case of Redis read error, use last known metrics
      this.lastMetricsFetchTime = now;
    }

    return this.cachedMetrics;
  }

  /**
   * Checks and consumes per-user atomic cooldown.
   * If backend is in Freeze state, rejects interactive commands immediately.
   */
  async canExecute(userId, comment) {
    if (!this.isInteractiveCommand(comment)) {
      // Not a targeted 3D command, pass through
      return { allowed: true, isCommand: false };
    }

    const cleanUserId = String(userId || 'anon');
    const metrics = await this.getBackendMetrics();

    // 1. Freeze Timer check (VIP Showcase active)
    if (metrics.isFrozen) {
      return {
        allowed: false,
        isCommand: true,
        reason: 'frozen'
      };
    }

    // 2. Compute dynamic cooldown duration
    const multiplier = metrics.multiplier || 1.0;
    const dynamicTtl = Math.max(
      this.minCooldownSec,
      Math.min(this.maxCooldownSec, Math.round(this.baseCooldownSec * multiplier))
    );

    // 3. Shared atomic per-user cooldown check: SET cooldown:user:<userId> 1 EX <ttl> NX
    const key = `${REDIS_KEYS.USER_COOLDOWN_PREFIX}${cleanUserId}`;
    try {
      const result = await this.redis.set(key, '1', 'EX', dynamicTtl, 'NX');
      if (result === 'OK') {
        return {
          allowed: true,
          isCommand: true,
          ttl: dynamicTtl
        };
      }
      return {
        allowed: false,
        isCommand: true,
        reason: 'cooldown',
        cooldownSec: dynamicTtl
      };
    } catch (err) {
      // Fail-open fallback: if Redis error occurs, allow command
      console.error('[CommandThrottler] Redis error:', err.message);
      return { allowed: true, isCommand: true, ttl: dynamicTtl, fallback: true };
    }
  }

  /**
   * Resets cooldown for a specific user (useful for testing or admin overrides)
   */
  async resetUser(userId) {
    const key = `${REDIS_KEYS.USER_COOLDOWN_PREFIX}${userId}`;
    await this.redis.del(key);
  }
}
