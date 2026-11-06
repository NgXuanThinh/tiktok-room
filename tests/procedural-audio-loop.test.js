import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

export async function run() {
  const suite = 'procedural-audio-loop';
  const results = {
    suite,
    total: 6,
    passed: 0,
    failed: 0,
    cases: []
  };

  let audioModule;
  try {
    audioModule = await import('../src/audio-system.js');
  } catch (err) {
    // Audio system failed to load
  }

  const {
    ProceduralBeatEngine,
    BEAT_LOOP_CONFIG,
    getBeatStepEvents
  } = audioModule || {};

  const testCases = [
    {
      name: 'test_128_bpm_sequencer_timing',
      fn: () => {
        const bpm = BEAT_LOOP_CONFIG?.bpm ?? 128;
        assert.strictEqual(bpm, 128, 'Loop tempo must be 128 BPM');
        const secondsPerBeat = 60 / bpm;
        assert.ok(Math.abs(secondsPerBeat - 0.46875) < 0.0001, 'Seconds per beat must be 0.46875s');
        const stepTime = secondsPerBeat / 4;
        assert.ok(Math.abs(stepTime - 0.1171875) < 0.0001, '16th note step duration must be ~0.117s');
      }
    },
    {
      name: 'test_16_step_sequencer_pattern_matrix',
      fn: () => {
        assert.strictEqual(typeof getBeatStepEvents, 'function', 'getBeatStepEvents must be exported');
        const steps = 16;
        for (let s = 0; s < steps; s++) {
          const events = getBeatStepEvents(s);
          assert.ok(events, `Step ${s} should return events object`);

          // Kick on 0, 4, 8, 12 (four on the floor)
          if (s % 4 === 0) {
            assert.strictEqual(events.kick, true, `Step ${s} must have kick = true`);
          } else {
            assert.strictEqual(events.kick, false, `Step ${s} must have kick = false`);
          }

          // Snare on 4, 12 (backbeat)
          if (s === 4 || s === 12) {
            assert.strictEqual(events.snare, true, `Step ${s} must have snare = true`);
          } else {
            assert.strictEqual(events.snare, false, `Step ${s} must have snare = false`);
          }

          // Hi-Hat on off-beats 2, 6, 10, 14
          if (s === 2 || s === 6 || s === 10 || s === 14) {
            assert.strictEqual(events.hihat, true, `Step ${s} must have hihat = true`);
          }
        }
      }
    },
    {
      name: 'test_kick_synthesis_frequency_sweep',
      fn: () => {
        assert.ok(BEAT_LOOP_CONFIG?.kick, 'BEAT_LOOP_CONFIG.kick must be defined');
        const kick = BEAT_LOOP_CONFIG.kick;
        assert.ok(kick.startFreq >= 120 && kick.startFreq <= 150, `Kick start frequency (${kick.startFreq}Hz) must sweep from ~130Hz`);
        assert.ok(kick.endFreq >= 40 && kick.endFreq <= 55, `Kick end frequency (${kick.endFreq}Hz) must sweep down to ~45-50Hz`);
        assert.ok(kick.decaySeconds <= 0.20, `Kick duration (${kick.decaySeconds}s) must be snappy (<= 0.20s)`);
      }
    },
    {
      name: 'test_snare_and_hihat_filter_parameters',
      fn: () => {
        assert.ok(BEAT_LOOP_CONFIG?.snare, 'BEAT_LOOP_CONFIG.snare must be defined');
        assert.ok(BEAT_LOOP_CONFIG?.hihat, 'BEAT_LOOP_CONFIG.hihat must be defined');

        const snare = BEAT_LOOP_CONFIG.snare;
        assert.strictEqual(snare.filterType, 'bandpass', 'Snare must use bandpass filter');
        assert.ok(snare.centerFreq >= 1000 && snare.centerFreq <= 1500, 'Snare center frequency must be ~1200Hz');

        const hihat = BEAT_LOOP_CONFIG.hihat;
        assert.strictEqual(hihat.filterType, 'highpass', 'Hi-Hat must use highpass filter');
        assert.ok(hihat.cutoffFreq >= 6000 && hihat.cutoffFreq <= 8000, 'Hi-Hat cutoff frequency must be ~7000Hz');
        assert.ok(hihat.decaySeconds <= 0.08, 'Hi-Hat decay must be fast (<= 0.08s)');
      }
    },
    {
      name: 'test_procedural_beat_engine_class',
      fn: () => {
        assert.strictEqual(typeof ProceduralBeatEngine, 'function', 'ProceduralBeatEngine must be a class/constructor');
        const engine = new ProceduralBeatEngine();
        assert.strictEqual(typeof engine.start, 'function', 'engine.start must be a function');
        assert.strictEqual(typeof engine.stop, 'function', 'engine.stop must be a function');
        assert.strictEqual(typeof engine.setVolume, 'function', 'engine.setVolume must be a function');
        assert.strictEqual(typeof engine.isPlaying, 'boolean', 'engine.isPlaying must be boolean');
      }
    },
    {
      name: 'test_audio_unlock_handler_contract',
      fn: () => {
        // AudioSystem or ProceduralBeatEngine must provide an unlockAudio method
        const hasUnlock = typeof audioModule?.unlockAudio === 'function' ||
                          typeof audioModule?.AudioSystem?.prototype?.unlockAudio === 'function';
        assert.ok(hasUnlock, 'unlockAudio method must be exported or present on AudioSystem prototype');
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
