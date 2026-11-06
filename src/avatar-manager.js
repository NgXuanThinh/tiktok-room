// src/avatar-manager.js - 3D Slimes with Squash & Stretch kinematics, strict 4 colors, VIP tiers, and culling
import * as THREE from 'three';

export const DANCE_STYLES = ['bounce', 'wave', 'spin', 'jump', 'shuffle', 'sway'];

export const SLIME_COLORS = {
  green: { name: 'green', hex: '#00FF66', threeColor: 0x00ff66 },
  red: { name: 'red', hex: '#FF2A6D', threeColor: 0xff2a6d },
  blue: { name: 'blue', hex: '#00F0FF', threeColor: 0x00f0ff },
  yellow: { name: 'yellow', hex: '#FFE600', threeColor: 0xffe600 }
};

const COLOR_ALIASES = {
  green: 'green',
  xanhla: 'green',
  xanh_la: 'green',
  'xanh lá': 'green',
  emerald: 'green',
  red: 'red',
  do: 'red',
  'đỏ': 'red',
  rose: 'red',
  blue: 'blue',
  xanh: 'blue',
  xanhduong: 'blue',
  'xanh_duong': 'blue',
  'xanh dương': 'blue',
  cyan: 'blue',
  yellow: 'yellow',
  vang: 'yellow',
  'vàng': 'yellow',
  gold: 'yellow'
};

export function parseColorCommand(comment) {
  if (!comment || typeof comment !== 'string') return null;
  const match = comment.trim().match(/^!color\s+(.+)$/i);
  if (!match) return null;

  const rawInput = match[1].trim().toLowerCase();
  if (/^(#|0x)?[0-9a-f]{3,8}$/i.test(rawInput) && !COLOR_ALIASES[rawInput]) {
    return null;
  }

  const resolved = COLOR_ALIASES[rawInput];
  if (resolved && SLIME_COLORS[resolved]) {
    return SLIME_COLORS[resolved];
  }
  return null;
}

export const SLIME_VIP_CONFIG = {
  tier1: { scale: 1.0, hasSuperBounce: true },
  tier2: { scale: 1.2, hasSunglasses: true, hasAura: true },
  tier3: { scale: 1.4, hasCrown: true, isVipPodium: true },
  tier4: { scale: 1.6, hasAngelWings: true, levitateY: 3.2, triggersFrenzy: true }
};

// User Constraint: Slime does NOT have rosy cheeks/blush. Keep face minimal (glossy blinking eyes + smile, no blush).
export const SLIME_FACE_CONFIG = {
  hasBlush: false,
  hasEyes: true,
  hasSmile: true,
  blushColor: null,
  blinkIntervalSeconds: 3.5,
  blinkDurationSeconds: 0.15
};

/**
 * Computes volume-conserving mathematical Squash & Stretch kinematics for 3D Slimes at 128 BPM.
 */
export function getSlimeKinematics(bpmPhase, isBouncing = false) {
  const sinVal = Math.sin(bpmPhase);
  let scaleY, scaleXZ, jumpY;

  if (sinVal < 0) {
    // Downbeat: Squash on floor impact
    const squashFactor = Math.abs(sinVal);
    scaleY = 1.0 - squashFactor * 0.25; // squashes down to 0.75
    scaleXZ = 1.0 + squashFactor * 0.15; // expands horizontally to 1.15
    jumpY = 0;
  } else {
    // Upbeat: Stretch on jump ascent
    const stretchFactor = sinVal;
    scaleY = 1.0 + stretchFactor * 0.25; // stretches up to 1.25
    scaleXZ = 1.0 - stretchFactor * 0.10; // pinches horizontally to 0.90
    jumpY = stretchFactor * (isBouncing ? 0.75 : 0.35);
  }

  const volumeRatio = scaleXZ * scaleXZ * scaleY;
  return { scaleY, scaleXZ, jumpY, volumeRatio };
}

/**
 * Computes 6 procedural dance kinematics styles (for backwards compatibility).
 */
export function getDanceKinematics(style, phase) {
  const p = Number.isFinite(phase) ? phase : 0;

  switch (style) {
    case 'bounce':
      return {
        posY: Math.abs(Math.sin(p)) * 0.35,
        rotY: Math.sin(p * 0.5) * 0.1,
        rotZ: 0,
        armL: Math.sin(p) * 0.4,
        armR: -Math.sin(p) * 0.4,
        legL: -Math.sin(p) * 0.2,
        legR: Math.sin(p) * 0.2
      };

    case 'wave':
      return {
        posY: Math.abs(Math.sin(p * 0.5)) * 0.15,
        rotY: Math.cos(p * 0.5) * 0.1,
        rotZ: Math.sin(p) * 0.2,
        armL: 2.2 + Math.sin(p) * 0.5,
        armR: 2.2 + Math.cos(p) * 0.5,
        legL: 0,
        legR: 0
      };

    case 'spin':
      return {
        posY: Math.abs(Math.sin(p)) * 0.4,
        rotY: p % (Math.PI * 2),
        rotZ: 0,
        armL: 1.5,
        armR: 1.5,
        legL: Math.sin(p) * 0.3,
        legR: -Math.sin(p) * 0.3
      };

    case 'jump':
      return {
        posY: Math.max(0, Math.sin(p)) * 0.7,
        rotY: 0,
        rotZ: 0,
        armL: 2.6 + Math.sin(p) * 0.2,
        armR: 2.6 + Math.sin(p) * 0.2,
        legL: Math.sin(p) > 0 ? 0.3 : 0,
        legR: Math.sin(p) > 0 ? 0.3 : 0
      };

    case 'shuffle':
      return {
        posY: Math.abs(Math.sin(p * 2)) * 0.15,
        rotY: Math.sin(p) * 0.15,
        rotZ: Math.cos(p) * 0.05,
        armL: Math.cos(p * 2) * 0.5,
        armR: -Math.cos(p * 2) * 0.5,
        legL: Math.sin(p * 2) * 0.5,
        legR: -Math.sin(p * 2) * 0.5
      };

    case 'sway':
      return {
        posY: 0.05 * Math.sin(p),
        rotY: 0,
        rotZ: Math.sin(p * 0.5) * 0.15,
        armL: 0.2 + Math.sin(p * 0.5) * 0.1,
        armR: 0.2 - Math.sin(p * 0.5) * 0.1,
        legL: Math.sin(p * 0.5) * 0.1,
        legR: -Math.sin(p * 0.5) * 0.1
      };

    default:
      return { posY: 0, rotY: 0, rotZ: 0, armL: 0, armR: 0, legL: 0, legR: 0 };
  }
}

/**
 * Avatar Occupancy Manager handling capacity bounds, 120s inactivity culling, and VIP pinning.
 */
export class AvatarOccupancyManager {
  constructor(options = {}) {
    this.maxCapacity = options.maxCapacity || 100;
    this.idleTimeoutMs = options.idleTimeoutMs || 120000; // 120 seconds
    this.avatars = new Map();
  }

  touch(userId, username, coins = 0) {
    const id = String(userId);
    let avatar = this.avatars.get(id);
    const now = Date.now();

    if (avatar) {
      avatar.lastActive = now;
      avatar.totalCoins = (avatar.totalCoins || 0) + Number(coins || 0);
      if (avatar.totalCoins >= 500) {
        avatar.isPinned = true;
      }
      avatar.isIdle = false;
      return avatar;
    }

    if (this.avatars.size >= this.maxCapacity) {
      let oldestKey = null;
      let oldestTime = Infinity;

      for (const [k, v] of this.avatars.entries()) {
        if (!v.isPinned && v.lastActive < oldestTime) {
          oldestTime = v.lastActive;
          oldestKey = k;
        }
      }

      if (oldestKey) {
        const evicted = this.avatars.get(oldestKey);
        this.disposeAvatar(evicted);
        this.avatars.delete(oldestKey);
      }
    }

    avatar = {
      id,
      username: username || 'User',
      totalCoins: Number(coins || 0),
      isPinned: Number(coins || 0) >= 500,
      lastActive: now,
      isIdle: false,
      texture: null,
      mesh: null
    };

    this.avatars.set(id, avatar);
    return avatar;
  }

  cullIdle(now = Date.now()) {
    const culled = [];

    for (const [id, avatar] of this.avatars.entries()) {
      if (avatar.isPinned) continue; // Pinned VIPs strictly exempt from culling

      if (now - avatar.lastActive > this.idleTimeoutMs) {
        avatar.isIdle = true;
        culled.push(id);
      }
    }

    for (const id of culled) {
      const av = this.avatars.get(id);
      if (av) {
        this.disposeAvatar(av);
        this.avatars.delete(id);
      }
    }

    return culled;
  }

  disposeAvatar(avatar) {
    if (!avatar) return;
    if (avatar.texture && typeof avatar.texture.dispose === 'function') {
      avatar.texture.dispose();
      avatar.texture = null;
    }
    if (avatar.mesh) {
      if (avatar.mesh.parent) avatar.mesh.parent.remove(avatar.mesh);
      avatar.mesh = null;
    }
  }
}

// --- 3D Slime Mesh Construction & Materials ---
const COLOR_KEYS = ['green', 'red', 'blue', 'yellow'];

function createSlimeGeometry() {
  const geom = new THREE.SphereGeometry(0.55, 32, 24);
  const pos = geom.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    if (y < 0) {
      pos.setY(i, y * 0.25); // Flatten bottom to rest on floor
    }
  }
  geom.computeVertexNormals();
  return geom;
}

const sharedSlimeGeometry = createSlimeGeometry();
const crownGeom = new THREE.ConeGeometry(0.2, 0.25, 5);

export function createSlimeFaceTexture(isSmiling = true) {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 128, 128);

  // Glossy Eyes
  ctx.fillStyle = '#050508';
  ctx.beginPath();
  ctx.ellipse(44, 52, 8, 12, 0, 0, Math.PI * 2);
  ctx.ellipse(84, 52, 8, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // White Specular Catchlights
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(42, 48, 3, 0, Math.PI * 2);
  ctx.arc(82, 48, 3, 0, Math.PI * 2);
  ctx.fill();

  // Cute Minimal Smile (NO ROSY CHEEKS/BLUSH)
  if (isSmiling) {
    ctx.strokeStyle = '#050508';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(64, 62, 10, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Creates 3D Slime mesh with organic jelly material, glossy eyes, and TikTok billboard.
 */
export function createAvatarMesh(userData, forcedColor = null) {
  const user = typeof userData === 'string'
    ? { id: userData, username: userData }
    : (userData || { id: 'anon', username: 'User' });

  const group = new THREE.Group();

  // Deterministically assign one of the 4 canonical colors (or use forced color)
  let colorKey = forcedColor || user.slimeColor || user.color;
  if (!colorKey || !SLIME_COLORS[colorKey]) {
    let hash = 0;
    const name = user.username || 'User';
    for (let i = 0; i < name.length; i++) hash = (hash << 5) - hash + name.charCodeAt(i);
    colorKey = COLOR_KEYS[Math.abs(hash) % COLOR_KEYS.length];
  }
  const colorSpec = SLIME_COLORS[colorKey];

  // Slime Jelly Material
  const slimeMat = new THREE.MeshStandardMaterial({
    color: colorSpec.threeColor,
    roughness: 0.15,
    metalness: 0.1,
    transparent: true,
    opacity: 0.92,
    emissive: colorSpec.threeColor,
    emissiveIntensity: 0.2
  });

  const slimeBody = new THREE.Mesh(sharedSlimeGeometry, slimeMat);
  slimeBody.position.y = 0.35;
  group.add(slimeBody);

  // Facial features: glossy black eyes + white specular highlight (PARENTED DIRECTLY TO SLIMEBODY)
  const eyeGeom = new THREE.SphereGeometry(0.06, 16, 16);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0f });

  const eyeL = new THREE.Mesh(eyeGeom, eyeMat);
  eyeL.position.set(-0.16, 0.12, 0.46);
  slimeBody.add(eyeL);

  const eyeR = new THREE.Mesh(eyeGeom, eyeMat);
  eyeR.position.set(0.16, 0.12, 0.46);
  slimeBody.add(eyeR);

  // Specular dots parented directly to eyes
  const specGeom = new THREE.SphereGeometry(0.02, 8, 8);
  const specMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const specL = new THREE.Mesh(specGeom, specMat);
  specL.position.set(0.02, 0.02, 0.05);
  eyeL.add(specL);
  const specR = new THREE.Mesh(specGeom, specMat);
  specR.position.set(0.02, 0.02, 0.05);
  eyeR.add(specR);

  // 3D Golden Crown with Gem Studs for VIPs (Tier 3+)
  const crownGroup = new THREE.Group();
  const crownMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    metalness: 0.9,
    roughness: 0.1,
    emissive: 0x443300
  });
  const crownCone = new THREE.Mesh(crownGeom, crownMat);
  crownGroup.add(crownCone);

  // Ruby & Emerald Jewel Studs
  const rubyMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
  const emeraldMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
  const gemGeom = new THREE.SphereGeometry(0.03, 8, 8);
  const gem1 = new THREE.Mesh(gemGeom, rubyMat);
  gem1.position.set(-0.08, 0.1, 0.12);
  crownGroup.add(gem1);
  const gem2 = new THREE.Mesh(gemGeom, emeraldMat);
  gem2.position.set(0.08, 0.1, 0.12);
  crownGroup.add(gem2);

  crownGroup.position.set(0, 0.88, 0);
  crownGroup.visible = !!user.isPinned;
  group.add(crownGroup);

  // Ground-projected rotating golden aura disc for whales
  const auraGeom = new THREE.RingGeometry(0.7, 0.9, 32);
  const auraMat = new THREE.MeshBasicMaterial({
    color: 0xffd700,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.6
  });
  const auraRing = new THREE.Mesh(auraGeom, auraMat);
  auraRing.rotation.x = Math.PI / 2;
  auraRing.position.y = 0.02;
  auraRing.visible = false;
  group.add(auraRing);

  // Localized floating sparkle star trail
  const sparkleGeom = new THREE.BufferGeometry();
  const sparkleCount = 16;
  const sparklePositions = new Float32Array(sparkleCount * 3);
  for (let i = 0; i < sparkleCount; i++) {
    sparklePositions[i * 3] = (Math.random() - 0.5) * 0.8;
    sparklePositions[i * 3 + 1] = Math.random() * 0.8;
    sparklePositions[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
  }
  sparkleGeom.setAttribute('position', new THREE.BufferAttribute(sparklePositions, 3));
  const sparkleMat = new THREE.PointsMaterial({
    color: 0xffd700,
    size: 0.1,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });
  const sparkles = new THREE.Points(sparkleGeom, sparkleMat);
  sparkles.visible = false;
  group.add(sparkles);

  // Cyberpunk Sunglasses for Tier 2 VIP
  const shadesGroup = new THREE.Group();
  const shadesMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
  const shadesLens = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.05), shadesMat);
  shadesLens.position.set(0, 0.46, 0.52);
  shadesGroup.add(shadesLens);
  shadesGroup.visible = false;
  group.add(shadesGroup);

  // Angel Light Wings for Tier 4 King Slime
  const wingsGroup = new THREE.Group();
  const wingGeom = new THREE.BoxGeometry(0.8, 0.35, 0.05);
  const wingMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending
  });
  const wingL = new THREE.Mesh(wingGeom, wingMat);
  wingL.position.set(-0.6, 0.5, -0.2);
  wingL.rotation.z = Math.PI / 8;
  wingsGroup.add(wingL);
  const wingR = new THREE.Mesh(wingGeom, wingMat);
  wingR.position.set(0.6, 0.5, -0.2);
  wingR.rotation.z = -Math.PI / 8;
  wingsGroup.add(wingR);
  wingsGroup.visible = false;
  group.add(wingsGroup);

  // Overhead 2D Canvas Billboard for profile picture and username
  const billboard = createBillboardSprite(user);
  billboard.position.set(0, 1.3, 0);
  group.add(billboard);

  group.userData = {
    ...user,
    isSlime: true,
    isWhale: false,
    slimeBody,
    slimeMat,
    colorKey,
    eyeL,
    eyeR,
    specL,
    specR,
    crown: crownGroup,
    auraRing,
    sparkles,
    shadesGroup,
    wingsGroup,
    billboard,
    phaseOffset: Math.random() * Math.PI * 2,
    targetScale: 1.0,
    currentScale: 1.0,
    isVipSolo: false,
    isSuperBounce: false,
    lastBlinkTime: Math.random() * 3.0,
    torso: { position: { y: 0.9 }, rotation: { z: 0 } },
    head: { position: { y: 1.45 } },
    armL: { position: { y: 0.85 }, rotation: { x: 0 } },
    armR: { position: { y: 0.85 }, rotation: { x: 0 } },
    legL: { rotation: { x: 0 } },
    legR: { rotation: { x: 0 } }
  };

  return group;
}

/**
 * Applies distinct Whale visual hierarchy to high-tier gifters (Tier 3+).
 */
export function applyWhaleSlimeAesthetics(group, tier = 3) {
  if (!group || !group.userData) return;
  const data = group.userData;
  data.isWhale = true;

  // 1. Golden Holographic Jelly Material
  if (data.slimeMat) {
    if (data.slimeMat.color?.setHex) data.slimeMat.color.setHex(0xFFD700);
    if (data.slimeMat.emissive?.setHex) data.slimeMat.emissive.setHex(0x553300);
    data.slimeMat.emissiveIntensity = 0.4;
    data.slimeMat.metalness = 0.6;
    data.slimeMat.roughness = 0.15;
    data.colorKey = 'yellow';
  }

  // 2. Jeweled Crown
  if (data.crown) {
    data.crown.visible = true;
  }

  // 3. Ground Aura Disc
  if (data.auraRing) {
    data.auraRing.visible = true;
  }

  // 4. Sparkle Trail
  if (data.sparkles) {
    data.sparkles.visible = true;
  }

  // 5. Tier Scaling
  data.targetScale = tier >= 4 ? 1.6 : 1.4;
}

/**
 * Changes Slime color to one of the 4 canonical colors.
 */
export function setSlimeColor(slimeGroup, colorKey) {
  if (!slimeGroup || !colorKey) return;
  const col = SLIME_COLORS[colorKey];
  if (!col) return;

  const mat = slimeGroup.userData?.slimeMat;
  if (mat) {
    mat.color.setHex(col.threeColor);
    mat.emissive.setHex(col.threeColor);
    slimeGroup.userData.colorKey = col.name;
  }
}

/**
 * Creates 2D Canvas Sprite Billboard with avatar photo and username.
 */
export function createBillboardSprite(userData) {
  const level = userData.level || 'Lv.1';
  const coinStr = userData.totalCoins ? ` ★ ${userData.totalCoins}` : '';
  const badgeText = `${level}${coinStr}`;

  if (typeof document === 'undefined') {
    const dummySprite = new THREE.Object3D();
    dummySprite.scale.set(1.8, 0.9, 1.0);
    dummySprite.userData = { badgeText, level };
    return dummySprite;
  }
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const redraw = (img = null) => {
    ctx.clearRect(0, 0, 256, 128);

    ctx.fillStyle = 'rgba(10, 10, 25, 0.75)';
    ctx.beginPath();
    ctx.roundRect(16, 16, 224, 72, 16);
    ctx.fill();
    ctx.strokeStyle = userData.isPinned ? '#ffd700' : '#00FF66';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.arc(52, 52, 26, 0, Math.PI * 2);
    ctx.clip();
    if (img) {
      ctx.drawImage(img, 26, 26, 52, 52);
    } else {
      ctx.fillStyle = '#00FF66';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((userData.username || 'U').slice(0, 2).toUpperCase(), 52, 52);
    }
    ctx.restore();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const cleanName = (userData.nickname || userData.username || 'User').slice(0, 12);
    ctx.fillText(cleanName, 88, 44);

    // Render Level badge (e.g. Lv.1, Lv.10, VIP, TOP 1) - NEVER 'Viewer'
    ctx.fillStyle = userData.isPinned ? '#ffd700' : (level.includes('TOP') || level.includes('VIP') ? '#ffd700' : '#00F0FF');
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(badgeText, 88, 64);
  };

  redraw();

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(1.8, 0.9, 1.0);

  if (userData.avatarUrl || userData.username) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      redraw(img);
      texture.needsUpdate = true;
    };
    img.src = `/api/avatar?name=${encodeURIComponent(userData.username || '')}&url=${encodeURIComponent(userData.avatarUrl || '')}`;
  }

  sprite.userData = { canvas, ctx, texture, redraw, badgeText, level };
  return sprite;
}
