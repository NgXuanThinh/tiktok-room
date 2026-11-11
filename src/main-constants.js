// src/main-constants.js - Central configuration constants for the Main Stream application
/**
 * Main WebGL render loop timing, tempo, and speed constants.
 */
export const MAIN_RENDER_CONFIG = {
  // Maximum delta time clamped per frame to prevent simulation jumps on background tab throttling (seconds)
  MAX_DELTA_SECONDS: 0.1,
  // Default nightclub rhythm tempo in Beats Per Minute (BPM)
  DEFAULT_BPM: 128,
  // Kinematics animation speed multiplier when Frenzy party mode is active
  FRENZY_SPEED_MULTIPLIER: 1.8,
  // Standard kinematics animation speed multiplier
  NORMAL_SPEED_MULTIPLIER: 1.0,
  // Interval between idle avatar culling checks (seconds)
  CULLING_CHECK_INTERVAL_SECONDS: 5.0
};

/**
 * VIP Podium Scheduler and camera showcase parameters.
 */
export const MAIN_VIP_PODIUM_CONFIG = {
  // Duration in seconds that a celebrated VIP stays on the main podium
  DURATION_SECONDS: 15.0,
  // 3D coordinates of the center stage podium (X, Y, Z in meters)
  PODIUM_POSITION: { x: 0, y: 0.55, z: 0 },
  // Whether to preserve the donor's original floor position after podium cycle completes
  PRESERVE_DONOR_POSITION: true,
  // Duration in seconds for the VIP camera preset zoom during podium promotion
  CAMERA_SHOWCASE_DURATION_SECONDS: 5.0
};

/**
 * Floor capacity and occupancy management parameters.
 */
export const MAIN_OCCUPANCY_CONFIG = {
  // Maximum number of active dancer avatars allowed on the club floor
  MAX_CAPACITY: 100,
  // 90s idle timeout for authentic viewers
  IDLE_TIMEOUT_MS: 90000,
  // Auto-cull enabled after 90s inactivity
  DISABLE_AUTO_CULL: false
};

/**
 * Network endpoints and default socket parameters.
 */
export const MAIN_NETWORK_CONFIG = {
  // WebSocket endpoint path for the real-time event stream
  WS_ENDPOINT_PATH: '/ws',
  // Default number of likes dispatched for local test clicks
  DEFAULT_LOCAL_LIKE_COUNT: 1
};

/**
 * DOM Element identifiers used by the main application.
 */
export const MAIN_DOM_IDS = {
  CANVAS_CONTAINER: 'canvas-container'
};

/**
 * Custom browser event names for client-side communication.
 */
export const MAIN_EVENT_NAMES = {
  DELETE_AVATAR: 'app_delete_avatar',
  CLEAR_AVATARS: 'app_clear_avatars',
  LOCAL_LIKE: 'app_local_like',
  THRESHOLDS_UPDATED: 'app_thresholds_updated'
};

/**
 * Unified Main Stream Configuration Object.
 */
export const MAIN_STREAM_CONFIG = {
  render: MAIN_RENDER_CONFIG,
  vipPodium: MAIN_VIP_PODIUM_CONFIG,
  occupancy: MAIN_OCCUPANCY_CONFIG,
  network: MAIN_NETWORK_CONFIG,
  domIds: MAIN_DOM_IDS,
  events: MAIN_EVENT_NAMES
};
