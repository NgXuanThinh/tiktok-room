// src/main.js - Application entrypoint coordinating WebGL, WebSocket hub, avatars, and audio
import * as THREE from 'three';
import { SceneManager } from './scene-manager.js';
import { ClubEnvironment, FLOOR_GRID_CONFIG } from './club-environment.js';
import { AudioSystem } from './audio-system.js';
import {
  AvatarOccupancyManager,
  getDanceKinematics,
  getSlimeKinematics,
  createAvatarMesh,
  parseColorCommand,
  setSlimeColor,
  applyWhaleSlimeAesthetics,
  SLIME_COLORS,
  DANCE_STYLES
} from './avatar-manager.js';
import { unlockAudio } from './audio-system.js';
import { UiOverlay } from './ui-overlay.js';

export const BASE_AVATAR_SCALE = 0.52;

/**
 * Sequential VIP stage scheduler ensuring single whale occupancy for 15s with FIFO queuing.
 */
export class VipPodiumScheduler {
  constructor({ duration = 15.0, podiumPos = { x: 0, y: 0.55, z: 0 }, preserveDonorPosition = false } = {}) {
    this.duration = duration;
    this.podiumPos = podiumPos;
    this.preserveDonorPosition = preserveDonorPosition;
    this.activeWhale = null; // { user, mesh, tier, returnSlot, remainingTime }
    this.queue = [];
  }

  enqueue(user, mesh, tier, returnSlot) {
    // Same whale: extend current tenure by duration
    if (this.activeWhale && this.activeWhale.user.id === user.id) {
      this.activeWhale.remainingTime += this.duration;
      this.activeWhale.tier = Math.max(this.activeWhale.tier, tier);
      return;
    }

    const slotCopy = typeof returnSlot?.clone === 'function'
      ? returnSlot.clone()
      : { x: returnSlot?.x || 0, y: returnSlot?.y || 0, z: returnSlot?.z || 0 };

    const item = {
      user,
      mesh,
      tier,
      returnSlot: slotCopy,
      remainingTime: this.duration
    };

    if (!this.activeWhale) {
      this.promote(item);
    } else {
      this.queue.push(item);
    }
  }

  promote(item) {
    this.activeWhale = item;
    item.mesh.userData.isOnPodium = true;

    if (this.preserveDonorPosition) {
      // Keep whale at their position, levitating proudly above their spot
      const currentSlot = item.returnSlot || item.mesh.position;
      item.mesh.position.x = currentSlot.x;
      item.mesh.position.z = currentSlot.z;
      const baseFloorY = currentSlot.y || 0;
      const targetY = baseFloorY + (item.tier >= 4 ? 2.8 : 1.2);
      item.mesh.userData.levitateY = targetY;
      item.mesh.position.y = targetY;
    } else {
      if (typeof item.mesh.position?.copy === 'function') {
        item.mesh.position.copy(this.podiumPos);
      } else if (item.mesh.position) {
        item.mesh.position.x = this.podiumPos.x;
        item.mesh.position.y = this.podiumPos.y;
        item.mesh.position.z = this.podiumPos.z;
      }

      if (item.tier >= 4) {
        item.mesh.userData.levitateY = 3.2;
        if (item.mesh.position) item.mesh.position.y = 3.2;
      } else {
        const targetY = this.podiumPos.y !== undefined ? this.podiumPos.y : 0.55;
        item.mesh.userData.levitateY = targetY;
        if (item.mesh.position) item.mesh.position.y = targetY;
      }
    }
  }

  update(delta, onPromote = null, onVacate = null) {
    if (!this.activeWhale) return;

    this.activeWhale.remainingTime -= delta;
    if (this.activeWhale.remainingTime <= 0) {
      const demoted = this.activeWhale;
      demoted.mesh.userData.isOnPodium = false;
      demoted.mesh.userData.levitateY = 0;

      if (typeof demoted.mesh.position?.copy === 'function') {
        demoted.mesh.position.copy(demoted.returnSlot);
      } else if (demoted.mesh.position) {
        demoted.mesh.position.x = demoted.returnSlot.x;
        demoted.mesh.position.y = demoted.returnSlot.y || 0;
        demoted.mesh.position.z = demoted.returnSlot.z;
      }

      if (this.queue.length > 0) {
        const next = this.queue.shift();
        this.promote(next);
        if (typeof onPromote === 'function') onPromote(next);
      } else {
        this.activeWhale = null;
        if (typeof onVacate === 'function') onVacate(demoted);
      }
    }
  }
}

// Spatial dance floor grid slots: Generated radially from dance floor center outwards
export function generateDanceFloorSlots(config = FLOOR_GRID_CONFIG) {
  const rawTiles = [];
  const cfg = config || { rows: 12, cols: 12, tileSpacing: 1.6 };
  const halfRows = (cfg.rows - 1) / 2;
  const halfCols = (cfg.cols - 1) / 2;
  const spacing = cfg.tileSpacing || 1.6;
  const centerZ = cfg.centerZ !== undefined ? cfg.centerZ : 0;

  for (let r = 0; r < cfg.rows; r++) {
    for (let c = 0; c < cfg.cols; c++) {
      const x = (c - halfCols) * spacing;
      const z = cfg.startZ !== undefined ? (cfg.startZ + r * spacing) : ((r - halfRows) * spacing + centerZ);
      const relZ = z - centerZ;

      // Ensure no slots collide with back wall or DJ booth area behind the dance floor
      if (z <= -9.5) continue;

      // Concentric ring layer from center outward (Ring 0 = 4 center tiles, Ring 1 = 12, Ring 2 = 20, ...)
      const maxCoord = Math.max(Math.abs(x), Math.abs(relZ));
      const ring = Math.max(0, Math.round((maxCoord - 0.8) / spacing));

      // Polar angle around the center of the dance floor [0, 2*PI)
      const angle = (Math.atan2(relZ, x) + 2 * Math.PI) % (2 * Math.PI);
      const distToCenter = Math.hypot(x, relZ);

      rawTiles.push({
        pos: new THREE.Vector3(x, 0, z),
        ring,
        angle,
        distToCenter
      });
    }
  }

  // Sort slots in concentric rings revolving 360° around the center:
  // Primary key: ring layer (Ring 0 -> Ring 1 -> Ring 2 ... expanding outward)
  // Secondary key: polar angle (clockwise circular sequence around center)
  rawTiles.sort((a, b) => {
    if (a.ring !== b.ring) return a.ring - b.ring;
    return a.angle - b.angle;
  });

  return rawTiles.map((t) => t.pos);
}

/**
 * Dedicated VIP Lounge slots flanking the DJ booth:
 * - Left Platform (TOP 1 Imperial Gold Throne): y = 0.48m, z = -10.9m
 * - Right Platform (TOP 2 Platinum Cyan Lounge): y = 0.38m, z = -10.9m
 */
export const VIP_TOP1_SLOT = new THREE.Vector3(-5.4, 0.48, -10.9);
export const VIP_TOP2_SLOT = new THREE.Vector3(5.4, 0.38, -10.9);
export const VIP_STAGE_SLOTS = [
  VIP_TOP1_SLOT,
  VIP_TOP2_SLOT
];

// Only run WebGL client and WebSocket connection in browser environments
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  initClientApp();
}

function initClientApp() {
  const container = document.getElementById('canvas-container');
  const sceneManager = new SceneManager(container);
  const clubEnvironment = new ClubEnvironment(sceneManager.scene);
  const audioSystem = new AudioSystem();
  const occupancyManager = new AvatarOccupancyManager({ maxCapacity: 100, disableAutoCull: true });
  const vipScheduler = new VipPodiumScheduler({ duration: 15.0, podiumPos: { x: 0, y: 0.55, z: 0 }, preserveDonorPosition: true });

  // Active avatar 3D meshes map: userId -> THREE.Group
  const avatarMeshes = new Map();

  const floorSlots = generateDanceFloorSlots(FLOOR_GRID_CONFIG);
  let nextSlotIdx = 0;

  // Random floor slot allocation: picks an unoccupied slot randomly across the dance floor
  function findRandomAvailableFloorSlot() {
    const occupiedIndices = new Set();
    avatarMeshes.forEach((m) => {
      if (m.userData.floorSlotIdx !== undefined && !m.userData.isVipLounge) {
        occupiedIndices.add(m.userData.floorSlotIdx);
      }
    });

    const availableIndices = [];
    for (let i = 0; i < floorSlots.length; i++) {
      if (!occupiedIndices.has(i)) {
        availableIndices.push(i);
      }
    }

    if (availableIndices.length > 0) {
      const randIdx = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      return { slot: floorSlots[randIdx], idx: randIdx };
    }

    const randIdx = Math.floor(Math.random() * floorSlots.length);
    return { slot: floorSlots[randIdx], idx: randIdx };
  }

// User Cumulative Coins for Leaderboard
const userCoinsMap = new Map();

// Setup WebSocket Connection
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsUrl = `${protocol}//${window.location.host}/ws`;
const ws = new WebSocket(wsUrl);

const uiOverlay = new UiOverlay({
  ws,
  audioSystem,
  sceneManager,
  clubEnvironment
});

// User audio autoplay trigger on first interaction
window.addEventListener('click', () => unlockAudio(audioSystem), { once: true });
window.addEventListener('keydown', () => unlockAudio(audioSystem), { once: true });

// --- WebSocket Event Handlers ---
ws.onopen = () => {
  console.log('[WS] Connected to TikTok LIVE 3D Bar backend');
  syncActiveFloorAvatars();
};

ws.onmessage = (msg) => {
  try {
    const event = JSON.parse(msg.data);
    handleLiveEvent(event);
  } catch (err) {
    console.error('[WS] Error parsing message:', err);
  }
};

function handleLiveEvent(evt) {
  if (!evt) return;

  switch (evt.type) {
    case 'like':
    case 'like_batch': {
      const count = Number(evt.data?.likeCount || evt.data?.count || 1);
      clubEnvironment.emitFlyingHearts(Math.min(count, 20));
      uiOverlay.addHype(count);
      if (evt.user?.id) {
        getOrCreateAvatarMesh(evt.user, 0);
      }
      break;
    }

    case 'chat': {
      uiOverlay.addHype(2);
      const user = evt.user || { id: 'anon', username: 'Viewer' };
      const comment = evt.data?.comment || '';
      const mesh = getOrCreateAvatarMesh(user, 0);

      // Handle chat command for 3D Slime colors (!color <name>)
      const colorSpec = parseColorCommand(comment);
      if (colorSpec) {
        setSlimeColor(mesh, colorSpec.name);
      }

      // Handle chat command for 3D Slime tiers (!tier <1-5>)
      const tierMatch = comment.match(/!tier\s+(\d+)/);
      if (tierMatch && mesh.userData?.controller) {
        const parsedTier = parseInt(tierMatch[1], 10);
        if (parsedTier >= 1 && parsedTier <= 5) {
          mesh.userData.controller.setTier(parsedTier);
          syncActiveFloorAvatars();
        }
      }

      // Handle chat command dance styles
      if (comment.startsWith('!dance')) {
        const styleNum = parseInt(comment.replace('!dance', '').trim(), 10);
        if (!isNaN(styleNum) && styleNum >= 1 && styleNum <= 6) {
          mesh.userData.danceStyle = DANCE_STYLES[styleNum - 1];
        }
      } else if (comment === '!jump') {
        mesh.userData.danceStyle = 'jump';
        mesh.userData.isSuperBounce = true;
      } else if (comment === '!wave') {
        mesh.userData.danceStyle = 'wave';
      } else if (comment === '!cheer') {
        mesh.userData.danceStyle = 'jump';
        mesh.userData.isSuperBounce = true;
      }
      break;
    }

    case 'gift': {
      const user = evt.user || { id: 'anon', username: 'Gifter' };
      const coins = Number(evt.data?.totalCoins || evt.data?.diamondCount || 10);
      const tier = evt.data?.tier || 1;

      uiOverlay.addHype(coins);
      uiOverlay.showGiftAlert(evt);

      // Update Cumulative Leaderboard
      const prevCoins = userCoinsMap.get(user.id)?.totalCoins || 0;
      const totalCoins = prevCoins + coins;
      userCoinsMap.set(user.id, {
        userId: user.id,
        username: user.username,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        totalCoins
      });

      const sortedDonors = Array.from(userCoinsMap.values()).sort(
        (a, b) => b.totalCoins - a.totalCoins
      );
      uiOverlay.updateLeaderboard(sortedDonors);

      // In-Place Celebration: The avatar MUST celebrate right at their standing position on the dance floor
      const mesh = getOrCreateAvatarMesh(user, coins);
      const origin = mesh.position.clone();

      // Categorize gift into 4 levels:
      // - 'small': 1-10 coins
      // - 'medium': 20-199 coins
      // - 'high': 500-5000 coins
      // - 'ultra': >= 6000 coins (Pegasus / Lion Coronation)
      const giftCategory = coins >= 6000 ? 'ultra' : (coins >= 500 ? 'high' : (coins >= 20 ? 'medium' : 'small'));

      // Calculate evolution tier based on cumulative coins:
      // Tier 1: 0-19 coins (Bán Cầu / Half-Sphere)
      // Tier 2: 20-499 coins (Chubby Mochi)
      // Tier 3: 500-2999 coins (Tai Mochi 2 bên + Sừng + Đuôi)
      // Tier 4: 3000-5999 coins (Halo + Lộn vòng flip)
      // Tier 5: >= 6000 coins (Vòng Chân Hoàng Gia Gold + Halo + Lộn vòng flip)
      let newTier = 1;
      if (totalCoins >= 6000) newTier = 5;
      else if (totalCoins >= 3000) newTier = 4;
      else if (totalCoins >= 500) newTier = 3;
      else if (totalCoins >= 20) newTier = 2;

      const currentTier = mesh.userData.controller?.state?.tier || 1;
      const shouldUpgradeTier = newTier > currentTier;

      // Update billboard with coins, level, and rank tag (Top 1 to 5)
      const donorRank = sortedDonors.findIndex((d) => String(d.userId) === String(user.id));
      const rankStr = donorRank === 0 ? '👑 TOP 1' : (donorRank === 1 ? '🥈 TOP 2' : (donorRank === 2 ? '🥉 TOP 3' : (donorRank === 3 ? 'TOP 4' : (donorRank === 4 ? 'TOP 5' : (totalCoins >= 500 ? 'VIP' : null)))));
      if (mesh.userData.controller) {
        mesh.userData.controller.updateBillboard(coins, null, rankStr);
      }

      const giftKey = evt.data?.giftKey || evt.data?.giftName || giftName;

      // Camera, SFX & VIP handling strictly differentiated across categories:
      if (giftCategory === 'ultra') {
        applyWhaleSlimeAesthetics(mesh, 4);
        if (mesh.userData.wingsGroup) mesh.userData.wingsGroup.visible = true;
        if (mesh.userData.shadesGroup) mesh.userData.shadesGroup.visible = true;
        uiOverlay.triggerFrenzyMode();
        // Camera frames and tracks avatar FIRST
        sceneManager.startLionTracking(mesh, 7.6);
        audioSystem.playSfx('bassBoom');
        audioSystem.playSfx('fanfare');

        // Delay celebratory animation & fireworks (~450ms) so camera finishes transition & locks onto avatar
        setTimeout(() => {
          if (mesh.userData.controller) {
            mesh.userData.controller.triggerDonateAnimation('ultra', shouldUpgradeTier, newTier, coins);
          }
          clubEnvironment.focusSpotlights('ultra', origin);
          clubEnvironment.triggerGoldenLightBeam(origin.x, origin.z, 7.6);
          clubEnvironment.triggerShockwave(origin, 'ultra');
          clubEnvironment.triggerMythicCrown(origin, 7.6);
          clubEnvironment.triggerGiftProp(giftKey, origin, coins);
          clubEnvironment.spawnDroppingCoins(origin, 60);
          clubEnvironment.triggerFireworks(4, origin);
          setTimeout(() => clubEnvironment.triggerFireworks(4, origin), 1500);
          setTimeout(() => clubEnvironment.triggerFireworks(4, origin), 2800);
          setTimeout(() => clubEnvironment.triggerFireworks(4, origin), 3800);
        }, 450);

      } else if (giftCategory === 'high') {
        applyWhaleSlimeAesthetics(mesh, 3);
        // Camera smoothly frames avatar angle FIRST
        sceneManager.setCameraPreset('vip', 4.5, origin);
        audioSystem.playSfx('jetSwoosh');

        // Delay white light beam & fireworks (~450ms) so camera finishes transition & frames the avatar
        setTimeout(() => {
          if (mesh.userData.controller) {
            mesh.userData.controller.triggerDonateAnimation('high', shouldUpgradeTier, newTier, coins);
          }
          clubEnvironment.focusSpotlights('high', origin);
          clubEnvironment.triggerWhiteLightBeam(origin.x, origin.z, 3.5);
          clubEnvironment.triggerShockwave(origin, 'high');
          clubEnvironment.triggerGiftProp(giftKey, origin, coins);
          clubEnvironment.spawnOrbitingCoinRings(origin, 499, 3.5);
          clubEnvironment.spawnDroppingCoins(origin, 35);
          clubEnvironment.triggerFireworks(3, origin);
          setTimeout(() => clubEnvironment.triggerFireworks(3, origin), 300);
        }, 450);

      } else if (giftCategory === 'medium' || tier === 2) {
        mesh.userData.targetScale = 1.15;
        mesh.userData.isSuperBounce = true;
        audioSystem.playSfx('bassBoom');
        if (mesh.userData.controller) {
          mesh.userData.controller.triggerDonateAnimation('medium', shouldUpgradeTier, newTier, coins);
        }
        clubEnvironment.focusSpotlights('medium', origin);
        clubEnvironment.triggerGiftProp(giftKey, origin, coins);
        clubEnvironment.spawnOrbitingCoinRings(origin, coins, 3.2);
        clubEnvironment.spawnDroppingCoins(origin, Math.min(coins, 20));
        clubEnvironment.triggerFireworks(2, origin);
      } else {
        mesh.userData.isSuperBounce = true;
        audioSystem.playSfx('coin');
        if (mesh.userData.controller) {
          mesh.userData.controller.triggerDonateAnimation('small', shouldUpgradeTier, newTier, coins);
        }
        clubEnvironment.focusSpotlights('small', origin);
        clubEnvironment.triggerGiftProp(giftKey, origin, coins);
        clubEnvironment.spawnDroppingCoins(origin, coins);
      }

      // Scheduled Deferred VIP Promotion: Move to VIP only AFTER the celebration animation concludes
      let celebrationDurationMs = 1500;
      if (giftCategory === 'ultra') celebrationDurationMs = 7600;
      else if (giftCategory === 'high') celebrationDurationMs = 3500;
      else if (giftCategory === 'medium') celebrationDurationMs = 2500;

      mesh.userData.celebrationUntil = Date.now() + celebrationDurationMs;
      setTimeout(() => {
        mesh.userData.celebrationUntil = 0;
        executeVipPromotionAndSwap(sortedDonors);
      }, celebrationDurationMs);
      break;
    }

    case 'delete_avatar': {
      if (evt.userId) deleteAvatar(evt.userId);
      break;
    }

    case 'clear_avatars': {
      clearAllAvatars();
      break;
    }

    case 'tiktok_status': {
      uiOverlay.updateTikTokStatus(evt.data);
      break;
    }

    case 'admin_command': {
      const { command, preset, value } = evt;
      if (command === 'set_camera' && preset) {
        sceneManager.setCameraPreset(preset);
      } else if (command === 'set_distance' && typeof value === 'number') {
        sceneManager.setOrbitRadius(value);
      } else if (command === 'toggle_alpha') {
        sceneManager.toggleAlpha();
      } else if (command === 'toggle_chroma') {
        sceneManager.toggleChromaKey();
      } else if (command === 'set_volume' && typeof value === 'number') {
        audioSystem.setVolume(value);
      } else if (command === 'toggle_mute') {
        audioSystem.toggleMute();
      } else if (command === 'trigger_frenzy') {
        uiOverlay.triggerFrenzyMode();
      }
      break;
    }

    default:
      break;
  }
}

  // Track VIP Lounge occupants (Top 1 Left, Top 2 Right)
  let currentTop1UserId = null;
  let currentTop2UserId = null;

  /**
   * Parabolic Leap Arc Animation: smooth leap through the air between Floor and VIP platforms.
   */
  function triggerLeapAnimation(mesh, targetPos, targetRotY, onComplete = null) {
    if (!mesh) return;
    const startPos = mesh.position.clone();
    const dist = Math.hypot(startPos.x - targetPos.x, startPos.z - targetPos.z);
    if (dist < 0.2) {
      mesh.position.copy(targetPos);
      mesh.rotation.y = targetRotY;
      if (onComplete) onComplete();
      return;
    }

    mesh.userData.leapAnimation = {
      start: startPos,
      target: targetPos.clone(),
      startRotY: mesh.rotation.y,
      targetRotY,
      progress: 0,
      duration: Math.max(0.9, Math.min(1.4, dist * 0.12 + 0.6)),
      peakHeight: 2.4,
      onComplete
    };
  }

  /**
   * Executes Bilateral Slot Swapping between incoming Top 1 / Top 2 VIPs and displaced occupants.
   * - Left VIP Platform (TOP 1 Imperial Gold Throne): new THREE.Vector3(-5.4, 0.48, -10.9)
   * - Right VIP Platform (TOP 2 Platinum Cyan Lounge): new THREE.Vector3(5.4, 0.38, -10.9)
   * Displaced occupants return to the vacated floor slot of the ascending donor.
   */
  function executeVipPromotionAndSwap(sortedDonors) {
    if (!sortedDonors || sortedDonors.length === 0) return;

    const newTop1 = sortedDonors[0]?.totalCoins > 0 ? String(sortedDonors[0].userId) : null;
    const newTop2 = sortedDonors[1]?.totalCoins > 0 ? String(sortedDonors[1].userId) : null;

    const prevTop1 = currentTop1UserId;
    const prevTop2 = currentTop2UserId;

    if (newTop1 === prevTop1 && newTop2 === prevTop2) {
      // If Top 1 is set but mesh is still on the dance floor, ensure it's moved
      const meshTop1 = newTop1 ? avatarMeshes.get(newTop1) : null;
      if (meshTop1 && !meshTop1.userData.isVipLounge) {
        meshTop1.userData.assignedSlot = VIP_TOP1_SLOT.clone();
        meshTop1.userData.isVipLounge = true;
        meshTop1.userData.levitateY = VIP_TOP1_SLOT.y;
        triggerLeapAnimation(meshTop1, VIP_TOP1_SLOT, 0);
      }
      return;
    }

    const meshNewTop1 = newTop1 ? avatarMeshes.get(newTop1) : null;
    const meshNewTop2 = newTop2 ? avatarMeshes.get(newTop2) : null;
    const meshOldTop1 = prevTop1 ? avatarMeshes.get(prevTop1) : null;
    const meshOldTop2 = prevTop2 ? avatarMeshes.get(prevTop2) : null;

    // Available dance floor slots vacated by avatars ascending to VIP
    const availableFloorSlots = [];
    if (meshNewTop1 && meshNewTop1.userData.floorSlot && prevTop1 !== newTop1 && prevTop2 !== newTop1) {
      availableFloorSlots.push(meshNewTop1.userData.floorSlot.clone());
    }
    if (meshNewTop2 && meshNewTop2.userData.floorSlot && prevTop1 !== newTop2 && prevTop2 !== newTop2) {
      availableFloorSlots.push(meshNewTop2.userData.floorSlot.clone());
    }

    const isNewTop1Ready = meshNewTop1 && (!meshNewTop1.userData.celebrationUntil || Date.now() >= (meshNewTop1.userData.celebrationUntil - 150));
    const isNewTop2Ready = meshNewTop2 && (!meshNewTop2.userData.celebrationUntil || Date.now() >= (meshNewTop2.userData.celebrationUntil - 150));

    // 1. Move new Top 1 to Left VIP platform (y = 0.48m) with Parabolic Leap Arc
    if (meshNewTop1 && isNewTop1Ready && (!meshNewTop1.userData.isVipLounge || prevTop1 !== newTop1)) {
      meshNewTop1.userData.assignedSlot = VIP_TOP1_SLOT.clone();
      meshNewTop1.userData.isVipLounge = true;
      meshNewTop1.userData.levitateY = VIP_TOP1_SLOT.y;
      triggerLeapAnimation(meshNewTop1, VIP_TOP1_SLOT, 0);
      if (meshNewTop1.userData.controller) {
        meshNewTop1.userData.controller.updateBillboard(0, null, '👑 TOP 1');
      }
      currentTop1UserId = newTop1;
    }

    // 2. Move new Top 2 to Right VIP platform (y = 0.38m) with Parabolic Leap Arc
    if (meshNewTop2 && isNewTop2Ready && (!meshNewTop2.userData.isVipLounge || prevTop2 !== newTop2)) {
      meshNewTop2.userData.assignedSlot = VIP_TOP2_SLOT.clone();
      meshNewTop2.userData.isVipLounge = true;
      meshNewTop2.userData.levitateY = VIP_TOP2_SLOT.y;
      triggerLeapAnimation(meshNewTop2, VIP_TOP2_SLOT, 0);
      if (meshNewTop2.userData.controller) {
        meshNewTop2.userData.controller.updateBillboard(0, null, '🥈 TOP 2');
      }
      currentTop2UserId = newTop2;
    }

    // 3. Return displaced old Top 1 if neither Top 1 nor Top 2
    if (meshOldTop1 && prevTop1 !== newTop1 && prevTop1 !== newTop2) {
      const returnSlot = availableFloorSlots.shift() || meshOldTop1.userData.floorSlot || floorSlots[0];
      meshOldTop1.userData.floorSlot = returnSlot.clone();
      meshOldTop1.userData.assignedSlot = returnSlot.clone();
      meshOldTop1.userData.isVipLounge = false;
      meshOldTop1.userData.levitateY = 0;
      // Reset scale & VIP accessories back to standard floor avatar
      meshOldTop1.userData.targetScale = 1.0;
      meshOldTop1.userData.isWhale = false;
      if (meshOldTop1.userData.crown) meshOldTop1.userData.crown.visible = false;
      if (meshOldTop1.userData.auraRing) meshOldTop1.userData.auraRing.visible = false;
      if (meshOldTop1.userData.sparkles) meshOldTop1.userData.sparkles.visible = false;
      if (meshOldTop1.userData.wingsGroup) meshOldTop1.userData.wingsGroup.visible = false;
      if (meshOldTop1.userData.shadesGroup) meshOldTop1.userData.shadesGroup.visible = false;

      const returnRotY = Math.atan2(-returnSlot.x, -returnSlot.z);
      triggerLeapAnimation(meshOldTop1, new THREE.Vector3(returnSlot.x, 0, returnSlot.z), returnRotY);
      if (meshOldTop1.userData.controller) {
        const oldCoins = userCoinsMap.get(prevTop1)?.totalCoins || 0;
        const normTier = oldCoins >= 6000 ? 5 : (oldCoins >= 3000 ? 4 : (oldCoins >= 500 ? 3 : (oldCoins >= 20 ? 2 : 1)));
        meshOldTop1.userData.controller.setTier(normTier);
        meshOldTop1.userData.controller.updateBillboard(0, null, null);
      }
    }

    // 4. Return displaced old Top 2 if neither Top 1 nor Top 2
    if (meshOldTop2 && prevTop2 !== newTop1 && prevTop2 !== newTop2) {
      const returnSlot = availableFloorSlots.shift() || meshOldTop2.userData.floorSlot || floorSlots[1];
      meshOldTop2.userData.floorSlot = returnSlot.clone();
      meshOldTop2.userData.assignedSlot = returnSlot.clone();
      meshOldTop2.userData.isVipLounge = false;
      meshOldTop2.userData.levitateY = 0;
      // Reset scale & VIP accessories back to standard floor avatar
      meshOldTop2.userData.targetScale = 1.0;
      meshOldTop2.userData.isWhale = false;
      if (meshOldTop2.userData.crown) meshOldTop2.userData.crown.visible = false;
      if (meshOldTop2.userData.auraRing) meshOldTop2.userData.auraRing.visible = false;
      if (meshOldTop2.userData.sparkles) meshOldTop2.userData.sparkles.visible = false;
      if (meshOldTop2.userData.wingsGroup) meshOldTop2.userData.wingsGroup.visible = false;
      if (meshOldTop2.userData.shadesGroup) meshOldTop2.userData.shadesGroup.visible = false;

      const returnRotY = Math.atan2(-returnSlot.x, -returnSlot.z);
      triggerLeapAnimation(meshOldTop2, new THREE.Vector3(returnSlot.x, 0, returnSlot.z), returnRotY);
      if (meshOldTop2.userData.controller) {
        const oldCoins = userCoinsMap.get(prevTop2)?.totalCoins || 0;
        const normTier = oldCoins >= 6000 ? 5 : (oldCoins >= 3000 ? 4 : (oldCoins >= 500 ? 3 : (oldCoins >= 20 ? 2 : 1)));
        meshOldTop2.userData.controller.setTier(normTier);
        meshOldTop2.userData.controller.updateBillboard(0, null, null);
      }
    }

    if (isNewTop1Ready && meshNewTop1) currentTop1UserId = newTop1;
    if (isNewTop2Ready && meshNewTop2) currentTop2UserId = newTop2;
  }

  // Update VIP Lounge Occupants: Wrapper around executeVipPromotionAndSwap
  function updateVipLoungeOccupants(sortedDonors) {
    executeVipPromotionAndSwap(sortedDonors);
  }

  // Explicit Avatar Deletion & Clearing Controls
  function deleteAvatar(userId) {
    const id = String(userId);
    const mesh = avatarMeshes.get(id);
    if (mesh) {
      sceneManager.scene.remove(mesh);
      if (mesh.geometry) mesh.geometry.dispose();
      avatarMeshes.delete(id);
    }
    occupancyManager.removeAvatar(id);
    userCoinsMap.delete(id);

    if (currentTop1UserId === id) currentTop1UserId = null;
    if (currentTop2UserId === id) currentTop2UserId = null;

    const sortedDonors = Array.from(userCoinsMap.values()).sort((a, b) => b.totalCoins - a.totalCoins);
    uiOverlay.updateLeaderboard(sortedDonors);
    executeVipPromotionAndSwap(sortedDonors);
    syncActiveFloorAvatars();
  }

  function clearAllAvatars() {
    avatarMeshes.forEach((mesh) => {
      sceneManager.scene.remove(mesh);
      if (mesh.geometry) mesh.geometry.dispose();
    });
    avatarMeshes.clear();
    occupancyManager.clearAll();
    userCoinsMap.clear();

    currentTop1UserId = null;
    currentTop2UserId = null;

    uiOverlay.updateLeaderboard([]);
    syncActiveFloorAvatars();
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('app_delete_avatar', (e) => {
      if (e.detail?.userId) deleteAvatar(e.detail.userId);
    });
    window.addEventListener('app_clear_avatars', () => {
      clearAllAvatars();
    });
    window.__DEBUG_APP = {
      avatarMeshes,
      userCoinsMap,
      getCurrentTop1: () => currentTop1UserId,
      getCurrentTop2: () => currentTop2UserId
    };
  }

  /**
   * Spawns or retrieves existing 3D Avatar mesh on the dance floor.
   * New avatars always spawn randomly on regular dance floor grid slots to allow in-place celebration.
   */
  function getOrCreateAvatarMesh(userData, coins = 0) {
    const userId = String(userData.id || userData.username);
    const trackedAvatar = occupancyManager.touch(userId, userData.username, coins, true);

    let mesh = avatarMeshes.get(userId);
    if (!mesh) {
      mesh = createAvatarMesh({
        ...userData,
        level: userData.level || 'Lv.1',
        tier: userData.tier !== undefined ? Number(userData.tier) : 1,
        isPinned: true,
        totalCoins: trackedAvatar.totalCoins
      });

      // Check if user is currently occupying one of the VIP platforms
      if (currentTop1UserId === userId) {
        mesh.position.set(VIP_TOP1_SLOT.x, VIP_TOP1_SLOT.y, VIP_TOP1_SLOT.z);
        mesh.userData.assignedSlot = mesh.position.clone();
        mesh.userData.isVipLounge = true;
        mesh.userData.levitateY = VIP_TOP1_SLOT.y;
        mesh.rotation.y = 0;
      } else if (currentTop2UserId === userId) {
        mesh.position.set(VIP_TOP2_SLOT.x, VIP_TOP2_SLOT.y, VIP_TOP2_SLOT.z);
        mesh.userData.assignedSlot = mesh.position.clone();
        mesh.userData.isVipLounge = true;
        mesh.userData.levitateY = VIP_TOP2_SLOT.y;
        mesh.rotation.y = 0;
      } else {
        // Assign slot randomly on regular dance floor (y = 0)
        const { slot, idx } = findRandomAvailableFloorSlot();
        mesh.userData.floorSlot = slot.clone();
        mesh.userData.floorSlotIdx = idx;
        mesh.position.set(slot.x, 0, slot.z);
        mesh.userData.assignedSlot = mesh.position.clone();
        mesh.userData.isVipLounge = false;
        mesh.userData.levitateY = 0;
        // Slimes encircle and face inward toward the center at (0, 0, 0)
        mesh.userData.baseAngleY = Math.atan2(-slot.x, -slot.z);
        mesh.rotation.y = mesh.userData.baseAngleY;
      }

      // Permanent avatar flag (exempt from auto culling)
      mesh.userData.isPinned = true;

      // Initialize scale for smooth spawn scale-up (eliminates 1-frame phantom flash)
      mesh.userData.currentScale = 0.05;
      mesh.userData.targetScale = 1.0;
      mesh.scale.setScalar(0.05 * BASE_AVATAR_SCALE);

      sceneManager.scene.add(mesh);
      avatarMeshes.set(userId, mesh);
      trackedAvatar.mesh = mesh;
    }

    if (userData.tier !== undefined && mesh.userData?.controller) {
      mesh.userData.controller.setTier(Number(userData.tier));
    }
    syncActiveFloorAvatars();

    return mesh;
  }

  function syncActiveFloorAvatars() {
    if (!uiOverlay || !uiOverlay.updateActiveAvatars) return;
    const list = [];
    avatarMeshes.forEach((m, uid) => {
      list.push({
        userId: uid,
        username: m.userData.username || uid,
        nickname: m.userData.nickname || m.userData.username || uid,
        level: m.userData.level || 'Lv.1',
        tier: m.userData.controller?.state?.tier || 1,
        color: m.userData.colorKey || 'blue',
        rank: m.userData.donateRank || ''
      });
    });
    uiOverlay.updateActiveAvatars(list);
    if (typeof ws !== 'undefined' && ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'sync_avatars', list }));
    }
  }

// --- 60 FPS Animation & Render Loop ---
const clock = new THREE.Clock();
let cullingTimer = 0;

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.1);
  const time = clock.getElapsedTime();

  // 1. Analyze 3-Band Audio Spectrum
  const bands = audioSystem.getBands();

  // 2. Update Club Environment Visuals (Floor pulse, vinyls, lights, lasers, particles, back-wall occlusion)
  clubEnvironment.update(delta, bands, sceneManager.camera);

  // 3. Update VIP Podium Scheduler
  vipScheduler.update(
    delta,
    (promoted) => {
      if (!sceneManager.isLionTracking) {
        sceneManager.setCameraPreset('vip', 5.0);
      }
      clubEnvironment.triggerFireworks(promoted.tier, promoted.mesh.position);
    },
    (vacated) => {
      // Podium vacated
    }
  );

  // 4. Update Avatars Procedural Kinematics
  const bpmSpeed = 2.0 * Math.PI * (128 / 60); // 128 BPM
  const frenzyMultiplier = uiOverlay.isFrenzy ? 1.8 : 1.0;

  for (const [id, mesh] of avatarMeshes.entries()) {
    const data = mesh.userData;
    const style = uiOverlay.isFrenzy ? 'jump' : data.danceStyle;
    const phase = time * bpmSpeed * frenzyMultiplier + (data.phaseOffset || 0);

    if (data.controller) {
      // Modern CyberSlime: Organic AI Dance Routine, Tier-differentiated moves (spin/flip), Squashing & Celebration FX
      data.controller.update(delta, bands.bassFlux || 0);

      // King Slime Levitation Y-lerp & VIP Lounge Platform Y-lerp (Only when not performing parabolic leap)
      if (!data.leapAnimation) {
        const targetBaseY = data.levitateY !== undefined ? data.levitateY : (data.assignedSlot?.y || 0);
        mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, targetBaseY, 0.05);
      }
    } else if (data.isSlime && data.slimeBody) {
      // 3D Slime Squash & Stretch Kinematics
      const isBouncing = data.isSuperBounce || style === 'jump' || uiOverlay.isFrenzy;
      const k = getSlimeKinematics(phase, isBouncing);

      data.slimeBody.scale.set(k.scaleXZ, k.scaleY, k.scaleXZ);
      data.slimeBody.position.y = 0.35 * k.scaleY + k.jumpY;

      // King Slime Levitation Y-lerp & VIP Lounge Platform Y-lerp
      if (!data.leapAnimation) {
        const targetBaseY = data.levitateY !== undefined ? data.levitateY : (data.assignedSlot?.y || 0);
        mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, targetBaseY, 0.05);
      }

      // Blinking Eyes (Glossy eyes close briefly every ~3.5s)
      const blinkCycle = (time + (data.phaseOffset || 0)) % 3.5;
      const isBlinking = blinkCycle < 0.15;
      if (data.eyeL && data.eyeR) {
        data.eyeL.scale.y = isBlinking ? 0.1 : 1.0;
        data.eyeR.scale.y = isBlinking ? 0.1 : 1.0;
      }
      if (data.specL && data.specR) {
        data.specL.visible = !isBlinking;
        data.specR.visible = !isBlinking;
      }

      // Slime accessories follow body stretch & jump
      if (data.crown && data.crown.visible) {
        data.crown.position.y = 0.88 * k.scaleY + k.jumpY;
      }
      if (data.shadesGroup && data.shadesGroup.visible) {
        data.shadesGroup.position.y = (k.scaleY - 1.0) * 0.2 + k.jumpY;
      }
      if (data.wingsGroup && data.wingsGroup.visible) {
        data.wingsGroup.position.y = (k.scaleY - 1.0) * 0.2 + k.jumpY;
        data.wingsGroup.rotation.y = Math.sin(time * 6) * 0.25; // Gentle flutter
      }
      if (data.auraRing && data.auraRing.visible) {
        data.auraRing.rotation.z += 1.5 * delta;
      }
    } else {
      // Humanoid fallback kinematics
      const k = getDanceKinematics(style, phase);
      if (data.torso) {
        data.torso.position.y = 0.9 + k.posY;
        data.torso.rotation.z = k.rotZ;
      }
      if (data.head) {
        data.head.position.y = 1.45 + k.posY;
      }
      if (data.armL) {
        data.armL.position.y = 0.85 + k.posY;
        data.armL.rotation.x = k.armL;
      }
      if (data.armR) {
        data.armR.position.y = 0.85 + k.posY;
        data.armR.rotation.x = k.armR;
      }
      if (data.legL) {
        data.legL.rotation.x = k.legL;
      }
      if (data.legR) {
        data.legR.rotation.x = k.legR;
      }
    }

    // Parabolic Leap Arc Animation (jumping up/down between Floor and VIP)
    if (data.leapAnimation) {
      const anim = data.leapAnimation;
      anim.progress += delta;
      const p = Math.min(1.0, anim.progress / anim.duration);
      // Smooth cubic ease-in-out curve
      const easeP = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

      const currentX = THREE.MathUtils.lerp(anim.start.x, anim.target.x, easeP);
      const currentZ = THREE.MathUtils.lerp(anim.start.z, anim.target.z, easeP);
      const baseLerpY = THREE.MathUtils.lerp(anim.start.y, anim.target.y, easeP);
      const arcY = Math.sin(p * Math.PI) * anim.peakHeight;

      mesh.position.set(currentX, baseLerpY + arcY, currentZ);
      mesh.rotation.y = THREE.MathUtils.lerp(anim.startRotY, anim.targetRotY, easeP);

      if (p >= 1.0) {
        mesh.position.copy(anim.target);
        mesh.rotation.y = anim.targetRotY;
        data.leapAnimation = null;
        data.isSuperBounce = true;
        if (data.controller) {
          data.controller.setExpression('smile');
        }
        if (anim.onComplete) anim.onComplete();
      }
    } else if (!data.controller && style === 'spin') {
      mesh.rotation.y = Math.sin(phase * 0.5) * Math.PI;
    } else {
      const targetRotY = data.isVipLounge ? 0 : (data.baseAngleY !== undefined ? data.baseAngleY : 0);
      mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, targetRotY, 0.1);
    }

    // Smooth scaling lerp with BASE_AVATAR_SCALE (0.52 fits neatly on 1.5m floor tiles)
    data.currentScale = THREE.MathUtils.lerp(data.currentScale, data.targetScale, 0.08);
    mesh.scale.setScalar(data.currentScale * BASE_AVATAR_SCALE);

    // Billboard always looks at active camera
    if (data.billboard) {
      data.billboard.lookAt(sceneManager.camera.position);
    }
  }

  // 5. Inactivity Culling Loop (Checks every 5 seconds)
  cullingTimer += delta;
  if (cullingTimer > 5.0) {
    cullingTimer = 0;
    const culledIds = occupancyManager.cullIdle();
    if (culledIds && culledIds.length > 0) {
      for (const cid of culledIds) {
        const oldMesh = avatarMeshes.get(cid);
        if (oldMesh) {
          sceneManager.scene.remove(oldMesh);
          avatarMeshes.delete(cid);
        }
      }
      syncActiveFloorAvatars();
    }
  }

  // 6. Update Camera with smooth exponential lerp and subtle bass punch
  sceneManager.update(delta, bands.bassFlux);
}

// Start render loop
animate();
}
