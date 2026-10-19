CREATE TABLE IF NOT EXISTS service_center (
  center_id BIGSERIAL PRIMARY KEY,
  center_name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS incident_category (
  category_id SERIAL PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS technician (
  technician_id BIGSERIAL PRIMARY KEY,
  center_id BIGINT NOT NULL REFERENCES service_center(center_id),
  level VARCHAR(10) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS technician_skill (
  technician_id BIGINT NOT NULL REFERENCES technician(technician_id),
  category_id INT NOT NULL REFERENCES incident_category(category_id),
  proficiency SMALLINT NOT NULL CHECK (proficiency BETWEEN 1 AND 5),
  PRIMARY KEY (technician_id, category_id)
);

CREATE TABLE IF NOT EXISTS ticket (
  ticket_id BIGSERIAL PRIMARY KEY,
  ticket_code VARCHAR(20) UNIQUE NOT NULL,
  center_id BIGINT NOT NULL REFERENCES service_center(center_id),
  category_id INT NOT NULL REFERENCES incident_category(category_id),
  technician_id BIGINT REFERENCES technician(technician_id),
  priority VARCHAR(10) NOT NULL CHECK (priority IN ('LOW','MEDIUM','HIGH','URGENT')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('NEW','ASSIGNED','IN_PROGRESS','WAITING','COMPLETED','CLOSED')),
  due_date TIMESTAMP NOT NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS idx_ticket_center_status ON ticket(center_id, status);

CREATE TABLE IF NOT EXISTS ticket_status_log (
  log_id BIGSERIAL PRIMARY KEY,
  ticket_id BIGINT NOT NULL REFERENCES ticket(ticket_id),
  from_status VARCHAR(20),
  to_status VARCHAR(20) NOT NULL,
  changed_by BIGINT NOT NULL,
  changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ticket_assignment_log (
  assignment_log_id BIGSERIAL PRIMARY KEY,
  ticket_id BIGINT NOT NULL REFERENCES ticket(ticket_id),
  from_technician_id BIGINT REFERENCES technician(technician_id),
  to_technician_id BIGINT NOT NULL REFERENCES technician(technician_id),
  reason VARCHAR(255),
  changed_by BIGINT NOT NULL,
  changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointment (
  appointment_id BIGSERIAL PRIMARY KEY,
  ticket_id BIGINT NOT NULL REFERENCES ticket(ticket_id),
  technician_id BIGINT NOT NULL REFERENCES technician(technician_id),
  scheduled_at TIMESTAMP NOT NULL
);
