import PageHeader from "@/components/PageHeader";
import PublicationsClient from "./PublicationsClient";

import { publicationsQuery } from "@/lib/queries";
import { fetchSanity } from "@/lib/sanity";
import type { Publication } from "@/lib/types";

export default async function PublicationsPage() {
  const publications = (await fetchSanity<Publication[]>(publicationsQuery)) ?? [];

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
      <PublicationsClient publications={publications} />
    </main>
  );
}