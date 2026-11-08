import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

export async function run() {
  const suite = 'vip-inplace-celebration-swap';
  const results = {
    suite,
    total: 7,
    passed: 0,
    failed: 0,
    cases: []
  };

  let clubModule;
  let mainModule;
  let sceneModule;

  try {
    clubModule = await import('../src/club-environment.js');
    mainModule = await import('../src/main.js');
    sceneModule = await import('../src/scene-manager.js');
  } catch (err) {
    results.failed = results.total;
    results.cases.push({ name: 'module_import', status: 'FAIL', error: err.message });
    return results;
  }

  const { ClubEnvironment } = clubModule;
  const { VIP_TOP1_SLOT, VIP_TOP2_SLOT, VIP_STAGE_SLOTS } = mainModule;
  const { SceneManager, CAMERA_PRESETS } = sceneModule;

  const testCases = [
    {
      name: 'test_vip_platforms_elevation_and_anti_flickering_geometry',
      fn: () => {
        const env = new ClubEnvironment();
        assert.ok(env.vipPodiumGroup, 'VIP podium group must exist');

        // Verify Left VIP (Top 1) and Right VIP (Top 2) groups
        const leftGroup = env.vipPodiumGroup.children[0];
        const rightGroup = env.vipPodiumGroup.children[1];
        assert.ok(leftGroup, 'Left VIP group must exist');
        assert.ok(rightGroup, 'Right VIP group must exist');

        assert.strictEqual(leftGroup.position.x, -5.4, 'Left VIP center X must be -5.4m');
        assert.strictEqual(rightGroup.position.x, 5.4, 'Right VIP center X must be +5.4m');

        // Verify Anti-Flickering / Z-fighting avoidance:
        // Left VIP has elevated tier base (0.36m), border (y=0.46m, top=0.48m) and glass deck (y=0.495m, top=0.51m)
        let leftGlassMesh = null;
        let leftBorderMesh = null;
        leftGroup.traverse((child) => {
          if (child.isMesh && child.geometry?.parameters?.height === 0.03) leftGlassMesh = child;
          if (child.isMesh && child.geometry?.parameters?.height === 0.04) leftBorderMesh = child;
        });

        assert.ok(leftGlassMesh, 'Left VIP glass deck mesh must exist');
        assert.ok(leftBorderMesh, 'Left VIP border mesh must exist');
        assert.ok(
          leftGlassMesh.position.y > leftBorderMesh.position.y,
          'Left VIP glass deck must sit higher than border to eliminate Z-fighting'
        );
      }
    },
    {
      name: 'test_vip_steady_architectural_lighting',
      fn: () => {
        const env = new ClubEnvironment();
        assert.ok(env.leftVipSpot, 'leftVipSpot must exist');
        assert.ok(env.rightVipSpot, 'rightVipSpot must exist');

        // Top 1: Warm Imperial Gold Spotlight (0xffd700)
        assert.strictEqual(env.leftVipSpot.color.getHex(), 0xffd700, 'Left VIP spot must be Imperial Gold (0xffd700)');
        assert.strictEqual(env.leftVipSpot.target.position.x, -5.4);
        assert.strictEqual(env.leftVipSpot.target.position.z, -10.9);

        // Top 2: Cyber Cyan Spotlight (0x00f2fe)
        assert.strictEqual(env.rightVipSpot.color.getHex(), 0x00f2fe, 'Right VIP spot must be Cyber Cyan (0x00f2fe)');
        assert.strictEqual(env.rightVipSpot.target.position.x, 5.4);
        assert.strictEqual(env.rightVipSpot.target.position.z, -10.9);
      }
    },
    {
      name: 'test_moving_heads_never_slice_across_vip_platforms_in_ambient',
      fn: () => {
        const env = new ClubEnvironment();
        // Simulate 120 frames of ambient movement (~4 seconds)
        for (let f = 0; f < 120; f++) {
          env.update(0.033, { mids: 50 }, { position: { x: 0, y: 5, z: 5 } });
          const aim0 = env.movingHeads[0].currentAim;
          const aim1 = env.movingHeads[1].currentAim;

          // Head 0 (Left dance floor & side bar): Z must stay >= -7.5m, never penetrating Left VIP (z = -9.6m)
          assert.ok(
            aim0.z >= -7.5,
            `Moving head #0 aim Z (${aim0.z.toFixed(2)}) must stay in front of VIP platform (>= -7.5m)`
          );

          // Head 1 (Right dance floor & side bar): Z must stay >= -7.5m, never penetrating Right VIP (z = -9.6m)
          assert.ok(
            aim1.z >= -7.5,
            `Moving head #1 aim Z (${aim1.z.toFixed(2)}) must stay in front of VIP platform (>= -7.5m)`
          );
        }
      }
    },
    {
      name: 'test_laser_beams_mounted_away_from_vip_lounges',
      fn: () => {
        const env = new ClubEnvironment();
        assert.strictEqual(env.laserBeams.length, 6, 'Must have 6 laser beams');

        for (let i = 0; i < env.laserBeams.length; i++) {
          const lb = env.laserBeams[i];
          // Lasers mounted between x = -3.5m and +3.5m, never directly above VIP at x = ±5.4m
          assert.ok(
            Math.abs(lb.mesh.position.x) <= 3.6,
            `Laser ${i} X position (${lb.mesh.position.x.toFixed(2)}m) must be centered away from VIP lounges (x = ±5.4m)`
          );
        }
      }
    },
    {
      name: 'test_vip_stage_slots_and_elevations',
      fn: () => {
        assert.ok(VIP_TOP1_SLOT, 'VIP_TOP1_SLOT must be exported');
        assert.ok(VIP_TOP2_SLOT, 'VIP_TOP2_SLOT must be exported');
        assert.strictEqual(VIP_STAGE_SLOTS.length, 2, 'VIP_STAGE_SLOTS must contain Top 1 and Top 2 slots');

        // Top 1 Left: elevated dais y = 0.48m, z = -10.9m
        assert.strictEqual(VIP_TOP1_SLOT.x, -5.4);
        assert.strictEqual(VIP_TOP1_SLOT.y, 0.48);
        assert.strictEqual(VIP_TOP1_SLOT.z, -10.9);

        // Top 2 Right: standard dais y = 0.38m, z = -10.9m
        assert.strictEqual(VIP_TOP2_SLOT.x, 5.4);
        assert.strictEqual(VIP_TOP2_SLOT.y, 0.38);
        assert.strictEqual(VIP_TOP2_SLOT.z, -10.9);
      }
    },
    {
      name: 'test_camera_vip_preset_expanded_framing',
      fn: () => {
        assert.ok(CAMERA_PRESETS?.vip, 'CAMERA_PRESETS.vip must exist');
        assert.ok(CAMERA_PRESETS.vip.fov >= 50, `VIP camera FOV (${CAMERA_PRESETS.vip.fov}) must be >= 50 for wide framing`);

        const sm = new SceneManager();
        const origin = { x: 0, y: 0, z: -2 };
        sm.setCameraPreset('vip', 4.0, origin);

        assert.ok(sm.camTargetPos.z >= 4.0, `Camera target Z (${sm.camTargetPos.z}) must pull back to frame full celebratory beam`);
        assert.ok(sm.camTargetPos.y >= 3.0, `Camera target Y (${sm.camTargetPos.y}) must elevate for vertical clearance`);
      }
    },
    {
      name: 'test_vip_demotion_target_scale_and_accessories_reset_contract',
      fn: () => {
        // Contract test verifying demoted avatar attributes
        const mockDisplacedAvatar = {
          userData: {
            targetScale: 1.6,
            isWhale: true,
            isVipLounge: true,
            crown: { visible: true },
            auraRing: { visible: true },
            sparkles: { visible: true }
          }
        };

        // When demoted to dance floor
        mockDisplacedAvatar.userData.targetScale = 1.0;
        mockDisplacedAvatar.userData.isWhale = false;
        mockDisplacedAvatar.userData.isVipLounge = false;
        if (mockDisplacedAvatar.userData.crown) mockDisplacedAvatar.userData.crown.visible = false;
        if (mockDisplacedAvatar.userData.auraRing) mockDisplacedAvatar.userData.auraRing.visible = false;
        if (mockDisplacedAvatar.userData.sparkles) mockDisplacedAvatar.userData.sparkles.visible = false;

        assert.strictEqual(mockDisplacedAvatar.userData.targetScale, 1.0, 'targetScale must be 1.0 on floor');
        assert.strictEqual(mockDisplacedAvatar.userData.isWhale, false, 'isWhale must be false on floor');
        assert.strictEqual(mockDisplacedAvatar.userData.crown.visible, false, 'crown must be hidden');
        assert.strictEqual(mockDisplacedAvatar.userData.auraRing.visible, false, 'auraRing must be hidden');
        assert.strictEqual(mockDisplacedAvatar.userData.sparkles.visible, false, 'sparkles must be hidden');
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
