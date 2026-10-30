# Kết quả kiểm thử – Sprint 2 (Buổi 10)

> Chỉ điền cột “Kết quả” sau khi TỰ chạy trên máy mình. Ảnh chụp lưu vào `docs/` với tên như cột “Bằng chứng”.

## 1. Luồng chính end-to-end (dữ liệu seed)
| Mã | Bước | Cách làm | Kết quả thực tế | Bằng chứng |
|---|---|---|---|---|
| E2E-01 | Xem danh sách chưa phân công | Mở http://localhost:3000 | ☐ | `docs/e2e-01-danh-sach.png` |
| E2E-02 | Xem gợi ý kỹ thuật viên | Bấm Phân công ở MM-DEMO-002 | ☐ | `docs/e2e-02-goi-y.png` |
| E2E-03 | Phân công thành công | Chọn KTV → Xác nhận; phiếu chuyển “Đã phân công” | ☐ | `docs/e2e-03-phan-cong.png` |
| E2E-04 | Ghi log | `SELECT * FROM ticket_status_log; SELECT * FROM ticket_assignment_log;` có dòng mới | ☐ | `docs/e2e-04-log.png` |
| E2E-05 | Đặt lịch hẹn + cảnh báo trùng | Đặt 09:00 rồi 09:30 cùng ngày → lần hai báo trùng | ☐ | `docs/e2e-05-lich-hen.png` |

## 2. Ba trạng thái
| Mã | Trạng thái | Cách làm | Kết quả thực tế | Bằng chứng |
|---|---|---|---|---|
| ST-01 | Lỗi | Tắt backend rồi bấm bộ lọc khác → thông báo + nút Thử lại | ☐ | `docs/st-01-loi.png` |
| ST-02 | Rỗng | Phiếu MM-DEMO-008 → “Không có kỹ thuật viên phù hợp”; hoặc bộ lọc không có dòng | ☐ | `docs/st-02-rong.png` |
| ST-03 | Tải | Chụp khung “Đang tải dữ liệu…” (làm chậm mạng ở DevTools) | ☐ | `docs/st-03-tai.png` |

## 3. API bằng curl
| Mã | Lệnh | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|
| TC-01 | `curl -i localhost:3000/health` | 200 | ☐ |
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
Bằng chứng: `docs/npm-test.png`.

## 5. Kiểm tra clone mới (README mục 3)
☐ Đã clone vào thư mục mới và làm đúng từng bước README. Bước nào thiếu/sai: ______________________

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
