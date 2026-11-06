import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

export async function run() {
  const suite = 'event-normalizer';
  const results = {
    suite,
    total: 10,
    passed: 0,
    failed: 0,
    cases: []
  };

  let normalizer;
  try {
    normalizer = await import('../server/event-normalizer.js');
  } catch (err) {
    results.failed = results.total;
    results.error = err.code || err.message;
    results.cases.push({
      name: 'module_import',
      status: 'FAIL',
      error: `Failed to import server/event-normalizer.js: ${err.message}`,
      code: err.code
    });
    return results;
  }

  const {
    normalizeTikTokEvent,
    normalizeChat,
    normalizeGift,
    normalizeLike,
    normalizeSocial,
    sanitizeComment
  } = normalizer;

  const testCases = [
    {
      name: 'test_normalize_chat_standard',
      fn: () => {
        const raw = {
          uniqueId: 'dance_fan',
          userId: '1001',
          nickname: 'Dance Fan',
          profilePictureUrl: 'https://cdn.example.com/pfp1.jpg',
          comment: 'Let us party tonight!'
        };
        const evt = normalizeTikTokEvent('chat', raw);
        assert.strictEqual(evt.type, 'chat');
        assert.strictEqual(evt.user.username, 'dance_fan');
        assert.strictEqual(evt.user.id, '1001');
        assert.strictEqual(evt.data.comment, 'Let us party tonight!');
        assert.ok(evt.id, 'Expected unique event id');
        assert.ok(typeof evt.timestamp === 'number');
      }
    },
    {
      name: 'test_chat_profanity_censorship',
      fn: () => {
        assert.strictEqual(typeof sanitizeComment, 'function', 'sanitizeComment must be exported');
        const dirty = 'This hack and scam is pure shit and fuck!';
        const cleaned = sanitizeComment(dirty);
        assert.strictEqual(cleaned, 'This **** and **** is pure **** and ****!');
        const uppercase = 'STOP CHEAT NOW';
        assert.strictEqual(sanitizeComment(uppercase), 'STOP ***** NOW');
      }
    },
    {
      name: 'test_chat_edge_cases',
      fn: () => {
        const empty = normalizeTikTokEvent('chat', { uniqueId: 'u', userId: '1', comment: '' });
        assert.strictEqual(empty.data.comment, '');
        const spaces = normalizeTikTokEvent('chat', { uniqueId: 'u', userId: '1', comment: '   ' });
        assert.strictEqual(spaces.data.comment.trim(), '');
        const emojis = '🔥🎉💃🕺✨';
        const emojiEvt = normalizeTikTokEvent('chat', { uniqueId: 'u', userId: '1', comment: emojis });
        assert.strictEqual(emojiEvt.data.comment, emojis);
        const xss = '<script>alert(1)</script>';
        const xssEvt = normalizeTikTokEvent('chat', { uniqueId: 'u', userId: '1', comment: xss });
        assert.ok(xssEvt.data.comment.length > 0);
      }
    },
    {
      name: 'test_gift_tier_1_boundary',
      fn: () => {
        // Tier 1: 1 - 99 coins
        const g1 = normalizeTikTokEvent('gift', {
          uniqueId: 'u1',
          userId: '1',
          giftId: 1,
          giftName: 'Rose',
          diamondCount: 1,
          repeatCount: 1
        });
        assert.strictEqual(g1.data.tier, 1);
        assert.strictEqual(g1.data.totalCoins, 1);

        const g99 = normalizeTikTokEvent('gift', {
          uniqueId: 'u1',
          userId: '1',
          giftId: 2,
          giftName: 'Panda',
          diamondCount: 99,
          repeatCount: 1
        });
        assert.strictEqual(g99.data.tier, 1);
        assert.strictEqual(g99.data.totalCoins, 99);
      }
    },
    {
      name: 'test_gift_tier_2_boundary',
      fn: () => {
        // Tier 2: 100 - 499 coins
        const g100 = normalizeTikTokEvent('gift', {
          uniqueId: 'u2',
          userId: '2',
          giftId: 10,
          giftName: 'Perfume',
          diamondCount: 100,
          repeatCount: 1
        });
        assert.strictEqual(g100.data.tier, 2);
        assert.strictEqual(g100.data.totalCoins, 100);

        const g499 = normalizeTikTokEvent('gift', {
          uniqueId: 'u2',
          userId: '2',
          giftId: 11,
          giftName: 'Sunglasses',
          diamondCount: 499,
          repeatCount: 1
        });
        assert.strictEqual(g499.data.tier, 2);
        assert.strictEqual(g499.data.totalCoins, 499);
      }
    },
    {
      name: 'test_gift_tier_3_boundary',
      fn: () => {
        // Tier 3: 500 - 1999 coins
        const g500 = normalizeTikTokEvent('gift', {
          uniqueId: 'u3',
          userId: '3',
          giftId: 20,
          giftName: 'Lion',
          diamondCount: 500,
          repeatCount: 1
        });
        assert.strictEqual(g500.data.tier, 3);
        assert.strictEqual(g500.data.totalCoins, 500);

        const g1999 = normalizeTikTokEvent('gift', {
          uniqueId: 'u3',
          userId: '3',
          giftId: 21,
          giftName: 'Supercar',
          diamondCount: 1999,
          repeatCount: 1
        });
        assert.strictEqual(g1999.data.tier, 3);
        assert.strictEqual(g1999.data.totalCoins, 1999);
      }
    },
    {
      name: 'test_gift_tier_4_boundary',
      fn: () => {
        // Tier 4: 2000+ coins
        const g2000 = normalizeTikTokEvent('gift', {
          uniqueId: 'u4',
          userId: '4',
          giftId: 30,
          giftName: 'Universe',
          diamondCount: 2000,
          repeatCount: 1
        });
        assert.strictEqual(g2000.data.tier, 4);
        assert.strictEqual(g2000.data.totalCoins, 2000);

        const g50k = normalizeTikTokEvent('gift', {
          uniqueId: 'u4',
          userId: '4',
          giftId: 31,
          giftName: 'Falcon',
          diamondCount: 50000,
          repeatCount: 1
        });
        assert.strictEqual(g50k.data.tier, 4);
        assert.strictEqual(g50k.data.totalCoins, 50000);
      }
    },
    {
      name: 'test_gift_repeat_multiplication',
      fn: () => {
        // 1 coin * 500 repeat = 500 total coins -> Tier 3
        const repeatRose = normalizeTikTokEvent('gift', {
          uniqueId: 'u1',
          userId: '1',
          giftId: 1,
          giftName: 'Rose',
          diamondCount: 1,
          repeatCount: 500
        });
        assert.strictEqual(repeatRose.data.totalCoins, 500);
        assert.strictEqual(repeatRose.data.tier, 3);

        // 100 coins * 20 repeat = 2000 total coins -> Tier 4
        const repeatPerfume = normalizeTikTokEvent('gift', {
          uniqueId: 'u2',
          userId: '2',
          giftId: 10,
          giftName: 'Perfume',
          diamondCount: 100,
          repeatCount: 20
        });
        assert.strictEqual(repeatPerfume.data.totalCoins, 2000);
        assert.strictEqual(repeatPerfume.data.tier, 4);
      }
    },
    {
      name: 'test_gift_edge_case_payloads',
      fn: () => {
        // Missing repeatCount defaults to 1
        const noRepeat = normalizeTikTokEvent('gift', {
          uniqueId: 'u1',
          userId: '1',
          giftId: 1,
          diamondCount: 10
        });
        assert.strictEqual(noRepeat.data.repeatCount, 1);
        assert.strictEqual(noRepeat.data.totalCoins, 10);
        assert.strictEqual(noRepeat.data.tier, 1);

        // Zero coins
        const zeroCoins = normalizeTikTokEvent('gift', {
          uniqueId: 'u1',
          userId: '1',
          giftId: 0,
          diamondCount: 0
        });
        assert.strictEqual(zeroCoins.data.totalCoins, 0);
        assert.strictEqual(zeroCoins.data.tier, 1);
      }
    },
    {
      name: 'test_normalize_social_events',
      fn: () => {
        const likeEvt = normalizeTikTokEvent('like', {
          uniqueId: 'liker',
          userId: '5',
          likeCount: 15,
          totalLikeCount: 1500
        });
        assert.strictEqual(likeEvt.type, 'like');
        assert.strictEqual(likeEvt.data.likeCount, 15);

        const followEvt = normalizeTikTokEvent('follow', {
          uniqueId: 'follower',
          userId: '6'
        });
        assert.strictEqual(followEvt.type, 'follow');
        assert.strictEqual(followEvt.user.username, 'follower');

        const shareEvt = normalizeTikTokEvent('share', {
          uniqueId: 'sharer',
          userId: '7'
        });
        assert.strictEqual(shareEvt.type, 'share');
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
