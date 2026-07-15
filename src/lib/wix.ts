import { createClient, OAuthStrategy, media } from '@wix/sdk';
import { items } from '@wix/data';
import { posts } from '@wix/blog';

/**
 * Headless client bound to the existing "Cohen" Wix site (fa067d58…) via its
 * public OAuth client id. Reads Blog + CMS as an anonymous visitor.
 */
export const wix = createClient({
  modules: { items, posts },
  auth: OAuthStrategy({ clientId: import.meta.env.PUBLIC_WIX_CLIENT_ID }),
});

export { media };

/** Resolve a `wix:image://…` URI (as stored in CMS/Blog) to a real https URL. */
export function imageUrl(
  wixImage: string | undefined | null,
  w = 1200,
  h = 800,
): string | null {
  if (!wixImage) return null;
  try {
    return media.getScaledToFillImageUrl(wixImage, w, h, {});
  } catch {
    return null;
  }
}
