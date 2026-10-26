# Remaining Release Work

1. **Build and database certification:** generate and commit `package-lock.json` in a network-enabled environment; run `npm ci`, production build, migrations on clean/upgrade PostgreSQL instances, and persistence tests across API restarts.
2. **Identity security:** add verified-email flow, password reset delivery, MFA/step-up for privileged roles, session/device management and security review.
3. **Learner experience:** file/media delivery and scanning, richer progress tracking, quizzes/rubrics, grading moderation, completion rules, results/transcripts and authorized certificate issuance.
4. **Institution operations:** complete membership/CPD workflows, corporate tenant isolation, finance/payment/invoice integration if required, notification delivery, content management and subscriber unsubscribe/consent.
5. **Compliance and launch:** approve privacy/terms/retention and all institutional/accreditation claims; add hosting-level security headers, monitoring, alerting, backups/restore drills, browser E2E and user acceptance testing.

Do not deploy for real users until the mandatory release checklist in `docs/PRODUCTION_READINESS.md` is satisfied.
