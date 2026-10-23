-- Dữ liệu mẫu cho luồng phân công. Chạy lại nhiều lần không nhân đôi dòng.
UPDATE technician SET full_name = 'Nguyễn Văn An' WHERE full_name IS NULL;

INSERT INTO technician (center_id, level, is_active, full_name)
SELECT sc.center_id, v.level, true, v.full_name
FROM (VALUES ('Trần Quốc Bảo','L3'), ('Lê Thị Cẩm','L2'), ('Phạm Minh Đức','L1')) AS v(full_name, level)
JOIN service_center sc ON sc.center_name = 'Trung tâm bảo hành TP.HCM 1'
WHERE NOT EXISTS (SELECT 1 FROM technician t WHERE t.full_name = v.full_name);

INSERT INTO technician_skill (technician_id, category_id, proficiency)
SELECT t.technician_id, ic.category_id, v.proficiency
FROM (VALUES
  ('Trần Quốc Bảo','Màn hình',5), ('Trần Quốc Bảo','Pin',4),
  ('Lê Thị Cẩm','Màn hình',3),    ('Lê Thị Cẩm','Phần mềm',4),
  ('Phạm Minh Đức','Màn hình',2)  -- tay nghề < 3: KHÔNG được gợi ý (QT-08)
) AS v(full_name, category_name, proficiency)
JOIN technician t ON t.full_name = v.full_name
JOIN incident_category ic ON ic.category_name = v.category_name
ON CONFLICT (technician_id, category_id) DO NOTHING;

INSERT INTO ticket (ticket_code, center_id, category_id, technician_id, priority, status, due_date)
SELECT v.code, sc.center_id, ic.category_id, te.technician_id, v.priority, v.status,
       CURRENT_TIMESTAMP + v.due::interval
FROM (VALUES
  ('MM-DEMO-002','Trung tâm bảo hành TP.HCM 1','Màn hình','URGENT','NEW','-6 hours', NULL::text),
  ('MM-DEMO-003','Trung tâm bảo hành TP.HCM 1','Pin','MEDIUM','NEW','1 day', NULL),
  ('MM-DEMO-004','Trung tâm bảo hành TP.HCM 1','Phần mềm','LOW','NEW','4 days', NULL),
  ('MM-DEMO-005','Trung tâm bảo hành TP.HCM 1','Màn hình','HIGH','ASSIGNED','12 hours','Trần Quốc Bảo'),
  ('MM-DEMO-006','Trung tâm bảo hành TP.HCM 1','Pin','HIGH','IN_PROGRESS','2 days','Trần Quốc Bảo'),
  ('MM-DEMO-007','Trung tâm bảo hành TP.HCM 1','Màn hình','LOW','COMPLETED','-1 day','Lê Thị Cẩm'),
  -- Cần Thơ chưa có kỹ thuật viên: dùng để thử luồng ngoại lệ "Không có kỹ thuật viên phù hợp"
  ('MM-DEMO-008','Trung tâm bảo hành Cần Thơ','Màn hình','MEDIUM','NEW','3 days', NULL)
) AS v(code, center_name, category_name, priority, status, due, tech_name)
JOIN service_center sc ON sc.center_name = v.center_name
JOIN incident_category ic ON ic.category_name = v.category_name
LEFT JOIN technician te ON te.full_name = v.tech_name
ON CONFLICT (ticket_code) DO NOTHING;
