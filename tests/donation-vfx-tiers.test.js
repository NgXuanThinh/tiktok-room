import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { createCyberSlime } from '../src/slime-model.js';
import { ClubEnvironment } from '../src/club-environment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function run() {
  const suite = 'donation-vfx-tiers';
  const results = {
    suite,
    total: 6,
    passed: 0,
    failed: 0,
    cases: []
  };

  const testCases = [
    {
      name: 'test_port_3000_index_html_clean_obs_no_admin_panel',
      fn: () => {
        // Requirement 1: Xoá admin panel bên port 3000
        const indexPath = path.join(__dirname, '../src/index.html');
        const content = fs.readFileSync(indexPath, 'utf-8');

        assert.ok(!content.includes('id="admin-drawer"'), 'Port 3000 index.html must NOT contain admin-drawer');
        assert.ok(!content.includes('id="admin-toggle-btn"'), 'Port 3000 index.html must NOT contain admin-toggle-btn');
        assert.ok(!content.includes('STREAMER ADMIN PANEL'), 'Port 3000 index.html must NOT contain admin title');

        // Must still contain OBS overlay components
        assert.ok(content.includes('id="hud-overlay"'), 'Must contain hud-overlay');
        assert.ok(content.includes('id="leaderboard-list"'), 'Must contain leaderboard-list');
        assert.ok(content.includes('id="gift-banner"'), 'Must contain gift-banner');
      }
    },
    {
      name: 'test_small_gift_1_coin_vs_5_coins_jumps',
      fn: () => {
        // Requirement 2: Tăng 1 coin -> nhảy 1 cái (1s). Tặng 5 coin -> nhảy 3 lần liên tiếp (1.8s)
        const av1 = createCyberSlime('cyan', { nickname: 'User1' });
        av1.triggerDonateAnimation('small', false, 1, 1);
        assert.strictEqual(av1.state.donateFx.jumpCount, 1, '1 coin must set jumpCount = 1');
        assert.strictEqual(av1.state.donateFx.duration, 1.0, '1 coin duration must be 1.0s');

        const av5 = createCyberSlime('pink', { nickname: 'User5' });
        av5.triggerDonateAnimation('small', false, 1, 5);
        assert.strictEqual(av5.state.donateFx.jumpCount, 3, '5 coins must set jumpCount = 3');
        assert.strictEqual(av5.state.donateFx.duration, 1.8, '5 coins duration must be 1.8s');

        // Test 3 consecutive jumps over 1.8s
        // Mid Jump 1: t = 0.25s
        av5.update(0.25, 0);
        assert.ok(av5.rootNode.position.y > 1.2, 'Jump 1 apex should elevate avatar');

        // Bottom of Jump 1 / Start Jump 2: t = 0.60s
        av5.update(0.35, 0); // total 0.6s
        assert.strictEqual(av5.rootNode.position.y, 0.12, 'Must land at ground before Jump 2');

        // Mid Jump 2: t = 0.85s (0.6s + 0.25s)
        av5.update(0.25, 0);
        assert.ok(av5.rootNode.position.y > 1.4, 'Jump 2 apex should elevate avatar');

        // Finish at t = 1.85s
        av5.update(1.0, 0);
        assert.strictEqual(av5.state.donateFx, null, 'Must complete after 1.8s');
        assert.strictEqual(av5.rootNode.position.y, 0.12, 'Must land at ground level');
      }
    },
    {
      name: 'test_dropping_coins_system_1_and_5_coins',
      fn: () => {
        const scene = new THREE.Scene();
        const env = new ClubEnvironment(scene);

        assert.ok(env.droppingCoinsMesh, 'Dropping coins InstancedMesh must exist');
        assert.strictEqual(env.droppingCoinsData.length, 200, 'Must have 200 coin instances');

        // Spawn 1 coin
        const origin1 = new THREE.Vector3(1, 0, 2);
        env.spawnDroppingCoins(origin1, 1);
        const active1 = env.droppingCoinsData.filter(c => c.active);
        assert.strictEqual(active1.length, 1, 'Spawning 1 coin must activate exactly 1 coin instance');
        assert.strictEqual(active1[0].x, origin1.x, 'Coin X should match origin');

        // Spawn 5 coins
        const origin5 = new THREE.Vector3(-2, 0, -1);
        env.spawnDroppingCoins(origin5, 5);
        const active5 = env.droppingCoinsData.filter(c => c.active);
        assert.strictEqual(active5.length, 6, 'Total active should now be 1 + 5 = 6 coins');

        // Test physics tick
        env.update(0.1);
        for (const c of active5) {
          assert.ok(c.vy !== 0, 'Coins should have gravity velocity');
        }
      }
    },
    {
      name: 'test_orbiting_coin_rings_tier_scaling_and_sheer_opacity',
      fn: () => {
        // Requirement 3: 20 coin -> hiệu ứng coin quay quanh người. Càng nhiều coin càng nhiều vòng (1 đến 5).
        // Opacity mờ để thấy avatar bên trong.
        const scene = new THREE.Scene();
        const env = new ClubEnvironment(scene);

        // Test 20 coins -> 1 ring
        env.spawnOrbitingCoinRings(new THREE.Vector3(0, 0, 0), 20);
        assert.strictEqual(env.activeOrbitRings.length, 1);
        assert.strictEqual(env.activeOrbitRings[0].childRings.length, 1, '20 coins must produce exactly 1 ring');
        assert.ok(env.activeOrbitRings[0].coinMat.opacity <= 0.65, 'Coin opacity must be sheer (< 0.65) to see avatar');
        assert.strictEqual(env.activeOrbitRings[0].coinMat.transparent, true, 'Coin material must be transparent');

        // Test 50 coins -> 2 rings
        env.spawnOrbitingCoinRings(new THREE.Vector3(0, 0, 0), 50);
        assert.strictEqual(env.activeOrbitRings[1].childRings.length, 2, '50 coins must produce 2 rings');

        // Test 100 coins -> 3 rings
        env.spawnOrbitingCoinRings(new THREE.Vector3(0, 0, 0), 100);
        assert.strictEqual(env.activeOrbitRings[2].childRings.length, 3, '100 coins must produce 3 rings');

        // Test 200 coins -> 4 rings
        env.spawnOrbitingCoinRings(new THREE.Vector3(0, 0, 0), 200);
        assert.strictEqual(env.activeOrbitRings[3].childRings.length, 4, '200 coins must produce 4 rings');

        // Test 499 coins -> 5 rings (max 5 rings)
        env.spawnOrbitingCoinRings(new THREE.Vector3(0, 0, 0), 499);
        assert.strictEqual(env.activeOrbitRings[4].childRings.length, 5, '350+ coins must produce max 5 rings');
      }
    },
    {
      name: 'test_floor_shockwave_system_high_and_ultra',
      fn: () => {
        const scene = new THREE.Scene();
        const env = new ClubEnvironment(scene);

        assert.strictEqual(typeof env.triggerShockwave, 'function', 'triggerShockwave method must exist');

        // High tier shockwave (Cyan)
        env.triggerShockwave(new THREE.Vector3(2, 0, 3), 'high');
        assert.strictEqual(env.activeShockwaves.length, 1);
        assert.strictEqual(env.activeShockwaves[0].mat.color.getHex(), 0x00f2fe, 'High shockwave must be Cyan');
        assert.strictEqual(env.activeShockwaves[0].maxScale, 7.5, 'High shockwave scale should be 7.5m');

        // Ultra tier shockwave (Gold, larger scale)
        env.triggerShockwave(new THREE.Vector3(0, 0, 0), 'ultra');
        const ultraSw = env.activeShockwaves.find(s => s.mat.color.getHex() === 0xffd700);
        assert.ok(ultraSw, 'Ultra shockwave must be Gold');
        assert.strictEqual(ultraSw.maxScale, 14.0, 'Ultra shockwave scale should expand to 14.0m');
      }
    },
    {
      name: 'test_mythic_royal_crown_for_ultra_luxury',
      fn: () => {
        const scene = new THREE.Scene();
        const env = new ClubEnvironment(scene);

        assert.ok(env.mythicCrownMesh, 'Mythic crown mesh must exist in ClubEnvironment');
        assert.strictEqual(env.mythicCrownActive, false, 'Crown should be inactive initially');

        env.triggerMythicCrown(new THREE.Vector3(0, 0, 0), 7.6);
        assert.strictEqual(env.mythicCrownActive, true, 'Crown should activate on trigger');
        assert.strictEqual(env.mythicCrownMesh.visible, true, 'Crown mesh should become visible');

        // Test update: ascends with soaring king
        env.update(1.0);
        assert.ok(env.mythicCrownMesh.position.y > 1.5, 'Crown should ascend with avatar');
        assert.ok(env.mythicCrownMesh.rotation.y > 0, 'Crown should be rotating');
      }
    }
  ];

  for (const tc of testCases) {
    try {
      tc.fn();
      results.passed++;
      results.cases.push({ name: tc.name, status: 'PASSED' });
    } catch (err) {
      results.failed++;
      results.cases.push({ name: tc.name, status: 'FAILED', error: err.message });
      console.error(`[FAIL] ${tc.name}:`, err.message);
    }
  }

  return results;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run().then((res) => {
    console.log(JSON.stringify(res, null, 2));
    if (res.failed > 0) process.exit(1);
  });
}
