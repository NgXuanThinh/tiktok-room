import assert from 'node:assert';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { WebSocket } from 'ws';

export async function run() {
  const suite = 'integration-e2e';
  const results = {
    suite,
    total: 6,
    passed: 0,
    failed: 0,
    cases: []
  };

  process.env.NODE_ENV = 'test';
  let serverMod;
  try {
    serverMod = await import('../server/server.js');
  } catch (err) {
    results.failed = results.total;
    results.error = err.code || err.message;
    results.cases.push({
      name: 'server_import',
      status: 'FAIL',
      error: `Failed to import server/server.js: ${err.message}`,
      code: err.code
    });
    return results;
  }

  const { server } = serverMod;
  assert.ok(server, 'Server must be exported from server/server.js');

  // Start on ephemeral port
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const port = address.port;
  const baseUrl = `http://127.0.0.1:${port}`;
  const wsUrl = `ws://127.0.0.1:${port}`;

  const helperRequest = (path, method = 'GET', body = null) => {
    return new Promise((resolve, reject) => {
      const url = new URL(path, baseUrl);
      const req = http.request(url, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : {}
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => resolve({ statusCode: res.statusCode, data, headers: res.headers }));
      });
      req.on('error', reject);
      if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
      req.end();
    });
  };

  const testCases = [
    // --- Characterization Tests (Passing on baseline server.js) ---
    {
      name: 'test_characterization_health_endpoint',
      category: 'characterization',
      fn: async () => {
        const res = await helperRequest('/api/health');
        assert.strictEqual(res.statusCode, 200, 'GET /api/health should return 200 OK');
        const json = JSON.parse(res.data);
        assert.strictEqual(json.status, 'ok');
        assert.strictEqual(json.service, 'tiktok-live-bar');
      }
    },
    {
      name: 'test_characterization_websocket_connection',
      category: 'characterization',
      fn: async () => {
        const ws = new WebSocket(wsUrl);
        const received = await new Promise((resolve, reject) => {
          ws.on('open', () => {});
          ws.on('message', (msg) => {
            resolve(JSON.parse(msg.toString()));
          });
          ws.on('error', reject);
          setTimeout(() => reject(new Error('WS connection timeout')), 3000);
        });
        ws.close();
        assert.strictEqual(received.type, 'connected');
      }
    },
    {
      name: 'test_characterization_server_instance',
      category: 'characterization',
      fn: () => {
        assert.ok(server.listening, 'HTTP server should be active and listening');
      }
    },

    // --- New Feature Tests (Expected to fail during Phase 8 Red-Check) ---
    {
      name: 'test_new_mock_event_injection_rest',
      category: 'new_feature',
      fn: async () => {
        const res = await helperRequest('/api/mock/event', 'POST', {
          type: 'gift',
          giftName: 'Lion',
          coins: 500
        });
        if (res.statusCode === 404) {
          throw new Error('ROUTE_NOT_FOUND: POST /api/mock/event returned 404');
        }
        assert.strictEqual(res.statusCode, 200, 'POST /api/mock/event should return 200');
      }
    },
    {
      name: 'test_new_tiktok_status_endpoint',
      category: 'new_feature',
      fn: async () => {
        const res = await helperRequest('/api/tiktok/status');
        if (res.statusCode === 404) {
          throw new Error('ROUTE_NOT_FOUND: GET /api/tiktok/status returned 404');
        }
        assert.strictEqual(res.statusCode, 200, 'GET /api/tiktok/status should return 200');
        const json = JSON.parse(res.data);
        assert.ok(json.hasOwnProperty('isConnected'), 'Response must contain isConnected');
      }
    },
    {
      name: 'test_new_avatar_proxy_route',
      category: 'new_feature',
      fn: async () => {
        const res = await helperRequest('/api/avatar?name=testuser');
        if (res.statusCode === 404) {
          throw new Error('ROUTE_NOT_FOUND: GET /api/avatar returned 404');
        }
        assert.strictEqual(res.statusCode, 200, 'GET /api/avatar should return 200');
      }
    }
  ];

  try {
    for (const tc of testCases) {
      try {
        await tc.fn();
        results.passed++;
        results.cases.push({ name: tc.name, category: tc.category, status: 'PASS' });
      } catch (err) {
        results.failed++;
        results.cases.push({
          name: tc.name,
          category: tc.category,
          status: 'FAIL',
          error: err.message
        });
      }
    }
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  return results;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run().then((res) => {
    console.log(JSON.stringify(res, null, 2));
    if (res.failed > 0) process.exit(1);
  });
}
