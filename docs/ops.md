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

## Content

- Case studies remain `draft: true` and produce no public routes. Do not publish them until every
  claim has been attested, the anonymization treatment approved, and defensible directional
  metrics supplied.
