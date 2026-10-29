const test = require("node:test");
const assert = require("node:assert/strict");
const { createTicketService } = require("../src/backend/services/ticket.service");

const ticket = {
  ticket_id: 1,
  ticket_code: "P001",
  center_id: 1,
  category_id: 1,
  technician_id: 2,
  full_name: "Nguyen Van B",
  priority: "HIGH",
  status: "ASSIGNED",
  due_date: new Date("2026-12-01T10:00:00+07:00")
};

test("FR4: đổi kỹ thuật viên thành công", async () => {
  let received;

  const service = createTicketService({
    changeTechnician: async (input) => {
      received = input;
      return { result: "UPDATED" };
    },
    findById: async () => ticket
  });

  await service.changeTechnician(1, {
    technicianId: 2,
    reason: "Kỹ thuật viên cũ nghỉ phép"
  });

  assert.deepEqual(received, {
    ticketId: 1,
    technicianId: 2,
    reason: "Kỹ thuật viên cũ nghỉ phép",
    changedBy: 1
  });
});

test("FR4: thiếu lý do trả 422", async () => {
  const service = createTicketService({});

  await assert.rejects(
    () => service.changeTechnician(1, {
      technicianId: 2,
      reason: ""
    }),
    (error) => error.status === 422
  );
});

test("FR4: trùng kỹ thuật viên trả 409", async () => {
  const service = createTicketService({
    changeTechnician: async () => ({ result: "SAME_TECHNICIAN" })
  });

  await assert.rejects(
    () => service.changeTechnician(1, {
      technicianId: 2,
      reason: "Thử đổi kỹ thuật viên"
    }),
    (error) => error.status === 409
  );
});

test("FR4: kỹ thuật viên không đủ điều kiện trả 422", async () => {
  const service = createTicketService({
    changeTechnician: async () => ({ result: "INELIGIBLE" })
  });

  await assert.rejects(
    () => service.changeTechnician(1, {
      technicianId: 3,
      reason: "Điều chỉnh phân công"
    }),
    (error) => error.status === 422
  );
});

test("FR4: phiếu có lịch hẹn hoạt động trả 409", async () => {
  const service = createTicketService({
    changeTechnician: async () => ({ result: "ACTIVE_APPOINTMENT" })
  });

  await assert.rejects(
    () => service.changeTechnician(1, {
      technicianId: 3,
      reason: "Kỹ thuật viên cũ bận"
    }),
    (error) => error.status === 409
  );
});
