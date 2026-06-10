// src/content.config.ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';          // v6: NOT from 'astro:content'

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

const caseStudies = defineCollection({
  loader: glob({ base: './src/content/case-studies', pattern: '**/*.{md,mdx}' }),
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
