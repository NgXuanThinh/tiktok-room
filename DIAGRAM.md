# Project Function Diagram

This diagram represents the functional structure of the project, including function definitions, parameters, and dependency relationships.

## Project Environment
- **Primary Language**: Node.js (JavaScript ESM) / WebGL (Three.js)
- **Execution Environment**: Docker container `tiktok-live-bar` / `tiktok-preview` (Local device runtime supported)
- **Workspace**: /Users/thinhng/WorkSpace/personal/tiktok-room
- **Additional Info**: High-performance real-time 3D interactive TikTok LIVE nightclub bar web application with procedural 3D slimes, Web Audio beat detection, categorized donation celebration effects, and WebSocket event ingestion.

```mermaid
classDiagram
    class server_avatar_proxy_js {
        +extractInitials(name = '')
        +generateSvgAvatar(username = 'User', ...)
        +fetchAvatarWithCache(targetUrl, ...)
        +avatarProxyRouter(req, res, next)
    }

    class server_event_normalizer_js {
        +parseColorCommand(comment)
        +sanitizeComment(text)
        +extractUser(raw)
        +normalizeChat(raw)
        +normalizeGift(raw)
        +normalizeLike(raw)
        +normalizeSocial(type, raw)
        +normalizeTikTokEvent(type, raw = {})
    }

    class server_mock_simulator_js {
        +createCustomMockUser(params = {})
        +getRandomViewer()
        +simulateLikes(count = 10, ...)
        +simulateChat(customText = null, ...)
        +simulateGift(tier = 1, ...)
        +simulateSpawn(user = null)
        +startAutoSimulation(intervalMs = 1500)
        +stopAutoSimulation()
    }

    class server_rate_limiter_js {
        +enqueue(event)
        +flushCombo()
        +drainQueue()
        +getQueueSize()
        +reset()
    }

    class server_server_js {
        +broadcast(payload)
    }

    class server_tiktok_service_js {
        +connect(username)
        +_bindEvents()
        +_scheduleReconnect()
        +disconnect()
        +getStatus()
    }

    class src_audio_system_js {
        +split3BandFrequency(spectrum, ...)
        +calculateAudioFlux(current, ...)
        +synthesizeSfxParams(name)
        +getBeatStepEvents(step)
        +start(audioCtx = this.ctx, ...)
        +_playStep(step)
        +stop()
        +setVolume(v)
        +unlockAudio(instance = null)
        +init()
        +unlockAudio()
        +getBands()
        +playSfx(name)
        +setVolume(val)
        +toggleMute()
    }

    class src_avatar_manager_js {
        +parseColorCommand(comment)
        +getSlimeKinematics(bpmPhase, ...)
        +getDanceKinematics(style, phase)
        +touch(userId, ...)
        +removeAvatar(userId)
        +clearAll()
        +disposeAvatar(avatar)
        +createSlimeGeometry()
        +createSlimeFaceTexture(isSmiling = true)
        +createAvatarMesh(userData, ...)
        +applyWhaleSlimeAesthetics(group, tier = 3)
        +setSlimeColor(slimeGroup, colorKey)
        +createBillboardSprite(userData)
    }

    class src_club_environment_js {
        +clampSpotlightToFloor(target = { x: 0, ...)
        +init()
        +createStarfield()
        +createAccentLights()
        +createLedFloor()
        +createVipPodium()
        +createDjBooth()
        +createWallsAndNeon()
        +createMovingHeads()
        +createLightBeams()
        +triggerWhiteLightBeam(targetX = 0, ...)
        +triggerGoldenLightBeam(targetX = 0, ...)
        +focusSpotlights(categoryOrTier = 1, ...)
        +createLaserBeams()
        +createFireworksSystem()
        +createFlyingHeartsSystem()
        +emitFlyingHearts(count = 10)
        +update(delta, ...)
    }

    class src_main_js {
        +enqueue(user, ...)
        +promote(item)
        +update(delta, ...)
        +generateDanceFloorSlots(config = FLOOR_GRID_CONFIG, ...)
        +initClientApp()
        +findRandomAvailableFloorSlot()
        +handleLiveEvent(evt)
        +triggerLeapAnimation(mesh, ...)
        +executeVipPromotionAndSwap(sortedDonors)
        +updateVipLoungeOccupants(sortedDonors)
        +deleteAvatar(userId)
        +clearAllAvatars()
        +getOrCreateAvatarMesh(userData, coins = 0)
        +syncActiveFloorAvatars()
        +animate()
    }

    class src_scene_manager_js {
        +getOrbitCameraPosition(theta, ...)
        +init()
        +setCameraPreset(key, ...)
        +setOrbitRadius(radius)
        +setFov(fov)
        +revertVipCamera()
        +toggleChromaKey()
        +toggleAlpha()
        +onResize()
        +triggerCameraShake(intensity = 0.35, ...)
        +startLionTracking(heroMesh, ...)
        +update(deltaTime = 0.016, ...)
    }

    class src_slime_model_js {
        +createBasicHalfSphereGeometry()
        +createChubbyMochiSlimeGeometry()
        +createBillboardSprite(userData = {})
        +createCyberSlime(paletteKey = 'cyan', ...)
        +create3DEye(isLeft = true)
        +setLabelVisible(visible)
        +setTikTokLevel(lvl)
        +setDonateRank(rank)
        +updateBillboard(coinsToAdd = 0, ...)
        +setPalette(newKey)
        +setGender(gender)
        +setTier(tierNum)
        +setExpression(exp)
        +setPaused(paused)
        +triggerDanceMove(moveType)
        +shuffleDanceMove()
        +setAutoDanceRoutine(enabled)
        +triggerDonateAnimation(type = 'small', ...)
        +triggerLionCelebration(upgradeTier = false)
        +update(deltaTime, ...)
    }

    class src_ui_overlay_js {
        +initElements()
        +bindEvents()
        +unlockAudioHandler()
        +setDistHelper(val)
        +getTargetUser()
        +getCustomMockUser(spawnIdx = 0)
        +updateActiveAvatars(avatarList = [])
        +bindMockButton(id, fn)
        +toggleAdminDrawer()
        +updateTikTokStatus(status)
        +addHype(points = 1)
        +triggerFrenzy(duration = 15)
        +triggerFrenzyMode()
        +showGiftAlert(giftEvent)
        +updateLeaderboard(donors = [])
    }

    class preview_slime_model_js {
        +createBasicHalfSphereGeometry()
        +createChubbyMochiSlimeGeometry()
        +createBillboardSprite(userData = {})
        +createCyberSlime(paletteKey = 'cyan', ...)
        +create3DEye(isLeft = true)
        +setLabelVisible(visible)
        +setTikTokLevel(lvl)
        +setDonateRank(rank)
        +updateBillboard(coinsToAdd = 0, ...)
        +setPalette(newKey)
        +setGender(gender)
        +setTier(tierNum)
        +setExpression(exp)
        +setPaused(paused)
        +triggerDanceMove(moveType)
        +shuffleDanceMove()
        +setAutoDanceRoutine(enabled)
        +triggerDonateAnimation(type = 'small', ...)
        +triggerLionCelebration(upgradeTier = false)
        +update(deltaTime, ...)
    }

    class preview_slime_preview_js {
        +triggerWhiteLightBeam(targetX = 0, ...)
        +triggerFireworks(originY = 4.2, ...)
        +getViewerProfile(idx)
        +createAvatarInstance(paletteKey, ...)
        +clearShowcaseLabels()
        +createTierLabelSprite(title, ...)
        +showcaseAllTiers()
        +repositionGrid()
        +updateMetricHUD()
        +addAvatars(countToAdd)
        +removeAvatars(countToRemove)
        +setAvatarCount(targetCount)
        +triggerLionCelebrationEvent(targetAvatar = null, ...)
        +togglePause()
        +setHeroLevel(levelNum)
        +setHeroRank(rankStr)
        +simulateCrowdRanks()
        +clearAllCrowdRanks()
        +triggerCameraShake(intensity = 0.25, ...)
        +showGiftToast(username, gift)
        +triggerDonation(giftKey, ...)
        +bindDonateButtons()
        +toggleDonateStorm()
        +animate()
    }

server_mock_simulator_js --> server_event_normalizer_js : imports
server_server_js --> server_event_normalizer_js : imports
server_server_js --> server_rate_limiter_js : imports
server_server_js --> server_avatar_proxy_js : imports
server_server_js --> server_tiktok_service_js : imports
server_server_js --> server_mock_simulator_js : imports
src_main_js --> src_scene_manager_js : imports
src_main_js --> src_club_environment_js : imports
src_main_js --> src_avatar_manager_js : imports
src_main_js --> src_audio_system_js : imports
src_main_js --> src_ui_overlay_js : imports
src_avatar_manager_js --> src_slime_model_js : imports
preview_slime_preview_js --> preview_slime_model_js : imports
```

## Function Details

### server/avatar-proxy.js
- [extractInitials(name = '')](file:///Users/thinhng/WorkSpace/personal/tiktok-room/server/avatar-proxy.js#L24-L34): Extracts a 1-to-2 uppercase character monogram from a user name, returning "?" for empty or non-string inputs.
- [generateSvgAvatar(username = 'User', userId = '0')](file:///Users/thinhng/WorkSpace/personal/tiktok-room/server/avatar-proxy.js#L39-L61): Generates a deterministic, gradient-filled circular SVG avatar containing the user's initials when their TikTok profile photo is missing or blocked.
- [fetchAvatarWithCache(targetUrl, username = 'Viewer', userId = '0')](file:///Users/thinhng/WorkSpace/personal/tiktok-room/server/avatar-proxy.js#L66-L116): Fetches an avatar from TikTok CDN with a 5-second abort timeout and LRU caching, falling back to a generated SVG avatar on HTTP errors or network timeouts.
- [avatarProxyRouter(req, res, next)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/server/avatar-proxy.js#L121-L148): Express route handler serving avatar images with permissive CORS headers and a 24-hour cache-control header for browser WebGL textures.

### server/event-normalizer.js
- [parseColorCommand(comment)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/server/event-normalizer.js#L38-L55): Parses !color chat commands, strictly resolving to one of 4 canonical Slime colors (green, red, blue, yellow) or Vietnamese aliases, and explicitly rejecting hex codes.
- [sanitizeComment(text)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/server/event-normalizer.js#L81-L84): Masks profane or sensitive words in chat messages by replacing matched characters with asterisks.
- [extractUser(raw)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/server/event-normalizer.js#L89-L101): Standardizes raw TikTok user attributes into a normalized identity object containing user ID, username, nickname, and avatar URL.
- [normalizeChat(raw)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/server/event-normalizer.js#L106-L117): Transforms raw chat payloads into normalized comment events, automatically extracting and attaching valid !color commands.
- [normalizeGift(raw)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/server/event-normalizer.js#L126-L152): Normalizes incoming gift payloads by calculating total coin value and categorizing gifts into one of 4 hierarchical tiers.
- [normalizeLike(raw)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/server/event-normalizer.js#L157-L164): Sanitizes like event counts and preserves cumulative total likes across the live session.
- [normalizeSocial(type, raw)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/server/event-normalizer.js#L169-L174): Normalizes social stream interactions such as follows, shares, and member joins.
- [normalizeTikTokEvent(type, raw = {})](file:///Users/thinhng/WorkSpace/personal/tiktok-room/server/event-normalizer.js#L182-L182): Central dispatcher that converts any incoming raw TikTok event into a unified, timestamped event schema.

### server/mock-simulator.js
- [createCustomMockUser(params = {})](file:///Users/thinhng/WorkSpace/personal/tiktok-room/server/mock-simulator.js#L6-L6): Factory helper generating mock TikTok user profile payloads with customized attributes.
- [getRandomViewer()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/server/mock-simulator.js#L74-L76): Selects and returns a randomized mock viewer profile from the default mock viewer pool.
- [simulateLikes(count = 10, user = null)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/server/mock-simulator.js#L78-L87): Generates and emits a synthetic like event for testing without an active stream.
- [simulateChat(customText = null, user = null)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/server/mock-simulator.js#L89-L98): Generates and emits a synthetic chat event with predefined or custom text.
- [simulateGift(tier = 1, customGiftName = null, customCoins = null, user = null)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/server/mock-simulator.js#L100-L117): Generates and emits a synthetic gift event matching a specified gift tier.
- [simulateSpawn(user = null)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/server/mock-simulator.js#L119-L130): Simulates viewer entrance/spawn events with canonical color directives into the 3D room.
- [startAutoSimulation(intervalMs = 1500)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/server/mock-simulator.js#L132-L147): Starts an automated periodic timer randomly generating likes, chats, and tiered gifts.
- [stopAutoSimulation()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/server/mock-simulator.js#L149-L155): Clears the periodic simulation timer and halts automatic event generation.

### server/rate-limiter.js
- [enqueue(event)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/server/rate-limiter.js#L32-L65): Enqueues incoming live events, immediately bypassing Tier 2-4 VIP gifts and aggregating likes into sliding-window combos.
- [flushCombo()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/server/rate-limiter.js#L70-L97): Packages accumulated like combos into a single batched event and pushes it to the dispatch queue.
- [drainQueue()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/server/rate-limiter.js#L102-L108): Immediately flushes pending combos and drains all queued events through the dispatch callback.
- [getQueueSize()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/server/rate-limiter.js#L113-L115): Returns the current number of pending events held in the rate limiter queue.
- [reset()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/server/rate-limiter.js#L120-L132): Clears all pending events, resets the like combo accumulator, and halts running timers.

### server/server.js
- [broadcast(payload)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/server/server.js#L40-L47): Serializes and broadcasts JSON message payloads to all currently connected WebSocket clients.

### server/tiktok-service.js
- [connect(username)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/server/tiktok-service.js#L25-L58): Establishes a real-time scraping connection to a TikTok LIVE room by username with automatic event binding.
- [_bindEvents()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/server/tiktok-service.js#L63-L94): Attaches internal event listeners for TikTok chat, gift, like, social, room user counts, and disconnects.
- [_scheduleReconnect()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/server/tiktok-service.js#L99-L111): Schedules an automatic reconnection attempt using exponential backoff when a stream drops unexpectedly.
- [disconnect()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/server/tiktok-service.js#L116-L130): Manually terminates the active TikTok webcast connection and cancels pending reconnect timers.
- [getStatus()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/server/tiktok-service.js#L135-L142): Returns the current live connection status, room ID, viewer count, and connected username.

### src/audio-system.js
- [split3BandFrequency(spectrum, sampleRate = 44100, fftSize = 512)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/audio-system.js#L10-L50): Slices an FFT byte frequency spectrum into isolated Bass (0-150Hz), Mids (150-1000Hz), and Treble (>1000Hz) energy values.
- [calculateAudioFlux(current, avg, smoothing = 0.85)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/audio-system.js#L55-L59): Computes smoothed running average energy and instantaneous positive onset flux for beat detection.
- [synthesizeSfxParams(name)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/audio-system.js#L88-L90): Provides procedural frequency, gain, and timing parameters for zero-asset sound synthesis.
- [getBeatStepEvents(step)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/audio-system.js#L122-L135): Maps a 16-step sequencer index to discrete Kick (four-on-the-floor), Snare (backbeat), and Hi-Hat triggers.
- [start(audioCtx = this.ctx, destinationNode = this.destination)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/audio-system.js#L152-L171): Starts the 16-step 128 BPM loop timer and connects procedural drum voices to the audio destination.
- [_playStep(step)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/audio-system.js#L173-L247): Synthesizes swept-sine kicks, bandpass filtered snare noise, and highpass hi-hat ticks for the current sequencer step.
- [stop()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/audio-system.js#L249-L255): Halts the procedural drum loop and clears active step timers.
- [setVolume(v)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/audio-system.js#L257-L262): Adjusts the master gain volume level of the procedural beat engine or sound effects.
- [unlockAudio(instance = null)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/audio-system.js#L268-L273): Resumes the browser AudioContext from suspended state upon user interaction and starts the beat synthesizer.
- [init()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/audio-system.js#L291-L308): Initializes Web Audio context, master gain node, and 3-band FFT analyser node upon first audio unlock.
- [unlockAudio()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/audio-system.js#L310-L319): Resumes the browser AudioContext from suspended state upon user interaction and starts the beat synthesizer.
- [getBands()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/audio-system.js#L321-L346): Reads current frequency data from the AnalyserNode and returns normalized energy and flux across 3 audio bands.
- [playSfx(name)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/audio-system.js#L348-L411): Procedurally synthesizes sound effects (coin clink, air horn, bass boom) with exponential clickless decay envelopes.
- [setVolume(val)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/audio-system.js#L413-L420): Adjusts the master gain volume level of the procedural beat engine or sound effects.
- [toggleMute()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/audio-system.js#L422-L428): Toggles audio master gain between muted and unmuted states.

### src/avatar-manager.js
- [parseColorCommand(comment)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/avatar-manager.js#L39-L54): Parses chat comments for !color directives, returning a canonical Slime color definition while rejecting hex values.
- [getSlimeKinematics(bpmPhase, isBouncing = false)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/avatar-manager.js#L76-L96): Calculates volume-preserving mathematical Squash & Stretch scale factors and vertical bounce jump displacement synchronized with music BPM.
- [getDanceKinematics(style, phase)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/avatar-manager.js#L101-L174): Computes procedurally animated limb and torso rotation offsets for humanoid and procedural dance styles.
- [touch(userId, username, coins = 0, isPinned = null)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/avatar-manager.js#L187-L234): Registers or touches a viewer's activity timestamp, accumulates coins, updates VIP tiers, and evicts idle avatars over capacity.
- [removeAvatar(userId)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/avatar-manager.js#L260-L269): Removes an avatar by userId from tracking registry and frees occupancy slot.
- [clearAll()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/avatar-manager.js#L271-L276): Clears all registered avatars from tracking manager.
- [disposeAvatar(avatar)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/avatar-manager.js#L278-L288): Safely unmounts an avatar from the 3D scene and disposes of all mesh materials, geometries, and canvas textures to prevent VRAM leaks.
- [createSlimeGeometry()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/avatar-manager.js#L294-L305): Creates a smooth sphere geometry with a flattened bottom vertex profile to sit naturally on the dance floor.
- [createSlimeFaceTexture(isSmiling = true)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/avatar-manager.js#L310-L345): Generates a procedural 2D canvas face texture featuring glossy eyes and a smile without rosy cheeks.
- [createAvatarMesh(userData, forcedColor = null)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/avatar-manager.js#L350-L387): Builds a complete 3D Slime mesh hierarchy with translucent jelly material, blinking eyes, VIP accessories, and overhead billboard.
- [applyWhaleSlimeAesthetics(group, tier = 3)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/avatar-manager.js#L392-L420): Applies whale VIP aura, crown, and accessory adornments while strictly preserving original avatar body color and palette.
- [setSlimeColor(slimeGroup, colorKey)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/avatar-manager.js#L425-L441): Updates the material color and emissive glow of an existing 3D Slime to a chosen canonical color.
- [createBillboardSprite(userData)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/avatar-manager.js#L446-L448): Creates a 3D billboard sprite displaying the user's TikTok avatar, nickname, and VIP rank badge above their Slime.

### src/club-environment.js
- [clampSpotlightToFloor(target = { x: 0, y: 0, z: 0 })](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/club-environment.js#L42-L42): Clamps moving spotlight target positions within the dance floor bounds.
- [init()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/club-environment.js#L93-L105): Coordinates setup of ambient lights, moving heads, lasers, VIP podium, DJ booth, and particle systems.
- [createStarfield()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/club-environment.js#L110-L161): Generates a 3,000-star twinkling midnight sky background using Three.js Points.
- [createAccentLights()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/club-environment.js#L166-L198): Adds overhead spotlights for the DJ console and warm amber point lights for the bar lounge.
- [createLedFloor()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/club-environment.js#L204-L298): Constructs a 12x12 LED purple dance floor matrix with glowing white border frames in a single draw call using Three.js InstancedMesh.
- [createVipPodium()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/club-environment.js#L310-L508): Builds an elevated circular VIP podium featuring a gold metallic rim and glowing neon glass stage top.
- [createDjBooth()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/club-environment.js#L514-L709): Assembles the DJ table with spinning vinyl records, Pioneer-style mixer, and animated pink female chubby slime DJ mascot.
- [createWallsAndNeon()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/club-environment.js#L714-L738): Constructs club boundary walls, bar counters, and emissive neon club signage.
- [createMovingHeads()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/club-environment.js#L743-L798): Builds 4 dual-axis moving head spotlights that sweep light cones across the venue.
- [createLightBeams()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/club-environment.js#L805-L840): Initializes overhead cylindrical geometry and additive materials for high-tier white and ultra golden light beams.
- [triggerWhiteLightBeam(targetX = 0, targetZ = 0, duration = 2.5)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/club-environment.js#L842-L851): Activates overhead white spotlight beam effect for high-tier donations (500–5000 coins).
- [triggerGoldenLightBeam(targetX = 0, targetZ = 0, duration = 7.6)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/club-environment.js#L853-L862): Activates wide golden pillar of light beam for ultra luxury donations (>= 6000 coins).
- [focusSpotlights(categoryOrTier = 1, targetPosition = null, duration = null)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/club-environment.js#L871-L926): Dynamically focuses venue spotlights onto donating VIP avatars based on donation tier (1, 2, 6, or 8 spotlights).
- [createLaserBeams()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/club-environment.js#L931-L949): Creates 6 additive-blended laser beam geometry cones fanning out from the ceiling rig.
- [createFireworksSystem()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/club-environment.js#L954-L989): Initializes a 6,000-particle single-buffer Points system for multi-tier fireworks bursts.
- [createFlyingHeartsSystem()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/club-environment.js#L994-L1016): Initializes a single-buffer particle system for floating 3D hearts triggered by viewer likes.
- [emitFlyingHearts(count = 10)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/club-environment.js#L1061-L1084): Spawns floating hearts that rise from the floor and sway upward upon viewer likes.
- [update(delta, bands = {}, camera = null)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/club-environment.js#L1086-L1086): Updates vinyl rotation, DJ mascot bobbing, moving head sweeps, laser strobes, floor tile colors, and particle physics each frame.

### src/main.js
- [enqueue(user, mesh, tier, returnSlot)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/main.js#L34-L59): Enqueues a donating whale in the sequential FIFO VIP stage queue.
- [promote(item)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/main.js#L61-L92): Promotes a VIP whale avatar onto the center podium stage or elevates them at their floor slot.
- [update(delta, onPromote = null, onVacate = null)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/main.js#L94-L120): Ticks down remaining tenure for the active whale on the VIP stage and promotes queued whales upon expiry.
- [generateDanceFloorSlots(config = FLOOR_GRID_CONFIG)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/main.js#L124-L167): Generates spatial coordinates for avatars on the interactive dance floor in concentric outward rings from the center.
- [initClientApp()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/main.js#L186-L896): Initializes the 3D client application, network sockets, audio, and UI overlays.
- [findRandomAvailableFloorSlot()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/main.js#L201-L223): Picks an unoccupied floor slot randomly across dance floor grid to spawn new slimes with natural spatial distribution.
- [handleLiveEvent(evt)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/main.js#L258-L444): Processes incoming normalized WebSocket live events, routing likes, chats, gifts, and follows to visual and audio systems.
- [triggerLeapAnimation(mesh, targetPos, targetRotY, onComplete = null)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/main.js#L453-L474): Animates an avatar along a parabolic leap arc (+2.4m apex) with cubic ease-in-out curve between dance floor and VIP lounge platforms.
- [executeVipPromotionAndSwap(sortedDonors)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/main.js#L482-L574): Executes bilateral slot promotion and swapping between top donors (Top 1 Left Imperial Throne, Top 2 Right Platinum Lounge) and displaced avatars returning to floor.
- [updateVipLoungeOccupants(sortedDonors)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/main.js#L577-L579): Positions top daily donors on the elevated VIP lounge platform flanking the DJ booth.
- [deleteAvatar(userId)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/main.js#L582-L600): Manually deletes a specific avatar from 3D scene, tracking manager, and coin maps, re-evaluating VIP assignments.
- [clearAllAvatars()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/main.js#L602-L616): Disposes and removes all avatars from the 3D scene and resets leaderboard and floor occupancy.
- [getOrCreateAvatarMesh(userData, coins = 0)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/main.js#L637-L697): Retrieves or instantiates a 3D Slime avatar mesh for a viewer, positioning it on a vacant dance floor grid slot with smooth spawn scale-up.
- [syncActiveFloorAvatars()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/main.js#L699-L714): Synchronizes active 3D avatar meshes, colors, levels, and ranks with the stream panel target selector.
- [animate()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/main.js#L720-L892): The main 60 FPS WebGL render loop updating audio analysis, camera transitions, Slime squash-and-stretch, and environmental lighting.

### src/scene-manager.js
- [getOrbitCameraPosition(theta, phi = 0.85, radius = ORBIT_CONFIG.radius)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/scene-manager.js#L31-L40): Computes clamped spherical orbit coordinates keeping the camera within room boundaries and focused on the dance floor.
- [init()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/scene-manager.js#L108-L199): Configures renderer pixel ratio, shadow-free tone mapping, and window resize event listeners.
- [setCameraPreset(key, duration = null, customTarget = null)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/scene-manager.js#L201-L231): Smoothly transitions the camera position, focus target, and FOV to a designated camera preset.
- [setOrbitRadius(radius)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/scene-manager.js#L233-L237): Dynamically alters camera orbit radius around the dance floor.
- [setFov(fov)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/scene-manager.js#L239-L245): Adjusts camera vertical field-of-view with projection matrix update.
- [revertVipCamera()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/scene-manager.js#L247-L250): Reverts camera focus from VIP spotlight target back to the default overview preset.
- [toggleChromaKey()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/scene-manager.js#L252-L264): Switches the viewport background between standard club atmosphere and chroma key green for OBS streaming.
- [toggleAlpha()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/scene-manager.js#L266-L273): Toggles WebGL clear alpha between opaque black and transparent for OBS browser overlays.
- [onResize()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/scene-manager.js#L275-L281): Updates camera aspect ratio and renderer dimensions when the browser window or stream canvas resizes.
- [triggerCameraShake(intensity = 0.35, duration = 1.0)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/scene-manager.js#L283-L287): Adds procedural camera shake impact during high-tier and ultra donations.
- [startLionTracking(heroMesh, duration = 7.6)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/scene-manager.js#L289-L299): Dynamically frames and tracks the soaring hero avatar up to 4.2m in the sky with camera shake during Lion celebrations.
- [update(deltaTime = 0.016, bassPunch = 0)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/scene-manager.js#L301-L387): Lerps camera position and look-at target smoothly toward the active preset, pulsing orbit distance on bass hits.

### src/slime-model.js
- [createBasicHalfSphereGeometry()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/slime-model.js#L46-L57): Generates Tier 1 classic half-sphere geometry with smooth flattened underside.
- [createChubbyMochiSlimeGeometry()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/slime-model.js#L63-L97): Generates Tier 2 chubby mochi teardrop slime geometry with wider base and organic taper.
- [createBillboardSprite(userData = {})](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/slime-model.js#L187-L187): Builds high-contrast overhead user badge with sharp contrast (#ffffff text), VIP avatar border, level, and rank tags.
- [createCyberSlime(paletteKey = 'cyan', rawUserData = {})](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/slime-model.js#L341-L341): Instantiates complete Slime mesh hierarchy with dual-mesh body, blushing cheeks, permanent Gold halo and aura ring, 3D animated eyes, horns, and wings.
- [create3DEye(isLeft = true)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/slime-model.js#L384-L409): Builds 3D chibi eye mesh hierarchy with glossy cornea sphere and specular reflective highlights.
- [setLabelVisible(visible)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/slime-model.js#L785-L787): Toggles visibility of the 3D billboard sprite above the slime.
- [setTikTokLevel(lvl)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/slime-model.js#L788-L794): Sets the TikTok badge level on the billboard.
- [setDonateRank(rank)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/slime-model.js#L795-L801): Sets the donor rank title (e.g., TOP 1) on the billboard.
- [updateBillboard(coinsToAdd = 0, newLevel = null, newRank = null)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/slime-model.js#L802-L828): Redraws the 2D canvas texture for the billboard sprite with updated coins, level, and rank.
- [setPalette(newKey)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/slime-model.js#L868-L897): Switches avatar body palette among cyan, pink, and lime while preserving permanent Gold halo and foot ring.
- [setGender(gender)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/slime-model.js#L899-L904): Sets slime gender presentation accessories (e.g., cute bow for female slimes).
- [setTier(tierNum)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/slime-model.js#L914-L974): Updates slime evolutionary visual tier (1 to 5) with corresponding horns, tail, wings, and mini-slimes.
- [setExpression(exp)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/slime-model.js#L976-L988): Updates eyelid and facial expressions (normal, happy, angry, proud, squint).
- [setPaused(paused)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/slime-model.js#L990-L1004): Pauses or resumes slime breathing/dancing animations and resets expression state.
- [triggerDanceMove(moveType)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/slime-model.js#L1012-L1045): Dispatches tier-differentiated dance moves (spin for Tier 3+, flip for Tier 4-5).
- [shuffleDanceMove()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/slime-model.js#L1047-L1065): Randomly triggers tier-appropriate flourish actions (spin or flip) with randomized directions and expressions.
- [setAutoDanceRoutine(enabled)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/slime-model.js#L1067-L1073): Toggles automated periodic dance routines for autonomous slime behavior.
- [triggerDonateAnimation(type = 'small', upgradeTier = false, targetTier = 1)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/slime-model.js#L1079-L1096): Triggers categorized donation animations (small 1s jump; medium/high 1s jump + 0.5s spin), separating tier upgrades from celebration FX.
- [triggerLionCelebration(upgradeTier = false)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/slime-model.js#L1098-L1107): Initiates ultra luxury celebration (Pegasus / Lion coronation sequence) with golden beam and restored open eyes upon completion.
- [update(deltaTime, audioKick = 0)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/slime-model.js#L1109-L1506): Per-frame animation tick handling squashing, jumping, spinning, eye blinking, floating accessories, and donation FX lifecycle.

### src/ui-overlay.js
- [initElements()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/ui-overlay.js#L59-L71): Caches DOM element references for fast real-time UI updates during stream events.
- [bindEvents()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/ui-overlay.js#L73-L335): Binds event listeners for UI interactions, audio unlock banner, keyboard shortcuts, and admin form submissions.
- [unlockAudioHandler()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/ui-overlay.js#L75-L87): Handles the 1-click audio unlock prompt, resuming AudioContext and fading out the prompt banner.
- [setDistHelper(val)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/ui-overlay.js#L124-L128): Updates camera orbit distance slider value and HUD readout label.
- [getTargetUser()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/ui-overlay.js#L337-L356): Resolves target user from admin dropdown selection or falls back to custom mock user parameters.
- [getCustomMockUser(spawnIdx = 0)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/ui-overlay.js#L358-L383): Collects custom mock user input from admin UI inputs and assigns unique IDs on repeated spawns.
- [updateActiveAvatars(avatarList = [])](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/ui-overlay.js#L385-L403): Populates the target avatar select dropdown with active avatars on dance floor and VIP platforms.
- [bindMockButton(id, fn)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/ui-overlay.js#L405-L408): Attaches click handlers to admin drawer mock simulation buttons.
- [toggleAdminDrawer()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/ui-overlay.js#L410-L419): Toggles visibility of the streamer administration sidebar drawer.
- [updateTikTokStatus(status)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/ui-overlay.js#L421-L430): Updates the HUD connection badge with real-time TikTok room status and viewer count.
- [addHype(points = 1)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/ui-overlay.js#L432-L443): Increments stream Hype Meter points and triggers 15-second Frenzy Mode when the meter reaches 100%.
- [triggerFrenzy(duration = 15)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/ui-overlay.js#L445-L447): Alias method triggering 15-second Frenzy party mode with air horn SFX and full-room fireworks.
- [triggerFrenzyMode()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/ui-overlay.js#L449-L469): Activates the 15-second club Frenzy party mode with air horn SFX and full-room fireworks.
- [showGiftAlert(giftEvent)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/ui-overlay.js#L471-L504): Displays an animated glassmorphic gift alert card with donor avatar, name, and gift tier icon.
- [updateLeaderboard(donors = [])](file:///Users/thinhng/WorkSpace/personal/tiktok-room/src/ui-overlay.js#L506-L527): Updates the Top 3 Donors leaderboard widget with rank badges and accumulated coin totals.

### preview/slime-model.js
- [createBasicHalfSphereGeometry()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-model.js#L46-L57): Generates Tier 1 classic half-sphere geometry with smooth flattened underside.
- [createChubbyMochiSlimeGeometry()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-model.js#L63-L97): Generates Tier 2 chubby mochi teardrop slime geometry with wider base and organic taper.
- [createBillboardSprite(userData = {})](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-model.js#L187-L187): Builds high-contrast overhead user badge with sharp contrast (#ffffff text), VIP avatar border, level, and rank tags.
- [createCyberSlime(paletteKey = 'cyan', rawUserData = {})](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-model.js#L341-L341): Instantiates complete Slime mesh hierarchy with dual-mesh body, blushing cheeks, permanent Gold halo and aura ring, 3D animated eyes, horns, and wings.
- [create3DEye(isLeft = true)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-model.js#L384-L409): Builds 3D chibi eye mesh hierarchy with glossy cornea sphere and specular reflective highlights.
- [setLabelVisible(visible)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-model.js#L785-L787): Toggles visibility of the 3D billboard sprite above the slime.
- [setTikTokLevel(lvl)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-model.js#L788-L794): Sets the TikTok badge level on the billboard.
- [setDonateRank(rank)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-model.js#L795-L801): Sets the donor rank title (e.g., TOP 1) on the billboard.
- [updateBillboard(coinsToAdd = 0, newLevel = null, newRank = null)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-model.js#L802-L828): Redraws the 2D canvas texture for the billboard sprite with updated coins, level, and rank.
- [setPalette(newKey)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-model.js#L868-L897): Switches avatar body palette among cyan, pink, and lime while preserving permanent Gold halo and foot ring.
- [setGender(gender)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-model.js#L899-L904): Sets slime gender presentation accessories (e.g., cute bow for female slimes).
- [setTier(tierNum)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-model.js#L914-L974): Updates slime evolutionary visual tier (1 to 5) with corresponding horns, tail, wings, and mini-slimes.
- [setExpression(exp)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-model.js#L976-L988): Updates eyelid and facial expressions (normal, happy, angry, proud, squint).
- [setPaused(paused)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-model.js#L990-L1004): Pauses or resumes slime breathing/dancing animations and resets expression state.
- [triggerDanceMove(moveType)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-model.js#L1012-L1045): Dispatches tier-differentiated dance moves (spin for Tier 3+, flip for Tier 4-5).
- [shuffleDanceMove()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-model.js#L1047-L1065): Randomly triggers tier-appropriate flourish actions (spin or flip) with randomized directions and expressions.
- [setAutoDanceRoutine(enabled)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-model.js#L1067-L1073): Toggles automated periodic dance routines for autonomous slime behavior.
- [triggerDonateAnimation(type = 'small', upgradeTier = false, targetTier = 1)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-model.js#L1079-L1096): Triggers categorized donation animations (small 1s jump; medium/high 1s jump + 0.5s spin), separating tier upgrades from celebration FX.
- [triggerLionCelebration(upgradeTier = false)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-model.js#L1098-L1107): Initiates ultra luxury celebration (Pegasus / Lion coronation sequence) with golden beam and restored open eyes upon completion.
- [update(deltaTime, audioKick = 0)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-model.js#L1109-L1506): Per-frame animation tick handling squashing, jumping, spinning, eye blinking, floating accessories, and donation FX lifecycle.

### preview/slime-preview.js
- [triggerWhiteLightBeam(targetX = 0, targetZ = 0, duration = 1.5)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-preview.js#L108-L115): Activates overhead white spotlight beam effect for high-tier donations (500–5000 coins).
- [triggerFireworks(originY = 4.2, originX = 0, originZ = 0, customColor = 0xffe066)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-preview.js#L141-L158): Spawns celebratory particle fireworks burst at designated 3D coordinates.
- [getViewerProfile(idx)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-preview.js#L188-L201): Generates deterministic test viewer profile data for demo avatars.
- [createAvatarInstance(paletteKey, index = 0)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-preview.js#L203-L224): Instantiates and positions a new cyber slime avatar in the preview scene.
- [clearShowcaseLabels()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-preview.js#L229-L237): Cleans up floating 3D labels generated during the multi-tier showcase.
- [createTierLabelSprite(title, desc, colorHex)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-preview.js#L239-L272): Builds floating 3D billboard labels with tier descriptions for showcase display.
- [showcaseAllTiers()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-preview.js#L274-L317): Displays 5 evolutionary slime tiers in a showcase row with descriptive 3D billboard labels.
- [repositionGrid()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-preview.js#L319-L343): Arranges active preview avatars into a balanced circular or grid formation.
- [updateMetricHUD()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-preview.js#L345-L350): Updates the HUD FPS and avatar count statistics display.
- [addAvatars(countToAdd)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-preview.js#L352-L361): Increments avatar count and positions new slimes on stage.
- [removeAvatars(countToRemove)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-preview.js#L363-L371): Decrements avatar count and safely disposes of removed slime meshes.
- [setAvatarCount(targetCount)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-preview.js#L373-L380): Dynamically scales the number of preview avatars on stage (1 to 50).
- [triggerLionCelebrationEvent(targetAvatar = null, upgradeTier = false)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-preview.js#L392-L425): Coordinates stage-wide ultra donation sequence with golden spotlight, banner, camera shake, and fireworks.
- [togglePause()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-preview.js#L465-L480): Toggles global animation pause for inspection and snapshotting.
- [setHeroLevel(levelNum)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-preview.js#L498-L502): Sets the hero avatar billboard TikTok level in the preview sandbox.
- [setHeroRank(rankStr)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-preview.js#L504-L508): Sets the hero avatar billboard donor ranking in the preview sandbox.
- [simulateCrowdRanks()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-preview.js#L510-L539): Simulates random TikTok levels and donor rankings across the avatar crowd.
- [clearAllCrowdRanks()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-preview.js#L541-L548): Resets all crowd avatar billboard levels and rankings.
- [triggerCameraShake(intensity = 0.25, duration = 0.7)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-preview.js#L628-L644): Adds procedural camera shake impact during high-tier and ultra donations.
- [showGiftToast(username, gift)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-preview.js#L647-L673): Displays an animated HTML toast notification with gift icon and coin value.
- [triggerDonation(giftKey, targetAvatar = null, forceTierUp = null)](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-preview.js#L675-L748): Dispatches categorized donation events (small, medium, high, ultra) respecting tier upgrade flags and stage effects.
- [bindDonateButtons()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-preview.js#L751-L758): Binds DOM click listeners to all donation trigger buttons in the preview HUD.
- [toggleDonateStorm()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-preview.js#L778-L813): Toggles simulated automated donation stream for stress and visual testing.
- [animate()](file:///Users/thinhng/WorkSpace/personal/tiktok-room/preview/slime-preview.js#L1000-L1129): Main Three.js render loop driving camera transitions, spotlight fades, avatar updates, and particle systems.
