// server/mock-simulator.js - Tri-modal mock event injector (CLI, UI trigger, REST endpoint)
import { normalizeTikTokEvent } from './event-normalizer.js';

export const MOCK_LEVELS = ['Lv.1', 'Lv.10', 'Lv.25', 'Lv.50', 'VIP', 'TOP 1'];

export function createCustomMockUser(params = {}) {
  const username = params.username || 'DaiGiaBinhDuong';
  const level = params.level || 'TOP 1';
  const slimeColor = params.slimeColor || 'yellow';
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
    avatarUrl: params.avatarUrl || ''
  };
}

const MOCK_VIEWERS = [
  { userId: '101', uniqueId: 'dj_beatmaker', nickname: 'DJ Beat', avatarUrl: '' },
  { userId: '102', uniqueId: 'club_queen', nickname: 'Club Queen', avatarUrl: '' },
  { userId: '103', uniqueId: 'techno_vibe', nickname: 'Techno Vibe', avatarUrl: '' },
  { userId: '104', uniqueId: 'neon_glow', nickname: 'Neon Glow', avatarUrl: '' },
  { userId: '105', uniqueId: 'vip_whale', nickname: 'VIP Whale', avatarUrl: '' },
  { userId: '106', uniqueId: 'party_animal', nickname: 'Party Animal', avatarUrl: '' },
  { userId: '107', uniqueId: 'lounge_chiller', nickname: 'Lounge Chiller', avatarUrl: '' },
  { userId: '108', uniqueId: 'rave_master', nickname: 'Rave Master', avatarUrl: '' }
];

const MOCK_CHATS = [
  'Let us party all night! 🔥',
  '!dance 1',
  '!dance 2',
  '!dance 3',
  '!dance 4',
  '!dance 5',
  '!dance 6',
  '!jump',
  '!cheer',
  '!wave',
  'This DJ is on fire! 🎧',
  'Turn the bass up! 🔊',
  'Love this 3D nightclub! 💃🕺',
  'Sending love from TikTok live ❤️',
  'Best club in town! ✨'
];

const MOCK_GIFTS = [
  { giftId: 1, giftName: 'Rose', diamondCount: 1, repeatCount: 1, tier: 1 },
  { giftId: 2, giftName: 'Finger Heart', diamondCount: 5, repeatCount: 1, tier: 1 },
  { giftId: 3, giftName: 'Panda', diamondCount: 99, repeatCount: 1, tier: 1 },
  { giftId: 10, giftName: 'Perfume', diamondCount: 100, repeatCount: 1, tier: 2 },
  { giftId: 11, giftName: 'Sunglasses', diamondCount: 199, repeatCount: 1, tier: 2 },
  { giftId: 20, giftName: 'Lion', diamondCount: 500, repeatCount: 1, tier: 3 },
  { giftId: 21, giftName: 'Galaxy', diamondCount: 1000, repeatCount: 1, tier: 3 },
  { giftId: 30, giftName: 'Universe', diamondCount: 2000, repeatCount: 1, tier: 4 },
  { giftId: 31, giftName: 'TikTok Live Falcon', diamondCount: 5000, repeatCount: 1, tier: 4 }
];

export class MockSimulator {
  constructor(options = {}) {
    this.onEvent = typeof options.onEvent === 'function' ? options.onEvent : () => {};
    this.timer = null;
    this.isRunning = false;
  }

  getRandomViewer() {
    return MOCK_VIEWERS[Math.floor(Math.random() * MOCK_VIEWERS.length)];
  }

  simulateLikes(count = 10, user = null) {
    const u = user || this.getRandomViewer();
    const evt = normalizeTikTokEvent('like', {
      ...u,
      likeCount: count,
      totalLikeCount: 5000
    });
    this.onEvent(evt);
    return evt;
  }

  simulateChat(customText = null, user = null) {
    const u = user || this.getRandomViewer();
    const comment = customText || MOCK_CHATS[Math.floor(Math.random() * MOCK_CHATS.length)];
    const evt = normalizeTikTokEvent('chat', {
      ...u,
      comment
    });
    this.onEvent(evt);
    return evt;
  }

  simulateGift(tier = 1, customGiftName = null, customCoins = null, user = null) {
    const u = user || this.getRandomViewer();
    let giftSpec = MOCK_GIFTS.find((g) => g.tier === tier);
    if (!giftSpec) giftSpec = MOCK_GIFTS[0];

    const diamondCount = customCoins !== null ? Number(customCoins) : giftSpec.diamondCount;
    const giftName = customGiftName || giftSpec.giftName;

    const evt = normalizeTikTokEvent('gift', {
      ...u,
      giftId: giftSpec.giftId,
      giftName,
      diamondCount,
      repeatCount: 1
    });
    this.onEvent(evt);
    return evt;
  }

  simulateSpawn(user = null) {
    const u = user || this.getRandomViewer();
    const color = u.slimeColor || 'green';
    const evt = normalizeTikTokEvent('chat', {
      ...u,
      comment: `!color ${color}`
    });
    this.onEvent(evt);
    return evt;
  }

  startAutoSimulation(intervalMs = 1500) {
    if (this.isRunning) return;
    this.isRunning = true;
    this.timer = setInterval(() => {
      const roll = Math.random();
      if (roll < 0.5) {
        this.simulateLikes(Math.floor(Math.random() * 5) + 1);
      } else if (roll < 0.85) {
        this.simulateChat();
      } else {
        const tierRoll = Math.random();
        const tier = tierRoll < 0.6 ? 1 : tierRoll < 0.85 ? 2 : tierRoll < 0.95 ? 3 : 4;
        this.simulateGift(tier);
      }
    }, intervalMs);
  }

  stopAutoSimulation() {
    this.isRunning = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

// Standalone CLI runner (npm run mock)
if (process.argv[1] && process.argv[1].endsWith('mock-simulator.js')) {
  console.log('--- Starting Standalone Mock Event Simulator CLI ---');
  const sim = new MockSimulator({
    onEvent: (evt) => {
      console.log(`[SIMULATOR] Dispatched ${evt.type}:`, evt.user?.username, evt.data);
    }
  });
  sim.startAutoSimulation(1000);
}
