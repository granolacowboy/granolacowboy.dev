# granolacowboy.dev

Source for [granolacowboy.dev](https://granolacowboy.dev), a personal portfolio site.

**Stack:** [Astro 6](https://astro.build) static output (no client-side framework, no adapter), deployed on [Vercel](https://vercel.com/) (static `dist/`, auto-deploy from GitHub `main`).

## Commands

Run from the repo root:

| Command               | Action                                         |
| :-------------------- | :--------------------------------------------- |
| `npm install`         | Install dependencies                           |
| `npm run dev`         | Start the local dev server at `localhost:4321` |
| `npm run build`       | Build the production site to `./dist/`         |
| `npm run check`       | Run Astro and TypeScript diagnostics           |
| `npm run preview`     | Preview the built site locally                  |
| `npm run verify`      | Check, build, and verify launch invariants      |

On Windows PowerShell, use `npm.cmd` if the `npm.ps1` execution-policy shim is blocked.

## Deployment

Vercel project `mhsb/granolacowboy-dev` deploys GitHub `main` to production. A push or production deployment is an external change and requires explicit approval after `npm run verify` passes. The launch configuration in `vercel.json` contains security headers only and must not contain a global `noindex` header.

If the current production build must be hidden before launch, prepare that temporary change separately on `codex/noindex-hotfix`. Do not merge or deploy the hotfix without explicit production approval, and remove `X-Robots-Tag: noindex` before the real launch.

The Vercel CLI is optional for local development. In an environment where it is unavailable, install it with `npm i -g vercel` to use `vercel env pull`, `vercel deploy`, and `vercel logs`.

## Content note

Case studies remain `draft: true` and produce no public routes. Do not publish them until Rich has attested every claim, approved the anonymization treatment, and supplied defensible directional metrics.
