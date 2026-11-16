// src/main.js - Application entrypoint coordinating WebGL, WebSocket hub, avatars, and audio
import * as THREE from 'three';
import { graphicsSettings } from './graphics-settings.js';
import { SceneManager } from './scene-manager.js';
import { ClubEnvironment, FLOOR_GRID_CONFIG } from './club-environment.js';
import { AudioSystem, unlockAudio } from './audio-system.js';
import { AvatarOccupancyManager } from './avatar-manager.js';
import { UiOverlay } from './ui-overlay.js';
import { evaluateEquipment, saveThresholds } from './equipment-config.js';
import {
  MAIN_STREAM_CONFIG,
  MAIN_RENDER_CONFIG,
  MAIN_VIP_PODIUM_CONFIG,
  MAIN_OCCUPANCY_CONFIG,
  MAIN_NETWORK_CONFIG,
  MAIN_DOM_IDS,
  MAIN_EVENT_NAMES
} from './main-constants.js';

// Main stream configuration exports
export {
  MAIN_STREAM_CONFIG,
  MAIN_RENDER_CONFIG,
  MAIN_VIP_PODIUM_CONFIG,
  MAIN_OCCUPANCY_CONFIG,
  MAIN_NETWORK_CONFIG,
  MAIN_DOM_IDS,
  MAIN_EVENT_NAMES
};

// Floor slots & spatial layout exports
export {
  BASE_AVATAR_SCALE,
  VIP_TOP1_SLOT,
  VIP_TOP2_SLOT,
  VIP_STAGE_SLOTS,
  generateDanceFloorSlots,
  findRandomAvailableFloorSlot
} from './floor-slots.js';

// VIP Scheduler exports
export { VipPodiumScheduler } from './vip-podium-scheduler.js';

// VIP Lounge & Leap Animation exports
export {
  VipLoungeManager,
  triggerLeapAnimation,
  updateLeapAnimation
} from './vip-lounge-manager.js';

// Live Event Handler exports
export {
  handleLiveEvent,
  handleLikeEvent,
  handleChatEvent,
  handleGiftEvent,
  handleAdminCommand,
  resolveGiftCategory,
  calculateSlimeTier
} from './live-event-handler.js';

// Avatar Coordination exports
export {
  getOrCreateAvatarMesh,
  deleteAvatar,
  clearAllAvatars,
  syncActiveFloorAvatars,
  updateAvatarKinematics,
  computeSharedDanceFrame
} from './avatar-coordinator.js';

import { generateDanceFloorSlots } from './floor-slots.js';
import { VipPodiumScheduler } from './vip-podium-scheduler.js';
import { VipLoungeManager, triggerLeapAnimation } from './vip-lounge-manager.js';
import { handleLiveEvent } from './live-event-handler.js';
import { initCinematicShowcase, enqueueHighTierShowcase, isCinematicFreezeActive } from './cinematic-showcase.js';
import { initDonationQueue, enqueueDonation } from './donation-queue.js';
import { minigameManager } from './minigame-manager.js';
import {
  getOrCreateAvatarMesh as createAvatarHelper,
  deleteAvatar as deleteAvatarHelper,
  sinkAndRemoveAvatar as sinkAvatarHelper,
  clearAllAvatars as clearAllAvatarsHelper,
  syncActiveFloorAvatars as syncAvatarsHelper,
  updateAvatarKinematics,
  computeSharedDanceFrame,
  revealAvatarsForZoomOut
} from './avatar-coordinator.js';

// Auto-run in browser runtime
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  initClientApp();
}

/**
 * Initializes the main 3D WebGL bar client application.
 */
export function initClientApp() {
  const container = document.getElementById(MAIN_DOM_IDS.CANVAS_CONTAINER);
  const sceneManager = new SceneManager(container);
  const clubEnvironment = new ClubEnvironment(sceneManager.scene);
  const audioSystem = new AudioSystem();
  const occupancyManager = new AvatarOccupancyManager({
    maxCapacity: MAIN_OCCUPANCY_CONFIG.MAX_CAPACITY,
    disableAutoCull: MAIN_OCCUPANCY_CONFIG.DISABLE_AUTO_CULL
  });
  const vipScheduler = new VipPodiumScheduler({
    duration: MAIN_VIP_PODIUM_CONFIG.DURATION_SECONDS,
    podiumPos: MAIN_VIP_PODIUM_CONFIG.PODIUM_POSITION,
    preserveDonorPosition: MAIN_VIP_PODIUM_CONFIG.PRESERVE_DONOR_POSITION
  });
  const vipLoungeManager = new VipLoungeManager();

  // Active avatar meshes: userId -> THREE.Group
  const avatarMeshes = new Map();
  // Cumulative Coins for Top Donors Leaderboard: userId -> { userId, username, nickname, avatarUrl, totalCoins }
  const userCoinsMap = new Map();
  // Dance floor slot grid positions
  const floorSlots = generateDanceFloorSlots(FLOOR_GRID_CONFIG);

  // Setup WebSocket Connection
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}${MAIN_NETWORK_CONFIG.WS_ENDPOINT_PATH}`;
  const ws = new WebSocket(wsUrl);

  const uiOverlay = new UiOverlay({
    ws,
    audioSystem,
    sceneManager,
    clubEnvironment
  });

  // Initialize Fullscreen Cinematic 2D + 3D Showcase (High-Tier & Ultra Gifts >= 500 coins)
  initCinematicShowcase({
    camera: sceneManager.camera,
    sceneManager,
    activeAvatars: avatarMeshes,
    minigameManager,
    clearFloorEffects: () => {}
  });

  // Initialize Unified Sequential Donation Queue (Small, Medium, High, Ultra)
  initDonationQueue({
    sceneManager,
    clubEnvironment,
    audioSystem,
    uiOverlay,
    avatarMeshes
  });

  // Initialize Minigame Slime Survival Manager
  minigameManager.init({
    scene: sceneManager.scene,
    sceneManager,
    clubEnvironment,
    avatarMeshes,
    ws,
    audioSystem,
    uiOverlay
  });

  // Safety hook: Ensure avatars and billboards are restored if camera reverts from any source
  sceneManager.onRevertFromCinematic = () => {
    revealAvatarsForZoomOut(avatarMeshes, { animateBloom: true, billboardDelayMs: 400 });
  };

  // Audio unlock triggers on first user interaction
  window.addEventListener('click', () => unlockAudio(audioSystem), { once: true });
  window.addEventListener('keydown', () => unlockAudio(audioSystem), { once: true });

  // Bound context for avatar coordinator and live event handler
  const appCtx = {
    avatarMeshes,
    occupancyManager,
    userCoinsMap,
    floorSlots,
    sceneManager,
    clubEnvironment,
    audioSystem,
    uiOverlay,
    vipScheduler,
    vipLoungeManager,
    ws,
    minigameManager,
    enqueueDonation,
    enqueueHighTierShowcase,
    getOrCreateAvatarMesh: (userData, coins = 0) => createAvatarHelper(userData, coins, appCtx),
    deleteAvatar: (userId) => deleteAvatarHelper(userId, appCtx),
    sinkAndRemoveAvatar: (userId) => sinkAvatarHelper(userId, appCtx),
    clearAllAvatars: () => clearAllAvatarsHelper(appCtx),
    syncActiveFloorAvatars: () => syncAvatarsHelper(avatarMeshes, uiOverlay, ws),
    executeVipPromotionAndSwap: (sortedDonors) => vipLoungeManager.executeVipPromotionAndSwap({
      sortedDonors,
      avatarMeshes,
      userCoinsMap,
      floorSlots
    })
  };

  // WebSocket message ingestion
  ws.onopen = () => {
    console.log('[WS] Connected to TikTok LIVE 3D Bar backend');
    appCtx.syncActiveFloorAvatars();
  };

  ws.onmessage = (msg) => {
    try {
      const event = JSON.parse(msg.data);
      if (event.type === 'mock_rejected') {
        console.warn('[Mock] Command rejected by throttler:', event.message);
        return;
      }
      handleLiveEvent(event, appCtx);
    } catch (err) {
      console.error('[WS] Error parsing message:', err);
    }
  };

  // Window and custom event listeners for UI & debugging
  window.addEventListener(MAIN_EVENT_NAMES.DELETE_AVATAR, (e) => {
    if (e.detail?.userId) appCtx.deleteAvatar(e.detail.userId);
  });
  window.addEventListener(MAIN_EVENT_NAMES.CLEAR_AVATARS, () => {
    appCtx.clearAllAvatars();
  });
  window.addEventListener(MAIN_EVENT_NAMES.LOCAL_LIKE, (e) => {
    handleLiveEvent({
      type: 'like',
      user: e.detail?.user,
      data: {
        likeCount: e.detail?.count || MAIN_NETWORK_CONFIG.DEFAULT_LOCAL_LIKE_COUNT,
        count: e.detail?.count || MAIN_NETWORK_CONFIG.DEFAULT_LOCAL_LIKE_COUNT
      }
    }, appCtx);
  });

  const onThresholdsUpdated = (newThresholds) => {
    saveThresholds(newThresholds);
    const sorted = Array.from(userCoinsMap.values()).sort((a, b) => b.totalCoins - a.totalCoins);
    const top1Id = sorted.length > 0 ? String(sorted[0].userId) : null;

    avatarMeshes.forEach((mesh, userId) => {
      const tracked = userCoinsMap.get(userId);
      const totalCoins = tracked?.totalCoins || 0;
      const isTop1 = top1Id === String(userId);
      const eq = evaluateEquipment(totalCoins, newThresholds, isTop1);

      if (mesh.userData?.controller) {
        mesh.userData.controller.setTier(eq.tier);
        if (mesh.userData.controller.setFootRings) {
          mesh.userData.controller.setFootRings(eq.footRings);
        }
        if (mesh.userData.controller.setBodyAura) {
          mesh.userData.controller.setBodyAura(eq.auraType);
        }
      }
    });
  };
  appCtx.onThresholdsUpdated = onThresholdsUpdated;

  window.addEventListener(MAIN_EVENT_NAMES.THRESHOLDS_UPDATED, (e) => {
    if (e.detail) onThresholdsUpdated(e.detail);
  });

  window.__DEBUG_APP = {
    avatarMeshes,
    userCoinsMap,
    getCurrentTop1: () => vipLoungeManager.getCurrentTop1(),
    getCurrentTop2: () => vipLoungeManager.getCurrentTop2()
  };

  // --- Runtime Graphics Settings Listeners ---
  graphicsSettings.addListener((key, val) => {
    if (key === 'slimeShadingKey' || key === 'all') {
      const shadingKey = graphicsSettings.settings.slimeShadingKey;
      for (const mesh of avatarMeshes.values()) {
        if (mesh.userData?.controller?.setShadingModel) {
          mesh.userData.controller.setShadingModel(shadingKey);
        }
      }
    }
  });

  // --- WebGL Render Loop with Configurable Target FPS Capping ---
  const clock = new THREE.Clock();
  let cullingTimer = 0;
  let clubTime = 0;
  let lastFrameTime = (typeof performance !== 'undefined' ? performance.now() : Date.now());

  function animate(nowTimestamp) {
    requestAnimationFrame(animate);

    const now = nowTimestamp || (typeof performance !== 'undefined' ? performance.now() : Date.now());
    const targetInterval = graphicsSettings.getFpsIntervalMs();
    if (targetInterval > 0) {
      const elapsed = now - lastFrameTime;
      if (elapsed < targetInterval - 1.5) {
        return; // Skip rendering this frame to maintain target FPS cap
      }
      lastFrameTime = now - (elapsed % targetInterval);
    } else {
      lastFrameTime = now;
    }

    const delta = Math.min(clock.getDelta(), MAIN_RENDER_CONFIG.MAX_DELTA_SECONDS);
    // Freeze 3D venue elements (lights, stage, avatar physics, VIP timers) during high-tier cinematic showcase
    const sceneDelta = isCinematicFreezeActive ? 0 : delta;
    clubTime += sceneDelta;

    // 1. Audio analysis
    const bands = audioSystem.getBands();

    // 2. Club environment (floor tiles, lights, moving heads, particles)
    clubEnvironment.update(sceneDelta, bands, sceneManager.camera);

    // 3. Sequential VIP Podium Scheduler
    vipScheduler.update(
      sceneDelta,
      (promoted) => {
        if (!sceneManager.isLionTracking) {
          sceneManager.setCameraPreset('vip', MAIN_VIP_PODIUM_CONFIG.CAMERA_SHOWCASE_DURATION_SECONDS);
        }
        clubEnvironment.triggerFireworks(promoted.tier, promoted.mesh.position);
      },
      () => {
        // Podium vacated
      }
    );

    // 4. Update avatar procedural kinematics, leaps, and billboard orientation
    const bpmSpeed = 2.0 * Math.PI * (MAIN_RENDER_CONFIG.DEFAULT_BPM / 60);
    const frenzyMultiplier = uiOverlay.isFrenzy
      ? MAIN_RENDER_CONFIG.FRENZY_SPEED_MULTIPLIER
      : MAIN_RENDER_CONFIG.NORMAL_SPEED_MULTIPLIER;

    // Batched Global Kinematics: 1 calculation per frame shared across 78+ slimes for 100% synchronicity & ~95% math CPU reduction
    const sharedKinematics = computeSharedDanceFrame(
      sceneDelta,
      clubTime,
      bpmSpeed,
      frenzyMultiplier,
      bands,
      MAIN_RENDER_CONFIG.DEFAULT_BPM
    );

    for (const mesh of avatarMeshes.values()) {
      updateAvatarKinematics(
        mesh,
        sceneDelta,
        clubTime,
        bpmSpeed,
        frenzyMultiplier,
        bands,
        sceneManager.camera,
        uiOverlay.isFrenzy,
        sharedKinematics
      );
    }

    // 5. Inactivity culling check (runs periodically every 3s, culls avatars idle > 90s)
    cullingTimer += sceneDelta;
    if (cullingTimer > MAIN_RENDER_CONFIG.CULLING_CHECK_INTERVAL_SECONDS) {
      cullingTimer = 0;
      const culledIds = occupancyManager.cullIdle();
      if (culledIds && culledIds.length > 0) {
        for (const cid of culledIds) {
          appCtx.sinkAndRemoveAvatar(cid);
        }
      }
    }

    // 6. Camera smooth interpolation (always uses real delta so camera smoothly glides to/from slime even while venue is frozen)
    sceneManager.update(delta, bands.bassFlux);
  }

  animate();
}
