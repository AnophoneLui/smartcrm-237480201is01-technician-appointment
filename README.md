# Smart CRM – Luồng L4: Phân công kỹ thuật viên và lịch hẹn

SV: Luibouathong Anophone · MSSV 237480201IS01 · Track SE

## 1. Mục tiêu
Module mở rộng (Sprint 2): giao diện Vue 3 màn hình gọi API thật, luồng chính UC3
(chọn phiếu → xem gợi ý kỹ thuật viên → phân công → ghi log) chạy end-to-end cục bộ.
Kiến trúc: giao diện → client API → routes → service → repository → PostgreSQL.

## 2. Yêu cầu môi trường
Node.js ≥ 20 · npm · PostgreSQL 15/16 đang chạy · Git · trình duyệt có Internet (tải Vue từ CDN jsDelivr).

## 3. Dựng hệ thống (mỗi bước một lệnh)
1. `git clone https://github.com/AnophoneLui/smartcrm-237480201is01-technician-appointment.git`
2. `cd smartcrm-237480201is01-technician-appointment`
3. `npm install`
4. `cp .env.example .env` (Windows: `copy .env.example .env`) rồi mở `.env` sửa mật khẩu trong `DATABASE_URL`
5. Tạo database: `createdb smartcrm` (hoặc tạo CSDL tên `smartcrm` bằng pgAdmin)
6. `npm run db:migrate`
7. `npm run db:seed`
8. `npm test` → kỳ vọng: `# pass 16`, `# fail 0`
9. `npm run dev` → mở http://localhost:3000

Lưu ý: giao diện và API cùng cổng 3000 (backend phục vụ thư mục `src/frontend`), nên không cần cấu hình CORS hay địa chỉ API.
Muốn tách giao diện sang máy chủ khác thì sửa `API_BASE_URL` trong `src/frontend/config.js`.

## 4. Luồng chính để thử (dữ liệu mẫu từ seed)
1. Trang chủ mở sẵn bộ lọc “Chưa phân công” (sắp theo hạn cam kết; MM-DEMO-002 đang quá hạn).
2. Bấm **Phân công** ở một phiếu → xem gợi ý (ít phiếu nhất ở trên) → chọn → **Xác nhận phân công**.
3. Hệ thống chuyển phiếu sang “Đã phân công”, ghi `ticket_status_log` và `ticket_assignment_log` trong cùng một transaction.
4. Ở màn hình chi tiết, đặt lịch hẹn; đặt hai giờ cách nhau dưới 60 phút để thấy cảnh báo trùng lịch.
5. Thử phiếu MM-DEMO-008 (Cần Thơ, chưa có kỹ thuật viên) để thấy luồng ngoại lệ “Không có kỹ thuật viên phù hợp”.

## 5. Ba trạng thái và cách kiểm tra
| Trạng thái | Cách tái hiện |
|---|---|
| Đang tải | Mở trang: khung “Đang tải dữ liệu…” hiện trong lúc chờ API |
| Rỗng | Chọn bộ lọc “Hoàn tất” sau khi xóa mềm các phiếu hoàn tất, hoặc mở DB trống: thấy câu giải thích + nút “Xem tất cả phiếu” |
| Lỗi | Tắt backend (Ctrl+C) rồi bấm bộ lọc khác: thấy thông báo lỗi + nút “Thử lại” |

Kiểm tra lớp gọi API: `grep -rn "fetch(" src/frontend/js/pages src/frontend/js/components` phải trả về rỗng.

## 6. API
Chi tiết hình dạng, ý nghĩa, hành vi khi sai: xem `docs/api-contract.md`.

| Method | Endpoint | Ý nghĩa |
|---|---|---|
| GET | `/health` | Kiểm tra server |
| GET | `/api/tickets?status=&center_id=&limit=&offset=` | Danh sách phiếu (`status` nhận nhiều giá trị, cách nhau dấu phẩy) |
| GET | `/api/tickets/:id` | Chi tiết phiếu |
| GET | `/api/tickets/:id/suggestions` | Gợi ý kỹ thuật viên (FR2) |
| PATCH | `/api/tickets/:id/technician` | Phân công kỹ thuật viên (FR3) |
| GET/POST | `/api/tickets/:id/appointments` | Xem / đặt lịch hẹn (FR6) |
| POST/PUT/DELETE | `/api/tickets[/:id]` | Tạo / sửa / xóa mềm phiếu (Sprint 1) |

Lỗi luôn có dạng `{ "error": "MA_LOI", "message": "...", "fields": { ... } }`; dữ liệu sai trả 422, không trả 500.

## 7. Cấu trúc
```text
src/backend/   app.js, server.js, errors.js, config/, routes/, services/ (service + contract + validator), repositories/, db/
src/frontend/  index.html, config.js, js/api/ (lớp gọi API), js/components/DataState.js, js/pages/ (3 màn hình)
scripts/run-sql.js   chạy migration/seed (đọc .env, chạy được trên Windows)
tests/         ticket.service.test.js, ticket.contract.test.js
docs/          srs.md, api-contract.md, thay-doi-thiet-ke.md, ket-qua-kiem-thu.md, ảnh chụp luồng
```

## 8. Phạm vi và hạn chế (đã ghi ở docs/thay-doi-thiet-ke.md)
- Chưa có đăng nhập/phân quyền (TD-10): log ghi bằng người dùng mặc định id = 1; QT-14 và QT-15 chưa thi hành.
- Chưa làm: đổi kỹ thuật viên (FR4), cập nhật trạng thái theo vòng đời (FR5), đóng phiếu (FR7), tổng quan (FR8).
- Giả định khung lịch hẹn 60 phút (TD-11).
