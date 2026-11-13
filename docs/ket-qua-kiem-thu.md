# Kết quả kiểm thử – Sprint 2 (Buổi 10)

> Chỉ điền cột “Kết quả” sau khi TỰ chạy trên máy mình. Ảnh chụp lưu vào `docs/` với tên như cột “Bằng chứng”.

## 1. Luồng chính end-to-end (dữ liệu seed)
| Mã | Bước | Cách làm | Kết quả thực tế | Bằng chứng |
|---|---|---|---|---|
| E2E-01 | Xem danh sách chưa phân công | Mở http://localhost:3000 | PASS – Danh sách phiếu hiển thị từ API | `docs/screenshots/01-danh-sach-phieu.png` |
| E2E-02 | Xem gợi ý kỹ thuật viên | Mở màn hình phân công phiếu MM-DEMO-009 | PASS – Hiển thị gợi ý kỹ thuật viên | `docs/screenshots/02-phan-cong-ky-thuat-vien.png` |
| E2E-03 | Phân công thành công | Xem thông báo phân công thành công trên phiếu MM-DEMO-009 | PASS – Giao diện hiển thị trạng thái Đã phân công | `docs/screenshots/03-chi-tiet-phieu.png` |
| E2E-04 | Ghi log | `SELECT * FROM ticket_status_log; SELECT * FROM ticket_assignment_log;` có dòng mới | PASS – Có bản ghi trong hai bảng log | `docs/screenshots/e2e-04-log.png` |
| E2E-05 | Đặt lịch hẹn + cảnh báo trùng | Đặt 09:00 rồi 09:30 cùng ngày → lần hai báo trùng | ☐ | `docs/e2e-05-lich-hen.png` |

## 2. Ba trạng thái
| Mã | Trạng thái | Cách làm | Kết quả thực tế | Bằng chứng |
|---|---|---|---|---|
| ST-01 | Lỗi | Tắt backend rồi bấm bộ lọc khác → thông báo + nút Thử lại | PASS – Hiển thị Error khi chặn request API | `docs/st-01-loi.png` |
| ST-02 | Rỗng | Phiếu MM-DEMO-008 → “Không có kỹ thuật viên phù hợp”; hoặc bộ lọc không có dòng | PASS – Hiển thị Empty khi tìm kiếm không có kết quả | `docs/st-02-rong.png` |
| ST-03 | Tải | Chụp khung “Đang tải dữ liệu…” (làm chậm mạng ở DevTools) | PASS – Hiển thị Loading khi làm chậm mạng | `docs/st-03-tai.png` |

## 3. API bằng curl
| Mã | Lệnh | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|
| TC-01 | `curl -i localhost:3000/health` | 200 | PASS – HTTP 200 tại localhost:3002/health |
| TC-02 | `curl -i localhost:3000/api/tickets?status=NEW` | 200, `data` là mảng | ☐ |
| TC-04 | POST `/api/tickets` thiếu `ticket_code` | **422** kèm `fields.ticket_code` | ☐ |
| TC-05 | `curl -i localhost:3000/api/tickets/abc` | 400 `ID_KHONG_HOP_LE` | ☐ |
| TC-06 | PATCH phân công phiếu đã ASSIGNED | 409 `PHIEU_DA_THAY_DOI` | ☐ |

## 4. Unit test
Công cụ: Node.js Test Runner (`node --test`).
Lệnh thực hiện: `npm test`.
Kết quả kiểm thử tự động trên mã nguồn ZIP ngày 30/10/2026:
- Tổng số test: 32
- Thành công: 32
- Thất bại: 0
- Bỏ qua: 0
Các nhóm kiểm thử:
- Kiểm tra hợp đồng dữ liệu API.
- Kiểm tra tạo phiếu và dữ liệu không hợp lệ.
- Kiểm tra phân công kỹ thuật viên theo QT-08.
- Kiểm tra quy tắc đặt lịch và trùng lịch.
- Kiểm tra hủy lịch thành công.
- Kiểm tra hủy lịch không tồn tại (HTTP 404).
Kết luận: PASS (32/32).
Bằng chứng: `docs/screenshots/npm-test.png`.

## 5. Kiểm tra clone mới (README mục 3)
☑ PASS – Đã clone sạch tag `v0.2`, cài đặt dependencies, chạy migration, seed, test và API `/health`. Bước nào thiếu/sai: ______________________

## 6. Ghi chú lỗi
- Lỗi gặp: ______  · Cách xử lý: ______  · Kết quả: ______

## 7. Kiểm thử API hủy lịch hẹn
Môi trường: PostgreSQL `smartcrm_clone_test`, API localhost:3001.
| Mã | Trường hợp | Kết quả thực tế | Đánh giá |
|---|---|---|---|
| TC-07 | DELETE khi không có lịch hẹn đang hoạt động | HTTP 404, `KHONG_CO_LICH_HEN` | PASS |
| TC-08 | DELETE lịch hẹn hợp lệ | HTTP 200, `cancelled: true` | PASS |
| TC-09 | Kiểm tra dữ liệu sau khi hủy | `appointment_id = 1`, `is_active = false` | PASS |
Kết luận: Chức năng hủy lịch hẹn hoạt động đúng trên dữ liệu thử nghiệm.

## 8. Kiểm thử Migration và Seed
Môi trường: PostgreSQL `smartcrm_clone_test`.

### 8.1. Migration
Chạy lại `npm run db:migrate` trên database thử nghiệm.
Kết quả:
- `001_initial_schema.sql`: OK
- `002_technician_name.sql`: OK
- `003_one_active_appointment.sql`: OK
- Lịch hẹn đã hủy vẫn giữ `is_active = false`.
Đánh giá: PASS.

### 8.2. Seed
Chạy `npm run db:seed` hai lần trên database thử nghiệm.
| Bảng | Trước Seed | Sau 2 lần Seed |
|---|---:|---:|
| technician | 4 | 4 |
| ticket | 8 | 8 |
| technician_skill | 6 | 6 |
| appointment | 1 | 1 |
Kết luận: Không phát sinh thêm bản ghi trong lần kiểm thử. PASS.

## 9. Kiểm chứng BT2 trên bản clone sạch v0.2 (30/10/2026)

**Môi trường:** macOS, Node.js, PostgreSQL `smartcrm_bt2_verify`, API `http://localhost:3002`.

**Phiên bản:** Git tag `v0.2`, commit `f119c0b`.

### 9.1. Khả năng tái hiện

- Clone repository và checkout tag `v0.2`: PASS.
- `npm install`: PASS.
- `npm run db:migrate`: PASS, cả 3 migration.
- `npm run db:seed`: PASS.
- Chạy lại migration và seed: PASS; số phiếu giữ nguyên 8, kỹ thuật viên giữ nguyên 4.
- `npm test`: 32 PASS, 0 FAIL.
- `npm run dev`: PASS.
- `GET /health`: HTTP 200.
- `GET /api/tickets?limit=100`: HTTP 200, trả về 8 phiếu trước khi thực hiện CRUD.

### 9.2. CRUD Ticket

| Thao tác | Kết quả thực tế | Đánh giá |
|---|---|---|
| POST `/api/tickets` | HTTP 201, tạo `BT2-CRUD-001`, ID 16 | PASS |
| GET `/api/tickets/16` | HTTP 200 | PASS |
| PUT `/api/tickets/16` | HTTP 200, đổi HIGH thành MEDIUM | PASS |
| DELETE `/api/tickets/16` | HTTP 200, `deleted: true` | PASS |
| GET sau khi xóa | HTTP 404 | PASS |

### 9.3. CRUD Appointment

| Thao tác | Kết quả thực tế | Đánh giá |
|---|---|---|
| Tạo lịch cho phiếu `MM-DEMO-002` | Thành công trên giao diện, appointment ID 1 | PASS |
| GET `/api/tickets/5/appointments` | HTTP 200, trả về lịch hẹn | PASS |
| PUT `/api/tickets/5/appointments/current` | HTTP 200, đổi sang 02/11/2026 15:20 GMT+7 | PASS |
| DELETE `/api/tickets/5/appointments/current` | HTTP 200, `cancelled: true` | PASS |
| GET sau khi hủy | HTTP 200, `data: []` | PASS |

Hủy lịch là xóa mềm, không phải xóa vật lý.

### 9.4. Kiểm thử dữ liệu không hợp lệ và giá trị biên

| Trường hợp | Kết quả | Đánh giá |
|---|---|---|
| Tạo phiếu với `priority = INVALID` | HTTP 422 | PASS |
| Tạo phiếu với `ticket_code` dài 21 ký tự | HTTP 422 | PASS |
| Kiểm thử tự động bằng `npm test` | 32/32 PASS | PASS |

### 9.5. Kiểm thử giao diện

- Màn hình danh sách phiếu: hiển thị dữ liệu API thực tế.
- Màn hình phân công: hiển thị gợi ý kỹ thuật viên và phân công thành công.
- Màn hình chi tiết phiếu/lịch hẹn: tạo lịch thành công.
- Loading: hiển thị “Đang tải dữ liệu...” khi giới hạn tốc độ mạng bằng DevTools.
- Empty: tìm mã phiếu không tồn tại, hiển thị “Không tìm thấy phiếu phù hợp”.
- Error: chặn request API bằng DevTools, hiển thị thông báo lỗi và nút “Thử lại”.

### 9.6. Kiểm tra dữ liệu lịch sử

Truy vấn trực tiếp trên PostgreSQL `smartcrm_bt2_verify`:

| Bảng | Số bản ghi |
|---|---:|
| `ticket_assignment_log` | 1 |
| `ticket_status_log` | 1 |

Kết quả xác nhận có dữ liệu lịch sử trong cả hai bảng. Chưa đủ bằng chứng để khẳng định đáp ứng toàn bộ NFR4 về tỷ lệ ghi log và thời gian lưu trữ.

### 9.7. Giới hạn kiểm chứng

- Chưa có minh chứng chạy riêng kịch bản đặt hai lịch trùng nhau trong khoảng 60 phút trên môi trường này.
- Chưa kiểm chứng đăng nhập, phân quyền NFR3.
- Chưa đo hiệu năng NFR1, NFR2 và độ sẵn sàng NFR5.
- Chưa kiểm chứng toàn bộ FR7, FR8.

## 10. Kết quả kiểm thử Buổi 14 – Ngày 10/11/2026

### 10.1. Môi trường và phạm vi

- Module: L4 – Phân công kỹ thuật viên và lịch hẹn.
- Hệ điều hành: macOS.
- Backend: Node.js/Express.
- Database kiểm thử độc lập: `smartcrm_buoi14_test`.
- API: `http://localhost:3014`.
- Công cụ: curl, PostgreSQL psql, Node.js Test Runner.
- Test Plan: `docs/test-plan.md`, mục 6.
- Không sử dụng database chính `smartcrm` cho các kiểm thử này.

### 10.2. Tổng hợp kết quả thực tế

| Nhóm kiểm thử | Đã chạy | PASS | FAIL |
|---|---:|---:|---:|
| API và tích hợp thủ công (TC-01 đến TC-11) | 11 | 11 | 0 |
| Bộ unit test tự động (`npm test`) | 32 | 32 | 0 |

Lưu ý: 11 test case thủ công không được tính là 11 unit test. Bộ 32 test tự động được thống kê riêng.

### 10.3. Kết quả 11 test case

| ID | Nội dung | Kết quả thực tế | Đánh giá | Minh chứng |
|---|---|---|---|---|
| TC-01 | Xem danh sách phiếu | HTTP 200, trả 8 phiếu | PASS | `bt3-api-get-tickets.png` |
| TC-02 | Gợi ý kỹ thuật viên | HTTP 200, trả 3 kỹ thuật viên | PASS | `bt3-api-technician-suggestions.png` |
| TC-03 | Phân công kỹ thuật viên | HTTP 200, DB xác nhận ASSIGNED | PASS | `bt3-api-assign-technician.png` |
| TC-04 | Thiếu technicianId | HTTP 422, DB không thay đổi | PASS | `bt3-api-invalid-technician.png` |
| TC-05 | technicianId bằng 0 | HTTP 422, DB không thay đổi | PASS | `bt3-api-boundary-technician.png` |
| TC-06 | Phiếu không tồn tại | HTTP 404, KHONG_TIM_THAY_PHIEU | PASS | `bt3-api-ticket-not-found.png` |
| TC-07 | Đặt lịch khi chưa phân công | HTTP 409 CHUA_PHAN_CONG, không tạo lịch | PASS | `bt3-api-unassigned-appointment.png` |
| TC-08 | Hai yêu cầu đặt lịch đồng thời | Một HTTP 201, một HTTP 409 TRUNG_LICH; DB chỉ thêm 1 lịch | PASS | `bt3-concurrent-appointments.png` |
| TC-09 | Lịch cách nhau 30 phút | HTTP 409 TRUNG_LICH, không tạo lịch mới | PASS | `bt3-appointment-30min-conflict.png` |
| TC-10 | Lịch cách nhau đúng 60 phút | HTTP 201, DB có 2 lịch cách nhau 60 phút | PASS | `bt3-appointment-boundary-60min.png` |
| TC-11 | Gửi lại yêu cầu tạo lịch | HTTP 409 LICH_DA_THAY_DOI, không tạo bản ghi trùng | PASS | `bt3-duplicate-appointment.png` |

Các ảnh được lưu trong `docs/screenshots/`.

### 10.4. Kiểm chứng đặt lịch đồng thời – TC-08

Đây là nội dung bổ sung theo nhận xét BT2 của giảng viên.

Lần kiểm thử đầu tiên:
- Hai phiếu ID 4 và 7 được phân công cho kỹ thuật viên ID 4.
- Hai yêu cầu tạo lịch cùng thời điểm được gửi song song.
- Kết quả: HTTP 201 và HTTP 409 `TRUNG_LICH`.
- PostgreSQL xác nhận chỉ có một lịch được tạo.

Lần chạy lại để lưu bằng chứng:
- Hai phiếu ID 2 và 5 được phân công cho kỹ thuật viên ID 3 (Lê Thị Cẩm).
- Giờ hẹn: 15/11/2026, 14:45:54 (GMT+7).
- TC-08-A: HTTP 201, tạo appointment ID 3 cho ticket ID 2.
- TC-08-B: HTTP 409, lỗi `TRUNG_LICH`.
- PostgreSQL xác nhận tổng cộng 3 lịch, trong đó chỉ có một lịch mới từ lần chạy lại.
- Bằng chứng: `docs/screenshots/bt3-concurrent-appointments.png`.

Kết luận: PASS đối với các lần kiểm thử đồng thời đã thực hiện. Chưa thay thế cho kiểm thử tải hoặc kiểm chứng mọi tình huống cạnh tranh dữ liệu.

### 10.5. Kiểm thử quy tắc khoảng cách lịch hẹn

- TC-09: Hai lịch cách nhau 30 phút, hệ thống từ chối bằng HTTP 409 `TRUNG_LICH`.
- TC-10: Hai lịch cách nhau đúng 60 phút, hệ thống chấp nhận bằng HTTP 201.
- PostgreSQL xác nhận hai lịch của kỹ thuật viên ID 4 vào 14:36:33 và 15:36:33 ngày 13/11/2026 (GMT+7).
- TC-11: Gửi lại yêu cầu tạo lịch cho phiếu đã có lịch, hệ thống trả HTTP 409 `LICH_DA_THAY_DOI`; số bản ghi không tăng.

### 10.6. Kết quả kiểm thử tự động

- Lệnh: `npm test`.
- Tổng số test: 32.
- PASS: 32.
- FAIL: 0.
- Minh chứng: `docs/screenshots/bt3-unit-test-32-pass.png`.
- Commit sửa dữ liệu ngày cố định trong test: `28b9f4b`.

### 10.7. Giới hạn và công việc tiếp theo

- Chưa có bằng chứng kiểm thử xác thực và phân quyền; không kết luận NFR bảo mật đã đạt.
- Chưa thực hiện kiểm thử tải lớn và đo hiệu năng toàn hệ thống.
- Cần hoàn thiện Bug Log dựa trên lỗi thực tế, không tạo lỗi giả.
- Cần kiểm tra lại toàn bộ test sau khi hoàn tất các thay đổi mã nguồn.
- Cần commit và push tài liệu cùng ảnh minh chứng lên GitHub.

### 10.8. Kiểm thử hồi quy sau sửa BUG-03

- Lỗi: API nhận ngày hẹn không tồn tại `2026-11-31T10:00:00+07:00`.
- API kiểm thử: `POST /api/tickets/5/appointments`.
- Kết quả trước sửa: HTTP 500 `LOI_HE_THONG`.
- PostgreSQL ghi nhận mã lỗi `22008`.
- Nguyên nhân: `Date.parse()` chưa kiểm tra đầy đủ ngày hợp lệ theo lịch.
- Cách sửa: bổ sung hàm `ngayHenHopLe()` trong `ticket.service.js`.
- Kết quả sau sửa: HTTP 422 `DU_LIEU_KHONG_HOP_LE`.
- Commit sửa lỗi: `8f0ada3`.
- Bằng chứng trước sửa: `docs/screenshots/bt3-bug03-before-fix.png`.
- Bằng chứng sau sửa: `docs/screenshots/bt3-bug03-after-fix.png`.

### 10.9. Kết quả Unit Test mới nhất

- Lệnh: `npm test`.
- Tổng số test: 35.
- PASS: 35.
- FAIL: 0.
- Số test bổ sung cho BUG-03: 3.
- Các trường hợp bổ sung: ngày 31/11 không tồn tại, ngày 29/02 năm không nhuận, ngày 29/02 năm nhuận.
- Bằng chứng: `docs/screenshots/bt3-unit-test-35-pass.png`.

Kết quả 32/32 PASS tại mục 10.6 là kết quả trước khi bổ sung ba test mới.

### 10.10. Kiểm chứng chạy lại Migration

- Database: `smartcrm_buoi14_test`.
- Đặt `is_active = false` cho appointment ID 1.
- Chạy lại các Migration thành công.
- Kiểm tra sau Migration: appointment ID 1 vẫn có `is_active = false`.
- Kết quả: PASS.
- Bằng chứng: `docs/screenshots/bt3-migration-rerun-pass.png`.
- Commit sửa lỗi liên quan: `0764fe4`.

### 10.11. Tổng kết và giới hạn

- API và kiểm thử tích hợp thủ công TC-01 đến TC-11: 11 PASS, 0 FAIL.
- Bộ Unit Test mới nhất: 35 PASS, 0 FAIL.
- Bug Log: 3 lỗi đã ghi nhận; xem `docs/bug-log.md`.
- BUG-03 đã được tái hiện trước sửa và kiểm chứng sau sửa.
- BUG-02 có kiểm chứng hồi quy sau sửa; chưa tái hiện riêng phiên bản lỗi cũ trong buổi này.
- Chưa có đủ bằng chứng kiểm thử đăng nhập, phân quyền và hiệu năng tải lớn.
- Cần commit và push tài liệu, ảnh minh chứng trước khi nộp.

## 11. Kết quả kiểm thử triển khai Docker – BT3 (13/11/2026)

### 11.1. Mục tiêu kiểm thử

Kiểm chứng khả năng triển khai và vận hành module Smart CRM – L4 bằng Docker Compose, bảo đảm hệ thống có thể khởi động từ mã nguồn trên GitHub, tự động khởi tạo cơ sở dữ liệu và cung cấp API cùng giao diện phục vụ demo.

### 11.2. Môi trường kiểm thử

| Thành phần | Cấu hình |
|---|---|
| Máy kiểm thử | macOS |
| Công cụ triển khai | Docker Desktop, Docker Compose |
| Backend | Node.js, Express |
| Cơ sở dữ liệu | PostgreSQL 16 trong Docker |
| Frontend | HTML/CSS/JavaScript, Vue 3 |
| Database Docker | `smartcrm_docker` |
| Cổng ứng dụng gốc | `3015` |
| Cổng bản clone kiểm thử | `3016` |
| Nguồn mã | GitHub, nhánh `main` |

Bản clone kiểm thử sử dụng Docker Compose project và database volume riêng, không can thiệp vào cơ sở dữ liệu của project gốc.

### 11.3. Kiểm thử Docker Compose

| Mã TC | Nội dung kiểm thử | Kết quả |
|---|---|---|
| BT3-01 | Build và khởi động bằng `docker compose up -d --build` | PASS |
| BT3-02 | PostgreSQL khởi động và đạt trạng thái healthy | PASS |
| BT3-03 | Migration tự động hoàn thành với exit code 0 | PASS |
| BT3-04 | Seed tự động hoàn thành với exit code 0 | PASS |
| BT3-05 | API khởi động và đạt trạng thái healthy | PASS |
| BT3-06 | Endpoint `/health` trả HTTP 200 | PASS |
| BT3-07 | Endpoint `/api/tickets` trả 8 phiếu demo | PASS |

**Kết quả:** 7/7 trường hợp kiểm thử triển khai Docker đạt yêu cầu.

### 11.4. Kiểm thử Migration và Seed

Quá trình triển khai sử dụng thứ tự phụ thuộc:

`PostgreSQL → Migration → Seed → API`

Các service Migration và Seed kết thúc với exit code 0 trước khi API khởi động.

Kiểm thử chạy lại Seed được thực hiện hai lần trên database thử nghiệm. Số bản ghi trước và sau không thay đổi:

| Bảng | Số bản ghi |
|---|---:|
| `service_center` | 3 |
| `incident_category` | 3 |
| `technician` | 4 |
| `technician_skill` | 6 |
| `ticket` | 8 |
| `appointment` | 0 |
| `ticket_assignment_log` | 0 |
| `ticket_status_log` | 0 |

**Kết quả:** PASS – Không phát sinh bản ghi trùng trong các bảng được kiểm tra sau khi chạy lại Seed.

Các số liệu trên được ghi nhận trước khi thực hiện thao tác phân công kỹ thuật viên trong bản clone.

### 11.5. Kiểm thử Clean Clone từ GitHub

Repository được clone vào thư mục độc lập `smartcrm-bt3-clone-test`.

Bản clone sử dụng cổng `3016` để tránh xung đột với ứng dụng gốc trên cổng `3015`.

Kết quả kiểm thử:

- Docker Compose khởi động thành công bốn service.
- PostgreSQL, Migration, Seed và API đạt trạng thái mong đợi.
- API `/health` trả HTTP 200.
- API `/api/tickets` trả 8 phiếu demo.
- Giao diện danh sách phiếu hiển thị trong trình duyệt.
- Có thể thực hiện thao tác phân công kỹ thuật viên qua giao diện.

**Kết quả:** PASS – Bản clone có thể triển khai và chạy độc lập trong môi trường thử nghiệm đã cấu hình.

### 11.6. Kiểm thử E2E phân công kỹ thuật viên và ghi log

**Dữ liệu kiểm thử:**

- Phiếu: `MM-DEMO-002`
- Kỹ thuật viên được chọn trên giao diện: Nguyễn Văn An
- Thao tác: Chọn kỹ thuật viên và xác nhận phân công

**Kết quả trên giao diện:**

- Hiển thị thông báo phân công thành công.
- Trạng thái phiếu chuyển sang Đã phân công.

**Kết quả truy vấn PostgreSQL:**

| Trường | Giá trị |
|---|---|
| `ticket_code` | `MM-DEMO-002` |
| `status` | `ASSIGNED` |
| `from_technician_id` | `NULL` |
| `to_technician_id` | `1` |
| `changed_by` | `1` |
| `changed_at` | `2026-11-13 06:53:41.743863` |

Bảng `ticket_assignment_log` ghi nhận một bản ghi phân công cho phiếu được kiểm thử.

**Kết quả:** PASS – Thao tác phân công qua giao diện được lưu vào PostgreSQL và tạo lịch sử phân công.

### 11.7. Kiểm thử tự động

Chạy lệnh `npm test` trên máy macOS tại thư mục bản clone.

| Chỉ số | Kết quả |
|---|---:|
| Tổng số Unit Test | 35 |
| PASS | 35 |
| FAIL | 0 |
| SKIPPED | 0 |
| CANCELLED | 0 |

Các nhóm kiểm thử bao gồm:

- Kiểm tra dữ liệu phiếu và hợp đồng API.
- Gợi ý, phân công và đổi kỹ thuật viên.
- Cập nhật trạng thái phiếu.
- Tạo, đổi và hủy lịch hẹn.
- Phát hiện lịch hẹn trùng.
- Xử lý dữ liệu không hợp lệ, giá trị biên và mã lỗi HTTP.

**Kết quả:** PASS – 35/35 bài kiểm thử tự động thành công.

Lưu ý: Unit Test được thực hiện trên máy macOS, không chạy bên trong container API.

### 11.8. Giới hạn kiểm chứng

- Chưa kiểm chứng triển khai trên máy chủ production hoặc dịch vụ cloud.
- Chưa hoàn thiện đăng nhập và phân quyền theo vai trò.
- Chưa xác nhận đầy đủ mọi luồng giao diện, đặc biệt là các chức năng ngoài luồng phân công đã kiểm thử.
- Dữ liệu sử dụng là dữ liệu demo.
- Các kết quả kiểm thử chỉ áp dụng cho phiên bản mã nguồn và môi trường đã kiểm tra.

### 11.9. Tổng kết BT3

Các hạng mục đã kiểm chứng thành công:

- Triển khai Docker Compose.
- Tự động chạy Migration và Seed.
- Healthcheck cho PostgreSQL và API.
- Khởi chạy ứng dụng trên bản clone sạch.
- Kiểm thử phân công kỹ thuật viên và ghi log trong database.
- Chạy 35/35 Unit Test thành công.

**Kết luận:** Module Smart CRM – L4 đáp ứng các trường hợp kiểm thử triển khai và vận hành cục bộ đã thực hiện trong BT3. Các giới hạn về bảo mật, production và những luồng chưa kiểm chứng tiếp tục được ghi nhận để phát triển sau.