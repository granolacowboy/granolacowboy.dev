/**
 * Central site configuration.
 */

/** Working wordmark until real branding copy lands in Phase 4. */
export const SITE_TITLE = 'Granola Cowboy';

/** Default meta description; pages override via BaseLayout's `description` prop. */
export const SITE_DESCRIPTION =
  'Notes on legal technology, automation, and building things for law firms. By the founder of MHSB.';

/**
 * Blog posts render WITHOUT visible dates (PLAN Open Item #3, resolved 2026-06-10).
 * `pubDate` stays in the schema for sitemap/ordering only.
 * Any date rendered anywhere in the UI must key off this const.
 */
export const SHOW_DATES: boolean = false;

/** Known profile links. */
export const GITHUB_URL = 'https://github.com/granolacowboy';

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
