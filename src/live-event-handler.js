// src/live-event-handler.js - Ingestion, routing, and dispatching of real-time LIVE stream events
import { parseColorCommand, setSlimeColor, applyWhaleSlimeAesthetics, DANCE_STYLES } from './avatar-manager.js';
import { DONATE_GIFTS } from './gift-props.js';
import { enqueueHighTierShowcase } from './cinematic-showcase.js';
import { evaluateEquipment } from './equipment-config.js';
import { LIKE_JUMP_CONFIG, DONATE_CELEBRATION_CONFIG } from './animation-constants.js';
import { enqueueDonation } from './donation-queue.js';
import { DONATION_CAMERA_CONFIG } from './donation-constants.js';

export { DONATE_GIFTS, evaluateEquipment };

/**
 * Resolves gift coins into tiered celebration categories.
 *
 * @param {number} coins
 * @returns {'ultra'|'high'|'medium'|'small'}
 */
export function resolveGiftCategory(coins) {
  if (coins >= 6000) return 'ultra';
  if (coins >= 500) return 'high';
  if (coins >= 20) return 'medium';
  return 'small';
}

/**
 * Calculates Slime evolution tier from cumulative coin contributions.
 *
 * @param {number} totalCoins
 * @returns {number} Tier from 1 to 5
 */
export function calculateSlimeTier(totalCoins, isTop1 = undefined) {
  return evaluateEquipment(totalCoins, null, isTop1).tier;
}

/**
 * Handles chat commands with First Command Matching rule.
 * Supported: !color (3 colors: green, red, blue; random 1 of remaining 2 if empty),
 *            !dance (1: spin body around Z-axis, 2: default; toggle if empty),
 *            !face (smile, normal, wink; random 1 of remaining 2 if empty).
 * Any text not starting with '!' is treated as normal chat and ignored.
 */
function _handleChatCommands(comment, mesh, syncActiveFloorAvatars) {
  if (!comment || !mesh || typeof comment !== 'string') return;
  const trimmed = comment.trim();
  if (!trimmed.startsWith('!')) return; // First Command Matching: must start with '!'

  const tokens = trimmed.split(/\s+/);
  const cmd = (tokens[0] || '').toLowerCase();
  const rawArg = (tokens[1] || '').toLowerCase();
  const twoWordArg = tokens.slice(1, 3).join(' ').toLowerCase();

  // 1. !color command (strictly 3 colors: green, red, blue)
  if (cmd === '!color') {
    const CANONICAL_COLORS = ['green', 'red', 'blue'];
    const parsed = parseColorCommand(trimmed);
    let targetColor = null;

    if (parsed && !parsed.isRandom && parsed.name) {
      targetColor = parsed.name;
    } else {
      // Pick randomly 1 of the 2 other remaining colors
      let currentColor = mesh.userData?.colorKey || 'green';
      if (currentColor === 'lime') currentColor = 'green';
      else if (currentColor === 'pink') currentColor = 'red';
      else if (currentColor === 'cyan') currentColor = 'blue';

      const remainingColors = CANONICAL_COLORS.filter(c => c !== currentColor);
      targetColor = remainingColors[Math.floor(Math.random() * remainingColors.length)] || 'red';
    }

    if (targetColor) {
      setSlimeColor(mesh, targetColor);
      if (syncActiveFloorAvatars) syncActiveFloorAvatars();
    }
    return;
  }

  // 2. !dance command (1: spin body around Z-axis, 2: default bounce)
  if (cmd === '!dance') {
    if (mesh.userData?.controller?.setDanceMode) {
      if (rawArg === '1' || rawArg === 'spin' || rawArg === 'z') {
        mesh.userData.controller.setDanceMode(1);
      } else if (rawArg === '2' || rawArg === 'default') {
        mesh.userData.controller.setDanceMode(2);
      } else {
        mesh.userData.controller.setDanceMode(null);
      }
    }
    return;
  }

  // 3. !face command (3 modes: smile, normal, wink)
  if (cmd === '!face') {
    if (mesh.userData?.controller?.setExpression) {
      const FACE_OPTIONS = ['smile', 'normal', 'wink'];
      let targetFace = null;

      if (rawArg === 'smile' || rawArg === 'funny' || rawArg === 'happy' || rawArg === 'cuoi' || rawArg === 'cười') {
        targetFace = 'smile';
      } else if (rawArg === 'wink' || rawArg === 'nhaymat' || twoWordArg === 'nháy mắt') {
        targetFace = 'wink';
      } else if (rawArg === 'normal' || rawArg === 'binhthuong' || twoWordArg === 'bình thường') {
        targetFace = 'normal';
      } else {
        // Randomly pick 1 of the other 2 remaining face expressions
        const currentExp = mesh.userData.controller.state?.expression || 'normal';
        const remainingFaces = FACE_OPTIONS.filter(f => f !== currentExp);
        targetFace = remainingFaces[Math.floor(Math.random() * remainingFaces.length)] || 'smile';
      }

      if (targetFace) {
        mesh.userData.controller.setExpression(targetFace);
      }
    }
    return;
  }

  // Other commands (!tier, !jump, !cheer, !wave) are discarded per specification
}

/**
 * Executes Ultra Tier celebration effects (Pegasus / Lion Coronation >= 6000 coins).
 * Replaces old bulky floor props with Fullscreen 2D + 3D Cinematic Showcase.
 */
function _triggerUltraCelebration(mesh, origin, giftKey, coins, shouldUpgradeTier, newTier, context, evt = {}) {
  const { clubEnvironment, uiOverlay, enqueueHighTierShowcase: ctxShowcase } = context;

  if (uiOverlay?.triggerFrenzyMode) uiOverlay.triggerFrenzyMode();
  if (clubEnvironment?.focusSpotlights) clubEnvironment.focusSpotlights('ultra', origin);

  if (mesh.userData?.controller?.triggerDonateAnimation) {
    mesh.userData.controller.triggerDonateAnimation({
      type: 'high',
      subType: 'vip_celebrate',
      coins,
      duration: 5.8,
      upgradeTier: shouldUpgradeTier,
      targetTier: newTier
    });
  }

  const giftSpec = DONATE_GIFTS[giftKey] || {
    key: giftKey,
    name: evt?.data?.giftName || giftKey || 'Ultra Gift',
    coins,
    emoji: '👑',
    cat: 'ultra',
    tier: newTier
  };

  const showcaseFn = ctxShowcase || enqueueHighTierShowcase;
  if (typeof showcaseFn === 'function') {
    showcaseFn({
      avatar: mesh,
      gift: { ...giftSpec, key: giftKey, coins },
      shouldUpgradeTier
    });
  }
}

/**
 * Executes High Tier celebration effects (500-5000 coins).
 * Replaces old bulky floor props with Fullscreen 2D + 3D Cinematic Showcase.
 */
function _triggerHighCelebration(mesh, origin, giftKey, coins, shouldUpgradeTier, newTier, context, evt = {}) {
  const { clubEnvironment, enqueueHighTierShowcase: ctxShowcase } = context;

  if (clubEnvironment?.focusSpotlights) clubEnvironment.focusSpotlights('high', origin);

  if (mesh.userData?.controller?.triggerDonateAnimation) {
    mesh.userData.controller.triggerDonateAnimation({
      type: 'high',
      subType: 'vip_celebrate',
      coins,
      duration: 4.5,
      upgradeTier: shouldUpgradeTier,
      targetTier: newTier
    });
  }

  const giftSpec = DONATE_GIFTS[giftKey] || {
    key: giftKey,
    name: evt?.data?.giftName || giftKey || 'High Tier Gift',
    coins,
    emoji: '🎁',
    cat: 'high',
    tier: newTier
  };

  const showcaseFn = ctxShowcase || enqueueHighTierShowcase;
  if (typeof showcaseFn === 'function') {
    showcaseFn({
      avatar: mesh,
      gift: { ...giftSpec, key: giftKey, coins },
      shouldUpgradeTier
    });
  }
}

/**
 * Executes Medium Tier celebration effects (20-499 coins).
 */
function _triggerMediumCelebration(mesh, origin, giftKey, coins, shouldUpgradeTier, newTier, context) {
  const { clubEnvironment, audioSystem } = context;

  let subType = 'orbit_narrow';
  let duration = 2.0;
  if (coins >= 80) {
    subType = 'orbit_triple';
    duration = coins >= 100 ? 4.0 : 3.5;
  } else if (coins >= 50) {
    subType = 'orbit_double';
    duration = 3.0;
  } else if (coins >= 30) {
    subType = 'orbit_trail';
    duration = 2.5;
  }

  mesh.userData.targetScale = 1.15;
  if (audioSystem?.playSfx) audioSystem.playSfx('bassBoom');

  if (mesh.userData?.controller?.triggerDonateAnimation) {
    mesh.userData.controller.triggerDonateAnimation({
      type: 'medium',
      subType,
      coins,
      duration,
      upgradeTier: shouldUpgradeTier,
      targetTier: newTier
    });
  }
  if (clubEnvironment?.focusSpotlights) clubEnvironment.focusSpotlights('medium', origin);
  if (clubEnvironment?.spawnOrbitingCoinRings) clubEnvironment.spawnOrbitingCoinRings(mesh, coins, duration);
  if (clubEnvironment?.triggerFireworks) clubEnvironment.triggerFireworks(2, origin);
}

/**
 * Executes Small Tier celebration effects (1-19 coins).
 */
function _triggerSmallCelebration(mesh, origin, giftKey, coins, shouldUpgradeTier, newTier, context) {
  const { clubEnvironment, audioSystem } = context;

  let subType = 'drop_single';
  let duration = DONATE_CELEBRATION_CONFIG.coin1?.duration ?? 1.0;
  let count = DONATE_CELEBRATION_CONFIG.coin1?.coinsDropped ?? 1;

  if (coins <= 1) {
    subType = 'drop_single';
    duration = DONATE_CELEBRATION_CONFIG.coin1?.duration ?? 1.0;
    count = DONATE_CELEBRATION_CONFIG.coin1?.coinsDropped ?? 1;
  } else if (coins <= 5) {
    subType = 'drop_cascade';
    duration = DONATE_CELEBRATION_CONFIG.coin5?.duration ?? 2.0;
    count = DONATE_CELEBRATION_CONFIG.coin5?.coinsDropped ?? 5;
  } else {
    subType = 'drop_burst';
    duration = DONATE_CELEBRATION_CONFIG.coin10?.duration ?? 2.0;
    count = DONATE_CELEBRATION_CONFIG.coin10?.coinsDropped ?? 10;
  }

  if (audioSystem?.playSfx) audioSystem.playSfx('coin');

  if (mesh.userData?.controller?.triggerDonateAnimation) {
    mesh.userData.controller.triggerDonateAnimation({
      type: 'small',
      subType,
      coins,
      duration,
      upgradeTier: shouldUpgradeTier,
      targetTier: newTier
    });
  }
  if (clubEnvironment?.focusSpotlights) clubEnvironment.focusSpotlights('small', origin);
  if (clubEnvironment?.spawnDroppingCoins) clubEnvironment.spawnDroppingCoins(origin, count, subType, mesh);
}

/**
 * Schedules deferred VIP promotion after celebratory animation concludes.
 */
function _scheduleDeferredVipSwap(mesh, giftCategory, sortedDonors, executeVipPromotionAndSwap) {
  let celebrationDurationMs = 1500;
  if (giftCategory === 'ultra') celebrationDurationMs = 7600;
  else if (giftCategory === 'high') celebrationDurationMs = 3500;
  else if (giftCategory === 'medium') celebrationDurationMs = 2500;

  mesh.userData.celebrationUntil = Date.now() + celebrationDurationMs;
  setTimeout(() => {
    mesh.userData.celebrationUntil = 0;
    if (executeVipPromotionAndSwap) executeVipPromotionAndSwap(sortedDonors);
  }, celebrationDurationMs);
}

/**
 * Handles incoming Like & Like Batch events.
 */
export function handleLikeEvent(evt, context) {
  const { clubEnvironment, uiOverlay, getOrCreateAvatarMesh, avatarMeshes, audioSystem } = context;
  const count = Number(evt.data?.likeCount || evt.data?.count || 1);

  if (clubEnvironment?.emitFlyingHearts) {
    clubEnvironment.emitFlyingHearts(Math.min(count, 20));
  }
  if (uiOverlay?.addHype) {
    uiOverlay.addHype(count);
  }
  if (audioSystem?.playSfx) {
    audioSystem.playSfx('heartwhoosh');
  }

  // Lấy avatar mesh của người like
  let mesh = null;
  const userData = evt.user;
  const userId = userData ? String(userData.id || userData.username) : null;

  if (userId && avatarMeshes?.has(userId)) {
    mesh = avatarMeshes.get(userId);
  } else if (userData && getOrCreateAvatarMesh) {
    mesh = getOrCreateAvatarMesh(userData, 0);
  }

  // Nếu không có user cụ thể (hoặc like tổng quát từ phòng live), chọn một avatar ngẫu nhiên trên sàn
  if (!mesh && avatarMeshes && avatarMeshes.size > 0) {
    const allMeshes = Array.from(avatarMeshes.values());
    mesh = allMeshes[Math.floor(Math.random() * allMeshes.length)];
  }

  if (mesh) {
    // 1. Slime của họ sẽ nhảy 1 lần
    if (mesh.userData?.controller?.triggerLikeJump) {
      mesh.userData.controller.triggerLikeJump();
    } else if (mesh.userData?.controller?.triggerDonateAnimation) {
      mesh.userData.controller.triggerDonateAnimation({ subType: 'drop_single', coins: 1 });
    }

    // 2. Bong bóng hình tim màu đỏ bay lên bay lên mờ dần và biến mất
    if (clubEnvironment?.spawnHeartBubbles) {
      const bubbleCount = Math.min(
        LIKE_JUMP_CONFIG.bubbleCountMax,
        Math.max(LIKE_JUMP_CONFIG.bubbleCountMin, Math.floor(count / 2) + 2)
      );
      clubEnvironment.spawnHeartBubbles(mesh.position, bubbleCount);
    }
  }
}

/**
 * Handles incoming Chat comment events.
 */
export function handleChatEvent(evt, context) {
  const { uiOverlay, getOrCreateAvatarMesh, syncActiveFloorAvatars } = context;
  uiOverlay.addHype(2);
  const user = evt.user || { id: 'anon', username: 'Viewer' };
  const comment = evt.data?.comment || '';
  const mesh = getOrCreateAvatarMesh(user, 0);
  _handleChatCommands(comment, mesh, syncActiveFloorAvatars);
}

/**
 * Handles incoming Gift donation events with in-place celebration and deferred VIP promotion.
 */
export function handleGiftEvent(evt, context) {
  const {
    uiOverlay,
    userCoinsMap,
    getOrCreateAvatarMesh,
    executeVipPromotionAndSwap
  } = context;

  const user = evt.user || { id: 'anon', username: 'Gifter' };
  const coins = Number(evt.data?.totalCoins || evt.data?.diamondCount || 10);
  const tier = evt.data?.tier || 1;

  uiOverlay.addHype(coins);
  uiOverlay.showGiftAlert(evt);

  // Update Cumulative Leaderboard
  const prevCoins = userCoinsMap.get(user.id)?.totalCoins || 0;
  const totalCoins = prevCoins + coins;
  userCoinsMap.set(user.id, {
    userId: user.id,
    username: user.username,
    nickname: user.nickname,
    avatarUrl: user.avatarUrl,
    totalCoins
  });

  const sortedDonors = Array.from(userCoinsMap.values()).sort(
    (a, b) => b.totalCoins - a.totalCoins
  );
  uiOverlay.updateLeaderboard(sortedDonors);

  // In-Place Celebration: Avatar celebrates at their standing position on dance floor
  const mesh = getOrCreateAvatarMesh(user, coins);
  const origin = mesh.position.clone();

  // Tier 5 Quy Định Mới: Chỉ dành riêng cho người donate cao nhất (TOP 1) và tổng donation >= ngưỡng
  const isTop1 = sortedDonors.length > 0 && String(sortedDonors[0].userId) === String(user.id);
  const giftCategory = resolveGiftCategory(coins);
  const equipment = evaluateEquipment(totalCoins, null, isTop1);
  const newTier = equipment.tier;
  const currentTier = mesh.userData.controller?.state?.tier || 1;

  // Nếu người này soán ngôi TOP 1, người TOP 1 cũ bị giáng về Tier 4 (nếu từng là Tier 5)
  if (isTop1 && sortedDonors.length > 1) {
    const oldTop1User = sortedDonors[1];
    const oldMesh = context.avatarMeshes?.get(String(oldTop1User.userId));
    if (oldMesh?.userData?.controller?.state?.tier === 5) {
      oldMesh.userData.controller.setTier(4);
    }
  }

  // Cumulative coin progression tier upgrade: unlocks whenever accumulated coins cross threshold
  const shouldAdvanceTier = (newTier > currentTier) || Boolean(evt.data?.forceTierUp);

  let shouldUpgradeTier = shouldAdvanceTier;
  if (evt.data?.forceTierUp !== undefined) {
    shouldUpgradeTier = Boolean(evt.data.forceTierUp);
  } else if (context.autoTierUpOnDonate !== undefined) {
    shouldUpgradeTier = context.autoTierUpOnDonate ? (newTier > currentTier) : false;
  }

  // Áp dụng trang bị dựa trên tổng coin tích lũy (Slime tier, Vòng chân 1-3, Hệ thống 3 Aura: Tím/Cam/Vàng)
  if (mesh.userData?.controller) {
    if (shouldAdvanceTier && typeof mesh.userData.controller.setTier === 'function') {
      mesh.userData.controller.setTier(newTier);
    }
    if (typeof mesh.userData.controller.setFootRings === 'function') {
      mesh.userData.controller.setFootRings(equipment.footRings);
    }
    if (typeof mesh.userData.controller.setBodyAura === 'function') {
      mesh.userData.controller.setBodyAura(equipment.auraType);
    }
  }

  // Update billboard rank badge
  const donorRank = sortedDonors.findIndex((d) => String(d.userId) === String(user.id));
  const rankStr = donorRank === 0 ? '👑 TOP 1' : (donorRank === 1 ? '🥈 TOP 2' : (donorRank === 2 ? '🥉 TOP 3' : (donorRank === 3 ? 'TOP 4' : (donorRank === 4 ? 'TOP 5' : (totalCoins >= 500 ? 'VIP' : null)))));
  if (mesh.userData.controller) {
    mesh.userData.controller.updateBillboard(coins, null, rankStr);
  }

  const giftKey = evt.data?.giftKey || evt.data?.giftName || '';

  // Unified Sequential FIFO Donation Celebration & Camera Zoom (when enqueueDonation is provided in context)
  const giftCat = (giftCategory === 'medium' || tier === 2) ? 'medium' : giftCategory;
  if (typeof context.enqueueDonation === 'function') {
    context.enqueueDonation({
      avatar: mesh,
      origin,
      category: giftCat,
      giftKey,
      coins,
      shouldUpgradeTier,
      newTier,
      evt,
      context
    });
  } else {
    // Direct celebration routing (synchronous fallback & unit testing compatibility)
    if (giftCategory === 'ultra') {
      _triggerUltraCelebration(mesh, origin, giftKey, coins, shouldUpgradeTier, newTier, context, evt);
    } else if (giftCategory === 'high') {
      _triggerHighCelebration(mesh, origin, giftKey, coins, shouldUpgradeTier, newTier, context, evt);
    } else if (giftCategory === 'medium' || tier === 2) {
      _triggerMediumCelebration(mesh, origin, giftKey, coins, shouldUpgradeTier, newTier, context);
    } else {
      _triggerSmallCelebration(mesh, origin, giftKey, coins, shouldUpgradeTier, newTier, context);
    }
  }

  _scheduleDeferredVipSwap(mesh, giftCategory, sortedDonors, executeVipPromotionAndSwap);
}

/**
 * Handles admin and debug stream control commands.
 */
export function handleAdminCommand(evt, context) {
  const { sceneManager, audioSystem, uiOverlay } = context;
  const { command, preset, value } = evt;

  if (command === 'set_camera' && preset) {
    sceneManager.setCameraPreset(preset);
  } else if (command === 'focus_avatar') {
    const { userId } = evt;
    if (userId && context.avatarMeshes) {
      const mesh = context.avatarMeshes.get(String(userId));
      if (mesh && sceneManager?.focusOnAvatar) {
        sceneManager.focusOnAvatar(mesh, { userId, username: mesh.userData?.username });
      } else if (sceneManager?.clearAvatarFocus) {
        sceneManager.clearAvatarFocus();
      }
    } else if (sceneManager?.clearAvatarFocus) {
      sceneManager.clearAvatarFocus();
    }
  } else if (command === 'clear_avatar_focus' || command === 'unfocus_avatar') {
    if (sceneManager?.clearAvatarFocus) {
      sceneManager.clearAvatarFocus();
    }
  } else if (command === 'set_distance' && typeof value === 'number') {
    sceneManager.setOrbitRadius(value);
  } else if (command === 'toggle_alpha') {
    sceneManager.toggleAlpha();
  } else if (command === 'toggle_chroma') {
    sceneManager.toggleChromaKey();
  } else if (command === 'set_volume' && typeof value === 'number') {
    audioSystem.setVolume(value);
  } else if (command === 'toggle_mute') {
    audioSystem.toggleMute();
  } else if (command === 'trigger_frenzy') {
    uiOverlay.triggerFrenzyMode();
  } else if (command === 'set_max_hype') {
    const val = evt.value !== undefined ? evt.value : evt.maxHype;
    if (uiOverlay?.setMaxHype) {
      uiOverlay.setMaxHype(val);
    }
  } else if (command === 'set_billboard_scale' && typeof value === 'number') {
    context.currentBillboardScale = value;
    if (context.avatarMeshes) {
      context.avatarMeshes.forEach((mesh) => {
        if (mesh.userData?.controller?.setBillboardScale) {
          mesh.userData.controller.setBillboardScale(value);
        }
      });
    }
  } else if (command === 'set_avatar_level') {
    const { userId, level } = evt;
    const mesh = userId ? context.avatarMeshes?.get(String(userId)) : null;
    if (mesh?.userData?.controller?.setTikTokLevel) {
      mesh.userData.controller.setTikTokLevel(level);
      if (context.syncActiveFloorAvatars) context.syncActiveFloorAvatars();
    }
  } else if (command === 'set_avatar_rank') {
    const { userId, rank } = evt;
    const mesh = userId ? context.avatarMeshes?.get(String(userId)) : null;
    if (mesh?.userData?.controller?.setDonateRank) {
      mesh.userData.controller.setDonateRank(rank);
      if (context.syncActiveFloorAvatars) context.syncActiveFloorAvatars();
    }
  } else if (command === 'set_avatar_fan') {
    const { userId, isFan } = evt;
    const mesh = userId ? context.avatarMeshes?.get(String(userId)) : null;
    if (mesh?.userData?.controller?.setFanStatus) {
      mesh.userData.controller.setFanStatus(isFan);
      if (context.syncActiveFloorAvatars) context.syncActiveFloorAvatars();
    }
  } else if (command === 'set_avatar_follower') {
    const { userId, isFollower } = evt;
    const mesh = userId ? context.avatarMeshes?.get(String(userId)) : null;
    if (mesh?.userData?.controller?.setFollowerStatus) {
      mesh.userData.controller.setFollowerStatus(isFollower);
      if (context.syncActiveFloorAvatars) context.syncActiveFloorAvatars();
    }
  } else if (command === 'simulate_crowd_ranks') {
    if (context.avatarMeshes) {
      let idx = 0;
      context.avatarMeshes.forEach((mesh) => {
        if (!mesh.userData?.controller) return;
        if (idx === 0) {
          mesh.userData.controller.setTikTokLevel(50);
          mesh.userData.controller.setDonateRank('👑 TOP 1');
        } else if (idx === 1) {
          mesh.userData.controller.setTikTokLevel(45);
          mesh.userData.controller.setDonateRank('🥈 TOP 2');
        } else if (idx === 2) {
          mesh.userData.controller.setTikTokLevel(40);
          mesh.userData.controller.setDonateRank('🥉 TOP 3');
        } else if (idx <= 6) {
          mesh.userData.controller.setTikTokLevel(25 + (idx % 10));
          mesh.userData.controller.setDonateRank('💎 VIP');
        } else {
          mesh.userData.controller.setTikTokLevel((idx % 30) + 1);
          mesh.userData.controller.setDonateRank(null);
        }
        idx++;
      });
      if (context.syncActiveFloorAvatars) context.syncActiveFloorAvatars();
    }
  } else if (command === 'clear_crowd_ranks') {
    if (context.avatarMeshes) {
      context.avatarMeshes.forEach((mesh) => {
        if (mesh.userData?.controller?.setDonateRank) {
          mesh.userData.controller.setDonateRank(null);
        }
      });
      if (context.syncActiveFloorAvatars) context.syncActiveFloorAvatars();
    }
  } else if (command === 'set_auto_tier_up') {
    context.autoTierUpOnDonate = Boolean(value);
  } else if (command === 'update_thresholds' && evt.thresholds) {
    if (context.onThresholdsUpdated) {
      context.onThresholdsUpdated(evt.thresholds);
    }
  }
}

/**
 * Handles Room Ranks (Top Donors Leaderboard) event from TikTok LIVE.
 * Spawns real avatars for Top 1 to Top 5 contributors and automatically promotes
 * Top 1 to the Imperial Gold Throne (left VIP) and Top 2 to the Platinum Cyan Lounge (right VIP).
 */
export function handleRoomRanksEvent(evt, context) {
  const { getOrCreateAvatarMesh, userCoinsMap, executeVipPromotionAndSwap } = context;
  const ranks = evt.data?.ranks || evt.ranks || [];
  if (!Array.isArray(ranks) || ranks.length === 0) return;

  // 1. Ingest donor ranks into userCoinsMap with actual scores (never fabricated values)
  ranks.forEach((item, idx) => {
    const rawUser = item.user || {};
    const userId = String(rawUser.id || rawUser.userId || rawUser.uniqueId || `rank_${idx}`);
    const score = Number(item.score || 0);
    const username = rawUser.displayId || rawUser.username || rawUser.nickname || `Viewer_${userId.slice(-4)}`;
    const nickname = rawUser.nickname || rawUser.displayId || username;
    const avatarUrl = rawUser.avatarThumb?.urlList?.[0] || rawUser.avatarUrl || '';

    if (userCoinsMap) {
      const existing = userCoinsMap.get(userId) || {};
      userCoinsMap.set(userId, {
        userId,
        username: nickname,
        nickname,
        avatarUrl,
        totalCoins: Math.max(existing.totalCoins || 0, score)
      });
    }
  });

  // 2. Identify Top 1 by descending totalCoins
  const sorted = userCoinsMap
    ? Array.from(userCoinsMap.values()).sort((a, b) => b.totalCoins - a.totalCoins)
    : [];
  const top1UserId = sorted.length > 0 && sorted[0].totalCoins > 0 ? String(sorted[0].userId) : null;

  // 3. Spawn or update avatars conforming strictly to admin thresholds
  ranks.forEach((item, idx) => {
    const rawUser = item.user || {};
    const userId = String(rawUser.id || rawUser.userId || rawUser.uniqueId || `rank_${idx}`);
    const tracked = userCoinsMap?.get(userId);
    const totalCoins = tracked?.totalCoins ?? Number(item.score || 0);
    const isTop1 = top1UserId === userId;
    const eq = evaluateEquipment(totalCoins, null, isTop1);

    const userPayload = {
      id: userId,
      userId,
      username: rawUser.displayId || rawUser.username || rawUser.nickname || `Viewer_${userId.slice(-4)}`,
      nickname: rawUser.nickname || rawUser.displayId || `Viewer_${userId.slice(-4)}`,
      avatarUrl: rawUser.avatarThumb?.urlList?.[0] || rawUser.avatarUrl || '',
      level: rawUser.payGrade?.level ? `Lv.${rawUser.payGrade.level}` : (rawUser.level || 'Lv.1'),
      tier: eq.tier,
      totalCoins
    };

    if (getOrCreateAvatarMesh) {
      const mesh = getOrCreateAvatarMesh(userPayload, totalCoins);
      if (mesh?.userData?.controller) {
        mesh.userData.controller.setTier(eq.tier);
        if (typeof mesh.userData.controller.setFootRings === 'function') {
          mesh.userData.controller.setFootRings(eq.footRings);
        }
        if (typeof mesh.userData.controller.setBodyAura === 'function') {
          mesh.userData.controller.setBodyAura(eq.auraType);
        }
      }
    }
  });

  // 4. Bilateral VIP promotion
  if (executeVipPromotionAndSwap && sorted.length > 0) {
    executeVipPromotionAndSwap(sorted);
  }
}

/**
 * Handles Session Reset event when live disconnects or reconnects a new channel.
 */
export function handleSessionResetEvent(evt, context) {
  if (context.clearAllAvatars) context.clearAllAvatars();
  if (context.userCoinsMap) context.userCoinsMap.clear();
  if (context.vipLoungeManager) context.vipLoungeManager.clear();
  if (context.uiOverlay?.resetDashboard) context.uiOverlay.resetDashboard();
}

/**
 * Handles incoming Member Join events.
 * Identifies if the entering user is a Fan (ACTIVE) or Follower, applying appropriate billboard styles.
 */
export function handleMemberEvent(evt, context) {
  const { getOrCreateAvatarMesh, avatarMeshes } = context;
  const user = evt.user;
  if (!user) return;

  const mesh = (user.id && avatarMeshes?.has(String(user.id)))
    ? avatarMeshes.get(String(user.id))
    : (getOrCreateAvatarMesh ? getOrCreateAvatarMesh(user, 0) : null);

  if (!mesh?.userData?.controller) return;

  if (user.isFan) {
    mesh.userData.controller.setFanStatus(true);
  } else if (user.isFollower) {
    mesh.userData.controller.setFollowerStatus(true);
  }
}

/**
 * Handles SuperFan and SuperFanJoin events.
 * Sets Fan badge on avatar and triggers a celebratory bounce.
 */
export function handleFanEvent(evt, context) {
  const { getOrCreateAvatarMesh, avatarMeshes } = context;
  const user = evt.user;
  if (!user) return;

  const mesh = (user.id && avatarMeshes?.has(String(user.id)))
    ? avatarMeshes.get(String(user.id))
    : (getOrCreateAvatarMesh ? getOrCreateAvatarMesh(user, 0) : null);

  if (!mesh?.userData?.controller) return;

  mesh.userData.controller.setFanStatus(true);

  // Celebratory bounce when becoming or joining as Fan
  if (mesh.userData.controller.triggerDonateAnimation) {
    mesh.userData.controller.triggerDonateAnimation({ subType: 'drop_single', coins: 1 });
  }
}

/**
 * Handles Follow events.
 * Marks avatar as follower with soft border and spawns red heart bubbles.
 */
export function handleFollowEvent(evt, context) {
  const { getOrCreateAvatarMesh, avatarMeshes, clubEnvironment } = context;
  const user = evt.user;
  if (!user) return;

  const mesh = (user.id && avatarMeshes?.has(String(user.id)))
    ? avatarMeshes.get(String(user.id))
    : (getOrCreateAvatarMesh ? getOrCreateAvatarMesh(user, 0) : null);

  if (!mesh?.userData?.controller) return;

  // Only apply follower status if not already a full Fan
  if (!mesh.userData.controller.userData?.isFan) {
    mesh.userData.controller.setFollowerStatus(true);
  }

  // Celebratory heart bubbles
  if (clubEnvironment?.spawnHeartBubbles) {
    clubEnvironment.spawnHeartBubbles(mesh.position, 4);
  }
}

/**
 * Central event router for all incoming live WebSocket messages.
 *
 * @param {object} evt - Normalized event payload
 * @param {object} context - Shared application context
 */
export function handleLiveEvent(evt, context) {
  if (!evt) return;

  switch (evt.type) {
    case 'like':
    case 'like_batch':
      handleLikeEvent(evt, context);
      break;

    case 'chat':
      handleChatEvent(evt, context);
      break;

    case 'gift':
      handleGiftEvent(evt, context);
      break;

    case 'member':
      handleMemberEvent(evt, context);
      break;

    case 'superFan':
    case 'superFanJoin':
      handleFanEvent(evt, context);
      break;

    case 'follow':
      handleFollowEvent(evt, context);
      break;

    case 'room_ranks':
      handleRoomRanksEvent(evt, context);
      break;

    case 'refresh_floor':
      if (context.clearAllAvatars) {
        context.clearAllAvatars();
      }
      if (evt.ranks && evt.ranks.length > 0) {
        handleRoomRanksEvent({ ranks: evt.ranks }, context);
      }
      break;

    case 'session_reset':
      handleSessionResetEvent(evt, context);
      break;

    case 'initial_session_state':
      if (evt.status && context.uiOverlay?.updateTikTokStatus) {
        context.uiOverlay.updateTikTokStatus(evt.status);
      }
      if (evt.activeUsers && Array.isArray(evt.activeUsers)) {
        evt.activeUsers.forEach((u) => {
          if (context.getOrCreateAvatarMesh) context.getOrCreateAvatarMesh(u, 0);
        });
      }
      if (evt.topDonors && evt.topDonors.length > 0) {
        handleRoomRanksEvent({ ranks: evt.topDonors }, context);
      }
      break;

    case 'delete_avatar':
      if (evt.userId && context.deleteAvatar) context.deleteAvatar(evt.userId);
      break;

    case 'clear_avatars':
      if (context.clearAllAvatars) context.clearAllAvatars();
      break;

    case 'tiktok_status':
      if (context.uiOverlay?.updateTikTokStatus) {
        context.uiOverlay.updateTikTokStatus(evt.data);
      }
      break;

    case 'admin_command':
      handleAdminCommand(evt, context);
      break;

    default:
      break;
  }
}
