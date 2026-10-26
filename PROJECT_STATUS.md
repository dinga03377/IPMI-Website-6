# IPMI Platform V6.1 — Current Status

This version adds persistent PostgreSQL workflow support, independent public/learner/staff frontend entries, basic admissions and programme operations, a learner course workspace, assessment submission/grading, public enquiry/newsletter/event capture, credential registry operations, and role-scoped staff API access.

## Frontend entries
- `apps/web/index.html` — public institutional site; contains no admin UI and no link to the staff portal.
- `apps/web/learn.html` — learner login/registration, published course catalogue, enrolment, learning modules, progress and assessment submission.
- `apps/web/admin.html` — separate, noindex staff console for overview, applications, programmes, users, courses/modules/assessments, credentials, enquiries, event interest, newsletter and audit data.

## Persistence
- Production requires `DATABASE_URL`; the API refuses to start in production without it.
- Database schema is applied by `npm run migrate` from the numbered SQL files.
- In-memory mode is for local tests/development only and explicitly does not persist data across process restarts.

## Validation run in this environment
- 12 automated API/frontend/workflow tests pass.
- API and migration-runner Node syntax checks pass.
- JSX/JavaScript syntax checks pass for all Vite entries and components.
- Production build, PostgreSQL migration execution and browser E2E remain unverified because npm registry DNS access, Docker and `psql` were unavailable. See `docs/PRODUCTION_READINESS.md`.

## Not yet production-certified
Email verification and password recovery delivery, MFA, consent and unsubscribe flows, full notification delivery, media/file upload and scanning, payment provider integration, full course-media authoring, legal/institutional content approval, hosting security headers, database restore tests, and acceptance tests still require implementation/configuration. Do not represent this repository as fully production-certified until the release checklist in `docs/PRODUCTION_READINESS.md` is completed.
