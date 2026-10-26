# IPMI Institutional Platform — V6.1

React/Vite public website, separate staff administration portal, Node.js API and PostgreSQL-backed workflows. This repository intentionally keeps the staff portal out of the public navigation and public page; it is served as a separate HTML entry at `/admin.html`; the learner workspace is separately served at `/learn.html` (configure the host to rewrite `/admin/` to this entry if a clean route is desired) and must be protected with deployment-level access controls where possible.

## Requirements
- Node.js 22+
- PostgreSQL 16+
- Docker Compose (optional, for local PostgreSQL and Redis)

## Local setup
1. Copy `.env.example` to `.env` and set a strong unique `POSTGRES_PASSWORD` and `ADMIN_PASSWORD`.
2. Start PostgreSQL: `docker compose up -d postgres`.
3. In the shell running commands, load the variables from `.env` (or export the equivalent variables). Windows PowerShell example: `$env:DATABASE_URL='postgresql://ipmi:YOUR_PASSWORD@127.0.0.1:5432/ipmi'`.
4. Install dependencies: `npm install`.
5. Apply schema and seed data: `npm run migrate`.
6. Start API: `npm run dev:api`.
7. In another terminal, start website: `npm run dev:web`.
8. Public site: `http://localhost:5173/`; learner portal: `http://localhost:5173/learn.html`; staff portal: `http://localhost:5173/admin.html`.

`DATABASE_URL` is required in production. Without it, the API runs only an explicitly labelled in-memory development/test mode; production startup refuses to run without persistent storage. Never use in-memory mode for live users or records. The admin account is created idempotently from `ADMIN_EMAIL`/`ADMIN_PASSWORD` during API startup if those variables are set; changing the environment password later does not reset an existing account's password.

## Tests and build
- `npm test` — API and frontend source tests.
- `npm run build:web` — production frontend build.
- `npm run check` — both test suite and production build.
- `npm run migrate` — idempotent schema migration and catalogue seed.

## API overview
- `GET /healthz`, `GET /readyz`
- `GET /api/v1/programmes`
- `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`
- `POST /api/v1/applications`, `GET /api/v1/applications/me`
- `GET /api/v1/credentials/verify?id=...`
- Public submissions: `POST /api/v1/public/enquiries`, `/newsletter`, `/events/interest`
- Staff routes (Bearer token and role required): `/api/v1/admin/overview`, `/applications`, `/programmes`, `/users`, `/credentials`, `/courses`, `/enquiries`, `/newsletter`, `/events`, `/audit`.

## Deployment checklist
- Deploy the web and API with HTTPS and configure `VITE_API_BASE_URL` to the public API origin.
- Set a strict `ALLOWED_ORIGINS` list containing only the production web origin(s).
- Use a managed PostgreSQL database, enforce encrypted connections where required, and run migrations before API startup.
- Set `NODE_ENV=production`, `DATABASE_URL`, a strong `ADMIN_PASSWORD` (at least 16 chars) and appropriate database SSL options. Do not expose the database or Redis ports publicly.
- Place `/admin.html` (or the rewritten `/admin/` route) behind an identity-aware proxy, VPN or IP allowlist if available. API role checks remain mandatory; obscuring the route is not a substitute for authentication.
- Configure database backups, restoration tests, logs/alerts, retention, legal/privacy notices, email provider, monitoring, and operational contacts before launch.
- Do not publish claims about accreditation, legal recognition, affiliations or issued credentials unless independently confirmed by the institution. Only issue credentials after verified institutional authorization.

## Current boundaries
The repository implements persistent identity, application submission/review, programme publishing, public enquiries, newsletter/event-interest capture, credential registry lookup/issuance, basic course records, staff data views, and audit events. Full production LMS delivery (module authoring, file/media hosting, learner progress tracking, quizzes/assessment grading, certificates), email verification/password recovery, MFA, payments, notification delivery, consent management, document uploads/virus scanning, and institutional content governance still require approved policies/provider configuration and additional acceptance testing. Do not describe those deferred areas as complete.
