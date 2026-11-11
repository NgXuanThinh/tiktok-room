// src/avatar-coordinator.js - Avatar lifecycle, kinematics, and synchronization
import * as THREE from 'three';
import { BASE_AVATAR_SCALE, VIP_TOP1_SLOT, VIP_TOP2_SLOT, findRandomAvailableFloorSlot } from './floor-slots.js';
import { createAvatarMesh, getSlimeKinematics, getDanceKinematics } from './avatar-manager.js';
import { updateLeapAnimation } from './vip-lounge-manager.js';
import { CINEMATIC_CONFIG } from './cinematic-config.js';
import { evaluateEquipment } from './equipment-config.js';

/**
 * Spawns or retrieves an existing 3D Avatar mesh.
 *
 * @param {object} userData - Profile information for the viewer
 * @param {number} [coins=0] - Coins donated in the triggering event
 * @param {object} context - Shared application context
 * @returns {THREE.Group} Instantiated or existing 3D avatar mesh
 */
export function getOrCreateAvatarMesh(userData, coins = 0, context) {
  const { avatarMeshes, occupancyManager, sceneManager, vipLoungeManager, floorSlots, syncActiveFloorAvatars } = context;
  const userId = String(userData.id || userData.userId || userData.uniqueId || userData.username);
  const isPinned = Number(coins || 0) >= 500 || Boolean(userData.isPinned);
  const trackedAvatar = occupancyManager.touch(userId, userData.username, coins, isPinned);

  let mesh = avatarMeshes.get(userId);
  if (!mesh) {
    mesh = createAvatarMesh({
      ...userData,
      level: userData.level || 'Lv.1',
      tier: userData.tier !== undefined ? Number(userData.tier) : 1,
      isPinned,
      totalCoins: trackedAvatar.totalCoins
    });

    const currentTop1 = vipLoungeManager.getCurrentTop1();
    const currentTop2 = vipLoungeManager.getCurrentTop2();

    if (currentTop1 === userId) {
      mesh.position.set(VIP_TOP1_SLOT.x, VIP_TOP1_SLOT.y, VIP_TOP1_SLOT.z);
      mesh.userData.assignedSlot = mesh.position.clone();
      mesh.userData.isVipLounge = true;
      mesh.userData.levitateY = VIP_TOP1_SLOT.y;
      mesh.rotation.y = 0;
    } else if (currentTop2 === userId) {
      mesh.position.set(VIP_TOP2_SLOT.x, VIP_TOP2_SLOT.y, VIP_TOP2_SLOT.z);
      mesh.userData.assignedSlot = mesh.position.clone();
      mesh.userData.isVipLounge = true;
      mesh.userData.levitateY = VIP_TOP2_SLOT.y;
      mesh.rotation.y = 0;
    } else {
      const { slot, idx } = findRandomAvailableFloorSlot(floorSlots, avatarMeshes);
      mesh.userData.floorSlot = slot.clone();
      mesh.userData.floorSlotIdx = idx;
      mesh.position.set(slot.x, 0, slot.z);
      mesh.userData.assignedSlot = mesh.position.clone();
      mesh.userData.isVipLounge = false;
      mesh.userData.levitateY = 0;
      mesh.userData.baseAngleY = Math.atan2(-slot.x, -slot.z);
      mesh.rotation.y = mesh.userData.baseAngleY;
    }

    mesh.userData.isPinned = isPinned;
    mesh.userData.currentScale = 0.05;
    mesh.userData.targetScale = 1.0;
    mesh.scale.setScalar(0.05 * BASE_AVATAR_SCALE);

    sceneManager.scene.add(mesh);
    avatarMeshes.set(userId, mesh);
    trackedAvatar.mesh = mesh;
  }

  const totalCoins = trackedAvatar.totalCoins || userData.totalCoins || 0;
  if (totalCoins > 0 && mesh.userData?.controller) {
    const isTop1 = context.vipLoungeManager?.getCurrentTop1() === userId;
    const eq = evaluateEquipment(totalCoins, null, isTop1);
    if (userData.tier === undefined && mesh.userData.controller.setTier) {
      mesh.userData.controller.setTier(eq.tier);
    }
    if (mesh.userData.controller.setFootRings) {
      mesh.userData.controller.setFootRings(eq.footRings);
    }
    if (mesh.userData.controller.setBodyAura) {
      mesh.userData.controller.setBodyAura(eq.auraType);
    }
  }

  if (userData.tier !== undefined && mesh.userData?.controller) {
    let assignedTier = Number(userData.tier);
    // Strict Tier 5 Rule: Tier 5 can only be set if user qualifies for Top 1 and coins >= slimeTier5
    if (assignedTier === 5) {
      const isTop1 = context.vipLoungeManager?.getCurrentTop1() === userId;
      const eq = evaluateEquipment(totalCoins, null, isTop1);
      if (eq.tier < 5) assignedTier = eq.tier;
    }
    mesh.userData.controller.setTier(assignedTier);
  }
  if (context.currentBillboardScale && mesh.userData?.controller?.setBillboardScale) {
    mesh.userData.controller.setBillboardScale(context.currentBillboardScale);
  }
  if (syncActiveFloorAvatars) syncActiveFloorAvatars();

  return mesh;
}

/**
 * Smoothly animates an avatar hopping up and sinking into the floor before removal.
 */
export function sinkAndRemoveAvatar(userId, context) {
  const id = String(userId);
  const mesh = context.avatarMeshes?.get(id);
  if (mesh && mesh.userData?.controller?.triggerSink && !mesh.userData.isSinking) {
    mesh.userData.isSinking = true;
    mesh.userData.controller.triggerSink(() => {
      deleteAvatar(id, context);
    });
  } else {
    deleteAvatar(id, context);
  }
}

/**
 * Manually deletes an avatar from scene, managers, and coin registry.
 */
export function deleteAvatar(userId, context) {
  const {
    avatarMeshes,
    occupancyManager,
    userCoinsMap,
    vipLoungeManager,
    sceneManager,
    uiOverlay,
    syncActiveFloorAvatars,
    executeVipPromotionAndSwap
  } = context;

  const id = String(userId);
  const mesh = avatarMeshes.get(id);
  if (mesh) {
    mesh.visible = false;
    if (sceneManager?.focusedAvatarMesh === mesh) {
      sceneManager.clearAvatarFocus?.();
    }
    sceneManager.scene.remove(mesh);
    mesh.traverse((child) => {
      if (child.geometry && !child.geometry.userData?.isShared) {
        child.geometry.dispose();
      }
      if (child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((m) => {
          if (!m.userData?.isShared) m.dispose();
        });
      }
    });
    avatarMeshes.delete(id);
  }
  occupancyManager.removeAvatar(id);
  userCoinsMap.delete(id);
  vipLoungeManager.removeUser(id);

  const sortedDonors = Array.from(userCoinsMap.values()).sort((a, b) => b.totalCoins - a.totalCoins);
  uiOverlay.updateLeaderboard(sortedDonors);
  if (executeVipPromotionAndSwap) executeVipPromotionAndSwap(sortedDonors);
  if (syncActiveFloorAvatars) syncActiveFloorAvatars();
}

/**
 * Disposes and removes all active avatars from scene.
 */
export function clearAllAvatars(context) {
  const {
    avatarMeshes,
    occupancyManager,
    userCoinsMap,
    vipLoungeManager,
    sceneManager,
    uiOverlay,
    syncActiveFloorAvatars
  } = context;

  if (sceneManager?.clearAvatarFocus) {
    sceneManager.clearAvatarFocus();
  }
  avatarMeshes.forEach((mesh) => {
    mesh.visible = false;
    sceneManager.scene.remove(mesh);
    mesh.traverse((child) => {
      if (child.geometry && !child.geometry.userData?.isShared) {
        child.geometry.dispose();
      }
      if (child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((m) => {
          if (!m.userData?.isShared) m.dispose();
        });
      }
    });
  });
  avatarMeshes.clear();
  occupancyManager.clearAll();
  userCoinsMap.clear();
  vipLoungeManager.clear();

  uiOverlay.updateLeaderboard([]);
  if (syncActiveFloorAvatars) syncActiveFloorAvatars();
}

/**
 * Synchronizes active avatar mesh data with UI Overlay and WebSocket clients.
 */
export function syncActiveFloorAvatars(avatarMeshes, uiOverlay, ws) {
  if (!uiOverlay || !uiOverlay.updateActiveAvatars) return;
  const list = [];
  avatarMeshes.forEach((m, uid) => {
    list.push({
      userId: uid,
      username: m.userData.username || uid,
      nickname: m.userData.nickname || m.userData.username || uid,
      level: m.userData.level || 'Lv.1',
      tier: m.userData.controller?.state?.tier || 1,
      color: m.userData.colorKey || 'blue',
      rank: m.userData.donateRank || ''
    });
  });
  uiOverlay.updateActiveAvatars(list);
  const isWsOpen = typeof WebSocket !== 'undefined' ? ws.readyState === WebSocket.OPEN : ws.readyState === 1;
  if (typeof ws !== 'undefined' && ws && isWsOpen) {
    ws.send(JSON.stringify({ type: 'sync_avatars', list }));
  }
}

/**
 * Procedural animation for modern CyberSlime controller.
 * Normalizes raw audio flux and applies exponential lerp smoothing to prevent vertical jerking.
 */
function _updateCyberSlime(mesh, data, delta, bands) {
  const divisor = CINEMATIC_CONFIG?.audioBounce?.fluxDivisor || 80.0;
  const rawFlux = bands.bassFlux || 0;
  const normKick = Math.min(1.0, Math.max(0, rawFlux / divisor));
  const smooth = CINEMATIC_CONFIG?.audioBounce?.smoothingFactor || 0.85;
  data.audioKick = (data.audioKick || 0) * smooth + normKick * (1.0 - smooth);

  data.controller.update(delta, data.audioKick);

  if (!data.leapAnimation && !data.isSinking && !data.controller?.sinkAnim) {
    const targetBaseY = data.levitateY !== undefined ? data.levitateY : (data.assignedSlot?.y || 0);
    mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, targetBaseY, 0.05);
  }
}

/**
 * Procedural Squash & Stretch kinematics for fallback 3D Slime mesh.
 */
function _updateProceduralSlime(mesh, data, phase, isBouncing, time, delta) {
  const k = getSlimeKinematics(phase, isBouncing);

  data.slimeBody.scale.set(k.scaleXZ, k.scaleY, k.scaleXZ);
  data.slimeBody.position.y = 0.35 * k.scaleY + k.jumpY;

  if (!data.leapAnimation && !data.isSinking && !data.controller?.sinkAnim) {
    const targetBaseY = data.levitateY !== undefined ? data.levitateY : (data.assignedSlot?.y || 0);
    mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, targetBaseY, 0.05);
  }

  // Blinking Eyes
  const blinkCycle = (time + (data.phaseOffset || 0)) % 3.5;
  const isBlinking = blinkCycle < 0.15;
  if (data.eyeL && data.eyeR) {
    data.eyeL.scale.y = isBlinking ? 0.1 : 1.0;
    data.eyeR.scale.y = isBlinking ? 0.1 : 1.0;
  }
  if (data.specL && data.specR) {
    data.specL.visible = !isBlinking;
    data.specR.visible = !isBlinking;
  }

  // Accessories
  if (data.crown && data.crown.visible) {
    data.crown.position.y = 0.88 * k.scaleY + k.jumpY;
  }
  if (data.shadesGroup && data.shadesGroup.visible) {
    data.shadesGroup.position.y = (k.scaleY - 1.0) * 0.2 + k.jumpY;
  }
  if (data.wingsGroup && data.wingsGroup.visible) {
    data.wingsGroup.position.y = (k.scaleY - 1.0) * 0.2 + k.jumpY;
    data.wingsGroup.rotation.y = Math.sin(time * 6) * 0.25;
  }
  if (data.auraRing && data.auraRing.visible) {
    data.auraRing.rotation.z += 1.5 * delta;
  }
}

/**
 * Procedural animation for humanoid fallback mesh.
 */
function _updateHumanoid(data, style, phase) {
  const k = getDanceKinematics(style, phase);
  if (data.torso) {
    data.torso.position.y = 0.9 + k.posY;
    data.torso.rotation.z = k.rotZ;
  }
  if (data.head) {
    data.head.position.y = 1.45 + k.posY;
  }
  if (data.armL) {
    data.armL.position.y = 0.85 + k.posY;
    data.armL.rotation.x = k.armL;
  }
  if (data.armR) {
    data.armR.position.y = 0.85 + k.posY;
    data.armR.rotation.x = k.armR;
  }
  if (data.legL) data.legL.rotation.x = k.legL;
  if (data.legR) data.legR.rotation.x = k.legR;
}

/**
 * Updates procedural kinematics, leap animations, and facing direction for a single avatar mesh.
 */
export function updateAvatarKinematics(mesh, delta, time, bpmSpeed, frenzyMultiplier, bands, camera, isFrenzy = false) {
  const data = mesh.userData;
  const style = isFrenzy ? 'jump' : data.danceStyle;
  const phase = time * bpmSpeed * frenzyMultiplier + (data.phaseOffset || 0);

  if (data.controller) {
    _updateCyberSlime(mesh, data, delta, bands);
  } else if (data.isSlime && data.slimeBody) {
    const isBouncing = data.isSuperBounce || style === 'jump' || isFrenzy;
    _updateProceduralSlime(mesh, data, phase, isBouncing, time, delta);
  } else {
    _updateHumanoid(data, style, phase);
  }

  // Leap Animation
  if (data.leapAnimation) {
    updateLeapAnimation(mesh, delta);
  } else if (!data.controller && style === 'spin') {
    mesh.rotation.y = Math.sin(phase * 0.5) * Math.PI;
  } else {
    const targetRotY = data.isVipLounge ? 0 : (data.baseAngleY !== undefined ? data.baseAngleY : 0);
    mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, targetRotY, 0.1);
  }

  // Smooth scale lerp
  data.currentScale = THREE.MathUtils.lerp(data.currentScale, data.targetScale, 0.08);
  mesh.scale.setScalar(data.currentScale * BASE_AVATAR_SCALE);

  // Billboard always faces active camera
  if (data.billboard && camera) {
    data.billboard.lookAt(camera.position);
  }
}
