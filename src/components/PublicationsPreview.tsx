import { ArrowRight, ExternalLink } from "lucide-react";

/* --------------------------------------------------------------------------
    Homepage publications preview

    A short, curated read of recent outputs. It used to live inside Hero.tsx as a
    dark-green band directly under the hero slider; it now sits directly BELOW the
    About band and shares that band's gold ground, so About and publications read
    as one continuous block split only by a thin rule.

    The CMS contract is unchanged: the page passes `recentPublications`, and the
    bundled sample below is still the fallback whenever that list is empty.

    Contrast. Every colour here is measured against the gold ground the section
    now shares with About, or against the white card:

      forest #132A13 on gold  #FDC500   9.6:1   body and headings
      forest #132A13 on white          15.4:1  card titles
      primary-dark #5A7C1A on white      4.8:1  card "Read" label (small text)
      forest #132A13 on white/60        12.6:1  the "View all" button label

    The badge and the "Read" label were the two failures inherited from the dark
    band: white on #EAB308 is 1.9:1 and #EAB308 on white is 1.9:1, neither of
    which clears 4.5:1. Both now use palette tokens that do.
   ----------------------------------------------------------------------- */

export interface PreviewPublication {
  _id: string;
  title: string;
  year: number;
  type: string;
  journal?: string;
  authors?: string;
  accessStatus?: string;
}

const DEFAULT_PREVIEW_PUBS: PreviewPublication[] = [
  {
    _id: "pub-1",
    title: "Scaling Up Safer Birth Bundle Through Quality Improvement in Nepal (SUSTAIN)",
    year: 2019,
    type: "journal-article",
    journal: "Implementation Science",
    accessStatus: "open-access",
    authors: "Team co-author; Anweshan affiliation"
  },
  {
    _id: "pub-2",
    title: "National Post-Campaign Coverage Survey of the Multi-Age Cohort HPV Vaccination Campaign",
    year: 2025,
    type: "technical-report",
    journal: "WHO Nepal",
    accessStatus: "on-request",
    authors: "Research delivered by Anweshan team"
  },
  {
    _id: "pub-3",
    title: "Recording and Reporting of Antimicrobial Resistance Priority Variables",
    year: 2023,
    type: "journal-article",
    journal: "Clinical Infectious Diseases",
    accessStatus: "open-access",
    authors: "First/corresponding and co-authors from Anweshan"
  }
];

// --- Mini Components for Preview Cards ---

function PreviewTypeBadge({ type }: { type: string }) {
  const labels: Record<string, string> = {
    "journal-article": "Journal Article",
    "technical-report": "Technical Report",
  };
  /* Both grounds are pale, so the dark label clears 4.5:1 on either: forest on
     gold is 9.6:1 and forest on mint 9.8:1. */
  const colors: Record<string, string> = {
    "journal-article": "bg-gold text-forest",
    "technical-report": "bg-mint text-forest",
  };

  return (
    <span className={`inline-flex h-[22px] items-center rounded-full px-2.5 text-[10px] font-extrabold uppercase tracking-wider ${colors[type] || "bg-gold text-forest"}`}>
      {labels[type] || type}
    </span>
  );
}

function PreviewCoverGraphic() {
  return (
    <svg
      className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-overlay"
      preserveAspectRatio="none"
      viewBox="0 0 400 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M-50 150 C 50 180, 150 20, 250 80 C 350 140, 450 100, 500 50" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M-50 50 C 100 -20, 200 120, 300 80 C 400 40, 450 160, 500 180" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M50 -50 C 80 80, 250 180, 280 250" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export default function PublicationsPreview({
  recentPublications,
}: {
  recentPublications?: PreviewPublication[];
}) {
  const previewPubs = recentPublications?.length
    ? recentPublications.slice(0, 3)
    : DEFAULT_PREVIEW_PUBS;

  /* No bottom padding of its own beyond the block's: the shared gold ground is
     supplied by the wrapper in app/page.tsx, so there is nothing here to paint
     and no edge that could show a seam against About above it. */
  return (
    <div className="bg-[#064e3b] py-14 md:py-20">
      <div className="max-w-[1400px] mx-auto px-6">
        <div>
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                Research that can be read, cited and used
              </h2>
              <p className="text-white/90 text-base md:text-lg leading-relaxed">
                Explore peer-reviewed articles, technical reports, policy products and learning resources produced by or with Anweshan&apos;s research team. Each record states the team&apos;s role and links the publication to the underlying assignment where possible.
              </p>
            </div>
            <a
              href="/publications"
              className="inline-flex items-center gap-2 rounded-full border border-white bg-white px-6 py-3 text-sm font-bold text-forest transition-all hover:bg-transparent hover:text-white shrink-0"
            >
              View all publications
              <ArrowRight size={16} strokeWidth={2.5} />
            </a>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {previewPubs.map((pub, index) => {
              const gradients = [
                "from-[#fde047] via-[#d9f99d] to-[#6ee7b7]",
                "from-[#86efac] via-[#d9f99d] to-[#fde047]",
                "from-[#fef08a] via-[#fde047] to-[#a7f3d0]",
              ];
              const bgGradient = gradients[index % gradients.length];

              return (
                <a
                  key={pub._id}
                  href={`/publications`}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/40"
                >
                  <div className={`relative h-[120px] w-full overflow-hidden bg-gradient-to-br ${bgGradient}`}>
                    <PreviewCoverGraphic />
                    {pub.journal && (
                      <div className="absolute bottom-3 left-4 right-4 truncate text-[11px] font-black uppercase tracking-widest text-forest mix-blend-color-burn">
                        {pub.journal}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3">
                      <PreviewTypeBadge type={pub.type} />
                    </div>
                    <h3 className="mb-3 text-[17px] font-bold leading-snug text-forest line-clamp-3 group-hover:text-primary-dark transition-colors">
                      {pub.title}
                    </h3>
                    <div className="flex-1" />
                    <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4">
                      <span className="text-xs font-bold text-stone-500">
                        {pub.year}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-bold text-primary-dark uppercase tracking-wider group-hover:text-forest transition-colors">
                        Read <ExternalLink size={12} strokeWidth={2.5} />
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}