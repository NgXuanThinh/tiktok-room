// preview/slime-model.js - Complete Tier Evolution (Free Tier: Half-Sphere, T1-T4: Chubby Mochi with Additive Features)
import * as THREE from 'three';

export const SLIME_PALETTES = {
  cyan: {
    name: 'Electric Cyan',
    shellColor: 0x00f2fe,
    coreEmissive: 0x005577,
    eyeGlow: 0x00f2fe,
    blushColor: 0xff007f,
    visorColor: 0x00f2fe,
    auraColor: 0xffd700
  },
  pink: {
    name: 'Synthwave Pink',
    shellColor: 0xff0874,
    coreEmissive: 0x55002a,
    eyeGlow: 0xff0874,
    blushColor: 0xff66cc,
    visorColor: 0xff0874,
    auraColor: 0xffd700
  },
  magenta: {
    name: 'Synthwave Pink',
    shellColor: 0xff0874,
    coreEmissive: 0x55002a,
    eyeGlow: 0xff0874,
    blushColor: 0xff66cc,
    visorColor: 0xff0874,
    auraColor: 0xffd700
  },
  lime: {
    name: 'Toxic Lime',
    shellColor: 0x00ff88,
    coreEmissive: 0x00441a,
    eyeGlow: 0x00ff88,
    blushColor: 0xffaa00,
    visorColor: 0x00ff88,
    auraColor: 0xffd700
  }
};

// ----------------------------------------------------
// 1. FREE TIER GEOMETRY: Simple Half-Sphere like main branch
// ----------------------------------------------------
export function createBasicHalfSphereGeometry() {
  const geom = new THREE.SphereGeometry(0.85, 24, 18);
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
  const geom = new THREE.SphereGeometry(0.85, 24, 18);
  const pos = geom.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    const ny = y / 0.85;

    if (ny < 0) {
      const bellyBulge = 1.0 + Math.sin(Math.abs(ny) * Math.PI * 0.5) * 0.32;
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
Object.entries(SLIME_PALETTES).forEach(([key, spec]) => {
  sharedMaterialsPool[key] = new THREE.MeshStandardMaterial({
    color: spec.shellColor,
    emissive: spec.coreEmissive,
    emissiveIntensity: 0.35,
    roughness: 0.12,
    metalness: 0.06,
    transparent: true,
    opacity: 0.92,
    depthWrite: true
  });
});

// Shared Accessories
export const sharedHeadbandGeom = new THREE.TorusGeometry(0.85, 0.035, 6, 16, Math.PI * 0.9);
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
 * 3D Overhead Billboard Sprite (Ported & Optimized from main branch src/avatar-manager.js)
 * Cấu trúc nhãn chuẩn:
 * - Dòng 1: Nickname / Username
 * - Dòng 2: Level Account TikTok (e.g. Lv.1, Lv.15, Lv.45)
 * - Dòng 2 (bên cạnh): Rank Donate (TOP 1, TOP 2, TOP 3, VIP) NẾU CÓ.
 * - NẾU KHÔNG CÓ RANK DONATE: Tuyệt đối không hiển thị badge rank!
 */
export function createBillboardSprite(userData = {}) {
  const rawLvl = userData.tiktokLevel || userData.level || 'Lv.1';
  const lvlText = typeof rawLvl === 'number' ? `Lv.${rawLvl}` : (String(rawLvl).startsWith('Lv.') ? String(rawLvl) : `Lv.${rawLvl}`);
  const rank = userData.donateRank || null;
  const badgeText = rank ? String(rank) : (userData.level ? String(userData.level) : lvlText);

  if (typeof document === 'undefined') {
    const dummy = new THREE.Object3D();
    dummy.scale.set(1.8, 0.9, 1.0);
    dummy.userData = { badgeText, level: lvlText, donateRank: rank };
    return dummy;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const redraw = (img = null) => {
    ctx.clearRect(0, 0, 256, 128);

    let rankTheme = null;
    if (rank) {
      const upper = String(rank).trim().toUpperCase();
      if (upper.includes('TOP 1') || upper === 'TOP1' || upper === '1') {
        rankTheme = { bg: 'rgba(32, 24, 6, 0.92)', border: '#ffd700', text: '#ffffff', label: '👑 TOP 1' };
      } else if (upper.includes('TOP 2') || upper === 'TOP2' || upper === '2') {
        rankTheme = { bg: 'rgba(25, 25, 32, 0.92)', border: '#e0e0e8', text: '#ffffff', label: '🥈 TOP 2' };
      } else if (upper.includes('TOP 3') || upper === 'TOP3' || upper === '3') {
        rankTheme = { bg: 'rgba(35, 20, 10, 0.92)', border: '#cd7f32', text: '#ffffff', label: '🥉 TOP 3' };
      } else if (upper.includes('VIP')) {
        rankTheme = { bg: 'rgba(30, 15, 45, 0.92)', border: '#c77dff', text: '#ffffff', label: '💎 VIP' };
      } else {
        rankTheme = { bg: 'rgba(10, 25, 35, 0.92)', border: '#00f2fe', text: '#ffffff', label: String(rank) };
      }
    }

    // Outer Billboard Capsule Card
    ctx.fillStyle = 'rgba(10, 10, 24, 0.88)';
    ctx.beginPath();
    ctx.roundRect(14, 18, 228, 70, 16);
    ctx.fill();

    // Outer Border Glow (Tô màu viền theo Rank nếu có, hoặc Cyan nếu là khán giả thường)
    ctx.lineWidth = rankTheme ? 2.5 : 2.0;
    ctx.strokeStyle = rankTheme ? rankTheme.border : 'rgba(0, 242, 254, 0.7)';
    ctx.stroke();

    // Circular Profile Thumbnail on Left
    ctx.save();
    ctx.beginPath();
    ctx.arc(50, 53, 24, 0, Math.PI * 2);
    ctx.clip();
    if (img) {
      ctx.drawImage(img, 26, 29, 48, 48);
    } else {
      ctx.fillStyle = userData.avatarColor || (rankTheme ? rankTheme.border : '#00f2fe');
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const initials = (userData.nickname || userData.username || 'U').replace('@', '').slice(0, 2).toUpperCase();
      ctx.fillText(initials, 50, 53);
    }
    ctx.restore();

    // Line 1: Nickname / Username
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const cleanName = (userData.nickname || userData.username || 'Viewer').slice(0, 14);
    ctx.fillText(cleanName, 84, 40);

    // Line 2: TikTok Account Level
    ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const lvlWidth = ctx.measureText(lvlText).width;
    const lvlPillW = Math.max(34, lvlWidth + 10);
    const lvlPillH = 18;
    const lvlPillX = 84;
    const lvlPillY = 55;

    // Vẽ pill Level Account TikTok: Nền tối tương phản, viền Cyan, chữ Trắng nét (#ffffff)
    ctx.fillStyle = 'rgba(8, 22, 35, 0.92)';
    ctx.beginPath();
    ctx.roundRect(lvlPillX, lvlPillY, lvlPillW, lvlPillH, 5);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.85)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff'; // Màu trắng dễ nhìn, tương phản cao
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(lvlText, lvlPillX + lvlPillW / 2, lvlPillY + lvlPillH / 2);

    // Line 2: Rank Donate NẾU CÓ (Bên cạnh Level)
    if (rankTheme) {
      ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const rankTextWidth = ctx.measureText(rankTheme.label).width;
      const rankPillW = rankTextWidth + 12;
      const rankPillH = 18;
      const rankPillX = lvlPillX + lvlPillW + 6;
      const rankPillY = 55;

      // Nền tối tương phản, viền màu Rank (Gold, Silver, Bronze, VIP), chữ Trắng (#ffffff)
      ctx.fillStyle = rankTheme.bg;
      ctx.beginPath();
      ctx.roundRect(rankPillX, rankPillY, rankPillW, rankPillH, 5);
      ctx.fill();
      ctx.strokeStyle = rankTheme.border;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = rankTheme.text; // '#ffffff'
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(rankTheme.label, rankPillX + rankPillW / 2, rankPillY + rankPillH / 2);
    }
    // NẾU KHÔNG CÓ RANK DONATE: Tuyệt đối không vẽ gì thêm!
  };

  redraw();

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(1.6, 0.8, 1.0);
  sprite.position.set(0, 1.62, 0); // Positioned comfortably above head, horns, and halo

  if (userData.avatarUrl || userData.username) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      redraw(img);
      texture.needsUpdate = true;
    };
    img.src = `/api/avatar?name=${encodeURIComponent(userData.username || '')}&url=${encodeURIComponent(userData.avatarUrl || '')}`;
  }

  sprite.userData = { canvas, ctx, texture, redraw, badgeText, level: lvlText, donateRank: rank };
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
  let currentMat = (sharedMaterialsPool[paletteKey] || sharedMaterialsPool.cyan).clone();
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

    const cornea = new THREE.Mesh(eyeCorneaGeom, blackPupilMat);
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

  const tailMat = sharedMaterialsPool[paletteKey] || sharedMaterialsPool.cyan;
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
      expression: 'normal',
      isBlinking: false,
      blinkTimer: 0,
      isPaused: false,
      isLionCelebrating: false,
      lionTimer: 0,
      donateFx: null
    },

    setPalette(newKey) {
      if (!sharedMaterialsPool[newKey]) return;
      this.currentPaletteKey = newKey;
      const pal = SLIME_PALETTES[newKey];
      this.slimeMesh.material = sharedMaterialsPool[newKey].clone();
      if (this.accessories.sideMochis) {
        if (this.accessories.sideMochis.mochiL) {
          this.accessories.sideMochis.mochiL.material = sharedMaterialsPool[newKey].clone();
        }
        if (this.accessories.sideMochis.mochiR) {
          this.accessories.sideMochis.mochiR.material = sharedMaterialsPool[newKey].clone();
        }
      }
      if (this.accessories.horns && this.accessories.horns.hornMat) {
        this.accessories.horns.hornMat.emissive.setHex(pal.eyeGlow);
      }
      if (this.accessories.tail && this.accessories.tail.tailSegment) {
        this.accessories.tail.tailSegment.material = sharedMaterialsPool[newKey] || sharedMaterialsPool.cyan;
      }
      // Vòng chân (auraRing) và Halo luôn luôn cố định là Gold hoàng gia, không bị đổi màu theo Chubby!
      if (this.accessories.auraRing) {
        if (this.accessories.auraRing.discMat) this.accessories.auraRing.discMat.color.setHex(0xffd700);
        if (this.accessories.auraRing.torusMat) this.accessories.auraRing.torusMat.emissive.setHex(0xffd700);
        if (this.accessories.auraRing.innerMat) this.accessories.auraRing.innerMat.emissive.setHex(0xffd700);
      }
      this.eyeLeft.rim.material.color.setHex(pal.eyeGlow);
      this.eyeRight.rim.material.color.setHex(pal.eyeGlow);
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
    // - Quà nhỏ ('small'): Tặng 1 xu nhảy 1 cái (1.0s); Tặng 5 xu nhảy 3 lần liên tiếp (1.8s).
    // - Quà trung ('medium') & Quà cao cấp ('high'): Nhảy lên cao trong 1s + xoay vòng tròn 0.5s rồi rớt xuống.
    // - Quà xa xỉ ('ultra'): Giữ nguyên Coronation sequence 7.6s.
    triggerDonateAnimation(type = 'small', upgradeTier = false, targetTier = 1, coins = 1) {
      if (type === 'ultra') {
        this.triggerLionCelebration(upgradeTier);
        return;
      }
      this.state.isLionCelebrating = false;

      let jumpCount = 1;
      let duration = 1.0;
      if (type === 'small') {
        if (coins >= 5) {
          jumpCount = 3; // Tặng 5 xu: nhảy 3 lần liên tiếp!
          duration = 1.8;
        } else if (coins >= 2) {
          jumpCount = 2;
          duration = 1.3;
        } else {
          jumpCount = 1; // Tặng 1 xu: nhảy 1 lần!
          duration = 1.0;
        }
      } else {
        duration = 1.5;
        jumpCount = 1;
      }

      this.state.donateFx = {
        type,
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

        if (fxType === 'small') {
          const jumpCount = this.state.donateFx.jumpCount || 1;

          if (jumpCount === 3) {
            // TẶNG 5 COIN: Nhảy 3 lần liên tiếp theo nhịp vui sướng (tổng 1.8s, mỗi lần nhảy 0.6s)
            const jumpDuration = 0.6;
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

            if (t >= 1.8) {
              this.state.donateFx = null;
              this.rootNode.position.y = 0.12;
              this.rootNode.rotation.set(0, 0, 0);
              this.rootNode.scale.set(1.0, 1.0, 1.0);
              this.setExpression('normal');
              this.eyeLeft.eyeHolder.scale.set(1.0, 1.0, 1.0);
              this.eyeRight.eyeHolder.scale.set(1.0, 1.0, 1.0);
            }
          } else if (jumpCount === 2) {
            // 2 lần nhảy liên tiếp (1.3s, mỗi lần 0.65s)
            const jumpDuration = 0.65;
            const jumpIndex = Math.min(1, Math.floor(t / jumpDuration));
            const subT = t - jumpIndex * jumpDuration;
            const subP = subT / jumpDuration;
            const apexY = jumpIndex === 0 ? 2.2 : 2.7;

            if (subP < 0.45) {
              const pUp = subP / 0.45;
              const easeUp = Math.sin(pUp * Math.PI * 0.5);
              this.rootNode.position.y = 0.12 + easeUp * (apexY - 0.12);
              this.rootNode.rotation.set(0, 0, 0);
              const stretchY = 1.0 + Math.sin(pUp * Math.PI) * 0.35;
              const pinchXZ = 1.0 - Math.sin(pUp * Math.PI) * 0.14;
              this.rootNode.scale.set(pinchXZ, stretchY, pinchXZ);
            } else if (subP < 0.85) {
              const pDown = (subP - 0.45) / 0.40;
              const easeDown = Math.pow(pDown, 2.0);
              this.rootNode.position.y = THREE.MathUtils.lerp(apexY, 0.12, easeDown);
              this.rootNode.rotation.set(0, 0, 0);
              this.rootNode.scale.set(1.0, 1.0, 1.0);
            } else {
              const pSquish = (subP - 0.85) / 0.15;
              const squish = Math.sin(pSquish * Math.PI) * 0.30;
              this.rootNode.position.y = 0.12;
              this.rootNode.rotation.set(0, 0, 0);
              this.rootNode.scale.set(1.0 + squish, 1.0 - squish, 1.0 + squish);
            }

            if (t >= 1.3) {
              this.state.donateFx = null;
              this.rootNode.position.y = 0.12;
              this.rootNode.rotation.set(0, 0, 0);
              this.rootNode.scale.set(1.0, 1.0, 1.0);
              this.setExpression('normal');
              this.eyeLeft.eyeHolder.scale.set(1.0, 1.0, 1.0);
              this.eyeRight.eyeHolder.scale.set(1.0, 1.0, 1.0);
            }
          } else {
            // TẶNG 1 COIN: 1 cú nhảy duy nhất (1.0s, đỉnh nhảy 3.8m)
            if (t < 0.45) {
              const p = t / 0.45;
              const easeUp = Math.sin(p * Math.PI * 0.5);
              this.rootNode.position.y = 0.12 + easeUp * 3.68;
              this.rootNode.rotation.set(0, 0, 0);

              const stretchY = 1.0 + Math.sin(p * Math.PI) * 0.45;
              const pinchXZ = 1.0 - Math.sin(p * Math.PI) * 0.18;
              this.rootNode.scale.set(pinchXZ, stretchY, pinchXZ);
            } else if (t < 0.88) {
              const p = (t - 0.45) / 0.43;
              const easeDown = Math.pow(p, 2.0);
              this.rootNode.position.y = THREE.MathUtils.lerp(3.8, 0.12, easeDown);
              this.rootNode.rotation.set(0, 0, 0);
              this.rootNode.scale.set(1.0, 1.0, 1.0);
            } else if (t < 1.00) {
              const p = (t - 0.88) / 0.12;
              const squish = Math.sin(p * Math.PI) * 0.35;
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
        } else if (fxType === 'medium' || fxType === 'high') {
          // QUÀ TRUNG & CAO CẤP: Nhảy vọt lên cao 4.8m + xoay 360 độ rồi rớt xuống (tổng thời gian: 1.5s)
          if (t < 0.50) {
            // Phase 1: Phóng vút lên cao (y: 0.12 -> 4.8m)
            const p = t / 0.50;
            const easeUp = Math.sin(p * Math.PI * 0.5);
            this.rootNode.position.y = 0.12 + easeUp * 4.68;
            this.rootNode.rotation.set(0, 0, 0);

            const stretchY = 1.0 + Math.sin(p * Math.PI) * 0.48;
            const pinchXZ = 1.0 - Math.sin(p * Math.PI) * 0.20;
            this.rootNode.scale.set(pinchXZ, stretchY, pinchXZ);
          } else if (t <= 1.00) {
            // Phase 2: Lơ lửng tại đỉnh và xoay trọn 1 vòng tròn 360 độ trong đúng 0.5s (từ 0.5s đến 1.0s)
            const p = Math.min(1.0, Math.max(0, (t - 0.50) / 0.50));
            const hoverFloat = Math.sin(p * Math.PI) * 0.15;
            this.rootNode.position.y = 4.8 + hoverFloat;
            this.rootNode.rotation.x = 0;
            this.rootNode.rotation.z = 0;
            this.rootNode.rotation.y = p * Math.PI * 2; // Xoay vòng tròn 360 độ quanh trục Y

            this.rootNode.scale.set(1.0, 1.0, 1.0);
          } else if (t < 1.38) {
            // Phase 3: Rớt xuống đất (y: 4.8m -> 0.12m) theo gia tốc rơi tự do
            const p = (t - 1.00) / 0.38;
            const easeDown = Math.pow(p, 2.2);
            this.rootNode.position.y = THREE.MathUtils.lerp(4.8, 0.12, easeDown);
            this.rootNode.rotation.y = THREE.MathUtils.lerp(Math.PI * 2, 0, p);
            this.rootNode.scale.set(1.0, 1.0, 1.0);
          } else if (t < 1.50) {
            // Phase 4: Tiếp đất đàn hồi (impact squish & bounce)
            const p = (t - 1.38) / 0.12;
            const squish = Math.sin(p * Math.PI) * 0.38;
            this.rootNode.position.y = 0.12;
            this.rootNode.rotation.set(0, 0, 0);
            this.rootNode.scale.set(1.0 + squish, 1.0 - squish, 1.0 + squish);
          } else {
            // Hoàn thành 1.5s: Khôi phục trạng thái chuẩn
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

  // Apply initial tier geometry and accessories immediately upon instantiation
  const initialTier = Number(userData.tier !== undefined ? userData.tier : 1);
  controller.setTier(initialTier);

  return controller;
}
