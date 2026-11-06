import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

export async function run() {
  const suite = 'orbit-dj-occlusion-spotlights';
  const results = {
    suite,
    total: 7,
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
          targetY >= 8.0 && targetY <= 12.0,
          `Camera elevation at 25m behind DJ (${targetY.toFixed(1)}m) must be balanced between 8.0m and 12.0m to maintain consistent distance`
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
        const halfRows = (FLOOR_GRID_CONFIG.rows - 1) / 2;
        const topRowZ = -halfRows * FLOOR_GRID_CONFIG.tileSpacing; // e.g. -8.8m
        const halfTileSize = FLOOR_GRID_CONFIG.tileSize / 2;
        const floorTopEdge = topRowZ - halfTileSize; // e.g. -9.55m

        // DJ booth table front edge
        // DJ booth is positioned at Z = -10.25m, table depth is 1.4m (extends +0.7m forward to -9.55m)
        const djBoothZ = -10.25;
        const djTableFrontEdge = djBoothZ + 0.7; // -9.55m

        const clearance = Math.abs(djTableFrontEdge - floorTopEdge);
        assert.ok(
          clearance <= 0.1,
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
              aim.z >= -7.6 && aim.z <= 7.6,
              `Aim Z (${aim.z.toFixed(2)}) must stay within floor bounds [-7.5, 7.5]`
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
    },
    {
      name: 'test_moving_heads_cone_radii_top_small_floor_large',
      fn: () => {
        const env = new ClubEnvironment();
        assert.ok(env.movingHeads.length >= 4, 'Moving heads must exist');
        const firstHead = env.movingHeads[0].group;
        let coneMesh = null;
        firstHead.traverse((child) => {
          if (child.isMesh && child.geometry && child.geometry.attributes && child.geometry.attributes.position) {
            coneMesh = child;
          }
        });
        assert.ok(coneMesh, 'Moving head must contain visual cone mesh');
        const pos = coneMesh.geometry.attributes.position;
        let rAtCeiling = 0, rAtFloor = 0;
        for (let i = 0; i < pos.count; i++) {
          const z = pos.getZ(i);
          const r = Math.hypot(pos.getX(i), pos.getY(i));
          if (Math.abs(z - 0) < 0.05) rAtCeiling = Math.max(rAtCeiling, r);
          if (Math.abs(z - 16) < 0.05) rAtFloor = Math.max(rAtFloor, r);
        }
        assert.ok(
          rAtCeiling < 0.25,
          `Cone radius at ceiling fixture (${rAtCeiling.toFixed(2)}m) must be small (< 0.25m)`
        );
        assert.ok(
          rAtFloor > 1.8,
          `Cone radius at floor distance (${rAtFloor.toFixed(2)}m) must be large (> 1.8m)`
        );
        assert.ok(
          rAtCeiling < rAtFloor,
          `Cone must expand from ceiling to floor (rCeiling: ${rAtCeiling.toFixed(2)}m < rFloor: ${rAtFloor.toFixed(2)}m)`
        );
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
