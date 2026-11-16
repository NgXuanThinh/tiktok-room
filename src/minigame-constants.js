// src/minigame-constants.js - Dedicated constants and configuration for Slime Survival Minigame
import { SLIME_COLORS } from './avatar-manager.js';

export const MINIGAME_STATES = Object.freeze({
  IDLE: 'IDLE',
  COUNTDOWN_START: 'COUNTDOWN_START',
  ROUND_VOTING: 'ROUND_VOTING',
  TALLY_REVEAL: 'TALLY_REVEAL',
  WAITING_DONATION: 'WAITING_DONATION',
  JUDGMENT: 'JUDGMENT',
  WINNER_CELEBRATION: 'WINNER_CELEBRATION'
});

export const MINIGAME_CONFIG = Object.freeze({
  defaultRoundDurationSec: 20,
  defaultStartCountdownSec: 60,
  tallyRevealDurationMs: 2500,
  judgmentDurationMs: 3500,
  laserStrikeDurationMs: 2800,
  winnerCelebrationDurationMs: 8000,
  noWinnerDelayMs: 4000,
  minPlayersToStart: 2,
  tiebreakWeightRange: { min: 1.001, max: 1.009 }
});

// Re-export SLIME_COLORS with emoji & display metadata to ensure 100% color consistency
export const MINIGAME_AVAILABLE_COLORS = Object.freeze({
  green: Object.freeze({
    ...SLIME_COLORS.green,
    emoji: '🟢',
    displayName: 'Xanh Lá'
  }),
  red: Object.freeze({
    ...SLIME_COLORS.red,
    emoji: '🔴',
    displayName: 'Đỏ'
  }),
  blue: Object.freeze({
    ...SLIME_COLORS.blue,
    emoji: '🔵',
    displayName: 'Xanh Dương'
  })
});

export const GHOST_MATERIAL_CONFIG = Object.freeze({
  color: 0xffffff,
  emissive: 0xffffff,
  emissiveIntensity: 0.45,
  transparent: true,
  opacity: 0.35,
  roughness: 0.15,
  metalness: 0.1,
  billboardOpacity: 0.4
});

export const LASER_CONFIG = Object.freeze({
  topRadius: 0.12,
  bottomRadius: 0.55,
  height: 18,
  ceilingY: 14,
  radialSegments: 16,
  cameraShakeIntensity: 0.18,
  cameraShakeDuration: 0.45
});

export const MINIGAME_SOCKET_EVENTS = Object.freeze({
  ACTION: 'minigame_action',
  STATE_SYNC: 'minigame_state_sync',
  ROUND_START: 'minigame_round_start',
  JUDGMENT_START: 'minigame_judgment_start',
  GAME_OVER: 'minigame_game_over'
});
