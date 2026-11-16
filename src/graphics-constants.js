// src/graphics-constants.js - Centralized configuration for graphics quality, performance, and shaders

/**
 * Pixel Ratio Presets (Internal render resolution scaling)
 */
export const PIXEL_RATIO_PRESETS = {
  ECO: {
    key: 'ECO',
    value: 1.0,
    label: '1.0x (Tiết kiệm nhất / Live mượt)',
    description: 'Giảm 50% tải GPU, tối ưu cho máy yếu hoặc stream thời gian dài'
  },
  BALANCED: {
    key: 'BALANCED',
    value: 1.25,
    label: '1.25x (Cân bằng - Khuyên dùng)',
    description: 'Độ nét chuẩn livestream TikTok, tiết kiệm ~40% GPU'
  },
  HIGH: {
    key: 'HIGH',
    value: 1.5,
    label: '1.5x (Độ nét cao)',
    description: 'Sắc nét trên màn hình 2K, tải GPU mức trung bình'
  },
  NATIVE: {
    key: 'NATIVE',
    value: 0, // 0 = use Math.min(window.devicePixelRatio, 2.0)
    label: 'Màn hình gốc (Tối đa 2.0x)',
    description: 'Độ phân giải tối đa của màn hình, tiêu thụ GPU cao nhất'
  }
};

export const DEFAULT_PIXEL_RATIO_KEY = 'BALANCED';

/**
 * Lighting Performance Configuration
 */
export const LIGHTING_PERF_CONFIG = {
  // Default state for 8 moving heads physical spot lights
  DEFAULT_ENABLE_MOVING_HEAD_LIGHTS: false,
  // Default state for 8 moving heads 3D volumetric light cones
  DEFAULT_ENABLE_MOVING_HEAD_CONES: true,
  // Default state for 6 ceiling laser beams (Additive blending)
  DEFAULT_ENABLE_LASER_BEAMS: true,
  // Spot lights that are always preserved for crucial stage elements
  PRESERVED_SPOTLIGHTS: ['djSpot', 'leftVipSpot', 'rightVipSpot']
};

/**
 * Avatar Performance Configuration
 */
export const AVATAR_PERF_CONFIG = {
  // When false, bypasses billboard.lookAt() on CPU and lets THREE.Sprite auto-orient in GPU vertex shader
  DEFAULT_ENABLE_BILLBOARD_CPU_LOOKAT: false
};

/**
 * Custom GLSL Shader Performance Configuration
 */
export const SHADER_PERF_CONFIG = {
  DEFAULT_USE_GPU_SHADERS: true,
  DEFAULT_ENABLE_STATIC_FLOOR: false,
  FLOOR: {
    tileSpacing: 1.6,
    waveSpeed: 2.0,
    waveFrequency: 0.4,
    minPulseBrightness: 0.28,
    bassPulseMultiplier: 0.03
  },
  STARFIELD: {
    twinkleBaseSpeed: 1.2,
    minTwinkle: 0.35,
    trebleFluxScale: 0.01
  }
};

/**
 * Target FPS Capping Presets
 */
export const FPS_CAP_PRESETS = {
  FPS_60: {
    key: 'FPS_60',
    targetFps: 60,
    intervalMs: 1000 / 60,
    label: '60 FPS (Chuẩn mượt mà)'
  },
  FPS_30: {
    key: 'FPS_30',
    targetFps: 30,
    intervalMs: 1000 / 30,
    label: '30 FPS (Eco Mode - Tiết kiệm máy)'
  },
  FPS_UNLIMITED: {
    key: 'FPS_UNLIMITED',
    targetFps: 0,
    intervalMs: 0,
    label: 'Không giới hạn (Theo tần số quét màn hình)'
  }
};

export const DEFAULT_FPS_KEY = 'FPS_60';

/**
 * Slime Shading Model Presets
 */
export const SLIME_SHADING_MODES = {
  PBR_TRANSLUCENT: {
    key: 'PBR_TRANSLUCENT',
    id: 'pbr',
    label: 'Thạch trong suốt (PBR gốc - Đẹp nhất)',
    materialType: 'MeshStandardMaterial',
    transparent: true,
    opacity: 0.92,
    depthWrite: true,
    roughness: 0.12,
    metalness: 0.06
  },
  TOON_OPAQUE: {
    key: 'TOON_OPAQUE',
    id: 'toon',
    label: 'Mochi đặc / Hoạt hình (Toon Shading - Nhẹ)',
    materialType: 'MeshToonMaterial',
    transparent: false,
    opacity: 1.0,
    depthWrite: true,
    roughness: 0.2,
    metalness: 0.0
  },
  LAMBERT_FAST: {
    key: 'LAMBERT_FAST',
    id: 'lambert',
    label: 'Tối ưu tối đa (Lambert - Siêu nhẹ)',
    materialType: 'MeshLambertMaterial',
    transparent: false,
    opacity: 1.0,
    depthWrite: true
  }
};

export const DEFAULT_SLIME_SHADING_KEY = 'PBR_TRANSLUCENT';

/**
 * LocalStorage Persistence Key
 */
export const GRAPHICS_SETTINGS_STORAGE_KEY = 'tiktok_bar_graphics_settings_v1';
