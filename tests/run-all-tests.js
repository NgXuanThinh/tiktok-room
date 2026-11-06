// tests/run-all-tests.js - Unified CLI runner for all QA test suites
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const suites = [
  // Baseline Suites (task_tiktok_live_bar)
  { name: 'event-normalizer', path: './event-normalizer.test.js' },
  { name: 'rate-limiter', path: './rate-limiter.test.js' },
  { name: 'avatar-proxy', path: './avatar-proxy.test.js' },
  { name: 'kinematics-culling', path: './kinematics-culling.test.js' },
  { name: 'audio-sfx', path: './audio-sfx.test.js' },
  { name: 'integration-e2e', path: './integration-e2e.test.js' },
  // Feature Suites (task_fix_slime_visuals_audio)
  { name: 'slime-color-palette', path: './slime-color-palette.test.js' },
  { name: 'camera-orbit-bounds', path: './camera-orbit-bounds.test.js' },
  { name: 'slime-kinematics', path: './slime-kinematics.test.js' },
  { name: 'procedural-audio-loop', path: './procedural-audio-loop.test.js' },
  // Targeted Feature Suites (task_purple_floor_camera_mock_vip)
  { name: 'purple-floor-lighting', path: './purple-floor-lighting.test.js' },
  { name: 'orbit-camera-venue-view', path: './orbit-camera-venue-view.test.js' },
  { name: 'slime-eye-sync-whale', path: './slime-eye-sync-whale.test.js' },
  { name: 'vip-podium-scheduler', path: './vip-podium-scheduler.test.js' },
  { name: 'custom-mock-person', path: './custom-mock-person.test.js' },
  // User Feedback Refinements (camera zoom, floor expansion, radial spawn, spot lighting, no viewer)
  { name: 'camera-zoom-spotlights-floor', path: './camera-zoom-spotlights-floor.test.js' }
];

async function runAll() {
  console.log('--- Running All QA Test Suites ---');
  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;

  for (const s of suites) {
    try {
      const mod = await import(s.path);
      if (typeof mod.run === 'function') {
        const res = await mod.run();
        totalTests += res.total;
        totalPassed += res.passed;
        totalFailed += res.failed;
        console.log(`[${res.failed === 0 ? 'PASS' : 'FAIL'}] ${s.name}: ${res.passed}/${res.total} passed`);
      }
    } catch (err) {
      console.error(`[ERROR] Failed to run ${s.name}:`, err.message);
      totalFailed++;
    }
  }

  console.log(`\nSummary: ${totalPassed} passed, ${totalFailed} failed out of ${totalTests} total tests`);
  if (totalFailed > 0) {
    process.exit(1);
  }
}

runAll();
