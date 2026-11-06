import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

export async function run() {
  const suite = 'camera-zoom-spotlights-floor';
  const results = {
    suite,
    total: 6,
    passed: 0,
    failed: 0,
    cases: []
  };

  let sceneModule, clubModule, avatarModule, mainModule;
  try {
    sceneModule = await import('../src/scene-manager.js');
    clubModule = await import('../src/club-environment.js');
    avatarModule = await import('../src/avatar-manager.js');
    mainModule = await import('../src/main.js');
  } catch (err) {
    // Modules imported as needed
  }

  const { SceneManager, FULL_VENUE_ORBIT_CONFIG } = sceneModule || {};
  const { ClubEnvironment, FLOOR_GRID_CONFIG, clampSpotlightToFloor } = clubModule || {};
  const { createBillboardSprite } = avatarModule || {};
  const { generateDanceFloorSlots } = mainModule || {};

  const testCases = [
    {
      name: 'test_camera_distance_slider_bounds',
      fn: () => {
        assert.ok(typeof SceneManager === 'function', 'SceneManager must be exported');
        const mockContainer = { clientWidth: 1280, clientHeight: 720 };
        const sm = new SceneManager(mockContainer);

        assert.strictEqual(typeof sm.setOrbitRadius, 'function', 'setOrbitRadius method must exist');

        // Test normal range
        sm.setOrbitRadius(15.0);
        assert.strictEqual(sm.orbitRadius, 15.0, 'Radius should update to 15.0m');

        // Test lower clamp (min 6.0m)
        sm.setOrbitRadius(2.0);
        assert.strictEqual(sm.orbitRadius, 6.0, 'Radius should clamp to min 6.0m');

        // Test upper clamp (max 25.0m)
        sm.setOrbitRadius(50.0);
        assert.strictEqual(sm.orbitRadius, 25.0, 'Radius should clamp to max 25.0m');
      }
    },
    {
      name: 'test_expanded_floor_grid_config',
      fn: () => {
        assert.ok(FLOOR_GRID_CONFIG, 'FLOOR_GRID_CONFIG must be exported');
        assert.ok(FLOOR_GRID_CONFIG.rows >= 12, 'Floor rows must be at least 12');
        assert.ok(FLOOR_GRID_CONFIG.cols >= 12, 'Floor cols must be at least 12');
        assert.ok(FLOOR_GRID_CONFIG.count >= 144, 'Total floor tiles must be at least 144 (expanded from 64)');
        assert.ok(FLOOR_GRID_CONFIG.tileSpacing > 0, 'Tile spacing must be defined and positive');
      }
    },
    {
      name: 'test_center_outward_slot_ordering',
      fn: () => {
        assert.ok(typeof generateDanceFloorSlots === 'function', 'generateDanceFloorSlots must be exported');
        const slots = generateDanceFloorSlots(FLOOR_GRID_CONFIG);
        assert.ok(Array.isArray(slots), 'Slots must be an array');
        assert.ok(slots.length > 50, 'Slots must cover the floor grid');

        // Slot 0 must be closest to the center of the dance floor (0, 0, 0)
        const centerZ = 0;
        let prevDist = 0;
        for (let i = 0; i < Math.min(slots.length, 30); i++) {
          const s = slots[i];
          const dist = Math.hypot(s.x, s.z - centerZ);
          assert.ok(
            dist >= prevDist - 0.001,
            `Slot ${i} distance (${dist.toFixed(2)}) must be >= previous slot distance (${prevDist.toFixed(2)}) for center-outward order`
          );
          prevDist = dist;
        }
      }
    },
    {
      name: 'test_avatar_billboard_level_badge_no_viewer',
      fn: () => {
        assert.ok(typeof createBillboardSprite === 'function', 'createBillboardSprite must be exported');

        // Test with level provided
        const userWithLevel = { username: 'GamerVIP', level: 'TOP 1', totalCoins: 500 };
        const spriteWithLevel = createBillboardSprite(userWithLevel);
        assert.ok(spriteWithLevel, 'Sprite must be created');

        // Inspect drawn canvas contents or metadata
        if (spriteWithLevel.userData?.badgeText) {
          assert.ok(!spriteWithLevel.userData.badgeText.includes('Viewer'), 'Badge text must NOT contain "Viewer"');
          assert.ok(spriteWithLevel.userData.badgeText.includes('TOP 1'), 'Badge text must show level "TOP 1"');
        }

        // Test default without level or coins: must show "Lv.1", NEVER "Viewer"
        const defaultUser = { username: 'NewGuy' };
        const defaultSprite = createBillboardSprite(defaultUser);
        if (defaultSprite.userData?.badgeText) {
          assert.ok(!defaultSprite.userData.badgeText.includes('Viewer'), 'Default badge text must NEVER contain "Viewer"');
          assert.strictEqual(defaultSprite.userData.badgeText, 'Lv.1', 'Default badge text must be "Lv.1"');
        }
      }
    },
    {
      name: 'test_moving_heads_floor_clamping',
      fn: () => {
        assert.ok(typeof clampSpotlightToFloor === 'function', 'clampSpotlightToFloor must be exported');

        // An out-of-bounds target (e.g. wall at X=20, Z=-25) must be clamped inside floor bounds
        const rawTarget = { x: 20, y: 0, z: -25 };
        const clamped = clampSpotlightToFloor(rawTarget);

        assert.ok(clamped.x <= 9.0 && clamped.x >= -9.0, `Clamped X (${clamped.x}) must remain within floor bounds [-9.0, 9.0]`);
        assert.ok(clamped.z <= 9.5 && clamped.z >= -7.5, `Clamped Z (${clamped.z}) must remain within floor bounds [-7.5, 9.5]`);
        assert.strictEqual(clamped.y, 0, 'Spotlight target must hit floor level Y=0');
      }
    },
    {
      name: 'test_tiered_donate_spotlight_focus',
      fn: () => {
        assert.ok(typeof ClubEnvironment === 'function', 'ClubEnvironment must be exported');
        const env = new ClubEnvironment();
        assert.strictEqual(typeof env.focusSpotlights, 'function', 'focusSpotlights method must exist on ClubEnvironment');

        // Tier 1: 1 spotlight focused
        env.focusSpotlights(1, { x: 2, y: 0, z: 1 }, 3.0);
        let focusedCount = env.movingHeads.filter(h => h.isFocused).length;
        assert.strictEqual(focusedCount, 1, 'Tier 1 must focus exactly 1 spotlight');

        // Tier 2: 2 spotlights focused
        env.focusSpotlights(2, { x: -2, y: 0, z: 2 }, 4.0);
        focusedCount = env.movingHeads.filter(h => h.isFocused).length;
        assert.strictEqual(focusedCount, 2, 'Tier 2 must focus exactly 2 spotlights');

        // Tier 3/4 (Whale/Lion): All 4 spotlights focused on VIP podium
        env.focusSpotlights(3, { x: 0, y: 0.8, z: -3.5 }, 15.0);
        focusedCount = env.movingHeads.filter(h => h.isFocused).length;
        assert.strictEqual(focusedCount, 4, 'Tier 3+ (Lion/Whale) must focus all 4 spotlights');
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
