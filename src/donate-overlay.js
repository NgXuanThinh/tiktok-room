// src/donate-overlay.js
// 2D Cinematic Donate Overlay Engine
// GPU-composited CSS layer + single Canvas 2D for all particle FX.
// Runs independently of the WebGL render loop, 0% CPU when idle (display:none).

/**
 * Coin→FX mapping table. Single source of truth for all donate tiers.
 * @type {Array<{min:number, max:number, subType:string, orbitRings:number, orbitCoins:number, orbitR:number, duration:number, sfx:string, camPreset:string}>}
 */
export const DONATE_FX_MAP = [
  { min: 1,    max: 1,    subType: 'drop_single',   orbitRings: 0, orbitCoins: 0,  orbitR: 0,    duration: 1.0, sfx: 'coin',         camPreset: null },
  { min: 2,    max: 9,    subType: 'drop_cascade',  orbitRings: 0, orbitCoins: 0,  orbitR: 0,    duration: 2.0, sfx: 'coin',         camPreset: null },
  { min: 10,   max: 19,   subType: 'drop_burst',    orbitRings: 0, orbitCoins: 0,  orbitR: 0,    duration: 2.0, sfx: 'coin',         camPreset: null },
  { min: 20,   max: 29,   subType: 'orbit_narrow',  orbitRings: 1, orbitCoins: 8,  orbitR: 0.85, duration: 2.0, sfx: 'bassBoom',     camPreset: null },
  { min: 30,   max: 49,   subType: 'orbit_narrow',  orbitRings: 1, orbitCoins: 12, orbitR: 1.10, duration: 2.5, sfx: 'bassBoom',     camPreset: null },
  { min: 50,   max: 79,   subType: 'orbit_double',  orbitRings: 2, orbitCoins: 20, orbitR: 1.45, duration: 3.0, sfx: 'bassBoom',     camPreset: null },
  { min: 80,   max: 100,  subType: 'orbit_triple',  orbitRings: 3, orbitCoins: 36, orbitR: 1.85, duration: 3.5, sfx: 'bassBoom',     camPreset: null },
  { min: 101,  max: 499,  subType: 'orbit_triple',  orbitRings: 3, orbitCoins: 36, orbitR: 2.0,  duration: 4.0, sfx: 'bassBoom',     camPreset: null },
  { min: 500,  max: 699,  subType: 'vip_rain',      orbitRings: 0, orbitCoins: 0,  orbitR: 0,    duration: 2.5, sfx: 'goldChime',    camPreset: 'cinematicVip' },
  { min: 700,  max: 999,  subType: 'vip_love',      orbitRings: 0, orbitCoins: 0,  orbitR: 0,    duration: 3.2, sfx: 'heartWhoosh',  camPreset: 'cinematicVip' },
  { min: 1000, max: 4999, subType: 'vip_disco',     orbitRings: 0, orbitCoins: 0,  orbitR: 0,    duration: 3.6, sfx: 'discoLaser',   camPreset: 'cinematicVip' },
  { min: 5000, max: Infinity, subType: 'vip_queen', orbitRings: 0, orbitCoins: 0,  orbitR: 0,    duration: 4.0, sfx: 'royalFanfare', camPreset: 'cinematicVip' }
];

/**
 * Resolves the FX config for a given coin amount.
 * @param {number} coins
 * @returns {object} FX config entry from DONATE_FX_MAP
 */
export function resolveFxConfig(coins) {
  for (const entry of DONATE_FX_MAP) {
    if (coins >= entry.min && coins <= entry.max) return entry;
  }
  return DONATE_FX_MAP[0];
}

// ─────────────────────────────────────────────────────────────
// INTERRUPT POLICY
// ─────────────────────────────────────────────────────────────
// Small (<=100 coin): non-interrupting — blend jump count, additive coin drop
// VIP (500+ coin):    FIFO queue — never interrupt, compress if queue > 2 items
// ─────────────────────────────────────────────────────────────

export class DonateOverlay {
  /**
   * @param {object} opts
   * @param {HTMLElement} opts.container - The DOM container (usually document.body or the app div)
   * @param {import('./scene-manager.js').SceneManager} opts.sceneManager
   * @param {object} opts.audioSystem - AudioSystem instance with playSfx()
   * @param {object} [opts.avatarManager] - AvatarManager instance (optional)
   */
  constructor({ container, sceneManager, audioSystem, avatarManager = null }) {
    this.container = container;
    this.sceneManager = sceneManager;
    this.audioSystem = audioSystem;
    this.avatarManager = avatarManager;

    /** @type {Array<{coins:number, user:object, donorMeshPos:THREE.Vector3|null}>} */
    this._vipQueue = [];
    this._isVipPlaying = false;
    this._animFrame = null;
    this._currentTimeout = null;

    this._buildDOM();
  }

  // ─── DOM Construction ────────────────────────────────────────

  _buildDOM() {
    // Outer overlay — full viewport, pointer-events:none when idle
    this.overlay = document.createElement('div');
    this.overlay.id = 'cinematic-overlay';
    Object.assign(this.overlay.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '9999',
      display: 'none',
      pointerEvents: 'none',
      willChange: 'transform',
      overflow: 'hidden'
    });

    // Single Canvas 2D for ALL particle FX (hearts, rain, lasers, diamonds)
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
    this.ctx2d = this.canvas.getContext('2d');
    this.overlay.appendChild(this.canvas);

    // Center stage: avatar + nickname + gift label
    this.stage = document.createElement('div');
    Object.assign(this.stage.style, {
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
      willChange: 'transform, opacity'
    });

    // Avatar image element
    this.avatarImg = document.createElement('img');
    this.avatarImg.style.cssText = 'border-radius:50%;object-fit:cover;display:block;';
    this.avatarImg.onerror = () => this._applyFallbackAvatar();

    // Avatar ring/rim canvas (animated border)
    this.rimCanvas = document.createElement('canvas');
    this.rimCtx = this.rimCanvas.getContext('2d');
    this.rimCanvas.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;';

    // Avatar wrapper
    this.avatarWrap = document.createElement('div');
    this.avatarWrap.style.cssText = 'position:relative;display:flex;align-items:center;justify-content:center;';
    this.avatarWrap.appendChild(this.avatarImg);
    this.avatarWrap.appendChild(this.rimCanvas);

    // Chibi Slime Mascot canvas (procedural, matches donor's slime palette)
    this.chibiCanvas = document.createElement('canvas');
    this.chibiCanvas.width = 80;
    this.chibiCanvas.height = 80;
    this.chibiCanvas.style.cssText = 'position:absolute;bottom:-10px;right:-30px;pointer-events:none;image-rendering:pixelated;';

    // Nickname label
    this.nicknameEl = document.createElement('div');
    Object.assign(this.nicknameEl.style, {
      color: '#fff',
      fontSize: '20px',
      fontWeight: '700',
      fontFamily: '"Segoe UI", sans-serif',
      textShadow: '0 0 12px rgba(255,215,0,0.9)',
      textAlign: 'center',
      maxWidth: '300px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    });

    // Gift label
    this.giftLabelEl = document.createElement('div');
    Object.assign(this.giftLabelEl.style, {
      color: '#ffd700',
      fontSize: '15px',
      fontWeight: '600',
      fontFamily: '"Segoe UI", sans-serif',
      textAlign: 'center',
      textShadow: '0 0 8px rgba(255,215,0,0.7)'
    });

    // VIP banner (Drama Queen / special text)
    this.bannerEl = document.createElement('div');
    Object.assign(this.bannerEl.style, {
      display: 'none',
      padding: '8px 20px',
      background: 'linear-gradient(90deg,#b8860b,#ffd700,#b8860b)',
      border: '2px solid #ffd700',
      borderRadius: '8px',
      color: '#1a0a00',
      fontSize: '14px',
      fontWeight: '900',
      letterSpacing: '1.5px',
      textAlign: 'center',
      boxShadow: '0 0 20px rgba(255,215,0,0.6)'
    });

    this.avatarWrap.appendChild(this.chibiCanvas);
    this.stage.appendChild(this.avatarWrap);
    this.stage.appendChild(this.nicknameEl);
    this.stage.appendChild(this.giftLabelEl);
    this.stage.appendChild(this.bannerEl);
    this.overlay.appendChild(this.stage);

    this.container.appendChild(this.overlay);

    // Keep canvas sized to viewport
    this._resizeCanvas();
    window.addEventListener('resize', () => this._resizeCanvas());
  }

  _resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.rimCanvas.width = this._avatarSize + 24;
    this.rimCanvas.height = this._avatarSize + 24;
  }

  // ─── Public API ───────────────────────────────────────────────

  /**
   * Main entry point. Routes coins to small (non-interrupting) or VIP (FIFO queue).
   * @param {object} opts
   * @param {number} opts.coins
   * @param {object} opts.user - { id, username, nickname, avatarUrl }
   * @param {string} [opts.giftName] - Display name of the gift
   * @param {THREE.Vector3|null} [opts.donorMeshPos] - World position of donating Slime (for fly-back)
   * @param {string|null} [opts.slimePaletteKey] - 'cyan'|'pink'|'lime' for chibi mascot color
   */
  trigger({ coins, user, giftName = '', donorMeshPos = null, slimePaletteKey = 'cyan' }) {
    const cfg = resolveFxConfig(coins);

    if (coins < 500) {
      // Non-VIP: small effects handled by 3D scene only; overlay just draws coin FX on canvas
      // These are very short (<4s) and non-interrupting — just show coin particle canvas briefly
      this._playSmallFx(cfg, coins, donorMeshPos);
      return;
    }

    // VIP (500+): FIFO queue
    this._vipQueue.push({ coins, user, giftName, donorMeshPos, slimePaletteKey, cfg });

    // Compress queue if storm (>2 waiting): cap total queue at 3 items max
    if (this._vipQueue.length > 3) {
      this._vipQueue.splice(1, this._vipQueue.length - 3);
    }

    if (!this._isVipPlaying) {
      this._drainVipQueue();
    }
  }

  // ─── Small FX (canvas only, no overlay stage) ─────────────────

  _playSmallFx(cfg, coins, meshPos) {
    // Show canvas briefly for coin particle rain
    this.overlay.style.display = 'block';
    this._resizeCanvas();

    const particles = this._spawnCoinParticles(cfg.subType, coins, meshPos);
    const duration = cfg.duration * 1000;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const pct = Math.min(1, elapsed / duration);

      this.ctx2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this._updateAndDrawParticles(particles, elapsed / 1000, pct);

      if (pct < 1) {
        this._animFrame = requestAnimationFrame(tick);
      } else {
        this.ctx2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.overlay.style.display = 'none';
      }
    };
    requestAnimationFrame(tick);
  }

  // ─── VIP Queue Drain ──────────────────────────────────────────

  _drainVipQueue() {
    if (this._vipQueue.length === 0) {
      this._isVipPlaying = false;
      return;
    }
    this._isVipPlaying = true;
    const item = this._vipQueue.shift();
    this._playVipFx(item, () => this._drainVipQueue());
  }

  // ─── VIP FX Sequence ─────────────────────────────────────────

  _playVipFx({ coins, user, giftName, donorMeshPos, slimePaletteKey, cfg }, onComplete) {
    this._avatarSize = this._calcAvatarSize(coins);
    this._resizeCanvas();

    // Camera
    if (cfg.camPreset && this.sceneManager) {
      if (donorMeshPos) {
        this.sceneManager.startDonateShowcase(donorMeshPos);
      } else {
        this.sceneManager.setCameraPreset(cfg.camPreset);
      }
    }

    // Audio
    if (this.audioSystem && cfg.sfx) {
      this.audioSystem.playSfx(cfg.sfx);
    }

    // Setup stage
    this._setupStage(user, giftName, coins, cfg.subType, slimePaletteKey);

    // Show overlay
    this.overlay.style.display = 'block';
    this.stage.style.opacity = '0';
    this.stage.style.transform = 'translate(-50%, -50%) scale(0.6)';

    // Animate in (Cubic ease-out over 0.4s)
    const animIn = this.stage.animate([
      { opacity: 0, transform: 'translate(-50%, -50%) scale(0.6)' },
      { opacity: 1, transform: 'translate(-50%, -50%) scale(1.0)' }
    ], { duration: 400, easing: 'cubic-bezier(0.22,1,0.36,1)', fill: 'forwards' });

    // Start particle canvas animation
    const durationMs = cfg.duration * 1000;
    const start = performance.now();
    const particles = this._spawnVipParticles(cfg.subType, coins);

    let rimAngle = 0;
    const rimColor = this._getRimStyle(cfg.subType);

    const tick = (now) => {
      const elapsed = now - start;
      const pct = Math.min(1, elapsed / durationMs);

      this.ctx2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this._updateAndDrawParticles(particles, elapsed / 1000, pct);

      // Animated rim
      rimAngle += 0.03;
      this._drawRim(rimAngle, rimColor, this._avatarSize, cfg.subType);

      if (pct < 1) {
        this._animFrame = requestAnimationFrame(tick);
      } else {
        this._beginFlyBack(donorMeshPos, cfg.duration, onComplete);
      }
    };
    requestAnimationFrame(tick);
  }

  // ─── Fly-back: 2D card shrinks and flies to Slime position ───

  _beginFlyBack(donorMeshPos, totalDuration, onComplete) {
    const flyDuration = 500; // 0.5s
    const start = performance.now();

    // Calculate target screen pixel position from world coords
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight * 0.75;

    if (donorMeshPos && this.sceneManager) {
      const sc = this.sceneManager.getScreenCoords(donorMeshPos);
      targetX = sc.x;
      targetY = sc.y;
    }

    const startRect = this.stage.getBoundingClientRect();
    const startX = startRect.left + startRect.width / 2;
    const startY = startRect.top + startRect.height / 2;

    const flyAnim = this.stage.animate([
      { transform: 'translate(-50%,-50%) scale(1.0)', opacity: 1 },
      {
        transform: `translate(${targetX - window.innerWidth / 2}px, ${targetY - window.innerHeight / 2}px) scale(0.05)`,
        opacity: 0
      }
    ], { duration: flyDuration, easing: 'cubic-bezier(0.55,0,1,0.45)', fill: 'forwards' });

    flyAnim.onfinish = () => {
      // Restore camera
      if (this.sceneManager) {
        this.sceneManager.endDonateShowcase();
      }
      this.overlay.style.display = 'none';
      this.ctx2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.bannerEl.style.display = 'none';
      onComplete();
    };
  }

  // ─── Stage Setup ─────────────────────────────────────────────

  _setupStage(user, giftName, coins, subType, slimePaletteKey) {
    const size = this._avatarSize;

    // Avatar image
    this.avatarImg.src = `/api/avatar?url=${encodeURIComponent(user.avatarUrl || '')}&username=${encodeURIComponent(user.username || 'User')}&userId=${encodeURIComponent(user.id || '0')}`;
    this.avatarImg.width = size;
    this.avatarImg.height = size;
    Object.assign(this.avatarImg.style, {
      width: size + 'px',
      height: size + 'px',
      border: 'none',
      boxShadow: 'none'
    });

    this.avatarWrap.style.width = (size + 24) + 'px';
    this.avatarWrap.style.height = (size + 24) + 'px';

    // Nickname & gift label
    this.nicknameEl.textContent = `✨ @${user.nickname || user.username} ✨`;
    this.giftLabelEl.textContent = `🎁 Tặng: ${giftName || '?'} (${coins}🪙)`;

    // VIP banner
    if (subType === 'vip_queen') {
      this.bannerEl.style.display = 'block';
      this.bannerEl.textContent = '👑 DRAMA QUEEN — VIP ĐẲNG CẤP 👑';
    } else {
      this.bannerEl.style.display = 'none';
    }

    // Chibi slime mascot
    this._drawChibiSlime(slimePaletteKey);
  }

  _calcAvatarSize(coins) {
    if (coins >= 5000) return 185;
    if (coins >= 1000) return 165;
    if (coins >= 700) return 150;
    return 135;
  }

  _applyFallbackAvatar() {
    // Generate SVG data-URI gradient avatar with initials
    const name = this.nicknameEl.textContent.replace(/[^a-zA-Z0-9À-ỹ ]/g, '').trim();
    const initials = name.split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase() || '?';
    const hue = Math.abs(name.charCodeAt(0) * 37 + name.charCodeAt(1) * 11) % 360;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>
      <defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' stop-color='hsl(${hue},70%,45%)'/>
        <stop offset='100%' stop-color='hsl(${(hue+40)%360},80%,60%)'/>
      </linearGradient></defs>
      <circle cx='100' cy='100' r='100' fill='url(#g)'/>
      <text x='100' y='120' font-size='72' font-family='sans-serif' text-anchor='middle' fill='white' font-weight='bold'>${initials}</text>
    </svg>`;
    this.avatarImg.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  // ─── Chibi Slime Mascot (procedural Canvas 2D, zero-asset) ───

  _drawChibiSlime(paletteKey) {
    const PALETTES = {
      cyan:    { body: '#00f2fe', glow: '#00aacc', eye: '#fff', blush: '#ff007f' },
      pink:    { body: '#ff0874', glow: '#aa0050', eye: '#fff', blush: '#ff66cc' },
      magenta: { body: '#ff0874', glow: '#aa0050', eye: '#fff', blush: '#ff66cc' },
      lime:    { body: '#00ff88', glow: '#00aa55', eye: '#fff', blush: '#ffaa00' }
    };
    const pal = PALETTES[paletteKey] || PALETTES.cyan;
    const c = this.chibiCanvas;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 80, 80);

    // Body glow
    const grd = ctx.createRadialGradient(40, 50, 5, 40, 50, 35);
    grd.addColorStop(0, pal.body);
    grd.addColorStop(1, pal.glow);
    ctx.beginPath();
    ctx.ellipse(40, 52, 28, 22, 0, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();

    // Eyes
    ctx.beginPath();
    ctx.arc(32, 46, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a2e';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(48, 46, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a2e';
    ctx.fill();

    // Eye shine
    ctx.beginPath();
    ctx.arc(33.5, 44.5, 2, 0, Math.PI * 2);
    ctx.fillStyle = pal.eye;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(49.5, 44.5, 2, 0, Math.PI * 2);
    ctx.fillStyle = pal.eye;
    ctx.fill();

    // Blush
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.ellipse(27, 51, 5, 3, 0, 0, Math.PI * 2);
    ctx.fillStyle = pal.blush;
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(53, 51, 5, 3, 0, 0, Math.PI * 2);
    ctx.fillStyle = pal.blush;
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Smile
    ctx.beginPath();
    ctx.arc(40, 50, 7, 0.2, Math.PI - 0.2);
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // ─── Rim Animation ────────────────────────────────────────────

  _getRimStyle(subType) {
    const styles = {
      vip_rain:  { grad: ['#ffd700', '#ffee88', '#ffd700'], glow: '#ffd700' },
      vip_love:  { grad: ['#ff69b4', '#ff0874', '#ff69b4'], glow: '#ff4488' },
      vip_disco: { grad: ['#e0e0e0', '#ffffff', '#c0c0c0'], glow: '#ffffff' },
      vip_queen: { grad: ['#ffd700', '#00cc77', '#cc0033', '#ffd700'], glow: '#ffd700' }
    };
    return styles[subType] || styles.vip_rain;
  }

  _drawRim(angle, rimStyle, avatarSize, subType) {
    const ctx = this.rimCtx;
    const c = this.rimCanvas;
    const cx = c.width / 2;
    const cy = c.height / 2;
    const r = avatarSize / 2 + 6;

    ctx.clearRect(0, 0, c.width, c.height);

    // Rotating gradient rim
    const grd = ctx.createConicGradient(angle, cx, cy);
    rimStyle.grad.forEach((color, i) => {
      grd.addColorStop(i / (rimStyle.grad.length - 1), color);
    });

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = grd;
    ctx.lineWidth = subType === 'vip_queen' ? 6 : 4;
    ctx.shadowColor = rimStyle.glow;
    ctx.shadowBlur = 16;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Position rim canvas over avatar
    Object.assign(this.rimCanvas.style, {
      width: c.width + 'px',
      height: c.height + 'px',
      top: '-12px',
      left: '-12px'
    });
  }

  // ─── Coin Particle Systems ─────────────────────────────────────

  _spawnCoinParticles(subType, coins, meshPos) {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const particles = [];

    if (subType === 'drop_single') {
      particles.push({ x: cx, y: 0, vx: 0, vy: 2.5, r: 12, life: 0, maxLife: 1.0, color: '#ffd700', alpha: 1 });
    } else if (subType === 'drop_cascade') {
      // Staggered spawn: each coin delayed by index * 0.2s
      const count = Math.min(coins, 10);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: cx + (Math.random() - 0.5) * 160,
          y: -20 - i * 18,
          vx: (Math.random() - 0.5) * 1.5,
          vy: 2.0 + Math.random() * 1.5,
          r: 10,
          life: 0,
          maxLife: 1.0 + i * 0.15,
          spawnDelay: i * 0.18,
          color: '#ffd700',
          alpha: 1
        });
      }
    } else if (subType === 'drop_burst') {
      // 10 coins burst spread across floor
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        particles.push({
          x: cx + Math.cos(angle) * 60,
          y: cy - 80,
          vx: Math.cos(angle) * 1.8,
          vy: 2.0 + Math.random(),
          r: 11,
          life: 0,
          maxLife: 1.2,
          spawnDelay: i * 0.08,
          color: '#ffd700',
          alpha: 1
        });
      }
    }

    return particles;
  }

  _spawnVipParticles(subType, coins) {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const particles = [];

    const COUNT_MAP = { vip_rain: 60, vip_love: 40, vip_disco: 80, vip_queen: 120 };
    const count = COUNT_MAP[subType] || 50;

    for (let i = 0; i < count; i++) {
      let p = { life: 0, maxLife: 1.5 + Math.random(), spawnDelay: Math.random() * 1.5, alpha: 0 };

      if (subType === 'vip_rain') {
        // Money rain: dollar signs falling
        p.x = Math.random() * window.innerWidth;
        p.y = -30;
        p.vx = (Math.random() - 0.5) * 1.5;
        p.vy = 2.5 + Math.random() * 2;
        p.r = 10 + Math.random() * 8;
        p.color = Math.random() > 0.5 ? '#ffd700' : '#a8e063';
        p.shape = Math.random() > 0.5 ? 'coin' : 'bar';
      } else if (subType === 'vip_love') {
        // Heart bubbles rising
        p.x = cx + (Math.random() - 0.5) * 400;
        p.y = window.innerHeight + 20;
        p.vx = (Math.random() - 0.5) * 1.5;
        p.vy = -(1.5 + Math.random() * 2);
        p.r = 8 + Math.random() * 12;
        p.color = `hsl(${330 + Math.random() * 60},100%,70%)`;
        p.shape = 'heart';
      } else if (subType === 'vip_disco') {
        // Laser/music notes
        p.x = cx + (Math.random() - 0.5) * 100;
        p.y = cy;
        const a = Math.random() * Math.PI * 2;
        const sp = 3 + Math.random() * 4;
        p.vx = Math.cos(a) * sp;
        p.vy = Math.sin(a) * sp;
        p.r = 4 + Math.random() * 6;
        p.color = `hsl(${Math.random() * 360},100%,70%)`;
        p.shape = 'circle';
      } else if (subType === 'vip_queen') {
        // Diamond rain
        p.x = Math.random() * window.innerWidth;
        p.y = -20;
        p.vx = (Math.random() - 0.5) * 2;
        p.vy = 1.8 + Math.random() * 2.5;
        p.r = 7 + Math.random() * 10;
        p.color = `hsl(${Math.random() * 60 + 190},80%,80%)`;
        p.shape = 'diamond';
      }

      particles.push(p);
    }
    return particles;
  }

  _updateAndDrawParticles(particles, elapsed, pct) {
    const ctx = this.ctx2d;
    for (const p of particles) {
      if (p.spawnDelay && elapsed < p.spawnDelay) continue;

      p.life += 0.016;
      const lifePct = Math.min(1, p.life / p.maxLife);
      p.alpha = lifePct < 0.1 ? lifePct / 0.1 : lifePct > 0.8 ? (1 - lifePct) / 0.2 : 1;

      p.x += p.vx;
      p.y += p.vy;
      if (p.shape !== 'heart') p.vy += 0.08; // gravity for non-hearts

      ctx.save();
      ctx.globalAlpha = p.alpha * (1 - pct * 0.3);
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;

      if (!p.shape || p.shape === 'coin') {
        // Golden coin circle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha *= 0.6;
        ctx.fillStyle = '#fffde0';
        ctx.beginPath();
        ctx.arc(p.x - p.r * 0.25, p.y - p.r * 0.25, p.r * 0.3, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'bar') {
        // Gold bar rectangle
        ctx.fillRect(p.x - p.r, p.y - p.r * 0.5, p.r * 2, p.r);
      } else if (p.shape === 'heart') {
        // Heart shape
        ctx.beginPath();
        const s = p.r;
        ctx.moveTo(p.x, p.y + s * 0.3);
        ctx.bezierCurveTo(p.x, p.y, p.x - s, p.y, p.x - s, p.y - s * 0.5);
        ctx.bezierCurveTo(p.x - s, p.y - s * 1.2, p.x, p.y - s * 1.2, p.x, p.y - s * 0.5);
        ctx.bezierCurveTo(p.x, p.y - s * 1.2, p.x + s, p.y - s * 1.2, p.x + s, p.y - s * 0.5);
        ctx.bezierCurveTo(p.x + s, p.y, p.x, p.y, p.x, p.y + s * 0.3);
        ctx.fill();
      } else if (p.shape === 'diamond') {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - p.r);
        ctx.lineTo(p.x + p.r * 0.6, p.y);
        ctx.lineTo(p.x, p.y + p.r);
        ctx.lineTo(p.x - p.r * 0.6, p.y);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // ─── Dispose ─────────────────────────────────────────────────

  dispose() {
    if (this._animFrame) cancelAnimationFrame(this._animFrame);
    if (this._currentTimeout) clearTimeout(this._currentTimeout);
    this.overlay.remove();
  }
}
