# IPMI V5 Security Baseline

- Deny-by-default API authorization.
- MFA for privileged roles; step-up auth for sensitive actions.
- Argon2id for local password hashes.
- Short-lived sessions with rotation/revocation.
- Strict server-side validation.
- Rate limiting on authentication, applications and credential verification.
- Audit security-sensitive actions without secrets or raw sensitive payloads.
- Managed secret store and TLS in production.
- Upload MIME sniffing, extension allowlists, size limits and malware scanning.
- Provider-hosted/tokenized payments with signed webhooks and idempotency.
- Minimal public credential disclosure.
- CSP/HSTS/frame-ancestors/Referrer-Policy/Permissions-Policy after deployment topology is known.
- Threat model AI prompt injection and untrusted documents before AI features.
