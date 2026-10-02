# API contract (Track SE) – Luồng phân công kỹ thuật viên và lịch hẹn

Base URL: `/api/v1`. Xác thực bằng token; trung tâm của người dùng lấy từ token (không truyền trên URL). Dữ liệu dưới đây là dữ liệu mẫu của case study Mekong Mobile.

## 1. Danh sách endpoint (cho story MUST)

| # | Phương thức | Đường dẫn | Mục đích | User Story | FR |
|---|---|---|---|---|---|
| 1 | GET | `/tickets?status=` | Xem và lọc danh sách phiếu bảo hành | US1,US2 | FR1 |
| 2 | GET | `/tickets/{ticketId}/suggested-technicians` | Xem gợi ý kỹ thuật viên phù hợp | US4| FR2 |
| 3 | POST | `/tickets/{ticketId}/assignment` | Phân công kỹ thuật viên cho phiếu | US3 | FR3 |
| 4 | PATCH | `/tickets/{ticketId}/status` | Cập nhật trạng thái phiếu | US8 | FR5 |

## 2. Chi tiết endpoint

### 2.1 GET `/tickets?status=unassigned`

`status` nhận: `unassigned` (= `NEW`), `in_progress` (= `ASSIGNED`, `IN_PROGRESS`, `WAITING_PARTS`), `done` (= `COMPLETED`, `CLOSED`).

Response 200:

```json
{
  "items": [
    {
      "ticketId": "BH-000123",
      "deviceModel": "iPhone 13",
      "issueGroup": "MAN_HINH",
      "status": "NEW",
      "dueDate": "2026-10-05T17:00:00+07:00"
    }
  ],
  "total": 1
}
```

| Mã | Khi nào |
|---|---|
| 200 | Thành công (kể cả danh sách rỗng) |
| 400 | `status` không thuộc giá trị cho phép |
| 403 | Truy cập dữ liệu trung tâm khác (QT-14) |

### 2.2 GET `/tickets/{ticketId}/suggested-technicians`

Response 200:

```json
{
  "ticketId": "BH-000123",
  "issueGroup": "MAN_HINH",
  "technicians": [
    { "technicianId": "KTV-007", "fullName": "Nguyễn Văn An", "skillLevel": 4, "openTickets": 2 },
    { "technicianId": "KTV-012", "fullName": "Trần Thị Bình", "skillLevel": 3, "openTickets": 5 }
  ]
}
```

| Mã | Khi nào |
|---|---|
| 200 | Thành công; `technicians` rỗng nếu không ai đạt tay nghề ≥ 3 |
| 404 | Không tìm thấy phiếu |
| 403 | Phiếu thuộc trung tâm khác |

### 2.3 POST `/tickets/{ticketId}/assignment`

Request:

```json
{ "technicianId": "KTV-007" }
```

Response 201:

```json
{
  "ticketId": "BH-000123",
  "technicianId": "KTV-007",
  "status": "ASSIGNED",
  "assignedBy": "QL-HCM-01",
  "assignedAt": "2026-10-02T14:30:00+07:00"
}
```

| Mã | Khi nào |
|---|---|
| 201 | Phân công thành công |
| 400 | Thiếu `technicianId` hoặc kỹ thuật viên không đạt tay nghề ≥ 3 / khác trung tâm |
| 403 | Người gọi không phải quản lý trung tâm của phiếu (QT-08, QT-14) |
| 404 | Không tìm thấy phiếu hoặc kỹ thuật viên |
| 409 | Phiếu không còn ở trạng thái `NEW` (đã bị phân công) |

### 2.4 PATCH `/tickets/{ticketId}/status`

Request:

```json
{ "status": "IN_PROGRESS" }
```

Response 200:

```json
{
  "ticketId": "BH-000123",
  "previousStatus": "ASSIGNED",
  "status": "IN_PROGRESS",
  "changedBy": "KTV-007",
  "changedAt": "2026-10-02T15:10:00+07:00"
}
```

Chuyển trạng thái hợp lệ: `ASSIGNED`→`IN_PROGRESS`; `IN_PROGRESS`→`WAITING_PARTS` hoặc `COMPLETED`; `WAITING_PARTS`→`IN_PROGRESS`.

| Mã | Khi nào |
|---|---|
| 200 | Cập nhật thành công |
| 400 | `status` thiếu hoặc không hợp lệ |
| 403 | Người gọi không phải kỹ thuật viên phụ trách phiếu |
| 404 | Không tìm thấy phiếu |
| 409 | Chuyển sai thứ tự vòng đời (ví dụ `ASSIGNED`→`COMPLETED`) |

## 3. Quy tắc validation

| Endpoint | Trường | Bắt buộc | Kiểu | Độ dài / dải giá trị |
|---|---|---|---|---|
| GET /tickets | `status` | Không | string | `unassigned`, `in_progress`, `done` |
| mọi endpoint | `ticketId` | Có | string | dạng `BH-` + 6 chữ số |
| POST assignment | `technicianId` | Có | string | dạng `KTV-` + 3 chữ số, tối đa 10 ký tự |
| PATCH status | `status` | Có | string (enum) | `IN_PROGRESS`, `WAITING_PARTS`, `COMPLETED` |

## 4. Tự kiểm truy vết

Mỗi endpoint truy vết được về một User Story trong bảng truy vết (mục 6 của `srs.md`): endpoint 1 → US1; endpoint 2 và 3 → US3; endpoint 4 → US6.
