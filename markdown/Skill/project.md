# Mô tả hệ thống phần mềm học tập cá nhân chạy trên Web, sử dụng dữ liệu local

## 1. Tổng quan

Phần mềm này là một **ứng dụng web cá nhân** phục vụ việc học tập, ghi nhớ và quản lý dữ liệu học tập theo hướng đơn giản, trực quan và dễ sử dụng hơn so với một ứng dụng desktop truyền thống.

Khác với các hệ thống web thông thường, phần mềm này **không sử dụng cơ sở dữ liệu tập trung**. Toàn bộ dữ liệu được lưu trực tiếp trên máy người dùng dưới dạng các file dữ liệu cục bộ. Ứng dụng sẽ đọc, xử lý và hiển thị dữ liệu này ngay trên giao diện web. Ý tưởng này gần với cách **Anki** làm việc với bộ dữ liệu học tập, nhưng thay vì nhấn mạnh vào trải nghiệm application kiểu desktop, hệ thống hướng đến một giao diện **web hiện đại, nhẹ, dễ nhìn và dễ mở rộng**.

Mục tiêu chính của phần mềm:

- phục vụ **một người dùng cá nhân**
- hoạt động **offline hoặc gần-offline**
- dễ tổ chức dữ liệu
- dễ đọc, dễ chỉnh sửa thủ công
- dễ nâng cấp giao diện và logic về sau
- không cần triển khai hệ quản trị cơ sở dữ liệu

## 2. Mục tiêu thiết kế

### 2.1. Đơn giản hóa hạ tầng

Vì đây là phần mềm cá nhân, việc dùng database server là không cần thiết. Hệ thống chỉ cần:

- đọc dữ liệu từ các file local
- xử lý dữ liệu trong bộ nhớ
- hiển thị kết quả trên website

Điều này giúp giảm mạnh độ phức tạp khi phát triển và bảo trì.

### 2.2. Tối ưu cho trải nghiệm cá nhân

Người dùng không cần:

- tạo tài khoản
- đăng nhập
- đồng bộ server
- cấu hình database
- lo về quyền truy cập nhiều người

Thay vào đó, người dùng chỉ cần quản lý thư mục dữ liệu của mình.

### 2.3. Dễ mở rộng về sau

Mặc dù hiện tại không dùng database, kiến trúc vẫn nên được tổ chức sao cho sau này có thể:

- thêm đồng bộ cloud
- thêm tìm kiếm nâng cao
- thêm AI hỗ trợ học tập
- thêm lịch sử học
- thêm thống kê tiến độ

## 3. Định hướng công nghệ

## 3.1. Frontend

Frontend là phần người dùng nhìn thấy và tương tác trực tiếp trên trình duyệt.

### Công nghệ đề xuất

- **Nuxt 3** hoặc **Next.js**
- **Vue 3** hoặc **React**
- **Tailwind CSS** để làm giao diện nhanh, gọn, hiện đại
- **TypeScript** để tăng độ rõ ràng và an toàn của code

### Lý do chọn

- phù hợp để xây dựng giao diện web hiện đại
- dễ chia component
- dễ làm các trang như:
  - danh sách bộ dữ liệu
  - danh sách thẻ học
  - trang học
  - trang xem chi tiết
  - trang chỉnh sửa hoặc import dữ liệu
- hỗ trợ tổ chức code tốt khi dự án lớn dần

Nếu muốn ưu tiên sự mạch lạc và dễ quản lý state, **Nuxt 3 + Vue 3 + Tailwind + TypeScript** là một lựa chọn rất hợp lý.

## 3.2. Backend cục bộ

Vì trình duyệt web không thể tự do đọc toàn bộ file trong máy người dùng như ứng dụng desktop, hệ thống cần một lớp backend nhẹ chạy local để làm nhiệm vụ trung gian.

### Công nghệ đề xuất

- **Node.js**
- có thể dùng:
  - **Express**
  - hoặc API routes của **Nuxt server**
  - hoặc **Fastify** nếu muốn hiệu năng tốt hơn

### Vai trò

Backend local sẽ:

- đọc file dữ liệu từ thư mục trên máy
- parse dữ liệu
- chuẩn hóa dữ liệu
- trả dữ liệu cho frontend qua API nội bộ
- ghi lại thay đổi nếu người dùng chỉnh sửa dữ liệu

### Ý tưởng hoạt động

Ứng dụng thực tế vẫn là “web”, nhưng server chạy trên máy cá nhân. Ví dụ:

- frontend chạy ở `http://localhost:3000`
- backend local đọc file ở thư mục như:
  - `data/decks/`
  - `data/cards/`
  - `data/media/`

Như vậy, trải nghiệm là web, nhưng dữ liệu vẫn hoàn toàn nằm trong máy người dùng.

## 3.3. Định dạng dữ liệu

Vì không dùng database, dữ liệu cần được lưu dưới dạng file có cấu trúc rõ ràng.

### Các lựa chọn phù hợp

- **JSON**
- **YAML**
- **Markdown + frontmatter**
- **CSV** cho dữ liệu bảng đơn giản

### Khuyến nghị

**JSON** là lựa chọn phù hợp nhất ở giai đoạn đầu vì:

- dễ parse
- dễ validate
- dễ ánh xạ sang object trong code
- dễ đọc đối với lập trình viên
- phù hợp với dữ liệu dạng deck / note / card / tag / metadata

Ví dụ:

```json
{
  "deckId": "hsk5-lesson-01",
  "name": "HSK5 Lesson 01",
  "cards": [
    {
      "id": "card-001",
      "front": "发展",
      "back": "phát triển",
      "tags": ["hsk5", "vocab"],
      "examples": ["中国发展很快。"]
    }
  ]
}
```

## 4. Phương pháp thiết kế hệ thống

## 4.1. Thiết kế theo hướng module

Hệ thống nên chia thành các module tách biệt rõ ràng, thay vì viết dồn toàn bộ logic vào một chỗ.

Ví dụ các module chính:

- **Data Access Module**: đọc/ghi file
- **Parser Module**: chuyển dữ liệu thô thành object dùng được
- **Domain Module**: biểu diễn các thực thể như deck, card, note
- **Application Module**: xử lý nghiệp vụ
- **Presentation Module**: giao diện và tương tác người dùng

Cách chia này giúp:

- dễ sửa
- dễ test
- dễ thay thế từng phần
- tránh code bị rối

## 4.2. Tách dữ liệu, nghiệp vụ và giao diện

Đây là nguyên tắc cực quan trọng.

### Không nên

- để component giao diện tự đi đọc file
- để code giao diện tự xử lý toàn bộ logic dữ liệu
- để logic nghiệp vụ nằm rải rác trong nhiều component

### Nên

- backend/local service đọc dữ liệu
- service layer xử lý nghiệp vụ
- frontend chỉ gọi API và hiển thị kết quả

Điều này giúp hệ thống không bị “dính cục” giữa giao diện và xử lý dữ liệu.

## 4.3. Thiết kế hướng domain

Dù là phần mềm cá nhân, vẫn nên xác định rõ các đối tượng chính của hệ thống.

Ví dụ domain có thể gồm:

- **Deck**: một bộ thẻ hoặc nhóm kiến thức
- **Card**: một đơn vị học
- **Note**: một bản ghi gốc có thể sinh ra nhiều card
- **Tag**: nhãn phân loại
- **ReviewSession**: một phiên học
- **MediaAsset**: ảnh, âm thanh, file đính kèm

Khi xác định domain rõ, code sẽ dễ hiểu hơn rất nhiều.

## 4.4. Ưu tiên local-first

Đây là phần mềm cá nhân nên tư tưởng thiết kế nên là **local-first**.

Nghĩa là:

- dữ liệu gốc nằm trên máy người dùng
- hệ thống hoạt động được khi không có internet
- không phụ thuộc server bên ngoài
- người dùng kiểm soát hoàn toàn dữ liệu

Sau này nếu cần, có thể thêm tính năng backup hoặc sync mà không phá kiến trúc cũ.

## 5. Tổ chức code

Dưới đây là một cấu trúc thư mục gợi ý:

```bash
project-root/
│
├─ app/                        # frontend web
│  ├─ components/
│  ├─ pages/
│  ├─ layouts/
│  ├─ composables/
│  ├─ stores/
│  └─ utils/
│
├─ server/                     # backend local / API routes
│  ├─ api/
│  ├─ services/
│  ├─ repositories/
│  ├─ parsers/
│  ├─ domain/
│  └─ utils/
│
├─ data/                       # dữ liệu local của người dùng
│  ├─ decks/
│  ├─ media/
│  └─ config/
│
├─ shared/                     # kiểu dữ liệu dùng chung
│  ├─ types/
│  └─ constants/
│
├─ docs/
│  └─ architecture.md
│
├─ package.json
├─ tsconfig.json
└─ README.md
```

## 6. Phân chia trách nhiệm

## 6.1. Frontend

Frontend chỉ nên chịu trách nhiệm cho:

- hiển thị dữ liệu
- điều hướng trang
- nhận thao tác từ người dùng
- quản lý state giao diện
- gọi API nội bộ

Frontend **không nên** trực tiếp chứa logic đọc file hoặc logic nghiệp vụ quá sâu.

Ví dụ frontend làm:

- hiển thị danh sách deck
- hiển thị số lượng card
- hiển thị phiên học
- cho người dùng bấm “học tiếp”, “xem chi tiết”, “lọc theo tag”

## 6.2. API layer / server routes

Lớp này là cầu nối giữa frontend và dữ liệu local.

Nhiệm vụ:

- nhận request từ frontend
- gọi service tương ứng
- trả response chuẩn hóa

Ví dụ:

- `GET /api/decks`
- `GET /api/decks/:id`
- `GET /api/cards/:id`
- `POST /api/review/submit`

API layer không nên viết quá nhiều logic nghiệp vụ, mà chỉ điều phối.

## 6.3. Service layer

Đây là nơi xử lý nghiệp vụ chính.

Ví dụ:

- lấy danh sách deck
- tính số lượng card đến hạn ôn
- lọc card theo tag
- chuẩn bị dữ liệu cho một phiên học
- đánh dấu kết quả học
- tính trạng thái thẻ theo quy tắc học

Service layer là “bộ não” của hệ thống.

## 6.4. Repository layer

Repository chịu trách nhiệm làm việc với dữ liệu lưu trữ.

Trong dự án này, repository sẽ không truy cập database mà truy cập **file local**.

Ví dụ:

- đọc file JSON
- ghi file JSON
- load toàn bộ dữ liệu từ thư mục
- tìm card theo id
- tìm deck theo tên

Nhờ có repository layer, sau này nếu muốn chuyển từ file sang SQLite hoặc database thật, ta chỉ cần thay cách hiện thực repository.

## 6.5. Parser / Adapter layer

Lớp này dùng để chuyển dữ liệu thô thành dữ liệu có cấu trúc.

Ví dụ:

- parse JSON thành `Deck`
- parse markdown note thành `Card`
- xử lý đường dẫn file media
- chuẩn hóa field cũ và mới nếu format dữ liệu thay đổi

Đây là lớp rất quan trọng nếu muốn phần mềm “đọc dữ liệu kiểu Anki”.

Vì dữ liệu thật thường không sạch tuyệt đối, parser sẽ giúp hệ thống ổn định hơn.

## 6.6. Domain layer

Đây là nơi định nghĩa các khái niệm cốt lõi của hệ thống.

Ví dụ:

```ts
type Card = {
  id: string;
  front: string;
  back: string;
  tags: string[];
  dueDate?: string;
  ease?: number;
};
```

Domain layer không quan tâm dữ liệu đến từ đâu, cũng không quan tâm giao diện hiển thị thế nào. Nó chỉ mô tả bản chất dữ liệu và quy tắc cốt lõi.

## 7. Phương pháp quản lý dữ liệu local

## 7.1. Tổ chức dữ liệu theo thư mục

Nên tổ chức dữ liệu theo cấu trúc ổn định, ví dụ:

```bash
data/
├─ decks/
│  ├─ hsk5.json
│  ├─ sql-basics.json
│  └─ economics.json
├─ media/
│  ├─ images/
│  └─ audio/
└─ config/
   └─ app-config.json
```

Cách này dễ sao lưu, dễ copy sang máy khác, dễ hiểu bằng mắt.

## 7.2. Quy ước dữ liệu nhất quán

Cần đặt ra quy tắc rõ ràng:

- mỗi card phải có `id`
- mỗi deck phải có `name`
- media phải có đường dẫn tương đối
- tag phải là mảng chuỗi
- ngày tháng phải cùng định dạng

Nếu không có quy ước, hệ thống sẽ nhanh chóng rối khi dữ liệu tăng lên.

## 7.3. Validation dữ liệu

Dù là phần mềm cá nhân, vẫn nên kiểm tra dữ liệu đầu vào.

Có thể dùng:

- **Zod**
- **Yup**
- validator tự viết

Mục đích:

- phát hiện file lỗi
- báo rõ field nào sai
- tránh làm ứng dụng crash

## 8. Giao diện và trải nghiệm người dùng

Vì mục tiêu của bạn là “thân thiện hơn Anki”, phần giao diện cần được coi trọng.

## 8.1. Định hướng UI

Giao diện nên:

- sáng sủa
- tối giản
- dễ đọc
- khoảng trắng hợp lý
- typography rõ ràng
- ít cảm giác “công cụ kỹ thuật”

## 8.2. Các màn hình chính

### Trang tổng quan

- số lượng deck
- số lượng card
- số card đến hạn học
- tiến độ gần đây

### Trang danh sách deck

- tên deck
- số lượng card
- tag
- ngày cập nhật gần nhất

### Trang học

- hiện mặt trước
- bấm để xem mặt sau
- đánh giá mức độ nhớ
- chuyển thẻ tiếp theo

### Trang chi tiết card / note

- xem nội dung đầy đủ
- ví dụ
- media
- tag
- liên kết đến deck gốc

### Trang cài đặt dữ liệu

- chọn thư mục dữ liệu
- kiểm tra cấu trúc dữ liệu
- import / export

## 9. So sánh với Anki về mặt ý tưởng

Hệ thống này có thể xem là đi theo một tinh thần gần Anki ở mặt **quản lý dữ liệu học tập cá nhân**, nhưng khác ở cách triển khai.

### Điểm giống

- dữ liệu mang tính cá nhân
- tập trung vào học tập và ghi nhớ
- dữ liệu có cấu trúc kiểu deck/card/note
- người dùng sở hữu dữ liệu của mình

### Điểm khác

- Anki thiên về desktop application
- hệ thống này thiên về web UI
- Anki có UX thiên về công cụ chuyên dụng
- hệ thống này ưu tiên trải nghiệm trực quan, hiện đại và dễ nhìn hơn
- kiến trúc dữ liệu có thể đơn giản hơn, phù hợp với nhu cầu cá nhân thay vì một hệ sinh thái đầy đủ như Anki

## 10. Hướng mở rộng trong tương lai

Dù hiện tại không dùng database, hệ thống nên được viết để sau này có thể mở rộng.

### Có thể mở rộng thêm

- đồng bộ Google Drive / Dropbox
- backup tự động
- full text search
- AI hỗ trợ giải thích thẻ học
- gợi ý học theo lịch
- thống kê tiến bộ
- hỗ trợ nhiều loại dữ liệu hơn: text, audio, image, markdown note
- import từ định dạng Anki hoặc CSV

## 11. Kết luận

Đối với một phần mềm học tập cá nhân chạy trên web, việc **không dùng cơ sở dữ liệu** là hoàn toàn hợp lý nếu dữ liệu không quá lớn và chỉ phục vụ một người dùng. Thiết kế phù hợp nhất là một mô hình **web local-first**, trong đó:

- frontend cung cấp giao diện hiện đại, dễ dùng
- backend local đóng vai trò đọc và xử lý file dữ liệu trên máy
- dữ liệu được lưu dưới dạng file có cấu trúc rõ ràng
- code được chia lớp theo trách nhiệm: giao diện, API, service, repository, parser, domain

Cách tiếp cận này vừa giữ được ưu điểm của phần mềm cá nhân như Anki ở chỗ dữ liệu nằm trên máy, vừa tận dụng được lợi thế của web là giao diện đẹp, dễ nhìn, dễ tổ chức và dễ mở rộng.

Về bản chất, đây là một kiến trúc phù hợp cho một **personal knowledge application chạy web nhưng không phụ thuộc database**, với triết lý thiết kế là: **đơn giản, local-first, dễ bảo trì, dễ mở rộng và thân thiện với trải nghiệm người dùng**.
