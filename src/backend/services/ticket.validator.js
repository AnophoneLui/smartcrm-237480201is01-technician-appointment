const PRIORITIES = new Set(["LOW", "MEDIUM", "HIGH", "URGENT"]);
const STATUSES = new Set(["NEW", "ASSIGNED", "IN_PROGRESS", "WAITING", "COMPLETED", "CLOSED"]);

/**
 * Kiểm tra dữ liệu phiếu ở RANH GIỚI (trước khi vào nghiệp vụ).
 * @returns {{field: string, message: string}[]} Mảng rỗng nếu hợp lệ.
 */
function validateTicket(data, { partial = false } = {}) {
  const errors = [];
  const need = (f) => !partial || data[f] !== undefined;

  if (need("ticket_code")) {
    if (typeof data.ticket_code !== "string" || !data.ticket_code.trim()) {
      errors.push({ field: "ticket_code", message: "Mã phiếu là bắt buộc" });
    } else if (data.ticket_code.trim().length > 20) {
      errors.push({ field: "ticket_code", message: "Mã phiếu tối đa 20 ký tự" });
    }
  }
  for (const field of ["center_id", "category_id"]) {
    if (need(field) && (!Number.isInteger(Number(data[field])) || Number(data[field]) < 1)) {
      errors.push({ field, message: "Phải là số nguyên dương" });
    }
  }
  if (need("priority") && !PRIORITIES.has(data.priority)) {
    errors.push({ field: "priority", message: `Phải thuộc: ${[...PRIORITIES].join(", ")}` });
  }
  if (need("status") && !STATUSES.has(data.status)) {
    errors.push({ field: "status", message: `Phải thuộc: ${[...STATUSES].join(", ")}` });
  }
  if (need("due_date") && (typeof data.due_date !== "string" || Number.isNaN(Date.parse(data.due_date)))) {
    errors.push({ field: "due_date", message: "Phải là chuỗi ngày giờ hợp lệ" });
  }
  return errors;
}

module.exports = { validateTicket, STATUSES, PRIORITIES };
