import type { APIRoute } from 'astro';
import { wix } from '../../lib/wix';
import { viewId } from '../../lib/views';

// View counter. Wix's own blog metrics don't track headless page views (and the
// migrated posts came in at 0), so we keep our own tally in the `PostViews`
// collection ({ _id: slug, views }). The client beacons this once per session;
// the increment runs server-side per call (POSTs aren't edge-cached).
export const prerender = false;

const C = 'PostViews';
const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export const POST: APIRoute = async ({ request }) => {
  let slug = '';
  try { slug = String((await request.json())?.slug || '').slice(0, 400); } catch {}
  if (!slug) return json({ error: 'missing slug' }, 400);
  const id = viewId(slug);

  try {
    let current: any = null;
    try { current = await wix.items.get(C, id); } catch {}
    const prev = Number(current?.views) || 0;
    const views = prev + 1;
    if (current) await wix.items.update(C, { _id: id, views });
    else await wix.items.insert(C, { _id: id, views });
    return json({ views });
  } catch (e) {
    console.error('[view] increment failed:', (e as any)?.message);
    return json({ error: 'write failed' }, 500);
  }
};
