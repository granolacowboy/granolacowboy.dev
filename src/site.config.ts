/**
 * Central site configuration.
 */

export const SITE_URL = 'https://granolacowboy.dev';
export const PERSON_NAME = 'Rich Berman';
export const HANDLE = 'granolacowboy';
export const SITE_TITLE = `${PERSON_NAME} | ${HANDLE}`;

/** Default meta description; pages override via BaseLayout's `description` prop. */
export const SITE_DESCRIPTION =
  'Rich Berman builds legal-technology systems, automation, and applied AI for law firms through MHSB Solutions.';

/**
 * Blog posts render WITHOUT visible dates (PLAN Open Item #3, resolved 2026-06-10).
 * `pubDate` stays in the schema for sitemap/ordering only.
 * Any date rendered anywhere in the UI must key off this const.
 */
export const SHOW_DATES: boolean = false;

/** Public contact and profile links. */
export const EMAIL = 'info@mhsbsolutions.com';
export const EMAIL_URL = `mailto:${EMAIL}`;
export const LINKEDIN_URL = 'https://linkedin.com/in/mhsb';
export const GITHUB_URL = 'https://github.com/granolacowboy';
export const HUGGINGFACE_URL = 'https://huggingface.co/granolacowboy';
export const RESUME_URL = '/resume.pdf';

/**
 * Canonical portfolio identity, defined authoritatively on mhsbsolutions.com and
 * referenced here by @id. PERSON_CANONICAL_NAME is the single flippable constant
 * for the JSON-LD Person name (PERSON_ALT_NAME holds the other published form).
 * PROFILE_SAME_AS lists only verified profiles (HTTP 200, confirmed MHSB / Rich
 * Berman); LinkedIn is intentionally omitted pending a verifiable check (see the
 * P6 PR notes).
 */
export const CANONICAL_ORG_ID = 'https://www.mhsbsolutions.com/#organization';
export const CANONICAL_PERSON_ID = 'https://www.mhsbsolutions.com/#person';
// Aligned to entity-canon.json richBerman.nameRule: name 'Rich Berman',
// alternateName 'Richard Berman' (these were previously inverted here, matching
// the apex's own inversion; canon flips both).
export const PERSON_CANONICAL_NAME = 'Rich Berman';
export const PERSON_ALT_NAME = 'Richard Berman';
export const PROFILE_SAME_AS = [GITHUB_URL, HUGGINGFACE_URL];

/**
 * Field Notes: short BLUF observations distilled from real engagement work
 * (the operator signal from the retired post-1/post-3 essays). Single source of
 * truth so the homepage and the answer-engine surfaces never drift. Every line
 * is an owned claim with no fabricated metrics.
 */
export const FIELD_NOTES = [
  'Regulated buyers do not adopt on a demo. Lead with where data lives, who can reach it, and what breaks when something fails. Then a proof of concept. Then the pitch.',
  'Most firms use a fraction of the tools they already own. The problem is rarely "we need a chatbot." It is where they lose time and money day to day.',
  'Trust is earned before it is sold. A firm that does not yet know you moves slower, and that is a reasonable response to handing over their systems and data.',
];

/** The Phase 5 open-source artifact (repo is created in Phase 5). */
export const ARTIFACT_NAME = 'intake-triage-mcp';
export const ARTIFACT_REPO_URL = 'https://github.com/granolacowboy/intake-triage-mcp';

/**
 * Site-relative path to the artifact's companion write-up post (Phase 4
 * post (b), "Anatomy of a legal intake automation"), e.g. '/writing/<post-id>/'.
 * Leave '' until the post ships; write-up link slots render a placeholder
 * instead of a link while this is empty.
 */
export const ARTIFACT_WRITEUP_PATH: string = '/writing/post-2-intake-anatomy/';
