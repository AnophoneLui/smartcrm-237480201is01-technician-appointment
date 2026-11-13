# BUG LOG – SMART CRM MEKONG MOBILE

**Module:** L4 – Phân công kỹ thuật viên và lịch hẹn
**Ngày cập nhật:** 10/11/2026
**Môi trường:** macOS, Node.js, PostgreSQL

## 1. Danh sách lỗi

| ID | Mức độ | Mô tả | Bước tái hiện / Điều kiện | Kết quả mong đợi | Kết quả ghi nhận | Trạng thái / Commit |
|---|---|---|---|---|---|---|
| BUG-01 | Minor | Unit test phụ thuộc ngày hẹn cố định | Chạy test sau khi ngày hẹn trong fixture đã qua | Test không phụ thuộc ngày chạy | Fixture hết hạn làm test thất bại | Đã sửa – `28b9f4b` |
| BUG-02 | Major (rủi ro dữ liệu) | Migration có nguy cơ kích hoạt lại lịch đã hủy | Chạy lại migration cũ trên dữ liệu có lịch đã hủy; chưa tái hiện trực tiếp trước sửa | Lịch đã hủy giữ `is_active=false` | Phát hiện rủi ro từ logic migration cũ; sau sửa đã kiểm chứng PASS | Đã sửa – `0764fe4` |
| BUG-03 | Major (đánh giá sơ bộ) | Ngày hẹn không tồn tại gây HTTP 500 | POST `/api/tickets/5/appointments` với ngày `2026-11-31T10:00:00+07:00` | HTTP 422 `DU_LIEU_KHONG_HOP_LE` | Trước sửa: HTTP 500 `LOI_HE_THONG` | Đã sửa – `8f0ada3` |

## 2. Chi tiết BUG-01

**Mô tả:** Unit test sử dụng thời gian lịch hẹn cố định. Khi thời gian thực vượt qua ngày được khai báo, dữ liệu kiểm thử không còn hợp lệ.

**Nguyên nhân:** Test fixture phụ thuộc ngày cố định.

**Cách khắc phục:** Điều chỉnh dữ liệu ngày hẹn trong `tests/ticket.service.test.js`.

**Commit:** `28b9f4b`

**Kiểm chứng:** `npm test` chạy 32 test, 32 PASS, 0 FAIL.

**Bằng chứng:** `docs/screenshots/bt3-unit-test-32-pass.png`

## 3. Chi tiết BUG-02

**Mô tả:** Phiên bản Migration trước đây cập nhật lại `is_active` của các lịch hẹn mỗi khi chạy. Điều này có thể làm lịch hẹn đã hủy trở thành lịch đang hoạt động.

**Nguyên nhân:** Lệnh UPDATE được thực hiện lại khi Migration chạy nhiều lần.

**Cách khắc phục:** Chỉ chuẩn hóa dữ liệu khi bổ sung cột `is_active` lần đầu.

**Commit:** `0764fe4`

**Kiểm chứng sau sửa:**
1. Trên database `smartcrm_buoi14_test`, đặt `is_active = false` cho appointment ID 1.
2. Chạy lại 3 Migration thành công.
3. Truy vấn PostgreSQL sau khi chạy.
4. Appointment ID 1 vẫn có `is_active = false`; ID 2 và ID 3 vẫn là `true`.

**Kết quả:** PASS.

**Bằng chứng:** `docs/screenshots/bt3-migration-rerun-pass.png`

**Giới hạn:** Chưa thực hiện kiểm thử tái hiện lỗi trên phiên bản Migration cũ trong buổi này. Mức Major được đánh giá theo tác động tiềm tàng đến tính toàn vẹn dữ liệu.

## 4. Chi tiết BUG-03

**Mức độ:** Major (đánh giá sơ bộ theo ảnh hưởng đến xử lý dữ liệu đầu vào).

**Mô tả:** API chấp nhận ngày không tồn tại trong bước kiểm tra dữ liệu, sau đó phát sinh lỗi PostgreSQL và trả HTTP 500 thay vì HTTP 422.

**Dữ liệu tái hiện:** `2026-11-31T10:00:00+07:00`

**API:** `POST /api/tickets/5/appointments`

**Kết quả mong đợi:** HTTP 422 `DU_LIEU_KHONG_HOP_LE`.

**Kết quả trước sửa:** HTTP 500 `LOI_HE_THONG`. PostgreSQL ghi nhận lỗi `22008` (date/time field value out of range).

**Nguyên nhân:** JavaScript `Date.parse()` tự chuẩn hóa một số ngày không tồn tại nên chưa đủ để kiểm tra ngày hợp lệ theo lịch.

**Cách khắc phục:** Bổ sung hàm `ngayHenHopLe()` trong `src/backend/services/ticket.service.js` để kiểm tra ngày, tháng, năm, năm nhuận và thời gian trước khi lưu vào PostgreSQL.

**Kết quả sau sửa:** API trả HTTP 422 `DU_LIEU_KHONG_HOP_LE`.

**Kiểm thử hồi quy:** Bổ sung 3 Unit Test trong `tests/appointment.rule.test.js`. Tổng cộng 35 PASS, 0 FAIL.

**Bằng chứng:**
- `docs/screenshots/bt3-bug03-before-fix.png`
- `docs/screenshots/bt3-bug03-after-fix.png`
- `docs/screenshots/bt3-unit-test-35-pass.png`

**Trạng thái:** Đã sửa, kiểm thử thành công và tạo commit riêng `8f0ada3`.


## 5. Ghi chú kiểm chứng

- Đã ghi nhận 3 lỗi, gồm 2 lỗi được đánh giá mức Major.
- BUG-02 được đánh giá theo rủi ro dữ liệu; chưa có bằng chứng tái hiện trực tiếp trên phiên bản trước sửa.
- Bộ kiểm thử hồi quy mới nhất: 35 PASS, 0 FAIL.
- Các mã commit được xác nhận tồn tại trong repository.
