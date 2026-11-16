// tests/redis-throttler.test.js - Unit tests for CommandThrottler with ioredis
import Redis from 'ioredis';
import { CommandThrottler } from '../gateway/services/command-throttler.js';
import { REDIS_KEYS } from '../gateway/constants/gateway.constants.js';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

async function runTests() {
  console.log(`[Test] Connecting to Redis at ${redisUrl}...`);
  const redis = new Redis(redisUrl, { maxRetriesPerRequest: 1 });
  
  await new Promise((resolve, reject) => {
    redis.on('connect', resolve);
    redis.on('error', reject);
  });
  console.log('[Test] Connected to Redis.');

  const throttler = new CommandThrottler(redis, {
    baseCooldownSec: 10,
    minCooldownSec: 5,
    maxCooldownSec: 45
  });

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
    // Clean test keys
    await redis.del(`${REDIS_KEYS.USER_COOLDOWN_PREFIX}user_test_1`);
    await redis.del(`${REDIS_KEYS.USER_COOLDOWN_PREFIX}user_test_2`);
    await redis.del(REDIS_KEYS.BACKEND_LOAD_METRICS);

    console.log('\n--- 1. Testing Command Identification ---');
    assert(throttler.isInteractiveCommand('!color red') === true, '!color red is interactive');
    assert(throttler.isInteractiveCommand('!face smile') === true, '!face smile is interactive');
    assert(throttler.isInteractiveCommand('!dance 1') === true, '!dance 1 is interactive');
    assert(throttler.isInteractiveCommand('hello world') === false, 'hello world is not interactive');
    assert(throttler.isInteractiveCommand('!unknown cmd') === false, '!unknown cmd is not interactive');

    console.log('\n--- 2. Testing Normal Chat Pass-through ---');
    const normalChat = await throttler.canExecute('user_test_1', 'Xin chao ca nha');
    assert(normalChat.allowed === true && normalChat.isCommand === false, 'Normal chat passes without rate-limiting');

    console.log('\n--- 3. Testing First Command Allowed ---');
    const firstCmd = await throttler.canExecute('user_test_1', '!color blue');
    assert(firstCmd.allowed === true && firstCmd.ttl === 10, 'First !color command allowed with 10s TTL');

    console.log('\n--- 4. Testing Spam Block on Same User (Same Command) ---');
    const spamCmd = await throttler.canExecute('user_test_1', '!color red');
    assert(spamCmd.allowed === false && spamCmd.reason === 'cooldown', 'Immediate spam !color command blocked');

    console.log('\n--- 5. Testing Shared Per-User Cooldown Across Different Commands ---');
    const comboSpam = await throttler.canExecute('user_test_1', '!dance 1');
    assert(comboSpam.allowed === false && comboSpam.reason === 'cooldown', 'Combo !dance blocked by shared per-user cooldown');

    const faceSpam = await throttler.canExecute('user_test_1', '!face wink');
    assert(faceSpam.allowed === false && faceSpam.reason === 'cooldown', 'Combo !face blocked by shared per-user cooldown');

    console.log('\n--- 6. Testing Independent User Isolation ---');
    const otherUserCmd = await throttler.canExecute('user_test_2', '!dance 2');
    assert(otherUserCmd.allowed === true && otherUserCmd.ttl === 10, 'Different user (user_test_2) allowed immediately');

    console.log('\n--- 7. Testing Dynamic Backpressure Multiplier ---');
    await throttler.resetUser('user_test_1');
    // Set backend high load metric (multiplier = 2.0 -> cooldown should be 20s)
    await redis.set(REDIS_KEYS.BACKEND_LOAD_METRICS, JSON.stringify({
      multiplier: 2.0,
      isCinematic: false,
      isFrozen: false,
      queueDepth: 25,
      activeAvatars: 50
    }), 'EX', 5);
    throttler.lastMetricsFetchTime = 0; // Invalidate cache

    const highLoadCmd = await throttler.canExecute('user_test_1', '!color green');
    assert(highLoadCmd.allowed === true && highLoadCmd.ttl === 20, 'Under high load (2.0x), cooldown scales to 20s');

    console.log('\n--- 8. Testing Freeze Timer (Showcase Active) ---');
    await throttler.resetUser('user_test_2');
    // Set backend freeze state
    await redis.set(REDIS_KEYS.BACKEND_LOAD_METRICS, JSON.stringify({
      multiplier: 1.0,
      isCinematic: true,
      isFrozen: true,
      queueDepth: 10,
      activeAvatars: 30
    }), 'EX', 5);
    throttler.lastMetricsFetchTime = 0; // Invalidate cache

    const frozenCmd = await throttler.canExecute('user_test_2', '!color red');
    assert(frozenCmd.allowed === false && frozenCmd.reason === 'frozen', 'Command blocked during Freeze State');

    console.log(`\n========================================`);
    console.log(`Test Results: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } finally {
    // Cleanup
    await redis.del(`${REDIS_KEYS.USER_COOLDOWN_PREFIX}user_test_1`);
    await redis.del(`${REDIS_KEYS.USER_COOLDOWN_PREFIX}user_test_2`);
    await redis.del(REDIS_KEYS.BACKEND_LOAD_METRICS);
    await redis.quit();
  }
}

runTests().catch((err) => {
  console.error('[Test Failed] Unhandled error:', err);
  process.exit(1);
});
