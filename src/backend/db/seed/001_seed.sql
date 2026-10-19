INSERT INTO service_center (center_name)
SELECT v.center_name FROM (VALUES
  ('Trung tâm bảo hành TP.HCM 1'),
  ('Trung tâm bảo hành Cần Thơ'),
  ('Trung tâm bảo hành Hà Nội')
) AS v(center_name)
WHERE NOT EXISTS (
  SELECT 1 FROM service_center sc WHERE sc.center_name = v.center_name
);

INSERT INTO incident_category (category_name)
SELECT v.category_name FROM (VALUES
  ('Màn hình'),
  ('Pin'),
  ('Phần mềm')
) AS v(category_name)
WHERE NOT EXISTS (
  SELECT 1 FROM incident_category ic WHERE ic.category_name = v.category_name
);

INSERT INTO technician (center_id, level, is_active)
SELECT sc.center_id, 'L2', true
FROM service_center sc
WHERE sc.center_name = 'Trung tâm bảo hành TP.HCM 1'
AND NOT EXISTS (SELECT 1 FROM technician t WHERE t.center_id = sc.center_id);

INSERT INTO technician_skill (technician_id, category_id, proficiency)
SELECT t.technician_id, ic.category_id, 4
FROM technician t
JOIN service_center sc ON sc.center_id = t.center_id
JOIN incident_category ic ON ic.category_name = 'Màn hình'
WHERE sc.center_name = 'Trung tâm bảo hành TP.HCM 1'
ON CONFLICT (technician_id, category_id) DO NOTHING;

INSERT INTO ticket (ticket_code, center_id, category_id, priority, status, due_date)
SELECT 'MM-DEMO-001', sc.center_id, ic.category_id, 'HIGH', 'NEW', CURRENT_TIMESTAMP + INTERVAL '2 days'
FROM service_center sc CROSS JOIN incident_category ic
WHERE sc.center_name = 'Trung tâm bảo hành TP.HCM 1'
  AND ic.category_name = 'Màn hình'
  AND NOT EXISTS (SELECT 1 FROM ticket WHERE ticket_code = 'MM-DEMO-001');
