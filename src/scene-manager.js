// src/scene-manager.js - Three.js WebGL scene lifecycle, 4 lerped camera presets, alpha/chroma modes
import * as THREE from 'three';
import { CINEMATIC_CONFIG } from './cinematic-config.js';
import {
  CAMERA_PRESETS,
  ORBIT_CONFIG,
  FULL_VENUE_ORBIT_CONFIG,
  VIP_ZOOM_CONFIG,
  CAMERA_SHAKE_CONFIG,
  LION_TRACKING_CONFIG,
  AVATAR_FOCUS_CONFIG,
  CAMERA_LERP_LAMBDA
} from './camera-constants.js';

export {
  CAMERA_PRESETS,
  ORBIT_CONFIG,
  FULL_VENUE_ORBIT_CONFIG,
  VIP_ZOOM_CONFIG,
  CAMERA_SHAKE_CONFIG,
  LION_TRACKING_CONFIG,
  AVATAR_FOCUS_CONFIG,
  CAMERA_LERP_LAMBDA
};

/**
 * Calculates orbit camera spherical coordinates clamped within room boundaries.
 */
export function getOrbitCameraPosition(theta, phi = 0.85, radius = ORBIT_CONFIG.radius) {
  const clampedPhi = Math.max(ORBIT_CONFIG.minPhi, Math.min(ORBIT_CONFIG.maxPhi, phi));
  const r = Math.min(radius, ORBIT_CONFIG.radius);
  const rawY = ORBIT_CONFIG.target.y + r * Math.cos(clampedPhi);
  return {
    x: r * Math.sin(clampedPhi) * Math.sin(theta),
    y: Math.min(8.5, Math.max(2.0, rawY)),
    z: r * Math.sin(clampedPhi) * Math.cos(theta)
  };
}
export const calculateOrbitPosition = getOrbitCameraPosition;

export class SceneManager {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    this.currentPresetKey = 'orbit';
    this.previousPresetKey = 'orbit';
    this.vipTimer = 0;
    this.currentPreset = CAMERA_PRESETS.orbit;
    this.camTargetPos = new THREE.Vector3().copy(this.currentPreset.pos);
    this.camLookTarget = new THREE.Vector3().copy(this.currentPreset.target);
    this.camCurrentLook = new THREE.Vector3().copy(this.currentPreset.target);

    this.orbitTheta = 0;
    this.orbitPhi = 0.85;
    this.orbitRadius = ORBIT_CONFIG.radius;
    this.orbitTargetY = ORBIT_CONFIG.targetY;

    this.isAlpha = false;
    this.isChromaGreen = false;

    this.isLionTracking = false;
    this.lionHeroMesh = null;
    this.lionTimer = 0;
    this.lionDuration = 7.6;
    this.shakeTimer = 0;
    this.shakeDuration = 0;
    this.shakeIntensity = 0;

    this.init();
  }

  init() {
    const hasWindow = typeof window !== 'undefined';
    const width = (this.container && this.container.clientWidth) || (hasWindow ? window.innerWidth : 1280);
    const height = (this.container && this.container.clientHeight) || (hasWindow ? window.innerHeight : 720);

    // Check URL parameters for OBS broadcasting modes
    const search = hasWindow && window.location ? window.location.search : '';
    const urlParams = new URLSearchParams(search);
    this.isChromaGreen = urlParams.get('chroma') === 'green';
    this.isAlpha = urlParams.get('alpha') !== 'false'; // Default to transparent background (no pitch-black)

    // Scene: Dark as night ("tối như đêm") with twinkling starfield
    this.scene = new THREE.Scene();
    if (this.isChromaGreen) {
      this.scene.background = new THREE.Color(0x00ff00);
      this.scene.fog = null;
    } else if (this.isAlpha) {
      this.scene.background = null;
      this.scene.fog = null;
      if (typeof document !== 'undefined' && document.body) {
        document.body.style.background = 'transparent';
      }
    } else {
      this.scene.background = new THREE.Color(0x06060e);
      this.scene.fog = null;
      if (typeof document !== 'undefined' && document.body) {
        document.body.style.background = '#06060e';
      }
    }

    // Camera
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    this.camera.position.copy(this.camTargetPos);
    this.camera.lookAt(this.camCurrentLook);

    // WebGL Renderer (configured with shadow-free high performance)
    if (typeof document !== 'undefined') {
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(hasWindow ? Math.min(window.devicePixelRatio, 2.0) : 1.0);
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.18;
      if (this.container && typeof this.container.appendChild === 'function') {
        this.container.appendChild(this.renderer.domElement);
      }
    } else {
      this.renderer = {
        setSize: () => {},
        setPixelRatio: () => {},
        render: () => {},
        domElement: {}
      };
    }

    // Atmospheric Night Lighting (dark night ambience with vivid neon contrast)
    const ambientLight = new THREE.AmbientLight(0x282844, 1.4);
    this.scene.add(ambientLight);

    // Hemisphere Fill Light (sky/ground contrast)
    const hemiLight = new THREE.HemisphereLight(0x445577, 0x181828, 1.1);
    this.scene.add(hemiLight);

    // Directional Key Light
    const dirLight = new THREE.DirectionalLight(0xffeedd, 1.4);
    dirLight.position.set(5, 12, 7);
    this.scene.add(dirLight);

    if (hasWindow) {
      // Window Resize Event
      window.addEventListener('resize', () => this.onResize());

      // Hotkey bindings: F2 for Chroma Key, 1-4 for Camera presets
      window.addEventListener('keydown', (e) => {
        if (e.key === 'F2') {
          e.preventDefault();
          this.toggleChromaKey();
        } else if (e.key === '1') {
          this.setCameraPreset('orbit');
        } else if (e.key === '2') {
          this.setCameraPreset('dj');
        } else if (e.key === '3') {
          this.setCameraPreset('top');
        } else if (e.key === '4') {
          this.setCameraPreset('vip');
        }
      });
    }
  }

  setCameraPreset(key, duration = null, customTarget = null) {
    if (!CAMERA_PRESETS[key]) return;

    // Reset avatar focus tracking when an explicit camera preset is selected
    this.focusedAvatarMesh = null;
    this.focusAvatarOptions = null;

    if (key === 'vip') {
      if (this.currentPresetKey !== 'vip') {
        this.previousPresetKey = this.currentPresetKey;
      }
      this.vipTimer = duration !== null ? duration : VIP_ZOOM_CONFIG.durationSeconds;
    } else {
      this.vipTimer = 0;
    }

    this.currentPresetKey = key;
    this.currentPreset = CAMERA_PRESETS[key];

    if (key === 'vip' && customTarget) {
      this.camLookTarget.copy(customTarget);
      this.camTargetPos.set(
        customTarget.x + (customTarget.x >= 0 ? -5.2 : 5.2),
        customTarget.y + 5.2,
        customTarget.z + 12.8
      );
    } else {
      this.camTargetPos.copy(this.currentPreset.pos);
      this.camLookTarget.copy(this.currentPreset.target);
    }

    // Smooth FOV transition
    this.camera.fov = this.currentPreset.fov;
    this.camera.updateProjectionMatrix();
  }

  setOrbitRadius(radius) {
    const minR = FULL_VENUE_ORBIT_CONFIG.minRadius || 6.0;
    const maxR = FULL_VENUE_ORBIT_CONFIG.maxRadius || 25.0;
    this.orbitRadius = Math.max(minR, Math.min(maxR, Number(radius || 10.0)));
  }

  setFov(fov) {
    const clampedFov = Math.max(30, Math.min(90, Number(fov || 68)));
    if (this.camera) {
      this.camera.fov = clampedFov;
      this.camera.updateProjectionMatrix();
    }
  }

  revertVipCamera() {
    const returnKey = this.previousPresetKey || 'orbit';
    this.setCameraPreset(returnKey);
  }

  toggleChromaKey() {
    this.isChromaGreen = !this.isChromaGreen;
    if (this.isChromaGreen) {
      this.scene.background = new THREE.Color(0x00ff00);
      this.scene.fog = null;
    } else {
      this.scene.background = null;
      this.scene.fog = null;
      if (typeof document !== 'undefined' && document.body) {
        document.body.style.background = 'transparent';
      }
    }
  }

  toggleAlpha() {
    this.isAlpha = !this.isAlpha;
    this.scene.background = null;
    this.scene.fog = null;
    if (typeof document !== 'undefined' && document.body) {
      document.body.style.background = 'transparent';
    }
  }

  onResize() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  triggerCameraShake(intensity = 0.35, duration = 1.0) {
    this.shakeIntensity = intensity;
    this.shakeTimer = duration;
    this.shakeDuration = duration;
  }

  startLionTracking(heroMesh, duration = 7.6) {
    if (!heroMesh) return;
    if (this.currentPresetKey !== 'vip' && !this.isLionTracking) {
      this.previousPresetKey = this.currentPresetKey || 'orbit';
    }
    this.isLionTracking = true;
    this.lionHeroMesh = heroMesh;
    this.lionTimer = duration;
    this.lionDuration = duration;
    if (this.camera) {
      this.camera.fov = 68;
      this.camera.updateProjectionMatrix();
    }
    this.triggerCameraShake(0.35, 1.0);
  }

  update(deltaTime = 0.016, bassPunch = 0) {
    // 0. Dynamic Real-Time Tracking of Focused Slime Avatar (Admin Focus Slime)
    if (this.focusedAvatarMesh) {
      const hero = this.focusedAvatarMesh;
      if (!hero.parent) {
        this.clearAvatarFocus();
      } else {
        const rootNode = hero.userData?.controller?.rootNode || hero;
        const worldPos = new THREE.Vector3();
        rootNode.getWorldPosition(worldPos);

        const sx = worldPos.x;
        const sy = worldPos.y;
        const sz = worldPos.z;

        const slimeTier = hero.userData?.controller?.state?.tier || 1;
        const baseDist = (this.focusAvatarOptions?.distance) || (slimeTier >= 4 ? AVATAR_FOCUS_CONFIG.defaultDistanceT4T5 : AVATAR_FOCUS_CONFIG.defaultDistanceT1T3);
        const camElevation = (this.focusAvatarOptions?.elevation) || AVATAR_FOCUS_CONFIG.defaultElevation;

        // Gentle slow orbit around the focused slime
        this.focusOrbitAngle = (this.focusOrbitAngle || 0) + AVATAR_FOCUS_CONFIG.orbitSpeed * deltaTime;
        const camX = sx + Math.sin(this.focusOrbitAngle) * baseDist;
        const camY = Math.max(0.8, sy + camElevation + (bassPunch > 50 ? 0.08 : 0));
        const camZ = sz + Math.cos(this.focusOrbitAngle) * baseDist;

        // Look at slime upper body and billboard
        const lookY = sy + (slimeTier >= 4 ? AVATAR_FOCUS_CONFIG.lookOffsetYLarge : AVATAR_FOCUS_CONFIG.lookOffsetYSmall);
        this.camTargetPos.set(camX, camY, camZ);
        this.camLookTarget.set(sx, lookY, sz);
      }
    } else if (this.isLionTracking && this.lionHeroMesh) {
      this.lionTimer -= deltaTime;
      const elapsed = Math.max(0, this.lionDuration - this.lionTimer);
      const hero = this.lionHeroMesh;
      const slimeY = hero.userData?.controller?.rootNode?.position?.y || hero.position.y || 0;

      // Track focus midway so both floor aura and soaring king remain framed
      const targetFocusY = THREE.MathUtils.lerp(0.8, 2.8, Math.min(1.0, slimeY / 3.8));
      this.camLookTarget.x = THREE.MathUtils.lerp(this.camLookTarget.x, hero.position.x, 0.1);
      this.camLookTarget.y = THREE.MathUtils.lerp(this.camLookTarget.y, targetFocusY, 0.1);
      this.camLookTarget.z = THREE.MathUtils.lerp(this.camLookTarget.z, hero.position.z, 0.1);

      // Smooth 360-degree orbit around the donator (~1.25 full turns across 7.6s)
      const orbitTheta = elapsed * 1.05;
      // Orbit radius expands from 11.5m up to 16.5m to capture full shockwaves, golden beam, and signature props
      const orbitRadius = THREE.MathUtils.lerp(11.5, 16.5, Math.min(1.0, slimeY / 3.6));
      // Camera elevation ascends to capture soaring king + glowing golden light pillar
      const targetCamY = THREE.MathUtils.lerp(4.0, 7.2, Math.min(1.0, slimeY / 3.8));

      const targetCamX = hero.position.x + Math.sin(orbitTheta) * orbitRadius;
      const targetCamZ = hero.position.z + Math.cos(orbitTheta) * orbitRadius;

      this.camTargetPos.set(targetCamX, targetCamY, targetCamZ);

      if (this.lionTimer <= 0) {
        this.isLionTracking = false;
        this.lionHeroMesh = null;
        this.revertVipCamera();
      }
    } else {
      // VIP zoom auto-revert countdown timer
      if (this.currentPresetKey === 'vip' && this.vipTimer > 0) {
        this.vipTimer -= deltaTime;
        if (this.vipTimer <= 0) {
          this.vipTimer = 0;
          this.revertVipCamera();
        }
      }

      // Full-venue orbit rotation centered EXACTLY at dance floor center (0, 1.4, 0)
      if (this.currentPreset.isOrbit && !this._cinematicFocusActive && !this._donateShowcaseActive) {
        this.orbitTheta += 0.10 * deltaTime;
        const target = FULL_VENUE_ORBIT_CONFIG.target;
        const r = this.orbitRadius || FULL_VENUE_ORBIT_CONFIG.radius;
        const x = target.x + r * Math.sin(this.orbitTheta);
        const z = target.z + r * Math.cos(this.orbitTheta);

        // Balanced, natural elevation:
        // At r = 10m: base elevation is 5.0m
        // At r = 25m: base elevation is 8.0m
        // When behind the DJ (cos(theta) < 0), slight gentle lift of +1.5m to comfortably clear the DJ
        const behindFactor = Math.max(0, -Math.cos(this.orbitTheta));
        const baseElev = 5.0 + (r - 10.0) * 0.20;
        const y = baseElev + behindFactor * 1.5;

        this.camTargetPos.set(
          x,
          y + (bassPunch > 50 ? Math.sin(this.orbitTheta * 4) * 0.15 : 0),
          z
        );
        this.camLookTarget.set(target.x, target.y, target.z);
      }
    }

    // Exponential Dual-Vector Lerp: P_t = P_{t-1} + (P_target - P_{t-1}) * (1 - e^{-lambda * dt})
    const lambda = CAMERA_LERP_LAMBDA;
    const lerpFactor = 1.0 - Math.exp(-lambda * Math.min(deltaTime, 0.1));

    this.camera.position.lerp(this.camTargetPos, lerpFactor);
    this.camCurrentLook.lerp(this.camLookTarget, lerpFactor);
    this.camera.lookAt(this.camCurrentLook);

    // Procedural Camera Shake decay (for gifts and impacts)
    if (this.shakeTimer > 0) {
      this.shakeTimer -= deltaTime;
      const decay = Math.max(0, this.shakeTimer / this.shakeDuration) * this.shakeIntensity;
      this.camera.position.x += (Math.random() - 0.5) * decay;
      this.camera.position.y += (Math.random() - 0.5) * decay;
    } else if (bassPunch > CAMERA_SHAKE_CONFIG.bassPunchThreshold) {
      // Subtle bass camera shake
      this.camera.position.y += (Math.random() - 0.5) * CAMERA_SHAKE_CONFIG.bassPunchShakeAmount;
    }

    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Projects a Three.js world position to CSS pixel coordinates on screen.
   * Used for the CSS→WebGL bridge when the 2D overlay card flies back to the Slime.
   * @param {THREE.Vector3} worldPos - World space position of the target Slime
   * @returns {{ x: number, y: number }} CSS pixel coordinates (top-left origin)
   */
  getScreenCoords(worldPos) {
    if (!this.camera || !this.renderer) return { x: 0, y: 0 };
    const ndc = worldPos.clone().project(this.camera);
    const width = this.renderer.domElement.clientWidth || window.innerWidth;
    const height = this.renderer.domElement.clientHeight || window.innerHeight;
    return {
      x: Math.round((ndc.x * 0.5 + 0.5) * width),
      y: Math.round((-ndc.y * 0.5 + 0.5) * height)
    };
  }

  /**
   * Transitions camera to Cinematic VIP Low-Angle for the 2D donate overlay.
   * Called at t=0.0s when a high-tier donate begins.
   * @param {THREE.Vector3} slimePos - World position of the donating Slime
   */
  /**
   * Smoothly moves the camera to dynamic framed distance and elevation facing the donating slime avatar.
   * Uses perspective projection formula: Distance = (FrameHeight / 2) / tan(FOV / 2).
   * @param {THREE.Vector3|object} slimePos - World position of the donating Slime
   * @param {Function} [onArrived] - Callback triggered when camera arrives in front of slime
   * @param {number} [duration=1.0] - Travel duration in seconds before showcase begins
   * @param {THREE.Object3D|object} [avatarMesh=null] - Avatar mesh to calculate dynamic height and jump apex
   */
  focusSlimeCinematic(slimePos, onArrived = null, duration = 1.0, avatarMesh = null) {
    if (!this._cinematicFocusActive) {
      this._savedPresetKey = this.currentPresetKey;
      this._savedOrbitRadius = this.orbitRadius;
      this._savedFov = this.camera ? this.camera.fov : 68;
    }
    this._cinematicFocusActive = true;
    this._donateShowcaseActive = true;

    const sx = slimePos?.x || 0;
    const sy = slimePos?.y || 0;
    const sz = slimePos?.z || 0;

    // Dynamic framing calculations based on avatar height and jump apex
    let slimeHeight = 0.65;
    let jumpApex = 1.2;
    const mesh = avatarMesh?.mesh || (avatarMesh?.isObject3D ? avatarMesh : null);
    if (mesh) {
      const scaleY = (mesh.scale?.y || 0.52);
      slimeHeight = Math.max(0.45, 0.65 * scaleY * 2.0);
      const donateFx = mesh.userData?.controller?.state?.donateFx;
      jumpApex = donateFx?.apexOverride ? Number(donateFx.apexOverride) : (slimeHeight + 1.2);
    }
    const billboardHeight = 0.55;
    const totalHeight = Math.max(slimeHeight + jumpApex, slimeHeight + billboardHeight + 0.8);

    // Perspective Projection Framing Formula
    const camCfg = CINEMATIC_CONFIG?.camera || { fov: 56, screenOccupancy: 0.38, pitchAngleDeg: 20, minDistance: 3.5, maxDistance: 8.0 };
    const fovDeg = camCfg.fov || 56;
    const fovRad = (fovDeg * Math.PI) / 180;
    const occupancy = Math.max(0.2, Math.min(0.8, camCfg.screenOccupancy || 0.38));
    const frameHeight = totalHeight / occupancy;
    const calculatedDist = (frameHeight * 0.5) / Math.tan(fovRad * 0.5);
    const camDist = Math.max(camCfg.minDistance || 3.5, Math.min(camCfg.maxDistance || 8.0, calculatedDist));

    // Pitch Angle Elevation
    const pitchDeg = camCfg.pitchAngleDeg || 20;
    const pitchRad = (pitchDeg * Math.PI) / 180;
    const horizontalDist = camDist * Math.cos(pitchRad);
    const verticalElevation = camDist * Math.sin(pitchRad);

    const approachAngle = Math.atan2(sx, sz + 2.0) + (camCfg.approachAngleOffset || 0);
    const camX = sx + Math.sin(approachAngle) * horizontalDist;
    const camY = Math.max(1.4, sy + verticalElevation);
    const camZ = sz + Math.cos(approachAngle) * horizontalDist;

    const lookY = sy + Math.min(totalHeight * 0.42, 1.2);
    this.camTargetPos.set(camX, camY, camZ);
    this.camLookTarget.set(sx, lookY, sz);

    if (this.camera) {
      this.camera.fov = fovDeg;
      this.camera.updateProjectionMatrix();
    }

    if (onArrived) {
      setTimeout(() => {
        if (this._cinematicFocusActive) {
          onArrived();
        }
      }, Math.max(100, duration * 1000));
    }
  }

  /**
   * Reverts camera back to original distance, position, and preset before the showcase.
   */
  revertFromCinematic() {
    if (typeof this.onRevertFromCinematic === 'function') {
      try {
        this.onRevertFromCinematic();
      } catch (err) {
        console.error('onRevertFromCinematic error:', err);
      }
    }
    this._cinematicFocusActive = false;
    this._donateShowcaseActive = false;
    const prevKey = this._savedPresetKey || this.previousPresetKey || 'orbit';
    this.setCameraPreset(prevKey);
    if (this._savedOrbitRadius) {
      this.setOrbitRadius(this._savedOrbitRadius);
    }
    if (this._savedFov && this.camera) {
      this.camera.fov = this._savedFov;
      this.camera.updateProjectionMatrix();
    }
  }

  startDonateShowcase(slimePos, onArrived = null, duration = 1.0) {
    this.focusSlimeCinematic(slimePos, onArrived, duration);
  }

  endDonateShowcase() {
    this.revertFromCinematic();
  }

  /**
   * Focuses camera smoothly onto a donating Slime avatar according to donation tier camera config.
   * Accurately frames the donating Slime at its 3D world position facing the audience.
   * Supports an optional onArrived callback triggered after camera completes the Zoom In phase.
   * @param {THREE.Object3D|object} avatarMesh
   * @param {object} [options={}]
   * @param {Function} [onArrived=null]
   */
  focusDonationAvatar(avatarMesh, options = {}, onArrived = null) {
    if (!this._cinematicFocusActive) {
      this._savedPresetKey = this.currentPresetKey;
      this._savedOrbitRadius = this.orbitRadius;
      this._savedFov = this.camera ? this.camera.fov : 68;
    }
    this._cinematicFocusActive = true;
    this._donateShowcaseActive = true;

    // Resolve accurate 3D world position of the donating slime
    let sx = 0;
    let sy = 0;
    let sz = 0;

    if (options.origin) {
      sx = options.origin.x ?? 0;
      sy = options.origin.y ?? 0;
      sz = options.origin.z ?? 0;
    } else {
      const mesh = avatarMesh?.mesh || (avatarMesh?.isObject3D ? avatarMesh : null);
      if (mesh) {
        if (mesh.position && (mesh.position.x !== 0 || mesh.position.z !== 0 || mesh.position.y !== 0)) {
          sx = mesh.position.x;
          sy = mesh.position.y;
          sz = mesh.position.z;
        } else if (typeof mesh.getWorldPosition === 'function') {
          const worldPos = new THREE.Vector3();
          mesh.getWorldPosition(worldPos);
          sx = worldPos.x;
          sy = worldPos.y;
          sz = worldPos.z;
        }
      } else if (avatarMesh?.position) {
        sx = avatarMesh.position.x ?? 0;
        sy = avatarMesh.position.y ?? 0;
        sz = avatarMesh.position.z ?? 0;
      }
    }

    const dist = options.distance || 2.8;
    const elev = options.elevation || 1.15;
    const fov = options.fov || 54;
    const lookY = sy + (options.lookOffsetY !== undefined ? options.lookOffsetY : 0.60);

    // Front-facing camera placement: angles camera to face the front of the slime towards the audience
    const toFrontX = -sx;
    const toFrontZ = 4.0 - sz;
    const camAngle = Math.atan2(toFrontX, toFrontZ);
    const camX = sx + Math.sin(camAngle) * dist;
    const camY = Math.max(0.8, sy + elev);
    const camZ = sz + Math.cos(camAngle) * dist;

    this.camTargetPos.set(camX, camY, camZ);
    this.camLookTarget.set(sx, lookY, sz);

    if (this.camera) {
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
    }

    if (typeof onArrived === 'function') {
      const travelTimeMs = Math.max(50, (options.zoomInTravelTimeSec !== undefined ? options.zoomInTravelTimeSec : 0.45) * 1000);
      setTimeout(() => {
        if (this._cinematicFocusActive) {
          onArrived();
        }
      }, travelTimeMs);
    }
  }

  /**
   * Focuses the camera directly onto a selected Slime avatar.
   * Tracks the Slime's 3D position in real time with dynamic framing and gentle rotation.
   *
   * @param {THREE.Object3D} avatarMesh - The Slime avatar mesh to focus on
   * @param {object} [options={}] - Custom framing options (e.g., distance, elevation, fov)
   */
  focusOnAvatar(avatarMesh, options = {}) {
    if (!avatarMesh) {
      this.clearAvatarFocus();
      return;
    }

    if (!this.focusedAvatarMesh) {
      this._savedPresetBeforeFocus = this.currentPresetKey || 'orbit';
      this._savedOrbitRadiusBeforeFocus = this.orbitRadius;
      this._savedFovBeforeFocus = this.camera ? this.camera.fov : 68;
    }

    this.focusedAvatarMesh = avatarMesh;
    this.focusAvatarOptions = options;
    this.focusOrbitAngle = Math.PI * 0.25;

    if (this.camera) {
      this.camera.fov = options.fov || 54;
      this.camera.updateProjectionMatrix();
    }
  }

  /**
   * Clears avatar focus and restores camera back to previous preset.
   */
  clearAvatarFocus() {
    if (!this.focusedAvatarMesh) return;
    this.focusedAvatarMesh = null;
    this.focusAvatarOptions = null;
    const returnKey = this._savedPresetBeforeFocus || 'orbit';
    this.setCameraPreset(returnKey);
    if (this._savedOrbitRadiusBeforeFocus) {
      this.setOrbitRadius(this._savedOrbitRadiusBeforeFocus);
    }
    if (this._savedFovBeforeFocus && this.camera) {
      this.camera.fov = this._savedFovBeforeFocus;
      this.camera.updateProjectionMatrix();
    }
  }
}
