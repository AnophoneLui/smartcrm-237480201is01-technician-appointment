
# Smart CRM – L4: Phân công kỹ thuật viên và lịch hẹn

**Sinh viên:** Luibouathong Anophone  
**MSSV:** 237480201IS01 · **Track:** SE

## 1. Giới thiệu

Module L4 thuộc hệ thống Smart CRM của Mekong Mobile, hỗ trợ quản lý phiếu dịch vụ, gợi ý và phân công kỹ thuật viên, đặt lịch hẹn và kiểm tra trùng lịch.

**Chức năng chính:**
- CRUD Ticket: tạo, xem, cập nhật và xóa mềm phiếu.
- CRUD Appointment: tạo, xem, đổi lịch và hủy mềm lịch hẹn.
- Gợi ý kỹ thuật viên theo kỹ năng và số phiếu đang xử lý.
- Phân công kỹ thuật viên, ghi log và kiểm tra quy tắc nghiệp vụ.
- Giao diện 3 màn hình kết nối API, có trạng thái Loading/Empty/Error.

**Kiến trúc:** Frontend → API Routes → Service → Repository → PostgreSQL.

**Công nghệ:** Node.js, Express, PostgreSQL, HTML/CSS/JavaScript, Vue 3.

## 2. Yêu cầu môi trường

- Node.js ≥ 20 và npm
- PostgreSQL 15/16
- Git và trình duyệt có Internet

## 3. Hướng dẫn cài đặt và chạy

**Bước 1.** Clone repository:

```bash
git clone https://github.com/AnophoneLui/smartcrm-237480201is01-technician-appointment.git
cd smartcrm-237480201is01-technician-appointment
```

**Bước 2.** Cài đặt và cấu hình:

```bash
npm install
cp .env.example .env
createdb smartcrm
```

Chỉnh `DATABASE_URL` trong `.env` cho phù hợp PostgreSQL trên máy. Trên Windows có thể dùng `copy` và tạo database bằng pgAdmin.

**Bước 3.** Khởi tạo dữ liệu:

```bash
npm run db:migrate
npm run db:seed
```

**Bước 4.** Chạy kiểm thử và ứng dụng:

```bash
npm test
npm run dev
```

Truy cập: http://localhost:3000

Giao diện và API dùng chung cổng 3000. Không commit file `.env`.

## 4. Chức năng và API

| Method | Endpoint | Chức năng |
|---|---|---|
| GET | `/health` | Kiểm tra server |
| GET/POST | `/api/tickets` | Danh sách / tạo phiếu |
| GET/PUT/DELETE | `/api/tickets/:id` | Xem / sửa / xóa mềm phiếu |
| GET | `/api/tickets/:id/suggestions` | Gợi ý kỹ thuật viên |
| PATCH | `/api/tickets/:id/technician` | Phân công kỹ thuật viên |
| GET/POST | `/api/tickets/:id/appointments` | Xem / đặt lịch hẹn |
| PUT | `/api/tickets/:id/appointments/current` | Đổi lịch hẹn |
| DELETE | `/api/tickets/:id/appointments/current` | Hủy mềm lịch hẹn |

**Quy tắc:** Mỗi phiếu chỉ có một lịch hẹn đang hoạt động; từ chối lịch trùng của cùng kỹ thuật viên trong khoảng 60 phút (HTTP 409). Hủy lịch cập nhật `is_active = false`.

Chi tiết API: `docs/api-contract.md`.

## 5. Hướng dẫn sử dụng

1. Mở danh sách phiếu và lọc theo trạng thái.
2. Chọn **Phân công** → xem gợi ý → chọn kỹ thuật viên → xác nhận.
3. Mở chi tiết phiếu để xem và đặt lịch hẹn.
4. Kiểm tra cảnh báo khi kỹ thuật viên bị trùng lịch.
5. Thử phiếu `MM-DEMO-008` để xem trường hợp không có kỹ thuật viên phù hợp.

Giao diện hỗ trợ trạng thái **Loading, Empty, Error**.

## 6. Kiểm thử

Chạy `npm test` bằng Node.js Test Runner.

**Kết quả đã kiểm tra: 23 PASS / 23 test, 0 FAIL.**

- Kiểm thử dữ liệu hợp lệ, không hợp lệ và giá trị biên.
- Kiểm thử phân công, đặt lịch, trùng lịch và hủy lịch.
- API DELETE: thành công HTTP 200; không có lịch hoạt động HTTP 404.
- Migration chạy lại không kích hoạt lịch đã hủy.
- Seed chạy 2 lần không tạo thêm bản ghi trên database thử nghiệm.

Chi tiết: `docs/ket-qua-kiem-thu.md`.

## 7. Cấu trúc dự án

```text
src/
  backend/
    routes/          # Định nghĩa API
    services/        # Xử lý nghiệp vụ
    repositories/    # Truy vấn PostgreSQL
    db/              # Migration và Seed
  frontend/          # Giao diện 3 màn hình
scripts/             # Công cụ chạy SQL
tests/               # 4 file kiểm thử
docs/                # SRS, API, thiết kế, kiểm thử
README.md
.env.example
package.json
```

## 8. Phạm vi và hạn chế

- Chưa có đăng nhập và phân quyền; log dùng người dùng mặc định.
- Chưa triển khai đầy đủ FR4, FR5, FR7, FR8.
- Chức năng hủy lịch đã có API backend, chưa xác nhận nút hủy trên giao diện.
- Khung lịch hẹn giả định là 60 phút.

Chi tiết thay đổi thiết kế: `docs/thay-doi-thiet-ke.md`.

# Smart CRM – L4: Phân công kỹ thuật viên và lịch hẹn

**Sinh viên:** Luibouathong Anophone  
**MSSV:** 237480201IS01 · **Track:** SE

## 1. Giới thiệu

Module L4 thuộc hệ thống Smart CRM của Mekong Mobile, hỗ trợ quản lý phiếu dịch vụ, gợi ý và phân công kỹ thuật viên, đặt lịch hẹn và kiểm tra trùng lịch.

**Chức năng chính:**
- CRUD Ticket: tạo, xem, cập nhật và xóa mềm phiếu.
- CRUD Appointment: tạo, xem, đổi lịch và hủy mềm lịch hẹn.
- Gợi ý kỹ thuật viên theo kỹ năng và số phiếu đang xử lý.
- Phân công kỹ thuật viên, ghi log và kiểm tra quy tắc nghiệp vụ.
- Giao diện 3 màn hình kết nối API, có trạng thái Loading/Empty/Error.

**Kiến trúc:** Frontend → API Routes → Service → Repository → PostgreSQL.

**Công nghệ:** Node.js, Express, PostgreSQL, HTML/CSS/JavaScript, Vue 3.

## 2. Yêu cầu môi trường

- Node.js ≥ 20 và npm
- PostgreSQL 15/16
- Git và trình duyệt có Internet

## 3. Hướng dẫn cài đặt và chạy

**Bước 1.** Clone repository:

```bash
git clone https://github.com/AnophoneLui/smartcrm-237480201is01-technician-appointment.git
cd smartcrm-237480201is01-technician-appointment
```

**Bước 2.** Cài đặt và cấu hình:

```bash
npm install
cp .env.example .env
createdb smartcrm
```

Chỉnh `DATABASE_URL` trong `.env` cho phù hợp PostgreSQL trên máy. Trên Windows có thể dùng `copy` và tạo database bằng pgAdmin.

**Bước 3.** Khởi tạo dữ liệu:

```bash
npm run db:migrate
npm run db:seed
```

**Bước 4.** Chạy kiểm thử và ứng dụng:

```bash
npm test
npm run dev
```

Truy cập: http://localhost:3000

Giao diện và API dùng chung cổng 3000. Không commit file `.env`.

## 4. Chức năng và API

| Method | Endpoint | Chức năng |
|---|---|---|
| GET | `/health` | Kiểm tra server |
| GET/POST | `/api/tickets` | Danh sách / tạo phiếu |
| GET/PUT/DELETE | `/api/tickets/:id` | Xem / sửa / xóa mềm phiếu |
| GET | `/api/tickets/:id/suggestions` | Gợi ý kỹ thuật viên |
| PATCH | `/api/tickets/:id/technician` | Phân công kỹ thuật viên |
| GET/POST | `/api/tickets/:id/appointments` | Xem / đặt lịch hẹn |
| PUT | `/api/tickets/:id/appointments/current` | Đổi lịch hẹn |
| DELETE | `/api/tickets/:id/appointments/current` | Hủy mềm lịch hẹn |

**Quy tắc:** Mỗi phiếu chỉ có một lịch hẹn đang hoạt động; từ chối lịch trùng của cùng kỹ thuật viên trong khoảng 60 phút (HTTP 409). Hủy lịch cập nhật `is_active = false`.

Chi tiết API: `docs/api-contract.md`.

## 5. Hướng dẫn sử dụng

1. Mở danh sách phiếu và lọc theo trạng thái.
2. Chọn **Phân công** → xem gợi ý → chọn kỹ thuật viên → xác nhận.
3. Mở chi tiết phiếu để xem và đặt lịch hẹn.
4. Kiểm tra cảnh báo khi kỹ thuật viên bị trùng lịch.
5. Thử phiếu `MM-DEMO-008` để xem trường hợp không có kỹ thuật viên phù hợp.

Giao diện hỗ trợ trạng thái **Loading, Empty, Error**.

## 6. Kiểm thử

Chạy `npm test` bằng Node.js Test Runner.

**Kết quả đã kiểm tra: 23 PASS / 23 test, 0 FAIL.**

- Kiểm thử dữ liệu hợp lệ, không hợp lệ và giá trị biên.
- Kiểm thử phân công, đặt lịch, trùng lịch và hủy lịch.
- API DELETE: thành công HTTP 200; không có lịch hoạt động HTTP 404.
- Migration chạy lại không kích hoạt lịch đã hủy.
- Seed chạy 2 lần không tạo thêm bản ghi trên database thử nghiệm.

Chi tiết: `docs/ket-qua-kiem-thu.md`.

## 7. Cấu trúc dự án


```text
src/
├── backend/
│   ├── app.js
│   ├── server.js
│   ├── errors.js
│   ├── config/
│   ├── routes/
│   ├── services/
│   ├── repositories/
│   └── db/
│       ├── migrations/
│       └── seed/
│
└── frontend/
    ├── index.html
    ├── config.js
    └── js/
        ├── api/
        ├── components/
        └── pages/

scripts/
└── run-sql.js

tests/
├── ticket.service.test.js
├── ticket.contract.test.js
├── appointment.rule.test.js
└── appointment.cancel.test.js

docs/
├── srs.md
├── api-contract.md
├── thay-doi-thiet-ke.md
├── ket-qua-kiem-thu.md
└── screenshots/
    ├── 01-danh-sach-phieu.png
    ├── 02-phan-cong-ky-thuat-vien.png
    └── 03-chi-tiet-phieu.png
```

- `routes/`: định nghĩa endpoint và tiếp nhận HTTP request.
- `services/`: xử lý nghiệp vụ và kiểm tra quy tắc.
- `repositories/`: truy vấn và cập nhật PostgreSQL.
- `db/migrations/`: quản lý thay đổi cấu trúc database.
- `db/seed/`: tạo dữ liệu mẫu.
- `scripts/run-sql.js`: chạy migration/seed, đọc `.env`, hỗ trợ Windows.
- `tests/`: các bài kiểm thử tự động.

## 8. Phạm vi và hạn chế

- Chưa có đăng nhập và phân quyền; log dùng người dùng mặc định.
- Chưa triển khai đầy đủ FR4, FR5, FR7, FR8.
- Chức năng hủy lịch đã có API backend, chưa xác nhận nút hủy trên giao diện.
- Khung lịch hẹn giả định là 60 phút.

Chi tiết thay đổi thiết kế: `docs/thay-doi-thiet-ke.md`.
