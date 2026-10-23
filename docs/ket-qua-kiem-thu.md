# Kết quả kiểm thử – Sprint 2 (Buổi 10)

> Chỉ điền cột “Kết quả” sau khi TỰ chạy trên máy mình. Ảnh chụp lưu vào `docs/` với tên như cột “Bằng chứng”.

## 1. Luồng chính end-to-end (dữ liệu seed)
| Mã | Bước | Cách làm | Kết quả thực tế | Bằng chứng |
|---|---|---|---|---|
| E2E-01 | Xem danh sách chưa phân công | Mở http://localhost:3000 | ☐ | `docs/e2e-01-danh-sach.png` |
| E2E-02 | Xem gợi ý kỹ thuật viên | Bấm Phân công ở MM-DEMO-002 | ☐ | `docs/e2e-02-goi-y.png` |
| E2E-03 | Phân công thành công | Chọn KTV → Xác nhận; phiếu chuyển “Đã phân công” | ☐ | `docs/e2e-03-phan-cong.png` |
| E2E-04 | Ghi log | `SELECT * FROM ticket_status_log; SELECT * FROM ticket_assignment_log;` có dòng mới | ☐ | `docs/e2e-04-log.png` |
| E2E-05 | Đặt lịch hẹn + cảnh báo trùng | Đặt 09:00 rồi 09:30 cùng ngày → lần hai báo trùng | ☐ | `docs/e2e-05-lich-hen.png` |

## 2. Ba trạng thái
| Mã | Trạng thái | Cách làm | Kết quả thực tế | Bằng chứng |
|---|---|---|---|---|
| ST-01 | Lỗi | Tắt backend rồi bấm bộ lọc khác → thông báo + nút Thử lại | ☐ | `docs/st-01-loi.png` |
| ST-02 | Rỗng | Phiếu MM-DEMO-008 → “Không có kỹ thuật viên phù hợp”; hoặc bộ lọc không có dòng | ☐ | `docs/st-02-rong.png` |
| ST-03 | Tải | Chụp khung “Đang tải dữ liệu…” (làm chậm mạng ở DevTools) | ☐ | `docs/st-03-tai.png` |

## 3. API bằng curl
| Mã | Lệnh | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|
| TC-01 | `curl -i localhost:3000/health` | 200 | ☐ |
| TC-02 | `curl -i localhost:3000/api/tickets?status=NEW` | 200, `data` là mảng | ☐ |
| TC-04 | POST `/api/tickets` thiếu `ticket_code` | **422** kèm `fields.ticket_code` | ☐ |
| TC-05 | `curl -i localhost:3000/api/tickets/abc` | 400 `ID_KHONG_HOP_LE` | ☐ |
| TC-06 | PATCH phân công phiếu đã ASSIGNED | 409 `PHIEU_DA_THAY_DOI` | ☐ |

## 4. Unit test
Lệnh `npm test` (Node test runner, không cần CSDL): 16 test, gồm luồng đúng, giá trị biên, dữ liệu sai và test hợp đồng.
Số liệu lúc soạn (chạy trong môi trường không có CSDL): tổng 16, pass 16, fail 0.
Số liệu trên máy của tôi: tổng ___, pass ___, fail ___ (dán ảnh `docs/npm-test.png`).

## 5. Kiểm tra clone mới (README mục 3)
☐ Đã clone vào thư mục mới và làm đúng từng bước README. Bước nào thiếu/sai: ______________________

## 6. Ghi chú lỗi
- Lỗi gặp: ______  · Cách xử lý: ______  · Kết quả: ______
