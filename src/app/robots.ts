import type { MetadataRoute } from "next";

import { indexingAllowed, siteUrl } from "@/lib/seo";

/* Indexing is opt-in through ALLOW_INDEXING, and defaults to OFF.

   A "green deploy, empty index" is much easier to recover from than content
   having been crawled and dropped from an index before the pages are meant to
   be public. Anything other than the exact string "true" - unset, "false",
   "1", "TRUE" - disallows everything, so forgetting the variable is safe
   rather than quietly permissive.

   The sitemap URL is emitted in both states on purpose: it is how you check
   what would be indexed before switching indexing on. */
export default function robots(): MetadataRoute.Robots {
  const origin = siteUrl().origin;

  if (!indexingAllowed()) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
      sitemap: `${origin}/sitemap.xml`,
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        /* The Studio is a CMS UI, not content: kept out of crawls here, and it
           separately carries robots noindex in its own metadata so a shared URL
           still does not surface in results. */
        disallow: ["/admin", "/admin/", "/api/"],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}