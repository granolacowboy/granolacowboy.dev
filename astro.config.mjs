// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://granolacowboy.dev',
  // Retired-post redirects. post-1-thesis and post-3-regulated-buyers were removed
  // in the 2026-09-25 pass; post-4-deterministic-ai was retired in the 2026-09-27
  // personal-weblog pass (its URL had already been syndicated to the GitHub profile
  // README, so it must keep resolving). Point the previously-live URLs at the writing
  // index instead of 404ing. The static build emits a noindex meta-refresh stub per
  // path; verify-build excludes those stubs from the published-entry and canonical checks.
  redirects: {
    '/writing/post-1-thesis/': '/writing/',
    '/writing/post-3-regulated-buyers/': '/writing/',
    '/writing/post-4-deterministic-ai/': '/writing/',
  },
  // The enforced CSP uses script-src 'self' (no 'unsafe-inline'), so no executable
  // script may be inlined into the HTML. Astro's script-hoisting inline decision reads
  // Vite's build.assetsInlineLimit (see astro/core/build/plugins/plugin-scripts.js);
  // setting it to 0 forces Astro to externalize its one processed client script (the
  // Session Benchmark registry enhancement) to /_astro, loaded from a same-origin URL.
  vite: { build: { assetsInlineLimit: 0 } },
  integrations: [mdx(), sitemap()],
});