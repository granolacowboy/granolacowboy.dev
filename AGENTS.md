## Imported Claude Cowork project instructions

## granolacowboy.dev agent handoff

This repo is an Astro 7 static personal site for `granolacowboy.dev`, deployed on Vercel (static `dist/`, auto-deploy from GitHub `main`). The project is intentionally small: no client framework, no adapter, no site chatbot, no Tailwind unless the user explicitly asks for it. Keep the site fast, static, and personal: this is Rich Berman's personal site and weblog (granolacowboy), in the spirit of a Simon-Willison-style personal blog. MHSB Solutions is context (the About page and the footer Portfolio nav), not the frame.

### First read

1. Read this file.
2. Read `README.md`, `package.json`, `astro.config.mjs`, `vercel.json`, `src/site.config.ts`, and `src/content.config.ts`.
3. Read local planning docs if present: `PLAN.md`, `planning/PHASE4-CONTENT-INTERVIEW.md`, `planning/PHASE7-DEPLOY-RUNBOOK.md`, and `planning/github-profile-README.md`.
4. Run `git status --short` before editing. Do not revert user or prior-agent changes.

`PLAN.md`, `planning/`, and `artifact/` are local planning/build material and are ignored by git. The artifact is meant to ship in its own repo, not inside this site repo.

### Current known state

- Framework: Astro 7 static output, MDX content, sitemap integration.
- Hosting: Vercel project `mhsb/granolacowboy-dev` (static `dist/`, auto-deploy from GitHub `main`). No server adapter is required.
- Production domain target: `https://granolacowboy.dev`.
- Identity format: use `Richard Berman | granolacowboy` in human-facing identity copy (entity canon v1.3.0, 2026-09-30: `Richard Berman` is the primary Person name everywhere, `Rich Berman` only as the structured-data `alternateName`), and exact lowercase `granolacowboy` in the domain, GitHub handle, repository URLs, package name, and Vercel identifiers.
- Content collections (all share a base schema: `title`, `pubDate`, `tags` [1-10, required], `provenance` [required: `human` | `human-ai-edited`], `draft`):
  - `posts` (.md/.mdx) render at `/writing/<id>/` (long-form entries).
  - `links` render at `/links/<id>/` (link blog: `url` + optional `via`/`viaUrl`).
  - `tils` render at `/tils/<id>/` (Today I Learned).
  - `notes` render at `/notes/<id>/` (short observations).
  - `quotes` render at `/quotes/<id>/` (quotation + `source`).
  - Short-form (`links`/`tils`/`notes`/`quotes`) is `.md` only and renders its full body inline in the river; long-form links out.
  - `draft: true` entries are filtered out; `_`-prefixed files (`_TEMPLATE.md/.mdx`) are excluded by the glob.
  - The mixed river, tag counts, and year buckets are assembled in `src/lib/river.ts`; the river list UI is `src/components/RiverList.astro`.
- Positioning baseline (2026-09-27, personal-weblog, approved by Rich): granolacowboy.dev is Rich Berman's genuine personal weblog, not an MHSB business-development hub. This supersedes the 2026-09-25 business-dev-hub baseline. MHSB survives only as context (the About page and the footer Portfolio nav), never the hero, footer chrome beyond Portfolio, or the Org node. Still enforced by build guards: do NOT reintroduce the retired `[FDE / APPLIED AI]` label, the "forward-deployed" self-description, or a specific tenure/year count ("ten years", "2016-2026").
- Writing: the one published long-form post is `post-2-intake-anatomy` (`provenance: human`). `post-1-thesis`, `post-3-regulated-buyers`, and `post-4-deterministic-ai` are retired (their URLs 301 to `/writing/` via `astro.config.mjs`; post-4 was retired 2026-09-27 because its AI cadence needs a human rewrite, and is preserved in the gitignored `drafts/`). The short-form collections launch empty (honest emptiness). The homepage shows the mixed river plus the three projects (intake-triage-mcp, intake-safety, session-benchmark). Adding or retiring an entry no longer touches `verify-build.mjs`: the gate is provenance-driven, not a title allowlist.
- Copy model (2026-09-27): personal voice, short-form notes, Field Notes, TILs, and link-blog entries are WELCOME because they are genuinely Rich's writing. The homepage hero and About currently ship as honest, sparse, factual stubs (marked for Rich only in stripped `{/* */}` comments). Agents must NOT ghost-write his bio or personal prose, and must never put "Rich to replace"-style markers in visible text or in HTML `<!-- -->` comments (Astro preserves those into `dist`), only in stripped `{/* */}` comments, or they will trip the placeholder gate.
- Case studies were removed entirely in the 2026-09-27 pass (the `caseStudies` collection, the `/work/[id]` route, and the `NdaNote`/`ScrollyGrid` components are gone). Reintroduce them only if Rich asks, and only from real, anonymized, Rich-attested engagements.
- New entries: run `node scripts/new.mjs <type> ...` to scaffold a dated file into `drafts/`, then promote it into `src/content/<type>/` by hand (a `!` shell move). Agents cannot write `src/content/**` once the authorship fence is armed; that move is the human authorship act.
- Blog dates always render (the `SHOW_DATES` flag was retired; a personal weblog is dated). `pubDate` also drives ordering and the sitemap.

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

2. Content honesty.
   - The user must own every claim and every metric. Do not fabricate experience, numbers, client details, or outcomes.
   - No purely-AI-generated posts (see Guardrails). AI may edit Rich's notes into `drafts/`; only Rich promotes into `src/content/**`.
   - Word range, first-person voice, and em dashes are ADVISORY now (the gate warns, it does not fail): they were AI-output sanitizers and must not block Rich's own writing.

3. Maintain the surface.
   - The published-entry set is provenance-driven; adding or retiring an entry does NOT require editing `verify-build.mjs` (no more `expectedPostTitles`).
   - Preserve About/contact links, default meta description, project copy, and `ARTIFACT_WRITEUP_PATH`.
   - Keep `/projects/**` (intake-triage-mcp, intake-safety, session-benchmark) intact; they are separate from the weblog river.

4. Optimize honestly.
   - The layout ships zero client JavaScript (the theme toggle was removed); keep it that way unless there is a clear need. The Session Benchmark registry page is the one intentional script.
   - Audit semantic headings, focus states, color contrast, skip link, and mobile wrapping.
   - Verify canonical URL, OG tags, Twitter card, favicon, robots, and sitemap output.
   - Optimize images with Astro assets where possible; avoid remote or decorative assets that do not help the portfolio.
   - Maintain the existing RSS feed when publishing or retiring posts.
   - Update `scripts/verify-build.mjs` when an intentional route-count or metadata invariant changes.

5. Deployment and cutover.
   - Follow `planning/PHASE7-DEPLOY-RUNBOOK.md`.
- `main` is protected and PR-only: direct pushes are rejected (branch protection requires the "Vercel" status check). Ship via a pull request -> required Vercel check + GitHub Actions `verify` green -> squash-merge. A production release is an external change requiring explicit approval, and the local release gate expects the exact head SHA before any push. (The 2026-07-08 launch approval was consumed; each release needs a fresh explicit instruction.)
- Public Git history follows the account-level policy: preserve useful engineering rationale, but do not add model attribution, agent session URLs/IDs, generated-by footers, prompt transcripts, or tool chatter to commit messages or PR metadata. See https://github.com/granolacowboy/.github/blob/main/PUBLIC_DEVELOPMENT.md.
   - The launch `vercel.json` must contain security headers only, with no global `noindex`.
   - The Vercel project build command is `npm run verify` (platform setting; `vercel.json` stays headers-only). Every preview and production build therefore runs `astro check`, `astro build`, and `scripts/verify-build.mjs`. GitHub Actions independently runs the same verification on the self-hosted `gcd` runner; either red signal should be investigated before promotion.
   - If the old production build must be hidden first, prepare the temporary header on `codex/noindex-hotfix`; do not merge or deploy it without explicit production approval, and remove it before launch.
   - After deployment, verify HTTPS, apex/www redirects, sitemap, RSS, zero placeholders, launch security headers, no noindex, and PageSpeed/Lighthouse.

### Guardrails

- Use current official docs before changing Astro, Vercel, sitemap, RSS, MDX, or content collection APIs.
- Prefer existing patterns over new abstractions.
- Use `apply_patch` for manual edits.
- Keep comments concise and remove stale phase comments when they stop helping.
- Do not add a React island, analytics script, webfont, CSS framework, or third-party widget without a clear reason and user approval.
- Preserve the anonymization strategy: category plus problem framing, no identifying client combinations.
- No purely-AI-generated posts, ever. Every published entry (any type) must be genuinely authored or owned by Rich; AI may edit or format his existing notes but must never originate an entry. ENFORCED: `src/content.config.ts` requires a default-less `provenance` enum (`human` | `human-ai-edited`), so `astro build` fails on a missing/invalid value; `scripts/verify-build.mjs` additionally fails the build unless every published entry declares an allowed provenance, every `human-ai-edited` entry renders its disclosure marker, and the site-wide colophon is present. The agent-unforgeable control is the guardrails authorship write-fence (agents cannot write `src/content/**`; Rich promotes from `drafts/` by hand). There is no allowed provenance value for AI-originated content; never present a purely-AI entry as human.
- Never publish unaudited claims or metrics not stated by the user. Honest, factual, structural stubs (a one-line descriptor, section labels) are permitted for the homepage and About while Rich writes his own copy, but mark them only in stripped `{/* */}` comments and never include the tokens `verify-build.mjs` bans (`TODO`, `[PLACEHOLDER...]`, `[NAME]`, `coming soon`, `lorem`) or em dashes.
- Keep `AGENTS.md`, `README.md`, and `docs/ops.md` in sync with the live state. When a change alters the framework, the entry types, the projects, the deploy flow, or the copy model, update these docs in the SAME PR. Prefer code as the source of truth (`package.json`, `src/content.config.ts`, `scripts/verify-build.mjs`) over restating facts in prose; `verify-build.mjs` enforces the framework version the docs state.

### Done checks

Before claiming a pass is complete:

```powershell
npm.cmd run verify
```

The verification script checks built placeholders; per-entry authorship provenance (present + allowed value), the `human-ai-edited` disclosure marker, and the site-wide colophon; the full-text RSS feed's item links matching the published entry routes by set; well-formed XML; the homepage no-FDE guard; canonical and OG metadata; exact lowercase handle casing; the Session Benchmark data-integrity and privacy scans; the framework-version doc check (every `Astro <N>` in README/AGENTS must match the `astro` major in `package.json`); Vercel launch headers; and the no-adapter rule. Word range, first-person voice, and em dashes are advisory warnings. Also inspect the built site or local preview on desktop and mobile. For launch-readiness, run Lighthouse/PageSpeed and record any residual risks rather than hand-waving them away.
