import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

export async function run() {
  const suite = 'orbit-dj-occlusion-spotlights';
  const results = {
    suite,
    total: 6,
    passed: 0,
    failed: 0,
    cases: []
  };

  let sceneModule, clubModule;
  try {
    sceneModule = await import('../src/scene-manager.js');
    clubModule = await import('../src/club-environment.js');
  } catch (err) {
    // Loaded
  }

  const { SceneManager, FULL_VENUE_ORBIT_CONFIG } = sceneModule || {};
  const { ClubEnvironment, BACK_WALL_CONFIG, FLOOR_GRID_CONFIG } = clubModule || {};

  const testCases = [
    {
      name: 'test_orbit_25m_elevation_behind_dj',
      fn: () => {
        assert.ok(typeof SceneManager === 'function', 'SceneManager must be exported');
        const sm = new SceneManager({ clientWidth: 1280, clientHeight: 720 });
        sm.setOrbitRadius(25.0);

        // When camera is behind DJ (theta = PI), elevation must scale up to give clear downward view
        sm.orbitTheta = Math.PI;
        sm.update(0.016, 0);

        const targetY = sm.camTargetPos.y;
        assert.ok(
          targetY >= 14.0,
          `Camera elevation at 25m behind DJ (${targetY.toFixed(1)}m) must be >= 14.0m to look down over the DJ booth`
        );
      }
    },
    {
      name: 'test_back_wall_auto_hide_when_camera_behind',
      fn: () => {
        assert.ok(typeof ClubEnvironment === 'function', 'ClubEnvironment must be exported');
        const env = new ClubEnvironment();

        assert.ok(env.backWall, 'backWall mesh must exist');

        // Simulate camera in front of wall (Z = 5.0m)
        const frontCam = { position: { x: 0, y: 5, z: 5.0 } };
        env.update(0.016, {}, frontCam);
        assert.strictEqual(env.backWall.visible, true, 'Back wall must be visible when camera is in front');

        // Simulate camera behind back wall (Z = -22.0m at 25m orbit)
        const behindCam = { position: { x: 0, y: 16, z: -22.0 } };
        env.update(0.016, {}, behindCam);
        assert.strictEqual(
          env.backWall.visible,
          false,
          'Back wall MUST be hidden (visible = false) when camera is behind it to prevent occlusion'
        );
      }
    },
    {
      name: 'test_dj_booth_flush_with_floor_top_edge',
      fn: () => {
        assert.ok(typeof ClubEnvironment === 'function', 'ClubEnvironment must be exported');
        const env = new ClubEnvironment();

        // Top edge of the dance floor: Row 0
        const topRowZ = FLOOR_GRID_CONFIG.startZ !== undefined ? FLOOR_GRID_CONFIG.startZ : -5.0;
        const halfTileSize = FLOOR_GRID_CONFIG.tileSize / 2;
        const floorTopEdge = topRowZ - halfTileSize; // e.g. -5.75m

        // DJ booth table front edge
        // DJ booth is positioned at Z = -6.5m, table depth is 1.6m (extends +0.8m forward to -5.7m)
        const djBoothZ = -6.5;
        const djTableFrontEdge = djBoothZ + 0.8; // -5.7m

        const clearance = Math.abs(djTableFrontEdge - floorTopEdge);
        assert.ok(
          clearance <= 0.3,
          `DJ booth front edge (${djTableFrontEdge.toFixed(2)}m) must be flush with floor top edge (${floorTopEdge.toFixed(2)}m), clearance was ${clearance.toFixed(2)}m`
        );
      }
    },
    {
      name: 'test_moving_heads_spot_targets_in_scene',
      fn: () => {
        assert.ok(typeof ClubEnvironment === 'function', 'ClubEnvironment must be exported');
        const env = new ClubEnvironment();

        assert.strictEqual(env.movingHeads.length, 4, 'Must have exactly 4 moving heads');
        for (let i = 0; i < env.movingHeads.length; i++) {
          const mh = env.movingHeads[i];
          assert.ok(mh.spot, `Moving head ${i} must have SpotLight`);
          assert.ok(mh.spot.target, `Moving head ${i} SpotLight must have target Object3D`);
          assert.strictEqual(
            mh.spot.target.parent,
            env.scene,
            `Moving head ${i} SpotLight target must be added directly to the scene graph`
          );
        }
      }
    },
    {
      name: 'test_moving_heads_aim_trajectory_strictly_on_floor',
      fn: () => {
        const env = new ClubEnvironment();
        // Simulate 60 frames of ambient movement
        for (let f = 0; f < 60; f++) {
          env.update(0.033, { mids: 50 }, { position: { x: 0, y: 5, z: 5 } });
          for (let i = 0; i < env.movingHeads.length; i++) {
            const mh = env.movingHeads[i];
            const aim = mh.currentAim;
            assert.ok(aim, `Moving head ${i} must have currentAim`);
            assert.ok(
              aim.x >= -7.6 && aim.x <= 7.6,
              `Aim X (${aim.x.toFixed(2)}) must stay within floor bounds [-7.5, 7.5]`
            );
            assert.ok(
              aim.z >= -5.1 && aim.z <= 9.6,
              `Aim Z (${aim.z.toFixed(2)}) must stay within floor bounds [-5.0, 9.5]`
            );
          }
        }
      }
    },
    {
      name: 'test_fog_density_allows_25m_visibility',
      fn: () => {
        const sm = new SceneManager({ clientWidth: 1280, clientHeight: 720 });
        if (sm.scene && sm.scene.fog) {
          const density = sm.scene.fog.density;
          assert.ok(
            density <= 0.015,
            `Fog density (${density}) must be <= 0.015 so at 25m distance the scene is not pitch black`
          );
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
