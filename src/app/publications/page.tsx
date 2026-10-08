import Link from "next/link";
import {
  ExternalLink,
  FileText,
  Download,
  FileSpreadsheet,
  BookOpen,
} from "lucide-react";

import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";

import { publicationsQuery } from "@/lib/queries";
import { fetchSanity } from "@/lib/sanity";
import { sanityFileExtension, sanityFileUrl } from "@/lib/image";
import { publicationActions } from "@/lib/publication-delivery";
import type { Publication } from "@/lib/types";

function fileIcon(ext?: string) {
  if (ext === "xls" || ext === "xlsx") {
    return FileSpreadsheet;
  }

  return FileText;
}

export default async function PublicationsPage() {
  const publications =
    (await fetchSanity<Publication[]>(publicationsQuery)) ?? [];

  return (
    <main className="min-h-screen bg-snow text-base">
      {/* Page Header */}
      <PageHeader
        tone="ink"
        eyebrow="Research & outputs"
        title="Publications"
        lead="Working papers, reports and datasets from our research engagements, available to download or read online."
      />

      {/* Publications Section */}
      <section className="relative overflow-hidden bg-forest-light py-20 md:py-28">
        {/* Decorative background elements */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-mint/40 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 -left-32 h-80 w-80 rounded-full bg-gold/10 blur-3xl" />

        <div className="relative max-w-[1240px] mx-auto px-6 lg:translate-x-8">
          {/* Section intro */}
          <Reveal>
            <div className="mb-14 max-w-3xl">
              <div className="flex items-center gap-3 mb-5">
                <span className="h-px w-10 bg-gold" />

                <span className="eyebrow text-forest/60 text-sm">
                  Research library
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-forest">
                Knowledge that informs
                <span className="text-primary"> action.</span>
              </h2>

              <p className="mt-5 max-w-2xl text-base md:text-lg leading-relaxed text-forest/65">
                Explore research, reports, datasets and publications produced
                through our work across health, development and evidence
                generation.
              </p>
            </div>
          </Reveal>

          {publications.length === 0 ? (
            <Reveal>
              <div className="rounded-3xl border border-forest/10 bg-ivory p-12 md:p-16 text-center shadow-sm">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-sage">
                  <BookOpen
                    size={28}
                    className="text-forest/60"
                  />
                </div>

                <p className="eyebrow text-forest mb-4 text-sm">
                  No publications yet
                </p>

                <p className="body-lg text-forest/65 max-w-xl mx-auto">
                  Publications are added from the CMS. Open the admin studio
                  at{" "}
                  <Link
                    href="/admin"
                    className="font-semibold text-forest underline underline-offset-4 hover:text-primary transition-colors"
                  >
                    /admin
                  </Link>{" "}
                  and create a Publication with a downloadable file or an
                  external URL to see it here.
                </p>
              </div>
            </Reveal>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 xl:gap-8">
              {publications.map((pub, i) => {
                /* Prefer the URL Sanity resolved from the file asset in the
                   query. `sanityFileUrl()` stays as the fallback so the page
                   keeps working if a projection is ever trimmed back. */
                const fileUrl = pub.fileUrl ?? sanityFileUrl(pub.file);

                const ext = sanityFileExtension(pub.file) ?? undefined;

                const Icon = fileIcon(ext);

                const actions = publicationActions({
                  fileUrl,
                  externalUrl: pub.externalUrl,
                });

                return (
                  <Reveal
                    key={pub._id}
                    delay={i * 70}
                    className="h-full"
                  >
                    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-ivory border border-forest/10 shadow-[0_8px_30px_rgba(25,60,45,0.06)] hover:shadow-[0_16px_45px_rgba(25,60,45,0.12)] hover:-translate-y-1 transition-all duration-300">
                      {/* Card content */}
                      <div className="flex flex-1 flex-col p-7">
                        {/* Metadata: the file icon carries the "what is this"
                            signal the cover image used to, now inline with
                            the year and extension instead of in a holder. */}
                        <div className="flex flex-wrap items-center gap-3 mb-5">
                          {pub.year && (
                            <span className="text-xs font-semibold tracking-wide text-forest/45 tabular-nums">
                              {pub.year}
                            </span>
                          )}

                          {pub.year && ext && (
                            <span className="h-1 w-1 rounded-full bg-gold" />
                          )}

                          {ext && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 py-1 pl-1.5 pr-2.5 text-xs font-bold uppercase tracking-[0.12em] text-forest/90">
                              <Icon
                                size={13}
                                strokeWidth={1.75}
                                className="text-forest/55"
                              />

                              {ext}
                            </span>
                          )}
                        </div>

                        {/* Journal, promoted above the fold now that there is
                            no cover image: it is the shortest way to say what
                            kind of paper this is. */}
                        {pub.journal && (
                          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-forest/85">
                            {pub.journal}
                          </p>
                        )}

                        {/* Title */}
                        <h3 className="h3-card text-forest leading-snug mb-4 text-balance">
                          {pub.title}
                        </h3>

                        {/* Summary slot: the abstract, with the authors
                            revealed beneath it on hover.

                            The slot is a FIXED height and the authors sit
                            absolutely inside it. That matters for more than
                            tidiness: a reveal in normal flow grows the card,
                            and because grid items stretch to the tallest in
                            the row, one hovered card would drag the whole row
                            open. Overlaying keeps the change local to the card
                            under the pointer, leaves the buttons below
                            reachable, and the fixed height is what keeps every
                            card in the grid identical.

                            The abstract stays visible on hover — it is the
                            reason to look at the card at all — so this adds to
                            the card rather than swapping one summary for
                            another. Height is sized for the fullest state
                            (3 abstract lines + 2 author lines) so the taller
                            of the two is never clipped. */}
                        <div className="relative mb-6 h-40">
                          {pub.abstract ? (
                            <>
                              <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.14em] text-forest/70">
                                Abstract
                              </p>

                              <p className="body-sm leading-relaxed text-forest/65 line-clamp-3">
                                {pub.abstract}
                              </p>
                            </>
                          ) : (
                            <p className="body-sm italic text-forest/40">
                              No abstract provided.
                            </p>
                          )}

                          {pub.authors && (
                            <div className="absolute inset-x-0 bottom-0 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                              <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.14em] text-forest/70">
                                Authors
                              </p>

                              <p className="body-sm text-forest/70 line-clamp-2">
                                {pub.authors}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Actions. `mt-auto` pins the buttons to the card
                            foot, so they line up across the row regardless of
                            how much text sits above them. */}
                        <div className="flex flex-wrap items-center gap-3 mt-auto pt-2">
                          {actions.showFile && actions.fileUrl && (
                            <a
                              href={actions.fileUrl}
                              download
                              className="inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2.5 text-xs font-semibold text-ivory hover:bg-primary transition-colors"
                            >
                              <Download size={14} />

                              Download
                            </a>
                          )}

                          {actions.showView && actions.viewUrl && (
                            <a
                              href={actions.viewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group/link inline-flex items-center gap-2 rounded-full border border-forest/15 px-4 py-2.5 text-xs font-semibold text-forest hover:border-forest/30 hover:bg-sage transition-colors"
                            >
                              <ExternalLink
                                size={14}
                                className="transition-transform group-hover/link:-translate-y-0.5"
                              />

                              View online
                            </a>
                          )}
                        </div>

                      </div>

                      {/* Bottom accent */}
                      <div className="h-1 w-0 bg-gold group-hover:w-full transition-all duration-500" />
                    </article>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}