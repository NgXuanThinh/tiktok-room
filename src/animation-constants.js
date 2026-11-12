// src/animation-constants.js - Central configuration for likes, donation jumps & physics coin drops

/**
 * CẤU HÌNH KHI NGƯỜI XEM THẢ LIKE (THẢ TIM)
 */
export const LIKE_JUMP_CONFIG = {
  jumpCount: 1,             // Slime nhảy 1 lần khi like
  duration: 0.75,           // Thời gian 1 lần nhảy (giây)
  apexHeight: 2.5,         // Chiều cao nhảy tối đa (mét)
  bubbleCountMin: 4,        // Số bong bóng tim tối thiểu
  bubbleCountMax: 16        // Số bong bóng tim tối đa
};

/**
 * CẤU HÌNH KHI NGƯỜI XEM DONATE (TẶNG QUÀ CÁC MỨC XU)
 */
export const DONATE_CELEBRATION_CONFIG = {
  // Tặng 1 xu (Hoa hồng, Bắn tim,...)
  coin1: {
    coins: 1,
    subType: 'drop_single',
    jumpCount: 1,           // Nhảy 1 lần duy nhất
    duration: 1.5,          // Thời gian hoàn thành: 1.0s
    apexHeight: 4,        // Chiều cao đỉnh nhảy (mét)
    coinsDropped: 3         // Số đồng xu 3D rơi xuống sàn: 1 xu
  },

  // Tặng 2 đến 9 xu (Ví dụ: 5 xu)
  coin5: {
    coins: 5,
    subType: 'drop_cascade',
    jumpCount: 3,           // Nhảy liên tiếp 3 lần đàn hồi
    duration: 2.0,          // Thời gian hoàn thành: 2.0s
    apexHeight: 4,        // Chiều cao đỉnh nhảy (mét)
    coinsDropped: 7         // Số đồng xu 3D rơi xuống sàn: 5 xu
  },

  // Tặng 10 đến 19 xu
  coin10: {
    coins: 10,
    subType: 'drop_burst',
    jumpCount: 3,           // Nhảy vút 1 lần
    duration: 2.0,          // Thời gian hoàn thành: 2.0s
    apexHeight: 4.2,        // Chiều cao đỉnh nhảy (mét)
    coinsDropped: 15        // Số đồng xu 3D rơi xuống sàn: 10 xu
  },

  // Quà trung bình (20 đến 499 xu)
  medium: {
    orbitNarrow: { duration: 2.0, apexHeight: 4.8, subType: 'orbit_narrow' },
    orbitDouble: { duration: 3.0, apexHeight: 4.8, subType: 'orbit_double' },
    orbitTriple: { duration: 3.5, apexHeight: 4.8, subType: 'orbit_triple' }
  }
};
