// tests/verify-tier5-and-threshold-adherence.test.js - Verification for Admin Threshold Adherence & Strict Tier 5 Rules
import assert from 'assert';
import * as THREE from 'three';
import { evaluateEquipment, saveThresholds, resetThresholds, loadThresholds } from '../src/equipment-config.js';
import { handleRoomRanksEvent, handleGiftEvent } from '../src/live-event-handler.js';
import { VipLoungeManager } from '../src/vip-lounge-manager.js';
import { createCyberSlime } from '../src/slime-model.js';
import { getOrCreateAvatarMesh } from '../src/avatar-coordinator.js';

export async function run() {
  console.log('Testing Admin Threshold Adherence & Strict Tier 5 Rules...');
  const results = { total: 0, passed: 0, failed: 0 };
  resetThresholds();

  function test(name, fn) {
    results.total++;
    try {
      fn();
      results.passed++;
      console.log(`  ✓ ${name}`);
    } catch (err) {
      results.failed++;
      console.error(`  ✗ ${name}: ${err.message}`);
    }
  }

  // Test 1: handleRoomRanksEvent with low coins (e.g. 41 coins for Top 1, 17 coins for Top 2)
  test('handleRoomRanksEvent strictly evaluates tier and equipment by coins, without inflating to Tier 5/4/3', () => {
    const avatarMeshes = new Map();
    const userCoinsMap = new Map();
    const vipLoungeManager = new VipLoungeManager();
    const floorSlots = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1, 0, 1),
      new THREE.Vector3(2, 0, 2)
    ];

    const context = {
      avatarMeshes,
      userCoinsMap,
      vipLoungeManager,
      floorSlots,
      sceneManager: { scene: new THREE.Scene() },
      syncActiveFloorAvatars: () => {},
      executeVipPromotionAndSwap: (sortedDonors) => vipLoungeManager.executeVipPromotionAndSwap({
        sortedDonors,
        avatarMeshes,
        userCoinsMap,
        floorSlots
      }),
      occupancyManager: {
        touch: (id, name, coins) => ({ totalCoins: coins })
      },
      getOrCreateAvatarMesh: (userData, coins) => getOrCreateAvatarMesh(userData, coins, {
        avatarMeshes,
        vipLoungeManager,
        floorSlots,
        occupancyManager: { touch: (id, name, c) => ({ totalCoins: c }) },
        sceneManager: { scene: new THREE.Scene() }
      })
    };

    const roomRanksPayload = {
      ranks: [
        {
          score: 41,
          user: { id: 'user_khoi', nickname: 'Khôi', displayId: 'khoi99' }
        },
        {
          score: 17,
          user: { id: 'user_dainho', nickname: 'Đại nhớ nội', displayId: 'dainho' }
        },
        {
          score: 5,
          user: { id: 'user_hiep', nickname: 'Bắc Sĩ Hiệp', displayId: 'hiep' }
        }
      ]
    };

    handleRoomRanksEvent(roomRanksPayload, context);

    // 1. Verify coins in userCoinsMap are exact, NOT 1000 or 500
    assert.strictEqual(userCoinsMap.get('user_khoi').totalCoins, 41, 'Top 1 totalCoins must be exactly 41');
    assert.strictEqual(userCoinsMap.get('user_dainho').totalCoins, 17, 'Top 2 totalCoins must be exactly 17');
    assert.strictEqual(userCoinsMap.get('user_hiep').totalCoins, 5, 'Top 3 totalCoins must be exactly 5');

    // 2. Verify avatar meshes were created and evaluated correctly
    const meshTop1 = avatarMeshes.get('user_khoi');
    const meshTop2 = avatarMeshes.get('user_dainho');
    const meshTop3 = avatarMeshes.get('user_hiep');

    assert.ok(meshTop1, 'Mesh for Top 1 must exist');
    assert.ok(meshTop2, 'Mesh for Top 2 must exist');
    assert.ok(meshTop3, 'Mesh for Top 3 must exist');

    // 3. Top 1 has 41 coins: must be Tier 2 (>= 20), NOT Tier 5!
    assert.strictEqual(meshTop1.userData.controller.state.tier, 2, 'Top 1 with 41 coins must be Tier 2, NEVER Tier 5');
    assert.strictEqual(meshTop1.userData.controller.state.footRings, 1, '41 coins unlocks Foot Ring 1 (>= 20)');
    assert.strictEqual(meshTop1.userData.controller.state.hasBodyAura, false, '41 coins has no aura');
    // Top 1 sits on VIP podium with Top 1 title
    assert.strictEqual(vipLoungeManager.getCurrentTop1(), 'user_khoi');
    assert.strictEqual(meshTop1.userData.isVipLounge, true);

    // 4. Top 2 has 17 coins: must be Tier 1 (< 20), NOT Tier 4!
    assert.strictEqual(meshTop2.userData.controller.state.tier, 1, 'Top 2 with 17 coins must be Tier 1, NEVER Tier 4');
    assert.strictEqual(meshTop2.userData.controller.state.footRings, 0, '17 coins has 0 foot rings');
    assert.strictEqual(meshTop2.userData.controller.state.hasBodyAura, false);
    // Top 2 sits on VIP podium with Top 2 title
    assert.strictEqual(vipLoungeManager.getCurrentTop2(), 'user_dainho');
    assert.strictEqual(meshTop2.userData.isVipLounge, true);

    // 5. Top 3 has 5 coins: must be Tier 1 (< 20), NOT Tier 3!
    assert.strictEqual(meshTop3.userData.controller.state.tier, 1, 'Top 3 with 5 coins must be Tier 1, NEVER Tier 3');
  });

  // Test 2: Top 1 reaching threshold (6000 coins) unlocks Tier 5; Top 2 with >= 6000 caps at Tier 4
  test('Tier 5 is strictly exclusive to Top 1 when coins >= slimeTier5 (Top 2 caps at Tier 4)', () => {
    const avatarMeshes = new Map();
    const userCoinsMap = new Map();
    const vipLoungeManager = new VipLoungeManager();
    const floorSlots = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 1)];

    const context = {
      avatarMeshes,
      userCoinsMap,
      vipLoungeManager,
      floorSlots,
      sceneManager: { scene: new THREE.Scene() },
      syncActiveFloorAvatars: () => {},
      executeVipPromotionAndSwap: (sortedDonors) => vipLoungeManager.executeVipPromotionAndSwap({
        sortedDonors,
        avatarMeshes,
        userCoinsMap,
        floorSlots
      }),
      occupancyManager: {
        touch: (id, name, coins) => ({ totalCoins: coins })
      },
      getOrCreateAvatarMesh: (userData, coins) => getOrCreateAvatarMesh(userData, coins, {
        avatarMeshes,
        vipLoungeManager,
        floorSlots,
        occupancyManager: { touch: (id, name, c) => ({ totalCoins: c }) },
        sceneManager: { scene: new THREE.Scene() }
      })
    };

    const roomRanksPayload = {
      ranks: [
        {
          score: 8000,
          user: { id: 'whale_1', nickname: 'TopWhale1' }
        },
        {
          score: 6500,
          user: { id: 'whale_2', nickname: 'TopWhale2' }
        }
      ]
    };

    handleRoomRanksEvent(roomRanksPayload, context);

    const meshTop1 = avatarMeshes.get('whale_1');
    const meshTop2 = avatarMeshes.get('whale_2');

    // Whale 1 is Top 1 with 8000 coins >= 6000 -> Unlocks Tier 5
    assert.strictEqual(meshTop1.userData.controller.state.tier, 5, 'Whale 1 as Top 1 with 8000 coins must be Tier 5');
    assert.strictEqual(meshTop1.userData.controller.accessories.halo.visible, true, 'Halo must be visible for Tier 5');
    assert.strictEqual(meshTop1.userData.controller.state.footRings, 3, 'Must have 3 foot rings');
    assert.strictEqual(meshTop1.userData.controller.state.auraType, 'gold', 'Must have gold aura');

    // Whale 2 is Top 2 with 6500 coins >= 6000 -> Must CAP at Tier 4
    assert.strictEqual(meshTop2.userData.controller.state.tier, 4, 'Whale 2 as Top 2 with 6500 coins MUST CAP at Tier 4');
    assert.strictEqual(meshTop2.userData.controller.accessories.halo.visible, false, 'Halo must NOT be visible for Top 2');
    assert.strictEqual(meshTop2.userData.controller.state.footRings, 3, 'Must have 3 foot rings');
    assert.strictEqual(meshTop2.userData.controller.state.auraType, 'gold', 'Must have gold aura');
  });

  // Test 3: Dethroning Top 1 immediately strips Tier 5 from demoted avatar
  test('Dethroning Top 1 immediately demotes displaced avatar from Tier 5 to Tier 4', () => {
    const avatarMeshes = new Map();
    const userCoinsMap = new Map();
    const vipLoungeManager = new VipLoungeManager();
    const floorSlots = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 1), new THREE.Vector3(2, 0, 2)];

    const executeVipPromotionAndSwap = (sortedDonors) => vipLoungeManager.executeVipPromotionAndSwap({
      sortedDonors,
      avatarMeshes,
      userCoinsMap,
      floorSlots
    });

    const context = {
      avatarMeshes,
      userCoinsMap,
      vipLoungeManager,
      floorSlots,
      sceneManager: { scene: new THREE.Scene() },
      syncActiveFloorAvatars: () => {},
      executeVipPromotionAndSwap,
      occupancyManager: {
        touch: (id, name, coins) => ({ totalCoins: coins })
      },
      getOrCreateAvatarMesh: (userData, coins) => getOrCreateAvatarMesh(userData, coins, {
        avatarMeshes,
        vipLoungeManager,
        floorSlots,
        occupancyManager: { touch: (id, name, c) => ({ totalCoins: c }) },
        sceneManager: { scene: new THREE.Scene() }
      })
    };

    // User A initially Top 1 with 7000 coins
    handleRoomRanksEvent({
      ranks: [
        { score: 7000, user: { id: 'user_a', nickname: 'UserA' } }
      ]
    }, context);

    const meshA = avatarMeshes.get('user_a');
    assert.strictEqual(meshA.userData.controller.state.tier, 5, 'User A initially reaches Tier 5 as Top 1');

    // User B donates 9000 coins and soán ngôi Top 1!
    handleRoomRanksEvent({
      ranks: [
        { score: 9000, user: { id: 'user_b', nickname: 'UserB' } },
        { score: 7000, user: { id: 'user_a', nickname: 'UserA' } }
      ]
    }, context);

    const meshB = avatarMeshes.get('user_b');

    // User B becomes Top 1 and reaches Tier 5
    assert.strictEqual(vipLoungeManager.getCurrentTop1(), 'user_b');
    assert.strictEqual(meshB.userData.controller.state.tier, 5, 'User B is now Top 1 with Tier 5');

    // User A is displaced to Top 2: must immediately drop to Tier 4
    assert.strictEqual(vipLoungeManager.getCurrentTop2(), 'user_a');
    assert.strictEqual(meshA.userData.controller.state.tier, 4, 'User A displaced to Top 2 must immediately drop from Tier 5 to Tier 4');
    assert.strictEqual(meshA.userData.controller.accessories.halo.visible, false, 'Halo must disappear on demotion');
  });

  // Test 4: Dynamic threshold adjustment from Admin Panel updates active avatars
  test('Dynamic threshold adjustments in admin panel immediately re-evaluates all active avatars', () => {
    const avatarMeshes = new Map();
    const userCoinsMap = new Map();

    const avatarTop1 = createCyberSlime('gold', { id: 'donor_top', username: 'TopDonor' });
    const avatarFloor = createCyberSlime('cyan', { id: 'donor_mid', username: 'MidDonor' });

    avatarMeshes.set('donor_top', avatarTop1.mesh);
    avatarMeshes.set('donor_mid', avatarFloor.mesh);

    userCoinsMap.set('donor_top', { userId: 'donor_top', totalCoins: 7000 });
    userCoinsMap.set('donor_mid', { userId: 'donor_mid', totalCoins: 15 });

    // Initial evaluation with default thresholds (slimeTier5: 6000, slimeTier2: 20)
    const eqTopInitial = evaluateEquipment(7000, null, true);
    assert.strictEqual(eqTopInitial.tier, 5, 'Initially Top 1 has Tier 5 with 7000 coins (>= 6000)');

    const eqMidInitial = evaluateEquipment(15, null, false);
    assert.strictEqual(eqMidInitial.tier, 1, 'Initially Mid donor has Tier 1 with 15 coins (< 20)');

    // Admin updates thresholds: slimeTier5 raised to 10000, slimeTier2 lowered to 10
    const newThresholds = {
      ...loadThresholds(),
      slimeTier5: 10000,
      slimeTier2: 10
    };

    saveThresholds(newThresholds);

    // Simulate onThresholdsUpdated handler logic from main.js
    const sorted = Array.from(userCoinsMap.values()).sort((a, b) => b.totalCoins - a.totalCoins);
    const top1Id = sorted.length > 0 ? String(sorted[0].userId) : null;

    avatarMeshes.forEach((mesh, userId) => {
      const tracked = userCoinsMap.get(userId);
      const totalCoins = tracked?.totalCoins || 0;
      const isTop1 = top1Id === String(userId);
      const eq = evaluateEquipment(totalCoins, newThresholds, isTop1);

      if (mesh.userData?.controller) {
        mesh.userData.controller.setTier(eq.tier);
        mesh.userData.controller.setFootRings(eq.footRings);
        mesh.userData.controller.setBodyAura(eq.auraType);
      }
    });

    // Top 1 with 7000 coins now falls short of 10000 -> drops to Tier 4!
    assert.strictEqual(avatarTop1.state.tier, 4, 'Top 1 with 7000 coins drops to Tier 4 when admin raises threshold to 10000');
    assert.strictEqual(avatarTop1.accessories.halo.visible, false);

    // Mid donor with 15 coins now crosses new threshold of 10 -> upgrades to Tier 2!
    assert.strictEqual(avatarFloor.state.tier, 2, 'Mid donor with 15 coins upgrades to Tier 2 when admin lowers threshold to 10');
  });

  resetThresholds();
  return results;
}

if (process.argv[1] && process.argv[1].endsWith('verify-tier5-and-threshold-adherence.test.js')) {
  run().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
