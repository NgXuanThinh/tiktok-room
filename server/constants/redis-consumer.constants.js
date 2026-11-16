// server/constants/redis-consumer.constants.js - Hằng số cho Consumer & Load Monitor phía Backend

export const CONSUMER_CONFIG = Object.freeze({
  CONSUMER_GROUP: 'bar_room_backend_group',
  CONSUMER_NAME: 'backend_worker_1',
  POLL_INTERVAL_MS: 50,                         // Chu kỳ đọc stream nếu không dùng block
  RETRY_BACKOFF_MS: 1000
});

export const LOAD_MONITOR_CONFIG = Object.freeze({
  HEARTBEAT_INTERVAL_MS: 1000,                  // Bắn metric lên Redis mỗi 1 giây
  MAX_HEALTHY_QUEUE: 50,
  CINEMATIC_FREEZE_HOLD_SEC: 8                  // Thời gian fallback nếu mất tín hiệu unfreeze
});
