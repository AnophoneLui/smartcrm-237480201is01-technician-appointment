# Hợp đồng API – Luồng L4: Phân công kỹ thuật viên và lịch hẹn

Hợp đồng được viết thành mã ở `src/backend/services/ticket.contract.js` (ba thứ: hình dạng · ý nghĩa · hành vi khi sai).
Quy ước: JSON UTF-8; trường dùng `camelCase` (đổi so với Sprint 1, xem TD-08); thời điểm là ISO 8601 UTC (đuôi `Z`).

## Định dạng lỗi chung
`{ "error": "MA_LOI", "message": "câu cho người đọc", "fields": { "tenTruong": "lý do" } }` (`fields` chỉ có khi lỗi theo trường; lỗi 500 có thêm `maTraCuu`).
Frontend rẽ nhánh theo `error`, không theo câu chữ của `message`.

| HTTP | `error` | Khi nào | Bên gọi phải làm gì |
|---|---|---|---|
| 400 | ID_KHONG_HOP_LE, JSON_KHONG_HOP_LE | id không phải số; JSON hỏng | Không thử lại |
| 404 | KHONG_TIM_THAY_PHIEU, KHONG_TIM_THAY_DUONG_DAN | Không có phiếu / đường dẫn | Báo không tìm thấy |
| 409 | PHIEU_DA_THAY_DOI, TRUNG_LICH, CHUA_PHAN_CONG, TRUNG_MA_PHIEU, PHIEU_DA_HOAN_TAT, TRUNG_KY_THUAT_VIEN, DANG_CO_LICH_HEN, TRANG_THAI_KHONG_DOI | Xung đột nghiệp vụ | Hiện thông điệp, tải lại dữ liệu |
| 422 | DU_LIEU_KHONG_HOP_LE, KY_THUAT_VIEN_KHONG_DU_DIEU_KIEN, THAM_CHIEU_KHONG_TON_TAI, KY_THUAT_VIEN_KHONG_HOP_LE, LY_DO_KHONG_HOP_LE, TRANG_THAI_KHONG_HOP_LE, CAP_NHAT_TRANG_THAI_KHONG_HOP_LE | Dữ liệu sai | Hiện lỗi cạnh ô nhập, không thử lại |
| 500 | LOI_HE_THONG | Lỗi không lường trước | Hiện thông báo chung + mã tra cứu + nút Thử lại |

## Đối tượng
**Phiếu**: `ticketId` (số), `ticketCode`, `centerId` (số), `tenNhomSuCo` (chuỗi hoặc null), `uuTien` (LOW|MEDIUM|HIGH|URGENT), `trangThai` (NEW|ASSIGNED|IN_PROGRESS|WAITING|COMPLETED|CLOSED), `hanCamKet` (ISO 8601, luôn có), `kyThuatVien` (`{id, hoTen}` hoặc **null = chưa phân công**).
**Gợi ý**: `id`, `hoTen`, `tayNghe` (1–5), `soPhieuDangXuLy` (đếm phiếu ASSIGNED/IN_PROGRESS/WAITING).
**Lịch hẹn**: `appointmentId`, `ticketId`, `kyThuatVienId`, `gioHen` (ISO 8601).

## Endpoint

| Method | Đường dẫn | Thành công | Hành vi khi sai |
|---|---|---|---|
| GET | `/api/tickets?status=&center_id=&limit=&offset=` | 200 `{data:[Phiếu]}` | Bộ lọc trạng thái sai → 422 |
| GET | `/api/tickets/:id` | 200 `{data:Phiếu}` | ID sai → 400; không tìm thấy → 404 |
| GET | `/api/tickets/:id/suggestions` | 200 `{data:[Gợi ý]}` | Không tìm thấy phiếu → 404 |
| POST | `/api/tickets` | 201 `{data:Phiếu}` | Dữ liệu sai → 422; mã phiếu trùng → 409 |
| PUT | `/api/tickets/:id` | 200 `{data:Phiếu}` | Dữ liệu sai → 422; không tìm thấy → 404 |
| DELETE | `/api/tickets/:id` | 200 `{data:{ticketId, deleted:true}}` | Không tìm thấy → 404 |
| PATCH | `/api/tickets/:id/technician` | 200 `{data:Phiếu}` | Thiếu KTV hoặc không đủ điều kiện → 422; phiếu không còn NEW → 409 |
| PUT | `/api/tickets/:id/technician` body `{technicianId, reason}` | 200 `{data:Phiếu}` | Thiếu KTV hoặc lý do sai → 422; chưa phân công, phiếu đã hoàn tất, chọn lại KTV hiện tại hoặc còn lịch hẹn hoạt động → 409; KTV không đủ điều kiện → 422 |
| PATCH | `/api/tickets/:id/status` body `{status}` | 200 `{data:Phiếu}` | Trạng thái sai → 422; trạng thái không đổi → 409; không tìm thấy phiếu → 404 |
| GET | `/api/tickets/:id/appointments` | 200 `{data:[Lịch hẹn]}` | Không tìm thấy phiếu → 404 |
| POST | `/api/tickets/:id/appointments` body `{gioHen}` | 201 `{data:Lịch hẹn}` | Giờ hẹn sai hoặc quá khứ → 422; chưa phân công → 409; trùng lịch → 409 |
| PUT | `/api/tickets/:id/appointments/current` body `{gioHen}` | 200 `{data:Lịch hẹn}` | Giờ hẹn sai → 422; xung đột lịch hoặc trạng thái → 409 |
| DELETE | `/api/tickets/:id/appointments/current` | 200 `{data:{appointmentId, cancelled:true}}` | Không có lịch hẹn hoạt động → 404 |

### FR4 – Đổi kỹ thuật viên

- Yêu cầu kỹ thuật viên mới cùng trung tâm, có kỹ năng phù hợp và tay nghề từ 3 trở lên.
- Bắt buộc nhập lý do đổi từ 1 đến 255 ký tự.
- Không cho đổi sang chính kỹ thuật viên hiện tại, đổi khi phiếu đã hoàn tất hoặc đóng, hoặc khi còn lịch hẹn hoạt động.
- Ghi lịch sử phân công vào `ticket_assignment_log` trong cùng transaction với thao tác cập nhật.

### Quy tắc cập nhật phiếu

- `PUT /api/tickets/:id` không cho phép thay đổi trường `status`; nếu gửi trường này, API trả HTTP 422 với mã `CAP_NHAT_TRANG_THAI_KHONG_HOP_LE`.
- Để cập nhật trạng thái, sử dụng `PATCH /api/tickets/:id/status`.

### FR5 – Cập nhật trạng thái phiếu

- Chỉ chấp nhận các trạng thái được định nghĩa trong hợp đồng.
- Từ chối trạng thái không hợp lệ với HTTP 422.
- Từ chối cập nhật nếu trạng thái không thay đổi với HTTP 409.
- Cập nhật trạng thái và ghi lịch sử vào `ticket_status_log` trong cùng transaction.

## Thay đổi hợp đồng so với Sprint 1 (thay đổi phá vỡ)
Phản hồi đổi từ `snake_case` + lỗi `{error:{message}}` sang `camelCase` + lỗi `{error, message, fields}`. Đây là thay đổi phá vỡ, được thực hiện khi chưa có bên gọi nào khác ngoài giao diện mới nên không cần giai đoạn song song.
