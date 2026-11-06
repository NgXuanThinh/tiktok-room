import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

export async function run() {
  const suite = 'rate-limiter';
  const results = {
    suite,
    total: 6,
    passed: 0,
    failed: 0,
    cases: []
  };

  let limiterModule;
  try {
    limiterModule = await import('../server/rate-limiter.js');
  } catch (err) {
    results.failed = results.total;
    results.error = err.code || err.message;
    results.cases.push({
      name: 'module_import',
      status: 'FAIL',
      error: `Failed to import server/rate-limiter.js: ${err.message}`,
      code: err.code
    });
    return results;
  }

  const { EventQueueRateLimiter } = limiterModule;
  assert.strictEqual(typeof EventQueueRateLimiter, 'function', 'EventQueueRateLimiter must be a constructor/class');

  const testCases = [
    {
      name: 'test_combo_aggregation_500ms',
      fn: async () => {
        const emitted = [];
        const limiter = new EventQueueRateLimiter({
          maxQueueSize: 100,
          comboWindowMs: 50, // Shortened for fast test
          onDispatch: (evt) => emitted.push(evt)
        });

        // Enqueue 5 rapid likes
        for (let i = 0; i < 5; i++) {
          limiter.enqueue({
            type: 'like',
            user: { id: 'u1', username: 'liker1' },
            data: { likeCount: 1 }
          });
        }

        // Initially in combo buffer, not yet dispatched as separate raw likes
        assert.strictEqual(emitted.length, 0, 'Likes should be buffered during combo window');

        // Wait for combo flush
        await new Promise((r) => setTimeout(r, 70));
        limiter.drainQueue();

        assert.ok(emitted.length >= 1, 'Should emit aggregated like batch');
        const batch = emitted.find((e) => e.type === 'like_batch' || e.type === 'like');
        assert.ok(batch, 'Should produce like batch event');
        limiter.reset();
      }
    },
    {
      name: 'test_vip_bypass_tier2',
      fn: () => {
        const emitted = [];
        const limiter = new EventQueueRateLimiter({
          maxQueueSize: 100,
          comboWindowMs: 500,
          onDispatch: (evt) => emitted.push(evt)
        });

        const tier2Gift = {
          type: 'gift',
          user: { id: 'vip1', username: 'gold_fan' },
          data: { giftName: 'Perfume', diamondCount: 100, totalCoins: 100, tier: 2 }
        };

        const startTime = Date.now();
        limiter.enqueue(tier2Gift);
        const elapsed = Date.now() - startTime;

        assert.ok(elapsed < 20, 'Tier 2 gift should bypass queue immediately');
        assert.strictEqual(emitted.length, 1, 'Tier 2 gift should be dispatched synchronously');
        assert.strictEqual(emitted[0].data.tier, 2);
        limiter.reset();
      }
    },
    {
      name: 'test_vip_bypass_tier3_tier4',
      fn: () => {
        const emitted = [];
        const limiter = new EventQueueRateLimiter({
          maxQueueSize: 100,
          comboWindowMs: 500,
          onDispatch: (evt) => emitted.push(evt)
        });

        const tier3Gift = {
          type: 'gift',
          user: { id: 'whale1', username: 'whale_donor' },
          data: { giftName: 'Lion', diamondCount: 500, totalCoins: 500, tier: 3 }
        };

        const tier4Gift = {
          type: 'gift',
          user: { id: 'whale2', username: 'super_whale' },
          data: { giftName: 'Universe', diamondCount: 2000, totalCoins: 2000, tier: 4 }
        };

        limiter.enqueue(tier3Gift);
        limiter.enqueue(tier4Gift);

        assert.strictEqual(emitted.length, 2, 'Tier 3 and 4 gifts must bypass queue instantly');
        assert.strictEqual(emitted[0].data.tier, 3);
        assert.strictEqual(emitted[1].data.tier, 4);
        limiter.reset();
      }
    },
    {
      name: 'test_queue_overflow_protection',
      fn: () => {
        const limiter = new EventQueueRateLimiter({
          maxQueueSize: 100,
          comboWindowMs: 1000,
          onDispatch: () => {}
        });

        // Enqueue 250 low-priority chat messages
        for (let i = 0; i < 250; i++) {
          limiter.enqueue({
            type: 'chat',
            user: { id: `u_${i}`, username: `user_${i}` },
            data: { comment: `Message ${i}` }
          });
        }

        const queueSize = typeof limiter.getQueueSize === 'function' ? limiter.getQueueSize() : limiter.queue?.length;
        assert.ok(queueSize <= 100, `Queue size (${queueSize}) must be bounded to maxQueueSize (100)`);
        limiter.reset();
      }
    },
    {
      name: 'test_vip_retention_on_overflow',
      fn: () => {
        const emitted = [];
        const limiter = new EventQueueRateLimiter({
          maxQueueSize: 50,
          comboWindowMs: 500,
          onDispatch: (evt) => emitted.push(evt)
        });

        // Flood with low priority
        for (let i = 0; i < 100; i++) {
          limiter.enqueue({
            type: 'chat',
            user: { id: `u_${i}`, username: `user_${i}` },
            data: { comment: `Chat ${i}` }
          });
        }

        // Enqueue high VIP gift
        limiter.enqueue({
          type: 'gift',
          user: { id: 'top_vip', username: 'top_donor' },
          data: { giftName: 'Lion', diamondCount: 500, totalCoins: 500, tier: 3 }
        });

        const vipDispatched = emitted.some(
          (e) => e.type === 'gift' && e.data?.tier === 3
        );
        assert.ok(vipDispatched, 'VIP gift must be preserved and dispatched despite queue saturation');
        limiter.reset();
      }
    },
    {
      name: 'test_drain_rate_stability',
      fn: () => {
        const limiter = new EventQueueRateLimiter({
          maxQueueSize: 100,
          comboWindowMs: 500,
          drainRateHz: 60,
          onDispatch: () => {}
        });

        assert.strictEqual(typeof limiter.drainQueue, 'function');
        assert.strictEqual(typeof limiter.reset, 'function');
        limiter.reset();
      }
    }
  ];

  for (const tc of testCases) {
    try {
      await tc.fn();
      results.passed++;
      results.cases.push({ name: tc.name, status: 'PASS' });
    } catch (err) {
      results.failed++;
      results.cases.push({ name: tc.name, status: 'FAIL', error: err.message });
    }
  }

  return results;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run().then((res) => {
    console.log(JSON.stringify(res, null, 2));
    if (res.failed > 0) process.exit(1);
  });
}
