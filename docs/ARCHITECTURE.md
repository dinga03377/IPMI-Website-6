# IPMI V5 Architecture

Public web must never have direct database access. Browser -> CDN/WAF -> API -> domain services -> PostgreSQL/Redis/object storage.

## Target domains
Identity/access, admissions, learning/LMS, assessment, credentials, membership/CPD, corporate academy, content/events, payments, notifications and observability.

## Credential boundary
Public verification returns only minimum necessary data and is rate limited. Issuance, revocation and lifecycle changes are privileged operations and must be audited.
