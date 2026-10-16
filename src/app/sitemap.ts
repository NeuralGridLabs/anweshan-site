import type { MetadataRoute } from "next";

import { clientHubsSitemapQuery, projectsSitemapQuery } from "@/lib/queries";
import { fetchSanity } from "@/lib/sanity";
import { canonical } from "@/lib/seo";

/* -------------------------------------------------------------------------- */
/* Sitemap                                                                    */
/* -------------------------------------------------------------------------- */

/* Every URL below is built with canonical(), never by string concatenation with
   an origin literal. canonical() resolves through siteUrl(), which is the one
   place that decides between NEXT_PUBLIC_SITE_URL, the hard-coded production
   origin and localhost - so the sitemap cannot end up publishing
   http://localhost:3000 because a dashboard variable was never filled in. */

/* The public pages that exist as a fixed route. /admin is deliberately absent -
   it is a CMS UI and is disallowed in robots.ts - and /gallery is a real
   public page so it belongs here like any other. */
const STATIC_ROUTES: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/about", priority: 0.8 },
  { path: "/services", priority: 0.9 },
  { path: "/projects", priority: 0.9 },
  { path: "/clients", priority: 0.8 },
  { path: "/sectors", priority: 0.7 },
  { path: "/publications", priority: 0.8 },
  { path: "/cro", priority: 0.8 },
  { path: "/gallery", priority: 0.6 },
  { path: "/team", priority: 0.6 },
  { path: "/career", priority: 0.6 },
  { path: "/contact", priority: 0.7 },
];

type SitemapEntry = {
  slug: string;
  _updatedAt?: string;
};

/**
 * A document only makes it into the sitemap if it has a slug AND an _updatedAt
 * that parses. A missing slug would emit "/clients/" or, worse, the literal
 * string "undefined" into a URL, and an unparseable date would emit
 * "Invalid Date". Both are filtered here rather than trusted.
 */
function toEntry(
  kind: "clients" | "projects",
  doc: SitemapEntry | null,
): MetadataRoute.Sitemap[number] | null {
  const slug = (doc?.slug ?? "").trim();
  if (!slug) return null;

  const stamp = Date.parse(doc?._updatedAt ?? "");
  const lastModified = Number.isNaN(stamp)
    ? new Date()
    : new Date(stamp);

  return {
    url: canonical(`/${kind}/${slug}`),
    lastModified,
    /* Detail pages are the bulk of the site, so they sit below the top-level
       pages rather than competing with them. */
    changeFrequency: "monthly" as const,
    priority: 0.6,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [hubs, projects] = await Promise.all([
    fetchSanity<SitemapEntry[]>(clientHubsSitemapQuery),
    fetchSanity<SitemapEntry[]>(projectsSitemapQuery),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(
    ({ path, priority }) => ({
      url: canonical(path),
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority,
    }),
  );

  /* Both lists are already filtered on the shared READY expression in GROQ, so
     a document marked anything other than ready can never reach this file.
     toEntry then drops the ones without a usable slug. */
  const detailEntries = [
    ...(hubs ?? []).map((doc) => toEntry("clients", doc)),
    ...(projects ?? []).map((doc) => toEntry("projects", doc)),
  ].filter((entry): entry is MetadataRoute.Sitemap[number] => entry !== null);

  return [...staticEntries, ...detailEntries];
}