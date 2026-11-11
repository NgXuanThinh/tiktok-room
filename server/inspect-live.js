// server/inspect-live.js - Real-time TikTok LIVE Webcast Event Inspector & Raw Payload Tap
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as TikTokLib from 'tiktok-live-connector';
import { normalizeTikTokEvent } from './event-normalizer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LiveConnectionClass =
  TikTokLib.TikTokLiveConnection ||
  TikTokLib.WebcastPushConnection ||
  TikTokLib.default?.TikTokLiveConnection ||
  TikTokLib.default?.WebcastPushConnection;

if (!LiveConnectionClass) {
  console.error('[FATAL] TikTokLiveConnection class not found in tiktok-live-connector!');
  process.exit(1);
}

// Extract target username from CLI args
const args = process.argv.slice(2);
let targetUsername = args.find((a) => !a.startsWith('--')) || 'noibuoncue';
targetUsername = targetUsername.replace(/^@/, '').trim();

const shouldSaveLog = args.includes('--save-log') || true; // default save log for audit
const logDir = path.join(__dirname, '../logs');
if (shouldSaveLog && !fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const logFilePath = path.join(logDir, `inspect-${targetUsername}-${timestamp}.jsonl`);
let logStream = null;
if (shouldSaveLog) {
  logStream = fs.createWriteStream(logFilePath, { flags: 'a', encoding: 'utf8' });
  console.log(`[LOGGER] Recording raw + normalized events to: ${logFilePath}`);
}

console.log('====================================================');
console.log(`  TikTok LIVE Event Inspector`);
console.log(`  Target: @${targetUsername}`);
console.log('====================================================\n');

const connection = new LiveConnectionClass(targetUsername, {
  processInitialData: false,
  enableExtendedGiftInfo: false,
  requestPollingIntervalMs: 1000
});

function formatTime() {
  const d = new Date();
  return d.toTimeString().split(' ')[0] + '.' + String(d.getMilliseconds()).padStart(3, '0');
}

function logEvent(type, rawData) {
  const timeStr = formatTime();
  const normalized = normalizeTikTokEvent(type, rawData);

  // Write to JSONL
  if (logStream) {
    const record = {
      timestamp: Date.now(),
      timeFormatted: timeStr,
      type,
      raw: rawData,
      normalized
    };
    logStream.write(JSON.stringify(record) + '\n');
  }

  // Console output
  const userStr = normalized.user ? `${normalized.user.nickname} (@${normalized.user.username})` : 'System';

  console.log(`\n----------------------------------------------------`);
  console.log(`[${timeStr}] 📡 EVENT: \x1b[36m${type.toUpperCase()}\x1b[0m | User: \x1b[33m${userStr}\x1b[0m`);

  switch (type) {
    case 'gift': {
      console.log(`  🎁 Gift: \x1b[32m${normalized.data.giftName}\x1b[0m (ID: ${normalized.data.giftId})`);
      console.log(`  💎 Coins: \x1b[35m${normalized.data.diamondCount}\x1b[0m x${normalized.data.repeatCount} = \x1b[1m${normalized.data.totalCoins} total\x1b[0m`);
      console.log(`  ⭐ Assigned Tier: \x1b[31mTier ${normalized.data.tier}\x1b[0m`);
      break;
    }
    case 'chat': {
      console.log(`  💬 Comment: "${normalized.data.comment}"`);
      if (normalized.data.command === 'color') {
        console.log(`  🎨 Color Command: \x1b[32m${normalized.data.color?.name}\x1b[0m (${normalized.data.color?.hex})`);
      }
      break;
    }
    case 'like': {
      console.log(`  ❤️ Likes: +${normalized.data.likeCount} (Session total: ${normalized.data.totalLikeCount})`);
      break;
    }
    case 'member': {
      console.log(`  🚪 Member joined room: @${normalized.user.username}`);
      break;
    }
    case 'follow': {
      console.log(`  ➕ Followed channel! isFollower: \x1b[32m${normalized.user.isFollower}\x1b[0m`);
      break;
    }
    case 'superFan':
    case 'superFanJoin': {
      console.log(`  🌟 SuperFan: FanStatus: ${normalized.user.fansStatus ?? 'N/A'}, FanLevel: \x1b[33m${normalized.user.fanLevel ?? 'N/A'}\x1b[0m, isNew: ${normalized.data.isNew}`);
      break;
    }
    case 'roomUser': {
      console.log(`  👥 Live Viewer Count: \x1b[32m${rawData.viewerCount}\x1b[0m`);
      break;
    }
    default: {
      console.log(`  Payload:`, JSON.stringify(normalized.data || rawData).slice(0, 150));
      break;
    }
  }

  // Output sample raw fields for debugging schema diffs
  const rawPreview = {
    user: rawData.user ? { id: rawData.user.id, uniqueId: rawData.user.uniqueId, followStatus: rawData.user.followStatus, fansClub: rawData.user.fansClub } : undefined,
    userId: rawData.userId,
    uniqueId: rawData.uniqueId,
    fansClub: rawData.fansClub,
    followStatus: rawData.followStatus
  };
  console.log(`  🔎 Raw identity probe:`, JSON.stringify(rawPreview));
}

// Bind all listeners
const events = ['chat', 'gift', 'like', 'member', 'social', 'follow', 'superFan', 'superFanJoin'];
events.forEach((evtName) => {
  connection.on(evtName, (data) => logEvent(evtName, data));
});

connection.on('roomUser', (data) => {
  logEvent('roomUser', data);
});

connection.on('streamEnd', () => {
  console.log('\n[INFO] 🛑 Livestream has ended.');
});

connection.on('disconnected', () => {
  console.log('\n[WARN] ⚠️ Disconnected from TikTok webcast.');
});

connection.on('error', (err) => {
  console.error('\n[ERROR] ❌ TikTok connection error:', err.message || err);
});

async function start() {
  console.log(`Connecting to TikTok LIVE @${targetUsername}...`);
  try {
    const state = await connection.connect();
    console.log(`\n\x1b[32m[SUCCESS] Connected to TikTok LIVE room!\x1b[0m`);
    console.log(`  Room ID:      ${state.roomId}`);
    console.log(`  Target:       @${targetUsername}`);
    console.log(`  Listening for events... Press Ctrl+C to stop.\n`);
  } catch (err) {
    console.error(`\n\x1b[31m[FAILED] Failed to connect to @${targetUsername}:\x1b[0m`, err.message || err);
    if (err.name === 'UserOfflineError') {
      console.log(`Note: User @${targetUsername} is currently offline.`);
    }
    process.exit(1);
  }
}

process.on('SIGINT', () => {
  console.log('\nShutting down inspector...');
  if (logStream) logStream.end();
  connection.disconnect();
  process.exit(0);
});

start();
