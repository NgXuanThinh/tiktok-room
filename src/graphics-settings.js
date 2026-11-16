// src/graphics-settings.js - Centralized Graphics & Performance Settings Manager
import {
  PIXEL_RATIO_PRESETS,
  DEFAULT_PIXEL_RATIO_KEY,
  LIGHTING_PERF_CONFIG,
  AVATAR_PERF_CONFIG,
  SHADER_PERF_CONFIG,
  FPS_CAP_PRESETS,
  DEFAULT_FPS_KEY,
  SLIME_SHADING_MODES,
  DEFAULT_SLIME_SHADING_KEY,
  GRAPHICS_SETTINGS_STORAGE_KEY
} from './graphics-constants.js';

export class GraphicsSettingsManager {
  constructor(options = {}) {
    this.listeners = new Set();

    // Default configuration values
    this.settings = {
      pixelRatioKey: DEFAULT_PIXEL_RATIO_KEY,
      enableMovingHeadLights: LIGHTING_PERF_CONFIG.DEFAULT_ENABLE_MOVING_HEAD_LIGHTS,
      enableMovingHeadCones: LIGHTING_PERF_CONFIG.DEFAULT_ENABLE_MOVING_HEAD_CONES ?? true,
      enableLaserBeams: LIGHTING_PERF_CONFIG.DEFAULT_ENABLE_LASER_BEAMS ?? true,
      enableBillboardCpuLookAt: AVATAR_PERF_CONFIG?.DEFAULT_ENABLE_BILLBOARD_CPU_LOOKAT ?? false,
      useGpuShaders: SHADER_PERF_CONFIG.DEFAULT_USE_GPU_SHADERS,
      enableStaticFloor: SHADER_PERF_CONFIG.DEFAULT_ENABLE_STATIC_FLOOR ?? false,
      fpsCapKey: DEFAULT_FPS_KEY,
      slimeShadingKey: DEFAULT_SLIME_SHADING_KEY
    };

    // Load persisted preferences if in browser
    this.loadFromStorage();
  }

  /**
   * Load settings from browser localStorage
   */
  loadFromStorage() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const raw = localStorage.getItem(GRAPHICS_SETTINGS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.pixelRatioKey && PIXEL_RATIO_PRESETS[parsed.pixelRatioKey]) {
          this.settings.pixelRatioKey = parsed.pixelRatioKey;
        }
        if (typeof parsed.enableMovingHeadLights === 'boolean') {
          this.settings.enableMovingHeadLights = parsed.enableMovingHeadLights;
        }
        if (typeof parsed.enableMovingHeadCones === 'boolean') {
          this.settings.enableMovingHeadCones = parsed.enableMovingHeadCones;
        }
        if (typeof parsed.enableLaserBeams === 'boolean') {
          this.settings.enableLaserBeams = parsed.enableLaserBeams;
        }
        if (typeof parsed.enableBillboardCpuLookAt === 'boolean') {
          this.settings.enableBillboardCpuLookAt = parsed.enableBillboardCpuLookAt;
        }
        if (typeof parsed.useGpuShaders === 'boolean') {
          this.settings.useGpuShaders = parsed.useGpuShaders;
        }
        if (typeof parsed.enableStaticFloor === 'boolean') {
          this.settings.enableStaticFloor = parsed.enableStaticFloor;
        }
        if (parsed.fpsCapKey && FPS_CAP_PRESETS[parsed.fpsCapKey]) {
          this.settings.fpsCapKey = parsed.fpsCapKey;
        }
        if (parsed.slimeShadingKey && SLIME_SHADING_MODES[parsed.slimeShadingKey]) {
          this.settings.slimeShadingKey = parsed.slimeShadingKey;
        }
      }
    } catch (e) {
      console.warn('[GraphicsSettingsManager] Failed to load localStorage settings:', e);
    }
  }

  /**
   * Save settings to browser localStorage
   */
  saveToStorage() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      localStorage.setItem(GRAPHICS_SETTINGS_STORAGE_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.warn('[GraphicsSettingsManager] Failed to save localStorage settings:', e);
    }
  }

  /**
   * Register a listener callback for graphics settings updates
   */
  addListener(callback) {
    if (typeof callback === 'function') {
      this.listeners.add(callback);
    }
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all registered listeners
   */
  notify(changedKey, value) {
    this.saveToStorage();
    for (const cb of this.listeners) {
      try {
        cb(changedKey, value, this.getSnapshot());
      } catch (e) {
        console.error('[GraphicsSettingsManager] Error in listener callback:', e);
      }
    }
  }

  /**
   * Get an immutable snapshot of all settings
   */
  getSnapshot() {
    return {
      ...this.settings,
      effectivePixelRatio: this.getEffectivePixelRatio(),
      targetFps: this.getTargetFps(),
      fpsIntervalMs: this.getFpsIntervalMs()
    };
  }

  // --- Getters & Setters ---

  getEffectivePixelRatio() {
    const preset = PIXEL_RATIO_PRESETS[this.settings.pixelRatioKey] || PIXEL_RATIO_PRESETS[DEFAULT_PIXEL_RATIO_KEY];
    if (preset.value > 0) {
      return preset.value;
    }
    // Native screen scale clamped to 2.0 max
    const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1.0) : 1.0;
    return Math.min(dpr, 2.0);
  }

  setPixelRatioKey(key) {
    if (!PIXEL_RATIO_PRESETS[key]) return;
    if (this.settings.pixelRatioKey === key) return;
    this.settings.pixelRatioKey = key;
    this.notify('pixelRatioKey', key);
  }

  setEnableMovingHeadLights(enabled) {
    const boolVal = Boolean(enabled);
    if (this.settings.enableMovingHeadLights === boolVal) return;
    this.settings.enableMovingHeadLights = boolVal;
    this.notify('enableMovingHeadLights', boolVal);
  }

  setEnableMovingHeadCones(enabled) {
    const boolVal = Boolean(enabled);
    if (this.settings.enableMovingHeadCones === boolVal) return;
    this.settings.enableMovingHeadCones = boolVal;
    this.notify('enableMovingHeadCones', boolVal);
  }

  setEnableLaserBeams(enabled) {
    const boolVal = Boolean(enabled);
    if (this.settings.enableLaserBeams === boolVal) return;
    this.settings.enableLaserBeams = boolVal;
    this.notify('enableLaserBeams', boolVal);
  }

  setBillboardCpuLookAt(enabled) {
    const boolVal = Boolean(enabled);
    if (this.settings.enableBillboardCpuLookAt === boolVal) return;
    this.settings.enableBillboardCpuLookAt = boolVal;
    this.notify('enableBillboardCpuLookAt', boolVal);
  }

  setUseGpuShaders(enabled) {
    const boolVal = Boolean(enabled);
    if (this.settings.useGpuShaders === boolVal) return;
    this.settings.useGpuShaders = boolVal;
    this.notify('useGpuShaders', boolVal);
  }

  setStaticFloor(enabled) {
    const boolVal = Boolean(enabled);
    if (this.settings.enableStaticFloor === boolVal) return;
    this.settings.enableStaticFloor = boolVal;
    this.notify('enableStaticFloor', boolVal);
  }

  getTargetFps() {
    const preset = FPS_CAP_PRESETS[this.settings.fpsCapKey] || FPS_CAP_PRESETS[DEFAULT_FPS_KEY];
    return preset.targetFps;
  }

  getFpsIntervalMs() {
    const preset = FPS_CAP_PRESETS[this.settings.fpsCapKey] || FPS_CAP_PRESETS[DEFAULT_FPS_KEY];
    return preset.intervalMs;
  }

  setFpsCapKey(key) {
    if (!FPS_CAP_PRESETS[key]) return;
    if (this.settings.fpsCapKey === key) return;
    this.settings.fpsCapKey = key;
    this.notify('fpsCapKey', key);
  }

  getSlimeShadingConfig() {
    return SLIME_SHADING_MODES[this.settings.slimeShadingKey] || SLIME_SHADING_MODES[DEFAULT_SLIME_SHADING_KEY];
  }

  setSlimeShadingKey(key) {
    if (!SLIME_SHADING_MODES[key]) return;
    if (this.settings.slimeShadingKey === key) return;
    this.settings.slimeShadingKey = key;
    this.notify('slimeShadingKey', key);
  }

  /**
   * Reset all settings to default
   */
  resetDefaults() {
    this.settings.pixelRatioKey = DEFAULT_PIXEL_RATIO_KEY;
    this.settings.enableMovingHeadLights = LIGHTING_PERF_CONFIG.DEFAULT_ENABLE_MOVING_HEAD_LIGHTS;
    this.settings.enableMovingHeadCones = LIGHTING_PERF_CONFIG.DEFAULT_ENABLE_MOVING_HEAD_CONES ?? true;
    this.settings.enableLaserBeams = LIGHTING_PERF_CONFIG.DEFAULT_ENABLE_LASER_BEAMS ?? true;
    this.settings.enableBillboardCpuLookAt = AVATAR_PERF_CONFIG?.DEFAULT_ENABLE_BILLBOARD_CPU_LOOKAT ?? false;
    this.settings.useGpuShaders = SHADER_PERF_CONFIG.DEFAULT_USE_GPU_SHADERS;
    this.settings.enableStaticFloor = SHADER_PERF_CONFIG.DEFAULT_ENABLE_STATIC_FLOOR ?? false;
    this.settings.fpsCapKey = DEFAULT_FPS_KEY;
    this.settings.slimeShadingKey = DEFAULT_SLIME_SHADING_KEY;
    this.notify('all', this.getSnapshot());
  }
}

// Global Singleton Instance
export const graphicsSettings = new GraphicsSettingsManager();
