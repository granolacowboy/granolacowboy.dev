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

function localBuildCandidates(url) {
  const pathname = decodeURIComponent(url.pathname).replace(/^\/+/, '');
  const direct = path.join(dist, pathname);
  if (!pathname || url.pathname.endsWith('/')) return [path.join(direct, 'index.html')];
  if (path.extname(pathname)) return [direct];
  return [direct, path.join(direct, 'index.html'), `${direct}.html`];
}

async function resolveLocalLink(href, sourceRoute) {
  let url;
  try {
    url = new URL(href, new URL(sourceRoute, siteOrigin));
  } catch {
    return { valid: false, reason: 'is not a valid URL' };
  }

  if (!['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol)) {
    return { valid: false, reason: `uses disallowed ${url.protocol} protocol` };
  }
  if (url.origin !== siteOrigin) return { valid: true };
  let candidates;
  try {
    candidates = localBuildCandidates(url);
  } catch {
    return { valid: false, reason: 'contains invalid URL encoding' };
  }
  const target = candidates.find((candidate) => {
    const resolved = path.resolve(candidate);
    return resolved === dist || resolved.startsWith(`${path.resolve(dist)}${path.sep}`);
  });
  if (!target) return { valid: false, reason: 'escapes dist' };

  let resolvedTarget;
  for (const candidate of candidates) {
    if (await exists(candidate)) {
      resolvedTarget = candidate;
      break;
    }
  }
  if (!resolvedTarget) return { valid: false, reason: 'does not resolve to a built file' };

  if (url.hash && path.extname(resolvedTarget).toLowerCase() === '.html') {
    const fragment = decodeURIComponent(url.hash.slice(1));
    const targetHtml = await readFile(resolvedTarget, 'utf8');
    const targetIds = [...targetHtml.matchAll(/\s+id\s*=\s*(["'])(.*?)\1/gi)].map((match) => match[2]);
    if (!targetIds.includes(fragment)) return { valid: false, reason: `references missing fragment #${fragment}` };
  }

  return { valid: true };
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

const expectedPostTitles = new Set([
  'Deploying AI in a change-resistant vertical: field notes from a decade in law firms',
  'Anatomy of a legal intake automation',
  "What regulated-industry buyers actually need before they'll adopt AI",
]);
const postSourceDirectory = path.join(root, 'src', 'content', 'posts');
const postSourceFiles = (await readdir(postSourceDirectory))
  .filter((name) => !name.startsWith('_') && /\.mdx?$/.test(name));
const publishedPostSources = [];
for (const file of postSourceFiles) {
  const source = await readFile(path.join(postSourceDirectory, file), 'utf8');
  const parts = source.split(/^---\s*$/m);
  const frontmatter = parts[1] ?? '';
  const body = parts.slice(2).join('---');
  if (/^draft:\s*true\s*$/im.test(frontmatter)) continue;
  const title = frontmatter.match(/^title:\s*["']?(.*?)["']?\s*$/im)?.[1];
  const wordCount = [...body.matchAll(/\b[\p{L}\p{N}][\p{L}\p{N}'-]*\b/gu)].length;
  publishedPostSources.push({ file, title, wordCount, body });
}
check(publishedPostSources.length === 3, 'exactly 3 non-draft post sources exist');
check(
  publishedPostSources.every(({ wordCount }) => wordCount >= 800 && wordCount <= 1500),
  `all published posts contain 800-1500 words (${publishedPostSources.map(({ file, wordCount }) => `${file}: ${wordCount}`).join(', ')})`
);
check(
  publishedPostSources.every(({ body }) => /\bI\b|\bmy\b/i.test(body)),
  'all published posts use a first-person voice'
);
check(
  publishedPostSources.every(({ title }) => expectedPostTitles.has(title)),
  'published post titles match the approved launch titles'
);

const emDashHtmlFiles = textEntries
  .filter(([file, contents]) => path.extname(file).toLowerCase() === '.html' && contents.includes('—'))
  .map(([file]) => path.relative(dist, file));
check(emDashHtmlFiles.length === 0, 'published HTML contains no em dashes');

const sitemapFiles = files.filter((file) => /^sitemap(?:-index|-\d+)?\.xml$/i.test(path.basename(file)));
check(sitemapFiles.length >= 2, 'sitemap index and generated sitemap exist');
const sitemapContents = (await Promise.all(sitemapFiles.map((file) => readFile(file, 'utf8')))).join('\n');
for (const sitemapFile of sitemapFiles) {
  assertWellFormedXml(await readFile(sitemapFile, 'utf8'), path.basename(sitemapFile));
}

const benchmarkRoutes = [
  '/projects/session-benchmark/',
  '/projects/session-benchmark/cases/',
  '/projects/session-benchmark/failure-atlas/',
  '/projects/session-benchmark/registry/',
];
for (const route of benchmarkRoutes) {
  const builtFile = path.join(dist, route.replace(/^\//, ''), 'index.html');
  check(await exists(builtFile), `${route} route exists`);
  check(sitemapContents.includes(new URL(route, siteOrigin).href), `${route} appears in the sitemap`);
}

const benchmarkDataDirectory = path.join(dist, 'projects', 'session-benchmark', 'data');
const publicBenchmarkDataDirectory = path.join(root, 'public', 'projects', 'session-benchmark', 'data');
const runtimeBenchmarkDataDirectory = path.join(root, 'src', 'data', 'session-benchmark');
const expectedBenchmarkDownloads = [
  'candidate_answer_sets.json',
  'failure_mode_atlas.json',
  'session_benchmark_cases.yml',
  'session_benchmark_summary.json',
  'session_candidate_results.json',
  'session_deep_dive_summary.json',
  'session_pilot_results.json',
  'synthetic_asset_registry.csv',
];
for (const filename of expectedBenchmarkDownloads) {
  check(await exists(path.join(benchmarkDataDirectory, filename)), `benchmark download ${filename} exists`);
}
if (await exists(benchmarkDataDirectory)) {
  const actualDownloads = (await readdir(benchmarkDataDirectory, { withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort();
  check(
    JSON.stringify(actualDownloads) === JSON.stringify(expectedBenchmarkDownloads),
    `benchmark download directory contains only the approved allowlist (${actualDownloads.join(', ')})`
  );
}

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

const requiredBenchmarkSources = [
  ...expectedBenchmarkDownloads.map((filename) => path.join(publicBenchmarkDataDirectory, filename)),
  path.join(runtimeBenchmarkDataDirectory, 'session_benchmark_cases.json'),
  path.join(runtimeBenchmarkDataDirectory, 'synthetic_asset_registry.json'),
];
const benchmarkSourcesReady = (await Promise.all(requiredBenchmarkSources.map((file) => exists(file)))).every(Boolean);
check(benchmarkSourcesReady, 'all approved benchmark source and normalized data files exist');

if (benchmarkSourcesReady) {
  const summary = await readJson(path.join(publicBenchmarkDataDirectory, 'session_benchmark_summary.json'));
  const deepDive = await readJson(path.join(publicBenchmarkDataDirectory, 'session_deep_dive_summary.json'));
  const candidateResults = await readJson(path.join(publicBenchmarkDataDirectory, 'session_candidate_results.json'));
  const candidateFixtures = await readJson(path.join(publicBenchmarkDataDirectory, 'candidate_answer_sets.json'));
  const pilotResults = await readJson(path.join(publicBenchmarkDataDirectory, 'session_pilot_results.json'));
  const failureAtlas = await readJson(path.join(publicBenchmarkDataDirectory, 'failure_mode_atlas.json'));
  const runtimeCases = await readJson(path.join(runtimeBenchmarkDataDirectory, 'session_benchmark_cases.json'));
  const runtimeRegistry = await readJson(path.join(runtimeBenchmarkDataDirectory, 'synthetic_asset_registry.json'));
  const casesYaml = await readFile(path.join(publicBenchmarkDataDirectory, 'session_benchmark_cases.yml'), 'utf8');
  const registryCsv = await readFile(path.join(publicBenchmarkDataDirectory, 'synthetic_asset_registry.csv'), 'utf8');

  const cases = runtimeCases.cases ?? [];
  const caseIds = cases.map((entry) => entry.id);
  const yamlCaseIds = [...casesYaml.matchAll(/^  - id:\s*["']?([^\s"']+)["']?\s*$/gm)].map((match) => match[1]);
  check(cases.length === 26, `benchmark contains exactly 26 cases (found ${cases.length})`);
  check(new Set(caseIds).size === 26, 'benchmark case IDs are unique');
  check(JSON.stringify(yamlCaseIds) === JSON.stringify(caseIds), 'downloaded YAML case IDs match normalized runtime case IDs');
  check(deepDive.sessions_reviewed === 18, `deep dive records exactly 18 reviewed sessions (found ${deepDive.sessions_reviewed})`);
  check(summary.qualitative_deep_dive?.sessions_reviewed === deepDive.sessions_reviewed, 'benchmark summary matches the deep-dive reviewed-session count');

  const candidates = candidateResults.candidates ?? [];
  const fixtureCandidates = candidateFixtures.candidates ?? [];
  check(candidateResults.candidate_count === 3 && candidates.length === 3, 'candidate results contain exactly 3 profiles');
  check(fixtureCandidates.length === 3, 'candidate answer fixture contains exactly 3 profiles');
  check(summary.candidate_fixture_results?.candidate_count === candidates.length, 'benchmark summary matches the candidate profile count');
  check(candidates.every((candidate) => candidate.case_count === 26 && candidate.results?.length === 26), 'each candidate result profile covers all 26 cases');
  check(fixtureCandidates.every((candidate) => candidate.case_scores?.length === 26), 'each candidate answer fixture covers all 26 cases');
  const candidateIds = candidates.map((candidate) => candidate.candidate_id);
  const fixtureCandidateIds = fixtureCandidates.map((candidate) => candidate.id);
  check(JSON.stringify(candidateIds) === JSON.stringify(fixtureCandidateIds), 'candidate result IDs match candidate answer fixture IDs');
  check(candidates.every((candidate) => JSON.stringify(candidate.results.map((result) => result.case_id)) === JSON.stringify(caseIds)), 'candidate result case IDs match the benchmark case suite');
  check(fixtureCandidates.every((candidate) => JSON.stringify(candidate.case_scores.map((result) => result.case_id)) === JSON.stringify(caseIds)), 'candidate answer fixture case IDs match the benchmark case suite');

  const pilotEntries = pilotResults.results ?? [];
  check(pilotEntries.length === 8 && pilotResults.case_count === 8, `pilot results contain exactly 8 cases (found ${pilotEntries.length})`);
  check(new Set(pilotEntries.map((entry) => entry.case_id)).size === 8 && pilotEntries.every((entry) => caseIds.includes(entry.case_id)), 'pilot result IDs are unique members of the benchmark case suite');

  const failureModes = failureAtlas.failure_modes ?? [];
  check(failureModes.length === 8, `failure atlas contains exactly 8 modes (found ${failureModes.length})`);
  check(new Set(failureModes.map((entry) => entry.id)).size === 8, 'failure mode IDs are unique');
  check(failureModes.every((entry) => entry.benchmark_cases?.every((caseId) => caseIds.includes(caseId))), 'failure atlas references only known benchmark cases');

  const csvLines = registryCsv.trim().split(/\r?\n/);
  const csvAssetIds = csvLines.slice(1).map((line) => line.split(',', 1)[0]);
  const registryAssetIds = runtimeRegistry.map((entry) => entry.asset_id);
  check(runtimeRegistry.length === 30, `synthetic registry contains exactly 30 assets (found ${runtimeRegistry.length})`);
  check(new Set(registryAssetIds).size === 30, 'synthetic registry asset IDs are unique');
  check(JSON.stringify(csvAssetIds) === JSON.stringify(registryAssetIds), 'downloaded CSV asset IDs match normalized runtime registry IDs');

  const mirroredJsonFiles = expectedBenchmarkDownloads.filter((filename) => filename.endsWith('.json'));
  const mirrorsMatch = (await Promise.all(mirroredJsonFiles.map(async (filename) => {
    const publicData = await readJson(path.join(publicBenchmarkDataDirectory, filename));
    const runtimeData = await readJson(path.join(runtimeBenchmarkDataDirectory, filename));
    return JSON.stringify(publicData) === JSON.stringify(runtimeData);
  }))).every(Boolean);
  check(mirrorsMatch, 'public JSON downloads match their normalized runtime mirrors');
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
const brokenLocalLinks = [];
for (const file of htmlFiles) {
  const route = routeForHtml(file);
  if (!route) continue;
  const html = await readFile(file, 'utf8');
  for (const anchor of tags(html, 'a')) {
    const href = attribute(anchor, 'href');
    if (!href) continue;
    const result = await resolveLocalLink(href, route);
    if (!result.valid) brokenLocalLinks.push(`${route} -> ${href} (${result.reason})`);
  }
}
check(
  brokenLocalLinks.length === 0,
  `all built local links and fragments resolve${brokenLocalLinks.length ? ` (${brokenLocalLinks.join('; ')})` : ''}`
);

function countDataMarkers(html, name) {
  const openingTags = html.match(/<[a-z][^>]*>/gi) ?? [];
  const marker = new RegExp(`\\b${name}(?:\\s|=|>)`, 'i');
  return openingTags.filter((tag) => marker.test(tag)).length;
}

for (const route of benchmarkRoutes.slice(1)) {
  const file = path.join(dist, route.replace(/^\//, ''), 'index.html');
  if (!(await exists(file))) continue;
  const html = await readFile(file, 'utf8');
  const tableBlocks = html.match(/<table\b[\s\S]*?<\/table>/gi) ?? [];
  check(tableBlocks.length > 0, `${route} server-renders at least one data table`);
  check(tableBlocks.every((table) => /<caption\b[^>]*>[\s\S]*?<\/caption>/i.test(table)), `${route} tables have captions`);
  check(
    tableBlocks.every((table) => tags(table, 'th').every((tag) => ['col', 'row'].includes(attribute(tag, 'scope')?.toLowerCase()))),
    `${route} table headers declare row or column scope`
  );
  const scrollRegions = (html.match(/<[^>]+\brole=["']region["'][^>]*>/gi) ?? [])
    .filter((tag) => attribute(tag, 'tabindex') === '0' && Boolean(attribute(tag, 'aria-label')));
  check(scrollRegions.length >= tableBlocks.length, `${route} tables have labeled keyboard-scroll regions`);
}

const casesHtmlPath = path.join(dist, 'projects', 'session-benchmark', 'cases', 'index.html');
if (await exists(casesHtmlPath)) {
  const casesHtml = await readFile(casesHtmlPath, 'utf8');
  check(countDataMarkers(casesHtml, 'data-benchmark-case') === 26, 'cases page server-renders all 26 benchmark cases');
  check(countDataMarkers(casesHtml, 'data-candidate-profile') === 3, 'cases page server-renders all 3 candidate profiles');
  check(countDataMarkers(casesHtml, 'data-pilot-result') === 8, 'cases page server-renders all 8 pilot results');
}

const failureAtlasHtmlPath = path.join(dist, 'projects', 'session-benchmark', 'failure-atlas', 'index.html');
if (await exists(failureAtlasHtmlPath)) {
  const failureAtlasHtml = await readFile(failureAtlasHtmlPath, 'utf8');
  check(countDataMarkers(failureAtlasHtml, 'data-failure-mode') === 8, 'failure atlas page server-renders all 8 failure modes');
}

const registryHtmlPath = path.join(dist, 'projects', 'session-benchmark', 'registry', 'index.html');
if (await exists(registryHtmlPath)) {
  const registryHtml = await readFile(registryHtmlPath, 'utf8');
  check(countDataMarkers(registryHtml, 'data-registry-asset') === 30, 'registry page server-renders all 30 synthetic assets');
  check(/<(?:input|select)\b/i.test(registryHtml), 'registry exposes a native filter control');
  check(/\baria-live=["']polite["']/i.test(registryHtml), 'registry announces filter results politely');
  check(/<script\b/i.test(registryHtml) && /\.textContent\b/.test(registryHtml), 'registry enhancement renders dynamic text with textContent');
  check(!/\.innerHTML\b/.test(registryHtml), 'registry enhancement does not render dynamic content with innerHTML');
}

const benchmarkOverviewPath = path.join(dist, 'projects', 'session-benchmark', 'index.html');
const benchmarkCasesPath = path.join(dist, 'projects', 'session-benchmark', 'cases', 'index.html');
if (await exists(benchmarkOverviewPath) && await exists(benchmarkCasesPath)) {
  const benchmarkDisclosureCopy = `${await readFile(benchmarkOverviewPath, 'utf8')}\n${await readFile(benchmarkCasesPath, 'utf8')}`;
  check(/mocked[^<]{0,40}(?:fixture|score)/i.test(benchmarkDisclosureCopy), 'benchmark labels mocked fixture scores');
  check(/subjective[^<]{0,40}(?:pilot|score)/i.test(benchmarkDisclosureCopy), 'benchmark labels subjective pilot scores');
  check(/private[- ]source/i.test(benchmarkDisclosureCopy), 'benchmark states its private-source limitations');
  check(/not a live leaderboard/i.test(benchmarkDisclosureCopy), 'benchmark states that it is not a live leaderboard');
}

const benchmarkPrivacyFiles = [];
for (const directory of [publicBenchmarkDataDirectory, runtimeBenchmarkDataDirectory, path.join(root, 'src', 'pages', 'projects', 'session-benchmark')]) {
  if (await exists(directory)) benchmarkPrivacyFiles.push(...await walk(directory));
}
if (await exists(path.join(dist, 'projects', 'session-benchmark'))) {
  benchmarkPrivacyFiles.push(...await walk(path.join(dist, 'projects', 'session-benchmark')));
}
const privacyPatterns = new Map([
  ['UUIDs', /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i],
  ['email addresses', /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i],
  ['Windows user paths', /\b[A-Z]:(?:\\{1,2}|\/)(?:Users|Documents|Desktop)(?:\\{1,2}|\/)/i],
  ['raw archive or export filenames', /data-[0-9a-f-]+-\d+-[0-9a-f]+-batch-\d+\.zip|(?:conversations|users|memories)\.json|(?:deep_scan|full_catalog)_output\.txt|AI_ORGANIZATION_AUDIT\.md|SOURCE_SESSION_NOTES\.md|(?:conversation|project|entity)_index\.csv/i],
  ['transcript references', /\btranscripts?\b/i],
  ['private source identifier keys', /["']?(?:source_uuid|session_uuid|conversation_id|source_session_id|user_id|account_id)["']?\s*:/i],
  ['private keys or live credentials', /-----BEGIN [A-Z ]*PRIVATE KEY-----|\b(?:sk|pk)_(?:live|test)_[A-Z0-9]{16,}\b|\bAIza[0-9A-Z_-]{20,}\b/i],
]);
for (const [label, pattern] of privacyPatterns) {
  const violatingFiles = [];
  for (const file of benchmarkPrivacyFiles) {
    const extension = path.extname(file).toLowerCase();
    if (!textExtensions.has(extension) && extension !== '.csv' && extension !== '.yml') continue;
    const contents = await readFile(file, 'utf8');
    if (pattern.test(contents) || pattern.test(path.basename(file))) violatingFiles.push(path.relative(root, file));
    pattern.lastIndex = 0;
  }
  check(
    violatingFiles.length === 0,
    `shipped benchmark files contain no ${label}${violatingFiles.length ? ` (${[...new Set(violatingFiles)].join(', ')})` : ''}`
  );
}

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
  check(metaContent('og:url') === expectedCanonical, `${route} has the correct Open Graph URL`);
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
