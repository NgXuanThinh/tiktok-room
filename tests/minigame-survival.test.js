// tests/minigame-survival.test.js - Comprehensive Unit & Integration Tests for Minigame Slime Survival
import {
  MINIGAME_STATES,
  MINIGAME_CONFIG,
  MINIGAME_AVAILABLE_COLORS,
  GHOST_MATERIAL_CONFIG
} from '../src/minigame-constants.js';
import {
  generateRoundTiebreakWeights,
  calculateVoteScores,
  evaluateRoundOutcome
} from '../src/minigame-tally.js';
import {
  applyGhostState,
  revertGhostState,
  syncRoomNeonDeathColor,
  restoreRoomLighting
} from '../src/minigame-fx.js';
import {
  pauseDonationQueue,
  resumeDonationQueue,
  isDonationQueuePaused
} from '../src/donation-queue.js';
import { SLIME_COLORS } from '../src/avatar-manager.js';
import { MinigameManager } from '../src/minigame-manager.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('Testing Minigame Slime Survival Core Mechanics...');

// 1. Color Palette Consistency
assert(MINIGAME_AVAILABLE_COLORS.green.hex === SLIME_COLORS.green.hex, 'Green hex matches SLIME_COLORS.green');
assert(MINIGAME_AVAILABLE_COLORS.red.hex === SLIME_COLORS.red.hex, 'Red hex matches SLIME_COLORS.red');
assert(MINIGAME_AVAILABLE_COLORS.blue.hex === SLIME_COLORS.blue.hex, 'Blue hex matches SLIME_COLORS.blue');
assert(MINIGAME_AVAILABLE_COLORS.red.threeColor === 0xff2a6d, 'Red threeColor is 0xff2a6d');

// 2. Micro-multiplier weights
const weights = generateRoundTiebreakWeights();
assert(weights.green >= 1.001 && weights.green <= 1.009, 'Green weight is within [1.001, 1.009]');
assert(weights.red >= 1.001 && weights.red <= 1.009, 'Red weight is within [1.001, 1.009]');
assert(weights.blue >= 1.001 && weights.blue <= 1.009, 'Blue weight is within [1.001, 1.009]');

// 3. Clear majority elimination
const playersMajority = new Map([
  ['p1', { userId: 'p1', color: 'red' }],
  ['p2', { userId: 'p2', color: 'red' }],
  ['p3', { userId: 'p3', color: 'red' }],
  ['p4', { userId: 'p4', color: 'green' }],
  ['p5', { userId: 'p5', color: 'blue' }]
]);
const tallyMajority = calculateVoteScores(playersMajority, weights);
assert(tallyMajority.deathColor === 'red', 'Majority color (red: 3) correctly identified as death color');
const outcomeMajority = evaluateRoundOutcome(playersMajority, tallyMajority.deathColor);
assert(outcomeMajority.type === 'NEXT_ROUND', 'Outcome with 2 survivors is NEXT_ROUND');
assert(outcomeMajority.survivors.length === 2, '2 survivors remain');
assert(outcomeMajority.eliminated.length === 3, '3 players eliminated');

// 4. Tie-break resolution
const fixedWeights = { green: 1.008, red: 1.002, blue: 1.001 };
const playersTie = new Map([
  ['p1', { userId: 'p1', color: 'green' }],
  ['p2', { userId: 'p2', color: 'green' }],
  ['p3', { userId: 'p3', color: 'red' }],
  ['p4', { userId: 'p4', color: 'red' }]
]);
const tallyTie = calculateVoteScores(playersTie, fixedWeights);
// 2 * 1.008 = 2.016 > 2 * 1.002 = 2.004
assert(tallyTie.deathColor === 'green', 'Tie is cleanly broken by micro-multiplier (green wins tie-break)');

// 5. Special condition: >2 players all pick SAME color
const playersAll3Same = new Map([
  ['p1', { userId: 'p1', color: 'blue' }],
  ['p2', { userId: 'p2', color: 'blue' }],
  ['p3', { userId: 'p3', color: 'blue' }]
]);
const tallyAll3 = calculateVoteScores(playersAll3Same, fixedWeights);
const outcomeAll3 = evaluateRoundOutcome(playersAll3Same, tallyAll3.deathColor);
assert(outcomeAll3.type === 'NO_WINNER', '>2 players choosing same color results in NO_WINNER (all eliminated)');
assert(outcomeAll3.eliminated.length === 3, 'All 3 players are eliminated');

// 6. Special condition: exactly 2 players pick SAME color (Finale Co-champions)
const playersFinaleSame = new Map([
  ['p1', { userId: 'p1', color: 'red' }],
  ['p2', { userId: 'p2', color: 'red' }]
]);
const tallyFinaleSame = calculateVoteScores(playersFinaleSame, fixedWeights);
const outcomeFinaleSame = evaluateRoundOutcome(playersFinaleSame, tallyFinaleSame.deathColor);
assert(outcomeFinaleSame.type === 'CO_CHAMPIONS', 'Exactly 2 players in finale choosing same color are CO_CHAMPIONS');
assert(outcomeFinaleSame.survivors.length === 2, 'Both survivors are champions');

// 7. Special condition: Solo winner
const playersFinaleDiff = new Map([
  ['p1', { userId: 'p1', color: 'red' }],
  ['p2', { userId: 'p2', color: 'green' }]
]);
const outcomeSolo = evaluateRoundOutcome(playersFinaleDiff, 'red');
assert(outcomeSolo.type === 'SOLO_WINNER', 'Finale with different colors produces SOLO_WINNER');
assert(outcomeSolo.survivors[0].userId === 'p2', 'Surviving user p2 is solo winner');

// 8. Ghost State Transformation Mock
const mockOrigMaterial = { color: { getHex: () => 0x00ff66 }, emissive: { getHex: () => 0x00ff66 } };
const mockBodyMesh = { isMesh: true, name: 'slime_body', material: mockOrigMaterial };
const mockSprite = { isSprite: true, material: { opacity: 1.0 }, userData: {} };
const mockMeshGroup = {
  name: 'CyberSlime',
  userData: { isGhost: false, slimeMat: mockOrigMaterial },
  traverse(cb) {
    cb(mockBodyMesh);
    cb(mockSprite);
  }
};

applyGhostState(mockMeshGroup);
assert(mockMeshGroup.userData.isGhost === true, 'applyGhostState marks isGhost = true');
assert(mockBodyMesh.material.transparent === true, 'Ghost material is transparent');
assert(mockBodyMesh.material.opacity === GHOST_MATERIAL_CONFIG.opacity, 'Ghost material has configured opacity (0.35)');
assert(mockSprite.material.opacity === GHOST_MATERIAL_CONFIG.billboardOpacity, 'Overhead billboard dimmed for ghost');

revertGhostState(mockMeshGroup);
assert(mockMeshGroup.userData.isGhost === false, 'revertGhostState marks isGhost = false');
assert(mockBodyMesh.material === mockOrigMaterial, 'Original material successfully restored');
assert(mockSprite.material.opacity === 1.0, 'Billboard opacity restored to 1.0');

// 9. Priority Donation Queue Coordination
pauseDonationQueue();
assert(isDonationQueuePaused() === true, 'pauseDonationQueue pauses donation queue');
resumeDonationQueue();
assert(isDonationQueuePaused() === false, 'resumeDonationQueue resumes donation queue');

// 10. Map Support in MinigameManager.populateActivePlayersFromFloor
const mgr = new MinigameManager();
const floorMap = new Map();
floorMap.set('user_1', { userData: { userId: 'user_1', username: 'Slime 1', colorKey: 'red' } });
floorMap.set('user_2', { userData: { userId: 'user_2', username: 'Slime 2', colorKey: 'green' } });
floorMap.set('user_3', { userData: { userId: 'user_3', username: 'Slime 3', colorKey: 'blue' } });

mgr.context = { avatarMeshes: floorMap };
mgr.populateActivePlayersFromFloor();
assert(mgr.activePlayers.size === 3, 'Map avatarMeshes correctly populates 3 active players');
assert(mgr.activePlayers.get('user_1').color === 'red', 'user_1 color is red');
assert(mgr.activePlayers.get('user_2').color === 'green', 'user_2 color is green');
assert(mgr.activePlayers.get('user_3').color === 'blue', 'user_3 color is blue');

// 11. Minimum Players Guard Condition (< 2 players)
const smallMap = new Map();
smallMap.set('user_solo', { userData: { userId: 'user_solo', username: 'Solo' } });
mgr.context = { avatarMeshes: smallMap };
mgr.startGameImmediate();
assert(mgr.isGameActive === false, 'Starting game with < 2 players is blocked');

// 12. Moving Heads & Neon Sync: Moving heads stay unfocused so sweeping trajectory continues in Death Color
const mockSpot = { color: { setHex: (hex) => { mockSpot._hex = hex; }, getHex: () => mockSpot._hex || 0 }, intensity: 5 };
const mockCone = { material: { color: { setHex: (hex) => { mockCone._hex = hex; }, getHex: () => mockCone._hex || 0 }, opacity: 0.28 } };
const mockClubEnv = {
  neonBar: { material: { color: { setHex: (h) => { mockClubEnv._neonColor = h; }, getHex: () => 0xff007f }, emissive: { setHex: (h) => { mockClubEnv._neonEmissive = h; }, getHex: () => 0xff007f }, emissiveIntensity: 2.8 } },
  movingHeads: [{ spot: mockSpot, cone: mockCone, baseCol: { copy: () => {} }, isFocused: false, focusTimer: 0 }],
  laserBeams: [{ mesh: { material: { color: { setHex: (h) => { mockClubEnv._laserColor = h; }, getHex: () => 0x00f2fe }, opacity: 0.6 } } }]
};

syncRoomNeonDeathColor(mockClubEnv, 0xff2a6d, 3.5);
assert(mockClubEnv.movingHeads[0].isFocused === false, 'Moving heads keep isFocused = false (continuous sweeping trajectory)');
assert(mockSpot._hex === 0xff2a6d, 'Spotlight color set to Death Color (0xff2a6d)');
assert(mockCone._hex === 0xff2a6d, 'Cone material color set to Death Color (0xff2a6d)');
assert(mockCone.material.opacity === 0.52, 'Cone material opacity boosted for visibility');
assert(mockClubEnv._laserColor === 0xff2a6d, 'Ceiling lasers set to Death Color');

restoreRoomLighting(mockClubEnv);
assert(mockClubEnv.movingHeads[0].isFocused === false, 'Moving heads isFocused restored to false');

// 13. Automatic Ghost Revival when Game Ends
const ghostSlimeMesh = {
  name: 'GhostSlime',
  userData: { isGhost: true, _origSlimeMat: mockOrigMaterial, _ghostMat: { dispose: () => {} } },
  traverse(cb) {
    cb({ isMesh: true, name: 'slime_body', material: {} });
    cb({ isSprite: true, material: { opacity: 0.2 }, userData: { _origOpacity: 1.0 } });
  }
};
const revivalMap = new Map([['ghost_1', ghostSlimeMesh]]);
mgr.context = { avatarMeshes: revivalMap, clubEnvironment: mockClubEnv };
mgr.ghostPlayers.add('ghost_1');
assert(mgr.ghostPlayers.size === 1, 'Ghost player is registered');
mgr.stopMinigame(false);
assert(mgr.ghostPlayers.size === 0, 'stopMinigame clears ghostPlayers registry');
assert(ghostSlimeMesh.userData.isGhost === false, 'stopMinigame automatically revives ghost slimes to normal');

console.log(`\n[${failed === 0 ? 'PASS' : 'FAIL'}] minigame-survival: ${passed}/${passed + failed} passed`);
if (failed > 0) process.exit(1);
