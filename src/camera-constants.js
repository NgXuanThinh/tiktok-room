// src/camera-constants.js - Central configuration constants for WebGL Camera Presets, Orbit & Tracking
import * as THREE from 'three';

/**
 * Standard fixed camera angles for the live stream.
 */
export const CAMERA_PRESETS = {
  orbit: {
    name: 'Cinematic Orbit',
    pos: new THREE.Vector3(0, 5.0, 10.0),
    target: new THREE.Vector3(0, 1.4, 0),
    fov: 68,
    isOrbit: true
  },
  dj: {
    name: 'DJ Front View',
    pos: new THREE.Vector3(0, 2.2, 5),
    target: new THREE.Vector3(0, 1.8, -4),
    fov: 45,
    isOrbit: false
  },
  top: {
    name: 'Top-Down Dance Floor',
    pos: new THREE.Vector3(0, 16, 0.1),
    target: new THREE.Vector3(0, 0, 0),
    fov: 60,
    isOrbit: false
  },
  vip: {
    name: 'VIP Lounge Zoom',
    pos: new THREE.Vector3(-3.0, 5.0, 1.5),
    target: new THREE.Vector3(-4.8, 0.9, -9.2),
    fov: 68,
    isOrbit: false
  },
  cinematicVip: {
    name: 'Cinematic VIP Low-Angle',
    pos: new THREE.Vector3(0, 1.8, 5.0),
    target: new THREE.Vector3(0, 2.4, 0),
    fov: 52,
    isOrbit: false,
    driftSpeed: 0.05
  }
};

/**
 * Legacy orbit calculation parameters.
 */
export const ORBIT_CONFIG = {
  radius: 8.5,
  orbitRadius: 8.5,
  minPhi: 0.45, // ~25.8 deg
  maxPhi: 1.30, // ~74.5 deg
  targetY: 1.2,
  target: { x: 0, y: 1.2, z: 0 }
};

/**
 * Full venue smooth 360-degree orbit parameters.
 */
export const FULL_VENUE_ORBIT_CONFIG = {
  radius: 10.0,
  target: { x: 0, y: 1.4, z: 0 },
  elevationY: 5.0,
  fov: 68,
  minRadius: 6.0,
  maxRadius: 25.0,
  rotationSpeed: 0.10
};

/**
 * VIP stage zoom timing and target.
 */
export const VIP_ZOOM_CONFIG = {
  durationSeconds: 5.0,
  target: { x: 0, y: 2.0, z: 0 },
  fov: 35
};

/**
 * Procedural camera shake & bass impact.
 */
export const CAMERA_SHAKE_CONFIG = {
  defaultIntensity: 0.35,
  defaultDuration: 1.0,
  bassPunchThreshold: 60,
  bassPunchShakeAmount: 0.04
};

/**
 * Soaring King 360-degree Lion Celebration tracking parameters.
 */
export const LION_TRACKING_CONFIG = {
  durationSeconds: 7.6,
  orbitSpeed: 1.05,
  minOrbitRadius: 11.5,
  maxOrbitRadius: 16.5,
  minCamElevation: 4.0,
  maxCamElevation: 7.2
};

/**
 * Admin Camera Focus onto a selected Slime.
 */
export const AVATAR_FOCUS_CONFIG = {
  defaultDistanceT1T3: 2.8,
  defaultDistanceT4T5: 3.2,
  defaultElevation: 1.15,
  orbitSpeed: 0.18,
  lookOffsetYSmall: 0.60,
  lookOffsetYLarge: 0.75,
  fov: 54
};

/**
 * Exponential dual-vector camera lerp factor.
 */
export const CAMERA_LERP_LAMBDA = 5.0;
