# Security Policy

## Supported versions

Only the latest commit on `main` is actively maintained.

## Reporting a vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Email a description of the issue to the address on the GitHub profile. Include:

- A description of the vulnerability and its impact
- Steps to reproduce or a proof-of-concept (if safe to share)
- Affected component (client, server, infrastructure)

You can expect an acknowledgement within 48 hours and a status update within 7 days.

## Scope

In scope:

- Authentication bypass or token leakage
- Privilege escalation (e.g., customer accessing admin endpoints)
- SQL injection or Prisma query manipulation
- Stripe webhook signature bypass
- Stored or reflected XSS

Out of scope:

- Denial-of-service attacks
- Issues requiring physical access to a device
- Social engineering
- Rate-limiting gaps on non-sensitive endpoints

## Preferred languages

Reports in English or Swedish are welcome.
