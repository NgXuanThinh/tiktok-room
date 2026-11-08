// src/club-environment.js - InstancedMesh LED floor (1 draw call), VIP stage, DJ booth, moving heads, lasers, fireworks, hearts
import * as THREE from 'three';
import { GiftPropsManager } from './gift-props.js';
import {
  sharedChubbyMochiGeometry,
  sharedHornGeom,
  sharedHeadbandGeom,
  sharedEarcupGeom
} from './slime-model.js';

export const PURPLE_FLOOR_PALETTE = [
  new THREE.Color(0x8A2BE2), // BlueViolet
  new THREE.Color(0x9400D3), // DarkViolet
  new THREE.Color(0xBA55D3), // MediumOrchid
  new THREE.Color(0x4B0082), // Indigo
  new THREE.Color(0xDDA0DD)  // Plum
];

export const NEON_PALETTE = [
  new THREE.Color(0x00f2fe), // Cyan
  new THREE.Color(0xff007f), // Hot Pink
  new THREE.Color(0x7928ca), // Neon Purple
  new THREE.Color(0xffd700), // Gold
  new THREE.Color(0x00ff88), // Neon Green
  new THREE.Color(0xff6b00)  // Neon Orange
];

export const FLOOR_EMISSIVE_CONFIG = {
  baseEmissive: 0x3b0066,
  emissiveIntensity: 0.65,
  minPulseBrightness: 0.25
};

export const FLOOR_GRID_CONFIG = {
  rows: 12,
  cols: 12,
  tileSize: 1.5,
  tileSpacing: 1.6,
  centerZ: 0,
  get count() { return this.rows * this.cols; }
};

export function clampSpotlightToFloor(target = { x: 0, y: 0, z: 0 }) {
  const minX = -8.8;
  const maxX = 8.8;
  const minZ = -10.5;
  const maxZ = 8.8;
  return {
    x: Math.max(minX, Math.min(maxX, Number(target?.x || 0))),
    y: Math.max(0, Number(target?.y || 0)),
    z: Math.max(minZ, Math.min(maxZ, Number(target?.z || 0)))
  };
}

export const BACK_WALL_CONFIG = {
  z: -14.5
};

// 4 Alternating Spotlight Colors (Yellow, Blue, Green, Red)
export const SPOTLIGHT_4_PALETTE = [
  new THREE.Color(0xffe600), // Yellow
  new THREE.Color(0x0088ff), // Blue
  new THREE.Color(0x00ff66), // Green
  new THREE.Color(0xff2244)  // Red
];

export class ClubEnvironment {
  constructor(scene) {
    this.scene = scene || new THREE.Scene();

    // Components
    this.floorMesh = null;
    this.turntableL = null;
    this.turntableR = null;
    this.djMascot = null;
    this.djMascotHead = null;
    this.djMascotHand = null;

    this.movingHeads = [];
    this.laserBeams = [];
    this.fireworksPoints = null;
    this.fireworksData = [];
    this.heartParticles = null;
    this.heartData = [];
    this.starfieldPoints = null;
    this.starData = [];

    // Categorized Donation VFX Systems
    this.droppingCoinsMesh = null;
    this.droppingCoinsData = [];
    this.droppingCoinsDummy = null;
    this.activeOrbitRings = [];
    this.activeShockwaves = [];
    this.mythicCrownMesh = null;
    this.mythicCrownActive = false;
    this.mythicCrownTimer = 0;
    this.mythicCrownDuration = 7.6;
    this.mythicCrownOrigin = new THREE.Vector3();

    // 3D Signature Gift Props Manager (Jet, Disco ball, Money gun, Rose, etc.)
    this.giftProps = new GiftPropsManager(this.scene);

    this.wavePhase = 0;
    this.time = 0;

    this.init();
  }

  init() {
    this.createLedFloor();
    this.createVipPodium();
    this.createDjBooth();
    this.createWallsAndNeon();
    this.createStarfield();
    this.createAccentLights();
    this.createMovingHeads();
    this.createLaserBeams();
    this.createFireworksSystem();
    this.createFlyingHeartsSystem();
    this.createLightBeams();
    this.createDroppingCoinsSystem();
    this.createShockwaveSystem();
    this.createMythicCrownSystem();
  }

  /**
   * Twinkling Starfield System across the midnight sky ("Không gian tối như đêm. Nhưng có sao.").
   */
  createStarfield() {
    const starCount = 1200;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    this.starData = [];

    const starPalette = [
      new THREE.Color(0xffffff), // Pure White
      new THREE.Color(0xaae6ff), // Cyan Ice
      new THREE.Color(0xfffae6), // Warm Star
      new THREE.Color(0xdda0dd)  // Lavender Star
    ];

    for (let i = 0; i < starCount; i++) {
      const x = (Math.random() - 0.5) * 70;
      const y = 3.5 + Math.random() * 28;
      const z = (Math.random() - 0.5) * 70;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const col = starPalette[Math.floor(Math.random() * starPalette.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      this.starData.push({
        baseR: col.r,
        baseG: col.g,
        baseB: col.b,
        speed: 1.0 + Math.random() * 3.0,
        phase: Math.random() * Math.PI * 2
      });
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.starfieldPoints = new THREE.Points(geom, mat);
    this.scene.add(this.starfieldPoints);
  }

  /**
   * Dedicated warm accent lights for DJ console and Bar lounge.
   */
  createAccentLights() {
    // DJ Console Overhead Spotlight
    const djSpot = new THREE.SpotLight(0x00f2fe, 5.0, 20, Math.PI / 4, 0.4);
    djSpot.position.set(0, 7.0, -9.5);
    djSpot.target.position.set(0, 1.6, -10.25);
    this.scene.add(djSpot);
    this.scene.add(djSpot.target);

    // Warm Amber PointLight for Bar Lounge
    const barLight = new THREE.PointLight(0xffaa55, 3.5, 16);
    barLight.position.set(-7.5, 4.0, 0);
    this.scene.add(barLight);

    // Vibrant Purple PointLight for Right Lounge
    const rightFill = new THREE.PointLight(0xd946ef, 3.0, 16);
    rightFill.position.set(7.5, 4.0, 0);
    this.scene.add(rightFill);

    // Dedicated VIP Lounge Spotlights flanking DJ (Steady architectural illumination, no strobe)
    const leftVipSpot = new THREE.SpotLight(0xffd700, 5.0, 20, Math.PI / 4, 0.6);
    leftVipSpot.position.set(-5.4, 8.0, -9.5);
    leftVipSpot.target.position.set(-5.4, 0.48, -10.9);
    this.scene.add(leftVipSpot);
    this.scene.add(leftVipSpot.target);
    this.leftVipSpot = leftVipSpot;

    const rightVipSpot = new THREE.SpotLight(0x00f2fe, 4.2, 20, Math.PI / 4, 0.6);
    rightVipSpot.position.set(5.4, 8.0, -9.5);
    rightVipSpot.target.position.set(5.4, 0.38, -10.9);
    this.scene.add(rightVipSpot);
    this.scene.add(rightVipSpot.target);
    this.rightVipSpot = rightVipSpot;
  }

  /**
   * 12x12 LED Dance Floor Matrix (144 tiles) via InstancedMesh (Exact 1 Draw Call).
   * Restored to original cyberpunk violet/purple palette per user feedback.
   */
  createLedFloor() {
    // 1. Solid stage deck subfloor underneath to eliminate any light leakage through tile gaps
    const subFloorGeom = new THREE.BoxGeometry(
      FLOOR_GRID_CONFIG.cols * FLOOR_GRID_CONFIG.tileSpacing + 1.2,
      0.3,
      FLOOR_GRID_CONFIG.rows * FLOOR_GRID_CONFIG.tileSpacing + 1.2
    );
    const subFloorMat = new THREE.MeshStandardMaterial({
      color: 0x140a24,
      metalness: 0.6,
      roughness: 0.4
    });
    this.subFloor = new THREE.Mesh(subFloorGeom, subFloorMat);
    this.subFloor.position.set(0, -0.25, 0);
    this.scene.add(this.subFloor);

    // 2. 12x12 LED Dance Floor Matrix (144 tiles) with purple palette & white border frame
    const tileGeom = new THREE.BoxGeometry(FLOOR_GRID_CONFIG.tileSize, 0.2, FLOOR_GRID_CONFIG.tileSize);
    const tileMat = new THREE.MeshStandardMaterial({
      color: 0x4B0082,
      emissive: FLOOR_EMISSIVE_CONFIG.baseEmissive,
      emissiveIntensity: FLOOR_EMISSIVE_CONFIG.emissiveIntensity,
      metalness: 0.8,
      roughness: 0.15
    });

    const count = FLOOR_GRID_CONFIG.count;
    this.floorMesh = new THREE.InstancedMesh(tileGeom, tileMat, count);
    this.floorMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    // Crisp glowing white border frame on top of each purple tile
    const s = FLOOR_GRID_CONFIG.tileSize / 2;
    const b = s - 0.045; // 4.5cm white border
    const borderShape = new THREE.Shape();
    borderShape.moveTo(-s, -s);
    borderShape.lineTo(s, -s);
    borderShape.lineTo(s, s);
    borderShape.lineTo(-s, s);
    borderShape.closePath();

    const borderHole = new THREE.Path();
    borderHole.moveTo(-b, -b);
    borderHole.lineTo(b, -b);
    borderHole.lineTo(b, b);
    borderHole.lineTo(-b, b);
    borderHole.closePath();
    borderShape.holes.push(borderHole);

    const borderGeom = new THREE.ShapeGeometry(borderShape);
    borderGeom.rotateX(-Math.PI / 2); // Lay flat on XZ plane

    const borderMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.9,
      roughness: 0.2,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    this.borderMesh = new THREE.InstancedMesh(borderGeom, borderMat, count);
    this.borderMesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);

    const dummy = new THREE.Object3D();
    const halfCols = (FLOOR_GRID_CONFIG.cols - 1) / 2;
    const halfRows = (FLOOR_GRID_CONFIG.rows - 1) / 2;

    let idx = 0;
    for (let r = 0; r < FLOOR_GRID_CONFIG.rows; r++) {
      for (let c = 0; c < FLOOR_GRID_CONFIG.cols; c++) {
        const x = (c - halfCols) * FLOOR_GRID_CONFIG.tileSpacing;
        const z = (r - halfRows) * FLOOR_GRID_CONFIG.tileSpacing;
        dummy.position.set(x, -0.1, z);
        dummy.updateMatrix();
        this.floorMesh.setMatrixAt(idx, dummy.matrix);

        // White border positioned cleanly on tile top surface (y = 0.003m)
        dummy.position.set(x, 0.003, z);
        dummy.updateMatrix();
        this.borderMesh.setMatrixAt(idx, dummy.matrix);

        // Initial vibrant purple color
        const baseCol = PURPLE_FLOOR_PALETTE[(r + c) % PURPLE_FLOOR_PALETTE.length];
        this.floorMesh.setColorAt(idx, baseCol);
        idx++;
      }
    }

    this.floorMesh.instanceMatrix.needsUpdate = true;
    if (this.floorMesh.instanceColor) this.floorMesh.instanceColor.needsUpdate = true;
    this.scene.add(this.floorMesh);

    this.borderMesh.instanceMatrix.needsUpdate = true;
    this.scene.add(this.borderMesh);
  }

  /**
   * Elevated VIP Lounges flanking the DJ booth for top daily donors.
   * (Center dance floor podium removed per user feedback to open up the dance floor).
   */
  /**
   * Elevated VIP Lounges flanking the DJ booth:
   * - Left VIP Platform (Top 1): Royal Imperial Gold Throne (Elevated 2-tier platform, 3D crown motif, glowing gold crystals, steady illumination)
   * - Right VIP Platform (Top 2): Sleek Platinum Cyan Lounge (Standard 1-tier platform, cyber cyan glass, silver trim)
   * Anti-Flickering Design: Clear vertical separation between borders and glass decks (zero Z-fighting), opaque subplates preventing floor LED bleed.
   */
  createVipPodium() {
    const stageGroup = new THREE.Group();
    stageGroup.position.set(0, 0, 0);

    // Opaque matte subplate material (100% blocks pulsing LED light leakage from dance floor underneath)
    const opaqueSubMat = new THREE.MeshStandardMaterial({
      color: 0x08060c,
      metalness: 0.8,
      roughness: 0.3
    });

    // Dark velvet metal base material
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x140e1e,
      metalness: 0.85,
      roughness: 0.2
    });

    // --- LEFT VIP PLATFORM: TOP 1 IMPERIAL GOLD THRONE (Elevated 0.48m) ---
    const leftVipGroup = new THREE.Group();
    leftVipGroup.position.set(-5.4, 0, -10.9);

    // Tier 1 Base (lower step)
    const leftBaseTier1 = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.26, 2.6), baseMat);
    leftBaseTier1.position.y = 0.13;
    leftVipGroup.add(leftBaseTier1);

    // Tier 2 Base (elevated throne dais)
    const leftBaseTier2 = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.20, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x221808, metalness: 0.9, roughness: 0.15 })
    );
    leftBaseTier2.position.y = 0.36;
    leftVipGroup.add(leftBaseTier2);

    // Opaque light barrier subplate
    const leftOpaqueSub = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.02, 2.2), opaqueSubMat);
    leftOpaqueSub.position.y = 0.45;
    leftVipGroup.add(leftOpaqueSub);

    // Gilded Gold Border (height 0.04m, top at y = 0.48m)
    const leftGoldBorderMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0x664400,
      emissiveIntensity: 0.9,
      metalness: 0.95,
      roughness: 0.08
    });
    const leftBorder = new THREE.Mesh(new THREE.BoxGeometry(4.28, 0.04, 2.28), leftGoldBorderMat);
    leftBorder.position.y = 0.46;
    leftVipGroup.add(leftBorder);

    // Radiant Imperial Gold Glass Deck (Elevated cleanly at y = 0.495m, top at y = 0.51m -> ZERO Z-FIGHTING)
    const leftGoldGlassMat = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      emissive: 0xff8800,
      emissiveIntensity: 1.5,
      metalness: 0.5,
      roughness: 0.1,
      transparent: true,
      opacity: 0.95
    });
    const leftGlass = new THREE.Mesh(new THREE.BoxGeometry(4.16, 0.03, 2.16), leftGoldGlassMat);
    leftGlass.position.y = 0.495;
    leftVipGroup.add(leftGlass);

    // 4 Royal Gold Corner Pillars with glowing crystal caps
    const goldPillarGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.54, 8);
    const goldCrystalGeom = new THREE.SphereGeometry(0.09, 8, 8);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0xffe066,
      emissive: 0xffd700,
      emissiveIntensity: 2.2
    });
    const leftPillarOffsets = [
      [-2.05, -1.05],
      [2.05, -1.05],
      [-2.05, 1.05],
      [2.05, 1.05]
    ];
    for (const [px, pz] of leftPillarOffsets) {
      const pMesh = new THREE.Mesh(goldPillarGeom, leftGoldBorderMat);
      pMesh.position.set(px, 0.27, pz);
      leftVipGroup.add(pMesh);

      const cMesh = new THREE.Mesh(goldCrystalGeom, crystalMat);
      cMesh.position.set(px, 0.57, pz);
      leftVipGroup.add(cMesh);
    }

    // 3D Neon Crown Backdrop for Top 1
    const crownGroup = new THREE.Group();
    crownGroup.position.set(0, 1.35, -1.1);

    const leftSignBoard = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.32, 0.08),
      new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xff9900, emissiveIntensity: 2.2 })
    );
    crownGroup.add(leftSignBoard);

    const crownMat = new THREE.MeshStandardMaterial({
      color: 0xfff088,
      emissive: 0xffd700,
      emissiveIntensity: 2.8,
      metalness: 0.8,
      roughness: 0.1
    });
    // Center Spire
    const spireCenter = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.42, 4), crownMat);
    spireCenter.position.set(0, 0.35, 0);
    crownGroup.add(spireCenter);
    // Left Spire
    const spireL = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.30, 4), crownMat);
    spireL.position.set(-0.52, 0.28, 0);
    crownGroup.add(spireL);
    // Right Spire
    const spireR = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.30, 4), crownMat);
    spireR.position.set(0.52, 0.28, 0);
    crownGroup.add(spireR);

    leftVipGroup.add(crownGroup);
    stageGroup.add(leftVipGroup);

    // --- RIGHT VIP PLATFORM: TOP 2 PLATINUM CYAN LOUNGE (Standard 0.38m) ---
    const rightVipGroup = new THREE.Group();
    rightVipGroup.position.set(5.4, 0, -10.9);

    const rightBase = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.36, 2.4), baseMat);
    rightBase.position.y = 0.18;
    rightVipGroup.add(rightBase);

    // Opaque light barrier subplate
    const rightOpaqueSub = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.02, 2.2), opaqueSubMat);
    rightOpaqueSub.position.y = 0.35;
    rightVipGroup.add(rightOpaqueSub);

    // Silver-Cyan Border (height 0.04m, top at y = 0.38m)
    const rightBorderMat = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      emissive: 0x006688,
      emissiveIntensity: 0.7,
      metalness: 0.85,
      roughness: 0.15
    });
    const rightBorder = new THREE.Mesh(new THREE.BoxGeometry(4.44, 0.04, 2.44), rightBorderMat);
    rightBorder.position.y = 0.36;
    rightVipGroup.add(rightBorder);

    // Cyber Cyan Glass Deck (Elevated cleanly at y = 0.395m, top at y = 0.41m -> ZERO Z-FIGHTING)
    const rightCyanGlassMat = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      emissive: 0x0088cc,
      emissiveIntensity: 1.2,
      metalness: 0.6,
      roughness: 0.1,
      transparent: true,
      opacity: 0.92
    });
    const rightGlass = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.03, 2.2), rightCyanGlassMat);
    rightGlass.position.y = 0.395;
    rightVipGroup.add(rightGlass);

    // 4 Silver-Cyan Corner Pillars with cyan crystal caps
    const silverPillarGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.42, 8);
    const cyanCrystalGeom = new THREE.SphereGeometry(0.08, 8, 8);
    const cyanCrystalMat = new THREE.MeshStandardMaterial({
      color: 0xa5f3fc,
      emissive: 0x00f2fe,
      emissiveIntensity: 2.0
    });
    const rightPillarOffsets = [
      [-2.05, -1.05],
      [2.05, -1.05],
      [-2.05, 1.05],
      [2.05, 1.05]
    ];
    for (const [px, pz] of rightPillarOffsets) {
      const pMesh = new THREE.Mesh(silverPillarGeom, rightBorderMat);
      pMesh.position.set(px, 0.21, pz);
      rightVipGroup.add(pMesh);

      const cMesh = new THREE.Mesh(cyanCrystalGeom, cyanCrystalMat);
      cMesh.position.set(px, 0.45, pz);
      rightVipGroup.add(cMesh);
    }

    // TOP 2 Neon Signboard
    const rightVipSign = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.28, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x00f2fe, emissive: 0x00f2fe, emissiveIntensity: 2.0 })
    );
    rightVipSign.position.set(0, 1.2, -1.1);
    rightVipGroup.add(rightVipSign);

    stageGroup.add(rightVipGroup);

    this.scene.add(stageGroup);
    this.vipPodiumGroup = stageGroup;
  }

  /**
   * Pioneer DJ Booth with rotating vinyl decks and animated DJ Mascot.
   * Restyled to sleek industrial silver-gray per user feedback.
   */
  createDjBooth() {
    const djGroup = new THREE.Group();
    djGroup.position.set(0, 0, -10.25); // Flush with floor top edge (Z = -9.55m)

    // DJ Table - Modern brushed metallic gray
    const tableGeom = new THREE.BoxGeometry(4.5, 1.6, 1.4);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x888fa0, // Sleek brushed silver-gray
      metalness: 0.75,
      roughness: 0.25
    });
    const table = new THREE.Mesh(tableGeom, tableMat);
    table.position.y = 0.8;
    djGroup.add(table);

    // Front Neon LED strip along the gray DJ table
    const stripGeom = new THREE.BoxGeometry(4.4, 0.08, 0.05);
    const stripMat = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      emissive: 0x00f2fe,
      emissiveIntensity: 2.2
    });
    const strip = new THREE.Mesh(stripGeom, stripMat);
    strip.position.set(0, 1.45, 0.71);
    djGroup.add(strip);

    // 2 Rotating Vinyl Decks (Graphite gray)
    const vinylGeom = new THREE.CylinderGeometry(0.45, 0.45, 0.04, 24);
    const vinylMat = new THREE.MeshStandardMaterial({
      color: 0x2e333d,
      roughness: 0.2,
      metalness: 0.8
    });

    this.turntableL = new THREE.Mesh(vinylGeom, vinylMat);
    this.turntableL.position.set(-1.1, 1.62, 0);
    djGroup.add(this.turntableL);

    this.turntableR = new THREE.Mesh(vinylGeom, vinylMat);
    this.turntableR.position.set(1.1, 1.62, 0);
    djGroup.add(this.turntableR);

    // Center Mixer with LED lines (Metallic slate gray)
    const mixerGeom = new THREE.BoxGeometry(0.8, 0.06, 0.9);
    const mixerMat = new THREE.MeshStandardMaterial({
      color: 0x525a69,
      metalness: 0.65,
      roughness: 0.3
    });
    const mixer = new THREE.Mesh(mixerGeom, mixerMat);
    mixer.position.set(0, 1.63, 0);
    djGroup.add(mixer);

    // DJ Mascot: Female Chubby Cyber Slime with Horns & Headphones
    this.djMascot = new THREE.Group();
    this.djMascot.position.set(0, 1.45, -0.6); // Positioned comfortably behind DJ table and mixer

    // DJ Body & Head: Female Chubby Mochi in Cyber Pink jelly
    const djMat = new THREE.MeshStandardMaterial({
      color: 0xff2a85, // Vibrant Cyber Pink
      emissive: 0x660033,
      emissiveIntensity: 0.5,
      roughness: 0.12,
      metalness: 0.08,
      transparent: true,
      opacity: 0.94
    });

    this.djMascotHead = new THREE.Group();
    this.djMascotHead.position.set(0, 0.45, 0);

    const djBodyMesh = new THREE.Mesh(sharedChubbyMochiGeometry, djMat);
    djBodyMesh.scale.set(0.72, 0.72, 0.72);
    this.djMascotHead.add(djBodyMesh);

    // 3D Cute Chibi Girl Eyes
    const eyeGeom = new THREE.SphereGeometry(0.075, 12, 8);
    eyeGeom.scale(1.0, 1.25, 0.4);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x05050e });
    const whiteDotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const eyeL = new THREE.Mesh(eyeGeom, pupilMat);
    eyeL.position.set(-0.20, 0.28, 0.65);
    eyeL.rotation.y = 0.28;
    const specL1 = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), whiteDotMat);
    specL1.position.set(0.02, 0.03, 0.02);
    eyeL.add(specL1);
    this.djMascotHead.add(eyeL);

    const eyeR = new THREE.Mesh(eyeGeom, pupilMat);
    eyeR.position.set(0.20, 0.28, 0.65);
    eyeR.rotation.y = -0.28;
    const specR1 = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), whiteDotMat);
    specR1.position.set(-0.02, 0.03, 0.02);
    eyeR.add(specR1);
    this.djMascotHead.add(eyeR);

    // Cute Cat Smile
    const mouthGeom = new THREE.TorusGeometry(0.055, 0.012, 6, 12, Math.PI * 0.75);
    const mouthMesh = new THREE.Mesh(mouthGeom, pupilMat);
    mouthMesh.position.set(0, 0.16, 0.70);
    mouthMesh.rotation.z = Math.PI * 1.125;
    this.djMascotHead.add(mouthMesh);

    // Cute Blushing Cheeks (Female Chubby)
    const blushGeom = new THREE.CircleGeometry(0.055, 10);
    const blushMat = new THREE.MeshBasicMaterial({
      color: 0xff66aa,
      transparent: true,
      opacity: 0.65,
      depthWrite: false
    });
    const blushL = new THREE.Mesh(blushGeom, blushMat);
    blushL.position.set(-0.32, 0.18, 0.62);
    blushL.rotation.y = -0.45;
    this.djMascotHead.add(blushL);

    const blushR = new THREE.Mesh(blushGeom, blushMat);
    blushR.position.set(0.32, 0.18, 0.62);
    blushR.rotation.y = 0.45;
    this.djMascotHead.add(blushR);

    // Đôi sừng Cyber Devil (Horns)
    const hornMat = new THREE.MeshStandardMaterial({
      color: 0x151520,
      metalness: 0.85,
      roughness: 0.15,
      emissive: 0xff2a85,
      emissiveIntensity: 0.6
    });
    const hornL = new THREE.Mesh(sharedHornGeom, hornMat);
    hornL.position.set(-0.24, 0.58, 0.05);
    hornL.rotation.set(-0.25, 0.15, 0.40);
    hornL.scale.set(0.8, 0.8, 0.8);
    this.djMascotHead.add(hornL);

    const hornR = new THREE.Mesh(sharedHornGeom, hornMat);
    hornR.position.set(0.24, 0.58, 0.05);
    hornR.rotation.set(-0.25, -0.15, -0.40);
    hornR.scale.set(0.8, 0.8, 0.8);
    this.djMascotHead.add(hornR);

    // Tai nghe DJ (Over-ear Headphones)
    const headphonesGroup = new THREE.Group();
    const headbandMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a26,
      metalness: 0.8,
      roughness: 0.2
    });
    const headband = new THREE.Mesh(sharedHeadbandGeom, headbandMat);
    headband.scale.set(0.72, 0.72, 0.72);
    headband.position.set(0, 0.58, 0.02);
    headband.rotation.set(0, 0, -Math.PI * 0.45);
    headphonesGroup.add(headband);

    const earcupMat = new THREE.MeshStandardMaterial({
      color: 0x181825,
      metalness: 0.7,
      roughness: 0.2,
      emissive: 0xff2a85,
      emissiveIntensity: 0.8
    });
    const cupL = new THREE.Mesh(sharedEarcupGeom, earcupMat);
    cupL.scale.set(0.8, 0.8, 0.8);
    cupL.position.set(-0.56, 0.22, 0);
    cupL.rotation.z = Math.PI / 2;
    headphonesGroup.add(cupL);

    const cupR = new THREE.Mesh(sharedEarcupGeom, earcupMat);
    cupR.scale.set(0.8, 0.8, 0.8);
    cupR.position.set(0.56, 0.22, 0);
    cupR.rotation.z = -Math.PI / 2;
    headphonesGroup.add(cupR);

    this.djMascotHead.add(headphonesGroup);
    this.djMascot.add(this.djMascotHead);

    // Scratching Hand (Chibi cute arm reaching to the turntable)
    this.djMascotHand = new THREE.Group();
    this.djMascotHand.position.set(0.60, 0.48, 0.2);

    const armMat = djMat;
    const armMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.10, 0.45, 10), armMat);
    armMesh.rotation.x = -Math.PI / 3;
    armMesh.rotation.z = -Math.PI / 8;
    this.djMascotHand.add(armMesh);

    // Chibi paw touching the vinyl
    const pawMesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), armMat);
    pawMesh.position.set(0.10, -0.22, 0.35);
    this.djMascotHand.add(pawMesh);

    this.djMascot.add(this.djMascotHand);
    djGroup.add(this.djMascot);
    this.scene.add(djGroup);
  }

  /**
   * Nightclub boundary walls and 3D Neon sign (translucent cyber styling to remove pitch-black void).
   */
  createWallsAndNeon() {
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x181028,
      metalness: 0.8,
      roughness: 0.3,
      transparent: true,
      opacity: 0.35,
      side: THREE.FrontSide
    });
    
    // Back Wall (Deepened to Z = -18.5m and widened for full-venue orbit camera clearance)
    this.backWall = new THREE.Mesh(new THREE.BoxGeometry(40, 18, 0.5), wallMat);
    this.backWall.position.set(0, 8, BACK_WALL_CONFIG.z);
    this.scene.add(this.backWall);

    // Neon Logo Bar
    const neonBarMat = new THREE.MeshStandardMaterial({
      color: 0xff007f,
      emissive: 0xff007f,
      emissiveIntensity: 2.8
    });
    this.neonBar = new THREE.Mesh(new THREE.BoxGeometry(10, 0.5, 0.2), neonBarMat);
    this.neonBar.position.set(0, 9.5, BACK_WALL_CONFIG.z + 0.3);
    this.scene.add(this.neonBar);
  }

  /**
   * 8 Moving Head Spotlights across ceiling truss with dance floor bounds clamping.
   */
  createMovingHeads() {
    const positions = [
      [-7.0, 9.0, -7.0], // 0: Back Left Corner
      [7.0, 9.0, -7.0],  // 1: Back Right Corner
      [-7.0, 9.0, 7.0],  // 2: Front Left Corner
      [7.0, 9.0, 7.0],   // 3: Front Right Corner
      [0.0, 9.2, -8.0],  // 4: Overhead Back (DJ & VIP stage)
      [0.0, 9.2, 8.0],   // 5: Overhead Front (Dance floor front)
      [-8.0, 9.2, 0.0],  // 6: Left Perimeter Flank
      [8.0, 9.2, 0.0]    // 7: Right Perimeter Flank
    ];

    // Visual cone: narrow aperture at ceiling fixture (Z = 0, r = 0.10m), wide pool on floor (Z = 16, r = 2.4m)
    const coneGeom = new THREE.CylinderGeometry(0.1, 2.4, 16, 16, 1, true);
    coneGeom.rotateX(-Math.PI / 2);
    coneGeom.translate(0, 0, 8); // Apex at (0,0,0), wide base at (0,0,16)

    for (let i = 0; i < positions.length; i++) {
      const p = positions[i];
      const headGroup = new THREE.Group();
      headGroup.position.set(p[0], p[1], p[2]);

      const col = SPOTLIGHT_4_PALETTE[i % SPOTLIGHT_4_PALETTE.length];
      const coneMat = new THREE.MeshBasicMaterial({
        color: col,
        transparent: true,
        opacity: 0.28,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: true,
        side: THREE.DoubleSide
      });
      const cone = new THREE.Mesh(coneGeom, coneMat);
      headGroup.add(cone);

      const spot = new THREE.SpotLight(col, 5.0, 32, Math.PI / 6, 0.4);
      headGroup.add(spot);

      const spotTarget = new THREE.Object3D();
      this.scene.add(spotTarget);
      spot.target = spotTarget;

      this.scene.add(headGroup);
      this.movingHeads.push({
        group: headGroup,
        cone,
        spot,
        baseCol: col,
        speed: 1.0 + i * 0.15,
        isFocused: false,
        focusTarget: null,
        focusTimer: 0,
        currentAim: null
      });
    }
  }

  /**
   * Harmonized stage light beams for categorized donations:
   * - High tier: White Light Beam shooting down from ceiling
   * - Ultra tier: Golden Pillar of Light for Lion celebration
   */
  createLightBeams() {
    const beamGeom = new THREE.CylinderGeometry(1.2, 2.2, 16, 24, 1, true);

    // Golden Beam (Ultra / Luxury donations >= 6000 coins)
    this.goldenBeamMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.goldenBeam = new THREE.Mesh(beamGeom, this.goldenBeamMat);
    this.goldenBeam.position.set(0, 8, 0);
    this.goldenBeam.visible = false;
    this.scene.add(this.goldenBeam);

    // White Beam (High tier gifts 500-5000 coins: Ánh sáng trắng chiếu xuống)
    this.whiteBeamMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.whiteBeam = new THREE.Mesh(beamGeom, this.whiteBeamMat);
    this.whiteBeam.position.set(0, 8, 0);
    this.whiteBeam.visible = false;
    this.scene.add(this.whiteBeam);

    this.goldenBeamTimer = 0;
    this.isGoldenBeamActive = false;
    this.whiteBeamTimer = 0;
    this.isWhiteBeamActive = false;
  }

  triggerWhiteLightBeam(targetX = 0, targetZ = 0, duration = 2.5) {
    if (!this.whiteBeam) return;
    this.whiteBeam.position.x = targetX;
    this.whiteBeam.position.z = targetZ;
    this.whiteBeam.position.y = 8;
    this.whiteBeam.visible = true;
    if (this.whiteBeamMat) this.whiteBeamMat.opacity = 0.32; // Dimmer opacity so avatar donate effect is clearly visible
    this.whiteBeamTimer = duration;
    this.isWhiteBeamActive = true;
  }

  triggerGoldenLightBeam(targetX = 0, targetZ = 0, duration = 7.6) {
    if (!this.goldenBeam) return;
    this.goldenBeam.position.x = targetX;
    this.goldenBeam.position.z = targetZ;
    this.goldenBeam.position.y = 8;
    this.goldenBeam.visible = true;
    if (this.goldenBeamMat) this.goldenBeamMat.opacity = 0.14; // Soft sheer holographic glow so lion celebration animations shine through clearly without obscuring avatar
    this.goldenBeamTimer = duration;
    this.isGoldenBeamActive = true;
  }

  /**
   * Focuses moving head spotlights based on donation category / tier:
   * - 'small' / Tier 1: 1 spotlight focus on donor (1.5s, Cyan)
   * - 'medium' / Tier 2: 2 spotlights focus on donor (2.5s, Cyan)
   * - 'high' / Tier 3: 6 spotlights focus + White Light Beam (3.5s, White #ffffff)
   * - 'ultra' / Tier 4+: ALL 8 spotlights converge + Golden Beam + Fireworks (7.6s, Gold #ffd700)
   */
  focusSpotlights(categoryOrTier = 1, targetPosition = null, duration = null) {
    let numSpots = 1;
    let spotColor = 0x00f2fe;
    let autoDuration = duration;

    const isUltra = categoryOrTier === 'ultra' || (typeof categoryOrTier === 'number' && categoryOrTier >= 4);
    const isHigh = categoryOrTier === 'high' || (typeof categoryOrTier === 'number' && categoryOrTier === 3);
    const isMedium = categoryOrTier === 'medium' || (typeof categoryOrTier === 'number' && categoryOrTier === 2);

    if (isUltra) {
      numSpots = this.movingHeads.length;
      spotColor = 0xffd700;
      if (autoDuration === null || autoDuration === undefined) autoDuration = 7.6;
    } else if (isHigh) {
      numSpots = (typeof categoryOrTier === 'number' && categoryOrTier === 3) ? this.movingHeads.length : Math.min(6, this.movingHeads.length);
      spotColor = 0xffffff;
      if (autoDuration === null || autoDuration === undefined) autoDuration = 3.5;
    } else if (isMedium) {
      numSpots = 2;
      spotColor = 0x00f2fe;
      if (autoDuration === null || autoDuration === undefined) autoDuration = 2.5;
    } else {
      numSpots = 1;
      spotColor = 0x00f2fe;
      if (autoDuration === null || autoDuration === undefined) autoDuration = 1.5;
    }

    const clampedTarget = targetPosition ? clampSpotlightToFloor(targetPosition) : { x: 0, y: 0.35, z: 0 };
    clampedTarget.y = Math.max(0.35, Number(targetPosition?.y || 0.35));

    for (let i = 0; i < this.movingHeads.length; i++) {
      const mh = this.movingHeads[i];
      if (i < numSpots) {
        mh.isFocused = true;
        mh.focusTimer = autoDuration;
        mh.focusTarget = clampedTarget;
        if (mh.spot && mh.spot.color?.setHex) {
          mh.spot.color.setHex(spotColor);
        }
        if (mh.cone && mh.cone.material) {
          mh.cone.material.opacity = isUltra ? 0.08 : 0.16; // Sheer opacity so 8 overlapping cones do not wash out avatar in front of camera
        }
        if (mh.spot) {
          mh.spot.intensity = isUltra ? 3.5 : 8.0; // Moderate intensity to prevent additive white burnout
        }
      }
    }

    if (targetPosition) {
      if (isUltra) {
        this.triggerGoldenLightBeam(clampedTarget.x, clampedTarget.z, autoDuration);
      } else if (isHigh) {
        this.triggerWhiteLightBeam(clampedTarget.x, clampedTarget.z, Math.min(autoDuration, 2.5));
      }
    }
  }

  /**
   * 6 Additive Laser Cones with AdditiveBlending and depthWrite: false.
   */
  createLaserBeams() {
    const beamGeom = new THREE.CylinderGeometry(0.03, 0.1, 16, 8);
    beamGeom.translate(0, -8, 0); // Apex at ceiling mount (0,0,0), fans downward into club

    const laserMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    for (let i = 0; i < 6; i++) {
      const laser = new THREE.Mesh(beamGeom, laserMat.clone());
      laser.position.set(-3.5 + i * 1.4, 8.5, -9.8);
      this.scene.add(laser);
      this.laserBeams.push({ mesh: laser, offset: i * 0.8 });
    }
  }

  /**
   * 3-Tier Fireworks Particle System (6,000 points buffer).
   */
  createFireworksSystem() {
    const particleCount = 6000;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3 + 1] = -100; // Off-screen initially
      colors[i * 3] = 1;
      colors[i * 3 + 1] = 1;
      colors[i * 3 + 2] = 1;

      this.fireworksData.push({
        active: false,
        vx: 0,
        vy: 0,
        vz: 0,
        life: 0,
        maxLife: 1
      });
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.fireworksPoints = new THREE.Points(geom, mat);
    this.scene.add(this.fireworksPoints);
  }

  /**
   * 3D Flying Hearts Particle Emitter for Likes.
   */
  createFlyingHeartsSystem() {
    const count = 500;
    const geom = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] = -100; // Off-screen
      this.heartData.push({ active: false, x: 0, y: -100, z: 0, vy: 0, theta: 0, life: 0 });
    }

    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xff007f,
      size: 0.25,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    this.heartParticles = new THREE.Points(geom, mat);
    this.scene.add(this.heartParticles);
  }

  triggerFireworks(tier = 1, origin = new THREE.Vector3(0, 1.2, 0)) {
    const posAttr = this.fireworksPoints.geometry.attributes.position;
    const colAttr = this.fireworksPoints.geometry.attributes.color;

    const countToSpawn = tier === 1 ? 120 : tier === 2 ? 300 : tier === 3 ? 600 : 900;
    let spawned = 0;

    // Focused cylindrical fountain over VIP podium / donor Slime (R <= 2.5m)
    for (let i = 0; i < this.fireworksData.length && spawned < countToSpawn; i++) {
      const p = this.fireworksData[i];
      if (!p.active) {
        p.active = true;
        p.life = 0;
        p.maxLife = 1.0 + Math.random() * 1.2;

        const angle = Math.random() * Math.PI * 2;
        const spreadRadius = (Math.random() * 1.2) * (tier >= 3 ? 1.5 : 1.0); // R <= 2.5m
        p.vx = Math.cos(angle) * spreadRadius;
        p.vz = Math.sin(angle) * spreadRadius;
        p.vy = 3.5 + Math.random() * 2.5 + (tier >= 3 ? 1.5 : 0);

        const idx = i * 3;
        posAttr.array[idx] = origin.x + (Math.random() - 0.5) * 0.4;
        posAttr.array[idx + 1] = Math.max(1.2, origin.y);
        posAttr.array[idx + 2] = origin.z + (Math.random() - 0.5) * 0.4;

        // Color (Gold/Yellow for VIP, neon palette otherwise)
        const col = tier >= 3
          ? (Math.random() < 0.6 ? new THREE.Color(0xffd700) : NEON_PALETTE[Math.floor(Math.random() * NEON_PALETTE.length)])
          : NEON_PALETTE[Math.floor(Math.random() * NEON_PALETTE.length)];

        colAttr.array[idx] = col.r;
        colAttr.array[idx + 1] = col.g;
        colAttr.array[idx + 2] = col.b;

        spawned++;
      }
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  }

  emitFlyingHearts(count = 10) {
    const posAttr = this.heartParticles.geometry.attributes.position;
    let spawned = 0;

    for (let i = 0; i < this.heartData.length && spawned < count; i++) {
      const h = this.heartData[i];
      if (!h.active) {
        h.active = true;
        h.x = (Math.random() - 0.5) * 8.0;
        h.y = 0.2;
        h.z = (Math.random() - 0.5) * 8.0;
        h.vy = 2.0 + Math.random() * 2.0;
        h.theta = Math.random() * Math.PI * 2;
        h.life = 0;

        const idx = i * 3;
        posAttr.array[idx] = h.x;
        posAttr.array[idx + 1] = h.y;
        posAttr.array[idx + 2] = h.z;
        spawned++;
      }
    }
    posAttr.needsUpdate = true;
  }

  /**
   * 3D Dropping Coins System with Physics Bouncing & Damping.
   */
  createDroppingCoinsSystem() {
    const coinCount = 200;
    const coinGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.035, 14);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.85,
      roughness: 0.22,
      emissive: 0xffa500,
      emissiveIntensity: 0.35
    });

    this.droppingCoinsMesh = new THREE.InstancedMesh(coinGeom, coinMat, coinCount);
    this.droppingCoinsMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.scene.add(this.droppingCoinsMesh);

    this.droppingCoinsDummy = new THREE.Object3D();
    this.droppingCoinsData = [];

    for (let i = 0; i < coinCount; i++) {
      this.droppingCoinsData.push({
        active: false,
        x: 0,
        y: -100,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        rx: 0,
        ry: 0,
        rz: 0,
        vrx: 0,
        vry: 0,
        vrz: 0,
        scale: 1,
        life: 0,
        maxLife: 2.2
      });
      this.droppingCoinsDummy.position.set(0, -100, 0);
      this.droppingCoinsDummy.updateMatrix();
      this.droppingCoinsMesh.setMatrixAt(i, this.droppingCoinsDummy.matrix);
    }
    this.droppingCoinsMesh.instanceMatrix.needsUpdate = true;
  }

  /**
   * Spawns falling coins with realistic physics bouncing:
   * - 1 coin: Exactly 1 gold coin drops from above avatar head and bounces.
   * - 5 coins: Exactly 5 gold coins fountain upward and shower down.
   * - N coins: Money shower.
   */
  spawnDroppingCoins(origin = new THREE.Vector3(0, 0, 0), count = 1) {
    if (!this.droppingCoinsMesh) return;
    const spawnCount = Math.max(1, Math.min(count, 50));
    let spawned = 0;

    for (let i = 0; i < this.droppingCoinsData.length && spawned < spawnCount; i++) {
      const c = this.droppingCoinsData[i];
      if (!c.active) {
        c.active = true;
        c.life = 0;
        c.scale = 1.0;
        c.maxLife = count === 1 ? 2.0 : 2.5 + Math.random() * 0.5;

        if (count === 1) {
          c.x = origin.x;
          c.y = origin.y + 2.3;
          c.z = origin.z;
          c.vx = (Math.random() - 0.5) * 0.25;
          c.vy = 1.4;
          c.vz = (Math.random() - 0.5) * 0.25;
        } else if (count === 5) {
          c.x = origin.x + (Math.random() - 0.5) * 0.35;
          c.y = origin.y + 2.1 + spawned * 0.12;
          c.z = origin.z + (Math.random() - 0.5) * 0.35;
          const angle = (spawned / 5) * Math.PI * 2 + Math.random() * 0.4;
          const speed = 0.8 + Math.random() * 0.6;
          c.vx = Math.cos(angle) * speed;
          c.vy = 2.2 + Math.random() * 1.2;
          c.vz = Math.sin(angle) * speed;
        } else {
          const r = Math.random() * 1.5;
          const theta = Math.random() * Math.PI * 2;
          c.x = origin.x + Math.cos(theta) * r;
          c.y = origin.y + 2.6 + Math.random() * 1.5;
          c.z = origin.z + Math.sin(theta) * r;
          c.vx = (Math.random() - 0.5) * 1.2;
          c.vy = Math.random() * 1.5;
          c.vz = (Math.random() - 0.5) * 1.2;
        }

        c.rx = Math.random() * Math.PI;
        c.ry = Math.random() * Math.PI;
        c.rz = Math.random() * Math.PI;
        c.vrx = 4 + Math.random() * 10;
        c.vry = 4 + Math.random() * 10;
        c.vrz = 4 + Math.random() * 10;
        spawned++;
      }
    }
  }

  /**
   * Spawns 1 to 5 semi-transparent glowing coin rings orbiting around the avatar:
   * 20 coins -> 1 ring; 50 -> 2; 100 -> 3; 200 -> 4; 350+ -> 5 rings.
   * Sheer opacity ~0.52 so avatar inside remains clearly visible!
   */
  spawnOrbitingCoinRings(origin = new THREE.Vector3(0, 0, 0), coins = 20, duration = 3.6) {
    let ringCount = 1;
    if (coins >= 350) ringCount = 5;
    else if (coins >= 200) ringCount = 4;
    else if (coins >= 100) ringCount = 3;
    else if (coins >= 50) ringCount = 2;
    else ringCount = 1;

    const parentGroup = new THREE.Group();
    parentGroup.position.set(origin.x, origin.y + 0.45, origin.z);
    parentGroup.scale.set(0.01, 0.01, 0.01);

    const ringTilts = [
      { tiltX: 0.26, tiltZ: 0.17, radius: 0.85, y: 0.0, speed: 2.2 },
      { tiltX: -0.42, tiltZ: 0.35, radius: 0.98, y: 0.14, speed: -2.6 },
      { tiltX: 0.55, tiltZ: -0.38, radius: 1.12, y: -0.12, speed: 3.0 },
      { tiltX: -0.65, tiltZ: -0.52, radius: 1.25, y: 0.26, speed: -3.4 },
      { tiltX: 0.35, tiltZ: 0.75, radius: 1.38, y: -0.22, speed: 3.8 }
    ];

    const childRings = [];
    const coinDiscGeom = new THREE.CylinderGeometry(0.09, 0.09, 0.02, 12);
    const coinDiscMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0xff9900,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.52, // Opacity mờ để thấy rõ avatar
      depthWrite: false
    });

    for (let k = 0; k < ringCount; k++) {
      const cfg = ringTilts[k];
      const ringGroup = new THREE.Group();
      ringGroup.position.y = cfg.y;
      ringGroup.rotation.x = cfg.tiltX;
      ringGroup.rotation.z = cfg.tiltZ;

      const trackGeom = new THREE.TorusGeometry(cfg.radius, 0.012, 6, 36);
      const trackMat = new THREE.MeshBasicMaterial({
        color: 0xffd700,
        transparent: true,
        opacity: 0.28,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const track = new THREE.Mesh(trackGeom, trackMat);
      track.rotation.x = Math.PI / 2;
      ringGroup.add(track);

      const numCoinsOnRing = 6 + k;
      for (let i = 0; i < numCoinsOnRing; i++) {
        const theta = (i / numCoinsOnRing) * Math.PI * 2;
        const coin = new THREE.Mesh(coinDiscGeom, coinDiscMat);
        coin.position.set(Math.cos(theta) * cfg.radius, 0, Math.sin(theta) * cfg.radius);
        coin.rotation.y = -theta;
        coin.rotation.z = Math.PI / 2;
        ringGroup.add(coin);
      }

      parentGroup.add(ringGroup);
      childRings.push({ group: ringGroup, speed: cfg.speed });
    }

    this.scene.add(parentGroup);

    this.activeOrbitRings.push({
      group: parentGroup,
      childRings,
      coinMat: coinDiscMat,
      duration,
      timer: 0
    });
  }

  /**
   * Expanding Floor Shockwave Ring System.
   */
  createShockwaveSystem() {
    this.activeShockwaves = [];
  }

  triggerShockwave(origin = new THREE.Vector3(0, 0, 0), category = 'high') {
    const isUltra = category === 'ultra';
    const shockGeom = new THREE.RingGeometry(0.75, 0.95, 48);
    shockGeom.rotateX(-Math.PI / 2);

    const shockMat = new THREE.MeshBasicMaterial({
      color: isUltra ? 0xffd700 : 0x00f2fe,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const mesh = new THREE.Mesh(shockGeom, shockMat);
    mesh.position.set(origin.x, 0.025, origin.z);
    mesh.scale.set(0.2, 0.2, 0.2);
    this.scene.add(mesh);

    this.activeShockwaves.push({
      mesh,
      mat: shockMat,
      maxScale: isUltra ? 14.0 : 7.5,
      duration: isUltra ? 1.8 : 1.2,
      timer: 0
    });

    if (isUltra) {
      setTimeout(() => {
        const mesh2 = new THREE.Mesh(shockGeom, shockMat.clone());
        mesh2.position.set(origin.x, 0.025, origin.z);
        mesh2.scale.set(0.2, 0.2, 0.2);
        this.scene.add(mesh2);
        this.activeShockwaves.push({
          mesh: mesh2,
          mat: mesh2.material,
          maxScale: 11.0,
          duration: 1.5,
          timer: 0
        });
      }, 250);
    }
  }

  /**
   * Floating Mythic Royal Crown for Ultra / Luxury Tier donations.
   */
  createMythicCrownSystem() {
    const crownGroup = new THREE.Group();

    const bandGeom = new THREE.CylinderGeometry(0.55, 0.55, 0.12, 24, 1, true);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.92,
      roughness: 0.18,
      emissive: 0xffaa00,
      emissiveIntensity: 0.45
    });
    const band = new THREE.Mesh(bandGeom, goldMat);
    crownGroup.add(band);

    const peakGeom = new THREE.ConeGeometry(0.12, 0.35, 8);
    const gemGeom = new THREE.SphereGeometry(0.065, 8, 8);
    const rubyMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
    const diamondMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });

    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const x = Math.cos(angle) * 0.53;
      const z = Math.sin(angle) * 0.53;

      const peak = new THREE.Mesh(peakGeom, goldMat);
      peak.position.set(x, 0.22, z);
      peak.rotation.y = -angle;
      crownGroup.add(peak);

      const gem = new THREE.Mesh(gemGeom, i % 2 === 0 ? rubyMat : diamondMat);
      gem.position.set(x * 1.05, 0.38, z * 1.05);
      crownGroup.add(gem);
    }

    const haloGeom = new THREE.TorusGeometry(0.7, 0.02, 8, 36);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const halo = new THREE.Mesh(haloGeom, haloMat);
    halo.rotation.x = Math.PI / 2;
    halo.position.y = 0.18;
    crownGroup.add(halo);

    crownGroup.visible = false;
    this.scene.add(crownGroup);

    this.mythicCrownMesh = crownGroup;
    this.mythicCrownActive = false;
    this.mythicCrownTimer = 0;
    this.mythicCrownOrigin = new THREE.Vector3();
  }

  triggerMythicCrown(origin = new THREE.Vector3(0, 0, 0), duration = 7.6) {
    if (!this.mythicCrownMesh) return;
    this.mythicCrownMesh.visible = true;
    this.mythicCrownMesh.scale.set(0.01, 0.01, 0.01);
    this.mythicCrownOrigin.copy(origin);
    this.mythicCrownMesh.position.set(origin.x, origin.y + 1.2, origin.z);
    this.mythicCrownActive = true;
    this.mythicCrownTimer = duration;
    this.mythicCrownDuration = duration;
  }

  /**
   * Spawns a 3D signature prop corresponding to a specific donation gift
   * (e.g. Jet, Disco ball, Money gun, Rose, Lion, etc.)
   */
  triggerGiftProp(giftKey, origin = new THREE.Vector3(0, 0, 0), coins = 1) {
    if (this.giftProps) {
      return this.giftProps.trigger(giftKey, origin, coins);
    }
    return null;
  }

  update(delta, bands = {}, camera = null) {
    this.time += delta;
    const bass = bands.bass || 0;
    const mids = bands.mids || 0;
    const treble = bands.treble || 0;

    // 0. Auto-clip Back Wall and Neon Bar when camera is behind them (prevent orbit occlusion)
    const camZ = camera?.position?.z !== undefined ? camera.position.z : 0;
    const isBehindWall = camZ < (BACK_WALL_CONFIG.z + 1.0);
    if (this.backWall) this.backWall.visible = !isBehindWall;
    if (this.neonBar) this.neonBar.visible = !isBehindWall;

    // 1. LED Floor wave pulse based on Bass with vibrant bright purple palette & minimum emissive glow
    this.wavePhase += delta * (2.0 + bass * 0.05);
    const colorHolder = new THREE.Color();
    const halfCols = (FLOOR_GRID_CONFIG.cols - 1) / 2;
    const halfRows = (FLOOR_GRID_CONFIG.rows - 1) / 2;
    let idx = 0;
    for (let r = 0; r < FLOOR_GRID_CONFIG.rows; r++) {
      for (let c = 0; c < FLOOR_GRID_CONFIG.cols; c++) {
        const x = (c - halfCols) * FLOOR_GRID_CONFIG.tileSpacing;
        const z = (r - halfRows) * FLOOR_GRID_CONFIG.tileSpacing;
        const distFromCenter = Math.hypot(x, z);
        const wave = Math.sin(this.wavePhase - distFromCenter * 0.4);
        const intensity = Math.max(
          FLOOR_EMISSIVE_CONFIG.minPulseBrightness,
          (wave + 1) * 0.5 * (1.0 + (bands.bassFlux || 0) * 0.03)
        );

        const baseCol = PURPLE_FLOOR_PALETTE[(r + c) % PURPLE_FLOOR_PALETTE.length];
        colorHolder.copy(baseCol).multiplyScalar(intensity);
        this.floorMesh.setColorAt(idx, colorHolder);
        idx++;
      }
    }
    if (this.floorMesh.instanceColor) this.floorMesh.instanceColor.needsUpdate = true;

    // Twinkling Starfield across the midnight sky ("Không gian tối như đêm. Nhưng có sao.")
    if (this.starfieldPoints && this.starData) {
      const colAttr = this.starfieldPoints.geometry.attributes.color;
      const trebleFlux = (bands.trebleFlux || 0) * 0.01;
      for (let i = 0; i < this.starData.length; i += 3) {
        const s = this.starData[i];
        const twinkle = Math.sin(this.time * s.speed + s.phase) * 0.35 + 0.65 + trebleFlux;
        colAttr.array[i * 3] = s.baseR * twinkle;
        colAttr.array[i * 3 + 1] = s.baseG * twinkle;
        colAttr.array[i * 3 + 2] = s.baseB * twinkle;
      }
      colAttr.needsUpdate = true;
    }

    // 2. DJ Vinyl Decks Rotation & Mascot Animation
    const djSpinSpeed = 4.0 * delta * (1.0 + bass * 0.01);
    if (this.turntableL) this.turntableL.rotation.y += djSpinSpeed;
    if (this.turntableR) this.turntableR.rotation.y += djSpinSpeed;

    const bpmSpeed = 2.0 * Math.PI * (128 / 60);
    const djBounce = Math.abs(Math.sin(this.time * bpmSpeed * 0.5)) * 0.08 + (bands.bassFlux || 0) * 0.04;
    if (this.djMascot) {
      this.djMascot.position.y = 1.45 + djBounce;
    }
    if (this.djMascotHead) {
      this.djMascotHead.rotation.x = Math.sin(this.time * bpmSpeed) * 0.12;
      this.djMascotHead.rotation.z = Math.sin(this.time * bpmSpeed * 0.5) * 0.08;
    }
    if (this.djMascotHand) {
      this.djMascotHand.rotation.z = Math.sin(this.time * 8.0) * 0.35;
      this.djMascotHand.rotation.x = -Math.PI / 3 + Math.cos(this.time * 8.0) * 0.15;
    }

    // 3. 8 Moving Heads locked 100% to floor surface targets via lookAt and spot.target (Never penetrate floor)
    for (let i = 0; i < this.movingHeads.length; i++) {
      const mh = this.movingHeads[i];
      if (mh.isFocused) {
        mh.focusTimer -= delta;
        if (mh.focusTimer <= 0) {
          mh.isFocused = false;
          if (mh.spot && mh.spot.color?.setHex) mh.spot.color.copy(mh.baseCol);
          if (mh.cone && mh.cone.material) mh.cone.material.opacity = 0.28;
        }
      }

      let rawTarget;
      if (mh.isFocused && mh.focusTarget) {
        rawTarget = mh.focusTarget;
      } else {
        // Smooth floor trajectories covering dance floor, entrance, bar, and DJ booth
        // (VIP platforms at x=±5.4, z=-10.9 are preserved with steady architectural lighting to prevent flickering)
        if (i === 0) {
          // Mid-Left: Sweeps left dance floor & side bar (z >= -7.5m, never cuts across VIP)
          rawTarget = { x: -4.8 + 2.0 * Math.sin(this.time * 0.85), y: 0, z: -3.5 + 3.8 * Math.cos(this.time * 0.95) };
        } else if (i === 1) {
          // Mid-Right: Sweeps right dance floor & side bar (z >= -7.5m, never cuts across VIP)
          rawTarget = { x: 4.8 + 2.0 * Math.cos(this.time * 0.90 + 1.0), y: 0, z: -3.5 + 3.8 * Math.sin(this.time * 0.80 + 0.5) };
        } else if (i === 2) {
          // Front-Left: Sweeps front-left entrance & corner bar
          rawTarget = { x: -5.5 + 2.8 * Math.sin(this.time * 0.75 + 2.0), y: 0, z: 4.5 + 3.5 * Math.cos(this.time * 1.0) };
        } else if (i === 3) {
          // Front-Right: Sweeps front-right corner & floor edge
          rawTarget = { x: 5.5 + 2.8 * Math.cos(this.time * 0.80 + 3.0), y: 0, z: 4.5 + 3.5 * Math.sin(this.time * 0.90 + 1.5) };
        } else if (i === 4) {
          // Overhead Back: Sweeps directly over DJ booth, vinyl decks, mixer, and DJ mascot (centered on x=0)
          rawTarget = { x: 1.8 * Math.sin(this.time * 0.9), y: 0, z: -8.8 + 1.4 * Math.cos(this.time * 0.7) };
        } else if (i === 5) {
          // Overhead Front: Sweeps front-center dance floor
          rawTarget = { x: 4.0 * Math.cos(this.time * 0.8), y: 0, z: 4.0 + 3.5 * Math.sin(this.time * 0.75) };
        } else if (i === 6) {
          // Left Flank Center: Wide figure-8 sweeping left dance floor
          rawTarget = { x: -4.5 + 2.5 * Math.cos(this.time * 0.7 + 1.5), y: 0, z: 0.5 + 5.5 * Math.sin(this.time * 1.05) };
        } else {
          // Right Flank Center: Wide figure-8 sweeping right dance floor
          rawTarget = { x: 4.5 + 2.5 * Math.sin(this.time * 0.85 + 2.5), y: 0, z: 0.5 + 5.5 * Math.cos(this.time * 0.95) };
        }
      }

      const clamped = clampSpotlightToFloor(rawTarget);
      const targetVec = new THREE.Vector3(clamped.x, Math.max(0, clamped.y || 0), clamped.z);

      if (!mh.currentAim) mh.currentAim = targetVec.clone();
      const aimSpeed = mh.isFocused ? 6.0 : 2.5;
      mh.currentAim.lerp(targetVec, Math.min(1.0, delta * aimSpeed));
      mh.currentAim.y = Math.max(0, mh.currentAim.y);

      // Point the 3D visual cone mesh directly at floor target
      mh.group.lookAt(mh.currentAim.x, mh.currentAim.y, mh.currentAim.z);

      // Distance from fixture to floor surface target
      const dist = mh.group.position.distanceTo(mh.currentAim);

      // FIX: Scale cone Z axis so its base lands PRECISELY at floor surface (never penetrates floor)
      if (mh.cone) {
        mh.cone.scale.set(1.0, 1.0, Math.max(0.1, dist / 16.0));
      }

      // Point Three.js SpotLight directly at floor target
      if (mh.spot && mh.spot.target) {
        mh.spot.target.position.copy(mh.currentAim);
      }

      if (mh.spot) {
        mh.spot.distance = dist + 0.5;
        mh.spot.intensity = (mh.isFocused ? 8.0 : 4.5) + (bands.midsFlux || 0) * 0.05;
      }
    }

    // 4. Laser Beams Strobe & Angle driven by Treble (Aimed forward at dance floor, never into VIP)
    for (let i = 0; i < this.laserBeams.length; i++) {
      const lb = this.laserBeams[i];
      lb.mesh.rotation.z = Math.sin(this.time * 2.5 + lb.offset) * 0.22;
      lb.mesh.rotation.x = 0.35 + Math.cos(this.time * 2.0 + lb.offset) * 0.15; // Angled forward away from VIP lounges

      const flash = treble > 80 ? Math.random() * 0.7 + 0.2 : 0.3;
      lb.mesh.material.opacity = flash;

      // Laser mount is at y = 8.5. Calculate distance along downward beam until floor (y = 0)
      const cosX = Math.cos(lb.mesh.rotation.x);
      const cosZ = Math.cos(lb.mesh.rotation.z);
      const downwardY = Math.abs(cosX * cosZ);
      const distToFloor = downwardY > 0.01 ? (8.5 / downwardY) : 16.0;
      const scaleY = Math.min(1.0, distToFloor / 16.0);
      lb.mesh.scale.set(1, scaleY, 1);
    }

    // 5. Update Fireworks Particles
    const posAttr = this.fireworksPoints.geometry.attributes.position;
    for (let i = 0; i < this.fireworksData.length; i++) {
      const p = this.fireworksData[i];
      if (p.active) {
        p.life += delta;
        if (p.life >= p.maxLife) {
          p.active = false;
          posAttr.array[i * 3 + 1] = -100;
        } else {
          posAttr.array[i * 3] += p.vx * delta;
          posAttr.array[i * 3 + 1] += p.vy * delta;
          posAttr.array[i * 3 + 2] += p.vz * delta;
          p.vy -= 4.0 * delta; // Gravity
        }
      }
    }
    posAttr.needsUpdate = true;

    // 6. Update Flying Hearts
    const hPos = this.heartParticles.geometry.attributes.position;
    for (let i = 0; i < this.heartData.length; i++) {
      const h = this.heartData[i];
      if (h.active) {
        h.life += delta;
        h.y += h.vy * delta;
        h.theta += 4.0 * delta;
        h.x += Math.sin(h.theta) * delta * 0.5;

        if (h.y > 10.0 || h.life > 4.0) {
          h.active = false;
          hPos.array[i * 3 + 1] = -100;
        } else {
          hPos.array[i * 3] = h.x;
          hPos.array[i * 3 + 1] = h.y;
          hPos.array[i * 3 + 2] = h.z;
        }
      }
    }
    hPos.needsUpdate = true;

    // 7. Fade and rotate White Light Beam (High tier gifts)
    if (this.isWhiteBeamActive && this.whiteBeam) {
      this.whiteBeamTimer -= delta;
      this.whiteBeam.rotation.y += 1.4 * delta;
      if (this.whiteBeamTimer < 0.6) {
        this.whiteBeamMat.opacity = Math.max(0, this.whiteBeamMat.opacity - delta * 1.6);
      }
      if (this.whiteBeamTimer <= 0) {
        this.isWhiteBeamActive = false;
        this.whiteBeam.visible = false;
      }
    }

    // 8. Fade and rotate Golden Beam (Ultra tier gifts)
    if (this.isGoldenBeamActive && this.goldenBeam) {
      this.goldenBeamTimer -= delta;
      this.goldenBeam.rotation.y += 1.5 * delta;
      if (this.goldenBeamTimer < 1.4) {
        this.goldenBeamMat.opacity = Math.max(0, this.goldenBeamMat.opacity - delta * 0.7);
      }
      if (this.goldenBeamTimer <= 0) {
        this.isGoldenBeamActive = false;
        this.goldenBeam.visible = false;
      }
    }

    // 9. Update Dropping 3D Coins (Physics Bouncing & Gravity)
    if (this.droppingCoinsMesh && this.droppingCoinsData) {
      let anyActive = false;
      for (let i = 0; i < this.droppingCoinsData.length; i++) {
        const c = this.droppingCoinsData[i];
        if (c.active) {
          anyActive = true;
          c.life += delta;
          if (c.life >= c.maxLife) {
            c.active = false;
            this.droppingCoinsDummy.position.set(0, -100, 0);
            this.droppingCoinsDummy.updateMatrix();
            this.droppingCoinsMesh.setMatrixAt(i, this.droppingCoinsDummy.matrix);
          } else {
            c.vy -= 9.8 * delta; // Gravity
            c.x += c.vx * delta;
            c.y += c.vy * delta;
            c.z += c.vz * delta;

            c.rx += c.vrx * delta;
            c.ry += c.vry * delta;
            c.rz += c.vrz * delta;

            // Floor collision & bounce
            if (c.y <= 0.035) {
              c.y = 0.035;
              c.vy = -c.vy * 0.42;
              c.vx *= 0.75;
              c.vz *= 0.75;
              c.vrx *= 0.8;
              c.vrz *= 0.8;
            }

            // Smooth scale fade-out in final 25% of life
            const fadeThreshold = c.maxLife * 0.75;
            if (c.life > fadeThreshold) {
              const p = (c.life - fadeThreshold) / (c.maxLife - fadeThreshold);
              c.scale = Math.max(0, 1.0 - p);
            }

            this.droppingCoinsDummy.position.set(c.x, c.y, c.z);
            this.droppingCoinsDummy.rotation.set(c.rx, c.ry, c.rz);
            this.droppingCoinsDummy.scale.set(c.scale, c.scale, c.scale);
            this.droppingCoinsDummy.updateMatrix();
            this.droppingCoinsMesh.setMatrixAt(i, this.droppingCoinsDummy.matrix);
          }
        }
      }
      if (anyActive) {
        this.droppingCoinsMesh.instanceMatrix.needsUpdate = true;
      }
    }

    // 10. Update Orbiting Coin Rings (1 to 5 rings, translucent opacity)
    for (let idx = this.activeOrbitRings.length - 1; idx >= 0; idx--) {
      const ringObj = this.activeOrbitRings[idx];
      ringObj.timer += delta;
      const t = ringObj.timer;
      const dur = ringObj.duration;

      if (t >= dur) {
        this.scene.remove(ringObj.group);
        this.activeOrbitRings.splice(idx, 1);
      } else {
        for (const cr of ringObj.childRings) {
          cr.group.rotation.y += cr.speed * delta;
        }

        let scale = 1.0;
        if (t < 0.35) {
          scale = Math.sin((t / 0.35) * Math.PI * 0.5);
        } else if (t > (dur - 0.5)) {
          const p = (t - (dur - 0.5)) / 0.5;
          scale = Math.cos(p * Math.PI * 0.5);
          if (ringObj.coinMat) ringObj.coinMat.opacity = Math.max(0, 0.52 * (1.0 - p));
        }
        ringObj.group.scale.set(scale, scale, scale);
      }
    }

    // 11. Update Expanding Floor Shockwaves
    for (let idx = this.activeShockwaves.length - 1; idx >= 0; idx--) {
      const sw = this.activeShockwaves[idx];
      sw.timer += delta;
      const p = sw.timer / sw.duration;

      if (p >= 1.0) {
        this.scene.remove(sw.mesh);
        this.activeShockwaves.splice(idx, 1);
      } else {
        const easeOut = 1.0 - Math.pow(1.0 - p, 2.5);
        const currentScale = 0.2 + easeOut * (sw.maxScale - 0.2);
        sw.mesh.scale.set(currentScale, currentScale, currentScale);
        sw.mat.opacity = Math.max(0, 0.85 * (1.0 - Math.pow(p, 1.8)));
      }
    }

    // 12. Update Floating Mythic Royal Crown (Ultra tier)
    if (this.mythicCrownActive && this.mythicCrownMesh) {
      this.mythicCrownTimer -= delta;
      const elapsed = this.mythicCrownDuration - this.mythicCrownTimer;

      this.mythicCrownMesh.rotation.y += 2.2 * delta;

      if (elapsed < 2.5) {
        const p = elapsed / 2.5;
        const currentY = THREE.MathUtils.lerp(this.mythicCrownOrigin.y + 1.2, this.mythicCrownOrigin.y + 5.2, p);
        this.mythicCrownMesh.position.y = currentY;
        const scale = Math.min(1.0, elapsed / 0.5);
        this.mythicCrownMesh.scale.set(scale, scale, scale);
      } else if (elapsed < 6.2) {
        const hover = Math.sin((elapsed - 2.5) * 3.5) * 0.15;
        this.mythicCrownMesh.position.y = this.mythicCrownOrigin.y + 5.2 + hover;
      } else if (elapsed < 7.6) {
        const p = (elapsed - 6.2) / 1.4;
        const currentY = THREE.MathUtils.lerp(this.mythicCrownOrigin.y + 5.2, this.mythicCrownOrigin.y + 1.2, p);
        this.mythicCrownMesh.position.y = currentY;
        if (p > 0.6) {
          const fade = 1.0 - (p - 0.6) / 0.4;
          this.mythicCrownMesh.scale.set(fade, fade, fade);
        }
      } else {
        this.mythicCrownActive = false;
        this.mythicCrownMesh.visible = false;
      }
    }

    // 13. Update 3D Signature Gift Props (Jet, Disco ball, Money gun, Rose, etc.)
    if (this.giftProps) {
      this.giftProps.update(delta);
    }
  }
}
