# Staff Administration Portal

The administration frontend is a separate Vite entry at `apps/web/admin.html`, built as `/admin.html`. It is not imported into the public site's JavaScript bundle and is not linked from public navigation. Hosting may rewrite `/admin/` to `/admin.html`, but the server's role checks—not route secrecy—protect data.

## Current operational modules
- Overview: counts from API/database.
- Admissions: list and review applications, update review status and notes.
- Programmes: create draft programmes and publish/unpublish them.
- Learners & Members: view accounts, update supported roles, disable/reactivate accounts; session revocation occurs when an account is disabled.
- LMS & Assessment: create courses, publish/unpublish, create modules and assessments, manage publication flags.
- Assessment Submissions: view submissions and assign scores/feedback, with score capped by assessment maximum.
- Credentials: issue, view and revoke/reactivate registry records (PostgreSQL required for authoritative records).
- Corporate Academy: view enquiries and update their status.
- Finance & Operations: currently displays event-interest records; finance transactions and billing are not implemented.
- Security & Audit: view audit events.
- Content & Knowledge: currently displays newsletter subscribers; full CMS and unsubscribe flows are not implemented.

## Authorization
API routes enforce role scopes for `admin`, `admissions`, `registrar`, `finance`, `corporate_admin`, and `faculty`. Not every role can access every module; some navigation labels may therefore show a forbidden response for a limited role. The deployment should additionally protect `/admin.html` with an identity-aware proxy, VPN or IP allowlist if available.

## Initial administrator
Set `ADMIN_EMAIL` and a unique `ADMIN_PASSWORD` of at least 16 characters before starting the API. The account is inserted idempotently at startup after migrations. Changing the environment variable later does not reset an existing database account's password.
