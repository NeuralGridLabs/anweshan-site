"use client";

import Image from "next/image";
import { useCallback, useEffect, useState, useRef } from "react";
import { ArrowRight, BookOpen, FileText, Download, ExternalLink } from "lucide-react";

interface HeroSlide {
  image: string;
  label: string;
  alt?: string;
}

interface PreviewPublication {
  _id: string;
  title: string;
  year: number;
  type: string;
  journal?: string;
  authors?: string;
  accessStatus?: string;
}

interface HeroData {
  heroEyebrow?: string;
  heroHeading?: string;
  heroSubtext?: string;
  primaryCtaLabel?: string;
  secondaryCtaLabel?: string;
  primaryCtaLink?: string;
  secondaryCtaLink?: string;
  slides?: HeroSlide[];
  recentPublications?: PreviewPublication[];
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80&w=1600",
    label: "Community Health Surveys",
  },
  {
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1600",
    label: "HPV Vaccination Research",
  },
  {
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=1600",
    label: "Household Data Collection",
  },
];

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
  const colors: Record<string, string> = {
    "journal-article": "bg-[#eab308] text-white", 
    "technical-report": "bg-[#ec4899] text-white",
  };

  return (
    <span className={`inline-flex h-[22px] items-center rounded-full px-2.5 text-[10px] font-extrabold uppercase tracking-wider ${colors[type] || "bg-[#eab308] text-white"}`}>
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

export default function Hero({ data }: { data?: HeroData }) {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const slides = data?.slides?.length ? data.slides : DEFAULT_SLIDES;
  const previewPubs = data?.recentPublications?.length ? data.recentPublications.slice(0, 3) : DEFAULT_PREVIEW_PUBS;

  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (progressRef.current) {
      clearInterval(progressRef.current);
      progressRef.current = null;
    }
  }, []);

  const startTimers = useCallback(() => {
    clearTimers();

    progressRef.current = setInterval(() => {
      setProgress((p) => Math.min(p + 100 / 70, 100));
    }, 100);

    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
      setProgress(0);
    }, 7000);
  }, [clearTimers, slides.length]);

  useEffect(() => {
    startTimers();
    return clearTimers;
  }, [startTimers, clearTimers]);

  const goTo = (index: number) => {
    setCurrent(index);
    setProgress(0);
    startTimers();
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const followLink = (link: string | undefined, fallback: () => void) => {
    const value = link?.trim();
    if (!value) {
      fallback();
      return;
    }
    if (value.startsWith("#") && value.length > 1) {
      scrollTo(value.slice(1));
      return;
    }
    window.location.href = value;
  };

  const primaryLabel = data?.primaryCtaLabel?.trim() || "See our work";
  const secondaryLabel = data?.secondaryCtaLabel?.trim() || "Our clients";

  return (
    <>
      {/* 1. Main Hero Section (Yellow) */}
      <section className="relative overflow-hidden" style={{ backgroundColor: "#EAB308" }}>
        {/* Waves pattern */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="waves" x="0" y="0" width="40" height="16" patternUnits="userSpaceOnUse">
              <path d="M0 8 Q10 2 20 8 Q30 14 40 8" fill="none" stroke="#1a3a1a" strokeWidth="0.9" opacity="0.07"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#waves)"/>
        </svg>

        <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 pt-16 pb-20">
          {/* Centered copy */}
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-flex items-center gap-2 text-[#064e3b] text-sm font-bold mb-6 tracking-wide">
              <span className="w-8 h-[2px] bg-[#064e3b]/40" />
              {data?.heroEyebrow || "Research • Implementation • Evidence Communication"}
              <span className="w-8 h-[2px] bg-[#064e3b]/40" />
            </span>

            <h1 className="text-4xl md:text-[3.25rem] font-extrabold text-[#064e3b] leading-[1.12] mb-6">
              {data?.heroHeading || "Evidence that moves from fieldwork to policy action"}
            </h1>

            <p className="text-[#064e3b]/80 text-lg md:text-xl font-medium leading-relaxed mb-10">
              {data?.heroSubtext ||
                "We help governments, development partners, research institutions and responsible businesses understand difficult problems, deliver rigorous work and turn findings into decisions, systems and communication that people can use."}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => followLink(data?.primaryCtaLink, () => scrollTo("projects"))}
                className="flex items-center gap-2 rounded-full bg-[#064e3b] text-white text-sm font-bold px-7 py-3.5 hover:bg-[#064e3b]/90 transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                {primaryLabel}
                <ArrowRight size={16} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => followLink(data?.secondaryCtaLink, () => { window.location.href = "/contact"; })}
                className="flex items-center gap-2 rounded-full border-2 border-[#064e3b]/30 text-[#064e3b] text-sm font-bold px-7 py-3.5 hover:bg-[#064e3b]/10 transition-colors"
              >
                Discuss a project
              </button>
            </div>
          </div>

          {/* Image slider */}
          <div className="relative w-full h-72 md:h-[480px] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5">
            {slides.map((slide, index) => (
              <Image
                key={slide.image}
                src={slide.image}
                alt={slide.alt || slide.label}
                fill
                sizes="(max-width: 1400px) 100vw, 1400px"
                className={`object-cover transition-opacity duration-[1500ms] ease-in-out ${
                  index === current ? "opacity-100" : "opacity-0"
                }`}
                priority={index === 0}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-[#064e3b]/80 via-[#064e3b]/20 to-transparent" />
            <div className="absolute bottom-6 left-8 right-8 flex items-end justify-between z-10">
              <span className="text-white text-lg font-bold tracking-wide shadow-black/50">
                {slides[current].label}
              </span>
              <div className="flex items-center gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goTo(index)}
                    aria-label={`Slide ${index + 1}`}
                    className="relative h-1.5 rounded-full overflow-hidden transition-all duration-500"
                    style={{ width: index === current ? 48 : 12, background: "rgba(255,255,255,0.3)" }}
                  >
                    {index === current && (
                      <span
                        className="absolute inset-y-0 left-0 bg-white rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Publications Preview Section (Dark Forest Green) */}
      <section className="bg-[#064e3b] py-20 relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#d9f99d] opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-[1400px] mx-auto px-6 md:px-10">
          
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                Research that can be read, cited and used
              </h2>
              <p className="text-[#a7f3d0] text-base md:text-lg leading-relaxed">
                Explore peer-reviewed articles, technical reports, policy products and learning resources produced by or with Anweshan’s research team. Each record states the team’s role and links the publication to the underlying assignment where possible.
              </p>
            </div>
            <a 
              href="/publications"
              className="inline-flex items-center gap-2 rounded-full border border-[#d9f99d]/30 bg-white/5 px-6 py-3 text-sm font-bold text-[#d9f99d] transition-all hover:bg-[#d9f99d] hover:text-[#064e3b] shrink-0"
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
                      <div className="absolute bottom-3 left-4 right-4 truncate text-[11px] font-black uppercase tracking-widest text-[#166534] mix-blend-color-burn">
                        {pub.journal}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3">
                      <PreviewTypeBadge type={pub.type} />
                    </div>
                    <h3 className="mb-3 text-[17px] font-bold leading-snug text-[#064e3b] line-clamp-3 group-hover:text-[#047857] transition-colors">
                      {pub.title}
                    </h3>
                    <div className="flex-1" />
                    <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4">
                      <span className="text-xs font-bold text-stone-500">
                        {pub.year}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-bold text-[#eab308] uppercase tracking-wider group-hover:text-[#ca8a04] transition-colors">
                        Read <ExternalLink size={12} strokeWidth={2.5} />
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>

        </div>
      </section>
    </>
  );
}