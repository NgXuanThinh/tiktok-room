// src/minigame-tally.js - Vote tallying, Micro-multiplier Tie-break, and Outcome Evaluation
import { MINIGAME_CONFIG, MINIGAME_AVAILABLE_COLORS } from './minigame-constants.js';

/**
 * Generates distinct micro-multiplier weights for each color in the round.
 * e.g., { green: 1.0042, red: 1.0075, blue: 1.0018 }
 * @param {object} range { min, max }
 * @returns {object}
 */
export function generateRoundTiebreakWeights(range = MINIGAME_CONFIG.tiebreakWeightRange) {
  const colorKeys = Object.keys(MINIGAME_AVAILABLE_COLORS);
  const weights = {};
  const used = new Set();

  for (const key of colorKeys) {
    let w;
    let attempts = 0;
    do {
      // 4 decimal digits precision to make collision mathematically negligible
      const raw = range.min + Math.random() * (range.max - range.min);
      w = Number(raw.toFixed(4));
      attempts++;
    } while (used.has(w) && attempts < 10);
    used.add(w);
    weights[key] = w;
  }
  return weights;
}

/**
 * Calculates vote counts, weighted scores, and determines the Death Color.
 * @param {Map<string, { userId: string, username: string, color: string }>} alivePlayers
 * @param {object} weights
 * @returns {object} { counts, scores, deathColor, totalAlive, percentages }
 */
export function calculateVoteScores(alivePlayers, weights) {
  const counts = { green: 0, red: 0, blue: 0 };
  const totalAlive = alivePlayers ? alivePlayers.size : 0;

  if (totalAlive > 0) {
    for (const player of alivePlayers.values()) {
      const col = player.color;
      if (counts[col] !== undefined) {
        counts[col]++;
      } else {
        // Fallback default color if undefined
        counts.green++;
      }
    }
  }

  const scores = {};
  let maxScore = -1;
  let deathColor = 'red';

  for (const key of Object.keys(MINIGAME_AVAILABLE_COLORS)) {
    const w = weights && weights[key] ? weights[key] : 1.0;
    const score = Number((counts[key] * w).toFixed(5));
    scores[key] = score;

    if (score > maxScore) {
      maxScore = score;
      deathColor = key;
    }
  }

  const percentages = {};
  for (const key of Object.keys(MINIGAME_AVAILABLE_COLORS)) {
    percentages[key] = totalAlive > 0 ? Math.round((counts[key] / totalAlive) * 100) : 0;
  }

  return {
    counts,
    scores,
    deathColor,
    totalAlive,
    percentages
  };
}

/**
 * Evaluates round outcome based on death color and edge-case rules.
 * @param {Map<string, { userId: string, username: string, color: string }>} alivePlayers
 * @param {string} deathColor
 * @returns {object} { type: 'NEXT_ROUND' | 'SOLO_WINNER' | 'CO_CHAMPIONS' | 'NO_WINNER', survivors, eliminated }
 */
export function evaluateRoundOutcome(alivePlayers, deathColor) {
  const totalAlive = alivePlayers ? alivePlayers.size : 0;
  if (totalAlive === 0) {
    return {
      type: 'NO_WINNER',
      survivors: [],
      eliminated: []
    };
  }

  // Check if ALL remaining players picked the exact same color
  const colorsUsed = new Set();
  for (const p of alivePlayers.values()) {
    colorsUsed.add(p.color || 'green');
  }

  // Edge case: All players selected the same 1 color
  if (colorsUsed.size === 1) {
    if (totalAlive === 2) {
      // 2 players remaining in finale both picked the same color -> CO_CHAMPIONS!
      return {
        type: 'CO_CHAMPIONS',
        survivors: Array.from(alivePlayers.values()),
        eliminated: []
      };
    }
    if (totalAlive > 2) {
      // >2 players all chose the same color -> ALL ELIMINATED! No winner.
      return {
        type: 'NO_WINNER',
        survivors: [],
        eliminated: Array.from(alivePlayers.values())
      };
    }
  }

  // Standard elimination based on deathColor
  const survivors = [];
  const eliminated = [];

  for (const p of alivePlayers.values()) {
    const col = p.color || 'green';
    if (col === deathColor) {
      eliminated.push(p);
    } else {
      survivors.push(p);
    }
  }

  if (survivors.length === 1) {
    return {
      type: 'SOLO_WINNER',
      survivors,
      eliminated
    };
  }

  if (survivors.length === 0) {
    return {
      type: 'NO_WINNER',
      survivors: [],
      eliminated
    };
  }

  return {
    type: 'NEXT_ROUND',
    survivors,
    eliminated
  };
}
