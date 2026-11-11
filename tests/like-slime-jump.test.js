import assert from 'node:assert';
import * as THREE from 'three';
import { createCyberSlime } from '../src/slime-model.js';
import { ClubEnvironment, createHeartBubbleTexture } from '../src/club-environment.js';
import { handleLikeEvent } from '../src/live-event-handler.js';
import fs from 'node:fs';
import path from 'node:path';

export async function run() {
  const suite = 'like-slime-jump';
  const results = {
    suite,
    total: 5,
    passed: 0,
    failed: 0,
    cases: []
  };

  const test = (name, fn) => {
    try {
      fn();
      results.passed++;
      results.cases.push({ name, status: 'PASS' });
      console.log(`  ✓ ${name}`);
    } catch (err) {
      results.failed++;
      results.cases.push({ name, status: 'FAIL', error: err.message });
      console.error(`  ✗ ${name}:`, err.message);
    }
  };

  console.log('Testing Like Button, Slime Jump & Floating Red Heart Bubbles...');

  // Test 1: Slime controller has triggerLikeJump and animates 1 single jump
  test('Slime controller triggers single jump on like', () => {
    const controller = createCyberSlime('cyan', { id: 'u1', username: 'TestUser' });
    assert.strictEqual(typeof controller.triggerLikeJump, 'function', 'Controller must export triggerLikeJump');

    controller.triggerLikeJump();
    assert.ok(controller.state.likeJump, 'likeJump state must be active');
    assert.strictEqual(controller.state.expression, 'smile', 'Expression should be smile during like');

    // Update halfway (launching up)
    controller.update(0.2, 0);
    assert.ok(controller.rootNode.position.y > 0.5, 'Root node Y must have leaped upward');

    // Update through completion
    controller.update(0.6, 0);
    assert.strictEqual(controller.state.likeJump, null, 'likeJump should reset to null after jump duration');
    assert.strictEqual(controller.state.expression, 'normal', 'Expression should reset to normal');
  });

  // Test 2: ClubEnvironment spawns red heart bubbles with lifespans and fade-out
  test('ClubEnvironment spawns red heart bubbles and updates them with opacity decay', () => {
    const scene = new THREE.Scene();
    const env = new ClubEnvironment(scene);

    assert.ok(Array.isArray(env.activeHeartBubbles), 'activeHeartBubbles array must exist');
    env.spawnHeartBubbles(new THREE.Vector3(1, 0, 2), 4);

    assert.strictEqual(env.activeHeartBubbles.length, 4, 'Must have spawned 4 heart bubbles');
    const firstBubble = env.activeHeartBubbles[0];
    const initialY = firstBubble.sprite.position.y;
    const initialOpacity = firstBubble.sprite.material.opacity;

    // Simulate 0.5s delta
    env.update(0.5);
    assert.ok(firstBubble.sprite.position.y > initialY, 'Bubble must have floated upward');
    assert.ok(firstBubble.sprite.material.opacity < initialOpacity, 'Bubble opacity must decrease as it rises');

    // Simulate rest of life until all bubbles disappear
    env.update(3.0);
    assert.strictEqual(env.activeHeartBubbles.length, 0, 'All heart bubbles must disappear after maxLife');
  });

  // Test 3: handleLikeEvent triggers slime jump and heart bubbles for user
  test('handleLikeEvent coordinates slime jump and heart bubbles', () => {
    const scene = new THREE.Scene();
    const env = new ClubEnvironment(scene);
    let jumped = false;
    let playedSfx = false;

    const mockAvatar = {
      position: new THREE.Vector3(2, 0, -1),
      userData: {
        controller: {
          triggerLikeJump: () => { jumped = true; }
        }
      }
    };

    const avatarMeshes = new Map();
    avatarMeshes.set('donor1', mockAvatar);

    const ctx = {
      clubEnvironment: env,
      avatarMeshes,
      uiOverlay: { addHype: () => {} },
      audioSystem: { playSfx: (s) => { if (s === 'heartwhoosh') playedSfx = true; } },
      getOrCreateAvatarMesh: () => mockAvatar
    };

    handleLikeEvent({
      type: 'like',
      user: { id: 'donor1', username: 'DonorOne' },
      data: { count: 1, likeCount: 1 }
    }, ctx);

    assert.strictEqual(jumped, true, 'User slime must have jumped 1 time');
    assert.strictEqual(playedSfx, true, 'Heart swoosh sound must be triggered');
    assert.ok(env.activeHeartBubbles.length >= 3, 'Red heart bubbles must have spawned around avatar position');
  });

  // Test 4: UI index.html contains Like Button with icon and counter
  test('src/index.html includes Interactive Stream Like Button', () => {
    const html = fs.readFileSync(path.resolve(process.cwd(), 'src/index.html'), 'utf8');
    assert.ok(html.includes('id="btn-stream-like"'), 'index.html must include #btn-stream-like');
    assert.ok(html.includes('id="like-btn-counter"'), 'index.html must include #like-btn-counter');
    assert.ok(html.includes('❤️'), 'index.html must include heart icon');
  });

  // Test 5: Admin panel src/admin.html contains Like / Thả 1 Tim button
  test('src/admin.html includes Like (Thả 1 Tim) button', () => {
    const html = fs.readFileSync(path.resolve(process.cwd(), 'src/admin.html'), 'utf8');
    assert.ok(html.includes('id="btn-mock-likes-1"'), 'admin.html must include #btn-mock-likes-1');
  });

  return results;
}

if (process.argv[1] && process.argv[1].endsWith('like-slime-jump.test.js')) {
  run().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
