CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('admin', 'doctor', 'receptionist')) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')) NOT NULL,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  consultation_time INTEGER NOT NULL,
  available_from TIME NOT NULL,
  available_to TIME NOT NULL
);

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_time TIMESTAMP NOT NULL,
  status TEXT CHECK (status IN ('booked', 'cancelled', 'completed')) DEFAULT 'booked',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT prevent_double_booking UNIQUE (doctor_id, appointment_time)
);

CREATE TABLE queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  token_number INTEGER NOT NULL,
  priority TEXT CHECK (priority IN ('normal', 'emergency', 'VIP')) DEFAULT 'normal',
  status TEXT CHECK (status IN ('waiting', 'in_progress', 'done')) DEFAULT 'waiting',
  estimated_wait_time INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_appointments_doctor_time ON appointments(doctor_id, appointment_time);
CREATE INDEX idx_queue_status ON queue(status);

CREATE OR REPLACE FUNCTION generate_token_number()
RETURNS TRIGGER AS $$
DECLARE
  next_token INTEGER;
  v_doctor_id UUID;
  v_appt_date DATE;
BEGIN
  SELECT doctor_id, DATE(appointment_time) INTO v_doctor_id, v_appt_date
  FROM appointments WHERE id = NEW.appointment_id;

  SELECT COALESCE(MAX(q.token_number), 0) + 1 INTO next_token
  FROM queue q
  JOIN appointments a ON q.appointment_id = a.id
  WHERE a.doctor_id = v_doctor_id AND DATE(a.appointment_time) = v_appt_date;

  NEW.token_number := next_token;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_token
BEFORE INSERT ON queue
FOR EACH ROW
EXECUTE FUNCTION generate_token_number();

CREATE OR REPLACE FUNCTION unique_token_check()
RETURNS TRIGGER AS $$
DECLARE
  v_doctor_id UUID;
  v_appt_date DATE;
  token_exists BOOLEAN;
BEGIN
  SELECT doctor_id, DATE(appointment_time) INTO v_doctor_id, v_appt_date
  FROM appointments WHERE id = NEW.appointment_id;

  SELECT EXISTS (
    SELECT 1 FROM queue q
    JOIN appointments a ON q.appointment_id = a.id
    WHERE a.doctor_id = v_doctor_id 
    AND DATE(a.appointment_time) = v_appt_date 
    AND q.token_number = NEW.token_number
    AND q.id != NEW.id
  ) INTO token_exists;

  IF token_exists THEN
    RAISE EXCEPTION 'Token number must be unique per doctor per day';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_unique_token_check
AFTER INSERT OR UPDATE ON queue
FOR EACH ROW
EXECUTE FUNCTION unique_token_check();

CREATE OR REPLACE FUNCTION auto_insert_queue()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'booked' THEN
    INSERT INTO queue (appointment_id, priority, status)
    VALUES (NEW.id, 'normal', 'waiting');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_insert_queue
AFTER INSERT ON appointments
FOR EACH ROW
EXECUTE FUNCTION auto_insert_queue();

CREATE OR REPLACE FUNCTION calculate_wait_time()
RETURNS TRIGGER AS $$
DECLARE
  v_doctor_id UUID;
  avg_time INTEGER;
  accumulated_wait INTEGER := 0;
  q_rec RECORD;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    SELECT doctor_id INTO v_doctor_id FROM appointments WHERE id = NEW.appointment_id;
  ELSIF TG_OP = 'DELETE' THEN
    SELECT doctor_id INTO v_doctor_id FROM appointments WHERE id = OLD.appointment_id;
  END IF;

  SELECT consultation_time INTO avg_time FROM doctors WHERE id = v_doctor_id;
  IF avg_time IS NULL THEN avg_time := 15; END IF;

  FOR q_rec IN
    SELECT q.id
    FROM queue q
    JOIN appointments a ON q.appointment_id = a.id
    WHERE a.doctor_id = v_doctor_id AND DATE(a.appointment_time) = CURRENT_DATE AND q.status = 'waiting'
    ORDER BY CASE q.priority WHEN 'emergency' THEN 1 WHEN 'VIP' THEN 2 ELSE 3 END, q.token_number ASC
  LOOP
    UPDATE queue SET estimated_wait_time = accumulated_wait WHERE id = q_rec.id;
    accumulated_wait := accumulated_wait + avg_time;
  END LOOP;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_wait_time
AFTER INSERT OR UPDATE OF status, priority OR DELETE ON queue
FOR EACH ROW
EXECUTE FUNCTION calculate_wait_time();

CREATE OR REPLACE FUNCTION get_queue_position(p_patient_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_position INTEGER;
  v_queue_id UUID;
  v_doctor_id UUID;
  v_appt_date DATE;
BEGIN
  SELECT q.id, a.doctor_id, DATE(a.appointment_time) INTO v_queue_id, v_doctor_id, v_appt_date
  FROM queue q
  JOIN appointments a ON q.appointment_id = a.id
  WHERE a.patient_id = p_patient_id AND q.status = 'waiting' AND DATE(a.appointment_time) = CURRENT_DATE
  LIMIT 1;

  IF v_queue_id IS NULL THEN
    RETURN 0;
  END IF;

  SELECT COUNT(*) + 1 INTO v_position
  FROM queue q
  JOIN appointments a ON q.appointment_id = a.id
  WHERE a.doctor_id = v_doctor_id AND DATE(a.appointment_time) = v_appt_date AND q.status = 'waiting'
  AND (CASE q.priority WHEN 'emergency' THEN 1 WHEN 'VIP' THEN 2 ELSE 3 END, q.token_number) <
      (SELECT CASE priority WHEN 'emergency' THEN 1 WHEN 'VIP' THEN 2 ELSE 3 END, token_number FROM queue WHERE id = v_queue_id);

  RETURN v_position;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_next_patient(p_doctor_id UUID)
RETURNS TABLE (
  queue_id UUID,
  patient_name TEXT,
  token_number INTEGER,
  priority TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT q.id, p.name, q.token_number, q.priority
  FROM queue q
  JOIN appointments a ON q.appointment_id = a.id
  JOIN patients p ON a.patient_id = p.id
  WHERE a.doctor_id = p_doctor_id AND DATE(a.appointment_time) = CURRENT_DATE AND q.status = 'waiting'
  ORDER BY CASE q.priority WHEN 'emergency' THEN 1 WHEN 'VIP' THEN 2 ELSE 3 END, q.token_number ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_notes ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION auth_user_role() RETURNS TEXT AS $$
  SELECT role FROM users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth_doctor_id() RETURNS UUID AS $$
  SELECT id FROM doctors WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE POLICY admin_all_users ON users FOR ALL USING (auth_user_role() = 'admin');
CREATE POLICY self_read_users ON users FOR SELECT USING (id = auth.uid());

CREATE POLICY admin_receptionist_all_patients ON patients FOR ALL USING (auth_user_role() IN ('admin', 'receptionist'));
CREATE POLICY doctor_read_patients ON patients FOR SELECT USING (auth_user_role() = 'doctor');

CREATE POLICY all_read_doctors ON doctors FOR SELECT USING (true);
CREATE POLICY admin_all_doctors ON doctors FOR ALL USING (auth_user_role() = 'admin');

CREATE POLICY admin_receptionist_all_appointments ON appointments FOR ALL USING (auth_user_role() IN ('admin', 'receptionist'));
CREATE POLICY doctor_own_appointments ON appointments FOR ALL USING (doctor_id = auth_doctor_id());

CREATE POLICY admin_receptionist_all_queue ON queue FOR ALL USING (auth_user_role() IN ('admin', 'receptionist'));
CREATE POLICY doctor_own_queue ON queue FOR ALL USING (
  EXISTS (SELECT 1 FROM appointments a WHERE a.id = queue.appointment_id AND a.doctor_id = auth_doctor_id())
);

CREATE POLICY admin_all_notes ON consultation_notes FOR ALL USING (auth_user_role() = 'admin');
CREATE POLICY doctor_own_notes ON consultation_notes FOR ALL USING (
  EXISTS (SELECT 1 FROM appointments a WHERE a.id = consultation_notes.appointment_id AND a.doctor_id = auth_doctor_id())
);
CREATE POLICY receptionist_read_notes ON consultation_notes FOR SELECT USING (auth_user_role() = 'receptionist');
