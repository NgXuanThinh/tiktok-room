// Procedural Vector SVG Ornaments Framing Avatar by Donation Milestone
export function renderAvatarOrnament(tierClass, coins, giftKey) {
  const container = document.getElementById('avatar-ornament');
  if (!container) return;
  container.innerHTML = '';

  let svgContent = '';

  if (tierClass === 'tier-money' || tierClass === 'tier-concert') {
    // 500 Coins: Golden Laurel Wreath + 8 Emerald Gems
    svgContent = `
      <svg width="280" height="280" viewBox="-140 -140 280 280">
        <defs>
          <linearGradient id="laurelGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fff275" />
            <stop offset="50%" stop-color="#ffd700" />
            <stop offset="100%" stop-color="#b8860b" />
          </linearGradient>
          <radialGradient id="emeraldGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#00ffaa" />
            <stop offset="60%" stop-color="#00c853" />
            <stop offset="100%" stop-color="#006020" />
          </radialGradient>
          <filter id="gemGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <!-- Golden Laurel Branches Left & Right -->
        <g stroke="url(#laurelGold)" stroke-width="2.5" fill="none">
          <path d="M 0 102 C -70 102 -106 50 -106 0 C -106 -50 -70 -102 0 -102" />
          <path d="M 0 102 C 70 102 106 50 106 0 C 106 -50 70 -102 0 -102" />
        </g>
        <!-- Laurel Leaves -->
        <g fill="url(#laurelGold)">
          <ellipse cx="-86" cy="-60" rx="9" ry="5" transform="rotate(-35 -86 -60)" />
          <ellipse cx="-105" cy="-30" rx="9" ry="5" transform="rotate(-15 -105 -30)" />
          <ellipse cx="-110" cy="0" rx="10" ry="5" transform="rotate(0 -110 0)" />
          <ellipse cx="-105" cy="30" rx="9" ry="5" transform="rotate(15 -105 30)" />
          <ellipse cx="-86" cy="60" rx="9" ry="5" transform="rotate(35 -86 60)" />
          <ellipse cx="-55" cy="88" rx="9" ry="5" transform="rotate(55 -55 88)" />
          <ellipse cx="86" cy="-60" rx="9" ry="5" transform="rotate(35 86 -60)" />
          <ellipse cx="105" cy="-30" rx="9" ry="5" transform="rotate(15 105 -30)" />
          <ellipse cx="110" cy="0" rx="10" ry="5" transform="rotate(0 110 0)" />
          <ellipse cx="105" cy="30" rx="9" ry="5" transform="rotate(-15 105 30)" />
          <ellipse cx="86" cy="60" rx="9" ry="5" transform="rotate(-35 86 60)" />
          <ellipse cx="55" cy="88" rx="9" ry="5" transform="rotate(-55 55 88)" />
        </g>
        <!-- 8 Emerald Diamond Gems -->
        <g fill="url(#emeraldGlow)" stroke="#ffffff" stroke-width="0.8" filter="url(#gemGlow)">
          <polygon points="0,-115 6,-105 0,-95 -6,-105" />
          <polygon points="0,115 6,105 0,95 -6,105" />
          <polygon points="-115,0 -105,6 -95,0 -105,-6" />
          <polygon points="115,0 105,6 95,0 105,-6" />
          <polygon points="-81,-81 -75,-73 -81,-65 -89,-73" />
          <polygon points="81,-81 89,-73 81,-65 75,-73" />
          <polygon points="-81,81 -75,73 -81,65 -89,73" />
          <polygon points="81,81 89,73 81,65 75,73" />
        </g>
        <!-- Bottom Gold Ribbon Tie -->
        <path d="M -16 102 C -10 118 -26 132 -32 136 C -20 126 -12 114 -8 106 Z" fill="url(#laurelGold)" />
        <path d="M 16 102 C 10 118 26 132 32 136 C 20 126 12 114 8 106 Z" fill="url(#laurelGold)" />
        <circle cx="0" cy="104" r="5" fill="#ffd700" stroke="#b8860b" stroke-width="1" />
      </svg>
    `;
  } else if (tierClass === 'tier-swan' || tierClass === 'tier-heart') {
    // 699 Coins: Swan Feather Wings + Rose-Gold Filigree Heart
    svgContent = `
      <svg width="340" height="280" viewBox="-170 -140 340 280">
        <defs>
          <linearGradient id="swanWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="40%" stop-color="#ffd1dc" />
            <stop offset="100%" stop-color="#ff4081" />
          </linearGradient>
          <filter id="swanGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <!-- Left & Right Wing Feather Layers -->
        <g fill="url(#swanWingGrad)" opacity="0.92" filter="url(#swanGlow)">
          <path d="M -90 -10 C -135 -40 -165 -75 -165 -100 C -150 -80 -130 -60 -115 -40 C -145 -30 -160 -10 -150 15 C -135 5 -118 -5 -105 -10 C -130 15 -140 35 -130 50 C -118 35 -105 20 -95 10 Z" />
          <path d="M 90 -10 C 135 -40 165 -75 165 -100 C 150 -80 130 -60 115 -40 C 145 -30 160 -10 150 15 C 135 5 118 -5 105 -10 C 130 15 140 35 130 50 C 118 35 105 20 95 10 Z" />
        </g>
        <!-- Filigree Heart Swirls at Bottom -->
        <path d="M -50 95 C -30 120 0 135 0 115 C 0 135 30 120 50 95 C 40 115 15 132 0 140 C -15 132 -40 115 -50 95 Z" fill="url(#swanWingGrad)" stroke="#ff758f" stroke-width="1.2" />
        <!-- Sparkling Pearls around rim -->
        <g fill="#ffffff" filter="url(#swanGlow)">
          <circle cx="-108" cy="-45" r="3.5" />
          <circle cx="-118" cy="0" r="3.5" />
          <circle cx="-108" cy="45" r="3.5" />
          <circle cx="108" cy="-45" r="3.5" />
          <circle cx="118" cy="0" r="3.5" />
          <circle cx="108" cy="45" r="3.5" />
          <circle cx="0" cy="138" r="4.5" fill="#ff4081" stroke="#ffffff" stroke-width="1" />
        </g>
      </svg>
    `;
  } else if (tierClass === 'tier-galaxy' || tierClass === 'tier-disco' || tierClass === 'tier-legend') {
    // 1,000 Coins: Astral Nebula Compass & Cosmic Rune Ring
    svgContent = `
      <svg width="340" height="340" viewBox="-170 -170 340 340">
        <defs>
          <linearGradient id="astralSpike" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#00f2fe" />
            <stop offset="50%" stop-color="#9d4edd" />
            <stop offset="100%" stop-color="#ff007f" />
          </linearGradient>
          <filter id="astralGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <!-- Concentric Rune Rings with Dashed Astronomical Tracks -->
        <circle r="120" fill="none" stroke="#00f2fe" stroke-width="2" stroke-dasharray="8,6,2,6" opacity="0.85" />
        <circle r="128" fill="none" stroke="#9d4edd" stroke-width="1.5" stroke-dasharray="16,10" opacity="0.75" />
        <circle r="135" fill="none" stroke="#ff0874" stroke-width="1" stroke-dasharray="4,8" opacity="0.6" />
        <!-- 4 Major Compass Spikes (N, S, E, W) -->
        <g fill="url(#astralSpike)" filter="url(#astralGlow)">
          <polygon points="0,-165 8,-120 -8,-120" />
          <polygon points="0,165 8,120 -8,120" />
          <polygon points="-165,0 -120,8 -120,-8" />
          <polygon points="165,0 120,8 120,-8" />
          <!-- 4 Diagonal Minor Spikes -->
          <polygon points="-108,-108 -80,-92 -92,-80" />
          <polygon points="108,-108 80,-92 92,-80" />
          <polygon points="-108,108 -80,92 -92,80" />
          <polygon points="108,108 80,92 92,80" />
        </g>
        <!-- 8 Starlight Diamonds on Ring -->
        <g fill="#00f2fe" filter="url(#astralGlow)">
          <polygon points="0,-120 4,-124 0,-128 -4,-124" />
          <polygon points="0,120 4,124 0,128 -4,124" />
          <polygon points="-120,0 -124,4 -128,0 -124,-4" />
          <polygon points="120,0 124,4 128,0 124,-4" />
          <circle cx="-85" cy="-85" r="3" fill="#ffffff" />
          <circle cx="85" cy="-85" r="3" fill="#ffffff" />
          <circle cx="-85" cy="85" r="3" fill="#ffffff" />
          <circle cx="85" cy="85" r="3" fill="#ffffff" />
        </g>
      </svg>
    `;
  } else if (tierClass === 'tier-whale') {
    // 2,150 Coins: Bioluminescent Ocean Waves & Coral Spirals
    svgContent = `
      <svg width="350" height="350" viewBox="-175 -175 350 350">
        <defs>
          <linearGradient id="oceanWave" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#00ffff" />
            <stop offset="40%" stop-color="#00b4d8" />
            <stop offset="100%" stop-color="#03045e" />
          </linearGradient>
          <filter id="oceanGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <!-- 4 Sweeping Whirlpool Wave Crests around rim -->
        <g fill="none" stroke="url(#oceanWave)" stroke-width="4.5" stroke-linecap="round" filter="url(#oceanGlow)">
          <path d="M 0 -125 C 60 -135 125 -100 138 -35 C 145 -10 135 15 120 5" />
          <path d="M 125 0 C 135 60 100 125 35 138 C 10 145 -15 135 -5 120" />
          <path d="M 0 125 C -60 135 -125 100 -138 35 C -145 10 -135 -15 -120 -5" />
          <path d="M -125 0 C -135 -60 -100 -125 -35 -138 C -10 -145 15 -135 5 -120" />
        </g>
        <!-- Glowing Bioluminescent Bubbles & Droplets -->
        <g fill="#00ffff" filter="url(#oceanGlow)">
          <circle cx="-140" cy="-60" r="4" />
          <circle cx="-148" cy="-40" r="2.5" />
          <circle cx="140" cy="60" r="4" />
          <circle cx="148" cy="40" r="2.5" />
          <circle cx="60" cy="-140" r="3.5" />
          <circle cx="-60" cy="140" r="3.5" />
          <circle cx="-110" cy="-110" r="3" fill="#ffffff" />
          <circle cx="110" cy="110" r="3" fill="#ffffff" />
        </g>
      </svg>
    `;
  } else if (tierClass === 'tier-jet') {
    // 4,888 Coins: Gold Supersonic Aviator Wings & Speed Chevrons
    svgContent = `
      <svg width="400" height="300" viewBox="-200 -150 400 300">
        <defs>
          <linearGradient id="goldJetWing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fff59d" />
            <stop offset="45%" stop-color="#ffb300" />
            <stop offset="100%" stop-color="#e65100" />
          </linearGradient>
          <filter id="jetGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <!-- Swept-back Mach 2 Jet Wings -->
        <g fill="url(#goldJetWing)" filter="url(#jetGlow)" stroke="#ffffff" stroke-width="0.8">
          <polygon points="-120,-30 -195,-65 -165,-10 -125,20" />
          <polygon points="120,-30 195,-65 165,-10 125,20" />
          <polygon points="-115,10 -170,10 -150,30 -110,25" opacity="0.85" />
          <polygon points="115,10 170,10 150,30 110,25" opacity="0.85" />
        </g>
        <!-- Speed Chevrons (>> >>) -->
        <g stroke="#ffd700" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#jetGlow)">
          <path d="M -135 -70 L -145 -80 L -135 -90" />
          <path d="M -150 -70 L -160 -80 L -150 -90" />
          <path d="M 135 -70 L 145 -80 L 135 -90" />
          <path d="M 150 -70 L 160 -80 L 150 -90" />
        </g>
        <!-- Jet Afterburner Flame Glow at Bottom -->
        <g fill="#ff3d00" filter="url(#jetGlow)">
          <polygon points="-25,125 0,145 25,125 0,132" fill="#ffd700" />
          <circle cx="-35" cy="120" r="4" fill="#ff9100" />
          <circle cx="35" cy="120" r="4" fill="#ff9100" />
        </g>
      </svg>
    `;
  } else if (tierClass === 'tier-diamond') {
    // 5,000 Coins (Diamond Gun): 12-Point Prism Diamond Halo
    svgContent = `
      <svg width="390" height="390" viewBox="-195 -195 390 390">
        <defs>
          <linearGradient id="prismLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="40%" stop-color="#00f2fe" />
            <stop offset="70%" stop-color="#ff007f" />
            <stop offset="100%" stop-color="#ffd700" />
          </linearGradient>
          <filter id="diamondGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <!-- 12 Radiating Diamond Crystal Spikes -->
        <g fill="url(#prismLight)" stroke="#ffffff" stroke-width="1.2" filter="url(#diamondGlow)">
          ${Array.from({ length: 12 }).map((_, i) => {
            const deg = i * 30;
            return `<g transform="rotate(${deg})">
              <polygon points="0,-185 9,-138 0,-132" opacity="0.95" />
              <polygon points="0,-185 -9,-138 0,-132" opacity="0.75" fill="#00f2fe" />
            </g>`;
          }).join('')}
        </g>
        <!-- Facet Prism Ring -->
        <circle r="134" fill="none" stroke="#ffffff" stroke-width="2.5" opacity="0.9" />
        <circle r="142" fill="none" stroke="#ff007f" stroke-width="1.5" stroke-dasharray="10,6" opacity="0.8" />
      </svg>
    `;
  } else if (tierClass === 'tier-queen') {
    // 5,000 Coins (Drama Queen): Grand Imperial Baroque 24K Gold Frame
    svgContent = `
      <svg width="420" height="420" viewBox="-210 -210 420 420">
        <defs>
          <linearGradient id="royalGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="25%" stop-color="#ffd700" />
            <stop offset="65%" stop-color="#ff9100" />
            <stop offset="100%" stop-color="#8c5000" />
          </linearGradient>
          <radialGradient id="rubyGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ff1744" />
            <stop offset="70%" stop-color="#b71c1c" />
            <stop offset="100%" stop-color="#4a0000" />
          </radialGradient>
          <filter id="royalGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <!-- 4 Grand Baroque Acanthus Scroll Flourishes -->
        <g fill="url(#royalGoldGrad)" stroke="#ffd700" stroke-width="1.5" filter="url(#royalGlow)">
          <path d="M 0 -138 C -30 -160 -45 -185 0 -200 C 45 -185 30 -160 0 -138 Z" />
          <path d="M 0 138 C -35 160 -50 190 0 205 C 50 190 35 160 0 138 Z" />
          <path d="M -138 0 C -160 -35 -190 -50 -205 0 C -190 50 -160 35 -138 0 Z" />
          <path d="M 138 0 C 160 -35 190 -50 205 0 C 190 50 160 35 138 0 Z" />
          <path d="M -102 -102 C -125 -135 -155 -155 -165 -135 C -155 -115 -135 -125 -102 -102 Z" />
          <path d="M 102 -102 C 125 -135 155 -155 165 -135 C 155 -115 135 -125 102 -102 Z" />
          <path d="M -102 102 C -125 135 -155 155 -165 135 C -155 115 -135 125 -102 102 Z" />
          <path d="M 102 102 C 125 135 155 155 165 135 C 155 115 135 125 102 102 Z" />
        </g>
        <!-- 8 Imperial Rubies around frame -->
        <g fill="url(#rubyGlow)" stroke="#ffd700" stroke-width="1.5" filter="url(#royalGlow)">
          <circle cx="0" cy="-148" r="6.5" />
          <circle cx="0" cy="148" r="6.5" />
          <circle cx="-148" cy="0" r="6.5" />
          <circle cx="148" cy="0" r="6.5" />
          <polygon points="-110,-110 -104,-116 -110,-122 -116,-116" />
          <polygon points="110,-110 116,-116 110,-122 104,-116" />
          <polygon points="-110,110 -104,116 -110,122 -116,116" />
          <polygon points="110,110 116,116 110,122 104,116" />
        </g>
      </svg>
    `;
  } else if (tierClass === 'tier-airplane') {
    // 6,000 Coins (Airplane VIP): Golden Aviator Wings, Radar Beacon Ring & Runway Chevrons
    svgContent = `
      <svg width="420" height="320" viewBox="-210 -160 420 320">
        <defs>
          <linearGradient id="airplaneGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fff9c4" />
            <stop offset="40%" stop-color="#fbc02d" />
            <stop offset="100%" stop-color="#e65100" />
          </linearGradient>
          <filter id="airplaneGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <!-- Supersonic Mach-2 Swept Wings -->
        <g fill="url(#airplaneGold)" stroke="#ffffff" stroke-width="1.2" filter="url(#airplaneGlow)">
          <polygon points="-125,-20 -205,-60 -170,-5 -130,25" />
          <polygon points="125,-20 205,-60 170,-5 130,25" />
          <polygon points="-120,15 -175,15 -155,35 -115,30" opacity="0.85" />
          <polygon points="120,15 175,15 150,35 115,30" opacity="0.85" />
        </g>
        <!-- Radar Tracking Rings & Runway Chevrons -->
        <circle r="130" fill="none" stroke="#fbc02d" stroke-width="2" stroke-dasharray="12,8" opacity="0.85" filter="url(#airplaneGlow)" />
        <g stroke="#00f2fe" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#airplaneGlow)">
          <path d="M -145 -75 L -155 -85 L -145 -95" />
          <path d="M 145 -75 L 155 -85 L 145 -95" />
        </g>
        <!-- Golden Beacon Lights -->
        <g fill="#00f2fe" filter="url(#airplaneGlow)">
          <circle cx="-130" cy="0" r="4.5" />
          <circle cx="130" cy="0" r="4.5" />
          <circle cx="0" cy="-130" r="4.5" fill="#fbc02d" />
          <circle cx="0" cy="130" r="4.5" fill="#fbc02d" />
        </g>
      </svg>
    `;
  } else if (tierClass === 'tier-panther') {
    // 10,000 Coins (Shadow Panther): Obsidian Predator Ring & Neon Purple Slash Marks
    svgContent = `
      <svg width="420" height="420" viewBox="-210 -210 420 420">
        <defs>
          <linearGradient id="pantherPurp" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f0abfc" />
            <stop offset="50%" stop-color="#a855f7" />
            <stop offset="100%" stop-color="#3b0764" />
          </linearGradient>
          <filter id="pantherGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <!-- Concentric Shadow Blade Rings -->
        <circle r="132" fill="none" stroke="url(#pantherPurp)" stroke-width="3.5" filter="url(#pantherGlow)" />
        <circle r="142" fill="none" stroke="#d946ef" stroke-width="1.8" stroke-dasharray="14,8,4,8" opacity="0.8" />
        <!-- 4 Razor Predator Fangs (Top, Bottom, Left, Right) -->
        <g fill="url(#pantherPurp)" stroke="#ffffff" stroke-width="1" filter="url(#pantherGlow)">
          <polygon points="0,-165 12,-132 -12,-132" />
          <polygon points="0,165 12,132 -12,132" />
          <polygon points="-165,0 -132,12 -132,-12" />
          <polygon points="165,0 132,12 132,-12" />
          <!-- 4 Diagonal Slashing Claws -->
          <polygon points="-120,-120 -95,-105 -105,-95" />
          <polygon points="120,-120 95,-105 105,-95" />
          <polygon points="-120,120 -95,105 -105,95" />
          <polygon points="120,120 95,105 105,95" />
        </g>
        <!-- Glowing Yellow Predator Eye Gems -->
        <g fill="#facc15" filter="url(#pantherGlow)">
          <circle cx="-132" cy="-45" r="4.5" />
          <circle cx="132" cy="-45" r="4.5" />
          <circle cx="-132" cy="45" r="4.5" />
          <circle cx="132" cy="45" r="4.5" />
        </g>
      </svg>
    `;
  } else if (tierClass === 'tier-phoenix') {
    // 25,999 Coins (Phoenix): Radiant Solar Fire Wings & Sunburst Plumes
    svgContent = `
      <svg width="440" height="440" viewBox="-220 -220 440 440">
        <defs>
          <linearGradient id="phoenixGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="25%" stop-color="#ffd700" />
            <stop offset="65%" stop-color="#ff4500" />
            <stop offset="100%" stop-color="#b91c1c" />
          </linearGradient>
          <filter id="phoenixGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <!-- Left & Right Grand Solar Fire Wings -->
        <g fill="url(#phoenixGrad)" filter="url(#phoenixGlow)" stroke="#ffffff" stroke-width="0.8">
          <path d="M -110 -20 C -150 -60 -195 -110 -205 -145 C -180 -115 -150 -85 -130 -50 C -170 -40 -190 -10 -180 20 C -160 5 -140 -10 -120 -15 C -150 15 -165 45 -150 65 C -135 45 -120 25 -110 10 Z" />
          <path d="M 110 -20 C 150 -60 195 -110 205 -145 C 180 -115 150 -85 130 -50 C 170 -40 190 -10 180 20 C 160 5 140 -10 120 -15 C 150 15 165 45 150 65 C 135 45 120 25 110 10 Z" />
        </g>
        <!-- 16 Solar Flame Beams around Ring -->
        <g fill="url(#phoenixGrad)" filter="url(#phoenixGlow)">
          ${Array.from({ length: 16 }).map((_, i) => {
            const deg = i * 22.5;
            return `<polygon points="0,-158 6,-135 -6,-135" transform="rotate(${deg})" />`;
          }).join('')}
        </g>
        <!-- Flaming Crown Crest at Top -->
        <g fill="#ffd700" filter="url(#phoenixGlow)" stroke="#ff4500" stroke-width="1.2">
          <polygon points="0,-185 14,-145 -14,-145" />
          <polygon points="-22,-175 -8,-145 -28,-145" />
          <polygon points="22,-175 28,-145 8,-145" />
        </g>
      </svg>
    `;
  } else if (tierClass === 'tier-tiger') {
    // 26,999 Coins (Fire Tiger): Burning Flame Hoop & Molten Fangs
    svgContent = `
      <svg width="430" height="430" viewBox="-215 -215 430 430">
        <defs>
          <linearGradient id="tigerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fff8e1" />
            <stop offset="35%" stop-color="#ff9100" />
            <stop offset="75%" stop-color="#ff3d00" />
            <stop offset="100%" stop-color="#991b1b" />
          </linearGradient>
          <filter id="tigerGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <!-- Molten Flaming Hoop Rings -->
        <circle r="132" fill="none" stroke="url(#tigerGrad)" stroke-width="4.5" filter="url(#tigerGlow)" />
        <circle r="142" fill="none" stroke="#ffd700" stroke-width="2" stroke-dasharray="16,8" opacity="0.9" />
        <!-- 8 Curved Flame Horns & Tiger Claws -->
        <g fill="url(#tigerGrad)" stroke="#ffffff" stroke-width="1" filter="url(#tigerGlow)">
          <path d="M 0 -138 C -15 -165 -35 -190 0 -205 C 35 -190 15 -165 0 -138 Z" />
          <path d="M 0 138 C -20 165 -30 195 0 210 C 30 195 20 165 0 138 Z" />
          <path d="M -138 0 C -165 -15 -190 -35 -205 0 C -190 35 -165 15 -138 0 Z" />
          <path d="M 138 0 C 165 -15 190 -35 205 0 C 190 35 165 15 138 0 Z" />
          <polygon points="-115,-115 -85,-100 -100,-85" />
          <polygon points="115,-115 100,-85 85,-100" />
          <polygon points="-115,115 -85,100 -100,85" />
          <polygon points="115,115 100,85 85,100" />
        </g>
        <!-- Glowing Amber Tiger Eye Gems -->
        <g fill="#ffd700" filter="url(#tigerGlow)">
          <circle cx="-135" cy="-50" r="5" fill="#ffea00" />
          <circle cx="135" cy="-50" r="5" fill="#ffea00" />
          <circle cx="-135" cy="50" r="5" fill="#ffea00" />
          <circle cx="135" cy="50" r="5" fill="#ffea00" />
        </g>
      </svg>
    `;
  } else if (tierClass === 'tier-lion') {
    // 29,999 Coins (Lion King): Imperial 24K Lion Mane Filigree & Crown Crest
    svgContent = `
      <svg width="450" height="450" viewBox="-225 -225 450 450">
        <defs>
          <linearGradient id="lionGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="20%" stop-color="#ffd700" />
            <stop offset="60%" stop-color="#f59e0b" />
            <stop offset="100%" stop-color="#78350f" />
          </linearGradient>
          <radialGradient id="lionRuby" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ff4d4d" />
            <stop offset="60%" stop-color="#dc2626" />
            <stop offset="100%" stop-color="#450a0a" />
          </radialGradient>
          <filter id="lionGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <!-- 24 Radiant 24K Lion Mane Petals -->
        <g fill="url(#lionGoldGrad)" stroke="#ffd700" stroke-width="1.2" filter="url(#lionGlow)">
          ${Array.from({ length: 24 }).map((_, i) => {
            const deg = i * 15;
            const rLong = (i % 2 === 0) ? -200 : -175;
            return `<polygon points="0,${rLong} 10,-135 0,-130 -10,-135" transform="rotate(${deg})" />`;
          }).join('')}
        </g>
        <!-- Imperial Laurel Ring -->
        <circle r="135" fill="none" stroke="#ffd700" stroke-width="3" filter="url(#lionGlow)" />
        <circle r="145" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="12,6" />
        <!-- Imperial Lion Crown at Top -->
        <g fill="url(#lionGoldGrad)" stroke="#ffffff" stroke-width="1" filter="url(#lionGlow)">
          <polygon points="0,-195 18,-150 -18,-150" />
          <polygon points="-30,-185 -12,-150 -36,-150" />
          <polygon points="30,-185 36,-150 12,-150" />
          <circle cx="0" cy="-198" r="4.5" fill="url(#lionRuby)" />
          <circle cx="-30" cy="-188" r="4" fill="url(#lionRuby)" />
          <circle cx="30" cy="-188" r="4" fill="url(#lionRuby)" />
        </g>
      </svg>
    `;
  } else if (tierClass === 'tier-pegasus') {
    // 34,000 Coins (Pegasus): Celestial Wings of Starlight & Aurora Diamonds
    svgContent = `
      <svg width="450" height="420" viewBox="-225 -210 450 420">
        <defs>
          <linearGradient id="pegasusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="35%" stop-color="#e0e7ff" />
            <stop offset="70%" stop-color="#38bdf8" />
            <stop offset="100%" stop-color="#c084fc" />
          </linearGradient>
          <filter id="pegasusGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <!-- Grand Celestial Wings Left & Right -->
        <g fill="url(#pegasusGrad)" stroke="#ffffff" stroke-width="1" filter="url(#pegasusGlow)">
          <path d="M -115 -25 C -155 -75 -205 -135 -220 -170 C -195 -140 -160 -105 -135 -65 C -180 -55 -200 -20 -190 15 C -168 -2 -145 -20 -125 -25 C -160 10 -175 40 -160 60 C -145 40 -130 18 -118 5 Z" />
          <path d="M 115 -25 C 155 -75 205 -135 220 -170 C 195 -140 160 -105 135 -65 C 180 -55 200 -20 190 15 C 168 -2 145 -20 125 -25 C 160 10 175 40 160 60 C 145 40 130 18 118 5 Z" />
        </g>
        <!-- Celestial Aurora Starburst Rings -->
        <circle r="134" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="14,8,4,8" opacity="0.9" filter="url(#pegasusGlow)" />
        <circle r="142" fill="none" stroke="#c084fc" stroke-width="1.5" stroke-dasharray="8,6" opacity="0.8" />
        <!-- 8 Starlight Diamonds (✦) around Rim -->
        <g fill="#ffffff" filter="url(#pegasusGlow)">
          <polygon points="0,-165 5,-155 15,-150 5,-145 0,-135 -5,-145 -15,-150 -5,-155" />
          <polygon points="0,165 5,155 15,150 5,145 0,135 -5,145 -15,150 -5,155" />
          <polygon points="-165,0 -155,5 -150,15 -145,5 -135,0 -145,-5 -150,-15 -155,-5" />
          <polygon points="165,0 155,5 150,15 145,5 135,0 145,-5 150,-15 155,-5" />
          <circle cx="-100" cy="-100" r="4.5" fill="#38bdf8" />
          <circle cx="100" cy="-100" r="4.5" fill="#38bdf8" />
          <circle cx="-100" cy="100" r="4.5" fill="#38bdf8" />
          <circle cx="100" cy="100" r="4.5" fill="#38bdf8" />
        </g>
      </svg>
    `;
  } else if (tierClass === 'tier-universe') {
    // 44,999 Coins (TikTok Universe): Concentric Planetary Orbits & Astral Nodes
    svgContent = `
      <svg width="470" height="470" viewBox="-235 -235 470 470">
        <defs>
          <linearGradient id="cosmicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#00f2fe" />
            <stop offset="30%" stop-color="#a855f7" />
            <stop offset="70%" stop-color="#ff007f" />
            <stop offset="100%" stop-color="#ffd700" />
          </linearGradient>
          <filter id="cosmicGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <!-- Concentric Astronomical Planetary Tracks -->
        <circle r="132" fill="none" stroke="url(#cosmicGrad)" stroke-width="3" stroke-dasharray="16,8,4,8" filter="url(#cosmicGlow)" />
        <circle r="148" fill="none" stroke="#00f2fe" stroke-width="2" stroke-dasharray="24,12" opacity="0.85" />
        <circle r="165" fill="none" stroke="#ff007f" stroke-width="1.5" stroke-dasharray="6,10" opacity="0.75" />
        <!-- 4 Planetary Spheres on Orbits -->
        <!-- Sun (Top) -->
        <g fill="#ffd700" filter="url(#cosmicGlow)">
          <circle cx="0" cy="-165" r="9" />
          <circle cx="0" cy="-165" r="14" fill="none" stroke="#ffaa00" stroke-width="1.5" opacity="0.7" />
        </g>
        <!-- Saturn Ringed (Right) -->
        <g fill="#00f2fe" filter="url(#cosmicGlow)">
          <circle cx="165" cy="0" r="8" />
          <ellipse cx="165" cy="0" rx="16" ry="6" fill="none" stroke="#00f2fe" stroke-width="2" transform="rotate(-25 165 0)" />
        </g>
        <!-- Purple Giant (Bottom) -->
        <g fill="#a855f7" filter="url(#cosmicGlow)">
          <circle cx="0" cy="165" r="8.5" />
          <circle cx="-12" cy="162" r="2.5" fill="#ffffff" />
        </g>
        <!-- TikTok Rose Gem (Left) -->
        <g fill="#ff007f" filter="url(#cosmicGlow)">
          <circle cx="-165" cy="0" r="7.5" />
        </g>
        <!-- 8 Starlight Compass Beams -->
        <g fill="#ffffff" filter="url(#cosmicGlow)">
          <polygon points="0,-215 7,-178 -7,-178" fill="#ffd700" />
          <polygon points="0,215 7,178 -7,178" fill="#a855f7" />
          <polygon points="-215,0 -178,7 -178,-7" fill="#ff007f" />
          <polygon points="215,0 178,7 178,-7" fill="#00f2fe" />
          <polygon points="-135,-135 -110,-120 -120,-110" fill="#ffffff" />
          <polygon points="135,-135 110,-120 120,-110" fill="#ffffff" />
          <polygon points="-135,135 -110,120 -120,110" fill="#ffffff" />
          <polygon points="135,135 110,120 120,110" fill="#ffffff" />
        </g>
      </svg>
    `;
  }

  container.innerHTML = svgContent;
}

