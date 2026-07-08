/**
 * Central site configuration.
 */

export const SITE_URL = 'https://granolacowboy.dev';
export const PERSON_NAME = 'Rich Berman';
export const HANDLE = 'granolacowboy';
export const SITE_TITLE = `${PERSON_NAME} | ${HANDLE}`;

/** Default meta description; pages override via BaseLayout's `description` prop. */
export const SITE_DESCRIPTION =
  'Portfolio of Rich Berman, focused on forward-deployed engineering and applied AI.';

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
export const RESUME_URL = '/resume.pdf';

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
