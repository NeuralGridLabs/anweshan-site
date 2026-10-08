import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import PageHeader from "@/components/PageHeader";
import ClientGrid from "@/components/ClientGrid";
import { clientHubsQuery, clientsQuery } from "@/lib/queries";
import { fetchSanity } from "@/lib/sanity";
import type { ClientHub, Clients } from "@/lib/types";

/* The client index. Cards come from clientHub documents rather than the clients
   singleton: the singleton still drives the home page logo carousel, while hubs
   are structured records that can own a page. */

const PILL =
  "inline-flex items-center gap-2 rounded-full bg-forest text-white text-sm font-semibold px-6 py-3 hover:bg-forest/90 transition-colors";

function isInternal(href: string) {
  return href.startsWith("/") && !href.startsWith("//");
}

export default async function ClientsPage() {
  const [singleton, hubs] = await Promise.all([
    fetchSanity<Clients>(clientsQuery),
    fetchSanity<ClientHub[]>(clientHubsQuery),
  ]);

  const list = hubs ?? [];
  const ctaLabel = singleton?.ctaLabel?.trim() ?? "";
  const ctaLink = singleton?.ctaLink?.trim() ?? "";
  const note = singleton?.note?.trim() ?? "";

  return (
    <main className="min-h-screen bg-snow">
      {/* "teal" is cream. The ivory "primary" tone was too close to the sage grid
          below and read as one washed-out stretch; cream contrasts with it and
          makes the white cards below pop. */}
      <PageHeader
        tone="teal"
        eyebrow={singleton?.eyebrow?.trim() || "Our clients"}
        title={
          singleton?.heading?.trim() ||
          "Trusted across institutions, sectors and assignments"
        }
        lead={
          singleton?.intro?.trim() ||
          "Our client relationships are best understood through the work."
        }
        plain
      />

      {/* With no ready hubs there is nothing to grid. Rather than showing an
          empty shell, say so plainly so the page never looks broken. */}
      {list.length === 0 ? (
        /* Same sage surface as the grid below, so the empty state reads as part of
           the page rather than a broken panel. */
        <section className="bg-sage py-20 md:py-28">
          <div className="max-w-[1400px] mx-auto px-6">
            <p className="text-forest/85 body-lg">Client profiles are being prepared.</p>
          </div>
        </section>
      ) : (
        /* Sage behind the grid: white cards need a surface with enough tone to
           read as separate objects. On the near-white page they vanished. */
        <section className="bg-sage py-20 md:py-28">
          <div className="max-w-[1400px] mx-auto px-6">
            <ClientGrid hubs={list} />

            {(note || (ctaLabel && ctaLink)) && (
              <div className="mt-16">
                {note && (
                  <p className="text-forest/85 text-sm max-w-3xl mb-8">{note}</p>
                )}

                {ctaLabel && ctaLink && (
                  isInternal(ctaLink) ? (
                    <Link href={ctaLink} className={PILL}>
                      {ctaLabel}
                      <ArrowRight size={14} />
                    </Link>
                  ) : (
                    <a
                      href={ctaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={PILL}
                    >
                      {ctaLabel}
                      <ArrowUpRight size={14} />
                    </a>
                  )
                )}
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}