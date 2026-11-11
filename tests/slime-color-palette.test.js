import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

export async function run() {
  const suite = 'slime-color-palette';
  const results = {
    suite,
    total: 6,
    passed: 0,
    failed: 0,
    cases: []
  };

  let normalizerModule;
  let avatarModule;
  try {
    normalizerModule = await import('../server/event-normalizer.js');
  } catch (err) {
    // Normalizer failed to load
  }

  try {
    avatarModule = await import('../src/avatar-manager.js');
  } catch (err) {
    // Avatar manager failed to load
  }

  const parseColorCommand = normalizerModule?.parseColorCommand || avatarModule?.parseColorCommand;
  const SLIME_COLORS = avatarModule?.SLIME_COLORS || normalizerModule?.SLIME_COLORS;

  const testCases = [
    {
      name: 'test_canonical_3_color_palette',
      fn: () => {
        assert.ok(SLIME_COLORS, 'SLIME_COLORS must be exported');
        const keys = Object.keys(SLIME_COLORS);
        assert.strictEqual(keys.length, 3, 'Must have exactly 3 canonical colors');
        assert.deepStrictEqual(keys.sort(), ['blue', 'green', 'red']);

        assert.strictEqual(SLIME_COLORS.green.hex.toUpperCase(), '#00FF66');
        assert.strictEqual(SLIME_COLORS.red.hex.toUpperCase(), '#FF2A6D');
        assert.strictEqual(SLIME_COLORS.blue.hex.toUpperCase(), '#00F0FF');

        assert.strictEqual(SLIME_COLORS.green.threeColor, 0x00ff66);
        assert.strictEqual(SLIME_COLORS.red.threeColor, 0xff2a6d);
        assert.strictEqual(SLIME_COLORS.blue.threeColor, 0x00f0ff);
      }
    },
    {
      name: 'test_parse_color_command_english',
      fn: () => {
        assert.strictEqual(typeof parseColorCommand, 'function', 'parseColorCommand must be a function');
        assert.strictEqual(parseColorCommand('!color green')?.name, 'green');
        assert.strictEqual(parseColorCommand('!color red')?.name, 'red');
        assert.strictEqual(parseColorCommand('!color blue')?.name, 'blue');
        assert.strictEqual(parseColorCommand('  !color   GREEN  ')?.name, 'green');
      }
    },
    {
      name: 'test_parse_color_command_vietnamese',
      fn: () => {
        assert.strictEqual(typeof parseColorCommand, 'function', 'parseColorCommand must be a function');
        assert.strictEqual(parseColorCommand('!color xanhla')?.name, 'green');
        assert.strictEqual(parseColorCommand('!color xanh_la')?.name, 'green');
        assert.strictEqual(parseColorCommand('!color xanh lá')?.name, 'green');
        assert.strictEqual(parseColorCommand('!color do')?.name, 'red');
        assert.strictEqual(parseColorCommand('!color đỏ')?.name, 'red');
        assert.strictEqual(parseColorCommand('!color xanh')?.name, 'blue');
        assert.strictEqual(parseColorCommand('!color xanhduong')?.name, 'blue');
        assert.strictEqual(parseColorCommand('!color xanh dương')?.name, 'blue');
      }
    },
    {
      name: 'test_explicit_rejection_of_hex_codes',
      fn: () => {
        assert.strictEqual(typeof parseColorCommand, 'function', 'parseColorCommand must be a function');
        assert.strictEqual(parseColorCommand('!color #FF0000'), null, 'Must reject #FF0000');
        assert.strictEqual(parseColorCommand('!color #00ff55'), null, 'Must reject #00ff55');
        assert.strictEqual(parseColorCommand('!color #123'), null, 'Must reject short hex #123');
        assert.strictEqual(parseColorCommand('!color 0xff0000'), null, 'Must reject 0xff0000');
        assert.strictEqual(parseColorCommand('!color 123456'), null, 'Must reject 6-digit number hex');
        assert.strictEqual(parseColorCommand('!color #aabbccdd'), null, 'Must reject 8-digit hex');
      }
    },
    {
      name: 'test_rejection_of_arbitrary_strings',
      fn: () => {
        assert.strictEqual(typeof parseColorCommand, 'function', 'parseColorCommand must be a function');
        assert.strictEqual(parseColorCommand('!color purple'), null, 'Must reject non-palette color purple');
        assert.strictEqual(parseColorCommand('!color yellow'), null, 'Must reject yellow (no longer supported)');
        assert.strictEqual(parseColorCommand('!color black'), null, 'Must reject black');
        assert.strictEqual(parseColorCommand('!color white'), null, 'Must reject white');
        assert.strictEqual(parseColorCommand('!dance 1'), null, 'Must ignore non-color commands');
        assert.strictEqual(parseColorCommand('hello world'), null, 'Must ignore normal chat');
        assert.deepStrictEqual(parseColorCommand('!color'), { isRandom: true }, 'Empty color argument returns isRandom');
      }
    },
    {
      name: 'test_slime_color_preservation_on_invalid_command',
      fn: () => {
        let currentColor = 'green';
        function handleColorChange(cmd) {
          const parsed = parseColorCommand(cmd);
          if (parsed && parsed.name) {
            currentColor = parsed.name;
          }
          return currentColor;
        }

        assert.strictEqual(handleColorChange('!color #FF00FF'), 'green', 'Must preserve current color on hex');
        assert.strictEqual(handleColorChange('!color orange'), 'green', 'Must preserve current color on invalid');
        assert.strictEqual(handleColorChange('!color do'), 'red', 'Must update color on valid alias');
        assert.strictEqual(handleColorChange('!color #123'), 'red', 'Must preserve updated red color on hex');
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
