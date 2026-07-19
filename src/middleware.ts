import { defineMiddleware } from 'astro:middleware';

/**
 * Legacy → headless URL map for the domain migration. The old Wix site
 * (cohenadventure.com) is indexed under these paths; the new headless site uses
 * different ones. We answer with **301 (permanent)** so search engines transfer
 * ranking/link-equity to the new URL instead of hitting a 404 and dropping the
 * page from the index. The 29 blog slugs are identical across the migration, so
 * `/post/<slug>` → `/journal/<slug>` is a single prefix rule.
 */
const EXACT_REDIRECTS: Record<string, string> = {
  '/blog': '/journal',
  '/training': '/#training',
  '/videos': '/#videos',
  '/travel': '/#roadbook',
  '/testride': '/#reviews',
  '/contact': '/#contact',
  '/booking': '/#contact',
  '/book-online': '/#contact',
  '/members': '/',
};

/**
 * Edge-cache the SSR HTML. Without this every visitor pays the full server cost
 * (SSR render + Wix blog/CMS API calls) on a cold `x-cache: MISS`, which was the
 * dominant driver of mobile FCP/LCP. Content here is near-static, so the CDN
 * serves a cached copy for 10 min and stale for up to a day while revalidating —
 * TTFB drops to a cache HIT. Language variants cache separately (`?lang=` is in
 * the URL/cache key).
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const path = pathname !== '/' && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

  // Legacy blog posts: /post/<slug> → /journal/<slug> (same slug).
  if (path.startsWith('/post/')) {
    return context.redirect('/journal/' + path.slice('/post/'.length), 301);
  }
  const legacyTarget = EXACT_REDIRECTS[path];
  if (legacyTarget) return context.redirect(legacyTarget, 301);

  const response = await next();
  const isGet = context.request.method === 'GET';
  const isHtml = (response.headers.get('content-type') || '').includes('text/html');
  if (isGet && isHtml && response.status === 200) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=0, s-maxage=600, stale-while-revalidate=86400',
    );
  }
  return response;
});
