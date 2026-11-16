// gateway/index.js - Ingestion & Traffic Shaper Gateway Entry Point
import { getRedisClient, closeRedisClient } from './services/redis-client.js';
import { CommandThrottler } from './services/command-throttler.js';
import { LikeAggregator } from './services/like-aggregator.js';
import { EventClassifier } from './services/event-classifier.js';
import { EventStreamProducer } from './services/event-stream-producer.js';
import { PRIORITY_TIERS } from './constants/gateway.constants.js';
import { normalizeTikTokEvent } from '../server/event-normalizer.js';
import { TikTokService } from '../server/tiktok-service.js';

console.log('[TikTokGateway] Starting TikTok Ingestion Gateway Service...');

const redisClient = getRedisClient();
const producer = new EventStreamProducer(redisClient);
const throttler = new CommandThrottler(redisClient);

const stats = {
  totalIngested: 0,
  vipBypassed: 0,
  commandsAllowed: 0,
  commandsDropped: 0,
  likesBatched: 0
};

// Like Aggregator flushes batched like events into Redis Stream
const likeAggregator = new LikeAggregator({
  onFlush: async (batchEvent) => {
    stats.likesBatched += Number(batchEvent.data?.count || 1);
    await producer.publish(batchEvent);
  }
});

/**
 * Central event pipeline dispatcher
 */
export async function processRawEvent(type, rawData) {
  stats.totalIngested++;
  const normalized = normalizeTikTokEvent(type, rawData);
  const priority = EventClassifier.classify(normalized);

  // P0: VIP Gifts -> Immediate synchronous bypass
  if (priority === PRIORITY_TIERS.P0_VIP_GIFT) {
    stats.vipBypassed++;
    return await producer.publish(normalized);
  }

  // P1: Likes -> Sliding-window Combo Aggregator
  if (priority === PRIORITY_TIERS.P1_LIKE_COMBO) {
    likeAggregator.addLike(normalized);
    return;
  }

  // P2: Interactive Chat Commands (!color, !face, !dance) -> Unified Atomic Throttler
  if (priority === PRIORITY_TIERS.P2_CHAT_COMMAND) {
    const userId = normalized.user?.id || normalized.user?.username || 'anon';
    const comment = normalized.data?.comment || '';
    const check = await throttler.canExecute(userId, comment);

    if (check.allowed) {
      stats.commandsAllowed++;
      return await producer.publish(normalized);
    } else {
      stats.commandsDropped++;
      // Silent Drop as per approved specification
      return null;
    }
  }

  // All other events (normal chat, low-tier gifts, follow, share, member) -> Pass-through
  return await producer.publish(normalized);
}

// Connect TikTok Live Service
const tiktokService = new TikTokService();
const tiktokUsername = process.env.TIKTOK_USERNAME;

tiktokService.on('raw_event', async (type, data) => {
  try {
    await processRawEvent(type, data);
  } catch (err) {
    console.error(`[TikTokGateway] Error processing event (${type}):`, err.message);
  }
});

tiktokService.on('status', async (status) => {
  await producer.publish({ type: 'tiktok_status', data: status, timestamp: Date.now() });
});

tiktokService.on('room_ranks', async (data) => {
  await producer.publish({ type: 'room_ranks', data, timestamp: Date.now() });
});

tiktokService.on('streamEnd', async () => {
  await producer.publish({ type: 'session_reset', timestamp: Date.now() });
});

if (tiktokUsername) {
  console.log(`[TikTokGateway] Connecting to TikTok LIVE room: @${tiktokUsername}`);
  tiktokService.connect(tiktokUsername).catch((err) => {
    console.warn(`[TikTokGateway] Initial connection failed (@${tiktokUsername}):`, err.message);
  });
} else {
  console.log('[TikTokGateway] TIKTOK_USERNAME not specified. Running in standby mode (ready for commands/simulator).');
}

// Periodic stats logger every 10 seconds
const statsInterval = setInterval(() => {
  if (stats.totalIngested > 0) {
    console.log(
      `[TikTokGateway Stats] Ingested: ${stats.totalIngested} | ` +
      `VIP Bypass: ${stats.vipBypassed} | ` +
      `Cmds Passed: ${stats.commandsAllowed} | ` +
      `Cmds Dropped (Spam): ${stats.commandsDropped} | ` +
      `Likes Batched: ${stats.likesBatched}`
    );
  }
}, 10000);

// Graceful termination
async function shutdown(signal) {
  console.log(`[TikTokGateway] Received ${signal}. Shutting down cleanly...`);
  clearInterval(statsInterval);
  likeAggregator.flush();
  tiktokService.disconnect();
  await closeRedisClient();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
