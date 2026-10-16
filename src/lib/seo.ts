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
 * Absolute origin for canonical URLs, Open Graph image URLs and the sitemap.
 *
 * Falls back to localhost so a missing variable degrades to a self-referencing
 * canonical rather than a build error - and a localhost canonical is obviously
 * wrong in production, which is the point: it is meant to be noticed, not
 * silently emitted.
 */
export function siteUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return new URL(raw && raw !== "" ? raw : "http://localhost:3000");
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
 * that this is not the public production origin, so a misconfigured or
 * preview deployment cannot be crawled by accident.
 *
 * Blocked when:
 *   - BLOCK_INDEXING is the exact string "true" - the explicit override, for
 *     taking a live deploy out of the index without undeploying it;
 *   - NEXT_PUBLIC_SITE_URL is missing or points at a local copy. This is the
 *     common case: a developer machine or a preview that has not been given a
 *     real origin;
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

  const url = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim();
  if (url === "" || url.includes("localhost") || url.includes("127.0.0.1")) {
    return false;
  }

  /* Set-but-not-production is a preview; unset means this is not that
     platform at all. */
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
    return false;
  }

  if (process.env.CONTEXT && process.env.CONTEXT !== "production") {
    return false;
  }

  return true;
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

  return {
    title,
    description,
    alternates: { canonical: canonical(path) },
    openGraph: openGraphFor(title, description, path),
    twitter: twitterFor(title, description),
    robots: noindex ? { index: false, follow: false } : undefined,
  };
}