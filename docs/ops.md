# Ops & release notes

Operational reminders for granolacowboy.dev. None of this is needed to run the site locally;
see the [README](../README.md) for that.

## Release / deploy

- The Vercel project `mhsb/granolacowboy-dev` deploys GitHub `main` to production automatically.
- `main` is protected and PR-only: direct pushes are rejected (branch protection requires the
  "Vercel" status check). Ship by opening a pull request, letting the required Vercel check and the
  GitHub Actions `verify` go green, then squash-merging. A production release is an external change
  and requires explicit approval; the local release gate expects the exact head SHA before any push.
- `vercel.json` contains security headers only and must **not** contain a global `noindex` header.
- If a production build must be hidden before launch, prepare that temporary change on a separate
  `codex/noindex-hotfix` branch. Do not merge or deploy the hotfix without explicit production
  approval, and remove `X-Robots-Tag: noindex` before the real launch.
- The Vercel CLI is optional for local development; install with `npm i -g vercel` to use
  `vercel env pull`, `vercel deploy`, and `vercel logs`.

## Content

- There are no case studies. The unattested draft archetypes were deleted (2026-09-25); only
  `_TEMPLATE.mdx` remains. Recreate one only from a real engagement, with every claim attested, the
  anonymization treatment approved, and defensible directional metrics supplied.
