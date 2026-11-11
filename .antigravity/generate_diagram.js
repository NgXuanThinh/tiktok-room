import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const scanResultPath = path.join(projectRoot, '.antigravity', 'scan_result.json');
const cachePath = path.join(projectRoot, '.antigravity', 'cache.json');
const diagramPath = path.join(projectRoot, 'DIAGRAM.md');

const scanResult = JSON.parse(fs.readFileSync(scanResultPath, 'utf8'));
const cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

// Rich duties dictionary for all files
const duties = {
  // floor-slots.js
  "src/floor-slots.js:generateDanceFloorSlots": "Generates concentric 360-degree radial dance floor grid slots expanding outward from center stage while preventing wall collisions.",
  "src/floor-slots.js:findRandomAvailableFloorSlot": "Allocates a random unoccupied dance floor slot from the available pool for organic slime distribution.",

  // vip-podium-scheduler.js
  "src/vip-podium-scheduler.js:constructor": "Initializes the sequential VIP stage scheduler with duration, podium position, and queue.",
  "src/vip-podium-scheduler.js:enqueue": "Enqueues a donating whale in the sequential FIFO VIP stage queue, extending tenure for current occupant.",
  "src/vip-podium-scheduler.js:promote": "Promotes a VIP whale avatar onto the center podium stage or elevates them at their floor slot.",
  "src/vip-podium-scheduler.js:update": "Ticks down remaining tenure for the active whale on the VIP stage and promotes queued whales upon expiry.",

  // vip-lounge-manager.js
  "src/vip-lounge-manager.js:triggerLeapAnimation": "Animates an avatar along a parabolic leap arc (+2.4m apex) with cubic ease-in-out curve between dance floor and VIP lounge platforms.",
  "src/vip-lounge-manager.js:updateLeapAnimation": "Per-frame physics and interpolation driver advancing leap progress and triggering landing callbacks.",
  "src/vip-lounge-manager.js:constructor": "Initializes Top 1 and Top 2 VIP lounge occupant state tracking.",
  "src/vip-lounge-manager.js:getCurrentTop1": "Returns user ID of the current Top 1 Imperial Throne occupant.",
  "src/vip-lounge-manager.js:getCurrentTop2": "Returns user ID of the current Top 2 Platinum Lounge occupant.",
  "src/vip-lounge-manager.js:clear": "Resets both Top 1 and Top 2 VIP platform occupant assignments.",
  "src/vip-lounge-manager.js:removeUser": "Vacates assigned VIP platform dais if occupied by the specified user.",
  "src/vip-lounge-manager.js:_promoteToTop1": "Elevates and leaps new Top 1 donor onto the Left Imperial Dais (y=0.48m) with gold crown and billboard tag.",
  "src/vip-lounge-manager.js:_promoteToTop2": "Elevates and leaps new Top 2 donor onto the Right Platinum Dais (y=0.38m) with silver billboard tag.",
  "src/vip-lounge-manager.js:_demoteDisplacedAvatar": "Returns displaced VIP occupant back to a vacant dance floor slot, resetting scales and VIP accessories.",
  "src/vip-lounge-manager.js:executeVipPromotionAndSwap": "Coordinates bilateral slot promotion and swapping between top donors and displaced avatars returning to the floor.",

  // live-event-handler.js
  "src/live-event-handler.js:resolveGiftCategory": "Categorizes incoming donation coin values into small, medium, high, or ultra celebration tiers.",
  "src/live-event-handler.js:calculateSlimeTier": "Calculates Slime visual evolution tier (1 to 5) based on cumulative coin contributions.",
  "src/live-event-handler.js:_handleChatCommands": "Parses and executes first matching chat command for slime color (!color with random fallback), dance mode (!dance 1/2/toggle), or face mode (!face smile/normal/wink with random fallback).",
  "src/live-event-handler.js:_triggerUltraCelebration": "Triggers ultra luxury coronation celebration (>= 6000 coins) with camera tracking, fanfare, golden beam, and fireworks.",
  "src/live-event-handler.js:_triggerHighCelebration": "Triggers high-tier VIP celebration (500-5000 coins) with VIP camera framing, white beam, and shockwave.",
  "src/live-event-handler.js:_triggerMediumCelebration": "Triggers medium donation celebration (20-499 coins) with bass boom SFX, spotlights, and orbiting coin rings.",
  "src/live-event-handler.js:_triggerSmallCelebration": "Triggers small donation celebration (1-19 coins) with coin clink SFX, bounce jump, and dropping coins.",
  "src/live-event-handler.js:_scheduleDeferredVipSwap": "Defers bilateral VIP platform promotion until celebratory visual effects conclude.",
  "src/live-event-handler.js:handleLikeEvent": "Emits flying 3D hearts and charges the stream hype meter upon incoming likes.",
  "src/live-event-handler.js:handleChatEvent": "Processes chat comments, routes avatar commands, and increments stream hype.",
  "src/live-event-handler.js:handleGiftEvent": "Processes gift donations, updates leaderboard, triggers in-place celebrations, and schedules VIP promotion.",
  "src/live-event-handler.js:handleAdminCommand": "Applies administrative controls for camera presets, distance slider, chroma key, volume, and frenzy mode.",
  "src/live-event-handler.js:handleLiveEvent": "Central event router delegating normalized TikTok LIVE WebSocket payloads to specific event handlers.",

  // avatar-coordinator.js
  "src/avatar-coordinator.js:getOrCreateAvatarMesh": "Instantiates or retrieves a 3D Slime avatar mesh on dance floor or VIP platforms.",
  "src/avatar-coordinator.js:deleteAvatar": "Manually removes an avatar from the scene, tracking registry, and leaderboard, re-evaluating VIP assignments.",
  "src/avatar-coordinator.js:clearAllAvatars": "Disposes and removes all avatars from the 3D scene and resets the leaderboard.",
  "src/avatar-coordinator.js:syncActiveFloorAvatars": "Synchronizes active 3D avatar states with UI Overlay and WebSocket stream panels.",
  "src/avatar-coordinator.js:_updateCyberSlime": "Updates procedural squash, stretch, and AI dance moves on modern CyberSlime controller.",
  "src/avatar-coordinator.js:_updateProceduralSlime": "Applies volume-preserving squash-stretch kinematics and eye blinks to procedural slime mesh.",
  "src/avatar-coordinator.js:_updateHumanoid": "Applies procedural humanoid dance kinematics to limb and torso bones.",
  "src/avatar-coordinator.js:updateAvatarKinematics": "Coordinates per-frame animation, leap physics, smooth scaling, and camera-facing billboards for an avatar.",

  // main.js
  "src/main.js:initClientApp": "Initializes the 3D client application, network sockets, audio, and UI overlays.",
  "src/main.js:animate": "Main 60 FPS WebGL render loop driving audio analysis, lights, VIP scheduler, avatars, and camera.",

  // club-environment.js
  "src/club-environment.js:getSlimeMetrics": "Computes vertical apex, bounding radius, height, and root origin for dynamic relative cinematic animations.",
  "src/club-environment.js:getSlimeEffectiveRadius": "Calculates boundary radius of slime avatar to avoid mesh clipping when spawning coin orbits.",
  "src/club-environment.js:spawnDroppingCoins": "Spawns physics-based instanced 3D coins cascading and bouncing across the dance floor.",
  "src/club-environment.js:spawnSingleCoinInstance": "Spawns a single 3D falling gold coin with randomized angular velocity and relative drop height.",
  "src/club-environment.js:spawnOrbitingCoinRings": "Spawns multi-level golden coin rings orbiting dynamically around the celebrating slime.",
  "src/club-environment.js:triggerShockwave": "Spawns expanding circular shockwave ring on the dance floor.",

  // scene-manager.js
  "src/scene-manager.js:focusOnAvatar": "Focuses camera directly onto a selected Slime avatar with dynamic height framing and gentle 360-degree orbit rotation.",
  "src/scene-manager.js:clearAvatarFocus": "Clears active avatar focus tracking and smoothly restores previous camera preset.",

  // slime-aura.js
  "src/slime-aura.js:createSlimeAura": "Builds and returns a modular 3-style rotating aura controller (Purple, Orange, Vivid Gold) with rising effervescent mini bubbles.",
  "src/slime-aura.js:createBubbleSpriteTexture": "Creates procedural luminous round glow sprite texture for mini bubbles.",
  "preview/slime-aura.js:createSlimeAura": "Builds and returns a modular 3-style rotating aura controller with rising bubbles for preview mode.",
  "preview/slime-aura.js:createBubbleSpriteTexture": "Creates procedural luminous round glow sprite texture for mini bubbles in preview mode.",

  // club-constants.js
  "src/club-constants.js:clampSpotlightToFloor": "Clamps moving spotlight target positions strictly within club dance floor boundaries.",

  // avatar-ornaments.js
  "preview/avatar-ornaments.js:renderAvatarOrnament": "Generates and mounts milestone-specific procedural vector SVG frames (wreaths, angel wings, cosmic rings, crowns) around the donor avatar.",
  
  // chibi-mascot.js
  "preview/chibi-mascot.js:startChibiSlimeMascot": "Starts animated 2D canvas teardrop chibi slime mascot bouncing in the corner of the avatar frame.",
  "preview/chibi-mascot.js:render": "Internal 2D animation loop rendering halo, teardrop body gradient, blush cheeks, and waving hands.",
  "preview/chibi-mascot.js:stopChibiSlimeMascot": "Cancels the chibi animation frame and clears mascot canvas resources.",
  
  // cinematic-particles.js
  "preview/cinematic-particles.js:startCinematicParticles": "Initiates fullscreen 2D canvas particle physics routines differentiated by donation tier (money rain, concert lasers, swan feathers, galaxy vortex, diamond shards, phoenix fire, etc.).",
  "preview/cinematic-particles.js:renderFx": "Internal canvas frame render loop updating particle positions, velocities, rotations, alpha decay, and physics collisions.",
  "preview/cinematic-particles.js:stopCinematicParticles": "Cancels the canvas animation frame and clears the particle canvas context.",
  
  // cinematic-showcase.js
  "preview/cinematic-showcase.js:initCinematicShowcase": "Injects preview studio context (camera, activeAvatars, clearFloorEffects callback) into the showcase controller.",
  "preview/cinematic-showcase.js:getScreenCoords": "Projects 3D world coordinates onto 2D screen pixel coordinates for target-guided stage shrink animations.",
  "preview/cinematic-showcase.js:generateSvgAvatar": "Generates a fallback data-URI SVG circular monogram avatar with user initials.",
  "preview/cinematic-showcase.js:enqueueHighTierShowcase": "Appends high-tier and ultra donations to the sequential FIFO showcase queue, starting playback if idle.",
  "preview/cinematic-showcase.js:processNextHighTier": "Dequeues and triggers the next cinematic showcase in sequence, maintaining queue state.",
  "preview/cinematic-showcase.js:runCinematic2DShowcase": "Orchestrates the fullscreen cinematic overlay, backdrop blur, SVG ornaments, 2D particles, foreground 3D mascot, chibi badge, and safe termination.",
  "preview/cinematic-showcase.js:cleanupShowcase": "Safely closes the cinematic overlay, unpauses background avatars, disposes active foreground props, and invokes completion callbacks.",

  // foreground-slime.js
  "preview/foreground-slime.js:initForegroundSlimeStage": "Creates and configures dedicated Three.js WebGL renderer, scene, 3-point studio lighting, and perspective camera for foreground 3D mascots.",
  "preview/foreground-slime.js:spawnFgStardust": "Spawns glowing stardust particles trailing behind flying 3D mascots.",
  "preview/foreground-slime.js:spawnFgSonicRing": "Spawns expanding 3D torus shockwave rings during supersonic bursts and sonic booms.",
  "preview/foreground-slime.js:create3DJetPlane": "Builds stylized low-poly 3D supersonic fighter jet model with wings, tailfin, cockpit canopy, and dual neon thruster plumes.",
  "preview/foreground-slime.js:create3DParachute": "Constructs 3D hexagonal ribbed parachute dome with dual suspension cord lines.",
  "preview/foreground-slime.js:createPantherFeatures": "Builds predator 3D obsidian panther features including slanted eye rims, dual downward fangs, and 6 neon violet whiskers.",
  "preview/foreground-slime.js:createTigerFeatures": "Builds ferocious 3D fire tiger facial features including 2 chubby mochi cheek pads, dual tiger fangs, 6 fiery whiskers, and forehead fire stripes.",
  "preview/foreground-slime.js:createLionManeFeatures": "Assembles majestic 16-puff amber mane ring and 5-spike 24K gold crown for royal coronation sequences.",
  "preview/foreground-slime.js:create3DCelestialWings": "Builds dual articulated 3D celestial feathered wings with metallic gold and glowing cyan gradient materials.",
  "preview/foreground-slime.js:createPegasusFeatures": "Builds elegant Pegasus features including forward-tilted alicorn horn, pointed horse ears, and dual celestial wings.",
  "preview/foreground-slime.js:create3DUniverseMoons": "Builds 4 orbiting planetary sphere meshes with glowing orbital rings encircling the cosmic avatar.",
  "preview/foreground-slime.js:startForegroundSlime": "Instantiates and coordinates front-angle 3D mascot flight timelines, choreographies, and props according to ultra donation persona.",
  "preview/foreground-slime.js:renderFg": "Per-frame animation loop driving mascot positional lerps, tumbling flips, camera tracking, and trailing stardust.",
  "preview/foreground-slime.js:stopForegroundSlime": "Disposes active foreground 3D mascot meshes, clears stardust particles, restores camera position, and halts the render loop.",

  // preview-audio.js
  "preview/preview-audio.js:getPreviewAudioCtx": "Lazily initializes and resumes the Web Audio API AudioContext instance.",
  "preview/preview-audio.js:playPreviewSfx": "Synthesizes procedural Web Audio sound effects (coin drop, bass boom, gold chime, sword clash, royal fanfare, heart swoosh).",

  // slime-model.js
  "src/slime-model.js:setDanceMode": "Sets or toggles CyberSlime dance mode (1: continuous body spin around Z-axis while keeping billboard upright, 2: default rhythmic bounce).",
  "src/slime-model.js:setExpression": "Updates 3D chibi eye scale and mouth expression (smile, normal, wink, happy, squint).",
  "src/slime-model.js:triggerLikeJump": "Triggers single celebratory jump and smile expression on like event using central LIKE_JUMP_CONFIG.",
  "src/slime-model.js:triggerDonateAnimation": "Triggers categorized donation celebration animation reading jump counts, durations and apex heights from DONATE_CELEBRATION_CONFIG.",
  "src/avatar-manager.js:parseColorCommand": "Parses !color chat commands strictly supporting 3 canonical colors (green, red, blue) and aliases, returning isRandom flag for empty argument.",
  "server/event-normalizer.js:parseColorCommand": "Parses !color chat commands strictly supporting 3 canonical colors (green, red, blue) and aliases, returning isRandom flag for empty argument, and explicitly rejecting hex codes.",
  "preview/slime-model.js:createBasicHalfSphereGeometry": "Generates Tier 1 classic half-sphere geometry with smooth flattened underside.",
  "preview/slime-model.js:createChubbyMochiSlimeGeometry": "Generates Tier 2 chubby mochi teardrop slime geometry with wider base and organic taper.",
  "preview/slime-model.js:sharedMiniSlimeGeom": "Instantiates shared mini-slime companion pet mesh geometry.",
  "preview/slime-model.js:sharedHornGeom": "Instantiates shared evolutionary head horn accessory geometry.",
  "preview/slime-model.js:sharedTailSegmentGeom": "Instantiates shared articulated tail segment accessory geometry.",
  "preview/slime-model.js:sharedTailTipGeom": "Instantiates shared tapered tail tip mesh geometry.",
  "preview/slime-model.js:sharedSideMochiGeom": "Instantiates shared side cheek mochi puff geometry.",
  "preview/slime-model.js:createBillboardSprite": "Builds high-contrast overhead user badge with sharp contrast (#ffffff text), VIP avatar border, level, and rank tags.",
  "preview/slime-model.js:redraw": "Redraws billboard canvas texture with current viewer level, coins, and ranking tags.",
  "preview/slime-model.js:createCyberSlime": "Instantiates complete Slime mesh hierarchy with dual-mesh body, blushing cheeks, permanent Gold halo and aura ring, 3D animated eyes, horns, and wings.",
  "preview/slime-model.js:create3DEye": "Builds 3D chibi eye mesh hierarchy with glossy cornea sphere and specular reflective highlights.",
  "preview/slime-model.js:setLabelVisible": "Toggles visibility of the 3D billboard sprite above the slime.",
  "preview/slime-model.js:setBillboardScale": "Scales the 3D overhead billboard sprite proportionally with bottom-anchored expansion.",
  "src/slime-model.js:setBillboardScale": "Scales the 3D overhead billboard sprite proportionally with bottom-anchored expansion.",
  "preview/slime-model.js:setTikTokLevel": "Sets the TikTok badge level on the billboard.",
  "preview/slime-model.js:setDonateRank": "Sets the donor rank title (e.g., TOP 1) on the billboard.",
  "preview/slime-model.js:updateBillboard": "Redraws the 2D canvas texture for the billboard sprite with updated coins, level, and rank.",
  "preview/slime-model.js:setPalette": "Switches avatar body palette among cyan, pink, and lime while preserving permanent Gold halo and foot ring.",
  "preview/slime-model.js:setGender": "Sets slime gender presentation accessories (e.g., cute bow for female slimes).",
  "preview/slime-model.js:setTier": "Updates slime evolutionary visual tier (1 to 5) with corresponding horns, tail, wings, and mini-slimes.",
  "preview/slime-model.js:setExpression": "Updates eyelid and facial expressions (normal, happy, angry, proud, squint).",
  "preview/slime-model.js:setPaused": "Pauses or resumes slime breathing/dancing animations and resets expression state.",
  "preview/slime-model.js:triggerDanceMove": "Dispatches tier-differentiated dance moves (spin for Tier 3+, flip for Tier 4-5).",
  "preview/slime-model.js:shuffleDanceMove": "Randomly triggers tier-appropriate flourish actions (spin or flip) with randomized directions and expressions.",
  "preview/slime-model.js:setAutoDanceRoutine": "Toggles automated periodic dance routines for autonomous slime behavior.",
  "preview/slime-model.js:triggerDonateAnimation": "Triggers categorized donation animations (small 1s jump; medium/high 1s jump + 0.5s spin), separating tier upgrades from celebration FX.",
  "preview/slime-model.js:triggerLionCelebration": "Initiates ultra luxury celebration coronation sequence with golden beam and restored open eyes upon completion.",
  "preview/slime-model.js:update": "Per-frame animation loop evaluating physics-driven slime dancing, breathing, audio kick bouncing, and eyelids.",

  // slime-preview.js
  "preview/slime-preview.js:triggerWhiteLightBeam": "Activates vertical white light spotlight beam at designated ground coordinates.",
  "preview/slime-preview.js:triggerFireworks": "Spawns celebratory particle fireworks burst at designated 3D coordinates.",
  "preview/slime-preview.js:getViewerProfile": "Generates deterministic test viewer profile data for demo avatars.",
  "preview/slime-preview.js:createAvatarInstance": "Instantiates and positions a new cyber slime avatar in the preview scene.",
  "preview/slime-preview.js:clearShowcaseLabels": "Cleans up floating 3D labels generated during the multi-tier showcase.",
  "preview/slime-preview.js:createTierLabelSprite": "Builds floating 3D billboard labels with tier descriptions for showcase display.",
  "preview/slime-preview.js:showcaseAllTiers": "Displays 5 evolutionary slime tiers in a showcase row with descriptive 3D billboard labels.",
  "preview/slime-preview.js:repositionGrid": "Arranges active preview avatars into a balanced circular or grid formation.",
  "preview/slime-preview.js:updateMetricHUD": "Updates the HUD FPS, draw calls, and vertex count statistics display.",
  "preview/slime-preview.js:addAvatars": "Increments avatar count and positions new slimes on stage.",
  "preview/slime-preview.js:removeAvatars": "Decrements avatar count and safely disposes of removed slime meshes.",
  "preview/slime-preview.js:setAvatarCount": "Dynamically scales the number of preview avatars on stage (1 to 50).",
  "preview/slime-preview.js:triggerLionCelebrationEvent": "Coordinates stage-wide ultra donation sequence respecting clean cinematic foreground mascot presentation.",
  "preview/slime-preview.js:togglePause": "Toggles global animation pause for inspection and snapshotting.",
  "preview/slime-preview.js:setHeroLevel": "Sets the hero avatar billboard TikTok level in the preview sandbox.",
  "preview/slime-preview.js:setHeroRank": "Sets the hero avatar billboard donor ranking in the preview sandbox.",
  "preview/slime-preview.js:simulateCrowdRanks": "Simulates random TikTok levels and donor rankings across the avatar crowd.",
  "preview/slime-preview.js:clearAllCrowdRanks": "Resets all crowd avatar billboard levels and rankings.",
  "preview/slime-preview.js:triggerCameraShake": "Adds procedural camera shake impact during high-tier and ultra donations.",
  "preview/slime-preview.js:showGiftToast": "Displays an animated HTML toast notification with gift icon and coin value.",
  "preview/slime-preview.js:spawnDroppingCoins": "Spawns physics-based instanced 3D coins cascading and bouncing across the dance floor.",
  "preview/slime-preview.js:spawnSingleCoinInstance": "Spawns a single 3D falling gold coin with randomized angular velocity.",
  "preview/slime-preview.js:getSlimeEffectiveRadius": "Calculates boundary radius of slime avatar to avoid mesh clipping when spawning coin orbits.",
  "preview/slime-preview.js:spawnOrbitingCoinRings": "Spawns multi-level golden coin rings orbiting dynamically around the celebrating slime.",
  "preview/slime-preview.js:triggerFloorShockwave": "Spawns expanding circular shockwave ring on the dance floor.",
  "preview/slime-preview.js:triggerDonation": "Dispatches categorized donation events (small, medium, high, ultra) routing to cinematic showcase or in-place effects.",
  "preview/slime-preview.js:bindDonateButtons": "Binds DOM click listeners to all donation trigger buttons in the preview HUD.",
  "preview/slime-preview.js:toggleDonateStorm": "Toggles simulated automated donation stream for stress and visual testing.",
  "preview/slime-preview.js:animate": "Main Three.js render loop driving camera transitions, spotlight fades, avatar updates, and particle systems."
};

// Automatically map preview duties to src duties for newly ported modules
for (const [k, v] of Object.entries(duties)) {
  if (k.startsWith('preview/')) {
    const srcKey = k.replace('preview/', 'src/');
    if (!duties[srcKey]) duties[srcKey] = v;
  }
}

// Existing cache map: key -> duty
const existingDuties = new Map();
if (cache.functions) {
  for (const fn of cache.functions) {
    existingDuties.set(`${fn.file}:${fn.name}`, fn.duty);
  }
}

// Build merged function list
const updatedFunctions = [];

for (const file of scanResult.files) {
  for (const fn of file.functions) {
    const key = `${file.filePath}:${fn.name}`;
    let duty = duties[key] || existingDuties.get(key) || `Executes ${fn.name} operation within ${path.basename(file.filePath)}.`;
    
    updatedFunctions.push({
      file: file.filePath,
      name: fn.name,
      params: fn.params,
      startLine: fn.startLine,
      endLine: fn.endLine,
      duty
    });
  }
}

// Update cache
cache.lastScanned = new Date().toISOString();
cache.functions = updatedFunctions;
fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf8');
console.log(`Updated cache with ${updatedFunctions.length} functions.`);

// Build Mermaid classDiagram
const classNames = new Map();
const mermaidClasses = [];
const mermaidRelations = [];

for (const file of scanResult.files) {
  const cName = file.filePath.replace(/[^a-zA-Z0-9_]/g, '_');
  classNames.set(file.filePath, cName);

  const methods = file.functions
    .slice(0, 15) // keep Mermaid diagrams clean and readable
    .map(f => {
      const cleanParams = f.params.replace(/[()\[\]]/g, '').slice(0, 30);
      return `        +${f.name}(${cleanParams}${cleanParams.length === 30 ? '...' : ''})`;
    });

  mermaidClasses.push(`    class ${cName} {\n${methods.join('\n')}\n    }`);
}

// Relations
for (const file of scanResult.files) {
  const fromClass = classNames.get(file.filePath);
  for (const imp of file.imports) {
    const matchedFile = scanResult.files.find(f => {
      const base = path.basename(f.filePath, '.js');
      const impBase = path.basename(imp, '.js').split('?')[0];
      return base === impBase;
    });
    if (matchedFile && matchedFile.filePath !== file.filePath) {
      const toClass = classNames.get(matchedFile.filePath);
      const relStr = `${fromClass} --> ${toClass} : imports`;
      if (!mermaidRelations.includes(relStr)) {
        mermaidRelations.push(relStr);
      }
    }
  }
}

// Build Function Details grouped by file
const fileGroups = new Map();
for (const fn of updatedFunctions) {
  if (!fileGroups.has(fn.file)) {
    fileGroups.set(fn.file, []);
  }
  fileGroups.get(fn.file).push(fn);
}

const fileDetails = [];
for (const [filePath, fns] of fileGroups) {
  const lines = [`### ${filePath}`];
  for (const fn of fns) {
    const link = `[${fn.name}(${fn.params})](file:///e:/game/bar_room/${fn.file}#L${fn.startLine}-L${fn.endLine})`;
    lines.push(`- ${link}: ${fn.duty}`);
  }
  fileDetails.push(lines.join('\n'));
}

const diagramContent = `# Project Function Diagram

This diagram represents the functional structure of the project, including function definitions, parameters, and dependency relationships.

## Project Environment
- **Primary Language**: Node.js (JavaScript ESM) / WebGL (Three.js)
- **Execution Environment**: Docker container \`tiktok-live-bar\` / \`tiktok-preview\` (Local device runtime supported)
- **Workspace**: e:/game/bar_room
- **Additional Info**: High-performance real-time 3D interactive TikTok LIVE nightclub bar web application with procedural 3D slimes, Web Audio beat detection, categorized donation celebration effects, and WebSocket event ingestion.

\`\`\`mermaid
classDiagram
${mermaidClasses.join('\n\n')}

${mermaidRelations.join('\n')}
\`\`\`

## Function Details

${fileDetails.join('\n\n')}
`;

fs.writeFileSync(diagramPath, diagramContent, 'utf8');
console.log('Successfully updated DIAGRAM.md');
