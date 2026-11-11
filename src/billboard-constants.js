// src/billboard-constants.js - Centralized configuration for 3D Billboard Sprites

/**
 * Default 3D Billboard Sprite Scale factor (configurable)
 */
export const PILL_SCALE = 2.5;

/**
 * Avatar border styles by role.
 * Line widths:
 * - TOP 1: 5.5px (Gold)
 * - TOP 2: 4.5px (Silver)
 * - TOP 3: 3.5px (Bronze)
 * - Fan: 3.5px (Violet, equal to TOP 3)
 * - Follower (soft fan): 1.8px (Gentle purple, thinner & softer)
 * - Default: 3.5px (Cyan)
 */
export const BILLBOARD_BORDERS = {
  TOP1: {
    color: '#ffd700',
    lineWidth: 5.5,
    shadowBlur: 14,
    shadowColor: '#ffd700'
  },
  TOP2: {
    color: '#e0e0e8',
    lineWidth: 4.5,
    shadowBlur: 12,
    shadowColor: '#c0c0c0'
  },
  TOP3: {
    color: '#cd7f32',
    lineWidth: 3.5,
    shadowBlur: 10,
    shadowColor: '#cd7f32'
  },
  FAN: {
    color: '#c77dff',
    lineWidth: 3.5,
    shadowBlur: 10,
    shadowColor: '#c77dff'
  },
  FOLLOW: {
    color: '#d8b4fe',
    lineWidth: 1.8,
    shadowBlur: 5,
    shadowColor: '#c77dff'
  },
  DEFAULT: {
    color: '#00f2fe',
    lineWidth: 3.5,
    shadowBlur: 10,
    shadowColor: '#00f2fe'
  }
};

/**
 * Pill labels & background styling by badge type
 */
export const BILLBOARD_PILLS = {
  PILL_SCALE,
  TOP1: {
    label: '👑 TOP 1',
    bg: 'rgba(32, 24, 6, 0.95)',
    border: '#ffd700',
    text: '#ffffff'
  },
  TOP2: {
    label: '🥈 TOP 2',
    bg: 'rgba(25, 25, 32, 0.95)',
    border: '#e0e0e8',
    text: '#ffffff'
  },
  TOP3: {
    label: '🥉 TOP 3',
    bg: 'rgba(35, 20, 10, 0.95)',
    border: '#cd7f32',
    text: '#ffffff'
  },
  VIP: {
    label: '💎 VIP',
    bg: 'rgba(30, 15, 45, 0.95)',
    border: '#c77dff',
    text: '#ffffff'
  },
  FAN: {
    label: '💜 Fan',
    bg: 'rgba(30, 15, 55, 0.95)',
    border: '#c77dff',
    text: '#ffffff'
  },
  FOLLOW: {
    label: '➕ Follower',
    bg: 'rgba(25, 15, 40, 0.95)',
    border: '#d8b4fe',
    text: '#ffffff'
  },
  LVL: {
    bg: 'rgba(8, 22, 35, 0.95)',
    border: 'rgba(0, 242, 254, 0.90)',
    text: '#ffffff'
  }
};

/**
 * Billboard Canvas Layout Dimensions (256x256)
 */
export const BILLBOARD_LAYOUT = {
  CANVAS_SIZE: 256,
  AVATAR_CX: 128,
  AVATAR_CY: 62,
  AVATAR_R: 42,
  DOUBLE_BORDER_GAP: 4,
  NAME_Y: 128,
  NAME_FONT: 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  PILL_Y: 154,
  PILL_H: 22,
  PILL_GAP: 6,
  PILL_FONT: 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  PILL_SCALE: 2.5
};

/**
 * Donor coin thresholds
 */
export const DONOR_RANK_THRESHOLDS = {
  TOP1: 25000,
  TOP2: 15000,
  TOP3: 5000,
  VIP: 1000
};
