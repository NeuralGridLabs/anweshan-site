import Link from "next/link";
import { ArrowUpRight, Download, Award, BookOpen, Unlock, Lock, Globe, FileIcon, FileText, FileSpreadsheet } from "lucide-react";

import { sanityFileUrl } from "@/lib/image";
import { publicationActions } from "@/lib/publication-delivery";
import type { Publication, PublicationType, AnweshanRole } from "@/lib/types";

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

function AccessBadge({ status }: { status: string }) {
  const configs: Record<string, { icon: React.ReactNode; label: string; bg: string; text: string; border: string }> = {
    "open-access": { icon: <Unlock size={9} />, label: "Open access", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    "downloadable": { icon: <FileIcon size={9} />, label: "Downloadable", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    "on-request": { icon: <Globe size={9} />, label: "On request", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
    "restricted": { icon: <Lock size={9} />, label: "Restricted", bg: "bg-stone-100", text: "text-stone-600", border: "border-stone-200" },
  };
  
  const config = configs[status] || { icon: <FileText size={9} />, label: "Unknown", bg: "bg-stone-50", text: "text-stone-500", border: "border-stone-200" };
  
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${config.bg} ${config.text} ${config.border}`}>
      {config.icon}
      {config.label}
    </span>
  );
}

function RoleBadge({ role }: { role: AnweshanRole }) {
  if (!role) return null;

  const labels: Record<AnweshanRole, string> = {
    authored: "Authored by Anweshan",
    "co-authored": "Co-authored",
    "research-delivered": "Research delivered",
    "technical-writing": "Technical writing",
    "edited-produced": "Edited / produced",
  };

  const colors: Record<AnweshanRole, string> = {
    authored: "bg-primary-light/50 text-primary-dark border-primary/30",
    "co-authored": "bg-blue-50 text-blue-700 border-blue-200",
    "research-delivered": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "technical-writing": "bg-amber-50 text-amber-700 border-amber-200",
    "edited-produced": "bg-violet-50 text-violet-700 border-violet-200",
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${colors[role] || "bg-primary-light/50 text-primary-dark border-primary/30"}`}>
      <Award size={9} />
      {labels[role] || role}
    </span>
  );
}

function TypeBadge({ type }: { type?: PublicationType }) {
  if (!type) return null;

  const labels: Record<PublicationType, string> = {
    "journal-article": "Journal article",
    "technical-report": "Technical report",
    "policy-brief": "Policy brief",
    "guideline-manual": "Guideline / manual",
    "dataset-tool": "Dataset / tool",
    multimedia: "Multimedia",
    leadership: "Leadership",
  };

  const icons: Record<PublicationType, React.ReactNode> = {
    "journal-article": <BookOpen size={9} />,
    "technical-report": <FileText size={9} />,
    "policy-brief": <FileIcon size={9} />,
    "guideline-manual": <BookOpen size={9} />,
    "dataset-tool": <FileSpreadsheet size={9} />,
    multimedia: <Globe size={9} />,
    leadership: <Award size={9} />,
  };

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-sage/30 px-2 py-0.5 text-[11px] font-semibold text-forest/90 border border-forest/20">
      {icons[type]}
      {labels[type] || type}
    </span>
  );
}

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
      className="relative bg-gradient-to-br from-[#FFF7C2] via-[#F9E68C] to-[#E8C65A] py-20 md:py-28"
    >
      <div className="max-w-[1480px] mx-auto px-6 md:px-12">
        {/* Heading row mirrors the featured-work rail above. */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 mb-10 md:mb-12 border-b border-forest/15">
          <div>
            <p className="eyebrow mb-2 text-forest/70">Research & outputs</p>
            <h2 className="h2-section text-forest">Our publications</h2>
          </div>

          <Link
            href="/publications"
            className="group inline-flex items-center gap-2 text-forest/85 hover:text-forest text-sm font-semibold transition-colors self-start"
          >
            View all publications
            <ArrowUpRight
              size={16}
              className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
            />
          </Link>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 md:gap-x-8 gap-y-10">
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
                className="group flex flex-col rounded-2xl bg-ivory p-5 md:p-6 border border-forest/15 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 hover:border-forest/25"
              >
                {/* Top accent */}
                <div className="h-0.5 w-full bg-gradient-to-r from-gold via-primary to-emerald/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -mx-5 md:-mx-6 mb-5" />
                
                {/* Metadata row: year, type badge, role badge, access status */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  {pub.year && (
                    <span className="text-xs font-semibold tracking-wide text-forest/45 tabular-nums px-2 py-0.5 rounded-full bg-forest/5">
                      {pub.year}
                    </span>
                  )}

                  {pub.type && <TypeBadge type={pub.type} />}

                  {pub.anweshanRole && <RoleBadge role={pub.anweshanRole as AnweshanRole} />}

                  {pub.accessStatus && <AccessBadge status={pub.accessStatus} />}
                </div>

                {(pub.journal || pub.client) && (
                  <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-forest/70 mb-2">
                    {pub.journal && <span className="meta-label">{pub.journal}</span>}
                    {pub.client && (
                      <span className="inline-flex items-center gap-1 text-xs text-forest/60 px-2 py-0.5 rounded-full bg-sage/30">
                        <Globe size={9} />
                        {pub.client}
                      </span>
                    )}
                  </p>
                )}

                <h3 className="h3-card text-forest mt-2 text-balance group-hover:text-primary-dark transition-colors duration-200">
                  {pub.title}
                </h3>

                {pub.abstract && (
                  <p className="body-sm text-forest/75 line-clamp-3 mt-3">
                    {pub.abstract}
                  </p>
                )}

                {actions.showAny && (
                  <div className="mt-6 pt-4 border-t border-forest/10 flex flex-wrap items-center gap-x-4 gap-y-2">
                    {actions.showView && actions.viewUrl && (
                      <a
                        href={actions.viewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link inline-flex items-center gap-2 text-forest font-semibold text-sm transition-colors hover:text-primary"
                      >
                        View publication
                        <ArrowUpRight
                          size={14}
                          className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform"
                        />
                      </a>
                    )}

                    {actions.showFile && actions.fileUrl && (
                      <a
                        href={actions.fileUrl}
                        download
                        className="group/dl inline-flex items-center gap-2 text-forest font-semibold text-sm transition-colors hover:text-primary"
                      >
                        <Download
                          size={14}
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