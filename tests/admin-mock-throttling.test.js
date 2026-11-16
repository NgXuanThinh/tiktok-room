// tests/admin-mock-throttling.test.js - Verify Admin/Mock spam blocking through CommandThrottler
import { WebSocket } from 'ws';
import Redis from 'ioredis';
import { REDIS_KEYS } from '../gateway/constants/gateway.constants.js';

const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
const serverBaseUrl = process.env.SERVER_URL || 'http://localhost:3000';
const adminWsUrl = process.env.WS_URL || 'ws://localhost:3001';

async function runAdminThrottlingTest() {
  console.log(`\n======================================================`);
  console.log(`[Admin Test] Testing Admin Panel Mock Chat Throttling`);
  console.log(`======================================================`);

  const redis = new Redis(redisUrl, { maxRetriesPerRequest: 1 });

  let passed = 0;
  let failed = 0;

  function assert(condition, desc) {
    if (condition) {
      console.log(`  [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${desc}`);
      failed++;
    }
  }

  try {
    // 1. Clean test keys
    await redis.del(`${REDIS_KEYS.USER_COOLDOWN_PREFIX}admin_mock_user_1`);
    await redis.del(`${REDIS_KEYS.USER_COOLDOWN_PREFIX}admin_mock_user_2`);
    await redis.del(REDIS_KEYS.BACKEND_LOAD_METRICS);

    console.log('\n--- 1. Testing Admin REST Endpoint (/api/mock/event) Rate Limiting ---');
    // First command
    const res1 = await fetch(`${serverBaseUrl}/api/mock/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'chat',
        comment: '!color red',
        user: { id: 'admin_mock_user_1', username: 'AdminTester1' }
      })
    });
    const data1 = await res1.json();
    assert(res1.status === 200 && data1.success === true, '1st REST chat command allowed (HTTP 200)');

    // Immediate spam command
    const res2 = await fetch(`${serverBaseUrl}/api/mock/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'chat',
        comment: '!dance 1',
        user: { id: 'admin_mock_user_1', username: 'AdminTester1' }
      })
    });
    const data2 = await res2.json();
    assert(res2.status === 429 && data2.dropped === true && data2.reason === 'cooldown', '2nd REST spam command blocked (HTTP 429 & reason: cooldown)');

    console.log('\n--- 2. Testing Admin WebSocket mock_trigger Rate Limiting ---');
    const ws = new WebSocket(adminWsUrl);
    const receivedMessages = [];

    ws.on('message', (raw) => {
      try {
        const parsed = JSON.parse(raw.toString());
        receivedMessages.push(parsed);
      } catch {}
    });

    await new Promise((resolve, reject) => {
      ws.on('open', resolve);
      ws.on('error', reject);
    });

    // Send 1st WS command
    ws.send(JSON.stringify({
      type: 'mock_trigger',
      action: 'chat',
      comment: '!color blue',
      user: { id: 'admin_mock_user_2', username: 'AdminTester2' }
    }));

    // Wait 300ms
    await new Promise(r => setTimeout(r, 300));

    // Send 2nd immediate spam command
    ws.send(JSON.stringify({
      type: 'mock_trigger',
      action: 'chat',
      comment: '!face smile',
      user: { id: 'admin_mock_user_2', username: 'AdminTester2' }
    }));

    // Wait until mock_rejected message is received (timeout 3000ms)
    const startWait = Date.now();
    let rejectedMsg = null;
    while (Date.now() - startWait < 3000) {
      rejectedMsg = receivedMessages.find(m => m.type === 'mock_rejected' && m.userId === 'admin_mock_user_2');
      if (rejectedMsg) break;
      await new Promise(r => setTimeout(r, 50));
    }

    console.log('  > All received messages count:', receivedMessages.length);
    console.log('  > Received message types:', receivedMessages.map(m => m.type));

    assert(rejectedMsg !== null && rejectedMsg !== undefined, 'WebSocket returned mock_rejected packet for 2nd spam command');
    assert(rejectedMsg?.reason === 'cooldown', 'mock_rejected reason is "cooldown"');
    console.log(`  > Rejection notice received: "${rejectedMsg?.message}"`);

    console.log('\n--- 3. Testing Dynamic Cooldown Configuration via REST API ---');
    // Set cooldown to 3 seconds
    const postConfigRes = await fetch(`${serverBaseUrl}/api/config/cooldown`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cooldownSec: 3 })
    });
    const postConfigData = await postConfigRes.json();
    assert(postConfigRes.status === 200 && postConfigData.cooldownSec === 3, 'POST /api/config/cooldown sets cooldown to 3s');

    // Verify GET /api/config/cooldown
    const getConfigRes = await fetch(`${serverBaseUrl}/api/config/cooldown`);
    const getConfigData = await getConfigRes.json();
    assert(getConfigRes.status === 200 && getConfigData.cooldownSec === 3, 'GET /api/config/cooldown returns 3s');

    // Test command under 3s cooldown
    await redis.del(`${REDIS_KEYS.USER_COOLDOWN_PREFIX}admin_mock_user_3`);
    const resCmd1 = await fetch(`${serverBaseUrl}/api/mock/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'chat',
        comment: '!color green',
        user: { id: 'admin_mock_user_3', username: 'AdminTester3' }
      })
    });
    assert(resCmd1.status === 200, 'User 3 first command allowed under 3s cooldown');

    const resCmd2 = await fetch(`${serverBaseUrl}/api/mock/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'chat',
        comment: '!dance 2',
        user: { id: 'admin_mock_user_3', username: 'AdminTester3' }
      })
    });
    const dataCmd2 = await resCmd2.json();
    assert(resCmd2.status === 429 && dataCmd2.cooldownSec === 3, 'Spam command dropped with cooldownSec: 3');
    assert(dataCmd2.message.includes('3s'), `Rejection message mentions 3s: "${dataCmd2.message}"`);

    console.log('\n--- 4. Testing Dynamic Cooldown Configuration via WebSocket ---');
    ws.send(JSON.stringify({
      type: 'set_cooldown',
      cooldownSec: 5
    }));

    // Wait for config_updated broadcast
    const startWaitConfig = Date.now();
    let configUpdatedMsg = null;
    while (Date.now() - startWaitConfig < 2000) {
      configUpdatedMsg = receivedMessages.find(m => m.type === 'config_updated' && m.key === 'cooldown' && m.cooldownSec === 5);
      if (configUpdatedMsg) break;
      await new Promise(r => setTimeout(r, 50));
    }
    assert(configUpdatedMsg !== null, 'WebSocket received config_updated broadcast with cooldownSec = 5');

    // Reset cooldown back to default 10s
    await fetch(`${serverBaseUrl}/api/config/cooldown`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cooldownSec: 10 })
    });

    ws.close();

    console.log(`\n======================================================`);
    console.log(`Admin Test Results: ${passed} PASSED, ${failed} FAILED`);
    console.log(`======================================================\n`);

    if (failed > 0) process.exit(1);
    process.exit(0);
  } finally {
    await redis.del(`${REDIS_KEYS.USER_COOLDOWN_PREFIX}admin_mock_user_1`);
    await redis.del(`${REDIS_KEYS.USER_COOLDOWN_PREFIX}admin_mock_user_2`);
    await redis.del(`${REDIS_KEYS.USER_COOLDOWN_PREFIX}admin_mock_user_3`);
    await redis.del(REDIS_KEYS.COMMAND_COOLDOWN_SEC);
    await redis.quit();
  }
}

runAdminThrottlingTest().catch((err) => {
  console.error('[Admin Test Failed]:', err);
  process.exit(1);
});
