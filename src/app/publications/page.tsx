import Link from "next/link";
import Image from "next/image";
import { ExternalLink, FileText, Download, FileSpreadsheet } from "lucide-react";

import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";

import { publicationsQuery } from "@/lib/queries";
import { fetchSanity } from "@/lib/sanity";
import { sanityFileUrl, sanityImageUrl } from "@/lib/image";
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
    <main className="min-h-screen text-base bg-snow">
      <PageHeader
        tone="ink"
        eyebrow="Research & outputs"
        title="Publications"
        lead="Working papers, reports and datasets from our research engagements, available to download or read online."
      />

      <section className="bg-cream py-20 md:py-32">
        <div className="max-w-[1400px] mx-auto px-6">
          {publications.length === 0 ? (
            <Reveal>
              <div className="rounded-2xl border border-forest/15 bg-ivory p-12 text-center">
                <p className="eyebrow text-forest mb-4 text-base">
                  No publications yet
                </p>

                <p className="body-lg text-forest/70 max-w-xl mx-auto">
                  Publications are added from the CMS. Open the admin studio
                  at{" "}
                  <Link
                    href="/admin"
                    className="underline-grow font-semibold text-forest"
                  >
                    /admin
                  </Link>{" "}
                  and create a Publication with a downloadable file or an
                  external URL to see it here.
                </p>
              </div>
            </Reveal>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {publications.map((pub, i) => {
                const ref = pub.file?.asset?._ref;

                const extMatch = ref?.match(/(\w+)$/);
                const ext = extMatch?.[1];

                const Icon = fileIcon(ext);

                const coverUrl = sanityImageUrl(pub.coverImage);

                /* A publication is reachable by an uploaded file, an external
                   link, or both. Each action renders only when its own source
                   resolves, and the footer stays empty when neither does so
                   card heights remain consistent. */
                const actions = publicationActions({
                  fileUrl: sanityFileUrl(pub.file),
                  externalUrl: pub.externalUrl,
                });

                return (
                  <Reveal
                    key={pub._id}
                    delay={i * 60}
                  >
                    <article className="h-full flex flex-col rounded-2xl overflow-hidden bg-ivory border border-forest/10 hover:border-forest/30 transition-colors">
                      {coverUrl ? (
                        <div className="relative aspect-[16/10] bg-sage">
                          <Image
                            src={coverUrl}
                            alt={pub.title}
                            fill
                            sizes="(max-width: 1024px) 100vw, 33vw"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="relative aspect-[16/10] bg-sage flex items-center justify-center">
                          <Icon
                            size={40}
                            className="text-forest/40"
                          />
                        </div>
                      )}

                      <div className="flex flex-col flex-1 p-7">
                        <div className="flex items-center gap-3 mb-4">
                          {pub.year && (
                            <span className="text-forest/50 eyebrow text-base tabular-nums">
                              {pub.year}
                            </span>
                          )}

                          {ext && (
                            <span className="rounded-full bg-gold/30 text-forest text-[11px] font-semibold px-3 py-1 uppercase tracking-wide">
                              {ext}
                            </span>
                          )}
                        </div>

                        <h3 className="h3-card text-forest mb-3">
                          {pub.title}
                        </h3>

                        {pub.authors && (
                          <p className="body-sm text-forest/60 mb-2">
                            {pub.authors}
                          </p>
                        )}

                        {pub.journal && (
                          <p className="body-sm text-forest/50 italic mb-4">
                            {pub.journal}
                          </p>
                        )}

                        {pub.abstract && (
                          <p className="body-sm text-forest/70 line-clamp-4 mb-6">
                            {pub.abstract}
                          </p>
                        )}

                        <div className="mt-auto pt-4 border-t border-forest/10">
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                            {actions.showFile && actions.fileUrl && (
                              <a
                                href={actions.fileUrl}
                                download
                                className="group inline-flex items-center gap-2 text-forest font-semibold text-sm hover:text-forest/70 transition-colors"
                              >
                                <Download
                                  size={16}
                                  className="group-hover:translate-y-0.5 transition-transform"
                                />

                                Download
                              </a>
                            )}

                            {actions.showExternal && actions.externalUrl && (
                              <a
                                href={actions.externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-2 text-forest font-semibold text-sm hover:text-forest/70 transition-colors"
                              >
                                <ExternalLink
                                  size={16}
                                  className="group-hover:-translate-y-0.5 transition-transform"
                                />

                                View online
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
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