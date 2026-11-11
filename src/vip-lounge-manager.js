// src/vip-lounge-manager.js - Bilateral VIP lounge platform management & leap animation
import * as THREE from 'three';
import { VIP_TOP1_SLOT, VIP_TOP2_SLOT } from './floor-slots.js';
import { evaluateEquipment } from './equipment-config.js';

/**
 * Triggers a parabolic leap arc animation between dance floor and VIP platforms.
 *
 * @param {THREE.Group} mesh - Avatar mesh to animate
 * @param {THREE.Vector3} targetPos - Destination position
 * @param {number} targetRotY - Destination Y rotation angle
 * @param {Function|null} onComplete - Callback executed upon landing
 */
export function triggerLeapAnimation(mesh, targetPos, targetRotY, onComplete = null) {
  if (!mesh) return;
  const startPos = mesh.position.clone();
  const dist = Math.hypot(startPos.x - targetPos.x, startPos.z - targetPos.z);
  if (dist < 0.2) {
    mesh.position.copy(targetPos);
    mesh.rotation.y = targetRotY;
    if (onComplete) onComplete();
    return;
  }

  mesh.userData.leapAnimation = {
    start: startPos,
    target: targetPos.clone(),
    startRotY: mesh.rotation.y,
    targetRotY,
    progress: 0,
    duration: Math.max(0.9, Math.min(1.4, dist * 0.12 + 0.6)),
    peakHeight: 2.4,
    onComplete
  };
}

/**
 * Advances and updates leap animation state each frame.
 *
 * @param {THREE.Group} mesh - Avatar mesh
 * @param {number} delta - Frame delta time in seconds
 */
export function updateLeapAnimation(mesh, delta) {
  const data = mesh.userData;
  if (!data?.leapAnimation) return;

  const anim = data.leapAnimation;
  anim.progress += delta;
  const p = Math.min(1.0, anim.progress / anim.duration);

  // Smooth cubic ease-in-out curve
  const easeP = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

  const currentX = THREE.MathUtils.lerp(anim.start.x, anim.target.x, easeP);
  const currentZ = THREE.MathUtils.lerp(anim.start.z, anim.target.z, easeP);
  const baseLerpY = THREE.MathUtils.lerp(anim.start.y, anim.target.y, easeP);
  const arcY = Math.sin(p * Math.PI) * anim.peakHeight;

  mesh.position.set(currentX, baseLerpY + arcY, currentZ);
  mesh.rotation.y = THREE.MathUtils.lerp(anim.startRotY, anim.targetRotY, easeP);

  if (p >= 1.0) {
    mesh.position.copy(anim.target);
    mesh.rotation.y = anim.targetRotY;
    data.leapAnimation = null;
    data.isSuperBounce = true;
    if (data.controller) {
      data.controller.setExpression('smile');
    }
    if (anim.onComplete) anim.onComplete();
  }
}

/**
 * Manages elevated VIP platforms flanking the DJ booth:
 * - Top 1 Left Platform (Imperial Gold Throne)
 * - Top 2 Right Platform (Platinum Cyan Lounge)
 */
export class VipLoungeManager {
  constructor() {
    this.currentTop1UserId = null;
    this.currentTop2UserId = null;
  }

  getCurrentTop1() {
    return this.currentTop1UserId;
  }

  getCurrentTop2() {
    return this.currentTop2UserId;
  }

  clear() {
    this.currentTop1UserId = null;
    this.currentTop2UserId = null;
  }

  removeUser(userId) {
    const id = String(userId);
    if (this.currentTop1UserId === id) this.currentTop1UserId = null;
    if (this.currentTop2UserId === id) this.currentTop2UserId = null;
  }

  /**
   * Promotes an avatar mesh to Top 1 Left Platform dais.
   */
  _promoteToTop1(mesh, userId, userCoinsMap = null) {
    mesh.userData.assignedSlot = VIP_TOP1_SLOT.clone();
    mesh.userData.isVipLounge = true;
    mesh.userData.levitateY = VIP_TOP1_SLOT.y;
    triggerLeapAnimation(mesh, VIP_TOP1_SLOT, 0);
    this.currentTop1UserId = userId;
    if (mesh.userData.controller) {
      mesh.userData.controller.updateBillboard(0, null, '👑 TOP 1');
      const coins = userCoinsMap?.get(userId)?.totalCoins || 0;
      const eq = evaluateEquipment(coins, null, true);
      mesh.userData.controller.setTier(eq.tier);
      if (typeof mesh.userData.controller.setFootRings === 'function') {
        mesh.userData.controller.setFootRings(eq.footRings);
      }
      if (typeof mesh.userData.controller.setBodyAura === 'function') {
        mesh.userData.controller.setBodyAura(eq.auraType);
      }
    }
  }

  /**
   * Promotes an avatar mesh to Top 2 Right Platform dais.
   */
  _promoteToTop2(mesh, userId, userCoinsMap = null) {
    mesh.userData.assignedSlot = VIP_TOP2_SLOT.clone();
    mesh.userData.isVipLounge = true;
    mesh.userData.levitateY = VIP_TOP2_SLOT.y;
    triggerLeapAnimation(mesh, VIP_TOP2_SLOT, 0);
    this.currentTop2UserId = userId;
    if (mesh.userData.controller) {
      mesh.userData.controller.updateBillboard(0, null, '🥈 TOP 2');
      const coins = userCoinsMap?.get(userId)?.totalCoins || 0;
      const eq = evaluateEquipment(coins, null, false);
      mesh.userData.controller.setTier(eq.tier);
      if (typeof mesh.userData.controller.setFootRings === 'function') {
        mesh.userData.controller.setFootRings(eq.footRings);
      }
      if (typeof mesh.userData.controller.setBodyAura === 'function') {
        mesh.userData.controller.setBodyAura(eq.auraType);
      }
    }
  }

  /**
   * Returns a displaced VIP occupant back to a dance floor slot.
   */
  _demoteDisplacedAvatar(mesh, prevUserId, returnSlot, userCoinsMap) {
    mesh.userData.floorSlot = returnSlot.clone();
    mesh.userData.assignedSlot = returnSlot.clone();
    mesh.userData.isVipLounge = false;
    mesh.userData.levitateY = 0;

    // Reset scale and VIP accessories back to standard floor avatar
    mesh.userData.targetScale = 1.0;
    mesh.userData.isWhale = false;
    if (mesh.userData.crown) mesh.userData.crown.visible = false;
    if (mesh.userData.auraRing) mesh.userData.auraRing.visible = false;
    if (mesh.userData.sparkles) mesh.userData.sparkles.visible = false;
    if (mesh.userData.wingsGroup) mesh.userData.wingsGroup.visible = false;
    if (mesh.userData.shadesGroup) mesh.userData.shadesGroup.visible = false;

    const returnRotY = Math.atan2(-returnSlot.x, -returnSlot.z);
    triggerLeapAnimation(mesh, new THREE.Vector3(returnSlot.x, 0, returnSlot.z), returnRotY);

    if (mesh.userData.controller) {
      const oldCoins = userCoinsMap?.get(prevUserId)?.totalCoins || 0;
      const eq = evaluateEquipment(oldCoins, null, false);
      mesh.userData.controller.setTier(eq.tier);
      if (typeof mesh.userData.controller.setFootRings === 'function') {
        mesh.userData.controller.setFootRings(eq.footRings);
      }
      if (typeof mesh.userData.controller.setBodyAura === 'function') {
        mesh.userData.controller.setBodyAura(eq.auraType);
      }
      mesh.userData.controller.updateBillboard(0, null, null);
    }
  }

  /**
   * Executes bilateral slot promotion and swapping between top donors and displaced occupants.
   *
   * @param {object} params
   * @param {Array} params.sortedDonors - Array of donor summary objects sorted by total coins descending
   * @param {Map<string, THREE.Group>} params.avatarMeshes - Active avatar meshes
   * @param {Map<string, object>} params.userCoinsMap - Cumulative coins map
   * @param {THREE.Vector3[]} params.floorSlots - All dance floor slots
   */
  executeVipPromotionAndSwap({ sortedDonors, avatarMeshes, userCoinsMap, floorSlots }) {
    if (!sortedDonors || sortedDonors.length === 0) return;

    const newTop1 = sortedDonors[0]?.totalCoins > 0 ? String(sortedDonors[0].userId) : null;
    const newTop2 = sortedDonors[1]?.totalCoins > 0 ? String(sortedDonors[1].userId) : null;

    const prevTop1 = this.currentTop1UserId;
    const prevTop2 = this.currentTop2UserId;

    if (newTop1 === prevTop1 && newTop2 === prevTop2) {
      // If Top 1 is set but mesh is still on the dance floor, ensure it's moved
      const meshTop1 = newTop1 ? avatarMeshes.get(newTop1) : null;
      if (meshTop1 && !meshTop1.userData.isVipLounge) {
        meshTop1.userData.assignedSlot = VIP_TOP1_SLOT.clone();
        meshTop1.userData.isVipLounge = true;
        meshTop1.userData.levitateY = VIP_TOP1_SLOT.y;
        triggerLeapAnimation(meshTop1, VIP_TOP1_SLOT, 0);
      }
      return;
    }

    const meshNewTop1 = newTop1 ? avatarMeshes.get(newTop1) : null;
    const meshNewTop2 = newTop2 ? avatarMeshes.get(newTop2) : null;
    const meshOldTop1 = prevTop1 ? avatarMeshes.get(prevTop1) : null;
    const meshOldTop2 = prevTop2 ? avatarMeshes.get(prevTop2) : null;

    // Available dance floor slots vacated by ascending avatars
    const availableFloorSlots = [];
    if (meshNewTop1 && meshNewTop1.userData.floorSlot && prevTop1 !== newTop1 && prevTop2 !== newTop1) {
      availableFloorSlots.push(meshNewTop1.userData.floorSlot.clone());
    }
    if (meshNewTop2 && meshNewTop2.userData.floorSlot && prevTop1 !== newTop2 && prevTop2 !== newTop2) {
      availableFloorSlots.push(meshNewTop2.userData.floorSlot.clone());
    }

    const now = Date.now();
    const isNewTop1Ready = meshNewTop1 && (!meshNewTop1.userData.celebrationUntil || now >= (meshNewTop1.userData.celebrationUntil - 150));
    const isNewTop2Ready = meshNewTop2 && (!meshNewTop2.userData.celebrationUntil || now >= (meshNewTop2.userData.celebrationUntil - 150));

    // 1. Promote new Top 1
    if (meshNewTop1 && isNewTop1Ready && (!meshNewTop1.userData.isVipLounge || prevTop1 !== newTop1)) {
      this._promoteToTop1(meshNewTop1, newTop1, userCoinsMap);
    }

    // 2. Promote new Top 2
    if (meshNewTop2 && isNewTop2Ready && (!meshNewTop2.userData.isVipLounge || prevTop2 !== newTop2)) {
      this._promoteToTop2(meshNewTop2, newTop2, userCoinsMap);
    }

    // 3. Demote displaced old Top 1
    if (meshOldTop1 && prevTop1 !== newTop1 && prevTop1 !== newTop2) {
      const returnSlot = availableFloorSlots.shift() || meshOldTop1.userData.floorSlot || floorSlots[0];
      this._demoteDisplacedAvatar(meshOldTop1, prevTop1, returnSlot, userCoinsMap);
    }

    // 4. Demote displaced old Top 2
    if (meshOldTop2 && prevTop2 !== newTop1 && prevTop2 !== newTop2) {
      const returnSlot = availableFloorSlots.shift() || meshOldTop2.userData.floorSlot || floorSlots[1];
      this._demoteDisplacedAvatar(meshOldTop2, prevTop2, returnSlot, userCoinsMap);
    }

    if (isNewTop1Ready && meshNewTop1) this.currentTop1UserId = newTop1;
    if (isNewTop2Ready && meshNewTop2) this.currentTop2UserId = newTop2;
  }
}
