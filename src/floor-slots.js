// src/floor-slots.js - Dance floor spatial slot generation and allocation
import * as THREE from 'three';
import { FLOOR_GRID_CONFIG } from './club-environment.js';

export const BASE_AVATAR_SCALE = 0.52;

/**
 * Dedicated VIP Lounge slots flanking the DJ booth:
 * - Left Platform (TOP 1 Imperial Gold Throne): y = 0.48m, z = -10.9m
 * - Right Platform (TOP 2 Platinum Cyan Lounge): y = 0.38m, z = -10.9m
 */
export const VIP_TOP1_SLOT = new THREE.Vector3(-5.4, 0.48, -10.9);
export const VIP_TOP2_SLOT = new THREE.Vector3(5.4, 0.38, -10.9);
export const VIP_STAGE_SLOTS = [
  VIP_TOP1_SLOT,
  VIP_TOP2_SLOT
];

/**
 * Generates spatial dance floor grid slots radially from center outwards.
 * Slots are organized in concentric rings and sorted by ring layer and polar angle.
 *
 * @param {object} config - Grid configuration options
 * @returns {THREE.Vector3[]} Array of 3D slot positions on the dance floor
 */
export function generateDanceFloorSlots(config = FLOOR_GRID_CONFIG) {
  const rawTiles = [];
  const cfg = config || { rows: 12, cols: 12, tileSpacing: 1.6 };
  const halfRows = (cfg.rows - 1) / 2;
  const halfCols = (cfg.cols - 1) / 2;
  const spacing = cfg.tileSpacing || 1.6;
  const centerZ = cfg.centerZ !== undefined ? cfg.centerZ : 0;

  for (let r = 0; r < cfg.rows; r++) {
    for (let c = 0; c < cfg.cols; c++) {
      const x = (c - halfCols) * spacing;
      const z = cfg.startZ !== undefined ? (cfg.startZ + r * spacing) : ((r - halfRows) * spacing + centerZ);
      const relZ = z - centerZ;

      // Ensure no slots collide with back wall or DJ booth area behind the dance floor
      if (z <= -9.5) continue;

      // Concentric ring layer from center outward (Ring 0 = 4 center tiles, Ring 1 = 12, Ring 2 = 20, ...)
      const maxCoord = Math.max(Math.abs(x), Math.abs(relZ));
      const ring = Math.max(0, Math.round((maxCoord - 0.8) / spacing));

      // Polar angle around the center of the dance floor [0, 2*PI)
      const angle = (Math.atan2(relZ, x) + 2 * Math.PI) % (2 * Math.PI);
      const distToCenter = Math.hypot(x, relZ);

      rawTiles.push({
        pos: new THREE.Vector3(x, 0, z),
        ring,
        angle,
        distToCenter
      });
    }
  }

  // Sort slots in concentric rings revolving 360° around the center:
  // Primary key: ring layer (Ring 0 -> Ring 1 -> Ring 2 ... expanding outward)
  // Secondary key: polar angle (clockwise circular sequence around center)
  rawTiles.sort((a, b) => {
    if (a.ring !== b.ring) return a.ring - b.ring;
    return a.angle - b.angle;
  });

  return rawTiles.map((t) => t.pos);
}

/**
 * Allocates a random unoccupied dance floor slot from the available pool.
 *
 * @param {THREE.Vector3[]} floorSlots - Available floor slots
 * @param {Map<string, THREE.Group>} avatarMeshes - Map of active avatar meshes
 * @returns {{ slot: THREE.Vector3, idx: number }} Selected slot position and index
 */
export function findRandomAvailableFloorSlot(floorSlots, avatarMeshes) {
  const occupiedIndices = new Set();
  avatarMeshes.forEach((m) => {
    if (m.userData.floorSlotIdx !== undefined && !m.userData.isVipLounge) {
      occupiedIndices.add(m.userData.floorSlotIdx);
    }
  });

  const availableIndices = [];
  for (let i = 0; i < floorSlots.length; i++) {
    if (!occupiedIndices.has(i)) {
      availableIndices.push(i);
    }
  }

  if (availableIndices.length > 0) {
    const randIdx = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    return { slot: floorSlots[randIdx], idx: randIdx };
  }

  const randIdx = Math.floor(Math.random() * floorSlots.length);
  return { slot: floorSlots[randIdx], idx: randIdx };
}
