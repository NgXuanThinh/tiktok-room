// src/scene-manager.js - Three.js WebGL scene lifecycle, 4 lerped camera presets, alpha/chroma modes
import * as THREE from 'three';

export const CAMERA_PRESETS = {
  orbit: {
    name: 'Cinematic Orbit',
    pos: new THREE.Vector3(0, 8, 14),
    target: new THREE.Vector3(0, 1, 0),
    fov: 50,
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
    name: 'VIP Podium Zoom',
    pos: new THREE.Vector3(3, 2.5, -2),
    target: new THREE.Vector3(0, 2.0, -3.5),
    fov: 35,
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
    this.currentPreset = CAMERA_PRESETS.orbit;
    this.camTargetPos = new THREE.Vector3().copy(this.currentPreset.pos);
    this.camLookTarget = new THREE.Vector3().copy(this.currentPreset.target);
    this.camCurrentLook = new THREE.Vector3().copy(this.currentPreset.target);

    this.orbitTheta = 0;
    this.orbitRadius = 14;
    this.orbitHeight = 8;

    this.isAlpha = false;
    this.isChromaGreen = false;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // Check URL parameters for OBS broadcasting modes
    const urlParams = new URLSearchParams(window.location.search);
    this.isAlpha = urlParams.get('alpha') === 'true';
    this.isChromaGreen = urlParams.get('chroma') === 'green';

    // Scene
    this.scene = new THREE.Scene();
    if (this.isAlpha) {
      this.scene.background = null;
      document.body.style.background = 'transparent';
    } else if (this.isChromaGreen) {
      this.scene.background = new THREE.Color(0x00ff00);
    } else {
      this.scene.background = new THREE.Color(0x0a0a14);
      this.scene.fog = new THREE.FogExp2(0x0a0a14, 0.025);
    }

    // Camera
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    this.camera.position.copy(this.camTargetPos);
    this.camera.lookAt(this.camCurrentLook);

    // WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: this.isAlpha,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.container.appendChild(this.renderer.domElement);

    // Ambient Lighting
    const ambientLight = new THREE.AmbientLight(0x222233, 1.2);
    this.scene.add(ambientLight);

    // Directional Key Light
    const dirLight = new THREE.DirectionalLight(0xffeedd, 1.5);
    dirLight.position.set(5, 12, 7);
    this.scene.add(dirLight);

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

  setCameraPreset(key) {
    if (!CAMERA_PRESETS[key]) return;
    this.currentPresetKey = key;
    this.currentPreset = CAMERA_PRESETS[key];
    this.camTargetPos.copy(this.currentPreset.pos);
    this.camLookTarget.copy(this.currentPreset.target);

    // Smooth FOV transition
    this.camera.fov = this.currentPreset.fov;
    this.camera.updateProjectionMatrix();
  }

  toggleChromaKey() {
    this.isChromaGreen = !this.isChromaGreen;
    if (this.isChromaGreen) {
      this.scene.background = new THREE.Color(0x00ff00);
      this.scene.fog = null;
    } else if (this.isAlpha) {
      this.scene.background = null;
    } else {
      this.scene.background = new THREE.Color(0x0a0a14);
      this.scene.fog = new THREE.FogExp2(0x0a0a14, 0.025);
    }
  }

  toggleAlpha() {
    this.isAlpha = !this.isAlpha;
    if (this.isAlpha) {
      this.scene.background = null;
      document.body.style.background = 'transparent';
    } else {
      this.scene.background = new THREE.Color(0x0a0a14);
      document.body.style.background = '#0a0a14';
    }
  }

  onResize() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  update(deltaTime = 0.016, bassPunch = 0) {
    // Cinematic orbit rotation calculation
    if (this.currentPreset.isOrbit) {
      this.orbitTheta += 0.12 * deltaTime;
      this.camTargetPos.x = Math.sin(this.orbitTheta) * this.orbitRadius;
      this.camTargetPos.z = Math.cos(this.orbitTheta) * this.orbitRadius;
      this.camTargetPos.y = this.orbitHeight + (bassPunch > 50 ? Math.sin(this.orbitTheta * 4) * 0.15 : 0);
    }

    // Exponential Dual-Vector Lerp: P_t = P_{t-1} + (P_target - P_{t-1}) * (1 - e^{-lambda * dt})
    const lambda = 5.0;
    const lerpFactor = 1.0 - Math.exp(-lambda * Math.min(deltaTime, 0.1));

    this.camera.position.lerp(this.camTargetPos, lerpFactor);
    this.camCurrentLook.lerp(this.camLookTarget, lerpFactor);
    this.camera.lookAt(this.camCurrentLook);

    // Subtle bass camera shake
    if (bassPunch > 60) {
      this.camera.position.y += (Math.random() - 0.5) * 0.04;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
