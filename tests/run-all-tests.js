// tests/run-all-tests.js - Unified CLI runner for all QA test suites
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const suites = [
  { name: 'event-normalizer', path: './event-normalizer.test.js' },
  { name: 'rate-limiter', path: './rate-limiter.test.js' },
  { name: 'avatar-proxy', path: './avatar-proxy.test.js' },
  { name: 'kinematics-culling', path: './kinematics-culling.test.js' },
  { name: 'audio-sfx', path: './audio-sfx.test.js' },
  { name: 'integration-e2e', path: './integration-e2e.test.js' }
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
