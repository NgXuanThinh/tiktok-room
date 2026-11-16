// server/services/load-monitor.js - Real-time Backend Load & Health Monitor
import { LOAD_MONITOR_CONFIG } from '../constants/redis-consumer.constants.js';
import { REDIS_KEYS, LOAD_THRESHOLDS } from '../../gateway/constants/gateway.constants.js';

export class LoadMonitor {
  constructor(redisClient, options = {}) {
    this.redis = redisClient;
    this.getActiveAvatarsCount = typeof options.getActiveAvatarsCount === 'function'
      ? options.getActiveAvatarsCount
      : () => 0;
    this.getQueueDepth = typeof options.getQueueDepth === 'function'
      ? options.getQueueDepth
      : () => 0;

    this.isCinematic = false;
    this.isFrozen = false;
    this.cinematicTimer = null;
    this.heartbeatTimer = null;
    this.heartbeatIntervalMs = options.heartbeatIntervalMs || LOAD_MONITOR_CONFIG.HEARTBEAT_INTERVAL_MS;
  }

  /**
   * Sets VIP Cinematic showcase active/inactive state
   * Automatically sets Freeze flag and fallbacks if unfreeze is missed
   */
  setCinematicActive(isActive, durationSec = null) {
    this.isCinematic = Boolean(isActive);
    this.isFrozen = Boolean(isActive);

    if (this.cinematicTimer) {
      clearTimeout(this.cinematicTimer);
      this.cinematicTimer = null;
    }

    if (isActive) {
      const holdTimeSec = durationSec || LOAD_MONITOR_CONFIG.CINEMATIC_FREEZE_HOLD_SEC;
      this.cinematicTimer = setTimeout(() => {
        this.setCinematicActive(false);
      }, holdTimeSec * 1000);
      if (this.cinematicTimer.unref) this.cinematicTimer.unref();
    }

    // Immediately push updated heartbeat to Redis
    this.reportMetrics().catch(() => {});
  }

  /**
   * Calculates current load multiplier based on active users and queue depth
   */
  calculateMultiplier(activeAvatars, queueDepth) {
    if (this.isFrozen || this.isCinematic) {
      return LOAD_THRESHOLDS.MULTIPLIERS.OVERLOAD;
    }
    if (
      queueDepth >= LOAD_THRESHOLDS.HIGH_QUEUE_DEPTH ||
      activeAvatars >= LOAD_THRESHOLDS.HIGH_AVATARS
    ) {
      return LOAD_THRESHOLDS.MULTIPLIERS.HIGH;
    }
    if (
      queueDepth >= LOAD_THRESHOLDS.IDLE_QUEUE_DEPTH ||
      activeAvatars >= LOAD_THRESHOLDS.IDLE_AVATARS
    ) {
      return LOAD_THRESHOLDS.MULTIPLIERS.NORMAL;
    }
    return LOAD_THRESHOLDS.MULTIPLIERS.IDLE;
  }

  /**
   * Gathers metrics snapshot and writes to Redis with 5s TTL
   */
  async reportMetrics() {
    if (!this.redis) return null;

    const activeAvatars = Number(this.getActiveAvatarsCount()) || 0;
    const queueDepth = Number(this.getQueueDepth()) || 0;
    const multiplier = this.calculateMultiplier(activeAvatars, queueDepth);

    const metrics = {
      multiplier,
      isCinematic: this.isCinematic,
      isFrozen: this.isFrozen,
      queueDepth,
      activeAvatars,
      timestamp: Date.now()
    };

    try {
      await this.redis.set(
        REDIS_KEYS.BACKEND_LOAD_METRICS,
        JSON.stringify(metrics),
        'EX',
        REDIS_KEYS.HEARTBEAT_TTL_SEC
      );
      return metrics;
    } catch (err) {
      console.warn('[LoadMonitor] Failed to push heartbeat to Redis:', err.message);
      return metrics;
    }
  }

  /**
   * Starts periodic heartbeat timer
   */
  start() {
    if (this.heartbeatTimer) return;
    this.reportMetrics();
    this.heartbeatTimer = setInterval(() => {
      this.reportMetrics();
    }, this.heartbeatIntervalMs);
    if (this.heartbeatTimer.unref) this.heartbeatTimer.unref();
  }

  /**
   * Stops periodic heartbeat timer
   */
  stop() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.cinematicTimer) {
      clearTimeout(this.cinematicTimer);
      this.cinematicTimer = null;
    }
  }
}
