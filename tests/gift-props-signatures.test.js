// tests/gift-props-signatures.test.js - Unit and QA suite for 3D Gift Props, Clean Honoring Alert, and SFX
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { GiftPropsManager, normalizeVietnameseKey } from '../src/gift-props.js';
import { GIFT_LOGOS, getGiftLogo } from '../src/ui-overlay.js';
import { SFX_CONFIGS, synthesizeSfxParams, AudioSystem } from '../src/audio-system.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function run() {
  console.log('Testing 3D Signature Gift Props, Clean Honoring Alert & Short SFX...');
  let passed = 0;

  // Test 1: GiftPropsManager instantiates and can trigger multiple distinct gift props with Vietnamese Diacritics
  {
    const scene = new THREE.Scene();
    const manager = new GiftPropsManager(scene);
    assert.strictEqual(manager.activeProps.length, 0, 'Initially 0 active props');

    // Trigger Jet (Máy bay)
    const jetProp = manager.trigger('Máy bay', new THREE.Vector3(0, 0, 0), 6000);
    assert.ok(jetProp, 'Jet prop must be created');
    assert.strictEqual(jetProp.giftKey, 'jet', 'Resolved giftKey must be jet');
    assert.ok(scene.children.includes(jetProp.group), 'Jet group must be added to scene');

    // Trigger Black Panther (Báo đen viền neon)
    const pantherProp = manager.trigger('Báo đen', new THREE.Vector3(0, 0, 0), 15000);
    assert.ok(pantherProp, 'Panther prop must be created');
    assert.strictEqual(pantherProp.giftKey, 'panther', 'Resolved giftKey must be panther');

    // Trigger Fire Tiger (Hổ lửa)
    const tigerProp = manager.trigger('Hổ lửa', new THREE.Vector3(0, 0, 0), 19999);
    assert.ok(tigerProp, 'Tiger prop must be created');
    assert.strictEqual(tigerProp.giftKey, 'tiger', 'Resolved giftKey must be tiger');

    // Trigger Universe (Vũ trụ TikTok)
    const uniProp = manager.trigger('Vũ trụ TikTok', new THREE.Vector3(0, 0, 0), 44999);
    assert.ok(uniProp, 'Universe prop must be created');
    assert.strictEqual(uniProp.giftKey, 'universe', 'Resolved giftKey must be universe');

    // Trigger Phoenix (Phượng hoàng)
    const phoenixProp = manager.trigger('Phượng hoàng', new THREE.Vector3(0, 0, 0), 25999);
    assert.ok(phoenixProp, 'Phoenix prop must be created');
    assert.strictEqual(phoenixProp.giftKey, 'phoenix', 'Resolved giftKey must be phoenix');

    // Trigger Lion (Sư tử)
    const lionProp = manager.trigger('Sư tử', new THREE.Vector3(0, 0, 0), 29999);
    assert.ok(lionProp, 'Lion prop must be created');
    assert.strictEqual(lionProp.giftKey, 'golden_lion', 'Resolved giftKey must be golden_lion');

    // Trigger Pegasus (Ngựa thần)
    const pegasusProp = manager.trigger('Ngựa thần', new THREE.Vector3(0, 0, 0), 42999);
    assert.ok(pegasusProp, 'Pegasus prop must be created');
    assert.strictEqual(pegasusProp.giftKey, 'pegasus', 'Resolved giftKey must be pegasus');

    // Trigger Disco Ball (Quả cầu Disco)
    const discoProp = manager.trigger('Quả cầu Disco', new THREE.Vector3(2, 0, 2), 1000);
    assert.ok(discoProp, 'Disco ball prop must be created');
    assert.strictEqual(discoProp.giftKey, 'disco_ball', 'Resolved giftKey must be disco_ball');

    // Trigger Money Gun (Súng bắn tiền)
    const moneyProp = manager.trigger('Súng bắn tiền', new THREE.Vector3(-2, 0, -2), 500);
    assert.ok(moneyProp, 'Money gun prop must be created');
    assert.strictEqual(moneyProp.giftKey, 'money_gun', 'Resolved giftKey must be money_gun');

    // Trigger Rose (Hoa hồng)
    const roseProp = manager.trigger('Hoa hồng', new THREE.Vector3(1, 0, 1), 1);
    assert.ok(roseProp, 'Rose prop must be created');
    assert.strictEqual(roseProp.giftKey, 'rose', 'Resolved giftKey must be rose');

    console.log('  ✓ Test 1: GiftPropsManager triggers signature 3D props with Vietnamese diacritics');
    passed++;
  }

  // Test 2: normalizeVietnameseKey removes accents and cleans punctuation
  {
    assert.strictEqual(normalizeVietnameseKey('Máy bay'), 'may_bay');
    assert.strictEqual(normalizeVietnameseKey('Báo đen'), 'bao_den');
    assert.strictEqual(normalizeVietnameseKey('Vũ trụ TikTok'), 'vu_tru_tiktok');
    assert.strictEqual(normalizeVietnameseKey('Phượng hoàng'), 'phuong_hoang');
    assert.strictEqual(normalizeVietnameseKey('Sư tử'), 'su_tu');
    assert.strictEqual(normalizeVietnameseKey('Hổ lửa'), 'ho_lua');
    assert.strictEqual(normalizeVietnameseKey('Ngựa thần'), 'ngua_than');
    assert.strictEqual(normalizeVietnameseKey('Quả cầu Disco'), 'qua_cau_disco');
    assert.strictEqual(normalizeVietnameseKey('Súng bắn tiền'), 'sung_ban_tien');
    assert.strictEqual(normalizeVietnameseKey('Hoa hồng'), 'hoa_hong');
    assert.strictEqual(normalizeVietnameseKey('Nón lá'), 'non_la');

    console.log('  ✓ Test 2: normalizeVietnameseKey clean ASCII translation');
    passed++;
  }

  // Test 3: GiftPropsManager lifecycle, update animation & cleanup dispose
  {
    const scene = new THREE.Scene();
    const manager = new GiftPropsManager(scene);

    const prop = manager.trigger('Máy bay', new THREE.Vector3(0, 0, 0), 6000);
    const initialChildrenCount = scene.children.length;

    // Simulate 1 second of animation update
    manager.update(1.0);
    assert.ok(prop.timer > 0.9, 'Prop timer must tick up');
    assert.strictEqual(scene.children.length, initialChildrenCount, 'Prop remains in scene during lifespan');

    // Advance beyond lifespan (jet duration is ~4.5s)
    manager.update(6.0);
    assert.strictEqual(manager.activeProps.length, 0, 'Prop must be cleaned up and removed from manager');
    assert.ok(!scene.children.includes(prop.group), 'Prop group must be removed from scene on expiration');

    console.log('  ✓ Test 3: GiftPropsManager per-frame animation and lifecycle disposal');
    passed++;
  }

  // Test 4: GIFT_LOGOS and getGiftLogo return correct icons for gifts
  {
    assert.strictEqual(getGiftLogo('rose'), '🌹', 'Rose must be 🌹');
    assert.strictEqual(getGiftLogo('hoa_hong'), '🌹', 'Vietnamese hoa_hong must be 🌹');
    assert.strictEqual(getGiftLogo('may_bay'), '✈️', 'Airplane must be ✈️');
    assert.strictEqual(getGiftLogo('jet'), '✈️', 'Jet must be ✈️');
    assert.strictEqual(getGiftLogo('qua_cau_disco'), '🪩', 'Disco ball must be 🪩');
    assert.strictEqual(getGiftLogo('sung_ban_tien'), '💸', 'Money gun must be 💸');
    assert.strictEqual(getGiftLogo('su_tu_vang'), '🦁', 'Golden lion must be 🦁');
    assert.strictEqual(getGiftLogo('vu_tru'), '🪐', 'Universe must be 🪐');
    assert.strictEqual(getGiftLogo('phuong_hoang'), '🦅', 'Phoenix must be 🦅');
    assert.strictEqual(getGiftLogo('ngua_than'), '🦄', 'Pegasus must be 🦄');
    assert.strictEqual(getGiftLogo('non_la'), '👒', 'Conical hat must be 👒');
    assert.strictEqual(getGiftLogo('cau_vong'), '🌈', 'Rainbow must be 🌈');
    assert.strictEqual(getGiftLogo('unknown_gift_xyz'), '🎁', 'Fallback gift logo must be 🎁');

    console.log('  ✓ Test 4: Gift logo lookup supports VN and EN keys with emoji icons');
    passed++;
  }

  // Test 5: Audio SFX duration strictly <= 1.8s and exponential clickless decay
  {
    for (const [key, config] of Object.entries(SFX_CONFIGS)) {
      assert.ok(
        config.duration <= 1.8,
        `SFX "${key}" duration (${config.duration}s) must be <= 1.8s`
      );
      assert.ok(
        config.duration >= 0.1,
        `SFX "${key}" duration (${config.duration}s) must be >= 0.1s`
      );
      assert.strictEqual(
        config.decayTarget,
        0.0001,
        `SFX "${key}" must have clickless exponential decayTarget 0.0001`
      );
    }

    const jetSfx = synthesizeSfxParams('jetswoosh');
    assert.ok(jetSfx.duration <= 1.8, 'jetSwoosh SFX duration <= 1.8s');

    const fanfareSfx = synthesizeSfxParams('fanfare');
    assert.ok(fanfareSfx.duration <= 1.8, 'fanfare SFX duration <= 1.8s');

    const boomSfx = synthesizeSfxParams('bassboom');
    assert.ok(boomSfx.duration <= 1.8, 'bassBoom SFX duration <= 1.8s');

    console.log('  ✓ Test 5: Audio SFX durations strictly <= 1.8s with exponential decay');
    passed++;
  }

  // Test 6: OBS overlay screen (index.html) is 100% clean of admin panel
  {
    const htmlPath = path.join(__dirname, '../src/index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');

    assert.ok(!html.includes('id="admin-drawer"'), 'Port 3000 MUST NOT contain admin-drawer');
    assert.ok(!html.includes('id="admin-toggle-btn"'), 'Port 3000 MUST NOT contain admin-toggle-btn');
    assert.ok(html.includes('id="gift-banner"'), 'Port 3000 MUST contain gift-banner');
    assert.ok(html.includes('id="banner-logo"'), 'Port 3000 MUST contain banner-logo');
    assert.ok(html.includes('id="banner-sub"'), 'Port 3000 MUST contain banner-sub');

    console.log('  ✓ Test 6: Port 3000 OBS overlay is clean with gift logo and coin badge');
    passed++;
  }

  // Test 7: Verify preview/slime-preview.js integrates GiftPropsManager
  {
    const previewPath = path.join(__dirname, '../preview/slime-preview.js');
    const previewCode = fs.readFileSync(previewPath, 'utf8');

    assert.ok(previewCode.includes('GiftPropsManager'), 'preview/slime-preview.js must import GiftPropsManager');
    assert.ok(previewCode.includes('giftProps.trigger'), 'preview/slime-preview.js must call giftProps.trigger');
    assert.ok(previewCode.includes('giftProps.update'), 'preview/slime-preview.js must call giftProps.update');

    console.log('  ✓ Test 7: Preview mode seamlessly integrates 3D Gift Props');
    passed++;
  }

  console.log(`\nAll ${passed}/7 3D Gift Props & Clean Notification tests passed successfully!`);
  return { total: 7, passed, failed: 0 };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run().then((res) => {
    process.exit(res.failed > 0 ? 1 : 0);
  });
}
