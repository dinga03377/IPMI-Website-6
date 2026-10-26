# Repository Audit — V6.1

The initial V6 project was a visual foundation with an in-memory API, placeholder public forms, a prototype credential ID, and an administration section embedded in the public page. This revision separates the staff console and learner portal into independent frontend entries, replaces the hardcoded prototype credential match with a database-backed registry, and adds a PostgreSQL migration path plus core operational API workflows.

## Verified in local execution
- 12 automated tests passed, including auth/session, authorization boundaries, application review, programme publishing, public enquiry/newsletter/event submissions, course enrolment, module access, assessment submission and grading.
- Node syntax checks and TypeScript JSX/JavaScript parse checks passed.

## Not verified
- `npm install` was blocked by registry DNS failure (`EAI_AGAIN`), so Vite's actual production bundler was not run and no lockfile was generated.
- PostgreSQL/Docker/psql were unavailable, so migration execution and database-backed persistence have not been integration-tested.
- Browser E2E, deployment headers/rewrites, responsive/device tests, accessibility, security penetration testing, backups/restoration and production acceptance are outstanding.

See `docs/PRODUCTION_READINESS.md` for the mandatory release gates and remaining platform scope.
