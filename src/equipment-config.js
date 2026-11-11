// src/equipment-config.js - Configurable thresholds for Slime Tiers, Foot Rings & 3 Auras (Purple, Orange, Gold)

export const DEFAULT_THRESHOLDS = {
  footRing1: 20,       // 1 vòng Trắng nhỏ
  slimeTier2: 20,      // Chubby Mochi Slime (Tier 2)
  footRing2: 100,      // 2 vòng: Trắng + Vàng
  slimeTier3: 500,     // Chubby + 2 Má phúng phính (Tier 3)
  footRing3: 1000,     // 3 vòng: Trắng + Vàng + Cam
  bodyPurpleAura: 2000,// Aura tím quanh người (Epic)
  slimeTier4: 3000,    // Chubby + Má + Sừng + Đuôi (Tier 4)
  bodyOrangeAura: 3500,// Aura cam quanh người (Legendary)
  bodyGoldenAura: 5000,// Aura vàng quanh người + mini bubble sủi lên (Mythic)
  slimeTier5: 6000     // Tier 5 Max (Chỉ dành cho TOP 1 donate khi tổng coin >= ngưỡng)
};

const STORAGE_KEY = 'tiktok_live_bar_equipment_thresholds';

/**
 * Loads equipment coin thresholds from localStorage or falls back to defaults.
 */
export function loadThresholds() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_THRESHOLDS,
          ...parsed
        };
      }
    } catch (e) {
      console.warn('[EquipmentConfig] Error loading from localStorage:', e);
    }
  }
  return { ...DEFAULT_THRESHOLDS };
}

/**
 * Saves equipment coin thresholds to localStorage and dispatches update event.
 */
export function saveThresholds(newThresholds) {
  const merged = { ...DEFAULT_THRESHOLDS, ...newThresholds };
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      window.dispatchEvent(new CustomEvent('app_thresholds_updated', { detail: merged }));
    } catch (e) {
      console.warn('[EquipmentConfig] Error saving to localStorage:', e);
    }
  }
  return merged;
}

/**
 * Resets equipment thresholds to factory defaults.
 */
export function resetThresholds() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('app_thresholds_updated', { detail: { ...DEFAULT_THRESHOLDS } }));
    } catch (e) {}
  }
  return { ...DEFAULT_THRESHOLDS };
}

/**
 * Evaluates which Slime Tier, Foot Rings, and Aura an account qualifies for based on cumulative coins and Top 1 rank.
 * @param {number} totalCoins - Cumulative coins donated by this account
 * @param {object} [thresholds] - Custom thresholds (defaults to loaded thresholds)
 * @param {boolean} [isTop1] - Whether this donor currently holds the #1 spot on the leaderboard
 * @returns {{ tier: number, footRings: number, auraType: 'gold'|'orange'|'purple'|null, hasBodyAura: boolean, floorColor: string }}
 */
export function evaluateEquipment(totalCoins = 0, thresholds = null, isTop1 = undefined) {
  const cfg = thresholds || loadThresholds();
  const coins = Number(totalCoins || 0);

  // 1. Slime Tier (1 to 5)
  // TIER 5 QUY ĐỊNH MỚI: Chỉ dành riêng cho TOP 1 donate khi tổng coin >= cfg.slimeTier5
  const qualifiesTop1 = isTop1 !== undefined ? Boolean(isTop1) : true;
  let tier = 1;
  if (qualifiesTop1 && coins >= cfg.slimeTier5) {
    tier = 5;
  } else if (coins >= cfg.slimeTier4) {
    tier = 4;
  } else if (coins >= cfg.slimeTier3) {
    tier = 3;
  } else if (coins >= cfg.slimeTier2) {
    tier = 2;
  } else {
    tier = 1;
  }

  // 2. Vòng tròn dưới chân (0 to 3 vòng tĩnh)
  let footRings = 0;
  if (coins >= cfg.footRing3) {
    footRings = 3; // Trắng + Vàng + Cam
  } else if (coins >= cfg.footRing2) {
    footRings = 2; // Trắng + Vàng
  } else if (coins >= cfg.footRing1) {
    footRings = 1; // Trắng
  } else {
    footRings = 0;
  }

  // 3. Hệ thống 3 Aura quanh thân (Tím -> Cam -> Vàng)
  // Chỉ duy nhất Aura Vàng có hiệu ứng mini bubble sủi lên
  let auraType = null;
  if (coins >= cfg.bodyGoldenAura) {
    auraType = 'gold';
  } else if (coins >= cfg.bodyOrangeAura) {
    auraType = 'orange';
  } else if (coins >= cfg.bodyPurpleAura) {
    auraType = 'purple';
  }

  const hasBodyAura = auraType !== null;

  return {
    tier,
    footRings,
    auraType,
    hasBodyAura,
    floorColor: 'default' // Đã bỏ hiệu ứng đổi màu ô sàn
  };
}
