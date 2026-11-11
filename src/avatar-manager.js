// src/avatar-manager.js - 3D Slimes with Squash & Stretch kinematics, strict 4 colors, VIP tiers, and culling
import * as THREE from 'three';
import {
  createCyberSlime,
  createBillboardSprite as createCyberBillboardSprite
} from './slime-model.js';

export const DANCE_STYLES = ['bounce', 'wave', 'spin', 'jump', 'shuffle', 'sway'];

export const SLIME_COLORS = {
  green: { name: 'green', hex: '#00FF66', threeColor: 0x00ff66 },
  red: { name: 'red', hex: '#FF2A6D', threeColor: 0xff2a6d },
  blue: { name: 'blue', hex: '#00F0FF', threeColor: 0x00f0ff }
};

const COLOR_ALIASES = {
  green: 'green',
  lime: 'green',
  xanhla: 'green',
  xanh_la: 'green',
  'xanh lá': 'green',
  emerald: 'green',
  luc: 'green',
  'lục': 'green',
  red: 'red',
  pink: 'red',
  do: 'red',
  'đỏ': 'red',
  rose: 'red',
  hong: 'red',
  'hồng': 'red',
  blue: 'blue',
  cyan: 'blue',
  xanh: 'blue',
  xanhduong: 'blue',
  'xanh_duong': 'blue',
  'xanh dương': 'blue'
};

export function parseColorCommand(comment) {
  if (!comment || typeof comment !== 'string') return null;
  const trimmed = comment.trim();
  const match = trimmed.match(/^!color(?:\s+(.+))?$/i);
  if (!match) return null;

  const rawInput = match[1] ? match[1].trim().toLowerCase() : '';
  if (!rawInput) {
    return { isRandom: true };
  }

  const tokens = rawInput.split(/\s+/);
  const oneWord = tokens[0];
  const twoWords = tokens.slice(0, 2).join(' ');

  const resolved = COLOR_ALIASES[rawInput] || COLOR_ALIASES[twoWords] || COLOR_ALIASES[oneWord];
  if (resolved && SLIME_COLORS[resolved]) {
    return SLIME_COLORS[resolved];
  }

  if (/^(#|0x)?[0-9a-f]{3,8}$/i.test(oneWord) && !COLOR_ALIASES[oneWord]) {
    return null;
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
    this.idleTimeoutMs = options.idleTimeoutMs || 90000; // 90 seconds
    this.disableAutoCull = options.disableAutoCull === true;
    this.avatars = new Map();
  }

  touch(userId, username, coins = 0, isPinned = null) {
    const id = String(userId);
    let avatar = this.avatars.get(id);
    const now = Date.now();
    const hasPinFlag = isPinned !== null ? !!isPinned : Number(coins || 0) >= 500;

    if (avatar) {
      avatar.lastActive = now;
      avatar.totalCoins = (avatar.totalCoins || 0) + Number(coins || 0);
      if (avatar.totalCoins >= 500 || hasPinFlag) {
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
      isPinned: hasPinFlag,
      lastActive: now,
      isIdle: false,
      texture: null,
      mesh: null
    };

    this.avatars.set(id, avatar);
    return avatar;
  }

  cullIdle(now = Date.now()) {
    if (this.disableAutoCull) return [];
    const culled = [];

    for (const [id, avatar] of this.avatars.entries()) {
      if (avatar.isPinned) continue; // Pinned VIPs & Permanent avatars strictly exempt from culling

      if (now - avatar.lastActive > this.idleTimeoutMs) {
        avatar.isIdle = true;
        culled.push(id);
      }
    }

    // Do NOT prematurely dispose or delete here - let sinkAndRemoveAvatar perform
    // smooth hop-and-sink animation, which calls deleteAvatar() upon completion.
    return culled;
  }

  /**
   * Returns the Three.js mesh for a given userId, or null if not found.
   * Used by focusSpotlights() to auto-target the donating Slime's position.
   * @param {string} userId
   * @returns {THREE.Object3D|null}
   */
  getAvatarMesh(userId) {
    return this.meshMap?.get(String(userId)) || null;
  }

  removeAvatar(userId) {
    const id = String(userId);
    const av = this.avatars.get(id);
    if (av) {
      this.disposeAvatar(av);
      this.avatars.delete(id);
      return true;
    }
    return false;
  }

  clearAll() {
    for (const [id, av] of this.avatars.entries()) {
      this.disposeAvatar(av);
    }
    this.avatars.clear();
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
const COLOR_KEYS = ['green', 'red', 'blue'];

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

  // Deterministically assign one of the 4 canonical colors (or use forced color)
  let colorKey = forcedColor || user.slimeColor || user.color;
  if (!colorKey || !SLIME_COLORS[colorKey]) {
    let hash = 0;
    const name = user.username || 'User';
    for (let i = 0; i < name.length; i++) hash = (hash << 5) - hash + name.charCodeAt(i);
    colorKey = COLOR_KEYS[Math.abs(hash) % COLOR_KEYS.length];
  }
  const colorSpec = SLIME_COLORS[colorKey];

  // Map canonical color to modern CyberSlime palette:
  // green -> lime, red -> pink, blue -> cyan, yellow -> cyan (or golden)
  const paletteKey = colorKey === 'green' ? 'lime' : (colorKey === 'red' ? 'pink' : 'cyan');

  // Instantiate authoritative CyberSlime
  const controller = createCyberSlime(paletteKey, {
    ...user,
    color: colorKey,
    slimeColor: colorKey,
    tier: user.tier !== undefined ? Number(user.tier) : 1
  });

  const group = controller.mesh;

  // Sync colorSpec to material for strict color palette test assertions
  if (colorSpec && group.userData?.slimeMat?.color?.setHex) {
    group.userData.slimeMat.color.setHex(colorSpec.threeColor);
    group.userData.slimeMat.emissive.setHex(colorSpec.threeColor);
    group.userData.colorKey = colorKey;
  }

  return group;
}

/**
 * Applies distinct Whale visual hierarchy to high-tier gifters (Tier 3+).
 */
export function applyWhaleSlimeAesthetics(group, tier = 3) {
  if (!group || !group.userData) return;
  const data = group.userData;
  data.isWhale = true;

  // Giữ nguyên màu sắc/palette gốc của avatar, KHÔNG ép đổi sang màu vàng 'gold'

  // 1. Jeweled Crown
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

  if (data.controller) {
    data.controller.setTier(tier >= 4 ? 5 : 3);
  }
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
    if (mat.color?.setHex) mat.color.setHex(col.threeColor);
    if (mat.emissive?.setHex) mat.emissive.setHex(col.threeColor);
    slimeGroup.userData.colorKey = col.name;
  }

  if (slimeGroup.userData?.controller) {
    const pKey = colorKey === 'green' ? 'lime' : (colorKey === 'red' ? 'pink' : 'cyan');
    slimeGroup.userData.controller.setPalette(pKey);
  }
}

/**
 * Creates 2D Canvas Sprite Billboard with avatar photo and username.
 */
export function createBillboardSprite(userData) {
  return createCyberBillboardSprite(userData);
}
