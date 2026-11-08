// src/scene-manager.js - Three.js WebGL scene lifecycle, 4 lerped camera presets, alpha/chroma modes
import * as THREE from 'three';

export const ORBIT_CONFIG = {
  radius: 8.5,
  orbitRadius: 8.5,
  minPhi: 0.45, // ~25.8 deg
  maxPhi: 1.30, // ~74.5 deg
  targetY: 1.2,
  target: { x: 0, y: 1.2, z: 0 }
};

export const FULL_VENUE_ORBIT_CONFIG = {
  radius: 10.0,
  target: { x: 0, y: 1.4, z: 0 },
  elevationY: 5.0,
  fov: 68,
  minRadius: 6.0,
  maxRadius: 25.0
};

export const VIP_ZOOM_CONFIG = {
  durationSeconds: 5.0,
  target: { x: 0, y: 2.0, z: 0 },
  fov: 35
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
  }
};

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
    // 1. Dynamic Cinematic King Framing for Lion Celebration (Full 360-degree Orbit around donator)
    if (this.isLionTracking && this.lionHeroMesh) {
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
      if (this.currentPreset.isOrbit) {
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
    const lambda = 5.0;
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
    } else if (bassPunch > 60) {
      // Subtle bass camera shake
      this.camera.position.y += (Math.random() - 0.5) * 0.04;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
