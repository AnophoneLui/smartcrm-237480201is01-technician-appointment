const test = require("node:test");
const assert = require("node:assert/strict");
const { validateTicket } = require("../src/backend/services/ticket.validator");
const {
  createTicketService, sapXepGoiY, kiemTraDieuKienPhanCong, trungLich,
} = require("../src/backend/services/ticket.service");

const validTicket = {
  ticket_code: "MM-TEST-001", center_id: 1, category_id: 1,
  priority: "HIGH", status: "NEW", due_date: "2026-11-01T10:00:00",
};
const rowNew = { ticket_id: "7", ticket_code: "MM-7", center_id: "1", category_id: 1, technician_id: null,
  priority: "HIGH", status: "NEW", due_date: new Date("2026-11-01T10:00:00Z"), category_name: "Màn hình" };
const ktv = (id, open, prof) => ({ technician_id: String(id), full_name: `KTV ${id}`, proficiency: prof, open_count: open });

function fakeRepo(over = {}) {
  return { findById: async () => rowNew, findAll: async () => [], findSuggestions: async () => [],
    assignTechnician: async () => true, findAppointmentTimesByTechnician: async () => [], ...over };
}

// ---- Validator (luồng đúng / dữ liệu sai) ----
test("validateTicket chấp nhận dữ liệu phiếu hợp lệ", () => {
  assert.deepEqual(validateTicket(validTicket), []);
});
test("validateTicket từ chối thiếu mã phiếu và chỉ rõ trường lỗi", () => {
  const errors = validateTicket({ ...validTicket, ticket_code: undefined });
  assert.equal(errors[0].field, "ticket_code");
});
test("validateTicket từ chối priority không hợp lệ", () => {
  assert.ok(validateTicket({ ...validTicket, priority: "INVALID" }).some((e) => e.field === "priority"));
});

// ---- Service: ranh giới và quy tắc nghiệp vụ ----
test("tạo phiếu với dữ liệu sai trả 422 kèm danh sách trường lỗi (không rơi xuống CSDL)", async () => {
  const svc = createTicketService(fakeRepo({ create: async () => assert.fail("không được gọi CSDL") }));
  await assert.rejects(svc.create({ ...validTicket, ticket_code: "" }),
    (e) => e.status === 422 && e.code === "DU_LIEU_KHONG_HOP_LE" && "ticket_code" in e.fields);
});
test("biên: phiếu không tồn tại trả 404, id không phải số trả 400", async () => {
  const svc = createTicketService(fakeRepo({ findById: async () => null }));
  await assert.rejects(svc.get("99"), (e) => e.status === 404);
  await assert.rejects(svc.get("abc"), (e) => e.status === 400);
});
test("QT-08: không phân công kỹ thuật viên ngoài danh sách đủ điều kiện", () => {
  assert.throws(() => kiemTraDieuKienPhanCong(rowNew, [ktv(1, 0, 4)], 2),
    (e) => e.status === 422 && e.code === "KY_THUAT_VIEN_KHONG_DU_DIEU_KIEN");
});
test("biên: phiếu không còn ở trạng thái Mới thì báo xung đột 409", async () => {
  const svc = createTicketService(fakeRepo({
    findById: async () => ({ ...rowNew, status: "ASSIGNED" }), findSuggestions: async () => [ktv(1, 0, 4)] }));
  await assert.rejects(svc.assign("7", { technicianId: 1 }), (e) => e.status === 409 && e.code === "PHIEU_DA_THAY_DOI");
});
test("phân công hợp lệ gọi repository đúng tham số rồi trả phiếu theo hợp đồng", async () => {
  let called;
  let reads = 0;
  const svc = createTicketService(fakeRepo({
    findSuggestions: async () => [ktv(1, 0, 4)],
    assignTechnician: async (p) => { called = p; return true; },
    findById: async () => (++reads < 2 ? rowNew
      : { ...rowNew, status: "ASSIGNED", technician_id: "1", technician_name: "KTV 1" }),
  }));
  const view = await svc.assign("7", { technicianId: 1, reason: "ít việc" });
  assert.equal(called.technicianId, 1);
  assert.equal(view.trangThai, "ASSIGNED");
  assert.deepEqual(view.kyThuatVien, { id: 1, hoTen: "KTV 1" });
});
test("gợi ý: ít phiếu đang xử lý nhất lên đầu, bằng nhau thì tay nghề cao hơn", () => {
  const sorted = sapXepGoiY([ktv(1, 3, 5), ktv(2, 1, 3), ktv(3, 1, 5)]);
  assert.deepEqual(sorted.map((r) => r.technician_id), ["3", "2", "1"]);
});
test("biên: không có kỹ thuật viên đủ điều kiện thì danh sách gợi ý rỗng", async () => {
  const svc = createTicketService(fakeRepo({ findSuggestions: async () => [] }));
  assert.deepEqual(await svc.suggest("7"), []);
});
test("lịch hẹn: trùng nếu cách nhau dưới 60 phút, không trùng nếu từ 60 phút", () => {
  const base = "2026-11-02T09:00:00Z";
  assert.equal(trungLich([base], "2026-11-02T09:30:00Z"), true);
  assert.equal(trungLich([base], "2026-11-02T10:00:00Z"), false);
});
test("đặt lịch khi phiếu chưa phân công trả 409 CHUA_PHAN_CONG", async () => {
  const svc = createTicketService(fakeRepo());
  await assert.rejects(svc.createAppointment("7", { gioHen: "2026-11-02T09:00:00Z" }),
    (e) => e.status === 409 && e.code === "CHUA_PHAN_CONG");
});
