# BẢNG KHAI BÁO SỬ DỤNG CÔNG CỤ AI

**Dự án:** Smart CRM – Mekong Mobile  
**Luồng:** L4 – Phân công kỹ thuật viên và lịch hẹn  
**Sinh viên:** LUIBOUATHONG ANOPHONE  
**MSSV:** 237480201IS01

| Công cụ AI | Mục đích sử dụng | Phạm vi áp dụng | Cách kiểm chứng |
|---|---|---|---|
| Claude (Anthropic) | Hỗ trợ phân tích yêu cầu, đề xuất User Story, SRS, Use Case, ERD và kiến trúc | Tài liệu phân tích và thiết kế BT1 | Đối chiếu case study, kiểm tra yêu cầu nghiệp vụ và chỉnh sửa sơ đồ |
| Claude (Anthropic) | Hỗ trợ xây dựng bản nháp chức năng, giao diện, kiểm thử và tài liệu | Backend, frontend, tests và docs trong Sprint 2 | Kiểm tra mã nguồn, chạy thử và điều chỉnh theo kết quả |
| ChatGPT (OpenAI) | Hướng dẫn triển khai, kiểm tra lỗi, bổ sung chức năng hủy lịch hẹn, rà soát migration, seed và cập nhật tài liệu | Backend, database, unit test, README và tài liệu BT2 | Chạy `npm test` đạt 32/32 test; kiểm tra API hủy lịch trả 200/404; chạy lại migration và seed trên CSDL kiểm thử |

## Kết quả kiểm chứng

- Unit Test: 32 PASS, 0 FAIL.
- Kiểm tra API hủy lịch hẹn thành công và trường hợp không có lịch hẹn.
- Migration chạy lại thành công trên CSDL kiểm thử.
- Seed chạy hai lần không phát sinh bản ghi trùng.
- Mã nguồn và tài liệu được quản lý trên GitHub với tag `v0.2`.

## Minh chứng kiểm chứng bổ sung cho BT2

- Chạy `npm test`: 32/32 bài kiểm thử PASS, 0 FAIL.
- Kiểm chứng CRUD Ticket qua API: tạo (201), đọc (200), cập nhật (200), xóa mềm (200), truy vấn lại sau xóa (404).
- Kiểm chứng CRUD Appointment qua API: tạo (201), đọc (200), cập nhật (200), hủy lịch (200), danh sách lịch đang hoạt động sau hủy rỗng.
- Kiểm tra giao diện với dữ liệu thật từ API, bao gồm trạng thái Loading, Empty và Error.
- Kiểm chứng bản clone sạch tại tag `v0.2`: cài dependencies, chạy migration, seed, test và API `/health`.
- Kiểm tra cơ sở dữ liệu xác nhận có bản ghi lịch sử phân công và cập nhật trạng thái.

**Giới hạn kiểm chứng:** Kết quả 32/32 PASS không chứng minh toàn bộ yêu cầu hệ thống. Chưa có số liệu đo hiệu năng NFR1/NFR2, chưa triển khai đầy đủ phân quyền NFR3, chưa chứng minh tỷ lệ ghi log và thời gian lưu trữ NFR4, cũng như độ sẵn sàng NFR5.

## Cam kết

Tôi xác nhận đã đọc, kiểm tra, hiểu và chịu trách nhiệm về toàn bộ nội dung mã nguồn, tài liệu và kết quả kiểm thử được nộp. Công cụ AI được sử dụng để hỗ trợ, không thay thế trách nhiệm của sinh viên.

**Họ tên:** LUIBOUATHONG ANOPHONE  
**MSSV:** 237480201IS01  
**Ngày:** 29/10/2026