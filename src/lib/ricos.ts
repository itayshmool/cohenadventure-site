import { media } from '@wix/sdk';

/**
 * Minimal, defensive Ricos (Wix rich-content) → HTML renderer for the journal.
 * The blog API returns `post.richContent.nodes[]`; each node is a typed block
 * (PARAGRAPH, IMAGE, VIDEO, FILE, …) whose TEXT children carry `decorations`
 * (BOLD, COLOR, LINK, …). Wix's own editor stores captions/subheads as centered
 * or bold PARAGRAPHs, so we don't need special caption handling.
 *
 * Returns an HTML string for `set:html`. Every value that originates from the
 * CMS is HTML-escaped; only our own tags/styles are raw.
 */

const esc = (s: unknown): string =>
  String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const ext = (id: string) => {
  const m = String(id).match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toLowerCase() : 'jpg';
};

/** Scaled, aspect-preserving CDN URL for a content image (no upscaling past origin). */
function imgUrl(id: string, ow?: number, oh?: number): string {
  const W = Math.min(1200, ow || 1200);
  const H = ow && oh ? Math.round((W * oh) / ow) : 0;
  const t = H ? `w_${W},h_${H},al_c,q_85,enc_auto` : `w_${W},q_85,enc_auto`;
  return `https://static.wixstatic.com/media/${id}/v1/fit/${t}/file.${ext(id)}`;
}
const videoUrl = (id: string) => `https://video.wixstatic.com/${id}`;
const posterUrl = (id: string) => `https://static.wixstatic.com/media/${id}`;
function docUrl(id: string, name = 'file'): string {
  try {
    const r: any = media.getDocumentUrl(`wix:document://v1/${id}/${encodeURIComponent(name)}`);
    return typeof r === 'string' ? r : r?.url || '';
  } catch { return ''; }
}
const kb = (b?: number) => (b ? `${Math.round(b / 1024)} KB` : '');

/** Render an array of inline TEXT nodes, applying decorations as nested tags. */
function renderText(nodes: any[]): string {
  return (nodes || [])
    .map((n) => {
      if (n.type === 'TEXT') {
        let html = esc(n.textData?.text).replace(/\n/g, '<br>');
        for (const d of n.textData?.decorations || []) {
          if (d.type === 'BOLD') html = `<strong>${html}</strong>`;
          else if (d.type === 'ITALIC') html = `<em>${html}</em>`;
          else if (d.type === 'UNDERLINE') html = `<u>${html}</u>`;
          else if (d.type === 'COLOR' && d.colorData?.foreground)
            html = `<span style="color:${esc(d.colorData.foreground)}">${html}</span>`;
          else if (d.type === 'LINK' && d.linkData?.link?.url)
            html = `<a href="${esc(d.linkData.link.url)}" target="_blank" rel="noopener noreferrer">${html}</a>`;
        }
        return html;
      }
      return renderText(n.nodes || []);
    })
    .join('');
}

const ALIGN: Record<string, string> = { CENTER: 'center', RIGHT: 'right', LEFT: 'left', JUSTIFY: 'justify' };

function renderNode(n: any): string {
  try {
    switch (n.type) {
      case 'PARAGRAPH': {
        const inner = renderText(n.nodes || []);
        if (!inner.trim()) return '';
        const a = ALIGN[n.paragraphData?.textStyle?.textAlignment] || '';
        return `<p${a ? ` style="text-align:${a}"` : ''}>${inner}</p>`;
      }
      case 'HEADING': {
        const lvl = Math.min(6, Math.max(2, n.headingData?.level || 2));
        const a = ALIGN[n.headingData?.textStyle?.textAlignment] || '';
        return `<h${lvl}${a ? ` style="text-align:${a}"` : ''}>${renderText(n.nodes || [])}</h${lvl}>`;
      }
      case 'IMAGE': {
        const img = n.imageData?.image;
        if (!img?.src?.id) return '';
        const alt = esc(n.imageData?.altText || '');
        return `<figure class="rc-img"><img src="${imgUrl(img.src.id, img.width, img.height)}" ${
          img.width && img.height ? `width="${img.width}" height="${img.height}" ` : ''
        }alt="${alt}" loading="lazy" decoding="async"></figure>`;
      }
      case 'GALLERY': {
        const items = (n.galleryData?.items || [])
          .map((it: any) => it.image?.media || it.image)
          .filter((im: any) => im?.src?.id)
          .map((im: any) => `<img src="${imgUrl(im.src.id, im.width, im.height)}" alt="" loading="lazy" decoding="async">`)
          .join('');
        return items ? `<div class="rc-gallery">${items}</div>` : '';
      }
      case 'VIDEO': {
        const v = n.videoData?.video?.src?.id;
        if (!v) return '';
        const poster = n.videoData?.thumbnail?.src?.id ? ` poster="${posterUrl(n.videoData.thumbnail.src.id)}"` : '';
        return `<figure class="rc-video"><video controls preload="metadata" playsinline${poster}><source src="${videoUrl(v)}" type="video/mp4"></video></figure>`;
      }
      case 'FILE': {
        const f = n.fileData;
        const url = f?.src?.id ? docUrl(f.src.id, f.name) : '';
        if (!url) return '';
        const name = esc(f.name || 'download');
        const meta = [String(f.type || '').toUpperCase(), kb(f.size)].filter(Boolean).join(' · ');
        return `<a class="rc-file" href="${esc(url)}" target="_blank" rel="noopener" download>
          <span class="rc-file-ic">↓</span><span class="rc-file-tx"><b>${name}</b><small>${esc(meta)}</small></span></a>`;
      }
      case 'DIVIDER':
        return '<hr class="rc-hr">';
      case 'BULLETED_LIST':
      case 'ORDERED_LIST': {
        const tag = n.type === 'ORDERED_LIST' ? 'ol' : 'ul';
        const lis = (n.nodes || [])
          .map((li: any) => `<li>${(li.nodes || []).map(renderNode).join('')}</li>`)
          .join('');
        return `<${tag} class="rc-list">${lis}</${tag}>`;
      }
      case 'BLOCKQUOTE':
        return `<blockquote class="rc-quote">${(n.nodes || []).map(renderNode).join('')}</blockquote>`;
      case 'CODE_BLOCK':
        return `<pre class="rc-code"><code>${renderText(n.nodes || [])}</code></pre>`;
      default:
        // Unknown block: recurse children if any, else drop.
        return (n.nodes || []).map(renderNode).join('');
    }
  } catch {
    return '';
  }
}

export function renderRicos(rc: any): string {
  const nodes = rc?.nodes;
  if (!Array.isArray(nodes)) return '';
  return nodes.map(renderNode).join('\n');
}
