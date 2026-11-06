import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

export async function run() {
  const suite = 'custom-mock-person';
  const results = {
    suite,
    total: 6,
    passed: 0,
    failed: 0,
    cases: []
  };

  let mockModule;
  try {
    mockModule = await import('../server/mock-simulator.js');
  } catch (err) {
    // Failed to import
  }

  const {
    MOCK_LEVELS,
    createCustomMockUser,
    MockSimulator
  } = mockModule || {};

  const testCases = [
    {
      name: 'test_mock_levels_constants',
      fn: () => {
        assert.ok(MOCK_LEVELS, 'MOCK_LEVELS must be exported');
        assert.ok(Array.isArray(MOCK_LEVELS), 'MOCK_LEVELS must be an array');
        assert.strictEqual(MOCK_LEVELS.length, 6, 'MOCK_LEVELS must contain 6 tiers');
        const expected = ['Lv.1', 'Lv.10', 'Lv.25', 'Lv.50', 'VIP', 'TOP 1'];
        assert.deepStrictEqual(MOCK_LEVELS, expected, 'Levels must match exact options');
      }
    },
    {
      name: 'test_create_custom_mock_user_schema',
      fn: () => {
        assert.strictEqual(
          typeof createCustomMockUser,
          'function',
          'createCustomMockUser must be exported'
        );

        const user = createCustomMockUser({
          username: 'DaiGiaBinhDuong',
          level: 'TOP 1',
          slimeColor: 'yellow'
        });

        assert.ok(user, 'User object must be returned');
        assert.strictEqual(user.username, 'DaiGiaBinhDuong');
        assert.strictEqual(user.nickname, 'DaiGiaBinhDuong');
        assert.strictEqual(user.level, 'TOP 1');
        assert.strictEqual(user.slimeColor, 'yellow');
        assert.ok(user.id.startsWith('custom_'), 'Custom user ID should have custom_ prefix');
      }
    },
    {
      name: 'test_custom_mock_gift_simulation_payload',
      fn: () => {
        assert.strictEqual(typeof MockSimulator, 'function', 'MockSimulator must be exported');
        const dispatched = [];
        const sim = new MockSimulator({
          onEvent: (evt) => dispatched.push(evt)
        });

        const customUser = {
          id: 'custom_daigia',
          username: 'DaiGiaBinhDuong',
          nickname: 'DaiGiaBinhDuong',
          level: 'TOP 1',
          slimeColor: 'yellow'
        };

        sim.simulateGift(3, 'Lion', 500, customUser);

        assert.strictEqual(dispatched.length, 1, 'Event must be emitted');
        const evt = dispatched[0];
        assert.strictEqual(evt.type, 'gift');
        assert.strictEqual(evt.user.username, 'DaiGiaBinhDuong');
        assert.strictEqual(evt.user.level, 'TOP 1');
        assert.strictEqual(evt.user.slimeColor, 'yellow');
        assert.strictEqual(evt.data.giftName, 'Lion');
        assert.strictEqual(evt.data.totalCoins, 500);
        assert.strictEqual(evt.data.tier, 3);
      }
    },
    {
      name: 'test_custom_mock_chat_simulation_payload',
      fn: () => {
        assert.strictEqual(typeof MockSimulator, 'function', 'MockSimulator must be exported');
        const dispatched = [];
        const sim = new MockSimulator({
          onEvent: (evt) => dispatched.push(evt)
        });

        const customUser = {
          id: 'custom_fan',
          username: 'FanCung',
          nickname: 'FanCung',
          level: 'Lv.50',
          slimeColor: 'red'
        };

        sim.simulateChat('Hello ca phong nhay!', customUser);

        assert.strictEqual(dispatched.length, 1);
        const evt = dispatched[0];
        assert.strictEqual(evt.type, 'chat');
        assert.strictEqual(evt.user.username, 'FanCung');
        assert.strictEqual(evt.user.level, 'Lv.50');
        assert.strictEqual(evt.data.comment, 'Hello ca phong nhay!');
      }
    },
    {
      name: 'test_custom_mock_likes_simulation_payload',
      fn: () => {
        assert.strictEqual(typeof MockSimulator, 'function', 'MockSimulator must be exported');
        const dispatched = [];
        const sim = new MockSimulator({
          onEvent: (evt) => dispatched.push(evt)
        });

        const customUser = {
          id: 'custom_liker',
          username: 'LikerPro',
          nickname: 'LikerPro',
          level: 'Lv.10',
          slimeColor: 'blue'
        };

        sim.simulateLikes(10, customUser);

        assert.strictEqual(dispatched.length, 1);
        const evt = dispatched[0];
        assert.strictEqual(evt.type, 'like');
        assert.strictEqual(evt.user.username, 'LikerPro');
        assert.strictEqual(evt.data.likeCount, 10);
      }
    },
    {
      name: 'test_custom_mock_spawn_action_handling',
      fn: () => {
        assert.strictEqual(typeof MockSimulator, 'function', 'MockSimulator must be exported');
        const dispatched = [];
        const sim = new MockSimulator({
          onEvent: (evt) => dispatched.push(evt)
        });

        const customUser = {
          id: 'custom_newbie',
          username: 'NewDancer',
          nickname: 'NewDancer',
          level: 'Lv.1',
          slimeColor: 'green'
        };

        if (typeof sim.simulateSpawn === 'function') {
          sim.simulateSpawn(customUser);
          assert.strictEqual(dispatched.length, 1);
          assert.strictEqual(dispatched[0].user.slimeColor, 'green');
        } else {
          // Alternatively emit via chat spawn command
          sim.simulateChat('!color green', customUser);
          assert.strictEqual(dispatched.length, 1);
        }
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
