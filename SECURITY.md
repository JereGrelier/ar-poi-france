# Security Policy

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security problems.

Contact the maintainer via GitHub: [@JereGrelier](https://github.com/JereGrelier) (prefer a private channel / security advisory if available).

## Scope

- Leakage of `DATATOURISME_API_KEY` or other secrets
- Open proxy abuse (unauthenticated public exposure of the upstream key)
- Unsafe handling of location / camera permissions on device

## Out of scope

- DATAtourisme upstream availability or quotas
- GPS / compass accuracy limitations of location-based AR

## Hardening tips for deployers

1. Never embed the DATAtourisme key in the mobile app
2. Restrict CORS / network access if the proxy is not localhost-only
3. Rotate the API key if it may have been exposed
