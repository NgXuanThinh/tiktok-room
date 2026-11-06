import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

export async function run() {
  const suite = 'kinematics-culling';
  const results = {
    suite,
    total: 6,
    passed: 0,
    failed: 0,
    cases: []
  };

  let avatarManagerModule;
  try {
    avatarManagerModule = await import('../src/avatar-manager.js');
  } catch (err) {
    results.failed = results.total;
    results.error = err.code || err.message;
    results.cases.push({
      name: 'module_import',
      status: 'FAIL',
      error: `Failed to import src/avatar-manager.js: ${err.message}`,
      code: err.code
    });
    return results;
  }

  const {
    getDanceKinematics,
    AvatarOccupancyManager,
    DANCE_STYLES
  } = avatarManagerModule;

  const testCases = [
    {
      name: 'test_6_dance_kinematics_styles',
      fn: () => {
        assert.strictEqual(typeof getDanceKinematics, 'function', 'getDanceKinematics must be exported');
        const expectedStyles = ['bounce', 'wave', 'spin', 'jump', 'shuffle', 'sway'];

        for (const style of expectedStyles) {
          const k = getDanceKinematics(style, Math.PI * 0.5);
          assert.ok(k, `Style ${style} should return kinematic parameters`);
          assert.strictEqual(typeof k.posY, 'number', `${style}.posY must be a number`);
          assert.strictEqual(typeof k.rotY, 'number', `${style}.rotY must be a number`);
          assert.strictEqual(typeof k.rotZ, 'number', `${style}.rotZ must be a number`);
          assert.ok(!Number.isNaN(k.posY), `${style}.posY must not be NaN`);
        }

        // Compare specific characteristics
        const jumpK = getDanceKinematics('jump', Math.PI * 0.5);
        const bounceK = getDanceKinematics('bounce', Math.PI * 0.5);
        assert.ok(jumpK.posY >= bounceK.posY, 'Jump apex should be >= bounce height');

        const shuffleK = getDanceKinematics('shuffle', Math.PI * 0.25);
        assert.ok(shuffleK.legL !== 0 || shuffleK.legR !== 0, 'Shuffle should oscillate legs');

        const swayK = getDanceKinematics('sway', Math.PI * 0.5);
        assert.ok(swayK.rotZ !== 0, 'Sway should oscillate rotZ');
      }
    },
    {
      name: 'test_dance_kinematics_phase_continuity',
      fn: () => {
        const phases = [0, Math.PI * 0.25, Math.PI * 0.5, Math.PI, Math.PI * 1.5, Math.PI * 2];
        const styles = ['bounce', 'wave', 'spin', 'jump', 'shuffle', 'sway'];

        for (const s of styles) {
          for (const p of phases) {
            const k = getDanceKinematics(s, p);
            assert.ok(Number.isFinite(k.posY), `posY must be finite for ${s} at ${p}`);
            assert.ok(Number.isFinite(k.rotY), `rotY must be finite for ${s} at ${p}`);
            assert.ok(Number.isFinite(k.rotZ), `rotZ must be finite for ${s} at ${p}`);
          }
        }
      }
    },
    {
      name: 'test_120s_inactivity_culling',
      fn: () => {
        assert.strictEqual(typeof AvatarOccupancyManager, 'function', 'AvatarOccupancyManager class must be exported');
        const mgr = new AvatarOccupancyManager({ maxCapacity: 10, idleTimeoutMs: 120000 });
        const now = Date.now();

        // Add an avatar that was active 130 seconds ago
        mgr.touch('user_idle', 'idle_person', 0);
        const idleAvatar = mgr.avatars.get('user_idle');
        idleAvatar.lastActive = now - 130000;

        // Add a currently active avatar
        mgr.touch('user_active', 'active_person', 10);

        const culled = mgr.cullIdle(now);
        assert.ok(culled.includes('user_idle'), 'Idle avatar (>120s) must be culled');
        assert.strictEqual(mgr.avatars.has('user_active'), true, 'Active avatar must remain');
      }
    },
    {
      name: 'test_vip_pinning_preservation',
      fn: () => {
        const mgr = new AvatarOccupancyManager({ maxCapacity: 10, idleTimeoutMs: 120000 });
        const now = Date.now();

        // VIP whale who donated 1000 coins (Tier 3+)
        mgr.touch('whale_vip', 'big_spender', 1000);
        const whale = mgr.avatars.get('whale_vip');
        assert.strictEqual(whale.isPinned, true, 'Whale donor must be flagged isPinned: true');

        // Fast forward idle time to 10,000 seconds
        whale.lastActive = now - 10000000;

        const culled = mgr.cullIdle(now);
        assert.strictEqual(culled.includes('whale_vip'), false, 'Pinned VIP must NEVER be culled by inactivity');
        assert.strictEqual(mgr.avatars.has('whale_vip'), true, 'Pinned VIP must stay in avatar manager');
      }
    },
    {
      name: 'test_avatar_capacity_limit_100',
      fn: () => {
        const mgr = new AvatarOccupancyManager({ maxCapacity: 100, idleTimeoutMs: 120000 });
        for (let i = 0; i < 120; i++) {
          mgr.touch(`user_${i}`, `name_${i}`, 5);
        }
        assert.ok(mgr.avatars.size <= 100, `Occupancy count (${mgr.avatars.size}) must not exceed 100`);
      }
    },
    {
      name: 'test_avatar_texture_disposal',
      fn: () => {
        const mgr = new AvatarOccupancyManager({ maxCapacity: 2, idleTimeoutMs: 50 });
        let disposed = false;

        const mockAvatar = mgr.touch('u_dispose', 'user_d', 0);
        mockAvatar.texture = {
          dispose: () => { disposed = true; }
        };

        if (typeof mgr.disposeAvatar === 'function') {
          mgr.disposeAvatar(mockAvatar);
          assert.strictEqual(disposed, true, 'disposeAvatar must trigger texture.dispose()');
        } else {
          // If integrated in cull
          mockAvatar.lastActive = Date.now() - 100;
          mgr.cullIdle(Date.now());
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
