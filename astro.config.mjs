// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://granolacowboy.dev',
  // Preserve Astro 6's spacing between inline elements through the v7 upgrade.
  compressHTML: true,
  integrations: [mdx(), sitemap()],
});
