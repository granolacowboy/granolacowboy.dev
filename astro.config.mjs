// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://granolacowboy.dev',
  // Retired-post redirects (2026-09-25 hybrid-writing pass): post-1-thesis and
  // post-3-regulated-buyers were removed; their operator signal now lives in the
  // homepage Field Notes. Point their previously-live URLs at the writing index
  // so inbound and indexed links keep resolving instead of 404ing. Static build
  // emits a noindex meta-refresh stub per path; verify-build excludes those stubs
  // from the published-post and canonical checks.
  redirects: {
    '/writing/post-1-thesis/': '/writing/',
    '/writing/post-3-regulated-buyers/': '/writing/',
  },
  // The enforced CSP uses script-src 'self' (no 'unsafe-inline'), so no executable
  // script may be inlined into the HTML. Astro's script-hoisting inline decision reads
  // Vite's build.assetsInlineLimit (see astro/core/build/plugins/plugin-scripts.js);
  // setting it to 0 forces Astro to externalize its one processed client script (the
  // Session Benchmark registry enhancement) to /_astro, loaded from a same-origin URL.
  vite: { build: { assetsInlineLimit: 0 } },
  integrations: [mdx(), sitemap()],
});