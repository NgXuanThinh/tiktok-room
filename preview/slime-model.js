// preview/slime-model.js - Complete Tier Evolution (Free Tier: Half-Sphere, T1-T4: Chubby Mochi with Additive Features)
import * as THREE from 'three';
import {
  SLIME_BASE_RADIUS,
  SLIME_BASE_HEIGHT,
  SLIME_BELLY_BULGE_FACTOR,
  SLIME_PALETTES,
  ULTRA_PALETTES,
  SLIME_EYE_CONFIG,
  SLIME_BILLBOARD_CONFIG,
  SLIME_ANIMATION_CONFIG,
  SLIME_ACCESSORY_DIMENSIONS
} from './slime-constants.js';
import { createSlimeAura } from './slime-aura.js';
import {
  BILLBOARD_BORDERS,
  BILLBOARD_PILLS,
  BILLBOARD_LAYOUT,
  PILL_SCALE
} from './billboard-constants.js';

export {
  SLIME_BASE_RADIUS,
  SLIME_BASE_HEIGHT,
  SLIME_BELLY_BULGE_FACTOR,
  SLIME_PALETTES,
  ULTRA_PALETTES,
  SLIME_EYE_CONFIG,
  SLIME_BILLBOARD_CONFIG,
  SLIME_ANIMATION_CONFIG,
  SLIME_ACCESSORY_DIMENSIONS
};

// ----------------------------------------------------
// 1. FREE TIER GEOMETRY: Simple Half-Sphere like main branch
// ----------------------------------------------------
export function createBasicHalfSphereGeometry() {
  const geom = new THREE.SphereGeometry(SLIME_BASE_RADIUS, 24, 18);
  const pos = geom.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    if (y < 0) {
      pos.setY(i, y * 0.25); // simple flat bottom
    }
  }
  geom.computeVertexNormals();
  return geom;
}
export const sharedBasicHalfSphereGeometry = createBasicHalfSphereGeometry();

// ----------------------------------------------------
// 2. GORGEOUS CHUBBY MOCHI GEOMETRY (T1 - T4)
// ----------------------------------------------------
export function createChubbyMochiSlimeGeometry() {
  const geom = new THREE.SphereGeometry(SLIME_BASE_RADIUS, 24, 18);
  const pos = geom.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    const ny = y / SLIME_BASE_HEIGHT;

    if (ny < 0) {
      const bellyBulge = 1.0 + Math.sin(Math.abs(ny) * Math.PI * 0.5) * (SLIME_BELLY_BULGE_FACTOR - 1.0);
      x *= bellyBulge;
      z *= bellyBulge;
      y *= 0.42;
    } else {
      const cheekBulge = 1.0 + Math.sin(ny * Math.PI) * 0.22;
      x *= cheekBulge;
      z *= cheekBulge;

      if (ny > 0.72) {
        const peakT = (ny - 0.72) / 0.28;
        y += Math.pow(peakT, 2.0) * 0.16;
        x *= (1.0 - peakT * 0.4);
        z *= (1.0 - peakT * 0.4);
      }
    }

    pos.setXYZ(i, x, y, z);
  }

  geom.computeVertexNormals();
  return geom;
}
export const sharedChubbyMochiGeometry = createChubbyMochiSlimeGeometry();

// Global Shared Materials Pool
export const sharedMaterialsPool = {};
Object.entries({ ...SLIME_PALETTES, ...ULTRA_PALETTES }).forEach(([key, spec]) => {
  const mat = new THREE.MeshStandardMaterial({
    color: spec.shellColor,
    emissive: spec.coreEmissive,
    emissiveIntensity: 0.35,
    roughness: 0.12,
    metalness: 0.06,
    transparent: true,
    opacity: 0.92,
    depthWrite: true
  });
  mat.userData = { isShared: true, isGlobalPool: true };
  sharedMaterialsPool[key] = mat;
});

export function getClonedSlimeMaterial(paletteKey) {
  const base = sharedMaterialsPool[paletteKey] || sharedMaterialsPool.cyan;
  const mat = base.clone();
  mat.userData = { isShared: false };
  mat.opacity = 0.92;
  mat.transparent = true;
  return mat;
}

// Shared Accessories
export const sharedHeadbandGeom = new THREE.TorusGeometry(
  SLIME_ACCESSORY_DIMENSIONS.headband.radius,
  SLIME_ACCESSORY_DIMENSIONS.headband.tube,
  6,
  16,
  Math.PI * 0.9
);
export const sharedEarcupGeom = new THREE.CylinderGeometry(0.20, 0.22, 0.10, 12);

// T3 Replacement: Mini Slime Pet
const sharedMiniSlimeGeom = (() => {
  const geom = new THREE.SphereGeometry(0.24, 16, 12);
  const pos = geom.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const py = pos.getY(i);
    if (py < 0) pos.setY(i, py * 0.55);
  }
  geom.computeVertexNormals();
  return geom;
})();
const sharedMiniEyeGeom = new THREE.SphereGeometry(0.035, 8, 6);
const sharedMiniSpecGeom = new THREE.SphereGeometry(0.014, 6, 6);

// T3 Alternatives: Neon Cat Ears, Gold Chain, Mini Crown
const sharedCatEarOuterGeom = new THREE.ConeGeometry(0.18, 0.32, 4);
sharedCatEarOuterGeom.scale(1.0, 1.0, 0.55);
const sharedCatEarInnerGeom = new THREE.ConeGeometry(0.12, 0.22, 4);
sharedCatEarInnerGeom.scale(1.0, 1.0, 0.55);

const sharedChainTorusGeom = new THREE.TorusGeometry(0.48, 0.038, 8, 20, Math.PI * 1.15);
const sharedMedalGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.025, 16);
const sharedCrownGeom = new THREE.CylinderGeometry(0.18, 0.13, 0.14, 10);

// Cyber Devil Horns & Wagging Tail Geometries
export const sharedHornGeom = (() => {
  const geom = new THREE.ConeGeometry(0.08, 0.36, 12);
  geom.translate(0, 0.18, 0);
  return geom;
})();

const sharedTailSegmentGeom = (() => {
  const geom = new THREE.CylinderGeometry(0.045, 0.065, 0.35, 8);
  geom.translate(0, 0.175, 0);
  return geom;
})();

const sharedTailTipGeom = (() => {
  const geom = new THREE.ConeGeometry(0.11, 0.22, 4);
  geom.scale(1.2, 1.0, 0.3);
  geom.translate(0, 0.11, 0);
  return geom;
})();

// 2 Tai Mochi 2 Bên Geometry (Cute Rounded Mochi Bear Ears, slightly attached to head, no face)
export const sharedSideMochiGeom = (() => {
  const geom = new THREE.SphereGeometry(0.36, 20, 16);
  geom.scale(1.0, 1.12, 0.92);
  geom.computeVertexNormals();
  return geom;
})();

// Tie 5 Celestial Ground Aura Ring (Vòng Sáng Dưới Chân Hoàng Gia)
const sharedAuraDiscGeom = new THREE.RingGeometry(0.95, 1.82, 48);
const sharedAuraInnerRingGeom = new THREE.TorusGeometry(1.35, 0.020, 8, 40);
const sharedAuraPerimeterGeom = new THREE.TorusGeometry(1.82, 0.034, 10, 48);
const sharedAuraRuneGeom = new THREE.BoxGeometry(0.07, 0.025, 0.18);

const sharedHaloGeom = new THREE.TorusGeometry(0.36, 0.026, 8, 24);

/**
 * 3D Overhead Billboard Sprite
 * Structure:
 * - Line 1: Nickname / Username
 * - Line 2: Level (number only: e.g. "20"), Top rank badge (👑 TOP 1, etc.), Fan badge (💜 Fan)
 * - Avatar circular borders:
 *   + TOP 1: Gold 5.5px
 *   + TOP 2: Silver 4.5px
 *   + TOP 3: Bronze 3.5px
 *   + Fan: Violet 3.5px
 *   + Top + Fan: Double border (inner Top border, outer Violet Fan border)
 *   + Follower: Soft violet 1.8px
 */
export function createBillboardSprite(userData = {}) {
  const rawLvl = userData.tiktokLevel || userData.level || 'Lv.1';
  const rawLvlStr = String(rawLvl ?? 1);
  const lvlNumber = rawLvlStr.replace(/^(Lv\.?|Level\s*)/i, '').trim() || '1';
  const lvlText = `Lv.${lvlNumber}`;

  const rank = userData.donateRank || null;
  const isFan = Boolean(userData.isFan);
  const isFollower = Boolean(userData.isFollower);
  const badgeText = rank ? String(rank) : (userData.level ? String(userData.level) : lvlText);
  const effectiveBaseScale = Number(PILL_SCALE ?? BILLBOARD_LAYOUT?.PILL_SCALE ?? BILLBOARD_PILLS?.PILL_SCALE ?? 1.4) || 1.4;

  if (typeof document === 'undefined') {
    const dummy = new THREE.Object3D();
    dummy.scale.set(effectiveBaseScale, effectiveBaseScale, 1.0);
    dummy.userData = { badgeText, level: lvlText, donateRank: rank, isFan, isFollower, baseScale: effectiveBaseScale };
    return dummy;
  }

  const canvas = document.createElement('canvas');
  canvas.width = BILLBOARD_LAYOUT.CANVAS_SIZE;
  canvas.height = BILLBOARD_LAYOUT.CANVAS_SIZE;
  const ctx = canvas.getContext('2d');

  const redraw = (img = null) => {
    ctx.clearRect(0, 0, BILLBOARD_LAYOUT.CANVAS_SIZE, BILLBOARD_LAYOUT.CANVAS_SIZE);

    // 1. Detect roles & configs
    const currentRank = userData.donateRank !== undefined ? userData.donateRank : rank;
    const currentIsFan = Boolean(userData.isFan !== undefined ? userData.isFan : isFan);
    const currentIsFollower = Boolean(userData.isFollower !== undefined ? userData.isFollower : isFollower);

    let topBorder = null;
    let topPill = null;
    if (currentRank) {
      const upper = String(currentRank).trim().toUpperCase();
      if (upper.includes('TOP 1') || upper === 'TOP1' || upper === '1') {
        topBorder = BILLBOARD_BORDERS.TOP1;
        topPill = BILLBOARD_PILLS.TOP1;
      } else if (upper.includes('TOP 2') || upper === 'TOP2' || upper === '2') {
        topBorder = BILLBOARD_BORDERS.TOP2;
        topPill = BILLBOARD_PILLS.TOP2;
      } else if (upper.includes('TOP 3') || upper === 'TOP3' || upper === '3') {
        topBorder = BILLBOARD_BORDERS.TOP3;
        topPill = BILLBOARD_PILLS.TOP3;
      } else if (upper.includes('VIP')) {
        topBorder = { color: '#c77dff', lineWidth: 3.5, shadowBlur: 10, shadowColor: '#c77dff' };
        topPill = BILLBOARD_PILLS.VIP;
      } else {
        topBorder = { color: '#00f2fe', lineWidth: 3.5, shadowBlur: 10, shadowColor: '#00f2fe' };
        topPill = { bg: 'rgba(10, 25, 35, 0.95)', border: '#00f2fe', text: '#ffffff', label: String(currentRank) };
      }
    }

    const {
      AVATAR_CX: cx,
      AVATAR_CY: cy,
      AVATAR_R: R,
      DOUBLE_BORDER_GAP: GAP,
      NAME_Y,
      NAME_FONT,
      PILL_Y,
      PILL_H,
      PILL_GAP,
      PILL_FONT,
      PILL_SCALE,
    } = BILLBOARD_LAYOUT;

    // 2. Avatar Circular Clip
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.clip();
    if (img) {
      ctx.drawImage(img, cx - R, cy - R, R * 2, R * 2);
    } else {
      ctx.fillStyle = userData.avatarColor || (topBorder ? topBorder.color : (currentIsFan ? BILLBOARD_BORDERS.FAN.color : '#00f2fe'));
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const initials = (userData.nickname || userData.username || 'U').replace('@', '').slice(0, 2).toUpperCase();
      ctx.fillText(initials, cx, cy);
    }
    ctx.restore();

    // Helper to draw clean circular glowing border
    const drawBorderRing = (radius, borderCfg) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.lineWidth = borderCfg.lineWidth;
      ctx.strokeStyle = borderCfg.color;
      ctx.shadowColor = borderCfg.shadowColor || borderCfg.color;
      ctx.shadowBlur = borderCfg.shadowBlur || 10;
      ctx.stroke();
      ctx.restore();
    };

    // 3. Avatar Border Rendering
    if (currentIsFan && topBorder) {
      // User is BOTH Top rank AND Fan -> Double border
      // Inner border: Top rank (Gold/Silver/Bronze)
      drawBorderRing(R + topBorder.lineWidth / 2, topBorder);
      // Outer border: Fan violet (#c77dff, 3.5px) with gap
      const outerR = R + topBorder.lineWidth + GAP + BILLBOARD_BORDERS.FAN.lineWidth / 2;
      drawBorderRing(outerR, BILLBOARD_BORDERS.FAN);
    } else if (topBorder) {
      // Top rank only
      drawBorderRing(R + topBorder.lineWidth / 2, topBorder);
    } else if (currentIsFan) {
      // Fan only
      drawBorderRing(R + BILLBOARD_BORDERS.FAN.lineWidth / 2, BILLBOARD_BORDERS.FAN);
    } else if (currentIsFollower) {
      // Follower soft border (gentle violet, thinner)
      drawBorderRing(R + BILLBOARD_BORDERS.FOLLOW.lineWidth / 2, BILLBOARD_BORDERS.FOLLOW);
    } else {
      // Default Cyan border
      drawBorderRing(R + BILLBOARD_BORDERS.DEFAULT.lineWidth / 2, BILLBOARD_BORDERS.DEFAULT);
    }

    // 4. Nickname / Username - Center
    ctx.save();
    ctx.font = NAME_FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const cleanName = (userData.nickname || userData.username || 'Viewer').slice(0, 16);
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.strokeText(cleanName, cx, NAME_Y);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(cleanName, cx, NAME_Y);
    ctx.restore();

    // 5. Dynamic Info Pills: [Level][TOP Rank][Fan]
    ctx.save();
    ctx.font = PILL_FONT;
    ctx.textBaseline = 'middle';

    const currentRawLvl = userData.tiktokLevel || userData.level || '1';
    const currentLvlStr = String(currentRawLvl).replace(/^Lv\.?/i, '').trim() || '1';

    const pills = [
      {
        label: currentLvlStr,
        bg: BILLBOARD_PILLS.LVL.bg,
        border: BILLBOARD_PILLS.LVL.border,
        text: BILLBOARD_PILLS.LVL.text,
        minW: 32
      }
    ];

    if (topPill) {
      pills.push({
        label: topPill.label,
        bg: topPill.bg,
        border: topPill.border,
        text: topPill.text,
        minW: 42
      });
    }

    if (currentIsFan) {
      pills.push({
        label: BILLBOARD_PILLS.FAN.label,
        bg: BILLBOARD_PILLS.FAN.bg,
        border: BILLBOARD_PILLS.FAN.border,
        text: BILLBOARD_PILLS.FAN.text,
        minW: 42
      });
    }

    const pillWidths = pills.map((p) => {
      const textW = ctx.measureText(p.label).width;
      return Math.max(p.minW, textW + 14);
    });

    const totalPillsWidth = pillWidths.reduce((acc, w) => acc + w, 0) + PILL_GAP * (pills.length - 1);
    let startX = cx - totalPillsWidth / 2;

    pills.forEach((p, idx) => {
      const pillW = pillWidths[idx];

      // Draw background
      ctx.fillStyle = p.bg;
      ctx.beginPath();
      ctx.roundRect(startX, PILL_Y, pillW, PILL_H, 6);
      ctx.fill();

      // Draw border
      ctx.strokeStyle = p.border;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Draw text
      ctx.fillStyle = p.text;
      ctx.textAlign = 'center';
      ctx.fillText(p.label, startX + pillW / 2, PILL_Y + PILL_H / 2);

      startX += pillW + PILL_GAP;
    });

    ctx.restore();
  };

  redraw();

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.center.set(0.5, 0.05);
  sprite.scale.set(effectiveBaseScale, effectiveBaseScale, 1.0);
  sprite.position.set(0, 1.45, 0);

  if (userData.avatarUrl || userData.username) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      redraw(img);
      texture.needsUpdate = true;
    };
    img.src = `/api/avatar?name=${encodeURIComponent(userData.username || '')}&url=${encodeURIComponent(userData.avatarUrl || '')}`;
  }

  sprite.userData = {
    canvas,
    ctx,
    texture,
    redraw,
    badgeText,
    level: lvlText,
    donateRank: rank,
    isFan,
    isFollower,
    baseScale: effectiveBaseScale
  };
  return sprite;
}

/**
 * Creates a Cyber Slime with Full Tier Evolution Support:
 * - Free Tier (0): Basic Half-Sphere, no accessories
 * - Tier 1 (1): Beautiful Chubby Mochi Shape (New!), no accessories
 * - Tier 2 (2): Chubby Mochi + Headphone
 * - Tier 3 (3): Chubby Mochi + Visor
 * - Tier 4 (4): Chubby Mochi + Headphone + Visor + Celestial Halo
 */
export function createCyberSlime(paletteKey = 'cyan', rawUserData = {}) {
  const palette = SLIME_PALETTES[paletteKey] || SLIME_PALETTES.cyan;
  const slimeGroup = new THREE.Group();
  slimeGroup.name = 'CyberSlime';

  const userData = {
    gender: rawUserData.gender || 'male',
    username: rawUserData.username || '@Viewer',
    nickname: rawUserData.nickname || rawUserData.username || 'Viewer',
    tiktokLevel: rawUserData.tiktokLevel || rawUserData.level || 'Lv.1',
    donateRank: rawUserData.donateRank !== undefined ? rawUserData.donateRank : null,
    avatarColor: rawUserData.avatarColor,
    totalCoins: rawUserData.totalCoins || 0,
    ...rawUserData
  };

  // 1. Root container (1.0x Scale)
  const rootNode = new THREE.Group();
  rootNode.position.y = 0.12;
  slimeGroup.add(rootNode);

  // Overhead 3D Billboard Sprite (Tham chiếu luồng chính)
  const billboard = createBillboardSprite(userData);
  slimeGroup.add(billboard);

  // 2. Slime Mesh (defaults to Chubby Mochi, swappable to Half-Sphere on Tier 0)
  let currentMat = getClonedSlimeMaterial(paletteKey);
  const slimeMesh = new THREE.Mesh(sharedChubbyMochiGeometry, currentMat);
  rootNode.add(slimeMesh);

  // 3. 3D Chibi Face Features
  // Parent eyes and face features directly to slimeMesh so they squash & stretch in lockstep with the body!
  const faceGroup = new THREE.Group();
  faceGroup.name = 'FaceGroup';
  slimeMesh.add(faceGroup);

  const eyeCorneaGeom = new THREE.SphereGeometry(0.095, 12, 8);
  eyeCorneaGeom.scale(1.0, 1.3, 0.35);
  const specKeyGeom = new THREE.SphereGeometry(0.038, 6, 6);
  const specTwinkleGeom = new THREE.SphereGeometry(0.020, 6, 6);
  const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const blackPupilMat = new THREE.MeshBasicMaterial({ color: 0x05050e });

  function create3DEye(isLeft = true) {
    const eyeHolder = new THREE.Group();
    eyeHolder.position.set(isLeft ? -0.27 : 0.27, 0.36, 0.92);
    eyeHolder.rotation.y = isLeft ? 0.30 : -0.30;
    eyeHolder.rotation.x = -0.05;

    const corneaMat = new THREE.MeshBasicMaterial({ color: palette.corneaColor || 0x05050e });
    const cornea = new THREE.Mesh(eyeCorneaGeom, corneaMat);
    eyeHolder.add(cornea);

    const spec1 = new THREE.Mesh(specKeyGeom, whiteMat);
    spec1.position.set(isLeft ? 0.025 : -0.02, 0.045, 0.025);
    eyeHolder.add(spec1);

    const spec2 = new THREE.Mesh(specTwinkleGeom, whiteMat);
    spec2.position.set(isLeft ? -0.025 : 0.025, -0.04, 0.025);
    eyeHolder.add(spec2);

    const rimGeom = new THREE.TorusGeometry(0.065, 0.012, 6, 10, Math.PI * 0.7);
    const rimMat = new THREE.MeshBasicMaterial({ color: palette.eyeGlow });
    const rim = new THREE.Mesh(rimGeom, rimMat);
    rim.position.set(0, -0.035, 0.02);
    rim.rotation.z = Math.PI * 1.15;
    eyeHolder.add(rim);

    return { eyeHolder, cornea, spec1, spec2, rim };
  }

  const eyeLeft = create3DEye(true);
  const eyeRight = create3DEye(false);
  slimeMesh.add(eyeLeft.eyeHolder);
  slimeMesh.add(eyeRight.eyeHolder);

  // 3D Cute Cat Smile Mouth
  const mouthHolder = new THREE.Group();
  mouthHolder.position.set(0, 0.22, 0.97);
  mouthHolder.rotation.x = 0.08;

  const mouthGeom = new THREE.TorusGeometry(0.075, 0.015, 6, 12, Math.PI * 0.75);
  const mouthMat = new THREE.MeshBasicMaterial({ color: 0x05050e });
  const mouthMesh = new THREE.Mesh(mouthGeom, mouthMat);
  mouthMesh.rotation.z = Math.PI * 1.125;
  mouthHolder.add(mouthMesh);
  slimeMesh.add(mouthHolder);

  // Conditional Blush (Default: FALSE / Male)
  const blushGeom = new THREE.CircleGeometry(0.07, 10);
  const blushMat = new THREE.MeshBasicMaterial({
    color: palette.blushColor,
    transparent: true,
    opacity: 0.55,
    depthWrite: false
  });

  const blushL = new THREE.Mesh(blushGeom, blushMat);
  blushL.position.set(-0.44, 0.23, 0.86);
  blushL.rotation.y = -0.48;
  blushL.visible = (userData.gender === 'female');
  slimeMesh.add(blushL);

  const blushR = new THREE.Mesh(blushGeom, blushMat);
  blushR.position.set(0.44, 0.23, 0.86);
  blushR.rotation.y = 0.48;
  blushR.visible = (userData.gender === 'female');
  slimeMesh.add(blushR);

  // ----------------------------------------------------
  // 4. ACCESSORIES (Tie 1-5 Evolution: Mochi 2 bên, Sừng, Đuôi, Halo)
  // ----------------------------------------------------
  // --- TAI MOCHI 2 BÊN (Tie 3, 4, 5) ---
  // Thiết kế như 2 cái tai tròn xoe, hơi dính vào 2 bên của mochi, không có mặt mũi
  const sideMochisGroup = new THREE.Group();
  sideMochisGroup.name = 'SideMochiEars';

  // Tai Trái (Hơi dính vào bên trái đầu, không mặt mũi)
  const earNodeL = new THREE.Group();
  earNodeL.position.set(-0.80, 0.65, 0.05);
  earNodeL.rotation.set(-0.06, 0.10, 0.38);

  const mochiL = new THREE.Mesh(sharedSideMochiGeom, currentMat);
  earNodeL.add(mochiL);
  sideMochisGroup.add(earNodeL);

  // Tai Phải (Hơi dính vào bên phải đầu, không mặt mũi)
  const earNodeR = new THREE.Group();
  earNodeR.position.set(0.80, 0.65, 0.05);
  earNodeR.rotation.set(-0.06, -0.10, -0.38);

  const mochiR = new THREE.Mesh(sharedSideMochiGeom, currentMat);
  earNodeR.add(mochiR);
  sideMochisGroup.add(earNodeR);

  sideMochisGroup.mochiL = mochiL;
  sideMochisGroup.mochiR = mochiR;
  sideMochisGroup.earNodeL = earNodeL;
  sideMochisGroup.earNodeR = earNodeR;
  sideMochisGroup.visible = false;
  rootNode.add(sideMochisGroup); // Gắn trực tiếp vào rootNode để nhún nhảy và đàn hồi cùng thân mochi!

  // Headphone (Reserved for DJ, available if needed)
  const headphonesGroup = new THREE.Group();
  headphonesGroup.position.set(0, 0.62, 0);

  const bandMat = new THREE.MeshStandardMaterial({ color: 0x121218, roughness: 0.3 });
  const bandMesh = new THREE.Mesh(sharedHeadbandGeom, bandMat);
  bandMesh.rotation.z = -Math.PI * 0.45;
  headphonesGroup.add(bandMesh);

  const earcupMat = new THREE.MeshStandardMaterial({ color: 0x181822, metalness: 0.6, roughness: 0.2 });
  const cupL = new THREE.Mesh(sharedEarcupGeom, earcupMat);
  cupL.position.set(-0.84, -0.15, 0);
  cupL.rotation.z = Math.PI / 2;
  headphonesGroup.add(cupL);

  const cupR = new THREE.Mesh(sharedEarcupGeom, earcupMat);
  cupR.position.set(0.84, -0.15, 0);
  cupR.rotation.z = -Math.PI / 2;
  headphonesGroup.add(cupR);
  headphonesGroup.visible = false;
  rootNode.add(headphonesGroup);

  // --- T3 PRIMARY: 🐾 Cute Mini Slime Companion (Pet) ---
  const miniPetGroup = new THREE.Group();
  miniPetGroup.position.set(0.96, 0.52, 0.22);

  const miniPetMesh = new THREE.Mesh(sharedMiniSlimeGeom, currentMat);
  miniPetGroup.add(miniPetMesh);

  const miniEyeL = new THREE.Mesh(sharedMiniEyeGeom, blackPupilMat);
  miniEyeL.position.set(-0.075, 0.04, 0.19);
  miniPetGroup.add(miniEyeL);

  const miniEyeR = new THREE.Mesh(sharedMiniEyeGeom, blackPupilMat);
  miniEyeR.position.set(0.075, 0.04, 0.19);
  miniPetGroup.add(miniEyeR);

  const miniSpecL = new THREE.Mesh(sharedMiniSpecGeom, whiteMat);
  miniSpecL.position.set(-0.065, 0.055, 0.215);
  miniPetGroup.add(miniSpecL);

  const miniSpecR = new THREE.Mesh(sharedMiniSpecGeom, whiteMat);
  miniSpecR.position.set(0.085, 0.055, 0.215);
  miniPetGroup.add(miniSpecR);

  miniPetGroup.mesh = miniPetMesh;
  miniPetGroup.visible = false;
  rootNode.add(miniPetGroup);

  // --- T3 ALTERNATIVE 1: 🐱 Neon Cat Ears ---
  const catEarsGroup = new THREE.Group();
  const earFrameMat = new THREE.MeshStandardMaterial({ color: 0x12121c, metalness: 0.8, roughness: 0.2 });
  const earGlowMat = new THREE.MeshBasicMaterial({ color: palette.eyeGlow });

  const earL = new THREE.Group();
  const earLOuter = new THREE.Mesh(sharedCatEarOuterGeom, earFrameMat);
  const earLInner = new THREE.Mesh(sharedCatEarInnerGeom, earGlowMat);
  earLInner.position.set(0, -0.015, 0.018);
  earL.add(earLOuter);
  earL.add(earLInner);
  earL.position.set(-0.42, 0.76, 0.05);
  earL.rotation.set(-0.1, 0, 0.32);
  catEarsGroup.add(earL);

  const earR = new THREE.Group();
  const earROuter = new THREE.Mesh(sharedCatEarOuterGeom, earFrameMat);
  const earRInner = new THREE.Mesh(sharedCatEarInnerGeom, earGlowMat);
  earRInner.position.set(0, -0.015, 0.018);
  earR.add(earROuter);
  earR.add(earRInner);
  earR.position.set(0.42, 0.76, 0.05);
  earR.rotation.set(-0.1, 0, -0.32);
  catEarsGroup.add(earR);

  catEarsGroup.glowMat = earGlowMat;
  catEarsGroup.visible = false;
  rootNode.add(catEarsGroup);

  // --- T3 ALTERNATIVE 2: 💰 VIP Gold Chain (Medallion) ---
  const goldChainGroup = new THREE.Group();
  goldChainGroup.position.set(0, 0.16, 0.48);
  goldChainGroup.rotation.x = 0.42;

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    metalness: 0.95,
    roughness: 0.18,
    emissive: 0x443300,
    emissiveIntensity: 0.25
  });

  const chainMesh = new THREE.Mesh(sharedChainTorusGeom, goldMat);
  chainMesh.rotation.z = Math.PI * 0.925;
  goldChainGroup.add(chainMesh);

  const medalMesh = new THREE.Mesh(sharedMedalGeom, goldMat);
  medalMesh.rotation.x = Math.PI / 2;
  medalMesh.position.set(0, -0.52, 0.02);
  goldChainGroup.add(medalMesh);

  goldChainGroup.visible = false;
  rootNode.add(goldChainGroup);

  // --- T3 ALTERNATIVE 3: 👑 Mini Crown ---
  const miniCrownGroup = new THREE.Group();
  miniCrownGroup.position.set(0.24, 0.86, 0.02);
  miniCrownGroup.rotation.z = -0.24;

  const crownMesh = new THREE.Mesh(sharedCrownGeom, goldMat);
  miniCrownGroup.add(crownMesh);

  miniCrownGroup.visible = false;
  rootNode.add(miniCrownGroup);

  // --- CYBER DEVIL: 2 SỪNG CONG & ĐUÔI LẮC LƯ ---
  const hornsGroup = new THREE.Group();
  hornsGroup.name = 'CyberHorns';

  const hornMat = new THREE.MeshStandardMaterial({
    color: 0x111118,
    metalness: 0.85,
    roughness: 0.15,
    emissive: palette.eyeGlow,
    emissiveIntensity: 0.45
  });

  const hornL = new THREE.Mesh(sharedHornGeom, hornMat);
  hornL.position.set(-0.30, 0.72, 0.08);
  hornL.rotation.set(-0.25, 0.15, 0.42);
  hornsGroup.add(hornL);

  const hornR = new THREE.Mesh(sharedHornGeom, hornMat);
  hornR.position.set(0.30, 0.72, 0.08);
  hornR.rotation.set(-0.25, -0.15, -0.42);
  hornsGroup.add(hornR);

  hornsGroup.hornMat = hornMat;
  hornsGroup.visible = false;
  rootNode.add(hornsGroup);

  const tailGroup = new THREE.Group();
  tailGroup.name = 'WaggingTail';
  tailGroup.position.set(0, 0.15, -0.76);

  const tailMat = getClonedSlimeMaterial(paletteKey);
  const tailSegment = new THREE.Mesh(sharedTailSegmentGeom, tailMat);
  tailSegment.rotation.x = -Math.PI * 0.42;
  tailGroup.add(tailSegment);

  const tailTipMat = new THREE.MeshStandardMaterial({
    color: 0xff0874,
    emissive: 0xff0874,
    emissiveIntensity: 0.65,
    metalness: 0.5,
    roughness: 0.2
  });
  const tailTip = new THREE.Mesh(sharedTailTipGeom, tailTipMat);
  tailTip.position.set(0, 0.26, -0.30);
  tailTip.rotation.x = -Math.PI * 0.42;
  tailGroup.add(tailTip);

  tailGroup.tailSegment = tailSegment;
  tailGroup.tailTip = tailTip;
  tailGroup.visible = false;
  rootNode.add(tailGroup);

  // Celestial Halo Ring (T4)
  const haloGroup = new THREE.Group();
  haloGroup.position.set(0, 1.15, 0);
  haloGroup.rotation.x = Math.PI / 2 + 0.18;

  const haloMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    emissive: 0xffaa00,
    emissiveIntensity: 1.4,
    metalness: 0.85,
    roughness: 0.12
  });
  const haloMesh = new THREE.Mesh(sharedHaloGeom, haloMat);
  haloGroup.add(haloMesh);
  haloGroup.visible = false;
  rootNode.add(haloGroup);

  // --- TIE 5 GROUND AURA: Radiant Celestial Ground Ring (Vòng Sáng Dưới Chân Hoàng Gia) ---
  const auraGroup = new THREE.Group();
  auraGroup.name = 'GroundAura';
  auraGroup.position.y = 0.105; // Elevated cleanly above podium surface (0.080) and neon rim (0.082)

  // 1. Broad luminous ground magic seal disc
  const auraDiscMat = new THREE.MeshBasicMaterial({
    color: 0xffd700,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const auraDisc = new THREE.Mesh(sharedAuraDiscGeom, auraDiscMat);
  auraDisc.rotation.x = -Math.PI / 2;
  auraGroup.add(auraDisc);

  // 2. Inner Sacred Ring
  const auraInnerMat = new THREE.MeshStandardMaterial({
    color: 0xffe066,
    emissive: 0xffd700,
    emissiveIntensity: 1.8,
    metalness: 0.8,
    roughness: 0.1
  });
  const auraInner = new THREE.Mesh(sharedAuraInnerRingGeom, auraInnerMat);
  auraInner.rotation.x = Math.PI / 2;
  auraGroup.add(auraInner);

  // 3. Outer sharp perimeter neon ring
  const auraTorusMat = new THREE.MeshStandardMaterial({
    color: 0xffe066,
    emissive: 0xffd700,
    emissiveIntensity: 2.0,
    metalness: 0.8,
    roughness: 0.1
  });
  const auraPerimeter = new THREE.Mesh(sharedAuraPerimeterGeom, auraTorusMat);
  auraPerimeter.rotation.x = Math.PI / 2;
  auraGroup.add(auraPerimeter);

  // 4. 8 Radiant Diamond Runes / Magic Crests
  const runesGroup = new THREE.Group();
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const rune = new THREE.Mesh(sharedAuraRuneGeom, auraTorusMat);
    rune.position.set(Math.cos(angle) * 1.82, 0, Math.sin(angle) * 1.82);
    rune.rotation.y = -angle;
    runesGroup.add(rune);
  }
  auraGroup.add(runesGroup);

  auraGroup.discMat = auraDiscMat;
  auraGroup.innerMat = auraInnerMat;
  auraGroup.torusMat = auraTorusMat;
  auraGroup.auraInner = auraInner;
  auraGroup.auraPerimeter = auraPerimeter;
  auraGroup.runesGroup = runesGroup;
  auraGroup.visible = false;
  slimeGroup.add(auraGroup);

  // Localized floating sparkle star trail for VIP whales
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
  rootNode.add(sparkles);

  // 3 Concentric Ground Foot Rings (Trắng nhỏ -> Vàng trung -> Cam lớn)
  // Bán kính tự động tính tương thích theo kích thước slime từ SLIME_ACCESSORY_DIMENSIONS
  const { footRings: ringDims, bodyAura: auraDims } = SLIME_ACCESSORY_DIMENSIONS;

  const footRingsGroup = new THREE.Group();
  footRingsGroup.name = 'FootRings';
  footRingsGroup.position.y = ringDims.yOffset; // Nằm phẳng sát mặt sàn

  const ring1Geom = new THREE.TorusGeometry(ringDims.ring1Radius, ringDims.tubeRadius, 10, 48);
  const ring1Mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const ring1 = new THREE.Mesh(ring1Geom, ring1Mat);
  ring1.rotation.x = Math.PI / 2;
  ring1.visible = false;
  footRingsGroup.add(ring1);

  const ring2Geom = new THREE.TorusGeometry(ringDims.ring2Radius, ringDims.tubeRadius, 10, 48);
  const ring2Mat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
  const ring2 = new THREE.Mesh(ring2Geom, ring2Mat);
  ring2.rotation.x = Math.PI / 2;
  ring2.visible = false;
  footRingsGroup.add(ring2);

  const ring3Geom = new THREE.TorusGeometry(ringDims.ring3Radius, ringDims.tubeRadius, 10, 48);
  const ring3Mat = new THREE.MeshBasicMaterial({ color: 0xff6600 });
  const ring3 = new THREE.Mesh(ring3Geom, ring3Mat);
  ring3.rotation.x = Math.PI / 2;
  ring3.visible = false;
  footRingsGroup.add(ring3);

  footRingsGroup.ring1 = ring1;
  footRingsGroup.ring2 = ring2;
  footRingsGroup.ring3 = ring3;
  rootNode.add(footRingsGroup);

  // Multi-style rotating Body Aura (Tím / Cam / Vàng + mini bubbles sủi lên)
  const auraController = createSlimeAura();
  rootNode.add(auraController.group);
  const goldenBodyAuraMesh = auraController.coneMesh;

  slimeGroup.userData = {
    ...userData,
    isSlime: true,
    isWhale: false,
    slimeBody: slimeMesh,
    slimeMat: currentMat,
    colorKey: paletteKey,
    eyeL: eyeLeft.eyeHolder,
    eyeR: eyeRight.eyeHolder,
    specL: eyeLeft.spec1,
    specR: eyeRight.spec1,
    crown: miniCrownGroup,
    auraRing: auraGroup,
    sparkles,
    shadesGroup: headphonesGroup,
    wingsGroup: hornsGroup,
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
    legR: { rotation: { x: 0 } },
    controller: null
  };

  // Controller Object
  const controller = {
    mesh: slimeGroup,
    billboard,
    userData,
    setLabelVisible(visible) {
      if (this.billboard) this.billboard.visible = visible;
    },
    setBillboardScale(scale = 1.0) {
      this.billboardScale = scale;
      if (this.billboard) {
        const base = this.billboard.userData?.baseScale || Number(PILL_SCALE ?? BILLBOARD_LAYOUT?.PILL_SCALE ?? BILLBOARD_PILLS?.PILL_SCALE ?? 1.4) || 1.4;
        this.billboard.scale.set(base * scale, base * scale, 1.0);
      }
    },
    setTikTokLevel(lvl) {
      this.userData.tiktokLevel = typeof lvl === 'number' ? `Lv.${lvl}` : (String(lvl).startsWith('Lv.') ? String(lvl) : `Lv.${lvl}`);
      if (this.billboard?.userData?.redraw) {
        this.billboard.userData.redraw();
        if (this.billboard.userData.texture) this.billboard.userData.texture.needsUpdate = true;
      }
    },
    setDonateRank(rank) {
      this.userData.donateRank = rank || null;
      if (this.billboard?.userData?.redraw) {
        this.billboard.userData.redraw();
        if (this.billboard.userData.texture) this.billboard.userData.texture.needsUpdate = true;
      }
    },
    setFanStatus(isFan = true) {
      this.userData.isFan = Boolean(isFan);
      if (this.billboard?.userData?.redraw) {
        this.billboard.userData.redraw();
        if (this.billboard.userData.texture) this.billboard.userData.texture.needsUpdate = true;
      }
    },
    setFollowerStatus(isFollower = true) {
      this.userData.isFollower = Boolean(isFollower);
      if (this.billboard?.userData?.redraw) {
        this.billboard.userData.redraw();
        if (this.billboard.userData.texture) this.billboard.userData.texture.needsUpdate = true;
      }
    },
    updateBillboard(coinsToAdd = 0, newLevel = null, newRank = null) {
      if (coinsToAdd > 0) {
        this.userData.totalCoins = (this.userData.totalCoins || 0) + coinsToAdd;
      }
      if (newLevel) {
        this.userData.tiktokLevel = typeof newLevel === 'number' ? `Lv.${newLevel}` : (String(newLevel).startsWith('Lv.') ? String(newLevel) : `Lv.${newLevel}`);
      }
      if (newRank !== null) {
        this.userData.donateRank = newRank;
      } else if (coinsToAdd > 0 && !this.userData.donateRank) {
        if (this.userData.totalCoins >= 25000) {
          this.userData.donateRank = 'TOP 1';
        } else if (this.userData.totalCoins >= 15000) {
          this.userData.donateRank = 'TOP 2';
        } else if (this.userData.totalCoins >= 5000) {
          this.userData.donateRank = 'TOP 3';
        } else if (this.userData.totalCoins >= 1000) {
          this.userData.donateRank = 'VIP';
        }
      }
      if (this.billboard?.userData?.redraw) {
        this.billboard.userData.redraw();
        if (this.billboard.userData.texture) {
          this.billboard.userData.texture.needsUpdate = true;
        }
      }
    },
    rootNode,
    slimeMesh,
    faceGroup,
    eyeLeft,
    eyeRight,
    mouthMesh,
    blushL,
    blushR,
    accessories: {
      sideMochis: sideMochisGroup,
      horns: hornsGroup,
      tail: tailGroup,
      halo: haloGroup,
      auraRing: auraGroup,
      footRings: footRingsGroup,
      bodyAura: goldenBodyAuraMesh,
      auraController,
      headphones: headphonesGroup,
      miniPet: miniPetGroup,
      catEars: catEarsGroup,
      goldChain: goldChainGroup,
      miniCrown: miniCrownGroup
    },
    currentPaletteKey: paletteKey,
    state: {
      bpm: 128,
      bpmPhase: 0,
      danceRoutineTimer: 0,
      autoDanceRoutine: true,
      activeDanceAction: null, // { type: 'spin' | 'flip', timer: 0, duration: number }
      activeFlourish: null, // { type: 'spin' | 'flip', dir: 1 | -1, timer: 0, duration: number, height: number }
      flourishCooldown: Math.random() * 2.0 + 1.0, // Cooldown ngẫu nhiên cho từng avatar
      tier: 1,
      footRings: 0,
      hasBodyAura: false,
      auraType: null,
      expression: 'normal',
      isBlinking: false,
      blinkTimer: 0,
      isPaused: false,
      isLionCelebrating: false,
      lionTimer: 0,
      donateFx: null,
      likeJump: null
    },

    setFootRings(level = 0) {
      this.state.footRings = Number(level) || 0;
      if (this.accessories.footRings) {
        const { ring1, ring2, ring3 } = this.accessories.footRings;
        if (ring1) ring1.visible = this.state.footRings >= 1;
        if (ring2) ring2.visible = this.state.footRings >= 2;
        if (ring3) ring3.visible = this.state.footRings >= 3;
      }
    },

    setBodyAura(typeOrBool = false) {
      if (this.accessories.auraController) {
        this.accessories.auraController.setAura(typeOrBool);
        this.state.hasBodyAura = this.accessories.auraController.isVisible;
        this.state.auraType = this.accessories.auraController.currentType;
      } else if (this.accessories.bodyAura) {
        this.state.hasBodyAura = Boolean(typeOrBool);
        this.accessories.bodyAura.visible = this.state.hasBodyAura;
      }
    },

    setPalette(newKey) {
      if (!sharedMaterialsPool[newKey]) return;
      this.currentPaletteKey = newKey;
      const pal = SLIME_PALETTES[newKey] || ULTRA_PALETTES[newKey];
      const newMat = getClonedSlimeMaterial(newKey);
      this.slimeMesh.material = newMat;
      if (this.userData) this.userData.slimeMat = newMat;
      if (this.mesh && this.mesh.userData) this.mesh.userData.slimeMat = newMat;
      if (this.accessories.sideMochis) {
        if (this.accessories.sideMochis.mochiL) {
          this.accessories.sideMochis.mochiL.material = getClonedSlimeMaterial(newKey);
        }
        if (this.accessories.sideMochis.mochiR) {
          this.accessories.sideMochis.mochiR.material = getClonedSlimeMaterial(newKey);
        }
      }
      if (this.accessories.horns && this.accessories.horns.hornMat) {
        this.accessories.horns.hornMat.emissive.setHex(pal.eyeGlow);
      }
      if (this.accessories.tail && this.accessories.tail.tailSegment) {
        this.accessories.tail.tailSegment.material = getClonedSlimeMaterial(newKey);
      }
      // Vòng chân (auraRing) và Halo luôn luôn cố định là Gold hoàng gia, không bị đổi màu theo Chubby!
      if (this.accessories.auraRing) {
        if (this.accessories.auraRing.discMat) this.accessories.auraRing.discMat.color.setHex(0xffd700);
        if (this.accessories.auraRing.torusMat) this.accessories.auraRing.torusMat.emissive.setHex(0xffd700);
        if (this.accessories.auraRing.innerMat) this.accessories.auraRing.innerMat.emissive.setHex(0xffd700);
      }
      this.eyeLeft.rim.material.color.setHex(pal.eyeGlow);
      this.eyeRight.rim.material.color.setHex(pal.eyeGlow);
      if (this.eyeLeft.cornea?.material) {
        this.eyeLeft.cornea.material.color.setHex(pal.corneaColor || 0x05050e);
      }
      if (this.eyeRight.cornea?.material) {
        this.eyeRight.cornea.material.color.setHex(pal.corneaColor || 0x05050e);
      }
      this.blushL.material.color.setHex(pal.blushColor);
      this.blushR.material.color.setHex(pal.blushColor);
    },

    setGender(gender) {
      this.userData.gender = gender;
      const hasBlush = (gender === 'female');
      this.blushL.visible = hasBlush;
      this.blushR.visible = hasBlush;
    },

    // ====================================================
    // USER SPECIFIED 5-TIER PROGRESSION:
    // Tie1: Bán cầu (Half-sphere luồng chính)
    // Tie2: Chubby
    // Tie3: Chubby + Mochi 2 bên
    // Tie4: Chubby + Mochi 2 bên + Sừng + Đuôi
    // Tie5: Chubby + Mochi 2 bên + Sừng + Đuôi + Halo
    // ====================================================
    setTier(tierNum) {
      this.state.tier = tierNum;

      // Reset all accessories
      if (this.accessories.sideMochis) this.accessories.sideMochis.visible = false;
      if (this.accessories.horns) this.accessories.horns.visible = false;
      if (this.accessories.tail) this.accessories.tail.visible = false;
      if (this.accessories.halo) this.accessories.halo.visible = false;
      if (this.accessories.auraRing) this.accessories.auraRing.visible = false;
      if (this.accessories.headphones) this.accessories.headphones.visible = false;
      if (this.accessories.miniPet) this.accessories.miniPet.visible = false;

      if (tierNum === 1) {
        // Tie1: Bán Cầu (Free Tier - Half Sphere luồng chính)
        this.slimeMesh.geometry = sharedBasicHalfSphereGeometry;
        this.faceGroup.position.set(0, 0, -0.17);
      } else {
        // Tie2 - Tie5: Chubby Mochi Geometry
        this.slimeMesh.geometry = sharedChubbyMochiGeometry;
        this.faceGroup.position.set(0, 0, 0);

        if (tierNum === 2) {
          // Tie2: Chubby (No accessories)
        } else if (tierNum === 3) {
          // Tie3: Chubby + Mochi 2 bên
          if (this.accessories.sideMochis) this.accessories.sideMochis.visible = true;
        } else if (tierNum === 4) {
          // Tie4: Chubby + Mochi 2 bên + Sừng + Đuôi
          if (this.accessories.sideMochis) this.accessories.sideMochis.visible = true;
          if (this.accessories.horns) this.accessories.horns.visible = true;
          if (this.accessories.tail) this.accessories.tail.visible = true;
        } else if (tierNum === 5) {
          // Tie5: Chubby + Mochi 2 bên + Sừng + Đuôi + Halo (VIP Max)
          if (this.accessories.sideMochis) this.accessories.sideMochis.visible = true;
          if (this.accessories.horns) this.accessories.horns.visible = true;
          if (this.accessories.tail) this.accessories.tail.visible = true;
          if (this.accessories.halo) this.accessories.halo.visible = true;
          if (this.accessories.auraRing) this.accessories.auraRing.visible = true;
        }
      }

      // Hủy bỏ các động tác nhảy đặc thù nếu bị hạ cấp xuống dưới tier yêu cầu
      if (this.state.activeDanceAction) {
        if (tierNum < 4 && this.state.activeDanceAction.type === 'flip') {
          this.state.activeDanceAction = null;
          this.rootNode.rotation.set(0, 0, 0);
        } else if (tierNum < 3 && this.state.activeDanceAction.type === 'spin') {
          this.state.activeDanceAction = null;
          this.rootNode.rotation.set(0, 0, 0);
        }
      }
      if (this.state.activeFlourish) {
        if (tierNum < 4 && this.state.activeFlourish.type === 'flip') {
          this.state.activeFlourish = null;
          this.rootNode.rotation.set(0, 0, 0);
        } else if (tierNum < 3 && this.state.activeFlourish.type === 'spin') {
          this.state.activeFlourish = null;
          this.rootNode.rotation.set(0, 0, 0);
        }
      }
    },

    setExpression(exp) {
      this.state.expression = exp;
      if (exp === 'wink') {
        this.eyeLeft.eyeHolder.scale.set(1.0, 1.0, 1.0);
        this.eyeRight.eyeHolder.scale.set(1.0, 0.15, 1.0);
      } else if (exp === 'smile') {
        this.eyeLeft.eyeHolder.scale.set(1.0, 0.2, 1.0);
        this.eyeRight.eyeHolder.scale.set(1.0, 0.2, 1.0);
      } else {
        this.eyeLeft.eyeHolder.scale.set(1.0, 1.0, 1.0);
        this.eyeRight.eyeHolder.scale.set(1.0, 1.0, 1.0);
      }
    },

    setPaused(paused) {
      this.state.isPaused = paused;
      if (paused) {
        this.state.donateFx = null;
        this.state.isLionCelebrating = false;
        this.state.activeDanceAction = null;
        this.state.activeFlourish = null;
        this.rootNode.scale.set(1.0, 1.0, 1.0);
        this.rootNode.position.y = 0.12;
        this.rootNode.rotation.set(0, 0, 0);
        this.setExpression('normal');
        this.eyeLeft.eyeHolder.scale.set(1.0, 1.0, 1.0);
        this.eyeRight.eyeHolder.scale.set(1.0, 1.0, 1.0);
      }
    },

    // ====================================================
    // Điệu Nhảy Phân Theo Tier:
    // - Tier 1 & 2: Chỉ nhún nhảy default (Squash & Stretch + Nhảy theo nhịp).
    // - Tier 3: Nhún nhảy default + có thể Xoay Tròn 360 độ (quanh trục Y).
    // - Tier 4 & 5: Nhún nhảy default + Xoay Tròn 360 độ + Lộn Vòng 360 độ (Flip quanh trục X).
    // ====================================================
    triggerDanceMove(moveType) {
      if (this.state.isPaused || this.state.isLionCelebrating || this.state.donateFx) {
        return { success: false, reason: 'busy' };
      }

      const currentTier = this.state.tier || 1;

      if (moveType === 'spin') {
        // Chỉ Tier 3 trở lên mới có thể xoay tròn
        if (currentTier < 3) {
          return { success: false, reason: 'tier_too_low', minTier: 3, currentTier };
        }
        this.state.activeDanceAction = { type: 'spin', timer: 0, duration: 1.0 };
        return { success: true, move: 'spin', tier: currentTier };
      }

      if (moveType === 'flip') {
        // Chỉ Tier 4 và 5 mới có thể lộn vòng
        if (currentTier < 4) {
          return { success: false, reason: 'tier_too_low', minTier: 4, currentTier };
        }
        this.state.activeDanceAction = { type: 'flip', timer: 0, duration: 1.2 };
        return { success: true, move: 'flip', tier: currentTier };
      }

      if (moveType === 'bounce') {
        this.state.activeDanceAction = null;
        this.state.activeFlourish = null;
        this.rootNode.rotation.set(0, 0, 0);
        return { success: true, move: 'bounce', tier: currentTier };
      }

      return { success: false, reason: 'unknown_move' };
    },

    triggerLikeJump() {
      if (this.state.isPaused || this.state.isLionCelebrating || this.state.donateFx) return;
      this.state.likeJump = {
        timer: 0,
        duration: 0.65,
        apex: 1.65
      };
      this.setExpression('smile');
    },

    shuffleDanceMove() {
      if (this.state.isPaused || this.state.isLionCelebrating || this.state.donateFx) return;
      const currentTier = this.state.tier || 1;
      if (currentTier === 3) {
        const dir = Math.random() > 0.5 ? 1 : -1;
        this.state.activeFlourish = { type: 'spin', dir, timer: 0, duration: 1.0, height: 0.58 };
        if (Math.random() > 0.5) this.setExpression('smile');
      } else if (currentTier >= 4) {
        if (Math.random() > 0.5) {
          const dir = Math.random() > 0.4 ? -1 : 1;
          this.state.activeFlourish = { type: 'flip', dir, timer: 0, duration: 1.15, height: 0.82 };
          this.setExpression('smile');
        } else {
          const dir = Math.random() > 0.5 ? 1 : -1;
          this.state.activeFlourish = { type: 'spin', dir, timer: 0, duration: 1.0, height: 0.58 };
          this.setExpression('wink');
        }
      }
    },

    setAutoDanceRoutine(enabled) {
      this.state.autoDanceRoutine = !!enabled;
      if (!enabled && !this.state.activeDanceAction) {
        this.state.activeFlourish = null;
        this.rootNode.rotation.set(0, 0, 0);
      }
    },

    // Phân chia hiệu ứng donate theo nhóm:
    // - Quà nhỏ ('small'):
    //   + 1 xu: 1 nhịp nhảy (1.0s, apex 3.8m)
    //   + 5 xu: 3 nhịp nhảy liên hoàn (2.0s)
    //   + 10 xu: 1 nhịp nhảy cao phấn khích (2.0s, apex 4.2m)
    // - Quà trung ('medium'): Nhảy lên 4.8m + xoay 360 độ (2.0s - 4.0s theo mốc 20, 50, 100 xu).
    // - Quà cao cấp ('high'): Slime vinh danh lơ lửng, halo xoay, mắt cười (2.5s - 4.0s).
    // - Quà xa xỉ ('ultra'): Giữ nguyên Coronation sequence 7.6s.
    triggerDonateAnimation(typeOrConfig = 'small', upgradeTier = false, targetTier = 1, coins = 1) {
      let type = 'small';
      let subType = 'drop_single';
      let duration = 1.0;
      let jumpCount = 1;

      if (typeof typeOrConfig === 'object' && typeOrConfig !== null) {
        type = typeOrConfig.type || 'small';
        subType = typeOrConfig.subType || 'drop_single';
        coins = typeOrConfig.coins !== undefined ? typeOrConfig.coins : 1;
        duration = typeOrConfig.duration || 1.0;
        upgradeTier = Boolean(typeOrConfig.upgradeTier);
        targetTier = typeOrConfig.targetTier || 1;
      } else {
        type = typeOrConfig;
        if (type === 'small') {
          if (coins >= 10) {
            subType = 'drop_burst';
            duration = 2.0;
          } else if (coins >= 5) {
            subType = 'drop_cascade';
            jumpCount = 3;
            duration = 2.0;
          } else {
            subType = 'drop_single';
            duration = 1.0;
          }
        } else if (type === 'medium') {
          if (coins >= 80) {
            subType = 'orbit_triple';
            duration = (coins >= 100) ? 4.0 : 3.5;
          } else if (coins >= 50) {
            subType = 'orbit_double';
            duration = 3.0;
          } else if (coins >= 30) {
            subType = 'orbit_trail';
            duration = 2.5;
          } else if (coins >= 20) {
            subType = 'orbit_narrow';
            duration = 2.0;
          } else {
            subType = 'orbit_narrow';
            duration = 1.5;
          }
        } else if (type === 'high') {
          subType = 'vip_celebrate';
          duration = coins >= 5000 ? 4.0 : (coins >= 1000 ? 3.6 : (coins >= 700 ? 3.2 : 2.5));
        }
      }

      // Quà cao cấp & Siêu xa xỉ: Chuyển toàn bộ vinh danh lên Cinematic Showcase Foreground,
      // triệt tiêu hoàn toàn hiệu ứng ăn mừng trên sàn (không phóng lên 4.2m, không lơ lửng)
      if (type === 'ultra' || type === 'high') {
        this.state.isLionCelebrating = false;
        this.state.donateFx = null;
        if (upgradeTier) {
          this.setTier(targetTier || (type === 'ultra' ? 5 : 3));
        }
        return;
      }
      this.state.isLionCelebrating = false;

      this.state.donateFx = {
        type,
        subType,
        timer: 0,
        duration,
        jumpCount,
        coins,
        upgradeTier,
        targetTier
      };
      if (upgradeTier) {
        this.setTier(targetTier);
      }
      this.setExpression('smile');
    },

    triggerLionCelebration(upgradeTier = false) {
      this.state.donateFx = null;
      this.state.isLionCelebrating = true;
      this.state.lionTimer = 0;
      if (upgradeTier) {
        this.setTier(5);
      }
      // Giữ nguyên màu sắc/bảng màu gốc của avatar, KHÔNG ép đổi sang màu vàng 'gold'!
      this.setExpression('smile');
    },

    update(deltaTime, audioKick = 0) {
      if (this.state.isPaused) return;

      // 0. Update rotating body aura and rising bubbles
      if (this.accessories.auraController) {
        this.accessories.auraController.update(deltaTime);
      }

      // 1. Lion Celebration (Quà xa xỉ / Siêu xa xỉ: 7.6s)
      if (this.state.isLionCelebrating) {
        this.state.lionTimer += deltaTime;
        const t = this.state.lionTimer;

        if (t < 0.6) {
          const p = t / 0.6;
          this.rootNode.scale.set(1.0 + p * 0.4, 1.0 - p * 0.45, 1.0 + p * 0.4);
          this.rootNode.position.y = 0.05;
          this.rootNode.rotation.set(0, 0, 0);
        } else if (t < 2.5) {
          const p = (t - 0.6) / 1.9;
          const easeLaunch = 1.0 - Math.pow(1.0 - p, 2.5);
          this.rootNode.position.y = 0.12 + easeLaunch * 4.2;
          this.rootNode.rotation.x = -Math.PI * 4 * p;
          this.rootNode.rotation.y = Math.PI * 6 * p;

          const stretchY = 1.0 + Math.sin(p * Math.PI) * 0.5;
          const pinchXZ = 1.0 - Math.sin(p * Math.PI) * 0.2;
          this.rootNode.scale.set(pinchXZ, stretchY, pinchXZ);
        } else if (t < 6.2) {
          const hoverY = 4.2 + Math.sin((t - 2.5) * 3.8) * 0.25;
          this.rootNode.position.y = hoverY;
          this.rootNode.rotation.x = 0;
          this.rootNode.rotation.y += deltaTime * 2.8;

          const breath = 1.0 + Math.sin((t - 2.5) * 6) * 0.08;
          this.rootNode.scale.set(breath, 2.0 - breath, breath);

          if (this.accessories.halo.visible) {
            this.accessories.halo.rotation.z += 4.0 * deltaTime;
          }
        } else if (t < 7.6) {
          const p = (t - 6.2) / 1.4;
          this.rootNode.rotation.x = 0;
          this.rootNode.rotation.y = THREE.MathUtils.lerp(this.rootNode.rotation.y, 0, 0.12);
          const currentY = THREE.MathUtils.lerp(4.2, 0.12, Math.pow(p, 2.2));
          this.rootNode.position.y = currentY;

          if (p > 0.8) {
            const impactP = (p - 0.8) / 0.2;
            const squish = Math.sin(impactP * Math.PI) * 0.35;
            this.rootNode.scale.set(1.0 + squish, 1.0 - squish, 1.0 + squish);
          } else {
            this.rootNode.scale.set(1.0, 1.0, 1.0);
          }
        } else {
          this.state.isLionCelebrating = false;
          this.rootNode.rotation.set(0, 0, 0);
          this.rootNode.position.y = 0.12;
          this.rootNode.scale.set(1.0, 1.0, 1.0);
          // Khôi phục mắt mở to trở lại trạng thái ban đầu và cho phép chớp mắt bình thường
          this.setExpression('normal');
          this.eyeLeft.eyeHolder.scale.set(1.0, 1.0, 1.0);
          this.eyeRight.eyeHolder.scale.set(1.0, 1.0, 1.0);
        }

        if (this.accessories.auraRing.visible) {
          this.accessories.auraRing.rotation.y += 3.5 * deltaTime;
        }
        return;
      }

      // 2. Categorized Donate Effects: Quà nhỏ, Quà trung, Quà cao cấp
      if (this.state.donateFx) {
        this.state.donateFx.timer += deltaTime;
        const t = this.state.donateFx.timer;
        const fxType = this.state.donateFx.type;

        const subType = this.state.donateFx.subType || 'drop_single';
        const totalDur = this.state.donateFx.duration || 1.0;

        if (fxType === 'small') {
          if (subType === 'drop_cascade') {
            // TẶNG 5 COIN: 3 nhịp nhảy liên hoàn vui sướng trong trọn vẹn 2.0s (mỗi nhịp ~0.66s)
            const jumpDuration = totalDur / 3.0; // 0.666s
            const jumpIndex = Math.min(2, Math.floor(t / jumpDuration));
            const subT = t - jumpIndex * jumpDuration;
            const subP = subT / jumpDuration;
            const apexY = jumpIndex === 0 ? 2.2 : (jumpIndex === 1 ? 2.6 : 3.0);

            if (subP < 0.44) {
              const pUp = subP / 0.44;
              const easeUp = Math.sin(pUp * Math.PI * 0.5);
              this.rootNode.position.y = 0.12 + easeUp * (apexY - 0.12);
              this.rootNode.rotation.set(0, 0, 0);
              const stretchY = 1.0 + Math.sin(pUp * Math.PI) * 0.35;
              const pinchXZ = 1.0 - Math.sin(pUp * Math.PI) * 0.14;
              this.rootNode.scale.set(pinchXZ, stretchY, pinchXZ);
            } else if (subP < 0.85) {
              const pDown = (subP - 0.44) / 0.41;
              const easeDown = Math.pow(pDown, 2.0);
              this.rootNode.position.y = THREE.MathUtils.lerp(apexY, 0.12, easeDown);
              this.rootNode.rotation.set(0, 0, 0);
              this.rootNode.scale.set(1.0, 1.0, 1.0);
            } else {
              const pSquish = (subP - 0.85) / 0.15;
              const squish = Math.sin(pSquish * Math.PI) * (jumpIndex === 2 ? 0.38 : 0.25);
              this.rootNode.position.y = 0.12;
              this.rootNode.rotation.set(0, 0, 0);
              this.rootNode.scale.set(1.0 + squish, 1.0 - squish, 1.0 + squish);
            }

            if (t >= totalDur) {
              this.state.donateFx = null;
              this.rootNode.position.y = 0.12;
              this.rootNode.rotation.set(0, 0, 0);
              this.rootNode.scale.set(1.0, 1.0, 1.0);
              this.setExpression('normal');
              this.eyeLeft.eyeHolder.scale.set(1.0, 1.0, 1.0);
              this.eyeRight.eyeHolder.scale.set(1.0, 1.0, 1.0);
            }
          } else if (subType === 'drop_burst') {
            // TẶNG 10 COIN: Bật nhảy cao phấn khích 4.2m lơ lửng rồi tiếp đất (2.0s)
            if (t < 0.55) {
              const p = t / 0.55;
              const easeUp = Math.sin(p * Math.PI * 0.5);
              this.rootNode.position.y = 0.12 + easeUp * 4.08;
              this.rootNode.rotation.set(0, 0, 0);
              const stretchY = 1.0 + Math.sin(p * Math.PI) * 0.48;
              const pinchXZ = 1.0 - Math.sin(p * Math.PI) * 0.18;
              this.rootNode.scale.set(pinchXZ, stretchY, pinchXZ);
            } else if (t < 1.25) {
              // Lơ lửng đỉnh nhấp nhô phấn khích
              const p = (t - 0.55) / 0.70;
              const floatY = Math.sin(p * Math.PI * 2) * 0.18;
              this.rootNode.position.y = 4.2 + floatY;
              this.rootNode.rotation.z = Math.sin(p * Math.PI * 3) * 0.08;
              this.rootNode.scale.set(1.0, 1.0, 1.0);
            } else if (t < 1.82) {
              // Rơi nhanh xuống sàn
              const p = (t - 1.25) / 0.57;
              const easeDown = Math.pow(p, 2.2);
              this.rootNode.position.y = THREE.MathUtils.lerp(4.2, 0.12, easeDown);
              this.rootNode.rotation.set(0, 0, 0);
              this.rootNode.scale.set(1.0, 1.0, 1.0);
            } else if (t < totalDur) {
              // Tiếp đất squish mạnh
              const p = (t - 1.82) / (totalDur - 1.82);
              const squish = Math.sin(p * Math.PI) * 0.38;
              this.rootNode.position.y = 0.12;
              this.rootNode.rotation.set(0, 0, 0);
              this.rootNode.scale.set(1.0 + squish, 1.0 - squish, 1.0 + squish);
            } else {
              this.state.donateFx = null;
              this.rootNode.position.y = 0.12;
              this.rootNode.rotation.set(0, 0, 0);
              this.rootNode.scale.set(1.0, 1.0, 1.0);
              this.setExpression('normal');
              this.eyeLeft.eyeHolder.scale.set(1.0, 1.0, 1.0);
              this.eyeRight.eyeHolder.scale.set(1.0, 1.0, 1.0);
            }
          } else {
            // TẶNG 1 COIN: Đúng 1 cú nhảy duy nhất trong đúng 1.0s
            if (t < 0.45) {
              const p = t / 0.45;
              const easeUp = Math.sin(p * Math.PI * 0.5);
              this.rootNode.position.y = 0.12 + easeUp * 3.68;
              this.rootNode.rotation.set(0, 0, 0);
              const stretchY = 1.0 + Math.sin(p * Math.PI) * 0.45;
              const pinchXZ = 1.0 - Math.sin(p * Math.PI) * 0.18;
              this.rootNode.scale.set(pinchXZ, stretchY, pinchXZ);
            } else if (t < 0.85) {
              const p = (t - 0.45) / 0.40;
              const easeDown = Math.pow(p, 2.0);
              this.rootNode.position.y = THREE.MathUtils.lerp(3.8, 0.12, easeDown);
              this.rootNode.rotation.set(0, 0, 0);
              this.rootNode.scale.set(1.0, 1.0, 1.0);
            } else if (t < totalDur) {
              const p = (t - 0.85) / 0.15;
              const squish = Math.sin(p * Math.PI) * 0.32;
              this.rootNode.position.y = 0.12;
              this.rootNode.rotation.set(0, 0, 0);
              this.rootNode.scale.set(1.0 + squish, 1.0 - squish, 1.0 + squish);
            } else {
              this.state.donateFx = null;
              this.rootNode.position.y = 0.12;
              this.rootNode.rotation.set(0, 0, 0);
              this.rootNode.scale.set(1.0, 1.0, 1.0);
              this.setExpression('normal');
              this.eyeLeft.eyeHolder.scale.set(1.0, 1.0, 1.0);
              this.eyeRight.eyeHolder.scale.set(1.0, 1.0, 1.0);
            }
          }
        } else if (fxType === 'medium') {
          // QUÀ TRUNG 20 - 100 COIN: Nhảy vút 4.8m + xoay 360 độ (2.0s - 4.0s tương ứng, default 1.5s)
          const launchDur = 0.50;
          const landDur = (totalDur <= 1.5) ? 0.50 : 0.40;
          const hoverDur = (totalDur <= 1.5) ? 0.50 : Math.max(0.50, totalDur - launchDur - landDur);

          if (t < launchDur) {
            // Phóng vút lên cao (y: 0.12 -> 4.8m)
            const p = t / launchDur;
            const easeUp = Math.sin(p * Math.PI * 0.5);
            this.rootNode.position.y = 0.12 + easeUp * 4.68;
            this.rootNode.rotation.set(0, 0, 0);
            const stretchY = 1.0 + Math.sin(p * Math.PI) * 0.48;
            const pinchXZ = 1.0 - Math.sin(p * Math.PI) * 0.20;
            this.rootNode.scale.set(pinchXZ, stretchY, pinchXZ);
          } else if (t <= (launchDur + hoverDur)) {
            // Lơ lửng xoay tròn 360 độ quanh trục Y (đúng Math.PI * 2 tại t = launchDur + hoverDur)
            const p = Math.min(1.0, Math.max(0, (t - launchDur) / hoverDur));
            const hoverFloat = Math.sin(p * Math.PI) * 0.15;
            this.rootNode.position.y = 4.8 + hoverFloat;
            this.rootNode.rotation.x = 0;
            this.rootNode.rotation.z = 0;
            this.rootNode.rotation.y = p * Math.PI * 2;
            this.rootNode.scale.set(1.0, 1.0, 1.0);
          } else if (t < (totalDur - 0.12)) {
            // Rớt xuống sàn tự do
            const p = (t - (launchDur + hoverDur)) / Math.max(0.01, totalDur - 0.12 - (launchDur + hoverDur));
            const easeDown = Math.pow(p, 2.2);
            this.rootNode.position.y = THREE.MathUtils.lerp(4.8, 0.12, easeDown);
            this.rootNode.rotation.y = THREE.MathUtils.lerp(Math.PI * 2, 0, p);
            this.rootNode.scale.set(1.0, 1.0, 1.0);
          } else if (t < totalDur) {
            // Tiếp đất squish
            const p = (t - (totalDur - 0.12)) / 0.12;
            const squish = Math.sin(p * Math.PI) * 0.38;
            this.rootNode.position.y = 0.12;
            this.rootNode.rotation.set(0, 0, 0);
            this.rootNode.scale.set(1.0 + squish, 1.0 - squish, 1.0 + squish);
          } else {
            this.state.donateFx = null;
            this.rootNode.position.y = 0.12;
            this.rootNode.rotation.set(0, 0, 0);
            this.rootNode.scale.set(1.0, 1.0, 1.0);
            this.setExpression('normal');
            this.eyeLeft.eyeHolder.scale.set(1.0, 1.0, 1.0);
            this.eyeRight.eyeHolder.scale.set(1.0, 1.0, 1.0);
          }
        } else if (fxType === 'high' || subType === 'vip_celebrate') {
          // QUÀ CAO CẤP: Slime ở sàn được spotlight rọi, lơ lửng ăn mừng trong suốt thời gian 2D chạy (2.5s - 4.0s)
          if (t < (totalDur - 0.35)) {
            const hoverY = 0.38 + Math.sin(t * 6.0) * 0.08;
            this.rootNode.position.y = hoverY;
            this.rootNode.rotation.z = Math.sin(t * 5.0) * 0.08;
            this.rootNode.rotation.y = Math.sin(t * 2.5) * 0.25;
            this.rootNode.scale.set(1.08, 1.08, 1.08);
          } else if (t < totalDur) {
            // Thu về tiếp đất êm ái
            const p = (t - (totalDur - 0.35)) / 0.35;
            this.rootNode.position.y = THREE.MathUtils.lerp(0.38, 0.12, p);
            this.rootNode.rotation.set(0, 0, 0);
            this.rootNode.scale.set(1.0, 1.0, 1.0);
          } else {
            this.state.donateFx = null;
            this.rootNode.position.y = 0.12;
            this.rootNode.rotation.set(0, 0, 0);
            this.rootNode.scale.set(1.0, 1.0, 1.0);
            this.setExpression('normal');
            this.eyeLeft.eyeHolder.scale.set(1.0, 1.0, 1.0);
            this.eyeRight.eyeHolder.scale.set(1.0, 1.0, 1.0);
          }
        }

        if (this.accessories.halo && this.accessories.halo.visible) {
          this.accessories.halo.rotation.z += 3.0 * deltaTime;
        }
        if (this.accessories.auraRing && this.accessories.auraRing.visible) {
          this.accessories.auraRing.rotation.y += 2.0 * deltaTime;
        }
        return;
      }

      // 3. Like Jump (Nhảy 1 lần khi người xem like)
      if (this.state.likeJump) {
        this.state.likeJump.timer += deltaTime;
        const lj = this.state.likeJump;
        const p = Math.min(1.0, lj.timer / lj.duration);

        if (p < 0.35) {
          const pUp = p / 0.35;
          const easeUp = Math.sin(pUp * Math.PI * 0.5);
          this.rootNode.position.y = 0.12 + easeUp * (lj.apex - 0.12);
          this.rootNode.rotation.set(0, 0, 0);
          const stretchY = 1.0 + Math.sin(pUp * Math.PI) * 0.35;
          const pinchXZ = 1.0 - Math.sin(pUp * Math.PI) * 0.14;
          this.rootNode.scale.set(pinchXZ, stretchY, pinchXZ);
        } else if (p < 0.80) {
          const pDown = (p - 0.35) / 0.45;
          const easeDown = Math.pow(pDown, 2.0);
          this.rootNode.position.y = THREE.MathUtils.lerp(lj.apex, 0.12, easeDown);
          this.rootNode.rotation.set(0, 0, 0);
          this.rootNode.scale.set(1.0, 1.0, 1.0);
        } else {
          const pSquish = (p - 0.80) / 0.20;
          const squish = Math.sin(pSquish * Math.PI) * 0.28;
          this.rootNode.position.y = 0.12;
          this.rootNode.rotation.set(0, 0, 0);
          this.rootNode.scale.set(1.0 + squish, 1.0 - squish, 1.0 + squish);
        }

        if (p >= 1.0) {
          this.state.likeJump = null;
          this.rootNode.position.y = 0.12;
          this.rootNode.rotation.set(0, 0, 0);
          this.rootNode.scale.set(1.0, 1.0, 1.0);
          this.setExpression('normal');
        }
        return;
      }

      // Standard Kinematics & Tier Dance Choreography
      const bps = this.state.bpm / 60;
      this.state.bpmPhase = (this.state.bpmPhase + deltaTime * bps * Math.PI * 2) % (Math.PI * 2);
      const kickEffect = Math.max(0, audioKick);
      const tier = this.state.tier || 1;

      let scaleY = 1.0, scaleXZ = 1.0, jumpY = 0;
      let rotX = 0, rotY = 0, rotZ = 0;

      if (this.state.activeDanceAction) {
        // Động tác nhảy kích hoạt thủ công (On-Demand Dance Action)
        this.state.activeDanceAction.timer += deltaTime;
        const action = this.state.activeDanceAction;
        const p = Math.min(1.0, Math.max(0, action.timer / action.duration));

        if (action.type === 'spin' && tier >= 3) {
          // Xoay tròn 360 độ quanh trục Y (Tier 3, 4, 5)
          jumpY = Math.sin(p * Math.PI) * 0.58 + kickEffect * 0.25;
          rotY = p * Math.PI * 2;
          rotX = 0;
          rotZ = 0;

          if (p < 0.18) {
            const squish = ((0.18 - p) / 0.18) * 0.20;
            scaleY = 1.0 - squish;
            scaleXZ = 1.0 + squish * 0.7;
          } else if (p > 0.82) {
            const squish = Math.sin(((p - 0.82) / 0.18) * Math.PI) * 0.25;
            scaleY = 1.0 - squish;
            scaleXZ = 1.0 + squish * 0.8;
          } else {
            const stretch = Math.sin(((p - 0.18) / 0.64) * Math.PI) * 0.18;
            scaleY = 1.0 + stretch;
            scaleXZ = 1.0 - stretch * 0.08;
          }
        } else if (action.type === 'flip' && tier >= 4) {
          // Lộn vòng 360 độ quanh trục X (Somersault Flip - Tier 4 & 5)
          jumpY = Math.sin(p * Math.PI) * 0.82 + kickEffect * 0.35;
          rotX = -p * Math.PI * 2;
          rotY = 0;
          rotZ = 0;

          if (p < 0.18) {
            const squish = ((0.18 - p) / 0.18) * 0.28;
            scaleY = 1.0 - squish;
            scaleXZ = 1.0 + squish * 0.8;
          } else if (p > 0.82) {
            const squish = Math.sin(((p - 0.82) / 0.18) * Math.PI) * 0.30;
            scaleY = 1.0 - squish;
            scaleXZ = 1.0 + squish * 0.8;
          } else {
            scaleY = 0.94;
            scaleXZ = 0.94;
          }
        }

        if (p >= 1.0) {
          this.state.activeDanceAction = null;
          rotX = 0;
          rotY = 0;
          rotZ = 0;
        }
      } else if (this.state.activeFlourish) {
        // 2. Động tác ngẫu hứng sinh động (Spontaneous Organic Flourish)
        this.state.activeFlourish.timer += deltaTime;
        const fl = this.state.activeFlourish;
        const p = Math.min(1.0, Math.max(0, fl.timer / fl.duration));

        if (fl.type === 'spin' && tier >= 3) {
          // Xoay tròn ngẫu hứng 360 độ (chiều quay ngẫu nhiên fl.dir: ±1, độ cao biến thiên)
          jumpY = Math.sin(p * Math.PI) * fl.height + kickEffect * 0.25;
          rotY = p * Math.PI * 2 * fl.dir;
          rotX = 0;
          rotZ = 0;

          if (p < 0.18) {
            const squish = ((0.18 - p) / 0.18) * 0.20;
            scaleY = 1.0 - squish;
            scaleXZ = 1.0 + squish * 0.7;
          } else if (p > 0.82) {
            const squish = Math.sin(((p - 0.82) / 0.18) * Math.PI) * 0.25;
            scaleY = 1.0 - squish;
            scaleXZ = 1.0 + squish * 0.8;
          } else {
            const stretch = Math.sin(((p - 0.18) / 0.64) * Math.PI) * 0.18;
            scaleY = 1.0 + stretch;
            scaleXZ = 1.0 - stretch * 0.08;
          }
        } else if (fl.type === 'flip' && tier >= 4) {
          // Lộn vòng ngẫu hứng 360 độ (lộn tới hoặc lộn lùi fl.dir: ±1)
          jumpY = Math.sin(p * Math.PI) * fl.height + kickEffect * 0.35;
          rotX = p * Math.PI * 2 * fl.dir;
          rotY = 0;
          rotZ = 0;

          if (p < 0.18) {
            const squish = ((0.18 - p) / 0.18) * 0.28;
            scaleY = 1.0 - squish;
            scaleXZ = 1.0 + squish * 0.8;
          } else if (p > 0.82) {
            const squish = Math.sin(((p - 0.82) / 0.18) * Math.PI) * 0.30;
            scaleY = 1.0 - squish;
            scaleXZ = 1.0 + squish * 0.8;
          } else {
            scaleY = 0.94;
            scaleXZ = 0.94;
          }
        }

        if (p >= 1.0) {
          this.state.activeFlourish = null;
          rotX = 0;
          rotY = 0;
          rotZ = 0;
          this.state.flourishCooldown = Math.random() * 3.0 + 2.0; // Giãn cách ngẫu nhiên 2 - 5s
          this.setExpression('normal');
        }
      } else {
        // 3. Nhún nhảy Rhythmic Bounce cơ bản & Hệ thống kích hoạt ngẫu hứng tự nhiên
        rotX = 0;
        rotY = 0;
        rotZ = 0;

        const sinVal = Math.sin(this.state.bpmPhase);
        if (sinVal < 0) {
          const squash = Math.abs(sinVal);
          scaleY = 1.0 - (squash * 0.25 + kickEffect * 0.2);
          scaleXZ = 1.0 + (squash * 0.15 + kickEffect * 0.15);
          jumpY = 0;
        } else {
          const stretch = sinVal;
          scaleY = 1.0 + (stretch * 0.25 + kickEffect * 0.3);
          scaleXZ = 1.0 - (stretch * 0.10);
          jumpY = (stretch * 0.32 + kickEffect * 0.45);
        }

        // Tự động kích hoạt ngẫu hứng sinh động nếu bật autoDanceRoutine
        if (this.state.autoDanceRoutine) {
          this.state.flourishCooldown -= deltaTime;
          if (this.state.flourishCooldown <= 0 && sinVal > 0.15) {
            if (tier === 3) {
              // Tier 3: 75% khả năng xoay tròn ngẫu hứng, đổi chiều xoay ngẫu nhiên
              if (Math.random() < 0.75) {
                const dir = Math.random() > 0.5 ? 1 : -1;
                const dur = (Math.random() > 0.4 ? 2.0 : 1.5) * (60 / this.state.bpm);
                const height = 0.52 + Math.random() * 0.15;
                this.state.activeFlourish = { type: 'spin', dir, timer: 0, duration: Math.max(0.75, dur), height };
                if (Math.random() > 0.4) this.setExpression('smile');
              } else {
                this.state.flourishCooldown = Math.random() * 2.5 + 1.5;
              }
            } else if (tier >= 4) {
              // Tier 4 & 5: Chọn ngẫu nhiên giữa Lộn Vòng (52%) và Xoay Tròn (38%)
              const roll = Math.random();
              if (roll < 0.52) {
                const dir = Math.random() > 0.35 ? -1 : 1;
                const dur = 2.0 * (60 / this.state.bpm);
                const height = 0.76 + Math.random() * 0.18;
                this.state.activeFlourish = { type: 'flip', dir, timer: 0, duration: Math.max(0.85, dur), height };
                this.setExpression('smile');
              } else if (roll < 0.90) {
                const dir = Math.random() > 0.5 ? 1 : -1;
                const dur = (Math.random() > 0.4 ? 2.0 : 1.5) * (60 / this.state.bpm);
                const height = 0.55 + Math.random() * 0.16;
                this.state.activeFlourish = { type: 'spin', dir, timer: 0, duration: Math.max(0.75, dur), height };
                if (Math.random() > 0.5) this.setExpression('wink');
              } else {
                this.state.flourishCooldown = Math.random() * 2.0 + 1.2;
              }
            } else {
              // Tier 1 & 2: Luôn giữ nhún nhảy default, không xoay hay lộn
              this.state.flourishCooldown = Math.random() * 3.0 + 2.0;
            }
          }
        }
      }

      this.rootNode.scale.set(scaleXZ, scaleY, scaleXZ);
      this.rootNode.position.y = 0.12 + jumpY;
      this.rootNode.rotation.set(rotX, rotY, rotZ);

      if (this.billboard) {
        this.billboard.position.y = 1.62 + jumpY;
      }

      // 2 Tai Mochi 2 bên nhún nhảy theo nhịp nhạc
      if (this.accessories.sideMochis && this.accessories.sideMochis.visible) {
        const earJiggle = Math.sin(this.state.bpmPhase) * 0.05 + kickEffect * 0.10;
        this.accessories.sideMochis.earNodeL.rotation.z = 0.38 + earJiggle;
        this.accessories.sideMochis.earNodeR.rotation.z = -0.38 - earJiggle;
      }

      // Wagging Devil Tail animation (sync with dance beat)
      if (this.accessories.tail && this.accessories.tail.visible) {
        this.accessories.tail.rotation.y = Math.sin(this.state.bpmPhase) * 0.42;
        this.accessories.tail.rotation.x = -0.15 + Math.cos(this.state.bpmPhase * 2) * 0.12 + kickEffect * 0.18;
      }

      if (this.accessories.halo.visible) {
        this.accessories.halo.rotation.z += 1.8 * deltaTime;
        this.accessories.halo.position.y = 1.15 * scaleY + jumpY * 0.2;
      }

      if (this.accessories.auraRing.visible) {
        if (this.accessories.auraRing.auraPerimeter) {
          this.accessories.auraRing.auraPerimeter.rotation.z += 1.4 * deltaTime;
        }
        if (this.accessories.auraRing.auraInner) {
          this.accessories.auraRing.auraInner.rotation.z -= 1.8 * deltaTime;
        }
        if (this.accessories.auraRing.runesGroup) {
          this.accessories.auraRing.runesGroup.rotation.y += 1.4 * deltaTime;
        }
      }

      this.state.blinkTimer += deltaTime;
      if (this.state.blinkTimer > 3.2) {
        if (!this.state.isBlinking && this.state.expression === 'normal') {
          this.state.isBlinking = true;
          this.eyeLeft.eyeHolder.scale.y = 0.15;
          this.eyeRight.eyeHolder.scale.y = 0.15;
        }
        if (this.state.blinkTimer > 3.36) {
          this.state.isBlinking = false;
          this.state.blinkTimer = Math.random() * 0.8;
          if (this.state.expression === 'normal') {
            this.eyeLeft.eyeHolder.scale.y = 1.0;
            this.eyeRight.eyeHolder.scale.y = 1.0;
          }
        }
      }
    }
  };

  slimeGroup.userData.controller = controller;
  return controller;
}
