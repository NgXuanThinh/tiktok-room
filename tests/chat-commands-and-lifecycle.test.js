import assert from 'node:assert';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { LIKE_JUMP_CONFIG, DONATE_CELEBRATION_CONFIG } from '../src/animation-constants.js';
import { createAvatarMesh, setSlimeColor, parseColorCommand } from '../src/avatar-manager.js';
import { handleChatEvent, handleLikeEvent } from '../src/live-event-handler.js';

export async function run() {
  const suite = 'chat-commands-and-lifecycle';
  const results = {
    suite,
    total: 5,
    passed: 0,
    failed: 0,
    cases: []
  };

  const testCases = [
    {
      name: 'test_animation_constants_configuration',
      fn: () => {
        assert.ok(LIKE_JUMP_CONFIG, 'LIKE_JUMP_CONFIG must exist');
        assert.strictEqual(typeof LIKE_JUMP_CONFIG.apexHeight, 'number');
        assert.strictEqual(typeof LIKE_JUMP_CONFIG.duration, 'number');
        assert.strictEqual(typeof LIKE_JUMP_CONFIG.jumpCount, 'number');

        assert.ok(DONATE_CELEBRATION_CONFIG, 'DONATE_CELEBRATION_CONFIG must exist');
        assert.ok(DONATE_CELEBRATION_CONFIG.coin1.jumpCount >= 1);
        assert.ok(DONATE_CELEBRATION_CONFIG.coin1.coinsDropped >= 1);
        assert.ok(DONATE_CELEBRATION_CONFIG.coin5.jumpCount >= 1);
        assert.ok(DONATE_CELEBRATION_CONFIG.coin5.coinsDropped >= 1);
        assert.ok(DONATE_CELEBRATION_CONFIG.coin10.coinsDropped >= 1);
      }
    },
    {
      name: 'test_first_command_matching_rule',
      fn: () => {
        const mesh = createAvatarMesh({ id: 'u1', username: 'TestUser', color: 'green' });
        const context = {
          uiOverlay: { addHype: () => {} },
          getOrCreateAvatarMesh: () => mesh,
          syncActiveFloorAvatars: () => {}
        };

        // 1. "asdasdsadas !face" must be treated as regular chat, not command
        mesh.userData.controller.setExpression('normal');
        handleChatEvent({ user: { id: 'u1' }, data: { comment: 'asdasdsadas !face' } }, context);
        assert.strictEqual(mesh.userData.controller.state.expression, 'normal', 'Must not trigger command if not at start');

        // 2. "!face !color" must only match the first command (!face)
        const initialColor = mesh.userData.colorKey;
        handleChatEvent({ user: { id: 'u1' }, data: { comment: '!face smile !color red' } }, context);
        assert.strictEqual(mesh.userData.controller.state.expression, 'smile', 'Must match !face');
        assert.strictEqual(mesh.userData.colorKey, initialColor, 'Must NOT execute subsequent !color command');

        // 3. "!color " (empty argument) randomizes 1 of the other 2 remaining colors
        mesh.userData.colorKey = 'green';
        handleChatEvent({ user: { id: 'u1' }, data: { comment: '!color ' } }, context);
        assert.ok(['red', 'blue'].includes(mesh.userData.colorKey), 'Must pick either red or blue when current is green');
      }
    },
    {
      name: 'test_face_modes_and_randomization',
      fn: () => {
        const mesh = createAvatarMesh({ id: 'u2', username: 'User2', color: 'blue' });
        const context = {
          uiOverlay: { addHype: () => {} },
          getOrCreateAvatarMesh: () => mesh,
          syncActiveFloorAvatars: () => {}
        };

        // Explicit face commands
        handleChatEvent({ user: { id: 'u2' }, data: { comment: '!face smile' } }, context);
        assert.strictEqual(mesh.userData.controller.state.expression, 'smile');

        handleChatEvent({ user: { id: 'u2' }, data: { comment: '!face wink' } }, context);
        assert.strictEqual(mesh.userData.controller.state.expression, 'wink');

        handleChatEvent({ user: { id: 'u2' }, data: { comment: '!face normal' } }, context);
        assert.strictEqual(mesh.userData.controller.state.expression, 'normal');

        // Empty !face randomizes 1 of the other 2
        handleChatEvent({ user: { id: 'u2' }, data: { comment: '!face' } }, context);
        assert.ok(['smile', 'wink'].includes(mesh.userData.controller.state.expression), 'Must pick smile or wink when current was normal');
      }
    },
    {
      name: 'test_dance_commands_and_removed_commands',
      fn: () => {
        const mesh = createAvatarMesh({ id: 'u3', username: 'User3', color: 'red' });
        const context = {
          uiOverlay: { addHype: () => {} },
          getOrCreateAvatarMesh: () => mesh,
          syncActiveFloorAvatars: () => {}
        };

        // !dance 1 -> Z-spin
        handleChatEvent({ user: { id: 'u3' }, data: { comment: '!dance 1' } }, context);
        assert.strictEqual(mesh.userData.controller.state.danceMode, 1);

        // !dance 2 -> default bounce
        handleChatEvent({ user: { id: 'u3' }, data: { comment: '!dance 2' } }, context);
        assert.strictEqual(mesh.userData.controller.state.danceMode, 2);

        // !dance toggle
        handleChatEvent({ user: { id: 'u3' }, data: { comment: '!dance' } }, context);
        assert.strictEqual(mesh.userData.controller.state.danceMode, 1);

        // Removed commands (!tier, !jump, !wave, !cheer) do not change state
        const prevTier = mesh.userData.controller.state.tier;
        handleChatEvent({ user: { id: 'u3' }, data: { comment: '!tier 5' } }, context);
        assert.strictEqual(mesh.userData.controller.state.tier, prevTier, '!tier must be ignored');

        handleChatEvent({ user: { id: 'u3' }, data: { comment: '!jump' } }, context);
        handleChatEvent({ user: { id: 'u3' }, data: { comment: '!wave' } }, context);
        handleChatEvent({ user: { id: 'u3' }, data: { comment: '!cheer' } }, context);
      }
    },
    {
      name: 'test_shared_geometry_preservation_on_delete',
      fn: () => {
        // Create first avatar
        const mesh1 = createAvatarMesh({ id: 'bot_1', username: 'Bot1', isPinned: true });
        const bodyMesh1 = mesh1.getObjectByName('slime_body');
        assert.ok(bodyMesh1, 'First avatar must have slime_body');
        assert.ok(bodyMesh1.geometry, 'First avatar body must have geometry');
        assert.strictEqual(bodyMesh1.geometry.userData?.isShared, true, 'shared geometry must be marked isShared');

        // Simulate safe disposal logic
        mesh1.traverse((child) => {
          if (child.geometry && !child.geometry.userData?.isShared) {
            child.geometry.dispose();
          }
          if (child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((m) => {
              if (!m.userData?.isShared) m.dispose();
            });
          }
        });

        // Create second avatar: shared geometry must still have active buffers
        const mesh2 = createAvatarMesh({ id: 'bot_2', username: 'Bot2', isPinned: true });
        const bodyMesh2 = mesh2.getObjectByName('slime_body');
        assert.ok(bodyMesh2, 'Second avatar must have slime_body');
        assert.ok(bodyMesh2.geometry.attributes.position, 'Position buffer must still be intact');
        assert.strictEqual(bodyMesh2.geometry.attributes.position.count > 0, true);
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
