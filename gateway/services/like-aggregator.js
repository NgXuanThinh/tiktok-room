// gateway/services/like-aggregator.js - Sliding-window Like Combo Aggregator
import { COMBO_CONFIG } from '../constants/gateway.constants.js';

export class LikeAggregator {
  constructor(options = {}) {
    this.windowMs = options.windowMs || COMBO_CONFIG.WINDOW_MS;
    this.onFlush = typeof options.onFlush === 'function' ? options.onFlush : () => {};

    this.likeComboCount = 0;
    this.lastLikeUser = null;
    this.comboTimer = null;
  }

  /**
   * Adds an incoming like event to the accumulator.
   */
  addLike(event) {
    const count = Number(event.data?.likeCount || event.data?.count || 1);
    this.likeComboCount += count;
    if (event.user) {
      this.lastLikeUser = event.user;
    }

    if (!this.comboTimer) {
      this.comboTimer = setTimeout(() => {
        this.flush();
      }, this.windowMs);
    }
  }

  /**
   * Flushes accumulated likes into a single batched event.
   */
  flush() {
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

      const emittedCount = this.likeComboCount;
      this.likeComboCount = 0;
      this.lastLikeUser = null;

      this.onFlush(batchEvent);
      return emittedCount;
    }
    return 0;
  }

  /**
   * Resets active timers and clears accumulators
   */
  reset() {
    if (this.comboTimer) {
      clearTimeout(this.comboTimer);
      this.comboTimer = null;
    }
    this.likeComboCount = 0;
    this.lastLikeUser = null;
  }
}
