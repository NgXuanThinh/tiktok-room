// server/avatar-proxy.js - LRU image caching, CORS bypass, and dynamic SVG fallback generator
import { LRUCache } from 'lru-cache';

// Initialize LRU cache bounded to 1,000 items with 24h TTL
export const avatarCache = new LRUCache({
  max: 1000,
  ttl: 24 * 60 * 60 * 1000 // 24 hours
});

const PALETTE = [
  ['#ff007f', '#7f00ff'], // Neon Pink -> Purple
  ['#00f2fe', '#4facfe'], // Cyan -> Blue
  ['#f093fb', '#f5576c'], // Rose -> Coral
  ['#43e97b', '#38f9d7'], // Mint -> Aqua
  ['#fa709a', '#fee140'], // Sunset Pink -> Yellow
  ['#30cfd0', '#330867'], // Turquoise -> Deep Indigo
  ['#a8edea', '#fed6e3'], // Pastel Teal -> Pink
  ['#f12711', '#f5af19']  // Flame Red -> Amber
];

/**
 * Extracts 1-2 capitalized initials from username or display name.
 */
function extractInitials(name = '') {
  if (!name || typeof name !== 'string') return '?';
  const clean = name.replace(/[^\w\s]/gi, ' ').trim();
  if (!clean) return name.slice(0, 2).toUpperCase() || '?';

  const parts = clean.split(/[\s_-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

/**
 * Generates dynamic SVG fallback avatar badge with gradient background and user initials.
 */
export function generateSvgAvatar(username = 'User', userId = '0') {
  const initials = extractInitials(username);
  
  // Hash username to select consistent gradient
  let hash = 0;
  const str = `${username}_${userId}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const colorPair = PALETTE[Math.abs(hash) % PALETTE.length];

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <linearGradient id="grad_${Math.abs(hash)}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colorPair[0]}" />
      <stop offset="100%" stop-color="${colorPair[1]}" />
    </linearGradient>
  </defs>
  <circle cx="64" cy="64" r="60" fill="url(#grad_${Math.abs(hash)})" stroke="#ffffff" stroke-width="4"/>
  <text x="64" y="74" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${initials}</text>
</svg>`;
}

/**
 * Fetches an external avatar with LRU caching, timeout protection, and SVG fallback.
 */
export async function fetchAvatarWithCache(targetUrl, username = 'Viewer', userId = '0') {
  if (!targetUrl || typeof targetUrl !== 'string' || !targetUrl.startsWith('http')) {
    const svg = generateSvgAvatar(username, userId);
    return {
      buffer: Buffer.from(svg),
      contentType: 'image/svg+xml'
    };
  }

  // Check LRU cache
  if (avatarCache.has(targetUrl)) {
    const cached = avatarCache.get(targetUrl);
    if (Buffer.isBuffer(cached)) {
      return { buffer: cached, contentType: 'image/jpeg' };
    }
    return cached;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const arrayBuf = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);
    const contentType = res.headers.get('content-type') || 'image/jpeg';

    const payload = { buffer, contentType };
    avatarCache.set(targetUrl, payload);
    return payload;
  } catch (err) {
    // Return SVG fallback on error or timeout
    const svg = generateSvgAvatar(username, userId);
    const fallback = {
      buffer: Buffer.from(svg),
      contentType: 'image/svg+xml'
    };
    return fallback;
  }
}

/**
 * Express middleware router handling GET /api/avatar
 */
export async function avatarProxyRouter(req, res, next) {
  // CORS Headers injection for browser Three.js Canvas / WebGL textures
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') res.status(204);
    if (typeof res.end === 'function') res.end();
    return;
  }

  const targetUrl = req.query?.url;
  const username = req.query?.name || req.query?.username || 'Viewer';
  const userId = req.query?.userId || '0';

  const avatar = await fetchAvatarWithCache(targetUrl, username, userId);

  res.setHeader('Content-Type', avatar.contentType);
  res.setHeader('Cache-Control', 'public, max-age=86400');
  
  if (typeof res.status === 'function') res.status(200);
  if (typeof res.send === 'function') {
    res.send(avatar.buffer);
  } else if (typeof res.end === 'function') {
    res.end(avatar.buffer);
  }
}
