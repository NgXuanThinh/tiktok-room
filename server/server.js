import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, '../dist');

app.use(express.static(distPath));
app.use('/public', express.static(path.join(__dirname, '../public')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'tiktok-live-bar', time: new Date().toISOString() });
});

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'connected', message: 'Welcome to TikTok LIVE 3D Bar WS' }));
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`TikTok LIVE 3D Bar server running on http://localhost:${PORT}`);
  });
}

export { app, server, wss };
