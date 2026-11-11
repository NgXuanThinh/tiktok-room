// tests/equipment-evolution.test.js - QA Suite for Equipment & Tier Evolution based on Cumulative Coins
import assert from 'node:assert';
import * as THREE from 'three';
import {
  DEFAULT_THRESHOLDS,
  loadThresholds,
  saveThresholds,
  resetThresholds,
  evaluateEquipment
} from '../src/equipment-config.js';
import {
  createCyberSlime,
  SLIME_BASE_RADIUS,
  SLIME_ACCESSORY_DIMENSIONS
} from '../src/slime-model.js';
import { AURA_TYPES } from '../src/slime-constants.js';
import { ClubEnvironment } from '../src/club-environment.js';
import { handleGiftEvent } from '../src/live-event-handler.js';

export async function run() {
  const suite = 'equipment-evolution';
  const results = {
    suite,
    total: 6,
    passed: 0,
    failed: 0,
    cases: []
  };

  const test = (name, fn) => {
    try {
      fn();
      results.passed++;
      results.cases.push({ name, status: 'PASS' });
      console.log(`  ✓ ${name}`);
    } catch (err) {
      results.failed++;
      results.cases.push({ name, status: 'FAIL', error: err.message });
      console.error(`  ✗ ${name}:`, err.message);
    }
  };

  console.log('Testing Equipment & Slime Tier Evolution System...');

  // Test 1: Cumulative Coin Progression Logic in evaluateEquipment
  test('evaluateEquipment accurately evaluates tiers and equipment for default thresholds', () => {
    // 0 coins: Free Tier 1, no rings, default floor, no aura
    const r0 = evaluateEquipment(0);
    assert.strictEqual(r0.tier, 1);
    assert.strictEqual(r0.footRings, 0);
    assert.strictEqual(r0.hasBodyAura, false);
    assert.strictEqual(r0.auraType, null);

    // 25 coins: Foot Ring 1 (Trắng) & Slime Tier 2 (Chubby) unlocked (>= 20)
    const r25 = evaluateEquipment(25);
    assert.strictEqual(r25.tier, 2);
    assert.strictEqual(r25.footRings, 1);

    // 120 coins: Foot Ring 2 (Vàng) unlocked (>= 100)
    const r120 = evaluateEquipment(120);
    assert.strictEqual(r120.tier, 2);
    assert.strictEqual(r120.footRings, 2);

    // 600 coins: Slime Tier 3 (Má mochi) unlocked (>= 500)
    const r600 = evaluateEquipment(600);
    assert.strictEqual(r600.tier, 3);
    assert.strictEqual(r600.footRings, 2);

    // 1200 coins: Foot Ring 3 (Cam) unlocked (>= 1000)
    const r1200 = evaluateEquipment(1200);
    assert.strictEqual(r1200.tier, 3);
    assert.strictEqual(r1200.footRings, 3);

    // 2200 coins: Aura Tím unlocked (>= 2000)
    const r2200 = evaluateEquipment(2200);
    assert.strictEqual(r2200.auraType, 'purple');
    assert.strictEqual(r2200.hasBodyAura, true);

    // 3200 coins: Slime Tier 4 (Sừng+Đuôi) unlocked (>= 3000)
    const r3200 = evaluateEquipment(3200);
    assert.strictEqual(r3200.tier, 4);

    // 3800 coins: Aura Cam unlocked (>= 3500)
    const r3800 = evaluateEquipment(3800);
    assert.strictEqual(r3800.auraType, 'orange');
    assert.strictEqual(r3800.hasBodyAura, true);

    // 5200 coins: Aura Vàng Mythic unlocked (>= 5000)
    const r5200 = evaluateEquipment(5200);
    assert.strictEqual(r5200.auraType, 'gold');
    assert.strictEqual(r5200.hasBodyAura, true);

    // 6500 coins WITHOUT Top 1 rank: Caps at Tier 4
    const r6500NonTop1 = evaluateEquipment(6500, null, false);
    assert.strictEqual(r6500NonTop1.tier, 4, 'Non-Top1 donor must cap at Tier 4 even if coins >= 6000');
    assert.strictEqual(r6500NonTop1.footRings, 3);
    assert.strictEqual(r6500NonTop1.auraType, 'gold');

    // 6500 coins WITH Top 1 rank: Slime Tier 5 (Halo Max) unlocked (>= 6000)
    const r6500Top1 = evaluateEquipment(6500, null, true);
    assert.strictEqual(r6500Top1.tier, 5, 'Top 1 donor unlocks Tier 5 when coins >= 6000');
    assert.strictEqual(r6500Top1.footRings, 3);
    assert.strictEqual(r6500Top1.auraType, 'gold');
  });

  // Test 2: Custom Thresholds Override
  test('evaluateEquipment supports custom threshold inputs', () => {
    const customCfg = {
      footRing1: 10,
      slimeTier2: 20,
      footRing2: 30,
      slimeTier3: 40,
      footRing3: 60,
      bodyPurpleAura: 70,
      slimeTier4: 80,
      bodyOrangeAura: 90,
      bodyGoldenAura: 100,
      slimeTier5: 120
    };

    const eq95 = evaluateEquipment(95, customCfg, false);
    assert.strictEqual(eq95.tier, 4);
    assert.strictEqual(eq95.footRings, 3);
    assert.strictEqual(eq95.auraType, 'orange');
    assert.strictEqual(eq95.hasBodyAura, true);

    // 150 coins but not Top 1 -> caps at Tier 4
    const eq150NonTop = evaluateEquipment(150, customCfg, false);
    assert.strictEqual(eq150NonTop.tier, 4);
    assert.strictEqual(eq150NonTop.auraType, 'gold');

    // 150 coins AND Top 1 -> reaches Tier 5
    const eq150Top = evaluateEquipment(150, customCfg, true);
    assert.strictEqual(eq150Top.tier, 5);
    assert.strictEqual(eq150Top.auraType, 'gold');
  });

  // Test 3: 3 Concentric Ground Foot Rings in Slime Model
  test('Slime model has 3 static concentric foot rings proportional to slime base radius', () => {
    const controller = createCyberSlime('lime', { id: 'test_u', username: 'TestViewer' });
    const rings = controller.accessories?.footRings;
    assert.ok(rings, 'controller.accessories.footRings must exist');
    assert.ok(rings.ring1 && rings.ring2 && rings.ring3, 'All 3 rings must exist in footRings');

    // Check colors
    assert.strictEqual(rings.ring1.material.color.getHex(), 0xffffff, 'Ring 1 must be White');
    assert.strictEqual(rings.ring2.material.color.getHex(), 0xffd700, 'Ring 2 must be Gold/Yellow');
    assert.strictEqual(rings.ring3.material.color.getHex(), 0xff6600, 'Ring 3 must be Orange');

    // Check radii derived from SLIME_ACCESSORY_DIMENSIONS
    assert.strictEqual(rings.ring1.geometry.parameters.radius, SLIME_ACCESSORY_DIMENSIONS.footRings.ring1Radius);
    assert.strictEqual(rings.ring2.geometry.parameters.radius, SLIME_ACCESSORY_DIMENSIONS.footRings.ring2Radius);
    assert.strictEqual(rings.ring3.geometry.parameters.radius, SLIME_ACCESSORY_DIMENSIONS.footRings.ring3Radius);

    // Test setFootRings levels
    controller.setFootRings(0);
    assert.strictEqual(rings.ring1.visible, false);
    assert.strictEqual(rings.ring2.visible, false);
    assert.strictEqual(rings.ring3.visible, false);

    controller.setFootRings(1);
    assert.strictEqual(rings.ring1.visible, true);
    assert.strictEqual(rings.ring2.visible, false);
    assert.strictEqual(rings.ring3.visible, false);

    controller.setFootRings(2);
    assert.strictEqual(rings.ring1.visible, true);
    assert.strictEqual(rings.ring2.visible, true);
    assert.strictEqual(rings.ring3.visible, false);

    controller.setFootRings(3);
    assert.strictEqual(rings.ring1.visible, true);
    assert.strictEqual(rings.ring2.visible, true);
    assert.strictEqual(rings.ring3.visible, true);
  });

  // Test 4: Rotating Body Aura with Purple, Orange & Gold with rising mini bubbles
  test('Slime model has rotating body aura supporting Purple, Orange and Gold styles', () => {
    const controller = createCyberSlime('pink', { id: 'test_u2', username: 'TestViewer2' });
    const aura = controller.accessories?.bodyAura;
    const auraCtrl = controller.accessories?.auraController;
    assert.ok(aura, 'controller.accessories.bodyAura must exist');
    assert.ok(auraCtrl, 'controller.accessories.auraController must exist');

    // Geometry assertions
    const geom = aura.geometry;
    assert.ok(geom instanceof THREE.CylinderGeometry, 'Body aura geometry must be a CylinderGeometry');
    assert.ok(geom.parameters.radiusTop > geom.parameters.radiusBottom, 'Aura must be wider on top than bottom (inverted cone)');
    assert.strictEqual(geom.parameters.openEnded, true, 'Aura must be open-ended');
    assert.strictEqual(geom.parameters.height, SLIME_ACCESSORY_DIMENSIONS.bodyAura.height);
    assert.strictEqual(geom.parameters.radiusTop, SLIME_ACCESSORY_DIMENSIONS.bodyAura.radiusTop);
    assert.strictEqual(geom.parameters.radiusBottom, SLIME_ACCESSORY_DIMENSIONS.bodyAura.radiusBottom);
    assert.ok(geom.parameters.height <= 0.50, `Aura height (${geom.parameters.height}) must be ~1/2 slime height (<= 0.5m)`);
    assert.ok(geom.parameters.radiusBottom >= 1.10, `Aura radiusBottom (${geom.parameters.radiusBottom}) must surround slime from the outside (>= 1.10m)`);

    // Test Purple Aura
    controller.setBodyAura('purple');
    assert.strictEqual(aura.visible, true);
    assert.strictEqual(aura.material.color.getHex(), AURA_TYPES.purple.color, 'Aura must be Purple');
    assert.strictEqual(auraCtrl.bubblesPoints.visible, false, 'Purple Aura must NOT have mini bubbles');

    // Test Orange Aura
    controller.setBodyAura('orange');
    assert.strictEqual(aura.visible, true);
    assert.strictEqual(aura.material.color.getHex(), AURA_TYPES.orange.color, 'Aura must be Orange');
    assert.strictEqual(auraCtrl.bubblesPoints.visible, false, 'Orange Aura must NOT have mini bubbles');

    // Test Gold Aura
    controller.setBodyAura('gold');
    assert.strictEqual(aura.visible, true);
    assert.strictEqual(aura.material.color.getHex(), AURA_TYPES.gold.color, 'Aura must be Vivid Gold');
    assert.strictEqual(auraCtrl.bubblesPoints.visible, true, 'Gold Aura MUST have rising mini bubbles');

    // Test Rotation around Y
    const initRotY = auraCtrl.coneMesh.rotation.y;
    auraCtrl.update(0.1);
    assert.notStrictEqual(auraCtrl.coneMesh.rotation.y, initRotY, 'Aura cone mesh must rotate around Y-axis during update');

    // Test setBodyAura toggle off
    controller.setBodyAura(false);
    assert.strictEqual(auraCtrl.group.visible, false);
  });

  // Test 5: Slime Tier 5 Top 1 Exclusivity and Floor Color Removal Verification
  test('Slime Tier 5 strictly requires Top 1 donor status & floor color changing is cleanly removed', () => {
    const scene = new THREE.Scene();
    const env = new ClubEnvironment(scene);

    // Floor base color stays clean
    assert.strictEqual(env.floorMesh.material.color.getHex(), 0xffffff);

    // Calling deprecated stub does not throw and does not create overrides
    const slotPos = new THREE.Vector3(0, 0, 0);
    assert.doesNotThrow(() => {
      env.setSlotFloorColor(slotPos, 'gold');
    });
    assert.strictEqual(env.slotFloorOverrides.size, 0, 'No floor overrides should exist as floor color changing is removed');

    // Verify Tier 5 exclusivity
    const nonTop1WithHighCoins = evaluateEquipment(999999, null, false);
    assert.strictEqual(nonTop1WithHighCoins.tier, 4, 'Even with 999k coins, non-Top 1 donor remains Tier 4');

    const top1WithHighCoins = evaluateEquipment(999999, null, true);
    assert.strictEqual(top1WithHighCoins.tier, 5, 'Top 1 donor with coins >= threshold reaches Tier 5');

    const top1WithLowCoins = evaluateEquipment(500, null, true);
    assert.strictEqual(top1WithLowCoins.tier, 3, 'Top 1 donor with coins below Tier 5 threshold does NOT reach Tier 5 prematurely');
  });

  // Test 6: handleGiftEvent Cumulative Coin Progression, Auto Top 1 and Aura Evolution
  test('handleGiftEvent accumulates coins and applies matching tier, foot rings & multi-style aura', () => {
    const scene = new THREE.Scene();
    const env = new ClubEnvironment(scene);
    const avatar = createCyberSlime('cyan', { id: 'donor_vip', username: 'VipDonor' });

    const avatarMeshes = new Map();
    avatarMeshes.set('donor_vip', avatar.mesh);
    const userCoinsMap = new Map();

    const ctx = {
      clubEnvironment: env,
      avatarMeshes,
      userCoinsMap,
      uiOverlay: { addHype: () => {}, showGiftAlert: () => {}, updateLeaderboard: () => {} },
      audioSystem: { playSfx: () => {} },
      getOrCreateAvatarMesh: () => avatar.mesh,
      executeVipPromotionAndSwap: () => {},
      enqueueHighTierShowcase: () => {}
    };

    // Donation 1: 30 coins -> unlocks Foot Ring 1 (>= 20) and Slime Tier 2 (>= 20)
    handleGiftEvent({
      type: 'gift',
      user: { id: 'donor_vip', username: 'VipDonor' },
      data: { totalCoins: 30 }
    }, ctx);

    assert.strictEqual(avatar.state.tier, 2, 'Should advance to Tier 2 at 30 coins');
    assert.strictEqual(avatar.state.footRings, 1, 'Should have 1 foot ring at 30 coins');
    assert.strictEqual(avatar.state.hasBodyAura, false);

    // Donation 2: +70 coins (Total 100) -> unlocks Foot Ring 2 (>= 100)
    handleGiftEvent({
      type: 'gift',
      user: { id: 'donor_vip', username: 'VipDonor' },
      data: { totalCoins: 70 }
    }, ctx);

    assert.strictEqual(avatar.state.tier, 2);
    assert.strictEqual(avatar.state.footRings, 2, 'Should have 2 foot rings at 100 coins');

    // Donation 3: +3500 coins (Total 3600) -> unlocks Tier 4 (>= 3000), Foot Ring 3 (>= 1000), Orange Aura (>= 3500)
    handleGiftEvent({
      type: 'gift',
      user: { id: 'donor_vip', username: 'VipDonor' },
      data: { totalCoins: 3500 }
    }, ctx);

    assert.strictEqual(avatar.state.tier, 4, 'Should advance to Tier 4 at 3600 coins');
    assert.strictEqual(avatar.state.footRings, 3, 'Should have 3 foot rings at 3600 coins');
    assert.strictEqual(avatar.state.hasBodyAura, true);
    assert.strictEqual(avatar.state.auraType, 'orange');

    // Donation 4: +3000 coins (Total 6600). Since donor_vip is the sole donor (Top 1) and >= 6000, advances to Tier 5 and Gold Aura
    handleGiftEvent({
      type: 'gift',
      user: { id: 'donor_vip', username: 'VipDonor' },
      data: { totalCoins: 3000 }
    }, ctx);

    assert.strictEqual(avatar.state.tier, 5, 'Should advance to Tier 5 at 6600 coins as Top 1 donor');
    assert.strictEqual(avatar.state.auraType, 'gold', 'Should upgrade to Vivid Gold Aura with mini bubbles');
  });

  return results;
}

if (process.argv[1] && process.argv[1].endsWith('equipment-evolution.test.js')) {
  run().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
