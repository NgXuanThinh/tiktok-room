// src/cinematic-config.js - Centralized Configuration for Cinematic Showcase & Donate FX
export const CINEMATIC_CONFIG = {
  // 1. Camera Dynamic Framing Formula Parameters (Perspective Projection)
  camera: {
    fov: 56,                     // Field of view in degrees
    screenOccupancy: 0.38,       // Desired vertical framing ratio of character (38% screen height)
    pitchAngleDeg: 20,           // Elevation angle above horizon (degrees)
    approachAngleOffset: 0.0,    // Azimuthal angle offset facing the slime
    minDistance: 3.5,            // Absolute minimum distance clamp (meters)
    maxDistance: 8.0             // Absolute maximum distance clamp (meters)
  },

  // 2. High Tier Lighting (500 - 5.000 coins: Galaxy, Private Jet, etc.)
  lightingHigh: {
    spotlightCount: 6,           // Number of focused moving head spotlights
    spotlightIntensity: 2.8,     // Softened intensity (reduced from 8.0 to prevent burnout)
    spotColor: 0xffffff,         // Crisp white spotlight color
    coneOpacity: 0.08,           // Transparent light cone opacity (reduced from 0.16)
    beamOpacity: 0.28,           // Overhead white cylinder beam opacity (softened from 0.35+)
    beamRadiusTop: 1.2,
    beamRadiusBottom: 2.2,
    beamHeight: 16
  },

  // 3. Ultra Tier Lighting (>= 6.000 coins: Lion, Pegasus, TikTok Universe)
  lightingUltra: {
    spotlightCount: 8,           // 8 moving heads converging simultaneously
    spotlightIntensity: 2.2,     // Balanced gentle intensity for 8 overlapping spots
    spotColor: 0xffd700,         // Royal gold spotlight color
    coneOpacity: 0.06,           // Sheer translucent light cone
    beamOpacity: 0.12,           // Holographic golden beam opacity (soft translucent)
    beamRadiusTop: 1.2,
    beamRadiusBottom: 2.5,
    beamHeight: 16
  },

  // 4. Relative Coin Physics & Geometry Parameters
  coinDynamics: {
    dropClearanceRatio: 2.8,     // Drop height = Slime Apex + 2.8 * Slime Height
    coinRadiusRatio: 0.42,       // Coin radius = 42% of Slime horizontal radius
    coinThicknessRatio: 0.20,    // Thickness = 20% of Coin radius
    gravity: 12.0,               // Physics gravity (m/s²)
    floorBounceFactor: 0.45,     // Floor bounce restitution coefficient
    initialDropVy: -1.2,         // Initial downward velocity
    staggerDelayCascade: 0.20,   // Delay between cascading coins (seconds)
    burstSpreadDuration: 0.80    // Burst radial spread duration (seconds)
  },

  // 5. Overlay Backdrop
  backdrop: {
    blurPx: 1.5,                 // Soft frosted glass blur (reduced from 8px so Slime 3D is visible)
    centerOpacity: 0.18,         // Center transparency (clear view of 3D Slime)
    edgeOpacity: 0.65            // Edge vignette opacity
  },

  // 6. Audio Beat Smoothing
  audioBounce: {
    fluxDivisor: 80.0,           // Divisor to normalize raw 0-255 spectrum flux into [0, 1.0]
    smoothingFactor: 0.85,       // Exponential lerp smoothing factor
    maxBounceMeters: 0.08        // Maximum vertical bounce displacement (8cm)
  }
};
