// src/lib/river.ts
// Single source of truth for the weblog "river": the merged, reverse-chronological
// stream across every entry type, plus tag counts and year buckets. All build-time;
// nothing here ships to the browser.
import { getCollection, type CollectionEntry } from 'astro:content';

export type EntryType = 'entry' | 'link' | 'til' | 'note' | 'quote';

export type AnyEntry =
  | CollectionEntry<'posts'>
  | CollectionEntry<'links'>
  | CollectionEntry<'tils'>
  | CollectionEntry<'notes'>
  | CollectionEntry<'quotes'>;

export interface RiverItem {
  type: EntryType;
  id: string;
  href: string;
  title: string;
  pubDate: Date;
  tags: string[];
  provenance: 'human' | 'human-ai-edited';
  entry: AnyEntry; // kept so list pages can render() short-form bodies inline
}

// Route prefix per type. `entry` (long-form posts) keeps the stable /writing/ path.
const PREFIX: Record<EntryType, string> = {
  entry: 'writing',
  link: 'links',
  til: 'tils',
  note: 'notes',
  quote: 'quotes',
};

export const TYPE_LABEL: Record<EntryType, string> = {
  entry: 'ENTRY',
  link: 'LINK',
  til: 'TIL',
  note: 'NOTE',
  quote: 'QUOTE',
};

// Short-form types render their full body inline on list pages; long-form entries
// show title + description on lists and link to their permalink for the body.
export const SHORT_FORM = new Set<EntryType>(['link', 'til', 'note', 'quote']);

const notDraft = ({ data }: { data: { draft?: boolean } }) => !data.draft;

export async function getRiver(): Promise<RiverItem[]> {
  const [posts, links, tils, notes, quotes] = await Promise.all([
    getCollection('posts', notDraft),
    getCollection('links', notDraft),
    getCollection('tils', notDraft),
    getCollection('notes', notDraft),
    getCollection('quotes', notDraft),
  ]);

  const map = (type: EntryType, coll: AnyEntry[]): RiverItem[] =>
    coll.map((entry) => ({
      type,
      id: entry.id,
      href: `/${PREFIX[type]}/${entry.id}/`,
      title: entry.data.title,
      pubDate: entry.data.pubDate,
      tags: entry.data.tags,
      provenance: entry.data.provenance,
      entry,
    }));

  return [
    ...map('entry', posts),
    ...map('link', links),
    ...map('til', tils),
    ...map('note', notes),
    ...map('quote', quotes),
  ].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());
}

export async function getTagCounts(): Promise<{ tag: string; count: number }[]> {
  const river = await getRiver();
  const counts = new Map<string, number>();
  for (const item of river) {
    for (const tag of item.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export async function getYears(): Promise<number[]> {
  const river = await getRiver();
  return [...new Set(river.map((item) => item.pubDate.getUTCFullYear()))].sort((a, b) => b - a);
}

// Shared UTC date format so displayed dates match pubDate on every build machine.
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { dateStyle: 'medium', timeZone: 'UTC' });
}

// The per-entry AI-assistance disclosure, rendered verbatim wherever a
// `human-ai-edited` entry's body is shown in full (permalink, river inline, RSS
// content, llms-full). Kept as one constant so the string never drifts and the
// build gate can match it. Distinct from the site-wide footer colophon.
export const AI_DISCLOSURE = 'Edited with AI assistance; the ideas and words are mine.';
