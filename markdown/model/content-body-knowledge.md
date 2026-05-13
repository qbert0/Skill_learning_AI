# Knowledge Content-Body Blueprint

## Mục tiêu

- Giữ trọng tâm vào việc viết và đọc ghi chú.
- Tách công cụ phụ như mục lục và AI ra utility rail.
- Giảm cảm giác "bảng điều khiển kỹ thuật", tăng cảm giác "không gian học tập".

## Core Layout

1. `knowledge-page-editor`
   - Shell chính của content-body.
   - Chứa header, editor stage và floating tools.

2. `knowledge-editor-header`
   - Kicker ngắn để định danh vùng.
   - Title input lớn làm điểm nhấn thị giác chính.
   - Action cluster nhỏ: `AI chat`, `Mục lục`.

3. `knowledge-editor-stage`
   - Cột trái: editor thực tế.
   - Cột phải: utility rail.

4. `page-outline-panel`
   - Không còn là thanh nổi siêu mảnh.
   - Trở thành card phụ trợ cố định trong stage.
   - Dùng để điều hướng heading và theo dõi cấu trúc trang.

## Nguyên tắc hiển thị

- Màn hình chính chỉ có 2 việc: nhập nội dung và điều hướng nội dung.
- Mọi thứ không phục vụ trực tiếp cho 2 việc đó phải được đẩy sang utility rail hoặc popup.
- Header top-level chỉ giữ các control mode và utility chung.

## Gợi ý phát triển tiếp

- Thêm `page insight` card nhỏ dưới mục lục: số block, số heading, thời gian cập nhật.
- Thêm `quick insert presets` cho block phổ biến thay vì bắt người dùng luôn gõ `/`.
- Nếu editor còn nặng, tách `block-editor.js` thành:
  - `editor-session.js`
  - `editor-dnd.js`
  - `editor-floating-ui.js`
  - `editor-markdown-sync.js`
