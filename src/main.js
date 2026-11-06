// src/main.js - Application entrypoint coordinating WebGL, WebSocket hub, avatars, and audio
import * as THREE from 'three';
import { SceneManager } from './scene-manager.js';
import { ClubEnvironment } from './club-environment.js';
import { AudioSystem } from './audio-system.js';
import {
  AvatarOccupancyManager,
  getDanceKinematics,
  getSlimeKinematics,
  createAvatarMesh,
  parseColorCommand,
  setSlimeColor,
  SLIME_COLORS,
  DANCE_STYLES
} from './avatar-manager.js';
import { unlockAudio } from './audio-system.js';
import { UiOverlay } from './ui-overlay.js';

// --- System Initialization ---
const container = document.getElementById('canvas-container');
const sceneManager = new SceneManager(container);
const clubEnvironment = new ClubEnvironment(sceneManager.scene);
const audioSystem = new AudioSystem();
const occupancyManager = new AvatarOccupancyManager({ maxCapacity: 100, idleTimeoutMs: 120000 });

// Active avatar 3D meshes map: userId -> THREE.Group
const avatarMeshes = new Map();

// Spatial dance floor grid slots (8x8 grid within -6 to +6)
const floorSlots = [];
for (let x = -5.5; x <= 5.5; x += 1.4) {
  for (let z = -5.5; z <= 5.5; z += 1.4) {
    if (Math.abs(x) < 2.0 && z < -2.0) continue; // Reserve space for VIP podium
    floorSlots.push(new THREE.Vector3(x, 0, z));
  }
}
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

      // Slime VIP Promotion & Tier Scaling
      if (tier >= 4) {
        // Tier 4: King Slime (1.6x scale, Angel Wings, Levitation Y=3.2, Frenzy)
        mesh.userData.isPinned = true;
        mesh.userData.isVipSolo = true;
        mesh.userData.targetScale = 1.6;
        mesh.userData.isSuperBounce = true;
        mesh.userData.levitateY = 3.2;
        if (mesh.userData.crown) mesh.userData.crown.visible = true;
        if (mesh.userData.wingsGroup) mesh.userData.wingsGroup.visible = true;
        if (mesh.userData.shadesGroup) mesh.userData.shadesGroup.visible = true;
        mesh.position.set(0, 3.2, -3.5);
        sceneManager.setCameraPreset('vip');
        uiOverlay.triggerFrenzy(15);
      } else if (tier === 3) {
        // Tier 3: VIP Podium (1.4x scale, Crown, Super Bounce)
        mesh.userData.isPinned = true;
        mesh.userData.isVipSolo = true;
        mesh.userData.targetScale = 1.4;
        mesh.userData.isSuperBounce = true;
        mesh.userData.levitateY = 0.82;
        mesh.position.set(0, 0.82, -3.5);
        if (mesh.userData.crown) mesh.userData.crown.visible = true;
        sceneManager.setCameraPreset('vip');
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
      isPinned: trackedAvatar.isPinned,
      totalCoins: trackedAvatar.totalCoins
    });

    // Assign slot on dance floor
    const slot = floorSlots[nextSlotIdx % floorSlots.length];
    nextSlotIdx++;
    mesh.position.set(slot.x + (Math.random() - 0.5) * 0.4, 0, slot.z + (Math.random() - 0.5) * 0.4);

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

  // 2. Update Club Environment Visuals (Floor pulse, vinyls, lights, lasers, particles)
  clubEnvironment.update(delta, bands);

  // 3. Update Avatars Procedural Kinematics
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

  // 4. Inactivity Culling Loop (Checks every 5 seconds)
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

  // 5. Update Camera with smooth exponential lerp and subtle bass punch
  sceneManager.update(delta, bands.bassFlux);
}

// Start render loop
animate();
