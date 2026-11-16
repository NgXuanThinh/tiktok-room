import assert from 'node:assert';
import { graphicsSettings } from '../src/graphics-settings.js';
import { handleLiveEvent } from '../src/live-event-handler.js';
import { ClubEnvironment } from '../src/club-environment.js';
import { AudioSystem, SILENT_BANDS } from '../src/audio-system.js';
import * as THREE from 'three';

export async function run() {
  const suite = 'graphics-toggle-cones-lasers';
  const results = {
    suite,
    total: 11,
    passed: 0,
    failed: 0,
    cases: []
  };

  const testCases = [
    {
      name: 'test_graphics_constants_defaults',
      fn: () => {
        assert.strictEqual(typeof graphicsSettings.settings.enableMovingHeadCones, 'boolean', 'enableMovingHeadCones must be boolean');
        assert.strictEqual(typeof graphicsSettings.settings.enableLaserBeams, 'boolean', 'enableLaserBeams must be boolean');
      }
    },
    {
      name: 'test_graphics_settings_setters_and_listeners',
      fn: () => {
        let notifiedKey = null;
        let notifiedVal = null;
        const unsub = graphicsSettings.addListener((key, val) => {
          notifiedKey = key;
          notifiedVal = val;
        });

        graphicsSettings.setEnableMovingHeadCones(false);
        assert.strictEqual(graphicsSettings.settings.enableMovingHeadCones, false);
        assert.strictEqual(notifiedKey, 'enableMovingHeadCones');
        assert.strictEqual(notifiedVal, false);

        graphicsSettings.setEnableLaserBeams(false);
        assert.strictEqual(graphicsSettings.settings.enableLaserBeams, false);
        assert.strictEqual(notifiedKey, 'enableLaserBeams');
        assert.strictEqual(notifiedVal, false);

        unsub();
      }
    },
    {
      name: 'test_live_event_handler_dispatches_cone_setting',
      fn: () => {
        handleLiveEvent({
          type: 'admin_command',
          command: 'set_graphics_setting',
          setting: 'enableMovingHeadCones',
          value: true
        }, {});
        assert.strictEqual(graphicsSettings.settings.enableMovingHeadCones, true);

        handleLiveEvent({
          type: 'admin_command',
          command: 'set_graphics_setting',
          setting: 'enableMovingHeadCones',
          value: false
        }, {});
        assert.strictEqual(graphicsSettings.settings.enableMovingHeadCones, false);
      }
    },
    {
      name: 'test_live_event_handler_dispatches_laser_setting',
      fn: () => {
        handleLiveEvent({
          type: 'admin_command',
          command: 'set_graphics_setting',
          setting: 'enableLaserBeams',
          value: true
        }, {});
        assert.strictEqual(graphicsSettings.settings.enableLaserBeams, true);

        handleLiveEvent({
          type: 'admin_command',
          command: 'set_graphics_setting',
          setting: 'enableLaserBeams',
          value: false
        }, {});
        assert.strictEqual(graphicsSettings.settings.enableLaserBeams, false);
      }
    },
    {
      name: 'test_club_environment_toggles_cone_and_laser_visibility',
      fn: () => {
        const scene = new THREE.Scene();
        const club = new ClubEnvironment(scene);

        // Verify moving head cones can be toggled
        club.setMovingHeadConesEnabled(false);
        for (const mh of club.movingHeads) {
          if (mh.cone) {
            assert.strictEqual(mh.cone.visible, false, 'Cone mesh must be hidden when disabled');
          }
        }

        club.setMovingHeadConesEnabled(true);
        for (const mh of club.movingHeads) {
          if (mh.cone) {
            assert.strictEqual(mh.cone.visible, true, 'Cone mesh must be visible when enabled');
          }
        }

        // Verify laser beams can be toggled
        club.setLaserBeamsEnabled(false);
        for (const lb of club.laserBeams) {
          if (lb.mesh) {
            assert.strictEqual(lb.mesh.visible, false, 'Laser beam mesh must be hidden when disabled');
          }
        }

        club.setLaserBeamsEnabled(true);
        for (const lb of club.laserBeams) {
          if (lb.mesh) {
            assert.strictEqual(lb.mesh.visible, true, 'Laser beam mesh must be visible when enabled');
          }
        }
      }
    },
    {
      name: 'test_independent_cone_and_laser_combinations',
      fn: () => {
        const scene = new THREE.Scene();
        const club = new ClubEnvironment(scene);

        // Case 1: Cones OFF, Lasers ON
        club.setMovingHeadConesEnabled(false);
        club.setLaserBeamsEnabled(true);
        assert.strictEqual(club.movingHeads[0].cone.visible, false);
        assert.strictEqual(club.laserBeams[0].mesh.visible, true);

        // Case 2: Cones ON, Lasers OFF
        club.setMovingHeadConesEnabled(true);
        club.setLaserBeamsEnabled(false);
        assert.strictEqual(club.movingHeads[0].cone.visible, true);
        assert.strictEqual(club.laserBeams[0].mesh.visible, false);

        // Case 3: Both OFF
        club.setMovingHeadConesEnabled(false);
        club.setLaserBeamsEnabled(false);
        assert.strictEqual(club.movingHeads[0].cone.visible, false);
        assert.strictEqual(club.laserBeams[0].mesh.visible, false);

        // Restore defaults
        graphicsSettings.resetDefaults();
        club.setMovingHeadConesEnabled(true);
        club.setLaserBeamsEnabled(true);
      }
    },
    {
      name: 'test_focus_spotlights_skipped_when_lights_and_cones_disabled',
      fn: () => {
        const scene = new THREE.Scene();
        const club = new ClubEnvironment(scene);

        // Disable both physical lights and cones
        graphicsSettings.setEnableMovingHeadLights(false);
        graphicsSettings.setEnableMovingHeadCones(false);

        // Trigger ultra spotlight donation
        club.focusSpotlights('ultra', new THREE.Vector3(0, 0, 0));

        // When disabled, spotlights must NOT be focused (remains false, 0 CPU wasted)
        for (const mh of club.movingHeads) {
          assert.strictEqual(mh.isFocused, false, 'Spotlight focusing must be completely skipped when disabled');
        }

        // Restore defaults
        graphicsSettings.resetDefaults();
      }
    },
    {
      name: 'test_audio_system_silent_guard_returns_cached_silent_bands',
      fn: () => {
        const audio = new AudioSystem();
        // Context is null (uninitialized/idle), must return frozen SILENT_BANDS without executing FFT
        const bands = audio.getBands();
        assert.strictEqual(bands, SILENT_BANDS, 'getBands must return SILENT_BANDS when audio is not active');
        assert.strictEqual(bands.bass, 0);
        assert.strictEqual(bands.trebleFlux, 0);
      }
    },
    {
      name: 'test_initial_session_state_synchronizes_graphics_settings',
      fn: () => {
        handleLiveEvent({
          type: 'initial_session_state',
          graphicsSettings: {
            fpsCapKey: 'FPS_30',
            pixelRatioKey: 'ECO',
            enableMovingHeadLights: false,
            enableMovingHeadCones: false,
            enableLaserBeams: false
          }
        }, {});

        assert.strictEqual(graphicsSettings.settings.fpsCapKey, 'FPS_30');
        assert.strictEqual(graphicsSettings.settings.pixelRatioKey, 'ECO');
        assert.strictEqual(graphicsSettings.settings.enableMovingHeadLights, false);
        assert.strictEqual(graphicsSettings.settings.enableMovingHeadCones, false);
        assert.strictEqual(graphicsSettings.settings.enableLaserBeams, false);

        // Restore defaults
        graphicsSettings.resetDefaults();
      }
    },
    {
      name: 'test_static_floor_toggle_and_uniform',
      fn: () => {
        const scene = new THREE.Scene();
        const club = new ClubEnvironment(scene);

        // Turn on static floor
        graphicsSettings.setStaticFloor(true);
        assert.strictEqual(graphicsSettings.settings.enableStaticFloor, true);
        assert.strictEqual(club.gpuFloorMat.uniforms.u_isStatic.value, 1.0);

        // Turn off static floor
        graphicsSettings.setStaticFloor(false);
        assert.strictEqual(graphicsSettings.settings.enableStaticFloor, false);
        assert.strictEqual(club.gpuFloorMat.uniforms.u_isStatic.value, 0.0);
      }
    },
    {
      name: 'test_live_event_handler_dispatches_static_floor',
      fn: () => {
        handleLiveEvent({
          type: 'admin_command',
          command: 'set_graphics_setting',
          setting: 'enableStaticFloor',
          value: true
        }, {});
        assert.strictEqual(graphicsSettings.settings.enableStaticFloor, true);

        handleLiveEvent({
          type: 'admin_command',
          command: 'set_graphics_setting',
          setting: 'enableStaticFloor',
          value: false
        }, {});
        assert.strictEqual(graphicsSettings.settings.enableStaticFloor, false);
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

if (process.argv[1] && process.argv[1].endsWith('graphics-toggle-cones-lasers.test.js')) {
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
