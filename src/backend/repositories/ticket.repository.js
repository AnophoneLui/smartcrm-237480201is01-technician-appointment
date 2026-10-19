const db = require("../config/db");

const columns = `
  ticket_id, ticket_code, center_id, category_id, technician_id,
  priority, status, due_date, is_deleted
`;

async function findAll({ status, center_id, limit, offset }) {
  const where = ["is_deleted = false"];
  const values = [];
  if (status) {
    values.push(status);
    where.push(`status = $${values.length}`);
  }
  if (center_id) {
    values.push(Number(center_id));
    where.push(`center_id = $${values.length}`);
  }
  values.push(limit);
  const limitParam = values.length;
  values.push(offset);
  const offsetParam = values.length;
  const sql = `SELECT ${columns} FROM ticket WHERE ${where.join(" AND ")}
    ORDER BY ticket_id DESC LIMIT $${limitParam} OFFSET $${offsetParam}`;
  const result = await db.query(sql, values);
  return result.rows;
}

async function findById(id) {
  const result = await db.query(
    `SELECT ${columns} FROM ticket WHERE ticket_id = $1 AND is_deleted = false`,
    [id]
  );
  return result.rows[0] || null;
}

async function create(data) {
  const sql = `INSERT INTO ticket
    (ticket_code, center_id, category_id, priority, status, due_date)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING ${columns}`;
  const result = await db.query(sql, [
    data.ticket_code, data.center_id, data.category_id,
    data.priority, data.status, data.due_date
  ]);
  return result.rows[0];
}

async function update(id, data) {
  const sql = `UPDATE ticket SET
    ticket_code = COALESCE($2, ticket_code),
    center_id = COALESCE($3, center_id),
    category_id = COALESCE($4, category_id),
    priority = COALESCE($5, priority),
    status = COALESCE($6, status),
    due_date = COALESCE($7, due_date)
    WHERE ticket_id = $1 AND is_deleted = false
    RETURNING ${columns}`;
  const result = await db.query(sql, [
    id, data.ticket_code ?? null, data.center_id ?? null,
    data.category_id ?? null, data.priority ?? null,
    data.status ?? null, data.due_date ?? null
  ]);
  return result.rows[0] || null;
}

async function softDelete(id) {
  const result = await db.query(
    `UPDATE ticket SET is_deleted = true WHERE ticket_id = $1 AND is_deleted = false RETURNING ticket_id`,
    [id]
  );
  return result.rows[0] || null;
}

module.exports = { findAll, findById, create, update, softDelete };
