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
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, '../dist');
const srcPath = path.join(__dirname, '../src');

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
app.use(express.static(distPath));
app.use('/src', express.static(srcPath));
app.use('/public', express.static(path.join(__dirname, '../public')));

// Fallback index.html for OBS browser source
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const indexPath = path.join(distPath, 'index.html');
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

  // Handle incoming messages from frontend client
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'mock_trigger') {
        if (data.action === 'likes') mockSimulator.simulateLikes(data.count || 10);
        else if (data.action === 'chat') mockSimulator.simulateChat(data.comment);
        else if (data.action === 'gift') mockSimulator.simulateGift(data.tier || 1, data.giftName, data.coins);
      } else if (data.type === 'tiktok_connect') {
        tiktokService.connect(data.username).catch(() => {});
      } else if (data.type === 'tiktok_disconnect') {
        tiktokService.disconnect();
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

// Listen if not in test mode
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`TikTok LIVE 3D Bar server running on http://localhost:${PORT}`);
  });
}

export { app, server, wss, rateLimiter, tiktokService, mockSimulator };
