# Project Function Diagram

This diagram represents the functional structure of the project, including function definitions, parameters, and dependency relationships.

## Project Environment
- **Primary Language**: Node.js (JavaScript ESM) / WebGL (Three.js)
- **Execution Environment**: Docker container `tiktok-live-bar` / `tiktok-preview` (Local device runtime supported)
- **Workspace**: e:/game/bar_room
- **Additional Info**: High-performance real-time 3D interactive TikTok LIVE nightclub bar web application with procedural 3D slimes, Web Audio beat detection, categorized donation celebration effects, and WebSocket event ingestion.

```mermaid
classDiagram
    class server_avatar_proxy_js {
        +extractInitials(name = '')
        +generateSvgAvatar(username = 'User', userId = '0...)
        +fetchAvatarWithCache(targetUrl, username = 'Viewer'...)
        +avatarProxyRouter(req, res, next)
    }

    class server_event_normalizer_js {
        +parseColorCommand(comment)
        +sanitizeComment(text)
        +extractUser(raw)
        +pickValid(...vals)
        +normalizeChat(raw)
        +normalizeGift(raw)
        +normalizeLike(raw)
        +normalizeSocial(type, raw)
        +normalizeTikTokEvent(type, raw = {})
    }

    class server_inspect_live_js {
        +formatTime()
        +logEvent(type, rawData)
        +start()
    }

    class server_mock_simulator_js {
        +createCustomMockUser(params = {})
        +constructor(options = {})
        +getRandomViewer()
        +simulateLikes(count = 10, user = null)
        +simulateChat(customText = null, user = null...)
        +simulateGift(tier = 1, customGiftName = nul...)
        +simulateSpawn(user = null)
        +startAutoSimulation(intervalMs = 1500)
        +stopAutoSimulation()
    }

    class server_rate_limiter_js {
        +constructor(options = {})
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
        +constructor()
        +connect(username)
        +_bindEvents()
        +_scheduleReconnect()
        +disconnect()
        +getStatus()
    }

    class src_animation_constants_js {

    }

    class src_audio_system_js {
        +split3BandFrequency(spectrum, sampleRate = 44100, ...)
        +calculateAudioFlux(current, avg, smoothing = 0.85...)
        +synthesizeSfxParams(name)
        +getBeatStepEvents(step)
        +constructor(audioCtx = null, destinationNo...)
        +start(audioCtx = this.ctx, destinati...)
        +_playStep(step)
        +stop()
        +setVolume(v)
        +unlockAudio(instance = null)
        +constructor()
        +init()
        +unlockAudio()
        +getBands()
        +playSfx(name)
    }

    class src_avatar_coordinator_js {
        +getOrCreateAvatarMesh(userData, coins = 0, context)
        +sinkAndRemoveAvatar(userId, context)
        +deleteAvatar(userId, context)
        +clearAllAvatars(context)
        +syncActiveFloorAvatars(avatarMeshes, uiOverlay, ws)
        +_updateCyberSlime(mesh, data, delta, bands)
        +_updateProceduralSlime(mesh, data, phase, isBouncing,...)
        +_updateHumanoid(data, style, phase)
        +updateAvatarKinematics(mesh, delta, time, bpmSpeed, f...)
    }

    class src_avatar_manager_js {
        +parseColorCommand(comment)
        +getSlimeKinematics(bpmPhase, isBouncing = false)
        +getDanceKinematics(style, phase)
        +constructor(options = {})
        +touch(userId, username, coins = 0, i...)
        +cullIdle(now = Date.now)
        +getAvatarMesh(userId)
        +removeAvatar(userId)
        +clearAll()
        +disposeAvatar(avatar)
        +createSlimeGeometry()
        +createSlimeFaceTexture(isSmiling = true)
        +createAvatarMesh(userData, forcedColor = null)
        +applyWhaleSlimeAesthetics(group, tier = 3)
        +setSlimeColor(slimeGroup, colorKey)
    }

    class src_avatar_ornaments_js {
        +renderAvatarOrnament(tierClass, coins, giftKey)
    }

    class src_billboard_constants_js {

    }

    class src_camera_constants_js {

    }

    class src_chibi_mascot_js {
        +startChibiSlimeMascot(canvas, slimeColorHex = '#00f2...)
        +render()
        +stopChibiSlimeMascot()
    }

    class src_cinematic_config_js {

    }

    class src_cinematic_particles_js {
        +startCinematicParticles(canvas, gift, duration)
        +renderFx()
        +stopCinematicParticles()
    }

    class src_cinematic_showcase_js {
        +initCinematicShowcase(ctx = {})
        +getScreenCoords(worldPos)
        +generateSvgAvatar(name = 'Viewer')
        +enqueueHighTierShowcase(item)
        +processNextHighTier()
        +runCinematic2DShowcase(item, onFinished)
        +cleanupShowcase()
    }

    class src_club_constants_js {
        +count()
        +clampSpotlightToFloor(target = { x: 0, y: 0, z: 0 })
    }

    class src_club_environment_js {
        +createHeartBubbleTexture()
        +constructor(scene)
        +init()
        +getSlimeMetrics(target)
        +getSlimeEffectiveRadius(targetAvatarOrOrigin)
        +createStarfield()
        +createAccentLights()
        +createLedFloor()
        +getTileIndexAtPosition(pos)
        +setSlotFloorColor(slotPos, targetColor = 'defaul...)
        +clearSlotFloorColors()
        +createVipPodium()
        +createDjBooth()
        +createWallsAndNeon()
        +createMovingHeads()
    }

    class src_donate_overlay_js {
        +resolveFxConfig(coins)
        +constructor({ container, sceneManager, aud...)
        +_buildDOM()
        +_resizeCanvas()
        +trigger({ coins, user, giftName = '', ...)
        +_playSmallFx(cfg, coins, meshPos)
        +tick(now)
        +_drainVipQueue()
        +_playVipFx({ coins, user, giftName, donor...)
        +tick(now)
        +_beginFlyBack(donorMeshPos, totalDuration, o...)
        +_setupStage(user, giftName, coins, subType...)
        +_calcAvatarSize(coins)
        +_applyFallbackAvatar()
        +_drawChibiSlime(paletteKey)
    }

    class src_donation_constants_js {

    }

    class src_donation_queue_js {
        +initDonationQueue(context = {})
        +getDonationQueueLength()
        +isDonationProcessing()
        +clearDonationQueue()
        +enqueueDonation(item)
        +enqueueHighTierShowcase(item)
        +processNextDonation()
        +onTurnComplete()
        +startEffectsAndHold()
        +startEffectsAndHold()
        +_executeSmallEffects(mesh, origin, coins, shouldUpg...)
        +_executeMediumEffects(mesh, origin, coins, shouldUpg...)
    }

    class src_equipment_config_js {
        +loadThresholds()
        +saveThresholds(newThresholds)
        +resetThresholds()
        +evaluateEquipment(totalCoins = 0, thresholds = n...)
    }

    class src_floor_slots_js {
        +generateDanceFloorSlots(config = FLOOR_GRID_CONFIG)
        +findRandomAvailableFloorSlot(floorSlots, avatarMeshes)
    }

    class src_foreground_slime_js {
        +initForegroundSlimeStage()
        +spawnFgStardust(pos, count = 2, colorHex = 0xf...)
        +spawnFgSonicRing(pos, colorHex = 0xffd700)
        +create3DJetPlane()
        +create3DParachute()
        +createPantherFeatures(slime)
        +createTigerFeatures(slime)
        +createLionManeFeatures()
        +create3DCelestialWings()
        +createPegasusFeatures()
        +create3DUniverseMoons()
        +startForegroundSlime(donorAvatar, duration, giftKey...)
        +renderFg(currentTime)
        +stopForegroundSlime()
    }

    class src_gift_props_js {
        +normalizeVietnameseKey(str)
        +constructor(scene)
        +trigger(giftKey = 'rose', origin = new...)
        +_spawnJet(origin)
        +_spawnCyberPanther(origin)
        +addNeonMesh(geom, pos = 0, 0, 0, rot = 0, ...)
        +_spawnFireTiger(origin)
        +_spawnUniverse(origin)
        +_spawnPhoenix(origin)
        +_spawnGoldenLion(origin)
        +_spawnPegasus(origin)
        +_spawnDiscoBall(origin)
        +_spawnMoneyGun(origin)
        +_spawnRose(origin)
        +_spawnFingerHeart(origin)
    }

    class src_live_event_handler_js {
        +resolveGiftCategory(coins)
        +calculateSlimeTier(totalCoins, isTop1 = undefined...)
        +_handleChatCommands(comment, mesh, syncActiveFloor...)
        +_triggerUltraCelebration(mesh, origin, giftKey, coins, ...)
        +_triggerHighCelebration(mesh, origin, giftKey, coins, ...)
        +_triggerMediumCelebration(mesh, origin, giftKey, coins, ...)
        +_triggerSmallCelebration(mesh, origin, giftKey, coins, ...)
        +_scheduleDeferredVipSwap(mesh, giftCategory, sortedDono...)
        +handleLikeEvent(evt, context)
        +handleChatEvent(evt, context)
        +handleGiftEvent(evt, context)
        +handleAdminCommand(evt, context)
        +handleRoomRanksEvent(evt, context)
        +handleSessionResetEvent(evt, context)
        +handleMemberEvent(evt, context)
    }

    class src_main_constants_js {

    }

    class src_main_js {
        +initClientApp()
        +onThresholdsUpdated(newThresholds)
        +animate()
    }

    class src_preview_audio_js {
        +getPreviewAudioCtx()
        +playPreviewSfx(type)
    }

    class src_scene_manager_js {
        +getOrbitCameraPosition(theta, phi = 0.85, radius = OR...)
        +constructor(container)
        +init()
        +setCameraPreset(key, duration = null, customTa...)
        +setOrbitRadius(radius)
        +setFov(fov)
        +revertVipCamera()
        +toggleChromaKey()
        +toggleAlpha()
        +onResize()
        +triggerCameraShake(intensity = 0.35, duration = 1...)
        +startLionTracking(heroMesh, duration = 7.6)
        +update(deltaTime = 0.016, bassPunch =...)
        +getScreenCoords(worldPos)
        +focusSlimeCinematic(slimePos, onArrived = null, du...)
    }

    class src_slime_aura_js {
        +createBubbleSpriteTexture()
        +createSlimeAura()
        +setAura(type)
        +update(deltaTime)
        +currentType()
        +isVisible()
    }

    class src_slime_constants_js {

    }

    class src_slime_model_js {
        +createBasicHalfSphereGeometry()
        +createChubbyMochiSlimeGeometry()
        +getClonedSlimeMaterial(paletteKey)
        +sharedMiniSlimeGeom()
        +sharedHornGeom()
        +sharedTailSegmentGeom()
        +sharedTailTipGeom()
        +sharedSideMochiGeom()
        +createBillboardSprite(userData = {})
        +redraw(img = null)
        +drawBorderRing(radius, borderCfg)
        +createCyberSlime(paletteKey = 'cyan', rawUserDa...)
        +create3DEye(isLeft = true)
        +setLabelVisible(visible)
        +setBillboardScale(scale = 1.0)
    }

    class src_ui_overlay_js {
        +getGiftLogo(giftKeyOrName)
        +constructor(options = {})
        +initElements()
        +bindEvents()
        +unlockAudioHandler()
        +setDistHelper(val)
        +triggerLikeAction()
        +getTargetUser()
        +getCustomMockUser(spawnIdx = 0)
        +updateActiveAvatars(avatarList = )
        +bindMockButton(id, fn)
        +toggleAdminDrawer()
        +updateTikTokStatus(status)
        +loadInitialMaxHype()
        +setMaxHype(val)
    }

    class src_vip_lounge_manager_js {
        +triggerLeapAnimation(mesh, targetPos, targetRotY, o...)
        +updateLeapAnimation(mesh, delta)
        +constructor()
        +getCurrentTop1()
        +getCurrentTop2()
        +clear()
        +removeUser(userId)
        +_promoteToTop1(mesh, userId, userCoinsMap = n...)
        +_promoteToTop2(mesh, userId, userCoinsMap = n...)
        +_demoteDisplacedAvatar(mesh, prevUserId, returnSlot, ...)
        +executeVipPromotionAndSwap({ sortedDonors, avatarMeshes, ...)
    }

    class src_vip_podium_scheduler_js {
        +constructor({ duration = 15.0, podiumPos =...)
        +enqueue(user, mesh, tier, returnSlot)
        +promote(item)
        +update(delta, onPromote = null, onVac...)
    }

    class preview_avatar_ornaments_js {
        +renderAvatarOrnament(tierClass, coins, giftKey)
    }

    class preview_billboard_constants_js {

    }

    class preview_chibi_mascot_js {
        +startChibiSlimeMascot(canvas, slimeColorHex = '#00f2...)
        +render()
        +stopChibiSlimeMascot()
    }

    class preview_cinematic_particles_js {
        +startCinematicParticles(canvas, gift, duration)
        +renderFx()
        +stopCinematicParticles()
    }

    class preview_cinematic_showcase_js {
        +initCinematicShowcase(ctx = {})
        +getScreenCoords(worldPos)
        +generateSvgAvatar(name = 'Viewer')
        +enqueueHighTierShowcase(item)
        +processNextHighTier()
        +runCinematic2DShowcase(item, onFinished)
        +cleanupShowcase()
    }

    class preview_donation_constants_js {

    }

    class preview_foreground_slime_js {
        +initForegroundSlimeStage()
        +spawnFgStardust(pos, count = 2, colorHex = 0xf...)
        +spawnFgSonicRing(pos, colorHex = 0xffd700)
        +create3DJetPlane()
        +create3DParachute()
        +createPantherFeatures(slime)
        +createTigerFeatures(slime)
        +createLionManeFeatures()
        +create3DCelestialWings()
        +createPegasusFeatures()
        +create3DUniverseMoons()
        +startForegroundSlime(donorAvatar, duration, giftKey...)
        +renderFg(currentTime)
        +stopForegroundSlime()
    }

    class preview_gift_props_js {
        +normalizeVietnameseKey(str)
        +constructor(scene)
        +trigger(giftKey = 'rose', origin = new...)
        +_spawnJet(origin)
        +_spawnCyberPanther(origin)
        +addNeonMesh(geom, pos = 0, 0, 0, rot = 0, ...)
        +_spawnFireTiger(origin)
        +_spawnUniverse(origin)
        +_spawnPhoenix(origin)
        +_spawnGoldenLion(origin)
        +_spawnPegasus(origin)
        +_spawnDiscoBall(origin)
        +_spawnMoneyGun(origin)
        +_spawnRose(origin)
        +_spawnFingerHeart(origin)
    }

    class preview_preview_audio_js {
        +getPreviewAudioCtx()
        +playPreviewSfx(type)
    }

    class preview_slime_aura_js {
        +createBubbleSpriteTexture()
        +createSlimeAura()
        +setAura(type)
        +update(deltaTime)
        +currentType()
        +isVisible()
    }

    class preview_slime_constants_js {

    }

    class preview_slime_model_js {
        +createBasicHalfSphereGeometry()
        +createChubbyMochiSlimeGeometry()
        +getClonedSlimeMaterial(paletteKey)
        +sharedMiniSlimeGeom()
        +sharedHornGeom()
        +sharedTailSegmentGeom()
        +sharedTailTipGeom()
        +sharedSideMochiGeom()
        +createBillboardSprite(userData = {})
        +redraw(img = null)
        +drawBorderRing(radius, borderCfg)
        +createCyberSlime(paletteKey = 'cyan', rawUserDa...)
        +create3DEye(isLeft = true)
        +setLabelVisible(visible)
        +setBillboardScale(scale = 1.0)
    }

    class preview_slime_preview_js {
        +triggerWhiteLightBeam(targetX = 0, targetZ = 0, dura...)
        +triggerFireworks(originY = 4.2, originX = 0, or...)
        +getViewerProfile(idx)
        +createAvatarInstance(paletteKey, index = 0)
        +clearShowcaseLabels()
        +createTierLabelSprite(title, desc, colorHex)
        +showcaseAllTiers()
        +repositionGrid()
        +updateMetricHUD()
        +addAvatars(countToAdd)
        +removeAvatars(countToRemove)
        +setAvatarCount(targetCount)
        +triggerLionCelebrationEvent(targetAvatar = null, upgradeTi...)
        +togglePause()
        +setHeroLevel(levelNum)
    }

server_inspect_live_js --> server_event_normalizer_js : imports
server_mock_simulator_js --> server_event_normalizer_js : imports
server_server_js --> server_event_normalizer_js : imports
server_server_js --> server_rate_limiter_js : imports
server_server_js --> server_avatar_proxy_js : imports
server_server_js --> server_tiktok_service_js : imports
server_server_js --> server_mock_simulator_js : imports
src_avatar_coordinator_js --> src_floor_slots_js : imports
src_avatar_coordinator_js --> src_avatar_manager_js : imports
src_avatar_coordinator_js --> src_vip_lounge_manager_js : imports
src_avatar_coordinator_js --> src_cinematic_config_js : imports
src_avatar_coordinator_js --> src_equipment_config_js : imports
src_cinematic_showcase_js --> src_cinematic_particles_js : imports
src_cinematic_showcase_js --> src_foreground_slime_js : imports
src_cinematic_showcase_js --> src_chibi_mascot_js : imports
src_cinematic_showcase_js --> src_avatar_ornaments_js : imports
src_cinematic_showcase_js --> src_preview_audio_js : imports
src_club_environment_js --> src_gift_props_js : imports
src_club_environment_js --> src_cinematic_config_js : imports
src_donation_queue_js --> src_donation_constants_js : imports
src_donation_queue_js --> src_gift_props_js : imports
src_donation_queue_js --> src_animation_constants_js : imports
src_donation_queue_js --> src_cinematic_showcase_js : imports
src_floor_slots_js --> src_club_environment_js : imports
src_foreground_slime_js --> src_slime_model_js : imports
src_live_event_handler_js --> src_avatar_manager_js : imports
src_live_event_handler_js --> src_gift_props_js : imports
src_live_event_handler_js --> src_cinematic_showcase_js : imports
src_live_event_handler_js --> src_equipment_config_js : imports
src_live_event_handler_js --> src_animation_constants_js : imports
src_live_event_handler_js --> src_donation_queue_js : imports
src_live_event_handler_js --> src_donation_constants_js : imports
src_main_js --> src_scene_manager_js : imports
src_main_js --> src_club_environment_js : imports
src_main_js --> src_audio_system_js : imports
src_main_js --> src_avatar_manager_js : imports
src_main_js --> src_ui_overlay_js : imports
src_main_js --> src_equipment_config_js : imports
src_main_js --> src_floor_slots_js : imports
src_main_js --> src_vip_podium_scheduler_js : imports
src_main_js --> src_vip_lounge_manager_js : imports
src_main_js --> src_live_event_handler_js : imports
src_main_js --> src_cinematic_showcase_js : imports
src_main_js --> src_donation_queue_js : imports
src_scene_manager_js --> src_cinematic_config_js : imports
src_slime_model_js --> src_animation_constants_js : imports
src_slime_model_js --> src_slime_aura_js : imports
src_vip_lounge_manager_js --> src_floor_slots_js : imports
src_vip_lounge_manager_js --> src_equipment_config_js : imports
preview_cinematic_showcase_js --> src_cinematic_particles_js : imports
preview_cinematic_showcase_js --> src_foreground_slime_js : imports
preview_cinematic_showcase_js --> src_chibi_mascot_js : imports
preview_cinematic_showcase_js --> src_avatar_ornaments_js : imports
preview_cinematic_showcase_js --> src_preview_audio_js : imports
preview_foreground_slime_js --> src_slime_model_js : imports
preview_slime_model_js --> src_slime_aura_js : imports
preview_slime_preview_js --> src_gift_props_js : imports
preview_slime_preview_js --> src_preview_audio_js : imports
preview_slime_preview_js --> src_donation_constants_js : imports
```

## Function Details

### server/avatar-proxy.js
- [extractInitials(name = '')](file:///e:/game/bar_room/server/avatar-proxy.js#L24-L34): Extracts a 1-to-2 uppercase character monogram from a user name, returning "?" for empty or non-string inputs.
- [generateSvgAvatar(username = 'User', userId = '0')](file:///e:/game/bar_room/server/avatar-proxy.js#L39-L61): Generates a deterministic, gradient-filled circular SVG avatar containing the user's initials when their TikTok profile photo is missing or blocked.
- [fetchAvatarWithCache(targetUrl, username = 'Viewer', userId = '0')](file:///e:/game/bar_room/server/avatar-proxy.js#L66-L116): Fetches an avatar from TikTok CDN with a 5-second abort timeout and LRU caching, falling back to a generated SVG avatar on HTTP errors or network timeouts.
- [avatarProxyRouter(req, res, next)](file:///e:/game/bar_room/server/avatar-proxy.js#L121-L148): Express route handler serving avatar images with permissive CORS headers and a 24-hour cache-control header for browser WebGL textures.

### server/event-normalizer.js
- [parseColorCommand(comment)](file:///e:/game/bar_room/server/event-normalizer.js#L40-L65): Parses !color chat commands strictly supporting 3 canonical colors (green, red, blue) and aliases, returning isRandom flag for empty argument, and explicitly rejecting hex codes.
- [sanitizeComment(text)](file:///e:/game/bar_room/server/event-normalizer.js#L91-L94): Masks profane or sensitive words in chat messages by replacing matched characters with asterisks.
- [extractUser(raw)](file:///e:/game/bar_room/server/event-normalizer.js#L99-L193): Standardizes raw TikTok user attributes into a normalized identity object containing user ID, username, nickname, and avatar URL.
- [pickValid(...vals)](file:///e:/game/bar_room/server/event-normalizer.js#L109-L119): Executes pickValid operation within event-normalizer.js.
- [normalizeChat(raw)](file:///e:/game/bar_room/server/event-normalizer.js#L198-L209): Transforms raw chat payloads into normalized comment events, automatically extracting and attaching valid !color commands.
- [normalizeGift(raw)](file:///e:/game/bar_room/server/event-normalizer.js#L218-L247): Normalizes incoming gift payloads by calculating total coin value and categorizing gifts into one of 4 hierarchical tiers.
- [normalizeLike(raw)](file:///e:/game/bar_room/server/event-normalizer.js#L252-L259): Sanitizes like event counts and preserves cumulative total likes across the live session.
- [normalizeSocial(type, raw)](file:///e:/game/bar_room/server/event-normalizer.js#L264-L269): Normalizes social stream interactions such as follows, shares, and member joins.
- [normalizeTikTokEvent(type, raw = {})](file:///e:/game/bar_room/server/event-normalizer.js#L277-L277): Central dispatcher that converts any incoming raw TikTok event into a unified, timestamped event schema.

### server/inspect-live.js
- [formatTime()](file:///e:/game/bar_room/server/inspect-live.js#L52-L55): Executes formatTime operation within inspect-live.js.
- [logEvent(type, rawData)](file:///e:/game/bar_room/server/inspect-live.js#L57-L129): Executes logEvent operation within inspect-live.js.
- [start()](file:///e:/game/bar_room/server/inspect-live.js#L153-L168): Executes start operation within inspect-live.js.

### server/mock-simulator.js
- [createCustomMockUser(params = {})](file:///e:/game/bar_room/server/mock-simulator.js#L6-L6): Factory helper generating mock TikTok user profile payloads with customized attributes.
- [constructor(options = {})](file:///e:/game/bar_room/server/mock-simulator.js#L68-L68): Executes constructor operation within mock-simulator.js.
- [getRandomViewer()](file:///e:/game/bar_room/server/mock-simulator.js#L74-L76): Selects and returns a randomized mock viewer profile from the default mock viewer pool.
- [simulateLikes(count = 10, user = null)](file:///e:/game/bar_room/server/mock-simulator.js#L78-L87): Generates and emits a synthetic like event for testing without an active stream.
- [simulateChat(customText = null, user = null)](file:///e:/game/bar_room/server/mock-simulator.js#L89-L98): Generates and emits a synthetic chat event with predefined or custom text.
- [simulateGift(tier = 1, customGiftName = null, customCoins = null, user = null, customGiftKey = null, forceTierUp = undefined)](file:///e:/game/bar_room/server/mock-simulator.js#L100-L120): Generates and emits a synthetic gift event matching a specified gift tier.
- [simulateSpawn(user = null)](file:///e:/game/bar_room/server/mock-simulator.js#L122-L134): Simulates viewer entrance/spawn events with canonical color directives into the 3D room.
- [startAutoSimulation(intervalMs = 1500)](file:///e:/game/bar_room/server/mock-simulator.js#L136-L151): Starts an automated periodic timer randomly generating likes, chats, and tiered gifts.
- [stopAutoSimulation()](file:///e:/game/bar_room/server/mock-simulator.js#L153-L159): Clears the periodic simulation timer and halts automatic event generation.

### server/rate-limiter.js
- [constructor(options = {})](file:///e:/game/bar_room/server/rate-limiter.js#L4-L4): Executes constructor operation within rate-limiter.js.
- [enqueue(event)](file:///e:/game/bar_room/server/rate-limiter.js#L32-L65): Enqueues incoming live events, immediately bypassing Tier 2-4 VIP gifts and aggregating likes into sliding-window combos.
- [flushCombo()](file:///e:/game/bar_room/server/rate-limiter.js#L70-L97): Packages accumulated like combos into a single batched event and pushes it to the dispatch queue.
- [drainQueue()](file:///e:/game/bar_room/server/rate-limiter.js#L102-L108): Immediately flushes pending combos and drains all queued events through the dispatch callback.
- [getQueueSize()](file:///e:/game/bar_room/server/rate-limiter.js#L113-L115): Returns the current number of pending events held in the rate limiter queue.
- [reset()](file:///e:/game/bar_room/server/rate-limiter.js#L120-L132): Clears all pending events, resets the like combo accumulator, and halts running timers.

### server/server.js
- [broadcast(payload)](file:///e:/game/bar_room/server/server.js#L58-L65): Serializes and broadcasts JSON message payloads to all currently connected WebSocket clients.

### server/tiktok-service.js
- [constructor()](file:///e:/game/bar_room/server/tiktok-service.js#L8-L19): Executes constructor operation within tiktok-service.js.
- [connect(username)](file:///e:/game/bar_room/server/tiktok-service.js#L25-L60): Establishes a real-time scraping connection to a TikTok LIVE room by username with automatic event binding.
- [_bindEvents()](file:///e:/game/bar_room/server/tiktok-service.js#L65-L110): Attaches internal event listeners for TikTok chat, gift, like, social, room user counts, and disconnects.
- [_scheduleReconnect()](file:///e:/game/bar_room/server/tiktok-service.js#L115-L127): Schedules an automatic reconnection attempt using exponential backoff when a stream drops unexpectedly.
- [disconnect()](file:///e:/game/bar_room/server/tiktok-service.js#L132-L146): Manually terminates the active TikTok webcast connection and cancels pending reconnect timers.
- [getStatus()](file:///e:/game/bar_room/server/tiktok-service.js#L151-L158): Returns the current live connection status, room ID, viewer count, and connected username.

### src/audio-system.js
- [split3BandFrequency(spectrum, sampleRate = 44100, fftSize = 512)](file:///e:/game/bar_room/src/audio-system.js#L10-L50): Slices an FFT byte frequency spectrum into isolated Bass (0-150Hz), Mids (150-1000Hz), and Treble (>1000Hz) energy values.
- [calculateAudioFlux(current, avg, smoothing = 0.85)](file:///e:/game/bar_room/src/audio-system.js#L55-L59): Computes smoothed running average energy and instantaneous positive onset flux for beat detection.
- [synthesizeSfxParams(name)](file:///e:/game/bar_room/src/audio-system.js#L138-L150): Provides procedural frequency, gain, and timing parameters for zero-asset sound synthesis.
- [getBeatStepEvents(step)](file:///e:/game/bar_room/src/audio-system.js#L182-L195): Maps a 16-step sequencer index to discrete Kick (four-on-the-floor), Snare (backbeat), and Hi-Hat triggers.
- [constructor(audioCtx = null, destinationNode = null)](file:///e:/game/bar_room/src/audio-system.js#L202-L210): Executes constructor operation within audio-system.js.
- [start(audioCtx = this.ctx, destinationNode = this.destination)](file:///e:/game/bar_room/src/audio-system.js#L212-L231): Starts the 16-step 128 BPM loop timer and connects procedural drum voices to the audio destination.
- [_playStep(step)](file:///e:/game/bar_room/src/audio-system.js#L233-L307): Synthesizes swept-sine kicks, bandpass filtered snare noise, and highpass hi-hat ticks for the current sequencer step.
- [stop()](file:///e:/game/bar_room/src/audio-system.js#L309-L315): Halts the procedural drum loop and clears active step timers.
- [setVolume(v)](file:///e:/game/bar_room/src/audio-system.js#L317-L322): Adjusts the master gain volume level of the procedural beat engine or sound effects.
- [unlockAudio(instance = null)](file:///e:/game/bar_room/src/audio-system.js#L328-L333): Resumes the browser AudioContext from suspended state upon user interaction and starts the beat synthesizer.
- [constructor()](file:///e:/game/bar_room/src/audio-system.js#L339-L349): Executes constructor operation within audio-system.js.
- [init()](file:///e:/game/bar_room/src/audio-system.js#L351-L368): Initializes Web Audio context, master gain node, and 3-band FFT analyser node upon first audio unlock.
- [unlockAudio()](file:///e:/game/bar_room/src/audio-system.js#L370-L379): Resumes the browser AudioContext from suspended state upon user interaction and starts the beat synthesizer.
- [getBands()](file:///e:/game/bar_room/src/audio-system.js#L381-L406): Reads current frequency data from the AnalyserNode and returns normalized energy and flux across 3 audio bands.
- [playSfx(name)](file:///e:/game/bar_room/src/audio-system.js#L408-L471): Procedurally synthesizes sound effects (coin clink, air horn, bass boom) with exponential clickless decay envelopes.
- [setVolume(val)](file:///e:/game/bar_room/src/audio-system.js#L473-L480): Adjusts the master gain volume level of the procedural beat engine or sound effects.
- [toggleMute()](file:///e:/game/bar_room/src/audio-system.js#L482-L488): Toggles audio master gain between muted and unmuted states.

### src/avatar-coordinator.js
- [getOrCreateAvatarMesh(userData, coins = 0, context)](file:///e:/game/bar_room/src/avatar-coordinator.js#L17-L101): Instantiates or retrieves a 3D Slime avatar mesh on dance floor or VIP platforms.
- [sinkAndRemoveAvatar(userId, context)](file:///e:/game/bar_room/src/avatar-coordinator.js#L106-L117): Executes sinkAndRemoveAvatar operation within avatar-coordinator.js.
- [deleteAvatar(userId, context)](file:///e:/game/bar_room/src/avatar-coordinator.js#L122-L163): Manually removes an avatar from the scene, tracking registry, and leaderboard, re-evaluating VIP assignments.
- [clearAllAvatars(context)](file:///e:/game/bar_room/src/avatar-coordinator.js#L168-L204): Disposes and removes all avatars from the 3D scene and resets the leaderboard.
- [syncActiveFloorAvatars(avatarMeshes, uiOverlay, ws)](file:///e:/game/bar_room/src/avatar-coordinator.js#L209-L228): Synchronizes active 3D avatar states with UI Overlay and WebSocket stream panels.
- [_updateCyberSlime(mesh, data, delta, bands)](file:///e:/game/bar_room/src/avatar-coordinator.js#L234-L247): Updates procedural squash, stretch, and AI dance moves on modern CyberSlime controller.
- [_updateProceduralSlime(mesh, data, phase, isBouncing, time, delta)](file:///e:/game/bar_room/src/avatar-coordinator.js#L252-L289): Applies volume-preserving squash-stretch kinematics and eye blinks to procedural slime mesh.
- [_updateHumanoid(data, style, phase)](file:///e:/game/bar_room/src/avatar-coordinator.js#L294-L313): Applies procedural humanoid dance kinematics to limb and torso bones.
- [updateAvatarKinematics(mesh, delta, time, bpmSpeed, frenzyMultiplier, bands, camera, isFrenzy = false)](file:///e:/game/bar_room/src/avatar-coordinator.js#L318-L350): Coordinates per-frame animation, leap physics, smooth scaling, and camera-facing billboards for an avatar.

### src/avatar-manager.js
- [parseColorCommand(comment)](file:///e:/game/bar_room/src/avatar-manager.js#L40-L65): Parses !color chat commands strictly supporting 3 canonical colors (green, red, blue) and aliases, returning isRandom flag for empty argument.
- [getSlimeKinematics(bpmPhase, isBouncing = false)](file:///e:/game/bar_room/src/avatar-manager.js#L87-L107): Calculates volume-preserving mathematical Squash & Stretch scale factors and vertical bounce jump displacement synchronized with music BPM.
- [getDanceKinematics(style, phase)](file:///e:/game/bar_room/src/avatar-manager.js#L112-L185): Computes procedurally animated limb and torso rotation offsets for humanoid and procedural dance styles.
- [constructor(options = {})](file:///e:/game/bar_room/src/avatar-manager.js#L191-L191): Executes constructor operation within avatar-manager.js.
- [touch(userId, username, coins = 0, isPinned = null)](file:///e:/game/bar_room/src/avatar-manager.js#L198-L245): Registers or touches a viewer's activity timestamp, accumulates coins, updates VIP tiers, and evicts idle avatars over capacity.
- [cullIdle(now = Date.now())](file:///e:/game/bar_room/src/avatar-manager.js#L247-L263): Executes cullIdle operation within avatar-manager.js.
- [getAvatarMesh(userId)](file:///e:/game/bar_room/src/avatar-manager.js#L271-L273): Executes getAvatarMesh operation within avatar-manager.js.
- [removeAvatar(userId)](file:///e:/game/bar_room/src/avatar-manager.js#L275-L284): Removes an avatar by userId from tracking registry and frees occupancy slot.
- [clearAll()](file:///e:/game/bar_room/src/avatar-manager.js#L286-L291): Clears all registered avatars from tracking manager.
- [disposeAvatar(avatar)](file:///e:/game/bar_room/src/avatar-manager.js#L293-L303): Safely unmounts an avatar from the 3D scene and disposes of all mesh materials, geometries, and canvas textures to prevent VRAM leaks.
- [createSlimeGeometry()](file:///e:/game/bar_room/src/avatar-manager.js#L309-L320): Creates a smooth sphere geometry with a flattened bottom vertex profile to sit naturally on the dance floor.
- [createSlimeFaceTexture(isSmiling = true)](file:///e:/game/bar_room/src/avatar-manager.js#L325-L360): Generates a procedural 2D canvas face texture featuring glossy eyes and a smile without rosy cheeks.
- [createAvatarMesh(userData, forcedColor = null)](file:///e:/game/bar_room/src/avatar-manager.js#L365-L402): Builds a complete 3D Slime mesh hierarchy with translucent jelly material, blinking eyes, VIP accessories, and overhead billboard.
- [applyWhaleSlimeAesthetics(group, tier = 3)](file:///e:/game/bar_room/src/avatar-manager.js#L407-L435): Applies whale VIP aura, crown, and accessory adornments while strictly preserving original avatar body color and palette.
- [setSlimeColor(slimeGroup, colorKey)](file:///e:/game/bar_room/src/avatar-manager.js#L440-L456): Updates the material color and emissive glow of an existing 3D Slime to a chosen canonical color.
- [createBillboardSprite(userData)](file:///e:/game/bar_room/src/avatar-manager.js#L461-L463): Creates a 3D billboard sprite displaying the user's TikTok avatar, nickname, and VIP rank badge above their Slime.

### src/avatar-ornaments.js
- [renderAvatarOrnament(tierClass, coins, giftKey)](file:///e:/game/bar_room/src/avatar-ornaments.js#L2-L621): Generates and mounts milestone-specific procedural vector SVG frames (wreaths, angel wings, cosmic rings, crowns) around the donor avatar.

### src/chibi-mascot.js
- [startChibiSlimeMascot(canvas, slimeColorHex = '#00f2fe')](file:///e:/game/bar_room/src/chibi-mascot.js#L5-L81): Starts animated 2D canvas teardrop chibi slime mascot bouncing in the corner of the avatar frame.
- [render()](file:///e:/game/bar_room/src/chibi-mascot.js#L12-L77): Internal 2D animation loop rendering halo, teardrop body gradient, blush cheeks, and waving hands.
- [stopChibiSlimeMascot()](file:///e:/game/bar_room/src/chibi-mascot.js#L83-L88): Cancels the chibi animation frame and clears mascot canvas resources.

### src/cinematic-particles.js
- [startCinematicParticles(canvas, gift, duration)](file:///e:/game/bar_room/src/cinematic-particles.js#L3-L1641): Initiates fullscreen 2D canvas particle physics routines differentiated by donation tier (money rain, concert lasers, swan feathers, galaxy vortex, diamond shards, phoenix fire, etc.).
- [renderFx()](file:///e:/game/bar_room/src/cinematic-particles.js#L368-L1637): Internal canvas frame render loop updating particle positions, velocities, rotations, alpha decay, and physics collisions.
- [stopCinematicParticles()](file:///e:/game/bar_room/src/cinematic-particles.js#L1643-L1653): Cancels the canvas animation frame and clears the particle canvas context.

### src/cinematic-showcase.js
- [initCinematicShowcase(ctx = {})](file:///e:/game/bar_room/src/cinematic-showcase.js#L19-L19): Injects preview studio context (camera, activeAvatars, clearFloorEffects callback) into the showcase controller.
- [getScreenCoords(worldPos)](file:///e:/game/bar_room/src/cinematic-showcase.js#L23-L36): Projects 3D world coordinates onto 2D screen pixel coordinates for target-guided stage shrink animations.
- [generateSvgAvatar(name = 'Viewer')](file:///e:/game/bar_room/src/cinematic-showcase.js#L38-L59): Generates a fallback data-URI SVG circular monogram avatar with user initials.
- [enqueueHighTierShowcase(item)](file:///e:/game/bar_room/src/cinematic-showcase.js#L61-L66): Appends high-tier and ultra donations to the sequential FIFO showcase queue, starting playback if idle.
- [processNextHighTier()](file:///e:/game/bar_room/src/cinematic-showcase.js#L68-L99): Dequeues and triggers the next cinematic showcase in sequence, maintaining queue state.
- [runCinematic2DShowcase(item, onFinished)](file:///e:/game/bar_room/src/cinematic-showcase.js#L101-L379): Orchestrates the fullscreen cinematic overlay, backdrop blur, SVG ornaments, 2D particles, foreground 3D mascot, chibi badge, and safe termination.
- [cleanupShowcase()](file:///e:/game/bar_room/src/cinematic-showcase.js#L302-L351): Safely closes the cinematic overlay, unpauses background avatars, disposes active foreground props, and invokes completion callbacks.

### src/club-constants.js
- [count()](file:///e:/game/bar_room/src/club-constants.js#L33-L33): Executes count operation within club-constants.js.
- [clampSpotlightToFloor(target = { x: 0, y: 0, z: 0 })](file:///e:/game/bar_room/src/club-constants.js#L148-L148): Clamps moving spotlight target positions strictly within club dance floor boundaries.

### src/club-environment.js
- [createHeartBubbleTexture()](file:///e:/game/bar_room/src/club-environment.js#L55-L111): Executes createHeartBubbleTexture operation within club-environment.js.
- [constructor(scene)](file:///e:/game/bar_room/src/club-environment.js#L114-L157): Executes constructor operation within club-environment.js.
- [init()](file:///e:/game/bar_room/src/club-environment.js#L159-L174): Coordinates setup of ambient lights, moving heads, lasers, VIP podium, DJ booth, and particle systems.
- [getSlimeMetrics(target)](file:///e:/game/bar_room/src/club-environment.js#L181-L217): Computes vertical apex, bounding radius, height, and root origin for dynamic relative cinematic animations.
- [getSlimeEffectiveRadius(targetAvatarOrOrigin)](file:///e:/game/bar_room/src/club-environment.js#L224-L235): Calculates boundary radius of slime avatar to avoid mesh clipping when spawning coin orbits.
- [createStarfield()](file:///e:/game/bar_room/src/club-environment.js#L240-L291): Generates a 3,000-star twinkling midnight sky background using Three.js Points.
- [createAccentLights()](file:///e:/game/bar_room/src/club-environment.js#L296-L328): Adds overhead spotlights for the DJ console and warm amber point lights for the bar lounge.
- [createLedFloor()](file:///e:/game/bar_room/src/club-environment.js#L334-L426): Constructs a 12x12 LED purple dance floor matrix with glowing white border frames in a single draw call using Three.js InstancedMesh.
- [getTileIndexAtPosition(pos)](file:///e:/game/bar_room/src/club-environment.js#L431-L443): Executes getTileIndexAtPosition operation within club-environment.js.
- [setSlotFloorColor(slotPos, targetColor = 'default')](file:///e:/game/bar_room/src/club-environment.js#L452-L454): Executes setSlotFloorColor operation within club-environment.js.
- [clearSlotFloorColors()](file:///e:/game/bar_room/src/club-environment.js#L456-L458): Executes clearSlotFloorColors operation within club-environment.js.
- [createVipPodium()](file:///e:/game/bar_room/src/club-environment.js#L470-L670): Builds an elevated circular VIP podium featuring a gold metallic rim and glowing neon glass stage top.
- [createDjBooth()](file:///e:/game/bar_room/src/club-environment.js#L676-L872): Assembles the DJ table with spinning vinyl records, Pioneer-style mixer, and animated pink female chubby slime DJ mascot.
- [createWallsAndNeon()](file:///e:/game/bar_room/src/club-environment.js#L877-L901): Constructs club boundary walls, bar counters, and emissive neon club signage.
- [createMovingHeads()](file:///e:/game/bar_room/src/club-environment.js#L906-L961): Builds 4 dual-axis moving head spotlights that sweep light cones across the venue.
- [createLightBeams()](file:///e:/game/bar_room/src/club-environment.js#L968-L1003): Initializes overhead cylindrical geometry and additive materials for high-tier white and ultra golden light beams.
- [triggerWhiteLightBeam(targetX = 0, targetZ = 0, duration = 2.5)](file:///e:/game/bar_room/src/club-environment.js#L1005-L1014): Activates overhead white spotlight beam effect for high-tier donations (500–5000 coins).
- [triggerGoldenLightBeam(targetX = 0, targetZ = 0, duration = 7.6)](file:///e:/game/bar_room/src/club-environment.js#L1016-L1025): Activates wide golden pillar of light beam for ultra luxury donations (>= 6000 coins).
- [focusSpotlights(categoryOrTier = 1, targetPosition = null, duration = null, avatarManager = null, userId = null)](file:///e:/game/bar_room/src/club-environment.js#L1034-L1101): Dynamically focuses venue spotlights onto donating VIP avatars based on donation tier (1, 2, 6, or 8 spotlights).
- [createLaserBeams()](file:///e:/game/bar_room/src/club-environment.js#L1106-L1124): Creates 6 additive-blended laser beam geometry cones fanning out from the ceiling rig.
- [createFireworksSystem()](file:///e:/game/bar_room/src/club-environment.js#L1129-L1164): Initializes a 6,000-particle single-buffer Points system for multi-tier fireworks bursts.
- [createFlyingHeartsSystem()](file:///e:/game/bar_room/src/club-environment.js#L1169-L1191): Initializes a single-buffer particle system for floating 3D hearts triggered by viewer likes.
- [triggerFireworks(tier = 1, origin = new THREE.Vector3(0, 1.2, 0))](file:///e:/game/bar_room/src/club-environment.js#L1193-L1234): Executes triggerFireworks operation within club-environment.js.
- [emitFlyingHearts(count = 10)](file:///e:/game/bar_room/src/club-environment.js#L1236-L1259): Spawns floating hearts that rise from the floor and sway upward upon viewer likes.
- [spawnHeartBubbles(origin = new THREE.Vector3(0, 0, 0), count = 4)](file:///e:/game/bar_room/src/club-environment.js#L1265-L1303): Executes spawnHeartBubbles operation within club-environment.js.
- [createDroppingCoinsSystem()](file:///e:/game/bar_room/src/club-environment.js#L1308-L1353): Executes createDroppingCoinsSystem operation within club-environment.js.
- [spawnSingleCoinInstance(origin, cfg = {})](file:///e:/game/bar_room/src/club-environment.js#L1358-L1358): Spawns a single 3D falling gold coin with randomized angular velocity and relative drop height.
- [spawnDroppingCoins(origin = new THREE.Vector3(0, 0, 0), count = 1, subType = 'drop_single', targetAvatar = null)](file:///e:/game/bar_room/src/club-environment.js#L1394-L1439): Spawns physics-based instanced 3D coins cascading and bouncing across the dance floor.
- [spawnOrbitingCoinRings(targetAvatarOrOrigin = new THREE.Vector3(0, 0, 0), coins = 20, duration = 2.0)](file:///e:/game/bar_room/src/club-environment.js#L1446-L1553): Spawns multi-level golden coin rings orbiting dynamically around the celebrating slime.
- [createShockwaveSystem()](file:///e:/game/bar_room/src/club-environment.js#L1558-L1560): Executes createShockwaveSystem operation within club-environment.js.
- [triggerShockwave(origin = new THREE.Vector3(0, 0, 0), category = 'high')](file:///e:/game/bar_room/src/club-environment.js#L1562-L1604): Spawns expanding circular shockwave ring on the dance floor.
- [createMythicCrownSystem()](file:///e:/game/bar_room/src/club-environment.js#L1609-L1662): Executes createMythicCrownSystem operation within club-environment.js.
- [triggerMythicCrown(origin = new THREE.Vector3(0, 0, 0), duration = 7.6)](file:///e:/game/bar_room/src/club-environment.js#L1664-L1673): Executes triggerMythicCrown operation within club-environment.js.
- [triggerGiftProp(giftKey, origin = new THREE.Vector3(0, 0, 0), coins = 1)](file:///e:/game/bar_room/src/club-environment.js#L1679-L1684): Executes triggerGiftProp operation within club-environment.js.
- [update(delta, bands = {}, camera = null)](file:///e:/game/bar_room/src/club-environment.js#L1686-L1686): Updates vinyl rotation, DJ mascot bobbing, moving head sweeps, laser strobes, floor tile colors, and particle physics each frame.

### src/donate-overlay.js
- [resolveFxConfig(coins)](file:///e:/game/bar_room/src/donate-overlay.js#L30-L35): Executes resolveFxConfig operation within donate-overlay.js.
- [constructor({ container, sceneManager, audioSystem, avatarManager = null })](file:///e:/game/bar_room/src/donate-overlay.js#L52-L52): Executes constructor operation within donate-overlay.js.
- [_buildDOM()](file:///e:/game/bar_room/src/donate-overlay.js#L69-L179): Executes _buildDOM operation within donate-overlay.js.
- [_resizeCanvas()](file:///e:/game/bar_room/src/donate-overlay.js#L181-L186): Executes _resizeCanvas operation within donate-overlay.js.
- [trigger({ coins, user, giftName = '', donorMeshPos = null, slimePaletteKey = 'cyan' })](file:///e:/game/bar_room/src/donate-overlay.js#L199-L199): Executes trigger operation within donate-overlay.js.
- [_playSmallFx(cfg, coins, meshPos)](file:///e:/game/bar_room/src/donate-overlay.js#L224-L248): Executes _playSmallFx operation within donate-overlay.js.
- [tick(now)](file:///e:/game/bar_room/src/donate-overlay.js#L233-L246): Executes tick operation within donate-overlay.js.
- [_drainVipQueue()](file:///e:/game/bar_room/src/donate-overlay.js#L252-L260): Executes _drainVipQueue operation within donate-overlay.js.
- [_playVipFx({ coins, user, giftName, donorMeshPos, slimePaletteKey, cfg }, onComplete)](file:///e:/game/bar_room/src/donate-overlay.js#L264-L264): Executes _playVipFx operation within donate-overlay.js.
- [tick(now)](file:///e:/game/bar_room/src/donate-overlay.js#L304-L320): Executes tick operation within donate-overlay.js.
- [_beginFlyBack(donorMeshPos, totalDuration, onComplete)](file:///e:/game/bar_room/src/donate-overlay.js#L326-L362): Executes _beginFlyBack operation within donate-overlay.js.
- [_setupStage(user, giftName, coins, subType, slimePaletteKey)](file:///e:/game/bar_room/src/donate-overlay.js#L366-L397): Executes _setupStage operation within donate-overlay.js.
- [_calcAvatarSize(coins)](file:///e:/game/bar_room/src/donate-overlay.js#L399-L404): Executes _calcAvatarSize operation within donate-overlay.js.
- [_applyFallbackAvatar()](file:///e:/game/bar_room/src/donate-overlay.js#L406-L420): Executes _applyFallbackAvatar operation within donate-overlay.js.
- [_drawChibiSlime(paletteKey)](file:///e:/game/bar_room/src/donate-overlay.js#L424-L483): Executes _drawChibiSlime operation within donate-overlay.js.
- [_getRimStyle(subType)](file:///e:/game/bar_room/src/donate-overlay.js#L487-L495): Executes _getRimStyle operation within donate-overlay.js.
- [_drawRim(angle, rimStyle, avatarSize, subType)](file:///e:/game/bar_room/src/donate-overlay.js#L497-L528): Executes _drawRim operation within donate-overlay.js.
- [_spawnCoinParticles(subType, coins, meshPos)](file:///e:/game/bar_room/src/donate-overlay.js#L532-L576): Executes _spawnCoinParticles operation within donate-overlay.js.
- [_spawnVipParticles(subType, coins)](file:///e:/game/bar_room/src/donate-overlay.js#L578-L632): Executes _spawnVipParticles operation within donate-overlay.js.
- [_updateAndDrawParticles(particles, elapsed, pct)](file:///e:/game/bar_room/src/donate-overlay.js#L634-L691): Executes _updateAndDrawParticles operation within donate-overlay.js.
- [dispose()](file:///e:/game/bar_room/src/donate-overlay.js#L695-L699): Executes dispose operation within donate-overlay.js.

### src/donation-queue.js
- [initDonationQueue(context = {})](file:///e:/game/bar_room/src/donation-queue.js#L17-L17): Executes initDonationQueue operation within donation-queue.js.
- [getDonationQueueLength()](file:///e:/game/bar_room/src/donation-queue.js#L24-L26): Executes getDonationQueueLength operation within donation-queue.js.
- [isDonationProcessing()](file:///e:/game/bar_room/src/donation-queue.js#L31-L33): Executes isDonationProcessing operation within donation-queue.js.
- [clearDonationQueue()](file:///e:/game/bar_room/src/donation-queue.js#L38-L46): Executes clearDonationQueue operation within donation-queue.js.
- [enqueueDonation(item)](file:///e:/game/bar_room/src/donation-queue.js#L53-L61): Executes enqueueDonation operation within donation-queue.js.
- [enqueueHighTierShowcase(item)](file:///e:/game/bar_room/src/donation-queue.js#L66-L76): Executes enqueueHighTierShowcase operation within donation-queue.js.
- [processNextDonation()](file:///e:/game/bar_room/src/donation-queue.js#L81-L219): Executes processNextDonation operation within donation-queue.js.
- [onTurnComplete()](file:///e:/game/bar_room/src/donation-queue.js#L116-L120): Executes onTurnComplete operation within donation-queue.js.
- [startEffectsAndHold()](file:///e:/game/bar_room/src/donation-queue.js#L128-L133): Executes startEffectsAndHold operation within donation-queue.js.
- [startEffectsAndHold()](file:///e:/game/bar_room/src/donation-queue.js#L150-L155): Executes startEffectsAndHold operation within donation-queue.js.
- [_executeSmallEffects(mesh, origin, coins, shouldUpgradeTier, newTier, context)](file:///e:/game/bar_room/src/donation-queue.js#L225-L260): Executes _executeSmallEffects operation within donation-queue.js.
- [_executeMediumEffects(mesh, origin, coins, shouldUpgradeTier, newTier, context)](file:///e:/game/bar_room/src/donation-queue.js#L266-L301): Executes _executeMediumEffects operation within donation-queue.js.

### src/equipment-config.js
- [loadThresholds()](file:///e:/game/bar_room/src/equipment-config.js#L21-L37): Executes loadThresholds operation within equipment-config.js.
- [saveThresholds(newThresholds)](file:///e:/game/bar_room/src/equipment-config.js#L42-L53): Executes saveThresholds operation within equipment-config.js.
- [resetThresholds()](file:///e:/game/bar_room/src/equipment-config.js#L58-L66): Executes resetThresholds operation within equipment-config.js.
- [evaluateEquipment(totalCoins = 0, thresholds = null, isTop1 = undefined)](file:///e:/game/bar_room/src/equipment-config.js#L75-L127): Executes evaluateEquipment operation within equipment-config.js.

### src/floor-slots.js
- [generateDanceFloorSlots(config = FLOOR_GRID_CONFIG)](file:///e:/game/bar_room/src/floor-slots.js#L26-L69): Generates concentric 360-degree radial dance floor grid slots expanding outward from center stage while preventing wall collisions.
- [findRandomAvailableFloorSlot(floorSlots, avatarMeshes)](file:///e:/game/bar_room/src/floor-slots.js#L78-L100): Allocates a random unoccupied dance floor slot from the available pool for organic slime distribution.

### src/foreground-slime.js
- [initForegroundSlimeStage()](file:///e:/game/bar_room/src/foreground-slime.js#L26-L74): Creates and configures dedicated Three.js WebGL renderer, scene, 3-point studio lighting, and perspective camera for foreground 3D mascots.
- [spawnFgStardust(pos, count = 2, colorHex = 0xffe066, scaleMul = 1.0)](file:///e:/game/bar_room/src/foreground-slime.js#L78-L101): Spawns glowing stardust particles trailing behind flying 3D mascots.
- [spawnFgSonicRing(pos, colorHex = 0xffd700)](file:///e:/game/bar_room/src/foreground-slime.js#L103-L120): Spawns expanding 3D torus shockwave rings during supersonic bursts and sonic booms.
- [create3DJetPlane()](file:///e:/game/bar_room/src/foreground-slime.js#L125-L232): Builds stylized low-poly 3D supersonic fighter jet model with wings, tailfin, cockpit canopy, and dual neon thruster plumes.
- [create3DParachute()](file:///e:/game/bar_room/src/foreground-slime.js#L234-L267): Constructs 3D hexagonal ribbed parachute dome with dual suspension cord lines.
- [createPantherFeatures(slime)](file:///e:/game/bar_room/src/foreground-slime.js#L269-L312): Builds predator 3D obsidian panther features including slanted eye rims, dual downward fangs, and 6 neon violet whiskers.
- [createTigerFeatures(slime)](file:///e:/game/bar_room/src/foreground-slime.js#L314-L387): Builds ferocious 3D fire tiger facial features including 2 chubby mochi cheek pads, dual tiger fangs, 6 fiery whiskers, and forehead fire stripes.
- [createLionManeFeatures()](file:///e:/game/bar_room/src/foreground-slime.js#L389-L449): Assembles majestic 16-puff amber mane ring and 5-spike 24K gold crown for royal coronation sequences.
- [create3DCelestialWings()](file:///e:/game/bar_room/src/foreground-slime.js#L451-L485): Builds dual articulated 3D celestial feathered wings with metallic gold and glowing cyan gradient materials.
- [createPegasusFeatures()](file:///e:/game/bar_room/src/foreground-slime.js#L487-L530): Builds elegant Pegasus features including forward-tilted alicorn horn, pointed horse ears, and dual celestial wings.
- [create3DUniverseMoons()](file:///e:/game/bar_room/src/foreground-slime.js#L532-L554): Builds 4 orbiting planetary sphere meshes with glowing orbital rings encircling the cosmic avatar.
- [startForegroundSlime(donorAvatar, duration, giftKey = 'money_gun')](file:///e:/game/bar_room/src/foreground-slime.js#L556-L1533): Instantiates and coordinates front-angle 3D mascot flight timelines, choreographies, and props according to ultra donation persona.
- [renderFg(currentTime)](file:///e:/game/bar_room/src/foreground-slime.js#L660-L1529): Per-frame animation loop driving mascot positional lerps, tumbling flips, camera tracking, and trailing stardust.
- [stopForegroundSlime()](file:///e:/game/bar_room/src/foreground-slime.js#L1535-L1583): Disposes active foreground 3D mascot meshes, clears stardust particles, restores camera position, and halts the render loop.

### src/gift-props.js
- [normalizeVietnameseKey(str)](file:///e:/game/bar_room/src/gift-props.js#L49-L59): Executes normalizeVietnameseKey operation within gift-props.js.
- [constructor(scene)](file:///e:/game/bar_room/src/gift-props.js#L62-L65): Executes constructor operation within gift-props.js.
- [trigger(giftKey = 'rose', origin = new THREE.Vector3(0, 0, 0), coins = 1)](file:///e:/game/bar_room/src/gift-props.js#L71-L174): Executes trigger operation within gift-props.js.
- [_spawnJet(origin)](file:///e:/game/bar_room/src/gift-props.js#L179-L308): Executes _spawnJet operation within gift-props.js.
- [_spawnCyberPanther(origin)](file:///e:/game/bar_room/src/gift-props.js#L313-L417): Executes _spawnCyberPanther operation within gift-props.js.
- [addNeonMesh(geom, pos = [0, 0, 0], rot = [0, 0, 0])](file:///e:/game/bar_room/src/gift-props.js#L333-L341): Executes addNeonMesh operation within gift-props.js.
- [_spawnFireTiger(origin)](file:///e:/game/bar_room/src/gift-props.js#L422-L424): Executes _spawnFireTiger operation within gift-props.js.
- [_spawnUniverse(origin)](file:///e:/game/bar_room/src/gift-props.js#L429-L545): Executes _spawnUniverse operation within gift-props.js.
- [_spawnPhoenix(origin)](file:///e:/game/bar_room/src/gift-props.js#L550-L603): Executes _spawnPhoenix operation within gift-props.js.
- [_spawnGoldenLion(origin)](file:///e:/game/bar_room/src/gift-props.js#L608-L661): Executes _spawnGoldenLion operation within gift-props.js.
- [_spawnPegasus(origin)](file:///e:/game/bar_room/src/gift-props.js#L666-L706): Executes _spawnPegasus operation within gift-props.js.
- [_spawnDiscoBall(origin)](file:///e:/game/bar_room/src/gift-props.js#L711-L767): Executes _spawnDiscoBall operation within gift-props.js.
- [_spawnMoneyGun(origin)](file:///e:/game/bar_room/src/gift-props.js#L772-L832): Executes _spawnMoneyGun operation within gift-props.js.
- [_spawnRose(origin)](file:///e:/game/bar_room/src/gift-props.js#L837-L878): Executes _spawnRose operation within gift-props.js.
- [_spawnFingerHeart(origin)](file:///e:/game/bar_room/src/gift-props.js#L883-L920): Executes _spawnFingerHeart operation within gift-props.js.
- [_spawnCyberSunglasses(origin)](file:///e:/game/bar_room/src/gift-props.js#L925-L958): Executes _spawnCyberSunglasses operation within gift-props.js.
- [_spawnRainbow(origin)](file:///e:/game/bar_room/src/gift-props.js#L963-L995): Executes _spawnRainbow operation within gift-props.js.
- [_spawnConicalHat(origin)](file:///e:/game/bar_room/src/gift-props.js#L1000-L1034): Executes _spawnConicalHat operation within gift-props.js.
- [_spawnExcalibur(origin)](file:///e:/game/bar_room/src/gift-props.js#L1039-L1078): Executes _spawnExcalibur operation within gift-props.js.
- [_spawnElectricGuitar(origin)](file:///e:/game/bar_room/src/gift-props.js#L1083-L1110): Executes _spawnElectricGuitar operation within gift-props.js.
- [_spawnLoveBalloons(origin)](file:///e:/game/bar_room/src/gift-props.js#L1115-L1145): Executes _spawnLoveBalloons operation within gift-props.js.
- [_spawnGenericGiftProp(origin, key, coins)](file:///e:/game/bar_room/src/gift-props.js#L1150-L1180): Executes _spawnGenericGiftProp operation within gift-props.js.
- [update(delta)](file:///e:/game/bar_room/src/gift-props.js#L1185-L1216): Executes update operation within gift-props.js.

### src/live-event-handler.js
- [resolveGiftCategory(coins)](file:///e:/game/bar_room/src/live-event-handler.js#L18-L23): Categorizes incoming donation coin values into small, medium, high, or ultra celebration tiers.
- [calculateSlimeTier(totalCoins, isTop1 = undefined)](file:///e:/game/bar_room/src/live-event-handler.js#L31-L33): Calculates Slime visual evolution tier (1 to 5) based on cumulative coin contributions.
- [_handleChatCommands(comment, mesh, syncActiveFloorAvatars)](file:///e:/game/bar_room/src/live-event-handler.js#L42-L119): Parses and executes first matching chat command for slime color (!color with random fallback), dance mode (!dance 1/2/toggle), or face mode (!face smile/normal/wink with random fallback).
- [_triggerUltraCelebration(mesh, origin, giftKey, coins, shouldUpgradeTier, newTier, context, evt = {})](file:///e:/game/bar_room/src/live-event-handler.js#L125-L125): Triggers ultra luxury coronation celebration (>= 6000 coins) with camera tracking, fanfare, golden beam, and fireworks.
- [_triggerHighCelebration(mesh, origin, giftKey, coins, shouldUpgradeTier, newTier, context, evt = {})](file:///e:/game/bar_room/src/live-event-handler.js#L165-L165): Triggers high-tier VIP celebration (500-5000 coins) with VIP camera framing, white beam, and shockwave.
- [_triggerMediumCelebration(mesh, origin, giftKey, coins, shouldUpgradeTier, newTier, context)](file:///e:/game/bar_room/src/live-event-handler.js#L203-L235): Triggers medium donation celebration (20-499 coins) with bass boom SFX, spotlights, and orbiting coin rings.
- [_triggerSmallCelebration(mesh, origin, giftKey, coins, shouldUpgradeTier, newTier, context)](file:///e:/game/bar_room/src/live-event-handler.js#L240-L275): Triggers small donation celebration (1-19 coins) with coin clink SFX, bounce jump, and dropping coins.
- [_scheduleDeferredVipSwap(mesh, giftCategory, sortedDonors, executeVipPromotionAndSwap)](file:///e:/game/bar_room/src/live-event-handler.js#L280-L291): Defers bilateral VIP platform promotion until celebratory visual effects conclude.
- [handleLikeEvent(evt, context)](file:///e:/game/bar_room/src/live-event-handler.js#L296-L344): Emits flying 3D hearts and charges the stream hype meter upon incoming likes.
- [handleChatEvent(evt, context)](file:///e:/game/bar_room/src/live-event-handler.js#L349-L356): Processes chat comments, routes avatar commands, and increments stream hype.
- [handleGiftEvent(evt, context)](file:///e:/game/bar_room/src/live-event-handler.js#L361-L472): Processes gift donations, updates leaderboard, triggers in-place celebrations, and schedules VIP promotion.
- [handleAdminCommand(evt, context)](file:///e:/game/bar_room/src/live-event-handler.js#L477-L594): Applies administrative controls for camera presets, distance slider, chroma key, volume, and frenzy mode.
- [handleRoomRanksEvent(evt, context)](file:///e:/game/bar_room/src/live-event-handler.js#L601-L671): Executes handleRoomRanksEvent operation within live-event-handler.js.
- [handleSessionResetEvent(evt, context)](file:///e:/game/bar_room/src/live-event-handler.js#L676-L681): Executes handleSessionResetEvent operation within live-event-handler.js.
- [handleMemberEvent(evt, context)](file:///e:/game/bar_room/src/live-event-handler.js#L687-L703): Executes handleMemberEvent operation within live-event-handler.js.
- [handleFanEvent(evt, context)](file:///e:/game/bar_room/src/live-event-handler.js#L709-L726): Executes handleFanEvent operation within live-event-handler.js.
- [handleFollowEvent(evt, context)](file:///e:/game/bar_room/src/live-event-handler.js#L732-L752): Executes handleFollowEvent operation within live-event-handler.js.
- [handleLiveEvent(evt, context)](file:///e:/game/bar_room/src/live-event-handler.js#L760-L842): Central event router delegating normalized TikTok LIVE WebSocket payloads to specific event handlers.

### src/main.js
- [initClientApp()](file:///e:/game/bar_room/src/main.js#L93-L314): Initializes the 3D client application, network sockets, audio, and UI overlays.
- [onThresholdsUpdated(newThresholds)](file:///e:/game/bar_room/src/main.js#L210-L231): Executes onThresholdsUpdated operation within main.js.
- [animate()](file:///e:/game/bar_room/src/main.js#L250-L311): Main 60 FPS WebGL render loop driving audio analysis, lights, VIP scheduler, avatars, and camera.

### src/preview-audio.js
- [getPreviewAudioCtx()](file:///e:/game/bar_room/src/preview-audio.js#L5-L13): Lazily initializes and resumes the Web Audio API AudioContext instance.
- [playPreviewSfx(type)](file:///e:/game/bar_room/src/preview-audio.js#L15-L127): Synthesizes procedural Web Audio sound effects (coin drop, bass boom, gold chime, sword clash, royal fanfare, heart swoosh).

### src/scene-manager.js
- [getOrbitCameraPosition(theta, phi = 0.85, radius = ORBIT_CONFIG.radius)](file:///e:/game/bar_room/src/scene-manager.js#L29-L38): Computes clamped spherical orbit coordinates keeping the camera within room boundaries and focused on the dance floor.
- [constructor(container)](file:///e:/game/bar_room/src/scene-manager.js#L42-L73): Executes constructor operation within scene-manager.js.
- [init()](file:///e:/game/bar_room/src/scene-manager.js#L75-L166): Configures renderer pixel ratio, shadow-free tone mapping, and window resize event listeners.
- [setCameraPreset(key, duration = null, customTarget = null)](file:///e:/game/bar_room/src/scene-manager.js#L168-L202): Smoothly transitions the camera position, focus target, and FOV to a designated camera preset.
- [setOrbitRadius(radius)](file:///e:/game/bar_room/src/scene-manager.js#L204-L208): Dynamically alters camera orbit radius around the dance floor.
- [setFov(fov)](file:///e:/game/bar_room/src/scene-manager.js#L210-L216): Adjusts camera vertical field-of-view with projection matrix update.
- [revertVipCamera()](file:///e:/game/bar_room/src/scene-manager.js#L218-L221): Reverts camera focus from VIP spotlight target back to the default overview preset.
- [toggleChromaKey()](file:///e:/game/bar_room/src/scene-manager.js#L223-L235): Switches the viewport background between standard club atmosphere and chroma key green for OBS streaming.
- [toggleAlpha()](file:///e:/game/bar_room/src/scene-manager.js#L237-L244): Toggles WebGL clear alpha between opaque black and transparent for OBS browser overlays.
- [onResize()](file:///e:/game/bar_room/src/scene-manager.js#L246-L252): Updates camera aspect ratio and renderer dimensions when the browser window or stream canvas resizes.
- [triggerCameraShake(intensity = 0.35, duration = 1.0)](file:///e:/game/bar_room/src/scene-manager.js#L254-L258): Adds procedural camera shake impact during high-tier and ultra donations.
- [startLionTracking(heroMesh, duration = 7.6)](file:///e:/game/bar_room/src/scene-manager.js#L260-L274): Dynamically frames and tracks the soaring hero avatar up to 4.2m in the sky with camera shake during Lion celebrations.
- [update(deltaTime = 0.016, bassPunch = 0)](file:///e:/game/bar_room/src/scene-manager.js#L276-L390): Lerps camera position and look-at target smoothly toward the active preset, pulsing orbit distance on bass hits.
- [getScreenCoords(worldPos)](file:///e:/game/bar_room/src/scene-manager.js#L398-L407): Executes getScreenCoords operation within scene-manager.js.
- [focusSlimeCinematic(slimePos, onArrived = null, duration = 1.0, avatarMesh = null)](file:///e:/game/bar_room/src/scene-manager.js#L422-L484): Executes focusSlimeCinematic operation within scene-manager.js.
- [revertFromCinematic()](file:///e:/game/bar_room/src/scene-manager.js#L489-L501): Executes revertFromCinematic operation within scene-manager.js.
- [startDonateShowcase(slimePos, onArrived = null, duration = 1.0)](file:///e:/game/bar_room/src/scene-manager.js#L503-L505): Executes startDonateShowcase operation within scene-manager.js.
- [endDonateShowcase()](file:///e:/game/bar_room/src/scene-manager.js#L507-L509): Executes endDonateShowcase operation within scene-manager.js.
- [focusDonationAvatar(avatarMesh, options = {}, onArrived = null)](file:///e:/game/bar_room/src/scene-manager.js#L519-L519): Executes focusDonationAvatar operation within scene-manager.js.
- [focusOnAvatar(avatarMesh, options = {})](file:///e:/game/bar_room/src/scene-manager.js#L596-L596): Focuses camera directly onto a selected Slime avatar with dynamic height framing and gentle 360-degree orbit rotation.
- [clearAvatarFocus()](file:///e:/game/bar_room/src/scene-manager.js#L621-L634): Clears active avatar focus tracking and smoothly restores previous camera preset.

### src/slime-aura.js
- [createBubbleSpriteTexture()](file:///e:/game/bar_room/src/slime-aura.js#L12-L33): Creates procedural luminous round glow sprite texture for mini bubbles.
- [createSlimeAura()](file:///e:/game/bar_room/src/slime-aura.js#L52-L203): Builds and returns a modular 3-style rotating aura controller (Purple, Orange, Vivid Gold) with rising effervescent mini bubbles.
- [setAura(type)](file:///e:/game/bar_room/src/slime-aura.js#L141-L160): Executes setAura operation within slime-aura.js.
- [update(deltaTime)](file:///e:/game/bar_room/src/slime-aura.js#L162-L192): Executes update operation within slime-aura.js.
- [currentType()](file:///e:/game/bar_room/src/slime-aura.js#L200-L200): Executes currentType operation within slime-aura.js.
- [isVisible()](file:///e:/game/bar_room/src/slime-aura.js#L201-L201): Executes isVisible operation within slime-aura.js.

### src/slime-model.js
- [createBasicHalfSphereGeometry()](file:///e:/game/bar_room/src/slime-model.js#L38-L49): Generates Tier 1 classic half-sphere geometry with smooth flattened underside.
- [createChubbyMochiSlimeGeometry()](file:///e:/game/bar_room/src/slime-model.js#L56-L90): Generates Tier 2 chubby mochi teardrop slime geometry with wider base and organic taper.
- [getClonedSlimeMaterial(paletteKey)](file:///e:/game/bar_room/src/slime-model.js#L111-L118): Executes getClonedSlimeMaterial operation within slime-model.js.
- [sharedMiniSlimeGeom(()](file:///e:/game/bar_room/src/slime-model.js#L131-L140): Instantiates shared mini-slime companion pet mesh geometry.
- [sharedHornGeom(()](file:///e:/game/bar_room/src/slime-model.js#L155-L160): Instantiates shared evolutionary head horn accessory geometry.
- [sharedTailSegmentGeom(()](file:///e:/game/bar_room/src/slime-model.js#L162-L167): Instantiates shared articulated tail segment accessory geometry.
- [sharedTailTipGeom(()](file:///e:/game/bar_room/src/slime-model.js#L169-L175): Instantiates shared tapered tail tip mesh geometry.
- [sharedSideMochiGeom(()](file:///e:/game/bar_room/src/slime-model.js#L178-L184): Instantiates shared side cheek mochi puff geometry.
- [createBillboardSprite(userData = {})](file:///e:/game/bar_room/src/slime-model.js#L207-L207): Builds high-contrast overhead user badge with sharp contrast (#ffffff text), VIP avatar border, level, and rank tags.
- [redraw(img = null)](file:///e:/game/bar_room/src/slime-model.js#L231-L425): Redraws billboard canvas texture with current viewer level, coins, and ranking tags.
- [drawBorderRing(radius, borderCfg)](file:///e:/game/bar_room/src/slime-model.js#L294-L304): Executes drawBorderRing operation within slime-model.js.
- [createCyberSlime(paletteKey = 'cyan', rawUserData = {})](file:///e:/game/bar_room/src/slime-model.js#L470-L470): Instantiates complete Slime mesh hierarchy with dual-mesh body, blushing cheeks, permanent Gold halo and aura ring, 3D animated eyes, horns, and wings.
- [create3DEye(isLeft = true)](file:///e:/game/bar_room/src/slime-model.js#L514-L540): Builds 3D chibi eye mesh hierarchy with glossy cornea sphere and specular reflective highlights.
- [setLabelVisible(visible)](file:///e:/game/bar_room/src/slime-model.js#L955-L957): Toggles visibility of the 3D billboard sprite above the slime.
- [setBillboardScale(scale = 1.0)](file:///e:/game/bar_room/src/slime-model.js#L958-L964): Scales the 3D overhead billboard sprite proportionally with bottom-anchored expansion.
- [setTikTokLevel(lvl)](file:///e:/game/bar_room/src/slime-model.js#L965-L971): Sets the TikTok badge level on the billboard.
- [setDonateRank(rank)](file:///e:/game/bar_room/src/slime-model.js#L972-L978): Sets the donor rank title (e.g., TOP 1) on the billboard.
- [setFanStatus(isFan = true)](file:///e:/game/bar_room/src/slime-model.js#L979-L985): Executes setFanStatus operation within slime-model.js.
- [setFollowerStatus(isFollower = true)](file:///e:/game/bar_room/src/slime-model.js#L986-L992): Executes setFollowerStatus operation within slime-model.js.
- [updateBillboard(coinsToAdd = 0, newLevel = null, newRank = null)](file:///e:/game/bar_room/src/slime-model.js#L993-L1019): Redraws the 2D canvas texture for the billboard sprite with updated coins, level, and rank.
- [setFootRings(level = 0)](file:///e:/game/bar_room/src/slime-model.js#L1068-L1076): Executes setFootRings operation within slime-model.js.
- [setBodyAura(typeOrBool = false)](file:///e:/game/bar_room/src/slime-model.js#L1078-L1087): Executes setBodyAura operation within slime-model.js.
- [setPalette(newKey)](file:///e:/game/bar_room/src/slime-model.js#L1089-L1127): Switches avatar body palette among cyan, pink, and lime while preserving permanent Gold halo and foot ring.
- [setGender(gender)](file:///e:/game/bar_room/src/slime-model.js#L1129-L1134): Sets slime gender presentation accessories (e.g., cute bow for female slimes).
- [setTier(tierNum)](file:///e:/game/bar_room/src/slime-model.js#L1144-L1204): Updates slime evolutionary visual tier (1 to 5) with corresponding horns, tail, wings, and mini-slimes.
- [setExpression(exp)](file:///e:/game/bar_room/src/slime-model.js#L1206-L1218): Updates 3D chibi eye scale and mouth expression (smile, normal, wink, happy, squint).
- [setDanceMode(mode = null)](file:///e:/game/bar_room/src/slime-model.js#L1220-L1235): Sets or toggles CyberSlime dance mode (1: continuous body spin around Z-axis while keeping billboard upright, 2: default rhythmic bounce).
- [setPaused(paused)](file:///e:/game/bar_room/src/slime-model.js#L1237-L1251): Pauses or resumes slime breathing/dancing animations and resets expression state.
- [triggerDanceMove(moveType)](file:///e:/game/bar_room/src/slime-model.js#L1259-L1292): Dispatches tier-differentiated dance moves (spin for Tier 3+, flip for Tier 4-5).
- [triggerLikeJump()](file:///e:/game/bar_room/src/slime-model.js#L1294-L1302): Triggers single celebratory jump and smile expression on like event using central LIKE_JUMP_CONFIG.
- [triggerSink(onComplete = null)](file:///e:/game/bar_room/src/slime-model.js#L1304-L1313): Executes triggerSink operation within slime-model.js.
- [shuffleDanceMove()](file:///e:/game/bar_room/src/slime-model.js#L1315-L1333): Randomly triggers tier-appropriate flourish actions (spin or flip) with randomized directions and expressions.
- [setAutoDanceRoutine(enabled)](file:///e:/game/bar_room/src/slime-model.js#L1335-L1341): Toggles automated periodic dance routines for autonomous slime behavior.
- [triggerDonateAnimation(typeOrConfig = 'small', upgradeTier = false, targetTier = 1, coins = 1)](file:///e:/game/bar_room/src/slime-model.js#L1359-L1495): Triggers categorized donation celebration animation reading jump counts, durations and apex heights from DONATE_CELEBRATION_CONFIG.
- [triggerLionCelebration(upgradeTier = false)](file:///e:/game/bar_room/src/slime-model.js#L1497-L1506): Initiates ultra luxury celebration coronation sequence with golden beam and restored open eyes upon completion.
- [update(deltaTime, audioKick = 0)](file:///e:/game/bar_room/src/slime-model.js#L1508-L2073): Per-frame animation loop evaluating physics-driven slime dancing, breathing, audio kick bouncing, and eyelids.

### src/ui-overlay.js
- [getGiftLogo(giftKeyOrName)](file:///e:/game/bar_room/src/ui-overlay.js#L124-L128): Executes getGiftLogo operation within ui-overlay.js.
- [constructor(options = {})](file:///e:/game/bar_room/src/ui-overlay.js#L131-L131): Executes constructor operation within ui-overlay.js.
- [initElements()](file:///e:/game/bar_room/src/ui-overlay.js#L153-L166): Caches DOM element references for fast real-time UI updates during stream events.
- [bindEvents()](file:///e:/game/bar_room/src/ui-overlay.js#L168-L491): Binds event listeners for UI interactions, audio unlock banner, keyboard shortcuts, and admin form submissions.
- [unlockAudioHandler()](file:///e:/game/bar_room/src/ui-overlay.js#L170-L182): Handles the 1-click audio unlock prompt, resuming AudioContext and fading out the prompt banner.
- [setDistHelper(val)](file:///e:/game/bar_room/src/ui-overlay.js#L219-L223): Updates camera orbit distance slider value and HUD readout label.
- [triggerLikeAction()](file:///e:/game/bar_room/src/ui-overlay.js#L350-L375): Executes triggerLikeAction operation within ui-overlay.js.
- [getTargetUser()](file:///e:/game/bar_room/src/ui-overlay.js#L493-L512): Resolves target user from admin dropdown selection or falls back to custom mock user parameters.
- [getCustomMockUser(spawnIdx = 0)](file:///e:/game/bar_room/src/ui-overlay.js#L514-L539): Collects custom mock user input from admin UI inputs and assigns unique IDs on repeated spawns.
- [updateActiveAvatars(avatarList = [])](file:///e:/game/bar_room/src/ui-overlay.js#L541-L559): Populates the target avatar select dropdown with active avatars on dance floor and VIP platforms.
- [bindMockButton(id, fn)](file:///e:/game/bar_room/src/ui-overlay.js#L561-L564): Attaches click handlers to admin drawer mock simulation buttons.
- [toggleAdminDrawer()](file:///e:/game/bar_room/src/ui-overlay.js#L566-L575): Toggles visibility of the streamer administration sidebar drawer.
- [updateTikTokStatus(status)](file:///e:/game/bar_room/src/ui-overlay.js#L577-L586): Updates the HUD connection badge with real-time TikTok room status and viewer count.
- [loadInitialMaxHype()](file:///e:/game/bar_room/src/ui-overlay.js#L588-L599): Executes loadInitialMaxHype operation within ui-overlay.js.
- [setMaxHype(val)](file:///e:/game/bar_room/src/ui-overlay.js#L601-L618): Executes setMaxHype operation within ui-overlay.js.
- [addHype(points = 1)](file:///e:/game/bar_room/src/ui-overlay.js#L620-L631): Increments stream Hype Meter points and triggers 15-second Frenzy Mode when the meter reaches 100%.
- [triggerFrenzy(duration = 15)](file:///e:/game/bar_room/src/ui-overlay.js#L633-L635): Alias method triggering 15-second Frenzy party mode with air horn SFX and full-room fireworks.
- [triggerFrenzyMode()](file:///e:/game/bar_room/src/ui-overlay.js#L637-L657): Activates the 15-second club Frenzy party mode with air horn SFX and full-room fireworks.
- [showGiftAlert(giftEvent)](file:///e:/game/bar_room/src/ui-overlay.js#L659-L720): Displays an animated glassmorphic gift alert card with donor avatar, name, and gift tier icon.
- [updateLeaderboard(donors = [])](file:///e:/game/bar_room/src/ui-overlay.js#L722-L743): Updates the Top 3 Donors leaderboard widget with rank badges and accumulated coin totals.

### src/vip-lounge-manager.js
- [triggerLeapAnimation(mesh, targetPos, targetRotY, onComplete = null)](file:///e:/game/bar_room/src/vip-lounge-manager.js#L14-L35): Animates an avatar along a parabolic leap arc (+2.4m apex) with cubic ease-in-out curve between dance floor and VIP lounge platforms.
- [updateLeapAnimation(mesh, delta)](file:///e:/game/bar_room/src/vip-lounge-manager.js#L43-L72): Per-frame physics and interpolation driver advancing leap progress and triggering landing callbacks.
- [constructor()](file:///e:/game/bar_room/src/vip-lounge-manager.js#L80-L83): Initializes Top 1 and Top 2 VIP lounge occupant state tracking.
- [getCurrentTop1()](file:///e:/game/bar_room/src/vip-lounge-manager.js#L85-L87): Returns user ID of the current Top 1 Imperial Throne occupant.
- [getCurrentTop2()](file:///e:/game/bar_room/src/vip-lounge-manager.js#L89-L91): Returns user ID of the current Top 2 Platinum Lounge occupant.
- [clear()](file:///e:/game/bar_room/src/vip-lounge-manager.js#L93-L96): Resets both Top 1 and Top 2 VIP platform occupant assignments.
- [removeUser(userId)](file:///e:/game/bar_room/src/vip-lounge-manager.js#L98-L102): Vacates assigned VIP platform dais if occupied by the specified user.
- [_promoteToTop1(mesh, userId, userCoinsMap = null)](file:///e:/game/bar_room/src/vip-lounge-manager.js#L107-L125): Elevates and leaps new Top 1 donor onto the Left Imperial Dais (y=0.48m) with gold crown and billboard tag.
- [_promoteToTop2(mesh, userId, userCoinsMap = null)](file:///e:/game/bar_room/src/vip-lounge-manager.js#L130-L148): Elevates and leaps new Top 2 donor onto the Right Platinum Dais (y=0.38m) with silver billboard tag.
- [_demoteDisplacedAvatar(mesh, prevUserId, returnSlot, userCoinsMap)](file:///e:/game/bar_room/src/vip-lounge-manager.js#L153-L183): Returns displaced VIP occupant back to a vacant dance floor slot, resetting scales and VIP accessories.
- [executeVipPromotionAndSwap({ sortedDonors, avatarMeshes, userCoinsMap, floorSlots })](file:///e:/game/bar_room/src/vip-lounge-manager.js#L194-L194): Coordinates bilateral slot promotion and swapping between top donors and displaced avatars returning to the floor.

### src/vip-podium-scheduler.js
- [constructor({ duration = 15.0, podiumPos = { x: 0, y: 0.55, z: 0 }, preserveDonorPosition = false } = {})](file:///e:/game/bar_room/src/vip-podium-scheduler.js#L7-L7): Initializes the sequential VIP stage scheduler with duration, podium position, and queue.
- [enqueue(user, mesh, tier, returnSlot)](file:///e:/game/bar_room/src/vip-podium-scheduler.js#L15-L40): Enqueues a donating whale in the sequential FIFO VIP stage queue, extending tenure for current occupant.
- [promote(item)](file:///e:/game/bar_room/src/vip-podium-scheduler.js#L42-L73): Promotes a VIP whale avatar onto the center podium stage or elevates them at their floor slot.
- [update(delta, onPromote = null, onVacate = null)](file:///e:/game/bar_room/src/vip-podium-scheduler.js#L75-L101): Ticks down remaining tenure for the active whale on the VIP stage and promotes queued whales upon expiry.

### preview/avatar-ornaments.js
- [renderAvatarOrnament(tierClass, coins, giftKey)](file:///e:/game/bar_room/preview/avatar-ornaments.js#L2-L621): Generates and mounts milestone-specific procedural vector SVG frames (wreaths, angel wings, cosmic rings, crowns) around the donor avatar.

### preview/chibi-mascot.js
- [startChibiSlimeMascot(canvas, slimeColorHex = '#00f2fe')](file:///e:/game/bar_room/preview/chibi-mascot.js#L5-L81): Starts animated 2D canvas teardrop chibi slime mascot bouncing in the corner of the avatar frame.
- [render()](file:///e:/game/bar_room/preview/chibi-mascot.js#L12-L77): Internal 2D animation loop rendering halo, teardrop body gradient, blush cheeks, and waving hands.
- [stopChibiSlimeMascot()](file:///e:/game/bar_room/preview/chibi-mascot.js#L83-L88): Cancels the chibi animation frame and clears mascot canvas resources.

### preview/cinematic-particles.js
- [startCinematicParticles(canvas, gift, duration)](file:///e:/game/bar_room/preview/cinematic-particles.js#L3-L1641): Initiates fullscreen 2D canvas particle physics routines differentiated by donation tier (money rain, concert lasers, swan feathers, galaxy vortex, diamond shards, phoenix fire, etc.).
- [renderFx()](file:///e:/game/bar_room/preview/cinematic-particles.js#L368-L1637): Internal canvas frame render loop updating particle positions, velocities, rotations, alpha decay, and physics collisions.
- [stopCinematicParticles()](file:///e:/game/bar_room/preview/cinematic-particles.js#L1643-L1653): Cancels the canvas animation frame and clears the particle canvas context.

### preview/cinematic-showcase.js
- [initCinematicShowcase(ctx = {})](file:///e:/game/bar_room/preview/cinematic-showcase.js#L18-L18): Injects preview studio context (camera, activeAvatars, clearFloorEffects callback) into the showcase controller.
- [getScreenCoords(worldPos)](file:///e:/game/bar_room/preview/cinematic-showcase.js#L22-L35): Projects 3D world coordinates onto 2D screen pixel coordinates for target-guided stage shrink animations.
- [generateSvgAvatar(name = 'Viewer')](file:///e:/game/bar_room/preview/cinematic-showcase.js#L37-L58): Generates a fallback data-URI SVG circular monogram avatar with user initials.
- [enqueueHighTierShowcase(item)](file:///e:/game/bar_room/preview/cinematic-showcase.js#L60-L65): Appends high-tier and ultra donations to the sequential FIFO showcase queue, starting playback if idle.
- [processNextHighTier()](file:///e:/game/bar_room/preview/cinematic-showcase.js#L67-L82): Dequeues and triggers the next cinematic showcase in sequence, maintaining queue state.
- [runCinematic2DShowcase(item, onFinished)](file:///e:/game/bar_room/preview/cinematic-showcase.js#L84-L353): Orchestrates the fullscreen cinematic overlay, backdrop blur, SVG ornaments, 2D particles, foreground 3D mascot, chibi badge, and safe termination.
- [cleanupShowcase()](file:///e:/game/bar_room/preview/cinematic-showcase.js#L282-L326): Safely closes the cinematic overlay, unpauses background avatars, disposes active foreground props, and invokes completion callbacks.

### preview/foreground-slime.js
- [initForegroundSlimeStage()](file:///e:/game/bar_room/preview/foreground-slime.js#L26-L74): Creates and configures dedicated Three.js WebGL renderer, scene, 3-point studio lighting, and perspective camera for foreground 3D mascots.
- [spawnFgStardust(pos, count = 2, colorHex = 0xffe066, scaleMul = 1.0)](file:///e:/game/bar_room/preview/foreground-slime.js#L78-L101): Spawns glowing stardust particles trailing behind flying 3D mascots.
- [spawnFgSonicRing(pos, colorHex = 0xffd700)](file:///e:/game/bar_room/preview/foreground-slime.js#L103-L120): Spawns expanding 3D torus shockwave rings during supersonic bursts and sonic booms.
- [create3DJetPlane()](file:///e:/game/bar_room/preview/foreground-slime.js#L125-L232): Builds stylized low-poly 3D supersonic fighter jet model with wings, tailfin, cockpit canopy, and dual neon thruster plumes.
- [create3DParachute()](file:///e:/game/bar_room/preview/foreground-slime.js#L234-L267): Constructs 3D hexagonal ribbed parachute dome with dual suspension cord lines.
- [createPantherFeatures(slime)](file:///e:/game/bar_room/preview/foreground-slime.js#L269-L312): Builds predator 3D obsidian panther features including slanted eye rims, dual downward fangs, and 6 neon violet whiskers.
- [createTigerFeatures(slime)](file:///e:/game/bar_room/preview/foreground-slime.js#L314-L387): Builds ferocious 3D fire tiger facial features including 2 chubby mochi cheek pads, dual tiger fangs, 6 fiery whiskers, and forehead fire stripes.
- [createLionManeFeatures()](file:///e:/game/bar_room/preview/foreground-slime.js#L389-L449): Assembles majestic 16-puff amber mane ring and 5-spike 24K gold crown for royal coronation sequences.
- [create3DCelestialWings()](file:///e:/game/bar_room/preview/foreground-slime.js#L451-L485): Builds dual articulated 3D celestial feathered wings with metallic gold and glowing cyan gradient materials.
- [createPegasusFeatures()](file:///e:/game/bar_room/preview/foreground-slime.js#L487-L530): Builds elegant Pegasus features including forward-tilted alicorn horn, pointed horse ears, and dual celestial wings.
- [create3DUniverseMoons()](file:///e:/game/bar_room/preview/foreground-slime.js#L532-L554): Builds 4 orbiting planetary sphere meshes with glowing orbital rings encircling the cosmic avatar.
- [startForegroundSlime(donorAvatar, duration, giftKey = 'money_gun')](file:///e:/game/bar_room/preview/foreground-slime.js#L556-L1531): Instantiates and coordinates front-angle 3D mascot flight timelines, choreographies, and props according to ultra donation persona.
- [renderFg(currentTime)](file:///e:/game/bar_room/preview/foreground-slime.js#L658-L1527): Per-frame animation loop driving mascot positional lerps, tumbling flips, camera tracking, and trailing stardust.
- [stopForegroundSlime()](file:///e:/game/bar_room/preview/foreground-slime.js#L1533-L1581): Disposes active foreground 3D mascot meshes, clears stardust particles, restores camera position, and halts the render loop.

### preview/gift-props.js
- [normalizeVietnameseKey(str)](file:///e:/game/bar_room/preview/gift-props.js#L8-L18): Executes normalizeVietnameseKey operation within gift-props.js.
- [constructor(scene)](file:///e:/game/bar_room/preview/gift-props.js#L21-L24): Executes constructor operation within gift-props.js.
- [trigger(giftKey = 'rose', origin = new THREE.Vector3(0, 0, 0), coins = 1)](file:///e:/game/bar_room/preview/gift-props.js#L30-L133): Executes trigger operation within gift-props.js.
- [_spawnJet(origin)](file:///e:/game/bar_room/preview/gift-props.js#L138-L267): Executes _spawnJet operation within gift-props.js.
- [_spawnCyberPanther(origin)](file:///e:/game/bar_room/preview/gift-props.js#L272-L376): Executes _spawnCyberPanther operation within gift-props.js.
- [addNeonMesh(geom, pos = [0, 0, 0], rot = [0, 0, 0])](file:///e:/game/bar_room/preview/gift-props.js#L292-L300): Executes addNeonMesh operation within gift-props.js.
- [_spawnFireTiger(origin)](file:///e:/game/bar_room/preview/gift-props.js#L381-L383): Executes _spawnFireTiger operation within gift-props.js.
- [_spawnUniverse(origin)](file:///e:/game/bar_room/preview/gift-props.js#L388-L504): Executes _spawnUniverse operation within gift-props.js.
- [_spawnPhoenix(origin)](file:///e:/game/bar_room/preview/gift-props.js#L509-L562): Executes _spawnPhoenix operation within gift-props.js.
- [_spawnGoldenLion(origin)](file:///e:/game/bar_room/preview/gift-props.js#L567-L620): Executes _spawnGoldenLion operation within gift-props.js.
- [_spawnPegasus(origin)](file:///e:/game/bar_room/preview/gift-props.js#L625-L665): Executes _spawnPegasus operation within gift-props.js.
- [_spawnDiscoBall(origin)](file:///e:/game/bar_room/preview/gift-props.js#L670-L726): Executes _spawnDiscoBall operation within gift-props.js.
- [_spawnMoneyGun(origin)](file:///e:/game/bar_room/preview/gift-props.js#L731-L791): Executes _spawnMoneyGun operation within gift-props.js.
- [_spawnRose(origin)](file:///e:/game/bar_room/preview/gift-props.js#L796-L837): Executes _spawnRose operation within gift-props.js.
- [_spawnFingerHeart(origin)](file:///e:/game/bar_room/preview/gift-props.js#L842-L879): Executes _spawnFingerHeart operation within gift-props.js.
- [_spawnCyberSunglasses(origin)](file:///e:/game/bar_room/preview/gift-props.js#L884-L917): Executes _spawnCyberSunglasses operation within gift-props.js.
- [_spawnRainbow(origin)](file:///e:/game/bar_room/preview/gift-props.js#L922-L954): Executes _spawnRainbow operation within gift-props.js.
- [_spawnConicalHat(origin)](file:///e:/game/bar_room/preview/gift-props.js#L959-L993): Executes _spawnConicalHat operation within gift-props.js.
- [_spawnExcalibur(origin)](file:///e:/game/bar_room/preview/gift-props.js#L998-L1037): Executes _spawnExcalibur operation within gift-props.js.
- [_spawnElectricGuitar(origin)](file:///e:/game/bar_room/preview/gift-props.js#L1042-L1069): Executes _spawnElectricGuitar operation within gift-props.js.
- [_spawnLoveBalloons(origin)](file:///e:/game/bar_room/preview/gift-props.js#L1074-L1104): Executes _spawnLoveBalloons operation within gift-props.js.
- [_spawnGenericGiftProp(origin, key, coins)](file:///e:/game/bar_room/preview/gift-props.js#L1109-L1139): Executes _spawnGenericGiftProp operation within gift-props.js.
- [update(delta)](file:///e:/game/bar_room/preview/gift-props.js#L1144-L1175): Executes update operation within gift-props.js.

### preview/preview-audio.js
- [getPreviewAudioCtx()](file:///e:/game/bar_room/preview/preview-audio.js#L5-L13): Lazily initializes and resumes the Web Audio API AudioContext instance.
- [playPreviewSfx(type)](file:///e:/game/bar_room/preview/preview-audio.js#L15-L127): Synthesizes procedural Web Audio sound effects (coin drop, bass boom, gold chime, sword clash, royal fanfare, heart swoosh).

### preview/slime-aura.js
- [createBubbleSpriteTexture()](file:///e:/game/bar_room/preview/slime-aura.js#L9-L30): Creates procedural luminous round glow sprite texture for mini bubbles in preview mode.
- [createSlimeAura()](file:///e:/game/bar_room/preview/slime-aura.js#L34-L179): Builds and returns a modular 3-style rotating aura controller with rising bubbles for preview mode.
- [setAura(type)](file:///e:/game/bar_room/preview/slime-aura.js#L123-L139): Executes setAura operation within slime-aura.js.
- [update(deltaTime)](file:///e:/game/bar_room/preview/slime-aura.js#L141-L168): Executes update operation within slime-aura.js.
- [currentType()](file:///e:/game/bar_room/preview/slime-aura.js#L176-L176): Executes currentType operation within slime-aura.js.
- [isVisible()](file:///e:/game/bar_room/preview/slime-aura.js#L177-L177): Executes isVisible operation within slime-aura.js.

### preview/slime-model.js
- [createBasicHalfSphereGeometry()](file:///e:/game/bar_room/preview/slime-model.js#L37-L48): Generates Tier 1 classic half-sphere geometry with smooth flattened underside.
- [createChubbyMochiSlimeGeometry()](file:///e:/game/bar_room/preview/slime-model.js#L54-L88): Generates Tier 2 chubby mochi teardrop slime geometry with wider base and organic taper.
- [getClonedSlimeMaterial(paletteKey)](file:///e:/game/bar_room/preview/slime-model.js#L108-L115): Executes getClonedSlimeMaterial operation within slime-model.js.
- [sharedMiniSlimeGeom(()](file:///e:/game/bar_room/preview/slime-model.js#L128-L137): Instantiates shared mini-slime companion pet mesh geometry.
- [sharedHornGeom(()](file:///e:/game/bar_room/preview/slime-model.js#L152-L156): Instantiates shared evolutionary head horn accessory geometry.
- [sharedTailSegmentGeom(()](file:///e:/game/bar_room/preview/slime-model.js#L158-L162): Instantiates shared articulated tail segment accessory geometry.
- [sharedTailTipGeom(()](file:///e:/game/bar_room/preview/slime-model.js#L164-L169): Instantiates shared tapered tail tip mesh geometry.
- [sharedSideMochiGeom(()](file:///e:/game/bar_room/preview/slime-model.js#L172-L177): Instantiates shared side cheek mochi puff geometry.
- [createBillboardSprite(userData = {})](file:///e:/game/bar_room/preview/slime-model.js#L200-L200): Builds high-contrast overhead user badge with sharp contrast (#ffffff text), VIP avatar border, level, and rank tags.
- [redraw(img = null)](file:///e:/game/bar_room/preview/slime-model.js#L224-L404): Redraws billboard canvas texture with current viewer level, coins, and ranking tags.
- [drawBorderRing(radius, borderCfg)](file:///e:/game/bar_room/preview/slime-model.js#L288-L298): Executes drawBorderRing operation within slime-model.js.
- [createCyberSlime(paletteKey = 'cyan', rawUserData = {})](file:///e:/game/bar_room/preview/slime-model.js#L449-L449): Instantiates complete Slime mesh hierarchy with dual-mesh body, blushing cheeks, permanent Gold halo and aura ring, 3D animated eyes, horns, and wings.
- [create3DEye(isLeft = true)](file:///e:/game/bar_room/preview/slime-model.js#L492-L518): Builds 3D chibi eye mesh hierarchy with glossy cornea sphere and specular reflective highlights.
- [setLabelVisible(visible)](file:///e:/game/bar_room/preview/slime-model.js#L933-L935): Toggles visibility of the 3D billboard sprite above the slime.
- [setBillboardScale(scale = 1.0)](file:///e:/game/bar_room/preview/slime-model.js#L936-L942): Scales the 3D overhead billboard sprite proportionally with bottom-anchored expansion.
- [setTikTokLevel(lvl)](file:///e:/game/bar_room/preview/slime-model.js#L943-L949): Sets the TikTok badge level on the billboard.
- [setDonateRank(rank)](file:///e:/game/bar_room/preview/slime-model.js#L950-L956): Sets the donor rank title (e.g., TOP 1) on the billboard.
- [setFanStatus(isFan = true)](file:///e:/game/bar_room/preview/slime-model.js#L957-L963): Executes setFanStatus operation within slime-model.js.
- [setFollowerStatus(isFollower = true)](file:///e:/game/bar_room/preview/slime-model.js#L964-L970): Executes setFollowerStatus operation within slime-model.js.
- [updateBillboard(coinsToAdd = 0, newLevel = null, newRank = null)](file:///e:/game/bar_room/preview/slime-model.js#L971-L997): Redraws the 2D canvas texture for the billboard sprite with updated coins, level, and rank.
- [setFootRings(level = 0)](file:///e:/game/bar_room/preview/slime-model.js#L1044-L1052): Executes setFootRings operation within slime-model.js.
- [setBodyAura(typeOrBool = false)](file:///e:/game/bar_room/preview/slime-model.js#L1054-L1063): Executes setBodyAura operation within slime-model.js.
- [setPalette(newKey)](file:///e:/game/bar_room/preview/slime-model.js#L1065-L1103): Switches avatar body palette among cyan, pink, and lime while preserving permanent Gold halo and foot ring.
- [setGender(gender)](file:///e:/game/bar_room/preview/slime-model.js#L1105-L1110): Sets slime gender presentation accessories (e.g., cute bow for female slimes).
- [setTier(tierNum)](file:///e:/game/bar_room/preview/slime-model.js#L1120-L1180): Updates slime evolutionary visual tier (1 to 5) with corresponding horns, tail, wings, and mini-slimes.
- [setExpression(exp)](file:///e:/game/bar_room/preview/slime-model.js#L1182-L1194): Updates eyelid and facial expressions (normal, happy, angry, proud, squint).
- [setPaused(paused)](file:///e:/game/bar_room/preview/slime-model.js#L1196-L1210): Pauses or resumes slime breathing/dancing animations and resets expression state.
- [triggerDanceMove(moveType)](file:///e:/game/bar_room/preview/slime-model.js#L1218-L1251): Dispatches tier-differentiated dance moves (spin for Tier 3+, flip for Tier 4-5).
- [triggerLikeJump()](file:///e:/game/bar_room/preview/slime-model.js#L1253-L1261): Executes triggerLikeJump operation within slime-model.js.
- [shuffleDanceMove()](file:///e:/game/bar_room/preview/slime-model.js#L1263-L1281): Randomly triggers tier-appropriate flourish actions (spin or flip) with randomized directions and expressions.
- [setAutoDanceRoutine(enabled)](file:///e:/game/bar_room/preview/slime-model.js#L1283-L1289): Toggles automated periodic dance routines for autonomous slime behavior.
- [triggerDonateAnimation(typeOrConfig = 'small', upgradeTier = false, targetTier = 1, coins = 1)](file:///e:/game/bar_room/preview/slime-model.js#L1299-L1375): Triggers categorized donation animations (small 1s jump; medium/high 1s jump + 0.5s spin), separating tier upgrades from celebration FX.
- [triggerLionCelebration(upgradeTier = false)](file:///e:/game/bar_room/preview/slime-model.js#L1377-L1386): Initiates ultra luxury celebration coronation sequence with golden beam and restored open eyes upon completion.
- [update(deltaTime, audioKick = 0)](file:///e:/game/bar_room/preview/slime-model.js#L1388-L1930): Per-frame animation loop evaluating physics-driven slime dancing, breathing, audio kick bouncing, and eyelids.

### preview/slime-preview.js
- [triggerWhiteLightBeam(targetX = 0, targetZ = 0, duration = 1.5)](file:///e:/game/bar_room/preview/slime-preview.js#L117-L124): Activates vertical white light spotlight beam at designated ground coordinates.
- [triggerFireworks(originY = 4.2, originX = 0, originZ = 0, customColor = 0xffe066)](file:///e:/game/bar_room/preview/slime-preview.js#L150-L167): Spawns celebratory particle fireworks burst at designated 3D coordinates.
- [getViewerProfile(idx)](file:///e:/game/bar_room/preview/slime-preview.js#L198-L211): Generates deterministic test viewer profile data for demo avatars.
- [createAvatarInstance(paletteKey, index = 0)](file:///e:/game/bar_room/preview/slime-preview.js#L213-L235): Instantiates and positions a new cyber slime avatar in the preview scene.
- [clearShowcaseLabels()](file:///e:/game/bar_room/preview/slime-preview.js#L240-L248): Cleans up floating 3D labels generated during the multi-tier showcase.
- [createTierLabelSprite(title, desc, colorHex)](file:///e:/game/bar_room/preview/slime-preview.js#L250-L283): Builds floating 3D billboard labels with tier descriptions for showcase display.
- [showcaseAllTiers()](file:///e:/game/bar_room/preview/slime-preview.js#L285-L328): Displays 5 evolutionary slime tiers in a showcase row with descriptive 3D billboard labels.
- [repositionGrid()](file:///e:/game/bar_room/preview/slime-preview.js#L330-L354): Arranges active preview avatars into a balanced circular or grid formation.
- [updateMetricHUD()](file:///e:/game/bar_room/preview/slime-preview.js#L356-L361): Updates the HUD FPS, draw calls, and vertex count statistics display.
- [addAvatars(countToAdd)](file:///e:/game/bar_room/preview/slime-preview.js#L363-L372): Increments avatar count and positions new slimes on stage.
- [removeAvatars(countToRemove)](file:///e:/game/bar_room/preview/slime-preview.js#L374-L382): Decrements avatar count and safely disposes of removed slime meshes.
- [setAvatarCount(targetCount)](file:///e:/game/bar_room/preview/slime-preview.js#L384-L391): Dynamically scales the number of preview avatars on stage (1 to 50).
- [triggerLionCelebrationEvent(targetAvatar = null, upgradeTier = false)](file:///e:/game/bar_room/preview/slime-preview.js#L403-L409): Coordinates stage-wide ultra donation sequence respecting clean cinematic foreground mascot presentation.
- [togglePause()](file:///e:/game/bar_room/preview/slime-preview.js#L449-L464): Toggles global animation pause for inspection and snapshotting.
- [setHeroLevel(levelNum)](file:///e:/game/bar_room/preview/slime-preview.js#L499-L503): Sets the hero avatar billboard TikTok level in the preview sandbox.
- [setHeroRank(rankStr)](file:///e:/game/bar_room/preview/slime-preview.js#L505-L509): Sets the hero avatar billboard donor ranking in the preview sandbox.
- [simulateCrowdRanks()](file:///e:/game/bar_room/preview/slime-preview.js#L511-L540): Simulates random TikTok levels and donor rankings across the avatar crowd.
- [clearAllCrowdRanks()](file:///e:/game/bar_room/preview/slime-preview.js#L542-L549): Resets all crowd avatar billboard levels and rankings.
- [triggerCameraShake(intensity = 0.25, duration = 0.7)](file:///e:/game/bar_room/preview/slime-preview.js#L635-L651): Adds procedural camera shake impact during high-tier and ultra donations.
- [showGiftToast(username, gift)](file:///e:/game/bar_room/preview/slime-preview.js#L654-L680): Displays an animated HTML toast notification with gift icon and coin value.
- [spawnDroppingCoins(origin, count = 1, subType = 'drop_single')](file:///e:/game/bar_room/preview/slime-preview.js#L724-L763): Spawns physics-based instanced 3D coins cascading and bouncing across the dance floor.
- [spawnSingleCoinInstance(origin, cfg)](file:///e:/game/bar_room/preview/slime-preview.js#L765-L788): Spawns a single 3D falling gold coin with randomized angular velocity.
- [getSlimeEffectiveRadius(targetAvatarOrOrigin)](file:///e:/game/bar_room/preview/slime-preview.js#L797-L807): Calculates boundary radius of slime avatar to avoid mesh clipping when spawning coin orbits.
- [spawnOrbitingCoinRings(targetAvatarOrOrigin, coins = 20, duration = 2.0)](file:///e:/game/bar_room/preview/slime-preview.js#L809-L909): Spawns multi-level golden coin rings orbiting dynamically around the celebrating slime.
- [triggerFloorShockwave(origin, maxScale = 4.0, duration = 1.2)](file:///e:/game/bar_room/preview/slime-preview.js#L911-L927): Spawns expanding circular shockwave ring on the dance floor.
- [focusPreviewDonationAvatar(avatar, options = {}, onArrived = null)](file:///e:/game/bar_room/preview/slime-preview.js#L969-L969): Executes focusPreviewDonationAvatar operation within slime-preview.js.
- [revertPreviewDonationCamera()](file:///e:/game/bar_room/preview/slime-preview.js#L1023-L1041): Executes revertPreviewDonationCamera operation within slime-preview.js.
- [enqueuePreviewDonation(item)](file:///e:/game/bar_room/preview/slime-preview.js#L1046-L1054): Executes enqueuePreviewDonation operation within slime-preview.js.
- [processNextPreviewDonation()](file:///e:/game/bar_room/preview/slime-preview.js#L1056-L1175): Executes processNextPreviewDonation operation within slime-preview.js.
- [onTurnComplete()](file:///e:/game/bar_room/preview/slime-preview.js#L1071-L1075): Executes onTurnComplete operation within slime-preview.js.
- [startEffectsAndHold()](file:///e:/game/bar_room/preview/slime-preview.js#L1079-L1118): Executes startEffectsAndHold operation within slime-preview.js.
- [startEffectsAndHold()](file:///e:/game/bar_room/preview/slime-preview.js#L1125-L1159): Executes startEffectsAndHold operation within slime-preview.js.
- [triggerDonation(giftKey, targetAvatar = null, forceTierUp = null)](file:///e:/game/bar_room/preview/slime-preview.js#L1177-L1223): Dispatches categorized donation events (small, medium, high, ultra) routing to cinematic showcase or in-place effects.
- [bindDonateButtons()](file:///e:/game/bar_room/preview/slime-preview.js#L1226-L1233): Binds DOM click listeners to all donation trigger buttons in the preview HUD.
- [toggleDonateStorm()](file:///e:/game/bar_room/preview/slime-preview.js#L1253-L1288): Toggles simulated automated donation stream for stress and visual testing.
- [createHeartBubbleTexture()](file:///e:/game/bar_room/preview/slime-preview.js#L1375-L1414): Executes createHeartBubbleTexture operation within slime-preview.js.
- [triggerHeartBubbles(pos, count = 5)](file:///e:/game/bar_room/preview/slime-preview.js#L1416-L1447): Executes triggerHeartBubbles operation within slime-preview.js.
- [animate()](file:///e:/game/bar_room/preview/slime-preview.js#L1570-L1849): Main Three.js render loop driving camera transitions, spotlight fades, avatar updates, and particle systems.
