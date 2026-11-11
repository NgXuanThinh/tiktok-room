import assert from 'node:assert';
import { BILLBOARD_BORDERS, BILLBOARD_PILLS, BILLBOARD_LAYOUT } from '../src/billboard-constants.js';
import { normalizeTikTokEvent } from '../server/event-normalizer.js';
import { handleLiveEvent } from '../src/live-event-handler.js';
import { createBillboardSprite } from '../src/slime-model.js';

export async function run() {
  const suite = 'billboard-improvement';
  const results = {
    suite,
    total: 8,
    passed: 0,
    failed: 0,
    cases: []
  };

  const testCases = [
    {
      name: 'test_billboard_constants_definitions',
      fn: () => {
        assert.strictEqual(BILLBOARD_BORDERS.TOP1.color, '#ffd700');
        assert.strictEqual(BILLBOARD_BORDERS.TOP1.lineWidth, 5.5);
        assert.strictEqual(BILLBOARD_BORDERS.TOP2.color, '#e0e0e8');
        assert.strictEqual(BILLBOARD_BORDERS.TOP2.lineWidth, 4.5);
        assert.strictEqual(BILLBOARD_BORDERS.TOP3.color, '#cd7f32');
        assert.strictEqual(BILLBOARD_BORDERS.TOP3.lineWidth, 3.5);
        assert.strictEqual(BILLBOARD_BORDERS.FAN.color, '#c77dff');
        assert.strictEqual(BILLBOARD_BORDERS.FAN.lineWidth, 3.5);
        assert.strictEqual(BILLBOARD_BORDERS.FOLLOW.color, '#d8b4fe');
        assert.strictEqual(BILLBOARD_BORDERS.FOLLOW.lineWidth, 1.8);

        assert.strictEqual(BILLBOARD_PILLS.TOP1.label, '👑 TOP 1');
        assert.strictEqual(BILLBOARD_PILLS.TOP2.label, '🥈 TOP 2');
        assert.strictEqual(BILLBOARD_PILLS.TOP3.label, '🥉 TOP 3');
        assert.strictEqual(BILLBOARD_PILLS.FAN.label, '💜 Fan');
      }
    },
    {
      name: 'test_billboard_level_number_only_and_data_attributes',
      fn: () => {
        // In Node.js environment without DOM, createBillboardSprite returns Object3D with userData
        const sprite = createBillboardSprite({
          tiktokLevel: 'Level 20',
          donateRank: 'TOP 1',
          isFan: true
        });
        assert.strictEqual(sprite.userData.level, 'Lv.20');
        assert.strictEqual(sprite.userData.donateRank, 'TOP 1');
        assert.strictEqual(sprite.userData.isFan, true);
      }
    },
    {
      name: 'test_event_normalizer_extracts_follower_and_fansclub_active',
      fn: () => {
        const raw = {
          user: {
            id: 'user_123',
            username: 'fan_girl',
            isFollower: true,
            fansClub: {
              clubName: 'SuperClub',
              level: 4,
              userFansClubStatus: 1
            }
          }
        };
        const evt = normalizeTikTokEvent('member', raw);
        assert.strictEqual(evt.user.isFollower, true);
        assert.strictEqual(evt.user.isFan, true);
        assert.strictEqual(evt.user.fanLevel, 4);
      }
    },
    {
      name: 'test_event_normalizer_super_fan_and_super_fan_join',
      fn: () => {
        const evt1 = normalizeTikTokEvent('superFan', {
          user: { id: 'u1', username: 'new_subscriber' }
        });
        assert.strictEqual(evt1.type, 'superFan');
        assert.strictEqual(evt1.user.isFan, true);
        assert.strictEqual(evt1.data.isNew, true);

        const evt2 = normalizeTikTokEvent('superFanJoin', {
          user: { id: 'u2', username: 'returning_fan' }
        });
        assert.strictEqual(evt2.type, 'superFanJoin');
        assert.strictEqual(evt2.user.isFan, true);
        assert.strictEqual(evt2.data.isNew, false);
      }
    },
    {
      name: 'test_handle_member_event_applies_fan_or_follower_status',
      fn: () => {
        let fanSet = false;
        let followerSet = false;
        const mockMesh = {
          userData: {
            controller: {
              userData: {},
              setFanStatus: (val) => { fanSet = val; },
              setFollowerStatus: (val) => { followerSet = val; }
            }
          }
        };
        const context = {
          avatarMeshes: new Map([['u1', mockMesh]])
        };

        handleLiveEvent({
          type: 'member',
          user: { id: 'u1', isFan: true }
        }, context);
        assert.strictEqual(fanSet, true);

        handleLiveEvent({
          type: 'member',
          user: { id: 'u1', isFan: false, isFollower: true }
        }, context);
        assert.strictEqual(followerSet, true);
      }
    },
    {
      name: 'test_handle_fan_event_sets_fan_and_bounces',
      fn: () => {
        let fanSet = false;
        let bounceTriggered = false;
        const mockMesh = {
          userData: {
            controller: {
              userData: {},
              setFanStatus: (val) => { fanSet = val; },
              triggerDonateAnimation: () => { bounceTriggered = true; }
            }
          }
        };
        const context = {
          avatarMeshes: new Map([['u2', mockMesh]])
        };

        handleLiveEvent({
          type: 'superFan',
          user: { id: 'u2' }
        }, context);

        assert.strictEqual(fanSet, true);
        assert.strictEqual(bounceTriggered, true);
      }
    },
    {
      name: 'test_handle_follow_event_sets_follower_if_not_fan',
      fn: () => {
        let followerSet = false;
        let heartCount = 0;
        const mockMesh = {
          position: { x: 0, y: 0, z: 0 },
          userData: {
            controller: {
              userData: { isFan: false },
              setFollowerStatus: (val) => { followerSet = val; }
            }
          }
        };
        const context = {
          avatarMeshes: new Map([['u3', mockMesh]]),
          clubEnvironment: {
            spawnHeartBubbles: (pos, count) => { heartCount = count; }
          }
        };

        handleLiveEvent({
          type: 'follow',
          user: { id: 'u3' }
        }, context);

        assert.strictEqual(followerSet, true);
        assert.strictEqual(heartCount, 4);
      }
    },
    {
      name: 'test_admin_commands_set_fan_and_follower',
      fn: () => {
        let fanVal = null;
        let followerVal = null;
        let synced = false;
        const mockMesh = {
          userData: {
            controller: {
              setFanStatus: (val) => { fanVal = val; },
              setFollowerStatus: (val) => { followerVal = val; }
            }
          }
        };
        const context = {
          avatarMeshes: new Map([['u4', mockMesh]]),
          syncActiveFloorAvatars: () => { synced = true; }
        };

        handleLiveEvent({
          type: 'admin_command',
          command: 'set_avatar_fan',
          userId: 'u4',
          isFan: true
        }, context);
        assert.strictEqual(fanVal, true);
        assert.strictEqual(synced, true);

        handleLiveEvent({
          type: 'admin_command',
          command: 'set_avatar_follower',
          userId: 'u4',
          isFollower: true
        }, context);
        assert.strictEqual(followerVal, true);
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
      results.cases.push({
        name: tc.name,
        status: 'FAIL',
        error: err.message,
        stack: err.stack
      });
    }
  }

  return results;
}

if (process.argv[1] && process.argv[1].endsWith('billboard-improvement.test.js')) {
  run().then((res) => {
    console.log(`[TEST] ${res.suite}: ${res.passed}/${res.total} passed`);
    if (res.failed > 0) {
      console.error(res.cases.filter((c) => c.status === 'FAIL'));
      process.exit(1);
    }
  });
}
