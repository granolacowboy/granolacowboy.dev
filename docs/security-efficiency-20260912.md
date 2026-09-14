# Security and efficiency changes, September 12 batch

Scope: the public static `granolacowboy.dev` site, based on deployed source commit
`3cd17c092e85e73507abb728b55965c5cbcddcf2`. The baseline output is retained locally
for paired measurement. No production change, submission, new monitoring service, or
client-data inspection was performed.

## Changes and findings

| Finding | Disposition |
| --- | --- |
| Lockfile advisory matches, including build tools | Upgrade Astro from 6.4.8 to the first patched release 7.2.8, MDX to compatible 7.0.8, and sitemap to 3.7.4. Declare the MDX Satteri peer at Astro's own 0.3.8 version. Refresh compatible transitive resolutions. Final audit recorded below. |
| Report-only CSP and placeholder reporting endpoint | Replace with an enforcing response policy. Permit only same-origin scripts and exact SHA-256 hashes of the built registry script and identity JSON-LD; block inline handlers, remote scripts, frames, connections and form submissions. Preserve local fonts/images and generated inline CSS. |
| Low-contrast small labels | Change `.eyebrow`, `.label` and writing-page `.divider--labeled` from ink-400 to existing ink-300. The original labels measured 2.61–2.87:1, below 4.5:1. No wording, layout or brand identity changes. |
| Missing PR checks and outdated header gate | Add read-only-permission PR/main CI using Node 24, `npm ci`, `npm run verify`, and full dependency audit with high-severity failure threshold. Extend the existing build gate to verify effective policy inputs, all emitted script hashes, and event-handler exclusion. Preserve content/draft/route checks. |

The [Astro AVIF advisory](https://github.com/advisories/GHSA-26w7-cxv4-gfx2)
requires processing an attacker-controlled AVIF image and names 7.2.8 as the first fix.
This deployment emits static files without a server adapter, image endpoint, form endpoint,
actions, or server islands. Repository-controlled input can reach the build toolchain;
no production request-to-image-processing path was found. The advisory match is a dependency
and build exposure, not evidence of a remotely exploitable production server.

The original full lockfile audit flagged 11 packages: Astro, MDX (inherited), esbuild,
fast-uri, fast-xml-parser, js-yaml, nanoid, postcss, sharp, smol-toml and svgo.
These are compiler/parser/image or tooling dependencies; the only emitted executable code
is the public synthetic registry enhancement. There is no customer-controlled parser or
optimizer service in the static output. All matches are still addressed through supported
versions rather than suppressed or excluded from auditing.

Version choice follows the [Astro 7 migration guide](https://docs.astro.build/en/guides/upgrade-to/v7/)
and [MDX 7 integration release](https://github.com/withastro/astro/releases/tag/@astrojs%2Fmdx@7.0.0).
`compressHTML: true` preserves the prior inline-element whitespace behavior. Existing
self-hosted font versions are unchanged. MDX 8 requires a newer Satteri API; the smaller
compatible MDX 7 upgrade preserves Astro 7.2.8. Its optional peer is explicit because a
nested-only Satteri install does not resolve from MDX during a clean build.

The response policy uses the hash approach described in
[Vercel's CSP documentation](https://vercel.com/docs/cdn-security/security-headers).
Inline CSS remains permitted for generated code highlighting; JavaScript does not receive
that exception. Font sources include `data:` because the compiler embeds a small local WOFF2
subset in its generated stylesheet. Content edits that change either approved inline block must update its hash
after inspection. Hash drift fails the build verification.

## Verification

SOURCED, verified on September 14, 2026 UTC with Node 24.21.0 and npm 11.19.0:

| Check | Observed result |
| --- | --- |
| Clean `npm ci` on the final dependency set | Passed; Astro 7.2.8, MDX 7.0.8, Satteri 0.3.8. |
| `npm run verify` | Passed: Astro diagnostics reported zero errors and warnings; 12 static HTML pages built; existing content, draft, RSS, metadata and public-data guards plus the new policy checks passed. One pre-existing JSON-LD inline-script hint remains. |
| Full `npm audit --json`, no dependency omissions | Zero critical, high, moderate, low or informational advisories. The original lockfile had 11 flagged packages. |
| `npm ls --depth=0` | Passed with the explicit compatible MDX peer present. |
| Local browser validation with exact `vercel.json` response headers | Chromium 145 checked all 12 built HTML pages in desktop and Pixel 7 viewports: 24 successful page checks, no script exceptions, unexpected CSP violations, horizontal overflow, or serious/critical Axe findings. Dark styling remains correct even when the emulated user preference is light. |
| Interactive and security controls, both viewports | Registry search, clear and trace controls, skip-link focus and Writing navigation passed. Arbitrary inline code, inline event handlers and a remote script were blocked with enforced CSP events. |
| Build-gate negative control | Adding an unapproved inline script to generated output caused the gate to fail; restoring the identical original bytes restored the pass. |
| Baseline comparison | Same 12 HTML paths and zero differences in normalized visible text. Three published writing posts remain; draft case-study routes remain excluded. |
| Visual inspection | Mobile homepage and desktop writing screenshots retain the existing identity, typography and layout. |
| `git diff --check` | Passed. |

Local evidence is retained under ignored `.runs/`: `validated-candidate.log`,
`audit-before.json`, `audit-after.json`, `browser-security.json`,
`script-gate-control.json`, `content-comparison.json`, and screenshots. The local browser
harness reused existing Playwright/Axe tooling and served the built files with the candidate
headers; it did not contact external systems or submit forms. CI configuration is prepared;
no remote workflow execution is claimed.

Earlier minimum-version dependency-resolution failures and a discarded browser run against
an empty failed build remain in the local logs. The results above come from the final compatible
versions and successful build. The first full browser pass identified the embedded WOFF2 font
and low-contrast writing dividers; both were corrected and the full browser check rerun.

## Release boundary

Independent review and the separately coordinated five-run paired performance comparison
must complete before an overall ready-for-release verdict. Local response-header tests do
not prove that Vercel serves those headers. Any later authorized release must verify the
canonical URL, assets, CSP and registry behavior from production. Roll back by reverting
this change set as a whole, including the dependency lockfile and matching script hashes,
then rebuilding and running the same gates. No push or deployment is included in this work.
