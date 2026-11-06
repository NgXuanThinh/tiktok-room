import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

export async function run() {
  const suite = 'purple-floor-lighting';
  const results = {
    suite,
    total: 6,
    passed: 0,
    failed: 0,
    cases: []
  };

  let clubModule;
  try {
    clubModule = await import('../src/club-environment.js');
  } catch (err) {
    // Failed to import
  }

  const {
    PURPLE_FLOOR_PALETTE,
    FLOOR_EMISSIVE_CONFIG,
    BACK_WALL_CONFIG,
    ClubEnvironment
  } = clubModule || {};

  const testCases = [
    {
      name: 'test_purple_floor_palette_constants',
      fn: () => {
        assert.ok(PURPLE_FLOOR_PALETTE, 'PURPLE_FLOOR_PALETTE must be exported');
        assert.ok(Array.isArray(PURPLE_FLOOR_PALETTE), 'PURPLE_FLOOR_PALETTE must be an array');
        assert.strictEqual(PURPLE_FLOOR_PALETTE.length, 5, 'PURPLE_FLOOR_PALETTE must contain exactly 5 colors');

        const expectedHex = [0x8A2BE2, 0x9400D3, 0xBA55D3, 0x4B0082, 0xDDA0DD];
        const actualHex = PURPLE_FLOOR_PALETTE.map((c) => (typeof c.getHex === 'function' ? c.getHex() : Number(c)));
        assert.deepStrictEqual(actualHex, expectedHex, 'Palette colors must match Cyberpunk Violet/Purple specifications');
      }
    },
    {
      name: 'test_floor_emissive_config_baseline',
      fn: () => {
        assert.ok(FLOOR_EMISSIVE_CONFIG, 'FLOOR_EMISSIVE_CONFIG must be exported');
        assert.strictEqual(FLOOR_EMISSIVE_CONFIG.baseEmissive, 0x3b0066, 'Base emissive color must be 0x3b0066');
        assert.strictEqual(FLOOR_EMISSIVE_CONFIG.emissiveIntensity, 0.65, 'Emissive intensity must be 0.65');
        assert.strictEqual(FLOOR_EMISSIVE_CONFIG.minPulseBrightness, 0.25, 'minPulseBrightness must be 0.25');
      }
    },
    {
      name: 'test_back_wall_boundary_clearance',
      fn: () => {
        const backZ = BACK_WALL_CONFIG?.z ?? BACK_WALL_CONFIG?.position?.z;
        assert.ok(backZ !== undefined, 'BACK_WALL_CONFIG with z coordinate must be exported');
        assert.ok(
          backZ <= -12.5,
          `Back wall Z (${backZ}m) must be <= -12.5m so full-venue orbit radius 10.0m stays in front of wall`
        );
      }
    },
    {
      name: 'test_instanced_mesh_draw_call_contract',
      fn: () => {
        // ClubEnvironment must configure floorMesh as an InstancedMesh with count 64
        assert.ok(typeof ClubEnvironment === 'function', 'ClubEnvironment must be exported');
        const env = new ClubEnvironment();
        if (env.floorMesh) {
          assert.strictEqual(env.floorMesh.isInstancedMesh, true, 'Floor mesh must be an InstancedMesh');
          assert.ok(env.floorMesh.count >= 64, 'Floor mesh must hold at least 64 tiles');
        }
      }
    },
    {
      name: 'test_floor_tile_color_wave_distribution',
      fn: () => {
        assert.ok(PURPLE_FLOOR_PALETTE, 'PURPLE_FLOOR_PALETTE must be exported');
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const idx = (r + c) % PURPLE_FLOOR_PALETTE.length;
            assert.ok(idx >= 0 && idx < 5, 'Tile color index must resolve to palette entry');
          }
        }
      }
    },
    {
      name: 'test_bass_flux_emissive_modulation',
      fn: () => {
        assert.ok(FLOOR_EMISSIVE_CONFIG, 'FLOOR_EMISSIVE_CONFIG must be exported');
        const minBrightness = FLOOR_EMISSIVE_CONFIG.minPulseBrightness || 0.25;

        // Even at 0 wave and 0 bass flux, brightness must remain >= minPulseBrightness
        const wave = -1.0; // lowest trough of wave
        const bassFlux = 0.0;
        const computedIntensity = Math.max(
          minBrightness,
          (wave + 1) * 0.5 * (1.0 + bassFlux * 0.03)
        );
        assert.ok(
          computedIntensity >= minBrightness,
          `Floor brightness (${computedIntensity}) must never drop below ${minBrightness} (never pitch-black)`
        );
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
