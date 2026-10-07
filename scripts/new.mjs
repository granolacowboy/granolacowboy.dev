#!/usr/bin/env node
// scripts/new.mjs - scaffold a new weblog entry into drafts/ (NEVER src/content/).
//
// Rich promotes a finished draft by hand:
//   mv drafts/<file>.md src/content/<type>/<file>.md
// That move is the human authorship act. The guardrails write-fence blocks agents
// from writing src/content/ directly, so this scaffold deliberately targets drafts/
// only; an agent running it cannot thereby publish a post.
//
// Usage:
//   node scripts/new.mjs link <url> "Title"
//   node scripts/new.mjs til   "Title"
//   node scripts/new.mjs note  "Title"
//   node scripts/new.mjs quote "Title"
//   node scripts/new.mjs entry "Title"   (long-form; promote into src/content/posts/)
import { mkdir, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const TYPES = new Set(['link', 'til', 'note', 'quote', 'entry']);
const [, , type, ...rest] = process.argv;

const usage = `Usage:
  node scripts/new.mjs link <url> "Title"
  node scripts/new.mjs til "Title"
  node scripts/new.mjs note "Title"
  node scripts/new.mjs quote "Title"
  node scripts/new.mjs entry "Title"`;

if (!TYPES.has(type)) {
  console.error(usage);
  process.exit(1);
}

let url = '';
let title = '';
if (type === 'link') {
  url = rest[0] ?? '';
  title = rest.slice(1).join(' ');
  if (!url || !title) {
    console.error('link needs a URL and a title:\n  node scripts/new.mjs link <url> "Title"');
    process.exit(1);
  }
} else {
  title = rest.join(' ');
  if (!title) {
    console.error(`${type} needs a title:\n  node scripts/new.mjs ${type} "Title"`);
    process.exit(1);
  }
}

const iso = new Date().toISOString();
const day = iso.slice(0, 10);
const slug =
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || type;
const ext = type === 'entry' ? 'mdx' : 'md';
const filename = `${day}-${slug}.${ext}`;

const fm = ['---', `title: ${JSON.stringify(title)}`];
if (type === 'entry') fm.push('description: ""');
if (type === 'link') {
  fm.push(`url: ${JSON.stringify(url)}`);
  fm.push('# via: source name (optional)');
  fm.push('# viaUrl: https://... (optional)');
}
if (type === 'quote') {
  fm.push('source: ""');
  fm.push('# sourceUrl: https://... (optional)');
}
fm.push(`pubDate: ${iso}`);
fm.push('tags: [] # add at least one tag before publishing');
fm.push('provenance: human # human | human-ai-edited (AI may edit your notes, never originate)');
fm.push('draft: false');
fm.push('---');
fm.push('');
fm.push(type === 'quote' ? 'The quoted text goes here.' : 'Write it here, in your voice.');
fm.push('');

const draftsDir = path.join(process.cwd(), 'drafts');
await mkdir(draftsDir, { recursive: true });
const target = path.join(draftsDir, filename);
try {
  await access(target);
  console.error(`Refusing to overwrite drafts/${filename}`);
  process.exit(1);
} catch {
  // does not exist yet -> proceed
}
await writeFile(target, fm.join('\n'), 'utf8');

const dest = type === 'entry' ? 'src/content/posts' : `src/content/${type}s`;
console.log(`Wrote drafts/${filename}`);
console.log(`Fill it in, then publish with:\n  mv drafts/${filename} ${dest}/${filename}`);
