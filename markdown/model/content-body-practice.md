# Practice Content-Body Blueprint

## Mục tiêu

- Màn danh sách bài phải cực gọn, nhìn vào là biết làm gì tiếp theo.
- Màn tạo bài là workbench, không phải nơi trưng bày hướng dẫn dài dòng.
- Thông tin phụ như danh mục dạng bài, mô tả skill, log AI phải ở popup hoặc utility surface.

## Core Layout

1. `practiceListPanel`
   - Hero ngắn: skill hiện tại, CTA chính.
   - Summary strip: kỹ năng, số bài, số dạng.
   - List stage: danh sách bài tập.

2. `exerciseCreationPanel`
   - Creation mode switch ở đầu.
   - Essentials card: skill, title, type, duration.
   - AI input panel chỉ hiện khi cần.
   - Manual builder là phần dữ liệu cốt lõi.

3. `exerciseRunner`
   - Chỉ giữ title, timer, actions.
   - Không đặt thông tin tra cứu hoặc catalog ở đây.

4. `exerciseReviewPanel`
   - Giữ score, feedback, explanation.
   - Mọi thông tin phụ khác không chen vào luồng xem lại.

## Popup / Optional Surfaces

### `practiceToolkitModal`

- Dùng làm nơi chứa:
  - catalog dạng bài
  - thống kê skill
  - thông tin phụ không cần nhìn mọi lúc

### `aiChatModal`

- Dùng để test cơ chế hỏi AI độc lập với luồng tạo bài.
- Có thể phát triển thành:
  - ask from current page
  - ask from current exercise
  - explain wrong answers

## Nguyên tắc hiển thị

- Nếu một thông tin không ảnh hưởng đến quyết định thao tác ngay lúc đó, đẩy vào popup.
- Tên bài, trạng thái làm bài, nút chạy/review là ưu tiên cao nhất trong list panel.
- Form tạo bài chỉ nên hiện các field người dùng thực sự cần chạm.

## Gợi ý refactor tiếp

- Tách `renderPractice()` thành:
  - `renderPracticeDashboard()`
  - `renderPracticeCreationState()`
  - `renderPracticeOverlayState()`
- Tách luồng AI trong `app.js` thành module riêng:
  - `ai-creation.js`
  - `ai-grading.js`
  - `ai-chat.js`
