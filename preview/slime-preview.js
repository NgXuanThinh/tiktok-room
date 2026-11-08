// preview/slime-preview.js - Live Bar Scalability Engine with Lion Celebration
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createCyberSlime, SLIME_PALETTES } from './slime-model.js?v=20261106_1645';
import { GiftPropsManager } from './gift-props.js';

// 1. Scene, Camera, Renderer Setup
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
const giftProps = new GiftPropsManager(scene);
scene.background = new THREE.Color(0x0c0b16);
scene.fog = new THREE.FogExp2(0x0c0b16, 0.035);

const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 150);
camera.position.set(2.4, 2.0, 3.6);

const renderer = new THREE.WebGLRenderer({
  antialias: false,
  alpha: false,
  powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(1.0);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.target.set(0, 0.45, 0);
controls.maxPolarAngle = Math.PI / 2 + 0.02;
controls.minDistance = 1.0;
controls.maxDistance = 60.0;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.8;

// 2. High-Performance Lighting Setup
const ambientLight = new THREE.AmbientLight(0x282345, 2.5);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
keyLight.position.set(5, 9, 5);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0x00f2fe, 3.0);
rimLight.position.set(-6, 4, -4);
scene.add(rimLight);

// 3. Nightclub Dance Floor
const floorGeom = new THREE.PlaneGeometry(80, 80);
const floorMat = new THREE.MeshStandardMaterial({
  color: 0x080712,
  roughness: 0.45,
  metalness: 0.65
});
const floorMesh = new THREE.Mesh(floorGeom, floorMat);
floorMesh.rotation.x = -Math.PI / 2;
floorMesh.position.y = 0;
scene.add(floorMesh);

// Center VIP Podium
const podiumGeom = new THREE.CylinderGeometry(1.6, 1.65, 0.08, 28);
const podiumMat = new THREE.MeshStandardMaterial({ color: 0x121124, metalness: 0.8, roughness: 0.3 });
const podium = new THREE.Mesh(podiumGeom, podiumMat);
podium.position.y = 0.04;
scene.add(podium);

const neonRingGeom = new THREE.TorusGeometry(1.56, 0.022, 10, 32);
const neonRingMat = new THREE.MeshBasicMaterial({ color: 0xffd700 }); // Always Gold
const neonRing = new THREE.Mesh(neonRingGeom, neonRingMat);
neonRing.rotation.x = Math.PI / 2;
neonRing.position.y = 0.082;
scene.add(neonRing);

// ----------------------------------------------------
// 4. LION CELEBRATION SPECIAL FX (BEAM & FIREWORKS)
// ----------------------------------------------------
// Golden Pillar of Light (Beam shooting up into the sky)
const beamGeom = new THREE.CylinderGeometry(1.2, 2.2, 12, 24, 1, true);
const beamMat = new THREE.MeshBasicMaterial({
  color: 0xffd700,
  transparent: true,
  opacity: 0,
  side: THREE.DoubleSide,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});
const goldenBeam = new THREE.Mesh(beamGeom, beamMat);
goldenBeam.position.set(0, 6, 0);
goldenBeam.visible = false;
scene.add(goldenBeam);

// White Pillar of Light for High Tier Gifts (Quà cao cấp: Ánh sáng trắng chiếu xuống)
const whiteBeamMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0,
  side: THREE.DoubleSide,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});
const whiteBeam = new THREE.Mesh(beamGeom, whiteBeamMat);
whiteBeam.position.set(0, 6, 0);
whiteBeam.visible = false;
scene.add(whiteBeam);
let whiteBeamTimer = 0;
let isWhiteBeamActive = false;

function triggerWhiteLightBeam(targetX = 0, targetZ = 0, duration = 1.5) {
  whiteBeam.position.x = targetX;
  whiteBeam.position.z = targetZ;
  whiteBeam.visible = true;
  whiteBeamMat.opacity = 0.82;
  whiteBeamTimer = duration;
  isWhiteBeamActive = true;
}

// Golden Stardust Fireworks Particles
const particleCount = 120;
const particleGeom = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
const particleVelocities = [];

for (let i = 0; i < particleCount; i++) {
  particlePositions[i * 3] = 0;
  particlePositions[i * 3 + 1] = -100;
  particlePositions[i * 3 + 2] = 0;
  particleVelocities.push(new THREE.Vector3());
}
particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

const particleMat = new THREE.PointsMaterial({
  color: 0xffe066,
  size: 0.18,
  transparent: true,
  opacity: 0,
  blending: THREE.AdditiveBlending
});
const fireworksSystem = new THREE.Points(particleGeom, particleMat);
scene.add(fireworksSystem);

function triggerFireworks(originY = 4.2, originX = 0, originZ = 0, customColor = 0xffe066) {
  const pos = particleGeom.attributes.position;
  particleMat.color.setHex(customColor);
  for (let i = 0; i < particleCount; i++) {
    pos.setXYZ(i, originX, originY, originZ);
    // Random radial burst velocity
    const theta = Math.random() * Math.PI * 2;
    const phi = (Math.random() - 0.5) * Math.PI;
    const speed = 2.0 + Math.random() * 4.5;
    particleVelocities[i].set(
      Math.cos(phi) * Math.cos(theta) * speed,
      Math.sin(phi) * speed + 1.5,
      Math.cos(phi) * Math.sin(theta) * speed
    );
  }
  pos.needsUpdate = true;
  particleMat.opacity = 1.0;
}

// ----------------------------------------------------
// 5. DYNAMIC AVATARS WITH SOURCE EFFECTS & BILLBOARD LABELS
// ----------------------------------------------------
const paletteKeys = ['cyan', 'magenta', 'lime'];
const activeAvatars = [];
let currentGlobalPalette = 'cyan';
let currentGlobalTier = 1;
let currentGlobalGender = 'male'; // Default: Male (NO BLUSH)
let isPaused = false;
let currentBpm = 128;
let bassPunch = 0;
let isLabelsVisible = true; // Option Bật / Tắt Billboard Labels
let autoTierUpOnDonate = false; // Tách biệt Tier Shape và Donate Effect: Mặc định không đổi shape khi donate

// Realistic Viewer Profiles (Tham chiếu TikTok LIVE Bar)
const MOCK_VIEWER_PROFILES = [
  { username: '@ThinhPro', nickname: 'Thịnh Pro', tiktokLevel: 'Lv.45', donateRank: 'TOP 1', avatarColor: '#ffd700', totalCoins: 6500 },
  { username: '@CyberCat', nickname: 'Cyber Cat', tiktokLevel: 'Lv.32', donateRank: 'TOP 2', avatarColor: '#e0e0e8', totalCoins: 3500 },
  { username: '@BassMaster', nickname: 'Bass Master', tiktokLevel: 'Lv.28', donateRank: 'TOP 3', avatarColor: '#cd7f32', totalCoins: 2200 },
  { username: '@MochiQueen', nickname: 'Mochi Queen', tiktokLevel: 'Lv.25', donateRank: 'VIP', avatarColor: '#c77dff', totalCoins: 1500 },
  { username: '@NeonDancer', nickname: 'Neon Dancer', tiktokLevel: 'Lv.18', donateRank: 'VIP', avatarColor: '#9d4edd', totalCoins: 1100 },
  { username: '@NightOwl', nickname: 'Cú Đêm', tiktokLevel: 'Lv.12', donateRank: null, avatarColor: '#00d2ff', totalCoins: 0 },
  { username: '@WhaleKing', nickname: 'Cá Voi Biển', tiktokLevel: 'Lv.15', donateRank: null, avatarColor: '#38ef7d', totalCoins: 0 },
  { username: '@DanceStar', nickname: 'Dance Star', tiktokLevel: 'Lv.9', donateRank: null, avatarColor: '#ff007f', totalCoins: 0 },
  { username: '@PartyDJ', nickname: 'Dân Chơi Bar', tiktokLevel: 'Lv.6', donateRank: null, avatarColor: '#4facfe', totalCoins: 0 },
  { username: '@GlowSlime', nickname: 'Glow Slime', tiktokLevel: 'Lv.2', donateRank: null, avatarColor: '#43e97b', totalCoins: 0 }
];

function getViewerProfile(idx) {
  if (idx < MOCK_VIEWER_PROFILES.length) {
    return { ...MOCK_VIEWER_PROFILES[idx] };
  }
  const idNum = idx + 1;
  return {
    username: `@Viewer_${idNum}`,
    nickname: `Clubber #${idNum}`,
    tiktokLevel: `Lv.${(idNum % 50) + 1}`,
    donateRank: null, // Khán giả bình thường trong đám đông: chỉ có TikTok Level, KHÔNG CÓ RANK!
    avatarColor: '#' + SLIME_PALETTES[paletteKeys[idx % paletteKeys.length]].shellColor.toString(16).padStart(6, '0'),
    totalCoins: 0
  };
}

function createAvatarInstance(paletteKey, index = 0) {
  const profile = getViewerProfile(index);
  const avatar = createCyberSlime(paletteKey, {
    gender: currentGlobalGender,
    ...profile
  });
  avatar.setTier(currentGlobalTier);
  avatar.setGender(currentGlobalGender);
  avatar.setLabelVisible(isLabelsVisible); // Respects the global label toggle
  avatar.state.bpm = currentBpm;
  avatar.setPaused(isPaused);

  const sGeom = new THREE.CircleGeometry(0.85, 16);
  const sMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45 });
  const shadow = new THREE.Mesh(sGeom, sMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.01;
  avatar.mesh.add(shadow);
  avatar.shadowMesh = shadow;
  avatar.shadowMat = sMat;
  return avatar;
}

let isShowcaseMode = false;
let showcaseLabels = [];

function clearShowcaseLabels() {
  showcaseLabels.forEach(sprite => {
    scene.remove(sprite);
    if (sprite.material.map) sprite.material.map.dispose();
    sprite.material.dispose();
  });
  showcaseLabels = [];
  isShowcaseMode = false;
}

function createTierLabelSprite(title, desc, colorHex) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 240;
  const ctx = canvas.getContext('2d');

  // Background Glass Card
  ctx.fillStyle = 'rgba(12, 11, 24, 0.88)';
  ctx.beginPath();
  ctx.roundRect(16, 16, 480, 208, 24);
  ctx.fill();

  ctx.lineWidth = 5;
  ctx.strokeStyle = colorHex;
  ctx.stroke();

  // Title
  ctx.fillStyle = colorHex;
  ctx.font = 'bold 42px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, 256, 88);

  // Description
  ctx.fillStyle = '#d8dbf0';
  ctx.font = '600 25px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(desc, 256, 155);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(1.65, 0.78, 1);
  return sprite;
}

export function showcaseAllTiers() {
  clearShowcaseLabels();
  isShowcaseMode = true;

  // Set avatar count to exactly 5
  setAvatarCount(5);

  podium.visible = false;
  neonRing.visible = false;

  const tierConfigs = [
    { tier: 1, x: -6.0, pal: 'cyan',    title: '⚪ TIE 1', desc: 'Bán Cầu (Nhún nhảy default)' },
    { tier: 2, x: -3.0, pal: 'magenta', title: '✨ TIE 2', desc: 'Chubby Mochi (Nhún nhảy default)' },
    { tier: 3, x:  0.0, pal: 'lime',    title: '🍡 TIE 3', desc: 'Chubby + Mochi (Xoay tròn 360°)' },
    { tier: 4, x:  3.0, pal: 'cyan',    title: '😈 TIE 4', desc: 'Mochi + Sừng + Đuôi (Xoay & Lộn vòng)' },
    { tier: 5, x:  6.0, pal: 'magenta', title: '👑 TIE 5', desc: 'Halo + Vòng Chân (VIP Max - Xoay & Lộn)' }
  ];

  tierConfigs.forEach((cfg, idx) => {
    const av = activeAvatars[idx];
    if (av) {
      av.setTier(cfg.tier);
      av.setPalette(cfg.pal);
      av.mesh.position.set(cfg.x, 0, 0);
      av.mesh.rotation.set(0, 0, 0);

      const labelY = cfg.tier === 5 ? 2.15 : 1.75;
      const hexStr = '#' + SLIME_PALETTES[cfg.pal].shellColor.toString(16).padStart(6, '0');
      const label = createTierLabelSprite(cfg.title, cfg.desc, hexStr);
      label.position.set(cfg.x, labelY, 0);
      scene.add(label);
      showcaseLabels.push(label);
    }
  });

  // Adjust camera to frame all 5 tiers side-by-side with generous width
  camera.position.set(0, 2.8, 11.2);
  controls.target.set(0, 0.7, 0);
  controls.autoRotate = false;
  autoRotateCheck.checked = false;

  // Deselect individual tier buttons
  document.querySelectorAll('.tier-btn').forEach(b => b.classList.remove('active'));
}

function repositionGrid() {
  if (isShowcaseMode) return;
  const count = activeAvatars.length;

  if (count === 1) {
    activeAvatars[0].mesh.position.set(0, 0, 0);
    podium.visible = true;
    neonRing.visible = true;
    return;
  }

  podium.visible = false;
  neonRing.visible = false;

  const cols = Math.ceil(Math.sqrt(count));
  const spacing = 1.95;

  activeAvatars.forEach((avatar, idx) => {
    const row = Math.floor(idx / cols);
    const col = idx % cols;
    const x = (col - (cols - 1) / 2) * spacing;
    const z = (row - (cols - 1) / 2) * spacing;
    avatar.mesh.position.set(x, 0, z);
  });
}

function updateMetricHUD() {
  const count = activeAvatars.length;
  document.getElementById('metric-avatars').textContent = count;
  document.getElementById('avatar-slider').value = Math.min(300, count);
  document.getElementById('avatar-slider-val').textContent = count;
}

function addAvatars(countToAdd) {
  for (let i = 0; i < countToAdd; i++) {
    const pal = paletteKeys[activeAvatars.length % paletteKeys.length];
    const avatar = createAvatarInstance(pal, activeAvatars.length);
    scene.add(avatar.mesh);
    activeAvatars.push(avatar);
  }
  repositionGrid();
  updateMetricHUD();
}

function removeAvatars(countToRemove) {
  const toRemove = Math.min(countToRemove, activeAvatars.length - 1);
  for (let i = 0; i < toRemove; i++) {
    const avatar = activeAvatars.pop();
    scene.remove(avatar.mesh);
  }
  repositionGrid();
  updateMetricHUD();
}

function setAvatarCount(targetCount) {
  const diff = targetCount - activeAvatars.length;
  if (diff > 0) {
    addAvatars(diff);
  } else if (diff < 0) {
    removeAvatars(Math.abs(diff));
  }
}

addAvatars(1);

// ----------------------------------------------------
// 6. LION CELEBRATION TRIGGER
// ----------------------------------------------------
const lionBtn = document.getElementById('lion-celebration-btn');
const lionBanner = document.getElementById('lion-banner');
let lionFxTimer = 0;
let isLionActive = false;

function triggerLionCelebrationEvent(targetAvatar = null, upgradeTier = false) {
  if (activeAvatars.length === 0) return;
  isLionActive = true;
  lionFxTimer = 7.6;

  // Unpause if paused
  if (isPaused) {
    togglePause();
  }

  // Trigger on the target avatar (hoặc Avatar #0 in center)
  const heroAvatar = targetAvatar || activeAvatars[0];
  heroAvatar.triggerLionCelebration(upgradeTier);

  // Position beam at heroAvatar position
  goldenBeam.position.x = heroAvatar.mesh.position.x;
  goldenBeam.position.z = heroAvatar.mesh.position.z;

  // Show Lion Banner
  lionBanner.style.display = 'block';

  // Activate Golden Light Beam
  goldenBeam.visible = true;
  beamMat.opacity = 0.55;

  // Trigger fireworks burst at apex after 2.3s and 3.8s
  setTimeout(() => {
    triggerFireworks(4.5, heroAvatar.mesh.position.x, heroAvatar.mesh.position.z);
  }, 2300);

  setTimeout(() => {
    triggerFireworks(4.8, heroAvatar.mesh.position.x, heroAvatar.mesh.position.z);
  }, 3800);
}
lionBtn.addEventListener('click', () => triggerLionCelebrationEvent(null, autoTierUpOnDonate));

// ----------------------------------------------------
// 7. USER INTERFACE BINDINGS
// ----------------------------------------------------
const showcaseBtn = document.getElementById('btn-showcase-all');
if (showcaseBtn) {
  showcaseBtn.addEventListener('click', showcaseAllTiers);
}

document.getElementById('btn-add-1').addEventListener('click', () => { clearShowcaseLabels(); addAvatars(1); });
document.getElementById('btn-add-10').addEventListener('click', () => { clearShowcaseLabels(); addAvatars(10); });
document.getElementById('btn-add-50').addEventListener('click', () => { clearShowcaseLabels(); addAvatars(50); });
document.getElementById('btn-add-100').addEventListener('click', () => { clearShowcaseLabels(); addAvatars(100); });

document.getElementById('btn-rem-10').addEventListener('click', () => { clearShowcaseLabels(); removeAvatars(10); });
document.getElementById('btn-rem-50').addEventListener('click', () => { clearShowcaseLabels(); removeAvatars(50); });
document.getElementById('btn-reset-1').addEventListener('click', () => {
  clearShowcaseLabels();
  setAvatarCount(1);
  camera.position.set(2.4, 2.0, 3.6);
  controls.target.set(0, 0.45, 0);
  document.querySelectorAll('.tier-btn').forEach(b => b.classList.toggle('active', b.dataset.tier === '1'));
  if (activeAvatars.length > 0) {
    activeAvatars[0].setTier(1);
  }
});

// Slider
const avatarSlider = document.getElementById('avatar-slider');
avatarSlider.addEventListener('input', (e) => {
  clearShowcaseLabels();
  setAvatarCount(parseInt(e.target.value, 10));
});

// Freeze / Pause Button
const freezeBtn = document.getElementById('freeze-btn');
const autoRotateCheck = document.getElementById('auto-rotate');

function togglePause() {
  isPaused = !isPaused;
  activeAvatars.forEach(av => av.setPaused(isPaused));

  if (isPaused) {
    freezeBtn.textContent = '▶️ TIẾP TỤC NHẢY (RESUME DANCE)';
    freezeBtn.classList.add('paused');
    controls.autoRotate = false;
    autoRotateCheck.checked = false;
  } else {
    freezeBtn.textContent = '⏸️ ĐỨNG YÊN (FREEZE ALL)';
    freezeBtn.classList.remove('paused');
    controls.autoRotate = true;
    autoRotateCheck.checked = true;
  }
}
freezeBtn.addEventListener('click', togglePause);

// ----------------------------------------------------
// BILLBOARD LABELS & DONATE MODES (Tham chiếu luồng chính)
// ----------------------------------------------------
// Billboard Label Toggle (Bật / Tắt Label Tên & Cấp)
const toggleLabelsCheck = document.getElementById('toggle-labels');
if (toggleLabelsCheck) {
  toggleLabelsCheck.addEventListener('change', (e) => {
    isLabelsVisible = e.target.checked;
    activeAvatars.forEach(av => av.setLabelVisible(isLabelsVisible));
  });
}

// ----------------------------------------------------
// TIKTOK LEVEL & RANK DONATE SCALABILITY TESTING
// ----------------------------------------------------
export function setHeroLevel(levelNum) {
  if (activeAvatars.length > 0) {
    activeAvatars[0].setTikTokLevel(levelNum);
  }
}

export function setHeroRank(rankStr) {
  if (activeAvatars.length > 0) {
    activeAvatars[0].setDonateRank(rankStr || null);
  }
}

export function simulateCrowdRanks() {
  activeAvatars.forEach((av, idx) => {
    if (idx === 0) {
      av.setTikTokLevel(50);
      av.setDonateRank('TOP 1');
    } else if (idx === 1) {
      av.setTikTokLevel(45);
      av.setDonateRank('TOP 2');
    } else if (idx === 2) {
      av.setTikTokLevel(40);
      av.setDonateRank('TOP 3');
    } else if (idx <= 6) {
      av.setTikTokLevel(25 + (idx % 10));
      av.setDonateRank('VIP');
    } else {
      // Đám đông còn lại: CHỈ CÓ TIKTOK LEVEL, KHÔNG CÓ RANK DONATE!
      av.setTikTokLevel((idx % 30) + 1);
      av.setDonateRank(null);
    }
  });

  // Đồng bộ UI Avatar Chính
  const heroSlider = document.getElementById('hero-lvl-slider');
  const heroVal = document.getElementById('hero-lvl-val');
  if (heroSlider) heroSlider.value = 50;
  if (heroVal) heroVal.textContent = 'Lv.50';
  document.querySelectorAll('.rank-test-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.rank === 'TOP 1');
  });
}

export function clearAllCrowdRanks() {
  activeAvatars.forEach(av => {
    av.setDonateRank(null);
  });
  document.querySelectorAll('.rank-test-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.rank === '');
  });
}

// Event Listeners cho Test Level & Rank Avatar Chính
const heroLvlSlider = document.getElementById('hero-lvl-slider');
const heroLvlVal = document.getElementById('hero-lvl-val');
if (heroLvlSlider) {
  heroLvlSlider.addEventListener('input', (e) => {
    const lvl = parseInt(e.target.value, 10);
    if (heroLvlVal) heroLvlVal.textContent = `Lv.${lvl}`;
    setHeroLevel(lvl);
  });
}

document.querySelectorAll('.quick-lvl-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const lvl = parseInt(btn.dataset.lvl, 10);
    if (heroLvlSlider) heroLvlSlider.value = lvl;
    if (heroLvlVal) heroLvlVal.textContent = `Lv.${lvl}`;
    setHeroLevel(lvl);
  });
});

document.querySelectorAll('.rank-test-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.rank-test-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    setHeroRank(btn.dataset.rank);
  });
});

const btnCrowdRankSim = document.getElementById('btn-crowd-rank-sim');
if (btnCrowdRankSim) {
  btnCrowdRankSim.addEventListener('click', simulateCrowdRanks);
}

const btnCrowdClearRank = document.getElementById('btn-crowd-clear-rank');
if (btnCrowdClearRank) {
  btnCrowdClearRank.addEventListener('click', clearAllCrowdRanks);
}

// DONATE MODES (TIKTOK LIVE GIFTS SIMULATION)
// ----------------------------------------------------
// TIKTOK LIVE GIFTS DATABASE & DONATION EFFECTS
// ----------------------------------------------------
const DONATE_GIFTS = {
  // 1. Quà nhỏ (1 - 10 xu | ~200đ - 3.500đ)
  rose: { name: 'Hoa hồng', emoji: '🌹', coins: 1, vnd: '200 – 350đ', tier: 1, cat: 'small', color: 0xff0874, desc: 'Mini bounce + Cánh hoa hồng bay' },
  gg: { name: 'GG Game', emoji: '⚡', coins: 1, vnd: '200 – 350đ', tier: 1, cat: 'small', color: 0x00f2fe, desc: 'Tia chớp Neon + Pop ding' },
  ice_cream: { name: 'Kem ốc quế', emoji: '🍦', coins: 1, vnd: '200 – 350đ', tier: 1, cat: 'small', color: 0xffbe1a, desc: 'Nốt nhạc ngọt ngào + Nảy nhẹ' },
  finger_heart: { name: 'Finger Heart', emoji: '💖', coins: 5, vnd: '1.000 – 1.700đ', tier: 1, cat: 'small', color: 0xff007f, desc: 'Chùm 10 trái tim Neon bay lượn' },
  panda: { name: 'Gấu trúc', emoji: '🐼', coins: 5, vnd: '1.000 – 1.700đ', tier: 1, cat: 'small', color: 0x43e97b, desc: 'Mặt cười Chibi + Nhún nảy đôi' },
  wave_hand: { name: 'Sóng tay', emoji: '👋', coins: 9, vnd: '2.000 – 3.500đ', tier: 1, cat: 'small', color: 0x00d2ff, desc: 'Sóng xung kích lan tỏa dưới chân' },
  conical_hat: { name: 'Nón lá', emoji: '👒', coins: 10, vnd: '2.000 – 3.500đ', tier: 1, cat: 'small', color: 0xffd700, desc: 'Vòng xoay 360 độ + Bass kick' },

  // 2. Quà trung (20 - 199 xu | ~4.000đ - 70.000đ)
  perfume: { name: 'Nước hoa', emoji: '🧴', coins: 20, vnd: '4.000 – 7.000đ', tier: 2, cat: 'medium', color: 0xff00aa, desc: 'Thăng cấp Tie 2 Chubby + Làn khói nước hoa' },
  sunscreen: { name: 'Kem chống nắng', emoji: '🧴', coins: 50, vnd: '10.000 – 17.500đ', tier: 2, cat: 'medium', color: 0xffe066, desc: 'Spotlight chiếu rọi + Hạt bụi lấp lánh' },
  confetti: { name: 'Pháo hoa giấy', emoji: '🎊', coins: 100, vnd: '20.000 – 35.000đ', tier: 2, cat: 'medium', color: 0x00ff88, desc: 'Cơn mưa hoa giấy đa sắc phủ kín avatar' },
  rainbow: { name: 'Cầu vồng', emoji: '🌈', coins: 100, vnd: '20.000 – 35.000đ', tier: 2, cat: 'medium', color: 0x00f2fe, desc: 'Vòm quang phổ 7 sắc rực rỡ' },
  sunglasses: { name: 'Kính râm Cyber', emoji: '🕶️', coins: 199, vnd: '40.000 – 70.000đ', tier: 2, cat: 'medium', color: 0x9d4edd, desc: 'Kính ngầu + Đèn chiếu kép đan chéo' },

  // 3. Quà cao cấp (500 - 5.000 xu | ~100.000đ - 1.750.000đ)
  money_rain: { name: 'Mưa tiền', emoji: '💸', coins: 500, vnd: '100.000 – 175.000đ', tier: 3, cat: 'high', color: 0x00ff88, desc: 'Thăng cấp Tie 3 Tai Mochi + Mưa tiền vàng rơi' },
  concert: { name: 'Buổi hòa nhạc', emoji: '🎸', coins: 500, vnd: '100.000 – 175.000đ', tier: 3, cat: 'high', color: 0xff0874, desc: 'Pháo hoa nổ đôi + Đèn sân khấu quét mạnh' },
  love_balloon: { name: 'Bóng bay tình yêu', emoji: '🎈', coins: 699, vnd: '140.000 – 240.000đ', tier: 3, cat: 'high', color: 0xff3366, desc: 'Bóng bay trái tim khổng lồ bay lên trần' },
  disco_ball: { name: 'Quả cầu Disco', emoji: '🪩', coins: 1000, vnd: '200.000 – 350.000đ', tier: 4, cat: 'high', color: 0x00f2fe, desc: 'Thăng cấp Tie 4 Sừng+Đuôi + Cầu disco phản quang laser' },
  legend: { name: 'Huyền thoại', emoji: '⚔️', coins: 1000, vnd: '200.000 – 350.000đ', tier: 4, cat: 'high', color: 0xffd700, desc: 'Gươm ánh sáng cắm xuống sàn + Air horn' },
  drama_queen: { name: 'Drama Queen', emoji: '👑', coins: 5000, vnd: '1.000.000 – 1.750.000đ', tier: 5, cat: 'high', color: 0xff0055, desc: 'Thăng cấp Tie 5 Max VIP + Frenzy Mode toàn sàn!' },

  // 4. Quà siêu xa xỉ (6.000 - 44.999 xu | ~1.200.000đ - 15.700.000đ)
  jet: { name: 'Máy bay phản lực', emoji: '✈️', coins: 6000, vnd: '1.2 – 2.1 Tr VNĐ', tier: 5, cat: 'ultra', color: 0x00f2fe, desc: 'Âm thanh phản lực xé gió + Dải khói Neon vắt ngang sàn' },
  panther: { name: 'Con Báo (Panther)', emoji: '🐆', coins: 15000, vnd: '3.0 – 5.2 Tr VNĐ', tier: 5, cat: 'ultra', color: 0x7928ca, desc: 'Bóng báo đen hắc ám + Vết cào cào lửa tím trên sàn' },
  tiger: { name: 'Con Hổ (Tiger)', emoji: '🐅', coins: 19999, vnd: '4.0 – 7.0 Tr VNĐ', tier: 5, cat: 'ultra', color: 0xff8800, desc: 'Hổ gầm chấn động + Quả cầu lửa bùng nổ rung màn hình' },
  phoenix: { name: 'Phượng hoàng', emoji: '🦅', coins: 25999, vnd: '5.2 – 9.0 Tr VNĐ', tier: 5, cat: 'ultra', color: 0xff2200, desc: 'Đôi cánh lửa thần thoại sải cánh bao phủ toàn sàn đấu' },
  lion: { name: 'Sư tử (Lion)', emoji: '🦁', coins: 29999, vnd: '6.0 – 10.5 Tr VNĐ', tier: 5, cat: 'ultra', color: 0xffd700, desc: 'Lễ Coronation Đăng Quang: Cột sáng vàng + Bay lộn 3 vòng + Pháo hoa cực đại' },
  pegasus: { name: 'Ngựa thần (Pegasus)', emoji: '🦄', coins: 42999, vnd: '8.6 – 15.0 Tr VNĐ', tier: 5, cat: 'ultra', color: 0xc77dff, desc: 'Ngựa thần có cánh phi nước đại + Mưa sao băng thiên hà' },
  universe: { name: 'Vũ trụ TikTok', emoji: '🪐', coins: 44999, vnd: '9.0 – 15.7 Tr VNĐ', tier: 5, cat: 'ultra', color: 0x00f2fe, desc: 'Hố đen vũ trụ mở ra + Nổ Siêu Tân Tinh + Đấng Tạo Hóa TOP 1' }
};

// Camera shake effect for ultra-luxury gifts
function triggerCameraShake(intensity = 0.25, duration = 0.7) {
  let elapsed = 0;
  const originalX = camera.position.x;
  const originalY = camera.position.y;
  const shakeId = setInterval(() => {
    elapsed += 0.04;
    if (elapsed >= duration) {
      clearInterval(shakeId);
      camera.position.x = originalX;
      camera.position.y = originalY;
      return;
    }
    const decay = (1.0 - elapsed / duration) * intensity;
    camera.position.x = originalX + (Math.random() - 0.5) * decay;
    camera.position.y = originalY + (Math.random() - 0.5) * decay;
  }, 40);
}

let toastTimer = null;
function showGiftToast(username, gift) {
  const toast = document.getElementById('gift-toast');
  const title = document.getElementById('toast-title');
  const msg = document.getElementById('toast-msg');
  const tierEl = document.getElementById('toast-tier');
  if (!toast) return;

  const isUltra = gift.cat === 'ultra';
  toast.style.borderColor = isUltra ? '#ffd700' : (gift.tier >= 3 ? '#ff0874' : '#00f2fe');
  toast.style.boxShadow = isUltra 
    ? '0 0 45px rgba(255, 215, 0, 0.7), 0 8px 32px rgba(0,0,0,0.9)'
    : '0 0 25px rgba(0, 242, 254, 0.4), 0 8px 30px rgba(0,0,0,0.8)';

  title.textContent = `🎁 TIKTOK LIVE DONATE • ${gift.emoji} ${gift.name.toUpperCase()} (${gift.coins.toLocaleString()} XU)`;
  msg.innerHTML = `<span style="color:#00f2fe; font-weight:700;">${username}</span> đã gửi tặng <b style="color:#ffd700;">${gift.name}</b> (+${gift.coins.toLocaleString()} 🪙 &bull; <span style="color:#00ff88;">~${gift.vnd}</span>)`;
  tierEl.textContent = `⚡ ${gift.desc} ➔ Thăng cấp lên Tier ${gift.tier}!`;

  toast.style.display = 'block';
  toast.style.animation = 'none';
  toast.offsetHeight;
  toast.style.animation = 'slideDownToast 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.style.display = 'none';
  }, isUltra ? 4500 : 2800);
}

function triggerDonation(giftKey, targetAvatar = null, forceTierUp = null) {
  const gift = DONATE_GIFTS[giftKey] || DONATE_GIFTS.rose;
  if (activeAvatars.length === 0) return;

  // Unfreeze if paused so effects play smoothly
  if (isPaused) {
    togglePause();
  }

  let av = targetAvatar;
  if (!av) {
    if (activeAvatars.length === 1 || gift.cat === 'ultra') {
      av = activeAvatars[0];
    } else {
      av = activeAvatars[Math.floor(Math.random() * activeAvatars.length)];
    }
  }

  // Accumulate coins & update billboard
  av.updateBillboard(gift.coins);

  // Tách biệt giữa Tier Shape và Donate Effect:
  // Chỉ thay đổi shape khi autoTierUpOnDonate là true hoặc forceTierUp là true!
  const shouldUpgradeTier = (forceTierUp !== null) ? Boolean(forceTierUp) : autoTierUpOnDonate;
  if (shouldUpgradeTier) {
    av.setTier(gift.tier);

    // Sync tier button UI if single avatar
    if (activeAvatars.length === 1) {
      currentGlobalTier = gift.tier;
      document.querySelectorAll('.tier-btn').forEach(b => {
        b.classList.toggle('active', parseInt(b.dataset.tier, 10) === gift.tier);
      });
    }
  }

  const origin = av.mesh.position.clone();

  // Trigger 3D Signature Prop (Jet, Cyber Panther, TikTok Galaxy Universe, etc.)
  giftProps.trigger(giftKey, origin, gift.coins || 1);

  // Tier-specific celebratory visual FX
  if (gift.cat === 'small') {
    // Quà nhỏ: Nhảy lên cao trong 1s (1 xu) hoặc 3 lần liên tiếp (5 xu)
    av.triggerDonateAnimation('small', shouldUpgradeTier, gift.tier, gift.coins || 1);
    bassPunch = 0.8;
  } else if (gift.cat === 'medium') {
    // Quà trung: Nhảy lên cao trong 1s + xoay vòng tròn 0.5s rồi rớt xuống
    av.triggerDonateAnimation('medium', shouldUpgradeTier, gift.tier, gift.coins || 20);
    bassPunch = 1.1;
    triggerFireworks(origin.y + 2.4, origin.x, origin.z, gift.color);
  } else if (gift.cat === 'high') {
    // Quà cao cấp: Có ánh sáng trắng chiếu xuống + hiệu ứng như quà trung
    av.triggerDonateAnimation('high', shouldUpgradeTier, gift.tier, gift.coins || 500);
    triggerWhiteLightBeam(origin.x, origin.z, 1.5);
    bassPunch = 1.3;
    triggerFireworks(origin.y + 2.8, origin.x, origin.z, gift.color);
    setTimeout(() => {
      triggerFireworks(origin.y + 3.6, origin.x, origin.z, 0xffffff);
    }, 300);
  } else if (gift.cat === 'ultra') {
    // Quà xa xỉ: Như không đổi
    triggerCameraShake(0.35, 1.0);
    triggerLionCelebrationEvent(av, shouldUpgradeTier);
    setTimeout(() => {
      triggerFireworks(origin.y + 4.8, origin.x - 1.5, origin.z, gift.color);
    }, 1500);
    setTimeout(() => {
      triggerFireworks(origin.y + 5.2, origin.x + 1.5, origin.z, 0xff0874);
    }, 2800);
    setTimeout(() => {
      triggerFireworks(origin.y + 5.5, origin.x, origin.z, 0x00f2fe);
    }, 3800);
  }

  showGiftToast(av.userData.username || '@Viewer', gift);
}

// Donate Buttons Listener
function bindDonateButtons() {
  document.querySelectorAll('.donate-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const giftKey = btn.dataset.gift;
      triggerDonation(giftKey);
    });
  });
}
bindDonateButtons();

// Category Selector Tabs
document.querySelectorAll('.gift-cat-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.gift-cat-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const cat = tab.dataset.cat;
    document.querySelectorAll('.gift-grid-container').forEach(grid => {
      grid.style.display = (grid.dataset.cat === cat) ? 'grid' : 'none';
    });
  });
});

// Bão Donate Liên Tục (Auto Rain Storm Simulation)
let donateStormInterval = null;
let isDonateStormActive = false;
const donateKeys = Object.keys(DONATE_GIFTS);

function toggleDonateStorm() {
  isDonateStormActive = !isDonateStormActive;
  const btn = document.getElementById('btn-donate-storm');
  if (isDonateStormActive) {
    if (btn) {
      btn.textContent = '🌧️ Bão Donate: ĐANG XẢ QUÀ (BẤM ĐỂ DỪNG)';
      btn.style.background = 'linear-gradient(135deg, #ff0874, #ffd700)';
      btn.style.borderColor = '#ffd700';
    }
    donateStormInterval = setInterval(() => {
      if (activeAvatars.length === 0) return;
      const rand = Math.random();
      let key = 'rose';
      if (rand < 0.40) key = 'rose';
      else if (rand < 0.60) key = 'finger_heart';
      else if (rand < 0.75) key = 'confetti';
      else if (rand < 0.88) key = 'sunglasses';
      else if (rand < 0.95) key = 'money_rain';
      else if (rand < 0.98) key = 'drama_queen';
      else key = 'lion';

      const randomTarget = activeAvatars[Math.floor(Math.random() * activeAvatars.length)];
      triggerDonation(key, randomTarget);
    }, 1100);
  } else {
    if (btn) {
      btn.textContent = '🌧️ Bão Donate Liên Tục: OFF';
      btn.style.background = 'linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(255, 8, 116, 0.2))';
      btn.style.borderColor = '#00f2fe';
    }
    if (donateStormInterval) {
      clearInterval(donateStormInterval);
      donateStormInterval = null;
    }
  }
}

const stormBtn = document.getElementById('btn-donate-storm');
if (stormBtn) {
  stormBtn.addEventListener('click', toggleDonateStorm);
}

// Gender Selector
document.querySelectorAll('.gender-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentGlobalGender = btn.dataset.gender;
    activeAvatars.forEach(av => av.setGender(currentGlobalGender));
  });
});

// VIP Tiers
document.querySelectorAll('.tier-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    clearShowcaseLabels();
    document.querySelectorAll('.tier-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentGlobalTier = parseInt(btn.dataset.tier, 10);
    activeAvatars.forEach(av => av.setTier(currentGlobalTier));
    repositionGrid();
  });
});

// Dance Moves & Choreography Controls
let autoDanceEnabled = true;
const toggleAutoDance = document.getElementById('toggle-auto-dance');
if (toggleAutoDance) {
  toggleAutoDance.checked = autoDanceEnabled;
  toggleAutoDance.addEventListener('change', (e) => {
    autoDanceEnabled = e.target.checked;
    activeAvatars.forEach(av => av.setAutoDanceRoutine(autoDanceEnabled));
  });
}

const btnDanceSpin = document.getElementById('btn-dance-spin');
if (btnDanceSpin) {
  btnDanceSpin.addEventListener('click', () => {
    let triggeredCount = 0;
    activeAvatars.forEach(av => {
      const res = av.triggerDanceMove('spin');
      if (res?.success) triggeredCount++;
    });
    if (triggeredCount === 0 && activeAvatars.length > 0) {
      showGiftToast('Điệu Nhảy', { name: 'Tier 1 & 2 chỉ có thể nhún nhảy default! Chuyển sang Tier 3+ để Xoay Tròn 360°.', icon: '🔄', coins: 0 });
    }
  });
}

const btnDanceFlip = document.getElementById('btn-dance-flip');
if (btnDanceFlip) {
  btnDanceFlip.addEventListener('click', () => {
    let triggeredCount = 0;
    activeAvatars.forEach(av => {
      const res = av.triggerDanceMove('flip');
      if (res?.success) triggeredCount++;
    });
    if (triggeredCount === 0 && activeAvatars.length > 0) {
      showGiftToast('Điệu Nhảy', { name: 'Chỉ Tier 4 & 5 mới có thể Lộn Vòng! Chuyển sang Tier 4 hoặc 5.', icon: '🤸', coins: 0 });
    }
  });
}

const btnDanceBounce = document.getElementById('btn-dance-bounce');
if (btnDanceBounce) {
  btnDanceBounce.addEventListener('click', () => {
    activeAvatars.forEach(av => av.triggerDanceMove('bounce'));
  });
}

const btnDanceShuffle = document.getElementById('btn-dance-shuffle');
if (btnDanceShuffle) {
  btnDanceShuffle.addEventListener('click', () => {
    activeAvatars.forEach(av => av.shuffleDanceMove());
    showGiftToast('Vũ Đạo', { name: '🎲 Đã xáo trộn ngẫu hứng vũ đạo cho toàn bộ nhân vật!', icon: '✨', coins: 0 });
  });
}

// Palettes
document.querySelectorAll('.palette-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.palette-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentGlobalPalette = btn.dataset.palette;
    activeAvatars.forEach(av => av.setPalette(currentGlobalPalette));
    neonRingMat.color.setHex(0xffd700); // Always Gold
  });
});

// Option & Test Panel: Tách biệt Tier Shape và Donate Effect
const toggleTierUp = document.getElementById('toggle-tier-up');
if (toggleTierUp) {
  toggleTierUp.checked = autoTierUpOnDonate;
  toggleTierUp.addEventListener('change', (e) => {
    autoTierUpOnDonate = e.target.checked;
  });
}

const btnTestKeepShape = document.getElementById('btn-test-keep-shape');
if (btnTestKeepShape) {
  btnTestKeepShape.addEventListener('click', () => {
    if (activeAvatars.length > 0) {
      activeAvatars[0].setTier(1);
      currentGlobalTier = 1;
      document.querySelectorAll('.tier-btn').forEach(b => b.classList.toggle('active', b.dataset.tier === '1'));
    }
    triggerDonation('pegasus', null, false);
  });
}

const btnTestLevelUp = document.getElementById('btn-test-level-up');
if (btnTestLevelUp) {
  btnTestLevelUp.addEventListener('click', () => {
    triggerDonation('pegasus', null, true);
  });
}

// BPM Slider
const bpmSlider = document.getElementById('bpm-slider');
const bpmVal = document.getElementById('bpm-val');
bpmSlider.addEventListener('input', (e) => {
  currentBpm = parseInt(e.target.value, 10);
  bpmVal.textContent = currentBpm;
  activeAvatars.forEach(av => { av.state.bpm = currentBpm; });
});

// Bass Kick Impact Button
const kickBtn = document.getElementById('bass-kick-btn');
kickBtn.addEventListener('click', () => {
  if (!isPaused) {
    bassPunch = 1.0;
  }
});

// Camera Presets
document.querySelectorAll('.cam-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.cam-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const preset = btn.dataset.cam;
    const distanceMultiplier = Math.max(1.0, Math.sqrt(activeAvatars.length) * 0.7);
    if (preset === 'turntable') {
      camera.position.set(2.4 * distanceMultiplier, 1.8 * distanceMultiplier, 3.2 * distanceMultiplier);
      controls.target.set(0, 0.45, 0);
    } else if (preset === 'front') {
      camera.position.set(0, 0.65 * distanceMultiplier, 3.4 * distanceMultiplier);
      controls.target.set(0, 0.45, 0);
    } else if (preset === 'closeup') {
      camera.position.set(0, 0.62, 2.75);
      controls.target.set(0, 0.46, 0);
    } else if (preset === 'top') {
      camera.position.set(0, 4.2 * distanceMultiplier, 0.5);
      controls.target.set(0, 0.35, 0);
    } else if (preset === 'king') {
      camera.position.set(0, 3.2, 8.8);
      controls.target.set(0, 2.6, 0);
    }
  });
});

autoRotateCheck.addEventListener('change', (e) => {
  controls.autoRotate = e.target.checked;
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ----------------------------------------------------
// 8. ANIMATION LOOP & LIVE BENCHMARK METRICS
// ----------------------------------------------------
const fpsBadge = document.getElementById('fps-badge');
const latencyBadge = document.getElementById('metric-latency');
const drawCallsBadge = document.getElementById('metric-drawcalls');
const vertsBadge = document.getElementById('metric-verts');

let lastTime = performance.now();
let frameCount = 0;
let lastFpsUpdate = performance.now();

function animate() {
  requestAnimationFrame(animate);

  const now = performance.now();
  const deltaTime = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  // FPS & Latency Measurement
  frameCount++;
  if (now - lastFpsUpdate >= 350) {
    const elapsed = now - lastFpsUpdate;
    const fps = Math.round((frameCount * 1000) / elapsed);
    const latency = (elapsed / frameCount).toFixed(1);
    frameCount = 0;
    lastFpsUpdate = now;

    if (fpsBadge) {
      fpsBadge.textContent = `${fps} FPS`;
      if (fps >= 50) {
        fpsBadge.style.color = '#00ff88';
        fpsBadge.style.borderColor = 'rgba(0, 255, 136, 0.4)';
        fpsBadge.style.background = 'rgba(0, 255, 136, 0.2)';
      } else if (fps >= 30) {
        fpsBadge.style.color = '#ffbe1a';
        fpsBadge.style.borderColor = 'rgba(255, 190, 26, 0.4)';
        fpsBadge.style.background = 'rgba(255, 190, 26, 0.2)';
      } else {
        fpsBadge.style.color = '#ff0874';
        fpsBadge.style.borderColor = 'rgba(255, 8, 116, 0.4)';
        fpsBadge.style.background = 'rgba(255, 8, 116, 0.2)';
      }
    }

    if (latencyBadge) latencyBadge.textContent = `${latency}ms`;
    if (drawCallsBadge) drawCallsBadge.textContent = renderer.info.render.calls;
    if (vertsBadge) {
      const tris = renderer.info.render.triangles;
      vertsBadge.textContent = tris > 1000 ? `${(tris / 1000).toFixed(1)}k` : tris;
    }
  }

  // Handle Lion FX Timeline & Cinematic Camera Director
  if (isLionActive) {
    lionFxTimer -= deltaTime;
    goldenBeam.rotation.y += 1.5 * deltaTime;

    if (lionFxTimer < 1.4) {
      beamMat.opacity = Math.max(0, beamMat.opacity - deltaTime * 0.5);
    }
    if (lionFxTimer <= 0) {
      isLionActive = false;
      goldenBeam.visible = false;
      lionBanner.style.display = 'none';
    }

    // Dynamic Cinematic King Framing: Keeps ground, beam, flips, halo, and fireworks in frame
    if (activeAvatars.length > 0) {
      const hero = activeAvatars[0];
      const slimeY = hero.rootNode.position.y;

      // Track focus midway so both floor aura and soaring king remain framed
      const targetFocusY = THREE.MathUtils.lerp(0.45, 2.8, Math.min(1.0, slimeY / 3.8));
      controls.target.y = THREE.MathUtils.lerp(controls.target.y, targetFocusY, 0.08);
      controls.target.x = THREE.MathUtils.lerp(controls.target.x, 0, 0.08);
      controls.target.z = THREE.MathUtils.lerp(controls.target.z, 0, 0.08);

      // Optimal camera pull back to 8.8 distance and 3.0 height
      const sweepAngle = (7.6 - lionFxTimer) * 0.22;
      const targetCamX = Math.sin(sweepAngle) * 2.2;
      const targetCamY = THREE.MathUtils.lerp(2.2, 3.2, Math.min(1.0, slimeY / 4.0));
      const targetCamZ = Math.cos(sweepAngle * 0.5) * 8.8;

      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 0.06);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.06);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.06);
    }
  }

  // Handle White Light Beam for High Tier Gifts (Quà cao cấp: Ánh sáng trắng)
  if (isWhiteBeamActive) {
    whiteBeamTimer -= deltaTime;
    whiteBeam.rotation.y += 1.4 * deltaTime;
    if (whiteBeamTimer < 0.45) {
      whiteBeamMat.opacity = Math.max(0, whiteBeamMat.opacity - deltaTime * 1.8);
    }
    if (whiteBeamTimer <= 0) {
      isWhiteBeamActive = false;
      whiteBeam.visible = false;
    }
  }

  // Update Fireworks Particles
  if (particleMat.opacity > 0.01) {
    const pos = particleGeom.attributes.position;
    for (let i = 0; i < particleCount; i++) {
      particleVelocities[i].y -= 4.5 * deltaTime; // gravity
      pos.setX(i, pos.getX(i) + particleVelocities[i].x * deltaTime);
      pos.setY(i, pos.getY(i) + particleVelocities[i].y * deltaTime);
      pos.setZ(i, pos.getZ(i) + particleVelocities[i].z * deltaTime);
    }
    pos.needsUpdate = true;
    particleMat.opacity = Math.max(0, particleMat.opacity - deltaTime * 0.45);
  }

  // Decay bass punch smoothly
  if (bassPunch > 0.001) {
    bassPunch *= 0.91;
  } else {
    bassPunch = 0;
  }

  // Update all active avatars
  const avatarCount = activeAvatars.length;
  for (let i = 0; i < avatarCount; i++) {
    const av = activeAvatars[i];
    av.update(deltaTime, bassPunch);

    if (!isPaused && av.shadowMesh) {
      const scaleVal = av.state.currentScale;
      const sX = av.rootNode.scale.x;
      const sZ = av.rootNode.scale.z;
      av.shadowMesh.scale.set(sX / scaleVal, sZ / scaleVal, 1);
      const jumpHeight = Math.max(0, av.rootNode.position.y - 0.12 * scaleVal);
      av.shadowMat.opacity = Math.max(0.12, 0.45 - jumpHeight * 0.45);
    }
  }

  controls.update();
  giftProps.update(deltaTime);
  renderer.render(scene, camera);
}

animate();

export {
  triggerDonation,
  triggerLionCelebrationEvent,
  autoTierUpOnDonate,
  activeAvatars
};
