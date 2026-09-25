import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { PERSON_NAME, HANDLE, SITE_DESCRIPTION, SITE_URL } from '../site.config';

// Full-text corpus for answer engines: the clean body of the indexable pages,
// with no nav/footer chrome. About prose and the Session Benchmark overview are
// reproduced from the live page copy; writing posts come straight from the
// content collection body. Data-download links are absolute so the dataset
// distribution is discoverable. Family/contact chrome and unresolved contact
// addresses are intentionally omitted.

const DATA_BASE = `${SITE_URL}/projects/session-benchmark/data`;

const ABOUT = `# About

I build and dissect systems. Most of my professional work is legal technology. The rest of my attention tends to land on automation, security, protocols, agents, observability, old software, and the ugly boundaries where systems stop behaving as advertised.

granolacowboy.dev is a working notebook, not a services site. Projects are here because I wanted to build or test them; client details stay out of it. MHSB Solutions is where the consulting work lives.`;

const INTAKE_SAFETY = `# Deterministic legal intake safety proof

A fictional legal inquiry moves through a model-driven intake flow, but consequential rules live outside the model. The MCP server owns validated schemas, deterministic conflicts matching with provenance, and a hard write gate. An unaddressed conflicts status is refused unless a named human supplies an explicit rationale.

The separate evaluation harness tests the final answer and execution behavior, including required and forbidden tools, consequential call arguments, tool-result assertions, and call or latency budgets.

Public implementation:
- https://github.com/granolacowboy/intake-triage-mcp
- https://github.com/granolacowboy/intake-eval-harness
- ${SITE_URL}/projects/intake-safety/`;

const SESSION_BENCHMARK = `# Session Benchmark v0

A benchmark shell built from aggregate patterns across 1,299 agent sessions. It tests whether an agent can keep evidence, constraints, privacy boundaries, and useful next actions intact when the source context is messy.

The project began as a synthetic registry-first deployment example. The more useful anchor was the archive itself: a long trail of sessions where recurring work becomes visible in aggregate.

The benchmark asks a narrower question than whether an agent can write a polished answer. It asks whether the agent can preserve constraints while crossing between rough notes, tools, private context, and public artifacts. The current release contains 26 cases, three mocked public-safe candidate profiles, and an eight-case observed-archive pilot used as calibration.

This is not a live leaderboard. The fixture proves the scoring harness and public artifact shape before any provider-backed candidate run is claimed.

Data and eval downloads:
- ${DATA_BASE}/session_benchmark_summary.json
- ${DATA_BASE}/session_deep_dive_summary.json
- ${DATA_BASE}/session_benchmark_cases.yml
- ${DATA_BASE}/candidate_answer_sets.json
- ${DATA_BASE}/session_candidate_results.json
- ${DATA_BASE}/session_pilot_results.json
- ${DATA_BASE}/failure_mode_atlas.json
- ${DATA_BASE}/synthetic_asset_registry.csv`;

export const GET: APIRoute = async () => {
  const posts = (await getCollection('posts', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  const writing = posts
    .map((post) => `## ${post.data.title}\n\n${(post.body ?? '').trim()}`)
    .join('\n\n');

  const body = `# ${PERSON_NAME} (${HANDLE}) | ${SITE_URL}

${SITE_DESCRIPTION}

${ABOUT}

# Writing

${writing}

${INTAKE_SAFETY}

${SESSION_BENCHMARK}
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
