// server/server.js - Express HTTP + WebSocket event dispatching server
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';

import { normalizeTikTokEvent } from './event-normalizer.js';
import { EventQueueRateLimiter } from './rate-limiter.js';
import { avatarProxyRouter } from './avatar-proxy.js';
import { TikTokService } from './tiktok-service.js';
import { MockSimulator } from './mock-simulator.js';

import Redis from 'ioredis';
import { RedisStreamConsumer } from './services/redis-stream-consumer.js';
import { LoadMonitor } from './services/load-monitor.js';
import { CommandThrottler } from '../gateway/services/command-throttler.js';
import { getRedisConfig } from '../gateway/config/redis.config.js';
import { COMMAND_CONFIG } from '../gateway/constants/gateway.constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const adminApp = express();
const adminServer = http.createServer(adminApp);

const wss = new WebSocketServer({ noServer: true });

// Attach WebSocket upgrade handling to both stream server (Port 3000) and admin server (Port 3001)
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

adminServer.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

const PORT = process.env.PORT || 3000;
const ADMIN_PORT = process.env.ADMIN_PORT || 3001;
const isDev = process.env.NODE_ENV !== 'production';
const distPath = path.join(__dirname, '../dist');
const srcPath = path.join(__dirname, '../src');
const nodeModulesPath = path.join(__dirname, '../node_modules');

// Parse JSON request bodies
app.use(express.json());

// Enable CORS for API routes
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

// Broadcast helper to all connected WebSocket clients
function broadcast(payload) {
  const msg = typeof payload === 'string' ? payload : JSON.stringify(payload);
  for (const client of wss.clients) {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(msg);
    }
  }
}

// Session State Caches for Late-joining Clients (Port 3000 F5 / Reconnect)
const sessionActiveUsers = new Map();
let sessionTopDonors = [];
let lastMinigameState = null;

// Rate Limiter with 500ms combo aggregation and VIP bypass
const rateLimiter = new EventQueueRateLimiter({
  maxQueueSize: 100,
  comboWindowMs: 500,
  drainRateHz: 60,
  onDispatch: (event) => {
    broadcast(event);
  }
});

// --- Redis Stream Consumer & Load Monitor ---
const redisConfig = getRedisConfig(process.env.REDIS_URL || 'redis://redis:6379');
export const redisClient = new Redis(redisConfig.url, { ...redisConfig, lazyConnect: true });
// Dedicated connection for blocking stream consumer so XREAD BLOCK does not block commandThrottler/loadMonitor
export const consumerRedisClient = redisClient.duplicate();

export const commandThrottler = new CommandThrottler(redisClient);

export const loadMonitor = new LoadMonitor(redisClient, {
  getActiveAvatarsCount: () => sessionActiveUsers.size,
  getQueueDepth: () => rateLimiter.getQueueSize()
});

export const streamConsumer = new RedisStreamConsumer(consumerRedisClient, {
  onEvent: (event) => {
    if (event.user && event.user.id && event.user.id !== '0') {
      sessionActiveUsers.set(String(event.user.id), {
        ...event.user,
        lastActive: Date.now()
      });
      if (sessionActiveUsers.size > 100) {
        const oldestKey = sessionActiveUsers.keys().next().value;
        sessionActiveUsers.delete(oldestKey);
      }
    }
    broadcast(event);
  }
});

// Connect to Redis & start stream consumer + load heartbeat
Promise.all([
  redisClient.connect().catch(err => { throw new Error(`redisClient: ${err.message}`); }),
  consumerRedisClient.connect().catch(err => { throw new Error(`consumerRedisClient: ${err.message}`); })
]).then(async () => {
  console.log('[Server] Connected to Redis. Starting Stream Consumer & Load Monitor.');
  await commandThrottler.getBaseCooldown();
  streamConsumer.start();
  loadMonitor.start();
}).catch((err) => {
  console.warn('[Server] Redis connection skipped (standalone fallback):', err.message);
});

// TikTok Service
const tiktokService = new TikTokService();
tiktokService.on('raw_event', (type, data) => {
  const normalized = normalizeTikTokEvent(type, data);
  if (normalized.user && normalized.user.id && normalized.user.id !== '0') {
    sessionActiveUsers.set(String(normalized.user.id), {
      ...normalized.user,
      lastActive: Date.now()
    });
    if (sessionActiveUsers.size > 100) {
      const oldestKey = sessionActiveUsers.keys().next().value;
      sessionActiveUsers.delete(oldestKey);
    }
  }
  rateLimiter.enqueue(normalized);
});

tiktokService.on('room_ranks', (data) => {
  sessionTopDonors = data.ranks || [];
  broadcast({ type: 'room_ranks', data });
});

tiktokService.on('status', (status) => {
  broadcast({ type: 'tiktok_status', data: status });
});

tiktokService.on('streamEnd', () => {
  sessionActiveUsers.clear();
  sessionTopDonors = [];
  broadcast({ type: 'session_reset' });
});

// Mock Simulator
const mockSimulator = new MockSimulator({
  onEvent: (evt) => {
    rateLimiter.enqueue(evt);
  }
});

// --- REST API Endpoints ---

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'tiktok-live-bar',
    time: new Date().toISOString()
  });
});

// Real-time Backend Load & Metrics
app.get('/api/load', async (req, res) => {
  const metrics = await loadMonitor.reportMetrics();
  res.json(metrics || { status: 'offline' });
});

// Avatar Proxy with LRU caching & SVG fallback
app.get('/api/avatar', avatarProxyRouter);

// TikTok Connection Status
app.get('/api/tiktok/status', (req, res) => {
  res.json(tiktokService.getStatus());
});

// Connect to TikTok Live
app.post('/api/tiktok/connect', async (req, res) => {
  const { username } = req.body || {};
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }
  try {
    const status = await tiktokService.connect(username);
    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Disconnect from TikTok Live
app.post('/api/tiktok/disconnect', (req, res) => {
  tiktokService.disconnect();
  res.json({ success: true, status: tiktokService.getStatus() });
});

// Dynamic Command Cooldown Configuration Handlers
async function handleGetCooldown(req, res) {
  try {
    const sec = await commandThrottler.getBaseCooldown();
    res.json({
      cooldownSec: sec,
      min: COMMAND_CONFIG.MIN_COOLDOWN_SEC,
      max: COMMAND_CONFIG.MAX_COOLDOWN_SEC
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function handleSetCooldown(req, res) {
  try {
    const raw = req.body?.cooldownSec ?? req.body?.sec;
    const sec = Number(raw);
    if (isNaN(sec) || sec < COMMAND_CONFIG.MIN_COOLDOWN_SEC || sec > COMMAND_CONFIG.MAX_COOLDOWN_SEC) {
      return res.status(400).json({
        error: `Thời gian cooldown phải từ ${COMMAND_CONFIG.MIN_COOLDOWN_SEC} đến ${COMMAND_CONFIG.MAX_COOLDOWN_SEC} giây`
      });
    }
    const savedSec = await commandThrottler.setBaseCooldown(sec);
    console.log(`[Config] Command cooldown updated to ${savedSec}s`);
    broadcast({
      type: 'config_updated',
      key: 'cooldown',
      cooldownSec: savedSec
    });
    res.json({ success: true, cooldownSec: savedSec });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

app.get('/api/config/cooldown', handleGetCooldown);
app.post('/api/config/cooldown', handleSetCooldown);

// Central mock event dispatcher with CommandThrottler rate-limiting
async function handleMockEvent(body) {
  if (body.type === 'gift') {
    const evt = mockSimulator.simulateGift(body.tier || 1, body.giftName, body.coins, body.user);
    return { success: true, event: evt };
  } else if (body.type === 'chat') {
    const user = body.user || mockSimulator.getRandomViewer();
    const comment = body.comment || body.text || '';
    const userId = user.id || user.userId || user.username || 'anon';

    const check = await commandThrottler.canExecute(userId, comment);
    if (!check.allowed) {
      const cooldownSec = check.cooldownSec || commandThrottler.baseCooldownSec || 10;
      const reasonText = check.reason === 'frozen'
        ? 'Đang chiếu Showcase Quà VIP'
        : `Đang trong thời gian cooldown ${cooldownSec}s`;
      console.log(`[Admin/Mock REST] Chat command dropped for user ${userId}: reason = ${check.reason} (${cooldownSec}s)`);
      return {
        success: false,
        dropped: true,
        reason: check.reason,
        cooldownSec,
        userId,
        comment,
        message: `Lệnh "${comment}" của ${user.nickname || user.username || userId} bị chặn (${reasonText})`
      };
    }
    const evt = mockSimulator.simulateChat(comment, user);
    return { success: true, event: evt };
  } else if (body.type === 'like') {
    const evt = mockSimulator.simulateLikes(body.count || body.likeCount || 10, body.user);
    return { success: true, event: evt };
  } else {
    const evt = normalizeTikTokEvent(body.type || 'chat', body);
    rateLimiter.enqueue(evt);
    return { success: true, event: evt };
  }
}

// Mock Event Injection REST endpoint
app.post('/api/mock/event', async (req, res) => {
  const result = await handleMockEvent(req.body || {});
  res.status(result.success ? 200 : 429).json(result);
});

// --- Static Asset Serving ---
app.use('/node_modules', express.static(nodeModulesPath));
app.use('/public', express.static(path.join(__dirname, '../public')));
app.use('/src', express.static(srcPath));

if (isDev) {
  // In development, serve directly from /src for instant F5 live updates without image rebuilds
  app.use(express.static(srcPath));
} else {
  app.use(express.static(distPath));
}

// Fallback index.html for OBS browser source & Web client
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const indexPath = isDev ? path.join(srcPath, 'index.html') : path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      // Fallback to src/index.html in dev mode
      res.sendFile(path.join(srcPath, 'index.html'));
    }
  });
});

// --- WebSocket Handling ---
wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });

  // Initial handshake packet with active session state
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Welcome to TikTok LIVE 3D Bar WS Hub',
    status: tiktokService.getStatus()
  }));

  ws.send(JSON.stringify({
    type: 'initial_session_state',
    status: tiktokService.getStatus(),
    activeUsers: Array.from(sessionActiveUsers.values()),
    topDonors: sessionTopDonors,
    minigameState: lastMinigameState,
    commandCooldownSec: commandThrottler.baseCooldownSec
  }));

  // Handle incoming messages from frontend client & admin panel
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'set_cooldown') {
        const raw = data.cooldownSec ?? data.sec;
        const sec = Number(raw);
        if (!isNaN(sec) && sec >= COMMAND_CONFIG.MIN_COOLDOWN_SEC && sec <= COMMAND_CONFIG.MAX_COOLDOWN_SEC) {
          commandThrottler.setBaseCooldown(sec).then((savedSec) => {
            console.log(`[Admin WS] Command cooldown updated to ${savedSec}s`);
            broadcast({
              type: 'config_updated',
              key: 'cooldown',
              cooldownSec: savedSec
            });
          }).catch(console.error);
        }
      }
      else if (data.type === 'mock_trigger') {
        if (data.action === 'likes') mockSimulator.simulateLikes(data.count || 10, data.user);
        else if (data.action === 'chat') {
          const user = data.user || mockSimulator.getRandomViewer();
          const comment = data.comment || '';
          const userId = user.id || user.userId || user.username || 'anon';

          commandThrottler.canExecute(userId, comment).then((check) => {
            if (check.allowed) {
              mockSimulator.simulateChat(comment, user);
            } else {
              const cooldownSec = check.cooldownSec || commandThrottler.baseCooldownSec || 10;
              const reasonText = check.reason === 'frozen'
                ? 'Đang chiếu Showcase Quà VIP'
                : `Đang trong thời gian cooldown ${cooldownSec}s`;
              const rejectPayload = {
                type: 'mock_rejected',
                reason: check.reason,
                cooldownSec,
                comment,
                userId,
                username: user.nickname || user.username || userId,
                message: `Lệnh "${comment}" của ${user.nickname || user.username || userId} bị chặn (${reasonText})`
              };
              console.log(`[Admin/Mock WS] Chat command dropped for user ${userId}: reason = ${check.reason} (${cooldownSec}s)`);
              broadcast(rejectPayload);
            }
          }).catch(() => {
            mockSimulator.simulateChat(comment, user);
          });
        }
        else if (data.action === 'gift') mockSimulator.simulateGift(data.tier || 1, data.giftName, data.coins, data.user, data.giftKey, data.forceTierUp);
        else if (data.action === 'spawn') mockSimulator.simulateSpawn(data.user);
        else if (data.action === 'delete_avatar') broadcast({ type: 'delete_avatar', userId: data.userId });
        else if (data.action === 'clear_avatars') broadcast({ type: 'clear_avatars' });
        else if (data.action === 'fan') {
          const userPayload = data.user || mockSimulator.getRandomViewer();
          const evt = normalizeTikTokEvent('superFan', { ...userPayload, isFan: true });
          rateLimiter.enqueue(evt);
        } else if (data.action === 'follow') {
          const userPayload = data.user || mockSimulator.getRandomViewer();
          const evt = normalizeTikTokEvent('follow', { ...userPayload, isFollower: true });
          rateLimiter.enqueue(evt);
        }
      } else if (data.type === 'tiktok_connect') {
        sessionActiveUsers.clear();
        sessionTopDonors = [];
        broadcast({ type: 'session_reset' });
        tiktokService.connect(data.username).catch((err) => {
          broadcast({ type: 'tiktok_error', error: err.message });
        });
      } else if (data.type === 'tiktok_disconnect') {
        sessionActiveUsers.clear();
        sessionTopDonors = [];
        tiktokService.disconnect();
        broadcast({ type: 'session_reset' });
      } else if (data.type === 'refresh_floor') {
        sessionActiveUsers.clear();
        broadcast({
          type: 'refresh_floor',
          ranks: sessionTopDonors,
          total: tiktokService.viewerCount
        });
      } else if (data.type === 'admin_command') {
        // Forward admin commands from Port 3001 Cockpit to all 3D Room viewers
        broadcast(data);
      } else if (data.type === 'minigame_state_sync') {
        lastMinigameState = data;
        broadcast(data);
      } else if (data.type === 'minigame_action') {
        broadcast(data);
      } else if (data.type === 'sync_avatars') {
        const activeList = data.list || [];
        // Broadcast synced active floor avatars to all clients including Admin Cockpit
        broadcast({ type: 'active_avatars_list', data: activeList });
        // Synchronize server cache so late-joining clients only receive currently active users
        const activeIds = new Set(activeList.map((u) => String(u.userId)));
        for (const id of sessionActiveUsers.keys()) {
          if (!activeIds.has(id)) {
            sessionActiveUsers.delete(id);
          }
        }
      }
    } catch (e) {}
  });
});

// WebSocket Heartbeat (ping every 15s to drop dead connections)
const heartbeatInterval = setInterval(() => {
  for (const ws of wss.clients) {
    if (ws.isAlive === false) {
      ws.terminate();
    } else {
      ws.isAlive = false;
      ws.ping();
    }
  }
}, 15000);
if (heartbeatInterval.unref) {
  heartbeatInterval.unref();
}

wss.on('close', () => {
  clearInterval(heartbeatInterval);
});

// --- Admin App (Port 3001) Configuration ---
adminApp.use(express.json());
adminApp.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

// Admin Healthcheck
adminApp.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'tiktok-live-bar-admin',
    port: ADMIN_PORT,
    time: new Date().toISOString()
  });
});

// Admin Avatar Proxy with LRU caching & SVG fallback
adminApp.get('/api/avatar', avatarProxyRouter);

// Admin TikTok Connection Status
adminApp.get('/api/tiktok/status', (req, res) => {
  res.json(tiktokService.getStatus());
});

// Admin Connect to TikTok Live
adminApp.post('/api/tiktok/connect', async (req, res) => {
  const { username } = req.body || {};
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }
  try {
    const status = await tiktokService.connect(username);
    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Disconnect from TikTok Live
adminApp.post('/api/tiktok/disconnect', (req, res) => {
  tiktokService.disconnect();
  res.json({ success: true, status: tiktokService.getStatus() });
});

// Admin Mock Event Injection REST endpoint
adminApp.post('/api/mock/event', async (req, res) => {
  const result = await handleMockEvent(req.body || {});
  res.status(result.success ? 200 : 429).json(result);
});

// Admin Command Cooldown Configuration
adminApp.get('/api/config/cooldown', handleGetCooldown);
adminApp.post('/api/config/cooldown', handleSetCooldown);

// Admin Static Asset Serving
adminApp.use('/node_modules', express.static(nodeModulesPath));
adminApp.use('/public', express.static(path.join(__dirname, '../public')));
adminApp.use('/src', express.static(srcPath));

// Admin Root & Fallback: Serve admin.html
adminApp.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const adminPath = path.join(srcPath, 'admin.html');
  res.sendFile(adminPath);
});

// Listen if not in test mode
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`TikTok LIVE 3D Bar server running on http://localhost:${PORT}`);
  });
  adminServer.listen(ADMIN_PORT, () => {
    console.log(`TikTok LIVE Streamer Admin Cockpit running on http://localhost:${ADMIN_PORT}`);
  });
}

export { app, server, adminApp, adminServer, wss, rateLimiter, tiktokService, mockSimulator };
