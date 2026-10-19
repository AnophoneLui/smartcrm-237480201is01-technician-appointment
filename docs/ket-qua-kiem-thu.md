# Kết quả kiểm thử – Buổi 8

## 1. Kết quả kiểm thử

| Mã | Kiểm thử | Lệnh/Thao tác | Kết quả thực tế | Bằng chứng |
|---|---|---|---|---|
| TC-01 | Health check | `curl -i http://localhost:3000/health` | Chưa xác nhận | Chưa chụp ảnh |
| TC-02 | Lấy danh sách phiếu | `curl -i http://localhost:3000/api/tickets` | Thành công – HTTP 200 | Chưa chụp ảnh |
| TC-03 | Tạo phiếu hợp lệ | POST `/api/tickets` với JSON hợp lệ | Thành công – HTTP 201 | Chưa chụp ảnh |
| TC-04 | Từ chối dữ liệu thiếu | POST thiếu `ticket_code` | Chưa xác nhận | Chưa chụp ảnh |

## 2. Unit test

Đã chạy lệnh `npm test`.

- Tổng số test: 3
- Thành công: 3
- Thất bại: 0

Các test đã chạy:
- Chấp nhận dữ liệu phiếu hợp lệ.
- Từ chối dữ liệu thiếu mã phiếu.
- Từ chối priority không hợp lệ.

## 3. Ghi chú lỗi

- Lỗi gặp phải: Chưa ghi nhận.
- Cách xử lý: Chưa ghi nhận.
- Kết quả sau khi xử lý: Unit test đạt 3/3.

## 4. Bằng chứng

Cần bổ sung ảnh chụp màn hình kết quả API thực tế vào thư mục `docs/`.
