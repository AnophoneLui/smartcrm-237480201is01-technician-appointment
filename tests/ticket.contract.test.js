const test = require("node:test");
const assert = require("node:assert/strict");
const { toTicketView, toSuggestionView } = require("../src/backend/services/ticket.contract");

// Dòng mẫu như pg trả về: BIGINT là chuỗi, due_date là Date
const hang = () => ({ ticket_id: "5", ticket_code: "MM-5", center_id: "1", category_id: 2, technician_id: null,
  priority: "HIGH", status: "NEW", due_date: new Date("2026-11-01T10:00:00Z"), category_name: "Pin" });

test("toTicketView trả đúng các trường của hợp đồng", () => {
  const v = toTicketView(hang());
  assert.deepEqual(Object.keys(v).sort(),
    ["centerId", "hanCamKet", "kyThuatVien", "tenNhomSuCo", "ticketCode", "ticketId", "trangThai", "uuTien"]);
});
test("hợp đồng: hanCamKet là ISO 8601, id là số (không phải chuỗi BIGINT)", () => {
  const v = toTicketView(hang());
  assert.match(v.hanCamKet, /^\d{4}-\d{2}-\d{2}T.*Z$/);
  assert.strictEqual(v.ticketId, 5);
  assert.strictEqual(v.centerId, 1);
});
test("biên: kyThuatVien là null khi chưa phân công, có {id, hoTen} khi đã phân công", () => {
  assert.strictEqual(toTicketView(hang()).kyThuatVien, null);
  const v = toTicketView({ ...hang(), technician_id: "3", technician_name: "Trần Quốc Bảo" });
  assert.deepEqual(v.kyThuatVien, { id: 3, hoTen: "Trần Quốc Bảo" });
});
test("biên: thiếu tên kỹ thuật viên thì dùng tên dự phòng, không để undefined", () => {
  assert.equal(toSuggestionView({ technician_id: "9", full_name: null, proficiency: 4, open_count: 0 }).hoTen, "KTV #9");
});
