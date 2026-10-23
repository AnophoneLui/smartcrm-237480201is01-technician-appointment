-- TD-09: giao diện cần hiển thị tên kỹ thuật viên
ALTER TABLE technician ADD COLUMN IF NOT EXISTS full_name VARCHAR(100);
