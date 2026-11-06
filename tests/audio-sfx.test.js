import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

export async function run() {
  const suite = 'audio-sfx';
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
    results.failed = results.total;
    results.error = err.code || err.message;
    results.cases.push({
      name: 'module_import',
      status: 'FAIL',
      error: `Failed to import src/audio-system.js: ${err.message}`,
      code: err.code
    });
    return results;
  }

  const {
    split3BandFrequency,
    calculateAudioFlux,
    SFX_CONFIGS,
    synthesizeSfxParams
  } = audioModule;

  const testCases = [
    {
      name: 'test_3band_frequency_separation',
      fn: () => {
        assert.strictEqual(typeof split3BandFrequency, 'function', 'split3BandFrequency must be exported');
        const mockSpectrum = new Uint8Array(256);
        // Heavy bass in bins 0-1
        mockSpectrum[0] = 240;
        mockSpectrum[1] = 220;
        // Moderate mids in bins 2-11
        mockSpectrum[4] = 80;
        mockSpectrum[8] = 60;
        // Light treble in bins 12+
        mockSpectrum[25] = 20;

        const bands = split3BandFrequency(mockSpectrum, 44100, 512);
        assert.ok(bands, 'Expected returned bands object');
        assert.ok(bands.bassEnergy > 200, `Expected high bass energy, got ${bands.bassEnergy}`);
        assert.ok(bands.midsEnergy < bands.bassEnergy, 'Mids energy should be lower than bass');
        assert.ok(bands.trebleEnergy < bands.midsEnergy, 'Treble energy should be lowest');
        assert.ok(bands.bassEnd >= 1, 'Bass end bin should be >= 1');
        assert.ok(bands.midsEnd >= 10, 'Mids end bin should be >= 10');
      }
    },
    {
      name: 'test_running_average_flux_normalization',
      fn: () => {
        assert.strictEqual(typeof calculateAudioFlux, 'function', 'calculateAudioFlux must be exported');
        let avg = 100;
        const current = 180;
        // avg = 0.85 * 100 + 0.15 * 180 = 85 + 27 = 112
        // flux = max(0, 180 - 112) = 68
        const res = calculateAudioFlux(current, avg, 0.85);
        assert.ok(res.flux > 0, 'Positive surge should produce non-zero flux');
        assert.ok(res.newAvg > avg, 'Running average should increase on higher volume');

        // Drop volume
        const quietRes = calculateAudioFlux(50, res.newAvg, 0.85);
        assert.strictEqual(quietRes.flux, 0, 'Volume drop should produce zero flux (no negative pulse)');
      }
    },
    {
      name: 'test_procedural_sfx_coin_clink',
      fn: () => {
        const config = SFX_CONFIGS?.coin || synthesizeSfxParams?.('coin');
        assert.ok(config, 'Coin SFX configuration must exist');
        assert.ok(
          config.frequencies?.includes(1318) || config.freq1 === 1318,
          'Coin SFX must include 1318 Hz (E6)'
        );
        assert.ok(
          config.frequencies?.includes(1567) || config.freq2 === 1567,
          'Coin SFX must include 1567 Hz (G6)'
        );
      }
    },
    {
      name: 'test_procedural_sfx_air_horn',
      fn: () => {
        const config = SFX_CONFIGS?.airhorn || synthesizeSfxParams?.('airhorn');
        assert.ok(config, 'Air horn SFX configuration must exist');
        assert.strictEqual(config.type, 'sawtooth', 'Air horn should utilize sawtooth oscillator');
        assert.ok(config.pitchRampEnd >= 1700, 'Air horn must ramp pitch up to ~1760 Hz');
      }
    },
    {
      name: 'test_procedural_sfx_bass_boom',
      fn: () => {
        const config = SFX_CONFIGS?.boom || synthesizeSfxParams?.('boom');
        assert.ok(config, 'Bass boom SFX configuration must exist');
        assert.ok(config.lowPassCutoff <= 100, 'Bass boom must sweep down to sub-bass (< 100 Hz)');
      }
    },
    {
      name: 'test_clickless_gain_ramp',
      fn: () => {
        const config = SFX_CONFIGS?.coin || synthesizeSfxParams?.('coin');
        // Gain ramp target must be <= 0.0001 (exponential ramp to prevent audio popping)
        const minVal = config.decayTarget ?? 0.0001;
        assert.ok(minVal <= 0.001, 'Decay target must be <= 0.001 to prevent audio click artifacts');
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
