const PRIORITIES = new Set(["LOW", "MEDIUM", "HIGH", "URGENT"]);
const STATUSES = new Set([
  "NEW",
  "ASSIGNED",
  "IN_PROGRESS",
  "WAITING",
  "COMPLETED",
  "CLOSED"
]);

function validateTicket(data, { partial = false } = {}) {
  const errors = [];

  if (!partial || data.ticket_code !== undefined) {
    if (typeof data.ticket_code !== "string" || !data.ticket_code.trim()) {
      errors.push("ticket_code là bắt buộc và không được để trống");
    } else if (data.ticket_code.trim().length > 20) {
      errors.push("ticket_code tối đa 20 ký tự");
    }
  }

  for (const field of ["center_id", "category_id"]) {
    if (
      (!partial || data[field] !== undefined) &&
      (!Number.isInteger(Number(data[field])) || Number(data[field]) < 1)
    ) {
      errors.push(`${field} phải là số nguyên dương`);
    }
  }

  if (
    (!partial || data.priority !== undefined) &&
    !PRIORITIES.has(data.priority)
  ) {
    errors.push(`priority phải thuộc: ${[...PRIORITIES].join(", ")}`);
  }

  if (
    (!partial || data.status !== undefined) &&
    !STATUSES.has(data.status)
  ) {
    errors.push(`status phải thuộc: ${[...STATUSES].join(", ")}`);
  }

  if (
    (!partial || data.due_date !== undefined) &&
    (typeof data.due_date !== "string" ||
      Number.isNaN(Date.parse(data.due_date)))
  ) {
    errors.push("due_date phải là chuỗi ngày giờ hợp lệ");
  }

  return errors;
}

module.exports = { validateTicket };
