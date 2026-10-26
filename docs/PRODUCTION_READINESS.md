# Release validation and production readiness

## Changes in this hardening pass
- Removed the administration interface and its login code from the public page bundle. The staff console is a separate Vite entry (`/admin.html`) with `noindex` metadata; the public website does not link to it.
- Added a separate learner portal (`/learn.html`) for account sign-in/registration, course catalogue, enrolment, modules, progress completion and assessment submissions.
- Added PostgreSQL migrations and an idempotent migration runner for programme slugs/content, admission review fields, corporate enquiries, newsletter subscribers, event interest, courses/modules/enrolments, assessments/submissions, module progress and persistent login rate-limit state.
- Added PostgreSQL-backed sessions, users, applications, programme management, corporate enquiry/newsletter/event capture, credential registry, course authoring, enrolment, learning modules, progress, assessment submissions/grading and audit events.
- Added server-enforced role scopes for admissions, registrar, finance, corporate administration and faculty, in addition to the full administrator role.
- Added regression tests for the public capture workflows and the basic course-to-assessment workflow.

## Tests actually run in the working environment
- `npm test`: **11 tests passed**.
- `node --check apps/api/src/server.mjs`: passed.
- TypeScript compiler `transpileModule` JSX/JS syntax diagnostics for `main.jsx`, `Admin.jsx`, `Learner.jsx`, the two entry files and `vite.config.js`: passed.

## Validation that could not be performed here
- `npm install` could not reach `https://registry.npmjs.org` because the environment's DNS/network returned `EAI_AGAIN`; no production Vite build could therefore be run and a generated package lockfile could not be produced.
- Docker and `psql` are not available in the execution environment. PostgreSQL migrations, constraints, DB-backed startup, restart persistence and managed-database TLS therefore remain unverified in a live PostgreSQL instance.
- Browser/device E2E tests, production hosting rewrites/headers, accessibility audits and deployment smoke tests could not be run.

## Mandatory before public production launch
This codebase is materially expanded but must not be treated as fully production-certified until the following have been completed and signed off:
1. Install dependencies in a network-enabled build environment; generate and commit `package-lock.json`; run `npm ci`, `npm run check`, and build artifact smoke tests.
2. Apply all migrations to a clean PostgreSQL 16 instance and an upgrade copy; test registration/login, session revocation, applications, administration and learning workflows across API restarts.
3. Configure TLS, strict `ALLOWED_ORIGINS`, managed DB backups/restoration, monitoring/alerting, production secrets and deployment-level access control for `/admin.html`.
4. Implement and configure verified-email delivery, password reset, MFA for privileged users, consent/retention/unsubscribe workflows, notification delivery and security headers at the hosting proxy.
5. Complete approved curriculum/media handling, course materials and assessment rules, certificate issuance policy, payment integration (if required), and acceptance tests with the institution.
6. Have the institution validate legal identity, privacy notice, terms, accreditation/affiliation claims, credential policy, and every published programme/event detail before launch.

The absence of email-provider credentials, institutional policies, and a reachable PostgreSQL/build environment cannot be safely filled with fabricated production settings or claims.
