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
  /* Optional. "#id" scrolls to that id, "/path" or a full URL navigates.
     Empty falls back to the built-in default for that button. */
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

  /* The two intervals are owned by the effect below; `clearTimers` tears them
     down and is safe to call even when none exist. */
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

  /* Schedules the timers and nothing else. No state is written here, which is
     what lets the effect below start the slider without a cascading render:
     `progress` is already 0 on mount, so the reset this used to perform was a
     no-op at that point. A reset is only genuinely needed when the user jumps
     to a slide, and that happens in `goTo` — an event, not an effect. */
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

  /* Follows a CMS-authored CTA target, falling back to the built-in default when
     the field is empty so an untouched document behaves exactly as before.

     "#id" scrolls smoothly, matching the primary button's existing feel. A path
     or full URL is left to the browser: "#" is deliberately only honoured at the
     start, so "https://x.com/#y" still navigates rather than trying to find a
     DOM id. */
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

  /* Labels come from the CMS, so surrounding whitespace is trimmed at render
     rather than trimmed in the data layer. An all-whitespace label falls back to
     the default. */
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

      <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 pt-16 pb-14">

        {/* Centered copy */}
        <div className="text-center max-w-2xl mx-auto mb-14">

          <span className="inline-flex items-center gap-2 text-forest text-sm font-medium mb-6">
            <span className="w-6 h-px bg-forest/50" />
            {data?.heroEyebrow || "Field research in Nepal"}
            <span className="w-6 h-px bg-forest/50" />
          </span>

          <h1 className="text-4xl md:text-5xl font-bold text-forest leading-[1.12] mb-6">
            {data?.heroHeading || "Research that moves health policy forward"}
          </h1>

          <p className="text-forest/85 text-lg leading-relaxed mb-10">
            {data?.heroSubtext ||
              "Clinical trials, HPV vaccination studies, and nationwide household surveys that shape Nepal's health landscape."}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() =>
                followLink(data?.primaryCtaLink, () => scrollTo("projects"))
              }
              className="flex items-center gap-2 rounded-full bg-forest text-white text-sm font-semibold px-6 py-3 hover:bg-forest/90 transition-colors"
            >
              {primaryLabel}
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() =>
                followLink(data?.secondaryCtaLink, () => {
                  window.location.href = "/clients";
                })
              }
              className="flex items-center gap-2 rounded-full border border-forest/30 text-forest text-sm font-semibold px-6 py-3 hover:bg-forest hover:bg-forest/10 transition-colors"
            >
              {secondaryLabel}
            </button>
          </div>
        </div>

        {/* Image slider */}
        <div className="relative w-full h-72 md:h-[420px] rounded-3xl overflow-hidden shadow-2xl">

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

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between z-10">
            <span className="text-white text-sm font-semibold">
              {slides[current].label}
            </span>

            <div className="flex items-center gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goTo(index)}
                  aria-label={`Slide ${index + 1}`}
                  className="relative h-1 rounded-full overflow-hidden transition-all duration-500"
                  style={{ width: index === current ? 48 : 8, background: "rgba(255,255,255,0.3)" }}
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
