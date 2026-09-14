# Ops & release notes

Operational reminders for granolacowboy.dev. None of this is needed to run the site locally;
see the [README](../README.md) for that.

## Release / deploy

- The Vercel project `mhsb/granolacowboy-dev` deploys GitHub `main` to production.
- A push or production deployment is an external change and requires explicit approval after
  `npm run verify` passes.
- `vercel.json` contains security headers only and must **not** contain a global `noindex` header.
- If a production build must be hidden before launch, prepare that temporary change on a separate
  `codex/noindex-hotfix` branch. Do not merge or deploy the hotfix without explicit production
  approval, and remove `X-Robots-Tag: noindex` before the real launch.
- The Vercel CLI is optional for local development; install with `npm i -g vercel` to use
  `vercel env pull`, `vercel deploy`, and `vercel logs`.

## Validation and security policy

- Use Node 24 and `npm ci` to reproduce the committed lockfile. Run `npm run verify`
  and `npm audit` before proposing a release. PR CI runs the same install and verification,
  then rejects high or critical dependency advisories, including build dependencies.
- The site is static and dark-only. The enforcing CSP in `vercel.json` allows local assets,
  the exact inline registry enhancement, and the identity JSON-LD. It blocks arbitrary
  inline JavaScript, inline event handlers, remote scripts, framing, and form submission.
  Inline styles remain allowed for generated syntax highlighting. No report collector exists.
- When approved inline code or identity JSON-LD changes, rebuild and review the actual changed
  script before updating its SHA-256 allowlist in `vercel.json`. `npm run verify:build`
  fails for an unapproved or stale hash. Never add `unsafe-inline` to `script-src` to bypass it.
- Check the built writing pages, registry filtering and dependency trace, keyboard navigation,
  and mobile layout with the configured response headers applied. Astro's ordinary preview
  server does not apply `vercel.json`; it cannot by itself validate deployment headers.
- The [September security and efficiency record](security-efficiency-20260912.md) distinguishes
  local verification from production enforcement and lists remaining release gates.

## Content

- Case studies remain `draft: true` and produce no public routes. Do not publish them until every
  claim has been attested, the anonymization treatment approved, and defensible directional
  metrics supplied.
