// gateway/constants/gateway.constants.js - Nguồn sự thật duy nhất cho toàn bộ Gateway

export const COMMAND_CONFIG = Object.freeze({
  SUPPORTED: ['!color', '!face', '!dance'],
  BASE_COOLDOWN_SEC: 10,            // Thời gian cooldown cơ bản mặc định
  MIN_COOLDOWN_SEC: 1,              // Giới hạn cooldown thấp nhất có thể cấu hình (1s)
  MAX_COOLDOWN_SEC: 120,            // Giới hạn cooldown cao nhất có thể cấu hình (120s)
  DEFAULT_COLOR: 'green',
  CANONICAL_COLORS: ['green', 'red', 'blue'],
  FACE_MODES: ['smile', 'normal', 'wink'],
  DANCE_MODES: ['1', '2', 'spin', 'default']
});

export const REDIS_KEYS = Object.freeze({
  USER_COOLDOWN_PREFIX: 'cooldown:user:',          // cooldown:user:<userId>
  BACKEND_LOAD_METRICS: 'backend:load:metrics',    // Hash/String lưu heartbeat tải từ backend
  COMMAND_COOLDOWN_SEC: 'config:command_cooldown_sec', // Cấu hình thời gian cooldown từ Admin
  EVENT_STREAM: 'stream:live_events',              // Stream chuyển tiếp event vào backend
  HEARTBEAT_TTL_SEC: 5                             // Thời gian sống của key heartbeat
});

export const STREAM_CONFIG = Object.freeze({
  MAX_LEN: 100,                                 // Giới hạn tối đa 100 sự kiện trong Stream
  MAX_LEN_APPROXIMATE: true,                    // Dùng cờ ~ để Redis tối ưu hiệu năng bộ nhớ
  STREAM_BLOCK_MS: 2000,                        // Thời gian chờ long-polling (XREAD BLOCK)
  BATCH_SIZE: 10                                // Số lượng message kéo mỗi lượt
});

export const LOAD_THRESHOLDS = Object.freeze({
  IDLE_AVATARS: 15,
  HIGH_AVATARS: 40,
  IDLE_QUEUE_DEPTH: 5,
  HIGH_QUEUE_DEPTH: 20,
  MULTIPLIERS: {
    IDLE: 1.0,
    NORMAL: 1.3,
    HIGH: 2.0,
    OVERLOAD: 3.0
  }
});

export const COMBO_CONFIG = Object.freeze({
  WINDOW_MS: 500,                               // Cửa sổ gom like (500ms)
  DRAIN_RATE_HZ: 60,                            // Tần số xả queue
  DRAIN_INTERVAL_MS: 16                         // ~16ms (tương ứng 60Hz)
});

export const PRIORITY_TIERS = Object.freeze({
  P0_VIP_GIFT: 'p0_vip_gift',                   // Quà >= 100 xu hoặc Tier >= 2 (Bypass 100%)
  P1_LIKE_COMBO: 'p1_like_combo',               // Like tap (Gom combo)
  P2_CHAT_COMMAND: 'p2_chat_command',           // Lệnh avatar (Chịu rate-limit)
  VIP_COIN_THRESHOLD: 100,                      // Ngưỡng xu xác định VIP bypass
  VIP_MIN_TIER: 2                               // Tier nhỏ nhất được bypass ngay lập tức
});
