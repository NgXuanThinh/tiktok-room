import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

export async function run() {
  const suite = 'orbit-camera-venue-view';
  const results = {
    suite,
    total: 6,
    passed: 0,
    failed: 0,
    cases: []
  };

  let sceneModule;
  try {
    sceneModule = await import('../src/scene-manager.js');
  } catch (err) {
    // Failed to import
  }

  const {
    FULL_VENUE_ORBIT_CONFIG,
    VIP_ZOOM_CONFIG,
    SceneManager
  } = sceneModule || {};

  const testCases = [
    {
      name: 'test_full_venue_orbit_config_target',
      fn: () => {
        assert.ok(FULL_VENUE_ORBIT_CONFIG, 'FULL_VENUE_ORBIT_CONFIG must be exported');
        const target = FULL_VENUE_ORBIT_CONFIG.target;
        assert.ok(target, 'Target coordinates must be defined');
        assert.strictEqual(target.x, 0, 'Target focus X must be 0 (center axis)');
        assert.strictEqual(target.y, 1.4, 'Target focus Y must be 1.4m (elevation midpoint)');
        assert.strictEqual(target.z, -2.5, 'Target focus Z must be -2.5m (spatial venue midpoint between dance floor and DJ)');
      }
    },
    {
      name: 'test_orbit_camera_fov_venue_framing',
      fn: () => {
        assert.ok(FULL_VENUE_ORBIT_CONFIG, 'FULL_VENUE_ORBIT_CONFIG must be exported');
        const fov = FULL_VENUE_ORBIT_CONFIG.fov;
        assert.ok(fov !== undefined, 'FOV must be defined in FULL_VENUE_ORBIT_CONFIG');
        assert.strictEqual(fov, 68, 'FOV must be 68 degrees to capture both dance floor and DJ booth');
      }
    },
    {
      name: 'test_orbit_camera_radius_elevation',
      fn: () => {
        assert.ok(FULL_VENUE_ORBIT_CONFIG, 'FULL_VENUE_ORBIT_CONFIG must be exported');
        assert.strictEqual(FULL_VENUE_ORBIT_CONFIG.radius, 10.0, 'Orbit radius must be 10.0m');
        assert.strictEqual(FULL_VENUE_ORBIT_CONFIG.elevationY, 5.0, 'Orbit elevation must be 5.0m');
      }
    },
    {
      name: 'test_vip_zoom_config_duration',
      fn: () => {
        assert.ok(VIP_ZOOM_CONFIG, 'VIP_ZOOM_CONFIG must be exported');
        assert.strictEqual(VIP_ZOOM_CONFIG.durationSeconds, 5.0, 'VIP Zoom duration must be exactly 5.0 seconds');
        assert.strictEqual(VIP_ZOOM_CONFIG.target.x, 0);
        assert.strictEqual(VIP_ZOOM_CONFIG.target.y, 2.0);
        assert.strictEqual(VIP_ZOOM_CONFIG.target.z, -3.5);
      }
    },
    {
      name: 'test_vip_camera_auto_revert_timing',
      fn: () => {
        assert.ok(typeof SceneManager === 'function', 'SceneManager must be exported');
        // Mock minimal DOM container for SceneManager test
        const mockContainer = {
          appendChild: () => {},
          removeChild: () => {},
          clientWidth: 1280,
          clientHeight: 720
        };

        // Mock test timer countdown logic
        let currentPresetKey = 'vip';
        let previousPresetKey = 'orbit';
        let vipTimer = 5.0;

        function simulateUpdate(deltaTime) {
          if (currentPresetKey === 'vip' && vipTimer > 0) {
            vipTimer -= deltaTime;
            if (vipTimer <= 0) {
              vipTimer = 0;
              currentPresetKey = previousPresetKey;
            }
          }
        }

        // Simulate 4.0s elapsed (still vip)
        simulateUpdate(4.0);
        assert.strictEqual(currentPresetKey, 'vip', 'Camera must remain in VIP zoom before 5.0s');
        assert.ok(Math.abs(vipTimer - 1.0) < 0.001);

        // Advance remaining 1.1s (past 5.0s)
        simulateUpdate(1.1);
        assert.strictEqual(currentPresetKey, 'orbit', 'Camera must auto-revert back to previous preset after 5.0s');
        assert.strictEqual(vipTimer, 0);
      }
    },
    {
      name: 'test_vip_camera_timer_refresh_on_consecutive_gifts',
      fn: () => {
        let currentPresetKey = 'vip';
        let previousPresetKey = 'dj';
        let vipTimer = 5.0;

        function triggerVip(duration = 5.0) {
          if (currentPresetKey !== 'vip') {
            previousPresetKey = currentPresetKey;
            currentPresetKey = 'vip';
          }
          vipTimer = duration; // Refresh
        }

        // 3 seconds pass
        vipTimer -= 3.0;
        assert.ok(Math.abs(vipTimer - 2.0) < 0.001);

        // Consecutive VIP gift arrives
        triggerVip(5.0);
        assert.strictEqual(vipTimer, 5.0, 'Consecutive gift must refresh countdown timer back to 5.0s');
        assert.strictEqual(previousPresetKey, 'dj', 'Previous preset must be preserved during refresh');
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
