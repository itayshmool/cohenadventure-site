import type { APIRoute } from 'astro';
import { getPosts } from '../lib/content';
import { SITE } from '../lib/site';

// SSR so the post list stays current. The Wix-generated /sitemap.xml only lists
// `/` and `/journal` — it misses every individual /journal/<slug> post. This
// advertises all real URLs so search engines can discover the migrated posts.
export const prerender = false;

export const GET: APIRoute = async () => {
  const posts = await getPosts(100);
  const day = (iso?: string) => {
    if (!iso) return undefined;
    try { return new Date(iso).toISOString().slice(0, 10); } catch { return undefined; }
  };

  const urls = [
    { loc: `${SITE}/`, priority: '1.0' },
    { loc: `${SITE}/journal`, priority: '0.8' },
    ...posts.map((p) => ({
      loc: `${SITE}/journal/${encodeURIComponent(p.slug)}`,
      lastmod: day(p.date),
      priority: '0.7',
    })),
  ];

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map(
        (u) =>
          `  <url><loc>${u.loc}</loc>` +
          (('lastmod' in u && u.lastmod) ? `<lastmod>${u.lastmod}</lastmod>` : '') +
          `<priority>${u.priority}</priority></url>`,
      )
      .join('\n') +
    `\n</urlset>\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
};
