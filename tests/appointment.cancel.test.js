
const test = require("node:test");
const assert = require("node:assert/strict");
const { createTicketService } = require("../src/backend/services/ticket.service");

// Test 1: Hủy lịch hẹn thành công
test("hủy lịch hẹn thành công", async () => {
  const repo = {
    findById: async () => ({ ticket_id: 1, technician_id: 2 }),
    cancelAppointment: async (ticketId) => {
      assert.equal(ticketId, 1);
      return { appointment_id: 10 };
    }
  };

  const service = createTicketService(repo);
  const result = await service.cancelAppointment(1);

  assert.deepEqual(result, { appointmentId: 10, cancelled: true });
});

// Test 2: Không có lịch hẹn để hủy
test("hủy lịch không tồn tại trả 404", async () => {
  const repo = {
    findById: async () => ({ ticket_id: 1, technician_id: 2 }),
    cancelAppointment: async () => null
  };

  const service = createTicketService(repo);

  await assert.rejects(
    () => service.cancelAppointment(1),
    (error) => error.status === 404 && error.code === "KHONG_CO_LICH_HEN"
  );
});
