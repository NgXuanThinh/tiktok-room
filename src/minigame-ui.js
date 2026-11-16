// src/minigame-ui.js - DOM management for Minigame Banner, Minimal Tally View, and Corner Tiebreak Badge
import { MINIGAME_AVAILABLE_COLORS } from './minigame-constants.js';

let bannerEl = null;
let badgeEl = null;

/**
 * Initializes or resolves DOM element references for Minigame HUD.
 */
export function initMinigameUI() {
  if (typeof document === 'undefined') return;
  bannerEl = document.getElementById('minigame-banner');
  badgeEl = document.getElementById('minigame-tiebreak-badge');

  if (!badgeEl) {
    badgeEl = document.createElement('div');
    badgeEl.id = 'minigame-tiebreak-badge';
    badgeEl.className = 'glass-panel minigame-corner-badge';
    badgeEl.style.display = 'none';
    document.body.appendChild(badgeEl);
  }

  if (!bannerEl) {
    bannerEl = document.createElement('div');
    bannerEl.id = 'minigame-banner';
    bannerEl.className = 'glass-panel minigame-banner';
    bannerEl.style.display = 'none';
    document.body.appendChild(bannerEl);
  }
}

/**
 * Updates the Corner Tie-Break Multiplier Badge.
 * e.g., [ ⚖️ 🔴 1.003x | 🟢 1.007x | 🔵 1.002x ]
 * @param {object} weights
 * @param {boolean} visible
 */
export function updateCornerTiebreakBadge(weights, visible = true) {
  if (typeof document === 'undefined') return;
  if (!badgeEl) initMinigameUI();
  if (!badgeEl) return;

  if (!visible || !weights) {
    badgeEl.style.display = 'none';
    return;
  }

  const redW = weights.red ? `${weights.red}x` : '1.000x';
  const greenW = weights.green ? `${weights.green}x` : '1.000x';
  const blueW = weights.blue ? `${weights.blue}x` : '1.000x';

  badgeEl.innerHTML = `
    <span class="badge-title">⚖️ Tie-break</span>
    <span class="badge-item red">🔴 ${redW}</span>
    <span class="badge-divider">|</span>
    <span class="badge-item green">🟢 ${greenW}</span>
    <span class="badge-divider">|</span>
    <span class="badge-item blue">🔵 ${blueW}</span>
  `;
  badgeEl.style.display = 'flex';
}

/**
 * Shows countdown before minigame starts.
 * @param {number} remainingSec
 */
export function showStartCountdownBanner(remainingSec) {
  if (typeof document === 'undefined') return;
  if (!bannerEl) initMinigameUI();
  if (!bannerEl) return;

  const mins = Math.floor(remainingSec / 60);
  const secs = Math.floor(remainingSec % 60);
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  bannerEl.className = 'glass-panel minigame-banner banner-countdown';
  bannerEl.innerHTML = `
    <div class="minigame-banner-body">
      <span class="banner-icon">🎮</span>
      <span class="banner-title">MINIGAME SINH TỒN</span>
      <span class="banner-sub">BẮT ĐẦU TRONG: <strong>${timeStr}</strong></span>
    </div>
  `;
  bannerEl.style.display = 'flex';
}

/**
 * Shows voting progress banner during round.
 * @param {number} roundNumber
 * @param {number} remainingSec
 * @param {number} totalSec
 */
export function showVotingBanner(roundNumber, remainingSec, totalSec) {
  if (typeof document === 'undefined') return;
  if (!bannerEl) initMinigameUI();
  if (!bannerEl) return;

  const progressPct = Math.max(0, Math.min(100, (remainingSec / totalSec) * 100));

  bannerEl.className = 'glass-panel minigame-banner banner-voting';
  bannerEl.innerHTML = `
    <div class="minigame-banner-body">
      <span class="banner-round-tag">ROUND ${roundNumber}</span>
      <span class="banner-action-text">CHỌN MÀU (!color)</span>
      <span class="banner-timer-badge">⏳ ${Math.ceil(remainingSec)}s</span>
    </div>
    <div class="minigame-progress-bg">
      <div class="minigame-progress-fill" style="width: ${progressPct}%;"></div>
    </div>
  `;
  bannerEl.style.display = 'flex';
}

/**
 * Shows minimal statistical tally with pulsing death color.
 * Format: "Round 1:   8 🔴 ☠️  |  5 🟢  |  3 🔵"
 * @param {number} roundNumber
 * @param {object} counts { green, red, blue }
 * @param {string} deathColor 'green' | 'red' | 'blue'
 */
export function showMinimalTallyBanner(roundNumber, counts, deathColor) {
  if (typeof document === 'undefined') return;
  if (!bannerEl) initMinigameUI();
  if (!bannerEl) return;

  const colors = ['red', 'green', 'blue'];
  const items = colors.map((colKey) => {
    const isDeath = colKey === deathColor;
    const num = counts[colKey] || 0;
    const emoji = MINIGAME_AVAILABLE_COLORS[colKey]?.emoji || '⚪';
    const skull = isDeath ? '<span class="death-skull">☠️</span>' : '';
    const cls = isDeath ? 'tally-item death-highlight' : 'tally-item';
    return `<span class="${cls}">${num} ${emoji} ${skull}</span>`;
  });

  bannerEl.className = 'glass-panel minigame-banner banner-tally';
  bannerEl.innerHTML = `
    <div class="minigame-tally-container">
      <span class="tally-round-label">Round ${roundNumber}:</span>
      ${items.join('<span class="tally-sep">|</span>')}
    </div>
  `;
  bannerEl.style.display = 'flex';
}

/**
 * Shows judgment laser active alert banner.
 * @param {string} deathColor
 */
export function showJudgmentBanner(deathColor) {
  if (typeof document === 'undefined') return;
  if (!bannerEl) initMinigameUI();
  if (!bannerEl) return;

  const colObj = MINIGAME_AVAILABLE_COLORS[deathColor];
  const name = colObj?.displayName || deathColor;
  const emoji = colObj?.emoji || '🔴';

  bannerEl.className = 'glass-panel minigame-banner banner-judgment';
  bannerEl.innerHTML = `
    <div class="minigame-banner-body">
      <span class="banner-icon">⚡</span>
      <span class="banner-title">PHÁN XÉT TỬ THẦN: ${emoji} ${name.toUpperCase()}!</span>
    </div>
  `;
  bannerEl.style.display = 'flex';
}

/**
 * Shows winner announcement banner.
 * @param {Array<{ userId: string, username: string }>} winners
 * @param {boolean} isCoChampions
 */
export function showWinnerBanner(winners, isCoChampions = false) {
  if (typeof document === 'undefined') return;
  if (!bannerEl) initMinigameUI();
  if (!bannerEl) return;

  const title = isCoChampions ? '👑 ĐỒNG QUÁN QUÂN SINH TỒN 👑' : '👑 QUÁN QUÂN SINH TỒN 👑';
  const names = winners.map((w) => w.username || w.userId || 'Viewer').join(' & ');

  bannerEl.className = 'glass-panel minigame-banner banner-winner';
  bannerEl.innerHTML = `
    <div class="minigame-banner-body">
      <span class="banner-title winner-glow">${title}</span>
      <span class="banner-winner-names">${names}</span>
    </div>
  `;
  bannerEl.style.display = 'flex';
}

/**
 * Shows no winner / all eliminated banner.
 */
export function showNoWinnerBanner() {
  if (typeof document === 'undefined') return;
  if (!bannerEl) initMinigameUI();
  if (!bannerEl) return;

  bannerEl.className = 'glass-panel minigame-banner banner-no-winner';
  bannerEl.innerHTML = `
    <div class="minigame-banner-body">
      <span class="banner-title">💀 TẤT CẢ ĐÃ BỊ TIÊU DIỆT!</span>
      <span class="banner-sub">KHÔNG CÓ NGƯỜI CHIẾN THẮNG</span>
    </div>
  `;
  bannerEl.style.display = 'flex';
}

/**
 * Shows a warning banner (e.g. not enough players on floor).
 * @param {string} msg
 * @param {number} autoHideMs
 */
export function showWarningBanner(msg, autoHideMs = 3500) {
  if (typeof document === 'undefined') return;
  if (!bannerEl) initMinigameUI();
  if (!bannerEl) return;

  bannerEl.className = 'glass-panel minigame-banner banner-no-winner';
  bannerEl.innerHTML = `
    <div class="minigame-banner-body">
      <span class="banner-title" style="color: #ffd700; font-size: 14px;">${msg}</span>
    </div>
  `;
  bannerEl.style.display = 'flex';

  if (autoHideMs > 0) {
    setTimeout(() => {
      if (bannerEl && bannerEl.classList.contains('banner-no-winner') && bannerEl.textContent.includes(msg)) {
        bannerEl.style.display = 'none';
      }
    }, autoHideMs);
  }
}

/**
 * Hides all minigame banners.
 */
export function hideMinigameBanner() {
  if (typeof document === 'undefined') return;
  if (bannerEl) bannerEl.style.display = 'none';
}
