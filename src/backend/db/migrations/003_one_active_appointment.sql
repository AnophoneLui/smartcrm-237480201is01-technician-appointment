-- Giữ lịch sử cũ, chỉ một lịch đang có hiệu lực trên mỗi phiếu.
ALTER TABLE appointment ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
WITH ranked AS (
  SELECT appointment_id, ROW_NUMBER() OVER (PARTITION BY ticket_id ORDER BY appointment_id DESC) AS rn
  FROM appointment
)
UPDATE appointment a SET is_active = (ranked.rn = 1)
FROM ranked WHERE a.appointment_id = ranked.appointment_id;
CREATE UNIQUE INDEX IF NOT EXISTS ux_appointment_one_active_per_ticket
  ON appointment(ticket_id) WHERE is_active = true;
