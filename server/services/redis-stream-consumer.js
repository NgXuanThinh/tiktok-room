// server/services/redis-stream-consumer.js - Redis Stream Event Consumer
import { REDIS_KEYS, STREAM_CONFIG } from '../../gateway/constants/gateway.constants.js';

export class RedisStreamConsumer {
  constructor(redisClient, options = {}) {
    this.redis = redisClient;
    this.streamKey = options.streamKey || REDIS_KEYS.EVENT_STREAM;
    this.blockTimeoutMs = options.blockTimeoutMs || STREAM_CONFIG.STREAM_BLOCK_MS;
    this.batchSize = options.batchSize || STREAM_CONFIG.BATCH_SIZE;
    this.onEvent = typeof options.onEvent === 'function' ? options.onEvent : () => {};

    this.lastId = options.startFromLatest === false ? '0-0' : '$';
    this.isRunning = false;
    this.pollPromise = null;
  }

  /**
   * Starts the continuous stream listening loop.
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this._pollLoop();
  }

  /**
   * Internal polling loop with XREAD BLOCK
   */
  async _pollLoop() {
    while (this.isRunning) {
      try {
        // XREAD COUNT <batchSize> BLOCK <blockTimeoutMs> STREAMS <streamKey> <lastId>
        const response = await this.redis.xread(
          'COUNT', this.batchSize,
          'BLOCK', this.blockTimeoutMs,
          'STREAMS', this.streamKey, this.lastId
        );

        if (!this.isRunning) break;

        if (response && response.length > 0) {
          const [streamName, entries] = response[0];
          for (const [entryId, fields] of entries) {
            this.lastId = entryId;

            // Extract 'payload' field
            let payload = null;
            for (let i = 0; i < fields.length; i += 2) {
              if (fields[i] === 'payload') {
                try {
                  payload = JSON.parse(fields[i + 1]);
                } catch {
                  payload = fields[i + 1];
                }
                break;
              }
            }

            if (payload) {
              try {
                this.onEvent(payload);
              } catch (dispatchErr) {
                console.error('[RedisStreamConsumer] Error in event handler:', dispatchErr.message);
              }
            }
          }
        }
      } catch (err) {
        if (!this.isRunning) break;
        // In case of network timeout or redis reconnect, wait briefly before retrying
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }

  /**
   * Stops the continuous stream listening loop.
   */
  stop() {
    this.isRunning = false;
  }
}
