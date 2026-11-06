import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

export async function run() {
  const suite = 'slime-kinematics';
  const results = {
    suite,
    total: 6,
    passed: 0,
    failed: 0,
    cases: []
  };

  let avatarModule;
  try {
    avatarModule = await import('../src/avatar-manager.js');
  } catch (err) {
    // Avatar manager failed to load
  }

  const {
    getSlimeKinematics,
    SLIME_VIP_CONFIG,
    SLIME_FACE_CONFIG
  } = avatarModule || {};

  const testCases = [
    {
      name: 'test_downbeat_squash_kinematics',
      fn: () => {
        assert.strictEqual(typeof getSlimeKinematics, 'function', 'getSlimeKinematics must be exported');
        // Phase for maximum downbeat squash: 1.5 * PI (270 deg)
        const squash = getSlimeKinematics(Math.PI * 1.5, false);
        assert.ok(squash, 'Expected returned kinematics object');
        assert.ok(squash.scaleY <= 0.76, `Downbeat scaleY (${squash.scaleY}) must be <= 0.76 (nominal ~0.75)`);
        assert.ok(squash.scaleXZ >= 1.14, `Downbeat scaleXZ (${squash.scaleXZ}) must be >= 1.14 (nominal ~1.15)`);
        assert.strictEqual(squash.jumpY, 0, 'Slime must stay on floor (jumpY = 0) during floor impact squash');
      }
    },
    {
      name: 'test_upbeat_stretch_kinematics',
      fn: () => {
        assert.strictEqual(typeof getSlimeKinematics, 'function', 'getSlimeKinematics must be exported');
        // Phase for maximum upbeat stretch: 0.5 * PI (90 deg)
        const stretch = getSlimeKinematics(Math.PI * 0.5, false);
        assert.ok(stretch, 'Expected returned kinematics object');
        assert.ok(stretch.scaleY >= 1.24, `Upbeat scaleY (${stretch.scaleY}) must be >= 1.24 (nominal ~1.25)`);
        assert.ok(stretch.scaleXZ <= 0.91, `Upbeat scaleXZ (${stretch.scaleXZ}) must be <= 0.91 (nominal ~0.90)`);
        assert.ok(stretch.jumpY >= 0.30, `Upbeat jumpY (${stretch.jumpY}) must be positive jump ascent (>= 0.30m)`);

        // Test with isBouncing = true (Super Bounce on gifts)
        const superBounce = getSlimeKinematics(Math.PI * 0.5, true);
        assert.ok(superBounce.jumpY >= 0.65, `Super bounce jumpY (${superBounce.jumpY}) must reach >= 0.65m`);
      }
    },
    {
      name: 'test_volume_conservation_ratio',
      fn: () => {
        assert.strictEqual(typeof getSlimeKinematics, 'function', 'getSlimeKinematics must be exported');
        const phases = [0, Math.PI * 0.25, Math.PI * 0.5, Math.PI * 0.75, Math.PI, Math.PI * 1.25, Math.PI * 1.5, Math.PI * 1.75];

        for (const p of phases) {
          const k = getSlimeKinematics(p, false);
          const volumeRatio = k.volumeRatio ?? (k.scaleXZ * k.scaleXZ * k.scaleY);
          assert.ok(
            volumeRatio >= 0.85 && volumeRatio <= 1.15,
            `Volume ratio (${volumeRatio.toFixed(3)}) at phase ${p} must conserve volume (~0.99, within [0.85, 1.15])`
          );
        }
      }
    },
    {
      name: 'test_tier_1_4_vip_scaling_and_evolution',
      fn: () => {
        assert.ok(SLIME_VIP_CONFIG, 'SLIME_VIP_CONFIG must be exported');
        assert.strictEqual(SLIME_VIP_CONFIG.tier1?.scale, 1.0, 'Tier 1 scale must be 1.0x');
        assert.strictEqual(SLIME_VIP_CONFIG.tier2?.scale, 1.2, 'Tier 2 scale must be 1.2x');
        assert.strictEqual(SLIME_VIP_CONFIG.tier3?.scale, 1.4, 'Tier 3 scale must be 1.4x');
        assert.strictEqual(SLIME_VIP_CONFIG.tier4?.scale, 1.6, 'Tier 4 King Slime scale must be 1.6x');

        assert.ok(SLIME_VIP_CONFIG.tier2?.hasSunglasses, 'Tier 2 must equip sunglasses');
        assert.ok(SLIME_VIP_CONFIG.tier3?.hasCrown, 'Tier 3 must equip golden crown');
        assert.ok(SLIME_VIP_CONFIG.tier4?.hasAngelWings, 'Tier 4 King Slime must equip angel wings');
        assert.ok(SLIME_VIP_CONFIG.tier4?.levitateY >= 3.0, 'Tier 4 King Slime must levitate above DJ booth (Y >= 3.0m)');
      }
    },
    {
      name: 'test_no_rosy_cheeks_blush_constraint',
      fn: () => {
        // User Constraint: Slime does NOT have rosy cheeks/blush. Keep face minimal (glossy blinking eyes + smile, no blush).
        assert.ok(SLIME_FACE_CONFIG !== undefined, 'SLIME_FACE_CONFIG must be exported');
        assert.strictEqual(SLIME_FACE_CONFIG.hasBlush, false, 'hasBlush must be explicitly false');
        assert.strictEqual(SLIME_FACE_CONFIG.hasEyes, true, 'hasEyes must be true');
        assert.strictEqual(SLIME_FACE_CONFIG.hasSmile, true, 'hasSmile must be true');
        assert.ok(!SLIME_FACE_CONFIG.blushColor, 'blushColor must be undefined or null');
      }
    },
    {
      name: 'test_slime_blinking_eye_kinematics',
      fn: () => {
        assert.ok(SLIME_FACE_CONFIG, 'SLIME_FACE_CONFIG must be exported');
        const blinkInterval = SLIME_FACE_CONFIG.blinkIntervalSeconds || 3.5;
        const blinkDuration = SLIME_FACE_CONFIG.blinkDurationSeconds || 0.15;
        assert.ok(blinkInterval >= 2.0 && blinkInterval <= 5.0, 'Blink interval should be 2.0 to 5.0 seconds');
        assert.ok(blinkDuration >= 0.10 && blinkDuration <= 0.25, 'Blink duration should be 0.10 to 0.25 seconds');
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
