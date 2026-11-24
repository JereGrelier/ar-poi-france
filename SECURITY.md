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
2. Set `CORS_ORIGINS` to an explicit allowlist (not `*`) when the proxy is reachable beyond localhost
3. Tune `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS` for your traffic
4. Put TLS (and optionally auth) in front of the proxy for internet exposure
5. Rotate the API key if it may have been exposed
