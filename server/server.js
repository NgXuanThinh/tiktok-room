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

// Rate Limiter with 500ms combo aggregation and VIP bypass
const rateLimiter = new EventQueueRateLimiter({
  maxQueueSize: 100,
  comboWindowMs: 500,
  drainRateHz: 60,
  onDispatch: (event) => {
    broadcast(event);
  }
});

// TikTok Service
const tiktokService = new TikTokService();
tiktokService.on('raw_event', (type, data) => {
  const normalized = normalizeTikTokEvent(type, data);
  rateLimiter.enqueue(normalized);
});
tiktokService.on('status', (status) => {
  broadcast({ type: 'tiktok_status', data: status });
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

// Mock Event Injection REST endpoint
app.post('/api/mock/event', (req, res) => {
  const body = req.body || {};
  let evt;
  if (body.type === 'gift') {
    evt = mockSimulator.simulateGift(body.tier || 1, body.giftName, body.coins, body.user);
  } else if (body.type === 'chat') {
    evt = mockSimulator.simulateChat(body.comment || body.text, body.user);
  } else if (body.type === 'like') {
    evt = mockSimulator.simulateLikes(body.count || body.likeCount || 10, body.user);
  } else {
    evt = normalizeTikTokEvent(body.type || 'chat', body);
    rateLimiter.enqueue(evt);
  }
  res.json({ success: true, event: evt });
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

  // Initial handshake packet
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Welcome to TikTok LIVE 3D Bar WS Hub',
    status: tiktokService.getStatus()
  }));

  // Handle incoming messages from frontend client & admin panel
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'mock_trigger') {
        if (data.action === 'likes') mockSimulator.simulateLikes(data.count || 10, data.user);
        else if (data.action === 'chat') mockSimulator.simulateChat(data.comment, data.user);
        else if (data.action === 'gift') mockSimulator.simulateGift(data.tier || 1, data.giftName, data.coins, data.user, data.giftKey);
        else if (data.action === 'spawn') mockSimulator.simulateSpawn(data.user);
        else if (data.action === 'delete_avatar') broadcast({ type: 'delete_avatar', userId: data.userId });
        else if (data.action === 'clear_avatars') broadcast({ type: 'clear_avatars' });
      } else if (data.type === 'tiktok_connect') {
        tiktokService.connect(data.username).catch(() => {});
      } else if (data.type === 'tiktok_disconnect') {
        tiktokService.disconnect();
      } else if (data.type === 'admin_command') {
        // Forward admin commands from Port 3001 Cockpit to all 3D Room viewers
        broadcast(data);
      } else if (data.type === 'sync_avatars') {
        // Broadcast synced active floor avatars to all clients including Admin Cockpit
        broadcast({ type: 'active_avatars_list', data: data.list || [] });
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
adminApp.post('/api/mock/event', (req, res) => {
  const body = req.body || {};
  let evt;
  if (body.type === 'gift') {
    evt = mockSimulator.simulateGift(body.tier || 1, body.giftName, body.coins, body.user);
  } else if (body.type === 'chat') {
    evt = mockSimulator.simulateChat(body.comment || body.text, body.user);
  } else if (body.type === 'like') {
    evt = mockSimulator.simulateLikes(body.count || body.likeCount || 10, body.user);
  } else {
    evt = normalizeTikTokEvent(body.type || 'chat', body);
    rateLimiter.enqueue(evt);
  }
  res.json({ success: true, event: evt });
});

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
