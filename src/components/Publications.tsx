import Link from "next/link";
import { ArrowUpRight, Download } from "lucide-react";

import { sanityFileUrl } from "@/lib/image";
import { publicationActions } from "@/lib/publication-delivery";
import type { Publication } from "@/lib/types";

/* --------------------------------------------------------------------------
   Homepage publications preview

   A short, curated read of recent outputs, placed between the featured-work
   rail and the explore band.

   Each entry sits on its own light cream card, so the entries read as
   separate objects against the gold section background instead of dissolving
   into it. The section keeps the gradient; only the content surface is tinted.
   The cover image is deliberately left square-cornered: the card's own padding
   mats it, so it sits inside the card rather than fighting its rounded corners.
   ----------------------------------------------------------------------- */

export default function Publications({
  publications,
}: {
  publications: Publication[];
}) {
  /* Nothing eligible yet. Render no section at all rather than an empty shell
     or placeholder copy, so the homepage is unaffected until publications
     exist. */
  if (publications.length === 0) return null;

  return (
<section
  id="publications"
className="relative bg-gradient-to-br from-[#FFF7C2] via-[#F9E68C] to-[#E8C65A] py-20 md:py-28">
      <div className="max-w-[1480px] mx-auto px-6 md:px-12">
        {/* Heading row mirrors the featured-work rail above. */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 mb-10 md:mb-12 border-b border-forest/15">
          <h2 className="h2-section text-forest">Our publications</h2>

          <Link
            href="/publications"
            className="group inline-flex items-center gap-2 text-forest/85 hover:text-forest text-sm font-semibold transition-colors"
          >
            View all publications
            <ArrowUpRight
              size={16}
              className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
            />
          </Link>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 md:gap-x-10 gap-y-12">
          {publications.map((pub) => {
            /* Same resolution as the publications page, so a record that is
               reachable there is reachable here: either a file, an external
               URL, or both. `fileUrl` is the URL Sanity resolved from the file
               asset; `sanityFileUrl()` remains the fallback. */
            const actions = publicationActions({
              fileUrl: pub.fileUrl ?? sanityFileUrl(pub.file),
              externalUrl: pub.externalUrl,
            });

            return (
              <li
                key={pub._id}
                className="group flex flex-col rounded-2xl bg-ivory p-5 md:p-6 border border-forest/15 shadow-sm transition-shadow duration-300 hover:shadow-md"
              >
                {/* No image panel: publication covers were removed from the CMS
                    and from the publications page, so the cards are text-only
                    and line up on a shared baseline instead. */}

                {(pub.journal || pub.year) && (
                  <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-forest/85">
                    {pub.journal && <span className="meta-label">{pub.journal}</span>}

                    {pub.year && (
                      <span className="text-sm tabular-nums">{pub.year}</span>
                    )}
                  </p>
                )}

                <h3 className="h3-card text-forest mt-3 text-balance">
                  {pub.title}
                </h3>

                {pub.abstract && (
                  <p className="body-sm text-forest/85 line-clamp-3 mt-3">
                    {pub.abstract}
                  </p>
                )}

                {actions.showAny && (
                  <div className="mt-6 pt-5 border-t border-forest/15 flex flex-wrap items-center gap-x-6 gap-y-2">
                    {actions.showView && actions.viewUrl && (
                      <a
                        href={actions.viewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link inline-flex items-center gap-2 text-forest font-semibold text-sm text-forest/70 transition-colors"
                      >
                        View publication
                        <ArrowUpRight
                          size={15}
                          className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform"
                        />
                      </a>
                    )}

                    {actions.showFile && actions.fileUrl && (
                      <a
                        href={actions.fileUrl}
                        download
                        className="group/dl inline-flex items-center gap-2 text-forest font-semibold text-sm text-forest/70 transition-colors"
                      >
                        <Download
                          size={15}
                          className="group-hover/dl:translate-y-0.5 transition-transform"
                        />

                        Download
                      </a>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
