// src/vip-podium-scheduler.js - Sequential VIP stage scheduler with FIFO queuing

/**
 * Sequential VIP stage scheduler ensuring single whale occupancy for 15s with FIFO queuing.
 */
export class VipPodiumScheduler {
  constructor({ duration = 15.0, podiumPos = { x: 0, y: 0.55, z: 0 }, preserveDonorPosition = false } = {}) {
    this.duration = duration;
    this.podiumPos = podiumPos;
    this.preserveDonorPosition = preserveDonorPosition;
    this.activeWhale = null; // { user, mesh, tier, returnSlot, remainingTime }
    this.queue = [];
  }

  enqueue(user, mesh, tier, returnSlot) {
    // Same whale: extend current tenure by duration
    if (this.activeWhale && this.activeWhale.user.id === user.id) {
      this.activeWhale.remainingTime += this.duration;
      this.activeWhale.tier = Math.max(this.activeWhale.tier, tier);
      return;
    }

    const slotCopy = typeof returnSlot?.clone === 'function'
      ? returnSlot.clone()
      : { x: returnSlot?.x || 0, y: returnSlot?.y || 0, z: returnSlot?.z || 0 };

    const item = {
      user,
      mesh,
      tier,
      returnSlot: slotCopy,
      remainingTime: this.duration
    };

    if (!this.activeWhale) {
      this.promote(item);
    } else {
      this.queue.push(item);
    }
  }

  promote(item) {
    this.activeWhale = item;
    item.mesh.userData.isOnPodium = true;

    if (this.preserveDonorPosition) {
      // Keep whale at their position, levitating proudly above their spot
      const currentSlot = item.returnSlot || item.mesh.position;
      item.mesh.position.x = currentSlot.x;
      item.mesh.position.z = currentSlot.z;
      const baseFloorY = currentSlot.y || 0;
      const targetY = baseFloorY + (item.tier >= 4 ? 2.8 : 1.2);
      item.mesh.userData.levitateY = targetY;
      item.mesh.position.y = targetY;
    } else {
      if (typeof item.mesh.position?.copy === 'function') {
        item.mesh.position.copy(this.podiumPos);
      } else if (item.mesh.position) {
        item.mesh.position.x = this.podiumPos.x;
        item.mesh.position.y = this.podiumPos.y;
        item.mesh.position.z = this.podiumPos.z;
      }

      if (item.tier >= 4) {
        item.mesh.userData.levitateY = 3.2;
        if (item.mesh.position) item.mesh.position.y = 3.2;
      } else {
        const targetY = this.podiumPos.y !== undefined ? this.podiumPos.y : 0.55;
        item.mesh.userData.levitateY = targetY;
        if (item.mesh.position) item.mesh.position.y = targetY;
      }
    }
  }

  update(delta, onPromote = null, onVacate = null) {
    if (!this.activeWhale) return;

    this.activeWhale.remainingTime -= delta;
    if (this.activeWhale.remainingTime <= 0) {
      const demoted = this.activeWhale;
      demoted.mesh.userData.isOnPodium = false;
      demoted.mesh.userData.levitateY = 0;

      if (typeof demoted.mesh.position?.copy === 'function') {
        demoted.mesh.position.copy(demoted.returnSlot);
      } else if (demoted.mesh.position) {
        demoted.mesh.position.x = demoted.returnSlot.x;
        demoted.mesh.position.y = demoted.returnSlot.y || 0;
        demoted.mesh.position.z = demoted.returnSlot.z;
      }

      if (this.queue.length > 0) {
        const next = this.queue.shift();
        this.promote(next);
        if (typeof onPromote === 'function') onPromote(next);
      } else {
        this.activeWhale = null;
        if (typeof onVacate === 'function') onVacate(demoted);
      }
    }
  }
}
