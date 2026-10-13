import PageHeader from "@/components/PageHeader";
import PublicationsClient from "./PublicationsClient";

import { publicationsQuery } from "@/lib/queries";
import { fetchSanity } from "@/lib/sanity";
import type { Publication } from "@/lib/types";

export default async function PublicationsPage() {
  const publications = (await fetchSanity<Publication[]>(publicationsQuery)) ?? [];

  /* The current year, resolved here rather than in the client timeline.

     The timeline needs it to run its bars up to "now", but calling
     new Date() during a client render means the server and the browser each
     compute it independently. A page built in December and served in January
     then hydrates against a different value and React discards the tree. Read
     once on the server and passed down, the value is serialised into the
     props, so both sides are given the same number and cannot disagree. */
  const currentYear = new Date().getFullYear();

  return (
    <main className="min-h-screen bg-snow">
      {/* Page Header */}
      <PageHeader
        tone="ink"
        eyebrow="Research & outputs"
        title="Publications"
        lead="Peer-reviewed articles, technical reports, policy products, datasets and learning resources produced by or with Anweshan's team. Every record identifies the publication type, date, authorship or contribution, client or partner, and access status."
      />

      {/* Client-side filtering and results */}
      <PublicationsClient
        publications={publications}
        currentYear={currentYear}
      />
    </main>
  );
}