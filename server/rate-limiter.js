// server/rate-limiter.js - Leaky bucket rate limiter with combo aggregation & VIP bypass

export class EventQueueRateLimiter {
  constructor(options = {}) {
    this.maxQueueSize = options.maxQueueSize || 100;
    this.comboWindowMs = options.comboWindowMs || 500;
    this.drainRateHz = options.drainRateHz || 60;
    this.onDispatch = typeof options.onDispatch === 'function' ? options.onDispatch : () => {};

    this.queue = [];
    this.likeComboCount = 0;
    this.lastLikeUser = null;
    this.comboTimer = null;

    // Start background drain interval
    const drainIntervalMs = Math.max(10, Math.floor(1000 / this.drainRateHz));
    this.drainInterval = setInterval(() => {
      if (this.queue.length > 0) {
        const evt = this.queue.shift();
        this.onDispatch(evt);
      }
    }, drainIntervalMs);
    if (this.drainInterval.unref) {
      this.drainInterval.unref();
    }
  }

  /**
   * Enqueues an event. VIP events (Tier 2/3/4 gifts) bypass immediately.
   * High-volume likes are aggregated in a combo sliding window.
   */
  enqueue(event) {
    if (!event) return;

    // VIP Priority Queue Bypass: Tier 2, 3, 4 gifts dispatch synchronously immediately
    const isVipGift = event.type === 'gift' && (event.data?.tier >= 2 || event.data?.totalCoins >= 100);
    if (isVipGift) {
      this.onDispatch(event);
      return;
    }

    // Like Combo Aggregation
    if (event.type === 'like') {
      const count = Number(event.data?.likeCount || 1);
      this.likeComboCount += count;
      if (event.user) {
        this.lastLikeUser = event.user;
      }

      if (!this.comboTimer) {
        this.comboTimer = setTimeout(() => {
          this.flushCombo();
        }, this.comboWindowMs);
      }
      return;
    }

    // Normal queue handling for chat, tier 1 gifts, social events
    if (this.queue.length >= this.maxQueueSize) {
      // Saturation protection: drop oldest low-priority entry
      this.queue.shift();
    }

    this.queue.push(event);
  }

  /**
   * Flushes aggregated like combo into a single batch event.
   */
  flushCombo() {
    if (this.comboTimer) {
      clearTimeout(this.comboTimer);
      this.comboTimer = null;
    }

    if (this.likeComboCount > 0) {
      const batchEvent = {
        id: `like_batch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        type: 'like_batch',
        user: this.lastLikeUser || { username: 'TikTok Audience', nickname: 'Viewers' },
        data: {
          likeCount: this.likeComboCount,
          count: this.likeComboCount,
          isBatch: true
        },
        timestamp: Date.now()
      };

      if (this.queue.length >= this.maxQueueSize) {
        this.queue.shift();
      }
      this.queue.push(batchEvent);

      this.likeComboCount = 0;
      this.lastLikeUser = null;
    }
  }

  /**
   * Drains all queued items immediately.
   */
  drainQueue() {
    this.flushCombo();
    while (this.queue.length > 0) {
      const evt = this.queue.shift();
      this.onDispatch(evt);
    }
  }

  /**
   * Returns current pending queue length.
   */
  getQueueSize() {
    return this.queue.length;
  }

  /**
   * Resets all internal buffers and timers.
   */
  reset() {
    if (this.comboTimer) {
      clearTimeout(this.comboTimer);
      this.comboTimer = null;
    }
    if (this.drainInterval) {
      clearInterval(this.drainInterval);
      this.drainInterval = null;
    }
    this.queue = [];
    this.likeComboCount = 0;
    this.lastLikeUser = null;
  }
}
