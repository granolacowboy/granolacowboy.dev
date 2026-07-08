## Imported Claude Cowork project instructions

## granolacowboy.dev agent handoff

This repo is an Astro 6 static portfolio site for `granolacowboy.dev`, deployed on Vercel (static `dist/`, auto-deploy from GitHub `main`). The project is intentionally small: no client framework, no adapter, no site chatbot, no Tailwind unless the user explicitly asks for it. Keep the site fast, static, professional, and focused on forward-deployed engineering in the legal vertical.

### First read

1. Read this file.
2. Read `README.md`, `package.json`, `astro.config.mjs`, `vercel.json`, `src/site.config.ts`, and `src/content.config.ts`.
3. Read local planning docs if present: `PLAN.md`, `planning/PHASE4-CONTENT-INTERVIEW.md`, `planning/PHASE7-DEPLOY-RUNBOOK.md`, and `planning/github-profile-README.md`.
4. Run `git status --short` before editing. Do not revert user or prior-agent changes.

`PLAN.md`, `planning/`, and `artifact/` are local planning/build material and are ignored by git. The artifact is meant to ship in its own repo, not inside this site repo.

### Current known state

- Framework: Astro 6 static output, MDX content, sitemap integration.
- Hosting: Vercel project `mhsb/granolacowboy-dev` (static `dist/`, auto-deploy from GitHub `main`). No server adapter is required.
- Production domain target: `https://granolacowboy.dev`.
- Identity format: use `Rich Berman | granolacowboy` in human-facing identity copy and exact lowercase `granolacowboy` in the domain, GitHub handle, repository URLs, package name, and Vercel identifiers.
- Content collections:
  - `posts` render at `/writing/<id>/`.
  - `caseStudies` render at `/work/<id>/`.
  - `draft: true` entries are filtered out.
  - `_TEMPLATE.mdx` files are intentionally excluded by the glob.
- The current hero, About, Projects, and three posts are candidate drafts. Claim approval is not recorded, so do not push or deploy them until Rich completes the local claim ledger and approves the exact public wording.
- Metric tokens remain in the three case studies. They are `draft: true` and produce no routes; keep them unpublished until Rich supplies and approves the narrative facts, anonymization treatment, and directional metrics.
- Blog dates are intentionally hidden through `SHOW_DATES = false`; do not change this unless the user asks.
- `NdaNote.astro` copy is fixed. Do not reword it without user sign-off.

### Local command caveat on Windows

PowerShell may block `npm.ps1` and `npx.ps1`. Use `.cmd` launchers when needed:

```powershell
npm.cmd install
npm.cmd run check
npm.cmd run verify
```

Dependency health was reverified on 2026-07-08: the Windows Rollup native package and command shims are present, and `npm.cmd ls --depth=0` is clean. If the missing-Rollup error returns after moving the checkout between platforms, repair the install with `npm.cmd ci`; do not debug site source or delete `package-lock.json` first.

### Use sub-agents throughout

Use sub-agents for sidecar work that can run in parallel. The main agent should own integration, final judgment, and verification.

Good explorer sub-agent tasks:

- Project map: summarize framework, content model, scripts, deploy surface, and local risks.
- SEO/a11y/performance pass: inspect source and generated output, then propose file-specific improvements.
- Content guardrail pass: compare copy against Phase 4 rules, NDA constraints, placeholders, and claim/metric provenance.
- Deploy/runbook pass: check Vercel config, robots/noindex state, production approval gates, and post-launch verification.
- Artifact integration pass: inspect `artifact/` only when asked or when linking `intake-triage-mcp` content; keep artifact work out of the site repo.

Good worker sub-agent splits, with disjoint write scopes:

- Content worker: `src/content/**`, `src/site.config.ts`, and copy-only page edits.
- UI worker: `src/layouts/**`, `src/components/**`, `src/styles/global.css`, and non-copy page structure.
- SEO/assets worker: `public/**`, metadata in `BaseLayout.astro`, robots, OG image handling, sitemap/RSS if added.
- Deploy worker: `vercel.json`, deployment docs, and verification commands only after content is launch-ready.

When spawning workers, tell them they are not alone in the codebase, must not revert others' edits, and must list changed files in their final message.

### Improvement plan for the next serious pass

1. Rehydrate and verify.
   - Run `npm.cmd install` only when dependencies are missing or stale.
   - Run `npm.cmd run verify`.
   - Treat the built `dist/` verification as the publication gate; draft source entries may intentionally retain metric placeholders.

2. Resolve the Phase 4 content gate.
   - Use `planning/PHASE4-CONTENT-INTERVIEW.md`.
   - The user must own every claim and every metric.
   - Do not fabricate experience, numbers, client details, or outcomes.
   - Case studies should be 250 to 450 words with Context, Complication, What I built, Outcome.
   - Posts should be 800 to 1,500 words, first person.
   - Site copy should avoid em dashes.

3. Maintain the portfolio surface.
   - Keep the three metric-incomplete case studies as `draft: true` until the user supplies and approves every number.
   - Keep exactly three published launch posts until the verification script and docs are deliberately updated together.
   - Preserve About/contact links, default meta description, project copy, and `ARTIFACT_WRITEUP_PATH`.
   - Add a resume PDF and project screenshot only when the user supplies or approves them.

4. Optimize honestly.
   - Keep the only JavaScript as the inline theme script unless there is a clear need.
   - Audit semantic headings, focus states, color contrast, skip link, and mobile wrapping.
   - Verify canonical URL, OG tags, Twitter card, favicon, robots, and sitemap output.
   - Optimize images with Astro assets where possible; avoid remote or decorative assets that do not help the portfolio.
   - Maintain the existing RSS feed when publishing or retiring posts.
   - Update `scripts/verify-build.mjs` when an intentional route-count or metadata invariant changes.

5. Deployment and cutover.
   - Follow `planning/PHASE7-DEPLOY-RUNBOOK.md`.
   - A push to GitHub `main` or any Vercel production deployment is an external change and requires explicit approval after `npm.cmd run verify` passes.
   - The launch `vercel.json` must contain security headers only, with no global `noindex`.
   - If the old production build must be hidden first, prepare the temporary header on `codex/noindex-hotfix`; do not merge or deploy it without explicit production approval, and remove it before launch.
   - After deployment, verify HTTPS, apex/www redirects, sitemap, RSS, zero placeholders, launch security headers, no noindex, and PageSpeed/Lighthouse.

### Guardrails

- Use current official docs before changing Astro, Vercel, sitemap, RSS, MDX, or content collection APIs.
- Prefer existing patterns over new abstractions.
- Use `apply_patch` for manual edits.
- Keep comments concise and remove stale phase comments when they stop helping.
- Do not add a React island, analytics script, webfont, CSS framework, or third-party widget without a clear reason and user approval.
- Preserve the anonymization strategy: category plus problem framing, no identifying client combinations.
- Never publish placeholder copy, unaudited claims, or metrics not stated by the user.

### Done checks

Before claiming a pass is complete:

```powershell
npm.cmd run verify
```

The verification script checks built placeholders, published post and RSS counts, draft case-study exclusion, XML, canonical and OG metadata, exact lowercase handle casing, Vercel launch headers, and the no-adapter rule. Also inspect the built site or local preview on desktop and mobile. For launch-readiness, run Lighthouse/PageSpeed and record any residual risks rather than hand-waving them away.
