// tests/avatar-isolation.test.js
import assert from 'node:assert';
import {
  isolateDonationAvatar,
  revealAvatarsForZoomOut,
  isAvatarIsolationActive
} from '../src/avatar-coordinator.js';

console.log('Testing Avatar & Billboard Isolation during Camera Zoom In/Out...');

// Mock slimes
function createMockSlime(id) {
  const billboard = {
    visible: true,
    renderOrder: 0,
    material: { depthTest: true }
  };
  return {
    id,
    visible: true,
    scale: { setScalar() {} },
    userData: {
      billboard,
      controller: { billboard },
      currentScale: 1.0,
      targetScale: 1.0,
      baseScale: 1.0
    }
  };
}

const avatarMeshes = new Map();
const hero = createMockSlime('hero_user');
const slime1 = createMockSlime('slime_1');
const slime2 = createMockSlime('slime_2');

avatarMeshes.set('hero_user', hero);
avatarMeshes.set('slime_1', slime1);
avatarMeshes.set('slime_2', slime2);

// 1. Test Zoom In Isolation
isolateDonationAvatar(hero, avatarMeshes);
assert.strictEqual(isAvatarIsolationActive(), true, 'Isolation state should be active');
assert.strictEqual(hero.visible, true, 'Hero avatar should remain visible');
assert.strictEqual(hero.userData.billboard.visible, true, 'Hero billboard should remain visible');
assert.strictEqual(hero.userData.billboard.renderOrder, 9999, 'Hero billboard should have top renderOrder');
assert.strictEqual(hero.userData.billboard.material.depthTest, false, 'Hero billboard depthTest should be false');

assert.strictEqual(slime1.visible, false, 'Slime 1 should be hidden');
assert.strictEqual(slime1.userData.billboard.visible, false, 'Slime 1 billboard should be hidden');
assert.strictEqual(slime2.visible, false, 'Slime 2 should be hidden');
assert.strictEqual(slime2.userData.billboard.visible, false, 'Slime 2 billboard should be hidden');
console.log('  ✓ Zoom In successfully isolates hero and hides other slimes & billboards');

// 2. Test Stage 1 Zoom Out (immediate body reveal, billboard delayed)
revealAvatarsForZoomOut(avatarMeshes, { animateBloom: true, billboardDelayMs: 50 });
assert.strictEqual(isAvatarIsolationActive(), false, 'Isolation state should be cleared');
assert.strictEqual(slime1.visible, true, 'Stage 1: Slime 1 body should become visible');
assert.strictEqual(slime1.userData.currentScale, 0.05, 'Stage 1: Slime 1 should bloom from scale 0.05');
assert.strictEqual(slime1.userData.billboard.visible, false, 'Stage 1: Slime 1 billboard should remain hidden');

assert.strictEqual(slime2.visible, true, 'Stage 1: Slime 2 body should become visible');
assert.strictEqual(slime2.userData.currentScale, 0.05, 'Stage 1: Slime 2 should bloom from scale 0.05');
assert.strictEqual(slime2.userData.billboard.visible, false, 'Stage 1: Slime 2 billboard should remain hidden');
console.log('  ✓ Stage 1: Slime bodies bloom up while other billboards remain safely hidden');

// 3. Test Stage 2 Zoom Out (delayed billboard reveal)
setTimeout(() => {
  assert.strictEqual(slime1.userData.billboard.visible, true, 'Stage 2: Slime 1 billboard should be revealed');
  assert.strictEqual(slime2.userData.billboard.visible, true, 'Stage 2: Slime 2 billboard should be revealed');
  assert.strictEqual(hero.userData.billboard.renderOrder, 0, 'Stage 2: Hero billboard renderOrder restored');
  assert.strictEqual(hero.userData.billboard.material.depthTest, true, 'Stage 2: Hero billboard depthTest restored');
  console.log('  ✓ Stage 2: Billboards revealed smoothly and hero renderOrder restored');
  console.log('All Avatar & Billboard isolation tests passed successfully!');
}, 70);
