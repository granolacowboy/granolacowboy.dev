import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import {
  ARTIFACT_NAME,
  ARTIFACT_REPO_URL,
  GITHUB_URL,
  HANDLE,
  HUGGINGFACE_URL,
  PERSON_NAME,
  SITE_DESCRIPTION,
  SITE_URL,
} from '../site.config';

// Curated llms.txt index for answer engines. Links ONLY pages that resolve to
// indexable content: draft case studies at /work/* are excluded (they 404 and
// are absent from the sitemap). Family links are plain URLs with NO UTM params
// (entity-canon.json familyLinkList). Descriptions are sourced from post
// frontmatter and the canon, never paraphrased.

export const GET: APIRoute = async () => {
  const posts = (await getCollection('posts', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  const writing = posts
    .map(
      (post) =>
        `- [${post.data.title}](${SITE_URL}/writing/${post.id}/): ${post.data.description}`
    )
    .join('\n');

  const body = `# ${PERSON_NAME} (${HANDLE})
> ${SITE_DESCRIPTION}

## About
- [About](${SITE_URL}/about/): Rich Berman and the systems he builds for law firms through MHSB Solutions.

## Writing
${writing}

## Projects
- [Projects](${SITE_URL}/projects/): Open-source and research work.
- [${ARTIFACT_NAME}](${ARTIFACT_REPO_URL}): Open-source, fully deterministic legal intake triage server built on the Model Context Protocol.
- [Deterministic legal intake safety proof](${SITE_URL}/projects/intake-safety/): End-to-end demonstration of conflicts provenance, a hard write gate, adversarial inputs, trace-aware evaluation, and release evidence around the intake MCP.
- [Session Benchmark v0](${SITE_URL}/projects/session-benchmark/): A public, client-scrubbed benchmark that tests whether an agent preserves constraints, privacy boundaries, evidence, and next steps across messy, long-running context.

## Profiles
- [GitHub](${GITHUB_URL})
- [Hugging Face](${HUGGINGFACE_URL})

## Family
- [MHSB Solutions](https://www.mhsbsolutions.com/): Applied AI and forward-deployed engineering for the legal profession. Security-first.
- [EfficientEsq](https://efficient.esq): The operations layer for the modern firm.
- [LexLab Systems](https://lexlabsystems.com)
- [legalai.help](https://legalai.help): AI and legal technology glossary.
- [legalaicompliance.help](https://legalaicompliance.help): 50-state AI rules and guidance tracker for lawyers.
- [LLM Security for Law Firms](https://mhsbai.github.io/llm-security-for-law-firms/)

## Full text
- [llms-full.txt](${SITE_URL}/llms-full.txt)
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
