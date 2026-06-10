// src/content.config.ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';          // v6: NOT from 'astro:content'

// Pattern '**/[^_]*.{md,mdx}' excludes "_"-prefixed files so the _TEMPLATE.mdx
// author templates never load as entries. The glob loader has NO default
// underscore exclusion: the v5 upgrade guide (docs.astro.build/en/guides/
// upgrade-to/v5/, "Breaking change: Updated content collections") states
// "This release also removes the option to prefix collection entry file names
// with an underscore (`_`) to prevent building a route." — and the guide's own
// migration example uses exactly this exclusion pattern.
const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/[^_]*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

const caseStudies = defineCollection({
  loader: glob({ base: './src/content/case-studies', pattern: '**/[^_]*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    client: z.string(),            // anonymized: "25-attorney plaintiff-side PI firm"
    summary: z.string(),
    order: z.number(),
    outcomes: z.array(z.string()), // metric-led bullets
    stack: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts, caseStudies };
