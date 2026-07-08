import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const dist = path.join(root, 'dist');
const siteOrigin = 'https://granolacowboy.dev';
const failures = [];

function check(condition, message) {
  if (condition) {
    console.log(`PASS ${message}`);
  } else {
    failures.push(message);
    console.error(`FAIL ${message}`);
  }
}

async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else files.push(fullPath);
  }

  return files;
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'));
  return match?.[2];
}

function tags(html, name) {
  return html.match(new RegExp(`<${name}\\b[^>]*>`, 'gi')) ?? [];
}

function routeForHtml(file) {
  const relative = path.relative(dist, file).replaceAll(path.sep, '/');
  if (relative === 'index.html') return '/';
  if (relative.endsWith('/index.html')) return `/${relative.slice(0, -'index.html'.length)}`;
  return null;
}

function assertWellFormedXml(xml, label) {
  const invalidAmpersand = /&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[\da-f]+;)/i.test(xml);
  const scrubbed = xml
    .replace(/<\?xml[\s\S]*?\?>/gi, '')
    .replace(/<!--([\s\S]*?)-->/g, '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '')
    .replace(/<!DOCTYPE([\s\S]*?)>/gi, '');
  const stack = [];
  const tagPattern = /<([^>]+)>/g;
  let match;
  let valid = !invalidAmpersand;

  while ((match = tagPattern.exec(scrubbed)) !== null) {
    const token = match[1].trim();
    if (!token || token.startsWith('!') || token.startsWith('?')) continue;

    if (token.startsWith('/')) {
      const name = token.slice(1).trim();
      if (stack.pop() !== name) valid = false;
      continue;
    }

    if (token.endsWith('/')) continue;
    stack.push(token.split(/\s+/, 1)[0]);
  }

  check(valid && stack.length === 0, `${label} is well-formed XML`);
}

function decodeXml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'");
}

function imageDimensions(buffer) {
  const pngSignature = '89504e470d0a1a0a';
  if (buffer.subarray(0, 8).toString('hex') === pngSignature) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }

  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    const startOfFrame = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
    while (offset + 8 < buffer.length) {
      if (buffer[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = buffer[offset + 1];
      if (startOfFrame.has(marker)) {
        return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
      }
      const length = buffer.readUInt16BE(offset + 2);
      if (length < 2) break;
      offset += length + 2;
    }
  }

  throw new Error('Unsupported or invalid OG image format');
}

check(await exists(dist), 'dist exists');
if (!(await exists(dist))) process.exit(1);

const files = await walk(dist);
const textExtensions = new Set([
  '.astro',
  '.css',
  '.html',
  '.js',
  '.json',
  '.md',
  '.mdx',
  '.mjs',
  '.ts',
  '.txt',
  '.xml',
]);
const textFiles = files.filter((file) => textExtensions.has(path.extname(file).toLowerCase()));
const textEntries = await Promise.all(textFiles.map(async (file) => [file, await readFile(file, 'utf8')]));
const placeholderPattern = /\[PLACEHOLDER[^\]]*\]|\[NAME\]|\bTODO\b|\bcoming soon\b|\blorem\b/i;
const placeholderFiles = textEntries
  .filter(([, contents]) => placeholderPattern.test(contents))
  .map(([file]) => path.relative(dist, file));
check(placeholderFiles.length === 0, `dist contains no placeholder text${placeholderFiles.length ? ` (${placeholderFiles.join(', ')})` : ''}`);

const casingViolations = [];
for (const [file, contents] of textEntries) {
  for (const match of contents.matchAll(/granolacowboy/gi)) {
    if (match[0] !== 'granolacowboy') casingViolations.push(path.relative(dist, file));
  }
}
check(casingViolations.length === 0, 'domain and handle tokens use exact lowercase granolacowboy casing');

const publicSourceFiles = [
  ...(await walk(path.join(root, 'src'))),
  ...(await walk(path.join(root, 'public'))),
  path.join(root, 'README.md'),
  path.join(root, 'AGENTS.md'),
].filter((file) => textExtensions.has(path.extname(file).toLowerCase()));
const identityVariantPattern = /Granola\s+Cowboy|Granolacowboy|GRANOLACOWBOY/g;
const identityVariantFiles = [];
for (const file of publicSourceFiles) {
  if (identityVariantPattern.test(await readFile(file, 'utf8'))) {
    identityVariantFiles.push(path.relative(root, file));
  }
  identityVariantPattern.lastIndex = 0;
}
check(
  identityVariantFiles.length === 0,
  `public source and docs contain no spaced or title-cased handle variants${identityVariantFiles.length ? ` (${identityVariantFiles.join(', ')})` : ''}`
);

const writingDirectory = path.join(dist, 'writing');
const writingEntries = await readdir(writingDirectory, { withFileTypes: true });
const publishedPostIds = [];
for (const entry of writingEntries) {
  if (entry.isDirectory() && await exists(path.join(writingDirectory, entry.name, 'index.html'))) {
    publishedPostIds.push(entry.name);
  }
}
publishedPostIds.sort();
check(publishedPostIds.length === 3, `exactly 3 published post routes exist (found ${publishedPostIds.length})`);

const rssPath = path.join(dist, 'rss.xml');
check(await exists(rssPath), 'rss.xml exists');
const rss = await readFile(rssPath, 'utf8');
assertWellFormedXml(rss, 'rss.xml');
const rssItems = [...rss.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].map((match) => match[1]);
check(rssItems.length === 3, `RSS contains exactly 3 items (found ${rssItems.length})`);
const rssPaths = rssItems.map((item) => {
  const link = item.match(/<link>([\s\S]*?)<\/link>/i)?.[1] ?? '';
  try {
    return new URL(decodeXml(link)).pathname;
  } catch {
    return '';
  }
}).sort();
const postPaths = publishedPostIds.map((id) => `/writing/${id}/`).sort();
check(JSON.stringify(rssPaths) === JSON.stringify(postPaths), 'RSS item links exactly match published post routes');

const sitemapFiles = files.filter((file) => /^sitemap(?:-index|-\d+)?\.xml$/i.test(path.basename(file)));
check(sitemapFiles.length >= 2, 'sitemap index and generated sitemap exist');
const sitemapContents = (await Promise.all(sitemapFiles.map((file) => readFile(file, 'utf8')))).join('\n');
for (const sitemapFile of sitemapFiles) {
  assertWellFormedXml(await readFile(sitemapFile, 'utf8'), path.basename(sitemapFile));
}

const caseStudySource = path.join(root, 'src', 'content', 'case-studies');
const caseStudyFiles = (await readdir(caseStudySource)).filter((name) => !name.startsWith('_') && /\.mdx?$/.test(name));
const draftCaseStudyIds = [];
for (const file of caseStudyFiles) {
  const source = await readFile(path.join(caseStudySource, file), 'utf8');
  const frontmatter = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
  if (/^draft:\s*true\s*$/im.test(frontmatter)) draftCaseStudyIds.push(path.basename(file, path.extname(file)));
}
for (const id of draftCaseStudyIds) {
  check(!(await exists(path.join(dist, 'work', id, 'index.html'))), `draft case study ${id} has no generated route`);
  check(!sitemapContents.includes(`/work/${id}/`), `draft case study ${id} is absent from the sitemap`);
}

const htmlFiles = files.filter((file) => path.extname(file).toLowerCase() === '.html');
let expectedOgUrl;
let expectedOgWidth;
let expectedOgHeight;
for (const file of htmlFiles) {
  const route = routeForHtml(file);
  if (!route) continue;
  const html = await readFile(file, 'utf8');
  const canonicalTags = tags(html, 'link').filter((tag) => attribute(tag, 'rel')?.toLowerCase() === 'canonical');
  const expectedCanonical = new URL(route, siteOrigin).href;
  check(canonicalTags.length === 1 && attribute(canonicalTags[0], 'href') === expectedCanonical, `${route} has one correct canonical URL`);

  const metaTags = tags(html, 'meta');
  const metaContent = (property) => {
    const tag = metaTags.find((candidate) => attribute(candidate, 'property')?.toLowerCase() === property);
    return tag ? attribute(tag, 'content') : undefined;
  };
  const ogUrl = metaContent('og:image');
  const ogWidth = Number(metaContent('og:image:width'));
  const ogHeight = Number(metaContent('og:image:height'));
  if (expectedOgUrl === undefined) {
    expectedOgUrl = ogUrl;
    expectedOgWidth = ogWidth;
    expectedOgHeight = ogHeight;
  }
  check(ogUrl === expectedOgUrl && ogWidth === expectedOgWidth && ogHeight === expectedOgHeight, `${route} uses the shared OG image metadata`);
}

let ogImagePath;
try {
  const ogUrl = new URL(expectedOgUrl);
  check(ogUrl.origin === siteOrigin && !ogUrl.search && !ogUrl.hash, 'OG image URL uses the canonical production origin');
  ogImagePath = path.join(dist, decodeURIComponent(ogUrl.pathname).replace(/^\//, ''));
} catch {
  check(false, 'OG image URL is absolute and valid');
}

if (ogImagePath && await exists(ogImagePath)) {
  const dimensions = imageDimensions(await readFile(ogImagePath));
  check(dimensions.width === 1200 && dimensions.height === 630, 'OG image file is exactly 1200x630');
  check(expectedOgWidth === dimensions.width && expectedOgHeight === dimensions.height, 'OG dimension metadata matches the image file');
} else {
  check(false, 'OG image URL resolves to a built file');
}

const vercelConfig = JSON.parse(await readFile(path.join(root, 'vercel.json'), 'utf8'));
const configuredHeaders = vercelConfig.headers?.flatMap((rule) => rule.headers ?? []) ?? [];
const expectedHeaders = new Map([
  ['x-content-type-options', 'nosniff'],
  ['referrer-policy', 'strict-origin-when-cross-origin'],
  ['x-frame-options', 'DENY'],
]);
check(configuredHeaders.length === expectedHeaders.size, 'vercel.json contains only the launch security headers');
for (const header of configuredHeaders) {
  check(expectedHeaders.get(header.key.toLowerCase()) === header.value, `Vercel header ${header.key} has the expected launch value`);
}
check(!JSON.stringify(vercelConfig).toLowerCase().includes('noindex'), 'vercel.json has no launch-blocking noindex header');

const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
check(!Object.keys({ ...packageJson.dependencies, ...packageJson.devDependencies }).some((name) => name === '@astrojs/vercel'), 'static Astro build has no Vercel server adapter');

if (failures.length) {
  console.error(`\nBuild verification failed with ${failures.length} issue(s).`);
  process.exit(1);
}

console.log('\nBuild verification passed.');
