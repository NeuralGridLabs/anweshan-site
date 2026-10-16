import type { Metadata } from "next";

/* --------------------------------------------------------------------------
    SEO.

    One place for the site-wide defaults and the two rules that are easy to get
    subtly wrong: never emitting the string "undefined" or "null" into a
    <title> or meta tag, and keeping a title inside the length search engines
    actually display.

    Every page gets its metadata through `pageMetadata`, which takes the CMS
    value first and falls back to a hard-coded default. The fallback is what
    makes "CMS value first, otherwise this default" true for all fourteen
    routes without each page repeating the priority logic.
   ----------------------------------------------------------------------- */

/**
 * The canonical public origin of the live site.
 *
 * Hard-coded as well as configurable, because it is what every absolute URL
 * degrades to in a production build when NEXT_PUBLIC_SITE_URL is missing. The
 * variable is the source of truth; this is the seatbelt, so a build that never
 * received the variable still publishes www.anweshan.org rather than
 * http://localhost:3000. If the domain ever moves, change it here and in the
 * hosting dashboard - not in the fourteen routes that build URLs.
 */
export const PRODUCTION_SITE_URL = "https://www.anweshan.org";

/** The dev server. Only ever reached from a build with NODE_ENV=development. */
const LOCAL_SITE_URL = "http://localhost:3000";

/**
 * Parses a configured origin, tolerating the shapes people actually type.
 *
 * "www.anweshan.org", "https://www.anweshan.org" and "https://www.anweshan.org/"
 * all have to mean the same origin, since a bare host is the easy mistake to
 * make in a dashboard field. A value that is not a URL at all returns null
 * rather than throwing, so a typo falls back to a correct origin instead of
 * failing the build with a message about SEO on a site deploy.
 */
function parseOrigin(raw: string): URL | null {
  const value = raw.trim();
  if (value === "") return null;

  try {
    return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return null;
  }
}

/**
 * Whether this build is running as production.
 *
 * NODE_ENV, and not a "has this variable" test: a Netlify deploy preview is
 * NODE_ENV=production too, and treating it as a local copy is what keeps its
 * URLs from pointing at localhost.
 */
function isProductionBuild(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Absolute origin for canonical URLs, Open Graph image URLs, the sitemap and
 * robots.txt.
 *
 * Resolution order: NEXT_PUBLIC_SITE_URL, then the hard-coded production origin
 * in a production build, then localhost in development.
 *
 * The localhost fallback is scoped to development on purpose. It used to be
 * unconditional, which meant a production build missing one dashboard variable
 * published http://localhost:3000 into every canonical, og:url and sitemap
 * entry - a green build shipping the wrong host to search engines. Production
 * now falls back to PRODUCTION_SITE_URL, and development keeps localhost so a
 * local share card and canonical resolve against the server actually running.
 */
export function siteUrl(): URL {
  const configured = parseOrigin(process.env.NEXT_PUBLIC_SITE_URL ?? "");
  if (configured) return configured;

  return new URL(isProductionBuild() ? PRODUCTION_SITE_URL : LOCAL_SITE_URL);
}

/**
 * Whether an origin is a local copy rather than a real host.
 *
 * Checked against the RESOLVED origin, not the raw variable, so the fallback
 * cannot be mistaken for a misconfiguration.
 */
function isLoopback(url: URL): boolean {
  const host = url.hostname.toLowerCase();

  return (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host === "::1" ||
    host === "[::1]"
  );
}

export const SITE_NAME = "Anweshan";

/**
 * The card image used site-wide. An existing asset in /public - the full logo,
 * which is 2.75:1 and so already close to the 1.91:1 an Open Graph card wants
 * that it does not crop badly.
 */
export const OG_IMAGE = {
  url: "/images/logo.png",
  width: 6000,
  height: 2184,
  alt: "Anweshan",
};

/**
 * Whether search engines may index this deployment.
 *
 * Indexing is ON by default: the live site should be findable without anyone
 * having to remember a flag. It is blocked only when there is positive evidence
 * that this is not the public production origin, so a misconfigured or preview
 * deployment cannot be crawled by accident.
 *
 * Blocked when:
 *   - BLOCK_INDEXING is the exact string "true" - the explicit override, for
 *     taking a live deploy out of the index without undeploying it;
 *   - the RESOLVED origin is a local copy. This is the common case: a
 *     development server. It is checked after siteUrl() has applied the
 *     production fallback, which is the whole point - a production build with
 *     no NEXT_PUBLIC_SITE_URL resolves to www.anweshan.org and stays indexable.
 *     Keying off the raw variable instead, as this used to, meant one missing
 *     dashboard setting silently de-indexed the live site;
 *   - VERCEL_ENV is set and is not "production" - a Vercel preview build;
 *   - CONTEXT is set and is not "production" - a Netlify branch or deploy
 *     preview context.
 *
 * The two platform variables are only consulted when SET. An unset variable is
 * not a preview, it is just a build that is not running on that platform.
 *
 * Every comparison is an exact match, so "TRUE", "1" and "yes" do not block -
 * only the literal "true" does. Guessing at loosely-typed values would risk
 * either indexing a preview or de-indexing production over a typo.
 */
export function indexingAllowed(): boolean {
  if (process.env.BLOCK_INDEXING === "true") return false;

  /* Set-but-not-production is a preview; unset means this is not that
     platform at all. Checked before the origin because it is the cheaper and
     more specific signal: a deploy preview is never indexable even when it
     happens to be given the production domain. */
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
    return false;
  }

  if (process.env.CONTEXT && process.env.CONTEXT !== "production") {
    return false;
  }

  /* Only a resolved loopback blocks. In production this is never true, because
     siteUrl() falls back to PRODUCTION_SITE_URL - which is what makes a missing
     NEXT_PUBLIC_SITE_URL safe rather than a silent de-index. */
  return !isLoopback(siteUrl());
}

/**
 * Truncates on a word boundary and appends an ellipsis.
 *
 * Cutting mid-word ("policy produc…") reads as broken, so this walks back to
 * the last space. `max` is the total length INCLUDING the ellipsis, so a value
 * passed max: 155 never comes back longer than 155.
 */
export function truncate(text: string | null | undefined, max: number): string {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  if (!clean) return "";
  if (clean.length <= max) return clean;

  const slice = clean.slice(0, max - 1);
  const lastSpace = slice.lastIndexOf(" ");

  /* Only honour the word boundary if it leaves something worth reading:
     a very short max, or a single enormous first word, has no useful space to
     cut on and should fall back to a hard slice. */
  const body = lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice;

  return `${body.replace(/[\s,;:.!?-]+$/, "")}…`;
}

/**
 * Builds a page title inside `max`, given the parts that make it up.
 *
 * Tries the full join, then progressively shorter forms, so a long client or
 * project name loses its least important part rather than being truncated
 * mid-word. `variants` is ordered most-descriptive first.
 */
export function buildTitle(variants: string[], max = 60): string {
  /* Empty variants are skipped rather than tested for length: an empty string
     is trivially "under max" and would otherwise win the loop and emit a title
     tag with nothing in it. That is what made / and /about render a <title>
     of "" and no og:title at all - the CMS value was absent, the empty
     placeholder won, and the real fallback was never reached. */
  for (const variant of variants) {
    const clean = variant.replace(/\s+/g, " ").trim();
    if (clean && clean.length <= max) return clean;
  }

  /* Every variant was empty or too long. Truncate the first one that has any
     content, so the caller always gets a usable string rather than "". */
  const firstWithContent = variants.find((v) => (v ?? "").trim() !== "");
  return truncate(firstWithContent ?? "", max);
}

/**
 * Picks the CMS value when there is one, otherwise the default, and trims
 * either to `max`. Returns "" for nothing rather than a placeholder, so a
 * caller can check emptiness rather than matching on "undefined".
 */
export function seoText(
  cms: string | null | undefined,
  fallback: string,
  max: number,
): string {
  const chosen = (cms ?? "").trim() || fallback;
  return truncate(chosen, max);
}

/** Absolute URL for a site-relative path, used for canonicals. */
export function canonical(path: string): string {
  const base = siteUrl();
  return new URL(path === "/" ? "/" : path, base).toString();
}

/** The openGraph block shared by every route, so none of them can drift. */
export function openGraphFor(
  title: string,
  description: string,
  path: string,
): NonNullable<Metadata["openGraph"]> {
  return {
    type: "website",
    siteName: SITE_NAME,
    title,
    description,
    url: canonical(path),
    images: [{ ...OG_IMAGE }],
  };
}

/** The twitter card block, matching openGraph so the two never disagree. */
export function twitterFor(
  title: string,
  description: string,
): NonNullable<Metadata["twitter"]> {
  return {
    card: "summary_large_image",
    title,
    description,
    images: [OG_IMAGE.url],
  };
}

/**
 * The single entry point for a page's metadata.
 *
 * Precedence is CMS, then the hard-coded default. Both are trimmed, canonical
 * and og:title/og:description are always emitted, and `noindex` can be forced
 * for routes that must never be indexed.
 *
 * `noindex` is also implied by indexingAllowed() being false, so a deploy
 * preview or a local copy carries robots noindex on every route. A robots.txt
 * disallow only keeps crawlers out of the fetch - a URL pasted into a chat is
 * still fetched and still indexable from the referring link - and noindex is
 * the only instruction that survives that. In production indexingAllowed() is
 * true, so this changes nothing there.
 */
export function pageMetadata({
  cmsTitle,
  cmsDescription,
  fallbackTitle,
  fallbackDescription,
  path,
  titleMax = 60,
  descriptionMax = 160,
  noindex = false,
}: {
  cmsTitle?: string | null;
  cmsDescription?: string | null;
  fallbackTitle: string;
  fallbackDescription: string;
  path: string;
  titleMax?: number;
  descriptionMax?: number;
  noindex?: boolean;
}): Metadata {
  const title = buildTitle([(cmsTitle ?? "").trim(), fallbackTitle], titleMax);
  const description = seoText(cmsDescription, fallbackDescription, descriptionMax);
  const blocked = noindex || !indexingAllowed();

  return {
    title,
    description,
    alternates: { canonical: canonical(path) },
    openGraph: openGraphFor(title, description, path),
    twitter: twitterFor(title, description),
    robots: blocked ? { index: false, follow: false } : undefined,
  };
}