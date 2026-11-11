// preview/slime-aura.js - Multi-style rotating aura (Purple, Orange, Vivid Gold) with rising mini bubbles
import * as THREE from 'three';
import {
  SLIME_ACCESSORY_DIMENSIONS,
  AURA_TYPES,
  AURA_BUBBLES_CONFIG
} from './slime-constants.js';

function createBubbleSpriteTexture() {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(32, 32, 4, 32, 32, 28);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.95)');
  grad.addColorStop(0.9, 'rgba(255, 255, 255, 0.6)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(32, 32, 30, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

let sharedBubbleTexture = null;

export function createSlimeAura() {
  const dims = SLIME_ACCESSORY_DIMENSIONS.bodyAura;
  const auraGroup = new THREE.Group();
  auraGroup.name = 'SlimeAuraGroup';
  auraGroup.visible = false;

  // 1. Truncated Inverted Cone Mesh
  const coneGeom = new THREE.CylinderGeometry(
    dims.radiusTop,
    dims.radiusBottom,
    dims.height,
    32,
    1,
    true
  );

  const coneMat = new THREE.MeshBasicMaterial({
    color: AURA_TYPES.gold.color,
    transparent: true,
    opacity: AURA_TYPES.gold.opacity,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const coneMesh = new THREE.Mesh(coneGeom, coneMat);
  coneMesh.name = 'AuraConeMesh';
  coneMesh.position.y = dims.yOffset;
  auraGroup.add(coneMesh);

  // 2. Rising Mini Bubbles Particle System (Exclusively for Gold Aura)
  const bubbleCount = AURA_BUBBLES_CONFIG.count;
  const bubblePositions = new Float32Array(bubbleCount * 3);
  const bubbleSpeeds = new Float32Array(bubbleCount);
  const bubbleWobbleFreq = new Float32Array(bubbleCount);
  const bubbleRadii = new Float32Array(bubbleCount);
  const bubbleAngles = new Float32Array(bubbleCount);

  const yMin = 0.03;
  const yMax = dims.yOffset + dims.height / 2 + (AURA_BUBBLES_CONFIG.deltaHeight || 0.65);

  for (let i = 0; i < bubbleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = THREE.MathUtils.lerp(
      AURA_BUBBLES_CONFIG.minRadius,
      AURA_BUBBLES_CONFIG.maxRadius,
      Math.random()
    );
    const y = THREE.MathUtils.lerp(yMin, yMax, Math.random());

    bubblePositions[i * 3] = Math.cos(angle) * radius;
    bubblePositions[i * 3 + 1] = y;
    bubblePositions[i * 3 + 2] = Math.sin(angle) * radius;

    bubbleSpeeds[i] = THREE.MathUtils.lerp(
      AURA_BUBBLES_CONFIG.minSpeed,
      AURA_BUBBLES_CONFIG.maxSpeed,
      Math.random()
    );
    bubbleWobbleFreq[i] = 2.0 + Math.random() * 3.5;
    bubbleRadii[i] = radius;
    bubbleAngles[i] = angle;
  }

  const bubbleGeom = new THREE.BufferGeometry();
  bubbleGeom.setAttribute('position', new THREE.BufferAttribute(bubblePositions, 3));

  if (!sharedBubbleTexture && typeof document !== 'undefined') {
    sharedBubbleTexture = createBubbleSpriteTexture();
  }

  const bubbleMat = new THREE.PointsMaterial({
    color: AURA_BUBBLES_CONFIG.color,
    size: AURA_BUBBLES_CONFIG.bubbleSize,
    map: sharedBubbleTexture || null,
    transparent: true,
    opacity: AURA_BUBBLES_CONFIG.bubbleOpacity !== undefined ? AURA_BUBBLES_CONFIG.bubbleOpacity : 0.95,
    depthWrite: false,
    blending: THREE.NormalBlending
  });

  const bubblesPoints = new THREE.Points(bubbleGeom, bubbleMat);
  bubblesPoints.name = 'AuraMiniBubbles';
  bubblesPoints.visible = false;
  auraGroup.add(bubblesPoints);

  let currentType = null;
  let bubbleTimer = 0;

  function setAura(type) {
    if (!type) {
      currentType = null;
      auraGroup.visible = false;
      bubblesPoints.visible = false;
      return;
    }

    const key = (typeof type === 'string') ? type.toLowerCase() : 'gold';
    const spec = AURA_TYPES[key] || AURA_TYPES.gold;
    currentType = spec.key;

    auraGroup.visible = true;
    coneMat.color.setHex(spec.color);
    coneMat.opacity = spec.opacity;
    bubblesPoints.visible = Boolean(spec.hasBubbles);
  }

  function update(deltaTime) {
    if (!auraGroup.visible) return;

    coneMesh.rotation.y += dims.rotationSpeed * deltaTime;

    if (bubblesPoints.visible) {
      bubbleTimer += deltaTime;
      const posAttr = bubbleGeom.attributes.position;
      const arr = posAttr.array;

      for (let i = 0; i < bubbleCount; i++) {
        let y = arr[i * 3 + 1] + bubbleSpeeds[i] * deltaTime;
        if (y > yMax) {
          y = yMin + Math.random() * 0.05;
          bubbleAngles[i] = Math.random() * Math.PI * 2;
        }

        const wobble = Math.sin(bubbleTimer * bubbleWobbleFreq[i] + i) * 0.025;
        const currentR = bubbleRadii[i] + wobble;
        const ang = bubbleAngles[i];

        arr[i * 3] = Math.cos(ang) * currentR;
        arr[i * 3 + 1] = y;
        arr[i * 3 + 2] = Math.sin(ang) * currentR;
      }
      posAttr.needsUpdate = true;
    }
  }

  return {
    group: auraGroup,
    coneMesh,
    bubblesPoints,
    setAura,
    update,
    get currentType() { return currentType; },
    get isVisible() { return auraGroup.visible; }
  };
}
