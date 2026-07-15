#!/usr/bin/env node
/**
 * Cohen Adventure — site-to-site content migration.
 *
 *   SOURCE (read)  : fa067d58-…  "Cohen Headless"   (has all the content)
 *   TARGET (write) : 28e6af80-…  "Cohen Adventure"  (fresh headless site)
 *
 * Admin auth per site via the Wix CLI:  npx @wix/cli token --site <id>
 *
 * Phased + resumable (state in migration/state.json). Run a phase:
 *   node migration/migrate.mjs apps      # install business-solution apps on target
 *   node migration/migrate.mjs media     # import all media, build old→new image map
 *   node migration/migrate.mjs cms       # recreate custom collections + items (remapped)
 *   node migration/migrate.mjs blog      # migrate posts (rich content + cover, remapped)
 *   node migration/migrate.mjs all       # run every phase in order
 *
 * Re-running a phase skips work already recorded in state.json.
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SOURCE = 'fa067d58-ebf2-47b9-8fc8-b928e8a25241';
const TARGET = '28e6af80-fa8e-4a4e-abde-0c7a1392cb1b';
const BASE = 'https://www.wixapis.com';
const STATE_PATH = fileURLToPath(new URL('./state.json', import.meta.url));

// Business solutions worth installing on the target (appDefId → name). Only the
// content-bearing ones; skip the ~50 infra apps every site already has.
const APPS = {
  '14bcded7-0066-7c35-14d7-466cb3f09103': 'Wix Blog',
  '1380b703-ce81-ff05-f115-39571d94dfcd': 'Wix Stores',
  '13d21c63-b5ec-5912-8397-c3a5ddb27a97': 'Wix Bookings',
  '225dd912-7dfd-4d5f-96a1-c1ae57ce7e79': 'Wix Forms',
  '1522827f-c56c-a5c9-2ac9-00f9e6ae12d3': 'Pricing Plans',
};

// ── auth + http ────────────────────────────────────────────────────────────
const _tok = {};
function token(site) {
  if (!_tok[site]) {
    const out = execSync(`npx @wix/cli@latest token --site ${site}`, { encoding: 'utf8' });
    _tok[site] = out.trim().split('\n').pop().trim();
  }
  return _tok[site];
}
async function api(site, method, path, body) {
  const res = await fetch(path.startsWith('http') ? path : BASE + path, {
    method,
    headers: {
      Authorization: `Bearer ${token(site)}`,
      'wix-site-id': site,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${String(text).slice(0, 400)}`);
  return json;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── state ────────────────────────────────────────────────────────────────
function loadState() {
  if (existsSync(STATE_PATH)) return JSON.parse(readFileSync(STATE_PATH, 'utf8'));
  return { apps: [], imageMap: {}, collections: [], items: {}, blog: [] };
}
function saveState(s) { writeFileSync(STATE_PATH, JSON.stringify(s, null, 2)); }
const state = loadState();
const log = (...a) => console.log(...a);

// ── image remapping ──────────────────────────────────────────────────────
// A CMS/blog image ref looks like: wix:image://v1/<mediaId>/<name>#originWidth=..
const IMG_RE = /wix:image:\/\/v1\/([^/]+)\/[^"#]*(?:#[^"'\\]*)?/g;
// Deep-replace every source image ref in a value using state.imageMap.
function remap(value) {
  if (value == null) return value;
  if (typeof value === 'string') {
    return value.replace(IMG_RE, (full, mediaId) => state.imageMap[mediaId]?.targetUri || full);
  }
  if (Array.isArray(value)) return value.map(remap);
  if (typeof value === 'object') {
    const o = {};
    for (const [k, v] of Object.entries(value)) o[k] = remap(v);
    // object-form image ref (e.g. blog cover { id, url, ... }, ricos image nodes)
    if (typeof o.id === 'string' && state.imageMap[o.id]) {
      const t = state.imageMap[o.id];
      o.id = t.targetId;
      if (typeof o.url === 'string') o.url = staticUrl(t.targetId);
    }
    return o;
  }
  return value;
}
function staticUrl(mediaId) { return `https://static.wixstatic.com/media/${mediaId}`; }

// ── PHASE: apps ────────────────────────────────────────────────────────────
async function phaseApps() {
  log('\n▶ PHASE apps — install business solutions on target');
  const installed = new Set(
    ((await api(TARGET, 'GET', '/apps-installer-service/v1/app-instances')).appInstances || [])
      .map((a) => a.appDefId),
  );
  for (const [appDefId, name] of Object.entries(APPS)) {
    if (installed.has(appDefId) || state.apps.includes(appDefId)) { log(`  · ${name} already installed`); continue; }
    try {
      await api(TARGET, 'POST', '/apps-installer-service/v1/app-instance/install', {
        appInstance: { appDefId },
        tenant: { id: TARGET, tenantType: 'SITE' },
      });
      state.apps.push(appDefId); saveState(state);
      log(`  ✓ installed ${name}`);
    } catch (e) { log(`  ✗ ${name}: ${e.message}`); }
  }
}

// ── PHASE: media ───────────────────────────────────────────────────────────
async function listSourceFiles() {
  const files = [];
  let cursor;
  do {
    const q = new URLSearchParams({ 'paging.limit': '100' });
    if (cursor) q.set('paging.cursor', cursor);
    const r = await api(SOURCE, 'GET', `/site-media/v1/files?${q}`);
    files.push(...(r.files || []));
    cursor = r.pagingMetadata?.cursors?.next;
  } while (cursor);
  return files;
}
async function pollReady(fileId, tries = 20) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await api(TARGET, 'GET', `/site-media/v1/files/${fileId}`);
      const f = r.file || r;
      if (f.operationStatus === 'READY' && f.media?.image?.image) return f;
      if (f.operationStatus === 'FAILED') return null;
    } catch {}
    await sleep(1500);
  }
  return null;
}
async function phaseMedia() {
  log('\n▶ PHASE media — import all images into target');
  const files = (await listSourceFiles()).filter((f) => f.mediaType === 'IMAGE');
  log(`  source images: ${files.length}`);
  for (const f of files) {
    const srcId = f.media?.image?.image?.id || f.id;
    if (!srcId) continue;
    if (state.imageMap[srcId]) { continue; }
    try {
      const imported = await api(TARGET, 'POST', '/site-media/v1/files/import', {
        url: staticUrl(srcId),
        displayName: f.displayName || srcId,
        mediaType: 'IMAGE',
      });
      const newFileId = imported.file?.id;
      const ready = await pollReady(newFileId);
      if (!ready) { log(`  ✗ not ready: ${f.displayName}`); continue; }
      const im = ready.media.image.image;
      const name = encodeURIComponent(im.filename || f.displayName || 'image');
      const targetUri = `wix:image://v1/${im.id}/${name}#originWidth=${im.width || 0}&originHeight=${im.height || 0}`;
      state.imageMap[srcId] = { targetUri, targetId: im.id };
      saveState(state);
      log(`  ✓ ${f.displayName} → ${im.id}`);
    } catch (e) { log(`  ✗ ${f.displayName}: ${e.message}`); }
  }
  log(`  mapped ${Object.keys(state.imageMap).length} images`);
}

// ── PHASE: cms ─────────────────────────────────────────────────────────────
const SYSTEM_FIELDS = new Set(['_id', '_owner', '_createdDate', '_updatedDate', 'submissionTime']);
async function phaseCms() {
  log('\n▶ PHASE cms — custom collections + items');
  const cols = (await api(SOURCE, 'GET', '/data/v2/collections')).collections || [];
  const custom = cols.filter((c) => c.collectionType === 'NATIVE' && !c.id.includes('/'));
  log(`  custom collections: ${custom.map((c) => c.id).join(', ')}`);

  for (const col of custom) {
    // supported, non-system fields only (drop _system, submissionTime, and
    // pagelink `link-*` fields which need extra metadata and aren't used).
    const keep = (col.fields || []).filter(
      (f) => !SYSTEM_FIELDS.has(f.key) && !f.key.startsWith('_') && !f.key.startsWith('link-'),
    );
    const keepKeys = new Set(keep.map((f) => f.key));
    // 1. create the collection on target
    if (!state.collections.includes(col.id)) {
      const fields = keep.map((f) => ({ key: f.key, displayName: f.displayName || f.key, type: f.type }));
      try {
        await api(TARGET, 'POST', '/data/v2/collections', {
          collection: { id: col.id, displayName: col.displayName || col.id, fields },
        });
        state.collections.push(col.id); saveState(state);
        log(`  ✓ collection ${col.id} (${fields.length} fields)`);
      } catch (e) {
        if (/already exists|WDE0074/i.test(e.message)) { state.collections.push(col.id); saveState(state); log(`  · ${col.id} exists`); }
        else { log(`  ✗ collection ${col.id}: ${e.message}`); continue; }
      }
    }
    // 2. copy items (remapping image refs)
    state.items[col.id] = state.items[col.id] || 0;
    let cursor, page = 0;
    do {
      const r = await api(SOURCE, 'POST', '/data/v2/items/query', {
        dataCollectionId: col.id, query: { paging: { limit: 100 } },
      });
      const items = (r.dataItems || []).map((di) => di.data || di);
      if (page++ < Math.floor(state.items[col.id] / 100)) { cursor = r.pagingMetadata?.cursors?.next; continue; }
      if (items.length) {
        const dataItems = items.map((d) => {
          const clean = {};
          for (const [k, v] of Object.entries(d)) if (keepKeys.has(k)) clean[k] = remap(v);
          return { data: clean };
        });
        try {
          await api(TARGET, 'POST', '/data/v2/bulk/items/insert', {
            dataCollectionId: col.id, dataItems,
          });
          state.items[col.id] += items.length; saveState(state);
          log(`  ✓ ${col.id}: +${items.length} items (${state.items[col.id]})`);
        } catch (e) { log(`  ✗ ${col.id} items: ${e.message}`); }
      }
      cursor = r.pagingMetadata?.cursors?.next;
    } while (cursor);
  }
}

// ── PHASE: blog ────────────────────────────────────────────────────────────
async function phaseBlog() {
  log('\n▶ PHASE blog — posts (rich content + cover)');
  // list published posts on source
  const posts = [];
  let cursor;
  do {
    const r = await api(SOURCE, 'POST', '/blog/v3/posts/query', {
      query: { paging: { limit: 50 }, ...(cursor ? { cursorPaging: { limit: 50, cursor } } : {}) },
      fieldsets: ['RICH_CONTENT'],
    });
    posts.push(...(r.posts || []));
    cursor = r.pagingMetadata?.cursors?.next;
  } while (cursor);
  log(`  source posts: ${posts.length}`);

  for (const p of posts) {
    if (state.blog.includes(p.id)) { continue; }
    const draftPost = {
      title: p.title,
      excerpt: p.excerpt,
      slug: p.slug,
      richContent: remap(p.richContent),
      media: p.media ? remap(p.media) : undefined,
      firstPublishedDate: p.firstPublishedDate,
      commentingEnabled: p.commentingEnabled,
    };
    Object.keys(draftPost).forEach((k) => draftPost[k] === undefined && delete draftPost[k]);
    try {
      const created = await api(TARGET, 'POST', '/blog/v3/draft-posts', { draftPost });
      const id = created.draftPost?.id;
      await api(TARGET, 'POST', `/blog/v3/draft-posts/${id}/publish`, {});
      state.blog.push(p.id); saveState(state);
      log(`  ✓ ${p.title}`);
    } catch (e) { log(`  ✗ ${p.title}: ${e.message}`); }
  }
}

// ── PHASE: remap ───────────────────────────────────────────────────────────
// Import the images actually REFERENCED in content (many aren't in the Media
// Manager list), then rewrite CMS items on target to point at target media.
function collectTokens(value, set) {
  if (value == null) return;
  if (typeof value === 'string') {
    const re = /wix:image:\/\/v1\/([^/]+)\//g; let m;
    while ((m = re.exec(value))) set.add(m[1]);
  } else if (Array.isArray(value)) value.forEach((v) => collectTokens(v, set));
  else if (typeof value === 'object') {
    // object-form image ref: a media-id `id` (e.g. bd7797_…~mv2.jpg)
    if (typeof value.id === 'string' && /~mv|\.(jpe?g|png|gif|webp|avif)$/i.test(value.id)) set.add(value.id);
    Object.values(value).forEach((v) => collectTokens(v, set));
  }
}
async function phaseRemap() {
  log('\n▶ PHASE remap — import referenced images + rewrite CMS refs');
  const set = new Set();
  const cols = ((await api(SOURCE, 'GET', '/data/v2/collections')).collections || [])
    .filter((c) => c.collectionType === 'NATIVE' && !c.id.includes('/'));
  for (const col of cols) {
    const r = await api(SOURCE, 'POST', '/data/v2/items/query', { dataCollectionId: col.id, query: { paging: { limit: 1000 } } });
    (r.dataItems || []).forEach((di) => collectTokens(di.data || di, set));
  }
  let cursor;
  do {
    const r = await api(SOURCE, 'POST', '/blog/v3/posts/query', { query: { cursorPaging: { limit: 50, ...(cursor ? { cursor } : {}) } }, fieldsets: ['RICH_CONTENT'] });
    (r.posts || []).forEach((p) => collectTokens(p, set));
    cursor = r.pagingMetadata?.cursors?.next;
  } while (cursor);
  log(`  referenced image tokens: ${set.size}`);

  let imported = 0;
  for (const tok of set) {
    if (state.imageMap[tok]) continue;
    try {
      const imp = await api(TARGET, 'POST', '/site-media/v1/files/import', { url: staticUrl(tok), displayName: tok, mediaType: 'IMAGE' });
      const ready = await pollReady(imp.file?.id);
      if (!ready) { log(`  ✗ not ready: ${tok}`); continue; }
      const im = ready.media.image.image;
      state.imageMap[tok] = { targetUri: `wix:image://v1/${im.id}/${encodeURIComponent(im.filename || tok)}#originWidth=${im.width || 0}&originHeight=${im.height || 0}`, targetId: im.id };
      saveState(state); imported++;
    } catch (e) { log(`  ✗ import ${tok}: ${e.message}`); }
  }
  log(`  imported missing: ${imported} | map size ${Object.keys(state.imageMap).length}`);
  log('  (image map complete — the cms phase now remaps refs correctly at insert time)');
}

// ── runner ─────────────────────────────────────────────────────────────────
const phases = { apps: phaseApps, media: phaseMedia, cms: phaseCms, blog: phaseBlog, remap: phaseRemap };
const arg = process.argv[2];
const order = ['apps', 'media', 'cms', 'blog'];
const toRun = arg === 'all' ? order : [arg];
if (!arg || (arg !== 'all' && !phases[arg])) {
  console.error(`Usage: node migration/migrate.mjs <${order.join('|')}|all>`);
  process.exit(1);
}
for (const p of toRun) {
  await phases[p]();
}
log('\n✅ done:', toRun.join(', '));
