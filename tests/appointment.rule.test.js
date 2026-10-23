const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createTicketService } = require('../src/backend/services/ticket.service');
const ticket = { ticket_id: 1, technician_id: 2, status: 'ASSIGNED' };
function service(code) { return createTicketService({
  findById: async () => ticket,
  saveAppointment: async (input) => { if (code) { const e = new Error(); e.code = code; throw e; }
    return { appointment_id: 1, ticket_id: 1, technician_id: 2, gio_hen_iso: input.gioHen }; }
}); }
const future = '2099-10-24T08:30:00+07:00';
test('đặt lịch thành công', async () => { const result = await service().createAppointment(1, {gioHen:future}); assert.equal(result.appointmentId, 1); });
test('đổi lịch thành công', async () => { const result = await service().changeAppointment(1, {gioHen:future}); assert.equal(result.ticketId, 1); });
test('trùng lịch trả 409', async () => { await assert.rejects(service('APPOINTMENT_CONFLICT').createAppointment(1,{gioHen:future}), {status:409, code:'TRUNG_LICH'}); });
test('phiếu đã có lịch trả 409', async () => { await assert.rejects(service('APPOINTMENT_STATE').createAppointment(1,{gioHen:future}), {status:409, code:'LICH_DA_THAY_DOI'}); });
test('giờ không có timezone trả 422', async () => { await assert.rejects(service().createAppointment(1,{gioHen:'2099-10-24T08:30'}), {status:422}); });
