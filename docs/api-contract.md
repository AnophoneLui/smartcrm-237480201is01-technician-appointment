# Hợp đồng API – Luồng L4: Phân công kỹ thuật viên và lịch hẹn

## Module Sprint 1 – CRUD phiếu bảo hành
| Phương thức | Đường dẫn | Mục đích |
|---|---|---|
| GET | `/health` | Kiểm tra server hoạt động |
| GET | `/api/tickets?status=&center_id=&limit=&offset=` | Danh sách phiếu, có lọc và phân trang |
| GET | `/api/tickets/{id}` | Chi tiết một phiếu |
| POST | `/api/tickets` | Tạo phiếu |
| PUT | `/api/tickets/{id}` | Cập nhật phiếu |
| DELETE | `/api/tickets/{id}` | Xóa mềm phiếu |

## Quy ước
- Request/response dùng JSON, UTF-8.
- Trường dữ liệu dùng `snake_case`.
- `limit` mặc định 20, tối đa 100; `offset` mặc định 0.
- Phiếu đã xóa mềm (`is_deleted=true`) không xuất hiện trong danh sách và không được truy cập qua endpoint chi tiết.
- Các endpoint gợi ý kỹ thuật viên, phân công/đổi phân công, cập nhật trạng thái, lịch hẹn và đóng phiếu thuộc phạm vi L4 tổng thể nhưng chưa được hiện thực trong module CRUD Sprint 1 này.

## Ví dụ tạo phiếu
```json
{
  "ticket_code": "MM-NEW-001",
  "center_id": 1,
  "category_id": 1,
  "priority": "HIGH",
  "status": "NEW",
  "due_date": "2026-11-01T10:00:00"
}
```
