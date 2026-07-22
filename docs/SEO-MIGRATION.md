# SEO Migration Spec — Wix Classic → Wix Headless

A reusable specification and runbook for moving a live, ranking **Wix classic**
site onto a **Wix Headless** (Astro/React/etc.) frontend **without losing search
rankings**. It is platform-specific where it matters (Wix serves some SEO surfaces
itself) and general everywhere else.

The concrete implementation for this repo (Cohen Adventure) is the *Worked
example* at the end; the body is the methodology.

---

## 0. TL;DR

Keeping the same domain preserves **domain-level** authority automatically. What
breaks a migration is **URL structure change**: the classic site's indexed URLs
404 on the headless site, and a 404 tells Google the page is gone. The job is to
bridge every old URL to its new equivalent with **301 redirects**, point all
canonical/OG/sitemap signals at the final domain, and make the new URLs
discoverable via a sitemap — then cut DNS over and monitor.

| Signal | Preserved by | At risk without action |
| :-- | :-- | :-- |
| Domain authority, age, backlinks to root | Keeping the same domain | — |
| Per-page rankings / deep-link equity | **301 redirects** old→new | Pages 404 → dropped from index |
| Correct indexed domain | **Canonical = final domain** | Preview host indexed as duplicate |
| Discovery of new URLs | **Sitemap** listing real routes | New pages crawled slowly / missed |
| Language targeting | `hreflang` + per-language canonicals | Wrong-language page ranks |

---

## 1. Scope & goals

**In scope:** URL continuity, canonical/OG/structured-data host, sitemap, redirect
map, cutover sequence, verification, monitoring, rollback.

**Out of scope:** content quality/keywords, on-page copy, link building, Core Web
Vitals (tracked separately — see performance work).

**Success = no sustained organic traffic loss.** A 2–6 week wobble while the
engine reprocesses moves is expected and acceptable; a permanent drop is a
migration defect.

---

## 2. Why Wix-classic → headless is a high-risk move

Two properties of the platform make this different from a normal domain move:

1. **URL structure almost always changes.** Wix classic uses fixed patterns
   (`/post/<slug>`, dynamic-page collections, `/blog`, section pages). A headless
   app defines its own routes (`/journal/<slug>`, SPA sections, etc.). Unless the
   headless routes are deliberately made identical, every legacy URL 404s.
2. **The Wix platform still serves some SEO surfaces** even for a headless site —
   notably `robots.txt` and `/sitemap.xml`, which are generated from the *Wix*
   site model, not your app's routes. You cannot fully override them from the app.
   Plan around this (see §6).

Also note: a Lighthouse/PageSpeed **SEO score of 100 is on-page technical hygiene**
(titles, meta, crawlable links). It says nothing about whether a migration will
preserve rankings. Don't conflate the two.

---

## 3. Discovery / audit (do this first)

Enumerate every URL the classic site exposes and Google may have indexed.

- **Sitemaps** — fetch the classic sitemap index and every child:
  - `/(sitemap.xml)` → child sitemaps, commonly:
    - `pages-sitemap.xml` (static pages)
    - `blog-posts-sitemap.xml`, `blog-categories-sitemap.xml`
    - `dynamic-<collection>_p_<id>_<range>-sitemap.xml` (dynamic pages)
- **Google Search Console** — export *Pages* (indexed) and top pages by
  clicks/impressions. These are the URLs whose equity you must not lose.
- **Backlinks** — from GSC *Links* (or Ahrefs/Semrush): which specific URLs have
  external links. Prioritize redirecting these precisely.
- **Classic URL patterns to expect:**
  | Content | Classic pattern |
  | :-- | :-- |
  | Blog post | `/post/<slug>` |
  | Blog home | `/blog` |
  | Dynamic collection item | `/<collection>/<slug>` (varies) |
  | Static/section pages | `/training`, `/videos`, `/contact`, … |
  | Members / store / bookings | `/members`, `/product-page/…`, `/booking` |

**Output of this phase:** a spreadsheet of `old_url → intended_new_url` for every
indexed/backlinked URL, sorted by traffic.

---

## 4. URL mapping strategy

Rank the mapping quality per URL; prefer the highest available:

1. **1:1 same-content redirect (best).** New page = same content. If slugs are
   preserved during content migration, this is a single prefix rule
   (`/post/<slug>` → `/journal/<slug>`). *Preserving slugs during the content
   migration is the single biggest lever for an easy SEO migration — decide it
   before migrating content.*
2. **Consolidation redirect.** Old page's content now lives in a section of
   another page → redirect to that page (fragment optional; the server sees only
   the path, and Google consolidates to the path).
3. **Nearest-relevant redirect.** No direct equivalent → most topically relevant
   page.
4. **Catch-all → home (last resort).** Anything unmapped 301s to `/` rather than
   404. Better than a dead end, but page-specific is always preferable.

**Never** leave an indexed URL returning 404/soft-404. **Always 301** (permanent),
not 302 — 302 doesn't pass equity and signals "temporary."

Avoid **redirect chains** (A→B→C) and **loops**; redirect straight to the final
URL. Keep the apex/www and http/https canonicalization identical to the classic
site (e.g. apex `301 → www`, http `301 → https`).

---

## 5. Implementation (headless app)

### 5.1 Canonical origin — one source of truth
Hardcode the **final production origin** (not the temporary `*.wix-site-host.com`
preview) in a single module and use it for `<link rel=canonical>`, Open Graph
`og:url`, and JSON-LD `url`. Setting it to the real domain pre-cutover is correct:
it tells engines to consolidate on the brand domain and not index the preview
host, and it means **zero code change on launch day**.

```ts
// src/lib/site.ts
export const SITE = 'https://www.cohenadventure.com'; // match classic apex/www choice
```

Per-page canonical = `SITE + pathname`. For multilingual, canonical points to the
self URL of each language and `hreflang` links cross-reference the others.

### 5.2 301 redirects — in middleware
Redirects belong in the request path so they run before rendering. In Astro, use
`src/middleware.ts`:

```ts
const EXACT: Record<string,string> = {
  '/blog': '/journal',
  '/training': '/#training', /* … section consolidations … */
  '/members': '/',
};
export const onRequest = defineMiddleware(async (ctx, next) => {
  const p = ctx.url.pathname.replace(/(.)\/$/, '$1'); // drop trailing slash
  if (p.startsWith('/post/')) return ctx.redirect('/journal/' + p.slice(6), 301);
  if (EXACT[p]) return ctx.redirect(EXACT[p], 301);
  return next();
});
```

Rules:
- Prefix rule for the bulk (slug-preserved) case; explicit map for the rest.
- Preserve the encoded slug; the target route decodes it.
- Redirects reach the app only for paths the platform doesn't intercept (see §6).

### 5.3 Sitemap — custom path
The Wix-served `/sitemap.xml` lists only what the Wix site model knows (often just
a couple of app routes) and **cannot be overridden** from the app. Generate a
complete sitemap from your real data at a **custom path** the platform doesn't
claim, and submit that URL directly in Search Console.

```ts
// src/pages/sitemap-headless.xml.ts  → /sitemap-headless.xml
export const prerender = false;
export const GET = async () => {
  const posts = await getPosts(100);
  const urls = [`${SITE}/`, `${SITE}/journal`, ...posts.map(p => `${SITE}/journal/${encodeURIComponent(p.slug)}`)];
  /* emit <urlset> XML, Content-Type: application/xml */
};
```

### 5.4 hreflang (multilingual)
If the site serves multiple languages, emit reciprocal `hreflang` link tags (and
an `x-default`) so each language version ranks for its audience and they aren't
treated as duplicates.

### 5.5 Structured data & metadata parity
Carry over titles, meta descriptions, and JSON-LD (`Organization`,
`BlogPosting`/`Article`, `BreadcrumbList`) using the new canonical host. Don't
regress metadata that currently ranks.

---

## 6. Platform constraints (Wix headless)

| Surface | Who serves it | Implication |
| :-- | :-- | :-- |
| `robots.txt` | **Wix platform** (auto-generated) | App's `public/robots.txt` is ignored; edit via Wix SEO Tools if needed. |
| `/sitemap.xml` | **Wix platform** | Can't override; incomplete for headless routes → use a custom-path sitemap (§5.3). |
| `/post/…`, app routes | **Headless app** | 404 by default → redirects in middleware apply. |
| `<head>` (canonical/OG/JSON-LD) | **Headless app** | Full control. |

Verify empirically which paths reach the app vs. the platform (a `curl` for a
made-up path that 404s from the app confirms the app is handling that namespace).

---

## 7. Cutover runbook

1. **Freeze** classic-site content changes; take a final export/backup.
2. **Deploy** the headless app with redirects + canonical + sitemap in place.
3. **Pre-flight on the preview host** (see §8) — all checks green.
4. **Connect the domain** to the headless site in Wix; keep the apex↔www and
   http→https canonicalization identical to before.
5. **Verify on the real domain** that old URLs 301 and new URLs 200.
6. **Submit the sitemap** (`/sitemap-headless.xml`) in Search Console — **only
   after** the domain serves the new site. (Submitting earlier points Google at
   new URLs that still 404 on the classic site.)
7. **Request indexing** for the top few pages via GSC URL Inspection.
8. Keep the classic site's data intact for a rollback window (§10).

---

## 8. Verification checklist (gate before + after cutover)

- [ ] Every audited old URL returns **301** to a **200** target (no 404, no 302,
      no chains/loops). Spot-check the top-traffic and backlinked URLs.
- [ ] `curl -sL` on a redirected URL ends in **HTTP 200**.
- [ ] `<link rel="canonical">` on every template = final domain, self-referential.
- [ ] OG `og:url` and JSON-LD `url` = final domain.
- [ ] `hreflang` reciprocal + `x-default` present (if multilingual).
- [ ] Custom sitemap: **200**, `application/xml`, lists **all** real URLs on the
      final domain; count matches expected page count.
- [ ] apex/www + http/https canonicalization matches the classic site.
- [ ] Metadata/titles/structured data preserved (no regressions vs. classic).
- [ ] Robots not blocking anything that should be indexed.

---

## 9. Post-cutover monitoring (first 6 weeks)

- **GSC Coverage/Pages:** watch for 404 spikes and "Crawled – not indexed."
- **GSC Performance:** track clicks/impressions vs. the pre-cutover baseline;
  a dip then recovery is normal.
- **URL Inspection:** confirm Google sees the 301s and indexes new URLs.
- **Server logs / analytics:** watch for legacy URLs still hitting 404 (add a
  redirect rule for any you missed).
- **Backlinks:** confirm externally-linked pages resolve (via their redirect).

---

## 10. Rollback

Because the classic site's data and pages remain on the same meta-site, rollback
is: **disconnect the domain from the headless app and reconnect it to the classic
site.** Keep the classic content untouched for at least one full crawl cycle
(2–4 weeks). No content is destroyed by this migration — only routing changes.

---

## 11. Acceptance criteria

The migration is **done** when:
1. 100% of audited legacy URLs 301 to a relevant live page (0 unhandled 404s).
2. Canonical/OG/JSON-LD/sitemap all reference the final domain only.
3. The custom sitemap is submitted and GSC shows the new URLs getting indexed.
4. 6 weeks post-cutover, organic clicks are within noise of the pre-migration
   baseline (or higher).

---

## 12. Worked example — Cohen Adventure

Classic `cohenadventure.com` (Wix classic) → headless Astro site. Apex `301 → www`;
canonical host `https://www.cohenadventure.com`.

**Audit findings**
- 29 blog posts at `/post/<hebrew-slug>`; blog home `/blog`.
- Section pages `/training`, `/videos`, `/travel`, `/testride`, `/contact`,
  `/booking`, `/book-online`, `/members`.
- Wix serves `robots.txt` + `/sitemap.xml`; the latter lists only `/` and
  `/journal` for the headless site.

**Mapping** (slugs preserved during content migration → clean 1:1)

| Old | New | Type |
| :-- | :-- | :-- |
| `/post/<slug>` ×29 | `/journal/<slug>` | 1:1 (prefix rule) |
| `/blog` | `/journal` | 1:1 |
| `/training` `/videos` `/travel` `/testride` `/contact` `/booking` `/book-online` | `/#…` sections | consolidation |
| `/members` | `/` | catch-all |

**Implementation** — `src/lib/site.ts` (canonical), `src/middleware.ts` (301s +
edge cache), `src/pages/sitemap-headless.xml.ts` (31-URL sitemap).

**Verified live:** `/post/דרך-הסוכר` → 301 → `/journal/…` → 200; canonical =
`https://www.cohenadventure.com/`; `/sitemap-headless.xml` → 200 with 31 URLs.

**Cutover note:** submit `https://www.cohenadventure.com/sitemap-headless.xml` in
GSC only after DNS points at the headless site.
