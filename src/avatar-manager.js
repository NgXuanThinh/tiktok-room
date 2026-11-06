// src/avatar-manager.js - Procedural kinematics, billboard badges, 120s culling, VIP pinning
import * as THREE from 'three';

export const DANCE_STYLES = ['bounce', 'wave', 'spin', 'jump', 'shuffle', 'sway'];

/**
 * Computes 6 procedural dance kinematics styles parametrically.
 * Avoids heavy FBX skeletal skinning while sustaining 60 FPS.
 * @param {string} style - One of 'bounce', 'wave', 'spin', 'jump', 'shuffle', 'sway'
 * @param {number} phase - Current angular phase (radians)
 * @returns {object} Kinematic parameters { posY, rotY, rotZ, armL, armR, legL, legR }
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

    // Check capacity bounds before adding new
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
      username: username || 'Viewer',
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

// --- Three.js Shared Geometries & Material Pool for Crowd Rendering ---
const torsoGeom = new THREE.BoxGeometry(0.5, 0.7, 0.3);
const headGeom = new THREE.BoxGeometry(0.35, 0.35, 0.35);
const limbGeom = new THREE.BoxGeometry(0.14, 0.5, 0.14);
const crownGeom = new THREE.ConeGeometry(0.2, 0.25, 5);

const COLOR_PALETTES = [
  0xff007f, 0x00f2fe, 0x7f00ff, 0xffe600, 0x43e97b, 0xf5576c, 0x38f9d7, 0xfa709a
];

/**
 * Creates 3D low-poly clubber mesh with modular limbs and billboard badge.
 */
export function createAvatarMesh(userData) {
  const group = new THREE.Group();

  // Color selection based on hash
  let hash = 0;
  const name = userData.username || 'User';
  for (let i = 0; i < name.length; i++) hash = (hash << 5) - hash + name.charCodeAt(i);
  const color = COLOR_PALETTES[Math.abs(hash) % COLOR_PALETTES.length];

  const bodyMat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.4,
    metalness: 0.2
  });
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xffd1a4,
    roughness: 0.5
  });

  // Torso
  const torso = new THREE.Mesh(torsoGeom, bodyMat);
  torso.position.y = 0.9;
  group.add(torso);

  // Head
  const head = new THREE.Mesh(headGeom, skinMat);
  head.position.y = 1.45;
  group.add(head);

  // Arms
  const armL = new THREE.Mesh(limbGeom, skinMat);
  armL.position.set(-0.35, 0.85, 0);
  group.add(armL);

  const armR = new THREE.Mesh(limbGeom, skinMat);
  armR.position.set(0.35, 0.85, 0);
  group.add(armR);

  // Legs
  const legL = new THREE.Mesh(limbGeom, bodyMat);
  legL.position.set(-0.16, 0.25, 0);
  group.add(legL);

  const legR = new THREE.Mesh(limbGeom, bodyMat);
  legR.position.set(0.16, 0.25, 0);
  group.add(legR);

  // 3D Golden Crown for VIPs
  const crownMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    metalness: 0.9,
    roughness: 0.1,
    emissive: 0x443300
  });
  const crown = new THREE.Mesh(crownGeom, crownMat);
  crown.position.set(0, 1.8, 0);
  crown.visible = !!userData.isPinned;
  group.add(crown);

  // 2D Canvas Billboard for profile picture and username
  const billboard = createBillboardSprite(userData);
  billboard.position.set(0, 2.1, 0);
  group.add(billboard);

  group.userData = {
    ...userData,
    torso,
    head,
    armL,
    armR,
    legL,
    legR,
    crown,
    billboard,
    danceStyle: DANCE_STYLES[Math.floor(Math.random() * DANCE_STYLES.length)],
    phaseOffset: Math.random() * Math.PI * 2,
    targetScale: 1.0,
    currentScale: 1.0,
    isVipSolo: false
  };

  return group;
}

/**
 * Creates 2D Canvas Sprite Billboard with avatar photo and username.
 */
export function createBillboardSprite(userData) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const redraw = (img = null) => {
    ctx.clearRect(0, 0, 256, 128);

    // Draw background bubble
    ctx.fillStyle = 'rgba(10, 10, 25, 0.75)';
    ctx.beginPath();
    ctx.roundRect(16, 16, 224, 72, 16);
    ctx.fill();
    ctx.strokeStyle = userData.isPinned ? '#ffd700' : '#00f2fe';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw user initials/photo
    ctx.save();
    ctx.beginPath();
    ctx.arc(52, 52, 26, 0, Math.PI * 2);
    ctx.clip();
    if (img) {
      ctx.drawImage(img, 26, 26, 52, 52);
    } else {
      ctx.fillStyle = '#ff007f';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((userData.username || 'U').slice(0, 2).toUpperCase(), 52, 52);
    }
    ctx.restore();

    // Username
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const cleanName = (userData.username || 'Viewer').slice(0, 12);
    ctx.fillText(cleanName, 88, 44);

    // Badge / coins
    ctx.fillStyle = userData.isPinned ? '#ffd700' : '#4facfe';
    ctx.font = '14px sans-serif';
    const coinText = userData.totalCoins ? `★ ${userData.totalCoins}` : 'Viewer';
    ctx.fillText(coinText, 88, 64);
  };

  redraw();

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(1.8, 0.9, 1.0);

  // Async load image via avatar proxy
  if (userData.avatarUrl || userData.username) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      redraw(img);
      texture.needsUpdate = true;
    };
    img.src = `/api/avatar?name=${encodeURIComponent(userData.username || '')}&url=${encodeURIComponent(userData.avatarUrl || '')}`;
  }

  sprite.userData = { canvas, ctx, texture, redraw };
  return sprite;
}
