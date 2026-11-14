// src/donation-queue.js - Unified Sequential FIFO Donation Celebration & Camera Zoom Queue
import { DONATION_CAMERA_CONFIG, DONATION_QUEUE_CONFIG } from './donation-constants.js';
import { DONATE_GIFTS } from './gift-props.js';
import { DONATE_CELEBRATION_CONFIG } from './animation-constants.js';
import { runCinematic2DShowcase } from './cinematic-showcase.js';
import { isolateDonationAvatar, revealAvatarsForZoomOut } from './avatar-coordinator.js';

const donationQueue = [];
let isProcessingDonation = false;
let queueContext = {};
let currentTimer = null;
let currentItem = null;

/**
 * Initializes the unified donation queue with application context.
 * @param {object} context
 */
export function initDonationQueue(context = {}) {
  queueContext = context;
}

/**
 * Returns the current queue length.
 */
export function getDonationQueueLength() {
  return donationQueue.length;
}

/**
 * Returns whether a donation is currently being showcased.
 */
export function isDonationProcessing() {
  return isProcessingDonation;
}

/**
 * Clears the queue and resets state (e.g. on session reset).
 */
export function clearDonationQueue() {
  donationQueue.length = 0;
  if (currentTimer) {
    clearTimeout(currentTimer);
    currentTimer = null;
  }
  isProcessingDonation = false;
  currentItem = null;
}

/**
 * Enqueues a donation event for sequential processing.
 * All tiers (small, medium, high, ultra) pass through this FIFO queue.
 * @param {object} item
 */
export function enqueueDonation(item) {
  if (donationQueue.length >= (DONATION_QUEUE_CONFIG.maxQueueSize || 100)) {
    donationQueue.shift();
  }
  donationQueue.push(item);
  if (!isProcessingDonation) {
    processNextDonation();
  }
}

/**
 * Backward compatibility alias for legacy high tier showcase queueing.
 */
export function enqueueHighTierShowcase(item) {
  enqueueDonation({
    avatar: item.avatar,
    gift: item.gift,
    giftKey: item.gift?.key || '',
    coins: item.gift?.coins || 500,
    category: item.gift?.cat || (item.gift?.coins >= 6000 ? 'ultra' : 'high'),
    shouldUpgradeTier: item.shouldUpgradeTier,
    newTier: item.gift?.tier || 3
  });
}

/**
 * Dequeues and processes the next donation item in sequence.
 */
export function processNextDonation() {
  if (donationQueue.length === 0) {
    isProcessingDonation = false;
    currentItem = null;
    const revertDelay = DONATION_QUEUE_CONFIG.autoRevertDelayMs || 200;
    setTimeout(() => {
      if (!isProcessingDonation && donationQueue.length === 0) {
        const avMeshes = queueContext.avatarMeshes;
        revealAvatarsForZoomOut(avMeshes, { animateBloom: true, billboardDelayMs: 400 });
        if (queueContext.sceneManager?.revertFromCinematic) {
          queueContext.sceneManager.revertFromCinematic();
        }
      }
    }, revertDelay);
    return;
  }

  isProcessingDonation = true;
  const current = donationQueue.shift();
  currentItem = current;

  const {
    avatar,
    origin: passedOrigin,
    category = 'small',
    giftKey = '',
    coins = 1,
    shouldUpgradeTier = false,
    newTier = 1,
    evt = {},
    context: itemContext
  } = current;

  const ctx = itemContext || queueContext;
  const mesh = avatar?.mesh || (avatar?.isObject3D ? avatar : null) || avatar;
  const origin = passedOrigin || (mesh?.position ? mesh.position.clone() : { x: 0, y: 0, z: 0 });

  // Phase 0: Isolate active donating hero avatar (hide other slimes and prioritize billboard)
  const activeMeshes = ctx.avatarMeshes || queueContext.avatarMeshes;
  isolateDonationAvatar(mesh, activeMeshes);

  const onTurnComplete = () => {
    currentTimer = setTimeout(() => {
      processNextDonation();
    }, DONATION_QUEUE_CONFIG.interItemDelayMs || 150);
  };

  // 1. SMALL TIER (1 - 19 coins) -> Zoom In -> Effects -> Zoom Out
  if (category === 'small') {
    const camCfg = DONATION_CAMERA_CONFIG.small;
    const zoomTravelSec = DONATION_QUEUE_CONFIG.zoomInTravelTimeSec || 0.45;
    const focusOpts = { ...camCfg, origin, zoomInTravelTimeSec: zoomTravelSec };

    const startEffectsAndHold = () => {
      // Phase 2: Trigger effects only AFTER camera has zoomed in
      _executeSmallEffects(mesh, origin, coins, shouldUpgradeTier, newTier, ctx);
      // Hold camera view for exactly small duration (1.0s)
      currentTimer = setTimeout(onTurnComplete, camCfg.duration * 1000);
    };

    // Phase 1: Zoom In towards donating slime
    if (ctx.sceneManager?.focusDonationAvatar) {
      ctx.sceneManager.focusDonationAvatar(mesh, focusOpts, startEffectsAndHold);
    } else if (ctx.sceneManager?.focusSlimeCinematic) {
      ctx.sceneManager.focusSlimeCinematic(origin, startEffectsAndHold, zoomTravelSec, mesh);
    } else {
      startEffectsAndHold();
    }

  // 2. MEDIUM TIER (20 - 499 coins) -> Zoom In -> Effects -> Zoom Out
  } else if (category === 'medium') {
    const camCfg = DONATION_CAMERA_CONFIG.medium;
    const zoomTravelSec = DONATION_QUEUE_CONFIG.zoomInTravelTimeSec || 0.45;
    const focusOpts = { ...camCfg, origin, zoomInTravelTimeSec: zoomTravelSec };

    const startEffectsAndHold = () => {
      // Phase 2: Trigger effects only AFTER camera has zoomed in
      _executeMediumEffects(mesh, origin, coins, shouldUpgradeTier, newTier, ctx);
      // Hold camera view for exactly medium duration (2.0s)
      currentTimer = setTimeout(onTurnComplete, camCfg.duration * 1000);
    };

    // Phase 1: Zoom In towards donating slime
    if (ctx.sceneManager?.focusDonationAvatar) {
      ctx.sceneManager.focusDonationAvatar(mesh, focusOpts, startEffectsAndHold);
    } else if (ctx.sceneManager?.focusSlimeCinematic) {
      ctx.sceneManager.focusSlimeCinematic(origin, startEffectsAndHold, zoomTravelSec, mesh);
    } else {
      startEffectsAndHold();
    }

  // 3. HIGH & ULTRA TIERS (>= 500 coins) -> Fullscreen 2D+3D Showcase (Giữ nguyên)
  } else {
    const giftSpec = current.gift || DONATE_GIFTS[giftKey] || {
      key: giftKey,
      name: evt?.data?.giftName || giftKey || (category === 'ultra' ? 'Ultra Gift' : 'High Tier Gift'),
      coins,
      emoji: category === 'ultra' ? '👑' : '🎁',
      cat: category,
      tier: newTier
    };

    if (category === 'ultra') {
      if (ctx.uiOverlay?.triggerFrenzyMode) ctx.uiOverlay.triggerFrenzyMode();
      if (ctx.clubEnvironment?.focusSpotlights) ctx.clubEnvironment.focusSpotlights('ultra', origin);
      if (mesh?.userData?.controller?.triggerDonateAnimation) {
        mesh.userData.controller.triggerDonateAnimation({
          type: 'high',
          subType: 'vip_celebrate',
          coins,
          duration: DONATION_CAMERA_CONFIG.ultra?.duration || 5.8,
          upgradeTier: shouldUpgradeTier,
          targetTier: newTier
        });
      }
    } else {
      if (ctx.clubEnvironment?.focusSpotlights) ctx.clubEnvironment.focusSpotlights('high', origin);
      if (mesh?.userData?.controller?.triggerDonateAnimation) {
        mesh.userData.controller.triggerDonateAnimation({
          type: 'high',
          subType: 'vip_celebrate',
          coins,
          duration: DONATION_CAMERA_CONFIG.high?.duration || 4.5,
          upgradeTier: shouldUpgradeTier,
          targetTier: newTier
        });
      }
    }

    const avatarPos = mesh?.position || { x: 0, y: 0, z: 0 };
    const showcaseItem = {
      avatar: mesh,
      gift: { ...giftSpec, key: giftKey, coins },
      shouldUpgradeTier
    };

    if (ctx.sceneManager?.focusSlimeCinematic) {
      ctx.sceneManager.focusSlimeCinematic(avatarPos, () => {
        runCinematic2DShowcase(showcaseItem, onTurnComplete);
      }, 1.0, mesh);
    } else {
      runCinematic2DShowcase(showcaseItem, onTurnComplete);
    }
  }
}

/**
 * Executes Small Tier celebration effects (Jump, dropping coins, spotlight, coin sound).
 * Preserves 100% of user-configured animation duration, jump count and coin drops.
 */
function _executeSmallEffects(mesh, origin, coins, shouldUpgradeTier, newTier, context) {
  const { clubEnvironment, audioSystem } = context;

  let subType = 'drop_single';
  let duration = DONATE_CELEBRATION_CONFIG.coin1?.duration ?? 1.0;
  let count = DONATE_CELEBRATION_CONFIG.coin1?.coinsDropped ?? 1;

  if (coins <= 1) {
    subType = 'drop_single';
    duration = DONATE_CELEBRATION_CONFIG.coin1?.duration ?? 1.0;
    count = DONATE_CELEBRATION_CONFIG.coin1?.coinsDropped ?? 1;
  } else if (coins <= 5) {
    subType = 'drop_cascade';
    duration = DONATE_CELEBRATION_CONFIG.coin5?.duration ?? 2.0;
    count = DONATE_CELEBRATION_CONFIG.coin5?.coinsDropped ?? 5;
  } else {
    subType = 'drop_burst';
    duration = DONATE_CELEBRATION_CONFIG.coin10?.duration ?? 2.0;
    count = DONATE_CELEBRATION_CONFIG.coin10?.coinsDropped ?? 10;
  }

  if (audioSystem?.playSfx) audioSystem.playSfx('coin');

  if (mesh?.userData?.controller?.triggerDonateAnimation) {
    mesh.userData.controller.triggerDonateAnimation({
      type: 'small',
      subType,
      coins,
      duration,
      upgradeTier: shouldUpgradeTier,
      targetTier: newTier
    });
  }
  if (clubEnvironment?.focusSpotlights) clubEnvironment.focusSpotlights('small', origin);
  if (clubEnvironment?.spawnDroppingCoins) clubEnvironment.spawnDroppingCoins(origin, count, subType, mesh);
}

/**
 * Executes Medium Tier celebration effects (Spin jump, orbiting rings, spotlight, bass sound, fireworks).
 * Preserves 100% of user-configured spin duration, jump styles and coin count.
 */
function _executeMediumEffects(mesh, origin, coins, shouldUpgradeTier, newTier, context) {
  const { clubEnvironment, audioSystem } = context;

  let subType = 'orbit_narrow';
  let duration = 2.0;
  if (coins >= 80) {
    subType = 'orbit_triple';
    duration = (coins >= 100) ? 4.0 : 3.5;
  } else if (coins >= 50) {
    subType = 'orbit_double';
    duration = 3.0;
  } else if (coins >= 30) {
    subType = 'orbit_trail';
    duration = 2.5;
  } else {
    subType = 'orbit_narrow';
    duration = 2.0;
  }

  if (mesh?.userData) mesh.userData.targetScale = 1.15;
  if (audioSystem?.playSfx) audioSystem.playSfx('bassBoom');

  if (mesh?.userData?.controller?.triggerDonateAnimation) {
    mesh.userData.controller.triggerDonateAnimation({
      type: 'medium',
      subType,
      coins,
      duration,
      upgradeTier: shouldUpgradeTier,
      targetTier: newTier
    });
  }
  if (clubEnvironment?.focusSpotlights) clubEnvironment.focusSpotlights('medium', origin);
  if (clubEnvironment?.spawnOrbitingCoinRings) clubEnvironment.spawnOrbitingCoinRings(mesh, coins, duration);
  if (clubEnvironment?.triggerFireworks) clubEnvironment.triggerFireworks(2, origin);
}
