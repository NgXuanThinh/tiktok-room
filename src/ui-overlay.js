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
    this.audioUnlockBannerEl = document.getElementById('audio-unlock-banner');
  }

  bindEvents() {
    // 1-Click Audio Unlock Prompt
    const unlockAudioHandler = async () => {
      if (this.audioSystem) {
        await this.audioSystem.unlockAudio();
      }
      if (this.audioUnlockBannerEl) {
        this.audioUnlockBannerEl.style.opacity = '0';
        setTimeout(() => {
          this.audioUnlockBannerEl.style.display = 'none';
        }, 400);
      }
      window.removeEventListener('click', unlockAudioHandler);
      window.removeEventListener('keydown', unlockAudioHandler);
    };
    window.addEventListener('click', unlockAudioHandler);
    window.addEventListener('keydown', unlockAudioHandler);

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

    // Camera Orbit Distance & Zoom Slider
    const distSlider = document.getElementById('camera-distance-slider');
    const distVal = document.getElementById('camera-distance-val');
    if (distSlider) {
      distSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (distVal) distVal.textContent = `${val.toFixed(1)}m`;
        if (this.sceneManager) this.sceneManager.setOrbitRadius(val);
      });
    }

    const setDistHelper = (val) => {
      if (distSlider) distSlider.value = val;
      if (distVal) distVal.textContent = `${val.toFixed(1)}m`;
      if (this.sceneManager) this.sceneManager.setOrbitRadius(val);
    };

    const closeBtn = document.getElementById('btn-cam-close');
    if (closeBtn) closeBtn.addEventListener('click', () => setDistHelper(7.0));
    const midBtn = document.getElementById('btn-cam-mid');
    if (midBtn) midBtn.addEventListener('click', () => setDistHelper(10.0));
    const wideBtn = document.getElementById('btn-cam-wide');
    if (wideBtn) wideBtn.addEventListener('click', () => setDistHelper(16.0));

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

    // Custom Mock Person Buttons
    this.bindMockButton('btn-mock-spawn', () => {
      const user = this.getCustomMockUser();
      if (this.ws) this.ws.send(JSON.stringify({ type: 'mock_trigger', action: 'spawn', user }));
    });
    this.bindMockButton('btn-mock-rose', () => {
      const user = this.getCustomMockUser();
      if (this.ws) this.ws.send(JSON.stringify({ type: 'mock_trigger', action: 'gift', tier: 1, giftName: 'Rose', coins: 1, user }));
    });
    this.bindMockButton('btn-mock-perfume', () => {
      const user = this.getCustomMockUser();
      if (this.ws) this.ws.send(JSON.stringify({ type: 'mock_trigger', action: 'gift', tier: 2, giftName: 'Perfume', coins: 100, user }));
    });
    this.bindMockButton('btn-mock-lion', () => {
      const user = this.getCustomMockUser();
      if (this.ws) this.ws.send(JSON.stringify({ type: 'mock_trigger', action: 'gift', tier: 3, giftName: 'Lion', coins: 500, user }));
    });
    this.bindMockButton('btn-mock-chat', () => {
      const user = this.getCustomMockUser();
      if (this.ws) this.ws.send(JSON.stringify({ type: 'mock_trigger', action: 'chat', comment: 'Let us party with VIP!', user }));
    });
    this.bindMockButton('btn-mock-likes', () => {
      const user = this.getCustomMockUser();
      if (this.ws) this.ws.send(JSON.stringify({ type: 'mock_trigger', action: 'likes', count: 10, user }));
    });

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

  getCustomMockUser() {
    const usernameEl = document.getElementById('mock-custom-username');
    const levelEl = document.getElementById('mock-custom-level');
    const colorEl = document.getElementById('mock-custom-color');

    const username = usernameEl?.value?.trim() || 'DaiGiaBinhDuong';
    const level = levelEl?.value || 'TOP 1';
    const slimeColor = colorEl?.value || 'yellow';
    const cleanId = username.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const id = cleanId.startsWith('custom_') ? cleanId : `custom_${cleanId}`;

    return {
      id,
      userId: id,
      uniqueId: id,
      username,
      nickname: username,
      level,
      slimeColor,
      avatarUrl: ''
    };
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
