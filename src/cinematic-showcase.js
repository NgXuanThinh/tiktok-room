import { startCinematicParticles, stopCinematicParticles } from './cinematic-particles.js';
import { startForegroundSlime, stopForegroundSlime } from './foreground-slime.js';
import { startChibiSlimeMascot, stopChibiSlimeMascot } from './chibi-mascot.js';
import { renderAvatarOrnament } from './avatar-ornaments.js';
import { playPreviewSfx } from './preview-audio.js';
import { isolateDonationAvatar, revealAvatarsForZoomOut } from './avatar-coordinator.js';

// Sequential FIFO Queue for High-Tier & Ultra Donates
export const highTierQueue = [];
export let isShowingHighTier = false;
export let isCinematicFreezeActive = false;

let showcaseContext = {
  camera: null,
  sceneManager: null,
  activeAvatars: [],
  clearFloorEffects: null
};

export function initCinematicShowcase(ctx = {}) {
  Object.assign(showcaseContext, ctx);
}

export function getScreenCoords(worldPos) {
  const camera = showcaseContext.camera;
  if (!camera) {
    return { x: window.innerWidth / 2, y: window.innerHeight / 2, visible: true };
  }
  const v = worldPos.clone().project(camera);
  const hw = window.innerWidth / 2;
  const hh = window.innerHeight / 2;
  return {
    x: (v.x * hw) + hw,
    y: -(v.y * hh) + hh,
    visible: v.z < 1.0
  };
}

export function generateSvgAvatar(name = 'Viewer') {
  const initial = (name.replace('@', '').trim()[0] || 'V').toUpperCase();
  const colors = [
    ['#ff0874', '#7928ca'],
    ['#00f2fe', '#4facfe'],
    ['#ffd700', '#ff8800'],
    ['#00ff88', '#00b4d8']
  ];
  const charCode = name.charCodeAt(0) || 0;
  const pair = colors[charCode % colors.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${pair[0]}"/>
        <stop offset="100%" stop-color="${pair[1]}"/>
      </linearGradient>
    </defs>
    <rect width="160" height="160" fill="url(#g)"/>
    <text x="50%" y="54%" font-family="sans-serif" font-weight="900" font-size="70" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${initial}</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

export function enqueueHighTierShowcase(item) {
  highTierQueue.push(item);
  if (!isShowingHighTier) {
    processNextHighTier();
  }
}

export function processNextHighTier() {
  if (highTierQueue.length === 0) {
    isShowingHighTier = false;
    if (showcaseContext.sceneManager?.revertFromCinematic) {
      showcaseContext.sceneManager.revertFromCinematic();
    }
    return;
  }
  isShowingHighTier = true;
  const current = highTierQueue.shift();

  const avatar = current.avatar;
  const avatarPos = avatar?.position || avatar?.rootNode?.position || (avatar?.mesh?.position) || { x: 0, y: 0, z: 0 };

  // 1. Camera moves smoothly towards 3D slime position of the donor account
  if (showcaseContext.sceneManager?.focusSlimeCinematic) {
    showcaseContext.sceneManager.focusSlimeCinematic(avatarPos, () => {
      // 2. Once arrived, start the showcase while 3D space freezes
      runCinematic2DShowcase(current, () => {
        setTimeout(() => {
          processNextHighTier();
        }, 200);
      });
    }, 1.0, avatar);
  } else {
    runCinematic2DShowcase(current, () => {
      setTimeout(() => {
        processNextHighTier();
      }, 200);
    });
  }
}

export function runCinematic2DShowcase(item, onFinished) {
  const { avatar, gift, shouldUpgradeTier } = item;
  const coins = gift.coins;

  // Isolate active hero avatar to prevent other slimes from obstructing the showcase
  if (showcaseContext.activeAvatars) {
    isolateDonationAvatar(avatar, showcaseContext.activeAvatars);
  }

  let tierClass = 'tier-money';
  let duration = 3.0;
  let sfxKey = 'goldChime';
  let customTitle = '✨ VIP DONOR ✨';

  if (gift.key === 'universe' || coins >= 40000) {
    tierClass = 'tier-universe';
    duration = 6.2;
    sfxKey = 'goldChime';
    customTitle = '🌌 VŨ TRỤ TIKTOK TỐI THƯỢNG - TIKTOK UNIVERSE 🌌';
  } else if (gift.key === 'pegasus' || (coins >= 34000 && !gift.key?.includes('universe'))) {
    tierClass = 'tier-pegasus';
    duration = 5.8;
    sfxKey = 'heartSwoosh';
    customTitle = '🦄 NGỰA THẦN THIÊN GIỚI - CELESTIAL PEGASUS 🦄';
  } else if (gift.key === 'lion' || (coins >= 29000 && !gift.key?.includes('pegasus'))) {
    tierClass = 'tier-lion';
    duration = 5.8;
    sfxKey = 'royalFanfare';
    customTitle = '🦁 CHÚA TỂ RỪNG XANH - THE GOLDEN LION 🦁';
  } else if (gift.key === 'tiger' || (coins >= 26500 && !gift.key?.includes('lion'))) {
    tierClass = 'tier-tiger';
    duration = 5.5;
    sfxKey = 'bassBoom';
    customTitle = '🐅 HỔ LỬA CUỒNG NỘ - BLAZING TIGER 🐅';
  } else if (gift.key === 'phoenix' || (coins >= 25000 && !gift.key?.includes('tiger'))) {
    tierClass = 'tier-phoenix';
    duration = 5.5;
    sfxKey = 'goldChime';
    customTitle = '🔥 PHƯỢNG HOÀNG TÁI SINH - ETERNAL PHOENIX 🔥';
  } else if (gift.key === 'panther' || (coins >= 10000 && !gift.key?.includes('phoenix'))) {
    tierClass = 'tier-panther';
    duration = 5.0;
    sfxKey = 'swordClash';
    customTitle = '🐆 BÁO ĐÊM BÁ CHỦ - SHADOW PREDATOR 🐆';
  } else if (gift.key === 'jet' || (coins >= 6000 && !gift.key?.includes('panther'))) {
    tierClass = 'tier-airplane';
    duration = 4.8;
    sfxKey = 'bassBoom';
    customTitle = '✈️ CHUYẾN BAY THƯƠNG GIA - AIRPLANE VIP ✈️';
  } else if (gift.key === 'drama_queen' || (coins >= 5000 && !gift.key?.includes('diamond'))) {
    tierClass = 'tier-queen';
    duration = 5.5;
    sfxKey = 'royalFanfare';
    customTitle = '👑 DRAMA QUEEN - NỮ HOÀNG BÁ CHỦ 👑';
  } else if (gift.key === 'diamond_gun' || (coins === 5000 && gift.key?.includes('diamond'))) {
    tierClass = 'tier-diamond';
    duration = 5.2;
    sfxKey = 'goldChime';
    customTitle = '💎 PHÁO KIM CƯƠNG BÙNG NỔ 💎';
  } else if (gift.key === 'private_jet' || coins === 4888) {
    tierClass = 'tier-jet';
    duration = 5.0;
    sfxKey = 'bassBoom';
    customTitle = '🛩️ CHUYÊN CƠ SIÊU THANH VIP 🛩️';
  } else if (gift.key === 'whale_diving' || coins === 2150) {
    tierClass = 'tier-whale';
    duration = 4.8;
    sfxKey = 'bassBoom';
    customTitle = '🐋 CÁ VOI ĐẠI DƯƠNG HUYỀN ẢO 🐋';
  } else if (gift.key === 'galaxy' || gift.name?.includes('Galaxy')) {
    tierClass = 'tier-galaxy';
    duration = 4.6;
    sfxKey = 'goldChime';
    customTitle = '🌌 VŨ TRỤ GALAXY HUYỀN BÍ 🌌';
  } else if (gift.key === 'legend' || gift.name?.includes('Huyền thoại')) {
    tierClass = 'tier-legend';
    duration = 4.6;
    sfxKey = 'swordClash';
    customTitle = '⚔️ HUYỀN THOẠI XUẤT THẾ ⚔️';
  } else if (gift.key === 'disco_ball' || gift.name?.includes('Disco')) {
    tierClass = 'tier-disco';
    duration = 4.6;
    sfxKey = 'goldChime';
    customTitle = '🪩 CẦU DISCO SÔI ĐỘNG 🪩';
  } else if (gift.key === 'swan' || gift.name?.includes('Thiên nga')) {
    tierClass = 'tier-swan';
    duration = 4.2;
    sfxKey = 'heartSwoosh';
    customTitle = '🦢 ĐÔI THIÊN NGA HỒ TRĂNG 🦢';
  } else if (gift.key === 'love_balloon' || coins === 699 || coins === 700) {
    tierClass = 'tier-heart';
    duration = 4.2;
    sfxKey = 'heartSwoosh';
    customTitle = '💖 BÓNG BAY TÌNH YÊU 💖';
  } else if (gift.key === 'concert' || gift.name?.includes('hòa nhạc')) {
    tierClass = 'tier-concert';
    duration = 3.8;
    sfxKey = 'bassBoom';
    customTitle = '🎸 BUỔI HÒA NHẠC BÙNG NỔ 🎸';
  } else {
    // 500 coin: Súng tiền / Mưa tiền
    tierClass = 'tier-money';
    duration = 3.8;
    sfxKey = 'goldChime';
    customTitle = '💸 ĐẠI BÁC BẮN TIỀN & NGỌC 💸';
  }

  // TỐI ƯU TÀI NGUYÊN: Bỏ hoàn toàn hiệu ứng có sẵn trên Slime trên sàn khi donate xa xỉ / cao cấp
  const controller = avatar?.userData?.controller || avatar;
  if (shouldUpgradeTier && controller?.setTier) {
    controller.setTier(gift.tier || 1);
  }

  // Triệt tiêu và dọn sạch các hiệu ứng vật lý nền
  if (showcaseContext.clearFloorEffects) {
    showcaseContext.clearFloorEffects();
  }
  playPreviewSfx(sfxKey);

  // Setup DOM Elements
  const overlay = document.getElementById('cinematic-overlay');
  const backdrop = document.getElementById('cinematic-backdrop');
  const stage = document.getElementById('cinematic-stage');
  const wings = document.getElementById('cinematic-wings');
  const crown = document.getElementById('cinematic-crown');
  const avatarImg = document.getElementById('cinematic-avatar-img');
  const donorTitle = document.getElementById('cinematic-donor-title');
  const donorName = document.getElementById('cinematic-donor-name');
  const giftEmoji = document.getElementById('cinematic-gift-emoji');
  const giftName = document.getElementById('cinematic-gift-name');
  const giftCoins = document.getElementById('cinematic-gift-coins');
  const fxCanvas = document.getElementById('cinematic-fx-canvas');
  const chibiCanvas = document.getElementById('cinematic-chibi-canvas');

  if (!overlay || !stage) {
    if (onFinished) onFinished();
    return;
  }

  stage.className = `cinematic-stage ${tierClass}`;
  renderAvatarOrnament(tierClass, coins, gift.key);
  stage.style.transform = 'translate(-50%, -50%) scale(0.6)';
  stage.style.opacity = '0';

  if (wings) wings.style.display = (tierClass === 'tier-queen') ? 'block' : 'none';
  if (crown) crown.style.display = (tierClass === 'tier-queen') ? 'block' : 'none';

  const userData = avatar?.userData || controller?.userData || {};
  const username = userData.username || '@ThinhPro';
  const nickname = userData.nickname || userData.username || 'Thịnh Pro';
  const avatarUrl = userData.avatarUrl || '';

  if (donorName) donorName.textContent = nickname;
  if (donorTitle) {
    donorTitle.textContent = customTitle;
  }
  if (giftEmoji) giftEmoji.textContent = gift.emoji;
  if (giftName) giftName.textContent = gift.name;
  if (giftCoins) giftCoins.textContent = `${coins.toLocaleString()}🪙`;

  if (avatarImg) {
    avatarImg.onerror = () => {
      avatarImg.src = generateSvgAvatar(username);
    };
    avatarImg.src = avatarUrl || generateSvgAvatar(username);
  }

  overlay.style.display = 'block';
  backdrop.style.opacity = '1';
  requestAnimationFrame(() => {
    stage.style.transform = 'translate(-50%, -50%) scale(1.0)';
    stage.style.opacity = '1';
  });

  // Tối ưu hiệu năng: Tạm freeze background avatars khi bật Cinematic Overlay
  isCinematicFreezeActive = true;
  if (showcaseContext.activeAvatars) {
    showcaseContext.activeAvatars.forEach(av => {
      const c = av?.userData?.controller || av;
      if (c?.setPaused) c.setPaused(true);
    });
  }

  // 1. Full-screen 2D Cinematic Particle Effects
  try {
    startCinematicParticles(fxCanvas, gift, duration);
  } catch (err) {
    console.error('startCinematicParticles error:', err);
  }

  // 2. Front-angle 3D Slime đưa ra trước barroom nhảy khắp màn hình
  try {
    startForegroundSlime(avatar, duration, gift.key);
  } catch (err) {
    console.error('startForegroundSlime error:', err);
  }

  // 3. Mini Chibi Mascot Badge ở góc avatar frame
  try {
    startChibiSlimeMascot(chibiCanvas, userData.avatarColor || userData.slimeColor || '#00f2fe');
  } catch (err) {
    console.error('startChibiSlimeMascot error:', err);
  }

  // BẢO ĐẢM THOÁT KHỎI SHOWCASE AN TOÀN 100%: Dùng cleanupShowcase có cờ đánh dấu
  let isCleanedUp = false;
  const cleanupShowcase = () => {
    if (isCleanedUp) return;
    isCleanedUp = true;
    isCinematicFreezeActive = false;

    if (showcaseContext.activeAvatars) {
      showcaseContext.activeAvatars.forEach(av => {
        const c = av?.userData?.controller || av;
        if (c?.setPaused) c.setPaused(false);
        if (c?.state) {
          c.state.donateFx = null;
          c.state.isLionCelebrating = false;
          c.state.activeDanceAction = null;
          c.state.activeFlourish = null;
        }
      });
    }

    if (highTierQueue.length === 0) {
      if (showcaseContext.activeAvatars) {
        revealAvatarsForZoomOut(showcaseContext.activeAvatars, { animateBloom: true, billboardDelayMs: 400 });
      }
      if (showcaseContext.sceneManager?.revertFromCinematic) {
        showcaseContext.sceneManager.revertFromCinematic();
      }
    }

    overlay.onclick = null;
    const skipBtn = document.getElementById('cinematic-skip-btn');
    if (skipBtn) skipBtn.onclick = null;

    try {
      if (overlay) overlay.style.display = 'none';
      if (stage) {
        stage.style.transform = 'translate(-50%, -50%) scale(1.0)';
        stage.style.opacity = '1';
      }
      const ornEl = document.getElementById('avatar-ornament');
      if (ornEl) ornEl.innerHTML = '';
      if (backdrop) backdrop.style.opacity = '0';
      stopCinematicParticles();
      stopForegroundSlime();
      stopChibiSlimeMascot();
    } catch (e) {
      console.error('cleanupShowcase error:', e);
    }

    if (onFinished) {
      try {
        onFinished();
      } catch (e) {
        console.error('onFinished callback error:', e);
      }
    }
  };

  overlay.onclick = cleanupShowcase;
  const skipBtn = document.getElementById('cinematic-skip-btn');
  if (skipBtn) skipBtn.onclick = cleanupShowcase;

  // "Thu về 3D" Schedule (At duration - 0.45s)
  setTimeout(() => {
    try {
      if (isCleanedUp) return;
      const avPos = avatar?.position || avatar?.rootNode?.position || (avatar?.mesh?.position) || { x: 0, y: 0, z: 0 };
      const screenPos = getScreenCoords(avPos);
      const targetX = screenPos.x;
      const targetY = screenPos.y;
      const dx = targetX - (window.innerWidth / 2);
      const dy = targetY - (window.innerHeight / 2);

      if (stage) {
        stage.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.06)`;
        stage.style.opacity = '0';
      }
      if (backdrop) backdrop.style.opacity = '0';
    } catch (e) {
      console.warn('Thu về 3D error:', e);
    }
  }, Math.max(100, (duration - 0.45) * 1000));

  setTimeout(cleanupShowcase, duration * 1000);
}
