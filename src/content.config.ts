// src/content.config.ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod'; // v6: NOT from 'astro:content'

// Shared base for every published weblog entry type.
//
// `provenance` is REQUIRED with NO default. A default would silently attest human
// authorship, which is theater; with no default `astro build` itself fails on a
// missing or invalid value, giving a second off-box enforcement point alongside
// scripts/verify-build.mjs. The enum is the whole rule: there is deliberately no
// value that lets AI ORIGINATE a post.
//   human           - Rich wrote it start to finish; AI did not draft or originate it.
//   human-ai-edited - Rich originated the ideas, notes, and words; AI only edited
//                     or formatted (the ceiling of AI involvement).
// See AGENTS.md and the no-ai-authored-posts policy.
const provenance = z.enum(['human', 'human-ai-edited']);

// Free-form tags, normalized to a URL-safe lowercase slug and de-duplicated so
// /tags/<tag>/ derivation is lossless ("AI" vs "ai" never split; "c#", ".net",
// "a/b", "50%" never break the route). Empty/whitespace tags are dropped; the
// 1-10 bound is enforced AFTER normalization.
const tags = z
  .array(z.string())
  .transform((list) => [
    ...new Set(
      list
        .map((t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''))
        .filter(Boolean)
    ),
  ])
  .refine((list) => list.length >= 1 && list.length <= 10, {
    message: 'each entry needs 1 to 10 tags that contain at least one letter or digit',
  });

const base = z.object({
  title: z.string(),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  tags,
  draft: z.boolean().default(false),
  provenance,
});

// The glob loader has no default underscore exclusion (Astro v5 upgrade guide),
// so `[^_]*` keeps _TEMPLATE files out of the built collection. Non-recursive on
// purpose: entries are flat, date-prefixed files (see scripts/new.mjs), which keeps
// the loader set identical to verify-build.mjs's flat scan. Short-form is .md only
// (no JSX in a two-sentence link; keeps the full-text feed clean).
const mdOnly = (dir: string) => glob({ base: `./src/content/${dir}`, pattern: '[^_]*.md' });

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '[^_]*.{md,mdx}' }),
  schema: base.extend({ description: z.string() }),
});

const links = defineCollection({
  loader: mdOnly('links'),
  schema: base.extend({
    url: z.string().url(), // the external URL being commented on
    via: z.string().optional(), // "via <source>" attribution label
    viaUrl: z.string().url().optional(),
    description: z.string().optional(),
  }),
});

const tils = defineCollection({
  loader: mdOnly('tils'),
  schema: base.extend({ description: z.string().optional() }),
});

const notes = defineCollection({
  loader: mdOnly('notes'),
  schema: base.extend({ description: z.string().optional() }),
});

const quotes = defineCollection({
  loader: mdOnly('quotes'),
  schema: base.extend({
    source: z.string(), // attribution, e.g. "Jane Doe, in <work>"
    sourceUrl: z.string().url().optional(),
    description: z.string().optional(),
  }),
});

export const collections = { posts, links, tils, notes, quotes };
