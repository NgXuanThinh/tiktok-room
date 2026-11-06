// src/ui-overlay.js - Responsive OBS HUD overlay & Streamer Admin Drawer
export class UiOverlay {
  constructor(options = {}) {
    this.ws = options.ws || null;
    this.audioSystem = options.audioSystem || null;
    this.sceneManager = options.sceneManager || null;
    this.clubEnvironment = options.clubEnvironment || null;

    this.hypePoints = 0;
    this.maxHype = 1000;
    this.isFrenzy = false;
    this.frenzyTimer = null;

    this.topDonors = [];
    this.adminOpen = false;

    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.leaderListEl = document.getElementById('leaderboard-list');
    this.hypeFillEl = document.getElementById('hype-fill');
    this.hypeTextEl = document.getElementById('hype-text');
    this.giftBannerEl = document.getElementById('gift-banner');
    this.bannerAvatarEl = document.getElementById('banner-avatar');
    this.bannerTitleEl = document.getElementById('banner-title');
    this.bannerSubEl = document.getElementById('banner-sub');
    this.adminDrawerEl = document.getElementById('admin-drawer');
    this.adminToggleBtn = document.getElementById('admin-toggle-btn');
    this.tiktokStatusEl = document.getElementById('tiktok-status-badge');
  }

  bindEvents() {
    // Hotkeys: 'H' or 'Tab' toggles Admin Drawer
    window.addEventListener('keydown', (e) => {
      if (e.key === 'h' || e.key === 'H' || e.key === 'Tab') {
        if (e.target.tagName !== 'INPUT') {
          e.preventDefault();
          this.toggleAdminDrawer();
        }
      }
    });

    if (this.adminToggleBtn) {
      this.adminToggleBtn.addEventListener('click', () => this.toggleAdminDrawer());
    }

    // Camera preset buttons
    document.querySelectorAll('[data-camera]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.getAttribute('data-camera');
        if (this.sceneManager) this.sceneManager.setCameraPreset(preset);
      });
    });

    // Chroma & Alpha buttons
    const chromaBtn = document.getElementById('btn-chroma');
    if (chromaBtn) {
      chromaBtn.addEventListener('click', () => {
        if (this.sceneManager) this.sceneManager.toggleChromaKey();
      });
    }

    const alphaBtn = document.getElementById('btn-alpha');
    if (alphaBtn) {
      alphaBtn.addEventListener('click', () => {
        if (this.sceneManager) this.sceneManager.toggleAlpha();
      });
    }

    // Audio controls
    const volumeSlider = document.getElementById('volume-slider');
    if (volumeSlider) {
      volumeSlider.addEventListener('input', (e) => {
        if (this.audioSystem) this.audioSystem.setVolume(parseFloat(e.target.value));
      });
    }

    const sfxBtn = document.getElementById('btn-mute-sfx');
    if (sfxBtn) {
      sfxBtn.addEventListener('click', () => {
        if (this.audioSystem) {
          const muted = this.audioSystem.toggleMute();
          sfxBtn.textContent = muted ? 'Unmute SFX' : 'Mute SFX';
        }
      });
    }

    // TikTok Connect
    const connectBtn = document.getElementById('btn-tiktok-connect');
    const usernameInput = document.getElementById('tiktok-username-input');
    if (connectBtn && usernameInput) {
      connectBtn.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        if (username && this.ws) {
          this.ws.send(JSON.stringify({ type: 'tiktok_connect', username }));
        }
      });
    }

    const disconnectBtn = document.getElementById('btn-tiktok-disconnect');
    if (disconnectBtn) {
      disconnectBtn.addEventListener('click', () => {
        if (this.ws) {
          this.ws.send(JSON.stringify({ type: 'tiktok_disconnect' }));
        }
      });
    }

    // Mock Testing Buttons
    this.bindMockButton('mock-likes', () => {
      if (this.ws) this.ws.send(JSON.stringify({ type: 'mock_trigger', action: 'likes', count: 10 }));
    });
    this.bindMockButton('mock-chat', () => {
      if (this.ws) this.ws.send(JSON.stringify({ type: 'mock_trigger', action: 'chat' }));
    });
    this.bindMockButton('mock-gift-tier1', () => {
      if (this.ws) this.ws.send(JSON.stringify({ type: 'mock_trigger', action: 'gift', tier: 1 }));
    });
    this.bindMockButton('mock-gift-tier2', () => {
      if (this.ws) this.ws.send(JSON.stringify({ type: 'mock_trigger', action: 'gift', tier: 2 }));
    });
    this.bindMockButton('mock-gift-tier3', () => {
      if (this.ws) this.ws.send(JSON.stringify({ type: 'mock_trigger', action: 'gift', tier: 3 }));
    });
  }

  bindMockButton(id, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  }

  toggleAdminDrawer() {
    this.adminOpen = !this.adminOpen;
    if (this.adminDrawerEl) {
      if (this.adminOpen) {
        this.adminDrawerEl.classList.add('open');
      } else {
        this.adminDrawerEl.classList.remove('open');
      }
    }
  }

  updateTikTokStatus(status) {
    if (!this.tiktokStatusEl) return;
    if (status.isConnected) {
      this.tiktokStatusEl.textContent = `LIVE: @${status.username} (${status.viewerCount || 0} viewers)`;
      this.tiktokStatusEl.style.color = '#43e97b';
    } else {
      this.tiktokStatusEl.textContent = 'Disconnected';
      this.tiktokStatusEl.style.color = '#ff007f';
    }
  }

  addHype(points = 1) {
    if (this.isFrenzy) return;
    this.hypePoints = Math.min(this.maxHype, this.hypePoints + points);
    const pct = Math.floor((this.hypePoints / this.maxHype) * 100);

    if (this.hypeFillEl) this.hypeFillEl.style.width = `${pct}%`;
    if (this.hypeTextEl) this.hypeTextEl.textContent = `${pct}%`;

    if (this.hypePoints >= this.maxHype) {
      this.triggerFrenzyMode();
    }
  }

  triggerFrenzyMode() {
    this.isFrenzy = true;
    if (this.hypeTextEl) this.hypeTextEl.textContent = 'FRENZY MODE!';
    document.body.classList.add('frenzy-active');

    if (this.audioSystem) {
      this.audioSystem.playSfx('airhorn');
    }

    if (this.clubEnvironment) {
      this.clubEnvironment.triggerFireworks(3);
    }

    this.frenzyTimer = setTimeout(() => {
      this.isFrenzy = false;
      this.hypePoints = 0;
      if (this.hypeFillEl) this.hypeFillEl.style.width = '0%';
      if (this.hypeTextEl) this.hypeTextEl.textContent = '0%';
      document.body.classList.remove('frenzy-active');
    }, 15000);
  }

  showGiftAlert(giftEvent) {
    if (!this.giftBannerEl) return;
    const user = giftEvent.user || {};
    const data = giftEvent.data || {};

    if (this.bannerTitleEl) {
      this.bannerTitleEl.textContent = `${user.nickname || user.username} sent ${data.giftName || 'Gift'}!`;
    }
    if (this.bannerSubEl) {
      this.bannerSubEl.textContent = `${data.totalCoins || data.diamondCount} Coins (${data.repeatCount || 1}x)`;
    }

    if (this.bannerAvatarEl) {
      this.bannerAvatarEl.src = `/api/avatar?name=${encodeURIComponent(user.username || '')}&url=${encodeURIComponent(user.avatarUrl || '')}`;
    }

    this.giftBannerEl.classList.add('show');
    clearTimeout(this.bannerTimeout);
    this.bannerTimeout = setTimeout(() => {
      this.giftBannerEl.classList.remove('show');
    }, 4000);

    // Audio SFX trigger based on tier
    if (this.audioSystem) {
      if (data.tier === 1) this.audioSystem.playSfx('coin');
      else if (data.tier === 2) {
        this.audioSystem.playSfx('coin');
        this.audioSystem.playSfx('boom');
      } else {
        this.audioSystem.playSfx('airhorn');
        this.audioSystem.playSfx('boom');
      }
    }
  }

  updateLeaderboard(donors = []) {
    if (!this.leaderListEl) return;
    this.leaderListEl.innerHTML = '';

    const top3 = donors.slice(0, 3);
    for (let i = 0; i < top3.length; i++) {
      const d = top3[i];
      const row = document.createElement('div');
      row.className = 'leader-item';

      const rankClass = `rank-${i + 1}`;
      const avatarSrc = `/api/avatar?name=${encodeURIComponent(d.username || '')}&url=${encodeURIComponent(d.avatarUrl || '')}`;

      row.innerHTML = `
        <div class="rank-badge ${rankClass}">#${i + 1}</div>
        <img class="leader-avatar" src="${avatarSrc}" alt="${d.username}" />
        <span class="leader-name">${d.nickname || d.username}</span>
        <span class="leader-coins">★ ${d.totalCoins}</span>
      `;
      this.leaderListEl.appendChild(row);
    }
  }
}
