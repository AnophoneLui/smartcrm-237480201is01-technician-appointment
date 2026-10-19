# Smart CRM – Luồng L4: Phân công kỹ thuật viên và lịch hẹn

## 1. Mục tiêu
Hiện thực module cốt lõi Sprint 1 cho track SE: API quản lý phiếu bảo hành (tickets), theo kiến trúc `routes → service → repository`, phù hợp với phạm vi L4 trong BT1.

## 2. Yêu cầu môi trường
- Node.js 20 trở lên (khuyến nghị bản LTS)
- npm
- PostgreSQL 15/16 đang chạy
- Terminal và Git

## 3. Cài đặt
```bash
npm install
cp .env.example .env
```
Mở `.env` và sửa `DATABASE_URL` theo tài khoản PostgreSQL trên máy của bạn. Không commit file `.env`.

Tạo database `smartcrm` nếu chưa có:
```bash
createdb smartcrm
```
Nếu lệnh `createdb` không tồn tại, tạo database tên `smartcrm` bằng pgAdmin hoặc công cụ PostgreSQL bạn đã cài.

## 4. Tạo bảng và dữ liệu mẫu
```bash
npm run db:migrate
npm run db:seed
```
Lệnh seed dùng dữ liệu mẫu; nếu chạy lại và gặp lỗi trùng khóa, hãy báo lỗi trước khi chạy lại.

## 5. Chạy API và kiểm tra
```bash
npm run dev
```
Trong Terminal thứ hai:
```bash
curl http://localhost:3000/health
curl "http://localhost:3000/api/tickets"
```

Tạo phiếu mẫu qua API:
```bash
curl -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"ticket_code":"MM-NEW-001","center_id":1,"category_id":1,"priority":"HIGH","status":"NEW","due_date":"2026-11-01T10:00:00"}'
```

## 6. API hiện có
| Method | Endpoint | Ý nghĩa |
|---|---|---|
| GET | `/health` | Kiểm tra server |
| GET | `/api/tickets` | Danh sách phiếu; hỗ trợ `status`, `center_id`, `limit`, `offset` |
| GET | `/api/tickets/:id` | Chi tiết phiếu |
| POST | `/api/tickets` | Tạo phiếu |
| PUT | `/api/tickets/:id` | Cập nhật thông tin phiếu |
| DELETE | `/api/tickets/:id` | Xóa mềm phiếu (`is_deleted=true`) |

## 7. Trạng thái hiện tại (Buổi 8)
- [ ] Đã cài dependencies và cấu hình PostgreSQL trên máy cá nhân
- [ ] Đã chạy migration tạo 8 bảng theo ERD BT1
- [ ] Đã nạp dữ liệu mẫu
- [ ] Đã chạy thử ít nhất 2 endpoint và lưu ảnh vào `docs/`
- [ ] Đã chạy `npm test`
- [ ] Đã tạo các commit theo từng chặng và push lên GitHub

Chỉ đánh dấu hoàn thành sau khi tự chạy thành công trên máy của bạn.

## 8. Cấu trúc source
```text
src/backend/
├── app.js
├── server.js
├── config/db.js
├── routes/ticket.routes.js
├── services/ticket.service.js
├── repositories/ticket.repository.js
└── db/
    ├── migrations/001_initial_schema.sql
    └── seed/001_seed.sql
tests/ticket.service.test.js
```

## 9. Ghi chú
- Bản đầu chỉ làm CRUD `tickets`; chưa hiện thực toàn bộ luồng phân công, gợi ý kỹ thuật viên và lịch hẹn.
- API này là module Sprint 1, không thay thế toàn bộ Smart CRM.
- Nếu máy chưa có PostgreSQL, báo mình lỗi cụ thể trước khi đổi sang SQLite để tránh trộn hai cách cấu hình.
