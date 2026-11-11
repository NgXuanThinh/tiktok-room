// src/slime-constants.js - Central dimensional constants for Slime geometry, foot rings & auras

/**
 * Standard Cyber Slime color palettes.
 */
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

/**
 * Premium VIP / Ultra luxury Slime palettes.
 */
export const ULTRA_PALETTES = {
  purple: {
    name: 'Obsidian Panther',
    shellColor: 0x1f0638,
    coreEmissive: 0x9333ea,
    eyeGlow: 0xfacc15,
    corneaColor: 0xfacc15,
    blushColor: 0xa855f7,
    visorColor: 0xfacc15,
    auraColor: 0xc084fc
  },
  orange: {
    name: 'Molten Fire Tiger',
    shellColor: 0xff4500,
    coreEmissive: 0xd97706,
    eyeGlow: 0xffea00,
    corneaColor: 0xffea00,
    blushColor: 0xff7700,
    visorColor: 0xffea00,
    auraColor: 0xff3d00
  },
  gold: {
    name: 'Royal 24K Lion',
    shellColor: 0xffd700,
    coreEmissive: 0xb45309,
    eyeGlow: 0xffea00,
    corneaColor: 0xffea00,
    blushColor: 0xf59e0b,
    visorColor: 0xffffff,
    auraColor: 0xffd700
  },
  celestial: {
    name: 'Celestial Pegasus',
    shellColor: 0xe0e7ff,
    coreEmissive: 0x38bdf8,
    eyeGlow: 0x00f2fe,
    corneaColor: 0x00f2fe,
    blushColor: 0xc084fc,
    visorColor: 0x38bdf8,
    auraColor: 0x38bdf8
  },
  cosmic: {
    name: 'TikTok Universe',
    shellColor: 0x0f172a,
    coreEmissive: 0x00f2fe,
    eyeGlow: 0x00f2fe,
    corneaColor: 0x00f2fe,
    blushColor: 0xff007f,
    visorColor: 0x00f2fe,
    auraColor: 0xff007f
  }
};

/**
 * 3D Chibi Eye dimensions, specular highlights, and positioning.
 */
export const SLIME_EYE_CONFIG = {
  corneaRadius: 0.065,
  pupilRadius: 0.038,
  specularRadiusLarge: 0.018,
  specularRadiusSmall: 0.012,
  corneaColor: 0x111118,
  specularColor: 0xffffff,
  offsetX: 0.28,
  offsetY: 0.52,
  offsetZ: 0.68,
  blinkIntervalSeconds: 3.5,
  blinkDurationSeconds: 0.15
};

/**
 * 2D Canvas Billboard Hologram badge layout and font styling.
 */
export const SLIME_BILLBOARD_CONFIG = {
  canvasWidth: 256,
  canvasHeight: 256,
  avatarRadius: 42,
  avatarCenterX: 128,
  avatarCenterY: 62,
  avatarBorderWidth: 4.0,
  avatarBorderColor: 'rgba(0, 242, 254, 0.90)',
  nameY: 128,
  nameFontSize: 18,
  pillY: 154,
  pillHeight: 22,
  pillGap: 8,
  rankThemes: {
    top1: { bg: 'rgba(32, 24, 6, 0.95)', border: '#ffd700', text: '#ffffff', label: '👑 TOP 1' },
    top2: { bg: 'rgba(25, 25, 32, 0.95)', border: '#e0e0e8', text: '#ffffff', label: '🥈 TOP 2' },
    top3: { bg: 'rgba(35, 20, 10, 0.95)', border: '#cd7f32', text: '#ffffff', label: '🥉 TOP 3' },
    vip: { bg: 'rgba(30, 15, 45, 0.95)', border: '#c77dff', text: '#ffffff', label: '💎 VIP' },
    default: { bg: 'rgba(10, 25, 35, 0.95)', border: '#00f2fe', text: '#ffffff' }
  }
};

/**
 * Procedural animation timings and flourish move parameters.
 */
export const SLIME_ANIMATION_CONFIG = {
  spinDurationSeconds: 0.8,
  flipDurationSeconds: 1.1,
  jumpDurationSeconds: 1.0,
  breatheSpeed: 2.4,
  breatheScaleY: 0.06,
  superBounceMultiplier: 1.6
};

/**
 * Base spherical radius of the Cyber Slime geometry in 3D unit space (meters).
 * Single source of truth for all geometries and accessories.
 */
export const SLIME_BASE_RADIUS = 0.85;

/**
 * Base height of the Slime (~ 1.0 * SLIME_BASE_RADIUS).
 */
export const SLIME_BASE_HEIGHT = 0.85;

/**
 * Maximum belly expansion factor for Chubby Mochi geometry (Tier 2+).
 * 0.85m * 1.32 = ~1.12m maximum belly radius.
 */
export const SLIME_BELLY_BULGE_FACTOR = 1.32;

/**
 * Three distinct aura styles (Tím / Cam / Vàng).
 * Only the Gold Aura features rising mini bubbling bubbles.
 */
export const AURA_TYPES = {
  purple: {
    key: 'purple',
    name: 'Aura Tím (Epic)',
    color: 0xb026ff,
    emissive: 0x7c3aed,
    opacity: 0.5,
    hasBubbles: false
  },
  orange: {
    key: 'orange',
    name: 'Aura Cam (Legendary)',
    color: 0xff6600,
    emissive: 0xe65100,
    opacity: 0.5,
    hasBubbles: false
  },
  gold: {
    key: 'gold',
    name: 'Aura Vàng (Mythic)',
    color: 0xffea00,      // Màu vàng sáng rõ, rực rỡ và sắc nét
    emissive: 0xffc107,
    opacity: 0.5,
    hasBubbles: true      // Chỉ duy nhất Aura Vàng có mini bubble sủi lên
  }
};

/**
 * Mini bubbling bubbles particle specification for Gold Aura.
 */
export const AURA_BUBBLES_CONFIG = {
  count: 22,
  minRadius: SLIME_BASE_RADIUS * 1.22, // ~1.04m
  maxRadius: SLIME_BASE_RADIUS * 1.48, // ~1.26m
  minSpeed: 0.28,
  maxSpeed: 0.52,
  bubbleSize: 0.075,
  bubbleOpacity: 0.95,
  color: 0xffea00,
  // Extra elevation that bubbles continue rising above the aura cone top edge (meters)
  deltaHeight: SLIME_BASE_HEIGHT * 0.95
};

/**
 * Equipment & Accessory Dimensions calculated directly from SLIME_BASE_RADIUS and SLIME_BASE_HEIGHT.
 * Any adjustment to the base radius automatically propagates to all accessory geometries.
 */
export const SLIME_ACCESSORY_DIMENSIONS = {
  // Ground Foot Rings (Torus rings lying flat on the floor)
  footRings: {
    // Ring 1 (Trắng nhỏ): R ~ 1.15m (ôm sát bên ngoài bụng phình max 1.12m)
    ring1Radius: SLIME_BASE_RADIUS * 1.35,
    // Ring 2 (Vàng trung): R ~ 1.40m
    ring2Radius: SLIME_BASE_RADIUS * 1.65,
    // Ring 3 (Cam lớn): R ~ 1.65m
    ring3Radius: SLIME_BASE_RADIUS * 1.95,
    tubeRadius: 0.022,
    yOffset: 0.03
  },

  // Body Aura (Hình chóp cụt ngược / Inverted Truncated Cone)
  bodyAura: {
    // Chiều cao: đúng 1/2 chiều cao slime (~0.425m)
    height: SLIME_BASE_HEIGHT * 0.50,
    // Bán kính đáy: R ~ 1.15m (bao quanh hoàn toàn bên ngoài thân slime, không đâm xuyên thân)
    radiusBottom: SLIME_BASE_RADIUS * 1.35,
    // Bán kính đỉnh: R ~ 1.32m (loe nhẹ ra ngoài)
    radiusTop: SLIME_BASE_RADIUS * 1.55,
    // Vị trí tâm Y: bắt đầu từ mặt sàn y=0.02m lên y=0.445m
    yOffset: 0.02 + (SLIME_BASE_HEIGHT * 0.50) / 2,
    // Tốc độ xoay vòng tròn của aura quanh trục Y (rad/s)
    rotationSpeed: 0.85
  },

  // Headband (T3 Headphones)
  headband: {
    radius: SLIME_BASE_RADIUS,
    tube: 0.035
  }
};
