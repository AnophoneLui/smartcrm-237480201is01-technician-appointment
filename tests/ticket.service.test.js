const test = require("node:test");
const assert = require("node:assert/strict");
const { validateTicket } = require("../src/backend/services/ticket.validator");

test("validateTicket accepts valid ticket data", () => {
  const errors = validateTicket({
    ticket_code: "MM-TEST-001",
    center_id: 1,
    category_id: 1,
    priority: "HIGH",
    status: "NEW",
    due_date: "2026-11-01T10:00:00"
  });

  assert.deepEqual(errors, []);
});

test("validateTicket rejects missing ticket code", () => {
  const errors = validateTicket({
    center_id: 1,
    category_id: 1,
    priority: "HIGH",
    status: "NEW"
  });

  assert.ok(errors.length > 0);
});

test("validateTicket rejects invalid priority", () => {
  const errors = validateTicket({
    ticket_code: "MM-TEST-002",
    center_id: 1,
    category_id: 1,
    priority: "INVALID",
    status: "NEW"
  });

  assert.ok(errors.length > 0);
});
