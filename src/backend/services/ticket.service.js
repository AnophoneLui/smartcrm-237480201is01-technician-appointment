const { AppError } = require("../errors");
const { validateTicket, STATUSES } = require("./ticket.validator");
const { toTicketView, toSuggestionView, toAppointmentView } = require("./ticket.contract");

const MIN_PROFICIENCY = 3; // QT-08: tay nghề >= 3
const SLOT_MINUTES = 60;   // Giả định ghi ở docs/thay-doi-thiet-ke.md (TD-11)
const DEMO_USER_ID = 1;    // Chưa có đăng nhập (TD-10) nên ghi log bằng người dùng mặc định

// ---------- Hàm thuần (dễ test, không chạm CSDL) ----------
function parseId(value, name = "id") {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) {
    throw new AppError(400, "ID_KHONG_HOP_LE", `${name} phải là số nguyên dương`);
  }
  return n;
}

/** Ít phiếu đang xử lý nhất lên đầu; bằng nhau thì tay nghề cao hơn; rồi theo id. */
function sapXepGoiY(rows) {
  return [...rows].sort(
    (a, b) =>
      Number(a.open_count) - Number(b.open_count) ||
      Number(b.proficiency) - Number(a.proficiency) ||
      Number(a.technician_id) - Number(b.technician_id)
  );
}

/** QT-08 + luồng ngoại lệ 4 của UC3. Ném AppError nếu không được phân công. */
function kiemTraDieuKienPhanCong(ticket, eligibleRows, technicianId) {
  if (ticket.status !== "NEW") {
    throw new AppError(409, "PHIEU_DA_THAY_DOI", "Phiếu đã được phân công hoặc đổi trạng thái. Hãy tải lại danh sách.");
  }
  if (!eligibleRows.some((r) => Number(r.technician_id) === technicianId)) {
    throw new AppError(
      422, "KY_THUAT_VIEN_KHONG_DU_DIEU_KIEN",
      "Kỹ thuật viên phải cùng trung tâm và có tay nghề từ 3 trở lên theo nhóm sự cố của phiếu (QT-08)."
    );
  }
}

/** Hai lịch trùng nếu cách nhau ít hơn một khung (SLOT_MINUTES phút). */
function trungLich(existingDates, gio, slotMinutes = SLOT_MINUTES) {
  const t = new Date(gio).getTime();
  return existingDates.some((d) => Math.abs(new Date(d).getTime() - t) < slotMinutes * 60000);
}

// ---------- Service (nhận repository từ ngoài để test không cần CSDL) ----------
function createTicketService(repo) {
  async function list(query = {}) {
    const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
    const offset = Math.max(Number(query.offset) || 0, 0);
    let statuses;
    if (query.status) {
      statuses = String(query.status).split(",").map((s) => s.trim());
      const bad = statuses.filter((s) => !STATUSES.has(s));
      if (bad.length) throw new AppError(422, "DU_LIEU_KHONG_HOP_LE", "Bộ lọc trạng thái không hợp lệ", { status: `Giá trị sai: ${bad.join(", ")}` });
    }
    const rows = await repo.findAll({ statuses, center_id: query.center_id, limit, offset });
    return rows.map(toTicketView);
  }

  async function getRaw(id) {
    const row = await repo.findById(parseId(id));
    if (!row) throw new AppError(404, "KHONG_TIM_THAY_PHIEU", "Không tìm thấy phiếu dịch vụ");
    return row;
  }
  async function get(id) { return toTicketView(await getRaw(id)); }

  function assertValid(data, opts) {
    const errors = validateTicket(data, opts);
    if (errors.length) {
      const fields = Object.fromEntries(errors.map((e) => [e.field, e.message]));
      throw new AppError(422, "DU_LIEU_KHONG_HOP_LE", "Dữ liệu chưa hợp lệ. Hãy kiểm tra các ô được đánh dấu.", fields);
    }
  }

  async function create(data = {}) {
    const input = { ...data, status: data.status ?? "NEW" };
    assertValid(input);
    return toTicketView(await repo.create(input));
  }

  async function update(id, data = {}) {
    await getRaw(id);
    assertValid(data, { partial: true });
    const row = await repo.update(parseId(id), data);
    if (!row) throw new AppError(404, "KHONG_TIM_THAY_PHIEU", "Không tìm thấy phiếu dịch vụ");
    return toTicketView(row);
  }

  async function remove(id) {
    const row = await repo.softDelete(parseId(id));
    if (!row) throw new AppError(404, "KHONG_TIM_THAY_PHIEU", "Không tìm thấy phiếu dịch vụ");
    return { ticketId: Number(row.ticket_id), deleted: true };
  }

  // FR2 / UC4
  async function suggest(id) {
    const ticket = await getRaw(id);
    const rows = await repo.findSuggestions(ticket.center_id, ticket.category_id, MIN_PROFICIENCY);
    return sapXepGoiY(rows).map(toSuggestionView);
  }

  // FR3 / UC3
  async function assign(id, { technicianId, reason } = {}, changedBy = DEMO_USER_ID) {
    const techId = Number(technicianId);
    if (!Number.isInteger(techId) || techId < 1) {
      throw new AppError(422, "DU_LIEU_KHONG_HOP_LE", "Hãy chọn một kỹ thuật viên.", { technicianId: "Bắt buộc chọn kỹ thuật viên" });
    }
    const ticket = await getRaw(id);
    const eligible = await repo.findSuggestions(ticket.center_id, ticket.category_id, MIN_PROFICIENCY);
    kiemTraDieuKienPhanCong(ticket, eligible, techId);
    const ok = await repo.assignTechnician({ ticketId: ticket.ticket_id, technicianId: techId, changedBy, reason: reason ?? null });
    if (!ok) throw new AppError(409, "PHIEU_DA_THAY_DOI", "Phiếu vừa được người khác xử lý. Hãy tải lại danh sách.");
    return get(id);
  }

  // FR6 / UC8
  async function listAppointments(id) {
    const ticket = await getRaw(id);
    return (await repo.findAppointmentsByTicket(ticket.ticket_id)).map(toAppointmentView);
  }

  async function saveAppointment(id, { gioHen } = {}, replace = false) {
    const ticket = await getRaw(id);
    if (typeof gioHen !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(gioHen)
      || Number.isNaN(Date.parse(gioHen))) {
      throw new AppError(422, 'DU_LIEU_KHONG_HOP_LE', 'Giờ hẹn phải là ISO 8601 có múi giờ.');
    }
    if (Date.parse(gioHen) <= Date.now()) {
      throw new AppError(422, 'GIO_HEN_QUA_KHU', 'Vui lòng chọn thời điểm trong tương lai.');
    }
    if (ticket.technician_id == null) throw new AppError(409, 'CHUA_PHAN_CONG', 'Phiếu chưa có kỹ thuật viên.');
    // Tương thích mock repository cũ trong các unit test Sprint 1/2.
    if (!repo.saveAppointment && !replace) {
      const existing = await repo.findAppointmentTimesByTechnician(ticket.technician_id);
      if (trungLich(existing, gioHen)) throw new AppError(409, 'TRUNG_LICH', 'Kỹ thuật viên đã có lịch hẹn trong vòng 60 phút. Hãy chọn giờ khác.');
      return toAppointmentView(await repo.createAppointment({ ticketId: ticket.ticket_id, technicianId: ticket.technician_id, gioHen }));
    }
    try {
      return toAppointmentView(await repo.saveAppointment({ ticketId: ticket.ticket_id,
        technicianId: ticket.technician_id, gioHen, replace }));
    } catch (e) {
      if (e.code === 'APPOINTMENT_CONFLICT') throw new AppError(409, 'TRUNG_LICH', 'Kỹ thuật viên đã có lịch trong vòng 60 phút. Hãy chọn giờ khác.');
      if (e.code === 'APPOINTMENT_STATE') throw new AppError(409, 'LICH_DA_THAY_DOI', 'Phiếu đã có lịch hoặc lịch vừa thay đổi. Hãy tải lại trang.');
      if (e.code === 'TECH_CHANGED') throw new AppError(409, 'PHIEU_DA_THAY_DOI', 'Kỹ thuật viên đã thay đổi. Hãy tải lại trang.');
      throw e;
    }
  }
  async function createAppointment(id, body) { return saveAppointment(id, body, false); }
  async function changeAppointment(id, body) { return saveAppointment(id, body, true); }

  return { list, get, create, update, remove, suggest, assign, listAppointments, createAppointment, changeAppointment };
}

module.exports = { createTicketService, validateTicket, sapXepGoiY, kiemTraDieuKienPhanCong, trungLich, parseId };
