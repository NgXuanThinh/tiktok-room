// tests/mainline-refactor-modules.test.js - Unit tests for refactored mainline modules
import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

export async function run() {
  const suite = 'mainline-refactor-modules';
  const results = {
    suite,
    total: 15,
    passed: 0,
    failed: 0,
    cases: []
  };

  const fs = await import('node:fs');
  const path = await import('node:path');
  const floorModule = await import('../src/floor-slots.js');
  const schedulerModule = await import('../src/vip-podium-scheduler.js');
  const loungeModule = await import('../src/vip-lounge-manager.js');
  const eventModule = await import('../src/live-event-handler.js');
  const avatarCoordModule = await import('../src/avatar-coordinator.js');
  const giftPropsModule = await import('../src/gift-props.js');
  const sceneModule = await import('../src/scene-manager.js');
  const cinematicModule = await import('../src/cinematic-showcase.js');
  const configModule = await import('../src/cinematic-config.js');
  const clubEnvModule = await import('../src/club-environment.js');
  const mainModule = await import('../src/main.js');

  const testCases = [
    {
      name: 'test_floor_slots_module_exports_and_slot_generation',
      fn: () => {
        const { generateDanceFloorSlots, findRandomAvailableFloorSlot, BASE_AVATAR_SCALE, VIP_TOP1_SLOT, VIP_TOP2_SLOT, VIP_STAGE_SLOTS } = floorModule;
        assert.strictEqual(BASE_AVATAR_SCALE, 0.52);
        assert.strictEqual(VIP_TOP1_SLOT.x, -5.4);
        assert.strictEqual(VIP_TOP2_SLOT.x, 5.4);
        assert.strictEqual(VIP_STAGE_SLOTS.length, 2);

        const slots = generateDanceFloorSlots();
        assert.ok(slots.length > 20, 'Floor slots must be generated');
        for (const slot of slots) {
          assert.ok(slot.z > -9.5, `Slot z (${slot.z}) must not collide with back wall / DJ booth (z <= -9.5)`);
        }

        const mockMeshes = new Map();
        mockMeshes.set('u1', { userData: { floorSlotIdx: 0, isVipLounge: false } });
        mockMeshes.set('u2', { userData: { floorSlotIdx: 1, isVipLounge: false } });

        const picked = findRandomAvailableFloorSlot(slots, mockMeshes);
        assert.ok(picked.idx !== 0 && picked.idx !== 1, 'Picked index must be unoccupied');
      }
    },
    {
      name: 'test_vip_podium_scheduler_class_isolation',
      fn: () => {
        const { VipPodiumScheduler } = schedulerModule;
        const scheduler = new VipPodiumScheduler({ duration: 10.0 });
        const mockMesh = { position: { x: 0, y: 0, z: 0, copy: function (p) { Object.assign(this, p); } }, userData: {} };
        const user = { id: 'test_whale_1', username: 'Whale1' };

        scheduler.enqueue(user, mockMesh, 3, { x: 1, y: 0, z: 1 });
        assert.ok(scheduler.activeWhale);
        assert.strictEqual(scheduler.activeWhale.user.id, 'test_whale_1');

        scheduler.update(12.0);
        assert.strictEqual(scheduler.activeWhale, null, 'Podium should vacate after tenure');
      }
    },
    {
      name: 'test_vip_lounge_manager_state_and_swapping',
      fn: () => {
        const { VipLoungeManager } = loungeModule;
        const mgr = new VipLoungeManager();
        assert.strictEqual(mgr.getCurrentTop1(), null);
        assert.strictEqual(mgr.getCurrentTop2(), null);

        const mockMesh1 = { position: { x: 0, y: 0, z: 0, clone: () => ({ x: 0, y: 0, z: 0 }), copy: () => {} }, rotation: { y: 0 }, userData: { floorSlot: { clone: () => ({ x: 0, y: 0, z: 0 }) } } };
        const mockMesh2 = { position: { x: 1, y: 0, z: 1, clone: () => ({ x: 1, y: 0, z: 1 }), copy: () => {} }, rotation: { y: 0 }, userData: { floorSlot: { clone: () => ({ x: 1, y: 0, z: 1 }) } } };

        const avatarMeshes = new Map([
          ['101', mockMesh1],
          ['102', mockMesh2]
        ]);
        const userCoinsMap = new Map([
          ['101', { totalCoins: 1000 }],
          ['102', { totalCoins: 500 }]
        ]);

        mgr.executeVipPromotionAndSwap({
          sortedDonors: [{ userId: '101', totalCoins: 1000 }, { userId: '102', totalCoins: 500 }],
          avatarMeshes,
          userCoinsMap,
          floorSlots: [{ x: 0, y: 0, z: 0 }]
        });

        assert.strictEqual(mgr.getCurrentTop1(), '101');
        assert.strictEqual(mgr.getCurrentTop2(), '102');
        assert.strictEqual(mockMesh1.userData.isVipLounge, true);
        assert.strictEqual(mockMesh2.userData.isVipLounge, true);

        mgr.removeUser('101');
        assert.strictEqual(mgr.getCurrentTop1(), null);
        assert.strictEqual(mgr.getCurrentTop2(), '102');

        mgr.clear();
        assert.strictEqual(mgr.getCurrentTop1(), null);
        assert.strictEqual(mgr.getCurrentTop2(), null);
      }
    },
    {
      name: 'test_leap_animation_physics_progress_and_completion',
      fn: () => {
        const { triggerLeapAnimation, updateLeapAnimation } = loungeModule;
        let completed = false;
        const mesh = {
          position: {
            x: 0,
            y: 0,
            z: 0,
            clone: function () { return { x: this.x, y: this.y, z: this.z }; },
            set: function (x, y, z) { this.x = x; this.y = y; this.z = z; },
            copy: function (p) { this.x = p.x; this.y = p.y; this.z = p.z; }
          },
          rotation: { y: 0 },
          userData: {}
        };

        const targetPos = { x: 5, y: 0.5, z: 5, clone: () => ({ x: 5, y: 0.5, z: 5 }) };
        triggerLeapAnimation(mesh, targetPos, Math.PI, () => {
          completed = true;
        });

        assert.ok(mesh.userData.leapAnimation, 'Leap animation state must be attached');
        const duration = mesh.userData.leapAnimation.duration;

        // Advance 50%
        updateLeapAnimation(mesh, duration * 0.5);
        assert.ok(mesh.position.y > 1.5, 'Apex of jump should elevate above floor');
        assert.strictEqual(completed, false);

        // Advance to 100%
        updateLeapAnimation(mesh, duration * 0.6);
        assert.strictEqual(completed, true, 'Leap animation onComplete should fire upon landing');
        assert.strictEqual(mesh.userData.leapAnimation, null, 'Leap state should clear upon landing');
      }
    },
    {
      name: 'test_gift_tier_and_category_resolution',
      fn: () => {
        const { resolveGiftCategory, calculateSlimeTier } = eventModule;

        assert.strictEqual(resolveGiftCategory(10), 'small');
        assert.strictEqual(resolveGiftCategory(50), 'medium');
        assert.strictEqual(resolveGiftCategory(500), 'high');
        assert.strictEqual(resolveGiftCategory(6000), 'ultra');

        assert.strictEqual(calculateSlimeTier(10), 1);
        assert.strictEqual(calculateSlimeTier(20), 2);
        assert.strictEqual(calculateSlimeTier(500), 3);
        assert.strictEqual(calculateSlimeTier(3000), 4);
        assert.strictEqual(calculateSlimeTier(6000), 5);
      }
    },
    {
      name: 'test_live_event_dispatcher_routing',
      fn: () => {
        const { handleLiveEvent } = eventModule;

        let likeEmitted = false;
        let hypeAdded = 0;
        let alertShown = false;

        const mockContext = {
          clubEnvironment: {
            emitFlyingHearts: () => { likeEmitted = true; },
            focusSpotlights: () => {},
            triggerGiftProp: () => {},
            spawnDroppingCoins: () => {}
          },
          uiOverlay: {
            addHype: (h) => { hypeAdded += h; },
            showGiftAlert: () => { alertShown = true; },
            updateLeaderboard: () => {}
          },
          userCoinsMap: new Map(),
          getOrCreateAvatarMesh: () => ({
            position: { clone: () => ({ x: 0, y: 0, z: 0 }) },
            userData: {}
          }),
          audioSystem: { playSfx: () => {} },
          executeVipPromotionAndSwap: () => {}
        };

        handleLiveEvent({ type: 'like', data: { count: 5 } }, mockContext);
        assert.strictEqual(likeEmitted, true);
        assert.strictEqual(hypeAdded, 5);

        handleLiveEvent({
          type: 'gift',
          user: { id: 'g1', username: 'Gifter1' },
          data: { totalCoins: 10, giftName: 'Rose' }
        }, mockContext);
        assert.strictEqual(alertShown, true);
        assert.strictEqual(hypeAdded, 15);
      }
    },
    {
      name: 'test_avatar_coordinator_sync_and_kinematics',
      fn: () => {
        const { syncActiveFloorAvatars, updateAvatarKinematics } = avatarCoordModule;

        let updatedAvatars = null;
        let wsSent = null;

        const mockOverlay = {
          updateActiveAvatars: (list) => { updatedAvatars = list; }
        };
        const mockWs = {
          readyState: 1, // WebSocket.OPEN
          send: (data) => { wsSent = data; }
        };

        const mockMeshes = new Map([
          ['usr_1', { userData: { username: 'One', level: 'Lv.5', colorKey: 'yellow', donateRank: '👑 TOP 1' } }]
        ]);

        syncActiveFloorAvatars(mockMeshes, mockOverlay, mockWs);
        assert.ok(Array.isArray(updatedAvatars));
        assert.strictEqual(updatedAvatars.length, 1);
        assert.strictEqual(updatedAvatars[0].username, 'One');
        assert.strictEqual(updatedAvatars[0].color, 'yellow');
        assert.ok(wsSent && wsSent.includes('sync_avatars'));

        // Test updateAvatarKinematics without errors on controller mesh
        let controllerUpdated = false;
        const cyberSlimeMesh = {
          position: { y: 0, set: () => {} },
          rotation: { y: 0 },
          scale: { setScalar: () => {} },
          userData: {
            currentScale: 1,
            targetScale: 1,
            controller: {
              update: () => { controllerUpdated = true; }
            }
          }
        };

        updateAvatarKinematics(cyberSlimeMesh, 0.016, 1.0, 13.4, 1.0, { bassFlux: 0.2 }, { position: { x: 0, y: 5, z: 10 } });
        assert.strictEqual(controllerUpdated, true, 'CyberSlime controller update must be triggered');
      }
    },
    {
      name: 'test_main_module_backward_compatible_exports',
      fn: () => {
        const {
          BASE_AVATAR_SCALE,
          VIP_TOP1_SLOT,
          VIP_TOP2_SLOT,
          VIP_STAGE_SLOTS,
          generateDanceFloorSlots,
          VipPodiumScheduler,
          VipLoungeManager,
          triggerLeapAnimation,
          handleLiveEvent,
          initClientApp
        } = mainModule;

        assert.ok(BASE_AVATAR_SCALE, 'BASE_AVATAR_SCALE must be exported from main.js');
        assert.ok(VIP_TOP1_SLOT, 'VIP_TOP1_SLOT must be exported from main.js');
        assert.ok(VIP_TOP2_SLOT, 'VIP_TOP2_SLOT must be exported from main.js');
        assert.ok(VIP_STAGE_SLOTS, 'VIP_STAGE_SLOTS must be exported from main.js');
        assert.strictEqual(typeof generateDanceFloorSlots, 'function', 'generateDanceFloorSlots must be exported from main.js');
        assert.strictEqual(typeof VipPodiumScheduler, 'function', 'VipPodiumScheduler must be exported from main.js');
        assert.strictEqual(typeof VipLoungeManager, 'function', 'VipLoungeManager must be exported from main.js');
        assert.strictEqual(typeof triggerLeapAnimation, 'function', 'triggerLeapAnimation must be exported from main.js');
        assert.strictEqual(typeof handleLiveEvent, 'function', 'handleLiveEvent must be exported from main.js');
        assert.strictEqual(typeof initClientApp, 'function', 'initClientApp must be exported from main.js');
      }
    },
    {
      name: 'test_admin_commands_billboard_scale_level_rank_and_crowd_sim',
      fn: () => {
        const { handleAdminCommand } = eventModule;

        let scaleValue = null;
        let tiktokLevel = null;
        let donateRank = null;
        let syncCalled = false;

        const mockMesh = {
          userData: {
            controller: {
              setBillboardScale: (val) => { scaleValue = val; },
              setTikTokLevel: (lvl) => { tiktokLevel = lvl; },
              setDonateRank: (rnk) => { donateRank = rnk; }
            }
          }
        };

        const avatarMeshes = new Map([
          ['user_1', mockMesh],
          ['user_2', { userData: { controller: { setTikTokLevel: () => {}, setDonateRank: () => {} } } }]
        ]);

        const context = {
          avatarMeshes,
          syncActiveFloorAvatars: () => { syncCalled = true; }
        };

        // 1. set_billboard_scale
        handleAdminCommand({ command: 'set_billboard_scale', value: 1.75 }, context);
        assert.strictEqual(scaleValue, 1.75, 'Billboard scale should be set on mesh controller');
        assert.strictEqual(context.currentBillboardScale, 1.75, 'Current billboard scale should be cached on context');

        // 2. set_avatar_level
        handleAdminCommand({ command: 'set_avatar_level', userId: 'user_1', level: 45 }, context);
        assert.strictEqual(tiktokLevel, 45, 'Avatar level should be updated');
        assert.strictEqual(syncCalled, true);

        // 3. set_avatar_rank
        handleAdminCommand({ command: 'set_avatar_rank', userId: 'user_1', rank: '👑 TOP 1' }, context);
        assert.strictEqual(donateRank, '👑 TOP 1', 'Avatar rank should be updated');

        // 4. simulate_crowd_ranks
        let crowdTop1Rank = null;
        avatarMeshes.get('user_1').userData.controller.setDonateRank = (rnk) => { crowdTop1Rank = rnk; };
        handleAdminCommand({ command: 'simulate_crowd_ranks' }, context);
        assert.strictEqual(crowdTop1Rank, '👑 TOP 1');

        // 5. clear_crowd_ranks
        let clearedRank = 'dummy';
        avatarMeshes.get('user_1').userData.controller.setDonateRank = (rnk) => { clearedRank = rnk; };
        handleAdminCommand({ command: 'clear_crowd_ranks' }, context);
        assert.strictEqual(clearedRank, null);

        // 6. set_auto_tier_up
        handleAdminCommand({ command: 'set_auto_tier_up', value: true }, context);
        assert.strictEqual(context.autoTierUpOnDonate, true);
      }
    },
    {
      name: 'test_donate_gifts_complete_catalog_and_categories',
      fn: () => {
        const { DONATE_GIFTS } = giftPropsModule;
        assert.ok(DONATE_GIFTS, 'DONATE_GIFTS must be exported from gift-props.js');

        const keys = Object.keys(DONATE_GIFTS);
        assert.ok(keys.length >= 24, `Expected at least 24 gifts in catalog, got ${keys.length}`);

        const categories = { small: 0, medium: 0, high: 0, ultra: 0 };
        for (const k of keys) {
          const g = DONATE_GIFTS[k];
          assert.ok(g.name, `Gift ${k} must have a name`);
          assert.ok(g.coins > 0, `Gift ${k} must have positive coins`);
          assert.ok(g.tier >= 1 && g.tier <= 5, `Gift ${k} tier must be 1-5`);
          assert.ok(categories[g.cat] !== undefined, `Gift ${k} category ${g.cat} must be valid`);
          categories[g.cat]++;
        }

        assert.ok(categories.small >= 7, 'Small category should have >= 7 gifts');
        assert.ok(categories.medium >= 5, 'Medium category should have >= 5 gifts');
        assert.ok(categories.high >= 12, 'High category should have 12 gifts');
        assert.ok(categories.ultra >= 7, 'Ultra category should have 7 gifts');

        // Check specific high and ultra gifts
        assert.strictEqual(DONATE_GIFTS.money_gun.coins, 500);
        assert.strictEqual(DONATE_GIFTS.galaxy.coins, 1000);
        assert.strictEqual(DONATE_GIFTS.whale_diving.coins, 2150);
        assert.strictEqual(DONATE_GIFTS.private_jet.coins, 4888);
        assert.strictEqual(DONATE_GIFTS.diamond_gun.coins, 5000);

        assert.strictEqual(DONATE_GIFTS.jet.coins, 6000);
        assert.strictEqual(DONATE_GIFTS.panther.coins, 10000);
        assert.strictEqual(DONATE_GIFTS.phoenix.coins, 25999);
        assert.strictEqual(DONATE_GIFTS.tiger.coins, 26999);
        assert.strictEqual(DONATE_GIFTS.lion.coins, 29999);
        assert.strictEqual(DONATE_GIFTS.pegasus.coins, 34000);
        assert.strictEqual(DONATE_GIFTS.universe.coins, 44999);
      }
    },
    {
      name: 'test_donation_effects_subtypes_and_tier_up_separation',
      fn: () => {
        const { handleGiftEvent } = eventModule;

        let lastAnimationConfig = null;
        let lastUpgradeTier = null;
        let lastTargetTier = null;
        let spawnedProp = null;
        let audioSfx = [];

        const mockMesh = {
          position: { clone: () => ({ x: 0, y: 0, z: 0, clone: () => ({ x: 0, y: 0, z: 0 }) }) },
          userData: {
            controller: {
              state: { tier: 1 },
              updateBillboard: () => {},
              triggerDonateAnimation: (cfg, upgrade, tier, coins) => {
                lastAnimationConfig = typeof cfg === 'object' ? cfg : { type: cfg };
                lastUpgradeTier = typeof cfg === 'object' ? Boolean(cfg.upgradeTier) : Boolean(upgrade);
                lastTargetTier = typeof cfg === 'object' ? cfg.targetTier : tier;
              }
            }
          }
        };

        const context = {
          userCoinsMap: new Map(),
          uiOverlay: {
            showGiftAlert: () => {},
            updateLeaderboard: () => {},
            addHype: () => {}
          },
          audioSystem: {
            playSfx: (name) => { audioSfx.push(name); }
          },
          clubEnvironment: {
            triggerGiftProp: (key) => { spawnedProp = key; },
            spawnDroppingCoins: () => {},
            spawnOrbitingCoinRings: () => {},
            triggerFireworks: () => {},
            focusSpotlights: () => {}
          },
          getOrCreateAvatarMesh: () => mockMesh,
          executeVipPromotionAndSwap: () => {}
        };

        // 1. Small gift (1 coin) with forceTierUp = false: should trigger drop_single without shape upgrade
        handleGiftEvent({
          type: 'gift',
          user: { id: 'u_small', username: 'SmallDonor' },
          data: { totalCoins: 1, giftName: 'Rose', giftKey: 'rose', forceTierUp: false }
        }, context);

        assert.strictEqual(lastAnimationConfig.subType, 'drop_single');
        assert.strictEqual(lastUpgradeTier, false, 'Shape should not upgrade when forceTierUp is false');

        // 2. Medium gift (100 coins) with forceTierUp = true: should trigger orbit_triple with tier upgrade
        handleGiftEvent({
          type: 'gift',
          user: { id: 'u_med', username: 'MedDonor' },
          data: { totalCoins: 100, giftName: 'Rainbow', giftKey: 'rainbow', forceTierUp: true }
        }, context);

        assert.strictEqual(lastAnimationConfig.subType, 'orbit_triple');
        assert.strictEqual(lastUpgradeTier, true, 'Shape should upgrade when forceTierUp is true');
        assert.strictEqual(lastTargetTier, 2);

        // 3. Medium gift (50 coins) should trigger orbit_double
        handleGiftEvent({
          type: 'gift',
          user: { id: 'u_med2', username: 'MedDonor2' },
          data: { totalCoins: 50, giftName: 'Sunscreen', giftKey: 'sunscreen', forceTierUp: false }
        }, context);

        assert.strictEqual(lastAnimationConfig.subType, 'orbit_double');
        assert.strictEqual(lastUpgradeTier, false);
      }
    },
    {
      name: 'test_admin_cockpit_html_elements_sync',
      fn: () => {
        const adminHtmlPath = path.resolve('src/admin.html');
        const content = fs.readFileSync(adminHtmlPath, 'utf-8');

        assert.ok(content.includes('id="billboard-scale-slider"'), 'billboard scale slider must exist');
        assert.ok(content.includes('id="hero-lvl-slider"'), 'avatar level slider must exist');
        assert.ok(content.includes('class="btn rank-test-btn'), 'rank test buttons must exist');
        assert.ok(content.includes('id="btn-crowd-rank-sim"'), 'crowd rank simulation button must exist');
        assert.ok(content.includes('id="btn-crowd-clear-rank"'), 'crowd rank clear button must exist');
        assert.ok(content.includes('id="toggle-tier-up"'), 'toggle tier up checkbox must exist');

        const donateBtnMatches = content.match(/class="donate-btn"/g);
        assert.ok(donateBtnMatches && donateBtnMatches.length >= 24, `Expected at least 24 donate buttons in admin cockpit, got ${donateBtnMatches ? donateBtnMatches.length : 0}`);

        assert.ok(content.includes('data-gift="money_gun"'), 'money_gun gift button must exist');
        assert.ok(content.includes('data-gift="whale_diving"'), 'whale_diving gift button must exist');
        assert.ok(content.includes('data-gift="private_jet"'), 'private_jet gift button must exist');
        assert.ok(content.includes('data-gift="diamond_gun"'), 'diamond_gun gift button must exist');
        assert.ok(content.includes('data-gift="universe"'), 'universe gift button must exist');
      }
    },
    {
      name: 'test_cinematic_showcase_high_and_ultra_integration',
      fn: () => {
        const { handleGiftEvent } = eventModule;

        let showcasePayload = null;
        const mockMesh = {
          position: { clone: () => ({ x: 0, y: 0, z: 0, clone: () => ({ x: 0, y: 0, z: 0 }) }) },
          userData: {
            username: 'WhaleKing',
            nickname: 'Đại Gia Bình Dương',
            controller: {
              state: { tier: 3 },
              updateBillboard: () => {},
              triggerDonateAnimation: () => {}
            }
          }
        };

        const context = {
          userCoinsMap: new Map(),
          uiOverlay: {
            showGiftAlert: () => {},
            updateLeaderboard: () => {},
            addHype: () => {},
            triggerFrenzyMode: () => {}
          },
          clubEnvironment: {
            focusSpotlights: () => {},
            spawnDroppingCoins: () => {},
            spawnOrbitingCoinRings: () => {},
            triggerFireworks: () => {}
          },
          getOrCreateAvatarMesh: () => mockMesh,
          executeVipPromotionAndSwap: () => {},
          enqueueHighTierShowcase: (item) => { showcasePayload = item; }
        };

        // 1. High-tier donation (Galaxy 1000 coins)
        handleGiftEvent({
          type: 'gift',
          user: { id: 'u_galaxy', username: 'WhaleKing' },
          data: { totalCoins: 1000, giftName: 'Vũ trụ Galaxy', giftKey: 'galaxy', forceTierUp: false }
        }, context);

        assert.ok(showcasePayload, 'Showcase payload must be enqueued for high-tier gift');
        assert.strictEqual(showcasePayload.gift.key, 'galaxy');
        assert.strictEqual(showcasePayload.gift.coins, 1000);
        assert.strictEqual(showcasePayload.shouldUpgradeTier, false);

        // 2. Ultra-tier donation (Lion 29999 coins)
        showcasePayload = null;
        handleGiftEvent({
          type: 'gift',
          user: { id: 'u_lion', username: 'WhaleKing' },
          data: { totalCoins: 29999, giftName: 'Sư tử', giftKey: 'lion', forceTierUp: true }
        }, context);

        assert.ok(showcasePayload, 'Showcase payload must be enqueued for ultra-tier gift');
        assert.strictEqual(showcasePayload.gift.key, 'lion');
        assert.strictEqual(showcasePayload.gift.coins, 29999);
        assert.strictEqual(showcasePayload.shouldUpgradeTier, true);

        // 3. Verify src/index.html contains Cinematic 2D + 3D Overlay DOM elements
        const indexHtml = fs.readFileSync(path.resolve('src/index.html'), 'utf-8');
        assert.ok(indexHtml.includes('id="cinematic-overlay"'), 'cinematic-overlay must exist in src/index.html');
        assert.ok(indexHtml.includes('id="cinematic-stage"'), 'cinematic-stage must exist in src/index.html');
        assert.ok(indexHtml.includes('id="cinematic-fx-canvas"'), 'cinematic-fx-canvas must exist in src/index.html');
        assert.ok(indexHtml.includes('id="cinematic-slime-canvas"'), 'cinematic-slime-canvas must exist in src/index.html');

        // 4. Verify src/style.css contains Cinematic CSS classes
        const styleCss = fs.readFileSync(path.resolve('src/style.css'), 'utf-8');
        assert.ok(styleCss.includes('#cinematic-overlay'), '#cinematic-overlay must be styled in src/style.css');
        assert.ok(styleCss.includes('.cinematic-stage.tier-lion'), 'tier-lion style must exist in src/style.css');
        assert.ok(styleCss.includes('.cinematic-stage.tier-universe'), 'tier-universe style must exist in src/style.css');
      }
    },
    {
      name: 'test_camera_glide_freeze_and_revert_cinematic',
      fn: () => {
        const { SceneManager } = sceneModule;
        const { initCinematicShowcase, isCinematicFreezeActive } = cinematicModule;

        const sm = new SceneManager({ clientWidth: 1280, clientHeight: 720 });
        sm.setCameraPreset('orbit');
        sm.setOrbitRadius(12.0);

        assert.strictEqual(sm.currentPresetKey, 'orbit');
        assert.strictEqual(sm.orbitRadius, 12.0);

        const slimePos = { x: 3.5, y: 0.5, z: -2.0 };
        let arrivedTriggered = false;

        // 1. Camera glides towards slime position
        sm.focusSlimeCinematic(slimePos, () => {
          arrivedTriggered = true;
        }, 0.05);

        assert.strictEqual(sm._cinematicFocusActive, true);
        assert.strictEqual(sm._donateShowcaseActive, true);
        assert.strictEqual(sm.camera.fov, 56, 'Cinematic focal zoom should match CINEMATIC_CONFIG.camera.fov');
        assert.ok(Math.abs(sm.camLookTarget.x - slimePos.x) < 0.01);
        assert.ok(Math.abs(sm.camLookTarget.z - slimePos.z) < 0.01);

        // 2. Camera returns to original distance and preset upon revert
        sm.revertFromCinematic();
        assert.strictEqual(sm._cinematicFocusActive, false);
        assert.strictEqual(sm._donateShowcaseActive, false);
        assert.strictEqual(sm.currentPresetKey, 'orbit');
        assert.strictEqual(sm.orbitRadius, 12.0);

        // 3. Verify freeze state export and initialization
        assert.strictEqual(typeof isCinematicFreezeActive, 'boolean');
        assert.strictEqual(typeof initCinematicShowcase, 'function');
      }
    },
    {
      name: 'test_cinematic_config_relative_coin_drop_and_soft_lighting',
      fn: () => {
        const { CINEMATIC_CONFIG } = configModule;
        const { ClubEnvironment } = clubEnvModule;

        // 1. Validate CINEMATIC_CONFIG structure
        assert.ok(CINEMATIC_CONFIG.camera, 'CINEMATIC_CONFIG.camera must exist');
        assert.strictEqual(CINEMATIC_CONFIG.camera.fov, 56);
        assert.strictEqual(CINEMATIC_CONFIG.lightingHigh.spotlightIntensity, 2.8);
        assert.strictEqual(CINEMATIC_CONFIG.lightingUltra.spotlightIntensity, 2.2);
        assert.strictEqual(CINEMATIC_CONFIG.coinDynamics.gravity, 12.0);

        // 2. Test relative getSlimeMetrics calculations
        const mockScene = { add: () => {}, remove: () => {} };
        const env = new ClubEnvironment(mockScene);

        const dummyAvatar = {
          currentScale: 1.5,
          mesh: {
            scale: { y: 0.52 },
            position: { x: 2.0, y: 0.5, z: -1.0 },
            getWorldPosition: (v) => v.set(2.0, 0.5, -1.0),
            userData: {
              currentScale: 1.5,
              isSuperBounce: true
            }
          }
        };

        const metrics = env.getSlimeMetrics(dummyAvatar);
        assert.strictEqual(metrics.origin.x, 2.0);
        assert.strictEqual(metrics.origin.y, 0.5);
        assert.ok(metrics.height > 0.6, `Calculated slime height (${metrics.height}) must be dynamic`);
        assert.ok(metrics.apexY > metrics.origin.y + metrics.height, 'Apex Y must be elevated above slime');

        // 3. Validate relative coin drop spawning and frustum culling
        assert.strictEqual(env.droppingCoinsMesh.frustumCulled, false, 'Dropping coins mesh must have frustumCulled = false');
        const activeBefore = env.droppingCoinsData.filter(c => c.active).length;
        env.spawnDroppingCoins(metrics.origin, 5, 'drop_cascade', dummyAvatar);
        const activeAfter = env.droppingCoinsData.filter(c => c.active).length;
        assert.strictEqual(activeAfter - activeBefore, 5, '5 cascading coins must be spawned and active');

        // 4. Validate lighting intensity reduction in focusSpotlights
        env.focusSpotlights('high', metrics.origin);
        for (let i = 0; i < Math.min(6, env.movingHeads.length); i++) {
          assert.strictEqual(env.movingHeads[i].spot.intensity, CINEMATIC_CONFIG.lightingHigh.spotlightIntensity);
        }

        env.focusSpotlights('ultra', metrics.origin);
        for (let i = 0; i < env.movingHeads.length; i++) {
          assert.strictEqual(env.movingHeads[i].spot.intensity, CINEMATIC_CONFIG.lightingUltra.spotlightIntensity);
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
