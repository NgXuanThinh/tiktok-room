// src/minigame-fx.js - 3D Visual Effects: Laser Strikes, Synchronized Room Neon, and Ghost Shader
import * as THREE from 'three';
import { GHOST_MATERIAL_CONFIG, LASER_CONFIG } from './minigame-constants.js';

/**
 * Synchronizes room neon lights, moving heads, and laser beams to the Death Color.
 * Moving heads continue sweeping along their dynamic floor orbits in the Death Color.
 * @param {object} clubEnvironment
 * @param {number} colorHex
 * @param {number} [durationSec=3.5]
 */
export function syncRoomNeonDeathColor(clubEnvironment, colorHex, durationSec = 3.5) {
  if (!clubEnvironment) return;

  // 1. Wall Neon Bar on back wall
  if (clubEnvironment.neonBar?.material) {
    if (clubEnvironment._origNeonBarColor === undefined) {
      clubEnvironment._origNeonBarColor = clubEnvironment.neonBar.material.color.getHex();
      clubEnvironment._origNeonBarEmissive = clubEnvironment.neonBar.material.emissive.getHex();
    }
    clubEnvironment.neonBar.material.color.setHex(colorHex);
    clubEnvironment.neonBar.material.emissive.setHex(colorHex);
    clubEnvironment.neonBar.material.emissiveIntensity = 4.0;
  }

  // 2. 8 Moving Head Spotlights: Sweep along normal club orbits, in Death Color
  if (Array.isArray(clubEnvironment.movingHeads)) {
    for (const mh of clubEnvironment.movingHeads) {
      // Do NOT freeze focus: keep mh.isFocused = false so sweeping trajectory updates naturally!
      mh.isFocused = false;

      // Save original baseCol if not saved
      if (!mh._origBaseCol && mh.baseCol) {
        mh._origBaseCol = typeof mh.baseCol.clone === 'function' ? mh.baseCol.clone() : new THREE.Color(mh.baseCol);
      }

      if (mh.baseCol?.setHex) {
        mh.baseCol.setHex(colorHex);
      }

      if (mh.spot && mh.spot.color?.setHex) {
        mh.spot.color.setHex(colorHex);
        mh.spot.intensity = 8.0;
      }

      if (mh.cone?.material) {
        if (!mh._origConeColor) mh._origConeColor = mh.cone.material.color.getHex();
        mh.cone.material.color.setHex(colorHex);
        mh.cone.material.opacity = 0.52;
      }
    }
  }

  // 3. 6 Overhead Scanning Lasers
  if (Array.isArray(clubEnvironment.laserBeams)) {
    for (const item of clubEnvironment.laserBeams) {
      if (item.mesh?.material) {
        if (!item._origLaserColor) item._origLaserColor = item.mesh.material.color.getHex();
        item.mesh.material.color.setHex(colorHex);
        item.mesh.material.opacity = 0.9;
      }
    }
  }
}

/**
 * Restores room neon lights, spotlights, and lasers to normal club colors.
 * @param {object} clubEnvironment
 */
export function restoreRoomLighting(clubEnvironment) {
  if (!clubEnvironment) return;

  // 1. Restore Neon Bar
  if (clubEnvironment.neonBar?.material && clubEnvironment._origNeonBarColor !== undefined) {
    clubEnvironment.neonBar.material.color.setHex(clubEnvironment._origNeonBarColor);
    clubEnvironment.neonBar.material.emissive.setHex(clubEnvironment._origNeonBarEmissive);
    clubEnvironment.neonBar.material.emissiveIntensity = 2.8;
  }

  // 2. Restore 8 Moving Heads
  if (Array.isArray(clubEnvironment.movingHeads)) {
    for (const mh of clubEnvironment.movingHeads) {
      mh.isFocused = false;
      mh.focusTimer = 0;

      if (mh._origBaseCol && mh.baseCol?.copy) {
        mh.baseCol.copy(mh._origBaseCol);
      }

      if (mh.spot && mh.baseCol) {
        if (typeof mh.spot.color?.copy === 'function') {
          mh.spot.color.copy(mh.baseCol);
        } else if (typeof mh.spot.color?.setHex === 'function') {
          mh.spot.color.setHex(typeof mh.baseCol === 'number' ? mh.baseCol : (mh.baseCol.getHex ? mh.baseCol.getHex() : 0));
        }
        mh.spot.intensity = 5.0;
      }

      if (mh.cone?.material && mh.baseCol) {
        if (typeof mh.cone.material.color?.copy === 'function') {
          mh.cone.material.color.copy(mh.baseCol);
        } else if (typeof mh.cone.material.color?.setHex === 'function') {
          mh.cone.material.color.setHex(typeof mh.baseCol === 'number' ? mh.baseCol : (mh.baseCol.getHex ? mh.baseCol.getHex() : 0));
        }
        mh.cone.material.opacity = 0.28;
      }
    }
  }

  // 3. Restore Scanning Lasers
  if (Array.isArray(clubEnvironment.laserBeams)) {
    for (const item of clubEnvironment.laserBeams) {
      if (item.mesh?.material) {
        item.mesh.material.color.setHex(item._origLaserColor !== undefined ? item._origLaserColor : 0x00f2fe);
        item.mesh.material.opacity = 0.6;
      }
    }
  }
}

/**
 * Fires intense vertical laser beams from ceiling onto target eliminated slimes, with camera shake.
 * @param {THREE.Scene} scene
 * @param {Array<THREE.Object3D>} targetMeshes
 * @param {number} colorHex
 * @param {number} [durationMs=2800]
 * @param {object} [sceneManager=null]
 * @returns {Promise<void>}
 */
export function triggerLaserStrikes(scene, targetMeshes, colorHex, durationMs = 2800, sceneManager = null) {
  if (!scene || !targetMeshes || targetMeshes.length === 0) {
    return Promise.resolve();
  }

  const lasers = [];
  const topY = LASER_CONFIG.ceilingY || 12;

  for (const mesh of targetMeshes) {
    if (!mesh || !mesh.position) continue;
    const targetX = mesh.position.x;
    const targetZ = mesh.position.z;
    const groundY = mesh.position.y || 0;
    const height = Math.max(1, topY - groundY);
    const centerY = groundY + height / 2;

    const geom = new THREE.CylinderGeometry(
      LASER_CONFIG.topRadius,
      LASER_CONFIG.bottomRadius,
      height,
      LASER_CONFIG.radialSegments,
      1,
      true
    );

    const mat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const laserMesh = new THREE.Mesh(geom, mat);
    laserMesh.position.set(targetX, centerY, targetZ);
    scene.add(laserMesh);
    lasers.push({ mesh: laserMesh, geom, mat });
  }

  if (sceneManager?.triggerCameraShake) {
    sceneManager.triggerCameraShake(LASER_CONFIG.cameraShakeIntensity, LASER_CONFIG.cameraShakeDuration);
  }

  return new Promise((resolve) => {
    const startTime = performance.now();
    const anim = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(1, elapsed / durationMs);

      // Keep solid for first 65%, then fade out
      let opacity = 0.95;
      if (progress > 0.65) {
        const fadeProgress = (progress - 0.65) / 0.35;
        opacity = Math.max(0, 0.95 * (1 - fadeProgress));
      }

      for (const item of lasers) {
        item.mat.opacity = opacity;
      }

      if (progress < 1) {
        requestAnimationFrame(anim);
      } else {
        // Clean up 3D laser meshes
        for (const item of lasers) {
          if (item.mesh.parent) item.mesh.parent.remove(item.mesh);
          item.geom.dispose();
          item.mat.dispose();
        }
        resolve();
      }
    };
    requestAnimationFrame(anim);
  });
}

/**
 * Transforms a slime into a translucent white glowing ghost.
 * @param {THREE.Object3D} mesh
 */
export function applyGhostState(mesh) {
  if (!mesh || mesh.userData?.isGhost) return;
  mesh.userData.isGhost = true;

  let bodyMesh = null;
  mesh.traverse((child) => {
    if (child.isMesh && (child.name === 'slime_body' || child.material === mesh.userData.slimeMat)) {
      bodyMesh = child;
    }
  });

  if (bodyMesh) {
    if (!mesh.userData._origSlimeMat) {
      mesh.userData._origSlimeMat = bodyMesh.material;
    }
    const ghostMat = new THREE.MeshStandardMaterial({
      color: GHOST_MATERIAL_CONFIG.color,
      emissive: GHOST_MATERIAL_CONFIG.emissive,
      emissiveIntensity: GHOST_MATERIAL_CONFIG.emissiveIntensity,
      transparent: GHOST_MATERIAL_CONFIG.transparent,
      opacity: GHOST_MATERIAL_CONFIG.opacity,
      roughness: GHOST_MATERIAL_CONFIG.roughness,
      metalness: GHOST_MATERIAL_CONFIG.metalness
    });
    bodyMesh.material = ghostMat;
    mesh.userData._ghostMat = ghostMat;
  }

  // Dim billboard overhead
  mesh.traverse((child) => {
    if (child.isSprite && child.material) {
      if (child.userData._origOpacity === undefined) {
        child.userData._origOpacity = child.material.opacity !== undefined ? child.material.opacity : 1.0;
      }
      child.material.opacity = GHOST_MATERIAL_CONFIG.billboardOpacity;
    }
  });
}

/**
 * Restores a ghost slime back to its original live material and color.
 * @param {THREE.Object3D} mesh
 */
export function revertGhostState(mesh) {
  if (!mesh || !mesh.userData?.isGhost) return;
  mesh.userData.isGhost = false;

  let bodyMesh = null;
  mesh.traverse((child) => {
    if (child.isMesh && (child.name === 'slime_body' || child.material === mesh.userData._ghostMat)) {
      bodyMesh = child;
    }
  });

  if (bodyMesh && mesh.userData._origSlimeMat) {
    if (mesh.userData._ghostMat?.dispose) {
      mesh.userData._ghostMat.dispose();
      mesh.userData._ghostMat = null;
    }
    bodyMesh.material = mesh.userData._origSlimeMat;
  }

  // Restore billboard overhead
  mesh.traverse((child) => {
    if (child.isSprite && child.material && child.userData._origOpacity !== undefined) {
      child.material.opacity = child.userData._origOpacity;
    }
  });
}
