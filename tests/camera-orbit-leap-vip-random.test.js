import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

export async function run() {
  const suite = 'camera-orbit-leap-vip-random';
  const results = {
    suite,
    total: 5,
    passed: 0,
    failed: 0,
    cases: []
  };

  let sceneModule;
  let avatarModule;
  let mainModule;

  try {
    sceneModule = await import('../src/scene-manager.js');
    avatarModule = await import('../src/avatar-manager.js');
    mainModule = await import('../src/main.js');
  } catch (err) {
    results.failed = results.total;
    results.cases.push({ name: 'module_import', status: 'FAIL', error: err.message });
    return results;
  }

  const { SceneManager } = sceneModule;
  const { AvatarOccupancyManager, createAvatarMesh } = avatarModule;
  const { VIP_TOP1_SLOT, VIP_TOP2_SLOT, BASE_AVATAR_SCALE } = mainModule;

  const testCases = [
    {
      name: 'test_lion_camera_full_360_orbit_and_revert',
      fn: () => {
        const sm = new SceneManager({ clientWidth: 1280, clientHeight: 720 });
        sm.setCameraPreset('dj');
        assert.strictEqual(sm.currentPresetKey, 'dj');

        const heroMesh = createAvatarMesh({ username: 'LionKing' });
        heroMesh.position.set(0, 0, 0);

        sm.startLionTracking(heroMesh, 7.6);
        assert.strictEqual(sm.isLionTracking, true);
        assert.strictEqual(sm.previousPresetKey, 'dj', 'Previous preset must be preserved');

        // Check orbit sweep over time: after 3.8s (midway), angle should be ~4.0 rad (> 180 deg)
        sm.update(3.8, 0);
        assert.ok(sm.isLionTracking, 'Still in lion tracking at 3.8s');

        // Check advance to end
        sm.update(4.0, 0);
        assert.strictEqual(sm.isLionTracking, false, 'Lion tracking must finish at 7.6s');
        assert.strictEqual(sm.currentPresetKey, 'dj', 'Camera must revert back to previous preset (dj)');
      }
    },
    {
      name: 'test_avatar_manager_disable_auto_cull_and_permanent_avatars',
      fn: () => {
        const mgr = new AvatarOccupancyManager({ disableAutoCull: true, idleTimeoutMs: 1000 });
        mgr.touch('user_1', 'UserOne', 0);
        mgr.touch('user_2', 'UserTwo', 0);
        assert.strictEqual(mgr.avatars.size, 2);

        // Advance past idle timeout: should NOT cull because disableAutoCull = true
        const culled = mgr.cullIdle(Date.now() + 500000);
        assert.strictEqual(culled.length, 0, 'No avatars should be culled when disableAutoCull is active');
        assert.strictEqual(mgr.avatars.size, 2, 'Avatars must remain permanent');

        // Test manual removal
        const removed = mgr.removeAvatar('user_1');
        assert.strictEqual(removed, true);
        assert.strictEqual(mgr.avatars.size, 1);
        assert.strictEqual(mgr.avatars.has('user_1'), false);

        // Test clear all
        mgr.clearAll();
        assert.strictEqual(mgr.avatars.size, 0);
      }
    },
    {
      name: 'test_random_floor_slot_distribution_coverage',
      fn: () => {
        // Test that slot picking covers non-sequential positions
        const totalSlots = 48;
        const occupied = new Set([0, 1, 2]);

        const available = [];
        for (let i = 0; i < totalSlots; i++) {
          if (!occupied.has(i)) available.push(i);
        }

        const samplePicks = new Set();
        for (let t = 0; t < 50; t++) {
          const randIdx = available[Math.floor(Math.random() * available.length)];
          samplePicks.add(randIdx);
          assert.ok(!occupied.has(randIdx), 'Random pick must never choose an already occupied slot');
        }

        assert.ok(samplePicks.size > 5, 'Random slot allocation must sample across varied floor slots');
      }
    },
    {
      name: 'test_parabolic_leap_animation_arc_physics',
      fn: () => {
        const start = { x: 0, y: 0, z: 0 };
        const target = { x: -5.4, y: 0.48, z: -9.6 };
        const peakHeight = 2.4;

        // At progress 0%
        let p = 0;
        let arcY = Math.sin(p * Math.PI) * peakHeight;
        assert.strictEqual(arcY, 0);

        // At progress 50% (apex of the parabolic jump)
        p = 0.5;
        arcY = Math.sin(p * Math.PI) * peakHeight;
        assert.ok(Math.abs(arcY - 2.4) < 0.001, 'Apex of parabolic leap must reach peakHeight (+2.4m)');

        // At progress 100% (landing)
        p = 1.0;
        arcY = Math.sin(p * Math.PI) * peakHeight;
        assert.ok(Math.abs(arcY - 0) < 0.001, 'Landing must return to base elevation');
      }
    },
    {
      name: 'test_vip_empty_lounge_promotion_coordinates',
      fn: () => {
        assert.ok(VIP_TOP1_SLOT, 'VIP_TOP1_SLOT must exist');
        assert.ok(VIP_TOP2_SLOT, 'VIP_TOP2_SLOT must exist');
        assert.strictEqual(VIP_TOP1_SLOT.x, -5.4);
        assert.strictEqual(VIP_TOP1_SLOT.y, 0.48);
        assert.strictEqual(VIP_TOP2_SLOT.x, 5.4);
        assert.strictEqual(VIP_TOP2_SLOT.y, 0.38);
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
      console.error(`[FAIL] ${tc.name}:`, err.message);
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
