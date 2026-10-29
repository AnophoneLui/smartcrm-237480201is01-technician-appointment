
-- Chỉ một lịch hẹn đang hoạt động trên mỗi phiếu.
-- Chỉ chuẩn hóa dữ liệu khi bổ sung cột lần đầu.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'appointment'
      AND column_name = 'is_active'
  ) THEN

    ALTER TABLE appointment
      ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

    -- Chỉ giữ lịch mới nhất hoạt động khi nâng cấp dữ liệu cũ.
    WITH ranked AS (
      SELECT appointment_id,
             ROW_NUMBER() OVER (
               PARTITION BY ticket_id
               ORDER BY appointment_id DESC
             ) AS rn
      FROM appointment
    )
    UPDATE appointment a
    SET is_active = (ranked.rn = 1)
    FROM ranked
    WHERE a.appointment_id = ranked.appointment_id;

  END IF;
END $$;

-- Không tạo lại nếu index đã tồn tại.
CREATE UNIQUE INDEX IF NOT EXISTS ux_appointment_one_active_per_ticket
ON appointment(ticket_id)
WHERE is_active = true;
