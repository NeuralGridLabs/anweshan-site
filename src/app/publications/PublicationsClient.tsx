"use client";

import { useState, useMemo, useEffect } from "react";
import {
  X,
  ExternalLink,
  Download,
  Award,
  Globe,
  Users,
  LayoutGrid,
  List as ListIcon,
  Copy,
  Check,
  ChevronDown,
  Search,
  Calendar,
  AlignLeft,
  Paperclip,
  MessageSquare,
  FileText,
  MapPin,
} from "lucide-react";

import Reveal from "@/components/Reveal";
import PublicationFilters from "@/components/PublicationFilters";
import PublicationTimeline from "@/components/PublicationTimeline";
import type { PublicationFilters as PublicationFiltersType } from "@/components/PublicationFilters";
import { sanityFileUrl } from "@/lib/image";
import { publicationActions } from "@/lib/publication-delivery";
import type { Publication, PublicationType, AnweshanRole } from "@/lib/types";

// --- Custom Kanban-Style Badges ---

function TypeBadge({ type }: { type?: PublicationType }) {
  if (!type) return null;
  const labels: Record<string, string> = {
    "journal-article": "Journal Article",
    "technical-report": "Technical Report",
    "policy-brief": "Policy Brief",
    "guideline-manual": "Guideline / Manual",
    "dataset-tool": "Dataset / Tool",
    multimedia: "Multimedia",
    leadership: "Leadership",
  };
  
  const colors: Record<string, string> = {
    "journal-article": "bg-[#eab308] text-white", 
    "technical-report": "bg-[#ec4899] text-white", 
    "policy-brief": "bg-[#06b6d4] text-white", 
    "guideline-manual": "bg-[#8b5cf6] text-white", 
    "dataset-tool": "bg-[#10b981] text-white", 
    multimedia: "bg-[#f43f5e] text-white", 
    leadership: "bg-[#f97316] text-white", 
  };

  const colorClass = colors[type] || "bg-[#eab308] text-white";

  return (
    <span className={`inline-flex h-[26px] items-center rounded-full px-3 text-[11px] font-extrabold uppercase tracking-wider ${colorClass}`}>
      {labels[type] || type}
    </span>
  );
}

function AccessBadge({ status }: { status: string }) {
  if (status === "open-access") {
    return (
      <span className="inline-flex h-[26px] items-center rounded-full bg-[#38bdf8] px-3 text-[11px] font-extrabold uppercase tracking-wider text-white">
        Open Access
      </span>
    );
  }
  if (status === "downloadable") {
    return (
      <span className="inline-flex h-[26px] items-center rounded-full bg-[#818cf8] px-3 text-[11px] font-extrabold uppercase tracking-wider text-white">
        Downloadable
      </span>
    );
  }
  if (status === "on-request") {
    return (
      <span className="inline-flex h-[26px] items-center rounded-full bg-[#f472b6] px-3 text-[11px] font-extrabold uppercase tracking-wider text-white">
        On Request
      </span>
    );
  }
  return null;
}

// --- Wavy Topographical SVG ---
function CardCoverGraphic() {
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
      <path d="M180 -50 C 120 60, 180 220, 350 250" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// --- Publication Card ---

function PublicationCard({
  pub,
  index,
  viewMode,
  onClick,
}: {
  pub: Publication;
  index: number;
  viewMode: "grid" | "list";
  onClick: (pub: Publication) => void;
}) {
  const isList = viewMode === "list";
  const fileUrl = pub.fileUrl ?? sanityFileUrl(pub.file);
  const actions = publicationActions({ fileUrl, externalUrl: pub.externalUrl });
  
  const topicCount = pub.topic?.length || 0;
  const geographyCount = pub.geography?.length || 0;

  const gradients = [
    "from-[#fde047] via-[#d9f99d] to-[#6ee7b7]", 
    "from-[#86efac] via-[#d9f99d] to-[#fde047]", 
    "from-[#fef08a] via-[#fde047] to-[#a7f3d0]", 
    "from-[#a7f3d0] via-[#86efac] to-[#fef08a]", 
  ];
  const bgGradient = gradients[index % gradients.length];

  return (
    <article
      className={`group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] ring-1 ring-stone-200 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(0,0,0,0.12)] hover:ring-stone-300 ${
        isList ? "md:flex-row md:items-stretch" : ""
      }`}
      onClick={() => onClick(pub)}
    >
      <div className={`relative w-full overflow-hidden bg-gradient-to-br ${bgGradient} ${isList ? "md:w-64 shrink-0" : "h-[160px]"}`}>
        <CardCoverGraphic />
        
        {pub.journal && (
          <div className="absolute bottom-4 left-5 right-5 truncate text-xs font-black uppercase tracking-widest text-[#166534] mix-blend-color-burn">
            {pub.journal}
          </div>
        )}
      </div>

      <div className={`flex flex-1 flex-col p-5 md:p-6 ${isList ? "justify-center" : ""}`}>
        
        <div className="mb-4 flex flex-col items-start gap-2">
          <TypeBadge type={pub.type} />
          {pub.accessStatus && <AccessBadge status={pub.accessStatus} />}
        </div>

        <h3 className="mb-3 text-[20px] font-bold leading-tight text-[#064e3b] line-clamp-3">
          {pub.title}
        </h3>

        {pub.authors && (
          <p className="mb-3 text-sm font-semibold text-stone-500 line-clamp-2">
            {pub.authors}
          </p>
        )}

        <div className="flex-1" />

        <div className="mt-4 border-t border-stone-100 pt-4" />

        <div className="flex items-center justify-between">
          
          {/* Left: Metadata Indicators */}
          <div className="flex items-center gap-4 text-[#78716c]">
            {(actions.showFile || actions.showView || pub.doi || pub.externalUrl) && (
              <span className="flex items-center gap-1.5" title="Has Link or Attachment">
                <Paperclip size={15} strokeWidth={2.5} />
              </span>
            )}
            {topicCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-bold" title={`${topicCount} Topics`}>
                <MessageSquare size={15} strokeWidth={2.5} />
                {topicCount}
              </span>
            )}
            {geographyCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-bold" title={`${geographyCount} Locations`}>
                <MapPin size={15} strokeWidth={2.5} />
                {geographyCount}
              </span>
            )}
            {pub.year && (
              <span className="flex items-center gap-1.5 text-xs font-bold">
                <Calendar size={15} strokeWidth={2.5} />
                {pub.year}
              </span>
            )}
          </div>
          
          {/* Right: Institutional Avatars with detailed hover text */}
          <div className="flex -space-x-1.5 overflow-hidden">
            {pub.anweshanRole && (
              <div 
                className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#064e3b] text-white shadow-sm ring-2 ring-white"
                title={`Role: ${pub.anweshanRole.replace('-', ' ')} \nDetail: ${pub.roleExplanation || 'N/A'}`}
              >
                <Award size={16} strokeWidth={2} />
              </div>
            )}
            {pub.client && (
              <div 
                className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#eab308] text-stone-900 shadow-sm ring-2 ring-white"
                title={`Client: ${pub.client}`}
              >
                <Users size={16} strokeWidth={2} />
              </div>
            )}
            {pub.partner && (
              <div 
                className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#38bdf8] text-white shadow-sm ring-2 ring-white"
                title={`Partner: ${pub.partner}`}
              >
                <Globe size={16} strokeWidth={2} />
              </div>
            )}
          </div>

        </div>
      </div>
    </article>
  );
}

// --- Deep-Dive Modal Component ---

function PublicationModal({ pub, onClose }: { pub: Publication; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const fileUrl = pub.fileUrl ?? sanityFileUrl(pub.file);
  const actions = publicationActions({ fileUrl, externalUrl: pub.externalUrl });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  const handleCopyCitation = () => {
    if (pub.citation) {
      navigator.clipboard.writeText(pub.citation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-[#064e3b]/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative flex w-full max-w-4xl max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-stone-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50/50 px-6 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <TypeBadge type={pub.type} />
            {pub.accessStatus && <AccessBadge status={pub.accessStatus} />}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-stone-400 transition-colors hover:bg-stone-200 hover:text-stone-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto px-6 py-8 md:px-8">
          <div className="mb-4 flex flex-wrap gap-4 text-sm font-bold uppercase tracking-widest text-[#064e3b]/60">
            {pub.year && <span>{pub.year}</span>}
            {pub.journal && <span className="text-[#064e3b]">{pub.journal}</span>}
          </div>

          <h2 className="mb-6 text-2xl font-bold leading-tight text-[#064e3b] md:text-3xl lg:text-4xl">
            {pub.title}
          </h2>

          {pub.authors && (
            <p className="body-lg mb-8 font-semibold text-stone-600">{pub.authors}</p>
          )}

          {pub.abstract && (
            <div className="mb-10">
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
                <AlignLeft size={16} /> Abstract
              </h4>
              <p className="body-md leading-relaxed text-stone-700 whitespace-pre-line">
                {pub.abstract}
              </p>
            </div>
          )}

          {pub.citation && (
            <div className="mb-10">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400">
                  Citation
                </h4>
                <button
                  onClick={handleCopyCitation}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#eab308] transition-colors hover:text-[#ca8a04]"
                >
                  {copied ? <Check size={14} strokeWidth={2.5} /> : <Copy size={14} strokeWidth={2.5} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="rounded-xl bg-stone-50 p-5 ring-1 ring-inset ring-stone-200">
                <p className="body-sm text-stone-700 leading-relaxed">{pub.citation}</p>
              </div>
            </div>
          )}

          {/* Fully Detailed Metadata Grid */}
          <div className="grid gap-8 sm:grid-cols-2 border-t border-stone-100 pt-8">
            
            {/* Roles & Partners */}
            <div>
              <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-stone-400">
                Project & Institutional Details
              </h4>
              <ul className="space-y-4 text-sm text-stone-600">
                {pub.anweshanRole && (
                  <li className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 font-bold text-[#064e3b]">
                      <Award size={16} strokeWidth={2.5} />
                      <span>Anweshan's Role: {pub.anweshanRole.replace('-', ' ')}</span>
                    </div>
                    {pub.roleExplanation && (
                      <span className="pl-6 text-stone-500">{pub.roleExplanation}</span>
                    )}
                  </li>
                )}
                {pub.client && (
                  <li className="flex items-start gap-2">
                    <Users size={16} className="text-[#eab308] mt-0.5 shrink-0" strokeWidth={2.5} />
                    <span><span className="font-bold text-[#064e3b]">Client:</span> {pub.client}</span>
                  </li>
                )}
                {pub.partner && (
                  <li className="flex items-start gap-2">
                    <Globe size={16} className="text-[#38bdf8] mt-0.5 shrink-0" strokeWidth={2.5} />
                    <span><span className="font-bold text-[#064e3b]">Partner:</span> {pub.partner}</span>
                  </li>
                )}
                {pub.funder && (
                  <li className="flex items-start gap-2">
                    <Award size={16} className="text-[#f472b6] mt-0.5 shrink-0" strokeWidth={2.5} />
                    <span><span className="font-bold text-[#064e3b]">Funder:</span> {pub.funder}</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Topics and Geography */}
            <div>
              <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-stone-400">
                Classification & Region
              </h4>
              
              {pub.geography && pub.geography.length > 0 && (
                <div className="mb-6">
                  <h5 className="mb-3 text-[11px] font-bold uppercase text-stone-400">Geography</h5>
                  <div className="flex flex-wrap gap-2">
                    {pub.geography.map((g) => (
                      <span key={g} className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-stone-600 shadow-sm">
                        <MapPin size={12} strokeWidth={2.5} /> {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {pub.topic && pub.topic.length > 0 && (
                <div>
                  <h5 className="mb-3 text-[11px] font-bold uppercase text-stone-400">Topics</h5>
                  <div className="flex flex-wrap gap-2">
                    {pub.topic.map((t) => (
                      <span key={t} className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-bold text-stone-600">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-stone-100 bg-stone-50 px-6 py-5 md:px-8">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {actions.showFile && actions.fileUrl && (
              <a
                href={actions.fileUrl}
                download
                className="inline-flex w-full justify-center items-center gap-2 rounded-lg bg-[#064e3b] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#064e3b]/90 shadow-sm sm:w-auto"
              >
                <Download size={16} strokeWidth={2.5} />
                Download Document
              </a>
            )}
            {pub.doi && (
              <a
                href={pub.doi}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full justify-center items-center gap-2 rounded-lg border border-stone-300 bg-white px-6 py-3 text-sm font-bold text-stone-700 transition-all hover:bg-stone-100 shadow-sm sm:w-auto"
              >
                <ExternalLink size={16} strokeWidth={2.5} />
                Open Source
              </a>
            )}
            {!pub.doi && actions.showView && actions.viewUrl && (
              <a
                href={actions.viewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full justify-center items-center gap-2 rounded-lg border border-stone-300 bg-white px-6 py-3 text-sm font-bold text-stone-700 transition-all hover:bg-stone-100 shadow-sm sm:w-auto"
              >
                <ExternalLink size={16} strokeWidth={2.5} />
                View Online
              </a>
            )}
          </div>

          {pub.relatedProject && (
            <a
              href={`/projects/${pub.relatedProject.slug?.current}`}
              className="inline-flex w-full justify-center items-center gap-2 rounded-lg bg-stone-200/50 px-6 py-3 text-sm font-bold text-[#064e3b] transition-all hover:bg-stone-200 sm:w-auto"
            >
              <FileText size={16} strokeWidth={2.5} />
              View Related Project
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Main Library Component ---

const EMPTY_FILTERS: PublicationFiltersType = {
  query: "",
  type: "all",
  year: "all",
  topic: "all",
  client: "all",
  geography: "all",
  role: "all",
  accessStatus: "all",
};

export default function PublicationsClient({ publications }: { publications: Publication[] }) {
  const [filters, setFilters] = useState<PublicationFiltersType>(EMPTY_FILTERS);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "title">("newest");
  const [visibleCount, setVisibleCount] = useState(12);
  const [selectedPub, setSelectedPub] = useState<Publication | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(filters.query), 300);
    return () => clearTimeout(timeout);
  }, [filters.query]);

  useEffect(() => {
    setVisibleCount(12);
  }, [filters, debouncedQuery, sortOrder]);

  const filteredAndSorted = useMemo(() => {
    let result = publications.filter((pub) => {
      if (debouncedQuery) {
        const needle = debouncedQuery.toLowerCase();
        const searchable = [pub.title, pub.authors, pub.journal, pub.abstract, ...(pub.topic || [])]
          .join(" ")
          .toLowerCase();
        if (!searchable.includes(needle)) return false;
      }
      if (filters.type !== "all" && pub.type !== filters.type) return false;
      if (filters.year !== "all" && pub.year !== Number(filters.year)) return false;
      if (filters.topic !== "all" && (!pub.topic || !pub.topic.includes(filters.topic))) return false;
      if (filters.client !== "all" && pub.client !== filters.client) return false;
      if (filters.geography !== "all" && (!pub.geography || !pub.geography.includes(filters.geography))) return false;
      if (filters.role !== "all" && pub.anweshanRole !== filters.role) return false;
      if (filters.accessStatus !== "all" && pub.accessStatus !== filters.accessStatus) return false;
      return true;
    });

    return result.sort((a, b) => {
      if (sortOrder === "newest") return (b.year || 0) - (a.year || 0);
      if (sortOrder === "oldest") return (a.year || 0) - (b.year || 0);
      if (sortOrder === "title") return (a.title || "").localeCompare(b.title || "");
      return 0;
    });
  }, [publications, filters, debouncedQuery, sortOrder]);

  const visiblePublications = filteredAndSorted.slice(0, visibleCount);
  const hasMore = visibleCount < filteredAndSorted.length;

  return (
    <>
      <div className="bg-white border-b border-stone-200 shadow-sm relative z-10">
        <PublicationFilters publications={publications} filters={filters} onFiltersChange={setFilters} />
        <PublicationTimeline
          publications={publications}
          selectedYear={filters.year}
          onSelectYear={(year) => setFilters({ ...filters, year })}
        />
      </div>

      <section className="bg-[#f8fafc] min-h-screen py-12 md:py-20 relative z-0">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold text-stone-800">Research Library</h2>
              <p className="text-sm font-medium text-stone-500">
                Showing {filteredAndSorted.length} matching publication{filteredAndSorted.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="appearance-none rounded-lg border-none bg-white py-2.5 pl-4 pr-10 text-sm font-bold text-stone-700 shadow-[0_2px_4px_rgba(0,0,0,0.05)] ring-1 ring-inset ring-stone-200 focus:ring-2 focus:ring-[#064e3b] cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Alphabetical (A-Z)</option>
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
              </div>

              <div className="flex items-center rounded-lg bg-white p-1 shadow-[0_2px_4px_rgba(0,0,0,0.05)] ring-1 ring-inset ring-stone-200">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`rounded p-2 transition-colors ${
                    viewMode === "grid" ? "bg-stone-100 text-stone-800" : "text-stone-400 hover:text-stone-700"
                  }`}
                  aria-label="Grid view"
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`rounded p-2 transition-colors ${
                    viewMode === "list" ? "bg-stone-100 text-stone-800" : "text-stone-400 hover:text-stone-700"
                  }`}
                  aria-label="List view"
                >
                  <ListIcon size={18} />
                </button>
              </div>
            </div>
          </div>

          {filteredAndSorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-24 text-center ring-1 ring-stone-200 shadow-sm">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-stone-100">
                <Search size={32} className="text-stone-300" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-stone-800">No matches found</h3>
              <p className="mb-8 text-sm text-stone-500 max-w-md">
                We couldn't find any publications matching your current filters. Try adjusting your search or clearing the filters to see more results.
              </p>
              <button
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="rounded-lg bg-[#064e3b] px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-[#064e3b]/90 shadow-sm"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <>
              <div className={`grid gap-6 md:gap-8 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1 mx-auto max-w-4xl"}`}>
                {visiblePublications.map((pub, i) => (
                  <Reveal key={pub._id} delay={viewMode === "grid" ? (i % 12) * 50 : 0} className="h-full">
                    <PublicationCard pub={pub} index={i} viewMode={viewMode} onClick={setSelectedPub} />
                  </Reveal>
                ))}
              </div>

              {hasMore && (
                <div className="mt-12 flex justify-center">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 12)}
                    className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-8 py-3 text-sm font-bold text-stone-700 transition-all hover:bg-stone-50 hover:shadow-sm"
                  >
                    Load More Publications
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {selectedPub && (
        <PublicationModal pub={selectedPub} onClose={() => setSelectedPub(null)} />
      )}
    </>
  );
}