# Nhật ký thay đổi thiết kế

## Sau phản hồi Bài tập 1
> Ghi ngày thực hiện thực tế trước khi nộp.

### TD-01 – Đồng bộ số lượng User Story và Use Case
- **Phản hồi/điểm cần kiểm tra:** SRS, sơ đồ use case và hợp đồng API phải dùng cùng một bộ mã US/UC.
- **Quyết định:** SỬA.
- **Lý do:** Bản BT1 đã chỉnh sửa dùng US1–US7 và UC1–UC10; tài liệu API cũ trong repo đang có mã US đến US10, dễ gây không nhất quán.
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
- **Ảnh hưởng:** Bảng `ticket_assignment_log`; module này sẽ được phát triển ở sprint sau, CRUD buổi 8 chưa thực hiện.

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
- **Ảnh hưởng:** API CRUD `tickets` là phần đầu tiên; gợi ý kỹ thuật viên, phân công, lịch hẹn và đóng phiếu chưa được tuyên bố là đã hoàn thành.

### TD-07 – Xóa mềm phiếu
- **Phản hồi/điểm cần kiểm tra:** Không xóa hẳn phiếu đã có lịch sử nghiệp vụ.
- **Quyết định:** SỬA.
- **Lý do:** Giữ dữ liệu để truy vết; đánh dấu `is_deleted`.
- **Ảnh hưởng:** Cột `ticket.is_deleted` và endpoint DELETE.
