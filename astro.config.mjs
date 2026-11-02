// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { readFileSync } from 'node:fs';

// Sitemap lastmod comes from the committed manifest lastmod.json (D11, S1), never
// from the build clock or from git. Refresh it with the command in docs/search/LASTMOD.md.
const lastmodManifest = JSON.parse(readFileSync(new URL('./lastmod.json', import.meta.url), 'utf8'));
// @astrojs/sitemap catches an error thrown in serialize, logs it, writes no
// sitemap and lets the build exit 0, so undated URLs are collected here and the
// lastmod gate integration below fails the build once the sitemap step is done.
/** @type {string[]} */
const undatedUrls = [];
/** @param {string} url @returns {string | undefined} */
const lastmodFor = (url) => {
  const lastmod = lastmodManifest.urls[new URL(url).pathname]?.lastmod;
  if (!lastmod) undatedUrls.push(url);
  return lastmod;
};
/** @type {import('astro').AstroIntegration} */
const lastmodGate = {
  name: 'd11-lastmod-gate',
  hooks: {
    'astro:build:done': () => {
      if (undatedUrls.length > 0) {
        throw new Error(
          `lastmod.json has no entry for ${undatedUrls.join(', ')}; run the refresh command in docs/search/LASTMOD.md`
        );
      }
    },
  },
};
// /projects/notebooks/ redirects to /projects/ (a noindex stub) while
// src/data/notebooks.json is empty, so it stays out of the sitemap until populated.
const notebooksEmpty =
  JSON.parse(readFileSync(new URL('./src/data/notebooks.json', import.meta.url), 'utf8')).length === 0;

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
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !(notebooksEmpty && new URL(page).pathname === '/projects/notebooks/'),
      serialize: (item) => ({ ...item, lastmod: lastmodFor(item.url) }),
    }),
    lastmodGate,
  ],
});