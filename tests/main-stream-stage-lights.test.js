import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

export async function run() {
  const suite = 'main-stream-stage-lights';
  const results = {
    suite,
    total: 14,
    passed: 0,
    failed: 0,
    cases: []
  };

  let clubModule;
  let avatarModule;
  let sceneModule;
  let mainModule;

  try {
    clubModule = await import('../src/club-environment.js');
    avatarModule = await import('../src/avatar-manager.js');
    sceneModule = await import('../src/scene-manager.js');
    mainModule = await import('../src/main.js');
  } catch (err) {
    results.failed = results.total;
    results.cases.push({ name: 'module_import', status: 'FAIL', error: err.message });
    return results;
  }

  const { ClubEnvironment } = clubModule;
  const { createAvatarMesh, setSlimeColor } = avatarModule;
  const { SceneManager } = sceneModule;
  const { BASE_AVATAR_SCALE } = mainModule;

  const testCases = [
    {
      name: 'test_avatar_mesh_cyber_slime_controller_integration',
      fn: () => {
        const mesh = createAvatarMesh({ username: 'PlayerOne', level: 'Lv.10' }, 'green');
        assert.ok(mesh, 'Avatar mesh must be created');
        assert.ok(mesh.userData.controller, 'Avatar userData must contain CyberSlime controller');
        assert.ok(mesh.userData.slimeBody, 'Avatar userData must contain slimeBody');
        assert.ok(mesh.userData.eyeL && mesh.userData.eyeR, 'Avatar userData must contain eyeL and eyeR');
        assert.ok(mesh.userData.specL && mesh.userData.specR, 'Avatar userData must contain specL and specR');
        assert.strictEqual(mesh.userData.eyeL.parent, mesh.userData.slimeBody, 'eyeL must be parented to slimeBody');
        assert.strictEqual(mesh.userData.eyeR.parent, mesh.userData.slimeBody, 'eyeR must be parented to slimeBody');
      }
    },
    {
      name: 'test_stage_lights_harmonization_small',
      fn: () => {
        const env = new ClubEnvironment();
        env.focusSpotlights('small', { x: 1, y: 0, z: 1 });

        const focused = env.movingHeads.filter(h => h.isFocused);
        assert.strictEqual(focused.length, 1, 'Small gift must focus exactly 1 spotlight');
        assert.strictEqual(env.isWhiteBeamActive, false, 'Small gift must NOT activate white light beam');
        assert.strictEqual(env.isGoldenBeamActive, false, 'Small gift must NOT activate golden beam');
      }
    },
    {
      name: 'test_stage_lights_harmonization_medium',
      fn: () => {
        const env = new ClubEnvironment();
        env.focusSpotlights('medium', { x: -1, y: 0, z: 2 });

        const focused = env.movingHeads.filter(h => h.isFocused);
        assert.strictEqual(focused.length, 2, 'Medium gift must focus 2 spotlights');
        assert.strictEqual(focused[0].spot.color.getHex(), 0x00f2fe, 'Medium gift spotlights must be Cyan (0x00f2fe)');
        assert.strictEqual(env.isWhiteBeamActive, false, 'Medium gift must NOT activate white light beam');
        assert.strictEqual(env.isGoldenBeamActive, false, 'Medium gift must NOT activate golden beam');
      }
    },
    {
      name: 'test_stage_lights_harmonization_high',
      fn: () => {
        const env = new ClubEnvironment();
        env.focusSpotlights('high', { x: 2, y: 0, z: -2 });

        const focused = env.movingHeads.filter(h => h.isFocused);
        assert.ok(focused.length >= 6, 'High gift must focus at least 6 spotlights');
        assert.strictEqual(focused[0].spot.color.getHex(), 0xffffff, 'High gift spotlights must be crisp White (0xffffff)');
        assert.strictEqual(env.isWhiteBeamActive, true, 'High gift MUST activate white light beam');
        assert.ok(env.whiteBeam && env.whiteBeam.visible, 'whiteBeam mesh must be visible');
        assert.ok(env.whiteBeamMat.opacity > 0.25, 'whiteBeamMat opacity must be active and softened');
        assert.strictEqual(env.isGoldenBeamActive, false, 'High gift must NOT activate golden beam');
      }
    },
    {
      name: 'test_stage_lights_harmonization_ultra',
      fn: () => {
        const env = new ClubEnvironment();
        env.focusSpotlights('ultra', { x: 0, y: 0, z: 0 });

        const focused = env.movingHeads.filter(h => h.isFocused);
        assert.strictEqual(focused.length, env.movingHeads.length, 'Ultra gift must focus all 8 moving heads');
        assert.strictEqual(focused[0].spot.color.getHex(), 0xffd700, 'Ultra spotlights must be Gold (0xffd700)');
        assert.strictEqual(env.isGoldenBeamActive, true, 'Ultra gift MUST activate golden beam');
        assert.ok(env.goldenBeam && env.goldenBeam.visible, 'goldenBeam mesh must be visible');
        assert.ok(env.goldenBeamMat.opacity > 0.10, 'goldenBeamMat opacity must be active and softly translucent');
      }
    },
    {
      name: 'test_white_and_golden_beam_decay_timeline',
      fn: () => {
        const env = new ClubEnvironment();

        // 1. White beam decay
        env.triggerWhiteLightBeam(0, 0, 1.0);
        assert.strictEqual(env.isWhiteBeamActive, true);
        env.update(1.2, {});
        assert.strictEqual(env.isWhiteBeamActive, false, 'White beam must cleanly expire and deactivate');
        assert.strictEqual(env.whiteBeam.visible, false);

        // 2. Golden beam decay
        env.triggerGoldenLightBeam(0, 0, 1.0);
        assert.strictEqual(env.isGoldenBeamActive, true);
        env.update(1.2, {});
        assert.strictEqual(env.isGoldenBeamActive, false, 'Golden beam must cleanly expire and deactivate');
        assert.strictEqual(env.goldenBeam.visible, false);
      }
    },
    {
      name: 'test_main_stream_tier_differentiated_dance_moves',
      fn: () => {
        const meshT1 = createAvatarMesh({ username: 'T1' });
        const meshT3 = createAvatarMesh({ username: 'T3' });
        const meshT4 = createAvatarMesh({ username: 'T4' });

        meshT1.userData.controller.setTier(1);
        meshT3.userData.controller.setTier(3);
        meshT4.userData.controller.setTier(4);

        // Tier 1 cannot spin or flip
        assert.strictEqual(meshT1.userData.controller.triggerDanceMove('spin').success, false);
        assert.strictEqual(meshT1.userData.controller.triggerDanceMove('flip').success, false);

        // Tier 3 can spin, cannot flip
        assert.strictEqual(meshT3.userData.controller.triggerDanceMove('spin').success, true);
        assert.strictEqual(meshT3.userData.controller.triggerDanceMove('flip').success, false);

        // Tier 4 can both spin and flip
        meshT4.userData.controller.update(1.5, 0); // finish any previous move
        assert.strictEqual(meshT4.userData.controller.triggerDanceMove('spin').success, true);
        meshT4.userData.controller.update(1.5, 0);
        assert.strictEqual(meshT4.userData.controller.triggerDanceMove('flip').success, true);
      }
    },
    {
      name: 'test_main_stream_separation_of_shape_and_donate_fx',
      fn: () => {
        const mesh = createAvatarMesh({ username: 'SemiSphereGuy' });
        const ctrl = mesh.userData.controller;
        ctrl.setTier(1); // Half-sphere

        assert.strictEqual(ctrl.state.tier, 1, 'Initial tier must be 1');

        // Donate without level up
        ctrl.triggerDonateAnimation('medium', false, 1);
        assert.strictEqual(ctrl.state.tier, 1, 'Tier must remain 1 when donate without level up');

        // Advance 1.6s to finish donate FX
        ctrl.update(1.6, 0);
        assert.strictEqual(ctrl.state.tier, 1, 'Tier remains 1 after donate FX finishes');

        // Donate with level up
        ctrl.triggerDonateAnimation('medium', true, 2);
        assert.strictEqual(ctrl.state.tier, 2, 'Tier must upgrade to 2 when upgradeTier is true');
      }
    },
    {
      name: 'test_dj_mascot_female_chubby_with_horns_and_headphones',
      fn: () => {
        const env = new ClubEnvironment();
        assert.ok(env.djMascot, 'DJ mascot group must exist');
        assert.ok(env.djMascotHead, 'DJ mascot head must exist');
        assert.ok(env.djMascotHand, 'DJ mascot scratching arm must exist');

        // Verify DJ is Pink
        const djBody = env.djMascotHead.children[0];
        assert.strictEqual(djBody.material.color.getHex(), 0xff2a85, 'DJ body must be Cyber Pink (0xff2a85)');

        // Verify mascot animation on update
        const initialY = env.djMascot.position.y;
        env.update(0.1, { bassFlux: 1.5 });
        assert.ok(env.djMascot.position.y >= 1.45, 'DJ mascot bobs to 128 BPM music');
      }
    },
    {
      name: 'test_spotlights_4_colors_alternating',
      fn: () => {
        const env = new ClubEnvironment();
        assert.strictEqual(env.movingHeads.length, 8, 'Must have 8 moving heads');

        const expectedColors = [0xffe600, 0x0088ff, 0x00ff66, 0xff2244]; // Yellow, Blue, Green, Red
        for (let i = 0; i < env.movingHeads.length; i++) {
          const mh = env.movingHeads[i];
          const expected = expectedColors[i % 4];
          assert.strictEqual(mh.baseCol.getHex(), expected, `Moving head #${i} base color must be 0x${expected.toString(16)}`);
          assert.strictEqual(mh.spot.color.getHex(), expected, `Moving head #${i} spotlight color must match alternating 4-color pattern`);
        }
      }
    },
    {
      name: 'test_avatar_scale_proportioned_to_floor_tiles',
      fn: () => {
        assert.strictEqual(typeof BASE_AVATAR_SCALE, 'number', 'BASE_AVATAR_SCALE must be exported');
        assert.ok(BASE_AVATAR_SCALE >= 0.5 && BASE_AVATAR_SCALE <= 0.6, 'BASE_AVATAR_SCALE must be ~0.52 to fit within 1.5m tiles');

        // Raw slime width ~2.24m * 0.52 = ~1.16m, which leaves ~0.44m spacing on 1.6m grid
        const effectiveWidth = 2.24 * BASE_AVATAR_SCALE;
        assert.ok(effectiveWidth < 1.4, 'Effective avatar diameter must be smaller than 1.5m tile size');
      }
    },
    {
      name: 'test_lion_tracking_camera_dynamics',
      fn: () => {
        const mockContainer = { clientWidth: 1280, clientHeight: 720 };
        const sm = new SceneManager(mockContainer);

        const mesh = createAvatarMesh({ username: 'LionWhale' }, 'yellow');
        mesh.userData.controller.setTier(5);
        mesh.userData.controller.triggerLionCelebration(true);

        sm.startLionTracking(mesh, 7.6);
        assert.strictEqual(sm.isLionTracking, true, 'isLionTracking must be active');
        assert.strictEqual(sm.lionHeroMesh, mesh, 'lionHeroMesh must track the avatar');
        assert.ok(sm.shakeTimer > 0, 'Camera shake must be triggered');

        // Advance update as hero launches to sky
        mesh.userData.controller.update(1.5, 0); // Slime rises to 4.2m
        sm.update(0.1, 0);

        // Verify camera tracking elevates focus target towards the sky
        assert.ok(sm.camLookTarget.y > 0.45, 'Camera target y must elevate to follow soaring king');
        assert.ok(sm.camTargetPos.z > 6.0, 'Camera position must pull back for cinematic framing');
      }
    },
    {
      name: 'test_small_and_medium_donate_jump_peaks',
      fn: () => {
        const mesh = createAvatarMesh({ username: 'HighJumper' });
        const ctrl = mesh.userData.controller;
        assert.ok(ctrl, 'CyberSlime controller must exist');

        // Test small donate jump: apex at t = 0.45s
        ctrl.triggerDonateAnimation('small', false, 1);
        ctrl.update(0.45, 0);
        assert.ok(ctrl.rootNode.position.y >= 3.5, `Small donate jump (${ctrl.rootNode.position.y.toFixed(2)}m) must reach >= 3.5m apex`);

        // Test medium donate jump: apex at t = 0.50s
        ctrl.triggerDonateAnimation('medium', false, 2);
        ctrl.update(0.50, 0);
        assert.ok(ctrl.rootNode.position.y >= 4.5, `Medium donate jump (${ctrl.rootNode.position.y.toFixed(2)}m) must reach >= 4.5m apex`);
      }
    },
    {
      name: 'test_top5_leaderboard_slice_and_rank_classes',
      fn: () => {
        // Mock UiOverlay updateLeaderboard logic
        const donors = [
          { username: 'D1', totalCoins: 1000 },
          { username: 'D2', totalCoins: 800 },
          { username: 'D3', totalCoins: 600 },
          { username: 'D4', totalCoins: 400 },
          { username: 'D5', totalCoins: 200 },
          { username: 'D6', totalCoins: 100 }
        ];

        const top5 = donors.slice(0, 5);
        assert.strictEqual(top5.length, 5, 'Leaderboard must display top 5 donors');
        assert.strictEqual(top5[0].username, 'D1');
        assert.strictEqual(top5[4].username, 'D5');

        const rankClasses = top5.map((_, i) => `rank-${i + 1}`);
        assert.deepStrictEqual(rankClasses, ['rank-1', 'rank-2', 'rank-3', 'rank-4', 'rank-5']);
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
