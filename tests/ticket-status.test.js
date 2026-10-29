const test = require("node:test");
const assert = require("node:assert/strict");
const { createTicketService } = require("../src/backend/services/ticket.service");

test("FR5: cập nhật trạng thái thành công", async () => {
  let received;

  const repo = {
    updateStatus: async (input) => {
      received = input;
      return { result: "UPDATED" };
    },
    findById: async () => ({
      ticket_id: 1,
      ticket_code: "P001",
      status: "IN_PROGRESS",
      center_id: 1,
      category_id: 1,
      priority: "HIGH",
      due_date: new Date("2026-12-01T10:00:00+07:00")
    })
  };

  const service = createTicketService(repo);
  await service.updateStatus(1, { status: "IN_PROGRESS" });

  assert.deepEqual(received, {
    ticketId: 1,
    status: "IN_PROGRESS",
    changedBy: 1
  });
});

test("FR5: từ chối trạng thái không hợp lệ", async () => {
  const service = createTicketService({});

  await assert.rejects(
    () => service.updateStatus(1, { status: "INVALID" }),
    (error) => error.status === 422
  );
});

test("FR5: từ chối khi trạng thái không thay đổi", async () => {
  const service = createTicketService({
    updateStatus: async () => ({ result: "UNCHANGED" })
  });

  await assert.rejects(
    () => service.updateStatus(1, { status: "ASSIGNED" }),
    (error) => error.status === 409
  );
});

test("FR5: phiếu không tồn tại trả 404", async () => {
  const service = createTicketService({
    updateStatus: async () => ({ result: "NOT_FOUND" })
  });

  await assert.rejects(
    () => service.updateStatus(999, { status: "IN_PROGRESS" }),
    (error) => error.status === 404
  );
});
