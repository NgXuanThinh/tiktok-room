// tests/slime-cpu-optimization.test.js - QA Suite for Slime CPU Optimization & Admin LookAt Toggle
import assert from 'node:assert';
import * as THREE from 'three';
import { graphicsSettings } from '../src/graphics-settings.js';
import { handleLiveEvent } from '../src/live-event-handler.js';
import {
  computeSharedDanceFrame,
  updateAvatarKinematics
} from '../src/avatar-coordinator.js';
import { createCyberSlime } from '../src/slime-model.js';

export async function run() {
  const suite = 'slime-cpu-optimization';
  const results = {
    suite,
    total: 8,
    passed: 0,
    failed: 0,
    cases: []
  };

  const testCases = [
    {
      name: 'test_billboard_cpu_lookat_default_false',
      fn: () => {
        assert.strictEqual(
          graphicsSettings.settings.enableBillboardCpuLookAt,
          false,
          'enableBillboardCpuLookAt must be false by default to optimize CPU'
        );
      }
    },
    {
      name: 'test_graphics_settings_billboard_lookat_setter',
      fn: () => {
        let notifiedKey = null;
        let notifiedVal = null;
        const unsub = graphicsSettings.addListener((key, val) => {
          notifiedKey = key;
          notifiedVal = val;
        });

        graphicsSettings.setBillboardCpuLookAt(true);
        assert.strictEqual(graphicsSettings.settings.enableBillboardCpuLookAt, true);
        assert.strictEqual(notifiedKey, 'enableBillboardCpuLookAt');
        assert.strictEqual(notifiedVal, true);

        graphicsSettings.setBillboardCpuLookAt(false);
        assert.strictEqual(graphicsSettings.settings.enableBillboardCpuLookAt, false);
        assert.strictEqual(notifiedKey, 'enableBillboardCpuLookAt');
        assert.strictEqual(notifiedVal, false);

        unsub();
      }
    },
    {
      name: 'test_live_event_handler_dispatches_billboard_lookat',
      fn: () => {
        handleLiveEvent({
          type: 'admin_command',
          command: 'set_graphics_setting',
          setting: 'enableBillboardCpuLookAt',
          value: true
        }, {});
        assert.strictEqual(graphicsSettings.settings.enableBillboardCpuLookAt, true);

        handleLiveEvent({
          type: 'admin_command',
          command: 'set_graphics_setting',
          setting: 'enableBillboardCpuLookAt',
          value: false
        }, {});
        assert.strictEqual(graphicsSettings.settings.enableBillboardCpuLookAt, false);
      }
    },
    {
      name: 'test_initial_session_state_syncs_billboard_lookat',
      fn: () => {
        handleLiveEvent({
          type: 'initial_session_state',
          graphicsSettings: {
            enableBillboardCpuLookAt: true
          }
        }, {});
        assert.strictEqual(graphicsSettings.settings.enableBillboardCpuLookAt, true);

        // Restore default
        graphicsSettings.setBillboardCpuLookAt(false);
      }
    },
    {
      name: 'test_compute_shared_dance_frame_returns_valid_kinematics',
      fn: () => {
        const frame = computeSharedDanceFrame(0.016, 1.0, 13.4, 1.0, { bassFlux: 12.0 }, 128);
        assert.ok(typeof frame.bpmPhase === 'number');
        assert.ok(typeof frame.scaleY === 'number');
        assert.ok(typeof frame.scaleXZ === 'number');
        assert.ok(typeof frame.jumpY === 'number');
        assert.ok(typeof frame.earJiggle === 'number');
        assert.ok(typeof frame.tailRotY === 'number');
        assert.ok(typeof frame.tailRotX === 'number');
        assert.ok(typeof frame.haloDelta === 'number');
      }
    },
    {
      name: 'test_billboard_lookat_bypassed_when_disabled',
      fn: () => {
        graphicsSettings.setBillboardCpuLookAt(false);
        let lookAtCalls = 0;
        const mockBillboard = {
          lookAt: () => { lookAtCalls++; }
        };
        const mockCamera = { position: { x: 0, y: 5, z: 10 } };
        const mesh = new THREE.Group();
        mesh.userData = {
          currentScale: 1.0,
          targetScale: 1.0,
          billboard: mockBillboard
        };

        updateAvatarKinematics(mesh, 0.016, 1.0, 13.4, 1.0, { bassFlux: 0 }, mockCamera);
        assert.strictEqual(lookAtCalls, 0, 'lookAt must not be called when enableBillboardCpuLookAt is false');

        // When enabled, lookAt must be called
        graphicsSettings.setBillboardCpuLookAt(true);
        updateAvatarKinematics(mesh, 0.016, 1.0, 13.4, 1.0, { bassFlux: 0 }, mockCamera);
        assert.strictEqual(lookAtCalls, 1, 'lookAt must be called when enableBillboardCpuLookAt is true');

        // Restore default
        graphicsSettings.setBillboardCpuLookAt(false);
      }
    },
    {
      name: 'test_scale_settled_guard_skips_dirty_matrix_assignment',
      fn: () => {
        const mesh = new THREE.Group();
        let setScalarCalls = 0;
        mesh.scale.setScalar = (val) => {
          setScalarCalls++;
          THREE.Vector3.prototype.setScalar.call(mesh.scale, val);
        };
        mesh.userData = {
          currentScale: 1.0,
          targetScale: 1.0
        };

        // CurrentScale equals targetScale: setScalar must be skipped
        updateAvatarKinematics(mesh, 0.016, 1.0, 13.4, 1.0, { bassFlux: 0 }, null);
        assert.strictEqual(setScalarCalls, 0, 'mesh.scale.setScalar must be skipped when scale has settled');

        // When targetScale changes, setScalar must be invoked
        mesh.userData.targetScale = 1.2;
        updateAvatarKinematics(mesh, 0.016, 1.0, 13.4, 1.0, { bassFlux: 0 }, null);
        assert.strictEqual(setScalarCalls, 1, 'mesh.scale.setScalar must be called when scale is changing');
      }
    },
    {
      name: 'test_78_slimes_100_percent_synchronicity',
      fn: () => {
        const slimes = [];
        for (let i = 0; i < 78; i++) {
          const controller = createCyberSlime('cyan', { username: `user_${i}` });
          slimes.push(controller);
        }

        const sharedKinematics = computeSharedDanceFrame(0.016, 2.5, 13.4, 1.0, { bassFlux: 25.0 }, 128);

        for (const s of slimes) {
          s.update(0.016, 0.5, sharedKinematics);
        }

        const basePosY = slimes[0].rootNode.position.y;
        const baseScaleY = slimes[0].rootNode.scale.y;

        for (let i = 1; i < 78; i++) {
          assert.strictEqual(slimes[i].rootNode.position.y, basePosY, `Slime ${i} position.y must exactly match Slime 0`);
          assert.strictEqual(slimes[i].rootNode.scale.y, baseScaleY, `Slime ${i} scale.y must exactly match Slime 0`);
        }
      }
    }
  ];

  for (const tc of testCases) {
    try {
      await tc.fn();
      results.passed++;
      results.cases.push({ name: tc.name, status: 'pass' });
    } catch (err) {
      results.failed++;
      results.cases.push({ name: tc.name, status: 'fail', error: err.message });
    }
  }

  return results;
}

if (process.argv[1] && process.argv[1].endsWith('slime-cpu-optimization.test.js')) {
  run().then((res) => {
    console.log(`[${res.suite}] ${res.passed}/${res.total} passed`);
    if (res.failed > 0) {
      console.error(res.cases.filter((c) => c.status === 'fail'));
      process.exit(1);
    } else {
      process.exit(0);
    }
  });
}
