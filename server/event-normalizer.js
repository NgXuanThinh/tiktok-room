// server/event-normalizer.js - Pure event normalization & gift tier calculation

const BANNED_WORDS = [
  'scam',
  'cheat',
  'hack',
  'fuck',
  'shit',
  'spam',
  'bitch',
  'asshole',
  'cunt',
  'dick',
  'scammer',
  'cheater',
  'hacker'
];

// Build regex matching word boundaries for banned words
const BANNED_REGEX = new RegExp(`\\b(${BANNED_WORDS.join('|')})\\b`, 'gi');

/**
 * Sanitizes chat comments by replacing banned profanity words with asterisks matching their character length.
 * @param {string} text
 * @returns {string}
 */
export function sanitizeComment(text) {
  if (typeof text !== 'string') return '';
  return text.replace(BANNED_REGEX, (match) => '*'.repeat(match.length));
}

/**
 * Normalizes user information from raw TikTok payloads.
 */
function extractUser(raw) {
  const userObj = raw.user || {};
  return {
    id: String(raw.userId || userObj.id || raw.uniqueId || '0'),
    username: String(raw.uniqueId || userObj.username || raw.nickname || 'anonymous'),
    nickname: String(raw.nickname || userObj.nickname || raw.uniqueId || 'Viewer'),
    avatarUrl: String(raw.profilePictureUrl || userObj.avatarUrl || userObj.profilePictureUrl || '')
  };
}

/**
 * Normalizes chat event data.
 */
export function normalizeChat(raw) {
  const rawComment = raw.comment || raw.data?.comment || '';
  return {
    comment: sanitizeComment(rawComment)
  };
}

/**
 * Normalizes gift event data and resolves coin tiers.
 * Tier 1: 1 - 99 coins (Small celebration, Ting Ting SFX, dance cheer)
 * Tier 2: 100 - 499 coins (Spotlight focus, sparklers, 1.2x scale)
 * Tier 3: 500 - 1999 coins (VIP podium solo dance, full room fireworks, DJ airhorn, giant banner)
 * Tier 4: 2000+ coins (Ultra Frenzy trigger, Supernova explosion, 1.5x giant scale)
 */
export function normalizeGift(raw) {
  const giftId = Number(raw.giftId || 0);
  const giftName = String(raw.giftName || raw.data?.giftName || 'Gift');
  const diamondCount = Math.max(0, Number(raw.diamondCount || raw.coins || raw.coinCount || 0));
  const repeatCount = Math.max(1, Number(raw.repeatCount || 1));
  const totalCoins = diamondCount * repeatCount;

  let tier = 1;
  if (totalCoins >= 2000) {
    tier = 4;
  } else if (totalCoins >= 500) {
    tier = 3;
  } else if (totalCoins >= 100) {
    tier = 2;
  } else {
    tier = 1;
  }

  return {
    giftId,
    giftName,
    diamondCount,
    repeatCount,
    totalCoins,
    tier
  };
}

/**
 * Normalizes like event data.
 */
export function normalizeLike(raw) {
  const likeCount = Math.max(1, Number(raw.likeCount || 1));
  const totalLikeCount = Math.max(likeCount, Number(raw.totalLikeCount || raw.totalLikes || likeCount));
  return {
    likeCount,
    totalLikeCount
  };
}

/**
 * Normalizes social events (follow, share, member join).
 */
export function normalizeSocial(type, raw) {
  return {
    action: type,
    label: raw.label || type
  };
}

/**
 * Main dispatcher normalizing any incoming raw TikTok event into unified schema.
 * @param {string} type - Event type ('chat', 'gift', 'like', 'follow', 'share', 'member')
 * @param {object} raw - Raw payload
 * @returns {object} Normalized event
 */
export function normalizeTikTokEvent(type, raw = {}) {
  const id = `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const timestamp = Date.now();
  const user = extractUser(raw);

  let data = {};
  switch (type) {
    case 'chat':
      data = normalizeChat(raw);
      break;
    case 'gift':
      data = normalizeGift(raw);
      break;
    case 'like':
      data = normalizeLike(raw);
      break;
    case 'follow':
    case 'share':
    case 'member':
      data = normalizeSocial(type, raw);
      break;
    default:
      data = { ...raw };
      break;
  }

  return {
    id,
    type,
    user,
    data,
    timestamp
  };
}
