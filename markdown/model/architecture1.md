# Thiết Kế Kỹ Thuật

## 1. Chia 2 phần

### Frontend

Frontend có 3 lớp:

- `bootstrap`: khởi động và ghép app
- `ui`: nơi khai báo giao diện
- `studio`: state và điều phối phía client

### Backend

Backend chỉ lo:

- load/save dữ liệu local
- normalize dữ liệu
- import/export
- nghiệp vụ và AI khi cần

Backend không chứa cấu trúc giao diện.

## 2. Frontend

### Bootstrap

`bootstrap` chỉ có nhiệm vụ:

- dựng app shell
- nạp component đã đăng ký
- nạp CSS/JS

### UI

`ui` chỉ nên còn:

- `core`: lớp nền để kế thừa
- `component`: UI được dùng thật
- `registry.php`: nơi đăng ký UI

### Studio

`studio` giữ state client:

- workspace đang mở
- page đang mở
- view đang active
- skill đang chọn

Và điều phối:

- render header/content/sidebar
- map `sidebar item -> content body`
- gọi backend để load/save

## 3. Cấu trúc UI

UI được chia thành 3 nhóm:

- `sidebar`
- `content`
- `overlay`

Không có `header` độc lập.
Header là một phần của `content`.

## 4. Sidebar

`sidebar` là root điều hướng.
Nó gồm:

- `sidebarHeader`
- nhiều `sidebarFrame`
- `sidebarFooter`

### SidebarHeader

Phụ trách workspace:

- hiển thị workspace hiện tại
- chuyển workspace
- đổi tên hoặc tạo workspace

### SidebarFooter

Phụ trách action cuối sidebar:

- nút `Cài đặt`

### SidebarFrame

`SidebarFrame` là khung điều hướng cấp cao.
Frame sở hữu item của chính nó theo `composition`.

Frame hiện có:

- `knowledge-frame`
- `exercise-frame`
- `status-frame`

### SidebarItem

`SidebarItem` là item điều hướng cuối.
Chỉ `SidebarItem` mới được mở `contentBody`.

Ví dụ:

- page trong `knowledge-frame`
- skill trong `exercise-frame`
- `Phân tích lỗi`
- `Bài kiểm tra`

### Ghi chú riêng cho Practice

`exercise-frame` có một control riêng là nút `Luyện tập`.
Nút này chỉ bung hoặc thu skill.
Nó không phải `SidebarItem`.

Các skill con mới là `SidebarItem`.

## 5. Content

`content` gồm:

- `contentHeader`
- `contentBody`

### ContentHeader

Phụ trách:

- breadcrumb như `English workspace / knowledge / Present simple`
- action theo từng `contentBody`

`contentBody` có thể đăng ký action vào `contentHeader`.

Ví dụ:

- `knowledge` đăng ký nút chuyển `visual/code`
- `practice` đăng ký dải chọn skill

### ContentBody

Mỗi màn nội dung là một `ContentBody`.

Hiện có:

- `knowledge`
- `practice`
- `exercise-creation`
- `analysis`
- `tests`

## 6. Overlay

`overlay` là UI nổi trên app.

Hiện có:

- `settings-modal`
- `page-menu`

Nút `Cài đặt` ở `sidebarFooter` phải mở một `overlay`.

## 7. Component Đã Đăng Ký

### Sidebar

- `sidebar-header/workspace`
- `sidebar-frame/knowledge-frame`
- `sidebar-frame/exercise-frame`
- `sidebar-frame/status-frame`
- `sidebar-footer/default`

### Content

- `content-header/breadcrumb`
- `content-body/knowledge`
- `content-body/practice-list`
- `content-body/practice-creation`
- `content-body/status`

### Overlay

- `overlay/settings-modal`
- `overlay/page-menu`

## 8. Thiết Kế Knowledge

`knowledge` là một `ContentBody`.
Nó có 2 phần chính:

- `component/view.php`: vùng nội dung markdown
- `component/outline.php`: outline

### Markdown root

`markdown` là root nội dung của trang.
Nó có 2 mode:

- `code`: người dùng viết markdown trực tiếp
- `visual`: markdown được biểu diễn bằng block

Chuyển mode phải giữ cùng một nội dung.

### Block

Trong mode `visual`, nội dung được tách thành block.
Mọi block đều phải đi qua `block` registry và kế thừa từ block core.

Block hiện hỗ trợ theo hướng plugin, ví dụ:

- `text`
- `toggle`
- `table`
- `heading`
- `list`

Mỗi block có thể:

- render trong visual mode
- sinh markdown
- được chèn qua slash menu

### Block button

Mỗi block có `blockbutton` riêng.
Nó dùng để:

- kéo thả block
- mở menu block

Menu block hiện xử lý:

- xóa block
- đổi màu block

### Outline

`outline` đọc heading từ nội dung hiện tại:

- ở `visual` thì đọc từ DOM
- ở `code` thì đọc từ markdown text

## 9. Luồng Chính

### Luồng mở màn hình

1. `bootstrap` dựng app shell
2. `registry` nạp sidebar/content/overlay
3. `studio` load dữ liệu
4. `studio` render sidebar
5. user chọn `SidebarItem`
6. `studio` mở `ContentBody` tương ứng
7. `contentBody` đăng ký action cho `contentHeader`

### Luồng mở trang kiến thức

1. user chọn page trong `knowledge-frame`
2. `studio` đặt `activePageId`
3. `knowledge` render title + markdown + outline
4. `contentHeader` render breadcrumb + nút `visual/code`

### Luồng đổi mode knowledge

1. user bấm nút mode ở `contentHeader`
2. `studio` gọi `BlockEditorModule.setMode()`
3. `knowledge` sync `code <-> visual`
4. `contentHeader` cập nhật trạng thái active

### Luồng luyện tập

1. user bung `Luyện tập` trong `exercise-frame`
2. user chọn skill
3. `studio` mở `practice`
4. `contentHeader` hiện dải skill
5. `practice` hiện danh sách bài hoặc runner

## 10. Quy tắc ngắn gọn

- `bootstrap` chỉ khởi động
- `ui` chỉ khai báo giao diện
- `studio` chỉ giữ state và điều phối
- frame sở hữu item của nó
- chỉ `SidebarItem` mới mở content
- chỉ `ContentBody` mới được render vào vùng nội dung
- action riêng của màn hình phải đăng ký qua `contentHeader`
- `knowledge` lấy `markdown` làm root, `block` chỉ là dạng biểu diễn của mode `visual`
