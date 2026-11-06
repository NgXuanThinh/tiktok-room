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

/**
 * Sequential VIP stage scheduler ensuring single whale occupancy for 15s with FIFO queuing.
 */
export class VipPodiumScheduler {
  constructor({ duration = 15.0, podiumPos = { x: 0, y: 0.82, z: -3.5 } } = {}) {
    this.duration = duration;
    this.podiumPos = podiumPos;
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
      const targetY = this.podiumPos.y !== undefined ? this.podiumPos.y : 0.82;
      item.mesh.userData.levitateY = targetY;
      if (item.mesh.position) item.mesh.position.y = targetY;
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
  const slots = [];
  const cfg = config || { rows: 12, cols: 12, tileSpacing: 1.6 };
  const halfRows = (cfg.rows - 1) / 2;
  const halfCols = (cfg.cols - 1) / 2;
  const spacing = cfg.tileSpacing || 1.6;
  const centerZ = cfg.centerZ !== undefined ? cfg.centerZ : 0.5;

  for (let r = 0; r < cfg.rows; r++) {
    for (let c = 0; c < cfg.cols; c++) {
      const x = (c - halfCols) * spacing;
      const z = cfg.startZ !== undefined ? (cfg.startZ + r * spacing) : ((r - halfRows) * spacing + centerZ);
      // Reserve space for VIP podium around (0, 0, -3.5)
      if (Math.hypot(x, z - (-3.5)) < 2.4) continue;
      // Distance to dance floor center (0, 0, 0.5)
      const distToCenter = Math.hypot(x, z - centerZ);
      slots.push({
        pos: new THREE.Vector3(x, 0, z),
        distToCenter
      });
    }
  }

  // Strict center-outward radial sorting:
  // Slots closest to center come FIRST, expanding outward in concentric rings
  slots.sort((a, b) => a.distToCenter - b.distToCenter);
  return slots.map((s) => s.pos);
}

// Only run WebGL client and WebSocket connection in browser environments
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  initClientApp();
}

function initClientApp() {
  const container = document.getElementById('canvas-container');
  const sceneManager = new SceneManager(container);
  const clubEnvironment = new ClubEnvironment(sceneManager.scene);
  const audioSystem = new AudioSystem();
  const occupancyManager = new AvatarOccupancyManager({ maxCapacity: 100, idleTimeoutMs: 120000 });
  const vipScheduler = new VipPodiumScheduler({ duration: 15.0 });

  // Active avatar 3D meshes map: userId -> THREE.Group
  const avatarMeshes = new Map();

  const floorSlots = generateDanceFloorSlots(FLOOR_GRID_CONFIG);
  let nextSlotIdx = 0;

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
      userCoinsMap.set(user.id, {
        userId: user.id,
        username: user.username,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        totalCoins: prevCoins + coins
      });

      const sortedDonors = Array.from(userCoinsMap.values()).sort(
        (a, b) => b.totalCoins - a.totalCoins
      );
      uiOverlay.updateLeaderboard(sortedDonors);

      const mesh = getOrCreateAvatarMesh(user, coins);

      // Trigger fireworks based on tier
      const origin = mesh.position.clone();
      clubEnvironment.triggerFireworks(tier, origin);

      // Focus moving head spotlights based on tier
      if (typeof clubEnvironment.focusSpotlights === 'function') {
        clubEnvironment.focusSpotlights(tier, origin, tier >= 3 ? 15.0 : (tier === 2 ? 4.0 : 3.0));
      }

      // Slime VIP Promotion & Tier Scaling via VipPodiumScheduler
      if (tier >= 3) {
        applyWhaleSlimeAesthetics(mesh, tier);
        if (tier >= 4) {
          if (mesh.userData.wingsGroup) mesh.userData.wingsGroup.visible = true;
          if (mesh.userData.shadesGroup) mesh.userData.shadesGroup.visible = true;
          uiOverlay.triggerFrenzy(15);
        }
        const returnSlot = mesh.userData.assignedSlot || mesh.position.clone();
        vipScheduler.enqueue(user, mesh, tier, returnSlot);
        sceneManager.setCameraPreset('vip', 5.0);
      } else if (tier === 2) {
        // Tier 2: Cyber Slime (1.2x scale, Sunglasses)
        mesh.userData.targetScale = 1.2;
        mesh.userData.isSuperBounce = true;
        if (mesh.userData.shadesGroup) mesh.userData.shadesGroup.visible = true;
      } else {
        // Tier 1: Super Bounce
        mesh.userData.isSuperBounce = true;
      }
      break;
    }

    case 'tiktok_status': {
      uiOverlay.updateTikTokStatus(evt.data);
      break;
    }

    default:
      break;
  }
}

/**
 * Spawns or retrieves existing 3D Avatar mesh on the dance floor.
 */
function getOrCreateAvatarMesh(userData, coins = 0) {
  const userId = String(userData.id || userData.username);
  const trackedAvatar = occupancyManager.touch(userId, userData.username, coins);

  let mesh = avatarMeshes.get(userId);
  if (!mesh) {
    mesh = createAvatarMesh({
      ...userData,
      level: userData.level || 'Lv.1',
      isPinned: trackedAvatar.isPinned,
      totalCoins: trackedAvatar.totalCoins
    });

    // Assign slot on dance floor
    const slot = floorSlots[nextSlotIdx % floorSlots.length];
    nextSlotIdx++;
    mesh.position.set(slot.x + (Math.random() - 0.5) * 0.4, 0, slot.z + (Math.random() - 0.5) * 0.4);
    mesh.userData.assignedSlot = mesh.position.clone();

    sceneManager.scene.add(mesh);
    avatarMeshes.set(userId, mesh);
    trackedAvatar.mesh = mesh;
  }

  return mesh;
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
      sceneManager.setCameraPreset('vip', 5.0);
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

    if (data.isSlime && data.slimeBody) {
      // 3D Slime Squash & Stretch Kinematics
      const isBouncing = data.isSuperBounce || style === 'jump' || uiOverlay.isFrenzy;
      const k = getSlimeKinematics(phase, isBouncing);

      data.slimeBody.scale.set(k.scaleXZ, k.scaleY, k.scaleXZ);
      data.slimeBody.position.y = 0.35 * k.scaleY + k.jumpY;

      // King Slime Levitation Y-lerp
      const targetBaseY = data.levitateY !== undefined ? data.levitateY : 0;
      mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, targetBaseY, 0.05);

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

    // Spin or Y rotation
    if (style === 'spin') {
      mesh.rotation.y = Math.sin(phase * 0.5) * Math.PI;
    } else {
      mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, 0, 0.1);
    }

    // Giant scaling lerp
    data.currentScale = THREE.MathUtils.lerp(data.currentScale, data.targetScale, 0.05);
    mesh.scale.setScalar(data.currentScale);

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
    for (const cid of culledIds) {
      const oldMesh = avatarMeshes.get(cid);
      if (oldMesh) {
        sceneManager.scene.remove(oldMesh);
        avatarMeshes.delete(cid);
      }
    }
  }

  // 6. Update Camera with smooth exponential lerp and subtle bass punch
  sceneManager.update(delta, bands.bassFlux);
}

// Start render loop
animate();
}
