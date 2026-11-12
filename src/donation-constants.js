// src/donation-constants.js - Central configuration for Sequential Donation Queue & Camera Zoom Durations

/**
 * CẤU HÌNH CAMERA ZOOM THEO TỪNG CẤP ĐỘ DONATE
 * - Nhỏ: Giữ camera zoom xem hiệu ứng trong 1.0s
 * - Trung: Giữ camera zoom xem hiệu ứng trong 2.0s
 * - Cao cấp & Xa xỉ: Giữ nguyên thời lượng showcase
 */
export const DONATION_CAMERA_CONFIG = {
  small: {
    duration: 1.0,           // Thời gian giữ camera xem hiệu ứng: ĐÚNG 1.0s
    distance: 5,           // Khoảng cách camera tới Slime
    elevation: 2,         // Độ cao nâng camera
    fov: 54,                 // Trường nhìn ống kính
    lookOffsetY: 2        // Điểm nhìn hướng vào thân trên và bảng tên
  },
  medium: {
    duration: 2.0,           // Thời gian giữ camera xem hiệu ứng: ĐÚNG 2.0s
    distance: 12,           // Khoảng cách camera tới Slime
    elevation: 1,         // Độ cao nâng camera
    fov: 54,                 // Trường nhìn ống kính
    lookOffsetY: 2        // Điểm nhìn hướng vào thân trên
  },
  high: {
    duration: 4.5,           // Showcase toàn màn hình giữ nguyên (~4.5s)
    fov: 56
  },
  ultra: {
    duration: 5.8,           // Showcase toàn màn hình giữ nguyên (~5.8s - 7.6s)
    fov: 56
  }
};

/**
 * CẤU HÌNH ĐIỀU PHỐI HÀNG ĐỢI TUẦN TỰ (FIFO) & CHU TRÌNH 3 GIAI ĐOẠN (ZOOM IN -> EFFECT -> ZOOM OUT)
 */
export const DONATION_QUEUE_CONFIG = {
  zoomInTravelTimeSec: 0.45, // Thời gian camera lướt tới Slime trước khi nổ hiệu ứng (giây)
  interItemDelayMs: 150,     // Độ trễ chuyển tiếp giữa 2 lượt donate liên tiếp (ms)
  autoRevertDelayMs: 200,    // Độ trễ trả camera về toàn cảnh khi hết hàng đợi (ms)
  maxQueueSize: 100          // Ngưỡng tối đa cho hàng đợi FIFO
};
