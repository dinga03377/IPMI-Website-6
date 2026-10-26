-- Production workflow schema. Apply after 001-003 with a role that can create extensions.
ALTER TABLE programmes ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE programmes ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '';
ALTER TABLE programmes ADD COLUMN IF NOT EXISTS duration text;
UPDATE programmes SET slug=lower(regexp_replace(code,'^IPMI-','')) WHERE slug IS NULL;
-- Preserve stable API identifiers for the initial catalogue.
UPDATE programmes SET slug=CASE code WHEN 'IPMI-PPM' THEN 'ppm' WHEN 'IPMI-HRM' THEN 'hrm' WHEN 'IPMI-BME' THEN 'bme' WHEN 'IPMI-CX' THEN 'cx' WHEN 'IPMI-HSE' THEN 'hse' WHEN 'IPMI-SCM' THEN 'scm' WHEN 'IPMI-EXL' THEN 'exec' WHEN 'IPMI-AI' THEN 'ai' WHEN 'IPMI-FIN' THEN 'finance' WHEN 'IPMI-PCM' THEN 'proc' ELSE slug END;
ALTER TABLE programmes ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_programmes_slug ON programmes(slug);
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name text NOT NULL DEFAULT '';
ALTER TABLE applications ADD COLUMN IF NOT EXISTS applicant_name text NOT NULL DEFAULT '';
ALTER TABLE applications ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS statement text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS review_note text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES users(id);
CREATE TABLE IF NOT EXISTS corporate_enquiries (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation text NOT NULL, contact_name text, email citext NOT NULL,
 team_scope text, goals text, status text NOT NULL DEFAULT 'new' CHECK(status IN ('new','contacted','qualified','closed','spam')),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_corporate_enquiries_created ON corporate_enquiries(created_at DESC);
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email citext UNIQUE NOT NULL, active boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS event_interests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), event_name text NOT NULL, email citext NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(event_name,email)
);
CREATE TABLE IF NOT EXISTS courses (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text UNIQUE NOT NULL, title text NOT NULL, description text NOT NULL DEFAULT '', programme_id uuid REFERENCES programmes(id),
 status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','archived')), created_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS course_modules (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE, title text NOT NULL, content text NOT NULL DEFAULT '', sort_order integer NOT NULL DEFAULT 0, published boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS course_enrolments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE, user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 status text NOT NULL DEFAULT 'active' CHECK(status IN ('active','completed','withdrawn')), progress numeric(5,2) NOT NULL DEFAULT 0 CHECK(progress>=0 AND progress<=100), enrolled_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz, UNIQUE(course_id,user_id)
);
CREATE TABLE IF NOT EXISTS assessments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE, title text NOT NULL, instructions text NOT NULL DEFAULT '', max_score numeric(8,2) NOT NULL DEFAULT 100, due_at timestamptz, published boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS assessment_submissions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE, user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 response text NOT NULL, score numeric(8,2), feedback text, status text NOT NULL DEFAULT 'submitted' CHECK(status IN ('submitted','graded','returned')), submitted_at timestamptz NOT NULL DEFAULT now(), graded_at timestamptz, graded_by uuid REFERENCES users(id), UNIQUE(assessment_id,user_id)
);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status,submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_enrolments_user ON course_enrolments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_submissions_user ON assessment_submissions(user_id);
CREATE TABLE IF NOT EXISTS course_module_progress (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), enrolment_id uuid NOT NULL REFERENCES course_enrolments(id) ON DELETE CASCADE,
 module_id uuid NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE, completed_at timestamptz NOT NULL DEFAULT now(), UNIQUE(enrolment_id,module_id)
);
CREATE INDEX IF NOT EXISTS idx_modules_course_order ON course_modules(course_id,sort_order);
CREATE INDEX IF NOT EXISTS idx_assessments_course ON assessments(course_id,created_at DESC);
CREATE TABLE IF NOT EXISTS auth_rate_limits (
 ip_hash text PRIMARY KEY, failures integer NOT NULL DEFAULT 0, window_started_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
