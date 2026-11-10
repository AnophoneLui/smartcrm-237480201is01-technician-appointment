# TEST PLAN – SMART CRM MEKONG MOBILE

**Học phần:** Chuyên đề tốt nghiệp 1
**Module:** L4 – Phân công kỹ thuật viên và lịch hẹn
**Phiên bản:** Buổi 14 – Kiểm thử hệ thống cá nhân
**Ngày lập:** 10/11/2026

## 1. Phạm vi kiểm thử

Kiểm thử các chức năng thuộc module L4:

- Quản lý phiếu dịch vụ (Ticket).
- Gợi ý và phân công kỹ thuật viên.
- Thay đổi kỹ thuật viên được phân công.
- Cập nhật trạng thái phiếu.
- Tạo, thay đổi và hủy lịch hẹn.
- Kiểm tra dữ liệu đầu vào và xử lý lỗi.
- Kiểm tra lịch sử thay đổi và khả năng tái lập môi trường.

Không đánh giá các chức năng chưa triển khai đầy đủ như đăng nhập, phân quyền và hiệu năng toàn hệ thống là đã đạt yêu cầu.

## 2. Môi trường kiểm thử

- Hệ điều hành: macOS.
- Backend: Node.js.
- Cơ sở dữ liệu: PostgreSQL.
- Công cụ kiểm thử tự động: Node.js Test Runner.
- Công cụ kiểm thử API: curl.
- Trình duyệt: Google Chrome.
- Mã nguồn: GitHub repository của dự án Smart CRM.
- Lệnh chạy unit test: `npm test`.

## 3. Chiến lược kiểm thử

Áp dụng các mức kiểm thử:

- **Unit Test:** Kiểm tra validation, quy tắc nghiệp vụ và xử lý dữ liệu.
- **Integration Test:** Kiểm tra sự phối hợp giữa API, service, repository và cơ sở dữ liệu.
- **System/API Test:** Kiểm tra các chức năng thực tế qua API và giao diện.

Các test case được lựa chọn phải bao phủ 5 loại:

1. Luồng đúng.
2. Giá trị biên.
3. Dữ liệu không hợp lệ.
4. Bảo mật hoặc chất lượng dữ liệu.
5. Khả năng tái lập.

Dự kiến thực hiện 10–12 test case có kết quả thực tế và bằng chứng tương ứng.

## 4. Tiêu chí đánh giá và hoàn thành

- **PASS:** Kết quả thực tế khớp với kết quả mong đợi.
- **FAIL:** Kết quả thực tế khác kết quả mong đợi.
- Mỗi test case thực hiện phải được ghi kết quả và lưu ảnh minh chứng trong `docs/screenshots/`.
- Các lỗi phát hiện được ghi vào Bug Log, có mức độ nghiêm trọng, bước tái hiện và kết quả kiểm thử lại.
- Mỗi lỗi được sửa phải có commit riêng để truy vết.
- Chạy lại toàn bộ bộ kiểm thử tự động sau khi sửa lỗi.
- Chỉ kết luận hoàn thành khi các test case trong phạm vi bắt buộc đạt PASS và có bằng chứng phù hợp.

## 5. Kết quả kiểm thử tự động ban đầu

Ngày 10/11/2026, sau khi sửa lỗi dữ liệu ngày cố định trong unit test:

- Tổng số test: 32.
- PASS: 32.
- FAIL: 0.
- Lệnh thực hiện: `npm test`.
- Minh chứng: `docs/screenshots/bt3-unit-test-35-pass.png`.
- Commit sửa lỗi test: `28b9f4b`.

Kết quả này chỉ xác nhận bộ kiểm thử tự động hiện tại; chưa thay thế kết quả của 10–12 test case thực hành Buổi 14.
## 6. Danh sách test case thực thi – Buổi 14 (10/11/2026)

**Môi trường:** macOS, Node.js, PostgreSQL `smartcrm_buoi14_test`, API `http://localhost:3014`.

**Quy ước:** Các trường hợp TC-01 đến TC-11 được thực hiện qua API `curl` và đối chiếu PostgreSQL khi cần. Đây là kiểm thử API/tích hợp thủ công, không phải unit test. Bộ 35 unit test tự động được báo cáo riêng.

| ID | Tiền điều kiện | Bước thực hiện | Dữ liệu kiểm thử | Kết quả mong đợi (đo được) | Ưu tiên | Kết quả thực tế | PASS/FAIL |
|---|---|---|---|---|---|---|---|
| TC-01 | API chạy, DB đã seed | GET `/api/tickets` | 8 phiếu demo | HTTP 200, trả danh sách 8 phiếu | High | HTTP 200, có 8 phiếu | PASS |
| TC-02 | Có phiếu ID 1 | GET `/api/tickets/1/suggestions` | ticketId=1 | HTTP 200, trả danh sách kỹ thuật viên gợi ý | High | HTTP 200, có 3 kỹ thuật viên | PASS |
| TC-03 | Phiếu ID 1 chưa phân công | PATCH `/api/tickets/1/technician`, kiểm tra DB | technicianId=1, reason hợp lệ | HTTP 200, phiếu chuyển ASSIGNED, technician_id=1 | High | HTTP 200, DB xác nhận ASSIGNED và ID 1 | PASS |
| TC-04 | Phiếu ID 8 chưa phân công | PATCH phân công thiếu technicianId, kiểm tra DB | Thiếu trường technicianId | HTTP 422, không thay đổi phiếu | High | HTTP 422, DB vẫn NEW và chưa phân công | PASS |
| TC-05 | Phiếu ID 8 chưa phân công | PATCH phân công với ID biên, kiểm tra DB | technicianId=0 | HTTP 422, không thay đổi phiếu | Medium | HTTP 422, DB không thay đổi | PASS |
| TC-06 | Không có phiếu ID 999999 | GET `/api/tickets/999999` | ticketId=999999 | HTTP 404, mã KHONG_TIM_THAY_PHIEU | Medium | HTTP 404, KHONG_TIM_THAY_PHIEU | PASS |
| TC-07 | Phiếu ID 8 chưa phân công | POST lịch hẹn, sau đó GET lịch | gioHen hợp lệ trong tương lai | HTTP 409 CHUA_PHAN_CONG, GET trả mảng rỗng | High | HTTP 409, GET 200 với data=[] | PASS |
| TC-08 | Hai phiếu cùng kỹ thuật viên, chưa có lịch | Gửi đồng thời 2 POST đặt lịch cùng giờ, kiểm tra DB | Lần chạy lại: ticketId=2 và 5, technicianId=3, cùng giờ 15/11/2026 | Một HTTP 201, một HTTP 409 TRUNG_LICH; DB chỉ thêm 1 lịch | Critical | HTTP 201 và 409; DB chỉ thêm appointment ID 3 cho phiếu 2 | PASS |
| TC-09 | Phiếu ID 4 có lịch, phiếu ID 7 cùng kỹ thuật viên | POST lịch cho phiếu 7 cách lịch phiếu 4 đúng 30 phút | 13/11/2026 15:06:33 (GMT+7) | HTTP 409 TRUNG_LICH, không thêm lịch | High | HTTP 409, DB vẫn chỉ có 1 lịch tại thời điểm kiểm thử | PASS |
| TC-10 | Phiếu ID 4 có lịch, phiếu ID 7 chưa có lịch | POST lịch cho phiếu 7 cách lịch phiếu 4 đúng 60 phút | 13/11/2026 15:36:33 (GMT+7) | HTTP 201, DB có 2 lịch cách nhau 60 phút | High | HTTP 201, DB có đúng 2 lịch | PASS |
| TC-11 | Phiếu ID 7 đã có lịch | Gửi lại POST tạo lịch cùng giờ, kiểm tra DB | 13/11/2026 15:36:33 (GMT+7) | HTTP 409 LICH_DA_THAY_DOI, DB không thêm lịch | High | HTTP 409, DB vẫn có 2 lịch | PASS |

### 6.1. Phân loại kiểm thử

- **Luồng đúng:** TC-01, TC-02, TC-03, TC-10.
- **Giá trị biên:** TC-05, TC-09, TC-10.
- **Dữ liệu không hợp lệ:** TC-04, TC-05, TC-06.
- **Chất lượng và tính nhất quán dữ liệu:** TC-07, TC-08, TC-09, TC-11.
- **Khả năng tái lập:** TC-11; TC-08 được chạy lại trên dữ liệu kiểm thử riêng và xác minh kết quả.

### 6.2. Tổng hợp kết quả

- Số test case API/tích hợp thủ công đã chạy: **11**.
- PASS: **11**.
- FAIL: **0**.
- Unit test tự động: **35 PASS / 35 test**.
- Kiểm thử đồng thời: **PASS trong các lần chạy đã ghi nhận**.
- Giới hạn: Chưa kiểm chứng xác thực/phân quyền, kiểm thử tải lớn và hiệu năng toàn hệ thống.

### 6.3. Bằng chứng

| Test case | Ảnh minh chứng |
|---|---|
| TC-01 | `docs/screenshots/bt3-api-get-tickets.png` |
| TC-02 | `docs/screenshots/bt3-api-technician-suggestions.png` |
| TC-03 | `docs/screenshots/bt3-api-assign-technician.png` |
| TC-04 | `docs/screenshots/bt3-api-invalid-technician.png` |
| TC-05 | `docs/screenshots/bt3-api-boundary-technician.png` |
| TC-06 | `docs/screenshots/bt3-api-ticket-not-found.png` |
| TC-07 | `docs/screenshots/bt3-api-unassigned-appointment.png` |
| TC-08 | `docs/screenshots/bt3-concurrent-appointments.png` |
| TC-09 | `docs/screenshots/bt3-appointment-30min-conflict.png` |
| TC-10 | `docs/screenshots/bt3-appointment-boundary-60min.png` |
| TC-11 | `docs/screenshots/bt3-duplicate-appointment.png` |
| Unit test | `docs/screenshots/bt3-unit-test-35-pass.png` |
