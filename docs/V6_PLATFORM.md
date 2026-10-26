# IPMI V6.1 — Platform Scope

This revision extends the original V6 UI/API foundation with PostgreSQL-backed data access and schema migrations, a separate staff portal and learner portal, public submission workflows, application review, programme publishing, credential registry support, course/module authoring, enrolment/progress, assessment submission/grading and audit records.

## Core implemented API domains
- Identity: register, login, logout, current user, hashed passwords, bearer sessions, persistent sessions when PostgreSQL is configured, login abuse limiting and role-scoped admin APIs.
- Admissions: authenticated application submission/listing and staff review status/notes.
- Programmes: published catalogue, staff draft creation and publication controls.
- Corporate/content capture: enquiries, newsletter signups and event-interest records.
- Credentials: PostgreSQL registry lookup, issuance, status lifecycle and audit events.
- Learning: course creation/publication, modules, enrolments, completion progress, assessment submissions and grading.

## Database setup
Run `npm run migrate` after setting `DATABASE_URL`. The migration runner applies the initial schema, V6 identity schema, production workflow schema, and catalogue seed in dependency order. In-memory mode is only for development/tests; production refuses to start without `DATABASE_URL`.

## Limitations
The platform is not yet production-certified. Verified email/password recovery, MFA, notifications, full CMS, payment integrations, document/media handling, richer LMS/assessment rules, membership/CPD workflows and live PostgreSQL/browser acceptance testing remain open. See `docs/PRODUCTION_READINESS.md`.
