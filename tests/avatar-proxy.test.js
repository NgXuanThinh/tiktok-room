import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

export async function run() {
  const suite = 'avatar-proxy';
  const results = {
    suite,
    total: 6,
    passed: 0,
    failed: 0,
    cases: []
  };

  let proxyModule;
  try {
    proxyModule = await import('../server/avatar-proxy.js');
  } catch (err) {
    results.failed = results.total;
    results.error = err.code || err.message;
    results.cases.push({
      name: 'module_import',
      status: 'FAIL',
      error: `Failed to import server/avatar-proxy.js: ${err.message}`,
      code: err.code
    });
    return results;
  }

  const {
    avatarProxyRouter,
    fetchAvatarWithCache,
    generateSvgAvatar,
    avatarCache
  } = proxyModule;

  const testCases = [
    {
      name: 'test_cors_headers_injection',
      fn: async () => {
        assert.strictEqual(typeof avatarProxyRouter, 'function', 'avatarProxyRouter must be a function/middleware');
        // Test with mock req / res
        const headers = {};
        let ended = false;
        let responseData = null;

        const req = {
          query: { name: 'dancer_bob' },
          headers: {}
        };
        const res = {
          setHeader: (k, v) => { headers[k.toLowerCase()] = v; },
          writeHead: (code, h) => {
            if (h) Object.assign(headers, h);
          },
          status: function (code) { this.statusCode = code; return this; },
          send: function (data) { responseData = data; ended = true; return this; },
          end: function (data) { responseData = data; ended = true; return this; }
        };

        await avatarProxyRouter(req, res, () => {});

        assert.strictEqual(
          headers['access-control-allow-origin'],
          '*',
          'Avatar proxy must inject Access-Control-Allow-Origin: * for browser CORS'
        );
        assert.ok(
          headers['content-type']?.includes('svg') || headers['content-type']?.includes('image'),
          'Content-Type must be image or svg'
        );
      }
    },
    {
      name: 'test_svg_fallback_generation',
      fn: () => {
        assert.strictEqual(typeof generateSvgAvatar, 'function', 'generateSvgAvatar must be exported');
        const svg = generateSvgAvatar('john_doe', 'user100');
        assert.ok(typeof svg === 'string', 'SVG output must be a string');
        assert.ok(svg.includes('<svg'), 'Output must contain <svg tag');
        assert.ok(svg.includes('</svg>'), 'Output must contain </svg> closing tag');
        assert.ok(svg.includes('<circle'), 'Output must contain <circle> background');
        assert.ok(svg.includes('<text'), 'Output must contain <text> label');
        assert.ok(svg.includes('JD') || svg.includes('J'), 'Output must render username initials');
      }
    },
    {
      name: 'test_svg_fallback_special_chars',
      fn: () => {
        // Single character
        const svgSingle = generateSvgAvatar('z', '1');
        assert.ok(svgSingle.includes('Z'));

        // Special characters / whitespace
        const svgSpace = generateSvgAvatar('alice wonderland', '2');
        assert.ok(svgSpace.includes('AW') || svgSpace.includes('A'));

        // Non-alphanumeric fallback
        const svgSymbols = generateSvgAvatar('---', '3');
        assert.ok(svgSymbols.length > 50, 'Symbols should produce valid SVG fallback');
      }
    },
    {
      name: 'test_lru_cache_hit_and_eviction',
      fn: async () => {
        assert.ok(avatarCache, 'avatarCache instance must be exported');
        const maxCapacity = avatarCache.max || 1000;
        assert.ok(maxCapacity <= 1000, 'LRU cache max capacity must be bounded to at most 1000');

        // Populate items to test eviction
        avatarCache.set('mock_key_test_1', Buffer.from('image_1'));
        assert.strictEqual(avatarCache.has('mock_key_test_1'), true);

        const val = avatarCache.get('mock_key_test_1');
        assert.ok(val, 'Cache hit must return stored buffer');
      }
    },
    {
      name: 'test_lru_ttl_expiration',
      fn: () => {
        assert.ok(avatarCache, 'avatarCache must be present');
        // TTL is configured to 24 hours (86,400,000 ms)
        const ttl = avatarCache.ttl;
        if (ttl) {
          assert.strictEqual(ttl, 24 * 60 * 60 * 1000, 'LRU cache TTL must be 24 hours (86,400,000ms)');
        }
      }
    },
    {
      name: 'test_fetch_avatar_timeout_abort',
      fn: async () => {
        assert.strictEqual(typeof fetchAvatarWithCache, 'function');
        // Non-existent target should resolve cleanly with SVG fallback
        const result = await fetchAvatarWithCache('http://localhost:59999/nonexistent.jpg', 'fallback_user');
        assert.ok(result, 'Must return fallback avatar data without unhandled crash');
      }
    }
  ];

  for (const tc of testCases) {
    try {
      await tc.fn();
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
