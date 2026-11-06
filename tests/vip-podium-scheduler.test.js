import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

export async function run() {
  const suite = 'vip-podium-scheduler';
  const results = {
    suite,
    total: 6,
    passed: 0,
    failed: 0,
    cases: []
  };

  let mainModule;
  try {
    mainModule = await import('../src/main.js');
  } catch (err) {
    // Failed to import
  }

  const { VipPodiumScheduler } = mainModule || {};

  function createMockMesh(initialPos = { x: 0, y: 0, z: 0 }) {
    return {
      position: { ...initialPos, copy: function (p) { this.x = p.x; this.y = p.y; this.z = p.z; } },
      userData: { isOnPodium: false, levitateY: 0 }
    };
  }

  const testCases = [
    {
      name: 'test_vip_scheduler_single_occupancy',
      fn: () => {
        assert.strictEqual(typeof VipPodiumScheduler, 'function', 'VipPodiumScheduler must be a class/constructor');
        const scheduler = new VipPodiumScheduler({ duration: 15.0 });

        const user1 = { id: 'whale_1', username: 'Whale1' };
        const mesh1 = createMockMesh({ x: 2, y: 0, z: 1 });
        const slot1 = { x: 2, y: 0, z: 1, clone: () => ({ x: 2, y: 0, z: 1 }) };

        scheduler.enqueue(user1, mesh1, 3, slot1);

        assert.ok(scheduler.activeWhale, 'Active whale must be present on podium');
        assert.strictEqual(scheduler.activeWhale.user.id, 'whale_1');
        assert.strictEqual(scheduler.queue.length, 0, 'Queue must be empty when only 1 whale enqueued');
        assert.strictEqual(mesh1.userData.isOnPodium, true, 'Whale 1 must be marked isOnPodium = true');
        assert.strictEqual(mesh1.position.z, -3.5, 'Whale 1 must be positioned at podium Z (-3.5m)');
      }
    },
    {
      name: 'test_vip_scheduler_fifo_queuing',
      fn: () => {
        assert.strictEqual(typeof VipPodiumScheduler, 'function', 'VipPodiumScheduler must be a class/constructor');
        const scheduler = new VipPodiumScheduler({ duration: 15.0 });

        const u1 = { id: 'w1' }, m1 = createMockMesh(), s1 = { x: 1, y: 0, z: 1, clone: () => ({ x: 1, y: 0, z: 1 }) };
        const u2 = { id: 'w2' }, m2 = createMockMesh(), s2 = { x: 2, y: 0, z: 2, clone: () => ({ x: 2, y: 0, z: 2 }) };
        const u3 = { id: 'w3' }, m3 = createMockMesh(), s3 = { x: 3, y: 0, z: 3, clone: () => ({ x: 3, y: 0, z: 3 }) };

        scheduler.enqueue(u1, m1, 3, s1);
        scheduler.enqueue(u2, m2, 3, s2);
        scheduler.enqueue(u3, m3, 3, s3);

        // Whale 1 on podium, Whale 2 and 3 waiting
        assert.strictEqual(scheduler.activeWhale.user.id, 'w1', 'Whale 1 must have exclusive active occupancy');
        assert.strictEqual(scheduler.queue.length, 2, 'Queue must contain exactly 2 subsequent whales');
        assert.strictEqual(scheduler.queue[0].user.id, 'w2', 'Queue order must be FIFO (w2 next)');
        assert.strictEqual(scheduler.queue[1].user.id, 'w3', 'Queue order must be FIFO (w3 third)');
        assert.strictEqual(m2.userData.isOnPodium, false, 'Queued Whale 2 must NOT be marked isOnPodium');
        assert.strictEqual(m3.userData.isOnPodium, false, 'Queued Whale 3 must NOT be marked isOnPodium');
      }
    },
    {
      name: 'test_vip_scheduler_tenure_countdown',
      fn: () => {
        assert.strictEqual(typeof VipPodiumScheduler, 'function', 'VipPodiumScheduler must be a class/constructor');
        const scheduler = new VipPodiumScheduler({ duration: 15.0 });

        const u1 = { id: 'w1' }, m1 = createMockMesh(), s1 = { x: 1, y: 0, z: 1, clone: () => ({ x: 1, y: 0, z: 1 }) };
        scheduler.enqueue(u1, m1, 3, s1);

        // Advance 7.0 seconds
        scheduler.update(7.0);
        assert.ok(scheduler.activeWhale, 'Active whale must still occupy podium after 7s');
        assert.ok(Math.abs(scheduler.activeWhale.remainingTime - 8.0) < 0.001, 'Remaining time must be 8.0s');
      }
    },
    {
      name: 'test_vip_scheduler_automatic_promotion',
      fn: () => {
        assert.strictEqual(typeof VipPodiumScheduler, 'function', 'VipPodiumScheduler must be a class/constructor');
        const scheduler = new VipPodiumScheduler({ duration: 15.0 });

        const u1 = { id: 'w1' }, m1 = createMockMesh({ x: 1, y: 0, z: 1 }), s1 = { x: 1, y: 0, z: 1, clone: () => ({ x: 1, y: 0, z: 1 }) };
        const u2 = { id: 'w2' }, m2 = createMockMesh({ x: 2, y: 0, z: 2 }), s2 = { x: 2, y: 0, z: 2, clone: () => ({ x: 2, y: 0, z: 2 }) };

        scheduler.enqueue(u1, m1, 3, s1);
        scheduler.enqueue(u2, m2, 3, s2);

        let promotedWhale = null;
        let vacatedWhale = null;

        // Advance past 15.0 seconds (e.g. 15.5s)
        scheduler.update(15.5, (promoted) => { promotedWhale = promoted; }, (vacated) => { vacatedWhale = vacated; });

        // Whale 1 must be demoted back to return slot
        assert.strictEqual(m1.userData.isOnPodium, false, 'Whale 1 must be removed from podium');
        assert.strictEqual(m1.position.x, 1, 'Whale 1 must return to dance floor slot X');
        assert.strictEqual(m1.position.z, 1, 'Whale 1 must return to dance floor slot Z');

        // Whale 2 must be promoted to podium
        assert.ok(scheduler.activeWhale, 'Whale 2 must now be active on podium');
        assert.strictEqual(scheduler.activeWhale.user.id, 'w2');
        assert.strictEqual(m2.userData.isOnPodium, true, 'Whale 2 must be marked isOnPodium');
        assert.strictEqual(m2.position.z, -3.5, 'Whale 2 must be moved to podium Z');
        assert.strictEqual(scheduler.queue.length, 0, 'Queue should now be empty');
      }
    },
    {
      name: 'test_vip_scheduler_same_whale_tenure_extension',
      fn: () => {
        assert.strictEqual(typeof VipPodiumScheduler, 'function', 'VipPodiumScheduler must be a class/constructor');
        const scheduler = new VipPodiumScheduler({ duration: 15.0 });

        const u1 = { id: 'w1' }, m1 = createMockMesh(), s1 = { x: 1, y: 0, z: 1, clone: () => ({ x: 1, y: 0, z: 1 }) };
        scheduler.enqueue(u1, m1, 3, s1);

        // 5 seconds pass
        scheduler.update(5.0);
        assert.ok(Math.abs(scheduler.activeWhale.remainingTime - 10.0) < 0.001);

        // Same whale sends another Tier 3 gift
        scheduler.enqueue(u1, m1, 3, s1);

        // Tenure extended by 15.0s -> 10.0 + 15.0 = 25.0s
        assert.ok(Math.abs(scheduler.activeWhale.remainingTime - 25.0) < 0.001, 'Tenure must be extended by +15.0s');
        assert.strictEqual(scheduler.queue.length, 0, 'Same whale must not create duplicate queue entries');
      }
    },
    {
      name: 'test_king_slime_levitation_elevation',
      fn: () => {
        assert.strictEqual(typeof VipPodiumScheduler, 'function', 'VipPodiumScheduler must be a class/constructor');
        const scheduler = new VipPodiumScheduler({ duration: 15.0 });

        const kingUser = { id: 'king_1' };
        const kingMesh = createMockMesh();
        const slot = { x: 0, y: 0, z: 0, clone: () => ({ x: 0, y: 0, z: 0 }) };

        // Enqueue with tier: 4 (King Slime)
        scheduler.enqueue(kingUser, kingMesh, 4, slot);

        assert.strictEqual(kingMesh.userData.levitateY, 3.2, 'King Slime must have levitateY = 3.2m');
        assert.strictEqual(kingMesh.position.y, 3.2, 'King Slime position.y must be elevated above DJ booth at 3.2m');
      }
    }
  ];

  for (const tc of testCases) {
    try {
      tc.fn();
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
