# Contributing

## Setup

Follow the [README](README.md) quick start. Use `MOCK_MODE=1` unless you have a DATAtourisme API key.

## Checks before a PR

```bash
npm run check
npm --prefix server exec tsc --noEmit
npm --prefix mobile exec tsc --noEmit
```

## Guidelines

- Keep the DATAtourisme API key on the server only
- Prefer small, focused PRs
- Do not commit `.env`, credentials, or personal device IPs
- Respect [NOTICE](NOTICE) when documenting or redistributing tourism data

## Issues

Use the GitHub issue templates for bugs and feature requests.
