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

- Positioning (2026-09-27): granolacowboy.dev is Rich Berman's personal site and weblog, not an
  MHSB business-development hub. MHSB is context (About + footer Portfolio nav), not the frame. See
  `AGENTS.md` for the full baseline.
- Post dates always render (the `SHOW_DATES` flag was retired); `pubDate` also drives ordering and the sitemap.
- Entry types: long-form `posts` at `/writing/`, plus short-form `links`, `tils`, `notes`, `quotes`.
  The mixed river, tags, and year archives are assembled in `src/lib/river.ts`. Scaffold a new entry
  with `node scripts/new.mjs <type> ...` (writes to `drafts/`), then promote it into `src/content/<type>/`
  by hand.
- No purely-AI-generated posts, ever: every published entry must be genuinely authored or owned by
  Rich (AI may edit his notes, never originate). ENFORCED in-repo by a required default-less `provenance`
  enum in `src/content.config.ts` (so `astro build` fails on a bad value) plus `scripts/verify-build.mjs`
  (provenance present and allowed, the `human-ai-edited` disclosure marker, and the site-wide colophon).
  The agent write-fence that stops agents authoring in `src/content/**` lives in capability-forge guardrails.
- Case studies were removed in the 2026-09-27 personal-weblog pass (the collection, the `/work/[id]`
  route, and the NDA/scrolly components). Reintroduce only from a real, Rich-attested, anonymized engagement.
