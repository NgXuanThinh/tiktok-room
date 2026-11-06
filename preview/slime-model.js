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
    auraColor: 0x00f2fe
  },
  magenta: {
    name: 'Synthwave Pink',
    shellColor: 0xff0874,
    coreEmissive: 0x55002a,
    eyeGlow: 0xff0874,
    blushColor: 0xff66cc,
    visorColor: 0xff0874,
    auraColor: 0xff0874
  },
  lime: {
    name: 'Toxic Lime',
    shellColor: 0x00ff88,
    coreEmissive: 0x00441a,
    eyeGlow: 0x00ff88,
    blushColor: 0xffaa00,
    visorColor: 0x00ff88,
    auraColor: 0x00ff88
  },
  gold: {
    name: 'Champagne Gold',
    shellColor: 0xffbe1a,
    coreEmissive: 0x664400,
    eyeGlow: 0xffd700,
    blushColor: 0xff4400,
    visorColor: 0xffbe1a,
    auraColor: 0xffd700
  },
  violet: {
    name: 'Ultra Violet',
    shellColor: 0x9d4edd,
    coreEmissive: 0x33085c,
    eyeGlow: 0xc77dff,
    blushColor: 0xff00aa,
    visorColor: 0xc77dff,
    auraColor: 0xc77dff
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
const sharedHeadbandGeom = new THREE.TorusGeometry(0.85, 0.035, 6, 16, Math.PI * 0.9);
const sharedEarcupGeom = new THREE.CylinderGeometry(0.20, 0.22, 0.10, 12);

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
const sharedHornGeom = (() => {
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
const sharedSideMochiGeom = (() => {
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
  if (typeof document === 'undefined') {
    const dummy = new THREE.Object3D();
    return dummy;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const redraw = () => {
    ctx.clearRect(0, 0, 256, 128);

    const rank = userData.donateRank || null;
    let rankTheme = null;
    if (rank) {
      const upper = String(rank).trim().toUpperCase();
      if (upper.includes('TOP 1') || upper === 'TOP1' || upper === '1') {
        rankTheme = { bg: 'rgba(255, 215, 0, 0.25)', border: '#ffd700', text: '#ffd700', label: '👑 TOP 1' };
      } else if (upper.includes('TOP 2') || upper === 'TOP2' || upper === '2') {
        rankTheme = { bg: 'rgba(224, 224, 235, 0.25)', border: '#e0e0e8', text: '#f0f0f5', label: '🥈 TOP 2' };
      } else if (upper.includes('TOP 3') || upper === 'TOP3' || upper === '3') {
        rankTheme = { bg: 'rgba(205, 127, 50, 0.25)', border: '#cd7f32', text: '#f5a65b', label: '🥉 TOP 3' };
      } else if (upper.includes('VIP')) {
        rankTheme = { bg: 'rgba(199, 125, 255, 0.25)', border: '#c77dff', text: '#e0aaff', label: '💎 VIP' };
      } else {
        rankTheme = { bg: 'rgba(0, 242, 254, 0.22)', border: '#00f2fe', text: '#00f2fe', label: String(rank) };
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
    ctx.fillStyle = userData.avatarColor || (rankTheme ? rankTheme.border : '#00f2fe');
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const initials = (userData.nickname || userData.username || 'U').replace('@', '').slice(0, 2).toUpperCase();
    ctx.fillText(initials, 50, 53);
    ctx.restore();

    // Line 1: Nickname / Username
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const cleanName = (userData.nickname || userData.username || 'Viewer').slice(0, 14);
    ctx.fillText(cleanName, 84, 40);

    // Line 2: TikTok Account Level
    let rawLvl = userData.tiktokLevel || userData.level || 'Lv.1';
    let lvlText = typeof rawLvl === 'number' ? `Lv.${rawLvl}` : (String(rawLvl).startsWith('Lv.') ? String(rawLvl) : `Lv.${rawLvl}`);

    ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const lvlWidth = ctx.measureText(lvlText).width;
    const lvlPillW = Math.max(34, lvlWidth + 10);
    const lvlPillH = 18;
    const lvlPillX = 84;
    const lvlPillY = 55;

    // Vẽ pill Level Account TikTok
    ctx.fillStyle = 'rgba(0, 242, 254, 0.16)';
    ctx.beginPath();
    ctx.roundRect(lvlPillX, lvlPillY, lvlPillW, lvlPillH, 5);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.7)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#00f2fe';
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

      ctx.fillStyle = rankTheme.bg;
      ctx.beginPath();
      ctx.roundRect(rankPillX, rankPillY, rankPillW, rankPillH, 5);
      ctx.fill();
      ctx.strokeStyle = rankTheme.border;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = rankTheme.text;
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

  sprite.userData = { canvas, ctx, texture, redraw };
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
  let currentMat = sharedMaterialsPool[paletteKey] || sharedMaterialsPool.cyan;
  const slimeMesh = new THREE.Mesh(sharedChubbyMochiGeometry, currentMat);
  rootNode.add(slimeMesh);

  // 3. 3D Chibi Face Features
  const faceGroup = new THREE.Group();
  faceGroup.name = 'FaceGroup';
  rootNode.add(faceGroup);

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
  faceGroup.add(eyeLeft.eyeHolder);
  faceGroup.add(eyeRight.eyeHolder);

  // 3D Cute Cat Smile Mouth
  const mouthHolder = new THREE.Group();
  mouthHolder.position.set(0, 0.22, 0.97);
  mouthHolder.rotation.x = 0.08;

  const mouthGeom = new THREE.TorusGeometry(0.075, 0.015, 6, 12, Math.PI * 0.75);
  const mouthMat = new THREE.MeshBasicMaterial({ color: 0x05050e });
  const mouthMesh = new THREE.Mesh(mouthGeom, mouthMat);
  mouthMesh.rotation.z = Math.PI * 1.125;
  mouthHolder.add(mouthMesh);
  faceGroup.add(mouthHolder);

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
  faceGroup.add(blushL);

  const blushR = new THREE.Mesh(blushGeom, blushMat);
  blushR.position.set(0.44, 0.23, 0.86);
  blushR.rotation.y = 0.48;
  blushR.visible = (userData.gender === 'female');
  faceGroup.add(blushR);

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

  // Controller Object
  return {
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
      tier: 1,
      expression: 'normal',
      isBlinking: false,
      blinkTimer: 0,
      isPaused: false,
      isLionCelebrating: false,
      lionTimer: 0
    },

    setPalette(newKey) {
      if (!sharedMaterialsPool[newKey]) return;
      this.currentPaletteKey = newKey;
      const pal = SLIME_PALETTES[newKey];
      this.slimeMesh.material = sharedMaterialsPool[newKey];
      if (this.accessories.sideMochis) {
        if (this.accessories.sideMochis.mochiL) {
          this.accessories.sideMochis.mochiL.material = sharedMaterialsPool[newKey];
        }
        if (this.accessories.sideMochis.mochiR) {
          this.accessories.sideMochis.mochiR.material = sharedMaterialsPool[newKey];
        }
      }
      if (this.accessories.horns && this.accessories.horns.hornMat) {
        this.accessories.horns.hornMat.emissive.setHex(pal.eyeGlow);
      }
      if (this.accessories.tail && this.accessories.tail.tailSegment) {
        this.accessories.tail.tailSegment.material = sharedMaterialsPool[newKey] || sharedMaterialsPool.cyan;
      }
      if (this.accessories.auraRing && this.accessories.auraRing.discMat) {
        this.accessories.auraRing.discMat.color.setHex(pal.auraColor);
        this.accessories.auraRing.torusMat.emissive.setHex(pal.auraColor);
        if (this.accessories.auraRing.innerMat) {
          this.accessories.auraRing.innerMat.emissive.setHex(pal.auraColor);
        }
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
        this.rootNode.scale.set(1.0, 1.0, 1.0);
        this.rootNode.position.y = 0.12;
        this.rootNode.rotation.set(0, 0, 0);
        this.eyeLeft.eyeHolder.scale.set(1.0, 1.0, 1.0);
        this.eyeRight.eyeHolder.scale.set(1.0, 1.0, 1.0);
      }
    },

    triggerLionCelebration() {
      this.state.isLionCelebrating = true;
      this.state.lionTimer = 0;
      this.setTier(5);
      // Giữ nguyên màu sắc/bảng màu gốc của avatar, KHÔNG ép đổi sang màu vàng 'gold'!
      this.setExpression('smile');
    },

    update(deltaTime, audioKick = 0) {
      if (this.state.isPaused) return;

      // Lion Celebration
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
        }

        if (this.accessories.auraRing.visible) {
          this.accessories.auraRing.rotation.y += 3.5 * deltaTime;
        }
        return;
      }

      // Standard Kinematics
      const bps = this.state.bpm / 60;
      this.state.bpmPhase = (this.state.bpmPhase + deltaTime * bps * Math.PI * 2) % (Math.PI * 2);
      const sinVal = Math.sin(this.state.bpmPhase);
      const kickEffect = Math.max(0, audioKick);

      let scaleY, scaleXZ, jumpY;
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

      this.rootNode.scale.set(scaleXZ, scaleY, scaleXZ);
      this.rootNode.position.y = 0.12 + jumpY;

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
}
