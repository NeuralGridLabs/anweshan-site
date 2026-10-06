/* --------------------------------------------------------------------------
    Service detail-page gate

    One rule, used by both the /services band and the /services/[slug] route, so
    the link on the band and the page it points at can never disagree.

    The rule: a service has a detail page only when the editor has switched it
    on, given it a slug to build the URL from, and written at least one piece of
    body content for it. A service that fails any of those must not be linked,
    because the route would 404.
   ----------------------------------------------------------------------- */

import type { ServiceItem } from "./types";

/**
 * True only when this service is entitled to its own page at /services/<slug>.
 *
 * Note the deliberate strictness on `hasDetailPage`: a truthy-but-not-true value
 * is rejected, so only an explicit `true` in Studio enables the page.
 */
export function hasServiceDetail(item: ServiceItem | null | undefined): boolean {
  if (!item) return false;
  if (item.hasDetailPage !== true) return false;
  if (!item.slug?.current) return false;

  const hasBody = Boolean(item.detailBody?.trim());
  const hasCapabilities = Boolean(item.capabilities && item.capabilities.length > 0);

  return hasBody || hasCapabilities;
}

/** The URL segment for a service, or null when it has no page. */
export function serviceDetailSlug(
  item: ServiceItem | null | undefined,
): string | null {
  return hasServiceDetail(item) ? (item?.slug?.current ?? null) : null;
}