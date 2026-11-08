import assert from 'node:assert';
import {
  SLIME_PALETTES,
  createCyberSlime,
  sharedBasicHalfSphereGeometry,
  sharedChubbyMochiGeometry
} from '../preview/slime-model.js';

export async function run() {
  const suite = 'preview-design-constraints';
  const results = {
    suite,
    total: 10,
    passed: 0,
    failed: 0,
    cases: []
  };

  const testCases = [
    {
      name: 'test_chubby_palettes_exclude_gold_and_contain_cyan_pink_lime',
      fn: () => {
        // Requirement 1: Màu của chubby sẽ chỉ còn (cyan - pink - lime). Bỏ Gold.
        assert.ok(!('gold' in SLIME_PALETTES), 'SLIME_PALETTES must NOT contain gold');
        assert.ok(!('violet' in SLIME_PALETTES), 'SLIME_PALETTES must NOT contain violet');
        assert.ok('cyan' in SLIME_PALETTES, 'SLIME_PALETTES must contain cyan');
        assert.ok('lime' in SLIME_PALETTES, 'SLIME_PALETTES must contain lime');
        assert.ok('pink' in SLIME_PALETTES || 'magenta' in SLIME_PALETTES, 'SLIME_PALETTES must contain pink/magenta');

        assert.strictEqual(SLIME_PALETTES.cyan.shellColor, 0x00f2fe, 'Cyan shell color must be 0x00f2fe');
        const pinkSpec = SLIME_PALETTES.pink || SLIME_PALETTES.magenta;
        assert.strictEqual(pinkSpec.shellColor, 0xff0874, 'Pink shell color must be 0xff0874');
        assert.strictEqual(SLIME_PALETTES.lime.shellColor, 0x00ff88, 'Lime shell color must be 0x00ff88');
      }
    },
    {
      name: 'test_foot_ring_and_halo_always_gold_regardless_of_palette',
      fn: () => {
        // Requirement 2: Vòng chân sẽ luôn là Gold, cùng với halo.
        const avatar = createCyberSlime('cyan', { nickname: 'Tester' });
        avatar.setTier(5); // Tier 5 enables both halo and auraRing

        assert.ok(avatar.accessories.halo, 'Avatar must have halo accessory');
        assert.ok(avatar.accessories.auraRing, 'Avatar must have auraRing (vòng chân) accessory');

        // Test initial Gold color (0xffd700)
        assert.strictEqual(avatar.accessories.halo.children[0].material.color.getHex(), 0xffd700, 'Halo must be Gold (0xffd700)');
        assert.strictEqual(avatar.accessories.auraRing.discMat.color.getHex(), 0xffd700, 'Vòng chân disc must be Gold (0xffd700)');

        // Switch palette across all chubby colors
        const testPalettes = ['cyan', 'magenta', 'lime'];
        for (const pal of testPalettes) {
          avatar.setPalette(pal);

          // Halo and Vòng chân MUST remain Gold, not overwritten by palette!
          assert.strictEqual(
            avatar.accessories.halo.children[0].material.color.getHex(),
            0xffd700,
            `Halo must remain Gold (0xffd700) when avatar palette is ${pal}`
          );
          assert.strictEqual(
            avatar.accessories.auraRing.discMat.color.getHex(),
            0xffd700,
            `Vòng chân disc must remain Gold (0xffd700) when avatar palette is ${pal}`
          );
          assert.strictEqual(
            avatar.accessories.auraRing.torusMat.emissive.getHex(),
            0xffd700,
            `Vòng chân torus must remain Gold (0xffd700) when avatar palette is ${pal}`
          );
        }
      }
    },
    {
      name: 'test_eye_restoration_after_pegasus_lion_celebration',
      fn: () => {
        // Requirement 3: Khi hiệu ứng donate ngựa thần kết thúc, mắt avatar phải mở to ra trở lại.
        const avatar = createCyberSlime('cyan', { nickname: 'Tester' });
        
        // Start celebration (Pegasus / Lion)
        avatar.triggerLionCelebration(false);
        assert.strictEqual(avatar.state.isLionCelebrating, true, 'Celebration state should be active');
        assert.strictEqual(avatar.state.expression, 'smile', 'Eye expression during celebration should be smile');
        assert.strictEqual(avatar.eyeLeft.eyeHolder.scale.y, 0.2, 'Eye scale during celebration should be squinted');

        // Advance animation past end time (7.6 seconds)
        avatar.update(8.0, 0);

        // Eyes must be fully restored!
        assert.strictEqual(avatar.state.isLionCelebrating, false, 'Celebration state should be ended');
        assert.strictEqual(avatar.state.expression, 'normal', 'Expression MUST be restored to normal');
        assert.strictEqual(avatar.eyeLeft.eyeHolder.scale.y, 1.0, 'Left eye MUST be restored to scale 1.0 (opened wide)');
        assert.strictEqual(avatar.eyeRight.eyeHolder.scale.y, 1.0, 'Right eye MUST be restored to scale 1.0 (opened wide)');
      }
    },
    {
      name: 'test_billboard_label_white_text_and_contrast',
      fn: () => {
        // Requirement 4: Chữ "level 45" và "top 1" trong label đổi sang màu trắng (#ffffff)
        // Verify billboard generation and rankTheme colors
        const avatar = createCyberSlime('cyan', {
          nickname: 'Thịnh Pro',
          tiktokLevel: 'Lv.45',
          donateRank: 'TOP 1'
        });

        assert.ok(avatar.billboard, 'Billboard sprite must exist on avatar');
        assert.strictEqual(avatar.userData.tiktokLevel, 'Lv.45');
        assert.strictEqual(avatar.userData.donateRank, 'TOP 1');
      }
    },
    {
      name: 'test_separation_of_tier_shape_and_donate_effect',
      fn: () => {
        // Requirement 5: Tách biệt tier shape và donate effect.
        // Nếu avatar đang là bán cầu, donate giữ nguyên bán cầu + effect.
        // Chỉ khi donate + lên level mới thay đổi shape.
        const avatar = createCyberSlime('cyan', { nickname: 'Tester' });
        avatar.setTier(1); // Set to Tier 1: Bán Cầu (Half-Sphere)

        assert.strictEqual(avatar.state.tier, 1, 'Avatar should start at Tier 1 (Bán Cầu)');
        assert.strictEqual(avatar.slimeMesh.geometry, sharedBasicHalfSphereGeometry, 'Geometry must be Bán Cầu');

        // Case A: Donate without level up (upgradeTier = false)
        avatar.triggerLionCelebration(false);
        assert.strictEqual(avatar.state.tier, 1, 'Tier must remain 1 when donate without level up');
        assert.strictEqual(avatar.slimeMesh.geometry, sharedBasicHalfSphereGeometry, 'Geometry must remain Bán Cầu');

        // Case B: Donate with level up (upgradeTier = true)
        avatar.triggerLionCelebration(true);
        assert.strictEqual(avatar.state.tier, 5, 'Tier must upgrade to Tier 5 when donate with level up');
        assert.strictEqual(avatar.slimeMesh.geometry, sharedChubbyMochiGeometry, 'Geometry must change to Chubby Mochi');
      }
    },
    {
      name: 'test_small_gift_jump_1s_animation',
      fn: () => {
        // Requirement: Quà nhỏ nhảy lên cao trong 1s rồi rớt xuống
        const avatar = createCyberSlime('cyan', { nickname: 'Tester' });
        avatar.triggerDonateAnimation('small', false, 1);

        assert.strictEqual(avatar.state.donateFx.type, 'small');
        assert.strictEqual(avatar.state.donateFx.duration, 1.0);

        // Tại thời điểm đỉnh t = 0.45s: avatar nhảy lên cao > 1.8m, rotation.y = 0 (không xoay)
        avatar.update(0.45, 0);
        assert.ok(avatar.rootNode.position.y > 1.8, 'Small gift avatar must jump high (> 1.8m)');
        assert.strictEqual(avatar.rootNode.rotation.y, 0, 'Small gift avatar should not spin');

        // Sau 1s (t = 1.05s): avatar đã rớt xuống đất, reset trạng thái
        avatar.update(0.60, 0);
        assert.strictEqual(avatar.state.donateFx, null, 'Donate FX should finish after 1.0s');
        assert.strictEqual(avatar.rootNode.position.y, 0.12, 'Avatar must land back at ground y = 0.12');
        assert.strictEqual(avatar.state.expression, 'normal', 'Expression should be normal');
        assert.strictEqual(avatar.eyeLeft.eyeHolder.scale.y, 1.0, 'Eyes should be open');
      }
    },
    {
      name: 'test_medium_and_high_gift_jump_and_spin_0_5s_animation',
      fn: () => {
        // Requirement: Quà trung nhảy lên cao trong 1s + xoay vòng tròn 0.5s rồi rớt xuống
        const avatar = createCyberSlime('cyan', { nickname: 'Tester' });
        avatar.triggerDonateAnimation('medium', false, 2);

        assert.strictEqual(avatar.state.donateFx.type, 'medium');
        assert.strictEqual(avatar.state.donateFx.duration, 1.5);

        // Nhảy lên cao đến đỉnh t = 0.5s
        avatar.update(0.50, 0);
        assert.ok(avatar.rootNode.position.y > 2.0, 'Medium gift avatar must jump high (> 2.0m)');

        // Trong khoảng 0.5s xoay vòng tròn (từ 0.5s đến 1.0s)
        avatar.update(0.25, 0); // t = 0.75s (giữa chu kỳ xoay)
        assert.ok(avatar.rootNode.rotation.y > 2.5 && avatar.rootNode.rotation.y < 4.0, 'Avatar must be actively spinning');

        // Đến t = 1.0s: hoàn thành xoay 360 độ (2*PI)
        avatar.update(0.25, 0);
        assert.ok(Math.abs(avatar.rootNode.rotation.y - Math.PI * 2) < 0.05, 'Avatar must complete 360 degree spin');

        // Đến t = 1.55s: rơi xuống đất và reset hoàn toàn
        avatar.update(0.55, 0);
        assert.strictEqual(avatar.state.donateFx, null, 'Medium donate FX should finish after 1.5s');
        assert.strictEqual(avatar.rootNode.position.y, 0.12, 'Avatar must land back on ground');
        assert.strictEqual(avatar.rootNode.rotation.y, 0, 'Rotation must reset to 0');
        assert.strictEqual(avatar.state.expression, 'normal', 'Expression should be normal');
      }
    },
    {
      name: 'test_tier_1_and_2_dance_only_default_bounce_no_spin_no_flip',
      fn: () => {
        // Requirement 8: Tier 1 & Tier 2 chỉ có thể nhún nhảy default, không thể xoay tròn hoặc lộn vòng
        const av1 = createCyberSlime('cyan', { nickname: 'T1' });
        av1.setTier(1);
        const av2 = createCyberSlime('magenta', { nickname: 'T2' });
        av2.setTier(2);

        for (const av of [av1, av2]) {
          // Manual triggers must be rejected
          const spinRes = av.triggerDanceMove('spin');
          assert.strictEqual(spinRes.success, false, 'Tier 1 & 2 must NOT be able to spin');
          assert.strictEqual(spinRes.reason, 'tier_too_low');

          const flipRes = av.triggerDanceMove('flip');
          assert.strictEqual(flipRes.success, false, 'Tier 1 & 2 must NOT be able to flip');
          assert.strictEqual(flipRes.reason, 'tier_too_low');

          // Over a full 8-beat cycle (approx 3.75s at 128 BPM)
          // Rotation must strictly remain (0, 0, 0)
          for (let step = 0; step < 80; step++) {
            av.update(0.05, 0);
            assert.strictEqual(av.rootNode.rotation.x, 0, 'Tier 1 & 2 must NOT rotate on X');
            assert.strictEqual(av.rootNode.rotation.y, 0, 'Tier 1 & 2 must NOT rotate on Y');
            assert.strictEqual(av.rootNode.rotation.z, 0, 'Tier 1 & 2 must NOT rotate on Z');
          }
        }
      }
    },
    {
      name: 'test_tier_3_can_spin_around_but_cannot_flip',
      fn: () => {
        // Requirement 9: Tier 3 có thể xoay tròn bên cạnh nhún nhảy như default, nhưng không thể lộn vòng
        const av3 = createCyberSlime('lime', { nickname: 'T3' });
        av3.setTier(3);

        // Cannot flip
        const flipRes = av3.triggerDanceMove('flip');
        assert.strictEqual(flipRes.success, false, 'Tier 3 must NOT be able to flip');
        assert.strictEqual(flipRes.reason, 'tier_too_low');

        // Can spin
        const spinRes = av3.triggerDanceMove('spin');
        assert.strictEqual(spinRes.success, true, 'Tier 3 must be able to spin');

        // At peak of manual spin (t = 0.5s of 1.0s)
        av3.update(0.5, 0);
        assert.ok(Math.abs(av3.rootNode.rotation.y) > 0.5, 'Tier 3 avatar must be rotating on Y');
        assert.strictEqual(av3.rootNode.rotation.x, 0, 'Tier 3 must NOT rotate on X (no flip)');

        // Finish manual spin
        av3.update(0.6, 0);
        assert.strictEqual(av3.state.activeDanceAction, null, 'Manual spin should finish');

        // Shuffle / Freestyle Flourish for Tier 3: Must trigger a spin, never a flip
        av3.shuffleDanceMove();
        assert.ok(av3.state.activeFlourish, 'Tier 3 shuffle must activate a flourish');
        assert.strictEqual(av3.state.activeFlourish.type, 'spin', 'Tier 3 flourish must be spin');
        av3.update(0.5, 0);
        assert.ok(Math.abs(av3.rootNode.rotation.y) > 0.5, 'Tier 3 must rotate Y during flourish');
        assert.strictEqual(av3.rootNode.rotation.x, 0, 'Tier 3 must strictly NEVER rotate on X');

        // Across 100 frames of auto dance, rotation.x must strictly remain 0 (never flip)
        for (let i = 0; i < 100; i++) {
          av3.update(0.05, 0);
          assert.strictEqual(av3.rootNode.rotation.x, 0, 'Tier 3 must NEVER flip on X during auto dance');
        }
      }
    },
    {
      name: 'test_tier_4_and_5_can_spin_and_flip',
      fn: () => {
        // Requirement 10: Tier 4 và 5 hơn Tier 3 là có thể lộn vòng nữa
        const av4 = createCyberSlime('cyan', { nickname: 'T4' });
        av4.setTier(4);
        const av5 = createCyberSlime('magenta', { nickname: 'T5' });
        av5.setTier(5);

        for (const av of [av4, av5]) {
          // Can both spin and flip
          const spinRes = av.triggerDanceMove('spin');
          assert.strictEqual(spinRes.success, true, 'Tier 4/5 must be able to spin');
          av.update(1.2, 0); // complete spin

          const flipRes = av.triggerDanceMove('flip');
          assert.strictEqual(flipRes.success, true, 'Tier 4/5 must be able to flip');

          // Mid-flip (t = 0.6s of 1.2s)
          av.update(0.6, 0);
          assert.ok(Math.abs(av.rootNode.rotation.x) > 1.0, 'Tier 4/5 must be flipping on X axis');
          assert.ok(av.rootNode.position.y > 0.5, 'Tier 4/5 must be in the air during flip');

          // Finish flip
          av.update(0.7, 0);
          assert.strictEqual(av.state.activeDanceAction, null, 'Flip must complete');

          // Shuffle / Freestyle Flourish for Tier 4/5: can do spin or flip
          av.shuffleDanceMove();
          assert.ok(av.state.activeFlourish, 'Tier 4/5 shuffle must activate a flourish');
          assert.ok(
            av.state.activeFlourish.type === 'spin' || av.state.activeFlourish.type === 'flip',
            'Flourish must be either spin or flip'
          );
        }
      }
    }
  ];

  for (const tc of testCases) {
    try {
      tc.fn();
      results.passed++;
      results.cases.push({ name: tc.name, status: 'PASSED' });
    } catch (err) {
      results.failed++;
      results.cases.push({ name: tc.name, status: 'FAILED', error: err.message });
      console.error(`[FAIL] ${tc.name}:`, err.message);
    }
  }

  return results;
}

if (process.argv[1] && process.argv[1].endsWith('preview-design-constraints.test.js')) {
  run().then(res => {
    console.log(`\nResults: ${res.passed}/${res.total} passed`);
    process.exit(res.failed === 0 ? 0 : 1);
  });
}
