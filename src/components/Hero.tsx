"use client";

import Image from "next/image";
import { useCallback, useEffect, useState, useRef } from "react";
import { ArrowRight } from "lucide-react";

interface HeroSlide {
  image: string;
  label: string;
  alt?: string;
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

export default function Hero({ data }: { data?: HeroData }) {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const slides = data?.slides?.length ? data.slides : DEFAULT_SLIDES;

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
              {data?.heroEyebrow || "Research • Implementation • Evidence Communication"}
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
  );
}