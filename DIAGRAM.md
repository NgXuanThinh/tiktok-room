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

    class server_constants_redis_consumer_constants_js {

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
        +handleGetCooldown(req, res)
        +handleSetCooldown(req, res)
        +handleMockEvent(body)
    }

    class server_services_load_monitor_js {
        +constructor(redisClient, options = {})
        +setCinematicActive(isActive, durationSec = null)
        +calculateMultiplier(activeAvatars, queueDepth)
        +reportMetrics()
        +start()
        +stop()
    }

    class server_services_redis_stream_consumer_js {
        +constructor(redisClient, options = {})
        +start()
        +_pollLoop()
        +stop()
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
        +computeSharedDanceFrame(delta, time, bpmSpeed, frenzyM...)
        +_updateCyberSlime(mesh, data, delta, bands, shar...)
        +_updateProceduralSlime(mesh, data, phase, isBouncing,...)
        +_updateHumanoid(data, style, phase)
        +updateAvatarKinematics(mesh, delta, time, bpmSpeed, f...)
        +isAvatarIsolationActive()
        +getCurrentHeroMesh()
        +isolateDonationAvatar(heroMesh, avatarMeshes)
        +revealAvatarsForZoomOut(avatarMeshes, options = {})
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
        +freezeStaticTree(obj)
        +createHeartBubbleTexture()
        +constructor(scene)
        +init()
        +setMovingHeadLightsEnabled(enabled)
        +setMovingHeadConesEnabled(enabled)
        +setLaserBeamsEnabled(enabled)
        +setUseGpuShaders(enabled)
        +setStaticFloorEnabled(enabled)
        +getSlimeMetrics(target)
        +getSlimeEffectiveRadius(targetAvatarOrOrigin)
        +createStarfield()
        +createAccentLights()
        +createLedFloor()
        +getTileIndexAtPosition(pos)
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
        +isDonationQueuePaused()
        +pauseDonationQueue()
        +resumeDonationQueue()
        +waitForDonationCompletion()
        +clearDonationQueue()
        +enqueueDonation(item)
        +enqueueHighTierShowcase(item)
        +processNextDonation()
        +onTurnComplete()
        +startEffectsAndHold()
        +startEffectsAndHold()
        +_executeSmallEffects(mesh, origin, coins, shouldUpg...)
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

    class src_graphics_constants_js {

    }

    class src_graphics_settings_js {
        +constructor(options = {})
        +loadFromStorage()
        +saveToStorage()
        +addListener(callback)
        +notify(changedKey, value)
        +getSnapshot()
        +getEffectivePixelRatio()
        +setPixelRatioKey(key)
        +setEnableMovingHeadLights(enabled)
        +setEnableMovingHeadCones(enabled)
        +setEnableLaserBeams(enabled)
        +setBillboardCpuLookAt(enabled)
        +setUseGpuShaders(enabled)
        +setStaticFloor(enabled)
        +getTargetFps()
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
        +animate(nowTimestamp)
    }

    class src_minigame_constants_js {

    }

    class src_minigame_fx_js {
        +syncRoomNeonDeathColor(clubEnvironment, colorHex, dur...)
        +restoreRoomLighting(clubEnvironment)
        +triggerLaserStrikes(scene, targetMeshes, colorHex,...)
        +anim()
        +applyGhostState(mesh)
        +revertGhostState(mesh)
    }

    class src_minigame_manager_js {
        +constructor()
        +init(context = {})
        +_getFloorMeshes()
        +startScheduledGame(countdownSec = MINIGAME_CONFIG...)
        +startGameImmediate(roundDurationSec = this.roundD...)
        +startRound(roundNum)
        +freezeCountdown()
        +unfreezeCountdown()
        +populateActivePlayersFromFloor()
        +onVotingEnded()
        +executeJudgment(deathColor)
        +_handleOutcome(outcome)
        +handleChatCommand(userId, username, comment)
        +handleNewAvatarSpawn(userId, username, mesh)
        +stopMinigame(keepGhostUntilNextGame = false...)
    }

    class src_minigame_tally_js {
        +generateRoundTiebreakWeights(range = MINIGAME_CONFIG.tiebre...)
        +calculateVoteScores(alivePlayers, weights)
        +evaluateRoundOutcome(alivePlayers, deathColor)
    }

    class src_minigame_ui_js {
        +initMinigameUI()
        +updateCornerTiebreakBadge(weights, visible = true)
        +showStartCountdownBanner(remainingSec)
        +showVotingBanner(roundNumber, remainingSec, tot...)
        +showMinimalTallyBanner(roundNumber, counts, deathColo...)
        +showJudgmentBanner(deathColor)
        +showWinnerBanner(winners, isCoChampions = false...)
        +showNoWinnerBanner()
        +showWarningBanner(msg, autoHideMs = 3500)
        +hideMinigameBanner()
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

    class src_shaders_floor_shader_js {
        +createGpuFloorMaterial(uniforms = {})
    }

    class src_shaders_starfield_shader_js {
        +createGpuStarfieldMaterial(size = 0.18)
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
        +createSlimeMaterialByConfig(paletteKey, shadingKey = graph...)
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

    class gateway_config_redis_config_js {
        +getRedisConfig(customUrl = null)
        +retryStrategy(times)
    }

    class gateway_constants_gateway_constants_js {

    }

    class gateway_index_js {
        +processRawEvent(type, rawData)
        +shutdown(signal)
    }

    class gateway_services_command_throttler_js {
        +constructor(redisClient, options = {})
        +isInteractiveCommand(comment)
        +setBaseCooldown(sec)
        +getBaseCooldown()
        +getBackendMetrics()
        +canExecute(userId, comment)
        +resetUser(userId)
    }

    class gateway_services_event_classifier_js {
        +classify(event)
    }

    class gateway_services_event_stream_producer_js {
        +constructor(redisClient, options = {})
        +publish(event)
    }

    class gateway_services_like_aggregator_js {
        +constructor(options = {})
        +addLike(event)
        +flush()
        +reset()
    }

    class gateway_services_redis_client_js {
        +getRedisClient(customUrl = null)
        +closeRedisClient()
    }

server_inspect_live_js --> server_event_normalizer_js : imports
server_mock_simulator_js --> server_event_normalizer_js : imports
server_server_js --> server_event_normalizer_js : imports
server_server_js --> server_rate_limiter_js : imports
server_server_js --> server_avatar_proxy_js : imports
server_server_js --> server_tiktok_service_js : imports
server_server_js --> server_mock_simulator_js : imports
server_server_js --> server_services_redis_stream_consumer_js : imports
server_server_js --> server_services_load_monitor_js : imports
server_server_js --> gateway_services_command_throttler_js : imports
server_server_js --> gateway_config_redis_config_js : imports
server_server_js --> gateway_constants_gateway_constants_js : imports
server_services_load_monitor_js --> server_constants_redis_consumer_constants_js : imports
server_services_load_monitor_js --> gateway_constants_gateway_constants_js : imports
server_services_redis_stream_consumer_js --> gateway_constants_gateway_constants_js : imports
src_avatar_coordinator_js --> src_floor_slots_js : imports
src_avatar_coordinator_js --> src_avatar_manager_js : imports
src_avatar_coordinator_js --> src_vip_lounge_manager_js : imports
src_avatar_coordinator_js --> src_cinematic_config_js : imports
src_avatar_coordinator_js --> src_equipment_config_js : imports
src_avatar_coordinator_js --> src_graphics_settings_js : imports
src_cinematic_showcase_js --> src_cinematic_particles_js : imports
src_cinematic_showcase_js --> src_foreground_slime_js : imports
src_cinematic_showcase_js --> src_chibi_mascot_js : imports
src_cinematic_showcase_js --> src_avatar_ornaments_js : imports
src_cinematic_showcase_js --> src_preview_audio_js : imports
src_cinematic_showcase_js --> src_avatar_coordinator_js : imports
src_club_environment_js --> src_graphics_settings_js : imports
src_club_environment_js --> src_shaders_floor_shader_js : imports
src_club_environment_js --> src_shaders_starfield_shader_js : imports
src_club_environment_js --> src_gift_props_js : imports
src_club_environment_js --> src_cinematic_config_js : imports
src_donation_queue_js --> src_donation_constants_js : imports
src_donation_queue_js --> src_gift_props_js : imports
src_donation_queue_js --> src_animation_constants_js : imports
src_donation_queue_js --> src_cinematic_showcase_js : imports
src_donation_queue_js --> src_avatar_coordinator_js : imports
src_floor_slots_js --> src_club_environment_js : imports
src_foreground_slime_js --> src_slime_model_js : imports
src_live_event_handler_js --> src_graphics_settings_js : imports
src_live_event_handler_js --> src_avatar_manager_js : imports
src_live_event_handler_js --> src_gift_props_js : imports
src_live_event_handler_js --> src_cinematic_showcase_js : imports
src_live_event_handler_js --> src_equipment_config_js : imports
src_live_event_handler_js --> src_animation_constants_js : imports
src_live_event_handler_js --> src_donation_queue_js : imports
src_live_event_handler_js --> src_donation_constants_js : imports
src_main_js --> src_graphics_settings_js : imports
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
src_main_js --> src_minigame_manager_js : imports
src_minigame_constants_js --> src_avatar_manager_js : imports
src_minigame_fx_js --> src_minigame_constants_js : imports
src_minigame_manager_js --> src_avatar_manager_js : imports
src_minigame_tally_js --> src_minigame_constants_js : imports
src_minigame_ui_js --> src_minigame_constants_js : imports
src_scene_manager_js --> src_graphics_settings_js : imports
src_scene_manager_js --> src_cinematic_config_js : imports
src_slime_model_js --> src_graphics_settings_js : imports
src_slime_model_js --> src_graphics_constants_js : imports
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
gateway_index_js --> gateway_services_redis_client_js : imports
gateway_index_js --> gateway_services_command_throttler_js : imports
gateway_index_js --> gateway_services_like_aggregator_js : imports
gateway_index_js --> gateway_services_event_classifier_js : imports
gateway_index_js --> gateway_services_event_stream_producer_js : imports
gateway_index_js --> gateway_constants_gateway_constants_js : imports
gateway_index_js --> server_event_normalizer_js : imports
gateway_index_js --> server_tiktok_service_js : imports
gateway_services_command_throttler_js --> gateway_constants_gateway_constants_js : imports
gateway_services_event_classifier_js --> gateway_constants_gateway_constants_js : imports
gateway_services_event_stream_producer_js --> gateway_constants_gateway_constants_js : imports
gateway_services_like_aggregator_js --> gateway_constants_gateway_constants_js : imports
gateway_services_redis_client_js --> gateway_config_redis_config_js : imports
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
- [broadcast(payload)](file:///e:/game/bar_room/server/server.js#L65-L72): Serializes and broadcasts JSON message payloads to all currently connected WebSocket clients.
- [handleGetCooldown(req, res)](file:///e:/game/bar_room/server/server.js#L229-L240): Executes handleGetCooldown operation within server.js.
- [handleSetCooldown(req, res)](file:///e:/game/bar_room/server/server.js#L242-L262): Executes handleSetCooldown operation within server.js.
- [handleMockEvent(body)](file:///e:/game/bar_room/server/server.js#L268-L304): Executes handleMockEvent operation within server.js.

### server/services/load-monitor.js
- [constructor(redisClient, options = {})](file:///e:/game/bar_room/server/services/load-monitor.js#L6-L6): Executes constructor operation within load-monitor.js.
- [setCinematicActive(isActive, durationSec = null)](file:///e:/game/bar_room/server/services/load-monitor.js#L26-L45): Executes setCinematicActive operation within load-monitor.js.
- [calculateMultiplier(activeAvatars, queueDepth)](file:///e:/game/bar_room/server/services/load-monitor.js#L50-L67): Executes calculateMultiplier operation within load-monitor.js.
- [reportMetrics()](file:///e:/game/bar_room/server/services/load-monitor.js#L72-L100): Publishes backend load heartbeat (multiplier, queue depth, freeze state) to Redis.
- [start()](file:///e:/game/bar_room/server/services/load-monitor.js#L105-L112): Starts periodic 2-second heartbeat publication to Redis.
- [stop()](file:///e:/game/bar_room/server/services/load-monitor.js#L117-L126): Stops periodic load heartbeat publication.

### server/services/redis-stream-consumer.js
- [constructor(redisClient, options = {})](file:///e:/game/bar_room/server/services/redis-stream-consumer.js#L5-L5): Executes constructor operation within redis-stream-consumer.js.
- [start()](file:///e:/game/bar_room/server/services/redis-stream-consumer.js#L20-L24): Starts continuous long-polling loop consuming stream:live_events from Redis.
- [_pollLoop()](file:///e:/game/bar_room/server/services/redis-stream-consumer.js#L29-L74): Executes continuous XREAD BLOCK calls, extracting JSON payloads and invoking event callbacks.
- [stop()](file:///e:/game/bar_room/server/services/redis-stream-consumer.js#L79-L81): Halts the stream polling loop.

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
- [constructor()](file:///e:/game/bar_room/src/audio-system.js#L348-L360): Executes constructor operation within audio-system.js.
- [init()](file:///e:/game/bar_room/src/audio-system.js#L362-L379): Initializes Web Audio context, master gain node, and 3-band FFT analyser node upon first audio unlock.
- [unlockAudio()](file:///e:/game/bar_room/src/audio-system.js#L381-L390): Resumes the browser AudioContext from suspended state upon user interaction and starts the beat synthesizer.
- [getBands()](file:///e:/game/bar_room/src/audio-system.js#L392-L425): Reads current frequency data from the AnalyserNode and returns normalized energy and flux across 3 audio bands.
- [playSfx(name)](file:///e:/game/bar_room/src/audio-system.js#L427-L490): Procedurally synthesizes sound effects (coin clink, air horn, bass boom) with exponential clickless decay envelopes.
- [setVolume(val)](file:///e:/game/bar_room/src/audio-system.js#L492-L499): Adjusts the master gain volume level of the procedural beat engine or sound effects.
- [toggleMute()](file:///e:/game/bar_room/src/audio-system.js#L501-L507): Toggles audio master gain between muted and unmuted states.

### src/avatar-coordinator.js
- [getOrCreateAvatarMesh(userData, coins = 0, context)](file:///e:/game/bar_room/src/avatar-coordinator.js#L22-L116): Instantiates or retrieves a 3D Slime avatar mesh on dance floor or VIP platforms.
- [sinkAndRemoveAvatar(userId, context)](file:///e:/game/bar_room/src/avatar-coordinator.js#L121-L132): Executes sinkAndRemoveAvatar operation within avatar-coordinator.js.
- [deleteAvatar(userId, context)](file:///e:/game/bar_room/src/avatar-coordinator.js#L137-L178): Manually removes an avatar from the scene, tracking registry, and leaderboard, re-evaluating VIP assignments.
- [clearAllAvatars(context)](file:///e:/game/bar_room/src/avatar-coordinator.js#L183-L219): Disposes and removes all avatars from the 3D scene and resets the leaderboard.
- [syncActiveFloorAvatars(avatarMeshes, uiOverlay, ws)](file:///e:/game/bar_room/src/avatar-coordinator.js#L224-L243): Synchronizes active 3D avatar states with UI Overlay and WebSocket stream panels.
- [computeSharedDanceFrame(delta, time, bpmSpeed, frenzyMultiplier, bands, bpm = 128)](file:///e:/game/bar_room/src/avatar-coordinator.js#L260-L309): Executes computeSharedDanceFrame operation within avatar-coordinator.js.
- [_updateCyberSlime(mesh, data, delta, bands, sharedKinematics = null)](file:///e:/game/bar_room/src/avatar-coordinator.js#L315-L332): Updates procedural squash, stretch, and AI dance moves on modern CyberSlime controller.
- [_updateProceduralSlime(mesh, data, phase, isBouncing, time, delta)](file:///e:/game/bar_room/src/avatar-coordinator.js#L337-L374): Applies volume-preserving squash-stretch kinematics and eye blinks to procedural slime mesh.
- [_updateHumanoid(data, style, phase)](file:///e:/game/bar_room/src/avatar-coordinator.js#L379-L398): Applies procedural humanoid dance kinematics to limb and torso bones.
- [updateAvatarKinematics(mesh, delta, time, bpmSpeed, frenzyMultiplier, bands, camera, isFrenzy = false, sharedKinematics = null)](file:///e:/game/bar_room/src/avatar-coordinator.js#L403-L441): Coordinates per-frame animation, leap physics, smooth scaling, and camera-facing billboards for an avatar.
- [isAvatarIsolationActive()](file:///e:/game/bar_room/src/avatar-coordinator.js#L447-L449): Executes isAvatarIsolationActive operation within avatar-coordinator.js.
- [getCurrentHeroMesh()](file:///e:/game/bar_room/src/avatar-coordinator.js#L455-L457): Executes getCurrentHeroMesh operation within avatar-coordinator.js.
- [isolateDonationAvatar(heroMesh, avatarMeshes)](file:///e:/game/bar_room/src/avatar-coordinator.js#L466-L497): Executes isolateDonationAvatar operation within avatar-coordinator.js.
- [revealAvatarsForZoomOut(avatarMeshes, options = {})](file:///e:/game/bar_room/src/avatar-coordinator.js#L510-L510): Executes revealAvatarsForZoomOut operation within avatar-coordinator.js.

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
- [initCinematicShowcase(ctx = {})](file:///e:/game/bar_room/src/cinematic-showcase.js#L20-L20): Injects preview studio context (camera, activeAvatars, clearFloorEffects callback) into the showcase controller.
- [getScreenCoords(worldPos)](file:///e:/game/bar_room/src/cinematic-showcase.js#L24-L37): Projects 3D world coordinates onto 2D screen pixel coordinates for target-guided stage shrink animations.
- [generateSvgAvatar(name = 'Viewer')](file:///e:/game/bar_room/src/cinematic-showcase.js#L39-L60): Generates a fallback data-URI SVG circular monogram avatar with user initials.
- [enqueueHighTierShowcase(item)](file:///e:/game/bar_room/src/cinematic-showcase.js#L62-L67): Appends high-tier and ultra donations to the sequential FIFO showcase queue, starting playback if idle.
- [processNextHighTier()](file:///e:/game/bar_room/src/cinematic-showcase.js#L69-L100): Dequeues and triggers the next cinematic showcase in sequence, maintaining queue state.
- [runCinematic2DShowcase(item, onFinished)](file:///e:/game/bar_room/src/cinematic-showcase.js#L102-L400): Orchestrates the fullscreen cinematic overlay, backdrop blur, SVG ornaments, 2D particles, foreground 3D mascot, chibi badge, and safe termination.
- [cleanupShowcase()](file:///e:/game/bar_room/src/cinematic-showcase.js#L313-L372): Safely closes the cinematic overlay, unpauses background avatars, disposes active foreground props, and invokes completion callbacks.

### src/club-constants.js
- [count()](file:///e:/game/bar_room/src/club-constants.js#L33-L33): Executes count operation within club-constants.js.
- [clampSpotlightToFloor(target = { x: 0, y: 0, z: 0 })](file:///e:/game/bar_room/src/club-constants.js#L148-L148): Clamps moving spotlight target positions strictly within club dance floor boundaries.

### src/club-environment.js
- [freezeStaticTree(obj)](file:///e:/game/bar_room/src/club-environment.js#L58-L71): Executes freezeStaticTree operation within club-environment.js.
- [createHeartBubbleTexture()](file:///e:/game/bar_room/src/club-environment.js#L76-L132): Executes createHeartBubbleTexture operation within club-environment.js.
- [constructor(scene)](file:///e:/game/bar_room/src/club-environment.js#L135-L178): Executes constructor operation within club-environment.js.
- [init()](file:///e:/game/bar_room/src/club-environment.js#L180-L221): Coordinates setup of ambient lights, moving heads, lasers, VIP podium, DJ booth, and particle systems.
- [setMovingHeadLightsEnabled(enabled)](file:///e:/game/bar_room/src/club-environment.js#L223-L232): Executes setMovingHeadLightsEnabled operation within club-environment.js.
- [setMovingHeadConesEnabled(enabled)](file:///e:/game/bar_room/src/club-environment.js#L234-L242): Executes setMovingHeadConesEnabled operation within club-environment.js.
- [setLaserBeamsEnabled(enabled)](file:///e:/game/bar_room/src/club-environment.js#L244-L252): Executes setLaserBeamsEnabled operation within club-environment.js.
- [setUseGpuShaders(enabled)](file:///e:/game/bar_room/src/club-environment.js#L254-L268): Executes setUseGpuShaders operation within club-environment.js.
- [setStaticFloorEnabled(enabled)](file:///e:/game/bar_room/src/club-environment.js#L270-L291): Executes setStaticFloorEnabled operation within club-environment.js.
- [getSlimeMetrics(target)](file:///e:/game/bar_room/src/club-environment.js#L298-L334): Computes vertical apex, bounding radius, height, and root origin for dynamic relative cinematic animations.
- [getSlimeEffectiveRadius(targetAvatarOrOrigin)](file:///e:/game/bar_room/src/club-environment.js#L341-L352): Calculates boundary radius of slime avatar to avoid mesh clipping when spawning coin orbits.
- [createStarfield()](file:///e:/game/bar_room/src/club-environment.js#L357-L425): Generates a 3,000-star twinkling midnight sky background using Three.js Points.
- [createAccentLights()](file:///e:/game/bar_room/src/club-environment.js#L430-L462): Adds overhead spotlights for the DJ console and warm amber point lights for the bar lounge.
- [createLedFloor()](file:///e:/game/bar_room/src/club-environment.js#L468-L562): Constructs a 12x12 LED purple dance floor matrix with glowing white border frames in a single draw call using Three.js InstancedMesh.
- [getTileIndexAtPosition(pos)](file:///e:/game/bar_room/src/club-environment.js#L567-L579): Executes getTileIndexAtPosition operation within club-environment.js.
- [setSlotFloorColor(slotPos, targetColor = 'default')](file:///e:/game/bar_room/src/club-environment.js#L588-L590): Executes setSlotFloorColor operation within club-environment.js.
- [clearSlotFloorColors()](file:///e:/game/bar_room/src/club-environment.js#L592-L594): Executes clearSlotFloorColors operation within club-environment.js.
- [createVipPodium()](file:///e:/game/bar_room/src/club-environment.js#L606-L807): Builds an elevated circular VIP podium featuring a gold metallic rim and glowing neon glass stage top.
- [createDjBooth()](file:///e:/game/bar_room/src/club-environment.js#L813-L1009): Assembles the DJ table with spinning vinyl records, Pioneer-style mixer, and animated pink female chubby slime DJ mascot.
- [createWallsAndNeon()](file:///e:/game/bar_room/src/club-environment.js#L1014-L1040): Constructs club boundary walls, bar counters, and emissive neon club signage.
- [createMovingHeads()](file:///e:/game/bar_room/src/club-environment.js#L1045-L1100): Builds 4 dual-axis moving head spotlights that sweep light cones across the venue.
- [createLightBeams()](file:///e:/game/bar_room/src/club-environment.js#L1107-L1142): Initializes overhead cylindrical geometry and additive materials for high-tier white and ultra golden light beams.
- [triggerWhiteLightBeam(targetX = 0, targetZ = 0, duration = 2.5)](file:///e:/game/bar_room/src/club-environment.js#L1144-L1153): Activates overhead white spotlight beam effect for high-tier donations (500–5000 coins).
- [triggerGoldenLightBeam(targetX = 0, targetZ = 0, duration = 7.6)](file:///e:/game/bar_room/src/club-environment.js#L1155-L1164): Activates wide golden pillar of light beam for ultra luxury donations (>= 6000 coins).
- [focusSpotlights(categoryOrTier = 1, targetPosition = null, duration = null, avatarManager = null, userId = null)](file:///e:/game/bar_room/src/club-environment.js#L1173-L1245): Dynamically focuses venue spotlights onto donating VIP avatars based on donation tier (1, 2, 6, or 8 spotlights).
- [createLaserBeams()](file:///e:/game/bar_room/src/club-environment.js#L1250-L1268): Creates 6 additive-blended laser beam geometry cones fanning out from the ceiling rig.
- [createFireworksSystem()](file:///e:/game/bar_room/src/club-environment.js#L1273-L1308): Initializes a 6,000-particle single-buffer Points system for multi-tier fireworks bursts.
- [createFlyingHeartsSystem()](file:///e:/game/bar_room/src/club-environment.js#L1313-L1335): Initializes a single-buffer particle system for floating 3D hearts triggered by viewer likes.
- [triggerFireworks(tier = 1, origin = new THREE.Vector3(0, 1.2, 0))](file:///e:/game/bar_room/src/club-environment.js#L1337-L1378): Executes triggerFireworks operation within club-environment.js.
- [emitFlyingHearts(count = 10)](file:///e:/game/bar_room/src/club-environment.js#L1380-L1403): Spawns floating hearts that rise from the floor and sway upward upon viewer likes.
- [spawnHeartBubbles(origin = new THREE.Vector3(0, 0, 0), count = 4)](file:///e:/game/bar_room/src/club-environment.js#L1409-L1447): Executes spawnHeartBubbles operation within club-environment.js.
- [createDroppingCoinsSystem()](file:///e:/game/bar_room/src/club-environment.js#L1452-L1497): Executes createDroppingCoinsSystem operation within club-environment.js.
- [spawnSingleCoinInstance(origin, cfg = {})](file:///e:/game/bar_room/src/club-environment.js#L1502-L1502): Spawns a single 3D falling gold coin with randomized angular velocity and relative drop height.
- [spawnDroppingCoins(origin = new THREE.Vector3(0, 0, 0), count = 1, subType = 'drop_single', targetAvatar = null)](file:///e:/game/bar_room/src/club-environment.js#L1538-L1583): Spawns physics-based instanced 3D coins cascading and bouncing across the dance floor.
- [spawnOrbitingCoinRings(targetAvatarOrOrigin = new THREE.Vector3(0, 0, 0), coins = 20, duration = 2.0)](file:///e:/game/bar_room/src/club-environment.js#L1590-L1697): Spawns multi-level golden coin rings orbiting dynamically around the celebrating slime.
- [createShockwaveSystem()](file:///e:/game/bar_room/src/club-environment.js#L1702-L1704): Executes createShockwaveSystem operation within club-environment.js.
- [triggerShockwave(origin = new THREE.Vector3(0, 0, 0), category = 'high')](file:///e:/game/bar_room/src/club-environment.js#L1706-L1748): Spawns expanding circular shockwave ring on the dance floor.
- [createMythicCrownSystem()](file:///e:/game/bar_room/src/club-environment.js#L1753-L1806): Executes createMythicCrownSystem operation within club-environment.js.
- [triggerMythicCrown(origin = new THREE.Vector3(0, 0, 0), duration = 7.6)](file:///e:/game/bar_room/src/club-environment.js#L1808-L1817): Executes triggerMythicCrown operation within club-environment.js.
- [triggerGiftProp(giftKey, origin = new THREE.Vector3(0, 0, 0), coins = 1)](file:///e:/game/bar_room/src/club-environment.js#L1823-L1828): Executes triggerGiftProp operation within club-environment.js.
- [update(delta, bands = {}, camera = null)](file:///e:/game/bar_room/src/club-environment.js#L1830-L1830): Updates vinyl rotation, DJ mascot bobbing, moving head sweeps, laser strobes, floor tile colors, and particle physics each frame.

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
- [initDonationQueue(context = {})](file:///e:/game/bar_room/src/donation-queue.js#L20-L20): Executes initDonationQueue operation within donation-queue.js.
- [getDonationQueueLength()](file:///e:/game/bar_room/src/donation-queue.js#L27-L29): Executes getDonationQueueLength operation within donation-queue.js.
- [isDonationProcessing()](file:///e:/game/bar_room/src/donation-queue.js#L34-L36): Executes isDonationProcessing operation within donation-queue.js.
- [isDonationQueuePaused()](file:///e:/game/bar_room/src/donation-queue.js#L41-L43): Checks whether the donation celebration queue is currently paused.
- [pauseDonationQueue()](file:///e:/game/bar_room/src/donation-queue.js#L48-L50): Pauses the donation queue during high-priority minigame judgment sequences.
- [resumeDonationQueue()](file:///e:/game/bar_room/src/donation-queue.js#L55-L60): Resumes the donation queue after minigame judgment completes.
- [waitForDonationCompletion()](file:///e:/game/bar_room/src/donation-queue.js#L67-L74): Returns a promise that resolves when any active donation celebration finishes.
- [clearDonationQueue()](file:///e:/game/bar_room/src/donation-queue.js#L79-L87): Executes clearDonationQueue operation within donation-queue.js.
- [enqueueDonation(item)](file:///e:/game/bar_room/src/donation-queue.js#L94-L102): Executes enqueueDonation operation within donation-queue.js.
- [enqueueHighTierShowcase(item)](file:///e:/game/bar_room/src/donation-queue.js#L107-L117): Executes enqueueHighTierShowcase operation within donation-queue.js.
- [processNextDonation()](file:///e:/game/bar_room/src/donation-queue.js#L122-L280): Executes processNextDonation operation within donation-queue.js.
- [onTurnComplete()](file:///e:/game/bar_room/src/donation-queue.js#L168-L181): Executes onTurnComplete operation within donation-queue.js.
- [startEffectsAndHold()](file:///e:/game/bar_room/src/donation-queue.js#L189-L194): Executes startEffectsAndHold operation within donation-queue.js.
- [startEffectsAndHold()](file:///e:/game/bar_room/src/donation-queue.js#L211-L216): Executes startEffectsAndHold operation within donation-queue.js.
- [_executeSmallEffects(mesh, origin, coins, shouldUpgradeTier, newTier, context)](file:///e:/game/bar_room/src/donation-queue.js#L286-L321): Executes _executeSmallEffects operation within donation-queue.js.
- [_executeMediumEffects(mesh, origin, coins, shouldUpgradeTier, newTier, context)](file:///e:/game/bar_room/src/donation-queue.js#L327-L362): Executes _executeMediumEffects operation within donation-queue.js.

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

### src/graphics-settings.js
- [constructor(options = {})](file:///e:/game/bar_room/src/graphics-settings.js#L16-L16): Executes constructor operation within graphics-settings.js.
- [loadFromStorage()](file:///e:/game/bar_room/src/graphics-settings.js#L39-L76): Executes loadFromStorage operation within graphics-settings.js.
- [saveToStorage()](file:///e:/game/bar_room/src/graphics-settings.js#L81-L88): Executes saveToStorage operation within graphics-settings.js.
- [addListener(callback)](file:///e:/game/bar_room/src/graphics-settings.js#L93-L98): Executes addListener operation within graphics-settings.js.
- [notify(changedKey, value)](file:///e:/game/bar_room/src/graphics-settings.js#L103-L112): Executes notify operation within graphics-settings.js.
- [getSnapshot()](file:///e:/game/bar_room/src/graphics-settings.js#L117-L124): Executes getSnapshot operation within graphics-settings.js.
- [getEffectivePixelRatio()](file:///e:/game/bar_room/src/graphics-settings.js#L128-L136): Executes getEffectivePixelRatio operation within graphics-settings.js.
- [setPixelRatioKey(key)](file:///e:/game/bar_room/src/graphics-settings.js#L138-L143): Executes setPixelRatioKey operation within graphics-settings.js.
- [setEnableMovingHeadLights(enabled)](file:///e:/game/bar_room/src/graphics-settings.js#L145-L150): Executes setEnableMovingHeadLights operation within graphics-settings.js.
- [setEnableMovingHeadCones(enabled)](file:///e:/game/bar_room/src/graphics-settings.js#L152-L157): Executes setEnableMovingHeadCones operation within graphics-settings.js.
- [setEnableLaserBeams(enabled)](file:///e:/game/bar_room/src/graphics-settings.js#L159-L164): Executes setEnableLaserBeams operation within graphics-settings.js.
- [setBillboardCpuLookAt(enabled)](file:///e:/game/bar_room/src/graphics-settings.js#L166-L171): Executes setBillboardCpuLookAt operation within graphics-settings.js.
- [setUseGpuShaders(enabled)](file:///e:/game/bar_room/src/graphics-settings.js#L173-L178): Executes setUseGpuShaders operation within graphics-settings.js.
- [setStaticFloor(enabled)](file:///e:/game/bar_room/src/graphics-settings.js#L180-L185): Executes setStaticFloor operation within graphics-settings.js.
- [getTargetFps()](file:///e:/game/bar_room/src/graphics-settings.js#L187-L190): Executes getTargetFps operation within graphics-settings.js.
- [getFpsIntervalMs()](file:///e:/game/bar_room/src/graphics-settings.js#L192-L195): Executes getFpsIntervalMs operation within graphics-settings.js.
- [setFpsCapKey(key)](file:///e:/game/bar_room/src/graphics-settings.js#L197-L202): Executes setFpsCapKey operation within graphics-settings.js.
- [getSlimeShadingConfig()](file:///e:/game/bar_room/src/graphics-settings.js#L204-L206): Executes getSlimeShadingConfig operation within graphics-settings.js.
- [setSlimeShadingKey(key)](file:///e:/game/bar_room/src/graphics-settings.js#L208-L213): Executes setSlimeShadingKey operation within graphics-settings.js.
- [resetDefaults()](file:///e:/game/bar_room/src/graphics-settings.js#L218-L229): Executes resetDefaults operation within graphics-settings.js.

### src/live-event-handler.js
- [resolveGiftCategory(coins)](file:///e:/game/bar_room/src/live-event-handler.js#L19-L24): Categorizes incoming donation coin values into small, medium, high, or ultra celebration tiers.
- [calculateSlimeTier(totalCoins, isTop1 = undefined)](file:///e:/game/bar_room/src/live-event-handler.js#L32-L34): Calculates Slime visual evolution tier (1 to 5) based on cumulative coin contributions.
- [_handleChatCommands(comment, mesh, syncActiveFloorAvatars)](file:///e:/game/bar_room/src/live-event-handler.js#L43-L120): Parses and executes first matching chat command for slime color (!color with random fallback), dance mode (!dance 1/2/toggle), or face mode (!face smile/normal/wink with random fallback).
- [_triggerUltraCelebration(mesh, origin, giftKey, coins, shouldUpgradeTier, newTier, context, evt = {})](file:///e:/game/bar_room/src/live-event-handler.js#L126-L126): Triggers ultra luxury coronation celebration (>= 6000 coins) with camera tracking, fanfare, golden beam, and fireworks.
- [_triggerHighCelebration(mesh, origin, giftKey, coins, shouldUpgradeTier, newTier, context, evt = {})](file:///e:/game/bar_room/src/live-event-handler.js#L166-L166): Triggers high-tier VIP celebration (500-5000 coins) with VIP camera framing, white beam, and shockwave.
- [_triggerMediumCelebration(mesh, origin, giftKey, coins, shouldUpgradeTier, newTier, context)](file:///e:/game/bar_room/src/live-event-handler.js#L204-L236): Triggers medium donation celebration (20-499 coins) with bass boom SFX, spotlights, and orbiting coin rings.
- [_triggerSmallCelebration(mesh, origin, giftKey, coins, shouldUpgradeTier, newTier, context)](file:///e:/game/bar_room/src/live-event-handler.js#L241-L276): Triggers small donation celebration (1-19 coins) with coin clink SFX, bounce jump, and dropping coins.
- [_scheduleDeferredVipSwap(mesh, giftCategory, sortedDonors, executeVipPromotionAndSwap)](file:///e:/game/bar_room/src/live-event-handler.js#L281-L292): Defers bilateral VIP platform promotion until celebratory visual effects conclude.
- [handleLikeEvent(evt, context)](file:///e:/game/bar_room/src/live-event-handler.js#L297-L345): Emits flying 3D hearts and charges the stream hype meter upon incoming likes.
- [handleChatEvent(evt, context)](file:///e:/game/bar_room/src/live-event-handler.js#L350-L367): Processes chat comments, routes avatar commands, and increments stream hype.
- [handleGiftEvent(evt, context)](file:///e:/game/bar_room/src/live-event-handler.js#L372-L483): Processes gift donations, updates leaderboard, triggers in-place celebrations, and schedules VIP promotion.
- [handleAdminCommand(evt, context)](file:///e:/game/bar_room/src/live-event-handler.js#L488-L628): Applies administrative controls for camera presets, distance slider, chroma key, volume, and frenzy mode.
- [handleRoomRanksEvent(evt, context)](file:///e:/game/bar_room/src/live-event-handler.js#L635-L705): Executes handleRoomRanksEvent operation within live-event-handler.js.
- [handleSessionResetEvent(evt, context)](file:///e:/game/bar_room/src/live-event-handler.js#L710-L715): Executes handleSessionResetEvent operation within live-event-handler.js.
- [handleMemberEvent(evt, context)](file:///e:/game/bar_room/src/live-event-handler.js#L721-L737): Executes handleMemberEvent operation within live-event-handler.js.
- [handleFanEvent(evt, context)](file:///e:/game/bar_room/src/live-event-handler.js#L743-L760): Executes handleFanEvent operation within live-event-handler.js.
- [handleFollowEvent(evt, context)](file:///e:/game/bar_room/src/live-event-handler.js#L766-L786): Executes handleFollowEvent operation within live-event-handler.js.
- [handleLiveEvent(evt, context)](file:///e:/game/bar_room/src/live-event-handler.js#L794-L894): Central event router delegating normalized TikTok LIVE WebSocket payloads to specific event handlers.

### src/main.js
- [initClientApp()](file:///e:/game/bar_room/src/main.js#L98-L377): Initializes the 3D client application, network sockets, audio, and UI overlays.
- [onThresholdsUpdated(newThresholds)](file:///e:/game/bar_room/src/main.js#L237-L258): Executes onThresholdsUpdated operation within main.js.
- [animate(nowTimestamp)](file:///e:/game/bar_room/src/main.js#L290-L374): Main 60 FPS WebGL render loop driving audio analysis, lights, VIP scheduler, avatars, and camera.

### src/minigame-fx.js
- [syncRoomNeonDeathColor(clubEnvironment, colorHex, durationSec = 3.5)](file:///e:/game/bar_room/src/minigame-fx.js#L12-L64): Synchronizes venue neon signage, lasers, and spotlights to Death Color with continuous floor sweeping.
- [restoreRoomLighting(clubEnvironment)](file:///e:/game/bar_room/src/minigame-fx.js#L70-L119): Restores venue neon bar, spotlights, and laser beams back to standard club ambient colors.
- [triggerLaserStrikes(scene, targetMeshes, colorHex, durationMs = 2800, sceneManager = null)](file:///e:/game/bar_room/src/minigame-fx.js#L130-L205): Casts vertical neon laser strike pillars from the ceiling onto eliminated slimes.
- [anim()](file:///e:/game/bar_room/src/minigame-fx.js#L176-L202): Executes anim operation within minigame-fx.js.
- [applyGhostState(mesh)](file:///e:/game/bar_room/src/minigame-fx.js#L211-L248): Transforms an eliminated slime mesh into a translucent dancing ghost avatar.
- [revertGhostState(mesh)](file:///e:/game/bar_room/src/minigame-fx.js#L254-L279): Restores a ghost slime mesh back to its live material, opacity, and normal state.

### src/minigame-manager.js
- [constructor()](file:///e:/game/bar_room/src/minigame-manager.js#L40-L59): Initializes MinigameManager state machine, player maps, round timers, and context bindings.
- [init(context = {})](file:///e:/game/bar_room/src/minigame-manager.js#L65-L65): Injects application context (scene, meshes, lighting, environment, socket) into MinigameManager.
- [_getFloorMeshes()](file:///e:/game/bar_room/src/minigame-manager.js#L74-L83): Executes _getFloorMeshes operation within minigame-manager.js.
- [startScheduledGame(countdownSec = MINIGAME_CONFIG.defaultStartCountdownSec, roundDurationSec = this.roundDurationSec)](file:///e:/game/bar_room/src/minigame-manager.js#L90-L121): Initiates pre-game countdown timer leading into Round 1.
- [startGameImmediate(roundDurationSec = this.roundDurationSec)](file:///e:/game/bar_room/src/minigame-manager.js#L127-L140): Immediately begins Round 1 if minimum player count is met.
- [startRound(roundNum)](file:///e:/game/bar_room/src/minigame-manager.js#L146-L198): Begins a new survival round with fresh tie-break multipliers and voting countdown.
- [freezeCountdown()](file:///e:/game/bar_room/src/minigame-manager.js#L203-L206): Freezes minigame voting countdown during VIP donation showcases preventing timer loss.
- [unfreezeCountdown()](file:///e:/game/bar_room/src/minigame-manager.js#L211-L215): Unfreezes minigame voting countdown after VIP showcase concludes, resuming timer seamlessly.
- [populateActivePlayersFromFloor()](file:///e:/game/bar_room/src/minigame-manager.js#L220-L239): Registers live dance floor slimes into active round participants.
- [onVotingEnded()](file:///e:/game/bar_room/src/minigame-manager.js#L244-L267): Concludes voting phase, determines Death Color, pauses donations, and triggers laser judgment sequence.
- [executeJudgment(deathColor)](file:///e:/game/bar_room/src/minigame-manager.js#L273-L332): Executes executeJudgment operation within minigame-manager.js.
- [_handleOutcome(outcome)](file:///e:/game/bar_room/src/minigame-manager.js#L338-L376): Processes round outcome, advancing to next round or triggering winner celebration and automatic ghost revival.
- [handleChatCommand(userId, username, comment)](file:///e:/game/bar_room/src/minigame-manager.js#L384-L432): Processes viewer !color chat commands, rejecting ghost votes and non-voting states.
- [handleNewAvatarSpawn(userId, username, mesh)](file:///e:/game/bar_room/src/minigame-manager.js#L441-L462): Manages late joiners, auto-converting entrants into ghosts after Round 1 voting.
- [stopMinigame(keepGhostUntilNextGame = false)](file:///e:/game/bar_room/src/minigame-manager.js#L468-L489): Halts the minigame, restores venue lighting, resumes donation queue, and revives all ghosts.
- [reviveAllGhosts()](file:///e:/game/bar_room/src/minigame-manager.js#L494-L502): Revives all ghost slimes on the floor back to live dancing avatars.
- [handleAdminAction(action, payload = {})](file:///e:/game/bar_room/src/minigame-manager.js#L509-L509): Handles administrative minigame commands (start, stop, force judgment, revive ghosts, set config) from Port 3001.
- [_broadcastLiveStats()](file:///e:/game/bar_room/src/minigame-manager.js#L538-L541): Broadcasts live vote distribution to Admin cockpit and clients.
- [_broadcastState(extra = {})](file:///e:/game/bar_room/src/minigame-manager.js#L546-L546): Broadcasts synchronized minigame state machine packets over WebSocket.

### src/minigame-tally.js
- [generateRoundTiebreakWeights(range = MINIGAME_CONFIG.tiebreakWeightRange)](file:///e:/game/bar_room/src/minigame-tally.js#L10-L28): Generates micro-multiplier weights [1.001, 1.009] for each color to break vote ties.
- [calculateVoteScores(alivePlayers, weights)](file:///e:/game/bar_room/src/minigame-tally.js#L36-L79): Tallies active player color votes and multiplies by round weights to determine majority Death Color.
- [evaluateRoundOutcome(alivePlayers, deathColor)](file:///e:/game/bar_room/src/minigame-tally.js#L87-L157): Evaluates round results determining survivors, eliminated players, and game progression state (NEXT_ROUND, SOLO_WINNER, CO_CHAMPIONS, NO_WINNER).

### src/minigame-ui.js
- [initMinigameUI()](file:///e:/game/bar_room/src/minigame-ui.js#L10-L30): Executes initMinigameUI operation within minigame-ui.js.
- [updateCornerTiebreakBadge(weights, visible = true)](file:///e:/game/bar_room/src/minigame-ui.js#L38-L61): Updates the small glassmorphic corner badge displaying active round micro-multipliers.
- [showStartCountdownBanner(remainingSec)](file:///e:/game/bar_room/src/minigame-ui.js#L67-L85): Displays countdown HUD banner announcing upcoming minigame start.
- [showVotingBanner(roundNumber, remainingSec, totalSec)](file:///e:/game/bar_room/src/minigame-ui.js#L93-L112): Displays round voting countdown and minimal live vote tally HUD banner.
- [showMinimalTallyBanner(roundNumber, counts, deathColor)](file:///e:/game/bar_room/src/minigame-ui.js#L121-L144): Executes showMinimalTallyBanner operation within minigame-ui.js.
- [showJudgmentBanner(deathColor)](file:///e:/game/bar_room/src/minigame-ui.js#L150-L167): Displays Death Color judgment announcement and elimination notice.
- [showWinnerBanner(winners, isCoChampions = false)](file:///e:/game/bar_room/src/minigame-ui.js#L174-L190): Displays victorious champion celebration HUD banner for solo winner or co-champions.
- [showNoWinnerBanner()](file:///e:/game/bar_room/src/minigame-ui.js#L195-L208): Displays game over notice when all players are eliminated.
- [showWarningBanner(msg, autoHideMs = 3500)](file:///e:/game/bar_room/src/minigame-ui.js#L215-L235): Displays warning toast when room conditions are not met.
- [hideMinigameBanner()](file:///e:/game/bar_room/src/minigame-ui.js#L240-L243): Clears and hides all active minigame HUD marquee banners.

### src/preview-audio.js
- [getPreviewAudioCtx()](file:///e:/game/bar_room/src/preview-audio.js#L5-L13): Lazily initializes and resumes the Web Audio API AudioContext instance.
- [playPreviewSfx(type)](file:///e:/game/bar_room/src/preview-audio.js#L15-L127): Synthesizes procedural Web Audio sound effects (coin drop, bass boom, gold chime, sword clash, royal fanfare, heart swoosh).

### src/scene-manager.js
- [getOrbitCameraPosition(theta, phi = 0.85, radius = ORBIT_CONFIG.radius)](file:///e:/game/bar_room/src/scene-manager.js#L30-L39): Computes clamped spherical orbit coordinates keeping the camera within room boundaries and focused on the dance floor.
- [constructor(container)](file:///e:/game/bar_room/src/scene-manager.js#L43-L74): Executes constructor operation within scene-manager.js.
- [init()](file:///e:/game/bar_room/src/scene-manager.js#L76-L174): Configures renderer pixel ratio, shadow-free tone mapping, and window resize event listeners.
- [setCameraPreset(key, duration = null, customTarget = null)](file:///e:/game/bar_room/src/scene-manager.js#L176-L210): Smoothly transitions the camera position, focus target, and FOV to a designated camera preset.
- [setOrbitRadius(radius)](file:///e:/game/bar_room/src/scene-manager.js#L212-L216): Dynamically alters camera orbit radius around the dance floor.
- [setFov(fov)](file:///e:/game/bar_room/src/scene-manager.js#L218-L224): Adjusts camera vertical field-of-view with projection matrix update.
- [revertVipCamera()](file:///e:/game/bar_room/src/scene-manager.js#L226-L229): Reverts camera focus from VIP spotlight target back to the default overview preset.
- [toggleChromaKey()](file:///e:/game/bar_room/src/scene-manager.js#L231-L243): Switches the viewport background between standard club atmosphere and chroma key green for OBS streaming.
- [toggleAlpha()](file:///e:/game/bar_room/src/scene-manager.js#L245-L252): Toggles WebGL clear alpha between opaque black and transparent for OBS browser overlays.
- [onResize()](file:///e:/game/bar_room/src/scene-manager.js#L254-L260): Updates camera aspect ratio and renderer dimensions when the browser window or stream canvas resizes.
- [triggerCameraShake(intensity = 0.35, duration = 1.0)](file:///e:/game/bar_room/src/scene-manager.js#L262-L266): Adds procedural camera shake impact during high-tier and ultra donations.
- [startLionTracking(heroMesh, duration = 7.6)](file:///e:/game/bar_room/src/scene-manager.js#L268-L282): Dynamically frames and tracks the soaring hero avatar up to 4.2m in the sky with camera shake during Lion celebrations.
- [update(deltaTime = 0.016, bassPunch = 0)](file:///e:/game/bar_room/src/scene-manager.js#L284-L398): Lerps camera position and look-at target smoothly toward the active preset, pulsing orbit distance on bass hits.
- [getScreenCoords(worldPos)](file:///e:/game/bar_room/src/scene-manager.js#L406-L415): Executes getScreenCoords operation within scene-manager.js.
- [focusSlimeCinematic(slimePos, onArrived = null, duration = 1.0, avatarMesh = null)](file:///e:/game/bar_room/src/scene-manager.js#L430-L492): Executes focusSlimeCinematic operation within scene-manager.js.
- [revertFromCinematic()](file:///e:/game/bar_room/src/scene-manager.js#L497-L516): Executes revertFromCinematic operation within scene-manager.js.
- [startDonateShowcase(slimePos, onArrived = null, duration = 1.0)](file:///e:/game/bar_room/src/scene-manager.js#L518-L520): Executes startDonateShowcase operation within scene-manager.js.
- [endDonateShowcase()](file:///e:/game/bar_room/src/scene-manager.js#L522-L524): Executes endDonateShowcase operation within scene-manager.js.
- [focusDonationAvatar(avatarMesh, options = {}, onArrived = null)](file:///e:/game/bar_room/src/scene-manager.js#L534-L534): Executes focusDonationAvatar operation within scene-manager.js.
- [focusOnAvatar(avatarMesh, options = {})](file:///e:/game/bar_room/src/scene-manager.js#L611-L611): Focuses camera directly onto a selected Slime avatar with dynamic height framing and gentle 360-degree orbit rotation.
- [clearAvatarFocus()](file:///e:/game/bar_room/src/scene-manager.js#L636-L649): Clears active avatar focus tracking and smoothly restores previous camera preset.

### src/shaders/floor-shader.js
- [createGpuFloorMaterial(uniforms = {})](file:///e:/game/bar_room/src/shaders/floor-shader.js#L54-L54): Executes createGpuFloorMaterial operation within floor-shader.js.

### src/shaders/starfield-shader.js
- [createGpuStarfieldMaterial(size = 0.18)](file:///e:/game/bar_room/src/shaders/starfield-shader.js#L41-L54): Executes createGpuStarfieldMaterial operation within starfield-shader.js.

### src/slime-aura.js
- [createBubbleSpriteTexture()](file:///e:/game/bar_room/src/slime-aura.js#L12-L33): Creates procedural luminous round glow sprite texture for mini bubbles.
- [createSlimeAura()](file:///e:/game/bar_room/src/slime-aura.js#L52-L203): Builds and returns a modular 3-style rotating aura controller (Purple, Orange, Vivid Gold) with rising effervescent mini bubbles.
- [setAura(type)](file:///e:/game/bar_room/src/slime-aura.js#L141-L160): Executes setAura operation within slime-aura.js.
- [update(deltaTime)](file:///e:/game/bar_room/src/slime-aura.js#L162-L192): Executes update operation within slime-aura.js.
- [currentType()](file:///e:/game/bar_room/src/slime-aura.js#L200-L200): Executes currentType operation within slime-aura.js.
- [isVisible()](file:///e:/game/bar_room/src/slime-aura.js#L201-L201): Executes isVisible operation within slime-aura.js.

### src/slime-model.js
- [createBasicHalfSphereGeometry()](file:///e:/game/bar_room/src/slime-model.js#L40-L51): Generates Tier 1 classic half-sphere geometry with smooth flattened underside.
- [createChubbyMochiSlimeGeometry()](file:///e:/game/bar_room/src/slime-model.js#L58-L92): Generates Tier 2 chubby mochi teardrop slime geometry with wider base and organic taper.
- [createSlimeMaterialByConfig(paletteKey, shadingKey = graphicsSettings.settings.slimeShadingKey)](file:///e:/game/bar_room/src/slime-model.js#L113-L150): Executes createSlimeMaterialByConfig operation within slime-model.js.
- [getClonedSlimeMaterial(paletteKey)](file:///e:/game/bar_room/src/slime-model.js#L152-L154): Executes getClonedSlimeMaterial operation within slime-model.js.
- [sharedMiniSlimeGeom(()](file:///e:/game/bar_room/src/slime-model.js#L167-L176): Instantiates shared mini-slime companion pet mesh geometry.
- [sharedHornGeom(()](file:///e:/game/bar_room/src/slime-model.js#L191-L196): Instantiates shared evolutionary head horn accessory geometry.
- [sharedTailSegmentGeom(()](file:///e:/game/bar_room/src/slime-model.js#L198-L203): Instantiates shared articulated tail segment accessory geometry.
- [sharedTailTipGeom(()](file:///e:/game/bar_room/src/slime-model.js#L205-L211): Instantiates shared tapered tail tip mesh geometry.
- [sharedSideMochiGeom(()](file:///e:/game/bar_room/src/slime-model.js#L214-L220): Instantiates shared side cheek mochi puff geometry.
- [createBillboardSprite(userData = {})](file:///e:/game/bar_room/src/slime-model.js#L243-L243): Builds high-contrast overhead user badge with sharp contrast (#ffffff text), VIP avatar border, level, and rank tags.
- [redraw(img = null)](file:///e:/game/bar_room/src/slime-model.js#L267-L461): Redraws billboard canvas texture with current viewer level, coins, and ranking tags.
- [drawBorderRing(radius, borderCfg)](file:///e:/game/bar_room/src/slime-model.js#L330-L340): Executes drawBorderRing operation within slime-model.js.
- [createCyberSlime(paletteKey = 'cyan', rawUserData = {})](file:///e:/game/bar_room/src/slime-model.js#L506-L506): Instantiates complete Slime mesh hierarchy with dual-mesh body, blushing cheeks, permanent Gold halo and aura ring, 3D animated eyes, horns, and wings.
- [create3DEye(isLeft = true)](file:///e:/game/bar_room/src/slime-model.js#L550-L576): Builds 3D chibi eye mesh hierarchy with glossy cornea sphere and specular reflective highlights.
- [setLabelVisible(visible)](file:///e:/game/bar_room/src/slime-model.js#L991-L993): Toggles visibility of the 3D billboard sprite above the slime.
- [setBillboardScale(scale = 1.0)](file:///e:/game/bar_room/src/slime-model.js#L994-L1000): Scales the 3D overhead billboard sprite proportionally with bottom-anchored expansion.
- [setTikTokLevel(lvl)](file:///e:/game/bar_room/src/slime-model.js#L1001-L1007): Sets the TikTok badge level on the billboard.
- [setDonateRank(rank)](file:///e:/game/bar_room/src/slime-model.js#L1008-L1014): Sets the donor rank title (e.g., TOP 1) on the billboard.
- [setFanStatus(isFan = true)](file:///e:/game/bar_room/src/slime-model.js#L1015-L1021): Executes setFanStatus operation within slime-model.js.
- [setFollowerStatus(isFollower = true)](file:///e:/game/bar_room/src/slime-model.js#L1022-L1028): Executes setFollowerStatus operation within slime-model.js.
- [updateBillboard(coinsToAdd = 0, newLevel = null, newRank = null)](file:///e:/game/bar_room/src/slime-model.js#L1029-L1055): Redraws the 2D canvas texture for the billboard sprite with updated coins, level, and rank.
- [setFootRings(level = 0)](file:///e:/game/bar_room/src/slime-model.js#L1104-L1112): Executes setFootRings operation within slime-model.js.
- [setBodyAura(typeOrBool = false)](file:///e:/game/bar_room/src/slime-model.js#L1114-L1123): Executes setBodyAura operation within slime-model.js.
- [setPalette(newKey)](file:///e:/game/bar_room/src/slime-model.js#L1125-L1163): Switches avatar body palette among cyan, pink, and lime while preserving permanent Gold halo and foot ring.
- [setShadingModel(shadingKey)](file:///e:/game/bar_room/src/slime-model.js#L1165-L1203): Executes setShadingModel operation within slime-model.js.
- [setGender(gender)](file:///e:/game/bar_room/src/slime-model.js#L1205-L1210): Sets slime gender presentation accessories (e.g., cute bow for female slimes).
- [setTier(tierNum)](file:///e:/game/bar_room/src/slime-model.js#L1220-L1280): Updates slime evolutionary visual tier (1 to 5) with corresponding horns, tail, wings, and mini-slimes.
- [setExpression(exp)](file:///e:/game/bar_room/src/slime-model.js#L1282-L1294): Updates 3D chibi eye scale and mouth expression (smile, normal, wink, happy, squint).
- [setDanceMode(mode = null)](file:///e:/game/bar_room/src/slime-model.js#L1296-L1311): Sets or toggles CyberSlime dance mode (1: continuous body spin around Z-axis while keeping billboard upright, 2: default rhythmic bounce).
- [setPaused(paused)](file:///e:/game/bar_room/src/slime-model.js#L1313-L1327): Pauses or resumes slime breathing/dancing animations and resets expression state.
- [triggerDanceMove(moveType)](file:///e:/game/bar_room/src/slime-model.js#L1335-L1368): Dispatches tier-differentiated dance moves (spin for Tier 3+, flip for Tier 4-5).
- [triggerLikeJump()](file:///e:/game/bar_room/src/slime-model.js#L1370-L1378): Triggers single celebratory jump and smile expression on like event using central LIKE_JUMP_CONFIG.
- [triggerSink(onComplete = null)](file:///e:/game/bar_room/src/slime-model.js#L1380-L1389): Executes triggerSink operation within slime-model.js.
- [shuffleDanceMove()](file:///e:/game/bar_room/src/slime-model.js#L1391-L1409): Randomly triggers tier-appropriate flourish actions (spin or flip) with randomized directions and expressions.
- [setAutoDanceRoutine(enabled)](file:///e:/game/bar_room/src/slime-model.js#L1411-L1417): Toggles automated periodic dance routines for autonomous slime behavior.
- [triggerDonateAnimation(typeOrConfig = 'small', upgradeTier = false, targetTier = 1, coins = 1)](file:///e:/game/bar_room/src/slime-model.js#L1435-L1571): Triggers categorized donation celebration animation reading jump counts, durations and apex heights from DONATE_CELEBRATION_CONFIG.
- [triggerLionCelebration(upgradeTier = false)](file:///e:/game/bar_room/src/slime-model.js#L1573-L1582): Initiates ultra luxury celebration coronation sequence with golden beam and restored open eyes upon completion.
- [update(deltaTime, audioKick = 0, sharedKinematics = null)](file:///e:/game/bar_room/src/slime-model.js#L1584-L2168): Per-frame animation loop evaluating physics-driven slime dancing, breathing, audio kick bouncing, and eyelids.

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

### gateway/config/redis.config.js
- [getRedisConfig(customUrl = null)](file:///e:/game/bar_room/gateway/config/redis.config.js#L3-L15): Executes getRedisConfig operation within redis.config.js.
- [retryStrategy(times)](file:///e:/game/bar_room/gateway/config/redis.config.js#L7-L10): Executes retryStrategy operation within redis.config.js.

### gateway/index.js
- [processRawEvent(type, rawData)](file:///e:/game/bar_room/gateway/index.js#L36-L71): Executes processRawEvent operation within index.js.
- [shutdown(signal)](file:///e:/game/bar_room/gateway/index.js#L120-L127): Executes shutdown operation within index.js.

### gateway/services/command-throttler.js
- [constructor(redisClient, options = {})](file:///e:/game/bar_room/gateway/services/command-throttler.js#L5-L5): Executes constructor operation within command-throttler.js.
- [isInteractiveCommand(comment)](file:///e:/game/bar_room/gateway/services/command-throttler.js#L26-L32): Checks if comment text is a targeted 3D interactive command (!color, !face, !dance).
- [setBaseCooldown(sec)](file:///e:/game/bar_room/gateway/services/command-throttler.js#L37-L50): Sets base cooldown dynamically (1s-120s) and persists it to Redis config:command_cooldown_sec.
- [getBaseCooldown()](file:///e:/game/bar_room/gateway/services/command-throttler.js#L55-L66): Reads configured base cooldown from Redis or in-memory cache.
- [getBackendMetrics()](file:///e:/game/bar_room/gateway/services/command-throttler.js#L71-L116): Refreshes backend load metrics and configured cooldown from Redis with a 500ms in-memory cache.
- [canExecute(userId, comment)](file:///e:/game/bar_room/gateway/services/command-throttler.js#L122-L169): Checks and consumes per-user atomic cooldown in Redis; blocks commands immediately if backend is in Freeze State.
- [resetUser(userId)](file:///e:/game/bar_room/gateway/services/command-throttler.js#L174-L177): Resets cooldown key for a specific user.

### gateway/services/event-classifier.js
- [classify(event)](file:///e:/game/bar_room/gateway/services/event-classifier.js#L10-L42): Executes classify operation within event-classifier.js.

### gateway/services/event-stream-producer.js
- [constructor(redisClient, options = {})](file:///e:/game/bar_room/gateway/services/event-stream-producer.js#L5-L5): Executes constructor operation within event-stream-producer.js.
- [publish(event)](file:///e:/game/bar_room/gateway/services/event-stream-producer.js#L17-L38): Publishes normalized TikTok events to Redis Stream stream:live_events with MAXLEN trimming.

### gateway/services/like-aggregator.js
- [constructor(options = {})](file:///e:/game/bar_room/gateway/services/like-aggregator.js#L5-L5): Executes constructor operation within like-aggregator.js.
- [addLike(event)](file:///e:/game/bar_room/gateway/services/like-aggregator.js#L17-L29): Executes addLike operation within like-aggregator.js.
- [flush()](file:///e:/game/bar_room/gateway/services/like-aggregator.js#L34-L61): Executes flush operation within like-aggregator.js.
- [reset()](file:///e:/game/bar_room/gateway/services/like-aggregator.js#L66-L73): Executes reset operation within like-aggregator.js.

### gateway/services/redis-client.js
- [getRedisClient(customUrl = null)](file:///e:/game/bar_room/gateway/services/redis-client.js#L7-L25): Executes getRedisClient operation within redis-client.js.
- [closeRedisClient()](file:///e:/game/bar_room/gateway/services/redis-client.js#L27-L36): Executes closeRedisClient operation within redis-client.js.
