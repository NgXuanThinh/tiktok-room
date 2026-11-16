// gateway/services/event-stream-producer.js - Bounded Redis Stream Event Producer
import { REDIS_KEYS, STREAM_CONFIG } from '../constants/gateway.constants.js';

export class EventStreamProducer {
  constructor(redisClient, options = {}) {
    this.redis = redisClient;
    this.streamKey = options.streamKey || REDIS_KEYS.EVENT_STREAM;
    this.maxLen = options.maxLen || STREAM_CONFIG.MAX_LEN;
    this.approximate = options.approximate ?? STREAM_CONFIG.MAX_LEN_APPROXIMATE;
  }

  /**
   * Publishes a normalized, verified event to the bounded Redis Stream.
   * @param {object} event - Verified event object
   * @returns {Promise<string>} The generated Redis Stream Entry ID
   */
  async publish(event) {
    if (!event) return null;

    try {
      const payloadString = typeof event === 'string' ? event : JSON.stringify(event);
      const args = [this.streamKey];

      if (this.approximate) {
        args.push('MAXLEN', '~', this.maxLen);
      } else {
        args.push('MAXLEN', this.maxLen);
      }

      args.push('*', 'payload', payloadString, 'type', event.type || 'unknown');

      const entryId = await this.redis.xadd(...args);
      return entryId;
    } catch (err) {
      console.error('[EventStreamProducer] Failed to publish event:', err.message);
      return null;
    }
  }
}
