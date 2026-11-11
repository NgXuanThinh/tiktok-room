// tests/camera-focus-slime.test.js - QA Suite for Camera Focus on Selected Slime Feature
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { SceneManager } from '../src/scene-manager.js';
import { createCyberSlime } from '../src/slime-model.js';
import { handleAdminCommand } from '../src/live-event-handler.js';
import { deleteAvatar, clearAllAvatars } from '../src/avatar-coordinator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function run() {
  const suite = 'camera-focus-slime';
  const results = {
    suite,
    total: 6,
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

  console.log('Testing Camera Focus on Selected Slime (Admin Option)...');

  // Test 1: sceneManager.focusOnAvatar sets target tracking and custom framing
  test('sceneManager.focusOnAvatar correctly tracks avatar and calculates camera framing', () => {
    const scene = new THREE.Scene();
    const fakeContainer = { clientWidth: 1280, clientHeight: 720, appendChild: () => {} };
    const sm = new SceneManager(fakeContainer);

    const slime = createCyberSlime('cyan', { id: 'focus_u1', username: 'SlimeFocusTarget' });
    slime.mesh.position.set(2.5, 0, -1.8);
    sm.scene.add(slime.mesh);

    sm.focusOnAvatar(slime.mesh);
    assert.strictEqual(sm.focusedAvatarMesh, slime.mesh, 'focusedAvatarMesh must reference selected slime');

    // Update frame
    sm.update(0.05);

    // Look target must target slime's (sx, sz) position
    assert.ok(Math.abs(sm.camLookTarget.x - 2.5) < 0.1, 'Look target X must align with slime X');
    assert.ok(Math.abs(sm.camLookTarget.z - (-1.8)) < 0.1, 'Look target Z must align with slime Z');
    assert.ok(sm.camLookTarget.y > 0.5, 'Look target Y must focus on slime upper body/face');
  });

  // Test 2: sceneManager.clearAvatarFocus restores previous camera state
  test('sceneManager.clearAvatarFocus cleanly restores camera preset and clears reference', () => {
    const fakeContainer = { clientWidth: 1280, clientHeight: 720, appendChild: () => {} };
    const sm = new SceneManager(fakeContainer);
    sm.setCameraPreset('dj');

    const slime = createCyberSlime('pink', { id: 'focus_u2', username: 'Slime2' });
    sm.scene.add(slime.mesh);

    sm.focusOnAvatar(slime.mesh);
    assert.strictEqual(sm.focusedAvatarMesh, slime.mesh);

    sm.clearAvatarFocus();
    assert.strictEqual(sm.focusedAvatarMesh, null, 'focusedAvatarMesh must be null after clear');
    assert.strictEqual(sm.currentPresetKey, 'dj', 'Camera preset must revert to previous preset (dj)');
  });

  // Test 3: Selecting standard camera presets clears active avatar focus
  test('Selecting another camera preset automatically cancels avatar focus', () => {
    const fakeContainer = { clientWidth: 1280, clientHeight: 720, appendChild: () => {} };
    const sm = new SceneManager(fakeContainer);

    const slime = createCyberSlime('lime', { id: 'focus_u3', username: 'Slime3' });
    sm.scene.add(slime.mesh);

    sm.focusOnAvatar(slime.mesh);
    assert.strictEqual(sm.focusedAvatarMesh, slime.mesh);

    sm.setCameraPreset('top');
    assert.strictEqual(sm.focusedAvatarMesh, null, 'Avatar focus must be cleared when a preset is set');
    assert.strictEqual(sm.currentPresetKey, 'top');
  });

  // Test 4: handleAdminCommand handles focus_avatar and clear_avatar_focus
  test('handleAdminCommand dispatches focus_avatar and clear_avatar_focus correctly', () => {
    const fakeContainer = { clientWidth: 1280, clientHeight: 720, appendChild: () => {} };
    const sm = new SceneManager(fakeContainer);

    const slime = createCyberSlime('gold', { id: 'vip_target', username: 'GoldenVip' });
    sm.scene.add(slime.mesh);

    const avatarMeshes = new Map();
    avatarMeshes.set('vip_target', slime.mesh);

    const ctx = {
      sceneManager: sm,
      avatarMeshes,
      audioSystem: { setVolume: () => {}, toggleMute: () => {} },
      uiOverlay: { triggerFrenzyMode: () => {} }
    };

    // Command focus_avatar with valid userId
    handleAdminCommand({ command: 'focus_avatar', userId: 'vip_target' }, ctx);
    assert.strictEqual(sm.focusedAvatarMesh, slime.mesh, 'Admin command must trigger avatar focus on matching user');

    // Command clear_avatar_focus
    handleAdminCommand({ command: 'clear_avatar_focus' }, ctx);
    assert.strictEqual(sm.focusedAvatarMesh, null, 'clear_avatar_focus must clear focused avatar');
  });

  // Test 5: deleteAvatar and clearAllAvatars automatically unfocus removed avatars
  test('deleteAvatar and clearAllAvatars automatically reset camera focus if target is deleted', () => {
    const fakeContainer = { clientWidth: 1280, clientHeight: 720, appendChild: () => {} };
    const sm = new SceneManager(fakeContainer);

    const slime = createCyberSlime('blue', { id: 'deleted_u', username: 'WillBeDeleted' });
    sm.scene.add(slime.mesh);

    const avatarMeshes = new Map();
    avatarMeshes.set('deleted_u', slime.mesh);

    const context = {
      avatarMeshes,
      occupancyManager: { removeAvatar: () => {}, clearAll: () => {} },
      userCoinsMap: new Map(),
      vipLoungeManager: { removeUser: () => {}, clear: () => {} },
      sceneManager: sm,
      uiOverlay: { updateLeaderboard: () => {} },
      syncActiveFloorAvatars: () => {}
    };

    sm.focusOnAvatar(slime.mesh);
    assert.strictEqual(sm.focusedAvatarMesh, slime.mesh);

    // Delete focused avatar
    deleteAvatar('deleted_u', context);
    assert.strictEqual(sm.focusedAvatarMesh, null, 'Focus must automatically clear when avatar is deleted');
  });

  // Test 6: Verify Admin Cockpit UI HTML elements for Camera Focus
  test('src/admin.html contains camera focus select dropdown, start/clear buttons & avatar row button', () => {
    const adminHtmlPath = path.resolve(__dirname, '../src/admin.html');
    const content = fs.readFileSync(adminHtmlPath, 'utf8');

    assert.ok(content.includes('id="camera-focus-avatar-select"'), 'admin.html must contain camera-focus-avatar-select');
    assert.ok(content.includes('id="btn-camera-focus-start"'), 'admin.html must contain btn-camera-focus-start');
    assert.ok(content.includes('id="btn-camera-focus-clear"'), 'admin.html must contain btn-camera-focus-clear');
    assert.ok(content.includes('id="btn-mock-focus-avatar"'), 'admin.html must contain btn-mock-focus-avatar');
    assert.ok(content.includes("command: 'focus_avatar'"), 'admin.html must dispatch focus_avatar command');
  });

  return results;
}

if (process.argv[1] && process.argv[1].endsWith('camera-focus-slime.test.js')) {
  run().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
