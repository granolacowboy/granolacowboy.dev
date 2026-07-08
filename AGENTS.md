## Imported Claude Cowork project instructions

## granolacowboy.dev agent handoff

This repo is an Astro 6 static portfolio site for `granolacowboy.dev`, deployed on Vercel (static `dist/`, auto-deploy from GitHub `main`). The project is intentionally small: no client framework, no adapter, no site chatbot, no Tailwind unless the user explicitly asks for it. Keep the site fast, static, professional, and focused on forward-deployed engineering in the legal vertical.

### First read

1. Read this file.
2. Read `README.md`, `package.json`, `astro.config.mjs`, `netlify.toml`, `src/site.config.ts`, and `src/content.config.ts`.
3. Read local planning docs if present: `PLAN.md`, `planning/PHASE4-CONTENT-INTERVIEW.md`, `planning/PHASE7-DEPLOY-RUNBOOK.md`, and `planning/github-profile-README.md`.
4. Run `git status --short` before editing. Do not revert user or prior-agent changes.

`PLAN.md`, `planning/`, and `artifact/` are local planning/build material and are ignored by git. The artifact is meant to ship in its own repo, not inside this site repo.

### Current known state

- Framework: Astro 6 static output, MDX content, sitemap integration.
- Hosting: Vercel (static `dist/`, auto-deploy from GitHub `main`). The legacy `netlify.toml` and `.netlify/` are stale and slated for removal.
- Production domain target: `https://granolacowboy.dev`.
- Content collections:
  - `posts` render at `/writing/<id>/`.
  - `caseStudies` render at `/work/<id>/`.
  - `draft: true` entries are filtered out.
  - `_TEMPLATE.mdx` files are intentionally excluded by the glob.
- Visible copy is real. Hero, About, Projects, and the three posts are final. The only remaining placeholders are the metric tokens in the three case studies, which are set `draft: true` until roo supplies real numbers.
- Blog dates are intentionally hidden through `SHOW_DATES = false`; do not change this unless the user asks.
- `NdaNote.astro` copy is fixed. Do not reword it without user sign-off.

### Local command caveat on Windows

PowerShell may block `npm.ps1` and `npx.ps1`. Use `.cmd` launchers when needed:

```powershell
npm.cmd install
npm.cmd run build
npx.cmd astro check
```

At last handoff, `node_modules` existed but was not healthy on Windows: `.bin` entries were zero-byte links and Rollup's Windows optional native package was missing. Direct `astro-check` passed, but production build failed before compiling source:

```powershell
node node_modules\@astrojs\check\bin\astro-check.js
node node_modules\astro\bin\astro.mjs build
```

The check returned `0 errors, 0 warnings, 0 hints`. The build failed with missing `@rollup/rollup-win32-x64-msvc`. Start by repairing dependencies with `npm.cmd install` or, if you deliberately want a clean install, remove `node_modules` and run `npm.cmd ci`. Do not delete `package-lock.json` unless the user explicitly approves.

### Use sub-agents throughout

Use sub-agents for sidecar work that can run in parallel. The main agent should own integration, final judgment, and verification.

Good explorer sub-agent tasks:

- Project map: summarize framework, content model, scripts, deploy surface, and local risks.
- SEO/a11y/performance pass: inspect source and generated output, then propose file-specific improvements.
- Content guardrail pass: compare copy against Phase 4 rules, NDA constraints, placeholders, and claim/metric provenance.
- Deploy/runbook pass: check Netlify config, robots/noindex state, domain cutover gates, and post-launch verification.
- Artifact integration pass: inspect `artifact/` only when asked or when linking `intake-triage-mcp` content; keep artifact work out of the site repo.

Good worker sub-agent splits, with disjoint write scopes:

- Content worker: `src/content/**`, `src/site.config.ts`, and copy-only page edits.
- UI worker: `src/layouts/**`, `src/components/**`, `src/styles/global.css`, and non-copy page structure.
- SEO/assets worker: `public/**`, metadata in `BaseLayout.astro`, robots, OG image handling, sitemap/RSS if added.
- Deploy worker: `netlify.toml`, deployment docs, and verification commands only after content is launch-ready.

When spawning workers, tell them they are not alone in the codebase, must not revert others' edits, and must list changed files in their final message.

### Improvement plan for the next serious pass

1. Rehydrate and verify.
   - Repair dependencies.
   - Run `npm.cmd run build`.
   - Run `npx.cmd astro check`.
   - Scan for placeholders: `rg -n "\[PLACEHOLDER|\[NAME\]|TODO|coming soon|lorem" src public`.

2. Resolve the Phase 4 content gate.
   - Use `planning/PHASE4-CONTENT-INTERVIEW.md`.
   - The user must own every claim and every metric.
   - Do not fabricate experience, numbers, client details, or outcomes.
   - Case studies should be 250 to 450 words with Context, Complication, What I built, Outcome.
   - Posts should be 800 to 1,500 words, first person.
   - Site copy should avoid em dashes.

3. Build out the portfolio surface.
   - Replace `[NAME]` and all Phase 4 placeholders.
   - Add 3 to 4 real anonymized case studies.
   - Add the 3 planned launch posts.
   - Update About/contact links, default meta description, project copy, and `ARTIFACT_WRITEUP_PATH`.
   - Add a resume PDF and project screenshot only when the user supplies or approves them.

4. Optimize honestly.
   - Keep the only JavaScript as the inline theme script unless there is a clear need.
   - Audit semantic headings, focus states, color contrast, skip link, and mobile wrapping.
   - Verify canonical URL, OG tags, Twitter card, favicon, robots, and sitemap output.
   - Optimize images with Astro assets where possible; avoid remote or decorative assets that do not help the portfolio.
   - Consider adding `@astrojs/rss` only if writing will be maintained.
   - Consider adding npm scripts for `check` and possibly `verify` once the dependency install is healthy.

5. Deployment and cutover.
   - Do not point `granolacowboy.dev` at the new site while placeholders remain.
   - Follow `planning/PHASE7-DEPLOY-RUNBOOK.md`.
   - The old Netlify account currently holds the domain claim; that is human-gated.
   - If the domain is attached before final content, use a temporary `X-Robots-Tag: noindex` header and remove it at launch.
   - After cutover, verify HTTPS, apex/www redirects, sitemap, zero placeholders, no noindex, and PageSpeed/Lighthouse.

### Guardrails

- Use current official docs before changing Astro, Netlify, sitemap, MDX, or content collection APIs.
- Prefer existing patterns over new abstractions.
- Use `apply_patch` for manual edits.
- Keep comments concise and remove stale phase comments when they stop helping.
- Do not add a React island, analytics script, webfont, CSS framework, or third-party widget without a clear reason and user approval.
- Preserve the anonymization strategy: category plus problem framing, no identifying client combinations.
- Never publish placeholder copy, unaudited claims, or metrics not stated by the user.

### Done checks

Before claiming a pass is complete:

```powershell
npm.cmd run build
npx.cmd astro check
rg -n "\[PLACEHOLDER|\[NAME\]|TODO|coming soon|lorem" src public
```

Also inspect the built site or local preview on desktop and mobile. For launch-readiness, run Lighthouse/PageSpeed and record any residual risks rather than hand-waving them away.
