// src/gift-props.js - Procedural 3D Signature Gift Props & High-Impact Animators
import * as THREE from 'three';

/**
 * Normalizes Vietnamese accents, diacritics, spaces and symbols into a clean ASCII key
 * e.g. "Máy bay" -> "may_bay", "Báo đen" -> "bao_den", "Vũ trụ TikTok" -> "vu_tru_tiktok"
 */
export function normalizeVietnameseKey(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

export class GiftPropsManager {
  constructor(scene) {
    this.scene = scene || new THREE.Scene();
    this.activeProps = [];
  }

  /**
   * Triggers the signature 3D prop animation matching the donated gift.
   * Supports both English codes ('jet', 'panther') and Vietnamese names ('Máy bay', 'Báo đen', 'Vũ trụ').
   */
  trigger(giftKey = 'rose', origin = new THREE.Vector3(0, 0, 0), coins = 1) {
    const raw = String(giftKey || '').toLowerCase();
    const norm = normalizeVietnameseKey(giftKey);
    const words = norm.split('_');
    const prevCount = this.activeProps.length;
    let resolvedKey = 'gift';

    // 1. Private Jet / Phi Cơ Phản Lực (6.000+ xu)
    if (norm.includes('may_bay') || norm.includes('phi_co') || norm.includes('jet') || raw.includes('plane')) {
      resolvedKey = 'jet';
      this._spawnJet(origin);

    // 2. Black Panther / Báo Đen Viền Neon (15.000 xu)
    } else if (norm.includes('bao_den') || norm.includes('panther') || words.includes('panther') || (words.includes('bao') && !words.includes('bong'))) {
      resolvedKey = 'panther';
      this._spawnCyberPanther(origin);

    // 3. Phoenix / Phượng Hoàng Lửa (25.999 xu)
    } else if (norm.includes('phuong_hoang') || norm.includes('phoenix') || norm.includes('chim_lua') || norm.includes('firebird') || words.includes('phuong')) {
      resolvedKey = 'phoenix';
      this._spawnPhoenix(origin);

    // 4. Fire Tiger / Hổ Lửa (19.999 xu)
    } else if (norm.includes('ho_lua') || norm.includes('tiger') || words.includes('tiger') || words.includes('ho')) {
      resolvedKey = 'tiger';
      this._spawnFireTiger(origin);

    // 5. TikTok Universe / Vũ Trụ Dải Ngân Hà (44.999 xu)
    } else if (norm.includes('vu_tru') || norm.includes('universe') || norm.includes('galaxy') || norm.includes('ngan_ha')) {
      resolvedKey = 'universe';
      this._spawnUniverse(origin);

    // 6. Golden Lion / Sư Tử Vàng (29.999 xu)
    } else if (norm.includes('su_tu') || norm.includes('lion') || words.includes('lion')) {
      resolvedKey = 'golden_lion';
      this._spawnGoldenLion(origin);

    // 7. Pegasus / Ngựa Thần Có Cánh (42.999 xu)
    } else if (norm.includes('ngua_than') || norm.includes('pegasus') || words.includes('pegasus') || words.includes('ngua') || norm.includes('bach_ma')) {
      resolvedKey = 'pegasus';
      this._spawnPegasus(origin);

    // 8. Quả Cầu Disco (1.000 xu)
    } else if (norm.includes('qua_cau') || norm.includes('disco') || words.includes('disco')) {
      resolvedKey = 'disco_ball';
      this._spawnDiscoBall(origin);

    // 9. Súng Bắn Tiền / Mưa Tiền (500 xu)
    } else if (norm.includes('sung_ban_tien') || norm.includes('mua_tien') || norm.includes('money') || words.includes('tien') || words.includes('sung')) {
      resolvedKey = 'money_gun';
      this._spawnMoneyGun(origin);

    // 10. Hoa Hồng (1 xu)
    } else if (norm.includes('hoa_hong') || norm.includes('rose') || words.includes('rose') || words.includes('hoa')) {
      resolvedKey = 'rose';
      this._spawnRose(origin);

    // 11. Bắn Tim / Finger Heart (5 xu)
    } else if (norm.includes('ban_tim') || norm.includes('heart') || words.includes('heart') || words.includes('tim')) {
      resolvedKey = 'finger_heart';
      this._spawnFingerHeart(origin);

    // 12. Kính Râm Cyber (199 xu)
    } else if (norm.includes('kinh') || norm.includes('sunglasses') || norm.includes('shades') || words.includes('kinh')) {
      resolvedKey = 'cyber_sunglasses';
      this._spawnCyberSunglasses(origin);

    // 13. Cầu Vồng (100 xu)
    } else if (norm.includes('cau_vong') || norm.includes('rainbow') || words.includes('rainbow')) {
      resolvedKey = 'rainbow';
      this._spawnRainbow(origin);

    // 14. Nón Lá (10 xu)
    } else if (norm.includes('non_la') || norm.includes('hat') || words.includes('non')) {
      resolvedKey = 'conical_hat';
      this._spawnConicalHat(origin);

    // 15. Huyền Thoại Kiếm Excalibur (1.000 xu)
    } else if (norm.includes('huyen_thoai') || norm.includes('excalibur') || words.includes('kiem') || words.includes('sword') || words.includes('guom')) {
      resolvedKey = 'excalibur';
      this._spawnExcalibur(origin);

    // 16. Buổi Hòa Nhạc / Guitar (500 xu)
    } else if (norm.includes('hoa_nhac') || norm.includes('guitar') || norm.includes('concert') || words.includes('dan')) {
      resolvedKey = 'electric_guitar';
      this._spawnElectricGuitar(origin);

    // 17. Bóng Bay Tình Yêu (699 xu)
    } else if (norm.includes('bong_bay') || norm.includes('balloon') || words.includes('bong')) {
      resolvedKey = 'love_balloons';
      this._spawnLoveBalloons(origin);

    } else {
      resolvedKey = 'generic_gift';
      this._spawnGenericGiftProp(origin, norm || raw, coins);
    }

    if (this.activeProps.length > prevCount) {
      const prop = this.activeProps[this.activeProps.length - 1];
      prop.giftKey = resolvedKey;
      return prop;
    }
    return null;
  }

  // =========================================================================
  // 1. 3D Private Jet (Chiếc phi cơ phản lực siêu sang 6.000+ xu)
  // =========================================================================
  _spawnJet(origin) {
    const jetGroup = new THREE.Group();

    // Fuselage (Thân máy bay thon dài 5.5m)
    const bodyGeom = new THREE.CylinderGeometry(0.38, 0.12, 5.5, 20);
    bodyGeom.rotateX(Math.PI / 2);
    const jetMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.95,
      roughness: 0.12,
      emissive: 0x0284c7,
      emissiveIntensity: 0.28
    });
    const body = new THREE.Mesh(bodyGeom, jetMat);
    jetGroup.add(body);

    // Sharp Aerodynamic Chrome Nose Cone
    const noseGeom = new THREE.ConeGeometry(0.38, 1.2, 20);
    noseGeom.rotateX(-Math.PI / 2);
    const noseMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.98, roughness: 0.08 });
    const nose = new THREE.Mesh(noseGeom, noseMat);
    nose.position.z = -3.2;
    jetGroup.add(nose);

    // Cockpit Glass Canopy
    const glassGeom = new THREE.BoxGeometry(0.42, 0.32, 1.4);
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x00f2fe,
      emissiveIntensity: 0.5
    });
    const glass = new THREE.Mesh(glassGeom, glassMat);
    glass.position.set(0, 0.28, -1.2);
    glass.rotation.x = -0.18;
    jetGroup.add(glass);

    // Swept Delta Wings (Sải cánh 5.4m)
    const wingGeom = new THREE.BoxGeometry(5.4, 0.06, 1.3);
    const wing = new THREE.Mesh(wingGeom, jetMat);
    wing.position.set(0, -0.05, -0.2);
    jetGroup.add(wing);

    // Wingtip Strobe Lights (Xanh Cyan / Đỏ)
    const strobeGeom = new THREE.SphereGeometry(0.12, 8, 8);
    const strobeL = new THREE.Mesh(strobeGeom, new THREE.MeshBasicMaterial({ color: 0x00f2fe }));
    strobeL.position.set(-2.7, 0, -0.2);
    const strobeR = new THREE.Mesh(strobeGeom, new THREE.MeshBasicMaterial({ color: 0xff0055 }));
    strobeR.position.set(2.7, 0, -0.2);
    jetGroup.add(strobeL);
    jetGroup.add(strobeR);

    // Twin Jet Turbines & Afterburners (Động cơ phản lực luồng lửa xanh)
    const turbineGeom = new THREE.CylinderGeometry(0.24, 0.24, 1.8, 16);
    turbineGeom.rotateX(Math.PI / 2);
    const turbineMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85 });
    const turbL = new THREE.Mesh(turbineGeom, turbineMat);
    turbL.position.set(-0.85, -0.15, 0.6);
    const turbR = turbL.clone();
    turbR.position.x = 0.85;
    jetGroup.add(turbL);
    jetGroup.add(turbR);

    // Glowing Afterburner Cones
    const burnerGeom = new THREE.ConeGeometry(0.22, 1.6, 14);
    burnerGeom.rotateX(-Math.PI / 2);
    const burnerMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const burnerL = new THREE.Mesh(burnerGeom, burnerMat);
    burnerL.position.set(-0.85, -0.15, 2.2);
    const burnerR = burnerL.clone();
    burnerR.position.x = 0.85;
    jetGroup.add(burnerL);
    jetGroup.add(burnerR);

    // Twin Jet Contrail Smoke Trails (Vệt khói phản lực kéo dài)
    const trailGeom = new THREE.CylinderGeometry(0.08, 0.45, 6.0, 8);
    trailGeom.rotateX(Math.PI / 2);
    const trailMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending
    });
    const trailL = new THREE.Mesh(trailGeom, trailMat);
    trailL.position.set(-0.85, -0.15, 5.5);
    const trailR = trailL.clone();
    trailR.position.x = 0.85;
    jetGroup.add(trailL);
    jetGroup.add(trailR);

    // Vertical Stabilizer & Tail Fin
    const finGeom = new THREE.BoxGeometry(0.06, 1.1, 0.9);
    const fin = new THREE.Mesh(finGeom, jetMat);
    fin.position.set(0, 0.65, 2.0);
    jetGroup.add(fin);

    jetGroup.position.set(origin.x - 14, origin.y + 7.5, origin.z - 12);
    this.scene.add(jetGroup);

    this.activeProps.push({
      group: jetGroup,
      duration: 4.5,
      timer: 0,
      update: (t, dur) => {
        const p = t / dur;
        // 360-degree banked circle sweep around avatar, climbing out
        const theta = p * Math.PI * 2.8;
        const radius = THREE.MathUtils.lerp(12.0, 4.2, Math.sin(p * Math.PI));
        jetGroup.position.x = origin.x + Math.sin(theta) * radius;
        jetGroup.position.z = origin.z + Math.cos(theta) * radius;
        jetGroup.position.y = origin.y + 3.2 + Math.sin(p * Math.PI) * 2.8 + (p > 0.72 ? Math.pow((p - 0.72) / 0.28, 2) * 16.0 : 0);

        // Banked roll along flight direction
        jetGroup.rotation.y = theta + Math.PI / 2;
        jetGroup.rotation.z = Math.sin(theta) * 0.55;
        jetGroup.rotation.x = -0.18 + (p > 0.72 ? 0.45 : 0);

        // Throttle trail pulse
        const pulse = 1.0 + Math.sin(t * 30) * 0.25;
        burnerL.scale.set(pulse, pulse, 1.2 * pulse);
        burnerR.scale.set(pulse, pulse, 1.2 * pulse);
      }
    });
  }

  // =========================================================================
  // 2. 3D Cyber Black Panther (Báo đen viền Neon 15.000 xu)
  // =========================================================================
  _spawnCyberPanther(origin) {
    const pantherGroup = new THREE.Group();

    // Obsidian Black Carbon Material
    const pantherMat = new THREE.MeshStandardMaterial({
      color: 0x050508,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0x110522,
      emissiveIntensity: 0.3
    });

    // Glowing Neon Magenta Wireframe Edge Material
    const neonEdgeMat = new THREE.LineBasicMaterial({
      color: 0xff007f,
      linewidth: 2,
      blending: THREE.AdditiveBlending
    });

    // Helper to add mesh with glowing neon edges
    const addNeonMesh = (geom, pos = [0, 0, 0], rot = [0, 0, 0]) => {
      const mesh = new THREE.Mesh(geom, pantherMat);
      mesh.position.set(...pos);
      mesh.rotation.set(...rot);
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geom), neonEdgeMat);
      mesh.add(edges);
      pantherGroup.add(mesh);
      return mesh;
    };

    // Muscular Torso (Thân báo đen 3.2m)
    const torsoGeom = new THREE.BoxGeometry(0.85, 0.75, 2.6);
    addNeonMesh(torsoGeom, [0, 0.3, 0]);

    // Chest & Shoulders
    const chestGeom = new THREE.BoxGeometry(0.95, 0.85, 1.1);
    addNeonMesh(chestGeom, [0, 0.4, -0.9]);

    // Fierce Predatory Head & Snout
    const headGeom = new THREE.BoxGeometry(0.65, 0.55, 0.85);
    const head = addNeonMesh(headGeom, [0, 0.65, -1.8]);

    // Glowing Neon Eyes (Mắt báo phát sáng vàng hổ phách)
    const eyeGeom = new THREE.SphereGeometry(0.09, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const eyeL = new THREE.Mesh(eyeGeom, eyeMat);
    eyeL.position.set(-0.24, 0.72, -2.15);
    const eyeR = eyeL.clone();
    eyeR.position.x = 0.24;
    pantherGroup.add(eyeL);
    pantherGroup.add(eyeR);

    // Cyber Ears
    const earGeom = new THREE.ConeGeometry(0.14, 0.35, 4);
    const earL = new THREE.Mesh(earGeom, pantherMat);
    earL.position.set(-0.25, 0.98, -1.7);
    earL.rotation.z = -0.3;
    const earR = earL.clone();
    earR.position.x = 0.25;
    earR.rotation.z = 0.3;
    pantherGroup.add(earL);
    pantherGroup.add(earR);

    // 4 Articulated Running/Leaping Cyber Legs
    const legGeom = new THREE.BoxGeometry(0.24, 1.2, 0.32);
    addNeonMesh(legGeom, [-0.48, -0.45, -0.9], [-0.35, 0, 0]); // Front Left
    addNeonMesh(legGeom, [0.48, -0.45, -0.9], [-0.35, 0, 0]);  // Front Right
    addNeonMesh(legGeom, [-0.48, -0.45, 0.9], [0.45, 0, 0]);   // Hind Left
    addNeonMesh(legGeom, [0.48, -0.45, 0.9], [0.45, 0, 0]);    // Hind Right

    // Curved Segmented Cyber Tail with Neon Tip
    const tailGeom = new THREE.CylinderGeometry(0.08, 0.04, 1.6, 8);
    tailGeom.rotateX(-Math.PI / 4);
    const tail = addNeonMesh(tailGeom, [0, 0.45, 1.8]);
    const tipGeom = new THREE.SphereGeometry(0.12, 8, 8);
    const tip = new THREE.Mesh(tipGeom, new THREE.MeshBasicMaterial({ color: 0xff007f }));
    tip.position.set(0, 0.95, 2.4);
    pantherGroup.add(tip);

    // Initial position: start on left flank of stage
    pantherGroup.position.set(origin.x - 9.0, origin.y + 0.8, origin.z);
    pantherGroup.scale.set(1.4, 1.4, 1.4);
    this.scene.add(pantherGroup);

    this.activeProps.push({
      group: pantherGroup,
      duration: 4.0,
      timer: 0,
      update: (t, dur) => {
        const p = t / dur;
        // Parabolic soaring leap from x -9m to x +9m across stage
        pantherGroup.position.x = origin.x - 9.0 + p * 18.0;
        // Apex at 4.6m height directly over avatar
        pantherGroup.position.y = origin.y + 0.8 + Math.sin(p * Math.PI) * 4.6;
        pantherGroup.position.z = origin.z + Math.sin(p * Math.PI * 2) * 1.2;

        // Dynamic pitch rotation along arc trajectory
        pantherGroup.rotation.z = Math.sin((p - 0.5) * Math.PI) * 0.4;
        pantherGroup.rotation.y = Math.PI / 2 + Math.sin(p * Math.PI) * 0.2;

        // Tail sway
        tail.rotation.y = Math.sin(t * 8) * 0.35;
      }
    });
  }

  // =========================================================================
  // 3. 3D Fire Tiger / Hổ Lửa (19.999 xu)
  // =========================================================================
  _spawnFireTiger(origin) {
    this._spawnCyberPanther(origin); // Shared feline kinematics with fire accents
  }

  // =========================================================================
  // 4. 3D TikTok Universe / Dải Ngân Hà Bao Trùm Sân Khấu (44.999 xu)
  // =========================================================================
  _spawnUniverse(origin) {
    const uniGroup = new THREE.Group();

    // 1. Massive 26-Meter Double Spiral Galaxy Disk (Dải Ngân Hà)
    const starCount = 2800;
    const starGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const colorPalette = [
      new THREE.Color(0x00f2fe), // Electric Cyan
      new THREE.Color(0xff007f), // Hot Nebula Magenta
      new THREE.Color(0x7928ca), // Deep Cosmic Violet
      new THREE.Color(0xffd700), // Starlight Gold
      new THREE.Color(0xffffff)  // Pure White
    ];

    for (let i = 0; i < starCount; i++) {
      // 2-arm logarithmic spiral
      const arm = (i % 2) * Math.PI;
      const dist = Math.pow(Math.random(), 1.8) * 13.0; // Spans up to 13m radius (26m diameter)
      const theta = arm + dist * 0.65 + (Math.random() - 0.5) * 0.45;
      const spreadY = (Math.random() - 0.5) * (1.2 + (dist / 13.0) * 1.8);

      positions[i * 3] = Math.cos(theta) * dist;
      positions[i * 3 + 1] = spreadY;
      positions[i * 3 + 2] = Math.sin(theta) * dist;

      const c = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    starGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const galaxyPoints = new THREE.Points(starGeom, starMat);
    uniGroup.add(galaxyPoints);

    // 2. Central Giant Saturn Core & Glowing Planetary Rings
    const planetGeom = new THREE.SphereGeometry(1.8, 28, 28);
    const planetMat = new THREE.MeshStandardMaterial({
      color: 0x4c1d95,
      metalness: 0.85,
      roughness: 0.25,
      emissive: 0x00f2fe,
      emissiveIntensity: 0.45
    });
    const planet = new THREE.Mesh(planetGeom, planetMat);
    uniGroup.add(planet);

    // Multi-Layer Holographic Planetary Rings (Bán kính 2.6m - 5.5m)
    const ringGeom = new THREE.RingGeometry(2.6, 5.5, 48);
    ringGeom.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.72,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.z = 0.45;
    ring.rotation.x = 0.25;
    uniGroup.add(ring);

    // Second Inner Gold Ring
    const innerRingGeom = new THREE.RingGeometry(2.1, 2.5, 40);
    innerRingGeom.rotateX(Math.PI / 2);
    const innerRing = new THREE.Mesh(innerRingGeom, new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    }));
    innerRing.rotation.copy(ring.rotation);
    uniGroup.add(innerRing);

    // Position galaxy overhead directly centered on the stage
    uniGroup.position.set(origin.x, origin.y + 6.8, origin.z);
    uniGroup.scale.set(0.01, 0.01, 0.01);
    this.scene.add(uniGroup);

    this.activeProps.push({
      group: uniGroup,
      duration: 6.5,
      timer: 0,
      update: (t, dur) => {
        const p = t / dur;
        // Continuous celestial galaxy rotation
        galaxyPoints.rotation.y += 0.45 * 0.016;
        planet.rotation.y += 0.85 * 0.016;
        ring.rotation.y += 0.25 * 0.016;

        // Grand scale expand and hover over the entire room
        if (p < 0.18) {
          const s = Math.sin((p / 0.18) * Math.PI * 0.5);
          uniGroup.scale.set(s, s, s);
        } else if (p > 0.82) {
          const s = Math.max(0, 1.0 - (p - 0.82) / 0.18);
          uniGroup.scale.set(s, s, s);
        } else {
          uniGroup.scale.set(1.0, 1.0, 1.0);
        }
      }
    });
  }

  // =========================================================================
  // 5. 3D Phượng Hoàng Lửa / Phoenix (25.999 xu)
  // =========================================================================
  _spawnPhoenix(origin) {
    const birdGroup = new THREE.Group();

    // Fiery Bird Body
    const bodyGeom = new THREE.ConeGeometry(0.65, 3.2, 12);
    bodyGeom.rotateX(Math.PI / 2);
    const fireMat = new THREE.MeshStandardMaterial({
      color: 0xff4500,
      emissive: 0xffd700,
      emissiveIntensity: 0.7,
      metalness: 0.8
    });
    const body = new THREE.Mesh(bodyGeom, fireMat);
    birdGroup.add(body);

    // Flapping 6-Meter Fiery Wings
    const wingGeom = new THREE.PlaneGeometry(3.2, 1.6);
    const wingMat = new THREE.MeshBasicMaterial({
      color: 0xff8800,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const wingL = new THREE.Mesh(wingGeom, wingMat);
    wingL.position.set(-1.8, 0.4, 0);
    const wingR = wingL.clone();
    wingR.position.x = 1.8;
    birdGroup.add(wingL);
    birdGroup.add(wingR);

    // Long Fiery Plumage Tails
    const tailGeom = new THREE.CylinderGeometry(0.04, 0.35, 4.2, 8);
    tailGeom.rotateX(Math.PI / 2);
    const tail = new THREE.Mesh(tailGeom, wingMat);
    tail.position.set(0, 0, 2.5);
    birdGroup.add(tail);

    birdGroup.position.set(origin.x, origin.y + 7.5, origin.z - 6);
    this.scene.add(birdGroup);

    this.activeProps.push({
      group: birdGroup,
      duration: 4.8,
      timer: 0,
      update: (t, dur) => {
        const p = t / dur;
        birdGroup.position.y = THREE.MathUtils.lerp(origin.y + 7.5, origin.y + 3.8, Math.sin(p * Math.PI));
        birdGroup.position.z = THREE.MathUtils.lerp(origin.z - 6, origin.z + 6, p);
        wingL.rotation.z = Math.sin(t * 12) * 0.42;
        wingR.rotation.z = -Math.sin(t * 12) * 0.42;
      }
    });
  }

  // =========================================================================
  // 6. 3D Sư Tử Vàng Hoàng Gia / Golden Lion (29.999 xu)
  // =========================================================================
  _spawnGoldenLion(origin) {
    const lionGroup = new THREE.Group();

    // Sculpted Golden Lion Mane & Head
    const headGeom = new THREE.SphereGeometry(1.0, 20, 20);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.95,
      roughness: 0.12,
      emissive: 0xff8800,
      emissiveIntensity: 0.35
    });
    const head = new THREE.Mesh(headGeom, goldMat);
    lionGroup.add(head);

    // Multi-Layer Sunburst Mane Ring (Bờm sư tử tỏa sáng)
    const maneGeom = new THREE.TorusGeometry(1.6, 0.28, 12, 36);
    const mane = new THREE.Mesh(maneGeom, goldMat);
    lionGroup.add(mane);

    // Imperial Royal Crown on Head
    const crownGeom = new THREE.CylinderGeometry(0.7, 0.5, 0.6, 6);
    const crown = new THREE.Mesh(crownGeom, new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.9,
      emissive: 0xffd700,
      emissiveIntensity: 0.6
    }));
    crown.position.y = 1.35;
    lionGroup.add(crown);

    lionGroup.position.set(origin.x, origin.y + 3.2, origin.z);
    lionGroup.scale.set(0.01, 0.01, 0.01);
    this.scene.add(lionGroup);

    this.activeProps.push({
      group: lionGroup,
      duration: 5.2,
      timer: 0,
      update: (t, dur) => {
        lionGroup.rotation.y += 1.8 * 0.016;
        const p = t / dur;
        if (p < 0.2) {
          const s = Math.sin((p / 0.2) * Math.PI * 0.5);
          lionGroup.scale.set(s, s, s);
        } else if (p > 0.8) {
          const s = Math.max(0, 1.0 - (p - 0.8) / 0.2);
          lionGroup.scale.set(s, s, s);
        } else {
          lionGroup.scale.set(1.0, 1.0, 1.0);
        }
      }
    });
  }

  // =========================================================================
  // 7. 3D Ngựa Thần Pegasus (42.999 xu)
  // =========================================================================
  _spawnPegasus(origin) {
    const pegasusGroup = new THREE.Group();

    const bodyGeom = new THREE.BoxGeometry(1.1, 0.75, 2.4);
    const pegasusMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.85,
      roughness: 0.15,
      emissive: 0xfef08a,
      emissiveIntensity: 0.35
    });
    const body = new THREE.Mesh(bodyGeom, pegasusMat);
    pegasusGroup.add(body);

    const wingGeom = new THREE.PlaneGeometry(2.6, 1.2);
    const wingMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
    const wingL = new THREE.Mesh(wingGeom, wingMat);
    wingL.position.set(-1.5, 0.5, 0);
    wingL.rotation.y = Math.PI / 4;
    const wingR = wingL.clone();
    wingR.position.x = 1.5;
    wingR.rotation.y = -Math.PI / 4;
    pegasusGroup.add(wingL);
    pegasusGroup.add(wingR);

    pegasusGroup.position.set(origin.x - 8, origin.y + 4.8, origin.z);
    this.scene.add(pegasusGroup);

    this.activeProps.push({
      group: pegasusGroup,
      duration: 4.5,
      timer: 0,
      update: (t, dur) => {
        const p = t / dur;
        pegasusGroup.position.x = origin.x - 8 + p * 16;
        pegasusGroup.position.y = origin.y + 4.8 + Math.sin(t * 6) * 0.45;
        wingL.rotation.z = Math.sin(t * 10) * 0.42;
        wingR.rotation.z = -Math.sin(t * 10) * 0.42;
      }
    });
  }

  // =========================================================================
  // 8. 3D Quả Cầu Disco (1.000 xu)
  // =========================================================================
  _spawnDiscoBall(origin) {
    const ballGroup = new THREE.Group();
    const sphereGeom = new THREE.SphereGeometry(1.1, 24, 24);
    const mirrorMat = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.98,
      roughness: 0.05,
      emissive: 0x333333
    });
    const sphere = new THREE.Mesh(sphereGeom, mirrorMat);
    ballGroup.add(sphere);

    // 4 Rotating Multi-Color Spotlight Rays
    const rayColors = [0x00f2fe, 0xff007f, 0xffd700, 0x00ff88];
    const rayCones = [];
    for (let i = 0; i < 4; i++) {
      const coneGeom = new THREE.ConeGeometry(1.2, 5.5, 12);
      coneGeom.rotateX(Math.PI / 2);
      const coneMat = new THREE.MeshBasicMaterial({
        color: rayColors[i],
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending
      });
      const cone = new THREE.Mesh(coneGeom, coneMat);
      cone.position.set(0, 0, 2.7);
      const pivot = new THREE.Group();
      pivot.rotation.y = (i * Math.PI) / 2;
      pivot.rotation.x = 0.55;
      pivot.add(cone);
      ballGroup.add(pivot);
      rayCones.push(pivot);
    }

    ballGroup.position.set(origin.x, 12.0, origin.z);
    this.scene.add(ballGroup);

    this.activeProps.push({
      group: ballGroup,
      duration: 4.8,
      timer: 0,
      update: (t, dur) => {
        const p = t / dur;
        if (p < 0.25) {
          ballGroup.position.y = THREE.MathUtils.lerp(12.0, origin.y + 4.2, p / 0.25);
        } else if (p > 0.8) {
          ballGroup.position.y = THREE.MathUtils.lerp(origin.y + 4.2, 12.0, (p - 0.8) / 0.2);
        } else {
          ballGroup.position.y = origin.y + 4.2;
        }
        sphere.rotation.y += 8.0 * 0.016;
        for (const ray of rayCones) {
          ray.rotation.y += 3.5 * 0.016;
        }
      }
    });
  }

  // =========================================================================
  // 9. 3D Súng Bắn Tiền / Money Gun (500 xu)
  // =========================================================================
  _spawnMoneyGun(origin) {
    const gunGroup = new THREE.Group();

    // Red Blaster Body
    const bodyGeom = new THREE.BoxGeometry(0.45, 0.75, 1.2);
    const redMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.6, roughness: 0.3 });
    const body = new THREE.Mesh(bodyGeom, redMat);
    gunGroup.add(body);

    gunGroup.position.set(origin.x + 0.9, origin.y + 2.0, origin.z + 0.6);
    gunGroup.rotation.y = -0.4;
    gunGroup.rotation.x = -0.25;
    this.scene.add(gunGroup);

    // 40 Floating & Falling Green Dollar Bills
    const billGeom = new THREE.PlaneGeometry(0.36, 0.18);
    const billMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      side: THREE.DoubleSide,
      metalness: 0.3
    });

    const bills = [];
    for (let i = 0; i < 40; i++) {
      const bill = new THREE.Mesh(billGeom, billMat);
      bill.position.set(gunGroup.position.x, gunGroup.position.y + 0.2, gunGroup.position.z);
      this.scene.add(bill);
      bills.push({
        mesh: bill,
        vx: (Math.random() - 0.5) * 3.5,
        vy: 2.5 + Math.random() * 2.5,
        vz: 1.5 + Math.random() * 3.0,
        vrx: (Math.random() - 0.5) * 8.0,
        vry: (Math.random() - 0.5) * 8.0
      });
    }

    this.activeProps.push({
      group: gunGroup,
      extraMeshes: bills.map((b) => b.mesh),
      duration: 3.5,
      timer: 0,
      update: (t, dur) => {
        gunGroup.position.y += Math.sin(t * 16) * 0.015;
        for (const b of bills) {
          b.vy -= 9.8 * 0.016;
          b.mesh.position.x += b.vx * 0.016;
          b.mesh.position.y += b.vy * 0.016;
          b.mesh.position.z += b.vz * 0.016;
          b.mesh.rotation.x += b.vrx * 0.016;
          b.mesh.rotation.y += b.vry * 0.016;
          if (b.mesh.position.y <= 0.04) {
            b.mesh.position.y = 0.04;
            b.vy = 0;
            b.vx = 0;
            b.vz = 0;
          }
        }
      }
    });
  }

  // =========================================================================
  // 10. 3D Hoa Hồng / Rose (1 xu)
  // =========================================================================
  _spawnRose(origin) {
    const roseGroup = new THREE.Group();
    const stemGeom = new THREE.CylinderGeometry(0.04, 0.04, 1.4, 8);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x16a34a });
    const stem = new THREE.Mesh(stemGeom, stemMat);
    stem.position.y = 0.7;
    roseGroup.add(stem);

    const petalGeom = new THREE.SphereGeometry(0.42, 12, 12);
    petalGeom.scale(1.0, 1.2, 1.0);
    const petalMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      metalness: 0.2,
      roughness: 0.4,
      emissive: 0xb91c1c,
      emissiveIntensity: 0.35
    });
    const bloom = new THREE.Mesh(petalGeom, petalMat);
    bloom.position.y = 1.4;
    roseGroup.add(bloom);

    roseGroup.position.set(origin.x, origin.y + 0.1, origin.z + 0.6);
    roseGroup.scale.set(0.01, 0.01, 0.01);
    this.scene.add(roseGroup);

    this.activeProps.push({
      group: roseGroup,
      duration: 2.8,
      timer: 0,
      update: (t, dur) => {
        const p = t / dur;
        roseGroup.rotation.y += 2.5 * 0.016;
        if (p < 0.25) {
          const s = Math.sin((p / 0.25) * Math.PI * 0.5);
          roseGroup.scale.set(s, s, s);
        } else if (p > 0.8) {
          const s = Math.max(0, 1.0 - (p - 0.8) / 0.2);
          roseGroup.scale.set(s, s, s);
        }
      }
    });
  }

  // =========================================================================
  // 11. 3D Bắn Tim / Finger Heart (5 xu)
  // =========================================================================
  _spawnFingerHeart(origin) {
    const heartGroup = new THREE.Group();
    const heartGeom = new THREE.SphereGeometry(0.38, 12, 12);
    const heartMat = new THREE.MeshStandardMaterial({
      color: 0xff007f,
      emissive: 0xff0874,
      emissiveIntensity: 0.6
    });

    const left = new THREE.Mesh(heartGeom, heartMat);
    left.position.set(-0.24, 0.18, 0);
    const right = new THREE.Mesh(heartGeom, heartMat);
    right.position.set(0.24, 0.18, 0);
    const tip = new THREE.ConeGeometry(0.48, 0.72, 12);
    tip.rotateZ(Math.PI);
    const bottom = new THREE.Mesh(tip, heartMat);
    bottom.position.y = -0.22;

    heartGroup.add(left);
    heartGroup.add(right);
    heartGroup.add(bottom);

    heartGroup.position.set(origin.x, origin.y + 1.8, origin.z);
    this.scene.add(heartGroup);

    this.activeProps.push({
      group: heartGroup,
      duration: 2.5,
      timer: 0,
      update: (t, dur) => {
        const p = t / dur;
        heartGroup.position.y = origin.y + 1.8 + p * 2.2;
        const pulse = 1.0 + Math.sin(t * 14) * 0.22;
        heartGroup.scale.set(pulse, pulse, pulse);
        heartGroup.rotation.y += 3.0 * 0.016;
      }
    });
  }

  // =========================================================================
  // 12. 3D Kính Râm Cyber (199 xu)
  // =========================================================================
  _spawnCyberSunglasses(origin) {
    const shadesGroup = new THREE.Group();
    const lensGeom = new THREE.BoxGeometry(0.85, 0.24, 0.08);
    const lensMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a14,
      metalness: 0.95,
      roughness: 0.1,
      emissive: 0x00f2fe,
      emissiveIntensity: 0.6
    });
    const lens = new THREE.Mesh(lensGeom, lensMat);
    shadesGroup.add(lens);

    shadesGroup.position.set(origin.x, origin.y + 4.0, origin.z + 0.35);
    this.scene.add(shadesGroup);

    this.activeProps.push({
      group: shadesGroup,
      duration: 3.2,
      timer: 0,
      update: (t, dur) => {
        const p = t / dur;
        if (p < 0.25) {
          shadesGroup.position.y = THREE.MathUtils.lerp(origin.y + 4.0, origin.y + 0.65, p / 0.25);
        } else {
          shadesGroup.position.y = origin.y + 0.65;
        }
        if (p > 0.8) {
          const s = Math.max(0, 1.0 - (p - 0.8) / 0.2);
          shadesGroup.scale.set(s, s, s);
        }
      }
    });
  }

  // =========================================================================
  // 13. 3D Cầu Vồng / Rainbow (100 xu)
  // =========================================================================
  _spawnRainbow(origin) {
    const rainbowGroup = new THREE.Group();
    const colors = [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0x9400d3];

    for (let i = 0; i < colors.length; i++) {
      const radius = 1.8 + i * 0.14;
      const torusGeom = new THREE.TorusGeometry(radius, 0.06, 8, 32, Math.PI);
      const torusMat = new THREE.MeshBasicMaterial({ color: colors[i], side: THREE.DoubleSide });
      const arc = new THREE.Mesh(torusGeom, torusMat);
      rainbowGroup.add(arc);
    }

    rainbowGroup.position.set(origin.x, origin.y + 0.1, origin.z);
    rainbowGroup.rotation.z = 0;
    this.scene.add(rainbowGroup);

    this.activeProps.push({
      group: rainbowGroup,
      duration: 3.5,
      timer: 0,
      update: (t, dur) => {
        const p = t / dur;
        rainbowGroup.rotation.y += 0.8 * 0.016;
        if (p < 0.2) {
          const s = Math.sin((p / 0.2) * Math.PI * 0.5);
          rainbowGroup.scale.set(s, s, s);
        } else if (p > 0.8) {
          const s = Math.max(0, 1.0 - (p - 0.8) / 0.2);
          rainbowGroup.scale.set(s, s, s);
        }
      }
    });
  }

  // =========================================================================
  // 14. 3D Nón Lá Việt Nam (10 xu)
  // =========================================================================
  _spawnConicalHat(origin) {
    const hatGroup = new THREE.Group();
    const hatGeom = new THREE.ConeGeometry(0.85, 0.55, 20);
    const hatMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      metalness: 0.1,
      roughness: 0.8,
      emissive: 0xd97706,
      emissiveIntensity: 0.25
    });
    const hat = new THREE.Mesh(hatGeom, hatMat);
    hatGroup.add(hat);

    hatGroup.position.set(origin.x, origin.y + 3.0, origin.z);
    this.scene.add(hatGroup);

    this.activeProps.push({
      group: hatGroup,
      duration: 3.0,
      timer: 0,
      update: (t, dur) => {
        const p = t / dur;
        if (p < 0.28) {
          hatGroup.position.y = THREE.MathUtils.lerp(origin.y + 3.0, origin.y + 0.78, p / 0.28);
          hatGroup.rotation.y += 4.0 * 0.016;
        } else {
          hatGroup.position.y = origin.y + 0.78;
        }
        if (p > 0.82) {
          const s = Math.max(0, 1.0 - (p - 0.82) / 0.18);
          hatGroup.scale.set(s, s, s);
        }
      }
    });
  }

  // =========================================================================
  // 15. 3D Thanh Kiếm Excalibur (1.000 xu)
  // =========================================================================
  _spawnExcalibur(origin) {
    const swordGroup = new THREE.Group();
    const bladeGeom = new THREE.BoxGeometry(0.14, 2.2, 0.05);
    const bladeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.1,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.5
    });
    const blade = new THREE.Mesh(bladeGeom, bladeMat);
    swordGroup.add(blade);

    const hiltGeom = new THREE.BoxGeometry(0.55, 0.08, 0.1);
    const hilt = new THREE.Mesh(hiltGeom, new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9 }));
    hilt.position.y = 1.1;
    swordGroup.add(hilt);

    swordGroup.position.set(origin.x + 0.85, origin.y + 8.5, origin.z);
    this.scene.add(swordGroup);

    this.activeProps.push({
      group: swordGroup,
      duration: 3.5,
      timer: 0,
      update: (t, dur) => {
        const p = t / dur;
        if (p < 0.18) {
          swordGroup.position.y = THREE.MathUtils.lerp(origin.y + 8.5, origin.y + 0.9, p / 0.18);
        } else {
          swordGroup.position.y = origin.y + 0.9;
          swordGroup.rotation.y += 2.0 * 0.016;
        }
        if (p > 0.8) {
          const s = Math.max(0, 1.0 - (p - 0.8) / 0.2);
          swordGroup.scale.set(s, s, s);
        }
      }
    });
  }

  // =========================================================================
  // 16. 3D Đàn Điện Concert (500 xu)
  // =========================================================================
  _spawnElectricGuitar(origin) {
    const guitarGroup = new THREE.Group();
    const bodyGeom = new THREE.BoxGeometry(0.7, 1.1, 0.14);
    const neckGeom = new THREE.CylinderGeometry(0.05, 0.05, 1.6, 8);
    neckGeom.translate(0, 0.95, 0);

    const redMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xd946ef, emissiveIntensity: 0.4 });
    guitarGroup.add(new THREE.Mesh(bodyGeom, redMat));
    guitarGroup.add(new THREE.Mesh(neckGeom, redMat));

    guitarGroup.position.set(origin.x, origin.y + 2.5, origin.z);
    guitarGroup.rotation.z = 0.4;
    this.scene.add(guitarGroup);

    this.activeProps.push({
      group: guitarGroup,
      duration: 3.2,
      timer: 0,
      update: (t, dur) => {
        guitarGroup.rotation.y += 3.5 * 0.016;
        const p = t / dur;
        if (p > 0.75) {
          const s = Math.max(0, 1.0 - (p - 0.75) / 0.25);
          guitarGroup.scale.set(s, s, s);
        }
      }
    });
  }

  // =========================================================================
  // 17. 3D Bóng Bay Tình Yêu (699 xu)
  // =========================================================================
  _spawnLoveBalloons(origin) {
    const balloonGroup = new THREE.Group();
    const colors = [0xff0055, 0xff0874, 0xf43f5e, 0x00f2fe];

    for (let i = 0; i < 6; i++) {
      const bGeom = new THREE.SphereGeometry(0.35, 12, 12);
      bGeom.scale(1.0, 1.3, 1.0);
      const bMat = new THREE.MeshStandardMaterial({
        color: colors[i % colors.length],
        metalness: 0.6,
        roughness: 0.2
      });
      const b = new THREE.Mesh(bGeom, bMat);
      b.position.set((Math.random() - 0.5) * 0.8, i * 0.35, (Math.random() - 0.5) * 0.8);
      balloonGroup.add(b);
    }

    balloonGroup.position.set(origin.x, origin.y + 0.5, origin.z);
    this.scene.add(balloonGroup);

    this.activeProps.push({
      group: balloonGroup,
      duration: 3.5,
      timer: 0,
      update: (t, dur) => {
        const p = t / dur;
        balloonGroup.position.y = origin.y + 0.5 + p * 6.5;
        balloonGroup.position.x = origin.x + Math.sin(t * 3) * 0.45;
      }
    });
  }

  // =========================================================================
  // 18. Generic Gift Prop Fallback
  // =========================================================================
  _spawnGenericGiftProp(origin, key, coins) {
    const boxGroup = new THREE.Group();
    const boxGeom = new THREE.BoxGeometry(0.85, 0.85, 0.85);
    const boxMat = new THREE.MeshStandardMaterial({
      color: coins >= 500 ? 0xffd700 : 0x00f2fe,
      metalness: 0.85,
      roughness: 0.2,
      emissive: coins >= 500 ? 0xff8800 : 0x0088cc,
      emissiveIntensity: 0.4
    });
    const box = new THREE.Mesh(boxGeom, boxMat);
    boxGroup.add(box);

    boxGroup.position.set(origin.x, origin.y + 1.8, origin.z);
    this.scene.add(boxGroup);

    this.activeProps.push({
      group: boxGroup,
      duration: 3.0,
      timer: 0,
      update: (t, dur) => {
        boxGroup.rotation.y += 2.5 * 0.016;
        boxGroup.rotation.x += 1.5 * 0.016;
        const p = t / dur;
        if (p > 0.75) {
          const s = Math.max(0, 1.0 - (p - 0.75) / 0.25);
          boxGroup.scale.set(s, s, s);
        }
      }
    });
  }

  // =========================================================================
  // Lifecycle Management & Disposal
  // =========================================================================
  update(delta) {
    for (let i = this.activeProps.length - 1; i >= 0; i--) {
      const prop = this.activeProps[i];
      prop.timer += delta;

      if (prop.timer >= prop.duration) {
        // Dispose geometries & materials to avoid VRAM leaks
        if (prop.group) {
          this.scene.remove(prop.group);
          prop.group.traverse((obj) => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
              if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
              else obj.material.dispose();
            }
          });
        }
        if (prop.extraMeshes) {
          for (const m of prop.extraMeshes) {
            this.scene.remove(m);
            if (m.geometry) m.geometry.dispose();
            if (m.material) m.material.dispose();
          }
        }
        this.activeProps.splice(i, 1);
      } else {
        if (typeof prop.update === 'function') {
          prop.update(prop.timer, prop.duration);
        }
      }
    }
  }
}
