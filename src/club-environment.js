// src/club-environment.js - InstancedMesh LED floor (1 draw call), VIP stage, DJ booth, moving heads, lasers, fireworks, hearts
import * as THREE from 'three';

export const PURPLE_FLOOR_PALETTE = [
  new THREE.Color(0x8A2BE2), // BlueViolet
  new THREE.Color(0x9400D3), // DarkViolet
  new THREE.Color(0xBA55D3), // MediumOrchid
  new THREE.Color(0x4B0082), // Indigo
  new THREE.Color(0xDDA0DD)  // Plum
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
  const minX = -7.5;
  const maxX = 7.5;
  const minZ = -7.5;
  const maxZ = 7.5;
  return {
    x: Math.max(minX, Math.min(maxX, Number(target?.x || 0))),
    y: Number(target?.y || 0),
    z: Math.max(minZ, Math.min(maxZ, Number(target?.z || 0)))
  };
}

export const BACK_WALL_CONFIG = {
  z: -14.5
};

const NEON_PALETTE = [
  new THREE.Color(0x00f2fe), // Cyan
  new THREE.Color(0xff007f), // Hot Pink
  new THREE.Color(0x7f00ff), // Purple
  new THREE.Color(0xffe600)  // Yellow
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

    this.wavePhase = 0;
    this.time = 0;

    this.init();
  }

  init() {
    this.createLedFloor();
    this.createVipPodium();
    this.createDjBooth();
    this.createWallsAndNeon();
    this.createAccentLights();
    this.createMovingHeads();
    this.createLaserBeams();
    this.createFireworksSystem();
    this.createFlyingHeartsSystem();
  }

  /**
   * Dedicated warm accent lights for DJ console and Bar lounge.
   */
  createAccentLights() {
    // DJ Console Overhead Spotlight
    const djSpot = new THREE.SpotLight(0x00f2fe, 3.5, 14, Math.PI / 5, 0.4);
    djSpot.position.set(0, 6.0, -9.5);
    djSpot.target.position.set(0, 1.6, -10.25);
    this.scene.add(djSpot);
    this.scene.add(djSpot.target);

    // Warm Amber PointLight for Bar Lounge
    const barLight = new THREE.PointLight(0xffaa44, 2.5, 12);
    barLight.position.set(-7.5, 3.5, 0);
    this.scene.add(barLight);
  }

  /**
   * 12x12 LED Dance Floor Matrix (144 tiles) via InstancedMesh (Exact 1 Draw Call).
   */
  createLedFloor() {
    const tileGeom = new THREE.BoxGeometry(FLOOR_GRID_CONFIG.tileSize, 0.2, FLOOR_GRID_CONFIG.tileSize);
    const tileMat = new THREE.MeshStandardMaterial({
      color: 0x220538,
      emissive: FLOOR_EMISSIVE_CONFIG.baseEmissive,
      emissiveIntensity: FLOOR_EMISSIVE_CONFIG.emissiveIntensity,
      metalness: 0.8,
      roughness: 0.15
    });

    const count = FLOOR_GRID_CONFIG.count;
    this.floorMesh = new THREE.InstancedMesh(tileGeom, tileMat, count);
    this.floorMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

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

        // Initial cyberpunk purple color
        const baseCol = PURPLE_FLOOR_PALETTE[(r + c) % PURPLE_FLOOR_PALETTE.length];
        this.floorMesh.setColorAt(idx, baseCol);
        idx++;
      }
    }

    this.floorMesh.instanceMatrix.needsUpdate = true;
    if (this.floorMesh.instanceColor) this.floorMesh.instanceColor.needsUpdate = true;
    this.scene.add(this.floorMesh);
  }

  /**
   * VIP Podium Stage for Top 1 donor and Tier 3+ gifts.
   */
  createVipPodium() {
    const stageGroup = new THREE.Group();
    stageGroup.position.set(0, 0.4, -3.5);

    // Main circular base
    const baseGeom = new THREE.CylinderGeometry(2.2, 2.4, 0.8, 32);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      metalness: 0.8,
      roughness: 0.2
    });
    const baseMesh = new THREE.Mesh(baseGeom, baseMat);
    stageGroup.add(baseMesh);

    // Gold decorative rim
    const rimGeom = new THREE.TorusGeometry(2.3, 0.08, 16, 48);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x332200
    });
    const rimMesh = new THREE.Mesh(rimGeom, rimMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = 0.4;
    stageGroup.add(rimMesh);

    // Glowing stage top glass
    const glassGeom = new THREE.CylinderGeometry(2.1, 2.1, 0.05, 32);
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xff007f,
      emissive: 0x770033,
      metalness: 0.5,
      roughness: 0.1,
      transparent: true,
      opacity: 0.9
    });
    const glassMesh = new THREE.Mesh(glassGeom, glassMat);
    glassMesh.position.y = 0.42;
    stageGroup.add(glassMesh);

    this.scene.add(stageGroup);
  }

  /**
   * Pioneer DJ Booth with rotating vinyl decks and animated DJ Mascot.
   */
  createDjBooth() {
    const djGroup = new THREE.Group();
    djGroup.position.set(0, 0, -10.25); // Flush with floor top edge (Z = -9.55m)

    // DJ Table
    const tableGeom = new THREE.BoxGeometry(4.5, 1.6, 1.4);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x0f0f18,
      metalness: 0.7,
      roughness: 0.3
    });
    const table = new THREE.Mesh(tableGeom, tableMat);
    table.position.y = 0.8;
    djGroup.add(table);

    // 2 Rotating Vinyl Decks
    const vinylGeom = new THREE.CylinderGeometry(0.45, 0.45, 0.04, 24);
    const vinylMat = new THREE.MeshStandardMaterial({
      color: 0x050505,
      roughness: 0.1,
      metalness: 0.9
    });

    this.turntableL = new THREE.Mesh(vinylGeom, vinylMat);
    this.turntableL.position.set(-1.1, 1.62, 0);
    djGroup.add(this.turntableL);

    this.turntableR = new THREE.Mesh(vinylGeom, vinylMat);
    this.turntableR.position.set(1.1, 1.62, 0);
    djGroup.add(this.turntableR);

    // Center Mixer with LED lines
    const mixerGeom = new THREE.BoxGeometry(0.8, 0.06, 0.9);
    const mixerMat = new THREE.MeshStandardMaterial({ color: 0x1e1e2d, metalness: 0.6 });
    const mixer = new THREE.Mesh(mixerGeom, mixerMat);
    mixer.position.set(0, 1.63, 0);
    djGroup.add(mixer);

    // DJ Mascot (Robot/Bear with glowing shades)
    this.djMascot = new THREE.Group();
    this.djMascot.position.set(0, 1.6, -0.6);

    // Mascot Body
    const mascotBodyGeom = new THREE.BoxGeometry(0.8, 1.0, 0.6);
    const mascotMat = new THREE.MeshStandardMaterial({ color: 0x334466, roughness: 0.4 });
    const mascotBody = new THREE.Mesh(mascotBodyGeom, mascotMat);
    mascotBody.position.y = 0.5;
    this.djMascot.add(mascotBody);

    // Mascot Head
    this.djMascotHead = new THREE.Group();
    this.djMascotHead.position.set(0, 1.2, 0);
    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.6, 0.6), mascotMat);
    this.djMascotHead.add(headMesh);

    // Glowing Neon Shades
    const shadesMat = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      emissive: 0x00f2fe,
      emissiveIntensity: 2.0
    });
    const shades = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.15, 0.1), shadesMat);
    shades.position.set(0, 0.05, 0.32);
    this.djMascotHead.add(shades);
    this.djMascot.add(this.djMascotHead);

    // Scratching Hand (Right Arm)
    this.djMascotHand = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.6, 0.2), mascotMat);
    this.djMascotHand.position.set(0.65, 0.8, 0.4);
    this.djMascotHand.rotation.x = -Math.PI / 3;
    this.djMascot.add(this.djMascotHand);

    djGroup.add(this.djMascot);
    this.scene.add(djGroup);
  }

  /**
   * Nightclub boundary walls and 3D Neon sign.
   */
  createWallsAndNeon() {
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x070710,
      roughness: 0.9,
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
      emissiveIntensity: 2.5
    });
    this.neonBar = new THREE.Mesh(new THREE.BoxGeometry(10, 0.5, 0.2), neonBarMat);
    this.neonBar.position.set(0, 9.5, BACK_WALL_CONFIG.z + 0.3);
    this.scene.add(this.neonBar);
  }

  /**
   * 4 Moving Head Spotlights at ceiling corners with dance floor bounds clamping.
   */
  createMovingHeads() {
    const positions = [
      [-7.0, 9.0, -7.0],
      [7.0, 9.0, -7.0],
      [-7.0, 9.0, 7.0],
      [7.0, 9.0, 7.0]
    ];

    const coneGeom = new THREE.CylinderGeometry(0.12, 1.8, 16, 16, 1, true);
    coneGeom.rotateX(Math.PI / 2);
    coneGeom.translate(0, 0, 8); // Tip at (0,0,0), base at (0,0,16)

    for (let i = 0; i < positions.length; i++) {
      const p = positions[i];
      const headGroup = new THREE.Group();
      headGroup.position.set(p[0], p[1], p[2]);

      const col = NEON_PALETTE[i % NEON_PALETTE.length];
      const coneMat = new THREE.MeshBasicMaterial({
        color: col,
        transparent: true,
        opacity: 0.28,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
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
        spot,
        baseCol: col,
        speed: 1.0 + i * 0.2,
        isFocused: false,
        focusTarget: null,
        focusTimer: 0,
        currentAim: null
      });
    }
  }

  /**
   * Focuses moving head spotlights based on donation tier:
   * Tier 1: 1 spotlight focuses on donor
   * Tier 2: 2 spotlights focus on donor
   * Tier 3/4: All 4 spotlights converge on VIP podium and whale donor
   */
  focusSpotlights(tier = 1, targetPosition = null, duration = 4.0) {
    const numSpots = tier >= 3 ? 4 : (tier === 2 ? 2 : 1);
    const podiumTarget = { x: 0, y: 0.8, z: -3.5 };
    const clampedTarget = targetPosition ? clampSpotlightToFloor(targetPosition) : podiumTarget;

    for (let i = 0; i < this.movingHeads.length; i++) {
      const mh = this.movingHeads[i];
      if (i < numSpots) {
        mh.isFocused = true;
        mh.focusTimer = duration;
        mh.focusTarget = tier >= 3
          ? (i < 2 ? podiumTarget : clampedTarget)
          : clampedTarget;
        if (mh.spot && mh.spot.color?.setHex) {
          mh.spot.color.setHex(tier >= 3 ? 0xffd700 : (tier === 2 ? 0x00f2fe : mh.baseCol.getHex()));
        }
      }
    }
  }

  /**
   * 6 Additive Laser Cones with AdditiveBlending and depthWrite: false.
   */
  createLaserBeams() {
    const beamGeom = new THREE.CylinderGeometry(0.04, 0.08, 16, 8);
    beamGeom.translate(0, 8, 0);

    const laserMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    for (let i = 0; i < 6; i++) {
      const laser = new THREE.Mesh(beamGeom, laserMat.clone());
      laser.position.set(-5 + i * 2, 8.5, -10.25);
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

  triggerFireworks(tier = 1, origin = new THREE.Vector3(0, 1.5, -3.5)) {
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

    // 1. LED Floor wave pulse based on Bass with vibrant purple palette & minimum emissive glow
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

    // 2. DJ Vinyl Decks Rotation & Mascot Animation
    const djSpinSpeed = 4.0 * delta * (1.0 + bass * 0.01);
    if (this.turntableL) this.turntableL.rotation.y += djSpinSpeed;
    if (this.turntableR) this.turntableR.rotation.y += djSpinSpeed;

    if (this.djMascotHead) {
      this.djMascotHead.rotation.x = Math.sin(this.time * 8.0) * 0.15;
    }
    if (this.djMascotHand) {
      this.djMascotHand.rotation.z = Math.sin(this.time * 6.0) * 0.3;
    }

    // 3. Moving Heads locked 100% to floor surface targets via lookAt and spot.target
    for (let i = 0; i < this.movingHeads.length; i++) {
      const mh = this.movingHeads[i];
      if (mh.isFocused) {
        mh.focusTimer -= delta;
        if (mh.focusTimer <= 0) {
          mh.isFocused = false;
          if (mh.spot && mh.spot.color?.setHex) mh.spot.color.copy(mh.baseCol);
        }
      }

      let rawTarget;
      if (mh.isFocused && mh.focusTarget) {
        rawTarget = mh.focusTarget;
      } else {
        // Distinct, smooth floor trajectories for each moving head strictly on dance floor
        if (i === 0) {
          rawTarget = { x: -3.5 + 2.5 * Math.sin(this.time * 0.85), y: 0, z: -3.5 + 2.5 * Math.cos(this.time * 0.95) };
        } else if (i === 1) {
          rawTarget = { x: 3.5 + 2.5 * Math.cos(this.time * 0.90 + 1.0), y: 0, z: -3.5 + 2.5 * Math.sin(this.time * 0.80 + 0.5) };
        } else if (i === 2) {
          rawTarget = { x: -3.5 + 2.5 * Math.sin(this.time * 0.75 + 2.0), y: 0, z: 3.5 + 2.5 * Math.cos(this.time * 1.0) };
        } else {
          rawTarget = { x: 3.5 + 2.5 * Math.cos(this.time * 0.80 + 3.0), y: 0, z: 3.5 + 2.5 * Math.sin(this.time * 0.90 + 1.5) };
        }
      }

      const clamped = clampSpotlightToFloor(rawTarget);
      const targetVec = new THREE.Vector3(clamped.x, clamped.y || 0, clamped.z);

      if (!mh.currentAim) mh.currentAim = targetVec.clone();
      const aimSpeed = mh.isFocused ? 6.0 : 2.5;
      mh.currentAim.lerp(targetVec, Math.min(1.0, delta * aimSpeed));

      // Point the 3D visual cone mesh directly at floor target
      mh.group.lookAt(mh.currentAim.x, mh.currentAim.y, mh.currentAim.z);

      // Point Three.js SpotLight directly at floor target
      if (mh.spot && mh.spot.target) {
        mh.spot.target.position.copy(mh.currentAim);
      }

      mh.spot.intensity = (mh.isFocused ? 8.0 : 4.5) + (bands.midsFlux || 0) * 0.05;
    }

    // 4. Laser Beams Strobe & Angle driven by Treble
    for (let i = 0; i < this.laserBeams.length; i++) {
      const lb = this.laserBeams[i];
      lb.mesh.rotation.z = Math.sin(this.time * 3.0 + lb.offset) * 0.35;
      lb.mesh.rotation.x = Math.cos(this.time * 2.0 + lb.offset) * 0.25;

      const flash = treble > 80 ? Math.random() * 0.8 : 0.3;
      lb.mesh.material.opacity = flash;
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
  }
}
