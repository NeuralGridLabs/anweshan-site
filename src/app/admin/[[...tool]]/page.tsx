import type { Metadata } from "next";

import StudioClient from "./StudioClient";

import { canonical } from "@/lib/seo";

export const dynamic = "force-static";

/* next-sanity supplies the Studio's own title, description and viewport, which
   are kept - a CMS does not need Anweshan's marketing metadata. What is added
   on top is robots noindex.

   That matters independently of robots.txt: the disallow there keeps crawlers
   out of the fetch, but any URL shared in a chat or a bookmark can still be
   opened and indexed from a referring link. noindex says do not list it even if
   you got here. */
const studio = {
  title: "Anweshan CMS",
  description: "Content management for the Anweshan website.",
  robots: { index: false, follow: false },
} satisfies Metadata;

export const metadata: Metadata = {
  ...studio,
  alternates: { canonical: canonical("/admin") },
};

export { viewport } from "next-sanity/studio";

export default function AdminPage() {
  return <StudioClient />;
}