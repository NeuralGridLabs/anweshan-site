import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Download } from "lucide-react";

import { sanityFileUrl, sanityImageUrl } from "@/lib/image";
import { publicationActions } from "@/lib/publication-delivery";
import type { Publication } from "@/lib/types";

/* --------------------------------------------------------------------------
   Homepage publications preview

   A short, curated read of recent outputs, placed between the featured-work
   rail and the explore band.

   Each entry is one flat surface: cover, then text. No wrapper card around
   the group, so this does not stack card-on-card with the rail above.
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
    <section id="publications" className="relative bg-snow py-20 md:py-28">
      <div className="max-w-[1480px] mx-auto px-6 md:px-12">
        {/* Heading row mirrors the featured-work rail above. */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 mb-10 md:mb-12 border-b border-forest/15">
          <h2 className="h2-section text-forest">Our publications</h2>

          <Link
            href="/publications"
            className="group inline-flex items-center gap-2 text-forest/75 hover:text-forest text-sm font-semibold transition-colors"
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
               URL, or both. */
            const actions = publicationActions({
              fileUrl: sanityFileUrl(pub.file),
              externalUrl: pub.externalUrl,
            });

            const coverUrl = sanityImageUrl(pub.coverImage);

            return (
              <li key={pub._id} className="group flex flex-col">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-mint/30">
                  {coverUrl ? (
                    <Image
                      src={coverUrl}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-mint/50 text-forest/30">
                      <svg
                        width="34"
                        height="34"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        aria-hidden="true"
                      >
                        <path d="M4 19.5V6a2 2 0 0 1 2-2h13v16H6a2 2 0 0 1-2-1.5Z" />
                        <path d="M8 8h7M8 12h7M8 16h4" />
                      </svg>
                    </div>
                  )}
                </div>

                {(pub.journal || pub.year) && (
                  <p className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-forest/55">
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
                  <p className="body-sm text-forest/70 line-clamp-3 mt-3">
                    {pub.abstract}
                  </p>
                )}

                {actions.showAny && (
                  <div className="mt-6 pt-5 border-t border-forest/15 flex flex-wrap items-center gap-x-6 gap-y-2">
                    {actions.showExternal && actions.externalUrl && (
                      <a
                        href={actions.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link inline-flex items-center gap-2 text-forest font-semibold text-sm hover:text-forest/70 transition-colors"
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
                        className="group/dl inline-flex items-center gap-2 text-forest font-semibold text-sm hover:text-forest/70 transition-colors"
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
