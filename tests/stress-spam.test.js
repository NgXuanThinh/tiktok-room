// tests/stress-spam.test.js - High-load stress simulation & Freeze Timer verification
import Redis from 'ioredis';
import { processRawEvent } from '../gateway/index.js';
import { REDIS_KEYS } from '../gateway/constants/gateway.constants.js';

const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';

async function runStressTest() {
  console.log(`\n======================================================`);
  console.log(`[Stress Test] Starting High-Load Spam & Freeze Test`);
  console.log(`======================================================`);
  console.log(`Connecting to Redis at ${redisUrl}...`);

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
    // 1. Reset test state
    await redis.del(REDIS_KEYS.EVENT_STREAM);
    await redis.del(REDIS_KEYS.BACKEND_LOAD_METRICS);

    // Clean keys for 20 simulated users
    const userKeys = [];
    for (let i = 1; i <= 20; i++) {
      userKeys.push(`${REDIS_KEYS.USER_COOLDOWN_PREFIX}stress_user_${i}`);
    }
    if (userKeys.length > 0) await redis.del(...userKeys);

    console.log('\n--- 1. Simulating 20 Viewers Concurrently Spamming Commands ---');
    console.log('Sending 100 rapid commands across 20 users (5 commands each in bursts)...');

    const commands = ['!color red', '!color blue', '!dance 1', '!face smile', '!dance 2'];
    const results = [];

    // Dispatch 100 rapid commands
    for (let round = 0; round < 5; round++) {
      const promises = [];
      for (let userIdx = 1; userIdx <= 20; userIdx++) {
        const userId = `stress_user_${userIdx}`;
        const cmd = commands[round % commands.length];
        const rawChat = {
          comment: cmd,
          user: { id: userId, uniqueId: userId, nickname: `Viewer ${userIdx}` }
        };
        promises.push(processRawEvent('chat', rawChat));
      }
      const roundRes = await Promise.all(promises);
      results.push(...roundRes);
      // Small delay between bursts
      await new Promise(r => setTimeout(r, 100));
    }

    const passedCount = results.filter(r => r !== null).length;
    const droppedCount = results.filter(r => r === null).length;

    console.log(`  > Total commands attempted: ${results.length}`);
    console.log(`  > Allowed into stream: ${passedCount}`);
    console.log(`  > Dropped (Throttled): ${droppedCount}`);

    // Exactly 20 commands should pass (1 per user)
    assert(passedCount === 20, `Exactly 20 commands allowed (1 per unique viewer), got ${passedCount}`);
    assert(droppedCount === 80, `Exactly 80 spam commands dropped (80% drop rate), got ${droppedCount}`);

    console.log('\n--- 2. Verifying VIP Gifts Under High Load (Never Dropped) ---');
    const giftResults = [];
    for (let i = 1; i <= 5; i++) {
      const rawGift = {
        giftId: 2000 + i,
        giftName: `Lion Coronation ${i}`,
        diamondCount: 6000,
        repeatCount: 1,
        user: { id: `whale_${i}`, uniqueId: `whale_${i}`, nickname: `Whale ${i}` }
      };
      giftResults.push(await processRawEvent('gift', rawGift));
    }

    const giftsPublished = giftResults.filter(r => r !== null).length;
    assert(giftsPublished === 5, `100% of VIP Gifts (5/5) bypassed immediately without dropping`);

    console.log('\n--- 3. Testing Freeze State (Showcase Active in Backend) ---');
    // Simulate backend writing Freeze state
    await redis.set(REDIS_KEYS.BACKEND_LOAD_METRICS, JSON.stringify({
      multiplier: 1.0,
      isCinematic: true,
      isFrozen: true,
      queueDepth: 5,
      activeAvatars: 25
    }), 'EX', 5);

    // User whose cooldown has reset tries to send command during freeze
    await redis.del(`${REDIS_KEYS.USER_COOLDOWN_PREFIX}stress_user_1`);
    const frozenAttempt = await processRawEvent('chat', {
      comment: '!color green',
      user: { id: 'stress_user_1', uniqueId: 'stress_user_1', nickname: 'Viewer 1' }
    });

    assert(frozenAttempt === null, 'Command rejected during Freeze State (VIP Showcase active)');

    console.log('\n--- 4. Testing Unfreeze (Showcase Concluded) ---');
    // Backend reports normal state
    await redis.set(REDIS_KEYS.BACKEND_LOAD_METRICS, JSON.stringify({
      multiplier: 1.0,
      isCinematic: false,
      isFrozen: false,
      queueDepth: 0,
      activeAvatars: 25
    }), 'EX', 5);

    // Wait 550ms for the in-memory 500ms metrics cache to expire
    await new Promise(r => setTimeout(r, 550));

    const unfreezeAttempt = await processRawEvent('chat', {
      comment: '!color green',
      user: { id: 'stress_user_1', uniqueId: 'stress_user_1', nickname: 'Viewer 1' }
    });

    assert(unfreezeAttempt !== null, 'Command accepted immediately after Freeze ends');

    console.log(`\n======================================================`);
    console.log(`Stress & Freeze Results: ${passed} PASSED, ${failed} FAILED`);
    console.log(`======================================================\n`);

    if (failed > 0) process.exit(1);
    process.exit(0);
  } finally {
    await redis.quit();
  }
}

runStressTest().catch(err => {
  console.error('[Stress Test Failed]:', err);
  process.exit(1);
});
