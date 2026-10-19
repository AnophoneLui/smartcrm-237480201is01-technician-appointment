

const repository = require("../repositories/ticket.repository");
const { validateTicket } = require("./ticket.validator");

async function list(query = {}) {
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
  const offset = Math.max(Number(query.offset) || 0, 0);

  return repository.findAll({
    status: query.status,
    center_id: query.center_id,
    limit,
    offset
  });
}

async function get(id) {
  const ticket = await repository.findById(id);

  if (!ticket) {
    const error = new Error("Không tìm thấy phiếu dịch vụ");
    error.status = 404;
    throw error;
  }

  return ticket;
}

async function create(data) {
  validateTicket(data);
  return repository.create(data);
}

async function update(id, data) {
  await get(id);
  validateTicket(data, { partial: true });

  const ticket = await repository.update(id, data);

  if (!ticket) {
    const error = new Error("Không tìm thấy phiếu dịch vụ");
    error.status = 404;
    throw error;
  }

  return ticket;
}

async function remove(id) {
  const ticket = await repository.softDelete(id);

  if (!ticket) {
    const error = new Error("Không tìm thấy phiếu dịch vụ");
    error.status = 404;
    throw error;
  }

  return { ticket_id: ticket.ticket_id, deleted: true };
}

module.exports = {
  list,
  get,
  create,
  update,
  remove,
  validateTicket
};
