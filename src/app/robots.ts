import type { MetadataRoute } from "next";

import { indexingAllowed, siteUrl } from "@/lib/seo";

/* Indexing is on by default and blocked only for previews and local copies.

   A live deploy should be findable without anyone having to remember to flip a
   flag, so the normal state is allow. It disallows everything only when there
   is positive evidence this is not the public production origin - a local
   copy, a Vercel or Netlify preview - which is exactly the set of builds that
   should never compete with the real site. Set BLOCK_INDEXING=true to take a
   live deploy out of the index without undeploying it.

   "Missing NEXT_PUBLIC_SITE_URL" is deliberately NOT on that list. A production
   build that never received the variable resolves through siteUrl() to
   https://www.anweshan.org, so it stays indexable and the Sitemap line below is
   the real one. Keying the decision off the raw variable instead de-indexed the
   live site every time that one dashboard setting was absent.

   The sitemap URL is emitted in both cases on purpose: in the blocked state it
   is how you check what would be indexed before letting crawlers in. */
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
           still does not surface in results. /api/ is excluded for the same
           reason - it is machine-readable output, not a page to rank. */
        disallow: ["/admin", "/admin/", "/api/"],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}