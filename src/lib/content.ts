import { wix, imageUrl } from './wix';
import { PAL_KEYS, PAL } from './i18n';

const row = (it: any) => it?.data ?? it ?? {};
const pal = (i: number) => PAL[PAL_KEYS[i % PAL_KEYS.length]];

async function queryAll(collectionId: string, limit = 100): Promise<any[]> {
  try {
    const res = await wix.items.query(collectionId).limit(limit).find();
    return res.items ?? [];
  } catch (e) {
    console.error(`[content] query ${collectionId} failed:`, (e as any)?.message);
    return [];
  }
}

/**
 * High-resolution landscape photos for the hero slideshow.
 * Only images whose ORIGINAL width ≥ minWidth and are landscape (no soft
 * upscaling). Pulls the sharpest from each source collection and interleaves
 * them for variety. `travels` is skipped — its images are only ~1200px.
 */
export async function getHeroImages(limit = 6, minWidth = 1600): Promise<string[]> {
  const dims = (s: string) => {
    const m = String(s || '').match(/originWidth=(\d+)&originHeight=(\d+)/);
    return m ? { w: +m[1], h: +m[2] } : { w: 0, h: 0 };
  };
  const perCol: string[][] = [];
  for (const col of ['morocco', 'testride_g1', 'videos']) {
    const list = (await queryAll(col, 100))
      .map((it) => ({ raw: row(it).image as string, ...dims(row(it).image) }))
      .filter((x) => x.raw && x.w >= minWidth && x.h && x.w / x.h >= 1.2)
      .sort((a, b) => b.w - a.w)
      .map((x) => imageUrl(x.raw, 1920, 1080))
      .filter((u): u is string => !!u);
    perCol.push(list);
  }
  const out: string[] = [];
  const seen = new Set<string>();
  for (let i = 0; out.length < limit; i++) {
    let added = false;
    for (const arr of perCol) {
      if (arr[i] && !seen.has(arr[i])) { seen.add(arr[i]); out.push(arr[i]); added = true; if (out.length >= limit) break; }
    }
    if (!added) break;
  }
  return out;
}

export type Trip = {
  id: string; num: string; title: string; desc: string;
  img: string | null; h1: string; h2: string; url?: string;
};

export async function getTrips(): Promise<Trip[]> {
  const items = await queryAll('travels');
  return items.map((it, i) => {
    const d = row(it);
    const [h1, h2] = pal(i + 7);
    return {
      id: d._id,
      num: String(i + 1).padStart(2, '0'),
      title: d.title ?? '',
      desc: d.description ?? '',
      img: imageUrl(d.image, 900, 560),
      url: d.url,
      h1, h2,
    };
  });
}

export type Review = {
  id: string; title: string; desc: string; img: string | null;
  url?: string; h1: string; h2: string;
};

export async function getReviews(limit = 12): Promise<Review[]> {
  const items = await queryAll('testride_g1', limit);
  return items.map((it, i) => {
    const d = row(it);
    const [h1, h2] = pal(i);
    return {
      id: d._id, title: d.title ?? '', desc: d.description ?? '',
      img: imageUrl(d.image, 640, 420), url: d.url, h1, h2,
    };
  });
}

export type Video = {
  id: string; title: string; desc: string; cat: string;
  youtube: string; embed: string; thumb: string | null; h1: string; h2: string;
};

function youtubeId(link: string | undefined): string | null {
  if (!link) return null;
  const m = link.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : null;
}

export async function getVideos(limit = 12): Promise<Video[]> {
  const items = await queryAll('videos', limit);
  return items
    .map((it, i) => {
      const d = row(it);
      const yid = youtubeId(d.link);
      const [h1, h2] = pal(i + 3);
      return {
        id: d._id,
        title: d.title ?? '',
        desc: d.shortDesc ?? '',
        cat: Array.isArray(d.type) ? d.type[0] : (d.type ?? ''),
        youtube: d.link ?? '',
        embed: yid ? `https://www.youtube.com/embed/${yid}?rel=0&autoplay=1` : '',
        thumb: yid ? `https://i.ytimg.com/vi/${yid}/hqdefault.jpg` : imageUrl(d.image, 640, 400),
        h1, h2,
      };
    })
    .filter((v) => v.embed);
}

export type Day = { num: string; title: string; desc: string; img: string | null; h1: string; h2: string };

export async function getItinerary(): Promise<Day[]> {
  const items = await queryAll('morocco');
  const withDay = items
    .map((it) => row(it))
    .sort((a, b) => (a.day ?? 0) - (b.day ?? 0));
  return withDay.map((d, i) => {
    const [h1, h2] = pal(i);
    return {
      num: String(d.day ?? i + 1).padStart(2, '0'),
      title: d.title ?? '',
      desc: d.description ?? '',
      img: imageUrl(d.image, 480, 320),
      h1, h2,
    };
  });
}

export type Post = {
  id: string; title: string; slug: string; excerpt: string;
  cover: string | null; date: string; minutes: number;
};

export async function getPosts(limit = 8): Promise<Post[]> {
  try {
    const res = await wix.posts.queryPosts().limit(limit).find();
    return (res.items ?? []).map((p: any) => ({
      id: p._id,
      title: p.title ?? '',
      slug: p.slug ?? '',
      excerpt: p.excerpt ?? '',
      cover: imageUrl(p.media?.wixMedia?.image ?? p.coverMedia?.image, 640, 420),
      date: p.firstPublishedDate ?? p.lastPublishedDate ?? '',
      minutes: p.minutesToRead ?? 0,
    }));
  } catch (e) {
    console.error('[content] blog query failed:', (e as any)?.message);
    return [];
  }
}
