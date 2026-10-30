# Nhật ký thay đổi thiết kế

## Sau phản hồi Bài tập 1
> Ghi ngày thực hiện thực tế trước khi nộp.

### TD-01 – Đồng bộ số lượng User Story và Use Case
- **Phản hồi/điểm cần kiểm tra:** SRS, sơ đồ use case và hợp đồng API phải dùng cùng một bộ mã US/UC.
- **Quyết định:** SỬA.
- **Lý do:** Bản tài liệu trước đây chưa thống nhất số lượng và mã User Story. SRS hiện tại sử dụng US1–US12 và UC1–UC10; cần đối chiếu bảng truy vết, sơ đồ use case và hợp đồng API để tránh liên kết sai mã.
- **Ảnh hưởng:** `docs/srs.md`, `docs/use-case-diagram.png`, `docs/api-contract.md`. Đối chiếu lại với bản BT1 cuối cùng trước khi sửa sơ đồ.

### TD-02 – Bổ sung bảng lịch sử trạng thái phiếu
- **Phản hồi/điểm cần kiểm tra:** Cần truy vết thay đổi trạng thái phiếu.
- **Quyết định:** SỬA.
- **Lý do:** Lịch sử giúp kiểm tra ai đổi trạng thái và thời điểm thay đổi.
- **Ảnh hưởng:** Bảng `ticket_status_log`, migration SQL và nghiệp vụ cập nhật trạng thái.

### TD-03 – Bổ sung lịch sử phân công
- **Phản hồi/điểm cần kiểm tra:** Khi đổi kỹ thuật viên cần lưu lý do và người thực hiện.
- **Quyết định:** SỬA.
- **Lý do:** Có thể kiểm tra lại lịch sử phân công/đổi phân công.
- **Ảnh hưởng:** Bảng `ticket_assignment_log` và nghiệp vụ phân công/đổi kỹ thuật viên. Ở Buổi 8, chức năng này chưa hoàn thành; đến phiên bản BT2, backend đã triển khai ghi lịch sử phân công trong giao dịch cơ sở dữ liệu. Kiểm chứng trên `smartcrm_bt2_verify` ghi nhận 1 bản ghi trong bảng `ticket_assignment_log`. Chưa kiểm chứng đầy đủ yêu cầu lưu trữ log NFR4.

### TD-04 – Bổ sung bảng trung tâm và loại sự cố
- **Phản hồi/điểm cần kiểm tra:** Các khóa ngoại `center_id` và `category_id` phải có bảng tham chiếu.
- **Quyết định:** SỬA.
- **Lý do:** Đảm bảo toàn vẹn tham chiếu trong cơ sở dữ liệu.
- **Ảnh hưởng:** `service_center`, `incident_category`, `technician`, `technician_skill`, `ticket`.

### TD-05 – Phân lớp backend
- **Phản hồi/điểm cần kiểm tra:** Không đặt toàn bộ truy vấn SQL trong route.
- **Quyết định:** SỬA.
- **Lý do:** Tách trách nhiệm để dễ kiểm thử và bảo trì.
- **Ảnh hưởng:** `routes → service → repository`.

### TD-06 – Xác định phạm vi module Sprint 1
- **Phản hồi/điểm cần kiểm tra:** Không nên làm toàn bộ Smart CRM trong một sprint.
- **Quyết định:** GIỮ phạm vi L4; ưu tiên CRUD phiếu trước.
- **Lý do:** Phù hợp mục tiêu workshop là có một module lõi chạy được.
- **Ảnh hưởng:** Trong Sprint 1, ưu tiên triển khai API CRUD `tickets`; các chức năng gợi ý kỹ thuật viên, phân công, lịch hẹn và đóng phiếu chưa được tuyên bố hoàn thành tại thời điểm đó. Đến phiên bản BT2, đã kiểm chứng API CRUD Ticket, CRUD Appointment, giao diện gợi ý/phân công kỹ thuật viên và cập nhật trạng thái có ghi log. Các chức năng chưa có minh chứng kiểm thử đầy đủ vẫn được ghi nhận là giới hạn, không tự động đánh giá PASS.

### TD-07 – Xóa mềm phiếu
- **Phản hồi/điểm cần kiểm tra:** Không xóa hẳn phiếu đã có lịch sử nghiệp vụ.
- **Quyết định:** SỬA.
- **Lý do:** Giữ dữ liệu để truy vết; đánh dấu `is_deleted`.
- **Ảnh hưởng:** Cột `ticket.is_deleted` và endpoint DELETE.

## Điều chỉnh trong Sprint 2 (Buổi 9–10)
> Ghi ngày thực hiện thực tế: ____/____/2026

### TD-08 – Hợp đồng dữ liệu tường minh ở ranh giới service → API
- **Quyết định:** SỬA. Thêm `ticket.contract.js` (toTicketView…), đổi phản hồi sang `camelCase`, thống nhất lỗi `{error, message, fields}`, dữ liệu sai trả 422.
- **Lý do:** Giao diện không được đọc tên cột bảng; đổi tên cột chỉ phải sửa một chỗ. Sửa luôn lỗi Sprint 1: `create/update` gọi `validateTicket` nhưng bỏ qua kết quả nên dữ liệu sai lọt xuống CSDL.
- **Ảnh hưởng:** `docs/api-contract.md`, service, routes, test.

### TD-09 – Thêm `technician.full_name`
- **Quyết định:** SỬA (migration 002). **Lý do:** Giao diện cần hiển thị tên kỹ thuật viên; ERD BT1 chưa có cột tên. **Ảnh hưởng:** bảng `technician`, seed 002.

### TD-10 – Hoãn đăng nhập/phân quyền
- **Quyết định:** HOÃN (cắt phạm vi). **Lý do:** Ưu tiên luồng chính, ba trạng thái, test và README. Hạn chế: log ghi `changed_by = 1`; QT-14 (chỉ xem trung tâm mình) và QT-15 (che số điện thoại) chưa thi hành. **Kế hoạch:** làm ở sprint sau nếu còn thời gian.

### TD-11 – Giả định khung lịch hẹn 60 phút
- **Quyết định:** GIẢ ĐỊNH. SRS chưa nêu thời lượng một lịch hẹn; hai lịch của cùng một kỹ thuật viên cách nhau dưới 60 phút bị coi là trùng (FR6). **Cần xác nhận lại với GVHD/nghiệp vụ.**

### TD-12 – Giao diện dùng Vue 3 qua CDN, không dùng bước build
- **Quyết định:** GIỮ ĐƠN GIẢN. **Lý do:** Không cần cài thêm công cụ build, backend phục vụ trực tiếp `src/frontend`, giảm rủi ro khi người khác clone và chạy. **Hạn chế:** cần Internet để tải Vue; chưa dùng single-file component.

### TD-13 – Bổ sung chức năng hủy lịch hẹn
- **Quyết định:** BỔ SUNG API DELETE `/api/tickets/:id/appointments/current`.
- **Lý do:** Hoàn thiện CRUD cho đối tượng Appointment.
- **Cách xử lý:** Hủy mềm bằng cách cập nhật `is_active = false`, không xóa dữ liệu lịch sử.
- **Ảnh hưởng:** Routes, Service, Repository và `tests/appointment.cancel.test.js`.

### TD-14 – Đảm bảo Migration chạy lại an toàn
- **Quyết định:** SỬA migration `003_one_active_appointment.sql`.
- **Lý do:** Tránh kích hoạt lại lịch hẹn đã hủy khi chạy migration lần nữa.
- **Cách xử lý:** Chỉ chuẩn hóa dữ liệu khi bổ sung cột `is_active` lần đầu; giữ nguyên trạng thái trong các lần chạy sau.
- **Kiểm thử:** Migration chạy lại thành công, lịch đã hủy vẫn có `is_active = false`.
