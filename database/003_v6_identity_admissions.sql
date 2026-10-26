-- V6 institutional platform expansion. PostgreSQL 16+ target.
alter table users add column if not exists role text not null default 'student' check (role in ('student','professional','faculty','corporate_admin','admissions','finance','registrar','verifier','admin'));
alter table users add column if not exists last_login_at timestamptz;
create table if not exists sessions (id uuid primary key default gen_random_uuid(), user_id uuid not null references users(id) on delete cascade, token_hash text unique not null, expires_at timestamptz not null, revoked_at timestamptz, created_at timestamptz not null default now());
create table if not exists membership_records (id uuid primary key default gen_random_uuid(), user_id uuid not null references users(id) on delete cascade, level text not null check (level in ('student','professional','executive')), status text not null default 'active' check (status in ('active','suspended','expired','cancelled')), starts_at timestamptz not null default now(), ends_at timestamptz, created_at timestamptz not null default now());
create table if not exists cpd_records (id uuid primary key default gen_random_uuid(), user_id uuid not null references users(id) on delete cascade, title text not null, provider text, hours numeric(8,2) not null check (hours >= 0), status text not null default 'pending' check (status in ('pending','approved','rejected')), evidence_uri text, created_at timestamptz not null default now(), reviewed_at timestamptz);
create index if not exists idx_sessions_user_id on sessions(user_id);
create index if not exists idx_membership_user_id on membership_records(user_id);
create index if not exists idx_cpd_user_id on cpd_records(user_id);
