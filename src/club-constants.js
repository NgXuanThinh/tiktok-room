// src/club-constants.js - Central configuration constants for Club Environment, LED Floor, Lights & VFX
import * as THREE from 'three';

/**
 * General venue, sky, and boundary limits.
 */
export const CLUB_VENUE_CONFIG = {
  backgroundColor: 0x0c0b16,
  fogColor: 0x0c0b16,
  fogDensity: 0.035,
  starfieldCount: 3000,
  starfieldRadius: 75.0,
  starfieldMinY: 8.0,
  starfieldMaxY: 38.0,
  floorClamp: {
    minX: -8.8,
    maxX: 8.8,
    minZ: -10.5,
    maxZ: 8.8
  },
  backWallZ: -14.5
};

/**
 * LED Floor matrix parameters & emissive lighting.
 */
export const FLOOR_GRID_CONFIG = {
  rows: 12,
  cols: 12,
  tileSize: 1.5,
  tileSpacing: 1.6,
  centerZ: 0,
  get count() { return this.rows * this.cols; }
};

export const FLOOR_EMISSIVE_CONFIG = {
  baseEmissive: 0x3b0066,
  emissiveIntensity: 0.65,
  minPulseBrightness: 0.25
};

/**
 * VIP Podium Stage & Throne dimensions.
 */
export const VIP_PODIUM_STAGE_CONFIG = {
  podiumRadius: 2.4,
  podiumHeight: 0.55,
  goldRimColor: 0xffd700,
  goldRimMetalness: 0.9,
  goldRimRoughness: 0.2,
  glassEmissiveColor: 0x7c3aed,
  glassEmissiveIntensity: 0.6
};

/**
 * DJ Booth, Vinyl Record & Mascot dimensions.
 */
export const DJ_BOOTH_CONFIG = {
  tableWidth: 3.6,
  tableHeight: 1.05,
  tableDepth: 1.4,
  position: { x: 0, y: 0.52, z: -12.5 },
  vinylRpm: 33.3,
  vinylSpeedRadPerSec: 3.49,
  vinylRadius: 0.36,
  mascotBaseY: 1.45,         // Chiều cao vị trí đứng gốc của DJ Slime
  maxBounceHeight: 0.12,     // Chiều cao nhảy/nhấp nhô tối đa khi nhạc đập (mét)
  rhythmBounce: 0.05,        // Độ nảy cơ bản theo nhịp 128 BPM (mét)
  bassFluxScale: 0.07        // Độ nảy tăng thêm khi có tiếng Bass/Kick mạnh (mét)
};

/**
 * Moving head spotlights, spotlights palette & beam cones.
 */
export const MOVING_HEADS_CONFIG = {
  count: 4,
  height: 9.2,
  coneHeight: 14.0,
  coneRadius: 2.2,
  sweepSpeed: 0.75,
  positions: [
    { x: -7.5, y: 9.2, z: -9.0 },
    { x: 7.5, y: 9.2, z: -9.0 },
    { x: -7.5, y: 9.2, z: 7.0 },
    { x: 7.5, y: 9.2, z: 7.0 }
  ]
};

export const NEON_PALETTE = [
  new THREE.Color(0x00f2fe), // Cyan
  new THREE.Color(0xff007f), // Hot Pink
  new THREE.Color(0x7928ca), // Neon Purple
  new THREE.Color(0xffd700), // Gold
  new THREE.Color(0x00ff88), // Neon Green
  new THREE.Color(0xff6b00)  // Neon Orange
];

export const SPOTLIGHT_4_PALETTE = [
  new THREE.Color(0xffe600), // Yellow
  new THREE.Color(0x0088ff), // Blue
  new THREE.Color(0x00ff66), // Green
  new THREE.Color(0xff2244)  // Red
];

/**
 * High-Tier White & Ultra Luxury Golden light pillars.
 */
export const LIGHT_BEAMS_CONFIG = {
  whiteBeamDuration: 2.5,
  whiteBeamRadius: 1.2,
  whiteBeamHeight: 14.0,
  whiteBeamColor: 0xffffff,
  goldenBeamDuration: 7.6,
  goldenBeamRadius: 2.5,
  goldenBeamHeight: 16.0,
  goldenBeamColor: 0xffd700
};

/**
 * Ceiling Laser Beams rig.
 */
export const LASER_BEAMS_CONFIG = {
  count: 6,
  mountY: 8.5,
  mountZ: -9.8,
  spacingX: 1.4,
  startX: -3.5,
  beamLength: 15.0,
  beamRadius: 0.045,
  color: 0x00ffea
};

/**
 * Categorized Fireworks particle effects.
 */
export const FIREWORKS_VFX_CONFIG = {
  bufferCount: 6000,
  gravity: -9.8,
  tier1: { count: 80, minSpeed: 6.0, maxSpeed: 10.0, life: 1.8 },
  tier2: { count: 180, minSpeed: 8.0, maxSpeed: 13.0, life: 2.4 },
  ultra: { count: 500, minSpeed: 10.0, maxSpeed: 17.0, life: 3.2 }
};

export const BACK_WALL_CONFIG = {
  z: -14.5
};

export function clampSpotlightToFloor(target = { x: 0, y: 0, z: 0 }) {
  const { minX, maxX, minZ, maxZ } = CLUB_VENUE_CONFIG.floorClamp;
  return {
    x: Math.max(minX, Math.min(maxX, Number(target?.x || 0))),
    y: Math.max(0, Number(target?.y || 0)),
    z: Math.max(minZ, Math.min(maxZ, Number(target?.z || 0)))
  };
}
