# Use Case

## Mục tiêu

Ứng dụng là một workspace học tập cá nhân theo hướng `local-first`.
Nó giúp người dùng:

- quản lý kiến thức theo cây trang
- luyện tập theo từng skill
- lưu dữ liệu hoàn toàn ở local
- mở rộng dần sang phân tích lỗi, bài kiểm tra và AI

## Tác vụ chính

### 1. Workspace

Người dùng có thể:

- tạo workspace
- đổi tên workspace
- chuyển workspace đang dùng

Mỗi workspace có dữ liệu riêng:

- `pages`
- `exercises`
- `attempts`
- `mistakes`
- `tests`

### 2. Kiến thức

Người dùng có thể:

- tạo trang kiến thức
- tạo trang con
- đổi tên trang
- kéo thả để sắp xếp cây trang
- mở một trang để đọc và sửa

Một trang kiến thức gồm:

- tiêu đề trang
- nội dung markdown
- 2 chế độ hiển thị: `code` và `visual`
- outline của trang

### 3. Luyện tập

Người dùng có thể:

- mở nhóm `Luyện tập` trong sidebar
- bung hoặc thu danh sách skill
- chọn skill để vào màn luyện tập tương ứng
- xem danh sách bài
- tạo bài mới
- chạy bài và nộp bài

Skill hiện có:

- `Foundation`
- `Listening`
- `Writing`
- `Speaking`
- `Reading`

### 4. Phân tích lỗi

Đây là vùng mở rộng.
Use case kỳ vọng:

- xem lỗi theo skill
- xem lỗi lặp lại
- gợi ý ôn tập từ lỗi cũ

### 5. Bài kiểm tra

Đây là vùng mở rộng.
Use case kỳ vọng:

- bài kiểm tra tổng hợp
- bài ôn theo tuần
- bài ôn dựa trên nội dung đã học hoặc lỗi cũ

### 6. Cài đặt

Người dùng có thể:

- chỉnh nơi lưu dữ liệu
- chỉnh model AI mặc định
- chỉnh cỡ chữ vùng học
- import/export dữ liệu JSON

## Nguyên tắc sản phẩm

- ưu tiên `local-first`
- sidebar là điều hướng chính
- chỉ item điều hướng cuối mới mở content
- phần chưa hoàn chỉnh phải thể hiện rõ là placeholder hoặc bản đầu
