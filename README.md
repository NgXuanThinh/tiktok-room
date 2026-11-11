# 🪩 TikTok LIVE 3D Interactive Nightclub Bar

Ứng dụng sân khấu Bar & Sàn Nhảy 3D tương tác thời gian thực dành cho **TikTok LIVE Stream** (OBS Overlay / TikTok Live Studio) xây dựng bằng **Node.js, WebGL (Three.js), WebSocket và Web Audio API**.

Người xem khi tham gia phòng live sẽ được hóa thân thành các chú **Slime 3D** ngộ nghĩnh, nhún nhảy theo nhịp nhạc EDM, tương tác chat đổi màu/biểu cảm, thả tim nhảy cao và donate quà tặng để kích hoạt các hoạt cảnh kỹ xảo 3D hoành tráng (Vũ trụ TikTok, Sư tử gầm, Ngựa thần Pegasus, Báo đốm,...).

---

## 📑 Mục Lục
1. [Tính Năng Nổi Bật](#-tính-năng-nổi-bật)
2. [Cài Đặt & Khởi Chạy](#-cài-đặt--khởi-chạy)
   - [Cách 1: Sử dụng Docker (Khuyên dùng)](#cách-1-sử-dụng-docker-khuyên-dùng)
   - [Cách 2: Chạy trực tiếp với Node.js](#cách-2-chạy-trực-tiếp-với-nodejs)
3. [Cổng Dịch Vụ (Port Mapping)](#-cổng-dịch-vụ-port-mapping)
4. [Hướng Dẫn Kết Nối TikTok LIVE](#-hướng-dẫn-kết-nối-tiktok-live)
5. [Hướng Dẫn Sử Dụng Admin Panel](#-hướng-dẫn-sử-dụng-admin-panel)
   - [1. Điều khiển TikTok LIVE & Góc Máy Camera](#1-điều-khiển-tiktok-live--góc-máy-camera)
   - [2. Quản lý Avatar & Mô phỏng Người Xem](#2-quản-lý-avatar--mô-phỏng-người-xem)
   - [3. Mô phỏng Quà Tặng (Donate Gift Testing)](#3-mô-phỏng-quà-tặng-donate-gift-testing)
   - [4. Cấu hình Ngưỡng Coin & Tiến Hóa Trang Bị](#4-cấu-hình-ngưỡng-coin--tiến-hóa-trang-bị)
   - [5. Bảng Điều Khiển Giám Sát Thời Gian Thực (Logs)](#5-bảng-điều-khiển-giám-sát-thời-gian-thực-logs)
6. [Lệnh Chat Dành Cho Người Xem (Chat Commands)](#-lệnh-chat-dành-cho-người-xem-chat-commands)
7. [Tùy Chỉnh Tỉ Lệ Bảng Tên Billboard (PILL_SCALE)](#-tùy-chỉnh-tỉ-lệ-bảng-tên-billboard-pill_scale)
8. [Tích Hợp OBS Studio / TikTok LIVE Studio](#-tích-hợp-obs-studio--tiktok-live-studio)
9. [Kiểm Thử & Đảm Bảo Chất Lượng (QA Tests)](#-kiểm-thử--đảm-bảo-chất-lượng-qa-tests)

---

## ✨ Tính Năng Nổi Bật

- **3D Procedural Cyber Slimes**: Slime 3D đàn hồi (Squash & Stretch) nhún nhảy tự nhiên theo nhịp beat EDM và phản hồi theo âm kick của DJ.
- **Bục Vinh Danh Bilateral VIP Lounge**: Bục Trái Hoàng Kim (`👑 TOP 1`) và Bục Phải Bạch Kim (`🥈 TOP 2`) tự động hoán đổi chỗ bằng quỹ đạo nhảy parabol mượt mà khi người xem donate soán ngôi.
- **Hệ Thống Tiến Hóa Slime & Trang Bị Nghiêm Ngặt**:
  - **Tiers 1 - 4**: Tự động mở khóa các phụ kiện (Chubby Mochi, Má phúng phính, Sừng & Đuôi rồng) dựa trên tổng số coin tích lũy.
  - **Tier 5 (VIP Max)**: Trang bị Vòng Hào Quang Thiên Thần (*Celestial Halo*) kết hợp Hào quang Vàng Mythic và Vòng chân hoàng gia. **Chỉ duy nhất TOP 1 donate** đạt hoặc vượt ngưỡng coin cấu hình mới được mở khóa Tier 5.
- **Hệ Thống 3 Vòng Chân (Foot Rings)**: Tương ứng Trắng $\to$ Vàng $\to$ Cam bám sát sàn nhảy.
- **Hệ Thống 3 Hào Quang Thân (Body Auras)**: Xoay tròn quang phổ Tím $\to$ Cam $\to$ Vàng lấp lánh bong bóng.
- **3D Billboard Overhead**: Bảng thông tin người xem sắc nét trên đầu mỗi slime, bao gồm ảnh đại diện TikTok, tên hiển thị, level TikTok (`Lv.XX`), huy hiệu Fan cứng (`💜 Fan`), Follower (`➕ Follower`) và danh hiệu VIP (`👑 TOP 1`, `🥈 TOP 2`, `🥉 TOP 3`, `💎 VIP`).
- **3D Gift Props & Cinematic Showcase**: Kích hoạt hiệu ứng trình diễn 3D đặc trưng toàn màn hình cho các món quà khủng (Vũ trụ TikTok, Phượng hoàng lửa, Sư tử gầm, Máy bay phản lực,...).
- **Phản Hồi Like (Thả Tim)**: Khi người xem bấm like, slime tương ứng sẽ nhảy cẫng lên và bắn ra chùm bong bóng trái tim đỏ bay lơ lửng.

---

## 🚀 Cài Đặt & Khởi Chạy

### Cách 1: Sử dụng Docker (Khuyên dùng)

Đảm bảo máy đã cài đặt **Docker** và **Docker Compose**.

1. Mở terminal tại thư mục dự án:
   ```bash
   cd e:/game/bar_room
   ```

2. Khởi chạy toàn bộ hệ thống bằng Docker Compose:
   ```bash
   docker compose up --build -d
   ```

3. Kiểm tra trạng thái các container:
   ```bash
   docker ps
   ```
   Bạn sẽ thấy 2 container đang hoạt động:
   - `tiktok-live-bar` (chạy trên cổng `3000` và `3001`).
   - `tiktok-preview` (chạy trên cổng `5175`).

4. Để dừng ứng dụng:
   ```bash
   docker compose down
   ```

---

### Cách 2: Chạy trực tiếp với Node.js

Yêu cầu cài đặt **Node.js (phiên bản 18+ hoặc 20+)**.

1. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```

2. Khởi chạy ứng dụng máy chủ chính:
   ```bash
   npm run dev
   # hoặc: node server/server.js
   ```

3. Khởi chạy môi trường Preview Sandbox (nếu cần thử nghiệm 3D độc lập):
   ```bash
   npm run preview:slime
   ```

---

## 🌐 Cổng Dịch Vụ (Port Mapping)

| Cổng (Port) | Dịch Vụ | Đường Dẫn Truy Cập | Mục Đích Sử Dụng |
| :--- | :--- | :--- | :--- |
| **`3000`** | **Main 3D Live Bar** | `http://localhost:3000` | Màn hình sàn bar chính để đưa vào OBS làm Browser Source livestream. |
| **`3001`** | **Admin Cockpit** | `http://localhost:3001` | Bảng điều khiển quản trị, kết nối kênh TikTok LIVE, camera, giả lập event và cấu hình ngưỡng coin. |
| **`5175`** | **Preview Sandbox** | `http://localhost:5175` | Môi trường phòng thí nghiệm xem trước hình mẫu 3D Slime, thử màu, biểu cảm và trang phục. |

---

## 🔴 Hướng Dẫn Kết Nối TikTok LIVE

1. Mở trình duyệt và truy cập **Admin Panel** tại: `http://localhost:3001` (hoặc `http://localhost:3000/admin`).
2. Tại mục **"1. TikTok LIVE & Camera Angles"**:
   - Nhập ID kênh TikTok đang phát trực tiếp vào ô input (ví dụ: `@throwthi` hoặc `throwthi`).
   - Nhấn nút **Connect**.
3. Quan sát mục **Live Stream Logs** ở dưới cùng:
   - Khi hiện `[TikTokLive] Connected to room`, hệ thống đã kết nối thành công.
   - Khi có người xem tham gia, tặng quà, like hoặc chat, các slime sẽ tự động xuất hiện và tương tác trên sàn 3D.
4. **Nút Refresh Sàn**:
   - Nhấn nút **Refresh Sàn** khi cần dọn dẹp sàn nhảy, đặt lại danh sách người xem mà vẫn giữ lại Top VIP đã donate.

---

## 🛠️ Hướng Dẫn Sử Dụng Admin Panel

Admin Panel tại `http://localhost:3001` được chia làm 5 khu vực điều khiển chuyên dụng:

### 1. Điều khiển TikTok LIVE & Góc Máy Camera
- **Kết Nối / Ngắt Kết Nối**: Điều khiển session livestream TikTok theo thời gian thực.
- **Preset Camera**:
  - `1. Orbit`: Camera tự động xoay vòng 360 độ quanh sàn nhảy ngắm toàn cảnh bar.
  - `2. DJ Front`: Góc nhìn chính diện bàn DJ và sàn nhảy.
  - `3. Top-Down`: Góc nhìn từ trên cao nhìn xuống bố cục vòng tròn của các slime.
  - `4. VIP Stage`: Camera zoom tập trung vào bục vinh danh VIP Top 1 và Top 2.
- **Cự Ly Camera (Distance Slider)**: Kéo thanh trượt từ `6m` đến `25m` hoặc bấm chọn nhanh:
  - `Close (7m)` | `Normal (10m)` | `Wide (16m)`.
- **Camera Focus on Selected Slime (Tiêu điểm theo dõi)**:
  - Chọn tên bất kỳ người xem nào trong danh sách thả xuống (dropdown) và nhấn **Focus vào Avatar**.
  - Camera sẽ lập tức lướt mượt mà tới gần và luôn bám theo nhân vật đó khi họ nhún nhảy hoặc di chuyển.
  - Bấm **Hủy Focus** để đưa camera trở lại góc quay tổng thể.
- **Chế Độ Hiển Thị OBS**:
  - `Toggle Alpha`: Bật/tắt nền trong suốt (cho phép lồng video nền hoặc webcam bên dưới sàn bar trong OBS).
  - `Chroma Green (F2)`: Chuyển toàn bộ nền sàn bar sang màu xanh lá chuẩn để áp bộ lọc Chroma Key trong OBS.
- **Âm Thanh & Hiệu Ứng**:
  - Thanh trượt chỉnh âm lượng SFX / Beat.
  - `Mute SFX`: Tắt tiếng hiệu ứng quà tặng.
  - `Frenzy Mode (F3)`: Kích hoạt chế độ bùng nổ sàn nhảy (đèn laser chớp nhoáng, nhịp nhảy tăng tốc).

### 2. Quản lý Avatar & Mô phỏng Người Xem
- **Tạo Nhân Vật Thủ Công (Mock Spawn)**: Nhập nickname hoặc nhấn xúc xắc tạo tên ngẫu nhiên, sau đó bấm **Spawn Avatar Vào Sàn**.
- **Xóa Nhân Vật**: Xóa avatar đang chọn hoặc nhấn **Xóa Toàn Bộ Sàn** để reset sạch sàn nhảy.
- **Tỉ Lệ Bảng Tên Billboard (Slider `0.5x - 5.0x`)**: Kéo thanh trượt để phóng to hoặc thu nhỏ bảng tên/avatar trên đầu các slime theo ý muốn.
- **Thử Nghiệm Huy Hiệu Bảng Tên**:
  - Chỉnh level TikTok từ `1` đến `60`.
  - Gán nhãn danh hiệu: `👑 TOP 1`, `🥈 TOP 2`, `🥉 TOP 3`, `💎 VIP` hoặc xóa danh hiệu.
  - Bật/tắt huy hiệu `💜 Fan Cứng` và `➕ Follower`.
  - Nhấn **Simulate Toàn Sàn** để tạo ngẫu nhiên cấp độ và danh hiệu cho toàn bộ đám đông.
- **Thử Nghiệm Chat & Thả Tim**:
  - Nhập nội dung chat và nhấn **Send Chat**.
  - Bấm các nút thả tim `+1 Tim`, `+10 Tim`, `+50 Tim` để xem hiệu ứng slime nhảy và bóng tim bay.

### 3. Mô phỏng Quà Tặng (Donate Gift Testing)
Admin Panel hỗ trợ sẵn các nút bấm mô phỏng chuẩn xác toàn bộ danh mục quà tặng TikTok LIVE:
- **Quà Nhỏ (1 - 19 xu)**: Hoa hồng (`🌹 1 xu`), Bắn tim (`🫰 5 xu`), Nón lá (`👒 10 xu`),...
- **Quà Trung (20 - 499 xu)**: Nước hoa (`🌸 20 xu`), Pháo giấy (`🎉 100 xu`), Cầu vồng (`🌈 100 xu`), Kính râm Cyber (`🕶️ 199 xu`),...
- **Quà Cao (500 - 4999 xu)**: Súng bắn tiền (`🔫 500 xu`), Mưa tiền (`💸 500 xu`), Quả cầu Disco (`🪩 1000 xu`), Vũ trụ Galaxy (`🌌 1000 xu`),...
- **Quà Siêu Cấp / Ultra (6000+ xu)**:
  - Máy bay phản lực (`✈️ 6000 xu`): Phi cơ lướt xé gió, bung dù vàng kim.
  - Báo đốm bóng ma (`🐆 10000 xu`): Báo tím bật tốc, vệt cào xé không gian.
  - Phượng hoàng lửa (`🔥 25999 xu`): Trứng lửa nở tung, phượng hoàng khổng lồ vút bay.
  - Hổ lửa (`🐅 26999 xu`): Nhảy xuyên vòng lửa, gầm thét phun bão lửa.
  - Sư tử hoàng gia (`🦁 29999 xu`): Cột sáng 24K, đăng quang vương miện hoàng gia.
  - Ngựa thần Pegasus (`🦄 34000 xu`): Phi nước đại trên dải cực quang lấp lánh.
  - Đại vũ trụ TikTok Universe (`🪐 44999 xu`): Vụ nổ Big Bang cực đại, 4 hành tinh xoay quanh avatar.
- **Nút Mưa Quà Tặng (Donate Storm)**: Kích hoạt chuỗi donate liên hoàn dồn dập nhiều cấp bậc quà.

### 4. Cấu hình Ngưỡng Coin & Tiến Hóa Trang Bị
Tại mục **"4. Cấu Hình Ngưỡng Coin / Kim Cương Cho Trang Bị & Tiến Hóa"**, bạn có thể tự do điều chỉnh điều kiện tích lũy coin để mở khóa từng món đồ:
- **Ngưỡng Slime Tier**:
  - `Tier 2 (Chubby Mochi)`: Mặc định `20` xu.
  - `Tier 3 (Má Phúng Phính Mochi)`: Mặc định `500` xu.
  - `Tier 4 (Sừng & Đuôi Rồng Cyber)`: Mặc định `3000` xu.
  - `Tier 5 (Vòng Hào Quang Celestial Halo)`: Mặc định `6000` xu.
    > ⚠️ **Quy tắc Tier 5 Nghiêm Ngặt**: Tier 5 **chỉ dành riêng cho TOP 1** của phòng live khi tổng tích lũy $\ge$ ngưỡng cấu hình. Dù người ở Top 2 donate hàng chục ngàn xu cũng chỉ dừng ở Tier 4. Khi Top 1 bị soán ngôi, avatar cũ sẽ lập tức bị giáng cấp về Tier 4.
- **Ngưỡng Vòng Chân (Foot Rings)**:
  - `Vòng 1 (Vòng Trắng)`: Mặc định `20` xu.
  - `Vòng 2 (Vòng Vàng Kim)`: Mặc định `100` xu.
  - `Vòng 3 (Vòng Cam Rực Rỡ)`: Mặc định `1000` xu.
- **Ngưỡng Hào Quang Thân (Body Auras)**:
  - `Aura Tím Neon`: Mặc định `2000` xu.
  - `Aura Cam Rực Lửa`: Mặc định `3500` xu.
  - `Aura Vàng Kim Mythic`: Mặc định `5000` xu (có bong bóng sủi bọt).
- **Thao tác**: Nhấn **Lưu Cấu Hình Ngưỡng** để cập nhật ngay lập tức cho tất cả slime đang có mặt trên sàn mà không cần khởi động lại ứng dụng. Bấm **Mặc Định** để khôi phục cấu hình chuẩn ban đầu.

### 5. Bảng Điều Khiển Giám Sát Thời Gian Thực (Logs)
- Hiển thị trực tiếp các thông báo sự kiện: Kết nối, ngắt kết nối, người xem vào phòng, bình luận chat, lệnh điều khiển, lượt like, quà tặng và thăng cấp bục VIP.
- Có nút **Xóa Log** để làm sạch màn hình theo dõi.

---

## 💬 Lệnh Chat Dành Cho Người Xem (Chat Commands)

Người xem khi đang xem live trên TikTok có thể gõ các câu lệnh vào khung chat để tương tác trực tiếp với nhân vật Slime 3D của mình.

> 💡 **Quy tắc Nhận Diện Lệnh (First Command Matching)**: Lệnh chat **bắt buộc phải bắt đầu bằng dấu `!`**. Các tin nhắn trò chuyện thông thường chứa từ khóa ở giữa câu (ví dụ: *"chào bạn !dance"*) sẽ không bị coi là lệnh.

| Câu Lệnh Chat | Tùy Chọn Tham Số | Tác Dụng |
| :--- | :--- | :--- |
| **`!color`** | `green` \| `red` \| `blue`<br>*(hoặc để trống)* | Đổi màu thân slime sang Xanh lá, Đỏ hoặc Xanh dương neon.<br>Nếu gõ `!color` không kèm màu, hệ thống sẽ **chọn ngẫu nhiên 1 trong 2 màu còn lại** khác với màu hiện tại. |
| **`!dance 1`** | `1` \| `spin` \| `z` | Slime thực hiện điệu nhảy **xoay tròn 360 độ quanh trục Z**. |
| **`!dance 2`** | `2` \| `default` | Slime quay trở lại điệu **nhún nhảy đàn hồi theo nhịp nhạc EDM**. |
| **`!dance`** | *(để trống)* | Bật/tắt chuyển đổi qua lại giữa điệu nhảy xoay và nhún đàn hồi. |
| **`!face`** | `smile` \| `cuoi` \| `cười`<br>`wink` \| `nhaymat`<br>`normal` \| `binhthuong` | Đổi biểu cảm gương mặt slime:<br>• **`smile`**: Cười tươi tít mắt.<br>• **`wink`**: Nháy mắt đáng yêu.<br>• **`normal`**: Mắt tròn to long lanh bình thường.<br>Nếu gõ `!face` để trống, hệ thống sẽ tự chọn ngẫu nhiên biểu cảm khác. |

---

## 📏 Tùy Chỉnh Tỉ Lệ Bảng Tên Billboard (PILL_SCALE)

Kích thước mặc định của bảng tên trên đầu mỗi Slime có thể được cấu hình cố định trong mã nguồn thông qua hằng số `PILL_SCALE`:

1. Mở tệp: [`src/billboard-constants.js`](file:///e:/game/bar_room/src/billboard-constants.js) (và [`preview/billboard-constants.js`](file:///e:/game/bar_room/preview/billboard-constants.js)).
2. Chỉnh sửa dòng đầu tiên:
   ```javascript
   export const PILL_SCALE = 2.5; // Đổi thành 1.8, 2.0, 3.0 tùy theo nhu cầu hiển thị
   ```
3. Lưu tệp. Bảng tên của các slime khi sinh ra sẽ tự động nhận tỉ lệ mới mà không bị vỡ bố cục.

---

## 🎥 Tích Hợp OBS Studio / TikTok LIVE Studio

Để đưa sân khấu 3D vào buổi phát trực tiếp:

1. Mở **OBS Studio** hoặc **TikTok LIVE Studio**.
2. Thêm một nguồn mới: **Browser (Trình duyệt)**.
3. Cài đặt các thông số nguồn Browser:
   - **URL**: `http://localhost:3000`
   - **Width (Chiều rộng)**: `1920` (Livestream ngang) hoặc `1080` (Livestream dọc điện thoại).
   - **Height (Chiều cao)**: `1080` (Livestream ngang) hoặc `1920` (Livestream dọc điện thoại).
   - **FPS**: `60`
   - Đánh dấu chọn:
     - ☑️ *Shutdown source when not visible* (Tắt nguồn khi ẩn).
     - ☑️ *Refresh browser when scene becomes active* (Làm mới khi cảnh hoạt động).
4. **Nền Trong Suốt (Transparent Background)**:
   - Trong Admin Panel (`http://localhost:3001`), bấm nút **Toggle Alpha** để tắt nền sàn nhà, biến toàn bộ không gian phía sau thành trong suốt, giúp lồng sàn bar lên trên camera người live hoặc video nền cực kỳ bắt mắt.
   - Hoặc bấm **Chroma Green (F2)** để chuyển sang phông nền xanh lá cây và áp bộ lọc *Chroma Key* trong OBS.

---

## 🧪 Kiểm Thử & Đảm Bảo Chất Lượng (QA Tests)

Hệ thống được tích hợp bộ kiểm thử tự động toàn diện bao gồm **24 bộ test suite** với hơn **206 trường hợp kiểm thử (test cases)**:

Để chạy toàn bộ bài kiểm tra QA:

- **Nếu dùng Docker**:
  ```bash
  docker exec tiktok-live-bar node tests/run-all-tests.js
  ```

- **Nếu chạy trên máy cục bộ**:
  ```bash
  node tests/run-all-tests.js
  ```

**Kết quả kiểm thử chuẩn**:
```text
--- Running All QA Test Suites ---
[PASS] event-normalizer: 10/10 passed
[PASS] rate-limiter: 6/6 passed
[PASS] avatar-proxy: 6/6 passed
[PASS] kinematics-culling: 6/6 passed
[PASS] audio-sfx: 6/6 passed
[PASS] integration-e2e: 6/6 passed
[PASS] slime-color-palette: 6/6 passed
[PASS] camera-orbit-bounds: 6/6 passed
[PASS] slime-kinematics: 6/6 passed
[PASS] procedural-audio-loop: 6/6 passed
[PASS] purple-floor-lighting: 6/6 passed
[PASS] orbit-camera-venue-view: 6/6 passed
[PASS] slime-eye-sync-whale: 6/6 passed
[PASS] vip-podium-scheduler: 6/6 passed
[PASS] custom-mock-person: 6/6 passed
[PASS] camera-zoom-spotlights-floor: 7/7 passed
[PASS] orbit-dj-occlusion-spotlights: 7/7 passed
[PASS] preview-design-constraints: 10/10 passed
[PASS] main-stream-stage-lights: 14/14 passed
[PASS] vip-inplace-celebration-swap: 7/7 passed
[PASS] camera-orbit-leap-vip-random: 5/5 passed
[PASS] donation-vfx-tiers: 6/6 passed
[PASS] gift-props-signatures: 7/7 passed
[PASS] mainline-refactor-modules: 15/15 passed
[PASS] like-slime-jump: 5/5 passed
[PASS] equipment-evolution: 6/6 passed
[PASS] camera-focus-slime: 6/6 passed
[PASS] billboard-improvement: 8/8 passed
[PASS] chat-commands-and-lifecycle: 5/5 passed
[PASS] verify-tier5-and-threshold-adherence: 4/4 passed

Summary: 206 passed, 0 failed out of 206 total tests
```

---

## 📄 Bản Quyền & Giấy Phép
Dự án được phân phối dưới giấy phép **MIT License**.
Mọi thắc mắc hoặc yêu cầu đóng góp tính năng, vui lòng tạo issue hoặc pull request trên repository. Chúc bạn có những buổi livestream tương tác vui vẻ và bùng nổ! 🎉
