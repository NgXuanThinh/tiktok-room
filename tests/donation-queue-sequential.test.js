// tests/donation-queue-sequential.test.js - QA Suite for Unified Sequential Donation Queue & Camera Zoom
import assert from 'node:assert';
import { DONATION_CAMERA_CONFIG, DONATION_QUEUE_CONFIG } from '../src/donation-constants.js';
import {
  initDonationQueue,
  enqueueDonation,
  getDonationQueueLength,
  isDonationProcessing,
  clearDonationQueue,
  processNextDonation
} from '../src/donation-queue.js';

export async function run() {
  const suite = 'donation-queue-sequential';
  const results = {
    suite,
    total: 7,
    passed: 0,
    failed: 0,
    cases: []
  };

  const test = async (name, fn) => {
    try {
      await fn();
      results.passed++;
      results.cases.push({ name, status: 'PASS' });
      console.log(`  ✓ ${name}`);
    } catch (err) {
      results.failed++;
      results.cases.push({ name, status: 'FAIL', error: err.message });
      console.error(`  ✗ ${name}:`, err.message);
    }
  };

  console.log('Testing Unified Sequential Donation Queue & Camera Zoom Configurations...');

  // Test 1: Constant configurations verification
  await test('DONATION_CAMERA_CONFIG defines 1.0s for small, 2.0s for medium and preserves high/ultra', () => {
    assert.strictEqual(DONATION_CAMERA_CONFIG.small.duration, 1.0, 'Small donation camera zoom must be strictly 1.0s');
    assert.strictEqual(DONATION_CAMERA_CONFIG.medium.duration, 2.0, 'Medium donation camera zoom must be strictly 2.0s');
    assert.ok(DONATION_CAMERA_CONFIG.high.duration >= 4.0, 'High donation duration must be preserved');
    assert.ok(DONATION_CAMERA_CONFIG.ultra.duration >= 5.0, 'Ultra donation duration must be preserved');
    assert.ok(DONATION_QUEUE_CONFIG.interItemDelayMs >= 100, 'Queue inter-item delay must be configured');
  });

  // Test 2: Small donation triggers camera zoom with 1.0s duration and small effects
  await test('Small donation triggers focusDonationAvatar with small config (1.0s) and small effects', () => {
    clearDonationQueue();

    let focusedAvatar = null;
    let focusOptions = null;
    let sfxPlayed = null;
    let animationTriggered = null;

    const mockAvatar = {
      position: { x: 1, y: 0, z: -2, clone: () => ({ x: 1, y: 0, z: -2 }) },
      userData: {
        controller: {
          triggerDonateAnimation: (cfg) => { animationTriggered = cfg; }
        }
      }
    };

    const mockContext = {
      sceneManager: {
        focusDonationAvatar: (av, opt, onArrived) => {
          focusedAvatar = av;
          focusOptions = opt;
          if (typeof onArrived === 'function') onArrived();
        },
        revertFromCinematic: () => {}
      },
      audioSystem: {
        playSfx: (key) => { sfxPlayed = key; }
      },
      clubEnvironment: {
        focusSpotlights: () => {},
        spawnDroppingCoins: () => {}
      }
    };

    initDonationQueue(mockContext);

    enqueueDonation({
      avatar: mockAvatar,
      category: 'small',
      giftKey: 'rose',
      coins: 1,
      context: mockContext
    });

    assert.strictEqual(isDonationProcessing(), true, 'Queue must be actively processing');
    assert.strictEqual(focusedAvatar, mockAvatar, 'Must zoom to donating avatar');
    assert.strictEqual(focusOptions.duration, 1.0, 'Camera zoom option must specify 1.0s duration');
    assert.strictEqual(sfxPlayed, 'coin', 'Must play coin sound effect');
    assert.strictEqual(animationTriggered?.duration, 1.5, 'Avatar animation duration must preserve configured duration (1.5s)');

    clearDonationQueue();
  });

  // Test 3: Medium donation triggers camera zoom with 2.0s duration and medium effects
  await test('Medium donation triggers focusDonationAvatar with medium config (2.0s) and medium effects', () => {
    clearDonationQueue();

    let focusedAvatar = null;
    let focusOptions = null;
    let sfxPlayed = null;
    let ringsSpawned = false;

    const mockAvatar = {
      position: { x: -2, y: 0, z: 1, clone: () => ({ x: -2, y: 0, z: 1 }) },
      userData: {
        controller: {
          triggerDonateAnimation: () => {}
        }
      }
    };

    const mockContext = {
      sceneManager: {
        focusDonationAvatar: (av, opt, onArrived) => {
          focusedAvatar = av;
          focusOptions = opt;
          if (typeof onArrived === 'function') onArrived();
        },
        revertFromCinematic: () => {}
      },
      audioSystem: {
        playSfx: (key) => { sfxPlayed = key; }
      },
      clubEnvironment: {
        focusSpotlights: () => {},
        spawnOrbitingCoinRings: (mesh, coins, dur) => {
          ringsSpawned = true;
          assert.strictEqual(dur, 3.0, 'Orbiting rings duration for 50 coins must be 3.0s as configured');
        },
        triggerFireworks: () => {}
      }
    };

    initDonationQueue(mockContext);

    enqueueDonation({
      avatar: mockAvatar,
      category: 'medium',
      giftKey: 'perfume',
      coins: 50,
      context: mockContext
    });

    assert.strictEqual(isDonationProcessing(), true);
    assert.strictEqual(focusedAvatar, mockAvatar);
    assert.strictEqual(focusOptions.duration, 2.0, 'Medium camera zoom duration must be 2.0s');
    assert.strictEqual(sfxPlayed, 'bassBoom', 'Medium must play bassBoom SFX');
    assert.strictEqual(ringsSpawned, true, 'Medium must spawn orbiting coin rings');

    clearDonationQueue();
  });

  // Test 4: Sequential FIFO ordering across mixed tiers (Small -> Medium -> High)
  await test('Mixed tier donations enqueue into FIFO sequence without colliding', () => {
    clearDonationQueue();

    const mockContext = {
      sceneManager: {
        focusDonationAvatar: () => {},
        focusSlimeCinematic: () => {},
        revertFromCinematic: () => {}
      },
      audioSystem: { playSfx: () => {} },
      clubEnvironment: {
        focusSpotlights: () => {},
        spawnDroppingCoins: () => {},
        spawnOrbitingCoinRings: () => {}
      }
    };

    initDonationQueue(mockContext);

    const av1 = { position: { x: 0, y: 0, z: 0, clone: () => ({ x: 0, y: 0, z: 0 }) }, userData: {} };
    const av2 = { position: { x: 1, y: 0, z: 1, clone: () => ({ x: 1, y: 0, z: 1 }) }, userData: {} };
    const av3 = { position: { x: 2, y: 0, z: 2, clone: () => ({ x: 2, y: 0, z: 2 }) }, userData: {} };

    // Enqueue 1st: Small
    enqueueDonation({ avatar: av1, category: 'small', coins: 1, context: mockContext });
    assert.strictEqual(isDonationProcessing(), true);
    assert.strictEqual(getDonationQueueLength(), 0, '1st item is immediately processing');

    // Enqueue 2nd: Medium
    enqueueDonation({ avatar: av2, category: 'medium', coins: 50, context: mockContext });
    assert.strictEqual(getDonationQueueLength(), 1, '2nd item waits in FIFO queue');

    // Enqueue 3rd: High
    enqueueDonation({ avatar: av3, category: 'high', coins: 1000, context: mockContext });
    assert.strictEqual(getDonationQueueLength(), 2, '3rd item waits in FIFO queue');

    clearDonationQueue();
    assert.strictEqual(getDonationQueueLength(), 0);
    assert.strictEqual(isDonationProcessing(), false);
  });

  // Test 5: Revert from cinematic when queue becomes empty
  await test('SceneManager revertFromCinematic is requested when all queue items finish', async () => {
    clearDonationQueue();

    let reverted = false;
    const mockContext = {
      sceneManager: {
        revertFromCinematic: () => { reverted = true; }
      }
    };

    initDonationQueue(mockContext);

    // Call processNextDonation with empty queue
    processNextDonation();

    // Check after auto-revert delay
    await new Promise((r) => setTimeout(r, 250));
    assert.strictEqual(reverted, true, 'revertFromCinematic must be called when queue is empty');
  });

  // Test 6: focusDonationAvatar aligns camLookTarget directly to avatar 3D position
  await test('SceneManager.focusDonationAvatar precisely targets avatar 3D position and does not default to (0, 0)', async () => {
    const { SceneManager } = await import('../src/scene-manager.js');
    const fakeContainer = { clientWidth: 1280, clientHeight: 720, appendChild: () => {} };
    const sm = new SceneManager(fakeContainer);

    // Mock slime placed at slot (x = 3.6, z = -4.2)
    const mockSlimeMesh = {
      isObject3D: true,
      position: { x: 3.6, y: 0, z: -4.2 },
      userData: {
        controller: {
          rootNode: { position: { x: 0, y: 0.12, z: 0 } }
        }
      }
    };

    sm.focusDonationAvatar(mockSlimeMesh, { duration: 1.0, distance: 2.8, elevation: 1.15 });

    assert.ok(Math.abs(sm.camLookTarget.x - 3.6) < 0.05, `Look target X (${sm.camLookTarget.x}) must align with slime X (3.6)`);
    assert.ok(Math.abs(sm.camLookTarget.z - (-4.2)) < 0.05, `Look target Z (${sm.camLookTarget.z}) must align with slime Z (-4.2)`);
    assert.ok(sm.camLookTarget.y > 0.5, 'Look target Y must focus on slime upper body/face');

    // Camera must NOT be at (0, 0)
    assert.ok(Math.abs(sm.camTargetPos.x) > 0.5, 'Camera target X must not be 0');
  });

  // Test 7: 3-Phase Lifecycle strictly delays Slime effects until Zoom In completes (onArrived)
  await test('3-Phase Sequence: Slime effects do NOT play until camera arrives (Zoom In -> Effects -> Zoom Out)', () => {
    clearDonationQueue();

    let animationTriggered = false;
    let coinsSpawned = false;
    let cameraArrivedCallback = null;

    const mockAvatar = {
      position: { x: 2, y: 0, z: -3, clone: () => ({ x: 2, y: 0, z: -3 }) },
      userData: {
        controller: {
          triggerDonateAnimation: () => { animationTriggered = true; }
        }
      }
    };

    const mockContext = {
      sceneManager: {
        focusDonationAvatar: (av, opt, onArrived) => {
          cameraArrivedCallback = onArrived;
        },
        revertFromCinematic: () => {}
      },
      audioSystem: { playSfx: () => {} },
      clubEnvironment: {
        focusSpotlights: () => {},
        spawnDroppingCoins: () => { coinsSpawned = true; }
      }
    };

    initDonationQueue(mockContext);

    // Enqueue small donation
    enqueueDonation({
      avatar: mockAvatar,
      category: 'small',
      giftKey: 'rose',
      coins: 1,
      context: mockContext
    });

    // Phase 1: Camera is zooming in. Slime effect must NOT have triggered yet!
    assert.strictEqual(animationTriggered, false, 'Phase 1: Slime animation must NOT trigger while camera is zooming in');
    assert.strictEqual(coinsSpawned, false, 'Phase 1: Coins must NOT drop while camera is zooming in');
    assert.ok(typeof cameraArrivedCallback === 'function', 'onArrived callback must be registered');

    // Simulate Phase 1 completion (Camera arrived in front of Slime)
    cameraArrivedCallback();

    // Phase 2: Slime effects now trigger!
    assert.strictEqual(animationTriggered, true, 'Phase 2: Slime animation must trigger immediately after camera arrives');
    assert.strictEqual(coinsSpawned, true, 'Phase 2: Coins must drop immediately after camera arrives');

    clearDonationQueue();
  });

  return results;
}

if (process.argv[1] && process.argv[1].endsWith('donation-queue-sequential.test.js')) {
  run().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
