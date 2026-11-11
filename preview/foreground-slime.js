import * as THREE from 'three';
import { createCyberSlime, SLIME_PALETTES, ULTRA_PALETTES } from './slime-model.js';

// Procedural 3D CyberSlime Mascot for High-Tier & Ultra Cinematic Overlay
let fgRenderer = null;
let fgScene = null;
let fgCamera = null;
let fgSlime = null;
let fgStardustGroup = null;
let fgStardustParticles = [];
let fgAnimId = null;

// Custom 3D Props for Ultra Tier Milestones
let fgActiveJetPlane = null;
let fgActiveParachute = null;
let fgActiveWings = null;
let fgActiveMoons = null;
let fgActivePantherFeatures = null;
let fgActiveTigerFeatures = null;
let fgActiveLionMane = null;
let fgActivePegasusFeatures = null;

const fgStardustGeo = new THREE.SphereGeometry(0.04, 6, 4);
const fgStardustMat = new THREE.MeshBasicMaterial({ color: 0xffe066, transparent: true, opacity: 0.95 });

export function initForegroundSlimeStage() {
  const canvas = document.getElementById('cinematic-slime-canvas');
  if (!canvas) return null;

  if (!fgRenderer) {
    fgRenderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    fgRenderer.setSize(window.innerWidth, window.innerHeight);
    fgRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    fgRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    fgRenderer.toneMappingExposure = 1.25;

    fgScene = new THREE.Scene();

    const aspect = window.innerWidth / window.innerHeight;
    fgCamera = new THREE.PerspectiveCamera(36, aspect, 0.1, 50);
    fgCamera.position.set(0, 0, 6.2);
    fgCamera.lookAt(0, 0, 0);

    // 3-Point Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    fgScene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
    keyLight.position.set(3, 4, 5);
    fgScene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x00f2fe, 0.9);
    fillLight.position.set(-3, -2, 4);
    fgScene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffd700, 1.3);
    rimLight.position.set(0, 4, -3);
    fgScene.add(rimLight);

    fgStardustGroup = new THREE.Group();
    fgScene.add(fgStardustGroup);
  } else {
    fgRenderer.setSize(window.innerWidth, window.innerHeight);
    fgCamera.aspect = window.innerWidth / window.innerHeight;
    fgCamera.updateProjectionMatrix();
  }

  return { renderer: fgRenderer, scene: fgScene, camera: fgCamera };
}

const fgSonicRingGeo = new THREE.TorusGeometry(0.32, 0.024, 8, 24);

function spawnFgStardust(pos, count = 2, colorHex = 0xffe066, scaleMul = 1.0) {
  if (!fgStardustGroup) return;
  for (let i = 0; i < count; i++) {
    const mat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.95 });
    const mesh = new THREE.Mesh(fgStardustGeo, mat);
    mesh.position.copy(pos);
    mesh.position.x += (Math.random() - 0.5) * 0.16;
    mesh.position.y += (Math.random() - 0.5) * 0.16;
    mesh.position.z += (Math.random() - 0.5) * 0.16;
    const baseScale = scaleMul * (0.8 + Math.random() * 0.4);
    mesh.scale.set(baseScale, baseScale, baseScale);
    fgStardustGroup.add(mesh);
    fgStardustParticles.push({
      mesh,
      isRing: false,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      vz: (Math.random() - 0.5) * 0.45,
      life: 0,
      baseScale,
      maxLife: 0.55 + Math.random() * 0.25
    });
  }
}

function spawnFgSonicRing(pos, colorHex = 0xffd700) {
  if (!fgStardustGroup) return;
  const mat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.88 });
  const mesh = new THREE.Mesh(fgSonicRingGeo, mat);
  mesh.position.copy(pos);
  mesh.rotation.y = Math.PI / 2;
  fgStardustGroup.add(mesh);
  fgStardustParticles.push({
    mesh,
    isRing: true,
    vx: 0,
    vy: 0,
    vz: 0,
    life: 0,
    baseScale: 1.0,
    maxLife: 0.70
  });
}

// ----------------------------------------------------
// 3D ULTRA PROP BUILDERS
// ----------------------------------------------------
function create3DJetPlane() {
  const plane = new THREE.Group();

  // 1. Thân phi cơ phản lực VIP (trục X)
  const bodyGeo = new THREE.CylinderGeometry(0.24, 0.32, 2.3, 16);
  bodyGeo.rotateZ(Math.PI / 2);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.65,
    roughness: 0.25
  });
  const fuselage = new THREE.Mesh(bodyGeo, bodyMat);
  plane.add(fuselage);

  // Mũi máy bay mạ vàng kim
  const noseGeo = new THREE.ConeGeometry(0.24, 0.7, 16);
  noseGeo.rotateZ(-Math.PI / 2);
  const noseMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    metalness: 0.85,
    roughness: 0.15
  });
  const nose = new THREE.Mesh(noseGeo, noseMat);
  nose.position.x = 1.5;
  plane.add(nose);

  // Kính buồng lái màu ngọc lam
  const cockpitGeo = new THREE.SphereGeometry(0.2, 14, 10);
  cockpitGeo.scale(1.8, 0.7, 0.8);
  const cockpitMat = new THREE.MeshStandardMaterial({
    color: 0x00f2fe,
    metalness: 0.1,
    roughness: 0.1,
    transparent: true,
    opacity: 0.85
  });
  const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
  cockpit.position.set(0.4, 0.22, 0);
  plane.add(cockpit);

  // Cánh chính xuôi góc delta
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0.5, 0);
  wingShape.lineTo(-0.7, 1.4);
  wingShape.lineTo(-1.0, 1.35);
  wingShape.lineTo(-0.6, 0);
  wingShape.lineTo(-1.0, -1.35);
  wingShape.lineTo(-0.7, -1.4);
  wingShape.closePath();
  const wingGeo = new THREE.ShapeGeometry(wingShape);
  wingGeo.rotateX(-Math.PI / 2);
  const wingMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    metalness: 0.5,
    roughness: 0.3,
    side: THREE.DoubleSide
  });
  const wings = new THREE.Mesh(wingGeo, wingMat);
  wings.position.set(0, -0.05, 0);
  plane.add(wings);

  // Đuôi đứng mạ vàng
  const finShape = new THREE.Shape();
  finShape.moveTo(0, 0);
  finShape.lineTo(-0.5, 0.65);
  finShape.lineTo(-0.8, 0.65);
  finShape.lineTo(-0.6, 0);
  finShape.closePath();
  const finGeo = new THREE.ShapeGeometry(finShape);
  const finMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    metalness: 0.85,
    roughness: 0.15,
    side: THREE.DoubleSide
  });
  const fin = new THREE.Mesh(finGeo, finMat);
  fin.position.set(-0.4, 0.2, 0);
  plane.add(fin);

  // Cánh đuôi ngang
  const hTailGeo = new THREE.BoxGeometry(0.35, 0.02, 0.9);
  const hTail = new THREE.Mesh(hTailGeo, wingMat);
  hTail.position.set(-0.9, 0.15, 0);
  plane.add(hTail);

  // Động cơ kép dưới cánh với họng xả lửa
  const engGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.7, 12);
  engGeo.rotateZ(Math.PI / 2);
  const engMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
  const nozMat = new THREE.MeshBasicMaterial({ color: 0xff6600 });

  const engL = new THREE.Mesh(engGeo, engMat);
  engL.position.set(-0.35, -0.15, 0.55);
  const nozL = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 12), nozMat);
  nozL.rotation.z = Math.PI / 2;
  nozL.position.x = -0.36;
  engL.add(nozL);
  plane.add(engL);

  const engR = new THREE.Mesh(engGeo, engMat);
  engR.position.set(-0.35, -0.15, -0.55);
  const nozR = nozL.clone();
  engR.add(nozR);
  plane.add(engR);

  plane.scale.set(0.68, 0.68, 0.68);
  return plane;
}

function create3DParachute() {
  const parachuteGroup = new THREE.Group();
  const domeGeo = new THREE.SphereGeometry(0.55, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const domeMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    emissive: 0xb45309,
    emissiveIntensity: 0.55,
    metalness: 0.65,
    roughness: 0.25,
    side: THREE.DoubleSide
  });
  const dome = new THREE.Mesh(domeGeo, domeMat);
  dome.position.y = 0.95;
  parachuteGroup.add(dome);

  // 6 Dây dù chịu lực màu trắng kết nối trực tiếp với Slime
  const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
  const attachPoints = [
    new THREE.Vector3(-0.48, 0.95, 0),
    new THREE.Vector3(0.48, 0.95, 0),
    new THREE.Vector3(0, 0.95, -0.48),
    new THREE.Vector3(0, 0.95, 0.48),
    new THREE.Vector3(-0.34, 0.95, 0.34),
    new THREE.Vector3(0.34, 0.95, -0.34)
  ];
  const origin = new THREE.Vector3(0, 0.15, 0);
  attachPoints.forEach(pt => {
    const geo = new THREE.BufferGeometry().setFromPoints([pt, origin]);
    parachuteGroup.add(new THREE.Line(geo, lineMat));
  });

  parachuteGroup.visible = false;
  return parachuteGroup;
}

function createPantherFeatures(slime) {
  const group = new THREE.Group();
  group.name = 'PantherFeatures';

  // 2 Răng nanh sắc nhọn màu trắng ở khóe miệng
  const fangMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.15,
    metalness: 0.1,
    emissive: 0x444444
  });
  const fangGeo = new THREE.ConeGeometry(0.035, 0.12, 8);
  fangGeo.rotateX(Math.PI); // Hướng đầu nhọn xuống dưới

  const fangL = new THREE.Mesh(fangGeo, fangMat);
  fangL.position.set(-0.09, 0.16, 0.98);
  group.add(fangL);

  const fangR = new THREE.Mesh(fangGeo, fangMat);
  fangR.position.set(0.09, 0.16, 0.98);
  group.add(fangR);

  // 6 Sợi râu phát quang tím neon (3 bên trái, 3 bên phải)
  const whiskerMat = new THREE.LineBasicMaterial({
    color: 0xc084fc,
    transparent: true,
    opacity: 0.95
  });
  [-0.15, 0, 0.15].forEach((angle, i) => {
    const ptsL = [
      new THREE.Vector3(-0.25, 0.22 + i * 0.02, 0.90),
      new THREE.Vector3(-0.62, 0.22 + Math.tan(angle) * 0.15, 0.82)
    ];
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(ptsL), whiskerMat));

    const ptsR = [
      new THREE.Vector3(0.25, 0.22 + i * 0.02, 0.90),
      new THREE.Vector3(0.62, 0.22 + Math.tan(angle) * 0.15, 0.82)
    ];
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(ptsR), whiskerMat));
  });

  return group;
}

function createTigerFeatures(slime) {
  const group = new THREE.Group();
  group.name = 'TigerFeatures';

  // 2 Má phính tròn xoe màu cam nham thạch
  const cheekGeo = new THREE.SphereGeometry(0.16, 12, 10);
  cheekGeo.scale(1.2, 0.9, 0.8);
  const cheekMat = new THREE.MeshStandardMaterial({
    color: 0xff6600,
    emissive: 0xff3d00,
    emissiveIntensity: 0.45,
    roughness: 0.35
  });
  const cheekL = new THREE.Mesh(cheekGeo, cheekMat);
  cheekL.position.set(-0.38, 0.24, 0.86);
  group.add(cheekL);

  const cheekR = new THREE.Mesh(cheekGeo, cheekMat);
  cheekR.position.set(0.38, 0.24, 0.86);
  group.add(cheekR);

  // 2 Răng nanh hổ cong nhọn
  const fangMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.15,
    metalness: 0.1
  });
  const fangGeo = new THREE.ConeGeometry(0.038, 0.13, 8);
  fangGeo.rotateX(Math.PI);

  const fangL = new THREE.Mesh(fangGeo, fangMat);
  fangL.position.set(-0.08, 0.17, 0.98);
  group.add(fangL);

  const fangR = new THREE.Mesh(fangGeo, fangMat);
  fangR.position.set(0.08, 0.17, 0.98);
  group.add(fangR);

  // 6 Sợi râu hổ rực lửa vàng kim (3 trái, 3 phải)
  const whiskerMat = new THREE.LineBasicMaterial({
    color: 0xffd700,
    transparent: true,
    opacity: 0.95
  });
  [-0.18, 0, 0.18].forEach((angle, i) => {
    const ptsL = [
      new THREE.Vector3(-0.35, 0.24 + i * 0.02, 0.90),
      new THREE.Vector3(-0.68, 0.24 + Math.tan(angle) * 0.16, 0.80)
    ];
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(ptsL), whiskerMat));

    const ptsR = [
      new THREE.Vector3(0.35, 0.24 + i * 0.02, 0.90),
      new THREE.Vector3(0.68, 0.24 + Math.tan(angle) * 0.16, 0.80)
    ];
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(ptsR), whiskerMat));
  });

  // Vằn lửa chữ "王" trên trán hổ
  const stripeMat = new THREE.MeshBasicMaterial({ color: 0xff3d00 });
  [-0.08, 0, 0.08].forEach((yOff, idx) => {
    const barW = idx === 1 ? 0.20 : 0.26;
    const barGeo = new THREE.BoxGeometry(barW, 0.024, 0.02);
    const bar = new THREE.Mesh(barGeo, stripeMat);
    bar.position.set(0, 0.65 + yOff, 0.88);
    group.add(bar);
  });
  const vertBarGeo = new THREE.BoxGeometry(0.024, 0.18, 0.02);
  const vertBar = new THREE.Mesh(vertBarGeo, stripeMat);
  vertBar.position.set(0, 0.65, 0.885);
  group.add(vertBar);

  return group;
}

function createLionManeFeatures() {
  const maneGroup = new THREE.Group();
  maneGroup.name = 'LionManeFeatures';

  // 16 Búi lông bờm sư tử vàng hổ phách bao quanh đầu & cổ
  const maneGeo = new THREE.SphereGeometry(0.20, 10, 8);
  const maneMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 0.65,
    roughness: 0.45,
    metalness: 0.3
  });
  const puffCount = 16;
  const maneRadius = 0.84;
  for (let i = 0; i < puffCount; i++) {
    const theta = (i / puffCount) * Math.PI * 2;
    const puff = new THREE.Mesh(maneGeo, maneMat);
    puff.position.set(
      Math.cos(theta) * maneRadius,
      0.48 + Math.sin(theta) * 0.65,
      -0.12 + Math.cos(theta * 2) * 0.08
    );
    const s = 0.85 + (i % 2) * 0.3;
    puff.scale.set(s, s, s);
    maneGroup.add(puff);
  }

  // Vương miện hoàng gia 5 đỉnh mạ vàng 24K đính ngọc ruby đỏ
  const crownGroup = new THREE.Group();
  crownGroup.position.set(0, 0.98, 0);
  const crownBandGeo = new THREE.CylinderGeometry(0.32, 0.34, 0.08, 20);
  const crownMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    emissive: 0xffaa00,
    emissiveIntensity: 0.75,
    metalness: 0.88,
    roughness: 0.15
  });
  crownGroup.add(new THREE.Mesh(crownBandGeo, crownMat));

  const rubyMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
  const rubyGeo = new THREE.SphereGeometry(0.035, 8, 8);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const spikeGeo = new THREE.ConeGeometry(0.065, 0.22, 8);
    const spike = new THREE.Mesh(spikeGeo, crownMat);
    spike.position.set(Math.cos(a) * 0.32, 0.12, Math.sin(a) * 0.32);
    spike.rotation.y = -a;
    spike.rotation.z = -0.15;
    crownGroup.add(spike);

    const ruby = new THREE.Mesh(rubyGeo, rubyMat);
    ruby.position.set(Math.cos(a) * 0.32, 0.23, Math.sin(a) * 0.32);
    crownGroup.add(ruby);
  }
  maneGroup.add(crownGroup);

  maneGroup.visible = false; // Ban đầu ẩn, chỉ xuất hiện khi hóa thân trên không!
  return maneGroup;
}

function create3DCelestialWings() {
  const wingsGroup = new THREE.Group();
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.bezierCurveTo(0.2, 0.3, 0.5, 0.65, 0.85, 0.8);
  wingShape.bezierCurveTo(0.65, 0.45, 0.55, 0.2, 0.3, 0.05);
  wingShape.closePath();

  const wingGeo = new THREE.ShapeGeometry(wingShape);
  const wingMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x00f2fe,
    emissiveIntensity: 0.85,
    metalness: 0.2,
    roughness: 0.3,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.92
  });

  const wingL = new THREE.Mesh(wingGeo, wingMat);
  wingL.position.set(-0.25, 0.45, -0.15);
  wingL.rotation.y = 0.25;
  wingsGroup.add(wingL);

  const wingR = new THREE.Mesh(wingGeo, wingMat);
  wingR.scale.set(-1, 1, 1);
  wingR.position.set(0.25, 0.45, -0.15);
  wingR.rotation.y = -0.25;
  wingsGroup.add(wingR);

  wingsGroup.wingL = wingL;
  wingsGroup.wingR = wingR;
  return wingsGroup;
}

function createPegasusFeatures() {
  const group = new THREE.Group();
  group.name = 'PegasusFeatures';

  // Sừng thần Alicorn xoắn vàng đặt đúng trên trán trên, nghiêng 28 độ về phía trước
  const hornGeo = new THREE.ConeGeometry(0.075, 0.42, 12);
  hornGeo.rotateX(0.49); // 28 độ rad
  const hornMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    emissive: 0xffea00,
    emissiveIntensity: 0.85,
    metalness: 0.85,
    roughness: 0.15
  });
  const horn = new THREE.Mesh(hornGeo, hornMat);
  horn.position.set(0, 0.82, 0.52);
  group.add(horn);

  // 2 Tai ngựa thon nhọn đặt ở góc trên 2 bên (x = +-0.36, y = 0.76, z = 0.18)
  const earMat = new THREE.MeshStandardMaterial({
    color: 0xe0e7ff,
    emissive: 0x00f2fe,
    emissiveIntensity: 0.45,
    roughness: 0.3
  });
  const earGeo = new THREE.ConeGeometry(0.08, 0.26, 8);

  const earL = new THREE.Mesh(earGeo, earMat);
  earL.position.set(-0.36, 0.76, 0.18);
  earL.rotation.set(-0.15, 0.2, 0.35);
  group.add(earL);

  const earR = new THREE.Mesh(earGeo, earMat);
  earR.position.set(0.36, 0.76, 0.18);
  earR.rotation.set(-0.15, -0.2, -0.35);
  group.add(earR);

  // Đôi cánh thiên thần starlight
  const wingsGroup = create3DCelestialWings();
  group.add(wingsGroup);
  group.wingsGroup = wingsGroup;

  return group;
}

function create3DUniverseMoons() {
  const moonsGroup = new THREE.Group();
  const moonSpecs = [
    { r: 0.08, dist: 0.95, speed: 3.2, color: 0x00f2fe, inc: 0.3 },
    { r: 0.07, dist: 1.15, speed: -2.6, color: 0xff007f, inc: -0.55 },
    { r: 0.09, dist: 1.35, speed: 2.0, color: 0xffd700, inc: 0.8 }
  ];
  moonsGroup.moons = [];
  moonSpecs.forEach(spec => {
    const geo = new THREE.SphereGeometry(spec.r, 12, 10);
    const mat = new THREE.MeshStandardMaterial({
      color: spec.color,
      emissive: spec.color,
      emissiveIntensity: 0.85,
      roughness: 0.2,
      metalness: 0.6
    });
    const mesh = new THREE.Mesh(geo, mat);
    moonsGroup.add(mesh);
    moonsGroup.moons.push({ mesh, spec });
  });
  return moonsGroup;
}

export function startForegroundSlime(donorAvatar, duration, giftKey = 'money_gun') {
  const stage = initForegroundSlimeStage();
  if (!stage) return;

  // Clean up any previous slime instance
  stopForegroundSlime();

  const palKey = (donorAvatar?.currentPaletteKey && SLIME_PALETTES[donorAvatar.currentPaletteKey])
    ? donorAvatar.currentPaletteKey
    : 'cyan';
  const tier = donorAvatar?.state?.tier || 3;

  try {
    fgSlime = createCyberSlime(palKey, donorAvatar?.userData || {});
    if (fgSlime.setLabelVisible) fgSlime.setLabelVisible(false);
    if (fgSlime.setTier) fgSlime.setTier(tier);
    if (fgSlime.setExpression) fgSlime.setExpression('happy');

    const MASCOT_SCALE = 0.68;
    fgSlime.mesh.scale.set(MASCOT_SCALE, MASCOT_SCALE, MASCOT_SCALE);
    fgScene.add(fgSlime.mesh);
  } catch (err) {
    console.error('Failed to create 3D foreground slime:', err);
    return;
  }

  const startTime = performance.now();
  let lastTime = startTime;

  // Identify Gift Milestone for Progressive Choreography
  const gKey = (giftKey || '').toLowerCase();
  const isUniverseUltra = gKey.includes('universe') || gKey.includes('vũ trụ');
  const isPegasusUltra = gKey.includes('pegasus') || gKey.includes('ngựa');
  const isLionUltra = gKey.includes('lion') || gKey.includes('sư tử');
  const isTigerUltra = gKey.includes('tiger') || gKey.includes('hổ');
  const isPhoenixUltra = gKey.includes('phoenix') || gKey.includes('phượng');
  const isPantherUltra = gKey.includes('panther') || gKey.includes('báo');
  const isAirplaneUltra = (gKey === 'jet' || gKey.includes('airplane') || gKey.includes('máy bay'));

  const isMoneyGun = !isUniverseUltra && !isPegasusUltra && !isLionUltra && !isTigerUltra && !isPhoenixUltra && !isPantherUltra && !isAirplaneUltra && (gKey.includes('money') || gKey.includes('gem_gun'));
  const isSwan = !isUniverseUltra && !isPegasusUltra && !isLionUltra && !isTigerUltra && !isPhoenixUltra && !isPantherUltra && !isAirplaneUltra && (gKey.includes('swan') || gKey.includes('thiên nga'));
  const isGalaxy = !isUniverseUltra && !isPegasusUltra && !isLionUltra && !isTigerUltra && !isPhoenixUltra && !isPantherUltra && !isAirplaneUltra && (gKey.includes('galaxy'));
  const isWhale = !isUniverseUltra && !isPegasusUltra && !isLionUltra && !isTigerUltra && !isPhoenixUltra && !isPantherUltra && !isAirplaneUltra && (gKey.includes('whale') || gKey.includes('cá voi'));
  const isJet = !isUniverseUltra && !isPegasusUltra && !isLionUltra && !isTigerUltra && !isPhoenixUltra && !isPantherUltra && !isAirplaneUltra && (gKey.includes('private_jet') || gKey.includes('chuyên cơ'));
  const isDiamond = !isUniverseUltra && !isPegasusUltra && !isLionUltra && !isTigerUltra && !isPhoenixUltra && !isPantherUltra && !isAirplaneUltra && gKey.includes('diamond');
  const isQueen = !isUniverseUltra && !isPegasusUltra && !isLionUltra && !isTigerUltra && !isPhoenixUltra && !isPantherUltra && !isAirplaneUltra && (gKey.includes('queen') || (!isMoneyGun && !isSwan && !isGalaxy && !isWhale && !isJet && !isDiamond));

  // Style Slime palette according to Ultra Tier Persona
  if (fgSlime && fgSlime.setPalette) {
    if (isPantherUltra) {
      fgSlime.setPalette('purple');
    } else if (isTigerUltra) {
      fgSlime.setPalette('orange');
    } else if (isUniverseUltra) {
      fgSlime.setPalette('cosmic');
    } else if (isLionUltra) {
      fgSlime.setPalette('gold');
    } else if (isPegasusUltra) {
      fgSlime.setPalette('celestial');
    } else if (isPhoenixUltra) {
      fgSlime.setPalette('orange');
    }
  }

  // Tilt eyes for Panther: (\ . /)
  if (isPantherUltra && fgSlime?.userData?.eyeL && fgSlime?.userData?.eyeR) {
    fgSlime.userData._origEyeRotZ = {
      l: fgSlime.userData.eyeL.rotation.z,
      r: fgSlime.userData.eyeR.rotation.z
    };
    fgSlime.userData.eyeL.rotation.z = -0.38;
    fgSlime.userData.eyeR.rotation.z = 0.38;
  }

  // Khởi tạo các 3D Props chuyên biệt cho từng Ultra Gift
  if (isAirplaneUltra && fgSlime?.mesh) {
    fgActiveJetPlane = create3DJetPlane();
    fgScene.add(fgActiveJetPlane);
    fgActiveParachute = create3DParachute();
    fgSlime.mesh.add(fgActiveParachute);
  } else if (isPantherUltra && fgSlime?.mesh) {
    fgActivePantherFeatures = createPantherFeatures(fgSlime);
    fgSlime.mesh.add(fgActivePantherFeatures);
  } else if (isTigerUltra && fgSlime?.mesh) {
    fgActiveTigerFeatures = createTigerFeatures(fgSlime);
    fgSlime.mesh.add(fgActiveTigerFeatures);
  } else if (isLionUltra && fgSlime?.mesh) {
    fgActiveLionMane = createLionManeFeatures();
    fgSlime.mesh.add(fgActiveLionMane);
  } else if (isPegasusUltra && fgSlime?.mesh) {
    fgActivePegasusFeatures = createPegasusFeatures();
    fgSlime.mesh.add(fgActivePegasusFeatures);
    fgActiveWings = fgActivePegasusFeatures.wingsGroup;
  } else if (isUniverseUltra && fgSlime?.mesh) {
    fgActiveMoons = create3DUniverseMoons();
    fgSlime.mesh.add(fgActiveMoons);
  }

  const MASCOT_SCALE = 0.68;
  let burstDone = false;
  let sonicRingTriggered = false;

  function renderFg(currentTime) {
    const now = currentTime || performance.now();
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    const elapsed = (now - startTime) / 1000;
    const progress = Math.min(1.0, elapsed / duration);

    if (elapsed >= duration) {
      stopForegroundSlime();
      return;
    }

    // Update slime internal animations (eyes blinking, ear jiggles, halo)
    if (fgSlime && fgSlime.update) {
      fgSlime.update(dt, 0);
    }

    // Update stardust & sonic ring particles
    for (let i = fgStardustParticles.length - 1; i >= 0; i--) {
      const p = fgStardustParticles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        fgStardustGroup.remove(p.mesh);
        if (p.mesh.material) p.mesh.material.dispose();
        fgStardustParticles.splice(i, 1);
      } else {
        p.mesh.position.x += p.vx * dt;
        p.mesh.position.y += p.vy * dt;
        p.mesh.position.z += p.vz * dt;
        const prog = p.life / p.maxLife;
        if (p.isRing) {
          const s = 1.0 + prog * 3.2;
          p.mesh.scale.set(s, s, s);
          p.mesh.material.opacity = (1.0 - prog) * 0.88;
        } else {
          const s = (1.0 - prog) * (p.baseScale || 1.0);
          p.mesh.scale.set(s, s, s);
          p.mesh.material.opacity = (1.0 - prog) * 0.95;
        }
      }
    }

    if (fgSlime && fgSlime.mesh) {
      let posX = -1.65;
      let posY = -0.65;
      let posZ = 1.25;
      let rotX = 0;
      let rotY = 0;
      let rotZ = 0;
      let scX = MASCOT_SCALE;
      let scY = MASCOT_SCALE;
      let scZ = MASCOT_SCALE;

      // ====================================================
      // ULTRA 1: AIRPLANE VIP (6,000🪙) - Cưỡi Máy Bay 3D -> Rơi tự do -> Bung dù vàng 3D hạ cánh
      // ====================================================
      if (isAirplaneUltra) {
        if (progress < 0.38) {
          // Giai đoạn 1: Cưỡi Máy Bay 3D lướt ngang trời cao (Hạ thấp Y = 0.65 để vừa vặn khung hình 100%, không bị cắt)
          const pRide = progress / 0.38;
          const planeX = -3.4 + pRide * 3.8; // -3.4 -> +0.4
          const planeY = 0.65 + Math.sin(elapsed * 6) * 0.05;
          const planeZ = 1.25;

          if (fgActiveJetPlane) {
            fgActiveJetPlane.visible = true;
            fgActiveJetPlane.position.set(planeX, planeY, planeZ);
            fgActiveJetPlane.rotation.set(0.05, 0, -0.12);
          }

          // Slime ngồi vừa khít trên lưng máy bay 3D
          posX = planeX + 0.05;
          posY = planeY + 0.22;
          posZ = planeZ;
          rotX = 0.05;
          rotY = 0;
          rotZ = -0.12;
          scX = MASCOT_SCALE;
          scY = MASCOT_SCALE;
          scZ = MASCOT_SCALE;

          if (fgActiveParachute) fgActiveParachute.visible = false;
          if (fgSlime.setExpression) fgSlime.setExpression('happy');

          // Phụt khói phản lực sau 2 động cơ máy bay 3D
          if (Math.random() < 0.7) {
            spawnFgStardust(new THREE.Vector3(planeX - 0.65, planeY - 0.08, planeZ + 0.32), 1, 0xffaa00);
            spawnFgStardust(new THREE.Vector3(planeX - 0.65, planeY - 0.08, planeZ - 0.32), 1, 0xffaa00);
          }
        } else if (progress < 0.52) {
          // Giai đoạn 2: Máy bay bứt tốc lao đi -> Slime rơi tự do hốt hoảng!
          const pFall = (progress - 0.38) / 0.14;

          // Máy bay 3D phóng vút về phía trước
          if (fgActiveJetPlane) {
            const boostX = 0.4 + pFall * pFall * 5.5;
            fgActiveJetPlane.position.set(boostX, 0.65 + pFall * 0.3, 1.25);
            if (pFall > 0.8) fgActiveJetPlane.visible = false;
            spawnFgStardust(fgActiveJetPlane.position, 2, 0xff4500);
          }

          // Slime rơi tự do
          posX = 0.45 + pFall * 0.1;
          posY = 0.87 - pFall * 1.02; // 0.87 -> -0.15
          posZ = 1.25;
          rotX = pFall * Math.PI * 4; // lộn nhào hốt hoảng
          rotZ = Math.sin(pFall * 16) * 0.5;
          rotY = 0;
          scY = MASCOT_SCALE * 1.35;
          scX = MASCOT_SCALE * 0.78;
          scZ = MASCOT_SCALE * 0.78;

          if (fgActiveParachute) fgActiveParachute.visible = false;
          if (fgSlime.setExpression) fgSlime.setExpression('angry');
        } else if (progress < 0.88) {
          // Giai đoạn 3: BUNG DÙ VÀNG 3D! Lơ lửng tiếp đất nhẹ nhàng
          if (fgActiveJetPlane) fgActiveJetPlane.visible = false;
          if (fgActiveParachute) {
            fgActiveParachute.visible = true;
            const popOpen = Math.min(1.0, (progress - 0.52) / 0.05);
            fgActiveParachute.scale.set(popOpen, popOpen, popOpen);
          }

          const pFloat = (progress - 0.52) / 0.36;
          const sway = Math.sin(pFloat * Math.PI * 5) * 0.35;

          posX = 0.55 + sway * 0.55;
          posY = -0.15 - pFloat * 0.50; // -0.15 -> -0.65
          posZ = 1.25;

          rotZ = sway * 0.35; // Thân Slime và dù nghiêng nhịp nhàng
          rotX = 0;
          rotY = -0.15;
          scY = MASCOT_SCALE * 0.96;
          scX = MASCOT_SCALE * 1.04;
          scZ = MASCOT_SCALE * 1.04;

          if (fgSlime.setExpression) fgSlime.setExpression('smile');
          if (Math.random() < 0.65) {
            spawnFgStardust(new THREE.Vector3(posX, posY + 0.95, posZ), 1, 0xffd700);
          }
        } else {
          // Giai đoạn 4: Thu dù chạm đất ăn mừng
          if (fgActiveParachute) fgActiveParachute.visible = false;
          const pLand = (progress - 0.88) / 0.12;
          posX = 0.55;
          posY = -0.65;
          posZ = 1.25;
          rotX = Math.min(0.3, pLand * 0.6);
          rotZ = 0;
          const squash = Math.sin(pLand * Math.PI) * 0.18;
          scY = MASCOT_SCALE * (1.0 - squash);
          scX = MASCOT_SCALE * (1.0 + squash);
          scZ = MASCOT_SCALE * (1.0 + squash);
          if (fgSlime.setExpression) fgSlime.setExpression('happy');
        }
      }

      // ====================================================
      // ULTRA 2: BÁO ĐÊM BÁ CHỦ (10,000🪙) - Thân tím obsidian, mắt vàng rực, hạ thấp rình mồi -> Bứt tốc xé gió -> Trượt phanh 180° bốc khói sóng chấn tím
      // ====================================================
      else if (isPantherUltra) {
        if (progress < 0.22) {
          // Giai đoạn 1: Hạ thấp trọng tâm rình mồi sát mặt đất, thân tím obsidian, mắt vàng rực
          const pStalk = progress / 0.22;
          posX = -2.2 + pStalk * 0.7; // -2.2 -> -1.5
          posY = -0.60;
          posZ = 1.25;
          rotX = 0.08;
          rotY = 0.25;
          rotZ = 0;
          // Hạ thấp trọng tâm cực độ (squash phẳng như báo rình mồi)
          scY = MASCOT_SCALE * 0.45;
          scX = MASCOT_SCALE * 1.45;
          scZ = MASCOT_SCALE * 1.25;
          if (fgSlime.setExpression) fgSlime.setExpression('angry');
        } else if (progress < 0.65) {
          // Giai đoạn 2: Bứt tốc lao nhanh xé gió!
          const pSprint = (progress - 0.22) / 0.43;
          posX = -1.5 + pSprint * 3.0; // -1.5 -> +1.5
          const sHop = Math.abs(Math.sin(pSprint * Math.PI * 6)) * 0.30;
          posY = -0.60 + sHop;
          posZ = 1.25;
          rotZ = -0.25; // Chúi đầu lao xé gió
          rotX = 0.15;
          rotY = 0.12;
          scX = MASCOT_SCALE * (1.40 + sHop * 0.25);
          scY = MASCOT_SCALE * (0.60 + sHop * 0.25);
          scZ = MASCOT_SCALE * 1.1;

          spawnFgStardust(fgSlime.mesh.position, 2, 0xa855f7);
          if (sHop < 0.04) {
            spawnFgSonicRing(fgSlime.mesh.position, 0x9333ea);
          }
          if (fgSlime.setExpression) fgSlime.setExpression('proud');
        } else if (progress < 0.88) {
          // Giai đoạn 3: Trượt phanh 180° bốc khói sóng chấn tím!
          const pDrift = (progress - 0.65) / 0.23;
          posX = 1.5;
          posY = -0.60;
          posZ = 1.25;
          rotY = pDrift * Math.PI; // Quay phắt 180 độ
          rotZ = Math.sin(pDrift * Math.PI) * 0.32; // Nghiêng thân trôi bánh phanh
          rotX = 0;
          scY = MASCOT_SCALE * 0.72;
          scX = MASCOT_SCALE * 1.28;
          scZ = MASCOT_SCALE * 1.18;

          if (!sonicRingTriggered) {
            sonicRingTriggered = true;
            spawnFgSonicRing(fgSlime.mesh.position, 0xc084fc);
            spawnFgSonicRing(fgSlime.mesh.position, 0x9333ea);
          }
          spawnFgStardust(fgSlime.mesh.position, 3, 0xa855f7);
          if (fgSlime.setExpression) fgSlime.setExpression('proud');
        } else {
          // Giai đoạn 4: Thu mình tan vào bóng tối
          const pEnd = (progress - 0.88) / 0.12;
          posX = 1.5;
          posY = -0.60 - pEnd * 0.15;
          posZ = 1.25;
          rotY = Math.PI;
          rotZ = 0;
          const shrink = Math.max(0.01, 1.0 - pEnd * 1.15);
          scX = MASCOT_SCALE * shrink;
          scY = MASCOT_SCALE * shrink;
          scZ = MASCOT_SCALE * shrink;
        }
      }

      // ====================================================
      // ULTRA 3: PHƯỢNG HOÀNG TÁI SINH (25,999🪙) - Co thành quả trứng -> Nứt vỡ nổ tung -> Slime 3D BIẾN MẤT HOÀN TOÀN
      // ====================================================
      else if (isPhoenixUltra) {
        if (progress < 0.24) {
          // Co cụm thành quả trứng thần thoại rung bần bật ở trung tâm
          posX = 0;
          posY = 0;
          posZ = 1.25;
          const eggVibrate = Math.sin(elapsed * 45) * 0.04;
          posX += eggVibrate;
          posY += Math.cos(elapsed * 45) * 0.04;
          rotX = 0; rotY = elapsed * 3; rotZ = 0;
          scX = MASCOT_SCALE * 0.82;
          scY = MASCOT_SCALE * 1.35;
          scZ = MASCOT_SCALE * 0.82;
          if (fgSlime.setExpression) fgSlime.setExpression('angry');
          if (Math.random() < 0.6) spawnFgStardust(fgSlime.mesh.position, 1, 0xffaa00);
        } else if (progress < 0.32) {
          // Nứt vỡ phát quang cực độ
          posX = (Math.random() - 0.5) * 0.08;
          posY = (Math.random() - 0.5) * 0.08;
          posZ = 1.25;
          scX = MASCOT_SCALE * (0.82 + Math.sin(elapsed * 60) * 0.18);
          scY = MASCOT_SCALE * (1.35 + Math.cos(elapsed * 60) * 0.18);
          scZ = MASCOT_SCALE * (0.82 + Math.sin(elapsed * 60) * 0.18);
        } else {
          // BÙNG NỔ & BIẾN MẤT HOÀN TOÀN (để Phượng Hoàng 2D chiếm trọn spotlight)
          if (!burstDone) {
            burstDone = true;
            spawnFgStardust(fgSlime.mesh.position, 45, 0xffd700, 2.5);
            spawnFgSonicRing(fgSlime.mesh.position, 0xff4500);
            spawnFgSonicRing(fgSlime.mesh.position, 0xffd700);
          }
          fgSlime.mesh.visible = false;
        }
      }

      // ====================================================
      // ULTRA 4: HỔ LỬA CUỒNG NỘ (26,999🪙) - Thân cam nham thạch, dậm chân tạo sóng -> Nhảy lộn nhào xuyên qua tâm VÒNG LỬA 2D -> Tiếp đất gầm uy lực
      // ====================================================
      else if (isTigerUltra) {
        if (progress < 0.25) {
          // Giai đoạn 1: Thân cam nham thạch, dậm chân tạo sóng chấn động
          posX = -1.8;
          posY = -0.60;
          posZ = 1.25;
          const stompCycle = (progress / 0.25) * 3;
          const sf = stompCycle % 1;
          const stompY = Math.sin(sf * Math.PI) * 0.18;
          posY += stompY;

          const stompSquash = sf > 0.82 ? 0.45 : 1.0;
          scY = MASCOT_SCALE * (0.75 * stompSquash);
          scX = MASCOT_SCALE * (1.25 / stompSquash);
          scZ = MASCOT_SCALE * (1.25 / stompSquash);
          rotX = 0; rotY = 0.25; rotZ = 0;

          if (sf > 0.85 && Math.random() < 0.45) {
            spawnFgSonicRing(fgSlime.mesh.position, 0xff4500);
            spawnFgStardust(fgSlime.mesh.position, 2, 0xff8800);
          }
          if (fgSlime.setExpression) fgSlime.setExpression('angry');
        } else if (progress < 0.68) {
          // Giai đoạn 2: Bật nhảy cầu vồng lộn nhào xuyên qua tâm VÒNG LỬA 2D (Apex X = 0, Y = +0.22)
          const pLeap = (progress - 0.25) / 0.43;
          posX = -1.8 + pLeap * 3.6; // -1.8 -> +1.8
          posY = -0.60 + Math.sin(pLeap * Math.PI) * 0.82; // Apex = +0.22 tại tâm Vòng Lửa 2D
          posZ = 1.25;
          rotX = -pLeap * Math.PI * 4; // Lộn nhào 720 độ uy lực!
          rotY = 0; rotZ = 0;
          scY = MASCOT_SCALE * 1.25;
          scX = MASCOT_SCALE * 0.88;
          scZ = MASCOT_SCALE * 0.88;
          spawnFgStardust(fgSlime.mesh.position, 3, 0xff5500);
          if (pLeap > 0.48 && pLeap < 0.54) {
            // Khi xuyên qua tâm vòng lửa
            spawnFgSonicRing(fgSlime.mesh.position, 0xffd700);
          }
        } else if (progress < 0.88) {
          // Giai đoạn 3: Tiếp đất gầm uy lực
          const pLand = (progress - 0.68) / 0.20;
          posX = 1.8;
          posY = -0.60;
          posZ = 1.25;
          if (pLand < 0.25) {
            // Impact tiếp đất
            const imp = pLand / 0.25;
            scY = MASCOT_SCALE * (0.50 + imp * 0.50);
            scX = MASCOT_SCALE * (1.45 - imp * 0.45);
            scZ = MASCOT_SCALE * (1.45 - imp * 0.45);
            rotX = 0;
            if (!burstDone) {
              burstDone = true;
              spawnFgSonicRing(fgSlime.mesh.position, 0xff3d00);
            }
          } else {
            // Ngẩng cao đầu gầm uy lực
            rotX = -0.22;
            rotY = -0.25;
            rotZ = 0;
            scY = MASCOT_SCALE * 1.25;
            scX = MASCOT_SCALE * 0.95;
            scZ = MASCOT_SCALE * 0.95;
          }
          if (fgSlime.setExpression) fgSlime.setExpression('proud');
        } else {
          // Lặn vào sàn
          const pEnd = (progress - 0.88) / 0.12;
          posX = 1.8;
          posY = -0.60 - pEnd * 0.15;
          posZ = 1.25;
          const shrink = Math.max(0.01, 1.0 - pEnd * 1.15);
          scX = MASCOT_SCALE * shrink;
          scY = MASCOT_SCALE * shrink;
          scZ = MASCOT_SCALE * shrink;
        }
      }

      // ====================================================
      // ULTRA 5: SƯ TỬ HOÀNG GIA (29,999🪙) - Tiến vào cột sáng trung tâm -> Hút lên không trung -> Hóa thân Vua Sư Tử + Lộn xoay nhào lộn -> Hạ cánh trang nghiêm
      // ====================================================
      else if (isLionUltra) {
        if (progress < 0.22) {
          // Giai đoạn 1: Tiến vào cột sáng trung tâm (Slime bình thường)
          const p0 = progress / 0.22;
          posX = -1.8 + p0 * 1.8; // -1.8 -> 0
          posY = -0.65;
          posZ = 1.35; // Nổi hoàn toàn phía trước avatar card
          rotY = -0.20;
          rotX = 0; rotZ = 0;
          const stepBounce = Math.abs(Math.sin(p0 * Math.PI * 4)) * 0.08;
          posY += stepBounce;
          scX = MASCOT_SCALE; scY = MASCOT_SCALE; scZ = MASCOT_SCALE;
          if (fgActiveLionMane) fgActiveLionMane.visible = false;
          if (fgSlime.setExpression) fgSlime.setExpression('proud');
          if (stepBounce > 0.06) spawnFgStardust(fgSlime.mesh.position, 1, 0xffd700);

          // Reset camera góc nhìn chuẩn
          if (fgCamera) {
            fgCamera.position.set(0, 0, 6.2);
            fgCamera.lookAt(0, 0, 0);
          }
        } else if (progress < 0.68) {
          // Giai đoạn 2: Bị hút lên cao / thăng thiên thẳng đứng trong cột sáng (Y = -0.65 -> +1.05)
          const pAscend = (progress - 0.22) / 0.46;
          posX = 0;
          posY = -0.65 + Math.sin(pAscend * Math.PI * 0.5) * 1.70; // -0.65 -> +1.05
          posZ = 1.35;

          // Hóa thân Sư Tử Hoàng Gia ở giữa không trung (pAscend >= 0.40)
          if (pAscend >= 0.40 && fgActiveLionMane) {
            if (!fgActiveLionMane.visible) {
              fgActiveLionMane.visible = true;
              spawnFgSonicRing(fgSlime.mesh.position, 0xffd700);
              spawnFgStardust(fgSlime.mesh.position, 22, 0xffea00, 1.8);
            }
          }

          // Hiệu ứng lộn xoay trên không như cũ (Corkscrew spin 360° + Acrobatic tumble flip)
          rotY = pAscend * Math.PI * 6; // Xoay 3 vòng 360 độ
          rotX = Math.sin(pAscend * Math.PI) * Math.PI * 2; // Lộn nhào 360 độ uy lực
          rotZ = 0;

          scY = MASCOT_SCALE * 1.15;
          scX = MASCOT_SCALE * 0.92;
          scZ = MASCOT_SCALE * 0.92;
          spawnFgStardust(fgSlime.mesh.position, 3, 0xffd700);

          // Dynamic Cinematic Camera Dolly & Tilt Tracking: Bắt trọn toàn bộ vương miện và bờm, không bị cắt góc
          if (fgCamera) {
            const camDolly = Math.sin(pAscend * Math.PI);
            fgCamera.position.z = 6.2 + camDolly * 0.70;
            fgCamera.position.y = camDolly * 0.32;
            fgCamera.lookAt(0, posY * 0.35, 0);
          }

          if (fgSlime.setExpression) fgSlime.setExpression('proud');
        } else if (progress < 0.88) {
          // Giai đoạn 3: Hạ cánh trang nghiêm trong hình dạng Vua Sư Tử
          const pDescend = (progress - 0.68) / 0.20;
          posX = 0;
          posY = 1.05 - pDescend * 1.70; // +1.05 -> -0.65
          posZ = 1.35;
          rotY = 0; rotX = 0; rotZ = 0;
          if (fgActiveLionMane) fgActiveLionMane.visible = true;

          // Camera nhẹ nhàng thu về vị trí mặc định (0, 0, 6.2)
          if (fgCamera) {
            fgCamera.position.z = THREE.MathUtils.lerp(fgCamera.position.z, 6.2, 0.12);
            fgCamera.position.y = THREE.MathUtils.lerp(fgCamera.position.y, 0, 0.12);
            fgCamera.lookAt(0, 0, 0);
          }

          const landCushion = Math.sin(pDescend * Math.PI) * 0.12;
          scY = MASCOT_SCALE * (1.0 - landCushion);
          scX = MASCOT_SCALE * (1.0 + landCushion);
          scZ = MASCOT_SCALE * (1.0 + landCushion);
          if (pDescend > 0.85 && !sonicRingTriggered) {
            sonicRingTriggered = true;
            spawnFgSonicRing(fgSlime.mesh.position, 0xffd700);
          }
        } else {
          // Giai đoạn 4: Cúi chào trang nghiêm
          const pEnd = (progress - 0.88) / 0.12;
          posX = 0;
          posY = -0.65;
          posZ = 1.35;
          rotX = Math.min(0.38, pEnd * 0.8);
          if (fgActiveLionMane) fgActiveLionMane.visible = true;
          const shrink = Math.max(0.01, 1.0 - pEnd * 1.15);
          scX = MASCOT_SCALE * shrink;
          scY = MASCOT_SCALE * shrink;
          scZ = MASCOT_SCALE * shrink;
        }
      }

      // ====================================================
      // ULTRA 6: NGỰA THẦN PEGASUS (34,000🪙) - Thân celestial, đôi cánh thiên thần starlight vỗ cánh hộ tống bên cạnh Pegasus 2D
      // ====================================================
      else if (isPegasusUltra) {
        if (progress < 0.88) {
          // Hộ tống thiên giới, đôi cánh thiên thần starlight vỗ cánh nhịp nhàng
          const pFly = progress / 0.88;
          posX = -2.2 + pFly * 4.2; // -2.2 -> +2.0
          posY = 0.45 + Math.sin(elapsed * 4.5) * 0.18;
          posZ = 1.25;

          // Xoay barrel roll mừng rỡ ở giữa chuyến bay
          if (progress > 0.42 && progress < 0.58) {
            const pRoll = (progress - 0.42) / 0.16;
            rotZ = -pRoll * Math.PI * 2;
          } else {
            rotZ = Math.sin(elapsed * 3.0) * 0.12;
          }
          rotY = -0.25;
          rotX = Math.sin(elapsed * 4.5) * 0.08;

          scX = MASCOT_SCALE; scY = MASCOT_SCALE; scZ = MASCOT_SCALE;

          // Đôi cánh 3D vỗ cánh nhịp nhàng
          if (fgActiveWings) {
            const flap = Math.sin(elapsed * 12) * 0.45;
            if (fgActiveWings.wingL) fgActiveWings.wingL.rotation.y = 0.25 + flap;
            if (fgActiveWings.wingR) fgActiveWings.wingR.rotation.y = -0.25 - flap;
          }

          if (Math.random() < 0.75) {
            spawnFgStardust(fgSlime.mesh.position, 2, 0x00f2fe);
            spawnFgStardust(fgSlime.mesh.position, 1, 0xe0e7ff);
          }
          if (fgSlime.setExpression) fgSlime.setExpression('smile');
        } else {
          // Hạ cánh
          const pEnd = (progress - 0.88) / 0.12;
          posX = 2.0;
          posY = 0.45 - pEnd * 1.2;
          posZ = 1.25;
          const shrink = Math.max(0.01, 1.0 - pEnd * 1.15);
          scX = MASCOT_SCALE * shrink;
          scY = MASCOT_SCALE * shrink;
          scZ = MASCOT_SCALE * shrink;
        }
      }

      // ====================================================
      // ULTRA 7: VŨ TRỤ TIKTOK TỐI THƯỢNG (44,999🪙) - Phi hành gia nhào lộn không trọng lực 3 trục + Mochi lỏng 3D + 3 Mặt trăng quỹ đạo
      // ====================================================
      else if (isUniverseUltra) {
        if (progress < 0.88) {
          // Phi hành gia lơ lửng không trọng lực + Mochi biến dạng lỏng 3D + 3 Mặt trăng quỹ đạo
          posX = Math.sin(progress * Math.PI * 3.0) * 1.45;
          posY = Math.cos(progress * Math.PI * 2.0) * 0.70;
          posZ = 1.25 + Math.sin(progress * Math.PI * 4.0) * 0.25;

          // Nhào lộn không trọng lực 3 trục liên tục
          rotX = elapsed * 1.8;
          rotY = elapsed * 1.4;
          rotZ = elapsed * 1.0;

          // Biến dạng Mochi lỏng nhịp nhàng
          const blob1 = Math.sin(elapsed * 5.0) * 0.22;
          const blob2 = Math.cos(elapsed * 3.8) * 0.18;
          scX = MASCOT_SCALE * (1.0 + blob1);
          scY = MASCOT_SCALE * (1.0 - blob1 + blob2);
          scZ = MASCOT_SCALE * (1.0 - blob2);

          // Cập nhật 3 Mặt trăng mini xoay quanh Slime
          if (fgActiveMoons && fgActiveMoons.moons) {
            fgActiveMoons.moons.forEach(m => {
              const a = elapsed * m.spec.speed;
              const mx = Math.cos(a) * m.spec.dist;
              const mz = Math.sin(a) * m.spec.dist;
              const my = Math.sin(a) * Math.sin(m.spec.inc) * (m.spec.dist * 0.55);
              m.mesh.position.set(mx, my, mz);
            });
          }

          const cosmicCols = [0x00f2fe, 0xa855f7, 0xff007f, 0xffd700];
          spawnFgStardust(fgSlime.mesh.position, 2, cosmicCols[Math.floor(Math.random() * cosmicCols.length)]);
          if (fgSlime.setExpression) fgSlime.setExpression('smile');
        } else {
          // Thu về tâm
          const pEnd = (progress - 0.88) / 0.12;
          posX = THREE.MathUtils.lerp(posX, 0, pEnd);
          posY = THREE.MathUtils.lerp(posY, -0.65, pEnd);
          posZ = 1.25;
          const shrink = Math.max(0.01, 1.0 - pEnd * 1.15);
          scX = MASCOT_SCALE * shrink;
          scY = MASCOT_SCALE * shrink;
          scZ = MASCOT_SCALE * shrink;
        }
      }

      // ====================================================
      // CÁC MỐC CAO CẤP HIỆN CÓ (Money Gun, Swan, Galaxy, Whale, Jet, Diamond, Queen)
      // ====================================================
      else {
        // ----------------------------------------------------
        // PHA 1 (0.0 -> 0.20 duration | ~0.8s): Samba Entrance & Hip-Shake 3D (Nhịp điệu chậm rãi 5.5 rad/s)
        // ----------------------------------------------------
        if (progress < 0.20) {
          const hop = Math.abs(Math.sin(elapsed * 5.5)) * 0.12;
          posX = -1.65 + Math.sin(elapsed * 3.5) * 0.08;
          posY = -1.05 + hop;
          posZ = 0.1;

          rotZ = Math.sin(elapsed * 6.0) * 0.18;
          rotY = 0.35 + Math.cos(elapsed * 4.5) * 0.15;
          rotX = Math.sin(elapsed * 5.5) * 0.05;

          const sSquash = Math.sin(elapsed * 5.5) * 0.08;
          scX = MASCOT_SCALE * (1.0 + sSquash);
          scY = MASCOT_SCALE * (1.0 - sSquash);
          scZ = MASCOT_SCALE * (1.0 + sSquash);

          if (fgSlime.setExpression) fgSlime.setExpression('happy');

        // ----------------------------------------------------
        // PHA 2 (0.20 -> 0.70 duration | ~2.2s - 3.2s): Progressive Differentiated 3D Flight Choreography
        // ----------------------------------------------------
        } else if (progress < 0.70) {
          const p2 = (progress - 0.20) / 0.50; // Chuẩn hóa trong khoảng [0, 1]

          // 1. MỐC 500🪙 (Money Gun): Graceful Arc & Gold Catch
          if (isMoneyGun) {
            posX = -1.65 + p2 * 3.30;
            const arcY = -1.05 + Math.sin(p2 * Math.PI) * 2.45;
            const hHop = Math.abs(Math.sin(p2 * 2.0 * Math.PI)) * 0.22;
            posY = arcY + hHop;
            posZ = 0.15 + Math.sin(p2 * Math.PI) * 0.30;

            rotZ = Math.cos(p2 * Math.PI) * 0.25;
            rotY = 0.25;
            rotX = Math.sin(p2 * 2.0 * Math.PI) * 0.12;

            const factor = hHop / 0.22;
            scY = MASCOT_SCALE * (0.88 + factor * 0.26);
            scX = MASCOT_SCALE * (1.08 - factor * 0.20);
            scZ = MASCOT_SCALE * (1.08 - factor * 0.20);

            if (Math.random() < 0.65) {
              spawnFgStardust(fgSlime.mesh.position, 1, 0xffd700);
            }

          // 2. MỐC 699🪙 (Swan): Romantic Aerial Waltz (Lemniscate Bernoulli 3D / Hình số 8 vô cực)
          } else if (isSwan) {
            const t = p2 * Math.PI * 2 - Math.PI / 2;
            const denom = 1 + Math.sin(t) * Math.sin(t);
            posX = (1.95 * Math.cos(t)) / denom;
            posY = (1.45 * Math.sin(t) * Math.cos(t)) / denom;
            posZ = 0.45 * Math.sin(t);

            rotZ = Math.sin(t) * 0.35;
            rotY = Math.cos(t) * 0.30;
            rotX = Math.sin(t * 2) * 0.12;

            scY = MASCOT_SCALE * (0.95 + Math.sin(t * 2) * 0.12);
            scX = MASCOT_SCALE * (1.02 - Math.sin(t * 2) * 0.08);
            scZ = MASCOT_SCALE * (1.02 - Math.sin(t * 2) * 0.08);

            if (fgSlime.accessories?.wingsGroup) {
              fgSlime.accessories.wingsGroup.rotation.y = Math.sin(elapsed * 12) * 0.38;
            }

            if (Math.random() < 0.70) {
              spawnFgStardust(fgSlime.mesh.position, 2, 0xffb6c1); // Hồng pastel lông vũ
            }

          // 3. MỐC 1,000🪙 (Galaxy): Cosmic Spiral Vortex (Từ Z = -1.6m tiến sát camera Z = +0.8m)
          } else if (isGalaxy) {
            posZ = -1.55 + p2 * 2.30;
            const R = 0.85 + p2 * 1.05;
            const theta = Math.PI - p2 * (3.0 * Math.PI);
            const hHop = Math.abs(Math.sin(p2 * 3.0 * Math.PI)) * 0.18;

            posX = (R + hHop) * Math.cos(theta);
            posY = (R * 0.72 + hHop) * Math.sin(theta);

            rotZ = Math.cos(theta) * 0.30;
            rotY = -Math.sin(theta) * 0.40;
            rotX = Math.sin(p2 * 3.0 * Math.PI) * 0.14;

            const scaleDepth = MASCOT_SCALE * (0.80 + p2 * 0.32);
            scY = scaleDepth * (0.90 + hHop * 0.35);
            scX = scaleDepth * (1.05 - hHop * 0.25);
            scZ = scaleDepth * (1.05 - hHop * 0.25);

            if (Math.random() < 0.85) {
              const cosmicColors = [0x00f2fe, 0x9d4edd, 0xffd700];
              const c = cosmicColors[Math.floor(Math.random() * cosmicColors.length)];
              spawnFgStardust(fgSlime.mesh.position, 2, c);
            }

          // 4. MỐC 2,150🪙 (Whale Diving): Ocean Deep Breach & High Leap
          } else if (isWhale) {
            if (p2 < 0.32) {
              // Lặn sâu xuống đại dương
              const sub = p2 / 0.32;
              posX = -1.65 + sub * 1.0;
              posY = -1.05 - Math.sin(sub * Math.PI * 0.5) * 0.40;
              posZ = 0.1 - sub * 0.40;
              rotX = Math.sin(sub * Math.PI) * 0.45;
              scY = MASCOT_SCALE * (1.0 + sub * 0.22);
              scX = MASCOT_SCALE * (1.0 - sub * 0.15);
              scZ = MASCOT_SCALE * (1.0 - sub * 0.15);
            } else if (p2 < 0.75) {
              // Phóng vút đại dương lên cao đỉnh Y = +1.85m
              const sub = (p2 - 0.32) / 0.43;
              posX = -0.65 + sub * 1.95;
              posY = -1.45 + Math.sin(sub * Math.PI) * 3.30;
              posZ = -0.30 + Math.sin(sub * Math.PI) * 0.50;
              rotX = -0.45 + sub * 0.90;
              rotZ = Math.cos(sub * Math.PI) * 0.25;
              scY = MASCOT_SCALE * (1.20 - Math.sin(sub * Math.PI) * 0.15);
              scX = MASCOT_SCALE * (0.90 + Math.sin(sub * Math.PI) * 0.15);
              scZ = MASCOT_SCALE * (0.90 + Math.sin(sub * Math.PI) * 0.15);
            } else {
              // Lộn đôi tiếp đất
              const sub = (p2 - 0.75) / 0.25;
              posX = 1.30 + sub * 0.35;
              posY = THREE.MathUtils.lerp(1.85, -0.95, sub);
              posZ = 0.2 - sub * 0.1;
              rotX = -sub * Math.PI * 4;
              rotZ = 0;
              scY = MASCOT_SCALE;
              scX = MASCOT_SCALE;
              scZ = MASCOT_SCALE;
            }

            if (Math.random() < 0.80) {
              spawnFgStardust(fgSlime.mesh.position, 2, 0x00f2fe); // Bọt nước cyan neon
            }

          // 5. MỐC 4,888🪙 (Private Jet): Supersonic Barrel Roll & Sonic Rings
          } else if (isJet) {
            const theta = Math.PI - p2 * (2.5 * Math.PI);
            posX = 1.95 * Math.cos(theta);
            posY = 1.35 * Math.sin(theta);
            posZ = 0.45 * Math.sin(p2 * Math.PI * 2);

            rotZ = Math.cos(theta) * 0.60; // Banking angle 45 độ
            rotY = -p2 * Math.PI * 4;      // Barrel Roll 360 độ quanh trục bay
            rotX = 0;

            scY = MASCOT_SCALE * 0.90;
            scX = MASCOT_SCALE * 1.05;
            scZ = MASCOT_SCALE * 1.05;

            // Vòng sóng xung kích siêu thanh
            if (p2 > 0.35 && !sonicRingTriggered) {
              sonicRingTriggered = true;
              spawnFgSonicRing(fgSlime.mesh.position, 0xffd700);
            }

            if (Math.random() < 0.75) {
              spawnFgStardust(fgSlime.mesh.position, 2, 0xffea00);
            }

          // 6. MỐC 5,000🪙 (Diamond Gun): Prismatic Polyhedral Orbit
          } else if (isDiamond) {
            const pts = [
              [-1.75, -0.4, 0.3],
              [-1.15, 1.35, -0.2],
              [0, 1.60, 0.35],
              [1.15, 1.35, -0.2],
              [1.75, -0.4, 0.3],
              [0, -1.35, -0.2]
            ];
            const idx = p2 * 5.0;
            const i0 = Math.min(4, Math.floor(idx));
            const i1 = i0 + 1;
            const f = idx - i0;
            const fSmooth = f * f * (3 - 2 * f);

            posX = THREE.MathUtils.lerp(pts[i0][0], pts[i1][0], fSmooth);
            posY = THREE.MathUtils.lerp(pts[i0][1], pts[i1][1], fSmooth);
            posZ = THREE.MathUtils.lerp(pts[i0][2], pts[i1][2], fSmooth);

            rotX = Math.sin(p2 * Math.PI * 6) * 0.6;
            rotY = p2 * Math.PI * 4;
            rotZ = Math.cos(p2 * Math.PI * 6) * 0.4;

            scY = MASCOT_SCALE * (0.95 + Math.sin(p2 * Math.PI * 6) * 0.12);
            scX = MASCOT_SCALE * (1.02 - Math.sin(p2 * Math.PI * 6) * 0.08);
            scZ = MASCOT_SCALE * (1.02 - Math.sin(p2 * Math.PI * 6) * 0.08);

            if (Math.random() < 0.85) {
              const prismColors = [0xffffff, 0xff007f, 0x00f2fe, 0xffd700];
              const c = prismColors[Math.floor(Math.random() * prismColors.length)];
              spawnFgStardust(fgSlime.mesh.position, 2, c);
            }

          // 7. MỐC 5,000🪙 (Drama Queen): Grand Royal Coronation Flight
          } else {
            const theta = Math.PI - p2 * (3.0 * Math.PI);
            const hHop = Math.abs(Math.sin(p2 * 4.0 * Math.PI)) * 0.24;

            posX = (1.90 + hHop) * Math.cos(theta);
            posY = (1.40 + hHop) * Math.sin(theta) + Math.sin(p2 * Math.PI) * 0.35;
            posZ = -0.40 + p2 * 1.0;

            rotZ = Math.cos(theta) * 0.32;
            rotY = -Math.sin(theta) * 0.42;
            rotX = Math.sin(p2 * 4.0 * Math.PI) * 0.16;

            const factor = hHop / 0.24;
            scY = MASCOT_SCALE * (0.85 + factor * 0.35);
            scX = MASCOT_SCALE * (1.12 - factor * 0.25);
            scZ = MASCOT_SCALE * (1.12 - factor * 0.25);

            if (fgSlime.accessories?.wingsGroup) {
              fgSlime.accessories.wingsGroup.rotation.y = Math.sin(elapsed * 18) * 0.45;
            }

            // Mưa bụi vàng 24K dày đặc
            spawnFgStardust(fgSlime.mesh.position, 3, 0xffd700);
          }

          if (fgSlime.setExpression) fgSlime.setExpression('smile');

        // ----------------------------------------------------
        // PHA 3 (0.70 -> 0.88 duration | ~0.8s - 1.2s): Differentiated Acrobatic Stunt Finale
        // ----------------------------------------------------
        } else if (progress < 0.88) {
          const p3 = (progress - 0.70) / 0.18;
          posX = 1.65;
          posZ = 0.1;

          if (isMoneyGun) {
            // Nhảy 2 nhịp nhỏ ăn mừng
            const bHop = Math.abs(Math.sin(p3 * Math.PI * 2)) * 0.42;
            posY = -0.95 + bHop;
            rotZ = Math.sin(p3 * Math.PI * 4) * 0.15;
            rotY = -0.25;
            rotX = 0;
            scY = MASCOT_SCALE * (1.0 + Math.sin(p3 * Math.PI * 2) * 0.15);
            scX = MASCOT_SCALE * (1.0 - Math.sin(p3 * Math.PI * 2) * 0.10);
            scZ = MASCOT_SCALE * (1.0 - Math.sin(p3 * Math.PI * 2) * 0.10);

          } else if (isSwan) {
            // Xoay Ballet Pirouette Spin 720 độ quanh trục Y
            posY = -0.95 + Math.sin(p3 * Math.PI) * 0.45;
            rotY = -0.25 + p3 * Math.PI * 4;
            rotX = 0;
            rotZ = 0;
            scY = MASCOT_SCALE * (1.05 - Math.sin(p3 * Math.PI) * 0.10);
            scX = MASCOT_SCALE * (0.95 + Math.sin(p3 * Math.PI) * 0.10);
            scZ = MASCOT_SCALE * (0.95 + Math.sin(p3 * Math.PI) * 0.10);

            if (p3 > 0.45 && !burstDone) {
              burstDone = true;
              spawnFgStardust(fgSlime.mesh.position, 16, 0xffb6c1, 1.3);
            }

          } else if (isQueen) {
            // Triple Backflip 1080 độ Hoàng Gia
            const jumpArc = Math.sin(p3 * Math.PI) * 1.15;
            posY = -0.95 + jumpArc;
            rotX = -p3 * Math.PI * 6; // 3 vòng nhào lộn!
            rotY = -0.25;
            rotZ = 0;

            if (p3 > 0.45 && !burstDone) {
              burstDone = true;
              spawnFgStardust(fgSlime.mesh.position, 22, 0xffd700, 1.4);
            }

          } else {
            // Somersault Backflip 360 độ
            const jumpArc = Math.sin(p3 * Math.PI) * 0.95;
            posY = -0.95 + jumpArc;
            rotX = -p3 * Math.PI * 2;
            rotY = -0.25;
            rotZ = 0;

            if (p3 > 0.45 && !burstDone) {
              burstDone = true;
              const burstColor = isWhale ? 0x00f2fe : (isDiamond ? 0xffffff : 0xffd700);
              spawnFgStardust(fgSlime.mesh.position, 14, burstColor, 1.2);
            }
          }

          if (fgSlime.setExpression) fgSlime.setExpression('proud');

        // ----------------------------------------------------
        // PHA 4 (0.88 -> 1.0 duration | ~0.6s): Gentleman Bow & Regal Collapse lặn về sàn
        // ----------------------------------------------------
        } else {
          const p4 = (progress - 0.88) / 0.12;
          posX = 1.65 - p4 * 0.15;
          posY = -0.95 - p4 * 0.20;
          posZ = 0.1;

          // Cúi chào quý tộc 25 độ
          rotX = Math.min(0.44, p4 * 0.8);
          rotY = -0.2;
          rotZ = 0;

          // Thu nhỏ dần lặn vào sàn 3D
          const shrink = Math.max(0.01, 1.0 - p4 * 1.15);
          scX = MASCOT_SCALE * shrink;
          scY = MASCOT_SCALE * shrink;
          scZ = MASCOT_SCALE * shrink;

          if (fgSlime.setExpression) fgSlime.setExpression('smile');
        }
      }

      fgSlime.mesh.position.set(posX, posY, posZ);
      fgSlime.mesh.rotation.set(rotX, rotY, rotZ);
      fgSlime.mesh.scale.set(scX, scY, scZ);
    }

    if (fgRenderer && fgScene && fgCamera) {
      fgRenderer.render(fgScene, fgCamera);
    }

    fgAnimId = requestAnimationFrame(renderFg);
  }

  if (fgAnimId) cancelAnimationFrame(fgAnimId);
  fgAnimId = requestAnimationFrame(renderFg);
}

export function stopForegroundSlime() {
  if (fgAnimId) {
    cancelAnimationFrame(fgAnimId);
    fgAnimId = null;
  }

  // Khôi phục vị trí góc nhìn Camera fgCamera về mặc định
  if (fgCamera) {
    fgCamera.position.set(0, 0, 6.2);
    fgCamera.lookAt(0, 0, 0);
  }

  if (fgStardustGroup) {
    while (fgStardustGroup.children.length > 0) {
      const child = fgStardustGroup.children[0];
      fgStardustGroup.remove(child);
      if (child.material) child.material.dispose();
    }
  }
  fgStardustParticles = [];

  if (fgActiveJetPlane && fgScene) {
    fgScene.remove(fgActiveJetPlane);
    fgActiveJetPlane = null;
  }
  fgActiveParachute = null;
  fgActiveWings = null;
  fgActiveMoons = null;
  fgActivePantherFeatures = null;
  fgActiveTigerFeatures = null;
  fgActiveLionMane = null;
  fgActivePegasusFeatures = null;

  if (fgSlime) {
    // Khôi phục góc xoay mắt nếu bị nghiêng (Báo Đêm)
    if (fgSlime.userData?._origEyeRotZ && fgSlime.userData.eyeL && fgSlime.userData.eyeR) {
      fgSlime.userData.eyeL.rotation.z = fgSlime.userData._origEyeRotZ.l;
      fgSlime.userData.eyeR.rotation.z = fgSlime.userData._origEyeRotZ.r;
    }
    if (fgScene && fgSlime.mesh) {
      fgScene.remove(fgSlime.mesh);
    }
    fgSlime = null;
  }

  if (fgRenderer) {
    fgRenderer.clear();
  }
}

