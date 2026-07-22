/**
 * The canonical production origin — single source of truth for canonical URLs,
 * Open Graph URLs, JSON-LD, and the sitemap.
 *
 * Matches the legacy site exactly: apex `cohenadventure.com` 301s to `www`, and
 * the canonical host is `https://www.cohenadventure.com`. Setting this to the
 * production domain (rather than the temporary *.wix-site-host.com preview) means
 * canonicals are already correct the moment DNS is cut over — no code change at
 * launch — and it tells search engines to consolidate on the real domain, not the
 * preview host.
 */
export const SITE = 'https://www.cohenadventure.com';
