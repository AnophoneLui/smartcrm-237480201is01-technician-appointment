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
| 409 | PHIEU_DA_THAY_DOI, TRUNG_LICH, CHUA_PHAN_CONG, TRUNG_MA_PHIEU | Xung đột nghiệp vụ | Hiện thông điệp, tải lại dữ liệu |
| 422 | DU_LIEU_KHONG_HOP_LE, KY_THUAT_VIEN_KHONG_DU_DIEU_KIEN, THAM_CHIEU_KHONG_TON_TAI | Dữ liệu sai | Hiện lỗi cạnh ô nhập, không thử lại |
| 500 | LOI_HE_THONG | Lỗi không lường trước | Hiện thông báo chung + mã tra cứu + nút Thử lại |

## Đối tượng
**Phiếu**: `ticketId` (số), `ticketCode`, `centerId` (số), `tenNhomSuCo` (chuỗi hoặc null), `uuTien` (LOW|MEDIUM|HIGH|URGENT), `trangThai` (NEW|ASSIGNED|IN_PROGRESS|WAITING|COMPLETED|CLOSED), `hanCamKet` (ISO 8601, luôn có), `kyThuatVien` (`{id, hoTen}` hoặc **null = chưa phân công**).
**Gợi ý**: `id`, `hoTen`, `tayNghe` (1–5), `soPhieuDangXuLy` (đếm phiếu ASSIGNED/IN_PROGRESS/WAITING).
**Lịch hẹn**: `appointmentId`, `ticketId`, `kyThuatVienId`, `gioHen` (ISO 8601).

## Endpoint
| Method | Đường dẫn | Thành công | Hành vi khi sai |
|---|---|---|---|
| GET | `/api/tickets?status=NEW,ASSIGNED&center_id=&limit=&offset=` | 200 `{data:[Phiếu]}` sắp theo `hanCamKet` tăng dần; **không có phiếu thì `[]`** | status sai → 422 |
| GET | `/api/tickets/:id` | 200 `{data:Phiếu}` | 404 |
| GET | `/api/tickets/:id/suggestions` | 200 `{data:[Gợi ý]}` ít phiếu nhất trước; **không ai đủ điều kiện thì `[]`** | 404 |
| PATCH | `/api/tickets/:id/technician` body `{technicianId, reason?}` | 200 `{data:Phiếu}` (đã ASSIGNED) | thiếu id → 422; KTV không đủ điều kiện (QT-08) → 422; phiếu không còn NEW → 409 |
| GET | `/api/tickets/:id/appointments` | 200 `{data:[Lịch hẹn]}` | 404 |
| POST | `/api/tickets/:id/appointments` body `{gioHen}` | 201 `{data:Lịch hẹn}` | giờ sai → 422; chưa phân công → 409; trùng lịch → 409 |
| POST / PUT / DELETE | `/api/tickets`, `/api/tickets/:id` | 201 / 200 / 200 | dữ liệu sai → 422; trùng mã → 409 |

## Thay đổi hợp đồng so với Sprint 1 (thay đổi phá vỡ)
Phản hồi đổi từ `snake_case` + lỗi `{error:{message}}` sang `camelCase` + lỗi `{error, message, fields}`. Đây là thay đổi phá vỡ, được thực hiện khi chưa có bên gọi nào khác ngoài giao diện mới nên không cần giai đoạn song song.
