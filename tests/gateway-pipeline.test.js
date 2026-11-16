// tests/gateway-pipeline.test.js - End-to-end test for Gateway event pipeline and Redis Stream
import Redis from 'ioredis';
import { processRawEvent } from '../gateway/index.js';
import { REDIS_KEYS } from '../gateway/constants/gateway.constants.js';

const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';

async function runPipelineTest() {
  console.log(`[Pipeline Test] Connecting to Redis at ${redisUrl}...`);
  const redis = new Redis(redisUrl, { maxRetriesPerRequest: 1 });

  let passed = 0;
  let failed = 0;

  function assert(condition, desc) {
    if (condition) {
      console.log(`  [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${desc}`);
      failed++;
    }
  }

  try {
    // 1. Clean test keys
    await redis.del(REDIS_KEYS.EVENT_STREAM);
    await redis.del(`${REDIS_KEYS.USER_COOLDOWN_PREFIX}user_flow_1`);
    await redis.del(REDIS_KEYS.BACKEND_LOAD_METRICS);

    console.log('\n--- 1. Testing First Command Ingestion into Redis Stream ---');
    const rawCmd1 = {
      comment: '!color red',
      user: { id: 'user_flow_1', uniqueId: 'flow_viewer', nickname: 'Flow Viewer' }
    };
    const streamId1 = await processRawEvent('chat', rawCmd1);
    assert(streamId1 !== null, 'First !color red published to Redis Stream');

    console.log('\n--- 2. Testing Spam Drop at Pipeline Level ---');
    const rawCmd2 = {
      comment: '!dance 1',
      user: { id: 'user_flow_1', uniqueId: 'flow_viewer', nickname: 'Flow Viewer' }
    };
    const streamId2 = await processRawEvent('chat', rawCmd2);
    assert(streamId2 === null, 'Spam !dance within 10s was dropped (returned null)');

    console.log('\n--- 3. Testing VIP Gift Bypass into Redis Stream ---');
    const rawVipGift = {
      giftId: 1001,
      giftName: 'Universe / Galaxy',
      diamondCount: 1000,
      repeatCount: 1,
      user: { id: 'whale_user_1', uniqueId: 'big_whale', nickname: 'Big Whale' }
    };
    const vipStreamId = await processRawEvent('gift', rawVipGift);
    assert(vipStreamId !== null, 'VIP Gift was published immediately to Redis Stream');

    console.log('\n--- 4. Verifying Messages in Redis Stream ---');
    // Read stream messages from beginning
    const streamEntries = await redis.xrange(REDIS_KEYS.EVENT_STREAM, '-', '+');
    assert(streamEntries.length >= 2, `Redis Stream contains ${streamEntries.length} entries`);

    // Parse the entries
    const firstEntryFields = streamEntries[0][1];
    let payload1 = null;
    for (let i = 0; i < firstEntryFields.length; i += 2) {
      if (firstEntryFields[i] === 'payload') {
        payload1 = JSON.parse(firstEntryFields[i + 1]);
        break;
      }
    }
    assert(payload1 && payload1.type === 'chat', 'Entry 1 is normalized chat event');
    assert(payload1.data?.comment === '!color red', 'Entry 1 contains !color red');

    const secondEntryFields = streamEntries[1][1];
    let payload2 = null;
    for (let i = 0; i < secondEntryFields.length; i += 2) {
      if (secondEntryFields[i] === 'payload') {
        payload2 = JSON.parse(secondEntryFields[i + 1]);
        break;
      }
    }
    assert(payload2 && payload2.type === 'gift', 'Entry 2 is normalized gift event');
    assert(payload2.data?.totalCoins === 1000, 'Entry 2 totalCoins = 1000');

    console.log(`\n========================================`);
    console.log(`Pipeline Results: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    if (failed > 0) process.exit(1);
    process.exit(0);
  } finally {
    await redis.quit();
  }
}

runPipelineTest().catch((err) => {
  console.error('[Pipeline Test Error]:', err);
  process.exit(1);
});
