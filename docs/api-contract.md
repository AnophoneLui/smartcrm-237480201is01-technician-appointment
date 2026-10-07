# Hợp đồng API — Luồng L4: Phân công kỹ thuật viên và lịch hẹn

## 1. Danh sách endpoint

| Phương thức | Đường dẫn | Mục đích | User Story |
|---|---|---|---|
| GET | `/api/tickets?status=&center_id=&technician_id=` | Lấy danh sách phiếu, có lọc theo trạng thái và phân trang | US1, US2 |
| GET | `/api/tickets/{id}/technician-suggestions` | Lấy danh sách kỹ thuật viên gợi ý phù hợp với phiếu | US3, US4 |
| PATCH | `/api/tickets/{id}/assign` | Phân công hoặc đổi kỹ thuật viên cho phiếu | US3, US5 |
| PATCH | `/api/tickets/{id}/status` | Chuyển trạng thái phiếu | US6 |
| POST | `/api/appointments` | Đặt lịch hẹn giao–nhận máy | US7, US8 |
| PATCH | `/api/tickets/{id}/close` | Xác nhận khách nhận máy và đóng phiếu | US9 |
| GET | `/api/centers/{id}/overview` | Lấy số liệu tổng quan trung tâm | US10 |

## 2. Quy ước chung

- Định dạng trao đổi: JSON, mã hóa UTF-8.
- Header bắt buộc: `Content-Type: application/json`.
- Tên trường dùng `snake_case`, khớp với tên cột trong cơ sở dữ liệu.
- Thời gian dùng chuẩn ISO 8601 kèm múi giờ, ví dụ:
  `2026-10-10T14:00:00+07:00`.
- Phân trang sử dụng tham số `page` (bắt đầu từ 1) và `size` (mặc định 20, tối đa 100). Response kèm `total`.
- Mọi lỗi trả về cùng cấu trúc:

```json
{
  "error": {
    "code": "...",
    "message": "...",
    "fields": {}
  }
}