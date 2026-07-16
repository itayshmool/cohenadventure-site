import { defineMiddleware } from 'astro:middleware';

/**
 * Edge-cache the SSR HTML. Without this every visitor pays the full server cost
 * (SSR render + Wix blog/CMS API calls) on a cold `x-cache: MISS`, which was the
 * dominant driver of mobile FCP/LCP.
 *
 * Content here (trips, reviews, videos, blog) is near-static, so we let the CDN
 * serve a cached copy for 10 minutes and serve stale for up to a day while it
 * revalidates in the background — TTFB drops to a cache HIT for real users, and
 * fresh content still appears within ~10 min. Language variants cache separately
 * because `?lang=` is part of the URL/cache key.
 */
export const onRequest = defineMiddleware(async (context, next) => {
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
