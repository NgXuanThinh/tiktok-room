// 2D Fullscreen Cinematic Particle Physics Engine for High-Tier & Ultra Gifts
let fxAnimId = null;
export function startCinematicParticles(canvas, gift, duration) {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const coins = gift.coins;

  const w = canvas.width;
  const h = canvas.height;

  const isUniverse = (gift.key === 'universe' || coins === 44999);
  const isPegasus = (gift.key === 'pegasus' || coins === 34000);
  const isLion = (gift.key === 'lion' || coins === 29999);
  const isTiger = (gift.key === 'tiger' || coins === 26999);
  const isPhoenix = (gift.key === 'phoenix' || coins === 25999);
  const isPanther = (gift.key === 'panther' || coins === 10000);
  const isAirplane = (gift.key === 'jet' || coins === 6000);

  const isMoney = !isUniverse && !isPegasus && !isLion && !isTiger && !isPhoenix && !isPanther && !isAirplane && (gift.key === 'money_gun' || gift.key === 'money_rain' || (coins === 500 && gift.key !== 'concert'));
  const isConcert = !isUniverse && !isPegasus && !isLion && !isTiger && !isPhoenix && !isPanther && !isAirplane && (gift.key === 'concert' || gift.name?.includes('hòa nhạc'));
  const isSwan = !isUniverse && !isPegasus && !isLion && !isTiger && !isPhoenix && !isPanther && !isAirplane && (gift.key === 'swan' || gift.name?.includes('Thiên nga'));
  const isHeart = !isUniverse && !isPegasus && !isLion && !isTiger && !isPhoenix && !isPanther && !isAirplane && (gift.key === 'love_balloon' || (coins === 699 && !isSwan) || coins === 700);
  const isGalaxy = !isUniverse && !isPegasus && !isLion && !isTiger && !isPhoenix && !isPanther && !isAirplane && (gift.key === 'galaxy' || gift.name?.includes('Galaxy'));
  const isDisco = !isUniverse && !isPegasus && !isLion && !isTiger && !isPhoenix && !isPanther && !isAirplane && (gift.key === 'disco_ball' || gift.name?.includes('Disco'));
  const isLegend = !isUniverse && !isPegasus && !isLion && !isTiger && !isPhoenix && !isPanther && !isAirplane && (gift.key === 'legend' || gift.name?.includes('Huyền thoại'));
  const isWhale = !isUniverse && !isPegasus && !isLion && !isTiger && !isPhoenix && !isPanther && !isAirplane && (gift.key === 'whale_diving' || coins === 2150);
  const isJet = !isUniverse && !isPegasus && !isLion && !isTiger && !isPhoenix && !isPanther && !isAirplane && (gift.key === 'private_jet' || coins === 4888);
  const isDiamond = !isUniverse && !isPegasus && !isLion && !isTiger && !isPhoenix && !isPanther && !isAirplane && (gift.key === 'diamond_gun' || (coins === 5000 && !gift.key?.includes('queen')));
  const isQueen = !isUniverse && !isPegasus && !isLion && !isTiger && !isPhoenix && !isPanther && !isAirplane && (coins >= 5000 && (gift.key === 'drama_queen' || !isDiamond));

  // Mốc 1: MƯA TIỀN 500 - 70 tờ tiền $100 & đồng xu vàng bay lốc xoáy
  const moneyItems = [];
  if (isMoney) {
    for (let i = 0; i < 70; i++) {
      moneyItems.push({
        x: Math.random() * w,
        y: Math.random() * -h,
        vx: (Math.random() - 0.5) * 1.6,
        vy: 4.8 + Math.random() * 5.2,
        w: 42 + Math.random() * 18,
        h: 24 + Math.random() * 10,
        rotX: Math.random() * Math.PI,
        rotY: Math.random() * Math.PI,
        vrotX: 2 + Math.random() * 4,
        vrotY: 3 + Math.random() * 5,
        isCoin: Math.random() < 0.45,
        color: Math.random() < 0.5 ? '#00ff88' : '#ffd700'
      });
    }
  }

  // Mốc 2: HÒA NHẠC 500 - 35 nốt nhạc bay + 4 đèn pha sân khấu quét
  const concertNotes = [];
  if (isConcert) {
    for (let i = 0; i < 35; i++) {
      concertNotes.push({
        x: w / 2 + (Math.random() - 0.5) * 200,
        y: h / 2 + (Math.random() - 0.5) * 200,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        size: 24 + Math.random() * 22,
        symbol: ['♪', '♫', '♬', '🎸', '⚡'][Math.floor(Math.random() * 5)],
        color: ['#00f2fe', '#ff0874', '#ffd700', '#00ff88'][Math.floor(Math.random() * 4)],
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 3
      });
    }
  }

  // Mốc 3: BÓNG BAY TÌNH 700 - 40 bóng bay trái tim có dây bay lên + cánh hoa hồng
  const heartBalloons = [];
  const rosePetals = [];
  if (isHeart) {
    for (let i = 0; i < 40; i++) {
      heartBalloons.push({
        x: Math.random() * w,
        y: h + 20 + Math.random() * 300,
        vy: -(2.2 + Math.random() * 3.2),
        vx: (Math.random() - 0.5) * 1.2,
        size: 32 + Math.random() * 28,
        color: ['#ff1779', '#ff4081', '#ff80ab', '#ffd700'][Math.floor(Math.random() * 4)],
        swaySpeed: 1.5 + Math.random() * 2.0,
        swayOffset: Math.random() * Math.PI * 2
      });
    }
    for (let i = 0; i < 30; i++) {
      rosePetals.push({
        x: Math.random() * w,
        y: -20 - Math.random() * 200,
        vy: 1.5 + Math.random() * 2.5,
        vx: Math.sin(i) * 1.8,
        size: 14 + Math.random() * 10,
        rot: Math.random() * Math.PI,
        vrot: (Math.random() - 0.5) * 2.5
      });
    }
  }

  // Mốc 3b: THIÊN NGA 699 - Lông vũ thiên nga phát sáng rơi lượn sóng
  const swanFeathers = [];
  if (isSwan) {
    for (let i = 0; i < 40; i++) {
      swanFeathers.push({
        x: Math.random() * w,
        y: -30 - Math.random() * 250,
        vy: 1.8 + Math.random() * 2.2,
        swaySpeed: 1.5 + Math.random() * 2.0,
        swayAmp: 25 + Math.random() * 35,
        phase: Math.random() * Math.PI * 2,
        size: 18 + Math.random() * 16,
        rot: Math.random() * Math.PI,
        vrot: (Math.random() - 0.5) * 2,
        color: Math.random() < 0.6 ? '#ffffff' : '#ffd1dc'
      });
    }
  }

  // Mốc 4: CẦU DISCO 1000 - 16 tia laser 7 màu 360 độ + quả cầu disco phản chiếu
  const discoMirrors = [];
  if (isDisco) {
    for (let i = 0; i < 60; i++) {
      discoMirrors.push({
        angle: Math.random() * Math.PI * 2,
        radius: 30 + Math.random() * 50,
        size: 3 + Math.random() * 5,
        color: `hsl(${Math.random() * 360}, 100%, 75%)`
      });
    }
  }

  // Mốc 4b: GALAXY 1000 - Vũ trụ thiên hà xoay tròn 3 nhánh + mưa bụi tinh vân
  const galaxyStars = [];
  if (isGalaxy) {
    for (let i = 0; i < 90; i++) {
      const arm = i % 3;
      const dist = 30 + Math.random() * (Math.min(w, h) * 0.45);
      const baseAngle = arm * (Math.PI * 2 / 3) + (dist * 0.015);
      galaxyStars.push({
        dist,
        baseAngle,
        speed: (0.4 + Math.random() * 0.6) * (1 - dist / (Math.min(w, h) * 0.6)),
        size: 2 + Math.random() * 4.5,
        color: ['#00f2fe', '#c77dff', '#ffffff', '#ff007f'][Math.floor(Math.random() * 4)]
      });
    }
  }

  // Mốc 5: HUYỀN THOẠI 1000 - Vết chém 'X' vàng rực + 80 tàn lửa núi lửa nổ bung
  const swordSparks = [];
  if (isLegend) {
    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 10;
      swordSparks.push({
        x: w / 2,
        y: h / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 6,
        color: Math.random() < 0.6 ? '#ffd700' : (Math.random() < 0.8 ? '#ff4500' : '#ffffff'),
        life: 0,
        maxLife: 0.6 + Math.random() * 0.8
      });
    }
  }

  // Mốc 5b: CÁ VOI LẶN 2150 - Bọt khí đại dương dạ quang + sóng biển
  const whaleBubbles = [];
  if (isWhale) {
    for (let i = 0; i < 50; i++) {
      whaleBubbles.push({
        x: Math.random() * w,
        y: h + 20 + Math.random() * 300,
        vy: -(2.5 + Math.random() * 4.0),
        vx: (Math.random() - 0.5) * 1.5,
        radius: 3 + Math.random() * 8,
        glow: Math.random() < 0.3 ? '#00ffff' : '#00b4d8'
      });
    }
  }

  // Mốc 5c: PRIVATE JET 4888 - Vệt khói lửa siêu thanh xé toạc màn hình
  const jetStreaks = [];
  if (isJet) {
    for (let i = 0; i < 24; i++) {
      jetStreaks.push({
        x: Math.random() * -w,
        y: Math.random() * h,
        vx: 18 + Math.random() * 14,
        vy: (Math.random() - 0.5) * 4,
        len: 80 + Math.random() * 140,
        width: 2 + Math.random() * 3,
        color: Math.random() < 0.7 ? '#ffd700' : '#ffffff'
      });
    }
  }

  // Mốc 5d: PHÁO KIM CƯƠNG 5000 - Tinh thể pha lê kim cương nổ vụn 1000 mảnh
  const diamondCrystals = [];
  if (isDiamond) {
    for (let i = 0; i < 65; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 3 + Math.random() * 8;
      diamondCrystals.push({
        x: w / 2,
        y: h / 2,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        size: 14 + Math.random() * 18,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 4,
        color: ['#ffffff', '#00f2fe', '#ff007f', '#ffd700'][Math.floor(Math.random() * 4)]
      });
    }
  }

  // Mốc 6: DRAMA QUEEN 5000 - Thác kim cương 3D 75 viên + cánh thiên thần
  const diamondDrops = [];
  if (isQueen) {
    for (let i = 0; i < 75; i++) {
      diamondDrops.push({
        x: Math.random() * w,
        y: Math.random() * -h,
        vy: 3.8 + Math.random() * 5.8,
        vx: (Math.random() - 0.5) * 1.5,
        size: 22 + Math.random() * 24,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 4,
        symbol: Math.random() < 0.5 ? '💎' : (Math.random() < 0.75 ? '✨' : '👑')
      });
    }
  }

  // ULTRA 1: AIRPLANE 6,000🪙 - Vé VIP vàng + đèn đường băng + vệt phản lực
  const airplaneTickets = [];
  const runwayMarkers = [];
  if (isAirplane) {
    for (let i = 0; i < 28; i++) {
      airplaneTickets.push({
        x: Math.random() * w,
        y: Math.random() * -h,
        vx: (Math.random() - 0.5) * 1.5,
        vy: 3.2 + Math.random() * 3.8,
        rot: Math.random() * Math.PI,
        vrot: (Math.random() - 0.5) * 2.5,
        w: 52 + Math.random() * 20,
        h: 26 + Math.random() * 10
      });
    }
    for (let i = 0; i < 22; i++) {
      runwayMarkers.push({
        x: (w / 21) * i,
        color: (i % 2 === 0) ? '#00f2fe' : '#ffd700'
      });
    }
  }

  // ULTRA 2: BÁO ĐÊM 10,000🪙 - 3 Vết vuốt cào xé toạc màn hình + tàn tro tím
  const pantherSparks = [];
  if (isPanther) {
    for (let i = 0; i < 60; i++) {
      pantherSparks.push({
        x: w * 0.5 + (Math.random() - 0.5) * 350,
        y: h * 0.5 + (Math.random() - 0.5) * 350,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12,
        size: 3 + Math.random() * 6,
        color: ['#a855f7', '#d946ef', '#ffffff', '#3b0764'][Math.floor(Math.random() * 4)],
        life: 0,
        maxLife: 0.5 + Math.random() * 0.5
      });
    }
  }

  // ULTRA 3: PHƯỢNG HOÀNG 25,999🪙 - Phượng hoàng lửa 2D bay vút + lốc tàn lửa & lông vũ thần thoại
  const phoenixEmbers = [];
  const phoenixFeathers = [];
  if (isPhoenix) {
    for (let i = 0; i < 75; i++) {
      phoenixEmbers.push({
        x: w * 0.5 + (Math.random() - 0.5) * 320,
        y: h + Math.random() * 200,
        vx: (Math.random() - 0.5) * 4,
        vy: -(4.5 + Math.random() * 6.5),
        size: 3 + Math.random() * 7,
        color: ['#ff4500', '#ff8c00', '#ffd700', '#ffffff'][Math.floor(Math.random() * 4)]
      });
    }
    for (let i = 0; i < 25; i++) {
      phoenixFeathers.push({
        x: Math.random() * w,
        y: -40 - Math.random() * 300,
        vy: 1.8 + Math.random() * 2.5,
        vx: (Math.random() - 0.5) * 1.5,
        swaySpeed: 1.5 + Math.random() * 2.0,
        phase: Math.random() * Math.PI * 2,
        size: 20 + Math.random() * 16,
        rot: Math.random() * Math.PI,
        vrot: (Math.random() - 0.5) * 2,
        color: Math.random() < 0.6 ? '#ffd700' : '#ff4500'
      });
    }
  }

  // ULTRA 4: HỔ LỬA 26,999🪙 - Đầu hổ lửa gầm + vòng lửa khổng lồ bốc cháy
  const tigerFlames = [];
  if (isTiger) {
    for (let i = 0; i < 70; i++) {
      tigerFlames.push({
        angle: Math.random() * Math.PI * 2,
        dist: 120 + Math.random() * 60,
        speed: (Math.random() < 0.5 ? 1 : -1) * (1.2 + Math.random() * 1.8),
        size: 4 + Math.random() * 9,
        color: ['#ff3d00', '#ff9100', '#ffd700', '#ffffff'][Math.floor(Math.random() * 4)]
      });
    }
  }

  // ULTRA 5: SƯ TỬ 29,999🪙 - Cột sáng hoàng gia + mưa thỏi vàng 24K, kim cương, đồng xu sư tử
  const lionGoldBars = [];
  if (isLion) {
    for (let i = 0; i < 65; i++) {
      lionGoldBars.push({
        x: Math.random() * w,
        y: Math.random() * -h,
        vy: 3.5 + Math.random() * 5.2,
        vx: (Math.random() - 0.5) * 1.5,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 4,
        size: 22 + Math.random() * 20,
        kind: ['bar', 'coin', 'diamond'][Math.floor(Math.random() * 3)]
      });
    }
  }

  // ULTRA 6: NGỰA THẦN 34,000🪙 - Ngựa thần Pegasus 2D phi nước đại trên dải cực quang Aurora
  const pegasusStars = [];
  if (isPegasus) {
    for (let i = 0; i < 16; i++) {
      pegasusStars.push({
        x: w * 0.4 + Math.random() * w * 0.8,
        y: Math.random() * h * 0.5,
        vx: -(12 + Math.random() * 14),
        vy: 6 + Math.random() * 8,
        len: 90 + Math.random() * 130,
        color: ['#00f2fe', '#e0e7ff', '#ffd700', '#f43f5e'][Math.floor(Math.random() * 4)]
      });
    }
  }

  // ULTRA 7: VŨ TRỤ TIKTOK 44,999🪙 - Vụ nổ Big Bang + 4 hành tinh quỹ đạo xoay quanh Avatar
  const universeStars = [];
  if (isUniverse) {
    for (let i = 0; i < 85; i++) {
      universeStars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: 1.5 + Math.random() * 4,
        twinkle: Math.random() * Math.PI * 2,
        color: ['#ffffff', '#00f2fe', '#c084fc', '#f43f5e', '#ffd700'][Math.floor(Math.random() * 5)]
      });
    }
  }

  const startTime = performance.now();
  function renderFx() {
    const elapsed = (performance.now() - startTime) / 1000;
    if (elapsed >= duration) {
      stopCinematicParticles();
      return;
    }
    ctx.clearRect(0, 0, w, h);

    // 1. MƯA TIỀN RENDER
    if (isMoney) {
      const grad = ctx.createRadialGradient(w/2, h/2, 50, w/2, h/2, w*0.6);
      grad.addColorStop(0, 'rgba(0, 255, 136, 0.16)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      for (const item of moneyItems) {
        item.y += item.vy;
        item.x += item.vx;
        item.rotX += item.vrotX * 0.02;
        item.rotY += item.vrotY * 0.02;
        if (item.y > h + 50) {
          item.y = -40;
          item.x = Math.random() * w;
        }

        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate(item.rotX);

        if (item.isCoin) {
          ctx.beginPath();
          ctx.arc(0, 0, item.w * 0.35, 0, Math.PI * 2);
          ctx.fillStyle = '#ffd700';
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#ffd700';
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();
          ctx.font = `bold ${Math.round(item.w * 0.35)}px sans-serif`;
          ctx.fillStyle = '#b8860b';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('$', 0, 0);
        } else {
          ctx.scale(Math.cos(item.rotY), 1);
          ctx.fillStyle = '#00ff88';
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#00ff88';
          ctx.fillRect(-item.w / 2, -item.h / 2, item.w, item.h);
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = '#ffffff';
          ctx.strokeRect(-item.w / 2, -item.h / 2, item.w, item.h);
          ctx.font = `bold ${Math.round(item.h * 0.55)}px sans-serif`;
          ctx.fillStyle = '#052b14';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('$100', 0, 0);
        }
        ctx.restore();
      }

      ctx.font = 'bold 28px sans-serif';
      ctx.fillStyle = '#00ff88';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00ff88';
      ctx.textAlign = 'center';
      const tickerY = (h * 0.8) - ((elapsed * 45) % (h * 0.6));
      ctx.fillText('💸 +500 COINS 💸', w * 0.2, tickerY);
      ctx.fillText('💰 JACKPOT 💰', w * 0.8, tickerY + 40);
      ctx.shadowBlur = 0;
    }

    // 2. BUỔI HÒA NHẠC RENDER
    else if (isConcert) {
      const beamCount = 4;
      const colors = ['rgba(0, 242, 254, 0.25)', 'rgba(255, 8, 116, 0.25)', 'rgba(255, 215, 0, 0.22)', 'rgba(0, 255, 136, 0.22)'];
      for (let b = 0; b < beamCount; b++) {
        const originX = (b % 2 === 0) ? 0 : w;
        const sweep = Math.sin(elapsed * 2.5 + b * 1.5) * (w * 0.5) + (w * 0.5);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(originX, 0);
        ctx.lineTo(sweep - 120, h);
        ctx.lineTo(sweep + 120, h);
        ctx.closePath();
        ctx.fillStyle = colors[b];
        ctx.fill();
        ctx.restore();
      }

      const barCount = 28;
      const barWidth = w / barCount;
      for (let b = 0; b < barCount; b++) {
        const barHeight = (Math.sin(elapsed * 12 + b * 0.8) * 0.5 + 0.5) * 160 + 20;
        const grad = ctx.createLinearGradient(0, h, 0, h - barHeight);
        grad.addColorStop(0, '#00f2fe');
        grad.addColorStop(0.6, '#ff0874');
        grad.addColorStop(1, '#ffd700');
        ctx.fillStyle = grad;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00f2fe';
        ctx.fillRect(b * barWidth + 3, h - barHeight, barWidth - 6, barHeight);
      }
      ctx.shadowBlur = 0;

      for (const note of concertNotes) {
        note.x += note.vx;
        note.y += note.vy;
        note.rot += note.vrot * 0.02;
        if (note.x < -30 || note.x > w + 30 || note.y < -30 || note.y > h + 30) {
          note.x = w / 2;
          note.y = h / 2;
        }
        ctx.save();
        ctx.translate(note.x, note.y);
        ctx.rotate(note.rot);
        ctx.font = `bold ${note.size}px sans-serif`;
        ctx.fillStyle = note.color;
        ctx.shadowBlur = 16;
        ctx.shadowColor = note.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(note.symbol, 0, 0);
        ctx.restore();
      }
    }

    // 3. BÓNG BAY TÌNH YÊU RENDER
    else if (isHeart) {
      const wavePhase = (elapsed * 1.5) % 1.0;
      const waveRadius = wavePhase * (w * 0.45);
      ctx.save();
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, waveRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 51, 119, ${Math.max(0, (1 - wavePhase) * 0.6)})`;
      ctx.lineWidth = 4;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ff3377';
      ctx.stroke();
      ctx.restore();

      for (const b of heartBalloons) {
        b.y += b.vy;
        b.x += b.vx + Math.sin(elapsed * b.swaySpeed + b.swayOffset) * 0.8;
        if (b.y < -80) {
          b.y = h + 40;
          b.x = Math.random() * w;
        }

        ctx.save();
        ctx.translate(b.x, b.y);

        ctx.beginPath();
        ctx.moveTo(0, b.size * 0.5);
        ctx.bezierCurveTo(Math.sin(elapsed * 3) * 10, b.size * 1.1, -Math.sin(elapsed * 3) * 10, b.size * 1.6, 0, b.size * 2.2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        const topCurveHeight = b.size * 0.3;
        ctx.moveTo(0, topCurveHeight);
        ctx.bezierCurveTo(0, 0, -b.size * 0.5, 0, -b.size * 0.5, topCurveHeight);
        ctx.bezierCurveTo(-b.size * 0.5, b.size * 0.6, 0, b.size * 0.8, 0, b.size);
        ctx.bezierCurveTo(0, b.size * 0.8, b.size * 0.5, b.size * 0.6, b.size * 0.5, topCurveHeight);
        ctx.bezierCurveTo(b.size * 0.5, 0, 0, 0, 0, topCurveHeight);
        ctx.closePath();

        const grad = ctx.createRadialGradient(-b.size*0.15, topCurveHeight*0.8, b.size*0.05, 0, topCurveHeight, b.size*0.6);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.35, b.color);
        grad.addColorStop(1, '#880033');
        ctx.fillStyle = grad;
        ctx.shadowBlur = 18;
        ctx.shadowColor = b.color;
        ctx.fill();
        ctx.restore();
      }

      for (const p of rosePetals) {
        p.y += p.vy;
        p.x += p.vx + Math.sin(elapsed * 2.2) * 1.2;
        p.rot += p.vrot * 0.02;
        if (p.y > h + 30) {
          p.y = -20;
          p.x = Math.random() * w;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 8, 116, 0.85)';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ff0874';
        ctx.fill();
        ctx.restore();
      }
    }

    // 4. QUẢ CẦU DISCO RENDER
    else if (isDisco) {
      const beamCount = 16;
      ctx.save();
      ctx.translate(w / 2, 70);
      for (let b = 0; b < beamCount; b++) {
        const angle = (b / beamCount) * Math.PI * 2 + elapsed * 1.4;
        const beamHue = (b * (360 / beamCount) + elapsed * 80) % 360;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * Math.max(w, h) * 1.4, Math.sin(angle) * Math.max(w, h) * 1.4);
        ctx.strokeStyle = `hsla(${beamHue}, 100%, 65%, 0.55)`;
        ctx.lineWidth = 5 + Math.sin(elapsed * 10 + b) * 3;
        ctx.shadowBlur = 25;
        ctx.shadowColor = `hsl(${beamHue}, 100%, 65%)`;
        ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      ctx.translate(w / 2, 70);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -70);
      ctx.lineTo(0, 0);
      ctx.stroke();

      const ballRadius = 55;
      const sphereGrad = ctx.createRadialGradient(-15, -15, 10, 0, 0, ballRadius);
      sphereGrad.addColorStop(0, '#ffffff');
      sphereGrad.addColorStop(0.5, '#b0c4de');
      sphereGrad.addColorStop(1, '#1a1a2e');
      ctx.fillStyle = sphereGrad;
      ctx.beginPath();
      ctx.arc(0, 0, ballRadius, 0, Math.PI * 2);
      ctx.shadowBlur = 35;
      ctx.shadowColor = '#00f2fe';
      ctx.fill();

      for (const m of discoMirrors) {
        const curAngle = m.angle + elapsed * 1.8;
        const curX = Math.cos(curAngle) * m.radius;
        const curY = Math.sin(curAngle) * (m.radius * 0.45);
        if (Math.sin(curAngle) > 0) {
          ctx.beginPath();
          ctx.arc(curX, curY, m.size, 0, Math.PI * 2);
          ctx.fillStyle = m.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = m.color;
          ctx.fill();
        }
      }
      ctx.restore();

      const gridCols = 10;
      const tileW = w / gridCols;
      const tileH = 45;
      for (let c = 0; c < gridCols; c++) {
        const hue = ((c * 36) + Math.floor(elapsed * 4) * 60) % 360;
        ctx.fillStyle = `hsla(${hue}, 90%, 55%, 0.35)`;
        ctx.fillRect(c * tileW, h - tileH, tileW - 2, tileH);
      }
    }

    // 5. HUYỀN THOẠI RENDER
    else if (isLegend) {
      const grad = ctx.createRadialGradient(w/2, h/2, 60, w/2, h/2, w*0.7);
      grad.addColorStop(0, 'rgba(255, 136, 0, 0.22)');
      grad.addColorStop(0.7, 'rgba(255, 0, 0, 0.12)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      const slashAlpha = Math.max(0, Math.sin(elapsed * 3.5));
      ctx.save();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 10;
      ctx.shadowBlur = 35;
      ctx.shadowColor = '#ffd700';
      ctx.globalAlpha = slashAlpha;

      ctx.beginPath();
      ctx.moveTo(w * 0.15, h * 0.15);
      ctx.lineTo(w * 0.85, h * 0.85);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(w * 0.85, h * 0.15);
      ctx.lineTo(w * 0.15, h * 0.85);
      ctx.stroke();

      ctx.strokeStyle = '#ff8800';
      ctx.lineWidth = 22;
      ctx.globalAlpha = slashAlpha * 0.65;
      ctx.beginPath();
      ctx.moveTo(w * 0.15, h * 0.15);
      ctx.lineTo(w * 0.85, h * 0.85);
      ctx.moveTo(w * 0.85, h * 0.15);
      ctx.lineTo(w * 0.15, h * 0.85);
      ctx.stroke();
      ctx.restore();

      for (const sp of swordSparks) {
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.life += 0.016;
        if (sp.life >= sp.maxLife) {
          sp.x = w / 2;
          sp.y = h / 2;
          sp.life = 0;
          const a = Math.random() * Math.PI * 2;
          const s = 4 + Math.random() * 11;
          sp.vx = Math.cos(a) * s;
          sp.vy = Math.sin(a) * s;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fillStyle = sp.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = sp.color;
        ctx.fill();
        ctx.restore();
      }
    }

    // 3b. THIÊN NGA RENDER (Lông vũ trắng hồng lướt sóng)
    else if (isSwan) {
      const swanGrad = ctx.createRadialGradient(w/2, h/2, 60, w/2, h/2, w*0.6);
      swanGrad.addColorStop(0, 'rgba(255, 117, 143, 0.22)');
      swanGrad.addColorStop(0.5, 'rgba(255, 209, 220, 0.12)');
      swanGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = swanGrad;
      ctx.fillRect(0, 0, w, h);

      for (const f of swanFeathers) {
        f.y += f.vy;
        f.x += Math.sin(elapsed * f.swaySpeed + f.phase) * 1.5;
        f.rot += f.vrot * 0.02;
        if (f.y > h + 40) {
          f.y = -30;
          f.x = Math.random() * w;
        }
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, f.size * 0.35, f.size, 0, 0, Math.PI * 2);
        ctx.fillStyle = f.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff758f';
        ctx.fill();
        ctx.restore();
      }
    }

    // 4b. GALAXY RENDER (Vũ trụ xoắn ốc 3 nhánh)
    else if (isGalaxy) {
      const galGrad = ctx.createRadialGradient(w/2, h/2, 50, w/2, h/2, w*0.65);
      galGrad.addColorStop(0, 'rgba(0, 242, 254, 0.25)');
      galGrad.addColorStop(0.4, 'rgba(157, 78, 221, 0.2)');
      galGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = galGrad;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.translate(w / 2, h / 2);
      for (const s of galaxyStars) {
        const curAngle = s.baseAngle + elapsed * s.speed;
        const curX = Math.cos(curAngle) * s.dist;
        const curY = Math.sin(curAngle) * (s.dist * 0.65);
        ctx.beginPath();
        ctx.arc(curX, curY, s.size, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = s.color;
        ctx.fill();
      }
      ctx.restore();
    }

    // 5b. CÁ VOI LẶN RENDER (Bọt khí dạ quang & sóng biển sapphire)
    else if (isWhale) {
      const oceanGrad = ctx.createRadialGradient(w/2, h/2, 60, w/2, h/2, w*0.7);
      oceanGrad.addColorStop(0, 'rgba(0, 180, 216, 0.26)');
      oceanGrad.addColorStop(0.6, 'rgba(3, 4, 94, 0.22)');
      oceanGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, w, h);

      for (const b of whaleBubbles) {
        b.y += b.vy;
        b.x += b.vx + Math.sin(elapsed * 2 + b.radius) * 0.8;
        if (b.y < -30) {
          b.y = h + 20;
          b.x = Math.random() * w;
        }
        ctx.save();
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.strokeStyle = b.glow;
        ctx.lineWidth = 1.5;
        ctx.fillStyle = 'rgba(0, 255, 255, 0.15)';
        ctx.shadowBlur = 14;
        ctx.shadowColor = b.glow;
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }

    // 5c. PRIVATE JET RENDER (Vệt tốc độ siêu thanh Mach 2)
    else if (isJet) {
      const jetGrad = ctx.createLinearGradient(0, 0, w, 0);
      jetGrad.addColorStop(0, 'rgba(255, 170, 0, 0.25)');
      jetGrad.addColorStop(0.5, 'rgba(255, 215, 0, 0.15)');
      jetGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = jetGrad;
      ctx.fillRect(0, 0, w, h);

      for (const st of jetStreaks) {
        st.x += st.vx;
        st.y += st.vy;
        if (st.x > w + 200) {
          st.x = -st.len - 50;
          st.y = Math.random() * h;
        }
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(st.x, st.y);
        ctx.lineTo(st.x - st.len, st.y);
        ctx.strokeStyle = st.color;
        ctx.lineWidth = st.width;
        ctx.shadowBlur = 18;
        ctx.shadowColor = '#ffd700';
        ctx.stroke();
        ctx.restore();
      }
    }

    // 5d. PHÁO KIM CƯƠNG RENDER (Tinh thể pha lê nổ tung 7 màu)
    else if (isDiamond) {
      const prismGrad = ctx.createRadialGradient(w/2, h/2, 60, w/2, h/2, w*0.65);
      prismGrad.addColorStop(0, 'rgba(255, 0, 127, 0.26)');
      prismGrad.addColorStop(0.5, 'rgba(0, 242, 254, 0.18)');
      prismGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = prismGrad;
      ctx.fillRect(0, 0, w, h);

      for (const cr of diamondCrystals) {
        cr.x += cr.vx;
        cr.y += cr.vy;
        cr.rot += cr.vrot * 0.02;
        if (cr.x < -40 || cr.x > w + 40 || cr.y < -40 || cr.y > h + 40) {
          cr.x = w / 2;
          cr.y = h / 2;
        }
        ctx.save();
        ctx.translate(cr.x, cr.y);
        ctx.rotate(cr.rot);
        ctx.beginPath();
        ctx.moveTo(0, -cr.size);
        ctx.lineTo(cr.size * 0.7, 0);
        ctx.lineTo(0, cr.size);
        ctx.lineTo(-cr.size * 0.7, 0);
        ctx.closePath();
        ctx.fillStyle = cr.color;
        ctx.shadowBlur = 16;
        ctx.shadowColor = cr.color;
        ctx.fill();
        ctx.restore();
      }
    }

    // 6. DRAMA QUEEN RENDER
    else if (isQueen) {
      const auroraGrad = ctx.createLinearGradient(0, 0, w, h);
      auroraGrad.addColorStop(0, 'rgba(121, 40, 202, 0.28)');
      auroraGrad.addColorStop(0.5, 'rgba(255, 0, 128, 0.22)');
      auroraGrad.addColorStop(1, 'rgba(255, 215, 0, 0.25)');
      ctx.fillStyle = auroraGrad;
      ctx.fillRect(0, 0, w, h);

      for (const d of diamondDrops) {
        d.y += d.vy;
        d.x += d.vx;
        d.rot += d.vrot * 0.02;
        if (d.y > h + 50) {
          d.y = -40;
          d.x = Math.random() * w;
        }

        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.rot);
        ctx.font = `${d.size}px sans-serif`;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ffd700';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(d.symbol, 0, 0);
        ctx.restore();
      }
    }

    // 7. ULTRA: CHUYẾN BAY THƯƠNG GIA (AIRPLANE VIP 6,000🪙)
    else if (isAirplane) {
      // Bầu trời đêm hoàng hôn cao tầng
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, 'rgba(15, 23, 42, 0.45)');
      skyGrad.addColorStop(0.5, 'rgba(30, 58, 138, 0.35)');
      skyGrad.addColorStop(1, 'rgba(217, 119, 6, 0.25)');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Đèn đường băng nhấp nháy bên dưới
      ctx.save();
      const rwY = h - 35;
      for (const rm of runwayMarkers) {
        ctx.beginPath();
        ctx.arc(rm.x, rwY, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = rm.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = rm.color;
        ctx.fill();
      }
      ctx.restore();

      // Vệt mây hoàng hôn cao tầng trôi nhẹ hòa quyện cùng phi cơ 3D
      ctx.save();
      ctx.fillStyle = 'rgba(255, 215, 0, 0.08)';
      for (let c = 0; c < 3; c++) {
        const cloudX = ((elapsed * 45 + c * (w / 3)) % (w + 240)) - 120;
        const cloudY = h * (0.22 + c * 0.12);
        ctx.beginPath();
        ctx.ellipse(cloudX, cloudY, 130, 24, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Vé VIP máy bay rơi nhẹ bồng bềnh
      for (const tk of airplaneTickets) {
        tk.y += tk.vy;
        tk.x += tk.vx;
        tk.rot += tk.vrot * 0.02;
        if (tk.y > h + 50) {
          tk.y = -40;
          tk.x = Math.random() * w;
        }
        ctx.save();
        ctx.translate(tk.x, tk.y);
        ctx.rotate(tk.rot);
        ctx.fillStyle = 'rgba(255, 215, 0, 0.22)';
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffd700';
        ctx.fillRect(-tk.w/2, -tk.h/2, tk.w, tk.h);
        ctx.strokeRect(-tk.w/2, -tk.h/2, tk.w, tk.h);
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✈️ VIP PASS', 0, 0);
        ctx.restore();
      }
    }

    // 8. ULTRA: BÁO ĐÊM BÁ CHỦ (SHADOW PANTHER 10,000🪙)
    else if (isPanther) {
      // Vignette tím huyền bí bao phủ
      const darkGrad = ctx.createRadialGradient(w/2, h/2, 80, w/2, h/2, Math.max(w, h) * 0.75);
      darkGrad.addColorStop(0, 'rgba(15, 5, 29, 0.1)');
      darkGrad.addColorStop(0.7, 'rgba(24, 9, 46, 0.45)');
      darkGrad.addColorStop(1, 'rgba(10, 2, 20, 0.85)');
      ctx.fillStyle = darkGrad;
      ctx.fillRect(0, 0, w, h);

      // Đôi mắt báo vàng rực trong màn đêm
      ctx.save();
      const eyeAlpha = 0.5 + Math.sin(elapsed * 5) * 0.45;
      ctx.fillStyle = `rgba(250, 204, 21, ${eyeAlpha})`;
      ctx.shadowBlur = 25;
      ctx.shadowColor = '#facc15';
      ctx.beginPath();
      ctx.ellipse(w/2 - 85, h * 0.32, 22, 9, -0.15, 0, Math.PI * 2);
      ctx.ellipse(w/2 + 85, h * 0.32, 22, 9, 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 3 Vết vuốt cào xé toạc không gian
      const slashAlpha = Math.min(1.0, Math.max(0, Math.sin(elapsed * 3.5)));
      ctx.save();
      ctx.globalAlpha = slashAlpha;
      const clawOffsets = [-55, 0, 55];
      for (const off of clawOffsets) {
        // Vết rạch tím neon
        ctx.beginPath();
        ctx.moveTo(w * 0.82 + off, h * 0.15 - off * 0.5);
        ctx.lineTo(w * 0.18 + off, h * 0.85 - off * 0.5);
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 16;
        ctx.shadowBlur = 35;
        ctx.shadowColor = '#a855f7';
        ctx.stroke();

        // Lõi trắng sáng cắt sâu
        ctx.beginPath();
        ctx.moveTo(w * 0.82 + off, h * 0.15 - off * 0.5);
        ctx.lineTo(w * 0.18 + off, h * 0.85 - off * 0.5);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.stroke();
      }
      ctx.restore();

      // Tia lửa tím nổ tung
      for (const sp of pantherSparks) {
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.life += 0.016;
        if (sp.life >= sp.maxLife) {
          sp.x = w * 0.5 + (Math.random() - 0.5) * 300;
          sp.y = h * 0.5 + (Math.random() - 0.5) * 300;
          sp.life = 0;
        }
        ctx.save();
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fillStyle = sp.color;
        ctx.shadowBlur = 14;
        ctx.shadowColor = sp.color;
        ctx.fill();
        ctx.restore();
      }
    }

    // 9. ULTRA: PHƯỢNG HOÀNG TÁI SINH (PHOENIX 25,999🪙)
    else if (isPhoenix) {
      // Hào quang Godrays 360 độ rực rỡ từ tâm
      ctx.save();
      ctx.translate(w/2, h/2);
      const rayCount = 18;
      for (let r = 0; r < rayCount; r++) {
        const rayAngle = (r / rayCount) * Math.PI * 2 + elapsed * 0.35;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(rayAngle - 0.08) * Math.max(w, h), Math.sin(rayAngle - 0.08) * Math.max(w, h));
        ctx.lineTo(Math.cos(rayAngle + 0.08) * Math.max(w, h), Math.sin(rayAngle + 0.08) * Math.max(w, h));
        ctx.closePath();
        ctx.fillStyle = (r % 2 === 0) ? 'rgba(255, 69, 0, 0.12)' : 'rgba(255, 215, 0, 0.16)';
        ctx.fill();
      }
      ctx.restore();

      // Lốc tàn lửa bùng lên
      for (const em of phoenixEmbers) {
        em.y += em.vy;
        em.x += em.vx + Math.sin(elapsed * 3 + em.size) * 1.5;
        if (em.y < -30) {
          em.y = h + 20;
          em.x = w * 0.5 + (Math.random() - 0.5) * 320;
        }
        ctx.save();
        ctx.beginPath();
        ctx.arc(em.x, em.y, em.size, 0, Math.PI * 2);
        ctx.fillStyle = em.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = em.color;
        ctx.fill();
        ctx.restore();
      }

      // PHƯỢNG HOÀNG 2D KHỔNG LỒ (Chỉ xuất hiện sau khi trứng 3D nổ: elapsed >= duration * 0.32)
      if (elapsed >= duration * 0.32) {
        const phSubProg = Math.min(1.0, (elapsed - duration * 0.32) / (duration * 0.68));
        let phX = w / 2;
        let phY = h * 0.44;
        let phTilt = 0;
        let phAlpha = 1.0;

        if (phSubProg < 0.62) {
          // Giai đoạn 1: Bay lượn xoắn ốc hộ tống quanh Avatar trung tâm
          const pOrbit = phSubProg / 0.62;
          const orbitAngle = pOrbit * Math.PI * 3.5;
          const rX = Math.min(w * 0.28, 220) * (1.1 - pOrbit * 0.25);
          const rY = Math.min(h * 0.18, 140) * (1.1 - pOrbit * 0.25);
          phX = w / 2 + Math.cos(orbitAngle) * rX;
          phY = h * 0.44 + Math.sin(orbitAngle) * rY;
          phTilt = Math.sin(orbitAngle) * 0.25;
        } else {
          // Giai đoạn 2: Bay vút lên trời cao và biến mất hoàn toàn
          const pAsc = (phSubProg - 0.62) / 0.38;
          phX = w / 2 + Math.sin(pAsc * Math.PI * 2) * 35;
          phY = (h * 0.44 - 100) - pAsc * (h * 0.85);
          phTilt = 0;
          phAlpha = Math.max(0, 1.0 - pAsc * 1.35);
        }

        const wingFlap = Math.sin(elapsed * 9.0) * 35;

        ctx.save();
        ctx.globalAlpha = phAlpha;
        ctx.translate(phX, phY);
        ctx.rotate(phTilt);

        // Đôi cánh lửa dang rộng 2 bên
        const wingGrad = ctx.createLinearGradient(-w * 0.38, 0, w * 0.38, 0);
        wingGrad.addColorStop(0, '#ff4500');
        wingGrad.addColorStop(0.35, '#ff8c00');
        wingGrad.addColorStop(0.5, '#ffd700');
        wingGrad.addColorStop(0.65, '#ff8c00');
        wingGrad.addColorStop(1, '#ff4500');
        ctx.fillStyle = wingGrad;
        ctx.shadowBlur = 35;
        ctx.shadowColor = '#ff4500';

        // Cánh trái
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-w * 0.15, -40 + wingFlap, -w * 0.32, -80 + wingFlap, -w * 0.42, 20 + wingFlap);
        ctx.bezierCurveTo(-w * 0.30, 40 + wingFlap, -w * 0.18, 20 + wingFlap, 0, 30);
        ctx.closePath();
        ctx.fill();

        // Cánh phải
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(w * 0.15, -40 + wingFlap, w * 0.32, -80 + wingFlap, w * 0.42, 20 + wingFlap);
        ctx.bezierCurveTo(w * 0.30, 40 + wingFlap, w * 0.18, 20 + wingFlap, 0, 30);
        ctx.closePath();
        ctx.fill();

        // 5 Dải lông đuôi mềm mại lượn sóng
        for (let t = -2; t <= 2; t++) {
          const tailX = t * 24;
          const wave = Math.sin(elapsed * 6 + t * 0.8) * 30;
          ctx.beginPath();
          ctx.moveTo(tailX * 0.3, 25);
          ctx.bezierCurveTo(tailX + wave * 0.5, 90, tailX - wave, 170, tailX + wave, 240);
          ctx.strokeStyle = (Math.abs(t) <= 1) ? '#ffd700' : '#ff4500';
          ctx.lineWidth = 5 - Math.abs(t);
          ctx.shadowBlur = 18;
          ctx.shadowColor = '#ffd700';
          ctx.stroke();
        }

        // Đầu & vương miện lửa Phượng Hoàng
        ctx.beginPath();
        ctx.arc(0, -25, 16, 0, Math.PI * 2);
        ctx.fillStyle = '#ffd700';
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-12, -35);
        ctx.lineTo(0, -55);
        ctx.lineTo(12, -35);
        ctx.closePath();
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();
      }

      // Lông vũ Phượng Hoàng vàng óng rơi nhẹ
      for (const ft of phoenixFeathers) {
        ft.y += ft.vy;
        ft.x += Math.sin(elapsed * ft.swaySpeed + ft.phase) * 1.5;
        ft.rot += ft.vrot * 0.02;
        if (ft.y > h + 40) {
          ft.y = -30;
          ft.x = Math.random() * w;
        }
        ctx.save();
        ctx.translate(ft.x, ft.y);
        ctx.rotate(ft.rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, ft.size * 0.3, ft.size, 0, 0, Math.PI * 2);
        ctx.fillStyle = ft.color;
        ctx.shadowBlur = 14;
        ctx.shadowColor = '#ffd700';
        ctx.fill();
        ctx.restore();
      }
    }

    // 10. ULTRA: HỔ LỬA CUỒNG NỘ (FIRE TIGER 26,999🪙)
    else if (isTiger) {
      // Nham thạch rực lửa nền
      const lavaGrad = ctx.createRadialGradient(w/2, h/2, 50, w/2, h/2, Math.max(w, h) * 0.7);
      lavaGrad.addColorStop(0, 'rgba(255, 69, 0, 0.28)');
      lavaGrad.addColorStop(0.5, 'rgba(185, 28, 28, 0.22)');
      lavaGrad.addColorStop(1, 'rgba(15, 2, 2, 0.75)');
      ctx.fillStyle = lavaGrad;
      ctx.fillRect(0, 0, w, h);

      // ĐẦU HỔ LỬA 2D GẦM THÉP Ở NỀN TRÊN
      ctx.save();
      const tigerY = h * 0.28 + Math.sin(elapsed * 3) * 8;
      ctx.translate(w/2, tigerY);
      // Mắt hổ rực lửa
      ctx.fillStyle = '#ffd700';
      ctx.shadowBlur = 30;
      ctx.shadowColor = '#ff3d00';
      ctx.beginPath();
      ctx.ellipse(-65, -15, 20, 9, -0.2, 0, Math.PI * 2);
      ctx.ellipse(65, -15, 20, 9, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Vằn hổ lửa 2 bên má
      ctx.strokeStyle = '#ff3d00';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(-110, -5); ctx.lineTo(-75, 10);
      ctx.moveTo(-115, 20); ctx.lineTo(-80, 28);
      ctx.moveTo(110, -5);  ctx.lineTo(75, 10);
      ctx.moveTo(115, 20);  ctx.lineTo(80, 28);
      ctx.stroke();

      // Nanh hổ vàng sáng
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-35, 45); ctx.lineTo(-25, 75); ctx.lineTo(-15, 45);
      ctx.moveTo(15, 45);  ctx.lineTo(25, 75);  ctx.lineTo(35, 45);
      ctx.fill();
      ctx.restore();

      // VÒNG LỬA KHỔNG LỒ RỰC CHÁY Ở TRUNG TÂM (Cho Slime 3D nhảy xuyên qua!)
      ctx.save();
      ctx.translate(w/2, h * 0.44);
      const hoopR = Math.min(w, h) * 0.22;

      // Vòng tròn lửa rực sáng
      ctx.beginPath();
      ctx.arc(0, 0, hoopR, 0, Math.PI * 2);
      ctx.strokeStyle = '#ff5500';
      ctx.lineWidth = 14;
      ctx.shadowBlur = 35;
      ctx.shadowColor = '#ff3d00';
      ctx.stroke();

      // Vòng trong vàng rực
      ctx.beginPath();
      ctx.arc(0, 0, hoopR, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 4;
      ctx.stroke();

      // 24 Lưỡi lửa nhấp nhô quanh vòng
      for (let i = 0; i < 24; i++) {
        const ang = (i / 24) * Math.PI * 2 + elapsed * 1.5;
        const flLen = 15 + Math.sin(elapsed * 12 + i * 2) * 10;
        const x1 = Math.cos(ang) * (hoopR - 6);
        const y1 = Math.sin(ang) * (hoopR - 6);
        const x2 = Math.cos(ang) * (hoopR + flLen);
        const y2 = Math.sin(ang) * (hoopR + flLen);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = (i % 2 === 0) ? '#ffaa00' : '#ff2200';
        ctx.lineWidth = 5;
        ctx.stroke();
      }

      // Hạt lửa xoay quanh vòng
      for (const tf of tigerFlames) {
        const curAng = tf.angle + elapsed * tf.speed;
        const tx = Math.cos(curAng) * tf.dist;
        const ty = Math.sin(curAng) * tf.dist;
        ctx.beginPath();
        ctx.arc(tx, ty, tf.size, 0, Math.PI * 2);
        ctx.fillStyle = tf.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = tf.color;
        ctx.fill();
      }
      ctx.restore();
    }

    // 11. ULTRA: CHÚA TỂ RỪNG XANH - SƯ TỬ (LION KING 29,999🪙)
    else if (isLion) {
      // Nền vương giả vàng kim rực sáng
      const royalGrad = ctx.createRadialGradient(w/2, h/2, 60, w/2, h/2, Math.max(w, h) * 0.72);
      royalGrad.addColorStop(0, 'rgba(255, 215, 0, 0.32)');
      royalGrad.addColorStop(0.5, 'rgba(217, 119, 6, 0.22)');
      royalGrad.addColorStop(1, 'rgba(15, 8, 0, 0.75)');
      ctx.fillStyle = royalGrad;
      ctx.fillRect(0, 0, w, h);

      // Cột sáng hoàng gia chiếu dọc từ trên xuống
      ctx.save();
      const beamGrad = ctx.createLinearGradient(0, 0, 0, h);
      beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      beamGrad.addColorStop(0.4, 'rgba(255, 215, 0, 0.3)');
      beamGrad.addColorStop(1, 'rgba(255, 170, 0, 0.1)');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(w * 0.35, 0, w * 0.3, h);

      // Mặt trời rực rỡ 24 tia xoay quanh tâm
      ctx.translate(w/2, h/2);
      ctx.rotate(elapsed * 0.2);
      const rayNum = 24;
      for (let i = 0; i < rayNum; i++) {
        const a = (i / rayNum) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a - 0.05) * Math.max(w, h) * 0.8, Math.sin(a - 0.05) * Math.max(w, h) * 0.8);
        ctx.lineTo(Math.cos(a + 0.05) * Math.max(w, h) * 0.8, Math.sin(a + 0.05) * Math.max(w, h) * 0.8);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 215, 0, 0.08)';
        ctx.fill();
      }
      ctx.restore();

      // MƯA THỎI VÀNG 24K, KIM CƯƠNG VÀ ĐỒNG XU SƯ TỬ
      for (const item of lionGoldBars) {
        item.y += item.vy;
        item.x += item.vx;
        item.rot += item.vrot * 0.02;
        if (item.y > h + 50) {
          item.y = -40;
          item.x = Math.random() * w;
        }
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate(item.rot);

        if (item.kind === 'bar') {
          // Thỏi vàng 24K bóng bẩy
          ctx.fillStyle = '#ffd700';
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#ffd700';
          ctx.fillRect(-item.size, -item.size * 0.5, item.size * 2, item.size);
          ctx.strokeStyle = '#fff8dc';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-item.size, -item.size * 0.5, item.size * 2, item.size);
          ctx.font = `bold ${Math.round(item.size * 0.5)}px sans-serif`;
          ctx.fillStyle = '#8b6914';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('24K', 0, 0);
        } else if (item.kind === 'coin') {
          // Đồng xu vàng sư tử
          ctx.beginPath();
          ctx.arc(0, 0, item.size * 0.7, 0, Math.PI * 2);
          ctx.fillStyle = '#ffea00';
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#ffd700';
          ctx.fill();
          ctx.font = `${Math.round(item.size * 0.8)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🦁', 0, 0);
        } else {
          // Kim cương hoàng gia
          ctx.font = `${Math.round(item.size * 1.1)}px sans-serif`;
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#00f2fe';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('💎', 0, 0);
        }
        ctx.restore();
      }
    }

    // 12. ULTRA: NGỰA THẦN THIÊN GIỚI (PEGASUS 34,000🪙)
    else if (isPegasus) {
      // Dải Cực Quang Aurora Borealis uyển chuyển 3 dải màu
      const aurColors = [
        'rgba(0, 242, 254, 0.18)',
        'rgba(168, 85, 247, 0.18)',
        'rgba(244, 63, 94, 0.15)'
      ];
      for (let l = 0; l < 3; l++) {
        ctx.beginPath();
        ctx.moveTo(0, h * (0.2 + l * 0.12));
        for (let x = 0; x <= w; x += 40) {
          const waveY = h * (0.2 + l * 0.12) + Math.sin(elapsed * 2 + x * 0.005 + l * 1.5) * 55;
          ctx.lineTo(x, waveY);
        }
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fillStyle = aurColors[l];
        ctx.fill();
      }

      // Sao băng bay xé ngang bầu trời
      for (const st of pegasusStars) {
        st.x += st.vx;
        st.y += st.vy;
        if (st.x < -150 || st.y > h + 100) {
          st.x = w * 0.5 + Math.random() * w * 0.7;
          st.y = Math.random() * h * 0.4;
        }
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(st.x, st.y);
        ctx.lineTo(st.x - st.vx * 3.5, st.y - st.vy * 3.5);
        ctx.strokeStyle = st.color;
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 15;
        ctx.shadowColor = st.color;
        ctx.stroke();
        ctx.restore();
      }

      // NGỰA THẦN PEGASUS 2D PHI NƯỚC ĐẠI (Luminous Vector Artwork)
      const pegProg = Math.min(1.0, elapsed / duration);
      const pegX = -200 + pegProg * (w + 400);
      const pegY = h * 0.32 + Math.sin(elapsed * 5.0) * 25;
      const wingFlap = Math.sin(elapsed * 7.5) * 35;

      ctx.save();
      ctx.translate(pegX, pegY);

      // Vòng hào quang chân ngựa (bước chân sao dạ quang)
      ctx.beginPath();
      ctx.arc(-25, 45, 18, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 242, 254, 0.35)';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#00f2fe';
      ctx.fill();

      // Cánh thiên thần Pegasus (2 tầng cánh lông vũ phát quang)
      const pegWingGrad = ctx.createLinearGradient(-40, -wingFlap, 50, wingFlap);
      pegWingGrad.addColorStop(0, '#ffffff');
      pegWingGrad.addColorStop(0.4, '#e0e7ff');
      pegWingGrad.addColorStop(0.7, '#38bdf8');
      pegWingGrad.addColorStop(1, '#c084fc');
      ctx.fillStyle = pegWingGrad;
      ctx.shadowBlur = 25;
      ctx.shadowColor = '#00f2fe';

      // Cánh lớn chính
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.bezierCurveTo(25, -60 + wingFlap, 65, -100 + wingFlap, 95, -30 + wingFlap);
      ctx.bezierCurveTo(70, 10 + wingFlap, 35, 5 + wingFlap, 5, 5);
      ctx.closePath();
      ctx.fill();

      // Cánh phụ nhỏ
      ctx.beginPath();
      ctx.moveTo(-10, -5);
      ctx.bezierCurveTo(10, -45 + wingFlap * 0.8, 45, -75 + wingFlap * 0.8, 68, -20 + wingFlap * 0.8);
      ctx.bezierCurveTo(50, 10 + wingFlap * 0.8, 25, 5 + wingFlap * 0.8, -5, 5);
      ctx.closePath();
      ctx.fill();

      // Thân Ngựa Thần Dạ Quang (Starlight Pegasus Body)
      ctx.save();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#38bdf8';
      ctx.fillStyle = 'rgba(240, 248, 255, 0.92)';

      // Thân chính + Ngực vạm vỡ + Cổ vươn kiêu hãnh
      ctx.beginPath();
      ctx.moveTo(-50, 15); // Hông
      ctx.bezierCurveTo(-20, 20, 10, 15, 25, 5); // Lưng
      ctx.bezierCurveTo(35, -15, 45, -40, 52, -55); // Cổ vươn
      ctx.bezierCurveTo(55, -65, 65, -65, 70, -58); // Đỉnh đầu
      ctx.bezierCurveTo(78, -50, 80, -42, 68, -38); // Mõm
      ctx.bezierCurveTo(55, -32, 42, -10, 38, 15); // Ức ngực
      ctx.bezierCurveTo(30, 32, -10, 35, -45, 28); // Bụng
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Tai ngựa nhọn kiêu hãnh
      ctx.beginPath();
      ctx.moveTo(56, -62);
      ctx.lineTo(62, -78);
      ctx.lineTo(67, -64);
      ctx.closePath();
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Sừng Thần Alicorn Xoắn Vàng Phát Quang trên trán
      const hornGrad = ctx.createLinearGradient(60, -60, 88, -92);
      hornGrad.addColorStop(0, '#ffd700');
      hornGrad.addColorStop(0.5, '#fff8dc');
      hornGrad.addColorStop(1, '#ffffff');
      ctx.beginPath();
      ctx.moveTo(63, -60);
      ctx.lineTo(88, -92);
      ctx.lineTo(69, -56);
      ctx.closePath();
      ctx.fillStyle = hornGrad;
      ctx.shadowBlur = 25;
      ctx.shadowColor = '#ffd700';
      ctx.fill();

      // Mắt ngựa xanh ngọc bích lấp lánh
      ctx.beginPath();
      ctx.arc(62, -48, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#00f2fe';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00f2fe';
      ctx.fill();

      // Bờm ngựa starlight tím pastel lượn sóng
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 3.5;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#c084fc';
      for (let m = 0; m < 4; m++) {
        const my = -50 + m * 12;
        const wave = Math.sin(elapsed * 6 + m) * 12;
        ctx.beginPath();
        ctx.moveTo(50 - m * 5, my);
        ctx.quadraticCurveTo(25 - m * 6, my - 10 + wave, 10 - m * 8, my - 5 + wave);
        ctx.stroke();
      }

      // Đuôi ngựa bay xòe trong gió
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#38bdf8';
      for (let t = 0; t < 4; t++) {
        const tw = Math.sin(elapsed * 7 + t * 0.5) * 15;
        ctx.beginPath();
        ctx.moveTo(-48, 18);
        ctx.bezierCurveTo(-75, 10 + tw, -100, 25 + tw, -120, 15 + tw);
        ctx.stroke();
      }

      // 4 Chân phi nước đại (Galloping Hooves)
      ctx.strokeStyle = 'rgba(240, 248, 255, 0.95)';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';

      // Chân trước 1 & 2
      const fLeg1 = Math.sin(elapsed * 10) * 20;
      ctx.beginPath();
      ctx.moveTo(30, 20);
      ctx.lineTo(45 + fLeg1, 48);
      ctx.lineTo(55 + fLeg1, 62);
      ctx.stroke();

      const fLeg2 = Math.sin(elapsed * 10 + Math.PI) * 20;
      ctx.beginPath();
      ctx.moveTo(35, 18);
      ctx.lineTo(25 + fLeg2, 45);
      ctx.lineTo(32 + fLeg2, 60);
      ctx.stroke();

      // Chân sau 1 & 2
      const bLeg1 = Math.sin(elapsed * 10 + 1.2) * 22;
      ctx.beginPath();
      ctx.moveTo(-40, 25);
      ctx.lineTo(-60 + bLeg1, 50);
      ctx.lineTo(-72 + bLeg1, 62);
      ctx.stroke();

      const bLeg2 = Math.sin(elapsed * 10 + Math.PI + 1.2) * 22;
      ctx.beginPath();
      ctx.moveTo(-35, 25);
      ctx.lineTo(-50 + bLeg2, 48);
      ctx.lineTo(-58 + bLeg2, 58);
      ctx.stroke();

      // Móng ngựa mạ vàng kim
      ctx.fillStyle = '#ffd700';
      ctx.shadowColor = '#ffd700';
      [[55 + fLeg1, 62], [32 + fLeg2, 60], [-72 + bLeg1, 62], [-58 + bLeg2, 58]].forEach(([hx, hy]) => {
        ctx.fillRect(hx - 3, hy, 7, 5);
      });

      ctx.restore();
      ctx.restore();
    }

    // 13. ULTRA: VŨ TRỤ TIKTOK TỐI THƯỢNG (TIKTOK UNIVERSE 44,999🪙)
    else if (isUniverse) {
      // Vụ nổ Big Bang / Siêu tân tinh lan tỏa
      const bbProg = Math.min(1.0, elapsed / 1.5);
      const shockwaveR = bbProg * (Math.max(w, h) * 0.85);
      ctx.save();
      ctx.beginPath();
      ctx.arc(w/2, h/2, shockwaveR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 242, 254, ${Math.max(0, 1 - bbProg)})`;
      ctx.lineWidth = 8;
      ctx.shadowBlur = 30;
      ctx.shadowColor = '#00f2fe';
      ctx.stroke();

      // Sóng xung kích thứ 2 (Hồng neon TikTok)
      if (elapsed > 0.4) {
        const bbProg2 = Math.min(1.0, (elapsed - 0.4) / 1.5);
        ctx.beginPath();
        ctx.arc(w/2, h/2, bbProg2 * (Math.max(w, h) * 0.85), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 0, 127, ${Math.max(0, 1 - bbProg2)})`;
        ctx.lineWidth = 6;
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#ff007f';
        ctx.stroke();
      }
      ctx.restore();

      // Bầu trời sao lấp lánh & chòm sao nốt nhạc TikTok
      for (const st of universeStars) {
        st.twinkle += 0.05;
        const curA = 0.4 + Math.sin(st.twinkle) * 0.45;
        ctx.save();
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.size, 0, Math.PI * 2);
        ctx.fillStyle = st.color;
        ctx.globalAlpha = curA;
        ctx.shadowBlur = 10;
        ctx.shadowColor = st.color;
        ctx.fill();
        ctx.restore();
      }

      // 4 HÀNH TINH QUỸ ĐẠO QUAY QUANH AVATAR TRUNG TÂM
      ctx.save();
      ctx.translate(w/2, h/2);

      const planets = [
        { name: 'Mặt trời vàng', r: 16, dist: 150, speed: 1.1, color: '#ffd700', glow: '#ffaa00' },
        { name: 'Sao Thổ Cyan', r: 14, dist: 220, speed: 0.75, color: '#00f2fe', glow: '#00f2fe', hasRing: true },
        { name: 'Khổng Lồ Tím', r: 18, dist: 300, speed: 0.52, color: '#c084fc', glow: '#a855f7' },
        { name: 'Hồng Ngọc TikTok', r: 12, dist: 380, speed: 0.38, color: '#f43f5e', glow: '#ff007f' }
      ];

      for (const pl of planets) {
        // Quỹ đạo elip nghiêng 3D
        ctx.beginPath();
        ctx.ellipse(0, 0, pl.dist, pl.dist * 0.48, -0.2, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Tọa độ hành tinh
        const plAng = pl.speed * elapsed;
        const plX = Math.cos(plAng) * pl.dist;
        const plY = Math.sin(plAng) * (pl.dist * 0.48);

        // Vẽ hành tinh
        ctx.save();
        ctx.translate(plX, plY);
        ctx.beginPath();
        ctx.arc(0, 0, pl.r, 0, Math.PI * 2);
        ctx.fillStyle = pl.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = pl.glow;
        ctx.fill();

        // Vành đai nếu là Sao Thổ
        if (pl.hasRing) {
          ctx.beginPath();
          ctx.ellipse(0, 0, pl.r * 2.2, pl.r * 0.7, 0.4, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(0, 242, 254, 0.85)';
          ctx.lineWidth = 3;
          ctx.stroke();
        }
        ctx.restore();
      }
      ctx.restore();
    }

    fxAnimId = requestAnimationFrame(renderFx);
  }

  if (fxAnimId) cancelAnimationFrame(fxAnimId);
  renderFx();
}

export function stopCinematicParticles() {
  if (fxAnimId) {
    cancelAnimationFrame(fxAnimId);
    fxAnimId = null;
  }
  const canvas = document.getElementById('cinematic-fx-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

