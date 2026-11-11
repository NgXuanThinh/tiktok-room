// src/ui-overlay.js - Responsive OBS HUD overlay & Streamer Admin Drawer
const RANDOM_NICKNAMES = [
  'Bot',
  'QuangLinhVlog',
  'HaLinhOfficial',
  'CyberSlime_007',
  'PartyQueen_99',
  'RaveMaster_X',
  'TiktokVIP_VN',
  'RichKid_Saigon',
  'DJ_FanCung',
  'BeHeoKute',
  'Chubby_Mochi'
];

const RANDOM_COMMENTS = [
  'Quẩy lên nào anh em ơi! 🔥',
  '!dance 1',
  '!dance 2',
  '!color',
  '!face smile',
  '!face wink',
  'DJ đánh căng đét! 🎧',
  'Drop the bass! 🔊',
  'Slime cute xỉu 😍',
  'Thả tim rực rỡ phòng live ❤️',
  'Sàn nhảy hôm nay cháy quá 💃🕺',
  'Nhạc chất quá idol ơi! 🎵',
  'Hóng Top 1 donate hôm nay 👑'
];

export const GIFT_LOGOS = {
  // Small Tier (1 - 19 coins)
  rose: '🌹',
  hoa_hong: '🌹',
  finger_heart: '🫰',
  ban_tim: '🫰',
  tiktok: '🎵',
  ice_cream: '🍦',
  kem: '🍦',
  coffee: '☕',
  ca_phe: '☕',
  lucky_cat: '🐱',
  meo_may_man: '🐱',
  panda: '🐼',
  gau_truc: '🐼',
  weights: '🏋️',
  ta_don: '🏋️',
  donut: '🍩',
  banh_donut: '🍩',

  // Medium Tier (20 - 499 coins)
  sunglasses: '🕶️',
  kinh_ngau: '🕶️',
  conical_hat: '👒',
  non_la: '👒',
  rainbow: '🌈',
  cau_vong: '🌈',
  disco_ball: '🪩',
  qua_cau_disco: '🪩',
  money_gun: '💸',
  sung_ban_tien: '💸',
  electric_guitar: '🎸',
  dan_dien: '🎸',
  love_balloons: '🎈',
  bong_bay: '🎈',
  paper_crane: '🕊️',
  hac_giay: '🕊️',
  origami: '🕊️',
  magic_mirror: '🪞',
  guong_than: '🪞',
  perfume: '🌸',
  nuoc_hoa: '🌸',
  crown: '👑',
  vuong_mien: '👑',

  // High Tier (500 - 4999 coins)
  jet: '✈️',
  may_bay: '✈️',
  plane: '✈️',
  private_jet: '✈️',
  may_bay_phan_luc: '✈️',
  excalibur: '⚔️',
  guom_anh_sang: '⚔️',
  sword: '⚔️',
  thanh_kiem: '⚔️',
  sports_car: '🏎️',
  sieu_xe: '🏎️',
  ferrari: '🏎️',
  yacht: '🛥️',
  du_thuyen: '🛥️',
  castle: '🏰',
  lau_dai: '🏰',
  diamond: '💎',
  kim_cuong: '💎',
  meteor_shower: '☄️',
  mua_sao_bang: '☄️',
  amusement_park: '🎡',
  cong_vien: '🎡',
  space_shuttle: '🚀',
  tau_vu_tru: '🚀',

  // Ultra Tier (>= 5000 coins)
  golden_lion: '🦁',
  su_tu_vang: '🦁',
  lion: '🦁',
  su_tu: '🦁',
  phoenix: '🦅',
  phuong_hoang: '🦅',
  firebird: '🦅',
  pegasus: '🦄',
  ngua_than: '🦄',
  unicorn: '🦄',
  universe: '🪐',
  vu_tru: '🪐',
  galaxy: '🌌',
  ngan_ha: '🌌',
  cyber_beast: '🐅',
  quai_thu: '🐅',
  dragon: '🐉',
  rong_than: '🐉'
};

export function getGiftLogo(giftKeyOrName) {
  if (!giftKeyOrName) return '🎁';
  const clean = String(giftKeyOrName).toLowerCase().trim().replace(/[\s-]+/g, '_');
  return GIFT_LOGOS[clean] || '🎁';
}

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
    this.mockSpawnCount = 0;
    this.activeFloorAvatars = [];
    this.isDonateStormActive = false;
    this.donateStormInterval = null;

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
    this.bannerLogoEl = document.getElementById('banner-logo');
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

    // Random Nickname Generator Button
    const randNameBtn = document.getElementById('btn-random-name');
    if (randNameBtn) {
      randNameBtn.addEventListener('click', () => {
        const usernameEl = document.getElementById('mock-custom-username');
        if (usernameEl) {
          const rand = RANDOM_NICKNAMES[Math.floor(Math.random() * RANDOM_NICKNAMES.length)];
          usernameEl.value = rand;
        }
      });
    }

    // Custom Mock Person Buttons
    this.bindMockButton('btn-mock-spawn', () => {
      this.mockSpawnCount++;
      const user = this.getCustomMockUser(this.mockSpawnCount);
      if (this.ws) this.ws.send(JSON.stringify({ type: 'mock_trigger', action: 'spawn', user }));
    });

    this.bindMockButton('btn-mock-delete-target', () => {
      const targetSelect = document.getElementById('mock-target-avatar');
      const targetUserId = targetSelect?.value;
      if (targetUserId) {
        if (this.ws) this.ws.send(JSON.stringify({ type: 'mock_trigger', action: 'delete_avatar', userId: targetUserId }));
        window.dispatchEvent(new CustomEvent('app_delete_avatar', { detail: { userId: targetUserId } }));
      }
    });

    this.bindMockButton('btn-mock-clear-all', () => {
      if (this.ws) this.ws.send(JSON.stringify({ type: 'mock_trigger', action: 'clear_avatars' }));
      window.dispatchEvent(new CustomEvent('app_clear_avatars'));
    });

    this.bindMockButton('btn-mock-chat', () => {
      const user = this.getTargetUser();
      const chatInput = document.getElementById('mock-custom-chat');
      const randomChatToggle = document.getElementById('mock-random-chat');
      let comment = chatInput?.value?.trim();
      if (!comment || (randomChatToggle && randomChatToggle.checked && !comment)) {
        comment = RANDOM_COMMENTS[Math.floor(Math.random() * RANDOM_COMMENTS.length)];
      }
      if (this.ws) this.ws.send(JSON.stringify({ type: 'mock_trigger', action: 'chat', comment, user }));
    });

    this.bindMockButton('btn-mock-likes', () => {
      const user = this.getTargetUser();
      if (this.ws) this.ws.send(JSON.stringify({ type: 'mock_trigger', action: 'likes', count: 10, user }));
    });

    this.bindMockButton('btn-mock-fan', () => {
      const user = this.getTargetUser();
      if (this.ws) this.ws.send(JSON.stringify({ type: 'mock_trigger', action: 'fan', user }));
    });

    this.bindMockButton('btn-mock-follow', () => {
      const user = this.getTargetUser();
      if (this.ws) this.ws.send(JSON.stringify({ type: 'mock_trigger', action: 'follow', user }));
    });

    // Stream Interactive Like Button (Thả tim)
    const streamLikeBtn = document.getElementById('btn-stream-like');
    const streamLikeCounter = document.getElementById('like-btn-counter');
    let localLikes = 0;

    const triggerLikeAction = () => {
      localLikes++;
      if (streamLikeCounter) streamLikeCounter.textContent = String(localLikes);

      if (streamLikeBtn) {
        streamLikeBtn.classList.remove('like-btn-pop');
        void streamLikeBtn.offsetWidth;
        streamLikeBtn.classList.add('like-btn-pop');
      }

      const user = this.getTargetUser();

      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'mock_trigger',
          action: 'likes',
          count: 1,
          user
        }));
      } else {
        // Direct event dispatch for offline / standalone mode
        window.dispatchEvent(new CustomEvent('app_local_like', {
          detail: { user, count: 1 }
        }));
      }
    };

    if (streamLikeBtn) {
      streamLikeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerLikeAction();
      });
    }

    // Keyboard shortcut: Press 'L' to like
    window.addEventListener('keydown', (e) => {
      if ((e.key === 'l' || e.key === 'L') && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        triggerLikeAction();
      }
    });

    // Epic Lion Coronation Button
    this.bindMockButton('btn-mock-lion-epic', () => {
      const user = this.getTargetUser();
      if (this.ws) {
        this.ws.send(JSON.stringify({
          type: 'mock_trigger',
          action: 'gift',
          tier: 4,
          giftName: 'Lion',
          coins: 29999,
          user
        }));
      }
    });

    // Preview-style Gift Category Tabs
    document.querySelectorAll('.gift-cat-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.gift-cat-tab').forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        const cat = tab.dataset.cat;
        document.querySelectorAll('.gift-grid-container').forEach((grid) => {
          grid.style.display = (grid.dataset.cat === cat) ? 'grid' : 'none';
        });
      });
    });

    // Preview-style Donate Buttons Listener
    document.querySelectorAll('.donate-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const user = this.getTargetUser();
        const tier = Number(btn.dataset.tier || 1);
        const giftName = btn.dataset.name || 'Gift';
        const giftKey = btn.dataset.gift || giftName;
        const coins = Number(btn.dataset.coins || 1);
        const toggleTierUp = document.getElementById('toggle-tier-up');
        const forceTierUp = toggleTierUp ? toggleTierUp.checked : false;
        if (this.ws) {
          this.ws.send(JSON.stringify({
            type: 'mock_trigger',
            action: 'gift',
            tier,
            giftName,
            giftKey,
            coins,
            user,
            forceTierUp
          }));
        }
      });
    });

    // Continuous Donate Storm Toggle Button
    const stormBtn = document.getElementById('btn-donate-storm');
    if (stormBtn) {
      stormBtn.addEventListener('click', () => {
        this.isDonateStormActive = !this.isDonateStormActive;
        if (this.isDonateStormActive) {
          stormBtn.textContent = '🌧️ Bão Donate: ĐANG XẢ (BẤM DỪNG)';
          stormBtn.style.background = 'linear-gradient(135deg, #ff0874, #ffd700)';
          stormBtn.style.color = '#000';
          stormBtn.style.fontWeight = 'bold';

          const quickGifts = [
            { tier: 1, name: 'Hoa hồng', coins: 1 },
            { tier: 1, name: 'Finger Heart', coins: 5 },
            { tier: 2, name: 'Pháo giấy', coins: 100 },
            { tier: 2, name: 'Kính râm Cyber', coins: 199 },
            { tier: 3, name: 'Mưa tiền', coins: 500 },
            { tier: 4, name: 'Quả cầu Disco', coins: 1000 },
            { tier: 4, name: 'Lion', coins: 29999 }
          ];

          this.donateStormInterval = setInterval(() => {
            if (!this.ws) return;
            const target = (this.activeFloorAvatars && this.activeFloorAvatars.length > 0)
              ? this.activeFloorAvatars[Math.floor(Math.random() * this.activeFloorAvatars.length)]
              : this.getTargetUser();
            const g = quickGifts[Math.floor(Math.random() * quickGifts.length)];
            this.ws.send(JSON.stringify({
              type: 'mock_trigger',
              action: 'gift',
              tier: g.tier,
              giftName: g.name,
              coins: g.coins,
              user: target
            }));
          }, 650);
        } else {
          stormBtn.textContent = '🌧️ Bão Donate Liên Tục: OFF';
          stormBtn.style.background = '';
          stormBtn.style.color = '';
          stormBtn.style.fontWeight = '';
          if (this.donateStormInterval) {
            clearInterval(this.donateStormInterval);
            this.donateStormInterval = null;
          }
        }
      });
    }
  }

  getTargetUser() {
    const targetSelect = document.getElementById('mock-target-avatar');
    if (targetSelect && targetSelect.value && this.activeFloorAvatars) {
      const found = this.activeFloorAvatars.find((a) => String(a.userId) === String(targetSelect.value));
      if (found) {
        return {
          id: found.userId,
          userId: found.userId,
          uniqueId: found.userId,
          username: found.username,
          nickname: found.nickname || found.username,
          level: found.level || 'Lv.1',
          slimeColor: found.color || 'blue',
          tier: found.tier || 1,
          avatarUrl: found.avatarUrl || ''
        };
      }
    }
    return this.getCustomMockUser(this.mockSpawnCount);
  }

  getCustomMockUser(spawnIdx = 0) {
    const usernameEl = document.getElementById('mock-custom-username');
    const tierEl = document.getElementById('mock-custom-tier');
    const levelEl = document.getElementById('mock-custom-level');
    const colorEl = document.getElementById('mock-custom-color');

    const baseName = usernameEl?.value?.trim() || 'Bot';
    const username = spawnIdx > 0 ? `${baseName}_${spawnIdx}` : baseName;
    const tier = Number(tierEl?.value || 1);
    const level = levelEl?.value || 'Lv.1';
    const slimeColor = colorEl?.value || 'blue';
    const cleanId = username.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const id = cleanId.startsWith('custom_') ? cleanId : `custom_${cleanId}`;

    return {
      id,
      userId: id,
      uniqueId: id,
      username,
      nickname: username,
      tier,
      level,
      slimeColor,
      avatarUrl: ''
    };
  }

  updateActiveAvatars(avatarList = []) {
    this.activeFloorAvatars = avatarList;
    const select = document.getElementById('mock-target-avatar');
    if (!select) return;

    const currentVal = select.value;
    select.innerHTML = '<option value="">-- Mục tiêu: Tạo mới / Custom Input --</option>';

    avatarList.forEach((av, idx) => {
      const opt = document.createElement('option');
      opt.value = av.userId;
      const rankTag = av.rank ? ` [${av.rank}]` : '';
      opt.textContent = `[#${idx + 1}] @${av.username} (Tier ${av.tier || 1}, ${av.level || 'Lv.1'})${rankTag}`;
      if (String(av.userId) === String(currentVal)) {
        opt.selected = true;
      }
      select.appendChild(opt);
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

  triggerFrenzy(duration = 15) {
    this.triggerFrenzyMode();
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
    const giftName = data.giftName || 'Quà';
    const coins = Number(data.totalCoins || data.diamondCount || data.coins || 1);
    const donorName = user.nickname || user.username || 'Khách';

    // Format clean non-fluff text strictly: "[Nickname] tặng [Tên quà]"
    if (this.bannerTitleEl) {
      this.bannerTitleEl.textContent = `${donorName} tặng ${giftName}`;
    }

    // Gift Logo
    const giftKey = data.giftKey || giftName;
    const logo = getGiftLogo(giftKey);
    if (this.bannerLogoEl) {
      this.bannerLogoEl.textContent = logo;
    }

    // Coin badge: "[Xu]🪙"
    if (this.bannerSubEl) {
      this.bannerSubEl.textContent = `${coins}🪙`;
    }

    if (this.bannerAvatarEl) {
      this.bannerAvatarEl.src = `/api/avatar?name=${encodeURIComponent(user.username || '')}&url=${encodeURIComponent(user.avatarUrl || '')}`;
    }

    // Determine tier class & sfx
    this.giftBannerEl.classList.remove('tier-small', 'tier-medium', 'tier-high', 'tier-ultra');
    let tierClass = 'tier-small';
    let sfxKey = 'coin';

    if (coins >= 5000) {
      tierClass = 'tier-ultra';
      sfxKey = 'fanfare';
    } else if (coins >= 500) {
      tierClass = 'tier-high';
      sfxKey = 'jetSwoosh';
    } else if (coins >= 20) {
      tierClass = 'tier-medium';
      sfxKey = 'bassBoom';
    } else {
      tierClass = 'tier-small';
      sfxKey = 'coin';
    }

    this.giftBannerEl.classList.add(tierClass);
    this.giftBannerEl.classList.add('show');

    clearTimeout(this.bannerTimeout);
    const displayDuration = coins >= 5000 ? 5000 : (coins >= 500 ? 4000 : 3000);
    this.bannerTimeout = setTimeout(() => {
      this.giftBannerEl.classList.remove('show');
    }, displayDuration);

    // Audio SFX trigger (strictly <= 1.5s with clickless exponential decay)
    if (this.audioSystem) {
      this.audioSystem.playSfx(sfxKey);
    }
  }

  updateLeaderboard(donors = []) {
    if (!this.leaderListEl) return;
    this.leaderListEl.innerHTML = '';

    const top5 = donors.slice(0, 5);
    for (let i = 0; i < top5.length; i++) {
      const d = top5[i];
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
