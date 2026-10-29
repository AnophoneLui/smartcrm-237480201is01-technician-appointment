const db = require("../config/db");

const SELECT_TICKET = `
  SELECT t.ticket_id, t.ticket_code, t.center_id, t.category_id, t.technician_id,
         t.priority, t.status, t.due_date,
         c.category_name, te.full_name AS technician_name
  FROM ticket t
  LEFT JOIN incident_category c ON c.category_id = t.category_id
  LEFT JOIN technician te ON te.technician_id = t.technician_id`;

async function findAll({ statuses, center_id, limit, offset }) {
  const where = ["t.is_deleted = false"];
  const values = [];
  if (statuses && statuses.length) {
    values.push(statuses);
    where.push(`t.status = ANY($${values.length}::text[])`);
  }
  if (center_id) {
    values.push(Number(center_id));
    where.push(`t.center_id = $${values.length}`);
  }
  values.push(limit, offset);
  const sql = `${SELECT_TICKET} WHERE ${where.join(" AND ")}
    ORDER BY t.due_date ASC, t.ticket_id ASC
    LIMIT $${values.length - 1} OFFSET $${values.length}`;
  return (await db.query(sql, values)).rows;
}

async function findById(id) {
  const r = await db.query(`${SELECT_TICKET} WHERE t.ticket_id = $1 AND t.is_deleted = false`, [id]);
  return r.rows[0] || null;
}

async function create(data) {
  const r = await db.query(
    `INSERT INTO ticket (ticket_code, center_id, category_id, priority, status, due_date)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING ticket_id`,
    [data.ticket_code, data.center_id, data.category_id, data.priority, data.status, data.due_date]
  );
  return findById(r.rows[0].ticket_id);
}

async function update(id, data) {
  const r = await db.query(
    `UPDATE ticket SET
       ticket_code = COALESCE($2, ticket_code), center_id = COALESCE($3, center_id),
       category_id = COALESCE($4, category_id), priority = COALESCE($5, priority),
       status = COALESCE($6, status), due_date = COALESCE($7, due_date)
     WHERE ticket_id = $1 AND is_deleted = false RETURNING ticket_id`,
    [id, data.ticket_code ?? null, data.center_id ?? null, data.category_id ?? null,
     data.priority ?? null, data.status ?? null, data.due_date ?? null]
  );
  return r.rows[0] ? findById(r.rows[0].ticket_id) : null;
}

async function softDelete(id) {
  const r = await db.query(
    `UPDATE ticket SET is_deleted = true WHERE ticket_id = $1 AND is_deleted = false RETURNING ticket_id`, [id]);
  return r.rows[0] || null;
}

// Kỹ thuật viên cùng trung tâm, tay nghề >= minProficiency theo nhóm sự cố, kèm số phiếu đang xử lý
async function findSuggestions(centerId, categoryId, minProficiency) {
  const r = await db.query(
    `SELECT te.technician_id, te.full_name, ts.proficiency,
       (SELECT COUNT(*) FROM ticket x
         WHERE x.technician_id = te.technician_id AND x.is_deleted = false
           AND x.status IN ('ASSIGNED','IN_PROGRESS','WAITING'))::int AS open_count
     FROM technician te
     JOIN technician_skill ts ON ts.technician_id = te.technician_id
     WHERE te.center_id = $1 AND ts.category_id = $2 AND ts.proficiency >= $3 AND te.is_active = true`,
    [centerId, categoryId, minProficiency]
  );
  return r.rows;
}

// Một transaction: gán KTV + đổi trạng thái + ghi 2 log (NFR4). Trả false nếu phiếu không còn NEW.
async function assignTechnician({ ticketId, technicianId, changedBy, reason }) {
  const client = await db.getClient();
  try {
    await client.query("BEGIN");
    const upd = await client.query(
      `UPDATE ticket SET technician_id = $2, status = 'ASSIGNED'
       WHERE ticket_id = $1 AND status = 'NEW' AND is_deleted = false RETURNING ticket_id`,
      [ticketId, technicianId]
    );
    if (!upd.rows[0]) { await client.query("ROLLBACK"); return false; }
    await client.query(
      `INSERT INTO ticket_status_log (ticket_id, from_status, to_status, changed_by) VALUES ($1,'NEW','ASSIGNED',$2)`,
      [ticketId, changedBy]);
    await client.query(
      `INSERT INTO ticket_assignment_log (ticket_id, from_technician_id, to_technician_id, reason, changed_by)
       VALUES ($1, NULL, $2, $3, $4)`, [ticketId, technicianId, reason, changedBy]);
    await client.query("COMMIT");
    return true;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

// PostgreSQL TIMESTAMP WITHOUT TIME ZONE được quy ước là giờ Việt Nam.
// API trả ISO có offset +07:00, tránh lệch giờ giữa Node và Chrome.
const APPOINTMENT_SELECT = `appointment_id, ticket_id, technician_id,
  to_char(scheduled_at, 'YYYY-MM-DD"T"HH24:MI:SS') || '+07:00' AS gio_hen_iso`;
async function findAppointmentsByTicket(ticketId) {
  return (await db.query(`SELECT ${APPOINTMENT_SELECT} FROM appointment
    WHERE ticket_id = $1 AND is_active = true ORDER BY scheduled_at, appointment_id`, [ticketId])).rows;
}

// Đặt/đổi lịch dùng chung transaction, khóa theo kỹ thuật viên để tránh race condition.
async function saveAppointment({ ticketId, technicianId, gioHen, replace = false }) {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock($1::integer, $2::integer)', [71234, Number(technicianId)]);
    const t = await client.query('SELECT technician_id FROM ticket WHERE ticket_id=$1 AND is_deleted=false FOR UPDATE', [ticketId]);
    if (!t.rows[0] || Number(t.rows[0].technician_id) !== Number(technicianId)) {
      const e = new Error('Phiếu đã thay đổi kỹ thuật viên'); e.code = 'TECH_CHANGED'; throw e;
    }
    const own = await client.query('SELECT appointment_id FROM appointment WHERE ticket_id=$1 AND is_active = true FOR UPDATE', [ticketId]);
    if ((replace && !own.rows.length) || (!replace && own.rows.length)) {
      const e = new Error('Trạng thái lịch hẹn đã thay đổi'); e.code = 'APPOINTMENT_STATE'; throw e;
    }
    // Chuyển ISO có offset thành giờ địa phương VN trước khi lưu TIMESTAMP.
    const collision = await client.query(`SELECT appointment_id FROM appointment
      WHERE technician_id=$1 AND ticket_id<>$2 AND is_active = true
        AND ABS(EXTRACT(EPOCH FROM (scheduled_at - ($3::timestamptz AT TIME ZONE 'Asia/Ho_Chi_Minh')))) < 3600
      LIMIT 1`, [technicianId, ticketId, gioHen]);
    if (collision.rows.length) {
      const e = new Error('Kỹ thuật viên đã có lịch trong vòng 60 phút'); e.code = 'APPOINTMENT_CONFLICT'; throw e;
    }
    let row;
    if (replace) {
      row = (await client.query(`UPDATE appointment SET scheduled_at=($2::timestamptz AT TIME ZONE 'Asia/Ho_Chi_Minh')
        WHERE appointment_id=$1 RETURNING appointment_id`, [own.rows[0].appointment_id, gioHen])).rows[0];
    } else {
      row = (await client.query(`INSERT INTO appointment(ticket_id, technician_id, scheduled_at)
        VALUES ($1,$2,($3::timestamptz AT TIME ZONE 'Asia/Ho_Chi_Minh')) RETURNING appointment_id`,
        [ticketId, technicianId, gioHen])).rows[0];
    }
    const result = await client.query(`SELECT ${APPOINTMENT_SELECT} FROM appointment WHERE appointment_id=$1`, [row.appointment_id]);
    await client.query('COMMIT');
    return result.rows[0];
  } catch (e) { await client.query('ROLLBACK'); throw e; }
  finally { client.release(); }
}
// Hủy lịch hẹn đang hoạt động nhưng vẫn giữ lịch sử.
async function cancelAppointment(ticketId) {
  const result = await db.query(
    `UPDATE appointment
     SET is_active = false
     WHERE ticket_id = $1 AND is_active = true
     RETURNING appointment_id`,
    [ticketId]
  );

  return result.rows[0] || null;
}


// FR5: Cap nhat trang thai va ghi log trong cung transaction.
async function updateStatus({ ticketId, status, changedBy }) {
  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    const current = await client.query(
      `SELECT status FROM ticket
       WHERE ticket_id = $1 AND is_deleted = false
       FOR UPDATE`,
      [ticketId]
    );

    if (!current.rows[0]) {
      await client.query("ROLLBACK");
      return { result: "NOT_FOUND" };
    }

    const oldStatus = current.rows[0].status;

    if (oldStatus === status) {
      await client.query("ROLLBACK");
      return { result: "UNCHANGED" };
    }

    await client.query(
      `UPDATE ticket SET status = $2 WHERE ticket_id = $1`,
      [ticketId, status]
    );

    await client.query(
      `INSERT INTO ticket_status_log
       (ticket_id, from_status, to_status, changed_by)
       VALUES ($1, $2, $3, $4)`,
      [ticketId, oldStatus, status, changedBy]
    );

    await client.query("COMMIT");
    return { result: "UPDATED" };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}


// FR4: Doi ky thuat vien va ghi log trong cung transaction.
async function changeTechnician({ ticketId, technicianId, changedBy, reason }) {
  const client = await db.getClient();

  try {
    await client.query("BEGIN");

    const current = await client.query(
      `SELECT technician_id, center_id, category_id, status
       FROM ticket
       WHERE ticket_id = $1 AND is_deleted = false
       FOR UPDATE`,
      [ticketId]
    );

    const ticket = current.rows[0];

    if (!ticket) {
      await client.query("ROLLBACK");
      return { result: "NOT_FOUND" };
    }

    if (ticket.technician_id == null) {
      await client.query("ROLLBACK");
      return { result: "NOT_ASSIGNED" };
    }

    if (["COMPLETED", "CLOSED"].includes(ticket.status)) {
      await client.query("ROLLBACK");
      return { result: "FINISHED" };
    }

    if (Number(ticket.technician_id) === technicianId) {
      await client.query("ROLLBACK");
      return { result: "SAME_TECHNICIAN" };
    }

    const eligible = await client.query(
      `SELECT 1
       FROM technician te
       JOIN technician_skill ts
         ON ts.technician_id = te.technician_id
       WHERE te.technician_id = $1
         AND te.center_id = $2
         AND ts.category_id = $3
         AND ts.proficiency >= 3
         AND te.is_active = true`,
      [technicianId, ticket.center_id, ticket.category_id]
    );

    if (!eligible.rows.length) {
      await client.query("ROLLBACK");
      return { result: "INELIGIBLE" };
    }

    // Khong doi KTV khi phieu dang co lich hen hoat dong.
    const appointment = await client.query(
      `SELECT appointment_id FROM appointment
       WHERE ticket_id = $1 AND is_active = true
       LIMIT 1`,
      [ticketId]
    );

    if (appointment.rows.length) {
      await client.query("ROLLBACK");
      return { result: "ACTIVE_APPOINTMENT" };
    }

    await client.query(
      `UPDATE ticket SET technician_id = $2 WHERE ticket_id = $1`,
      [ticketId, technicianId]
    );

    await client.query(
      `INSERT INTO ticket_assignment_log
       (ticket_id, from_technician_id, to_technician_id, reason, changed_by)
       VALUES ($1, $2, $3, $4, $5)`,
      [ticketId, ticket.technician_id, technicianId, reason, changedBy]
    );

    await client.query("COMMIT");
    return { result: "UPDATED" };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  softDelete,
  findSuggestions,
  assignTechnician,
  changeTechnician,
  updateStatus,
  findAppointmentsByTicket,
  saveAppointment,
  cancelAppointment,
};
