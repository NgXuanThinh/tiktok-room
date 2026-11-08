import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

export async function run() {
  const suite = 'slime-eye-sync-whale';
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
    // Failed to import
  }

  const {
    applyWhaleSlimeAesthetics,
    AvatarOccupancyManager,
    createAvatarMesh
  } = avatarModule || {};

  const testCases = [
    {
      name: 'test_slime_eye_scene_graph_parenting',
      fn: () => {
        // Mock group and mesh creation or check createAvatarMesh
        assert.ok(typeof createAvatarMesh === 'function', 'createAvatarMesh must be exported');
        const mockAvatar = createAvatarMesh('whale_user_1', 'yellow');
        assert.ok(mockAvatar, 'Avatar group must be created');

        const slimeBody = mockAvatar.userData?.slimeBody;
        assert.ok(slimeBody, 'slimeBody must exist on avatar userData');

        const eyeL = mockAvatar.userData?.eyeL;
        const eyeR = mockAvatar.userData?.eyeR;
        assert.ok(eyeL && eyeR, 'eyeL and eyeR must exist');

        // CRITICAL: Eyes must be parented to slimeBody, NOT the root group!
        assert.strictEqual(
          eyeL.parent,
          slimeBody,
          'eyeL MUST be parented directly to slimeBody in local coordinates'
        );
        assert.strictEqual(
          eyeR.parent,
          slimeBody,
          'eyeR MUST be parented directly to slimeBody in local coordinates'
        );
      }
    },
    {
      name: 'test_specular_catchlight_parenting',
      fn: () => {
        assert.ok(typeof createAvatarMesh === 'function', 'createAvatarMesh must be exported');
        const mockAvatar = createAvatarMesh('whale_user_2', 'yellow');
        const eyeL = mockAvatar.userData?.eyeL;
        const eyeR = mockAvatar.userData?.eyeR;
        const specL = mockAvatar.userData?.specL;
        const specR = mockAvatar.userData?.specR;

        assert.ok(specL && specR, 'Specular catchlights must exist');
        assert.strictEqual(specL.parent, eyeL, 'specL MUST be parented directly to eyeL');
        assert.strictEqual(specR.parent, eyeR, 'specR MUST be parented directly to eyeR');
      }
    },
    {
      name: 'test_eye_lockstep_squash_and_stretch',
      fn: () => {
        assert.ok(typeof createAvatarMesh === 'function', 'createAvatarMesh must be exported');
        const mockAvatar = createAvatarMesh('whale_user_3', 'yellow');
        const slimeBody = mockAvatar.userData?.slimeBody;
        const eyeL = mockAvatar.userData?.eyeL;

        // Base local position of eye relative to slimeBody
        const baseEyeLocalY = eyeL.position.y;
        assert.ok(baseEyeLocalY > 0, 'Eye local Y must be positive relative to slimeBody');

        // Apply squash on slimeBody
        slimeBody.scale.set(1.15, 0.75, 1.15);
        slimeBody.position.y = 0.35 * 0.75;

        // Because eyeL is parented to slimeBody, eyeL's local coordinates remain unchanged
        // while its world position naturally transforms with the mesh matrix!
        assert.strictEqual(
          eyeL.position.y,
          baseEyeLocalY,
          'Eye local position must remain locked to slimeBody face across deformation'
        );
      }
    },
    {
      name: 'test_whale_slime_golden_holographic_material',
      fn: () => {
        assert.strictEqual(
          typeof applyWhaleSlimeAesthetics,
          'function',
          'applyWhaleSlimeAesthetics must be exported'
        );

        const mockGroup = {
          userData: {
            colorKey: 'pink',
            slimeMat: {
              _color: 0xff2a85,
              color: { setHex: (val) => { mockGroup.userData.slimeMat._color = val; } },
              emissive: { setHex: (val) => { mockGroup.userData.slimeMat._emissive = val; } },
              emissiveIntensity: 0.5,
              metalness: 0.1,
              roughness: 0.2
            },
            crown: { visible: false },
            auraRing: { visible: false },
            sparkles: { visible: false }
          }
        };

        applyWhaleSlimeAesthetics(mockGroup, 3);

        assert.strictEqual(mockGroup.userData.isWhale, true, 'isWhale must be set to true');
        assert.strictEqual(mockGroup.userData.colorKey, 'pink', 'Must preserve original avatar colorKey');
        assert.strictEqual(mockGroup.userData.slimeMat._color, 0xff2a85, 'Must keep original avatar color without forcing gold');
      }
    },
    {
      name: 'test_whale_jeweled_crown_and_aura_visibility',
      fn: () => {
        assert.strictEqual(typeof applyWhaleSlimeAesthetics, 'function', 'applyWhaleSlimeAesthetics must be exported');
        const mockGroup = {
          userData: {
            slimeMat: { color: { setHex: () => {} }, emissive: { setHex: () => {} } },
            crown: { visible: false },
            auraRing: { visible: false },
            sparkles: { visible: false }
          }
        };

        applyWhaleSlimeAesthetics(mockGroup, 3);
        assert.strictEqual(mockGroup.userData.crown.visible, true, 'Jeweled crown must be visible');
        assert.strictEqual(mockGroup.userData.auraRing.visible, true, 'Ground aura disc must be visible');
        assert.strictEqual(mockGroup.userData.sparkles.visible, true, 'Sparkle trail must be visible');
      }
    },
    {
      name: 'test_whale_tier_target_scaling',
      fn: () => {
        assert.strictEqual(typeof applyWhaleSlimeAesthetics, 'function', 'applyWhaleSlimeAesthetics must be exported');
        const mockT3 = {
          userData: {
            slimeMat: { color: { setHex: () => {} }, emissive: { setHex: () => {} } },
            crown: {}, auraRing: {}, sparkles: {}
          }
        };
        applyWhaleSlimeAesthetics(mockT3, 3);
        assert.strictEqual(mockT3.userData.targetScale, 1.4, 'Tier 3 whale slime must scale to 1.4x');

        const mockT4 = {
          userData: {
            slimeMat: { color: { setHex: () => {} }, emissive: { setHex: () => {} } },
            crown: {}, auraRing: {}, sparkles: {}
          }
        };
        applyWhaleSlimeAesthetics(mockT4, 4);
        assert.strictEqual(mockT4.userData.targetScale, 1.6, 'Tier 4 King Slime must scale to 1.6x');
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
