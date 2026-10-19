# Kết quả kiểm thử – Buổi 8

> Chỉ điền kết quả sau khi chạy thực tế trên máy. Lưu ảnh chụp màn hình vào `docs/`.

| Mã | Kiểm thử | Lệnh/Thao tác | Kết quả thực tế | Bằng chứng |
|---|---|---|---|---|
| TC-01 | Health check | `curl http://localhost:3000/health` | Chưa chạy | `docs/test-health.png` |
| TC-02 | Lấy danh sách phiếu | `curl http://localhost:3000/api/tickets` | Chưa chạy | `docs/test-list-tickets.png` |
| TC-03 | Tạo phiếu hợp lệ | POST `/api/tickets` với JSON hợp lệ | Chưa chạy | `docs/test-create-ticket.png` |
| TC-04 | Từ chối dữ liệu thiếu | POST thiếu `ticket_code` | Chưa chạy | `docs/test-validation.png` |

## Ghi chú lỗi
- Lỗi gặp phải:
- Cách xử lý:
- Kết quả sau khi xử lý:
