// server/event-normalizer.js - Pure event normalization & gift tier calculation

export const SLIME_COLORS = {
  green: { name: 'green', hex: '#00FF66', threeColor: 0x00ff66 },
  red: { name: 'red', hex: '#FF2A6D', threeColor: 0xff2a6d },
  blue: { name: 'blue', hex: '#00F0FF', threeColor: 0x00f0ff }
};

const COLOR_ALIASES = {
  green: 'green',
  lime: 'green',
  xanhla: 'green',
  xanh_la: 'green',
  'xanh lá': 'green',
  emerald: 'green',
  luc: 'green',
  'lục': 'green',
  red: 'red',
  pink: 'red',
  do: 'red',
  'đỏ': 'red',
  rose: 'red',
  hong: 'red',
  'hồng': 'red',
  blue: 'blue',
  cyan: 'blue',
  xanh: 'blue',
  xanhduong: 'blue',
  'xanh_duong': 'blue',
  'xanh dương': 'blue'
};

/**
 * Parses chat commands like !color <name>, strictly allowing the 3 canonical colors and aliases.
 * Explicitly rejects hex codes (#...) and arbitrary colors.
 * If empty argument, returns { isRandom: true }.
 * @param {string} comment
 * @returns {object|null}
 */
export function parseColorCommand(comment) {
  if (!comment || typeof comment !== 'string') return null;
  const trimmed = comment.trim();
  const match = trimmed.match(/^!color(?:\s+(.+))?$/i);
  if (!match) return null;

  const rawInput = match[1] ? match[1].trim().toLowerCase() : '';
  if (!rawInput) {
    return { isRandom: true };
  }

  const tokens = rawInput.split(/\s+/);
  const oneWord = tokens[0];
  const twoWords = tokens.slice(0, 2).join(' ');

  const resolved = COLOR_ALIASES[rawInput] || COLOR_ALIASES[twoWords] || COLOR_ALIASES[oneWord];
  if (resolved && SLIME_COLORS[resolved]) {
    return SLIME_COLORS[resolved];
  }

  if (/^(#|0x)?[0-9a-f]{3,8}$/i.test(oneWord) && !COLOR_ALIASES[oneWord]) {
    return null;
  }

  return null;
}

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
  const avatarUrl =
    raw.profilePictureUrl ||
    userObj.avatarUrl ||
    userObj.profilePictureUrl ||
    userObj.avatarThumb?.urlList?.[0] ||
    userObj.avatarMedium?.urlList?.[0] ||
    '';

  const pickValid = (...vals) => {
    for (const v of vals) {
      if (v !== undefined && v !== null) {
        const s = String(v).trim();
        if (s && s !== '0' && s !== 'undefined' && s !== 'null') {
          return s;
        }
      }
    }
    return '';
  };

  const id = pickValid(
    userObj.id,
    userObj.idStr,
    raw.userId,
    userObj.uniqueId,
    raw.uniqueId,
    raw.id
  ) || '0';

  const username = pickValid(
    raw.username,
    userObj.displayId,
    userObj.username,
    raw.uniqueId,
    userObj.uniqueId,
    raw.nickname,
    userObj.nickname
  ) || (id !== '0' ? `user_${id.slice(-4)}` : 'anonymous');

  const nickname = pickValid(
    raw.nickname,
    userObj.nickname,
    userObj.displayId,
    raw.username,
    userObj.username,
    raw.uniqueId,
    userObj.uniqueId
  ) || (username !== 'anonymous' ? username : 'Viewer');

  const res = {
    id,
    username,
    nickname,
    avatarUrl: String(avatarUrl)
  };

  const detectedLevel =
    raw.level ||
    userObj.level ||
    userObj.payGrade?.level ||
    userObj.payGrade?.score ||
    userObj.badgeList?.[0]?.level;
  if (detectedLevel !== undefined && detectedLevel !== null && detectedLevel !== '') {
    res.level = typeof detectedLevel === 'number' ? `Lv.${detectedLevel}` : String(detectedLevel);
  }

  if (raw.slimeColor || userObj.slimeColor) res.slimeColor = raw.slimeColor || userObj.slimeColor;
  if (raw.tier !== undefined || userObj.tier !== undefined) res.tier = Number(raw.tier !== undefined ? raw.tier : userObj.tier);
  if (raw.isPinned !== undefined || userObj.isPinned !== undefined) res.isPinned = Boolean(raw.isPinned ?? userObj.isPinned);

  // Follow & Fan Club attributes (TikTok LIVE proto payload)
  const isFollower =
    raw.isFollower ??
    userObj.isFollower ??
    userObj.userIdentity?.isFollowerOfAnchor ??
    (Number(raw.followStatus ?? userObj.followStatus ?? userObj.followInfo?.followStatus) >= 1);
  if (isFollower !== undefined) res.isFollower = Boolean(isFollower);

  const fansClub = raw.fansClub || userObj.fansClub || userObj.fansClubInfo;
  const fansStatus = fansClub?.userFansClubStatus ?? fansClub?.data?.userFansClubStatus;
  if (fansStatus !== undefined) {
    res.fansStatus = Number(fansStatus);
    if (Number(fansStatus) === 1) {
      res.isFan = true;
    }
  }
  if (raw.isFan || userObj.isFan) res.isFan = true;
  if (fansClub?.level || fansClub?.data?.level) {
    res.fanLevel = Number(fansClub.level || fansClub.data.level);
  }

  return res;
}

/**
 * Normalizes chat event data.
 */
export function normalizeChat(raw) {
  const rawComment = raw.content || raw.comment || raw.data?.comment || '';
  const parsedCommand = parseColorCommand(rawComment);
  const data = {
    comment: sanitizeComment(rawComment)
  };
  if (parsedCommand) {
    data.command = 'color';
    data.color = parsedCommand;
  }
  return data;
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
  const giftKey = String(raw.giftKey || raw.data?.giftKey || raw.giftName || '');
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
    giftKey,
    diamondCount,
    repeatCount,
    totalCoins,
    tier,
    ...(raw.forceTierUp !== undefined ? { forceTierUp: Boolean(raw.forceTierUp) } : {})
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
    case 'superFan':
      data = { isFan: true, isNew: true, action: 'superFan' };
      user.isFan = true;
      break;
    case 'superFanJoin':
      data = { isFan: true, isNew: false, action: 'superFanJoin' };
      user.isFan = true;
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
