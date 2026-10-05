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

## Chat assistant

- `/projects/assistant/` streams from a finetuned model served on a free Hugging Face Space. The
  site stays static; the widget is a client-side `fetch`/SSE call, so no server adapter is added
  (the `@astrojs/vercel` ban stays satisfied).
- The Space origin is declared once in `src/site.config.ts` (`ASSISTANT_API_ORIGIN`) and pinned into
  the CSP `connect-src` in BOTH `vercel.json` and `scripts/verify-build.mjs`. Those two copies must
  stay byte-identical; the build gate asserts the configured header matches the pinned map and that
  the built page's `data-endpoint` origin is allowed by that CSP.
- `ASSISTANT_ENABLED` feature-flags the live UI. While `false`, the page renders an offline state and
  issues no requests, and the projects-index card is hidden, so it is safe to ship before the Space
  exists.
- CSP `connect-src` is necessary but not sufficient: the Space must also return
  `Access-Control-Allow-Origin` for `https://granolacowboy.dev` (and any `*.vercel.app` preview used
  to test) and stream from the same `*.hf.space` origin with no cross-origin redirect.
- To enable: confirm the Space is live at the exact origin, set `ASSISTANT_ENABLED = true` (swap the
  origin in `site.config.ts` + both pinned CSP copies if the Space name differs), run `npm run
  verify`, open a PR, let the Vercel and Actions `verify` checks go green, and squash-merge with
  explicit production approval.

## Content

- There are no case studies. The unattested draft archetypes were deleted (2026-09-25); only
  `_TEMPLATE.mdx` remains. Recreate one only from a real engagement, with every claim attested, the
  anonymization treatment approved, and defensible directional metrics supplied.
