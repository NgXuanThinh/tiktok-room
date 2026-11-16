// src/minigame-manager.js - Central Coordinator & State Machine for Slime Survival Minigame
import {
  MINIGAME_STATES,
  MINIGAME_CONFIG,
  MINIGAME_AVAILABLE_COLORS,
  MINIGAME_SOCKET_EVENTS
} from './minigame-constants.js';
import {
  generateRoundTiebreakWeights,
  calculateVoteScores,
  evaluateRoundOutcome
} from './minigame-tally.js';
import {
  syncRoomNeonDeathColor,
  restoreRoomLighting,
  triggerLaserStrikes,
  applyGhostState,
  revertGhostState
} from './minigame-fx.js';
import {
  initMinigameUI,
  updateCornerTiebreakBadge,
  showStartCountdownBanner,
  showVotingBanner,
  showMinimalTallyBanner,
  showJudgmentBanner,
  showWinnerBanner,
  showNoWinnerBanner,
  showWarningBanner,
  hideMinigameBanner
} from './minigame-ui.js';
import {
  pauseDonationQueue,
  resumeDonationQueue,
  waitForDonationCompletion
} from './donation-queue.js';
import { parseColorCommand, setSlimeColor } from './avatar-manager.js';

export class MinigameManager {
  constructor() {
    this.state = MINIGAME_STATES.IDLE;
    this.roundNumber = 0;
    this.roundDurationSec = MINIGAME_CONFIG.defaultRoundDurationSec;
    this.startCountdownSec = MINIGAME_CONFIG.defaultStartCountdownSec;
    this.roundStartTime = null;
    this.roundWeights = null;

    // activePlayers: Map<userId, { userId, username, color, mesh }>
    this.activePlayers = new Map();
    // ghostPlayers: Set<userId>
    this.ghostPlayers = new Set();

    this.timerInterval = null;
    this.isCountdownFrozen = false;
    this.remainingVotingMs = 0;
    this.lastTickMs = 0;
    this.context = {};
    this.isGameActive = false;
  }

  /**
   * Initializes the manager with runtime context references.
   * @param {object} context { scene, sceneManager, clubEnvironment, avatarMeshes, ws, audioSystem }
   */
  init(context = {}) {
    this.context = context;
    initMinigameUI();
  }

  /**
   * Resolves active floor meshes from context (supports Map & Array).
   * @returns {Array<THREE.Group>}
   */
  _getFloorMeshes() {
    const raw = this.context.avatarMeshes;
    if (raw instanceof Map) {
      return Array.from(raw.values());
    }
    if (Array.isArray(raw)) {
      return raw;
    }
    return [];
  }

  /**
   * Schedules a new minigame with start countdown.
   * @param {number} countdownSec
   * @param {number} roundDurationSec
   */
  startScheduledGame(countdownSec = MINIGAME_CONFIG.defaultStartCountdownSec, roundDurationSec = this.roundDurationSec) {
    const floorMeshes = this._getFloorMeshes();
    if (floorMeshes.length < MINIGAME_CONFIG.minPlayersToStart) {
      showWarningBanner(`⚠️ Cần ít nhất ${MINIGAME_CONFIG.minPlayersToStart} Slime trên sàn để bắt đầu Minigame!`);
      this._broadcastState({ error: 'not_enough_players' });
      return;
    }

    this.stopMinigame(false);
    this.roundDurationSec = roundDurationSec;
    this.startCountdownSec = countdownSec;
    this.state = MINIGAME_STATES.COUNTDOWN_START;
    this.isGameActive = true;

    // Revive all existing ghosts in room so all room occupants start fresh
    this.reviveAllGhosts();

    let remaining = this.startCountdownSec;
    showStartCountdownBanner(remaining);
    this._broadcastState();

    this.timerInterval = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        this.startRound(1);
      } else {
        showStartCountdownBanner(remaining);
      }
    }, 1000);
  }

  /**
   * Starts Round 1 immediately.
   * @param {number} roundDurationSec
   */
  startGameImmediate(roundDurationSec = this.roundDurationSec) {
    const floorMeshes = this._getFloorMeshes();
    if (floorMeshes.length < MINIGAME_CONFIG.minPlayersToStart) {
      showWarningBanner(`⚠️ Cần ít nhất ${MINIGAME_CONFIG.minPlayersToStart} Slime trên sàn để bắt đầu Minigame!`);
      this._broadcastState({ error: 'not_enough_players' });
      return;
    }

    this.stopMinigame(false);
    this.roundDurationSec = roundDurationSec;
    this.isGameActive = true;
    this.reviveAllGhosts();
    this.startRound(1);
  }

  /**
   * Starts a specific round.
   * @param {number} roundNum
   */
  startRound(roundNum) {
    if (!this.isGameActive) return;

    this.roundNumber = roundNum;
    this.state = MINIGAME_STATES.ROUND_VOTING;
    this.roundStartTime = Date.now();

    // Populate activePlayers from floor avatars if Round 1
    if (roundNum === 1) {
      this.populateActivePlayersFromFloor();
    }

    // Safety check: if no active players remained
    if (this.activePlayers.size === 0) {
      this.stopMinigame(false);
      return;
    }

    // Generate distinct tiebreak weights for this round and show corner badge
    this.roundWeights = generateRoundTiebreakWeights();
    updateCornerTiebreakBadge(this.roundWeights, true);

    this.remainingVotingMs = this.roundDurationSec * 1000;
    this.lastTickMs = Date.now();
    this.isCountdownFrozen = false;

    let remaining = this.roundDurationSec;
    showVotingBanner(this.roundNumber, remaining, this.roundDurationSec);
    this._broadcastState();

    if (this.timerInterval) clearInterval(this.timerInterval);
    const tickIntervalMs = 250;

    this.timerInterval = setInterval(() => {
      const now = Date.now();
      const delta = now - this.lastTickMs;
      this.lastTickMs = now;

      if (!this.isCountdownFrozen) {
        this.remainingVotingMs = Math.max(0, this.remainingVotingMs - delta);
      }

      const remSec = this.remainingVotingMs / 1000;

      if (remSec <= 0) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        this.onVotingEnded();
      } else {
        showVotingBanner(this.roundNumber, remSec, this.roundDurationSec);
      }
    }, tickIntervalMs);
  }

  /**
   * Freezes round voting countdown timer during VIP Showcase effects.
   */
  freezeCountdown() {
    this.isCountdownFrozen = true;
    console.log(`[MinigameManager] Round ${this.roundNumber} timer FROZEN for VIP Showcase`);
  }

  /**
   * Unfreezes round voting countdown timer after VIP Showcase concludes.
   */
  unfreezeCountdown() {
    this.isCountdownFrozen = false;
    this.lastTickMs = Date.now();
    console.log(`[MinigameManager] Round ${this.roundNumber} timer RESUMED`);
  }

  /**
   * Populates active players from currently active floor meshes (supports Map & Array).
   */
  populateActivePlayersFromFloor() {
    this.activePlayers.clear();
    const meshes = this._getFloorMeshes();

    for (const mesh of meshes) {
      if (!mesh || !mesh.userData) continue;
      const uId = String(mesh.userData.userId || mesh.userData.id || '');
      if (!uId || this.ghostPlayers.has(uId)) continue;

      let col = mesh.userData.colorKey || mesh.userData.color || 'green';
      if (!MINIGAME_AVAILABLE_COLORS[col]) col = 'green';

      this.activePlayers.set(uId, {
        userId: uId,
        username: mesh.userData.username || mesh.userData.nickname || 'Viewer',
        color: col,
        mesh
      });
    }
  }

  /**
   * Triggered when voting duration expires.
   */
  onVotingEnded() {
    if (!this.isGameActive) return;

    this.state = MINIGAME_STATES.TALLY_REVEAL;

    // Calculate vote tallies & Death Color
    const tally = calculateVoteScores(this.activePlayers, this.roundWeights);

    // Show minimal tally banner: "Round 1:   8 🔴 ☠️  |  5 🟢  |  3 🔵"
    showMinimalTallyBanner(this.roundNumber, tally.counts, tally.deathColor);
    this._broadcastState({ tally });

    // Audio SFX cue if available
    if (this.context.audioSystem?.playSfx) {
      try { this.context.audioSystem.playSfx('bass_boom'); } catch (e) {}
    }

    // Wait tallyRevealDurationMs (2.5s) so players digest the outcome before laser/judgment
    setTimeout(() => {
      if (this.isGameActive && this.state === MINIGAME_STATES.TALLY_REVEAL) {
        this.executeJudgment(tally.deathColor);
      }
    }, MINIGAME_CONFIG.tallyRevealDurationMs);
  }

  /**
   * Coordinates judgment execution with priority donation queue handling.
   * @param {string} deathColor
   */
  async executeJudgment(deathColor) {
    if (!this.isGameActive) return;

    this.state = MINIGAME_STATES.WAITING_DONATION;

    // 1. Wait for any currently ongoing donation celebration to cleanly conclude
    await waitForDonationCompletion();

    if (!this.isGameActive) return;

    // 2. High priority lock: Pause donation queue so no new donations interrupt judgment
    pauseDonationQueue();
    this.state = MINIGAME_STATES.JUDGMENT;

    // 3. Evaluate Round Outcome BEFORE deleting eliminated players from activePlayers!
    const outcome = evaluateRoundOutcome(this.activePlayers, deathColor);
    const eliminatedPlayers = outcome.eliminated || [];
    const targetMeshes = eliminatedPlayers.map((p) => p.mesh).filter(Boolean);

    // 4. Update Banner & Neon lights & All 8 Moving Heads to Death Color
    showJudgmentBanner(deathColor);
    const colorObj = MINIGAME_AVAILABLE_COLORS[deathColor] || MINIGAME_AVAILABLE_COLORS.red;
    const targetPos = targetMeshes.length > 0 ? targetMeshes[0].position : null;
    syncRoomNeonDeathColor(
      this.context.clubEnvironment,
      colorObj.threeColor,
      MINIGAME_CONFIG.judgmentDurationMs / 1000,
      targetPos
    );

    // 5. Fire vertical laser strikes from ceiling
    if (targetMeshes.length > 0) {
      await triggerLaserStrikes(
        this.context.scene,
        targetMeshes,
        colorObj.threeColor,
        MINIGAME_CONFIG.laserStrikeDurationMs,
        this.context.sceneManager
      );
    } else {
      // In co-champions or no-elimination, hold judgment view briefly
      await new Promise((r) => setTimeout(r, 1500));
    }

    // 6. Transform eliminated slimes into Ghost state & update registries
    for (const p of eliminatedPlayers) {
      this.ghostPlayers.add(p.userId);
      this.activePlayers.delete(p.userId);
      if (p.mesh) {
        applyGhostState(p.mesh);
      }
    }

    // 7. Restore room neon lighting and resume donation queue
    restoreRoomLighting(this.context.clubEnvironment);
    resumeDonationQueue();

    // 8. Process Outcome (Advance to Next Round or Celebrate Winners)
    this._handleOutcome(outcome);
  }

  /**
   * Processes the outcome of the round.
   * @param {object} outcome
   */
  _handleOutcome(outcome) {
    if (!this.isGameActive) return;

    if (outcome.type === 'SOLO_WINNER') {
      this.state = MINIGAME_STATES.WINNER_CELEBRATION;
      showWinnerBanner(outcome.survivors, false);
      this._broadcastState({ outcome });

      setTimeout(() => {
        this.stopMinigame(false);
      }, MINIGAME_CONFIG.winnerCelebrationDurationMs);

    } else if (outcome.type === 'CO_CHAMPIONS') {
      this.state = MINIGAME_STATES.WINNER_CELEBRATION;
      showWinnerBanner(outcome.survivors, true);
      this._broadcastState({ outcome });

      setTimeout(() => {
        this.stopMinigame(false);
      }, MINIGAME_CONFIG.winnerCelebrationDurationMs);

    } else if (outcome.type === 'NO_WINNER') {
      this.state = MINIGAME_STATES.WINNER_CELEBRATION;
      showNoWinnerBanner();
      this._broadcastState({ outcome });

      setTimeout(() => {
        this.stopMinigame(false);
      }, MINIGAME_CONFIG.noWinnerDelayMs);

    } else {
      // NEXT_ROUND: Wait 2.0s then advance to next round
      setTimeout(() => {
        if (this.isGameActive) {
          this.startRound(this.roundNumber + 1);
        }
      }, 2000);
    }
  }

  /**
   * Handles incoming chat command from livestream viewer.
   * @param {string} userId
   * @param {string} username
   * @param {string} comment
   */
  handleChatCommand(userId, username, comment) {
    if (!this.isGameActive) return false;
    const uId = String(userId);

    // Ghosts cannot change color during minigame
    if (this.ghostPlayers.has(uId)) {
      return false;
    }

    // Only allow voting during ROUND_VOTING state
    if (this.state !== MINIGAME_STATES.ROUND_VOTING) {
      return false;
    }

    const parsed = parseColorCommand(comment);
    if (!parsed || !parsed.name || !MINIGAME_AVAILABLE_COLORS[parsed.name]) {
      return false;
    }

    const targetColor = parsed.name;
    let player = this.activePlayers.get(uId);

    if (!player) {
      // Find mesh from floor (supports Map & Array)
      const raw = this.context.avatarMeshes;
      let mesh = null;
      if (raw instanceof Map) {
        mesh = raw.get(uId);
      } else if (Array.isArray(raw)) {
        mesh = raw.find((m) => String(m.userData?.userId || m.userData?.id) === uId);
      }

      if (mesh) {
        player = { userId: uId, username: username || mesh.userData.username, color: targetColor, mesh };
        this.activePlayers.set(uId, player);
      }
    }

    if (player) {
      player.color = targetColor;
      if (player.mesh) {
        setSlimeColor(player.mesh, targetColor);
      }
      this._broadcastLiveStats();
      return true;
    }

    return false;
  }

  /**
   * Handles newly joined viewer avatar entering the room.
   * Late joiner rule: If game is in Round 2+, or post Round 1 voting, spawn as Ghost!
   * @param {string} userId
   * @param {string} username
   * @param {THREE.Object3D} mesh
   */
  handleNewAvatarSpawn(userId, username, mesh) {
    if (!this.isGameActive) return;
    const uId = String(userId);

    const isLateJoiner = this.roundNumber >= 2 || (this.roundNumber === 1 && this.state !== MINIGAME_STATES.ROUND_VOTING);

    if (isLateJoiner) {
      this.ghostPlayers.add(uId);
      if (mesh) {
        applyGhostState(mesh);
      }
    } else {
      // Can participate in Round 1
      const col = mesh?.userData?.colorKey || 'green';
      this.activePlayers.set(uId, {
        userId: uId,
        username: username || 'Viewer',
        color: MINIGAME_AVAILABLE_COLORS[col] ? col : 'green',
        mesh
      });
    }
  }

  /**
   * Stops or resets the minigame.
   * @param {boolean} keepGhostUntilNextGame
   */
  stopMinigame(keepGhostUntilNextGame = false) {
    this.isGameActive = false;
    this.state = MINIGAME_STATES.IDLE;
    this.roundNumber = 0;
    this.roundWeights = null;

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    restoreRoomLighting(this.context.clubEnvironment);
    resumeDonationQueue();
    updateCornerTiebreakBadge(null, false);
    hideMinigameBanner();

    if (!keepGhostUntilNextGame) {
      this.reviveAllGhosts();
    }

    this._broadcastState();
  }

  /**
   * Revives all ghosts on floor back to live slimes.
   */
  reviveAllGhosts() {
    this.ghostPlayers.clear();
    const meshes = this._getFloorMeshes();
    for (const mesh of meshes) {
      if (mesh) {
        revertGhostState(mesh);
      }
    }
  }

  /**
   * Handles action packets received from Admin Cockpit (Port 3001).
   * @param {string} action
   * @param {object} payload
   */
  handleAdminAction(action, payload = {}) {
    if (action === 'start') {
      const countdown = payload.countdown !== undefined ? Number(payload.countdown) : 0;
      const duration = payload.duration !== undefined ? Number(payload.duration) : this.roundDurationSec;
      if (countdown > 0) {
        this.startScheduledGame(countdown, duration);
      } else {
        this.startGameImmediate(duration);
      }
    } else if (action === 'stop') {
      this.stopMinigame(false);
    } else if (action === 'force_judgment') {
      if (this.state === MINIGAME_STATES.ROUND_VOTING) {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = null;
        this.onVotingEnded();
      }
    } else if (action === 'revive_ghosts') {
      this.reviveAllGhosts();
    } else if (action === 'set_config') {
      if (payload.roundDurationSec) this.roundDurationSec = Number(payload.roundDurationSec);
      if (payload.startCountdownSec) this.startCountdownSec = Number(payload.startCountdownSec);
      this._broadcastState();
    }
  }

  /**
   * Broadcasts live stats during voting.
   */
  _broadcastLiveStats() {
    const tally = calculateVoteScores(this.activePlayers, this.roundWeights);
    this._broadcastState({ tally });
  }

  /**
   * Broadcasts state sync to server & admin cockpit.
   */
  _broadcastState(extra = {}) {
    const ws = this.context.ws;
    if (!ws || ws.readyState !== 1) return;

    const payload = {
      type: MINIGAME_SOCKET_EVENTS.STATE_SYNC,
      state: this.state,
      roundNumber: this.roundNumber,
      isGameActive: this.isGameActive,
      roundDurationSec: this.roundDurationSec,
      activeCount: this.activePlayers.size,
      ghostCount: this.ghostPlayers.size,
      weights: this.roundWeights,
      ...extra
    };

    try {
      ws.send(JSON.stringify(payload));
    } catch (e) {}
  }
}

// Global Singleton instance
export const minigameManager = new MinigameManager();
