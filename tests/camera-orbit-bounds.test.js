import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

export async function run() {
  const suite = 'camera-orbit-bounds';
  const results = {
    suite,
    total: 6,
    passed: 0,
    failed: 0,
    cases: []
  };

  let sceneModule;
  try {
    sceneModule = await import('../src/scene-manager.js');
  } catch (err) {
    // Scene manager failed to load
  }

  const {
    getOrbitCameraPosition,
    ORBIT_CONFIG
  } = sceneModule || {};

  const testCases = [
    {
      name: 'test_orbit_radius_boundary_clamp',
      fn: () => {
        assert.ok(ORBIT_CONFIG || typeof getOrbitCameraPosition === 'function', 'Orbit camera configuration must be exported');
        const radius = ORBIT_CONFIG?.radius ?? ORBIT_CONFIG?.orbitRadius;
        assert.ok(radius !== undefined, 'Orbit radius must be defined');
        assert.ok(radius <= 8.5, `Orbit radius (${radius}m) must be <= 8.5m to stay in front of back wall (Z >= -9.0m)`);
      }
    },
    {
      name: 'test_polar_angle_elevation_clamps',
      fn: () => {
        assert.ok(ORBIT_CONFIG, 'ORBIT_CONFIG must be exported');
        const minPhi = ORBIT_CONFIG.minPhi ?? 0.45;
        const maxPhi = ORBIT_CONFIG.maxPhi ?? 1.30;
        assert.ok(minPhi >= 0.40 && minPhi <= 0.50, `minPhi (${minPhi}) must be clamped around 0.45 rad (~25.8 deg)`);
        assert.ok(maxPhi >= 1.25 && maxPhi <= 1.35, `maxPhi (${maxPhi}) must be clamped around 1.30 rad (~74.5 deg)`);
      }
    },
    {
      name: 'test_orbit_focus_lock_center',
      fn: () => {
        assert.ok(ORBIT_CONFIG, 'ORBIT_CONFIG must be exported');
        const target = ORBIT_CONFIG.target || { x: 0, y: ORBIT_CONFIG.targetY, z: 0 };
        assert.strictEqual(target.x, 0, 'Target focus X must be 0 (center of floor)');
        assert.strictEqual(target.y, 1.2, 'Target focus Y must be 1.2 (center of floor)');
        assert.strictEqual(target.z, 0, 'Target focus Z must be 0 (center of floor)');
      }
    },
    {
      name: 'test_spherical_coordinate_formula',
      fn: () => {
        assert.strictEqual(typeof getOrbitCameraPosition, 'function', 'getOrbitCameraPosition must be exported');
        // Test at theta = 0, phi = 0.85 (mid angle)
        const posFront = getOrbitCameraPosition(0, 0.85);
        assert.ok(posFront, 'Should return position object {x, y, z}');
        assert.ok(Math.abs(posFront.x) < 0.01, 'At theta=0, X should be ~0');
        assert.ok(posFront.z > 0, 'At theta=0, Z should be positive (front view)');
        assert.ok(posFront.y >= 2.0 && posFront.y <= 8.5, 'Y should be elevated above floor');
      }
    },
    {
      name: 'test_full_360_azimuth_sweep_boundaries',
      fn: () => {
        assert.strictEqual(typeof getOrbitCameraPosition, 'function', 'getOrbitCameraPosition must be exported');
        // Test full 360 degree sweep in 16 increments
        const steps = 16;
        for (let i = 0; i < steps; i++) {
          const theta = -Math.PI + (i / steps) * (2 * Math.PI);
          const phi = 0.85;
          const pos = getOrbitCameraPosition(theta, phi);

          assert.ok(pos.z >= -8.5, `Camera Z (${pos.z.toFixed(2)}) must stay >= -8.5m in front of back wall (-9.0m)`);
          assert.ok(pos.z <= 9.0, `Camera Z (${pos.z.toFixed(2)}) must stay <= 9.0m`);
          assert.ok(Math.abs(pos.x) <= 8.5, `Camera X (${pos.x.toFixed(2)}) must stay inside side walls (<= 8.5m)`);
          assert.ok(pos.y >= 2.0 && pos.y <= 8.5, `Camera Y (${pos.y.toFixed(2)}) must stay between floor and ceiling`);
        }
      }
    },
    {
      name: 'test_polar_angle_clamping_extremes',
      fn: () => {
        assert.strictEqual(typeof getOrbitCameraPosition, 'function', 'getOrbitCameraPosition must be exported');
        // Attempt to pass phi < minPhi (-1.0 rad)
        const posTooHigh = getOrbitCameraPosition(0, -1.0);
        // Attempt to pass phi > maxPhi (3.0 rad)
        const posTooLow = getOrbitCameraPosition(0, 3.0);

        // Both should be clamped within bounds and not invert or penetrate floor
        assert.ok(posTooHigh.y <= 8.5, 'Clamped high camera must not penetrate ceiling');
        assert.ok(posTooLow.y >= 2.0, 'Clamped low camera must not penetrate floor');
      }
    }
  ];

  for (const tc of testCases) {
    try {
      tc.fn();
      results.passed++;
      results.cases.push({ name: tc.name, status: 'PASS' });
    } catch (err) {
      results.failed++;
      results.cases.push({ name: tc.name, status: 'FAIL', error: err.message });
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
